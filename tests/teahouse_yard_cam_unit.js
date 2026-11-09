// 一盞前院的跟隨鏡頭（CAM-TEAYARD-1109，LAWWW2-B 2026-11-09；BB-B 11-09 WALLFADE_W1P_cloud：出生點把鏡頭轉到 180°、270°，鏡頭跑進牆裡，整個畫面只剩牆）——不需要瀏覽器（D131）。
// 在 Node 建出真正的 wz_teahouse（正式模型 wz_teahouse_interior.glb＋前院 wz_teahouse_yard.glb），用引擎真正的 followCam（鏡頭碰撞）＋區域的 fadeWalls＋引擎的 hideFaded：
//   ① 玩家站在出生點（前院），鏡頭轉四個方向（0／90／180／270°），距離 6.0（預設）和 4.5（CC 探針用的）：鏡頭和頭之間沒有看得到的網格擋住
//   ② 同上，畫面裡（橫 ±35°、直 ±22°）最近的看得到的網格 ≥ 0.3 m（不會整片貼在鏡頭前）
//   ③ 玩家走進屋裡：鏡頭碰撞回到原本的兩道隔間牆（緣側的牆照舊淡出，不擋鏡頭）
// 修改前（開發分支 12afed84e）：① 180°（緣側的牆 WALL_engawa_yzn_wall）、270°（鄰居的房子 wzy_apt）FAIL。用法：node tests/teahouse_yard_cam_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
class FakeImg{ constructor(){ this._l={}; this.width=4; this.height=4; } addEventListener(t,f){ this._l[t]=f; } removeEventListener(){} set src(v){ this._src=v; setTimeout(()=>{ this._l.load&&this._l.load({}); },0); } get src(){ return this._src; } }
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:(ns,n)=>n==='img'?new FakeImg():{getContext:()=>ctx2d,style:{}}, createElement:(n)=>n==='canvas'?{width:1,height:1,getContext:()=>ctx2d,style:{}}:new FakeImg(), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set(['lib/three.bundle.js','lib/three.jsm.bundle.js',...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
window.ASSET_DATA={}; const urls=new Set(Object.values(ASSETS.manifest).map(m=>m.url).filter(u=>/wz_teahouse/.test(u||''))); const TL=WZ_SHOPS_LAYOUT.teahouse; if(TL.glb) urls.add(TL.glb); if(TL.yard&&TL.yard.glb) urls.add(TL.yard.glb); for(const u of urls) if(fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); 
global.GAME={G:{zone:'wz_teahouse',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{ try{
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null;
  const z=Z3.ZONES.wz_teahouse.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.scene.add(z.group);
  let yard=false; for(let i=0;i<150;i++){ await sleep(100); let n=0; z.group.traverse(o=>{ if(/^YARD_/.test(o.name||'')) n++; }); if(z.formal&&n){ yard=true; break; } } await sleep(300);
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  if(!z.formal||!yard){ check('正式模型（室內＋前院）載入了', false); console.log('FAILED 1'); process.exit(1); }
  const sp=z.spawn, y0=E.nav.heightAt(sp.x,sp.z); E.player={obj:{position:new THREE.Vector3(sp.x,y0,sp.z),rotation:{y:0}},radius:0.32,lv:0};
  if(!E.ray) E.ray=new THREE.Raycaster(); const P=E.player.obj.position, out=new THREE.Vector3(), rc=new THREE.Raycaster();
  z.group.updateMatrixWorld(true);
  const visible=()=>{ const v=[]; E.scene.traverse(o=>{ if(!o.isMesh) return; for(let p=o;p;p=p.parent) if(!p.visible) return; const m=[].concat(o.material)[0]; if(m&&m.visible===false) return; v.push(o); }); return v; };
  /* 一幀：fadeWalls（換鏡頭碰撞）→ followCam → fadeWalls＋hideFaded（和 engine3d.js updateCamera 同樣的順序，多跑幾次讓前院的狀態穩定）*/
  const frame=(yaw,dist)=>{ const tgt=new THREE.Vector3(P.x,P.y+1.45,P.z), cam=new THREE.PerspectiveCamera(); let res;
    for(let k=0;k<3;k++){ res=E.followCam(tgt,yaw,0.22,dist,0,out); cam.position.copy(out); cam.lookAt(tgt); cam.updateMatrixWorld(true); z.fadeWalls(cam,P); E.hideFaded(); }
    return {tgt,res,cam:out.clone()}; };
  const bad1=[], bad2=[], info=[];
  for(const dist of [6.0,4.5]) for(const deg of [0,90,180,270]){ const {tgt,res,cam}=frame(deg*Math.PI/180,dist), vis=visible();
    const dir=tgt.clone().sub(cam), len=dir.length(); dir.normalize(); rc.set(cam,dir); rc.far=len; const h=rc.intersectObjects(vis,false);
    if(h.length) bad1.push(`${dist}/${deg}°：${h[0].object.name} 離鏡頭 ${h[0].distance.toFixed(2)} m`);
    let near=Infinity, nn=''; const fwd=dir.clone(), right=new THREE.Vector3().crossVectors(fwd,new THREE.Vector3(0,1,0)).normalize(), up=new THREE.Vector3().crossVectors(right,fwd);
    for(let i=-4;i<=4;i++) for(let j=-2;j<=2;j++){ const d=fwd.clone().addScaledVector(right,Math.tan(i*35/4*Math.PI/180)).addScaledVector(up,Math.tan(j*22/2*Math.PI/180)).normalize(); rc.set(cam,d); rc.far=50; const hh=rc.intersectObjects(vis,false); if(hh.length&&hh[0].distance<near){ near=hh[0].distance; nn=hh[0].object.name; } }
    if(near<0.3) bad2.push(`${dist}/${deg}°：${nn} ${near.toFixed(2)} m`);
    info.push(`${dist}/${deg}° 距離 ${res.dist.toFixed(2)}、最近 ${near.toFixed(2)}`); }
  check('① 出生點（前院）轉四個方向（距離 6.0、4.5）：鏡頭和頭之間沒有看得到的網格', !bad1.length, bad1.join('；')||info.join('｜'));
  check('② 畫面裡最近的看得到的網格 ≥ 0.3 m', !bad2.length, bad2.join('；'));
  /* ③ 走進屋裡（玄關裡面、茶席那一帶）*/
  P.set(0, 0, 2); frame(Math.PI,6.0); const cc=(z.camCols&&z.camCols[0])||[];
  check('③ 進到屋裡：鏡頭碰撞回到原本的兩道隔間牆（沒有緣側的牆、前院的房子）', cc.length===2&&!cc.some(o=>/WALL_engawa|^wzy_/.test(o.name||'')), cc.map(o=>o.name||'(隔間牆)').join('、'));
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
  }catch(e){ console.log('ERR',e.stack); process.exit(1); }
})();
