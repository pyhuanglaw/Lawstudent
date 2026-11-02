// 唯讀基準：大二～大四每個值班週六都去坐圓桌（認識柏翰、每次選第一個），統計重複出現的句子與選項
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
(async()=>{
  const a=CALENDAR.termDays('Y2S1').from, b=CALENDAR.termDays('Y4S2').to, days=[]; for(let d=a; d<=b; d++) if(STORY.fafuDuty({day:d,flags:{},stage:'law'})) days.push(d);
  H.fresh(CALENDAR.dateOf(days[0]).key,9.2,'wancai',{lawclub:true}); H.FAMILIAR('classmate_bohan');
  const cnt={}, optCnt={}; let shifts=0;
  for(const d of days){ H.G.day=d; H.G.hour=9.2; H.G.weekday=6; H.said=[]; H.opts=[]; H.picks=[0,0];
    if(!STORY.fafuShiftable(H.G)) continue; await STORY.fafuShift(GM); shifts++;
    for(const s of H.said){ const k=(s.who?s.who+'：':'')+s.t; cnt[k]=(cnt[k]||0)+1; }
    for(const o of H.opts){ const k=o.join('／'); optCnt[k]=(optCnt[k]||0)+1; } }
  console.log('值班次數',shifts,'LAWCLUB_SAT_VISITS',H.G.flags.LAWCLUB_SAT_VISITS,'FAFU_SHIFT_N',H.G.flags.FAFU_SHIFT_N,'FAFU_ROT',JSON.stringify(H.G.flags.FAFU_ROT));
  console.log('--- 出現 3 次以上的句子');
  Object.entries(cnt).filter(([k,v])=>v>=3).sort((x,y)=>y[1]-x[1]).forEach(([k,v])=>console.log(v+'×',k));
  console.log('--- 每次都要按的選項'); Object.entries(optCnt).forEach(([k,v])=>console.log(v+'×',k));
  process.exit(0);
})();
