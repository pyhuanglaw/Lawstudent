// 第 2 輪之二（大三）後半：AA_326 2-Y3-26～2-Y3-54＋第 3 節大三寒暑假的停留日（src/data/r2y3b_events.js、src/r2y3b3d.js）——不需要瀏覽器。
//   照 AA 給 BB 的驗收情境寫（每件至少一項）；台詞不寫死全文的地方用「有沒有出現」查。最後：接線（index.html 的順序）。
// 修改前：沒有這些事件、沒有 R2Y3B（第 0 項 FAIL）。用法：node tests/r2y3b_events_unit.js
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
const IDS=['ev_y3s2_first_meal','ev_y3s2_228','ev_an_azalea_y3','ev_yu_club_money','ev_kexin_k18','ev_kexin_k18_call','ev_xun_path','ev_yu_alone_breakfast','ev_yu_alone_call','ev_an_konbini','ev_liheng_japan','ev_y3s2_roof_toast','ev_an_sakura_riverbank','ev_far_call_jp','ev_yu_alone_movie','ev_yu_alone_movie_noodle','ev_yu_alone_movie_video','ev_zhiruo_third_row','ev_kexin_birthday_y3'];
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
  check('H0. 2/27 21:00 阿哲兩則；排 2/28 14:00 公館河濱', txt('g:noodle_team').join('|')==='zhe:明天放假 河濱 兩點|zhe:小語說要帶風箏'&&q228&&q228.day===D('2028-02-28')&&q228.h===14);
  picks=[1]; await run('ev_y3s2_228');
  check('H1. 去了：以安在場（「三月二十五號以前，還有四個週末。」、柏翰「三個半」）', has('（坐在階梯上，手帳攤開）三月二十五號以前，還有四個週末。')&&has('三個半。今天放假，不算。')&&G.flags.Y3S2_228===true);
  check('H2. 選「（坐到以安旁邊）」：手帳上四個空的週末', has('……你也要算嗎？')&&has('（她把手帳轉過來：四個週末，每一格都還空著。）'), JSON.stringify(opts[0]));
  fresh('2028-02-27',21.1,'dorm'); grpJoin(); R('zhe','FRI'); R('yu','FRI'); rules(); at('2028-02-28',14.3); OUT.tick(GM); at('2028-02-28',17.6); rules();
  check('H. 沒去：17:30 小語在群組（風箏卡在樹上）', txt('g:noodle_team').includes('yu:（照片：河濱的天空，一個風箏卡在樹上）')&&txt('g:noodle_team').includes('yu:是風的問題！！'));

  // ---------- 2-Y3-28 杜鵑花第三張 ----------
  { const s=STORY.schedEnt(CHARACTERS.heroine_01,Object.assign(fresh('2028-03-09',12.2,'campus'),{})); check('Z0. 3/9 12:10 以安在椰林大道（作息只有這一天）', !!s&&s.zone==='campus'&&/2-Y3-28/.test(s.note||''), JSON.stringify(s)); }
  { G.day=D('2028-03-16'); G.weekday=wdOf(G.day); const s=STORY.schedEnt(CHARACTERS.heroine_01,G); check('Z0. 隔週同一時間不是那一筆', !s||!/2-Y3-28/.test(s.note||'')); }
  fresh('2028-03-09',12.2,'campus'); R('heroine_01','FAM'); check('Z1. 12:20 走過椰林大道和她說話：可以演', EVENTS.check(ev('ev_an_azalea_y3')));
  await run('ev_an_azalea_y3');
  check('Z1. 「第三張。你幫我拍。」…「可以。花有拍到。」；記 AN3_AZALEA；沒交往＝沒有印出來那句', has('第三張。你幫我拍。')&&has('可以。花有拍到。')&&SOCIAL.has('heroine_01','AN3_AZALEA')&&!has('出發前我把這三張印出來帶走。'));
  fresh('2028-03-09',12.2,'campus'); date('heroine_01'); await run('ev_an_azalea_y3');
  check('Z2. 交往中：「出發前我把這三張印出來帶走。」', has('出發前我把這三張印出來帶走。'));
  at('2028-03-09',12.7); check('Z. 12:40 以後不演', !EVENTS.check(ev('ev_an_azalea_y3')));
  fresh('2028-03-09',12.7,'dorm'); grpJoin(); R('heroine_01','FAM'); rules();
  check('Z3. 12:40 群組「（照片：杜鵑花。和前兩年同一個位置。）」「第三張。」', txt('g:noodle_team').join('|')==='heroine_01:（照片：杜鵑花。和前兩年同一個位置。）|heroine_01:第三張。');
  fresh('2028-03-09',12.7,'dorm'); R('heroine_01','FRI'); ct('heroine_01'); rules();
  check('Z3. 不在群組、FRIEND 以上：私訊同兩則', txt('p:heroine_01').join('|')==='heroine_01:（照片：杜鵑花。和前兩年同一個位置。）|heroine_01:第三張。');

  // ---------- 2-Y3-29 C6 小語的社團經費 ----------
  fresh('2028-03-15',21.1,'dorm',{U_ASSOC:true}); grpJoin(); R('yu','FAM'); rules();
  check('C0. 3/15 21:00 小語三則（欸／你明天中午有空嗎／社團的錢的事 想問你）、兩個回覆', txt('p:yu').join('|')==='yu:欸|yu:你明天中午有空嗎|yu:社團的錢的事 想問你'&&PHONE.byAsk(G,'y3_yu_c6').ask.opts.length===2);
  answer('y3_yu_c6',0); at('2028-03-16',12.6); rules();
  { const s=STORY.schedEnt(CHARACTERS.yu,G); check('C0. 回「有。」：3/16 12:30 小語在霖澤館一樓（作息）', txt('p:yu').includes('yu:好！！')&&!!s&&s.zone==='linze'); }
  G.zone='linze'; check('C0. 12:30～13:00 在霖澤館：到了（事件另外要小語在場 npcPresent）', R2Y3B.c6MeetDue(G)&&ev('ev_yu_club_money').npcPresent==='yu');
  picks=[2]; await run('ev_yu_club_money');
  check('C1. 有 U_ASSOC：「先照社團的規則」那個選項；選了＝「對！我們社團有規則！……我去找出來。」', opts[0].length===3&&/先照社團的規則/.test(opts[0][2])&&has('對！我們社團有規則！……我去找出來。'), JSON.stringify(opts));
  check('C2. 「妳真正想要的是什麼？」→「這個不用去法服。」', has('妳真正想要的是什麼？')&&has('……我想要帳對得起來，學弟也還會來社課。')&&has('那先找社團的指導老師。這個不用去法服。')&&G.flags.YU_C6==='rule'&&G.flags.YU_C6_DAY===D('2028-03-16'));
  at('2028-03-23',21.7); rules();
  check('C2. 3/23 21:40 鞠躬的熊；記 YU_CLUB_BEAR', txt('p:yu').includes('yu:（貼圖：一隻鞠躬的熊）')&&txt('p:yu').includes('yu:少的三千是場地押金 忘了報 還在')&&SOCIAL.has('yu','YU_CLUB_BEAR'));
  fresh('2028-03-15',21.1,'dorm'); grpJoin(); R('yu','FAM'); rules(); answer('y3_yu_c6',1);
  { const L=txt('p:yu'); const m=nested('y3_yu_c6_phone');
    check('C3. 選「現在說？」：手機版照小語的習慣拆開（不打句號）；沒有 U_ASSOC＝兩個選項', L.includes('player:現在說？')&&L.includes('yu:欸 成發的錢對不起來')&&L.includes('yu:可是三千塊')&&!L.some(t=>/^yu:.*。$/.test(t))&&!!m&&m.ask.opts.length===2, JSON.stringify(L)); }
  answer('y3_yu_c6_phone',0); rules(); at('2028-03-23',21.7); rules();
  check('C3. 手機版也有「這個不用去法服。」、3/23 那則', txt('p:yu').includes('player:那先找社團的指導老師。這個不用去法服。')&&txt('p:yu').includes('yu:……他是學弟耶')&&txt('p:yu').includes('yu:找到了！！'));
  fresh('2028-03-16',12.6,'linze'); R('yu','FAM'); check('C. 沒回「有。」：3/16 小語不在那裡、不演', !R2Y3B.c6MeetDue(G));

  // ---------- 2-Y3-30 可昕 K18 ----------
  fresh('2028-03-15',21.6,'dorm'); date('kexin'); rules();
  check('R0. 3/15 21:30 兩則（「這週六早上八點，開車。……」「……地方你到了就知道。」）、兩個回覆', mine('p:kexin','kexin:這週六早上八點，開車。去一個我們兩個都沒去過的地方。').slice(0,2).join('|')==='kexin:這週六早上八點，開車。去一個我們兩個都沒去過的地方。|kexin:……地方你到了就知道。'&&PHONE.byAsk(G,'y3_kx_k18').ask.opts.length===2, JSON.stringify(txt('p:kexin')));
  answer('y3_kx_k18',0); rules(); const k18=OUT.get(G,'y3_kx_k18');
  check('R0. 「好。八點，政大校門口。」→「好。不要遲到。」；排 3/18 08:00 政大校門口', txt('p:kexin').includes('kexin:好。不要遲到。')&&k18&&k18.day===D('2028-03-18')&&k18.h===8);
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
  check('Y1. 第 4 週週一 10:00 經過傅鐘（小語在旁邊）：可以演', EVENTS.check(y4));
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
  fresh('2028-03-27',10,'campus',{EXCHANGE_ROUTE:'JP'}); R('yu','FAM'); yuHere(); check('Y. 日本路線 3/25 以後人在日本：傅鐘不演', !EVENTS.check(y4));

  // ---------- 2-Y3-34 日本 J1 ----------
  fresh('2028-03-25',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); const j1=OUT.get(G,'y3_an_j1');
  check('J0. 日本路線：3/26 日本 22:00（遊戲時鐘 21:00）便利商店，只有「出發」', !!j1&&j1.day===D('2028-03-26')&&j1.h===21&&j1.must===true);
  CG_REGISTRY.cg_japan_konbini_heroine01={file:'x'}; picks=[1]; await run('ev_an_konbini');
  check('J1. 交往中：「標籤只寫給看得懂的人。」＋CG-13（在那一句之前）；三選一；「我幫妳翻譯」＝「……那我們兩個一起看不懂。」；AN_J1 dating', has('（一本正經）標籤只寫給看得懂的人。')&&cgs.join()==='cg_japan_konbini_heroine01'&&opts[0].length===3&&has('……那我們兩個一起看不懂。')&&G.flags.AN_J1==='dating');
  fresh('2028-03-26',21,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FRI'); await run('ev_an_konbini'); delete CG_REGISTRY.cg_japan_konbini_heroine01;
  check('J2. 挽回中：點頭、去結帳；沒有 CG、沒有選項；AN_J1 repair', has('（她看到你，點了一下頭，拿了一個飯糰就去結帳。）')&&cgs.length===0&&opts.length===0&&G.flags.AN_J1==='repair'&&!has('……我在決定。'));
  { const L=ev('ev_an_konbini').dialogue.filter(l=>/她想了一下/.test(l.text||'')).length; check('J. 「（她想了一下）」只留一次（檔尾裁定 #31）', L===1); }
  fresh('2028-03-25',12,'dorm',{EXCHANGE_ROUTE:'TW'}); rules(); check('J. 台灣路線：沒有', !OUT.get(G,'y3_an_j1'));

  // ---------- 2-Y3-35 日文班 G10 ----------
  fresh('2028-04-01',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); CLS.rec(G).attend.japanese_1=3; rules(); const lq=OUT.get(G,'y3_liheng');
  check('G0. 日本路線、修過日文：4/2 日本 15:00（時鐘 14:00）大學城的河堤', !!lq&&lq.day===D('2028-04-02')&&lq.h===14);
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
  fresh('2028-04-03',17.1,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('zhe','FRI'); date('heroine_01'); rules(); at('2028-04-03',20.6); rules();
  check('T2. 日本路線：沒有邀約；20:30「你那邊有吐司嗎」', !OUT.get(G,'y3s2_roof_toast')&&txt('g:noodle_team').includes('zhe:你那邊有吐司嗎'));
  fresh('2028-04-03',17.1,'dorm'); grpJoin(); R('zhe','FRI'); rules(); at('2028-04-03',20.5); OUT.tick(GM); at('2028-04-03',22.1); rules();
  check('T. 沒去：22:00 烤焦的吐司', txt('g:noodle_team').includes('zhe:（照片：烤箱旁邊一排烤焦的吐司）'));

  // ---------- 2-Y3-37 日本 CG-23 春天的河堤 ----------
  fresh('2028-04-07',20.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules();
  check('S0. 日本路線、交往中：4/7 日本 21:00（時鐘 20:00）「明天下午四點半，大學城的河堤。」「我帶書。你也帶。」', txt('p:heroine_01').join('|')==='heroine_01:明天下午四點半，大學城的河堤。|heroine_01:我帶書。你也帶。'&&PHONE.byAsk(G,'y3_an_sakura').ask.opts.length===2);
  answer('y3_an_sakura',0); rules(); const sq=OUT.get(G,'y3_an_sakura');
  check('S0. 「好。」→「嗯。」；排 4/8 日本 16:30（時鐘 15:30）', txt('p:heroine_01').includes('heroine_01:嗯。')&&sq&&sq.day===D('2028-04-08')&&sq.h===15.5);
  CG_REGISTRY.cg_sakura_riverbank_heroine01={file:'x'}; picks=[1]; cgs=[]; await run('ev_an_sakura_riverbank'); delete CG_REGISTRY.cg_sakura_riverbank_heroine01;
  check('S1. 交往中、去了：CG-23（她把手帳轉過來那一拍）；手帳「理由：櫻花只開一個禮拜。」；「……所以這週的讀書會，改在這裡。」；AN_SAKURA went', cgs.join()==='cg_sakura_riverbank_heroine01'&&has('理由：櫻花只開一個禮拜。')&&has('……所以這週的讀書會，改在這裡。')&&has('（她看了你一眼，繼續讀。過了一頁，她把保溫杯推過來一點。）')&&G.flags.AN_SAKURA==='went');
  fresh('2028-04-07',20.1,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_01','FRI'); rules(); check('S2. 挽回中：沒有這一場', txt('p:heroine_01').length===0);
  fresh('2028-04-07',20.1,'dorm',{EXCHANGE_ROUTE:'JP'}); date('heroine_01'); rules(); answer('y3_an_sakura',1); at('2028-04-08',17.1); rules();
  check('S. 「明天不行。」→「好。那下週。」；日本 18:00 照片「今天在這裡讀完一章。」；AN_SAKURA missed', txt('p:heroine_01').includes('heroine_01:好。那下週。')&&txt('p:heroine_01').includes('heroine_01:今天在這裡讀完一章。')&&G.flags.AN_SAKURA==='missed');

  // ---------- 2-Y3-38 主線 8「遠方」（日本路線）----------
  fresh('2028-04-12',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); ['zhe','yu','classmate_bohan','classmate_xinci','heroine_03'].forEach(id=>R(id,'FRI')); date('heroine_01'); rules();
  check('F0. 4/12 21:00 阿哲「明天七點半 視訊 麵店」、兩個回覆', txt('p:zhe').includes('zhe:明天七點半 視訊 麵店')&&PHONE.byAsk(G,'y3_far_call').ask.opts.length===2);
  answer('y3_far_call',0); at('2028-04-13',19); rules(); const fq=OUT.get(G,'y3_far_call');
  check('F0. 「好。」→「記得吃飯」；4/13 19:30 視訊（接起來）', txt('p:zhe').includes('zhe:記得吃飯')&&fq&&fq.h===19.5&&fq.verb==='接起來');
  await run('ev_far_call_jp');
  check('F1. 在麵店團：「你那邊幾點？……你吃什麼？給我看。」、小語、柏翰、芯慈、語彤探頭、阿姨「隔著螢幕也要問！」；FAR_CALL jp', has('你那邊幾點？……你吃什麼？給我看。')&&has('你瘦了！……不對，是鏡頭。')&&has('讀書會你的位子，我們沒有人坐。')&&has('（她從廚房探出頭，舉起田野筆記，沒說話。）')&&has('滷蛋要不要！隔著螢幕也要問！')&&said.some(s=>s.who==='阿姨（畫面外）')&&G.flags.FAR_CALL==='jp');
  check('F2. 和以安 FRIEND 以上：以安那則沒有「理由：」', has('（手機亮了一下，以安傳來：「他吃飯糰。便利商店比較近。」）')&&!said.some(s=>/理由：便利商店/.test(s.t)));
  fresh('2028-04-13',19.5,'dorm',{EXCHANGE_ROUTE:'JP'}); R('zhe','FAM'); date('heroine_01'); await run('ev_far_call_jp');
  check('F. 不在麵店團、和阿哲 FAMILIAR 以上：只留阿哲的台詞', has('就這樣？')&&!has('你瘦了！……不對，是鏡頭。')&&!has('滷蛋要不要！隔著螢幕也要問！')&&!said.some(s=>/他吃飯糰/.test(s.t)));
  fresh('2028-04-12',21.1,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('zhe','FRI'); date('heroine_01'); rules(); at('2028-04-13',19); rules(); at('2028-04-13',19.8); OUT.tick(GM); PHONE.tick(G);
  check('F. 沒接：19:45 長桌空位的照片', txt('g:noodle_team').includes('zhe:（照片：長桌上空著一個位子，前面放了一碗麵）'));
  fresh('2028-04-12',21.1,'dorm'); grpJoin(); R('zhe','FRI'); rules(); check('F. 台灣路線：沒有', !PHONE.sent(G,'y3_far_call'));

  // ---------- 2-Y3-39 語 5 ----------
  fresh('2028-04-22',21.1,'dorm'); grpJoin(); R('yu','FAM'); rules();
  check('Y5-0. 4/22 21:00「欸」「我一個人在看電影。」、回覆「哪一部？」', txt('p:yu').join('|')==='yu:欸|yu:我一個人在看電影。'&&PHONE.byAsk(G,'y3_yu5').ask.opts[0].t==='哪一部？');
  answer('y3_yu5',0); check('Y5-0. →「看完再說！！」', txt('p:yu').includes('yu:看完再說！！'));
  fresh('2028-04-24',10,'campus'); R('yu','FAM'); yuHere(); check('Y5-1. 4/24 早上經過傅鐘：可以演', EVENTS.check(ev('ev_yu_alone_movie')));
  picks=[1]; await run('ev_yu_alone_movie');
  check('Y5-1. 當面「旁邊坐一個也是一個人來的女生……」；「妳也坐倒數第三排？」→「對！下次我還要坐那裡。」；記 YU_ALONE', has('週六我一個人去看電影。')&&has('旁邊坐一個也是一個人來的女生。她說一個人看電影的人，都坐倒數第三排。')&&has('對！下次我還要坐那裡。')&&SOCIAL.has('yu','YU_ALONE'));
  fresh('2028-04-27',19.2,'noodle'); R('yu','FAM'); check('Y5-2. 4/24 沒去學校：4/27 19:00 麵店可以演；小語在麵店（作息）', EVENTS.check(ev('ev_yu_alone_movie_noodle'))&&(STORY.schedEnt(CHARACTERS.yu,G)||{}).zone==='noodle');
  await run('ev_yu_alone_movie_noodle');
  check('Y5-2. 麵店版第一句「欸，跟你說。週六我一個人去看電影。」', said[0].t==='欸，跟你說。週六我一個人去看電影。'&&SOCIAL.has('yu','YU_ALONE'));
  check('Y5-3. 任何一版都不是只有訊息（當面、麵店、視訊都有那幾句）', ev('ev_yu_alone_movie_video').dialogue.some(l=>l.text==='旁邊坐一個也是一個人來的女生。她說一個人看電影的人，都坐倒數第三排。'));
  fresh('2028-04-24',9,'dorm',{EXCHANGE_ROUTE:'JP'}); grpJoin(); R('yu','FAM'); date('heroine_01'); rules(); const yv=OUT.get(G,'y3_yu5_video');
  check('Y5. 日本路線：4/24 10:00 視訊（日本 11:00）', !!yv&&yv.h===10&&yv.place==='視訊');

  // ---------- 2-Y3-40 芷若 Z11b ----------
  fresh('2028-04-24',19.5,'cafe'); R('heroine_02','FAM'); SOCIAL.remember('yu','YU_ALONE',''); R('yu','FAM');
  check('Z11-0. 4/24 以後第一次在 Café 和芷若點餐：可以演', EVENTS.check(ev('ev_zhiruo_third_row')));
  picks=[0]; await run('ev_zhiruo_third_row');
  check('Z11-1. 聽過語 5：「上週在戲院……」；「那個女生是小語。」→「……阿哲的那個小語？」；ZHIRUO_MET_YU', has('上週在戲院，倒數第三排，旁邊坐著一個也是一個人來的女生。')&&opts[0][0]==='「那個女生是小語。」'&&has('……阿哲的那個小語？')&&has('那下次遇到她，我請她一杯。')&&SOCIAL.has('heroine_02','ZHIRUO_MET_YU')&&G.flags.ZR_Z11B==='yu');
  at('2028-05-08',22.2); rules();
  check('Z11-1. 5/8 22:07「小語傳了一張票根給我。她說她也坐倒數第三排。」', txt('p:heroine_02').includes('heroine_02:小語傳了一張票根給我。她說她也坐倒數第三排。'));
  fresh('2028-05-02',19.5,'cafe'); R('heroine_02','FAM'); picks=[0]; await run('ev_zhiruo_third_row');
  check('Z11. 5/1 以後才第一次去：「前陣子在戲院」；沒聽過語 5＝兩個選項', has('前陣子在戲院，倒數第三排，旁邊坐著一個也是一個人來的女生。')&&opts[0].length===2&&has('想好了再跟你說。'));
  fresh('2028-04-22',22.1,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_02','FRI'); ct('heroine_02'); rules();
  check('Z11-2. 日本路線、單身、朋友：4/22「今天坐這裡。旁邊空著。」', txt('p:heroine_02').join('|')==='heroine_02:（照片：倒數第三排的票根）|heroine_02:今天坐這裡。旁邊空著。'&&G.flags.ZR_Z11B==='photo');
  fresh('2028-04-22',22.1,'dorm',{EXCHANGE_ROUTE:'JP'}); R('heroine_02','FRI'); ct('heroine_02'); date('heroine_01'); rules();
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
  PHONE.post(G,{th:'p:kexin',from:'kexin',text:'你晚上要下山來，還是我上去',ask:{id:'t_bd',opts:[{t:'我去政大',say:[{from:'kexin',text:'好 我在校門口等'}]},{t:'妳來公館',say:[{from:'kexin',text:'好 七點'}]}]}}); answer('t_bd',1); rules();
  check('B. 其他玩家：按了生日快樂、回了她的回問＝排 4/24 18:00 公館', (OUT.get(G,'kx_bday_y3')||{}).h===18);
  fresh('2028-04-24',12,'dorm',{KX_BDAY:{1:'visit',2:'none'}}); date('kexin'); rules(); at('2028-04-25',9.1); rules();
  check('B4. 什麼都沒做、大二也沒做：4/25 09:00「昨天我生日。……今年也等了一天。」；none、KX_RUB +1', txt('p:kexin').includes('kexin:昨天我生日。……今年也等了一天。')&&G.flags.KX_BDAY[3]==='none'&&G.flags.KX_RUB===1);
  fresh('2028-04-23',21.1,'dorm',{KX_BDAY:{1:'visit',2:'met'}}); date('kexin'); rules(); answer('y3_kx_bday_ask',1); at('2028-04-25',9.1); rules();
  check('B. 她約了你說不行：「……好。」；4/25「昨天我生日。……我等了一天。」；declined', txt('p:kexin').includes('kexin:……好。')&&txt('p:kexin').includes('kexin:昨天我生日。……我等了一天。')&&G.flags.KX_BDAY[3]==='declined'&&G.flags.KX_RUB===1);
  fresh('2028-04-24',12,'dorm',{EXCHANGE_ROUTE:'JP'}); date('kexin'); date('heroine_01'); rules(); const bv=OUT.get(G,'kx_bday_y3');
  check('B. 日本路線：4/24 21:00 視訊（日本 22:00）；「這片是你的。我幫你吃。」、沒有走到門口那一句；KX_BDAY[3] video', !!bv&&bv.h===21&&bv.place==='視訊'&&(at('2028-04-24',21),true));
  await run('ev_kexin_birthday_y3');
  check('B. 日本路線視訊的台詞', has('這片是你的。我幫你吃。')&&has('三……三十分鐘到了。第三個明年說。')&&!has('報告寫完了跟我說。')&&G.flags.KX_BDAY[3]==='video');

  // ---------- 接線 ----------
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('接線：index.html 載入 r2y3b_events.js、r2y3b3d.js（連在一起、在 GAME.boot 之前）', (()=>{ const a=h.indexOf('src/data/r2y3b_events.js'), b=h.indexOf('src/r2y3b3d.js'), z=h.indexOf('GAME.boot()'); return a>0&&b>a&&z>b&&/src\/data\/r2y3b_events\.js[^\n]*\n<script src="src\/r2y3b3d\.js/.test(h); })()); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
