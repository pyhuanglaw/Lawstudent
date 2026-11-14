// 118 巷九間店的室內：站得到的每一個地方都走得回門口（L118-SHOPS-REDO-1111，X338；BB_335 的驗收重點；LAWWW2 2026-11-11）
// 做法和 tests/tz_shops_notrap_1111_unit.js 一樣（汀州鮮果卡人的教訓）：在 Node 建出遊戲真正的區域，從進門的位置用 E.canStand（玩家半徑）每 0.25 m 掃出所有走得到的點，
//   每一個點都用引擎真正的找路＋移動碰撞（E.simWalk，走路、30 fps 和 10 fps）走到「離開」的互動點：停下來的地方要在互動半徑裡。
// 另外：每張椅子在它的互動半徑（配置的 r，沒有就 0.7 m）裡有站得到的點；點餐、看東西的互動點也一樣；重做的四間（dian、self、tea、korea）天花板是單面朝下（讀模型的二進位資料）。
// 這是模擬，不是真實玩家流程（D131）。用法：node tests/l118_shops_notrap_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
process.on('unhandledRejection',()=>{});
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/lane118_layout.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|L118S|LANE118_LAYOUT|L118_SHOP_LAYOUTS|LINZE_LAYOUT|CLASSROOM_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const IDS=Object.keys(L118_SHOP_LAYOUTS).filter(id=>Z3.ZONES['l118_'+id]);
check('0. 九間店的室內都有區域',IDS.length===9,IDS.join());
const STEP=0.25, R=0.32, REDO=['dian','self','tea','korea'];
for(const id of IDS){ const L=L118_SHOP_LAYOUTS[id], z=loadZone('l118_'+id), nav=z.nav, sp=z.spawn||L.spawn, ex=E.interactables.find(i=>i.exit);
  const X0=nav.ox, Z0=nav.oz, W=nav.cols*nav.cell, D=nav.rows*nav.cell, key=(i,j)=>i+','+j;
  const ok=(i,j)=>{ const x=X0+i*STEP, zz=Z0+j*STEP; return x>X0&&zz>Z0&&x<X0+W&&zz<Z0+D&&E.canStand(x,zz,R,0); };
  const si=Math.round((sp.x-X0)/STEP), sj=Math.round((sp.z-Z0)/STEP); let start=null;
  for(let d=0;d<4&&!start;d++) for(let a=-d;a<=d&&!start;a++) for(let b=-d;b<=d&&!start;b++) if(ok(si+a,sj+b)) start=[si+a,sj+b];
  if(!start||!ex){ check(L.name+'：進門的位置站得住、有「離開」',false,JSON.stringify([sp,ex&&ex.label])); continue; }
  const seen=new Set([key(...start)]), q=[start]; while(q.length){ const [i,j]=q.pop(); for(const [a,b] of [[1,0],[-1,0],[0,1],[0,-1]]){ const k=key(i+a,j+b); if(!seen.has(k)&&ok(i+a,j+b)){ seen.add(k); q.push([i+a,j+b]); } } }
  const pts=[...seen].map(k=>k.split(',').map(Number)).map(([i,j])=>[+(X0+i*STEP).toFixed(2),+(Z0+j*STEP).toFixed(2)]);
  const bad=[]; for(const p of pts) for(const dt of [0.1,0.033]){ const r=E.simWalk(p[0],p[1],ex.x,ex.z,{lv0:0,lv1:0,dt,speed:1.45}); const end=r&&r.x!=null?[r.x,r.z]:(r&&r.ok?[ex.x,ex.z]:null);
    if(!end||Math.hypot(end[0]-ex.x,end[1]-ex.z)>ex.radius+1e-6){ bad.push([p[0],p[1],dt,end&&end.map(v=>+v.toFixed(2)),r&&r.reason]); break; } }
  check(id+' '+L.name+'：站得到的 '+pts.length+' 個點（每 '+STEP+' m）都走得回「'+ex.label+'」的半徑裡（走路、30 fps 和 10 fps）',pts.length>30&&!bad.length,bad.length+' 個出不來：'+JSON.stringify(bad.slice(0,6)));
  const near=(x,zz,r)=>pts.some(p=>Math.hypot(p[0]-x,p[1]-zz)<=r);
  if(REDO.includes(id)){
    const far=L.seats.filter(s=>!near(s.i?s.i[0]:s.x,s.i?s.i[1]:s.z,s.r||0.7)).map(s=>s.x+','+s.z);   /* L118-IT-REACH-1111 收尾（11-12）：配置寫了按鈕位置 i 的，半徑從按鈕量（不是從椅子）*/
    check(id+' '+L.name+'：'+L.seats.length+' 個座位在互動半徑（配置的 r，沒有就 0.7 m）裡都有站得到的點',L.seats.length>0&&!far.length,far.join(' '));
    const o=L.order, lk=(L.interact||[]).filter(i=>!near(i.x,i.z,i.r)).map(i=>i.id);
    check(id+' '+L.name+'：點餐、看東西的互動點都走得到；店員站的位置在客人走不到的地方（櫃台後面）',!!o&&near(o.x,o.z,o.r)&&!lk.length&&!!L.clerk&&!near(L.clerk.x,L.clerk.z,0.2),JSON.stringify([o,lk,L.clerk])); } }
