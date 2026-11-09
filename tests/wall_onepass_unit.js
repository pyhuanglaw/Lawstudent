// 牆一次畫完（PERF-XS-NPC-1108 (C)，LAWWW2-B 2026-11-09）——不需要瀏覽器（D131）。
// 背景：CC 用 PC GPU 量大口一樓（render_probe_dc，RPROBE_DC_7824_dakou1f）：dk_vc_matte 每秒畫 1128 次、每一次都 material.version 變了、換 program。
//   原因是 three.js 的 renderObject：材質 transparent＋DoubleSide＋forceSinglePass=false 時畫兩次（先 BackSide 再 FrontSide），兩次前面都 needsUpdate
//   （version++）→ setProgram 每次都走 getProgram＋getParameters。各區域接 GLB 時把牆的材質複製、設成 transparent（淡出要用），GLB 的牆大多是雙面。
// 修改：assets3d.js 載入建築 GLB 時，原本不透明的材質記 userData.op0；engine3d.js 的 hideFaded（每一幀淡出牆之後）對 op0、opacity 1、雙面、沒有 alphaTest 的牆設 forceSinglePass。
// 在 Node 建出真正的區域（正式模型），跑區域的 fadeWalls＋引擎的 hideFaded，照 three.js renderObject 的條件模擬一幀畫牆（畫幾次、version 加幾次）：
//   ① three.js（lib/three.bundle.js）的 renderObject 還是「transparent＋DoubleSide＋forceSinglePass=false 就分兩次、各 needsUpdate」（升級 three.js 時這支要重看）
//   ② 大口（一樓＋二樓 GLB）、山嵐、木曜日：鏡頭在店裡四個方向，看得到的牆，原本不透明的每一面每一幀只畫一次、version 不動
//   ③ 一次畫完的牆：GLB 的材質是 OPAQUE（讀 GLB 的 alphaMode）、opacity 1、沒有 alphaTest；本來就半透明的（玻璃 BLEND）不碰（木曜日的正面玻璃牆也在 walls 裡）
//   ④ 淡出的牆（opacity 0.12）照舊整面藏起來、不畫；鏡頭移回來又一次畫完
//   ⑤ E.wallOnePass=false（網址 ?wall2pass）：回到舊做法（和開發分支一樣分兩次）
// 修改前（開發分支 28d40e6e3）：② 三間、⑤ FAIL（FAILED 4；三間 12 個方向畫牆 264 次、version +240）；修改後 ALL PASS（144 次、+0）。用法：node tests/wall_onepass_unit.js
const {ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing|載入失敗/.test(String(a[0]))) return; w0(...a); };
const e0=console.error; console.error=(...a)=>{ if(/texture|Texture|image/.test(String(a[0]))) return; e0(...a); };
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const exists=u=>!!u&&fs.existsSync(path.join(ROOT,u));

// ① three.js 的 renderObject
{ const B=fs.readFileSync(path.join(ROOT,'lib/three.bundle.js'),'utf8'), i=B.indexOf('function renderObject( object, scene, camera, geometry, material, group ) {'), s=i>=0?B.slice(i,i+1600):'';
  const cond=s.indexOf("if ( material.transparent === true && material.side === DoubleSide && material.forceSinglePass === false ) {");
  const two=cond>=0&&/material\.side = BackSide;\s*material\.needsUpdate = true;\s*_this\.renderBufferDirect[\s\S]*?material\.side = FrontSide;\s*material\.needsUpdate = true;\s*_this\.renderBufferDirect/.test(s.slice(cond));
  check('① three.js renderObject：transparent＋DoubleSide＋forceSinglePass=false → 分兩次畫、每次 needsUpdate', i>=0&&two, i<0?'找不到 renderObject':''); }

for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/zones3d.js',
  'src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js','src/data/shanlan_layout.js','src/shanlan3d.js','src/data/mokuyobi_layout.js','src/mokuyobi3d.js']) if(fs.existsSync(path.join(ROOT,f))) run(f);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
const MAN=ASSETS.manifest;
const preload=keys=>{ window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of keys){ const m=MAN[k]; if(m&&exists(m.url)) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); } };
/* GLB 裡每個材質名字的 alphaMode（OPAQUE／MASK／BLEND）*/
const alphaModes=keys=>{ const r={}; for(const k of keys){ const m=MAN[k]; if(!m||!exists(m.url)) continue; const b=fs.readFileSync(path.join(ROOT,m.url)), n=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+n).toString('utf8')); for(const mt of J.materials||[]) r[mt.name]=mt.alphaMode||'OPAQUE'; } return r; };
const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
/* 照 three.js renderObject 畫一幀牆：回傳每一面看得到的牆畫幾次、version 加幾次 */
function frame(z){ const out=[]; for(const w of z.walls){ if(!w||!w.isMesh||!shown(w)) continue; const m=w.material; if(Array.isArray(m)) continue; const v0=m.version; let draws=1;
    if(m.transparent===true&&m.side===THREE.DoubleSide&&m.forceSinglePass===false){ m.side=THREE.BackSide; m.needsUpdate=true; m.side=THREE.FrontSide; m.needsUpdate=true; m.side=THREE.DoubleSide; draws=2; }
    out.push({w,m,draws,bump:m.version-v0}); } return out; }
