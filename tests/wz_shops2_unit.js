// 溫州街林家乾麵（A4）、巷子裡定食（B3）能進去內用（WZ-SHOP-AA364-ART，LAWWW2 2026-10-22；AA_364）——不需要瀏覽器。
// 建出真正的區域：出生點、每個座位、出口、點餐／看菜單的位置走得到；沒有小孤島；店面窗外的景大小；溫州街的兩個店門從主巷走得到、原本的「看」拿掉、出來的落點站得住。
// 修改前：沒有 wz_lin 區域（第 1 項就失敗）。用法：node tests/wz_shops2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（導航、座位、互動點不靠模型；第 5 項自己換成假的）*/
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
const nearStand=(x,z,R)=>{ for(let rr=0;rr<=R;rr+=0.1) for(let a=0;a<24;a++){ const tx=x+Math.cos(a/24*Math.PI*2)*rr, tz=z+Math.sin(a/24*Math.PI*2)*rr; if(E.canStand(tx,tz,0.32,0)) return [tx,tz]; } return null; };
// ---- 林家乾麵、巷子裡定食（WZ-SHOP-AA364-ART）----
const K=['lin','teishoku'];
check('1. 兩個區域都有（wz_lin、wz_teishoku）、配置也有',K.every(k=>!!Z3.ZONES['wz_'+k]&&!!WZ_SHOPS_LAYOUT[k]));
if(fails){ console.log('FAILED '+fails); process.exit(1); }
check('1. 正式模型登錄在 ASSETS（zones3d.js 自己登錄，不動 assets3d.js），lazy、building',K.every(k=>{ const m=ASSETS.manifest['bldg.wz_'+k+'_interior']; return m&&m.type==='building'&&m.lazy&&/wz_.*_interior\.glb$/.test(m.url); }));
const reachI=(i,sp)=>{ const R=i.radius-0.05, pts=[]; for(let dx=-R;dx<=R+1e-9;dx+=0.2) for(let dz=-R;dz<=R+1e-9;dz+=0.2){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(E.canStand(x,zz,0.32,0)) pts.push([x,zz]); }
  pts.sort((a,b)=>Math.hypot(a[0]-sp[0],a[1]-sp[1])-Math.hypot(b[0]-sp[0],b[1]-sp[1])); for(const p of pts.slice(0,8)){ if(Math.hypot(p[0]-sp[0],p[1]-sp[1])<0.05||walk(sp,p).ok) return true; } return false; };
/* 小孤島：0.1 m 取樣、站得住的點從出生點連通；連不到的面積（m²）＝滑進去出不來的縫（v9.3 #31） */
function islands(sp,x0,x1,z0,z1){ const S=0.1, nx=Math.round((x1-x0)/S)+1, nz=Math.round((z1-z0)/S)+1, ok=new Uint8Array(nx*nz), seen=new Uint8Array(nx*nz); let tot=0;
  for(let j=0;j<nz;j++) for(let i=0;i<nx;i++){ if(E.canStand(x0+i*S,z0+j*S,0.32,0)){ ok[j*nx+i]=1; tot++; } }
  const si=Math.round((sp[0]-x0)/S), sj=Math.round((sp[1]-z0)/S); const st=[sj*nx+si]; if(!ok[st[0]]) return {tot,lost:tot}; seen[st[0]]=1; let n=0;
  while(st.length){ const c=st.pop(); n++; const i=c%nx, j=(c-i)/nx; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const a=i+di, b=j+dj; if(a<0||b<0||a>=nx||b>=nz) continue; const q=b*nx+a; if(ok[q]&&!seen[q]){ seen[q]=1; st.push(q); } } }
  return {tot,lost:tot-n}; }
