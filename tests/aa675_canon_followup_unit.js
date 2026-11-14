// AA675-CANON-FOLLOWUP-1104：AA_675（企劃線 920791094，AA-C 定稿 D109）——AA_661 接進遊戲時要 AA 定的八件＋表外一件。不需要瀏覽器。
//   1  第 7 列：語彤寒暑假的平日回淡水、約得到（presence vacTown；邀約照常、答應時多一句輪流；C16 法扶、台東、宜蘭照行程；週末茶屋；D13 只在淡水的那幾天）
//   2  第 42 列：阿哲的麵店日拿掉；長桌閒聊（NOODLE_TABLE）搬到隔週五的桌遊夜（散場以前照順序演一則；換不了的跳過）；燒臘店裡不再演
//   3  第 64 列：ev_yu_sign_seat 改成桌遊夜當天的 2D（Alison 23:00 從戲院趕到的那一次）
//   4  第 72 列：語彤告白晚餐改期末考考完以後的第一個週六 17:30、一盞茶屋（句子不改）
//   5  第 80 列：聖誕碰到茶屋公休就提早一天（遊戲的聖誕是 12/24，2025～2028 都有開＝不換日子）
//   6  第 79 列：交往中的生日 18:30 在她家（新生南路，ytjob3d.js 那一場的 2D）
//   7  第 32 列：礁溪照 AA_609 第 8 節（學姊一家、Alison 是她妹妹；2D 同一段對話；KNOWS_SIS_ALISON；只一次）
//   8  第 63 列：二十三週年裡語彤的店員戲拿掉或換人
//   9  表外 vac_activities.js:466：語彤回來那一場改一盞茶屋
// 修改前（開發分支 9f70c066f）：1～9 都 FAIL。用法：node tests/aa675_canon_followup_unit.js
// AA_684（企劃線 0382b8a34，AA-C 定 D109；AA684-CANON-FIX-1104）改了其中幾件，期望值照 AA_684 換（tests/aa684_canon_fix_unit.js 測新的部分）：
//   第 2 節：阿哲週二、四 18:00～19:30 照一般作息在燒臘店（和麵店日無關）；bgn:false 的 10 則刪了、大一第 2 則換成桌遊夜版（便利貼）
//   第 3 節：大一第 7 則（憲法課）往前一則＝第 6 則；第 7 節：ENC_D24_SIS 的名稱中性、「Alison 是她妹妹」另外一條（KNOWS_SIS_ALISON）；第 9 節：invite「這週六我五點下班」
// AA_611 第 1 節第 1 列（企劃線 3f85566f4）把 AA_609 第 8 節的稿改兩處：旁白「她姊姊考上法研所了」、Alison「他是我們班的啊！」——第 7 節這兩句的期望值照 AA_611 換（tests/aa611_sisters_unit.js 測新的部分）
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03', SIS='heroine_05', MX='classmate_mingxuan';
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
const DK=k=>STORY.dayOfKey(k);
const at=(k,h,zone)=>{ const d=typeof k==='number'?k:DK(k); H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(k,h,zone,flags)=>{ H.fresh(typeof k==='number'?'2025-09-01':k,h,zone,flags); if(typeof k==='number') at(k,h); return H.G; };
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/[^\n]*/g,'$1');
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const doc=(sha,p)=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'show',sha+':'+p],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const AA675=doc('920791094','docs/story_planning/AA_675_回LAWWW_AA661接線的八件.md'), AA609=doc('ce8e3db3c','docs/story_planning/AA_609_學姊的奶奶_取代爸爸.md');   /* 11-08 AA_593 第 11 節：AA_609 第 8 節第一句「我們一家來的。」＋媽媽點頭、friend 版邀泡那句拿掉（原本 615e981b5）*/
const inDoc=(D,t)=>!!D&&D.includes(t);
const AA611_FIX=['（你想起 Alison 說過，她姊姊考上法研所了。原來就是學姊。）','他是我們班的啊！……姊，他是妳直屬？'];   /* AA_611 第 1 列（企劃線 3f85566f4）改的兩句 */
const says=()=>H.said.map(s=>(s.who?s.who+'：':'')+s.t);
/* 記下說話的人物 id（ENC.meet、INV.flow 用 {name,charId}）*/
const sayIds=[]; const say0=GM.say; GM.say=async(who,t,o)=>{ sayIds.push({id:who&&who.charId||null,name:who?(who.name||String(who)):null,t:String(t).replace('{name}',H.G&&H.G.name||'祐廷')}); return say0(who,t,o); };
const B=typeof BGN!=='undefined'?BGN:null;

