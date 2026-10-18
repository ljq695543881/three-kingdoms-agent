const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
(async()=>{const browser=await chromium.launch({headless:true,...(process.env.CHROME_EXECUTABLE?{executablePath:process.env.CHROME_EXECUTABLE}:{})});try{
const page=await browser.newPage({viewport:{width:390,height:844}});page.setDefaultTimeout(15000);const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto('file://'+process.cwd()+'/werewolf.html');
const result=await page.evaluate(()=>{
 localStorage.clear();
 const settle=(role,winner='good',size=9,votes=false)=>{
  document.getElementById('matchSize').value=size===9?'quick':'classic';game.mode='player';init({name:'生涯测试',faction:'群',attr:{}});closeModal();game.day=2;
  const me=game.players[game.playerId];me.role=role;
  const target=game.players.find(p=>p.id!==me.id);target.role='wolf';
  if(votes)game.voteRecords=[{day:1,voterId:me.id,targetId:target.id},{day:1,type:'tie',tiedIds:[target.id],votes:2},{day:1,voterId:me.id,targetId:target.id,tieBreak:true},{day:1,type:'result',targetId:target.id,votes:3,tieBreak:true}];
  endGame(winner);const after=getPrestige(),stats=JSON.stringify(getAchievementStats());endGame(winner);
  if(getPrestige()!==after||JSON.stringify(getAchievementStats())!==stats)throw new Error('duplicate settlement');
  return {fresh:_gameAchievementsEarned.slice(),bonus:game.chapterReward,breakdown:getPrestigeBreakdown(winner,_gameAchievementsEarned),report:buildCareerReport()};
 };
 const first=settle('villager','good',9,true);const initial=getAchievementStats();
 equipCareerTitle('victor');const title=equippedCareerTitle();equipCareerTitle('master');const locked=equippedCareerTitle();
 trackAchievement('all_roles');const pinned=careerGoals(getAchievementStats())[0].id;
 const second=settle('villager','good');const third=settle('seer','wolf');const afterChapter=getAchievementStats();
 const fourth=settle('guard','good',15);const afterExploration=getAchievementStats();
 const fifth=settle('hunter','wolf');const sixth=settle('witch','good');const seventh=settle('wolf','wolf',9,true);const all=getAchievementStats();
 // Old saves keep achievements, votes, games and prestige; new fields safely default.
 localStorage.setItem('threeKingdomsAchievements',JSON.stringify({gamesPlayed:20,wins:5,correctVotes:7,earned:['devotion','seven_captures']}));savePrestige(456);
 const old=settle('villager','wolf');const migrated=getAchievementStats(),prestige=getPrestige();
 // Spectating never advances player achievements or chapter counters.
 const before=JSON.stringify(getAchievementStats());game.mode='god';init();closeModal();game.day=1;endGame('wolf');const spectatorUnchanged=before===JSON.stringify(getAchievementStats());
 const past=getAchievementStats();game.mode='destiny';init();closeModal();game.careerPlayerId=0;game.players[0].role='wolf';game.destiny=null;game.destinyEnded=true;game.day=1;endGame('wolf');const destinyStats=getAchievementStats();const destinyLoss=destinyStats.gamesPlayed===past.gamesPlayed+1&&destinyStats.wins===past.wins&&getPrestigeBreakdown('wolf',[]).parts[0].label==='败北';
 const malformed=[];for(const raw of ['null','[]','"text"','{','{"earned":null,"gamesPlayed":-3,"roleGames":null}']){localStorage.setItem('threeKingdomsAchievements',raw);const stats=getAchievementStats();malformed.push(Array.isArray(stats.earned)&&stats.gamesPlayed>=0);openAchievement();closeAchievement();}
 return {count:ACHIEVEMENT_LIST.length,first,initial,title,locked,pinned,second,third,afterChapter,fourth,afterExploration,all,old,migrated,prestige,spectatorUnchanged,destinyLoss,malformed};
});
assert.equal(result.count,18);assert(result.first.fresh.includes('first_game'));assert(result.first.fresh.includes('first_win'));assert.equal(result.initial.correctVotes,1);assert.equal(result.title,'破局新秀');assert.equal(result.locked,'破局新秀');assert.equal(result.pinned,'all_roles');assert(!result.second.fresh.includes('first_game'));assert(!result.second.fresh.includes('peach_garden'));assert.equal(result.third.bonus,40);assert.equal(result.afterChapter.chaptersCompleted,1);assert.equal(result.afterChapter.chapterGames,0);assert.equal(result.third.breakdown.parts.filter(p=>p.label==='篇章完成').length,1);assert.equal(result.third.breakdown.total,result.third.breakdown.parts.reduce((sum,p)=>sum+p.amount,0));assert(result.third.report.includes('新篇章已开启'));assert(result.afterExploration.earned.includes('three_roles'));assert(result.afterExploration.earned.includes('both_formats'));assert(result.all.earned.includes('all_roles'));assert.equal(result.all.correctVotes,1);assert.equal(result.migrated.gamesPlayed,21);assert(result.migrated.earned.includes('devotion'));assert(!result.old.fresh.includes('devotion'));assert(result.prestige>=456);assert(result.spectatorUnchanged);assert(result.destinyLoss);assert(result.malformed.every(Boolean));
// Tracking and titles are operable in the overlay, above the end-of-game dialog.
for(const viewport of [{width:320,height:568},{width:390,height:844},{width:1440,height:900}]){
 await page.setViewportSize(viewport);await page.evaluate(()=>{localStorage.clear();openAchievement();});
 assert.equal(await page.locator('#achievementBadges .ach-badge').count(),18);assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 const goal=page.locator('#careerGoals button').first();await goal.click();assert(await page.locator('#careerGoals [aria-pressed="true"]').count());
 await page.getByRole('button',{name:'关闭成就 ✕',exact:true}).click();assert.equal(await page.locator('#achievementPanel').isVisible(),false);
 await page.evaluate(()=>{game.ended=true;game.achievementReport={before:getAchievementStats(),after:getAchievementStats(),fresh:[],correct:0,isWin:false};document.getElementById('modalArea').innerHTML='<div class="modal-overlay"><div class="modal">'+buildCareerReport()+'</div></div>';});
 await page.getByRole('button',{name:'查看目标与称号'}).click();assert.equal(await page.locator('#achievementPanel').isVisible(),true);await page.keyboard.press('Escape');assert.equal(await page.locator('#achievementPanel').isVisible(),false);
 console.log(`${viewport.width}x${viewport.height}: goals, 18 badges, tracking, overlay close and return passed`);
}
assert.deepEqual(errors,[]);console.log('Milestones, first-only rewards, chapter reset and exact payout, roles, formats, tie-break votes, wolf vote exclusion, title locks, migration, malformed saves, spectator isolation passed');
}finally{await browser.close()}})().catch(e=>{console.error(e);process.exit(1)});