const EXITS={};
for(const k of K){ const L=WZ_SHOPS_LAYOUT[k]; const z=loadZone('wz_'+k); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
  check('2. '+L.name+'：出生點 ('+sp.map(v=>+v.toFixed(2))+') 站得住',E.canStand(sp[0],sp[1],0.32,0));
  const seats=E.interactables.filter(i=>i.seat&&i.shop===k);
  check('2. '+L.name+'：座位 '+L.seats.length+' 個都在',seats.length===L.seats.length,seats.length+'/'+L.seats.length);
  { const hi=L.seats.filter(s=>s.lift); const zs=hi.map(s=>(E.zone.seats||[]).find(q=>Math.abs(q.x-s.x)<1e-6&&Math.abs(q.z-s.z)<1e-6)), is=hi.map(s=>seats.find(i=>Math.abs(i.seat.x-s.x)<1e-6&&Math.abs(i.seat.z-s.z)<1e-6));
    if(hi.length||k==='teishoku') check('2. '+L.name+'：吧台高腳凳的座位帶 lift 0.27（座面 0.72 m；沒有的話人坐進凳子裡）',hi.length===(k==='teishoku'?6:0)&&zs.every(q=>q&&q.lift===0.27)&&is.every(i=>i&&i.seat.lift===0.27),hi.length+' 個；區域 '+zs.map(q=>q&&q.lift).join(',')+'；按鈕 '+is.map(i=>i&&i.seat.lift).join(',')); }
  const bad=seats.filter(i=>!reachI(i,sp)).map(i=>'('+i.x+','+i.z+')');
  check('2. '+L.name+'：每個座位旁邊站得住、從門口走得到',!bad.length,bad.join('、'));
  /* 「坐下」會先走到椅子旁邊（GAME.seatApproach：座位指定的 ap，或前 0.5、後 0.6、左右 0.55、後 0.7／0.75、前 0.8、後 0.9 m，第一個站得住、走得到的點）。
     j23 reachability_all（10-22）：林家乾麵第一張桌子（夾在攤車和第二張桌子中間）的兩張椅子一個候選都站不住，seatApproach 退回椅子前面 0.5 m＝桌子裡面，走過去卡住。
     j23b（10-22）：ap 只寫進區域的座位表（z.seats），「坐下」按鈕的座位是另一份、沒有 ap（GAME.seatMenu → freeSeat 沒人坐就原樣回傳 → seatApproach），所以照舊卡住：這裡量按鈕的座位 */
  const apBad=seats.map(i=>i.seat).filter(s=>{ const fx=Math.sin(s.yaw||0), fz=Math.cos(s.yaw||0);
    const C=[...(s.ap?[[s.ap[0]-s.x,s.ap[1]-s.z]]:[]),[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]];
    return !C.some(([dx,dz])=>{ const x=s.x+dx, zz=s.z+dz; if(!E.canStand(x,zz,0.3,0)) return false; const p=E.pathTo(sp[0],sp[1],0,x,zz,0); return !!p&&p.length>0&&Math.hypot(p[p.length-1][0]-x,p[p.length-1][1]-zz)<=0.6; }); }).map(s=>'('+s.x+','+s.z+')');
  check('2. '+L.name+'：每張椅子「坐下」走近的點至少一個站得住、從門口走得到（GAME.seatApproach 的候選）',!apBad.length,apBad.join('、'));
  { const wa=L.seats.filter(s=>s.ap), miss=wa.filter(s=>{ const i=seats.find(q=>Math.abs(q.seat.x-s.x)<1e-6&&Math.abs(q.seat.z-s.z)<1e-6), q=(E.zone.seats||[]).find(q=>Math.abs(q.x-s.x)<1e-6&&Math.abs(q.z-s.z)<1e-6); return !(i&&i.seat.ap&&q&&q.ap&&i.seat.ap[0]===s.ap[0]&&i.seat.ap[1]===s.ap[1]&&q.ap[0]===s.ap[0]&&q.ap[1]===s.ap[1]); });
    if(wa.length) check('2. '+L.name+'：配置寫了 ap 的座位，「坐下」按鈕和區域的座位表都帶著',!miss.length,wa.length+' 個'+(miss.length?'；少了 '+miss.map(s=>'('+s.x+','+s.z+')').join('、'):'')); }
  const ex=E.interactables.find(i=>i.exit&&i.exit.to==='wenzhou');
  check('2. '+L.name+'：「'+(ex&&ex.label)+'」走得到',!!ex&&reachI(ex,sp));
  const pts=(L.interact||[]).map(q=>({x:q.x,z:q.z,radius:1.0}));
  const bad2=pts.filter(i=>!reachI(i,sp)).map(i=>'('+i.x+','+i.z+')');
  check('2. '+L.name+'：點餐／結帳、看菜單的位置站得到、走得到（按鈕由 LAWWW 接）',!bad2.length,bad2.join('、'));
  const isl=islands(sp,-L.w/2,L.w/2,-L.d/2,L.d/2);
  check('2. '+L.name+'：沒有走進去出不來的小孤島（0.1 m 取樣）',isl.lost===0,'站得住 '+isl.tot+' 點、連不到 '+isl.lost+' 點');
  /* 窗外的景：整面店面一片大的（winW／winH），room() 預設的 2.2×1.6 不變 */
  const w=z.wins&&z.wins[0]; const g=w&&w.geometry.parameters;
  check('2. '+L.name+'：店面窗外的景 '+L.front.viewW+'×'+L.front.viewH+'、中心高 '+L.front.viewY,!!g&&Math.abs(g.width-L.front.viewW)<1e-6&&Math.abs(g.height-L.front.viewH)<1e-6&&Math.abs(w.position.y-L.front.viewY)<1e-6,g?g.width+'×'+g.height+' y '+w.position.y:'沒有窗');
  EXITS[k]={ex,L}; }
