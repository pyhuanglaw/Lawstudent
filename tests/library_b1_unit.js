// 總圖 B1（CLOSED-SPACES-1023 第 2 項，LAWWW2-B；AA_399 第 2 節；LAWWW-B 10-23 選 A：大廳一樓西牆開樓梯間的門）——不需要瀏覽器。
//   1. 配置、區域、正式模型登記：library_b1 有、GLB／配置檔在、index.html 有載入；
//   2. 大廳一樓西牆的樓梯間門（library_layout.js b1Door）：在西牆、換掉那一扇窗（備用模型、Blender 都不畫那扇窗）、門上有字；
//   3. 進出：大廳「走樓梯下 B1」→ B1 樓梯間門前；B1「走樓梯上 1F」→ 大廳那扇門前；兩邊的出生點都站得住、離按鈕夠遠（一進來不會馬上跳出按鈕）；
//   4. 電梯這一版不停 B1：B1 的電梯只有「看」、大廳電梯的樓層沒有 B1；
//   5. 劇情要的站位（LAWWW-B 10-23）：spots（討論室 1、2 的白板前和門口、自習室門口、期末的夜、借還機、樓梯間門口、影印櫃台）、interact id（selfcheck、disc1、disc2、study_door）；
//      座位：自習室 28 個（kind study、room study24）、討論室各 6 個（study）；
//   6. 導航：照遊戲的格子從樓梯間走得到每個座位的走近點、每個互動點、每個 spot；
//   7. 背景的同學只坐自習室；story3d.js 進來、待著都會叫 LB1.populate；guide3d.js、placemap、places 有 B1。
// 修改前（沒有 B1）：第 1 項 FAIL、後面不跑（缺配置）。用法：node tests/library_b1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={M:()=>({})}; global.Z3={ZONES:{}}; global.ASSETS={manifest:{}};
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
  check('2. library_layout.js b1Door：一樓（lv 0）西牆（x≈−W/2）、z 在西牆那一排窗的位置（−7.2…7.2 每 2.4 m）、寬 1.1', !!BD&&BD.lv===0&&Math.abs(BD.x+W/2)<0.3&&Math.abs(((BD.z+7.2)/2.4)-Math.round((BD.z+7.2)/2.4))<1e-6&&BD.w>=1.0, JSON.stringify(BD&&{x:BD.x,z:BD.z,w:BD.w}));
  check('2. 那一扇窗換成門：備用模型（library3d.js）跳過那扇窗、畫一扇門；Blender（library_interior.py）牆上開門洞、不畫那扇窗、牆裙斷開、有門',
    /L\.b1Door&&Math\.abs\(z-L\.b1Door\.z\)<0\.1\) continue/.test(lib)&&/if\(L\.b1Door\)\{ const BD=L\.b1Door; const dg=new THREE\.Group\(\)/.test(lib)&&/B1SKIP/.test(bl)&&/door\('L0_b1stairs'/.test(bl)&&/牆裙在 B1 的門口斷開/.test(bl));
  const sg=LL.signs.find(s=>s.lv===0&&/B1/.test(s.text)); check('2. 門上的字（signs，一樓、貼西牆、在門上面）', !!sg&&Math.abs(sg.z-BD.z)<0.01&&Math.abs(sg.x+W/2)<0.3&&sg.y-sg.w*0.09>2.4, sg&&sg.text); }
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
// 3. 進出
{ const up=IT.find(q=>q.exit&&q.exit.to==='library_hall'), BD=LL.b1Door, sp=LB.stairs.spawn;
  const lib=fs.readFileSync(path.join(ROOT,'src/library3d.js'),'utf8');
  check('3. B1「走樓梯上 1F」→ library_hall、站到大廳那扇門前（b1Door.spawn，lv 0、面向東）', !!up&&up.label==='走樓梯上 1F'&&up.exit.spawn.x===BD.spawn.x&&up.exit.spawn.z===BD.spawn.z&&(up.exit.spawn.lv|0)===0&&Math.abs(up.exit.spawn.yaw-Math.PI/2)<0.01);
  check('3. 大廳「走樓梯下 B1」→ library_b1、站到 B1 樓梯間的門前（stairs.spawn）', /exit:\{to:'library_b1',spawn:\{x:sp\.x,z:sp\.z,yaw:sp\.yaw\}\}/.test(lib)&&/label:BD\.label/.test(lib)&&BD.label==='走樓梯下 B1');
  const hb=/IT\.push\(\{x:BD\.x\+([\d.]+),z:BD\.z,radius:([\d.]+),lv:0,label:BD\.label/.exec(lib), hx=hb?BD.x+(+hb[1]):NaN, hr=hb?+hb[2]:0;
  check('3. 出生點離「走樓梯」按鈕夠遠（大於按鈕半徑：一進來不會馬上跳出來）：B1、大廳', !!up&&Math.hypot(sp.x-up.x,sp.z-up.z)>up.radius&&!!hb&&Math.hypot(BD.spawn.x-hx,BD.spawn.z-BD.z)>hr, (up?Math.hypot(sp.x-up.x,sp.z-up.z).toFixed(2)+'>'+up.radius:'')+'／'+(hb?Math.hypot(BD.spawn.x-hx,0).toFixed(2)+'>'+hr:'')); }
// 4. 電梯
{ const el=IT.find(q=>q.label==='電梯'); check('4. B1 的電梯這一版不停（只有「看」、不是搭電梯）；大廳電梯的樓層沒有 B1', !!el&&!!el.look&&!el.elevator&&!el.exit&&LB.elevator.stops===false&&!LL.elevator.floors.some(f=>f.zone==='library_b1'||/B1/.test(f.label))); }
// 5. 站位、座位
{ const sp=LB.spots||{}, need=['disc1_head','disc1_door','disc2_head','disc2_door','study_door','study_night','selfcheck','stairs_door','copy_clerk'];
  check('5. spots：'+need.join('、'), need.every(k=>sp[k]&&isFinite(sp[k].x)&&isFinite(sp[k].z)&&isFinite(sp[k].yaw)), need.filter(k=>!sp[k]).join('、'));
  const ids=new Set(LB.interact.map(q=>q.id)); check('5. interact id：selfcheck、disc1、disc2、study_door、notice、copy', ['selfcheck','disc1','disc2','study_door','notice','copy'].every(k=>ids.has(k)));
  const S=z.seats, st=S.filter(s=>s.room==='study24'&&s.study), d1=S.filter(s=>s.room==='disc1'&&s.study), d2=S.filter(s=>s.room==='disc2'&&s.study);
  check('5. 座位：自習室 28 個（kind study）、討論室 1、2 各 6 個（study）', st.length===28&&d1.length===6&&d2.length===6, st.length+'／'+d1.length+'／'+d2.length);
  const R=LB.rooms.find(r=>r.id==='study24'); check('5. study_night 在自習室中間那一排南側座位旁邊（期末前的夜）', !!R&&sp.study_night.z>R.z0&&sp.study_night.z<R.z1&&S.some(s=>s.room==='study24'&&Math.abs(s.z-sp.study_night.z)<0.05)); }
// 6. 導航（和 lane118_shops.navcheck 同一套規則，但用遊戲建出來的格子）
{ const free=(x,zz)=>{ const [c,r]=nav.cellOf(x,zz); return c>=0&&r>=0&&c<nav.cols&&r<nav.rows&&!nav.b[r*nav.cols+c]; }, clear=(x,zz,r)=>free(x,zz)&&free(x+r,zz)&&free(x-r,zz)&&free(x,zz+r)&&free(x,zz-r);
  const flood=(sx,sz)=>{ const s0=nav.cellOf(sx,sz), seen=new Set([s0+'']), q=[s0]; while(q.length){ const [c,r]=q.pop(); for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++){ const n=[c+dc,r+dr], k=n+''; if(seen.has(k)||n[0]<0||n[1]<0||n[0]>=nav.cols||n[1]>=nav.rows||nav.b[n[1]*nav.cols+n[0]]) continue; const [x,zz]=nav.w2(...n); if(!clear(x,zz,0.33)) continue; seen.add(k); q.push(n); } } return seen; };
  const reach=(seen,x,zz)=>{ if(!free(x,zz)||!clear(x,zz,0.3)) return false; const [c,r]=nav.cellOf(x,zz); for(let dc=-1;dc<=1;dc++) for(let dr=-1;dr<=1;dr++) if(seen.has([c+dc,r+dr]+'')) return true; return false; };
  const near=(seen,x,zz,rad)=>{ for(let dx=-4;dx<=4;dx++) for(let dz=-4;dz<=4;dz++) if(Math.hypot(dx*0.2,dz*0.2)<=rad&&reach(seen,x+dx*0.2,zz+dz*0.2)) return true; return false; };
  const sp=LB.stairs.spawn; check('6. 樓梯間的出生點站得住', clear(sp.x,sp.z,0.33));
  const seen=flood(sp.x,sp.z), bad=[];
  for(const s of LB.seats){ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0);   /* 和 game3d.js 的 seatApproach 同一組候選點 */
    const cand=[...(s.ap?[s.ap]:[]),...[[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]].map(([dx,dz])=>[s.x+dx,s.z+dz])];
    if(!cand.some(([x,zz])=>reach(seen,x,zz))) bad.push('座位 '+(s.label||'')+' '+[s.x,s.z]); }
  for(const q of IT){ if(q.seat) continue; if(!near(seen,q.x,q.z,q.radius||0.8)) bad.push(q.label); }
  for(const [k,p] of Object.entries(LB.spots)){ if(!near(seen,p.x,p.z,0.4)) bad.push('spots.'+k); }
  check('6. 從樓梯間走得到每個座位的走近點、每個互動點、每個 spot', bad.length===0, bad.slice(0,6).join('；')); }
// 7. 背景的同學、其他登記
{ const G={hour:20,day:30,zone:'library_b1'}; const w=LB1.want(G,z.seats);
  check('7. 背景的同學只坐自習室（晚上 8 點有人）', w.length>0&&w.every(i=>z.seats[i].room==='study24'), w.length+' 位');
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), g=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8'), pm=fs.readFileSync(path.join(ROOT,'src/placemap3d.js'),'utf8'), pl=fs.readFileSync(path.join(ROOT,'src/data/places.js'),'utf8');
  check('7. story3d.js 進來（populate）、待著（refreshSchedule）都叫 LB1.populate', /LB1\.populate\(GM,true\)/.test(st)&&/LB1\.populate\(GM,false\)/.test(st));
  check('7. guide3d.js 大廳 ⇄ B1、placemap 的地圖釘（總圖）、places 的名字', /library_hall:\['campus','library','library_b1'\]/.test(g)&&/library_b1:\['library_hall'\]/.test(g)&&/library_b1:'library'/.test(pm)&&/library_b1:'總圖 B1/.test(pl)); }
console.log(fails?('\n'+fails+' FAIL'):'\nALL PASS'); process.exit(fails?1:0);
