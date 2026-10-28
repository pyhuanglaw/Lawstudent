// AA_347 法律系大一逐週覆蓋盤點＋補空白（AA-C 2026-10-21 定稿 83f130c0；任務 AA347-Y1-COVER-1021）——不需要瀏覽器。照 AA_347 第 7 節施工清單、第 8 節給 BB 的驗收情境寫：
//   0. 接線：index.html 載入 data/y1fill_events.js、y1fill3d.js（holff3d.js 之後、GAME.boot() 之前）；事件在 STORY_EVENTS；八則手機小事在 STORY.DAILY_PHONE；三個摘要日在 HOLFF.SUMS
//   1. 1-1 阿凱的國界（10/27 22:30 起、隔天晚上、10/29 以後不演；進門比 ev_dorm_late_kai 先；人已經在房間裡也算；10/30「法律系免簽」（AA 10-21 改）；KAI_TAPE＝rel_lines 好朋友那句）
//   2. 1-2 運動會（11/20 21:00 群組、去＝11/21 10:00 田徑場、不去／沒回／答應了沒到＝11:40 獎狀照片）　3. 1-3 期末範圍（11/26 22:10）
//   4. 2-1 寒假第 7 週（2/5 摘要日專用句、2/6 21:00 語彤、去＝2/7 18:00 麵店）　5. 3-1 期中考完（4/24 21:30；那天不加手機小事）
//   6. 3-2 大一下的手機小事八則（第 4 週起、條件、一天最多一則、阿凱的 App 隔兩週兩次、大一上沒有）　7. 4-1 暑假（7/29 兩版、8/18、8/25）
//   8. 5-1「冬天的衣服」紙箱（8/29 起房間物件、拆／先不拆、12/8「幸好那天拆了」、12/9 阿凱「你九月到現在都沒拆喔」、大四主線 11 的最後一箱）
// 修改前：沒有這兩個檔；載得到的部分照跑（每一項各自 FAIL）。用法：node tests/aa347_y1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0, passes=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; else passes++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/data/dorm_room_layout.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/story3d.js','src/holff3d.js','src/classes3d.js','src/data/y1fill_events.js','src/y1fill3d.js'];
const missing=FILES.filter(f=>!fs.existsSync(path.join(ROOT,f)));
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){},narrate(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], bgs=[], cards=[], phoneCalls=[], it0=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){ E.player.busy=true; },sceneEnd(){ E.player.busy=false; },face(){},cine(){},caption(a,b){ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  spawnCharacter(id,x,z,o){ const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:0}},lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; },removeNPC(id){ delete GM.npc[id]; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; },
  phoneThread:async(th,o)=>{ phoneCalls.push({th,day:G.day,hour:G.hour}); }};
