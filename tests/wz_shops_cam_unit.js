// 溫州街店家室內的鏡頭遮擋（LAWWW2 2026-10-22 鏡頭遮擋盤點）——不需要瀏覽器。
// 盤點（跟隨鏡頭 camDist 4、俯角 0.38，每 0.5 m 一點、8 個方向，看人身上 12 個點被不會淡出的網格擋住多少）：
//   一盞茶屋 29% 的方向擋住一成以上：鏡頭退到和室紙拉門、襖的另一邊（隔間沒有鏡頭牆）；正面的紙拉門、格子門、柱子、簷口不在會淡出的那一組（從玄關走進來，鏡頭在前院上方）；
//   半熟：從門口那一側看坐在左牆桌子的人，前一張桌子的吊燈擋住臉。
// 改法：
//   src/zones3d.js wzShop：配置的 camWalls [x, z, 寬, 深] → zone.camCols（和教學館、宿舍、美國公寓同一套；比天花板高 2 m）；配置的 seeThru（材質名字）→ 網點透空。
//   一盞：camWalls＝和室前面那一排紙拉門（z −0.6）＋兩間和室中間的襖（x 0）；seeThru＝和紙燈籠、吊線、前院樟樹的樹幹。半熟：seeThru＝吊燈、保溫燈（燈罩、吊線、燈泡）。
//   正式模型（tools/blender/env_second/wz_shops_interior.py）：一盞正面那一排、簷下的柱子、簷口歸 WALL_engawa；隔間兩端的柱子歸左右牆、床柱歸後牆；吊燈和保溫燈用自己的材質 wzs_pendant。
// 這裡在 Node 建出遊戲真正的一盞：鏡頭照引擎的 followCam 算；隔間照配置的 items（shoji_wall、fusuma）自己算，不是拿 camWalls 來量。
// 用法：node tests/wz_shops_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
  'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.ray=E.ray||new THREE.Raycaster();
let FAKE=null, pend=[]; ASSETS.loadOne=k=>{ if(FAKE&&FAKE[k]){ const g=new THREE.Group(); for(const nm of FAKE[k]){ const me=new THREE.Mesh(new THREE.BoxGeometry(0.1,0.1,0.1),new THREE.MeshStandardMaterial({name:nm})); me.name=nm; g.add(me); } const p=Promise.resolve({scene:g}); pend.push(p); return p; } return new Promise(()=>{}); };
function loadZone(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); z.def=Z3.ZONES[id]; E.zone=z; E.levels=z.levels||null; E.nav=z.nav;
  E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; z.group.updateMatrixWorld(true); return z; }
/* 讀 GLB：每個網格節點（沒有自己的位移、旋轉的：模型裡只有前院的樟樹有）的頂點、材質名字 */
function glb(rel){ const b=fs.readFileSync(path.join(ROOT,rel)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), off=20+n, bin=b.slice(off+8,off+8+b.readUInt32LE(off));
  const out=[]; for(const nd of j.nodes){ if(nd.mesh==null) continue; const trs=!!(nd.translation||nd.rotation||nd.scale||nd.matrix);
    for(const pr of j.meshes[nd.mesh].primitives){ const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12, P=[];
      for(let k=0;k<a.count;k++) P.push([bin.readFloatLE(o+k*st),bin.readFloatLE(o+k*st+4),bin.readFloatLE(o+k*st+8)]);
      out.push({name:nd.name||'',mat:pr.material!=null?j.materials[pr.material].name:'',pos:P,trs}); } }
  return {nodes:out,mats:(j.materials||[]).map(m=>m.name)}; }