/* 天花板：重做的四間，模型裡的天花板每個頂點都在配置的高度、法線朝下、材質單面（鏡頭在天花板上面時看不到它——禮貌生財的教訓） */
for(const id of REDO){ const f=path.join(ROOT,'assets/models/env/second_ai/l118_'+id+'.glb'); if(!fs.existsSync(f)){ check(id+'：模型檔在',false,f); continue; }
  const buf=fs.readFileSync(f), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), bin=buf.slice(20+jl+8), H=L118_SHOP_LAYOUTS[id].h;
  const mi=J.materials.findIndex(m=>/_ceiling$/.test(m.name||'')&&!/kceiling/.test(m.name)), acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], o=(v.byteOffset||0)+(a.byteOffset||0), n=a.count*3, out=[]; for(let k=0;k<n;k++) out.push(bin.readFloatLE(o+k*4)); return out; };
  let n=0, okY=true, okN=true; for(const m of J.meshes) for(const p of m.primitives){ if(p.material!==mi) continue; const P=acc(p.attributes.POSITION), N=acc(p.attributes.NORMAL); for(let k=0;k<P.length;k+=3){ n++; if(Math.abs(P[k+1]-H)>0.02) okY=false; if(N[k+1]>-0.99) okN=false; } }
  check(id+'：天花板單面朝下（'+n+' 個頂點都在 '+H+' m、法線朝下、材質不是雙面）',mi>=0&&n>=4&&okY&&okN&&!J.materials[mi].doubleSided,JSON.stringify([mi,n,okY,okN])); }
/* 第 3 版（BB_341 第四節：辛亥韓食鏡頭拉到最遠，燈具、橫樑從上面橫過畫面）：四間貼著天花板的東西（天花板、格線、橫樑、燈盤、燈管、嵌燈、吊扇）節點都叫 CEIL_*——
   遊戲的 Z3.attachRoomGLB → ceilHide 在鏡頭高過天花板時整組藏。讀模型：CEIL_ 的節點在；其他不是牆的節點沒有「整個都貼在天花板下面 0.2 m 內」的（漏掉的燈具會被這一項抓到） */
for(const id of REDO){ const f=path.join(ROOT,'assets/models/env/second_ai/l118_'+id+'.glb'); if(!fs.existsSync(f)) continue;
  const buf=fs.readFileSync(f), jl=buf.readUInt32LE(12), J=JSON.parse(buf.slice(20,20+jl).toString('utf8')), H=L118_SHOP_LAYOUTS[id].h, names=J.nodes.map(n=>n.name||'');
  const need=['ceiling','vc','light'].concat(id==='tea'?['beams','warm']:['ceilgrid']).filter(k=>!names.includes('CEIL_l118_'+id+'_'+k));
  const left=J.nodes.filter(n=>n.mesh!=null&&!/^CEIL_|^WALL_/.test(n.name||'')).filter(n=>{ const ty=(n.translation||[0,0,0])[1]; let lo=1e9; for(const p of J.meshes[n.mesh].primitives){ const a=J.accessors[p.attributes.POSITION]; lo=Math.min(lo,a.min[1]+ty); } return lo>H-0.2; }).map(n=>n.name);
  check(id+'：貼著天花板的東西都在 CEIL_ 的節點裡（鏡頭高過天花板時遊戲整組藏）',!need.length&&!left.length,JSON.stringify({缺:need,漏在外面:left})); }
{ const zs=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'), ls=fs.readFileSync(path.join(ROOT,'src/l118_shops3d.js'),'utf8');
  check('遊戲端：zones3d.js 的 ceilHide 照 CEIL_ 的名字藏、l118_shops3d.js 用 Z3.attachRoomGLB 接模型',/function ceilHide\(z,root\)/.test(zs)&&/\^CEIL_/.test(zs)&&/Z3\.attachRoomGLB\(/.test(ls)); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
