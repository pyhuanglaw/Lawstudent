// PLAN-1016-ROM 剩下的四件（BB_165，企劃線 a54ec2b4a；src/data/rom1016_events.js、src/rom1016_3d.js）——不需要瀏覽器。
//   1 芷若 3-1 你點的那一杯：大三下、Z13 條件到齊＋ZR_GAVE_HER_ORDER、她在吧檯：點餐多「（點一杯熱可可加濃縮）」→ 交往、ZR_HE_ORDERED、Z13 不再觸發；不選＝照平常點
//   2 沛珊 5-1 被等的感覺：11/17 23:10 私訊 → 11/19 18:40 台南課輔班；沒到＝19:10 兩則、改 11/26；第二次沒到＝21:00 兩則、PS_WAITED；不行＝不演
//   3 沛珊 5-2 她的紅筆：11/15 23:00 私訊 → 11/17 19:30；美國路線沒有；沒到＝21:00 照片、下一次當面的私下約演短版
//   4 可昕 K7 第一年的週年卡片：房間物件翻後面幾頁、KX_CARD_READ；第 5 頁照 7/24 的選擇；沒去的之後第一次當面見面給卡片（AA_438 第 2 節）
//   0 每一句都在 BB_165（企劃線 a54ec2b4a）
// 修改前（開發分支 99a20823b）：沒有這兩個檔，第 0 項 FAIL、其他不跑。用法：node tests/rom1016_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|DATE|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES|VAC|VAC_DATA|R2Y3B|R2Y3B_EVENTS|ROM1016|ROM1016_EVENTS)$/;
const load=f=>{ const p=path.join(ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js',
  'src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/hometown3d.js',
  'src/data/r2y3b_events.js','src/r2y3b3d.js']) load(f);
const okFiles=load('src/data/rom1016_events.js')&&load('src/rom1016_3d.js');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ if(!CG_REGISTRY[id]) return false; cgs.push(id); return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[], cards=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){ G.weekday=wdOf(G.day); },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); if(STORY._bindGM) STORY._bindGM(GM); said=[]; opts=[]; picks=[]; cgs=[]; caps=[]; toasts=[]; cards=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); G.contacts[id]=1; };
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const txt=id=>(G.msgs||[]).filter(m=>m.th==='p:'+id).map(m=>(m.from==='player'?'我:':'')+m.text);
const lines=()=>said.map(s=>s.t);
const J=JSON.stringify, ZR='heroine_02', PS='classmate_peishan', KX='kexin';
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const BB165=git('a54ec2b4a','BB_165_AB61_BB五位戀愛線補拍與矛盾.md');
const AA529=git('881029f98','AA_529_D99經濟系那一年_可昕主動約你擋掉_走啦群組建不起來_長頸鹿鑰匙圈.md');   /* AA_529 第 4 節：K7 第 4 頁換句（「一起重考」改在 2/2 蓮池潭說），那一頁照 AA_529 */
const norm=t=>String(t).replace(/[\s　]/g,'');
const inDoc=t=>{ const n=norm(BB165); return [t,t.replace(/^「|」$/g,''),t.replace(/^（|）$/g,''),t.replace(/^📷（|）$/g,'')].some(x=>x&&n.includes(norm(x))); };
const tick=async()=>{ const p=OUT.tick(GM); if(p&&p.then) await p; };
const R13=()=>{ const F=G.flags; F.CAFE_VISITS=6; F.zhiruoFirstOrder='拿鐵'; F.ZR_GAVE_HER_ORDER=true; for(const m of ['FIRST_MET','ASKED_HER_DRINK','REMEMBERED_HER','WATCHED_FILM','POSTCARDS']) SOCIAL.remember(ZR,m,'');
  const r=SOCIAL.rel(ZR); Object.assign(r,{fam:65,trust:50,comf:45,npcRom:60,rom:35}); const L=DATE.log(G,ZR); L.count=4; L.wish=true; L.wishKnown=true; GM.npc[ZR]={staff:'cafe',obj:{position:{x:0,y:0,z:0}}}; };

