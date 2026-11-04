// 阿德影印 v1c 接進遊戲（CC〔帳號 A〕cc-testing 5977272dc：src/data/ade_layout.js v3＋bb_support/ade.glb；BB 代驗 MODEL_READY BB_257、CC_49 v1c）——不需要瀏覽器（D131）。
// 遊戲真正的區域（zones3d.js 的 wzShop('print') 照 WZ_SHOPS_LAYOUT.print 建）、引擎真正的找路、移動（E.simWalk）、CROWD 真正的店內客人：
//   1. WZ_SHOPS_LAYOUT.print＝ade_layout.js 的 print（深度比較；sync 工具補的 version 3、保留的 moved 以外一樣）；正式模型登錄 bldg.wz_print_interior_v3＝bb_support/ade.glb（檔案在）、LICENSES 一行
//   2. 店員（阿德）：story3d.js 讀配置的 clerk (−0.95, −3.4, 0)，不再寫死 (−0.9, 0.4)；那一點站得住、從出生點走得到
//   3. 打工的櫃台：src/data/wz_jobs.js 的 copy.desk＝(−0.2, −2.95)（配置的 jobDesk／staff_gate）；站得住、走得到
//   4. 站著的客人、店內偶遇的三點＝配置的 stands (−1.0,2.6,−π/2)、(1.0,3.2,π/2)、(−1.0,−1.8,π)（CROWD 的 wz_print 站位、SHOPENC.standPick 從這裡挑）；站得住、走得到
//   5. 客人座位 4 個（自助電腦那四張椅子；LAWWW 07:16 決定客人可以坐）：區域座位 4、「坐下」按鈕 4、每一個按得到、從出生點走得到；打工的辦公椅、阿芃的凳子不給客人
//   6. 出生點 3.65、印東西 (−0.6, 1.75)、買文具 (1.45, 2.7) 照舊；出口按得到
//   7. 沒有走不出去的小孤島（canStand 0.1 m 取樣、連通區塊；和 tests/wz_interiors_aa659_unit.js A5 一樣）
//   9. 正式模型（bb_support/ade.glb）接上以後：GLOW_panel_* 十個合成一個光暈網格、照開燈切換（和 AA 新室內同一套 wzAAattach）
//   8. 客人會坐：CROWD 的 wz_print 有座位組（4 張）；15 個上課日 12:30 進店，有人坐在那四張椅子上、同時最多 2 位（影印店 cap 照舊）
// 修改前（開發分支 31ce5f785）：1～5、8 FAIL（還是舊的 wz_print_interior 配置：沒有 clerk、stands、客人座位 0）。用法：node tests/ade_v1c_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
console.warn=()=>{}; process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
global.CHAR={build:spec=>{ const g=new THREE.Group(); g.userData.spec=spec; return g; },release(){},setProp(){ return false; }};
global.STORY={extraSpec:i=>({id:'x'+i,sex:i%2===0?'f':'m'}),CROWD_X:2,dayOfKey:dayOf,noodleDay:()=>false};
for(const f of ['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js',
  'src/data/lane118_shops.js','src/data/lane118_props.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/calendar.js','src/data/places.js','src/lane118.js','src/data/l118_shop_layouts.js','src/l118_shops3d.js','src/noodle_closed3d.js','src/crowd3d.js','src/data/wz_jobs.js']){
  let src=rd(f); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(src,{filename:f}); }
