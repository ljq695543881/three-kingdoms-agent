#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
三国人物头像批量生成脚本 v2
直接调用 buddy-cloud.py 子进程，避免 API 签名兼容性问题

用法：
  export BUDDY_CLOUD_TOKEN="<your_token>"
  python3 batch_avatars.py
"""

import os
import sys
import json
import time
import subprocess
import re

# ===================== Config =====================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
FACTIONS = ["魏", "蜀", "吴", "群雄"]
BUDDY_CLOUD = os.path.expanduser("~/Applications/WorkBuddy.app/Contents/Resources/app.asar.unpacked/resources/builtin-skills/buddy-multimodal-generation/scripts/buddy-cloud.py")
SKIP_EXISTING = True
MAX_RETRIES = 2
DELAY_BETWEEN = 3  # 每张图生成完后等 3 秒，避免频率限制

STYLE_PREFIX = (
    "三国人物Q版头像，透明背景PNG，中国水墨画风格，"
    "圆形构图，高清细节，正面半身像。"
)

FACTION_STYLE = {
    "魏": "曹魏阵营，色调偏冷蓝沉稳，",
    "蜀": "蜀汉阵营，色调偏绿忠义正气，",
    "吴": "东吴阵营，色调偏紫英武俊朗，",
    "群雄": "群雄阵营，色调偏金豪迈不羁，",
}


# ===================== Character extraction =====================

def extract_character(md_path):
    with open(md_path, 'r', encoding='utf-8') as f:
        content = f.read()

    name = ""
    for line in content.split('\n'):
        line = line.strip()
        if line.startswith('# '):
            name = line[2:].strip()
            break
    if not name:
        name = os.path.splitext(os.path.basename(md_path))[0]

    personalities = []
    in_personality = False
    for line in content.split('\n'):
        if '性格特征' in line:
            in_personality = True
            continue
        if in_personality and line.startswith('## '):
            break
        if in_personality and line.strip().startswith('- **'):
            m = re.match(r'-\s*\*\*(.+?)\*\*', line.strip())
            if m:
                personalities.append(m.group(1))

    return name, personalities


def build_prompt(name, faction, personalities):
    faction_desc = FACTION_STYLE.get(faction, "")
    if personalities:
        trait_str = "、".join(personalities[:3])
        char_desc = f"{name}，{trait_str}"
    else:
        char_desc = name
    return f"{STYLE_PREFIX}{faction_desc}{char_desc}。"


# ===================== Generation =====================

def generate_one(prompt, token):
    """Call buddy-cloud.py to generate one image, return result URL."""
    proc = subprocess.run(
        [sys.executable, BUDDY_CLOUD, "image", prompt, "--resolution", "512:512", "--token-stdin"],
        input=token, capture_output=True, text=True, timeout=300
    )
    # Parse JSON from stdout
    stdout = proc.stdout.strip()
    if not stdout:
        raise Exception(f"Empty output, stderr: {proc.stderr[:200]}")
    try:
        result = json.loads(stdout)
    except json.JSONDecodeError:
        raise Exception(f"Invalid JSON: {stdout[:200]}")
    if "error" in result:
        raise Exception(result.get("message", result["error"]))
    urls = result.get("result_url", [])
    if not urls:
        raise Exception(f"No result_url: {result}")
    return urls[0] if isinstance(urls, list) else urls


def download_image(url, filepath):
    subprocess.run(["curl", "-sS", "-L", "-o", filepath, url], check=True, timeout=60)


# ===================== Main =====================

def main():
    token = os.environ.get("BUDDY_CLOUD_TOKEN", "")
    if not token:
        sys.stderr.write("Error: set BUDDY_CLOUD_TOKEN env var\n")
        sys.exit(1)

    # Scan characters
    characters = []
    for faction in FACTIONS:
        folder = os.path.join(BASE_DIR, faction)
        avatar_folder = os.path.join(BASE_DIR, faction, "头像")
        os.makedirs(avatar_folder, exist_ok=True)
        if not os.path.exists(folder):
            continue
        mds = sorted([f for f in os.listdir(folder) if f.endswith('.md')])
        for md in mds:
            md_path = os.path.join(folder, md)
            name, personalities = extract_character(md_path)
            png_path = os.path.join(avatar_folder, f"{name}.png")
            characters.append({
                "name": name, "faction": faction,
                "personalities": personalities,
                "png_path": png_path,
            })

    existing = sum(1 for c in characters if os.path.exists(c["png_path"]))
    todo = [c for c in characters if not (SKIP_EXISTING and os.path.exists(c["png_path"]))]
    sys.stderr.write(f"Total: {len(characters)}, Existing: {existing}, Todo: {len(todo)}\n")
    sys.stderr.flush()

    if not todo:
        sys.stderr.write("All done!\n")
        return

    success = 0
    failed = []
    start = time.time()

    for i, char in enumerate(todo):
        name = char["name"]
        faction = char["faction"]
        png_path = char["png_path"]

        msg = f"[{i+1}/{len(todo)}] {name}({faction})... "
        sys.stderr.write(msg)
        sys.stderr.flush()

        prompt = build_prompt(name, faction, char["personalities"])

        for attempt in range(MAX_RETRIES):
            try:
                url = generate_one(prompt, token)
                download_image(url, png_path)
                fsize = os.path.getsize(png_path)
                sys.stderr.write(f"OK ({fsize/1024:.0f}KB)\n")
                sys.stderr.flush()
                success += 1
                break
            except Exception as e:
                if attempt < MAX_RETRIES - 1:
                    sys.stderr.write(f"retry({attempt+1})... ")
                    sys.stderr.flush()
                    time.sleep(5)
                else:
                    sys.stderr.write(f"FAIL: {str(e)[:80]}\n")
                    sys.stderr.flush()
                    failed.append(name)

        # Delay between generations
        if i < len(todo) - 1:
            time.sleep(DELAY_BETWEEN)

    elapsed = time.time() - start
    sys.stderr.write(f"\n===== DONE =====\n")
    sys.stderr.write(f"Success: {success}, Failed: {len(failed)}, Time: {elapsed:.0f}s\n")
    if failed:
        sys.stderr.write(f"Failed names: {', '.join(failed)}\n")
    sys.stderr.flush()


if __name__ == "__main__":
    main()
