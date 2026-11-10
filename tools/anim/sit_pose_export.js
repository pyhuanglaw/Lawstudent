// 把人物「照遊戲的坐姿」匯出成 OBJ（SIT-HEIGHT-1104 預覽用，LAWWW2-C 2026-11-04）：Node 裡用遊戲自己的 CHAR.build／CHAR.animate（pose sit、靜態），
// 蒙皮、表情以後的頂點（世界座標：x 左手邊、y 上、z 前；原點＝座位的地面）寫成 OBJ＋MTL（顏色照材質名字：SKIN／HAIR／CLOTH 的上衣、下身、鞋子），給 Blender 拍側面。
//   --state before＝C.SIT_FIT 清空（舊的 0.47×身高比例）、after＝現在的；--mode chair＝一般椅子（sitFeet 開）、lecture＝階梯教室（sitFeet 關）
// 用法（開發分支）：node tools/anim/sit_pose_export.js 輸出資料夾 char.npc_f1,char.npc_m1 [before,after] [chair,lecture]
const path=require('path'), fs=require('fs');
const ROOTDIR=path.resolve(__dirname,'../..');
const {preload}=require(path.join(ROOTDIR,'tools/dev_scratch/spring_sim/harness.js'));
const out=process.argv[2], keys=(process.argv[3]||'char.npc_f1,char.npc_m1').split(','), states=(process.argv[4]||'before,after').split(','), modes=(process.argv[5]||'chair,lecture').split(',');
const COL=n=>{ n=String(n||''); if(/HAIR/i.test(n)) return [0.30,0.22,0.17]; if(/SKIN|FACE|Face_/i.test(n)) return [0.93,0.80,0.71]; if(/EYE|Iris|Brow|lash|line|Mouth/i.test(n)) return [0.25,0.2,0.2];
  if(/Shoe|Loafer|Sneaker|Boot/i.test(n)) return [0.18,0.18,0.2]; if(/Bottom|Pants|Skirt|Jeans/i.test(n)) return [0.25,0.32,0.48]; if(/Top|Shirt|Knit|Hood|Jacket|Coat|Onepiece|Dress|CLOTH/i.test(n)) return [0.78,0.80,0.84]; return [0.6,0.6,0.62]; };
(async()=>{
  fs.mkdirSync(out,{recursive:true}); await preload(keys);
  /* 坐姿循環的片段（ual_sit_clips：身體、手放在大腿上；遊戲裡坐著的人都有）也載進來，畫面才和遊戲一樣；每個人的坐姿偏移、小動作用固定的亂數 */
  { const k='char.ual_sit_clips', u=ASSETS.manifest[k]&&ASSETS.manifest[k].url; if(u&&fs.existsSync(path.join(ROOTDIR,u))){ window.ASSET_DATA[u]=fs.readFileSync(path.join(ROOTDIR,u)).toString('base64'); await ASSETS.loadOne(k).catch(()=>null); } }
  { let sd=7; CHAR.ambRand=()=>{ sd=(sd*16807)%2147483647; return sd/2147483647; }; }
  const FIT=Object.assign({},CHAR.SIT_FIT||{}), scene=new THREE.Scene(), V=new THREE.Vector3();
  for(const key of keys) for(const state of states) for(const mode of modes){
    for(const k in CHAR.SIT_FIT) delete CHAR.SIT_FIT[k]; if(state==='after') Object.assign(CHAR.SIT_FIT,FIT); if(CHAR._ambReset) CHAR._ambReset();
    const m=ASSETS.manifest[key], h=CHAR.build({model:key,height:m.height}); scene.add(h); h.position.set(0,0,0); h.rotation.y=0;
    for(let i=0;i<4;i++) CHAR.animate(h,1/30,{pose:'idle',speed:0}); if(mode==='lecture') h.userData.sitFeet=false;
    for(let i=0;i<40;i++) CHAR.animate(h,1/30,{pose:'sit',speed:0}); scene.updateMatrixWorld(true);   /* 片段晚一點才好：0.8 秒內從靜態坐姿換過去 */
    const base=key.replace(/^char\./,'')+'_'+state+'_'+mode; let obj='mtllib '+base+'.mtl\n', mtl='', nv=0, mats={};
    h.traverse(o=>{ if(!o.isMesh||!o.visible||/blobShadow/i.test(o.name||'')) return;   /* 腳下的圓形影子不要 */ let vis=true; for(let p=o;p;p=p.parent) if(p.visible===false) vis=false; if(!vis) return;
      const ms=Array.isArray(o.material)?o.material:[o.material], g=o.geometry, pa=g.attributes.position; if(!pa) return;
      for(let v=0;v<pa.count;v++){ if(o.isSkinnedMesh||o.morphTargetInfluences) o.getVertexPosition(v,V); else V.fromBufferAttribute(pa,v); o.localToWorld(V); obj+='v '+V.x.toFixed(4)+' '+V.y.toFixed(4)+' '+V.z.toFixed(4)+'\n'; }
      const idx=g.index?g.index.array:null, groups=g.groups&&g.groups.length?g.groups:[{start:0,count:idx?idx.length:pa.count,materialIndex:0}];
      for(const gr of groups){ const mt=ms[gr.materialIndex]||ms[0], mn=(mt&&mt.name)||o.name||'m'; if(/\(Outline\)/.test(mn)) continue;   /* MToon 的描邊（同一組頂點）不要 */ const id='m'+Object.keys(mats).length; if(!mats[mn]){ mats[mn]=id; const c=COL(mn+'|'+o.name); mtl+='newmtl '+id+'\nKd '+c.join(' ')+'\n'; }
        obj+='usemtl '+mats[mn]+'\n'; for(let i=gr.start;i<gr.start+gr.count;i+=3){ const a=idx?idx[i]:i, b=idx?idx[i+1]:i+1, c=idx?idx[i+2]:i+2; obj+='f '+(nv+a+1)+' '+(nv+b+1)+' '+(nv+c+1)+'\n'; } }
      nv+=pa.count; });
    fs.writeFileSync(path.join(out,base+'.obj'),obj); fs.writeFileSync(path.join(out,base+'.mtl'),mtl);
    console.log(base,'頂點',nv,'往下',CHAR.sitDrop(h).toFixed(3));
    scene.remove(h); if(CHAR.release) CHAR.release(h); }
})().catch(e=>{ console.error(e); process.exit(2); });
