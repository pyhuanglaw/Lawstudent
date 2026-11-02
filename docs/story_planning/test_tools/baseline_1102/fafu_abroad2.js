const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
for(const [route,key] of [['JP','2028-04-08'],['US','2028-10-07']]){
  H.fresh(key,8.5,'dorm',{lawclub:true,EXCHANGE_ROUTE:route,EXCH_RULE:1,EXCH_APPLIED_DAY:STORY.dayOfKey('2027-12-01')});
  STORY.phoneRules(GM); H.G.hour=8.8; const q=OUT.due(H.G);
  console.log(route,key,'STORY.abroad',STORY.abroad(H.G),'fafuMember',STORY.fafuMember(H.G),'OUT.due→',q?q.title:null);
}
process.exit(0);
