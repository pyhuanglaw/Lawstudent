/* TAP-RAY-SEAT-1111（LAWWW 11-11 10:56 派給 LAWWW2）：點畫面判椅子——用遊戲真正的區域＋正式模型（GLB，Node 裡解析、不載貼圖）打射線。
   src/game3d.js tapToSeat：畫面上那一點射線第一個打到的東西（engine3d.js E.rayFirstHit）比地板那一點近、落在某張椅子的範圍裡，才導去那張椅子。
   取代 0d7922555 的「射線在離地 0.3～0.75 m 那段離椅中心 0.32 m 內」：BB TSR（擋發布）——俯角淺時點遠處走道，射線擦過前面的椅子也被算成點到。
     1 BB 的四個走道點（總圖大廳二樓 (−8.5,5)、(−11,6.5)；宿舍 (11.5,3)；Café (1.5,−0.5)）：從「射線會穿過舊做法那一段（離椅子 0.32 m 內、離地 0.3～0.75 m）」的鏡頭點下去，
       畫面上那一點看得到地板（射線先打到地板）的，一律照舊走過去（null）；而且舊做法在這些點會被帶去椅子（這支抓得到 BB 那一種）
     2 五湖四海（l118_home）#9 (0.5,−0.9)：八個方向、俯角 0.35／0.5 點椅子——射線先打到 #9 的都導去 #9（只看地板那一點的做法：落點在椅子後面、站得住＝走過去）
     3 118 巷九間每一張椅子：遊戲那種鏡頭（離 3.2～4.6 m、俯角 0.3～0.7、八個方向）點椅面中心——射線第一個打到的東西落在哪張椅子的範圍裡，就導去哪一張（射線先打到哪張就是哪張）；
       列出舊做法挑到別張的次數（BB 回報 118 巷點了選錯椅子）
     4 地板那一點本來就在椅子上（站不住）：沒有射線打到椅子時照舊導去最近那張（舊行為）
   這是模擬（Node、three 的 Raycaster、遊戲的牆淡出照 z.fadeWalls），不是瀏覽器裡點（D131）；瀏覽器驗證排 CC。用法：node tests/tap_seat_ray_real_1111_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){}, querySelector:()=>null, querySelectorAll:()=>[], body:{appendChild(){},classList:{add(){},remove(){}}} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{}; console.error=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="([^"?]+)/g)].map(m=>m[1]);
const files=[]; for(const f of all){ if(/three-vrm|character3d|props3d/.test(f)) continue; files.push(f); if(/l118_shops3d\.js$/.test(f)) break; }
for(const f of files){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; }; const J=JSON.stringify;
// 正式模型：GLB 在 Node 裡解析（貼圖拿掉；和 tests/us_club_lounge_unit.js 同一個做法）
function parseGLB(file){ const b=fs.readFileSync(file); const n=b.readUInt32LE(12); const Jn=JSON.parse(b.slice(20,20+n).toString()); const binLen=b.readUInt32LE(20+n); const bin=b.slice(20+n+8,20+n+8+binLen);
  for(const m of Jn.materials||[]){ const p=m.pbrMetallicRoughness||{}; for(const k of ['baseColorTexture','metallicRoughnessTexture']) delete p[k]; for(const k of ['normalTexture','occlusionTexture','emissiveTexture']) delete m[k]; if(m.extensions) for(const k of Object.keys(m.extensions)) if(/texture/i.test(J(m.extensions[k]))) delete m.extensions[k]; }
  delete Jn.textures; delete Jn.images; delete Jn.samplers; delete Jn.extensionsRequired; if(Jn.extensionsUsed) Jn.extensionsUsed=Jn.extensionsUsed.filter(e=>!/texture|KTX|webp/i.test(e));
  const js=Buffer.from(JSON.stringify(Jn)); const jb=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]); const bb=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);
  const h=Buffer.alloc(12); h.write('glTF',0); h.writeUInt32LE(2,4); h.writeUInt32LE(12+8+jb.length+8+bb.length,8); const c1=Buffer.alloc(8); c1.writeUInt32LE(jb.length,0); c1.write('JSON',4); const c2=Buffer.alloc(8); c2.writeUInt32LE(bb.length,0); c2.writeUInt32LE(0x004E4942,4);
  const out=Buffer.concat([h,c1,jb,c2,bb]); return new Promise((res,rej)=>new THREE_JSM.GLTFLoader.GLTFLoader().parse(out.buffer.slice(out.byteOffset,out.byteOffset+out.length),'',g=>res(g),rej)); }
const glbCache={}; ASSETS.loadOne=k=>{ const m=ASSETS.manifest[k]; if(!m||!/\.glb$/.test(m.url||'')||!fs.existsSync(path.join(ROOT,m.url))) return new Promise(()=>{}); if(!glbCache[k]) glbCache[k]=parseGLB(path.join(ROOT,m.url)); return glbCache[k].then(g=>({scene:g.scene.clone(true),userData:g.scene.userData})); };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
// game3d.js 的 tapToSeat、TAP_CHAIR、rayHitsBox（原樣拿出來；走近點照椅子本身，這支只看挑到哪一張）
const G3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const mT=/  function tapToSeat\(x,z,lv,o\)\{[\s\S]*?\n  GM\.TAP_CHAIR=TAP_CHAIR; GM\.rayHitsBox=rayHitsBox;\n/.exec(G3);
check('0. game3d.js 有 tapToSeat（打模型判椅子）、TAP_CHAIR、rayHitsBox；engine3d.js 有 E.rayFirstHit',!!mT&&typeof E.rayFirstHit==='function'); if(!mT){ console.log('FAILED'); process.exit(1); }
const T=new Function('E','seatApproach','GM',mT[0]+'\nreturn {tapToSeat,TAP_CHAIR,rayHitsBox};')(E,st=>[st.x,st.z],{});
/* 修改前（0d7922555 的射線高度判）：拿來比較——舊做法在哪些點會被帶去椅子（照當時的寫法，地板那一點沒對到椅子時看射線離地 0.75／0.6／0.45／0.3 m 那幾點離椅中心 0.32 m 內）*/
function oldTap(x,z,lv,R,fy,seats){ let best=null, bd=0.45; if(!E.canStand(x,z,0.3,lv|0)) for(const st of seats){ const d=Math.hypot(st.x-x,st.z-z); if(d<bd){ bd=d; best=st; } }
  if(!best&&R.direction.y<-1e-3) for(const h of [0.75,0.6,0.45,0.3]){ const t=(fy+h-R.origin.y)/R.direction.y; if(!(t>0)) continue; const px=R.origin.x+R.direction.x*t, pz=R.origin.z+R.direction.z*t; let b2=0.32; for(const st of seats){ const d=Math.hypot(st.x-px,st.z-pz); if(d<b2){ b2=d; best=st; } } if(best) break; }
  return best; }
