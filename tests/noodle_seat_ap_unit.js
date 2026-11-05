// NOODLE-AP-1105（BB-C 10:27 V21R_reach FAIL：shaola v7 以後麵店劇情自動走路走到椅子後面 0.5 m，4 處站不住、要等 4 秒 fallback）：
//   story3d.js 麵店那一場改走 GM.seatApproach（和 deskScene、「坐下」一樣）。用法：node tests/noodle_seat_ap_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(process.argv[2]||'.');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
for(const f of SRCS){ try{ vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='),{filename:f}); }catch(e){} }
console.warn=()=>{}; const out=console.log;
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
let fails=0; const check=(n,ok,info)=>{ out((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const G={day:20,weekday:3,hour:12,flags:{},social:{},zone:'noodle'}; if(typeof GAME!=='undefined') GAME.G=G;
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; const z=Z3.ZONES.noodle.build(E); if(z.id==null) z.id='noodle'; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
const seats=E.interactables.filter(it=>it&&it.seat);
/* 遊戲的「坐下」走近點：照 game3d.js 原文（seatApproach 只用到 E；cafe230_nobldg_nav_unit 同一個做法）*/
const SA=(()=>{ const s=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), a=s.indexOf('function seatApproach('), b=s.indexOf('GM.seatApproach=seatApproach;'); return new Function('E',s.slice(a,b)+'\nreturn seatApproach;')(E); })();
const sp=z.spawn||{x:0,z:0}; E.player={obj:{position:new THREE.Vector3(sp.x||0,0,sp.z||0),rotation:{y:0}},lv:0,radius:0.32};
check('0. 麵店（公館燒臘 shaola v7）有座位、GAME.seatApproach 在',seats.length>0&&!!SA,String(seats.length));
const bad=[], old=[];
for(const it of seats){ const ap=SA(it.seat); if(!E.canStand(ap[0],ap[1],0.3,0)) bad.push(it.label+' '+ap.map(v=>v.toFixed(2)).join(',')); if(!E.canStand(it.seat.x,it.seat.z+0.5,0.3,0)) old.push(it.seat.x.toFixed(2)+','+(it.seat.z+0.5).toFixed(2)); }
check('1. 每一張的 seatApproach 走近點都站得住（noodleScene 照這個走）',!bad.length,bad.join('｜'));
out('INFO 舊寫法（椅子 z+0.5）站不住的：'+old.length+' 處 '+old.join('｜'));
const SRC=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
check('2. story3d.js 麵店那一場改用 seatApproach（不再 walkTo 椅子 z+0.5）',/NOODLE-AP-1105/.test(SRC)&&!/await GM\.walkTo\(P,it\.seat\.x,it\.seat\.z\+0\.5\); GM\.sitAt\(P,it\.seat\); await GM\.sleep\(300\); GM\.advance\(0\.5\); if\(typeof EAT/.test(SRC));
out(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
