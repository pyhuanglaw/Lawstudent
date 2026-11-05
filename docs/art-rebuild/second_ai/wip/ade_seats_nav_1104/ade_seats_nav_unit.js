/* 阿德影印（wz_print）座位、站位、打工的位置（ADE-SEATS-NAV-1104，LAWWW2-C 11-05；BB-C 11-04 13:00 依 CC ADE_int_in／ADE_int_job）。不需要瀏覽器：
   在 Node 裡建出遊戲真正的區域（zones3d.js wzShop），照引擎 E.loadZone 的順序呼叫 E.fitSeatRadius，用引擎的 E.canStand、E.nearestInteractable、E.simWalk 檢查：
   ① 四張客人椅子：按鈕範圍裡有人站得住、站在那裡「最近的互動」就是那張椅子（「印東西」不會蓋掉），而且從店門口（出生點）走得到那一點
   ② 站著的客人（stands 三點）、阿德（clerk、staff 三點）、打工 b、c 的 me 和老闆的位置：站得住、從店門口走得到
   ③ 打工 a 的 me＝櫃台後面的辦公椅（坐著）：有走近點（ap）、站得住、從店門口走得到、離椅子 0.9 m 內——v1c 沒有 ap：前、後、兩側的候選點都站不住（櫃台、西牆、後櫃、椅子），這一項會 FAIL
   ④ JOBS.station（jobs3d.js）：一班三段，每一段開始前把玩家帶到 work.{a,b,c}.me 的 0.6 m 內（走路用 E.simWalk 檢查走得到；a 是坐下）；
      runShift 在 sg.a、sg.b、sg.c 前面都叫 S.station——修改前沒有這個函式（CC ADE_int_job：三個站位最近 1.94／2.04／1.1 m），這一項會 FAIL
   CC 瀏覽器那三個「坐下了 FAIL」不是遊戲的錯：截圖裡玩家已經坐下、跳出「坐一下，看看四周／起身」的選單，選單開著時 player.busy 一直是 true，
   探針等的是「坐著而且不忙」（說明在 docs/art-rebuild/second_ai/wip/ade_seats_nav_1104/README.md）。這是模擬，不是真實玩家流程。用法：node tests/ade_seats_nav_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/zones3d.js',
  'src/data/wz_jobs.js','src/jobs3d.js'];
const _warn=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; _warn(...a); };   /* GLB 在 node 裡載不到（fetch），用備用模型：不影響導航 */
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const z=Z3.ZONES.wz_print.build(E); E.zone=z; E.levels=null; E.nav=z.nav; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
E.fitSeatRadius();
const L=WZ_SHOPS_LAYOUT.print, IN=[z.spawn.x,z.spawn.z];
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };
const nearestAt=(x,zz)=>{ E.player.obj.position.set(x,0,zz); return E.nearestInteractable(); };
// ① 四張客人椅子
{ const seats=E.interactables.filter(it=>it.seat), bad=[];
  for(const it of seats){ const r=(it.radius||0.9)-0.05, c=[]; for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d<=r&&E.canStand(it.x+dx,it.z+dz,0.32,0)) c.push([d,it.x+dx,it.z+dz]); }
    c.sort((a,b)=>a[0]-b[0]); const ok=c.find(q=>nearestAt(q[1],q[2])===it&&walk(IN,[q[1],q[2]]).ok); if(!ok) bad.push(it.label+'('+it.x+','+it.z+')'); }
  check('① 四張客人椅子：按鈕範圍裡站得住、最近的互動是那張椅子（「印東西」沒有蓋掉）、從店門口走得到',seats.length===4&&!bad.length,seats.length+' 張'+(bad.length?'；不行：'+bad.join('、'):'')); }
// ② 站位
{ const pts=[...L.stands.map((p,i)=>['stands'+i,p]),['clerk',[L.clerk.x,L.clerk.z]],...L.npc.staff.map((p,i)=>['阿德'+i,[p.x,p.z]]),
    ['打工 b 的 me',[L.work.b.me.x,L.work.b.me.z]],['打工 c 的 me',[L.work.c.me.x,L.work.c.me.z]],['打工 a 的老闆',[L.work.a.boss.x,L.work.a.boss.z]],['打工 b 的老闆',[L.work.b.boss.x,L.work.b.boss.z]],['打工 c 的老闆',[L.work.c.boss.x,L.work.c.boss.z]]];
  const bad=pts.filter(([n,p])=>!E.canStand(p[0],p[1],0.3,0)||!walk(IN,p).ok).map(([n])=>n);
  check('② 站著的客人、阿德、打工 b／c 的 me、老闆的位置：站得住、從店門口走得到',!bad.length,pts.length+' 點'+(bad.length?'；不行：'+bad.join('、'):'')); }
