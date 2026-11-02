// CG 第一批（BB 2026-11-02 19:40，企劃線 62395d7da、c2a4d1a87；AA_597 CG 總表）：每張都有登錄、檔案在；
// 放進事件的每一張都在對應台詞的前一拍；只登錄不放的幾張在事件裡找不到；兩張背景接上（CG-BATCH-1102）
const fs=require('fs'), path=require('path'), ROOT=path.join(__dirname,'..'), R=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'  → '+info)); if(!ok) fails++; };
const adv=R('src/adv3d.js'), REG=eval('('+adv.match(/^const CG_REGISTRY=(\{.*\});$/m)[1]+')');
const esc=s=>s.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
// 放進事件的：key → [檔案, CG 那一拍的寫法, 下一拍（對應的台詞）]
const PLACED={
  cg_reason_column_heroine01:['src/data/termend_lines.js',"{cg:'cg_reason_column_heroine01'}","{narr:'（她把手帳拿回去，舉到下巴前面。只露出眼睛。）'}"],   // CG-11
  cg_sakura_riverbank_heroine01:['src/data/r2y3b_events.js',"cg('cg_sakura_riverbank_heroine01')",null],   // CG-23（位置照舊，只換圖）
  cg_date_answer_heroine01:['src/data/confess_lines.js',"{cg:'cg_date_answer_heroine01'}","'我現在就可以回答。'"],   // CG-32
  cg_tanabata_pocket_heroine01:['src/data/r2y3b_events.js',"cg('cg_tanabata_pocket_heroine01')","{speaker:null,text:'（剪票口。她把自己那份行程表折好，塞進你的口袋。）'}"],   // CG-34
  cg_airport_return_heroine01:['src/data/r2y3b_events.js',"cg('cg_airport_return_heroine01')","{speaker:null,text:'（她一出來就看到你。行李箱上貼著一張商店街的七夕貼紙。）'}"],   // CG-35
  cg_xmas_card_heroine01:['src/data/fest_events.js',"cg('cg_xmas_card_heroine01')","N('（她遞過來一張卡片）')"],   // CG-38
  cg_valentine_level_heroine04:['src/data/fest_events.js',"cg('cg_valentine_level_heroine04')","N('（插座貓走到終點，畫面跳出一行字：「下次換你做一關給我。」）')"] };   // CG-106
