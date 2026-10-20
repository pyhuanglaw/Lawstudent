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
const IDS=['ev_y3s2_first_meal','ev_y3s2_228','ev_an_azalea_y3','ev_yu_club_money','ev_kexin_k18','ev_kexin_k18_call'];
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

  // ---------- 接線 ----------
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
    check('接線：index.html 載入 r2y3b_events.js、r2y3b3d.js（連在一起、在 GAME.boot 之前）', (()=>{ const a=h.indexOf('src/data/r2y3b_events.js'), b=h.indexOf('src/r2y3b3d.js'), z=h.indexOf('GAME.boot()'); return a>0&&b>a&&z>b&&/src\/data\/r2y3b_events\.js[^\n]*\n<script src="src\/r2y3b3d\.js/.test(h); })()); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
