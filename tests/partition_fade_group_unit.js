// 隔間牆的零件跟主牆一起淡出（BB-B 11-08 光照第二級雲端判 P2：總圖 B1 自習室 A 區往回看，左邊那面長牆下三分之一一條深藍黑的帶子；LAWWW2-B 修）——不需要瀏覽器（D131）。
// 原因：zones3d.js 的 fadeWalls 對隔間牆（extras.partition）是「鏡頭和玩家在牆的兩邊才淡出」，每個 WALL_ 網格用自己的外框中心判斷。
//   B1 的 P2：牆中心 z −2.40、自習室那一面的木護牆板 −2.47。玩家站在兩個平面中間（B1 入口 (−20.5, −2.4) 就是），只有護牆板淡出；
//   烘焙時牆被護牆板蓋住的那一段照不到光（黑的），護牆板一淡出就露出來。
// 做法：tools/blender/env_second/lightbake/glb_partition_at.py 在零件的 extras 寫 at＝主牆的淡出判斷點（遊戲已經認 at，不用改程式）。
// 檢查（在 Node 建出遊戲真正的區域、接上 GLB，照遊戲主迴圈做 fadeWalls → hideFaded）：
//   ① CC 那一張（B1 自習室 A 區往回看：鏡頭 (6, 1.6, −3.5)、玩家在入口 (−20.5, −2.4)）：WALL_P2_* 全部一起顯示或一起藏
//   ② 六間有隔間牆的房間（總圖 B1、研究小間、霖澤 5F、體育館 B1、美國公寓、合租戶）：每一面隔間牆（主牆和它的零件）
//      在 300 組隨機的鏡頭／玩家位置下，顯示或藏起來都一樣
//   ③ 開著的門板（5F 研究室 WALL_P1_door＋門把、美國公寓／合租戶 WALL_S_door）跟它貼著的那面牆一起顯示或一起藏；5F lab_in 那一張門板要留著
// 修改前：① ② ③ 不過（0c49eb7a7 修好 ① ②，③ 是 LM3_cloud）。用法：node tests/partition_fade_group_unit.js
const {ROOT}=require('../tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing|載入失敗/.test(String(a[0]))) return; w0(...a); };
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
for(const f of ['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/library_b1_layout.js','src/library_b1_3d.js']) run(f);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
/* GLB 直接接到 attachRoomGLB（和各區域的接法一樣：attachRoomGLB(z,g0,fb,root)），不必建整個區域 */
const loader=new THREE_JSM.GLTFLoader.GLTFLoader();
const loadGLB=p=>new Promise((res,rej)=>{ const b=fs.readFileSync(path.join(ROOT,p)); loader.parse(b.buffer.slice(b.byteOffset,b.byteOffset+b.byteLength),'',g=>res(g.scene),rej); });
const attach=async p=>{ const root=await loadGLB(p); root.updateMatrixWorld(true); const g0=new THREE.Group(), fb=new THREE.Group(); g0.add(fb); g0.add(root);
  const z={walls:[],fadeWalls:null}; z.group=g0; Z3.room&&0; Z3.attachRoomGLB(z,g0,fb,root); return z; };
/* ② 六間只接模型（不建整個區域），淡出照 room() 的 fadeWalls 寫一份同樣的判斷（zones3d.js 1646 行；① 用的是真正的那一份）*/
const fade=(walls,cam,pp)=>{ for(const w of walls){ const c=w.userData.center||w.position; let facing=new THREE.Vector3().subVectors(cam,c).dot(w.userData.dir)>0;
  if(w.userData.partition&&pp) facing=facing===(new THREE.Vector3().subVectors(pp,c).dot(w.userData.dir)>0); w.visible=facing; } };
const groups=walls=>{ /* 一面牆＝主牆和外框落在它裡面的零件（同一個 dir；外框中心在主牆外框內，各邊放寬 6 cm、沿 dir 15 cm 內），只看幾何、不看 at */
  const P=walls.filter(w=>w.userData.partition).map(w=>{ const bb=new THREE.Box3().setFromObject(w), s=bb.getSize(new THREE.Vector3()), d=w.userData.dir, ax=Math.abs(d.x)>0.5?'x':(Math.abs(d.z)>0.5?'z':'y');
    return {w,bb,c:bb.getCenter(new THREE.Vector3()),ax,dk:[d.x,d.y,d.z].map(v=>Math.round(v)).join(','),area:['x','y','z'].filter(k=>k!==ax).reduce((m,k)=>m*s[k],1)}; });
  const G=new Map(); for(const a of P){ let best=null; for(const o of P){ if(o===a||o.dk!==a.dk||o.area<a.area*1.5) continue;
      if(['x','y','z'].every(k=>k===a.ax?Math.abs(a.c[k]-(o.bb.min[k]+o.bb.max[k])/2)<=0.15:(a.c[k]>=o.bb.min[k]-0.06&&a.c[k]<=o.bb.max[k]+0.06))&&(!best||o.area>best.area)) best=o; }
    const k=(best||a).w; if(!G.has(k)) G.set(k,[k]); if(best) G.get(k).push(a.w); }
  return Object.fromEntries([...G.entries()].map(([k,v])=>[k.name,v])); };
(async()=>{
  const A='assets/models/env/second_ai/';
  { /* ① 用遊戲真正的 B1 區域（library_b1_3d.js 建房間、attachRoomGLB 接模型）和它的 fadeWalls，再照主迴圈的 hideFaded（透明度 0.5 以下藏起來）*/
    window.ASSET_DATA=window.ASSET_DATA||{}; const u=ASSETS.manifest['bldg.library_b1'].url; window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64');
    const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; global.GAME={G:{zone:'library_b1',day:30,hour:14,flags:{},weather:'clear'}};
    const z=Z3.ZONES.library_b1.build(E); E.zone=z; for(let i=0;i<100&&!z.formal;i++) await sleep(100); await sleep(200);
    const cam=new THREE.PerspectiveCamera(); cam.position.set(6,1.6,-3.5); cam.lookAt(-14,1,-11); cam.updateMatrixWorld(); z.fadeWalls(cam,new THREE.Vector3(-20.5,0,-2.4));
    const P2=z.walls.filter(w=>/^WALL_P2_/.test(w.name)), vis=w=>w.material.opacity>0.5, v=P2.map(w=>w.name.replace('WALL_P2_','')+(vis(w)?'✓':'✗'));
    check('① CC 那一張（B1 自習室 A 往回看，玩家在入口；遊戲的 B1 區域、fadeWalls）：WALL_P2_* 一起顯示或一起藏', z.formal&&P2.length>=4&&P2.every(w=>vis(w)===vis(P2[0])), v.join('、')); }
  for(const r of ['library_b1','library_carrels','linze_5f','gym_b1','us_apartment','us_shared']){
    const z=await attach(A+r+'.glb'); const G=groups(z.walls); let bad=0,n=0,ex=null; const box=new THREE.Box3(); for(const w of z.walls) box.expandByObject(w);
    let seed=7; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
    for(let i=0;i<300;i++){ const cam=new THREE.Vector3(box.min.x+rnd()*(box.max.x-box.min.x),1.6,box.min.z+rnd()*(box.max.z-box.min.z)), pp=new THREE.Vector3(box.min.x+rnd()*(box.max.x-box.min.x),0,box.min.z+rnd()*(box.max.z-box.min.z));
      fade(z.walls,cam,pp); for(const [k,ws] of Object.entries(G)){ if(ws.length<2) continue; n++; if(!ws.every(w=>w.visible===ws[0].visible)){ bad++; if(!ex) ex=k+' '+ws.map(w=>w.name+(w.visible?'✓':'✗')).join('、'); } } }
    check(`② ${r}：每一面隔間牆和它的零件一起顯示或一起藏（${Object.keys(G).length} 面 × 300 組鏡頭／玩家）`, bad===0, bad?`${bad}/${n} 次不一致，例：${ex}`:`${n} 次都一致`); }
  { /* ③ 開著的門板跟它貼著的那面牆一起淡出（BB-B 11-08 LM3_cloud：霖澤 5F 研究室 lab_in 左牆深褐斜帶；glb_partition_at.py 規則 B）
       5F 研究室的門板 WALL_P1_door（＋門把）屬於門洞那面牆 P1，卻轉了 90° 貼在 P2 背面前 15 cm：鏡頭在走廊、P1 淡出時門板跟著藏起來，露出它烘在 P2 上的影子。
       美國公寓、合租戶的大門 WALL_S_door 一樣（貼在廚房牆 kit_e 前）。*/
    const pairs={linze_5f:[['WALL_P1_door','WALL_P2_wall'],['WALL_P1_doormetal','WALL_P2_wall']],us_apartment:[['WALL_S_door','WALL_kit_e_wall_k']],us_shared:[['WALL_S_door','WALL_kit_e_wall_k']]};
    for(const [r,ps] of Object.entries(pairs)){ const z=await attach(A+r+'.glb'); const by=n=>z.walls.find(w=>w.name===n);
      if(r==='linze_5f'){ const cam=new THREE.Vector3(-5.8,4.2,-2.6), pp=new THREE.Vector3(-5.8,0,1.2); fade(z.walls,cam,pp);   /* CC 那一張：玩家在研究室 (−5.8, 1.2)，鏡頭在後面走廊上方 */
        const P1=by('WALL_P1_wall'), D=by('WALL_P1_door'), P2=by('WALL_P2_wall');
        check('③ 5F lab_in（CC 那一張）：P1 淡出、P2 顯示，開著的門板留著（蓋住它自己烘在 P2 背面的影子）', !!(P1&&D&&P2)&&!P1.visible&&P2.visible&&D.visible, `P1 ${P1&&P1.visible?'✓':'✗'}、P2 ${P2&&P2.visible?'✓':'✗'}、門板 ${D&&D.visible?'✓':'✗'}`); }
      const box=new THREE.Box3(); for(const w of z.walls) box.expandByObject(w); let seed=11; const rnd=()=>{ seed=(seed*16807)%2147483647; return seed/2147483647; };
      let bad=0, ex=null;
      for(let i=0;i<300;i++){ const cam=new THREE.Vector3(box.min.x+rnd()*(box.max.x-box.min.x),1.6,box.min.z+rnd()*(box.max.z-box.min.z)), pp=new THREE.Vector3(box.min.x+rnd()*(box.max.x-box.min.x),0,box.min.z+rnd()*(box.max.z-box.min.z));
        fade(z.walls,cam,pp); for(const [a,b] of ps){ const A1=by(a), B1=by(b); if(!A1||!B1||A1.visible!==B1.visible){ bad++; if(!ex) ex=`${a}${A1&&A1.visible?'✓':'✗'} ${b}${B1&&B1.visible?'✓':'✗'}`; } } }
      check(`③ ${r}：開著的門板跟它貼著的那面牆一起顯示或一起藏（${ps.map(p=>p[0]).join('、')}；300 組）`, bad===0, bad?`${bad} 次不一致，例：${ex}`:'都一致'); }
  }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
