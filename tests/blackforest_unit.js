// 黑森林（CAMPUS-BLACKFOREST-1102；使用者 11-02 20:3x「你的黑森林超奇怪的，而且裡面怎麼還會有草皮中的磁磚啊，而且你這一小塊根本就不能叫做黑森林」）——不需要瀏覽器。
// 在 Node 裡建出遊戲真正的校園，檢查：
//   森林夠大、夠密：配置的範圍裡至少 45 棵樹、每棵平均不到 35 m²（第二十四批的版本 11 棵 → FAIL）；
//   森林範圍裡沒有淺色地磚（W3.pathTex；第二十四批穿過樹林的小步道、往萬才館那條 → FAIL）；
//   每棵樹的樹幹擋住導航；水池照舊擋住；
//   路人路線的點站得住、走得到（引擎真正的找路＋移動碰撞，走路、跑步＋低幀率）；每條土徑沿線站得住；往萬才館的入口走得到；
//   騎腳踏車的人（直線、不找路）的路線離每棵樹幹至少 1 m。
// 用法：node tests/blackforest_unit.js
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
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
const TREES=[]; { const orig=TK.tree; TK.tree=(...a)=>{ const t=orig(...a); TREES.push(t); return t; }; }   /* 記下校園上每一棵闊葉樹（檢查方案 A 留下的樹）*/

process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
const z=Z3.ZONES.campus.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const L=BLACKFOREST_LAYOUT, n=z.nav;
const inArea=(x,zz)=>L.areas.some(a=>x>=a.x0&&x<=a.x1&&zz>=a.z0&&zz<=a.z1);
const pos=t=>{ const v=new THREE.Vector3(); t.getWorldPosition(v); return v; };
const inTrees=TREES.map(pos).filter(v=>inArea(v.x,v.z)); const m2=L.areas.reduce((s,a)=>s+(a.x1-a.x0)*(a.z1-a.z0),0);
check('黑森林夠大、夠密：配置的範圍裡至少 45 棵樹，每棵平均不到 35 m²', inTrees.length>=45&&m2/inTrees.length<35, `${inTrees.length} 棵、${Math.round(m2)} m²、每棵 ${(m2/Math.max(1,inTrees.length)).toFixed(1)} m²（第二十四批 11 棵）`);
const pt=W3.pathTex(); let tiles=[]; z.group.updateMatrixWorld(true);
const onPaved=(x,zz)=>L.paths.some(p=>p.kind==='paved'&&p.pts.some((a,i)=>{ if(i===0) return false; const [ax,az]=p.pts[i-1], [bx,bz]=a, dx=bx-ax, dz=bz-az, L2=dx*dx+dz*dz||1, u=Math.max(0,Math.min(1,((x-ax)*dx+(zz-az)*dz)/L2)); return Math.hypot(x-ax-u*dx,zz-az-u*dz)<p.w/2+0.6; }));   /* 第二版：兩館之間的走道、往萬才館的路是配置裡標明的鋪面（kind paved） */
z.group.traverse(o=>{ if(!o.isMesh||!o.material||!o.material.map||o.material.map.source!==pt.source) return; o.geometry.computeBoundingBox(); const c=o.geometry.boundingBox.getCenter(new THREE.Vector3()).applyMatrix4(o.matrixWorld); if(inArea(c.x,c.z)&&!onPaved(c.x,c.z)) tiles.push([+c.x.toFixed(1),+c.z.toFixed(1)]); });
check('森林範圍裡沒有淺色地磚（W3.pathTex）：土徑是土（配置標成鋪面的走道、往萬才館的路除外）', tiles.length===0, JSON.stringify(tiles));
const stand=(x,zz)=>E.canStand(x,zz,0.3,0);
const badT=L.trees.filter(t=>stand(t.x,t.z));
check('每棵樹的樹幹擋住導航（'+L.trees.length+' 棵）', badT.length===0, JSON.stringify(badT.slice(0,5).map(t=>[t.x,t.z])));
check('水池照舊擋住（人走不進池子）', !stand(L.pond.x,L.pond.z));
const walk=(a,b)=>{ for(const [dt,sp] of [[1/30,1.6],[0.1,4.1]]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt,speed:sp}); if(!r.ok) return Object.assign({dt:+dt.toFixed(3),speed:sp},r); } return null; };
const LINZE=[34,-98];
const badK=L.keep.filter(k=>!stand(k[0],k[1])); check('路人路線的點都站得住', badK.length===0, JSON.stringify(badK));
for(const [a,b,label] of [[LINZE,[50,-80],'霖澤館前 → 廣場邊 (50,−80)'],[[50,-80],[30,-68],'廣場邊 → 小椰林道 (30,−68)（穿過森林西北角）'],[[66,-80],[60,-62],'廣場 → 森林中間的土徑 → z −60 的路'],
  [[60,-62],[47,-44.2],'z −60 的路 → 南邊森林的土徑 → 南邊'],[[92,-62],[93,-66],'z −60 的路 → 往萬才館的土徑'],[[93,-66],(L.version>=4?[WC3.CAMPUS_1F.x,WC3.CAMPUS_1F.z]:[93.8,-98.4]),'往萬才館的土徑 → 萬才館一樓入口前（第四版起：出來的落點照 wancai3d.js CAMPUS_1F）'],[LINZE,[80.4,-44.2],'霖澤館前 → 南邊森林東邊的土徑']]){
  const f=walk(a,b); check('走得到：'+label, !f, f?JSON.stringify(f):''); }
