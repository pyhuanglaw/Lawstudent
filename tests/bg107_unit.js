// 第九批 2D 背景 10 張（使用者 2026-11-02 07:03 傳給 BB，BB_132 第 107 組，BB 驗收 PASS；企劃線 docs/story_planning/incoming/bg107_使用者1102/）——不需要瀏覽器。
//   1  十個代號都在 OUT.BG、指到 assets/bg/<代號>.webp、檔案存在、尺寸 1672×941（照原檔複製，沒有改尺寸）
//   2  每一場實際演一次（EVENTS.run），記下 ADV.begin／setBg 拿到的背景（pg_harness 的 H.bgs），要有對的那張圖：
//        police_station＝SQ04 派出所 ev_sq04_police；brunch_back＝SQ20 ev_sq20_s1、ev_sq20_s2；zq_home＝去看貓 ev_sq_cat_visit；
//        gg_basement_gig＝宥辰的第一場 ev_yc_gig；gg_scooter_shop＝公館・機車行（ev_moot_2 的 bike 分支，事件已停用、定義留著）；
//        jp_laundry＝ev_jpb_w_laundry、ev_jpb_r_laundry；jp_temple_hydrangea＝ev_jpb_w_temple；jp_dorm_lobby＝ev_an_town_notice_repair；
//        prof_door＝周教授／林教授研究室（ev_prof_zhou_office、ev_prof_lin_office 的 background）、何宇軒陪去研究室 ev_pool_hyx_office
//   3  tainan_school：y2b3d.js 的 Y2B.PS_TAINAN（第一次去台南的資料）那一個場景帶 bg（這份資料目前沒有地方讀，見下面的說明）
// 修改前（開發分支 4c8f138f7）：八個新代號沒有登記、八場是深色底、jp_dorm_lobby／prof_door 指到借用的圖——FAIL。用法：node tests/bg107_unit.js
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

const KEYS=['police_station','brunch_back','zq_home','gg_basement_gig','gg_scooter_shop','tainan_school','jp_laundry','jp_temple_hydrangea','jp_dorm_lobby','prof_door'];
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
await run('ev_sq04_police','police_station',{name:'SQ04 送筆電去派出所'});
await run('ev_sq20_s1','brunch_back',{name:'SQ20 半熟早午餐・店裡後面 第一次'});
await run('ev_sq20_s2','brunch_back',{name:'SQ20 半熟早午餐・店裡後面 第二次'});
await run('ev_sq_cat_visit','zq_home',{name:'去看貓・子晴的家'});
await run('ev_yc_gig','gg_basement_gig',{name:'宥辰的第一場・公館地下室',picks:[0]});
/* ev_moot_2 已停用（retired），定義留給舊存檔：bike 分支（第一個選項）才到公館・機車行 */
await run('ev_moot_2','gg_scooter_shop',{name:'公館・機車行（停用的事件，bike 分支）',picks:['機車行']});
await run('ev_jpb_w_laundry','jp_laundry',{name:'日本・投幣洗衣店',day:'2028-04-22',h:14,flags:{EXCHANGE_ROUTE:'JP'}});
await run('ev_jpb_r_laundry','jp_laundry',{name:'日本・宿舍的投幣洗衣店',day:'2028-06-17',h:13,flags:{EXCHANGE_ROUTE:'JP'}});
await run('ev_jpb_w_temple','jp_temple_hydrangea',{name:'日本・附近的寺',day:'2028-06-24',h:10,flags:{EXCHANGE_ROUTE:'JP'}});
await run('ev_an_town_notice_repair','jp_dorm_lobby',{name:'日本・宿舍大廳（町公所的一張通知）',day:'2028-05-10',h:17,flags:{EXCHANGE_ROUTE:'JP'}});
await run('ev_pool_hyx_office','prof_door',{name:'陪宇軒去周教授研究室'});
/* 周教授、林教授的研究室：整場的 background 是 getter（OUT.bg('prof_door')），開場就是門口的圖 */
for(const id of ['ev_prof_zhou_office','ev_prof_lin_office']){ const e=ev(id); check('2. '+id+'：background（getter）＝prof_door 的新圖',!!e&&img(e.background)==='assets/bg/prof_door.webp',J(e&&e.background)); }

/* ---- 3 tainan_school ---- */
{ const P=typeof Y2B!=='undefined'?Y2B.PS_TAINAN:null, sc=P&&P.first.find(x=>x&&typeof x==='object'&&x.scene==='台南・她的學校');
  check('3. Y2B.PS_TAINAN（沛珊第一次去台南）的「台南・她的學校」場景帶 bg tainan_school',!!sc&&sc.bg==='tainan_school'&&OUT.bg('tainan_school').image==='assets/bg/tainan_school.webp',J(sc)); }

H.done();
})();
