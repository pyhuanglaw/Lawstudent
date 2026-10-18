// 交接包 v2 C8：以安新 5「舍友的記點申訴」（草稿第 3 節、AA_113 新 5；法律台詞 BB 查核無誤）——不需要瀏覽器。修改前沒有這兩個事件（第 1 項失敗）。
// 檢查：她那週晚上在總圖（作息）；觸發條件；開場與四個選項（原文、AN_APPEAL）；第 7 週當面的結果（選「先問」多一句）；週五還沒見到＝手機；沒遇到的玩家在麵店團群組看到一句（聽說）。
// 用法：node tests/v2_an_appeal_unit.js
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
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
(async()=>{
  const W5=termDay('Y1S2',5,3), W7MON=termDay('Y1S2',7,1), W7WED=termDay('Y1S2',7,3), W7FRI=termDay('Y1S2',7,5);
  const e=ev('ev_an_dorm_appeal'), r=ev('ev_an_dorm_appeal_result');
  check('以安新 5：兩個事件都在',!!e&&!!r);
  if(!e||!r){ console.log('FAILED '+fails); process.exit(1); }
  /* 作息：大一下第 5 週平日晚上 19～22 在總圖（平常 18～20:30 在校園走走）*/
  { fresh(W5,19.5,'library'); const c=CHARACTERS.heroine_01; const a=STORY.schedEnt(c,G); G.day=termDay('Y1S2',6,3); G.weekday=wdOf(G.day); const b=STORY.schedEnt(c,G);
    check('作息：大一下第 5 週週三 19:30 在總圖讀書；第 6 週同一時間照舊在校園',a&&a.zone==='library'&&b&&b.zone==='campus',JSON.stringify([a&&a.zone,b&&b.zone])); }
  /* 觸發條件 */
  { const at=(day,h,zone,fam)=>{ fresh(day,h,zone||'library'); R('heroine_01',fam==null?10:fam); SOCIAL.meet('heroine_01','campus'); return EVENTS.check(e); };
    const res={ok:at(W5,20),early:at(W5,18.5),w6:at(termDay('Y1S2',6,3),20),y1s1:at(termDay('Y1S1',5,3),20),cafe:at(W5,20,'cafe'),sat:at(termDay('Y1S2',5,6),20)};
    check('觸發：大一下第 5 週平日 19～22、總圖、認識以上（18:30、第 6 週、大一上、Café、週六都沒有）',res.ok&&!res.early&&!res.w6&&!res.y1s1&&!res.cafe&&!res.sat,JSON.stringify(res)); }
  /* 四個選項 */
  const play=async(k)=>{ fresh(W5,20,'library'); R('heroine_01',10); SOCIAL.meet('heroine_01','campus'); picks=[k]; await EVENTS.run(e); return lines(); };
  { const L=await play(0);
    check('開場：旁白＋以安四句（AA_209 附錄A §2 改稿）',L[0]==='（以安的桌上攤著兩份草稿，劃得很亂。）'&&L[1]==='沈以安：我室友被記點了。晚歸二十分鐘。'&&L[2]==='沈以安：她陪隔壁寢的同學去急診。記點以前，沒有人問她那天發生什麼事。'&&L[3]==='沈以安：我在幫她寫申訴，寫了兩個版本。你可以幫我看哪裡講不通嗎？直接講沒關係。'&&L[4]==='沈以安：一份說規定本身有問題，一份說規定沒問題，只是沒考慮到這種情況。',JSON.stringify(L.slice(0,5)));
    check('四個選項（原文）',JSON.stringify(opts[0])===JSON.stringify(['「寫第一份。規定錯了，就該改。」','「寫第二份。規定沒錯，是沒想到。」','「先寫一件事：記點以前，應該先問她。」','「我想先聽妳的。」']),JSON.stringify(opts[0]));
    check('選 1：「可是門禁本身有道理吧？這樣寫，舍監一看就會擋。」（AA_209）＋問號、AN_APPEAL＝rule',L.includes('沈以安：可是門禁本身有道理吧？這樣寫，舍監一看就會擋。')&&L.includes('（她在第一份旁邊畫了一個問號。）')&&G.flags.AN_APPEAL==='rule',JSON.stringify(L.slice(5))); }
  { const L=await play(1); check('選 2：「我也比較想寫這份。那你挑挑看，哪裡會被打回來？」（AA_209）、case',L.includes('沈以安：我也比較想寫這份。那你挑挑看，哪裡會被打回來？')&&G.flags.AN_APPEAL==='case'); }
  { const L=await play(2); check('選 3：（她停住，在草稿最上面寫了一行。）（AA_209）＋「先問。……對，要先問。」、ask',L.includes('（她停住，在草稿最上面寫了一行。）')&&L.includes('沈以安：先問。……對，要先問。')&&G.flags.AN_APPEAL==='ask'); }
  { const L=await play(3); check('選 4：「好，我先說。」「我最討厭『規定就是規定』這種話。…」（AA_209）、listen',L.includes('沈以安：好，我先說。')&&L.includes('沈以安：我最討厭『規定就是規定』這種話。我家以前很多事都這樣，不解釋。')&&G.flags.AN_APPEAL==='listen'&&L.length===7,JSON.stringify(L.slice(5))); }
  /* 第 7 週：總圖當面 */
  { const F0={AN_APPEAL:'ask'}; fresh(W7MON,10,'library',F0); G.events.done.ev_an_dorm_appeal=true; SOCIAL.meet('heroine_01','campus');
    check('結果：第 7 週在總圖見到她才有（第 6 週沒有）',EVENTS.check(r)&&(()=>{ const d=G.day; G.day=termDay('Y1S2',6,1); G.weekday=wdOf(G.day); const x=EVENTS.check(r); G.day=d; G.weekday=wdOf(d); return !x; })());
    said=[]; await EVENTS.run(r); const L=lines();
    check('結果（當面）：兩句＋選過「先問」的多一句「你說要先問清楚的那句，我放在第一段了。」（AA_209）',L[0]==='沈以安：點數減了一點。宿舍說，以後記點以前會先問。'&&L[1]==='沈以安：最後用的是第二份，寫規定沒考慮到急診這種情況。'&&L[2]==='沈以安：你說要先問清楚的那句，我放在第一段了。'&&G.flags.AN_APPEAL_RESULT==='met',JSON.stringify(L));
    fresh(W7FRI,8,'dorm',Object.assign({},F0,{AN_APPEAL_RESULT:'met'})); G.events.done.ev_an_dorm_appeal=true; G.contacts.heroine_01=3; run(8,22);
    check('當面聽過的：週五晚上不再傳訊息',!G.msgs.some(m=>m.tag==='an_appeal_result')); }
  /* 第 7 週週五還沒見到：手機 */
  { fresh(W7FRI,8,'dorm',{AN_APPEAL:'case'}); G.events.done.ev_an_dorm_appeal=true; G.contacts.heroine_01=3; run(8,22); const M=G.msgs.filter(m=>m.tag==='an_appeal_result').map(m=>m.th+'｜'+m.text);
    check('結果（手機）：第 7 週週五 21:00 私訊同樣的兩句（選的不是「先問」：沒有第三句）',JSON.stringify(M)===JSON.stringify(['p:heroine_01｜點數減了一點。宿舍說，以後記點以前會先問。','p:heroine_01｜最後用的是第二份，寫規定沒考慮到急診這種情況。'])&&G.flags.AN_APPEAL_RESULT==='phone',JSON.stringify(M));
    G.zone='library'; G.day=W7FRI+3; check('手機傳過了：之後不會再當面說一次',!EVENTS.check(r)); }
  /* 沒遇到的玩家 */
  { fresh(W7WED,8,'dorm'); PHONE.join(G,'noodle_team','麵店團'); SOCIAL.meet('heroine_01','campus'); run(8,22); const M=G.msgs.filter(m=>m.tag==='an_appeal_heard');
    check('沒遇到的玩家：第 7 週週三 21:30 麵店團群組「我室友晚歸被記點那個申訴，結果出來了，點數減一點。」（AA_209）、記「聽說」',M.length===1&&M[0].th==='g:noodle_team'&&M[0].text==='我室友晚歸被記點那個申訴，結果出來了，點數減一點。'&&SOCIAL.has('heroine_01','HEARD_ABOUT'),JSON.stringify(M));
    fresh(W7WED,8,'dorm'); PHONE.join(G,'noodle_team','麵店團'); SOCIAL.meet('heroine_01','campus'); G.events.done.ev_an_dorm_appeal=true; run(8,22);
    check('遇到過的玩家：群組不會有這句',!G.msgs.some(m=>m.tag==='an_appeal_heard')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
