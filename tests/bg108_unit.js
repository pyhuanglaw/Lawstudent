// 第十批 2D 背景 10 張（使用者 2026-11-02 傳給 BB，BB_132 第 108 組，BB 驗收 PASS；企劃線 84fdd1ce7 docs/story_planning/incoming/bg108_使用者1102/）——不需要瀏覽器。做法同 tests/bg107_unit.js。
//   1  十個代號都在 OUT.BG、指到 assets/bg/<代號>.webp、檔案存在、尺寸 1672×941
//   2  每一場實際演一次（EVENTS.run），H.bgs 有對的那張圖：l118_home_diner＝芯慈 G7 ev_xc_sameday（巷口家常菜）；pasta118_night＝SQ12 ev_sq12_pasta；
//        wenzhou_teahouse＝SQ14 回診 ev_sq14_vet 的第二段（一盞茶屋）；日本篇空白日：jp_100yen（ev_jpb_100yen、_alone）、jp_bike_shop（ev_jpb_bike、_repair）、
//        jp_supermarket（ev_jpb_market）、jp_morning_market（ev_jpb_w_market）、jp_old_bookstore（ev_jpb_w_books）、jp_post_office（ev_jpb_post）、jp_secondhand_shop（ev_jpb_r_shop）
// 修改前（bec6fe0b0）：十個代號沒有登記、這些場是深色底＋地點字幕——FAIL。用法：node tests/bg108_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（做法同 tests/aa497_supporting_unit.js：pg_harness 已經載過的不再載；畫 3D、要 DOM 的跳過）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const loadErr=[];
{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'); const files=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/')&&!PG_FILES.has(f)&&!SKIP.has(f));
  for(const f of files){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e.message).slice(0,100)); } } }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};

const KEYS=['l118_home_diner','pasta118_night','wenzhou_teahouse','jp_100yen','jp_bike_shop','jp_supermarket','jp_morning_market','jp_old_bookstore','jp_post_office','jp_secondhand_shop'];
/* webp 的寬高（VP8／VP8L／VP8X 三種格式頭）*/
const webpSize=f=>{ const b=fs.readFileSync(f); if(b.toString('ascii',0,4)!=='RIFF'||b.toString('ascii',8,12)!=='WEBP') return null; const t=b.toString('ascii',12,16);
  if(t==='VP8 ') return [b.readUInt16LE(26)&0x3fff,b.readUInt16LE(28)&0x3fff];
  if(t==='VP8L'){ const v=b.readUInt32LE(21); return [(v&0x3fff)+1,((v>>14)&0x3fff)+1]; }
  if(t==='VP8X') return [1+b.readUIntLE(24,3),1+b.readUIntLE(27,3)]; return null; };
const img=b=>b&&typeof b==='object'?b.image:b;
const ev=id=>STORY_EVENTS.find(e=>e&&e.id===id)||null;

(async()=>{
check('0. index.html 的檔都載得進來（3D、DOM 那幾支除外）',!loadErr.length,J(loadErr));
/* ---- 1 登記、檔案、尺寸 ---- */
for(const k of KEYS){ const B=OUT.BG[k], f=B&&B.image?path.join(H.ROOT,B.image):null, sz=f&&fs.existsSync(f)?webpSize(f):null;
  check('1. '+k+'：OUT.BG 指到 assets/bg/'+k+'.webp、檔案在、1672×941',!!B&&B.image==='assets/bg/'+k+'.webp'&&!!sz&&sz[0]===1672&&sz[1]===941&&OUT.bg(k).image===B.image,J([B,sz])); }

/* ---- 2 每一場實際演一次 ---- */
const run=async(id,key,o)=>{ o=o||{}; const e=ev(id); H.fresh(o.day||'2027-10-16',o.h||15,o.zone||'campus',o.flags||{}); H.G.outings=[]; H.bgs=[]; H.said=[]; H.opts=[]; H.picks=(o.picks||[]).slice();
  let err=''; if(e){ try{ await EVENTS.run(e); }catch(x){ err=String(x&&x.message||x).slice(0,120); } }
  const want='assets/bg/'+key+'.webp', got=H.bgs.map(img);
  check('2. '+id+'（'+(o.name||'')+'）演出時的背景是 '+key,!!e&&got.includes(want),J({found:!!e,got,err})); };
const JP={EXCHANGE_ROUTE:'JP'};
await run('ev_xc_sameday','l118_home_diner',{name:'芯慈 G7 今天想破例・巷口家常菜',h:18});
await run('ev_sq12_pasta','pasta118_night',{name:'SQ12 週一公休的那一晚・Pasta 118',h:19});
await run('ev_sq14_vet','wenzhou_teahouse',{name:'SQ14 回診以後・溫州街一盞茶屋'});
for(const [id,key,day,h,name] of [['ev_jpb_100yen','jp_100yen','2028-03-29',14,'車站旁邊的百元商店（一起）'],['ev_jpb_100yen_alone','jp_100yen','2028-03-29',14,'車站旁邊的百元商店（一個人）'],
  ['ev_jpb_bike','jp_bike_shop','2028-03-31',15,'二手腳踏車店'],['ev_jpb_bike_repair','jp_bike_shop','2028-04-08',15,'二手腳踏車店（挽回中）'],['ev_jpb_market','jp_supermarket','2028-04-01',16,'小鎮的超市'],
  ['ev_jpb_w_market','jp_morning_market','2028-04-15',8,'小鎮的早市'],['ev_jpb_w_books','jp_old_bookstore','2028-05-20',14,'鎮上的舊書店'],['ev_jpb_post','jp_post_office','2028-08-01',10,'郵局'],['ev_jpb_r_shop','jp_secondhand_shop','2028-05-20',14,'二手店']])
  await run(id,key,{name,day,h,flags:JP});

H.done();
})();
