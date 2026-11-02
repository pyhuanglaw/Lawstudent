// CC n22 US-Y4S1-SELECT（BB 11:21 派工 4）：美國交換的大四上，開學還會跳台灣的選課畫面嗎？只用 Node、不開瀏覽器、不改 src/。
// 用法：node docs/story_planning/test_tools/cc/n22_us_y4s1_select.js <受測根目錄>
// 做什麼：k1_exchange 同一套假 GM／fresh()；EXCHANGE_ROUTE＝TW／JP／US 各一局，從大四上開學前 3 天到第 2 週結束，每天早上 08:00 呼叫真的 CLS.morning，
//   包住 CLS.selectTerm（紀錄被叫到的學期）與 GM.toast（「開學了」）。對照組：JP 的大三下（日本，本來就不選課）。
// 預期：TW、JP 大四上＝要選課；US 大四上＝不選課、不跳「大四上開學了」（人在美國，CLS.termAway 也認定 Y4S1 在國外）；JP 大三下＝不選課。
// 【前置／捷徑】直接把日期設到開學前（routeFlags 照 k1 補出國旗標），不是玩家一路玩過去。
'use strict';
const path=require('path');
const argv=process.argv.slice(2);
const ROOT=path.resolve(argv[0]&&!argv[0].startsWith('--')?argv[0]:'.');

const NOMUT=argv.includes('--no-mut'), VERB=argv.includes('--v');
const LD=require(path.join(__dirname,'n56_loadall.js'))(ROOT);
console.log('受測 ROOT：'+ROOT+'　載入 '+LD.loaded.length+' 檔、失敗 '+LD.failed.length);
const need=['CLS','STUDY','JP','FD','Y5','PG','USL','EXCH','STORY','CALENDAR','PHONE','SOCIAL','EVENTS','INV','HONOR','GRADES','EXAM_BANK'];
{ const miss=need.filter(n=>typeof global[n]==='undefined'); if(miss.length){ console.log('FAIL 缺模組：'+miss.join('、')); process.exit(2); } }
const LOG=console.log; console.warn=()=>{}; console.error=()=>{};
const J=JSON.stringify;
const FAIL_ROUTE=process.env.FAIL_ROUTE||'retake', RT_COURSE=process.env.RETAKE_COURSE||'enforcement'; if(!['retake','maritime'].includes(FAIL_ROUTE)){ LOG('FAIL_ROUTE 只能是 retake／maritime：'+FAIL_ROUTE); process.exit(2); }
LOG('FAIL_ROUTE＝'+FAIL_ROUTE+(FAIL_ROUTE==='retake'?'（y4s2：TW 大四上 '+RT_COURSE+' 被當→大四下重修又被當；US 大三下被當→大四下重修又被當；JP 補修輪流）':'（舊情境：y4s2 被當海商法）'));

