// 萬才館研討室 B、霖澤館 1F 系辦、共同教學館 3F 考場（LAWWW2 #82，87a4a60ca）做好以後：房間裡的人、事件搬進房間（AA_399 第 5、7、9 節；src/closed2_3d.js 最下面「房間做好以後」）——不需要瀏覽器。
//   1 人：柏翰的作息（大二起、法服值班的單週六 09～12、研討室 B spots.duty；STORY.schedEnt＝STORY.fafuDuty 的週次，人物線索「萬才館 研討室 B」）；進研討室 B 他坐在 duty、東邊一位背景志工；
//     2028-10-26 09～12 口試委員三位；系辦辦公時間系辦助理站在櫃台後面；考場考試那兩天 08:00～12:30 監考老師＋考生（畫質中＝四分之三）
//   2 語彤阿姨 2027-05-22：大廳圓桌按「坐到圓桌」＝換到研討室 B（柏翰 duty、阿姨 client、語彤 companion、祐廷站在柏翰旁邊），背景 blur；人在研討室 B＝自動開始；
//     房間不在＝照原本 2D（wancai_seminar 的圖）；台詞、選項和 2D 一字不差；一次（ev_yt_aunt_consult、LAWCLUB_SAT_LAST）
//   3 推甄面試 2028-10-26：柏翰兩句照舊在二樓，「萬才館二樓」那一場在研討室 B 坐考生的椅子、委員三位、背景 blur；演完站起來；人在研討室 B 也算到了（不會「一路跑上二樓」）；房間不在＝2D
//   4 SQ02 法服初談（出遊）：OUT.STAGE 換到研討室 B 東邊隔間（店員、祐廷坐配置的那兩張椅子、值班的學長＝東邊志工），背景 blur，演完回到原本的地方；房間不在＝2D
//   5 C10 學分採計（出遊 ev_vac_key 的 pre0、post）：換到系辦櫃台前、助理在櫃台後面、背景 blur、演完回去；房間不在＝2D
//   6 延畢的證書 2030-01-21：辦公時間＝系辦櫃台前（演完回去）；辦公時間外、房間不在＝2D
//   7 2029-02-03 筆試：門口三句照舊，「考場」前走到 3F 自己的位子（15 號）坐下、黑底；以安 FAMILIAR 以上＝考完帶回門口演「考完了」；其他＝在 3F 站起來、考生監考離開；房間不在＝2D
//   8 2030-02-16 筆試：換到 3F 坐下、黑底旁白、演完回去；房間不在、2031＝2D
//   9 學姊 08:30 的便條：帶到共同教學館門口、學姊站在旁邊、背景 blur（原本 ntu_avenue 的圖）、演完她離開；已經在門口不換；房間不在＝2D
//   10 系辦：有房間以後門口不再收志願表（只在裡面的服務台）
//   12 博雅 203（LAWWW2 5fff78834）SK07 唐睿的即興劇 2026-05-27 19:00（出遊）：OUT.STAGE 換到 203——唐睿站 spots.tang、品妤坐 pinyu、阿哲坐 zhe、祐廷坐 me、社員兩位、觀眾（畫質中 8 位），
//      背景 blur（classroom_small 的圖換掉）、演完回到原本的地方；那一晚走進 203 看得到社員、觀眾；人已經在 203＝不換區域、散場大家離開；房間不在＝2D；台詞、選項一字不差（K11 照舊在博雅 101，不動）
//   13 宿舍（LAWWW2 06790419d）：阿凱大一週日 21～22 在洗衣間長椅（characters.js 作息 spot kai＝CLOSED.kaiHere；那一小時 203 沒有他）；洗衣服先走到洗衣機前（spots.wash），
//      阿凱那一句＝黑幕中他站到烘衣機前（kai_stand）、祐廷在旁邊（player），台詞、40 分鐘照舊、和門口版一樣；方奕廷大一 21～23 在 205 書桌前（作息 spot fang＝房間的開放時段），
//      敲門進去他坐在書桌前；人物線索「洗衣間」「205 寢室（方奕廷的房間）」
//   11 引擎真正的導航（另一個 node 行程，載入 three＋區域）：祐廷做紀錄站的位置站得住、從門口走得到；SQ02 東邊的兩張椅子是配置的座位
// 修改前（320b5b399）：沒有 CLOSED2.roomOk（closed2_3d.js 沒有「房間做好以後」）、柏翰沒有研討室 B 的作息——第 0 節 FAIL，後面不跑。
// 第 13 節修改前（85e227787）：阿凱、方奕廷沒有洗衣間、205 的作息，洗衣服沒有 WASH——第 13 節 12 項 FAIL。用法：node tests/rooms_ab3_people_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const ZSTUB=['campus','dorm','wancai','linze','gongtong','library_hall','boya','dorm_hall'];
global.Z3={ZONES:{}}; for(const k of ZSTUB) Z3.ZONES[k]={id:k,name:k};
global.GAME=GM;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/exchange3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/r3_events.js','src/r3_3d.js','src/sideq3d.js','src/closed3d.js']) L3(f);   // index.html 的順序：這些都在 closed2_3d.js 前面
let loadErr=''; try{ L3('src/closed2_3d.js'); }catch(e){ loadErr=String(e&&e.stack||e); }
const X=()=>typeof CLOSED2!=='undefined'&&CLOSED2.roomOk?CLOSED2:null;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), LAY=id=>ROOM_GLB_LAYOUTS[id];
const near=(a,b,eps)=>!!a&&!!b&&Math.hypot(a.x-b.x,a.z-b.z)<(eps||0.05);
/* ---------- 假的 GM：換區域（房間照配置檔建 spots、seats，和 rooms_glb3d.js 的 build 一樣），人物、背景的人、坐下、起身 ---------- */
const ROOMS=['wancai_semb','linze_office','gongtong_3f','boya_203','dorm_laundry','dorm_205'];
let entered=[], spawned=[], extras=[], walks=[], removed=[], stands=0;
const zoneOf=(id,G)=>{ const L=LAY(id); const k=Z3.roomGlbSet(id,G), SET=k?L.sets[k]:null; return {id,indoor:true,roomSet:k,spots:(SET?SET.spots:L.spots)||null,seats:((SET?SET.seats:L.seats)||[]).map(s=>({x:s.x,z:s.z,yaw:s.yaw,lv:0})),spawn:Object.assign({},L.spawn),roomAt:()=>null}; };
const P=E.player;
GM.enter=async(z,sp,o)=>{ const G=H.G; entered.push({z,x:sp&&sp.x,z_:sp&&sp.z,o}); G.zone=z; GM.npc={}; E.npcs=[]; E.interactables=[]; P.seat=null;
  E.zone=ROOMS.includes(z)&&Z3.ZONES[z]?zoneOf(z,G):{id:z,seats:[],roomAt:()=>null}; if(sp){ P.obj.position.x=sp.x; P.obj.position.z=sp.z; P.obj.rotation.y=sp.yaw||0; P.lv=sp.lv|0; }
  if(ROOMS.includes(z)&&Z3.ZONES[z]) STORY.populate(z,GM); return E.zone; };
