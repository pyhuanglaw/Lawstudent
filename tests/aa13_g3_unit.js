// AA_13 G3 大一下期末成發的觀眾群戲（AA13-G3-SHOWCASE-1031；HISTORY-AUDIT 第 3 批 tier 4）——不需要瀏覽器。
//   1 ev_ziqing_show 開頭：認識阿凱＝旁白「（阿凱坐第一排，手上拿著手機錄影。）」＋阿凱「我是來錄證據的。她說彈錯要請宵夜。」；認識 Alison＝「我等一下第三首。我好緊張，我要吐了。」；之後照舊「（後台。）」
//   2 不認識的人不出；子晴的台詞不變
//   3 收到邀請卻沒去：隔天子晴「你沒來」照舊，12:30 阿凱「你沒來。她彈錯了，然後大笑。你錯過了。」；去了的沒有
// 修改前（開發分支 490bd61de）：1、3 FAIL。用法：node tests/aa13_g3_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const {check,GM}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
const keyOf=d=>CALENDAR.dateOf(d).key;
const ev=STORY_EVENTS.find(e=>e.id==='ev_ziqing_show');
(async()=>{
  const dShow=STORY.termDay('Y1S2',14,3);
  H.fresh(keyOf(dShow),19.5,'wancai',{}); H.FAMILIAR('heroine_04'); H.FAMILIAR('kai'); H.FAMILIAR('yu'); H.said=[]; H.picks=[0]; await EVENTS.runLines(ev.dialogue,ev);
  const L=H.said.map(s=>(s.who?s.who+'：':'')+s.t);
  check('1. 觀眾席：阿凱旁白＋「我是來錄證據的。她說彈錯要請宵夜。」、Alison「我等一下第三首。我好緊張，我要吐了。」，接著「（後台。）」',L[0]==='（阿凱坐第一排，手上拿著手機錄影。）'&&/我是來錄證據的。她說彈錯要請宵夜。$/.test(L[1])&&/我等一下第三首。我好緊張，我要吐了。$/.test(L[2])&&L[3]==='（後台。）',J(L.slice(0,5)));
  H.fresh(keyOf(dShow),19.5,'wancai',{}); H.FAMILIAR('heroine_04'); H.said=[]; H.picks=[0]; await EVENTS.runLines(ev.dialogue,ev);
  check('2. 不認識阿凱、Alison：直接「（後台。）」、子晴「欸不是，我手在抖。」',H.said[0].t==='（後台。）'&&H.said[1].t==='欸不是，我手在抖。',J(H.said.slice(0,3).map(s=>s.t)));
  const G=H.fresh(keyOf(dShow),20,'dorm',{CLUB_club_guitar:true}); H.FAMILIAR('heroine_04'); H.FAMILIAR('kai'); INV.addContact(G,'kai'); INV.addContact(G,'heroine_04');
  G.day=dShow+1; G.hour=13; G.weekday=CALENDAR.dateOf(G.day).wd%7; STORY.phoneRules(GM); PHONE.tick(G);
  check('3. 沒去：子晴「你沒來」照舊；阿凱「你沒來。她彈錯了，然後大笑。你錯過了。」',H.msgs('p:heroine_04').includes('你沒來')&&H.msgs('p:kai').includes('你沒來。她彈錯了，然後大笑。你錯過了。'),J([H.msgs('p:heroine_04'),H.msgs('p:kai')]));
  const G2=H.fresh(keyOf(dShow),20,'dorm',{CLUB_club_guitar:true,ZQ_SHOW:'clap'}); H.FAMILIAR('heroine_04'); H.FAMILIAR('kai'); G2.day=dShow+1; G2.hour=13; STORY.phoneRules(GM); PHONE.tick(G2);
  check('3. 去了（ZQ_SHOW clap）：阿凱沒有那則',!H.msgs('p:kai').includes('你沒來。她彈錯了，然後大笑。你錯過了。'));
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
