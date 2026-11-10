// 套件五棟照官網事實改參數（NTU-REF-1110，LAWWW2 帳號 A 11-10；X223／D136 像但不照抄）——不需要瀏覽器（D131）。
// 事實：docs/art-rebuild/second_ai/ntu_ref_keep_change_1110.md（照 docs/story_planning/ref_images/buildings/README.md 的文字）：
//   電機二館＝長條紅磚樓、拱窗；土木工程館＝平屋頂、4 層、中間玻璃樓梯塔、沒有一樓拱廊；圖書資訊學系館＝白色、頂層拱形窗；
//   農業綜合大樓＝紅磚＋花崗石帶、5 層；國際學苑（國青大樓）＝11 層、米色面磚、上面三層深褐色凸窗。
// 檢查（Node 建真正的校園）：
//   1 顏色（zones3d.js 的參數）：電機二館、農綜紅磚色；圖資白色；國青米色
//   2 樓高（套件回傳的 H）：土木 4 層、農綜 5 層、國青 11 層；電機二館是 CK.hall（有拱窗的系館套件，不是白色現代樓）、4 層
//   3 土木：沒有一樓拱廊；正面中間的玻璃樓梯塔真的凸出來（從正前方往裡打，塔那一列先碰到塔、旁邊碰到牆）；平屋頂；塔擋導航、塔前面走得到
//   4 國青：最上面三層有凸窗（正面往裡打，頂樓先碰到凸窗、低樓層碰到牆）；屋頂面不是全黑（BB_248 P3）
//   5 圖資：最上面一層是拱窗（套件的 topArch）
// 修改前（開發分支 8d8b475dc＋③-4）：全部 FAIL。用法：node tests/ntu_ref_kit5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','src/data/blackforest_layout.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js','src/data/socsci_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js',
  'src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(BLACKFOREST_LAYOUT|THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|TB3|ACTIVITIES|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const ZS=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const lineOf=sign=>ZS.split('\n').find(l=>l.includes("sign:'"+sign+"'"))||'';
const wallOf=sign=>{ const l=lineOf(sign), m=l.match(/wall:(?:LR\?)?'(#[0-9a-f]{6})'/i); return m?m[1]:null; };
const rgb=h=>h?[1,3,5].map(i=>parseInt(h.slice(i,i+2),16)/255):[0,0,0], lum=h=>{ const [r,g,b]=rgb(h); return 0.2126*r+0.7152*g+0.0722*b; };
const red=h=>{ const [r,g,b]=rgb(h); return r>g*1.5&&r>b*1.6&&r>0.5; }, beige=h=>{ const [r,g,b]=rgb(h); return lum(h)>0.7&&lum(h)<0.9&&r>b+0.08; };
const W={ee:wallOf('電機二館'),agr:wallOf('農業綜合大樓'),lis:wallOf('圖書資訊學系館'),gq:wallOf('國際學苑')};
check('1 顏色：電機二館、農綜紅磚；圖資白色；國青米色', red(W.ee)&&red(W.agr)&&lum(W.lis)>0.85&&beige(W.gq), JSON.stringify(W));

