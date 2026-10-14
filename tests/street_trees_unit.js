// 行道樹正式模型（第二個 AI ⑦）的單元測試（不需要瀏覽器）：在 Node 裡建出遊戲真正的區域（校園、公館、溫州街），比較兩種情況——
//   kit：正式模型沒載入（?nobldg、載入失敗）：TK.tree／TK.royalPalm 照舊建程序化的樹
//   formal：正式模型載入了：TK.tree／TK.royalPalm 只回傳「樹的位置記號」（看不見的小三角形）
// 檢查：
//   1. 共用亂數 TK.rnd 在兩種情況下抽的次數完全相同（建完每個區域後下一個亂數一樣）→ 樹以外所有物件的形狀、位置不會跟著變
//   2. 樹以外的網格（頂點數、位置的總和）兩種情況完全相同；導航格（阻擋格的數目與位置）完全相同
//   3. 每一棵程序化的樹都有一個對應的記號：位置（含呼叫端的擺放、群組合併）、高度一樣；記號的數目＝樹的數目
// 每個情況各用一個新的 Node 程序跑（亂數從頭開始），用法：node tests/street_trees_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'), ZONES=['campus','gongguan','wenzhou'];
if(process.argv[2]==='--child'){
  const MODE=process.argv[3];
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  const src0=fs.readFileSync(path.join(ROOT,'tests/nav_buildings_unit.js'),'utf8'); const files=eval(src0.match(/const files=(\[[^\]]*\])/)[1]);
  for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/m,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; E.extras=[];
  if(MODE==='formal'){ const raw=ASSETS.getRaw; ASSETS.getRaw=k=>k==='prop.trees'?{scene:new THREE.Group()}:raw(k); E.camera=new THREE.PerspectiveCamera(); E.addExtra=x=>E.extras.push(x); }
  const kitTrees=[]; if(MODE==='kit'){ for(const fn of ['tree','royalPalm']){ const o=TK[fn]; TK[fn]=function(h){ const g=o.apply(this,arguments); kitTrees.push(g); return g; }; } }
  const out={};
  for(const id of ZONES){
    E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.extras=[]; kitTrees.length=0;   /* 引擎換區域時 extras 也是清空 */
    const z=Z3.ZONES[id].build(E); z.group.updateMatrixWorld(true);
    // 全部網格的頂點數、位置總和（世界座標；記號另外解出來不算）；kit 的情況另外算每一棵樹自己的頂點（TK 回傳的群組在建完時的世界矩陣：
    // 被 W3.mergeGroup 合併的樹列，合併時就是用這個矩陣烘進去的）→「全部 − 樹」兩種情況要一樣
    let verts=0, sx=0, sy=0, sz=0; const v=new THREE.Vector3(); const seeds=[];
    z.group.traverse(o=>{ if(!o.isMesh||!o.geometry||!o.geometry.attributes.position) return; const ms=Array.isArray(o.material)?o.material:[o.material];
      if(ms.some(m=>m&&m.userData&&m.userData.treeSeed)){ const g=o.geometry, pos=g.attributes.position, uv=g.attributes.uv, ix=g.index, n=ix?ix.count:pos.count; o.updateMatrixWorld(true);
        for(let i=0;i+2<n;i+=3){ const ia=ix?ix.getX(i):i, ib=ix?ix.getX(i+1):i+1, ic=ix?ix.getX(i+2):i+2; if(Math.round(uv.getY(ic))!==7777) continue; const A=new THREE.Vector3().fromBufferAttribute(pos,ia).applyMatrix4(o.matrixWorld), Y=new THREE.Vector3().fromBufferAttribute(pos,ic).applyMatrix4(o.matrixWorld);
          seeds.push({x:+A.x.toFixed(2),y:+A.y.toFixed(2),z:+A.z.toFixed(2),sp:Math.round(uv.getX(ia)),h:+uv.getY(ia).toFixed(2),sy:+(Y.distanceTo(A)).toFixed(3)}); } return; }
      const pos=o.geometry.attributes.position; verts+=pos.count; for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld); sx+=v.x; sy+=v.y; sz+=v.z; } });
    let tv=0, tx=0, ty=0, tz=0; for(const g of kitTrees){ g.updateMatrixWorld(true); g.traverse(o=>{ if(!o.isMesh) return; const pos=o.geometry.attributes.position; tv+=pos.count; for(let i=0;i<pos.count;i++){ v.fromBufferAttribute(pos,i).applyMatrix4(o.matrixWorld); tx+=v.x; ty+=v.y; tz+=v.z; } }); }
    // kit 的樹的位置（呼叫端擺放後的世界座標；被 W3.mergeGroup 合併、原本的群組沒有接在區域上的，用它自己的矩陣（合併時就是這樣烘進去的））
    const trees=kitTrees.map(g=>{ g.updateMatrixWorld(true); const p=new THREE.Vector3().setFromMatrixPosition(g.matrixWorld); let root=g; while(root.parent) root=root.parent; return {x:+p.x.toFixed(2),y:+p.y.toFixed(2),z:+p.z.toFixed(2),attached:root===z.group}; });
    const nav=z.nav; let blocked=0, bh=0; if(nav&&nav.b){ for(let i=0;i<nav.b.length;i++) if(nav.b[i]){ blocked++; bh=(bh*31+i)%1000000007; } }
    out[id]={next:TK.rnd(), verts:verts-tv, sum:[+(sx-tx).toFixed(1),+(sy-ty).toFixed(1),+(sz-tz).toFixed(1)], treeVerts:tv, blocked, bh, seeds, trees, extras:E.extras.length};
  }
  process.stdout.write(JSON.stringify(out)); process.exit(0);
}
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const run=m=>JSON.parse(cp.execFileSync(process.execPath,[__filename,'--child',m],{maxBuffer:256<<20,stdio:['ignore','pipe','ignore']}).toString());
const K=run('kit'), F=run('formal');
for(const id of ZONES){ const k=K[id], f=F[id];
  check(`${id}：共用亂數抽的次數相同（建完區域後下一個亂數 ${k.next.toFixed(6)}）`, k.next===f.next, `kit ${k.next} / formal ${f.next}`);
  check(`${id}：樹以外的網格完全相同（頂點 ${k.verts}、位置總和；kit 的樹 ${k.treeVerts} 個頂點）`, k.verts===f.verts&&k.sum.every((v,i)=>Math.abs(v-f.sum[i])<2.0), `kit ${k.verts} ${k.sum} / formal ${f.verts} ${f.sum}`);
  check(`${id}：導航格完全相同（阻擋格 ${k.blocked}）`, k.blocked===f.blocked&&k.bh===f.bh, `kit ${k.blocked}/${k.bh} formal ${f.blocked}/${f.bh}`);
  // 每一棵程序化的樹都有一個位置相同的記號（kit 的樹：TK 回傳的群組在世界座標的位置）
  const used=new Set(); let miss=[];
  for(const t of k.trees){ const j=f.seeds.findIndex((s,i)=>!used.has(i)&&Math.abs(s.x-t.x)<0.06&&Math.abs(s.z-t.z)<0.06&&Math.abs(s.y-t.y)<0.06); if(j<0) miss.push(t); else used.add(j); }
  check(`${id}：每一棵樹都有位置相同的記號（樹 ${k.trees.length}、記號 ${f.seeds.length}）`, miss.length===0&&k.trees.length===f.seeds.length, miss.length?JSON.stringify(miss.slice(0,5)):'');
  check(`${id}：記號的樹種（樟樹 0／榕樹 1／大王椰子 2）與高度都有`, f.seeds.every(s=>[0,1,2].includes(s.sp)&&s.h>2&&s.h<40), JSON.stringify(f.seeds.reduce((a,s)=>(a[s.sp]=(a[s.sp]||0)+1,a),{})));
  check(`${id}：正式模型時有登記一個 TreeField（每個區域一個）`, f.extras===1&&k.extras===0, `formal ${f.extras} kit ${k.extras}`);
}
console.log(fails?`FAILED ${fails}`:'ALL PASS'); process.exit(fails?1:0);
