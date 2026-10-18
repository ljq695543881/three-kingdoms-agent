const{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const b=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{const p=await b.newPage();const errors=[];p.on('pageerror',e=>errors.push(e.message));await p.goto('file://'+process.cwd()+'/werewolf.html');const result=await p.evaluate(()=>{
 game.mode='god';init();closeModal();game.day=2;Math.random=()=>.1;game.players.forEach(p=>{p.role='villager';p.alive=true;});const seer=game.players[0];seer.role='seer';game.claimedPlayers.add(0);game.playerClaims[0]='seer';game.seerChecks=[{targetId:1,isWolf:false,day:2}];let f=buildSeerFragments(seer,getAlive().filter(p=>p.id!==0),[],new Set());const seerGood=!f.some(x=>x.type==='attack'&&x.targetId===1);
 game.seerChecks.push({targetId:2,isWolf:true,day:1});game.players[2].alive=false;f=buildSeerFragments(seer,getAlive().filter(p=>p.id!==0),[],new Set());const deadWolf=!f.some(x=>x.type==='attack'&&x.targetId===2);
 const villager=game.players[3];game.claimedPlayers.add(3);game.playerClaims[3]='villager';f=buildVillagerFragments(villager,getAlive().filter(p=>p.id!==3),[],new Set());const repeatClaim=!f.some(x=>x.type==='claim');villager.attr={智谋:2};game.day=1;const goodContext=[{speakerId:4,speakerName:game.players[4].name,text:game.players[1].name+'是好人。',speechType:'claim',classified:[{type:'claim',role:'seer'},{type:'info',role:'seer',infoResult:'good',targets:[game.players[1]]}]}];f=buildVillagerFragments(villager,getAlive().filter(p=>p.id!==3),goodContext,new Set());const followGood=f.some(x=>x.type==='shield'&&x.targetId===1)&&!f.some(x=>x.type==='attack'&&x.targetId===1);
 game.players[4].role='wolf';game.wolfFakeChecks[4]=[1];game.speeches=goodContext;const helpers=typeof getPersonalVoteBias==='function';const reportGood=helpers&&getPersonalVoteBias(game.players[4],1)<0;const safeCandidates=helpers?getAIVoteCandidates(seer,getAlive().filter(p=>p.id!==0)).map(p=>p.id):[];const privateBoundary=helpers&&getAIVoteCandidates(villager,[game.players[1],game.players[4]]).length===2;
 game.claimedPlayers.delete(0);game.playerClaims[5]='seer';game.seerChecks=[{targetId:1,isWolf:false,day:1},{targetId:4,isWolf:true,day:2}];game.seerReportedChecks=[];const old=detectSeerContradiction;detectSeerContradiction=()=>({wolfId:5,goodId:1});f=buildSeerFragments(seer,getAlive().filter(p=>p.id!==0),[],new Set());detectSeerContradiction=old;const budget=f.length<=3&&f.some(x=>x.type==='attack'&&x.targetId===4);
 return {seerGood,deadWolf,repeatClaim,followGood,reportGood,privateBoundary,budget,safeCandidates};
});console.log(result);for(const key of ['seerGood','deadWolf','repeatClaim','followGood','reportGood','privateBoundary','budget'])assert(result[key],key);assert(!result.safeCandidates.includes(1));assert.deepEqual(errors,[]);
await p.reload();
const votes=await p.evaluate(async()=>{
 const results=[];delay=async()=>{};nightPhase=()=>{};
 for(let seed=1;seed<=24;seed++){
  let rng=seed;Math.random=()=>{rng=(Math.imul(rng,1664525)+1013904223)>>>0;return rng/4294967296;};
  game.mode='god';init();closeModal();game.day=2;game.players.forEach((p,i)=>{p.alive=i<5;p.role=i===0?'seer':i===2?'wolf':'villager';});
  game.seerChecks=[{targetId:1,isWolf:false},{targetId:2,isWolf:true}];
  getFavor=(p,id)=>id===1?-1000:1000;
  await votePhase();const vote=game.voteRecords.find(r=>r.voterId===0&&!r.tieBreak);
  results.push(!!vote&&vote.targetId===2&&!vote.reason.includes('私有')&&!vote.reason.includes('查杀'));
 }
 // 强制首轮平票。重投候选人均为预言家自己的金水，必须弃权。
 game.mode='god';init();closeModal();game.day=2;Math.random=()=>0;
 game.players.forEach((p,i)=>{p.alive=i<5;p.role=i===4?'seer':'villager';});
 game.seerChecks=[0,1,2,3].map(targetId=>({targetId,isWolf:false}));
 getFavor=(p,id)=>id===(p.id%2===0?1:0)?-1000:1000;
 await votePhase();const tied=game.voteRecords.some(r=>r.type==='tie');
 const noKnownGoodVotes=!game.voteRecords.some(r=>r.voterId===4);
 const player=game.players[0];player.name='<img src=x onerror=alert(1)>';
 const html=renderVoteSection([{voterId:0,targetId:1,reason:'<img src=x onerror=alert(1)>'}],'投票');
 const holder=document.createElement('div');holder.innerHTML=html;
 // 反复生成悍跳发言，检查同一次发言中的金水不会又遭攻击。
 let fakeSpeechConsistent=true;
 for(let seed=1;seed<=100;seed++){
  let state=seed;Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296;};
  game.wolfFakeChecks={};game.players.forEach(p=>{p.alive=true;p.role=p.id===0?'wolf':'villager';});
  if(seed%2)game.claimedPlayers.add(0);else game.claimedPlayers.delete(0);
  const fragments=buildChantJumpFragments(game.players[0],getAlive(),[],new Set());
  const goods=fragments.filter(f=>f.type==='info'&&f.infoResult==='good').map(f=>f.infoTargetId);
  if(fragments.some(f=>f.type==='attack'&&goods.includes(f.targetId)))fakeSpeechConsistent=false;
 }
 return {fakeSpeechConsistent,runs:results.length,passed:results.every(Boolean),tied,noKnownGoodVotes,escaped:!holder.querySelector('img'),hasReasons:html.includes('查看投票依据')};
});console.log(votes);assert(votes.passed&&votes.fakeSpeechConsistent);assert(votes.tied&&votes.noKnownGoodVotes);assert(votes.escaped&&votes.hasReasons);assert.deepEqual(errors,[]);
console.log('Known-good protection, dead-wolf exclusion, one-time claims, structured follow-up, fake-report voting and speech budget passed');
}finally{await b.close()}})().catch(e=>{console.error(e);process.exit(1)});
