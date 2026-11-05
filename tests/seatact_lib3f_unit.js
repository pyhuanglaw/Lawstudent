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
// 修改前（開發分支 60098d8ae）：A、B、C、D FAIL。
// 第二輪（SEATACT-LIB3F-R2，11-05：BB 在瀏覽器 0182c387a 量到 10 人裡 5 個 named 捧書、滑手機的 task null、寫筆記的 task write 卻「沒有在播」）——F 用真的人物（VRM）、
// 真的片段載入（ual_sit_tasks、hand_props 照遊戲的 ASSETS.loadOne 從檔案 lazy 讀；A～E 的 CHAR.sitTaskFit 是假的、什麼都合得上），2025-09-25（四）14:00 進三樓：
//   F1 有名字的五個人＝學姊（劇情）、陳助教、法律系同學 pool（作息 act read）：照設計不換姿勢、不套片段（seatact3d.js 開頭「有名字的人」），可是坐姿循環在跑、捧著書、會翻頁、抬頭
//   F2 做有片段的事、沒有片段的人：S.state 的 why 寫原因（滑手機那一位＝body:low：這個人的手比桌面低 3.9 cm，往上坐 1.5 cm 還差 2.4 cm）；照舊拿著手機、拇指在滑
//   F3 有片段的人：CHAR.sitTaskOf(n.obj) 在播、權重到 1；CHAR.sitTaskOf(n)（傳 NPC 那一筆，CC 的 cc_lib3f_sets_probe.py 這樣叫）一樣看得到——原本傳 n 一律 undefined＝每個人都量成沒有在播
// 修改前（lib3f-r2 的上一個 commit 7cbb97996）：F2、F3 FAIL。用法：node tests/seatact_lib3f_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
class FakeImg{ constructor(){ this._l={}; this.width=4; this.height=4; this.style={}; } addEventListener(t,f){ this._l[t]=f; } removeEventListener(){} set src(v){ this._src=v; setTimeout(()=>{ this._l.load&&this._l.load({}); },0); } get src(){ return this._src; } }   /* F：VRM 的貼圖一律當成 4×4 載入成功（tools/dev_scratch/spring_sim/harness.js 同一套）*/
const el=n=>n==='img'?new FakeImg():({getContext:()=>ctx2d,style:{},classList:{add(){},remove(){},toggle(){},contains:()=>false},addEventListener(){},appendChild(){},setAttribute(){},querySelector:()=>null,querySelectorAll:()=>[],width:1,height:1});
global.document={ createElementNS:(ns,n)=>el(n), createElement:el, getElementById:()=>null, querySelector:()=>null, querySelectorAll:()=>[], addEventListener(){}, body:el(), documentElement:el() };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:'',href:''};
global.localStorage={getItem:()=>null,setItem(){},removeItem(){}}; global.requestAnimationFrame=()=>0;
process.on('unhandledRejection',()=>{}); let DISK=false;   /* F：遊戲的 ASSETS.loadOne 從 repo 的檔案讀（A～E 照舊不讀檔）*/
global.fetch=u=>{ if(!DISK) return Promise.reject(new Error('no fetch in node')); const f=path.join(ROOT,String(u).split('?')[0]); if(!fs.existsSync(f)) return Promise.resolve({ok:false,status:404});
  const b=fs.readFileSync(f); return Promise.resolve({ok:true,status:200,body:null,arrayBuffer:()=>Promise.resolve(b.buffer.slice(b.byteOffset,b.byteOffset+b.length)),json:()=>Promise.resolve(JSON.parse(b.toString()))}); };
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
const REAL={setReadItem:CHAR.setReadItem,sitTaskFit:CHAR.sitTaskFit,setSitTask:CHAR.setSitTask,loadOne:ASSETS.loadOne};   /* F 用真的 */
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
  /* F：真的人物、真的片段（SEATACT-LIB3F-R2）*/
  { CHAR.setReadItem=REAL.setReadItem; CHAR.sitTaskFit=REAL.sitTaskFit; CHAR.setSitTask=REAL.setSitTask; ASSETS.loadOne=REAL.loadOne; DISK=true; CHAR._taskReset();   /* A～E 的假 loadOne 讓片段的 lazy 載入停在「下載中」：重來 */
    let s0=20261105; CHAR.ambRand=()=>{ s0=(s0*16807)%2147483647; return (s0-1)/2147483646; };   /* 小動作的亂數固定 */
    CHAR.anonPool.rot=0; CHAR.anonPool.cur=[];   /* 路人底模照「第一次進三樓」分（A～E 換過幾次區域，池子輪過）*/
    const G=mkG(dayOf('2025-09-25'),14); const z=build('library',G); await ASSETS.loadOne('bldg.library_3f_v2').catch(()=>{}); await wait(); z.group.updateMatrixWorld(true);
    const scene=new THREE.Scene(); const add0=E.addNPC; E.addNPC=n=>{ const m=add0(n); scene.add(n.obj); return m; };
    GM.spawnNPC=(id,spec,x,zz,o)=>{ o=o||{}; const ob=CHAR.build(spec); ob.position.set(x,0,zz); ob.rotation.y=o.yaw||0; const n=E.addNPC({obj:ob,id,name:spec.name||id,beh:o.beh||'idle',lv:o.lv|0}); if(o.seat) GM.sitAt(n,o.seat); if(o.pose){ n.pose=o.pose; n.idlePose=o.pose; } GM.npc[id]=n; return n; };
    GM.spawnCharacter=(id,x,zz,o)=>{ const c=CHARACTERS[id]; if(!c) return null; if(GM.npc[id]) return GM.npc[id]; const cs=c.char3d&&c.char3d.spec; let spec=cs&&typeof cs==='object'?Object.assign({},cs):Object.assign({},(typeof cs==='string'&&P3.CAST[cs])||STORY.extraSpec(7));   /* game3d.js spawnCharacter 的同一套（教授那一支用不到）*/
      spec.name=c.name; if(c.char3d&&c.char3d.model) spec.model=c.char3d.model; if(c.char3d&&c.char3d.height) spec.height=c.char3d.height; else if(c.height_cm) spec.height=c.height_cm/100; const n=GM.spawnNPC(id,spec,x,zz,o); n.charId=id; return n; };
    GM.removeNPC=()=>{}; GM.seatApproach=()=>null; GM.face=()=>{}; GM.npc={}; GM.extras=[]; G.flags.afternoonDone=true; G.visited={}; EVENTS.bind(GM); SOCIAL.bind(G);
    STORY.populate('library',GM); try{ CROWD.enter(GM,'library'); }catch(e){}
    const keys=new Set(['char.mixamo_clips','char.ual_sit_clips','char.npc_f1','char.npc_f2','char.npc_m1','char.npc_m2']);   /* 有名字、沒有自己模型的人（陳助教）用舊的四個樣本＋自己的顏色 */ for(const n of E.npcs){ const u=n.obj.userData, r=CHAR.resolveModel&&u.buildSpec&&CHAR.resolveModel(u.buildSpec); const k=u.wantModel||(r&&r.model); if(k&&ASSETS.manifest[k]) keys.add(k); }
    for(const k of keys) await ASSETS.loadOne(k).catch(()=>{});
    const DT=1/30, seen=new Map();
    for(let f=0;f<60*30;f++){ if(f%30===0){ for(const m of E.npcs) if(CHAR.needsUpgrade(m.obj)){ const nh=CHAR.upgrade(m.obj); if(nh){ scene.remove(m.obj); m.obj=nh; scene.add(nh); } } if(typeof POOL!=='undefined'&&POOL.afterSpawn) POOL.afterSpawn(GM); SA.tick(GM); await new Promise(r=>setTimeout(r,2)); }
      for(const n of E.npcs){ CHAR.animate(n.obj,DT,{pose:n.pose,speed:0}); const u=n.obj.userData, q=seen.get(n)||{turn:0,scroll:0}; q.turn=Math.max(q.turn,u.readTurn||0); q.scroll=Math.max(q.scroll,u.readScroll||0); seen.set(n,q); } scene.updateMatrixWorld(true); }
    const st=SA.state(), nOf=r=>E.npcs.find(m=>m.seat&&Math.abs(m.seat.x-r.x)<1e-6&&Math.abs(m.seat.z-r.z)<1e-6&&(m.lv|0)===r.lv);
    const L=st.list.map(r=>({r,n:nOf(r)})).filter(o=>o.n&&o.n.obj.userData.driver==='vrm');
    check('F0 真的人物：三樓坐著的人都換成 VRM、片段載得到（照遊戲的 lazy 載入）',L.length>=8&&L.length===st.n&&CHAR.sitTaskReady(),'VRM '+L.length+'/'+st.n+'、片段 '+CHAR.sitTaskReady());
    const named=L.filter(o=>o.r.named), nm=named.map(o=>o.n.id||o.n.name);
    const nOk=named.every(o=>{ const u=o.n.obj.userData; return o.r.act==='book'&&o.n.pose==='read'&&!o.r.task&&o.r.why===(SA.TASK[o.r.act]?'named':null)&&u.ambOn&&!!(u.readBook&&u.readBook.visible)&&(u.amb&&u.amb.n>=1); });
    check('F1 有名字的人（學姊、陳助教、法律系同學）照設計：捧書（read）、不套片段；坐姿循環在跑、60 秒裡至少做了一次小動作，有人翻頁',named.length>=4&&['sis','npc_ta_chen'].every(i=>nm.includes(i))&&nm.some(i=>/^pool_/.test(i))&&nOk&&named.some(o=>seen.get(o.n).turn>0.5),
      named.map(o=>(o.n.id||o.n.name)+' '+o.r.act+'/'+o.n.pose+' 小動作 '+(o.n.obj.userData.amb?o.n.obj.userData.amb.n:0)+' 翻頁 '+seen.get(o.n).turn.toFixed(2)).join('、'));
    const tk=L.filter(o=>!o.r.named&&SA.TASK[o.r.act]), off=tk.filter(o=>!o.r.task), on=tk.filter(o=>o.r.task);
    const ph=L.find(o=>!o.r.named&&o.r.act==='phone');
    check('F2 做有片段的事、卻沒有片段的人：S.state 寫原因（why）；滑手機的那一位照舊拿著手機（read、手上是手機）、拇指在滑',off.length>0&&off.every(o=>typeof o.r.why==='string'&&o.r.why.length>0)&&(!ph||ph.r.task||(/^body:/.test(ph.r.why||'')&&ph.n.pose==='read'&&ph.r.hold==='phone'&&!!(ph.n.obj.userData.readHeld&&ph.n.obj.userData.readHeld.phone&&ph.n.obj.userData.readHeld.phone.visible)&&seen.get(ph.n).scroll>0)),
      off.map(o=>o.r.act+'→'+(o.r.why||'沒寫原因')+'（'+o.n.obj.userData.key+'）').join('、')+(ph?'；滑手機 '+(ph.r.task?'片段 '+ph.r.clip:'pose '+ph.n.pose+'、手上 '+ph.r.hold+'、拇指 '+seen.get(ph.n).scroll.toFixed(2)):''));
    const ok3=on.length>0&&on.every(o=>{ const a=CHAR.sitTaskOf(o.n.obj), b=CHAR.sitTaskOf(o.n); return !!a&&a.playing===o.r.clip&&a.w>=0.95&&!!b&&b.playing===a.playing&&b.w===a.w; });
    check('F3 有片段的人在播（權重到 1）：CHAR.sitTaskOf(n.obj)、CHAR.sitTaskOf(n)（傳 NPC 那一筆）都看得到',ok3,
      on.map(o=>{ const a=CHAR.sitTaskOf(o.n.obj), b=CHAR.sitTaskOf(o.n); return o.r.act+' '+o.r.clip+'：obj '+(a?a.playing+' w'+(+a.w).toFixed(2):'沒有')+'、npc '+(b?b.playing:'沒有'); }).join('、'));
    DISK=false; }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