const PI=Math.PI, PITCH=0.38;
(async()=>{
  check('有一盞、半熟（WZ_SHOPS_LAYOUT）、E.followCam、E.patchSeeThrough',!!Z3.ZONES.wz_teahouse&&!!Z3.ZONES.wz_brunch&&typeof E.followCam==='function'&&typeof E.patchSeeThrough==='function');
  // ---- 1. 一盞：鏡頭不會退到紙拉門、襖的另一邊 ----
  { const L=WZ_SHOPS_LAYOUT.teahouse, z=loadZone('wz_teahouse'), dist=Z3.ZONES.wz_teahouse.camDist||4.0, H=L.h;
    const sh=L.items.find(i=>i.kind==='shoji_wall'), fu=L.items.find(i=>i.kind==='fusuma');
    /* 隔間（照配置的 items）：紙拉門那一排 z＝sh.z、x0～x1；襖 x＝fu.x、z 在 fu.z±d/2；高到天花板 H */
    const parts=[{axis:'z',v:sh.z,a0:sh.x0,a1:sh.x1,name:'紙拉門那一排'},{axis:'x',v:fu.x,a0:fu.z-fu.d/2,a1:fu.z+fu.d/2,name:'兩間和室中間的襖'}];
    const crossPart=(p,q)=>{ for(const s of parts){ const pa=s.axis==='z'?p.z:p.x, qa=s.axis==='z'?q.z:q.x; if((pa-s.v)*(qa-s.v)>=0) continue; const t=(s.v-pa)/(qa-pa);
        const y=p.y+(q.y-p.y)*t, c=s.axis==='z'?p.x+(q.x-p.x)*t:p.z+(q.z-p.z)*t; if(y<=H&&c>=s.a0&&c<=s.a1) return s.name; } return null; };
    check('一盞：鏡頭牆（zone.camCols[0]）有兩塊',Array.isArray(z.camCols)&&z.camCols[0]&&z.camCols[0].length===2,z.camCols&&z.camCols[0]?z.camCols[0].length+' 塊':'沒有');
    let n=0, bad=0, badOld=0, ex=null, exOld=null, inRooms=0;
    const old=(tgt,yaw)=>new THREE.Vector3(Math.sin(yaw)*dist*Math.cos(PITCH),Math.sin(PITCH)*dist+0.2,Math.cos(yaw)*dist*Math.cos(PITCH)).add(tgt);
    for(let x=-L.w/2+0.5;x<=L.w/2-0.5;x+=0.5) for(let zz=-4.5;zz<=4.5;zz+=0.5){ if(!E.canStand(x,zz,0.32,0)) continue; if(zz<sh.z) inRooms++;
      for(let k=0;k<8;k++){ const yaw=k*PI/4, tgt=new THREE.Vector3(x,1.45,zz), body=new THREE.Vector3(x,0.9,zz); n++;
        const co=old(tgt,yaw); if(crossPart(co,tgt)||crossPart(co,body)){ badOld++; if(!exOld) exOld={x,z:zz,k}; }
        const cam=new THREE.Vector3(); E.followCam(tgt,yaw,PITCH,dist,0,cam); const w=crossPart(cam,tgt)||crossPart(cam,body); if(w){ bad++; if(!ex) ex={x,z:zz,k,w,cam:cam.toArray().map(v=>+v.toFixed(2))}; } } }
    check('一盞：取樣有走到和室裡面（紙拉門後面）',inRooms>10,inRooms+' 點');
    check('一盞：修改前的鏡頭（沒有鏡頭牆）量得到被隔間擋住的方向（測試抓得到這個問題）',badOld>0,`${(100*badOld/Math.max(1,n)).toFixed(1)}%（${badOld}/${n}）`+(exOld?' 例 '+JSON.stringify(exOld):''));
    check('一盞：鏡頭到人的頭、腰的線不會穿過紙拉門、襖',bad===0,`${(100*bad/Math.max(1,n)).toFixed(1)}%（${bad}/${n}）`+(ex?' 例 '+JSON.stringify(ex):''));
    /* 坐在和室的坐墊上：鏡頭在人的前面、後面都一樣 */
    const sb=L.seats.filter(s=>s.kind==='floor'&&s.z<sh.z).filter(s=>[0,4].some(k=>{ const tgt=new THREE.Vector3(s.x,1.45,s.z), cam=new THREE.Vector3(); E.followCam(tgt,k*PI/4,PITCH,dist,0,cam); return !!crossPart(cam,new THREE.Vector3(s.x,1.0,s.z)); }));
    check('一盞：和室的坐墊坐下，鏡頭在前、在後都看得到人',L.seats.some(s=>s.kind==='floor'&&s.z<sh.z)&&!sb.length,sb.map(s=>'('+s.x+','+s.z+')').join('、')); }
  // ---- 2. 網點透空：配置的材質接上正式模型以後標 seeThrough、patch 過 shader；區域打開 seeThru ----
  for(const [key,others] of [['teahouse',['wzs_post','wzs_shoji','wzs_black_metal']],['brunch',['wzs_black_metal','wzs_steel','wzs_wood_light']]]){
    const L=WZ_SHOPS_LAYOUT[key], want=L.seeThru||[]; FAKE={['bldg.wz_'+key+'_interior']:want.concat(others)}; pend=[];
    const z=loadZone('wz_'+key); await Promise.all(pend); await new Promise(r=>setTimeout(r,0));
    const mats={}; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.name) mats[o.material.name]=o.material; });
    check(L.name+'：區域打開 seeThru',z.seeThru===true);
    check(L.name+'：'+want.join('、')+' 標了 seeThrough、patch 過 shader',want.length>0&&want.every(nm=>mats[nm]&&mats[nm].userData.seeThrough&&mats[nm].userData._st));
    check(L.name+'：其他材質不透空（'+others.join('、')+'）',others.every(nm=>mats[nm]&&!mats[nm].userData.seeThrough));
    const G=glb(L.glb); check(L.name+'：配置的網點透空材質都在正式模型裡',want.every(nm=>G.mats.includes(nm)),want.filter(nm=>!G.mats.includes(nm)).join('、')); }
  FAKE=null;
  // ---- 3. 正式模型：一盞正面那一排、簷下的柱子、簷口在會淡出的組；吊燈有自己的材質 ----
  { const L=WZ_SHOPS_LAYOUT.teahouse, G=glb(L.glb), Z1=5.0, H=L.h, hw=L.w/2;
    /* 從前院往屋裡看會擋在人前面的地方（房子的寬度裡）：正面那一排 z 5±0.07、簷下的柱子 z 6.15±0.1（高 1～H），簷口 z 6.9（2.3 m 以上）。
       天花板、屋簷下的板是朝下的單面（從上面看不到）；玄關的鞋櫃 0.85 m、院子兩側的竹籬（x ±4.5）不算 */
    const win=p=>Math.abs(p[0])<hw-0.05&&(((Math.abs(p[2]-Z1)<0.07||Math.abs(p[2]-(Z1+1.15))<0.1)&&p[1]>1.0&&p[1]<H-0.05)||(Math.abs(p[2]-(Z1+1.9))<0.05&&p[1]>2.3&&p[1]<H+0.1));
    const stay=G.nodes.filter(nd=>!nd.trs&&!/^WALL_/.test(nd.name)&&nd.mat!=='wzs_ceiling_boards'&&nd.pos.some(win));   /* 天花板、屋簷下的板（wzs_ceiling_boards）是朝下的單面 */
    check('一盞：正面那一排、簷下的柱子、簷口都在會淡出的組（WALL_engawa）',!stay.length,stay.map(nd=>nd.name+'/'+nd.mat).join('、'));
    const eng=G.nodes.filter(nd=>/^WALL_engawa_/.test(nd.name)).map(nd=>nd.mat);
    check('一盞：WALL_engawa 有柱子、紙拉門、簷口',['wzs_post','wzs_shoji','wzs_ceiling_batten'].every(m=>eng.includes(m)),eng.join('、'));
    const tk=L.items.find(i=>i.kind==='tokonoma'), px=tk.x+tk.w/2;
    const tkp=G.nodes.filter(nd=>!nd.trs&&!/^WALL_/.test(nd.name)&&nd.mat==='wzs_post'&&nd.pos.some(p=>Math.abs(p[0]-px)<0.07&&p[1]>1.5&&p[2]<tk.z-tk.d/2+0.13));
    check('一盞：床柱歸後牆的組',!tkp.length,tkp.map(nd=>nd.name).join('、'));
    for(const k of ['brunch','teahouse']){ const g=glb(WZ_SHOPS_LAYOUT[k].glb); check(WZ_SHOPS_LAYOUT[k].name+'：吊燈有自己的材質 wzs_pendant',g.mats.includes('wzs_pendant')); } }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
