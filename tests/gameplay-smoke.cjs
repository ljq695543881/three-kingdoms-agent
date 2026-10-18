const {chromium}=require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
 try{
 for(const size of ['quick','classic'])for(let seed=Number(process.env.SMOKE_SEED_START||1);seed<Number(process.env.SMOKE_SEED_START||1)+Number(process.env.SMOKE_SEEDS||8);seed++){
  const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('file://'+process.cwd()+'/werewolf.html');
  await page.evaluate(({size,seed})=>{
   let state=seed;Math.random=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
   document.getElementById('matchSize').value=size;startGodMode();closeModal();
   window.initialRoles=game.players.map(p=>p.role);delay=async()=>{};startGame();
  },{size,seed});
  await page.waitForFunction(()=>game.ended,{},{timeout:20000});
  const result=await page.evaluate(()=>({count:game.players.length,wolves:initialRoles.filter(r=>r==='wolf').length,roles:initialRoles,days:game.day,recap:document.querySelector('.match-recap')?.textContent,remaining:getAlive().map(p=>p.role),votes:game.voteRecords.filter(r=>r.type==='result').length}));
  assert.equal(result.count,size==='quick'?9:15);assert.equal(result.wolves,size==='quick'?2:4);for(const role of ['seer','witch','hunter','guard'])assert.equal(result.roles.filter(r=>r===role).length,1);
  assert(result.days>0);assert(result.recap?.includes('关键回合复盘'));assert(result.remaining.every(r=>r!=='wolf')||result.remaining.filter(r=>r==='wolf').length>=result.remaining.filter(r=>r!=='wolf').length);assert.deepEqual(errors,[]);
  if(size==='quick' && seed===1){await page.waitForTimeout(2600);await page.setViewportSize({width:390,height:844});await page.locator('.match-recap').scrollIntoViewIfNeeded();}
  console.log(`${size} seed ${seed}: ${result.days} days, ${result.votes} exiles, completed`);await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.goto('file://'+process.cwd()+'/werewolf.html');
 const feedback=await page.evaluate(async()=>{
  game.mode='player';init({name:'玩家',faction:'群',attr:{}});closeModal();game.day=1;delay=async()=>{};
  showSpeechPanel=async()=>({fragments:[{type:'shield',targetId:game.players.find(p=>p.id!==game.playerId).id}],text:'我愿意相信此人。'});
  await generateSpeeches();
  renderFavorGrid();
  if(document.querySelector('#favorGrid .favor-cell'))throw new Error('Player can inspect exact favor');
  if(document.querySelector('#favorPanel .fp-hint').textContent.includes('手动修改'))throw new Error('Player matrix controls visible');
  const actual={reactions:game.reactions.length,lines:game.reactions[0]?.lines,text:document.querySelector('#logArea .speech-reaction')?.textContent,hiddenRecap:buildMatchRecap()};
  const listeners=game.players.filter(p=>p.id!==game.playerId);
  setFavor(listeners[0],game.playerId,70);setFavor(listeners[1],game.playerId,20);Math.random=()=>.99;
  const mixed=applyPlayerSpeechEffect(game.players[game.playerId],'',[{type:'claim',targets:[]}],game.players);
  actual.mixed=mixed.some(l=>l.includes('更友善'))&&mixed.some(l=>l.includes('戒备'));
  const target=game.players.find(p=>p.id!==game.playerId);target.name='<img src=x onerror=alert(1)>';setFavor(target,game.playerId,99);Math.random=()=>.99;
  applyPlayerSpeechEffect(game.players[game.playerId],'',[{type:'conservative'}],game.players);
  actual.clampLine=game.reactions.at(-1).lines.some(l=>l.includes(target.name));actual.injected=!!document.querySelector('.speech-reaction img');
  game.voteRecords=[{day:1,voterId:game.playerId,targetId:target.id},{day:1,type:'result',targetId:target.id,votes:1}];
  endGame('good');actual.summaryInjected=!!document.querySelector('#modalArea img[src="x"]');actual.recap=buildMatchRecap();const before=getPrestige();endGame('good');actual.duplicateAward=getPrestige()!==before;
  return actual;
 });
 assert.equal(feedback.mixed,true);assert.equal(feedback.reactions,1);assert.equal(feedback.hiddenRecap,'');assert(feedback.text.includes('态度只反映'));assert.equal(feedback.clampLine,false);assert.equal(feedback.injected,false);assert.equal(feedback.summaryInjected,false);assert(feedback.recap.includes('&lt;img'));assert.equal(feedback.duplicateAward,false);
 console.log('Player speech integration, hidden-role boundaries, favor clamp, recap escaping, duplicate settlement: passed');
 await page.reload();await page.close();
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:844,height:390},{width:1440,height:900}]){
  const page=await browser.newPage({viewport});await page.goto('file://'+process.cwd()+'/werewolf.html');await page.locator('label[for="format-quick"]').click();await page.getByRole('button',{name:/上帝视角/}).click();
  assert.equal(await page.locator('.p-card').count(),9);assert((await page.locator('#modalArea').textContent()).includes('9人'));assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
  await page.evaluate(()=>{closeModal();game.day=1;endGame('wolf')});const bounds=await page.locator('#modalArea .modal').boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width&&bounds.y+bounds.height<=viewport.height);await page.close();
 }console.log('Responsive setup and recap: passed');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
