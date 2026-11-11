// 汀州路／公館六間店的室內（GG-SHOPS3-ART-1110，X320；LAWWW2 帳號 A 2026-11-10；使用者 11-10「六家的內部參考圖」）的導航（不需要瀏覽器）：
// 配置 src/data/tz_shops_layout.js 裡的每一間：在 Node 建出遊戲真正的區域，用引擎真正的找路＋移動碰撞（E.simWalk：走路、跑步＋低幀率）檢查——
//   外面的店門互動點通到這一間、進來站得住；「離開」回到外面站得住的地方、離店門互動點超過半徑（一出來不會又跳出「進」）；
//   每一個座位走得到；每一個互動點站得住、走得到；家具、櫃台、廚房站不進去；店員的位置在櫃台後面（客人走不到）；正式模型的檔案在、資產有登記。
// 這是模擬，不是真實玩家流程（D131）。用法：node tests/tz_shops_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const need=['src/data/tz_shops_layout.js','src/tz_shops3d.js'].filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(need.length){ check('0. 六間店室內的檔案在',false,need.join(' ')); console.log('FAILED: '+fails); process.exit(1); }
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/tingzhou_layout.js','src/tingzhou3d.js','src/data/tz_shops_layout.js','src/tz_shops3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TZ3|TZS3|TINGZHOU_LAYOUT|TZ_SHOPS_LAYOUT|LINZE_LAYOUT|CLASSROOM_LAYOUT|FLOWER_NOTES_LAYOUT|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.nav._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const sim=(a,b,dt,speed)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:a[2]|0,lv1:b[2]|0,dt:dt||1/30,speed});
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.8],[0.1,4.8]]){ const r=sim(a,b,dt,sp); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return {ok:true}; };
const fmt=r=>JSON.stringify(r).slice(0,200);
const stand=(x,z,lv,r)=>E.canStand(x,z,r==null?0.32:r,lv|0);
function standNear(it){ const R=Math.min(it.radius||it.r||1,1.2), lv=it.lv|0; if(stand(it.x,it.z,lv)) return [it.x,it.z,lv]; for(let r=0.15;r<=R-0.1;r+=0.15) for(let a=0;a<16;a++){ const x=it.x+Math.cos(a/16*Math.PI*2)*r, z=it.z+Math.sin(a/16*Math.PI*2)*r; if(stand(x,z,lv)) return [x,z,lv]; } return null; }
function approach(seat){ const yaw=seat.yaw||0, fx=Math.sin(yaw), fz=Math.cos(yaw), lv=seat.lv|0; for(const [dx,dz] of [[fx*0.5,fz*0.5],[-fx*0.6,-fz*0.6],[fz*0.55,-fx*0.55],[-fz*0.55,fx*0.55],[-fx*0.7,-fz*0.7],[-fx*0.75,-fz*0.75],[fx*0.8,fz*0.8],[-fx*0.9,-fz*0.9]]){ const x=seat.x+dx, z=seat.z+dz; if(stand(x,z,lv,0.3)) return [x,z,lv]; } return null; }
const ALL=TZ_SHOPS_LAYOUT, ids=Object.keys(ALL);
check('0. 配置裡至少有泰米村食；index.html 載入配置和區域',ids.includes('taimi')&&/src\/data\/tz_shops_layout\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8'))&&/src\/tz_shops3d\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')),ids.join(' '));
for(const id of ids){ const L=ALL[id], N=L.name;
  // ---- 外面 ----
  { const zo=loadZone(L.outZone); const door=E.interactables.find(i=>i.exit&&i.exit.to===L.zone);
    check(N+' 1. 外面（'+L.outZone+'）有通到這一間的店門互動點',!!door,door?`(${door.x},${door.z}) ${door.label}`:'沒有');
    check(N+' 1. 從店裡出來站的地方站得住、離店門互動點超過半徑＋0.2（一出來不會又跳出「進」）',stand(L.out.x,L.out.z,0)&&!!door&&Math.hypot(L.out.x-door.x,L.out.z-door.z)>door.radius+0.2,door?`距離 ${Math.hypot(L.out.x-door.x,L.out.z-door.z).toFixed(2)}、半徑 ${door.radius}`:''); 
    if(door){ const p=standNear(door); check(N+' 1. 出來以後走得回店門口',!!p&&walk([L.out.x,L.out.z,0],p).ok,JSON.stringify(p)); } }
  // ---- 室內 ----
  { const z=loadZone(L.zone), SP=[L.spawn.x,L.spawn.z,0]; const ex=E.interactables.find(i=>i.exit&&i.exit.to===L.outZone);
    check(N+' 2. 進來站的地方站得住；「離開」在門口、回到配置的 out；出生點離「離開」超過半徑＋0.2',stand(SP[0],SP[1],0)&&!!ex&&ex.exit.spawn.x===L.out.x&&ex.exit.spawn.z===L.out.z&&Math.hypot(SP[0]-ex.x,SP[1]-ex.z)>ex.radius+0.2&&!!standNear(ex),ex?`距離 ${Math.hypot(SP[0]-ex.x,SP[1]-ex.z).toFixed(2)}、半徑 ${ex.radius}`:'沒有離開');
    { const bad=[]; for(const q of L.seats||[]){ const a=q.ap?(stand(q.ap.x,q.ap.z,0,0.3)?[q.ap.x,q.ap.z,0]:null):approach({x:q.x,z:q.z,yaw:q.yaw,lv:0}); const r=a&&walk(SP,a); if(!a||!r.ok) bad.push(q.id+(a?JSON.stringify(a)+fmt(r).slice(0,90):'沒有走近點')); } check(N+' 3. 每一個座位有「坐下」、走得到（'+(L.seats||[]).length+' 個）',E.interactables.filter(i=>i.tzSeat).length===(L.seats||[]).length&&!bad.length,bad.join(' ')); }
    { const bad=[]; for(const it of E.interactables){ const p=standNear(it); if(!p||!walk(SP,p).ok) bad.push(it.label+'@'+it.x+','+it.z); } check(N+' 3. 每一個互動點旁邊站得住、走得到',!bad.length,bad.join(' ')||E.interactables.length+' 個'); }
    { const inside=[]; for(const b of TZS3.blocks(L)) if(stand(b[0],b[1],0,0.2)) inside.push(b.join('/')); check(N+' 4. 家具、櫃台、廚房裡面站不住',!inside.length,inside.slice(0,4).join(' ')); }
    if(L.clerk&&!L.clerkOpen){ const c=L.clerk, r=sim(SP,[c.x,c.z,0],1/30,1.8); check(N+' 4. 店員的位置在櫃台後面：客人走不進去（'+c.x+','+c.z+'）',!!z.shopClerk&&!r.ok); }
    check(N+' 5. 互動點的 kind 都有（給 LAWWW 接）；座位的 table 寫了桌號',(L.points||[]).every(p=>E.interactables.some(i=>i.kind===p.kind))&&E.interactables.filter(i=>i.tzSeat).every(i=>/_t\d+$/.test(i.seat.table)));
    check(N+' 6. 正式模型：資產有登記、GLB 檔案在、zone_assets 這一區有它',!!ASSETS.manifest[L.asset]&&fs.existsSync(path.join(ROOT,L.glb))&&new RegExp('"'+L.zone+'":\\[[^\\]]*'+L.asset.replace('.','\\.')).test(fs.readFileSync(path.join(ROOT,'src/data/zone_assets.js'),'utf8')),L.glb); } }