// LAWWW 20:22 指定要保持走得通的點：以安一起散步的檢查點（story3d.js walkChecks {x:40,z:-70,r:9}）、社科院圖書館門口與出來的站位（新版 SOCSCI_LAYOUT.libDoor／libOut；舊版 (97.9,−70)／(95.6,−70)）
{ const pts=[[40,-70,'以安散步的檢查點 (40,−70)']]; if(typeof SOCSCI_LAYOUT!=='undefined'&&SOCSCI_LAYOUT.libOut) pts.push([SOCSCI_LAYOUT.libOut.x,SOCSCI_LAYOUT.libOut.z,'社科院圖書館出來的站位（新版）']); pts.push([95.6,-70,'社科院圖書館出來的站位（舊版 soclib3d.js）']);
  for(const [x,zz,label] of pts){ const f=stand(x,zz)?walk(LINZE,[x,zz]):{ok:false,why:'站不住'}; check('走得到：霖澤館前 → '+label, stand(x,zz)&&!f, f?JSON.stringify(f):''); } }
let badP=[]; for(const p of L.paths) for(let i=0;i<p.pts.length-1;i++){ const [ax,az]=p.pts[i], [bx,bz]=p.pts[i+1]; const len=Math.hypot(bx-ax,bz-az); for(let s=0;s<=len;s+=1.0){ const x=ax+(bx-ax)*s/len, zz=az+(bz-az)*s/len; if(inArea(x,zz)&&!stand(x,zz)) badP.push([p.id,+x.toFixed(1),+zz.toFixed(1)]); } }
check('每條土徑的中線都站得住（森林範圍裡、每 1 m 一點）', badP.length===0, JSON.stringify(badP.slice(0,6)));
const ss=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'), mm=ss.match(/const bikeRoutes=\{campus:(\[\[\[[\s\S]*?\]\]\])/); let bikeBad=[];
if(mm){ const routes=JSON.parse(mm[1]); for(const r of routes) for(let i=0;i<r.length;i++){ const a=r[i], b=r[(i+1)%r.length]; const dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1; for(const t of L.trees){ const u=Math.max(0,Math.min(1,((t.x-a[0])*dx+(t.z-a[1])*dz)/L2)); const d=Math.hypot(t.x-a[0]-u*dx,t.z-a[1]-u*dz); if(d<t.trunk+1.0) bikeBad.push([a,b,[t.x,t.z]]); } } }
check('騎腳踏車的人（直線、不找路）的路線離每棵樹幹至少 1 m', !!mm&&bikeBad.length===0, mm?JSON.stringify(bikeBad.slice(0,3)):'找不到 bikeRoutes');
// ---- 第二版（使用者 11-02 21:3x 實景照片＋官方地圖）：兩館之間的走道經過小湖，湖再往校園那一側是黑森林；霖澤館前庭的劇情站位照舊 ----
if(L.version>=2){ const P0=L.pond, LINZE_X=34, WANCAI_X=88;
  /* 第三版的小湖是彎曲的水道（pts、hw、outline）：中心＝輪廓平均、rx＝輪廓往西到中心的距離；第二版是橢圓（x、z、rx、rz）*/
  const P=P0.outline?(()=>{ const o=P0.outline, cx=o.reduce((s,q)=>s+q[0],0)/o.length, cz=o.reduce((s,q)=>s+q[1],0)/o.length; return Object.assign({},P0,{x:cx,z:cz,rx:cx-Math.min(...o.map(q=>q[0]))}); })():P0;
  check('第二版：小湖在兩館之間（x 介於霖澤館、萬才館中心）、在兩館正面南邊', P.x>LINZE_X&&P.x<WANCAI_X&&P.z>-102, JSON.stringify([P.x,P.z]));
  const walkP=L.paths.find(p=>p.id==='walk'); const segD=(px,pz,a,b)=>{ const dx=b[0]-a[0], dz=b[1]-a[1], L2=dx*dx+dz*dz||1, u=Math.max(0,Math.min(1,((px-a[0])*dx+(pz-a[1])*dz)/L2)); return Math.hypot(px-a[0]-u*dx,pz-a[1]-u*dz); };
  let dMin=1e9; if(walkP&&P0.outline){ for(const q of P0.outline) for(let i=1;i<walkP.pts.length;i++) dMin=Math.min(dMin,segD(q[0],q[1],walkP.pts[i-1],walkP.pts[i])); } else if(walkP) dMin=Math.abs(walkP.pts[0][0]-(P.x-P.rx));
  check('第二版：兩館之間往南的走道經過小湖旁邊（走道中線離水邊 ≤ 4 m）、接到 z −60 的路', !!walkP&&dMin<=4&&walkP.pts[walkP.pts.length-1][1]>=-66, walkP?JSON.stringify(walkP.pts)+' 離水邊 '+dMin.toFixed(2)+' m':'沒有');
  const arS=L.areas.reduce((s,a)=>s+(a.z1>P.z?(a.x1-a.x0)*(a.z1-a.z0):0),0); check('第二版：森林在小湖往校園那一側（≥ 85% 的範圍延伸到小湖南邊；第四版前庭和走道之間那一小塊在湖北邊、種垂柳）', arS>=0.85*m2, Math.round(100*arS/m2)+'%');
  check('第二版：森林夠大（≥ '+(L.version>=4?'1,500':'1,800')+' m²；第一版 1,450、第二十四批 480；第四版萬才館照官方地圖移到東南、佔掉原本東邊那一塊）', m2>=(L.version>=4?1500:1800), Math.round(m2)+' m²');
  for(const [x,zz,label] of [[50,-93,'劇情站位 (50,−93) 法學院廣場'],[58,-90,'路人一對 (58,−90)'],[61,-94,'事件 (61,−94)']]){ const f=stand(x,zz)?walk(LINZE,[x,zz]):{ok:false,why:'站不住'}; check('第二版：霖澤館前庭照舊—'+label+' 站得住、走得到', stand(x,zz)&&!f, f?JSON.stringify(f):''); }
  { const f=walk([63.75,-100],[63.75,-62]); check('第二版：走道從兩館之間一路走到 z −60 的路', !f, f?JSON.stringify(f):''); }
  { const sb=z.seats?z.seats.find(q=>/小湖/.test(q.label)):null; const ap=sb?[sb.x+Math.sin(sb.yaw)*0.9,sb.z+Math.cos(sb.yaw)*0.9]:null;   /* 面前 0.9 m（走道上）*/ const f=ap&&stand(ap[0],ap[1])?walk(LINZE,ap):{ok:false};
    check('第二版：湖邊長椅（面向小湖）面前站得住、走得到', !!sb&&!f, sb?JSON.stringify([sb.x,sb.z,sb.yaw]):'沒有'); }
  let wet=0, n=0;
  if(P0.pts){ for(let i=0;i<P0.pts.length-1;i++) for(let k=0;k<6;k++){ const t=k/6, ax=P0.pts[i][0], az=P0.pts[i][1], bx=P0.pts[i+1][0], bz=P0.pts[i+1][1], cx=ax+(bx-ax)*t, cz=az+(bz-az)*t, hw=P0.hw[i]+(P0.hw[i+1]-P0.hw[i])*t, ln=Math.hypot(bx-ax,bz-az), nx=-(bz-az)/ln, nz=(bx-ax)/ln;
      for(const f of [-0.9,-0.5,0,0.5,0.9]){ n++; if(stand(cx+nx*hw*f,cz+nz*hw*f)) wet++; } } }   /* 第三版：沿著水道中心線、橫跨水面 5 個點 */
  else for(let k=0;k<24;k++){ const a=k/24*Math.PI*2, kk=1+0.10*Math.sin(2*a+0.6)+0.05*Math.cos(3*a); for(const f of [0.3,0.7,0.95]){ n++; if(stand(P.x+Math.cos(a)*P.rx*kk*f,P.z+Math.sin(a)*P.rz*kk*f)) wet++; } }
  check('第二版：小湖整個不能走（水面的點都站不住）', wet===0, wet+'/'+n);
  check('第二版：垂柳的樹幹擋住', !stand(P.willow[0],P.willow[1])); }
