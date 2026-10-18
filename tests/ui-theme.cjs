const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1440,height:900}]){
 const page=await browser.newPage({viewport,reducedMotion:'reduce'});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
 const cases=[['board',null],['mode','.pms-card'],['character','.char-card'],['speech','.speech-card'],['guard','.night-card'],['wolf','.night-card'],['seer','.night-card'],['witch','.night-card'],['vote','.vote-card'],['hunter','#hunterShootPanel .settings-card'],['destinySelect','.destiny-card'],['destiny','.destiny-panel-card'],['destinyDeath','#destinyDeathPanel .destiny-panel-card'],['growth','.growth-card'],['settings','.settings-card'],['confirm','.confirm-card'],['history','#speechHistoryPanel'],['favor','#favorPanel'],['detail','.tag-modal'],['achievements','.achievement-card'],['end','#modalArea .modal']];
 for(const [scene,selector]of cases){await page.evaluate(scene=>{
  game.mode='player';hideTitle();init({name:'月下旅人',faction:'蜀',attr:{智谋:4}});closeModal();closeAchievement();game.day=2;renderInfoBar();setPhase('第2天','var(--gold)');game.speeches=[{speakerId:0,day:1,speechType:'claim',classified:[{type:'claim',role:'seer'}],text:'昨夜已验明一人，诸位先听完发言，再作判断。'}];
  addLog('<span class="system-text">第二天 · 天亮了</span>');addLog('昨夜平安，群雄开始讨论。');addLog(speakerHTML(game.players[0])+'我认为应当听完每个人的发言。');addLog(speakerHTML(game.players[1])+'不可轻信，也不必急于出手。');
  const me=game.players[game.playerId],targets=getAlive().filter(p=>p.id!==me.id);
  if(scene==='mode')startPlayerMode();if(scene==='character'){startPlayerMode();startNewGame();}
  if(scene==='speech'){showSpeechPanel();selectSpeechType('claim');selectClaimRole('seer');}
  if(['guard','wolf','seer'].includes(scene)){showNightPanel(scene,{targets,info:'选择今晚的行动目标，确认前可查看发言历史。'});selectNightTarget(targets[0].id);}
  if(scene==='witch'){me.role='witch';game.wolfTarget=targets[0].id;showNightPanel('witch',{...getWitchActionState(me),info:'本夜可使用一种药，也可按兵不动。'});selectNightTarget('save');}
  if(scene==='vote'){showVotePanel();selectVoteTarget(targets[0].id);}
  if(scene==='hunter'){me.role='hunter';showHunterShootPanel(me,'vote');const el=document.querySelector('[data-hunter-target]');selectHunterTarget(el,el.dataset.hunterTarget);}
  if(scene==='destinySelect'){game.mode='destiny';init();closeModal();showDestinySelect();selectDestinyPlayer(0);}
  if(scene==='destiny'){game.mode='destiny';game.destiny=0;showDestinyPanel();selectDestinyAction('help');selectDestinyTarget(0);}
  if(scene==='destinyDeath')showDestinyDeathPanel();
  if(scene==='growth')showGrowthPanel(3,'good');if(scene==='settings')openSettings();if(scene==='confirm')requestGameConfirm('重新开始本局？','当前这局的发言和投票将清除。',()=>{});
  if(scene==='history')toggleSpeechHistory();if(scene==='favor'){game.mode='god';openFavorPanel();}
  if(scene==='detail')showTagPanel(0);if(scene==='achievements')openAchievement();if(scene==='end')endGame('good');
 },scene);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`${scene}: horizontal overflow`);
 assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).getPropertyValue('--bg').trim()),'#101718');
 if(selector){const box=await page.locator(selector).first().boundingBox();assert(box&&box.x>=-1&&box.y>=-1&&box.x+box.width<=viewport.width+1&&box.y+box.height<=viewport.height+1,`${scene}: panel outside viewport ${JSON.stringify(box)}`);}
 if(process.env.PREVIEW_DIR&&((viewport.width===390&&['speech','witch','character','history','achievements','end'].includes(scene))||(viewport.width===1440&&scene==='board')))await page.screenshot({path:process.env.PREVIEW_DIR+`/ink-${scene}-${viewport.width}.png`});
 }
 assert.deepEqual(errors,[]);console.log(`${viewport.width}: ${cases.length} themed surfaces, viewport bounds and no runtime errors passed`);await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
