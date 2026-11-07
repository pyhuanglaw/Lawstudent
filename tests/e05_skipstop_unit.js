// 經濟系 9/20 回了可昕以後「跳過時間」停在見面前 10 分鐘（Y0-E05-BIKE-LOCATION-1107；BB-B 11-07 17:20 P3：回了自己按「等到晚上（20:00）」不停，睡覺時才演 E05）——不需要瀏覽器（D131）。
// 檢查：1 回了（排了見面）：CLS.skipStops 到 20:00 有一個停點＝見面前 10 分鐘、寫「約好的時間：普通教學館前」；2 E05 演過、或 self（沒回／沒到）：沒有這個停點；
//       3 見面不是今天：沒有。修改前 1 FAIL。用法：node tests/e05_skipstop_unit.js
const H=require('./pg_harness.js'); const {check,GM}=H; const J=JSON.stringify;
const setup=()=>{ const G=H.fresh('2024-09-20',17+4/60,'dorm'); G.stage='econ'; G.flags.E05_MEET=STORY.E05_OPTS[0].k; STORY.e05Plan(G); return G; };
{ const G=setup(); const m=STORY.e05Meet(G); const st=CLS.skipStops(GM,20), s=st.find(x=>/普通教學館前/.test(x.why||''));
  check('1. 回了「我過去。」（10 分鐘後見面）：跳到 20:00 停在見面前 1 分鐘（來不及提前 10 分鐘）、寫「約好的時間：普通教學館前」',!!m&&!!s&&Math.abs(s.h-(m.t-G.day*24-1/60))<1e-6&&st[0]===s,J({m,st})); }
{ const G=H.fresh('2024-09-20',17+4/60,'dorm'); G.stage='econ'; G.flags.E05_MEET=STORY.E05_OPTS[1].k; STORY.e05Plan(G); const m=STORY.e05Meet(G), s=CLS.skipStops(GM,20).find(x=>/普通教學館前/.test(x.why||''));
  check('1b. 回了「等我一下，我騎過去。」（20 分鐘後）：停在見面前 10 分鐘',!!m&&!!s&&Math.abs(s.h-(m.t-G.day*24-1/6))<1e-6,J({m,s})); }
{ const G=setup(); G.flags.E05_OPEN='self'; const a=CLS.skipStops(GM,20).some(x=>/普通教學館前/.test(x.why||'')); const G2=setup(); (G2.events.done||(G2.events.done={})).ev_y0_e05=1; G2.flags.E05_DAY=G2.day; const b=CLS.skipStops(GM,20).some(x=>/普通教學館前/.test(x.why||''));
  check('2. self、E05 演過：沒有這個停點',!a&&!b,J([a,b])); }
{ const G=setup(); G.day+=1; const c=CLS.skipStops(GM,20).some(x=>/普通教學館前/.test(x.why||'')); check('3. 見面不是今天：沒有',!c); }
H.done();
