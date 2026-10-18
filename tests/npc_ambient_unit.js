// LAWWW2 的路人底模（8 個 bl_npc_*.vrm，patches/npc_ambient_1ca527d.patch；2026-10-14 LAWWW 整合）——不需要瀏覽器。
// 2026-10-17 使用者 P0（「長得很像的路人真的太多了」）起預設打開（之前要加 ?npcnew）；?npcold 回到舊樣本。分批載入池另見 tests/anon_pool_unit.js。
// 1. 網址加 ?npcold：manifest 裡沒有這 8 個，路人照舊用原本的 4 個可換色模型。
// 2. 預設：8 個進 manifest（ambient、沒有 tintBase）；只給沒有名字的路人（id 'x0'、'x1'…）分到新模型（不再分到舊樣本）；
//    有名字的人物（方奕廷、黃筱涵、教授、不熟同學）永遠用原本可換色的模型＋自己的顏色（CLAUDE.md：角色不能因為共用路人模型而失去識別）；
//    新模型在 Node 裡真的建得出來（VRM 解析、骨架）。
// 修改前（2026-10-14）：?npcnew 沒有作用；2026-10-17 以前：預設沒有新模型（第 2 段失敗）。用法：node tests/npc_ambient_unit.js
const {execFileSync}=require('child_process');
const NEW=['char.npc_nm1','char.npc_nm2','char.npc_nm3','char.npc_nm4','char.npc_nf1','char.npc_nf2','char.npc_nf3','char.npc_nf4'], OLD=['char.npc_m1','char.npc_m2','char.npc_f1','char.npc_f2'];
const NAMED=[['npc_fangyt','m'],['npc_huangxh','f'],['npc_ta_chen','m'],['classmate_u01','m'],['classmate_u02','f'],['prof_zhou','m'],['prof_lin','f']];
if(process.argv[2]==='child'){
  if(process.argv[3]==='npcold') global.location={search:'?npcold'};
  const {preload}=require('../tools/dev_scratch/spring_sim/harness.js');
  const out={inManifest:NEW.filter(k=>!!ASSETS.manifest[k]),noTint:NEW.filter(k=>ASSETS.manifest[k]&&!ASSETS.manifest[k].tintBase&&ASSETS.manifest[k].ambient)};
  (async()=>{
    await preload(OLD.concat(out.inManifest));
    out.anon=[]; for(let i=0;i<40;i++){ const sx=i%2?'m':'f'; const r=CHAR.resolveModel({id:'x'+i,sex:sx,outfit:{top:{color:'#123456'}}}); out.anon.push(r.model); }
    out.named=NAMED.map(([id,sx])=>{ const r=CHAR.resolveModel({id,sex:sx,hair:{color:'#2a1d16'},outfit:{top:{color:'#e0b95b'},bottom:{color:'#4a5a78'}}}); return {id,model:r.model,top:r.tint&&r.tint.top}; });
    out.built=[]; for(const k of out.inManifest.slice(0,2)){ try{ const h=CHAR.build({model:k,height:1.7}); out.built.push(!!(h&&h.userData&&h.userData.vrm)); }catch(e){ out.built.push('ERR '+e.message); } }
    console.log(JSON.stringify(out)); process.exit(0);
  })().catch(e=>{ console.log(JSON.stringify({error:String(e&&e.stack||e)})); process.exit(1); });
} else {
  let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
  const run=mode=>{ try{ const s=execFileSync(process.execPath,[__filename,'child',mode],{encoding:'utf8',maxBuffer:1<<24}); return JSON.parse(s.trim().split('\n').pop()); }catch(e){ return {error:String(e.stdout||e.message).slice(-600)}; } };
  const d=run('npcold'), n=run('default');
  check('1. ?npcold：manifest 裡沒有新的 8 個',!d.error&&d.inManifest.length===0,JSON.stringify(d.error||d.inManifest));
  check('1. ?npcold：沒有名字的路人照舊用原本 4 個',!d.error&&d.anon.every(k=>OLD.includes(k)),JSON.stringify(d.anon));
  check('1. ?npcold：有名字的人用原本的模型＋自己的顏色',!d.error&&d.named.every(q=>OLD.includes(q.model)&&q.top==='#e0b95b'),JSON.stringify(d.named));
  check('2. 預設：8 個進 manifest（ambient、沒有 tintBase）',!n.error&&n.inManifest.length===8&&n.noTint.length===8,JSON.stringify(n.error||n.inManifest));
  const anonNew=(n.anon||[]).filter(k=>NEW.includes(k)).length;
  check('2. 預設：沒有名字的路人都分到新模型（40 個）',!n.error&&anonNew===40,`${anonNew}/40 ${JSON.stringify(n.anon)}`);
  check('2. 預設：有名字的人物（方奕廷、黃筱涵、陳助教、不熟同學、教授）不會分到新模型、保留自己的顏色',!n.error&&n.named.every(q=>OLD.includes(q.model)&&q.top==='#e0b95b'),JSON.stringify(n.named));
  check('2. 預設：新模型建得出來（VRM 解析、有骨架）',!n.error&&n.built.length===2&&n.built.every(b=>b===true),JSON.stringify(n.built));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
}