GM.spawnCharacter=(id,x,z,o)=>{ if(GM.npc[id]) return GM.npc[id]; const n={id,obj:{position:{x,z},rotation:{y:(o&&o.yaw)||0}},seat:(o&&o.seat)||null,pose:o&&o.pose}; GM.npc[id]=n; E.npcs.push(n); spawned.push({id,x,z,o}); return n; };
GM.spawnNPC=(id,spec,x,z,o)=>{ const n={id,spec,obj:{position:{x,z},rotation:{y:(o&&o.yaw)||0}},seat:null,talk:o&&o.talk}; if(o&&o.seat) GM.sitAt(n,o.seat); GM.npc[id]=n; E.npcs.push(n); extras.push({id,x,z,o,spec}); return n; };
GM.sitAt=(ent,st)=>{ ent.seat=st; ent.pose='sit'; if(ent===P){ P.obj.position.x=st.x; P.obj.position.z=st.z; } };
GM.standUp=ent=>{ if(ent===P) stands++; ent.seat=null; ent.pose='idle'; };
GM.removeNPC=id=>{ const n=GM.npc[id]; if(n){ E.npcs=E.npcs.filter(q=>q!==n); delete GM.npc[id]; removed.push(id); } };
GM.walkTo=async(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; walks.push([+x.toFixed(2),+z.toFixed(2)]); return true; };
GM.face=()=>{}; GM.spawnExtra=()=>null; GM.syncWeekday=()=>{}; E.canStand=()=>true; E.removeNPC=n=>{ E.npcs=E.npcs.filter(q=>q!==n); }; E.placeAt=(ent,x,z)=>{ ent.obj.position.x=x; ent.obj.position.z=z; };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,flags); G.outings=[]; G.acts={att:{}}; entered=[]; spawned=[]; extras=[]; walks=[]; removed=[]; stands=0; GM.npc={}; E.npcs=[]; P.seat=null; P.lv=0; P.obj.position.x=0; P.obj.position.z=0; P.obj.rotation.y=0; P.riding=false;
  E.zone=ROOMS.includes(zone)&&Z3.ZONES[zone]?zoneOf(zone,G):{id:zone,seats:[],roomAt:()=>null}; if(X()) X().staged=null; return G; };
