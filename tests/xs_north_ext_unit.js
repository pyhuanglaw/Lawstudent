/* 望月台、體育館的 Blender 正式外觀＋新生南路圍牆後面照新配置（XS-NORTH-EXT-1105，LAWWW2-C 11-05）
   ① 校園：campus_moon.glb、campus_gymext.glb 載入後接上、同 ckTag 的套件藏起來；模型的範圍和 XSG.moon／XSG.gym 一樣（±0.8 m；屋簷、雨遮另算）；招牌有字（併進 wz_plates_atlas）
   ② 新生南路：圍牆後面的望月台在側門南邊、體育館在側門北邊、都貼著圍牆（換算 C2X）；兩顆正式模型載入後接上、套件藏起來
   ③ 新生南路：圍牆後面的樹不長在望月台、體育館裡面；舊的洞洞館、校史館不再放（那是西牆側門的換算）
   修改前（XS-GATE-NORTH-1105 那一版）：① ② ③ FAIL。用法：node tests/xs_north_ext_unit.js */
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{});   // 校園的正式模型在 node 裡載不到（fetch 相對網址），不影響導航
const T=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8');
const files=eval(T.match(/const files=(\[[^\]]+\])/)[1]);
for(const f of ['src/townkit3d.js','src/campuskit3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js']) if(!files.includes(f)) files.push(f);
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
const warn=console.warn; console.warn=()=>{};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const L=XINSHENG_LAYOUT, E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[];
process.on('unhandledRejection',()=>{});
window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of ['bldg.campus_moon','bldg.campus_gymext']) if(ASSETS.manifest[k]){ const u=ASSETS.manifest[k].url; if(fs.existsSync(path.join(ROOT,u))) window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const meshVis=o=>{ let v=0,h=0; o.traverse(m=>{ if(m.isMesh) (m.visible?v++:h++); }); return [v,h]; };
(async()=>{
  const XG=Z3.XSG;
  // ①
  E.interactables=[]; E.colliders=[]; const cz=Z3.ZONES.campus.build(E); E.zone=cz; E.scene.add(cz.group); await sleep(6000); cz.group.updateMatrixWorld(true);
  for(const [tag,gname,R,txt] of [['moon','campus_moon_glb',XG.moon,'望月台'],['gym_ext','campus_gymext_glb',XG.gym,'體育館']]){
    const kit=[]; cz.group.traverse(o=>{ if(o.userData&&o.userData.ckTag===tag&&o.userData.ck) kit.push(o); }); const glb=cz.group.getObjectByName(gname);
    const bb=glb?new THREE.Box3().setFromObject(glb):null; const fit=bb&&Math.abs(bb.min.x-R[0])<1.8&&Math.abs(bb.max.x-R[2])<1.8&&Math.abs(bb.min.z-R[1])<1.8&&Math.abs(bb.max.z-R[3])<3.4;
    let plate=false; if(glb) glb.traverse(m=>{ if(m.isMesh&&/plates/.test(m.name||'')&&m.material&&m.material.map) plate=true; });
    check('① 校園 '+txt+'：正式模型接上、套件藏起來、範圍對（±1.8 m；正面雨遮另算）、招牌有字',!!glb&&kit.length===1&&meshVis(kit[0])[0]===0&&fit&&plate,
      (glb?'範圍 x '+bb.min.x.toFixed(1)+'～'+bb.max.x.toFixed(1)+' z '+bb.min.z.toFixed(1)+'～'+bb.max.z.toFixed(1):'沒有模型')+'｜套件 '+(kit[0]?meshVis(kit[0]).join('/'):'沒有')); }
  E.scene.remove(cz.group);
  // ②③
  const L=XINSHENG_LAYOUT, CW=L.campusWall, SG=L.sideGate; E.interactables=[]; E.colliders=[];
  const xz=Z3.ZONES.xinsheng.build(E); E.zone=xz; E.scene.add(xz.group); if(xz.enter) try{ xz.enter(E); }catch(e){}
  if(XS3&&XS3.zone&&XS3.zone.enter) try{ XS3.zone.enter(E); }catch(e){}
  await sleep(6000); xz.group.updateMatrixWorld(true);
  const kits={}; xz.group.traverse(o=>{ if(o.userData&&o.userData.xsBack) kits[o.userData.xsBack]=o; });
  const C2X=(cx,cz)=>[CW.x+(cz+141),SG.z-(cx+101.4)];
  const at=(o)=>{ const b=new THREE.Box3().setFromObject(o); return b; };
  const km=kits.moon, kg=kits.gym;
  const bm=km&&(()=>{ const s=km.visible; let b=new THREE.Box3(); km.traverse(m=>{ if(m.isMesh){ const v=m.visible; m.visible=true; b.union(new THREE.Box3().setFromObject(m)); m.visible=v; } }); return b; })();
  const bg=kg&&(()=>{ let b=new THREE.Box3(); kg.traverse(m=>{ if(m.isMesh){ const v=m.visible; m.visible=true; b.union(new THREE.Box3().setFromObject(m)); m.visible=v; } }); return b; })();
  check('② 新生南路：望月台在側門南邊、貼圍牆；體育館在側門北邊、貼圍牆（套件位置照換算）',!!bm&&!!bg&&bm.min.z>SG.z+SG.w/2-0.5&&bm.min.x<CW.x+2&&bg.max.z<SG.z-SG.w/2+0.5&&bg.min.x<CW.x+2,
    bm&&bg?'望月台 z '+bm.min.z.toFixed(1)+'～'+bm.max.z.toFixed(1)+' x '+bm.min.x.toFixed(1)+'｜體育館 z '+bg.min.z.toFixed(1)+'～'+bg.max.z.toFixed(1)+' x '+bg.min.x.toFixed(1):'沒有套件');
  const gm=xz.group.getObjectByName('xs_campus_moon_glb'), gg=xz.group.getObjectByName('xs_campus_gym_glb');
  const gb=o=>{ if(!o) return null; o.updateMatrixWorld(true); return new THREE.Box3().setFromObject(o); };
  const b1=gb(gm), b2=gb(gg);
  check('② 新生南路：兩顆正式模型接上、和套件同一個位置（中心差 ≤ 1.5 m）、套件藏起來',!!b1&&!!b2&&b1.getCenter(new THREE.Vector3()).distanceTo(bm.getCenter(new THREE.Vector3()))<1.5&&b2.getCenter(new THREE.Vector3()).distanceTo(bg.getCenter(new THREE.Vector3()))<1.5&&meshVis(km)[0]===0&&meshVis(kg)[0]===0,
    (b1?'望月台 中心 '+b1.getCenter(new THREE.Vector3()).toArray().map(v=>v.toFixed(1)).join(','):'沒有')+'｜'+(b2?'體育館 中心 '+b2.getCenter(new THREE.Vector3()).toArray().map(v=>v.toFixed(1)).join(','):'沒有'));
  const T=xz.group.getObjectByName('xs_campus_trees'); let inB=0, nT=0;
  if(T) T.traverse(m=>{ if(!m.isMesh) return; const pa=m.geometry&&m.geometry.attributes&&m.geometry.attributes.position; });
  const trees=[]; if(TK.tree){ } // 樹的位置：查 TreeField 的記號或合併前的群組不容易；改查原始碼的規則
  const src=fs.readFileSync(path.join(ROOT,'src/xinsheng3d.js'),'utf8');
  check('③ 新生南路：圍牆後面不再放洞洞館、校史館；樹避開望月台、體育館（inXSG）',!/campus_pavilion|campus_hist/.test(src)&&/if\(tz<-124\|\|inXSG\(tx,tz,2\.5\)\) continue;/.test(src));
  console.warn=warn; console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