(async()=>{
  check('0. 兩個檔載得到（src/data/rom1016_events.js、src/rom1016_3d.js）、事件登記進 STORY_EVENTS',okFiles&&typeof ROM1016!=='undefined'&&['ev_zhiruo_his_order','ev_peishan_waited','ev_peishan_red_pen'].every(id=>STORY_EVENTS.some(e=>e.id===id)));
  if(!okFiles||typeof ROM1016==='undefined'){ console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0); }
  { const X=ROM1016_EVENTS, bad=[]; let n=0; const walk=o=>{ if(Array.isArray(o)) return o.forEach(walk); if(!o||typeof o!=='object') return; if(typeof o.text==='string'){ n++; if(!inDoc(o.text)) bad.push(o.text); } if(Array.isArray(o.choice)) o.choice.forEach(c=>{ n++; if(!inDoc(c.text)) bad.push(c.text); }); for(const k of ['dialogue']) if(o[k]) walk(o[k]); };
    walk(X); for(const k in X.MSG) for(const t of X.MSG[k]){ n++; if(!inDoc(t)) bad.push(t); } for(const k in X.PAGES){ if(k==='blank') continue; n++; if(k==='p4'?!norm(AA529).includes(norm(X.PAGES[k])):!inDoc(X.PAGES[k])) bad.push(X.PAGES[k]); } for(const x of X.RED_PEN_SHORT){ n++; if(!inDoc(x.text||x.narr)) bad.push(x.text||x.narr); }
    check('0. 每一句台詞、旁白、選項、私訊、卡片的頁都在 BB_165（企劃線 a54ec2b4a；「（下面空白。）」是頁面的說明，照片寫成「📷（…）」；K7 第 4 頁照 AA_529 第 4 節 881029f98）',!!BB165&&!!AA529&&n>60&&bad.length===0,n+' 句；對不到：'+J(bad)); }

  /* ======================= 1 芷若 3-1 ======================= */
  fresh('2028-06-09',15,'cafe'); R13();
  check('1. 條件到齊（大三下、Z13 七環＋心意邀約的條件、Z11 的 ZR_GAVE_HER_ORDER、她在吧檯）：選項會出現',ROM1016.hisOrderDue(G,GM)===true&&R2Y3B.z13Ready(G));
  { const c=[]; delete G.flags.ZR_GAVE_HER_ORDER; c.push(ROM1016.hisOrderDue(G,GM)); G.flags.ZR_GAVE_HER_ORDER=true; GM.npc[ZR].staff=null; c.push(ROM1016.hisOrderDue(G,GM)); GM.npc[ZR].staff='cafe';
    at('2027-11-10',15); c.push(ROM1016.hisOrderDue(G,GM)); at('2028-06-09',15); DATE.log(G,ZR).wish=false; c.push(ROM1016.hisOrderDue(G,GM)); DATE.log(G,ZR).wish=true;
    G.zone='campus'; c.push(ROM1016.hisOrderDue(G,GM)); G.zone='cafe';
    check('1. 不出現：沒有 ZR_GAVE_HER_ORDER、她不在吧檯、不是大三下、心意邀約的條件沒到（沒去過心願地點）、不在 Café',c.every(x=>x===false),J(c)); }
  { const c=[]; at('2028-04-12',15); c.push(ROM1016.hisOrderDue(G,GM)); at('2028-06-07',15); c.push(ROM1016.hisOrderDue(G,GM)); at('2028-06-08',10); c.push(ROM1016.hisOrderDue(G,GM));
    const q={id:'te_Y3S2',state:'planned',day:STORY.dayOfKey('2028-06-15'),h:22,te:{special:'z13'}}; OUT.rec(G).push(q);
    at('2028-06-15',21.5); c.push(ROM1016.hisOrderDue(G,GM)); at('2028-06-15',22); c.push(ROM1016.hisOrderDue(G,GM)); at('2028-06-10',15); q.arrived=true; c.push(ROM1016.hisOrderDue(G,GM)); G.outings=G.outings.filter(x=>x!==q); at('2028-06-09',15);
    check('1. AA_438 第 1 節：只在學期末心意邀約窗口——學期中 4/12、6/7 不出現；6/8 起出現；Z13 排在 6/15 22:00：21:30 還出現、22:00 起不出現、她已經到了不出現',J(c)===J([false,false,true,true,false,false]),J(c)); }
  { const r=EVENTS.onInteract(ZR); await new Promise(res=>setTimeout(res,0)); const o=opts[0]||[];
    check('1. 和吧檯的她說話：先問「（點一杯熱可可加濃縮）」或「（照平常點）」（EVENTS.onInteract 接住）',r===true&&J(o)===J(['（點一杯熱可可加濃縮）','（照平常點）']),J(opts)); }
  fresh('2028-06-09',15,'cafe'); R13(); picks=[1]; said=[]; opts=[];
  { const r=await ROM1016.hisOrderOffer(GM); for(let i=0;i<20&&EVENTS.running;i++) await new Promise(res=>setTimeout(res,0));
    check('1. 「（照平常點）」：交回她平常的吧檯（EVENTS.onInteract 原本那一個：那天該演的事件或點餐；6/9 是她的電影那一段），你點的那一杯沒有演、之後還會出現',r==='normal'&&lines().length>0&&!G.events.done.ev_zhiruo_his_order&&!G.flags.ZR_HE_ORDERED&&ROM1016.hisOrderDue(G,GM)===true,J(lines())); }
  fresh('2028-06-09',15,'cafe'); R13(); const m0=G.money, v0=G.flags.CAFE_VISITS; picks=[0,1]; said=[]; opts=[];
  { const r=await ROM1016.hisOrderOffer(GM); const L=lines();
    const want=['（她做好，正要推到你面前。你把杯子推回她那一邊。）','……這是我的點法。','嗯。這杯是給妳的。','（她看著杯子很久。）','……你怎麼記得。','這個我只做給你喝過。','（她把杯子拿起來，雙手捧著）','……不行，這杯我的。'];
    check('1. 點她的點法：BB_165 3-1 的場面（選②「妳不喝，我就自己喝。」→（她把杯子拿起來，雙手捧著）「……不行，這杯我的。」）',r==='order'&&J(L)===J(want),J(L));
    check('1. 結果：交往（dating_heroine_02）、ZR_HE_ORDERED、演過＝Z13 不再觸發（z13Ready false）、之後不再出現；錢 -120、點餐次數 +1',G.flags.dating_heroine_02===true&&ROM.get(G,ZR).status==='dating'&&G.flags.ZR_HE_ORDERED===true&&!!G.events.done.ev_zhiruo_his_order&&R2Y3B.z13Ready(G)===false&&ROM1016.hisOrderDue(G,GM)===false&&m0-G.money===120&&G.flags.CAFE_VISITS===v0+1,J({d:G.flags.dating_heroine_02,m:m0-G.money,v:G.flags.CAFE_VISITS})); }
  { fresh('2028-06-09',15,'cafe'); R13(); const q={id:'te_Y3S2',state:'planned',day:STORY.dayOfKey('2028-06-15'),h:22,te:{special:'z13'}}; OUT.rec(G).push(q); picks=[0,0]; await ROM1016.hisOrderOffer(GM); for(let i=0;i<20&&EVENTS.running;i++) await new Promise(res=>setTimeout(res,0));
    check('1. Z13 那頓飯已經排了又在吧檯點了：交往、那頓飯不再演（skipped、arrived）',G.flags.dating_heroine_02===true&&q.state==='skipped'&&q.arrived===true,J(q)); }
  fresh('2028-06-09',15,'cafe'); R13(); picks=[0,0]; said=[];
  { await ROM1016.hisOrderOffer(GM); const L=lines();
    check('1. 選①「我沒有要還妳。」：（她笑出來，眼眶紅了一下。）「……那我喝了。」「很幼稚耶。」',J(L.slice(-3))===J(['（她笑出來，眼眶紅了一下。）','……那我喝了。','很幼稚耶。'])&&G.flags.ZR_HE_ORDERED===true,J(L.slice(-4))); }
  { fresh('2028-06-09',15,'cafe'); R13(); CG_REGISTRY.cg_cup_words_heroine02={file:'x'}; picks=[0,0]; await ROM1016.hisOrderOffer(GM); delete CG_REGISTRY.cg_cup_words_heroine02;
    check('1. CG：BCG-08「杯子上的字」（cg_cup_words_heroine02，登錄了才放）',cgs.includes('cg_cup_words_heroine02'),J(cgs)); }

  /* ======================= 2 沛珊 5-1 ======================= */
  const goWaited=()=>{ fresh('2027-11-17',22,'dorm'); date(PS); };
  goWaited(); check('2. 前提：2027-11-19 她在台南（放榜以後在台南念書）',(DATE.whereOn(G,PS,D('2027-11-19'))||{}).city==='台南',J(DATE.whereOn(G,PS,D('2027-11-19'))));
  rules(); const t0=txt(PS).length; at('2027-11-17',23.2); rules();
  check('2. 11/17（三）23:10 私訊三則（不是 23:10 以前）',t0===0&&J(txt(PS))===J(['這週五你會來嗎','課輔班七點下課。你可以早二十分鐘到嗎','想讓你看一個東西，不是什麼大事']),J(txt(PS)));
  PHONE.answer(G,'ps_waited_ask',0); rules(); const q1=OUT.get(G,'ps_waited_1');
  check('2. 「好。我搭下午的高鐵。」→「好！！」；排進 11/19（五）18:40 去台南（高鐵約一小時四十分鐘）',J(txt(PS).slice(-2))===J(['我:好。我搭下午的高鐵。','好！！'])&&!!q1&&q1.day===D('2027-11-19')&&Math.abs(q1.h-(18+40/60))<1e-6&&q1.travel==='高鐵約一小時四十分鐘'&&q1.ev==='ev_peishan_waited',J({t:txt(PS).slice(-2),q1}));
  { const m=G.money, c0=DATE.log(G,PS).count|0; at('2027-11-19',16.75); picks=['出發',0]; said=[]; await tick(); const L=lines();
    check('2. 16:45 出發 → 18:40 到：隔著玻璃門……「你看到了嗎？」……選①「他後來有算對嗎？」→「還沒。他說下禮拜要再問一次。」「走吧，我好餓。」晚餐那一句',L.includes('（隔著玻璃門。她站在白板前面，一個小男生舉手問了什麼。她沒有回答，蹲下來，和他一樣高，等。）')&&L.includes('（下課，走出來）你看到了嗎？')&&L.includes('還沒。他說下禮拜要再問一次。')&&L.includes('走吧，我好餓。')&&L.includes('（晚餐在她學校後門的小麵店。九點，她送你到車站。）'),J(L));
    check('2. 記 PS_WAITED；高鐵票 2,700；那一天算一次正式校外約會（AA_349 K3）；回到臺北 22:45',G.flags.PS_WAITED===true&&m-G.money===2700&&(DATE.log(G,PS).count|0)===c0+1&&Math.abs(G.hour-22.75)<1e-6,J({m:m-G.money,h:G.hour,c:DATE.log(G,PS).count})); }
  goWaited(); at('2027-11-17',23.2); rules(); PHONE.answer(G,'ps_waited_ask',0); rules();
  { at('2027-11-19',17.05); await tick(); const q=OUT.get(G,'ps_waited_1'), q2=OUT.get(G,'ps_waited_2'); at('2027-11-19',19.2); rules();
    check('2. 沒到（17:00 還沒出發＝18:45 到不了）：19:10「你沒來得及」「沒關係，下週五同一個時間，他說要再問一次」；改到 11/26（五）18:40',q.state==='missed'&&J(txt(PS).slice(-2))===J(['你沒來得及','沒關係，下週五同一個時間，他說要再問一次'])&&!!q2&&q2.day===D('2027-11-26')&&!G.flags.PS_WAITED,J({t:txt(PS).slice(-2),q2})); }
  { at('2027-11-26',17.05); await tick(); at('2027-11-26',21.05); rules();
    check('2. 第二次也沒到：21:00「上禮拜那個小朋友今天又問了一次，我還是叫他自己想」「想了三分鐘，答錯，可是他很得意」，也記 PS_WAITED',J(txt(PS).slice(-2))===J(['上禮拜那個小朋友今天又問了一次，我還是叫他自己想','想了三分鐘，答錯，可是他很得意'])&&G.flags.PS_WAITED===true,J(txt(PS).slice(-2))); }
  goWaited(); at('2027-11-17',23.2); rules(); PHONE.answer(G,'ps_waited_ask',1); rules();
  check('2. 「這週可能不行。」→「好，沒關係～」；不排、不記',J(txt(PS).slice(-2))===J(['我:這週可能不行。','好，沒關係～'])&&!OUT.get(G,'ps_waited_1')&&!G.flags.PS_WAITED,J(txt(PS).slice(-2)));
  fresh('2027-11-17',23.2,'dorm'); G.contacts[PS]=1; SOCIAL.remember(PS,'FIRST_MET',''); rules();
  check('2. 沒有交往：不傳',txt(PS).length===0,J(txt(PS)));

  /* ======================= 3 沛珊 5-2 ======================= */
  const goPen=(route)=>{ fresh('2028-11-15',22,'dorm',route?{EXCHANGE_ROUTE:route}:{}); date(PS); at('2028-11-15',23.05); rules(); };
  goPen('TW');
  check('3. 2028-11-15（三）23:00 私訊兩則',J(txt(PS))===J(['週五七點下課，七點半在我們學校後門那間咖啡店','我帶作業，你帶你的']),J(txt(PS)));
  PHONE.answer(G,'ps_redpen_ask',0); rules();
  { const q=OUT.get(G,'ps_redpen'); at('2028-11-17',17.6); picks=['出發',1]; said=[]; await tick(); const L=lines();
    check('3. 「好。」→「好！！」；11/17（五）19:30：她改完第十二本……選②「那妳的作業，換我改一本。」→「不行。……好啦，你改一本。只能畫笑臉，不能打分數。」、九點半；記 PS_RED_PEN',!!q&&q.day===D('2028-11-17')&&Math.abs(q.h-19.5)<1e-6&&L.includes('（她改完第十二本作業，抬頭看你的筆記。）')&&L.includes('這裡你寫得特別快。')&&L.includes('不行。……好啦，你改一本。只能畫笑臉，不能打分數。')&&L.includes('（九點半，她陪你走到車站。）')&&G.flags.PS_RED_PEN===true,J(L)); }
  goPen('US'); check('3. 美國路線（那時候在美國）：沒有這一場',txt(PS).length===0&&!G.flags.PS_RED_PEN,J(txt(PS)));
  goPen('TW'); PHONE.answer(G,'ps_redpen_ask',1); rules();
  check('3. 「這週不行。」→「好～那下次」；不排',J(txt(PS).slice(-2))===J(['我:這週不行。','好～那下次'])&&!OUT.get(G,'ps_redpen'),J(txt(PS).slice(-2)));
  goPen('TW'); PHONE.answer(G,'ps_redpen_ask',0); rules();
  { at('2028-11-17',18.05); await tick(); at('2028-11-17',21.05); rules();
    check('3. 沒到（19:45 到不了）：21:00 照片（十二本作業疊好，最上面一本畫了一個笑臉）＋「十二本改完了」「你的那一題下次帶來，我幫你改」',J(txt(PS).slice(-3))===J(['📷（十二本作業疊好，最上面一本畫了一個笑臉。）','十二本改完了','你的那一題下次帶來，我幫你改'])&&!G.flags.PS_RED_PEN&&G.flags.PS_RED_PEN_SHORT!=null,J(txt(PS).slice(-3)));
    at('2028-11-25',15); said=[]; await OUT.runAfter(GM,{id:'hv_test',hv:{id:PS},day:G.day},null); const L=lines();
    check('3. 下一次去找她（台南、台中；送上車以前）：短版「這裡你寫得特別快。」到畫笑臉；記 PS_RED_PEN',J(L.slice(-4))===J(['這裡你寫得特別快。','我學生寫快的地方，通常是還沒想清楚。','（你看了第三段。……她說對了。）','（她在旁邊畫了一個笑臉，沒有說話，把本子推回來。）'])&&G.flags.PS_RED_PEN===true&&G.flags.PS_RED_PEN_SHORT==null,J(L)); }

  /* ======================= 4 可昕 K7 卡片 ======================= */
  fresh('2025-10-20',22,'dorm',{KX_ANNIV:{1:'wheel'}}); date(KX);
  { const L=STORY.roomItemList(G), it=L.find(r=>r[0]==='她的週年卡片'); picks=[0]; said=[];
    if(it&&typeof it[2]==='function') await it[2](GM); const S=lines();
    check('4. 房間物件「她的週年卡片」：第一頁照舊，「翻後面幾頁」→ 2024.8.23、2024.10.17、2025.2.13、2025.7.25（在家查的版本）、最後一頁「假設明年的今天，你還在——」下面空白；記 KX_CARD_READ',!!it&&typeof it[2]==='function'&&S[0]==='那天在最高的地方，你說在一起吧。我說好。'&&J(opts[0])===J(['翻後面幾頁','不看了'])&&S.includes('2024.8.23　遊覽車。你睡了一個小時。我手上那張名單，其實早就背好了。')&&S.includes('2025.7.25　掛掉電話以後，那幾句我打了又刪，刪到十點半。')&&S[S.length-2]==='假設明年的今天，你還在——'&&S[S.length-1]==='（下面空白。）'&&G.flags.KX_CARD_READ===true,J(S)); }
  fresh('2025-10-20',22,'dorm',{KX_ANNIV:{1:'wheel'},KH_GO:'bus'}); date(KX);
  { const it=STORY.roomItemList(G).find(r=>r[0]==='她的週年卡片'); picks=[0]; said=[]; await it[2](GM);
    check('4. 7/24 選了搭客運去高雄（KH_GO bus）：第 5 頁是客運版「我說我先回家。其實我在客運站對面坐了一個下午，六點半才傳給你。」',lines().includes('2025.7.25　我說我先回家。其實我在客運站對面坐了一個下午，六點半才傳給你。')&&!lines().includes('2025.7.25　掛掉電話以後，那幾句我打了又刪，刪到十點半。'),J(lines())); }
  fresh('2025-10-20',22,'dorm',{KX_ANNIV:{1:'wheel'}}); date(KX);
  { const it=STORY.roomItemList(G).find(r=>r[0]==='她的週年卡片'); picks=[1]; said=[]; await it[2](GM);
    check('4. 「不看了」：只看第一頁，不記 KX_CARD_READ',J(lines())===J(['那天在最高的地方，你說在一起吧。我說好。'])&&!G.flags.KX_CARD_READ,J(lines())); }
  fresh('2025-10-20',22,'dorm',{KX_ANNIV:{1:'missed'}}); date(KX);
  check('4. 週年沒去（missed）：當面給以前沒有這個房間物件（當晚她自己帶回去，AA_313 2-3 A）',!STORY.roomItemList(G).some(r=>r[0]==='她的週年卡片'));
  { const c=[]; c.push(ROM1016.cardDue(G)===1); G.day=D('2025-10-17'); c.push(ROM1016.cardDue(G)===0); G.day=D('2025-10-20');
    G.trips=[{trip:'t7',who:KX,day:G.day+1},{trip:'t8',who:'heroine_01',day:G.day+2}];
    c.push(ROM1016.kxFace({id:'date_t7',dateTrip:'t7',place:'政大'},G)===true&&ROM1016.kxFace({id:'kx_drift_r3',ev:'ev_kx_drift_r3',place:'視訊'},G)===false&&ROM1016.kxFace({id:'date_t8',dateTrip:'t8'},G)===false&&ROM1016.kxFace({id:'kx_drift_r4',ev:'ev_kx_drift_r4',place:'河堤'},G)===true);
    said=[]; c.push(await ROM1016.cardGive(GM)===true); c.push(J(lines())===J(['你那天沒來。我還在氣。','卡片還是給你。後面的，回去再看。'])&&said.every(x=>!!x.who));
    c.push(G.flags.KX_CARD_GIVEN&&G.flags.KX_CARD_GIVEN[1]===G.day); const it=STORY.roomItemList(G).find(r=>r[0]==='她的週年卡片'); c.push(!!it&&typeof it[2]==='function');
    said=[]; c.push(await ROM1016.cardGive(GM)===false&&!said.length);
    c.push(STORY.PRE_TALK.length>0);
    check('4. AA_438 第 2 節：沒去的之後第一次當面見面（出遊不是視訊、3D 跟她說話）她給卡片「你那天沒來。我還在氣。」「卡片還是給你。後面的，回去再看。」；週年當天不算；給了房間才有卡片、可以翻頁；第二次不再說',c.every(Boolean),J(c)); }
  { fresh('2026-10-20',20,'dorm',{KX_ANNIV:{1:'wheel',2:'missed'}}); date(KX); said=[]; const ok=ROM1016.cardDue(G)===2&&await ROM1016.cardGive(GM)===true&&G.flags.KX_CARD_GIVEN[2]===G.day;
    check('4. 第二年沒去：一樣當面給（房間只有第一年那張）',ok&&lines().length===2,J({due:ROM1016.cardDue(G),g:G.flags.KX_CARD_GIVEN})); }

  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
