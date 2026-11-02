// 唯讀基準：沒加入法服、大一～大四每個值班週六都去「在旁邊看」一次，統計重複的句子
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
(async()=>{
  const a=CALENDAR.termDays('Y1S1').from, b=CALENDAR.termDays('Y4S2').to, days=[]; for(let d=a; d<=b; d++) if(STORY.fafuDuty({day:d,flags:{},stage:'law'})) days.push(d);
  H.fresh(CALENDAR.dateOf(days[0]).key,9.2,'wancai',{}); const cnt={}; let n=0;
  for(const d of days){ H.G.day=d; H.G.hour=9.2; H.G.weekday=6; H.said=[]; if(!STORY.fafuWatchable(H.G)) continue; await STORY.fafuWatch(GM); n++; for(const s of H.said){ const k=(s.who?s.who+'：':'')+s.t; cnt[k]=(cnt[k]||0)+1; } }
  console.log('旁觀次數',n,'LAWCLUB_SAT_VISITS',H.G.flags.LAWCLUB_SAT_VISITS,'LAWCLUB_SAT_FIVE',H.G.flags.LAWCLUB_SAT_FIVE);
  Object.entries(cnt).filter(([k,v])=>v>=3).sort((x,y)=>y[1]-x[1]).forEach(([k,v])=>console.log(v+'×',k.slice(0,60)));
  process.exit(0);
})();
