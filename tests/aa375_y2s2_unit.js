// AA_375（企劃線 45121a97；AA 2026-10-21 定稿）法律系大二下：芷若「最後一個班」以後、時間、人在哪——不需要瀏覽器。任務 AA375-Y2S2-FIX-1021。
//   1 芷若上班作息到 6/3：之後吧檯是小婷、約她「今天是客人」、心意／女朋友的期末新句、招呼不用上班版、回訊息不照上班作息
//   2 錄取那一場 6/3 那個班以前、「五個多月」　3 子晴爸爸那則第 12 週（5/16）　4 阿哲外澳大二下只在 6/5　5 春假一台車最多三個人
//   6 期末邀約從最後一科考完的隔天　7 語彤 Y4-L7　8 考完試走出教室在最後一科、Alison「租賃」　9 「上次我陪阿姨去法服。」　10 明軒說明會那則 3/15 21:00
//   11 可昕 K4-L2 第 5 週起、只給 3/25 去了的　12 芷若 Z4-L4 第 11 週以後跳過　13 子晴說演唱會 5/17 以後（演唱會 5/15）　14 春假出遊那天去的人作息停掉
//   15 可昕見麵店團「我們八點讀書會」、Alison 拉著柏翰、群組不算他們　16 語彤第 8～9 週不在麵店　17 以安「上次那份公文」　18 可昕「你們講過了嗎？」
//   19 語彤的債各　20 許教授那句只在大一　21 語彤事件 11 補演和期末飯互斥　22 阿哲期末一起讀第 14～15 週　23 讀了幾頁
//   第 4 節提醒：AA_342 第 2-2 節七則、AA_255 說明會散場三句、6/4 子晴四則版、AA_255 第 2 節第 5 點（以安讀書會招呼避開第 8、9、16 週）
//   LAWWW 補充（AA_373 第 6 節第 9 題，企劃線 bdab2f42）：6/3 以前芷若「九點」改「十點」、邀約 22:00（含 MSG-2 生日回問「十點，店門口。」）
//   BB 測試（第 6 節）：6/4 以後吧檯不是芷若、「今天是客人」；大二下期末不說「九點下班」；5/12～6/3 聽到錄取（五個多月）、6/4 以後不會第一次聽到；5/16 收到爸爸那則；4/4 車上最多三個人
// 修改前（開發分支 89008abd、合併後 468ea48f）：上面每一項都會失敗（標「對照」的照樣通過）。用法：node tests/aa375_y2s2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL_LINES|DORM_ROOM|SYLLABUS|EAT|EAT_LINES|Y2B|GROUP_EVENTS|GROUP|Y2R2|ENC|ENCOUNTERS|EXAM_BANK)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/encounters.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js','src/data/y1fill_events.js',
  'src/data/dorm_room_layout.js','src/data/syllabus.js','src/data/exam_bank.js','src/story3d.js','src/classes3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){},build:()=>mkObj()};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; while(G.hour>=24){ G.hour-=24; G.day++; } G.weekday=wdOf(G.day); },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  spawnCharacter(id,x,z,o){ const n=Object.assign({id,charId:id,name:(CHARACTERS[id]||{}).name||id,obj:mkObj()},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>CALENDAR.dateOf(d).key;