const ZONES=[
  {id:'xs_dakou', keys:['bldg.xs_dakou_1f','bldg.xs_dakou_2f'], G:'xs_dakou'},
  {id:'xs_shanlan', keys:['bldg.xs_shanlan'], G:'xs_shanlan'},
  {id:'wz_mokuyobi', keys:['bldg.wz_mokuyobi_interior','bldg.wz_mokuyobi_stair'], G:'wz_mokuyobi'},
];
(async()=>{
  const all={draws:0,draws2:0,bump:0,walls:0,one:0}; const glassOne=[], badOne=[];
  for(const Z of ZONES){
    if(!Z3.ZONES[Z.id]||!Z.keys.every(k=>MAN[k]&&exists(MAN[k].url))){ check(`${Z.id}：區域、正式模型都在`, false); continue; }
    preload(Z.keys); const AM=alphaModes(Z.keys);
    global.GAME={G:{zone:Z.G,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[Z.id].build(E); E.zone=z; E.scene.add(z.group);
    const sp=z.spawn||{x:0,z:0}; E.player={obj:{position:new THREE.Vector3(sp.x||0,0,sp.z||0),rotation:{y:0}},radius:0.32,lv:0};
    let ok=false; for(let i=0;i<150&&!ok;i++){ await sleep(100); ok=z.walls.some(w=>w&&w.isMesh&&/^WALL_/.test(w.name||'')&&AM[w.material&&w.material.name]); } await sleep(300);
    if(!ok){ check(`${Z.id}：正式模型的牆接上了`, false); E.scene.remove(z.group); continue; }
    z.group.updateMatrixWorld(true);
    /* 鏡頭：店裡中心往四個方向退到牆外 1.5 m（那一面牆會淡出）、高 3.2；玩家在中心 */
    const bb=new THREE.Box3(); for(const w of z.walls) if(w&&w.isMesh) bb.expandByObject(w); const c=bb.getCenter(new THREE.Vector3()), hs=bb.getSize(new THREE.Vector3()); c.y=0;
    const pp=new THREE.Vector3(c.x,0,c.z); E.player.obj.position.copy(pp);
    const res={draws:0,draws2:0,bump:0,walls:0,one:0,names:new Set()}; let fadedDrawn=0, fadedCount=0;
    for(const [dx,dz] of [[0,hs.z/2+1.5],[0,-hs.z/2-1.5],[hs.x/2+1.5,0],[-hs.x/2-1.5,0]]){
      const cam=new THREE.PerspectiveCamera(); cam.position.set(c.x+dx,3.2,c.z+dz); cam.lookAt(pp.x,1.2,pp.z);
      for(let f=0;f<3;f++){ z.fadeWalls(cam,pp); E.hideFaded();
        for(const w of z.walls) if(w&&w.isMesh&&!Array.isArray(w.material)&&w.material.opacity<0.5){ fadedCount++; if(shown(w)) fadedDrawn++; }
        const fr=frame(z); if(f<2) continue;   /* 第三幀才數（前兩幀讓淡出、hideFaded 穩定）*/
        for(const r of fr){ const am=AM[r.m.name]; res.walls++; res.draws+=r.draws; res.bump+=r.bump; if(r.draws===2) res.draws2++; else res.one++;
          if(r.m.forceSinglePass){ if(am==='BLEND') glassOne.push(Z.id+':'+r.w.name); if(am!=='OPAQUE'&&am!=='MASK'||r.m.opacity<1||r.m.alphaTest>0) badOne.push(Z.id+':'+r.w.name+'('+am+','+r.m.opacity+','+r.m.alphaTest+')'); }
          if(r.draws===2&&am==='OPAQUE'&&!(r.m.alphaTest>0)) res.names.add(r.m.name); } } }
    check(`② ${Z.id}：看得到的牆，原本不透明的每一面每一幀只畫一次、不換 program`, res.walls>0&&res.names.size===0,
      `四個方向 ${res.walls} 面次：畫 ${res.draws} 次（一次 ${res.one}、兩次 ${res.draws2}）、version +${res.bump}`+(res.names.size?'；還分兩次的不透明材質：'+[...res.names].join('、'):''));
    check(`④ ${Z.id}：淡出的牆（opacity 0.12）整面藏起來、不畫`, fadedCount>0&&fadedDrawn===0, `淡出 ${fadedCount} 面次、還在畫 ${fadedDrawn}`);
    for(const k of ['draws','draws2','bump','walls','one']) all[k]+=res[k];
    if(Z.id==='xs_dakou'){
      /* ⑤ ?wall2pass：回到舊做法 */
      E.wallOnePass=false; const cam=new THREE.PerspectiveCamera(); cam.position.set(c.x,3.2,c.z+3.5); cam.lookAt(pp.x,1.2,pp.z); z.fadeWalls(cam,pp); E.hideFaded(); const a=frame(z), aF=a.filter(r=>r.m.forceSinglePass).length;
      E.wallOnePass=true; z.fadeWalls(cam,pp); E.hideFaded(); const b=frame(z);
      const a2=a.filter(r=>r.draws===2).length, b2=b.filter(r=>r.draws===2&&AM[r.m.name]==='OPAQUE').length;
      check('⑤ 大口：E.wallOnePass=false（?wall2pass）回到兩次；改回 true 又一次畫完', E.wallOnePass!==undefined&&a2>0&&aF===0&&b2===0, `false：${a2}／${a.length} 面兩次；true：不透明的還分兩次 ${b2}`);
    }
    E.scene.remove(z.group);
  }
  check('③ 一次畫完的都是原本不透明（OPAQUE）、opacity 1、沒有 alphaTest；玻璃（BLEND）照舊分兩次', all.one>0&&!glassOne.length&&!badOne.length, (glassOne.concat(badOne).join('、')||`一次 ${all.one} 面次`));
  console.log(`合計（三間 × 四個方向，每方向一幀）：牆 ${all.walls} 面次，畫 ${all.draws} 次，version +${all.bump}`);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
