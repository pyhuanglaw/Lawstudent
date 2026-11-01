// X140 經濟系系外套（SK02-LINE-JACKET-1030，LAWWW2-B 2026-10-30）：模型和遊戲端的接點。node tests/jacket_econ_unit.js
//   1. vroid_yuting.vrm 有 JACKET_ECON 節點：和 Body 同一個 skin、一個 primitive、材質名稱有 Tops 和 _CLOTH（遊戲的衣服壓暗、邊緣光照上衣的規則）、有貼圖
//   2. char.yuting 的 manifest hide 有 JACKET_ECON（每次建模型先藏）；character3d.js 有 CHAR.setJacket
//   3. dorm_room4.glb 有 JACKET_CHAIR（底下有網格、沒有第二套 UV＝烘焙時不存在）；layout 的 jacket_chair 指到它、位置在祐廷（L2）的椅子旁邊
//   4. zones3d.js 的宿舍有 z.setJacketChair，換年份（dormSet）時照樣套用
// 實際的顯示、走路坐下樓梯的截圖：tools/blender/env_second/shots/jacket_ingame.py（瀏覽器）
const fs=require('fs'), path=require('path'); const R=path.join(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'  '+info:'')); if(!ok) fails++; };
function glbJSON(f){ const b=fs.readFileSync(path.join(R,f)); const L=b.readUInt32LE(12); return JSON.parse(b.slice(20,20+L).toString('utf8')); }
// 1
const V=glbJSON('assets/models/char/vroid_yuting.vrm');
const jn=V.nodes.find(n=>n.name==='JACKET_ECON'), body=V.nodes.find(n=>n.mesh!=null&&V.meshes[n.mesh].name.startsWith('Body'));
check('1. VRM 有 JACKET_ECON 節點', !!jn);
if(jn){ const m=V.meshes[jn.mesh], p=m.primitives, mat=V.materials[p[0].material];
  check('1. 和 Body 同一個 skin（同一副骨架）', body&&jn.skin===body.skin, 'skin '+jn.skin+'／Body '+(body&&body.skin));
  check('1. 一個 primitive、有 JOINTS_0／WEIGHTS_0', p.length===1&&p[0].attributes.JOINTS_0!=null&&p[0].attributes.WEIGHTS_0!=null);
  check('1. 材質名稱有 Tops、_CLOTH', /Tops/.test(mat.name)&&/_CLOTH/.test(mat.name), mat.name);
  const vm=V.extensions.VRM.materialProperties[p[0].material];
  check('1. VRM 材質表（MToon）對得上、有 _MainTex', vm&&vm.name===mat.name&&vm.textureProperties._MainTex!=null);
  check('1. 在場景裡', V.scenes[V.scene||0].nodes.includes(V.nodes.indexOf(jn))); }
// 2
const A=fs.readFileSync(path.join(R,'src/assets3d.js'),'utf8'), C=fs.readFileSync(path.join(R,'src/character3d.js'),'utf8'), Z=fs.readFileSync(path.join(R,'src/zones3d.js'),'utf8');
const yl=A.split('\n').find(l=>/'char\.yuting':/.test(l))||'';
check("2. char.yuting 的 hide 有 'JACKET_ECON'", /hide:\[[^\]]*'JACKET_ECON'/.test(yl));
check('2. character3d.js 有 C.setJacket', /C\.setJacket=function\(h,on\)/.test(C));
// 3
const D=glbJSON('assets/models/env/second_ai/dorm_room4.glb'), LY=JSON.parse(fs.readFileSync(path.join(R,'assets/models/env/second_ai/dorm_room4.layout.json'),'utf8'));
const ji=D.nodes.findIndex(n=>n.name==='JACKET_CHAIR');
check('3. dorm_room4.glb 有 JACKET_CHAIR', ji>=0);
if(ji>=0){ const kids=(D.nodes[ji].children||[]).map(i=>D.nodes[i]).filter(n=>n.mesh!=null);
  check('3. JACKET_CHAIR 底下有網格', kids.length>0, kids.map(n=>n.name).join('、'));
  check('3. 沒有第二套 UV（烘焙時不存在，照即時光）', kids.every(n=>D.meshes[n.mesh].primitives.every(p=>p.attributes.TEXCOORD_1==null)));
  const J=LY.jacket_chair, L2=LY.units.find(u=>u.id==='L2');
  check('3. layout.jacket_chair 指到 JACKET_CHAIR、L2', J&&J.node==='JACKET_CHAIR'&&J.unit==='L2'&&LY.player_unit==='L2');
  check('3. 位置在 L2 椅子後面（離座位 0.2～0.5 m、同一個 z）', J&&L2&&Math.abs(J.z-L2.seat.z)<0.05&&Math.abs(J.x-L2.seat.x)>0.2&&Math.abs(J.x-L2.seat.x)<0.5, J&&('x '+J.x+'／座位 '+L2.seat.x)); }
// 4
check('4. zones3d.js 宿舍有 z.setJacketChair、預設 false', /z\.jacketChair=false; z\.setJacketChair=on=>/.test(Z));
check('4. 換年份（dormSet）時照樣套用', /o\.visible=!S\.hide\.test\(o\.name\); \}\); z\.setJacketChair\(z\.jacketChair\); \};/.test(Z));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
