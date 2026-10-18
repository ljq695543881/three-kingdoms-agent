const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
const page=await browser.newPage({viewport:{width:390,height:844}});const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
const result=await page.evaluate(async()=>{
 const originalShuffle=shuffle,originalRandom=Math.random;shuffle=a=>a;Math.random=()=>.99;
 game.mode='player';const duplicateName=ALL_CHARS[0].name;init({name:duplicateName,faction:'群',attr:{智谋:6}});closeModal();
 const duplicate={id:game.playerId,name:game.players[game.playerId].name,attr:game.players[game.playerId].attr.智谋,names:game.players.filter(p=>p.name===duplicateName).length};
 shuffle=originalShuffle;Math.random=originalRandom;
 game.mode='player';init({name:"'<>坏名",faction:'群',attr:{}});closeModal();const normalized=game.players[game.playerId].name;
 const validations=['a\'b','<甲>','\\甲','&甲',''].map(s=>validPlayerName(s));const goodName=validPlayerName('诸葛_1');
 game.mode='player';init({name:'猎人玩家',faction:'群',attr:{}});closeModal();game.day=1;
 const me=game.players[game.playerId];me.role='hunter';await markDeath(me,1,'wolf');
 const hunterBefore={god:isGodView(),wolfLog:canSeeLog('wolf'),pending:game.hunterDecisionPending};renderFavorGrid();hunterBefore.matrix=!!document.querySelector('#favorGrid .favor-cell');
 window.hunterResolved=false;showHunterShootPanel(me,'wolf').then(()=>window.hunterResolved=true);
 const option=document.querySelector('[data-hunter-target]');selectHunterTarget(option,option.dataset.hunterTarget);confirmHunterShoot();await Promise.resolve();
 const hunterAfter={god:isGodView(),resolved:window.hunterResolved,pending:game.hunterDecisionPending};
 game.mode='destiny';init();closeModal();game.destiny=0;game.players[0].role='seer';
 const zeroSeer={own:canSeeLog('seer'),wolf:canSeeLog('wolf')};game.players[0].role='wolf';const zeroWolf={own:canSeeLog('wolf'),seer:canSeeLog('seer')};
 _destinySelected=14;showDestinySelect();const reset={value:_destinySelected,disabled:document.getElementById('destinyConfirmBtn').disabled};
 confirmDestinySelect();const unchanged=game.destiny===0;
 const values=[];for(const value of ['NaN','bad','-12','100']){localStorage.setItem('threeKingdomsPrestige',value);values.push(getPrestige());}
 return {duplicate,normalized,validations,goodName,hunterBefore,hunterAfter,zeroSeer,zeroWolf,reset,unchanged,values};
});
assert.equal(result.duplicate.id,8);assert.equal(result.duplicate.attr,6);assert.equal(result.duplicate.names,2);assert(!/[<>'\\]/.test(result.normalized));assert(result.validations.every(v=>!v));assert(result.goodName);assert.deepEqual(result.hunterBefore,{god:false,wolfLog:false,pending:true,matrix:false});assert.deepEqual(result.hunterAfter,{god:true,resolved:true,pending:false});assert.deepEqual(result.zeroSeer,{own:true,wolf:false});assert.deepEqual(result.zeroWolf,{own:true,seer:false});assert.deepEqual(result.reset,{value:null,disabled:true});assert(result.unchanged);assert.deepEqual(result.values,[0,0,0,100]);await page.reload();
await page.getByRole('button',{name:/玩家扮演/}).click();await page.getByRole('button',{name:'🎮 新游戏'}).click();
const input=page.getByRole('textbox',{name:'角色名'});await input.fill("a'b");assert.equal(await page.locator('#charStartBtn').isDisabled(),true);assert((await page.locator('#charNameHint').textContent()).includes('不能含'));
await input.fill('新玩家');for(let i=0;i<3;i++)await page.locator('.attr-btn-plus').first().click();await page.locator('#charStartBtn').click();assert.equal(await page.evaluate(()=>game.players[game.playerId].name),'新玩家');
assert.deepEqual(errors,[]);
console.log('Duplicate names, legacy name normalization, invalid input, hunter information boundary, destiny slot zero, stale destiny selection, malformed prestige: passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
