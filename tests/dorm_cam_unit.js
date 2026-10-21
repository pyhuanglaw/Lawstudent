// 宿舍房間（大一 203 等四人房）的跟隨鏡頭不會跑到上鋪、洗手間隔間後面（BUG-CAM-203-R2-1021，BB_218 artrev3 01／04／05／08）——不需要瀏覽器。
// BB 量到的：站在 R2 書桌旁 (1.0, 0.25)，鏡頭在東被 R2 的上鋪擋住整個畫面、鏡頭在南被洗手間的磁磚牆擋住。
// 做法（src/zones3d.js 的 dormCamCols）：洗手間隔間、四組上鋪（床板底 1.56～床欄頂 2.02）交給 engine3d.js 的 followCam（zone.camCols）；站在某一組上鋪底下時那一組不算。
// 這裡在 Node 建出遊戲真正的房間（程序化備用模型＝和正式模型同一份配置），每 0.3 m 一點（人站得住）、8 個方向，照引擎的跟隨鏡頭（camDist 3.6、俯角 0.38）算鏡頭位置，
// 看「頭 → 鏡頭」有沒有穿過洗手間隔間或上鋪（照配置自己算；站在那一組底下時那一組不算）。修改前的公式一定要量得到（證明測試抓得到這個 bug）。
// 另外：BB 的兩個方向 3 秒內轉開；坐在自己書桌前（上鋪底下）時鏡頭不會被拉到頭上。
// 用法：node tests/dorm_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|DORM_ROOM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0,seat:null,pose:'idle'};
const z=Z3.ZONES.dorm.build(E); E.zone=z; E.nav=z.nav; z.group.updateMatrixWorld(true);
const R=DORM_ROOM, H=R.room.h, PITCH=0.38, DIST=Z3.ZONES.dorm.camDist||3.6, DT=1/30;
check('引擎有 E.followCam、E.autoSwing',typeof E.followCam==='function'&&typeof E.autoSwing==='function');
check('鏡頭碰撞（zone.camCols[0]）：洗手間＋四組上鋪',Array.isArray(z.camCols)&&z.camCols[0]&&z.camCols[0].length===1+R.units.length,z.camCols&&z.camCols[0]?z.camCols[0].length+' 塊':'沒有');
/* 擋鏡頭的東西（照配置自己算，不拿 camCols 來量）：{x0,x1,z0,z1,y0,y1,unit} */
const OBST=[{x0:R.bath.block.x[0],x1:R.bath.block.x[1],z0:R.bath.block.z[0],z1:R.bath.block.z[1],y0:0,y1:H}].concat(R.units.map(u=>({x0:u.block.x[0],x1:u.block.x[1],z0:u.block.z[0],z1:u.block.z[1],y0:1.56,y1:2.02,unit:true})));
const under=(o,p)=>o.unit&&p.x>o.x0-0.1&&p.x<o.x1+0.1&&p.z>o.z0-0.1&&p.z<o.z1+0.1;
/* 線段穿過方盒（盒子每邊縮 3 cm：擦邊不算）：slab 法 */
function hitBox(a,b,o){ let t0=0,t1=1; const lo=[o.x0+0.03,o.y0+0.03,o.z0+0.03], hi=[o.x1-0.03,o.y1-0.03,o.z1-0.03], A=[a.x,a.y,a.z], D=[b.x-a.x,b.y-a.y,b.z-a.z];
  for(let i=0;i<3;i++){ if(Math.abs(D[i])<1e-9){ if(A[i]<lo[i]||A[i]>hi[i]) return false; continue; } let u=(lo[i]-A[i])/D[i], v=(hi[i]-A[i])/D[i]; if(u>v) [u,v]=[v,u]; t0=Math.max(t0,u); t1=Math.min(t1,v); if(t0>t1) return false; } return true; }
const blocked=(head,cam,p)=>OBST.find(o=>!under(o,p)&&hitBox(head,cam,o))||null;
const oldCam=(tgt,yaw)=>new THREE.Vector3(Math.sin(yaw)*DIST*Math.cos(PITCH),Math.sin(PITCH)*DIST+0.2,Math.cos(yaw)*DIST*Math.cos(PITCH)).add(tgt);
const setP=(x,zz)=>{ E.player.obj.position.set(x,0,zz); if(z.update) z.update(DT,E); };
let n=0, bad=0, badOld=0, ex=null;
for(let x=-R.room.w/2+0.4;x<=R.room.w/2-0.4;x+=0.3) for(let zz=-R.room.d/2+0.4;zz<=R.room.d/2-0.4;zz+=0.3){ if(!E.canStand(x,zz,0.32,0)) continue; setP(x,zz); const p=E.player.obj.position, tgt=new THREE.Vector3(x,1.45,zz);
  for(let k=0;k<8;k++){ const yaw=k*Math.PI/4; n++; if(blocked(tgt,oldCam(tgt,yaw),p)) badOld++;
    const cam=new THREE.Vector3(); E.followCam(tgt,yaw,PITCH,DIST,0,cam); const h=blocked(tgt,cam,p); if(h){ bad++; if(!ex) ex={x:+x.toFixed(1),z:+zz.toFixed(1),yaw:+yaw.toFixed(2),cam:cam.toArray().map(v=>+v.toFixed(2))}; } } }
