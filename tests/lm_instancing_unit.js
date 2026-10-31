// 光照烘焙以後書照舊是 GPU instancing（LAWWW2-B 2026-10-31）——不需要瀏覽器。
// tools/blender/env_second/lightbake/bake_room.py --keep-instances：書不展開、不烘，照舊即時光。10-31 以前匯出時沒寫 export_gpu_instances，
//   書變成一本一個節點：法律學院圖書館 137 節點（27 個實例）→ 800 節點（0 個實例），遊戲裡一個節點一次 draw call。
// 這支檢查用 --keep-instances 烘的模型：①有 EXT_mesh_gpu_instancing 的節點 ②節點數沒有暴增
// 用法：node tests/lm_instancing_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const LIST=[['assets/models/env/lawlib_interior.glb',20,200],['assets/models/env/second_ai/library_3f.glb',16,100]];   // [檔案, 至少幾個實例節點, 節點數上限]
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
for(const [rel,minInst,maxNodes] of LIST){
  const b=fs.readFileSync(path.join(ROOT,rel)), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8'));
  const sc=j.scenes[j.scene||0], lm=sc.extras&&sc.extras.lightmap;
  const inst=j.nodes.filter(x=>x.extensions&&x.extensions.EXT_mesh_gpu_instancing).length;
  check(path.basename(rel)+'：有光照貼圖、書照舊是 GPU instancing、節點數沒有暴增',!!lm&&inst>=minInst&&j.nodes.length<=maxNodes&&(j.extensionsUsed||[]).includes('EXT_mesh_gpu_instancing'),'實例節點 '+inst+'（至少 '+minInst+'）、節點 '+j.nodes.length+'（上限 '+maxNodes+'）');
}
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
