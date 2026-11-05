// Daybreak 4 張座位走得到、按得到坐下（DAYBREAK-SEAT-AP-1105，LAWWW2-C 11-05；BB-C SEATSCAN ee7afe9c2：seatApproach 的 8 個候選點一個都站不住，v9.10.20 線上就有）——不需要瀏覽器（D131）。
// 在 Node 載入 index.html 的全部程式、建出 daybreak 區域：
//   ① 每一張玩家能坐的位子（有「坐下」互動點的），走近點候選（seat.ap＋game3d.js seatApproach 那 8 個）至少一個站得住（半徑 0.3）、在按鈕範圍裡（範圍 −0.05）、從店門走得到
//   ② 這 4 張有指定的走近點（seat.ap）、按鈕範圍 1.5 m
//   ③ 從店門口走到每一張的走近點：引擎的找路（E.pathTo）找得到
// 修改前（開發分支 2bb7bc92f）：① FAIL 4 張、② FAIL。用法：node tests/daybreak_seat_ap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const G={day:20,weekday:3,hour:14,flags:{},social:{},zone:'daybreak'}; if(typeof GAME!=='undefined') GAME.G=G;
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
const z=Z3.ZONES.daybreak.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const n=E.nav, stand=(x,zz)=>n.clear?n.clear(x,zz,0.3):n.free(x,zz);
const sp=z.spawn, [sc,sr]=n.toCell(sp.x,sp.z), seen=new Uint8Array(n.cols*n.rows), q=[[sc,sr]]; seen[n.idx(sc,sr)]=1;
while(q.length){ const [c,r]=q.shift(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const nc=c+dc, nr=r+dr; if(nc<0||nr<0||nc>=n.cols||nr>=n.rows) continue; const i=n.idx(nc,nr); if(seen[i]||n.blocked(nc,nr)) continue; seen[i]=1; q.push([nc,nr]); } }
const reachable=(x,zz)=>{ const [c,r]=n.toCell(x,zz); return c>=0&&r>=0&&c<n.cols&&r<n.rows&&!!seen[n.idx(c,r)]; };
const sits=E.interactables.filter(q=>q&&q.seat); const bad=[]; const best={};
for(const it of sits){ const st=it.seat, yaw=st.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), reach=(it.radius||1.8)-0.05;
  const C=[...(st.ap?[[st.ap[0]-st.x,st.ap[1]-st.z]]:[]),[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]];
  let b=null; for(const [dx,dz] of C){ const x=st.x+dx, zz=st.z+dz; if(!stand(x,zz)||!reachable(x,zz)) continue; const d=Math.hypot(x-it.x,zz-it.z); if(d>reach) continue; if(!b||d<b.d) b={x,z:zz,d}; }
  best[st.x+','+st.z]=b; if(!b) bad.push((it.label||'?')+' ('+st.x+', '+st.z+')'); }
check('① 每一張玩家能坐的位子都有站得住、按得到、從店門走得到的走近點', !bad.length&&sits.length>0, bad.join('、')||(sits.length+' 張'));
const FOUR=[[-1.5,3.45],[-4.2,0.3],[-4.2,1.5],[2.05,-3.5]];
const four=FOUR.map(([x,zz])=>sits.find(q=>Math.abs(q.seat.x-x)<0.01&&Math.abs(q.seat.z-zz)<0.01));
check('② 這 4 張有指定的走近點（seat.ap）、按鈕範圍 1.5 m', four.every(it=>it&&Array.isArray(it.seat.ap)&&it.radius===1.5), four.map(it=>it?('('+it.seat.ap+') r'+it.radius):'沒有').join('｜'));
const paths=four.map(it=>{ if(!it||!it.seat.ap||!E.pathTo) return false; const p=E.pathTo(sp.x,sp.z,0,it.seat.ap[0],it.seat.ap[1],0); return !!(p&&(p.length||p.pts||p===true)); });
check('③ 從店門口找路走得到這 4 張的走近點（E.pathTo）', paths.every(Boolean), paths.join(','));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