ADV.setBg=b=>{ bgs.push(b); };
const has=n=>typeof globalThis[n]!=='undefined';
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
const fresh=(key,hour,zone,flags)=>{ const day=typeof key==='number'?key:D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); if(has('ROM')) ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; bgs=[]; cards=[]; phoneCalls=[]; GM.npc={}; E.npcs.length=0; E.interactables=[]; E.player.busy=false; E.zone={roomAt:()=>null,seats:[]}; ADV.active=false; EVENTS.running=null; if(has('Y1FILL')&&Y1FILL.reset) Y1FILL.reset(); if(STORY._fy) STORY._fy.reset(); return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const noodle=()=>{ PHONE.join(G,'noodle_team','麵店團'); for(const id of ['zhe','yu','classmate_bohan','heroine_03']) SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const msgOf=tag=>(G.msgs||[]).filter(m=>m.tag===tag).map(m=>(m.from||'')+':'+m.text);
const atOf=tag=>{ const m=(G.msgs||[]).find(x=>x.tag===tag); return m?Tm(m.day,m.h):null; };
const near=(a,b)=>a!=null&&a>=b-0.02&&a<b+0.26;   /* 到時間以後下一次跑手機規則（每 0.25 小時）才送出：照原本的時間或晚一格（同 r3_events_unit.js）*/
/* 照時間跑手機規則（每 step 小時一次，跨日、跨午夜）*/
const runTo=(key,h,step)=>{ step=step||0.25; const t1=Tm(typeof key==='number'?key:D(key),h); let t=Tm(G.day,G.hour); while(t<t1-1e-9){ t=Math.min(t1,t+step); G.day=Math.floor(t/24); G.weekday=wdOf(G.day); G.hour=+(t-G.day*24).toFixed(4); STORY.phoneRules(GM); PHONE.tick(G); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const play=async(id,pk)=>{ said=[]; opts=[]; caps=[]; bgs=[]; picks=[].concat(pk==null?[]:pk); const e=ev(id); if(!e) return null; await EVENTS.run(e); return lines(); };
const NAME=id=>SOCIAL.displayName(id);
const ans=(id,k)=>PHONE.answer(G,id,k);
const askOpts=id=>{ const m=PHONE.byAsk(G,id); return m?m.ask.opts.map(o=>o.t):null; };
const chk=(name,fn)=>{ let ok=false, info=''; try{ const r=fn(); ok=Array.isArray(r)?!!r[0]:!!r; if(Array.isArray(r)) info=r[1]; }catch(e){ ok=false; info='例外 '+(e&&e.message); } check(name,ok,info); };
const achk=async(name,fn)=>{ let ok=false, info=''; try{ const r=await fn(); ok=Array.isArray(r)?!!r[0]:!!r; if(Array.isArray(r)) info=r[1]; }catch(e){ ok=false; info='例外 '+(e&&e.message); } check(name,ok,info); };
const J=x=>JSON.stringify(x);
(async()=>{
  if(missing.length) console.log('（修改前：沒有 '+missing.join('、')+'）');
  // ===== 0. 接線 =====
  chk('0. index.html：holff3d.js → data/y1fill_events.js → y1fill3d.js → GAME.boot()',()=>{ const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src="src/holff3d.js'), b=h.indexOf('src="src/data/y1fill_events.js'), c=h.indexOf('src="src/y1fill3d.js'), z=h.indexOf('GAME.boot()'); return [a>0&&b>a&&c>b&&z>c,[a,b,c,z].join(',')]; });
  const IDS=['ev_kai_tape','ev_kai_tape2','ev_y1_relay','ev_y1w_noodle_last','ev_y1_cold_box_glad','ev_y1_cold_box_night'];
  chk('0. 事件都在 STORY_EVENTS（阿凱的國界兩則在最前面：進門的時候比其他宿舍事件先）',()=>[IDS.every(id=>!!ev(id))&&STORY_EVENTS[0].id==='ev_kai_tape'&&STORY_EVENTS[1].id==='ev_kai_tape2',IDS.filter(id=>!ev(id)).join('、')]);
  const DPIDS=['y1s2_kevin_parrot','y1s2_yu_curry','y1s2_zhe_three','y1s2_bohan_closed','y1s2_an_ac','y1s2_yt_board','y1s2_xinci_drama','y1s2_kai_app'];
  chk('0. 八則手機小事在 STORY.DAILY_PHONE、都是 term Y1S2（大一上、大二上不挑）',()=>{ const L=STORY.DAILY_PHONE||[]; const got=DPIDS.map(id=>L.find(d=>d.id===id)); return [got.every(d=>d&&d.term&&d.term({id:'Y1S2',week:4})&&!d.term({id:'Y1S1',week:4})&&!d.term({id:'Y2S1',week:4})),DPIDS.filter((id,i)=>!got[i]).join('、')]; });
  chk('0. HOLFF.SUMS 有 2/5、7/29、8/25；STORY.PHONE_RULES、STORY.TICKS 有掛',()=>[has('HOLFF')&&['2026-02-05','2026-07-29','2026-08-25'].every(k=>HOLFF.SUMS.some(s=>s.date===k))&&has('Y1FILL')&&STORY.PHONE_RULES.length>=2&&STORY.TICKS.length>=1]);

  // ===== 1. 1-1 阿凱的國界 =====
  const t27=D('2025-10-27'), t30=D('2025-10-30');
  chk('1. 10/27 是大一上第 9 週週一、10/30 週四',()=>{ const a=CALENDAR.termOf(t27), b=CALENDAR.termOf(t30); return a&&a.id==='Y1S1'&&a.week===9&&CALENDAR.dateOf(t27).wd===1&&CALENDAR.dateOf(t30).wd===4; });
  fresh(t27,22,'dorm'); R('kai','FAM');
  chk('1. 10/27 22:00 還沒（22:30 起）',()=>!!ev('ev_kai_tape')&&!EVENTS.check(ev('ev_kai_tape')));
  chk('1. 10/27 22:30 起、熬夜到 10/28 02:00 都算第一晚',()=>{ G.hour=22.5; const a=EVENTS.check(ev('ev_kai_tape')); G.hour=26; const b=EVENTS.check(ev('ev_kai_tape')); return [a&&b,a+','+b]; });
  chk('1. 當天沒回宿舍＝隔天（10/28）晚上 18:00 以後；10/28 白天不算；10/29 以後才回來的不演',()=>{ const r=[]; for(const [d,h] of [[t27+1,17.9],[t27+1,18],[t27+1,23],[t27+1,26.9],[t27+1,27],[t27+2,20]]){ G.day=d; G.hour=h; r.push(EVENTS.check(ev('ev_kai_tape'))); } return [J(r)===J([false,true,true,true,false,false]),J(r)]; });
  chk('1. 不是大一同房（大二搬進 312 以後的舊存檔）：不演',()=>{ G.day=t27; G.hour=23; G.flags.ROOM_Y2=1; const r=EVENTS.check(ev('ev_kai_tape')); delete G.flags.ROOM_Y2; return !r; });
  await achk('1. 10/27 23:00 走進房間：先演國界（同一個晚上的 ev_dorm_late_kai 排在後面）——旁白、兩句、兩個選項；「好。」→「謝謝配合。」；記 KAI_TAPE',async()=>{ fresh(t27,23,'dorm'); R('kai','FAM'); const r0=Math.random; Math.random=()=>0; said=[]; opts=[]; picks=[0];
    try{ EVENTS.onEnter('dorm'); for(let i=0;i<20&&EVENTS.running;i++) await new Promise(r=>setImmediate(r)); } finally { Math.random=r0; } const T=lines(), K=NAME('kai');
    return [J(T)===J(['（阿凱蹲在地上，用紙膠帶繞著他那組床和書桌貼了一圈。）',K+'：期中考週。這裡是國界。',K+'：……過了這條線要安靜。我在寫作業。',K+'：謝謝配合。'])&&J(opts[0])===J(['「好。」','「那我的零食還在你桌上。」'])&&G.flags.KAI_TAPE===true&&!(G.events.done.ev_dorm_late_kai),J(T)+' '+J(opts)]; });
  await achk('1. 選「那我的零食還在你桌上。」→「……入境申請另外辦。」',async()=>{ fresh(t27,22.75,'dorm'); R('kai','FAM'); const T=await play('ev_kai_tape',[1]); return [T&&T[T.length-1]===NAME('kai')+'：……入境申請另外辦。'&&G.flags.KAI_TAPE===true,J(T)]; });
  await achk('1. 22:00 就回房間、一直待著：22:30 一到也演（STORY.tick → TICKS；至少等三次 tick，低幀率一次好幾秒也一樣）',async()=>{ fresh(t27,22,'dorm'); R('kai','FAM'); STORY.tick(GM,1.5); const before=!!G.events.done.ev_kai_tape; G.hour=22.5; STORY.tick(GM,8); const mid=!!G.events.done.ev_kai_tape||!!EVENTS.running; STORY.tick(GM,8); STORY.tick(GM,8); for(let i=0;i<20&&EVENTS.running;i++) await new Promise(r=>setImmediate(r));
    return [!before&&!mid&&!!G.events.done.ev_kai_tape&&G.flags.KAI_TAPE===true,before+','+mid+','+!!G.events.done.ev_kai_tape]; });
  chk('1. 三天後那一則：第一晚沒演的沒有；10/30 17:59 還沒、18:00 以後第一次回房間；11/3 以後不演',()=>{ fresh(t30,18.5,'dorm'); R('kai','FAM'); const a=EVENTS.check(ev('ev_kai_tape2')); G.events.done.ev_kai_tape=1; G.flags.KAI_TAPE=true; G.hour=17.98; const b=EVENTS.check(ev('ev_kai_tape2')); G.hour=18; const c=EVENTS.check(ev('ev_kai_tape2')); G.day=t30+2; G.hour=22; const d=EVENTS.check(ev('ev_kai_tape2')); G.day=t30+4; G.hour=20; const e=EVENTS.check(ev('ev_kai_tape2'));
    return [!a&&!b&&c&&d&&!e,[a,b,c,d,e].join(',')]; });
  await achk('1. 10/30：「（膠帶上多了一行麥克筆的大字：「法律系免簽」。）」阿凱「（沒有回頭）期中考完了。國界放寬。」，沒有選項',async()=>{ fresh(t30,19,'dorm',{KAI_TAPE:true}); G.events.done.ev_kai_tape=1; R('kai','FAM'); const T=await play('ev_kai_tape2'); return [J(T)===J(['（膠帶上多了一行麥克筆的大字：「法律系免簽」。）',NAME('kai')+'：（沒有回頭）期中考完了。國界放寬。'])&&opts.length===0,J(T)]; });
  chk('1. Y1-B KAI_TAPE 讀的那一句：和阿凱升到好朋友（大一）＝「（地上的紙膠帶不見了。）」「膠帶我撕掉了啦，反正你一直過來。」',()=>{ fresh(t30+20,20,'dorm'); R('kai','CLO'); const py=SOCIAL.playerYear; SOCIAL.playerYear=()=>1; let a,b; try{ a=SOCIAL.upLine('kai'); G.flags.KAI_TAPE=true; b=SOCIAL.upLine('kai'); } finally { SOCIAL.playerYear=py; }
    return [a&&a.l[0]!=='（地上的紙膠帶不見了。）'&&b&&J(b.l)===J(['（地上的紙膠帶不見了。）','「膠帶我撕掉了啦，反正你一直過來。」']),J(b)]; });
  { fresh(t30+20,20,'dorm'); R('kai','CLO'); G.flags.KAI_TAPE=true; const py=SOCIAL.playerYear; SOCIAL.playerYear=()=>1; let before,after,err=null; try{ before=!!G.flags.KAI_TAPE_GONE; await SOCIAL.playUp(GM,null,'kai'); after=G.flags.KAI_TAPE_GONE===true; }catch(e){ err=e.message; } finally { SOCIAL.playerYear=py; }
    const zs=require('fs').readFileSync(require('path').join(__dirname,'..','src/zones3d.js'),'utf8');
    check('1. Y1-B 那一句演完記 KAI_TAPE_GONE（203 地上的 3D 膠帶跟著拿掉，LAWWW2 ART-Y1-BOX-1021）；沒演以前沒有；zones3d.js 的 y1State 讀它',!err&&!before&&after&&/tape:!!F\.KAI_TAPE&&mate&&!F\.KAI_TAPE_GONE/.test(zs),J({before,after,err})); }
  await achk('1. 一般玩家照時間走：10/27 晚上在宿舍＝KAI_TAPE 有人設（修改前沒有任何地方設）',async()=>{ fresh(t27,23,'dorm'); R('kai','FAM'); EVENTS.onEnter('dorm'); for(let i=0;i<20&&EVENTS.running;i++) await new Promise(r=>setImmediate(r)); return G.flags.KAI_TAPE===true; });

  // ===== 2. 1-2 運動會 =====
  const r20=D('2025-11-20'), r21=D('2025-11-21');
  chk('2. 11/20 週四、11/21 週五運動會停課（calendar.js）',()=>CALENDAR.dateOf(r20).wd===4&&/運動會/.test(CALENDAR.holiday(r21)||''));
  fresh(r20,8,'dorm'); noodle(); runTo(r20,8.25);
  chk('2. 那天一開始就排好（每天的手機小事看得到今天有劇情訊息），21:00 才出現',()=>PHONE.sent(G,'y1_relay_ask')&&!msgOf('y1_relay_ask').length);
  runTo(r20,21.25);
  chk('2. 11/20 21:00 麵店團群組：阿哲「明天運動會」「系上大隊接力 我跑第三棒」「來看」＋「去。」「不去。」（到 11/21 10:00）',()=>{ const m=PHONE.byAsk(G,'y1_relay_ask'); return [J(msgOf('y1_relay_ask'))===J(['zhe:明天運動會','zhe:系上大隊接力 我跑第三棒','zhe:來看'])&&TH('g:noodle_team').some(x=>x.text==='來看')&&near(atOf('y1_relay_ask'),Tm(r20,21))&&J(askOpts('y1_relay_ask'))===J(['去。','不去。'])&&m.ask.until===Tm(r21,10),J(msgOf('y1_relay_ask'))+' '+J(askOpts('y1_relay_ask'))]; });
  chk('2. 回「去。」＝排出遊 11/21 10:00 田徑場',()=>{ ans('y1_relay_ask',0); STORY.phoneRules(GM); const q=OUT.get(G,'y1_relay'); return [G.flags.Y1_RELAY==='go'&&!!q&&q.day===r21&&q.h===10&&q.place==='田徑場'&&q.ev==='ev_y1_relay'&&q.state==='planned',J(q)]; });
  await achk('2. Y1-C 11/21 田徑場：字幕「田徑場」、校園的背景；大隊接力第五名、阿哲「第五名耶！」、舉著獎狀',async()=>{ G.day=r21; G.hour=10; const T=await play('ev_y1_relay'); return [J(T)===J(['（大隊接力。阿哲接棒的時候掉了一次，撿起來，還是追過了一個人。法律系第五名。）',NAME('zhe')+'：第五名耶！','（他舉著獎狀跑過來，比拿第一名的人還開心。）'])&&caps.includes('田徑場')&&bgs.some(b=>b&&b.image&&/ntu_avenue/.test(b.image))&&G.flags.Y1_RELAY==='went',J(T)+' '+J(caps)]; });
  chk('2. 去了的：11:40 沒有獎狀照片',()=>{ G.day=r21; G.hour=12; runTo(r21,13); return !PHONE.sent(G,'y1_relay_photo'); });
  for(const [name,how] of [['回「不去。」',()=>ans('y1_relay_ask',1)],['沒回（＝不去那一版）',()=>{}],['答應了沒到',()=>{ ans('y1_relay_ask',0); }]]){
    fresh(r20,20,'dorm'); noodle(); runTo(r20,21.25); how(); runTo(r21,11.5);
    const early=PHONE.sent(G,'y1_relay_photo'); if(name==='答應了沒到'){ const q=OUT.get(G,'y1_relay'); if(q) q.state='missed'; } runTo(r21,11.75);
    chk('2. '+name+'：11:40 群組「📷（獎狀：大隊接力第五名）」Alison「第五名有獎狀喔」阿哲「有 參加獎等級的那種」（11:40 以前沒有）',()=>[!early&&J(msgOf('y1_relay_photo'))===J(['zhe:📷（獎狀：大隊接力第五名）','yu:第五名有獎狀喔','zhe:有 參加獎等級的那種'])&&near(atOf('y1_relay_photo'),Tm(r21,11+40/60)),name+' '+early+' '+J(msgOf('y1_relay_photo'))]); }
  { fresh(r20,20,'dorm'); noodle(); G.contacts=G.contacts||{}; G.contacts.zhe=r20-30; runTo(r20,21.25); ans('y1_relay_ask',1); runTo(r21,12.5);
    chk('2. AA_350 O4：沒去的，12:10 阿哲私訊「你沒來」「下次系籃要來喔」（不扣好感）',()=>[J(msgOf('y1_relay_miss'))===J(['zhe:你沒來','zhe:下次系籃要來喔'])&&near(atOf('y1_relay_miss'),Tm(r21,12+10/60)),J(msgOf('y1_relay_miss'))]);
    fresh(r20,20,'dorm'); noodle(); G.contacts=G.contacts||{}; G.contacts.zhe=r20-30; runTo(r20,21.25); ans('y1_relay_ask',0); G.flags.Y1_RELAY='went'; runTo(r21,12.5);
    chk('2. AA_350 O4：去了的沒有那則私訊',()=>!PHONE.sent(G,'y1_relay_miss')); }
  chk('2. 回「不去。」：不排出遊',()=>{ fresh(r20,20,'dorm'); noodle(); runTo(r20,21.25); ans('y1_relay_ask',1); runTo(r20,22); return !OUT.get(G,'y1_relay')&&G.flags.Y1_RELAY==='no'; });
  chk('2. 不在麵店團群組：沒有',()=>{ fresh(r20,20,'dorm'); runTo(r21,12); return !PHONE.sent(G,'y1_relay_ask')&&!PHONE.sent(G,'y1_relay_photo'); });

  // ===== 3. 1-3 期末範圍 =====
  const f26=D('2025-11-26');
  chk('3. 11/26（三）22:10 麵店團群組：Alison 兩則（不打句號）、柏翰「第九講。投影片最後一頁有寫。」、Alison「……謝謝柏翰」、阿哲的貼圖',()=>{ fresh(f26,9,'dorm'); noodle(); runTo(f26,22); const early=msgOf('y1_final_scope').length; runTo(f26,22.25);
    return [!early&&CALENDAR.dateOf(f26).wd===3&&J(msgOf('y1_final_scope'))===J(['yu:期末範圍公布了','yu:憲法考到第八講','classmate_bohan:第九講。投影片最後一頁有寫。','yu:……謝謝柏翰','zhe:（貼圖：一隻趴在桌上的狗）'])&&near(atOf('y1_final_scope'),Tm(f26,22+10/60)),J(msgOf('y1_final_scope'))]; });

  // ===== 4. 2-1 寒假第 7 週 =====
  const w5=D('2026-02-05'), w6=D('2026-02-06'), w7=D('2026-02-07');
  chk('4. 2/5 摘要日（快轉停在 18:30）：日期卡下面那一行換成「（寒假第七週。你把大一上的筆記裝進一個紙箱，箱子外面寫「大一上」。比你想的重。）」',()=>{ fresh(w5-1,10,'dorm'); const l=has('HOLFF')?HOLFF.cardLine(G,Tm(w5,18.5)):null; return [l==='（寒假第七週。你把大一上的筆記裝進一個紙箱，箱子外面寫「大一上」。比你想的重。）'&&HOME.breakNext(G)===Tm(w5,18.5),l]; });
  await achk('4. 從 2/2 在宿舍快轉「到下一個有事的日子」：停在 2/5 18:30，日期卡寫那一句',async()=>{ fresh('2026-02-02',10,'dorm'); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); const c=cards[0]||[]; return [G.day===w5&&Math.abs(G.hour-18.5)<1e-6&&c[1]==='（寒假第七週。你把大一上的筆記裝進一個紙箱，箱子外面寫「大一上」。比你想的重。）',J(cards)]; });
  fresh(w6,10,'dorm'); noodle(); runTo(w6,21.25);
  chk('4. 2/6（五）21:00 麵店團群組：語彤「下禮拜二開始店休，到初三。」「要吃的這個週末來。」＋「去。」「不去。」',()=>[J(msgOf('y1w_noodle_last_ask'))===J(['heroine_03:下禮拜二開始店休，到初三。','heroine_03:要吃的這個週末來。'])&&near(atOf('y1w_noodle_last_ask'),Tm(w6,21))&&J(askOpts('y1w_noodle_last_ask'))===J(['去。','不去。']),J(msgOf('y1w_noodle_last_ask'))]);
  chk('4. 回「去。」＝排出遊 2/7（六）18:00 麵店',()=>{ ans('y1w_noodle_last_ask',0); STORY.phoneRules(GM); const q=OUT.get(G,'y1w_noodle_last'); return [!!q&&q.day===w7&&q.h===18&&q.ev==='ev_y1w_noodle_last'&&CALENDAR.dateOf(w7).wd===6,J(q)]; });
  await achk('4. 2/7 麵店：「（過年前最後一個週末。長桌只坐了三個人，阿姨多給每個人一顆滷蛋，說是提早發的紅包。）」（阿鳳麵店・長桌）',async()=>{ G.day=w7; G.hour=18; const T=await play('ev_y1w_noodle_last'); return [J(T)===J(['（過年前最後一個週末。長桌只坐了三個人，阿姨多給每個人一顆滷蛋，說是提早發的紅包。）'])&&caps.includes('阿鳳麵店・長桌'),J(T)]; });
  chk('4. 回「不去。」或沒回：沒有後續',()=>{ fresh(w6,20,'dorm'); noodle(); runTo(w6,21.25); ans('y1w_noodle_last_ask',1); runTo(w7,20); const a=!OUT.get(G,'y1w_noodle_last'); fresh(w6,20,'dorm'); noodle(); runTo(w7,20); return a&&!OUT.get(G,'y1w_noodle_last'); });
  await achk('4. 寒假在宿舍快轉：2/6 21:00 收到要回的訊息就停下來、打開手機',async()=>{ fresh(w5,19,'dorm'); noodle(); picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); return [phoneCalls.length>0&&phoneCalls[0].day===w6&&Math.abs(phoneCalls[0].hour-21)<0.3,J(phoneCalls)]; });

  // ===== 5. 3-1 期中考完 =====
  const m24=D('2026-04-24');
  chk('5. 4/24（五，大一下第 9 週）21:30 麵店團群組：Alison「期中考完的人 舉手」阿哲「🙋」柏翰「我還有一科。」Alison「柏翰 那你為什麼在這裡」柏翰「……我去念書了。」',()=>{ fresh(m24,9,'dorm'); noodle(); runTo(m24,21.75); const t=CALENDAR.termOf(m24);
    return [t&&t.id==='Y1S2'&&t.week===9&&J(msgOf('y1s2_mid_done'))===J(['yu:期中考完的人 舉手','zhe:🙋','classmate_bohan:我還有一科。','yu:柏翰 那你為什麼在這裡','classmate_bohan:……我去念書了。'])&&near(atOf('y1s2_mid_done'),Tm(m24,21.5)),J(msgOf('y1s2_mid_done'))]; });

  // ===== 6. 3-2 大一下的手機小事八則 =====
  const typical=(d0,days)=>{ fresh(d0,7,'dorm'); noodle(); PHONE.join(G,'family_law','法律系直屬家族'); R('heroine_01','FAM'); R('heroine_03','FAM'); R('classmate_xinci','ACQ'); R('kai','FAM');
    G.contacts.heroine_01=0; G.contacts.classmate_xinci=0; G.contacts.heroine_03=0; G.flags.ndlDays=[D('2026-03-05')];   /* 3/5 週四在麵店；語彤要有聯絡方式（AA_350 O6）*/
    for(let k=0;k<days;k++){ G.day=d0+k; G.weekday=wdOf(G.day); G.hour=7; for(let h=7;h<=23.95;h+=0.25){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } } };
  const wk4=STORY.termDay('Y1S2',4,1);
  typical(wk4,77);
  const N=G.flags.dpN||{}, DAY=G.flags.dpDayOf||{};
  chk('6. Y1-D 大一下第 4 週起：八則都出現（阿凱的 App 兩次、其他各一次）',()=>[DPIDS.every(id=>(N[id]|0)===(id==='y1s2_kai_app'?2:1)),J(DPIDS.map(id=>id+':'+(N[id]|0)))]);
  const P=th=>TH(th).map(m=>m.text);
  /* 2026-10-28 改：AA_497 5-4（企劃線 7a38216ca）Kevin 的動物影片保留前 2 則，第 5 則（鸚鵡）照原本的日期換成「考古題資料夾我整理了一個晚上 ……已刪除」，跟著影片的學姊「七八五十六。」拿掉（tests/aa497_supporting_unit.js 5-4）*/
  chk('6. 家族群組 21:18：Kevin「考古題資料夾我整理了一個晚上 發現有一份是我大一自己寫錯的答案 已刪除」（AA_497 5-4；原本的鸚鵡影片＋學姊「七八五十六。」換掉）',()=>{ const L=TH('g:family_law'), i=L.findIndex(m=>m.text==='考古題資料夾我整理了一個晚上 發現有一份是我大一自己寫錯的答案 已刪除'); return [i>=0&&L[i].name==='Kevin'&&!L.some(m=>m.text==='七八五十六。'||/鸚鵡/.test(m.text))&&near(L[i].h,21.3),J(L.map(m=>m.text))]; });
  chk('6. 麵店團 12:30 Alison 的咖哩飯「這個比例是違憲的」、柏翰「比例原則不是這樣用的。」、Alison「我知道 我在用」',()=>{ const L=TH('g:noodle_team'), i=L.findIndex(m=>m.text==='📷（學生餐廳的咖哩飯，飯比咖哩多很多）'); return [i>=0&&J(L.slice(i,i+4).map(m=>m.from+':'+m.text))===J(['yu:📷（學生餐廳的咖哩飯，飯比咖哩多很多）','yu:這個比例是違憲的','classmate_bohan:比例原則不是這樣用的。','yu:我知道 我在用'])&&near(L[i].h,12.5),J(L.slice(i,i+4).map(m=>m.text))]; });
  chk('6. 麵店團 22:40 阿哲「系籃練習 今天投進三顆」「三十顆裡面」、Alison「進步了」；22:10 柏翰「總圖十點關。」「我被趕出來了。」、阿哲「你根本住那裡吧」（AA_373 #19：原本 23:10「總圖今天十一點關。」）',()=>{ const L=TH('g:noodle_team'), a=L.findIndex(m=>m.text==='系籃練習 今天投進三顆'), b=L.findIndex(m=>m.text==='總圖十點關。');
    return [a>=0&&b>=0&&J(L.slice(a,a+3).map(m=>m.from+':'+m.text))===J(['zhe:系籃練習 今天投進三顆','zhe:三十顆裡面','yu:進步了'])&&J(L.slice(b,b+3).map(m=>m.from+':'+m.text))===J(['classmate_bohan:總圖十點關。','classmate_bohan:我被趕出來了。','zhe:你根本住那裡吧'])&&near(L[a].h,22+40/60)&&near(L[b].h,22+10/60)]; });
  chk('6. 私訊：以安 15:20「總圖三樓的冷氣壞了。」「我換到二樓。……二樓的也壞了。」；語彤 17:40 黑板照片、「阿姨說不要改。客人看得懂。」；芯慈 23:30《檔案室的燈》三則',()=>[J(P('p:heroine_01').slice(-2))===J(['總圖三樓的冷氣壞了。','我換到二樓。……二樓的也壞了。'])&&near(TH('p:heroine_01').slice(-2)[0].h,15+20/60)
    &&J(P('p:heroine_03').slice(-2))===J(['📷（麵店門口的黑板，今天的小菜寫錯一個字）','阿姨說不要改。客人看得懂。'])&&near(TH('p:heroine_03').slice(-2)[0].h,17+40/60)
    &&J(P('p:classmate_xinci').slice(-3))===J(['最近在追《檔案室的燈》。','第三集有一個律師講錯了一條。','……我還是會看完。'])&&near(TH('p:classmate_xinci').slice(-3)[0].h,23.5),J([P('p:heroine_01'),P('p:heroine_03'),P('p:classmate_xinci')])]);
  chk('6. 阿凱 22:05「我做了一個 App」「宿舍洗衣機排隊用的」「你下載一下 拜託」；兩週以後同一則的後半「目前使用者：五人」「我 你 還有三個我不認識的」',()=>{ const L=TH('p:kai'), a=L.find(m=>m.text==='我做了一個 App'), b=L.find(m=>m.text==='目前使用者：五人');
    return [a&&b&&J(P('p:kai').filter(t=>/App|洗衣機|下載|使用者|不認識/.test(t)))===J(['我做了一個 App','宿舍洗衣機排隊用的','你下載一下 拜託','目前使用者：五人','我 你 還有三個我不認識的'])&&b.day-a.day>=14&&near(a.h,22+5/60),J(P('p:kai'))+' '+(a&&b?b.day-a.day:'')]; });
  chk('6. 一天最多一則；4/24（群組的劇情訊息那天）不加',()=>{ const days={}; for(const m of (G.msgs||[])) if(m.tag&&/^dp_y1s2_/.test(m.tag)){ const id=m.tag.replace(/^dp_/,'').replace(/_\d+_\d+$/,''); days[m.day]=days[m.day]||new Set(); days[m.day].add(id); }
    const multi=Object.keys(days).filter(d=>days[d].size>1); return [!multi.length&&!days[m24],J(multi)]; });
  chk('6. 條件不到就跳過：沒有群組、沒有聯絡方式、不熟、沒去過週四麵店＝只有阿凱那則（大一同房）',()=>{ fresh(wk4,7,'dorm'); for(let k=0;k<40;k++){ G.day=wk4+k; G.weekday=wdOf(G.day); for(let h=7;h<=23.95;h+=0.25){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } }
    const n=G.flags.dpN||{}; return [DPIDS.filter(id=>n[id]).join(',')==='y1s2_kai_app',J(n)]; });
  chk('6. 語彤那則要去過週四的麵店：只去過週二的不出',()=>{ fresh(wk4,7,'dorm'); R('heroine_03','FAM'); G.flags.ndlDays=[D('2026-03-03')]; for(let k=0;k<30;k++){ G.day=wk4+k; G.weekday=wdOf(G.day); for(let h=7;h<=23.95;h+=0.25){ G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); } } const a=!(G.flags.dpN||{}).y1s2_yt_board;
    return [a&&has('Y1FILL')&&Y1FILL.thuNoodle({flags:{},habits:{'place:noodle:evening':{days:[D('2026-03-05')]}}})&&!Y1FILL.thuNoodle({flags:{},habits:{'place:noodle:evening':{days:[D('2026-03-03')]}}})]; });
  chk('6. 大一上（第 4 週起）：這八則一則都不出現',()=>{ typical(STORY.termDay('Y1S1',4,1),30); const n=G.flags.dpN||{}; return [!DPIDS.some(id=>n[id]),J(DPIDS.filter(id=>n[id]))]; });

  // ===== 7. 4-1 暑假 =====
  const s29=D('2026-07-29'), s18=D('2026-08-18'), s25=D('2026-08-25');
  chk('7. 7/29 新的摘要日：快轉停在 18:30；續住宿舍「（七月底。宿舍的走廊只開一半的燈。）」、回家住「（七月底。你陪媽媽去了一趟大賣場，推車是你推的。）」',()=>{ fresh(s29-2,10,'dorm'); const stop=HOME.breakNext(G)===Tm(s29,18.5), a=has('HOLFF')?HOLFF.cardLine(G,Tm(s29,18.5)):null; HOME.rec(G).stay={Y1S:'home'}; const b=has('HOLFF')?HOLFF.cardLine(G,Tm(s29,18.5)):null;
    return [stop&&a==='（七月底。宿舍的走廊只開一半的燈。）'&&b==='（七月底。你陪媽媽去了一趟大賣場，推車是你推的。）',stop+' '+a+' '+b]; });
  await achk('7. 從 7/27 在家快轉（選了「暑假回家住」）：停在 7/29 18:30，日期卡寫回家住那一句',async()=>{ fresh(s29-2,10,'dorm'); const H=HOME.rec(G); H.stay={Y1S:'home'}; H.at=true; H.day=G.day; const B=HOME.lawBreak(G); H.lbreak=B.key; H.brk=B.key; H.bskip={key:B.key,n:0,last:-1};
    picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'home'); const c=cards[cards.length-1]||[]; return [G.day===s29&&Math.abs(G.hour-18.5)<1e-6&&c[1]==='（七月底。你陪媽媽去了一趟大賣場，推車是你推的。）',J(cards)]; });   /* X58（10-27）：途中收到訊息會先停一次（那張卡在前面），看最後一張 */
  chk('7. 8/18（二）21:00 麵店團群組：Alison「暑假還在臺北的 舉手」柏翰「新竹。」Alison「你那個不叫舉手」',()=>{ fresh(s18,9,'dorm'); noodle(); runTo(s18,21.25); return [CALENDAR.dateOf(s18).wd===2&&J(msgOf('y1s_still_taipei'))===J(['yu:暑假還在臺北的 舉手','classmate_bohan:新竹。','yu:你那個不叫舉手'])&&near(atOf('y1s_still_taipei'),Tm(s18,21)),J(msgOf('y1s_still_taipei'))]; });
  chk('7. 8/25 摘要日：「（暑假剩兩個禮拜。你先把大二上的兩本課本買了。比大一的厚。）」（AA_369 L6）',()=>{ fresh(s25-1,10,'dorm'); const l=has('HOLFF')?HOLFF.cardLine(G,Tm(s25,18.5)):null; return [l==='（暑假剩兩個禮拜。你先把大二上的兩本課本買了。比大一的厚。）',l]; });
  chk('7. 那天出國（例：8/25 報名的假期活動）：照 HOME.sumSkip 不停、不出',()=>{ fresh(s25-1,10,'dorm'); OUT.plan(G,{id:'t_vac',ev:'ev_x',day:s25,h:10,place:'x',title:'x',vac:{key:'T@Y1',k:0}}); return has('HOLFF')&&HOLFF.cardLine(G,Tm(s25,18.5))==null; });

  // ===== 8. 5-1「冬天的衣服」紙箱 =====
  const b29=D('2025-08-29'), cold=STORY.firstColdDay();
  chk('8. 寒流日＝大一上第 15 週週一 12/8',()=>CALENDAR.dateOf(cold).key==='2025-12-08');
  const boxIt=()=>E.interactables.find(it=>it&&it.y1WinterBox);
  chk('8. 8/29 起，大一的房間床底下有「床底下的紙箱」（互動點在玩家那組床的書桌和梯子中間）；8/28、別的區域、大二的房間沒有',()=>{ fresh(b29-1,20,'dorm'); STORY.tick(GM,0.5); const a=!!boxIt(); fresh(b29,20,'dorm'); STORY.tick(GM,0.5); const it=boxIt(); const b=!!it&&it.label==='床底下的紙箱'&&Math.abs(it.x+1.55)<0.01&&it.z>0.3&&it.z<0.95;
    G.zone='campus'; E.interactables=[]; STORY.tick(GM,0.5); const c=!!boxIt(); fresh(D('2026-09-10'),20,'dorm',{ROOM_Y2:D('2026-09-06')}); STORY.tick(GM,0.5); const d=!!boxIt(); return [!a&&b&&!c&&!d,[a,b,c,d].join(',')+' '+J(it)]; });
  await achk('8. 點紙箱：「（床底下的紙箱。上面是媽媽的字：「冬天的衣服」。）」→「拆。」「先不拆。」；先不拆＝沒有後續、下次還可以點',async()=>{ fresh(b29+10,21,'dorm'); STORY.tick(GM,0.5); picks=[1]; it0=boxIt(); it0.onInteract(it0); for(let i=0;i<10;i++) await new Promise(r=>setImmediate(r));
    return [J(lines())===J(['（床底下的紙箱。上面是媽媽的字：「冬天的衣服」。）'])&&J(opts[0])===J(['拆。','先不拆。'])&&!G.flags.BOX_WINTER_OPEN&&!!boxIt(),J(lines())+' '+J(opts)]; });
  await achk('8. 「拆。」→「（你把外套掛進衣櫃。紙箱摺好，塞回床底下。）」、記 BOX_WINTER_OPEN（存檔裡）、互動點收掉',async()=>{ said=[]; opts=[]; picks=[0]; await Y1FILL.boxScene(GM); const saved=JSON.parse(JSON.stringify(G));
    return [J(lines())===J(['（床底下的紙箱。上面是媽媽的字：「冬天的衣服」。）','（你把外套掛進衣櫃。紙箱摺好，塞回床底下。）'])&&G.flags.BOX_WINTER_OPEN===true&&saved.flags.BOX_WINTER_OPEN===true&&!boxIt(),J(lines())]; });
  await achk('8. Y1-E 拆過的：12/8 第一次醒來（宿舍房間）「（寒流來了。你從衣櫃拿出外套。……幸好那天拆了。）」，只一次',async()=>{ fresh(cold,7.5,'dorm',{BOX_WINTER_OPEN:true,BOX_WINTER_DAY:b29+10}); STORY.tick(GM,0.5); for(let i=0;i<10;i++) await new Promise(r=>setImmediate(r)); const a=lines(); said=[]; STORY.tick(GM,0.5); for(let i=0;i<10;i++) await new Promise(r=>setImmediate(r));
    return [J(a)===J(['（寒流來了。你從衣櫃拿出外套。……幸好那天拆了。）'])&&!said.length&&G.flags.BOX_COLD==='glad',J(a)]; });
  chk('8. 拆過的：12/8 下午才回房間、12/9 都不演（「第一次醒來」）；沒拆的 12/8 早上不演',()=>{ fresh(cold,14,'dorm',{BOX_WINTER_OPEN:true,BOX_WINTER_DAY:b29+10}); const a=Y1FILL.coldDue(G); fresh(cold+1,7.5,'dorm',{BOX_WINTER_OPEN:true,BOX_WINTER_DAY:b29+10}); const b=Y1FILL.coldDue(G); fresh(cold,7.5,'dorm'); const c=Y1FILL.coldDue(G); return [a==null&&b==null&&c==null,[a,b,c].join(',')]; });
  await achk('8. Y1-F 沒拆、12/8 晚上在宿舍睡：12/9 醒來「（半夜被冷醒。你蹲在床邊拆那個紙箱，膠帶黏得很緊。）」阿凱「（從被子裡）……你九月到現在都沒拆喔。」；之後算拆了',async()=>{ fresh(cold+1,7.5,'dorm'); R('kai','FAM'); STORY.tick(GM,0.5); const had=!!boxIt(); for(let i=0;i<10;i++) await new Promise(r=>setImmediate(r));
    return [J(lines())===J(['（半夜被冷醒。你蹲在床邊拆那個紙箱，膠帶黏得很緊。）',NAME('kai')+'：（從被子裡）……你九月到現在都沒拆喔。'])&&G.flags.BOX_WINTER_OPEN===true&&G.flags.BOX_COLD==='night'&&!boxIt(),J(lines())+' '+had]; });
  chk('8. 12/9 早上人在家（寒假以外不會，保險）：不演',()=>{ fresh(cold+1,7.5,'dorm'); HOME.rec(G).at=true; return Y1FILL.coldDue(G)==null; });
  await achk('8. 大四主線 11（6/1 收拾）最後一箱就是這一箱：大一的紙箱和最後一箱都是媽媽的字「冬天的衣服」（拆過、半夜拆的都一樣接得上）',async()=>{ const out=[]; for(const how of ['open','night']){ fresh(D('2029-06-01'),20,'dorm',{ROOM_Y4:D('2028-09-03'),ROOM_Y4_ITEMS:[],BOX_WINTER_OPEN:true,BOX_COLD:how==='night'?'night':undefined}); picks=['剩下的一起裝']; await STORY.packY4(GM); out.push(lines().slice(-3)); }
    const last=['（床底下最後一個紙箱。上面是媽媽的字：「冬天的衣服」。）','（大一搬進來那天，媽媽寫的。四年了，你一直沒把那幾個字撕掉。）','（四年。房間又空了。可是這次空，是因為要走了。）'];
    const y1=typeof Y1FILL_LINES!=='undefined'?Y1FILL_LINES.box.look:''; return [out.every(L=>J(L)===J(last))&&/媽媽的字：「冬天的衣服」/.test(y1)&&/媽媽的字：「冬天的衣服」/.test(last[0]),J(out)]; });

  console.log('（通過 '+passes+' 項）');   await achk('8. AA_350 O5：12/8（寒流那天）當天才拆＝「（寒流來了。你終於把床底下的紙箱拆了。外套有一股衣櫃的味道。）」；12/8 的 glad、12/9 的 night 都不演',async()=>{ const c=Y1FILL.coldDay(); fresh(c,14,'dorm',{}); said=[]; opts=[]; picks=[0]; await Y1FILL.boxScene(GM); const L=lines(); G.day=c+1; G.hour=7.5; const n=Y1FILL.coldDue(G); G.day=c; G.hour=8; const g=Y1FILL.coldDue(G);
    return [L[L.length-1]==='（寒流來了。你終於把床底下的紙箱拆了。外套有一股衣櫃的味道。）'&&G.flags.BOX_WINTER_OPEN===true&&n===null&&g===null,J([L,n,g])]; });
  chk('6. AA_350 O6：語彤那則（y1s2_yt_board）要有她的聯絡方式',()=>{ const d=STORY.DAILY_PHONE.find(x=>x.id==='y1s2_yt_board'); fresh(D('2026-03-26'),7,'dorm'); R('heroine_03','FAM'); G.flags.ndlDays=[D('2026-03-05')]; const no=d.ok(G,G.day); G.contacts=G.contacts||{}; G.contacts.heroine_03=G.day-10; const yes=d.ok(G,G.day); return [!no&&yes,J([no,yes])]; });
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack)); console.log('FAILED '+(fails+1)); process.exit(1); });
