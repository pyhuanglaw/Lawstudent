// 總圖 B1 洗手間東邊那一塊不再是空房：長期寄物櫃（LIB-B1-NOOK-1110，使用者 2026-11-10 X299「總圖B1洗手間門口後面是空的」；截圖 docs/handoff/user_shots/1110_library_b1_wc_empty.webp）——不需要瀏覽器。
//   1 有寄物櫃那一組（nook_lockers），放在場景裡（不在 fallback：正式模型載入後照樣看得到），南牆、東牆各一排（3 組 × 8 格）
//   2 寄物櫃擋路（站不進櫃子），那一塊中間照樣走得到
//   3 有「看長期寄物櫃」
// 修改前 1、2、3 FAIL。用法：node tests/lib_b1_nook_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={M:()=>({})}; global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
{ const m=/const B1C=(\{[^\n]*\});/.exec(require('fs').readFileSync(require('path').join(__dirname,'..','src/zones3d.js'),'utf8')); global.Z3.B1C=m?eval('('+m[1]+')'):null; }   /* [前置] 總圖北側中庭的落點（zones3d.js 的 B1C；LIB-B1-OUTSIDE-1110）*/
global.CHAR={ build:()=>({position:{x:0,y:0,z:0,set(){}},rotation:{y:0}}) }; global.STORY={ extraSpec:i=>({i}) };
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|LIBRARY_LAYOUT|LIBRARY_B1_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const ex=p=>fs.existsSync(path.join(ROOT,p));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
for(const f of ['src/data/calendar.js','src/data/library_layout.js','src/data/library_b1_layout.js','src/library_b1_3d.js']) if(ex(f)) load(f);
const LL=typeof LIBRARY_LAYOUT!=='undefined'?LIBRARY_LAYOUT:null, LB=typeof LIBRARY_B1_LAYOUT!=='undefined'?LIBRARY_B1_LAYOUT:null;
const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
check('1. 配置 library_b1、區域、正式模型 bldg.library_b1 登記、GLB 和配置檔都在、index.html 載入（在 library3d.js 後面）',
  !!LB&&LB.zone==='library_b1'&&!!Z3.ZONES.library_b1&&!!ASSETS.manifest['bldg.library_b1']&&ex('assets/models/env/second_ai/library_b1.glb')&&ex('assets/models/env/second_ai/library_b1.layout.json')
  &&idx.indexOf('src/library_b1_3d.js')>idx.indexOf('src/library3d.js')&&idx.indexOf('src/data/library_b1_layout.js')>0&&idx.indexOf('src/data/library_b1_layout.js')<idx.indexOf('src/library_b1_3d.js'));
