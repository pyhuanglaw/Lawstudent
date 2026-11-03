// 總圖 3F 閱覽區第二版（LIB-3F-1102）：照使用者 11-02 的 3F 平面圖重排——不需要瀏覽器。
//   第一版（version 1，ba125d6f3 的 src/data/library_layout.js）總圖大廳每 0.8 m 取樣、站得住的位置（兩層）＋座位＋互動點，共 715 個（[x, z, 層, 0 取樣／1 座位／2 互動點]）。
//   照引擎進區域的做法（engine3d.js 換區域那一段：E.unstick 16 格 → 90 格 → 區域出生點）把玩家放上去，最後的位置要站得住、從入口（一樓）或二樓連廊走得到（不會被關在孤島）。
//   也記下幾成原地不動、幾成挪了多遠（第二版的中庭從實心核心＋帝國式大樓梯改成台階書牆，原本站在核心旁、平台上的會被挪開）。
// 用法：node tests/library_hall_v2_oldsave_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{},addEventListener(){},removeEventListener(){}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/socsci_layout.js','src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/library_layout.js','src/library3d.js','src/library_hall_v2.js','src/data/library_3f_layout.js','src/library_3f_v2.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
process.on('unhandledRejection',()=>{}); global.fetch=()=>Promise.reject(new Error('no fetch in node')); const _warn=console.warn; console.warn=(...a)=>{ if(/正式模型載入失敗/.test(String(a[0]))) return; _warn(...a); };

