// ★主線 10 第四個房間（1A-09）＋主線 11 搬出宿舍前的收拾（1A-11）（AA_318；e75ebc69 美國路線那句更正）——不需要瀏覽器。照 AA_318 第 7 節 H1～H4、B1～B3 寫：
//   1. 台灣、日本路線 2028-09-03 起、還沒有 ROOM_Y4 才搬；美國路線 12/23 返台才搬；大四下以後才讀檔＝直接記（roomY4Late）；
//   2. 大三的新東西只有經歷過的才有（志願表一定有：台灣「沒交的」、日本美國「影本」；塑膠袋＝感冒週那晚有人來；謄本＝FAMILY_LAND_Y3；鑰匙圈＝日本；
//      明信片＝芷若 POSTCARDS；製作名單＝ATTENDED_SHOW＋PLAYTESTED；田野筆記＝台灣路線＋YT_T1）；
//   3. 拆箱三步：「（這是最後一次拆箱。）」→ 前兩年的一次拿出來（H4 大三丟掉的那一件不出現）→ 新的一件一件 → 黃金葛 → 選一件留在紙箱裡（黃金葛不列）或「（全部拿出來。）」→ 收尾；
//   4. H1 台灣 9/3 在家：旁白 → 字卡「回宿舍」→「搬到新的房間／四樓 409 號房」；H2 日本多「（抽籤是姊姊幫你填的表。）」；
//   5. H3 美國：當地 12/22 06:00 以後在美國 → 飛回臺灣 → 12/23 清晨 05:40 落地、上午回家 → 傍晚兩句（「409 的床位七月就抽好了。」）→ 字卡「四樓 409 號房」→ 直接進 409 拆箱；
//   6. 409：房號（搬的途中也是）、窗景、照舊擺大二的東西、留在紙箱的那一件不拿出來、收拾好了全部收起來（zones3d.js）；
//   7. 收拾：B1 BOX_KEPT_Y4 第一件；一件一件（舊《民法》、黃金葛、民總、泡麵、志願表多一句）；B2「剩下的一起裝」；最後一定是「冬天的衣服」；B3 6/1 20:00 人在公館＝旁白 → 回宿舍。
// 修改前全部 FAIL。用法：node tests/room_y4_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/exchange3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, cards=[], entered=[], vis=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],setY2Items:st=>vis.push(JSON.parse(JSON.stringify(st)))},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push(a+'／'+(b||'')); },enter:async(z)=>{ entered.push(z); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want==null?0:want; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const Y2=['civ','noodle','pothos','y1_0','y1_1','y1_2','y1_3','y1_4'];
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,EXCH_RULE:1,EXCH_APPLIED_DAY:D('2027-11-18'),EXCHANGE_ROUTE:'TW',
    ROOM_Y2:D('2026-09-06'),ROOM_Y2_ITEMS:Y2.slice(),POTHOS:true,pothosWaterN:2,ROOM_Y3:D('2027-09-05'),ROOM_Y3_ITEMS:['notes_y2','zq_usb'],ROOM_Y3_DISCARD:'noodle',Y4_PATH:'bar',Y4_PATH_DAY:D('2028-06-08')},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},vac:{reg:{}}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cards=[]; entered=[]; vis=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
