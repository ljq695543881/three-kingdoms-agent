# three_kingdoms — 学习汇总

快速概览：本仓库实现了一个“基于三国人物的狼人杀”单页前端游戏，主要内容分布如下：

- `werewolf.html`：主页面（单文件应用），包含全部 HTML/CSS/JS，负责游戏流程、AI 发言、投票与 UI。浏览器直接打开即可运行。
- `characters_data.js`：219 位角色的完整数据（含六维属性 `attrs` 与 `personality`）。游戏从此加载角色池。
- `characters.json`：与 `characters_data.js` 内容类似的 JSON 备份，便于工具处理或导入。
- `avatars/`：头像资源，按阵营分为 `wei/`、`shu/`、`wu/`、`qun/` 子目录；头像按角色名 PNG 存放。
- `魏/`、`蜀/`、`吴/`、`群雄/`：每位角色的 Markdown 人物档案（包含生平、性格、引文等），用于生成头像或人工查看。
- `batch_avatars.py`：头像批量生成脚本，调用外部 `buddy-cloud.py` 生成并下载 PNG，支持跳过已存在文件及重试机制。
- `README.md`：项目说明与运行方法。
- `/.workbuddy/skills/三国狼人杀规则.md`：设计文档，详细说明了游戏规则、好感度系统与 AI 发言逻辑（重要参考）。

关键发现（高优先级）

- XSS 风险：日志与部分 UI 使用 `innerHTML` 直接插入发言/玩家名，存在注入风险（需统一转义或使用 `textContent`）。
- 未捕获 Promise/异常：若网络或脚本某步失败，当前逻辑可能抛出未处理异常导致游戏流程中断。
- 可测试的核心纯函数：`classifySpeech()`、`calcFavorChange()`、`checkWin()` 等，适合写单元测试。
- 资源完整性：头像由 `avatars/` 提供，缺图会回退到姓名首字显示，`batch_avatars.py` 可生成缺失图片（需配置环境变量）。

下一步建议

1. 立即修复 XSS：替换危险赋值、添加 `escapeHtml()` 辅助函数，优先修补 `addLog()` 与玩家输入处。
2. 为主要 async 函数添加 try/catch，避免静默失败。
3. 为核心算法提取模块并编写单元测试（`vitest` 或 `jest`）。
4. 小步重构：将 `SPEECH_TEMPLATES`、角色数据与游戏逻辑分离。

文件位置

- 主页面：`werewolf.html`  
- 角色库：`characters_data.js` / `characters.json`  
- 头像脚本：`batch_avatars.py`  
- 人物档案：`魏/`、`蜀/`、`吴/`、`群雄/`

保存人：GitHub Copilot（会话记录）

---
生成时间：2026-05-18
