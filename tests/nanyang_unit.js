/* 南洋戲院（xs_nanyang 大廳、xs_nanyang_hall 1 廳；ART-NANYANG-CINEMA-1103，LAWWW2-C 11-05）：不需要瀏覽器，在 Node 裡建出遊戲真正的區域，
   用引擎真正的找路＋移動碰撞（E.simWalk：人物半徑 0.32 m，dt 1/30 與 0.1，走路與跑步）走：
   ① 兩個區域有登記、正式模型（BB 的大廳 v5b、1 廳 v2）在 ASSETS
   ② 大廳：進來的位置站得住、在「出去」「進 1 廳」的範圍外面
   ③ 大廳：入口 → 四張長椅「坐下等開演」的走近點、爆米花櫃檯、黑板架、海報、「進 1 廳」都走得到
   ④ 新生南路：「進南洋戲院（二輪戲院）」→ xs_nanyang；從大廳出來的點站得住、在店門互動點的範圍外面、走得回店門
   ⑤ 1 廳：進來的位置站得住、在「回大廳」的範圍外面；門口 → 九排靠走道那一張「坐下看電影」的走近點都走得到
   ⑥ 1 廳的斜地板：導航高度照配置的 floorY（門口 0、第一排前面 −0.96）；座位的 y＝那一排的地板高度；從門口走到銀幕前面、一路往下
   ⑦ 大廳 ↔ 1 廳：「進 1 廳」的落點在 1 廳站得住；「回大廳」的落點在大廳站得住、在「進 1 廳」的範圍外面
   ⑧ 正式模型的牆（WALL_*）淡出方向：BB 的 GLB 沒有 extras.dir、1 廳的 front／back 名字和位置相反——NY3.wallDirs 照位置補，每一塊都朝房間裡
   ⑨ 參考圖的構圖（RULES_2D_TO_3D.md；camRef＝BB v5 對參考圖的鏡頭）：左邊櫃檯、中間大招牌和兩組門、右邊海報牆
   ⑩ 營業時間（AA_615 第 3 節：09:30～24:00）：PLACES.hours.xs_nanyang、名字；story3d.js 的店門擋只擋從新生南路進大廳（接線 patch 套上以後才有，沒套就略過）
   這是模擬（證明路走得通），不是真實玩家流程（瀏覽器測試照 D131 排到使用者的電腦）。用法：node tests/nanyang_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/nanyang_layout.js','src/nanyang3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const NL=NANYANG_LAYOUT, LB=NL.lobby, HL=NL.hall, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; if(E.nav) E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const [dt,speed] of [[1/30,undefined],[0.1,undefined],[1/30,4.1],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:speed||'walk'},r); } return {ok:true}; };
const stand=(x,z)=>E.canStand(x,z,0.3,0);
// 座位的走近點（GAME.seatApproach 的候選：seat.ap 優先，其他照前後左右）
const seatAps=s=>{ const out=[]; if(s.ap) out.push(s.ap); const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[fx*0.8,fz*0.8]]) out.push([s.x+dx,s.z+dz]); return out.filter(a=>stand(a[0],a[1])); };
// ① 登記
check('① Z3.ZONES 有 xs_nanyang（大廳）、xs_nanyang_hall（1 廳）；ASSETS 有兩顆正式模型',!!Z3.ZONES.xs_nanyang&&!!Z3.ZONES.xs_nanyang_hall&&!!ASSETS.manifest['bldg.xs_nanyang']&&!!ASSETS.manifest['bldg.xs_nanyang_hall']&&
  ['bldg.xs_nanyang','bldg.xs_nanyang_hall'].every(k=>fs.existsSync(path.join(ROOT,ASSETS.manifest[k].url))));
// ② 大廳
let z=loadZone('xs_nanyang'); const IN=[z.spawn.x,z.spawn.z];
const exSt=E.interactables.find(q=>q.exit&&q.exit.to==='xinsheng'), exH=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang_hall');
check('② 大廳：進來的位置站得住、在「出去（新生南路）」「進 1 廳」的範圍外面',stand(...IN)&&!!exSt&&!!exH&&Math.hypot(IN[0]-exSt.x,IN[1]-exSt.z)>exSt.radius+0.1&&Math.hypot(IN[0]-exH.x,IN[1]-exH.z)>exH.radius+0.1,
  `(${IN.join(', ')})，離出口 ${exSt?Math.hypot(IN[0]-exSt.x,IN[1]-exSt.z).toFixed(2):'—'} m`);
// ③ 大廳：座位、互動點
{ const seats=E.interactables.filter(q=>q.seat), bad=[];
  for(const q of seats){ const aps=seatAps(q.seat); if(!aps.some(a=>walk(IN,a).ok)) bad.push(`${q.label}(${q.seat.x},${q.seat.z})`); }
  check(`③ 大廳：入口走得到 ${seats.length} 張長椅「坐下等開演」的走近點`,seats.length===4&&!bad.length,bad.join('｜'));
  const pts=NY3.INTERACT().concat([LB.interact.find(q=>q.kind==='hall')]), bad2=[];
  for(const q of pts){ // 互動點在家具前面：找半徑 0.9 內站得住、走得到的點
    let ok=false; for(let r=0;r<=0.9&&!ok;r+=0.1) for(let a=0;a<6.28&&!ok;a+=0.39){ const x=q.x+Math.cos(a)*r, zz=q.z+Math.sin(a)*r; if(stand(x,zz)&&walk(IN,[x,zz]).ok) ok=true; }
    if(!ok) bad2.push(q.kind); }
  check('③ 大廳：入口走得到爆米花櫃檯、黑板架、海報、「進 1 廳」',!bad2.length,pts.map(q=>q.kind).join('、')+(bad2.length?'；走不到：'+bad2.join('、'):'')); }
// ④ 新生南路
{ const out=exSt.exit.spawn; const zs=loadZone('xinsheng'); const door=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang');
  check('④ 新生南路：「進南洋戲院（二輪戲院）」→ xs_nanyang',!!door&&/南洋戲院/.test(door.label),door?door.label:'沒有');
  const ok=stand(out.x,out.z)&&!!door&&Math.hypot(out.x-door.x,out.z-door.z)>door.radius+0.1&&walk([out.x,out.z],[door.x+0.5,door.z]).ok;   // 店門互動點在騎樓裡、玻璃門前 0.9 m（x 小＝往店裡）：走回門前 0.5 m（在範圍裡面）
  check('④ 從大廳出來站在騎樓：站得住、在店門互動點的範圍外面、走得回店門',ok,`(${out.x}, ${out.z})${door?'，離店門 '+Math.hypot(out.x-door.x,out.z-door.z).toFixed(2)+' m（範圍 '+door.radius+'）':''}`);
  const tk=NY3.TICKET; check('④ 騎樓下的售票口（NY3.TICKET，LAWWW 接買票）在騎樓上、站得住',!!tk&&stand(tk.x,tk.z),tk?`(${tk.x}, ${tk.z})`:'沒有'); }
// ⑤ 1 廳
z=loadZone('xs_nanyang_hall'); const HIN=[z.spawn.x,z.spawn.z];
const exL=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang');
check('⑤ 1 廳：進來的位置站得住、在「回大廳」的範圍外面',stand(...HIN)&&!!exL&&Math.hypot(HIN[0]-exL.x,HIN[1]-exL.z)>exL.radius+0.1,`(${HIN.join(', ')})`);
{ const seats=E.interactables.filter(q=>q.seat&&q.cinema), bad=[];
  for(const q of seats){ const a=q.seat.ap; if(!stand(a[0],a[1])||!walk(HIN,a).ok) bad.push('第 '+q.row+' 排'); }
  check(`⑤ 1 廳：門口走得到 ${seats.length} 排靠走道那一張「坐下看電影」的走近點（右邊走道）`,seats.length===9&&!bad.length,bad.join('、'));
  check('⑤ 1 廳：「坐下看電影」那一筆的 seat 本身就是 kind cinema（坐下以後 P.seat 是這一份，AA614.onSeat 看 kind；BUG-NY-HALL-SEAT-KIND-1107，修改前 FAIL）',seats.length===9&&seats.every(q=>q.seat.kind==='cinema'&&q.seat.row!=null)&&(z.seats||[]).filter(st=>st.kind==='cinema').length===9,JSON.stringify(seats.map(q=>q.seat.kind)));
  // ⑥ 斜地板
  const badH=[]; for(const zz of [7.0,4.3,2.0,0.0,-2.0,-3.54,-5.0,-6.0]){ const h=z.nav.heightAt(3.4,zz), want=HL.floorY(zz); if(Math.abs(h-want)>0.01) badH.push(zz+'：'+h.toFixed(2)+'／'+want.toFixed(2)); }
  check('⑥ 1 廳的導航高度照 floorY（門口 0、斜面、第一排前面 −0.96）',!badH.length,badH.join('｜'));
  const badS=seats.filter(q=>Math.abs(q.seat.y-HL.floorY(q.seat.z))>0.01).map(q=>q.row);
  check('⑥ 每一排的座位高度 y＝那一排的地板高度（坐下不會浮起來或陷進去）',!badS.length,badS.length?'第 '+badS.join('、')+' 排':'第 1 排 '+seats[0].seat.y+'、第 9 排 '+seats[8].seat.y);
  const front=[3.4,-5.0], w=walk(HIN,front); let mono=true, prev=1e9; for(let zz=HIN[1];zz>=front[1];zz-=0.25){ const h=z.nav.heightAt(3.4,zz); if(h>prev+1e-6) mono=false; prev=h; }
  check('⑥ 從門口沿右邊走道走到銀幕前面：走得到、一路往下（−0.96）',w.ok&&mono&&Math.abs(z.nav.heightAt(...front)+0.96)<0.01,w.ok?'':JSON.stringify(w).slice(0,160)); }
// ⑦ 大廳 ↔ 1 廳
{ z=loadZone('xs_nanyang'); const toH=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang_hall').exit.spawn;
  const zh=loadZone('xs_nanyang_hall'); const okH=stand(toH.x,toH.z); const back=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang').exit.spawn;
  const zl=loadZone('xs_nanyang'); const hd=E.interactables.find(q=>q.exit&&q.exit.to==='xs_nanyang_hall'), okL=stand(back.x,back.z)&&Math.hypot(back.x-hd.x,back.z-hd.z)>hd.radius+0.1&&walk([back.x,back.z],IN).ok;
  check('⑦ 「進 1 廳」落在 1 廳門口站得住；「回大廳」落在那組門前面、站得住、在「進 1 廳」的範圍外面、走得回入口',okH&&okL,`1 廳 (${toH.x}, ${toH.z})、大廳 (${back.x}, ${back.z})`); }
// ⑧ 正式模型的牆淡出方向
{ const bad=[], cnt={};
  for(const [f,R] of [['assets/models/env/second_ai/bb_support/nanyang_lobby.glb',LB],['assets/models/env/second_ai/bb_support/nanyang_hall.glb',HL]]){
    const d=fs.readFileSync(path.join(ROOT,f)), n=d.readUInt32LE(12), J=JSON.parse(d.slice(20,20+n).toString('utf8')), root=new THREE.Group();
    for(const nd of J.nodes){ if(nd.mesh==null||!/WALL_/.test(nd.name)) continue; const m=J.meshes[nd.mesh]; let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
      for(const p of m.primitives){ const a=J.accessors[p.attributes.POSITION]; for(let i=0;i<3;i++){ mn[i]=Math.min(mn[i],a.min[i]); mx[i]=Math.max(mx[i],a.max[i]); } }
      const t=nd.translation||[0,0,0], o=new THREE.Mesh(new THREE.BoxGeometry(Math.max(0.01,mx[0]-mn[0]),Math.max(0.01,mx[1]-mn[1]),Math.max(0.01,mx[2]-mn[2])));
      o.position.set((mn[0]+mx[0])/2+t[0],(mn[1]+mx[1])/2+t[1],(mn[2]+mx[2])/2+t[2]); o.name=nd.name; root.add(o); }
    NY3.wallDirs(root,R.w,R.d);
    for(const o of root.children){ const dv=o.userData.dir, c=o.position; cnt[f]=(cnt[f]||0)+1; if(!dv||(c.x*dv[0]+c.z*dv[2])>=0) bad.push(o.name); } }
  check('⑧ 兩顆正式模型的 WALL_* 都補上往房間裡的淡出方向（BB 的 GLB 沒有 extras.dir；1 廳 back 在 +z）',!bad.length,Object.values(cnt).join('＋')+' 塊'+(bad.length?'；不對：'+bad.join('、'):'')); }
// ⑨ 參考圖的構圖
{ const C=LB.camRef, hf=2*Math.atan(18/C.lens), yaw=Math.atan2(C.look[0]-C.eye[0],-(C.look[2]-C.eye[2])), half=hf/2-0.02;
  const ang=(x,zz)=>{ let a=Math.atan2(x-C.eye[0],-(zz-C.eye[2]))-yaw; while(a>Math.PI) a-=2*Math.PI; while(a<-Math.PI) a+=2*Math.PI; return a; };
  // 櫃檯沿整面左牆（concession z −5.6～3.6、正面 x −3.4）：camRef 看得到 z −1.6 以後那一段，取裡面那一半的正面（−3.4, −4.0）
  const left=[['櫃檯（裡面那一半）',-3.4,-4.0],['爆米花機',-3.6,-2.8]], mid=[['大招牌',LB.sign.x,-LB.d/2],['左邊那組門',LB.doors.left.x,-LB.d/2],['右邊那組門',LB.doors.right.x,-LB.d/2]], right=[['海報牆',4.4,-3.35],['長椅',3.95,-3.1]];
  const deg=a=>(a*180/Math.PI).toFixed(0)+'°';
  const ok=left.every(([n,x,zz])=>{ const a=ang(x,zz); return a<-0.05&&a>-half; })&&mid.every(([n,x,zz])=>Math.abs(ang(x,zz))<0.25)&&right.every(([n,x,zz])=>{ const a=ang(x,zz); return a>0.05&&a<half; });
  check('⑨ 參考圖的構圖（camRef）：左邊櫃檯、爆米花機；中間大招牌、兩組門；右邊海報牆、長椅',ok,left.concat(mid,right).map(([n,x,zz])=>n+' '+deg(ang(x,zz))).join('、')+'（視角 ±'+deg(hf/2)+'）'); }
// ⑩ 營業時間（接線 patch 的 places.js、story3d.js；還沒套 patch 的分支照「略過」印出來，不算失敗）
if(PLACES.hours&&PLACES.hours.xs_nanyang){ const o=PLACES.isOpen.bind(PLACES), ok=!o('xs_nanyang',9.4,1)&&o('xs_nanyang',9.5,1)&&o('xs_nanyang',23.9,1)&&!o('xs_nanyang',0.2,1)&&PLACES.names.xs_nanyang==='南洋戲院';
  const st=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), gate=/it\.exit\.to==='xs_nanyang'&&G\.zone==='xinsheng'&&!PLACES\.isOpen\('xs_nanyang'/.test(st);
  check('⑩ 營業時間 09:30～24:00（9:24 沒開、9:30 開、23:54 開、00:12 沒開）、名字「南洋戲院」；story3d.js 只擋從新生南路進大廳',ok&&gate,PLACES.closedText('xs_nanyang',8,1)+(gate?'':'｜story3d.js 沒有店門擋')); }
else console.log('略過 ⑩ 營業時間：places.js 還沒有 xs_nanyang（接線 patch 沒套）');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
