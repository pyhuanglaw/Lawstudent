// 唯讀基準：交換（日本 2028-03-25～08-05、美國 2028-08-02～12-23）期間，社員在值班週六還會不會被排出發選單
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
const sats=(term)=>{ const r=CALENDAR.termDays(term), L=[]; for(let d=r.from; d<=r.to; d++) if(STORY.fafuDuty({day:d,flags:{},stage:'law'})) L.push(d); return L; };
for(const [route,term] of [['JP','Y3S2'],['US','Y4S1'],['TW','Y3S2']]){
  const L=sats(term), res=[];
  for(const d of L){ H.fresh(CALENDAR.dateOf(d).key,8.5,'dorm',{lawclub:true,EXCHANGE_ROUTE:route,EXCH_RULE:1,EXCH_APPLIED_DAY:STORY.dayOfKey('2027-12-01')});
    STORY.phoneRules(GM); const q=OUT.get(H.G,'fafu_'+d); res.push(CALENDAR.dateOf(d).key.slice(5)+(q?'✓':'·')+(STORY.fafuShiftable(H.G)?'S':'')); }
  console.log(route,term,'出發選單✓／可坐圓桌S：',res.join(' '));
}
process.exit(0);
