// AA_625 語彤新版事件（企劃線 9ba14498e）：雨天的總圖門口、茶屋的班（找公園的貓、第一次領薪水、平常的班、她今天沒來、媽媽發現）——不需要瀏覽器。修改前全部 FAIL。用法：node tests/aa625_yt_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start1'};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|CAMP_Y1_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ACTIVITIES|REL_LINES|SUP497|SUP497_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/characters.js','src/data/events.js','src/data/camp_y1.js','src/data/rel_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
for(const f of ['src/data/sup497_lines.js','src/sup497_3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},setBg(){},hide(){},show(){},slots:{}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[], picks=[], optsSeen=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}],levels:null,setWeather(){},endCinematic(){},cam:{distTarget:0}},D:{active:false,busyDepth:0},npc:{},
  advance(h){ G.hour+=h; },sitAt(){},standUp(){},rel(){},sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g){ G.goal=g; },toast(){},updateHUD(){},letterbox(){},fade:()=>Promise.resolve(),titleCard:async()=>{},
  say:async(who,t)=>{ said.push(typeof who==='string'?who+'：'+t:(who&&who.name?who.name+'：'+t:t)); },
  choose:async opts=>{ optsSeen.push(opts.map(o=>o.t).join('/')); const want=picks.shift(); if(want==null) return 0; const k=opts.findIndex(o=>o.t.indexOf(want)>=0); return k<0?0:k; },
  enter:async(z)=>{ G.zone=z; }, spawnNPC(){ return null; }, spawnCharacter(){ return null; }};
