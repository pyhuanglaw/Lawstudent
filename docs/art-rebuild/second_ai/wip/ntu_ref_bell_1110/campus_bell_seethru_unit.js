// 傅鐘鐘亭擋跟隨鏡頭（CAM-BELL-1031，LAWWW2-B 2026-10-31）——不需要瀏覽器，讀 GLB。
// 行政大樓門廊往東、西走 1.3 m（玩家 (−36.7／−39.3, 23.5) 面向行政大樓），跟隨鏡頭在人後面 5.9 m，正好落在傅鐘 (−38, 16.5) 的鐘亭裡：
//   整個畫面是柱子、梁的石材（CAM-PILLAR-HALLS-1031 交件時回報的）。
// 做法（和行政大樓門廊石柱 seethru_ck_col 同一套）：campus_bell.py 的柱子、梁、線腳、石碑改用另一個材質 seethru_bell_stone；
//   zones3d.js 的 attachWenzhouModel 把 seethru_ 開頭的材質標樹幹透視（擋住玩家、或離鏡頭太近時網點透空）。台基、屋頂、寶頂照舊。
// 檢查：①GLB 有 seethru_bell_stone、範圍是柱子到梁（台基上面到梁頂，不含屋頂）；台基照舊 ck_bell_stone（在地面）
//       ②傅鐘照舊用 attachWenzhouModel 接，attachWenzhouModel 照舊認 seethru_ 開頭的材質
// 第 2 版（NTU-REF-1110 ①，LAWWW2 帳號 A 11-10；X223／D136：照官網照片改成沒有屋頂的金屬鐘架）：石柱、梁、瓦頂拿掉，鐘架是 seethru_bell_steel、石碑照舊 seethru_bell_stone。
//   ① 改成「兩種之一」：第 1 版（石柱到梁頂、不到屋頂）或第 2 版（沒有屋頂；鐘架 seethru_bell_steel 從台基一路到頂上，鏡頭會落進去的高的東西都是透視材質；
//     石碑 seethru_bell_stone 在地面）。另外檢查：第 2 版除了透視材質、銅鐘、小零件，沒有別的東西高過台基 0.5 m 以上（不會留下擋鏡頭的實心塊）。
//   ③ NTU-REF-1110：照官網照片——沒有屋頂（ck_bell_roof 沒有三角形）、有金屬鐘架（seethru_bell_steel）。第 1 版（開發分支 327f64bfe）③ FAIL。
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
const ST=yRange('seethru_bell_steel'), V2=ST.tri>0&&R.tri===0;
if(!V2) check('① 柱子、梁、石碑另外一個材質 seethru_bell_stone（從地面〔石碑〕到梁頂，不到屋頂）',P.tri>0&&P.lo<0.05&&P.hi>2.5&&P.hi<R.hi-0.5,'y '+P.lo.toFixed(2)+'～'+P.hi.toFixed(2)+'、'+P.tri+' 個三角形；屋頂到 '+R.hi.toFixed(2));
else { const tall=j.materials.map(m=>m.name).filter(nm=>!/^seethru_/.test(nm)&&!/bronze|lens|dark|board/.test(nm)).filter(nm=>yRange(nm).hi>0.4+0.5);
  check('① 第 2 版：沒有屋頂；鐘架 seethru_bell_steel 從台基到頂上、石碑 seethru_bell_stone 在地面；沒有別的實心材質高過台基 0.5 m',ST.lo<0.5&&ST.hi>4&&P.tri>0&&P.lo<0.05&&tall.length===0,'鐘架 y '+ST.lo.toFixed(2)+'～'+ST.hi.toFixed(2)+'、'+ST.tri+' 個三角形；石碑 y '+P.lo.toFixed(2)+'～'+P.hi.toFixed(2)+'；高的實心材質 '+(tall.join('、')||'無')); }
check('① 台基照舊 ck_bell_stone（台基＋屋頂上的寶頂）',S.tri>0&&S.lo<0.05,'y '+S.lo.toFixed(2)+'～'+S.hi.toFixed(2)+'、'+S.tri+' 個三角形');
check('③ 照官網照片：鐘架沒有屋頂、是金屬鐘架（NTU-REF-1110）',R.tri===0&&ST.tri>0,'屋頂 '+R.tri+' 個三角形、金屬鐘架 '+ST.tri+' 個');
{ const src=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
  check('② 傅鐘照舊用 attachWenzhouModel 接',/ASSETS\.loadOne\('bldg\.campus_bell'\)[\s\S]{0,200}attachWenzhouModel\(/.test(src));
  const i=src.indexOf('function attachWenzhouModel('), body=i>=0?src.slice(i,i+8000):'';
  check('② attachWenzhouModel 照舊把 seethru_ 開頭的材質標樹幹透視',/\/\^seethru_\/\.test\(nm\)/.test(body)&&/patchSeeThrough/.test(body),i<0?'找不到 attachWenzhouModel':''); }
console.log(fails?('FAIL '+fails):'ALL PASS'); process.exit(fails?1:0);
