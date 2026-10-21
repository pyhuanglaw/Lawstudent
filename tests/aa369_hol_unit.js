// AA_369（企劃線 4042e078；AA 2026-10-21）法律系大一～大四寒暑假：人在哪、時間矛盾——不需要瀏覽器。任務 AA369-HOL-FIX-1021。
//   H1 以安 2027-08-09～27 在京都：VA10 香港她不去（7/20 群組、8/25、8/27 改柏翰；交往中 8/27 21:00 京都的私訊）
//   H2 2028 白色情人節沒有「我在臺中」「理由欄」　H3 阿哲大三下期末飯「暑假我回高雄，書帶回去讀。」
//   H4 出國活動期間的訊息、回國重逢、回來的招呼排除同行的人（C05 阿凱、T02 方奕廷、T03 子晴＋阿凱、C11／C12 以安（大二）、VA10）
//   H5 放假那幾版看人在哪（①在老家那幾版只在 presence home ②寒假／過年、暑假 ③在臺北用一般版 ④語彤店休）
//   M1 芷若 2027-01-17 起回台中　M2 芷若九月二號　M3 重逢人在老家一律 reunionHome、Café 的班／總圖照片只在臺北、小語那句
//   M4 C03／C11／C12 以安只在她去的那一年、C03 日子照每年的週二四　M5 可昕跨年那句　M6 新年快樂的「過年」標籤
//   L1 方奕廷期末邀約分學期　L2 presence 補（方奕廷 2027、2028 寒假、T02；子晴 T03）　L3 出國訊息池不分目的地　L4 可昕大三下約會分路線
//   L5 柏翰大二下　L6 8/25 摘要日　L7 學姊「再一個禮拜」　L8 方奕廷 2028 生日　L9 沛珊大三起「回台南」　範圍外：法服群組那句、沛珊閒聊那句
// 修改前（開發分支 d6cf6c0f）：上面每一項都會失敗。用法：node tests/aa369_hol_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|NOODLE_CLOSED|Y1FILL_LINES)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/noodle_closed3d.js','src/data/y1fill_events.js',
  'src/story3d.js','src/classes3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), K=d=>CALENDAR.dateOf(d).key;
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>m.text);
/* 排好還沒到的也算（出國期間的訊息出發時一次排好）*/
const allTxt=th=>txt(th).concat(...PHONE.rec(G).q.map(q=>(q.items||[]).filter(x=>x.th===th).map(x=>x.text)));
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const pr=(id,k)=>STORY.presence(id,Object.assign({},G||{flags:{}},{day:D(k),stage:'law'}));
(async()=>{
  // ===== H1 VA10 香港：以安在京都 =====
  { const C=VAC_DATA.VA10, M=C.ask.ms.map(([w,t])=>w+':'+t), S=[].concat(...C.steps.map(s=>s.lines.filter(x=>x.who).map(x=>x.who+':'+x.text)));
    check('H1. 7/20 群組：以安「我那幾天在京都。你們去，拍照給我。」；排行程的兩句是柏翰（「行程我來排？」「……好。我只排第一天。」，沒有「可以。」）；以安沒有排行程的句子',M.includes('heroine_01:我那幾天在京都。你們去，拍照給我。')&&M.includes('classmate_bohan:行程我來排？')&&M.includes('classmate_bohan:……好。我只排第一天。')&&!M.some(t=>/^heroine_01:.*排/.test(t))&&!M.includes('heroine_01:可以。行程我來排？'),J(M));
    check('H1. 8/25、8/27 那兩句改柏翰說；三場沒有以安的句子、沒有交往版',S.includes('classmate_bohan:……下一站等她。我第一天的行程有寫「走散的話在下一站等」。')&&S.includes('classmate_bohan:（看著對岸）……第二天以後都沒排，結果也走完了。')&&!S.some(t=>t.startsWith('heroine_01:'))&&!C.steps.some(s=>s.dating&&s.dating.heroine_01),J(S));
    fresh(D('2027-08-25'),8,'dorm',{dating_heroine_01:true,VA10:'yes'}); R('heroine_01','CLO'); PHONE.join(G,'noodle_team','麵店團'); said=[];
    await VAC.va10Trip(GM); PHONE.tick(G); const A=TH('p:heroine_01').filter(m=>m.tag==='va10_dm_heroine_01');
    check('H1. 和以安交往中：8/27 21:00 她私訊「📷（京都車站的月台）」「明天回去。……香港好玩嗎？」；三場沒有以安',J(A.map(m=>[K(m.day),m.h,m.text]))===J([['2027-08-27',21,'📷（京都車站的月台）'],['2027-08-27',21,'明天回去。……香港好玩嗎？']])&&!said.some(s=>s.who==='沈以安'),J(TH('p:heroine_01').map(m=>[K(m.day),m.h,m.text])));
    fresh(D('2027-08-25'),8,'dorm',{VA10:'yes'}); R('heroine_01','CLO'); PHONE.join(G,'noodle_team','麵店團'); await VAC.va10Trip(GM); PHONE.tick(G);
    check('H1. 沒有交往：沒有那則私訊',!TH('p:heroine_01').some(m=>m.tag==='va10_dm_heroine_01')); }
  // ===== H2 白色情人節、H3 阿哲 =====
  { const src=fs.readFileSync(path.join(ROOT,'src/data/r2y3b_events.js'),'utf8');
    check('H2. 2028 白色情人節（沒送過那一版）：「二月十四號那天，我在讀書。……你也沒說什麼。」「（她拿出一個小紙袋）所以這個不是回禮。……是我自己想送的。」；沒有「我在臺中」「理由欄我寫了」',src.includes("text:'二月十四號那天，我在讀書。……你也沒說什麼。'")&&src.includes("text:'（她拿出一個小紙袋）所以這個不是回禮。……是我自己想送的。'")&&!src.includes('我在臺中，你在臺北')&&!src.includes('理由欄我寫了'));
    check('H3. 大三下期末飯阿哲：「大四了欸。」「暑假我回高雄，書帶回去讀。」',J(TERMEND_LINES.POOL.Y3S2.zhe)===J(['大四了欸。','暑假我回高雄，書帶回去讀。']),J(TERMEND_LINES.POOL.Y3S2.zhe)); }
  // ===== H4 同行的人 =====
  { fresh(D('2026-08-24'),6,'dorm',{}); R('kai','FAM'); R('heroine_03','FAM'); R('yu','FAM'); VAC.signup(G,'C05@Y1','yes'); said=[]; picks=[0,0];
    await VAC.outing(GM,OUT.get(G,'vac_C05@Y1')); PHONE.tick(G);
    const KA=allTxt('p:kai'), Y=allTxt('p:heroine_03');
    check('H4. C05 日本五天（阿凱那一團）：阿凱就在旁邊，沒有「宿舍好安靜」「要不要帶零食回來」；語彤（朋友）照樣「📷（麵店今天的長桌）」',!KA.some(t=>/宿舍好安靜|帶零食/.test(t))&&Y.includes('📷（麵店今天的長桌）'),J([KA,Y]));
    G.day=D('2026-08-30'); G.hour=12; said=[]; const a=await VAC.backGreet(GM,{name:'阿凱',charId:'kai'},'kai'), b=await VAC.backGreet(GM,{name:'小語',charId:'yu'},'yu');
    check('H4. 回來後第一次遇到：一起去的阿凱沒有「回來了。宿舍又變吵了。」；小語照樣「你回來了！伴手禮咧！」',!a&&b&&lines().join('|')==='小語：你回來了！伴手禮咧！',J(lines())); }
  { fresh(D('2028-07-03'),7,'dorm',{dating_heroine_04:true}); R('heroine_04','CLO'); R('kai','FAM'); VAC.signup(G,'T03@Y3','yes'); said=[]; picks=[0,0,0];
    await VAC.outing(GM,OUT.get(G,'vac_T03@Y3')); PHONE.tick(G);
    const Z=allTxt('p:heroine_04'), KA=allTxt('p:kai');
    check('H4. T03 曼谷（子晴＋阿凱）：交往中的子晴不傳出國期間的訊息（「到了沒」「你那邊幾點…」）、阿凱不傳',!Z.some(t=>/^到了沒$|你那邊幾點|回來了喔/.test(t))&&!KA.some(t=>/宿舍好安靜|帶零食/.test(t)),J([Z,KA]));
    run(18,21.5); check('H4. T03 回來：不約子晴重逢（她一起去的）',!TH('p:heroine_04').some(m=>/^vac_re_/.test(m.tag||''))&&!OUT.get(G,'vac_T03@Y3_re_heroine_04'),J(txt('p:heroine_04'))); }
  { fresh(D('2027-08-01'),5,'dorm',{}); R('npc_fangyt','FAM'); VAC.signup(G,'T02@Y2','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_T02@Y2')); PHONE.tick(G);
    check('H4. T02 日本的山（方奕廷那一團）：他不傳「這是什麼？那邊有沒有長一樣的。」',!allTxt('p:npc_fangyt').some(t=>/長一樣/.test(t)),J(allTxt('p:npc_fangyt'))); }
  { fresh(D('2027-08-09'),7,'dorm',{}); R('heroine_01','FAM'); VAC.signup(G,'C12@Y2','yes'); said=[]; picks=[0]; await VAC.outing(GM,OUT.get(G,'vac_C12@Y2')); PHONE.tick(G);
    const A2=allTxt('p:heroine_01');
    fresh(D('2028-08-09'),7,'dorm',{}); R('heroine_01','FAM'); VAC.signup(G,'C12@Y3','yes'); said=[]; picks=[0]; await VAC.outing(GM,OUT.get(G,'vac_C12@Y3')); PHONE.tick(G);
    const A3=allTxt('p:heroine_01');
    check('H4. C12 京都：大二以安一起去＝不傳「那邊的便利商店，真的比較好吃嗎？」；大三她沒去（剛從日本回來）＝照樣傳',!A2.includes('那邊的便利商店，真的比較好吃嗎？')&&A3.includes('那邊的便利商店，真的比較好吃嗎？'),J([A2,A3])); }
  { fresh(D('2027-01-17'),7,'dorm',{dating_heroine_01:true}); R('heroine_01','CLO'); VAC.signup(G,'C11@Y2','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C11@Y2')); PHONE.tick(G);
    const A=allTxt('p:heroine_01'); run(18,21.5);
    check('H4. C11 東京（大二寒假以安也去）：交往中的以安不傳出國期間的訊息、回來不約總圖重逢',!A.some(t=>/到了傳一張照片|今天讀了四十頁|你那邊幾點/.test(t))&&!OUT.get(G,'vac_C11@Y2_re_heroine_01')&&!txt('p:heroine_01').includes('明天下午三點，總圖門口。'),J([A,txt('p:heroine_01')])); }
  // ===== H5 放假那幾版看人在哪 =====
  { const ent=(id,re)=>MSG_POOL.people[id].replies.filter(e=>e.topic==='chat'&&re.test(e.variant||'')&&(!e.tags||!e.tags.length));
    const sit=(id,re,k,msgRe)=>{ fresh(D(k),15,'campus',{}); const L=ent(id,re).filter(e=>!msgRe||msgRe.test(e.msgs.join('／'))); return L.length?L.map(e=>MSG.sitOk(G,id,e.variant,{},e)):['none']; };
    const all=(a,v)=>a.length>0&&a.every(x=>x===v);
    check('H5 ①. 以安「放假在台中」：2027-07-30 在台中＝用；2028-07-15（她在日本）、2027-08-15（京都）、2026-07-15（還在臺北）＝不用',all(sit('heroine_01',/^放假在台中$/,'2027-07-30'),true)&&all(sit('heroine_01',/^放假在台中$/,'2028-07-15'),false)&&all(sit('heroine_01',/^放假在台中$/,'2027-08-15'),false)&&all(sit('heroine_01',/^放假在台中$/,'2026-07-15'),false),
      J(['2027-07-30','2028-07-15','2027-08-15','2026-07-15'].map(k=>sit('heroine_01',/^放假在台中$/,k))));
    check('H5 ①②. 阿凱「過年回宜蘭」：暑假（2027-07-15）不用、過年在宜蘭（2027-02-05）用；「寒假留宿舍」：寒假在臺北（2027-01-20）用、暑假不用、回宜蘭那幾天不用',
      all(sit('kai',/^過年回宜蘭$/,'2027-07-15'),false)&&all(sit('kai',/^過年回宜蘭$/,'2027-02-05'),true)&&all(sit('kai',/^寒假留宿舍/,'2027-01-20'),true)&&all(sit('kai',/^寒假留宿舍/,'2027-07-15'),false)&&all(sit('kai',/^寒假留宿舍/,'2027-02-05'),false));
    check('H5 ②. 明軒「寒假也在家教 多接一個寒假班」：暑假不用、寒假用；「過年回彰化」照 presence（variantNote 8 月中一週：2027-08-18 在彰化＝用；2027-07-15 不用）',
      all(sit('classmate_mingxuan',/^寒假留臺北家教$/,'2027-07-15',/寒假也在家教/),false)&&all(sit('classmate_mingxuan',/^寒假留臺北家教$/,'2027-01-20',/寒假也在家教/),true)&&all(sit('classmate_mingxuan',/^過年回彰化$/,'2027-08-18'),true)&&all(sit('classmate_mingxuan',/^過年回彰化$/,'2027-07-15'),false));
    check('H5. 柏翰「在新竹。週四會上去總圖。」：大一暑假在新竹的平日（2026-07-15 週三）用；週四上來那天（2026-07-16）不用；大二以後（2027-07-15）不用',
      all(sit('classmate_bohan',/^放假在新竹$/,'2026-07-15'),true)&&all(sit('classmate_bohan',/^放假在新竹$/,'2026-07-16'),false)&&all(sit('classmate_bohan',/^放假在新竹$/,'2027-07-15'),false));
    check('H5 ①. 方奕廷「回家了。…」：2028-07 起在嘉義（2028-07-25）不用、寒假在家（2027-01-30）用、暑假在宿舍（2026-07-25）不用',
      all(sit('npc_fangyt',/^放假、在台中$/,'2028-07-25'),false)&&all(sit('npc_fangyt',/^放假、在台中$/,'2027-01-30'),true)&&all(sit('npc_fangyt',/^放假、在台中$/,'2026-07-25'),false));
    check('H5 ①. 芷若「放假、在台中」：8/20 以前在臺北（2027-08-10）不用、回台中（2027-08-25）用',all(sit('heroine_02',/^放假、在台中$/,'2027-08-10'),false)&&all(sit('heroine_02',/^放假、在台中$/,'2027-08-25'),true));
    check('H5 ④. 語彤「店裡。放假人比較少。」：麵店過年店休（2027-02-03）不用、平常的寒假（2027-01-20）用',all(sit('heroine_03',/^放假中$/,'2027-02-03',/店裡/),false)&&all(sit('heroine_03',/^放假中$/,'2027-01-20',/店裡/),true));
    check('H5. 沒有老家 presence 的（小語「放假在板橋」）照舊：放假就用',all(sit('yu',/^放假在板橋$/,'2027-07-15'),true));
    fresh(D('2028-07-15'),15,'campus',{}); R('heroine_01','FAM'); INV.addContact(G,'heroine_01'); const p=MSG.pick(G,'heroine_01','chat');
    check('H5 ③. 以安 2028-07-15（在日本）傳「在幹嘛」：不回「在台中」，用一般版',!!p&&!/台中/.test(p.msgs.join(''))&&!p.variant,J(p&&p.msgs)); }
  // ===== M1、M2 芷若 =====
  { fresh(D('2027-01-10'),12,'campus',{}); const a=pr('heroine_02','2027-01-16'), b=pr('heroine_02','2027-01-17');
    check('M1. 芷若 2027-01-16（C15 放映那天晚上）還在臺北、1/17 起在台中',a.here===true&&b.here===false&&b.kind==='home',J([a,b]));
    check('M1. 大二上期末飯芷若：「放映完隔天，我就回台中了。」',TERMEND_LINES.POOL.Y2S1.heroine_02[0]==='放映完隔天，我就回台中了。',J(TERMEND_LINES.POOL.Y2S1.heroine_02));
    check('M2. 大二下期末飯芷若：「九月二號出發。……行李還沒開始收。」「八月底回台中。店裡的班已經交給學妹了。」；邀約鉤子「九月二號出發。」；一般邀約 Y2S2「考完了嗎？九月我就走了。……出來吃個東西？」',
      J(TERMEND_LINES.POOL.Y2S2.heroine_02)===J(['九月二號出發。……行李還沒開始收。','八月底回台中。店裡的班已經交給學妹了。'])&&TERMEND_LINES.HOOK.Y2S2.heroine_02.say==='九月二號出發。'&&TERMEND_LINES.FRIEND.heroine_02.genByTerm.Y2S2==='考完了嗎？九月我就走了。……出來吃個東西？'); }
  // ===== M3 重逢、Café 的班、總圖的照片、小語那句 =====
  { fresh(D('2027-01-17'),7,'dorm',{dating_heroine_02:true}); R('heroine_02','CLO'); VAC.signup(G,'C11@Y2','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C11@Y2')); PHONE.tick(G);
    const Z=allTxt('p:heroine_02'), CAFE=/下班了。今天放的是|有個客人點了你都點的那杯|Café 打烊後的吧台|店裡很安靜|今天店裡放的歌|我早班/;
    check('M3. 芷若東京那兩週都在台中（1/17 起）：沒有 Café 的班（下班、客人、打烊的吧台、店裡、店裡放的歌、回來那天的早班）；照樣有其他幾則',!Z.some(t=>CAFE.test(t))&&Z.includes('今天看了一部電影，結局我先不講。')&&Z.includes('落地跟我說一聲。'),J(Z));
    run(18,21.5); check('M3. 回國重逢那天她在台中（1/31）：不約臺北的 Café（reunionHome 沒有她的句子＝不傳）',!OUT.get(G,'vac_C11@Y2_re_heroine_02')&&!txt('p:heroine_02').some(t=>/九點下班|晚一點關燈/.test(t)),J(txt('p:heroine_02')));
    fresh(D('2027-01-04'),7,'dorm',{dating_heroine_02:true,VAC_C18W:true}); R('heroine_02','CLO'); VAC.rec(G).reg['C18W@Y2']='yes'; VAC.tripMsgs(G,VAC.inst('C18W','Y2'));
    check('M3. 對照：新加坡寒假團（1/4～1/10）她在臺北＝Café 的那幾則照樣有',allTxt('p:heroine_02').some(t=>CAFE.test(t)),J(allTxt('p:heroine_02'))); }
  { const P=VAC_DATA.TRIP_MSG.gf.heroine_01.pool.map(x=>x.join('／'));
    check('M3. 以安的池子：「小語說你不在，宵夜沒人跟她搶。」（寒暑假沒有讀書會）',P.includes('小語說你不在，宵夜沒人跟她搶。')&&!P.some(t=>/讀書會/.test(t)),J(P));
    fresh(D('2026-07-27'),7,'dorm',{dating_heroine_01:true}); VAC.tripMsgs(G,VAC.inst('C09','Y1')); const A9=allTxt('p:heroine_01');
    fresh(D('2026-07-13'),7,'dorm',{dating_heroine_01:true}); VAC.tripMsgs(G,VAC.inst('C08','Y1')); const A8=allTxt('p:heroine_01');
    check('M3. 總圖的照片：柬埔寨那幾天她回台中（7/25～8/7）＝不傳；首爾那幾天她在臺北＝照樣傳',!A9.includes('📷（總圖三樓靠窗的位子）')&&A9.includes('今天讀了四十頁。你那邊天氣好嗎？')&&A8.includes('📷（總圖三樓靠窗的位子）'),J([A9,A8])); }
  { fresh(D('2027-08-09'),7,'dorm',{dating_heroine_02:true}); R('heroine_02','CLO'); VAC.rec(G).reg['C12@Y2']='done'; G.day=D('2027-08-27'); run(17.9,21.5);
    check('M3. 京都 8/27 回來、芷若 8/21 起在台中：不約 Café',!OUT.get(G,'vac_C12@Y2_re_heroine_02')&&!txt('p:heroine_02').some(t=>/九點下班/.test(t)),J(txt('p:heroine_02'))); }
  // ===== M4 C03／C11／C12 的以安、C03 的日子 =====
  { const days=yk=>VAC.inst('C03',yk).A.keys.map(k=>k.day), wd=(yk,k)=>wdOf(VAC.dayOf(yk,'summer',k));
    check('M4. C03 日子照每年的週二、四：2026 7/7、7/16、7/23；2027 7/8、7/15、7/22；2028 7/11、7/18、7/20',J([days('Y1'),days('Y2'),days('Y3')])===J([['07-07','07-16','07-23'],['07-08','07-15','07-22'],['07-11','07-18','07-20']])&&['Y1','Y2','Y3'].every(yk=>days(yk).every(k=>[2,4].includes(wd(yk,k)))),J([days('Y1'),days('Y2'),days('Y3')]));
    fresh(D('2028-07-11'),18,'dorm',{}); R('heroine_01','FRI'); VAC.signup(G,'C03@Y3','yes'); const L3=[];
    for(let i=0;i<3;i++){ const q=OUT.get(G,'vac_C03@Y3_'+i); G.day=q.day; G.hour=19; said=[]; opts=[]; await VAC.outing(GM,q); L3.push({said:lines(),opts:opts.length}); }
    check('M4. C03 大三（以安在日本）：第一堂只有「（教室裡都是不認識的人。）」、沒有選項；小考、最後一堂沒有她的句子；上完算參加過',J(L3)===J([{said:['（教室裡都是不認識的人。）'],opts:0},{said:[],opts:0},{said:[],opts:0}])&&VAC.state(G,'C03@Y3')==='done',J(L3));
    { const q=OUT.get(G,'vac_C03@Y3_1'); q.state='planned'; check('M4. 快轉：大三那一場什麼都不演＝不停、記成去過（repSkip 回 \'\'）',VAC.repSkip(G,q)===''); }
    fresh(D('2027-07-08'),18,'dorm',{}); R('heroine_01','FRI'); VAC.signup(G,'C03@Y2','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C03@Y2_0'));
    check('M4. C03 大二（以安還在臺北上課）：照大一的稿（「以安坐在第一排正中間」「你也來了。」）',lines().some(t=>t.includes('以安坐在第一排正中間'))&&lines().includes('沈以安：你也來了。'),J(lines()));
    fresh(D('2028-01-17'),7,'dorm',{}); R('heroine_01','FRI'); VAC.signup(G,'C11@Y3','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C11@Y3'));
    check('M4. C11 大三（以安沒去）：沒有「以安坐在你斜前方」，教室旁白「（教室裡都是不認識的人。）」',!lines().some(t=>/以安/.test(t))&&lines().includes('（教室裡都是不認識的人。）'),J(lines()));
    fresh(D('2027-01-17'),7,'dorm',{}); R('heroine_01','FRI'); VAC.signup(G,'C11@Y2','yes'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C11@Y2'));
    check('M4. C11 大二（以安也去）：照舊「（休息時間，以安坐在你斜前方，回頭用嘴型說：好冷。）」',lines().includes('（休息時間，以安坐在你斜前方，回頭用嘴型說：好冷。）')&&!lines().includes('（教室裡都是不認識的人。）'),J(lines()));
    fresh(D('2028-08-09'),7,'dorm',{}); R('heroine_01','FRI'); VAC.signup(G,'C12@Y3','yes'); said=[]; opts=[]; await VAC.outing(GM,OUT.get(G,'vac_C12@Y3'));
    check('M4. C12 大三（以安剛從日本回來，沒去）：一般的第一堂（十二個人、八個國家），沒有她、沒有選項',lines().some(t=>t.includes('來自八個國家'))&&!lines().some(t=>t.startsWith('沈以安'))&&!opts.length,J(lines())); }
  // ===== M5 可昕跨年 =====
  { const ev=STORY_EVENTS.find(e=>e.id==='ev_nye_river'), T=ev.dialogue.filter(x=>x.speaker==='kexin').map(x=>x.text);
    check('M5. 大一跨年（高雄）可昕：「十分鐘。看完就回去。我媽說十二點半以前要到家。」；沒有「我們都還有考試」',T.includes('十分鐘。看完就回去。我媽說十二點半以前要到家。')&&!T.some(t=>/還有考試/.test(t)),J(T)); }
  // ===== M6 新年快樂的「過年」標籤 =====
  { const ny=(id,k,lv,flags)=>{ fresh(D(k),12,'campus',flags||{}); R(id,lv||'FRI'); const r=MSG.pick2(G,id,'newyear',true); return r&&r.e?r.e.msgs.join('／'):null; };
    const c=[['heroine_03','新年快樂。','（照片：麵店拉下來的鐵門，貼著紅紙）'],['zhe','新年快樂！！','（照片：高雄的年夜飯）／新年快樂哥',{ZHE_CALLS_GE:true}],['classmate_bohan','新年快樂。','新年快樂。新竹風很大。'],['kai','新年快樂','新年快樂／（照片：宜蘭家裡的電腦桌）／我爸也在打電動']];
    const got=c.map(([id,a,b,f])=>[ny(id,'2027-01-01','FRI',f),ny(id,'2027-02-06','FRI',f)]);
    check('M6. 新年快樂（朋友）：1/1 用一般版、初一（2027-02-06）才是麵店的鐵門、高雄的年夜飯、新竹風很大、宜蘭家裡的電腦桌',c.every(([id,a,b],i)=>got[i][0]===a&&got[i][1]===b),J(got));
    const l1=ny('heroine_03','2027-01-01','FRI',{dating_heroine_03:true}), l2=ny('heroine_03','2027-02-06','FRI',{dating_heroine_03:true});
    check('M6. 語彤交往中：1/1 沒有「初四開店。你要第一個來。」，初一才有',!/初四開店/.test(l1||'')&&/初四開店/.test(l2||''),J([l1,l2])); }
  // ===== L1 方奕廷的期末邀約分學期 =====
  { const one=term=>{ const w=TERMEND.windowOf(term); fresh(w.from,20,'dorm',{}); R('npc_fangyt','FAM'); TERMEND.rec(G,term).plan={back:w.from,heart:[],friend:['npc_fangyt'],fallback:null,gf:[],nope:{},kx:false};
      G.hour=20.6; TERMEND.phone(GM); PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='te_'+term+'_npc_fangyt'); return m?[m.text,((m.ask.opts[1].say||[])[0]||{}).text]:null; };
    const a=one('Y2S1'), b=one('Y2S2');
    check('L1. 方奕廷上學期末（1 月）：「考完了嗎？吃個飯，寒假我回嘉義。」／婉拒「好。開學見。」；下學期末（6 月）：「考完了嗎？吃個飯，七月我要上山兩個禮拜。」／「好。山上收不到訊號，下山再找你。」',
      J(a)===J(['考完了嗎？吃個飯，寒假我回嘉義。','好。開學見。'])&&J(b)===J(['考完了嗎？吃個飯，七月我要上山兩個禮拜。','好。山上收不到訊號，下山再找你。']),J([a,b])); }
  // ===== L2 presence 補 =====
  { fresh(D('2027-01-10'),12,'campus',{}); const H=(id,k)=>{ const p=pr(id,k); return p.here?'here':p.kind+':'+(p.home||p.city||p.away||''); };
    const got=[H('npc_fangyt','2027-01-23'),H('npc_fangyt','2027-01-24'),H('npc_fangyt','2027-02-18'),H('npc_fangyt','2027-02-19'),H('npc_fangyt','2028-01-24'),H('npc_fangyt','2028-02-18'),H('npc_fangyt','2028-02-19')];
    check('L2. 方奕廷 2027、2028 寒假 1/24～2/18 在嘉義（前一天、2/19 在臺北）',J(got)===J(['here','home:嘉義','home:嘉義','here','home:嘉義','home:嘉義','here']),J(got));
    const t2=[pr('npc_fangyt','2027-07-31'),pr('npc_fangyt','2027-08-01'),pr('npc_fangyt','2027-08-04'),pr('npc_fangyt','2027-08-05')];
    check('L2. T02 方奕廷 8/1～8/4 在日本（短期出門、手機照常）',t2[0].here===true&&t2[1].kind==='trip'&&t2[1].signal===true&&t2[2].kind==='trip'&&t2[3].here===true,J(t2));
    const t3=[pr('heroine_04','2028-07-02'),pr('heroine_04','2028-07-03'),pr('heroine_04','2028-07-07'),pr('heroine_04','2028-07-08')];
    check('L2. T03 子晴 7/3～7/7 在曼谷（同阿凱）',t3[0].here===true&&t3[1].kind==='trip'&&t3[1].away==='在曼谷'&&t3[2].kind==='trip'&&t3[3].here===true,J(t3)); }
  // ===== L3 出國期間的訊息池不分目的地、星期、季節 =====
  { const M=VAC_DATA.TRIP_MSG.gf, P=id=>[].concat(...M[id].pool.map(x=>typeof x==='function'?x({events:{done:{}}}):x)).concat(M[id].mid), all=[].concat(P('kexin'),P('heroine_01'),P('heroine_04'),P('heroine_05'));
    check('L3. 可昕「我算了一下 你那邊現在幾點」「這個週末記得視訊」「高雄今天出大太陽。你那邊呢」；以安「你那邊幾點？我算了一下，你吃飯了沒？」；子晴「你那邊幾點 我這邊還沒睡」；學姊「我今天在法圖待到閉館。你那邊現在幾點。」',
      P('kexin').includes('我算了一下 你那邊現在幾點')&&P('kexin').includes('這個週末記得視訊')&&P('kexin').includes('高雄今天出大太陽。你那邊呢')&&P('heroine_01').includes('你那邊幾點？我算了一下，你吃飯了沒？')&&P('heroine_04').includes('你那邊幾點 我這邊還沒睡')&&P('heroine_05').includes('我今天在法圖待到閉館。你那邊現在幾點。')&&
      !all.some(t=>/晚上九點|明天週六|三十五度|你應該在吃午餐|我這邊三點|應該是早上/.test(t)),J(all)); }
  // ===== L4 可昕大三下的約會分路線 =====
  { const KX=TERMEND_LINES.KX.Y3S2, tb=r=>{ fresh(D('2028-06-20'),12,'campus',r?{EXCHANGE_ROUTE:r}:{}); return typeof KX.table==='function'?KX.table(G):KX.table; };
    check('L4. 可昕大三下：邀約「暑假的事 當面講」；飯桌台灣「暑假你在臺北，我在高雄。……又是兩個月的視訊。」、美國「八月你就去美國了。……我算過了，我們分開最久就是這次。」',
      J(KX.invite)===J(['河堤 五點半','暑假的事 當面講'])&&J(tb('TW'))===J(['暑假你在臺北，我在高雄。……又是兩個月的視訊。'])&&J(tb(null))===J(tb('TW'))&&J(tb('US'))===J(['八月你就去美國了。……我算過了，我們分開最久就是這次。']),J([KX.invite,tb('TW'),tb('US')])); }
  // ===== L5～L9 =====
  check('L5. 大二下柏翰：「暑假回新竹。八月底上來。」',J(TERMEND_LINES.POOL.Y2S2.classmate_bohan)===J(['成績二十八號出來。','暑假回新竹。八月底上來。']),J(TERMEND_LINES.POOL.Y2S2.classmate_bohan));
  check('L6. 8/25 摘要日：「（暑假剩兩個禮拜。你先把大二上的兩本課本買了。比大一的厚。）」',Y1FILL_LINES.sum0825==='（暑假剩兩個禮拜。你先把大二上的兩本課本買了。比大一的厚。）',Y1FILL_LINES.sum0825);
  { const src=fs.readFileSync(path.join(ROOT,'src/sis_grad3d.js'),'utf8'); check('L7. 學姊筆試前：「再一個禮拜就考試了。我有一點怕。」',src.includes("text:'再一個禮拜就考試了。我有一點怕。'")&&!src.includes("'下禮拜就考試了。我有一點怕。'")); }
  { const bd=route=>{ fresh(D('2028-08-13'),12,'campus',route?{EXCHANGE_ROUTE:route}:{}); R('npc_fangyt','FRI'); const r=MSG.pick2(G,'npc_fangyt','bday',true); return r&&r.e?r.e.msgs.join('／'):null; };
    const us=bd('US'), tw=bd('TW'), jp=bd('JP'), A=bd(null);
    check('L8. 方奕廷 2028 生日（朋友）：美國路線「謝謝。你那邊應該還是昨天。……兩天都算。」；其他路線「謝謝。」',us==='謝謝。你那邊應該還是昨天。……兩天都算。'&&tw==='謝謝。'&&jp==='謝謝。'&&A==='謝謝。',J([us,tw,jp,A])); }
  { const ID='classmate_peishan', why=(k0,k1,flags)=>{ fresh(D(k0),12,'dorm',flags||{}); R(ID,'FRI'); let last=null; for(let d=D(k0);d<=D(k1);d++){ const p=pr(ID,K(d)); if(p.here===false&&p.kind==='home') last=d; }
      if(last==null) return null; G.day=last; G.weekday=wdOf(last); const o=HV.offer(G,ID); return o&&o.why||null; };
    const y3=why('2028-08-15','2028-09-20',{PS_BACK_FIRST:1}), y1=why('2026-08-15','2026-09-20');
    check('L9. 沛珊寒暑假末尾、清單那一項：大三起「她這幾天就要回台南了」；大一照舊「她這幾天就要回臺北了」',y3==='她這幾天就要回台南了'&&y1==='她這幾天就要回臺北了',J([y3,y1])); }
  // ===== 範圍外（第 4 節）=====
  { fresh(D('2026-11-13'),20,'campus',{lawclub:true}); PHONE.join(G,'lawclub_study','法服'); run(20,21.2); const T=TH('g:lawclub_study').map(m=>m.from+':'+m.text);
    check('第 4 節. 法服群組 11/13「明天九點半，攤位集合。」發話的人是法服的幹部（社長），不是語彤；句子不改',T.includes('npc_lawclub_pres:明天九點半，攤位集合。')&&!T.some(t=>t.startsWith('heroine_03:')),J(T));
    const S=(SMALLTALK.classmate_peishan||[]).map(x=>typeof x==='string'?x:x.t);
    check('第 4 節. 沛珊閒聊：「萬才館的研討室，下午都沒人。你可以去那裡讀書。」（法服沒有週三讀書會）',S.includes('「萬才館的研討室，下午都沒人。你可以去那裡讀書。」')&&!S.some(t=>/讀書會週三/.test(t)),J(S)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