async function load(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.scene&&z.group&&!z.group.parent) E.scene.add(z.group);
  E.player={obj:{position:new THREE.Vector3(0,0,0),rotation:{y:0}},radius:0.32,lv:0};
  for(let i=0;i<400&&!z.formal;i++) await new Promise(r=>setTimeout(r,25)); z.group.updateMatrixWorld(true); return z; }
const seatsOf=lv=>(E.interactables||[]).filter(it=>it.seat&&!it.hidden&&((it.seat.lv|0)===(lv|0))).map(it=>it.seat);
/* 鏡頭在 cam、玩家在 pp：照遊戲把背對鏡頭的牆淡出、藏起來（engine3d.js updateCamera → z.fadeWalls → hideFaded）*/
function fade(z,cam,pp){ if(z.fadeWalls){ z.fadeWalls({position:cam},pp); for(const w of z.walls||[]){ const m=w&&w.material; if(m&&!Array.isArray(m)) w.visible=m.opacity>0.5; } } z.group.updateMatrixWorld(true); }
const V=(x,y,z)=>new THREE.Vector3(x,y,z);
/* 打到的點落在哪張椅子的範圍裡（和 tapToSeat 同一個定義：照椅子朝向，左右、前面 TAP_CHAIR.r，後面 TAP_CHAIR.back，高度地板～椅背頂＋lift；兩張都算就取比例上近的）*/
function chairOf(p,seats,fy){ let want=null, bc=1.0001; const C=T.TAP_CHAIR; for(const s2 of seats){ const y0=s2.y!=null?s2.y:(fy||0); if(p.y<y0-0.02||p.y>y0+C.h+(s2.lift||0)+0.02) continue; const yw=s2.yaw||0, fx=Math.sin(yw), fz=Math.cos(yw), dx=p.x-s2.x, dz=p.z-s2.z, f=dx*fx+dz*fz, l=Math.abs(dx*fz-dz*fx), d=Math.max(l/C.r,f>=0?f/C.r:-f/C.back); if(d<=bc){ bc=d; want=s2; } } return want; }
function tap(z,lv,cam,aim,fy){ const dir=aim.clone().sub(cam).normalize(), R=new THREE.Ray(cam.clone(),dir); if(dir.y>=-1e-3) return null; const t=(fy-cam.y)/dir.y, F=cam.clone().addScaledVector(dir,t);
  fade(z,cam,F); const seats=seatsOf(lv), r=T.tapToSeat(F.x,F.z,lv,{ray:R,fy,hit:{x:F.x,y:fy,z:F.z}}), first=E.rayFirstHit(R,t-0.03);
  return {R,F,t,seats,r,first,old:oldTap(F.x,F.z,lv,R,fy,seats)}; }
