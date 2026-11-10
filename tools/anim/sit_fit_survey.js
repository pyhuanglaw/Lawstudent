// 坐下的高度要用的人物比例表（SIT-HEIGHT-1104，LAWWW2-C 2026-11-04；LAWWW-C 22:57Z 派工）——在遊戲自己的骨架、遊戲自己的坐姿上量（Node，不需要瀏覽器）。
// 每一個 manifest 裡的 VRM 檔（char.*）：照遊戲的縮放建立人物（CHAR.build），擺遊戲的靜態坐姿（pose sit；腳的調整 sitFeet 關掉），量：
//   ul＝大腿根（左右 upperLeg 真實骨頭的平均）在靜止姿勢離腳底多高 ÷ 身高 H（坐下前；和遊戲裡的身高無關）
//   bt＝坐姿時大腿根到大腿底部 ÷ H：椅面範圍（人物座標 |x|≤0.22、z −0.20～+0.12，Z3.chair 的椅面後段）裡、權重加總以後主要綁在 upperLeg 的頂點（≥0.6，不含頭髮）最低的一點
//   b ＝同上，但 hips、spine 的頂點也算（大腿根下 0.2·H 以內）：b 比 bt 低超過 0.003·H＝這件下身是裙子（綁在骨盆上、坐下也直直垂著，量不到大腿），表裡用預設 0.06
//   fe＝大腿在椅子前緣（z 0.16～0.24）的底部 ÷ H、knee／ank＝膝蓋、腳踝在大腿根下面多少 ÷ H、knZ＝膝蓋在前面多遠 ÷ H、ra＝站著時腳踝離地 ÷ H
// 遊戲的坐下：往下＝H×(ul−bt)−(C.SIT_TOP−C.SIT_PRESS)（character3d.js 的 C.SIT_FIT 就是這支印出來的 [ul, bt]）。
// 用法（開發分支）：node tools/anim/sit_fit_survey.js 輸出.json [--js 表.js] [char.key,...]
//   改了遊戲的坐姿（SIT_VRM 的腿）、人物縮放、換了 VRM 檔，要重跑、把 --js 的內容貼回 character3d.js 的 C.SIT_FIT。
const path=require('path'), fs=require('fs');
const ROOTDIR=path.resolve(__dirname,'../..');
const {preload}=require(path.join(ROOTDIR,'tools/dev_scratch/spring_sim/harness.js'));
const argv=process.argv.slice(2), out=argv[0]; const jsOut=argv.includes('--js')?argv[argv.indexOf('--js')+1]:null;
const only=argv.slice(1).filter((a,i,arr)=>a!=='--js'&&arr[i-1]!=='--js')[0];
const B_SKIRT=0.06;   // 裙子：大腿量不到，用全部褲子模型 bt 的中位數（0.0589）附近
(async()=>{
  const byUrl={}; for(const [k,m] of Object.entries(ASSETS.manifest)){ if(m.type!=='vrm'||!/^char\./.test(k)) continue; if(only&&!only.split(',').includes(k)) continue; if(!fs.existsSync(path.join(ROOTDIR,m.url))) continue; (byUrl[m.url]=byUrl[m.url]||[]).push(k); }
  const res={}; const V=new THREE.Vector3(), scene=new THREE.Scene();
  for(const [url,keys] of Object.entries(byUrl)){ const key=keys[0], m=ASSETS.manifest[key], file=path.basename(url);
    try{ await preload([key]); }catch(e){ console.log('載不到',key,e.message); continue; }
    try{
      const h=CHAR.build({model:key,height:m.height}); scene.add(h); const u=h.userData; if(!u.vrm){ console.log('不是 VRM',key); scene.remove(h); continue; }
      const H=m.height, Hm=u.vrm.humanoid, bone=n=>Hm.getRawBoneNode(n), W=n=>bone(n).getWorldPosition(new THREE.Vector3());
      if(!bone('leftUpperLeg')||!bone('rightUpperLeg')||!bone('leftLowerLeg')||!bone('leftFoot')){ console.log('沒有腿的骨頭',key); scene.remove(h); continue; }
      if(!/^J_Bip_/.test(bone('hips').name||'')){ console.log('不是 VRoid 骨架（照舊 0.47×身高比例）',key); scene.remove(h); continue; }   /* vrm_player（舊的 Seed-san 改的，遊戲沒有用）*/
      for(let i=0;i<4;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true);
      const ra=Math.min(W('leftFoot').y,W('rightFoot').y);
      u.sitFeet=false; for(let i=0;i<8;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
      const drop=CHAR.sitDrop(h), ul=(W('leftUpperLeg').y+W('rightUpperLeg').y)/2, kn=(W('leftLowerLeg').y+W('rightLowerLeg').y)/2, an=(W('leftFoot').y+W('rightFoot').y)/2, knZ=(W('leftLowerLeg').z+W('rightLowerLeg').z)/2;
      const body=new Set(['hips','spine','leftUpperLeg','rightUpperLeg'].map(bone).filter(Boolean)), thigh=new Set(['leftUpperLeg','rightUpperLeg'].map(bone).filter(Boolean));
      let lowB=1e9, lowT=1e9, lowF=1e9;
      h.traverse(o=>{ if(!o.isSkinnedMesh||/hair/i.test((o.name||'')+'|'+((o.parent&&o.parent.name)||''))) return;
        const bs=o.skeleton.bones, si=o.geometry.attributes.skinIndex, sw=o.geometry.attributes.skinWeight, pa=o.geometry.attributes.position;
        for(let v=0;v<pa.count;v++){ const acc=new Map(); for(let c=0;c<4;c++){ const ww=sw.getComponent(v,c); if(ww>0){ const b=bs[si.getComponent(v,c)]; acc.set(b,(acc.get(b)||0)+ww); } }   /* 同一根骨頭可能占兩格（0.5＋0.5）：照骨頭加總 */
          let bb=null, bw=0; for(const [b,w] of acc) if(w>bw){ bw=w; bb=b; }
          if(!body.has(bb)) continue;
          o.getVertexPosition(v,V); o.localToWorld(V); if(Math.abs(V.x)>0.22||V.y<ul-0.2*H) continue;
          if(V.z>=-0.20&&V.z<=0.12){ if(V.y<lowB) lowB=V.y; if(thigh.has(bb)&&bw>=0.6&&V.y<lowT) lowT=V.y; }
          if(thigh.has(bb)&&bw>=0.6&&V.z>=0.16&&V.z<=0.24&&V.y<lowF) lowF=V.y; } });
      const r=x=>+(x/H).toFixed(4), bt=lowT<1e8?r(ul-lowT):null, b=lowB<1e8?r(ul-lowB):null, skirt=b!=null&&bt!=null&&b-bt>0.003;
      res[file]={keys,H,ul:r(ul+drop),bt,b,skirt,B:skirt||bt==null?B_SKIRT:bt,fe:lowF<1e8?r(ul-lowF):null,knee:r(ul-kn),ank:r(ul-an),knZ:r(knZ),ra:r(ra)};
      console.log(file.padEnd(30),JSON.stringify(res[file]));
      scene.remove(h); if(CHAR.release) CHAR.release(h);
    }catch(e){ console.log('量不到',key,e.message); }
    try{ delete window.ASSET_DATA[url]; if(ASSETS.cache) delete ASSETS.cache[key]; }catch(e){}
  }
  if(out) fs.writeFileSync(out,JSON.stringify(res,null,1));
  if(jsOut) fs.writeFileSync(jsOut,'{'+Object.keys(res).sort().map(f=>"'"+f+"':["+res[f].ul+','+res[f].B+']').join(',')+'}\n');
  console.log('共',Object.keys(res).length,'個模型');
})().catch(e=>{ console.error(e); process.exit(2); });
