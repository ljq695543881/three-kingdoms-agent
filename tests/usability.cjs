const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{
const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});
try{
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1440,height:900}].filter(v=>!process.env.USABILITY_WIDTH||v.width===Number(process.env.USABILITY_WIDTH))){
 const page=await browser.newPage({viewport});page.setDefaultTimeout(6000);const errors=[];page.on('pageerror',e=>errors.push(e.message));
 const reset=async()=>{await page.goto('file://'+process.cwd()+'/werewolf.html');await page.evaluate(()=>{game.mode='player';hideTitle();init({name:'体验玩家',faction:'群',attr:{}});closeModal();game.day=1;game.speeches.push({speakerId:0,day:1,speechType:'conservative',classified:[{type:'conservative'}],text:'我认为需要听完大家的意见，再决定投票。'});});};
 await reset();
 await page.evaluate(()=>{window.done=false;showHunterShootPanel(game.players[game.playerId],'vote').then(v=>{window.done=true;window.value=v;});});
 await page.locator('[data-hunter-target]').first().click();const target=await page.evaluate(()=>hunterShootSelected);
 await page.locator('#hunterShootPanel').getByRole('button',{name:'查看发言历史'}).click();assert.equal(await page.evaluate(()=>done),false);
 await page.locator('.speech-fulltext summary').first().click();assert((await page.locator('.speech-fulltext').first().textContent()).includes('听完大家的意见'));
 await page.locator('#resumeAction').click();assert.equal(await page.evaluate(()=>hunterShootSelected),target);
 await page.getByRole('button',{name:'放弃技能',exact:true}).click();assert.equal(await page.evaluate(()=>done),false);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>done),false);
 await page.locator('#hunterShootConfirmBtn').click();await page.waitForFunction(()=>done);assert.equal(await page.evaluate(()=>value.id),Number(target));
 // Destiny choices do not submit until the confirmation button is pressed.
 await reset();await page.evaluate(()=>{game.mode='destiny';game.destiny=0;window.done=false;showDestinyPanel().then(v=>{window.done=true;window.value=v;});});
 await page.locator('#da-help').click();const card=page.locator('#destinyTargetList [data-id]').first();await card.focus();await page.keyboard.press('Enter');const destinyTarget=await card.getAttribute('data-id');assert.equal(await page.evaluate(()=>done),false);
 await page.keyboard.press('Escape');assert.equal(await page.locator('#destinyPanel').isVisible(),false);await page.locator('#resumeAction').click();assert.equal(await page.evaluate(()=>_destinyTarget),Number(destinyTarget));
 await page.locator('#destinyActionConfirm').click();await page.waitForFunction(()=>done);assert.deepEqual(await page.evaluate(()=>value),{action:'help',targetId:Number(destinyTarget)});
 await page.evaluate(()=>{window.done=false;showDestinyPanel().then(()=>window.done=true);});await page.locator('#da-wait').click();assert.equal(await page.evaluate(()=>done),false);await page.locator('#destinyActionConfirm').click();await page.waitForFunction(()=>done);
 // Pause reasons compose, and a manual pause survives opening/closing readers.
 await reset();const pause=await page.evaluate(()=>{togglePause();toggleSpeechHistory();openSettings();closeSpeechHistory();const otherReader=game.isPaused;closeSettings();const manual=game.isPaused;togglePause();return {otherReader,manual,resumed:!game.isPaused};});assert.deepEqual(pause,{otherReader:true,manual:true,resumed:true});
 await page.evaluate(()=>toggleSpeechHistory());await page.locator('.sh-close').focus();await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.getElementById('speechHistoryPanel').contains(document.activeElement)),true);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>game.isPaused),false);assert.equal(await page.locator('#speechHistoryPanel').isVisible(),false);assert.equal(await page.evaluate(()=>document.getElementById('speechHistoryPanel').contains(document.activeElement)),false);
 // Destructive navigation must wait for confirmation. Escape cancels it.
 await page.evaluate(()=>openSettings());const gen=await page.evaluate(()=>game.generation);await page.getByRole('button',{name:'🔄 重新开始',exact:true}).click();assert.equal(await page.evaluate(()=>game.generation),gen);await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>game._confirmCallback),null);assert.equal(await page.evaluate(()=>game.generation),gen);
 await page.getByRole('button',{name:'🏠 返回标题',exact:true}).click();await page.locator('#confirmYesBtn').click();assert(await page.evaluate(()=>game.generation)>gen);assert.equal(await page.locator('#titleScreen').isVisible(),true);
 // New logs do not steal the player's scroll position; jump restores following.
 await reset();await page.evaluate(()=>{for(let i=0;i<80;i++)addLog('历史发言 '+i);document.getElementById('logArea').scrollTop=0;addLog('刚刚的新发言');});
 assert.equal(await page.locator('#logArea').evaluate(el=>el.scrollTop),0);assert.equal(await page.locator('#jumpLogs').isVisible(),true);await page.locator('#jumpLogs').click();assert.equal(await page.locator('#jumpLogs').isVisible(),false);assert(await page.locator('#logArea').evaluate(el=>el.scrollHeight-el.scrollTop-el.clientHeight<3));
 // Restarting while an asynchronous turn is pending must not reopen old UI.
 await reset();await page.evaluate(()=>{startGame();openSettings();confirmBackToTitle();executeConfirm();});await page.waitForTimeout(1000);assert.equal(await page.locator('#titleScreen').isVisible(),true);assert.equal(await page.locator('#nightPanel').isVisible(),false);assert.equal(await page.locator('#speechPanel').isVisible(),false);assert.equal(await page.locator('#votePanel').isVisible(),false);
 assert.deepEqual(errors,[]);console.log(`${viewport.width}x${viewport.height}: hunter/destiny, explicit confirmation, keyboard, pause ownership, history full text, log scroll, destructive navigation, stale turn cancellation passed`);await page.close();
}
}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exit(1)});
