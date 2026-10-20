// 事件包第 3 輪（AA_328，AA-C 定稿 5ae6a133；任務 EVPKG-R3-1020）——不需要瀏覽器。照 AA_328 每一件的「給 BB 的驗收情境」寫：
//   0. 接線：R3 掛在 STORY.PHONE_RULES／TICKS／ALARMS；index.html 在 group3d.js 後面載入兩個檔；事件都在 STORY_EVENTS；接進現有事件的段落對得到
//   1. 3-01 芷若的試譯稿費（F1～F4）　2. 3-02 阿凱 F2（K1～K4）　3. 3-04 方奕廷 F3 早上六點（F1～F3＋鬧鐘 05:30）　4. 3-05 拉花比賽（Z1～Z3）　5. 3-07 萬聖節（H1～H3）
// 修改前：沒有 R3、這些事件（第 0 項 FAIL）。用法：node tests/r3_events_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH|GROUP|GROUP_EVENTS|Y2B|Y2B_EVENTS|R3|R3_EVENTS|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|POSTGRAD_LINES|PG|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/r3_events.js','src/r3_3d.js'];
const missing=FILES.filter(f=>!fs.existsSync(path.join(ROOT,f)));
if(missing.length){ check('0. 有 src/data/r3_events.js、src/r3_3d.js',false,missing.join('、')); console.log('FAILED '+fails); process.exit(1); }
for(const f of FILES) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, scenes=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  /* 放人到場景裡（R3 的 TICKS）：只記位置，給 npcNear 判斷 */
  spawnCharacter(id,x,z,o){ if(GM.npc[id]) return GM.npc[id]; const n={id,charId:id,obj:{position:{x,y:0,z},rotation:{y:(o&&o.yaw)||0}},lv:0,seat:(o&&o.seat)||null,pose:(o&&o.pose)||'idle'}; GM.npc[id]=n; E.npcs.push(n); return n; },
  removeNPC(id){ const n=GM.npc[id]; if(n){ E.npcs.splice(E.npcs.indexOf(n),1); delete GM.npc[id]; } },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