/* BB_255（11-10）：洗樂——牆面乾淨、兌幣機和洗衣精販賣機各一台有字；印得好——客用電腦工作站、裁紙機、膠裝機看得出來、牆面乾淨 */
{ const gl=id=>{ try{ const d=fs.readFileSync(path.join(ROOT,ALL[id].glb)), jl=d.readUInt32LE(12); return JSON.parse(d.slice(20,20+jl).toString('utf8')); }catch(e){ return {nodes:[],materials:[],images:[]}; } };
  for(const id of ids){ const J=gl(id), wall=(J.materials||[]).find(m=>m.name==='tzs_wall');   /* BB 11-10 23:51：六間（＋禮貌生財）一起換，不要一間一間改 */
    check(ALL[id].name+' 8. 牆面是乾淨的平塗（沒有灰泥貼圖的斑塊）',!!wall&&!(wall.pbrMetallicRoughness||{}).baseColorTexture&&!wall.normalTexture); }
  for(const id of ['xile','yindehao']){ const J=gl(id), lab=(J.materials||[]).find(m=>/_labels$/.test(m.name));
    check(ALL[id].name+' 8. 機器的字牌在模型裡（S_labels）',(J.nodes||[]).some(n=>n.name==='S_labels')&&!!lab&&!!(lab.pbrMetallicRoughness||{}).baseColorTexture); }
  const py=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/tz_shops_interior.py'),'utf8');
  check('洗樂洗衣坊 8. 兌幣機、洗衣精販賣機是兩台、各自有字（兌幣機／洗衣精）',/'coin', '兌幣機'/.test(py)&&/'soap', '洗衣精'/.test(py)&&/label\('coin'/.test(py)&&/label\('soap'/.test(py));
  const Y=ALL.yindehao; check('印得好 8. 有給客人用的電腦工作站（配置 pc、互動點 tz_yin_pc、擋住）；裁紙機、膠裝機有字牌',!!Y.pc&&Y.points.some(p=>p.kind==='tz_yin_pc')&&Y.blocks.some(b=>Math.abs(b[0]-Y.pc.x)<0.01&&Math.abs(b[1]-Y.pc.z)<0.01)&&/label\('cut'/.test(py)&&/label\('bind'/.test(py)&&/label\('pc'/.test(py)); }
/* BB 11-10 23:51 公館三間第 1 版判定：安泰藥局貨架像書店 → 藥盒、藥瓶、口罩盒；汀州鮮果太空 → 吊著的香蕉、地上的箱子堆（導航擋住） */
{ const py=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/tz_shops_interior.py'),'utf8'), X=ALL.xianguo;
  check('安泰藥局 9. 貨架用藥局的商品（pharma：藥盒、藥瓶、口罩盒），不是書店那種色塊',/def pharma\(/.test(py)&&/gondola\(g, MED, fill=pharma\)/.test(py)&&(py.match(/pharma\(/g)||[]).length>=3);
  if(X){ const z=loadZone(X.zone), ES=X.extraStacks||[], bad=[]; for(const e of ES){ const cx=(e.x0+e.x1)/2, cz=(e.z0+e.z1)/2; if(stand(cx,cz,0,0.2)&&!(e.gaps||[]).some(g=>g[0]<cx&&cx<g[1])) bad.push(cx+','+cz); }
    check('汀州鮮果 9. 補滿：地上三處箱子堆（配置 extraStacks）導航擋住、吊著的香蕉在模型腳本裡；出生點到每個互動點照舊走得到（第 3 項）',ES.length>=3&&!bad.length&&/def bunch\(/.test(py),bad.join(' ')); } }
/* 禮貌生財的書房（X332）：平常鎖著、解鎖以後走得進去 */
if(ALL.limao){ const L=ALL.limao, SD=L.study, z=loadZone(L.zone), SP=[L.spawn.x,L.spawn.z,0], in0=[-0.6,SD.z1-0.8,0];
  const dIt=E.interactables.find(i=>i.kind===SD.door.kind), n0=E.interactables.length;
  check('禮貌生財 7. 書房平常鎖著：裡面站不住、走不進去；門口有「書房的門」互動點（走得到）；書房的互動點還沒有',z.studyOpen===false&&!stand(in0[0],in0[1],0)&&!sim(SP,in0,1/30,1.8).ok&&!!dIt&&!!standNear(dIt)&&walk(SP,standNear(dIt)).ok&&!E.interactables.some(i=>/^tz_limao_study_(books|desk|photo)$/.test(i.kind)));
  z.setStudy(true); const pts=SD.points.map(p=>E.interactables.find(i=>i.kind===p.kind)), bad=[]; for(const it of pts){ const p=it&&standNear(it), r=p&&walk(SP,p); if(!p||!r.ok) bad.push((it?it.label:'沒有')+JSON.stringify(p)+fmt(r||{})); }
  const seat=E.interactables.find(i=>i.tzSeat==='desk'), ap=seat&&approach(seat.seat);
  check('禮貌生財 7. 解鎖（zone.setStudy(true)）：從命理館走得進書房；看書櫃、看書桌、看合照都走得到；書桌的椅子可以坐；書櫃和書桌裡面站不住',z.studyOpen===true&&stand(in0[0],in0[1],0)&&walk(SP,in0).ok&&!bad.length&&!!ap&&walk(SP,ap).ok&&SD.blocks.every(b=>!stand(b[0],b[1],0,0.2)),bad.join(' ')+' 開='+z.studyOpen+' 站='+stand(in0[0],in0[1],0)+' 進='+walk(SP,in0).ok+' 椅='+JSON.stringify(ap)+(ap?walk(SP,ap).ok:'')+' 擋='+SD.blocks.filter(b=>stand(b[0],b[1],0,0.2)).join('|'));
  z.setStudy(false); check('禮貌生財 7. 再鎖起來：又走不進去、書房的互動點拿掉',!stand(in0[0],in0[1],0)&&E.interactables.length===n0&&z.studyOpen===false);
  const glb=path.join(ROOT,L.glb); let names=[]; try{ const d=fs.readFileSync(glb), jl=d.readUInt32LE(12); names=(JSON.parse(d.slice(20,20+jl).toString('utf8')).nodes||[]).map(n=>n.name); }catch(e){}
  check('禮貌生財 7. 模型：書房的東西在 STUDY_* 節點（平常不顯示）、關著的門 STUDY_DOOR_*、蓋子 STUDY_LID_*',names.some(n=>/^STUDY_(vc|wood_d)/.test(n))&&names.some(n=>/^STUDY_DOOR_/.test(n))&&names.some(n=>/^STUDY_LID_/.test(n)),names.filter(n=>/^STUDY/.test(n)).join(' '));
  check('禮貌生財 7. 配置的旗標名是 LAWWW 實際用的 LM_STUDY；書房有「學生來信」的點（study_letters，東牆矮櫃前）',SD.flag==='LM_STUDY'&&SD.points.some(p=>p.id==='study_letters'&&p.kind==='tz_limao_study_letters')); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
