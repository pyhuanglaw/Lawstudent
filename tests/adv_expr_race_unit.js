// 立繪表情被舊表情蓋掉（BUG-ADV-EXPR-RACE-1021；BB 2026-10-21 18:18 KX-EXPR：0.45 秒時 125 句裡 27 句圖不對）——不需要瀏覽器。用法：node tests/adv_expr_race_unit.js
//   events3d.js 的台詞先 ADV.speaker(id, 表情)，GM.say（game3d.js）緊接著又 ADV.speaker(id)（沒帶表情＝用舞台上記的表情）。adv3d.js 的 render 是 async、載完圖才更新 ADV.slots，
//   所以第二次拿到的是舊表情：兩次換圖照順序套用＝舊的蓋掉新的，ADV.slots 也記成舊的（下一句沒帶表情就退回舊表情）。
//   修法：render 一進來就同步記下要的那一張（ADV.want）＋每框一個序號，後面又叫 render 了，舊的那一次不換圖、不改 slots；speaker 找框、沿用表情都看「要的」。
// 檢查（照遊戲的叫法：每一句都是 speaker(id, 表情) 緊接 speaker(id)）：
//   1. neutral → smile：最後顯示 smile、slots 記 smile
//   2. 下一句沒帶表情：照舊 smile（不退回 neutral）
//   3. 第一次上台就帶表情（laugh）：顯示 laugh（第二次 speaker 不會再挑一個框、不會換成 neutral）
//   4. 載圖途中 hide（換場景）：不會又冒出來
//   5. 換表情的過程中透明度最後回到 1（不會停在 0 看不到人）
// 修改前：1、2、3 FAIL。
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
const KX='assets/portraits/kexin/campus/';
const shown=slot=>{ const box=slot==='left'?ADV.L:ADV.R; const im=box&&box.querySelector('img'); return im?String(im.src).replace(KX,''):null; };
const say=(id,e)=>{ ADV.speaker(id,e); ADV.speaker(id); };   /* events3d：speaker(id, 表情)；GM.say：speaker(id) */
(async()=>{
  const G={v:3,day:0,hour:12,flags:{},choices:{},events:{done:{}},name:'祐廷',rel:{},social:null,stage:'law'}; SOCIAL.bind(G); SOCIAL.remember('kexin','FIRST_MET','');
  ADV.preload(['kexin']); ADV.begin({background:'blur'});
  for(const e of ['smile','laugh','sad','neutral']){ ADV.speaker('kexin',e); await sleep(300); }   /* 每個表情先上台一次＝都在 ADV 的快取裡（遊戲裡同一場戲第二次用到的表情就是這樣），最容易撞到順序問題 */
  say('kexin','neutral'); await sleep(400);
  const s0=shown('right');
  check('0. 第一句 neutral：右邊是可昕 neutral',s0==='neutral.webp',String(s0));
  say('kexin','smile'); await sleep(400);
  check('1. neutral → smile：顯示 smile、slots 記 smile',shown('right')==='smile.webp'&&ADV.slots.right&&ADV.slots.right.expression==='smile',shown('right')+' / '+JSON.stringify(ADV.slots.right));
  say('kexin',undefined); await sleep(400);
  check('2. 下一句沒帶表情：照舊 smile（不退回 neutral）',shown('right')==='smile.webp'&&ADV.slots.right.expression==='smile',shown('right')+' / '+JSON.stringify(ADV.slots.right));
  say('kexin','laugh'); await sleep(400);
  check('2b. 再換 laugh：顯示 laugh',shown('right')==='laugh.webp'&&ADV.slots.right.expression==='laugh',shown('right'));
  ADV.end(); await sleep(500); ADV.slots.left=ADV.slots.right=null; if(ADV.want){ ADV.want.left=ADV.want.right=null; }
  ADV.begin({background:'blur'}); say('kexin','sad'); await sleep(400);
  check('3. 第一次上台就帶表情（sad）：顯示 sad、只佔一個框',shown('right')==='sad.webp'&&!(ADV.slots.left&&ADV.slots.left.charId==='kexin'),shown('right')+' / L='+JSON.stringify(ADV.slots.left));
  const im=ADV.R.querySelector('img'); check('5. 換圖以後透明度回到 1',!im||im.style.opacity===1||im.style.opacity===undefined||im.style.opacity==='',String(im&&im.style.opacity));
  ADV.speaker('kexin','laugh'); ADV.hide('right'); await sleep(400);
  check('4. 載圖途中 hide（換場景）：不會又冒出來',!ADV.R.classList.contains('show')&&!ADV.slots.right,JSON.stringify(ADV.slots.right));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
