// 溫州街其他四家店（AA_364：d7708ebe 第 1～4 節＋d56da150 第 5 節＋5ae04087 第 5 節第 5 點，WZ-SHOP-AA364-SYS；LAWWW 的第 4 節 #2、#3）——不需要瀏覽器。
//   林家乾麵（wz_lin）、巷子裡定食（wz_teishoku）內用；巷口茶飲、夏日冰菓室是溫州街 B5 騎樓的外帶窗口（src/wzshops3d.js 的 WZS.AA364／order364）。
//   A. 菜單、價錢照第 2 節＋第 5 節第 2 點（林家多貢丸湯 30）；店員句、「五月見」照第 3 節；第 5 節第 3、4 點：林家熟客句照上次點的、老樣子的回答、第一次的旁白、吃完的旁白
//      （compact：說話的人是「老闆」「店員」「老闆娘」，不叫名字）
//   B. 四家都點得到：選單（品項＋價錢；味噌湯續一碗不是單點的東西，AA_364 第 5 節第 5 點）、扣錢、時間；點完「（你點了{品名}。）」（四家都用，第 5 節第 1 點）→ 第一次的旁白（只有第一次）→ 吃完的旁白；
//      內用坐到最近的空位、吃完站起來；外帶不坐；不用了／錢不夠不扣
//   C. 店員：第 1～4 次＝「第一次」那一欄；第 5 次起每次都換成熟客那一句（林家照上次點的）、選單多「老樣子」、選了店員回第 5 節那一句；
//      冰菓室上次點芒果冰、現在不是 6～8 月＝選單沒有「老樣子」；冰菓室 6～8 月／其他月份兩句；台詞登記到 eat3d.js（EAT.addShop），EAT_LINES 不手改
//   D. 營業時間（src/data/places.js）：林家週一休、一天兩段；定食週二休、20:30 以後進不去（溫州街的店門擋）、人在店裡也點不到；茶飲每天 10～22；
//      關門的說明（一天兩段）；跳過時間在「現在這一段」關門前停；颱風假四家都不開
//   E. 冰菓室：10 月窗口換成「看」＝（鐵捲門拉著。上面貼了一張紙：「五月見」。）；6 月有芒果冰；5 月、9 月沒有；4/30 關、5/1 開
//   F. 店員站的位置（story3d.js 的 populate）：兩家店裡照配置的 clerk；溫州街窗口開門時才有人（冰菓室 10 月沒有）
//   G. 一起吃（AA_329）：內用照問、結尾在店門口分開、吃完（一個人）的旁白不說；外帶不問。H. 吃過的（手機筆記，四家）。
//   I. 白名單 AA_364@5ae04087（歷史 d56da150、d7708ebe）；明軒「小碗乾麵＋貢丸湯 70」不改、和菜單對得上
//   J.（另一個 Node 行程，--zones）溫州街、兩家店的真正區域：按鈕在對的位置、站得住、從主巷／門口走得到、站在那裡最近的是它；騎樓的「看手搖飲菜單」拿掉
// 修改前：開發分支 11707a19 沒有 WZS.AA364（第 A 項就失敗）；85127021（a3d3845e，第 5 節以前）林家沒有貢丸湯、熟客句不照上次點的、沒有老樣子回答／第一次／吃完的旁白、
//   白名單版本不同——A、B、C、G、I 有 FAIL。用法：node tests/wz_aa364_shops_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x);

