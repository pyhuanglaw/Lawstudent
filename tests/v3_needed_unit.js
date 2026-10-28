// 主線 4「被需要的一年」：大二每週日 21:00「這週的訊息」（AA_179 第 1 節＋第 2、4 節；BB_97 第 11 節；任務 V3-D2、SYS-07）——不需要瀏覽器。
// 檢查：期間（大二上第 1 週～大二下第 18 週的週日 21:00）；一週最多四則、綁事件的先挑、上週沒出現的人先挑、一人一則、只挑認識的人；回得了兩則（第三則關掉）、回了信任 +1、G.needed 計數；沒回的下一次見面一句（兩週內、一人兩週一次）；語彤每四週；可昕只看交往；條件還沒做的不出現；晚到照原本的時間補；存讀檔。用法：node tests/v3_needed_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };

(async()=>{
  const KNOW=(ids,lv)=>{ for(const id of ids){ R(id,...(lv||LV.FAM)); meet(id); } };
  const S913=362, S920=369;
  { const L=CALENDAR.termDays('Y2S2').to; check('期間：大二上第 1 週的週日是 9/13、大二下第 16 週（16 週制最後一週）的週日是 6/13',CALENDAR.dateOf(S913).m===9&&CALENDAR.dateOf(S913).d===13&&CALENDAR.termOf(S913).id==='Y2S1'&&CALENDAR.dateOf(L).m===6&&CALENDAR.dateOf(L).d===13&&CALENDAR.termOf(L).week===16&&CALENDAR.termOf(L+1)===null); }
  // 1. 第一週：20:59 還沒有、21:00 跳出來
  fresh(S913,20.5,'campus',{lawclub:true}); KNOW(['heroine_01','zhe','heroine_04','kai','classmate_bohan']);
  run(20.5,20.95); const before=(G.msgs||[]).filter(m=>m.th==='sys'&&/這週的訊息/.test(m.text)||m.ask&&/^need_/.test(m.ask.grp||'')).length;
  run(21,21.1); const sys=(G.msgs||[]).filter(m=>m.th==='sys'&&/這週的訊息/.test(m.text));
  const asks=(G.msgs||[]).filter(m=>m.ask&&m.ask.grp==='need_'+S913);
  check('1. 9/13 20:59 以前沒有、21:00 跳出「這週的訊息」：系統字「這週你回得了兩個人。」',before===0&&sys.length===1&&/這週你回得了兩個人。/.test(sys[0].text)&&sys[0].h===21,JSON.stringify(sys.map(m=>m.text)));
  const W=asks.map(m=>m.ask.id.replace('need_'+S913+'_',''));
  check('1. 一週最多四則；綁事件的先挑（柏翰交接、阿凱網路），同一層快過期的先挑（子晴 1～3 週、阿哲 1～4 週）；以安（1～6 週）這週排不進',JSON.stringify(W)==='["bh_handover","kai_net","zq_game","zhe_book"]',JSON.stringify(W));
  check('1. 一個人一則；都是 FAMILIAR 以上、見過的人；訊息在他自己的對話串（子晴兩句、問題接在最後一句）',new Set(asks.map(m=>m.from)).size===asks.length&&TH('p:heroine_04').map(m=>m.text).join('｜')==='幫我看一個東西｜現在｜……你有空吧'&&!TH('p:heroine_04')[0].ask&&!TH('p:heroine_04')[1].ask&&!!TH('p:heroine_04')[2].ask);   /* 還沒看過 Q6（PLAYTESTED）：不說破她在做遊戲（AA_428 §2 第 6 點的三則；原本 AA_313 6-4「幫我看一個東西。現在。」「……這不是問句。」）*/
  { const e=NEEDED_MSGS.list.find(q=>q.id==='zq_game'); SOCIAL.remember('heroine_04','PLAYTESTED','test'); const v=STORY.neededVar(G,e); check('1. 看過 Q6 的玩家：子晴照主版「你現在有空嗎」「幫我測一下遊戲」（AA_428 §2 第 6 點拿掉「這不是問句」；AB65-3：BB_167 SC5 #26；原本「測試我的遊戲。現在。」）', !!e&&!v.msg&&e.msg[0]==='你現在有空嗎'&&e.msg[1]==='幫我測一下遊戲'&&e.msg.length===2, JSON.stringify(v)); }
  check('1. 他傳訊息來＝有聯絡方式（柏翰、子晴原本沒有）',G.contacts.classmate_bohan!=null&&G.contacts.heroine_04!=null);
  // 2. 回兩則：第三則關掉、信任 +1、計數
  const t0=SOCIAL.rel('zhe').trust, t1=SOCIAL.rel('kai').trust;
  G.hour=21.5; let r1=PHONE.answer(G,'need_'+S913+'_zhe_book',0); G.hour=21.6; let r2=PHONE.answer(G,'need_'+S913+'_kai_net',0);
  const r3=PHONE.answer(G,'need_'+S913+'_zq_game',0);
  check('2. 回兩則：祐廷那句＋對方的回應（阿哲「讚。我請你一碗大的。」）',!!r1&&!!r2&&txt('p:zhe').slice(-2).join('｜')==='player:拿去。｜zhe:讚。我請你一碗大的。',JSON.stringify(txt('p:zhe')));
  check('2. 回滿兩則：第三則不能回、待回覆清單空了（PHONE.pending）',r3===null&&PHONE.pending(G).filter(m=>m.ask.grp==='need_'+S913).length===0);
  check('2. 回了的人信任 +1；沒回的人不變',SOCIAL.rel('zhe').trust===t0+1&&SOCIAL.rel('kai').trust===t1+1&&SOCIAL.rel('heroine_04').trust===0);
  check('2. G.needed：asked 4、answered 2、byWho 阿哲 [1,1]、子晴 [1,0]',G.needed.asked===4&&G.needed.answered===2&&JSON.stringify(G.needed.byWho.zhe)==='[1,1]'&&JSON.stringify(G.needed.byWho.heroine_04)==='[1,0]',JSON.stringify(G.needed.byWho));
  // 3. 沒回的那一句
  const ml1=STORY.neededMissLine(G,'heroine_04'), ml1b=STORY.neededMissLine(G,'heroine_04'), mlz=STORY.neededMissLine(G,'zhe');
  check('3. 沒回的子晴：組關掉以後第一次說話說那一則（測遊戲）的那一句（BB_97 11-2：每一則各一句）；再說話就沒有；回了的阿哲沒有',JSON.stringify(ml1)===JSON.stringify(['測遊戲那則你沒回。','……第三關我自己測了。我自己都卡住。'])&&ml1b===null&&mlz===null,JSON.stringify([ml1,ml1b,mlz]));
  G.day=S913+15; const mlb=STORY.neededMissLine(G,'classmate_bohan');
  check('3. 兩週以後才見面：不說（柏翰）',mlb===null);
  G.day=S913+2; const mlb2=STORY.neededMissLine(G,'classmate_bohan');
  check('3. 兩週內：柏翰說交接資料那一則的那一句（AA_179 第 4 節）',JSON.stringify(mlb2)==='["交接資料第一章，我自己看完了。……一百頁都看完了。"]',JSON.stringify(mlb2));
  // 沒回滿兩則：下週日 21:00 才算關掉
  fresh(S913,20.9,'campus',{lawclub:true}); KNOW(['heroine_01','zhe','heroine_04','kai','classmate_bohan']); run(21,21.05); G.hour=21.5; PHONE.answer(G,'need_'+S913+'_zhe_book',0);
  G.day=S913+3; const early=STORY.neededMissLine(G,'kai'); G.day=S920; G.hour=21.2; const late=STORY.neededMissLine(G,'kai');
  check('3. 只回一則：那一週還可以回，見面不說；下週日 21:00 關掉以後才說（阿凱新宿舍網路那一則的那一句）',early===null&&JSON.stringify(late)==='["所以你那邊網路到底怎樣？週日我先帶筆電過去。"]',JSON.stringify([early,late]));
  check('3. 過了期限（下週日 21:00）就不能回',PHONE.answer(G,'need_'+S913+'_kai_net',0)===null);
  // 4. 第二週：同一則不再出現；上週沒出現的人先挑
  G.hour=21.3; run(21.3,21.4); const W2=(G.msgs||[]).filter(m=>m.ask&&m.ask.grp==='need_'+S920).map(m=>m.ask.id.replace('need_'+S920+'_',''));
  check('4. 9/20：上週的四則不再出現（以安「今天在總圖嗎？」補上）',W2.includes('an_lib')&&!W2.some(x=>['bh_handover','kai_net','zq_game','zhe_book'].includes(x)),JSON.stringify(W2));
  fresh(S913,21,'campus',{lawclub:true}); KNOW(['heroine_01','zhe','heroine_04','kai','classmate_bohan']); STORY.neededRec(G).prev=['zhe'];
  const P1=STORY.neededPick(G,S913).map(e=>e.id);
  check('4. 上週出現過的人（阿哲）排到後面：以安補上、阿哲排不進',JSON.stringify(P1)==='["bh_handover","kai_net","zq_game","an_lib"]',JSON.stringify(P1));
  // 5. 不認識、條件、只看交往
  fresh(S913,21,'campus',{}); KNOW(['heroine_01']); R('zhe',10); meet('zhe');
  const P2=STORY.neededPick(G,S913).map(e=>e.id);
  check('5. 只挑 FAMILIAR 以上：阿哲只是 ACQUAINTANCE 就不挑；柏翰那則要祐廷是法服成員',JSON.stringify(P2)==='["an_lib"]',JSON.stringify(P2));
  const d4=STORY.termDay('Y2S1',4,7); fresh(d4,21,'campus',{dating_kexin:true}); const P3=STORY.neededPick(G,d4).map(e=>e.id);
  fresh(d4,21,'campus',{dating_kexin:false}); const P3b=STORY.neededPick(G,d4).map(e=>e.id);
  check('5. 交往中的可昕：不看熟不熟（第 4 週「物權報告要一個例子」）；沒交往就沒有',P3.includes('kx_example')&&!P3b.includes('kx_example'),JSON.stringify([P3,P3b,d4]));
  const notYet=NEEDED_MSGS.list.filter(e=>{ try{ return e.cond&&!e.cond({flags:{lawclub:true,dating_kexin:true,ECON_TOGETHER:true,JOB_TUTOR:true,POTHOS:true,INVITED_CLUB:true,RENT_CONSULTATION:true,STUDYGROUP_LEADER:true,noodleTableDay:1,RENT_RUMOR:true,BOHAN_GROUP:'ask'},events:{done:{ev_peishan_decision:1,ev_yutong_landlord:1,ev_xinci_second:1,ev_yu_together:1,ev_an_tutor_family_1:1}},habits:{}}); }catch(e){ return false; } }).map(e=>e.id).filter(id=>!/^an_rules$|^an_lead$|^an_topics$/.test(id));
  /* 2026-10-28 改：AA_497 3-4（企劃線 7a38216ca）她退辯論社改成大二下第 3 週她自己傳的三則（src/sup497_3d.js yu_quit），yu_clubs 不再發（cond 一律 false）*/
  check('5. 還沒發生的事件（語彤事件 11、Z7、ev_bohan_scores、子晴 Q6 PLAYTESTED）那幾則先不出現、mx_tutor 大二上拿掉（AA_374 第 22 項）、yu_clubs 拿掉（AA_497 3-4）；模擬法庭三則換掉了；慈 3 之後的 xc_drama 讀 ev_xinci_second',JSON.stringify(notYet.sort())===JSON.stringify(['bh_scores','mx_tutor','yt_dish','yu_clubs','zq_name','zr_beans'].sort())&&!NEEDED_MSGS.list.some(e=>/_moot$/.test(e.id)),JSON.stringify(notYet));
  // 5b. 每一則各一句、交往版、依條件換的版本（AA_179 第 4、4-1 節；BB_97 11-1、11-2；BB_205 第 4～8 節）
  { const J=JSON.stringify, E=id=>NEEDED_MSGS.list.find(e=>e.id===id), MF=(id,g)=>STORY.neededMissFor(g||G,E(id),E(id).who);
    fresh(S913,21,'campus',{}); 
    check('5b. 以安兩則各自一句：總圖「那本我自己讀完了」、公文「看懂一半」',/那本我自己讀完了/.test(MF('an_lib')[0])&&/看懂一半/.test(MF('an_admin')[0]));
    G.flags.dating_heroine_01=true; check('5b. 和以安交往中：換交往版（「我多借的那本，還在我桌上」）',/還在我桌上/.test(MF('an_lib')[0])); delete G.flags.dating_heroine_01;
    check('5b. miss:null 的不提（芷若的豆子、語彤洗碗、柏翰考古題）',MF('zr_beans')===null&&MF('yt_dish')===null&&MF('bh_final')===null);
    check('5b. 子晴爸爸那則：Q8（ev_ziqing_dad_visit）演過就不說',MF('zq_dad')&&/我爸要來那則/.test(MF('zq_dad')[0])&&(G.events.done.ev_ziqing_dad_visit=1,MF('zq_dad')===null)); delete G.events.done.ev_ziqing_dad_visit;
    const V=(id)=>{ const v=STORY.neededVar(G,E(id)); return {msg:v.msg||E(id).msg,resp:v.resp||E(id).resp}; };
    check('5b. 子晴爸爸：沒看過 Q6 的第三則「他說要來看我」；看過的「他說要看我做的遊戲」（BB_205 第 5 節）',V('zq_dad').msg[2]==='他說要來看我'&&V('zq_dad').msg[0]==='欸跟你說'&&(SOCIAL.remember('heroine_04','PLAYTESTED',''),V('zq_dad').msg[2]==='他說要看我做的遊戲')&&E('zq_dad').term==='Y2S2');
    check('5b. 明軒說明會：沒有 SAW_HIM_STUDY 換「你要去嗎」那一版；有的「幫我佔第一排」',/你要去嗎/.test(V('mx_seat').msg[0])&&/那我們第一排見/.test(V('mx_seat').resp[0])&&(SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''),/幫我佔第一排/.test(V('mx_seat').msg[0]))&&J(E('mx_seat').w)==='[4,4]'&&J(E('mx_seat').at)===J({day:'2027-03-15',h:21}));   /* AA_375 第 10 項：3/15（一）21:00 發（原本第 3 週 3/14 那一組）*/
    check('5b. 阿凱鍵盤：沒有 KAI_KEYBOARD 換「我網拍買的鍵盤」；有的「大一那把」',/網拍買的/.test(V('kai_kb').msg[0])&&(SOCIAL.remember('kai','KAI_KEYBOARD',''),/大一那把/.test(V('kai_kb').msg[0])));
    check('5b. 學姊大二只剩法圖那本書（sis_report 刪）；可昕 kx_cv 是期中報告的摘要',/行政救濟的書/.test(E('sis_list').msg[0])&&!E('sis_report')&&/期中報告的摘要/.test(E('kx_cv').msg[0])&&E('sis_list').miss[0]==='那本書我借到了。');
    check('5b. 每一則都有自己的 miss（或 null），沒有舊的一人一句表',NEEDED_MSGS.list.every(e=>e.miss===null||Array.isArray(e.miss))&&Object.keys(NEEDED_MSGS.miss).length===0);
    // 實際流程：送出時用換過的版本
    fresh(STORY.termDay('Y2S2',4,1),20.9,'campus',{}); KNOW(['classmate_mingxuan']); run(21,21.05);   /* AA_375 第 10 項：3/15（一）21:00 */
    const mx=(G.msgs||[]).filter(m=>m.from==='classmate_mingxuan').map(m=>m.text);
    check('5b. 手機實際收到明軒沒有 SAW_HIM_STUDY 的兩則（3/15 21:00）',J(mx)===J(['交換說明會週四中午 你要去嗎','我只是去聽聽 順便吃便當 😂']),J(mx)); }
  // 6. 語彤每四週
  fresh(S913,21,'campus',{noodleTableDay:1}); KNOW(['heroine_03']); run(21,21.05);
  const has=d=>STORY.neededPick(G,d).some(e=>e.id==='yt_auntie');
  check('6. 語彤「阿姨問你週四來不來」：第 1 週出現、第 2～4 週不再、第 5 週可以再一次',(G.msgs||[]).some(m=>m.ask&&m.ask.id==='need_'+S913+'_yt_auntie')&&!has(S913+7)&&!has(S913+21)&&has(S913+28));
  // 7. 期間外、晚到、太晚
  const y1s2=STORY.termDay('Y1S2',5,7), win=STORY.termDay('Y2S1',18,7)+7;
  fresh(y1s2,21.5,'campus',{}); KNOW(['heroine_01','zhe']); run(21.5,21.6); const a7=(G.msgs||[]).filter(m=>m.ask&&/^need_/.test(m.ask.grp||'')).length;
  fresh(win,21.5,'campus',{}); KNOW(['heroine_01','zhe']); run(21.5,21.6); const b7=(G.msgs||[]).filter(m=>m.ask&&/^need_/.test(m.ask.grp||'')).length;
  check('7. 大一下、寒假的週日不跳',a7===0&&b7===0&&CALENDAR.termOf(win)==null&&CALENDAR.termOf(y1s2).id==='Y1S2',JSON.stringify([a7,b7,CALENDAR.termOf(win)]));
  fresh(S913+1,10,'campus',{}); KNOW(['heroine_01','zhe']); G.weekday=1; run(10,10.05); const late7=(G.msgs||[]).filter(m=>m.ask&&/^need_/.test(m.ask.grp));
  check('7. 睡過頭（週一 10:00 才醒）：照原本的時間補（週日 21:00）',late7.length===2&&late7.every(m=>m.day===S913&&m.h>=21&&m.h<21.1),JSON.stringify(late7.map(m=>[m.day,m.h])));
  fresh(S920-1,22,'campus',{}); KNOW(['heroine_01','zhe']); G.weekday=6; STORY.neededRec(G); G.needed.last=null;
  // 上週日 9/13 的已經過了六天以上（週六 22:00 = 6 天 1 小時）：不補
  run(22,22.05); check('7. 跳過太久（同一週快結束）就不補',!(G.msgs||[]).some(m=>m.ask&&/^need_/.test(m.ask.grp))&&G.needed.last===S913);
  // 8. 在家的週日照樣跳；存讀檔
  fresh(S913,20.9,'home',{}); KNOW(['heroine_01','zhe']); run(21,21.05);
  check('8. 週末回家的週日：手機照樣跳（phoneRules 在家的迴圈也跑）',(G.msgs||[]).some(m=>m.ask&&/^need_/.test(m.ask.grp))&&/STORY\.phoneRules\(GM\)/.test(fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8')));
  const snap=JSON.parse(JSON.stringify(G)); G=snap; SOCIAL.bind(G); INV.rec(G); G.hour=21.4;
  const rr=PHONE.answer(G,'need_'+S913+'_an_lib',0);
  check('8. 存讀檔以後還可以回、計數接著算',!!rr&&G.needed.answered===1&&G.needed.asked===2&&G.needed.last===S913);
  check('8. 舊存檔（沒有 G.needed）：預設 {asked:0, answered:0, byWho:{}}',(()=>{ const g={flags:{}}; STORY.neededRec(g); return g.needed.asked===0&&g.needed.answered===0&&JSON.stringify(g.needed.byWho)==='{}'; })());
  // 9. 見面時說（talkCharacter 接上了）；芷若沒有「沒回」那一句
  const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
  check('9. 一般聊天（talkCharacter）先問 neededMiss；芷若沒有沒回的那一句；index.html 載入 needed_msgs.js',/await S\.neededMiss\(GM,who,id\)/.test(src)&&!NEEDED_MSGS.miss.heroine_02&&/src\/data\/needed_msgs\.js/.test(fs.readFileSync(path.join(ROOT,'index.html'),'utf8')));
  check('9. 每一則都有 id、who、term、w、msg、reply；id 不重複；訊息池 AA 六人＋BB 八人',NEEDED_MSGS.list.every(e=>e.id&&e.who&&NEED_OK(e))&&new Set(NEEDED_MSGS.list.map(e=>e.id)).size===NEEDED_MSGS.list.length&&new Set(NEEDED_MSGS.list.map(e=>e.who)).size===14,new Set(NEEDED_MSGS.list.map(e=>e.who)).size);
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
function NEED_OK(e){ return ['Y2S1','Y2S2'].includes(e.term)&&Array.isArray(e.w)&&e.w[0]<=e.w[1]&&e.w[1]<=18&&Array.isArray(e.msg)&&e.msg.length&&typeof e.reply==='string'; }
