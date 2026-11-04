// 日常失速（wz_offbeat）的系統與台詞（AA_617 第 3、4 節的日常失速；AA_618 第 2 節，企劃線 ca876b23d；src/offbeat_sys3d.js）。不需要瀏覽器。
// 用法：node tests/offbeat_aa618_unit.js（稿用 git show 讀，台詞逐字對稿）。這是模擬（Node 裡跑真正的 STORY、INV、PLACES、EAT），不是真實玩家流程（瀏覽器測試照 D131 排使用者電腦）。
//   0 台詞都在稿上；1 營業時間、颱風、名稱、快速前往、地圖；2 店門關著擋；3 第一次進去；4 點東西（吧檯、第一次坐下）；5 店長；6 八卦；7 偶遇；8 打烊；9 邀約地點；10 不加小聲、沒有讀書；11 存檔欄位
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
require('./alison.js');
const ROOT=path.resolve(__dirname,'..'), GIT=process.env.SPEC_GIT_DIR||ROOT, SPEC_SHA='ca876b23d', SPEC_PATH='docs/story_planning/AA_618_木曜日與日常失速_台詞.md';
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?noriders'};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INVITE_REPLIES|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOMETOWN_LINES|HV|DATE|DATE_DATA|DATE_LINES|CONFESS_LINES|TERMEND|TERMEND_LINES|VAC|VAC_DATA|FREE_TRIPS|TRIP|ENCOUNTERS|ENC_WALK|ENC|DORM_ROOM|SISG|SLOWREAD|LIBQ|EAT|EAT_LINES|DAILY_OFFBEAT_LAYOUT|OFFB)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const mkObj=()=>({position:{x:0,y:0,z:0,set(x,y,z){ this.x=x; this.y=y; this.z=z; }},rotation:{y:0},userData:{},add(){}});
global.CHAR={setExpr(){},build:()=>mkObj()};
/* 區域本身（zones3d.js 的 wzShop('offbeat')）要 three.js 整套：這裡換一個空的區域（OFFB 包在它的 build 外面加按鈕）*/
global.Z3={ZONES:{wz_offbeat:{id:'wz_offbeat',build(E){ return {seats:[]}; }}}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+String(info).slice(0,600):'')); if(!ok) fails++; };
const FILES=['src/data/daily_offbeat_layout.js','src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/data/invite_replies.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/sis_grad3d.js',
  'src/data/dorm_room_layout.js','src/libquiet3d.js','src/story3d.js','src/classes3d.js','src/data/eat_lines.js','src/eat3d.js','src/slowread3d.js','src/offbeat_sys3d.js'];
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
const fresh=(day,hour,flags)=>{ G={v:3,stage:'law',day,hour,zone:'wz_offbeat',weekday:wdOf(day),weather:'clear',energy:70,money:50000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,afternoonDone:true,classDone:true,introDone:true,metAn:true,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},invites:[],trips:[],stats:{classes:0},visited:{dorm:true}};
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
  { const L0=OFFB.L, all=[]; for(const [,t] of L0.first) all.push(t); for(const m of L0.menu) if(m[2]) all.push(m[2]); all.push(L0.catFirst,L0.catAgain); for(const t of L0.pet.concat(L0.gossip)) all.push(t); for(const id in L0.enc) for(const [,t] of L0.enc[id]) all.push(t);
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
    check('4. 吧檯「點東西吃」、「看看店長／摸摸店長」的按鈕在配置的位置；公告板、桌遊櫃、玩桌遊沒有台詞＝沒有按鈕',!!oi&&oi.x===-1.2&&oi.z===-2.55&&!!ci&&ci.x===2.95&&E.interactables.length===2,J(E.interactables));
    picks=[2]; const m0=G.money; await STORY.interact(oi,GM); check('4. 肉桂捲：扣 110、那一句、吃過的「溫州街・日常失速」',G.money===m0-110&&J(T())===J(['（肉桂捲是熱的，糖霜一直滴下來。）'])&&G.eat.ate.some(a=>a.shop==='溫州街・日常失速'&&a.item==='肉桂捲'),J(T()));
    check('4. 選單照稿＋不用了',J(opts[0])===J(['冰拿鐵　120 元','檸檬氣泡美式　130 元','肉桂捲　110 元','明太子厚片　140 元','不用了']),J(opts[0]));
    said=[]; picks=[0]; const m1=G.money; await OFFB.order(GM); check('4. 冰拿鐵：扣 120、稿上沒有那一句＝不說',G.money===m1-120&&!said.length);
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
    check('7. 一個人在店裡、沛珊這時候在：「你也在這！……我買個肉桂捲就走，明天早八。」一天一次',id==='classmate_peishan'&&J(t1)===J(['「你也在這！……我買個肉桂捲就走，明天早八。」'])&&OFFB.encDue(G)===null,J([id,t1]));
    fresh(su,15); know('yu',S4); const id2=OFFB.encDue(G); if(id2) await OFFB.enc(GM,id2);
    check('7. Alison 那一段（兩句中間「（三分鐘後）」）',id2==='yu'&&J(T())===J(OFFB.L.enc.yu.map(x=>x[1]))&&said[1].who===null,J(T()));
    fresh(su,15); check('7. 還不認識：不遇',OFFB.encDue(G)===null);
    const fri=(()=>{ for(let w=2;w<=15;w++){ const d=TD('Y1S1',w,5); if(ACTIVITIES.list.some(a=>a.id==='dept_basketball'&&ACTIVITIES.on(a,d,G))) return d; } return null; })();
    const z1=fri!=null?at('zhe',fri,19.5):null, m1=fri!=null?at('classmate_mingxuan',fri,19.5):null;
    check('7. 阿哲、明軒：大一上系籃練球的週五 19:15～20:00 在日常失速',!!z1&&z1.zone==='wz_offbeat'&&!!m1&&m1.zone==='wz_offbeat',J([fri,z1&&z1.zone,m1&&m1.zone]));
    if(fri!=null){ fresh(fri,19.5); G.flags.week1Seen=true; know('zhe',S4); const id3=OFFB.encDue(G); if(id3) await OFFB.enc(GM,id3); check('7. 阿哲：「練完好餓。你要不要一起？」',id3==='zhe'&&J(T())===J(['「練完好餓。你要不要一起？」']),J([id3,T()])); } }
  // ===== 8. 打烊 =====
  { fresh(wed,25.1); E.player.seat={x:0,z:0}; check('8. 01:00 以後人在店裡：tick 開演',OFFB.tick(GM)===true); await new Promise(r=>setTimeout(r,10));
    check('8. 出來站在店門外（配置 exit.spawn）、寫開放時間、起身',G.zone==='wenzhou'&&entered[0][1].x===L.exit.spawn.x&&/開放時間/.test(toasts[0]||'')&&!E.player.seat,J([entered,toasts])); }
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
    check('12. index.html 載入 offbeat_sys3d.js（木曜日之後、bbpack 之前；?v=9.10.19）',i>m&&i<b&&i<g&&i>bg&&/src\/offbeat_sys3d\.js\?v=9\.10\.19/.test(html)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
