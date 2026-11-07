const G=process.env.GW; process.chdir(G);
const {preload,ROOT}=require(G+'/tools/dev_scratch/spring_sim/harness.js');
const fs=require('fs'), path=require('path'), vm=require('vm');
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.innerWidth=844; global.innerHeight=390; global.location={search:''}; global.addEventListener=()=>{}; process.on('unhandledRejection',()=>{});
const w0=console.warn; console.warn=(...a)=>{ if(/LOD|Missing/.test(String(a[0]))) return; w0(...a); };
const ZN=process.argv[2]||'xs_dakou';
const files=['src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/data/calendar.js','src/data/places.js','src/zones3d.js','src/data/xinsheng_layout.js','src/xinsheng3d.js','src/data/dakou_layout.js','src/dakou3d.js'];
for(const f of fs.readdirSync(path.join(ROOT,'src'))) if(/^(xs_|xsports|haopai|dabu)/.test(f)) files.push('src/'+f);
for(const f of fs.readdirSync(path.join(ROOT,'src/data'))) if(/^(xs_|haopai|dabu|xsports)/.test(f)) files.push('src/data/'+f);
for(const f of files) if(fs.existsSync(path.join(ROOT,f))) { try{ run(f); }catch(e){ console.log('load err',f,e.message); } }
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
  window.ASSET_DATA=window.ASSET_DATA||{}; for(const k of Object.keys(ASSETS.manifest)){ const m=ASSETS.manifest[k]; if(m&&m.url&&/xs_|dakou|dabu|haopai/.test(k+m.url)&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; global.GAME={G:{zone:ZN,day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{}}};
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  if(!Z3.ZONES[ZN]){ console.log('no zone',ZN,Object.keys(Z3.ZONES).filter(k=>/^xs_/.test(k))); process.exit(1); }
  const z=Z3.ZONES[ZN].build(E); E.zone=z; E.scene.add(z.group);
  E.player={obj:{position:new THREE.Vector3(0,0,6),rotation:{y:0}},radius:0.32,lv:0};
  for(let i=0;i<150;i++){ await sleep(100); let n=0; z.group.traverse(o=>{ if(/^VIEWPANE_/.test(o.name||'')) n++; }); if(n) break; } await sleep(500);
  const cam=new THREE.PerspectiveCamera(46,2,0.1,200);
  const show=(tag)=>{ z.group.updateMatrixWorld(true); z.group.traverse(o=>{ if(!/^VIEWPANE_/.test(o.name||'')) return; const chain=[]; let vis=true; for(let p=o;p;p=p.parent){ chain.push((p.name||p.type)+(p.visible?'':'(HIDDEN)')); if(!p.visible) vis=false; }
      const wp=new THREE.Vector3(); o.getWorldPosition(wp); const u=o.material.uniforms||{};
      console.log(tag, o.name, 'world', wp.toArray().map(v=>+v.toFixed(2)).join(','), 'visible', vis, 'chain', chain.join('<'), 'photo', u.photo&&u.photo.value, 'map', !!(u.map&&u.map.value), 'layers', o.layers.mask, 'frustumCulled', o.frustumCulled, 'ro', o.renderOrder); }); };
  show('built');
  console.log('winParts', (z.winParts||[]).length, (z.winParts||[]).map(p=>(p.obj.name||p.obj.type)+'@'+p.at.toArray().map(v=>+v.toFixed(2)).join(',')+' dir '+p.dir.toArray().map(v=>+v.toFixed(2)).join(',')).join(' | '));
  { const sp=z.spawn; const fc=new THREE.PerspectiveCamera(46,2,0.1,200); const cd=Z3.ZONES[ZN].camDist||4.2; fc.position.set(sp.x+Math.sin((sp.yaw||0)+Math.PI)*cd, 1.6+1.2, sp.z+Math.cos((sp.yaw||0)+Math.PI)*cd); fc.lookAt(sp.x,1.2,sp.z); fc.updateMatrixWorld(true);
    E.player.obj.position.set(sp.x,0,sp.z); E.player.lv=0; if(z.fadeWalls) z.fadeWalls(fc,E.player.obj.position); show('FOLLOWCAM@'+fc.position.toArray().map(v=>+v.toFixed(2)).join(',')+' spawnYaw '+sp.yaw);
    const c0=new THREE.Vector3(); let vp0=null; z.group.traverse(o=>{ if(/^VIEWPANE_/.test(o.name||'')&&!vp0) vp0=o; }); vp0.getWorldPosition(c0); const eye=c0.clone().add(new THREE.Vector3(0,-0.1,-3.5)); cam.position.copy(eye); cam.lookAt(c0); cam.updateMatrixWorld(true);
    show('CCSHOT-paused(no fadeWalls)'); if(z.fadeWalls) z.fadeWalls(cam,E.player.obj.position); show('CCSHOT+fadeWalls'); }
  const vp=[]; z.group.traverse(o=>{ if(/^VIEWPANE_/.test(o.name||'')) vp.push(o); });
  for(const o of vp){ const c=new THREE.Vector3(); o.getWorldPosition(c); const d=new THREE.Vector3(0,0,1).applyQuaternion(o.getWorldQuaternion(new THREE.Quaternion())); const eye=c.clone().addScaledVector(d,3.5); eye.y=c.y-0.1;
    cam.position.copy(eye); cam.lookAt(c); cam.updateMatrixWorld(true);
    E.player.lv=c.y>3?1:0; E.player.obj.position.set(eye.x,c.y>3?3.6:0,eye.z);
    if(z.update) z.update(0.016,E); if(z.fadeWalls) z.fadeWalls(cam,E.player.obj.position); if(E.updateLevelVis) try{ E.updateLevelVis(); }catch(e){}
    show('cam@'+eye.toArray().map(v=>+v.toFixed(2)).join(',')+' for '+o.name);
    const fr=new THREE.Frustum().setFromProjectionMatrix(new THREE.Matrix4().multiplyMatrices(cam.projectionMatrix,cam.matrixWorldInverse)); o.geometry.computeBoundingSphere(); const bs=o.geometry.boundingSphere.clone().applyMatrix4(o.matrixWorld); console.log('  in frustum', fr.intersectsSphere(bs));
    const rc=new THREE.Raycaster(cam.position.clone(), c.clone().sub(cam.position).normalize()); const hits=rc.intersectObject(z.group,true).filter(h=>{ for(let p=h.object;p;p=p.parent) if(!p.visible) return false; return true; }).slice(0,12); console.log('  ray hits', hits.map(h=>h.object.name+'('+(h.object.material&&h.object.material.name)+')@'+h.distance.toFixed(2)+(h.object.material&&h.object.material.transparent?' T'+(h.object.material.opacity):'')).join(' | ')); }
  process.exit(0);
})();
