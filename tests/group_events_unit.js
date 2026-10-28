// 1C 群戲（AA_324，AA-C 定稿 c41f4305）——不需要瀏覽器。照 AA_324 每一件的「給 BB 的驗收情境」寫：
//   0. 接線：GROUP 掛在 STORY.PHONE_RULES／TICKS；index.html 在 postgrad3d.js 後面載入兩個檔；事件都在 STORY_EVENTS；日子的星期
//   1. 1C-01 春假（S1～S3）：3/30 21:00 麵店團群組七則、21:30 可昕兩則（照大一）→ 兩則都到了才問三選一；麵店團＝4/4 市場＋海邊、沒有沛珊、海邊二選一；
//      和沛珊熟＝「……以前這種行程都是沛珊排的。」；可昕＝沒去過的目的地裡選、沒有假設題、三個都去過＝迷路到的地方；留宿舍＝旁白；4/1 以前沒回＝'none'＋群組照片
//   2. 1C-02 中秋（M1、M2）：9/14 21:00 群組、9/15 18:00；柚子插蠟燭、三選一、記 AN_BDAY_POMELO；不知道生日＝那一句在語彤拿出柚子之後；沒去＝以安的照片兩則
//   3. 1C-03 寄到英國的那一箱（X1、X2）：12/25 21:00 兩則；和芷若熟＝三選一放東西、交往中多一個；不熟＝「你不認識她，還是放了一包乖乖。」；語彤封箱；沒去＝照片；接了阿哲的期末飯＝這一場就算
//   4. 1C-04 哲 4＋冠軍賽（Z1～Z3）：4/28 21:00 群組；23:00「你在宿舍嗎」（宿舍＝下樓、在家＝我在家。）；「有事。我很緊張。」三選一、ZHE_SAID_IT；
//      AA_336 C7～C13：星星可以再去、可昕大二春假新句、哲 4 在臺北的外面／不在臺北／視訊版／日本路線選項③、日本直播旁白、照片格式與面板名稱
//      冠軍賽「那出國呢？」＝「交換那個，我放棄了。畢業以後自己存錢去。」SAW_HIM_TRY；賽後麵店；請客＝隔週補滷蛋；日本路線＝視訊、直播、明軒的訊息；沒去＝照片
//   5. 1C-05 子晴、芷若同一天畢業（G1～G3）：6/2 21:00 子晴三則（交往中四句）；去＝6/3 09:00 椰林大道「妳閉眼了啦。再一張。」「妳拍歪了。」「你拍我們兩個。」；
//      交往中先「我們兩個。」；下午 Café Z12「九月，我去英國念電影研究。一年。」IMPORTANT_CONVERSATION；沒去上午＝12:30 三則；日本路線＝兩張照片；GRAD_ZQ_ZR
//   6. 1C-06 最後一學期（L1、L2）：2/22 17:00 群組改名「最後一學期」＋阿哲、19:00 麵店「改回來啦。很難過耶。」二選一；2/25 21:00 改回「麵店團」；沒去＝照片
// 修改前：沒有 GROUP、這些事件（第 0 項 FAIL）。用法：node tests/group_events_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH|GROUP|GROUP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/group_events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/group3d.js','src/classes3d.js'];
const missing=FILES.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(missing.length){ check('0. 有 src/data/group_events.js、src/group3d.js',false,missing.join('、')); console.log('FAILED '+fails); process.exit(1); }
for(const f of FILES) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, scenes=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
ADV.setBg=b=>{ scenes.push(b); };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; scenes=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const team=()=>{ PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','heroine_01','heroine_03','classmate_bohan','classmate_xinci']) R(id,'FAM'); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const has=t=>said.some(s=>s.t===t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const play=async(id,pk)=>{ said=[]; opts=[]; scenes=[]; picks=[].concat(pk==null?[]:pk); await EVENTS.run(ev(id)); return lines(); };
const NAME=id=>SOCIAL.displayName(id);
(async()=>{
  // ===== 0. 接線 =====
  const IDS=['ev_spring_y2_noodle','ev_kexin_trip_spring_y2','ev_spring_dorm_empty_y2','ev_midautumn_y3','ev_xmas_y3_box','ev_zhe_said_it','ev_final_game_y3','ev_mx_egg_y3','ev_zq_zr_graduation','ev_zhiruo_graduation_cafe','ev_last_term_first_dinner'];
  check('0. 十一個事件都在 STORY_EVENTS（id 照 AA_324）', IDS.every(id=>!!ev(id)), IDS.filter(id=>!ev(id)).join('、'));
  check('0. GROUP 掛在 STORY.PHONE_RULES、STORY.TICKS', typeof GROUP!=='undefined'&&STORY.PHONE_RULES.length>=1&&STORY.TICKS.length>=1);
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/postgrad3d.js'), b=h.indexOf('src/data/group_events.js'), c=h.indexOf('src/group3d.js'), z=h.indexOf('GAME.boot()');
    check('0. index.html：postgrad3d.js → data/group_events.js → group3d.js → GAME.boot()', a>0&&b>a&&c>b&&z>c); }
  const wd=k=>CALENDAR.dateOf(D(k)).wd;
  check('0. 日子：3/30 週二、4/1 週四、4/4 週日、9/15 週三、12/26 週日、4/28 週五、4/29 週六、6/2 週五、6/3 週六、2/22 週四、2/25 週日',
    wd('2027-03-30')===2&&wd('2027-04-01')===4&&[0,7].includes(wd('2027-04-04'))&&wd('2027-09-15')===3&&[0,7].includes(wd('2027-12-26'))&&wd('2028-04-28')===5&&wd('2028-04-29')===6&&wd('2028-06-02')===5&&wd('2028-06-03')===6&&wd('2029-02-22')===4&&[0,7].includes(wd('2029-02-25')));

  // ===== 1. 1C-01 春假 =====
  const SD=GROUP.springDays(), d330=SD.inv;
  fresh(d330,20,'dorm'); team(); date('kexin'); run(d330,20,20.9);
  check('1. 3/30 21:00 以前沒有邀約', !PHONE.sent(G,'y2s2_spring_grp')&&!GROUP.springPending(G));
  run(d330,21,21.25);
  check('1. 3/30 21:00 麵店團群組七則（Alison、語彤、阿哲、柏翰；阿哲 @祐廷）', JSON.stringify(txt('g:noodle_team').slice(-7))===JSON.stringify(['yu:春假那個','yu:語彤說行程她排','heroine_03:第一站是市場。','zhe:市場？','heroine_03:……田野課的。我想自己去看一次。','classmate_bohan:誰開車？','zhe:@祐廷']), JSON.stringify(txt('g:noodle_team')));
  check('1. 可昕的還沒到：先不問（兩則都到了才問）', !GROUP.springPending(G));
  run(d330,21.5,21.75);
  check('1. 21:30 可昕兩則（大二版，AA_336 C8）、之後才問', txt('p:kexin').slice(-2).join('|')==='kexin:春假。今年也開車？|kexin:行程表做好了。……這次吃的只有一頁。'&&GROUP.springPending(G), JSON.stringify(txt('p:kexin').slice(-2)));
  picks=['麵店團']; const started=GROUP.tick(GM); await new Promise(r=>setImmediate(r)); await new Promise(r=>setImmediate(r));
  check('1. 三選一（S.tick 掛勾）：麵店團／可昕／留宿舍／晚一點', started===true&&JSON.stringify(opts[0])===JSON.stringify(['春假：跟麵店團出去','春假：和可昕開車旅行','春假：留在宿舍','晚一點再決定']), JSON.stringify(opts[0]));
  { const q=OUT.get(G,'ndl_trip_y2s2');
    check('1. 選麵店團：SPRING_Y2 noodle、4/4 08:00 出遊（回家取車）', G.flags.SPRING_Y2==='noodle'&&!!q&&q.day===SD.trip&&q.h===8&&q.ev==='ev_spring_y2_noodle'&&q.travelH===0.5, JSON.stringify(q)); }
  run(d330,22,22.25); run(SD.d0,21.5,21.75);
  check('1. 可昕：「好。那暑假再去。」、春假一張讀書會的照片（BB_97 9-12）、KX_TRIP_DEFERRED summer', txt('p:kexin').includes('kexin:好。那暑假再去。')&&txt('p:kexin').some(t=>/讀書會/.test(t))&&G.flags.KX_TRIP_DEFERRED==='summer');
  check('1. C13 照片：「📷（她和予樂在讀書會的長桌，桌上兩疊講義）」接「春假。我們在讀書。」', JSON.stringify(txt('p:kexin').slice(-2))===JSON.stringify(['kexin:📷（她和予樂在讀書會的長桌，桌上兩疊講義）','kexin:春假。我們在讀書。']), JSON.stringify(txt('p:kexin').slice(-2)));
  // S1、S2
  fresh(SD.trip,8,'dorm'); team(); R('classmate_peishan','ACQ'); let L1=await play('ev_spring_y2_noodle',[0]);
  check('1. S1 車上：「（你回家把車開出來。後座擠了三個人。）」→ 市場 → 海邊 → 回程', L1[0]==='（你回家把車開出來。後座擠了三個人。）'&&has('（市場在小鎮車站的後面。早上九點，攤販已經在收第一輪了。）')&&has('（第二站是海邊。四月的風還有點冷。）')&&L1[L1.length-1]==='（回程，後座三個人都睡著了。你一個人開到臺北，收音機開得很小聲。）', JSON.stringify(L1.slice(0,3)));
  check('1. S1 市場「這個好吃。我不知道是什麼。」、以安「第一站選得很有理由。」（不是「理由很充分」）', L1.includes(NAME('zhe')+'：（手上拿著一袋剛炸好的東西）這個好吃。我不知道是什麼。')&&L1.includes(NAME('heroine_01')+'：第一站選得很有理由。')&&!L1.some(t=>/理由很充分/.test(t)));
  check('1. S1 海邊二選一（下去踩水／坐在堤防上）；沒有沛珊', JSON.stringify(opts[0])===JSON.stringify(['（下去踩水）','（坐在堤防上）'])&&!L1.some(t=>/沛珊/.test(t))&&has('（水真的很冷。Alison 在後面笑到蹲下。）'));
  check('1. 背景：車上（早上）→ 小鎮的市場（深色底）→ 海邊 y0_sea_blue', JSON.stringify(scenes[0])===JSON.stringify(OUT.bg('car_morning'))&&scenes[1]==='dark'&&JSON.stringify(scenes[2])===JSON.stringify(OUT.bg('y0_sea_blue')));
  fresh(SD.trip,8,'dorm'); team(); R('yu','FRI'); R('heroine_03','FRI'); R('classmate_peishan','FAM'); L1=await play('ev_spring_y2_noodle',[1]);   /* AA_375 第 5 項：車上最多三個人（照熟悉度），市場那兩句要 Alison、語彤在車上 */
  check('1. S2 和沛珊熟：Alison「……以前這種行程都是沛珊排的。」＋沒有人接話；坐堤防＝坐到語彤旁邊', L1.includes(NAME('yu')+'：（看著賣菜的阿姨）……以前這種行程都是沛珊排的。')&&has('（沒有人接話。語彤把一袋芭樂遞給 Alison。）')&&has('（你坐到語彤旁邊。她看著海，筆記本放在膝蓋上，一個字都沒寫。）'));
  fresh(SD.trip,8,'dorm'); PHONE.join(G,'noodle_team','麵店團'); R('zhe','FAM'); L1=await play('ev_spring_y2_noodle',[0]);
  check('1. 只有認識的人說話：只認識阿哲＝沒有語彤、以安、Alison、柏翰、芯慈的句子', !L1.some(t=>t.startsWith(NAME('heroine_03')+'：')||t.startsWith(NAME('heroine_01')+'：')||t.startsWith(NAME('yu')+'：')||t.startsWith(NAME('classmate_bohan')+'：')||t.startsWith(NAME('classmate_xinci')+'：'))&&!has('我哪有。'), JSON.stringify(L1));
  // S3 可昕
  fresh(d330,21.9,'dorm'); team(); date('kexin'); run(d330,21,21.75); picks=['可昕']; GROUP.tick(GM); await new Promise(r=>setImmediate(r)); await new Promise(r=>setImmediate(r));
  { const q=OUT.get(G,'kx_trip_y2s2'); check('1. 選可昕：4/3 07:40 出遊（照大一那一趟）、沒去麵店團＝4/4 21:30 群組照片（Alison）', G.flags.SPRING_Y2==='kexin'&&!!q&&q.day===SD.d0&&q.ev==='ev_kexin_trip_spring_y2'&&PHONE.sent(G,'y2s2_spring_photo')); }
  run(SD.trip,21.5,21.75); check('1. 4/4 21:30 群組照片', txt('g:noodle_team').slice(-1)[0]==='yu:📷（海邊。一排人站在堤防上，阿哲在最後面，還是最高。）');
  fresh(SD.d0,8,'dorm'); date('kexin'); G.flags.KX_TRIP={Y1S2:'sea'}; let K1=await play('ev_kexin_trip_spring_y2',['山上']);
  check('1. S3 可昕：去過海邊＝只有老街、山上看星星；山上沒去過＝「好安靜。手機收不到訊號，剛好。」；記 KX_TRIP.Y2S2', JSON.stringify(opts[0])===JSON.stringify(['別的城市的老街','山上看星星'])&&K1.includes(NAME('kexin')+'：好安靜。手機收不到訊號，剛好。')&&G.flags.KX_TRIP.Y2S2==='stars'&&G.flags.KX_TRIP.Y1S2==='sea', JSON.stringify(opts[0]));
  check('1. S3 沒有任何假設題', !K1.some(t=>/假設/.test(t)));
  check('1. C8 車上開場、回程是大二版：「我管音樂。你管方向。」「……目的地，現在決定。」…「今年我真的不睡。」「（過了收費站，她又睡著了。音樂還是她選的。）」；沒有大一的句子', K1.includes(NAME('kexin')+'：我管音樂。你管方向。')&&K1.includes(NAME('kexin')+'：……目的地，現在決定。')&&K1.includes(NAME('kexin')+'：今年我真的不睡。')&&K1[K1.length-1]==='（過了收費站，她又睡著了。音樂還是她選的。）'&&!K1.some(t=>/誰都不能管對方的|我要陪你開車|規則。我管音樂/.test(t)), JSON.stringify(K1));
  fresh(SD.d0,8,'dorm'); date('kexin'); G.flags.KX_TRIP={Y1S2:'stars'}; K1=await play('ev_kexin_trip_spring_y2',['山上']);
  check('1. C7 大一去過山上：「山上看星星」照樣可以選（另外兩個沒去過的也在）；「今天看得到。……上次那顆，真的是星星。」', JSON.stringify(opts[0])===JSON.stringify(['海邊','別的城市的老街','山上看星星'])&&K1.includes(NAME('kexin')+'：今天看得到。……上次那顆，真的是星星。')&&G.flags.KX_TRIP.Y2S2==='stars', JSON.stringify([opts[0],K1]));
  fresh(SD.d0,8,'dorm'); date('kexin'); K1=await play('ev_kexin_trip_spring_y2',['海邊']);
  check('1. 海邊「水比我想的冷。……你先下去。」', K1.includes(NAME('kexin')+'：水比我想的冷。……你先下去。')&&G.flags.KX_TRIP.Y2S2==='sea');
  fresh(SD.d0,8,'dorm'); date('kexin'); G.flags.KX_TRIP={Y1S2:'sea',Y1SUM:'oldtown',Y2WIN:'stars'}; K1=await play('ev_kexin_trip_spring_y2',[0]);
  check('1. 三個都去過＝迷路到的地方（BB_97 9-12）：「這次我不出行程表。你帶路，不要看地圖。」…「行程表我回去再補。寫『迷路』，一行就好。」', K1.includes(NAME('kexin')+'：這次我不出行程表。你帶路，不要看地圖。')&&K1.includes(NAME('kexin')+'：這間店沒有招牌欸。')&&K1[K1.length-1]===NAME('kexin')+'：行程表我回去再補。寫『迷路』，一行就好。'&&G.flags.KX_TRIP.Y2S2==='lost'&&!K1.some(t=>/假設/.test(t)), JSON.stringify(K1.slice(-2)));
  // 留宿舍、沒回、晚一點
  fresh(d330,21.9,'dorm'); team(); run(d330,21,21.75); picks=['留在宿舍']; GROUP.tick(GM); await new Promise(r=>setImmediate(r)); await new Promise(r=>setImmediate(r));
  G.day=SD.d0; G.hour=10; G.zone='dorm'; check('1. 留宿舍：4/3 白天走進宿舍＝「（宿舍的走廊很安靜。這次你知道，四天很快就過了。）」（只有那一天）', G.flags.SPRING_Y2==='dorm'&&EVENTS.check(ev('ev_spring_dorm_empty_y2'))&&ev('ev_spring_dorm_empty_y2').dialogue[0].text==='（宿舍的走廊很安靜。這次你知道，四天很快就過了。）'&&(G.day=SD.trip,!EVENTS.check(ev('ev_spring_dorm_empty_y2'))));
  fresh(d330,21.9,'dorm'); team(); run(d330,21,21.75); picks=['晚一點']; GROUP.tick(GM); await new Promise(r=>setImmediate(r)); await new Promise(r=>setImmediate(r));
  check('1. 晚一點再決定：今天不再問、明天同一時間再問', G.flags.SPRING_Y2==null&&!GROUP.springPending(G)&&(G.day=d330+1,G.hour=21.8,GROUP.springPending(G)));
  fresh(d330,21,'dorm'); team(); date('kexin'); run(d330,21,21.75); run(SD.dl,9,23.75); run(SD.dl+1,8,9);
  check('1. 4/1 以前沒回：SPRING_Y2 none、沒有旅行、可昕不回、群組照片排在 4/4 21:30', G.flags.SPRING_Y2==='none'&&!OUT.get(G,'ndl_trip_y2s2')&&!PHONE.sent(G,'kx_spring2_reply')&&PHONE.sent(G,'y2s2_spring_photo'));
  fresh(d330,21,'dorm'); run(d330,21,21.75); check('1. 不在麵店團、沒有交往：沒有邀約、不問', !PHONE.sent(G,'y2s2_spring_grp')&&!GROUP.springPending(G));
  fresh(SD.trip,9,'dorm'); team(); ev('ev_spring_y2_noodle').outingMissed(G,GM,{}); check('1. 選了麵店團又沒去（不去了）：一樣有群組照片', PHONE.sent(G,'y2s2_spring_photo'));

  // ===== 2. 1C-02 中秋 =====
  const m14=D('2027-09-14'), m15=D('2027-09-15');
  fresh(m14,20,'dorm'); team(); run(m14,20,21.25);
  { const q=OUT.get(G,'y3_midautumn'); check('2. 9/14 21:00 阿哲「明天中秋，河濱，六點」、9/15 18:00 公館的河濱（late 15 分鐘）', txt('g:noodle_team').slice(-1)[0]==='zhe:明天中秋，河濱，六點'&&!!q&&q.day===m15&&q.h===18&&q.late===0.25&&q.ev==='ev_midautumn_y3'); }
  fresh(m15,18,'gongguan'); team(); let M1=await play('ev_midautumn_y3',['擋風']);
  const bday='（九月十五日。中秋，也是以安的生日。）', pom=NAME('heroine_03')+'：（拿出一顆柚子，上面插了一根蠟燭）蛋糕店關了。……柚子可以。';
  check('2. M1 不知道她生日：那一句在語彤拿出柚子之後；柚子插蠟燭', M1.indexOf(pom)===0&&M1[1]===bday, JSON.stringify(M1.slice(0,2)));
  check('2. M1 三選一、「（吹熄了）……謝謝。風是你擋的，願望是我的。」、收尾、記 AN_BDAY_POMELO', JSON.stringify(opts[0])===JSON.stringify(['「生日快樂。」','「許什麼願？」','（幫她擋風）'])&&M1.includes(NAME('heroine_01')+'：（吹熄了）……謝謝。風是你擋的，願望是我的。')&&M1[M1.length-1]==='（柚子後來被阿哲剝了。蠟燭插過的那一瓣，沒有人吃。）'&&SOCIAL.has('heroine_01','AN_BDAY_POMELO')&&!M1.some(t=>/理由/.test(t)));
  fresh(m15,18,'gongguan'); team(); SOCIAL.remember('heroine_01','AN5_BIRTHDAY',''); M1=await play('ev_midautumn_y3',[1]);
  check('2. 知道她生日（AN5_BIRTHDAY）：第一句在開頭；「說出來就不準。我媽說的。」', M1[0]===bday&&M1[1]===pom&&M1.includes(NAME('heroine_01')+'：說出來就不準。我媽說的。'));
  fresh(m15,18,'gongguan'); team(); ev('ev_midautumn_y3').outingMissed(G,GM,{}); run(m15,21.5,21.75);
  check('2. M2 沒去：群組裡以安的照片＋「謝謝。柚子也可以。」', JSON.stringify(txt('g:noodle_team').slice(-2))===JSON.stringify(['heroine_01:（照片：柚子上插著蠟燭）','heroine_01:謝謝。柚子也可以。'])&&!SOCIAL.has('heroine_01','AN_BDAY_POMELO'));
  check('2. 人物面板：AN_BDAY_POMELO＝在中秋那天幫她過生日', SOCIAL.MEMORY_LABEL.AN_BDAY_POMELO==='在中秋那天幫她過生日');

  // ===== 3. 1C-03 寄到英國的那一箱 =====
  const x25=D('2027-12-25'), x26=D('2027-12-26');
  fresh(x25,20,'dorm'); team(); run(x25,20,21.25);
  { const q=OUT.get(G,'y3_xmas_box'); check('3. 12/25 21:00 阿哲兩則、12/26 18:30 麵店', JSON.stringify(txt('g:noodle_team').slice(-2))===JSON.stringify(['zhe:明天六點半麵店','zhe:帶一樣東西 不要超過手掌大'])&&!!q&&q.day===x26&&q.h===18.5&&q.late===0.25); }
  fresh(x26,18.5,'noodle'); team(); R('heroine_02','FAM'); let X1=await play('ev_xmas_y3_box',['杯墊']);
  check('3. X1 和芷若熟：阿哲寫地址、Alison「每個人放一樣東西。」、三選一放東西', X1[0]==='（麵店的長桌上放著一個紙箱。阿哲在上面用麥克筆寫倫敦的地址，寫錯一個字母，又塗掉。）'&&X1.includes(NAME('yu')+'：每個人放一樣東西。不能超過手掌大。')&&JSON.stringify(opts[0])===JSON.stringify(['「Café 的杯墊。」','「一包乖乖。」','「一張寫了字的便條。」']), JSON.stringify(opts[0]));
  check('3. X1 杯墊＝以安「她會知道是哪一家。」；語彤封箱「阿姨說，箱子不夠大的話，店裡有。」；XMAS_Y3_BOX coaster', X1.includes(NAME('heroine_01')+'：她會知道是哪一家。')&&has('（語彤從廚房拿來一卷膠帶，把箱子封了三圈。）')&&X1[X1.length-1]===NAME('heroine_03')+'：阿姨說，箱子不夠大的話，店裡有。'&&G.flags.XMAS_Y3_BOX==='coaster');
  fresh(x26,18.5,'noodle'); team(); date('heroine_02'); X1=await play('ev_xmas_y3_box',['只有你看得懂']);
  check('3. 和芷若交往中：多「（放一張只有你看得懂的便條）」→ Alison「……好，我們都不看。」', opts[0].length===4&&opts[0][3]==='（放一張只有你看得懂的便條）'&&X1.includes(NAME('yu')+'：……好，我們都不看。')&&G.flags.XMAS_Y3_BOX==='note');
  fresh(x26,18.5,'noodle'); team(); X1=await play('ev_xmas_y3_box');
  check('3. X2 不熟芷若：沒有選項、「（Alison 說這是要寄給一個在英國的朋友。你不認識她，還是放了一包乖乖。）」、XMAS_Y3_BOX snack', opts.length===0&&has('（Alison 說這是要寄給一個在英國的朋友。你不認識她，還是放了一包乖乖。）')&&G.flags.XMAS_Y3_BOX==='snack'&&has('（語彤從廚房拿來一卷膠帶，把箱子封了三圈。）'));
  fresh(x26,19,'dorm'); team(); ev('ev_xmas_y3_box').outingMissed(G,GM,{}); run(x26,22,22.25);
  check('3. 沒去：XMAS_Y3_BOX missed、22:00 群組照片', G.flags.XMAS_Y3_BOX==='missed'&&txt('g:noodle_team').slice(-1)[0]==='zhe:📷（一個紙箱，上面寫著倫敦的地址。）');
  { fresh(x26,18.5,'noodle'); team(); const TR={}; global.TERMEND={rec:(g,id)=>TR[id]||(TR[id]={}),contact(){}}; TR.Y3S1={picked:{who:'zhe',kind:'friend',day:x26-2}}; OUT.plan(G,{id:'te_Y3S1',ev:'ev_termend_dinner',day:x26+1,h:18.5});
    await play('ev_xmas_y3_box');
    check('3. 這學期接了阿哲的期末飯：這一場就算那一頓（TERMEND done、排好的那一頓不再出發）', TR.Y3S1.done&&TR.Y3S1.done.who==='zhe'&&TR.Y3S1.done.via==='ev_xmas_y3_box'&&OUT.get(G,'te_Y3S1').state==='done');
    fresh(x26,18.5,'noodle'); team(); TR.Y3S1={picked:{who:'heroine_02',kind:'heart',day:x26-2}}; OUT.plan(G,{id:'te_Y3S1',ev:'ev_termend_dinner',day:x26+1,h:18.5}); await play('ev_xmas_y3_box');
    check('3. 接的是別人的期末飯：不動', !TR.Y3S1.done&&OUT.get(G,'te_Y3S1').state==='planned'); delete global.TERMEND; }

  // ===== 4. 1C-04 哲 4＋冠軍賽 =====
  const {d:f28,g:f29}=GROUP.finalDays();
  fresh(f28,20,'dorm'); team(); R('zhe','FRI'); run(f28,20,21.25);
  check('4. 4/28 21:00 群組「明天晚上七點，冠軍賽 來喊」、排 4/29 19:00 新體育館', txt('g:noodle_team').slice(-1)[0]==='zhe:明天晚上七點，冠軍賽 來喊'&&!!OUT.get(G,'y3_final')&&OUT.get(G,'y3_final').day===f29&&OUT.get(G,'y3_final').h===19);
  run(f28,21.5,22.75); check('4. 23:00 以前沒有哲 4', !PHONE.sent(G,'y3_zhe4'));
  run(f28,23,23.25); { const m=PHONE.byAsk(G,'y3_zhe4');
    check('4. Z1 23:00 阿哲「你在宿舍嗎」；在宿舍＝回「（下樓）」（不替玩家傳那一句）', txt('p:zhe').slice(-1)[0]==='zhe:你在宿舍嗎'&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["（下樓）"]'&&m.ask.opts[0].post===false); }
  PHONE.answer(G,'y3_zhe4',0); run(f28,23.25,23.5);
  { const q=OUT.get(G,'y3_zhe4'); check('4. 下樓：十分鐘後宿舍樓下的便利商店外（一定要出發）', !!q&&q.place==='宿舍樓下的便利商店外'&&Math.abs(q.h-(23.25+1/6))<0.01&&q.must===true&&G.flags.ZHE4_REPLY==='down', JSON.stringify(q)); }
  G.hour=23.42; let Z1=await play('ev_zhe_said_it',[0]);
  check('4. Z1「（兩瓶鋁箔包紅茶，一瓶推過來）我爸明天要上來看。」…「有事。我很緊張。」、三選一', Z1[0]===NAME('zhe')+'：（兩瓶鋁箔包紅茶，一瓶推過來）我爸明天要上來看。'&&Z1.includes(NAME('zhe')+'：有事。我很緊張。')&&JSON.stringify(opts[0])===JSON.stringify(['「嗯。我在。」','「你要不要跟你爸說你很緊張？」','（什麼都不說，坐著）'])&&SOCIAL.has('zhe','ZHE_SAID_IT'), JSON.stringify(opts[0]));
  check('4. 選「嗯。我在。」：坐到十二點半（00:30）、「我第一次講這麼多我自己的事。……」', Math.abs(G.hour-24.5)<0.02&&Z1.includes(NAME('zhe')+'：我第一次講這麼多我自己的事。……講完好像沒那麼緊張了。'), G.hour);
  fresh(f28,23,'dorm'); R('zhe','FRI'); G.home={at:true}; run(f28,23,23.25); { const m=PHONE.byAsk(G,'y3_zhe4'); check('4. 在家：回「我在家。」→ 阿哲改打視訊', !!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["我在家。"]'); }
  PHONE.answer(G,'y3_zhe4',0); run(f28,23.25,23.5); { const q=OUT.get(G,'y3_zhe4'); check('4. 視訊：「接起來：阿哲的視訊」、同一段話（沒有紅茶那一句的動作）', !!q&&q.verb==='接起來'&&q.place==='視訊'); }
  G.hour=23.3; Z1=await play('ev_zhe_said_it',[2]);
  check('4. 視訊版：開頭「（視訊裡，他坐在宿舍的樓梯間，手上一瓶鋁箔包紅茶。）」（AA_336 C10）→「我爸明天要上來看。」、選坐著＝十二點站起來「走啦。謝了。明天你要來喔。……」（在家照原句）', Z1[0]==='（視訊裡，他坐在宿舍的樓梯間，手上一瓶鋁箔包紅茶。）'&&Z1[1]===NAME('zhe')+'：我爸明天要上來看。'&&has('（他也沒說話。十二點的時候他站起來。）')&&Z1.includes(NAME('zhe')+'：走啦。謝了。明天你要來喔。坐我爸旁邊，他不認識別人。')&&Math.abs(G.hour-24)<0.02, JSON.stringify(Z1.slice(0,2)));
  G.hour=23.3; Z1=await play('ev_zhe_said_it',[0]);
  check('4. 視訊版選「嗯。我在。」：「（他把紅茶喝完。你們講到十二點半。……）」（不是當面版的再去買兩瓶）→ 阿哲那句照舊', has('（他把紅茶喝完。你們講到十二點半。他講了很多，大部分是高雄、他爸、高中的球隊。）')&&!has('（他點頭，把紅茶喝完，再去買兩瓶。兩個人坐到十二點半。他講了很多，大部分是高雄、他爸、高中的球隊。）')&&Z1.includes(NAME('zhe')+'：我第一次講這麼多我自己的事。……講完好像沒那麼緊張了。'));
  // 在臺北的外面（AA_336 C10）：回「我在外面。二十分鐘回宿舍。」→「好 我在樓下」→ 二十分鐘後宿舍樓下的便利商店外（當面版）、演完回到房間
  fresh(f28,23,'gongguan'); R('zhe','FRI'); run(f28,23,23.25); { const m=PHONE.byAsk(G,'y3_zhe4'); check('4. C10 在臺北的外面（公館）：回「我在外面。二十分鐘回宿舍。」', !!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["我在外面。二十分鐘回宿舍。"]', m&&JSON.stringify(m.ask.opts)); }
  PHONE.answer(G,'y3_zhe4',0); const tOut=G.hour; run(f28,23.25,23.5);
  { const q=OUT.get(G,'y3_zhe4'); check('4. C10 回了以後：阿哲「好 我在樓下」；二十分鐘後宿舍樓下的便利商店外（一定要出發）、ZHE4_REPLY out', txt('p:zhe').includes('zhe:好 我在樓下')&&txt('p:zhe').some(t=>/我在外面。二十分鐘回宿舍。$/.test(t))&&!!q&&q.place==='宿舍樓下的便利商店外'&&Math.abs(q.h-(tOut+1/3))<0.01&&q.must===true&&G.flags.ZHE4_REPLY==='out', JSON.stringify([txt('p:zhe'),q]));
    said=[]; opts=[]; picks=[2]; await OUT.go(GM,q); Z1=lines();
    check('4. C10 出發：當面版（「（兩瓶鋁箔包紅茶，一瓶推過來）我爸明天要上來看。」）、沒有視訊的開頭；演完回到宿舍房間', Z1.includes(NAME('zhe')+'：（兩瓶鋁箔包紅茶，一瓶推過來）我爸明天要上來看。')&&!has('（視訊裡，他坐在宿舍的樓梯間，手上一瓶鋁箔包紅茶。）')&&G.zone==='dorm'&&q.state==='done', JSON.stringify([Z1.slice(0,2),G.zone,q.state])); }
  // 人不在臺北（例如出遊）＝在家的視訊版：捷運自由出行去了臺北市以外（測試用的 TRIP）
  global.TRIP={at:g=>!!(g.trip&&g.trip.spot),spot:id=>({id,area:id==='D24'?'宜蘭縣':'臺北市'})};
  fresh(f28,23,'gongguan'); R('zhe','FRI'); G.trip={spot:'D24'}; run(f28,23,23.25); { const q=OUT.get(G,'y3_zhe4'); check('4. C10 人不在臺北（自由出行在宜蘭）：視訊版（阿哲直接打）、沒有「你在宿舍嗎」的回覆', !!q&&q.verb==='接起來'&&q.place==='視訊'&&G.flags.ZHE4_REPLY==='away'&&!PHONE.sent(G,'y3_zhe4'), JSON.stringify(q)); }
  G.hour=23.3; Z1=await play('ev_zhe_said_it',[2]); check('4. C10 不在臺北的視訊：開頭視訊那句、選坐著照原句（明天你要來喔）', Z1[0]==='（視訊裡，他坐在宿舍的樓梯間，手上一瓶鋁箔包紅茶。）'&&Z1.includes(NAME('zhe')+'：走啦。謝了。明天你要來喔。坐我爸旁邊，他不認識別人。'));
  fresh(f28,23,'gongguan'); R('zhe','FRI'); G.trip={spot:'D04'}; run(f28,23,23.25); { const m=PHONE.byAsk(G,'y3_zhe4'); check('4. C10 自由出行在臺北市：照「在臺北的外面」', !!m&&m.ask.opts[0].t==='我在外面。二十分鐘回宿舍。'); }
  delete global.TRIP;
  fresh(f28,23,'dorm'); R('zhe','FAM'); run(f28,23,23.5); check('4. 和阿哲不到 FRIEND：沒有哲 4', !PHONE.sent(G,'y3_zhe4')&&!OUT.get(G,'y3_zhe4'));
  fresh(f28,23,'dorm'); R('zhe','FRI'); run(f28,23,23.5); run(f28,23.75,24.25); check('4. 不回：沒有、ZHE_SAID_IT 沒有值', !OUT.get(G,'y3_zhe4')&&!SOCIAL.has('zhe','ZHE_SAID_IT')&&!PHONE.askOpen(G,PHONE.byAsk(G,'y3_zhe4')));
  // 冠軍賽
  fresh(f29,19,'gym'); team(); R('classmate_mingxuan','FAM'); let F1=await play('ev_final_game_y3',['出國']);
  check('4. Z2 冠軍賽：「（最後一顆，阿哲傳給明軒。他們贏了。）」、阿哲「你拿。最後那顆是你的。」、明軒「……好重。」', has('（最後一顆，阿哲傳給明軒。他們贏了。）')&&F1.includes(NAME('zhe')+'：（把獎盃塞給明軒）你拿。最後那顆是你的。')&&F1.includes(NAME('classmate_mingxuan')+'：……好重。'));
  check('4. Z2 選「那出國呢？」：「……交換那個，我放棄了。畢業以後自己存錢去。」、SAW_HIM_TRY（不是「獎學金」）', F1.includes(NAME('classmate_mingxuan')+'：……交換那個，我放棄了。畢業以後自己存錢去。')&&SOCIAL.has('classmate_mingxuan','SAW_HIM_TRY')&&!F1.some(t=>/獎學金/.test(t)));
  check('4. 賽後 20:40 麵店：「阿姨：你很會吃喔。」「阿哲爸爸：我兒子都在這裡吃喔？……難怪。」；FINAL_GAME_Y3 went', F1.includes('阿姨：你很會吃喔。')&&F1.includes('阿哲爸爸：我兒子都在這裡吃喔？……難怪。')&&F1[F1.length-1]==='（那天，阿姨晚了一個小時才拉下鐵門。）'&&G.hour>=20+40/60-0.01&&G.flags.FINAL_GAME_Y3==='went');
  fresh(f29,19,'gym'); team(); F1=await play('ev_final_game_y3');
  check('4. 和明軒不熟：沒有「你看到了喔」、沒有選項', !F1.some(t=>/你看到了喔/.test(t))&&opts.length===0&&has('（阿哲的爸爸在場邊沒有說話，只拍了五十張照片。）'));
  fresh(f29,19,'gym'); team(); R('classmate_mingxuan','FAM'); await play('ev_final_game_y3',['請客']);
  /* 2026-10-28 改：AA_497 第 8 節第 4 點（企劃線 60fc3b9a3）明軒的滷蛋只留 M1、M2、德文三處——冠軍那一串改「一碗大的／大碗」（旗標名 MX_EGG* 不改；tests/aa497_supporting_unit.js 第 8 節）*/
  check('4. 選「冠軍耶，明天請客。」：「好。請你吃一碗大的。」（AA_497 第 8 節）、記欠的那一碗（MX_EGG_DAY；當週不補、下週一起補）', has('好。請你吃一碗大的。')&&!has('好。請你吃滷蛋。一顆。')&&G.flags.MX_EGG_DAY===f29&&(G.day=f29+1,!GROUP.eggDue(G))&&(G.day=f29+2,GROUP.eggDue(G)));
  { const e=ev('ev_mx_egg_y3'); check('4. 補那一碗（ev_mx_egg_y3）：在麵店、明軒在旁邊（npcNear）才演；「（他把一碗大碗的乾麵推到你面前。）」「冠軍那天欠的。大碗。」（AA_497 第 8 節）', e.trigger==='auto'&&e.location==='noodle'&&e.npcNear==='classmate_mingxuan'&&e.dialogue[0].text==='（他把一碗大碗的乾麵推到你面前。）'&&e.dialogue[1].text==='冠軍那天欠的。大碗。'); }
  fresh(f29,19.5,'dorm'); team(); ev('ev_final_game_y3').outingMissed(G,GM,{}); run(f29,21.5,21.75);
  check('4. 沒去：FINAL_GAME_Y3 missed、21:30 群組照片', G.flags.FINAL_GAME_Y3==='missed'&&txt('g:noodle_team').slice(-1)[0]==='zhe:📷（獎盃在明軒手上。阿哲在旁邊比讚。）');
  // 日本路線
  fresh(f28,20,'dorm',{EXCHANGE_ROUTE:'JP'}); team(); R('zhe','FRI'); R('classmate_mingxuan','FAM');
  check('4. 前置：日本路線 4/28 人在日本', STORY.abroad(G));
  run(f28,20,24.25); { const q=OUT.get(G,'y3_zhe4');
    check('4. Z3 日本路線：沒有冠軍賽的出遊；台灣 23:00＝當地 0:00（AA_341 J-S13）阿哲打視訊（接起來）', !OUT.get(G,'y3_final')&&!!q&&q.verb==='接起來'&&q.place==='視訊'&&G.flags.ZHE4_REPLY==='jp'&&!PHONE.sent(G,'y3_zhe4')); }
  G.hour=24.1; Z1=await play('ev_zhe_said_it',[2]); check('4. 日本路線視訊選坐著（AA_336 C10；時間照 AA_377 第 2 項）：「（他也沒說話。臺灣十二點，你這邊一點。他把手機拿起來。）」「走啦。謝了。明天記得看直播。」、沒有「明天你要來喔」、開頭是視訊那句', !Z1.some(t=>/明天你要來喔/.test(t))&&has('（他也沒說話。臺灣十二點，你這邊一點。他把手機拿起來。）')&&!has('（他也沒說話。十二點的時候他站起來。）')&&Z1.includes(NAME('zhe')+'：走啦。謝了。明天記得看直播。')&&Z1[0]==='（視訊裡，他坐在宿舍的樓梯間，手上一瓶鋁箔包紅茶。）', JSON.stringify(Z1));
  run(f29,18,21.75);
  check('4. Z3 直播：FINAL_GAME_Y3 stream；賽後明軒兩則（台灣 20:40＝當地 21:40，AA_341 J-S13）＋「恭喜！」「那出國呢？」', G.flags.FINAL_GAME_Y3==='stream'&&JSON.stringify(txt('p:classmate_mingxuan').slice(-2))===JSON.stringify(['classmate_mingxuan:冠軍。我九點家教，先走了。','classmate_mingxuan:……你看到了喔。我今天很用力。'])&&JSON.stringify((PHONE.byAsk(G,'y3_mx_stream')||{ask:{opts:[]}}).ask.opts.map(o=>o.t))==='["恭喜！","那出國呢？"]');
  { said=[]; G.hour=21; const st=GROUP.tick(GM); await new Promise(r=>setImmediate(r)); await new Promise(r=>setImmediate(r)); const n1=said.length; const st2=GROUP.tick(GM);
    check('4. C11 日本路線看直播：一句旁白「（日本晚上八點。你在宿舍的書桌前開著系上的直播，畫面一直卡。最後一顆，阿哲傳給明軒。他們贏了。）」（只演一次）', st===true&&n1===1&&said[0].who===null&&said[0].t==='（日本晚上八點。你在宿舍的書桌前開著系上的直播，畫面一直卡。最後一顆，阿哲傳給明軒。他們贏了。）'&&st2===false&&G.flags.FINAL_STREAM_SEEN===true, JSON.stringify([st,st2,said])); }
  G.hour=21.75; PHONE.answer(G,'y3_mx_stream',0); check('4. 回「恭喜！」：「回來請你吃一碗大的。」（AA_497 第 8 節）、回國以前不補、8/5 回國以後補', txt('p:classmate_mingxuan').slice(-1)[0]==='classmate_mingxuan:回來請你吃一碗大的。'&&!GROUP.eggDue(G)&&(G.day=D('2028-08-06'),GROUP.eggDue(G)));
  check('4. 人物面板：ZHE_SAID_IT、SAW_HIM_TRY 有名字；SAW_HIM_TRY＝「聽他說交換放棄了，畢業以後自己存錢去」（AA_336 C13）', !!SOCIAL.MEMORY_LABEL.ZHE_SAID_IT&&SOCIAL.MEMORY_LABEL.SAW_HIM_TRY==='聽他說交換放棄了，畢業以後自己存錢去');
  fresh(f29,19,'gym'); team(); run(f29,19,20); check('4. C11 台灣路線（去冠軍賽的）：沒有直播的旁白', !GROUP.streamDue(G));

  // ===== 5. 1C-05 子晴、芷若同一天畢業 =====
  const {inv:g2,d:g3}=GROUP.gradDays();
  fresh(g2,20,'dorm'); R('heroine_04','FRI'); R('heroine_02','FAM'); run(g2,20,21.25);
  { const m=PHONE.byAsk(G,'y3_zq_grad'); check('5. 6/2 21:00 子晴三則＋回覆「去。」「那天我有事。」', JSON.stringify(txt('p:heroine_04'))===JSON.stringify(['heroine_04:明天早上畢業典禮','heroine_04:九點 椰林大道','heroine_04:你要來喔'])&&!!m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["去。","那天我有事。"]', JSON.stringify(txt('p:heroine_04'))); }
  PHONE.answer(G,'y3_zq_grad',0); run(g2,21.5,21.75);
  { const q=OUT.get(G,'y3_zq_grad'); check('5. 回「去。」：「好 那你負責拍」、6/3 09:00 椰林大道（到 11:00）', txt('p:heroine_04').slice(-1)[0]==='heroine_04:好 那你負責拍'&&!!q&&q.day===g3&&q.h===9&&q.late===2); }
  fresh(g3,9,'campus'); R('heroine_04','FRI'); R('heroine_02','FAM'); let Q1=await play('ev_zq_zr_graduation');
  check('5. G1 上午：「妳閉眼了啦。再一張。」「妳拍歪了。」「（把手機塞給你）你拍我們兩個。」；GRAD_ZQ_ZR zq', Q1.includes(NAME('heroine_04')+'：妳閉眼了啦。再一張。')&&Q1.includes(NAME('heroine_02')+'：妳拍歪了。')&&Q1[Q1.length-1]===NAME('heroine_04')+'：（把手機塞給你）你拍我們兩個。'&&G.flags.GRAD_ZQ_ZR==='zq'&&!Q1.some(t=>/我們兩個。$/.test(t)&&t.indexOf('你拍')<0), JSON.stringify(Q1));
  G.hour=14.5; G.zone='cafe'; check('5. 下午 14:00 以後第一次進 Café（芷若 FAMILIAR 以上）', GROUP.zrCafeDue(G)&&EVENTS.check(ev('ev_zhiruo_graduation_cafe')));
  let Z12=await play('ev_zhiruo_graduation_cafe',[1]);
  check('5. G2 芷若 Z12：「九月，我去英國念電影研究。一年。」…三選一、「……嗯。她說她要學著用視訊。」、IMPORTANT_CONVERSATION、GRAD_ZQ_ZR both', Z12.includes(NAME('heroine_02')+'：九月，我去英國念電影研究。一年。')&&JSON.stringify(opts[0])===JSON.stringify(['「台中的影印店，我可以去印東西嗎？」','「妳媽一定很開心。」','「明信片還要寄嗎？」'])&&Z12.includes(NAME('heroine_02')+'：……嗯。她說她要學著用視訊。')&&SOCIAL.has('heroine_02','IMPORTANT_CONVERSATION')&&G.flags.GRAD_ZQ_ZR==='both');
  G.hour=13; check('5. 14:00 以前不演', !GROUP.zrCafeDue(G));
  fresh(g2,21,'dorm'); R('heroine_04','FRI'); date('heroine_04'); run(g2,21,21.25);
  check('5. 已經和子晴交往：四句「……你來的話我會很緊張」「所以你要來」', JSON.stringify(txt('p:heroine_04'))===JSON.stringify(['heroine_04:明天早上畢業典禮','heroine_04:九點 椰林大道','heroine_04:你來的話我會很緊張','heroine_04:所以你要來']));
  fresh(g3,9,'campus'); date('heroine_04'); R('heroine_02','FAM'); Q1=await play('ev_zq_zr_graduation');
  check('5. 交往中：先「欸不是，你站過來一點。」「我們兩個。」（BB_119 1c-2），再接 G5', Q1[0]===NAME('heroine_04')+'：欸不是，你站過來一點。'&&Q1[1]===NAME('heroine_04')+'：我們兩個。'&&Q1[2]==='（子晴穿著學士服，學士帽歪的，吉他袋還是背著。她在幫芷若拍照，拍了二十張。）');
  fresh(g2,21,'dorm'); R('heroine_04','FRI'); run(g2,21,21.25); PHONE.answer(G,'y3_zq_grad',1); run(g2,21.5,23.75); run(g3,8,12.75);
  check('5. 沒去上午：12:30 子晴三則「（一張自拍，學士帽歪的）」「你沒來」「帽子是故意歪的 不要笑」；GRAD_ZQ_ZR photo', JSON.stringify(txt('p:heroine_04').slice(-3))===JSON.stringify(['heroine_04:（一張自拍，學士帽歪的）','heroine_04:你沒來','heroine_04:帽子是故意歪的 不要笑'])&&G.flags.GRAD_ZQ_ZR==='photo'&&!OUT.get(G,'y3_zq_grad'));
  fresh(g2,20,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_04','FRI'); R('heroine_02','FAM'); run(g2,20,23.5); run(g3,8,16.25);
  check('5. G3 日本路線：沒有邀約；子晴的自拍、芷若「子晴拍的。她拍了二十張，這是唯一一張我沒閉眼的。」（台灣 15:00＝當地 16:00，AA_341 J-S13）；Café 那一場不演', !PHONE.sent(G,'y3_zq_grad')&&txt('p:heroine_04').includes('heroine_04:📷（一張自拍，學士帽歪的）')&&txt('p:heroine_02').slice(-1)[0]==='heroine_02:子晴拍的。她拍了二十張，這是唯一一張我沒閉眼的。'&&G.flags.GRAD_ZQ_ZR==='photo'&&(G.zone='cafe',!GROUP.zrCafeDue(G)));
  fresh(g2,20,'dorm'); R('heroine_04','FAM'); run(g2,20,23); check('5. 和子晴不到 FRIEND：沒有邀約', !PHONE.sent(G,'y3_zq_grad'));

  // ===== 6. 1C-06 最後一學期 =====
  const l22=D('2029-02-22'), l25=D('2029-02-25');
  fresh(l22,16,'dorm'); team(); run(l22,16,16.75); check('6. 17:00 以前群組名字照舊', PHONE.title(G,'g:noodle_team')==='麵店團');
  run(l22,17,17.25);
  { const q=OUT.get(G,'y4_last_term'); check('6. L1 17:00 群組改名「最後一學期」＋系統字＋阿哲「開學第一頓 七點，長桌」、19:00 麵店', PHONE.title(G,'g:noodle_team')==='最後一學期'&&JSON.stringify(TH('g:noodle_team').slice(-2).map(m=>(m.from||'')+':'+m.text))===JSON.stringify([':（阿哲把群組名稱改成「最後一學期」。）','zhe:開學第一頓 七點，長桌'])&&!!q&&q.day===l22&&q.h===19&&q.late===0.25); }
  fresh(l22,19,'noodle'); team(); let T1=await play('ev_last_term_first_dinner',[1]);
  check('6. L1 麵店：Alison「改回來啦。很難過耶。」、阿哲「……過幾天再改。」、二選一、「換什麼換。」', T1.includes(NAME('yu')+'：改回來啦。很難過耶。')&&T1.includes(NAME('zhe')+'：……過幾天再改。')&&JSON.stringify(opts[0])===JSON.stringify(['「一樣的。」','「今天換一個。」'])&&T1.includes('阿姨：換什麼換。')&&T1[T1.length-1]==='（大家吃完，沒有人先站起來。）'&&G.flags.LAST_TERM_DINNER==='went');
  fresh(l22,17,'dorm'); team(); run(l22,17,17.25); run(l25,20,20.75); check('6. 2/25 21:00 以前還是「最後一學期」', PHONE.title(G,'g:noodle_team')==='最後一學期');
  run(l25,21,21.25);
  check('6. L2 2/25 21:00 改回「麵店團」＋系統字＋「改回來了」「Alison 說很難過」', PHONE.title(G,'g:noodle_team')==='麵店團'&&JSON.stringify(TH('g:noodle_team').slice(-3).map(m=>(m.from||'')+':'+m.text))===JSON.stringify([':（阿哲把群組名稱改回「麵店團」。）','zhe:改回來了','zhe:Alison 說很難過']));
  fresh(l22,17,'dorm'); team(); run(l22,17,17.25); G.hour=19.5; ev('ev_last_term_first_dinner').outingMissed(G,GM,{}); run(l22,21.5,21.75);
  check('6. 沒去：LAST_TERM_DINNER missed、21:30 群組照片', G.flags.LAST_TERM_DINNER==='missed'&&txt('g:noodle_team').slice(-1)[0]==='zhe:📷（長桌上的碗，跟大一的時候一樣多。）');
  fresh(l22,17,'dorm'); run(l22,17,17.5); check('6. 不在麵店團：不改名、不揪', !PHONE.sent(G,'y4_last_term_ask'));

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
