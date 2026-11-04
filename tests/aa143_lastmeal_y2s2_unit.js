// AA_143 2-7 大二下期末最後一頓（AA143-Y2S2-LASTMEAL-1031；HISTORY-AUDIT 第 3 批 tier 4）——不需要瀏覽器。
//   1 事件 ev_term_last_meal_y2s2：最後一科考完以後走進麵店才演；考完以前、麵店團沒成立（noodleTableDay）不演；阿姨「明年你們大三了。……我記得你們大一的樣子。」
//   2 最後一科考完那天 17:00 阿哲「考完了 七點，燒臘店」（同大二上）；17:00 以前沒有；麵店團沒成立不傳
// 修改前（開發分支 4e9ac022d）：沒有這個事件、沒有那則——FAIL。用法：node tests/aa143_lastmeal_y2s2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
const keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const ev=STORY_EVENTS.find(e=>e.id==='ev_term_last_meal_y2s2');
check('0. 有 ev_term_last_meal_y2s2（麵店、enter、大二下、一次）',!!ev&&ev.location==='noodle'&&ev.trigger==='enter'&&J(ev.term)===J(['Y2S2'])&&ev.once===true);
(async()=>{
  const G0=H.fresh('2027-06-01',10,'noodle',{noodleTableDay:1}); const e=CLS.lastExamEnd(G0,'Y2S2','final');
  check('0. 大二下有最後一科期末考',!!e,J(e));
  if(!ev||!e){ H.done(); return; }
  const at=(h,flags)=>{ const G=H.fresh(keyOf(e.day),h,'noodle',flags||{noodleTableDay:1}); return EVENTS.check(ev); };
  const before=at(Math.max(0,e.h-0.5)), after=at(Math.max(17,e.h+0.1)), noTeam=at(Math.max(17,e.h+0.1),{});
  check('1. 最後一科考完以後走進麵店＝演；考完以前、麵店團沒成立＝不演',!before&&after&&!noTeam,J([before,after,noTeam,e]));
  H.fresh(keyOf(e.day),19,'noodle',{noodleTableDay:1}); H.said=[]; await EVENTS.runLines(ev.dialogue,ev);
  check('1. 阿姨「明年你們大三了。……我記得你們大一的樣子。」',H.said.some(s=>s.who==='阿姨'&&s.t==='明年你們大三了。……我記得你們大一的樣子。'),J(H.lines()));
  const G=H.fresh(keyOf(e.day),16.9,'dorm',{noodleTableDay:1}); STORY.phoneRules(GM); PHONE.tick(G); const n0=(G.msgs||[]).filter(m=>m.tag==='y2s2_final_ask').length;
  G.hour=17.1; STORY.phoneRules(GM); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='y2s2_final_ask');
  check('2. 那天 17:00 阿哲「考完了 七點，燒臘店」；17:00 以前沒有',n0===0&&!!m&&m.text==='考完了 七點，燒臘店'&&m.from==='zhe',J(m));
  const G2=H.fresh(keyOf(e.day),17.1,'dorm',{}); STORY.phoneRules(GM); PHONE.tick(G2);
  check('2. 麵店團沒成立：不傳',!(G2.msgs||[]).some(x=>x.tag==='y2s2_final_ask'));
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
