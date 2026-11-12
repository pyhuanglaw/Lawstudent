// 美國交換：社區會所的室內（US-CLUBHOUSE-3D-1110，AA_741；LAWWW2 帳號 A 2026-11-10）：不需要瀏覽器。
// 在 Node 照 index.html 的順序載入程式，建出遊戲真正的區域 us_clubhouse_in，用引擎真正的移動模擬（E.simWalk，dt 1/30、0.1，再加跑步 4.1 m/s）檢查：
//   1. 註冊、大小：門廳 4×4、交誼廳 10×8、自習室 8×6（AA_741 第 1 節）；交誼廳淺色木地板、自習室灰色地毯（D112：不用深色木地板）；後面草地不做（北牆外走不到）；辦公室走不進去
//   2. 座位：自習室 4 張桌子×4 席＝16（坐下＝讀書）；交誼廳長桌 8、沙發 4；晚餐併桌 10（z.setDinner）；每個座位坐下前站的位置站得住、從門口走得到
//   3. 人：舊序章人物己在自習室靠窗那張桌子、旁邊那張空著；學姊在最裡面角落那張桌子、背對牆；挽回中她旁邊那張放外套、不能坐（z.setSisCoat）
//   4. 劇情站位（AA_741 第 4 節）：long3、fb_study、sis_plan、thanks_long、club_dinner（10 人：學姊主位、室友在她兩邊、舊序章人物己坐玩家對面）
//   5. 出入口：「離開會所」回社區的 US3.SPAWN.us_clubhouse；聖誕樹 12/1 起
//   6. 正式模型：manifest、zone_assets、GLB 的切換節點（聖誕樹、併桌、晚餐、外套、公布欄的單子、讀書計畫、櫃台百葉）、房間大小、地板顏色；窗景 8 張
// 這是模擬（證明路走得通、資料對），不是真實玩家流程；畫面請 CC 拍（D131）。
// 用法：node tests/us_clubhouse_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const pos=f=>{ const i=html.indexOf('src="'+f); return i; };
check('index.html 載入 src/data/us_clubhouse_layout.js、src/us_clubhouse3d.js（配置在前、在 us3d.js 後面）',pos('src/data/us_clubhouse_layout.js')>0&&pos('src/us_clubhouse3d.js')>pos('src/data/us_clubhouse_layout.js')&&pos('src/us3d.js')<pos('src/us_clubhouse3d.js'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_clubhouse_layout.js','src/us_clubhouse3d.js'];
for(const f of files){ const p=path.join(ROOT,f); if(!fs.existsSync(p)){ check('檔案 '+f,false,'沒有這個檔'); continue; } let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
if(typeof ASSETS!=='undefined') ASSETS.loadOne=()=>new Promise(()=>{});   // 不載正式模型（導航、互動點和備用模型一樣）
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const R=0.32, stand=(x,z)=>E.canStand(x,z,R,0);
const both=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1}); return r.ok?r:Object.assign({run:true},r); };
const fmt=r=>JSON.stringify(r).slice(0,200);
const ok=typeof Z3!=='undefined'&&Z3.ZONES&&!!Z3.ZONES.us_clubhouse_in&&typeof US_CLUBHOUSE!=='undefined';
check('1. 區域註冊：Z3.ZONES.us_clubhouse_in、US_CLUBHOUSE.SPAWN',ok&&!!US_CLUBHOUSE.SPAWN);
if(!ok){ console.log(`FAILED: ${fails}`); process.exit(1); }
const L=US_CLUBHOUSE_LAYOUT, z=loadZone('us_clubhouse_in'), IT=E.interactables, sp=z.spawn, SP=[sp.x,sp.z];
const room=id=>L.rooms.find(r=>r.id===id), dim=r=>[+(r.x1-r.x0).toFixed(2),+(r.z1-r.z0).toFixed(2)].sort((a,b)=>a-b).join('×');
check('1. 大小：門廳 4×4、交誼廳 8×10、自習室 6×8（AA_741 第 1 節）',dim(room('foyer'))==='4×4'&&dim(room('lounge'))==='8×10'&&dim(room('study'))==='6×8',['foyer','lounge','study'].map(k=>dim(room(k))).join(' '));
check('1. 地板：交誼廳 wood（淺色）、自習室 carpet（灰色）',room('lounge').floor==='wood'&&room('study').floor==='carpet');
check('1. 出生點（門廳）站得住；三個房間的中間都走得到',stand(sp.x,sp.z)&&['foyer','lounge','study'].every(k=>{ const r=room(k); const c=[(r.x0+r.x1)/2,(r.z0+r.z1)/2]; let p=c; if(!stand(p[0],p[1])){ p=null; for(let d=0.2;d<2&&!p;d+=0.2) for(const [dx,dz] of [[d,0],[-d,0],[0,d],[0,-d]]) if(!p&&stand(c[0]+dx,c[1]+dz)) p=[c[0]+dx,c[1]+dz]; } return p&&both(SP,p).ok; }));
{ const o=room('office'); const inO=[]; for(let x=o.x0+0.3;x<o.x1-0.2;x+=0.2) for(let zz=o.z0+0.3;zz<o.z1-0.2;zz+=0.2) if(stand(x,zz)) inO.push([+x.toFixed(1),+zz.toFixed(1)]);
  check('1. 辦公室（櫃台後面）走不進去',!inO.length,inO.slice(0,3).join(' '));
  const out=[[-6,-4.8],[-6,-5.5],[1,4.8],[11.6,2]]; check('1. 後面草地、門外走不到（玻璃門關著、大門＝離開會所）',out.every(p=>!stand(p[0],p[1]))); }
