// ===== 发言历史功能 =====
function toggleSpeechHistory(){
  const panel = document.getElementById('speechHistoryPanel');
  if(panel.classList.contains('show')){
    panel.classList.remove('show');
    panel.classList.add('hide');
  } else {
    panel.classList.add('show');
    panel.classList.remove('hide');
    renderSpeechHistory();
  }
}

function renderSpeechHistory(){
  const content = document.getElementById('speechHistoryContent');
  if(!game || !game.speeches || game.speeches.length === 0){
    content.innerHTML = '<div class="sh-empty">暂无发言记录</div>';
    return;
  }
  
  // 按天数分组发言
  const grouped = {};
  for(const s of game.speeches){
    if(!s || !s.day) continue;
    if(!grouped[s.day]) grouped[s.day] = [];
    grouped[s.day].push(s);
  }
  
  const days = Object.keys(grouped).sort((a,b) => b - a); // 最新的天数在前
  
  if(days.length === 0){
    content.innerHTML = '<div class="sh-empty">暂无发言记录</div>';
    return;
  }
  
  let html = '';
  for(const day of days){
    const speeches = grouped[day];
    html += '<div class="sh-day-group"><div class="sh-day-label">第' + day + '天</div>';
    
    for(const s of speeches){
      const speaker = game.players[s.speakerId];
      if(!speaker) continue;
      
      const roleColor = getRoleColor(speaker.role);
      const typeClass = 'sh-type-' + (s.speechType || 'conservative');
      const typeLabel = speechTypeLabel(s.classified || []);
      
      html += '<div class="sh-item"><div class="sh-speaker"><span class="sh-speaker-name" style="color:' + roleColor + '">' + speaker.name + '</span>' + (isGodView() ? '<span class="sh-speaker-role">（' + speaker.faction + '·' + ROLE_CFG[speaker.role].name + '）</span>' : '') + '</div>' + (typeLabel ? '<div class="sh-type-tag ' + typeClass + '">' + typeLabel + '</div>' : '') + '<div class="sh-text">' + (s.text || '') + '</div></div>';
    }
    
    html += '</div>';
  }
  
  content.innerHTML = html;
}

function getRoleColor(role){
  const colors = {
    'wolf': '#e74c3c',
    'seer': '#3498db',
    'witch': '#9b59b6',
    'hunter': '#e67e22',
    'guard': '#2ecc71',
    'villager': '#ecf0f1'
  };
  return colors[role] || '#ecf0f1';
}
