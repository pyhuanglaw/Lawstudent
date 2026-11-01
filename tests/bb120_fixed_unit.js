// BB_120 1-7c「固定的改變」（BB 2026-10-14，第②級）——不需要瀏覽器。修改前（沒有這些手機小事、房間物件、澆水一週）每一節都會失敗：
//   A 子晴照熟度傳的訊息：認識＝吉他社群組（社課前一天 21:00「明天社課…」；22:10 cat_v0.3）、有點熟＝私訊一句拆五則、朋友＝私訊 22:10 cat_v0.9
//     ＋同一晚 22:40 吉他社群組「新版本。測試的人報名。」、好朋友＝「你今天吃飯了嗎。」／期末考那兩週「期末考還好嗎。」；只在那個階段
//   B 沛珊：認識＝讀書會群組 23:10、有點熟＝私訊書頁照片 23:20＋23:21、朋友＝上課日的長訊息、好朋友＝23:05「今天我沒有問題。」23:06「你有的話，我在。」
//   C 方奕廷「有點熟」以前的「學弟好」：九、十月台灣欒樹、十月以後黃金葛（欒樹那則先）、寒流前（大一上第 13～15 週）；有點熟以後不說
//   D 阿凱的泡麵評鑑表：大一同房時是房間物件（朋友的門檻台詞以後第一名填上、多一欄你的名字）；大二起不在房間、改成偶爾傳照片（只在大二以後的學期）
//   E 方奕廷上山的一週：門檻台詞那天記下來 → 下週一第一次待在房間時交給你 → 澆水 → 第 8 天回來（都有澆／忘了一次以上兩種結局）、物件拿掉；
//     沒有記錄是哪一天說的舊存檔不演；清晨、深夜不演
//   F 每天的手機小事照常：沒寫學期的條目只在大一上
// 用法：node tests/bb120_fixed_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const dp=()=>G.msgs.filter(m=>m.tag&&m.tag.startsWith('dp_'));
const D=id=>STORY.DAILY_PHONE.find(d=>d.id===id);
const txt=(id,day)=>D(id).items(G,0).map(x=>x.th+'｜'+x.text+(x.dt?'｜+'+Math.round(x.dt*60)+'分':''));
const hm=x=>{ const m=Math.round((x%24)*60); return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const W5TUE=termDay('Y1S1',5,2), W5WED=termDay('Y1S1',5,3), W6THU=termDay('Y1S1',6,4), W17MON=termDay('Y1S1',16,1), W13MON=termDay('Y1S1',13,1), W12MON=termDay('Y1S1',12,1);
(async()=>{
  check('日曆：大一上第 5 週週二是社課（週一、三）的前一天、第 16 週是期末考（16 週制；變數名照舊）',ACTIVITIES.on(ACTIVITIES.list.find(a=>a.id==='club_guitar'),W5WED)&&CALENDAR.termOf(W17MON).exam==='final',JSON.stringify({W5TUE,W5WED,W17MON}));
  check('每天的手機小事有 BB_120 1-7c 的 12 則（ps_r、ps_c 照 AA_281 第 8 節刪掉；方奕廷寒流前那則是定時的，不在池子裡）',['zq_a1','zq_a2','zq_f1','zq_f2','zq_r1','zq_c1','zq_c2','ps_a','ps_f','fy_tree','fy_pothos','kai_sheet'].every(D)&&!D('fy_cold')&&!D('ps_r')&&!D('ps_c')&&STORY.DAILY_PHONE.length>=21);
  if(!D('zq_a1')){ console.log('FAILED '+fails); process.exit(1); }
  /* ---------- A 子晴 ---------- */
  { fresh(W5TUE,8,'dorm'); PHONE.join(G,'guitar','吉他社'); R('heroine_04',...LV.ACQ);
    check('A 認識：社課前一天 21:00 吉他社群組「明天社課 19:00。萬才館一樓。帶琴。」（多功能教室在萬才館一樓）',D('zq_a1').ok(G,W5TUE)&&D('zq_a1').h(G)===21&&JSON.stringify(txt('zq_a1'))===JSON.stringify(['g:guitar｜明天社課 19:00。B館一樓。帶琴。']),JSON.stringify(txt('zq_a1')));
    check('A 認識：不是社課前一天不傳',!D('zq_a1').ok(G,W5WED));
    check('A 認識：22:10 群組「📎 練習曲_v2.pdf」「新的譜。」（BB_175 D11：貓的遊戲檔名 Q6 以前不出現）',D('zq_a2').ok(G,W5TUE)&&hm(D('zq_a2').h(G))==='22:10'&&JSON.stringify(txt('zq_a2'))===JSON.stringify(['g:guitar｜📎 練習曲_v2.pdf','g:guitar｜新的譜。｜+1分']),JSON.stringify(txt('zq_a2')));
    run(8,24); const L=dp().map(m=>m.th+'｜'+m.text);
    check('A 認識：實際走過一天，21:00 收到群組的社課提醒（一天一則）',JSON.stringify(L)===JSON.stringify(['g:guitar｜明天社課 19:00。B館一樓。帶琴。']),JSON.stringify(L));
    G.contacts.heroine_04=W5TUE-3; check('A 有點熟以前，私訊的幾則都不傳',['zq_f1','zq_f2','zq_r1','zq_c1','zq_c2'].every(id=>!D(id).ok(G,W5TUE)));
    R('heroine_04',...LV.FAM); check('A 有點熟：認識的兩則不再傳（只在那個階段）',!D('zq_a1').ok(G,W5TUE)&&!D('zq_a2').ok(G,W5TUE));
    check('A 有點熟：私訊一句拆好幾則（滷味 21:30、貓卡在牆裡 23:00；BB_175 D12、D13 拿掉「欸不是」）',D('zq_f1').ok(G,W5TUE)&&D('zq_f2').ok(G,W5TUE)&&D('zq_f1').h(G)===21.5&&D('zq_f2').h(G)===23&&txt('zq_f1').join('/')==='p:heroine_04｜滷味/p:heroine_04｜十點後半價/p:heroine_04｜你要來嗎'&&txt('zq_f2').join('/')==='p:heroine_04｜我的貓/p:heroine_04｜卡在牆裡/p:heroine_04｜出不來/p:heroine_04｜……不用回',txt('zq_f1').join('/')+' ＃ '+txt('zq_f2').join('/'));
    delete G.contacts.heroine_04; check('A 有點熟：沒有她的私人聯絡方式就不傳私訊',!D('zq_f1').ok(G,W5TUE)); G.contacts.heroine_04=W5TUE-3;
    G.contacts.heroine_04=W5TUE; check('A 今天才拿到聯絡方式：不和第一則訊息同一天',!D('zq_f1').ok(G,W5TUE)); G.contacts.heroine_04=W5TUE-3;
    R('heroine_04',...LV.FRI);
    check('A 朋友、還沒看過 Q6：22:10 私訊吉他錄音三則、群組不發（BB_175 D14）',D('zq_r1').ok(G,W5TUE)&&hm(D('zq_r1').h(G))==='22:10'&&JSON.stringify(txt('zq_r1'))===JSON.stringify(['p:heroine_04｜你聽過這首嗎','p:heroine_04｜📎（一段吉他錄音）｜+1分','p:heroine_04｜我自己錄的 很爛不要笑｜+2分']),JSON.stringify(txt('zq_r1')));
    G.events.done.ev_ziqing_secret_game=1; check('A 朋友、看過 Q6：22:10 私訊 cat_v0.9「這版貓會爬樓梯。」、22:40 吉他社群組「新版本 要測的人報名」（你先拿到）',JSON.stringify(txt('zq_r1'))===JSON.stringify(['p:heroine_04｜📎 cat_v0.9','p:heroine_04｜這版貓會爬樓梯。｜+1分','g:guitar｜新版本 要測的人報名｜+30分']),JSON.stringify(txt('zq_r1')));
    const g0=G.msgs.length; G.flags.dpPick={id:'zq_r1',day:G.day}; run(22.1,23); const M=G.msgs.slice(g0).map(m=>hm(m.h!=null?m.h:G.hour)+'｜'+m.th+'｜'+m.text);
    check('A 朋友：實際收到的時間（私訊 22:10、群組 22:40）',G.msgs.slice(g0).length===3&&G.msgs.slice(g0)[2].th==='g:guitar',JSON.stringify(G.msgs.slice(g0).map(m=>m.th+'｜'+m.text)));
    R('heroine_04',...LV.CLO);
    check('A 好朋友：「你今天有吃飯嗎」（BB_175 D15：「這是問句」留給 Q11）',D('zq_c1').ok(G,W5TUE)&&txt('zq_c1').join('/')==='p:heroine_04｜你今天有吃飯嗎',txt('zq_c1').join('/'));
    check('A 好朋友：期末考那一週才問（16 週制）「期末考還好嗎」「不用回很長」（BB_175 D16）',!D('zq_c2').ok(G,W5TUE)&&D('zq_c2').ok(G,W17MON)&&txt('zq_c2').map(s=>s.split('｜')[1]).join('/')==='期末考還好嗎/不用回很長');
    PHONE.rec(G).groups={}; check('A 朋友（看過 Q6）：不在吉他社群組，只有私訊那兩則',(R('heroine_04',...LV.FRI),D('zq_r1').items(G,0).length===2)); }
  /* ---------- B 沛珊 ---------- */
  { fresh(W5TUE,8,'dorm'); PHONE.join(G,'public_law','公法讀書會'); R('classmate_peishan',...LV.ACQ);   /* BB_191 §8-7：沛珊的問題改在公法讀書會群組 */
    check('B 認識：公法讀書會群組 23:10「睡前突然想到」…「大家明天再回就好」（BB_175 D17）',D('ps_a').ok(G,W5TUE)&&hm(D('ps_a').h(G))==='23:10'&&JSON.stringify(txt('ps_a'))===JSON.stringify(['g:public_law｜睡前突然想到','g:public_law｜如果有人把東西忘在教室，隔天被別人拿走，這樣算偷嗎？｜+1分','g:public_law｜大家明天再回就好｜+2分']),JSON.stringify(txt('ps_a')));
    const thu=termDay('Y1S1',5,4); fresh(thu,8,'dorm',{dpN:{peishan_handout:1}}); PHONE.join(G,'public_law','公法讀書會'); R('classmate_peishan',...LV.ACQ);   /* 週二是讀書會前一天（先輪到學姊的提醒）；講義照片那則已經傳過 */
    run(8,24); check('B 認識：實際走過一天，23:10 收到（她的問題，問所有人）',dp().map(m=>m.text).join('/')==='睡前突然想到/如果有人把東西忘在教室，隔天被別人拿走，這樣算偷嗎？/大家明天再回就好',dp().map(m=>m.text).join('/'));
    G.contacts.classmate_peishan=W5TUE-3; R('classmate_peishan',...LV.FAM);
    check('B 有點熟：23:20 私訊書頁照片、「這行讓我想到讀書會那題」「你不用回喔」（BB_175 D18）',!D('ps_a').ok(G,W5TUE)&&D('ps_f').ok(G,W5TUE)&&hm(D('ps_f').h(G))==='23:20'&&JSON.stringify(txt('ps_f'))===JSON.stringify(['p:classmate_peishan｜📷（一頁書，劃了一行線）','p:classmate_peishan｜這行讓我想到讀書會那題｜+1分','p:classmate_peishan｜你不用回喔｜+2分']),JSON.stringify(txt('ps_f')));
    R('classmate_peishan',...LV.FRI); const sat=termDay('Y1S1',5,6);
    check('B 朋友、好朋友：她不再主動傳深夜長訊息（ps_r、ps_c 刪掉，AA_281 第 8 節 M5、M6）',!D('ps_r')&&!D('ps_c'));
    R('classmate_peishan',...LV.CLO); }
  /* ---------- C 方奕廷「學弟好」---------- */
  { const oct=(()=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&CALENDAR.dateOf(d).m===10&&CALENDAR.dateOf(d).wd===2) return d; } return null; })(), sep=(()=>{ for(let d=1;d<60;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week>=4&&CALENDAR.dateOf(d).m===9) return d; } return null; })(), nov=termDay('Y1S1',10,2);
    fresh(oct,8,'dorm',{POTHOS:true}); G.contacts.npc_fangyt=oct-5; R('npc_fangyt',...LV.ACQ);
    check('C 九、十月：「學弟好。舟山路的台灣欒樹開花了。」＋學名照片＋「很漂亮。」（20:30）',D('fy_tree').ok(G,oct)&&D('fy_tree').h(G)===20.5&&txt('fy_tree').map(s=>s.split('｜')[1]).join('/')==='學弟好。舟山路的台灣欒樹開花了。/📷 Koelreuteria elegans。秋天先開黃花，再結粉紅色的果。/很漂亮。',txt('fy_tree').join('/'));
    check('C 十月：欒樹那則還沒傳，黃金葛那則先不傳；傳過以後才傳',CALENDAR.dateOf(oct).m===10&&!D('fy_pothos').ok(G,oct)&&(G.flags.dpN={fy_tree:1},D('fy_pothos').ok(G,oct)),'第 '+oct+' 天＝'+CALENDAR.dateOf(oct).m+' 月');
    G.flags.dpN={}; check('C 十一月：黃金葛「學弟好。你的黃金葛葉子，最近有沒有變黃？」…「拍給我看。」；欒樹不傳了',CALENDAR.dateOf(nov).m===11&&D('fy_pothos').ok(G,nov)&&!D('fy_tree').ok(G,nov)&&txt('fy_pothos').map(s=>s.split('｜')[1]).join('/')==='學弟好。你的黃金葛葉子，最近有沒有變黃？/變黃通常是水澆太多，它比較挑，不一定是你的問題。/拍給我看。','第 '+nov+' 天＝'+CALENDAR.dateOf(nov).m+' 月');
    { const cold=STORY.firstColdDay(), F0=Object.assign({},G.flags,{POTHOS:true}), C0=Object.assign({},G.contacts); fresh(cold-1,8,'dorm',F0); G.contacts=C0; R('npc_fangyt',...LV.ACQ); run(8,21); const M=G.msgs.filter(m=>m.tag==='fy_cold'||(m.th==='p:npc_fangyt'&&/寒流|怕冷/.test(m.text)));
      check('C 寒流前（BB 2fdef19）：第一波寒流（大一上第 15 週週一）的前一晚 20:30「學弟好。明天寒流。黃金葛不要放窗邊。」「它怕冷。我也是。」',cold===termDay('Y1S1',15,1)&&M.map(m=>m.text).join('/')==='學弟好。明天寒流。黃金葛不要放窗邊。/它怕冷。我也是。'&&CALENDAR.dateOf(cold-1).wd===7,JSON.stringify(M.map(m=>m.text)));
      fresh(cold-1,8,'dorm',F0); G.contacts=C0; R('npc_fangyt',...LV.FAM); run(8,21); check('C 寒流前：有點熟以後不說「學弟好」，不傳',!G.msgs.some(m=>/寒流/.test(m.text||'')));
      fresh(oct,8,'dorm',{POTHOS:true}); G.contacts.npc_fangyt=oct-5; R('npc_fangyt',...LV.ACQ); }
    if(sep) check('C 九月：只有欒樹那則',D('fy_tree').ok(G,sep)&&!D('fy_pothos').ok(G,sep),'第 '+sep+' 天');
    R('npc_fangyt',...LV.FAM); check('C 有點熟以後不說「學弟好」：兩則都不傳',!D('fy_tree').ok(G,oct)&&!D('fy_pothos').ok(G,nov));
    R('npc_fangyt',...LV.ACQ); delete G.contacts.npc_fangyt; check('C 沒有他的聯絡方式（沒收到黃金葛）不傳',!D('fy_tree').ok(G,oct)); }
  /* ---------- D 阿凱的泡麵評鑑表 ---------- */
  { fresh(W5TUE,20,'dorm'); R('kai',...LV.FAM); const L=STORY.roomItemList(G), it=L.find(r=>r[0]==='阿凱的泡麵評鑑表');
    check('D 大一同房：房間物件「阿凱的泡麵評鑑表」（認識、有點熟：第一名不能說）',!!it&&JSON.stringify(it[1])===JSON.stringify(['「第一名：不能說（怕被搶）」「紅燒牛肉 8.5」「蔥燒排骨 8」「麻辣 7.5（太辣扣分）」「海鮮 6（有一隻蝦）」']),JSON.stringify(it));
    said=[]; picks=[L.indexOf(it),L.length]; await STORY._v1.roomItems(GM); check('D 點了看內容（旁白一句）',said.length===1&&said[0].who===null&&/^「第一名：不能說/.test(said[0].t),JSON.stringify(said));
    SOCIAL.markUp('kai',3); const it2=STORY.roomItemList(G).find(r=>r[0]==='阿凱的泡麵評鑑表');
    check('D 朋友的門檻台詞（F-K2）那天起：第一名「沙茶 9.5」、多一欄你的名字、「不準的話自己改」',JSON.stringify(it2[1])===JSON.stringify(['「第一名：沙茶 9.5」「紅燒牛肉 8.5」「蔥燒排骨 8」「麻辣 7.5（太辣扣分）」「海鮮 6（有一隻蝦）」','（多了一欄「{name}」，裡面是他替你填的分數。最下面一行：「不準的話自己改」）']),JSON.stringify(it2));
    said=[]; picks=[5,6,6]; await STORY._v1.roomItems(GM); const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
    check('D 你的名字：roomItems 原樣交給 GM.say，遊戲的 say 會把 {name} 換成玩家的名字',said[1]&&said[1].t.indexOf('「{name}」')>=0&&/function subst\(t\)\{ return t\.replace\(\/\\\{name\\\}\/g,G\.name\); \}/.test(g3)&&/D\.full=subst\(text\)/.test(g3));
    const y2=termDay('Y2S1',5,2); G.day=y2; check('D 大二起分開住：房間裡沒有評鑑表',!!y2&&!STORY.roomItemList(G).some(r=>r[0]==='阿凱的泡麵評鑑表'),'第 '+y2+' 天');
    check('D 大二起：手機小事「表更新了」＋照片（只在大二以後的學期、四次、至少隔四週）',D('kai_sheet').term(CALENDAR.termOf(y2))&&!D('kai_sheet').term(CALENDAR.termOf(W5TUE))&&D('kai_sheet').max()===4&&D('kai_sheet').gap===28&&txt('kai_sheet').map(s=>s.split('｜')[1]).join('/')==='表更新了/📷（泡麵評鑑表）');
    fresh(y2,8,'campus'); R('kai',...LV.FAM); run(8,24); check('D 大二上第 5 週：實際走過一天，收到阿凱的照片（其他條目只在大一上）',dp().map(m=>m.text).join('/')==='表更新了/📷（泡麵評鑑表）',dp().map(m=>m.text).join('/'));
    const F0=Object.assign({},G.flags); fresh(y2+7,8,'campus',F0); R('kai',...LV.FAM); run(8,24); check('D 隔一週：還不會再傳（至少隔四週）',dp().length===0);
    const F1=Object.assign({},G.flags); fresh(y2+28,8,'campus',F1); R('kai',...LV.FAM); run(8,24); check('D 隔四週：再傳一次',dp().length===2); }
  /* ---------- E 方奕廷上山的一週 ---------- */
  { const wed=termDay('Y1S1',10,3), mon=termDay('Y1S1',11,1);
    fresh(wed,15,'cafe'); SOCIAL.markUp('npc_fangyt',4); check('E 門檻台詞那天記下來（relUpDay）',G.social.relUpDay.npc_fangyt===wed&&STORY._fy.monAfter(wed)===mon,JSON.stringify(G.social.relUpDay));
    const tick=(n)=>{ let r=false; for(let i=0;i<(n||4);i++) r=STORY._fy.tick(GM,1)||r; return r; };
    G.zone='dorm'; G.hour=20; check('E 說的那週：還沒有植物',!tick()&&G.flags.fyPots&&G.flags.fyPots.hand==null);
    G.day=mon; G.weekday=1; G.hour=6.5; check('E 下週一清晨 6:30 不演',!tick());
    G.hour=9; said=[]; const st=tick(); await new Promise(r=>setTimeout(r,0));
    check('E 下週一 9:00 待在房間 2.5 秒：交給你（旁白＋「三盆。兩天一次。早上澆，不要澆到葉子。」）',st&&said.map(s=>(s.who||'旁白')+'｜'+s.t).join('/')==='旁白｜（方奕廷把三盆植物搬到你的房間窗台。）/方奕廷｜「三盆。兩天一次。早上澆，不要澆到葉子。」'&&G.flags.fyPots.hand===mon,said.map(s=>(s.who||'旁白')+'｜'+s.t).join('/'));
    STORY.dormItems(GM); const pot=E.interactables.find(i=>i.fyPots); check('E 房間物件「方奕廷的三盆植物」',!!pot&&pot.label==='方奕廷的三盆植物');
    check('E 不會重複交（同一天再待一下）',!tick());
    picks=[0]; said=[]; await STORY._fy.scene(GM); check('E 點了「澆水」',opts[opts.length-1].join('/')==='澆水/不用了'&&said[0].t==='你幫三盆植物澆了水。'&&G.flags.fyPots.w.join()===String(mon));
    said=[]; await STORY._fy.scene(GM); check('E 同一天再點：「土還是濕的。今天澆過了。」',said[0].t==='土還是濕的。今天澆過了。');
    for(const d of [mon+3,mon+5]){ G.day=d; picks=[0]; await STORY._fy.scene(GM); }
    check('E 三個檢查（第 2、4、6 天結束）都有澆：忘了 0 次',STORY.fyForgot(G.flags.fyPots)===0,JSON.stringify(G.flags.fyPots.w));
    G.day=mon+6; check('E 第 7 天他還沒回來',!tick());
    G.day=mon+7; said=[]; tick(); await new Promise(r=>setTimeout(r,0));
    check('E 第 8 天：都有澆「三盆都很好。土的濕度剛好。」「……謝謝。下次上山還找你。」、三盆搬回去',said.map(s=>s.t).join('/')==='「三盆都很好。土的濕度剛好。」/「……謝謝。下次上山還找你。」/（三盆搬回他的房間了。）'&&G.flags.fyPots.done&&G.flags.fyPots.forgot===0,said.map(s=>s.t).join('/'));
    check('E 物件拿掉、之後不再出現',!E.interactables.some(i=>i.fyPots)&&(STORY.dormItems(GM),!E.interactables.some(i=>i.fyPots))&&!tick());
    fresh(wed,15,'cafe'); SOCIAL.markUp('npc_fangyt',4); G.zone='dorm'; G.day=mon; G.hour=10; tick(); await new Promise(r=>setTimeout(r,0)); picks=[0]; await STORY._fy.scene(GM);
    check('E 只澆了第一天：忘了兩次',STORY.fyForgot(G.flags.fyPots)===2);
    G.day=mon+9; G.hour=22; said=[]; tick(); await new Promise(r=>setTimeout(r,0));
    check('E 回來（第 8 天以後第一次待在房間）：忘了一次以上「它們很堅強。」',said.map(s=>s.t).join('/')==='「它們很堅強。」/（三盆搬回他的房間了。）'&&G.flags.fyPots.forgot===2,said.map(s=>s.t).join('/'));
    fresh(mon,10,'dorm'); G.social.relUp={npc_fangyt:4}; said=[]; check('E 舊存檔（不知道門檻台詞是哪一天）：不演',!tick()&&G.flags.fyPots.done&&G.flags.fyPots.old&&!said.length);
    fresh(mon,10,'dorm'); said=[]; check('E 還沒到好朋友：不演',!tick()&&!G.flags.fyPots); }
  /* ---------- F 每天的手機小事照常 ---------- */
  { const y1s2=termDay('Y1S2',5,2); fresh(y1s2,8,'dorm',{POTHOS:true}); PHONE.join(G,'guitar','吉他社'); PHONE.join(G,'lawclub_study','法服讀書會'); PHONE.join(G,'family_law','法律系直屬家族'); R('heroine_04',...LV.ACQ); R('kai',...LV.FAM);
    run(8,24); check('F 大一下：沒寫學期的條目（大一上的手機小事）不傳',!!y1s2&&dp().length===0,'第 '+y1s2+' 天 '+JSON.stringify(dp().map(m=>m.text))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
