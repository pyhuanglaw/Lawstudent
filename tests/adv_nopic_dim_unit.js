// 沒有立繪的人說話時，台上的立繪要變暗、不能被擠下去（BUG-ADV-NOPORTRAIT-DIM-1103；BB 11-03 16:23，CC aa609 grandma_line.jpg：學姊畢業典禮「學姊的奶奶」說話時學姊亮著）——不需要瀏覽器。用法：node tests/adv_nopic_dim_unit.js
//   照 ev_sis_graduation 的順序：學姊上台 → 學姊的媽媽 → 學姊 → 旁白 → 學姊的奶奶 → 學姊；學姊在右、在左各跑一次。修改前：奶奶那一句學姊不暗（在左）／被擠下去（在右）。
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
const say=(id,e)=>{ ADV.speaker(id,e); ADV.speaker(id); };   /* events3d：speaker(id, 表情)；GM.say：speaker(id) */
const box=s=>s==='left'?ADV.L:ADV.R, dim=s=>box(s).classList.contains('dim'), show=s=>box(s).classList.contains('show'), who=s=>(ADV.want[s]||ADV.slots[s]||{}).charId;
(async()=>{
  const G={v:3,day:0,hour:12,flags:{},choices:{},events:{done:{}},name:'祐廷',rel:{},social:null,stage:'law'}; SOCIAL.bind(G);
  check('0. noPic：學姊的奶奶＝沒有立繪；學姊、祐廷、旁白不是',ADV.noPic('學姊的奶奶')&&ADV.noPic('學姊的媽媽')&&!ADV.noPic('heroine_05')&&!ADV.noPic('player')&&!ADV.noPic(null));
  for(const side of ['right','left']){ const o=side==='right'?'left':'right';
    ADV.begin({background:'dark',[side]:{charId:'heroine_05',expression:'neutral'},mainSide:side}); say('heroine_05','neutral'); await sleep(300);
    say('學姊的媽媽'); await sleep(200);
    check('1'+side[0]+'. 學姊在'+side+'：媽媽說話＝學姊變暗、媽媽不佔框',dim(side)&&show(side)&&who(side)==='heroine_05'&&!who(o),'dim='+dim(side)+' '+o+'='+who(o));
    say('heroine_05','neutral'); await sleep(200);
    check('2'+side[0]+'. 學姊說話＝亮',!dim(side)&&show(side));
    ADV.speaker(null);
    say('學姊的奶奶'); await sleep(200);
    check('3'+side[0]+'. 奶奶說話＝學姊變暗、還在台上（不被擠下去）',dim(side)&&show(side)&&who(side)==='heroine_05','dim='+dim(side)+' show='+show(side)+' who='+who(side));
    check('4'+side[0]+'. 直向只顯示最後說話的人：學姊沒有被 .off 藏起來',!box(side).classList.contains('off'));
    say('heroine_05','smile'); await sleep(200);
    check('5'+side[0]+'. 學姊再說話＝亮',!dim(side)&&show(side));
    ADV.speaker('player'); check('6'+side[0]+'. 祐廷說話＝學姊變暗（照舊）',dim(side));
    ADV.end(); await sleep(200); ADV.slots.left=ADV.slots.right=null; ADV.want.left=ADV.want.right=null; }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('ERR',e.stack); process.exit(1); });