ASSETS.loadOne=()=>new Promise(()=>{});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
global.GAME={G:{zone:'wenzhou',day:30,hour:15,flags:{},money:5000,weather:'clear'}};
const req=f=>{ delete require.cache[require.resolve(path.join(ROOT,f))]; return require(path.join(ROOT,f)); };
const deq=(a,b)=>{ try{ require('assert').deepStrictEqual(a,b); return true; }catch(e){ return false; } };
const A=fs.existsSync(path.join(ROOT,'src/data/ade_layout.js'))?req('src/data/ade_layout.js'):null, AP=A&&A.print, L=WZ_SHOPS_LAYOUT.print;
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},radius:0.32,lv:0,seat:null}; if(E.fitSeatRadius) E.fitSeatRadius(); return {z,its:E.interactables.slice()}; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{dt}); if(!r.ok) return Object.assign({dt:r2(dt)},r); } return {ok:true}; };
const okPt=(p,sp)=>E.canStand(p[0],p[1],0.3,0)&&walk(sp,[p[0],p[1]]).ok;
function touchable(it,from){ const r=(it.radius||1.5)-0.05, P=E.player, c=[];
  for(let dz=-r;dz<=r+1e-6;dz+=0.1) for(let dx=-r;dx<=r+1e-6;dx+=0.1){ const d=Math.hypot(dx,dz); if(d>r) continue; const x=it.x+dx, z=it.z+dz; if(E.canStand(x,z,0.32,0)) c.push([d,x,z]); }
  c.sort((a,b)=>a[0]-b[0]); for(const [,x,z] of c){ P.obj.position.set(x,0,z); if(E.nearestInteractable()!==it) continue; if(from&&!walk(from,[x,z]).ok) continue; return [r2(x),r2(z)]; } return null; }
// ---- 1 ----
{ const c=Object.assign({},L); delete c.version; delete c.moved;
  check('1. WZ_SHOPS_LAYOUT.print＝ade_layout.js v3 的 print（version、moved 以外深度比較）',!!AP&&A.version===3&&L.version===3&&deq(c,AP)&&!!L.moved&&!!L.moved.enterAt,J({ade:!!AP,ver:L.version,glb:L.glb}));
  let out=''; try{ out=cp.execFileSync('node',[path.join(ROOT,'tools/layout/sync_wz_aa_layouts.js'),'--check'],{encoding:'utf8'}); }catch(e){ out=String(e.stdout||e); }
  check('1. tools/layout/sync_wz_aa_layouts.js --check（含 print）',/OK/.test(out)&&/'print','src\/data\/ade_layout\.js'/.test(rd('tools/layout/sync_wz_aa_layouts.js')),out.trim()); }
const R=loadZone('wz_print'), z=R.z, its=R.its, sp=[z.spawn.x,z.spawn.z];
{ const man=ASSETS.manifest['bldg.wz_print_interior_v3'];
  check('1. 正式模型登錄 bldg.wz_print_interior_v3＝assets/models/env/second_ai/bb_support/ade.glb（檔案在）、舊的 bldg.wz_print_interior 不動、LICENSES 一行',!!man&&man.url==='assets/models/env/second_ai/bb_support/ade.glb'&&fs.existsSync(path.join(ROOT,man.url))&&/wz_print_interior\.glb$/.test(ASSETS.manifest['bldg.wz_print_interior'].url)&&rd('LICENSES.md').includes('`assets/models/env/second_ai/bb_support/ade.glb`'),J(man&&man.url)); }
// ---- 2 ----
{ const st=rd('src/story3d.js'), c=L.clerk;
  check('2. 店員讀配置的 clerk (−0.95, −3.4, 0)；story3d.js 不再寫死 (−0.9, 0.4)',!!c&&c.x===-0.95&&c.z===-3.4&&c.yaw===0&&/zoneId==='wz_print'\)\{ const LP=typeof WZ_SHOPS_LAYOUT!=='undefined'&&WZ_SHOPS_LAYOUT\.print&&WZ_SHOPS_LAYOUT\.print\.clerk; if\(LP\) clerk\(LP\.x,LP\.z,LP\.yaw,47\)/.test(st)&&!/zoneId==='wz_print'\) clerk\(-0\.9,0\.4/.test(st));
  check('2. 店員的位置站得住、從出生點走得到（經櫃台東端）',!!c&&okPt([c.x,c.z],sp),J(c&&[c.x,c.z])); }
