// 她主動約、你回「改天」以後可以自己選日子，地點照她說的（HER-ASK-LATER-DAY-1110，使用者 2026-11-10 X282「沒辦法選哪天」；附可昕私訊截圖：她回「好。哪天。」以後沒有地方選）——不需要瀏覽器（D131）。
// src/heroine_asks3d.js（S.onInv 回 flowPlace、S.redoBooked）、src/invites3d.js（S.answer 帶 flowPlace、S.flow 的 fo.place）、src/game3d.js（手機回覆按鈕把 flowPlace 交給 INV.flow）。
//   1 她主動約（HASK）、回改天：INV.answer 回 {res:'later', flowPlace:她說的地點}（不是 noFlow）
//   2 INV.flow(…,{place})：不出地點選單，第一個選單就是時間（今天、明天…、其他日子…、算了）
//   3 選了時間＝約好同一個地點（by player）
//   4 自己約好了同一個地點：3 天後她不再約（redo 標 done）
//   5 選日子的時候按「算了」：照舊 3 天後同一個地點她再約
//   6 game3d.js：改天的按鈕把 flowPlace 交給 INV.flow（{place:r.flowPlace}）
// 修改前 1、2、3、4、6 FAIL。用法：node tests/her_ask_later_day_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
for(const [f,n] of [['src/data/heroine_asks.js','HASK_DATA'],['src/heroine_asks3d.js','HASK']]){ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); }   /* [前置] 和 tests/heroine_asks_unit.js 同一個載法 */
const wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); };
const R=()=>HASK.rec(H.G);
const sent=()=>R().sent.filter(x=>x.state!=='dropped'&&x.state!=='planned');
const friend=id=>{ const r=SOCIAL.rel(id); Object.assign(r,{fam:45,trust:30,comf:10,npcRom:0,rom:0}); SOCIAL.remember(id,'FIRST_MET',''); H.G.contacts[id]=H.G.day-1; };
const fresh=(k,h)=>{ const G=H.fresh(k,h,'dorm'); INV.rec(G); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.trips)) G.trips=[]; return G; };
const day=d=>{ at(d,12); HASK.phone(H.G); at(d,23.98); HASK.phone(H.G); };
const firstAsk=()=>{ const G=fresh('2025-09-22',9); friend('heroine_01'); let d=G.day, x=null; for(let n=0;n<20&&!x;n++,d++){ day(d); x=sent().find(q=>q.id==='heroine_01'&&q.k!=='o'); } return {G,x,d}; };
(async()=>{
  /* ---- 1 ---- */
  { const {G,x}=firstAsk(); const r=x?INV.answer(G,x.iv,'later'):null;
    check('1. 她主動約、回改天：{res:later, flowPlace:她說的地點}（不是 noFlow）',!!r&&r.res==='later'&&!r.noFlow&&r.flowPlace===x.place,J({r,place:x&&x.place})); }
  /* ---- 2、3、4 ---- */
  { const {G,x,d}=firstAsk(); const r=INV.answer(G,x.iv,'later'); at(G.day,10); H.opts=[]; H.picks=[0,0,0,0]; H.said=[];
    const out=await INV.flow(GM,'heroine_01',null,false,{place:r.flowPlace}); const o0=H.opts[0]||[];
    check('2. 地點已經定了：第一個選單就是時間（有「算了」、沒有地點的分類）',o0.length>=2&&o0[o0.length-1]==='算了'&&!o0.some(t=>/念書|吃飯|喝咖啡|出去玩/.test(t)),J(o0));
    const iv=(G.invites||[]).filter(v=>v.who==='heroine_01'&&v.by==='player').slice(-1)[0];
    check('3. 選了時間＝約好同一個地點（by player）',!!iv&&iv.place===x.place&&['accepted','going'].includes(iv.state),J(iv&&{place:iv.place,st:iv.state,day:iv.day,h:iv.h}));
    const rd=R().redo.find(q=>q.sid===x.sid); HASK.redoCands(G,rd?rd.due:G.day+3);
    check('4. 自己約好了同一個地點：3 天後她不再約（redo 標 done）',!!rd&&rd.done===true,J(rd)); }
  /* ---- 5 ---- */
  { const {G,x}=firstAsk(); const r=INV.answer(G,x.iv,'later'); at(G.day,10); H.opts=[]; H.picks=[99];
    await INV.flow(GM,'heroine_01',null,false,{place:r.flowPlace}); const rd=R().redo.find(q=>q.sid===x.sid);
    check('5. 選日子的時候按「算了」：redo 還在（3 天後同一個地點她再約）',!!rd&&!rd.done&&rd.place===x.place&&!(G.invites||[]).some(v=>v.who==='heroine_01'&&v.by==='player'),J(rd)); }
  /* ---- 6 ---- */
  { const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    check('6. game3d.js：改天的按鈕把 flowPlace 交給 INV.flow',/INV\.flow\(GM,v\.who,null,false,r\.flowPlace\?\{place:r\.flowPlace\}:undefined\)/.test(g)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