// ---------- 2. 座位 ----------
const S=z.seats, byRoom=r=>S.filter(s=>s.room===r);
const visSeat=s=>{ const it=IT.find(i=>i.seat===s); return it&&!it.hidden; };
const apOf=s=>s.ap?s.ap:[s.x-Math.sin(s.yaw)*0.6,s.z-Math.cos(s.yaw)*0.6];
function reachSeats(list){ const bad=[]; for(const s of list){ const ap=apOf(s); const r=stand(ap[0],ap[1])?both(SP,ap):{ok:false,reason:'站不住'}; if(!r.ok) bad.push(`${s.id} ${fmt(r)}`); } return bad; }
{ const st=byRoom('study'); const tabs=new Set(st.map(s=>s.id.split('_')[1]));
  check('2. 自習室：4 張桌子×4 席＝16 個座位，坐下＝讀書（usClubStudy）',st.length===16&&tabs.size===4&&[...tabs].every(t=>st.filter(s=>s.id.split('_')[1]===t).length===4)&&st.every(s=>{ const it=IT.find(i=>i.seat===s); return it&&it.usClubStudy&&it.label==='坐下讀書'; }));
  const bad=reachSeats(st); check('2. 自習室 16 個座位：坐下前站的位置（椅子後面 0.6 m）站得住、從門口走得到',!bad.length,bad.slice(0,3).join(' | ')); }
{ const lo=byRoom('lounge'), ap=lo.filter(s=>/^lt_/.test(s.id)), sofa=lo.filter(s=>/^sofa/.test(s.id)), md=lo.filter(s=>/^ld_/.test(s.id));
  check('2. 交誼廳：平常長桌 8 個＋沙發 4 個看得到、併桌的 10 個藏著',ap.length===8&&sofa.length===4&&md.length===10&&ap.concat(sofa).every(visSeat)&&md.every(s=>!visSeat(s)));
  let bad=reachSeats(ap.concat(sofa)); check('2. 交誼廳長桌、沙發：坐下前站的位置站得住、從門口走得到',!bad.length,bad.slice(0,3).join(' | '));
  z.setDinner(true); check('2. z.setDinner(true)：換成併桌的 10 個（平常的 8 個藏起來）',md.every(visSeat)&&ap.every(s=>!visSeat(s))&&sofa.every(visSeat));
  bad=reachSeats(md); check('2. 併桌 10 個座位走得到（兩頭的座位站在桌頭外面）',!bad.length,bad.slice(0,3).join(' | '));
  const f=L.furniture.find(q=>q.type==='longTables'); const span=[f.merged[0]-f.w/2,f.merged[1]+f.w/2], gap=f.apart[1]-f.apart[0]-f.w;
  check('2. 兩張長桌：平常分開（中間 ≥ 0.6 m）、晚餐併成一張（接在一起）',gap>=0.6&&Math.abs((f.merged[1]-f.merged[0])-f.w)<1e-6&&span[0]>=f.navX0-1e-6&&span[1]<=f.navX1+1e-6,`gap ${gap.toFixed(2)}`);
  z.setDinner(false); }
