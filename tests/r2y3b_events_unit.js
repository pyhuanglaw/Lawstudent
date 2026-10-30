// 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54＋第 3 節大三寒暑假的停留日（src/data/r2y3b_events.js、src/r2y3b3d.js）——不需要瀏覽器。
//   照 AA 給 BB 的驗收情境寫（每件至少一項）；台詞不寫死全文的地方用「有沒有出現」查。最後：接線（index.html 的順序）。
// 修改前：沒有這些事件、沒有 R2Y3B（第 0 項 FAIL）。用法：node tests/r2y3b_events_unit.js
// 2026-10-22 AA_296 2-3-1 ②（企劃線 3f406dbc）改了期待值：Q15-Q1 回答.exe 最後多兩個場面裡的選項（這裡選「還沒想好怎麼回」，之後手機回貼紙＝她馬上打來）；
//   Q15-Q2 收到檔案的隔天 21:00 那一則改成她打來（沒接過 30 分鐘＝原本那一則私訊）。場面裡選貼紙、逐字對稿在 tests/aa296_phone_live_unit.js。
// 2026-10-21 日本那一學期（AA_341 J-S7／J-S13，src/jp3d.js）：日本路線人在日本＝遊戲時鐘是日本時間，日本路線的時間都改成當地（原本照臺灣時鐘：J0、G0、T2、S0、S、F0、F、Y5、Z11、B、X6、N0、N、N2、K20、L2）。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|DATE|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES|VAC|VAC_DATA|R2Y3B|R2Y3B_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ if(!CG_REGISTRY[id]) return false; cgs.push(id); return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[], cards=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){ G.weekday=wdOf(G.day); },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cgs=[]; caps=[]; toasts=[]; cards=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const ct=id=>{ G.contacts[id]=1; };
const grpJoin=()=>PHONE.join(G,'noodle_team','麵店團');
const has=t=>said.some(s=>s.t===t), lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const txt=th=>(G.msgs||[]).filter(m=>m.th===th).map(m=>(m.from||'')+':'+m.text);
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const run=async id=>{ said=[]; opts=[]; await EVENTS.run(ev(id)); };
const answer=(id,k)=>PHONE.answer(G,id,k);
const nested=id=>{ const m=PHONE.byAsk(G,id); return m; };
const mine=(th,first)=>{ const L=txt(th), i=L.indexOf(first); return i<0?[]:L.slice(i); };   /* 只看這一批的訊息（同一天別的規則也會傳）*/
const IDS=['ev_y3s2_first_meal','ev_y3s2_228','ev_an_azalea_y3','ev_yu_club_money','ev_kexin_k18','ev_kexin_k18_call','ev_xun_path','ev_yu_alone_breakfast','ev_yu_alone_call','ev_an_konbini','ev_liheng_japan','ev_y3s2_roof_toast','ev_an_sakura_riverbank','ev_far_call_jp','ev_yu_alone_movie','ev_yu_alone_movie_noodle','ev_yu_alone_movie_video','ev_zhiruo_third_row','ev_kexin_birthday_y3','ev_xinci_first_place','ev_xinci_first_place_video','ev_an_town_notice','ev_an_town_notice_repair','ev_kexin_k20','ev_kexin_k20_call','ev_fangyt_tickets','ev_zhiruo_f3_cafe','ev_x1_moveout_us','ev_an_abroad_video','ev_an_tanabata','ev_an_airport_y3','ev_an_notebook','ev_an_white_day','ev_an_far_video','ev_zhiruo_twelve_slips'];
(async()=>{
  check('0. 事件都在、R2Y3B 掛上去了', IDS.every(id=>!!ev(id))&&typeof R2Y3B!=='undefined'&&STORY.TICKS.length>0&&STORY.PHONE_RULES.length>0, IDS.filter(id=>!ev(id)).join());
  if(fails){ console.log('FAILED '+fails); process.exit(1); }

  // ---------- 2-Y3-26 開學第一頓（大三下）----------
  fresh('2028-02-22',16.9,'dorm'); grpJoin(); ['zhe','yu','heroine_01','heroine_03'].forEach(id=>R(id,'FRI')); rules();
  check('D0. 2/22 16:54 還沒揪', !PHONE.sent(G,'y3s2_first_meal_ask'));
  at('2028-02-22',17.05); rules(); const fm=OUT.get(G,'y3s2_first_meal');
  check('D3. 2/22（二）17:00 阿哲在群組「大三下第一頓 七點 長桌」；排 2/22 19:00 麵店（不是 2/17）', txt('g:noodle_team').includes('zhe:大三下第一頓 七點 長桌')&&!!fm&&fm.day===D('2028-02-22')&&fm.h===19&&CALENDAR.dateOf(fm.day).wd===2);
  picks=[1]; await run('ev_y3s2_first_meal');
  check('D1. 去了：「一個月又三天。三月二十五號的飛機。」、語彤「週四我不在店裡了」、選「週四妳去哪？」→「……去問人問題。」；Y3S2_FIRST_MEAL', has('一個月又三天。三月二十五號的飛機。')&&has('（端麵過來）……今天週二。週四我不在店裡了。')&&has('……去問人問題。')&&!has('（轉向你）你也是。一個月又三天。')&&G.flags.Y3S2_FIRST_MEAL===true, JSON.stringify(lines()));
  fresh('2028-02-22',19,'dorm',{EXCHANGE_ROUTE:'JP'}); ['zhe','heroine_01'].forEach(id=>R(id,'FRI')); date('heroine_01'); picks=[0]; await run('ev_y3s2_first_meal');
  check('D2. 日本路線：阿哲「（轉向你）你也是。一個月又三天。」；不認識語彤：沒有她那一句、只有「先吃。」', has('（轉向你）你也是。一個月又三天。')&&!has('（端麵過來）……今天週二。週四我不在店裡了。')&&opts[0].length===1&&has('對。先吃。'));
  fresh('2028-02-22',17.1,'dorm'); grpJoin(); R('zhe','FRI'); rules(); at('2028-02-22',19.3); OUT.tick(GM); at('2028-02-22',21.6); rules();
  check('D. 沒去：21:30 群組照片', txt('g:noodle_team').includes('zhe:（照片：長桌上六碗麵，以安那碗加了兩顆滷蛋）')&&OUT.get(G,'y3s2_first_meal').state==='missed');

  // ---------- 2-Y3-27 228 河濱 ----------
  fresh('2028-02-27',21.1,'dorm'); grpJoin(); ['zhe','yu','heroine_01','classmate_bohan'].forEach(id=>R(id,'FRI')); rules(); const q228=OUT.get(G,'y3s2_228');
  check('H0. 2/27 21:00 阿哲兩則；排 2/28 14:00 公館河濱', txt('g:noodle_team').join('|')==='zhe:明天放假 河濱 兩點|zhe:Alison 說要帶風箏'&&q228&&q228.day===D('2028-02-28')&&q228.h===14);
  picks=[1]; await run('ev_y3s2_228');
  check('H1. 去了：以安在場（「三月二十五號以前，還有四個週末。」、柏翰「三個半」）', has('（坐在階梯上，手帳攤開）三月二十五號以前，還有四個週末。')&&has('三個半。今天放假，不算。')&&G.flags.Y3S2_228===true);
  check('H2. 選「（坐到以安旁邊）」：手帳上四個空的週末', has('……你也要算嗎？')&&has('（她把手帳轉過來：四個週末，每一格都還空著。）'), JSON.stringify(opts[0]));
  fresh('2028-02-27',21.1,'dorm'); grpJoin(); R('zhe','FRI'); R('yu','FRI'); rules(); at('2028-02-28',14.3); OUT.tick(GM); at('2028-02-28',17.6); rules();
  check('H. 沒去：17:30 Alison 在群組（風箏卡在樹上）', txt('g:noodle_team').includes('yu:（照片：河濱的天空，一個風箏卡在樹上）')&&txt('g:noodle_team').includes('yu:是風的問題！！'));

  // ---------- 2-Y3-28 杜鵑花第三張 ----------
  { const s=STORY.schedEnt(CHARACTERS.heroine_01,Object.assign(fresh('2028-03-09',12.2,'campus'),{})); check('Z0. 3/9 12:10 以安在椰影大道（作息只有這一天）', !!s&&s.zone==='campus'&&/2-Y3-28/.test(s.note||''), JSON.stringify(s)); }
  { G.day=D('2028-03-16'); G.weekday=wdOf(G.day); const s=STORY.schedEnt(CHARACTERS.heroine_01,G); check('Z0. 隔週同一時間不是那一筆', !s||!/2-Y3-28/.test(s.note||'')); }
  fresh('2028-03-09',12.2,'campus'); R('heroine_01','FAM'); check('Z1. 12:20 走過椰影大道和她說話：可以演', EVENTS.check(ev('ev_an_azalea_y3')));
  await run('ev_an_azalea_y3');
  check('Z1. 「第三張。你幫我拍。」…「可以。花有拍到。」；記 AN3_AZALEA；沒交往＝沒有印出來那句', has('第三張。你幫我拍。')&&has('可以。花有拍到。')&&SOCIAL.has('heroine_01','AN3_AZALEA')&&!has('出發前我把這三張印出來帶走。'));
  fresh('2028-03-09',12.2,'campus'); date('heroine_01'); await run('ev_an_azalea_y3');
  check('Z2. 交往中：「出發前我把這三張印出來帶走。」', has('出發前我把這三張印出來帶走。'));
  at('2028-03-09',12.7); check('Z. 12:40 以後不演', !EVENTS.check(ev('ev_an_azalea_y3')));
  fresh('2028-03-09',12.7,'dorm'); grpJoin(); R('heroine_01','FAM'); rules();
  check('Z3. 12:40 群組「（照片：杜鵑花。和前兩年同一個位置。）」「第三張。」', txt('g:noodle_team').join('|')==='heroine_01:（照片：杜鵑花。和前兩年同一個位置。）|heroine_01:第三張。');
  fresh('2028-03-09',12.7,'dorm'); R('heroine_01','FRI'); ct('heroine_01'); rules();
  check('Z3. 不在群組、FRIEND 以上：私訊同兩則', txt('p:heroine_01').join('|')==='heroine_01:（照片：杜鵑花。和前兩年同一個位置。）|heroine_01:第三張。');

  // ---------- 2-Y3-29 C6 Alison 的社團經費 ----------
  fresh('2028-03-15',21.1,'dorm',{U_ASSOC:true}); grpJoin(); R('yu','FAM'); rules();
  check('C0. 3/15 21:00 Alison 三則（欸／你明天中午有空嗎／社團的錢的事 想問你）、兩個回覆', txt('p:yu').join('|')==='yu:欸|yu:你明天中午有空嗎|yu:社團的錢的事 想問你'&&PHONE.byAsk(G,'y3_yu_c6').ask.opts.length===2);
  answer('y3_yu_c6',0); at('2028-03-16',12.6); rules();
  { const s=STORY.schedEnt(CHARACTERS.yu,G); check('C0. 回「有。」：3/16 12:30 Alison 在霖澤館一樓（作息）', txt('p:yu').includes('yu:好！！')&&!!s&&s.zone==='linze'); }
  G.zone='linze'; check('C0. 12:30～13:00 在霖澤館：到了（事件另外要 Alison 在場 npcPresent）', R2Y3B.c6MeetDue(G)&&ev('ev_yu_club_money').npcPresent==='yu');
  picks=[2]; await run('ev_yu_club_money');
  check('C1. 有 U_ASSOC：「先照社團的規則」那個選項；選了＝「對！我們社團有規則！……我去找出來。」', opts[0].length===3&&/先照社團的規則/.test(opts[0][2])&&has('對！我們社團有規則！……我去找出來。'), JSON.stringify(opts));
  check('C2. 「妳真正想要的是什麼？」→「這個不用去法服。」', has('妳真正想要的是什麼？')&&has('……我想要帳對得起來，學弟也還會來社課。')&&has('那先找社團的指導老師。這個不用去法服。')&&G.flags.YU_C6==='rule'&&G.flags.YU_C6_DAY===D('2028-03-16'));
  at('2028-03-23',21.7); rules();
  /* 2026-10-28 改：AA_497 3-6（企劃線 7a38216ca）——3/23 那則不管選什麼都一樣的熊拿掉，改成照走的那一路、C6 之後第 14 天 21:00 她私訊三則（tests/aa497_supporting_unit.js 3-6）*/
  check('C2. 3/23 21:40 那則熊拿掉了（AA_497 3-6）；不記 YU_CLUB_BEAR', !txt('p:yu').includes('yu:（貼圖：一隻鞠躬的熊）')&&!txt('p:yu').includes('yu:少的三千是場地押金 忘了報 還在')&&!SOCIAL.has('yu','YU_CLUB_BEAR'));
  fresh('2028-03-15',21.1,'dorm'); grpJoin(); R('yu','FAM'); rules(); answer('y3_yu_c6',1);
  { const L=txt('p:yu'); const m=nested('y3_yu_c6_phone');
    check('C3. 選「現在說？」：手機版照 Alison 的習慣拆開（不打句號）；沒有 U_ASSOC＝兩個選項', L.includes('player:現在說？')&&L.includes('yu:欸 成發的錢對不起來')&&L.includes('yu:可是三千塊')&&!L.some(t=>/^yu:.*。$/.test(t))&&!!m&&m.ask.opts.length===2, JSON.stringify(L)); }
  answer('y3_yu_c6_phone',0); rules(); at('2028-03-23',21.7); rules();
  check('C3. 手機版也有「這個不用去法服。」；3/23 那則拿掉了（AA_497 3-6）', txt('p:yu').includes('player:那先找社團的指導老師。這個不用去法服。')&&txt('p:yu').includes('yu:……他是學弟耶')&&!txt('p:yu').includes('yu:找到了！！'));
  fresh('2028-03-16',12.6,'linze'); R('yu','FAM'); check('C. 沒回「有。」：3/16 Alison 不在那裡、不演', !R2Y3B.c6MeetDue(G));

  // ---------- 2-Y3-30 可昕 K18 ----------
  fresh('2028-03-15',21.6,'dorm'); date('kexin'); rules();
  check('R0. 3/15 21:30 兩則（「這週六早上八點，開車。……」「……地方你到了就知道。」）、兩個回覆', mine('p:kexin','kexin:這週六早上八點，開車。去一個我們兩個都沒去過的地方。').slice(0,2).join('|')==='kexin:這週六早上八點，開車。去一個我們兩個都沒去過的地方。|kexin:……地方你到了就知道。'&&PHONE.byAsk(G,'y3_kx_k18').ask.opts.length===2, JSON.stringify(txt('p:kexin')));
  answer('y3_kx_k18',0); rules(); const k18=OUT.get(G,'y3_kx_k18');
  check('R0. 「好。八點，木柵大學校門口。」→「好。不要遲到。」；排 3/18 08:00 木柵大學校門口', txt('p:kexin').includes('kexin:好。不要遲到。')&&k18&&k18.day===D('2028-03-18')&&k18.h===8);
  picks=[0]; await run('ev_kexin_k18');
  check('R1. 去了：「……可是月台還在等。」；第一個選項是「月台在等誰？」→「……不知道。我亂講的。」；KX_K18 trip', has('……可是月台還在等。')&&opts[0][0]==='「月台在等誰？」'&&has('……不知道。我亂講的。')&&has('下一站要去哪裡，回去再想。……不對，不想。')&&G.flags.KX_K18==='trip'&&has('這次不排行程表。'));
  { const L=JSON.stringify(ev('ev_kexin_k18').dialogue); check('R1. 沒有假設題（「假設」「妳不是說不出」）', !/假設|妳不是說不出/.test(L)); }
  { const L=JSON.stringify(LADDER); const i=L.indexOf('"id":"K6-L3"'), seg=i<0?'':L.slice(i,i+500); check('R2. 閒聊階梯 K6-L3 讀 KX_K18 trip（已在）：「山裡舊車站那趟的照片，我洗出來了。」', /"KX_K18":"trip"/.test(seg)&&/山裡舊車站那趟的照片，我洗出來了。/.test(seg)); }
  fresh('2028-03-18',8,'dorm'); date('kexin'); DATE.log(G,'kexin').wish=true; await run('ev_kexin_k18');
  check('R. 去過外澳：「這次也不排。跟外澳那次一樣。」', has('這次也不排。跟外澳那次一樣。')&&!has('這次不排行程表。'));
  fresh('2028-03-15',21.6,'dorm'); date('kexin'); rules(); answer('y3_kx_k18',0); rules(); at('2028-03-18',8.3); OUT.tick(GM); const call=OUT.get(G,'y3_kx_k18_call');
  check('R3. 沒到：08:15 電話（排「接起來」）；KX_K18 missed、KX_RUB +1', OUT.get(G,'y3_kx_k18').state==='missed'&&!!call&&call.verb==='接起來'&&call.must===true&&G.flags.KX_K18==='missed'&&G.flags.KX_RUB===1);
  await run('ev_kexin_k18_call'); at('2028-03-18',18.1); rules();
  check('R3. 電話「你在哪。」「……我叫予樂了。」；18:00 照片「你的位子，予樂坐了。」', has('你在哪。')&&has('……我叫予樂了。')&&txt('p:kexin').includes('kexin:你的位子，予樂坐了。'));
  fresh('2028-03-15',21.6,'dorm'); date('kexin'); rules(); answer('y3_kx_k18',1); at('2028-03-18',18.1); rules();
  check('R. 婉拒：「……好。那我跟予樂去。」、3/18 18:00 照片；不排出遊、不算 KX_RUB', txt('p:kexin').includes('kexin:……好。那我跟予樂去。')&&txt('p:kexin').includes('kexin:（照片：她和予樂在月台上）')&&!OUT.get(G,'y3_kx_k18')&&!G.flags.KX_RUB&&G.flags.KX_K18==='missed');
  fresh('2028-03-15',21.6,'dorm'); rules(); check('R. 沒交往：不發生', txt('p:kexin').length===0);

  // ---------- 2-Y3-31 SK13 阿勳的那條路 ----------
  fresh('2028-03-14',21.1,'dorm'); R('econ_zhengxun','FAM'); rules();
  check('X0. 3/14 21:00 阿勳「下週三我報告。你可以坐後面，不用聽懂。」、兩個回覆', txt('p:econ_zhengxun').join('|')==='econ_zhengxun:下週三我報告。你可以坐後面，不用聽懂。'&&PHONE.byAsk(G,'y3_xun_path').ask.opts.length===2);
  answer('y3_xun_path',0); rules(); const xq=OUT.get(G,'y3_xun_path');
  check('X0. 「我去。」→「嗯。三點，社科院。」；排 3/22 15:00 社科院', txt('p:econ_zhengxun').includes('econ_zhengxun:嗯。三點，社科院。')&&xq&&xq.day===D('2028-03-22')&&xq.h===15);
  picks=[0]; await run('ev_xun_path');
  check('X1. 去了、舉手：「……這是今天最好的問題。」', has('（愣了一下）……這是今天最好的問題。')&&opts[0].length===3);
  check('X2. 散場：「不過你現在的樣子比較好看。」；沒有 XUN_WARM＝沒有「還是很爽」；記 XUN_PATH', has('你留下來的話，現在應該坐我旁邊。')&&has('不過你現在的樣子比較好看。')&&!has('算出來那一下，還是很爽。')&&SOCIAL.has('econ_zhengxun','XUN_PATH'));
  fresh('2028-03-22',15,'dorm',{XUN_WARM:true}); R('econ_zhengxun','FAM'); picks=[2]; await run('ev_xun_path');
  check('X. 有 XUN_WARM：多「算出來那一下，還是很爽。」；鼓掌＝他把紙摺起來', has('算出來那一下，還是很爽。')&&has('（他看了你一眼，把那張紙摺起來。）'));
  fresh('2028-03-14',21.1,'dorm'); R('econ_zhengxun','FAM'); rules(); answer('y3_xun_path',1); at('2028-03-22',16.7); rules();
  check('X. 沒去：16:40「（照片：報告結束的投影幕）」「沒人問問題。我很安全。」', txt('p:econ_zhengxun').includes('econ_zhengxun:沒人問問題。我很安全。')&&!OUT.get(G,'y3_xun_path'));
  fresh('2028-03-14',21.1,'dorm'); rules(); check('X3. 沒玩過經濟系那一年（不認識阿勳）：沒有這一件', txt('p:econ_zhengxun').length===0);

  // ---------- 2-Y3-33 語 4 ----------
  const yuHere=()=>{ const n={id:'yu',charId:'yu',obj:{position:{x:0.5,y:0,z:0}},lv:0}; GM.npc.yu=n; E.npcs=[n]; };
  fresh('2028-03-13',10,'campus'); R('yu','FAM'); yuHere(); const y4=ev('ev_yu_alone_breakfast');
  check('Y1. 第 4 週週一 10:00 經過晨思鐘（Alison 在旁邊）：可以演', EVENTS.check(y4));
  picks=[2]; await run('ev_yu_alone_breakfast');
  check('Y1. 「欸，我在練習。一個人吃早餐。」…「你幫我找，那就不是一個人了啊。」', has('欸，我在練習。一個人吃早餐。')&&has('（笑出來）我說，你幫我找，那就不是一個人了啊。')&&opts[0].length===3);
  check('Y2. 選第三個：沒有「原來……是這種感覺」；「……我也沒有。」；記 YU4_SAT、YU4 sat（尾聲讀 YU4_ALONE）', !said.some(s=>/原來.*是這種感覺/.test(s.t))&&has('欸，你剛剛都沒講話。')&&has('……我也沒有。')&&SOCIAL.has('yu','YU4_SAT')&&G.flags.YU4==='sat'&&G.flags.YU4_ALONE===true);
  fresh('2028-03-13',10,'campus'); R('yu','FAM'); yuHere(); picks=[1]; await run('ev_yu_alone_breakfast');
  check('Y. 選「妳一個人的晚上要做什麼？」：「……還不知道。」「所以才要留一個晚上。」（不是「這就是重點吧」）', has('……還不知道。')&&has('所以才要留一個晚上。')&&!said.some(s=>/重點/.test(s.t))&&G.flags.YU4==='what');
  fresh('2028-04-03',10,'campus'); R('yu','FAM'); yuHere(); check('Y. 第 7 週：不演', !EVENTS.check(y4));
  fresh('2028-04-02',20.9,'dorm'); grpJoin(); R('yu','FAM'); rules(); const yc=OUT.get(G,'y3_yu4_call');
  check('Y. 台灣路線沒遇到：4/2 21:00 電話（接起來）', !!yc&&yc.place==='電話'&&yc.h===21&&yc.verb==='接起來');
  picks=[2]; await run('ev_yu_alone_call');
  check('Y. 電話版：第一句「今天早上一個人吃早餐」、沒有長椅那句；第三個選項「（聽她講完）」；YU4 call', has('欸，我在練習。今天早上一個人吃早餐。')&&!has('（她一個人在吃早餐。這次她沒有戴耳機。）')&&opts[0][2]==='（聽她講完）'&&has('（她又講了五分鐘社團的事，才說要去念書了。）')&&G.flags.YU4==='call');
  fresh('2028-04-02',20.9,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('yu','FAM'); date('heroine_01'); rules();
  check('Y3. 日本路線：4/2 視訊', (OUT.get(G,'y3_yu4_call')||{}).place==='視訊');
  fresh('2028-03-27',10,'campus',{EXCHANGE_ROUTE:'JP'}); R('yu','FAM'); yuHere(); check('Y. 日本路線 3/25 以後人在日本：晨思鐘不演', !EVENTS.check(y4));

  // ---------- 2-Y3-34 日本 J1 ----------
  fresh('2028-03-25',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); const j1=OUT.get(G,'y3_an_j1');
  check('J0. 日本路線：3/26 日本 22:00（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）便利商店，只有「出發」', !!j1&&j1.day===D('2028-03-26')&&j1.h===22&&j1.must===true);
  CG_REGISTRY.cg_japan_konbini_heroine01={file:'x'}; picks=[1]; await run('ev_an_konbini');
  check('J1. 交往中：「標籤只寫給看得懂的人。」＋CG-13（在那一句之前）；三選一；「我幫妳翻譯」＝「……那我們兩個一起看不懂。」；AN_J1 dating', has('（一本正經）標籤只寫給看得懂的人。')&&cgs.join()==='cg_japan_konbini_heroine01'&&opts[0].length===3&&has('……那我們兩個一起看不懂。')&&G.flags.AN_J1==='dating');
  fresh('2028-03-26',21,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FRI'); await run('ev_an_konbini'); delete CG_REGISTRY.cg_japan_konbini_heroine01;
  check('J2. 挽回中：點頭、去結帳；沒有 CG、沒有選項；AN_J1 repair', has('（她看到你，點了一下頭，拿了一個飯糰就去結帳。）')&&cgs.length===0&&opts.length===0&&G.flags.AN_J1==='repair'&&!has('……我在決定。'));
  { const L=ev('ev_an_konbini').dialogue.filter(l=>/她想了一下/.test(l.text||'')).length; check('J. 「（她想了一下）」只留一次（檔尾裁定 #31）', L===1); }
  fresh('2028-03-25',12,'dorm',{EXCHANGE_ROUTE:'TW'}); rules(); check('J. 台灣路線：沒有', !OUT.get(G,'y3_an_j1'));

  // ---------- 2-Y3-35 日文班 G10 ----------
  fresh('2028-04-01',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); CLS.rec(G).attend.japanese_1=3; rules(); const lq=OUT.get(G,'y3_liheng');
  check('G0. 日本路線、修過日文：4/2 日本 15:00（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）大學城的河堤', !!lq&&lq.day===D('2028-04-02')&&lq.h===15);
  picks=[0]; await run('ev_liheng_japan');
  check('G1. 沒有 G7：「……你是日文課的？」「鄒立衡。機械系的。」；「要不要一起吃飯？」→「好。我知道一家便宜的。」', has('……你是日文課的？')&&has('鄒立衡。機械系的。去年秋天來這裡念研究所。')&&!has('……祐廷？')&&has('好。我知道一家便宜的。')&&G.flags.LIHENG_JP==='meal');
  fresh('2028-04-02',14,'dorm',{EXCHANGE_ROUTE:'JP',LIHENG_TOLD:'wish'}); picks=[1]; await run('ev_liheng_japan');
  check('G. LIHENG_TOLD wish：叫名字＋「你說要寄照片。……我一直沒寄。」', has('……祐廷？')&&has('你說要寄照片。……我一直沒寄。')&&has('好。我加你。'));
  fresh('2028-04-01',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); check('G2. 沒修過日文：沒有這一場', !OUT.get(G,'y3_liheng'));

  // ---------- 2-Y3-36 清明 頂樓烤吐司 ----------
  fresh('2028-04-03',17.1,'dorm'); grpJoin(); ['zhe','yu','classmate_bohan','classmate_xinci','heroine_01'].forEach(id=>R(id,'FRI')); rules(); const tq=OUT.get(G,'y3s2_roof_toast');
  check('T0. 4/3 17:00 阿哲「今晚頂樓 烤吐司」「果醬自己帶」；排 20:00 宿舍頂樓', txt('g:noodle_team').join('|')==='zhe:今晚頂樓 烤吐司|zhe:果醬自己帶'&&tq&&tq.h===20);
  picks=[1]; await run('ev_y3s2_roof_toast');
  check('T1. 台灣路線：「期中考版的春假。只有兩個小時。」；以安不在（她在日本：沒有她當面說話）；拍照傳給以安＝「這邊也是晚上。」（手機）', has('期中考版的春假。只有兩個小時。')&&!said.some(s=>s.who==='沈以安')&&has('這邊也是晚上。')&&txt('p:heroine_01').includes('heroine_01:這邊也是晚上。')&&G.flags.Y3S2_ROOF_TOAST===true, JSON.stringify(lines()));
  fresh('2028-04-03',17.1,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('zhe','FRI'); date('heroine_01'); rules(); at('2028-04-03',21.6); rules();
  check('T2. 日本路線：沒有邀約；臺灣 20:30＝日本 21:30「你那邊有吐司嗎」', !OUT.get(G,'y3s2_roof_toast')&&txt('g:noodle_team').includes('zhe:你那邊有吐司嗎'));
  fresh('2028-04-03',17.1,'dorm'); grpJoin(); R('zhe','FRI'); rules(); at('2028-04-03',20.5); OUT.tick(GM); at('2028-04-03',22.1); rules();
  check('T. 沒去：22:00 烤焦的吐司', txt('g:noodle_team').includes('zhe:（照片：烤箱旁邊一排烤焦的吐司）'));

  // ---------- 2-Y3-37 日本 CG-23 春天的河堤 ----------
  fresh('2028-04-07',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules();
  check('S0. 日本路線、交往中：4/7 日本 21:00（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）「明天下午四點半，大學城的河堤。」「我帶書。你也帶。」', txt('p:heroine_01').join('|')==='heroine_01:明天下午四點半，大學城的河堤。|heroine_01:我帶書。你也帶。'&&PHONE.byAsk(G,'y3_an_sakura').ask.opts.length===2);
  answer('y3_an_sakura',0); rules(); const sq=OUT.get(G,'y3_an_sakura');
  check('S0. 「好。」→「嗯。」；排 4/8 日本 16:30', txt('p:heroine_01').includes('heroine_01:嗯。')&&sq&&sq.day===D('2028-04-08')&&sq.h===16.5);
  CG_REGISTRY.cg_sakura_riverbank_heroine01={file:'x'}; picks=[1]; cgs=[]; await run('ev_an_sakura_riverbank'); delete CG_REGISTRY.cg_sakura_riverbank_heroine01;
  check('S1. 交往中、去了：CG-23（她把手帳轉過來那一拍）；手帳「理由：櫻花只開一個禮拜。」；「……所以這週的讀書會，改在這裡。」；AN_SAKURA went', cgs.join()==='cg_sakura_riverbank_heroine01'&&has('理由：櫻花只開一個禮拜。')&&has('……所以這週的讀書會，改在這裡。')&&has('（她看了你一眼，繼續讀。過了一頁，她把保溫杯推過來一點。）')&&G.flags.AN_SAKURA==='went');
  fresh('2028-04-07',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FRI'); rules(); check('S2. 挽回中：沒有這一場', txt('p:heroine_01').length===0);
  fresh('2028-04-07',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); answer('y3_an_sakura',1); at('2028-04-08',18.1); rules();
  check('S. 「明天不行。」→「好。……櫻花下週就謝了。我拍給你。」（AA_524 A7 改原句）；日本 18:00 照片「今天在這裡讀完一章。」；AN_SAKURA missed', txt('p:heroine_01').includes('heroine_01:好。……櫻花下週就謝了。我拍給你。')&&txt('p:heroine_01').includes('heroine_01:今天在這裡讀完一章。')&&G.flags.AN_SAKURA==='missed');

  // ---------- 2-Y3-38 主線 8「遠方」（日本路線）----------
  fresh('2028-04-12',22.1,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); ['zhe','yu','classmate_bohan','classmate_xinci','heroine_03'].forEach(id=>R(id,'FRI')); date('heroine_01'); rules();
  check('F0. 4/12 臺灣 21:00＝日本 22:00（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）阿哲「明天七點半 視訊 麵店」、兩個回覆', txt('p:zhe').includes('zhe:明天七點半 視訊 麵店')&&PHONE.byAsk(G,'y3_far_call').ask.opts.length===2);
  answer('y3_far_call',0); at('2028-04-13',20); rules(); const fq=OUT.get(G,'y3_far_call');
  check('F0. 「好。」→「記得吃飯」；4/13 臺灣 19:30＝日本 20:30 視訊（接起來）', txt('p:zhe').includes('zhe:記得吃飯')&&fq&&fq.h===20.5&&fq.verb==='接起來');
  ACTIVITIES.rec(G).att['public_law_group@'+D('2028-02-24')]={h:20,end:'full'};   /* 芯慈那句要參加過讀書會（AA_377 第 3 項）*/
  await run('ev_far_call_jp');
  check('F1. 在麵店團：「你那邊幾點？……你吃什麼？給我看。」、Alison、柏翰（日本版，AA_377 第 14 項）、芯慈（參加過讀書會）、語彤探頭、阿姨「隔著螢幕也要問！」；FAR_CALL jp', has('你那邊幾點？……你吃什麼？給我看。')&&has('你瘦了！……不對，是鏡頭。')&&has('你那邊的課跟得上嗎？跟不上的話，筆記拍給我，我幫你對。')&&has('讀書會你的位子，我們沒有人坐。')&&has('（她從廚房探出頭，舉起田野筆記，沒說話。）')&&has('滷蛋要不要！隔著螢幕也要問！')&&said.some(s=>s.who==='阿姨（畫面外）')&&G.flags.FAR_CALL==='jp');
  check('F2. 和以安 FRIEND 以上：以安那則沒有「理由：」', has('（手機亮了一下，以安傳來：「他吃飯糰。便利商店比較近。」）')&&!said.some(s=>/理由：便利商店/.test(s.t)));
  fresh('2028-04-13',19.5,'dorm',{EXCHANGE_ROUTE:'JP'}); R('zhe','FAM'); date('heroine_01'); await run('ev_far_call_jp');
  check('F. 不在麵店團、和阿哲 FAMILIAR 以上：只留阿哲的台詞', has('就這樣？')&&!has('你瘦了！……不對，是鏡頭。')&&!has('滷蛋要不要！隔著螢幕也要問！')&&!said.some(s=>/他吃飯糰/.test(s.t)));
  fresh('2028-04-12',22.1,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('zhe','FRI'); date('heroine_01'); rules(); at('2028-04-13',20); rules(); at('2028-04-13',20.8); OUT.tick(GM); PHONE.tick(G);
  check('F. 沒接：臺灣 19:45＝日本 20:45 長桌空位的照片', txt('g:noodle_team').includes('zhe:（照片：長桌上空著一個位子，前面放了一碗麵）'));
  fresh('2028-04-12',21.1,'dorm'); grpJoin(); R('zhe','FRI'); rules(); check('F. 台灣路線：沒有', !PHONE.sent(G,'y3_far_call'));

  // ---------- 2-Y3-39 語 5 ----------
  fresh('2028-04-22',21.1,'dorm'); grpJoin(); R('yu','FAM'); rules();
  check('Y5-0. 4/22 21:00「欸」「我一個人在看電影。」、回覆「哪一部？」', txt('p:yu').join('|')==='yu:欸|yu:我一個人在看電影。'&&PHONE.byAsk(G,'y3_yu5').ask.opts[0].t==='哪一部？');
  answer('y3_yu5',0); check('Y5-0. →「看完再說！！」', txt('p:yu').includes('yu:看完再說！！'));
  fresh('2028-04-24',10,'campus'); R('yu','FAM'); yuHere(); check('Y5-1. 4/24 早上經過晨思鐘：可以演', EVENTS.check(ev('ev_yu_alone_movie')));
  picks=[1]; await run('ev_yu_alone_movie');
  check('Y5-1. 當面「旁邊坐一個也是一個人來的女生……」；「妳也坐倒數第三排？」→「對！下次我還要坐那裡。」；記 YU_ALONE', has('週六我一個人去看電影。')&&has('旁邊坐一個也是一個人來的女生。她說一個人看電影的人，都坐倒數第三排。')&&has('對！下次我還要坐那裡。')&&SOCIAL.has('yu','YU_ALONE'));
  fresh('2028-04-27',19.2,'noodle'); R('yu','FAM'); check('Y5-2. 4/24 沒去學校：4/27 19:00 麵店可以演；Alison 在麵店（作息）', EVENTS.check(ev('ev_yu_alone_movie_noodle'))&&(STORY.schedEnt(CHARACTERS.yu,G)||{}).zone==='noodle');
  await run('ev_yu_alone_movie_noodle');
  check('Y5-2. 麵店版第一句「欸，跟你說。週六我一個人去看電影。」', said[0].t==='欸，跟你說。週六我一個人去看電影。'&&SOCIAL.has('yu','YU_ALONE'));
  check('Y5-3. 任何一版都不是只有訊息（當面、麵店、視訊都有那幾句）', ev('ev_yu_alone_movie_video').dialogue.some(l=>l.text==='旁邊坐一個也是一個人來的女生。她說一個人看電影的人，都坐倒數第三排。'));
  fresh('2028-04-24',9,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('yu','FAM'); date('heroine_01'); rules(); const yv=OUT.get(G,'y3_yu5_video');
  check('Y5. 日本路線：4/24 臺灣 10:00＝日本 11:00 視訊（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）', !!yv&&yv.h===11&&yv.place==='視訊');

  // ---------- 2-Y3-40 芷若 Z11b ----------
  fresh('2028-04-24',19.5,'cafe'); R('heroine_02','FAM'); SOCIAL.remember('yu','YU_ALONE',''); R('yu','FAM');
  check('Z11-0. 4/24 以後第一次在 Café 和芷若點餐：可以演', EVENTS.check(ev('ev_zhiruo_third_row')));
  picks=[0]; await run('ev_zhiruo_third_row');
  check('Z11-1. 聽過語 5：「上週在戲院……」；「那個女生是 Alison。」→「……阿哲的那個 Alison？」；ZHIRUO_MET_YU', has('上週在戲院，倒數第三排，旁邊坐著一個也是一個人來的女生。')&&opts[0][0]==='「那個女生是 Alison。」'&&has('……阿哲的那個 Alison？')&&has('那下次遇到她，我請她一杯。')&&SOCIAL.has('heroine_02','ZHIRUO_MET_YU')&&G.flags.ZR_Z11B==='yu');
  at('2028-05-08',22.2); rules();
  check('Z11-1. 5/8 22:07「Alison 傳了一張票根給我。她說她也坐倒數第三排。」', txt('p:heroine_02').includes('heroine_02:Alison 傳了一張票根給我。她說她也坐倒數第三排。'));
  fresh('2028-05-02',19.5,'cafe'); R('heroine_02','FAM'); picks=[0]; await run('ev_zhiruo_third_row');
  check('Z11. 5/1 以後才第一次去：「前陣子在戲院」；沒聽過語 5＝兩個選項', has('前陣子在戲院，倒數第三排，旁邊坐著一個也是一個人來的女生。')&&opts[0].length===2&&has('想好了再跟你說。'));
  fresh('2028-04-22',23.1,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_02','FRI'); ct('heroine_02'); rules();
  check('Z11-2. 日本路線、單身、朋友：4/22 臺灣 22:00＝日本 23:00「今天坐這裡。旁邊空著。」', txt('p:heroine_02').join('|')==='heroine_02:（照片：倒數第三排的票根）|heroine_02:今天坐這裡。旁邊空著。'&&G.flags.ZR_Z11B==='photo');
  fresh('2028-04-22',23.1,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_02','FRI'); ct('heroine_02'); date('heroine_01'); rules();
  check('Z11. 日本路線、交往中：「今天坐倒數第三排。那排的視角最好。」', txt('p:heroine_02').includes('heroine_02:今天坐倒數第三排。那排的視角最好。'));
  fresh('2028-04-25',19.5,'cafe',{EXCHANGE_ROUTE:'JP'}); R('heroine_02','FAM'); check('Z11. 日本路線：Café 沒有 Z11b', !EVENTS.check(ev('ev_zhiruo_third_row')));

  // ---------- 2-Y3-41 可昕 生日（大三）----------
  fresh('2028-04-23',21.1,'dorm',{KX_BDAY:{1:'visit',2:'met'}}); date('kexin'); rules();
  check('B1. 大一、大二都記得：4/23 21:00「明天我生日。今年你不用想了，我想好了。」…「六點。」、兩個回覆', mine('p:kexin','kexin:明天我生日。今年你不用想了，我想好了。').slice(0,3).join('|')==='kexin:明天我生日。今年你不用想了，我想好了。|kexin:公館，三十分鐘，一片蛋糕。我們兩個都在趕報告。|kexin:六點。'&&PHONE.byAsk(G,'y3_kx_bday_ask').ask.opts.length===2);
  answer('y3_kx_bday_ask',0); rules(); const bq=OUT.get(G,'kx_bday_y3');
  check('B1. 「好。」→ 排 4/24 18:00 公館', !!bq&&bq.day===D('2028-04-24')&&bq.h===18);
  at('2028-04-24',18); await run('ev_kexin_birthday_y3');
  check('B2. 去了：「三……三十分鐘到了。第三個明年說。」、收尾「報告寫完了跟我說。」；KX_BDAY[3] met', has('生日願望。一，報告寫完。二，你的報告也寫完。')&&has('三……三十分鐘到了。第三個明年說。')&&has('報告寫完了跟我說。')&&G.flags.KX_BDAY[3]==='met');
  { const L=JSON.stringify(ev('ev_kexin_birthday_y3').dialogue); check('B. 沒有假設題、沒有拿祐廷比較', !/假設|如果|比你/.test(L)); }
  check('B3. 之後的閒聊階梯讀 ev_kexin_birthday_y3（K6-L5，已在）', /ev_kexin_birthday_y3/.test(JSON.stringify(LADDER)));
  fresh('2028-04-24',12,'dorm',{KX_BDAY:{1:'visit'}}); date('kexin');
  PHONE.post(G,{th:'p:kexin',from:'kexin',text:'你晚上要下山來，還是我上去',ask:{id:'t_bd',opts:[{t:'我去木柵大學',say:[{from:'kexin',text:'好 我在校門口等'}]},{t:'妳來公館',say:[{from:'kexin',text:'好 七點'}]}]}}); answer('t_bd',1); rules();
  check('B. 其他玩家：按了生日快樂、回了她的回問＝排 4/24 18:00 公館', (OUT.get(G,'kx_bday_y3')||{}).h===18);
  fresh('2028-04-24',12,'dorm',{KX_BDAY:{1:'visit',2:'none'}}); date('kexin'); rules(); at('2028-04-25',9.1); rules();
  check('B4. 什麼都沒做、大二也沒做：4/25 09:00「昨天我生日。……今年也等了一天。」；none、KX_RUB +1', txt('p:kexin').includes('kexin:昨天我生日。……今年也等了一天。')&&G.flags.KX_BDAY[3]==='none'&&G.flags.KX_RUB===1);
  fresh('2028-04-23',21.1,'dorm',{KX_BDAY:{1:'visit',2:'met'}}); date('kexin'); rules(); answer('y3_kx_bday_ask',1); at('2028-04-25',9.1); rules();
  check('B. 她約了你說不行：「……好。」；4/25「昨天我生日。……我等了一天。」；declined', txt('p:kexin').includes('kexin:……好。')&&txt('p:kexin').includes('kexin:昨天我生日。……我等了一天。')&&G.flags.KX_BDAY[3]==='declined'&&G.flags.KX_RUB===1);
  fresh('2028-04-24',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('kexin'); date('heroine_01'); rules(); const bv=OUT.get(G,'kx_bday_y3');
  check('B. 日本路線：4/24 臺灣 21:00＝日本 22:00 視訊（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）；「這片是你的。我幫你吃。」、沒有走到門口那一句；KX_BDAY[3] video', !!bv&&bv.h===22&&bv.place==='視訊'&&(at('2028-04-24',22),true));
  await run('ev_kexin_birthday_y3');
  check('B. 日本路線視訊的台詞', has('這片是你的。我幫你吃。')&&has('三……三十分鐘到了。第三個明年說。')&&!has('報告寫完了跟我說。')&&G.flags.KX_BDAY[3]==='video');
  check('B. AA_344 ⑤ 沒有 KX_EXCHANGE_ASKED：沒有「沒關係，你先睡。……」', !has('沒關係，你先睡。填交換志願的時候，你有先問我。'));
  fresh('2028-04-24',12,'dorm',{EXCHANGE_ROUTE:'JP',KX_EXCHANGE_ASKED:true}); date('kexin'); date('heroine_01'); rules(); at('2028-04-24',21); await run('ev_kexin_birthday_y3');
  { const L=said.map(s=>s.t), i=L.indexOf('沒關係，你先睡。填交換志願的時候，你有先問我。');
    check('B. AA_344 ⑤ 日本路線視訊、填志願時先問過她（KX_EXCHANGE_ASKED）：「三……三十分鐘到了。第三個明年說。」之後、最後一句「沒關係，你先睡。填交換志願的時候，你有先問我。」', i>0&&L[i-1]==='三……三十分鐘到了。第三個明年說。'&&i===L.length-1&&said[i].who!==null, JSON.stringify(L)); }
  fresh('2028-04-23',21.1,'dorm',{KX_BDAY:{1:'visit',2:'met'},KX_EXCHANGE_ASKED:true}); date('kexin'); rules(); answer('y3_kx_bday_ask',0); rules(); at('2028-04-24',18); await run('ev_kexin_birthday_y3');
  check('B. AA_344 ⑤ 當面那一版（不是日本路線）有 KX_EXCHANGE_ASKED 也沒有這一句', has('報告寫完了跟我說。')&&!has('沒關係，你先睡。填交換志願的時候，你有先問我。'));

  // ---------- 2-Y3-42 慈 6 ----------
  const here=id=>{ const n={id,charId:id,obj:{position:{x:0.6,y:0,z:0}},lv:0}; GM.npc[id]=n; E.npcs.push(n); };
  fresh('2028-05-04',19.2,'noodle'); R('classmate_xinci','FAM'); R('zhe','FRI'); here('classmate_xinci');
  check('X6-0. 5/4 19:00 芯慈在麵店（作息）：可以演', EVENTS.check(ev('ev_xinci_first_place'))&&(STORY.schedEnt(CHARACTERS.classmate_xinci,G)||{}).zone==='noodle');
  picks=[1]; await run('ev_xinci_first_place');
  check('X6-1. 當面「以安不在的這學期，我第一次考第一。」…；「哪一部劇？」→「你要聽嗎？」＋阿哲兩碗；XINCI_FIRST（記憶＋旗標）', has('以安不在的這學期，我第一次考第一。')&&has('我把雙主修改成輔系了。經濟我還是喜歡。只是不用拿第一了。')&&has('（她講了十分鐘。阿哲吃完了兩碗。）')&&SOCIAL.has('classmate_xinci','XINCI_FIRST')&&G.flags.XINCI_FIRST===true);
  check('X6-2. 任何一版：沒有「不是因為要逃避什麼」', !JSON.stringify(ev('ev_xinci_first_place').dialogue).includes('逃避'));
  fresh('2028-05-04',22,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('classmate_xinci','FAM'); date('heroine_01'); rules(); const xv=OUT.get(G,'y3_xc_video');
  check('X6. 日本路線：5/4 臺灣 21:40＝日本 22:40 視訊（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）', !!xv&&Math.abs(xv.h-(22+40/60))<1e-6&&xv.place==='視訊');
  fresh('2028-05-04',19.2,'noodle',{EXCHANGE_ROUTE:'JP'}); R('classmate_xinci','FAM'); here('classmate_xinci'); check('X6. 日本路線：麵店不演', !EVENTS.check(ev('ev_xinci_first_place')));

  // ---------- 2-Y3-43 J2 町公所的一張通知 ----------
  fresh('2028-05-05',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); const nq=OUT.get(G,'y3_an_notice');
  check('N0. 日本路線、交往中：5/5 日本 21:00「明天下午，町公所門口。有一張通知，我想給你看。」；排 5/6 日本 15:00（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）', txt('p:heroine_01').includes('heroine_01:明天下午，町公所門口。有一張通知，我想給你看。')&&!!nq&&nq.day===D('2028-05-06')&&nq.h===15);
  CG_REGISTRY.cg_japan_notice_heroine01={file:'x'}; picks=[2]; cgs=[]; await run('ev_an_town_notice'); delete CG_REGISTRY.cg_japan_notice_heroine01;
  check('N1. 交往中：CG-17；三選一；「兩個都有。」→抄進手帳；「這張不用傳到群組了。」；AN_TOWN_NOTICE there', cgs.join()==='cg_japan_notice_heroine01'&&has('可是整條街都照做。……這比命令可怕，還是比較好？')&&opts[0].length===3&&has('（把這句抄進手帳）……好。那我想研究的，就是這兩個中間的線。')&&has('這張不用傳到群組了。')&&G.flags.AN_TOWN_NOTICE==='there');
  check('N4. 旁白、台詞沒有說這是行政指導', !JSON.stringify(ev('ev_an_town_notice').dialogue.concat(ev('ev_an_town_notice_repair').dialogue)).includes('行政指導'));
  fresh('2028-05-05',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); at('2028-05-06',15.6); OUT.tick(GM); at('2028-05-06',20.1); rules();
  check('N. 交往中沒去：日本 20:00 照片三則；AN_TOWN_NOTICE photo', txt('p:heroine_01').includes('heroine_01:町公所請大家『協力』，沒有罰則，大家都照做。')&&G.flags.AN_TOWN_NOTICE==='photo');
  fresh('2028-05-06',20,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FRI'); rules(); const nr=OUT.get(G,'y3_an_notice_repair');
  check('N2. 挽回中：5/6 日本 22:00（人在日本：遊戲時鐘＝日本時間，AA_341 J-S13）宿舍大廳（只有「出發」）', !!nr&&nr.h===22&&nr.must===true);
  picks=[0]; await run('ev_an_town_notice_repair');
  check('N2. 「我不是在跟你和好。我只是看不懂。」；「……好。」→「晚安。」、REPAIR +1；沒有 CG', has('我不是在跟你和好。我只是看不懂。')&&has('晚安。')&&!!G.flags.REPAIR&&G.flags.REPAIR.heroine_01===1&&G.flags.AN_TOWN_NOTICE==='repair'&&cgs.length===0);
  fresh('2028-05-06',21,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FRI'); picks=[1]; await run('ev_an_town_notice_repair');
  check('N2. 「那我們可以談一下嗎？」→「我說了，我只是看不懂。」；REPAIR 不加', has('我說了，我只是看不懂。')&&!(G.flags.REPAIR&&G.flags.REPAIR.heroine_01));
  fresh('2028-05-06',20.1,'dorm'); grpJoin(); R('heroine_01','FRI'); R('zhe','FRI'); rules();
  check('N3. 台灣路線：20:00 群組照片＋阿哲「所以要不要協力？」', txt('g:noodle_team').join('|')==='heroine_01:（照片：町公所的通知）|heroine_01:這比命令可怕，還是比較好？|zhe:所以要不要協力？'&&G.flags.AN_TOWN_NOTICE==='group');
  fresh('2028-05-06',20.2,'dorm',{AN_FAR_VIDEO:'guess'}); grpJoin(); date('heroine_01'); rules();
  check('N3. 交往中、4/13 猜過：另外私訊「最後一行，你那天猜對一半。」', txt('p:heroine_01').includes('heroine_01:最後一行，你那天猜對一半。'));

  // ---------- 2-Y3-44 可昕 K20 ----------
  fresh('2028-05-11',21.1,'dorm'); date('kexin'); rules();
  check('K20-0. 5/11 21:00「明天傍晚七點，河濱。我想跟你說一件實習遇到的事。」、兩個回覆', txt('p:kexin').includes('kexin:明天傍晚七點，河濱。我想跟你說一件實習遇到的事。')&&PHONE.byAsk(G,'y3_kx_k20').ask.opts.length===2);
  answer('y3_kx_k20',0); rules(); const kq=OUT.get(G,'y3_kx_k20');
  check('K20-0. 「好。」→ 排 5/12 19:00 公館河濱', !!kq&&kq.day===D('2028-05-12')&&kq.h===19);
  picks=[1]; await run('ev_kexin_k20');
  check('K20-1. 去了：「有個人聽懂了自己的處境，就不那麼怕了。」；「做這個要很累。」→「會。所以你要負責宵夜。」；KX_DIR.Y3 heard、KX_K20 river', has('有個人聽懂了自己的處境，就不那麼怕了。')&&has('會。所以你要負責宵夜。')&&!has('……這句我大二說過了。好，這次換你說一句。')&&G.flags.KX_DIR.Y3==='heard'&&G.flags.KX_K20==='river');
  fresh('2028-05-12',19,'dorm',{KX_SUMMER:'tired'}); date('kexin'); picks=[1]; await run('ev_kexin_k20');
  check('K20. KX_SUMMER tired：多「……這句我大二說過了。好，這次換你說一句。」', has('……這句我大二說過了。好，這次換你說一句。'));
  fresh('2028-05-11',21.1,'dorm'); date('kexin'); rules(); answer('y3_kx_k20',1); at('2028-05-12',20.6); rules(); const kc=OUT.get(G,'y3_kx_k20_call');
  check('K20-2. 沒去：21:00 電話（不是訊息；只有「接起來」）', txt('p:kexin').includes('kexin:……好。那我明天晚上打給你。')&&!!kc&&kc.h===21&&kc.must===true&&kc.place==='電話');
  picks=[2]; await run('ev_kexin_k20_call');
  check('K20-2. 電話「本來想在河濱講的。」；「（聽她說完）」→「……嗯。我講完了。早點睡。」；KX_K20 call', has('本來想在河濱講的。實習那邊，有個來問問題的人聽懂了自己的處境。')&&has('……嗯。我講完了。早點睡。')&&G.flags.KX_K20==='call'&&G.flags.KX_DIR.Y3==='heard');
  check('K20-3. 任何一版：沒有案件內容、實習單位', !/案件|事務所|法扶|法院/.test(JSON.stringify(ev('ev_kexin_k20').dialogue.concat(ev('ev_kexin_k20_call').dialogue))));
  fresh('2028-05-12',21.6,'dorm',{EXCHANGE_ROUTE:'JP'}); date('kexin'); date('heroine_01'); rules();
  check('K20. 日本路線：沒有河濱的邀約；臺灣 21:00＝日本 22:00 電話', !PHONE.sent(G,'y3_kx_k20')&&(OUT.get(G,'y3_kx_k20_call')||{}).h===22);
  await run('ev_kexin_k20_call'); check('K20. 日本路線電話第一句「這學期我在實習。……」（BB_98 原文）', has('這學期我在實習。今天有一個來問問題的人，聽懂了自己的處境。'));

  // ---------- 2-Y3-45 方奕廷 F3 ----------
  fresh('2028-05-29',21.1,'dorm'); R('npc_fangyt','FAM'); R('heroine_02','FAM'); rules(); const fq3=OUT.get(G,'y3_fang_f3');
  check('F3-1. 一般玩家：5/29 21:00 電話（演出來的，只有「接起來」）', !!fq3&&fq3.day===D('2028-05-29')&&fq3.place==='電話'&&fq3.must===true&&G.flags.FANG_F3_DAY===D('2028-05-29'));
  picks=[1]; await run('ev_fangyt_tickets');
  check('F3-1. 「我六年沒約過任何人。要怎麼約。」；「說你剛好有兩張票。」→「我沒有剛好。」「我買了。」；FANG_F3 bought', has('我六年沒約過任何人。要怎麼約。')&&has('我沒有剛好。')&&has('我買了。')&&G.flags.FANG_F3==='bought');
  G.zone='cafe'; at('2028-05-31',19.5); check('F3. 之後第一次在 Café 點餐：可以演芷若那兩句', EVENTS.check(ev('ev_zhiruo_f3_cafe')));
  await run('ev_zhiruo_f3_cafe'); check('F3. 「奕廷約我去看電影。很老的那部，《秋天的晚飯》。」', has('奕廷約我去看電影。很老的那部，《秋天的晚飯》。')&&has('他連我高中看過哪幾部都記得。……我說好。'));
  check('F3. 芷若這學期不再發心意邀約（TERMEND.heartWhy）', TERMEND.heartWhy(G,'heroine_02',TERMEND.windowOf('Y3S2'))===false);
  fresh('2028-05-29',21.1,'dorm'); R('npc_fangyt','FAM'); R('heroine_02','FRI'); SOCIAL.rel('heroine_02').npcRom=40; { const L=DATE.log(G,'heroine_02'); L.count=4; L.wish=true; } rules();
  check('F3-2. 5/29 芷若的心意邀約條件已到：延到 6/19（FANG_F3_DELAY、5/29 沒有電話）', G.flags.FANG_F3_DELAY===true&&!OUT.get(G,'y3_fang_f3'), JSON.stringify(TERMEND.cond(G,'heroine_02')));
  at('2028-06-19',21.1); rules(); check('F3-2. 6/19 還沒交往：21:00 電話', (OUT.get(G,'y3_fang_f3')||{}).day===D('2028-06-19'));
  fresh('2028-05-29',21.1,'dorm'); R('npc_fangyt','FAM'); date('heroine_02'); rules();
  check('F3-3. 和芷若交往中：「芷若跟我說了。」三則、沒有電話；FANG_F3 congrats', txt('p:npc_fangyt').join('|')==='npc_fangyt:芷若跟我說了。|npc_fangyt:恭喜。……你要記得她喝什麼。我只會記電影。|npc_fangyt:下次爬山，你們兩個一起來。'&&!OUT.get(G,'y3_fang_f3')&&G.flags.FANG_F3==='congrats');
  check('F3-4. 沒有真實的片名、導演', !/秋刀魚|小津/.test(fs.readFileSync(path.join(ROOT,'src/data/r2y3b_events.js'),'utf8')+fs.readFileSync(path.join(ROOT,'src/r2y3b3d.js'),'utf8')));
  fresh('2028-05-29',21.1,'dorm'); SOCIAL.remember('npc_fangyt','FIRST_MET',''); R('heroine_02','FAM'); rules(); G.zone='cafe'; at('2028-05-30',19.5);
  check('F3. 和方奕廷不到 FAMILIAR：沒有電話，只有芷若那兩句（nocall）', !OUT.get(G,'y3_fang_f3')&&G.flags.FANG_F3==='nocall'&&EVENTS.check(ev('ev_zhiruo_f3_cafe')));

  // ---------- 2-Y3-49 宿舍抽籤 ----------
  fresh('2028-07-15',10.1,'dorm'); rules();
  check('L1. 台灣路線 7/15 10:00 宿舍系統「大四宿舍抽籤結果：已分配。請於 9/3 前完成入住。」；DORM_Y4 self', txt('g:dorm').some(t=>t.endsWith('大四宿舍抽籤結果：已分配。請於 9/3 前完成入住。'))&&!txt('g:dorm').some(t=>/床位保留/.test(t))&&G.flags.DORM_Y4==='self');
  fresh('2028-07-15',10.1,'dorm',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); rules();
  check('L3. 美國路線：多「交換期間床位保留，12/23 起可以入住。」', txt('g:dorm').some(t=>t.endsWith('交換期間床位保留，12/23 起可以入住。')));
  fresh('2028-07-15',11.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); answer('dorm_lottery_y4_sis',0);
  check('L2. 日本路線：臺灣 10:00＝日本 11:00 姊姊「宿舍的表我幫你填了。」「抽到了，四樓。」→「謝謝姊。」「回來請我吃飯。」；DORM_Y4 sister', txt('p:sister').slice(0,2).join('|')==='sister:宿舍的表我幫你填了。|sister:抽到了，四樓。'&&txt('p:sister').includes('sister:回來請我吃飯。')&&G.flags.DORM_Y4==='sister'&&!PHONE.inGroup(G,'dorm'), JSON.stringify(txt('p:sister')));
  fresh('2027-07-15',10.1,'dorm'); rules(); check('L. 順便：2027 宿舍系統那一則', txt('g:dorm').some(t=>t.endsWith('大三宿舍抽籤結果：已分配。請於 9/5 前完成入住。')));

  // ---------- 2-Y3-51 美國路線 X1 退宿 ----------
  fresh('2028-07-25',14.1,'dorm',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); HOME.rec(G).stay={Y3S:'stay'};
  check('U1. 美國路線、暑假續住：7/25 14:00 到了', R2Y3B.x1Due(G));
  said=[]; await R2Y3B.x1Go(GM);
  check('U1. 507 只剩你這半邊；床墊下面的課表；「搬回臺北的家」計程車；之後住臺北的家；X1_US', has('（七月底。507 只剩你這半邊還有東西。柏翰白天在補習班，他的桌上堆滿了講義。）')&&has('（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）')&&cards.some(c=>c[0]==='搬回臺北的家'&&c[1]==='計程車　約 30 分鐘')&&HOME.at(G)&&HOME.rec(G).lbreak==='Y3S'&&G.flags.X1_US===D('2028-07-25'));
  fresh('2028-07-25',14.1,'campus',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); said=[]; cards=[]; await R2Y3B.x1Go(GM);
  check('U1. 人在外面：先帶回宿舍再演', !!cards[0]&&cards[0][0]==='回宿舍'&&has('（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）'));
  fresh('2028-06-12',9,'dorm',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); HOME.rec(G).stay={Y3S:'home'}; said=[];
  check('U2. 暑假回家住：學期結束那天就搬（breakStartDue）', HOME.breakStartDue(G));
  await HOME.breakStart(GM);
  check('U2. 「暑假回家住。你把一年的東西裝進四個紙箱。」後面多床墊那一句；7/25 沒有', said.map(x=>x.t).join('|')==='暑假回家住。你把一年的東西裝進四個紙箱。|（宿舍的床墊翻起來的時候，下面有一張不知道誰的課表。）'&&(at('2028-07-25',14.1),!R2Y3B.x1Due(G)));
  fresh('2028-06-12',9,'dorm',{EXCHANGE_ROUTE:'TW'}); HOME.rec(G).stay={Y3S:'home'}; said=[]; await HOME.breakStart(GM);
  check('U. 台灣路線回家住：照原本（沒有床墊那一句）', said.map(x=>x.t).join('|')==='暑假回家住。你把一年的東西裝進四個紙箱。');

  // ---------- 2-Y3-53 台灣、美國路線：和以安交往中的遠距 ----------
  const goOut=async id=>{ said=[]; opts=[]; const q=OUT.get(G,id); if(!q) return false; return OUT.go(GM,q); };
  fresh('2028-03-13',21.1,'dorm',{AN_VDAY_GIFT:true}); date('heroine_01'); ct('heroine_01'); rules(); const wq=OUT.get(G,'y3_an_white');
  check('WD1. 交往中、2/14 送過：3/13 21:00「明天傍晚六點，公館。」；排 3/14 18:00 公館', txt('p:heroine_01').includes('heroine_01:明天傍晚六點，公館。')&&!!wq&&wq.day===D('2028-03-14')&&wq.h===18, JSON.stringify(txt('p:heroine_01')));
  picks=[2]; await run('ev_an_white_day');
  check('WD1. 3/14「日本的白色情人節……」「一個月前你送的。這是回禮。」；三個回覆；「十一天以後妳就走了。」→「十一天。……我算過了。」', has('日本的白色情人節，是收到巧克力的人要回禮。')&&has('（她拿出一個小紙袋）一個月前你送的。這是回禮。')&&opts[0].length===3&&has('十一天。……我算過了。')&&G.flags.AN_WHITE_DAY==='eleven'&&!has('二月十四號那天，我在讀書。……你也沒說什麼。'));
  /* AA_343 D1（改了這一項的期待值）：交往中一律有；2/14 沒送（現在所有玩家）＝「不是回禮」那一版（AA_369 H2 改字：2/14 她在臺北、「理由欄」不說出口）*/
  fresh('2028-03-13',21.1,'dorm'); date('heroine_01'); ct('heroine_01'); rules(); { const q=OUT.get(G,'y3_an_white'); check('WD. D1 2/14 沒送（現在所有玩家）：交往中一律有 3/13 21:00 私訊、3/14 18:00 公館', PHONE.sent(G,'y3_an_white')&&!!q&&q.day===D('2028-03-14')&&q.h===18); }
  picks=[0]; await run('ev_an_white_day');
  { const W=['日本的白色情人節，是收到巧克力的人要回禮。','二月十四號那天，我在讀書。……你也沒說什麼。','（她拿出一個小紙袋）回禮要先收到才算。……這個，是我自己想送。','嗯。……打開以前先猜。'];   /* AA_508 0-2 第 8 點：第三句換掉禁用句型 */
    check('WD. D1 沒送過（AA_369 H2）：「二月十四號那天，我在讀書。……你也沒說什麼。」「（她拿出一個小紙袋）回禮要先收到才算。……這個，是我自己想送。」（AA_508 0-2 第 8 點）；沒有「我在臺中」「理由欄」；三個回覆照原稿（「謝謝。」→「嗯。……打開以前先猜。」）', JSON.stringify(said.map(x=>x.t))===JSON.stringify(W)&&opts[0].length===3&&!has('（她拿出一個小紙袋）一個月前你送的。這是回禮。')&&!said.some(x=>/我在臺中|理由欄/.test(x.t)), JSON.stringify(said.map(x=>x.t))); }
  fresh('2028-03-13',21.1,'dorm',{AN_VDAY_GIFT:true,EXCHANGE_ROUTE:'JP'}); date('heroine_01'); ct('heroine_01'); rules(); check('WD. 日本路線：沒有 3/14', !OUT.get(G,'y3_an_white'));
  fresh('2028-04-13',20.5,'dorm'); date('heroine_01'); rules(); const fv=OUT.get(G,'y3_an_far_video');
  check('WD2. 交往中：4/13 21:00 視訊（日本 22:00；AA_377 第 19 項，她 22:30 以後不回；10 分鐘沒接＝沒接）', !!fv&&fv.h===21&&Math.abs(fv.late-1/6)<1e-9&&fv.verb==='接起來'&&fv.place==='視訊');
  picks=[2]; await run('ev_an_far_video');
  check('WD2. 「町公所門口的通知。」；「我也看不懂。」→「好。那我們兩個一起看不懂。」；AN_FAR_VIDEO same', has('（拿著一張照片對著鏡頭）町公所門口的通知。')&&has('好。那我們兩個一起看不懂。')&&G.flags.AN_FAR_VIDEO==='same');
  at('2028-05-06',20.2); grpJoin(); rules(); check('WD2. 5/6 群組照片之外，她私訊「最後一行，你那天猜對一半。」', txt('p:heroine_01').includes('heroine_01:最後一行，你那天猜對一半。'));
  fresh('2028-04-13',21,'dorm'); R('heroine_01','FRI'); rules(); check('WD. 不是交往中：沒有 4/13 視訊', !OUT.get(G,'y3_an_far_video'));
  fresh('2028-04-13',21.2,'dorm'); date('heroine_01'); rules(); check('WD. 21:00 以後才跑手機：不排（沒接＝沒接）', !OUT.get(G,'y3_an_far_video'));

  // ---------- 2-Y3-52 台灣、美國路線：以安在日本（還沒交往）----------
  const ABL=(n,rep)=>Array.from({length:n},(x,i)=>({day:D('2028-03-26')+7*i,h:20,kind:'msg',wk:i+1,tier:1,replied:rep[i]}));
  fresh('2028-03-26',19.9,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); rules();
  check('AB0. 3/26（日）19:54：還沒有', txt('p:heroine_01').length===0);
  at('2028-03-26',20.05); rules();
  check('AB1. 3/26 她那邊 21:00（時鐘 20:00）：T1 第一則（照片＋一句）＝到的那週「公寓房間，箱子還沒拆」（AA_463 第 1 節十則、第 7 節改字；櫻花那則只在 4 月）；AN_ABROAD_TIER 1', txt('p:heroine_01').join('|')==='heroine_01:（照片：公寓房間，箱子還沒拆）|heroine_01:到了。箱子明天拆。'&&G.flags.AN_ABROAD_TIER===1, JSON.stringify(txt('p:heroine_01')));
  { const m=PHONE.byAsk(G,'y3_ab_w1'); check('AB1. D3 T1 也有兩個回覆按鈕（AA_343 D3）：「累嗎？」／「房間多大？」（AA_463 第 1 節）', !!m&&m.ask.opts.map(o=>o.t).join('|')==='累嗎？|房間多大？'&&m.ask.opts.map(o=>(o.say||[]).map(x=>x.text).join()).join('|')==='還好。……床比宿舍軟。|六疊。我量過了。', JSON.stringify(m&&m.ask)); }
  at('2028-03-26',21); PHONE.post(G,{th:'p:heroine_01',from:'player',text:'好漂亮。'}); at('2028-04-02',20.1); rules();
  check('AB1. 第 2 週（偶數週）T1 不傳；用手機傳過話＝那一則算回了', txt('p:heroine_01').filter(t=>/^heroine_01:/.test(t)).length===2&&G.flags.AN_ABROAD.log[0].replied===true);
  at('2028-04-09',20.1); rules(); check('AB1. 第 3 週：T1 第二則＝飯糰（AA_463 第 1 節：「我研究了三天」不再是到的第二天；櫻花排四月最後一個單週 4/23）', txt('p:heroine_01').includes('heroine_01:飯糰的海苔要自己拉開。我研究了三天。')&&!txt('p:heroine_01').includes('heroine_01:四月。這邊的櫻花開得比較晚。'));
  answer('y3_ab_w3',1); check('AB1. D3 回「拉破了也能吃。」→ 她回「我知道。我吃了三個破的。」；這一則算回了', txt('p:heroine_01').slice(-2).join('|')==='player:拉破了也能吃。|heroine_01:我知道。我吃了三個破的。'&&(R2Y3B.abSettle(G),G.flags.AN_ABROAD.log.slice(-1)[0].replied===true), JSON.stringify(txt('p:heroine_01').slice(-2)));
  { const O=R2Y3B_EVENTS.AB.t1O, W=[['臺北的已經謝了。','嗯。這邊才剛開。','好看。','嗯。'],['照 1、2、3 的順序拉。','……你早點說。','拉破了也能吃。','我知道。我吃了三個破的。'],['一百圓是多少？','二十幾塊。我記了匯率。','手帳記幾頁了？','十一頁。'],['辛苦了。','嗯。','排到了嗎？','排到了。辦完只要五分鐘。']];
    check('AB1. D3 原本四則 T1（十則的第 3、2、4、5 則，AA_463 第 1 節）的回覆按鈕和她的那一句照舊（逐字）', (O||[]).length===10&&JSON.stringify([2,1,3,4].map(i=>O[i].flat()))===JSON.stringify(W)); }
  fresh('2028-04-09',20.05,'dorm'); R('heroine_01','CLO'); ct('heroine_01'); G.flags.AN_ABROAD={log:ABL(2,[true,true]),tier:1,wk:2,n1:2,n2:0,n3:0}; rules();
  { const m=PHONE.byAsk(G,'y3_ab_w3'); check('AB3. 第 4 階＋最近三則回了兩則：T2（長一點、會問你的事；4/9 是臺灣第 7 週，期中那則不出，AA_377 第 5 項）；每則兩個回覆按鈕', G.flags.AN_ABROAD_TIER===2&&txt('p:heroine_01').join('|')==='heroine_01:町公所前面的阿伯一直跟我講話，我只聽懂『學生』兩個字。|heroine_01:你最近都去哪裡讀書？'&&!!m&&m.ask.opts.map(o=>o.t).join('|')==='總圖。|麵店。', JSON.stringify(txt('p:heroine_01'))); }
  answer('y3_ab_w3',1); check('AB3. 回了＝她不再回（一來一回就停）；算回了', txt('p:heroine_01').slice(-1)[0]==='player:麵店。'&&(S2=>{ R2Y3B.abSettle(G); return G.flags.AN_ABROAD.log.slice(-1)[0].replied===true; })());
  fresh('2028-04-16',20.05,'dorm'); R('heroine_01','CLO'); SOCIAL.rel('heroine_01').npcRom=30; ct('heroine_01'); G.flags.AN_ABROAD={log:ABL(3,[true,true,true]),tier:2,wk:3,n1:2,n2:1,n3:0}; rules(); const vq=OUT.get(G,'y3_ab_v4');
  check('AB4. 第 5 階＋回了：T3 視訊（她那邊 21:00、接起來）', G.flags.AN_ABROAD_TIER===3&&!!vq&&vq.h===20&&vq.verb==='接起來'&&vq.place==='視訊');
  await goOut('y3_ab_v4');
  check('AB4. 視訊第一組「你那邊幾點？……我算了一下，你應該剛吃完晚餐。」…「好，我要去睡了。下禮拜同一個時間。」；她和祐廷的戀愛各 +1；算回了；沒到約的時候不約', has('（畫面裡是她房間的書桌，手帳攤在旁邊。）')&&has('你那邊幾點？……我算了一下，你應該剛吃完晚餐。')&&has('好，我要去睡了。下禮拜同一個時間。')&&SOCIAL.rel('heroine_01').npcRom===31&&G.flags.AN_ABROAD.log.find(e=>e.wk===4).replied===true&&!has('……你要不要來看？'));
  fresh('2028-04-23',20.05,'dorm'); R('heroine_01','CLO'); SOCIAL.rel('heroine_01').npcRom=30; ct('heroine_01'); G.flags.AN_ABROAD={log:ABL(3,[true,false,false]),tier:3,wk:4,n1:2,n2:1,n3:1}; rules();
  check('AB5. 最近三則只回了一則：下一週退一段（T3→T2，不扣分）', G.flags.AN_ABROAD_TIER===2&&!!PHONE.byAsk(G,'y3_ab_w5')&&SOCIAL.rel('heroine_01').npcRom===30);
  fresh('2028-04-30',20.05,'dorm'); R('heroine_01','CLO'); SOCIAL.rel('heroine_01').npcRom=30; ct('heroine_01'); G.flags.AN_ABROAD={log:ABL(3,[true,true,true]),tier:3,wk:5,n1:2,n2:1,n3:1}; rules(); at('2028-04-30',20.6); OUT.tick(GM);
  check('AB5. 視訊沒接：算一次沒回', OUT.get(G,'y3_ab_v6').state==='missed'&&G.flags.AN_ABROAD.log.find(e=>e.wk===6).replied===false);
  fresh('2028-04-09',20.05,'dorm'); ct('heroine_01'); rules(); check('AB. 和以安不到 ACQUAINTANCE：沒有訊息', txt('p:heroine_01').length===0&&!G.flags.AN_ABROAD);
  fresh('2028-04-09',20.05,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FAM'); ct('heroine_01'); rules(); check('AB. 日本路線：沒有（她和你在日本）', !PHONE.sent(G,'y3_ab_w3'));
  fresh('2028-04-09',20.05,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); ROM.get(G,'heroine_01').status='ex'; rules(); check('AB. 和以安分手過：沒有訊息池', !PHONE.sent(G,'y3_ab_w3'));
  /* AA_508 0-2 第 1 點（31a4c4002）：交往中的臺灣、美國玩家也收 T1 十則，每週日一則；有月份的照月份（四月、六月、七月底）——沒有能傳的那一週就空著（之後照她的動態）*/
  { const J=x=>JSON.stringify(x); const runWeeks=(route)=>{ fresh('2028-03-26',20.05,'dorm',route?{EXCHANGE_ROUTE:route}:{}); R('heroine_01','CLO'); date('heroine_01'); ct('heroine_01'); const wk=[];
      for(let k=0;k<19;k++){ const d=D('2028-03-26')+7*k; if(d>=D('2028-08-05')) break; at(CALENDAR.dateOf(d).key,20.05); rules(); if(PHONE.sent(G,'y3_ab_w'+(k+1))) wk.push(k+1); } return wk; };
    const tw=runWeeks(null), t1=(G.flags.AN_ABROAD&&G.flags.AN_ABROAD.t1s)||[];
    check('AB8. AA_508 0-2 第 1 點：交往中（臺灣路線）每週日一則 T1：十則都傳到、各一次；有月份的那三則等到那個月（第 1～8 週、六月第一個週日第 11 週、7/23 第 18 週）', J(tw)===J([1,2,3,4,5,6,7,8,11,18])&&t1.length===10&&new Set(t1).size===10, J({tw,t1}));
    const m1=PHONE.byAsk(G,'y3_ab_w1'); check('AB8. 交往中的第一則也是「公寓房間，箱子還沒拆」、兩個回覆按鈕；段（AN_ABROAD_TIER）不動', !!m1&&m1.ask.opts.length===2&&G.flags.AN_ABROAD_TIER==null, J(m1&&m1.ask&&m1.ask.opts.map(o=>o.t)));
    const us=runWeeks('US'), jp=runWeeks('JP');
    check('AB8. 美國路線交往中一樣（8/2 才出發）；日本路線交往中沒有（她和你在日本）', J(us)===J(tw)&&jp.length===0, J({us,jp})); }
  /* 約：6/25 視訊（6/29 以前最後一次）→ 我去 → 7/6～7/10 → 8/5、8/6 */
  { fresh('2028-06-25',20.05,'dorm'); R('heroine_01','CLO'); Object.assign(SOCIAL.rel('heroine_01'),{npcRom:55,rom:30}); ct('heroine_01');
    G.trips=[{trip:'t1',who:'heroine_01',day:D('2028-02-01'),counted:true},{trip:'t2',who:'heroine_01',day:D('2028-03-01'),counted:true}];
    G.flags.AN_ABROAD={log:[{day:D('2028-06-11'),h:20,kind:'video',wk:12,tier:3,replied:true},{day:D('2028-06-18'),h:20,kind:'video',wk:13,tier:3,replied:true}],tier:3,wk:13,n1:4,n2:4,n3:2};
    rules(); picks=[0]; await goOut('y3_ab_v14');
    check('AB6. 6/25 視訊（6/29 以前最後一次）＋第 6 階＋出國前 2 次約會＋回覆率 ≥0.5：她約；「我去。」→「好。機票你自己訂，行程我排。」；排 7/6', has('七月七號，這邊是七夕。商店街會掛很多竹子。')&&has('……你要不要來看？')&&has('好。機票你自己訂，行程我排。')&&G.flags.AN_JP_TRIP===true&&(OUT.get(G,'y3_an_tanabata')||{}).day===D('2028-07-06'), JSON.stringify(lines()));
    at('2028-07-06',7.8); picks=[1]; cards=[]; await goOut('y3_an_tanabata');
    check('AN1. 7/6 剪票口「這裡。行程表我印了兩份，這份給你。」；7/7 不說＝「你不說，那我說。」→ 交往；7/8、7/9 摘要日；7/10「八月五號，你來接我。」', has('這裡。行程表我印了兩份，這份給你。')&&has('（商店街掛滿了竹子，短冊在風裡一直響。）')&&has('你不說，那我說。')&&has('我喜歡你。理由我寫在手帳裡，回臺灣再給你看。')&&has('（她排的行程表上，每一格都有時間。你們只走完一半。）')&&has('（大學城的河堤。她讀書，你坐在旁邊看河。）')&&has('八月五號，你來接我。')&&G.flags.dating_heroine_01===true&&G.flags.AN_TANABATA==='confess', JSON.stringify(lines()));
    check('AN1. 這一趟算 2 次正式約會、也算她的心願地點；回到臺灣是 7/10；沒有 7/7 竹子的照片', (DATE.log(G,'heroine_01').count|0)>=2&&DATE.log(G,'heroine_01').wish===true&&G.day===D('2028-07-10')&&!PHONE.sent(G,'y3_ab_tana_photo'));
    at('2028-08-04',10); rules(); const aq=OUT.get(G,'y3_an_airport');
    check('AN1. 8/5 出發選單「桃園機場（接以安）」', !!aq&&aq.title==='桃園機場（接以安）'&&aq.day===D('2028-08-05'));
    at('2028-08-05',14.5); await goOut('y3_an_airport'); check('AN1. 機場「（她一出來就看到你。行李箱上貼著一張商店街的七夕貼紙。）」「……你真的來了。」', has('……你真的來了。'));
    at('2028-08-06',10); rules(); at('2028-08-06',15.9); await goOut('y3_an_notebook');
    check('AN1. 8/6 16:00 Café 窗邊：「（第一頁寫著：「理由欄。空著，給你。」）」；AN_NOTEBOOK_GIFT', has('（第一頁寫著：「理由欄。空著，給你。」）')&&G.flags.AN_NOTEBOOK_GIFT===true); }
  { fresh('2028-06-25',20.05,'dorm'); R('heroine_01','CLO'); Object.assign(SOCIAL.rel('heroine_01'),{npcRom:55,rom:30}); ct('heroine_01');
    G.trips=[{trip:'t1',who:'heroine_01',day:D('2028-02-01'),counted:true},{trip:'t2',who:'heroine_01',day:D('2028-03-01'),counted:true}];
    G.flags.AN_ABROAD={log:[{day:D('2028-06-11'),h:20,kind:'video',wk:12,tier:3,replied:true},{day:D('2028-06-18'),h:20,kind:'video',wk:13,tier:3,replied:true}],tier:3,wk:13,n1:4,n2:4,n3:2};
    rules(); picks=[0,0]; await goOut('y3_ab_v14'); at('2028-07-06',7.8); await goOut('y3_an_tanabata');
    check('AN. 七夕選「以安，我喜歡妳。」→「……我知道。我等你說，等了三個月。」「好。」→ 交往', has('……我知道。我等你說，等了三個月。')&&G.flags.dating_heroine_01===true); }
  /* AA_343 D2（改了期待值）：6/30（五）20:30（她那邊 21:30）兩則；「我去。」／「這次不行。」各回一句；7/2（日）21:00 還沒回＝這次不行 */
  fresh('2028-06-30',20.1,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); G.flags.AN_ABROAD={log:[],tier:3,wk:14,n1:0,n2:0,n3:0}; G.flags.AN_JP_TRIP_ASK='later'; rules();
  check('AB7. D2 20:06 還沒傳（20:30 才傳）', !PHONE.sent(G,'y3_ab_reask'));
  at('2028-06-30',20.55); rules();
  { const m=PHONE.byAsk(G,'y3_ab_reask'); check('AB7. 「我再看看」：6/30 20:30（她那邊 21:30）「六月最後一天。」「七月七號。……你要不要來看？」＋「我去。」／「這次不行。」', txt('p:heroine_01').join('|')==='heroine_01:六月最後一天。|heroine_01:七月七號。……你要不要來看？'&&!!m&&m.ask.opts.map(o=>o.t).join('|')==='我去。|這次不行。'&&m.h>=20.5&&m.h<20.6, JSON.stringify(txt('p:heroine_01'))); }
  answer('y3_ab_reask',0); rules(); check('AB7. 「我去。」→ 以安「好。機票你自己訂，行程我排。」（照第一次）；排 7/6 出發', txt('p:heroine_01').slice(-1)[0]==='heroine_01:好。機票你自己訂，行程我排。'&&(OUT.get(G,'y3_an_tanabata')||{}).day===D('2028-07-06'));
  fresh('2028-06-30',20.55,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); G.flags.AN_ABROAD={log:[],tier:3,wk:14,n1:0,n2:0,n3:0}; G.flags.AN_JP_TRIP_ASK='later'; rules(); answer('y3_ab_reask',1); rules(); at('2028-07-07',20.1); rules();
  check('AB7. 「這次不行。」→ 以安「好。我拍竹子給你看。」；沒有這一趟、7/7 竹子的照片', txt('p:heroine_01').includes('heroine_01:好。我拍竹子給你看。')&&G.flags.AN_JP_TRIP_ASK==='no'&&!OUT.get(G,'y3_an_tanabata')&&PHONE.sent(G,'y3_ab_tana_photo'));
  fresh('2028-06-30',20.55,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); G.flags.AN_ABROAD={log:[],tier:3,wk:14,n1:0,n2:0,n3:0}; G.flags.AN_JP_TRIP_ASK='later'; rules(); at('2028-07-02',20.9); rules();
  check('AB7. 7/2 21:00 以前還可以回（按鈕還在）', G.flags.AN_JP_TRIP_ASK==='later'&&PHONE.askOpen(G,PHONE.byAsk(G,'y3_ab_reask')));
  at('2028-07-02',21.1); rules();
  check('AB7. 7/2（日）21:00 還沒回＝這次不行（沒有這一趟、沒有那句回話）', G.flags.AN_JP_TRIP_ASK==='none'&&!OUT.get(G,'y3_an_tanabata')&&!txt('p:heroine_01').includes('heroine_01:好。我拍竹子給你看。'));
  fresh('2028-07-07',20.1,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); G.flags.AN_ABROAD={log:[],tier:1,wk:15,n1:0,n2:0,n3:0}; rules(); answer('y3_ab_tana_photo',0);
  check('AN2. 條件沒到：7/7 她那邊 21:00「（照片：商店街的竹子，短冊在風裡）」「七夕。這邊的人很認真寫願望。」；「妳寫了什麼？」→「不告訴你。」；AN_TANABATA photo', txt('p:heroine_01').join('|')==='heroine_01:（照片：商店街的竹子，短冊在風裡）|heroine_01:七夕。這邊的人很認真寫願望。|player:妳寫了什麼？|heroine_01:不告訴你。'&&G.flags.AN_TANABATA==='photo', JSON.stringify(txt('p:heroine_01')));
  fresh('2028-07-05',20,'dorm'); R('heroine_01','FAM'); ct('heroine_01'); G.flags.AN_JP_TRIP_ASK='go'; G.flags.AN_ABROAD={log:[],tier:3,wk:15,n1:0,n2:0,n3:0}; rules(); at('2028-07-06',9.2); OUT.tick(GM); at('2028-07-07',20.1); rules();
  check('AN. 答應了、7/6 沒出發：照條件沒到那一版（7/7 竹子的照片）', OUT.get(G,'y3_an_tanabata').state==='missed'&&PHONE.sent(G,'y3_ab_tana_photo'));
  { const m1=(G.msgs||[]).find(m=>m.th==='p:heroine_01'&&m.text==='我在剪票口。'), m2=(G.msgs||[]).find(m=>m.th==='p:heroine_01'&&m.text==='……行程表我收起來了。');
    check('AN. D4 答應了、7/6 沒出發：15:30「我在剪票口。」、18:00「……行程表我收起來了。」（臺灣時間）；之後 7/7 照片、AN_TANABATA photo', !!m1&&m1.day===D('2028-07-06')&&Math.abs(m1.h-15.5)<0.02&&!!m2&&m2.day===D('2028-07-06')&&Math.abs(m2.h-18)<0.02&&G.flags.AN_TANABATA==='photo', JSON.stringify([m1,m2])); }

  // ---------- 第 3 節：大三寒暑假的停點（BREAK_PTS Y3W／Y3S＋HOME.STOPS）----------
  const fmt=t=>{ const d=Math.floor(t/24), x=CALENDAR.dateOf(d); return x.m+'/'+x.d+' '+(+(t-d*24).toFixed(2)); };
  const seq=(k0,k1)=>{ const out=[]; let t=Tm(D(k0),0); const end=Tm(D(k1),24); for(let i=0;i<80;i++){ const x=HOME.breakNext(G,t); if(x==null||x>end) break; out.push(fmt(x)); t=x; } return out; };
  fresh('2028-01-20',9,'dorm',{EXCHANGE_ROUTE:'TW'});
  { const P=HOME.breakPts(G).map(p=>fmt(Tm(p.day,p.h))+' '+p.k); check('BP1. 大三寒假（Y3W）表上：除夕 1/25 12:00、初一 1/26 11:00，寒假最後一天 2/20 17:00 回宿舍（HOME.breakPts 自己補）', P.join('|')==='1/25 12 eve|1/26 11 cny|2/20 17 back', JSON.stringify(P)); }
  { const L=seq('2028-01-20','2028-02-20'); check('BP1. 台灣路線快轉停點：除夕 12:00 → 初一 11:00 → 2/20 17:00（沒有 14:00）', L.join('|')==='1/25 12|1/26 11|2/20 17', JSON.stringify(L)); }
  G.flags.EXCHANGE_ROUTE='JP'; { const L=seq('2028-01-20','2028-02-20'); check('BP1. 日本路線：2/20 14:00 X1 退宿也停', L.includes('2/20 14')&&L.includes('1/26 11'), JSON.stringify(L)); }
  fresh('2028-01-26',11,'dorm',{EXCHANGE_ROUTE:'TW'}); HOME.rec(G).at=true; HOME.rec(G).lbreak='Y3W';
  check('BP2. 初一 11:00 停在家：主線 9 ev_family_land_y3 可以演（在家的第一個時段）', EVENTS.check(ev('ev_family_land_y3'))&&ev('ev_family_land_y3').trigger==='home', JSON.stringify((HOME.breakEvent(G)||{}).id));
  fresh('2028-06-12',9,'dorm',{EXCHANGE_ROUTE:'TW'});
  { const P=HOME.breakPts(G).map(p=>fmt(Tm(p.day,p.h))+' '+p.k); check('BP3. 大三暑假（Y3S）表上：7/9 語彤生日、7/15 抽籤、9/3 08:30 主線 10', P.join('|')==='7/9 12 ytbday|7/15 10 lottery4|9/3 8.5 room', JSON.stringify(P)); }
  { const L=seq('2028-06-12','2028-09-03'); check('BP3. 台灣路線：6/19 21:00 三選一、6/26、7/24、8/21 18:30 摘要日、7/9、7/15、9/3 08:30；沒有 7/25、7/31、8/5', ['6/19 21','6/26 18.5','7/9 12','7/15 10','7/24 18.5','8/21 18.5','9/3 8.5'].every(x=>L.includes(x))&&!['7/25 14','7/31 18.5','8/5 21'].some(x=>L.includes(x)), JSON.stringify(L)); }
  G.flags.EXCHANGE_ROUTE='US'; { const L=seq('2028-06-12','2028-08-01'); check('BP3. 美國路線：7/25 14:00 退宿、7/31 18:30 第三個摘要日', ['6/19 21','6/26 18.5','7/24 18.5','7/25 14','7/31 18.5'].every(x=>L.includes(x)), JSON.stringify(L)); }
  G.flags.EXCHANGE_ROUTE='JP'; { const L=seq('2028-06-12','2028-09-03'); check('BP3. 日本路線（AA_349 L2）：沒有三選一（6/19、8/5 都沒有）、這裡沒有摘要日（8/21 那一句在 jp3d.js 的 JP.SCH）', !L.includes('8/5 21')&&!L.includes('8/21 18.5')&&!L.includes('6/19 21')&&!L.includes('6/26 18.5')&&!L.includes('7/24 18.5'), JSON.stringify(L)); }

  // ---------- 2-Y3-54 大三暑假 ----------
  fresh('2028-06-19',21.05,'dorm'); rules();
  { const m=PHONE.byAsk(G,'y3_summer_plan'); check('S0. 台灣路線 6/19（一）21:00 手機「這個暑假要做什麼？」三選一', !!m&&m.text==='這個暑假要做什麼？'&&m.ask.opts.map(o=>o.t).join('|')==='法律服務中心的暑期實習|打工|在家開始讀國考的書'); }
  answer('y3_summer_plan',0); check('S1. 選實習：SUMMER_Y3 intern（選項不當成你傳出去的話）', G.flags.SUMMER_Y3==='intern'&&!txt('sys').some(t=>/^player:/.test(t)));
  at('2028-06-26',18.5); said=[]; await HOME.breakArrive(GM); check('S1. 6/26 摘要日「實習第一天，你負責影印。影印機比你還資深。」', has('實習第一天，你負責影印。影印機比你還資深。'), JSON.stringify(lines()));
  at('2028-07-24',18.5); said=[]; await HOME.breakArrive(GM); check('S1. 7/24「你第一次自己寫完一份初談紀錄。律師只改了兩個字。」', has('你第一次自己寫完一份初談紀錄。律師只改了兩個字。'));
  at('2028-08-21',18.5); said=[]; await HOME.breakArrive(GM); check('S1. 8/21「最後一天，主任說：『明年考完，再來。』」', has('最後一天，主任說：『明年考完，再來。』'));
  /* AA_343 D7（改了期待值）：實習的物件名稱「空白的初談紀錄表」、拿起來的旁白 */
  { const L=STORY.roomY4Items(G), r=L.find(x=>x[0]==='sum_intern'); check('S1. D7 9/3 第四個房間多一件「空白的初談紀錄表」＋旁白「（實習帶回來的初談紀錄表，空白的。第一次自己寫完的那一份，交給律師了。）」（收拾的名字也對得到）', !!r&&r[1]==='空白的初談紀錄表'&&JSON.stringify(r[2])===JSON.stringify(['（實習帶回來的初談紀錄表，空白的。第一次自己寫完的那一份，交給律師了。）'])&&STORY.roomItemName(G,'sum_intern')==='空白的初談紀錄表', JSON.stringify(r)); }
  /* AA_343 D6（改了期待值）：家教那一套換字，住宿舍的也有自己那一句 */
  fresh('2028-06-26',18.5,'dorm',{SUMMER_Y3:'work'}); said=[]; await HOME.breakArrive(GM); check('S. D6 打工（家教）、住宿舍：6/26「暑假學生的課排得比學期中多。宿舍沒什麼人，你每次都是第一個出門。」', has('暑假學生的課排得比學期中多。宿舍沒什麼人，你每次都是第一個出門。')&&!said.some(s=>/從家裡/.test(s.t)), JSON.stringify(said.map(x=>x.t)));
  HOME.rec(G).at=true; said=[]; await HOME.breakArrive(GM); check('S. D6 打工（家教）、住家裡：6/26「暑假學生的課排得比學期中多。你從家裡搭捷運去。」', has('暑假學生的課排得比學期中多。你從家裡搭捷運去。')&&!has('暑假的班比學期中多。你從家裡搭捷運去。'), JSON.stringify(said.map(x=>x.t)));
  at('2028-07-24',18.5); said=[]; await HOME.breakArrive(GM); check('S. 打工 7/24：家教那一句（大三下沒有別的打工＝照家教）', has('學生問你，法律系是不是都在背。你說：『背完以後才開始。』'));
  at('2028-08-21',18.5); said=[]; await HOME.breakArrive(GM); check('S. D6 打工（家教）8/21：「最後一堂課，學生的媽媽塞了一盒水果給你。」（不是「老闆多給了一個便當」）', has('最後一堂課，學生的媽媽塞了一盒水果給你。')&&!has('最後一班，老闆多給了一個便當。'), JSON.stringify(said.map(x=>x.t)));
  { const L=STORY.roomY4Items(G), r=L.find(x=>x[0]==='sum_tutor'); check('S. D7 打工・家教：房間多「家教學生的卡片」（取代「那家店的班表」）＋旁白「（家教學生最後一堂課給的卡片。上面寫著：『老師，背完以後才開始，對嗎？』）」', !!r&&r[1]==='家教學生的卡片'&&JSON.stringify(r[2])===JSON.stringify(['（家教學生最後一堂課給的卡片。上面寫著：『老師，背完以後才開始，對嗎？』）'])&&!L.some(x=>x[0]==='sum_work')&&STORY.roomItemName(G,'sum_tutor')==='家教學生的卡片', JSON.stringify(L.slice(-1))); }
  { global.JOBS={any:()=>'noodle'}; try{ fresh('2028-06-26',18.5,'dorm',{SUMMER_Y3:'work'}); said=[]; await HOME.breakArrive(GM); const a=has('暑假的班比學期中多。宿舍沒什麼人，你每天第一個出門。');
      at('2028-08-21',18.5); said=[]; await HOME.breakArrive(GM); const b=has('最後一班，老闆多給了一個便當。'); const L=STORY.roomY4Items(G), r=L.find(x=>x[0]==='sum_work');
      check('S. D6、D7 以後有其他打工（假裝麵店）：住宿舍的 6/26「暑假的班比學期中多。宿舍沒什麼人，你每天第一個出門。」、8/21 原稿那一句、房間「那家店的班表」＋「（暑假的班表。最後一班那一格，老闆畫了一個便當。）」', a&&b&&!!r&&r[1]==='那家店的班表'&&r[2][0]==='（暑假的班表。最後一班那一格，老闆畫了一個便當。）'); } finally{ delete global.JOBS; } }
  fresh('2028-09-04',9,'dorm',{SUMMER_Y3:'study',ROOM_Y4:D('2028-09-03')}); { const L=STORY.roomY4Items(G), b=STORY.roomItemList(G)[0];
    check('S. D7 讀國考：不另外放（沒有第二本《民法》）；大一那本舊《民法》在第四個房間的說明換成「（大一的《民法》。書角都翻捲了。這個暑假，又從第一頁讀起。）」', !L.some(x=>/民法/.test(x[1]))&&b[0]==='書架上的舊《民法》'&&b[1]==='（大一的《民法》。書角都翻捲了。這個暑假，又從第一頁讀起。）', JSON.stringify([L.map(x=>x[1]),b])); }
  fresh('2028-09-04',9,'dorm',{SUMMER_Y3:'intern',ROOM_Y4:D('2028-09-03')}); check('S. D7 不是讀國考的：舊《民法》照原本的說明', STORY.roomItemList(G)[0][1]==='現在知道，要先問是誰、向誰、依據什麼、要什麼。');
  fresh('2028-06-19',21.05,'dorm',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); rules(); answer('y3_summer_plan',2); at('2028-07-31',18.5); said=[]; await HOME.breakArrive(GM);
  check('S2. 美國路線：第三個摘要日在 7/31（「姊姊回家，看到你的筆記：『這是你寫的？字變小了。』」）', has('姊姊回家，看到你的筆記：『這是你寫的？字變小了。』'));
  at('2028-08-21',18.5); said=[]; await HOME.breakArrive(GM); check('S2. 美國路線 8/21 沒有摘要的那一句', !has('姊姊回家，看到你的筆記：『這是你寫的？字變小了。』'));
  fresh('2028-06-19',21.5,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); check('S3. 日本路線：6/19 沒有三選一', !PHONE.sent(G,'y3_summer_plan'));
  /* AA_349 L2（2026-10-21）：AA_343 D5 日本路線作廢——日本路線沒有三選一（8/5 也沒有）、8/21 只有一句不看三選一（在 jp3d.js 的 JP.SCH，這裡不播）；9/3 的房間沒有三選一的物件 */
  at('2028-08-05',21.1); rules(); at('2028-08-08',12); rules(); at('2028-08-21',18.5); said=[]; await HOME.breakArrive(GM);
  check('S3. L2 日本路線：8/5 晚上也沒有三選一、過了也不設預設；r2y3b 的 8/21 不播（日本那一句在 jp3d.js）', !PHONE.sent(G,'y3_summer_plan')&&!G.flags.SUMMER_Y3&&said.length===0, JSON.stringify([G.flags.SUMMER_Y3,said.map(x=>x.t)]));
  check('S3. L2 日本路線：快轉不停在 8/5 21:00、8/21 18:30（R2Y3B.stops）', (()=>{ const st=(R2Y3B.stops(G)||[]).map(x=>x-Tm(D('2028-08-05'),0)); return !st.includes(21)&&!st.includes(16*24+18.5); })(), JSON.stringify(R2Y3B.stops(G)));
  { fresh('2028-07-24',18.5,'dorm',{SUMMER_Y3:'work'}); const jk=R2Y3B.jobKind; R2Y3B.jobKind=()=>'cafe'; const l=R2Y3B.sumLine(G,1); R2Y3B.jobKind=()=>'tutor'; const t=R2Y3B.sumLine(G,1); R2Y3B.jobKind=jk;
    check('S2b. AA_350 M5：家教以外的打工 7/24 有那一句（原本 null 不播）；家教照舊',l==='七月最熱的那個禮拜，店裡的冷氣壞了三天。你學會一邊流汗，一邊說『歡迎光臨』。'&&t==='學生問你，法律系是不是都在背。你說：『背完以後才開始。』',JSON.stringify([l,t])); }
  for(const k of ['intern','work']){ fresh('2028-09-04',9,'dorm',{EXCHANGE_ROUTE:'JP',SUMMER_Y3:k,ROOM_Y4:D('2028-09-03')}); check('S3. L2 日本路線（舊存檔有 SUMMER_Y3＝'+k+'）：9/3 的房間沒有三選一的物件', R2Y3B.roomSummer(G)===null&&!STORY.roomY4Items(G).some(x=>/^sum_/.test(x[0])), JSON.stringify(STORY.roomY4Items(G).map(x=>x[0]))); }
  /* AA_343 D8：三選一沒回（台灣、美國 6/21 21:00 以前）＝預設：有打工 'work'、沒有 'study'；不傳訊息，摘要日照預設那一套 */
  fresh('2028-06-19',21.05,'dorm'); rules(); at('2028-06-21',20.9); rules(); check('S4. D8 三選一 6/21 21:00 以前還可以回', !G.flags.SUMMER_Y3&&PHONE.askOpen(G,PHONE.byAsk(G,'y3_summer_plan')));
  { const n0=(G.msgs||[]).length; at('2028-06-21',21.1); rules(); check('S4. D8 沒回（沒有打工）＝預設 study；不傳訊息', G.flags.SUMMER_Y3==='study'&&(G.msgs||[]).length===n0); }
  at('2028-06-26',18.5); said=[]; await HOME.breakArrive(GM); check('S4. D8 預設 study：6/26 摘要日照那一套播', has('你把大一的《民法》從紙箱裡拿出來。書角都翻捲了。'));
  fresh('2028-06-19',21.05,'dorm',{JOB_TUTOR:true}); rules(); at('2028-06-21',21.1); rules(); check('S4. D8 沒回、有打工（家教）＝預設 work', G.flags.SUMMER_Y3==='work');
  fresh('2028-07-15',10,'dorm'); said=[]; await HOME.breakArrive(GM);
  check('L4. 台灣路線 7/15 10:00：宿舍系統那一則先到，旁白「（最後一次抽籤。四樓。）」', has('（最後一次抽籤。四樓。）')&&txt('g:dorm').some(t=>t.endsWith('大四宿舍抽籤結果：已分配。請於 9/3 前完成入住。')));
  fresh('2028-07-15',10,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); said=[]; await HOME.breakArrive(GM); check('L4. 日本路線：沒有那一句旁白（姊姊幫你填表）', !has('（最後一次抽籤。四樓。）'));
  fresh('2028-07-09',12.1,'dorm'); grpJoin(); R('heroine_03','FAM'); R('yu','FAM'); rules(); answer('yt_bday_y3',0);
  check('YT. 7/9 12:00 麵店團 Alison「今天語彤生日！」→「傳一句生日快樂」→ 語彤「……謝謝。今年的田野，訪問到第二十二個了。」（AA_509 0-2 第 2 點）', txt('g:noodle_team').includes('yu:今天語彤生日！')&&txt('g:noodle_team').includes('player:生日快樂。')&&txt('g:noodle_team').includes('heroine_03:……謝謝。今年的田野，訪問到第二十二個了。')&&G.flags.YT_BDAY_Y3===true, JSON.stringify(txt('g:noodle_team')));
  fresh('2028-07-09',12.1,'dorm'); R('heroine_03','FAM'); rules(); check('YT. 不在群組、和語彤 FAMILIAR 以上：她的私訊放同一個按鈕', !!PHONE.byAsk(G,'yt_bday_y3')&&txt('p:heroine_03').includes(':今天是語彤的生日。'));
  fresh('2028-08-04',21.1,'dorm'); date('heroine_02'); ct('heroine_02'); rules(); const zsq=OUT.get(G,'y3_zr_slips');
  check('ZS0. 和芷若交往中（台灣路線）：8/4 21:00 兩則（不用回）；排 8/5 14:00「兩點半（店休）」', txt('p:heroine_02').join('|')==='heroine_02:明天店休。下午兩點，來店裡。|heroine_02:門會鎖著。敲三下。……我跟老闆借了一個下午。'&&!!zsq&&zsq.day===D('2028-08-05')&&zsq.h===14&&zsq.place==='兩點半（店休）'&&!PHONE.pending(G).some(m=>m.th==='p:heroine_02'), JSON.stringify(txt('p:heroine_02')));
  picks=[1]; await run('ev_zhiruo_twelve_slips');
  check('ZS1. 去了：「你敲了四下。」…「第十二張是空的。」「那一部，等我回來，一起寫。」；ZR_TWELVE_SLIPS', has('（開門）你敲了四下。……算了，進來。')&&has('那一部，等我回來，一起寫。')&&has('……好，寫長一點也可以。')&&G.flags.ZR_TWELVE_SLIPS===true);
  /* AA_343 D8（改了期待值）：照 BB_165 3-2 的 10-18 加註——沒到＝16:00 照片、信封放在吧檯下面，下次她上班時進 Café 拿；9/1 以前都沒拿＝9/1 21:00 兩則、老闆給；日本路線 8/12；8/21「信封到了」作廢 */
  fresh('2028-08-04',21.1,'dorm'); date('heroine_02'); ct('heroine_02'); rules(); at('2028-08-05',14.6); OUT.tick(GM); at('2028-08-05',16.1); rules(); at('2028-08-21',18.5); said=[]; await HOME.breakArrive(GM);
  check('ZS2. D8 14:30 還沒到：16:00「（照片：十二張點單疊在一個信封裡）」「第一部，我先一個人看了」「信封放在吧檯下面。下次來拿」；8/21 沒有「信封到了」；還沒拿到', txt('p:heroine_02').slice(-3).join('|')==='heroine_02:（照片：十二張點單疊在一個信封裡）|heroine_02:第一部，我先一個人看了|heroine_02:信封放在吧檯下面。下次來拿'&&(m=>!!m&&m.day===D('2028-08-05')&&m.h>=16&&m.h<16.2)(G.msgs.find(m=>m.text==='信封放在吧檯下面。下次來拿'))&&!said.some(s=>/信封到了/.test(s.t))&&G.flags.ZR_SLIPS_WAIT==='bar'&&!G.flags.ZR_TWELVE_SLIPS, JSON.stringify(txt('p:heroine_02').slice(-3)));
  { const B=ev('ev_zhiruo_slips_bar'), O=ev('ev_zhiruo_slips_owner'); G.zone='cafe'; at('2028-08-22',15); check('ZS2. D8 她不在店裡（沒上班）：還不能拿', !!B&&!EVENTS.check(B));
    GM.npc.heroine_02={id:'heroine_02',charId:'heroine_02',obj:{position:{x:0.5,y:0,z:0}},lv:0}; E.npcs.push(GM.npc.heroine_02); check('ZS2. D8 下次她上班時進 Café：可以演；老闆那一版不演', !!B&&!!O&&EVENTS.check(B)&&!EVENTS.check(O));
    if(B) await run('ev_zhiruo_slips_bar'); check('ZS2. D8 她從吧檯下面拿出信封：「下一部，你不准先看。」；ZR_TWELVE_SLIPS bar；9/1 不再傳', has('下一部，你不准先看。')&&G.flags.ZR_TWELVE_SLIPS==='bar'&&(at('2028-09-01',21.1),rules(),!PHONE.sent(G,'y3_zr_slips_fly'))); }
  fresh('2028-08-04',21.1,'dorm'); date('heroine_02'); ct('heroine_02'); rules(); at('2028-08-05',14.6); OUT.tick(GM); at('2028-08-05',16.1); rules(); at('2028-09-01',20.9); rules();
  check('ZS2. D8 9/1 21:00 以前還沒傳；9/1 是週五', !PHONE.sent(G,'y3_zr_slips_fly')&&CALENDAR.dateOf(D('2028-09-01')).wd%7===5);
  at('2028-09-01',21.1); rules(); check('ZS2. D8 9/1 以前都沒拿：9/1 21:00「我明天的飛機」「信封交給老闆了，你去店裡跟他拿」', txt('p:heroine_02').slice(-2).join('|')==='heroine_02:我明天的飛機|heroine_02:信封交給老闆了，你去店裡跟他拿'&&G.flags.ZR_SLIPS_WAIT==='owner');
  { const O=ev('ev_zhiruo_slips_owner'); G.zone='cafe'; at('2028-09-03',15); check('ZS2. D8 之後第一次進 Café：老闆那一版可以演', !!O&&EVENTS.check(O));
    if(O) await run('ev_zhiruo_slips_owner'); check('ZS2. D8 老闆給信封：旁白「（信封上是她的字：下一部，你不准先看。）」；ZR_TWELVE_SLIPS owner', JSON.stringify(said.map(x=>x.t))===JSON.stringify(['（信封上是她的字：下一部，你不准先看。）'])&&G.flags.ZR_TWELVE_SLIPS==='owner'); }
  fresh('2028-08-04',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_02'); date('heroine_01'); ct('heroine_02'); rules(); at('2028-08-05',21); rules(); at('2028-08-11',21.1); rules(); const zsj=OUT.get(G,'y3_zr_slips');
  check('ZS3. D8 日本路線（8/5 當天才回來）：改 8/11（五）21:00 邀約（台詞相同）→ 8/12（六）14:00；8/4 沒有', txt('p:heroine_02').join('|')==='heroine_02:明天店休。下午兩點，來店裡。|heroine_02:門會鎖著。敲三下。……我跟老闆借了一個下午。'&&(G.msgs.find(m=>m.text==='明天店休。下午兩點，來店裡。')||{}).day===D('2028-08-11')&&!!zsj&&zsj.day===D('2028-08-12')&&zsj.h===14, JSON.stringify([txt('p:heroine_02'),zsj]));
  fresh('2028-08-04',21.1,'dorm',{EXCHANGE_ROUTE:'US'}); date('heroine_02'); date('heroine_05'); ct('heroine_02'); rules(); check('ZS. 美國路線（8/2 起在國外）：沒有這一場', !PHONE.sent(G,'y3_zr_slips')&&G.flags.ZR_SLIPS_MAIL==null);

  // ---------- 2-Y3-46 芷若 Z13「杯子上的字」（大三下學期末的專屬版）----------
  const zt='te_Y3S2_heroine_02', qt='te_Y3S2_heroine_04';
  const zrSetup=fl=>{ fresh('2028-06-08',20.6,'dorm',Object.assign({CAFE_VISITS:3},fl||{})); R('heroine_02','CLO'); SOCIAL.rel('heroine_02').npcRom=40; ct('heroine_02'); const L=DATE.log(G,'heroine_02'); L.count=4; L.wish=true; for(const t of ['ASKED_HER_DRINK','REMEMBERED_HER','WATCHED_FILM','POSTCARDS']) SOCIAL.remember('heroine_02',t,''); };
  zrSetup(); rules();
  check('Z13-C0. 兩個條件都到：6/8（四）20:30 邀約換成「畢業以後我還有幾個班。」「下禮拜四打烊以後，你要不要來？……店裡只剩我。」', txt('p:heroine_02').join('|')==='heroine_02:畢業以後我還有幾個班。|heroine_02:下禮拜四打烊以後，你要不要來？……店裡只剩我。'&&TERMEND.rec(G,'Y3S2').plan.special.heroine_02==='z13', JSON.stringify(txt('p:heroine_02')));
  answer(zt,0); rules(); const zq=OUT.get(G,'te_Y3S2');
  check('Z13-C0. 「好。」＝排 6/15（四）22:00 兩點半打烊後（窗口到 23:00）', !!zq&&zq.day===D('2028-06-15')&&zq.h===22&&zq.late===1&&zq.te.special==='z13', JSON.stringify(zq));
  CG_REGISTRY.cg_cup_words_heroine02={file:'x'}; at('2028-06-15',21.8); picks=[0]; cgs=[]; await goOut('te_Y3S2'); delete CG_REGISTRY.cg_cup_words_heroine02;
  check('Z13-C1. 開場照打烊後的 Café；吃完回吧檯：杯子上「熱可可＋濃縮」＋CG（推過來那一句）；「我的點法，我只給過一個人。」；三個選項', has('（店裡的燈關了一半。她把「準備中」的牌子翻過去，在你對面坐下。）')&&has('（是她自己的點法：「熱可可＋濃縮」。）')&&cgs.join()==='cg_cup_words_heroine02'&&has('（很久，沒有轉過來）我的點法，我只給過一個人。')&&opts.some(o=>o.join('|')==='（喝下去）|「芷若。」|「這杯我不能喝。」'), JSON.stringify(lines()));
  /* AA_343 D9（改了期待值）：「很久以後」寫成旁白；芷若／祐廷／芷若 */
  { const W=['（她轉過來，看到你在喝，沒有說話。過了很久。）','林芷若：……好喝嗎？','祐廷：很幼稚。','林芷若：對。','（她笑出來，眼眶紅了一下。）'], L=lines(), i=L.indexOf(W[0]);
    check('Z13-C1. D9 喝下去：「（她轉過來，看到你在喝，沒有說話。過了很久。）」「……好喝嗎？」（芷若）「很幼稚。」（祐廷）「對。」（芷若）「（她笑出來，眼眶紅了一下。）」（逐字、順序）→ 交往；ZR_CUP drank；不走回家的路', i>=0&&JSON.stringify(L.slice(i,i+5))===JSON.stringify(W)&&!L.some(t=>/很久以後/.test(t))&&G.flags.dating_heroine_02===true&&G.flags.ZR_CUP==='drank'&&!has('今天吃得很開心。……你要說什麼？'), JSON.stringify(L.slice(i<0?0:i,(i<0?0:i)+6))); }
  { const L=said.map(x=>x.t), t=L.indexOf('我這學期翻了一本小說，翻到一半。……主角還沒說出口。'), c=L.indexOf('（她回到吧檯，收完機器，又做了一杯。是你的老樣子。可是杯子上用麥克筆寫的不是你的名字。）');
    check('Z13-C1. D9 AA_254 的飯桌一句放在 Z13 的飯裡：「我這學期翻了一本小說，翻到一半。……主角還沒說出口。」（芷若，吃飯的時候、杯子以前）', t>0&&c>t&&said[t].who!==null, JSON.stringify(L.slice(0,8))); }
  zrSetup(); rules(); answer(zt,0); rules(); at('2028-06-15',21.8); picks=[1,0]; await goOut('te_Y3S2');
  check('Z13-C2. 「芷若。」：「……你要說什麼，等一下再說。我現在沒辦法看你。」→ 台階「……好。你說。」；「我喜歡妳。」→「……我知道。杯子上寫了。」→ 交往；ZR_CUP steps', has('……你要說什麼，等一下再說。我現在沒辦法看你。')&&has('（她把店收完，關了燈。你們坐在店門口的台階上。）')&&has('……好。你說。')&&has('……我知道。杯子上寫了。')&&G.flags.dating_heroine_02===true&&G.flags.ZR_CUP==='steps');
  zrSetup(); R('npc_fangyt','FAM'); rules(); answer(zt,0); rules(); at('2028-06-15',21.8); picks=[2]; await goOut('te_Y3S2');
  check('Z13-C. 「這杯我不能喝。」：「……嗯。」「那這杯我自己喝。我們還是朋友。」；這學期不交往（不是「讓我想想」）', has('那這杯我自己喝。我們還是朋友。')&&has('（她笑了，是真的笑。）')&&!G.flags.dating_heroine_02&&G.flags.ZR_CUP==='declined'&&TERMEND.rec(G,'Y3S2').result==='declined'&&TERMEND.rec(G).think.heroine_02==null);
  G.flags.FANG_F3_DELAY=true; at('2028-06-19',21.1); rules(); check('Z13-C. 之後方奕廷 F3 照常在 6/19（AA_334 第 3 節）', (OUT.get(G,'y3_fang_f3')||{}).day===D('2028-06-19'));
  fresh('2028-06-08',20.6,'dorm'); R('heroine_02','CLO'); SOCIAL.rel('heroine_02').npcRom=40; ct('heroine_02'); { const L=DATE.log(G,'heroine_02'); L.count=4; L.wish=true; } rules();
  check('Z13-C3. 只有心意邀約的條件：一般版的邀約（AA_254 第 4 節；大三下週四十點，AA_377 第 8 項）', txt('p:heroine_02').join('|')==='heroine_02:這禮拜四我十點下班。……你要不要等我？我想吃飯，不想吃店裡的東西。'&&!TERMEND.rec(G,'Y3S2').plan.special.heroine_02);
  answer(zt,0); rules(); { const q=OUT.get(G,'te_Y3S2'); check('Z13-C3. 一般版的飯：週四 22:00（她週三、四晚上的班下班以後）', !!q&&q.h===22&&CALENDAR.dateOf(q.day).wd%7===4&&!q.te.special); G.day=q.day; G.hour=21.8; G.weekday=wdOf(q.day); }
  picks=[0]; await goOut('te_Y3S2'); check('Z13-C3. 一般版：溫州街走到巷口（「今天吃得很開心。……你要說什麼？」），沒有杯子', has('今天吃得很開心。……你要說什麼？')&&!has('（是她自己的點法：「熱可可＋濃縮」。）'));
  zrSetup({EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); check('Z13-C4. 日本路線：沒有 Z13（人在日本，臺灣這邊的學期末什麼都不發）', !PHONE.sent(G,zt)&&TERMEND.rec(G,'Y3S2').plan.abroad===true);
  zrSetup(); rules(); answer(zt,0); rules(); at('2028-06-15',21);
  check('Z13-C5. 睡著也會在 23:00 醒來（帶到場）', STORY.WAKE_AT.some(f=>f(G)===23));
  at('2028-06-15',22.6); rules(); check('Z13-C5. 22:15 還沒到：22:30 她傳「我多留半小時。……杯子已經寫好了。」', txt('p:heroine_02').includes('heroine_02:我多留半小時。……杯子已經寫好了。'));
  at('2028-06-15',23.1); OUT.tick(GM); check('Z13-C5. 23:00 再沒到：帶到場（R4）', R2Y3B.z13BringDue(G)&&R2Y3B.homeDue(G)==='r2y3b_z13');
  said=[]; picks=[0]; await R2Y3B.z13Bring(GM);
  check('Z13-C5. 黑幕旁白「（店裡只剩吧檯一盞燈。她在等你。）」接原台詞（開場、杯子）；喝下去＝交往；只帶一次', said[0]&&said[0].t==='（店裡只剩吧檯一盞燈。她在等你。）'&&has('（店裡的燈關了一半。她把「準備中」的牌子翻過去，在你對面坐下。）')&&has('（是她自己的點法：「熱可可＋濃縮」。）')&&G.flags.dating_heroine_02===true&&!R2Y3B.z13BringDue(G));

  /* AA_343 D10：上學期選了「讓我想想」的玩家，第二次也走專屬版；邀約第二句換成第二次的字，杯子那一段不改 */
  zrSetup(); TERMEND.rec(G).think.heroine_02='Y3S1'; rules();
  check('Z13-C6. D10 上學期「讓我想想」：第二次也是 Z13；邀約「畢業以後我還有幾個班。」「下禮拜四打烊以後，你要不要來？……上次那句，你想好了嗎？」', txt('p:heroine_02').join('|')==='heroine_02:畢業以後我還有幾個班。|heroine_02:下禮拜四打烊以後，你要不要來？……上次那句，你想好了嗎？'&&TERMEND.rec(G,'Y3S2').plan.special.heroine_02==='z13', JSON.stringify(txt('p:heroine_02')));
  answer(zt,0); rules(); at('2028-06-15',21.8); picks=[0]; await goOut('te_Y3S2'); check('Z13-C6. D10 第二次的杯子那一段不改；喝下去＝交往', has('（是她自己的點法：「熱可可＋濃縮」。）')&&has('（很久，沒有轉過來）我的點法，我只給過一個人。')&&G.flags.dating_heroine_02===true);

  // ---------- 2-Y3-47 子晴 Q15「存檔點」（大三下學期末的專屬版）----------
  const zqSetup=fl=>{ fresh('2028-06-08',20.6,'dorm',Object.assign({ZQ_DAD_HEARD:true,ATTENDED_SHOW:true},fl||{})); R('heroine_04','CLO'); SOCIAL.rel('heroine_04').npcRom=40; ct('heroine_04'); const L=DATE.log(G,'heroine_04'); L.count=4; L.wish=true; for(const t of ['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE']) SOCIAL.remember('heroine_04',t,''); };
  const zqDinner=async pk=>/* pk：期末飯的選項（大三下子晴「七月三號到七號 曼谷」的鉤子 AA_389 第 2 點起不出選項，不用再選「我去」）*/ { answer(qt,0); rules(); const q=OUT.get(G,'te_Y3S2'); G.day=q.day; G.hour=21.8; G.weekday=wdOf(q.day); picks=pk; await goOut('te_Y3S2'); return q; };
  zqSetup(); rules();
  check('Q15-Q0. 兩個條件都到：邀約照大四上那一版「欸 你考完了吧 宵夜」「只有我們兩個 不要找阿凱」', txt('p:heroine_04').join('|')==='heroine_04:欸 你考完了吧 宵夜|heroine_04:只有我們兩個 不要找阿凱'&&TERMEND.rec(G,'Y3S2').plan.special.heroine_04==='q15', JSON.stringify(txt('p:heroine_04')));
  CG_REGISTRY.cg_flustered_heroine04={file:'x'};   /* BCG-20 登錄了才放（adv3d.js 的 CG_REGISTRY 有這一張）*/
  { const q=await zqDinner(['妳下一個遊戲']);
    check('Q15-Q1. 飯桌一句「發表會那天的錄影，我爸看了三遍。……第三遍他在做筆記。」；回家的路上前三個選項換成 BB_165 4-1 的三句', q.h===22&&q.te.special==='q15'&&has('發表會那天的錄影，我爸看了三遍。……第三遍他在做筆記。')&&has('好飽。……你今天怎麼都不太講話？')&&opts.some(o=>o.join('|')==='「妳下一個遊戲，我也要當第一個玩的。」|「我喜歡妳。喜歡很久了。」|「我喜歡妳。這不是問句。」|（先不說）'), JSON.stringify(opts));
    check('Q15-Q1. 「欸不是……你認真的？」「……第一個玩的要負責找 bug 喔。很多。」「（她講話變快）我、我家到了。我先上去。」「（她跑進巷子。）」；還沒交往；ZQ_CONFESS_LINE first_player', has('欸不是……你認真的？')&&has('……第一個玩的要負責找 bug 喔。很多。')&&has('（她講話變快）我、我家到了。我先上去。')&&has('（她跑進巷子。）')&&!G.flags.dating_heroine_04&&G.flags.ZQ_CONFESS_LINE==='first_player');
    check('Q15-Q1. BCG-20（cg_flustered_heroine04）放在「欸不是……你認真的？」那一句（cg_approved/ README；V6-B7）', cgs.includes('cg_flustered_heroine04'), JSON.stringify(cgs));
    delete CG_REGISTRY.cg_flustered_heroine04;
    const d1=q.day+1; G.day=d1; G.hour=12.1; G.weekday=wdOf(d1); rules();
    check('Q15-Q1. 隔天 12:00：手機收到「（檔案：回答.exe）」（按鈕：回一張插座貓貼紙）；回答.exe 該演了（在家也演：HOME 的 stay）', txt('p:heroine_04').includes('heroine_04:（檔案：回答.exe）')&&PHONE.byAsk(G,'y3_zq_exe').ask.opts[0].t==='（回一張插座貓貼紙）'&&R2Y3B.exeDue(G)&&R2Y3B.homeDue(G)==='stay');
    CG_REGISTRY.cg_answer_exe_heroine04={file:'x'}; cgs=[]; cards=[]; said=[]; opts=[]; picks=[1]; await R2Y3B.exeScene(GM); delete CG_REGISTRY.cg_answer_exe_heroine04;   /* AA_296 2-3-1 ②：場面裡給兩個選項；這裡選「（還沒想好怎麼回）」＝照舊用手機回（場面裡選貼紙那一支在 tests/aa296_phone_live_unit.js）*/
    check('Q15-Q1. 回答.exe：「（《找插座的貓》的新關卡。……兩隻貓一起充電。）」＋BCG-13＋最後疊「第一個玩家：祐廷」，接著場面裡兩個選項（AA_296 ②）；只演一次', has('（《找插座的貓》的新關卡。貓找到了插座，插座旁邊坐著另一隻貓。兩隻貓一起充電。）')&&cgs.join()==='cg_answer_exe_heroine04'&&cards.some(c=>c[0]==='第一個玩家：祐廷')&&JSON.stringify(opts[0])==='["（回一張插座貓貼紙）","（還沒想好怎麼回）"]'&&!G.flags.ZQ_EXE_REPLY&&!R2Y3B.exeDue(G), JSON.stringify([cards,opts]));
    answer('y3_zq_exe',0); rules(); check('Q15-Q1. 回插座貓貼紙＝交往；她馬上打來（AA_296 ②）', G.flags.dating_heroine_04===true&&txt('p:heroine_04').includes('player:（貼圖：插座貓）')&&TERMEND.rec(G,'Y3S2').result==='yes'&&(OUT.due(G)||{}).id==='y3_zq_exe_call'); }
  /* AA_343 D11（改了期待值）：不回的期限是收到檔案（隔天 12:00）的隔天 21:00 */
  zqSetup(); rules(); { const q=await zqDinner(['這不是問句']); G.day=q.day+1; G.hour=21.1; G.weekday=wdOf(G.day); rules();
    check('Q15-Q2. D11 收到檔案那一天的 21:00：還沒傳那一句、按鈕還在', !PHONE.sent(G,'y3_zq_noreply')&&PHONE.askOpen(G,PHONE.byAsk(G,'y3_zq_exe'))&&!G.flags.ZQ_Q15.res);
    G.day=q.day+2; G.hour=21.1; G.weekday=wdOf(G.day); rules(); const nc=OUT.get(G,'y3_zq_noreply_call'); await goOut('y3_zq_noreply_call');   /* AA_296 2-3-1 ②：21:00 那則改成她打來（私訊是沒接的替代版）*/
    check('Q15-Q2. 選「這不是問句」、不回：收到檔案的隔天 21:00 她打來「好，我收到你的不回答了。」「我們還是最好的朋友。」沒有「這次是直述句」、不傳私訊；這學期不交往（下學期第二次的邀約）', !!nc&&has('好，我收到你的不回答了。')&&has('我們還是最好的朋友。')&&!said.some(s=>/直述句/.test(s.t))&&!PHONE.sent(G,'y3_zq_noreply')&&!G.flags.dating_heroine_04&&TERMEND.rec(G).think.heroine_04==='Y3S2'&&G.flags.ZQ_CONFESS_LINE==='not_question', JSON.stringify(said.map(s=>s.t))); }
  zqSetup(); rules(); { const q=await zqDinner(['喜歡很久了']); G.day=q.day+2; G.hour=21.1; G.weekday=wdOf(G.day); rules(); G.hour=21.6; rules();   /* 21:00 那一通沒接（過了 30 分鐘）*/
    check('Q15-Q2. 其他兩句不回、電話也沒接：原本那一則「……這次是直述句。」照留', txt('p:heroine_04').includes('heroine_04:好，我收到你的不回答了。我們還是最好的朋友。這次是直述句。')&&has('……你不要現在講啦。')); }
  zqSetup(); rules(); await zqDinner(['先不說','好。']);
  check('Q15-Q3. 先不說：她說「我喜歡你。講完了。」…「換你。不要讓我在這裡站太久。」；「好。」→ 交往；沒有回答.exe', has('我喜歡你。講完了。')&&has('換你。不要讓我在這裡站太久。')&&G.flags.dating_heroine_04===true&&!G.flags.ZQ_Q15);
  fresh('2028-06-08',20.6,'dorm'); R('heroine_04','CLO'); SOCIAL.rel('heroine_04').npcRom=40; ct('heroine_04'); { const L=DATE.log(G,'heroine_04'); L.count=4; L.wish=true; } rules();
  check('Q15-Q4. 只有心意邀約的條件：一般版的邀約「欸 你考完了吧 宵夜」（她 6/3 畢業了，AA_377 第 10 項）', txt('p:heroine_04').join('|')==='heroine_04:欸 你考完了吧 宵夜|heroine_04:只有我們兩個 不要找阿凱');
  await zqDinner(['我喜歡妳。」']);
  check('Q15-Q4. 一般版：飯桌一句照 AA_254、回家路上是通用的三句（「我喜歡妳。」…）、沒有回答.exe', !has('發表會那天的錄影，我爸看了三遍。……第三遍他在做筆記。')&&opts.some(o=>o[0]==='「我喜歡妳。」')&&!G.flags.ZQ_Q15&&G.flags.dating_heroine_04===true);

  /* AA_343 D10：子晴上學期「讓我想想」的（例：大三上 Q15 以前的一般版、或回答.exe 沒回）：第二次也是 Q15；邀約「欸 你考完了吧 宵夜」「上次那個 你想好沒」；先不說＝「我上次講的，沒有收回。……換你。」 */
  zqSetup(); TERMEND.rec(G).think.heroine_04='Y3S1'; rules();
  check('Q15-Q5. D10 上學期「讓我想想」：第二次也是 Q15；邀約「欸 你考完了吧 宵夜」「上次那個 你想好沒」', txt('p:heroine_04').join('|')==='heroine_04:欸 你考完了吧 宵夜|heroine_04:上次那個 你想好沒'&&TERMEND.rec(G,'Y3S2').plan.special.heroine_04==='q15', JSON.stringify(txt('p:heroine_04')));
  await zqDinner(['先不說','好。']);
  check('Q15-Q5. D10 第二次、先不說：「我喜歡你。講完了。」換成「我上次講的，沒有收回。……換你。」；「好。」→ 交往', has('我上次講的，沒有收回。……換你。')&&!has('我喜歡你。講完了。')&&G.flags.dating_heroine_04===true&&!G.flags.ZQ_Q15, JSON.stringify(said.map(x=>x.t)));

  { const M=SOCIAL.MEMORY_LABEL, W={XUN_PATH:'去聽了他在經濟系的報告',YU4_SAT:'在晨思鐘旁邊陪她吃完早餐，兩個人都沒講話',ZHIRUO_MET_YU:'跟她說，戲院倒數第三排那個女生是 Alison',XINCI_FIRST:'以安不在的那學期，她第一次考第一'};
    check('D13 人物面板名稱照 AA_343 第 5 節（四項）', Object.keys(W).every(k=>M[k]===W[k]), JSON.stringify(Object.keys(W).map(k=>M[k]))); }

  // ---------- 接線 ----------
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('接線：index.html 載入 r2y3b_events.js、r2y3b3d.js（連在一起、在 GAME.boot 之前）', (()=>{ const a=h.indexOf('src/data/r2y3b_events.js'), b=h.indexOf('src/r2y3b3d.js'), z=h.indexOf('GAME.boot()'); return a>0&&b>a&&z>b&&/src\/data\/r2y3b_events\.js[^\n]*\n<script src="src\/r2y3b3d\.js/.test(h); })()); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
