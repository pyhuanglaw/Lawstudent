// 2:30 AM 室內（cafe）的 ?nobldg、溫州街導航格、拱門卡座——不需要瀏覽器（D131）。CC 在 PC 跑 tests/cafe_glb_integration.py（d432de8ba）、
// seats_on_furniture.py、reachability_all.py 的四個失敗，這裡用 Node 重現、驗修好：
//   N  ?nobldg（不載正式模型的備用模式）：cafe 區域不登錄、不載 bldg.cafe230_interior，照舊是程序化備用模型。
//      原因：assets3d.js 只在開機時刪 manifest 的 bldg.*；zones3d.js 的 cafe230Reg 是進店時才把 bldg.cafe230_interior 加回 manifest，?nobldg 也照載。
//      一般網址照舊會載、接上以後 zone.formal、備用模型藏起來。
//   W  溫州街導航格：正式模型接上＝程序化版＋門口雜物的阻擋（Z3.PROP_BLOCKS.wenzhou，2a67b1443 起「模型接上時才擋」，tests/street_props_nav_unit.js、
//      wz_street_integration.py 的標準）；建區域當下（模型還沒接）兩種模式完全相同；cafe 店內導航格兩種模式完全相同。
//      cafe_glb_integration.py 原本要求溫州街「完全相同」——2026-10-22 起就不成立（差的就是這些雜物格；42467c2dc 加日常失速立牌以後是 18 格），改成同一個標準。
//   S  拱門卡座（cafe230_layout.js seats 17、18「坐卡座」）：正式模型 cafe230.glb 的卡座坐墊在 x −6.52～−6.13（座面 0.48 m）、靠背在 −6.66～−6.55（頂 1.05 m）；
//      原本座位點 x −6.55 正好在靠背上（seats_on_furniture 量到 1.05 m），導航阻擋只到 x −6.4（坐墊前緣 0.27 m 沒擋、人會踩進沙發），
//      走近點落在卡座和小圓桌之間 0.35 m 寬的縫裡（reachability_all 卡在 (−6.07,−0.63)）。
//      S1 座位點從上往下打 GLB（中心＋前後左右 7 cm 取最高）：座面在地面＋0.30～0.65
//      S1b 往前、往兩側肩膀高度 0.45 m 內沒有東西
//      S2 GLB 卡座坐墊、靠背底下的格子都擋住（人不會踩進沙發）
//      S3 「坐卡座」走近點（遊戲的 GM.seatApproach）：站得住、在按鈕範圍裡、站那裡最近的按鈕是它自己、從出生點走得到（E.simWalk dt 1/30、0.1）
//      S4 店內沒有新的小孤島（tools/dev_scratch/nav_islands.py 同一個做法：0.1 m 取樣 canStand 0.3，面積 < 0.5 m² 而且離主要區域 1.5 m 內）
// 修改前（開發分支 ff1283943）：N1、N2、W3、S1、S2、S3 FAIL。
// 用法：node tests/cafe230_nobldg_nav_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
const rd=p=>fs.readFileSync(path.join(ROOT,p),'utf8'), J=x=>JSON.stringify(x), r2=v=>+(+v).toFixed(2);
const MODE=process.argv[2]==='nob'?'nob':'main';
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };

global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:MODE==='nob'?'?nobldg':''};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); console.warn=()=>{};
// index.html 的載入順序（遊戲層 game3d、story3d 不載：這裡只建區域）
const scripts=[...rd('index.html').matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>!/^src\/(game3d|story3d)\.js$/.test(f));
for(const f of scripts){ if(!fs.existsSync(path.join(ROOT,f))) continue; let src=rd(f); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); try{ vm.runInThisContext(src,{filename:f}); }catch(e){} }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
global.GAME=global.GAME||{}; GAME.G={zone:'cafe',day:30,hour:17.5,flags:{},money:5000,weather:'clear'}; GAME.E=E;
// 遊戲的「坐下」走近點：照 game3d.js 原文（seatApproach 只用到 E）
const SA=(()=>{ const s=rd('src/game3d.js'), a=s.indexOf('function seatApproach('), b=s.indexOf('GM.seatApproach=seatApproach;'); return new Function('E',s.slice(a,b)+'\nreturn seatApproach;')(E); })();

