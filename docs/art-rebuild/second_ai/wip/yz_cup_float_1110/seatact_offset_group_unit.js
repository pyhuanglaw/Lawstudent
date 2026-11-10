// 一盞的外帶杯浮在空中（BUG X289；BB 11-08 在 PC 用 day47、day51 兩份存檔重現；任務 YZ-CUP-FLOAT-1110，LAWWW2 帳號 A）——不需要瀏覽器（D131）。
// BB 量到：兩人一桌聊天（act chat、set S_cup）座位 (−2.15,−2.1)，外帶杯 desk:item_cup 在 (−2.32, 0.34, −0.24)＝離座位 1.87 m、下面只有地板。
// 原因：zones3d.js wzShop 把一盞整個房間的群組 g0 往 +z 搬了 cz＝9.6−d/2＝2.3 m；seatact3d.js 桌上的東西用世界座標（S.probe 照 matrixWorld 找桌子），
// 卻直接掛在 E.zone.group（＝g0）底下＝每一件都多偏 2.3 m（CC 探針的 lawww2_js.json：desk:item_cup 的群組 z 2.3）。
//   A  一盞（wz_teahouse，正式模型 yizhan 室內）坐滿路人：桌上有東西
//   B  桌上每一件的世界座標：離自己那一桌的座位 0.95 m 內（S.probe 往前最多找 0.9 m）
//   C  桌上每一件的下面真的有桌面：同一點往下第一個面的高度和那一件的 y 差 1 cm 內（不是浮空、不是埋進桌子）
//   D  BB 的那一個座位 (−2.15,−2.1)：桌上的東西在座位前 0.9 m 內
//   E  沒有位移的區域（cafe）照舊：桌上群組是單位矩陣、每一件離座位 0.95 m 內
// 修改前（開發分支 72c889ec3）：B、C、D FAIL。用法：node tests/seatact_offset_group_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
class FakeImg{ constructor(){ this._l={}; this.width=4; this.height=4; this.style={}; } addEventListener(t,f){ this._l[t]=f; } removeEventListener(){} set src(v){ this._src=v; setTimeout(()=>{ this._l.load&&this._l.load({}); },0); } get src(){ return this._src; } }   /* F：VRM 的貼圖一律當成 4×4 載入成功（tools/dev_scratch/spring_sim/harness.js 同一套）*/
const el=n=>n==='img'?new FakeImg():({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:(ns,n)=>el(n), createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); let DISK=false;   /* F：遊戲的 ASSETS.loadOne 從 repo 的檔案讀（A～E 照舊不讀檔）*/
global.fetch=u=>{ if(!DISK) return Promise.reject(new Error('no fetch in node')); const f=path.join(ROOT,String(u).split('?')[0]); if(!fs.existsSync(f)) return Promise.resolve({ok:false,status:404});
  const b=fs.readFileSync(f); return Promise.resolve({ok:true,status:200,body:null,arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)),json:()=>Promise.resolve(JSON.parse(b.toString()))}); };
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of SRCS){ try{ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
console.warn=()=>{};
check('0 照 index.html 的順序載入每一個檔都沒有錯',!loadErr.length,loadErr.slice(0,3).join('；'));
const SA=typeof SEATACT!=='undefined'?SEATACT:null;
check('0 有 SEATACT（src/seatact3d.js）',!!SA);
/* ---- A：真正的 GLB ---- */
function glbNames(rel){ const b=fs.readFileSync(path.join(ROOT,rel)); let off=12, js=null; while(off<b.length){ const ln=b.readUInt32LE(off), ty=b.readUInt32LE(off+4), ch=b.subarray(off+8,off+8+ln); off+=8+ln; if(ty===0x4E4F534A) js=JSON.parse(ch.toString('utf8')); } return js.meshes.map(m=>m.name); }
const NAMES=glbNames('assets/models/env/second_ai/desk_props.glb');
/* 假的模型：名稱和真的 GLB 一樣（Node 裡不解貼圖）*/
const fake=new THREE.Group(); for(const n of NAMES){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.01,0.05),new THREE.MeshBasicMaterial()); m.name=n; fake.add(m); }
const REAL={setReadItem:CHAR.setReadItem,sitTaskFit:CHAR.sitTaskFit,setSitTask:CHAR.setSitTask,loadOne:ASSETS.loadOne};   /* F 用真的 */
const readItem=new Map(); CHAR.setReadItem=(o,k)=>{ readItem.set(o,k); return true; };   /* 人物不建 VRM：記下手上換成什麼 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const wait=()=>new Promise(r=>setTimeout(r,0));
const dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/86400000)+1; };
const DAY=dayOf('2025-10-15');
let GM=null;
function build(id,G){ GAME.G=G; G.zone=id; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},lv:0,radius:0.32,seat:null};
  E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
  GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }}; return z; }
const sitAll=(z,o)=>{ const out=[]; for(const st of (z.seats||[])){ const ob=new THREE.Group(); ob.userData={}; out.push(E.addNPC(Object.assign({obj:ob,name:'',beh:'idle',isExtra:true,pose:'read',idlePose:'read',frozen:true,seat:st,lv:st.lv|0},o||{}))); } return out; };
const run=async()=>{ SA.tick(GM); await wait(); for(let i=0;i<400&&SA.indexing&&SA.indexing();i++) SA.tick(GM); SA.tick(GM); SA.tick(GM); };   /* 桌子的索引分段算（每 30 格最多 S.INDEX_MS 毫秒）：跑到算完 */
const mkG=(d,h)=>({day:d,hour:h,flags:{},stage:'law'});
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
    const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
  const objs=J.nodes.map(nd=>{ let o;
    if(nd.mesh!=null&&!(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
        return new THREE.Mesh(g,pr.material!=null?mats[pr.material]:new THREE.MeshStandardMaterial()); });
      if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
    else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
  const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
/* 正式模型（自己讀 GLB：tests/dorm_seethru_unit.js 同一套；EXT_mesh_gpu_instancing 的椅子、燈不建）*/
ASSETS.loadOne=k=>k==='prop.desk_props'?Promise.resolve({scene:fake}):(GLB[k]?(PEND[k]=Promise.resolve({scene:GLB[k]})):new Promise(()=>{}));
const GLB={}, PEND={}; const glb=(k)=>{ const u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOT,u))) GLB[k]=glbScene(path.join(ROOT,u)); return !!GLB[k]; };
const tasks=new Map(); CHAR.sitTaskFit=(o,kind)=>({kind,clip:'Sit_'+kind,shift:0,prop:null}); CHAR.setSitTask=(o,f)=>{ tasks.set(o,f); return true; };
const LO=ASSETS.loadOne; ASSETS.loadOne=k=>{ if(k!=='prop.desk_props'&&!GLB[k]) glb(k); return LO(k); };   /* 正式模型：第一次要的時候讀檔（一盞的鍵是 wzGlbKey 建區域時才加的）*/
/* 桌上每一件的世界座標（InstancedMesh：群組的 matrixWorld × 每一個 instance 的矩陣）*/
function placed(){ const out=[], M=new THREE.Matrix4(), W=new THREE.Matrix4(), v=new THREE.Vector3(); for(const g of SA.groups()){ g.updateMatrixWorld(true);
  for(const im of g.children){ if(!im.isInstancedMesh) continue; for(let i=0;i<im.count;i++){ im.getMatrixAt(i,M); W.multiplyMatrices(im.matrixWorld,M); v.setFromMatrixPosition(W); out.push({n:im.name,x:v.x,y:v.y,z:v.z}); } } } return out; }
