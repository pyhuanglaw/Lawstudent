/* FLOWER-2F-TAPNAV-1112（LAWWW2-C；CC SSB_gg2_r2 run.log：花序二樓起身後點一樓「離開花序」(0,6.6)，點 13～16 次人都停在二樓欄杆前 (−0.76,−0.07)）
   原因：從二樓看下去，射線先打到二樓樓板最外緣（欄杆內 0.3 m，站不住），找路只能走到欄杆前。改法：E.tapThroughEdge（engine3d.js screenToFloor）。
   1 從二樓欄杆前、起身的位置看一樓門口：點下去的目標是一樓（lv 0）、而且從那裡找得到路走到門口
   2 二樓一般的地板照舊是二樓；二樓靠牆站不住的地方（正下方被二樓樓板蓋住）照舊是二樓，不會被送下樓
   3 一樓點一樓照舊；樓梯照舊（stairEnds）
   修改前（開發分支 6230a4123e）：1 FAIL。模擬（D131）。用法：node tests/flower_2f_tapnav_1112_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch')); const clog=console.log; console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e.message.slice(0,50)); } }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; const R=0.32;
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.id=id; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.fitSeatRadius) E.fitSeatRadius();   /* 遊戲載入區域時做的（座位按鈕範圍碰不到站得住的地方就放大）*/ E.player={obj:{position:new THREE.Vector3(0,0,0)},lv:0,radius:R}; return z; }

let fails=0; const check=(name,ok,info)=>{ clog((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const z=build('flower_notes'); z.group.updateMatrixWorld(true); const wm=z.walkMeshes; const rc=new THREE.Raycaster();
const tap=(cam,tgt)=>{ const o=new THREE.Vector3(...cam), d=new THREE.Vector3(...tgt).sub(o).normalize(); rc.set(o,d); rc.near=0; rc.far=Infinity; const hits=rc.intersectObjects(wm,false); if(!hits.length) return null; const h=(E.tapThroughEdge&&E.tapThroughEdge(hits,wm))||hits[0]; return {x:h.point.x,z:h.point.z,lv:h.object.userData.walkLv|0,first:hits[0].object.userData.walkLv|0,fz:hits[0].point.z}; };
check('0. 有 E.tapThroughEdge',typeof E.tapThroughEdge==='function');
const ex=E.interactables.find(i=>/離開/.test(i.label||'')); const bad=[]; let n=0;
for(const pl of [[-0.76,-0.07],[-1.27,-4.49],[0.4,-0.2],[-2,-0.15]]) for(const back of [3.2,4.0]) for(const up of [2.0,2.6]){ const cam=[pl[0],3.9+up,pl[1]-back]; for(const tg of [[ex.x,0,ex.z],[0,0,5.5],[-1,0,4]]){ const r=tap(cam,tg); if(!r) continue; if(r.first!==1||r.fz<0.5-0.5) continue; n++; const okLv=r.lv===0, p=okLv&&E.pathTo(pl[0],pl[1],1,r.x,r.z,0); if(!okLv||!p||!p.length) bad.push(pl+' cam '+cam.map(v=>v.toFixed(1))+' → '+tg+' 得到 lv'+r.lv+' ('+r.x.toFixed(2)+','+r.z.toFixed(2)+')'); } }
check('1. 從二樓看一樓（'+n+' 次射線先打到二樓樓板外緣 0.5 m 內）：目標改成一樓、找得到路',n>0&&!bad.length,bad.slice(0,4).join('；'));
const b2=[]; for(const [cam,tg] of [[[0,6.5,-6],[0,3.9,-3]],[[-1,6.5,-3],[-1.5,3.9,-5]],[[0,6.5,-2],[-4.6,3.9,-4]],[[0,6.5,-2],[4.6,3.9,-6.6]],[[0,6.5,-2],[-4.65,3.9,-6.7]],[[-0.8,6.5,-3.5],[-0.8,3.9,-0.5]]]){ const r=tap(cam,tg); if(!r||r.lv!==1) b2.push(tg+' → '+(r?'lv'+r.lv:'沒打到')); }
check('2. 二樓地板、桌子、靠牆、離欄杆 1 m 的地方照舊是二樓',!b2.length,b2.join('；'));
const b3=[]; for(const [cam,tg] of [[[0,2.6,6],[0,0,3]],[[1,2.6,5],[-3,0,2]]]){ const r=tap(cam,tg); if(!r||r.lv!==0) b3.push(tg+' → '+(r?'lv'+r.lv:'沒打到')); }
check('3. 一樓點一樓照舊',!b3.length,b3.join('；'));
clog(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