const lv=(id,st)=>{ const r=SOCIAL.rel(id); const n={ACQUAINTANCE:{fam:10},FAMILIAR:{fam:25},FRIEND:{fam:45,trust:30},CLOSE_FRIEND:{fam:65,trust:50,comf:45}}[st]||{}; Object.assign(r,{fam:0,trust:0,comf:0,npcRom:0,rom:0},n); SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>H.lines(), ev=id=>STORY_EVENTS.find(e=>e.id===id), NM=id=>SOCIAL.displayName(id);
const isImg=b=>!!b&&typeof b==='object';
const without=async(id,f)=>{ const z=Z3.ZONES[id]; delete Z3.ZONES[id]; try{ return await f(); } finally { Z3.ZONES[id]=z; } };   /* 房間不在（舊版）*/
const satAt=p=>!!P.seat&&near(P.seat,p);
const xAt=(pre,p)=>extras.find(e=>e.id.indexOf(pre)===0&&near(e,p));
/* 學期裡第一個符合的週六 */
const satOf=(term,ok)=>{ const R=CALENDAR.termDays(term); for(let d=R.from;d<=R.to;d++){ if(CALENDAR.dateOf(d).wd!==6) continue; if(ok(d)) return d; } return null; };
const keyOf=d=>CALENDAR.dateOf(d).key;
const dutyG=d=>{ const G={day:d,hour:10,weekday:6,stage:'law',flags:{}}; return STORY.fafuDuty(G); };

(async()=>{
await sec(0,()=>{ check('0. 載入 src/closed2_3d.js：房間做好以後的那一段（CLOSED2.roomOk、populate、事件的包裝）',!!X()&&!loadErr&&X().roomOk('wancai_semb')&&X().roomOk('linze_office')&&X().roomOk('gongtong_3f'),loadErr.slice(0,300));
  check('0. 包住 STORY.populate、Y2B.auntConsult、R2Y4A.ivHere、R3.noteRun、R2Y4B.cert／gradExam、EVENTS.run、OUT.bg、OUT.STAGE',!!STORY._rab3Pop&&!!Y2B._rab3&&!!R2Y4A._rab3&&!!R3._rab3&&!!R2Y4B._rab3&&!!EVENTS._rab3&&!!OUT._rab3Bg&&!!OUT._rab3Stage&&!!STORY._rab3Tick); });
if(!X()){ H.done(); return; }
const C=X();

/* ======================= 1. 房間裡的人 ======================= */
await sec(1,async()=>{
  const d2=satOf('Y2S1',dutyG), d1=satOf('Y1S1',dutyG), w1=satOf('Y2S1',d=>CALENDAR.termOf(d).week===1);
  const bh=G=>STORY.schedEnt(CHARACTERS.classmate_bohan,G);
  { const G=fresh(keyOf(d2),10,'wancai'); const e=bh(G);
    check('1. 柏翰的作息：大二上第一個法服值班的週六 10:00 在研討室 B（wancai_semb、spot duty）',!!e&&e.zone==='wancai_semb'&&e.spot==='duty',keyOf(d2)+' '+J(e&&{zone:e.zone,spot:e.spot}));
    G.hour=12; check('1. 同一天 12:00：不在研討室 B',!(bh(G)&&bh(G).zone==='wancai_semb'));
    G.hour=10; const w=STORY.whereIs(GM,'classmate_bohan'); check('1. 人物線索：萬才館 研討室 B（幫忙，到 12:00）（房間名稱照配置檔）',!!w&&w.zone==='wancai_semb'&&w.act==='幫忙'&&w.until==='12:00'&&PLACES.names.wancai_semb===LAY('wancai_semb').name,J(w)+' '+PLACES.names.wancai_semb); }
  { const G=fresh(keyOf(d1),10,'wancai'); check('1. 大一（志工從大二開始）：不在研討室 B',!(bh(G)&&bh(G).zone==='wancai_semb')); }
  { const bad=[]; let n=0; for(const t of ['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']){ const R=CALENDAR.termDays(t); for(let d=R.from;d<=R.to;d++){ if(CALENDAR.dateOf(d).wd!==6) continue; n++;
      const G={day:d,hour:10,weekday:6,stage:'law',flags:{}}; const e=STORY.schedEnt(CHARACTERS.classmate_bohan,G), here=!!e&&e.zone==='wancai_semb'; if(here!==STORY.fafuDuty(G)) bad.push(keyOf(d)); } }
    check('1. 大二～大四每一個週六：柏翰在研討室 B＝STORY.fafuDuty（第 3 週起的單週、考試週停、國定假日不值班）',n>80&&!bad.length,n+' 個週六；不一樣：'+bad.join('、')); }
  { const G=fresh(keyOf(d2),10,'wancai'); await GM.enter('wancai_semb',Object.assign({},LAY('wancai_semb').spawn)); const sp=LAY('wancai_semb').sets.consult.spots;
    const b=spawned.find(s=>s.id==='classmate_bohan'); check('1. 進研討室 B：柏翰坐在西邊隔間志工的位子（spots.duty，populateSchedule 照作息放）',!!b&&near(b,sp.duty)&&!!b.o&&!!b.o.seat,J(b&&{x:b.x,z:b.z,seat:!!(b.o&&b.o.seat)}));
    const v=xAt('rab3_semb_vol',sp.volunteer); check('1. 東邊隔間一位背景的初談志工（spots.volunteer，坐著、不能搭話）',!!v&&!!v.o.seat&&!v.o.talk&&v.o.greet===false,J(extras.map(e=>e.id)));
    check('1. 平常不放口試委員',!extras.some(e=>/panel/.test(e.id))); }
  { fresh(keyOf(d1),10,'wancai'); await GM.enter('wancai_semb',Object.assign({},LAY('wancai_semb').spawn));
    check('1. 大一的值班週六：沒有柏翰，背景志工照樣在',!spawned.some(s=>s.id==='classmate_bohan')&&extras.some(e=>e.id==='rab3_semb_vol')); }
  { fresh(keyOf(w1),10,'wancai'); check('1. 前提：第 1 週週六研討室 B 開著（LAWWW2 的開放時段），但不是法服值班',Z3.roomGlbOpen('wancai_semb',H.G)&&!STORY.fafuDuty(H.G)); await GM.enter('wancai_semb',Object.assign({},LAY('wancai_semb').spawn));
    check('1. 第 1 週週六：房間裡沒有人（柏翰、志工都不在）',!spawned.some(s=>s.id==='classmate_bohan')&&!extras.length,J(extras.map(e=>e.id))); }
  { fresh('2028-10-26',10,'wancai'); await GM.enter('wancai_semb',Object.assign({},LAY('wancai_semb').spawn)); const P3s=LAY('wancai_semb').sets.interview.spots.panel;
    check('1. 2028-10-26 10:00（推甄面試的布置）：口試委員三位坐 spots.panel；沒有志工、柏翰',E.zone.roomSet==='interview'&&P3s.every(p=>!!xAt('rab3_iv_panel',p))&&extras.length===3&&!spawned.some(s=>s.id==='classmate_bohan'),J(extras.map(e=>[e.id,e.x,e.z])));
    fresh('2028-10-26',15,'wancai'); await GM.enter('wancai_semb',Object.assign({},LAY('wancai_semb').spawn)); check('1. 同一天 15:00：委員不在',!extras.length); }
  { const mon=satOf('Y2S1',()=>true)-5; fresh(keyOf(mon),10,'linze'); await GM.enter('linze_office',Object.assign({},LAY('linze_office').spawn)); const sp=LAY('linze_office').spots;
    const c=xAt('rab3_office_clerk',sp.counter); check('1. 系辦辦公時間（平日 10:00）：系辦助理站在櫃台後面（spots.counter，站著、不能搭話）',!!c&&!c.o.seat&&!c.o.talk&&GM.npc.rab3_office_clerk.clerk===true,J(extras.map(e=>[e.id,e.x,e.z])));
    fresh(keyOf(mon),12.5,'linze'); await GM.enter('linze_office',Object.assign({},LAY('linze_office').spawn)); check('1. 午休 12:30：櫃台沒有人',!extras.length); }
  for(const k of ['2029-02-03','2030-02-16']){ fresh(k,9,'gongtong'); await GM.enter('gongtong_3f',Object.assign({},LAY('gongtong_3f').spawn)); const sp=LAY('gongtong_3f').spots;
    const pr=xAt('rab3_g3f_proctor',sp.proctor), ex=extras.filter(e=>/rab3_g3f_exam/.test(e.id));
    check('1. '+k+' 09:00 考場：監考老師坐 spots.proctor；考生 11 位（畫質中＝15 的四分之三）坐 spots.examinees；玩家的 15 號空著',!!pr&&!!pr.o.seat&&ex.length===11&&ex.every(e=>sp.examinees.some(p=>near(p,e))&&!!e.o.seat)&&!ex.some(e=>near(e,sp.me)),J({pr:!!pr,n:ex.length})); }
  { fresh('2029-02-03',13,'gongtong'); await GM.enter('gongtong_3f',Object.assign({},LAY('gongtong_3f').spawn)); check('1. 考完（13:00）：考場沒有人',!extras.length); }
});

/* ======================= 2. 語彤阿姨 ======================= */
const aunt=async(zone,picks,f3)=>{ const G=fresh('2027-05-22',9.2,zone,{lawclub:true}); lv('heroine_03','FRIEND'); lv('classmate_bohan','FRIEND'); H.said=[]; H.picks=picks.slice(); if(zone==='wancai_semb'){ STORY.populate('wancai_semb',GM); spawned=[]; } return G; };
await sec(2,async()=>{
  const sp=LAY('wancai_semb').sets.consult.spots, rec=C.recorder(sp);
  let G=await aunt('wancai',[0]); check('2. 前提：5/22 法服值班到期（成員）、研討室 B 開著',Y2B.auntDue(G)&&Z3.roomGlbOpen('wancai_semb',G));
  await STORY.fafuShift(GM); const L3d=lines(), bg3=H.bgs.slice(), sp3=spawned.slice(), ex3=extras.slice(), rm3=removed.slice();
  check('2. 大廳按「坐到圓桌」：換到研討室 B，祐廷站在做紀錄的位置（柏翰旁邊）',entered.length===1&&entered[0].z==='wancai_semb'&&near({x:entered[0].x,z:entered[0].z_},rec)&&!P.seat,J(entered));
  check('2. 柏翰坐 spots.duty、語彤坐 spots.companion、阿姨（背景）坐 spots.client',sp3.some(s=>s.id==='classmate_bohan'&&near(s,sp.duty)&&s.o.seat)&&sp3.some(s=>s.id==='heroine_03'&&near(s,sp.companion)&&s.o.seat)&&ex3.some(e=>e.id==='rab3_aunt'&&near(e,sp.client)&&e.o.seat),J(sp3.map(s=>[s.id,s.x,s.z]))+J(ex3.map(e=>[e.id,e.x,e.z])));
  check('2. 畫面：模糊的 3D（不是 wancai_seminar 的圖）',bg3[0]==='blur'&&!bg3.some(isImg),J(bg3));
  check('2. 散會：阿姨、語彤離開，柏翰照作息留著',rm3.includes('rab3_aunt')&&rm3.includes('heroine_03')&&!!GM.npc.classmate_bohan&&C.staged===null,J(rm3));
  check('2. 演了一次（ev_yt_aunt_consult、值班算一次）、台詞照原文',G.events.done.ev_yt_aunt_consult===1&&G.flags.LAWCLUB_SAT_LAST===G.day&&L3d[0]==='（法律系館B的諮詢室。門開了，進來的是阿鳳阿姨，後面跟著語彤。）'&&L3d.includes(NM('classmate_bohan')+'：好。那紀錄你照做，意見我來講。'),J(L3d.slice(0,4)));
  H.said=[]; const r2=await STORY.fafuShift(GM); check('2. 同一天再按：不再演（once）',!r2&&!H.said.length);
  G=await aunt('wancai',[0]); await without('wancai_semb',()=>STORY.fafuShift(GM)); const L2d=lines(), bg2=H.bgs.slice();
  check('2. 房間不在（舊版）：照原本 2D——沒有換區域、背景是 wancai_seminar 的圖',!entered.length&&isImg(bg2[0]),J(bg2));
  check('2. 3D 和 2D 的台詞、選項一字不差',J(L3d)===J(L2d)&&L3d.length>15,L3d.length+'/'+L2d.length);
  /* 交往中、阿姨知道（另一支）：3D、2D 一樣 */
  const both=[]; for(const noRoom of [false,true]){ const G1=await aunt('wancai',[2]); G1.flags.YT_AUNT_KNOWS=true; G1.flags.dating_heroine_03=true; const run=()=>STORY.fafuShift(GM); if(noRoom) await without('wancai_semb',run); else await run(); both.push(lines()); }
  check('2. 交往中、阿姨知道（第三個選項）：3D、2D 台詞一樣（「認識啊，我們語彤的男朋友。」）',J(both[0])===J(both[1])&&both[0].includes('阿姨：認識啊，我們語彤的男朋友。'),both[0].length+'/'+both[1].length);
  /* 人在研討室 B：自動開始 */
  G=await aunt('wancai_semb',[0]); const t=C.tick(GM); await C.pending; const Lr=lines();
  check('2. 人在研討室 B（值班時間）：自動開始、不換區域、走到做紀錄的位置；台詞和上面一樣',t===true&&!entered.length&&walks.some(w=>near({x:w[0],z:w[1]},rec))&&J(Lr)===J(L3d)&&G.events.done.ev_yt_aunt_consult===1,J({t,entered,walks}));
  check('2. 自動開始：演過就不再開始',C.tick(GM)===false);
  G=await aunt('wancai_semb',[0]); G.flags.lawclub=false; check('2. 不是法服成員：研討室 B 裡不會開始',C.tick(GM)===false&&!Y2B.auntDue(G));
  G=await aunt('wancai_semb',[0]); G.hour=8.5; check('2. 08:30（值班 09:00 才開始）：研討室 B 裡還不會開始',C.tick(GM)===false&&Y2B.auntDue(G));
});

/* ======================= 3. 推甄面試 ======================= */
const iv=(zone,h,flags)=>{ const G=fresh('2028-10-26',h,zone,Object.assign({Y4_PATH:'grad'},flags||{})); P.lv=zone==='wancai'?1:0; H.said=[]; return G; };
await sec(3,async()=>{
  const sp=LAY('wancai_semb').sets.interview.spots;
  let G=iv('wancai',9.8); check('3. 前提：10/26 推甄面試、人在萬才館二樓',R2Y4A.ivOn(G)&&R2Y4A.ivHere(GM));
  await R2Y4A.interview(GM); const L3d=lines(), bg3=H.bgs.slice();
  check('3. 「萬才館二樓」那一場換到研討室 B：坐考生的椅子（spots.candidate）',entered.length===1&&entered[0].z==='wancai_semb'&&extras.filter(e=>/panel/.test(e.id)).length===3,J(entered)+J(extras.map(e=>e.id)));
  check('3. 演完站起來（考生的椅子空出來），人在研討室 B',!P.seat&&stands>=1&&G.zone==='wancai_semb'&&near(P.obj.position,sp.candidate));
  check('3. 畫面：開頭 blur、換場景也是 blur（不是 wancai_seminar 的圖）',bg3.length>=2&&bg3.every(b=>b==='blur'),J(bg3));
  check('3. 台詞：柏翰一句、十五分鐘那一句；PUSH_INTERVIEW、演一次',J(L3d)===J([NM('classmate_bohan')+'：答完了。最後我多說了一句：我喜歡這一科。','（十五分鐘。最後一題是：你為什麼想研究這個？）'])&&G.flags.PUSH_INTERVIEW===true&&G.events.done.ev_push_interview===1&&!G.flags.PUSH_RAN,J(L3d));
  G=iv('wancai',9.8); await without('wancai_semb',()=>R2Y4A.interview(GM)); const L2d=lines();
  check('3. 房間不在：照原本 2D（不換區域、背景 wancai_seminar 的圖），台詞一樣',!entered.length&&H.bgs.some(isImg)&&J(L2d)===J(L3d),J(H.bgs));
  G=iv('wancai_semb',9.8); check('3. 人在研討室 B：也算到了（R2Y4A.ivHere）',R2Y4A.ivHere(GM)===true);
  await R2Y4A.interview(GM); check('3. 人在研討室 B：不會「一路跑上二樓」、不換區域、坐考生的椅子演完',!G.flags.PUSH_RAN&&!entered.length&&J(lines())===J(L3d)&&stands>=1,J(lines()));
  G=iv('wancai',9.9); P.lv=0; G.zone='campus'; await R2Y4A.interview(GM);
  check('3. 09:50 還沒到（帶到二樓）：「一路跑上二樓」照舊，接著換到研討室 B',G.flags.PUSH_RAN===true&&entered.map(e=>e.z).join('>')==='wancai>wancai_semb'&&lines()[0]==='（你一路跑上二樓。）',J(entered.map(e=>e.z)));
});

/* ======================= 4. SQ02 法服初談 ======================= */
await sec(4,async()=>{
  const d2=satOf('Y2S1',dutyG), sp=LAY('wancai_semb').sets.consult.spots, seats=LAY('wancai_semb').sets.consult.seats;
  const me=C.mirror(sp.companion), cl=C.mirror(sp.client);
  check('4. 東邊隔間的兩張椅子（西邊 client、companion 的鏡像）是配置的座位',seats.some(s=>near(s,me))&&seats.some(s=>near(s,cl)));
  const q=()=>({id:'sq02_fafu_t',ev:'ev_sq02_fafu',day:H.G.day,h:9.5,late:2,place:'法律系館B',title:'法服初談：巷口茶飲的店員',travel:'走路 約 10 分鐘',travelH:1/6,state:'planned'});
  let G=fresh(keyOf(d2),9.4,'wancai'); H.said=[]; await OUT.go(GM,q()); const L3d=lines(), bg3=H.bgs.slice();
  check('4. 換到研討室 B 演，演完回到原本的地方（萬才館）',entered.map(e=>e.z).join('>')==='wancai_semb>wancai'&&G.zone==='wancai',J(entered.map(e=>e.z)));
  check('4. 店員坐東邊 client、背景志工（值班的學長）在東邊志工的位子；祐廷坐東邊 companion',extras.some(e=>e.id==='rab3_sq02_clerk'&&near(e,cl)&&e.o.seat)&&extras.some(e=>e.id==='rab3_semb_vol'&&near(e,sp.volunteer)),J(extras.map(e=>[e.id,e.x,e.z])));
  check('4. 畫面：blur（場景那一步的 wancai_seminar 換成 blur）',bg3.includes('blur')&&!bg3.some(isImg),J(bg3));
  check('4. 台詞照原文（值班的學長一句）',J(L3d)===J(['值班的學長：可以先跟老闆好好談；需要的話，勞工局有免費的諮詢。'])&&C.staged===null,J(L3d));
  G=fresh(keyOf(d2),9.4,'wancai'); H.said=[]; let sat=null; const s0=GM.sitAt; GM.sitAt=(ent,st)=>{ if(ent===P&&!sat) sat=st; s0(ent,st); }; await OUT.go(GM,q()); GM.sitAt=s0;
  check('4. 祐廷坐的是東邊 companion 那張椅子',!!sat&&near(sat,me),J(sat));
  G=fresh(keyOf(d2),9.4,'wancai'); H.said=[]; await without('wancai_semb',()=>OUT.go(GM,q()));
  check('4. 房間不在：照原本 2D（不換區域、wancai_seminar 的圖），台詞一樣',!entered.length&&H.bgs.some(isImg)&&J(lines())===J(L3d),J(H.bgs));
});

/* ======================= 5. C10 學分採計 ======================= */
await sec(5,async()=>{
  const sp=LAY('linze_office').spots;
  const q=k=>({id:'vac_C10@Y2_'+k,ev:'ev_vac_key',day:H.G.day,h:14,late:0.25,place:'法律系辦',title:'海外大學暑期課（加州）：系辦（學分採計）',travel:'走過去約 10 分鐘',travelH:1/6,vac:{key:'C10@Y2',k},state:'planned'});
  let G=fresh('2027-04-27',12.2,'linze'); H.said=[]; await OUT.go(GM,q('pre0')); const L3d=lines(), bg3=H.bgs.slice();
  check('5. pre0：換到系辦櫃台前（spots.player），演完回到霖澤館',entered.map(e=>e.z).join('>')==='linze_office>linze'&&near({x:entered[0].x,z:entered[0].z_},sp.player)&&G.zone==='linze',J(entered));
  check('5. 系辦助理站在櫃台後面（午休也在：排好的時間演）',extras.some(e=>e.id==='rab3_office_clerk'&&near(e,sp.counter)));
  check('5. 畫面：blur（classroom_small 的圖換成 blur）',bg3.includes('blur')&&!bg3.some(isImg),J(bg3));
  check('5. 台詞照原文；C10_CREDIT_FILED',J(L3d)===J(['系辦助理：要採計的話，先把課程大綱給我，系上審過才算。出國前送，回來帶成績單。','系辦助理：……國外的課不一定都抵得掉。先問清楚比較好。'])&&G.flags.C10_CREDIT_FILED===true,J(L3d));
  G=fresh('2027-04-27',12.2,'linze'); H.said=[]; await without('linze_office',()=>OUT.go(GM,q('pre0')));
  check('5. 房間不在：照原本 2D（不換區域、classroom_small 的圖），台詞一樣',!entered.length&&H.bgs.some(isImg)&&J(lines())===J(L3d),J(H.bgs));
  G=fresh('2027-09-13',12.2,'linze'); H.said=[]; await OUT.go(GM,q('post')); const P3d=lines();
  check('5. post（大三上第 2 週）：也在系辦櫃台前、blur',entered[0]&&entered[0].z==='linze_office'&&H.bgs.includes('blur')&&P3d[0]==='系辦助理：兩門都過了。一門抵選修，一門……老師說內容和我們的課重疊，只能抵一半。',J(P3d));
  G=fresh('2027-09-13',12.2,'linze'); H.said=[]; await without('linze_office',()=>OUT.go(GM,q('post'))); check('5. post 房間不在：台詞一樣',J(lines())===J(P3d)&&!entered.length);
});

/* ======================= 6. 延畢的證書 ======================= */
await sec(6,async()=>{
  let G=fresh('2030-01-21',10,'dorm'); H.said=[]; await R2Y4B.cert(GM); const L3d=lines();
  check('6. 2030-01-21 10:00（辦公時間）：換到系辦櫃台前、助理在櫃台後面，演完回到宿舍',entered.map(e=>e.z).join('>')==='linze_office>dorm'&&extras.some(e=>e.id==='rab3_office_clerk')&&G.zone==='dorm'&&G.flags.CERT_DAY===G.day,J(entered.map(e=>e.z)));
  check('6. 台詞照原文（旁白＋助教一句）',L3d[0]==='（系辦的助教把證書遞給你。）'&&L3d.length===2&&/^助教：/.test(L3d[1]),J(L3d));
  G=fresh('2030-01-21',10,'dorm'); H.said=[]; await without('linze_office',()=>R2Y4B.cert(GM)); check('6. 房間不在：2D、台詞一樣',!entered.length&&J(lines())===J(L3d));
  G=fresh('2030-01-22',20,'dorm'); H.said=[]; await R2Y4B.cert(GM); check('6. 辦公時間外（這一步排到 1/24）：照舊 2D',!entered.length&&lines()[0]==='（系辦的助教把證書遞給你。）');
});

/* ======================= 7. 2029-02-03 筆試 ======================= */
const ex=(fam)=>{ const G=fresh('2029-02-03',8.6,'campus',{Y4_PATH:'grad',Y4_PUSH:'fail'}); P.obj.position.x=2; P.obj.position.z=21; if(fam) lv('heroine_01','FAMILIAR'); H.said=[]; return G; };
await sec(7,async()=>{
  const L=LAY('gongtong_3f'), me=L.spots.me;
  let G=ex(true); check('7. 前提：2/3 筆試、人在共同教學館門口、以安 FAMILIAR',R2Y4A.exOn(G)&&R2Y4A.exHere(GM)&&C.anFam(G));
  let sat=null; const s0=GM.sitAt; GM.sitAt=(ent,st)=>{ if(ent===P&&!sat) sat=st; s0(ent,st); };
  await R2Y4A.exam(GM); GM.sitAt=s0; const L3d=lines(), bg3=H.bgs.slice();
  check('7. 門口三句以後走上 3F（考場的門口），走到 15 號的走近點坐下',entered[0]&&entered[0].z==='gongtong_3f'&&near({x:entered[0].x,z:entered[0].z_},L.spawn)&&walks.some(w=>Math.abs(w[0]-me.x)<0.05)&&!!sat&&near(sat,me),J({entered,walks,sat}));
  check('7. 考場有監考老師、考生；考完他們離開',extras.some(e=>e.id==='rab3_g3f_proctor')&&removed.includes('rab3_g3f_proctor')&&removed.filter(id=>/rab3_g3f_exam/.test(id)).length===11,J(removed));
  check('7. 考試本身黑底（走上去以後 ADV 用 dark）',bg3.includes('dark')&&!bg3.some(isImg),J(bg3));
  check('7. 以安 FAMILIAR：考完帶回教學館門口演「考完了」',entered.map(e=>e.z).join('>')==='gongtong_3f>campus'&&G.zone==='campus'&&L3d[L3d.length-1]===NM('heroine_01')+'：考完了。……先吃麵。'&&G.flags.GRAD_EXAM_2029===true&&G.events.done.ev_grad_exam===1,J(entered.map(e=>e.z)));
  check('7. 台詞照原文（門口三句、兩節、考完）',J(L3d)===J(['（教學館門口，以安在看考場的配置圖。）',NM('heroine_01')+'：你在三樓。我在二樓。',NM('heroine_01')+'：……考完，門口。','（兩節。第二節最後一題，你寫到鐘響。）',NM('heroine_01')+'：考完了。……先吃麵。']),J(L3d));
  G=ex(true); await without('gongtong_3f',()=>R2Y4A.exam(GM)); check('7. 房間不在：照原本 2D（不換區域），台詞一樣',!entered.length&&J(lines())===J(L3d),J(lines()));
  G=ex(false); await R2Y4A.exam(GM); check('7. 沒認識以安：只有兩節那一句；考完在 3F 站起來，人留在考場',J(lines())===J(['（兩節。第二節最後一題，你寫到鐘響。）'])&&entered.map(e=>e.z).join('>')==='gongtong_3f'&&G.zone==='gongtong_3f'&&!P.seat&&stands>=1,J({l:lines(),e:entered.map(e=>e.z)}));
  G=ex(false); G.zone='gongtong_3f'; E.zone=zoneOf('gongtong_3f',G); await R2Y4A.exam(GM); check('7. 人已經在 3F（被帶到門口以後）：不再換一次以外的區域',entered.map(e=>e.z).join('>')==='campus>gongtong_3f',J(entered.map(e=>e.z)));
});

/* ======================= 8. 2030-02-16 筆試 ======================= */
await sec(8,async()=>{
  const me=LAY('gongtong_3f').spots.me;
  let G=fresh('2030-02-16',9,'dorm'); H.said=[]; let sat=null; const s0=GM.sitAt; GM.sitAt=(ent,st)=>{ if(ent===P&&!sat) sat=st; s0(ent,st); };
  await R2Y4B.gradExam(GM,2030); GM.sitAt=s0; const L3d=lines();
  check('8. 換到 3F、走到 15 號坐下，演完回到宿舍；考生、監考離開',entered.map(e=>e.z).join('>')==='gongtong_3f>dorm'&&!!sat&&near(sat,me)&&removed.includes('rab3_g3f_proctor')&&G.zone==='dorm',J(entered.map(e=>e.z)));
  check('8. 黑底旁白、字卡「考場」照原本；GRAD_EXAM_2030',H.bgs.includes('dark')&&H.cards.some(c=>c[0]==='考場')&&J(L3d)===J(['（兩節。第二節最後一題，你寫到鐘響。）'])&&G.flags.GRAD_EXAM_2030===true,J({bg:H.bgs,cards:H.cards,L3d}));
  G=fresh('2030-02-16',9,'dorm'); H.said=[]; await without('gongtong_3f',()=>R2Y4B.gradExam(GM,2030)); check('8. 房間不在：2D、台詞一樣',!entered.length&&J(lines())===J(L3d));
  G=fresh('2031-02-15',9,'dorm'); H.said=[]; await R2Y4B.gradExam(GM,2031); check('8. 2031（考場那天沒開）：照舊 2D',!entered.length&&G.flags.GRAD_EXAM_2031===true);
});

/* ======================= 9. 學姊 08:30 的便條 ======================= */
const note=(zone)=>{ const G=fresh('2029-02-03',8.1,zone,{Y4_PATH:'grad',Y4_PUSH:'fail'}); lv('heroine_05','FRIEND'); H.said=[]; return G; };
await sec(9,async()=>{
  let G=note('dorm'); await R3.noteRun(GM); const L3d=lines(), bg3=H.bgs.slice();
  check('9. 帶到共同教學館門口（3D），學姊站在旁邊；演完她離開',entered.length===1&&entered[0].z==='campus'&&near({x:entered[0].x,z:entered[0].z_},C.EX_SPAWN)&&spawned.some(s=>s.id==='heroine_05')&&removed.includes('heroine_05')&&!GM.npc.heroine_05,J({entered,spawned:spawned.map(s=>s.id),removed}));
  check('9. 畫面：場景那一步的 ntu_avenue 換成 blur',bg3.includes('blur')&&!bg3.some(isImg)&&C.staged===null,J(bg3));
  check('9. 台詞照原文；SIS_NOTE_GRAD＝door；08:30；演一次',L3d[0]==='（教學館門口。她把一張摺好的便條放進你手裡。）'&&L3d.includes('（便條：「你可以。」）')&&G.flags.SIS_NOTE_GRAD==='door'&&Math.abs(G.hour-8.5)<1e-6&&G.events.done.ev_sis_exam_note===1,J(L3d));
  G=note('campus'); P.obj.position.x=2; P.obj.position.z=21; await R3.noteRun(GM); check('9. 已經在門口：不換區域、學姊照樣站在旁邊',!entered.length&&spawned.some(s=>s.id==='heroine_05')&&J(lines())===J(L3d));
  G=note('dorm'); await without('gongtong_3f',()=>R3.noteRun(GM)); check('9. 房間不在：照原本 2D（不換區域、ntu_avenue 的圖），台詞一樣',!entered.length&&H.bgs.some(isImg)&&J(lines())===J(L3d),J(H.bgs));
  G=note('dorm'); G.flags.HOME_AT_TEST=true; const h0=HOME.at; HOME.at=()=>true; try{ await R3.noteRun(GM); } finally { HOME.at=h0; } check('9. 人在家：照原本 2D',!entered.length&&J(lines())===J(L3d));
});

/* ======================= 10. 系辦：門口不再收志願表 ======================= */
await sec(10,async()=>{
  const G=fresh('2027-11-15',10,'linze'); G.flags.dating_heroine_05=true; ROM.rec(G); const r=ROM.get(G,'heroine_05'); r.status='dating'; SOCIAL.remember('heroine_05','FIRST_MET','');
  check('10. 前提：US 路線、11/15 10:00 可以交',C.formDue(G));
  H.said=[]; const a=await STORY.interact({x:1.6,z:-6.25,radius:1.15,lv:0,label:'法律學院辦公室',look:'學院辦公室。'},GM);
  check('10. 有系辦房間：門口那個按鈕不收志願表',!H.said.length&&G.flags.EXCH_FORM_DESK==null);
  G.zone='linze_office'; H.picks=[0]; await STORY.interact({x:0.5,z:-1.45,lv:0,label:'服務台',look:'服務台。'},GM);
  check('10. 裡面的服務台照樣可以交（系辦助理一句）',G.flags.EXCH_FORM_DESK===G.day&&J(lines())===J(['系辦助理：交換志願表？放這裡。……第一志願寫好了嗎？好。']),J(lines()));
});

/* ======================= 12. 博雅 203：SK07 唐睿的即興劇 ======================= */
await sec(12,async()=>{
  const L=LAY('boya_203'), sp=L&&L.spots; check('12. 博思 203 的房間登記了（rooms_glb3d.js boya_203）、只有 2026-05-27 18:30～21:30 開',!!sp&&C.roomOk('boya_203')&&Z3.roomGlbOpen('boya_203',{day:D('2026-05-27'),hour:19})&&!Z3.roomGlbOpen('boya_203',{day:D('2026-05-27'),hour:17}));
  if(!sp) return;
  { fresh('2026-05-27',18.6,'boya'); await GM.enter('boya_203',Object.assign({},L.spawn)); const mem=extras.filter(e=>/rab3_b203_member/.test(e.id)), aud=extras.filter(e=>/rab3_b203_aud/.test(e.id));
    check('12. 那一晚走進 203：社員兩位站在 spots.member、觀眾 8 位（畫質中＝11 的四分之三）坐 spots.audience；第一排品妤、祐廷、阿哲的位子空著',mem.length===2&&mem.every(e=>sp.member.some(p=>near(p,e))&&!e.o.seat)&&aud.length===8&&aud.every(e=>sp.audience.some(p=>near(p,e))&&!!e.o.seat)&&!extras.some(e=>near(e,sp.me)||near(e,sp.pinyu)||near(e,sp.zhe)),J({mem:mem.length,aud:aud.length}));
    fresh('2026-05-27',17,'boya'); await GM.enter('boya_203',Object.assign({},L.spawn)); check('12. 17:00（還沒開）：沒有人',!extras.length); }
  const q=()=>({id:'sk07_improv',ev:'ev_sk07_improv',day:H.G.day,h:19,late:0.25,place:'博思教學館',title:'唐睿的即興劇',travel:'走過去約 10 分鐘',travelH:1/6,state:'planned'});
  const run=async(zone,noRoom)=>{ const G=fresh('2026-05-27',18.8,zone); H.said=[]; H.picks=[0]; let sat=null; const s0=GM.sitAt; GM.sitAt=(ent,st)=>{ if(ent===P&&!sat) sat=st; s0(ent,st); };
    try{ if(noRoom) await without('boya_203',()=>OUT.go(GM,q())); else await OUT.go(GM,q()); } finally { GM.sitAt=s0; } return {G,sat,L:lines(),bg:H.bgs.slice(),sp:spawned.slice(),ex:extras.slice(),en:entered.map(e=>e.z),rm:removed.slice()}; };
  const a=await run('boya');
  check('12. 換到博思 203 演，演完回到原本的地方（博思 2F）',J(a.en)===J(['boya_203','boya'])&&a.G.zone==='boya',J(a.en));
  check('12. 唐睿站在舞台中間（spots.tang）、品妤坐第一排正中間（pinyu）、阿哲坐 zhe',a.sp.some(s=>s.id==='econ_tangrui'&&near(s,sp.tang)&&!(s.o&&s.o.seat))&&a.sp.some(s=>s.id==='econ_pinyu'&&near(s,sp.pinyu)&&s.o.seat)&&a.sp.some(s=>s.id==='zhe'&&near(s,sp.zhe)&&s.o.seat),J(a.sp.map(s=>[s.id,s.x,s.z])));
  check('12. 祐廷坐品妤旁邊（spots.me）；社員、觀眾在',!!a.sat&&near(a.sat,sp.me)&&a.ex.filter(e=>/rab3_b203_member/.test(e.id)).length===2&&a.ex.filter(e=>/rab3_b203_aud/.test(e.id)).length===8,J(a.sat));
  check('12. 畫面：blur（場景那一步的 classroom_small 換成 blur）',a.bg.includes('blur')&&!a.bg.some(isImg)&&C.staged===null,J(a.bg));
  check('12. 台詞照原文；IMPROV_WORD、演一次',a.L.includes('即興劇社借了博思的教室，辦期末的小演出。品妤坐在第一排，沒有表情。阿哲是被你拉來的。')&&a.L[a.L.length-1]==='品妤：他說是為了練膽量。我覺得是為了社辦的冷氣。'&&a.G.flags.IMPROV_WORD==='善意第三人'&&a.G.events.done.ev_sk07_improv===1,J(a.L));
  const b=await run('boya',true);
  check('12. 房間不在：照原本 2D（不換區域、classroom_small 的圖），台詞一樣',!b.en.length&&b.bg.some(isImg)&&J(b.L)===J(a.L),J(b.bg));
  const c=await run('boya_203');
  check('12. 人已經在 203：不換區域、照樣坐 me；散場唐睿、品妤、阿哲、觀眾離開；台詞一樣',!c.en.length&&!!c.sat&&near(c.sat,sp.me)&&['econ_tangrui','econ_pinyu','zhe'].every(id=>c.rm.includes(id))&&!Object.keys(GM.npc).some(k=>/rab3_b203_/.test(k))&&J(c.L)===J(a.L),J({en:c.en,rm:c.rm}));
  { const G=fresh('2026-05-28',18.8,'boya'); H.said=[]; H.picks=[0]; await OUT.go(GM,Object.assign(q(),{day:G.day})); check('12. 別的日子（房間沒開）：照原本 2D',!entered.length&&H.bgs.some(isImg)); }
});

/* ======================= 13. 宿舍：洗衣間的阿凱、205 的方奕廷 ======================= */
await sec(13,async()=>{
  const LL=LAY('dorm_laundry'), L5=LAY('dorm_205'); check('13. 洗衣間、205 的房間登記了（rooms_glb3d.js dorm_laundry、dorm_205）',!!LL&&!!L5&&C.roomOk('dorm_laundry')&&C.roomOk('dorm_205')); if(!LL||!L5) return;
  const sun=(()=>{ for(let d=D('2025-10-01');;d++) if(CALENDAR.dateOf(d).wd%7===0) return d; })(), kai=G=>STORY.schedEnt(CHARACTERS.kai,G), fy=G=>STORY.schedEnt(CHARACTERS.npc_fangyt,G);
  { const G=fresh(keyOf(sun),21.5,'dorm_hall',{afternoonDone:true}); const e=kai(G); check('13. 阿凱的作息：大一週日 21:30 在洗衣間（dorm_laundry、spot kai）',!!e&&e.zone==='dorm_laundry'&&e.spot==='kai',keyOf(sun)+' '+J(e&&{zone:e.zone,spot:e.spot}));
    const w=STORY.whereIs(GM,'kai'); check('13. 人物線索：洗衣間（坐著，到 22:00）',!!w&&w.zone==='dorm_laundry'&&PLACES.names.dorm_laundry===LL.name&&w.until==='22:00',J(w));
    G.hour=22.2; check('13. 22:10：回到 203（原本那一筆）',kai(G)&&kai(G).zone==='dorm');
    G.day=sun+1; G.weekday=1; G.hour=21.5; check('13. 週一 21:30：在 203',kai(G)&&kai(G).zone==='dorm');
    const bad=[]; for(let d=D('2025-08-20');d<=D('2026-07-10');d++){ const g={day:d,hour:21.5,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',flags:{afternoonDone:true}}; const k=kai(g); if((!!k&&k.zone==='dorm_laundry')!==CLOSED.kaiHere(g)) bad.push(keyOf(d)); }
    check('13. 每一天 21:30：阿凱在洗衣間＝CLOSED.kaiHere（洗衣服那一句的條件）',!bad.length,bad.slice(0,5).join('、')); }
  { fresh(keyOf(sun),21.3,'dorm_hall',{afternoonDone:true}); await GM.enter('dorm_laundry',Object.assign({},LL.spawn)); const k=spawned.find(s=>s.id==='kai');
    check('13. 進洗衣間（週日 21:20）：阿凱坐在長椅（spots.kai，populateSchedule 照作息放）',!!k&&near(k,LL.spots.kai)&&!!k.o.seat,J(spawned.map(s=>[s.id,s.x,s.z]))); }
  { const G=fresh(keyOf(sun),21.5,'dorm',{afternoonDone:true}); GM.npc.kai={id:'kai',obj:{position:{x:0,z:0}}}; E.npcs=[GM.npc.kai]; STORY.populate('dorm',GM);
    check('13. 那一小時在 203：房間裡沒有阿凱（他在洗衣間）',!GM.npc.kai&&removed.includes('kai'),J(removed));
    fresh(keyOf(sun+1),21.5,'dorm',{afternoonDone:true}); GM.npc.kai={id:'kai',obj:{position:{x:0,z:0}}}; STORY.populate('dorm',GM); check('13. 週一晚上：阿凱照舊在 203',!!GM.npc.kai); }
  const it3=()=>({x:1.45,z:-0.375,radius:0.9,lv:0,label:'洗衣機',look:'洗衣機。'}), door=()=>({x:-11,z:0.53,radius:1.15,lv:0,label:'洗衣間',look:'洗衣間。'});
  const wash=async(zone,item,day,h)=>{ const G=fresh(keyOf(day),h,zone,{afternoonDone:true}); if(zone==='dorm_laundry') STORY.populate('dorm_laundry',GM); H.said=[]; H.picks=[0]; const t0=G.hour; const toasts=[]; const t1=GM.toast; GM.toast=t=>toasts.push(t); try{ await STORY.interact(item,GM); } finally { GM.toast=t1; } return {G,L:lines(),toasts,dt:G.hour-t0}; };
  { const a=await wash('dorm_laundry',it3(),sun,21.3), sp=LL.spots, k=GM.npc.kai;
    check('13. 洗衣服：先走到第 2 台洗衣機前（spots.wash）',walks.some(w=>near({x:w[0],z:w[1]},sp.wash)),J(walks));
    check('13. 阿凱那一句：他站到烘衣機前（kai_stand，站著）、祐廷在他旁邊（spots.player）',!!k&&near(k.obj.position,sp.kai_stand)&&!k.seat&&near(P.obj.position,sp.player),J({k:k&&k.obj.position,p:P.obj.position}));
    check('13. 台詞、40 分鐘照舊（一句；KAI_LAUNDRY）',J(a.L)===J([SOCIAL.displayName('kai')+'：這台烘衣機要投兩次。第一次是騙你的。'])&&Math.abs(a.dt-40/60)<1e-6&&a.G.flags.KAI_LAUNDRY===a.G.day,J(a.L));
    const b=await wash('dorm_hall',door(),sun,21.3); check('13. 門口版（沒有房間的版本）：台詞一樣、不走、阿凱不動',J(b.L)===J(a.L)&&!walks.length,J(b.L));
    const c=await wash('dorm_laundry',it3(),sun+1,21.3); check('13. 週一：走到洗衣機前，「衣服洗好了。」，沒有阿凱',walks.some(w=>near({x:w[0],z:w[1]},sp.wash))&&!c.L.length&&c.toasts.includes('衣服洗好了。')&&!GM.npc.kai,J(c)); }
  const wk=(()=>{ for(let d=D('2025-10-06');;d++) if(CALENDAR.dateOf(d).wd===2) return d; })();
  { const G=fresh(keyOf(wk),21.5,'dorm_hall',{afternoonDone:true}); const e=fy(G); check('13. 方奕廷的作息：大一 21:30 在 205 書桌前（dorm_205、spot fang）',!!e&&e.zone==='dorm_205'&&e.spot==='fang',J(e&&{zone:e.zone,spot:e.spot}));
    const w=STORY.whereIs(GM,'npc_fangyt'); check('13. 人物線索：205 寢室（方奕廷的房間）（在書桌前，到 23:00）',!!w&&w.zone==='dorm_205'&&w.act==='在書桌前'&&w.until==='23:00'&&PLACES.names.dorm_205===L5.name,J(w));
    const bad=[]; for(let d=D('2025-08-20');d<=D('2026-09-30');d++){ const g={day:d,hour:21.5,weekday:CALENDAR.dateOf(d).wd%7,stage:'law',flags:{afternoonDone:true}}; const e2=fy(g), here=!!e2&&e2.zone==='dorm_205'&&STORY.reachable('npc_fangyt',g); if(here!==Z3.roomGlbOpen('dorm_205',g)) bad.push(keyOf(d)); }
    check('13. 每一天 21:30：方奕廷在 205（作息＋presence）＝205 開著（open.range、who：寒假回台中不開、大二起不開）',!bad.length,bad.slice(0,5).join('、'));
    await GM.enter('dorm_205',Object.assign({},L5.spawn)); const f=spawned.find(s=>s.id==='npc_fangyt');
    check('13. 「敲門（205）」進去：方奕廷坐在書桌前（spots.fang；作息放、找他說話照平常）',!!f&&near(f,L5.spots.fang)&&!!f.o.seat,J(spawned.map(s=>[s.id,s.x,s.z])));
    fresh('2026-02-03',21.5,'dorm_hall',{afternoonDone:true}); check('13. 寒假回台中（2026-02-03）：205 不開、作息也不在',!Z3.roomGlbOpen('dorm_205',H.G)&&STORY.whereIs(GM,'npc_fangyt')&&STORY.whereIs(GM,'npc_fangyt').zone!=='dorm_205');
    fresh('2026-09-15',21.5,'dorm_hall',{afternoonDone:true}); check('13. 大二（搬走了）：作息沒有 205',!(fy(H.G)&&fy(H.G).zone==='dorm_205')); }
});

/* ======================= 11. 引擎真正的導航（另一個 node 行程：three＋區域）======================= */
await sec(11,()=>{
  const code=`
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=${J(H.ROOT)};
global.window=global; global.self=global;
const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
  'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/room_glb_layouts.js','src/rooms_glb3d.js','src/data/calendar.js','src/data/places.js','src/closed2_3d.js'];
for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\\w+)\\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|ROOM_GLB_LAYOUTS|CALENDAR|PLACES|CLOSED2)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'}; global.GAME={G:{day:0,hour:10,flags:{},stage:'law'}};
for(let d=1;d<2000;d++) if(CALENDAR.dateOf(d).key==='2027-05-22'){ GAME.G.day=d; break; }
E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES.wancai_semb.build(E); E.zone=z; E.levels=null; E.nav=z.nav; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0};
const sp=ROOM_GLB_LAYOUTS.wancai_semb.sets.consult.spots, r=CLOSED2.recorder(sp), w=E.simWalk(z.spawn.x,z.spawn.z,r.x,r.z,{lv0:0,lv1:0,dt:0.1,speed:4.1});
console.log(JSON.stringify({set:z.roomSet,r,stand:E.canStand(r.x,r.z,0.3,0),walk:!!w.ok}));`;
  let out=''; try{ out=cp.execFileSync(process.execPath,['-e',code],{cwd:H.ROOT,encoding:'utf8',timeout:120000,stdio:['ignore','pipe','ignore']}); }catch(e){ out=String(e.stdout||'')+String(e.message||e).slice(0,300); }
  let r=null; try{ r=JSON.parse(out.trim().split('\n').pop()); }catch(e){}
  check('11. 研討室 B（阿姨那天＝初談隔間）：祐廷做紀錄的位置站得住、從門口走得到（E.canStand、E.simWalk）',!!r&&r.set==='consult'&&r.stand===true&&r.walk===true,out.trim().slice(-300)); });

/* 14 芷若在總圖多媒體中心（AA_399 第 12 節；LAWWW2 a8c448288 spots.zhiruo）：週二、四 14～17；英國那半年（2027-09～2028-02）不在 */
{ const c=CHARACTERS.heroine_02, at=(k,h)=>{ const d=STORY.dayOfKey(k); const e=STORY.schedEnt(c,{day:d,hour:h,weekday:CALENDAR.dateOf(d).wd,flags:{},noInvite:true}); return e&&{zone:e.zone,spot:e.spot}; };
  const a=at('2026-10-13',15), b=at('2026-10-15',15), u=at('2027-10-12',15), w=at('2026-10-14',15);
  check('14. 芷若：週二、四 15:00 在多媒體中心 spots.zhiruo；英國那半年不在；週三不在',!!a&&a.zone==='library_media'&&a.spot==='zhiruo'&&!!b&&b.zone==='library_media'&&!(u&&u.zone==='library_media')&&!(w&&w.zone==='library_media'),JSON.stringify([a,b,u,w])); }

/* 15 總圖多媒體中心的「看」與芷若（AA_443 第 1 節，企劃線 f93fa3eda）*/
await (async()=>{ let DOC=''; try{ DOC=require('child_process').execSync("git -c core.quotepath=false show 'f93fa3eda:docs/story_planning/AA_443_多媒體中心看的字_摘要池加寫_週四家人群組範圍.md'",{cwd:H.ROOT,encoding:'utf8'}); }catch(e){}
  const X=CLOSED2.MEDIA; check('15. 多媒體中心每一句都在 AA_443（一字不差）',DOC.length>500&&Object.values(X).every(t=>DOC.includes(t.replace(/^「|」$/g,''))),JSON.stringify(Object.values(X).filter(t=>!DOC.includes(t.replace(/^「|」$/g,'')))));
  const G=H.fresh('2026-10-13',15,'library_media'); G.stage='law';
  check('15. 西牆那一格三版：英國那半年、知道 ZR3_SUBTITLE、不知道',CLOSED2.zrDeskLook(Object.assign({},G,{day:STORY.dayOfKey('2027-10-12')}))===X.zrUK&&CLOSED2.zrDeskLook(G)===X.zr&&(SOCIAL.remember('heroine_02','ZR3_SUBTITLE',''),CLOSED2.zrDeskLook(G)===X.zrKnow));
  H.said=[]; H.picks=[1]; await CLOSED2.zrMediaTalk(GM,'heroine_02'); const L1=H.lines(); H.said=[]; await CLOSED2.zrMediaTalk(GM,'heroine_02'); const L2=H.lines();
  check('15. 和她說話（有 ZR3_SUBTITLE）：每學期第一次多一段「這一行十七個字……」→「不要刪。」的回答；同一學期第二次沒有',L1.some(t=>t.includes(X.talkSub))&&L1.some(t=>t.includes(X.rKeep))&&L2.length===0,JSON.stringify([L1,L2]));
  const G2=H.fresh('2026-10-15',15,'library_media'); G2.stage='law'; H.said=[]; await CLOSED2.zrMediaTalk(GM,'heroine_02');
  check('15. 沒有 ZR3_SUBTITLE：一句「字幕翻譯的作業……」',H.lines().length===1&&H.lines()[0].includes(X.talkNo),JSON.stringify(H.lines()));
  const G3=H.fresh('2026-10-15',15,'cafe'); G3.stage='law'; H.said=[]; check('15. 不在多媒體中心不演',(await CLOSED2.zrMediaTalk(GM,'heroine_02'))===false&&H.lines().length===0); })();

H.done();
})();
