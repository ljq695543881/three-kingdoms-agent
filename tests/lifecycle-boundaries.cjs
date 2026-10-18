const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
const result=await page.evaluate(async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));const reset=()=>{game.mode='player';init({name:'边界测试',faction:'群',attr:{}});closeModal();};
 reset();let finished=false;const wait=delay(180).then(()=>finished=true);await sleep(40);togglePause();await sleep(250);const timerPaused=!finished;togglePause();await sleep(50);const remainingTimeKept=!finished;await wait;
 reset();let dayCalls=0;const oldDay=dayPhase;dayPhase=()=>dayCalls++;resolveNight();togglePause();await sleep(1350);const transitionPaused=dayCalls===0;togglePause();await sleep(100);const transitionResumed=dayCalls===1;dayPhase=oldDay;
 reset();showTagPanel(0);const tagPaused=game.isPaused;toggleSpeechHistory();closeTagPanel();const otherReaderKept=game.isPaused;closeSpeechHistory();const tagResumed=!game.isPaused;
 endGame('good');const summary=document.getElementById('modalArea').innerHTML;onPlayerClick(0);const summaryRetained=document.getElementById('modalArea').innerHTML===summary;
 reset();showSpeechPanel();selectSpeechType('claim');selectClaimRole('seer');selectSpeechType('attack');const validDraftConfirm=!document.getElementById('speechConfirmBtn').disabled;const infoReachable=document.getElementById('st-info').style.display!=='none';selectSpeechType('info');const draftInfoVisible=document.getElementById('speechInfoRow').classList.contains('show');removeSpeechFragment(0);selectSpeechType('conservative');confirmPlayerSpeech();
 reset();let staleDone=false;togglePause();delay(1000).then(()=>staleDone=true);init();await sleep(100);const staleCancelled=staleDone&&!game.isPaused;
 return {remainingTimeKept,timerPaused,transitionPaused,transitionResumed,tagPaused,otherReaderKept,tagResumed,summaryRetained,validDraftConfirm,infoReachable,draftInfoVisible,staleCancelled};
});console.log(result);for(const [key,value] of Object.entries(result))assert(value,key);assert.deepEqual(errors,[]);await page.evaluate(()=>{game.mode='player';init({name:'关闭测试',faction:'群',attr:{}});closeModal();showTagPanel(0);});await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>game.isPaused),false);assert.equal(await page.locator('#modalArea .tag-modal').count(),0);
console.log('Real timers, paused dawn, nested readers, result preservation, draft controls and paused restart passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