const fresh=(key,hour,zone,flags)=>{ const day=typeof key==='number'?key:D(key); G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; E.npcs=[]; E.interactables=[]; return G; };
const to=(key,h)=>{ G.day=typeof key==='number'?key:D(key); G.hour=h; G.weekday=wdOf(G.day); };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const dateWith=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); if(r) r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evTexts=e=>{ const out=[]; const walk=o=>{ if(!o||typeof o!=='object') return; if(Array.isArray(o)){ o.forEach(walk); return; } for(const k of Object.keys(o)){ const v=o[k]; if((k==='text'||k==='t')&&typeof v==='string') out.push(v); else if(typeof v==='object') walk(v); } }; walk(e&&e.dialogue); return out; };
const lines=()=>said.map(s=>s.t);
const play=async(id,pk)=>{ said=[]; opts=[]; picks=[].concat(pk==null?[]:pk); await EVENTS.run(ev(id)); return lines(); };
const sched=id=>STORY.schedEnt(CHARACTERS[id],G);
const lad=(term,cid,sid)=>(((LADDER.byTerm[term]||{})[cid]||{}).steps||[]).find(s=>s.id===sid);
(async()=>{
  // ===== 第 1 項：芷若的上班作息到 6/3 =====
  fresh('2027-06-03',20,'cafe'); const zr3=sched('heroine_02');
  to('2027-06-04',20); const zr4=sched('heroine_02'); to('2027-06-07',12); const zr7a=sched('heroine_02'); to('2027-06-07',15); const zr7b=sched('heroine_02');
  check('1. 芷若上班作息到 6/3：6/3（四）20:00 在班；6/4（五）20:00、6/7（一）12:00 不在班；6/7 15:00 在 Café 當客人（不是 barista）',
    !!zr3&&zr3.act==='barista'&&!(zr4&&zr4.act==='barista')&&!(zr7a&&zr7a.act==='barista')&&!!zr7b&&zr7b.zone==='cafe'&&zr7b.act!=='barista',J([zr3&&zr3.act,zr4&&zr4.act,zr7a&&zr7a.act,zr7b&&[zr7b.zone,zr7b.act]]));
  to('2026-10-07',12); const zrA=sched('heroine_02'); to('2028-03-01',20); const zrB=sched('heroine_02');
  check('1. 對照：大二上 10/7（三）12:00 在班；2028-03-01（三）20:00 從英國回來以後照現有設定在班',!!zrA&&zrA.act==='barista'&&!!zrB&&zrB.act==='barista',J([zrA&&zrA.act,zrB&&zrB.act]));
  check('1. STORY.zrNoShift：6/3 否、6/4 是、9/2 是、9/3 否',typeof STORY.zrNoShift==='function'&&!STORY.zrNoShift(G,D('2027-06-03'))&&STORY.zrNoShift(G,D('2027-06-04'))&&STORY.zrNoShift(G,D('2027-09-02'))&&!STORY.zrNoShift(G,D('2027-09-03')));
  // 吧檯點餐（BB 測試）：6/4 以後是學妹小婷
  // AA_519 第 9 節第 3 點（企劃線 169130daf，2026-10-28）：6/4 起照班表——芷若原本的班（週一三五 11:00～15:00、週一到週五 19:00～22:00）是小婷，其他時間是老闆。
  //   原本查 6/7（一）15:00＝小婷；15:00 已經不是芷若的班＝老闆。改成 6/7 12:00 查小婷（原本的意思：吧檯不是芷若）、15:00 查老闆
  { fresh('2027-06-07',12,'cafe'); SOCIAL.remember('heroine_02','FIRST_MET',''); const T=EAT_LINES.staff['兩點半 Café'];
    const a=typeof EAT.staffName==='function'?EAT.staffName(G,'兩點半 Café',T):null; to('2027-06-07',15); const c=typeof EAT.staffName==='function'?EAT.staffName(G,'兩點半 Café',T):null; to('2027-05-31',16); const b=typeof EAT.staffName==='function'?EAT.staffName(G,'兩點半 Café',T):null;
    check('1. 吧檯點餐 6/4 起是學妹小婷（BB 測試：吧檯不是芷若；AA_519 第 9 節第 3 點起是芷若原本的班：6/7 週一 12:00）、6/7 15:00 不是她的班＝老闆；5/31 芷若不在班的時候照舊「老闆」',a==='小婷'&&c==='老闆'&&b==='老闆',J([a,c,b])); }
  { const e=ev('ev_cafe_barista_zhiruo'), pq=k=>{ fresh(k[0],k[1],'cafe'); SOCIAL.remember('heroine_02','FIRST_MET',''); return !e.prereq||!e.prereq.custom||!!e.prereq.custom(G); };
    check('1. 6/7 她在 Café 當客人：和她說話不是點餐（「兩點半的店員」不演）；對照 5/31 她在班照演',!pq(['2027-06-07',15])&&pq(['2027-05-31',12])); }
  // 約她（BB 測試）：6/4 起「我在 Café，今天是客人。你要來嗎？」
  { fresh('2027-06-07',13,'dorm'); R('heroine_02','FAM'); const P=INV.place('cafe'); const r1=INV.personal(G,'heroine_02',P,D('2027-06-07'),15,{res:'accept'});
    const r2=INV.personal(G,'heroine_02',P,D('2027-05-31'),12,{res:'accept'});
    check('1. 6/7 15:00 約她去 Café：「我在 Café，今天是客人。你要來嗎？」（BB 測試）',!!r1&&r1.res==='here'&&J(r1.lines)===J(['「我在 Café，今天是客人。你要來嗎？」']),J(r1));
    check('1. 對照：5/31（一）12:00 她在班＝「我會在 Café 啊，你直接過來，我幫你做一杯。」（BB_172 Z16）',!!r2&&r2.res==='here'&&J(r2.lines)===J(['「我會在 Café 啊，你直接過來，我幫你做一杯。」']),J(r2)); }
  // 招呼：大二下 6/4 起只用不上班的版本
  { fresh('2027-06-07',15,'cafe',{CAFE_VISITS:5}); R('heroine_02','FAM'); const BAD=['（她把杯子推過來）你的。我看到你在門口就做了。','（她在吧檯後面點了一下頭，手沒停）','（她在吧檯後面抬頭）……嗨。','要打烊了。……你可以坐到我擦完這張桌子。','期末了。我還有一份報告沒寫，店裡也要盤點。'];
    const got=[]; for(let i=0;i<6;i++){ G.social.greetUsed={}; const t=STORY.ladGreet(G,'heroine_02'); got.push(t); G.day++; G.weekday=wdOf(G.day); if(G.weekday===6||G.weekday===0){ G.day+=G.weekday===6?2:1; G.weekday=wdOf(G.day); } }
    const gg=got.filter(Boolean); check('1. 6/7 起在 Café（當客人）的招呼：沒有上班、吧檯、打烊、盤點那幾句',gg.length>=3&&gg.every(t=>!BAD.includes(t)),J(got));
    fresh('2027-05-31',12,'cafe',{CAFE_VISITS:5}); R('heroine_02','FAM'); const w=STORY.ladGreet(G,'heroine_02');
    check('1. 對照：5/31（一）12:00 她在班＝上班版「（她把杯子推過來）你的。我看到你在門口就做了。」',w==='（她把杯子推過來）你的。我看到你在門口就做了。',w); }
  // 回訊息時間：交往中 15:10 的規則只在她還上班的時候
  { fresh('2027-06-07',10,'dorm'); INV.addContact(G,'heroine_02'); R('heroine_02','FRI'); dateWith('heroine_01'); ROM.learn(G,'heroine_02','heroine_01','test');
    const a=MSG.replyAt(G,'heroine_02'); to('2027-05-31',10); const b=MSG.replyAt(G,'heroine_02');
    check('1. 回訊息不照上班作息：6/7 10:00（祐廷交往中）不再等到 15:10；對照 5/31 10:00＝15:10',!!a&&!(a.h>15&&a.h<15.3)&&a.day===D('2027-06-07')&&!!b&&Math.abs(b.h-(15+10/60))<1e-6,J([a,b])); }
  { fresh('2027-06-07',23.5,'dorm'); INV.addContact(G,'heroine_02'); R('heroine_02','FAM'); const got=[]; for(let i=0;i<8;i++){ const e=MSG.pick(G,'heroine_02','chat'); if(e) got.push((e.msgs||[]).join('／')); }
    check('1. 6/7 深夜「在幹嘛」：不說「下班回來都這個時間」、不說「怎麼跟客人介紹」',got.length>0&&!got.some(t=>/下班|客人/.test(t)),J(got)); }
  // 期末：心意、女朋友、朋友
  { const H=TERMEND.heart('heroine_02','Y2S2'), F=TERMEND.gf('heroine_02','Y2S2'), Fr=TERMEND.friend?TERMEND.friend('heroine_02','Y2S2'):null;
    check('1. 心意邀約（大二下）：「這禮拜五晚上我有空。……我想吃飯，不想吃店裡的東西。」、不在 Café 打烊以後',!!H&&H.invite==='這禮拜五晚上我有空。……我想吃飯，不想吃店裡的東西。'&&H.place!=='cafe',J(H&&[H.invite,H.place]));
    check('1. 交往中期末約會（大二下）：「禮拜五晚上，我們去吃宵夜。……我現在不用上班了。」、公館宵夜',!!F&&F.invite==='禮拜五晚上，我們去吃宵夜。……我現在不用上班了。'&&F.place==='yexiao',J(F&&[F.invite,F.place]));
    check('1. 朋友的期末飯（大二下）：她不顧店了，不在 Café 打烊以後；句子照 AA_369 M2',!!Fr&&Fr.place!=='cafe'&&Fr.genByTerm.Y2S2==='考完了嗎？九月我就走了。……出來吃個東西？',J(Fr&&Fr.place));
    const all=[H.invite,F.invite,Fr&&Fr.genByTerm.Y2S2];
    check('1. 大二下期末邀約芷若不說「九點下班」（BB 測試）',all.every(t=>t&&!/九點/.test(t)&&!/等我下班/.test(t)),J(all)); }
  // ===== LAWWW 補充：6/3 以前「九點」改「十點」、22:00（AA_373 第 6 節第 9 題）=====
  { const ok=[];
    for(const t of ['Y1S1','Y1S2','Y2S1']){ const H=TERMEND.heart('heroine_02',t), F=TERMEND.gf('heroine_02',t); ok.push([t,H.invite,H.invite2,H.h,F.invite,F.h]); }
    check('補充. 心意邀約大一上～大二上「這禮拜五我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。」、第二次「禮拜五十點。……上次那句，你想好了嗎？」、22:00',
      ok.every(x=>x[1]==='這禮拜五我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。'&&x[2]==='禮拜五十點。……上次那句，你想好了嗎？'&&x[3]===22),J(ok));
    check('補充. 女朋友的學期末約會大一上～大二上 22:00（邀約那一句 AA_456 1-5 照學期換：大一上「禮拜五十點，等我下班。」照舊、大一下「……今天我留了一塊蛋糕。」、大二上「禮拜五十點。最後一個客人走了，我傳給你。」）',ok.every((x,i)=>x[4]===['禮拜五十點，等我下班。','禮拜五十點，等我下班。……今天我留了一塊蛋糕。','禮拜五十點。最後一個客人走了，我傳給你。'][i]&&x[5]===22),J(ok));
    const Fr=TERMEND_LINES.FRIEND.heroine_02;
    check('補充. 朋友的邀約：大一上「這禮拜五我十點下班。要不要吃宵夜？」；大一上～大二上「下班以後」都是 22:00',Fr.y1s1==='這禮拜五我十點下班。要不要吃宵夜？'&&['Y1S1','Y1S2','Y2S1'].every(t=>Fr.hByTerm&&Fr.hByTerm[t]===22),J([Fr.y1s1,Fr.hByTerm]));
    const H3=TERMEND.heart('heroine_02','Y3S2');
    check('補充. 大三下回來以後（當時給 AA 的問題，AA_377 第 8 項答了：她只排週三、四）：「這禮拜四我十點下班。……」',H3.invite==='這禮拜四我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。'&&H3.wd===4&&H3.h===22,H3.invite); }
  { fresh('2025-12-18',21,'dorm'); const w=TERMEND.windowOf('Y1S1'); R('heroine_02','FAM'); const ok=TERMEND.planDinner(G,w,'heroine_02','friend'); const q=OUT.get(G,'te_Y1S1');
    check('補充. 大一上和芷若的期末飯排在 22:00（她下班以後）',!!ok&&!!q&&q.h===22,J(q&&[q.h,K(q.day)])); }
  { const reNS=(r,d)=>typeof VAC.reNS==='function'?VAC.reNS(r,d):null, Rz=VAC_DATA.TRIP_MSG.reunion.heroine_02, a=reNS(Rz,D('2026-08-26')), b=reNS(Rz,D('2027-01-11')), c=reNS(Rz,D('2027-07-28'));
    check('補充. 重逢在 6/4 以前（她還在上班）：「明天我十點下班。」「……你來的話，我晚一點關燈。」22:00（2026-08-26、2027-01-11）',!!a&&!!b&&J(a.invite)===J(['明天我十點下班。','……你來的話，我晚一點關燈。'])&&a.h===22&&b.h===22,J([a,b]));
    check('補充. 對照：6/4～9/2 照 AA_369 第 8 節（「回來了喔？明天下午我在 Café。……這次是當客人。來嗎？」15:00）',!!c&&J(c.invite)===J(['回來了喔？明天下午我在 Café。……這次是當客人。來嗎？'])&&c.h===15,J(c)); }
  { const L=((MSG2_POOL.people.heroine_02||{}).replies||[]).find(e=>e.topic==='bday'&&e.tier==='L'&&e.ask), o=L&&L.ask.opts.find(x=>x.t==='在。');
    check('補充. 芷若生日（9/28，只在 2025、2026 開）L 的回問「下班以後，你在嗎。」→「在。」：「十點，店門口。」（msg2_pool.js 由 tools/msg/build_msg2.py 產生）',!!o&&J(o.r)===J(['十點，店門口。']),J(o)); }
  // ===== 第 2 項：錄取那一場 =====
  { const e=ev('ev_zhiruo_admitted'), ok=k=>{ const [key,h]=k; fresh(key,h,'cafe'); R('heroine_02','FAM'); return !!e.prereq.custom(G); };
    check('2. 錄取（BB 測試）：5/12、6/2、6/3 20:00 進 Café 可以第一次聽到；6/3 21:30、6/4、7/1 不會',ok(['2027-05-12',15])&&ok(['2027-06-02',15])&&ok(['2027-06-03',20])&&!ok(['2027-06-03',21.5])&&!ok(['2027-06-04',15])&&!ok(['2027-07-01',15]));
    fresh('2027-06-02',15,'cafe'); R('heroine_02','FAM'); G.events.done.ev_zhiruo_last_shift=1; check('2. Z9（最後一個班）演過以後就不會再第一次聽到',!e.prereq.custom(G));
    const T=evTexts(e); check('2. 「四個月」→「五個多月」：沒有「四個月」；「九月我就走了。五個多月。」「「五個多月很快。」」「五個多月欸。……」',!T.some(t=>/四個月/.test(t))&&T.includes('九月我就走了。五個多月。')&&T.includes('「五個多月很快。」')&&T.includes('五個多月欸。……好啦，你這樣講我比較安心。'),J(T.filter(t=>/個月/.test(t))));
    fresh('2027-05-14',15,'cafe'); R('heroine_02','FRI'); dateWith('heroine_02'); const L=await play('ev_zhiruo_admitted',[0]);
    check('2. 交往中的那一版播得到「九月我就走了。五個多月。」',L.includes('九月我就走了。五個多月。'),J(L)); }
  // ===== 第 3 項：子晴爸爸那則 =====
  { fresh('2027-05-09',21.5,'dorm'); R('heroine_04','FAM'); const a=STORY.neededPick(G,D('2027-05-09')).map(e=>e.id), b=STORY.neededPick(G,D('2027-05-16')).map(e=>e.id);
    check('3. 子晴「我爸下週要來台北」：5/9（第 11 週）不發、5/16（第 12 週）發（BB 測試）',!a.includes('zq_dad')&&b.includes('zq_dad'),J([a,b]));
    const e=NEEDED_MSGS.list.find(x=>x.id==='zq_dad'); check('3. 週次 [12,12]',J(e.w)===J([12,12]),J(e.w)); }
  // ===== 第 4 項：阿哲外澳 =====
  { fresh('2027-05-29',15,'dorm'); const a=sched('zhe'); to('2027-06-05',15); const b=sched('zhe'); const row=ENCOUNTERS.rows.find(r=>r.who==='zhe'&&r.spot==='D25');
    check('4. 阿哲外澳大二下避開 5/29（系籃比賽），在 6/5（第 15 週）；偶遇那一列一樣',!(a&&a.away==='和系籃在外澳')&&!!b&&b.away==='和系籃在外澳'&&!!row&&J(row.termWeeks&&row.termWeeks.Y2S2)===J([15]),J([a&&a.away,b&&b.away,row&&row.termWeeks]));
    fresh('2028-05-27',15,'dorm'); const c=sched('zhe'); check('4. 對照：大三下第 14 週（5/27）照舊在外澳',!!c&&c.away==='和系籃在外澳',J(c&&c.away)); }
  // ===== 第 5 項：春假一台車 =====
  { const SD=GROUP.springDays(); fresh(SD.trip,8,'dorm',{SPRING_Y2:'noodle'}); PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','heroine_01','heroine_03','classmate_bohan','classmate_xinci']) R(id,'FAM'); R('heroine_03','FRI'); R('classmate_bohan','FRI');
    const e=ev('ev_spring_y2_noodle'); if(e&&e.beforeOuting) e.beforeOuting(G,GM,{}); const car=G.flags.SPRING_Y2_CAR; const L=await play('ev_spring_y2_noodle',[0]);
    check('5. 4/4 春假出遊：車上最多三個人（照熟悉度；BB 測試）',Array.isArray(car)&&car.length===3&&car.includes('heroine_03')&&car.includes('classmate_bohan'),J(car));
    check('5. 認識的超過三個：「（車子坐不下。剩下的人搭火車，下午在那邊會合。）」接在開車那句後面',L[0]==='（你回家把車開出來。後座擠了三個人。）'&&L[1]==='（車子坐不下。剩下的人搭火車，下午在那邊會合。）',J(L.slice(0,2)));
    const mk=L.slice(0,L.indexOf('（第二站是海邊。四月的風還有點冷。）'));
    check('5. 市場（早上）只有車上的人說話：語彤在、以安不在（搭火車）；會合以後海邊照樣有 Alison、芯慈的句子；回程「後座三個人都睡著了」照留',mk.includes('這個市場，我田野課看過資料。……想自己來看一次。')&&!mk.includes('第一站選得很有理由。')&&L.includes('我說要去海邊，真的來了。')&&L.includes('我們拍一張。……阿哲你站後面，你太高。')&&L[L.length-1]==='（回程，後座三個人都睡著了。你一個人開到臺北，收音機開得很小聲。）',J(L));
    fresh(SD.trip,8,'dorm',{SPRING_Y2:'noodle'}); PHONE.join(G,'noodle_team','麵店團'); R('zhe','FAM'); R('heroine_03','FAM'); const L2=await play('ev_spring_y2_noodle',[0]);
    check('5. 對照：只認識兩個＝沒有搭火車那一句',!L2.includes('（車子坐不下。剩下的人搭火車，下午在那邊會合。）'),J(L2.slice(0,3))); }
  // ===== 第 6 項：期末邀約從最後一科考完的隔天 =====
  { fresh('2027-06-10',9,'dorm'); const w=TERMEND.windowOf('Y2S2'), ex=CLS.examList(G,'Y2S2').filter(x=>x.kind==='final'), last=Math.max(...ex.map(x=>x.day));
    check('6. 大二下期末最後一科：6/11（五）上午行政救濟補考（端午 6/9 停課）',K(last)==='2027-06-11',J(ex.map(x=>K(x.day)+' '+x.c.id)));
    check('6. 期末邀約從最後一科考完的隔天：6/12 起（原本 6/10）',typeof TERMEND.examStart==='function'&&TERMEND.examStart(G,w)===D('2027-06-12'),String(TERMEND.examStart&&K(TERMEND.examStart(G,w))));
    R('zhe','FAM'); G.termend={think:{},contact:{Y2S2:{zhe:{pts:9,k:{}}}}};
    to('2027-06-10',20.9); TERMEND.phone(GM); PHONE.tick(G); const s1=PHONE.sent(G,'te_Y2S2_zhe'); to('2027-06-11',20.9); TERMEND.phone(GM); PHONE.tick(G); const s2=PHONE.sent(G,'te_Y2S2_zhe');
    to('2027-06-12',20.9); TERMEND.phone(GM); PHONE.tick(G); const s3=PHONE.sent(G,'te_Y2S2_zhe');
    check('6. 阿哲的期末飯邀約 6/10、6/11 晚上不傳，6/12 20:30 傳',!s1&&!s2&&s3,J([s1,s2,s3,TERMEND.rec(G,'Y2S2').plan&&K(TERMEND.rec(G,'Y2S2').plan.back)]));
    fresh('2026-06-11',9,'dorm'); const w1=TERMEND.windowOf('Y1S2'), es=typeof TERMEND.examStart==='function'?TERMEND.examStart(G,w1):w1.from;   /* 修改前沒有 examStart＝本來就從時段第一天（對照）*/
    check('6. 對照：大一下最後一科 6/11 上午、時段 6/11 開始＝照時段第一天（當天 20:30）',es===w1.from,K(es)); }
  // ===== 第 7 項：語彤 Y4-L7 =====
  { const s=lad('Y2S2','heroine_03','Y4-L7');
    const said7=J([s&&s.lines,s&&s.choices]);
    check('7. 語彤 Y4-L7（大二下）：「下學期系上可能會找我做一點事。……還沒確定，確定再跟你講。」；助教、「她說每週要改二十份作業」拿掉',!!s&&J(s.lines)===J(['下學期系上可能會找我做一點事。……還沒確定，確定再跟你講。'])&&!said7.includes('助教')&&!said7.includes('二十份'),said7);
    const ta=fs.readFileSync(path.join(ROOT,'src/data/y2b_events.js'),'utf8');
    check('7. 對照：大三上 1B-08「系上老師叫我當助教。質性研究方法。」「他說我訪談的時候……」照現在（老師「他」）',ta.includes("text:'系上老師叫我當助教。質性研究方法。'")&&ta.includes("text:'他說我訪談的時候，受訪者會多講十分鐘。……我不知道那是什麼意思。'")); }
  { const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, a=allow.filter(e=>/AA_375_/.test(e.path)), b=allow.filter(e=>/AA_342_/.test(e.path));
    check('7、11、12. 階梯疊在 ladder_*_y2s2.json 上：白名單 AA_375@45121a97（一個版本、approved），ladder.js 的來源寫了',a.length===1&&a[0].sha==='45121a97'&&a[0].status==='approved'&&/AA_375@45121a97/.test(LADDER.source||''),J(a.map(e=>e.sha)));
    check('第 4 節. AA_342 第 2-2 節的七則照抄：白名單 AA_342（一個版本、approved）',b.length===1&&b[0].status==='approved',J(b.map(e=>e.sha))); }
  // ===== 第 8 項：考完試走出教室 =====
  { const e=ev('ev_midterm_walkout_y2s2'); fresh('2027-04-15',12.5,'linze'); const mids=CLS.examList(G,'Y2S2').filter(x=>x.kind==='mid'); const lastMid=mids.reduce((a,b)=>b.day>a.day?b:a);
    check('8. 考完試走出教室移到最後一科考完（大二下期中的最後一科＝4/15 法學英文）',!!e&&e.afterClass===lastMid.c.id&&e.afterExam==='mid'&&K(lastMid.day)==='2027-04-15',J([e&&e.afterClass,lastMid.c.id,K(lastMid.day)]));
    const T=evTexts(e); check('8. Alison「債各的第二題，我寫了『買賣不破租賃』。……題目問的是租賃。」（贈與第 14 週才教）',T.includes('債各的第二題，我寫了『買賣不破租賃』。……題目問的是租賃。')&&!T.includes('債各的第二題，我寫了『買賣不破租賃』。……題目問的是贈與。'),J(T)); }
  // ===== 第 9 項 =====
  { const ta=fs.readFileSync(path.join(ROOT,'src/data/y2b_events.js'),'utf8');
    check('9. 語彤轉述：「上次我陪阿姨去法服。」（原本「禮拜六我陪阿姨去法服。」）',ta.includes("text:'上次我陪阿姨去法服。'")&&!ta.includes("text:'禮拜六我陪阿姨去法服。'")); }
  // ===== 第 10 項：明軒說明會 3/15 21:00 =====
  { fresh('2027-03-14',21.2,'dorm'); R('classmate_mingxuan','FAM'); STORY.neededRules(GM); PHONE.tick(G); const N=G.needed, b14=(N.batches||[]).find(b=>b.d===D('2027-03-14'));
    check('10. 3/14（日）21:00 那一組沒有明軒說明會那則',!(b14&&b14.ids.some(x=>x[0]==='mx_seat'))&&!(N.shown&&N.shown.mx_seat!=null),J(b14&&b14.ids));
    to('2027-03-15',20.9); STORY.neededRules(GM); PHONE.tick(G); const s0=N.shown.mx_seat; to('2027-03-15',21.05); STORY.neededRules(GM); PHONE.tick(G);
    const m=TH('p:classmate_mingxuan'); check('10. 3/15（一）21:00 發（學校信 3/15 09:00 才公告）：「交換說明會週四中午 ……」，回得了',s0==null&&N.shown.mx_seat===D('2027-03-15')&&m.length>0&&/交換說明會週四中午/.test(m[0].text)&&!!m[m.length-1].ask,J(m.map(x=>x.text))); }
  // ===== 第 11 項：可昕 K4-L2 =====
  { const s=lad('Y2S2','kexin','K4-L2'); check('11. 可昕 K4-L2 週次第 5 週起 [5,16]',!!s&&J(s.week)===J([5,16]),J(s&&s.week));
    fresh('2027-03-23',21,'dorm'); dateWith('kexin'); const H=STORY.LADDER_HOLD['K4-L2'], SK=STORY.LADDER_SKIP['K4-L2'];
    const a=[!!H&&H(G),!!SK&&SK(G)]; G.flags.KX_CIRCLES_GO=true; const b=[H&&H(G),SK&&SK(G)]; to('2027-03-27',12); const c=[H&&H(G),SK&&SK(G)]; G.events.done.ev_kexin_two_circles=1; const d=[H&&H(G),SK&&SK(G)];
    fresh('2027-03-23',21,'dorm'); dateWith('kexin'); G.flags.KX_CIRCLES_GO=false; const e=[H&&H(G),SK&&SK(G)];
    check('11. 只給 3/25 那場去了的玩家：還沒回＝先不說；答應＝說；3/25 過了沒去＝跳過；去了＝說；回了「那天不行」＝跳過',!!H&&!!SK&&J(a)===J([false,false])&&J(b)===J([true,false])&&c[1]===true&&J(d)===J([true,false])&&e[1]===true,J([a,b,c,d,e])); }
  // ===== 第 12 項：芷若 Z4-L4 =====
  { const s=lad('Y2S2','heroine_02','Z4-L4'); check('12. 芷若 Z4-L4 第 11 週以後跳過（同子晴 Q4-L4：週次 [3,11]、skipAfterWeek 11）',!!s&&J(s.week)===J([3,11])&&s.skipAfterWeek===11,J(s&&[s.week,s.skipAfterWeek])); }
  // ===== 第 13 項：子晴說演唱會 =====
  { const e=ev('ev_zhiruo_concert'), ok=k=>{ fresh(k,19.5,'wancai'); R('heroine_04','FAM'); R('heroine_02','FAM'); return !!e.prereq.custom(G)&&e.weekday.includes(G.weekday)&&(!e.weeks||e.weeks.includes(CALENDAR.termOf(G.day).week)); };
    check('13. 子晴說演唱會改 5/17（一）以後：5/12 不會；5/17、5/19 會',!ok('2027-05-12')&&ok('2027-05-17')&&ok('2027-05-19'));
    fresh('2027-05-15',20,'dorm'); const s=sched('heroine_02'); check('13. 演唱會是 5/15（六）晚上：那晚芷若不在西門町',!!s&&s.zone==null&&s.away!=='在西門町看電影',J(s&&s.away)); }
  // ===== 第 14 項：春假出遊那天，去的人作息停掉 =====
  { const SD=GROUP.springDays(); fresh(SD.trip,11,'dorm',{SPRING_Y2:'noodle'}); R('classmate_bohan','FAM'); R('heroine_01','FAM'); const a=sched('classmate_bohan'), b=sched('heroine_01');
    check('14. 4/4 跟麵店團出去：柏翰不「在北投讀書」、以安不「在美術館」',!!a&&a.away!=='在北投讀書'&&!!b&&b.away!=='在美術館',J([a&&a.away,b&&b.away]));
    fresh(SD.trip,11,'dorm'); R('classmate_bohan','FAM'); R('heroine_01','FAM'); const c=sched('classmate_bohan'), d=sched('heroine_01');
    check('14. 對照：沒有這一趟（沒收到麵店團的邀約）照原本的作息',!!c&&c.away==='在北投讀書'&&!!d&&d.away==='在美術館',J([c&&c.away,d&&d.away])); }
  // ===== 第 15 項：可昕見麵店團 =====
  { fresh('2027-03-25',18,'noodle'); dateWith('kexin'); for(const id of ['zhe','yu','classmate_bohan','heroine_01']) R(id,'FAM'); const L=await play('ev_kexin_two_circles',[0,0]);
    const i=L.indexOf('我們八點讀書會。……很高興認識妳。'), j=L.indexOf('（拉著柏翰站起來）可昕下次見！');
    check('15. 以安「我們八點讀書會。……很高興認識妳。」接 Alison「（拉著柏翰站起來）可昕下次見！」',i>=0&&j===i+1&&!L.includes('我八點讀書會。……很高興認識妳。'),J(L.slice(-6)));
    check('15. 20:30 群組「麵店分店」不算 Alison、柏翰',J(G.flags.NOODLE_BRANCH_MEMBERS)===J(['kexin','yule','zhe']),J(G.flags.NOODLE_BRANCH_MEMBERS)); }
  // ===== 第 16 項：語彤第 8～9 週 =====
  { fresh('2027-04-13',18,'dorm'); const a=sched('heroine_03'); to('2027-04-20',18); const b=sched('heroine_03'); to('2027-03-30',18); const c=sched('heroine_03');
    check('16. 大二下第 8～9 週語彤不排麵店（4/13、4/20 週二 18:00）；對照第 6 週（3/30）在麵店',!!a&&a.zone!=='noodle'&&!!b&&b.zone!=='noodle'&&!!c&&c.zone==='noodle',J([a&&a.zone,b&&b.zone,c&&c.zone])); }
  // ===== 第 17 項：以安「上次那份公文」=====
  { fresh('2027-04-27',18,'noodle'); R('heroine_01','FAM'); STORY.neededRec(G).shown.an_admin=D('2026-12-06'); const L=await play('ev_an_mother_map',[0]);
    check('17. an_admin 發過（聽過）：「上次那份公文，你還記得嗎？我後來陪他們寫了申覆。」，不再當新消息講',L.includes('上次那份公文，你還記得嗎？我後來陪他們寫了申覆。')&&!L.includes('我家教的學生，家裡申請的補助被駁回了。我在幫他們看那份公文。'),J(L.slice(0,2)));
    fresh('2027-04-27',18,'noodle'); R('heroine_01','FAM'); const L2=await play('ev_an_mother_map',[0]);
    check('17. 對照：沒聽過＝原本那句',L2[0]==='我家教的學生，家裡申請的補助被駁回了。我在幫他們看那份公文。',J(L2.slice(0,2))); }
  // ===== 第 18 項 =====
  { const it=STORY.DAILY_PHONE.find(x=>x.id==='y2_kx_landlord'); fresh('2027-03-20',21,'dorm'); const m=it?it.items(G):[];
    check('18. 可昕房東小訊息「我們債各老師講了一個房東的例子，講了一整節。你們講過了嗎？」',!!m.length&&m[0].text==='我們債各老師講了一個房東的例子，講了一整節。你們講過了嗎？',J(m.map(x=>x.text))); }
  // ===== 第 19 項：語彤的債各 =====
  { fresh('2027-03-08',10,'dorm'); const a=sched('heroine_03'); to('2026-10-05',10); const b=sched('heroine_03');   /* 3/1 是和平紀念日的補假（停課），用第 3 週 3/8 */
    check('19. 語彤雙主修的法律課：大二下週一上午債各在霖澤館 201',!!a&&a.zone==='classroom'&&a.act==='class',J(a&&[a.zone,a.act]));
    check('19. 對照：大二上週一上午照舊在總圖',!!b&&b.zone==='library',J(b&&b.zone)); }
  // ===== 第 20 項 =====
  { const L=SMALLTALK.prof_xu||[], e=L.find(x=>typeof x==='object'&&x.t==='「行政法大二再說。先把民總讀好。」');
    check('20. 許教授「行政法大二再說。先把民總讀好。」只在大一',!!e&&J(e.term)===J(['Y1S1','Y1S2']),J(e)); }
  // ===== 第 21 項：語彤事件 11 補演和期末飯互斥 =====
  { fresh('2027-06-16',12,'dorm'); const b0=Y2R2.yt11bDay?Y2R2.yt11bDay(G):null;
    OUT.plan(G,{id:'te_Y2S2',ev:'ev_termend_dinner',day:D('2027-06-17'),h:19,late:0.25,place:'阿鳳麵店',title:'學期末的飯：語彤',travel:'',travelH:0.25,te:{term:'Y2S2',who:'heroine_03',kind:'friend'}});
    const b1=Y2R2.yt11bDay?Y2R2.yt11bDay(G):null; const e=ev('ev_yt_help_dishes'); fresh('2027-06-17',18,'noodle',{YT_HELP_OFFERED:true,YT_EV11:'left'}); R('heroine_03','FAM');
    OUT.plan(G,{id:'te_Y2S2',ev:'ev_termend_dinner',day:D('2027-06-17'),h:19,late:0.25,place:'阿鳳麵店',title:'學期末的飯：語彤',travel:'',travelH:0.25,te:{term:'Y2S2',who:'heroine_03',kind:'friend'}});
    const c17=e.prereq.custom(G); to('2027-06-18',18); const c18=e.prereq.custom(G);
    check('21. 排了語彤期末飯（6/17 週四）的那天，事件 11 補演改隔天 6/18；沒排＝6/17',b0===D('2027-06-17')&&b1===D('2027-06-18')&&!c17&&c18,J([b0&&K(b0),b1&&K(b1),c17,c18])); }
  // ===== 第 22 項 =====
  { const e=NEEDED_MSGS.list.find(x=>x.id==='zhe_final'); check('22. 阿哲「期末一起讀？」週次 [14,15]（AA_255 第 2 節第 5 點）',!!e&&J(e.w)===J([14,15]),J(e&&e.w)); }
  // ===== 第 23 項 =====
  { const T=evTexts(ev('ev_bohan_scores')); check('23. 柏翰的表：「（白板上多了一張表：每個人上週讀了幾頁。）」',T.includes('（白板上多了一張表：每個人上週讀了幾頁。）')&&!T.some(t=>/小考的分數/.test(t)),J(T[0]));
    fresh(STORY.termDay('Y2S2',2,4),20.5,'dorm',{STUDYGROUP_LEADER:true}); PHONE.join(G,'law_class','法律系一年級'); run(20.9,21.2); const m=txt('g:law_class');
    check('23. 祐廷接的版本：柏翰在全班群組貼「（照片：白板上每個人上週讀的頁數）」',m.includes('（照片：白板上每個人上週讀的頁數）')&&!m.some(t=>/分數分布圖/.test(t)),J(m)); }
  // ===== 第 4 節：AA_342 第 2-2 節（大二下的七則補稿）=====
  { const a=ev('ev_y2s2_thu_noodle_first'), b=ev('ev_y2s2_thu_noodle_spring');
    const okIn=(e,k,h)=>{ fresh(k,h,'noodle'); PHONE.join(G,'noodle_team','麵店團'); return !!e&&EVENTS.check(e); };
    const nd1=(()=>{ for(let d=D('2027-02-22');d<D('2027-03-15');d++) if(STORY.noodleDay(d)) return CALENDAR.dateOf(d).key; return null; })(), nn1=(()=>{ for(let d=D('2027-02-22');d<D('2027-03-01');d++){ const w=CALENDAR.dateOf(d).wd; if(w>=1&&w<=5&&!STORY.noodleDay(d)) return CALENDAR.dateOf(d).key; } return null; })();   /* AA_542 第 5 節：麵店日每週不固定兩天 */
    check('AA_342. 大二下第一個麵店日（'+nd1+'）：「（大二下第一次在麵店遇到大家。阿姨說，過年胖了的人自己知道。）」；不是麵店日（'+nn1+'）不演',!!a&&J(evTexts(a))===J(['（大二下第一次在麵店遇到大家。阿姨說，過年胖了的人自己知道。）'])&&!!nd1&&okIn(a,nd1,18)&&!!nn1&&!okIn(a,nn1,18));
    check('AA_342. 4/8（四）春假回來第一次週四麵店：「（春假回來以後，第一次在麵店遇到大家。每個人都在講自己這幾天去了哪裡。）」',!!b&&J(evTexts(b))===J(['（春假回來以後，第一次在麵店遇到大家。每個人都在講自己這幾天去了哪裡。）'])&&okIn(b,'2027-04-08',18)&&!okIn(b,'2027-04-15',18));
    fresh('2027-03-06',9,'dorm'); said=[]; const t1=Y2R2.fillTick?Y2R2.fillTick(GM):false; await new Promise(r=>setImmediate(r)); const s1=lines(); said=[]; const t1b=Y2R2.fillTick?Y2R2.fillTick(GM):false;
    fresh('2027-05-20',12,'dorm'); said=[]; Y2R2.fillTick&&Y2R2.fillTick(GM); await new Promise(r=>setImmediate(r)); const s2=lines();
    check('AA_342. 3/6（六）、5/20（四）摘要日的旁白各說一次',t1===true&&J(s1)===J(['（大二下的第二週。你終於記住了這學期的課表：週二要跑法律系館B。）'])&&t1b===false&&J(s2)===J(['（五月。宿舍走廊開始有人在討論暑假要去哪裡。）']),J([t1,s1,t1b,s2]));
    fresh('2027-03-12',20.5,'dorm'); R('classmate_bohan','FAM'); run(20.9,21.2); const bh=TH('p:classmate_bohan');
    check('AA_342. 3/12（五）21:00 柏翰私訊「債各第一章的筆記，我做了表格。」「要的話傳給你。」（要。／我自己整理。）',J(bh.map(m=>m.text))===J(['債各第一章的筆記，我做了表格。','要的話傳給你。'])&&!!bh[1].ask&&J(bh[1].ask.opts.map(o=>o.t))===J(['要。','我自己整理。'])&&bh[1].ask.opts[0].say[0].text==='（照片：一張表格，欄位比內容多）',J(bh.map(m=>m.text)));
    fresh('2027-03-12',20.5,'dorm'); R('classmate_bohan','ACQ'); run(20.9,21.2); check('AA_342. 對照：和柏翰不到 FAMILIAR 不傳',TH('p:classmate_bohan').length===0);
    fresh('2027-04-21',21.5,'dorm'); PHONE.join(G,'noodle_team','麵店團'); R('yu','FAM'); run(21.9,22.2); const g=TH('g:noodle_team').map(m=>m.from+':'+m.text);
    check('AA_342. 4/21（三）22:00 群組：Alison「期中考完了」「我要吃三碗麵」、阿哲「我請一碗」',J(g)===J(['yu:期中考完了','yu:我要吃三碗麵','zhe:我請一碗']),J(g));
    fresh('2027-05-21',21.5,'dorm'); R('kai','FAM'); run(21.9,22.2); const k=TH('p:kai');
    check('AA_342. 5/21（五）22:00 阿凱私訊「暑假你回家還是留宿舍」（還沒想。／回家吧。）',k.length===1&&k[0].text==='暑假你回家還是留宿舍'&&J(k[0].ask.opts.map(o=>[o.t,o.say[0].text]))===J([['還沒想。','我也是。'],['回家吧。','那我一個人吃宵夜']]),J(k.map(m=>m.text))); }
  // ===== 第 4 節：AA_255 =====
  { const T=evTexts(ev('ev_exchange_expo_y2'));
    check('AA_255. 說明會散場三句：柏翰「交換要成績多少？」／以安「簡章第三頁有寫，我等一下傳給你。」／柏翰「好。」（沒有「我查過了。你夠。」）',T.includes('交換要成績多少？')&&T.includes('簡章第三頁有寫，我等一下傳給你。')&&T.includes('好。')&&!T.includes('我查過了。你夠。')&&!T.includes('……我是問妳。'),J(T)); }
  { const z=()=>txt('p:heroine_04'); fresh('2027-06-04',21.5,'dorm'); R('heroine_04','FRI'); INV.addContact(G,'heroine_04'); run(21.9,22.2); const a=z(), am=TH('p:heroine_04');
    check('AA_255. 6/4 22:00 子晴四則（沒看過 Q6）：「我爸上禮拜來過」「搭計程車來 搭計程車回去」「他問我最近在忙什麼 我說寫程式」「……我跟芷若去河堤走了一圈 沒事」',J(a)===J(['我爸上禮拜來過','搭計程車來 搭計程車回去','他問我最近在忙什麼 我說寫程式','……我跟芷若去河堤走了一圈 沒事']),J(a));
    const op=am.length?am[am.length-1].ask:null; check('AA_255. 回覆兩個：「沒事就好。」→「嗯」「……其實有一點事 改天講」／「要不要出來走走？」→「今天不要」「明天宵夜」',!!op&&J(op.opts.map(o=>[o.t,o.say.map(x=>x.text)]))===J([['沒事就好。',['嗯','……其實有一點事 改天講']],['要不要出來走走？',['今天不要','明天宵夜']]]),J(op&&op.opts));
    fresh('2027-06-04',21.5,'dorm'); R('heroine_04','FRI'); INV.addContact(G,'heroine_04'); SOCIAL.remember('heroine_04','PLAYTESTED',''); dateWith('heroine_04'); run(21.9,22.2); const b=z();
    check('AA_255. 看過 Q6＝「他問我遊戲做好了沒」；和子晴交往中最後多「下次他來 你要不要在」',J(b)===J(['我爸上禮拜來過','搭計程車來 搭計程車回去','他問我遊戲做好了沒','……我跟芷若去河堤走了一圈 沒事','下次他來 你要不要在']),J(b)); }
  { const B='這週讀書會在B館，有空可以來。', base=(LADDER.byTerm.Y2S2.heroine_01.greet||{}).base||[], R0=STORY.LADDER_GREET_IF&&STORY.LADDER_GREET_IF[B], ok=w=>{ fresh(STORY.termDay('Y2S2',w,2),12,'campus'); return !R0||!R0.test||R0.test(G); };
    check('AA_255 第 2 節第 5 點. 以安讀書會的招呼避開大二下第 8、9、16 週（base「這週讀書會在B館，有空可以來。」也是）',base.includes(B)&&!!R0&&!ok(8)&&!ok(9)&&!ok(16));
    check('AA_255 第 2 節第 5 點. 對照：第 3、10 週照常',ok(3)&&ok(10)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
