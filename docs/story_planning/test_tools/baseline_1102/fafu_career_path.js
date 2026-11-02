// 唯讀基準：法服週六次數（LAWCLUB_SAT_VISITS）會不會改變畢業後第一份工作／尾聲的路（PG.path）
const LW='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
require(LW+'/tests/alison.js'); const H=require(LW+'/tests/pg_harness.js');
const show=(label,flags,study)=>{ H.fresh('2030-09-30',20,'dorm',Object.assign({BAR_YEAR:2029},flags)); if(study!=null) H.G.stats.study=study;
  const c=STORY.careerLean(H.G); console.log(label.padEnd(36),'lean',JSON.stringify(c),'path',PG.path(H.G),'first:',(POSTGRAD_LINES.FIRST.me||{})[PG.path(H.G)]); };
show('沒去過法服、沒自習',{},0);
show('法服週六 1 次',{LAWCLUB_SAT_VISITS:1},0);
show('法服週六 12 次',{LAWCLUB_SAT_VISITS:12},0);
show('自習 120 小時、法服 0',{STUDY_AT_LAW:0},120);
show('自習 120 小時、法服 12',{STUDY_AT_LAW:0,LAWCLUB_SAT_VISITS:12},120);
show('自習 120 小時、法服 13',{STUDY_AT_LAW:0,LAWCLUB_SAT_VISITS:13},120);
H.fresh('2027-10-24',10,'wancai',{lawclub:true}); console.log('fafuDuty 10/24',STORY.fafuDuty(H.G),'member',STORY.fafuMember(H.G));
