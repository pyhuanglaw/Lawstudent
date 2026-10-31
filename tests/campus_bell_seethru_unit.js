// 傅鐘鐘亭擋跟隨鏡頭（CAM-BELL-1031，LAWWW2-B 2026-10-31）——不需要瀏覽器，讀 GLB。
// 行政大樓門廊往東、西走 1.3 m（玩家 (−36.7／−39.3, 23.5) 面向行政大樓），跟隨鏡頭在人後面 5.9 m，正好落在傅鐘 (−38, 16.5) 的鐘亭裡：
//   整個畫面是柱子、梁的石材（CAM-PILLAR-HALLS-1031 交件時回報的）。
// 做法（和行政大樓門廊石柱 seethru_ck_col 同一套）：campus_bell.py 的柱子、梁、線腳、石碑改用另一個材質 seethru_bell_stone；
//   zones3d.js 的 attachWenzhouModel 把 seethru_ 開頭的材質標樹幹透視（擋住玩家、或離鏡頭太近時網點透空）。台基、屋頂、寶頂照舊。
// 檢查：①GLB 有 seethru_bell_stone、範圍是柱子到梁（台基上面到梁頂，不含屋頂）；台基照舊 ck_bell_stone（在地面）
//       ②傅鐘照舊用 attachWenzhouModel 接，attachWenzhouModel 照舊認 seethru_ 開頭的材質
// 用法：node tests/campus_bell_seethru_unit.js
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_bell.glb')), n=b.readUInt32LE(12), j=JSON.parse(b.slice(20,20+n).toString('utf8')), bin=b.slice(20+n+8);
function yRange(name){ let lo=Infinity, hi=-Infinity, tri=0; const names=j.materials.map(m=>m.name);
  for(const nd of j.nodes){ if(nd.mesh==null) continue; const t=nd.translation||[0,0,0];
    for(const pr of j.meshes[nd.mesh].primitives){ if(names[pr.material]!==name) continue; const a=j.accessors[pr.attributes.POSITION], bv=j.bufferViews[a.bufferView], o=(bv.byteOffset||0)+(a.byteOffset||0), st=bv.byteStride||12;
      tri+=(pr.indices!=null?j.accessors[pr.indices].count:a.count)/3; for(let k=0;k<a.count;k++){ const y=bin.readFloatLE(o+k*st+4)+t[1]; if(y<lo) lo=y; if(y>hi) hi=y; } } }
  return {lo,hi,tri}; }
const P=yRange('seethru_bell_stone'), S=yRange('ck_bell_stone'), R=yRange('ck_bell_roof');
check('① 柱子、梁、石碑另外一個材質 seethru_bell_stone（從地面〔石碑〕到梁頂，不到屋頂）',P.tri>0&&P.lo<0.05&&P.hi>2.5&&P.hi<R.hi-0.5,'y '+P.lo.toFixed(2)+'～'+P.hi.toFixed(2)+'、'+P.tri+' 個三角形；屋頂到 '+R.hi.toFixed(2));
check('① 台基照舊 ck_bell_stone（台基＋屋頂上的寶頂）',S.tri>0&&S.lo<0.05,'y '+S.lo.toFixed(2)+'～'+S.hi.toFixed(2)+'、'+S.tri+' 個三角形');
{ const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('② 傅鐘照舊用 attachWenzhouModel 接',/ASSETS\.loadOne\('bldg\.campus_bell'\)[\s\S]{0,200}attachWenzhouModel\(/.test(src));
  const i=src.indexOf('function attachWenzhouModel('), body=i>=0?src.slice(i,i+8000):'';
  check('② attachWenzhouModel 照舊把 seethru_ 開頭的材質標樹幹透視',/\/\^seethru_\/\.test\(nm\)/.test(body)&&/patchSeeThrough/.test(body),i<0?'找不到 attachWenzhouModel':''); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
