// HUD 兩行（#goal 第一行、#nextClass 第二行）人在日本照交換學校的課表（BUG-US-NEXTCLASS-1025；BB-B 2026-10-25 R38_HUD_JP：第二行對了、第一行還是「今天沒有課」）——不需要瀏覽器。用法：node tests/jp_hud_unit.js
// 修改前（f66ab34c6）：1、2 FAIL。
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
let toasts=[]; GM.toast=t=>{ toasts.push(t); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js']) load(f);   /* 照 index.html 的順序（jp3d.js 在 r2y3b3d.js 之後）*/
const hasFiles=fs.existsSync(path.join(H.ROOT,'src/jp3d.js'))&&fs.existsSync(path.join(H.ROOT,'src/data/jp_events.js'));
if(hasFiles){ load('src/data/jp_events.js'); load('src/jp3d.js'); }
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
check('0. src/jp3d.js、src/data/jp_events.js 載入；事件登記；index.html 在 GAME.boot 之前載入；story3d.js 在事件包 TICKS 之後叫 JP.tick；home3d.js 的 loop 叫 JP.homeRound；PHONE_RULES 有 JP',
  hasFiles&&typeof JP!=='undefined'&&Array.isArray(JP_EVENTS)&&JP_EVENTS.length>=13&&JP_EVENTS.every(id=>STORY_EVENTS.some(e=>e.id===id))&&typeof STORY.inJapan==='function'
  &&/src\/data\/jp_events\.js[\s\S]*src\/jp3d\.js[\s\S]*GAME\.boot\(\)/.test(src('index.html'))&&/STORY\.TICKS'[^\n]*\n[^\n]*JP\.tick\(GM\)/.test(src('src/story3d.js'))&&/JP\.homeRound\(GM\)/.test(src('src/home3d.js'))&&STORY.PHONE_RULES.length>0);
if(H.fails){ H.done(); }
const S=JP, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const fresh=(key,h,zone,route,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'JP',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; G.visited={}; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; toasts=[]; caps.length=0; HOME.rec(G); return G; };
const at=(key,h)=>H.at(key,h);
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const has=t=>H.said.some(s=>s.t===t);
const idx=t=>H.said.findIndex(s=>s.t===t);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const run=async id=>{ H.said=[]; H.opts=[]; H.cgs=[]; await EVENTS.run(ev(id)); };
const date=id=>H.date(id);
const repairMode=()=>{ date('heroine_01'); ROM.end(H.G,'heroine_01','test'); };   /* 日本路線的挽回中：交往過、出發前分開（AA_253 第 5 節）*/
const inJapan=(key,h,flags,dating)=>{ const G=fresh(key,h,'jp_hub','JP',Object.assign({X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'},flags||{})); H.FAMILIAR('heroine_01'); if(dating!==false) date('heroine_01'); else repairMode(); return G; };
const NC={dataset:{},textContent:'',cl:new Set(),get classList(){ const s=this.cl; return {add:c=>s.add(c),remove:c=>s.delete(c)}; }};
document.getElementById=id=>id==='nextClass'?NC:null;
(async()=>{
  /* 2028-04-11（二）09:00 日本：10:40 日本法入門；4/12（三）08:30：09:00 日本語（BB-B 10-25 R38_HUD_JP）*/
  let G=inJapan('2028-04-11',9); GM.titleIdle=false; CLS.updateHUD(GM); const n1=NC.textContent, g1=CLS.goalFor(G).text;
  check('1. 日本 4/11 09:00：第二行「下一堂 10:40 日本法入門…」、第一行（goalFor）「今天的課：…日本法入門…」——兩行一致，不是「今天沒有課」',/日本法入門/.test(n1)&&/今天的課：.*日本法入門/.test(g1)&&!/今天沒有課/.test(g1),JSON.stringify({n1,g1}));
  G=inJapan('2028-04-12',8.5); CLS.updateHUD(GM); const n2=NC.textContent, g2=CLS.goalFor(G).text;
  check('2. 日本 4/12 08:30：第二行「現在可以上課：09:00 日本語（中級）」、第一行有日本語',/現在可以上課：09:00 日本語/.test(n2)&&/日本語/.test(g2)&&!/今天沒有課/.test(g2),JSON.stringify({n2,g2}));
  G=inJapan('2028-04-15',10); CLS.updateHUD(GM); const n3=NC.textContent, g3=CLS.goalFor(G).text;
  check('3. 日本週六（沒課）：兩行都是「今天沒有課」',n3==='今天沒有課'&&/^今天沒有課/.test(g3),JSON.stringify({n3,g3}));
  H.done();
})();