// ---- 3 ----
{ const d=WZ_JOBS_DATA.shops.copy.desk; check('3. 打工的櫃台 copy.desk＝(−0.2, −2.95)（配置 jobDesk）、站得住、走得到',d.x===-0.2&&d.z===-2.95&&!!L.jobDesk&&L.jobDesk.x===d.x&&L.jobDesk.z===d.z&&okPt([d.x,d.z],sp),J(d)); }
// ---- 4 ----
{ const want=[[-1.0,2.6,-Math.PI/2],[1.0,3.2,Math.PI/2],[-1.0,-1.8,Math.PI]], def=CROWD.SHOP_ZONES&&CROWD.SHOP_ZONES.wz_print, got=def?def.units.filter(u=>u.stand).map(u=>u.stand):[];
  check('4. 配置的 stands 三點 (−1.0,2.6,−π/2)、(1.0,3.2,π/2)、(−1.0,−1.8,π)',!!L.stands&&J(L.stands.map(p=>p.map(r2)))===J(want.map(p=>p.map(r2))));
  check('4. CROWD 的 wz_print 站位＝配置的 stands（SHOPENC.standPick 從這裡挑）',J(got.map(p=>p.map(r2)))===J(want.map(p=>p.map(r2))),J(got));
  const bad=want.filter(p=>!okPt(p,sp)); check('4. 三點站得住、從出生點走得到',!bad.length,J(bad)); }
// ---- 5 ----
{ const seatIts=its.filter(i=>i.seat&&i.shop==='print'), bad=seatIts.filter(i=>!touchable(i,sp)).map(i=>i.label+'@'+r2(i.x)+','+r2(i.z));
  const chairs=(L.seats||[]).filter(s=>s.kind==='chair');
  check('5. 客人座位 4 個（區域座位 4、「坐下」按鈕 4＝配置的四張椅子）；辦公椅（打工）、阿芃的凳子不給客人',chairs.length===4&&z.seats.length===4&&seatIts.length===4&&chairs.every(s=>z.seats.some(q=>Math.abs(q.x-s.x)<0.01&&Math.abs(q.z-s.z)<0.01))&&!z.seats.some(q=>Math.hypot(q.x+1.84,q.z+3.55)<0.05||Math.hypot(q.x-1.5,q.z+2.85)<0.05),J({seats:z.seats.length,btn:seatIts.length}));
  check('5. 四個座位都按得到、從出生點走得到',seatIts.length===4&&!bad.length,bad.join(' ')); }
// ---- 6 ----
{ const pr=its.find(i=>i.wzShop==='print'&&i.kind==='print'), stn=its.find(i=>i.wzShop==='print'&&i.kind==='stationery'), ex=its.find(i=>i.exit&&i.exit.to==='wenzhou');
  check('6. 出生點 (0, 3.65)、印東西 (−0.6, 1.75)、買文具 (1.45, 2.7) 照舊',r2(z.spawn.z)===3.65&&z.spawn.x===0&&!!pr&&pr.x===-0.6&&pr.z===1.75&&!!stn&&stn.x===1.45&&stn.z===2.7,J({sp,pr:pr&&[pr.x,pr.z],stn:stn&&[stn.x,stn.z]}));
  const bad=[pr,stn,ex].filter(i=>!i||!touchable(i,sp)).map(i=>i?i.label:'(沒有)'); check('6. 印東西、買文具、出口按得到、從出生點走得到',!bad.length,bad.join(' ')); }
// ---- 7 ----
{ const n=z.nav, a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1), minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]), h=0.1;
  const Wd=Math.floor((maxx-minx)/h)+1, Hd=Math.floor((maxz-minz)/h)+1, St=new Uint8Array(Wd*Hd), lab=new Int32Array(Wd*Hd).fill(-1), comps=[];
  for(let j=0;j<Hd;j++) for(let i=0;i<Wd;i++) St[j*Wd+i]=E.canStand(minx+i*h,minz+j*h,0.3,0)?1:0;
  for(let s0=0;s0<Wd*Hd;s0++){ if(!St[s0]||lab[s0]>=0) continue; const q=[s0]; lab[s0]=comps.length; let cnt=0, sx=0, sz=0;
    while(q.length){ const c=q.pop(); cnt++; const ci=c%Wd, cj=(c/Wd)|0; sx+=ci; sz+=cj; for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=Wd||nj>=Hd) continue; const t=nj*Wd+ni; if(St[t]&&lab[t]<0){ lab[t]=comps.length; q.push(t); } } }
    comps.push({m2:r2(cnt*h*h),x:r2(minx+sx/cnt*h),z:r2(minz+sz/cnt*h)}); }
  comps.sort((p,q)=>q.m2-p.m2); const isl=comps.slice(1);
  check('7. 沒有走不出去的小孤島（主要區域 '+(comps[0]?comps[0].m2:0)+' m²）',!isl.length,J(isl.slice(0,8))); }