if(!LB||!LL){ console.log('\n'+(fails+1)+' FAIL（後面的檢查要 B1 的配置）'); process.exit(1); }
// 2. 大廳一樓西牆的門
{ const BD=LL.b1Door, W=LL.W; const lib=fs.readFileSync(path.join(ROOT,'src/library3d.js'),'utf8'), bl=fs.readFileSync(path.join(ROOT,'tools/blender/library_interior.py'),'utf8');
  const VB=BD&&BD.wall==='vestibule', V=LL.vestibule, WX=VB?V.x0:-W/2;   /* 第四版（LIB-PLAN-1103，使用者 11-03 一樓平面圖：B1 樓梯在入口門禁兩旁）：門在門廳西牆；第一～三版在大廳西牆 */
  check('2. library_layout.js b1Door：一樓（lv 0）；大廳西牆（x≈−W/2、z 在西牆那一排窗的位置）或第四版的門廳西牆（x≈門廳 x0、z 在門廳裡）、寬 1.1', !!BD&&BD.lv===0&&Math.abs(BD.x-WX)<0.3&&(VB?BD.z>V.z0+0.6&&BD.z<V.z1-0.6:Math.abs(((BD.z+7.2)/2.4)-Math.round((BD.z+7.2)/2.4))<1e-6)&&BD.w>=1.0, JSON.stringify(BD&&{x:BD.x,z:BD.z,w:BD.w,wall:BD.wall}));
  check('2. 那一扇窗換成門：備用模型（library3d.js）跳過那扇窗、畫一扇門；Blender（library_interior.py）牆上開門洞、不畫那扇窗、牆裙斷開、有門',
    /L\.b1Door&&(L\.b1Door\.wall!=='vestibule'&&)?Math\.abs\(z-L\.b1Door\.z\)<0\.1\) continue/.test(lib)&&/if\(L\.b1Door\)\{ const BD=L\.b1Door; const dg=new THREE\.Group\(\)/.test(lib)&&/B1SKIP/.test(bl)&&/door\('L0_b1stairs'/.test(bl)&&/牆裙在 B1 的門口斷開/.test(bl));
  const sg=LL.signs.find(s=>s.lv===0&&/B1/.test(s.text)); check('2. 門上的字（signs，一樓、貼著門那面牆、在門上面）', !!sg&&Math.abs(sg.z-BD.z)<0.01&&Math.abs(sg.x-WX)<0.3&&sg.y-sg.w*0.09>2.4, sg&&sg.text); }
// 區域建起來（假的 E3、Z3.room）：拿互動點
const mkV=()=>({x:0,y:0,z:0,set(){ return this; },copy(){ return this; }});
global.THREE={Group:function(){ this.children=[]; this.add=o=>this.children.push(o); this.remove=()=>{}; this.position=mkV(); this.rotation=mkV(); this.userData={}; },
  Mesh:function(){ this.position=mkV(); this.rotation=mkV(); this.userData={}; }, PlaneGeometry:function(){}, BoxGeometry:function(){}, PointLight:function(){ this.position=mkV(); this.userData={}; }};
global.W3={stoneTex:()=>({})}; global.ASSETS.loadOne=()=>new Promise(()=>{});
global.E3={NavGrid:function(W,D,cs,ox,oz){ this.W=W; this.D=D; this.cs=cs; this.ox=ox; this.oz=oz; this.cols=Math.ceil(W/cs); this.rows=Math.ceil(D/cs); this.b=new Uint8Array(this.cols*this.rows);
  const w2=(c,r)=>[ox+(c+0.5)*cs,oz+(r+0.5)*cs];
  this.blockOutside=(x0,z0,x1,z1)=>{ for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const [x,z]=w2(c,r); if(x<x0||x>x1||z<z0||z>z1) this.b[r*this.cols+c]=1; } };
  this.blockRect=(cx,cz,w,d)=>{ for(let r=0;r<this.rows;r++) for(let c=0;c<this.cols;c++){ const [x,z]=w2(c,r); if(Math.abs(x-cx)<=w/2&&Math.abs(z-cz)<=d/2) this.b[r*this.cols+c]=1; } };
  this.cellOf=(x,z)=>[Math.floor((x-ox)/cs),Math.floor((z-oz)/cs)]; this.w2=w2; }};
global.Z3.room=(E,o)=>{ const g=new THREE.Group(); return {group:g,walls:[],winParts:[],onLamps(){},applyTime(){}}; };
const IT=[]; const E={interactables:IT}; const z=Z3.ZONES.library_b1.build(E); const nav=z.nav;
const LG=z.nookLockers, fb=z.group.children.find(o=>o.name==='fallback');
check('1. 有長期寄物櫃（nook_lockers），在場景裡、不在 fallback；格子門至少 48 個',!!LG&&z.group.children.includes(LG)&&!(fb&&fb.children.includes(LG))&&LG.children.length>=6+48,LG?LG.children.length+' 個':'沒有');
const blk=(x,zz)=>{ const [c,r]=nav.cellOf(x,zz); return nav.b[r*nav.cols+c]===1; };
check('2. 寄物櫃擋路（南排 (−8, 12.8)、東排 (−6.3, 10.8)），那一塊中間 (−8, 11) 走得到',blk(-8,12.8)&&blk(-6.3,10.8)&&!blk(-8,11),JSON.stringify([blk(-8,12.8),blk(-6.3,10.8),blk(-8,11)]));
check('3. 有「看長期寄物櫃」',IT.some(q=>q.label==='看長期寄物櫃'&&!!q.look));
console.log(fails?('\n'+fails+' FAIL'):'\nALL PASS'); process.exit(fails?1:0);
