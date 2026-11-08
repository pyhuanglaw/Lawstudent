// 溫州街店內（一盞、木曜日）：白天／晚上看得到的網格、投影子的網格、燈（Node，不算圖）
const {ROOT}=require(process.env.WT+'/tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing|載入失敗/.test(String(a[0]))) return; w0(...a); };
const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const srcs=[...idx.matchAll(/<script src="(src\/[^"?]+)/g)].map(m=>m[1]);
const want=['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/zones3d.js'];
for(const f of srcs) if(/wz_|wenzhou|mokuyobi|yizhan|teahouse/.test(f)&&!want.includes(f)) want.push(f);
for(const f of want) if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('skip',f,e.message.slice(0,80)); }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  window.ASSET_DATA={}; for(const k of Object.keys(ASSETS.manifest)){ const m=ASSETS.manifest[k]; if(/^bldg\.(wz_|yizhan|mokuyobi)/.test(k)&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  for(const id of (process.env.ZONES||'wz_teahouse,wz_mokuyobi').split(',')){
    global.GAME={G:{zone:id,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
    if(!Z3.ZONES[id]){ console.log('no zone',id); continue; }
    const z=Z3.ZONES[id].build(E); E.zone=z; E.scene.add(z.group); E.player={obj:{position:new THREE.Vector3(0,0,3),rotation:{y:0}},radius:0.32,lv:0};
    for(let i=0;i<80&&!z.formal;i++) await sleep(100); await sleep(500);
    const stat=h=>{ if(z.applyTime) z.applyTime(h,'clear'); z.group.updateMatrixWorld(true); let vis=0,cast=0,castTri=0,tri=0,lights=0,shL=0; const castN={};
      const shown=o=>{ for(let p=o;p;p=p.parent) if(p.visible===false) return false; return true; };
      z.group.traverse(o=>{ if(o.isLight){ lights++; if(o.castShadow) shL++; } if(!o.isMesh||!shown(o)) return; const g=o.geometry, t=g.index?g.index.count/3:(g.attributes.position?g.attributes.position.count/3:0); const nm=[].concat(o.material).length; vis+=nm; tri+=t*(o.isInstancedMesh?o.count:1);
        if(o.castShadow){ cast+=nm; castTri+=t*(o.isInstancedMesh?o.count:1); const k=(o.name||o.parent&&o.parent.name||'?').slice(0,24); castN[k]=(castN[k]||0)+1; } });
      return {vis,tri:Math.round(tri),cast,castTri:Math.round(castTri),lights,shL,castN:Object.entries(castN).sort((a,b)=>b[1]-a[1]).slice(0,8)}; };
    console.log(id,'formal',z.formal,'\n 14:00',JSON.stringify(stat(14)),'\n 19:30',JSON.stringify(stat(19.5)));
    E.scene.remove(z.group);
  }
  process.exit(0);
})();
