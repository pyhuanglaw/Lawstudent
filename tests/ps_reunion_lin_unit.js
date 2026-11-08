/* AA_723 重聚（70b0b51a9：林家乾麵兩張小方桌併在一起，在 wz_lin 演；AA723-CONFESS-PS-1107）：src/ps_silence3d.js 的 PSSIL.linSpots 挑的位子在遊戲真正的 wz_lin 裡站得住、走得到——
   不需要瀏覽器：在 Node 裡建出遊戲真正的區域（同 tests/wz_lin_v1c_unit.js），用引擎真正的找路＋移動碰撞（E.simWalk）走。
   ① 位子都是配置裡的座位（WZ_SHOPS_LAYOUT.lin.seats）、互不相同；兩張桌子是最近的一對；她坐最裡面（可以坐的椅子裡 z 最小）；你坐她那一桌、在她對面；Alison 坐她那一桌
   ② 用到的座位（不是 npcOnly 的）都從門口走得到那個「坐下」的範圍（seat_reach 的標準）；人不夠位子時站的點（stand）站得住、走得到，不在桌椅上
   ③ 阿哲、以安都在：坐另一桌的兩張木椅（不用 npcOnly 的紅凳）；多一個人（測試用）才站
   修改前：沒有 PSSIL.linSpots——FAIL。用法：node tests/ps_reunion_lin_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lin_layout.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/aa723.js','src/ps_silence3d.js'];
for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)) continue; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const J=JSON.stringify;
if(typeof PSSIL==='undefined'||!PSSIL.linSpots){ check('0. PSSIL.linSpots',false,'沒有'); console.log('FAILED '+fails); process.exit(1); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const stand=(x,z)=>E.canStand(x,z,0.3,0);
const L=WZ_SHOPS_LAYOUT.lin, zone=Z3.ZONES.wz_lin&&loadZone('wz_lin'), IN=zone?[zone.spawn.x,zone.spawn.z]:[0,0];
const pl=PSSIL.placeOf(AA723.peishan.reunion.plan.place);
check('0. plan.place「'+AA723.peishan.reunion.plan.place+'」＝區域 wz_lin、顯示「'+pl.label+'」（不給玩家看區域 id）',pl.zone==='wz_lin'&&!/wz_lin/.test(pl.label)&&!!zone,J(pl));
const sp=PSSIL.linSpots(L,['zhe','heroine_01']);
const key=q=>q.x.toFixed(2)+','+q.z.toFixed(2), byKey=new Map(L.seats.map(q=>[key(q),q]));
const used=sp?sp.cast.filter(c=>c.seat).map(c=>c.seat).concat([sp.me]):[];
/* ① */
{ const okSeat=used.every(q=>byKey.has(key(q))&&byKey.get(key(q)).table===q.table), uniq=new Set(used.map(key)).size===used.length;
  const T=L.tables, d2=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z), T1=sp&&T.find(t=>t.n===sp.tables[0]), dmin=T1?Math.min(...T.filter(t=>t!==T1).map(t=>d2(t,T1))):null, T2=sp&&T.find(t=>t.n===sp.tables[1]);
  const ps=sp&&sp.cast.find(c=>c.id==='classmate_peishan'), yu=sp&&sp.cast.find(c=>c.id==='yu'), inner=Math.min(...L.seats.filter(q=>!q.npcOnly&&!q.stool).map(q=>q.z));
  const tabs=sp?sp.tables.slice().sort():[], myT=sp&&L.tables.find(t=>t.n===sp.tables[0]);
  check('① 位子都是 wz_lin 配置裡的座位、互不相同（'+used.length+' 個）',!!sp&&okSeat&&uniq,J(used));
  check('① 兩張桌子：她那一桌＋離它最近的那一桌（桌 '+tabs.join('、')+'；併在一起的兩張，後排）',!!T1&&!!T2&&Math.abs(d2(T1,T2)-dmin)<1e-6&&T1.z<0&&T2.z<0,J({T1,T2,dmin}));
  check('① 沛珊坐最裡面（可以坐的椅子裡 z 最小：z '+inner+'）；你坐她那一桌、在她對面（面向她）；Alison 坐她那一桌',!!ps&&ps.seat.z===inner&&sp.me.table===ps.seat.table&&Math.abs(sp.me.x-ps.seat.x)<0.01&&sp.me.z>ps.seat.z&&Math.abs(Math.cos(sp.me.yaw)+1)<0.01&&!!yu&&yu.seat&&yu.seat.table===ps.seat.table,J({ps,me:sp&&sp.me,yu,myT})); }
/* ② */
{ const seatsIt=E.interactables.filter(q=>q.seat), bad=[];
  for(const q of used){ const s=byKey.get(key(q)); if(s&&s.npcOnly) continue; const it=seatsIt.find(i=>Math.hypot(i.seat.x-q.x,i.seat.z-q.z)<0.05); if(!it){ bad.push(key(q)+' 沒有「坐下」'); continue; }
    const R=(it.radius||0.8)-0.05; let ok=false; for(let r=0.3;r<=R&&!ok;r+=0.1) for(let a=0;a<6.28&&!ok;a+=0.26){ const x=it.x+Math.cos(a)*r, z=it.z+Math.sin(a)*r; if(stand(x,z)&&walk(IN,[x,z]).ok) ok=true; } if(!ok) bad.push(key(q)); }
  check('② 用到的座位都從門口走得到「坐下」的範圍（玩家那一張、沛珊、Alison、阿哲、以安）',!bad.length&&used.length===5,bad.join('｜'));
  const st=sp&&sp.stand, sOk=!!st&&stand(st.x,st.z)&&walk(IN,[st.x,st.z]).ok&&!L.seats.some(q=>Math.hypot(q.x-st.x,q.z-st.z)<0.35);
  check('② 位子不夠時站的點（另一桌靠走道那一邊）站得住、從門口走得到、不在椅子上',sOk,J(st)); }
/* ③ */
{ const zh=sp&&sp.cast.find(c=>c.id==='zhe'), an=sp&&sp.cast.find(c=>c.id==='heroine_01'), T2=sp&&sp.tables[1];
  check('③ 阿哲、以安坐另一桌的兩張木椅（不坐 npcOnly 的紅凳）',!!zh&&!!an&&zh.seat&&an.seat&&zh.seat.table===T2&&an.seat.table===T2&&![zh,an].some(c=>byKey.get(key(c.seat)).npcOnly||byKey.get(key(c.seat)).stool),J({zh,an}));
  const sp2=PSSIL.linSpots(L,['zhe','heroine_01','extra_a','extra_b']), ex=sp2&&sp2.cast.filter(c=>/^extra/.test(c.id));
  check('③ 人比位子多（測試用多兩個人）：多出來的站在旁邊（stand），不會兩個人坐同一張',!!ex&&ex.some(c=>c.stand)&&new Set(sp2.cast.filter(c=>c.seat).map(c=>key(c.seat)).concat([key(sp2.me)])).size===sp2.cast.filter(c=>c.seat).length+1,J(ex)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