// ---------- 3. 人 ----------
const table=id=>L.furniture.find(q=>q.type==='studyTable'&&q.id===id), tableOf=s=>table(s.id.split('_')[1]);
const winC=[]; for(const w of L.walls) for(const o of (w.open||[])) if(o[2]==='window'&&/^[NSWE]/.test(w.id)&&!w.partition) winC.push(w.axis==='x'?[(o[0]+o[1])/2,w.at]:[w.at,(o[0]+o[1])/2]);
const sr=room('study'), stud=L.furniture.filter(q=>q.type==='studyTable'), sdoor=L.doors.find(d=>d.id==='study');
const dWin=t=>Math.min(...winC.filter(c=>c[0]>=sr.x0-0.01&&c[0]<=sr.x1+0.01&&c[1]>=sr.z0-0.01&&c[1]<=sr.z1+0.01).map(c=>Math.hypot(c[0]-t.x,c[1]-t.z)));
{ const lg=z.npc.long, ln=z.npc.longNext, tl=tableOf(lg); const near=stud.slice().sort((a,b)=>dWin(a)-dWin(b))[0];
  check('3. 舊序章人物己：自習室靠窗那張桌子（離窗最近）',tl===near,`${tl.id} vs ${near.id}`);
  check('3. 舊序章人物己旁邊那張椅子（同一邊、隔壁）是另一個座位、平常空著',ln&&ln!==lg&&ln.z===lg.z&&Math.abs(Math.abs(ln.x-lg.x)-0.9)<0.01&&tableOf(ln)===tl);
  const sg=z.npc.sis, tsis=tableOf(sg); const far=stud.slice().sort((a,b)=>Math.hypot(b.x-sdoor.x,b.z-sdoor.z)-Math.hypot(a.x-sdoor.x,a.z-sdoor.z))[0];
  check('3. 學姊：自習室最裡面角落那張桌子（離自習室的門最遠）',tsis===far&&tsis!==tl,`${tsis.id} vs ${far.id}`);
  check('3. 學姊背對牆（面向桌子、背後 1.1 m 內是牆）',Math.abs(sg.yaw)<1e-6&&sg.z-sr.z0<1.1);
  const sn=z.npc.sisNext; check('3. 學姊旁邊那張椅子：同一邊、隔壁',sn&&sn.z===sg.z&&Math.abs(Math.abs(sn.x-sg.x)-0.9)<0.01);
  z.setSisCoat(true); check('3. 挽回中 z.setSisCoat(true)：她旁邊那張放外套、不能坐（其他照舊）',!visSeat(sn)&&visSeat(sg)&&visSeat(lg)); z.setSisCoat(false); check('3. z.setSisCoat(false)：空出來（交往中「坐她旁邊」）',visSeat(sn));
  const ss=z.npc.sisStand; const r=both(SP,[ss.x,ss.z]); check('3. 站在學姊那張桌子旁邊的位置站得住、走得到',stand(ss.x,ss.z)&&r.ok,fmt(r));
  const o=z.npc.office; check('3. 辦公室的人在櫃台後面（辦公室裡）',o.x>room('office').x0&&o.x<room('office').x1&&o.z<0&&o.z>room('office').z0);
  const lg2=z.npc.lounge.filter(q=>!q.id); check('3. 交誼廳的住戶：沙發、長桌、販賣機前、微波爐前；站著的兩個站得住、走得到',z.npc.lounge.length===4&&lg2.length===2&&lg2.every(q=>stand(q.x,q.z)&&both(SP,[q.x,q.z]).ok)); }
