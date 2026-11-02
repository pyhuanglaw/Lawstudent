// 唯讀基準：只看萬才館公告欄（notice:'lawclub'）會不會變成法服社員；大二起每個值班週六 08:30 有出發選單；連續三次沒去柏翰私訊；「先不排我」只管一學期
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
(async()=>{
  H.fresh('2025-09-20',10,'wancai',{}); await STORY.interact({notice:'lawclub'},GM);
  console.log('Y1 看公告後 flags.lawclub',H.G.flags.lawclub,'CLUB_lawclub_study',H.G.flags.CLUB_lawclub_study,'said',JSON.stringify(H.said.map(s=>s.t.slice(0,30))));
  const F0=Object.assign({},H.G.flags);
  // 大二上：每一個值班週六 08:30 的出發選單
  const days=[3,5,7,9,11,13,15].map(w=>TD('Y2S1',w,6)); const out=[];
  H.fresh('2026-09-20',8.5,'dorm',{lawclub:true});
  for(const d of days){ H.G.day=d; H.G.hour=8.5; H.G.weekday=6; STORY.phoneRules(GM); const q=OUT.get(H.G,'fafu_'+d); out.push(CALENDAR.dateOf(d).key+':'+(q?q.title+'/'+q.no:'-')); H.G.hour=12.5; STORY.phoneRules(GM); }
  console.log('只有 lawclub（看過公告）的大二上：',out.join(' | '));
  PHONE.tick(H.G); console.log('FAFU_TRK',JSON.stringify(H.G.flags.FAFU_TRK),'sent fafu_bohan_Y2S1',PHONE.sent(H.G,'fafu_bohan_Y2S1'),'柏翰私訊',JSON.stringify(H.msgs('p:classmate_bohan')));
  // 下學期第一週
  H.G.flags.FAFU_OFF='Y2S1'; const d1=TD('Y2S2',1,1); H.G.day=d1; H.G.hour=13; STORY.phoneRules(GM); H.G.hour=14; PHONE.tick(H.G); console.log('先不排我(Y2S1) 之後 Y2S2 第1週：FAFU_OFF',H.G.flags.FAFU_OFF,'sent fafu_bohan_Y2S2',PHONE.sent(H.G,'fafu_bohan_Y2S2'),'柏翰私訊',JSON.stringify(H.msgs('p:classmate_bohan')));
  // 次數統計：大二～大四一共有幾個值班週六
  const a=CALENDAR.termDays('Y2S1').from, b=CALENDAR.termDays('Y4S2').to; let n=0, per={}; for(let d=a; d<=b; d++){ const g={day:d,flags:{},stage:'law'}; if(STORY.fafuDuty(g)){ n++; const t=CALENDAR.termOf(d).id; per[t]=(per[t]||0)+1; } }
  let y1=0; for(let d=CALENDAR.termDays('Y1S1').from; d<a; d++){ if(STORY.fafuDuty({day:d,flags:{},stage:'law'})) y1++; }
  console.log('值班週六：大一',y1,'大二～大四',n,JSON.stringify(per));
  process.exit(0);
})();
