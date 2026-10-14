// 交接包 v1（大一上）第 8 批：A14 以安新 3（轉述）、A15 G1 考完試走出教室——不需要瀏覽器。
// 檢查（修改前都會失敗：事件、群組訊息、考完的事件都不存在）：
//   A14：第 7 週週二晚上麵店團群組：小語兩則（「報告！……」）、阿哲「……她說得對耶。」、以安隔一陣子才回「三頁是因為字很大。」；只給那天以前就在群組裡的玩家；
//     沒有群組（或之後才加入）的玩家：第 7 週起找沛珊說話，她當面說同樣的內容；只一次；旗標 AN_DORM_RULES（group／peishan），不寫成玩家在場的記憶。
//   A15 G1：民總期中考考完接著演（一般的課、別科的考試、翹課都不會）；只有認識的人在場（柏翰沒見過＝第一句變成旁白；芯慈和柏翰那段兩個都認識才有；小語、明軒、以安各自）；
//     第一個選項要第一天讀過案例；三個選項的反應；SHARED_CLASS 只記認識的人；只一次。
// 用法：node tests/v1_batch8_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const keepOn=(day,hour,zone,flags)=>{ const ev=G.events, soc=G.social, msgs=G.msgs, phone=G.phone, contacts=G.contacts, ch=G.choices, act=G.activities; fresh(day,hour,zone,Object.assign({},G.flags,flags||{})); G.events=ev; G.social=soc; SOCIAL.bind(G); if(msgs) G.msgs=msgs; if(phone) G.phone=phone; if(contacts) G.contacts=contacts; G.choices=ch; if(act) G.activities=act; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const tickEv=()=>{ const r=EVENTS.tick(0.1); return r; };
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  const W7TUE=termDay(7,2);
  /* ---------- A14 以安新 3 宿舍的規則 ---------- */
  { fresh(W7TUE,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=10; run(8,23);
    const gm=G.msgs.filter(m=>m.tag==='an_rules_grp'||m.tag==='an_rules_an');
    check('A14：第 7 週週二晚上麵店團群組：小語兩則、阿哲一則、以安隔一陣子才回（交接包_v1 第 3 節原文）',JSON.stringify(gm.map(m=>[m.from,m.text]))===JSON.stringify([['yu','報告！聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。'],['yu','大家笑她，她說：「規則是我們要住的，總要有人讀完。」'],['zhe','……她說得對耶。'],['heroine_01','三頁是因為字很大。']])&&gm.every(m=>m.th==='g:noodle_team')&&gm[3].h-gm[2].h>0.5,JSON.stringify(gm.map(m=>[m.from,m.h])));
    check('A14：旗標 AN_DORM_RULES=group；不寫成玩家在場的記憶（以安沒有新的記憶）',G.flags.AN_DORM_RULES==='group'&&SOCIAL.memories('heroine_01').length===0);
    fresh(W7TUE,8,'campus'); meet('classmate_peishan'); run(8,23); check('A14：沒有麵店團群組：群組沒有訊息',!G.msgs||!G.msgs.some(m=>m.tag==='an_rules_grp'));
    const e=ev('ev_an_dorm_rules_peishan'); fresh(W7TUE,13,'campus'); meet('classmate_peishan'); const a=EVENTS.check(e);
    fresh(W7TUE-7,13,'campus'); meet('classmate_peishan'); const b=EVENTS.check(e);
    fresh(W7TUE,13,'campus'); const c=EVENTS.check(e);
    fresh(W7TUE,13,'campus'); meet('classmate_peishan'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=10; const d=EVENTS.check(e);
    fresh(W7TUE,13,'campus'); meet('classmate_peishan'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=W7TUE+3; const f=EVENTS.check(e);
    check('A14：沛珊當面說——第 7 週起、要認識她；早就在群組裡的不會；第 7 週之後才加入群組的會',a&&!b&&!c&&!d&&f,JSON.stringify({a,b,c,d,f}));
    fresh(W7TUE,13,'campus'); meet('classmate_peishan'); npc('classmate_peishan',1,1); await EVENTS.run(e);
    check('A14：沛珊說同樣的內容（兩句）、AN_DORM_RULES=peishan、只一次',JSON.stringify(lines())===JSON.stringify(['聽說以安為了樓層會議，把整本宿舍規則讀完了，還寫了三頁意見。','大家笑她，她說：「規則是我們要住的，總要有人讀完。」'])&&G.flags.AN_DORM_RULES==='peishan'&&!EVENTS.check(e),JSON.stringify(lines()));
    fresh(W7TUE,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); G.phone.groups.noodle_team.day=W7TUE+3; run(8,23);
    check('A14：第 7 週週二之後才加入群組：看不到加入以前的群組訊息',!G.msgs||!G.msgs.some(m=>m.tag==='an_rules_grp')); }
  /* ---------- A15 G1 考完試走出教室 ---------- */
  { const e=ev('ev_midterm_walkout'); check('G1 事件存在（民總期中考考完）',!!e&&e.afterClass==='civ_general'&&e.afterExam==='mid');
    let midDay=null; for(let d=termDay(8,1);d<=termDay(9,7);d++){ const it=CLS.dayItems(G,d).find(x=>x.c.id==='civ_general'&&x.exam==='mid'); if(it){ midDay=d; break; } }
    check('G1：民總期中考在第 8～9 週（第 '+midDay+' 天）',!!midDay);
    const exam=async(flags,setup,pk)=>{ fresh(midDay,13.2,'classroom',Object.assign({readCase:'full'},flags||{})); if(setup) setup(); picks=pk||[]; const it=CLS.dayItems(G,midDay).find(x=>x.c.id==='civ_general'); await CLS.attend(GM,it); return lines(); };
    let L=await exam({},null,['引誘']);
    check('G1：考完接著演：走廊的旁白；柏翰沒見過＝「有人在問：第二題，……」旁白；阿哲「……有第二題？」；小語、芯慈、明軒、以安沒見過都不在',L.includes('走廊上一群人。有人在翻課本，有人已經在滑手機。')&&L.includes('有人在問：第二題，是寫要約之引誘還是要約？')&&L.includes('……有第二題？')&&!L.some(t=>/我寫要約。我覺得|反對意見|不要對了啦|對答案沒有用/.test(t)),JSON.stringify(L.slice(-8)));
    check('G1：讀過案例：三個選項都在',JSON.stringify(opts[opts.length-1])===JSON.stringify(['「我寫引誘，第二天那個案子就是這個。」','「我寫要約。」','「去吃飯。」']),JSON.stringify(opts[opts.length-1]));
    L=await exam({readCase:'none'},null,['要約']);
    check('G1：第一天沒讀案例：沒有「第二天那個案子就是這個」',JSON.stringify(opts[opts.length-1])===JSON.stringify(['「我寫要約。」','「去吃飯。」']),JSON.stringify(opts[opts.length-1]));
    L=await exam({met_yu:true},()=>{ for(const id of ['classmate_bohan','classmate_xinci','classmate_mingxuan','heroine_01']) meet(id); },['要約']);
    const want=['第二題，你們是寫要約之引誘還是要約？','……有第二題？','我寫要約。我覺得是要約。（停）完了，我寫要約。','（小聲）我寫引誘，然後補了一段反對意見。','反對意見誰的？','我自己的。','……可以這樣寫嗎？','不要對了啦，去吃飯。','（從教室出來，把筆收進筆袋）對答案沒有用。考完了就是考完了。','……我寫引誘。','同一國的！'];
    check('G1：大家都認識：AA_13 G1 原文照順序；選「我寫要約。」→ 小語「同一國的！」',want.every((t,i)=>L.indexOf(t)>=0&&(i===0||L.indexOf(t)>L.indexOf(want[i-1]))),JSON.stringify(L.slice(-12)));
    check('G1：SHARED_CLASS 記在認識的同學（阿哲、柏翰、小語、芯慈、明軒、以安）',['zhe','classmate_bohan','yu','classmate_xinci','classmate_mingxuan','heroine_01'].every(id=>SOCIAL.has(id,'SHARED_CLASS')));
    L=await exam({},()=>meet('classmate_xinci'),['吃飯']);
    check('G1：只認識芯慈（不認識柏翰）：她和柏翰那段沒有；「去吃飯。」→ 阿哲「走！」（明軒不認識）',!L.includes('我自己的。')&&L[L.length-1]==='走！'&&said[said.length-1].who!=='阿哲、明軒'&&!SOCIAL.has('classmate_bohan','SHARED_CLASS'),JSON.stringify(said.slice(-1)));
    L=await exam({},()=>{ meet('classmate_mingxuan'); meet('classmate_bohan'); },['引誘']);
    check('G1：「我寫引誘……」→ 柏翰「你也讀了判決？」',L[L.length-1]==='你也讀了判決？');
    L=await exam({},()=>meet('classmate_mingxuan'),['吃飯']); check('G1：「去吃飯。」、認識明軒：「阿哲、明軒：走！」',L[L.length-1]==='走！'&&said[said.length-1].who==='阿哲、明軒',JSON.stringify(said.slice(-1)));
    /* 只在民總期中考之後 */
    fresh(midDay,13.2,'classroom',{readCase:'full'}); G.events.done.ev_midterm_walkout=1; picks=[]; await CLS.attend(GM,CLS.dayItems(G,midDay).find(x=>x.c.id==='civ_general')); check('G1：只一次（演過就不再演）',!lines().includes('……有第二題？'));
    let other=null; for(let d=termDay(8,1);d<=termDay(9,7)&&!other;d++){ const it=CLS.dayItems(G,d).find(x=>x.c.id!=='civ_general'&&x.exam==='mid'&&x.c.kind!=='service'); if(it) other=it; }
    fresh(other.day,other.t0,'classroom',{readCase:'full'}); picks=[]; await CLS.attend(GM,other); check('G1：別科（'+other.c.name+'）的期中考考完不會演',!lines().includes('……有第二題？'));
    const W4THU=termDay(4,4); fresh(W4THU,13.2,'classroom',{readCase:'full'}); picks=[]; await CLS.attend(GM,CLS.dayItems(G,W4THU).find(x=>x.c.id==='civ_general')); check('G1：一般的民總下課不會演',!lines().includes('……有第二題？')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
