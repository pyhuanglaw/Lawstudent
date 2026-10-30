// BB-B 10-25：AA_466～469 瀏覽器情境（zrlast_probe R41）用的日期，照遊戲資料算。用法：node docs/story_planning/test_tools/aa466_469_dates.js <開發分支工作樹>
const WT=process.argv[2]; process.chdir(WT);
require(WT+'/tests/alison.js'); const H=require(WT+'/tests/pg_harness.js');
const {GM}=H; GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, wd=d=>CALENDAR.dateOf(d).wd%7;
const NEW={LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW};
const out={};
/* 麵店日（週二、週四上課週）：2025-10-01 起前十個 */
const nd=[]; for(let d=D('2025-10-01');nd.length<10;d++) if(STORY.noodleDay(d)) nd.push(K(d)+'('+wd(d)+')'); out.noodleDays=nd;
/* 大一下期末最後一科 */
const G=H.fresh('2026-06-20',12,'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},NEW)); G.acts={att:{}};
try{ const e=CLS.lastExamEnd(G,'Y1S2','final'); out.y1s2Final=e?[K(e.day),e.h]:null; }catch(err){ out.y1s2Final='ERR '+err.message; }
try{ const e=CLS.lastExamEnd(G,'Y2S1','final'); out.y2s1Final=e?[K(e.day),e.h]:null; }catch(err){ out.y2s1Final='ERR '+err.message; }
/* 日本：週四、時差 */
for(const k of ['2028-06-15','2028-06-22','2028-07-06']) out['wd_'+k]=wd(D(k));
console.log(JSON.stringify(out,null,1));