(async()=>{
  // ---- 1 BB 的四個走道點 ----
  const BB=[['library_hall',1,[-8.5,5],[-7.025,3.8],'總圖大廳二樓 (−8.5,5)'],['library_hall',1,[-11,6.5],[-10.175,5.8],'總圖大廳二樓 (−11,6.5)'],['dorm_hall',0,[11.5,3],[9,3.35],'宿舍交誼廳 (11.5,3)'],['cafe',null,[1.5,-0.5],[0.85,1.5],'Café (1.5,−0.5)']];
  for(const [id,lv0,F0,C0,name] of BB){ const z=await load(id); const lv=lv0==null?0:lv0; const fy=E.heightAt(F0[0],F0[1],lv);
    const st=seatsOf(lv).find(s=>Math.abs(s.x-C0[0])<0.02&&Math.abs(s.z-C0[1])<0.02);
    if(!st){ check('1. '+name+'：找得到 BB 說的那張椅子 ('+C0+')',false); continue; }
    const fd=Math.hypot(C0[0]-F0[0],C0[1]-F0[1]), ux=(C0[0]-F0[0])/fd, uz=(C0[1]-F0[1])/fd;
    let nVis=0, nNew=0, nOld=0, nChair=0, nNewChair=0; const bad=[];
    for(const hc of [1.6,2.0,2.6,3.2]) for(const hb of [0.35,0.5,0.65,0.75]) for(const off of [-0.24,-0.12,0,0.12,0.24]){
      const Dh=hc*fd/hb, cam=V(F0[0]+ux*Dh-uz*off*Dh/fd,fy+hc,F0[1]+uz*Dh+ux*off*Dh/fd), q=tap(z,lv,cam,V(F0[0],fy,F0[1]),fy); if(!q) continue;
      const onChair=q.first&&chairOf(q.first.point,[st],fy)===st;
      if(!q.first||q.first.point.distanceTo(q.F)<0.2){ nVis++; if(q.r) { nNew++; bad.push('hc'+hc+' hb'+hb+' off'+off+'→'+J(q.r[3])); } if(q.old) nOld++; }   /* 先打到的是地板那一點（或貼在地板上的地毯，離那一點 0.2 m 內）＝畫面上點的是地板 */
      else if(onChair){ nChair++; if(q.r&&q.r[3]&&q.r[3].x===st.x&&q.r[3].z===st.z) nNewChair++; } }
    check('1. '+name+'：看得到地板的點（射線先打到地板）'+nVis+' 個，一律照舊走過去（null）；舊做法其中 '+nOld+' 個被帶去 ('+C0+')',nVis>0&&nNew===0&&nOld>0,bad.slice(0,3).join('；'));
    console.log('     （同一批鏡頭裡射線先打到那張椅子的 '+nChair+' 個：導去那張 '+nNewChair+' 個——畫面上點的就是椅子）'); }
  // ---- 2 五湖四海 #9 ----
  /* #9 面向 +z（桌子在 z −0.65～0.15）：鏡頭在 4 m 外、八個方向、俯角 0.35／0.5，點椅背、椅面附近——射線先打到 #9 的，都要導去 #9（從南邊隔著桌子看不到 #9：桌子先被打到）；
     這些點地板那一點在椅子後面、站得住：只看地板那一點的做法（0d7922555 以前）＝走過去、按鈕變「點餐」（BB 11-11 CC TAPSEAT）*/
  { const z=await load('l118_home'); const st=seatsOf(0).find(s=>Math.abs(s.x-0.5)<0.02&&Math.abs(s.z+0.9)<0.02);
    if(!st) check('2. 五湖四海 #9 (0.5,−0.9) 在配置裡',false);
    else { const res=[]; let ok=0, n=0, oldFloor=0, nAll=0;
      for(let k=0;k<8;k++) for(const pit of [0.35,0.5]) for(let ax=-0.16;ax<=0.161;ax+=0.08) for(let ay=0.45;ay<=0.951;ay+=0.1) for(let az=-0.2;az<=0.101;az+=0.1){ const yaw=k*Math.PI/4, cx=st.x+Math.sin(yaw)*4, ch=0.5+Math.tan(pit)*4, cz=st.z+Math.cos(yaw)*4; const q=tap(z,0,V(cx,ch,cz),V(st.x+ax,ay,st.z+az),0); if(!q) continue; nAll++;
        if(!q.first||chairOf(q.first.point,seatsOf(0),0)!==st) continue; n++;
        const r=q.r, hitThis=r&&r[3]&&r[3].x===st.x&&r[3].z===st.z; if(hitThis) ok++; else res.push(J({cam:[cx,ch,cz],r:r&&r[3],first:[+q.first.point.x.toFixed(2),+q.first.point.y.toFixed(2),+q.first.point.z.toFixed(2)]}));
        const r0=T.tapToSeat(q.F.x,q.F.z,0); if(!(r0&&r0[3]&&r0[3].x===st.x&&r0[3].z===st.z)) oldFloor++; }
      check('2. 五湖四海 #9：八個方向點椅子附近（'+nAll+' 個點裡射線先打到 #9 的 '+n+' 個）都導去 #9；只看地板那一點的做法其中 '+oldFloor+' 個坐不到（原本的「點椅面變點餐」）',n>0&&ok===n&&oldFloor>0,res.slice(0,3).join('；')); } }
  // ---- 3 118 巷九間每一張椅子 ----
  { let nT=0, nOn=0, nOk=0, nOld=0, nNone=0; const bad=[], oldBad={};
    for(const sid of Object.keys(L118_SHOP_LAYOUTS)){ const z=await load('l118_'+sid); const seats=seatsOf(0);
      for(const st of seats){ const top=0.47+(st.lift||0);
        for(const dist of [3.2,4.6]) for(const pit of [0.3,0.5,0.7]) for(let k=0;k<8;k++){ const yaw=k*Math.PI/4, cam=V(st.x+Math.sin(yaw)*dist,top+Math.tan(pit)*dist,st.z+Math.cos(yaw)*dist);
          const q=tap(z,0,cam,V(st.x,top,st.z),0); if(!q) continue; nT++; if(!q.first){ nNone++; continue; }
          const want=chairOf(q.first.point,seats,0);
          if(!want) continue; nOn++; const got=q.r&&q.r[3]; if(got&&got.x===want.x&&got.z===want.z) nOk++; else bad.push(sid+' ('+want.x+','+want.z+')→'+J(got));
          if(q.old&&!(q.old.x===want.x&&q.old.z===want.z)){ nOld++; oldBad[sid]=(oldBad[sid]||0)+1; } } } }
    check('3. 118 巷九間每一張椅子、遊戲那種鏡頭點椅面 '+nT+' 次：射線先打到椅子的 '+nOn+' 次都導去打到的那一張（打到牆、桌子、看不到的 '+(nT-nOn-nNone)+'、射線先到地板 '+nNone+'）',nOn>0&&nOk===nOn,bad.slice(0,4).join('；'));
    console.log('     （舊做法挑到別張的：'+nOld+' 次 '+J(oldBad)+'）'); }
  // ---- 4 舊行為 ----
  { const z=await load('l118_home'); const st=seatsOf(0).find(s=>Math.abs(s.x-0.5)<0.02&&Math.abs(s.z+0.9)<0.02); const r=st&&T.tapToSeat(st.x,st.z+0.05,0);
    check('4. 地板那一點在椅子上（站不住）、沒有傳射線：照舊導去那張',!!r&&r[3]&&r[3].x===st.x&&r[3].z===st.z,J(r)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