(async()=>{
  const L=LIBRARY3F_LAYOUT;
  check('配置是第二版、接手了 library 區域', L.version===2&&L3F.active()&&Z3.ZONES.library.build===L3F.build&&typeof Z3.ZONES.library.buildV1==='function');
  check('LIBRARY_LAYOUT.reading 換成第二版（樓梯間落點、電梯和大廳同一個井），第一版留在 reading.v1',
    LIBRARY_LAYOUT.reading.spawnFromStairs.x===L.spawnFromStairs.x&&LIBRARY_LAYOUT.reading.elevator.x0===LIBRARY_LAYOUT.elevator.x0&&LIBRARY_LAYOUT.reading.elevator.z0===LIBRARY_LAYOUT.elevator.z0&&!!LIBRARY_LAYOUT.reading.v1,
    JSON.stringify({sp:LIBRARY_LAYOUT.reading.spawnFromStairs,el:[LIBRARY_LAYOUT.reading.elevator.x0,LIBRARY_LAYOUT.reading.elevator.z0],hall:[LIBRARY_LAYOUT.elevator.x0,LIBRARY_LAYOUT.elevator.z0]}));
  E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null;
  const z=Z3.ZONES.library.build(E); E.zone=z; E.nav=z.nav; E.levels=null; z.nav._cm=null;
  const P={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; E.player=P;
  const SP=z.spawn, n=z.nav;
  check('從樓梯間進來的位置站得住', E.canStand(SP.x,SP.z,0.3,0), JSON.stringify(SP));
  const reach=(x0,z0)=>{ const [c0,r0]=n.toCell(x0,z0), seen=new Uint8Array(n.cols*n.rows), q=[[c0,r0]]; seen[r0*n.cols+c0]=1;
    while(q.length){ const [c,r]=q.pop(); for(const [dc,dr] of [[1,0],[-1,0],[0,1],[0,-1]]){ const cc=c+dc, rr=r+dr; if(cc<0||rr<0||cc>=n.cols||rr>=n.rows||seen[rr*n.cols+cc]||n.blocked(cc,rr)) continue; seen[rr*n.cols+cc]=1; q.push([cc,rr]); } } return seen; };
  const R0=reach(SP.x,SP.z); const ok=(x,zz)=>{ const [c,r]=n.toCell(x,zz); return E.canStand(x,zz,0.3,0)&&!!R0[r*n.cols+c]; };
  // 座位：坐下前站的位置（GAME.seatApproach 的做法：座位往後 0.5 m、兩側 0.6 m 找站得住的點）走得到
  const bad=[]; for(const [i,s] of z.seats.entries()){ const bx=-Math.sin(s.yaw), bz=-Math.cos(s.yaw); const cand=[[s.x+bx*0.5,s.z+bz*0.5],[s.x+bz*0.6,s.z-bx*0.6],[s.x-bz*0.6,s.z+bx*0.6],[s.x+bx*0.8,s.z+bz*0.8]];
    if(!cand.some(([x,zz])=>ok(x,zz))) bad.push(i+':'+s.x+','+s.z); }
  check('座位 '+z.seats.length+' 個（第一版 36）：每一個旁邊都有站得住、從樓梯間走得到的地方', z.seats.length>=36&&bad.length===0, bad.slice(0,8).join(' '));
  check('seats[2]（學姊，story3d.js）是西側靠窗那一排', L.seats[2].label==='西側靠窗'&&z.seats[2].x<-10, JSON.stringify(z.seats[2]));
  const win=L.seats.filter(s=>/靠窗/.test(s.label)).length; check('靠窗的位子（「三樓靠窗」的台詞）至少 12 個', win>=12, String(win));
  const it=E.interactables.filter(q=>!q.seat); const badIt=it.filter(q=>!ok(q.x,q.z)).map(q=>q.label+'@'+q.x.toFixed(1)+','+q.z.toFixed(1));
  check('互動點（樓梯間、電梯、討論室、研究小間、人文庫）站得住、走得到（'+it.length+' 個）', badIt.length===0&&it.some(q=>q.exit&&q.exit.to==='library_hall')&&it.some(q=>q.elevator), badIt.join(' '));
  const SM={}; for(const m of L.seatMap) SM[m.what]=m.v2;
  const isSeat=(p)=>z.seats.some(s=>Math.hypot(s.x-p[0],s.z-p[1])<0.05);
  check('pool「愛睡覺的男生」、「坐窗邊的人」的新座標是座位', isSeat(L.seatMap[1].v2)&&isSeat(L.seatMap[2].v2), JSON.stringify([L.seatMap[1].v2,L.seatMap[2].v2]));
  check('課程導覽最後一站的新座標站得住、走得到', ok(L.seatMap[3].v2[0],L.seatMap[3].v2[1]), JSON.stringify(L.seatMap[3].v2));
  { const sp=LIBRARY_LAYOUT.reading.spawnFromStairs, dx=0-sp.x, dz=-4-sp.z, dl=Math.hypot(dx,dz)||1, cx=sp.x+dx/dl*1.5-dz/dl*0.8, cz=sp.z+dz/dl*1.5+dx/dl*0.8;   /* classes3d.js 新生導覽上三樓：館員和同學站的位置（同一個算法）*/
    check('新生導覽上三樓：從樓梯間進來、館員站的位置站得住、走得到', ok(sp.x,sp.z)&&ok(cx,cz), [cx.toFixed(2),cz.toFixed(2)].join(',')); }
  { const note=L.seatMap.find(m=>/紙條/.test(m.what)).v2, shelf=L.seatMap.find(m=>/期刊架/.test(m.what)).v2, boy=L.seatMap[1].v2;
    const near=(x,zz,rad)=>{ for(let d=0;d<=rad+1e-9;d+=0.1) for(let a=0;a<Math.PI*2;a+=Math.PI/12){ if(ok(x+Math.cos(a)*d,zz+Math.sin(a)*d)) return +d.toFixed(2); } return null; };
    const dn=near(note[0],note[1],1.0);
    check('「看桌上的紙條」在守誠那張桌子上（他的座位前面），1 m 內有站得住、走得到的地方（互動半徑 1.2 m）', dn!=null&&Math.hypot(note[0]-boy[0],note[1]-boy[1])<0.8&&L.furniture.some(f=>f.type==='desk'&&Math.abs(f.x-note[0])<f.w/2&&Math.abs(f.z-note[1])<f.d/2), 'note '+JSON.stringify(note)+' 最近 '+dn+' m');
    check('「看期刊架」在現期期刊展示架前面，站得住、走得到', ok(shelf[0],shelf[1])&&L.furniture.some(f=>f.type==='display'&&Math.abs(f.x-shelf[0])<f.w/2&&Math.abs(f.z-shelf[1])<1.0), JSON.stringify(shelf));
    const src=f=>fs.readFileSync(path.join(ROOT,f),'utf8'), mN=src('src/pool_more3d.js').match(/x:v2\?(-?[\d.]+):-2\.4,z:v2\?(-?[\d.]+):0\.6/), mS=src('src/r2y4a3d.js').match(/x:v2\?(-?[\d.]+):-9\.7,z:v2\?(-?[\d.]+):2\.4/);
    check('pool_more3d.js、r2y4a3d.js 第二版用的就是配置裡的這兩個點', !!mN&&!!mS&&+mN[1]===note[0]&&+mN[2]===note[1]&&+mS[1]===shelf[0]&&+mS[2]===shelf[1], JSON.stringify([mN&&mN.slice(1),mS&&mS.slice(1)])); }
  const R=L.rotunda; check('人文庫（北牆外的半圓）走得進去', ok(R.cx,R.cz-1.0)&&ok(R.cx+2.5,R.cz-1.5), '');
  check('電梯車廂在大廳同一個井的位置', !!z.elev&&Math.abs(z.elev.cx-(LIBRARY_LAYOUT.elevator.x0+LIBRARY_LAYOUT.elevator.x1)/2)<0.01, z.elev&&String(z.elev.cx));
  // 窗外的景（11-02 20:1x 截圖：白天的窗全黑）：照片是非同步載入的——載好之前窗不能是空的（用漸層），載好以後同一個時段的下一次 applyTime 就要換上（不能只在白天↔晚上切換時才套）
  { const wins=[]; z.group.traverse(o=>{ if(o.isMesh&&o.material&&o.material.uniforms&&o.material.uniforms.photo&&o.material.uniforms.map) wins.push(o); });
    const TL=THREE.TextureLoader.prototype.load, cbs=[]; THREE.TextureLoader.prototype.load=function(url,onLoad){ cbs.push([url,onLoad]); return new THREE.Texture(); };   /* 攔下載入，等一下自己「載好」*/
    try{ W3.releaseViews(); z.applyTime(15,'clear'); } finally { THREE.TextureLoader.prototype.load=TL; }
    const empty=wins.filter(w=>!w.material.uniforms.map.value).length;
    check('窗外的景：照片還沒載入時每一扇窗都有圖（漸層），不是空的（空的＝黑窗）', wins.length>=10&&empty===0, wins.length+' 扇、空的 '+empty);
    const fake=new THREE.Texture(); for(const [u,cb] of cbs) if(/library_3f_day/.test(u)&&cb) cb(fake);
    z.applyTime(15.1,'clear'); const got=wins.filter(w=>w.material.uniforms.map.value===fake&&w.material.uniforms.photo.value===1).length;
    check('窗外的景：照片載好以後，同一個時段的下一次 applyTime 就換上照片', wins.length>0&&got===wins.length, got+'/'+wins.length+'（攔到的載入 '+cbs.length+' 個）'); W3.releaseViews(); }
  /* 正式模型（assets/models/env/second_ai/library_3f_v2.glb）的牆：朝室內（extras.dir）的那一面要在室內那一側。
     11-02 人文庫的弧牆頂點順序反了（法線朝外），和大廳第二版展演廳同一個錯：烘焙照 dir 把朝室內的面縮成一點，遊戲裡看到一片一片的平三角 */
  { const gp=path.join(ROOT,'assets/models/env/second_ai/library_3f_v2.glb');
    if(!fs.existsSync(gp)) check('正式模型的牆朝室內（GLB 不在，跳過）', true, 'no glb');
    else { const b=fs.readFileSync(gp), n0=b.readUInt32LE(12), J=JSON.parse(b.slice(20,20+n0).toString('utf8')), bin=b.slice(20+n0+8);
      const acc=i=>{ const a=J.accessors[i], bv=J.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), nc={SCALAR:1,VEC2:2,VEC3:3}[a.type], ct=a.componentType, cs={5126:4,5125:4,5123:2,5121:1}[ct], st=bv.byteStride||nc*cs, out=[];
        for(let k=0;k<a.count;k++) for(let c=0;c<nc;c++){ const q=o+k*st+c*cs; out.push(ct===5126?bin.readFloatLE(q):ct===5125?bin.readUInt32LE(q):ct===5123?bin.readUInt16LE(q):bin.readUInt8(q)); } return out; };
      const bad=[]; let nw=0;
      for(const nd of J.nodes.filter(nd=>/^WALL_/.test(nd.name||'')&&'mesh' in nd&&nd.extras&&nd.extras.dir)){ nw++; const d=nd.extras.dir, dl=Math.hypot(d[0],d[1],d[2]); let ai=0, pi=0, ao=0, po=0;
        for(const pr of J.meshes[nd.mesh].primitives){ const P=acc(pr.attributes.POSITION), I=acc(pr.indices);
          for(let t=0;t<I.length;t+=3){ const a=I[t], b2=I[t+1], c=I[t+2], u=[0,1,2].map(j=>P[b2*3+j]-P[a*3+j]), w=[0,1,2].map(j=>P[c*3+j]-P[a*3+j]);
            const nn=[u[1]*w[2]-u[2]*w[1],u[2]*w[0]-u[0]*w[2],u[0]*w[1]-u[1]*w[0]], ar=Math.hypot(nn[0],nn[1],nn[2])/2; if(ar<1e-6) continue;
            const dot=(nn[0]*d[0]+nn[1]*d[1]+nn[2]*d[2])/(2*ar*dl), pj=[0,1,2].reduce((q,j)=>q+(P[a*3+j]+P[b2*3+j]+P[c*3+j])*d[j],0)/(3*dl);
            if(dot>0.3){ ai+=ar; pi+=ar*pj; } else if(dot<-0.3){ ao+=ar; po+=ar*pj; } } }
        if(ai===0) bad.push(nd.name+' 沒有朝室內的面'); else if(ao>0&&pi/ai<po/ao-0.01) bad.push(nd.name+' 朝室內的面在外側'); }
      check('正式模型的牆（'+nw+' 組）朝室內（dir）的那一面都在室內那一側（人文庫的弧牆頂點順序沒有反）', nw>=4&&bad.length===0, bad.join('、')); } }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