if(process.argv.includes('--zones')){
  /* ===== J：區域（three.js、導航格；照 tests/wz_shops2_unit.js 的載法）===== */
  global.window=global; global.self=global;
  const ctx2d=new Proxy({}, {get:(o,k)=>k==='createRadialGradient'||k==='createLinearGradient'||k==='createPattern'?()=>({addColorStop(){}}):(k==='getImageData'?()=>({data:new Uint8ClampedArray(16)}):(k==='measureText'?()=>({width:10}):(()=>{})))});
  global.document={ createElementNS:()=>({getContext:()=>ctx2d,style:{}}), createElement:()=>({width:1,height:1,getContext:()=>ctx2d,style:{}}), getElementById:()=>null, addEventListener(){} };
  global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.innerWidth=844; global.innerHeight=390; global.location={search:''};
  const files=['lib/three.bundle.js','lib/three.jsm.bundle.js','src/people3d.js','src/assets3d.js','src/world3d.js','src/engine3d.js','src/townkit3d.js','src/campuskit3d.js','src/zones3d.js','src/data/dorm_room_layout.js',
    'src/data/linze_layout.js','src/data/classroom_layout.js','src/building3d.js','src/data/wancai_layout.js','src/wancai3d.js','src/data/library_layout.js','src/library3d.js','src/data/lawlib_layout.js','src/lawlib3d.js','src/data/socsci_layout.js','src/data/soclib_layout.js','src/soclib3d.js',
    'src/data/wz_park_layout.js','src/data/wz_shops_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/wzshops3d.js'];
  for(const f of files){ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(THREE|THREE_JSM|P3|ASSETS|W3|E3|TK|CK|Z3|B3|WC3|LB3|LL3|SL3|LINZE_LAYOUT|CLASSROOM_LAYOUT|WANCAI_LAYOUT|LIBRARY_LAYOUT|LAWLIB_LAYOUT|SOCLIB_LAYOUT|SOCSCI_LAYOUT|WZ_PARK_LAYOUT|WZ_SHOPS_LAYOUT|CALENDAR|PLACES|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|COURSES|CLS|PROPS|CHAR|WZS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); }
  ASSETS.loadOne=()=>new Promise(()=>{});   /* 正式模型不載入（按鈕、導航不靠模型）*/
  const E=E3; E.scene=new THREE.Scene(); E.q={level:'medium'};
  const loadZone=id=>{ E.interactables=[]; E.colliders=[]; E.lampGlows=[]; E.seats=[]; E.npcs=[]; E.spawnHint=null; const z=Z3.ZONES[id].build(E); E.zone=z; E.levels=z.levels||null; E.nav=z.nav; if(E.levels) for(const n of E.levels) n._cm=null; E.player={obj:{position:new THREE.Vector3(),rotation:{y:0}},radius:0.32,lv:0}; return z; };
  const walk=(a,b)=>E.simWalk(a[0],a[1],b[0],b[1],{lv0:0,lv1:0,dt:0.1,speed:4.1});
  /* 按鈕真的出現：範圍內有一點站得住、從 from 走得到，而且站在那裡最近的互動點（沒藏起來的）是它（和 tests/wz_shops_unit.js 2b 一樣）*/
  const shows=(i,from)=>{ const R=i.radius-0.05; for(let dx=-R;dx<=R+1e-9;dx+=0.1) for(let dz=-R;dz<=R+1e-9;dz+=0.1){ if(dx*dx+dz*dz>R*R) continue; const x=i.x+dx, zz=i.z+dz; if(!E.canStand(x,zz,0.32,0)) continue;
      let best=null, bd=1e9; for(const q of E.interactables){ if(q.hidden) continue; const d=Math.hypot(q.x-x,q.z-zz); if(d<=q.radius&&d<bd){ bd=d; best=q; } } if(best===i&&(Math.hypot(x-from[0],zz-from[1])<0.05||walk(from,[x,zz]).ok)) return true; } return false; };
  const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
  check('J. 有 WZS.windowItems、WZS.WINDOW（src/wzshops3d.js 載得進來）',typeof WZS!=='undefined'&&typeof WZS.windowItems==='function'&&!!WZS.WINDOW);
  if(fails){ console.log('（J 區域那一段：FAILED '+fails+'）'); process.exit(1); }
  const lane=[20,-4.3];   /* 主巷靠 B5 那一側的人行道 */
  for(const [ds,mon] of [['2026-07-14','7 月'],['2025-10-15','10 月']]){ global.GAME={G:{day:dayOf(ds),hour:15}};
    loadZone('wenzhou'); const it=lb=>E.interactables.find(i=>i.label===lb);
    const tea=it('買一杯飲料'), ice=it('買一碗冰'), sh=it('看夏日冰菓室'), W=WZS.WINDOW;
    check('J. 溫州街（'+mon+'）：三個窗口按鈕在 LAWWW2 給的座標（茶飲 (17.4,−7.35)、冰菓室 (24.4,−7.4)、鐵捲門 (26.5,−7.4)）；點餐的帶 wzShop／kind，「看」是 look（五月見）',!!tea&&!!ice&&!!sh&&tea.x===17.4&&tea.z===-7.35&&ice.x===24.4&&ice.z===-7.4&&sh.x===26.5&&sh.z===-7.4&&tea.wzShop==='tea'&&tea.kind==='window'&&ice.wzShop==='ice'&&ice.kind==='window'&&sh.look==='（鐵捲門拉著。上面貼了一張紙：「五月見」。）'&&!sh.wzShop&&W.tea.x===17.4&&W.ice.shutter.x===26.5);
    const summer=mon==='7 月';
    check('J. 溫州街（'+mon+'）：'+(summer?'「買一碗冰」出現、「看夏日冰菓室」藏起來':'「買一碗冰」藏起來、「看夏日冰菓室」出現')+'；「買一杯飲料」一直在',!!tea&&!tea.hidden&&!!ice&&!!sh&&(summer?(!ice.hidden&&sh.hidden):(ice.hidden&&!sh.hidden)));
    for(const b of [tea,summer?ice:sh]) if(b) check('J. 溫州街（'+mon+'）：「'+b.label+'」站得住、從主巷走得到、站在那裡最近的是它',E.canStand(b.x,b.z,0.32,0)&&shows(b,lane),'('+b.x+','+b.z+')');
    check('J. 溫州街（'+mon+'）：騎樓中間的「看手搖飲菜單」拿掉（菜單寫「綠茶 30」，AA_364 是「青茶 30」）',!it('看手搖飲菜單'));
    const W2=WZS.WINDOW; check('J. 溫州街：窗口的店員站在店裡（導航格不能站）',!E.canStand(W2.tea.clerk.x,W2.tea.clerk.z,0.1,0)&&!E.canStand(W2.ice.clerk.x,W2.ice.clerk.z,0.1,0)); }
  delete global.GAME;
  for(const [k,want] of [['lin',[['order','點餐'],['menu','看菜單']]],['teishoku',[['cashier','點餐'],['menu','看木札菜單']]]]){ const L=WZ_SHOPS_LAYOUT[k], z=loadZone('wz_'+k); if(E.fitSeatRadius) E.fitSeatRadius(); const sp=[z.spawn.x,z.spawn.z];
    const mi=E.interactables.filter(i=>i.wzShop===k); const got=mi.map(i=>i.kind+':'+i.label).join(',');
    check('J. '+L.name+'：店裡的按鈕「'+want.map(w=>w[1]).join('」「')+'」（配置的互動點 '+want.map(w=>w[0]).join('、')+'，wzShop＝'+k+'）',got===want.map(w=>w[0]+':'+w[1]).join(','),got);
    const bad=mi.filter(i=>!shows(i,sp)).map(i=>i.label); check('J. '+L.name+'：按鈕從門口走得到、站在那裡最近的是它（不被座位、出口蓋過）',mi.length===want.length&&!bad.length,bad.join('、')); }
  { delete global.WZS; loadZone('wenzhou'); check('J. 沒有 WZS 的舊測試環境：「看手搖飲菜單」照舊、沒有窗口按鈕',E.interactables.some(i=>i.label==='看手搖飲菜單')&&!E.interactables.some(i=>i.label==='買一杯飲料')); }
  console.log('（J 區域那一段：'+(fails?'FAILED '+fails:'都過了')+'）'); process.exit(fails?1:0);
}

