// AA_610 語彤只有在一盞茶屋打工當同事才認識（STORY-JOB-COWORKER-ROMANCE-1103；AA_624 照舊）——不需要瀏覽器。src/ytjob3d.js＋各入口的擋法
//   1  沒有 YT_MET_JOB：認不認識（STORY.knows）、見面／記憶（SOCIAL.meet／remember）、作息（STORY.schedEnt）、事件（EVENTS.check：participants 有她）、手機（PHONE.at／post）全部擋
//   2  茶屋第一班：蘇姨「水不要滾太久……」之後演 AA_610 第 2 節（一字照稿），收店兩句、記 YT_MET_JOB、FIRST_MET（tea）、熟悉 +2；第二班不再演
//   3  舊存檔：已經認識（FIRST_MET／met_heroine_03／熟悉度不是陌生人）＝讀檔記 YT_MET_JOB；沒認識的不記；game3d.js migrate 有叫
//   4  作息：沒有麵店（noodle）的時段；週六、日 13～17 在一盞茶屋；認識以後也不會在燒臘店（圈子補的作息也擋）
//   5  阿姨扭到手的獨立事件（ev_yutong_absent、ev_yutong_midterm_week、阿哲那句 h504_zhe_hand）、麵店見面那場（ev_noodle_yutong）＝retired
// 修改前（開發分支 b744b3237）：沒有 src/ytjob3d.js、沒有 YT_MET_JOB——第 1～5 項 FAIL。用法：node tests/aa610_ytjob_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, YT='heroine_03', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const has=YJ=>typeof YTJOB!=='undefined';
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };

