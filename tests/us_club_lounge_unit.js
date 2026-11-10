// 會所交誼廳的門（US-CLUB-LOUNGE-CLOSE-1110，LAWWW 11-10 17:15；AA：12/14 晚上 18:30～21:30 沒排晚餐的玩家走進會所，交誼廳的門關著，門廳、自習室照常）——不需要瀏覽器。
// 在 Node 照 index.html 的順序載入程式，建出 us_clubhouse_in（E.simWalk 走路）：
//   1. 平常：從門廳走得進交誼廳；門口的「看」藏著；鏡頭牆沒有門板那一片
//   2. z.setLoungeClosed(true)：門口走不過去（交誼廳走不到）、門廳和自習室照常走得到；門口一個「看」（今晚交誼廳有聚餐。）；鏡頭牆多一片門板
//   3. z.setLoungeClosed(false)：導航和原本一格都不差、走得進去；「看」藏起來、鏡頭牆那一片拿掉
//   4. 玩家已經在交誼廳裡：不關（回傳 false、走得出來；D36）
//   5. 正式模型：GLB 有 LOUNGE_DOOR（底下有網格、平常藏著、關門時看得到）；門板擋滿門口（z 範圍、高 ≥ 2 m）
// 用法：node tests/us_club_lounge_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/us_layouts.js','src/us3d.js','src/data/us_clubhouse_layout.js','src/us_clubhouse3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
function parseGLB(file){ const b=fs.readFileSync(file); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const binLen=b.readUInt32LE(20+n); const bin=b.slice(20+n+8,20+n+8+binLen);
  for(const m of J.materials||[]){ const p=m.pbrMetallicRoughness||{}; for(const k of ['baseColorTexture','metallicRoughnessTexture']) delete p[k]; for(const k of ['normalTexture','occlusionTexture','emissiveTexture']) delete m[k]; }
  delete J.textures; delete J.images; delete J.samplers; delete J.extensionsRequired; if(J.extensionsUsed) J.extensionsUsed=J.extensionsUsed.filter(e=>!/texture|KTX|webp/i.test(e));
  const js=Buffer.from(JSON.stringify(J)); const jb=Buffer.concat([js,Buffer.alloc((4-js.length%4)%4,0x20)]); const bb=Buffer.concat([bin,Buffer.alloc((4-bin.length%4)%4)]);
  const h=Buffer.alloc(12); h.write('glTF',0); h.writeUInt32LE(2,4); h.writeUInt32LE(12+8+jb.length+8+bb.length,8); const c1=Buffer.alloc(8); c1.writeUInt32LE(jb.length,0); c1.write('JSON',4); const c2=Buffer.alloc(8); c2.writeUInt32LE(bb.length,0); c2.writeUInt32LE(0x004E4942,4);
  const out=Buffer.concat([h,c1,jb,c2,bb]); return new Promise((res,rej)=>new THREE_JSM.GLTFLoader.GLTFLoader().parse(out.buffer.slice(out.byteOffset,out.byteOffset+out.length),'',g=>res(g),rej)); }
const GLBF=path.join(ROOT,ASSETS.manifest['bldg.us_clubhouse'].url);
ASSETS.loadOne=k=>k==='bldg.us_clubhouse'?parseGLB(GLBF).then(g=>({scene:g.scene})):new Promise(()=>{});
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
function loadZone(){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.us_clubhouse_in.build(E); E.zone=z; E.levels=null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(1,0,3.2),rotation:{y:0}},radius:0.32,lv:0}; return z; }
const walk=(a,b)=>{ for(const dt of [1/30,0.1]){ const r=E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt}); if(!r.ok) return r; } return {ok:true}; };
(async()=>{
  const z=loadZone(); check('z.setLoungeClosed 存在',typeof z.setLoungeClosed==='function'); if(typeof z.setLoungeClosed!=='function'){ console.log(`FAILED: ${fails}`); process.exit(1); }
  for(let i=0;i<300&&!z.formal;i++) await new Promise(r=>setTimeout(r,20));
  const L=US_CLUBHOUSE_LAYOUT, SP=[L.spawn.x,L.spawn.z], LOUNGE=[-6,0], STUDY=[7,1], cc=z.camCols[0], n0=cc.length, b0=Uint8Array.from(z.nav.b);
  const look=()=>E.interactables.find(i=>i.usClubLook==='lounge_closed'); const door=()=>{ let d=null; z.group.traverse(o=>{ if(o.name==='LOUNGE_DOOR') d=o; }); return d; };
  check('1. 平常：從門廳走得進交誼廳',walk(SP,LOUNGE).ok);
  check('1. 平常：門口的「看」藏著、正式模型的門板藏著',!!look()&&look().hidden===true&&!!door()&&door().visible===false);
  const r1=z.setLoungeClosed(true);
  check('2. 關門：回傳 true；交誼廳走不到、門廳和自習室照常走得到',r1===true&&!walk(SP,LOUNGE).ok&&walk(SP,STUDY).ok&&walk(SP,[1,1.2]).ok);
  check('2. 關門：門口有「看」（今晚交誼廳有聚餐。）、門板看得到、鏡頭牆多一片',look().hidden===false&&look().look==='今晚交誼廳有聚餐。'&&door().visible===true&&cc.length===n0+1);
  const lk=look(); check('2. 「看」站得到（門廳這一邊、從出生點走得到）',walk(SP,[lk.x+0.3,lk.z]).ok);
  const r2=z.setLoungeClosed(false); let same=true; for(let i=0;i<b0.length;i++) if(z.nav.b[i]!==b0[i]){ same=false; break; }
  check('3. 開門：導航和原本一格都不差、走得進去；「看」、門板、鏡頭牆那一片都拿掉',r2===true&&same&&walk(SP,LOUNGE).ok&&look().hidden===true&&door().visible===false&&cc.length===n0);
  E.player.obj.position.set(-5,0,0); const r3=z.setLoungeClosed(true);
  check('4. 玩家已經在交誼廳裡：不關（回傳 false），走得回門廳',r3===false&&z.loungeClosed===false&&walk([-5,0],SP).ok);
  E.player.obj.position.set(1,0,3.2);
  { const b=fs.readFileSync(GLBF); const n=b.readUInt32LE(12); const J=JSON.parse(b.slice(20,20+n).toString()); const g=J.nodes.find(x=>x.name==='LOUNGE_DOOR');
    const ms=(g&&g.children||[]).map(i=>J.nodes[i]).filter(x=>x.mesh!=null); let lo=[1e9,1e9,1e9],hi=[-1e9,-1e9,-1e9]; for(const nd of ms) for(const pr of J.meshes[nd.mesh].primitives){ const a=J.accessors[pr.attributes.POSITION]; for(let k=0;k<3;k++){ lo[k]=Math.min(lo[k],a.min[k]); hi[k]=Math.max(hi[k],a.max[k]); } }
    const lf=L.walls.find(w=>w.id==='lf'), op=lf.open.find(o=>o[2]==='opening');
    check('5. GLB：LOUNGE_DOOR 有網格、擋滿門口（z '+op[0]+'～'+op[1]+'、x 在牆線上、高 ≥ 2 m）',ms.length>0&&lo[2]<=op[0]+0.03&&hi[2]>=op[1]-0.03&&Math.abs((lo[0]+hi[0])/2-lf.at)<0.06&&hi[1]>=2.0,JSON.stringify([lo,hi].map(v=>v.map(x=>+x.toFixed(2))))); }
  console.log(fails?`FAILED: ${fails}`:'ALL PASS'); process.exit(fails?1:0);
})();
