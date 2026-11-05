// 總圖 3F 閱覽區坐著的人在做事（SEATACT；任務 SEATACT-LIB3F-1105；BB-C 11-05 判定 P2 要修：「總圖三樓 7 個坐著的人 76 秒都沒有動」）——不需要瀏覽器。
// CC 查 SEATACT.state()：7 個人全部 act 'book*'（有名字的人：手上捧書、沒有做事的片段）、set null。原因三個：
//   ① 一起坐的系上同學（crowd3d.js AA_495 的 deptSit：isExtra、name＝「歷史系的學生」、dept）被 named() 當成有名字的人＝照劇情不動、永遠是捧書
//   ② story3d.js 3F 的三個背景人物（座位 5、11、14）沒有 seat：SEATACT 看不到他們
//   ③ 正式模型（library_3f_v2.glb，6 萬個三角形）的牆會淡出（engine3d.js hideFaded 把整面藏起來）：鏡頭一動網格清單就變、桌子的索引整個重算＝走動時桌上一直沒有東西；
//      幀很慢（雲端 1～4 fps）每 30 格只算 6 毫秒，要好幾分鐘（B1 雲端 30 秒還是 set null）
//   A  一起坐的系上同學＝路人（照座位表做事、不是 named）；館員（有自己名字、沒有系）、學姊（id）照舊是有名字的人
//   B  STORY.populate('library')＋CROWD.enter：坐著的路人都有配（含座位 5、11、14 那三個）；正式模型的桌子找得到（set）；有人在做有片段的事、桌上有那一件（S.TASK_NEED），套上片段
//   C  正式模型的牆淡出／出現（鏡頭動）：網格清單的簽名不變、索引不重算
//   D  幀很慢的時候一次多算一點（S.indexBudget）：30～60 fps 照舊 6 毫秒、2 fps 到上限
//   E  總圖 B1（library_b1.glb）：一樣找得到桌子、有人在做事
// 修改前（開發分支 60098d8ae）：A、B、C、D FAIL。用法：node tests/seatact_lib3f_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
const el=()=>({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:el, createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node'));
const HTML=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), SRCS=[...HTML.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]);
const loadErr=[]; for(const f of SRCS){ try{ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,120)); } }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
console.warn=()=>{};
check('0 照 index.html 的順序載入每一個檔都沒有錯',!loadErr.length,loadErr.slice(0,3).join('；'));
const SA=typeof SEATACT!=='undefined'?SEATACT:null;
check('0 有 SEATACT（src/seatact3d.js）',!!SA);
/* ---- A：真正的 GLB ---- */
function glbNames(rel){ const b=fs.readFileSync(path.join(ROOT,rel)); let off=12, js=null; while(off<b.length){ const ln=b.readUInt32LE(off), ty=b.readUInt32LE(off+4), ch=b.subarray(off+8,off+8+ln); off+=8+ln; if(ty===0x4E4F534A) js=JSON.parse(ch.toString('utf8')); } return js.meshes.map(m=>m.name); }
const NAMES=glbNames('assets/models/env/second_ai/desk_props.glb');
/* 假的模型：名稱和真的 GLB 一樣（Node 裡不解貼圖）*/
const fake=new THREE.Group(); for(const n of NAMES){ const m=new THREE.Mesh(new THREE.BoxGeometry(0.05,0.01,0.05),new THREE.MeshBasicMaterial()); m.name=n; fake.add(m); }
const readItem=new Map(); CHAR.setReadItem=(o,k)=>{ readItem.set(o,k); return true; };   /* 人物不建 VRM：記下手上換成什麼 */
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const wait=()=>new Promise(r=>setTimeout(r,0));
const dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/86400000)+1; };
const DAY=dayOf('2025-10-15');
let GM=null;
function build(id,G){ GAME.G=G; G.zone=id; G.weekday=CALENDAR.dateOf(G.day).wd%7; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(z.spawn.x,0,z.spawn.z),rotation:{y:0}},lv:0,radius:0.32,seat:null};
  E.addNPC=n=>{ n.path=null; n.speed=0; n.pose=n.pose||'idle'; n.radius=0.32; n.lv=n.lv|0; E.npcs.push(n); return n; }; E.removeNPC=n=>{ E.npcs=E.npcs.filter(m=>m!==n); };
  GM={G,E,hourRate:1/150,npc:{},sitAt:(n,st)=>{ n.seat=st; n.pose='sit'; n.idlePose='sit'; n.frozen=true; n.path=null; n.obj.position.set(st.x,(st.lift||0),st.z); n.obj.rotation.y=st.yaw||0; }}; return z; }
