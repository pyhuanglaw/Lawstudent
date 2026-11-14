// 日常失速（wz_offbeat）的系統與台詞（AA_617 第 3、4 節的日常失速；AA_618 第 2 節，企劃線 ca876b23d；src/offbeat_sys3d.js）。不需要瀏覽器。
// 用法：node tests/offbeat_aa618_unit.js（稿用 git show 讀，台詞逐字對稿；AA_648 補台詞對企劃線 1ebf7a590）。這是模擬（Node 裡跑真正的 STORY、INV、PLACES、EAT），不是真實玩家流程（瀏覽器測試照 D131 排使用者電腦）。
//   0 台詞都在稿上；1 營業時間、颱風、名稱、快速前往、地圖；2 店門關著擋；3 第一次進去；4 點東西（吧檯、第一次坐下）；5 店長；6 八卦；7 偶遇；8 打烊；9 邀約地點；10 不加小聲、沒有讀書；11 存檔欄位
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
require('./alison.js');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='ca876b23d', SPEC_PATH='docs/story_planning/AA_618_木曜日與日常失速_台詞.md';
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INVITE_REPLIES|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM|SISG|SLOWREAD|LIBQ|EAT|EAT_LINES|DAILY_OFFBEAT_LAYOUT|OFFB|BGN|EXAM_BANK)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
/* 區域本身（zones3d.js 的 wzShop('offbeat')）要 three.js 整套：這裡換一個空的區域（OFFB 包在它的 build 外面加按鈕）*/
global.Z3={ZONES:{wz_offbeat:{id:'wz_offbeat',build(E){ return {seats:[]}; }}}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,600):'')); if(!ok) fails++; };
const FILES=['src/data/daily_offbeat_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/exam_bank.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/data/invite_replies.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/sis_grad3d.js',
  'src/data/dorm_room_layout.js','src/libquiet3d.js','src/story3d.js','src/classes3d.js','src/data/eat_lines.js','src/eat3d.js','src/slowread3d.js','src/bgnight3d.js','src/offbeat_sys3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const wdOf=d=>CALENDAR.dateOf(d).wd%7, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
let G=null, said=[], picks=[], opts=[], toasts=[], entered=[];
const L=DAILY_OFFBEAT_LAYOUT;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0,seat:null},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,addNPC(n){ this.npcs.push(n); return n; }};
const J=x=>JSON.stringify(x);
const GM={get G(){ return G; },E,D:{active:false},npc:{},enterN:1,
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z,sp)=>{ entered.push([z,sp]); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(p){ if(p) p.seat=null; },
  say:async(who,t)=>{ if(typeof LIBQ!=='undefined') t=LIBQ.whisper(GM,who,t); said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const T=o.map(q=>q.t||q.text); opts.push(T); if(opts.length>80) throw new Error('選項一直重來'); if(picks.length){ const w=picks[0]; if(typeof w==='number'){ picks.shift(); return w; } const k=T.findIndex(x=>w instanceof RegExp?w.test(x):x.includes(w)); if(k>=0){ picks.shift(); return k; } } return o.length-1; }};