ADV.setBg=b=>{ scenes.push(b); };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; scenes=[]; GM.npc={}; E.npcs.length=0; E.interactables=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; E.player.lv=0; E.player.seat=null; E.zone={roomAt:()=>null,seats:[]}; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const C=id=>{ G.contacts[id]=0; };   /* 前一天以前就有聯絡方式 */
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const has=t=>said.some(s=>s.t===t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const at=(th,t)=>{ const m=TH(th).find(x=>x.text===t); return m?m.day*24+m.h:null; };
/* 照時間跑手機規則（一刻鐘一次；跨過午夜：hour 超過 24 照熬夜的算法）*/
const run=(day,h0,h1,st)=>{ st=st||0.25; G.day=day; G.weekday=wdOf(day); for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const play=async(id,pk)=>{ said=[]; opts=[]; scenes=[]; picks=[].concat(pk==null?[]:pk); await EVENTS.run(ev(id)); return lines(); };
const NAME=id=>SOCIAL.displayName(id);
const ans=(id,k)=>PHONE.answer(G,id,k);
const askOpts=id=>{ const m=PHONE.byAsk(G,id); return m?m.ask.opts.map(o=>o.t):null; };
(async()=>{
  // ===== 0. 接線 =====
  const IDS=['ev_fangyt_6am','ev_zhiruo_latte_contest'];
  check('0. 事件都在 STORY_EVENTS', IDS.every(id=>!!ev(id)), IDS.filter(id=>!ev(id)).join('、'));
  check('0. R3 掛在 STORY.PHONE_RULES、TICKS、ALARMS；包住 bedOptions、neededAnswered、Y2B.pcLines', typeof R3!=='undefined'&&STORY.PHONE_RULES.length>=2&&STORY.TICKS.length>=2&&STORY.ALARMS.length>=1&&!!STORY._r3bed&&!!STORY._r3need&&!!Y2B._r3fee);
  { const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/group3d.js'), b=h.indexOf('src/data/r3_events.js'), c=h.indexOf('src/r3_3d.js'), z=h.indexOf('GAME.boot()');
    check('0. index.html：group3d.js → data/r3_events.js → r3_3d.js → GAME.boot()', a>0&&b>a&&c>b&&z>c); }
  check('0. 接進現有事件：週日宵夜（F2）、兩點半點餐（天鵝）', !!ev('ev_kai_sunday_supper')._r3f2&&!!ev('ev_cafe_barista_zhiruo')._r3swan);

  // ===== 1. 3-01 芷若的試譯稿費 =====
  const f11=D('2026-11-11'), f25=D('2026-11-25');
  fresh(f11,21,'dorm',{U_CONTRACT:true}); R('heroine_02','FAM'); C('heroine_02'); run(f11,21,22);
  check('1. 22:07 以前沒有（雙方都單身＝22:07）', !PHONE.sent(G,'r3_zr_fee'));
  run(f11,22.25,22.5);
  check('1. 11/11 22:07 兩則（原本一句拆成兩則）', JSON.stringify(txt('p:heroine_02'))===JSON.stringify(['heroine_02:我幫一個出版社翻了一篇短文，對方說「先試譯，不付錢」。','heroine_02:可是他們拿去用了。……這樣正常嗎。'])&&Math.abs(at('p:heroine_02','可是他們拿去用了。……這樣正常嗎。')-(f11*24+22+7/60))<0.26, JSON.stringify(txt('p:heroine_02')));
  check('1. F1 有 U_CONTRACT：兩個選項', JSON.stringify(askOpts('r3_zr_fee'))===JSON.stringify(['妳先把你們的對話拍給我看。','先看你們說好了什麼。']));
  ans('r3_zr_fee',1);
  check('1. F1 選第二個：祐廷接著傳「說好試譯不付錢，是試譯。……」、截圖兩張、四件事、「……原來我可以這樣講。」、問法服、「好。我先寫信，不行再去問。」；ZR_FEE contract、ZR_FEE_LETTER',
    JSON.stringify(txt('p:heroine_02').slice(2))===JSON.stringify(['player:先看你們說好了什麼。','player:說好試譯不付錢，是試譯。拿去用，就不是試譯了。','heroine_02:📷（對話的截圖）','heroine_02:📷（對話的截圖）',':（你問了四件事：誰找她、要她做什麼、有沒有說好價錢、他們拿去做了什麼。她一題一題回。）','heroine_02:……原來我可以這樣講。','player:翻譯算不算妳的作品、能不能被拿去用，我還沒學到。這部分我們問法服。','heroine_02:好。我先寫信，不行再去問。'])&&G.flags.ZR_FEE==='contract'&&SOCIAL.has('heroine_02','ZR_FEE_LETTER'), JSON.stringify(txt('p:heroine_02').slice(2)));
  run(f25,22,22.5);
  check('1. 11/25 22:07「出版社回信了。道歉，稿費也付了。」「我沒想到「問清楚」就有用。」＋恭喜／時間表做得好', JSON.stringify(txt('p:heroine_02').slice(-2))===JSON.stringify(['heroine_02:出版社回信了。道歉，稿費也付了。','heroine_02:我沒想到「問清楚」就有用。'])&&JSON.stringify(askOpts('r3_zr_fee2'))===JSON.stringify(['恭喜。','時間表做得好。']));
  ans('r3_zr_fee2',1); check('1. 「時間表做得好。」→「外文系的仔細。……好啦，也是被你問出來的。」', txt('p:heroine_02').slice(-1)[0]==='heroine_02:外文系的仔細。……好啦，也是被你問出來的。');
  fresh(f11,22,'dorm'); R('heroine_02','FAM'); C('heroine_02'); run(f11,22,22.25);
  check('1. F2 沒有 U_CONTRACT：只有「妳先把你們的對話拍給我看。」', JSON.stringify(askOpts('r3_zr_fee'))===JSON.stringify(['妳先把你們的對話拍給我看。']));
  G.hour=22.5; ans('r3_zr_fee',0); run(f11,22.5,22.75);
  check('1. F2 老實的選項：截圖、四件事、「……好。我整理一下。」（時間表還沒到）', txt('p:heroine_02').slice(-1)[0]==='heroine_02:……好。我整理一下。'&&!txt('p:heroine_02').some(t=>/時間表/.test(t))&&G.flags.ZR_FEE==='honest');
  run(f11,22.75,23.1);
  check('1. F2 二十分鐘後：時間表的照片＋問法服＋「好。我先寫信，不行再去問。」', JSON.stringify(txt('p:heroine_02').slice(-3))===JSON.stringify(['heroine_02:📷（一張時間表。日期、誰說了什麼，一格一格排好。）','player:翻譯算不算妳的作品、能不能被拿去用，我還沒學到。這部分我們問法服。','heroine_02:好。我先寫信，不行再去問。'])&&Math.abs(at('p:heroine_02','📷（一張時間表。日期、誰說了什麼，一格一格排好。）')-(f11*24+22.5+20/60))<0.3);
  fresh(f11,22,'dorm'); R('heroine_02','FAM'); C('heroine_02'); run(f11,22,23.75); run(f11+1,8,18.25);
  check('1. F3 沒回（隔天 18:00 前）：「沒事。我自己先問問看。」、ZR_FEE missed、沒有 ZR_FEE_LETTER', txt('p:heroine_02').slice(-1)[0]==='heroine_02:沒事。我自己先問問看。'&&G.flags.ZR_FEE==='missed'&&!SOCIAL.has('heroine_02','ZR_FEE_LETTER'));
  run(f25,22,22.5); check('1. F3 11/25 只有一則「出版社回信了。我自己寫的信，他們付了。」（沒有「問清楚」）', txt('p:heroine_02').slice(-1)[0]==='heroine_02:出版社回信了。我自己寫的信，他們付了。'&&!txt('p:heroine_02').some(t=>/問清楚/.test(t)));
  fresh(f11,14,'dorm'); R('heroine_02','FAM'); C('heroine_02'); date('kexin'); ROM.learn(G,'heroine_02','kexin','test'); run(f11,14,15.5);
  check('1. 祐廷和別人交往、她知道：15:10（同一版）', PHONE.sent(G,'r3_zr_fee')&&Math.abs(at('p:heroine_02','可是他們拿去用了。……這樣正常嗎。')-(f11*24+15+10/60))<0.26);
  fresh(f11,22,'dorm'); R('heroine_02','ACQ'); C('heroine_02'); run(f11,22,23); check('1. 和芷若不到 FAMILIAR：沒有', !PHONE.sent(G,'r3_zr_fee'));
  { fresh(D('2027-09-24'),12,'dorm'); R('heroine_02','FAM'); SOCIAL.remember('heroine_02','ZR_FEE_LETTER',''); const c=Y2B.PC[0]; const L=Y2B.pcLines(G,Object.assign({},c,{ver:'dorm'}));
    check('1. F4 有 ZR_FEE_LETTER：大三上第一張明信片多「這張的郵票，是那筆稿費買的。」（在原本的字後面）', L[L.length-1]==='這張的郵票，是那筆稿費買的。'&&L[0]===c.text[0]);
    G.social.mem.heroine_02=[]; check('1. 沒有 ZR_FEE_LETTER：照原本的', !Y2B.pcLines(G,Object.assign({},c,{ver:'dorm'})).some(t=>/稿費/.test(t))); }

  // ===== 2. 3-02 阿凱 F2 =====
  const k6=D('2026-12-06'), k18=D('2026-12-18');
  fresh(k6,23.2,'dorm',{ROOM_Y2:400,KAI_SUP_N:2,KAI_BOT_REPLIED:true}); R('kai','FRI'); SOCIAL.remember('kai','SAID_DEPENDS','');
  let K=await play('ev_kai_sunday_supper',['先吃飯']);
  check('2. K1 12/6 去宵夜、回過 kai_bot：「你上次說它不能給法律結論。」「所以我改了。現在它不回答問題，只會吵架。」（取代輪流句）', K.includes(NAME('kai')+'：你上次說它不能給法律結論。')&&K.includes(NAME('kai')+'：所以我改了。現在它不回答問題，只會吵架。')&&!K.some(t=>/貢丸|新室友說|作業會頂嘴/.test(t))&&!K.includes(NAME('kai')+'：我的作業。一個會吵架的聊天機器人。'), JSON.stringify(K.slice(0,4)));
  check('2. K1 手機螢幕「（手機螢幕）機器人：原則上可以。但有例外。」、「你大一傳給我的訊息。全部。」', has('（手機螢幕）機器人：原則上可以。但有例外。')&&has('你大一傳給我的訊息。全部。')&&!K.some(t=>/三百二十/.test(t)));
  check('2. K2 SAID_DEPENDS：多「「看情況」是你大一颱風天說的。它記得。」', has('「看情況」是你大一颱風天說的。它記得。'));
  check('2. 三選一；「教它說：先吃飯。」→「先吃飯。其他的，看情況。」「……它比你還像人。」、KAI_BOT、KAI_F2 went、快轉到 00:00', JSON.stringify(opts[0])===JSON.stringify(['「問它：你喜歡法律嗎？」','「把我刪掉。」','「教它說：先吃飯。」'])&&K.includes('機器人：先吃飯。其他的，看情況。')&&K.includes(NAME('kai')+'：……它比你還像人。')&&SOCIAL.has('kai','KAI_BOT')&&G.flags.KAI_F2==='went'&&Math.abs(G.hour-24)<0.02);
  fresh(k6,23.2,'dorm',{ROOM_Y2:400}); R('kai','FRI'); K=await play('ev_kai_sunday_supper',[2,0]);
  check('2. 那晚第一次去宵夜：先演 K3 第一次（夾好的三樣、「下週日，同一時間。」），接「（吃到一半，阿凱打開筆電。）」、F2 的開頭「我的作業。一個會吵架的聊天機器人。」', K.indexOf(NAME('kai')+'：你的我幫你夾了。豆干、海帶、王子麵。')>=0&&K.indexOf('（吃到一半，阿凱打開筆電。）')>K.indexOf(NAME('kai')+'：下週日，同一時間。不是我要找你，是滷味。')&&K.indexOf(NAME('kai')+'：我的作業。一個會吵架的聊天機器人。')>K.indexOf('（吃到一半，阿凱打開筆電。）')&&!has('「看情況」是你大一颱風天說的。它記得。')&&has('這個問題，學說上有爭議。')&&G.flags.KAI_F2==='went'&&!SOCIAL.has('kai','KAI_BOT'));
  fresh(k6+7,23.2,'dorm',{ROOM_Y2:400,KAI_SUP_N:3}); R('kai','FRI'); K=await play('ev_kai_sunday_supper');
  check('2. 別的週日：照 K3 的輪流句（沒有 F2）', !K.some(t=>/聊天機器人|手機螢幕/.test(t))&&K.length===2&&G.flags.KAI_F2==null);
  fresh(k6,23,'dorm'); R('kai','FRI'); run(k6,23,24.5);
  check('2. 00:40 以前沒有截圖', !PHONE.sent(G,'r3_kai_f2_miss'));
  run(k6,24.5,25);
  check('2. K3 沒去：12/7 00:40「📷（截圖：機器人：看情況。）」「它學你的」「不客氣」、KAI_F2 missed', JSON.stringify(txt('p:kai').slice(-3))===JSON.stringify(['kai:📷（截圖：機器人：看情況。）','kai:它學你的','kai:不客氣'])&&G.flags.KAI_F2==='missed'&&Math.abs(at('p:kai','它學你的')-(k6*24+24+40/60))<0.26);
  { G.flags.KAI_SUP_N=5; const pool=[]; for(let n=5;n<9;n++){ G.flags.KAI_SUP_N=n; G.day=k6+14; const l=ev('ev_kai_sunday_supper').dialogue.find(x=>x.pick).pick.from(G); pool.push(l[0]); }
    check('2. K3 沒去的玩家：之後的宵夜不會出現「我的作業會頂嘴了」', !pool.some(t=>/頂嘴/.test(t))); }
  run(k18,23,23.75);
  check('2. K4 所有玩家：12/18 23:40「機器人拿了A」「助教問它是誰訓練的」「它說 看情況」', JSON.stringify(txt('p:kai').slice(-3))===JSON.stringify(['kai:機器人拿了A','kai:助教問它是誰訓練的','kai:它說 看情況']));
  { fresh(k6-60,21,'dorm'); const m={ask:{id:'need_100_kai_bot',grp:'need_100'}}; STORY.neededAnswered(G,m,{need:'kai_bot'}); check('2. 主線 4 的 kai_bot 回了＝KAI_BOT_REPLIED（STORY.neededAnswered）', G.flags.KAI_BOT_REPLIED===true&&R3.kaiBotReplied(G)); }

  // ===== 3. 3-04 方奕廷 F3 =====
  const s12=D('2027-03-12'), s13=s12+1;
  fresh(s12,20.5,'dorm'); R('npc_fangyt','FAM'); C('npc_fangyt'); R('kai','FRI'); run(s12,20.5,21.25);
  check('3. 3/12 21:00「明天早上六點，椰林大道。帶外套。不用帶腦袋，我負責講。」＋好／六點我起不來', txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:明天早上六點，椰林大道。帶外套。不用帶腦袋，我負責講。'&&JSON.stringify(askOpts('r3_fang_6am'))===JSON.stringify(['好。','六點我起不來。']));
  ans('r3_fang_6am',0); run(s12,21.25,21.5);
  { const q=OUT.get(G,'r3_fang_6am'); check('3. 回「好。」：「好。阿凱也會來。」、出遊 3/13 06:00 椰林大道（只帶到那裡，事件在那裡等）', txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:好。阿凱也會來。'&&!!q&&q.day===s13&&q.h===6&&q.late===0.5&&q.goto&&q.goto.zone==='campus'); }
  { G.hour=23; const A=STORY.wakeAlarms(G,s13), O=STORY.bedOptions(G), sl=O.find(o=>o.kind==='sleep');
    check('3. 前一晚睡覺：鬧鐘 05:30（床的選項叫醒時間 05:30，不是 06:30）', A.some(a=>a.h===5.5&&a.why===R3.FANG_WHY)&&!!sl&&sl.wake===5.5&&/05:30/.test(sl.hint)&&!/06:30/.test(sl.hint), JSON.stringify(sl)); }
  G.day=s13; G.hour=5.9; G.zone='campus'; STORY.tick(GM,0.6);
  check('3. 05:50～06:30 人在校園：方奕廷站著、阿凱坐在長椅上（放進場景）', !!GM.npc.npc_fangyt&&!!GM.npc.kai&&GM.npc.kai.pose==='sit'&&Math.abs(GM.npc.kai.obj.position.z+12.94)<0.01);
  E.player.obj.position.x=-4; E.player.obj.position.z=-7.5;
  check('3. 還沒走到方奕廷旁邊（npcNear）：不演', !EVENTS.check(ev('ev_fangyt_6am')));
  E.player.obj.position.x=0.5; E.player.obj.position.z=-10.5;
  check('3. 走到他旁邊：演', EVENTS.check(ev('ev_fangyt_6am')));
  let F3=await play('ev_fangyt_6am',['要找誰']);
  check('3. F1「它不會長椰子。」…「（阿凱坐在長椅上，睡著了。）」；選「要找誰？」＝「我不知道。我只知道要站旁邊。」（沒有法律答案）；七點的旁白；FANG_6AM went', has('它不會長椰子。')&&has('因為人取名字的時候，沒有問它。')&&has('（阿凱坐在長椅上，睡著了。）')&&JSON.stringify(opts[0])===JSON.stringify(['「要找誰？」','（拍一張阿凱睡著的照片）','「下次換我帶你看法學院的樹。」'])&&has('我不知道。我只知道要站旁邊。')&&F3[F3.length-1]==='（七點，太陽照到大道上。阿凱醒來，問你們講到哪裡了。）'&&Math.abs(G.hour-7)<0.02&&G.flags.FANG_6AM==='went');
  run(s13,7,7.25); check('3. 去了：沒有 07:00 的葉子', !PHONE.sent(G,'r3_fang_6am_miss'));
  fresh(s13,6,'campus',{FANG_6AM_GO:true}); R('npc_fangyt','FAM'); C('npc_fangyt'); R('kai','FRI'); F3=await play('ev_fangyt_6am',['法學院的樹']);
  check('3. F2 選「下次換我帶你看法學院的樹。」：「法學院有樹？」「有一棵。」「好。」、FANG_LAWTREE', has('法學院有樹？')&&has('有一棵。')&&SOCIAL.has('npc_fangyt','FANG_LAWTREE'));
  run(D('2027-03-24'),12,12.5); check('3. F2 3/24 12:20「📷（霖澤館前的那棵樹）」「我自己來看了。它很努力。」', JSON.stringify(txt('p:npc_fangyt').slice(-2))===JSON.stringify(['npc_fangyt:📷（霖澤館前的那棵樹）','npc_fangyt:我自己來看了。它很努力。']));
  fresh(s13,6,'campus',{FANG_6AM_GO:true}); R('npc_fangyt','FAM'); C('npc_fangyt'); R('kai','FRI'); await play('ev_fangyt_6am',['拍一張']); run(s13+1,12.5,13.25);
  check('3. 拍了阿凱睡著的照片：3/14 13:00 阿凱「刪掉」「……算了 傳給我」', JSON.stringify(txt('p:kai').slice(-2))===JSON.stringify(['kai:刪掉','kai:……算了 傳給我']));
  fresh(s12,21,'dorm'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(s12,21,21.25); ans('r3_fang_6am',1); run(s12,21.25,22); run(s13,6,7.25);
  check('3. F3 回「六點我起不來」：「好。那下次。」、3/13 07:00「📷（地上一片很大的葉子，旁邊長椅上睡著的阿凱）」「你錯過了一片葉子。」', txt('p:npc_fangyt').includes('npc_fangyt:好。那下次。')&&JSON.stringify(txt('p:npc_fangyt').slice(-2))===JSON.stringify(['npc_fangyt:📷（地上一片很大的葉子，旁邊長椅上睡著的阿凱）','npc_fangyt:你錯過了一片葉子。'])&&G.flags.FANG_6AM==='missed'&&!OUT.get(G,'r3_fang_6am'));
  fresh(s12,21,'dorm'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(s12,21,21.25); ans('r3_fang_6am',0); run(s12,21.25,22); run(s13,6,7.25);
  check('3. 答應了沒到（06:30 以前沒走到）：一樣 07:00 葉子', G.flags.FANG_6AM==='missed'&&txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:你錯過了一片葉子。');
  fresh(s12,21,'dorm'); R('npc_fangyt','ACQ'); C('npc_fangyt'); run(s12,21,22); check('3. 不到 FAMILIAR：沒有', !PHONE.sent(G,'r3_fang_6am'));

  // ===== 4. 3-05 芷若 F4 拉花比賽 =====
  const m7=D('2027-05-07');
  fresh(m7,19.5,'cafe'); R('heroine_02','FAM'); C('heroine_02');
  check('4. 芷若不在旁邊（npcNear）：不演', !EVENTS.check(ev('ev_zhiruo_latte_contest')));
  GM.spawnCharacter('heroine_02',-2.5,-5.15,{}); E.player.obj.position.x=-2.5; E.player.obj.position.z=-3.3;
  check('4. 5/7 19:00～22:00 走到櫃台前：演', EVENTS.check(ev('ev_zhiruo_latte_contest'))&&(G.hour=22.1,!EVENTS.check(ev('ev_zhiruo_latte_contest'))));
  G.hour=19.5; let Z=await play('ev_zhiruo_latte_contest',['投芷若']);
  check('4. Z1 老闆「今天的拉花比賽，客人投票。一包糖一票。」…「所以妳要練十五年。」；三選一；投芷若＝「同情票不算。……算了，算。」、ZR_SWAN', Z[0]==='老闆：今天的拉花比賽，客人投票。一包糖一票。'&&has('它在低頭。它在想事情。')&&has('所以妳要練十五年。')&&JSON.stringify(opts[0])===JSON.stringify(['「投芷若。」','「投老闆。」','（把糖倒進咖啡，不投）'])&&has('同情票不算。……算了，算。')&&SOCIAL.has('heroine_02','ZR_SWAN')&&G.flags.ZR_SWAN_VOTE==='her');
  run(m7,22,22.5); check('4. 去了：沒有 22:07 黑板的照片', !PHONE.sent(G,'r3_zr_swan_miss'));
  G.day=m7+3; G.hour=19.5; G.weekday=wdOf(G.day); let B=await play('ev_cafe_barista_zhiruo');
  check('4. Z1 投她的：5/8～5/21 第一次點餐「（拿鐵上面是一隻天鵝。這次有脖子。）」「這次有脖子了。」（在「杯子放著就好，慢慢來。」前面）', B.indexOf('（拿鐵上面是一隻天鵝。這次有脖子。）')>=0&&B.indexOf(NAME('heroine_02')+'：這次有脖子了。')===B.indexOf('（拿鐵上面是一隻天鵝。這次有脖子。）')+1&&B[B.length-1]===NAME('heroine_02')+'：杯子放著就好，慢慢來。');
  G.day=m7+5; B=await play('ev_cafe_barista_zhiruo'); check('4. 只有第一次', !B.some(t=>/天鵝/.test(t)));
  fresh(m7,19.5,'cafe'); R('heroine_02','FAM'); await play('ev_zhiruo_latte_contest',['投老闆']);
  check('4. Z2 投老闆：「你很誠實。」（她笑了。）「……下次我會贏。」（沒有「我記住了」）', has('你很誠實。')&&has('（她笑了。）')&&has('……下次我會贏。')&&!said.some(s=>/我記住了/.test(s.t))&&G.flags.ZR_SWAN_VOTE==='boss');
  fresh(m7,19.5,'cafe'); R('heroine_02','FAM'); await play('ev_zhiruo_latte_contest',['把糖']);
  check('4. 把糖倒進咖啡：「你把選票喝掉了。這在選舉裡叫什麼？」「……廢票？」「叫好喝。」', has('你把選票喝掉了。這在選舉裡叫什麼？')&&has('……廢票？')&&has('叫好喝。')&&G.flags.ZR_SWAN_VOTE==='sugar');
  fresh(m7,20,'dorm'); R('heroine_02','FAM'); C('heroine_02'); run(m7,20,22.5);
  check('4. Z3 沒去、和她熟：22:07「📷（店裡的黑板：本月冠軍：老闆。本月最有想法：在想事情的天鵝。）」「老闆寫的。」', JSON.stringify(txt('p:heroine_02').slice(-2))===JSON.stringify(['heroine_02:📷（店裡的黑板：本月冠軍：老闆。本月最有想法：在想事情的天鵝。）','heroine_02:老闆寫的。'])&&G.flags.ZR_SWAN_VOTE==='missed');
  fresh(m7,20,'dorm'); R('heroine_02','ACQ'); C('heroine_02'); run(m7,20,22.5); check('4. 沒去、不熟：沒有', !PHONE.sent(G,'r3_zr_swan_miss'));

  // ===== 5. 3-07 阿凱 F5 萬聖節 =====
  const o27=D('2027-10-27');
  fresh(o27,23,'dorm'); R('kai','FRI'); run(o27,23,23.75);
  check('5. 10/27 23:40「資工系萬聖節要變裝」「我要扮一個法律名詞」「你負責」＋三選一（只放名詞）', JSON.stringify(txt('p:kai'))===JSON.stringify(['kai:資工系萬聖節要變裝','kai:我要扮一個法律名詞','kai:你負責'])&&JSON.stringify(askOpts('r3_kai_h'))===JSON.stringify(['善意第三人。','不可抗力。','無因管理。']));
  ans('r3_kai_h',2);
  check('5. H1 無因管理：祐廷接著傳「幫路人撐傘，撐一整晚。」→「那我要撐一整晚喔」「……好啦 我借傘」（沒有「不是變裝，是工作」）', JSON.stringify(txt('p:kai').slice(-4))===JSON.stringify(['player:無因管理。','player:幫路人撐傘，撐一整晚。','kai:那我要撐一整晚喔','kai:……好啦 我借傘'])&&!txt('p:kai').some(t=>/是工作/.test(t))&&G.flags.KAI_COSTUME==='negotiorum');
  run(o27+3,13,13.25);
  check('5. 10/30 13:10「📷（變裝比賽的合照。他站在最旁邊，撐著一把傘）」「第二名」「第一名扮期末報告」「大家都很怕他」', JSON.stringify(txt('p:kai').slice(-4))===JSON.stringify(['kai:📷（變裝比賽的合照。他站在最旁邊，撐著一把傘）','kai:第二名','kai:第一名扮期末報告','kai:大家都很怕他']));
  check('5. H3 阿凱的訊息都沒有標點（照片說明以外）', TH('p:kai').filter(m=>m.from==='kai'&&!/^📷/.test(m.text)).every(m=>!/[，。！？]$/.test(m.text)));
  fresh(o27,23,'dorm'); R('kai','FRI'); SOCIAL.remember('kai','KAI_BOT',''); run(o27,23,23.75); run(o27+1,9,18.5);
  check('5. H2 沒回、大二 F2 教過「先吃飯」：18:10「我自己選了」「我扮成看情況」', JSON.stringify(txt('p:kai').slice(-2))===JSON.stringify(['kai:我自己選了','kai:我扮成看情況'])&&G.flags.KAI_COSTUME==='depends');
  run(o27+3,13,13.25); check('5. 照片：「胸前貼著一張紙：看情況」', txt('p:kai').includes('kai:📷（變裝比賽的合照。他站在最旁邊，胸前貼著一張紙：看情況）'));
  fresh(o27,23,'dorm'); R('kai','FRI'); run(o27,23,23.75); run(o27+1,9,18.5); check('5. 沒回、沒有 KAI_BOT：「我扮成原則上」', txt('p:kai').slice(-1)[0]==='kai:我扮成原則上'&&G.flags.KAI_COSTUME==='principle');

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
