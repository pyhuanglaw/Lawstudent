// 2:30 AM 外觀門口的導航（WZ-FIVE-1104 第二版，LAWWW2-C 2026-11-04）——不需要瀏覽器。
// 建出遊戲真正的溫州街區域（zones3d.js 的 Z3.ZONES.wenzhou），用遊戲自己的碰撞量（E.canStand 半徑 0.30＝engine3d.js stepEntity 的人物半徑）：
//   ① 門口的木椅（cafe_exterior.glb 第二版；外觀 (4.2, 0.42) 轉 15°＝世界 (54.98, 4.2)）：站得住的人中心離椅子最近 ≥ 0.30 m（身體碰不到椅子）
//   ② 畫架（外觀 (3.6, 1.0)：前面兩支腳 (3.6±0.24, 1.12)、後面一支 (3.6, 0.7)＝世界 (54.28, 3.36)、(54.28, 3.84)、(54.7, 3.6)）：同上
//   ③ 店門前、畫架兩邊、街上幾個點都走得到；畫架附近沒有「站得住但走不到」的點（小孤島）
// 修改前（開發分支 effb5d9b3）：② 失敗——blockCircle(54.4,3.6,0.35) 在 0.5 m 的導航格上只擋一格，人可以站在畫架三支腳中間（最近 0 m）。
// 改法（zones3d.js，LAWWW-C）：畫架那一行的 nav.blockCircle(54.4,3.6,0.35) 改成 nav.blockRect(54.45,3.6,0.9,0.9,0,0)——② 變 0.33 m，① ③ 照舊。
// 外觀和世界座標：外觀 (x', y, z') ＝ 世界 (55.4 − z', y, x')（cafeB 的原點在世界 x 55.4，正面朝 −x）。
//   ④（第三版）轉角的白色高盆小樹：人碰不到盆、樹冠不會擦到肩膀和頭（讀 GLB 的葉子頂點）
// 用法：node tests/cafe230_ext_nav_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
// 載入 index.html 到 teach3d.js 為止的區域檔（不要人物、劇情），再加上溫州街小店、公園、腳踏車
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/teach3d\.js$/.test(f)) break; }
for(const f of ['src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/wzpark3d.js','src/wzshops3d.js','src/bike3d.js','src/bikeshop3d.js','src/mokuyobi_sys3d.js','src/offbeat_sys3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const z=(()=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES.wenzhou.build(E); z.def=Z3.ZONES.wenzhou; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; return z; })();
const R=0.30;
const ext2w=(x,zz)=>[55.4-zz,x];
// 椅子：本地 x ±0.21、z −0.22～0.20（前面＝+z＝街），Blender 繞 Z 轉 −15°：本地 (lx, lz) → Blender (lx, −lz) → 轉 → 外觀 (bx', −by')
const a=-15*Math.PI/180; const chairPt=(lx,lz)=>{ const bx=lx, by=-lz; return ext2w(4.2+bx*Math.cos(a)-by*Math.sin(a), 0.42-(bx*Math.sin(a)+by*Math.cos(a))); };
const chair=[chairPt(-0.21,-0.22),chairPt(0.21,-0.22),chairPt(0.21,0.2),chairPt(-0.21,0.2)];
const easel=[ext2w(3.6-0.24,1.12),ext2w(3.6+0.24,1.12),ext2w(3.6,0.7)];
function segD(p,a,b){ const vx=b[0]-a[0], vz=b[1]-a[1], t=Math.max(0,Math.min(1,((p[0]-a[0])*vx+(p[1]-a[1])*vz)/(vx*vx+vz*vz))); return Math.hypot(p[0]-a[0]-vx*t,p[1]-a[1]-vz*t); }
function inPoly(P,p){ let s=0; for(let i=0;i<P.length;i++){ const a=P[i], b=P[(i+1)%P.length]; s+=((b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]))>0?1:-1; } return Math.abs(s)===P.length; }
const polyD=(P,p)=>inPoly(P,p)?0:Math.min(...P.map((q,i)=>segD(p,q,P[(i+1)%P.length])));
function closest(P){ const xs=P.map(p=>p[0]), zs=P.map(p=>p[1]); let w=1e9, wp=null;
  for(let x=Math.min(...xs)-1;x<=Math.max(...xs)+1;x+=0.01) for(let zz=Math.min(...zs)-1;zz<=Math.max(...zs)+1;zz+=0.01){ if(!E.canStand(x,zz,R,0)) continue; const d=polyD(P,[x,zz]); if(d<w){ w=d; wp=[+x.toFixed(2),+zz.toFixed(2)]; } } return [w,wp]; }
let [d1,p1]=closest(chair); check('① 木椅：站得住的人中心離椅子最近 ≥ 0.30 m（身體碰不到）',d1>=R,'最近 '+d1.toFixed(2)+' m（人中心 '+JSON.stringify(p1)+'）');
let [d2,p2]=closest(easel); check('② 畫架：站得住的人中心離三支腳最近 ≥ 0.30 m（身體碰不到）',d2>=R,'最近 '+d2.toFixed(2)+' m（人中心 '+JSON.stringify(p2)+'）'+(d2<R?'——改法見檔頭':''));
const door=[52.5,0.0], pts=[[52.5,3.6],[52.5,7.5],[53.6,6.0],[53.6,2.0],[50.0,3.6]];
const bad=pts.filter(p=>!(E.canStand(p[0],p[1],R,0)&&E.pathTo(door[0],door[1],0,p[0],p[1],0)));
let iso=0; for(let x=52.0;x<=55.4;x+=0.25) for(let zz=1.0;zz<=6.5;zz+=0.25){ if(E.canStand(x,zz,R,0)&&!E.pathTo(door[0],door[1],0,x,zz,0)) iso++; }
check('③ 店門前 (52.5,0) 走得到畫架兩邊、街上五個點；門口一帶沒有站得住但走不到的點',E.canStand(door[0],door[1],R,0)&&bad.length===0&&iso===0,'走不到 '+JSON.stringify(bad)+'；小孤島的點 '+iso);
// ④ 轉角的白色高盆小樹（第三版，外觀 (4.78, 0.55)＝世界 (54.85, 4.78)；在原本的 blockRect(54.85,5.4,0.6,1.8) 裡）：
//    站得住的人中心離盆 ≥ 0.30＋盆半徑 0.17；樹冠（GLB 裡離樹 0.6 m 內、離地 1.0～1.9 m 的葉子頂點）離站得住的人中心水平 ≥ 0.20 m（肩膀、頭不會穿進葉子）
{ const d=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/cafe_exterior.glb')), n=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+n).toString('utf8')), bo=20+n+8;
  const T=[4.78,0.55], TW=ext2w(T[0],T[1]), leaf=[];
  for(const nd of J.nodes){ if(nd.mesh==null||nd.translation||nd.rotation||nd.scale||nd.matrix||(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)) continue; const m=J.meshes[nd.mesh];
    for(const pr of m.primitives){ const mt=pr.material!=null?J.materials[pr.material].name:''; if(!/leaf/.test(mt)) continue; const a=J.accessors[pr.attributes.POSITION], bv=J.bufferViews[a.bufferView], st=bv.byteStride||12, off=bo+(bv.byteOffset||0)+(a.byteOffset||0);
      for(let i=0;i<a.count;i++){ const x=d.readFloatLE(off+i*st), y=d.readFloatLE(off+i*st+4), zz=d.readFloatLE(off+i*st+8); if(y>1.0&&y<1.9&&Math.hypot(x-T[0],zz-T[1])<0.6) leaf.push(ext2w(x,zz)); } } }
  let dp=1e9, dl=1e9; for(let x=TW[0]-1.2;x<=TW[0]+1.2;x+=0.02) for(let zz=TW[1]-1.2;zz<=TW[1]+1.2;zz+=0.02){ if(!E.canStand(x,zz,R,0)) continue;
    dp=Math.min(dp,Math.hypot(x-TW[0],zz-TW[1])-0.17); for(const q of leaf) dl=Math.min(dl,Math.hypot(x-q[0],zz-q[1])); }
  check('④ 轉角白盆小樹：人碰不到盆（≥ 0.30 m）、樹冠離人中心水平 ≥ 0.20 m',leaf.length>20&&dp>=R&&dl>=0.2,'離盆 '+dp.toFixed(2)+' m、離葉子 '+dl.toFixed(2)+' m（葉子頂點 '+leaf.length+' 個）'); }
console.log(fails?('FAILS: '+fails):'ALL PASS'); process.exit(fails?1:0);