// ③ 打工 a：辦公椅的走近點
{ const m=L.work.a.me, ap=m.ap; const ok=!!ap&&E.canStand(ap[0],ap[1],0.3,0)&&walk(IN,ap).ok&&Math.hypot(ap[0]-m.x,ap[1]-m.z)<=0.9;
  const seat=L.seats.find(s=>s.kind==='office_chair'), same=!!seat&&!!seat.ap&&!!ap&&seat.ap[0]===ap[0]&&seat.ap[1]===ap[1];
  check('③ 打工 a（櫃台後面的辦公椅）：有走近點 ap、站得住、從店門口走得到、離椅子 0.9 m 內；seats 的辦公椅同一個 ap',ok&&same,ap?JSON.stringify(ap)+'，離椅子 '+Math.hypot(ap[0]-m.x,ap[1]-m.z).toFixed(2)+' m':'沒有 ap'); }
// ④ JOBS.station：一班三段走到站位
(async()=>{
  const has=typeof JOBS!=='undefined'&&typeof JOBS.station==='function';
  const src=fs.readFileSync(path.join(ROOT,'src/jobs3d.js'),'utf8'), rs=(src.match(/S\.runShift=async function[\s\S]*?finally \{ GM\.sceneEnd\(\); S\.running=false; \}/)||[''])[0];
  const wired=['a','b','c'].every(s=>new RegExp("S\\.station\\(GM,k,'"+s+"'\\); await S\\.play\\(GM,sg\\."+s+"\\)").test(rs));
  if(!has){ check('④ JOBS.station 存在、runShift 在 sg.a／b／c 前面叫它',false,'沒有 JOBS.station（打工的時候人不會走到站位）'); }
  else {
    const P=E.player; P.obj.position.set(IN[0],0,IN[1]); const log=[];
    const GM={E,G:{zone:'wz_print'},
      walkTo:async(ent,x,zz)=>{ const a=[ent.obj.position.x,ent.obj.position.z], r=walk(a,[x,zz]); log.push({from:a.map(v=>+v.toFixed(2)),to:[+x.toFixed(2),+zz.toFixed(2)],ok:r.ok}); if(r.ok) ent.obj.position.set(x,0,zz); },
      seatApproach:st=>st.ap&&E.canStand(st.ap[0],st.ap[1],0.3,0)?st.ap:[st.x,st.z],   /* 遊戲的 seatApproach：seat.ap 站得住就優先用它（game3d.js 的候選第一個，pen −1）*/
      sitAt:(ent,st)=>{ ent.seat=st; ent.obj.position.set(st.x,0,st.z); }, standUp:ent=>{ ent.seat=null; } };
    const got={};
    for(const s of ['a','b','c']){ await JOBS.station(GM,'copy',s); const m=L.work[s].me, d=Math.hypot(P.obj.position.x-m.x,P.obj.position.z-m.z); got[s]=+d.toFixed(2)+(L.work[s].me.act==='sit'?(P.seat?'（坐著）':'（沒坐）'):''); }
    const okAll=['a','b','c'].every(s=>parseFloat(got[s])<=0.6)&&log.every(q=>q.ok)&&!!P.seat===false;
    check('④ JOBS.station：一班三段（接單、做的時候、交件）每一段都走到 work.{a,b,c}.me 的 0.6 m 內、路都走得到；a 坐下、b 以後起身',okAll&&got.a.indexOf('（坐著）')>0,JSON.stringify(got)+'；走了 '+log.length+' 段'+(log.some(q=>!q.ok)?'，走不到：'+JSON.stringify(log.filter(q=>!q.ok)):''));
    const otherZone=await JOBS.station(Object.assign({},GM,{G:{zone:'wenzhou'}}),'copy','a'), otherShop=await JOBS.station(GM,'brunch','a');
    check('④ 人不在店裡、早午餐店（還沒開）不動',otherZone===false&&otherShop===false);
    check('④ runShift 在 sg.a、sg.b、sg.c 前面都叫 S.station',wired); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
