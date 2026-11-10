// 行政大樓、文學院、校史館外牆照官網改（NTU-REF-1110 ②，LAWWW2 帳號 A 11-10；X223／D136；docs/art-rebuild/second_ai/ntu_ref_keep_change_1110.md）——不需要瀏覽器（D131）。
// 官網（docs/story_planning/ref_images/buildings/README.md）：行政大樓「外牆以紅色清水磚為主」、北棟（臨椰林大道）二層；文學院「國防色的十三溝面磚」；校史館「土黃色的十三溝面磚」。
// 原本：行政大樓米黃面磚 #cdb48e、3 層；文學院 #9b5a42、校史館 #a25d43（都偏紅褐）。檢查：
//   1 campus_hall.py：行政大樓 floors 2、wall_tex red_brick、wall #9e5139；文學院 #9a8560；校史館 #b39762
//   2 zones3d.js 的套件（備用外觀、鏡頭碰撞的高度）和正式模型同一組：行政大樓 floors:2、三棟的 wall 一樣
//   3 正式模型 campus_admin.glb 是兩層的高度（頂 ≤ 13 m；三層時 15.9 m），三棟照舊是 PERF-CAMPUS-GLB ② 的合併材質（wz_vc_*、ck_win_tiles、seethru_ck_tiles）
// 修改前（開發分支 74da28ca9）：1、2、3 FAIL。用法：node tests/ntu_ref_halls_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const PY=fs.readFileSync(path.join(ROOT,'tools/blender/env_second/campus_hall.py'),'utf8'), Z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
const setOf=k=>{ const i=PY.indexOf("'"+k+"': dict("), j=PY.indexOf("\n    '",i+5); return PY.slice(i,j<0?undefined:j); };
const WANT={admin:'#9e5139',arts:'#9a8560',hist:'#b39762'}, SIGN={admin:'行政大樓',arts:'文學院',hist:'校史館'};
{ const A=setOf('admin'), bad=[]; if(!/floors=2,/.test(A)) bad.push('行政大樓 floors'); if(!/wall_tex='red_brick'/.test(A)) bad.push('行政大樓 red_brick');
  for(const k in WANT) if(!new RegExp("wall='"+WANT[k]+"'").test(setOf(k))) bad.push(SIGN[k]+' 顏色');
  check('1 campus_hall.py：行政大樓紅色清水磚、兩層；文學院、校史館土黃～褐十三溝面磚', bad.length===0, bad.join('、')||'三棟'); }
{ const bad=[]; for(const k in WANT){ const m=new RegExp("CK\\.hall\\(\\{[^}]*?floors:(\\d+)[^}]*?wall:'([^']+)'[^)]*?sign:'"+SIGN[k]+"'").exec(Z); if(!m){ bad.push(SIGN[k]+' 找不到'); continue; }
    if(m[2]!==WANT[k]) bad.push(SIGN[k]+' '+m[2]); if(k==='admin'&&m[1]!=='2') bad.push('行政大樓 floors:'+m[1]); }
  check('2 zones3d.js 套件和正式模型同一組（行政大樓 floors:2、三棟的牆色）', bad.length===0, bad.join('、')||'一致'); }
{ const top=k=>{ const b=fs.readFileSync(path.join(ROOT,'assets/models/env/second_ai/campus_'+k+'.glb')), J=JSON.parse(b.slice(20,20+b.readUInt32LE(12)).toString()); let hi=-1e9; const mats=J.materials.map(m=>m.name);
    for(const n of J.nodes){ if(n.mesh==null) continue; for(const p of J.meshes[n.mesh].primitives){ const a=J.accessors[p.attributes.POSITION]; hi=Math.max(hi,a.max[1]+((n.translation||[0,0,0])[1])); } } return {hi,mats}; };
  const A=top('admin'), merged=['admin','arts','hist'].every(k=>{ const m=top(k).mats; return m.some(x=>/^wz_vc_/.test(x))&&m.includes('ck_win_tiles')&&m.includes('seethru_ck_tiles'); });
  check('3 campus_admin.glb 是兩層的高度（頂 ≤ 13 m），三棟照舊是合併材質', A.hi<=13&&merged, '行政大樓頂 '+A.hi.toFixed(2)+' m；合併材質 '+merged); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
