// 交接包 v1（大一上）第 9 批：AA、BB 2026-10-14 的答案——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   芷若的通識群組（BB_95 4-2，654f5dd）：她在小組群組的第一則下面可以回三種（貼圖貼出去是「（貼圖：OK）」），她不在群組回；回過＝當晚 22:07 收到替代版私訊
//     （交往中隔天 15:10、「昨天」；22:07 以後才回＝隔天 22:07、「昨天」）；不回＝沒有私訊（等 Café 第五次）；和 Café 第五次的版本只傳一次（先到的那個）。
//   麵店團（AA 2026-10-14）：上一個麵店日沒來，阿哲才在群組揪（17:30，四句輪流）；一直有來＝安靜；考試週、國定假日不是麵店日；舊存檔（開始記以前）當作有來。
//   校慶攤：學姊「那是物權。你們大二才上。」（v1_batch4_unit 檢查）。
//   A13 中秋烤肉（AA 2026-10-14）：沒有麵店團群組＝「大家借了一個烤肉架」；「你被分到顧火。火一直熄。」；只記 MIDAUTUMN_Y1，關係數值不變、沒有 SHARED_MEAL。
// 用法：node tests/v1_batch9_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
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
  /* ---------- 芷若的通識群組：回覆與替代版私訊 ---------- */
  { const FRI=termDay(4,5);
    const setup=(flags)=>{ fresh(FRI,11,'putong',Object.assign({geGroupDay:FRI},flags||{})); run(11,11.5); return G.msgs.find(m=>m.tag==='ge_grp1'); };
    const dm=()=>G.msgs.filter(m=>m.tag==='zr_dm1').map(m=>[m.day,m.h,m.text]);
    let m=setup(); check('群組：她的第一則「我負責剪片。不要叫我上台。」可以回三種（BB_95 4-2 原文）',!!m&&m.text==='我負責剪片。不要叫我上台。'&&JSON.stringify(m.ask.opts.map(o=>o.t))===JSON.stringify(['好。我上台，妳剪片。','收到。報告的稿我先寫。','（貼一張「OK」的貼圖）']),m&&JSON.stringify(m.ask.opts.map(o=>o.t)));
    G.hour=12; PHONE.answer(G,m.ask.id,2); const mine=G.msgs.filter(x=>x.th==='g:ge_econ'&&x.from==='player').map(x=>x.text), hers=G.msgs.filter(x=>x.th==='g:ge_econ'&&x.from==='heroine_02').length;
    check('群組：貼圖貼出去是「（貼圖：OK）」；她不在群組回',JSON.stringify(mine)===JSON.stringify(['（貼圖：OK）'])&&hers===1&&G.flags.ZR_GRP_REPLY===3,JSON.stringify({mine,hers}));
    run(12,22.05); const before=dm().length; run(22.05,22.3);
    check('回過：當晚 22:07 才收到替代版私訊（三句，BB_95 4-2 原文「剛剛」）',before===0&&JSON.stringify(dm().map(x=>x[2]))===JSON.stringify(['我是通識小組的芷若。','……也是 Café 的那個。','你剛剛在群組回得很快。我以為法律系的人都很慢。'])&&dm().every(x=>x[0]===FRI&&x[1]>=22+7/60-0.001&&x[1]<22+7/60+0.06),JSON.stringify(dm()));
    check('回過：收到以後有她的聯絡方式',INV.hasContact(G,'heroine_02'));
    m=setup({dating_kexin:true}); G.hour=12; PHONE.answer(G,m.ask.id,0); run(12,23.9); const d0=dm().length; keepOn(FRI+1,0); run(0,15.3);
    check('交往中：當晚沒有，隔天 15:10 收到、第三句「你昨天在群組回得很快。」',d0===0&&dm().length===3&&dm().every(x=>x[0]===FRI+1&&x[1]>=15+10/60-0.001&&x[1]<15+10/60+0.06)&&dm()[2][2]==='你昨天在群組回得很快。我以為法律系的人都很慢。',JSON.stringify(dm()));
    m=setup(); G.hour=22.5; PHONE.answer(G,m.ask.id,1); run(22.5,23.9); const late0=dm().length; keepOn(FRI+1,0); run(0,22.3);
    check('22:07 以後才回：隔天 22:07、第三句「昨天」（不會補在回覆之前的時間）',late0===0&&dm().length===3&&dm().every(x=>x[0]===FRI+1&&x[1]>=22+7/60-0.001&&x[1]<22+7/60+0.06)&&dm()[2][2]==='你昨天在群組回得很快。我以為法律系的人都很慢。',JSON.stringify(dm()));
    setup(); run(11.5,23.9); keepOn(FRI+1,0); run(0,23.9); check('不回：沒有私訊（等 Café 第五次）',dm().length===0);
    m=setup({zhiruoShopContactDay:FRI-1,zhiruoFirstOrder:'拿鐵'}); G.hour=12; PHONE.answer(G,m.ask.id,0); run(12,23.9);
    check('Café 第五次的私訊先到：群組回過也不會再傳一次（只有 Café 版三句）',dm().length===3&&dm()[0][2]==='我是 Café 的芷若。',JSON.stringify(dm()));
    m=setup(); G.hour=12; PHONE.answer(G,m.ask.id,1); run(12,23.9); G.flags.zhiruoShopContactDay=FRI+3; G.flags.zhiruoFirstOrder='手沖'; keepOn(FRI+3,10); run(10,23.9);
    check('群組先回：之後 Café 第五次不會再傳 Café 版',dm().length===3&&dm()[0][2]==='我是通識小組的芷若。',JSON.stringify(dm())); }
  /* ---------- 麵店團：沒來才揪 ---------- */
  { const W4THU=termDay(4,4), PINGS=['麵店。我揪了。','麵店。我先到。','今天阿姨有滷蛋。','麵店。不用回。'];
    const sim=(d0,d1,came)=>{ for(let d=d0;d<=d1;d++){ keepOn(d,7.5,'campus'); run(7.5,17.9,0.1); if(came(d)){ G.zone='noodle'; run(18,19,0.1); G.zone='campus'; } run(19.1,23.5,0.1); } };
    const pings=()=>G.msgs.filter(m=>m.tag&&m.tag.startsWith('rt_zhe_ndl_')).map(m=>[m.day,m.text]);
    const start=()=>{ fresh(W4THU,18,'noodle',{noodleTableDay:W4THU}); run(18,19,0.1); };
    start(); sim(W4THU+1,W4THU+14,d=>STORY.noodleDay(d));
    check('一直有來（每個週二、週四晚上都在麵店）：兩週群組都安靜',pings().length===0,JSON.stringify(pings()));
    const tue5=termDay(5,2), thu5=termDay(5,4), tue6=termDay(6,2), thu6=termDay(6,4);
    start(); sim(W4THU+1,thu6,d=>d===tue5||d===thu6);
    check('第 5 週週二有來、週四沒來：只有第 6 週週二揪一次（「麵店。我揪了。」）；第 6 週週四（週二沒來）再揪（「麵店。我先到。」）',JSON.stringify(pings())===JSON.stringify([[tue6,PINGS[0]],[thu6,PINGS[1]]]),JSON.stringify(pings()));
    const exam=[]; for(let d=termDay(8,1);d<=termDay(9,7);d++){ const w=CALENDAR.dateOf(d).wd; if(w===2||w===4) exam.push(d); }
    start(); sim(W4THU+1,termDay(10,4),()=>false); const pd=pings().map(x=>x[0]);
    check('考試週（第 8、9 週）不是麵店日、不揪；第 10 週週二照樣揪（上一個麵店日是第 7 週週四，沒來）',exam.length===4&&exam.every(d=>!STORY.noodleDay(d)&&!pd.includes(d))&&pd.includes(termDay(10,2)),JSON.stringify({exam,pd}));
    check('四句輪流',pings().every((x,i)=>x[1]===PINGS[i%4]),JSON.stringify(pings().map(x=>x[1])));
    const xmas=(()=>{ for(let d=80;d<120;d++) if(CALENDAR.dateOf(d).key.endsWith('12-25')) return d; return null; })();
    check('國定假日（12/25 週四，第 '+xmas+' 天）不是麵店日；前一週的週四是',xmas!=null&&CALENDAR.dateOf(xmas).wd===4&&CALENDAR.holiday(xmas)&&!STORY.noodleDay(xmas)&&STORY.noodleDay(xmas-7),JSON.stringify({xmas,key:xmas&&CALENDAR.dateOf(xmas).key}));
    fresh(termDay(6,1),8,'campus',{noodleTableDay:W4THU}); PHONE.join(G,'noodle_team','麵店團'); sim(termDay(6,1),termDay(6,2),()=>false);
    check('舊存檔（加入群組以後沒有出席紀錄）：第一個麵店日當作上次有來、不揪',pings().length===0&&G.flags.ndlTrack0===termDay(6,1),JSON.stringify(pings())); }
  /* ---------- A13 中秋烤肉 ---------- */
  { const SAT=STORY.termDay('Y1S1',5,6), tickOut=async()=>{ const p=OUT.tick(GM); if(p) return await p; return null; };
    const play=async(group,setup)=>{ fresh(SAT,14.5,'campus',{}); if(group) PHONE.join(G,'noodle_team','麵店團'); if(setup) setup(); OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:SAT,h:15,place:'河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',travelH:0.25}); picks=['出發']; await tickOut(); return lines(); };
    let L=await play(false); check('A13 沒有麵店團群組：第一句「中秋節前的河濱。大家借了一個烤肉架。」＋「你被分到顧火。火一直熄。」',L[0]==='中秋節前的河濱。大家借了一個烤肉架。'&&L.includes('你被分到顧火。火一直熄。'),JSON.stringify(L.slice(0,4)));
    const ids=['zhe','yu','heroine_01','heroine_03','classmate_bohan','npc_fangyt'];
    L=await play(true,()=>{ G.flags.met_yu=true; for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) SOCIAL.remember(id,'FIRST_MET',''); });
    const rel0=JSON.stringify(ids.map(id=>SOCIAL.rel(id)));
    check('A13 在麵店團群組：第一句「中秋節前的河濱。麵店團借了一個烤肉架。」',L[0]==='中秋節前的河濱。麵店團借了一個烤肉架。',L[0]);
    check('A13 只記 MIDAUTUMN_Y1：沒有人記 SHARED_MEAL',G.flags.MIDAUTUMN_Y1===true&&ids.every(id=>!SOCIAL.has(id,'SHARED_MEAL')),JSON.stringify(ids.filter(id=>SOCIAL.has(id,'SHARED_MEAL'))));
    fresh(SAT,14.5,'campus',{}); G.flags.met_yu=true; for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) SOCIAL.remember(id,'FIRST_MET','');
    const before=JSON.stringify(ids.map(id=>SOCIAL.rel(id))), e0=G.energy, m0=G.money; OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:SAT,h:15,place:'河濱',title:'中秋烤肉',travelH:0.25}); picks=['出發']; await tickOut();
    check('A13 不加數值：六個人的關係數值、體力、錢都不變',JSON.stringify(ids.map(id=>SOCIAL.rel(id)))===before&&G.energy===e0&&G.money===m0,JSON.stringify({after:ids.map(id=>SOCIAL.rel(id)),before:JSON.parse(before)})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