// ---------- 4. 劇情站位 ----------
{ const V=z.events; const nb=(a,b)=>a&&b&&a.z===b.z&&Math.abs(Math.abs(a.x-b.x)-0.9)<0.01;
  check('4. ev_usl_long3：舊序章人物己在他的位子、玩家坐他旁邊',V.ev_usl_long3.long===z.npc.long&&nb(V.ev_usl_long3.player,z.npc.long)&&V.ev_usl_long3.notice===true);
  const fp=V.ev_usb_fb_study.player; check('4. ev_usb_fb_study：學姊在她的角落、玩家站在她桌子旁邊（站得住、走得到）',V.ev_usb_fb_study.sis===z.npc.sis&&stand(fp.x,fp.z)&&both(SP,[fp.x,fp.z]).ok&&Math.hypot(fp.x-tableOf(z.npc.sis).x,fp.z-tableOf(z.npc.sis).z)<1.6);
  check('4. ev_sis_plan_us：兩個人並排坐在學姊那張桌子',V.ev_sis_plan_us.sis===z.npc.sis&&nb(V.ev_sis_plan_us.player,z.npc.sis)&&V.ev_sis_plan_us.plan===true);
  const T=V.ev_usl_thanks_long, vend=L.furniture.find(q=>q.type==='vending'); check('4. ev_usl_thanks_long：販賣機前兩個人（站得住、走得到、離販賣機 1.2 m 內）→ 沙發並排',['player','long'].every(k=>{ const p=T.start[k]; return stand(p.x,p.z)&&both(SP,[p.x,p.z]).ok&&Math.hypot(p.x-vend.x,p.z-vend.z)<1.2; })&&/^sofa/.test(T.sofa.player.id)&&/^sofa/.test(T.sofa.long.id)&&T.sofa.player!==T.sofa.long&&T.empty===true);
  const Dn=V.ev_us_club_dinner, all=[Dn.head,...Dn.roommates,Dn.long,Dn.player,...Dn.others]; const f=L.furniture.find(q=>q.type==='longTables');
  check('4. ev_us_club_dinner：10 人、位子都不重複、都是併桌的座位',all.length===10&&new Set(all).size===10&&all.every(s=>s&&/^ld_/.test(s.id))&&Dn.dinner===true);
  check('4. 晚餐：學姊坐桌頭（主位）、兩位室友在她兩邊、舊序章人物己坐玩家對面、玩家在另一頭那一半',Dn.head.id==='ld_w'&&Dn.roommates.every(s=>Math.abs(s.x-Dn.head.x)<1.1&&s.z!==f.z)&&Dn.roommates[0].z!==Dn.roommates[1].z&&Dn.long.x===Dn.player.x&&Dn.long.z!==Dn.player.z&&Dn.player.x>(f.merged[0]+f.merged[1])/2); }
// ---------- 5. 出入口、聖誕樹 ----------
{ const out=IT.filter(i=>i.exit); const o=out[0]; const S0=US3.SPAWN.us_clubhouse;
  check('5. 只有一個出口「離開會所」→ 社區（us_outside）的會所門口 US3.SPAWN.us_clubhouse',out.length===1&&o.label==='離開會所'&&o.exit.to==='us_outside'&&Math.abs(o.exit.spawn.x-S0.x)<1e-6&&Math.abs(o.exit.spawn.z-S0.z)<1e-6,o&&JSON.stringify(o.exit));
  const r=both([z.seatById('st_NE_n1').x,-0.2],[o.x,o.z]); check('5. 從自習室最裡面走得回門口',r.ok,fmt(r));
  check('5. 聖誕樹：12/1 起（11/30 沒有）',US_CLUBHOUSE.xmasOn({m:12,d:1})&&US_CLUBHOUSE.xmasOn({m:12,d:23})&&!US_CLUBHOUSE.xmasOn({m:11,d:30})&&!US_CLUBHOUSE.xmasOn({m:9,d:4}));
  const t=L.furniture.find(q=>q.type==='xmasTree'); check('5. 聖誕樹在交誼廳、站不進去',t.x>room('lounge').x0&&t.x<room('lounge').x1&&!stand(t.x,t.z));
  check('5. 「看」只有櫃台（AA_741 不加新台詞：字由 LAWWW 接）',IT.filter(i=>i.usClubLook).map(i=>i.usClubLook).join()==='counter'&&IT.filter(i=>i.usClubLook).every(i=>!i.look)); }
