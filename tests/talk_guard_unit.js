// BUG-TALK-STUCK-1104（使用者 11-04「跟別人講話或者約會就卡住」；CC CC_45 盤點）：和人說話的保護 GM.guardTalk（src/game3d.js）——不需要瀏覽器。
// 修改前：doInteract 直接 it.onInteract(it)（沒有 await、沒有 try）；說話途中丟例外＝sceneBegin 開的段落沒收＝人不能動。
// 檢查：0. doInteract 走 GM.guardTalk 1. 說話途中丟例外：深度回到按之前、ADV 關掉、記 lastTalkError、console.error（不吞）
//   2. 同一個人還在講又按一次：不開第二段 3. 正常結束：不動深度 4. 本來就在別的段落裡（d0>0）丟例外：只收這一次開的。用法：node tests/talk_guard_unit.js
const fs=require('fs'), path=require('path'); const src=fs.readFileSync(path.join(__dirname,'..','src/game3d.js'),'utf8');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
check('0. doInteract 的 onInteract（和人說話）走 await GM.guardTalk(it)',/await LIBQ\.gate\(GM,it\.npc\)\) return;[^\n]*?await GM\.guardTalk\(it\); return; \}/.test(src)&&!/\*\/ it\.onInteract\(it\); return; \}/.test(src));
const m=src.match(/GM\.guardTalk=async function\(it\)\{[\s\S]*?finally\{ if\(it\.npc\) it\.npc\._talking=false; \} \};/);
check('0. 找得到 GM.guardTalk',!!m); if(!m){ console.log('FAILED '+fails); process.exit(1); }
const mk=()=>{ const D={busyDepth:0,busyWho:[]}; const A={active:false,end(){ this.active=false; }}; const errs=[]; const GM={};
  const sceneBegin=()=>{ D.busyDepth++; D.busyWho.push('x'); A.active=true; }; const sceneEnd=()=>{ D.busyDepth=Math.max(0,D.busyDepth-1); D.busyWho.pop(); };
  const f=new Function('GM','D','sceneEnd','ADV','console',m[0]+'; return GM;'); f(GM,D,sceneEnd,A,{error:(...a)=>errs.push(a),warn:()=>{}}); return {GM,D,A,errs,sceneBegin,sceneEnd}; };
(async()=>{
  { const T=mk(); const npc={}; await T.GM.guardTalk({npc,label:'和芷若說話',onInteract:async()=>{ T.sceneBegin(); await null; throw new Error('boom'); }});
    check('1. 說話途中丟例外：深度回到 0、ADV 關掉、記 lastTalkError、console.error 一次、_talking 放開',T.D.busyDepth===0&&!T.A.active&&T.GM.lastTalkError&&T.GM.lastTalkError.msg==='boom'&&T.errs.length===1&&!npc._talking,JSON.stringify({d:T.D.busyDepth,a:T.A.active,e:T.errs.length})); }
  { const T=mk(); const npc={}; let n=0, rel; const p=new Promise(r=>rel=r); const it={npc,label:'x',onInteract:async()=>{ n++; T.sceneBegin(); await p; T.sceneEnd(); }};
    const a=T.GM.guardTalk(it); await T.GM.guardTalk(it); rel(); await a; check('2. 同一個人還在講又按一次：不開第二段（onInteract 只跑一次）、講完深度 0',n===1&&T.D.busyDepth===0,JSON.stringify({n,d:T.D.busyDepth})); }
  { const T=mk(); await T.GM.guardTalk({label:'y',onInteract:async()=>{ T.sceneBegin(); await null; T.sceneEnd(); }}); check('3. 正常結束：深度 0、沒有 error',T.D.busyDepth===0&&!T.errs.length); }
  { const T=mk(); T.sceneBegin(); await T.GM.guardTalk({label:'z',onInteract:async()=>{ T.sceneBegin(); T.sceneBegin(); throw new Error('x'); }});
    check('4. 本來就在別的段落裡（深度 1）丟例外：只收這一次開的兩段（回到 1）、ADV 不關（外面那段還在）',T.D.busyDepth===1&&T.A.active,JSON.stringify({d:T.D.busyDepth,a:T.A.active})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })();
