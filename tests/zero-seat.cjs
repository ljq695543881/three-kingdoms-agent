const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{const page=await browser.newPage();await page.goto('file://'+process.cwd()+'/werewolf.html');const result=await page.evaluate(()=>{
 game.mode='god';init();closeModal();game.day=1;Math.random=()=>0;
 const zero=game.players[0],villager=game.players[1],wolf=game.players[2];villager.attr={智谋:6};villager.role='villager';zero.role='villager';wolf.role='wolf';game.claimedPlayers.add(wolf.id);
 const ctx=[{speakerId:0,speakerName:zero.name,text:villager.name+'可疑，是狼。',speechType:'attack'}];
 const villagerZero=buildVillagerFragments(villager,getAlive().filter(p=>p.id!==1),ctx,new Set()).some(f=>f.type==='attack'&&f.targetId===0);
 const wolfZero=buildChantJumpFragments(wolf,getAlive(),[{speakerId:0,speakerName:zero.name,text:wolf.name+'可疑，是狼。'}],new Set()).some(f=>f.type==='attack'&&f.targetId===0);
 game.currentSpeakerId=1;game.speeches=[{speakerId:0,classified:[{type:'claim',role:'seer'}]}];const counterClaim=generatePlayerSpeechText([{type:'claim',role:'seer'}],villager).includes(zero.name);
 game.scriptMasterId=0;setFavor(wolf,0,100);const a=game.players[3],b=game.players[4];const picked=killMasterDecide(wolf,[{wolfId:0,target:a},{wolfId:5,target:b},{wolfId:6,target:b}],[a,b]);
 return {villagerZero,wolfZero,counterClaim,masterZero:picked.id===a.id};
});console.log(result);for(const [k,v]of Object.entries(result))assert(v,k);console.log('Zero-seat accuser, wolf response, counterclaim and strategist influence passed');}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
