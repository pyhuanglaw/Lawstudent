// 事件最後一步是 CG：事件結束以後畫面一直是模糊的 CG 底（BB-B 2026-10-25 R34_SNOW_R3B，挽回中初雪「這次我先說」）——不需要瀏覽器。用法：node tests/adv_cg_after_end_unit.js
//   events3d.js 的 CG 步驟 ADV.cg(l.cg) 不等點；adv3d.js 的 A.cg 是 loadImage(...).then(設 className='on image cg')——事件先結束（A.end 清掉 className），圖載好以後又蓋回去，
//   要等下一次 ADV.begin 才清掉。修法：then 裡 ADV 已經結束（或已經換下一段）就不蓋，圖鑑照樣解鎖。
// 修改前：1、4 FAIL。
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.location={search:''}; global.navigator={userAgent:'node'};
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

/* 事件最後一步是 CG（events3d.js 的 CG 步驟 ADV.cg 不等點）→ 事件結束（ADV.end）→ 圖這時才載好 */
(async()=>{
  const G={v:3,day:0,hour:12,flags:{},choices:{},events:{done:{}},name:'祐廷',rel:{},social:null,stage:'law',cg:{unlocked:[]}}; SOCIAL.bind(G); global.GAME={G};
  const id='cg_snow_steps_heroine05', reg=CG_REGISTRY[id];
  check('0. CG 登錄有 '+id+'、圖檔在 repo 裡',!!reg&&fs.existsSync(path.join(ROOT,reg.file)),reg&&reg.file);
  ADV.begin({background:'blur'}); ADV.cg(id); ADV.end(); await sleep(60);
  check('1. CG 是最後一步、圖載好以前 ADV 已經結束：畫面不再蓋上 CG 底（className 不是 cg）',!ADV.active&&!/\bcg\b/.test(ADV.root.className),JSON.stringify(ADV.root.className));
  check('2. 圖鑑照樣解鎖',G.cg.unlocked.includes(id),JSON.stringify(G.cg.unlocked));
  ADV.begin({background:'blur'}); ADV.cg(id); await sleep(60);
  check('3. 一般情況（ADV 還開著）：照舊顯示 CG（on image cg）',ADV.active&&/\bcg\b/.test(ADV.root.className),JSON.stringify(ADV.root.className)); ADV.end();
  ADV.begin({background:'blur'}); ADV.cg(id); ADV.end(); ADV.begin({background:'blur'}); await sleep(60);
  check('4. 舊的那一段結束、下一段 ADV 已經開始：舊的 CG 不會跑到新的那一段',ADV.active&&!/\bcg\b/.test(ADV.root.className),JSON.stringify(ADV.root.className)); ADV.end();
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