check('修改前的公式量得到被上鋪、洗手間擋住的方向（測試抓得到這個 bug）',badOld>0,`${(100*badOld/n).toFixed(1)}%（${badOld}/${n}）`);
check('跟隨鏡頭不會跑到上鋪、洗手間隔間後面',bad===0,`${(100*bad/n).toFixed(1)}%（${bad}/${n}）`+(ex?' 例：'+JSON.stringify(ex):''));
/* BB 的兩個方向：3 秒內轉開、不穿過、離頭 ≥ 1.0 m、沒有左右來回 */
function sim(x,zz,yaw,o){ o=o||{}; const P=E.player; setP(x,zz); P.obj.rotation.y=o.face!=null?o.face:yaw+Math.PI; P.seat=o.seat||null; P.pose=o.seat?'sit':'idle';
  const C=E.cam={yaw,pitch:PITCH,dist:DIST,distTarget:DIST,target:new THREE.Vector3(x,1.45,zz),mode:'follow',manualT:0,dragging:false,ctl:false,swing:0,swingAcc:0};
  const cam=new THREE.Vector3(); let flips=0, last=0; for(let i=0;i<90;i++){ const r=E.followCam(C.target,C.yaw,PITCH,DIST,0,cam); const st=E.autoSwing(C,P,PITCH,r,DT); if(st&&last&&Math.sign(st)!==Math.sign(last)) flips++; if(st) last=st; }
  E.followCam(C.target,C.yaw,PITCH,DIST,0,cam); return {cam,tgt:C.target,h:Math.hypot(cam.x-x,cam.z-zz),turned:Math.round((C.yaw-yaw)*180/Math.PI),flips}; }
for(const [name,yaw] of [['R2 書桌旁・鏡頭在東（artrev3 01）',Math.PI/2],['R2 書桌旁・鏡頭在南（artrev3 04）',0]]){ const x=1.0, zz=0.25; setP(x,zz);
  const was=blocked(new THREE.Vector3(x,1.45,zz),oldCam(new THREE.Vector3(x,1.45,zz),yaw),E.player.obj.position); const r=sim(x,zz,yaw);
  check(name+'：修改前的鏡頭在上鋪／洗手間後面（重現得到 BB 的畫面）',!!was);
  check(name+'：3 秒內轉開——不穿過、鏡頭水平離頭 ≥ 1.0 m、沒有左右來回',!blocked(r.tgt,r.cam,E.player.obj.position)&&r.h>=1.0&&r.flips===0,`水平 ${r.h.toFixed(2)} m、比頭高 ${(r.cam.y-r.tgt.y).toFixed(2)} m、轉了 ${r.turned}°、來回 ${r.flips} 次`); }
/* 坐在自己的書桌前（上鋪底下）：自己那一組不算，鏡頭不會一出發就撞到床板、被拉到頭上 */
/* 鏡頭在背後、也試順著床的方向（北、南）：那兩個方向視線從床板下面往上穿，自己那一組要是算進去，鏡頭會被拉到頭上 0.12 m（坐著不會自動轉開；不排除自己那一組時量到 0.01 m）。
   北邊是隔壁 L1 的上鋪：鏡頭停在它前面（約 0.7 m）是對的——以前是穿過 L1 的床、畫面被床擋住 */
{ const me=R.units.find(u=>u.id===(R.player_unit||'L2'))||R.units[3], st=me.seat;
  for(const [dir,yaw] of [['背後',st.yaw+Math.PI],['北',Math.PI],['南',0]]){ const r=sim(st.x,st.z,yaw,{seat:{x:st.x,z:st.z},face:st.yaw});
    check('坐在自己書桌前（'+me.id+'）・鏡頭在'+dir+'：沒被自己的上鋪拉到頭上（水平離頭 ≥ 0.5 m）、沒穿過別的上鋪／洗手間',r.h>=0.5&&!blocked(r.tgt,r.cam,E.player.obj.position),`水平 ${r.h.toFixed(2)} m、比頭高 ${(r.cam.y-r.tgt.y).toFixed(2)} m`); } }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