/* (x, z) 往下第一個面（不經過 S.probe：自己用 Raycaster 打正式模型＋備用方塊，看得到的才算；人物、桌上小物不算）*/
function surfY(z,x,zz,y){ const rc=new THREE.Raycaster(new THREE.Vector3(x,y+0.3,zz),new THREE.Vector3(0,-1,0),0,3); const L=[]; z.group.traverse(o=>{ if(!o.isMesh||o.isInstancedMesh) return; for(let p=o;p;p=p.parent){ if(!p.visible||(p.userData&&p.userData.seatAct)) return; } L.push(o); });
  const h=rc.intersectObjects(L,false)[0]; return h?h.point.y:null; }
async function zoneCase(id,label){ const G=mkG(DAY,15); const z=build(id,G); for(let i=0;i<20;i++) await wait(); z.group.updateMatrixWorld(true);
  sitAll(z,{pose:'sit',idlePose:'sit'}); await run(); for(let i=0;i<5;i++){ await wait(); SA.tick(GM); } const P=placed(), seats=z.seats||[];
  const far=[], air=[]; for(const p of P){ let d=1e9; for(const s of seats) d=Math.min(d,Math.hypot(p.x-s.x,p.z-s.z)); if(d>0.95) far.push(p.n.replace('desk:','')+'('+p.x.toFixed(2)+','+p.y.toFixed(2)+','+p.z.toFixed(2)+') '+d.toFixed(2)+'m');
    const sy=surfY(z,p.x,p.z,p.y); if(sy==null||Math.abs(sy-p.y)>0.01) air.push(p.n.replace('desk:','')+'('+p.x.toFixed(2)+','+p.z.toFixed(2)+') y '+p.y.toFixed(2)+' 下面 '+(sy==null?'沒有面':sy.toFixed(2))); }
  return {z,P,seats,far,air,g0:z.group.position.clone()}; }
(async()=>{
  const T=await zoneCase('wz_teahouse','一盞');
  check('A 一盞坐滿路人：桌上有東西', T.P.length>0, `${T.seats.length} 個座位、桌上 ${T.P.length} 件；房間群組 g0 位移 z ${T.g0.z.toFixed(2)}`);
  check('B 一盞桌上每一件離座位 0.95 m 內', T.P.length>0&&!T.far.length, T.far.length?T.far.length+' 件太遠：'+T.far.slice(0,4).join('；'):'');
  check('C 一盞桌上每一件下面有桌面（高度差 1 cm 內）', T.P.length>0&&!T.air.length, T.air.length?T.air.length+' 件浮空／埋著：'+T.air.slice(0,4).join('；'):'');
  const bb=T.seats.find(s=>Math.hypot(s.x+2.15,s.z+2.1)<0.05); const bbI=bb?T.P.filter(p=>Math.hypot(p.x-bb.x,p.z-bb.z)<0.9):[];
  check('D BB 的座位 (−2.15,−2.1)：桌上的東西在座位前 0.9 m 內', !!bb&&bbI.length>0, bb?bbI.map(p=>p.n.replace('desk:','')+'('+p.x.toFixed(2)+','+p.y.toFixed(2)+','+p.z.toFixed(2)+')').join('、')||'0.9 m 內沒有東西':'座位表沒有這一個');
  SA.clear();
  const C=await zoneCase('cafe','2:30 AM'); const id=SA.groups().every(g=>{ const e=g.matrixWorld.elements; return [1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1].every((v,i)=>Math.abs(e[i]-v)<1e-6); });
  check('E 沒有位移的區域（cafe）照舊：群組是單位矩陣、每一件離座位 0.95 m 內', C.P.length>0&&id&&!C.far.length, `桌上 ${C.P.length} 件${C.far.length?'；太遠：'+C.far.slice(0,3).join('；'):''}`);
  console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})();