// 其他房間的窗還是 2.2×1.6（room() 預設沒變）
{ const z=loadZone('wz_brunch'); const g=z.wins&&z.wins[0]&&z.wins[0].geometry.parameters; check('3. 其他房間的窗大小沒變（半熟：2.2×1.6、中心高 2.1）',!!g&&g.width===2.2&&g.height===1.6&&z.wins[0].position.y===2.1,g?g.width+'×'+g.height:'沒有窗'); }
// 溫州街：兩個店門「進去」從主巷走得到；原本的「看林家乾麵」「看定食店」不見了；出店的落點站得住、不在店門按鈕的範圍裡
{ const z=loadZone('wenzhou'); const lane=[0,0];
  for(const k of K){ const L=WZ_SHOPS_LAYOUT[k]; const d=E.interactables.find(i=>i.exit&&i.exit.to==='wz_'+k);
    check('4. 溫州街：「'+L.enterAt.label+'」在 ('+L.enterAt.x+','+L.enterAt.z+')、從主巷走得到',!!d&&reachI(d,lane));
    const so=EXITS[k].ex.exit.spawn; const dd=d?Math.hypot(so.x-d.x,so.z-d.z):0;
    check('4. 溫州街：從'+L.name+'出來站的位置站得住',E.canStand(so.x,so.z,0.32,0),'('+so.x+','+so.z+')');
    /* 出來的地方在店門按鈕的範圍裡沒關係（其他三家也是），但不能被別的按鈕蓋過：站在那裡最近的是這家店的門 */
    let best=null, bd=1e9; for(const q of E.interactables){ const dq=Math.hypot(q.x-so.x,q.z-so.z); if(dq<=q.radius&&dq<bd){ bd=dq; best=q; } }
    check('4. 溫州街：從'+L.name+'出來時，最近的按鈕是自己的店門（不會跳出別的）',!best||best===d,best?best.label:'');
  }
  check('4. 溫州街：原本的「看林家乾麵」「看定食店」換成進店',!E.interactables.some(i=>i.label==='看林家乾麵'||i.label==='看定食店'));
  check('4. 溫州街：其他三家的店門照舊',['brunch','print','teahouse'].every(k=>E.interactables.some(i=>i.exit&&i.exit.to==='wz_'+k))); }
// 5. 巷子裡定食的和紙燈籠網點透空（j23：晚上坐四人桌，靠門那一盞吊在鏡頭前面）：配置的材質真的在正式模型裡；模型接上以後那個材質標了 seeThrough、patch 過 shader，區域打開 seeThru；林家乾麵不開
(async()=>{
  { const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/wz_teishoku_interior.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
    const names=(j.materials||[]).map(m=>m.name), want=WZ_SHOPS_LAYOUT.teishoku.seeThru||[];
    check('5. 巷子裡定食：配置的網點透空材質在正式模型裡（'+want.join('、')+'）',want.length>0&&want.every(nm=>names.includes(nm)),names.filter(nm=>/washi/.test(nm)).join('、')); }
  const pend=[], MATS=['GLOW_wz_teishoku_washi','wz_teishoku_wood','wz_teishoku_vc'];
  ASSETS.loadOne=k=>{ if(k==='bldg.wz_teishoku_interior'){ const g=new THREE.Group(); for(const nm of MATS){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm})); me.name=nm; g.add(me); } const p=Promise.resolve({scene:g}); pend.push(p); return p; } return new Promise(()=>{}); };
  const z=loadZone('wz_teishoku'); await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.material&&MATS.includes(o.material.name)) mats[o.material.name]=o.material; });
  check('5. 巷子裡定食：區域打開 seeThru（室內的網點透空）',z.seeThru===true);
  check('5. 巷子裡定食：和紙燈籠標了 seeThrough、patch 過 shader',!!(mats.GLOW_wz_teishoku_washi&&mats.GLOW_wz_teishoku_washi.userData.seeThrough&&mats.GLOW_wz_teishoku_washi.userData._st));
  check('5. 巷子裡定食：其他材質不透空',MATS.slice(1).every(nm=>mats[nm]&&!mats[nm].userData.seeThrough),Object.keys(mats).length+' 種材質');
  const zl=loadZone('wz_lin'); check('5. 林家乾麵：不開 seeThru',!zl.seeThru);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
