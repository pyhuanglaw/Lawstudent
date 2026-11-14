/* SOCLIB2F-PLANT-TRAP-1112（LAWWW2-C；BB_255 P0、CC SOFA_SOCLIB2F）：社科院圖書館東側館一樓，木格柵牆和沙發之間 0.1 m 寬的縫、盆栽旁的小口袋——人走進去被夾住，搖桿、點地都動不了。
   1 那條縫（x −3.4、z −3.2～0.4）和口袋（x −3.7～−3.5、z −5.0）站不進去；BB 記到的兩個位置也站不進去
   2 一樓沒有「窄到只有一格」的地方（0.1 m 格子：站得住、但東西、南北兩個方向連續站得住都不到 0.3 m）
   3 兩張沙發照舊坐得到（走近點在東側、站得住、從出生點走得到）
   修改前（開發分支 21a0319ca1）：1、2 FAIL。模擬（D131）。用法：node tests/soclib2f_plant_trap_1112_unit.js */
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
const z=build('soclib_2f'); const cs=(x,zz)=>E.canStand(x,zz,0.32,0);
const bad=[]; for(let zz=-3.2;zz<=0.41;zz+=0.1) if(cs(-3.4,zz)) bad.push('(-3.4,'+zz.toFixed(1)+')'); for(const x of [-3.7,-3.6,-3.5]) if(cs(x,-5.0)) bad.push('('+x+',-5.0)'); for(const p of [[-3.48,-3.01],[-3.79,-5.07]]) if(cs(p[0],p[1])) bad.push('BB '+p);
check('1. 格柵牆和沙發之間的縫、盆栽旁的口袋、BB 記到的兩個位置都站不進去',!bad.length,bad.slice(0,6).join(' '));
const n=E.levels[0], a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1), x0=Math.min(a[0],b[0]), x1=Math.max(a[0],b[0]), z0=Math.min(a[1],b[1]), z1=Math.max(a[1],b[1]), h=0.1, W=Math.round((x1-x0)/h)+1, H=Math.round((z1-z0)/h)+1, S2=new Uint8Array(W*H);
for(let j=0;j<H;j++) for(let i=0;i<W;i++) S2[j*W+i]=cs(x0+i*h,z0+j*h)?1:0;
const run=(i,j,di,dj)=>{ let k=1; for(let s=1;s<4;s++){ const ii=i+di*s, jj=j+dj*s; if(ii<0||jj<0||ii>=W||jj>=H||!S2[jj*W+ii]) break; k++; } for(let s=1;s<4;s++){ const ii=i-di*s, jj=j-dj*s; if(ii<0||jj<0||ii>=W||jj>=H||!S2[jj*W+ii]) break; k++; } return k; };
const thin=[]; for(let j=0;j<H;j++) for(let i=0;i<W;i++) if(S2[j*W+i]&&run(i,j,1,0)<3&&run(i,j,0,1)<3) thin.push('('+(x0+i*h).toFixed(1)+','+(z0+j*h).toFixed(1)+')');
check('2. 一樓沒有只有一格寬的地方',thin.length===0,thin.length+' 格：'+thin.slice(0,8).join(' '));
const sofas=E.interactables.filter(it=>it.label==='坐在沙發上'&&(it.lv|0)===0); const sp=z.spawn; let okS=sofas.length>0, info=[];
for(const it of sofas){ const ap=it.seat.ap; if(!ap||!(ap[0]>-2.2)||!cs(ap[0],ap[1])){ okS=false; info.push('ap '+JSON.stringify(ap)); continue; } const r=E.simWalk(sp.x,sp.z,ap[0],ap[1],{lv0:sp.lv|0,lv1:0}); if(!r.ok){ okS=false; info.push('走不到 '+ap); } }
check('3. 一樓 '+sofas.length+' 張沙發：走近點在東側、站得住、從出生點走得到',okS,info.join('；'));
clog(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
