// TE-KOMICHI-STAGE-1104（BB-C 2026-11-04 21:28；AA_686 第 2 項的背景）：語彤的期末飯在溫州街・小路 17:30——
//   六月那兩次（大一下 6/20、大三下 6/10）天還亮：在 3D 的小路室內演（窗邊那一桌，玩家坐靠門那一側、她坐對面），背景 blur（OUT.bg('teishoku_night')＝'blur'）；
//   十二月那三次照舊 2D 夜景 teishoku_night；舊存檔排好「公館燒臘」的那一頓不換；從家裡出發、騎車、有人跟著＝照舊 2D。演完回到原本的地方。
//   AA_687（企劃線 d41750385，AA-C 定 D109）以後：那一頓 18:00（第 3 項）；週五考完的學期改在隔天週六（第 5 項）——大二下 6/12 也在六月（3D）、大四上 12/23 在十二月（2D）；背景照現在（第 4 項）
// 修改前：termend3d.js 沒有 S.komichiStage（FAILED 全部）；用法：node tests/te_komichi_stage_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const DK=k=>STORY.dayOfKey(k);
(async()=>{
await sec('0',async()=>{
  check('0. termend3d.js 有 S.komichiStage／komichiDue／komichiCan，掛在 OUT.STAGE；小路的座位在 WZ_SHOPS_LAYOUT.teishoku（0、2 是同一桌對面）',
    typeof TERMEND.komichiStage==='function'&&typeof TERMEND.komichiDue==='function'&&typeof TERMEND.komichiCan==='function'&&Array.isArray(OUT.STAGE)&&OUT.STAGE.includes(TERMEND.komichiStage)
    &&typeof WZ_SHOPS_LAYOUT!=='undefined'&&!!WZ_SHOPS_LAYOUT.teishoku&&WZ_SHOPS_LAYOUT.teishoku.seats[0].table===WZ_SHOPS_LAYOUT.teishoku.seats[2].table);
});
const PL=TERMEND_LINES&&TERMEND_LINES.PLACE?TERMEND_LINES.PLACE:null;
const ev={id:'ev_termend_dinner'}, q=(day,o)=>Object.assign({id:'te_Y1S2',ev:'ev_termend_dinner',day,h:18/* AA_687 第 3 項：17:30 → 18:00 */,place:'溫州街・小路',te:{term:'Y1S2',who:YT,kind:'friend'}},o||{});
await sec('1',async()=>{
  H.fresh('2026-06-20',17,'wz');
  const D=TERMEND.komichiDue;
  check('1. 六月（大一下 6/20、大三下 6/10；AA_687 第 5 項以後大二下 6/12）語彤在小路的那一頓＝要換 3D',D(H.G,q(DK('2026-06-20')),ev)&&D(H.G,q(DK('2028-06-10')),ev)&&D(H.G,q(DK('2027-06-12')),ev));
  check('1. 十二月那幾次（12/20、12/26、12/25；AA_687 第 5 項以後大四上 12/23）照舊 2D 夜景',!D(H.G,q(DK('2025-12-20')),ev)&&!D(H.G,q(DK('2026-12-26')),ev)&&!D(H.G,q(DK('2027-12-25')),ev)&&!D(H.G,q(DK('2028-12-23')),ev));
  check('1. 舊存檔排好「公館燒臘」的那一頓不換；別人的期末飯不換；別的事件不換',!D(H.G,q(DK('2026-06-20'),{place:'公館燒臘'}),ev)&&!D(H.G,q(DK('2026-06-20'),{te:{term:'Y1S2',who:'heroine_01',kind:'friend'}}),ev)&&!D(H.G,q(DK('2026-06-20')),{id:'ev_other'}));
  check('1. 小路的名字照 PLACE.teishoku（「溫州街・小路」）、背景 teishoku_night',!!PL&&!!PL.teishoku&&PL.teishoku.name==='溫州街・小路'&&PL.teishoku.bg==='teishoku_night');
});
await sec('2',async()=>{
  H.fresh('2026-06-20',17,'wz'); Z3.ZONES.wz=Z3.ZONES.wz||{id:'wz'}; Z3.ZONES.wz_teishoku=Z3.ZONES.wz_teishoku||{id:'wz_teishoku'};
  const E=GM.E; E.player=E.player||{obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0}; E.player.obj.position.x=12; E.player.obj.position.z=-3; E.player.obj.rotation.y=1; E.player.lv=0; E.player.riding=false; E.player.seat=null;
  const calls=[], spawns=[], sits=[]; const enter0=GM.enter, sit0=GM.sitAt, spawn0=GM.spawnCharacter, stand0=GM.standUp;
  GM.enter=async(z,at,o)=>{ calls.push({z,at,o}); H.G.zone=z; }; GM.sitAt=(p,s)=>{ sits.push(s); p.seat=s; }; GM.standUp=p=>{ p.seat=null; }; GM.spawnCharacter=(id,x,z,o)=>{ spawns.push({id,x,z,o}); return {id}; };
  try{
    const bg0=OUT.bg('teishoku_night');
    const stg=await TERMEND.komichiStage(GM,q(DK('2026-06-20')),ev);
    const L=WZ_SHOPS_LAYOUT.teishoku, me=L.seats[0], her=L.seats[2];
    check('2. 換到小路（wz_teishoku）：從小路的出生點進去、noFade／deferStory／noAutosave',!!stg&&calls.length===1&&calls[0].z==='wz_teishoku'&&calls[0].at.x===L.spawn.x&&calls[0].at.z===L.spawn.z&&calls[0].o&&calls[0].o.noFade&&calls[0].o.deferStory&&calls[0].o.noAutosave,J(calls));
    check('2. 玩家坐窗邊那一桌靠門那一側（座位 0），語彤坐對面（座位 2，坐著、不動）',sits.length===1&&sits[0].x===me.x&&sits[0].z===me.z&&spawns.length===1&&spawns[0].id===YT&&spawns[0].x===her.x&&spawns[0].z===her.z&&spawns[0].o.seat&&spawns[0].o.pose==='sit',J([sits,spawns]));
    check('2. 演的時候這一頓的背景 teishoku_night＝模糊的 3D（blur）；演之前是圖',OUT.bg('teishoku_night')==='blur'&&bg0!=='blur',J([bg0,OUT.bg('teishoku_night')]));
    await stg.restore();
    check('2. 演完回到原本的地方（區域、位置、方向）、背景回到圖',calls.length===2&&calls[1].z==='wz'&&calls[1].at.x===12&&calls[1].at.z===-3&&calls[1].at.yaw===1&&J(OUT.bg('teishoku_night'))===J(bg0)&&!TERMEND.komichiStaged,J(calls[1]));
    /* 照舊 2D 的情形 */
    H.G.zone='wz'; calls.length=0; E.player.riding=true; const s1=await TERMEND.komichiStage(GM,q(DK('2026-06-20')),ev); E.player.riding=false;
    H.G.flags=H.G.flags||{}; H.G.flags.companion='heroine_01'; const s2=await TERMEND.komichiStage(GM,q(DK('2026-06-20')),ev); delete H.G.flags.companion;
    const fh=OUT.fromHome; OUT.fromHome=true; const s3=await TERMEND.komichiStage(GM,q(DK('2026-06-20')),ev); OUT.fromHome=fh;
    const s4=await TERMEND.komichiStage(GM,q(DK('2025-12-20')),ev);
    check('2. 騎車、有人跟著、從家裡出發、十二月：不換（照舊 2D 夜景），也沒有換區域',!s1&&!s2&&!s3&&!s4&&calls.length===0,J([!!s1,!!s2,!!s3,!!s4,calls.length]));
  } finally { GM.enter=enter0; GM.sitAt=sit0; GM.spawnCharacter=spawn0; GM.standUp=stand0; }
});
H.done ? H.done() : (()=>{ const f=H.fails!=null?H.fails:0; console.log(f?'FAILED '+f:'ALL PASS'); process.exit(f?1:0); })();
})();
