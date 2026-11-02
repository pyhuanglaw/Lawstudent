// 唯讀探針：PG.tier／PG.path／STORY.careerLean 在幾種存檔旗標下的結果（修改前基準）
require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/alison.js');
const H=require('/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw/tests/pg_harness.js');
const out=(n,v)=>console.log(n.padEnd(46),JSON.stringify(v));
// tier
for(const [y,k] of [[2029,20],[2029,16],[2029,15],[2029,12],[2029,11],[2030,5],[2030,16]]) out('tier '+y+' k='+k, PG.tier(y,k));
// path: 什麼都沒做、考上律師
let G=H.fresh('2030-10-01',9,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_YEAR:2029});
out('沒讀書沒法服 BAR_YEAR=2029 lean', STORY.careerLean(G)); out('  path', PG.path(G));
// 自習 300 小時（B 高）但沒報研究所
G=H.fresh('2030-10-01',9,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_YEAR:2029,STUDY_AT_LAW:0}); G.stats=G.stats||{}; G.stats.study=300;
out('自習300h BAR_YEAR=2029 lean', STORY.careerLean(G)); out('  path', PG.path(G));
// 法服去 5 次
G=H.fresh('2030-10-01',9,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:18,BAR_YEAR:2029,LAWCLUB_SAT_VISITS:5});
out('法服5次 BAR_YEAR=2029 lean', STORY.careerLean(G)); out('  path', PG.path(G));
// 沒報名國考
G=H.fresh('2030-10-01',9,'dorm',{BAR_REG:false,LAWCLUB_SAT_VISITS:5});
out('法服5次 沒報國考 path', PG.path(G));
// 有任何 JUDGE 旗標？
out('PG 物件有 judge 相關函式', Object.keys(PG).filter(k=>/judge|JUDGE/i.test(k)));
out('PG.Y 年份（國考只排到）', Object.keys(PG.Y));