/* ---------- 假的 GM ---------- */
const H={G:null,said:[]};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,speed:0,pose:'idle'},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,paused:false};
let answer=null;   /* (ts)=>index：考試作答 */
const GM={get G(){ return H.G; },E,D:{active:false},npc:{},running:true,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){},standUp(){},toast(){},
  addNote(id,title,body){ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; },
  hasNote(id){ return !!(H.G.notes||[]).find(n=>n.id===id); },
  titleCard:async()=>{},enter:async(z)=>{ H.G.zone=z; },advance(h){ H.G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},
  phoneThread:async()=>{}, openPhone(){},
  say:async(who,t)=>{ H.said.push(String(t)); if(H.said.length>3000) H.said.splice(0,1500); },
  choose:async o=>{ const ts=o.map(q=>String(q.t||q.text||'')); return answer?answer(ts):0; }};
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const RD=STORY.ROUTE_DATES;
function routeFlags(G){ const F=G.flags, r=F.EXCHANGE_ROUTE, d=G.day;
  if(r==='JP'){ if(d>=DK(RD.JP.dep)&&F.JP_DEPARTED==null) F.JP_DEPARTED=DK(RD.JP.dep); if(d>=DK(RD.JP.ret)&&F.JP_RETURNED==null) F.JP_RETURNED=DK(RD.JP.ret); }
  if(r==='US'){ if(d>=DK(RD.US.dep)){ F.US_DEPARTED=true; if(!F.US_ARRIVED){ F.US_ARRIVED=true; F.US_ARRIVED_DAY=DK(RD.US.dep); } } if(d>=DK(RD.US.ret)&&F.US_RETURNED==null) F.US_RETURNED=DK(RD.US.ret); } }
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); E.hour=h; routeFlags(G); };
function fresh(route,seed){ const day=DK('2027-09-01');
  H.G={v:3,day,hour:8,zone:'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:{KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:9,examSeed:5000+seed*37,EXCHANGE_ROUTE:route},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},notes:[],memo:[]};
  SOCIAL.bind(H.G); EVENTS.bind(GM); INV.rec(H.G); if(STORY._fy&&STORY._fy.reset) STORY._fy.reset(); if(CLS.resetExamMemo) CLS.resetExamMemo(); CLS.rec(H.G); H.said=[]; return H.G; }


let fails=0; const FL=[];
const chk=(n,ok,i)=>{ LOG((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok){ fails++; FL.push(n); } };
const toasts=[]; GM.toast=(t)=>{ toasts.push([key(H.G.day),String(t)]); };
const sel=[]; const sel0=CLS.selectTerm; CLS.selectTerm=async function(gm,t){ sel.push([key(H.G.day),t]); return sel0.apply(this,arguments); };
async function run(route,term){ fresh(route,1); sel.length=0; toasts.length=0;
  const r=CALENDAR.termDays(term); for(let d=r.from-3; d<=r.from+13; d++){ setDay(d,8); try{ await CLS.morning(GM); }catch(e){ LOG('  例外 '+key(d)+' '+(e&&e.message)); } }
  const s=sel.filter(x=>x[1]===term), t=toasts.filter(x=>x[1].indexOf(CLS.termName(term)+'開學了')===0);
  const away=CLS.termAway?CLS.termAway(H.G,term):'(沒有 termAway)';
  LOG('  '+route+' '+term+'：selectTerm '+JSON.stringify(s)+'　開學 toast '+JSON.stringify(t)+'　termAway='+away+'　R.note.sel_'+term+'='+CLS.rec(H.G).note['sel_'+term]);
  return {s,t,away}; }
(async()=>{
  const tw=await run('TW','Y4S1'); chk('TW 大四上：開學要選課（selectTerm 被叫 1 次）',tw.s.length===1,JSON.stringify(tw.s));
  const jp=await run('JP','Y4S1'); chk('JP 大四上（已回國）：開學要選課',jp.s.length===1,JSON.stringify(jp.s));
  const jp2=await run('JP','Y3S2'); chk('對照：JP 大三下（在日本）不選課',jp2.s.length===0,JSON.stringify(jp2.s));
  const us=await run('US','Y4S1');
  chk('US 大四上（在美國）：不跳台灣的選課（selectTerm 0 次）',us.s.length===0,JSON.stringify(us.s));
  chk('US 大四上：不跳「大四上開學了」',us.t.length===0,JSON.stringify(us.t));
  chk('US 大四上：termAway 認定在國外（和選課判斷一致）',us.away===true,String(us.away));
  /* INFO（不計 PASS/FAIL）：US 路線、已過出發日、US_DEPARTED 有但 US_ARRIVED 沒有（例如還在機場沒登機的舊存檔）*/
  { fresh('US',1); const G=H.G; sel.length=0; const r=CALENDAR.termDays('Y4S1');
    for(let d=r.from-3; d<=r.from+13; d++){ G.day=d; G.hour=8; G.weekday=wdOf(d); E.hour=8; G.flags.US_DEPARTED=true; delete G.flags.US_ARRIVED; try{ await CLS.morning(GM); }catch(e){} }
    LOG('INFO US 有 US_DEPARTED、沒有 US_ARRIVED：selectTerm '+JSON.stringify(sel.filter(x=>x[1]==='Y4S1'))+'　termAway='+CLS.termAway(G,'Y4S1')); }
  LOG(fails?('FAILED '+fails+'：'+FL.join('、')):'ALL PASS');
  process.exit(fails?1:0); })();
