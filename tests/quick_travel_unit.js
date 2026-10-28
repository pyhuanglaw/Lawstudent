// 快速前往的落點（D54 ①；使用者 2026-10-13：「快速前往不會把玩家放到牆內或無法離開的位置」）——不需要瀏覽器。
// 在 Node 裡建出遊戲真正的區域，對 PLACES.quickList() 的每一個地點：
//   落點（沒寫就是區域預設的出生點）站得住（人物半徑 0.32 m、那一層）；從落點用引擎真正的找路＋移動碰撞走到這個區域的每一個出口（「走得出去」）；
//   快速前往的時間照距離算、合理（同一個地方 0、其他 5～30 分鐘）。
// 這是模擬（證明站得住、走得出去），不是真實玩家流程；真實流程在 tests/flow_teaching_buildings.py（手機「地點」）。
// 用法：node tests/quick_travel_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/gym_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/gym3d.js'];   /* gym3d.js：快速前往的新體育館（BB-C 10-27 23:4x）*/
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|GYM_LAYOUT|GY3|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const list=PLACES.quickList().filter(p=>Z3.ZONES[p[0]]);
check('快速前往的清單（'+list.length+' 個地點）每個區域都存在',list.length>=15&&PLACES.quickList().every(p=>Z3.ZONES[p[0]]),PLACES.quickList().filter(p=>!Z3.ZONES[p[0]]).map(p=>p[0]).join(','));
const byZone={}; for(const p of list) (byZone[p[0]]=byZone[p[0]]||[]).push(p);
for(const zid in byZone){ let z; try{ z=loadZone(zid); }catch(e){ check(zid+' 區域建得起來',false,String(e).slice(0,160)); continue; }
  const exits=E.interactables.filter(i=>i.exit);
  for(const [,label,sp] of byZone[zid]){ const s=sp||z.spawn||{x:0,z:0}; const lv=s.lv|0;
    const st=E.canStand(s.x,s.z,0.32,lv); check(label+'：落點 ('+s.x.toFixed(1)+','+s.z.toFixed(1)+(lv?','+(lv+1)+'F':'')+') 站得住（不在牆裡、家具裡）',st);
    if(!st) continue;
    /* 走得出去：走到這個區域的出口（離開建築、往別的區域）。校園很大，只走到最近的三個出口 */
    const ex=exits.map(i=>({i,d:Math.hypot(i.x-s.x,i.z-s.z)})).sort((a,b)=>a.d-b.d).slice(0,zid==='campus'?3:exits.length);
    /* 出口的按鈕在「離出口 radius 以內」出現：找 radius 以內最靠近出口、站得住的點，走過去 */
    const bad=[]; let okN=0; for(const {i} of ex){ const tl=i.lv|0, R=(i.radius||1.5)-0.05; let best=null; for(let rr=0;rr<=R&&!best;rr+=0.1) for(let a=0;a<24;a++){ const tx=i.x+Math.cos(a/24*Math.PI*2)*rr, tz=i.z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,tl)){ best=[tx,tz]; break; } }
      const r=best?(Math.hypot(best[0]-s.x,best[1]-s.z)<0.05&&tl===lv?{ok:true}:E.simWalk(s.x,s.z,best[0],best[1],{lv0:lv,lv1:tl,dt:0.1,speed:4.1})):null;
      if(r&&r.ok) okN++; else bad.push((i.label||'出口')+(r?'：'+r.reason:'：出口旁邊站不住')); }
    check(label+'：從落點走得到出口（'+okN+'/'+ex.length+'）',ex.length>0&&!bad.length,bad.join('、')); } }
// 時間
{ const G={day:3,hour:10,zone:'dorm'}; const m=(a,b,pos,to)=>CLS.travelMinutes(G,a,b,pos,to);
  const ms=list.map(p=>({l:p[1],m:m('dorm',p[0],null,p[0]==='campus'?p[2]:null)})); const bad=ms.filter(q=>q.l!=='宿舍'&&(q.m<5||q.m>30));
  check('從宿舍快速前往的時間都在 5～30 分鐘（照真實步行；宿舍本身 0）',!bad.length&&ms.find(q=>q.l==='宿舍').m===0,ms.map(q=>q.l+' '+q.m).join('、')); }
{ const G={day:3,hour:10,zone:'gongguan'}; const a=CLS.travelMinutes(G,'gongguan','gongguan',{x:0,z:-30},{x:-35.6,z:13.2}), b=CLS.travelMinutes(G,'gongguan','gongguan',{x:-34,z:12},{x:-35.6,z:13.2}), c=CLS.travelMinutes(G,'noodle','noodle',null,null);
  check('公館兩個落點（商圈、捷運站）照距離算：從商圈到捷運站要走幾分鐘、站在捷運站旁邊＝0（你在這裡）；其他室內同一區＝0（BB-B 10-23）',a>=5&&b===0&&c===0,JSON.stringify([a,b,c])); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
