// ★主線 5 第三個房間（1A-03，AA_315；AA_12 主線 5、AA_180 2-11）——不需要瀏覽器。
//   1. 2027-09-05（日）以後、還沒有 ROOM_Y3 才搬；經濟系不算；大三下（2028-02-21）以後才讀檔＝直接記 ROOM_Y3、不演（roomY3Late）；
//   2. 新東西只有大二經歷過的才有（R1：什麼都沒做＝只有「一疊大二的筆記」；R2：大二暑假 C08 首爾＝交通卡；每一件的條件、旁白逐字）；
//   3. 拆箱三步：「（三個紙箱。比去年少一個。）」→「（把去年的東西拿出來）」→ 新東西一件一件 → 黃金葛那句 →「（房間滿了。開始有東西要丟掉。）」→
//      丟一件（黃金葛和大一的五件不列）或「（都留著。擠一點就好。）」→ 最後一句；ROOM_Y3、ROOM_Y3_ITEMS、ROOM_Y3_DISCARD；
//   4. 人在宿舍：「（明天開學。今天搬進第三個房間。）」→ 字卡「搬到新的房間／五樓 507 號房」；在家（home3d.js）同一句＋「回宿舍」字卡；
//   5. 507 照舊擺大二的東西、丟掉的那一件不出現（zones3d.js y2State）；房號 507（dormSetKey，搬的途中也是）。
// 修改前全部 FAIL。用法：node tests/room_y3_unit.js
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
  if(!STORY.unboxY3||!STORY.roomY3Items){ console.log('FAIL 0. 沒有 STORY.unboxY3'); console.log('FAILED 1'); process.exit(1); }
  const d5=STORY.dayOfKey('2027-09-05'), late=STORY.dayOfKey('2028-02-21');
  check('0. 2027-09-05 是週日、大三上開學前一天', CALENDAR.dateOf(d5).wd===7&&CALENDAR.termOf(d5+1).id==='Y3S1'&&CALENDAR.termOf(d5+1).week===1);
  const base=(day)=>{ fresh(day,20,'dorm',{ROOM_Y2:STORY.dayOfKey('2026-09-06'),ROOM_Y2_ITEMS:['civ','noodle','pothos','y1_0','y1_1','y1_2','y1_3','y1_4'],POTHOS:true}); G.stage='law'; G.vac={reg:{}}; return G; };
  base(d5-1); check('1. 9/4 還沒到', !STORY.roomY3Due(G)); G.day=d5; check('1. 9/5 到了', STORY.roomY3Due(G)); G.stage='econ'; check('1. 經濟系那年不算', !STORY.roomY3Due(G)); G.stage='law';
  base(late+3); check('1. 大三下以後才讀檔：不演、直接記 ROOM_Y3', !STORY.roomY3Due(G)&&STORY.roomY3Late(G)&&G.flags.ROOM_Y3===late+3&&G.flags.ROOM_Y3_DISCARD===null);
  /* BUG-ROOMY3-LATE-1031（BB-B n33_y3late）：只在 9/5、9/6 演（9/6 不說「明天開學」）；9/7 以後才讀進來、還沒搬的直接記；修改前 FAIL */
  base(d5+1); check('1b. 9/6 還照演；旁白不說「明天開學」', STORY.roomY3Due(G)&&STORY.roomY3Line(G)===null&&(G.day=d5,STORY.roomY3Line(G))==='（明天開學。今天搬進第三個房間。）');
  for(const k of ['2027-10-13','2027-12-15','2028-02-15']){ const dd=STORY.dayOfKey(k); base(dd); const due0=STORY.roomY3Due(G), r=STORY.roomY3Late(G);
    check('1b. '+k+' 才讀進來、沒有 ROOM_Y3：不演、S.roomY3Late 直接記', !due0&&r===true&&G.flags.ROOM_Y3===dd&&!STORY.roomY3Due(G), JSON.stringify({due0,r,R:G.flags.ROOM_Y3})); }
  base(d5+2); G.flags.ROOM_Y3_MOVING=true; check('1b. 已經開始搬（ROOM_Y3_MOVING）：9/7 照舊算到期、roomY3Late 不動', STORY.roomY3Due(G)&&STORY.roomY3Late(G)===false&&!G.flags.ROOM_Y3); delete G.flags.ROOM_Y3_MOVING;
  // 2
  base(d5); let ks=STORY.roomY3Items(G).map(r=>r[0]); check('2. R1 大二什麼都沒做：新東西只有「一疊大二的筆記」', JSON.stringify(ks)===JSON.stringify(['notes_y2']), JSON.stringify(ks));
  base(d5); G.vac.reg['C08@Y2']='done'; G.vac.reg['C09@Y1']='done'; ks=STORY.roomY3Items(G).map(r=>r[0]); check('2. R2 大二暑假 C08 首爾：有交通卡；大一的 C09 不算', JSON.stringify(ks)===JSON.stringify(['notes_y2','vac_C08']), JSON.stringify(ks));
  base(d5); Object.assign(G.flags,{FAFU_SHIFT_N:2,SIS_M2:'curry',grad_read_done:true,EXPO_COUNTRY:'日本'}); SOCIAL.remember('heroine_04','PLAYTESTED','測'); SOCIAL.remember('zhe','LENT_NOTES_Y2','借'); SOCIAL.remember('zhe','WATCHED_GAME_Y2','看');
  G.events.done.ev_y2_welcome=1; for(const c of ['C02','C03','C08','C09','C10','C11','C12']) G.vac.reg[c+'@Y2']='done'; const L=STORY.roomY3Items(G); ks=L.map(r=>r[0]);
  check('2. 全部都經歷過：十六件（筆記、筆錄紙、研究計畫、文章、隨身碟、民法筆記、節目單、手冊、名牌、七個活動）', ks.length===16&&ks.join()==='notes_y2,fafu_form,sis_plan,article,zq_usb,zhe_notes,game_y2,expo,welcome_badge,vac_C02,vac_C03,vac_C08,vac_C09,vac_C10,vac_C11,vac_C12', ks.join());
  check('2. 旁白逐字：手冊照 EXPO_COUNTRY、隨身碟、C03 單字卡', L.find(r=>r[0]==='expo')[2][0]==='那天你坐在日本那一區。手冊在那一頁折了一個角。'&&L.find(r=>r[0]==='zq_usb')[2][0]==='子晴說測完要還。她沒來要，你也忘了還。'&&L.find(r=>r[0]==='vac_C03')[2][0]==='最後一張寫的是『大丈夫』。旁邊有你的註解：不一定是沒事。');
  base(d5); G.flags.SIS_M2='none'; check('2. 家族群組沒有回「第三件」（none）：沒有研究計畫', !STORY.roomY3Items(G).some(r=>r[0]==='sis_plan'));
  // 3
  const vis=[]; GM.E.zone={setY2Items:st=>vis.push(JSON.stringify(st))};
  base(d5); G.vac.reg['C08@Y2']='done'; G.flags.pothosWaterN=2; picks=[0,0,0,'丟掉一本只讀了三分之一的民總課本']; await STORY.unboxY3(GM); let T=lines();
  check('3. 拆箱的順序和台詞', T[0]==='（三個紙箱。比去年少一個。）'&&T[1]==='（去年拆過的東西，今年一次拿出來就好。每一件都知道自己要放哪裡。）'&&T.includes('比大一的薄。字比大一的小。')&&T.includes('裡面還有一點錢。你算過，不夠回去。')&&T.includes('黃金葛。第三個房間，第三個窗台。它又長了一點。')&&T.includes('（房間滿了。開始有東西要丟掉。）')&&T.includes('（你把它放進回收的袋子。房間多了一點空。）')&&T[T.length-1]==='（兩年。房間比去年滿，你也比去年知道哪些要留。）', JSON.stringify(T));
  const dropOpts=opts.find(o=>o.some(x=>/都留著/.test(x)))||[];
  check('3. 丟掉的選單：大二的、大三新的都可以丟；黃金葛、大一的五件不列；最後是「（都留著。擠一點就好。）」', dropOpts.includes('（丟掉一本只讀了三分之一的民總課本）')&&dropOpts.includes('（丟掉首爾地鐵的交通卡）')&&!dropOpts.some(x=>/黃金葛|舊《民法》/.test(x))&&dropOpts[dropOpts.length-1]==='（都留著。擠一點就好。）', JSON.stringify(dropOpts));
  check('3. 旗標：ROOM_Y3＝那天、ROOM_Y3_ITEMS＝新拿出來的、ROOM_Y3_DISCARD＝丟掉的', G.flags.ROOM_Y3===d5&&JSON.stringify(G.flags.ROOM_Y3_ITEMS)===JSON.stringify(['notes_y2','vac_C08'])&&G.flags.ROOM_Y3_DISCARD==='civ'&&!G.flags.ROOM_Y3_MOVING, JSON.stringify({it:G.flags.ROOM_Y3_ITEMS,d:G.flags.ROOM_Y3_DISCARD}));
  check('3. 3D：先封著、去年的一次拿出來、丟掉的那一件拿掉', vis[0]===JSON.stringify({shown:[],boxes:'closed'})&&vis.some(v=>v.includes('"civ"'))&&JSON.parse(vis[vis.length-1]).shown&&!JSON.parse(vis[vis.length-1]).shown.includes('civ'), JSON.stringify(vis));
  base(d5); picks=[0,0,'都留著']; await STORY.unboxY3(GM); T=lines(); check('3. R4 都留著：ROOM_Y3_DISCARD null、「（你把書桌上的東西往裡面推了一點。）」', G.flags.ROOM_Y3_DISCARD===null&&T.includes('（你把書桌上的東西往裡面推了一點。）'));
  base(d5); G.flags.POTHOS=true; G.flags.pothosWaterN=0; picks=[0,0,'都留著']; await STORY.unboxY3(GM); check('3. 黃金葛沒澆過：「黃金葛。第三個房間。它還是沒死。」', lines().includes('黃金葛。第三個房間。它還是沒死。'));
  // 4
  base(d5); let cards=[]; GM.titleCard=async(a,b)=>{ cards.push(a+'／'+b); }; picks=[0,0,'都留著']; await STORY.roomY3InDorm(GM);
  check('4. 人在宿舍：「（明天開學。今天搬進第三個房間。）」→ 字卡「搬到新的房間／五樓 507 號房」→ 拆箱', lines()[0]==='（明天開學。今天搬進第三個房間。）'&&cards.includes('搬到新的房間／五樓 507 號房')&&G.flags.ROOM_Y3===d5, JSON.stringify(cards));
  { const h=fs.readFileSync(path.join(ROOT,'src/home3d.js'),'utf8'); check('4. 在家：home3d.js 的 loop 接 roomY3Due → roomY3FromHome（同一句＋「回宿舍」字卡）→ unboxY3', /STORY\.roomY3Due\(G\)\)\{ roomY3=true; break; \}/.test(h)&&/if\(roomY3\) await S\.roomY3FromHome\(GM\);/.test(h)&&/S\.roomY3FromHome=async function\(GM\)\{[\s\S]{0,300}（明天開學。今天搬進第三個房間。）[\s\S]{0,1200}STORY\.unboxY3\(GM\)/.test(h)); }
  // 5
  { const z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
    check('5. 507：房號（搬的途中也是）、照舊擺大二的東西、丟掉的那一件不出現', /if\(F\.ROOM_Y3\|\|F\.ROOM_Y3_MOVING\) return '507';/.test(z)&&/const y2Room=!econ&&\['312','507'(?:,'409')?\]\.includes\(dormSetKey\(G0\)\);/.test(z)&&/\.filter\(id=>id!==F\.ROOM_Y3_DISCARD\)/.test(z)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