const ONLY_REG=['cg_line_qr_heroine01','cg_admin_court_heroine01','cg_japan_exchange_heroine01','cg_redpen_night_peishan','cg_reunion_window_table_layer_umbrella_heroine03'];   // CG-28、29、30、119、10b
const ALL=Object.keys(PLACED).concat(ONLY_REG);
const miss=ALL.filter(k=>!REG[k]||!REG[k].title||!fs.existsSync(path.join(ROOT,REG[k].file)));
check('1. 12 個 key 都在 CG_REGISTRY、有標題、檔案存在',!miss.length,miss.join('、'));
const files=ALL.map(k=>REG[k]&&REG[k].file); check('2. 檔案不重複（每張一個檔）',new Set(files).size===files.length);
// src 裡（CG_REGISTRY 以外）出現的地方
const SRC=[]; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&p!=='src/adv3d.js') SRC.push(p); } })('src');
const uses=k=>SRC.filter(p=>R(p).includes(k));
for(const [k,[f,cg,next]] of Object.entries(PLACED)){
  const s=R(f), n=s.split(cg).length-1;
  check('3. '+k+'：只放在 '+f+' 一處',n===1&&uses(k).length===1&&uses(k)[0]===f,JSON.stringify({n,uses:uses(k)}));
  if(next) check('4. '+k+'：在對應台詞的前一拍',new RegExp(esc(cg)+',\\s*'+esc(next)).test(s));
}
{ const s=R('src/data/r2y3b_events.js'); check('4. cg_sakura_riverbank_heroine01（CG-23 換圖，位置照舊）：以安坐著讀書那一句旁白之後',/以安坐著讀書，旁邊放著字典和一個保溫杯。）'\},\s*cg\('cg_sakura_riverbank_heroine01'\)/.test(s)); }
for(const k of ONLY_REG) check('5. 只登錄、不放：'+k+' 事件裡找不到',!uses(k).length,uses(k).join('、'));
// 以安告白 yes（confess_lines.js）：只有「妳不用現在回答」那一個選項（k=2）才有「我現在就可以回答。」和 CG-32
{ global.window=global; eval(R('src/data/confess_lines.js').replace(/^const CONFESS_LINES=/m,'global.CONFESS_LINES=')); const Y=CONFESS_LINES.heroine_01.yes;
  const y2=Y({flags:{}},null,2), y0=Y({flags:{}},null,0), i=y2.findIndex(x=>x&&x.cg==='cg_date_answer_heroine01');
  check('6. CG-32：k=2 那一拍在「我現在就可以回答。」前面；k=0 沒有',i>=0&&y2[i+1]==='我現在就可以回答。'&&!y0.some(x=>x&&x.cg),JSON.stringify(y2)); }
// 跑告白台詞的三個地方都認得 {cg}
check('7. date3d.js 告白（S.confess 的 run）、termend3d.js 回家路上、multirel3d.js 都會處理 {cg:id}',/if\(x\.cg!==undefined\)\{ if\(typeof ADV!=='undefined'&&ADV\.cg\) ADV\.cg\(x\.cg\); continue; \}/.test(R('src/date3d.js'))&&/x\.cg!==undefined/.test(R('src/termend3d.js'))&&/it\.cg!==undefined/.test(R('src/multirel3d.js')));
check('8. 一場只放一張（AA 2026-11-02 20:50）：CG-11 不放在玩家先說的那條路（以安 yesCg 是 null）',/HEART[\s\S]*?heroine_01:[\s\S]*?yesCg:null/.test(R('src/data/termend_lines.js'))&&!/yesCg:'cg_reason_column_heroine01'/.test(R('src/data/termend_lines.js')));
// 背景
{ const o=R('src/outings3d.js'), y4a=R('src/data/r2y4a_events.js'), y4b=R('src/data/r2y4b_events.js');
  const bg=k=>{ const m=o.match(new RegExp(k+":\\{label:'[^']+',image:'([^']+)'\\}")); return m&&m[1]; };
  check('9. OUT.BG 有 gc_roadside_car、grad_exam_room，檔案存在',['gc_roadside_car','grad_exam_room'].every(k=>bg(k)==='assets/bg/'+k+'.webp'&&fs.existsSync(path.join(ROOT,bg(k)))));
  check('10. 大峽谷兩條路線（ev_us_canyon、ev_sis_canyon）開頭「她靠在租來的車旁邊」換成 gc_roadside_car',(y4b.match(/\{scene:'亞利桑那',bg:'gc_roadside_car'\},[^\n]*\n\s*\{speaker:null,text:'（她靠在租來的車旁邊，手上拿著一張列印的地圖。）'\}/g)||[]).length===2&&!/bg:'az_roadside'/.test(y4b));
  check('11. 研究所筆試 ev_grad_exam 的「考場」（closed2_3d.js 認 scene:\'考場\'）換成 grad_exam_room',/id:'ev_grad_exam',[\s\S]{0,400}\{scene:'考場',bg:'grad_exam_room'\}/.test(y4a)); }
{ const lic=R('LICENSES.md'); check('12. LICENSES.md 有這一批的 CG、背景兩列',['cg_reason_column.webp','cg_sakura_riverbank.webp','cg_line_qr.webp','cg_date_answer.webp','cg_admin_court.webp','cg_japan_exchange.webp','cg_tanabata_pocket.webp','cg_airport_return.webp','cg_xmas_card.webp','cg_valentine_level.webp','cg_redpen_night.webp','cg_reunion_layer_umbrella_heroine03.webp'].every(f=>lic.includes(f))&&/gc_roadside_car[^\n]*grad_exam_room/.test(lic)); }
{ const t=R('src/r2y4b3d.js'), g=t.slice(t.indexOf('S.gradExam=async function'),t.indexOf('S.gradExam=async function')+600); check('13. 2030 延畢版筆試（r2y4b3d gradExam）背景也是 grad_exam_room（BB 2026-11-02 20:50）',/bg\('grad_exam_room'\)/.test(g)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
