// 好朋友的自動劇情（AA_606，X157 STORY-FRIENDS-EVENTS-1103；企劃線 11-03 版）——不需要瀏覽器。
//   N 名字寫法統一（第 2 節）：柏翰、明軒、芯慈、沛珊的 name＝大家叫的名字、全名放 fullname；對話框、3D 說話按鈕用叫的名字；手機聯絡人「叫的名字（來處）」、朋友以後拿掉括號；
//     阿凱搬宿舍那場不論選什麼都說「阿凱。資工系的。」
//   C 名片場（第 3 節）：3-1 阿凱「凌晨的作業」（第 1 週 9/2 23:30 以後在 203）、3-2 柏翰「第一排」（第 2 週民總上課前）、3-3 Alison 在第一次和阿哲去麵店時認識
//     （ZHE_FIRST_TABLE 開頭；第 3 週初遇那句改「……欸，你剛剛講得很好。」）、3-4 明軒「公館便宜好吃.xlsx」（第 3 週必修下課）、3-5 阿哲「四碗麵」（第 4 週 9/23 22:00 以後、阿凱和柏翰都在 203）；
//     每場記 FRIEND_CARD_<id>、記憶 FRIEND_CARD（note＝場名）、熟悉 +2。第 4 節群像「考完吃哪家」（第 13 週刑總下課；和阿哲 FRIEND 以上或演過四碗麵；「明軒那家。」記 Y1S1_EXAM_MEAL_PICK）。
// 修改前（名字是三字全名、沒有這些事件）全部 FAIL。用法：node tests/friend_cards_unit.js
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
(async()=>{
  // ---------- N 名字寫法統一 ----------
  fresh();
  const nm={classmate_bohan:['柏翰','許柏翰'],classmate_mingxuan:['明軒','江明軒'],classmate_xinci:['芯慈','吳芯慈'],classmate_peishan:['沛珊','郭沛珊']};
  check('N1. 柏翰、明軒、芯慈、沛珊：name＝大家叫的名字、fullname＝三字全名（同阿哲、阿凱、Alison）；對話框（displayName）、3D 說話按鈕（npcName）都是叫的名字',Object.entries(nm).every(([id,[a,b]])=>CHARACTERS[id].name===a&&CHARACTERS[id].fullname===b&&SOCIAL.displayName(id)===a&&SOCIAL.npcName(id)===a)&&SOCIAL.displayName('zhe')==='阿哲'&&SOCIAL.displayName('kai')==='阿凱'&&SOCIAL.displayName('yu')==='Alison',Object.keys(nm).map(id=>SOCIAL.displayName(id)).join(' '));
  said=[]; await EVENTS.run(ev('ev_mingxuan_ball'));
  check('N2. 事件的對話框：明軒說話寫「明軒：」，第一次自我介紹那一句照舊是全名',said.length>0&&said.every(t=>!/^江明軒：/.test(t))&&said.some(t=>t==='明軒：江明軒。阿哲的隊友。他說你們同班。'),said.slice(0,2).join(' / '));
  fresh(); SOCIAL.meet('classmate_peishan','camp'); SOCIAL.meet('classmate_xinci','camp'); SOCIAL.meet('classmate_mingxuan','classroom'); SOCIAL.meet('classmate_bohan','dorm');
  const cn=id=>SOCIAL.contactName(id);
  check('N3. 手機聯絡人：叫的名字＋來處（宿營認識＝「（宿營同隊）」；明軒沒在宿營認識＝「明軒（系籃）」、柏翰在宿舍認識＝「柏翰」）',cn('classmate_peishan')==='沛珊（宿營同隊）'&&cn('classmate_xinci')==='芯慈（宿營同隊）'&&cn('classmate_mingxuan')==='明軒（系籃）'&&cn('classmate_bohan')==='柏翰',['classmate_peishan','classmate_xinci','classmate_mingxuan','classmate_bohan'].map(cn).join(' / '));
  for(const id of ['classmate_peishan','classmate_mingxuan']) SOCIAL.adjust(id,{fam:45,trust:30});
  check('N4. 熟了（朋友）括號拿掉：「沛珊」「明軒」；不再出現「郭沛珊（宿營小隊）」「江明軒（系籃）」',cn('classmate_peishan')==='沛珊'&&cn('classmate_mingxuan')==='明軒',cn('classmate_peishan')+' '+cn('classmate_mingxuan'));
  for(const [k,pick] of [[0,'沒關係，你先放。'],[1,'我是'],[2,'（點頭']]){ fresh(); G.flags.CAMP_Y1=true; G.day=day('2025-08-29'); G.hour=9; picks=[pick]; await STORY.startLawWeek1(GM,null,{day:G.day,hour:15,econ:true});
    check('N5-'+k+'. 搬宿舍：選「'+pick+'」也有阿凱「阿凱。資工系的。」（AA_606 第 2 節；原本只有選自我介紹才說「阿凱。資工。」）',said.filter(t=>t==='阿凱：阿凱。資工系的。').length===1&&!said.includes('阿凱：阿凱。資工。'),said.filter(t=>/^阿凱：/.test(t)).slice(0,4).join(' / ')); }
  // ---------- 3-1 阿凱「凌晨的作業」----------
  { const e=ev('ev_card_kai'); fresh(); at('2025-09-02',23.6,{DORM_FOUR:true});
    const ok1=EVENTS.check(e); G.hour=23.2; const ok0=EVENTS.check(e); G.day=day('2025-09-01'); G.hour=23.6; const okD=EVENTS.check(e); at('2025-09-09',23.6,{DORM_FOUR:true}); const okW=EVENTS.check(e); G.zone='linze'; at('2025-09-02',23.6); const okZ=EVENTS.check(e);
    check('C1. 3-1 條件：9/2 23:36 在 203＝演；23:12、9/1、第 2 週、不在 203＝不演；自動（trigger auto）',e&&e.trigger==='auto'&&ok1&&!ok0&&!okD&&!okW&&!okZ,JSON.stringify([ok1,ok0,okD,okW,okZ]));
    fresh(); at('2025-09-02',23.6,{DORM_FOUR:true}); SOCIAL.meet('kai','dorm'); const f0=fam('kai'); await EVENTS.run(e);
    check('C2. 3-1 台詞（預設「要我關燈嗎？」）；FRIEND_CARD_kai、記憶 FRIEND_CARD「凌晨的作業」、熟悉 +2；演過不再演',!block(['（十二點。房間只剩阿凱的螢幕亮著。）','你還沒睡？','我在寫程式作業。資工系的，明天早上交。','不用。我戴耳機，你睡你的。','（隔天早上，你桌上多了一杯豆漿。阿凱已經去上課了。）'])&&optsSeen.includes('「要我關燈嗎？」/「寫多久了？」')&&G.flags.FRIEND_CARD_kai===true&&card('kai')==='凌晨寫作業，隔天桌上多了一杯豆漿'&&fam('kai')-f0===2&&!EVENTS.check(e),said.join(' / '));
    fresh(); at('2025-09-02',23.6); picks=['寫多久了']; await EVENTS.run(e);
    check('C3. 3-1 另一個選項：「九點開始。……不要跟阿哲說，他會拉我去吃宵夜。」',said.includes('阿凱：九點開始。……不要跟阿哲說，他會拉我去吃宵夜。')); }
  // ---------- 3-2 柏翰「第一排」----------
  { const e=ev('ev_card_bohan'); fresh(); at('2025-09-11',13);
    check('C4. 3-2 條件：民總上課前（beforeClass 只認 civ_general）、第 2 週（撞到別的事件延到下一次民總，最晚第 5 週）',e.trigger==='class'&&typeof e.beforeClass==='function'&&e.beforeClass({c:{id:'civ_general'}})&&!e.beforeClass({c:{id:'const_1'}})&&JSON.stringify(e.weeks)==='[2]'&&e.carryTo===5&&EVENTS.check(e)&&(()=>{ G.day=day('2025-09-04'); const w1=EVENTS.check(e); G.day=day('2025-10-09'); const w6=EVENTS.check(e); return !w1&&!w6; })());
    { fresh(); at('2025-09-11',13); const d={id:'ev_test_before',trigger:'class',location:'any',beforeClass:'civ_general',once:true,dialogue:[]}; STORY_EVENTS.push(d); const y=e.beforeClass({c:{id:'civ_general'}}); STORY_EVENTS.pop();
      check('C4b. AA_606 第 5 節：同一堂民總已經有別的上課前事件＝柏翰這場讓位（延到下一次）',y===false&&e.beforeClass({c:{id:'civ_general'}})===true); }
    fresh(); at('2025-09-11',13); SOCIAL.meet('classmate_bohan','dorm'); const f0=fam('classmate_bohan'); await EVENTS.run(e);
    check('C5. 3-2 台詞（沒有 9/1 那場：「{name}。這裡。」；預設「你真的量過？」）；記 FRIEND_CARD、熟悉 +2',!block(['（民總。第一排正中間，柏翰已經把課本、筆記本、三支筆排好。）','祐廷。這裡。','第一排聽得最清楚。我量過，第八排開始，老師的聲音會被冷氣蓋掉。','上週。每一排坐五分鐘。','我念得慢。坐前面，回去可以少讀一遍。'])&&said.includes('柏翰：祐廷。這裡。')&&G.flags.FRIEND_CARD_classmate_bohan===true&&card('classmate_bohan')==='民總坐第一排'&&fam('classmate_bohan')-f0===2,said.join(' / '));
    fresh(); at('2025-09-11',13); G.events.done.ev_bohan_w1_front=1; picks=['好，我坐這']; await EVENTS.run(e);
    check('C6. 3-2 已有 9/1 第一排那場：第一句「{name}。今天也坐這裡。」；選「好，我坐這。」→「（他把旁邊的桌面擦了一下。）」',said.includes('柏翰：祐廷。今天也坐這裡。')&&!said.includes('柏翰：祐廷。這裡。')&&said.includes('（他把旁邊的桌面擦了一下。）'),said.join(' / ')); }
  // ---------- 3-3 Alison：第一次和阿哲去麵店 ----------
  { fresh(); at('2025-09-04',18.5); SOCIAL.meet('zhe','camp'); said=[]; await EVENTS.run(ev('ev_zhe_long_table_out')); const m=(G.social.mem.yu||[]).find(x=>x.tag==='FIRST_MET');
    check('C7. 3-3 第一次併桌（9/4 約的那一頓）開頭：Alison 跟著來（預設「對，就是我。」），之後照原本「（阿哲把兩張桌子併起來。）」；認識 Alison（FIRST_MET noodle）、熟悉 +1',
      !block(['（燒臘店。阿哲旁邊多了一個女生，已經在看菜單。）','Alison。宿營跟我同一隊，也是法律系。','嗨！我聽阿哲講過你，撕名牌被他撕掉的那個。','他說你轉身撞到他，他差點跌倒。','好了啦，點菜。','（阿哲把兩張桌子併起來。）'])&&said.includes('Alison：嗨！我聽阿哲講過你，撕名牌被他撕掉的那個。')&&optsSeen.includes('「對，就是我。」/「他怎麼跟妳說的？」')&&m&&m.note==='noodle'&&fam('yu')===6,said.slice(0,6).join(' / ')+' '+fam('yu'));
    check('C8. 3-3 第 3 週初遇（ev_yu_meet_w3／talkYu）：在麵店認識的，Alison 那句改「你是周老師點的那個！……欸，你剛剛講得很好。」、不再自我介紹（第二句照舊）',STORY.yuIntroLines(G)[0]==='你是周老師點的那個！……欸，你剛剛講得很好。'&&STORY.yuIntroLines(G)[1]===STORY.YU_INTRO.lines[1]&&!/我是 Alison/.test(STORY.yuIntroLines(G).join()),STORY.yuIntroLines(G).join(' | '));
    { const G0=G; G.day=STORY.termDay('Y1S1',3,1); G.weekday=1; G.hour=12.3; global.CLS={dayItems:G=>[{c:{id:'const_1',kind:'required'},room:{zone:'linze',room:'201'},key:'k',t0:9+10/60,t1:12+10/60}],rec:G=>({done:{k:true},abs:{}})};   /* 替身：第 3 週週一憲法上完（只給 SUP497.yuMeetDue 用，用完拿掉）*/ const due=SUP497.yuMeetDue(G); const G2={day:G.day,weekday:1,hour:12.3,stage:'law',flags:{met_yu:true},social:{mem:{yu:[{tag:'FIRST_MET',note:'classroom'}]}}}; const due2=SUP497.yuMeetDue(G2); delete global.CLS;
      check('C8b. 3-3：在麵店認識的（SOCIAL.meet 會記 met_yu）第 3 週憲法下課的初遇照演一次；別的地方認識的照舊不演',due===true&&due2===false,JSON.stringify([due,due2])); }
    fresh(); at('2025-09-04',18.5); picks=['他怎麼跟妳說的']; await EVENTS.run(ev('ev_zhe_long_table'));
    check('C9. 3-3 沒去 9/4 那頓、之後第一次在麵店遇到阿哲（ev_zhe_long_table）也演；另一個選項「他說他偷襲成功。……他很得意。」',said.includes('Alison：他說他偷襲成功。……他很得意。')&&said.includes('（阿哲把兩張桌子併起來。）'),said.slice(0,6).join(' / '));
    fresh(); at('2025-09-04',18.5); SOCIAL.meet('yu','classroom'); await EVENTS.run(ev('ev_zhe_long_table_out'));
    check('C10. 3-3 已經認識 Alison：不演開頭那段；沒在麵店認識的初遇照舊自我介紹',!said.some(t=>/阿哲旁邊多了一個女生/.test(t))&&said[0]==='（阿哲把兩張桌子併起來。）'&&STORY.yuIntroLines(G)===STORY.YU_INTRO.lines,said.slice(0,2).join(' / '));
    fresh(); at('2026-03-05',18.5); await EVENTS.run(ev('ev_zhe_long_table_out'));
    check('C11. 3-3 只在大一上（大一下才第一次併桌的不演 Alison 那段）',!said.some(t=>/阿哲旁邊多了一個女生/.test(t))); }
  // ---------- 3-4 明軒「公館便宜好吃.xlsx」----------
  { const e=ev('ev_card_mingxuan'); fresh(); at('2025-09-15',12.2);
    check('C12. 3-4 條件：任一門必修下課（afterClass）、第 3 週起（最晚第 5 週）',e.trigger==='class'&&typeof e.afterClass==='function'&&e.afterClass({c:{id:'const_1',kind:'required'}})&&!e.afterClass({c:{id:'x',kind:'elective'}})&&JSON.stringify(e.weeks)==='[3]'&&e.carryTo===5&&EVENTS.check(e)&&(()=>{ G.day=day('2025-09-08'); return !EVENTS.check(e); })());
    { fresh(); at('2025-09-15',12.2); const d={id:'ev_test_after',trigger:'class',location:'any',afterClass:'const_1',once:true,dialogue:[]}; STORY_EVENTS.push(d); global.CLS={afterClassOk:it=>x=>(x.afterClass===it.c.id||(typeof x.afterClass==='function'&&x.afterClass(it)))&&EVENTS.check(x,{chain:true})}; const it={c:{id:'const_1',kind:'required'}}, y=e.afterClass(it); STORY_EVENTS.pop(); const y2=e.afterClass(it); delete global.CLS;
      check('C12b. AA_606 第 5 節：同一堂下課已經有別的下課事件（例：sup497 的固定場次）＝明軒這場讓位',y===false&&y2===true,JSON.stringify([y,y2])); }
    fresh(); at('2025-09-15',12.2); await EVENTS.run(e);
    check('C13. 3-4 台詞（AA_608 10-1 回扣：遊覽車上睡覺的那個人；預設「你要去哪？」）；記 FRIEND_CARD「公館便宜好吃.xlsx」、熟悉 +2',!block(['（下課鐘一響，前排一個戴帽子的男生第一個收好書包。是宿營遊覽車上一直在睡的那個人。）','欸，祐廷，我先走，公車要趕。','（他把一張摺好的紙塞給你。）','公館便宜好吃的店，我自己整理的。不要外流喔。','家教。國中生，數學。……你什麼都沒看到。','（你打開那張紙。第一行寫著：「江明軒製」。）'])&&said.includes('明軒：欸，祐廷，我先走，公車要趕。')&&card('classmate_mingxuan')==='公館便宜好吃的清單'&&G.flags.FRIEND_CARD_classmate_mingxuan===true,said.join(' / '));
    fresh(); at('2025-09-15',12.2); picks=['謝了']; await EVENTS.run(e); check('C14. 3-4 另一個選項：「下次我請。……一顆滷蛋。」',said.includes('明軒：下次我請。……一顆滷蛋。')); }
  // ---------- 3-5 阿哲「四碗麵」----------
  { const e=ev('ev_card_zhe'), setup=h=>{ fresh(); at('2025-09-23',h,{DORM_FOUR:true}); G.zone='dorm'; };
    setup(22.7); const w=STORY.dormWho(G).map(x=>x[0]).join(); const ok=EVENTS.check(e); setup(22.1); const okEarly=EVENTS.check(e); setup(22.7); G.day=day('2025-09-22'); G.weekday=1; const okMon=EVENTS.check(e); setup(22.7); delete G.flags.DORM_FOUR; const ok2=EVENTS.check(e);
    check('C15. 3-5 條件：9/23 22:00 以後在 203、阿凱和柏翰都在房間（22:42 都在＝演；22:06 柏翰還沒回來、9/22、沒有四人房＝不演）',e.trigger==='auto'&&ok&&!okEarly&&!okMon&&!ok2,JSON.stringify({w,ok,okEarly,okMon,ok2}));
    setup(22.7); for(const id of ['zhe','kai','classmate_bohan']) SOCIAL.meet(id,'dorm'); const f0=fam('zhe'); await EVENTS.run(e);
    check('C16. 3-5 台詞（預設「謝啦，阿哲。」）；記 FRIEND_CARD「四碗麵」、阿哲熟悉 +2',!block(['（晚上十點，阿哲提著四個燒臘便當進門。）','阿凱、柏翰、祐廷。宵夜。我揪的，算我的。','一碗六十五。我轉你。','沒事啦。','那下次我買。……所以下次是什麼時候。','吃啦，要冷了。','（四個人坐在地板上吃。阿凱的螢幕還亮著，柏翰把湯喝完才開口：「好吃。」）'])&&card('zhe')==='提了四個便當回來'&&fam('zhe')-f0===2,said.join(' / '));
    setup(22.7); picks=['我也轉你']; await EVENTS.run(e); const a=said.includes('阿哲：不用啦。');
    setup(22.7); G.flags.ZHE_CALLS_GE=true; picks=['我也轉你']; await EVENTS.run(e);
    check('C17. 3-5「我也轉你。」→「不用啦。」；有 ZHE_CALLS_GE＝「不用啦，哥。」',a&&said.includes('阿哲：不用啦，哥。')&&!said.includes('阿哲：不用啦。')); }
  // ---------- 第 4 節 群像「考完吃哪家」----------
  { const e=ev('ev_friends_exam_meal'), wk13=STORY.termDay('Y1S1',13,3); fresh(); G.day=wk13; G.weekday=3; G.hour=12.2; const no=EVENTS.check(e); G.flags.FRIEND_CARD_zhe=true; const yes=EVENTS.check(e); G.day=STORY.termDay('Y1S1',12,3); const w12=EVENTS.check(e);
    fresh(); G.day=wk13; G.weekday=3; G.hour=12.2; SOCIAL.adjust('zhe',{fam:45,trust:30}); const fr=EVENTS.check(e);
    check('C18. 第 4 節條件：第 13 週刑總下課（afterClass crim_gen1）；演過四碗麵、或和阿哲 FRIEND 以上才演',e.afterClass==='crim_gen1'&&!no&&yes&&fr&&!w12,JSON.stringify({no,yes,fr,w12}));
    fresh(); G.day=wk13; G.hour=12.2; picks=['明軒那家']; await EVENTS.run(e);
    check('C19. 第 4 節台詞照順序；選「明軒那家。」記 Y1S1_EXAM_MEAL_PICK mx',!block(['（刑總下課。走廊上，阿哲已經在點人數。）','考完那天，吃飯。柏翰、明軒、Alison、祐廷。芯慈呢？','她說要提前一天約才算數。我幫她約了！','最後一科考完是下午三點十分。','燒臘店四點半才開。……我知道一家三點就開的。','所以哪家？','（拿出手機）表上第三列。'])&&optsSeen.includes('「我都可以。」/「明軒那家。」')&&G.flags.Y1S1_EXAM_MEAL_PICK==='mx',said.join(' / '));
    fresh(); G.day=wk13; G.hour=12.2; await EVENTS.run(e); check('C20. 選「我都可以。」不記旗標',G.flags.Y1S1_EXAM_MEAL_PICK==null); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
