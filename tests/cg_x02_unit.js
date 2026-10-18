// USER_WANTS X02：已通過的 CG 接上遊戲裡已有的事件（2026-10-18）——不需要瀏覽器。用法：node tests/cg_x02_unit.js
//   CG-11 以安理由欄、CG-12 語彤分一點時間（termend_lines.js 早就呼叫）、BCG-29 可昕春假回程（events.js K8，「我不睡」和「過了收費站」中間）
// 修改前：三個 id 不在 CG_REGISTRY、assets/cg/ 沒有檔（ADV.cg 找不到就不顯示）
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const adv=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=/^const CG_REGISTRY=(\{.*\});$/m.exec(adv);
check('CG_REGISTRY 還是一行', !!m); const REG=m?eval('('+m[1]+')'):{};
const want={cg_reason_column_heroine01:'assets/cg/heroine_01/cg_reason_column.webp',cg_share_time_heroine03:'assets/cg/heroine_03/cg_share_time.webp',cg_dont_sleep_kexin:'assets/cg/kexin/cg_dont_sleep.webp'};
for(const id in want){ const r=REG[id]; check(id+' 登錄、檔案在', r&&r.file===want[id]&&fs.existsSync(path.join(ROOT,r.file))&&fs.statSync(path.join(ROOT,r.file)).size>50000, r&&r.file); }
const te=fs.readFileSync(path.join(ROOT,'src/data/termend_lines.js'),'utf8');
check('termend_lines.js 呼叫 CG-11、CG-12', /cg:'cg_reason_column_heroine01'/.test(te)&&/cg:'cg_share_time_heroine03'/.test(te));
const ev=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
check('K8 回程：「我不睡」→ BCG-29 →「過了收費站」', /我不睡。我要陪你開車。'\},\s*\{cg:'cg_dont_sleep_kexin'\}[^\n]*\n\s*\{speaker:null,text:'過了收費站/.test(ev));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