const sitAll=(z,o)=>{ const out=[]; for(const st of (z.seats||[])){ const ob=new THREE.Group(); ob.userData={}; out.push(E.addNPC(Object.assign({obj:ob,name:'',beh:'idle',isExtra:true,pose:'read',idlePose:'read',frozen:true,seat:st,lv:st.lv|0},o||{}))); } return out; };
const run=async()=>{ SA.tick(GM); await wait(); for(let i=0;i<400&&SA.indexing&&SA.indexing();i++) SA.tick(GM); SA.tick(GM); SA.tick(GM); };   /* 桌子的索引分段算（每 30 格最多 S.INDEX_MS 毫秒）：跑到算完 */
const mkG=(d,h)=>({day:d,hour:h,flags:{},stage:'law'});
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=J.accessors[i], v=J.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
    const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(J.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial(); t.name=m.name||''; return t; });
  const objs=J.nodes.map(nd=>{ let o;
    if(nd.mesh!=null&&!(nd.extensions&&nd.extensions.EXT_mesh_gpu_instancing)){ const prs=J.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
        return new THREE.Mesh(g,pr.material!=null?mats[pr.material]:new THREE.MeshStandardMaterial()); });
      if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
    else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  J.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
  const sc=new THREE.Group(); for(const r of J.scenes[J.scene||0].nodes) sc.add(objs[r]); return sc; }
