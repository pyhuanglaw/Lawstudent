// 溫州街第一批五間店（WZ-SHOPS1-1104、USER_WANTS X212；AA_655，企劃線 a22e53016；使用者 11-04 04:5x：2:30 AM 11:00～02:30 照舊、小路 18:00～02:00）——不需要瀏覽器。
//   1 換字（AA_655 第 1 節）：src/ 裡（去掉註解、存檔 key）沒有「兩點半 Café」「巷子裡定食」、當店名的「半熟」、溫州街那間的「定食店」；例外照留（蛋的熟度、118 巷的定食店、公館的日日定食、單獨的「兩點半」）
//   2 內部 id、存檔 key 沒變（cafe、wz_brunch、wz_teishoku、wz_lin、wz_print；EAT.count 的「兩點半 Café」「溫州街・半熟」「巷子裡定食」、SQ19 的 shop:、memo SHOP_TEI_SIS）；畫面上的店名換新（地點、快速移動、大地圖、邀約、吃過的）
//   3 小路（第 2、3 節）：店員句、菜單、木札、點酒那一句（每次來只說一次）、一起去的人點的、老樣子的回答、第一次／吃完的旁白
//   4 營業時間（第 4 節、使用者 04:5x）：11:30、13:00 進不去；18:00、01:59 進得去；02:00 進不去；公休日照舊週二（週三照常開：七夕 2026-08-19 週三）；颱風天不開；門口三句
//   5 學姊的店內偶遇搬到林家乾麵（第 4 節）；SQ19（第 2 節）；七夕（第 2 節）；門口的黑板；2:30 AM 的牌子（第 6 節）
//   6 SUNNY SIDE、林家、阿德的價目（第 5 節）
//   7 台詞逐字對照 AA_655（git show 白名單上的 a22e53016；讀不到＝SKIP）
//   8 AA_658（企劃線 6ee7ea3a5，溫州街第二批）：巷口書房→溫州書屋、巷口茶飲→帝大紅茶、阿忠水果→阿忠鮮果、自助洗衣→常在洗衣（key 不改、夏日冰菓室不改、公館的「自助洗衣」不改）；
//     帝大紅茶菜單（中、大）、firstLine、舊品項對到新品項；溫州書屋營業時間、櫥窗四句；逐字對照 AA_658
// 修改前（開發分支 99c33fb46）：1～7 都有 FAIL。用法：node tests/aa655_wz_rename_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0, skips=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const J=x=>JSON.stringify(x), rd=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA|L118|LANE118_SHOPS|L118_REDO|LANE118_LAYOUT|WZS|EAT|EAT_LINES|WZ_SHOPS_LAYOUT|SHOP_ENC|SISQX_LINES)$/;
const load=f=>{ let src=rd(f); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/lane118_layout.js','src/data/lane118_shops.js','src/data/l118_redo772.js','src/lane118.js','src/data/wz_shops_layout.js','src/data/lin_layout.js','src/wzshops3d.js','src/data/eat_lines.js','src/eat3d.js','src/data/shop_enc.js','src/data/sis_qixi_events.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},narrate(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, toasts=[], entered=[];
const E={q:{level:'medium'},player:{busy:false,obj:mkObj(),lv:0,seat:null},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,addNPC(n){ this.npcs.push(n); return n; }};
const GM={get G(){ return G; },E,D:{active:false},npc:{},enterN:1,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ entered.push(z); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),
  sitAt(e,st){ e.seat=st; },standUp(e){ e.seat=null; },freeSeat:st=>st,money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text)===want); return k<0?o.length-1:k; } return want==null?o.length-1:want; }};
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const fresh=(key,hour,zone)=>{ const day=typeof key==='number'?key:D(key); G={v:3,stage:'law',day,hour,zone:zone||'wenzhou',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:{KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},invites:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; toasts=[]; entered=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.seat=null; E.zone.seats=[]; global.GAME={G}; return G; };
const order=async(k,pick)=>{ said=[]; opts=[]; toasts=[]; picks=[pick]; const kind={lin:'order',teishoku:'cashier'}[k]; await WZS.interact(GM,{wzShop:k,kind}); };
const T=x=>J(said.map(s=>s.t))===J(x);
const OL=n=>LANE118_SHOPS.orderLine.replace('{品名}',n);
/* 這一天之後第一個星期 w（0＝週日）、不是颱風假 */
const nextWd=(from,w)=>{ for(let d=D(from);d<D(from)+30;d++) if(wdOf(d)===w&&!CALENDAR.typhoon(d)) return d; return null; };
(async()=>{
  // ---------- 1 換字 ----------
  { const strip=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"\\])\/\/.*$/mg,'$1');
    /* 存檔當 key 的地方（AA_655：key 留舊字、顯示換新字）＋例外（蛋的熟度、118 巷、日日定食）*/
    const KEYOK=[/'兩點半 Café':'兩點半 Café'/g,/key===?'兩點半 Café'/g,/key!==?'兩點半 Café'/g,/shop==='兩點半 Café'/g,/EAT\.count\(G,'兩點半 Café'\)/g,/counter\(GM(_ref)?,'兩點半 Café'/g,/key='兩點半 Café'/g,/S\.EAT_KEY=\{'兩點半 Café'/g,
      /S\.SHOW=\{[^}]*\}/g,/S\.RENAME_AA655=\{[^}]*\}/g,/key:'(巷口茶飲|阿忠水果)'/g,/shop:'巷口茶飲'/g,/'巷口茶飲':/g,/n:'自助洗衣'/g,/key:'巷子裡定食'/g,/shop:'巷子裡定食'/g,/'巷子裡定食':/g,/'溫州街・半熟'/g,/"(兩點半 Café|溫州街・半熟)":/g,/note: '[^']*'/g,/source:'[^']*'/g,/console\.warn\('[^']*'/g];
    const OLD=/巷口書房|巷口茶飲|阿忠水果|自助洗衣|那家茶飲|兩點半 Café|巷子裡定食|溫州街・定食店|溫州街那家定食|定食店長|定食店的櫃台|半熟早午餐|「半熟[？。]|半熟的班|'半熟'|（半熟）|(去|在|早上|九點，|・)半熟(?!蛋)/;
    const GEN={'src/data/lane118_shops.js':1,'src/data/l118_shop_layouts.js':1,'src/data/us_layouts.js':1};   /* us_layouts：美國篇投幣洗衣的說明欄「自助洗衣（通稱）」*/
    const bad=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()){ walk(p); continue; } if(!/\.js$/.test(f)||GEN[p]) continue;
        let s=strip(rd(p)); for(const re of KEYOK) s=s.replace(re,''); if(!OLD.test(s)) continue; bad.push([p,s.split('\n').filter(l=>OLD.test(l)).map(l=>{ const m=l.match(OLD); const i=l.indexOf(m[0]); return l.slice(Math.max(0,i-30),i+40).trim(); })]); } };
    walk('src');
    check('1 src/ 裡（註解、存檔 key 除外）沒有「兩點半 Café」「巷子裡定食」、當店名的「半熟」、溫州街那間的「定食店」',!bad.length,J(bad));
    /* 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338）：蛋包飯研究所改成奈良咖哩，「蛋的熟度」那三句跟著沒有了（舊期望多三格：eat_lines 的「蛋一樣半熟？」「好，半熟。」、lane118_shops.js 的「蛋要全熟還是半熟？」）；室內配置（LAWWW2 的舊配置）那一格還在 */ /* 2026-11-11 再改：奈良咖哩的新室內配置進來以後（l118_int_omu.py，開發分支 bcea920be 那一批）舊配置那一格也沒有了——整個 src 已經沒有「全熟還是半熟」；舊期望多一格 ['src/data/l118_shop_layouts.js','全熟還是半熟'] */ const EX=[['src/data/wz_events.js','蛋要半熟'],
      ['src/sis_b13_3d.js','118 巷・定食店'],['src/sup497_3d.js','118 巷・定食店'],['src/zones3d.js',"n:'花序 Flower Notes'"]/* 2026-11-11 改期望：泰米村食搬到汀州路（X321），公館 G11 是花序 Flower Notes（X325）——原本查 n:'泰米村食' */,['src/data/wz_jobs.js',"contact:'兩點半的老闆'"]];
    const miss=EX.filter(([f,t])=>!rd(f).includes(t));
    check('1 例外照留：蛋的熟度（eat_lines 540／541、wz_events「蛋要半熟」、118 巷「全熟還是半熟」）、118 巷的定食店、公館 G11（2026-11-10 改期望：使用者 X320 把日日定食改成泰米村食，原本查 n:\'日日定食\'）、單獨的「兩點半」',!miss.length,J(miss));
    check('1 英文店名和中文字之間空半形空格（「去 2:30 AM 坐坐」「去 SUNNY SIDE 吃早午餐」），挨著標點、「・」不空',INVITE_DATA.places.find(p=>p.id==='cafe').verb==='去 2:30 AM 坐坐'&&INVITE_DATA.places.find(p=>p.id==='brunch').verb==='去 SUNNY SIDE 吃早午餐'
      &&/'溫州街・SUNNY SIDE'/.test(rd('src/data/wz_jobs.js'))&&/'2:30 AM・窗邊'/.test(rd('src/outings3d.js'))&&!/・ (2:30|SUNNY)|(2:30 AM|SUNNY SIDE) ・|[一-鿿](2:30 AM|SUNNY SIDE)|(2:30 AM|SUNNY SIDE)[一-鿿]/.test(strip(rd('src/story3d.js'))+strip(rd('src/data/zrzq_events.js'))+strip(rd('src/data/heroine_asks.js')))); }
  // ---------- 2 內部 id、key；顯示名 ----------
  { const P=PLACES;
    check('2 地點名：cafe＝2:30 AM、wz_brunch＝SUNNY SIDE、wz_teishoku＝小路；林家、阿德照舊（id 都沒變）',P.names.cafe==='2:30 AM'&&P.names.wz_brunch==='SUNNY SIDE'&&P.names.wz_teishoku==='小路'&&P.names.wz_lin==='林家乾麵'&&P.names.wz_print==='阿德影印輸出',J([P.names.cafe,P.names.wz_brunch,P.names.wz_teishoku]));
    const ql=P.quickList(), q=ql.find(x=>x[0]==='cafe');
    check('2 快速移動、大地圖、導覽：「2:30 AM」',!!q&&q[1]==='2:30 AM'&&/\['cafe','2:30 AM'\]/.test(rd('src/placemap3d.js'))&&/name:'2:30 AM'\}/.test(rd('src/guide3d.js'))&&/2:30 AM/.test(rd('src/guide3d.js').match(/\[\/溫州街[^/]*\//)[0]),J(q));
    const pl=id=>INVITE_DATA.places.find(p=>p.id===id);
    check('2 邀約的地點名：2:30 AM、SUNNY SIDE（id cafe、brunch，zone 照舊）',pl('cafe').name==='2:30 AM'&&pl('cafe').zone==='cafe'&&pl('brunch').name==='SUNNY SIDE'&&pl('brunch').zone==='wz_brunch',J([pl('cafe').name,pl('brunch').name]));
    const W=WZ_SHOPS_LAYOUT;
    check('2 店的區域：名字、進出口的字照新名（SUNNY SIDE、小路），id 照舊',W.brunch.id==='wz_brunch'&&W.brunch.name==='SUNNY SIDE'&&W.brunch.exit.label==='離開 SUNNY SIDE'&&W.brunch.enterAt.label==='進去 SUNNY SIDE'&&W.teishoku.id==='wz_teishoku'&&W.teishoku.name==='小路'&&W.teishoku.exit.label==='離開小路'&&W.teishoku.enterAt.label==='進去小路',J([W.brunch.name,W.brunch.enterAt.label,W.teishoku.name,W.teishoku.enterAt.label]));
    const z=rd('src/zones3d.js');
    check('2 zones3d：Café 區域名「2:30 AM」、溫州街「進入 2:30 AM」、B3 招牌（程式的備用）「小路」',/const cafe=\{ id:'cafe', name:'2:30 AM'/.test(z)&&/label:'進入 2:30 AM'/.test(z)&&/name:'小路',sub:/.test(z));
    check('2 存檔 key 照舊：EAT.FIRST_KEY「兩點半 Café」「溫州街・半熟」、小路的 key「巷子裡定食」、SQ19 shop:「巷子裡定食」、jobs3d EAT_KEY「兩點半 Café」',EAT.FIRST_KEY['兩點半 Café']==='兩點半 Café'&&EAT.FIRST_KEY['溫州街・半熟']==='溫州街・半熟'&&WZS.AA364.teishoku.key==='巷子裡定食'&&WZS.AA364.teishoku.zone==='wz_teishoku'&&/SQ19:\{shop:'巷子裡定食'/.test(rd('src/sideq3d.js'))&&/S\.EAT_KEY=\{'兩點半 Café':'cafe'/.test(rd('src/jobs3d.js'))&&!!EAT_LINES.staff['兩點半 Café']&&!!EAT_LINES.first['溫州街・半熟']);
    fresh('2026-03-02',19,'wz_teishoku'); G.eat={n:{'巷子裡定食':6},last:{'巷子裡定食':'玉子燒'},first:{'巷子裡定食':1},ate:[{shop:'兩點半 Café',item:'拿鐵',day:1},{shop:'溫州街・半熟',item:'法式吐司',day:2},{shop:'溫州街・巷子裡定食',item:'鹽烤鯖魚定食',day:3}]};
    const html=EAT.notesHTML(G);
    check('2 舊存檔（小路點過 6 次）：照樣認得你、次數記在同一個 key；手機「吃過的」顯示新店名（存下來的店名照舊）',EAT.count(G,'巷子裡定食')===6&&/2:30 AM　拿鐵/.test(html)&&/溫州街・SUNNY SIDE　法式吐司/.test(html)&&/溫州街・小路　鹽烤鯖魚定食/.test(html)&&!/兩點半 Café|巷子裡定食|・半熟/.test(html)&&G.eat.ate[0].shop==='兩點半 Café',html);
    await order('teishoku','老樣子');
    check('2 第 7 次點「老樣子」（玉子燒 80）：key「巷子裡定食」變 7 次、沒有「小路」這個 key',EAT.count(G,'巷子裡定食')===7&&G.eat.n['小路']==null&&said.some(s=>s.t===OL('玉子燒')),J(G.eat.n)); }
  // ---------- 3 小路 ----------
  { const A=WZS.AA364.teishoku;
    check('3 店員句（第 2 節）：老闆「歡迎光臨。……吧台可以嗎？」／熟客「今天的雞皮串剛烤好。」／老樣子「好，跟上次一樣。」',A.who==='老闆'&&A.first==='歡迎光臨。……吧台可以嗎？'&&A.known==='今天的雞皮串剛烤好。'&&A.same==='好，跟上次一樣。');
    check('3 第一次、吃完的旁白（第 2 節）',A.firstLine==='（店裡很暗，只有吧台上方的燈是亮的。木札菜單一張一張掛在橫樑上，烤爐冒著煙。）'&&A.done==='（老闆把最後一串烤好的雞肉放在你面前。「這串招待。」）');
    check('3 菜單（第 3 節）：烤雞串（三串）120、揚出豆腐 90、鹽烤鯖魚 160、玉子燒 80、燙青菜 60、烏龍茶 40、可爾必思 50、生啤酒 120、清酒（一合）180',J(A.menu)===J([['烤雞串（三串）',120],['揚出豆腐',90],['鹽烤鯖魚',160],['玉子燒',80],['燙青菜',60],['烏龍茶',40],['可爾必思',50],['生啤酒',120],['清酒（一合）',180]]),J(A.menu));
    check('3 木札（看菜單）',A.wall==='烤雞串 120／揚出豆腐 90／鹽烤鯖魚 160／玉子燒 80／燙青菜 60／烏龍茶 40／可爾必思 50／生啤酒 120／清酒 180');
    const MON=nextWd('2026-03-02',1);
    fresh(MON,19,'wz_teishoku'); GM.enterN=10; WZS._alcReset(); const m0=G.money; await order('teishoku',7);
    const AL='（老闆看了你一眼：「學生？……喝慢一點。」）';
    check('3 第一次點生啤酒（週一 19:00）：老闆招呼 → 選單九樣 → 扣 120 →「（你點了生啤酒。）」→ 點酒那一句 → 第一次 → 吃完',said[0]&&said[0].who==='老闆'&&opts[0].length===10&&G.money===m0-120&&T(['歡迎光臨。……吧台可以嗎？',OL('生啤酒'),AL,A.firstLine,A.done]),J(said));
    G.hour=20; await order('teishoku',8); const two=said.filter(s=>s.t===AL).length;
    GM.enterN=11; G.hour=21; await order('teishoku',8); const three=said.filter(s=>s.t===AL).length;
    G.hour=21.5; await order('teishoku',5); const tea=said.filter(s=>s.t===AL).length;
    check('3 點酒那一句每次來只說一次：同一次再點清酒＝不說；下一次來（再走進店裡）點清酒＝說；烏龍茶（沒有酒精）＝不說',two===0&&three===1&&tea===0,J([two,three,tea]));
    check('3 一起去的人點的（第 3 節）：學姊清酒、芯慈烏龍茶、阿哲生啤酒、其他人可爾必思',J(['heroine_05','classmate_xinci','zhe','heroine_01','classmate_bohan'].map(id=>WZS.withItem('teishoku',id)))===J(['清酒','烏龍茶','生啤酒','可爾必思','可爾必思']));
    EAT.lastTog={id:'heroine_05',key:'巷子裡定食',day:G.day}; const w=WZS.withOrder(GM,'teishoku');
    check('3 一起吃的是學姊＝「（學姊點了一合清酒。「一杯就好。」）」（2026-11-04 改期望：原本是共用那一句「（{她}點了清酒。）」；AA_655 第 7 節第 3 點，10020abda）',w==='（學姊點了一合清酒。「一杯就好。」）',w); }
  // ---------- 4 營業時間、門口 ----------
  { const P=PLACES, z='wz_teishoku', MON=nextWd('2026-03-02',1), TUE=nextWd('2026-03-02',2), WED=nextWd('2026-03-02',3);
    const r=[P.isOpen(z,11.5,MON),P.isOpen(z,13,MON),P.isOpen(z,17.99,MON),P.isOpen(z,18,MON),P.isOpen(z,23.5,MON),P.isOpen(z,24+59/60,MON),P.isOpen(z,25+59/60,MON),P.isOpen(z,26,MON),P.isOpen(z,1+59/60,MON),P.isOpen(z,2,MON)];
    check('4 小路 18:00～02:00（週一）：11:30、13:00、17:59 進不去；18:00、23:30、00:59、01:59 進得去；02:00 進不去（G.hour 25.98／26，也認得先 %24 的 1.98／2）',J(r)===J([false,false,false,true,true,true,true,false,true,false]),J(r));
    check('4 公休日照舊週二（整天、過了午夜也不開）；週三照常（學姊七夕 2026-08-19 週三 19:00）',!P.isOpen(z,19,TUE)&&!P.isOpen(z,25,TUE)&&P.isOpen(z,19,WED)&&P.isOpen(z,19,D('2026-08-19'))&&wdOf(D('2026-08-19'))===3&&P.isOpen(z,25,MON));
    check('4 颱風假不開（2025-10-13）；說明「18:00–02:00；週二公休」、今天「今天 18:00–02:00」',CALENDAR.typhoon(D('2025-10-13'))&&!P.isOpen(z,19,D('2025-10-13'))&&P.hours[z].text==='18:00–02:00；週二公休'&&P.todayText(z,MON)==='今天 18:00–02:00',P.todayText(z,MON));
    check('4 其他有 rules 的店照舊：林家（週一休；2026-11-12 改期望：一段 11:00–21:00，15:00 開著——舊期望一天兩段、15:00 關）、影印店考試週 24:00、法圖',P.isOpen('wz_lin',12,TUE)&&P.isOpen('wz_lin',15,TUE)&&!P.isOpen('wz_lin',12,MON)&&!P.isOpen('wz_lin',1,TUE)&&P.hhmm(24)==='24:00'&&P.hhmm(26)==='02:00'&&P.hhmm(21.75)==='21:45');
    const door=async(day,h)=>{ fresh(day,h,'wenzhou'); const r=await STORY.interact({exit:{to:'wz_teishoku',spawn:{x:0,z:0}},label:'進去小路'},GM); return [r,said.map(s=>s.t),entered.slice()]; };
    const d1=await door(MON,12.5), d2=await door(TUE,19), d3=await door(D('2025-10-13'),19), d4=await door(MON,19);
    check('4 中午走到門口：（小路的布簾收起來了。門上的木牌寫著「18:00～02:00」。）——不進去',d1[0]===true&&J(d1[1])===J(['（小路的布簾收起來了。門上的木牌寫著「18:00～02:00」。）'])&&!d1[2].length,J(d1));
    check('4 公休日：（小路的門上掛著「本日公休」。）',d2[0]===true&&J(d2[1])===J(['（小路的門上掛著「本日公休」。）'])&&!d2[2].length,J(d2));
    check('4 颱風假：（小路的紅燈籠沒有亮。門上貼著「颱風天休息」。）',d3[0]===true&&J(d3[1])===J(['（小路的紅燈籠沒有亮。門上貼著「颱風天休息」。）'])&&!d3[2].length,J(d3));
    check('4 19:00 開著：沒有門口那一句（照常走進去）',!d4[1].some(t=>/小路/.test(t)),J(d4)); }
  // ---------- 5 學姊的偶遇、SQ19、七夕、黑板、2:30 AM 的牌子 ----------
  { const R=SHOP_ENC.rows.filter(r=>r.memo==='SHOP_TEI_SIS');
    const r=R[0]||{};
    check('5 學姊的店內偶遇搬到林家乾麵（spot wz_lin），時段照舊（平日到 13:30、大一大二）、memo SHOP_TEI_SIS 不改、一週一次／自己走進去才遇到',R.length===1&&r.who==='heroine_05'&&r.spot==='wz_lin'&&r.to===13.5&&J(r.days)===J([1,2,3,4,5])&&r.weekMax===1&&r.selfOnly===true&&!SHOP_ENC.rows.some(x=>x.spot==='wz_teishoku'),J(r).slice(0,200));
    check('5 why「她一個人坐在角落，乾麵旁邊攤著一本原文書。」、away「在林家乾麵」、台詞第一句照舊、第二句「今天的餛飩湯很好。我快吃完了。」',r.why==='她一個人坐在角落，乾麵旁邊攤著一本原文書。'&&r.away==='在林家乾麵'&&J(r.lines&&r.lines.acq)===J(['學弟。……你也吃這家。','今天的餛飩湯很好。我快吃完了。']),J(r.lines));
    check('5 SUNNY SIDE 的店內偶遇：「在 SUNNY SIDE」',SHOP_ENC.rows.filter(x=>x.spot==='wz_brunch').every(x=>x.away==='在 SUNNY SIDE')&&SHOP_ENC.rows.some(x=>x.spot==='wz_brunch'));
    const sq=rd('src/sideq3d.js');
    check('5 SQ19：名字表「小路（溫州街）」、說話的人「小路的老闆」、標題「小路：忘在吧台的筆記本」、失物籃、open 照舊',/'巷子裡定食':'小路（溫州街）'/.test(sq)&&/'巷子裡定食':'小路的老闆'/.test(sq)&&/say\(GM,'小路的老闆',L\.SQ19\.greet\)/.test(sq)&&/SQ19:\{shop:'巷子裡定食',title:'小路：忘在吧台的筆記本'/.test(sq)&&sq.includes("basket:'（小路的吧台角落多一個小籃子，寫著「失物」。）'")&&sq.includes("SQ19:{open:['昨天有個女生把筆記本忘在這裡。封面寫法律系。'"));
    check('5 SQ20：SUNNY SIDE（標題、提示、地點、場景）；舊存檔相簿的 SQ19／SQ20 標題讀檔換新（RENAME_AA655）',/title:'SUNNY SIDE：計時'/.test(sq)&&/去 SUNNY SIDE 幫小蕙計時/.test(sq)&&/scene:'SUNNY SIDE・店裡後面'/.test(sq)&&/S\.RENAME_AA655=\{'巷子裡定食':'小路','半熟早午餐':'SUNNY SIDE'/.test(sq)&&/Object\.keys\(S\.RENAME_AA655\)/.test(sq));
    check('5 七夕（2026）：邀約「後天七夕。」「我想去溫州街那家小路。……居酒屋，可是很安靜。七點。」、場景「溫州街・小路」、出遊「溫州街・小路」',J(SISQX_LINES.y26Ask)===J(['後天七夕。','我想去溫州街那家小路。……居酒屋，可是很安靜。七點。'])&&rd('src/data/sis_qixi_events.js').includes("{scene:'溫州街・小路',bg:'teishoku_night'}")&&rd('src/sis_qixi3d.js').includes("place:'溫州街・小路',title:'七夕（溫州街・小路）'"));
    check('5 出遊的底圖名：teishoku_night「小路（晚上）」；brunch_back「SUNNY SIDE・店裡後面」',OUT.BG.teishoku_night.label==='小路（晚上）'&&OUT.BG.brunch_back.label==='SUNNY SIDE・店裡後面',J([OUT.BG.teishoku_night.label,OUT.BG.brunch_back.label]));
    const z=rd('src/zones3d.js');
    check('5 小路門口的黑板：本日のおすすめ／焼き鳥・だし巻き玉子／烤雞串・玉子燒；2:30 AM 招牌下面「Business Hours 11:00 – 02:30」（第 6 節）',z.includes("[-2.4,-3.9,0,['本日のおすすめ','焼き鳥・だし巻き玉子','烤雞串・玉子燒']]")&&z.includes("name:'2:30 AM',sub:'Business Hours 11:00 – 02:30'")&&PLACES.hours.cafe.text==='11:00–02:30'); }
  // ---------- 6 價目 ----------
  { check('6 SUNNY SIDE：法式吐司 280、班尼迪克蛋 320、法式火腿起司三明治 290、美式 120、拿鐵 150、伯爵茶 140',J(WZS.BRUNCH.map(x=>[x[0],x[1]]))===J([['法式吐司',280],['班尼迪克蛋',320],['法式火腿起司三明治',290],['美式',120],['拿鐵',150],['伯爵茶',140]]),J(WZS.BRUNCH));
    check('6 林家乾麵：乾麵 60、麻醬麵 70、餛飩麵 85、榨菜肉絲麵 85、燙青菜 40、貢丸湯 40、餛飩湯 50、滷蛋 15（牆上的紅紙同一份）',J(WZS.AA364.lin.menu)===J([['乾麵',60],['麻醬麵',70],['餛飩麵',85],['榨菜肉絲麵',85],['燙青菜',40],['貢丸湯',40],['餛飩湯',50],['滷蛋',15]])&&WZS.AA364.lin.wall==='乾麵 60／麻醬麵 70／餛飩麵 85／榨菜肉絲麵 85／燙青菜 40／貢丸湯 40／餛飩湯 50／滷蛋 15');
    const PP=WZS.PRINT_PRICE||{};
    check('6 阿德影印：黑白 A4 2、A3 4；彩色 A4 10、A3 20；雙面 +1；掃描 5；膠裝 80 起；騎馬釘 15 起；選單照算（筆記 30 頁 60、報告 40 頁＋騎馬釘 95、A3 海報 20）',J(PP)===J({bwA4:2,bwA3:4,colA4:10,colA3:20,duplex:1,scan:5,bind:80,saddle:15})&&(()=>{ fresh('2026-10-20',15,'wz_print'); const m=WZS.printMenu(G); return m[0][1]===60&&(!m[1]||m[1][1]===95); })());
    fresh('2026-03-07',9,'wz_brunch'); said=[]; picks=[3]; const m0=G.money; await WZS.interact(GM,{wzShop:'brunch',kind:'cashier'});
    check('6 SUNNY SIDE 點美式（稿沒寫吃完那一句）：扣 120、不說空的旁白',G.money===m0-120&&!said.some(s=>s.t==null||s.t===''||s.t==='undefined'),J(said)); }
  // ---------- 7 逐字對照 AA_655 ----------
  { let doc=null; try{ doc=cp.execFileSync('git',['-C',ROOT,'show','a22e53016:docs/story_planning/AA_655_溫州街第一批_改名規則與小路居酒屋菜單.md'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
    if(!doc){ console.log('SKIP 7 讀不到 AA_655（a22e53016）'); skips++; }
    else { const A=WZS.AA364.teishoku, ln=[A.first,A.known,A.same,A.firstLine,A.done,A.alcLine,A.wall,SISQX_LINES.y26Ask[1],'小路（溫州街）','小路的老闆','小路：忘在吧台的筆記本','（小路的吧台角落多一個小籃子，寫著「失物」。）','小路（晚上）','本日のおすすめ','焼き鳥・だし巻き玉子','烤雞串・玉子燒',
        WZS.TEI_DOOR.noon,WZS.TEI_DOOR.rest,WZS.TEI_DOOR.typhoon,'她一個人坐在角落，乾麵旁邊攤著一本原文書。','在林家乾麵','今天的餛飩湯很好。我快吃完了。','Business Hours 11:00 – 02:30'];
      const menuOk=A.menu.every(([n,p])=>doc.includes("['"+n+"',"+p+"]"));
      const miss=ln.filter(t=>!doc.includes(t));
      check('7 小路、門口、七夕、SQ19、學姊偶遇、黑板、招牌的字都在 AA_655 裡（一字不差）、菜單和稿一樣',!miss.length&&menuOk,J(miss));
      const allow=JSON.parse(rd('docs/handoff/story_import_allow.json')), e=(allow.files||[]).filter(x=>/AA_655_/.test(x.path));
      check('7 劇情匯入白名單：AA_655 approved、AA（D109）；sha 10020abda（第 7 節），歷史 a22e53016（2026-11-04 改期望：原本 sha＝a22e53016）',e.length===1&&e[0].sha==='10020abda'&&(e[0].history||[]).some(h=>h.sha==='a22e53016')&&e[0].status==='approved'&&e[0].approvedBy==='AA（D109）',J(e)); } }
  // ---------- 8 AA_658 ----------
  { const z=rd('src/zones3d.js');
    check('8 招牌（程式的備用）：溫州書屋、帝大紅茶、阿忠鮮果、常在洗衣；公館 G09 拉下鐵門、沒有店名（X335）',z.includes("shop:{type:'books',name:'溫州書屋',")&&z.includes("shop:{type:'tea',name:'帝大紅茶',")&&z.includes("shop:{type:'fruit',name:'阿忠鮮果',")&&z.includes("shop:{type:'laundry',name:'常在洗衣',")&&z.includes("{n:'',c:'#8f9295',w:9,type:'none',it:'laundry',shut:true}")&&!z.includes("{n:'洗樂洗衣坊',"));   /* 2026-11-11 改期望：洗樂洗衣坊搬到汀州路（X321），公館 G09 使用者選「先拉下鐵門」（X335）——原本查 {n:'洗樂洗衣坊', */   /* 2026-11-10 改期望：使用者 X320 公館 G09 正式名稱洗樂洗衣坊（原本查公館照舊叫「自助洗衣」）*/
    check('8 地點名 wz_tea＝帝大紅茶、wz_books＝溫州書屋；key 照舊（tea.key、fruit.key、SQ02 shop:）',PLACES.names.wz_tea==='帝大紅茶'&&PLACES.names.wz_books==='溫州書屋'&&WZS.AA364.tea.key==='巷口茶飲'&&WZS.AA364.tea.zone==='wz_tea'&&WZS.AA413.fruit.key==='阿忠水果'&&/SQ02:\{shop:'巷口茶飲',title:'帝大紅茶：打破的杯子'/.test(rd('src/sideq3d.js'))&&/'巷口茶飲':'帝大紅茶'/.test(rd('src/sideq3d.js')));
    const it=WZS.items413(), lb=it.map(x=>x.label);
    check('8 按鈕：看阿忠鮮果、看常在洗衣；水果打烊 toast「阿忠鮮果：09:00～22:00」',lb.includes('看阿忠鮮果')&&lb.includes('看常在洗衣')&&!lb.includes('看阿忠水果')&&rd('src/wzshops3d.js').includes("GM.toast('阿忠鮮果：09:00～22:00',4000)"),J(lb));
    check('8 店內偶遇：沛珊「在帝大紅茶」',SHOP_ENC.rows.filter(r=>r.spot==='wz_tea').some(r=>r.away==='在帝大紅茶')&&!SHOP_ENC.rows.some(r=>r.away==='在巷口茶飲'));
    const T=WZS.AA364.tea;
    check('8 帝大紅茶的菜單（第 4 節）：紅茶 中 30／大 35、奶茶 中 45／大 55、檸檬紅茶 中 45／大 55；招呼照舊、firstLine 換新',J(T.menu)===J([['紅茶（中）',30],['紅茶（大）',35],['奶茶（中）',45],['奶茶（大）',55],['檸檬紅茶（中）',45],['檸檬紅茶（大）',55]])&&T.first==='甜度冰塊？'&&T.known==='半糖少冰？'&&T.same==='好，一樣的。'&&T.done==='（你拿著飲料，沿著溫州街走回去。）'&&T.firstLine==='（價目牌只有三樣茶，每樣分中杯、大杯。你點完，後面已經排了兩個人。）');
    fresh('2026-03-03',15,'wenzhou'); G.eat={n:{'巷口茶飲':6},last:{'巷口茶飲':'珍珠奶茶'},first:{'巷口茶飲':1}}; said=[]; opts=[]; picks=['老樣子']; const m0=G.money; await WZS.interact(GM,{wzShop:'tea',kind:'window'});
    check('8 舊存檔上次點珍珠奶茶：「老樣子」＝奶茶（中）45、次數記在同一個 key',G.money===m0-45&&said.some(x=>x.t===OL('奶茶（中）'))&&EAT.count(G,'巷口茶飲')===7&&opts[0].includes('老樣子'),J({said,opts:opts[0]}));
    G.eat.ate=[{shop:'溫州街・巷口茶飲',item:'青茶',day:1},{shop:'溫州街・阿忠水果',item:'芭樂（一袋三顆）',day:1}];
    check('8 手機「吃過的」：溫州街・帝大紅茶、溫州街・阿忠鮮果（存下來的店名照舊）',/溫州街・帝大紅茶/.test(EAT.notesHTML(G))&&/溫州街・阿忠鮮果/.test(EAT.notesHTML(G)),EAT.notesHTML(G));
    const P=PLACES, MON=nextWd('2026-03-02',1), TUE=nextWd('2026-03-02',2), SUN=nextWd('2026-03-02',0);
    check('8 溫州書屋（第 5 節）：週二～週日 10:00–20:00、週一公休、颱風天關',P.isOpen('wz_books',10,TUE)&&!P.isOpen('wz_books',9.98,TUE)&&P.isOpen('wz_books',19.98,SUN)&&!P.isOpen('wz_books',20,SUN)&&!P.isOpen('wz_books',12,MON)&&!P.isOpen('wz_books',12,D('2025-10-13'))&&P.typhoonShops.includes('wz_books'));
    const L=WZS.BOOKS_LOOK, bl=(d,h)=>{ fresh(d,h,'wenzhou'); return WZS.booksLook(G); };
    check('8 「看書店的櫥窗」照時間換：營業中照舊、20:00 以後打烊、週一公休、颱風天',bl(TUE,15)===L.open&&L.open==='溫州書屋的櫥窗裡擺著一套舊版的《民法總則》，旁邊手寫的紙條：「學長姐留下來的，筆記很多」。'&&bl(TUE,21)===L.closed&&bl(TUE,9)===L.closed&&bl(MON,15)===L.rest&&bl(D('2025-10-13'),15)===L.typhoon,J([bl(TUE,21),bl(MON,15)]));
    check('8 zones3d：櫥窗按鈕的 look 是照時間的 getter（WZS.booksLook）',/label==='看書店的櫥窗'\); if\(bw&&typeof WZS!=='undefined'&&WZS\.booksLook\) Object\.defineProperty\(bw,'look'/.test(z));
    let doc=null; try{ doc=cp.execFileSync('git',['-C',ROOT,'show','6ee7ea3a5:docs/story_planning/AA_658_溫州街第二批_改名對照.md'],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){}
    if(!doc){ console.log('SKIP 8 讀不到 AA_658（6ee7ea3a5）'); skips++; }
    else { const ln=[T.firstLine,L.closed,L.rest,L.typhoon,'溫州書屋的櫥窗裡擺著一套舊版的《民法總則》','帝大紅茶：打破的杯子','阿忠鮮果：09:00～22:00','看阿忠鮮果','看常在洗衣','在帝大紅茶'], miss=ln.filter(t=>!doc.includes(t));
      const mm=doc.match(/`menu:(\[\[.*?\]\])`/);
      check('8 字都在 AA_658 裡（一字不差）、菜單和稿一樣',!miss.length&&!!mm&&mm[1].replace(/'/g,'"')===J(T.menu),J(miss)); } }
  console.log(fails?('FAILED '+fails):('ALL PASS'+(skips?'（SKIP '+skips+'）':''))); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
