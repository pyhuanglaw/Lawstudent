const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/club_fair_expo_layout.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/dorm_layout.js','src/data/dorm_room_layout.js','src/dorm3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};

function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30});
const both=(a,b)=>{ const r1=sim(a,b,1/30); if(!r1.ok) return r1; const r2=sim(a,b,0.1); return r2.ok?r1:Object.assign({lowfps:true},r2); };
// 跑步（點的地方超過 16 m 時玩家用跑的，4.1 m/s）＋低幀率（dt 0.1，手機或模擬器卡的時候）：一步 0.41 m。2026-10-11 萬才館大樓梯真實流程：走下樓梯停在最下面一兩階
//（轉折點前後來回跳、換層時拿畫面上一階一階的高度比，跨一大步就換不回地面那一層）。走路速度、30 fps 都抓不到
const run=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt,speed:4.1}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3)},r); } return {ok:true}; };
const fmt=(r)=>JSON.stringify(r).slice(0,220);
// 社團博覽會（CLUBFAIR-REAL-1027，AA_485 第 3 節；使用者 X109「社團博覽會攤會也太少 都沒人顧」「要參考實際的吧」；LAWWW2-C 2026-10-27）——不需要瀏覽器。
// 原本：博覽會那兩天大道南側一排九頂（clubFair）。現在：社博那天（大一 club_expo_y1s1 的日子、大二 2026-09-12）椰林大道兩邊 36 頂＋舞台（clubFairExpo，src/data/club_fair_expo_layout.js）：
//   ① 配置：36 頂（能加入 5、只能看看 10、服務台 1、背景 20），招牌名稱照 AA_485，互相不重疊；
//   ② 社博那天建校園：每頂帳篷的中心擋住、站在攤位前（Z3.fairExpoFront）站得住、從大道中間走得到；舞台台面擋住、舞台前面站得住；
//   ③ 大道中間 z=0 從 x −90 走到 +12 一路走得過去；人行道 z=−7（舞台那一段以外）、z=+7 走得過去；
//   ④ 帳篷、舞台沒有壓到原本的東西（椰子樹、花叢、路燈、長椅、腳踏車）：不擺帳篷的時候，帳篷範圍裡的格子都站得住；
//   ⑤ 校慶（2025-11-15）照舊是九頂那一排、經濟系那一年也是；不是博覽會的日子沒有帳篷；
//   ⑥ 正式模型 club_fair_expo.glb：一個網格、一個材質；大小在帳篷範圍裡（x −90～+12、z −8～+14.2）。
// 用法：node tests/club_fair_expo_unit.js
const L=CLUB_FAIR_EXPO;
check('① 配置 36 頂（能加入 5、只能看看 10、服務台 1、背景 20）',L.tents.length===36&&['join','look','info','bg'].map(k=>L.tents.filter(t=>t.kind===k).length).join()==='5,10,1,20');
const want=['法律服務社','吉他社','辯論社','登山社','法律系系學會　系籃','熱舞社','合唱團','攝影社','桌遊社','羽球社','服務隊','咖啡研究社','電影研究社','魔術社'];
check('① AA_485 的 15 攤都在（校友會用一個縣市的名字）',want.every(n=>L.tents.some(t=>t.label===n))&&L.tents.some(t=>/校友會$/.test(t.label)&&t.kind==='look'),want.filter(n=>!L.tents.some(t=>t.label===n)).join('、'));
check('① 能加入的五攤對到 clubs 的 id（lawclub、club_guitar、club_debate、club_hiking、dept_basketball）',L.tents.filter(t=>t.kind==='join').map(t=>t.club).sort().join()==='club_debate,club_guitar,club_hiking,dept_basketball,lawclub');
{ let ov=[]; for(let i=0;i<36;i++) for(let j=i+1;j<36;j++){ const a=L.tents[i], b=L.tents[j]; if(Math.abs(a.x-b.x)<3.0&&Math.abs(a.z-b.z)<3.0) ov.push(a.id+'/'+b.id); } check('① 帳篷互相不重疊',!ov.length,ov.join(' ')); }
// 日子：用假的 GAME／CALENDAR／ACTIVITIES（只有日期）
const DATES={}; let dd=0; const day=k=>{ if(DATES[k]==null) DATES[k]=++dd; return DATES[k]; };
global.CALENDAR={dateOf:d=>({key:Object.keys(DATES).find(k=>DATES[k]===d)||'2025-01-01'})};
global.ACTIVITIES={list:[{id:'club_expo_y1s1',dates:['2025-09-06']}],on:(a,d)=>(a.dates||[]).includes(CALENDAR.dateOf(d).key)};   /* on：zones3d.js 的 isFairDay、isExpoDay 照 ACTIVITIES.on 判斷（舊局 9/30～10/1 的 datesOld，y1fb-1027）*/
const setDay=(k,econ)=>{ global.GAME={G:{day:day(k),flags:{}}}; global.STORY={isEcon:()=>!!econ}; };
// ④ 不擺帳篷的時候（平常日）：帳篷、舞台範圍裡的格子都站得住
setDay('2025-09-20'); loadZone('campus');
const R=0.3, stand=(x,z)=>E.canStand(x,z,R,0), rect=(x,z,w,d,f)=>{ const bad=[]; for(let u=-w/2+0.25;u<=w/2-0.25+1e-6;u+=0.5) for(let v=-d/2+0.25;v<=d/2-0.25+1e-6;v+=0.5) if(!f(x+u,z+v)) bad.push([+(x+u).toFixed(2),+(z+v).toFixed(2)]); return bad; };
{ const bad=[]; for(const t of L.tents){ const b=rect(t.x,t.z,3,3,(x,z)=>E.nav.walkable?E.nav.walkable(x,z):stand(x,z)); if(b.length) bad.push(t.id+' '+JSON.stringify(b.slice(0,2))); }
  const S=L.stage, bs=rect(S.x,S.z,S.w,S.d,(x,z)=>E.nav.walkable?E.nav.walkable(x,z):stand(x,z)); if(bs.length) bad.push('stage '+JSON.stringify(bs.slice(0,3)));
  check('④ 平常日：帳篷、舞台範圍裡原本沒有東西（椰子樹、花叢、路燈、長椅、腳踏車）',!bad.length,bad.slice(0,6).join('；')); }
