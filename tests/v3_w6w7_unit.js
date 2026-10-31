// 大二上第 6～7 週：沛珊和柏翰分開（BB_100 2-3）、柏翰翰 2 考古題小組（AA_40＋AA_177）、以安新 8 讀書會的規則（交接包 v3 3b＋AA_140 G13）——不需要瀏覽器。
// 修改前沒有這些事件（全部失敗）。用法：node tests/v3_w6w7_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const ids=['ev_peishan_bohan_split','ev_bohan_exam_group','ev_bohan_group_session','ev_bohan_group_heard','ev_plg_rules','ev_plg_rules_after']; check('0. 事件在',ids.every(i=>ev(i))); if(!ids.every(i=>ev(i))){ console.log('FAILED '+fails); process.exit(1); }
  global.STORY.present=()=>true; global.GAME=GM; const at=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; E.player.lv=0; }, tick=()=>{ said=[]; return EVENTS.tick(0.1); };
  const wait=async()=>{ for(let i=0;i<50&&EVENTS.running;i++) await new Promise(r=>setTimeout(r,0)); }, norm=a=>a.map(t=>t.replace(/^(Alison|沈以安|以安|小安|阿哲|許柏翰|柏翰|郭沛珊|沛珊|阿凱)：/,''));
  // 1. 沛珊和柏翰分開
  const w6=termDay('Y2S1',6,2); fresh(w6,12.3,'linze',{}); G.stage='law'; at(0,0); G.events.done.ev_peishan_decision=1; check('1. 她不在旁邊不演（AA_374 第 18 項：合併進 ev_peishan_split，走到她旁邊才演）',!tick());
  { const ps={obj:{position:{x:1,y:0,z:0}},lv:0}; GM.npc.classmate_peishan=ps; E.npcs=[ps]; meet('classmate_peishan'); R('classmate_peishan',25,10,10); at(1.5,0.5); }
  tick(); await wait(); let L=norm(lines());
  check('1. 第 6 週中午霖澤館、看過 P3、有點熟：兩句（AA_313 6-5 第 11 點的順序：先說分開了）、PEISHAN_BOHAN_SPLIT',JSON.stringify(L)===JSON.stringify(['我們上週分開了。我自己說的。','柏翰說他不懂。……他沒有錯。我們想要的東西不一樣。'])&&G.flags.PEISHAN_BOHAN_SPLIT,JSON.stringify(L));
  GM.npc={}; E.npcs=[];
  // 2. 翰 2
  const w7=termDay('Y2S1',7,2), bh={obj:{position:{x:1,y:0,z:0}},lv:0}; const put=()=>{ GM.npc.classmate_bohan=bh; E.npcs=[bh]; at(1.5,0.5); };
  /* AA_546 1-3（NO-COMPARE-1030，D116）：不看分數，翰 1 演過＋有點熟就邀；「我寫得很慢，可以嗎？」取代「分數不夠的人呢？」 */
  const BH1=()=>{ G.events.done.ev_bohan_score=1; meet('classmate_bohan'); R('classmate_bohan',25); };
  fresh(w7,18.5,'library',{BOHAN_SCORE:'told'}); G.stage='law'; meet('classmate_bohan'); R('classmate_bohan',25); put(); check('2. 翰 1 沒演過：不邀',!tick());
  fresh(w7,18.5,'library',{BOHAN_SCORE:'told'}); G.stage='law'; G.events.done.ev_bohan_score=1; meet('classmate_bohan'); R('classmate_bohan',8); put(); check('2. 還不到有點熟：不邀',!tick());
  fresh(w7,18.5,'library',{BOHAN_SCORE:'unsure'}); G.stage='law'; BH1(); put(); picks=['「好。」']; tick(); await wait(); L=norm(lines());
  check('2. 翰 1 演過＋有點熟（翰 1 答什麼都一樣）：三句（逐字）＋「好。」→ 每週六 B1 討論室',L[0]==='我在組一個考古題小組。每週寫一份，寫完互相看怎麼寫。'&&L[1]==='以安說不要。她說她週四有讀書會。'&&L[2]==='你要不要來？'&&L[3]==='小組每週六下午，總圖 B1 的討論室。寫完，一個人講一題。'&&!L.some(t=>/分數|算分|排名/.test(t))&&G.flags.BOHAN_GROUP==='yes'&&G.flags.BOHAN_GROUP_DAY===w7,JSON.stringify(L));
  GM.npc={}; E.npcs=[];
  const sat7=termDay('Y2S1',7,6); G.day=sat7; G.weekday=6; G.zone='dorm'; run(10,10.1); check('2. 週六出發選單 16:00 總圖 B1 討論室',!!OUT.get(G,'bohan_group_'+sat7)&&OUT.get(G,'bohan_group_'+sat7).h===16);
  for(let k=0;k<3;k++){ said=[]; await EVENTS.run(ev('ev_bohan_group_session'));
    if(k===0) check('2. 第 1 次：旁白「（四個人，一張考古題。柏翰按下手機的計時器。）」（AB65-3（AA_211 附錄 A 柏翰一列、第 3 節第 7 點）：第一次補一句旁白）',JSON.stringify(lines())===JSON.stringify(['（四個人，一張考古題。柏翰按下手機的計時器。）']),JSON.stringify(lines()));
    if(k===1) check('2. 第 2 次：沒有旁白',lines().length===0,JSON.stringify(lines())); }
  check('2. 第三次：「（寫完，柏翰把每個人的寫法抄在白板上。同一題有四種寫法，都說得通。）」（AA_546 1-3；原本「柏翰把分數寫在白板上……先找的是自己的名字」）',lines()[0]==='（寫完，柏翰把每個人的寫法抄在白板上。同一題有四種寫法，都說得通。）'&&G.flags.BOHAN_GROUP_N===3,JSON.stringify(lines()));
  fresh(w7,18.5,'library',{}); G.stage='law'; BH1(); put(); picks=['寫得很慢']; tick(); await wait(); L=norm(lines());
  check('2. 「我寫得很慢，可以嗎？」→（他愣了一下。）「……我也是。所以才組的。」；ASKED_SLOW、BOHAN_GROUP slow',L.slice(3).join('|')==='他愣了一下。|……我也是。所以才組的。'&&SOCIAL.has('classmate_bohan','ASKED_SLOW')&&!SOCIAL.has('classmate_bohan','ASKED_LOW_SCORE')&&G.flags.BOHAN_GROUP==='slow',JSON.stringify(L));
  { const dSlow=G.day, sat=termDay('Y2S1',7,6); G.day=sat; G.weekday=6; G.zone='dorm'; run(10,10.1);   /* AA_546 1-3（企劃線 84b6c298f，AA-B 10-31 回 A）：slow 算加入——週六小組照排、阿哲「沒去」那一句不演；修改前 FAIL */
    check('2. 「我寫得很慢」算加入（AA_546 1-3）：記 BOHAN_GROUP_DAY、週六 16:00 小組照排、阿哲「我去了一次」那一句（沒去的版本）不演',G.flags.BOHAN_GROUP_DAY===dSlow&&!!OUT.get(G,'bohan_group_'+sat)&&!EVENTS.check(ev('ev_bohan_group_heard')),JSON.stringify({day:G.flags.BOHAN_GROUP_DAY,dSlow,out:!!OUT.get(G,'bohan_group_'+sat)})); }
  fresh(w7,18.5,'library',{}); G.stage='law'; BH1(); put(); picks=['「不了。」']; tick(); await wait(); L=norm(lines());
  check('2. 「不了。」→「好。想來再跟我說。」；沒有劃掉名字',L.slice(-1)[0]==='好。想來再跟我說。'&&!L.some(t=>/劃掉/.test(t))&&G.flags.BOHAN_GROUP==='no',JSON.stringify(L));
  GM.npc={}; E.npcs=[];
  // 阿哲轉述
  const NDL=termDay('Y1S1',4,4);   /* 已經在麵店團（做過哲 1）：沒有的話＝錯過長桌，麵店遇到阿哲先演麵店團的補救（AA_496 第 9 節第 3 點，ev_zhe_group_late），這裡要看的是阿哲轉述那一句 */
  const zh={obj:{position:{x:1,y:0,z:0}},lv:0}; fresh(termDay('Y2S1',7,4),18,'noodle',{BOHAN_GROUP:'no',noodleTableDay:NDL}); G.stage='law'; GM.npc.zhe=zh; E.npcs=[zh]; at(1.5,0.5); tick(); await wait(); L=norm(lines());
  check('3. 沒去小組：第 7 週麵店阿哲「柏翰組了一個考古題小組。我去了一次。……他講第三題講了四十分鐘。」（AA_546 1-3；原本「菁英小組。我沒被邀。」）',L[0]==='柏翰組了一個考古題小組。我去了一次。……他講第三題講了四十分鐘。',JSON.stringify(L));
  fresh(termDay('Y2S1',7,4),18,'noodle',{BOHAN_GROUP:'yes',noodleTableDay:NDL}); G.stage='law'; GM.npc.zhe=zh; E.npcs=[zh]; at(1.5,0.5); check('3. 有去小組的不聽這句',!tick()); GM.npc={}; E.npcs=[];
  // 4. 以安新 8
  const PA=ACTIVITIES.list.find(a=>a.id==='public_law_group'), thu7=termDay('Y2S1',7,4);
  check('4. 公法讀書會大二上第 7 週週四有',ACTIVITIES.on(PA,thu7));
  fresh(thu7,20,'wancai',{CLUB_public_law_group:true,met_yu:true}); G.stage='law'; meet('heroine_01'); PHONE.join(G,'noodle_team','麵店團');
  const e=CLS.clubEvent(G,PA); check('4. 第 7 週週四讀書會：先演新 8',!!e&&e.id==='ev_plg_rules',e&&e.id);
  picks=['留三條']; said=[]; await EVENTS.run(e); L=norm(lines());
  check('4. 旁白＋Alison＋以安＋選「留三條就好。」（逐字）',L[0]==='研討室的白板旁邊貼著一張 A4：〈公法讀書會規則〉，十二條。'&&L[1]==='三週前十個人，今天三個。'&&L[3]==='（把下半張撕下來）那就留講得完的那一半。'&&L[4]==='以安想了一下，在白板寫：「一、每人十分鐘。二、離題可以，要拉回來。三、不准賴。」'&&L[6]==='一定。',JSON.stringify(L));
  run(21.5,22.1); check('4. 週四 22:00 以安在群組「週六下午補讀一次。規則三條。」＋出發選單週六 14:00',txt('g:noodle_team').includes('heroine_01:週六下午補讀一次。規則三條。')&&OUT.get(G,'plg_sat').day===termDay('Y2S1',7,6)&&OUT.get(G,'plg_sat').h===14);
  said=[]; await EVENTS.run(ev('ev_plg_rules_after')); L=norm(lines());
  check('4. 後半：人回來了、以安「……好。開始。每人十分鐘。」、Alison「這張我要裱框。」、PLG_RULES',L[0]==='人回來了。八個人。'&&L.some(t=>/好。開始。每人十分鐘。$/.test(t))&&/這張我要裱框。$/.test(L[L.length-1])&&G.flags.PLG_RULES,JSON.stringify(L));
  fresh(thu7,21,'dorm',{}); G.stage='law'; PHONE.join(G,'noodle_team','麵店團'); run(21,22.1);
  check('5. 沒加入讀書會、在麵店團：週四 22:00 Alison「我把以安的規則撕掉一半了。」以安「週六下午補讀，規則剩三條。」（聽說；AB65-3：AA_211 附錄 A 以安一列，原本「……剩下的那一半是對的。」）',txt('g:noodle_team').includes('yu:我把以安的規則撕掉一半了。')&&txt('g:noodle_team').includes('heroine_01:週六下午補讀，規則剩三條。')&&SOCIAL.has('heroine_01','HEARD_ABOUT'));
  check('5. 沒加入的沒有週六補讀的邀約',!OUT.get(G,'plg_sat'));
  fresh(termDay('Y2S1',8,4),20,'wancai',{CLUB_public_law_group:true}); G.stage='law'; check('5. 第 8 週不演新 8',!(CLS.clubEvent(G,PA)&&CLS.clubEvent(G,PA).id==='ev_plg_rules'));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
