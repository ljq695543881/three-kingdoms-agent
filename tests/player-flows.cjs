const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
for(const [index,role] of ['wolf','seer','witch','hunter','guard','villager','destiny0','destiny8'].entries()){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
 await page.evaluate(({role,index})=>{
  let seed=100+index;Math.random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296};
  const wrap=(name,act)=>{const original=window[name];window[name]=(...args)=>{const pending=original(...args);act(...args);return pending;};};
  wrap('showSpeechPanel',()=>{selectSpeechType('conservative');confirmPlayerSpeech();});
  wrap('showNightPanel',(kind,data)=>{if(kind==='witch')selectNightTarget('skip');else selectNightTarget(data.targets[0].id);confirmNightAction();});
  wrap('showVotePanel',()=>{const el=document.querySelector('#voteOptions .vote-player-card');selectVoteTarget(Number(el.dataset.id));confirmPlayerVote();});
  wrap('showHunterShootPanel',()=>{const el=document.querySelector('[data-hunter-target]');selectHunterTarget(el,el.dataset.hunterTarget);confirmHunterShoot();});
  wrap('showDestinyPanel',()=>{selectDestinyAction('wait');confirmDestinyAction();});
  wrap('showDestinyDeathPanel',()=>selectDestinyDeathOption('god'));
  if(role.startsWith('destiny')){game.mode='destiny';init();showDestinySelect();selectDestinyPlayer(Number(role.slice(7)));confirmDestinySelect();}
  else{game.mode='player';init({name:'流程测试',faction:'群',attr:{}});const me=game.players[game.playerId],other=game.players.find(p=>p.role===role);[me.role,other.role]=[other.role,me.role];}
  closeModal();delay=async()=>{};startGame();
 },{role,index});
 await page.waitForFunction(()=>game.ended,{},{timeout:30000});
 const result=await page.evaluate(()=>({days:game.day,stats:getAchievementStats(),body:document.getElementById('logArea').textContent,pending:!!game.pendingSpeechResolve||!!game.pendingNightResolve||!!game.pendingVoteResolve||!!game.pendingDestinyResolve,hunter:!!game.hunterDecisionPending}));
 assert(!result.body.includes('[系统错误]'));assert.equal(result.stats.gamesPlayed,1);assert.equal(result.pending,false);assert.equal(result.hunter,false);assert.deepEqual(errors,[]);console.log(`${role}: complete player UI flow, ${result.days} days, one career settlement, no pending decisions passed`);await page.close();
}
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
