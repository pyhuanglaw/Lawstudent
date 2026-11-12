// 木曜日（wz_mokuyobi）的系統與台詞（AA_617 第 1、3、4 節；AA_618 第 1 節 1-1～1-8，企劃線 ca876b23d；AA_645 補台詞，企劃線 ed6a4329d、第 6 節 350c90382；src/mokuyobi_sys3d.js）。不需要瀏覽器。
// 用法：node tests/mokuyobi_aa618_unit.js（稿用 git show 讀，台詞逐字對稿）。這是模擬（Node 裡跑真正的 STORY、INV、PLACES、LIBQ、EAT），不是真實玩家流程（瀏覽器測試照 D131 排使用者電腦）。
//   0 台詞都在稿上；1 營業時間、週二、颱風、名稱、快速前往要去過；2 店門關著擋；3 第一次進去；4 點東西；5 坐下記位子、一趟只問一次；6 老位子；7 讀書旁白、21:40 溫水；
//   8 熟了以後的閒聊；9 考試週（旁白、柏翰明軒作息、當面一句）；10 打烊（柏翰一起去兩點半）；11 邀約地點與見面；12 雨天；13 小聲；14 存檔欄位；
//   15～20 AA_645：稿；書櫃／唱片機／海報；先到的進門旁白（不分男女、窗邊滿了）；一般 22:00 打烊；答應的一句；芯慈
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
require('./alison.js');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='ca876b23d', SPEC_PATH='docs/story_planning/AA_618_木曜日與日常失速_台詞.md';
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INVITE_REPLIES|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM|SISG|SLOWREAD|LIBQ|EAT|EAT_LINES|MOKUYOBI_LAYOUT|MOKS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
/* 場景（src/mokuyobi3d.js）要 three.js 整套：這裡用同樣的常數換一個空的區域（常數和原檔對過，第 1 項）*/
const MSRC=fs.readFileSync(path.join(ROOT,'src/mokuyobi3d.js'),'utf8');
global.MOK3={OUT:{x:7.4,z:-2.85,yaw:0},IN:{x:-3.75,z:5.4,yaw:Math.PI,lv:0},zone:{id:'wz_mokuyobi',build(E){ return {seats:[]}; }}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,600):'')); if(!ok) fails++; };
const FILES=['src/data/mokuyobi_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/data/invite_replies.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/sis_grad3d.js',
  'src/data/dorm_room_layout.js','src/libquiet3d.js','src/story3d.js','src/classes3d.js','src/data/eat_lines.js','src/eat3d.js','src/slowread3d.js','src/mokuyobi_sys3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
let G=null, said=[], picks=[], opts=[], toasts=[], seatMenuCalls=[], entered=[];
const L=MOKUYOBI_LAYOUT;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:1,seat:null},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,addNPC(n){ this.npcs.push(n); return n; }};
const J=x=>JSON.stringify(x);
const GM={get G(){ return G; },E,D:{active:false},npc:{},enterN:1,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z,sp)=>{ entered.push([z,sp]); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(p){ if(p) p.seat=null; },
  seatMenu:async it=>{ seatMenuCalls.push(it); },
  say:async(who,t)=>{ if(typeof LIBQ!=='undefined') t=LIBQ.whisper(GM,who,t); said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(T); if(opts.length>80) throw new Error('選項一直重來'); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>w instanceof RegExp?w.test(x):x.includes(w)); if(k>=0){ picks.shift(); return k; } } return o.length-1; }};
