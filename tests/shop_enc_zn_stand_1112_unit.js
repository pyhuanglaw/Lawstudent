// 宋知寧在山嵐書店二樓站哪裡（AA_828 第 6 節；任務 SHOP-JOBS-1112 第四輪）——不需要瀏覽器（D131）。
// 在 Node 建出遊戲真正的山嵐書店（Z3.ZONES.xs_shanlan，兩層導航），用真的 CROWD.SHOP_ZONES、真的 E.canStand 檢查：
//   1. 區域在（xs_shanlan，兩層）；SHOPENC.shanlanOpen() 是 true（修改前：看的是不存在的 shanlan，永遠 false）
//   2. CROWD 的山嵐二樓有站點（lv 1），每一點在二樓站得住（半徑 0.3）、不在按鈕上——SHOPENC.standPick 只從這幾點挑，沒有另外寫座標
//   3. 進店（SHOPENC.enter）→ 她的位置是二樓的站點之一、預約了（路人不站那一點）；SHOPENC.after 生她在二樓、腳在二樓的地板上
// 用法：node tests/shop_enc_zn_stand_1112_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setProp(){ return false; },SIT_TOP:0.45};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2,dayOfKey:dayOf,noodleDay:()=>false};
const FILES=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js',
  'src/data/wz_shops_layout.js','src/data/daily_offbeat_layout.js','src/data/lin_layout.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/data/lane118_props.js','src/zones3d.js',
  'src/data/xinsheng_layout.js','src/data/shanlan_layout.js','src/shanlan3d.js','src/data/calendar.js','src/data/places.js','src/crowd3d.js','src/data/shop_enc.js','src/shopenc3d.js','src/data/shop_jobs_aa828.js'];
for(const f of FILES){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=JSON.stringify, SHAN='xs_shanlan', ZN='npc_songzn', E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
/* E.addNPC：引擎的那一支要用到畫面的 scene（Node 沒有）；這裡照它放高度的那一段（engine3d.js E.addNPC：沒坐著的放在所在那一層的地板上）*/
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; const o=n.obj.position, nv=E.navOf(n.lv); if(nv&&(nv.surf||nv.y0)) o.y=nv.heightAt(o.x,o.z); E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
function enter(G){ global.GAME={G}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[SHAN].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(z.nav) z.nav._cm=null; if(z.levels) for(const n of z.levels) if(n) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; E.camera=null; G.zone=SHAN; return z; }

const mv0=(()=>{ for(let d=100;d<420;d++){ const T=CALENDAR.termOf(d); if(T&&T.id==='Y1S2'&&T.week===3) return d; } })();
check('0. 測試用的日子找得到（大一下第 3 週）',mv0!=null);
check('1. 區域 xs_shanlan 在、沒有叫 shanlan 的區域；SHOPENC.shanlanOpen()',!!Z3.ZONES[SHAN]&&!Z3.ZONES.shanlan&&SHOPENC.shanlanOpen()&&SHOPENC.spots().includes(SHAN));
const mv=(()=>{ for(let d=100;d<420;d++){ const T=CALENDAR.termOf(d); if(T&&T.id==='Y1S2'&&T.week===3) return d; } })();
const F={SHOP_ZN_MET:true,SHOP_ZN_CONTACT:true,SHOP_ZN_BK:{c0:mv-60,sent:[0,1,2,3,4],terms:{},last:mv,moved:mv}};
const mkG=(d,h)=>({day:d,hour:h,weekday:CALENDAR.dateOf(d).wd%7,flags:F,stage:'law',daily:{},invites:[],zone:SHAN});
const def=CROWD.SHOP_ZONES[SHAN], up=def?def.units.filter(u=>u.stand&&u.kind!=='pay'&&(u.lv|0)===1).map(u=>u.stand):[];
{ const G=mkG(mv+1,15), z=enter(G);
  check('1. 兩層（levels 兩個導航）',Array.isArray(z.levels)&&z.levels.length>=2&&!!z.levels[1]);
  check('2. CROWD 的山嵐二樓有站點（'+up.length+' 個）',up.length>=1,J(up));
  const bad=up.filter(p=>!E.canStand(p[0],p[1],0.3,1)||E.interactables.some(i=>!i.seat&&!i.hidden&&(i.lv|0)===1&&Math.hypot(i.x-p[0],i.z-p[1])<(i.exit?1.0:0.45)));
  check('2. 每一個二樓站點：二樓站得住（半徑 0.3）、不在二樓的按鈕上',bad.length===0,J(bad));
  const picks=new Set(); for(let i=0;i<40;i++){ const p=SHOPENC.standPick({E,G},SHAN,'k'+i,1); if(p) picks.add(J(p)); }
  check('2. SHOPENC.standPick（二樓）只從這幾點挑、帶樓層 1',picks.size>=1&&[...picks].every(s=>{ const p=JSON.parse(s); return p[3]===1&&up.some(q=>q[0]===p[0]&&q[1]===p[1]); }),J([...picks])); }
/* 找一個擲到她的週六或週日 */
let hit=null; for(let d=mv+1;d<mv+90&&!hit;d++){ const T=CALENDAR.termOf(d), wd=CALENDAR.dateOf(d).wd%7; if(!T||T.exam||(wd!==6&&wd!==0)) continue; const G=mkG(d,15); const dec=SHOPENC.decide(G,SHAN); if(dec&&dec.who===ZN) hit=d; }
check('3. 找得到一個擲到她的週末',hit!=null);
if(hit!=null){ const G=mkG(hit,15); enter(G); CROWD.shopStandRes={}; const GM={G,E,D:{active:false}}; const d=SHOPENC.enter(GM,SHAN), st=d&&d.place&&d.place.stand;
  check('3. 進店：她的位置＝二樓站點之一（沒有取消）',!!st&&!d.cancel&&st[3]===1&&up.some(q=>q[0]===st[0]&&q[1]===st[1]),J(d));
  check('3. 預約了那一點（路人不站）',!!st&&CROWD.shopStandReserved(SHAN,st[0],st[1],G)===true);
  const n=SHOPENC.after(GM,SHAN);
  const nv=E.navOf?E.navOf(1):null, fy=nv?(nv.heightAt?nv.heightAt(st[0],st[1]):nv.y0):null;
  check('3. 生她在二樓：lv 1、在那一點、腳在二樓地板的高度（'+(fy!=null?fy.toFixed(2):'?')+' m；不是一樓的 0）',!!n&&n.lv===1&&n.shopZn&&Math.abs(n.obj.position.x-st[0])<1e-6&&Math.abs(n.obj.position.z-st[1])<1e-6&&fy!=null&&fy>3&&Math.abs(n.obj.position.y-fy)<0.05,n&&J([n.lv,n.obj.position.y,fy]));
  check('3. 她的按鈕「和知寧說話」、到那一天的下班時間',!!n&&n.talkLabel==='和知寧說話'&&n.until===(G.weekday===0?18:17),n&&J([n.talkLabel,n.until])); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
