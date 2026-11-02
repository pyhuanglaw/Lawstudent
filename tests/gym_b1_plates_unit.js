// 體育館 B1 的門牌畫字（GYM-B1-PLATES-1101，LAWWW2-B 2026-11-01）——不需要瀏覽器。
// 找到的經過：照片比對時掃全部名牌，gym_b1.glb 的三塊門牌（女更衣室、男更衣室、壁球室・桌球室）遊戲沒有畫字——gym_b1 用 Z3.attachRoomGLB 接正式模型，它不畫 PLATE_FACE_*；
//   遊戲內截圖：壁球室那塊是一塊沒有字的深色牌子，兩個更衣室的門牌整塊看不到（GLB 裡正面朝門板、單面材質，從走廊看是背面）。
// 修法（gym3d.js）：attachRoomGLB 之後 GY3.b1Plates(root, B)——照配置 closedDoors 的 label 對到門牌，照 face（門朝哪邊）重算 UV、畫字、雙面。
// 檢查：①gym_b1 接正式模型以後呼叫 b1Plates ②GLB 的三塊門牌都對得到配置的 closedDoors ③用 GLB 裡門牌真正的頂點建網格、跑 b1Plates：三塊都畫了、字就是 label
//       ④從門朝的那一邊看，u 往右手邊變大、v 往下變大（字是正的）⑤雙面（兩個更衣室的門牌正面朝門板）
// 用法：node tests/gym_b1_plates_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const DRAWN=[]; const ctx2d=new Proxy({}, {get:(o,k)=>k==='fillText'?(t=>DRAWN.push(String(t))):k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch'));
for(const f of ['src/data/gym_layout.js','src/gym3d.js']) vm.runInThisContext(fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (GYM_LAYOUT|GY3)\s*=/mg,'global.$1='),{filename:f});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

const src=fs.readFileSync(path.join(ROOT,'src/gym3d.js'),'utf8'), i=src.indexOf("ASSETS.loadOne('bldg.gym_b1')"), seg=i>=0?src.slice(i,i+600):'';
check('① gym_b1 接正式模型以後畫門牌（attachRoomGLB 之後呼叫 b1Plates(root,B)）',typeof GY3.b1Plates==='function'&&/Z3\.attachRoomGLB\(z,g0,fb,root\);[^}]*b1Plates\(root,B\)/.test(seg));
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/gym_b1.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), bin=b.slice(20+n+8);
const acc=(k,nc)=>{ const a=j.accessors[k], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), sz={5126:4,5125:4,5123:2,5121:1}[a.componentType], st=bv.byteStride||nc*sz, rd={5126:'readFloatLE',5125:'readUInt32LE',5123:'readUInt16LE',5121:'readUInt8'}[a.componentType];
  const out=[]; for(let q=0;q<a.count;q++){ for(let c=0;c<nc;c++) out.push(bin[rd](o+q*st+c*sz)); } return out; };
const doors=GYM_LAYOUT.b1.closedDoors, root=new THREE.Group(), plates=[];
for(const nd of j.nodes){ if(nd.mesh==null||!/^PLATE_FACE_door_b1_/.test(nd.name)) continue; const pr=j.meshes[nd.mesh].primitives[0], g=new THREE.BufferGeometry();
  g.setAttribute('position',new THREE.BufferAttribute(new Float32Array(acc(pr.attributes.POSITION,3)),3)); if(pr.indices!=null) g.setIndex(acc(pr.indices,1));
  const m=new THREE.Mesh(g,new THREE.MeshStandardMaterial({color:0x3a2a1e})); m.name=nd.name; if(nd.translation) m.position.fromArray(nd.translation); m.userData=Object.assign({},nd.extras||{}); root.add(m); plates.push(m); }
const unmatched=plates.filter(p=>!doors.some(d=>d.label===p.userData.text)).map(p=>p.name);
check('② GLB 的門牌（'+plates.length+' 塊）都對得到配置的 closedDoors',plates.length===3&&!unmatched.length,unmatched.join('、'));
let painted=0; try{ painted=GY3.b1Plates?GY3.b1Plates(root,GYM_LAYOUT.b1):0; }catch(e){ check('③ b1Plates 執行',false,String(e)); }
const notDrawn=plates.filter(p=>!(p.material.map&&p.userData.plateText===p.userData.text&&DRAWN.includes(p.userData.text))).map(p=>p.name);
check('③ 三塊門牌都畫上字，字就是 label',painted===3&&!notDrawn.length,'畫了 '+painted+'；'+notDrawn.join('、')+'；fillText：'+DRAWN.join('、'));
const FACE={south:[0,1],north:[0,-1],east:[1,0],west:[-1,0]}, bad=[];
for(const p of plates){ const d=doors.find(q=>q.label===p.userData.text), f=d&&FACE[d.face], uv=p.geometry.attributes.uv, P=p.geometry.attributes.position; if(!f||!uv){ bad.push(p.name+'（沒有 UV）'); continue; }
  const rx=f[1], rz=-f[0];   // 從門朝的那一邊看：右手邊
  let ok=true; for(let a=0;a<P.count;a++) for(let c=0;c<P.count;c++){ const ds=(P.getX(c)-P.getX(a))*rx+(P.getZ(c)-P.getZ(a))*rz, dy=P.getY(c)-P.getY(a);
    if(ds>1e-4&&!(uv.getX(c)>uv.getX(a))) ok=false; if(dy>1e-4&&!(uv.getY(c)<uv.getY(a))) ok=false; }
  if(!ok) bad.push(p.name); }
check('④ 從門朝的那一邊看，u 往右、v 往下（字是正的）',!bad.length,bad.join('、'));
const single=plates.filter(p=>p.material.side!==THREE.DoubleSide).map(p=>p.name);
check('⑤ 門牌雙面（更衣室的門牌在 GLB 裡正面朝門板）',!single.length,single.join('、'));
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
