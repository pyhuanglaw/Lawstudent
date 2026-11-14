// 子晴 c504_4_3「公館騎樓的咖啡店」(12, 20.6) 坐得下（ZQ-C504-LAPTOP-1101 方案 A，LAWWW2-C 2026-11-13）——不需要瀏覽器。
// 原本：afar 門口（G07）重做以後騎樓沒有座位，最近的是 G08 柱子邊的紅凳子 (15.6, 19.8)，3.7 m（seatAt 只找 3.5 m 內）；旁白又是咖啡店桌邊、筆電、冰美式。
// 這一包：gg_afar_terrace.glb（Poly Haven outdoor_table_chair_set_01）放在 afar 大窗前；zones3d.js 公館兩個座位、桌椅腳印（GG_PROP_BLOCKS 最後三塊）、載入模型；assets3d.js manifest。
// 檢查：
//   ① 公館有兩個「坐在 afar 門口的小桌」，面向桌子；c504_4_3 的作息點離最近的那張 3.5 m 內（seatAt 找得到），而且最近的是有冰美式的西邊那張
//   ② 座位和模型的椅子對得上（gg_afar_terrace.json 的 seats，誤差 < 0.15 m）；桌椅三塊腳印都在 GG_PROP_BLOCKS
//   ③ 每張椅子的 ap（騎樓那一側）站得住；騎樓沿著走（afar 門口西邊 8 → 東邊 15）找得到路；afar 店門口（門 x 7.93、z 21）站得住
//   ④ manifest 有 bldg.gg_afar_terrace、檔案在；LICENSES.md 有 outdoor_table_chair_set_01 那一列
// 修改前（開發 19399e5d39）：FAIL 4（① 沒有座位、② 沒有腳印、③ 沒有座位就沒有 ap、④ 沒有模型）。用法：node tests/zq_c504_afar_seat_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
ASSETS.loadOne=k=>Promise.reject(new Error('node：不載 '+k));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.gongguan.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const J=fs.existsSync(path.join(ROOT,'assets/models/env/second_ai/gg_afar_terrace.json'))?JSON.parse(fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gg_afar_terrace.json'),'utf8')):null;
const seats=(z.seats||[]).filter(s=>s.label==='坐在 afar 門口的小桌');
const hc=fs.readFileSync(path.join(ROOT,'src/data/heroine_circle.js'),'utf8').split('\n').find(l=>l.includes("hc:'c504_4_3'")), m=hc&&hc.match(/at:\[([\d.\-]+),([\d.\-]+)/), P=m?[+m[1],+m[2]]:null;
{ const d=seats.map(s=>P?Math.hypot(s.x-P[0],s.z-P[1]):99), near=seats[d.indexOf(Math.min(...d))], tb=J&&J.parts&&J.parts.table;
  const face=tb&&seats.every(s=>{ const want=Math.atan2(tb.x-s.x,tb.z-s.z); return Math.abs(Math.atan2(Math.sin(s.yaw-want),Math.cos(s.yaw-want)))<0.2; });
  const its=seats.filter(s=>E.interactables.some(i=>i.seat===s));
  check('① 兩個「坐在 afar 門口的小桌」、面向桌子、玩家坐得下去；c504_4_3 '+JSON.stringify(P)+' 最近的那張在 3.5 m 內、是有冰美式的西邊那張',seats.length===2&&!!face&&its.length===2&&!!near&&Math.min(...d)<3.5&&!!J&&near.x===Math.min(...seats.map(s=>s.x))&&J.cup[0]<tb.x,
    seats.length?('距離 '+d.map(v=>v.toFixed(2)).join('／')):'沒有座位'); }
{ const blocks=(Z3.PROP_BLOCKS&&Z3.PROP_BLOCKS.gongguan)||[];
  const has=(x,zz)=>blocks.some(b=>Math.abs(b[0]-x)<0.1&&Math.abs(b[1]-zz)<0.1);
  const ok=!!J&&J.seats.length===2&&J.seats.every(js=>seats.some(s=>Math.hypot(s.x-js.x,s.z-js.z)<0.15))&&['table','01','02'].every(k=>J.parts[k]&&has(J.parts[k].x,J.parts[k].z));
  check('② 座位對得上模型的椅子；桌椅三塊腳印在 GG_PROP_BLOCKS',ok,J?'':'沒有 gg_afar_terrace.json'); }
{ for(const b of ((Z3.PROP_BLOCKS&&Z3.PROP_BLOCKS.gongguan)||[]).slice(-3)) z.nav.blockRect(b[0],b[1],b[2],b[3],0,0.25);   /* 模型接上時才擋（zones3d.js propBlocks 同一個 pad）：node 不載模型，這裡自己擋上桌椅那三塊 */
  const aps=seats.map(s=>s.ap&&E.canStand(s.ap[0],s.ap[1],0.32,0));
  const p_=z.nav.path?z.nav.path(8.0,21.0,15.0,21.0):null;   /* 起訖點貼著桌椅那一排（z 21），路要從桌椅前面繞 */
  const door=E.canStand(7.93,20.6,0.32,0);
  check('③ 椅子的 ap 站得住；騎樓 x 8 → 15 找得到路；afar 店門口站得住',seats.length===2&&aps.every(Boolean)&&!!p_&&p_.length>0&&door,'ap '+aps.join(',')+'、路 '+(p_?p_.length+' 點':'沒有')+'、門口 '+door); }
{ const mf=ASSETS.manifest['bldg.gg_afar_terrace'], ok=!!mf&&fs.existsSync(path.join(ROOT,mf.url));
  const lic=fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8').split('\n').some(l=>l.includes('outdoor_table_chair_set_01')&&l.includes('gg_afar_terrace'));
  check('④ manifest＋檔案、LICENSES.md 那一列',ok&&lic,'manifest '+!!mf+'、檔案 '+ok+'、LICENSES '+lic); }
console.log(fails?`${fails} FAIL`:'ALL PASS'); process.exit(fails?1:0);