(async()=>{
await sec(0,()=>{ check('0. 載得到：BGN、ENC、FEST、TERMEND、Y34B、VAC_DATA；AA_675、AA_609 讀得到（git show）',!!B&&typeof ENC!=='undefined'&&typeof FEST!=='undefined'&&typeof TERMEND!=='undefined'&&typeof Y34B!=='undefined'&&typeof VAC_DATA!=='undefined'&&!!AA675&&!!AA609); });

/* ---------- 1 第 7 列：語彤寒暑假平日回淡水 ---------- */
await sec(1,()=>{
  const P=k=>{ fresh(k,14,'dorm'); H.FRIEND(YT); return STORY.presence(YT,H.G); };
  const wd=P('2026-07-08'), sat=P('2026-07-11'), sun=P('2026-07-12'), wint=P('2026-01-20'), c16=P('2028-06-20'), c16b=P('2028-06-30'), tai=P('2027-07-20'), yil=P('2028-07-25'), term=P('2026-03-04'), last=P('2026-08-28');
  check('1. 寒暑假的平日（2026-07-08 三、2026-01-20 二、暑假最後一個週五 2026-08-28）：不在學校、在淡水（here false、kind taipei＝約得到、town／home 淡水、away「在淡水」、signal）',
    [wd,wint,last].every(p=>p.here===false&&p.kind==='taipei'&&p.town==='淡水'&&p.home==='淡水'&&p.away==='在淡水'&&p.signal===true),J([wd,wint,last]));
  check('1. 週末（2026-07-11 六、07-12 日）、學期中（2026-03-04）在臺北（here）',sat.here===true&&sun.here===true&&term.here===true,J([sat,sun,term]));
  check('1. 有自己行程的日子照行程：大三暑假 C16 法扶實習（2028-06-19～06-30）的平日在臺北；台東田野（2027-07-20）、宜蘭田野（2028-07-25）照原本的 absentDates（trip）',
    c16.here===true&&c16b.here===true&&tai.kind==='trip'&&/台東/.test(tai.away)&&yil.kind==='trip'&&/宜蘭/.test(yil.away),J([c16,tai,yil]));
  fresh('2026-07-08',14,'dorm'); H.FRIEND(YT); INV.addContact(H.G,YT);
  check('1. 邀約照常：約得到（STORY.reachable、INV.canInvite）、不列「約不了的原因」（INV.whyNot＝空）',STORY.reachable(YT,H.G)===true&&INV.canInvite(H.G,YT)===true&&INV.whyNot(H.G,YT)==='',J(INV.whyNot(H.G,YT)));
  const A=CHARACTERS[YT].presence.vacTown.acc;
  check('1. 答應時多的那一句字照 AA_675 1-1（「我在淡水。五點以前到。」／「我現在在淡水，搭捷運過去。」）',J(A)===J(['我在淡水。五點以前到。','我現在在淡水，搭捷運過去。'])&&A.every(t=>inDoc(AA675,t)));
  const d0=H.G.day, t1=INV.townLine(H.G,YT,{day:d0,h:18}), t2=INV.townLine(H.G,YT,{day:d0+1,h:18}), t3=INV.townLine(H.G,YT,{day:d0,h:18}), tSat=INV.townLine(H.G,YT,{day:DK('2026-07-11'),h:15});
  check('1. 輪流用（第一句、第二句、再第一句）；約的那天她在臺北（週六）＝不說',t1===A[0]&&t2===A[1]&&t3===A[0]&&tSat===null,J([t1,t2,t3,tSat]));
  at('2026-07-11',12); check('1. 現在她在臺北（週六）＝不說',INV.townLine(H.G,YT,{day:DK('2026-07-13'),h:18})===null);
  /* 3D 的作息：平日在淡水不在任何場景；D13 只在淡水的日子；週末茶屋 */
  const ent=(k,h,fl)=>{ fresh(k,h,'dorm',fl); H.FRIEND(YT); return STORY.schedEnt(CHARACTERS[YT],H.G); };
  const e10=ent('2026-07-08',10), e16=ent('2026-07-08',16,{WISH_DONE_heroine_03:true}), c1610=ent('2028-06-20',10), c1616=ent('2028-06-20',16,{WISH_DONE_heroine_03:true}), s14=ent('2026-07-11',14), u14=ent('2026-07-12',14);
  check('1. 淡水的平日 10:00 不在臺北的場景（原本 9:00～12:00 在總圖）；心願以後 16:00＝D13 淡水那一筆',e10===null&&!!e16&&e16.enc==='D13',J([e10,e16&&e16.enc]));
  check('1. C16 那兩週（在臺北）：照平常的作息（10:00 總圖），16:00 不是 D13',!!c1610&&c1610.zone==='library'&&!(c1616&&c1616.enc==='D13'),J([c1610&&c1610.zone,c1616&&c1616.enc]));
  check('1. 寒暑假的週末 13:00～17:00 在一盞茶屋上班（週六、週日）',!!s14&&s14.zone==='wz_teahouse'&&!!u14&&u14.zone==='wz_teahouse',J([s14&&s14.zone,u14&&u14.zone]));
  /* D13 淡水偶遇：寒暑假的平日、她在淡水的那幾天 */
  const row=ENCOUNTERS.rows.find(r=>r.who===YT&&r.spot==='D13'), el=(k,h)=>{ fresh(k,h,'dorm',{WISH_DONE_heroine_03:true}); H.FRIEND(YT); const w=[]; const r=ENC.eligible(H.G,row,w); return r?'ok':w.join('|'); };
  const okT=el('2026-07-08',16), okC=el('2028-06-20',16);
  check('1. D13 淡水偶遇：她在淡水的平日成立；C16 法扶那兩週（她在臺北）不成立',okT==='ok'&&okC!=='ok',J([okT,okC]));
  /* 校外約會的「晚上我要回去，秀琴姨煮了飯。」只在她那天在臺北 */
  fresh('2026-07-08',14,'dorm'); H.FRIEND(YT); const en=[]; for(let i=0;i<4;i++) en.push(String(DATE.lineFor(H.G,YT,'enough',{day:H.G.day})));
  fresh('2026-03-04',14,'dorm'); H.FRIEND(YT); const en2=[]; for(let i=0;i<4;i++) en2.push(String(DATE.lineFor(H.G,YT,'enough',{day:H.G.day})));
  check('1. 校外約會「晚上我要回去，秀琴姨煮了飯。」：她在淡水的日子不說，學期中照說',!en.some(t=>/秀琴姨煮了飯/.test(t))&&en2.some(t=>/秀琴姨煮了飯/.test(t)),J([en,en2]));
  /* 邀約流程：手機約她吃飯，答應那一句後面多一句 */
  fresh('2026-07-08',10,'dorm'); H.FRIEND(YT); INV.addContact(H.G,YT); H.G.flags.TOWN_ACC_N={};
  const P0=INVITE_DATA.places.find(p=>p.id==='cafe');
  let r=null; try{ r=INV.personal(H.G,YT,P0,H.G.day,18,INV.decide(H.G,YT,P0.id,H.G.day,18)); }catch(e){ r={err:String(e)}; }
  check('1. 寒暑假平日約她：她照常答應（INV.decide 不是 away）',!!r&&r.res!=='decline'&&r.why!=='away',J(r&&{res:r.res,why:r.why}));
  const fl=strip(src('src/invites3d.js'));
  check('1. 邀約答應的那一段：答應那一句之後、「約好…」之前多 S.townLine 那一句（節日的約也一樣）',/const tw=S\.townLine\(G,id,W\);/.test(fl)&&/await S\.playLines\(GM,who,r\.lines,r\); if\(tw\) await GM\.say\(who,tw\); if\(tail\)/.test(fl)&&/INV\.townLine\(G,id,\{day:f\.d/.test(strip(src('src/fest3d.js'))));
  check('1. 回國重逢：她在淡水的那天照臺北約（vac3d.js 的 presence 條件放過 town）',/pr\.kind!=='home'&&!pr\.town\) continue;/.test(strip(src('src/vac3d.js'))));
});

/* ---------- 2 第 42 列：麵店日拿掉、長桌閒聊搬到桌遊夜 ---------- */
await sec(2,async()=>{
  const Z=CHARACTERS.zhe.daily_schedule;
  check('2. 阿哲的作息沒有麵店日（zone noodle＋ndlDay 那一筆拿掉）',!Z.some(e=>e&&e.zone==='noodle'&&e.ndlDay));
  let nd=null; for(let d=DK('2025-10-06');d<DK('2025-10-31');d++) if(STORY.noodleDay(d)&&![2,4].includes(CALENDAR.dateOf(d).wd%7)){ nd=d; break; }   /* AA_684 第 4 項：週二、四 18:00～19:30 他照一般作息在燒臘店（不是麵店日）——麵店日挑週一、三、五的那一天 */
  fresh(nd,18,'noodle'); H.FAMILIAR('zhe'); const ez=STORY.schedEnt(CHARACTERS.zhe,H.G);
  check('2. 麵店日（週一、三、五的那一天）18:00 阿哲不在燒臘店（麵店日的作息拿掉；週二、四的晚餐照 AA_684 第 4 項另外一筆）',nd!=null&&!(ez&&ez.zone==='noodle'),J([CALENDAR.dateOf(nd).key,ez&&ez.zone]));
  PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ['zhe','classmate_bohan','classmate_xinci','yu']) H.FAMILIAR(id);
  check('2. 燒臘店裡的長桌閒聊不再演（STORY.ndlTalkDue＝false；STORY.NDL_TALK_BGN）',STORY.NDL_TALK_BGN===true&&STORY.ndlTalkDue(H.G,false)===false);
  const skip=[]; for(const k of Object.keys(NOODLE_TABLE)) NOODLE_TABLE[k].forEach((e,i)=>{ if(e&&e.bgn===false) skip.push(k+'-'+(i+1)); });
  check('2. 換不了的（原本標 bgn:false 的大一 3 則、大二 2 則、大三 2 則、大四 3 則）AA_684 第 11 項都刪了：一則都不剩',J(skip)===J([]),J(skip));
  /* 桌遊夜：在群組、在場的人說的那一則照順序 */
  const n5=STORY.termDayIn('Y1S1',5,5); fresh(n5,22,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ['zhe','classmate_bohan','classmate_xinci',MX]) H.FAMILIAR(id);
  const p1=B.talkPick(H.G);
  check('2. 大一上第 5 週的桌遊夜：照順序挑第 1 則（阿哲、柏翰：「長桌已經坐了一半。…」）',!!p1&&p1.k==='Y1'&&p1.i===0,J(p1&&{k:p1.k,i:p1.i}));
  H.G.flags.ndlTalkN={Y1:1};
  const p2=B.talkPick(H.G);
  check('2. 輪到第 2 則：AA_684 第 11 項的桌遊夜版（芯慈的便利貼；芯慈、阿哲都在）',!!p2&&p2.i===1&&J(NOODLE_TABLE.Y1[1].who)===J(['classmate_xinci','zhe']),J(p2&&p2.i));
  H.G.flags.ndlTalkN={Y1:6}; const p7=B.talkPick(H.G);
  check('2. Alison 不在的那一晚：有 Alison 的那幾則跳過（第 7 則跳到第 1 則重新輪）',!!p7&&!(NOODLE_TABLE.Y1[p7.i].who||[]).includes('yu'),J(p7&&p7.i));
  PHONE.rec(H.G).groups.noodle_team=undefined; delete PHONE.rec(H.G).groups.noodle_team;
  check('2. 不在桌遊團群組＝沒有',B.talkPick(H.G)===null);
  /* 實際演一次桌遊夜（2D）：散場以前一則、輪到下一則、熟悉 +1 */
  fresh(n5,20,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ['zhe','classmate_bohan','classmate_xinci',MX]) H.FAMILIAR(id); H.G.flags.noodleTableDay=n5-7; H.G.flags.BGN_N=2;
  const famB=SOCIAL.rel('classmate_bohan').fam; H.said=[]; await EVENTS.runLines(B.EVENT.dialogue,B.EVENT); const L=says();
  const iEnd=L.findIndex(t=>B.LINES.end.includes(t)), iT=L.findIndex(t=>/長桌已經坐了一半/.test(t));
  check('2. 演完桌遊夜的場景（結束旁白）以後、散場以前，演長桌閒聊的第 1 則（三句照原文）',iEnd>=0&&iT>iEnd&&L.includes('阿哲：民總的作業誰寫完了？')&&L.includes('柏翰：寫完了。……不給抄。'),J(L));
  check('2. 輪到下一則（ndlTalkN.Y1＝1）、在場的柏翰熟悉 +1',(H.G.flags.ndlTalkN||{}).Y1===1&&SOCIAL.rel('classmate_bohan').fam>famB,J([H.G.flags.ndlTalkN,famB,SOCIAL.rel('classmate_bohan').fam]));
  check('2. 舊存檔記下的 ndlTalkN、ndlTalkOnce 照讀（同一個欄位）',/F\.ndlTalkN\|\|\{\}/.test(src('src/bgnight3d.js'))&&/ndlTalkOnce/.test(src('src/bgnight3d.js')));
});

/* ---------- 3 第 64 列：ev_yu_sign_seat 桌遊夜 2D ---------- */
await sec(3,async()=>{
  const e=ev('ev_yu_sign_seat');
  check('3. ev_yu_sign_seat：不在燒臘店自己觸發（manual、location any、沒有 ndlDay）、台詞照舊',!!e&&e.trigger==='manual'&&e.location==='any'&&!e.ndlDay&&J(e.dialogue)===J([{speaker:null,text:'Alison 每次都坐阿哲旁邊。'}]));
  const W=[]; for(let w=1;w<=16;w++){ const d=STORY.termDayIn('Y1S2',w,5); if(d!=null&&B.yuLate(d)) W.push(w); }
  check('3. Alison 23:00 從戲院趕到的那一次桌遊夜＝大一下第 13～15 週的桌遊夜（照隔週排＝第 14 週）',J(W)===J([14]),J(W));
  const n14=STORY.termDayIn('Y1S2',14,5), n12=STORY.termDayIn('Y1S2',12,5);
  const ck=(d,met)=>{ fresh(d,23,'dorm'); if(met) H.G.flags.met_yu=true; return EVENTS.check(e); };
  check('3. 條件：那一晚、認識 Alison（別的桌遊夜、不認識都不成立）',ck(n14,true)&&!ck(n12,true)&&!ck(n14,false));
  fresh(n14,20,'dorm'); H.G.flags.met_yu=true; PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ['zhe','classmate_bohan','classmate_xinci',MX,'yu']) H.FAMILIAR(id); H.G.flags.noodleTableDay=n14-70; H.G.flags.BGN_N=3;
  H.said=[]; await EVENTS.runLines(B.EVENT.dialogue,B.EVENT); const L=says(), iEnd=L.findIndex(t=>B.LINES.end.includes(t)), iS=L.indexOf('Alison 每次都坐阿哲旁邊。');
  check('3. 那一晚的桌遊夜：場景後面演「Alison 每次都坐阿哲旁邊。」、記 yu2SeatDay、記成演過（只一次）',iEnd>=0&&iS>iEnd&&H.G.flags.yu2SeatDay===n14&&!!H.G.events.done.ev_yu_sign_seat&&!EVENTS.check(e),J(L));
  fresh(n14,23.2,'dorm'); const s=B.sched({id:'yu'},H.G); fresh(n14,22,'dorm'); const s0=B.sched({id:'yu'},H.G);
  check('3. 那一晚 23:00 以後 Alison 也在日常失速（作息），23:00 以前不在',!!s&&s.away===B.LINES.away&&s0===null,J([s,s0]));
  fresh(n14,22,'dorm'); PHONE.join(H.G,'noodle_team','桌遊團'); for(const id of ['zhe','classmate_bohan','classmate_xinci',MX,'yu']) H.FAMILIAR(id); H.G.flags.ndlTalkN={Y1:5};
  const p=B.talkPick(H.G); check('3. 那一晚長桌閒聊有 Alison 的那幾則也可以輪到（輪到「憲法課老師今天點了阿哲兩次。」——AA_684 刪掉前面兩則以後是第 6 則，Alison 在）',!!p&&(NOODLE_TABLE.Y1[p.i].who||[]).includes('yu')&&p.i===5&&NOODLE_TABLE.Y1[5].dialogue[0].text==='（憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。）',J(p&&p.i));   /* AA_685 B5：舊的旁白加括號 */
  check('3. 第三個徵兆（騎樓、社課後）照舊讀 yu2SeatDay',/yu2SeatDay!=null/.test(src('src/data/events.js')));
  { const P=CHARACTERS.yu.presence, k14=CALENDAR.dateOf(n14).key, k15=CALENDAR.dateOf(n14+1).key, keep=P.absentDates; P.absentDates=(keep||[]).concat([[k14,k15,'（測試）出遠門','trip']]);   /* absentDates 不含最後一天 */
    fresh(n14,23.2,'dorm'); H.G.flags.met_yu=true; const s1=B.sched({id:'yu'},H.G), t1=B.talkHere(H.G,'yu'); const y1=await B.yuSign(GM); P.absentDates=keep;
    check('3. 那一天 Alison 人不在（出遠門）＝不來：作息不放日常失速、長桌閒聊不算她在、徵兆不演',s1===null&&!t1&&y1===false&&!H.G.events.done.ev_yu_sign_seat,J([s1,t1,y1])); }
});

/* ---------- 4 第 72 列：告白晚餐週六 17:30 一盞茶屋 ---------- */
await sec(4,()=>{
  const h=TERMEND.heart(YT,'Y1S2'), h0=TERMEND.heart(YT,'Y2S1');
  check('4. 語彤的心意邀約：週六（wd 6）17:30、一盞茶屋（tea_closed 的茶屋背景）',h.wd===6&&h.h===17.5&&h.place==='tea_closed'&&h.placeName==='一盞茶屋'&&h0.wd===6&&h0.h===17.5&&TERMEND_LINES.PLACE.tea_closed.bg==='wenzhou_teahouse',J({wd:h.wd,h:h.h,place:h.place,name:h.placeName}));
  check('4. 句子不改（使用者 11-04 選的那一句、invite2）',h.invite==='禮拜六我上班到五點。下班以後，你要不要來店裡？'&&h.invite2==='我會在吧檯收杯子。你到了敲門。'&&inDoc(AA675,h.invite)&&inDoc(AA675,h.invite2));
  const out={}; for(const t of ['Y1S1','Y1S2','Y2S1','Y3S1']){ const w=TERMEND.windowOf(t); fresh(w.from,1,'dorm'); H.FRIEND(YT); TERMEND.plan(H.G,w); const d=TERMEND.dinnerDay(H.G,w,Object.assign({},TERMEND.heart(YT,t)),YT); out[t]=d==null?null:CALENDAR.dateOf(d).key+'/'+CALENDAR.dateOf(d).wd%7; }
  check('4. 排到的日子：期末考考完、邀約以後的第一個週六（大一上 2025-12-20、大一下 6/18 雙主修筆試以後 2026-06-20、大二上 2026-12-26、大三上 2027-12-25）',
    out.Y1S1==='2025-12-20/6'&&out.Y1S2==='2026-06-20/6'&&out.Y2S1==='2026-12-26/6'&&out.Y3S1==='2027-12-25/6',J(out));
});

/* ---------- 5 第 80 列：聖誕碰到茶屋公休就提早一天 ---------- */
await sec(5,()=>{
  const ds=[2025,2026,2027,2028].map(y=>CALENDAR.dateOf(FEST.dayOf(YT,'xmas',y)).key);
  check('5. 遊戲的聖誕 12/24（一盞週一、二公休；2025 三、2026 四、2027 五、2028 日都有開）＝四年都不換日子',J(ds)===J(['2025-12-24','2026-12-24','2027-12-24','2028-12-24']),J(ds));
  check('5. 語彤的聖誕那一格寫 earlyIfClosed:wz_teahouse；別人的不受影響',FEST_DATA.PEOPLE[YT].fest.xmas.earlyIfClosed==='wz_teahouse'&&CALENDAR.dateOf(FEST.dayOf('heroine_02','xmas',2028)).key==='2028-12-24');
  const w0=PLACES.windowsOf; PLACES.windowsOf=(z,d)=>z==='wz_teahouse'&&CALENDAR.dateOf(d).key==='2028-12-24'?null:w0.call(PLACES,z,d);
  let d1=null; try{ d1=CALENDAR.dateOf(FEST.dayOf(YT,'xmas',2028)).key; } finally { PLACES.windowsOf=w0; }
  check('5. 那一天碰到茶屋公休（假設 12/24 公休）＝提早一天（12/23）',d1==='2028-12-23',d1);
  check('5. 台詞照 AA_661 第 80 列（「今天打烊早。蘇姨說，聖誕節要給年輕人。」照用）',FEST_DATA.PEOPLE[YT].fest.xmas.dt[0].text==='今天打烊早。蘇姨說，聖誕節要給年輕人。'&&inDoc(AA675,'今天打烊早。'));
});

/* ---------- 6 第 79 列：交往中的生日 18:30 在她家 ---------- */
await sec(6,()=>{
  fresh('2026-07-08',10,'dorm'); H.FRIEND(YT); H.G.flags['dating_'+YT]=true; const f={id:YT,k:'bday',y:2026,d:DK('2026-07-09'),W:{mode:'taipei'}};
  const ve=FEST.venues(H.G,f,'eve'), vn=FEST.venues(H.G,f,'noon');
  check('6. 交往中：晚上場只有「新生南路・她家」（2D、dark、18:30），中午場沒有地方',ve.length===1&&ve[0].kind==='2d'&&ve[0].place==='新生南路・她家'&&ve[0].bg==='dark'&&ve[0].h===18.5&&vn.length===0,J([ve,vn]));
  check('6. 地點字幕和背景同 ytjob3d.js「第一次去她家」那一場',J(YTJOB.HOME_EV.dialogue[0])===J({scene:'新生南路・她家',bg:'yt_home'})/* BG-128-INTEG-1114：晚上去她家的場用 yt_home（BB-B 11-14）*/);
  delete H.G.flags['dating_'+YT]; H.G.flags.romance={}; const vs=FEST.venues(H.G,f,'eve');
  check('6. 第 6 階（還沒交往）照舊在一盞茶屋',vs.every(v=>v.kind==='inv'&&v.P.id==='teahouse'),J(vs.map(v=>v.P&&v.P.id)));
  fresh('2026-07-08',10,'dorm'); H.FRIEND(YT); H.G.flags['dating_'+YT]=true; const q=FEST.plan2D(H.G,f,{h:18.5,place:'新生南路・她家',bg:'dark'});
  check('6. 排出遊：7/9 18:30、新生南路・她家（演的時候用這個字幕和底圖）',!!q&&q.h===18.5&&q.fest.scene==='新生南路・她家'&&q.fest.bg==='dark',J(q&&{h:q.h,fx:q.fest}));
  check('6. 交往中那一句照用（「今天秀琴姨煮了豬腳麵線。……多一碗。你的。」）',FEST_DATA.PEOPLE[YT].fest.bday.dt[0].text==='今天秀琴姨煮了豬腳麵線。……多一碗。你的。');
});

/* ---------- 7 第 32 列：礁溪照 AA_609 第 8 節 ---------- */
await sec(7,async()=>{
  const row=ENCOUNTERS.rows.find(r=>r.who===SIS&&r.spot==='D24'), TX=x=>typeof x==='string'?x:(x.narr||x.t);
  check('7. 偶遇的開頭：「她和家人坐在泡腳池邊：媽媽、阿公、奶奶，還有一個背對你的女生。」（AA_609）',row.why==='她和家人坐在泡腳池邊：媽媽、阿公、奶奶，還有一個背對你的女生。'&&inDoc(AA609,row.why));
  const all=[].concat(row.lines.acq,row.lines.friend,row.lines.dating).map(TX);
  check('7. 「爸媽排好了」拿掉；每一句都在 AA_609 第 8 節（字照稿）',!all.some(t=>/爸媽/.test(t))&&!/爸媽排好了/.test(strip(src('src/data/encounters.js')))&&all.every(t=>inDoc(AA609,t)||AA611_FIX.includes(t)),J(all.filter(t=>!inDoc(AA609,t)&&!AA611_FIX.includes(t))));   /* AA_611 第 1 列改的兩句不在 AA_609 */
  const SUN=STORY.termDayIn('Y3S1',3,7);
  const meet=async(tier,flags)=>{ fresh(SUN,11,'dorm',flags); H.G.trip={id:'D24'}; if(tier==='dating'){ H.FRIEND(SIS); H.G.flags['dating_'+SIS]=true; } else if(tier==='friend') H.FRIEND(SIS); else H.FAMILIAR(SIS); H.FAMILIAR('yu');
    sayIds.length=0; H.said=[]; H.picks=['打招呼']; const r=await ENC.meet(GM,row,ENC.tier(H.G,SIS)); return {r,L:sayIds.slice()}; };
  let m=await meet('acq');
  const yuL=m.L.filter(x=>x.id==='yu').map(x=>x.t), sisL=m.L.filter(x=>x.id===SIS).map(x=>x.t);
  check('7. 認識（有點熟）：學姊「學弟。……我們一家來的。」→ 旁白「（學姊的媽媽點了一下頭。）」→ 旁白 Alison 轉過頭來 → Alison 那幾句用她的立繪（charId yu）放在同一段對話（AA_593 第 11 節 ce8e3db3c）',sisL[0]==='學弟。……我們一家來的。'&&m.L.some(x=>x.id==null&&x.t==='（學姊的媽媽點了一下頭。）')&&m.L.some(x=>x.id==null&&x.t==='（那個背對你的女生轉過頭來。是 Alison。）')&&J(yuL)===J(['欸？祐廷？！你怎麼在這裡！','他是我們班的啊！……姊，他是妳直屬？','（看看你，又看看她）你們都沒說過！','……我是想說，又沒人問。']),J(m.L));
  check('7. 沒聽過 Alison 說姊姊在考法研所（沒有 HEARD_YU_SISTER）＝沒有「你想起…」那一句；不是朋友＝沒有「坐下來一起泡吧」',!m.L.some(x=>/你想起 Alison 說過/.test(x.t))&&!m.L.some(x=>/坐下來一起泡吧/.test(x.t)));
  check('7. 演完記 KNOWS_SIS_ALISON、記憶 ENC_D24_SIS（AA_684 第 8 項：名稱中性「在礁溪遇到學姊一家」；「Alison 是她妹妹」另外一條 KNOWS_SIS_ALISON）',H.G.flags.KNOWS_SIS_ALISON===true&&SOCIAL.has(SIS,'ENC_D24_SIS')&&SOCIAL.MEMORY_LABEL.ENC_D24_SIS==='在礁溪遇到學姊一家'&&SOCIAL.has(SIS,'KNOWS_SIS_ALISON')&&SOCIAL.MEMORY_LABEL.KNOWS_SIS_ALISON==='Alison 是她妹妹'&&inDoc(AA609,'在礁溪遇到學姊一家，Alison 是她妹妹'));
  { const w=[]; const r=ENC.eligible(H.G,row,w); check('7. 只一次：打過招呼以後同一場不再出現（大三下、大四下的第 3 週也一樣）',!r&&w.some(x=>/演過了/.test(x)),J(w)); }
  m=await meet('friend',{HEARD_YU_SISTER:true});
  check('7. 朋友＋聽過 Alison 說姊姊：多「（你想起 Alison 說過，她姊姊考上法研所了。原來就是學姊。）」（AA_611 第 1 列）；最後的「坐下來一起泡吧。阿公說人多比較好。」拿掉了（AA_593 第 11 節：使用者 11-02 選不邀你一起泡）',m.L.some(x=>x.t==='（你想起 Alison 說過，她姊姊考上法研所了。原來就是學姊。）')&&!m.L.some(x=>/坐下來一起泡吧/.test(x.t)),J(m.L));
  m=await meet('dating');
  check('7. 交往中：「你怎麼在這裡？」→ 旁邊的女生轉過頭來 → Alison「祐廷？！……姊，妳男朋友是他？」→「……我好像沒跟你講過。這是我妹。」',m.L.some(x=>x.id==='yu'&&x.t==='祐廷？！……姊，妳男朋友是他？')&&m.L.some(x=>x.id===SIS&&x.t==='……我好像沒跟你講過。這是我妹。')&&m.L.some(x=>x.t==='（學姊看了你一眼，回去坐好。）')&&H.G.flags.KNOWS_SIS_ALISON===true,J(m.L));
  /* 舊存檔：看過舊版（已經有 ENC_D24_SIS）＝不重演、不設 KNOWS_SIS_ALISON */
  fresh(SUN,11,'dorm'); H.FRIEND(SIS); SOCIAL.remember(SIS,'ENC_D24_SIS',''); { const w=[]; const r=ENC.eligible(H.G,row,w); check('7. 舊存檔看過舊版的：不重演、KNOWS_SIS_ALISON 不設',!r&&!H.G.flags.KNOWS_SIS_ALISON,J(w)); }
  check('7. 3D 不多放人（偶遇本來就是 2D 對話框；沒有 spawn）、不改成手機訊息',!row.spawn&&!/D24/.test(JSON.stringify((ENCOUNTERS.school||{}).ENC_D24_SIS&&ENCOUNTERS.school.ENC_D24_SIS.phone||'')));
});

/* ---------- 8 第 63 列：二十三週年 ---------- */
await sec(8,()=>{
  const A=ev('ev_noodle_23rd').dialogue, line=t=>A.find(l=>l&&l.text===t);
  const rem=line('我記得。我記得每個人第一次點什麼。');
  check('8. 「我記得每個人第一次點什麼」換給阿鳳（這一場的「阿姨」）說',!!rem&&rem.speaker==='阿姨',J(rem));
  check('8. 語彤的店員戲拿掉：沒有她端碗、從櫃台後面拿傘的句子',!A.some(l=>l&&/語彤/.test(String(l.text||''))&&/櫃台|端/.test(String(l.text||'')))&&!A.some(l=>l&&l.speaker===YT&&/點什麼|端/.test(String(l.text||''))),J(A.filter(l=>l&&/語彤/.test(String(l.text||''))).map(l=>l.text)));
  check('8. 「新屋主也來排隊」是旁白（不是語彤說的）',A.some(l=>l&&l.speaker===null&&/新屋主也來排隊/.test(l.text))&&!A.some(l=>l&&l.speaker===YT&&/新屋主/.test(l.text)));
  const d=STORY.dayOfKey('2028-12-12'); fresh(d,18,'noodle'); H.FRIEND(YT);
  check('8. 12/12 她在店裡約你那一段拿掉（Y34B.a23TueDue 一直是 false、ev_yt_23rd_notice 退場）',Y34B.a23TueDue(H.G)===false&&!!ev('ev_yt_23rd_notice').retired);
});

/* ---------- 9 表外 vac_activities.js:466 ---------- */
await sec(9,()=>{
  const R=VAC_DATA.TRIP_MSG.reunion[YT];
  check('9. 語彤回來那一場：invite（AA_684 第 3 項改「這週六我五點下班」／「你來店裡」，排最近的週六）、17:15、一盞茶屋、茶屋的背景',J(R.invite)===J(['這週六我五點下班','你來店裡'])&&R.h===17.25&&R.place==='一盞茶屋'&&R.bg==='wenzhou_teahouse',J({invite:R.invite,h:R.h,place:R.place,bg:R.bg}));
  check('9. lines：（她把一杯烏龍放在你前面，坐到對面。）／「回來了。」／「這壺是蘇姨請的。」；miss「昨天那壺我自己喝了」（字照 AA_675 2-6）',
    J(R.lines)===J([{narr:'（她把一杯烏龍放在你前面，坐到對面。）'},{who:YT,text:'回來了。'},{who:YT,text:'這壺是蘇姨請的。'}])&&J(R.miss)===J(['昨天那壺我自己喝了'])&&['你來店裡','這壺是蘇姨請的。','昨天那壺我自己喝了','（她把一杯烏龍放在你前面，坐到對面。）'].every(t=>inDoc(AA675,t)));   /* 「明天我五點下班」AA_684 第 3 項換掉了（tests/aa684_canon_fix_unit.js 對 AA_684）*/
});

H.done();
})();
