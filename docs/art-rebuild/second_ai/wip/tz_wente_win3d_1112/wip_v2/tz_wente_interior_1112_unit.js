// SHOP-WINDOW-3D-1112 v2（LAWWW2-C 2026-11-12）：汀州路溫特寶邸玻璃後面的店內（tz_wente_interior.glb）
// 使用者 11-12 19:5x 對 v1：「醜到爆又沒質感 跟2d差太多了 可以停止複製貼上一樣大小的方塊嗎」→ v2：真形狀＋貼圖＋烘焙光影的一顆店內模型。
// 檢查：①GLB 在、大小對（5.2×3.1×3.6）、一張烘好的貼圖（不是頂點色方塊）、三角形夠多又不爆量 ②街景模型溫特寶邸那一格不再有照片卡（real）③tingzhou3d.js 把它接到 shopInsideReal
const fs=require('fs'), path=require('path'); const R=path.join(__dirname,'..');
let fails=0; const ok=(c,m,x)=>{ console.log((c?'PASS ':'FAIL ')+m+(x?'　'+x:'')); if(!c) fails++; };
function glb(p){ const b=fs.readFileSync(p); const n=b.readUInt32LE(12); return {j:JSON.parse(b.slice(20,20+n).toString()),size:b.length}; }
const P=path.join(R,'assets/models/env/second_ai/tz_wente_interior.glb');
if(!fs.existsSync(P)) ok(false,'① tz_wente_interior.glb 存在');
else {
  const {j,size}=glb(P); let tris=0, mn=[1e9,1e9,1e9], mx=[-1e9,-1e9,-1e9], vc=false;
  for(const m of j.meshes) for(const p of m.primitives){ const a=j.accessors[p.indices!==undefined?p.indices:p.attributes.POSITION]; tris+=Math.floor(a.count/3); if(p.attributes.COLOR_0!==undefined) vc=true;
    const q=j.accessors[p.attributes.POSITION]; for(let i=0;i<3;i++){ mn[i]=Math.min(mn[i],q.min[i]); mx[i]=Math.max(mx[i],q.max[i]); } }
  const dim=mx.map((v,i)=>+(v-mn[i]).toFixed(2));
  ok(Math.abs(dim[0]-4.98)<0.1&&Math.abs(dim[1]-3.12)<0.1&&Math.abs(dim[2]-3.62)<0.1,'① 店內大小 寬 4.96 × 高 3.1 × 深 3.6（遊戲座標 x、y、z）',JSON.stringify(dim));
  ok(j.materials.length===1&&j.materials[0].pbrMetallicRoughness&&j.materials[0].pbrMetallicRoughness.baseColorTexture!==undefined&&!vc,'① 一個材質、一張烘好的貼圖、沒有頂點色（不是 v1 那種平塗方塊）');
  ok((j.images||[]).length===1,'① 只有一張圖',(j.images||[]).map(i=>i.mimeType).join(','));
  ok(tris>=15000&&tris<=80000,'① 三角形 1.5～8 萬（衣服、假人、燈有曲面；不爆量）',String(tris));
  ok(size<6.5e6,'① 檔案 < 6.5 MB',String(size));
}
const st=fs.readFileSync(path.join(R,'tools/blender/env_second/wz_street.py'),'utf8');
ok(/'wente': dict\([^)]*real=True[^)]*back=3\.7/.test(st),'② wz_street.py：溫特寶邸 real=True、牆挖到 3.7 m（照片卡不放）');
const tz=fs.readFileSync(path.join(R,'src/tingzhou3d.js'),'utf8');
ok(/S\.REAL_VIEW=\{wente:\{zone:'tz_wente',asset:'bldg\.tz_wente_interior'/.test(tz)&&/S\.REAL_DEP=\{[^}]*wente:3\.5/.test(tz),'③ tingzhou3d.js：S.REAL_VIEW 溫特寶邸→bldg.tz_wente_interior，玻璃離立面 3.5 m');
// ③ 跑一次 S.shopReal（照 shop_real_inside_1112_unit 的做法：vm 載入兩份配置，抽出 S.REAL_* 和 shopReal 的函式本體）
const vm=require('vm'); const c3={Math,console,ASSETS:{manifest:{}}}; vm.createContext(c3);
for(const f of ['tingzhou_layout.js','tz_shops_layout.js']) vm.runInContext(fs.readFileSync(path.join(R,'src/data',f),'utf8').replace(/^const /mg,'var '),c3);
const m1=/S\.REAL_DEP=(\{[^}]*\});/.exec(tz), m3=/S\.REAL_SX=(\{[^}]*\});/.exec(tz), m4=/S\.REAL_VIEW=(\{[^\n]*\}\});/.exec(tz), m2=/S\.shopReal=function\(\)\{([\s\S]*?)return out; \};/.exec(tz);
let list=[]; try{ list=vm.runInContext('(function(){ const S={REAL_DEP:'+m1[1]+',REAL_SX:'+m3[1]+',REAL_VIEW:'+m4[1]+'}; '+m2[1]+' return out; })()',c3); }catch(e){ console.log('  （抽 shopReal 失敗：'+e.message+'）'); }
global.ASSETS=c3.ASSETS;
const w=list.find(q=>q.id==='wente');
ok(!!w&&w.key==='bldg.tz_wente_interior'&&Math.abs(w.cz-5.75)<0.01&&w.place==='tz_wente','③ S.shopReal() 有溫特寶邸（店內模型、地點 tz_wente、在 z 5.75 那一棟）',w?JSON.stringify({x:+w.x.toFixed(2),z:w.cz,ry:+w.ry.toFixed(2)}):'沒有');
ok(!!(global.ASSETS.manifest['bldg.tz_wente_interior']||{}).url,'③ 資產表補上 bldg.tz_wente_interior');
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
