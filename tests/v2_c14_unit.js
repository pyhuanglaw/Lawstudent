// 交接包 v2 C14：以安新 7「和 Alison 吵架，然後開了讀書會」（草稿第 3 節、AA_113 新 7）——不需要瀏覽器。修改前沒有這兩個事件（第 1 項失敗）。
// 檢查：前半（第 11 週週二晚上麵店）台詞、四個選項（原文）、AN_YU_ARGUMENT、法律審查標記；不在場的玩家群組聽說；後半：公法讀書會活動（第 12 週起每週四 20:00 研討室 A）、
//   第 12 週週一的邀請（群組／私訊）、第一次的白板、PUBLIC_LAW_GROUP、以安週四晚上的作息
// 用法：node tests/v2_c14_unit.js
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
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
(async()=>{
  const e1=ev('ev_an_yu_argument'), e2=ev('ev_public_law_group'), A=ACTIVITIES.list.find(a=>a.id==='public_law_group');
  check('C14：兩個事件和活動都在',!!e1&&!!e2&&!!A);
  if(!e1||!e2||!A){ console.log('FAILED '+fails); process.exit(1); }
  const T11=termDay('Y1S2',12,4);   /* 2026-10-17 吵架改到大一下第 12 週週四的公法讀書會（AA_238 5-3；變數名照舊）*/
  /* 前半 */
  { const at=(day,h,zone,fam,yuFam)=>{ fresh(day,h,zone||'wancai'); SOCIAL.meet('heroine_01','campus'); R('heroine_01',fam==null?10:fam); SOCIAL.meet('yu','noodle'); R('yu',yuFam==null?10:yuFam); return EVENTS.check(e1,{chain:true}); };
    const r={ok:at(T11,20),w11:at(termDay('Y1S2',11,4),20),wed:at(termDay('Y1S2',12,3),20),y1s1:at(termDay('Y1S1',12,4),20),noodle:at(termDay('Y1S2',11,2),18,'noodle')};
    check('前半：大一下第 12 週週四公法讀書會（萬才館、trigger club、柏翰在場；第 11 週、週三、大一上、原本的第 11 週週二麵店都沒有）',r.ok&&!r.w11&&!r.wed&&!r.y1s1&&!r.noodle&&e1.trigger==='club'&&e1.participants.includes('classmate_bohan')&&!e1.participants.includes('zhe'),JSON.stringify(r));
    { fresh(T11,20,'wancai'); SOCIAL.meet('heroine_01','campus'); R('heroine_01',10); SOCIAL.meet('yu','noodle'); R('yu',10); global.STORY.present=()=>true; G.events.done.ev_public_law_group=1; check('前半：公法讀書會那一晚 CLS.clubEvent 挑到吵架',(CLS.clubEvent(G,A)||{}).id==='ev_an_yu_argument',(CLS.clubEvent(G,A)||{}).id); }
    check('前半：法律審查標記已拿掉（BB-B 第 27 批審過，BB_115 L483；BB_161 第 3 節）',!e1.legal_review);
    const play=async k=>{ fresh(T11,20,'wancai'); SOCIAL.meet('heroine_01','campus'); R('heroine_01',10); SOCIAL.meet('yu','noodle'); R('yu',10); picks=[k]; await EVENTS.run(e1); return lines(); };
    let L=await play(0);
    check('前半：Alison「上街要先申請？那還叫自由嗎？」以安「先分清楚。…」Alison「妳每次都先挑我用詞。」以安「因為用詞不清楚，…」（AA_209）柏翰「（看了一下手錶）妳們兩個講了十二分鐘了。每人十分鐘。」（AA_238 5-3）；四個選項',
      JSON.stringify(L.slice(0,5))===JSON.stringify(['Alison：上街要先申請？那還叫自由嗎？','沈以安：先分清楚。是要申請許可，還是讓人知道你要用哪一條路。','Alison：妳每次都先挑我用詞。','沈以安：因為用詞不清楚，我們就會在吵兩件不一樣的事。','許柏翰：（看了一下手錶）妳們兩個講了十二分鐘了。每人十分鐘。'])&&JSON.stringify(opts[0])==='["「我站 Alison。」","「我站以安。」","「妳們講的是同一件事的兩邊。」","（先吃 Alison 帶的宵夜）"]',JSON.stringify([L.slice(0,5),opts[0]]));
    check('前半 選 1：Alison「看吧！」以安「那你說說看，哪裡不對？」（AA_209）',JSON.stringify(L.slice(5))===JSON.stringify(['Alison：看吧！','沈以安：那你說說看，哪裡不對？'])&&G.flags.AN_YU_ARGUMENT==='yu',JSON.stringify(L.slice(5)));
    L=await play(1); check('前半 選 2：以安「謝謝。」（她轉回去跟 Alison 繼續講，聲音小了一點。）（AA_209）',JSON.stringify(L.slice(5))===JSON.stringify(['沈以安：謝謝。','（她轉回去跟 Alison 繼續講，聲音小了一點。）'])&&G.flags.AN_YU_ARGUMENT==='an',JSON.stringify(L.slice(5)));
    L=await play(2); check('前半 選 3：（兩個人同時轉過來看你。）Alison「……幹嘛突然這麼有道理。」',JSON.stringify(L.slice(5))===JSON.stringify(['（兩個人同時轉過來看你。）','Alison：……幹嘛突然這麼有道理。'])&&G.flags.AN_YU_ARGUMENT==='both',JSON.stringify(L.slice(5)));
    L=await play(3); check('前半 選 4（先吃 Alison 帶的宵夜）：柏翰「明智。……我也要一塊。」',JSON.stringify(L.slice(5))===JSON.stringify(['許柏翰：明智。……我也要一塊。'])&&G.flags.AN_YU_ARGUMENT==='noodle',JSON.stringify(L.slice(5))); }
  /* 不在場：群組聽說 */
  { fresh(T11,17,'dorm'); PHONE.join(G,'noodle_team','麵店團'); run(17,23.95); const L=TH('g:noodle_team').filter(m=>!String(m.tag||'').startsWith('b4_')).map(m=>(m.from||'')+':'+m.text).filter(t=>!/建立了/.test(t));   /* 同一天中午以安在群組揪 B4 演講（交接包 v2 C13，tag b4_invite）：不算在這一項 */
    check('不在場的玩家（沒去那晚的讀書會）：週四 22:00 Alison 連發三則（AA_238 5-4），記「聽說」',JSON.stringify(L)===JSON.stringify(['yu:我跟以安吵架了','yu:不是真的吵啦 是在講上街要不要申請','yu:柏翰還幫我們計時'])&&SOCIAL.has('heroine_01','HEARD_ABOUT'),JSON.stringify(L));
    fresh(T11,17,'dorm'); PHONE.join(G,'noodle_team','麵店團'); G.events.done.ev_an_yu_argument=1; run(17,23.9); check('在場看過的玩家：群組沒有這兩句',!txt('g:noodle_team').some(t=>/吵架/.test(t))); }
  /* 後半：被拱出來＋邀請（AA_238 5-1、5-2：大一上第 10 週週一 20:30 全班群組被拱出來、21:00 邀請＋Alison「+1 可以帶宵夜嗎」） */
  { const M=termDay('Y1S1',10,1), want=['同學:憲法期中有人知道第三題到底在問什麼嗎','同學:我到現在還是不知道憲法在幹嘛','zhe:問沈以安啊 她考超高','同學:真的假的 以安開課','heroine_01:……我不是老師。','heroine_01:可是可以一起讀。','heroine_01:公法讀書會。週四晚上八點，B館研討室。想來的就來，不用報名。','yu:+1 可以帶宵夜嗎','heroine_01:……可以。'];
    const cls=()=>TH('g:law_class').filter(m=>/plg_/.test(String(m.tag||''))||/公法|憲法|沈以安|以安開課|不是老師|一起讀|宵夜|可以。/.test(m.text)).map(m=>(m.from||m.name||'')+':'+m.text);
    fresh(M,18,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); PHONE.join(G,'noodle_team','麵店團'); run(18,20.45); check('20:27 還沒有',!TH('g:law_class').some(m=>/以安開課|公法讀書會/.test(m.text)));
    run(20.5,22); check('20:30 被全班拱出來、21:00 邀請（AA_238 原文；麵店團沒有）',JSON.stringify(cls())===JSON.stringify(want)&&!txt('g:noodle_team').some(t=>/公法讀書會/.test(t)),JSON.stringify(cls()));
    fresh(M,18,'dorm'); run(18,22); check('沒有手動加群組：法律系的玩家會自動加進全班群組（S.lawClassJoinY1），邀請照樣收到（原本的私訊備案拿掉）',PHONE.inGroup(G,'law_class')&&PHONE.sent(G,'plg_invite')&&!TH('p:heroine_01').some(m=>/公法讀書會/.test(m.text)));
    fresh(termDay('Y1S2',12,1),18,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); PHONE.join(G,'noodle_team','麵店團'); run(18,22); check('大一下第 12 週週一（舊的邀請日）沒有邀請',!txt('g:law_class').concat(txt('g:noodle_team')).some(t=>/公法讀書會/.test(t))); }
  /* 後半：活動、第一次、作息 */
  { const th=termDay('Y1S2',12,4);
    check('公法讀書會：大一上第 10～15 週、大一下第 2～7、10、12～15 週的週四（16 週制：第 16 週期末停） 20:00–21:30、萬才館研討室 A（門口參加）；大一上第 9 週、大一下第 11 週、週三都沒有',ACTIVITIES.on(A,th)&&ACTIVITIES.on(A,termDay('Y1S2',15,4))&&!ACTIVITIES.on(A,termDay('Y1S2',16,4))&&ACTIVITIES.on(A,termDay('Y1S2',4,4))&&ACTIVITIES.on(A,termDay('Y1S1',10,4))&&ACTIVITIES.on(A,termDay('Y1S1',15,4))&&!ACTIVITIES.on(A,termDay('Y1S1',9,4))&&!ACTIVITIES.on(A,termDay('Y1S2',11,4))&&!ACTIVITIES.on(A,termDay('Y1S2',12,3))&&A.t0===20&&A.t1===21.5&&A.zone==='wancai'&&A.room==='seminarA'&&A.door===true);
    fresh(th,19.9,'wancai'); check('第一次去：CLS.clubEvent 是 ev_public_law_group',CLS.clubEvent(G,A)===e2);
    await EVENTS.run(e2); const L=lines();
    check('第一次：（研討室的白板上寫著「公法讀書會」。下面是以安的字：「每人十分鐘。」）（Alison 在旁邊補：「可以吃東西。」）、PUBLIC_LAW_GROUP',JSON.stringify(L)===JSON.stringify(['（研討室的白板上寫著「公法讀書會」。下面是以安的字：「每人十分鐘。」）','（Alison 在旁邊補：「可以吃東西。」）'])&&G.flags.PUBLIC_LAW_GROUP===true,JSON.stringify(L));
    check('之後：沒有第一次的事件（每週照常參加；這天剛好是第 12 週週四＝吵架那一晚，以安不在場時是 null）',(CLS.clubEvent(G,A)||{id:null}).id!=='ev_public_law_group',(CLS.clubEvent(G,A)||{}).id);
    const c=CHARACTERS.heroine_01; G.hour=20.5; const s=STORY.schedEnt(c,G); check('以安週四 20:30 在萬才館（公法讀書會）',s&&s.zone==='wancai',JSON.stringify(s&&s.zone)); }
  /* ---------- C21 沛珊和柏翰：大一下第 4 週週四公法讀書會散場（BB_191 §8-7：原本週三法服讀書會）；法服讀書會停用 ---------- */
  { const L=ACTIVITIES.list.find(a=>a.id==='lawclub_study'), e=ev('ev_peishan_bohan_w4'); check('C21：事件在',!!e);
    check('法服讀書會停用（AA_218 17-4：法服沒有讀書會）：大一上、大一下的週三都沒有',!!L&&!ACTIVITIES.on(L,termDay('Y1S1',6,3))&&!ACTIVITIES.on(L,termDay('Y1S2',4,3)));
    if(e){ const at=(w,known)=>{ fresh(termDay('Y1S2',w,4),21.5,'wancai'); if(known) SOCIAL.meet('classmate_peishan','campus'); return CLS.afterActEvent(G,A); };
      check('C21：大一下第 4 週公法讀書會結束後、認識沛珊＝演；不認識、第 5 週都沒有',at(4,true)===e&&!at(4,false)&&!at(5,true));
      fresh(termDay('Y1S2',4,4),19.9,'wancai'); SOCIAL.meet('classmate_peishan','campus'); G.flags.PUBLIC_LAW_GROUP=true; G.events.done.ev_public_law_group=1;
      await CLS.attendActivity(GM,A,{door:true}); const Ls=lines();
      check('C21：照玩家流程參加（attendActivity）——讀書會結束以後接著演：（讀書會結束。沛珊和柏翰一起走出法律系館B，一路在爭下週誰報告哪一題。）（你在後面收白板。）',Ls.includes('（讀書會結束。沛珊和柏翰一起走出法律系館B，一路在爭下週誰報告哪一題。）')&&Ls[Ls.length-1]==='（你在後面收白板。）'&&G.events.done.ev_peishan_bohan_w4===1,JSON.stringify(Ls.slice(-3)));
      check('C21：只有畫面——沒有選項、沒有訊息',!opts.length&&!(G.msgs||[]).some(m=>/柏翰/.test(m.text||''))); } }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