(async()=>{
await sec(0,()=>{ check('0. src/ytjob3d.js 在 index.html、載得到（YTJOB）',ORDER.includes('src/ytjob3d.js')&&has()); });

/* ---------- 1 認識以前全部擋 ---------- */
await sec(1,()=>{ const sat=TD('Y1S1',3,6), tue=TD('Y1S1',3,2);
  H.fresh('2025-09-16',10,'campus',{YT_MET_JOB:false});   /* 新遊戲（pg_harness 預設當舊存檔已經認識她）*/
  check('1. 新遊戲沒有 YT_MET_JOB',!H.G.flags.YT_MET_JOB);
  SOCIAL.meet(YT,'library'); SOCIAL.remember(YT,'HELPED','test');
  check('1. SOCIAL.meet／remember 不記（沒有 FIRST_MET、沒有記憶）',!SOCIAL.has(YT,'FIRST_MET')&&!(H.G.social.mem[YT]||[]).length&&!H.G.flags.met_heroine_03);
  check('1. STORY.knows(heroine_03)＝false',!STORY.knows(YT,H.G));
  H.G.social.mem[YT]=[{tag:'FIRST_MET',day:H.G.day,note:'x'}];   /* 就算記憶被別的路徑寫進去 */
  check('1. 有 FIRST_MET 但沒有 YT_MET_JOB：STORY.knows 照樣 false',!STORY.knows(YT,H.G)); H.G.social.mem[YT]=[];
  at(tue,9.5,'library'); check('1. 作息：平日早上總圖 → 不在（schedEnt null）',STORY.schedEnt(CHARACTERS[YT],H.G)===null);
  at(sat,14,'wz_teahouse'); check('1. 作息：週六 14:00 茶屋也不在（還沒認識）',STORY.schedEnt(CHARACTERS[YT],H.G)===null);
  const E1=ev('ev_rain_library_door'), E2=ev('ev_library_door_phone');
  at(TD('Y1S1',3,1),19,'campus'); H.G.weather='rain';
  check('1. 事件：雨天的總圖門口（participants heroine_03）EVENTS.check＝false',!!E1&&EVENTS.check(E1)===false);
  check('1. 事件：所有 participants 有她的事件都擋（抽查 '+STORY_EVENTS.filter(e=>(e.participants||[]).includes(YT)).length+' 個）',STORY_EVENTS.filter(e=>(e.participants||[]).includes(YT)).every(e=>EVENTS.check(e)===false));
  const before=(H.G.msgs||[]).length;
  PHONE.at(H.G,H.G.day,H.G.hour,[{th:'p:'+YT,from:YT,text:'測試一'}],'yt_test1');
  PHONE.at(H.G,H.G.day,H.G.hour,[{th:'g:noodle_team',from:'zhe',text:'阿哲一句'},{th:'g:noodle_team',from:YT,text:'語彤一句'}],'yt_test2');
  PHONE.tick(H.G);
  const M=(H.G.msgs||[]).slice(before);
  check('1. 手機：她的私訊、群組裡她那一句不送（別人的照送）',!M.some(m=>m.from===YT||m.th==='p:'+YT)&&M.some(m=>m.text==='阿哲一句'),J(M.map(m=>m.text)));
  check('1. 手機：全部是她的那一則記成傳過（認識以後不補）',PHONE.sent(H.G,'yt_test1'));
});

/* ---------- 2 茶屋第一班 ---------- */
await sec(2,async()=>{ const sat=TD('Y1S1',3,6);
  H.fresh('2025-09-16',10,'dorm',{YT_MET_JOB:false}); hire('tea',[6]); at(sat,12.9,'wz_teahouse'); H.said=[]; H.picks=['妳在這裡做多久了？'];
  await JOBS.runShift(GM,'tea'); const L=H.lines();
  const YN=SOCIAL.displayName(YT);   /* 對話框照遊戲的名字（陳語彤）*/
  const want=['蘇姨：水不要滾太久。滾久了，水就老了。','（水屋裡，一個綁馬尾的女生正在一個一個擦茶杯。）','蘇姨：語彤，他今天第一天。妳帶他。',YN+'：……嗯。',YN+'：客人坐下先給水，不要先問點什麼。他們會自己看。',YN+'：高三暑假開始。','（一個下午下來，她跟你講的話不超過十句。）','（收店的時候，她倒了一杯剩下的烏龍茶，放在你旁邊。）',YN+'：第一天都這樣。下週就順了。'];
  let k=-1, okOrd=true; for(const w of want){ const j=L.indexOf(w); if(j<=k){ okOrd=false; break; } k=j; }
  check('2. 第一班：AA_610 第 2 節的句子照順序（接在蘇姨那句之後；選「妳在這裡做多久了？」）',okOrd,J(L));
  check('2. 選項：「好。」／「妳在這裡做多久了？」',H.opts.some(o=>J(o)===J(['「好。」','「妳在這裡做多久了？」'])),J(H.opts));
  check('2. 演完：YT_MET_JOB、FIRST_MET（tea）、熟悉 +2、STORY.knows',H.G.flags.YT_MET_JOB===true&&SOCIAL.memories(YT).some(m=>m.tag==='FIRST_MET'&&m.note==='tea')&&SOCIAL.rel(YT).fam>=2&&STORY.knows(YT,H.G),J([H.G.flags.YT_MET_JOB,SOCIAL.memories(YT),SOCIAL.rel(YT).fam]));
  const sun=TD('Y1S1',4,6); at(sun,12.9,'wz_teahouse'); H.said=[]; await JOBS.runShift(GM,'tea');
  check('2. 第二班不再演',!H.lines().some(l=>l.endsWith('：……嗯。'))&&!H.lines().some(l=>l.includes('綁馬尾')));
  /* 別的店的第一班不會遇到她 */
  H.fresh('2025-09-16',10,'dorm',{YT_MET_JOB:false}); hire('brunch',[6]); at(sat,7.4,'wz_brunch'); H.said=[]; await JOBS.runShift(GM,'brunch');
  check('2. 半熟的第一班：沒有語彤、不記 YT_MET_JOB',!H.G.flags.YT_MET_JOB&&!H.lines().some(l=>/語彤：/.test(l)));
});

/* ---------- 3 舊存檔 ---------- */
await sec(3,()=>{
  const s1={flags:{},social:{mem:{heroine_03:[{tag:'FIRST_MET',day:10,note:'library'}]},rel:{}}};
  const s2={flags:{},social:{mem:{},rel:{heroine_03:{fam:12,trust:0,comf:0,rom:0}}}};
  const s3={flags:{met_heroine_03:true},social:{mem:{},rel:{}}};
  const s4={flags:{},social:{mem:{},rel:{heroine_03:{fam:0,trust:0,comf:0,rom:0}}}};
  YTJOB.migrate(s1); YTJOB.migrate(s2); YTJOB.migrate(s3); YTJOB.migrate(s4);
  check('3. 已經認識（FIRST_MET／熟悉度 12／met_heroine_03）＝YT_MET_JOB',s1.flags.YT_MET_JOB===true&&s2.flags.YT_MET_JOB===true&&s3.flags.YT_MET_JOB===true);
  check('3. 沒認識（陌生人）＝不記',!s4.flags.YT_MET_JOB);
  const s5={flags:{YT_JOB_V:1},social:{mem:{},rel:{heroine_03:{fam:12,trust:0,comf:0,rom:0}}}}; YTJOB.migrate(s5);
  check('3. 這一版以後的新遊戲（YT_JOB_V）不看熟悉度、不記',!s5.flags.YT_MET_JOB&&s1.flags.YT_JOB_V===1);
  check('3. game3d.js 新遊戲 defaults 有 YT_JOB_V',/flags:\{dating_kexin:false,KX_MET:false,KX_DEC3_MIGRATED:true,YT_JOB_V:1[,}]/ /* CANON-1112：舊序章拿掉／可昕開局不認識：defaults 的 dating_kexin 改 false、加 KX_MET:false（原本期望 dating_kexin:true）*/.test(fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8')));
  const g=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
  check('3. game3d.js 的 migrate 叫 YTJOB.migrate',/function migrate\(s\)[\s\S]*YTJOB\.migrate\(s\)[\s\S]*s\.v=SAVE_VER; return s; \}/.test(g));
  H.fresh('2026-03-10',10,'campus',{YT_MET_JOB:true}); H.rel(YT,25,0,0);
  check('3. 舊存檔（YT_MET_JOB）照舊認識',STORY.knows(YT,H.G));
});

/* ---------- 4 作息 ---------- */
await sec(4,async()=>{ const C=CHARACTERS[YT];
  check('4. characters.js：她的作息沒有 zone noodle',!(C.daily_schedule||[]).some(e=>e.zone==='noodle'),J((C.daily_schedule||[]).filter(e=>e.zone==='noodle')));
  H.fresh('2025-09-16',10,'campus',{YT_MET_JOB:true}); H.rel(YT,25,0,0);
  for(const [t,w,wd,hh,lab] of [['Y1S1',3,6,14,'大一上週六'],['Y1S1',4,7,16,'大一上雙週週日（單週 15:00 起有大稻埕的偶遇 D12，那一筆先算）'],['Y2S2',5,6,13.5,'大二下週六']]){ at(TD(t,w,wd),hh); const e=STORY.schedEnt(C,H.G); check('4. '+lab+' '+hh+':00 在一盞茶屋（wz_teahouse）',!!e&&e.zone==='wz_teahouse',J(e)); }
  let bad=[]; const d0=TD('Y1S1',1,1); for(let d=d0;d<d0+1500;d++){ for(const hh of [9,14.5,17.5,18,19,20]){ at(d,hh); const e=STORY.schedEnt(C,H.G); if(e&&e.zone==='noodle') bad.push(CALENDAR.dateOf(d).key+' '+hh); } }
  check('4. 四年每天 9、14:30、17:30～20:00：她從來不在燒臘店（含圈子補的作息）',!bad.length,bad.slice(0,6).join(','));
  /* 約她：地點清單沒有公館燒臘（INV.neverAt；選單、節日、直接約都不成立）*/
  H.fresh('2026-03-10',10,'campus',{YT_MET_JOB:true}); H.CLOSE(YT); H.G.contacts=H.G.contacts||{}; H.G.contacts[YT]=H.G.day-30;
  const P=INVITE_DATA.places.find(q=>q.id==='noodle'), d1=TD('Y1S2',4,3);
  const r=INV.decide(H.G,YT,'noodle',d1,18), r2=INV.decide(H.G,'zhe','noodle',d1,18);
  check('4. 約語彤去公館燒臘：不成立（decline place）；約阿哲照常判斷',INV.neverAt(YT,P)&&r.res==='decline'&&r.why==='place'&&!INV.neverAt('zhe',P)&&r2.why!=='place',J([r,r2]));
  H.said=[]; H.opts=[]; H.picks=['吃飯']; try{ await INV.flow(GM,YT,null,false); }catch(e){}
  check('4. 約語彤的地點選單沒有「公館燒臘」',!H.opts.some(o=>(o.all||o).some(t=>/公館燒臘/.test(String(t)))),J(H.opts));
});

/* ---------- 5 retired ---------- */
await sec(5,()=>{
  for(const id of ['ev_yutong_absent','ev_yutong_midterm_week','ev_noodle_yutong','ev_yutong_customer']) check('5. '+id+' retired（舊存檔演過的照留）',!!ev(id)&&ev(id).retired===true);
  { const T=ev('ev_yutong_thanks'), d=TD('Y1S2',10,2); H.fresh(CALENDAR.dateOf(d).key,21.5,'library',{yutong_hospital:true}); H.FRIEND(YT); const old=EVENTS.check(T); H.G.flags.YT_JOB_V=1; const nw=EVENTS.check(T);
    check('5. ev_yutong_thanks（阿姨扭到手那條線）：舊存檔照舊、這一版的新遊戲（YT_JOB_V）不演',old===true&&nw===false,J([old,nw]));
    const Pst=(typeof FEED_Y1S2!=='undefined'?FEED_Y1S2:null);
    check('5. 動態 yt2b（櫃台上的繃帶）只給舊存檔：if ytOld、FEED.COND.ytOld',typeof FEED!=='undefined'&&FEED.COND.ytOld({flags:{}})===true&&FEED.COND.ytOld({flags:{YT_JOB_V:1}})===false&&/\{id:'yt2b',if:'ytOld'/.test(fs.readFileSync(path.join(H.ROOT,'src/data/feed_y1s2.js'),'utf8'))); }
  const HD=(typeof NOODLE_TABLE!=='undefined'?Object.values(NOODLE_TABLE).flat():[]).find(e=>e&&e.once==='h504_zhe_hand');
  check('5. 阿哲「期中那兩個禮拜，阿姨的手包著……」（h504_zhe_hand）retired、長桌不挑',!!HD&&HD.retired===true);
});

H.done(); })();
