// 交接包 v1（大一上）第 9 批：AA、BB 2026-10-14 的答案——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   芷若的通識群組（BB_95 4-2，654f5dd）：她在小組群組的第一則下面可以回三種（貼圖貼出去是「（貼圖：OK）」），她不在群組回；回過＝當晚 22:07 收到替代版私訊
//     （交往中隔天 15:10、「昨天」；22:07 以後才回＝隔天 22:07、「昨天」）；不回＝沒有私訊（等 Café 第五次）；和 Café 第五次的版本只傳一次（先到的那個）。
//   麵店團（AA 2026-10-14）：上一個麵店日沒來，阿哲才在群組揪（17:30，四句輪流）；一直有來＝安靜；考試週、國定假日不是麵店日；舊存檔（開始記以前）當作有來。
//   校慶攤：學姊「那是物權。你們大二才上。」（v1_batch4_unit 檢查）。
//   A13 中秋烤肉（AA 2026-10-14）：沒有麵店團群組＝「大家借了一個烤肉架」；「你被分到顧火。火一直熄。」；只記 MIDAUTUMN_Y1，關係數值不變、沒有 SHARED_MEAL。
//   A15 考完的宵夜（AA 2026-10-14）：民總期中考那天 20:30 公館滷味攤（出遊）；有麵店團群組＝考完阿哲在群組「考完了 滷味」；沒有＝G1 最後阿哲當面問「晚上滷味，來不來？」；
//     明軒認識才有「明軒說他沒念。……我不信，他筆記比我多。」；SAW_HIM_STUDY 多一個選項「……他有念啦。」→ 瞪一眼、請一顆滷蛋；柏翰、芯慈、Alison 都認識才有吵第三題；不去不扣分。
//   A16 翰 1（AA 2026-10-14）：第 10 週民總下課（第 10 週沒去的話第 11 週）；三個選項；「（告訴他分數）」只有旁白「你說了分數。」（畫面上沒有數字），
//     比他高／低照民總準備程度（很好＝高）；TOLD_SCORE、ASKED_BACK、BOHAN_SCORE；沒見過他先自我介紹；只一次。
//   A17 以安新 4：第 10 週週五 18:00–21:30 不在學校，人物線索「和媽媽吃晚餐」；其他天照舊。
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
    check('回過：當晚 22:07 才收到替代版私訊（三句；AA_207 附錄 §2：「我是經原那組的芷若。」、沒去過 Café＝「我在溫州街的兩點半打工，要喝什麼可以先傳。」；第三句「剛剛」）',before===0&&JSON.stringify(dm().map(x=>x[2]))===JSON.stringify(['我是經原那組的芷若。','我在溫州街的兩點半打工，要喝什麼可以先傳。','你剛剛在群組回得很快。我以為法律系的人都很慢。'])&&dm().every(x=>x[0]===FRI&&x[1]>=22+7/60-0.001&&x[1]<22+7/60+0.06),JSON.stringify(dm()));
    check('回過：收到以後有她的聯絡方式',INV.hasContact(G,'heroine_02'));
    { const m2=setup({CAFE_VISITS:2}); G.hour=12; PHONE.answer(G,m2.ask.id,0); run(12,22.3); check('回過、去過 Café（點過餐）：第二句「也是兩點半那個店員。」（AA_207 附錄 §2）',JSON.stringify(dm().map(x=>x[2]).slice(0,2))===JSON.stringify(['我是經原那組的芷若。','也是兩點半那個店員。']),JSON.stringify(dm())); }
    m=setup({dating_kexin:true}); G.hour=12; PHONE.answer(G,m.ask.id,0); run(12,23.9); const d0=dm().length; keepOn(FRI+1,0); run(0,15.3);
    check('交往中：當晚沒有，隔天 15:10 收到、第三句「你昨天在群組回得很快。」',d0===0&&dm().length===3&&dm().every(x=>x[0]===FRI+1&&x[1]>=15+10/60-0.001&&x[1]<15+10/60+0.06)&&dm()[2][2]==='你昨天在群組回得很快。我以為法律系的人都很慢。',JSON.stringify(dm()));
    m=setup(); G.hour=22.5; PHONE.answer(G,m.ask.id,1); run(22.5,23.9); const late0=dm().length; keepOn(FRI+1,0); run(0,22.3);
    check('22:07 以後才回：隔天 22:07、第三句「昨天」（不會補在回覆之前的時間）',late0===0&&dm().length===3&&dm().every(x=>x[0]===FRI+1&&x[1]>=22+7/60-0.001&&x[1]<22+7/60+0.06)&&dm()[2][2]==='你昨天在群組回得很快。我以為法律系的人都很慢。',JSON.stringify(dm()));
    setup(); run(11.5,23.9); keepOn(FRI+1,0); run(0,23.9); check('不回：沒有私訊（等 Café 第五次）',dm().length===0);
    m=setup({zhiruoShopContactDay:FRI-1,zhiruoFirstOrder:'拿鐵'}); G.hour=12; PHONE.answer(G,m.ask.id,0); run(12,23.9);
    check('Café 第五次的私訊先到：群組回過也不會再傳一次（只有 Café 版三句）',dm().length===3&&dm()[0][2]==='我是兩點半的芷若。店裡的帳號是我在回。'   /* AA_207 §5（BB_167 SC3 第 27 列）*/,JSON.stringify(dm()));
    m=setup(); G.hour=12; PHONE.answer(G,m.ask.id,1); run(12,23.9); G.flags.zhiruoShopContactDay=FRI+3; G.flags.zhiruoFirstOrder='手沖'; keepOn(FRI+3,10); run(10,23.9);
    check('群組先回：之後 Café 第五次不會再傳 Café 版',dm().length===3&&dm()[0][2]==='我是經原那組的芷若。',JSON.stringify(dm())); }
  /* ---------- 吃飯群組：不再定時揪人（原本「麵店團：沒來才揪」，AA_542 2-3 拿掉）---------- */
  { const W4THU=termDay(4,4), PINGS=['麵店 我揪了','麵店 我先到','今天阿姨有滷蛋','麵店 不用回'];   /* AA_313 5-3：阿哲的訊息不加句號 */
    const sim=(d0,d1,came)=>{ for(let d=d0;d<=d1;d++){ keepOn(d,7.5,'campus'); run(7.5,17.9,0.1); if(came(d)){ G.zone='noodle'; run(18,19,0.1); G.zone='campus'; } run(19.1,23.5,0.1); } };
    const pings=()=>G.msgs.filter(m=>m.tag&&m.tag.startsWith('rt_zhe_ndl_')).map(m=>[m.day,m.text]);
    const start=()=>{ fresh(W4THU,18,'noodle',{noodleTableDay:W4THU}); run(18,19,0.1); };
    /* AA_542 2-3（NOODLE-TEAM-SHRINK-1030，使用者 10-30 X144 麵店團縮小成背景）：傍晚 17:30 的定時揪人、連三次沒來的追問拿掉——有來沒來，群組都不揪 */
    start(); sim(W4THU+1,W4THU+14,d=>STORY.noodleDay(d));
    check('一直有來：兩週群組都安靜',pings().length===0,JSON.stringify(pings()));
    start(); sim(W4THU+1,termDay(7,4),()=>false);
    check('一直沒來（第 4～7 週）：也不揪、不問「你最近都沒來 還好嗎」（AA_542 2-3）',pings().length===0&&!G.msgs.some(m=>/你最近都沒來/.test(m.text||'')),JSON.stringify(pings()));
    fresh(termDay(6,1),8,'campus',{noodleTableDay:W4THU}); PHONE.join(G,'noodle_team','麵店團'); sim(termDay(6,1),termDay(6,2),()=>false);
    check('舊存檔（群組叫「麵店團」）：名字換成當學年的「法一吃飯」、不揪（AA_542 2-4）',pings().length===0&&PHONE.rec(G).groups.noodle_team.name==='法一吃飯',JSON.stringify({p:pings(),n:PHONE.rec(G).groups.noodle_team.name})); }
  /* ---------- A13 中秋烤肉 ---------- */
  { const SAT=STORY.termDay('Y1S1',5,6), tickOut=async()=>{ const p=OUT.tick(GM); if(p) return await p; return null; };
    const play=async(group,setup)=>{ fresh(SAT,14.5,'campus',{}); if(group) PHONE.join(G,'noodle_team','麵店團'); if(setup) setup(); OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:SAT,h:15,place:'河濱',title:'中秋烤肉',travel:'走過去約 15 分鐘',travelH:0.25}); picks=['出發']; await tickOut(); return lines(); };
    let L=await play(false); check('A13 沒有麵店團群組：第一句「中秋節前的河濱。大家借了一個烤肉架。」＋「你被分到顧火。火一直熄。」',L[0]==='中秋節前的河濱。大家借了一個烤肉架。'&&L.includes('你被分到顧火。火一直熄。'),JSON.stringify(L.slice(0,4)));
    const ids=['zhe','yu','heroine_01','heroine_03','classmate_bohan','npc_fangyt'];
    L=await play(true,()=>{ G.flags.met_yu=true; for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) SOCIAL.remember(id,'FIRST_MET',''); });
    const rel0=JSON.stringify(ids.map(id=>SOCIAL.rel(id)));
    check('A13 在麵店團群組：第一句「中秋節前的河濱。阿哲借了一個烤肉架。」',L[0]==='中秋節前的河濱。阿哲借了一個烤肉架。',L[0]);
    check('A13 只記 MIDAUTUMN_Y1：沒有人記 SHARED_MEAL',G.flags.MIDAUTUMN_Y1===true&&ids.every(id=>!SOCIAL.has(id,'SHARED_MEAL')),JSON.stringify(ids.filter(id=>SOCIAL.has(id,'SHARED_MEAL'))));
    fresh(SAT,14.5,'campus',{}); G.flags.met_yu=true; for(const id of ['heroine_01','heroine_03','classmate_bohan','npc_fangyt']) SOCIAL.remember(id,'FIRST_MET','');
    const before=JSON.stringify(ids.map(id=>SOCIAL.rel(id))), e0=G.energy, m0=G.money; OUT.plan(G,{id:'bbq',ev:'ev_mid_autumn_bbq',day:SAT,h:15,place:'河濱',title:'中秋烤肉',travelH:0.25}); picks=['出發']; await tickOut();
    check('A13 不加數值：六個人的關係數值、體力、錢都不變',JSON.stringify(ids.map(id=>SOCIAL.rel(id)))===before&&G.energy===e0&&G.money===m0,JSON.stringify({after:ids.map(id=>SOCIAL.rel(id)),before:JSON.parse(before)})); }
  /* ---------- A15 考完的宵夜 ---------- */
  { let midDay=null, midIt=null; for(let d=termDay(8,1);d<=termDay(9,7);d++){ fresh(d,8,'campus'); const it=CLS.dayItems(G,d).find(x=>x.c.id==='civ_general'&&x.exam==='mid'); if(it){ midDay=d; midIt=it; break; } }
    check('A15：民總期中考那天（第 '+midDay+' 天，'+(midIt&&midIt.t1)+' 考完）',!!midDay);
    const tickOut=async()=>{ const p=OUT.tick(GM); if(p) return await p; return null; };
    /* 有群組 */
    fresh(midDay,8,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(8,midIt.t1-0.05,0.05); const before=G.msgs.filter(m=>m.tag==='zhe_supper_mid1').length; run(midIt.t1,midIt.t1+0.3,0.05);
    const gm=G.msgs.filter(m=>m.tag==='zhe_supper_mid1'), o=OUT.get(G,'supper_mid1');
    check('A15 有麵店團群組：考完以後阿哲在群組「考完了 滷味」（考完以前沒有）；排 20:30 公館滷味攤',before===0&&gm.length===1&&gm[0].th==='g:noodle_team'&&gm[0].from==='zhe'&&gm[0].text==='考完了 滷味'&&!!o&&o.day===midDay&&o.h===20.5&&o.place==='公館滷味攤'&&o.ev==='ev_midterm_supper',JSON.stringify({gm:gm.map(m=>[m.h,m.text]),o}));
    /* 沒有群組：G1 最後當面問 */
    const g1=async(flags,group,pk)=>{ fresh(midDay,midIt.t0+0.2,'classroom',Object.assign({readCase:'full'},flags||{})); if(group) PHONE.join(G,'noodle_team','麵店團'); picks=pk||[]; await CLS.attend(GM,midIt); return lines(); };
    let L=await g1({},false,['去吃飯','「去。」']);
    check('A15 沒有群組：G1 最後阿哲當面問「晚上滷味，來不來？」（兩個選項）',L[L.length-1]==='晚上滷味，來不來？'&&JSON.stringify(opts[opts.length-1])==='["「去。」","「這次不行。」"]',JSON.stringify({L:L.slice(-2),o:opts[opts.length-1]}));
    run(G.hour,G.hour+0.1); check('A15 回「去。」＝排 20:30 公館滷味攤',!!OUT.get(G,'supper_mid1')&&OUT.get(G,'supper_mid1').h===20.5);
    await g1({},false,['去吃飯','這次不行']); run(G.hour,G.hour+0.1); check('A15 回「這次不行。」＝不排',!OUT.get(G,'supper_mid1'));
    L=await g1({},true,['去吃飯']); check('A15 有群組的玩家 G1 不當面問（在群組揪）',!L.includes('晚上滷味，來不來？'));
    /* 宵夜的內容 */
    const sup=async(setup,pk,go)=>{ fresh(midDay,20,'campus',{}); if(setup) setup(); OUT.plan(G,{id:'supper_mid1',ev:'ev_midterm_supper',day:midDay,h:20.5,place:'公館滷味攤',title:'考完的宵夜',travel:'走過去約 10 分鐘',travelH:1/6}); G.hour=20.4; picks=[go===false?'不去了':'出發'].concat(pk||[]); await tickOut(); return lines(); };
    L=await sup(null); check('A15 只認識阿哲：滷味攤前對答案、「不要跟我講第二題。」；沒有明軒那句、沒有吵第三題',caps.includes('公館・滷味攤')&&JSON.stringify(L)===JSON.stringify(['公館的滷味攤前，大家在對答案。','有人只想吃，不想對：「不要跟我講第二題。」']),JSON.stringify({L,caps}));
    L=await sup(()=>SOCIAL.remember('classmate_mingxuan','FIRST_MET',''));
    check('A15 認識明軒：阿哲「明軒說他沒念。……我不信，他筆記比我多。」；沒有 SAW_HIM_STUDY 不出現選項',L.includes('明軒說他沒念。……我不信，他筆記比我多。')&&!opts.some(o=>o.includes('「……他有念啦。」')),JSON.stringify(L));
    L=await sup(()=>{ SOCIAL.remember('classmate_mingxuan','FIRST_MET',''); SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''); },['他有念啦']);
    check('A15 有 SAW_HIM_STUDY：多一個選項「……他有念啦。」→ 明軒瞪你一眼、請你一顆滷蛋',opts.some(o=>o.includes('「……他有念啦。」'))&&L.includes('明軒瞪了你一眼。')&&L.includes('然後請你一顆滷蛋。'),JSON.stringify(L));
    L=await sup(()=>{ G.flags.met_yu=true; for(const id of ['classmate_bohan','classmate_xinci']) SOCIAL.remember(id,'FIRST_MET',''); });
    check('A15 柏翰、芯慈、Alison 都認識：吵第三題、Alison「你們兩個要不要結婚。」、兩人「不要。」',L.includes('柏翰和芯慈為了第三題的答案吵到滷味都冷了。')&&L.includes('你們兩個要不要結婚。')&&L.includes('不要。'),JSON.stringify(L));
    L=await sup(()=>{ G.flags.met_yu=true; SOCIAL.remember('classmate_bohan','FIRST_MET',''); }); check('A15 只認識其中兩個：沒有吵第三題那段',!L.some(t=>/第三題|結婚/.test(t)),JSON.stringify(L));
    fresh(midDay,20,'campus',{}); const r0=JSON.stringify(G.social.rel), e0=G.energy, m0=G.money; OUT.plan(G,{id:'supper_mid1',ev:'ev_midterm_supper',day:midDay,h:20.5,place:'公館滷味攤',title:'考完的宵夜',travelH:1/6}); G.hour=20.4; picks=['不去了']; await tickOut();
    check('A15 不去：不扣分（關係、體力、錢都不變），沒有演',OUT.get(G,'supper_mid1').state==='missed'&&JSON.stringify(G.social.rel)===r0&&G.energy===e0&&G.money===m0&&!lines().length); }
  /* ---------- A16 翰 1 第三題（AA_546 1-2；原本「你考幾分」）---------- */
  /* 最後一句「考古題我晚上傳給你。」：還沒有柏翰的聯絡方式時，期中放榜那天給（AA_70 第 2 節、AA_124 1-7；3a0dafe，contact_moments_unit 另外測） */
  { const e=ev('ev_bohan_score'); const civ=w=>{ for(let wd=1;wd<=5;wd++){ const d=termDay(w,wd); fresh(d,8,'campus'); const it=CLS.dayItems(G,d).find(x=>x.c.id==='civ_general'&&!x.exam); if(it) return {d,it}; } return null; };
    const w10=civ(10), w11=civ(11), w9=civ(9)||civ(7);
    const cls=async(at,prep,met,pk)=>{ fresh(at.d,at.it.t0+0.2,'classroom',{readCase:'full'}); if(met) SOCIAL.remember('classmate_bohan','FIRST_MET',''); CLS.rec(G).prep.civ_general=prep; picks=pk||[]; await CLS.attend(GM,at.it); return lines(); };
    check('A16 事件存在：民總下課（afterClass civ_general）、第 10～11 週、只一次',!!e&&e.afterClass==='civ_general'&&JSON.stringify(e.weeks)==='[10,11]'&&e.once&&!!w10&&!!w11);
    /* AA_546 1-2（NO-COMPARE-1030，D116）：問寫法、不問分數；「比他低／比他高」合成一版，「不想說」那一支拿掉 */
    let L=await cls(w10,12,true,['講你怎麼寫']); const o=opts.find(x=>x.includes('（講你怎麼寫的）'));
    check('A16 柏翰「民總期中，第三題你怎麼寫？」「我問了十四個人。你是第十五個。」；三個選項（AA_546 1-2）；沒有「你民總幾分？」',L.includes('民總期中，第三題你怎麼寫？')&&L.includes('我問了十四個人。你是第十五個。')&&!L.includes('你民總幾分？')&&JSON.stringify(o)==='["（講你怎麼寫的）","「我也不確定。」","「你錯哪裡？」"]',JSON.stringify({L,o}));
    const tail=a=>L.slice(L.indexOf('我問了十四個人。你是第十五個。')+1);
    check('A16 講你怎麼寫：「你講了你的寫法。」「……你先從事實看的。好。」「他寫進手機的備忘錄。」；畫面上沒有數字；TOLD_SCORE、BOHAN_SCORE told',JSON.stringify(tail())==='["你講了你的寫法。","……你先從事實看的。好。","他寫進手機的備忘錄。","考古題我晚上傳給你。"]'&&!tail().some(t=>/[0-9０-９]/.test(t))&&SOCIAL.has('classmate_bohan','TOLD_SCORE')&&G.flags.BOHAN_SCORE==='told',JSON.stringify(tail()));
    check('A16 只一次',!EVENTS.check(e,{chain:true}));
    L=await cls(w10,6,true,['講你怎麼寫']); check('A16 民總準備多少都同一版（不分比他高、比他低）',JSON.stringify(tail())==='["你講了你的寫法。","……你先從事實看的。好。","他寫進手機的備忘錄。","考古題我晚上傳給你。"]'&&G.flags.BOHAN_SCORE==='told',JSON.stringify(tail()));
    L=await cls(w10,12,true,['不確定']); check('A16「我也不確定。」：「好。不確定也算一種寫法。」「他也寫進去。」；沒有 TOLD_SCORE、BOHAN_SCORE unsure',JSON.stringify(tail())==='["好。不確定也算一種寫法。","他也寫進去。","考古題我晚上傳給你。"]'&&!SOCIAL.has('classmate_bohan','TOLD_SCORE')&&G.flags.BOHAN_SCORE==='unsure',JSON.stringify(tail()));
    L=await cls(w10,0,true,['你錯哪裡']); check('A16「你錯哪裡？」：他停了一下。「……第三題。整題。」（第一次有人反問他。）；ASKED_BACK；沒有名次',JSON.stringify(tail())==='["他停了一下。","……第三題。整題。","第一次有人反問他。","考古題我晚上傳給你。"]'&&SOCIAL.has('classmate_bohan','ASKED_BACK')&&!tail().some(t=>/第六|八十一/.test(t)),JSON.stringify(tail()));
    L=await cls(w10,0,false,['不確定']); check('A16 沒見過柏翰：先「許柏翰。第一排那個。」',L.includes('許柏翰。第一排那個。')&&L.indexOf('許柏翰。第一排那個。')<L.indexOf('民總期中，第三題你怎麼寫？'),JSON.stringify(L));
    L=await cls(w11,0,true,['不確定']); check('A16 第 10 週沒去：第 11 週那堂也會',L.includes('民總期中，第三題你怎麼寫？'));
    L=await cls(w9,0,true,['不確定']); check('A16 第 10 週以前的民總下課沒有',!L.includes('民總期中，第三題你怎麼寫？')); }
  /* ---------- A17 以安新 4：和媽媽吃晚餐 ---------- */
  { const at=(w,wd,h)=>{ fresh(termDay(w,wd),h,'campus',{afternoonDone:true}); return STORY.whereIs(GM,'heroine_01'); };
    const a=at(10,5,19), b=at(10,5,17.5), c=at(10,4,19), d=at(11,5,19), e2=at(10,5,21.6);
    check('A17：第 10 週週五 19:00 以安不在學校，人物線索「和媽媽吃晚餐」（到 21:30）',!!a&&a.zone==null&&a.away==='和媽媽吃晚餐'&&a.until==='21:30',JSON.stringify(a));
    check('A17：同一天 17:30、前一天、下一週週五、21:36 以後照舊（不是「和媽媽吃晚餐」）',[b,c,d,e2].every(x=>!x||x.away!=='和媽媽吃晚餐'),JSON.stringify([b,c,d,e2])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
