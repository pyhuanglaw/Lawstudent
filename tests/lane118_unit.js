// 118 巷（D46；AA_280 @02ed9b0a；使用者 2026-10-18 02:2x 放進 v9.10）：src/lane118.js＋src/data/lane118_shops.js——營業時間、常客站店門、店門口點餐（一個人／一起吃）、
// 阿哲週一 12:00 揪午餐（第一次 Y1S1 第 2 週、之後照 noodle2 → dian → korea → home 輪、不在群組＝私訊）、「走。」排 12:15 出遊（goto 118 巷）；資料和白名單上的 AA_280 一致。改版前會失敗。
// 用法：node tests/lane118_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA|L118|LANE118_SHOPS|LANE118_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/vac_activities.js','src/vac3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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

  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const law=(k,h,flags)=>{ fresh(DK(k),h||12,'campus',Object.assign({},flags||{})); G.stage='law'; return G; };
  // 0. 資料：和白名單上的 AA_280 一致（匯入工具 --check）、九間店、11 列常客
  { const r=require('child_process').spawnSync('python3',['tools/lane118/import_lane118.py','--check'],{cwd:ROOT,encoding:'utf8'});
    check('0. src/data/lane118_shops.js 和白名單上的 AA_280 一致（import_lane118.py --check）',r.status===0,(r.stdout||'')+(r.stderr||''));
    check('0. 九間店、11 列常客、店 id 和配置 lane118_layout.js 一樣',LANE118_SHOPS.shops.length===9&&LANE118_SHOPS.regulars.length===11&&LANE118_SHOPS.shops.every(s=>LANE118_LAYOUT.shops.some(q=>q.id===s.id))); }
  // 1. 營業時間
  { law('2025-09-08',12.5); check('1. 週一 12:30：麵舖開、家常菜（週一休）沒開、蛋包飯（週一休）沒開、茶飲開',L118.isOpen('noodle2',G)&&!L118.isOpen('home',G)&&!L118.isOpen('omu',G)&&L118.isOpen('tea',G));
    G.hour=15; check('1. 週一 15:00：麵舖午休沒開、咖啡開',!L118.isOpen('noodle2',G)&&L118.isOpen('cafe2',G));
    G.hour=12.5; said=[]; await L118.order(GM,'home'); check('1. 沒開的店：「（鐵門拉下來一半。門上貼著營業時間。）」、沒扣錢',J(lines())===J(['（鐵門拉下來一半。門上貼著營業時間。）'])&&G.money===5000,J(lines())); }
  // 2. 一個人點餐
  { law('2025-09-08',12.5); let paid=0; const m0=GM.money; GM.money=d=>{ paid+=d; G.money+=d; }; picks=[0]; said=[]; await L118.order(GM,'noodle2'); GM.money=m0;
    check('2. 一個人：老闆「大碗小碗？」→ 選牛肉麵 150 → 「（你點了牛肉麵。）」→「（湯喝完，你才發現已經一點了。）」、扣 150、時間 +40 分',J(lines())===J(['老闆：大碗小碗？','（你點了牛肉麵。）','（湯喝完，你才發現已經一點了。）'])&&paid===-150&&Math.abs(G.hour-(12.5+40/60))<1e-6,J(lines())+' '+paid);
    check('2. 菜單照 AA_280：牛肉麵 150／乾麵＋滷蛋 75／餛飩湯 50（＋不用了）',J(opts[0])===J(['牛肉麵　150 元','乾麵＋滷蛋　75 元','餛飩湯　50 元','不用了']),J(opts[0]));
    law('2025-09-08',12.5); G.money=40; picks=[0]; said=[]; await L118.order(GM,'noodle2'); check('2. 錢不夠：不扣錢、沒有點菜那句',G.money===40&&!lines().some(t=>t.includes('你點了'))); }
  // 3. 常客：週一 12:30 阿哲在麵舖、柏翰在自助餐；寒暑假、第 16 週、週末不出現；沛珊到 2026-12-16；學姊 tea 只到 Y1S2、Y2S1 起 cafe2
  { law('2025-09-08',12.5); const ids=L118.regularsAt(G).map(r=>r.id+'@'+r.shop).sort();
    check('3. 2025-09-08（Y1S1 第 2 週週一）12:30：阿哲＠麵舖、柏翰＠自助餐、學姊＠茶飲',J(ids)===J(['classmate_bohan@self','heroine_05@tea','zhe@noodle2']),J(ids));
    law('2025-09-01',12.5); check('3. 第 1 週（9/1）還沒有常客',L118.regularsAt(G).length===0);
    law('2025-12-15',12.5); check('3. 第 16 週（期末考週）沒有',L118.regularsAt(G).length===0);
    law('2026-01-12',12.5); check('3. 寒假沒有',L118.regularsAt(G).length===0);
    law('2026-12-16',12.5); const a=L118.regularsAt(G,'omu').map(r=>r.id); law('2026-12-23',12.5); const b=L118.regularsAt(G,'omu').map(r=>r.id);
    check('3. 沛珊週三蛋包飯到 2026-12-16（含），之後沒有',a.includes('classmate_peishan')&&!b.includes('classmate_peishan'),J([a,b]));
    law('2027-03-01',12.55); const t2=L118.regularsAt(G,'tea').map(r=>r.id); law('2026-09-14',12.55); const t3=L118.regularsAt(G,'tea').map(r=>r.id);
    check('3. 學姊在茶飲只到 Y1S2（2027-03-01 Y2S2 沒有；2026-09-14 Y2S1 也沒有）',!t2.includes('heroine_05')&&!t3.includes('heroine_05'),J([t2,t3]));
    law('2026-09-17',12.5); check('3. 學姊 Y2S1 起週四在咖啡',L118.regularsAt(G,'cafe2').some(r=>r.id==='heroine_05')); }
  // 4. 進到 118 巷：常客站到店門口；一起吃（見過面的）＝招呼「幾位？裡面有位子。」、吃完換他那句
  { law('2025-09-08',12.5); G.zone='lane118'; SOCIAL.remember('zhe','FIRST_MET',''); const sp=[]; GM.spawnCharacter=(id,x,z,o)=>{ const n={id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x,y:0,z}}}; GM.npc[id]=n; sp.push([id,+x.toFixed(2),+z.toFixed(2)]); return n; };
    const n=L118.populate(GM); const dz=L118.door('noodle2');
    check('4. 進巷子：三個常客站到店門口（阿哲在麵舖門口旁邊的人行道上）',n===3&&sp.some(([id,x,z])=>id==='zhe'&&Math.abs(z-dz.z)<1.5&&Math.abs(x-dz.x)<1.2),J(sp));
    check('4. 站店門口的常客有 until（時段結束 refreshSchedule 讓他走開）、記下是哪一間',GM.npc.zhe.until===13&&GM.npc.zhe.l118Shop==='noodle2');
    { const g0=G.hour; G.hour=12.0; GM.npc={}; const n0=L118.populate(GM); G.hour=12.2; const n1=L118.populate(GM); const n2=L118.populate(GM); G.hour=g0;
      check('4. 12:00 進巷子還沒有人；12:12 再叫一次（refreshSchedule）就補上，不重複',n0===0&&n1>=2&&n2===0,J([n0,n1,n2])); }
    picks=[1]; said=[]; await L118.order(GM,'noodle2');
    check('4. 和阿哲一起：老闆「幾位？裡面有位子。」→「（你點了乾麵＋滷蛋。）」→ 阿哲「這間我給八十分。上次那間七十。」（不說一個人的那句）',J(lines())===J(['老闆：幾位？裡面有位子。','（你點了乾麵＋滷蛋。）','阿哲：這間我給八十分。上次那間七十。']),J(lines()));
    picks=[0]; said=[]; await L118.order(GM,'self');
    check('4. 柏翰沒見過：一個人吃（阿姨「自己夾，夾好拿過來算。」）',lines()[0]==='阿姨：自己夾，夾好拿過來算。'&&lines().slice(-1)[0]==='（你把餐盤放到回收台，順手拿了一張餐巾紙。）',J(lines())); }
  // 5. 阿哲週一 12:00 揪人
  { law('2025-09-08',11.9); PHONE.join(G,'noodle_team','麵店團'); SOCIAL.remember('zhe','FIRST_MET',''); SOCIAL.remember('yu','FIRST_MET',''); run(11.95,12.1);
    check('5. 第一次（Y1S1 第 2 週週一 12:00）：麵店團群組「欸 我找到了」「後門出去 過辛亥路那條巷子」「118 巷 整條都是吃的」、小語「我要去！！」',J(txt('g:noodle_team').slice(-4))===J(['zhe:欸 我找到了','zhe:後門出去 過辛亥路那條巷子','zhe:118 巷 整條都是吃的','yu:我要去！！']),J(txt('g:noodle_team')));
    const r=PHONE.answer(G,'l118_lunch_'+G.day,0); STORY.phoneRules(GM); const q=OUT.get(G,'l118_lunch_'+G.day);
    check('5. 「走。」→ 阿哲「後門見」；12:15 出遊到 118 巷麵舖門口（goto）；阿哲、小語一起',!!r&&r.out.some(m=>m.text==='後門見')&&!!q&&Math.abs(q.h-12.25)<1e-6&&q.goto&&q.goto.zone==='lane118'&&J(G.flags.L118_LUNCH.with)===J(['zhe','yu'])&&G.flags.L118_LUNCH.shop==='noodle2',J(q)+J(G.flags.L118_LUNCH));
    G.hour=12.3; G.zone='lane118'; GM.npc={}; L118.populate(GM); picks=[2]; said=[]; await L118.order(GM,'noodle2');
    check('5. 在麵舖點餐：阿哲、小語都在（各一句）',J(lines().slice(-2))===J(['阿哲：這間我給八十分。上次那間七十。','小語：欸，下次換你選！我都選韓式。']),J(lines()));
    law('2025-09-15',11.9); PHONE.join(G,'noodle_team','麵店團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); const w3=txt('g:noodle_team').slice(-1)[0];
    law('2025-09-22',11.9); PHONE.join(G,'noodle_team','麵店團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); const w4=txt('g:noodle_team').slice(-1)[0];
    check('5. 之後照 noodle2 → dian → korea → home 輪：第 3 週「今天換一間 我想吃滇緬」、第 4 週「中午走不走 小語說要韓式」',w3==='zhe:今天換一間 我想吃滇緬'&&w4==='zhe:中午走不走 小語說要韓式',J([w3,w4]));
    law('2025-09-08',11.9); SOCIAL.remember('zhe','FIRST_MET',''); R('zhe',...LV.FAM); run(11.95,12.1);
    check('5. 不在群組、和阿哲有點熟：私訊（只有阿哲的三句，沒有小語）',J(txt('p:zhe'))===J(['zhe:欸 我找到了','zhe:後門出去 過辛亥路那條巷子','zhe:118 巷 整條都是吃的']),J(txt('p:zhe')));
    law('2025-09-08',11.9); run(11.95,12.1); check('5. 不在群組、和阿哲不熟：沒有',!(G.msgs||[]).some(m=>/118/.test(m.text||'')));
    law('2025-12-15',11.9); PHONE.join(G,'noodle_team','麵店團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); check('5. 第 16 週沒有',!(G.msgs||[]).some(m=>(m.tag||'').startsWith('l118_')));
    law('2027-03-01',11.9); PHONE.join(G,'noodle_team','麵店團'); G.flags.L118_FIRST_SENT=true; run(11.95,12.1); check('5. 2027-03-01（大二下、阿哲小語交往以後）：多小語「我們在巷口等你」',txt('g:noodle_team').includes('yu:我們在巷口等你'),J(txt('g:noodle_team'))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
