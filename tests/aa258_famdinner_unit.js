// AA_258 6-1 大二下的家族聚餐（AA258-SIS-GAPS-1031；AA 定稿「要排一場」）——不需要瀏覽器。
//   1 3/9 21:00 家族群組：Kevin「這學期的家聚！！禮拜五七點 公館那間」「學弟妹第一次來 大家要到喔」、學姊「好。」；21:00 以前沒有；不在家族群組沒有
//   2 ev_family_dinner_y2s2：3/12（五）18:30～20:30 在公館才演；旁白＋Kevin＋學姊「坐。我坐下來你們再坐。」＋旁白；不在家族群組不演
//   3 演過以後學姊 S4-L8 的 linesIf（ladder.js「……你也看到了。」）條件成立
// 修改前（開發分支 9f3cf6e76）：沒有這個事件與群組訊息——FAIL。用法：node tests/aa258_famdinner_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k);
const ev=STORY_EVENTS.find(e=>e.id==='ev_family_dinner_y2s2');
check('0. 有 ev_family_dinner_y2s2（公館、大二下第 3 週週五、一次）',!!ev&&ev.location==='gongguan'&&J(ev.term)===J(['Y2S2'])&&J(ev.weeks)===J([3])&&J(ev.weekday)===J([5])&&ev.once===true);
(async()=>{
  const G=H.fresh('2027-03-09',20.9,'dorm',{}); PHONE.join(G,'family_law'); STORY.phoneRules(GM); PHONE.tick(G); const n0=H.msgs('g:family_law').length;
  G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(G); const L=H.msgs('g:family_law').slice(-3);
  check('1. 3/9 21:00 Kevin 兩則＋學姊「好。」；21:00 以前沒有',J(L)===J(['這學期的家聚！！禮拜五七點 公館那間','學弟妹第一次來 大家要到喔','好。'])&&!(G.msgs||[]).some(m=>m.tag==='fam_dinner_y2s2_invite'&&m.h<21),J([n0,L]));
  const G2=H.fresh('2027-03-09',21.1,'dorm',{}); STORY.phoneRules(GM); PHONE.tick(G2); check('1. 不在家族群組：沒有',!(G2.msgs||[]).some(m=>m.tag==='fam_dinner_y2s2_invite'));
  if(!ev){ H.done(); return; }
  const ck=(k,h,zone,inGrp)=>{ const g=H.fresh(k,h,zone,{}); if(inGrp) PHONE.join(g,'family_law'); return EVENTS.check(ev); };
  const r=[ck('2027-03-12',19,'gongguan',true),ck('2027-03-12',18,'gongguan',true),ck('2027-03-12',21,'gongguan',true),ck('2027-03-12',19,'campus',true),ck('2027-03-12',19,'gongguan',false),ck('2027-03-19',19,'gongguan',true)];
  check('2. 3/12 18:30～20:30 在公館、在家族群組才演（18:00、21:00、校園、不在群組、下一週都不演）',J(r)===J([true,false,false,false,false,false]),J(r));
  H.fresh('2027-03-12',19,'gongguan',{}); H.said=[]; await EVENTS.runLines(ev.dialogue,ev);
  check('2. 旁白→Kevin「坐啦坐啦，她又不是教授。」→學姊「坐。我坐下來你們再坐。」→旁白',J(H.said.map(s=>s.t))===J(['（長桌的一頭坐著四個大一的學弟妹。學姊進門的時候，他們同時站了起來。）','坐啦坐啦，她又不是教授。','坐。我坐下來你們再坐。','（她坐下來。學弟妹又站了一次，才坐好。）']),J(H.lines()));
  const row=(LADDER.rows||LADDER.heroine_05||null);
  const src=require('fs').readFileSync(require('path').join(H.ROOT,'src/data/ladder.js'),'utf8');
  const G3=H.fresh('2027-04-01',15,'campus',{}); G3.events.done.ev_family_dinner_y2s2=1;
  check('3. 學姊 S4-L8 的 linesIf 看 ev_family_dinner_y2s2：演過＝條件成立',/"events": \["ev_family_dinner_y2s2"\]/.test(src)&&EVENTS.cond({events:['ev_family_dinner_y2s2']}));
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