check('⑤ 平常日沒有博覽會的帳篷',!E.zone.group.getObjectByName('fair_expo_fallback')&&!E.zone.group.getObjectByName('fair_fallback'));
// ② ③ 社博那天
setDay('2025-09-06'); check('② 2025-09-06 是社博的日子（Z3.isExpoDay）',Z3.isExpoDay&&Z3.isExpoDay()===true);
const zc=loadZone('campus');
check('② 社博那天：36 頂＋舞台的簡單帳篷在（正式模型載入前）、沒有九頂那一排',!!zc.group.getObjectByName('fair_expo_fallback')&&!zc.group.getObjectByName('fair_fallback'));
{ const bad=L.tents.filter(t=>stand(t.x,t.z)).map(t=>t.id); check('② 每頂帳篷的中心擋住',!bad.length,bad.join(' ')); }
check('② 舞台台面、兩邊台階擋住',!stand(L.stage.x,L.stage.z)&&!stand(L.stage.x-3.2,L.stage.z+L.stage.d/2+0.45)&&!stand(L.stage.x+3.2,L.stage.z+L.stage.d/2+0.45));
{ const bad=[]; for(const t of L.tents.concat([{id:'stage'}])){ const f=Z3.fairExpoFront(t.id); if(!f||!stand(f[0],f[1])){ bad.push(t.id+' 站不住 '+JSON.stringify(f)); continue; }
    const from=[Math.max(-88,Math.min(10,f[0])),0]; const r=both(from,f); if(!r.ok) bad.push(t.id+' 走不到 '+fmt(r)); }
  check('② 站在每一攤前面（Z3.fairExpoFront）、舞台前面：站得住、從大道中間走得到',!bad.length,bad.slice(0,5).join('；')); }
