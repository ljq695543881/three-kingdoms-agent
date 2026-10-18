const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('dialog',d=>d.accept());await page.goto('file://'+process.cwd()+'/werewolf.html');
const growth=await page.evaluate(()=>{
 game.mode='player';init({name:'成长玩家',faction:'蜀',attr:{武力:3,智谋:3,统帅:3,政治:3,魅力:3,意志:3},growthPts:0});closeModal();const me=game.players[game.playerId];me.role='villager';const before=game.generation;endGame('good');retryGame();const earned=Number(document.getElementById('growthPts').textContent);changeGrowthAttr('智谋',1);confirmGrowth();return {earned,generation:game.generation-before,hidden:document.getElementById('growthPanel').classList.contains('hide'),points:game.players[game.playerId].growthPts,intel:game.players[game.playerId].attr.智谋,unearned:calcGrowthPoints(null)};
});console.log('growth',growth);
await page.reload();const malformed=[];for(const raw of ['null','[]','42','{}']){const r=await page.evaluate(raw=>{localStorage.setItem('playerCharacter',raw);startPlayerMode();const before=game.generation;continueGame();return {sameGeneration:game.generation===before,menu:!document.getElementById('playerModeSelect').classList.contains('hide')};},raw);malformed.push(r);}
await page.reload();const legacy=await page.evaluate(()=>{localStorage.setItem('playerCharacter',JSON.stringify({name:'旧角色',faction:'未知',attr:{武力:'5',智谋:'bad',统帅:-3,政治:999,魅力:null,意志:3.8},growthPts:'7',avatar:'x" onerror="alert(1)'}));startPlayerMode();continueGame();const me=game.players[game.playerId];return {attr:me.attr,points:me.growthPts,faction:me.faction,avatar:me.avatar};});console.log('legacy',legacy);
assert.equal(growth.generation,1,'Growth confirmation must enter the next game exactly once');assert(growth.hidden);assert.equal(growth.earned,3);assert.equal(growth.points,2);assert.equal(growth.intel,4);assert.equal(growth.unearned,0);assert(malformed.every(r=>r.sameGeneration&&r.menu));assert.deepEqual(legacy.attr,{武力:5,智谋:3,统帅:1,政治:10,魅力:3,意志:3});assert.equal(legacy.points,7);assert.equal(legacy.faction,'群');assert.equal(legacy.avatar,'');assert.deepEqual(errors,[]);
await page.evaluate(()=>{game.mode='player';hideTitle();init({name:'连局测试',faction:'蜀',attr:{武力:3,智谋:3,统帅:3,政治:3,魅力:3,意志:3},growthPts:0});closeModal();});
for(let round=1;round<=3;round++){
 await page.evaluate(()=>{closeModal();game.players[game.playerId].role='villager';endGame('good');});
 const generation=await page.evaluate(()=>game.generation);
 await page.getByRole('button',{name:'🔄 再来一局',exact:true}).click();
 assert.equal(await page.locator('#growthConfirmBtn').evaluate(el=>{const r=el.getBoundingClientRect();return document.elementFromPoint(r.x+r.width/2,r.y+r.height/2)===el;}),true,'Result overlay must not cover growth controls');
 assert.equal(await page.locator('#growthPts').textContent(),String(2*(round-1)+3));
 await page.locator('.growth-attr-row').filter({has:page.locator('.ga-name',{hasText:'智谋'})}).locator('.ga-btn').last().click();
 await page.locator('#growthConfirmBtn').click();
 assert.equal(await page.evaluate(()=>game.generation),generation+1);assert.equal(await page.locator('#growthPanel').isVisible(),false);
 assert.equal(await page.evaluate(()=>game.players[game.playerId].growthPts),round*2);assert.equal(await page.evaluate(()=>game.players[game.playerId].attr.智谋),3+round);
}
await page.evaluate(()=>{closeModal();game.players[game.playerId].role='villager';endGame('good');});await page.getByRole('button',{name:'🏠 返回标题',exact:true}).click();
const carried=await page.evaluate(()=>JSON.parse(localStorage.getItem('playerCharacter')));assert.equal(carried.name,'连局测试');assert.equal(carried.attr.智谋,6);assert.equal(carried.growthPts,9);
await page.getByRole('button',{name:/玩家扮演/}).click();await page.locator('#continueBtn').click();assert.equal(await page.evaluate(()=>game.players[game.playerId].growthPts),9);assert.equal(await page.evaluate(()=>game.players[game.playerId].attr.智谋),6);
assert.deepEqual(errors,[]);
console.log('Three consecutive real UI growth/retry cycles, character save/reload, carried points and invalid legacy data passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
