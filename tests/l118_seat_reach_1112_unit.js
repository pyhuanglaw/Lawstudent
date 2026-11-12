// L118-SEAT-FIX-1112（LAWWW2-C；BB_379 21:0x、CC L118_CAM36_a／b）：118 巷九間店點椅子走過去要走得到、按鈕要看得到。不需要瀏覽器。
//  1 九間店每一張有走近點（ap）的座位：從門口走到走近點不卡住（118牛排 #1、#10 原本夾在桌子和第一排椅子中間：卡 23 秒、遊戲把人放到目的地）
//  2 大學食堂窗邊兩張（坐窗邊）：按鈕範圍 ≥ 0.9 m（CC：走到旁邊停在 0.77 m，原本範圍 0.8 m＝沒有按鈕）
// 修改前（開發分支 ef21dcb1d0）：第 1 項 FAIL 2（dian #1、#10）、第 2 項 FAIL。用法：node tests/l118_seat_reach_1112_unit.js
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

let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const IDS=['dian','self','tea','home','cafe2','pasta','korea','omu','noodle2'];
for(const k of IDS){ const id='l118_'+k; build(id); const L=L118_SHOP_LAYOUTS[k], st=L.spawn; const bad=[]; let n=0;
  E.zone.seats.forEach((s,i)=>{ if(!s.ap) return; n++; const w=E.simWalk(st.x,st.z,s.ap[0],s.ap[1],{lv0:0,lv1:0,dt:1/30}); if(!w.ok) bad.push('#'+(i+1)+' ap '+s.ap.join(',')+' 停在 '+w.x+','+w.z); });
  check('1 '+L.name+'（'+k+'）：'+n+' 張有走近點的座位，從門口都走得到',bad.length===0,bad.join('；')); }
{ build('l118_cafe2'); const its=E.interactables.filter(it=>it.seat&&it.label==='坐窗邊'); check('2 大學食堂窗邊兩張按鈕範圍 ≥ 0.9 m',its.length===2&&its.every(it=>it.radius>=0.9),its.map(it=>it.radius).join('、')); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
