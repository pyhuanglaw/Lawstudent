// AA_403「這一段你來講」：ev_grad_debate 的兌現（企劃線 720f32472；任務 AA389-REST-L-1023）——不需要瀏覽器。
//   W3_STANCE 'no'、ev_grad_debate 演完 3 天以後、大二上結束以前，在總圖／萬才館／Café 找她說話＝ev_grad_debate_teach；兩個選項；記 W3_TAUGHT、記憶；尊重 +4、熟悉 +2；交往中多一行
// 修改前（開發分支 a887134f8）：沒有這個事件（全部 FAIL）。用法：node tests/aa403_grad_debate_teach_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const cp=require('child_process');
const {check}=H, J=JSON.stringify, ID='heroine_05';
const D=k=>STORY.dayOfKey(k);
const ev=STORY_EVENTS.find(e=>e.id==='ev_grad_debate_teach');
let doc=''; try{ doc=cp.execSync('git show 720f32472:"docs/story_planning/AA_403_這一段你來講_ev_grad_debate的兌現.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
(async()=>{
  check('0. 事件存在、地點和 ev_grad_debate 一樣、interact、once',!!ev&&J(ev.location)===J(STORY_EVENTS.find(e=>e.id==='ev_grad_debate').location)&&ev.trigger==='interact'&&ev.once===true);
  const q=[...J(ev||{}).matchAll(/"text":"([^"]+)"/g)].map(m=>m[1]); check('0. 每一句都在稿裡（一字不差）',!!doc&&q.length>=10&&q.every(t=>doc.indexOf(t.replace(/^「|」$/g,''))>=0),J(q.filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0)));
  const at=(key,stance,last,flags)=>{ const G=H.fresh(key,15,'library',Object.assign({W3_STANCE:stance},flags||{})); H.FRIEND(ID); if(last!=null){ G.events.done.ev_grad_debate=1; G.events.last.ev_grad_debate=D(last); } return EVENTS.check(ev); };
  check('1. 「不同意」、演完 3 天以後＝有；不到 3 天＝沒有',at('2026-04-13','no','2026-04-10')&&!at('2026-04-12','no','2026-04-10'));
  check('1. 選另外兩個（diff／unsure）＝沒有；沒演過 ev_grad_debate＝沒有',!at('2026-04-13','diff','2026-04-10')&&!at('2026-04-13','unsure','2026-04-10')&&!at('2026-04-13','no',null));
  const end=CALENDAR.termDays('Y2S1'); check('1. 大二上結束以後＝沒有',at(CALENDAR.dateOf(end.to).key,'no','2026-04-10')&&!at(CALENDAR.dateOf(end.to+1).key,'no','2026-04-10'));
  at('2026-04-13','no','2026-04-10'); const r0=Object.assign({},SOCIAL.rel(ID)); H.said=[]; H.opts=[]; H.picks=[0]; await EVENTS.run(ev); const r1=SOCIAL.rel(ID); const L=H.said.map(x=>x.t);
  check('2. 「先講他想保護什麼…」→「（你講了八分鐘。…）」「……順序對了。」…「好。文章你留著。」；W3_TAUGHT order、記憶；尊重 +4、熟悉 +2',L.includes('上次說好的。這一段，你講給我聽。')&&L.includes('……順序對了。')&&L.includes('好。文章你留著。')&&H.G.flags.W3_TAUGHT==='order'&&SOCIAL.has(ID,'W3_TAUGHT')&&r1.resp-r0.resp===4&&r1.fam-r0.fam===2&&!L.includes('（她把文章推過來的時候，手指在你的鉛筆字上停了一下。）'),J({L,d:[r1.resp-r0.resp,r1.fam-r0.fam]}));
  at('2026-04-13','no','2026-04-10',{dating_heroine_05:true}); H.said=[]; H.picks=[1]; await EVENTS.run(ev); const L2=H.said.map(x=>x.t);
  check('2. 「直接講他跳過的那一步。」→「快。」…；direct；交往中多「（她把文章推過來的時候…）」',L2.includes('快。')&&H.G.flags.W3_TAUGHT==='direct'&&L2[L2.length-1]==='（她把文章推過來的時候，手指在你的鉛筆字上停了一下。）',J(L2));
  check('3. 人物頁記憶名稱 W3_TAUGHT、ZQ_TESTBUILD',!!SOCIAL.MEMORY_LABEL.W3_TAUGHT&&!!SOCIAL.MEMORY_LABEL.ZQ_TESTBUILD);
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