const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
global.GAME={G:{hour:14,weather:'clear',flags:{},zone:'campus'}};
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
z.group.updateMatrixWorld(true);
const kits=[]; z.group.traverse(o=>{ if(o.userData&&o.userData.ck&&o.userData.ck.blocks){ const p=new THREE.Vector3(); o.getWorldPosition(p); kits.push({o,ck:o.userData.ck,x:p.x,z:p.z}); } });
const at=(x,zz)=>kits.filter(k=>Math.hypot(k.x-x,k.z-zz)<1).sort((a,b)=>Math.hypot(a.x-x,a.z-zz)-Math.hypot(b.x-x,b.z-zz))[0];
const LR=!!at(119,-62), K={ee:at(LR?119:112,-62),cv:at(7,-28),lis:at(51.5,-34)||at(57,-34),agr:at(45,33),gq:at(65,-119)||at(64,-134)};
const near=(a,b)=>Math.abs(a-b)<0.05, Hf=(gfh,fh,n)=>gfh+(n-1)*fh;
check('2 樓高：土木 4 層、農綜 5 層、國青 11 層；電機二館是 CK.hall、4 層', !!(K.cv&&K.agr&&K.gq&&K.ee)&&near(K.cv.ck.H,Hf(4.4,3.6,4))&&near(K.agr.ck.H,Hf(4.2,3.5,5))&&near(K.gq.ck.H,Hf(4.0,3.2,11))&&/CK\.hall\(\{[^}]*sign:'電機二館'/.test(lineOf('電機二館'))&&near(K.ee.ck.H,Hf(4.4,3.85,4)),
  'H '+['cv','agr','gq','ee'].map(k=>k+' '+(K[k]?K[k].ck.H.toFixed(2):'沒找到')).join('、'));

const rc=new THREE.Raycaster(); const hit=(k,o,dir,far=80)=>{ const ms=[]; k.o.traverse(m=>{ if(m.isMesh) ms.push(m); }); rc.set(new THREE.Vector3(...o),new THREE.Vector3(...dir).normalize()); rc.far=far; const h=rc.intersectObjects(ms,false).filter(i=>!(E.colliders||[]).includes(i.object)); return h[0]||null; };   /* 只打這一棟自己的網格（前面的樹、路燈不算） */
const stand=(x,zz)=>E.canStand(x,zz,0.3,0);
if(K.cv){ const c=K.cv.ck, fz=-28+c.d/2, mid=c.gfh+c.H/2*0.5;
  const ht=hit(K.cv,[7,mid,fz+30],[0,0,-1]), hw=hit(K.cv,[7+c.w/2-2,mid,fz+30],[0,0,-1]), hr=hit(K.cv,[7+c.w/4,c.H+20,-28],[0,-1,0]);
  const tz=ht?ht.point.z:null, wz=hw?hw.point.z:null, ry=hr?hr.point.y:null;
  check('3 土木：沒有一樓拱廊、正面中間的玻璃樓梯塔凸出來 ≥ 2 m、平屋頂；塔擋導航、塔前面走得到', c.ad===0&&!!c.stairTower&&tz!=null&&wz!=null&&tz-wz>=2&&ry!=null&&ry<c.H+1.5&&!stand(7,fz+1.2)&&stand(7,fz+4),
    `拱廊深 ${c.ad}；塔 ${JSON.stringify(c.stairTower)}；塔那一列碰到 z ${tz&&tz.toFixed(2)}、旁邊 ${wz&&wz.toFixed(2)}；屋頂最高 ${ry&&ry.toFixed(2)}（簷口 ${c.H.toFixed(2)}）；塔的位置 ${stand(7,fz+1.2)?'站得住':'擋住'}、塔前 ${stand(7,fz+4)?'走得到':'走不到'}`); }
else check('3 土木', false, '沒找到');
if(K.gq){ const c=K.gq.ck, gx=K.gq.x, gz=K.gq.z, nB=Math.max(2,Math.round((c.w-2)/3.4)), st=(c.w-2)/nB, bx=gx-(c.w-2)/2+st*0.5, yTop=c.gfh+(11-2)*3.2+1.67, yLow=c.gfh+2*3.2+1.67;
  const h1=hit(K.gq,[bx,yTop,gz+40],[0,0,-1]), h2=hit(K.gq,[bx,yLow,gz+40],[0,0,-1]), hr=hit(K.gq,[gx,c.H+30,gz],[0,-1,0]);
  const col=hr&&hr.object.material&&hr.object.material.color?hr.object.material.color:null, rl=col?0.2126*col.r+0.7152*col.g+0.0722*col.b:0;
  check('4 國青：最上面三層有凸窗（頂樓比低樓層凸出 ≥ 0.5 m）；屋頂面不是全黑', c.bays>0&&!!h1&&!!h2&&h1.point.z-h2.point.z>=0.5&&rl>0.12,
    `凸窗 ${c.bays}；頂樓碰到 z ${h1&&h1.point.z.toFixed(2)}、低樓層 ${h2&&h2.point.z.toFixed(2)}；屋頂面亮度 ${rl.toFixed(3)}`); }
else check('4 國青', false, '沒找到');
check('5 圖資：最上面一層是拱窗（topArch）', !!(K.lis&&K.lis.ck.topArch), K.lis?'topArch '+K.lis.ck.topArch:'沒找到');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
