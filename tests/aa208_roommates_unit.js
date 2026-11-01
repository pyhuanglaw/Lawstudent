// AA_208 四人房室友：歷史複核（AA208-L）缺的三處旁白——不需要瀏覽器。台詞逐字照企劃線 AA_208（讀得到就比對稿）。
//   1 大一寒假返鄉：1/2 人在 203＝「（阿哲的籃球不在了。）」；1/9＝「（柏翰的床鋪捲起來了，桌上只剩檯燈。）」；只有那一天、只有法律系階段、只演一次
//   2 大二搬進 312：拆箱以前兩句室友旁白（阿哲的籃球、柏翰的檯燈；大一學弟講電話），接著才拿東西
// 修改前（開發分支 d1e842ba5）：沒有這兩個事件、unboxY2 沒有室友旁白——FAIL。用法：node tests/aa208_roommates_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
let doc=''; try{ doc=cp.execSync('git show origin/claude/cool-heisenberg-o8kuqx:"docs/story_planning/AA_208_宿舍四人房_室友.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ doc=''; }
const inDoc=t=>!doc||doc.includes(t);
const said=()=>H.said.map(s=>s.t);
(async()=>{
  const ZE=STORY_EVENTS.find(e=>e.id==='ev_y1w_zhe_left'), BE=STORY_EVENTS.find(e=>e.id==='ev_y1w_bh_left');
  check('0. 事件 ev_y1w_zhe_left、ev_y1w_bh_left 存在',!!ZE&&!!BE);
  if(!ZE||!BE) H.done();
  const at=(key,zone,flags)=>{ H.fresh(key,15,zone||'dorm',flags||{}); return { z:EVENTS.check(ZE), b:EVENTS.check(BE) }; };
  { const a=at('2026-01-02'), b=at('2026-01-01'), c=at('2026-01-03'), d=at('2026-01-02','campus'), e=at('2026-01-02','dorm',{}); GM.G.stage='econ'; const f=EVENTS.check(ZE);
    check('1. 阿哲：1/2 人在 203 才有；1/1、1/3、校園、經濟系階段都沒有',a.z&&!b.z&&!c.z&&!d.z&&!f&&!a.b,J({a,b,c,d,f}));
    const g=at('2026-01-09'), h=at('2026-01-08'), i=at('2026-01-10'); check('1. 柏翰：1/9 人在 203 才有；1/8、1/10 沒有',g.b&&!h.b&&!i.b&&!g.z,J({g,h,i}));
    H.fresh('2026-01-02',15,'dorm',{}); H.said=[]; await EVENTS.runLines(ZE.dialogue,ZE); const zl=said(); H.said=[]; await EVENTS.runLines(BE.dialogue,BE); const bl=said();
    check('1. 旁白逐字（照 AA_208 第 2-4 節）',J(zl)===J(['（阿哲的籃球不在了。）'])&&J(bl)===J(['（柏翰的床鋪捲起來了，桌上只剩檯燈。）'])&&inDoc('「（阿哲的籃球不在了。）」')&&inDoc('「（柏翰的床鋪捲起來了，桌上只剩檯燈。）」'),J([zl,bl]));
    check('1. 只演一次（once）',ZE.once===true&&BE.once===true); }
  { const G=H.fresh('2026-09-06',15,'dorm',{}); H.said=[]; H.picks=[]; const ok=await STORY.unboxY2(GM); const L=said();
    const want=['（312。阿哲的籃球已經滾到門口了，柏翰的檯燈放在靠窗那張書桌上。）','（另一組床桌是一個大一的學弟，正在跟他媽媽講電話。）'];
    check('2. 大二搬進 312：拆箱以前先兩句室友旁白（照 AA_208 第 7 節），最後照舊「一年。房間比去年滿一點。」',ok&&J(L.slice(0,2))===J(want)&&L[L.length-1]==='一年。房間比去年滿一點。'&&want.every(t=>inDoc('「'+t+'」')),J(L.slice(0,4))); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
