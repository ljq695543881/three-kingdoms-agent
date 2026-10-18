const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
const result=await page.evaluate(async()=>{
 const reset=()=>{game.mode='god';init();closeModal();game.day=2;delay=async()=>{};};
 reset();const hunter=game.players.find(p=>p.role==='hunter'),victim=game.players.find(p=>p.role==='villager');game.mode='player';game.playerId=hunter.id;
 let candidates;showHunterShootPanel=async()=>{candidates=getAlive().map(p=>p.id);completeHunterView();return null;};let discussions=0;generateSpeeches=async()=>{discussions++;};votePhase=async()=>{};
 await dayPhase([{id:hunter.id,cause:'wolf'},{id:victim.id,cause:'poison'}]);
 const simultaneous={excluded:!candidates.includes(victim.id),deaths:game.players.filter(p=>!p.alive).length,discussions};
 reset();game.mode='destiny';game.destiny=game.players.find(p=>p.role==='villager').id;game.careerPlayerId=game.destiny;showDestinyDeathPanel=async()=> 'end';discussions=0;
 await dayPhase([{id:game.destiny,cause:'wolf'}]);const ended={ended:game.ended,discussions,stats:getAchievementStats().gamesPlayed};
 reset();game.mode='player';game.playerId=0;showSpeechPanel();selectSpeechType('claim');selectClaimRole('seer');const privateDraft=!game.playerClaims[0]&&!game.claimedPlayers.has(0);removeSpeechFragment(0);const removed=!game.playerClaims[0]&&!game.claimedPlayers.has(0)&&document.getElementById('st-claim').style.display!== 'none';selectSpeechType('conservative');confirmPlayerSpeech();const noClaimAfterConfirm=!game.playerClaims[0];
 showSpeechPanel();selectSpeechType('claim');selectClaimRole('witch');confirmPlayerSpeech();const committed=game.playerClaims[0]==='witch'&&game.claimedPlayers.has(0);
 reset();game.timeOfDay='day';await markDeath(game.players[0],2,'hunter');const daytime=deathInfoText(game.players[0]);
 game.mode='player';game.playerId=1;game.players[1].attr={武力:5,智谋:3,统帅:3,政治:3,魅力:3,意志:3};showGrowthPanel(2,'good');const before=Object.values(_growthAttrs).reduce((a,b)=>a+b,0)+_growthRemaining;for(let i=0;i<20;i++){changeGrowthAttr('武力',-1);changeGrowthAttr('智谋',1);}const growthConserved=Object.values(_growthAttrs).reduce((a,b)=>a+b,0)+_growthRemaining===before;
 game.players[2].alive=false;game.players[3].alive=false;game.seerChecks=[{targetId:2}];showInfoActions('seer');const beforeOptions=document.getElementById('infoActions').textContent;game.seerChecks=[{targetId:3}];showInfoActions('seer');const privateInfo=beforeOptions===document.getElementById('infoActions').textContent;
 return {privateInfo,simultaneous,ended,privateDraft,removed,noClaimAfterConfirm,committed,daytime,growthConserved};
});console.log(JSON.stringify(result));assert(result.simultaneous.excluded,'Hunter must not target another victim from the same night');assert.equal(result.simultaneous.deaths,2);assert.equal(result.ended.discussions,0,'Explicit destiny end must stop the round');assert(result.ended.ended);assert(result.privateDraft&&result.removed&&result.noClaimAfterConfirm&&result.committed,'Claims become public only after speech confirmation');assert(result.daytime.includes('第2天'));assert(result.growthConserved);assert(result.privateInfo);assert.deepEqual(errors,[]);
console.log('Simultaneous deaths, destiny early exit, draft/confirmed claims, daytime hunter record and growth conservation passed');
await page.reload();
const ties=await page.evaluate(async()=>{
 const results=[];
 for(const outcome of ['tie','exile','destinyEnd']){
  game.mode='player';init({name:'平票测试',faction:'群',attr:{}});closeModal();game.playerId=1;game.day=1;setNight(false);delay=async()=>{};
  game.players.forEach((p,i)=>{p.alive=i<4;p.role=i===3?'wolf':'villager';});Math.random=()=>0;
  getFavor=(p,id)=>{const revote=game.voteRecords.some(r=>r.type==='tie');const desired=revote&&outcome!=='tie'?(p.id===0?1:0):(p.id%2===0?1:0);return id===desired?-1000:1000;};
  showSpeechPanel=async()=>{if(game.currentSpeakerId!==game.playerId)throw new Error('Wrong defense speaker context');return {text:'请重新判断。',fragments:[{type:'conservative'}]};};
  const originalVote=showVotePanel;let playerRevoteCandidates=[];showVotePanel=(ids)=>{const pending=originalVote(ids);if(ids)playerRevoteCandidates=[...document.querySelectorAll('#voteOptions [data-id]')].map(e=>Number(e.dataset.id));selectVoteTarget(0);confirmPlayerVote();return pending;};
  let nextNight=false;nightPhase=()=>{nextNight=true;};
  if(outcome==='destinyEnd'){game.mode='destiny';game.destiny=0;game.careerPlayerId=0;showDestinyDeathPanel=async()=> 'end';}
  await votePhase();showVotePanel=originalVote;
  results.push({outcome,tie:game.voteRecords.some(r=>r.type==='tie'),peace:game.voteRecords.some(r=>r.type==='peaceful_vote'),result:game.voteRecords.find(r=>r.type==='result'),nextNight,ended:!!game.ended,playerRevoteCandidates,speeches:game.speeches.filter(s=>s.tieBreak).length});
 }
 return results;
});
for(const r of ties){assert(r.tie);assert.equal(r.speeches,2);if(r.outcome==='tie'){assert(r.peace&&r.nextNight);assert.deepEqual(r.playerRevoteCandidates,[0]);}else{assert.equal(r.result.targetId,0);assert.equal(r.result.tieBreak,true);assert.equal(r.nextNight,r.outcome==='exile');if(r.outcome==='destinyEnd')assert(r.ended);}}
assert.deepEqual(errors,[]);console.log('Forced tie, player defense, restricted revote, repeated tie, revote exile and destiny exit during exile passed');

}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