// ---- 8 ----
{ const def=CROWD.SHOP_ZONES&&CROWD.SHOP_ZONES.wz_print, su=def?def.units.filter(u=>u.seats):[], ns=su.reduce((a,u)=>a+u.seats.length,0);
  check('8. CROWD 的 wz_print 有座位組（四張椅子）',ns===4,J(su.map(u=>u.kind+':'+u.seats.length)));
  const DAYS=[]; for(let d=dayOf('2025-09-22');DAYS.length<15;d++) if(CALENDAR.kind(d)==='term'&&!CALENDAR.weekend(d)&&!CALENDAR.holiday(d)) DAYS.push(d);
  let sat=0, mx=0, wrong=[];
  for(const d of DAYS) for(const h of [10.5,12.5,13.5,17.5]){ const G={day:d,hour:h,flags:{},stage:'law'}; GAME.G=G; G.weekday=CALENDAR.dateOf(G.day).wd%7; const zz=loadZone('wz_print').z; G.zone='wz_print';
    const GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }};
    CROWD.enter(GM,'wz_print'); const P=E.npcs.filter(n=>typeof n.crowd==='string'&&/^shop_/.test(n.crowd)); mx=Math.max(mx,P.length);
    for(const n of P) if(n.seat){ sat++; if(!zz.seats.some(q=>Math.hypot(q.x-n.seat.x,q.z-n.seat.z)<0.05)) wrong.push(r2(n.seat.x)+','+r2(n.seat.z)); } }
  check('8. 客人會坐：15 個上課日四個時刻進店，有人坐在那四張椅子上、同時最多 2 位（影印店 cap 照舊）',sat>0&&!wrong.length&&mx<=2,J({sat,mx,wrong:wrong.slice(0,4)})); }
// ---- 9 ---- 正式模型接上（假的 GLB：GLOW_panel_* 空節點、WALL_*）：光暈合成一個網格、開燈 1／關燈 0（bb_support 也走 AA 新室內那一套 wzAAattach）
(async()=>{ const pend=[]; ASSETS.loadOne=k=>{ if(k!=='bldg.wz_print_interior_v3') return new Promise(()=>{}); const g=new THREE.Group();
    for(const nm of ['WALL_front_front_wall','ad_vc']){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm})); me.name=nm; g.add(me); }
    for(let i=1;i<=10;i++){ const o=new THREE.Object3D(); o.name='GLOW_panel_'+i; o.position.set(0,2.95,0); o.userData={glow:'rgba(240,246,255,1)',size:1.3,day:0.25,night:1}; g.add(o); }
    const p=Promise.resolve({scene:g}); pend.push(p); return p; };
  GAME.G={zone:'wenzhou',day:30,hour:15,flags:{},money:5000,weather:'clear'}; const z9=loadZone('wz_print').z; await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
  const glow=z9.group.getObjectByName('wz_print_glows'); let tog=null; if(glow&&z9.onLamps){ z9.onLamps(true); const on=glow.material.emissiveIntensity; z9.onLamps(false); tog=[on,glow.material.emissiveIntensity]; }
  check('9. 正式模型接上（z.formal）、GLOW_panel_* 10 個合成一個網格、開燈 1／關燈 0',!!z9.formal&&z9.aaGlows===10&&!!glow&&J(tog)===J([1,0]),J({formal:!!z9.formal,n:z9.aaGlows,tog}));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); })().catch(e=>{ console.log('FAIL 9 例外 '+String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); process.exit(1); });
