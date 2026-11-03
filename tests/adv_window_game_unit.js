// 略過對話按鈕、事件 CG 解鎖：GAME 是最外層 const，不在 window 上（BB 2026-11-02 CC_31）。用法：node tests/adv_window_game_unit.js
// 修改前：1b、2、3、4 FAIL。
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global;   /* window＝global；GAME 用最外層 const 宣告，所以 window.GAME 是 undefined（和瀏覽器一樣）*/ global.self=global; global.location={search:''}; global.navigator={userAgent:'node'};
/* adv3d.js 用到的最小 DOM：建元素、class、加子元素、找 img、innerHTML 清空；Image 照 repo 裡有沒有檔決定 onload／onerror */
class El{ constructor(t){ this.tagName=String(t).toUpperCase(); this.children=[]; this.style={}; this.id=''; this.textContent=''; this.cls=new Set(); this.src=''; this.onclick=null; }
  get className(){ return [...this.cls].join(' '); } set className(v){ this.cls=new Set(String(v).split(/\s+/).filter(Boolean)); }
  get classList(){ const s=this.cls; return {add:(...c)=>c.forEach(x=>s.add(x)),remove:(...c)=>c.forEach(x=>s.delete(x)),contains:c=>s.has(c),toggle:(c,f)=>{ const on=f===undefined?!s.has(c):!!f; if(on) s.add(c); else s.delete(c); return on; }}; }
  appendChild(c){ this.children.push(c); return c; }
  querySelector(sel){ const T=sel.toUpperCase(); const walk=n=>{ for(const c of n.children){ if(c.tagName===T) return c; const r=walk(c); if(r) return r; } return null; }; return walk(this); }
  set innerHTML(v){ this.children=[]; } get innerHTML(){ return ''; } }
global.document={createElement:t=>new El(t),head:new El('head'),body:new El('body'),getElementById:()=>null,addEventListener(){}};
global.Image=class{ constructor(){ this.onload=null; this.onerror=null; this._s=''; } get src(){ return this._s; }
  set src(u){ this._s=u; setTimeout(()=>{ if(fs.existsSync(path.join(ROOT,u))){ if(this.onload) this.onload(); } else if(this.onerror) this.onerror(); },0); } };
const load=f=>vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f});
for(const f of ['src/data/characters.js','src/data/portrait_manifest.js','src/social3d.js','src/adv3d.js']) load(f);
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* 瀏覽器裡 game3d.js 是最外層的 const GAME＝不在 window 上。這裡用同樣的寫法（runInThisContext 的最外層 const）宣告 GAME，window.GAME 是 undefined。 */
vm.runInThisContext("const GAME={G:{v:3,day:0,hour:12,flags:{},choices:{},events:{done:{}},name:'祐廷',rel:{},social:null,stage:'law',cg:{unlocked:[]}},advN:0,dlgAdvance(){ this.advN++; return true; }};");
(async()=>{
  check('0. 測試環境和瀏覽器一樣：GAME 有、window.GAME 沒有',typeof GAME!=='undefined'&&global.window.GAME===undefined);
  SOCIAL.bind(GAME.G);
  /* 1 略過對話：按鈕 onclick 要呼叫 GAME.dlgAdvance（BB 2026-11-02 CC_31：原本 window.GAME 永遠 false，按了停在原句） */
  ADV.begin({background:'blur'});
  const find=(n,p)=>{ for(const c of n.children||[]){ if(p(c)) return c; const r=find(c,p); if(r) return r; } return null; };
  const btn=find(document.body,c=>c.textContent==='略過對話'&&typeof c.onclick==='function');
  check('1a. 找得到「略過對話」按鈕',!!btn);
  if(btn){ btn.onclick(); check('1b. 按「略過對話」：ADV.skip＝true、GAME.dlgAdvance 被呼叫',ADV.skip===true&&GAME.advN===1,'advN='+GAME.advN); }
  ADV.end();
  /* 2 事件 CG 播過要記進 G.cg.unlocked（相簿讀這個；原本從來沒記） */
  const id='cg_snow_steps_heroine05';
  ADV.begin({background:'blur'}); ADV.cg(id); await sleep(60); ADV.end();
  check('2. 事件 CG 播過以後記進 GAME.G.cg.unlocked',GAME.G.cg.unlocked.includes(id),JSON.stringify(GAME.G.cg.unlocked));
  /* 3 src 裡不要再有 window.<最外層 const> 的判斷 */
  const bad=[]; for(const f of fs.readdirSync(path.join(ROOT,'src'))) if(f.endsWith('.js')){ const t=fs.readFileSync(path.join(ROOT,'src',f),'utf8'); for(const m of t.matchAll(/window\.(GAME|STORY|ADV|EVENTS|SOCIAL|E3|Z3|OUT|DATE|PHONE)\b(?!\s*=[^=])/g)) bad.push(f+':'+m[0]); }
  check('3. src 沒有 window.GAME／STORY／ADV… 這種讀法（最外層 const 不在 window 上）',!bad.length,bad.join(' '));
  /* 4 舊存檔補記：只補三個「播過才會設」的旗標，沒有旗標的不多出來（BB 2026-11-02） */
  { const s1={flags:{AN_VDAY_CG:true,YT_CG20:true,PS_WHITE_CG:true},cg:{unlocked:['cg_plg_rules']}}; const n=ADV.backfillCG(s1);
    check('4a. 帶三個旗標的舊存檔：相簿補進那三張、原本的照留',n===3&&['cg_valentine_taichung_heroine01','cg_saved_seat_heroine03','cg_last_page_peishan','cg_plg_rules'].every(x=>s1.cg.unlocked.includes(x)),JSON.stringify(s1.cg.unlocked));
    const s2={flags:{dating_heroine_01:true}}; ADV.backfillCG(s2);
    check('4b. 沒有旗標的舊存檔：相簿不多出來',!s2.cg||!(s2.cg.unlocked||[]).length,JSON.stringify(s2.cg));
    const s3={flags:{AN_VDAY_CG:true},cg:{unlocked:['cg_valentine_taichung_heroine01']}}; ADV.backfillCG(s3);
    check('4c. 已經有的不重複',s3.cg.unlocked.length===1);
    check('4d. 補記的三張都有登錄',Object.values(ADV.CG_SEEN_FLAGS).every(id=>!!CG_REGISTRY[id]));
    const g=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), m=g.slice(g.indexOf('function migrate(s)'),g.indexOf('function migrate(s)')+20000);
    check('4e. game3d.js 的 migrate 有呼叫 ADV.backfillCG',/ADV\.backfillCG\(s\)/.test(m)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
