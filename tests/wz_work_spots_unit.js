// 溫州街三家店打工的站位（ART-WZ6；AA_420 第 9 節，DL-11；LAWWW2-B 2026-10-24）——不需要瀏覽器。
// WZ_SHOPS_LAYOUT.<店>.work：a／b／c 三段（jobs3d.js runShift 的開店・接單・院子／尖峰・做的時候・泡茶／收尾・交件・收席）＋end（下班時祐廷站的地方）。
// 在 Node 裡建出真正的區域（和 tests/wz_shops_unit.js 同一套）：祐廷的點站得住（半徑 0.32）、半熟與一盞從門口走得到；NPC 的點不在家具裡；同一段裡的人不疊在一起（≥ 0.6 m）；
// 下班的點（end）站得住、從門口走得到。阿德影印 v1c（ade_layout v3，2026-11-04）：櫃台東端開了，櫃台後面從門口走得到（原本走不到：缺口只剩一格導航格）；a.me 坐櫃台後面的辦公椅（act sit：查旁邊站得起來）。
// 修改前：沒有 work（第 1 項就失敗）。用法：node tests/wz_work_spots_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
check('1. 三家店都有打工的站位 work（a、b、c 三段各有 me、boss；end）',['brunch','print','teahouse'].every(k=>{ const W=WZ_SHOPS_LAYOUT[k].work; return !!W&&['a','b','c'].every(s=>W[s]&&W[s].me&&W[s].boss)&&!!W.end; }));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z)=>{ for(let R=0.3;R<=0.8+1e-6;R+=0.05) for(let a=0;a<48;a++){ const px=x+Math.cos(a*Math.PI/24)*R, pz=z+Math.sin(a*Math.PI/24)*R; if(E.canStand(px,pz,0.32,0)) return [px,pz]; } return null; };   /* 坐著的位置旁邊站得起來的那一點（0.8 m 內）*/
for(const k of ['brunch','print','teahouse']){ const L=WZ_SHOPS_LAYOUT[k], W=L.work; loadZone('wz_'+k); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[E.zone.spawn.x,E.zone.spawn.z];
  const meBad=[], npcBad=[], close=[], far=[];
  for(const s of ['a','b','c']){ const P=W[s];
    /* act 'sit'（阿德影印 v1c 的 a.me＝櫃台後面的辦公椅）：坐的位置在椅子上（配置的 blocks 擋住椅子），改查「是配置的座位、旁邊 0.8 m 內站得起來」——原本的期望「站得住」在 v1c 不成立（舊配置的辦公椅沒有阻擋）；依據 LAWWW 07:16 決定＋BB_257＋CC_49 v1c */
    const sitP=P.me.act==='sit'&&(L.seats||[]).some(q=>Math.hypot(q.x-P.me.x,q.z-P.me.z)<0.05)?nearStand(P.me.x,P.me.z):null, meAt=sitP||[P.me.x,P.me.z];
    if(!(sitP||E.canStand(P.me.x,P.me.z,0.32,0))) meBad.push(s+':me');
    for(const [who,p] of Object.entries(P)){ if(who==='me') continue; if(!E.canStand(p.x,p.z,0.05,0)) npcBad.push(s+':'+who+'('+p.x+','+p.z+')'); }
    const ps=Object.entries(P); for(let i=0;i<ps.length;i++) for(let j=i+1;j<ps.length;j++){ const a=ps[i][1], b=ps[j][1]; if(Math.hypot(a.x-b.x,a.z-b.z)<0.6) close.push(s+':'+ps[i][0]+'/'+ps[j][0]); }
    { const r=Math.hypot(meAt[0]-sp[0],meAt[1]-sp[1])<0.05?{ok:true}:walk(sp,meAt); if(!r.ok) far.push(s+':'+(r.reason||'')); }   /* 阿德影印 v1c 櫃台東端開了：三段也要走得到（原本 print 不查）*/
    for(const v of Object.values(P)) if(typeof v.yaw!=='number'||!isFinite(v.yaw)) npcBad.push(s+': yaw'); }
  check('2. '+L.name+'：三段祐廷的位置都站得住（半徑 0.32）',!meBad.length,meBad.join('、'));
  check('2. '+L.name+'：老闆、同事的位置不在家具裡',!npcBad.length,npcBad.join('、'));
  check('2. '+L.name+'：同一段裡的人沒有疊在一起（≥ 0.6 m）',!close.length,close.join('、'));
  check('2. '+L.name+'：三段祐廷的位置都從門口走得到（坐著的：旁邊站得起來的那一點）',!far.length,far.join('、'));
  const e=W.end, re=Math.hypot(e.x-sp[0],e.z-sp[1])<0.05?{ok:true}:walk(sp,[e.x,e.z]);
  check('3. '+L.name+'：下班的點 ('+e.x+','+e.z+') 站得住、從門口走得到',E.canStand(e.x,e.z,0.32,0)&&re.ok,re.reason||'');
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou'); check('3. '+L.name+'：下班的點離出口互動點 ≤ 3 m（走兩步就能出去）',!!ex&&Math.hypot(e.x-ex.x,e.z-ex.z)<=3,ex?Math.hypot(e.x-ex.x,e.z-ex.z).toFixed(2):''); }
/* 阿德影印：v1c（ade_layout v3，CC 5977272dc）櫃台東端是開的——櫃台後面從客人區走得到（原本的期望是「走不到」：舊配置的缺口只剩一格；依據 BB_257＋CC_49 v1c、LAWWW 07:16 決定）*/
{ loadZone('wz_print'); const W=WZ_SHOPS_LAYOUT.print.work, sp=[E.zone.spawn.x,E.zone.spawn.z]; const rb=walk(sp,[W.b.me.x,W.b.me.z]), rc=walk(sp,[W.c.me.x,W.c.me.z]);
  check('4. 阿德影印 v1c：櫃台後面（b、c 祐廷的位置）從門口走得到（櫃台東端開了）',rb.ok&&rc.ok,(rb.reason||'')+' '+(rc.reason||'')); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
