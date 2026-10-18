const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,executablePath:process.env.CHROME_EXECUTABLE});try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
const boundaries=await page.evaluate(()=>{
 const results=[];
 for(const role of ['wolf','seer','witch','guard','hunter','villager'])for(const claimed of [false,true]){
  game.mode='god';init();closeModal();game.day=3;game.players.forEach(p=>{p.alive=true;p.role='villager';});const player=game.players[0];player.role=role;
  game.playerClaims={};game.claimedPlayers=new Set();if(claimed){game.playerClaims[0]=role==='wolf'?'seer':role;game.claimedPlayers.add(0);}
  game.voteRecords=[{day:3,voterId:0,targetId:1},{day:3,voterId:1,targetId:0},{day:3,voterId:2,targetId:0},{day:3,type:'tie',tiedIds:[0,1],votes:2}];
  game.seerChecks=[{targetId:1,isWolf:false}];
  const fragments=buildDefenseFragments(player,[0,1]);const classified=fragmentsToClassified(fragments);const text=generatePlayerSpeechText(fragments,player);
  results.push(fragments.length<=3&&fragments[0].type==='defense'&&!fragments.some(f=>f.type==='conservative')&&text.includes('首轮有2票')&&text.includes(game.players[1].name)&&text.includes('我首轮投的是')&&getSpeechSummary(classified,'defense').includes('申辩自保')&&(!claimed||!fragments.some(f=>f.type==='claim'))&&(role!=='seer'||!fragments.some(f=>f.type==='attack'&&f.targetId===1)));
 }
 game.players[0].role='seer';game.playerClaims[0]='seer';game.seerChecks=[{targetId:1,isWolf:false},{targetId:2,isWolf:true}];
 const threeWay=buildDefenseFragments(game.players[0],[0,1,2]);results.push(threeWay.some(f=>f.type==='info'&&f.infoTargetId===2&&f.infoResult==='wolf')&&!threeWay.some(f=>f.type==='attack'&&f.targetId===1));
 // 闭眼角色申辩不可因真实角色或他人私有查验改变。
 game.players[0].role='villager';game.playerClaims[0]='villager';const before=buildDefenseFragments(game.players[0],[0,1]);game.seerChecks=[{targetId:1,isWolf:true}];game.players[1].role='wolf';const privateBoundary=JSON.stringify(before)===JSON.stringify(buildDefenseFragments(game.players[0],[0,1]));
 game.players[2].alive=false;game.players[2].deathDay=3;game.players[2].deathCause='poison';game.players[2].deathPeriod='night';game.players[2].name='<img src=x onerror=alert(1)>';
 game.players[3].alive=false;game.players[3].deathDay=3;game.players[3].deathCause='hunter';game.players[3].deathPeriod='day';game.speeches=[];game.voteRecords=[];renderSpeechHistory();
 const godText=document.getElementById('speechHistoryContent').textContent;const deaths=godText.includes('第3天')&&godText.includes('被毒死')&&godText.includes('被猎人带走');const escaped=!document.querySelector('#speechHistoryContent img');game.mode='player';renderSpeechHistory();const playerPrivate=!document.getElementById('speechHistoryContent').textContent.includes('被毒死');
 return {cases:results.length,passed:results.every(Boolean),privateBoundary,deaths,escaped,playerPrivate};
});console.log(boundaries);for(const k of ['passed','privateBoundary','deaths','escaped','playerPrivate'])assert(boundaries[k],k);
await page.reload();const integrated=await page.evaluate(async()=>{
 game.mode='god';init();closeModal();game.day=3;delay=async()=>{};nightPhase=()=>{};Math.random=()=>0;
 game.players.forEach((p,i)=>{p.alive=i<4;p.role=i===3?'wolf':'villager';});game.playerClaims={};game.claimedPlayers=new Set();
 getFavor=(p,id)=>id===(p.id%2===0?1:0)?-1000:1000;
 await votePhase();const defenses=game.speeches.filter(s=>s.tieBreak);const records=game.voteRecords.filter(v=>v.tieBreak&&!v.type);
 return {count:defenses.length,defenses:defenses.every(s=>s.classified[0].type==='defense'&&s.text.includes('首轮有2票')&&game.claimedPlayers.has(s.speakerId)&&game.playerClaims[s.speakerId]==='villager'),reasons:records.every(v=>v.reason.includes('申辩')),repeatTie:game.voteRecords.some(v=>v.type==='peaceful_vote')};
});console.log(integrated);assert.equal(integrated.count,2);assert(integrated.defenses&&integrated.reasons&&integrated.repeatTie);assert.deepEqual(errors,[]);console.log('Role defense, public evidence, first vote memory, confirmed claims and god-only death history passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