const fresh=(day,hour,flags)=>{ G={v:3,stage:'law',day,hour,zone:'wz_offbeat',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,examSeed:12345,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],trips:[],stats:{classes:0},visited:{dorm:true}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; picks=[]; opts=[]; toasts=[]; entered=[]; GM.npc={}; E.npcs=[]; E.player.seat=null; GM.enterN=(GM.enterN|0)+1; return G; };
const S4={fam:30,trust:20,comf:15,npcRom:10,rom:0};
const know=(id,rel)=>{ SOCIAL.remember(id,'FIRST_MET',''); Object.assign(SOCIAL.rel(id),rel); G.contacts[id]=1; };
const T=()=>said.map(s=>s.t);
(async()=>{
  // ===== 0. 稿 =====
  let spec=''; try{ spec=cp.execSync('git -c core.quotepath=off show '+SPEC_SHA+':"'+SPEC_PATH+'"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const s2=spec.slice(spec.indexOf('## 2.'));
  check('0. 讀得到稿 AA_618@'+SPEC_SHA+' 第 2 節',!!s2&&/日常失速/.test(s2),spec.slice(0,40));
  const inSpec=t=>s2.includes(String(t).replace(/^「|」$/g,''));
  { const L0=OFFB.L, all=[]; for(const [,t] of L0.first) all.push(t); for(const m of L0.menu.slice(1)) if(m[2]) all.push(m[2]);   /* 冰拿鐵那一句是 AA_648（第 13 項）*/ all.push(L0.catFirst,L0.catAgain); for(const t of L0.pet.concat(L0.gossip)) all.push(t); for(const id in L0.enc) for(const [,t] of L0.enc[id]) all.push(t);
    const bad=all.filter(t=>!inSpec(t)); check('0. 程式裡的每一句（'+all.length+' 句）都在稿上（一字照抄）',all.length===20&&!bad.length,J(bad));
    check('0. 菜單、價錢照稿（冰拿鐵 120／檸檬氣泡美式 130／肉桂捲 110／明太子厚片 140）',s2.includes('冰拿鐵 120／檸檬氣泡美式 130／肉桂捲 110／明太子厚片 140')&&J(L0.menu.map(m=>[m[0],m[1]]))===J([['冰拿鐵',120],['檸檬氣泡美式',130],['肉桂捲',110],['明太子厚片',140]]));
    check('0.「看看」「摸摸」照稿',s2.includes('「看看」')&&s2.includes('「摸摸」')&&L0.catLook==='看看'&&L0.catPet==='摸摸'); }
  // ===== 1. 營業時間、名稱、快速前往 =====
  { const d=TD('Y1S1',5,2);
    check('1. 每天 13:00～01:00（週二也開；12:59 沒開、13:00 開、00:59 開、01:00 關）',PLACES.isOpen('wz_offbeat',15,d)&&!PLACES.isOpen('wz_offbeat',12.98,d)&&PLACES.isOpen('wz_offbeat',13,d)&&PLACES.isOpen('wz_offbeat',24.98,d)&&PLACES.isOpen('wz_offbeat',0.98,d)&&!PLACES.isOpen('wz_offbeat',1,d)&&!PLACES.isOpen('wz_offbeat',3,d));
    check('1. 颱風天關、名稱「日常失速」',PLACES.typhoonShops.includes('wz_offbeat')&&PLACES.names.wz_offbeat==='日常失速');
    const q=PLACES.quickList().find(p=>p[0]==='wz_offbeat'); check('1. 快速前往有「日常失速」（落點＝配置的 spawn），不在一開始就知道的清單',!!q&&q[2].x===L.spawn.x&&q[2].z===L.spawn.z&&!PLACES.known0.wz_offbeat,J(q));
    const pm=fs.readFileSync(path.join(ROOT,'src/placemap3d.js'),'utf8'), gd=fs.readFileSync(path.join(ROOT,'src/guide3d.js'),'utf8');
    check('1. 手機地圖的溫州街圖釘有日常失速、導航連得到',pm.includes("['wz_offbeat','日常失速']")&&/wz_offbeat:'wenzhou'/.test(pm)&&/'wz_offbeat'\]/.test(gd)&&/wz_offbeat:\['wenzhou'\]/.test(gd)); }
  // ===== 2. 店門 =====
  { fresh(TD('Y1S1',5,3),10); G.zone='wenzhou'; const r=await STORY.interact({exit:{to:'wz_offbeat',spawn:{}}},GM);
    check('2. 10:00 按「進去日常失速」：進不去、寫開放時間（今天 13:00 開門）',r===true&&toasts[0]==='日常失速 開放時間 每天 13:00–01:00。現在沒有開，今天 13:00 開門。',J(toasts));
    fresh(TD('Y1S1',5,3),1.5); G.zone='wenzhou'; await STORY.interact({exit:{to:'wz_offbeat',spawn:{}}},GM); check('2. 01:30：今天 13:00 開門',/今天 13:00 開門/.test(toasts[0]||''),J(toasts));
    fresh(TD('Y1S1',5,3),23.5); G.zone='wenzhou'; const r2=await STORY.interact({exit:{to:'wz_offbeat',spawn:{}}},GM); check('2. 23:30 照常進得去',r2===false&&!toasts.length,J(toasts)); }
  // ===== 3. 第一次進去 =====
  const wed=TD('Y1S1',5,3);
  { fresh(wed,15); delete G.offbeat; check('3. 進來＝要演進門',OFFB.doorDue(GM)); const k=await OFFB.door(GM);
    check('3. 第一次（一個人）：兩句旁白＋店員一句',k==='first'&&J(T())===J(OFFB.L.first.map(x=>x[1]))&&said[2].who==='店員'&&G.offbeat.n===1,J(said));
    GM.enterN++; said=[]; const k2=await OFFB.door(GM); check('3. 第二次：沒有',k2===null&&!said.length&&G.offbeat.n===2);
    fresh(wed,15); delete G.offbeat; G.invites.push({id:'iv1',who:'zhe',place:'offbeat',zone:'wz_offbeat',day:wed,h:15,state:'going'}); const k3=await OFFB.door(GM); check('3. 和人一起來：不演',k3==='together'&&!said.length&&!G.offbeat.first); }
  // ===== 4. 點東西 =====
  { fresh(wed,15); E.interactables=[]; Z3.ZONES.wz_offbeat.build(E); const oi=E.interactables.find(q=>q.offOrder), ci=E.interactables.find(q=>q.offCat);
    check('4. 吧檯「點東西吃」、「看看店長／摸摸店長」的按鈕在配置的位置（AA_648 以後還有公告板、佈告欄、桌遊櫃、玩桌遊、找店員聊天：第 14～17 項）',!!oi&&oi.x===-1.2&&oi.z===-2.55&&!!ci&&ci.x===2.95&&E.interactables.length===7,J(E.interactables));
    picks=[2]; const m0=G.money; await STORY.interact(oi,GM); check('4. 肉桂捲：扣 110、那一句、吃過的「溫州街・日常失速」',G.money===m0-110&&J(T())===J(['（肉桂捲是熱的，糖霜一直滴下來。）'])&&G.eat.ate.some(a=>a.shop==='溫州街・日常失速'&&a.item==='肉桂捲'),J(T()));
    check('4. 選單照稿＋不用了',J(opts[0])===J(['冰拿鐵　120 元','檸檬氣泡美式　130 元','肉桂捲　110 元','明太子厚片　140 元','不用了']),J(opts[0]));
    said=[]; picks=[0]; const m1=G.money; await OFFB.order(GM); check('4. 冰拿鐵：扣 120（點完那一句是 AA_648，第 16 項）',G.money===m1-120&&said.length===1);
    said=[]; picks=[4]; const m2=G.money; await OFFB.order(GM); check('4. 不用了：不扣錢',G.money===m2);
    fresh(wed,15); const st=L.seats[20], seat={x:st.x,z:st.z,yaw:st.yaw,lv:0}; picks=[3]; await STORY.onSeat(GM,seat); const n1=opts.length; await STORY.onSeat(GM,seat);
    check('4. 這一趟第一次坐下問點東西、第二次不問',n1===1&&opts.length===1&&T().includes('（明太子厚片烤得很脆。你吃到最後一口才發現嘴角都是。）'),J([opts,T()])); }
  // ===== 5. 店長 =====
  { fresh(wed,15); delete G.offbeat; picks=['看看']; await OFFB.cat(GM); picks=['看看']; await OFFB.cat(GM); G.day++; picks=['看看']; await OFFB.cat(GM);
    check('5.「看看」：每天第一次「（店長睜開一隻眼睛看你，又閉上。）」，之後「（店長在睡覺。）」',J(T())===J([OFFB.L.catFirst,OFFB.L.catAgain,OFFB.L.catFirst]),J(T()));
    check('5. 選項「看看」「摸摸」',J(opts[0])===J(['看看','摸摸']));
    said=[]; for(let i=0;i<30;i++){ picks=['摸摸']; await OFFB.cat(GM); } const got=T();
    check('5.「摸摸」：三句隨機、每一句都出現、同一句不連續',got.every(t=>OFFB.L.pet.includes(t))&&OFFB.L.pet.every(t=>got.includes(t))&&!got.some((t,i)=>i>0&&t===got[i-1]),J(got.slice(0,6))); }
  // ===== 6. 八卦 =====
  { fresh(wed,15); delete G.offbeat; const lt=L.seats[0], other=L.seats[20], sl={x:lt.x,z:lt.z,yaw:lt.yaw,lv:0}, so={x:other.x,z:other.z,yaw:other.yaw,lv:0};
    picks=[4]; await STORY.onSeat(GM,so); const a=T().filter(t=>OFFB.L.gossip.includes(t)).length;
    GM.enterN++; said=[]; picks=[4]; await STORY.onSeat(GM,sl); const b=T().filter(t=>OFFB.L.gossip.includes(t));
    GM.enterN++; said=[]; picks=[4]; await STORY.onSeat(GM,sl); const c=T().filter(t=>OFFB.L.gossip.includes(t)).length;
    G.day++; GM.enterN++; said=[]; picks=[4]; await STORY.onSeat(GM,sl); const d=T().filter(t=>OFFB.L.gossip.includes(t));
    G.day++; GM.enterN++; said=[]; picks=[4]; await STORY.onSeat(GM,sl); const e=T().filter(t=>OFFB.L.gossip.includes(t)).length;
    G.day=TD('Y1S2',3,3); GM.enterN++; said=[]; picks=[4]; await STORY.onSeat(GM,sl); const f=T().filter(t=>OFFB.L.gossip.includes(t));
    check('6. 長桌坐下才有；一天一句、一學期最多兩句；下一學期接著輪（第三句）',a===0&&J(b)===J([OFFB.L.gossip[0]])&&c===0&&J(d)===J([OFFB.L.gossip[1]])&&e===0&&J(f)===J([OFFB.L.gossip[2]]),J([a,b,c,d,e,f])); }
  // ===== 7. 偶遇 =====
  { const at=(id,day,h)=>STORY.schedEnt(CHARACTERS[id],Object.assign({},G,{day,hour:h,weekday:wdOf(day),flags:G.flags}));
    const w3=TD('Y1S1',5,3), y3=TD('Y3S1',5,3), su=TD('Y1S1',5,7); fresh(w3,21.6);
    const p1=at('classmate_peishan',w3,21.6), p2=at('classmate_peishan',y3,21.6), p3=at('classmate_peishan',w3,21);
    check('7. 沛珊：週三 21:30 以後在日常失速（大一大二；21:00 不在、大三不在）',!!p1&&p1.zone==='wz_offbeat'&&!(p2&&p2.offbeat)&&!(p3&&p3.offbeat),J([p1&&p1.zone,p2&&p2.zone,p3&&p3.zone]));
    const a1=at('yu',su,15); check('7. Alison：週日 14:00～17:00 在日常失速',!!a1&&a1.zone==='wz_offbeat',J(a1&&a1.zone));
    fresh(w3,21.6); know('classmate_peishan',S4); const id=OFFB.encDue(G); if(id) await OFFB.enc(GM,id); const t1=T(); said=[];
    check('7. 一個人在店裡、沛珊這時候在：「你也在這！……我買個肉桂捲就走，明天早八。」一天一次',id==='classmate_peishan'&&J(t1)===J(['你也在這！……我買個肉桂捲就走，明天早八。'])&&OFFB.encDue(G)===null,J([id,t1]));
    fresh(su,15); know('yu',S4); const id2=OFFB.encDue(G); if(id2) await OFFB.enc(GM,id2);
    check('7. Alison 那一段（兩句中間「（三分鐘後）」）',id2==='yu'&&J(T())===J(OFFB.L.enc.yu.map(x=>x[1]))&&said[1].who===null,J(T()));
    fresh(su,15); check('7. 還不認識：不遇',OFFB.encDue(G)===null);
    const fri=(()=>{ for(let w=2;w<=15;w++){ const d=TD('Y1S1',w,5); if(ACTIVITIES.list.some(a=>a.id==='dept_basketball'&&ACTIVITIES.on(a,d,G))) return d; } return null; })();
    const z1=fri!=null?at('zhe',fri,19.5):null, m1=fri!=null?at('classmate_mingxuan',fri,19.5):null;
    check('7. 阿哲、明軒：大一上系籃練球的週五 19:15～20:00 在日常失速',!!z1&&z1.zone==='wz_offbeat'&&!!m1&&m1.zone==='wz_offbeat',J([fri,z1&&z1.zone,m1&&m1.zone]));
    if(fri!=null){ fresh(fri,19.5); G.flags.week1Seen=true; know('zhe',S4); const id3=OFFB.encDue(G); if(id3) await OFFB.enc(GM,id3); check('7. 阿哲：「練完好餓。你要不要一起？」（之後的選項：第 20 項）',/^zhe/.test(id3)&&T()[0]==='練完好餓。你要不要一起？',J([id3,T()])); } }
  // ===== 8. 打烊 =====
  { fresh(wed,27); E.player.seat={x:0,z:0}; check('8. 01:00 以後人在店裡：tick 開演',OFFB.tick(GM)===true); await new Promise(r=>setTimeout(r,10));
    check('8. 03:00（讀檔回到店裡）：出來站在店門外（配置 exit.spawn）、寫開放時間、起身（01:00 打烊那一刻：第 18 項）',G.zone==='wenzhou'&&entered[0][1].x===L.exit.spawn.x&&/開放時間/.test(toasts[0]||'')&&!E.player.seat,J([entered,toasts])); }
  // ===== 9. 邀約 =====
  { const P=INV.place('offbeat'), sat=TD('Y1S1',7,6);
    check('9. 日常失速是邀約地點（吃飯、有點熟以上、一起坐下、去過才列）',!!P&&P.zone==='wz_offbeat'&&P.kind==='meal'&&P.minStage==='FAMILIAR'&&P.seatPose==='sit'&&!P.show({visited:{}})&&P.show({visited:{wz_offbeat:true}}),J(P));
    fresh(sat,10); G.zone='dorm'; G.visited.wz_offbeat=true; know('zhe',{fam:30,trust:20,comf:15,npcRom:0,rom:0}); const d=INV.decide(G,'zhe','offbeat',sat,19);
    check('9. 約阿哲週六 19:00 去日常失速：答應',d.res==='accept',J(d));
    const iv=INV.accept(G,'zhe','offbeat',sat,19,{by:'player'}); G.zone='wz_offbeat'; G.day=sat; G.hour=19; said=[]; await INV.meet(GM,iv,null); check('9. 見面照一般流程（done）',iv.state==='done',J(T()));
    const d2=INV.decide(G,'zhe','offbeat',sat,10); check('9. 約 10:00：沒開',d2.res!=='accept'&&d2.why==='closed',J(d2)); }
  // ===== 10. 不加小聲、沒有讀書 =====
  { fresh(wed,15); check('10. 說話照一般音量（不加小聲）',LIBQ.whisper(GM,{name:'阿哲'},'好。')==='好。');
    check('10. 座位不給讀書（配置沒有 canStudy／study）',L.seats.every(s=>!s.canStudy&&!s.study)); }
  // ===== 11. 存檔 =====
  { const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), line=g3.split('\n').find(l=>/function defaults\(/.test(l))||'';
    check('11. 新遊戲的預設有 offbeat:{n:0}（舊存檔 migrate 照 defaults 補）',/offbeat:\{n:0\}/.test(line));
    const g={day:1}; OFFB.rec(g); const g2={day:1,offbeat:[1]}; OFFB.rec(g2); const g4={day:1,offbeat:{n:'x',enc:3,gos:'y'}}; OFFB.rec(g4);
    check('11. 沒有、壞掉的欄位重設',g.offbeat.n===0&&!Array.isArray(g2.offbeat)&&g2.offbeat.n===0&&g4.offbeat.n===0&&typeof g4.offbeat.enc==='object'&&typeof g4.offbeat.gos==='object'); }
  { const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), i=html.indexOf('src/offbeat_sys3d.js'), b=html.indexOf('src/bbpack3d.js'), g=html.indexOf('GAME.boot()'), m=html.indexOf('src/mokuyobi_sys3d.js'), bg=html.indexOf('src/bgnight3d.js');
    const V=((html.match(/版本 v([0-9.]+)（/)||[])[1]||'?').replace(/\./g,'\\.');   /* ?v= 和標題的版號一樣（不寫死 9.10.19：發布樹會改成新版號）*/
    check('12. index.html 載入 offbeat_sys3d.js（木曜日之後、bbpack 之前；?v＝標題的版號）',i>m&&i<b&&i<g&&i>bg&&new RegExp('src/offbeat_sys3d\\.js\\?v='+V+'\"').test(html)); }
  // ===== 13～22. AA_648（企劃線 1ebf7a590）=====
  let s648=''; try{ s648=cp.execSync('git -c core.quotepath=off show 1ebf7a590:"docs/story_planning/AA_648_日常失速補台詞_回LAWWW.md"',{cwd:GIT,encoding:'utf8',maxBuffer:8<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  const in648=t=>s648.includes(String(t).replace(/^「|」$/g,''));
  { const L0=OFFB.L, all=[].concat(L0.look.board,L0.look.clubs,L0.look.shelf,L0.game.end,[L0.game.none,L0.game.start,L0.menu[0][2],OFFB.ACC0],L0.game.names,L0.chat,
      L0.zheOpts.map(o=>o.t),...L0.zheOpts.map(o=>o.say.map(x=>x[1])),Object.values(INVITE_DATA.offbeatAcc||{}));
    /* 2026-11-11（X324 D 區，AA_784_invites.json）：invites.js 的答應句照覆蓋層拿掉刪節號、換句——對稿時「新字的舊字在稿上」也算（tests/overlay_expect.js 的 inDoc）。舊期望：字本身在稿上 */ const RC2B=new Map(require('./d158_rc2_lib.js').rows('invites.js').map(r=>[r.new,r.old]));   /* rc2b（D158-KX-SAMESCHOOL，AA_1012 第 2 節）：可昕「等我到台北」換過，稿上是舊字 */ const bad=all.filter(t=>!require('./overlay_expect.js').inDoc('invites',null,RC2B.get(t)||t,in648)); check('13. 讀得到 AA_648@1ebf7a590；AA_648 的每一句（'+all.length+' 句）都在稿上',!!s648&&all.length===41&&!bad.length&&!L0.close,J(bad));
    check('13. 公告板、佈告欄、桌遊櫃各三句；遊戲四款、結束三句；聊天四句；答應十二人＋一般',L0.look.board.length===3&&L0.look.clubs.length===3&&L0.look.shelf.length===3&&L0.game.names.length===4&&L0.game.end.length===3&&L0.chat.length===4&&Object.keys(INVITE_DATA.offbeatAcc).length===12);
    const f=[].concat(...Object.values(L0.finalAsk).map(x=>[x[1]]),L0.finalNarr); check('13. 期末聚餐的揪人句、三句旁白照 AA_618 2-4 第 2 點',f.every(t=>s2.includes(t)),J(f.filter(t=>!s2.includes(t)))); }
  { fresh(wed,15); E.interactables=[]; Z3.ZONES.wz_offbeat.build(E); const by=k=>E.interactables.filter(q=>q.offLook===k);
    check('14. 看公告板（西牆）、看社團佈告欄（東牆）、看桌遊櫃的按鈕照配置的位置與字',by('board').length===1&&by('board')[0].label==='看公告板'&&by('clubs')[0].label==='看社團佈告欄'&&by('shelf')[0].label==='看桌遊櫃'&&by('clubs')[0].x===3.9,J(E.interactables.map(q=>q.label)));
    for(const k of ['board','clubs','shelf']){ const got=[]; for(let i=0;i<30;i++){ said=[]; await STORY.interact(by(k)[0],GM); got.push(T()[0]); }
      check('14. '+k+'：30 次都是稿上的句子、每一句都出現、不連續同一句',got.every(t=>OFFB.L.look[k].includes(t))&&OFFB.L.look[k].every(t=>got.includes(t))&&!got.some((t,i)=>i>0&&t===got[i-1]),J(got.slice(0,5))); }
    const pl=E.interactables.find(q=>q.offPlay); said=[]; const h0=G.hour; await STORY.interact(pl,GM);
    check('15. 玩桌遊：沒有朋友在＝「（長桌上沒有人。桌遊要幾個人一起才好玩。）」、不開始、時間不動',!!pl&&J(T())===J([OFFB.L.game.none])&&G.hour===h0,J(T()));
    know('zhe',S4); E.npcs=[{charId:'zhe',obj:mkObj()}]; const names=[], ends=[]; for(let i=0;i<5;i++){ said=[]; const h1=G.hour; await STORY.interact(pl,GM); names.push(T()[0]); ends.push(T()[1]); if(Math.abs(G.hour-h1-1)>1e-9) names.push('時間不對'); }
    check('15. 有朋友在：「（你們把「{遊戲}」攤開在長桌上。）」四款輪流、結束三句之一、時間過 1 小時',J(names)===J(['拍桌大作戰','貓咪快遞','巷口夜市','島嶼建築師','拍桌大作戰'].map(n=>'（你們把「'+n+'」攤開在長桌上。）'))&&ends.every(t=>OFFB.L.game.end.includes(t))&&!ends.some((t,i)=>i>0&&t===ends[i-1]),J([names,ends]));
    E.npcs=[{isExtra:true,obj:mkObj()},{clerk:true,charId:null}]; said=[]; await STORY.interact(pl,GM); check('15. 只有路人、店員＝不算有朋友',J(T())===J([OFFB.L.game.none])); E.npcs=[];
    said=[]; picks=[0]; await OFFB.order(GM); check('16. 冰拿鐵點完：「（冰拿鐵上面的奶泡慢慢沉下去。）」',J(T())===J(['（冰拿鐵上面的奶泡慢慢沉下去。）']),J(T()));
    const ch=E.interactables.find(q=>q.offChat); global.GAME={G}; check('17. 找店員聊天的按鈕（今天還沒聊）',!!ch&&ch.label==='找店員聊天'&&!ch.hidden);
    said=[]; await STORY.interact(ch,GM); check('17. 店員說四句之一；說完今天按鈕就不見',said.length===1&&said[0].who==='店員'&&OFFB.L.chat.includes(said[0].t)&&ch.hidden,J(said));
    G.day++; check('17. 隔天又可以',!ch.hidden); const got=[]; for(let i=0;i<40;i++){ G.day++; said=[]; await OFFB.chat(GM); got.push(T()[0]); } check('17. 四句都會出現、不連續同一句',OFFB.L.chat.every(t=>got.includes(t))&&!got.some((t,i)=>i>0&&t===got[i-1]),J(got.slice(0,6))); delete global.GAME; }
  { fresh(wed,25.05); const r=await OFFB.closeOut(GM);
    check('18. 01:00 打烊：店員「我們今天要打烊了。」（AA_700）、不另外出旁白，出去、不跳開放時間',r==='close'&&J(said)===J([{who:'店員',t:'我們今天要打烊了。'}])&&!toasts.length&&entered[0][0]==='wenzhou',J([r,said,toasts]));
    fresh(wed,10); const r2=await OFFB.closeOut(GM); check('18. 10:00（讀檔回到店裡）：只寫開放時間',r2==='out'&&!said.length&&toasts.length===1); }
  { const sat=TD('Y1S1',7,6), P=INV.place('offbeat'), ok=[];
    for(const id of Object.keys(INVITE_DATA.offbeatAcc)){ fresh(sat,10,id==='kexin'?{dating_kexin:true}:{}); G.zone='dorm'; G.visited.wz_offbeat=true; know(id,S4); let slot=null; for(const h of [14,15,16,17,18,19,20,13]) if(slot==null&&INV.freeAt(G,id,P,sat,h)) slot=h;
      const d=slot==null?null:INV.personal(G,id,P,sat,slot,INV.decide(G,id,'offbeat',sat,slot)); ok.push([id,slot,d&&d.res,d&&J(d.lines)===J([INVITE_DATA.offbeatAcc[id]]),d&&d.lines]); }
    const bad=ok.filter(x=>x[2]==='accept'&&!x[3]), acc=ok.filter(x=>x[2]==='accept');
    check('19. 約去日常失速答應：各自那一句（答應的 '+acc.length+'／12）',!bad.length&&acc.length>=8,J(ok));
    fresh(sat,10); G.zone='dorm'; G.visited.wz_offbeat=true; know('kai',S4); let slot=null; for(const h of [14,15,16,17,18,19,20]) if(slot==null&&INV.freeAt(G,'kai',P,sat,h)) slot=h;
    const d=slot==null?null:INV.personal(G,'kai',P,sat,slot,INV.decide(G,'kai','offbeat',sat,slot)); check('19. 沒列的人（阿凱）答應：一般那句「好啊。那裡吃什麼都好吃。」',!!d&&d.res==='accept'&&J(d.lines)===J([OFFB.ACC0]),J([slot,d])); }
  { const fri=(()=>{ for(let w=2;w<=15;w++){ const d=TD('Y1S1',w,5); if(ACTIVITIES.list.some(a=>a.id==='dept_basketball'&&ACTIVITIES.on(a,d,G))) return d; } return null; })();
    fresh(fri,19.5); know('zhe',S4); picks=['好，一起。']; const h0=G.hour; const r=await OFFB.enc(GM,'zhe');
    check('20. 阿哲「練完好餓」→「好，一起。」：旁白＋明軒「他每次都這樣。」、時間過 40 分鐘',r==='zhe_yes'&&J(T())===J(['練完好餓。你要不要一起？','（你們點了兩份厚片。阿哲吃完他那份，一直看著你那份。）','他每次都這樣。'])&&said[2].who===SOCIAL.displayName('classmate_mingxuan')&&Math.abs(G.hour-h0-40/60)<1e-9&&J(opts[0])===J(['「好，一起。」','「今天不行。」']),J([r,said,opts]));
    fresh(fri,19.5); know('zhe',S4); picks=['今天不行。']; const r2=await OFFB.enc(GM,'zhe'); check('20.「今天不行。」→ 阿哲「好，下次。」',r2==='zhe_no'&&T()[1]==='好，下次。'&&G.hour===19.5,J(T())); }
  // ===== 21. 期末考完的聚餐（取代燒臘店那一場）=====
  { const evOf=id=>STORY_EVENTS.find(e=>e.id===id), terms=Object.keys(OFFB.FINAL);
    check('21. 四場的地點：燒臘店或日常失速（AA_648 第 1 節）',terms.every(t=>J(evOf(OFFB.FINAL[t].ev).location)===J(['noodle','wz_offbeat'])));
    const lastOf=t=>CLS.lastExamEnd(G,t,'final'); fresh(TD('Y2S1',16,1),10); const e=lastOf('Y2S1');
    G.day=e.day; G.hour=Math.max(17,e.h); G.weekday=wdOf(G.day); G.flags.noodleTableDay=1; PHONE.join(G,'noodle_team','桌遊團');
    OFFB.phone(G); const q=(G.phone.q||[]).find(x=>x.tag==='ob_final_Y2S1');
    check('21. 大二上最後一科考完那天 17:00：Alison 在桌遊團群組「大家考完了沒！日常失速！」',!!q&&J(q.items)===J([{th:'g:noodle_team',from:'yu',text:'大家考完了沒！日常失速！'}]),J(G.phone.q));
    try{ STORY.phoneRules(GM); }catch(e){ console.log('（phoneRules 例外）',String(e).slice(0,120)); } check('21. 原本的「考完了 七點，燒臘店」不再傳',!(G.phone.q||[]).some(x=>x.tag==='y2_final_ask')&&!(G.msgs||[]).some(m=>/燒臘店/.test(m.text||'')));
    check('21. 新的局：地點是日常失速',OFFB.finalZone(G,'Y2S1')==='wz_offbeat');
    const ev=evOf('ev_term_last_meal_y2s1'); G.zone='wz_offbeat'; know('heroine_01',S4); const okOff=EVENTS.check(ev); G.zone='noodle'; const okNd=EVENTS.check(ev);
    check('21. 走進日常失速才演（燒臘店不演）',okOff&&!okNd,J([okOff,okNd]));
    G.zone='wz_offbeat'; said=[]; await EVENTS.run(ev); const tx=T();
    check('21. 日常失速版：沒有燒臘店阿姨的話、結尾旁白照學期輪（大二上＝第三句）',!tx.some(t=>/吃完再走/.test(t))&&tx.includes('（大二上最後一科考完。長桌的位子，大家已經不用講就會坐。）')&&tx[tx.length-1]===OFFB.L.finalNarr[2]&&!said.some(s=>s.who==='阿姨'),J(tx));
    fresh(TD('Y2S1',16,1),10); G.day=e.day; G.hour=Math.max(17,e.h); G.flags.noodleTableDay=1; G.msgs.push({day:G.day,h:17,th:'g:noodle_team',from:'zhe',text:'考完了 七點，燒臘店',tag:'y2_final_ask'});
    check('21. 舊存檔已經收到「七點，燒臘店」：照舊在燒臘店',OFFB.finalZone(G,'Y2S1')==='noodle'&&OFFB.phone(G)===null);
    G.zone='noodle'; const okOld=EVENTS.check(ev); said=[]; await EVENTS.run(ev); check('21. 燒臘店版照舊有阿姨的話、沒有日常失速的旁白',okOld&&said.some(s=>s.who==='阿姨')&&!T().some(t=>OFFB.L.finalNarr.includes(t)),J(T()));
    fresh(TD('Y1S1',16,1),10); const e1=lastOf('Y1S1'); G.day=e1.day; G.hour=Math.max(17,e1.h); G.flags.noodleTableDay=1; OFFB.phone(G); const q1=(G.phone.q||[]).find(x=>x.tag==='ob_final_Y1S1');
    check('21. 大一上：阿哲私訊（不在群組）「最後一科！老地方！」',!!q1&&J(q1.items)===J([{th:'p:zhe',from:'zhe',text:'最後一科！老地方！'}]),J(G.phone.q));
    const e11=evOf('ev_term_last_meal'); G.zone='wz_offbeat'; said=[]; await EVENTS.run(e11); check('21. 大一上（日常失速）：沒有阿姨、小菜，結尾第一句旁白',!T().some(t=>/阿姨|吃好一點/.test(t))&&T().includes('期末最後一科考完。阿哲在群組喊了一聲。')&&T()[T().length-1]===OFFB.L.finalNarr[0],J(T()));
    const e12=evOf('ev_term_last_meal_y1s2'); said=[]; await EVENTS.run(e12); check('21. 大一下（日常失速）：沒有叉燒那句、結尾第二句',!T().some(t=>/叉燒/.test(t))&&T()[T().length-1]===OFFB.L.finalNarr[1],J(T()));
    const e22=evOf('ev_term_last_meal_y2s2'); said=[]; await EVENTS.run(e22); check('21. 大二下（日常失速）：沒有阿姨、店員那句（AA_648 第 5 節）、結尾第一句（照學期輪）',J(T())===J(['（大二下最後一科考完。）','明年你們大三了。……我記得你們第一次來，桌遊規則看了一個小時。',OFFB.L.finalNarr[0]])&&!said.some(x=>x.who==='阿姨'),J(T()));
    check('21. 今天吃過期末那一頓＝進門不演「一個人」的那一段',(()=>{ G.events.last=G.events.last||{}; G.events.last.ev_term_last_meal_y2s2=G.day; return !OFFB.alone(G); })()); }
  // ===== 22. 期中聚餐、桌遊夜搬進 3D =====
  { const sat=TD('Y1S1',16,3); fresh(sat,20); G.zone='wenzhou'; E.player.obj.position.x=5; E.player.obj.position.z=1; know('classmate_bohan',S4); know('classmate_mingxuan',S4);
    const sp=[]; GM.spawnCharacter=(id,x,z,o)=>{ sp.push([id,x,z,o&&o.seat&&o.seat.yaw]); return {obj:mkObj()}; }; GM.removeNPC=()=>{}; let sitP=null; GM.sitAt=(e,s)=>{ if(e===E.player){ sitP=s; E.player.seat=s; } };
    const st=await OUT.STAGE.reduce(async(acc,f)=>(await acc)||f(GM,{id:'supper_mid1'},{id:'ev_midterm_supper'}),Promise.resolve(null));
    const long=L.seats.filter(q=>q.table===1);
    check('22. 期中考完的聚餐：換到日常失速、玩家坐長桌、阿哲柏翰明軒坐長桌其他位子',!!st&&entered[0][0]==='wz_offbeat'&&!!sitP&&sitP.x===long[0].x&&sp.map(x=>x[0]).join()==='zhe,classmate_bohan,classmate_mingxuan'&&sp.every((x,i)=>x[1]===long[i+1].x&&x[2]===long[i+1].z),J([entered,sitP,sp]));
    check('22. 事件裡的 2D 背景（boardgame_gg）換成模糊的 3D',OUT.bg('boardgame_gg')==='blur');
    await st.restore(); check('22. 演完回到原本的地方、背景照舊',entered[1][0]==='wenzhou'&&entered[1][1].x===5&&OUT.bg('boardgame_gg')!=='blur',J(entered));
    const fri=TD('Y1S1',5,5); fresh(fri,20); G.zone='wenzhou'; know('zhe',S4); know('classmate_xinci',S4); sp.length=0;
    const st2=await OUT.STAGE.reduce(async(acc,f)=>(await acc)||f(GM,{id:'bgn_'+fri},{id:BGN.EV}),Promise.resolve(null));
    check('22. 桌遊夜：明軒＋認識的阿哲、芯慈坐長桌（柏翰還不認識不來）',!!st2&&J(sp.map(x=>x[0]))===J(['classmate_mingxuan','zhe','classmate_xinci']),J(sp)); if(st2) await st2.restore();
    fresh(fri,20); G.flags.companion='an'; check('22. 有人跟著你：照舊 2D（不換區域）',(await OFFB.outingStage(GM,{},{id:'ev_midterm_supper'}))===null);
    check('22. 別的事件不換',(await OFFB.outingStage(GM,{},{id:'ev_y2_first_meal'}))===null);
    delete GM.spawnCharacter; delete GM.removeNPC; GM.sitAt=()=>{}; }
  // ===== 23. AA_648 第 6 節（adf1c2f78）：期末聚餐真的坐到長桌 =====
  { const day=TD('Y2S1',16,3); fresh(day,19); G.zone='wz_offbeat'; know('classmate_bohan',S4); know('zhe',S4);
    const sp=[], ex=[]; GM.spawnCharacter=(id,x,z,o)=>{ sp.push([id,x,z]); return {obj:mkObj()}; }; GM.removeNPC=id=>{ sp.rm=(sp.rm||[]).concat(id); }; let sitP=null; GM.sitAt=(e,s)=>{ if(e===E.player){ sitP=s; E.player.seat=s; } else if(e) e.seat=s; };
    const addN0=E.addNPC, rmN0=E.removeNPC; E.addNPC=n=>{ ex.push(n); return n; }; E.removeNPC=n=>{ ex.rm=(ex.rm||0)+1; };
    const long=L.seats.filter(q=>q.table===1); const r=OFFB.finalSeat(GM,'Y2S1');
    check('23. 大二上：揪的人 Alison 坐長桌一端（第一個位子）、玩家坐她旁邊（第二個位子）',!!r&&sp[0]&&sp[0][0]==='yu'&&sp[0][1]===long[0].x&&sp[0][2]===long[0].z&&!!sitP&&sitP.x===long[1].x&&sitP.z===long[1].z,J([sp.slice(0,2),sitP]));
    check('23. 認識的人上桌（柏翰、阿哲），加起來最多六個（含揪的人）；空位給路人（不說話）',sp.length<=6&&sp.some(x=>x[0]==='classmate_bohan')&&sp.some(x=>x[0]==='zhe')&&sp.length+1+ex.length===long.length&&ex.every(n=>n.isExtra&&n.frozen),J({ppl:sp.map(x=>x[0]),extras:ex.length,seats:long.length}));
    OFFB.finalUnseat(GM); check('23. 結束：朋友、路人收掉，玩家起身',(sp.rm||[]).length===sp.length&&ex.rm===ex.length&&!E.player.seat,J({rm:sp.rm,exrm:ex.rm}));
    check('23. 大一揪的人阿哲、大二 Alison',OFFB.finalCast(G,'Y1S2')[0]==='zhe'&&OFFB.finalCast(G,'Y2S2')[0]==='yu');
    const ev=STORY_EVENTS.find(e=>e.id==='ev_term_last_meal_y2s1'); check('23. 事件第一行坐下、最後一行收掉（日常失速那一版）',/OFFB\.finalSeat\(GM,'Y2S1'\)/.test(String(ev.dialogue[0].call))&&/OFFB\.finalUnseat/.test(String(ev.dialogue[ev.dialogue.length-1].call)));
    E.addNPC=addN0; E.removeNPC=rmN0; delete GM.spawnCharacter; delete GM.removeNPC; GM.sitAt=()=>{}; }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
