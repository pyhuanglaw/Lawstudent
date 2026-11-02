// 只有地點字幕（深色底）、但 assets/bg 已經有現成圖的場景補 bg（BB 11-02 掃描；做法同 tests/bg107_unit.js）——不需要瀏覽器。
//   1  每一場實際演一次（EVENTS.run），ADV.begin／setBg 拿到的背景（pg_harness 的 H.bgs）有對的那張圖：
//        gym_court＝明軒三對三 ev_mx_3on3；jp_riverbank＝交換生的花見 ev_jpb_hanami；jp_dorm_lobby＝交換生的送別會 ev_jpb_farewell；
//        jp_intl_office＝最後一次去學校 ev_jpb_lastschool；jp_beach＝海之日 ev_jpb_r_sea；noodle_table＝ev_moot_6（停用）；
//        gongguan＝ev_y0_e19（停用）；ntu_linze＝ev_y0_e24b2（停用）；wancai_seminar＝吉他社社課 ev_sq06_club
//   2  沒接的（圖和那一場對不上，註解寫了原因）：河堤的煙火兩場（jp_riverbank 是白天櫻花）、腳踏車的鏈條（jp_dorm_gate 是傍晚＋七夕竹子）、
//        她退租前的打掃（jp_room 是「你的房間」）——照舊只有地點字幕
//   3  經濟系暑假「臺北的家」三場（ev_vf_y0_0713、ev_vf_y0_0719_sis、ev_vf_y0_0726_sis）：trigger home，人在家＝沒給 bg 的場景用 HOME.bgNow()
//        （events3d.js），白天是 home_dining_day，不是深色底——不另外寫死
// 修改前（d0f895902）：第 1 項九場都是深色底——FAIL。用法：node tests/bg_dark12_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
const img=b=>b&&typeof b==='object'?b.image:b;
const ev=id=>STORY_EVENTS.find(e=>e&&e.id===id)||null;
const play=async(id,o)=>{ o=o||{}; const e=ev(id); H.fresh(o.day||'2027-10-16',o.h||15,o.zone||'campus',o.flags||{}); if(o.econ) H.G.stage='econ'; if(o.home) H.G.home={at:true}; global.GAME={G:H.G};
  H.G.outings=[]; H.bgs=[]; H.said=[]; H.opts=[]; H.picks=(o.picks||[]).slice(); let err=''; if(e){ try{ await EVENTS.run(e); }catch(x){ err=String(x&&x.message||x).slice(0,120); } }
  return {e,got:H.bgs.map(img),err}; };

(async()=>{
check('0. index.html 的檔都載得進來（3D、DOM 那幾支除外）',!loadErr.length,J(loadErr));
/* ---- 1 ---- */
const JP={EXCHANGE_ROUTE:'JP'};
for(const [id,key,o] of [
  ['ev_mx_3on3','gym_court',{name:'明軒三對三・新體育館 1F 球場',day:'2027-06-12',h:9}],
  ['ev_jpb_hanami','jp_riverbank',{name:'交換生的花見・河堤',day:'2028-04-08',h:13,flags:JP}],
  ['ev_jpb_farewell','jp_dorm_lobby',{name:'交換生的送別會・宿舍大廳',day:'2028-07-29',h:18,flags:JP}],
  ['ev_jpb_lastschool','jp_intl_office',{name:'最後一次去學校・國際學生辦公室',day:'2028-08-02',h:10,flags:JP}],
  ['ev_jpb_r_sea','jp_beach',{name:'海之日・海邊',day:'2028-07-17',h:9,flags:JP}],
  ['ev_moot_6','noodle_table',{name:'阿鳳麵店（停用的事件）',h:19}],
  ['ev_y0_e19','gongguan',{name:'公館的聚餐（停用的事件）',day:'2025-01-02',h:19,econ:true}],
  ['ev_y0_e24b2','ntu_linze',{name:'偷偷旁聽・法律系館A（停用的事件）',day:'2025-02-26',h:8,econ:true}],
  ['ev_sq06_club','wancai_seminar',{name:'吉他社社課・法律系館B 多功能教室'}] ]){
  const want='assets/bg/'+key+'.webp', r=await play(id,o);
  check('1. '+id+'（'+o.name+'）：'+key+' 有登錄、檔案在，演出時用這張',!!OUT.BG[key]&&OUT.BG[key].image===want&&fs.existsSync(path.join(H.ROOT,want))&&!!r.e&&r.got.includes(want),J({found:!!r.e,got:r.got,err:r.err})); }
/* ---- 2 沒接的 ---- */
/* 第 109 組（BB 07:50）補了對得上的圖：煙火、五月上午的宿舍門口、以安的房間（打包好）——不再借用白天櫻花／七夕／你的房間 */
for(const [id,scene,bg] of [['ev_jpb_w_fire','河堤','jp_riverbank_fireworks'],['ev_jpb_r_fire','河堤','jp_riverbank_fireworks'],['ev_jpb_w_chain','宿舍門口','jp_dorm_gate_morning'],['ev_jpb_clean','她的房間','jp_an_room_packed'],['ev_jpb_w_light','她的房間門口','jp_an_room_door']]){ const e=ev(id), l=e&&e.dialogue.find(x=>x&&x.scene!==undefined);
  check('2. '+id+'（'+scene+'）：第 109 組的 '+bg+'（不借用對不上的圖）',!!l&&l.scene===scene&&l.bg===bg&&!!OUT.bg(bg),J(l)); }
/* ---- 3 臺北的家 ---- */
for(const [id,day,h] of [['ev_vf_y0_0713','2025-07-13',10],['ev_vf_y0_0719_sis','2025-07-19',12],['ev_vf_y0_0726_sis','2025-07-26',12]]){ const r=await play(id,{day,h,zone:'home',econ:true,home:true});
  check('3. '+id+'（臺北的家 '+h+':00，在家）：沒給 bg 也是家裡的背景 home_dining_day（HOME.bgNow），不是深色底',!!r.e&&r.got.includes('assets/bg/home_dining_day.webp'),J({found:!!r.e,got:r.got,err:r.err})); }
H.done();
})();