/* 正式模型（自己讀 GLB：tests/dorm_seethru_unit.js 同一套；EXT_mesh_gpu_instancing 的椅子、燈不建）*/
ASSETS.loadOne=k=>k==='prop.desk_props'?Promise.resolve({scene:fake}):(GLB[k]?(PEND[k]=Promise.resolve({scene:GLB[k]})):new Promise(()=>{}));
const GLB={}, PEND={}; const glb=(k)=>{ const u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOT,u))) GLB[k]=glbScene(path.join(ROOT,u)); return !!GLB[k]; };
const tasks=new Map(); CHAR.sitTaskFit=(o,kind)=>({kind,clip:'Sit_'+kind,shift:0,prop:null}); CHAR.setSitTask=(o,f)=>{ tasks.set(o,f); return true; };   /* 片段、骨架不在 Node：合得上的都說合得上，記下套了什麼 */
const pick=(st,n)=>st.list.find(r=>Math.abs(r.x-n.seat.x)<1e-6&&Math.abs(r.z-n.seat.z)<1e-6&&r.lv===(n.seat.lv|0));
async function enterZone(id,key,hour){ if(key) glb(key); const z=build(id,mkG(DAY,hour)); if(PEND[key]){ await PEND[key]; await wait(); z.group.updateMatrixWorld(true); } return z; }
(async()=>{
  if(!SA){ console.log('FAILED（沒有 SEATACT）'); process.exit(1); }
  /* A */
  { const z=await enterZone('library',null,14); const mk=(o)=>{ const ob=new THREE.Group(); ob.userData={}; return E.addNPC(Object.assign({obj:ob,beh:'idle',isExtra:true,pose:'read',idlePose:'read',frozen:true},o)); };
    const st0=z.seats; const dept=[20,21,22,23].map(i=>mk({name:'歷史系的學生',dept:'歷史',deptSeat:true,seat:st0[i],lv:0})); const crew=mk({name:'館員',seat:st0[30],lv:0}); const sis=mk({id:'sis',name:'溫學姊',isExtra:false,seat:st0[2],lv:0});
    await run(); const st=SA.state(); const rd=dept.map(n=>pick(st,n)), rc=pick(st,crew), rs=pick(st,sis);
    check('A 一起坐的系上同學（name「歷史系的學生」＋dept）是路人：照座位表做事；館員、學姊照舊是有名字的人',rd.every(r=>r&&!r.named)&&new Set(rd.map(r=>r.act)).size>=2&&!!rc&&rc.named&&!!rs&&rs.named,
      '系上同學 '+rd.map(r=>r?(r.named?'named/':'')+r.act:'沒配').join('、')+'；館員 '+(rc?(rc.named?'named/':'')+rc.act:'沒配')+'；學姊 '+(rs?(rs.named?'named/':'')+rs.act:'沒配')); }
  /* B、C：真的進總圖 3F（正式模型）、真的放人 */
  { const z=await enterZone('library','bldg.library_3f_v2',14); check('B0 總圖 3F 正式模型接上了（library_3f_v2.glb）',z.formal===true&&(z.walls||[]).length>=4,'formal '+z.formal+'、牆 '+(z.walls||[]).length);
    GM.spawnNPC=(cid,spec,x,zz,o)=>{ const ob=new THREE.Group(); ob.userData={}; const n=E.addNPC(Object.assign({obj:ob,id:cid,name:spec&&spec.name||cid,beh:'idle'},o||{})); GM.npc[cid]=n; return n; }; GM.removeNPC=()=>{};
    tasks.clear(); STORY.populate('library',GM); try{ CROWD.enter(GM,'library'); }catch(e){}
    const story3=[5,11,14].map(i=>z.seats[i]); const seatedX=E.npcs.filter(n=>n.isExtra&&!n.id&&(n.pose==='read'||n.pose==='sit')&&n.frozen);
    await run(); const st=SA.state(); const recs=seatedX.map(n=>n.seat?pick(st,n):null);
    const s3=story3.map(s=>st.list.find(r=>Math.abs(r.x-s.x)<1e-6&&Math.abs(r.z-s.z)<1e-6));
    check('B 坐著的路人都有配、都不是 named（含 story3d.js 座位 5、11、14 那三個背景人物）',seatedX.length>=3&&recs.every(r=>r&&!r.named)&&s3.every(r=>r&&!r.named),
      '坐著的路人 '+seatedX.length+'：'+recs.map(r=>r?(r.named?'named/':'')+r.act:'沒配').join('、')+'；座位 5／11／14：'+s3.map(r=>r?r.act:'沒配').join('、'));
    const withSet=recs.filter(r=>r&&r.set), anon=recs.filter(r=>r&&!r.named);
    check('B 正式模型的桌子找得到：桌上有一組',anon.length>0&&withSet.length===anon.length,'有一組 '+withSet.length+'/'+anon.length+'（'+withSet.map(r=>r.set).join('、')+'）');
    const tk=recs.filter(r=>r&&SA.TASK[r.act]); const played=tk.filter(r=>r.task);
    check('B 做有片段的事（筆電、筆記、桌上的書、滑手機）的人套上片段（桌上有那一件：S.TASK_NEED）',tk.length>0&&played.length===tk.length,'片段 '+played.length+'/'+tk.length+'（'+tk.map(r=>r.act+'→'+(r.task||'沒有')).join('、')+'）；全部 '+recs.map(r=>r&&r.act).join('、'));
    /* C：牆淡出（hideFaded：visible=false）、出現 */
    const I0=SA.indexStat(z), sig0=SA.meshSig(z); const ttl=SA.MESH_TTL; SA.MESH_TTL=0; const W=z.walls; let restarted=0, changed=0;
    for(let k=0;k<4;k++){ W.forEach((w,i)=>{ w.visible=(i+k)%2===0; }); if(SA.meshSig(z)!==sig0) changed++; SA.tick(GM); if(SA.indexing()) restarted++; }
    W.forEach(w=>{ w.visible=true; }); SA.tick(GM); SA.MESH_TTL=ttl;
    check('C 牆淡出／出現（鏡頭動）：網格清單的簽名不變、桌子的索引不重算',changed===0&&restarted===0,'簽名變了 '+changed+' 次、索引重算 '+restarted+' 次（'+I0.tris+' 個三角形）'); }
  /* D */
  { const ok=typeof SA.indexBudget==='function'; const b=g=>ok?SA.indexBudget(g):null;
    check('D 幀很慢時一次多算一點：60 fps（30 格 0.5 秒）、30 fps＝S.INDEX_MS；10 fps 多一點；2 fps 到上限 S.INDEX_MAX',ok&&b(500)===SA.INDEX_MS&&b(1000)===SA.INDEX_MS&&b(3000)>SA.INDEX_MS&&b(15000)===SA.INDEX_MAX&&b(0)===SA.INDEX_MS,
      ok?[500,1000,3000,15000].map(g=>g+'ms→'+b(g).toFixed(1)).join('、'):'沒有 S.indexBudget'); }
  /* E：B1（遊戲裡放人的那一套：LB1.populate，24 小時自習室的座位）*/
  { const z=await enterZone('library_b1','bldg.library_b1',14); tasks.clear(); const k=LB1.populate(GM,true); const ppl=E.npcs.filter(n=>n.b1Seat!=null&&n.seat); await run(); const st=SA.state(); const recs=ppl.map(n=>pick(st,n)).filter(Boolean);
    const tk=recs.filter(r=>SA.TASK[r.act]);
    check('E 總圖 B1（正式模型 '+(z.formal?'接上了':'沒接上')+'）：LB1 放的人都有配、桌上都有一組、做有片段的事的人都套上片段',z.formal===true&&ppl.length>=3&&recs.length===ppl.length&&recs.every(r=>r.set&&!r.named)&&tk.length>0&&tk.every(r=>r.task),
      recs.length+'/'+ppl.length+' 人、有一組 '+recs.filter(r=>r.set).length+'、片段 '+tk.filter(r=>r.task).length+'/'+tk.length+'（'+recs.map(r=>r.act+'→'+(r.task||'-')).join('、')+'）'); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