(async()=>{
  const d3=D('2028-09-03'), late=D('2029-02-19'), ret=D('2028-12-23');
  check('0. 2028-09-03 是週日、大四上開學前一天；12/23 週六', CALENDAR.dateOf(d3).wd===7&&CALENDAR.termOf(d3+1).id==='Y4S1'&&CALENDAR.termOf(d3+1).week===1&&CALENDAR.dateOf(ret).wd===6);
  // 1. 什麼時候搬
  fresh(d3-1,20,'dorm'); check('1. 9/2 還沒到', !STORY.roomY4Due(G)); G.day=d3; check('1. 台灣 9/3 到了', STORY.roomY4Due(G));
  G.flags.EXCHANGE_ROUTE='JP'; check('1. 日本 9/3 到了（8/5 已經回來）', STORY.roomY4Due(G));
  G.flags.EXCHANGE_ROUTE='US'; check('1. 美國 9/3 不搬（8/2 出發、人在美國）', !STORY.roomY4Due(G)); G.day=ret; check('1. 美國 12/23 返台才搬', STORY.roomY4Due(G));
  G.stage='econ'; check('1. 經濟系那年不算', !STORY.roomY4Due(G));
  fresh(late+3,20,'dorm'); check('1. 大四下以後才讀檔：不演、直接記 ROOM_Y4（BOX_KEPT_Y4 null）', !STORY.roomY4Due(G)&&STORY.roomY4Late(G)&&G.flags.ROOM_Y4===late+3&&G.flags.BOX_KEPT_Y4===null&&JSON.stringify(G.flags.ROOM_Y4_ITEMS)==='[]');
  // 2. 新東西
  const items=()=>STORY.roomY4Items(G).map(r=>r[0]);
  fresh(d3,9,'dorm'); let L=STORY.roomY4Items(G); check('2. 台灣路線什麼都沒做：只有志願表「那張沒交的志願表。空白的，你一直沒丟。」', JSON.stringify(items())==='["form"]'&&L[0][1]==='志願表'&&L[0][2][0]==='那張沒交的志願表。空白的，你一直沒丟。', JSON.stringify(L));
  fresh(d3,9,'dorm',{EXCHANGE_ROUTE:'JP'}); L=STORY.roomY4Items(G); check('2. 日本路線：志願表影本、日本宿舍的鑰匙圈', JSON.stringify(items())==='["form","jp_key"]'&&L[0][2][0]==='志願表的影本。系辦蓋的章，有一點歪。'&&L[1][2][0]==='鑰匙還回去了。圈圈留著。');
  fresh(d3,9,'dorm',{COLD_WEEK:'night',COLD_WEEK_PRESENT:['heroine_03'],FAMILY_LAND_Y3:'list',ATTENDED_SHOW:true,PLAYTESTED:true,YT_T1:true}); SOCIAL.remember('heroine_02','POSTCARDS','回寄'); L=STORY.roomY4Items(G);
  check('2. 台灣路線、全部經歷過：志願表、塑膠袋、謄本、明信片、製作名單、田野筆記（旁白逐字）', JSON.stringify(items())==='["form","cold","land","postcards","credits","field"]'&&L[1][2][0]==='交誼廳那晚提上樓的。你後來一直拿它裝別的東西。'&&L[2][2][0]==='十六個名字。這次你每一個都看得懂。'&&L[3][2][0]==='英國的郵戳。每一張都只寫了一兩行。'&&L[4][2][0]==='測試那一行，有你的名字。'&&L[5][2][0]==='語彤的字。有幾頁是你幫她抄的。', JSON.stringify(items()));
  G.flags.COLD_WEEK_PRESENT=[]; G.flags.PLAYTESTED=false; G.flags.EXCHANGE_ROUTE='US'; check('2. 感冒那晚沒人來＝沒有塑膠袋；沒有 PLAYTESTED＝沒有製作名單；美國路線＝沒有田野筆記', JSON.stringify(items())==='["form","land","postcards"]', JSON.stringify(items()));
  // 3. 拆箱
  fresh(d3,9,'dorm',{FAMILY_LAND_Y3:'meal'}); picks=[0,0,'全部拿出來']; await STORY.unboxY4(GM); let T=lines(); const keepOpts=opts[opts.length-1];
  check('3. H1 拆箱的順序和台詞', T[0]==='（這是最後一次拆箱。）'&&T[1]==='（這些東西，閉著眼睛也知道要放哪裡。）'&&T.includes('那張沒交的志願表。空白的，你一直沒丟。')&&T.includes('十六個名字。這次你每一個都看得懂。')&&T.includes('黃金葛。第四個窗台。它已經垂到書桌了。')&&T[T.length-1]==='（三年。這個房間，你只會住一年。）', JSON.stringify(T));
  check('3. 第三步：每一件「（把{東西}留在紙箱裡）」、黃金葛不列、最後「（全部拿出來。）」', keepOpts.includes('（把一支隨身碟，標籤「測試版　不准外流」留在紙箱裡）')&&keepOpts.includes('（把書架上的舊《民法》留在紙箱裡）')&&keepOpts.includes('（把志願表留在紙箱裡）')&&!keepOpts.some(t=>/黃金葛/.test(t))&&keepOpts[keepOpts.length-1]==='（全部拿出來。）', JSON.stringify(keepOpts));
  check('3. H4 大三丟掉的那一件（阿凱留下的泡麵）不出現（3D、選單）', !keepOpts.some(t=>/泡麵/.test(t))&&!vis.some(v=>(v.shown||[]).includes('noodle')), JSON.stringify(vis));
  check('3. 旗標：ROOM_Y4＝那天、ROOM_Y4_ITEMS＝新拿出來的、BOX_KEPT_Y4 null、ROOM_Y4_MOVING 清掉', G.flags.ROOM_Y4===d3&&JSON.stringify(G.flags.ROOM_Y4_ITEMS)==='["form","land"]'&&G.flags.BOX_KEPT_Y4===null&&!G.flags.ROOM_Y4_MOVING);
  check('3. 3D：先封著、前兩年的一次拿出來（大二那組）、拆完打開', JSON.stringify(vis[0])==='{"shown":[],"boxes":"closed"}'&&JSON.stringify(vis[1].shown)===JSON.stringify(['civ','pothos','y1_0','y1_1','y1_2','y1_3','y1_4'])&&vis.some(v=>v.boxes==='open'), JSON.stringify(vis.slice(0,3)));
  fresh(d3,9,'dorm',{pothosWaterN:0}); picks=[0,'隨身碟']; await STORY.unboxY4(GM); T=lines();
  check('3. 黃金葛沒澆過：「黃金葛。第四個房間。它還是沒死。」；留了隨身碟＝BOX_KEPT_Y4 zq_usb', T.includes('黃金葛。第四個房間。它還是沒死。')&&G.flags.BOX_KEPT_Y4==='zq_usb');
  fresh(d3,9,'dorm',{POTHOS:false}); picks=[0,'全部']; await STORY.unboxY4(GM); check('3. 沒有黃金葛：沒有那一句', !lines().some(t=>/黃金葛/.test(t)));
  // 4. 9/3 在家、在宿舍
  fresh(d3,8.5,'dorm'); G.home={at:true}; check('4. 9/3 在家：home3d.js 的選單離開家（room）', STORY.y4HomeDue(G)==='room');
  picks=[0,'全部']; await STORY.roomY4FromHome(GM); T=lines();
  check('4. H1 在家：「（明天開學。最後一次搬進宿舍。）」→ 字卡「回宿舍」「搬到新的房間／四樓 409 號房」→ 409', T[0]==='（明天開學。最後一次搬進宿舍。）'&&T[1]==='（這是最後一次拆箱。）'&&cards[0]==='回宿舍／捷運＋公車 約 40 分鐘'&&cards[1]==='搬到新的房間／四樓 409 號房'&&entered[0]==='dorm'&&!HOME.at(G)&&G.flags.ROOM_Y4===d3, JSON.stringify({T:T.slice(0,2),cards}));
  fresh(d3,8.5,'dorm',{EXCHANGE_ROUTE:'JP'}); G.home={at:true}; picks=[0,0,'全部']; await STORY.roomY4FromHome(GM); T=lines();
  check('4. H2 日本：多「（抽籤是姊姊幫你填的表。）」、有日本鑰匙圈', T[0]==='（明天開學。最後一次搬進宿舍。）'&&T[1]==='（抽籤是姊姊幫你填的表。）'&&T.includes('鑰匙還回去了。圈圈留著。'));
  fresh(d3,15,'dorm'); picks=[0,'全部']; await STORY.roomY4InDorm(GM); T=lines();
  check('4. 人在宿舍：同一句 → 字卡「搬到新的房間／四樓 409 號房」→ 拆箱', T[0]==='（明天開學。最後一次搬進宿舍。）'&&cards.includes('搬到新的房間／四樓 409 號房')&&G.flags.ROOM_Y4===d3);
  // 5. 美國返台
  const d22=ret-1; fresh(d22,5.5,'us_apartment',{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02')});
  check('5. 美國：當地 12/22 05:30 還不到', !EXCH.returnDue(G)); G.hour=6; check('5. 當地 12/22 06:00 以後、人在美國：返台到期', EXCH.returnDue(G)&&EXCH.returnAt(G)===(ret-1)*24+6);
  G.zone='dorm'; check('5. 不在美國的區域：不演', !EXCH.returnDue(G)); G.zone='us_apartment';
  picks=[0,'全部']; await EXCH.returnHome(GM); T=lines();
  check('5. H3 飛回臺灣（舊金山起飛約 14 小時）→ 12/23 清晨 05:40 落地（日期、星期；AA-C bf349b96）', cards[0]==='飛回臺灣／舊金山起飛　約 14 小時'&&cards[1]==='抵達／桃園機場　清晨 05:40'&&G.day===ret&&G.weekday===6&&G.flags.US_RETURNED===ret, JSON.stringify(cards));
  check('5. H3 兩句（e75ebc69：床位七月就抽好了，不是姊姊填的）→ 字卡「四樓 409 號房」→ 直接進 409、拆箱', T[0]==='（傍晚，你從家裡出發，回宿舍。）'&&T[1]==='（409 的床位七月就抽好了。鑰匙在舍監那裡等你。）'&&!T.some(t=>/姊姊幫你填/.test(t))&&cards[2]==='四樓 409 號房／'&&entered[0]==='dorm'&&G.flags.ROOM_Y4===ret&&T[2]==='（這是最後一次拆箱。）', JSON.stringify({T:T.slice(0,3),cards}));
  check('5. 美國路線的志願表是影本；返台以後不在國外、不再返台', T.includes('志願表的影本。系辦蓋的章，有一點歪。')&&!STORY.abroad(G)&&!EXCH.returnDue(G)&&G.hour>=19);
  { const src=fs.readFileSync(path.join(ROOT,'src/exchange3d.js'),'utf8'); check('5. EXCH.tick：出發之後也問返台', /if\(S\.returnDue\(G\)\)\{ void S\.returnHome\(GM\); return true; \}/.test(src)); }
  // 6. 409（zones3d.js）
  { const z=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8');
    check('6. 房號 409、窗景（搬的途中也是）', /if\(F\.ROOM_Y4\|\|F\.ROOM_Y4_MOVING\) return '409';/.test(z)&&/return \(F\.ROOM_Y4\|\|F\.ROOM_Y4_MOVING\)\?'dorm_room409'/.test(z));
    check('6. 409 照舊擺大二的東西（y2Room）、搬的途中和收拾好了＝紙箱封著、留在紙箱的那一件不拿出來', /const y2Room=!econ&&\['312','507','409'\]\.includes\(dormSetKey\(G0\)\);/.test(z)&&/if\(F\.ROOM_Y4_MOVING\|\|F\.PACKED_Y4\) return \{shown:\[\],boxes:'closed'\};/.test(z)&&/\.filter\(id=>id!==F\.BOX_KEPT_Y4\)/.test(z)); }
  // 7. 收拾
  const d61=D('2029-06-01'); const P=(flags)=>fresh(d61,20,'dorm',Object.assign({ROOM_Y4:d3,ROOM_Y4_ITEMS:['form','land'],BOX_KEPT_Y4:'zq_usb',FAMILY_LAND_Y3:'list'},flags||{}));
  P(); G.hour=19.9; check('7. 6/1 19:54 還不到；20:00 到了', !STORY.packDue(G)&&(G.hour=20,STORY.packDue(G))&&CALENDAR.dateOf(d61).wd===5);
  P(); G.hour=18; check('7. B3 6/1 傍晚睡著：20:00 醒來（lawWakeAt）', STORY.lawWakeAt(G)===20); G.flags.PACKED_Y4=d61; check('7. 收拾過了：不叫醒', STORY.lawWakeAt(G)==null);
  P(); picks=['剩下的一起裝']; await STORY.packY4(GM); T=lines();
  check('7. B1 第一件是留在紙箱的隨身碟：「這一件，你一年都沒有拿出來。」→ 放回去', T[0]==='（明天畢業典禮。房間裡的東西，要一件一件裝回紙箱。）'&&T[1]==='（你從紙箱裡拿出一支隨身碟，標籤「測試版　不准外流」。）'&&T[2]==='（這一件，你一年都沒有拿出來。）'&&T[3]==='（你把它放回去。這次，連箱子一起帶走。）', JSON.stringify(T.slice(0,4)));
  check('7. B2「剩下的一起裝」→「（剩下的東西，你一起放進最後兩個箱子。）」→ 最後一定是「冬天的衣服」三句', T.includes('（剩下的東西，你一起放進最後兩個箱子。）')&&JSON.stringify(T.slice(-3))===JSON.stringify(['（床底下最後一個紙箱。上面是媽媽的字：「冬天的衣服」。）','（大一搬進來那天，媽媽寫的。四年了，你一直沒把那幾個字撕掉。）','（四年。房間又空了。可是這次空，是因為要走了。）'])&&G.flags.PACKED_Y4===d61);
  check('7. 選單：每一件「（拿起{東西}）」＋「（剩下的一起裝）」；丟掉的泡麵、留在紙箱的隨身碟不在裡面', opts[0].includes('（拿起書架上的舊《民法》）')&&opts[0].includes('（拿起一盆黃金葛）')&&opts[0].includes('（拿起志願表）')&&opts[0][opts[0].length-1]==='（剩下的一起裝）'&&!opts[0].some(t=>/泡麵|隨身碟/.test(t)), JSON.stringify(opts[0]));
  check('7. 3D：收完紙箱封起來', JSON.stringify(vis[vis.length-1])==='{"shown":[],"boxes":"closed"}');
  P({BOX_KEPT_Y4:null,ROOM_Y3_DISCARD:null}); picks=['舊《民法》','黃金葛','民總','泡麵','志願表','謄本影本','剩下的一起裝']; await STORY.packY4(GM); T=lines();
  check('7. 沒有留紙箱的：沒有那一段', !T.some(t=>/一年都沒有拿出來/.test(t)));
  check('7. 舊《民法》：「（書架上的舊《民法》。你把它放進紙箱。）」「四年前看不懂的那幾頁，現在你知道它們在講什麼。」', T.join('|').includes('（書架上的舊《民法》。你把它放進紙箱。）|四年前看不懂的那幾頁，現在你知道它們在講什麼。'));
  check('7. 黃金葛只說「黃金葛不能裝箱。你把它抱在手上。」（不說放進紙箱）', T.includes('黃金葛不能裝箱。你把它抱在手上。')&&!T.includes('（一盆黃金葛。你把它放進紙箱。）'));
  check('7. 民總「你後來把它讀完了。」、泡麵「過期了。你還是沒吃。」、志願表（台灣）「空白的那一張。」', T.join('|').includes('（一本只讀了三分之一的民總課本。你把它放進紙箱。）|你後來把它讀完了。')&&T.join('|').includes('（阿凱留下的一包泡麵。你把它放進紙箱。）|過期了。你還是沒吃。')&&T.join('|').includes('（志願表。你把它放進紙箱。）|空白的那一張。'));
  { const i=T.indexOf('（大伯那塊地的謄本影本。你把它放進紙箱。）'); check('7. 其他的東西只有一句（比拆箱短）', i>0&&T[i+1]==='（剩下的東西，你一起放進最後兩個箱子。）', JSON.stringify(T.slice(i,i+2))); }
  P({EXCHANGE_ROUTE:'JP'}); picks=['志願表','剩下的一起裝']; await STORY.packY4(GM); check('7. 志願表（日本、美國）：「蓋了章的那一張。」', lines().includes('蓋了章的那一張。'));
  P(); G.zone='gongguan'; picks=['剩下的一起裝']; await STORY.packY4(GM); T=lines();
  check('7. B3 6/1 20:00 人在公館：「（明天畢業典禮。你回宿舍收東西。）」→ 字卡「回宿舍」→ 房間 → 收拾', T[0]==='（明天畢業典禮。你回宿舍收東西。）'&&cards[0]==='回宿舍／'&&entered[0]==='dorm'&&T[1]==='（明天畢業典禮。房間裡的東西，要一件一件裝回紙箱。）', JSON.stringify({T:T.slice(0,2),cards}));
  P(); G.home={at:true}; check('7. 6/1 20:00 在家：home3d.js 的選單離開家（pack）', STORY.y4HomeDue(G)==='pack');
  picks=['剩下的一起裝']; await STORY.y4FromHome(GM,'pack'); check('7. 在家：字卡「回宿舍／捷運＋公車 約 40 分鐘」、不在家了', cards[0]==='回宿舍／捷運＋公車 約 40 分鐘'&&!HOME.at(G)&&entered[0]==='dorm');
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
