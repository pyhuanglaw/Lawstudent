// #204 站位（BB-B 23:33）：被蓋住的那一塊，玩家站哪裡、鏡頭轉幾度，遊戲的鏡頭（followCam、室內俯角 0.38、區域 camDist）＋牆淡出以後看得到它——不需要瀏覽器（D131）
// 用法：ROOT=<repo> node station.js targets.json
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=process.env.ROOT||'/home/user/Lawstudent';
global.window=global; global.self=global;
class FakeImg{ constructor(){ this._l={}; this.width=4; this.height=4; } addEventListener(t,f){ this._l[t]=f; } removeEventListener(){} set src(v){ this._src=v; setTimeout(()=>{ this._l.load&&this._l.load({}); },0); } get src(){ return this._src; } }
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:(ns,n)=>n==='img'?new FakeImg():{getContext:()=>ctx2d,style:{}}, createElement:(n)=>n==='canvas'?{width:1,height:1,getContext:()=>ctx2d,style:{}}:new FakeImg(), getElementById:()=>null, addEventListener(){}, querySelector:()=>null };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
process.on('unhandledRejection',()=>{}); console.warn=()=>{};
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const all=[...html.matchAll(/src="(src\/[^"?]+\.js)/g)].map(m=>m[1]);
const end=all.indexOf('src/teach3d.js'); const files=['lib/three.bundle.js','lib/three.jsm.bundle.js',...all.slice(0,end+1),'src/data/calendar.js','src/data/places.js'];
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of files){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message.slice(0,80)+'）'); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; window.ASSET_DATA={};
const lo=ASSETS.loadOne; ASSETS.loadOne=function(k){ const m=ASSETS.manifest[k]; if(m&&m.url&&!window.ASSET_DATA[m.url]&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); return lo.apply(this,arguments); };
global.GAME={G:{zone:'',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{},year:1,stats:{}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
const T=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); const out=[];
(async()=>{ let curZone=null, z=null;
 for(const t of T){ try{
  if(curZone!==t.zone){ if(z&&z.group) E.scene.remove(z.group); E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; GAME.G.zone=t.zone;
    const Zd=Z3.ZONES[t.zone]; if(!Zd){ console.log(t.zone,'沒有這個區域'); continue; } E.indoor=!!Zd.indoor; z=Zd.build(E); z.def=Zd; E.zone=z; E.levels=z.levels||null; E.nav=z.nav; E.scene.add(z.group); curZone=t.zone;
    for(let i=0;i<200;i++){ await sleep(100); let f=false; z.group.traverse(o=>{ if(o.name===t.surf||o.name===t.wall) f=true; }); if(f&&(z.formal||i>60)) break; } await sleep(500); }
  z.group.updateMatrixWorld(true); const Zd=z.def, pitch=Zd.indoor?0.38:0.22, dist=Zd.camDist||4.0;
  const walls=[], surfs=[], hit=(o,nm)=>{ for(let p=o,i=0;p&&i<3;p=p.parent,i++){ const pn=p.name||''; if(pn===nm||pn.startsWith(nm+'_')) return true; } return false; }; z.group.traverse(o=>{ if(!o.isMesh) return; if(hit(o,t.wall)) walls.push(o); if(hit(o,t.surf)) surfs.push(o); });
  const tp=new THREE.Vector3(...t.c); let inBox=false; const bb=new THREE.Box3(); for(const s of surfs){ bb.setFromObject(s).expandByScalar(0.15); if(bb.containsPoint(tp)) inBox=true; }
  const nav=(z.levels&&z.levels[0])||z.nav; if(!E.ray) E.ray=new THREE.Raycaster(); const rc=new THREE.Raycaster(), cam=new THREE.PerspectiveCamera(50,844/390,0.05,200), o3=new THREE.Vector3();
  const P=new THREE.Vector3(); E.player={obj:{position:P,rotation:{y:0}},radius:0.32,lv:0};
  const wd=new THREE.Vector3(...t.dir); let best=null, tried=0; const cnt={free:0,wallHidden:0,angle:0,ray:0}; const MAXANG=+(process.env.MAXANG||28);
  for(let dx=-4;dx<=4.001;dx+=0.25) for(let dz=-4;dz<=4.001;dz+=0.25){ const x=+(t.c[0]+dx).toFixed(2), zz=+(t.c[2]+dz).toFixed(2); if(!nav.free(x,zz)||!nav.clear(x,zz,0.32)) continue; cnt.free++;
    const y=nav.heightAt(x,zz); P.set(x,y,zz); const head=new THREE.Vector3(x,y+1.45,zz);
    for(let deg=0;deg<360;deg+=15){ tried++; let res; for(let k=0;k<2;k++){ res=E.followCam(head,deg*Math.PI/180,pitch,dist,0,o3); cam.position.copy(o3); cam.lookAt(head); cam.updateMatrixWorld(true); z.fadeWalls(cam,P); if(E.hideFaded) E.hideFaded(); }
      if(walls.some(w=>shown(w))) continue; cnt.wallHidden++;
      const fwd=head.clone().sub(cam.position).normalize(), toT=tp.clone().sub(cam.position), L=toT.length(); toT.normalize(); const ang=Math.acos(Math.max(-1,Math.min(1,fwd.dot(toT))))*180/Math.PI; if(ang>MAXANG) continue; cnt.angle++;
      const vis=[]; z.group.traverse(m=>{ if(m.isMesh&&shown(m)) vis.push(m); }); rc.set(cam.position,toT); rc.far=L+0.05; rc.near=0.05; const h=rc.intersectObjects(vis,false);
      const hitT=h.length?h[0]:null; if(!hitT||hitT.distance<L-0.08){ if(hitT&&!cnt.blk) cnt.blk=hitT.object.name+'@'+hitT.distance.toFixed(2)+'/'+L.toFixed(2); continue; } cnt.ray++;
      const lat=Math.hypot(x-t.c[0],zz-t.c[2]), sc=ang+lat*3; if(!best||sc<best.sc) best={sc,x,z:zz,y:+y.toFixed(2),yaw:deg,ang:+ang.toFixed(1),camDist:+res.dist.toFixed(2),cam:cam.position.toArray().map(v=>+v.toFixed(2)),hit:hitT.object.name}; } }
  const r={label:t.label,zone:t.zone,wall:t.wall,surf:t.surf,target:t.c,surfFound:surfs.length,wallFound:walls.length,targetInSurf:inBox,pitch,dist,tried,cnt,best};
  out.push(r); console.log(JSON.stringify(r));
 }catch(e){ console.log(t.label,'ERR',e.stack.split('\n').slice(0,3).join(' | ')); } }
 fs.writeFileSync(process.argv[3]||'/dev/null',JSON.stringify(out,null,1)); process.exit(0); })();
