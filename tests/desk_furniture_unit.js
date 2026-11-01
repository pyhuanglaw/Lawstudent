// 博雅的正式家具模組（LAWWW2 furniture_study.glb，VISUAL_REVIEW（second_ai）第 23 節）＋桌上小物（desk_props.glb，第 27 節）——不需要瀏覽器。
// 檢查：
//   A. 真正的 GLB：遊戲要用的網格都在（自習雙人桌、圓桌、自習椅；lset_* 五組＋_lod1）；替身的每一種姿勢都配得到一組；
//      自習椅的椅面高度（量 GLB 頂點）× 遊戲的放大倍數＝程序化椅子（Z3.chair）的椅面高度（遊戲的坐姿照這個高度調）。
//   B. 博雅大廳：12 張自習雙人桌、2 張圓桌換成正式模組（每種一個 InstancedMesh；位置＝桌子中心、自習桌整組轉 90°；32 張椅子＝每個座位一張、朝向＝座位 yaw、垂直放大）；
//      程序化備用藏起來；沙發照舊；座位、互動點、導航和載入失敗時完全一樣；載入失敗時備用照樣顯示。
//   C. 階梯教室的長桌桌面在那一排的平台上 0.75 m（和正式的講堂桌板、替身抄筆記的手、桌上小物同高；原本 0.77，桌上小物會陷進桌面 2 cm）。
//   D. 101 上課的替身：每個替身面前一組桌上小物，和替身同一個矩陣；抄筆記→lset_write、滑手機→lset_phone、聽講→筆電／書／六法；遠的替身配 _lod1；下課整組一起拿掉。
//   修改前：B 的 InstancedMesh、C 的桌面高度、D 的桌上小物都會失敗。
// 用法：node tests/desk_furniture_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/gongtong_layout.js','src/data/boya_layout.js','src/data/putong_layout.js','src/teach3d.js','src/data/calendar.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|TB3|LINZE_LAYOUT|CLASSROOM_LAYOUT|GONGTONG_LAYOUT|BOYA_LAYOUT|PUTONG_LAYOUT|PROPS|CHAR|CALENDAR|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const quiet=console.warn; console.warn=()=>{};   /* 載入失敗的警告是預期的 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; if(n.seat&&n.seat.y!=null) n.obj.position.y=n.seat.y; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},lv:0,radius:0.32}; return z; }
const tick=()=>new Promise(r=>setTimeout(r,0));
/* ---- 讀 GLB（JSON 區塊＋網格的頂點位置）---- */
function glb(rel){ const b=fs.readFileSync(path.join(ROOT,rel)); let off=12, js=null, bin=null; while(off<b.length){ const ln=b.readUInt32LE(off), ty=b.readUInt32LE(off+4), ch=b.subarray(off+8,off+8+ln); off+=8+ln; if(ty===0x4E4F534A) js=JSON.parse(ch.toString('utf8')); else if(ty===0x004E4942) bin=ch; } return {js,bin}; }
function positions(G,name){ const m=G.js.meshes.find(q=>q.name===name); if(!m) return null; const out=[]; for(const pr of m.primitives){ const a=G.js.accessors[pr.attributes.POSITION], bv=G.js.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12;
    for(let i=0;i<a.count;i++) out.push([G.bin.readFloatLE(o+i*st),G.bin.readFloatLE(o+i*st+4),G.bin.readFloatLE(o+i*st+8)]); } return out; }