const fresh=()=>{ G={day:1,weekday:3,hour:21.2,zone:'dorm',stage:'law',name:'祐廷',money:22000,flags:{},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,msgs:[],goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); if(INV.bind) INV.bind(G); said=[]; picks=[]; optsSeen=[]; };
const day=k=>STORY.dayOfKey(k), ev=id=>STORY_EVENTS.find(e=>e.id===id);
const at=(k,h,o)=>{ G.day=day(k); G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=h; Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29'),KAI_MOVEIN:true,MET_KAI:true},o||{}); };
const is=(s,t)=>s===t||(s||'').endsWith('：'+t), block=list=>{ const i0=said.findIndex(s=>is(s,list[0])); if(i0<0) return 'missing: '+list[0]; for(let k=0;k<list.length;k++) if(!is(said[i0+k],list[k])) return 'at '+k+': '+said[i0+k]; return ''; };
const card=id=>{ const m=(G.social.mem[id]||[]).find(x=>x.tag==='FRIEND_CARD'); return m?m.note:null; }, fam=id=>SOCIAL.rel(id).fam|0;

global.JOBS={SHIFT_EV:[],MID_EV:[],at:(G,k)=>k==='tea'?{lv:1}:null,play:async(GM,L)=>{ for(const x of (L||[])){ if(Array.isArray(x)) await GM.say(x[0]==='player'?{name:'祐廷'}:(x[0]&&CHARACTERS[x[0]]?{name:CHARACTERS[x[0]].name}:x[0]),x[1]); } }};
load('src/ytjob3d.js');
const cp=require('child_process'); require('./alison.js');
const DOC=(()=>{ try{ return cp.execSync('git -C '+JSON.stringify(ROOT)+' show 9ba14498e:"docs/story_planning/AA_625_語彤新版事件台詞.md"',{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } })();
const evsrc=fs.readFileSync(path.join(ROOT,'src/data/events.js'),'utf8');
const tdOf=(term,week,wd)=>{ const T=CALENDAR.termDays(term); for(let d=T.from;d<=T.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===week&&CALENDAR.dateOf(d).wd===wd) return d; } return null; };
const shift=async(n)=>{ for(const f of JOBS.MID_EV) await f(GM,'tea',n,{}); for(const f of JOBS.SHIFT_EV) await f(GM,'tea',n,{}); };
(async()=>{
  fresh();
  check('0. 稿讀得到（企劃線 9ba14498e AA_625）',DOC.length>5000);
  const lines=[]; for(const k of ['CATS','PAY','MOM']) for(const v of Object.values(YTJOB[k])) for(const x of (Array.isArray(v)?v:[])){ if(Array.isArray(x)) lines.push(x[1]); else if(x&&x.t){ lines.push(x.t); for(const y of x.say||[]) lines.push(y[1]); } }
  for(const s of YTJOB.SHIFT_LINES) for(const x of s) lines.push(x[1]);
  const strip=t=>t.replace(/^「|」$/g,'');
  const miss=lines.filter(t=>DOC.indexOf(t)<0&&DOC.indexOf(strip(t))<0);
  check('0. 茶屋那幾場（貓、第一次領薪水、平常的班、她今天沒來、媽媽發現）的句子都在稿裡',miss.length===0,JSON.stringify(miss.slice(0,5)));
  // 雨天的總圖門口
  const rain=ev('ev_rain_library_door'); const rt=rain.dialogue.filter(l=>l.text).map(l=>l.text);
  check('1. 雨天的總圖門口：照 AA_625 第 1 節（一起躲雨、新生南路、「妳太爽了吧」），舊的四個選項拿掉',rt.every(t=>DOC.indexOf(t)>=0)&&rt.includes('妳太爽了吧，家裡就住學校對面。')&&!/我的給妳，我等等搭車/.test(JSON.stringify(rain)),JSON.stringify(rt.filter(t=>DOC.indexOf(t)<0)));
  check('1. 要 YT_MET_JOB；記 SHARED_UMBRELLA',(rain.prereq.flags||[]).includes('YT_MET_JOB')&&/SHARED_UMBRELLA/.test(JSON.stringify(rain.dialogue)));
  // 第一班＋前兩班：TEA_SHIFTS；第三班打烊＝貓
  fresh(); const d0=tdOf('Y1S1',3,6); G.day=d0; G.hour=13; await YTJOB.firstShift(GM,{}); await shift(1);
  check('2. 第一班：YT_MET_JOB、TEA_SHIFTS=1、JOB_TEA',G.flags.YT_MET_JOB===true&&G.flags.TEA_SHIFTS===1&&G.flags.JOB_TEA===true,JSON.stringify({t:G.flags.TEA_SHIFTS,j:G.flags.JOB_TEA}));
  G.day=d0+1; await shift(2); check('2. 第二班：TEA_SHIFTS=2、沒有貓',G.flags.TEA_SHIFTS===2&&!G.flags.YT_CATS);
  G.day=d0+7; said=[]; picks=['好啊','妳一個人住喔']; await shift(3);
  check('2. 第三班打烊：「要不要一起去找公園的貓？」→「好啊。」＝聽到她家裡（淡水、爸媽離婚、秀琴姨），記 YT_CATS、YT_FAMILY_HEARD',G.flags.YT_CATS===true&&G.flags.YT_FAMILY_HEARD===true&&said.some(s=>/我爸媽離婚了/.test(s))&&said.some(s=>/秀琴姨/.test(s)),said.slice(-6).join(' | '));
  fresh(); G.day=d0; G.hour=13; await YTJOB.firstShift(GM,{}); await shift(1); G.day=d0+1; await shift(2); G.day=d0+7; picks=['今天不行']; said=[]; await shift(3);
  check('2. 「今天不行。」＝「嗯。下次。」、不記 YT_FAMILY_HEARD、之後不再問',!G.flags.YT_FAMILY_HEARD&&said.some(s=>/嗯。下次。/.test(s))&&G.flags.YT_CATS_NO===true);
  // 第一次領薪水：第 8 週週日以後第一個班打烊
  fresh(); G.flags.YT_MET_JOB=true; G.flags.TEA_SHIFTS=5; G.flags.YT_CATS_NO=true; G.day=tdOf('Y1S1',8,6); said=[]; await shift(6);
  check('3. 第 8 週週六＝還不發薪水',!G.flags.YT_FIRST_PAY);
  G.day=tdOf('Y1S1',8,7); said=[]; picks=['為什麼不拆']; await shift(7);
  check('3. 第 8 週週日打烊：兩個薪水袋、YT_FIRST_PAY',G.flags.YT_FIRST_PAY===true&&said.some(s=>/兩個薪水袋/.test(s))&&said.some(s=>/花掉就不知道它長什麼樣子了/.test(s)),said.slice(-3).join(' | '));
  // 媽媽發現
  fresh(); G.flags.YT_MET_JOB=true; G.flags.TEA_SHIFTS=10; G.flags.YT_FIRST_PAY=true; G.flags.YT_CATS_NO=true;
  G.day=tdOf('Y1S2',9,6); said=[]; await shift(11);
  check('4. 大一下第 9 週週六的班：媽媽站在門口（在場版）',said.some(s=>/……媽。/.test(s))&&said.some(s=>/我在外面等妳下班/.test(s))&&G.flags.YT_MOM_HERE===true,said.slice(0,4).join(' | '));
  G.day=tdOf('Y1S2',9,7); said=[]; await shift(12);
  check('4. 第 9 週週日：她請假（蘇姨「她說家裡有事。」）；作息那天不在茶屋',said.some(s=>/她說家裡有事/.test(s))&&YTJOB.absent(G));
  G.day=tdOf('Y1S2',10,6); said=[]; picks=['妳想考牙醫']; await shift(13);
  check('4. 第 10 週回來上班：「這是我自己選的。」；沒聽過家裡的補一句、記 YT_FAMILY_HEARD、YT_PARENTS_KNOW',said.some(s=>/這是我自己選的/.test(s))&&said.some(s=>/我媽在淡水開牙醫診所/.test(s))&&G.flags.YT_PARENTS_KNOW===true&&G.flags.YT_FAMILY_HEARD===true,said.slice(-4).join(' | '));
  /* 6 房東來過了（AA_625 第 6 節，在茶屋聽她說）：10' 之後的下一個週末班打烊；記 RENT_RUMOR、ev_yutong_landlord 演過；一次 */
  G.day=tdOf('Y1S2',10,7); said=[]; await shift(14); const R6=YTJOB.RENT.map(x=>x[1]);
  check('6. 第 10 週週日（10\' 的下一班）打烊：「……嗯。昨天秀琴姨煮完飯，沒有馬上走。」…祐廷「我上課有聽過…」→「嗯。你查到再跟我說。」；記 RENT_RUMOR、ev_yutong_landlord',R6.every(t=>said.some(x=>x.endsWith(t)))&&R6.every(t=>DOC.includes(t))&&SOCIAL.has('heroine_03','RENT_RUMOR')&&G.events.done.ev_yutong_landlord===G.day&&!!(STORY_EVENTS.find(e=>e.id==='ev_yutong_landlord')||{}).retired,JSON.stringify(said));
  G.day=tdOf('Y1S2',11,6); said=[]; await shift(15); check('6. 下一班不再說',!said.some(x=>/秀琴姨煮完飯/.test(x)),JSON.stringify(said));
  /* 11 想幫秀琴姨（AA_625 第 11 節；開頭 AA_643 第 1 節）：大二下第 15 週以後的週末班打烊、要 RENT_CONSULTATION；記 YT_HELP_OFFERED；選①＝YT_FIGHT，兩週後的週末班道歉＝APOLOGIZED */
  fresh(); G.flags.YT_MET_JOB=true; G.flags.TEA_SHIFTS=40; G.flags.YT_FIRST_PAY=true; G.flags.YT_CATS_NO=true; G.flags.YT_MOM_BACK=1; G.events.done.ev_yutong_landlord=1;
  G.day=tdOf('Y2S2',15,6); said=[]; await shift(41); check('11. 沒有 RENT_CONSULTATION：沒有',!said.some(x=>/押金/.test(x)),JSON.stringify(said));
  SOCIAL.remember('heroine_03','RENT_CONSULTATION',''); G.day=tdOf('Y2S2',14,7); said=[]; await shift(42); check('11. 第 14 週：還沒有',!said.some(x=>/押金/.test(x)));
  G.day=tdOf('Y2S2',15,6); said=[]; picks=['她要的不是錢','可以不用搬']; await shift(43); const H11=YTJOB.HELP;
  check('11. 第 15 週週末班打烊：「（打烊。蘇姨先走了。…）」「我想幫秀琴姨付新房子的押金。…」→ 選①「那她要什麼？」…「……我知道。」；記 YT_HELP_OFFERED、YT_FIGHT',said.some(x=>x.endsWith('（打烊。蘇姨先走了。語彤在數今天的零錢，數到一半停下來。）'))&&said.some(x=>x.endsWith('我有的就只有錢。'))&&said.some(x=>x.endsWith('……我知道。'))&&G.flags.YT_HELP_OFFERED===true&&SOCIAL.has('heroine_03','YT_FIGHT')&&!SOCIAL.has('heroine_03','APOLOGIZED'),JSON.stringify(said));
  G.day=tdOf('Y2S2',16,6); said=[]; await shift(44); check('11. 一週後還沒道歉',!said.some(x=>/你說得對/.test(x)));
  G.day=tdOf('Y2S2',15,6)+14; said=[]; await shift(45);   /* 第 15 週週六＋14 天（學期剛結束的暑假週末班）*/ check('11. 兩週後的週末班：「上次……你說得對。…」；記 APOLOGIZED',said.some(x=>x.endsWith('上次……你說得對。她要的是可以不用搬。我不應該拿錢去堵。'))&&SOCIAL.has('heroine_03','APOLOGIZED'),JSON.stringify(said));
  check('11. 台詞都在 AA_625 第 11 節（開頭照 AA_643 第 1 節）',[].concat(H11.a,H11.b,H11.c,H11.sorry,H11.a2.say,H11.open.slice(1)).every(x=>DOC.includes(x[1].replace(/^（|）$/g,'')))&&!!(STORY_EVENTS.find(e=>e.id==='ev_yt_help_dishes')||{retired:true}).retired);
  /* 5 圖書館三樓（AA_643 第 9-1 節，企劃線 4862b7139）：新遊戲（YT_JOB_V）＝大一下第 10 週以後週末 17:30～19:00、YT_PARENTS_KNOW；舊存檔照舊 21:00～22:00 阿姨那一版 */
  { const T=STORY_EVENTS.find(e=>e.id==='ev_yutong_thanks'), C=T.prereq.custom, g=(wk,wd,h,f)=>({day:tdOf('Y1S2',wk,wd),hour:h,flags:Object.assign({YT_JOB_V:1,YT_PARENTS_KNOW:true},f||{})});
    const A643=(()=>{ try{ return cp.execSync('git -C '+JSON.stringify(ROOT)+' show 4862b7139:"docs/story_planning/AA_643_語彤AA625接線_回LAWWW六題＋畢業那天四句.md"',{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } })();
    const i=T.dialogue.findIndex(l=>l.label==='v3'), V=T.dialogue.slice(i).filter(l=>l.text).map(l=>l.text);
    check('5. 新遊戲：第 10 週週六 18:00＝有；週三、第 9 週、19:30、沒有 YT_PARENTS_KNOW＝沒有；舊存檔（沒有 YT_JOB_V）照舊 21:00～22:00＋yutong_hospital',C(g(10,6,18))&&C(g(12,7,17.6))&&!C(g(10,3,18))&&!C(g(9,6,18))&&!C(g(10,6,19.5))&&!C(g(10,6,18,{YT_PARENTS_KNOW:false}))&&C({day:tdOf('Y1S2',10,2),hour:21.5,flags:{yutong_hospital:true}})&&!C({day:tdOf('Y1S2',10,6),hour:18,flags:{}}));
    check('5. 新稿的句子都在 AA_643 第 9-1 節（開頭旁白、三句、三個選項的回覆、最後一句）',A643.length>1000&&V.length===8&&V.every(t=>A643.includes(t.replace(/^「|」$/g,''))),JSON.stringify(V.filter(t=>!A643.includes(t)))); }
  fresh(); G.flags.YT_MET_JOB=true; G.day=tdOf('Y1S2',11,2); YTJOB.momKnown(G); check('4. 沒去上班的玩家：第 9 週週六過了也記 YT_PARENTS_KNOW（閒聊階梯的條件）',G.flags.YT_PARENTS_KNOW===true);
  check('5. 接線：jobs3d.js 有 MID_EV、story3d.js schedEnt 看 YTJOB.absent',/S\.MID_EV=\[\]/.test(fs.readFileSync(path.join(ROOT,'src/jobs3d.js'),'utf8'))&&/YTJOB\.absent/.test(fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8')));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