// ---------- 6. 正式模型 ----------
{ const m=ASSETS.manifest['bldg.us_clubhouse']; const glb=m&&path.join(ROOT,m.url);
  check('6. ASSETS.manifest 有 bldg.us_clubhouse（type building、有來源與授權、檔案在）',!!m&&m.type==='building'&&!!m.source&&!!m.license&&fs.existsSync(glb),m&&m.url);
  const zaSrc=fs.readFileSync(path.join(ROOT,'src/data/zone_assets.js'),'utf8'); const ZA=JSON.parse(zaSrc.slice(zaSrc.indexOf('{'),zaSrc.lastIndexOf('}')+1)); const za=ZA.us_clubhouse_in||(ZA.zones&&ZA.zones.us_clubhouse_in);
  check('6. zone_assets 的 us_clubhouse_in 有 bldg.us_clubhouse（預先載入）',Array.isArray(za)&&za.includes('bldg.us_clubhouse'),JSON.stringify(za));
  if(m&&fs.existsSync(glb)){ const b=fs.readFileSync(glb); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const names=new Set(J.nodes.map(x=>x.name));
    const need=['XMAS_TREE','XMAS_LIGHTS','TABLES_APART','TABLES_MERGED','DINNER_SET','SIS_COAT','CORK_NOTICE','SIS_PLAN','SHUTTER_DOWN']; const miss=need.filter(k=>!names.has(k));
    check('6. GLB 有切換用的節點：'+need.join('、'),!miss.length,'缺 '+miss.join(' '));
    const box=pred=>{ let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9]; J.nodes.forEach(nd=>{ if(nd.mesh==null||!pred(nd.name||'')) return; for(const pr of J.meshes[nd.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION]; if(a.min) for(let k=0;k<3;k++){ lo[k]=Math.min(lo[k],a.min[k]); hi[k]=Math.max(hi[k],a.max[k]); } } }); return {lo,hi}; };
    const wb=box(nm=>/^WALL_(S|N_l|W|E)_wall$/.test(nm));
    check('6. GLB：外牆圍出的範圍和配置一樣（x −11～11、z −4～4，誤差 0.3 m）',Math.abs(wb.lo[0]-L.bounds.x0)<0.3&&Math.abs(wb.hi[0]-L.bounds.x1)<0.3&&Math.abs(wb.lo[2]-L.bounds.z0)<0.3&&Math.abs(wb.hi[2]-L.bounds.z1)<0.3,JSON.stringify([wb.lo.map(v=>+v.toFixed(2)),wb.hi.map(v=>+v.toFixed(2))]));
    const fl=n=>J.materials.find(x=>x.name===n); check('6. GLB：交誼廳木地板、自習室地毯的材質都在（ucl_wood、ucl_carpet）',!!fl('ucl_wood')&&!!fl('ucl_carpet'));
    const seatsIn=['TABLES_APART','TABLES_MERGED'].every(k=>{ const nd=J.nodes.find(x=>x.name===k); return nd&&(nd.children||[]).length>0; }); check('6. GLB：兩種長桌擺法（平常、併桌）都有東西',seatsIn); }
  const views=['usch','usch_front'].flatMap(k=>['summer','autumn','bare','snow'].flatMap(s=>['day','night'].map(t=>`assets/models/env/views/${k}_${s}_${t}.webp`))); const missing=views.filter(v=>!fs.existsSync(path.join(ROOT,v)));
  check('6. 窗景：後面（usch）、正面（usch_front）×四季×白天、晚上 16 張都在',!missing.length,missing.join(' '));
  check('6. 窗景照日子換：區域用 US3.usSeasonKey()',US_CLUBHOUSE.viewKind(false)==='usch_'+US3.usSeasonKey()&&US_CLUBHOUSE.viewKind(true)==='usch_front_'+US3.usSeasonKey());
  const panes=z.viewPanes||[]; const S_at=L.walls.find(w=>w.id==='S').at; const nWin=L.walls.filter(w=>/^[NSWE]/.test(w.id)&&!w.partition).reduce((n,w)=>n+(w.open||[]).filter(o=>/window|patioDoor|frontDoor/.test(o[2])).length,0);
  check('6. 每扇窗、玻璃門外面都有一片窗景；南牆（正面）的用停車場那一組、其他用後面草地那一組',panes.length===nWin&&panes.every(m=>(Math.abs(m.position.z-S_at)<0.5)===!!m.userData.front),`${panes.length}/${nWin}`); }
console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
