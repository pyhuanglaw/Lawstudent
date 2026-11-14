// 118 巷（D46；AA_280 @02ed9b0a；使用者 2026-10-18 02:2x 放進 v9.10）：src/lane118.js＋src/data/lane118_shops.js——營業時間、常客站店門、店門口點餐（一個人／一起吃）、
// 阿哲週一 12:00 揪午餐（第一次 Y1S1 第 2 週、之後照 noodle2 → dian → korea → home 輪、不在群組＝私訊）、「走。」排 12:15 出遊（goto 118 巷）；資料和白名單上的 AA_280 一致。改版前會失敗。
// 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：九間店改版＋兩間外帶飲料店；AA_280 @ef7280917、AA_772）改期望——舊期望：九間店、11 列常客；阿哲的麵店＝noodle2 六張犁麵舖
//   （牛肉麵 150／乾麵＋滷蛋 75／餛飩湯 50）、輪流 noodle2 → dian → korea → home（「今天換一間 我想吃滇緬」）；柏翰在好家自助餐（self）、學姊在一一八茶飲（tea，H1 點無糖綠茶）；家常菜、蛋包飯週一休。
//   新期望：十一間店、10 列常客；阿哲的麵店＝korea 清州刀削麵、輪流 korea → dian → tea → home；柏翰在大學食堂（cafe2）、學姊在喝不喝咖啡（drink_a，H1 點綠茶）；奈良咖哩、義大麵屋週一休。
// 用法：node tests/lane118_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA|L118|LANE118_SHOPS|L118_REDO|LANE118_LAYOUT|SISG)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/vac_activities.js','src/vac3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/lane118.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
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

  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const law=(k,h,flags)=>{ fresh(DK(k),h||12,'campus',Object.assign({},flags||{})); G.stage='law'; return G; };
  // 0. 資料：和白名單上的 AA_280 一致（匯入工具 --check）、九間店、11 列常客
  { const r=require('child_process').spawnSync('python3',['tools/lane118/import_lane118.py','--check'],{cwd:ROOT,encoding:'utf8'});
    check('0. src/data/lane118_shops.js 和白名單上的 AA_280 一致（import_lane118.py --check）',r.status===0,(r.stdout||'')+(r.stderr||''));
    check('0. 十一間店、10 列常客、店 id 和配置 lane118_layout.js 一樣',LANE118_SHOPS.shops.length===11&&LANE118_SHOPS.regulars.length===10&&LANE118_SHOPS.shops.every(s=>LANE118_LAYOUT.shops.some(q=>q.id===s.id))); }
  // 1. 營業時間
  { law('2025-09-08',12.5); check('1. 週一 12:30：刀削麵開、奈良咖哩（週一休）沒開、義大麵屋（週一休）沒開、喝不喝咖啡開',L118.isOpen('korea',G)&&!L118.isOpen('omu',G)&&!L118.isOpen('pasta',G)&&L118.isOpen('drink_a',G));
    /* 2026-11-12（L118-HOURS-1112，使用者：「我下午3點去幾乎每一家店都沒有開」「他們的營業時間至少是從中午開始到晚上吧」）：118 巷的店不午休，開門到打烊連著開。舊期望：週一 15:00 刀削麵、大學食堂午休沒開 */
    G.hour=15; check('1. 週一 15:00：刀削麵、大學食堂、飲料店都開（不午休）；公休日照舊（義大麵屋週一休）',L118.isOpen('korea',G)&&L118.isOpen('cafe2',G)&&L118.isOpen('drink_b',G)&&!L118.isOpen('pasta',G));
    { const SH=LANE118_SHOPS.shops, mid=SH.filter(s=>!s.hours.open.some(([a,b])=>a<=12&&b>=19)); check('1. 每一間店都至少從中午 12:00 開到晚上 19:00、中間不休息',mid.length===0&&SH.every(s=>s.hours.open.length===1),mid.map(s=>s.name+' '+s.hours.text).join('｜')); }
    G.hour=12.5; said=[]; await L118.order(GM,'omu'); check('1. 沒開的店：「（鐵門拉下來一半。門上貼著營業時間。）」、沒扣錢',J(lines())===J(['（鐵門拉下來一半。門上貼著營業時間。）'])&&G.money===5000,J(lines())); }
  // 2. 一個人點餐
  { law('2025-09-08',12.5); let paid=0; const m0=GM.money; GM.money=d=>{ paid+=d; G.money+=d; }; picks=[0]; said=[]; await L118.order(GM,'korea'); GM.money=m0;
    check('2. 一個人（清州刀削麵）：老闆「大碗小碗？」→ 選牛肉刀削麵 190 → 「（你點了牛肉刀削麵。）」→ 吃完的旁白（資料那一句）、扣 190、時間 +40 分',J(lines())===J(['老闆：大碗小碗？','（你點了牛肉刀削麵。）',L118.shop('korea').done])&&paid===-190&&Math.abs(G.hour-(12.5+40/60))<1e-6,J(lines())+' '+paid);
    check('2. 菜單照 AA_280：牛肉刀削麵 190／番茄刀削麵 150／木須炒刀削麵 170／炸醬刀削麵 140（＋不用了）',J(opts[0])===J(['牛肉刀削麵　190 元','番茄刀削麵　150 元','木須炒刀削麵　170 元','炸醬刀削麵　140 元','不用了']),J(opts[0]));
    law('2025-09-08',12.5); G.money=40; picks=[0]; said=[]; await L118.order(GM,'korea'); check('2. 錢不夠：不扣錢、沒有點菜那句',G.money===40&&!lines().some(t=>t.includes('你點了'))); }
  // 3. 常客：週一 12:30 阿哲在麵舖、柏翰在自助餐；寒暑假、第 16 週、週末不出現；沛珊到 2026-12-16；學姊 tea 只到 Y1S2、Y2S1 起 cafe2
  { law('2025-09-08',12.5); const ids=L118.regularsAt(G).map(r=>r.id+'@'+r.shop).sort();
    check('3. 2025-09-08（Y1S1 第 2 週週一）12:30：阿哲＠刀削麵、柏翰＠大學食堂、學姊＠喝不喝咖啡',J(ids)===J(['classmate_bohan@cafe2','heroine_05@drink_a','zhe@korea']),J(ids));
    law('2025-09-01',12.5); check('3. 第 1 週（9/1）還沒有常客',L118.regularsAt(G).length===0);
    law('2025-12-15',12.5); check('3. 第 16 週（期末考週）沒有',L118.regularsAt(G).length===0);
    law('2026-01-12',12.5); check('3. 寒假沒有',L118.regularsAt(G).length===0);
    law('2026-12-16',12.5); const a=L118.regularsAt(G,'omu').map(r=>r.id); law('2026-12-23',12.5); const b=L118.regularsAt(G,'omu').map(r=>r.id);
    check('3. 沛珊週三蛋包飯到 2026-12-16（含），之後沒有',a.includes('classmate_peishan')&&!b.includes('classmate_peishan'),J([a,b]));
    law('2027-03-01',12.55); const t2=L118.regularsAt(G,'drink_a').map(r=>r.id); law('2026-09-14',12.55); const t3=L118.regularsAt(G,'drink_a').map(r=>r.id);
    check('3. 學姊在茶飲只到 Y1S2（2027-03-01 Y2S2 沒有；2026-09-14 Y2S1 也沒有）',!t2.includes('heroine_05')&&!t3.includes('heroine_05'),J([t2,t3]));
    law('2026-09-17',12.5); check('3. 學姊 Y2S1 起週四在咖啡',L118.regularsAt(G,'cafe2').some(r=>r.id==='heroine_05')); }
  // 4. 進到 118 巷：常客站到店門口；一起吃（見過面的）＝招呼「幾位？……那邊那張可以坐。」、吃完換他那句
  { law('2025-09-08',12.5); G.zone='lane118'; SOCIAL.remember('zhe','FIRST_MET',''); const sp=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x,y:0,z}}}; GM.npc[id]=n; sp.push([id,+x.toFixed(2),+z.toFixed(2)]); return n; };
    const n=L118.populate(GM); const dz=L118.door('korea');
    check('4. 進巷子：三個常客站到店門口（阿哲在麵舖門口旁邊的人行道上）',n===3&&sp.some(([id,x,z])=>id==='zhe'&&Math.abs(z-dz.z)<1.5&&Math.abs(x-dz.x)<1.2),J(sp));
    check('4. 站店門口的常客有 until（時段結束 refreshSchedule 讓他走開）、記下是哪一間',GM.npc.zhe.until===13&&GM.npc.zhe.l118Shop==='korea');
    { const g0=G.hour; G.hour=12.0; GM.npc={}; const n0=L118.populate(GM); G.hour=12.2; const n1=L118.populate(GM); const n2=L118.populate(GM); G.hour=g0;
      check('4. 12:00 進巷子還沒有人；12:12 再叫一次（refreshSchedule）就補上，不重複',n0===0&&n1>=2&&n2===0,J([n0,n1,n2])); }
    picks=[1]; said=[]; await L118.order(GM,'korea');
    check('4. 和阿哲一起：老闆「幾位？……那邊那張可以坐。」→「（你點了番茄刀削麵。）」→ 阿哲「這間我給八十分。上次那間七十。」（不說一個人的那句）',J(lines())===J(['老闆：幾位？……那邊那張可以坐。','（你點了番茄刀削麵。）','阿哲：這間我給八十分。上次那間七十。']),J(lines()));
    picks=[0]; said=[]; await L118.order(GM,'cafe2');
    check('4. 柏翰沒見過：一個人吃（大學食堂的阿姨「自己夾，夾好拿過來秤。」）',lines()[0]==='阿姨：自己夾，夾好拿過來秤。'&&lines().slice(-1)[0]==='（你把餐盤放到回收台，順手拿了一張餐巾紙。）',J(lines())); }
  // 5. 阿哲週一 12:00 揪人
  { law('2025-09-08',11.9); PHONE.join(G,'noodle_team','桌遊團'); SOCIAL.remember('zhe','FIRST_MET',''); SOCIAL.remember('yu','FIRST_MET',''); run(11.95,12.1);
    check('5. 第一次（Y1S1 第 2 週週一 12:00）：桌遊團群組「欸 我找到了」「後門出去 過辛亥路那條巷子」「118 巷 整條都是吃的」、Alison「我要去！！」',J(txt('g:noodle_team').slice(-4))===J(['zhe:欸 我找到了','zhe:後門出去 過辛亥路那條巷子','zhe:118 巷 整條都是吃的','yu:我要去！！']),J(txt('g:noodle_team')));
    const r=PHONE.answer(G,'l118_lunch_'+G.day,0); STORY.phoneRules(GM); const q=OUT.get(G,'l118_lunch_'+G.day);
    check('5. 「走。」→ 阿哲「後門見」；12:15 出遊到 118 巷清州刀削麵門口（goto；資料的 lunch.firstShop）；阿哲、Alison 一起',!!r&&r.out.some(m=>m.text==='後門見')&&!!q&&Math.abs(q.h-12.25)<1e-6&&q.goto&&q.goto.zone==='lane118'&&J(G.flags.L118_LUNCH.with)===J(['zhe','yu'])&&G.flags.L118_LUNCH.shop==='korea'&&LANE118_SHOPS.lunch.firstShop==='korea',J(q)+J(G.flags.L118_LUNCH));
    G.hour=12.3; G.zone='lane118'; GM.npc={}; L118.populate(GM); picks=[2]; said=[]; await L118.order(GM,'korea');
    check('5. 在麵舖點餐：阿哲、Alison 都在（各一句）',J(lines().slice(-2))===J(['阿哲：這間我給八十分。上次那間七十。','Alison：欸，下次換你選！我都選韓式。']),J(lines()));
    /* 6. 118 巷的店走得進去（LANE118-SHOPS-1020，X66）：在門口等的人跟著進店（L118.populateShop），在店裡點餐照樣一起吃（修改前 FAIL：店裡沒有他們） */
    { G.zone='l118_korea'; GM.npc={}; E.npcs=[]; const seats0=E.zone.seats; E.zone.seats=[{x:-1,z:0,yaw:0},{x:0,z:0,yaw:0},{x:1,z:0,yaw:0}]; G.hour=12.3;
      const k=L118.populateShop?L118.populateShop(GM,'korea'):0;
      check('6. 走進清州刀削麵（l118_korea）：約好午餐的阿哲、Alison 跟著進來坐在店裡', k>=2&&!!GM.npc.zhe&&!!GM.npc.yu&&GM.npc.zhe.l118Shop==='korea', J(Object.keys(GM.npc)));
      check('6. 已經在的不重複', !!L118.populateShop&&L118.populateShop(GM,'korea')===0);
      said=[]; picks=[2]; await L118.order(GM,'korea');
      check('6. 在店裡點餐：一起吃的那段照演（阿哲、Alison 各一句）', lines().some(t=>t.startsWith('阿哲：這間我給八十分'))&&lines().some(t=>t.startsWith('Alison：')), J(lines()));
      E.zone.seats=seats0; G.zone='lane118'; GM.npc={}; E.npcs=[]; }
    law('2025-09-15',11.9); PHONE.join(G,'noodle_team','桌遊團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); const w3=txt('g:noodle_team').slice(-1)[0];
    law('2025-09-22',11.9); PHONE.join(G,'noodle_team','桌遊團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); const w4=txt('g:noodle_team').slice(-1)[0];
    check('5. 之後照 korea → dian → tea → home 輪：第 3 週「今天換一間 我想吃牛排」、第 4 週「中午走不走 Alison 說要韓式」',w3==='zhe:今天換一間 我想吃牛排'&&w4==='zhe:中午走不走 Alison 說要韓式',J([w3,w4]));
    law('2025-09-08',11.9); SOCIAL.remember('zhe','FIRST_MET',''); R('zhe',...LV.FAM); run(11.95,12.1);
    check('5. 不在群組、和阿哲有點熟：私訊（只有阿哲的三句，沒有 Alison）',J(txt('p:zhe'))===J(['zhe:欸 我找到了','zhe:後門出去 過辛亥路那條巷子','zhe:118 巷 整條都是吃的']),J(txt('p:zhe')));
    law('2025-09-08',11.9); run(11.95,12.1); check('5. 不在群組、和阿哲不熟：沒有',!(G.msgs||[]).some(m=>/118/.test(m.text||'')));
    law('2025-12-15',11.9); PHONE.join(G,'noodle_team','桌遊團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); check('5. 第 16 週沒有',!(G.msgs||[]).some(m=>(m.tag||'').startsWith('l118_')));
    law('2027-03-01',11.9); PHONE.join(G,'noodle_team','桌遊團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); check('5. 2027-03-01（大二下、阿哲 Alison 交往以後）：多 Alison「我們在巷口等你」',txt('g:noodle_team').includes('yu:我們在巷口等你'),J(txt('g:noodle_team'))); }
  // 6. AA_311 H1（AA_772：搬到喝不喝咖啡 drink_a，外帶窗口；台詞不變）：飲料店 × 學姊「她的老樣子」——記 SIS_TEA_ORDER（學姊備考那一年「一起念書的日常」⑤ 才排得到）
  { const H1L=['剛剛那個學姊，你認識喔？','她每天這個時間來。無糖綠茶，去冰。從來沒換過。'], R1='對啊。我都在她走到窗口以前就做好了。', R2='（店員笑了一下，沒有再說。）';
    const tea=async(day,h,o)=>{ o=o||{}; fresh(day,h,'lane118',Object.assign({},o.flags||{})); G.stage='law'; if(o.met!==false) SOCIAL.remember('heroine_05','FIRST_MET',''); picks=(o.picks||[1,0]).slice(); said=[]; opts=[]; await L118.order(GM,o.shop||'drink_a'); return said.map(x=>x.t); };
    const has1=T=>H1L.every(t=>T.includes(t)), none=T=>!H1L.some(t=>T.includes(t));
    const w3=DK('2025-09-15'), T1=await tea(w3,12.5);
    check('6. H1 大一上第 3 週週一 12:30 在喝不喝咖啡點飲料、認識學姊：點了以後店員兩句 → 兩選一 →「她很固定。」→「對啊。我都在她走到窗口以前就做好了。」→ 走回巷口；記 SIS_TEA_ORDER',
      T1.indexOf('（你點了綠茶。）')>=0&&T1.indexOf(H1L[0])>T1.indexOf('（你點了綠茶。）')&&T1.indexOf(H1L[1])===T1.indexOf(H1L[0])+1&&J(opts.slice(-1)[0])===J(['「她很固定。」','「……謝謝。」'])&&T1.indexOf(R1)===T1.indexOf(H1L[1])+1&&T1.indexOf('（你拿著飲料走回巷口。）')>T1.indexOf(R1)&&G.flags.SIS_TEA_ORDER===true&&said.find(x=>x.t===H1L[0]).who==='店員',J(lines()));
    picks=[0]; said=[]; G.hour=12.6; await L118.order(GM,'drink_a'); check('6. H1 只一次（同一天再點、之後都沒有）',none(said.map(x=>x.t)));
    const T2=await tea(DK('2025-10-08'),12.7,{picks:[0,1]}); check('6. 選「……謝謝。」→（店員笑了一下，沒有再說。）；12:42 點（她 12:40 走了）也算',has1(T2)&&T2.indexOf(R2)===T2.indexOf(H1L[1])+1&&!T2.includes(R1)&&G.flags.SIS_TEA_ORDER===true,J(T2));
    const neg={notMet:none(await tea(w3,12.5,{met:false})),late:none(await tea(w3,12.8)),early:none(await tea(w3,12.35)),sat:none(await tea(DK('2025-09-20'),12.5)),w2:none(await tea(DK('2025-09-08'),12.5)),
      w16:none(await tea(termDay('Y1S2',16,2),12.5)),y2:none(await tea(DK('2026-09-15'),12.5)),shop:none(await tea(w3,12.5,{shop:'noodle2',picks:[0]})),done:none(await tea(w3,12.5,{flags:{SIS_TEA_ORDER:true}}))};
    const y1s2=has1(await tea(termDay('Y1S2',15,4),12.5));
    check('6. H1 不演：不認識學姊、12:48 點、12:21 點（飲料做好她還沒來）、週六、第 2 週、大一下第 16 週（她不在茶飲）、大二、別間店、記過了；大一下第 15 週週四照演',Object.values(neg).every(x=>x)&&y1s2,J(Object.assign({y1s2},neg)));
    load('src/sis_grad3d.js'); fresh(w3,21,'lawlib',{SIS_STUDY:true,SISG_SEG:4}); G.stage='law'; const s0=SISG.nextSeg(G); G.flags.SIS_TEA_ORDER=true; const s1=SISG.nextSeg(G);
    check('6. 記了 SIS_TEA_ORDER 以後，學姊「一起念書的日常」⑤ 自動開（④之後輪到⑤；沒記的時候跳回①）',s0===1&&s1===5,J([s0,s1])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
