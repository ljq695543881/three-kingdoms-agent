const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
for(const size of ['quick','classic'])for(const strategy of ['cautious','active'])for(const [index,role] of ['wolf','seer','witch','hunter','guard','villager','destiny0','destiny8'].entries()){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
 await page.evaluate(({role,index,size,strategy})=>{
  const timer=window.setTimeout;window.setTimeout=(fn,ms,...args)=>timer(fn,ms===1200?0:ms,...args);let seed=100+index+(size==='classic'?100:0)+(strategy==='active'?1000:0);document.getElementById('matchSize').value=size;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const wrap=(name,act)=>{const original=window[name];window[name]=(...args)=>{const pending=original(...args);act(...args);return pending;};};
  wrap('showSpeechPanel',()=>{if(strategy==='active'){selectSpeechType('claim');if(!game.playerClaims[game.playerId])selectClaimRole(game.players[game.playerId].role==='wolf'?'seer':game.players[game.playerId].role);selectSpeechType('attack');document.getElementById('speechTargetSel').value=String(getAlive().find(p=>p.id!==game.playerId).id);onSpeechTargetChange();}else selectSpeechType('conservative');confirmPlayerSpeech();});
  wrap('showNightPanel',(kind,data)=>{if(kind==='witch'){if(strategy==='active'&&data.canSave)selectNightTarget('save');else if(strategy==='active'&&data.poisonTargets.length)selectNightTarget('poison',data.poisonTargets[0].id);else selectNightTarget('skip');}else selectNightTarget(data.targets[strategy==='active'?data.targets.length-1:0].id);confirmNightAction();});
  wrap('showVotePanel',()=>{const el=document.querySelector('#voteOptions .vote-player-card');selectVoteTarget(Number(el.dataset.id));confirmPlayerVote();});
  wrap('showHunterShootPanel',()=>{if(strategy==='active'){const el=document.querySelector('[data-hunter-target]');selectHunterTarget(el,el.dataset.hunterTarget);confirmHunterShoot();}else{requestGameConfirm=(_a,_b,yes)=>yes();skipHunterShoot();}});
  wrap('showDestinyPanel',()=>{selectDestinyAction(strategy==='active'?'help':'wait');if(strategy==='active')selectDestinyTarget(game.destiny);confirmDestinyAction();});
  wrap('showDestinyDeathPanel',()=>selectDestinyDeathOption('god'));
  if(role.startsWith('destiny')){game.mode='destiny';init();showDestinySelect();selectDestinyPlayer(Number(role.slice(7)));confirmDestinySelect();}
  else{game.mode='player';init({name:'流程测试',faction:'群',attr:{}});const me=game.players[game.playerId],other=game.players.find(p=>p.role===role);[me.role,other.role]=[other.role,me.role];}
  closeModal();delay=async()=>{};startGame();
 },{role,index,size,strategy});
 await page.waitForFunction(()=>game.ended,{},{timeout:30000});
 const result=await page.evaluate(()=>({days:game.day,stats:getAchievementStats(),body:document.getElementById('logArea').textContent,pending:!!game.pendingSpeechResolve||!!game.pendingNightResolve||!!game.pendingVoteResolve||!!game.pendingDestinyResolve,hunter:!!game.hunterDecisionPending}));
 assert(!result.body.includes('[系统错误]'));assert.equal(result.stats.gamesPlayed,1);assert.equal(result.pending,false);assert.equal(result.hunter,false);assert.deepEqual(errors,[]);console.log(`${size}/${strategy}/${role}: complete player UI flow, ${result.days} days, one career settlement, no pending decisions passed`);await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
