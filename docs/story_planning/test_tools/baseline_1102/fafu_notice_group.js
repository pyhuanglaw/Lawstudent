const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js'); const {GM}=H;
(async()=>{
  for(const key of ['2025-10-15','2027-10-06']){
    H.fresh(key,15,'wancai',{}); await STORY.interact({notice:'lawclub'},GM); STORY.phoneRules(GM);
    console.log(key,'看公告→ lawclub',H.G.flags.lawclub,'SIS_CLUB_EXPO',!!H.G.flags.SIS_CLUB_EXPO,'法服群組',PHONE.inGroup(H.G,'lawclub_study'),'fafuMember(當天)',STORY.fafuMember(H.G));
  }
  process.exit(0);
})();