/* ===== A～I：點餐、店員、營業時間（照 tests/eat_unit.js 的載法）===== */
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA|L118|LANE118_SHOPS|LANE118_LAYOUT|WZS|EAT|EAT_LINES|WZ_SHOPS_LAYOUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/lane118.js','src/data/wz_shops_layout.js','src/wzshops3d.js','src/data/eat_lines.js','src/eat3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},narrate(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, toasts=[], sat=[], stood=0, sayWhileSeated=[];
const E={q:{level:'medium'},player:{busy:false,obj:mkObj(),lv:0,seat:null},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,addNPC(n){ this.npcs.push(n); return n; }};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),
  sitAt(e,st){ e.seat=st; e.pose='sit'; sat.push(st); },standUp(e){ e.seat=null; e.pose='idle'; stood++; },freeSeat:st=>st.taken?null:st,
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); if(E.player.seat) sayWhileSeated.push(t); },
  choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text)===want); return k<0?o.length-1:k; } return want==null?o.length-1:want; }};
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const fresh=(key,hour,zone,flags)=>{ const day=typeof key==='number'?key:D(key); G={v:3,stage:'law',day,hour,zone:zone||'wenzhou',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},invites:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; toasts=[]; sat=[]; stood=0; sayWhileSeated=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.seat=null; E.zone.seats=[]; global.GAME={G}; return G; };
/* 店裡的座位（照配置；客人站在點餐的位置）*/
const inShop=k=>{ const L=WZ_SHOPS_LAYOUT[k]; E.zone.seats=L.seats.map(s=>({x:s.x,z:s.z,yaw:s.yaw,table:s.table,kind:'shop'})); const q=L.interact.find(i=>i.kind!=='menu'); E.player.obj.position.x=q.x; E.player.obj.position.z=q.z; };
const order=async(k,pick)=>{ said=[]; opts=[]; toasts=[]; sat=[]; stood=0; sayWhileSeated=[]; picks=[pick]; const kind={lin:'order',teishoku:'cashier',tea:'window',ice:'window'}[k]; await WZS.interact(GM,{wzShop:k,kind}); };
const near=(a,b)=>Math.abs(a-b)<1e-6;
const has=t=>said.some(s=>s.t===t);
const OL=n=>LANE118_SHOPS.orderLine.replace('{品名}',n);
(async()=>{
  // ---------- A. 資料 ----------
  check('A. 有 WZS.AA364（林家乾麵、巷子裡定食、巷口茶飲、夏日冰菓室）、WZS.order364',typeof WZS!=='undefined'&&!!WZS.AA364&&['lin','teishoku','tea','ice'].every(k=>!!WZS.AA364[k])&&typeof WZS.order364==='function');
  if(fails){ console.log('FAILED '+fails); process.exit(1); }
  const A=WZS.AA364, K4=['lin','teishoku','tea','ice'], menu=k=>J(A[k].menu.map(m=>[m[0],m[1]]));
  check('A. 林家菜單（第 5 節第 2 點加貢丸湯）：乾麵（小）40／乾麵（大）55／餛飩湯 40／貢丸湯 30／燙青菜 35／滷蛋 15',menu('lin')===J([['乾麵（小）',40],['乾麵（大）',55],['餛飩湯',40],['貢丸湯',30],['燙青菜',35],['滷蛋',15]]),menu('lin'));
  check('A. 定食 薑汁燒肉定食 180／鹽烤鯖魚定食 190／炸雞定食 170（味噌湯續一碗不是單點的東西：點餐選單沒有，第 5 節第 5 點）',menu('teishoku')===J([['薑汁燒肉定食',180],['鹽烤鯖魚定食',190],['炸雞定食',170]]),menu('teishoku'));
  check('A. 茶飲 紅茶 30／青茶 30／珍珠奶茶 55／冬瓜檸檬 45；冰菓室 芒果冰 140（6～8 月）／紅豆牛奶冰 70／綜合剉冰 60',menu('tea')===J([['紅茶',30],['青茶',30],['珍珠奶茶',55],['冬瓜檸檬',45]])&&menu('ice')===J([['芒果冰',140],['紅豆牛奶冰',70],['綜合剉冰',60]]),menu('tea')+' '+menu('ice'));
  check('A. 牆上的菜單（看菜單）：林家照第 5 節第 2 點（有貢丸湯 30）、定食照第 2 節那一格',A.lin.wall==='乾麵（小）40／乾麵（大）55／餛飩湯 40／貢丸湯 30／燙青菜 35／滷蛋 15'&&A.teishoku.wall==='薑汁燒肉定食 180／鹽烤鯖魚定食 190／炸雞定食 170／味噌湯續一碗 免費',A.lin.wall);
  const kn=(k,last)=>typeof A[k].known==='function'?A[k].known(null,last):A[k].known;
  check('A. 店員照第 3 節（不叫名字）：老闆「內用外帶？」、店員「幾位？這邊坐。」／「今天的魚很好喔。」、店員「甜度冰塊？」／「半糖少冰？」、老闆娘「冰要大碗小碗？」',
    A.lin.who==='老闆'&&A.lin.first==='內用外帶？'&&A.teishoku.who==='店員'&&A.teishoku.first==='幾位？這邊坐。'&&A.teishoku.known==='今天的魚很好喔。'&&A.tea.who==='店員'&&A.tea.first==='甜度冰塊？'&&A.tea.known==='半糖少冰？'&&A.ice.who==='老闆娘'&&A.ice.first==='冰要大碗小碗？');
  check('A. 林家熟客那一句照上次點的（第 5 節第 3 點）：乾麵（小）「小的，不加辣。對吧。」、乾麵（大）「大的，不加辣。對吧。」、不是乾麵「一樣的？」',J([kn('lin','乾麵（小）'),kn('lin','乾麵（大）'),kn('lin','貢丸湯'),kn('lin','滷蛋'),kn('lin',null)])===J(['小的，不加辣。對吧。','大的，不加辣。對吧。','一樣的？','一樣的？','一樣的？']),J([kn('lin','乾麵（小）'),kn('lin','乾麵（大）'),kn('lin','貢丸湯')]));
  check('A. 選「老樣子」的回答（第 5 節第 4 點）：老闆「好。一樣。」、店員「好，一樣的定食。」、店員「好，一樣的。」、老闆娘「好。一樣的。」',J(K4.map(k=>A[k].same))===J(['好。一樣。','好，一樣的定食。','好，一樣的。','好。一樣的。']),J(K4.map(k=>A[k].same)));
  check('A. 第一次的旁白（第 5 節第 4 點）',J(K4.map(k=>A[k].firstLine))===J(['（攤子前面只有三張小桌子。老闆煮麵的時候，沒有抬頭。）','（店裡只有八個位子。牆上貼著：「味噌湯免費續，但不要浪費。」）','（窗口的菜單只有四樣。你點完，後面已經排了兩個人。）','（價目表是手寫的。芒果冰那一行旁邊，用紅筆寫著「六到八月」。）']),J(K4.map(k=>A[k].firstLine)));
  check('A. 吃完（一個人）的旁白（第 5 節第 4 點）',J(K4.map(k=>A[k].done))===J(['（你吃完的時候，老闆已經在煮下一碗了。）','（你續了一碗味噌湯。比第一碗還燙。）','（你拿著飲料，沿著溫州街走回去。）','（冰化得比你吃得快。最後幾口，你是用喝的。）']),J(K4.map(k=>A[k].done)));
  check('A. 冰菓室 10～4 月「看」的旁白：（鐵捲門拉著。上面貼了一張紙：「五月見」。）',A.ice.shutter==='（鐵捲門拉著。上面貼了一張紙：「五月見」。）');
  const T=x=>J(said.map(s=>s.t))===J(x);
  // ---------- B. 點餐 ----------
  fresh('2025-10-15',12,'wz_lin'); inShop('lin'); const m0=G.money, h0=G.hour; await order('lin',0);
  check('B. 林家（週三 12:00）：老闆招呼「內用外帶？」→ 選單六樣（有貢丸湯 30）＋「不用了」',said[0]&&said[0].who==='老闆'&&said[0].t==='內用外帶？'&&J(opts[0])===J(['乾麵（小）　40 元','乾麵（大）　55 元','餛飩湯　40 元','貢丸湯　30 元','燙青菜　35 元','滷蛋　15 元','不用了']),J(opts));
  check('B. 林家第一次：乾麵（小）扣 40、吃 40 分鐘；「（你點了乾麵（小）。）」→ 第一次的旁白 → 吃完的旁白（照這個順序，只有這幾句）',G.money===m0-40&&near(G.hour-h0,40/60)&&T(['內用外帶？',OL('乾麵（小）'),A.lin.firstLine,A.lin.done]),J(said)+' money '+(m0-G.money));
  check('B. 林家（內用）：點完坐到最近的空位、那三句在坐著的時候、吃完站起來',sat.length===1&&WZ_SHOPS_LAYOUT.lin.seats.some(s=>s.x===sat[0].x&&s.z===sat[0].z)&&[OL('乾麵（小）'),A.lin.firstLine,A.lin.done].every(t=>sayWhileSeated.includes(t))&&stood===1&&!E.player.seat,J({sat,stood,sayWhileSeated}));
  G.hour=12.8; await order('lin',3);
  check('B. 林家第二次：貢丸湯扣 30；第一次的旁白不再說、吃完的旁白照說',G.money===m0-70&&T(['內用外帶？',OL('貢丸湯'),A.lin.done]),J(said));
  fresh('2025-10-15',18,'wz_teishoku'); inShop('teishoku'); const m1=G.money; await order('teishoku',1);
  check('B. 定食（週三 18:00）：店員「幾位？這邊坐。」→ 選單三樣（沒有「味噌湯續一碗」）；鹽烤鯖魚定食扣 190、坐下吃；點餐那句 → 第一次的旁白 → 吃完的旁白',said[0]&&said[0].who==='店員'&&J(opts[0])===J(['薑汁燒肉定食　180 元','鹽烤鯖魚定食　190 元','炸雞定食　170 元','不用了'])&&G.money===m1-190&&T(['幾位？這邊坐。',OL('鹽烤鯖魚定食'),A.teishoku.firstLine,A.teishoku.done])&&sat.length===1&&stood===1,J(said));
  { const m2=G.money; G.hour=18.8; await order('teishoku',2); check('B. 定食第二次：炸雞定食扣 170；第一次的旁白不再說、吃完那句（續一碗味噌湯）照說',G.money===m2-170&&T(['幾位？這邊坐。',OL('炸雞定食'),A.teishoku.done])&&!toasts.includes('錢不夠'),J(said)); }
  fresh('2025-10-15',15,'wenzhou'); const m3=G.money, h3=G.hour; await order('tea',2);
  check('B. 茶飲（外帶）：店員「甜度冰塊？」→ 紅茶 30／青茶 30／珍珠奶茶 55／冬瓜檸檬 45；珍珠奶茶扣 55、5 分鐘、不坐下；點餐那句（外帶也用，第 5 節第 1 點）→ 第一次 → 吃完的旁白',said[0]&&said[0].who==='店員'&&J(opts[0])===J(['紅茶　30 元','青茶　30 元','珍珠奶茶　55 元','冬瓜檸檬　45 元','不用了'])&&G.money===m3-55&&near(G.hour-h3,5/60)&&T(['甜度冰塊？',OL('珍珠奶茶'),A.tea.firstLine,A.tea.done])&&!sat.length,J(said));
  fresh('2026-07-14',15,'wenzhou'); const m4=G.money, h4=G.hour; await order('ice',0);
  check('B. 冰菓室（7 月週二，外帶）：老闆娘「冰要大碗小碗？」→ 芒果冰 140／紅豆牛奶冰 70／綜合剉冰 60；芒果冰扣 140、10 分鐘、不坐下；點餐那句 → 第一次 → 吃完的旁白',said[0]&&said[0].who==='老闆娘'&&J(opts[0])===J(['芒果冰　140 元','紅豆牛奶冰　70 元','綜合剉冰　60 元','不用了'])&&G.money===m4-140&&near(G.hour-h4,10/60)&&T(['冰要大碗小碗？',OL('芒果冰'),A.ice.firstLine,A.ice.done])&&!sat.length,J(said));
  { fresh('2025-10-15',15,'wenzhou'); const m=G.money, h=G.hour; await order('tea',null); const a=G.money===m&&G.hour===h&&T(['甜度冰塊？'])&&!(G.eat&&G.eat.first&&G.eat.first['巷口茶飲']!=null);
    fresh('2025-10-15',12,'wz_teishoku'); inShop('teishoku'); G.money=100; await order('teishoku',0);
    check('B. 「不用了」不扣錢、不花時間、不算第一次；錢不夠（100 元）：定食灰掉、選了也不扣（「錢不夠」）',a&&G.money===100&&toasts.includes('錢不夠')&&opts[0].length===4&&!sat.length,J(opts)); }
  { const src=fs.readFileSync(path.join(ROOT,'src/wzshops3d.js'),'utf8'); check('B. 不扣時段次數（AA_160 2-3：wzshops3d.js 不碰時段）',!/slotUse|slotPlan/.test(src)); }
  // ---------- C. 店員認得你、老樣子 ----------
  { fresh('2025-10-15',12,'wz_lin'); inShop('lin'); const g=[]; for(let i=0;i<4;i++){ G.hour=12; await order('lin',i); g.push(said[0]&&said[0].t); }
    check('C. 林家第 1～4 次：每次都是「內用外帶？」（「第一次」那一欄＝一般的招呼）、選單沒有「老樣子」',g.every(t=>t==='內用外帶？')&&!opts.some(o=>o.includes('老樣子')),J(g));
    G.hour=12; const m=G.money; await order('lin','老樣子');
    check('C. 林家第 5 次（上一次點貢丸湯，不是乾麵）：老闆「一樣的？」；選單多「老樣子」（在品項後面、「不用了」前面）',said[0]&&said[0].who==='老闆'&&said[0].t==='一樣的？'&&opts[0][6]==='老樣子'&&opts[0][7]==='不用了',J(said)+J(opts));
    check('C. 選「老樣子」＝上一次點的（貢丸湯 30）、扣 30；老闆回「好。一樣。」→ 點餐那句 → 吃完的旁白（第 5 次另外那一句不說）',G.money===m-30&&said[1]&&said[1].who==='老闆'&&T(['一樣的？','好。一樣。',OL('貢丸湯'),A.lin.done])&&G.eat.n['林家乾麵']===5,J(said)+' '+(m-G.money));
    G.hour=17.5; await order('lin',0); const s6=said[0]&&said[0].t; G.hour=17.5; await order('lin',1); const s7=said[0]&&said[0].t; G.hour=18.5; await order('lin',null); const s8=said[0]&&said[0].t;
    check('C. 林家第 6 次以後每次都說熟客那一句、照上一次點的換（貢丸湯→「一樣的？」、乾麵（小）→「小的，不加辣。對吧。」、乾麵（大）→「大的，不加辣。對吧。」）',J([s6,s7,s8])===J(['一樣的？','小的，不加辣。對吧。','大的，不加辣。對吧。']),J([s6,s7,s8])); }
  { fresh('2025-10-15',12,'wz_teishoku'); inShop('teishoku'); G.eat={n:{'巷子裡定食':4},last:{'巷子裡定食':'炸雞定食'},first:{'巷子裡定食':1}}; await order('teishoku','老樣子');
    const a=J(said.map(s=>[s.who,s.t]))===J([['店員','今天的魚很好喔。'],['店員','好，一樣的定食。'],[null,OL('炸雞定食')],[null,A.teishoku.done]]), sa=J(said);
    fresh('2025-10-15',15,'wenzhou'); G.eat={n:{'巷口茶飲':3},first:{'巷口茶飲':1}}; await order('tea',0); const b=said[0]&&said[0].t==='甜度冰塊？';
    fresh('2025-10-15',15,'wenzhou'); G.eat={n:{'巷口茶飲':4},last:{'巷口茶飲':'青茶'},first:{'巷口茶飲':1}}; await order('tea','老樣子'); const c=J(said.map(s=>[s.who,s.t]))===J([['店員','半糖少冰？'],['店員','好，一樣的。'],[null,OL('青茶')],[null,A.tea.done]]);
    check('C. 定食第 5 次「今天的魚很好喔。」、老樣子（炸雞定食）店員回「好，一樣的定食。」；茶飲第 4 次照舊「甜度冰塊？」、第 5 次「半糖少冰？」、老樣子（青茶）店員回「好，一樣的。」',a&&b&&c,sa+' / '+J(said)); }
  { const ice=async ds=>{ fresh(ds,15,'wenzhou'); G.eat={n:{'夏日冰菓室':4},last:{'夏日冰菓室':'綜合剉冰'},first:{'夏日冰菓室':1}}; await order('ice',null); return said[0]&&said[0].t; };
    const r=[await ice('2026-06-09'),await ice('2026-07-14'),await ice('2026-08-11'),await ice('2026-05-12'),await ice('2026-09-15')];
    check('C. 冰菓室第 5 次：6～8 月老闆娘「又來了啊。今天芒果很甜。」；5 月、9 月「又來了啊。」',J(r)===J(['又來了啊。今天芒果很甜。','又來了啊。今天芒果很甜。','又來了啊。今天芒果很甜。','又來了啊。','又來了啊。']),J(r)); }
  { const mango=async ds=>{ fresh(ds,15,'wenzhou'); G.eat={n:{'夏日冰菓室':4},last:{'夏日冰菓室':'芒果冰'},first:{'夏日冰菓室':1}}; await order('ice','老樣子'); return {menu:opts[0]||[],said:said.map(s=>[s.who,s.t]),spent:5000-G.money}; };
    const jul=await mango('2026-07-14'), sep=await mango('2026-09-15'), may=await mango('2026-05-12');
    check('C. 冰菓室上次點芒果冰：7 月有「老樣子」（扣 140、老闆娘回「好。一樣的。」）；9 月、5 月（不是 6～8 月）選單不出現「老樣子」（第 5 節第 4 點：買不到的不列）',jul.menu.includes('老樣子')&&J(jul.said.slice(0,2))===J([['老闆娘','又來了啊。今天芒果很甜。'],['老闆娘','好。一樣的。']])&&jul.spent===140&&J(sep.menu)===J(['紅豆牛奶冰　70 元','綜合剉冰　60 元','不用了'])&&J(may.menu)===J(sep.menu)&&sep.spent===0,J({jul,sep:sep.menu})); }
  { const eatSrc=fs.readFileSync(path.join(ROOT,'src/eat3d.js'),'utf8');
    check('C. EAT_LINES（AA_329、AA_336 匯入的檔）沒有手改：四家不在 EAT_LINES.staff／first；四家用 EAT.addShop 登記（WZS.eatReg）：staffOn＝第 5 節的老樣子回答、第 5 次那一句 null；第一次的旁白、吃過的店名「溫州街・…」；eat3d.js 裡沒有 AA_364 的店名、台詞',
      K4.every(k=>{ const n=A[k].key, st=EAT.staffOn(GM,n), X=EAT.SHOPS_X&&EAT.SHOPS_X[n]; return !EAT_LINES.staff[n]&&!EAT_LINES.first['溫州街・'+n]&&!!st&&st.line5==null&&st.same===A[k].same&&!!X&&X.first===A[k].firstLine&&typeof EAT.shopOf==='function'&&EAT.shopOf(n)==='溫州街・'+n; })&&!/林家乾麵|巷子裡定食|巷口茶飲|夏日冰菓室/.test(eatSrc)); }
  // ---------- D. 營業時間 ----------
  const P=PLACES, open=(z,h,ds)=>P.isOpen(z,h,D(ds));
  let MON=null; for(let d=D('2025-10-14');d<D('2025-11-30')&&MON==null;d++) if(wdOf(d)===1&&!CALENDAR.typhoon(d)) MON=d;   /* 週一（不是颱風假）*/
  check('D. 林家：週一公休；週二 11:00 開、13:59 開、14:00 關、16:59 關、17:00 開、20:59 開、21:00 關、10:59 關',!!MON&&!P.isOpen('wz_lin',12,MON)&&!P.isOpen('wz_lin',18,MON)&&open('wz_lin',11,'2025-10-14')&&open('wz_lin',13.98,'2025-10-14')&&!open('wz_lin',14,'2025-10-14')&&!open('wz_lin',16.98,'2025-10-14')&&open('wz_lin',17,'2025-10-14')&&open('wz_lin',20.98,'2025-10-14')&&!open('wz_lin',21,'2025-10-14')&&!open('wz_lin',10.98,'2025-10-14'));
  check('D. 定食：週二公休；週三 11:29 關、11:30 開、14:00 關、17:30 開、20:29 開、20:30 以後關',!open('wz_teishoku',12,'2025-10-14')&&!open('wz_teishoku',18,'2025-10-14')&&!open('wz_teishoku',11.48,'2025-10-15')&&open('wz_teishoku',11.5,'2025-10-15')&&!open('wz_teishoku',14,'2025-10-15')&&open('wz_teishoku',17.5,'2025-10-15')&&open('wz_teishoku',20.48,'2025-10-15')&&!open('wz_teishoku',20.5,'2025-10-15')&&!open('wz_teishoku',20.75,'2025-10-15')&&!open('wz_teishoku',21,'2025-10-15'));
  { let ok=true; for(let d=D('2025-10-14');d<D('2025-10-21');d++){ if(CALENDAR.typhoon(d)) continue; if(!(P.isOpen('wz_tea',10,d)&&!P.isOpen('wz_tea',9.98,d)&&P.isOpen('wz_tea',21.98,d)&&!P.isOpen('wz_tea',22,d))) ok=false; }
    check('D. 茶飲：每天（不休）10:00～22:00（09:59 關、21:59 開、22:00 關）',ok); }
  check('D. 冰菓室：7 月週二 12:00～21:00（11:59、21:00 關）、7 月週一公休；10 月、4/30 不開；5/1 開；9/30 開、10/1 不開',open('wz_ice',12,'2026-07-14')&&!open('wz_ice',11.98,'2026-07-14')&&open('wz_ice',20.98,'2026-07-14')&&!open('wz_ice',21,'2026-07-14')&&!open('wz_ice',15,'2026-07-13')&&!open('wz_ice',15,'2025-10-15')&&!open('wz_ice',15,'2026-04-30')&&open('wz_ice',15,'2026-05-01')&&open('wz_ice',15,'2026-09-30')&&!open('wz_ice',15,'2026-10-01'));
  { const t1=P.closedText('wz_lin',15,D('2025-10-14')), t2=P.closedText('wz_lin',12,MON), t3=P.closedText('wz_teishoku',20.75,D('2025-10-15')), t4=P.closedText('wz_teishoku',12,D('2025-10-14')), t5=P.closedText('wz_ice',15,D('2026-07-13'));
    check('D. 關門的說明（一天兩段）：「林家乾麵 現在沒有開（今天 11:00–14:00、17:00–21:00）。下次開門：今天 17:00。」',t1==='林家乾麵 現在沒有開（今天 11:00–14:00、17:00–21:00）。下次開門：今天 17:00。',t1);
    check('D. 「林家乾麵 今天公休。下次開門：明天 11:00。」「巷子裡定食 現在沒有開（今天 11:30–14:00、17:30–20:30）。下次開門：明天 11:30。」「巷子裡定食 今天公休。下次開門：明天 11:30。」「夏日冰菓室 今天公休。下次開門：明天 12:00。」',
      t2==='林家乾麵 今天公休。下次開門：明天 11:00。'&&t3==='巷子裡定食 現在沒有開（今天 11:30–14:00、17:30–20:30）。下次開門：明天 11:30。'&&t4==='巷子裡定食 今天公休。下次開門：明天 11:30。'&&t5==='夏日冰菓室 今天公休。下次開門：明天 12:00。',J([t2,t3,t4,t5])); }
  { const w=(h)=>J(P.windowOf('wz_lin',D('2025-10-14'),h)); check('D. windowOf（一天兩段）：10:00＝第一段、12:00＝午餐、15:00＝剛關的午餐、18:00＝晚餐；windowsOf 兩段；單一段的店照舊',w(10)==='[11,14]'&&w(12)==='[11,14]'&&w(15)==='[11,14]'&&w(18)==='[17,21]'&&J(P.windowsOf('wz_lin',D('2025-10-14')))==='[[11,14],[17,21]]'&&J(P.windowOf('wz_brunch',D('2025-10-14')))==='[8,15]'&&J(P.windowsOf('wz_brunch',D('2025-10-14')))==='[[8,15]]'); }
  { fresh('2025-10-15',20.75,'wenzhou'); const r1=await STORY.interact({exit:{to:'wz_teishoku',spawn:{x:-2,z:3,yaw:Math.PI}}},GM), t1=toasts.slice();
    fresh('2025-10-15',18,'wenzhou'); const r2=await STORY.interact({exit:{to:'wz_teishoku',spawn:{x:-2,z:3,yaw:Math.PI}}},GM);
    fresh(MON,12,'wenzhou'); const r3=await STORY.interact({exit:{to:'wz_lin',spawn:{x:1,z:3,yaw:Math.PI}}},GM), t3=toasts.slice();
    check('D. 溫州街的店門：定食 20:45 進不去（寫關門的說明）、18:00 進得去；林家週一進不去',r1===true&&t1[0]===P.closedText('wz_teishoku',20.75,D('2025-10-15'))&&r2===false&&r3===true&&/今天公休/.test(t3[0]||''),J([r1,t1,r2,r3,t3])); }
  { fresh('2025-10-15',20.75,'wz_teishoku'); inShop('teishoku'); const m=G.money; await order('teishoku',0);
    check('D. 人還在定食店裡、過了 20:30：點不到（寫關門的說明）、不扣錢、沒有選單',G.money===m&&!opts.length&&toasts[0]===P.closedText('wz_teishoku',20.75,D('2025-10-15')),J(toasts));
    fresh('2025-10-15',22.5,'wenzhou'); await order('tea',0); const a=toasts[0]===P.closedText('wz_tea',22.5,D('2025-10-15'))&&!opts.length;
    fresh('2026-07-13',15,'wenzhou'); await order('ice',0); const b=toasts[0]==='夏日冰菓室 今天公休。下次開門：明天 12:00。'&&!opts.length;
    check('D. 茶飲 22:30、冰菓室 7 月週一：窗口點不到（關門的說明）',a&&b,J(toasts)); }
  { fresh('2025-10-15',13,'wz_lin'); const st=CLS.skipStops(GM,15).map(s=>s.why+'@'+s.h.toFixed(3)); G.hour=15; const cb=CLS.closingBlock(G,16); G.hour=18; const st2=CLS.skipStops(GM,21.5).map(s=>s.why+'@'+s.h.toFixed(3)); G.hour=12; const cb2=CLS.closingBlock(G,13.5);
    check('D. 跳過時間（人在林家）：13:00 跳到 15:00 停在 13:50「林家乾麵快關門了」；15:00（兩段中間）不能跳過（已經閉館了 14:00）；18:00 跳到 21:30 停在 20:50；12:00 跳到 13:30 照常',st.includes('林家乾麵快關門了@'+(14-1/6).toFixed(3))&&/已經閉館了（14:00）/.test(cb)&&st2.includes('林家乾麵快關門了@'+(21-1/6).toFixed(3))&&cb2==='',J({st,cb,st2,cb2})); }
  { fresh('2025-10-13',15,'wenzhou'); await order('tea',0); const a=toasts[0]==='巷口茶飲：颱風假，今天沒開。';
    check('D. 颱風假（2025-10-13）四家都不開：typhoonShops 有 wz_lin、wz_teishoku、wz_tea、wz_ice；茶飲窗口「巷口茶飲：颱風假，今天沒開。」',CALENDAR.typhoon(D('2025-10-13'))&&['wz_lin','wz_teishoku','wz_tea','wz_ice'].every(z=>P.typhoonShops.includes(z)&&!P.isOpen(z,15,D('2025-10-13')))&&a,J(toasts)); }
  // ---------- E. 冰菓室的季節 ----------
  { const items=ds=>{ fresh(ds,15,'wenzhou'); const it=WZS.windowItems(); const f=lb=>it.find(i=>i.label===lb); return {buy:f('買一碗冰'),look:f('看夏日冰菓室'),tea:f('買一杯飲料')}; };
    const oct=items('2025-10-15'); check('E. 10 月：「買一碗冰」藏起來、「看夏日冰菓室」出現；「買一杯飲料」照常',!!oct.buy&&oct.buy.hidden&&!!oct.look&&!oct.look.hidden&&!!oct.tea&&!oct.tea.hidden);
    const m=G.money, h=G.hour; said=[]; opts=[]; const r=await STORY.interact(oct.look,GM);
    check('E. 10 月按「看」＝（鐵捲門拉著。上面貼了一張紙：「五月見」。）（和溫州街其他「看」一樣是 look 的字幕：STORY.interact 不接、game3d.js 顯示這一句；不扣錢、不花時間、沒有選單）',oct.look.look==='（鐵捲門拉著。上面貼了一張紙：「五月見」。）'&&r===false&&!said.length&&G.money===m&&G.hour===h&&!opts.length,J([oct.look.look,r,said]));
    said=[]; opts=[]; await WZS.interact(GM,oct.buy); check('E. 10 月就算按到窗口（保險）：也是那一句、不點餐',said.length===1&&said[0].t==='（鐵捲門拉著。上面貼了一張紙：「五月見」。）'&&!opts.length);
    const jun=items('2026-06-09'); await order('ice',null);
    check('E. 6 月：「買一碗冰」出現、「看」藏起來；選單有芒果冰 140',!jun.buy.hidden&&jun.look.hidden&&opts[0]&&opts[0][0]==='芒果冰　140 元',J(opts));
    const mm=async ds=>{ fresh(ds,15,'wenzhou'); await order('ice',null); return J(opts[0]); };
    const may=await mm('2026-05-12'), sep=await mm('2026-09-15'), aug=await mm('2026-08-11');
    check('E. 5 月、9 月沒有芒果冰（紅豆牛奶冰 70、綜合剉冰 60）；8 月有',may===J(['紅豆牛奶冰　70 元','綜合剉冰　60 元','不用了'])&&sep===may&&JSON.parse(aug)[0]==='芒果冰　140 元',may+' '+sep+' '+aug);
    const vis=ds=>{ const x=items(ds); return [!x.buy.hidden,!x.look.hidden]; };   /* hidden 是照現在的遊戲日（GAME.G）算的：當場讀 */
    const apr=vis('2026-04-30'), may1=vis('2026-05-01'), sep30=vis('2026-09-30'), oct1=vis('2026-10-01');
    check('E. 4/30 還是鐵捲門、5/1 窗口打開；9/30 開著、10/1 鐵捲門',J([apr,may1,sep30,oct1])===J([[false,true],[true,false],[true,false],[false,true]]),J([apr,may1,sep30,oct1])); }
  // ---------- F. 店員站的位置 ----------
  { const pop=(zone,ds,hh)=>{ fresh(ds,hh,zone); E.npcs=[]; E.zone={seats:[],spots:{},roomAt:()=>null}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.spawnExtra=()=>{}; GM.spawnRider=()=>{}; GM.removeNPC=()=>{};
      try{ STORY.populate(zone,GM); }catch(e){ return 'ERR:'+e.message; } finally { E.zone={roomAt:()=>null,seats:[]}; } return E.npcs.filter(n=>n.clerk).map(n=>[+n.obj.position.x.toFixed(2),+n.obj.position.z.toFixed(2),+n.obj.rotation.y.toFixed(2)]); };
    const L=WZ_SHOPS_LAYOUT, cl=k=>[L[k].clerk.x,L[k].clerk.z,L[k].clerk.yaw], lin=pop('wz_lin','2025-10-15',12), tei=pop('wz_teishoku','2025-10-15',12);
    check('F. 林家乾麵、巷子裡定食：店員站在室內配置的 clerk（林家 (−1.7,2.55)、定食 (−0.6,−2.75)）',J(lin)===J([cl('lin')])&&J(tei)===J([cl('teishoku')]),J([lin,tei]));
    const W=WZS.WINDOW, TW=[W.tea.clerk.x,W.tea.clerk.z,W.tea.clerk.yaw], I=[W.ice.clerk.x,W.ice.clerk.z,W.ice.clerk.yaw];
    const jul=pop('wenzhou','2026-07-14',15), oct=pop('wenzhou','2025-10-15',15), night=pop('wenzhou','2026-07-14',22.5), mon=pop('wenzhou','2026-07-13',15);
    check('F. 溫州街的窗口：7 月 15:00 茶飲、冰菓室都有店員（README 的位置，面向騎樓）；10 月只有茶飲；22:30 都沒有；7 月週一只有茶飲',J(jul)===J([TW,I])&&J(oct)===J([TW])&&J(night)===J([])&&J(mon)===J([TW]),J({jul,oct,night,mon})); }
  // ---------- G. 一起吃 ----------
  { const eh=EAT.eatingHere; EAT.eatingHere=(gm,id)=>id==='heroine_01';
    fresh('2025-10-15',12,'wz_lin'); inShop('lin'); SOCIAL.remember('heroine_01','FIRST_MET',''); { const r=SOCIAL.rel('heroine_01'); r.fam=25; r.trust=10; r.comf=10; } const an={id:'heroine_01',charId:'heroine_01',name:'以安',obj:mkObj()}; GM.npc.heroine_01=an; E.npcs.push(an);
    said=[]; opts=[]; picks=[0,'坐過去一起吃']; await WZS.interact(GM,{wzShop:'lin',kind:'order'}); const EL=EAT_LINES;
    const a=opts.some(o=>J(o)===J(['坐過去一起吃','不用了']))&&has(EL.open)&&has(EL.closeDoor)&&!has(EL.closeRecycle)&&!has(A.lin.done)&&said.findIndex(s=>s.t===A.lin.firstLine)>=0&&said.findIndex(s=>s.t===A.lin.firstLine)<said.findIndex(s=>s.t===EL.open);
    fresh('2025-10-15',18,'wz_teishoku'); inShop('teishoku'); SOCIAL.remember('heroine_01','FIRST_MET',''); { const r=SOCIAL.rel('heroine_01'); r.fam=25; r.trust=10; r.comf=10; } GM.npc.heroine_01=an; E.npcs.push(an);
    said=[]; opts=[]; picks=[0,'坐過去一起吃']; await WZS.interact(GM,{wzShop:'teishoku',kind:'cashier'}); const b=has(EL.open)&&has(EL.closeDoor)&&!has(EL.closeRecycle)&&!has(A.teishoku.done);
    G.hour=18.9; said=[]; opts=[]; picks=[1]; await WZS.interact(GM,{wzShop:'teishoku',kind:'cashier'}); const b2=!opts.some(o=>o.includes('坐過去一起吃'))&&has(A.teishoku.done);
    fresh('2025-10-15',15,'wenzhou'); SOCIAL.remember('heroine_01','FIRST_MET',''); GM.npc.heroine_01=an; E.npcs.push(an); said=[]; opts=[]; picks=[0]; await WZS.interact(GM,{wzShop:'tea',kind:'window'}); const c=!opts.some(o=>o.includes('坐過去一起吃'))&&has(A.tea.done);
    EAT.eatingHere=eh;
    check('G. 一起吃（AA_329）：林家、定食有認識的人在吃＝問「坐過去一起吃」（第一次的旁白在前）、結尾「在店門口分開」（沒有回收台）、吃完（一個人）的旁白不說；同一天再點＝不再問、照說吃完的旁白；外帶窗口不問、照說吃完的旁白',a&&b&&b2&&c,J({a,b,b2,c})); }
  // ---------- H. 吃過的 ----------
  { fresh('2026-07-15',12,'wz_lin'); inShop('lin'); await order('lin',2); G.hour=15; G.zone='wenzhou'; await order('tea',0); G.hour=15.3; await order('ice',1); G.hour=18; G.zone='wz_teishoku'; inShop('teishoku'); await order('teishoku',0);
    const ate=(G.eat&&G.eat.ate)||[], want=[['溫州街・林家乾麵','餛飩湯'],['溫州街・巷口茶飲','紅茶'],['溫州街・夏日冰菓室','紅豆牛奶冰'],['溫州街・巷子裡定食','薑汁燒肉定食']];
    check('H. 手機「吃過的」四家都記（店名、品項、日期；2026-07-15 週三四家都開）',J(ate.map(a=>[a.shop,a.item]))===J(want)&&ate.every(a=>a.day===G.day)&&want.every(w=>EAT.notesHTML(G).includes(w[0])),J(ate)); }
  // ---------- I. 白名單、明軒那一則 ----------
  { const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_364_/.test(e.path)), src=fs.readFileSync(path.join(ROOT,'src/wzshops3d.js'),'utf8');
    check('I. 劇情匯入白名單：AA_364@5ae04087（一個版本、approved；歷史 d56da150、d7708ebe）；wzshops3d.js 寫了三個版本',allow.length===1&&allow[0].sha==='5ae04087'&&allow[0].status==='approved'&&['d56da150','d7708ebe'].every(v=>(allow[0].history||[]).some(h=>h.sha===v))&&/AA_364/.test(src)&&/5ae04087/.test(src)&&/d56da150/.test(src)&&/d7708ebe/.test(src),J(allow.map(e=>e.sha+':'+e.status)));
    const row=((STORY.MX_FM1&&STORY.MX_FM1.rows)||[]).find(r=>/林家乾麵/.test(r[0])), price=n=>(A.lin.menu.find(m=>m[0]===n)||[])[1];
    check('I. 明軒「公館一百元以內」那一則不改（第 5 節第 2 點）：「林家乾麵（溫州街）小碗乾麵＋貢丸湯 70」＝乾麵（小）40＋貢丸湯 30',!!row&&row[1]==='小碗乾麵＋貢丸湯'&&row[2]==='70'&&price('乾麵（小）')+price('貢丸湯')===70,J(row)); }
  // ---------- J. 區域（另一個 Node 行程）----------
  { let out='', ok=false; try{ out=cp.execFileSync(process.execPath,[__filename,'--zones'],{encoding:'utf8',timeout:600000}); ok=true; }catch(e){ out=String(e.stdout||'')+String(e.stderr||e.message); }
    process.stdout.write(out); if(!ok&&!/FAIL /.test(out)) check('J. 區域那一段跑完',false,out.slice(-400)); else fails+=(out.match(/^FAIL /mg)||[]).length; }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
