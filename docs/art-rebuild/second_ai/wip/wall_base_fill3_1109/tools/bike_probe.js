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
const end=all.indexOf('src/teach3d.js'); const files=['lib/three.bundle.js','lib/three.jsm.bundle.js',...all.slice(0,end+1),'src/data/calendar.js','src/data/places.js','src/bike3d.js','src/bikeshop3d.js'];
const run=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of files){ if(fs.existsSync(path.join(ROOT,f))) try{ run(f); }catch(e){ console.log('（載入 '+f+' 失敗：'+e.message.slice(0,80)+'）'); } }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; window.ASSET_DATA={};
const lo=ASSETS.loadOne; ASSETS.loadOne=function(k){ const m=ASSETS.manifest[k]; if(m&&m.url&&!window.ASSET_DATA[m.url]&&fs.existsSync(path.join(ROOT,m.url))) window.ASSET_DATA[m.url]=fs.readFileSync(path.join(ROOT,m.url)).toString('base64'); return lo.apply(this,arguments); };
global.GAME={G:{zone:'',day:30,hour:14,flags:{},money:5000,weather:'clear',visited:{},year:1,stats:{}}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
const shown=o=>{ for(let p=o;p;p=p.parent) if(!p.visible) return false; return true; };
(async()=>{ try{ const id='bikeshop'; E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; GAME.G.zone=id;
 const Zd=Z3.ZONES[id]; E.indoor=!!Zd.indoor; const z=Zd.build(E); E.zone=z; E.nav=z.nav; E.scene.add(z.group);
 for(let i=0;i<150;i++){ await sleep(100); if(z.formal) break; } await sleep(500); z.group.updateMatrixWorld(true);
 const P=new THREE.Vector3(-3.9,0,-0.4); E.player={obj:{position:P,rotation:{y:0}},radius:0.32,lv:0}; if(!E.ray) E.ray=new THREE.Raycaster();
 const head=new THREE.Vector3(P.x,1.45,P.z), o3=new THREE.Vector3(), cam=new THREE.PerspectiveCamera(50,844/390,0.05,200);
 for(let k=0;k<2;k++){ E.followCam(head,270*Math.PI/180,0.38,Zd.camDist||4,0,o3); cam.position.copy(o3); cam.lookAt(head); cam.updateMatrixWorld(true); z.fadeWalls(cam,P); if(E.hideFaded) E.hideFaded(); }
 console.log('鏡頭',cam.position.toArray().map(v=>v.toFixed(2)).join(','),'店',JSON.stringify(z.bounds));
 const vis=[]; z.group.traverse(m=>{ if(m.isMesh&&shown(m)) vis.push(m); }); const rc=new THREE.Raycaster(); const cnt={}, uvs=[];
 for(let i=-10;i<=0;i++) for(let j=-5;j<=5;j++){ const ndc=new THREE.Vector3(i/10,j/5,0.5).unproject(cam).sub(cam.position).normalize(); rc.set(cam.position,ndc); const h=rc.intersectObjects(vis,false); const k=h.length?h[0].object.name+'｜lm='+!!(h[0].object.material&&h[0].object.material.lightMap)+'｜'+(h[0].object.material&&h[0].object.material.name):'（天空）'; cnt[k]=(cnt[k]||0)+1; if(h.length&&/partition/.test(h[0].object.name)&&h[0].uv1) uvs.push([+h[0].uv1.x.toFixed(4),+h[0].uv1.y.toFixed(4),+h[0].point.x.toFixed(2),+h[0].point.y.toFixed(2),+h[0].point.z.toFixed(2),h[0].face?+h[0].face.normal.x.toFixed(2):0]); }
 console.log('UVS '+JSON.stringify(uvs.slice(0,12))); for(const [k,v] of Object.entries(cnt).sort((a,b)=>b[1]-a[1]).slice(0,10)) console.log(v,k);
 }catch(e){ console.log('ERR',e.stack); } process.exit(0); })();
