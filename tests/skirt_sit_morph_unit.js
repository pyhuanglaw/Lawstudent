// 坐長椅的路人裙子不穿進椅面（SKIRT-BENCH-CLIP-1105，LAWWW2-B 2026-11-07；使用者 11-05「路人裙子卡進椅子（體育館一樓長椅截圖）」）
// Node（不用瀏覽器）：載入遊戲的 three.js／three-vrm／CHAR，用真的 VRM 檔（走 ASSETS 的載入：removeUnnecessaryVertices、遠距離版本 attachFar），
// 每個穿裙子的路人：照遊戲坐下（pose sit 40 格＋坐姿循環片段），量裙子在體育館一樓長椅範圍（人物座標 |x|≤0.30、z −0.31～+0.19）裡低於椅面 0.47 m 的頂點；
// 遠距離版本（npc_far，室內 7 m 外）也量；站著、站起來走路、跪坐（sitFloor）時 morph 關著（權重沒改：關著＝和原本的 VRM 完全一樣）。
// 改前（開發分支原本的 VRM、沒有 character3d.js 的 skirt_sit）：每個人椅面裡 251～282 個頂點、最深 30～56 cm → FAIL。
// 用法：node tests/skirt_sit_morph_unit.js
const path=require('path'), fs=require('fs');
const ROOT=path.resolve(__dirname,'..');
const {preload}=require(path.join(ROOT,'tools/dev_scratch/spring_sim/harness.js'));
const KEYS=['char.npc_nf9','char.npc_nf10','char.npc_nf12','char.npc_nf14','char.npc_nf16','char.npc_nf17','char.npc_nf19','char.npc_nf20'];
const BENCH={top:0.47,z0:-0.31,z1:0.19,x:0.30};
let fails=0; const ok=(c,msg)=>{ console.log((c?'PASS ':'FAIL ')+msg); if(!c) fails++; };
function inSeat(h,o){ const V=new THREE.Vector3(), used=new Set(o.geometry.index?o.geometry.index.array:[...Array(o.geometry.attributes.position.count).keys()]); let n=0, d=0;
  for(const i of used){ o.getVertexPosition(i,V); o.localToWorld(V); h.worldToLocal(V); if(Math.abs(V.x)>BENCH.x||V.z<BENCH.z0||V.z>BENCH.z1||V.y>=BENCH.top-0.003) continue; n++; d=Math.max(d,BENCH.top-V.y); } return {n,d:+d.toFixed(3)}; }
(async()=>{
  window.ASSET_DATA=window.ASSET_DATA||{};
  for(const k of KEYS){ const lu=ASSETS.lodUrl&&ASSETS.lodUrl(k); if(lu&&fs.existsSync(path.join(ROOT,lu))) window.ASSET_DATA[lu]=fs.readFileSync(path.join(ROOT,lu)).toString('base64'); }   /* 遠距離版本（attachFar）*/
  await preload(KEYS);
  { const k='char.ual_sit_clips', u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOT,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOT,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }
  const scene=new THREE.Scene();
  for(const key of KEYS){ let sd=11; CHAR.ambRand=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; }; if(CHAR._ambReset) CHAR._ambReset();
    const m=ASSETS.manifest[key], h=CHAR.build({model:key,height:m.height}); scene.add(h); const u=h.userData; let near=null, far=null;
    h.traverse(x=>{ if(!x.isSkinnedMesh) return; if(x.name==='npc_far'){ if(x.geometry.attributes.color) far=x; }   /* 遠距離版本的身體＋衣服（頂點色；另一個是頭髮）*/ else if(/Bottom/.test((Array.isArray(x.material)?x.material[0]:x.material).name)) near=x; });
    ok(!!near,key+' 有裙子網格');
    if(!near){ scene.remove(h); continue; }
    ok(!!(u.sitMorph&&u.sitMorph.some(([o])=>o===near)),key+' 裙子網格有 skirt_sit（u.sitMorph '+(u.sitMorph?u.sitMorph.length:0)+' 個）');
    for(let i=0;i<4;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); scene.updateMatrixWorld(true);
    ok((u.sitMorph||[]).every(([o,i])=>o.morphTargetInfluences[i]===0),key+' 站著：morph 關著');
    for(let i=0;i<40;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);
    const s=inSeat(h,near); ok(s.n===0,key+' 坐著：裙子在長椅椅面裡的頂點 '+s.n+' 個（最深 '+s.d+' m；要 0）');
    if(far){ const f=inSeat(h,far); ok(f.n===0,key+' 遠距離版本坐著：椅面裡 '+f.n+' 個（最深 '+f.d+' m；要 0）'); }
    else ok(false,key+' 沒有遠距離版本（lod）');
    ok((u.sitMorph||[]).length>0&&(u.sitMorph||[]).every(([o,i])=>o.morphTargetInfluences[i]===1),key+' 坐著：morph 打開（近的、遠的 '+(u.sitMorph||[]).length+' 個網格）');
    // 站起來走路：morph 關掉（＝和原本的 VRM 完全一樣：權重沒改）
    for(let i=0;i<6;i++) CHAR.animate(h,1/30,{pose:'walk',speed:1.3}); scene.updateMatrixWorld(true);
    ok((u.sitMorph||[]).every(([o,i])=>o.morphTargetInfluences[i]===0),key+' 站起來走路：morph 關掉');
    // 跪坐（sitFloor）不用這個形狀
    u.sitFloor=true; CHAR.animate(h,1/30,{pose:'sit',speed:0}); ok((u.sitMorph||[]).every(([o,i])=>o.morphTargetInfluences[i]===0),key+' 跪坐（sitFloor）不開'); u.sitFloor=false;
    scene.remove(h); if(CHAR.release) CHAR.release(h); }
  console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(2); });