if(L.version>=4){
  let wb=null; z.group.traverse(o=>{ if(!wb&&o.userData&&o.userData.ck&&o.userData.ck.wancai) wb=o; }); const ry=wb?wb.rotation.y:0;
  const toW=(lx,lz)=>[wb.position.x+lx*Math.cos(ry)+lz*Math.sin(ry), wb.position.z-lx*Math.sin(ry)+lz*Math.cos(ry)];   /* 萬才館本地座標 → 校園（第五版轉 42°）*/
  if(L.version>=5) check('第五版（使用者 11-03「系館a不應該跟系館b平行」）：萬才館照官方地圖斜放、轉 34～50°（第四版 0°＝和霖澤館平行 → FAIL）', !!wb&&Math.abs(Math.abs(ry)*180/Math.PI-42)<=8, wb?(ry*180/Math.PI).toFixed(1)+'°':'沒有萬才館');
  const wc=E.interactables.find(i=>i.exit&&i.exit.to==='wancai'&&!i.lv), ex=wb?toW(5.8,11.4):[0,0]; check('第四版起（法學院重排）：萬才館一樓入口在建築本地 (5.8, 11.4)（陽台下），跟著建築搬、轉', !!wc&&Math.abs(wc.x-ex[0])<0.3&&Math.abs(wc.z-ex[1])<0.3, wc?JSON.stringify([+wc.x.toFixed(2),+wc.z.toFixed(2)]):'沒有');
  check('第四版：萬才館在霖澤館東南、不是東西並排（萬才館入口比霖澤館入口 (34,−98) 東 ≥ 40 m、南 ≥ 8 m）', !!wc&&wc.x-34>=40&&wc.z-(-98)>=8, wc?JSON.stringify([wc.x,wc.z]):'');
  for(const [p,label] of [[[WC3.CAMPUS_1F.x,WC3.CAMPUS_1F.z],'萬才館出來的落點（wancai3d.js CAMPUS_1F）'],[toW(5.8,14.4),'以安在萬才館門口等的站位（heroine_circle.js）'],[toW(9.5,17),'吉他社女生的站位（pool）']]){ const [x,zz]=p; const f=stand(x,zz)?walk(LINZE,[x,zz]):{ok:false,why:'站不住'}; check('第四版：'+label+' '+JSON.stringify([+x.toFixed(2),+zz.toFixed(2)])+' 站得住、從霖澤館前走得到', stand(x,zz)&&!f, f?JSON.stringify(f):''); }
  const bk=toW(-1,-17.3); check('第四版：國青大樓、研三舍、萬才館背面走不到', !stand(bk[0],bk[1])&&!stand(65,-119)&&!stand(63,-108), JSON.stringify(bk.map(v=>+v.toFixed(1)))); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