check('② fairExpoFront：北側在帳篷南邊 2 m、南側在北邊 2 m',JSON.stringify(Z3.fairExpoFront('guitar'))==='[-84.4,-2.9]'&&JSON.stringify(Z3.fairExpoFront('dance'))==='[-80.8,2.9]'&&JSON.stringify(Z3.fairExpoFront('lawclub'))==='[-47.5,11.5]');
{ const r=both([-90,0],[12,0]); check('③ 大道中間 z=0 從 x −90 走到 +12 走得過去',r.ok,fmt(r)); }
{ const r1=both([-90,7],[12,7]); check('③ 南側人行道 z=+7 從 x −90 走到 +12 走得過去',r1.ok,fmt(r1));
  const r2=both([-90,-7],[-33,-7]), r3=both([-18,-7],[12,-7]); check('③ 北側人行道 z=−7 舞台以外的兩段走得過去',r2.ok&&r3.ok,fmt(r2)+' '+fmt(r3)); }
{ const S=L.stage, f=Z3.fairExpoFront('stage'); let n=0; for(let x=S.x-4;x<=S.x+4;x+=1) for(let z=f[1]-1;z<=f[1]+3;z+=1) if(stand(x,z)) n++; check('③ 舞台前面（大道中間）有一塊站得住的觀眾區（9×5 m 裡 ≥ 40 格）',n>=40,n+' 格'); }
// ⑤ 校慶、經濟系那一年
setDay('2025-11-15'); const zf=loadZone('campus'); check('⑤ 校慶 2025-11-15：照舊是九頂那一排（clubFair），沒有 36 頂',!!zf.group.getObjectByName('fair_fallback')&&!zf.group.getObjectByName('fair_expo_fallback')&&Z3.isExpoDay()===false);
setDay('2024-09-18',true); const ze=loadZone('campus'); check('⑤ 經濟系那一年的博覽會（2024-09-18）：照舊九頂',!!ze.group.getObjectByName('fair_fallback')&&!ze.group.getObjectByName('fair_expo_fallback'));
setDay('2026-09-12'); check('⑤ 大二的社博 2026-09-12 也是 36 頂（EXPO_DAYS）',Z3.isExpoDay()===true&&Z3.fairDayKey('2026-09-12',false,[]));
// ⑥ 正式模型
{ const p=path.join(ROOT,'assets/models/env/second_ai/club_fair_expo.glb'); const ok=fs.existsSync(p); let info='沒有檔案';
  if(ok){ const b=fs.readFileSync(p); const jl=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+jl).toString()); const mesh=J.meshes||[]; let mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9];
    for(const m of mesh) for(const pr of m.primitives){ const a=J.accessors[pr.attributes.POSITION]; mn=mn.map((v,i)=>Math.min(v,a.min[i])); mx=mx.map((v,i)=>Math.max(v,a.max[i])); }
    info=JSON.stringify({meshes:mesh.length,materials:(J.materials||[]).length,mn:mn.map(v=>+v.toFixed(2)),mx:mx.map(v=>+v.toFixed(2))});
    check('⑥ club_fair_expo.glb：一個網格、一個材質，範圍在 x −90～+12、z −8～+15.1、高 ≤ 4.5 m',mesh.length===1&&(J.materials||[]).length===1&&mn[0]>-90&&mx[0]<12&&mn[2]>-8.1&&mx[2]<15.1&&mx[1]<4.5,info); }
  else check('⑥ club_fair_expo.glb 存在',false,info); }
check('⑥ ASSETS.manifest 有 bldg.club_fair_expo（type building、lazy）',!!ASSETS.manifest['bldg.club_fair_expo']&&ASSETS.manifest['bldg.club_fair_expo'].type==='building'&&ASSETS.manifest['bldg.club_fair_expo'].lazy===true);
check('⑥ index.html 載入 src/data/club_fair_expo_layout.js',/src\/data\/club_fair_expo_layout\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
