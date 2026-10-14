// 交接包 v1（大一上）第 9 批：AA、BB 2026-10-14 的答案——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   芷若的通識群組（BB_95 4-2，654f5dd）：她在小組群組的第一則下面可以回三種（貼圖貼出去是「（貼圖：OK）」），她不在群組回；回過＝當晚 22:07 收到替代版私訊
//     （交往中隔天 15:10、「昨天」；22:07 以後才回＝隔天 22:07、「昨天」）；不回＝沒有私訊（等 Café 第五次）；和 Café 第五次的版本只傳一次（先到的那個）。
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
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