const FURN=glb('assets/models/env/second_ai/furniture_study.glb'), PROPS=glb('assets/models/env/second_ai/desk_props.glb'), FIGS=glb('assets/models/env/second_ai/seated_figures.glb');
const names=G=>G.js.meshes.map(m=>m.name);
/* ---- 假的模型：名稱和真的 GLB 一樣（Node 裡不解貼圖）---- */
const fakeOf=list=>{ const g=new THREE.Group(); for(const n of list){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.2,0.2,0.2),new THREE.MeshBasicMaterial()); m.name=n; g.add(m); } return g; };
const fakeFurn=fakeOf(names(FURN)), fakeProps=fakeOf(names(PROPS)), fakeFig=fakeOf(names(FIGS));
let mode='ok'; ASSETS.loadOne=k=>{ if(mode!=='ok') return Promise.reject(new Error('no '+k)); return k==='prop.furniture_study'?Promise.resolve({scene:fakeFurn}):(k==='prop.desk_props'?Promise.resolve({scene:fakeProps}):(k==='prop.seated_figures'?Promise.resolve({scene:fakeFig}):Promise.reject(new Error('no '+k)))); };
global.CHAR=Object.assign(global.CHAR||{},{build:()=>new THREE.Object3D(),setExpr(){},release(){}}); global.STORY={extraSpec:i=>({id:'x'+i})};
let G={day:30,hour:10,zone:'boya',weekday:2,flags:{}}; const GM={get G(){ return G; },E,toast(){},caption(){}};
const live=[]; CLS.liveIn=()=>live.slice();
const decomp=(im,i)=>{ const M=new THREE.Matrix4(), P=new THREE.Vector3(), Q=new THREE.Quaternion(), S=new THREE.Vector3(); im.getMatrixAt(i,M); M.decompose(P,Q,S); return {x:P.x,y:P.y,z:P.z,yaw:new THREE.Euler().setFromQuaternion(Q,'YXZ').y,sx:S.x,sy:S.y,sz:S.z}; };
const deskSet=CLS.deskSet||(()=>null), furnModule=TB3.furnModule||(()=>null), CHAIR_FIT=TB3.CHAIR_FIT||1;   /* 修改前沒有這些：照樣跑完、逐項失敗 */
const angEq=(a,b)=>Math.abs(Math.atan2(Math.sin(a-b),Math.cos(a-b)))<0.01;
(async()=>{
  /* ---------- A：真正的 GLB ---------- */
  { const need=['study_table2','round_table','study_chair']; check('A furniture_study.glb 有遊戲要用的網格：'+need.join('、'),need.every(n=>names(FURN).includes(n)),names(FURN).join(','));
    const sets=['lset_write','lset_phone','lset_laptop','lset_book','lset_code']; check('A desk_props.glb 有講堂的五組＋各自的 _lod1',sets.every(n=>names(PROPS).includes(n)&&names(PROPS).includes(n+'_lod1')));
    const figs=names(FIGS).filter(n=>/^fig_/.test(n)); check('A 替身的每一種（'+figs.length+' 個網格）都配得到一組桌上小物（姿勢只有聽講、抄筆記、滑手機）',figs.length>0&&figs.every(n=>!!deskSet(n,0)),figs.filter(n=>!deskSet(n,0)).join(','));
    const P=positions(FURN,'study_chair'), c=P.filter(p=>Math.abs(p[0])<0.12&&Math.abs(p[2])<0.12&&p[1]>0.3&&p[1]<0.6), top=Math.max(...c.map(p=>p[1]));
    const z3top=0.46+0.025;   /* Z3.chair：椅面 0.05 厚、中心 0.46 */
    check('A 自習椅的椅面（GLB 中間那一圈頂點最高 '+top.toFixed(3)+' m）× 放大 '+CHAIR_FIT.toFixed(3)+'＝'+(top*CHAIR_FIT).toFixed(3)+' m，和程序化椅子的椅面 '+z3top+' m 差不到 5 mm（坐下的人不會浮起來、陷進去）',Math.abs(top*CHAIR_FIT-z3top)<0.005); }
  /* ---------- B：博雅大廳 ---------- */
  mode='fail'; const zF=loadZone('boya'); await tick(); await tick();
  const seatsF=JSON.stringify(zF.seats), itF=JSON.stringify(E.interactables.map(i=>[i.x,i.z,i.lv,i.label])), navF=zF.levels.map(n=>Array.from(n.b).join('')).join('|');
  const fbF=[]; zF.group.traverse(o=>{ if(o.name==='furniture_fallback') fbF.push(o); }); const glbF=[]; zF.group.traverse(o=>{ if(o.name==='furniture_glb') glbF.push(o); });
  check('B 載入失敗：程序化備用照樣顯示、沒有正式模組',fbF.length===1&&fbF.every(o=>o.visible)&&glbF.length===0&&!zF.furnGLB,JSON.stringify({fb:fbF.length,glb:glbF.length}));
  mode='ok'; const z=loadZone('boya'); await tick(); await tick();
  const L=BOYA_LAYOUT, study=L.groups.find(g=>g.id==='study'), round=L.groups.find(g=>g.id==='round');
  check('B 配置對得上模組：自習雙人桌 '+study.tables.length+' 張（整組轉 90°）、圓桌 '+round.tables.length+' 張',study.tables.every(t=>{ const m=furnModule(t); return m&&m.mod==='study_table2'&&Math.abs(m.ry-Math.PI/2)<1e-6; })&&round.tables.every(t=>{ const m=furnModule(t); return m&&m.mod==='round_table'; }));
  const gl=[]; z.group.traverse(o=>{ if(o.name==='furniture_glb') gl.push(o); }); const ims={}; for(const g of gl) for(const im of g.children) ims[im.name]=im;
  check('B 正式模組放進那一層：自習雙人桌、圓桌、椅子各一個 InstancedMesh',gl.length===1&&!!z.furnGLB&&['study_table2','round_table','study_chair'].every(n=>ims[n]&&ims[n].isInstancedMesh),Object.keys(ims).join(','));
  { const im=ims.study_table2||{count:-1}; const got=[]; for(let i=0;i<im.count;i++) got.push(decomp(im,i));
    check('B 自習雙人桌 '+study.tables.length+' 張：位置＝桌子中心、轉 90°、沒有縮放',im.count===study.tables.length&&study.tables.every(t=>got.some(p=>Math.abs(p.x-t.x)<1e-3&&Math.abs(p.z-t.z)<1e-3&&Math.abs(p.y)<1e-6&&angEq(p.yaw,Math.PI/2)&&Math.abs(p.sy-1)<1e-6))); }
  { const im=ims.round_table||{count:-1}; check('B 圓桌 '+round.tables.length+' 張：位置＝桌子中心',im.count===round.tables.length&&round.tables.every(t=>{ for(let i=0;i<im.count;i++){ const p=decomp(im,i); if(Math.abs(p.x-t.x)<1e-3&&Math.abs(p.z-t.z)<1e-3) return true; } return false; })); }
  /* 自習椅 10 m 外換 study_chair_lod1（PERF-PATROL-ECON-1025 ②）：椅子分在完整版、遠處版兩組，第一格更新才分；兩組合起來檢查（每個座位剛好一張）*/
  if(z.update&&ims.study_chair_lod1){ const cam=new THREE.PerspectiveCamera(); cam.position.set(0,3.4,11); E.camera=cam; z.update(1/30,E); }
  { const ims2=[ims.study_chair,ims.study_chair_lod1].filter(Boolean), want=[...study.tables,...round.tables].flatMap(t=>t.seats); const got=[]; for(const im of ims2) for(let i=0;i<im.count;i++) got.push(decomp(im,i));
    check('B 椅子 '+want.length+' 張（完整版＋遠處版 '+ims2.map(im=>im.count).join('＋')+'）：每個座位一張、位置＝座位、朝向＝座位 yaw（坐的人面向桌子）',got.length===want.length&&want.every(s=>got.filter(p=>Math.abs(p.x-s.x)<1e-3&&Math.abs(p.z-s.z)<1e-3&&angEq(p.yaw,s.yaw)).length===1));
    check('B 椅子垂直放大 '+CHAIR_FIT.toFixed(3)+'、水平不變',got.every(p=>Math.abs(p.sy-CHAIR_FIT)<1e-4&&Math.abs(p.sx-1)<1e-4&&Math.abs(p.sz-1)<1e-4)); }
  { const fb=[]; z.group.traverse(o=>{ if(o.name==='furniture_fallback') fb.push(o); }); const merged=fb[0]&&fb[0].children.filter(o=>o.name==='furniture');
    check('B 程序化備用（合成一個網格）藏起來',fb.length===1&&!fb[0].visible&&merged&&merged.length===1,JSON.stringify({n:fb.length,visible:fb[0]&&fb[0].visible})); }
  { const sofaSeats=z.seats.filter(s=>s.kind==='sofa'); check('B 沙發照舊（'+sofaSeats.length+' 個位子，不在換掉的那一組裡）',sofaSeats.length>0); }
  check('B 座位、互動點、導航和載入失敗時完全一樣（換的只是畫面）',JSON.stringify(z.seats)===seatsF&&JSON.stringify(E.interactables.map(i=>[i.x,i.z,i.lv,i.label]))===itF&&z.levels.map(n=>Array.from(n.b).join('')).join('|')===navF);
  /* ---------- C：階梯教室的長桌桌面 ---------- */
  { const r=L.rooms.find(q=>q.id==='101'); let fur=null; z.levelGroups[0].group.traverse(o=>{ if(!fur&&o.name==='furniture'&&o.parent&&o.parent.name==='lecture_furniture') fur=o; });   /* 2026-10-18 ART-EXT-TEACH：桌椅從備用模型群組 fallback0 搬到 furniture0（正式室內模型載入後藏起 fallback0，桌椅要留著）；量法不變。
       2026-10-30 BOYA-LM-1030：階梯教室的長桌、椅子再放進 furniture0 底下自己的 lecture_furniture（一間一組，正式模型有 SEATPANS 時整組藏起來）；第一組是 101 */
    /* 從桌子正上方往下打射線，第一個打到的就是桌面（同一排的椅子在桌子後面、下一排更後面）；合成的家具座標換回 fallback0 的座標（＝區域座標）*/
    const res=[]; if(fur){ z.group.updateMatrixWorld(true); const base=new THREE.Vector3().setFromMatrixPosition(fur.parent.matrixWorld), rc=new THREE.Raycaster();
      for(const q of r.rowsData){ const xs=[r.seatX0+0.6,(r.seatX0+r.seatX1)/2,r.seatX1-0.6];
        res.push(xs.map(x=>{ rc.set(new THREE.Vector3(x+base.x,base.y+q.y+2.0,q.deskZ+base.z),new THREE.Vector3(0,-1,0)); const h=rc.intersectObject(fur,true)[0]; return h?+(h.point.y-base.y-q.y).toFixed(3):null; })); } }
    check('C 101 每一排的長桌桌面在平台上 0.75 m（'+r.rowsData.length+' 排、每排三個點）',res.length===r.rowsData.length&&res.every(row=>row.every(v=>v!==null&&Math.abs(v-0.75)<0.003)),JSON.stringify(res)); }
  /* ---------- D：替身面前的桌上小物 ---------- */
  live.push({key:'c1:101',room:{room:'101'}}); CLS.syncRooms(GM,{instant:true}); await tick(); await tick(); await tick();
  { const grp=z.levelGroups[0].group.getObjectByName('seated_figures:c1:101'); const kids=grp?grp.children:[];
    const figs=[], desks=[]; for(const im of kids){ for(let i=0;i<im.count;i++){ const p=decomp(im,i); p.k=im.name; (/^desk:/.test(im.name)?desks:figs).push(p); } }
    check('D 替身 '+figs.length+' 個、桌上小物 '+desks.length+' 組（每個替身一組）',figs.length>0&&desks.length===figs.length);
    const same=(a,b)=>Math.abs(a.x-b.x)<1e-4&&Math.abs(a.y-b.y)<1e-4&&Math.abs(a.z-b.z)<1e-4&&angEq(a.yaw,b.yaw);
    const pair=figs.map(f=>({f,d:desks.filter(d=>same(d,f))}));
    check('D 每組桌上小物和替身同一個矩陣（位置、高度、朝向）',pair.every(p=>p.d.length===1));
    const poseOk=pair.every(({f,d})=>{ const set=d[0]&&d[0].k.replace(/^desk:/,'').replace(/_lod1$/,''); const pose=(f.k.match(/_(listen|write|phone)_/)||[])[1];
      return pose==='write'?set==='lset_write':(pose==='phone'?set==='lset_phone':['lset_laptop','lset_book','lset_code'].includes(set)); });
    check('D 照姿勢配：抄筆記→lset_write、滑手機→lset_phone（不配有手機的組）、聽講→筆電／書／六法',poseOk);
    check('D 遠近一致：替身用 _lod1 的，桌上小物也用 _lod1',pair.every(({f,d})=>/_lod1$/.test(f.k)===/_lod1$/.test(d[0].k)));
    const lk=new Set(pair.filter(({f})=>/_listen_/.test(f.k)).map(({d})=>d[0].k.replace(/^desk:/,'').replace(/_lod1$/,''))); check('D 聽講的人桌上不全都一樣（'+[...lk].join('、')+'）',lk.size>=2);
    CLS.figRemove(GM,'c1:101',true);
    check('D 下課（時間跳過）：替身和桌上小物一起拿掉',!grp.parent&&CLS.figState().length===0); }
  console.warn=quiet;
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
