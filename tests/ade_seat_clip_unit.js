// 阿德影印：長桌那三張電腦椅，坐著的人不穿進桌子（ADE-SEAT-CLIP-1105，LAWWW2-C 11-05；使用者 06:5x 截圖：線上 v9.10.20，中間長桌靠走道坐著的男生胸口、手臂卡進桌子）——不需要瀏覽器（D131）。
// 在 Node 載入遊戲的 three.js／three-vrm／CHAR、zones3d.js、SEATACT 和阿德影印的正式模型 ade.glb，建出真正的 wz_print 區域：
//   ① 配置：三張電腦椅（座位和椅子）往後 0.2 m（wz_shops_layout.js 最後那一段 chairShift）；第四張「沒推進去」的不動
//   ② 模型：椅子的 instancing 跟著挪（vc、vcm 兩組各 3 個）；舊的位置沒有椅子了
//   ③ SEATACT.probe 量到的桌緣（座位到桌子前緣）≥ 0.2 m（修改前 0.035 m）
//   ④ F／M／F2／M2 四種骨架（npc_f1、npc_m1、npc_nf10、npc_nm11）坐這三張、照 SEATACT 打電腦：身體、衣服的頂點穿過桌板（桌面往下 4.5 cm 那一層、桌子前緣以內）＝0；
//      同一套量法放在舊的位置（往前 0.2 m）要量得到穿模（> 20 點）——證明量法抓得到使用者看到的那個
// 修改前（開發分支 05ddf1e08）：① ② ③ FAIL，④ 舊位置 31～103 點、最深 16 cm。用法：node tests/ade_seat_clip_unit.js
const {preload,ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ const t=String(a[0]); if(/LOD|Missing|載入失敗/.test(t)) return; w0(...a); };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/zones3d.js']) run(f);
global.CROWD={SHOP_ZONES:{}}; run('src/seatact3d.js');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sleep=ms=>new Promise(r=>setTimeout(r,ms)), MAN=ASSETS.manifest, J=x=>JSON.stringify(x);
const put=k=>{ const m=MAN[k]; if(!m) return null; const f=path.join(ROOT,m.url); if(!fs.existsSync(f)) return null; window.ASSET_DATA[m.url]=fs.readFileSync(f).toString('base64'); return ASSETS.loadOne(k).catch(()=>null); };
const FROM=[[-0.07,2.6],[-0.07,0.85],[-0.07,0.25]];
(async()=>{
  const L=WZ_SHOPS_LAYOUT.print, near=(a,x,z,e)=>Math.abs(a.x-x)<(e||0.01)&&Math.abs(a.z-z)<(e||0.01);
  // ① 配置
  const cs=L.chairShift||[], seats=L.seats.filter(s=>s.kind==='chair');
  check('① 三張電腦椅的座位往後 0.2 m（x −0.27）、第四張（−0.2, −0.45）不動', cs.length===3&&FROM.every(([x,z])=>seats.some(s=>near(s,x-0.2,z)))&&seats.some(s=>near(s,-0.2,-0.45)), J(seats.map(s=>[s.x,s.z])));
  check('① 配置的椅子（items）跟著挪、和 chairShift 的 to 一樣', cs.length===3&&cs.every(c=>L.items.some(it=>it.kind==='chair'&&near(it,c.to[0],c.to[1],0.002))), J(cs));
  await preload(['char.npc_f1','char.npc_m1','char.npc_nf10','char.npc_nm11']);
  for(const k of ['char.ual_sit_clips','prop.desk_props','char.ual_sit_tasks','prop.hand_props']) await put(k);
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
  global.GAME={G:{zone:'wz_print',day:30,hour:15,flags:{},money:5000,weather:'clear',visited:{}}};
  window.ASSET_DATA[L.glb]=fs.readFileSync(path.join(ROOT,L.glb)).toString('base64');
  const z=Z3.ZONES.wz_print.build(E); E.zone=z; E.nav=z.nav; E.scene.add(z.group);
  for(let i=0;i<60&&z.chairShifted==null;i++) await sleep(100); z.group.updateMatrixWorld(true);
  // ② 模型
  const inst=[]; z.group.traverse(o=>{ if(o.isInstancedMesh&&/chair/.test((o.name||'')+' '+((o.parent&&o.parent.name)||''))){ const m=new THREE.Matrix4(), p=new THREE.Vector3(); for(let i=0;i<o.count;i++){ o.getMatrixAt(i,m); p.setFromMatrixPosition(m); inst.push([+p.x.toFixed(3),+p.z.toFixed(3)]); } } });
  check('② 模型裡的椅子 instance 挪了 6 個（vc、vcm 兩組 × 3 張）', z.chairShifted===6, 'chairShifted '+z.chairShifted);
  check('② 新的位置有椅子、舊的位置（x −0.07）沒有椅子', cs.every(c=>inst.filter(q=>Math.abs(q[0]-c.to[0])<0.01&&Math.abs(q[1]-c.to[1])<0.01).length===2)&&!inst.some(q=>Math.abs(q[0]+0.07)<0.01), J(inst));
  // ③ 桌緣
  const sts=z.seats.filter(s=>FROM.some(([x,zz])=>Math.abs(s.z-zz)<0.01&&Math.abs(s.x-(x-0.2))<0.01));
  const pr=sts.map(s=>SEATACT.probe(E,Object.assign({lv:0},s)));
  check('③ 三張的桌緣（SEATACT.probe）≥ 0.2 m', sts.length===3&&pr.every(p=>p&&p.edge>=0.2), pr.map(p=>p&&p.edge).join('、')+' m（修改前 0.035）');
  // ④ 穿模
  const top=pr[0]?pr[0].h:0.768, TB=[{x0:-0.04,x1:0.46,z0:1.2,z1:2.9},{x0:-0.04,x1:0.46,z0:-0.6,z1:1.1}];
  const inSlab=v=>TB.some(t=>v.x>t.x0+0.005&&v.x<t.x1&&v.z>t.z0&&v.z<t.z1)&&v.y>top-0.045&&v.y<top-0.002;
  const count=h=>{ let n=0, deep=0; const v=new THREE.Vector3(); h.updateMatrixWorld(true); h.traverse(o=>{ if(!o.isSkinnedMesh||!o.visible) return; const P=o.geometry.attributes.position; for(let i=0;i<P.count;i+=2){ o.getVertexPosition(i,v); o.localToWorld(v); if(inSlab(v)){ n++; deep=Math.max(deep,v.x+0.04); } } }); return {n,deep:+deep.toFixed(3)}; };
  const scene=E.scene, DT=1/30; SEATACT.actAt=()=>'type';
  const sitAt=async(key,st)=>{ const h=CHAR.build({model:key,height:MAN[key].height||1.7}); h.position.set(st.x,0,st.z); h.rotation.y=st.yaw; scene.add(h);
    const n={obj:h,seat:st,pose:'sit',idlePose:'sit',isExtra:true,name:'',lv:0,frozen:true}, GM={E:{zone:Object.assign({},z,{seats:[st]}),npcs:[n],player:{obj:{position:new THREE.Vector3(3,0,3)}},scene},G:{zone:'wz_print',day:7}};
    for(let f=0;f<60;f++){ if(f%30===0){ SEATACT.tick(GM); await sleep(1); } CHAR.animate(h,DT,{pose:'sit',speed:0}); scene.updateMatrixWorld(true); }
    const r=count(h); SEATACT.clear(); scene.remove(h); if(CHAR.release) CHAR.release(h); return r; };
  for(const [key,lab] of [['char.npc_f1','F'],['char.npc_m1','M'],['char.npc_nf10','F2'],['char.npc_nm11','M2']]){ const now=[], old=[];
    for(const s of sts){ const st={x:s.x,z:s.z,yaw:s.yaw,lv:0}; now.push(await sitAt(key,st)); old.push(await sitAt(key,Object.assign({},st,{x:s.x+0.2}))); }
    check(`④ ${lab}（${key}）坐三張電腦椅：穿過桌板的頂點 0`, now.every(r=>r.n===0), now.map(r=>r.n+' 點').join('、'));
    check(`④ ${lab}：同一套量法放在舊的位置量得到穿模（> 20 點）`, old.every(r=>r.n>20), old.map(r=>r.n+' 點、深 '+r.deep+' m').join('；')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