const fresh=(day,hour,flags)=>{ G={v:3,stage:'law',day,hour,zone:'wz_mokuyobi',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],trips:[],stats:{classes:0},visited:{dorm:true}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; opts=[]; toasts=[]; seatMenuCalls=[]; entered=[]; GM.npc={}; E.npcs=[]; E.player.lv=1; E.player.seat=null; E.player.obj.position.x=0; E.player.obj.position.z=0; GM.enterN=(GM.enterN|0)+1; return G; };
const S4={fam:30,trust:20,comf:15,npcRom:10,rom:0};
const know=(id,rel)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); G.contacts[id]=1; };
const T=()=>said.map(s=>s.t);
(async()=>{
  // ===== 0. 稿 =====
  let spec=''; try{ spec=cp.execSync('git -c core.quotepath=off show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const s1=spec.slice(spec.indexOf('## 1.'),spec.indexOf('## 2.'));
  check('0. 讀得到稿 AA_618@'+SPEC_SHA+' 第 1 節',!!s1&&/木曜日/.test(s1),spec.slice(0,40));
  const AA_DIRECT={'（小聲）課輔班的小朋友說我寫的講義太多字。……他們說得對。':'AA-B 11-07 23:40 回 LAWWW-B（原稿「國中生說我寫的講義太多字。」；沛珊是國小課輔班，AA_614 32a5f7e12 說法統一）'};   /* 稿外、AA 直接給的句子 */
  const inSpec=t=>{ const x=String(t).replace(/^「|」$/g,''); return s1.includes(x)||!!AA_DIRECT[t]; };
  check('0. 稿外的那一句：沛珊木曜日「課輔班的小朋友」（原稿「國中生」那句不在程式裡）',MOKS.DATE.classmate_peishan.line==='（小聲）課輔班的小朋友說我寫的講義太多字。……他們說得對。'&&!J(MOKS.DATE).includes('國中生'));
  { const L0=MOKS.L, all=[]; for(const [,t] of L0.first) all.push(t); for(const m of L0.menu) all.push(m[2]); all.push(L0.water,L0.waterOk,L0.old,L0.oldYes,L0.oldNo,L0.oldNoBoss,L0.waterNarr,L0.waterBoss,L0.exam,L0.bhAsk,L0.bhGo,L0.bhHome,L0.bhBye,L0.meet);
    for(const t of L0.narr.concat(L0.chat,L0.rain)) all.push(t); for(const [,t] of L0.bh.concat(L0.mx)) all.push(t); for(const o of L0.rainOpts){ all.push(o.t,o.narr); }
    for(const id in MOKS.DATE){ all.push(MOKS.DATE[id].first,MOKS.DATE[id].line,MOKS.DATE[id].order); } for(const id in MOKS.FRIEND) all.push(MOKS.FRIEND[id]); for(const id in MOKS.RAIN) all.push(MOKS.RAIN[id]);
    const bad=all.filter(t=>!inSpec(t)); check('0. 程式裡的每一句（'+all.length+' 句）都在稿上（一字照抄）',all.length>=60&&!bad.length,J(bad));
    check('0. 點東西的品項、價錢照稿（焙茶拿鐵 150／焦糖布丁 120／巴斯克乳酪蛋糕 140／什麼都不點）',s1.includes('焙茶拿鐵 150／焦糖布丁 120／巴斯克乳酪蛋糕 140／什麼都不點')&&J(L0.menu.map(m=>[m[0],m[1]]))===J([['焙茶拿鐵',150],['焦糖布丁',120],['巴斯克乳酪蛋糕',140]])&&L0.none==='什麼都不點');
    check('0. 七位女主角、五位朋友、七位雨天各一句',Object.keys(MOKS.DATE).length===7&&Object.keys(MOKS.FRIEND).length===5&&Object.keys(MOKS.RAIN).length===7); }
  // ===== 1. 營業時間、名稱、快速前往 =====
  { const tue=TD('Y1S1',5,2), wed=TD('Y1S1',5,3);
    check('1. 週二公休、週三 13:00～22:00（12:59 沒開、13:00 開、21:59 開、22:00 關）',!PLACES.isOpen('wz_mokuyobi',15,tue)&&!PLACES.isOpen('wz_mokuyobi',12.98,wed)&&PLACES.isOpen('wz_mokuyobi',13,wed)&&PLACES.isOpen('wz_mokuyobi',21.98,wed)&&!PLACES.isOpen('wz_mokuyobi',22,wed));
    check('1. 颱風天關店（typhoonShops）、名稱表有木曜日、新生南路',PLACES.typhoonShops.includes('wz_mokuyobi')&&PLACES.names.wz_mokuyobi==='木曜日'&&PLACES.names.xinsheng==='新生南路');
    check('1. 關門說明照店家的寫法（今天公休、下次開門）',/^木曜日 今天公休。下次開門：明天 13:00。$/.test(PLACES.closedText('wz_mokuyobi',15,tue)),PLACES.closedText('wz_mokuyobi',15,tue));
    const q=PLACES.quickList().find(p=>p[0]==='wz_mokuyobi');
    check('1. 快速前往有「木曜日」（落點＝MOK3.IN，SPAWN-EXIT-1104 以後是樓梯第五、六階），不在一開始就知道的清單（自己走去過一次才出現）',!!q&&q[1]==='木曜日'&&q[2].x===-3.75&&q[2].z===5.4&&(q[2].lv|0)===0&&!PLACES.known0.wz_mokuyobi,J(q));
    check('1. 測試用的 MOK3 常數和 src/mokuyobi3d.js 一樣',/const OUT=\{x:7\.4,z:-2\.85,yaw:0\}/.test(MSRC)&&/const IN=\{x:-3\.75,z:5\.4,yaw:Math\.PI,lv:0\}/.test(MSRC));
    const pm=fs.readFileSync(path.join(ROOT,'src/placemap3d.js'),'utf8'), gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
    /* WZ-ENTRY-XINSHENG-1103（X199）：溫州街的引路連到新生南路——舊期待 wenzhou:['gongguan','cafe',…；新期待 wenzhou:['xinsheng','cafe',… */
    check('1. 手機地圖的溫州街圖釘有木曜日、導航連得到',pm.includes("['wz_mokuyobi','木曜日']")&&/wz_mokuyobi:'wenzhou'/.test(pm)&&/wenzhou:\['xinsheng','cafe','wz_mokuyobi'[^\]]*\]/.test(gd)&&/wz_mokuyobi:\['wenzhou'\]/.test(gd)); }
  // ===== 2. 店門 =====
  { fresh(TD('Y1S1',5,2),15); G.zone='wenzhou'; const r=await STORY.interact({exit:{to:'wz_mokuyobi',spawn:{}},label:'上二樓（木曜日）'},GM);
    check('2. 週二按「上二樓（木曜日）」：進不去、寫今天公休',r===true&&/今天公休/.test(toasts.join('')),J(toasts));
    fresh(TD('Y1S1',5,3),15); G.zone='wenzhou'; const r2=await STORY.interact({exit:{to:'wz_mokuyobi',spawn:{}}},GM);
    check('2. 週三 15:00 照常走得進去',r2===false&&!toasts.length,J(toasts)); }
  // ===== 3. 第一次進去 =====
  const wed=TD('Y1S1',5,3), inShop=()=>{ E.player.lv=1; E.player.obj.position.x=0; E.player.obj.position.z=0; };
  { fresh(wed,15); delete G.mokuyobi; inShop(); check('3. 走到店門以東＝要演進門',MOKS.doorDue(GM));
    const k=await MOKS.door(GM); check('3. 第一次（一個人）：兩句旁白＋老闆兩句，只一次',k==='first'&&J(T())===J(MOKS.L.first.map(x=>x[1]))&&said[2].who==='老闆'&&!!G.mokuyobi.first&&G.mokuyobi.n===1,J(said));
    check('3. 同一趟不再演',!MOKS.doorDue(GM)); GM.enterN++; said=[]; const k2=await MOKS.door(GM); check('3. 第二次來：沒有第一次那一段、次數 2',k2===null&&!said.length&&G.mokuyobi.n===2,k2);
    fresh(wed,15); delete G.mokuyobi; G.invites.push({id:'iv1',who:'heroine_01',place:'mokuyobi',zone:'wz_mokuyobi',day:wed,h:15,state:'going'}); said=[]; const k3=await MOKS.door(GM);
    check('3. 和人一起來：不演一個人的那一段（之後一個人來才演）',k3==='together'&&!said.length&&!G.mokuyobi.first); }
  // ===== 4. 點東西 =====
  { fresh(wed,15); picks=[0]; const m0=G.money; const r=await MOKS.order(GM);
    check('4. 選焙茶拿鐵：扣 150 元、那一句旁白、吃過的「溫州街・木曜日」',r==='焙茶拿鐵'&&G.money===m0-150&&T().includes('（焙茶拿鐵上面有一層很細的奶泡。）')&&!!(G.eat&&G.eat.ate.some(a=>a.shop==='溫州街・木曜日'&&a.item==='焙茶拿鐵')),J([r,G.money-m0,T()]));
    check('4. 選單四項照稿、錢不夠的灰掉',J(opts[0])===J(['焙茶拿鐵　150 元','焦糖布丁　120 元','巴斯克乳酪蛋糕　140 元','什麼都不點']),J(opts[0]));
    said=[]; picks=[3]; const m1=G.money; await MOKS.order(GM); check('4. 什麼都不點：祐廷「只要水。」→ 老闆「（小聲）好。」，不扣錢',G.money===m1&&said[0].who==='祐廷'&&/只要水。$/.test(said[0].t)&&said[1].who==='老闆'&&said[1].t==='（小聲）好。',J(said));
    said=[]; picks=[1]; G.money=100; await MOKS.order(GM); check('4. 錢不夠：不扣錢、說錢不夠',G.money===100&&toasts.includes('錢不夠'));
    fresh(wed,15); E.interactables=[]; MOK3.zone.build(E); const oi=E.interactables.find(q=>q.mokOrder);
    check('4. 吧檯有「點東西」（配置 interact order 的位置、二樓）',!!oi&&oi.x===-3.3&&oi.z===-4.95&&oi.lv===1,J(E.interactables));
    picks=[2]; const m2=G.money; const rr=await STORY.interact(oi,GM); check('4. 按「點東西」＝同一份選單',rr===true&&G.money===m2-140,J(T())); }
  // ===== 5、6 坐下、老位子 =====
  { fresh(wed,15); delete G.mokuyobi; const st=L.seats[2], seat={x:st.x,z:st.z,yaw:st.yaw,lv:1};
    picks=[0]; await STORY.onSeat(GM,seat); const o1=opts.length; await STORY.onSeat(GM,seat);
    check('5. 坐下：記這個位子；這一趟第一次坐下問點東西、第二次不問',G.mokuyobi.seats[2]===2&&G.mokuyobi.last===2&&o1===1&&opts.length===1,J([G.mokuyobi,opts.length]));
    E.interactables=[{x:st.x,z:st.z,seat,shop:'mokuyobi',study:true}];
    G.mokuyobi.first=1; GM.enterN++; said=[]; opts=[]; const k0=await MOKS.door(GM); check('5. 坐過兩次：還不問老位子',k0===null&&!said.length);
    GM.enterN++; picks=[0]; await STORY.onSeat(GM,seat);
    GM.enterN++; said=[]; opts=[]; picks=['好。']; seatMenuCalls=[]; const k1=await MOKS.door(GM);
    check('6. 坐過三次：一個人進門「（小聲）老位子？」→「好。」＝走過去坐那個位子',k1==='old'&&said[0].who==='老闆'&&said[0].t===MOKS.L.old&&J(opts[0])===J(['「好。」','「今天坐別的。」'])&&seatMenuCalls.length===1&&seatMenuCalls[0].seat===seat,J([k1,said,opts]));
    GM.enterN++; said=[]; picks=['今天坐別的。']; const k2=await MOKS.door(GM); check('6.「今天坐別的。」→ 老闆「（小聲）都可以。」',k2==='other'&&said[1].t==='（小聲）都可以。',J(said)); }
  // ===== 7. 讀書 =====
  { fresh(wed,17); delete G.mokuyobi; const got=[]; for(let i=0;i<5;i++){ STORY.onStudy(GM,1); got.push(STORY.studyNarr(GM)); }
    check('7. 讀完的旁白四句輪流（第五次回到第一句）',J(got)===J(MOKS.L.narr.concat([MOKS.L.narr[0]])),J(got));
    G.hour=22; STORY.onStudy(GM,1.5); const w=STORY.studyNarr(GM);
    check('7. 20:30～22:00 讀書（21:40 還在讀）：老闆放溫水＋「十點打烊。……慢慢收。」',J(w)===J(['（老闆放了一杯溫水在你桌上。）',['老闆','（小聲）十點打烊。……慢慢收。']]),J(w));
    G.day=wed+1; G.hour=22; STORY.onStudy(GM,1.5); const w2=STORY.studyNarr(GM); check('7. 同一學期第二次：不再放（一學期一次）',typeof w2==='string'&&MOKS.L.narr.includes(w2),J(w2));
    G.day=TD('Y1S2',3,3); G.hour=21.6; STORY.onStudy(GM,1); const w3=STORY.studyNarr(GM); check('7. 讀到 21:36 結束（沒到 21:40）：沒有溫水',typeof w3==='string',J(w3));
    G.hour=21.9; STORY.onStudy(GM,1); const w4=STORY.studyNarr(GM); check('7. 下一學期：又有一次',Array.isArray(w4),J(w4));
    G.zone='cafe'; check('7. 別的地方不用木曜日的旁白',!MOKS.L.narr.includes(STORY.studyNarr(GM))); }
  // ===== 8. 閒聊 =====
  { fresh(wed,15); G.mokuyobi={n:7,seats:{}}; picks=[0]; await MOKS.order(GM); const a=T().filter(t=>MOKS.L.chat.includes(t)).length;
    G.mokuyobi.n=8; said=[]; picks=[0]; await MOKS.order(GM); const b=T().filter(t=>MOKS.L.chat.includes(t)); said=[]; picks=[0]; await MOKS.order(GM); const c=T().filter(t=>MOKS.L.chat.includes(t)).length;
    G.day=TD('Y1S2',3,3); said=[]; picks=[0]; await MOKS.order(GM); const d=T().filter(t=>MOKS.L.chat.includes(t));
    check('8. 來過八次以上才有；一學期一句、輪流（第二學期第二句）',a===0&&J(b)===J([MOKS.L.chat[0]])&&c===0&&J(d)===J([MOKS.L.chat[1]]),J([a,b,c,d])); }
  // ===== 9. 考試那兩週 =====
  { const ex=TD('Y1S1',8,1), ex16=TD('Y1S1',16,4), wk5=TD('Y1S1',5,1);
    fresh(ex,15); G.mokuyobi={n:3,seats:{},first:1}; const k=await MOKS.door(GM); const s1x=T(); GM.enterN++; said=[]; const k2=await MOKS.door(GM);
    check('9. 考試週一個人進門：「（今天每一桌都坐了人。只剩吧檯旁邊一個位子。）」一天一次',k==='exam'&&J(s1x)===J([MOKS.L.exam])&&k2===null&&!said.length,J([k,s1x,k2]));
    const at=(id,day,h)=>STORY.schedEnt(CHARACTERS[id],Object.assign({},G,{day,hour:h,weekday:wdOf(day),flags:G.flags}));
    const bh=at('classmate_bohan',ex,15), bh16=at('classmate_bohan',ex16,16), bhT=at('classmate_bohan',TD('Y1S1',8,2),15), bh5=at('classmate_bohan',wk5,15), mx=at('classmate_mingxuan',TD('Y1S1',8,4),16), mxW=at('classmate_mingxuan',ex,16);
    check('9. 柏翰：考試週 14:00～22:00 在木曜日念書（週二公休不在、平常週不在）',!!bh&&bh.zone==='wz_mokuyobi'&&bh.act==='read'&&!!bh16&&bh16.zone==='wz_mokuyobi'&&!(bhT&&bhT.mokuyobi)&&!(bh5&&bh5.mokuyobi),J([bh&&bh.zone,bh16&&bh16.zone,bhT&&bhT.zone,bh5&&bh5.zone]));
    check('9. 明軒：考試週週四 15:00～19:00 在木曜日（週一不在）',!!mx&&mx.zone==='wz_mokuyobi'&&!(mxW&&mxW.mokuyobi),J([mx&&mx.zone,mxW&&mxW.zone]));
    fresh(ex,15); said=[]; await MOKS.greet(GM,{name:'柏翰'},'classmate_bohan'); const g1=T(); said=[]; await MOKS.greet(GM,{name:'柏翰'},'classmate_bohan');
    check('9. 跟柏翰說話先說稿上那一句（旁白＋「（小聲）總圖位子搶不到。」），一天一次',J(g1)===J(MOKS.L.bh.map(x=>x[1]))&&!said.length,J(g1));
    fresh(TD('Y1S1',8,4),16); said=[]; await MOKS.greet(GM,{name:'明軒'},'classmate_mingxuan'); check('9. 明軒那一句',J(T())===J([MOKS.L.mx[0][1]]),J(T()));
    check('9. PRE_TALK 有接',STORY.PRE_TALK.includes(MOKS.greet)&&STORY.TICKS.includes(MOKS.tick)); }
  // ===== 10. 打烊 =====
  { const ex=TD('Y1S1',8,1); fresh(ex,22.02); know('classmate_bohan',S4); E.player.seat={x:0,z:0}; picks=['去。']; const r=await MOKS.closeOut(GM);
    const iv=G.invites.find(q=>q.who==='classmate_bohan');
    check('10. 考試週 22:00、柏翰在：「兩點半還開。你要去嗎？」→「去。」＝一起走過去兩點半（邀約 going）、出來在 B4 門口',r==='cafe'&&said[0].t==='兩點半還開。你要去嗎？'&&!!iv&&iv.place==='cafe'&&iv.state==='going'&&entered[0][0]==='wenzhou'&&entered[0][1].x===7.4&&!E.player.seat,J([r,said,iv,entered]));
    fresh(ex,22.02); know('classmate_bohan',S4); picks=['我回去了。']; const r2=await MOKS.closeOut(GM);
    check('10.「我回去了。」→ 柏翰「嗯，明天見。」',r2==='home'&&said[1].t==='嗯，明天見。'&&!G.invites.length,J(said));
    fresh(TD('Y1S1',5,3),3); const r3=await MOKS.closeOut(GM); check('10. 還沒開（讀檔回到店裡）：請你出來＋開放時間',r3==='out'&&!said.length&&/木曜日/.test(toasts.join(''))&&entered[0][0]==='wenzhou',J([r3,toasts]));
    fresh(TD('Y1S1',5,3),22.02); check('10. tick：打烊了人在店裡＝開演',MOKS.tick(GM)===true); await new Promise(r=>setTimeout(r,10)); check('10. tick 演完人在溫州街',G.zone==='wenzhou'); }
  // ===== 11. 邀約 =====
  { const P=INV.place('mokuyobi'), sat=TD('Y1S1',5,6), tue=TD('Y1S1',5,2);
    check('11. 木曜日是邀約地點（reason、一小時、週二休、13:00～22:00、兩個人一起坐下）',!!P&&P.zone==='wz_mokuyobi'&&P.kind==='reason'&&J(P.off)===J([2])&&J(P.hours)===J([13,22])&&P.seatPose==='sit',J(P));
    fresh(sat,10); G.zone='dorm'; know('heroine_01',S4); check('11. 還沒去過：清單上沒有（show）',!P.show(G,'heroine_01')); G.visited.wz_mokuyobi=true; check('11. 去過以後有',P.show(G,'heroine_01'));
    const d=INV.decide(G,'heroine_01','mokuyobi',tue,15); check('11. 約週二：沒開（系統說週二休）',d.res!=='accept'&&(d.why==='closed'),J(d));
    const iv=INV.accept(G,'heroine_01','mokuyobi',sat,15,{by:'player'}); G.zone='wz_mokuyobi'; G.day=sat; G.hour=15; said=[]; await INV.meet(GM,iv,null);
    check('11. 以安第一次：她先到的旁白（AA_645：名字代入）＋「（小聲）我常來這裡讀書。……第一次跟人一起來。」',T().includes('（以安坐在窗邊那桌，已經點好了。）')&&!T().includes(MOKS.L.meet)&&T().includes(MOKS.DATE.heroine_01.first)&&iv.state==='done',J(T()));
    MOKS.rand=()=>0.1; const iv2=INV.accept(G,'heroine_01','mokuyobi',sat,17,{by:'player'}); said=[]; await INV.meet(GM,iv2,null);
    check('11. 第二次：隨機一次＝那一句（不再說第一次那句）',T().includes(MOKS.DATE.heroine_01.line)&&!T().includes(MOKS.DATE.heroine_01.first),J(T()));
    MOKS.rand=()=>0.9; const iv3=INV.accept(G,'heroine_01','mokuyobi',sat,19,{by:'player'}); said=[]; await INV.meet(GM,iv3,null); check('11. 沒抽到就不說',!T().includes(MOKS.DATE.heroine_01.line));
    know('zhe',S4); const iz=INV.accept(G,'zhe','mokuyobi',sat,20,{by:'player'}); said=[]; await INV.meet(GM,iz,null);
    check('11. 阿哲（朋友）一句；他先到的旁白不分男女（AA_645 第 2 節）',T().includes(MOKS.FRIEND.zhe)&&T().includes('（阿哲坐在窗邊那桌，已經點好了。）'),J(T()));
    const iw=INV.accept(G,'heroine_01','mokuyobi',sat,20,{by:'player',now:true}); said=[]; MOKS.rand=()=>0.1; await INV.meet(GM,iw,null); check('11. 一起走過來的：沒有「先到」那一句',!T().some(t=>/坐在(窗邊|靠書櫃)那桌，已經點好了/.test(t)),J(T()));
    MOKS.rand=Math.random; }
  // ===== 12. 雨天 =====
  { const sat=TD('Y1S1',6,6); fresh(sat,17,{dating_heroine_05:true}); G.weather='rain'; G.invites.push({id:'ivr',who:'heroine_05',place:'mokuyobi',zone:'wz_mokuyobi',day:sat,h:15,state:'done'});
    E.player.lv=0; picks=['等雨小一點。']; const h0=G.hour; const r=await STORY.interact({exit:{to:'wenzhou',spawn:{}},label:'離開木曜日'},GM);
    check('12. 交往中、在木曜日約會、下雨、離開：兩句旁白＋學姊那一句＋選「等雨小一點。」',r===false&&J(T())===J(MOKS.L.rain.concat([MOKS.RAIN.heroine_05,MOKS.L.rainOpts[0].narr]))&&Math.abs(G.hour-h0-10/60)<1e-6,J(T()));
    said=[]; await STORY.interact({exit:{to:'wenzhou',spawn:{}}},GM); check('12. 每段關係一次',!said.length);
    fresh(sat,17); G.weather='rain'; G.invites.push({id:'ivr2',who:'heroine_01',place:'mokuyobi',zone:'wz_mokuyobi',day:sat,h:15,state:'done'}); await STORY.interact({exit:{to:'wenzhou',spawn:{}}},GM);
    check('12. 沒交往：沒有',!said.length);
    fresh(sat,17,{dating_heroine_01:true}); G.invites.push({id:'ivr3',who:'heroine_01',place:'mokuyobi',zone:'wz_mokuyobi',day:sat,h:15,state:'done'}); await STORY.interact({exit:{to:'wenzhou',spawn:{}}},GM);
    check('12. 沒下雨：沒有',!said.length);
    const srcS=fs.readFileSync(path.join(ROOT,'src/mokuyobi_sys3d.js'),'utf8'); check('12. CG 登錄點：CG_REGISTRY 有那張才出（現在沒有圖）',/CG_REGISTRY\[S\.RAIN_CG\(id\)\]/.test(srcS)&&!(typeof CG_REGISTRY!=='undefined'&&CG_REGISTRY[MOKS.RAIN_CG('heroine_01')])); }
  // ===== 13. 小聲 =====
  { fresh(TD('Y1S1',5,3),15); E.player.lv=1; const w=(who,t)=>LIBQ.whisper(GM,who,t);
    check('13. 二樓店裡：說話加（小聲）、已經寫了的不重複、旁白和手機不加',w({name:'以安'},'好。')==='（小聲）好。'&&w({name:'以安'},'「（小聲）好，讀書。」')==='「（小聲）好，讀書。」'&&w(null,'（雨聲。）')==='（雨聲。）'&&w({name:'以安（手機）'},'好。')==='好。',J([w({name:'以安'},'好。')]));
    E.player.lv=0; check('13. 一樓樓梯口不加',w({name:'以安'},'好。')==='好。'); E.player.lv=1; LIBQ.loudBegin(); const lq=w({name:'以安'},'好。'); LIBQ.loudEnd(); check('13. loud 的段落不加',lq==='好。');
    G.zone='cafe'; check('13. 別的店不加',w({name:'以安'},'好。')==='好。'); }
  // ===== 14. 存檔 =====
  { const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), line=g3.split('\n').find(l=>/function defaults\(/.test(l))||'';
    check('14. 新遊戲的預設有 mokuyobi:{n:0,seats:{}}（舊存檔 migrate 照 defaults 補）',/mokuyobi:\{n:0,seats:\{\}\}/.test(line)&&/function migrate\(s\)\{ const d=defaults\(s\.name\);[^\n]*for\(const k in d\)\{ if\(s\[k\]===undefined\|\|s\[k\]===null\) s\[k\]=d\[k\];/.test(g3));
    const g={day:1}; MOKS.rec(g); const g2={day:1,mokuyobi:'壞'}; MOKS.rec(g2); const g4={day:1,mokuyobi:{n:-3,seats:[1]}}; MOKS.rec(g4);
    check('14. 沒有、壞掉的欄位重設（從零開始）',g.mokuyobi.n===0&&J(g.mokuyobi.seats)==='{}'&&g2.mokuyobi.n===0&&g4.mokuyobi.n===0&&!Array.isArray(g4.mokuyobi.seats)); }
  // ===== 15～20. AA_645（企劃線 ed6a4329d；第 6 節三題 350c90382：叫法、明軒那句、海報第三句）=====
  let s645=''; try{ s645=cp.execSync('git -c core.quotepath=off show 350c90382:"docs/story_planning/AA_645_木曜日補台詞_回LAWWW.md"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const in645=t=>s645.includes(String(t).replace(/^「|」$/g,''));
  { const L0=MOKS.L, all=[].concat(L0.look.bookcase,L0.look.record,L0.look.poster,L0.xc.map(x=>x[1]),[L0.meetFmt,MOKS.ACC0],Object.values(INVITE_DATA.mokuyobiAcc||{}));
    /* 2026-11-11（X324 D 區，AA_784_invites.json）：invites.js 的答應句照覆蓋層拿掉刪節號、換句——對稿時「新字的舊字在稿上」也算（tests/overlay_expect.js 的 inDoc）。舊期望：字本身在稿上 */ const bad=all.filter(t=>!require('./overlay_expect.js').inDoc('invites',null,t,in645)); check('15. 讀得到 AA_645@350c90382；AA_645 的每一句（'+all.length+' 句）都在稿上',!!s645&&all.length===22&&!bad.length&&!L0.close,J(bad));
    check('15. 書櫃三句、唱片機三句、海報三句（第 6 節第 3 點補第三句）；答應十人各一句',L0.look.bookcase.length===3&&L0.look.record.length===3&&L0.look.poster.length===3&&Object.keys(INVITE_DATA.mokuyobiAcc).length===10);
    check('15.「靠書櫃那桌」「窗邊那桌」都在稿上',s645.includes('窗邊那桌」改「靠書櫃那桌」')); }
  { fresh(wed,15); E.interactables=[]; MOK3.zone.build(E); const lk=k=>E.interactables.find(q=>q.mokLook===k);
    check('16. 書櫃、唱片機、海報有按鈕（配置 interact 的位置、label、二樓）',['bookcase','record','poster'].every(k=>{ const q=lk(k), d=L.interact.find(x=>x.kind===k); return !!q&&q.x===d.x&&q.z===d.z&&q.lv===1&&q.label===d.label; }),J(E.interactables));
    for(const k of ['bookcase','record','poster']){ const got=[]; for(let i=0;i<40;i++){ said=[]; await STORY.interact(lk(k),GM); got.push(T()[0]); }
      const rp=got.some((t,i)=>i>0&&t===got[i-1]), all=MOKS.L.look[k].every(t=>got.includes(t)), bare=got.every(t=>MOKS.L.look[k].includes(t));
      check('16. '+k+'：40 次都是稿上的句子、每一句都出現過、同一句沒有連續出（旁白不加小聲）',!rp&&all&&bare,J(got.slice(0,8))); } }
  { const sat=TD('Y1S1',7,6); fresh(sat,15); know('heroine_02',S4); G.visited.wz_mokuyobi=true;
    const win=L.seats.filter(s=>s.table===1||s.table===2);
    check('17. 窗邊＝配置 table 1、2（label「坐窗邊」的四個位子）',win.length===4&&win.every(s=>s.label==='坐窗邊')&&J(MOKS.WIN_TABLES)===J([1,2]));
    const nm='芷若';   /* AA_645 第 6 節第 1 點：祐廷平常的叫法，不用全名 */ check('17. 窗邊沒滿：「（'+nm+'坐在窗邊那桌，已經點好了。）」',MOKS.meetLine(GM,'heroine_02')==='（'+nm+'坐在窗邊那桌，已經點好了。）');
    E.npcs=[{seat:{x:win[0].x,z:win[0].z,lv:1}}]; check('17. 只有一桌有人：還是窗邊',MOKS.meetLine(GM,'heroine_02').includes('窗邊那桌'));
    E.npcs.push({seat:{x:win[3].x,z:win[3].z,lv:1}}); check('17. 窗邊兩桌都有人：「靠書櫃那桌」',MOKS.meetLine(GM,'heroine_02')==='（'+nm+'坐在靠書櫃那桌，已經點好了。）',MOKS.meetLine(GM,'heroine_02'));
    E.npcs=[]; }
  { fresh(TD('Y1S1',5,3),22.02); const r=await MOKS.closeOut(GM);
    check('18. 一般的 22:00 打烊：老闆「我們今天要打烊了。」（AA_700；二樓店裡照第 10 點小聲）、不另外出旁白，出來在 B4 門口（沒有開放時間的提示）',r==='close'&&J(said)===J([{who:'老闆',t:'（小聲）我們今天要打烊了。'}])&&entered[0][0]==='wenzhou'&&!toasts.length,J([r,said,toasts]));
    fresh(TD('Y1S1',5,4),22); STORY.onStudy(GM,1.5); const w=STORY.studyNarr(GM); G.hour=22.02; said=[]; const r2=await MOKS.closeOut(GM);
    check('18. 當晚出過 21:40 溫水：照樣老闆那一句（AA_700：所有店打烊都一句）',Array.isArray(w)&&r2==='close'&&J(T())===J(['（小聲）我們今天要打烊了。']),J([w,T()]));
    fresh(TD('Y1S1',5,4),22.02); G.mokuyobi={n:1,seats:{},water:'Y1S1',waterDay:TD('Y1S1',5,4)-1}; said=[]; await MOKS.closeOut(GM); check('18. 前一晚的溫水：一樣一句',J(T())===J(['（小聲）我們今天要打烊了。']),J(T())); }
  { const sat=TD('Y1S1',7,6), P=INV.place('mokuyobi'); const ok=[];
    for(const id of Object.keys(INVITE_DATA.mokuyobiAcc)){ fresh(sat,10,id==='kexin'?{dating_kexin:true}:{}); G.zone='dorm'; G.visited.wz_mokuyobi=true; know(id,S4); let slot=null; for(const h of [14,15,16,17,18,19,20,13]) if(slot==null&&INV.freeAt(G,id,P,sat,h)) slot=h;
      const d=slot==null?null:INV.personal(G,id,P,sat,slot,INV.decide(G,id,'mokuyobi',sat,slot)); ok.push([id,slot,d&&d.res,d&&J(d.lines)===J([INVITE_DATA.mokuyobiAcc[id]]),d&&d.lines]); }
    const bad=ok.filter(x=>x[2]==='accept'&&!x[3]), acc=ok.filter(x=>x[2]==='accept');
    check('19. 約去木曜日答應：十人各自那一句（答應的 '+acc.length+'／10）',!bad.length&&acc.length>=7,J(ok));
    fresh(sat,10); G.zone='dorm'; G.visited.wz_mokuyobi=true; know('yu',S4); let slot=null; for(const h of [14,15,16,17,18,19,20]) if(slot==null&&INV.freeAt(G,'yu',P,sat,h)) slot=h;
    const d=INV.personal(G,'yu',P,sat,slot,INV.decide(G,'yu','mokuyobi',sat,slot)); check('19. 沒列的人（Alison）答應：一般那句「好啊。那裡要小聲一點喔。」',d.res==='accept'&&J(d.lines)===J([MOKS.ACC0]),J([slot,d]));
    const dt=INV.personal(G,'yu',P,TD('Y1S1',7,2),15,INV.decide(G,'yu','mokuyobi',TD('Y1S1',7,2),15)); check('19. 不答應（週二）照一般回覆：不是答應句',dt.res!=='accept'&&!(dt.lines||[]).includes(MOKS.ACC0),J(dt)); }
  { const ex=TD('Y1S1',8,1), ex3=TD('Y1S1',8,3), ex4=TD('Y1S1',8,4), wk5=TD('Y1S1',5,1); fresh(ex,15);
    const at=(day,h)=>STORY.schedEnt(CHARACTERS.classmate_xinci,Object.assign({},G,{day,hour:h,weekday:wdOf(day),flags:G.flags}));
    const a=at(ex,15), b=at(ex3,16.5), c=at(ex4,15), d=at(wk5,15), e=at(ex,17.5);
    check('20. 芯慈：考試週週一、週三 14:00～17:00 在木曜日（週四、17:00 以後、平常週不在）',!!a&&a.zone==='wz_mokuyobi'&&!!b&&b.zone==='wz_mokuyobi'&&!(c&&c.mokuyobi)&&!(d&&d.mokuyobi)&&!(e&&e.mokuyobi),J([a,b,c,d,e].map(x=>x&&x.zone)));
    said=[]; await MOKS.greet(GM,{name:'芯慈'},'classmate_xinci'); const g=T(); said=[]; await MOKS.greet(GM,{name:'芯慈'},'classmate_xinci');
    check('20. 看到芯慈的一句「（小聲）這裡的燈剛好，看書不累。」（一天一次）',J(g)===J(['（小聲）這裡的燈剛好，看書不累。'])&&!said.length,J(g));
    const mx=STORY.schedEnt(CHARACTERS.classmate_mingxuan,Object.assign({},G,{day:TD('Y1S1',8,2),hour:16,weekday:2,flags:G.flags})); check('20. 明軒只排週四（週二不在木曜日）',!(mx&&mx.mokuyobi)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
