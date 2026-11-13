// SHOP-REALISM-1112／D160（使用者 2026-11-12 21:5x 對 LAWWW2-C：「早就該這麼做了 這些素材早就跟你講了 一定要寫進規則 每間店做好的也要檢查 用這些素材更貼近2D圖篇」）
// 每一間店的店內模型（GLB）都要用 Poly Haven／ambientCG 的 CC0 掃描模型、材質組（CLAUDE.md §12 第 2 點「素材」），而且不是一物一純色。
// 一間店算「有用 CC0」要三樣都有：
//   ① LICENSES.md「Poly Haven 模型」那一節有一列寫到這個模型（路徑或檔名）＝店裡的道具有用掃描模型
//   ② LICENSES.md 的 ambientCG／Poly Haven 貼圖有一列寫到它＝有用 CC0 材質組
//   ③ 沒貼圖的純色零件少於 25%（和地點關卡 place_gate 的「質感」同一個算法，門檻比它的 ★50% 嚴）
// 店的清單：tests/place_gate_coplanar.json 的鍵（地點關卡 node tests/place_gate_unit.js --coplanar 從每一間店的區域算出來的店內模型）＋下面 EXTRA。
// 以前做好、還沒重做的店：記在 tests/shop_cc0_baseline.json（每一間都是 SHOP-REALISM-1112 要重做的），只印、不擋。
//   擋的是：①新做的店沒用 CC0 ②基準表上的店已經改好了、表還沒拿掉（照實更新：node tests/shop_cc0_unit.js --write，和模型同一個 commit 交）
// 用法：node tests/shop_cc0_unit.js [--write] [--json]   給地點關卡用：require('./shop_cc0_unit.js').cc0Of(glb 路徑)
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
const EXTRA=['assets/models/env/second_ai/tz_wente_interior.glb'];   /* 只從街上看、不進去的店內（S.REAL_VIEW）：地點關卡的店清單沒有 */
const BASE_FILE=path.join(__dirname,'shop_cc0_baseline.json'), COP_FILE=path.join(__dirname,'place_gate_coplanar.json');

function glbJson(p){ try{ const fd=fs.openSync(path.join(ROOT,p),'r'); const h=Buffer.alloc(20); fs.readSync(fd,h,0,20,0); const n=h.readUInt32LE(12); const b=Buffer.alloc(n); fs.readSync(fd,b,0,n,20); fs.closeSync(fd); return JSON.parse(b.toString('utf8')); }catch(e){ return null; } }
let LIC=null;
/* LICENSES.md 的每一列分兩種：model＝Poly Haven 掃描模型（「Poly Haven 模型」那一節）；material＝CC0 材質組（ambientCG、Poly Haven 貼圖） */
function licRows(){ if(LIC) return LIC; LIC=[]; let txt=''; try{ txt=fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8'); }catch(e){ return LIC; }
  let head=''; for(const line of txt.split('\n')){ if(/^#/.test(line)){ head=line; continue; } if(!/^\|/.test(line)) continue;
    let kind=null; if(/poly\s*haven/i.test(head)&&/模型|model/i.test(head)) kind='model'; else if(/ambientcg/i.test(head)||/poly\s*haven/i.test(head)||/ambientcg|poly\s*haven|polyhaven\.com/i.test(line)) kind='material';
    if(kind) LIC.push({kind,line}); }
  return LIC; }
const FLAT_MAX=25;   /* 沒貼圖的純色零件要少於 25%（烘焙成一張貼圖的是 0%） */
/* 一個模型：{ok, model, material, flatPct, prims, why} */
function cc0Of(p){ const r={glb:p,ok:false,model:false,material:false,flatPct:null,prims:0,why:''};
  if(!fs.existsSync(path.join(ROOT,p))){ r.why='檔案不存在'; return r; }
  const stem=path.basename(p).replace(/\.glb$/i,''); const re=new RegExp('(^|[^A-Za-z0-9_])'+stem.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'(\\.glb)?([^A-Za-z0-9_]|$)');
  for(const L of licRows()) if(L.line.includes(p)||re.test(L.line)) r[L.kind]=true;
  const j=glbJson(p); if(!j){ r.why='讀不了 GLB'; return r; }
  const mats=j.materials||[]; let n=0, flat=0;
  for(const m of j.meshes||[]) for(const q of m.primitives||[]){ n++; const mt=mats[q.material]; const pb=(mt&&mt.pbrMetallicRoughness)||{}; if(!pb.baseColorTexture) flat++; }
  r.prims=n; r.flatPct=n?Math.round(flat*100/n):100;
  const why=[]; if(!r.model) why.push('沒有 Poly Haven 掃描模型（LICENSES.md「Poly Haven 模型」沒有一列寫到它）'); if(!r.material) why.push('沒有 CC0 材質組（ambientCG／Poly Haven 貼圖沒有一列寫到它）'); if(r.flatPct>=FLAT_MAX) why.push('沒貼圖的純色零件 '+r.flatPct+'%（零件 '+n+' 個，要 <'+FLAT_MAX+'%）');
  r.ok=!why.length; r.why=why.join('；'); return r; }
function shopGlbs(){ let L=[]; try{ L=Object.keys(JSON.parse(fs.readFileSync(COP_FILE,'utf8'))); }catch(e){} for(const p of EXTRA) if(!L.includes(p)) L.push(p); return L.filter(p=>!/_stair\.glb$/.test(p)).sort(); }   /* 樓梯間（*_stair.glb）不是店內 */
module.exports={cc0Of,shopGlbs};

if(require.main===module){ const ARGV=process.argv.slice(2);
  let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
  const list=shopGlbs(), res=list.map(cc0Of); let base={}; try{ base=JSON.parse(fs.readFileSync(BASE_FILE,'utf8')).todo||{}; }catch(e){}
  if(ARGV.includes('--json')){ console.log(JSON.stringify(res,null,1)); process.exit(0); }
  check('0. 店的清單讀得到（place_gate_coplanar.json＋只從街上看的店）',list.length>=10,list.length+' 個模型');
  if(ARGV.includes('--write')){ const todo={}; for(const r of res) if(!r.ok) todo[r.glb]={task:'SHOP-REALISM-1112',why:r.why};
    fs.writeFileSync(BASE_FILE,JSON.stringify({note:'shop_cc0_unit.js --write 產生：還沒改用 CC0 素材的店內模型（D160；每一間都是 SHOP-REALISM-1112 要重做的）。改好一間就重跑 --write，這一列會消失。',todo},null,1)+'\n');
    console.log('寫好了 tests/shop_cc0_baseline.json：還沒用 CC0 的 '+Object.keys(todo).length+' 個／共 '+res.length+' 個'); process.exit(0); }
  const okN=res.filter(r=>r.ok).length; console.log('店內模型 '+res.length+' 個：用了 CC0 '+okN+' 個、還沒 '+(res.length-okN)+' 個');
  for(const r of res){ const inBase=!!base[r.glb];
    if(r.ok) check('1. '+r.glb+' 有用 CC0',!inBase,inBase?'已經改好了：基準表 tests/shop_cc0_baseline.json 還寫它沒用——跑 --write 拿掉':'');
    else if(inBase) console.log('TODO '+r.glb+'　'+r.why+'｜SHOP-REALISM-1112');
    else check('1. '+r.glb+' 有用 CC0',false,r.why+'（新的店、或這一間原本有、現在壞了；D160）'); }
  for(const k of Object.keys(base)) if(!list.includes(k)) check('2. 基準表的 '+k+' 還在店的清單上',false,'模型改名或拿掉了：跑 --write 更新');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0); }