/* 自己讀 GLB（tests/dorm_seethru_unit.js 同一個做法）：節點名字、父子、TRS；網格只放位置、索引；材質名照 GLB */
function glbScene(file){ const b=fs.readFileSync(file), jl=b.readUInt32LE(12), JS=JSON.parse(b.slice(20,20+jl).toString('utf8')), bin=b.slice(20+jl+8);
  const acc=i=>{ const a=JS.accessors[i], v=JS.bufferViews[a.bufferView], n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4}[a.type], off=(v.byteOffset||0)+(a.byteOffset||0);
    const T={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array}[a.componentType]; return new T(bin.buffer.slice(bin.byteOffset+off,bin.byteOffset+off+a.count*n*T.BYTES_PER_ELEMENT)); };
  const mats=(JS.materials||[]).map(m=>{ const t=new THREE.MeshStandardMaterial({side:THREE.DoubleSide}); t.name=m.name||''; return t; });
  const objs=JS.nodes.map(nd=>{ let o;
    if(nd.mesh!=null){ const prs=JS.meshes[nd.mesh].primitives.map(pr=>{ const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.BufferAttribute(acc(pr.attributes.POSITION),3)); if(pr.indices!=null) g.setIndex(new THREE.BufferAttribute(acc(pr.indices),1));
        return new THREE.Mesh(g,pr.material!=null?mats[pr.material]:new THREE.MeshStandardMaterial()); });
      if(prs.length===1) o=prs[0]; else { o=new THREE.Group(); for(const q of prs) o.add(q); } }
    else o=new THREE.Object3D();
    o.name=nd.name||''; if(nd.extras) o.userData=JSON.parse(JSON.stringify(nd.extras)); if(nd.translation) o.position.fromArray(nd.translation); if(nd.rotation) o.quaternion.fromArray(nd.rotation); if(nd.scale) o.scale.fromArray(nd.scale); return o; });
  JS.nodes.forEach((nd,i)=>{ for(const c of nd.children||[]) objs[i].add(objs[c]); });
  const sc=new THREE.Group(); for(const r of JS.scenes[JS.scene||0].nodes) sc.add(objs[r]); sc.updateMatrixWorld(true); return sc; }

const L=typeof CAFE230_LAYOUT!=='undefined'?CAFE230_LAYOUT:null;
const CAFE_GLB=L&&path.join(ROOT,L.glb);
const loads=[]; let pend=[];
ASSETS.loadOne=k=>{ loads.push(k); let p;
  if(k==='bldg.cafe230_interior'&&CAFE_GLB&&fs.existsSync(CAFE_GLB)) p=Promise.resolve({scene:glbScene(CAFE_GLB)});
  else if(k==='bldg.wenzhou_street') p=Promise.resolve({scene:new THREE.Group()});   /* 街景正式模型：當作已經載好（空的場景），讓區域的接法跑完（tests/street_props_nav_unit.js 同一個做法）*/
  else return new Promise(()=>{});   /* 其他模型不載（永遠不回）*/
  pend.push(p); return p; };
function build(id){ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.exits=[]; E.spawnHint=null; pend=[]; loads.length=0; GAME.G.zone=id;
  const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.nav) E.nav._cm=null;
  E.player={obj:{position:new THREE.Vector3(z.spawn?z.spawn.x:0,0,z.spawn?z.spawn.z:0),rotation:{y:0}},radius:0.32,lv:0,seat:null,pose:'idle'}; if(E.fitSeatRadius) E.fitSeatRadius(); return z; }
const settle=async()=>{ await Promise.all(pend.slice()); for(let i=0;i<3;i++) await new Promise(r=>setTimeout(r,0)); };
/* cafe_glb_integration.py 的雜湊（NAV_HASH）*/
const navHash=n=>{ let h=0; for(let i=0;i<n.b.length;i++){ h=(h*31+n.b[i]+i%7)>>>0; } return [n.cols,n.rows,h,n.b.reduce((a,v)=>a+(v?1:0),0)]; };
const withProps=n0=>{ const n=new E3.NavGrid(n0.w,n0.h,n0.cell,n0.ox,n0.oz); n.b.set(n0.b); Z3.propBlocks(n,(Z3.PROP_BLOCKS&&Z3.PROP_BLOCKS.wenzhou)||[]); return navHash(n); };

