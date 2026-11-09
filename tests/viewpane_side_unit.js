// 放大的窗景卡：鏡頭跑到店面左右範圍外（側牆外）時要藏起來（CAM-VIEWPANE-SIDE-1109，LAWWW2-B 2026-11-09；BB-B 11-09 23:12 疑點：溫州街阿德影印 wz_print 鏡頭轉到 270°，超出店面的那一段窗景卡擋住畫面三分之一）——不需要瀏覽器（D131）。
// ggViewPanes（zones3d.js）把窗景放大到至少 14 m 寬、放在前牆玻璃外；原本只在鏡頭跑到前牆外時藏（winParts）。LAWWW-B、BB-B 選做法 (1)：鏡頭在店面左右範圍外也藏。
// 在 Node 建出真正的店（正式模型載入、ggViewPanes 接好）：阿德影印 wz_print、林家乾麵 wz_lin、慢輪單車 bikeshop，用區域真正的 fadeWalls（和 engine3d.js 每一幀同一個）判斷窗景卡顯示與否：
//   ① 鏡頭在左、右側牆外 1 m（店深中間）：窗景卡藏起來
//   ② 鏡頭在店裡（正中、靠左右側牆 0.3 m）：窗景卡看得到（店裡看窗外的景照舊）
//   ③ 鏡頭在前牆外 2 m：窗景卡藏起來（原本的規則照舊）
//   ④ 玩家站在出生點，跟隨鏡頭（引擎的 followCam、區域的 camDist）轉一圈（每 15°）：鏡頭在店面左右範圍外的角度窗景卡都藏；鏡頭在店裡、朝前窗（150°～210°）的角度都看得到
// 修改前（開發分支 2d58e8a52）：阿德影印、林家乾麵 ①、④ FAIL（慢輪單車店面寬 10.2 m，出生點轉一圈鏡頭不會出店面，只有 ① FAIL）。用法：node tests/viewpane_side_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
class FakeImg{ constructor(){ this._l={}; this.width=4; this.height=4; } addEventListener(t,f){ this._l[t]=f; } removeEventListener(){} set src(v){ this._src=v; setTimeout(()=>{ this._l.load&&this._l.load({}); },0); } get src(){ return this._src; } }
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:(ns,n)=>n==='img'?new FakeImg():{getContext:()=>ctx2d,style:{}}, createElement:(n)=>n==='canvas'?{width:1,height:1,getContext:()=>ctx2d,style:{}}:new FakeImg(), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); console.warn=()=>{};
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=[...new Set(['lib/three.bundle.js','lib/three.jsm.bundle.js',...eval(T.match(/const files=(\[[^\]]+\])/)[1]),'src/data/calendar.js','src/data/places.js','src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/lane118_layout.js','src/data/daily_offbeat_layout.js','src/data/bike_layout.js','src/data/lin_layout.js','src/bike3d.js','src/bikeshop3d.js'])];
const order=f=>f.startsWith('lib/')?0:(f.startsWith('src/data/')?1:(f==='src/zones3d.js'?2:4));
const pre=files.filter(f=>order(f)<2).concat(['src/zones3d.js']).concat(files.filter(f=>order(f)===4&&f!=='src/zones3d.js'));
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of pre){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message+'）'); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
window.ASSET_DATA={};
const lo=ASSETS.loadOne; ASSETS.loadOne=function(k){ const m=ASSETS.manifest[k]; if(m&&m.url&&!window.ASSET_DATA[m.url]&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); return lo.apply(this,arguments); };   /* 正式模型從硬碟讀（只讀這幾間用到的）*/
global.GAME={G:{zone:'',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
(async()=>{ try{
  for(const id of ['wz_print','wz_lin','bikeshop']){
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; GAME.G.zone=id;
    if(E.zone&&E.zone.group) E.scene.remove(E.zone.group);
    const Zd=Z3.ZONES[id]; if(!Zd){ check(id+'：區域存在', false); continue; }
    const z=Zd.build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.scene.add(z.group);
    for(let i=0;i<150;i++){ await sleep(100); if(z.formal&&z.viewPanes) break; } await sleep(300); z.group.updateMatrixWorld(true);
    const cards=[]; z.group.traverse(o=>{ if(/^VIEWPANE_/.test(o.name||'')) cards.push(o); });
    if(!z.formal||!cards.length){ check(id+'：正式模型載入、窗景卡接好', false, 'formal='+!!z.formal+' 窗景卡 '+cards.length); continue; }
    const card=cards[0], cp=card.getWorldPosition(new THREE.Vector3()), W=z.bounds.w/2, D=z.bounds.d/2, cw=(card.geometry.parameters||{}).width||0;
    const sp=z.spawn, P=new THREE.Vector3(sp.x,0,sp.z); E.player={obj:{position:P,rotation:{y:0}},radius:0.32,lv:0}; if(!E.ray) E.ray=new THREE.Raycaster();
    const cam=new THREE.PerspectiveCamera(), at=(x,y,zz)=>{ cam.position.set(x,y,zz); cam.lookAt(P.x,1.45,P.z); cam.updateMatrixWorld(true); z.fadeWalls(cam,P); if(E.hideFaded) E.hideFaded(); return shown(card); };
    const tag=`${id}（店寬 ${z.bounds.w} m、窗景卡 ${cw.toFixed(1)} m 寬，在 z ${cp.z.toFixed(2)}）`;
    const L=at(-(W+1),2.5,0), R=at(W+1,2.5,0);
    check(tag+' ① 鏡頭在左、右側牆外 1 m：窗景卡藏起來', !L&&!R, `左${L?'看得到':'藏'}、右${R?'看得到':'藏'}`);
    const C=at(0,2.5,0), CL=at(-(W-0.3),2.5,0), CR=at(W-0.3,2.5,0);
    check(id+' ② 鏡頭在店裡（正中、靠左右側牆 0.3 m）：窗景卡看得到', C&&CL&&CR, `正中${C?'看得到':'藏'}、靠左${CL?'看得到':'藏'}、靠右${CR?'看得到':'藏'}`);
    const F=at(0,2.5,cp.z+2);
    check(id+' ③ 鏡頭在前牆外 2 m：窗景卡藏起來', !F);
    const out=new THREE.Vector3(), tgt=new THREE.Vector3(sp.x,1.45,sp.z), dist=Zd.camDist||4.0, badOut=[], badIn=[]; let nOut=0, nIn=0;
    for(let deg=0;deg<360;deg+=15){ for(let k=0;k<3;k++){ E.followCam(tgt,deg*Math.PI/180,0.22,dist,0,out); cam.position.copy(out); cam.lookAt(tgt); cam.updateMatrixWorld(true); z.fadeWalls(cam,P); if(E.hideFaded) E.hideFaded(); }
      const v=shown(card), lat=Math.abs(out.x)>W;
      if(lat){ nOut++; if(v) badOut.push(deg+'°'); } else if(deg>=150&&deg<=210&&out.z<cp.z){ nIn++; if(!v) badIn.push(deg+'°'); } }
    check(id+' ④ 出生點轉一圈：鏡頭在店面左右範圍外的角度窗景卡都藏、店裡朝前窗的角度都看得到', !badOut.length&&!badIn.length&&nIn>0,
      `範圍外 ${nOut} 個角度${badOut.length?'，還看得到：'+badOut.join('、'):''}；朝前窗 ${nIn} 個角度${badIn.length?'，藏起來：'+badIn.join('、'):''}`); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
  }catch(e){ console.log('ERR',e.stack); process.exit(1); }
})();
