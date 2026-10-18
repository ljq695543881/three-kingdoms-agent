const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
 try{
 for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1440,height:900}]){
  for(const kind of ['speech','night','vote']){
   const page=await browser.newPage({viewport});page.setDefaultTimeout(5000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('file://'+process.cwd()+'/werewolf.html');
   await page.evaluate(kind=>{
    game.mode='player';hideTitle();init({name:'测试玩家',faction:'群',attr:{}});closeModal();game.day=2;
    game.speeches.push({speakerId:0,speechType:'conservative',classified:[{type:'conservative'}],day:1,text:'我再听听大家的意见。'});
    const pending=kind==='speech'?showSpeechPanel():kind==='vote'?showVotePanel():showNightPanel('wolf',{targets:getAlive().filter(p=>p.id!==game.playerId)});
    window.actionResolved=false;pending.then(value=>{window.actionResolved=true;window.actionValue=value});
   },kind);
   const panel=page.locator('#'+kind+'Panel');
   if(kind==='speech')await panel.locator('#st-conservative').click();
   else await panel.locator(kind==='vote'?'.vote-player-card':'.night-player-card').first().click();
   const before=await page.evaluate(kind=>kind==='speech'?JSON.stringify(_speechFragments):kind==='night'?JSON.stringify(_nightResult):document.querySelector('#voteOptions .selected')?.dataset.id,kind);
   await panel.getByRole('button',{name:'查看发言历史',exact:true}).click();
   assert.equal(await panel.isVisible(),false);assert.equal(await page.locator('#speechHistoryPanel').isVisible(),true);assert(await page.locator('#speechHistoryPanel .sh-item').count()>0);
   assert.equal(await page.evaluate(()=>actionResolved),false);
   const dock=page.locator('#resumeAction');await dock.click();assert.equal(await panel.isVisible(),true);
   const after=await page.evaluate(kind=>kind==='speech'?JSON.stringify(_speechFragments):kind==='night'?JSON.stringify(_nightResult):document.querySelector('#voteOptions .selected')?.dataset.id,kind);assert.equal(after,before);
   // Plain collapse also permits reading the main game log without resolving the turn.
   await panel.getByRole('button',{name:'收起面板',exact:true}).click();const bounds=await dock.boundingBox();assert(bounds.x>=0&&bounds.y>=0&&bounds.x+bounds.width<=viewport.width&&bounds.y+bounds.height<=viewport.height);
   assert.equal(await page.evaluate(()=>actionResolved),false);await dock.click();
   await panel.locator('#'+kind+'ConfirmBtn').click();await page.waitForFunction(()=>actionResolved);assert.equal(await dock.isVisible(),false);assert.equal(await panel.isVisible(),false);
   // Reinitialization must clear any suspended UI and avoid reviving an old action.
   await page.evaluate(()=>{showVotePanel();collapseAction('votePanel',false);backToTitle();});assert.equal(await dock.isVisible(),false);
   await page.evaluate(()=>{startGodMode();closeModal();});assert.equal(await page.locator('.action-collapsed').count(),0);assert.deepEqual(errors,[]);
   console.log(`${viewport.width}x${viewport.height} ${kind}: history, retained selection, pending promise, confirm, reset passed`);await page.close();
  }
 }
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