(async()=>{
if(MODE==='nob'){
  // ---- ?nobldg：子程序（location.search 要在 assets3d.js 執行前設好）----
  const z=build('cafe'); const cafeBuildLoads=loads.slice(); await settle();
  const fb=z.group.children.find(o=>o.name==='fallback');
  const out={cafeLoads:cafeBuildLoads, cafeMan:!!ASSETS.manifest['bldg.cafe230_interior'], formal:!!z.formal, fbVisible:fb?fb.visible:null, cafeNav:navHash(z.nav)};
  const w=build('wenzhou'); await settle(); out.wzNav=navHash(w.nav); out.wzLoads=loads.slice();
  process.stdout.write('@@'+J(out)+'\n'); process.exit(0); }

const nob=(()=>{ const r=cp.spawnSync(process.execPath,[__filename,'nob'],{encoding:'utf8',maxBuffer:1<<24}); const m=(r.stdout||'').match(/@@(.*)/); return m?JSON.parse(m[1]):{err:(r.stderr||'').slice(-400)}; })();
check('（前置）配置 cafe230_layout.js v2、正式模型檔在',!!L&&L.version>=2&&fs.existsSync(CAFE_GLB),J(L&&L.glb));
// ---- N ----
check('N1 ?nobldg：進 cafe 不登錄、不載 bldg.cafe230_interior（也不載任何 bldg.*）',!nob.err&&!nob.cafeMan&&!(nob.cafeLoads||[]).some(k=>/^bldg\./.test(k)),J({man:nob.cafeMan,loads:nob.cafeLoads,err:nob.err}));
check('N2 ?nobldg：店內沒有接正式模型（zone.formal 沒有）、程序化備用模型看得到',!nob.err&&nob.formal===false&&nob.fbVisible===true,J({formal:nob.formal,fb:nob.fbVisible}));
const z=build('cafe'); const cafeLoads=loads.slice(); const navPre=navHash(z.nav); await settle(); z.group.updateMatrixWorld(true);
const fb=z.group.children.find(o=>o.name==='fallback');
check('N3 一般網址：照舊載 bldg.cafe230_interior、接上以後 zone.formal、備用模型藏起來',cafeLoads.includes('bldg.cafe230_interior')&&!!z.formal&&!!fb&&fb.visible===false,J({loads:cafeLoads,formal:!!z.formal,fb:fb&&fb.visible}));
// ---- W ----
const cafeNav=navHash(z.nav);
check('W1 店內導航格：正式模型接上前後一樣，也和 ?nobldg 完全相同',J(cafeNav)===J(navPre)&&J(cafeNav)===J(nob.cafeNav),J([cafeNav,nob.cafeNav]));
{ const w=build('wenzhou'); const pre=navHash(w.nav), want=withProps(w.nav); await settle(); const post=navHash(w.nav);
  check('W2 溫州街：建區域當下（模型還沒接）兩種模式完全相同；正式模型接上＝程序化版＋門口雜物阻擋 Z3.PROP_BLOCKS.wenzhou（'+((Z3.PROP_BLOCKS||{}).wenzhou||[]).length+' 個）',
    J(pre)===J(nob.wzNav)&&J(post)===J(want)&&post[3]>pre[3],J({nob:nob.wzNav,pre,post,want,diff:post[3]-pre[3]})); }
{ const py=rd('tests/cafe_glb_integration.py');
  check('W3 cafe_glb_integration.py 的溫州街導航格照 wz_street_integration.py 的標準（程序化版＋Z3.PROP_BLOCKS.wenzhou），不是「完全相同」',/Z3\.propBlocks\(n,\s*L\)/.test(py)&&/PROP_BLOCKS\.wenzhou/.test(py)&&!/溫州街導航格：正式模型和程序化版完全相同/.test(py)); }
// ---- S 卡座（重新進店：上面 W2 換成了溫州街）----
const zc=build('cafe'); await settle();
{ const z=zc; const glb=glbScene(CAFE_GLB); const meshes=[]; glb.traverse(o=>{ if(o.isMesh&&!/glass|bulb|pothos|leaf|ceiling/.test(o.material.name)) meshes.push(o); });
  const rc=new THREE.Raycaster();
  const top=(x,zz)=>{ let best=null; for(const [dx,dz] of [[0,0],[0.07,0],[-0.07,0],[0,0.07],[0,-0.07]]){ rc.set(new THREE.Vector3(x+dx,1.25,zz+dz),new THREE.Vector3(0,-1,0)); rc.far=1.3; const h=rc.intersectObjects(meshes,false)[0]; const y=h?1.25-h.distance:0; if(best==null||y>best) best=y; } return r2(best); };
  const booth=z.seats.filter(s=>s.tag==='booth'&&Math.abs(s.yaw-Math.PI/2)<1e-6);
  const hs=booth.map(s=>[s.x,s.z,top(s.x,s.z)]);
  check('S1 卡座 2 個座位點從上往下打正式模型：座面在地面＋0.30～0.65（seats_on_furniture 的標準）',booth.length===2&&hs.every(q=>q[2]>=0.3&&q[2]<=0.65),J(hs));
  const nearHit=s=>{ const fx=Math.sin(s.yaw), fz=Math.cos(s.yaw); for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1],[0.71,0.71],[-0.71,0.71],[0.71,-0.71],[-0.71,-0.71]]){ if(dx*fx+dz*fz< -0.3) continue; rc.set(new THREE.Vector3(s.x,1.25,s.z),new THREE.Vector3(dx,0,dz)); rc.far=0.45; const h=rc.intersectObjects(meshes,false)[0]; if(h) return (h.object.name||'?')+'@'+h.distance.toFixed(2); } return null; };
  const nh=booth.map(s=>nearHit(s));
  check('S1b 卡座座位往前、往兩側（肩膀高度 1.25 m）0.45 m 內沒有東西（seats_on_furniture 的第二項）',nh.every(v=>!v),J(nh));
  // GLB 卡座的實際範圍：x −6.66（靠背）～−6.13（坐墊前緣）、z −1.25～1.25
  const bad=[]; for(let x=-6.6;x<=-6.2+1e-6;x+=0.1) for(let zz=-1.15;zz<=1.15+1e-6;zz+=0.1){ const y=top(x,zz); if(y>0.3&&E.canStand(x,zz,0.05,0)) bad.push([r2(x),r2(zz),y]); }
  check('S2 正式模型的卡座（坐墊、靠背）底下都擋住：人不會踩進沙發',!bad.length,J(bad.slice(0,8))+(bad.length>8?' …共 '+bad.length:''));
  const sp=[z.spawn.x,z.spawn.z]; const res=[];
  for(const s of booth){ const it=E.interactables.find(q=>q.seat&&Math.abs(q.seat.x-s.x)<1e-6&&Math.abs(q.seat.z-s.z)<1e-6); E.player.obj.position.set(sp[0],0,sp[1]);
    const ap=SA(it?it.seat:s); const stand=E.canStand(ap[0],ap[1],0.3,0); const inR=!!it&&Math.hypot(ap[0]-it.x,ap[1]-it.z)<=(it.radius||1.8)-0.05;
    E.player.obj.position.set(ap[0],0,ap[1]); const own=!!it&&E.nearestInteractable()===it;
    const w1=E.simWalk(sp[0],sp[1],ap[0],ap[1],{dt:1/30}), w2=E.simWalk(sp[0],sp[1],ap[0],ap[1],{dt:0.1});
    res.push({seat:[s.x,s.z],label:it&&it.label,ap:[r2(ap[0]),r2(ap[1])],stand,inR,own,w30:w1.ok?true:w1,w10:w2.ok?true:w2}); }
  check('S3 「坐卡座」走近點（GM.seatApproach）站得住、在按鈕範圍裡、最近的按鈕是它自己、從出生點走得到（dt 1/30、0.1）',res.length===2&&res.every(q=>q.label==='坐卡座'&&q.stand&&q.inR&&q.own&&q.w30===true&&q.w10===true),J(res)); }
{ const z=zc; // S4 nav_islands.py 同一個做法（只看店內）
  const n=E.nav, a=n.toWorld(0,0), b=n.toWorld(n.cols-1,n.rows-1); const minx=Math.min(a[0],b[0]), maxx=Math.max(a[0],b[0]), minz=Math.min(a[1],b[1]), maxz=Math.max(a[1],b[1]);
  const h=0.1, W=Math.floor((maxx-minx)/h)+1, H=Math.floor((maxz-minz)/h)+1; const S=new Uint8Array(W*H);
  for(let j=0;j<H;j++) for(let i=0;i<W;i++) S[j*W+i]=E.canStand(minx+i*h,minz+j*h,0.3,0)?1:0;
  const lab=new Int32Array(W*H).fill(-1), q=new Int32Array(W*H), comps=[];
  for(let s=0;s<W*H;s++){ if(!S[s]||lab[s]>=0) continue; let qh=0, qt=0; q[qt++]=s; lab[s]=comps.length; let cnt=0, sx=0, sz=0, pts=[];
    while(qh<qt){ const c=q[qh++]; cnt++; const ci=c%W, cj=(c/W)|0; sx+=ci; sz+=cj; pts.push(c); for(const [di,dj] of [[1,0],[-1,0],[0,1],[0,-1]]){ const ni=ci+di, nj=cj+dj; if(ni<0||nj<0||ni>=W||nj>=H) continue; const k=nj*W+ni; if(S[k]&&lab[k]<0){ lab[k]=comps.length; q[qt++]=k; } } }
    comps.push({n:cnt,x:r2(minx+sx/cnt*h),z:r2(minz+sz/cnt*h),pts}); }
  comps.sort((p,r)=>r.n-p.n); const main=comps[0]; const mainPts=main.pts.map(c=>[minx+(c%W)*h,minz+((c/W)|0)*h]);
  const sus=comps.slice(1).filter(c=>c.n*h*h<0.5&&c.pts.some(k=>{ const x=minx+(k%W)*h, zz=minz+((k/W)|0)*h; return mainPts.some(p=>Math.hypot(p[0]-x,p[1]-zz)<1.5); })).map(c=>({x:c.x,z:c.z,m2:r2(c.n*h*h)}));
  check('S4 店內沒有站不住出不來的小孤島（nav_islands.py 的 SUSPECT：< 0.5 m²、離主要區域 1.5 m 內）',!sus.length,J({islands:comps.length-1,suspect:sus})); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL （例外）'+(e&&e.stack||e)); process.exit(1); });
