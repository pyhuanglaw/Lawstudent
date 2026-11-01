// 事件包第 3 輪（AA_328，AA-C 定稿 5ae6a133；任務 EVPKG-R3-1020）——不需要瀏覽器。照 AA_328 每一件的「給 BB 的驗收情境」寫：
//   0. 接線：R3 掛在 STORY.PHONE_RULES／TICKS／ALARMS；index.html 在 group3d.js 後面載入兩個檔；事件都在 STORY_EVENTS；接進現有事件的段落對得到
//   1. 3-01 芷若的試譯稿費（F1～F4）　2. 3-02 阿凱 F2（K1～K4）　3. 3-04 方奕廷 F3 早上六點（F1～F3＋鬧鐘 05:30）　4. 3-05 拉花比賽（Z1～Z3）　5. 3-07 萬聖節（H1～H3）
//   6. 3-06 大二暑假的摘要日（S1～S4）　7. 3-08 SK12 社科圖（P1～P4）　8. 3-10 阿凱 K5（K1～K4）　9. 3-15 子晴凌晨三點（Z1～Z3）　10. 3-16 沛珊 2029 營隊（C1～C3）
// 修改前：沒有 R3、這些事件（第 0 項 FAIL）。用法：node tests/r3_events_unit.js
// AA_370（企劃線 a1dc3e61，2026-10-21）改了期待：14 美國路線 9/16 的雞蛋拿掉（M2）；15 何俊朗 1～5 這一版停用（M3：不排、不傳、舊存檔排了的取消；台詞資料照舊測，「B 棟的。又見面了。」那一項拿掉）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|EXCH|GROUP|GROUP_EVENTS|Y2B|Y2B_EVENTS|R3|R3_EVENTS|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|POSTGRAD_LINES|PG|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/r3_events.js','src/r3_3d.js'];
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
  const IDS=['ev_fangyt_6am','ev_zhiruo_latte_contest','ev_sk12_soclib_table','ev_sk12_lawlib_hint','ev_ziqing_3am_call'];
  check('0. 事件都在 STORY_EVENTS', IDS.every(id=>!!ev(id)), IDS.filter(id=>!ev(id)).join('、'));
  check('0. R3 掛在 STORY.PHONE_RULES、TICKS、ALARMS；包住 bedOptions、neededAnswered、Y2B.pcLines、HOME.breakArrive、STORY.roomY3Items、MSG.send、PG.epiLine', typeof R3!=='undefined'&&STORY.PHONE_RULES.length>=2&&STORY.TICKS.length>=2&&STORY.ALARMS.length>=1&&!!STORY._r3bed&&!!STORY._r3need&&!!Y2B._r3fee&&!!HOME._r3sum&&!!STORY._r3room&&!!MSG._r3&&!!PG._r3zq);
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
  check('1. F1 選第二個：祐廷接著傳「說好試譯不付錢，是試譯。……」、截圖兩張（第二張照 AA_461 第 3 節換字）、四件事、「……原來我可以這樣講。」、問法服、「好。我先寫信，不行再去問。」；ZR_FEE contract、ZR_FEE_LETTER',
    JSON.stringify(txt('p:heroine_02').slice(2))===JSON.stringify(['player:先看你們說好了什麼。','player:說好試譯不付錢，是試譯。拿去用，就不是試譯了。','heroine_02:📷（對話的截圖）','heroine_02:📷（對話的截圖，往上滑的那一段）',':（你問了四件事：誰找她、要她做什麼、有沒有說好價錢、他們拿去做了什麼。她一題一題回。）','heroine_02:……原來我可以這樣講。','player:翻譯算不算妳的作品、能不能被拿去用，我還沒學到。這部分我們問法服。','heroine_02:好。我先寫信，不行再去問。'])&&G.flags.ZR_FEE==='contract'&&SOCIAL.has('heroine_02','ZR_FEE_LETTER'), JSON.stringify(txt('p:heroine_02').slice(2)));
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
  check('2. 那晚第一次去宵夜：先演 K3 第一次（夾好的三樣、「下週日，同一時間。」），接「（吃到一半，阿凱打開筆電。）」、F2 的開頭「我的作業。一個會吵架的聊天機器人。」', K.indexOf(NAME('kai')+'：你的我幫你夾了。豆干、海帶、王子麵。')>=0&&K.indexOf(NAME('kai')+'：下週日一樣喔。')>=0&&K.indexOf('（吃到一半，阿凱打開筆電。）')>K.indexOf(NAME('kai')+'：下週日一樣喔。')/* AA_428 §2 第 8 點：K3 第一次的收尾照 SC4 #13（原本這裡寫的舊句已經不在，比較永遠成立）*/&&K.indexOf(NAME('kai')+'：我的作業。一個會吵架的聊天機器人。')>K.indexOf('（吃到一半，阿凱打開筆電。）')&&!has('「看情況」是你大一颱風天說的。它記得。')&&has('這個問題，學說上有爭議。')&&G.flags.KAI_F2==='went'&&!SOCIAL.has('kai','KAI_BOT'));
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
  check('3. 3/12 21:00「明天早上六點，椰影大道。帶外套。不用帶腦袋，我負責講。」＋好／六點我起不來', txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:明天早上六點，椰影大道。帶外套。不用帶腦袋，我負責講。'&&JSON.stringify(askOpts('r3_fang_6am'))===JSON.stringify(['好。','六點我起不來。']));
  ans('r3_fang_6am',0); run(s12,21.25,21.5);
  { const q=OUT.get(G,'r3_fang_6am'); check('3. 回「好。」：「好。阿凱也會來。」、出遊 3/13 06:00 椰影大道（只帶到那裡，事件在那裡等）', txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:好。阿凱也會來。'&&!!q&&q.day===s13&&q.h===6&&q.late===0.5&&q.goto&&q.goto.zone==='campus'); }
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
  run(D('2027-03-24'),12,12.5); check('3. F2 3/24 12:20「📷（法律系館A前的那棵樹）」「我自己來看了。它很努力。」', JSON.stringify(txt('p:npc_fangyt').slice(-2))===JSON.stringify(['npc_fangyt:📷（法律系館A前的那棵樹）','npc_fangyt:我自己來看了。它很努力。']));
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

  // ===== 6. 3-06 大二暑假的摘要日 =====
  { const j28=D('2027-06-28'), j20=D('2027-07-20'), a25=D('2027-08-25');
    fresh(j28,18.5,'home'); G.home={stay:{Y2S:'home'},at:true,lbreak:'Y2S'};
    check('6. S1 暑假回家住：6/28「媽媽把你的房間打掃過了。」、7/20「姊姊回來住了一週。……」、8/25「家裡視訊的時候，爸爸問你……」（沒有爸爸在家的句子）', JSON.stringify(R3.summerLines(G,'2027-06-28'))===JSON.stringify(['媽媽把你的房間打掃過了。'])&&JSON.stringify(R3.summerLines(G,'2027-07-20'))===JSON.stringify(['姊姊回來住了一週。你們去吃了小時候那家冰。'])&&JSON.stringify(R3.summerLines(G,'2027-08-25'))===JSON.stringify(['家裡視訊的時候，爸爸問你大三要不要考慮出國。你說還在想。']));
    said=[]; await HOME.breakArrive(GM); check('6. 快轉停在 6/28 18:30（HOME.breakArrive）：說那一句', has('媽媽把你的房間打掃過了。'), JSON.stringify(lines()));
    G.hour=19; said=[]; await HOME.breakArrive(GM); check('6. 不是那一刻：不說', !said.length);
    fresh(j20,18.5,'dorm'); check('6. S2 續住、沒打工：摘要日沒有旁白（和現在一樣）', !R3.summerLines(G,'2027-06-28').length&&!R3.summerLines(G,'2027-07-20').length&&!R3.summerLines(G,'2027-08-25').length);
    global.JOBS={any:()=>'cafe'}; fresh(j20,18.5,'home'); G.home={stay:{Y2S:'home'}};
    check('6. 打工中（JOBS.any，SYS-13 做好以後）＋回家住：先打工、再住家裡，一天兩句；7/20 照那一份打工', JSON.stringify(R3.summerLines(G,'2027-07-20'))===JSON.stringify(['芷若不在的下午，店裡安靜很多。','姊姊回來住了一週。你們去吃了小時候那家冰。']));
    global.JOBS={any:()=>'tutor'}; check('6. S4 家教不算打工中（寒暑假停）', JSON.stringify(R3.summerLines(G,'2027-06-28'))===JSON.stringify(['媽媽把你的房間打掃過了。']));
    global.JOBS={any:()=>'cvs'}; fresh(a25,18,'dorm'); G.money=1000; run(a25,18,18.75); check('6. 8/25 打工中：SUMMER_Y2 work、+22000', G.flags.SUMMER_Y2==='work'&&G.money===23000, G.money);
    check('6. 拆箱（第三個房間）多「那家店的暑假班表影印」', STORY.roomY3Items(G).some(r=>r[0]==='summer_y2_shift'&&r[1]==='那家店的暑假班表影印'&&r[2][0]==='最下面一格是你的名字。寫錯一個字，老闆用立可白改過。'));
    delete global.JOBS;
    fresh(a25,18,'home'); G.home={stay:{Y2S:'home'}}; run(a25,18,18.75); check('6. 8/25 回家住：SUMMER_Y2 home、沒有錢；拆箱多「一包小時候那家店的冰棒棍」', G.flags.SUMMER_Y2==='home'&&G.money===5000&&STORY.roomY3Items(G).some(r=>r[0]==='summer_y2_popsicle'&&r[2][0]==='媽媽塞進行李的。你問她留著做什麼，她說：『……留著。』'));
    fresh(a25,18,'dorm'); G.vac={reg:{'C02@Y2':'done'}}; run(a25,18,18.75); check('6. S3 大二暑假去 C02：SUMMER_Y2 camp（拆箱照 C02 的名牌）', G.flags.SUMMER_Y2==='camp'&&!STORY.roomY3Items(G).some(r=>/^summer_y2_/.test(r[0]))&&STORY.roomY3Items(G).some(r=>r[0]==='vac_C02'));
    fresh(a25,18,'dorm'); run(a25,18,18.75); check('6. 續住沒打工：SUMMER_Y2 dorm', G.flags.SUMMER_Y2==='dorm'); }

  // ===== 7. 3-08 SK12 =====
  { const p20=D('2027-12-20'), p22=D('2027-12-22');
    fresh(p22,19.5,'soclib'); STORY.tick(GM,0.6);
    check('7. P1 12/20～12/23 19:00～21:00 走進社科圖：品妤放在最裡面那張長桌的桌角', !!GM.npc.econ_pinyu&&Math.abs(GM.npc.econ_pinyu.obj.position.x+2.2)<0.01&&Math.abs(GM.npc.econ_pinyu.obj.position.z+5.9)<0.01);
    E.player.obj.position.x=-9; E.player.obj.position.z=9.3; check('7. 還沒走到她旁邊：不演', !EVENTS.check(ev('ev_sk12_soclib_table')));
    E.player.obj.position.x=-2.2; E.player.obj.position.z=-4.3; check('7. 走過去：演', EVENTS.check(ev('ev_sk12_soclib_table')));
    let P=await play('ev_sk12_soclib_table',['陪妳']);
    check('7. P1「（期末考週。社科圖的長桌坐滿了。……）」；沒見過她＝先自我介紹；「我怕考了三年，才發現自己不喜歡。」；四選一', P[0].startsWith('（期末考週。社科圖的長桌坐滿了。')&&has('曾品妤。經濟系，可昕以前的室友。')&&has('我怕考了三年，才發現自己不喜歡。')&&JSON.stringify(opts[0])===JSON.stringify(['「我陪妳讀到閉館。」','「先考一科看看，不喜歡再說。」','「先去問考過的學長姊？」','「妳可以兩個都試，只是不要同時。」'])&&!has('上次經濟系之夜，你收椅子收得很好。今天換我收你的書。'));
    check('7. P2「我陪妳讀到閉館」：快轉到 22:00、機率題算錯、「很好。你還是法律系的。」；PINYU_WORRY stay、SK12', has('很好。你還是法律系的。')&&Math.abs(G.hour-22)<0.02&&G.flags.PINYU_WORRY==='stay'&&SOCIAL.has('econ_pinyu','PINYU_WORRY')&&G.flags.SK12===true&&G.flags.MET_PINYU===true);
    fresh(p22,19.5,'soclib',{MET_PINYU:true,ECON_NIGHT:true}); P=await play('ev_sk12_soclib_table',['一科']);
    check('7. 見過她：不自我介紹；ECON_NIGHT 多「今天換我收你的書。」；選一科＝「……一科。好。一科我算得出來。」＋九點半先走', !has('曾品妤。經濟系，可昕以前的室友。')&&has('上次經濟系之夜，你收椅子收得很好。今天換我收你的書。')&&has('……一科。好。一科我算得出來。')&&P[P.length-1]==='（你回到自己的位子。九點半，她先收書走了。）'&&G.flags.PINYU_WORRY==='one');
    fresh(D('2027-12-24'),19.5,'soclib'); STORY.tick(GM,0.6); check('7. 12/24（五）以後不演、不放人', !GM.npc.econ_pinyu&&!EVENTS.check(ev('ev_sk12_soclib_table')));
    fresh(p20,18.5,'lawlib'); check('7. P3 同一週 18:00 以後先進法圖：「（法律學院圖書館的位子全滿了。窗外，對面社科院的燈還亮著。）」', EVENTS.check(ev('ev_sk12_lawlib_hint'))&&ev('ev_sk12_lawlib_hint').dialogue[0].text==='（法律學院圖書館的位子全滿了。窗外，對面社科院的燈還亮著。）'&&(G.hour=17.5,!EVENTS.check(ev('ev_sk12_lawlib_hint')))&&(G.hour=18.5,G.flags.SK12=true,!EVENTS.check(ev('ev_sk12_lawlib_hint'))));
    const n10=D('2028-11-10');
    fresh(n10,20,'dorm',{SK12:true,PINYU_WORRY:'stay',MET_PINYU:true}); C('econ_pinyu'); run(n10,20,20.75);
    check('7. P2 大四 11/10 20:30「📷（成績單……）」「精算第一科過了。我還滿喜歡的。」「那題機率題，你現在會了嗎？」＋不會／會了', JSON.stringify(txt('p:econ_pinyu'))===JSON.stringify(['econ_pinyu:📷（成績單，第一行：精算 第一科 通過）','econ_pinyu:精算第一科過了。我還滿喜歡的。','econ_pinyu:那題機率題，你現在會了嗎？'])&&JSON.stringify(askOpts('r3_py_actuary'))===JSON.stringify(['不會。','會了。']));
    ans('r3_py_actuary',1); check('7. 「會了。」→「騙人。」', txt('p:econ_pinyu').slice(-1)[0]==='econ_pinyu:騙人。');
    fresh(n10,20,'dorm',{SK12:true,PINYU_WORRY:'ask',MET_PINYU:true}); C('econ_pinyu'); run(n10,20,20.75); check('7. ask：「我問了那個學長。他說第一科最難。結果還好。」', txt('p:econ_pinyu').slice(-1)[0]==='econ_pinyu:我問了那個學長。他說第一科最難。結果還好。');
    fresh(n10,20,'dorm',{MET_PINYU:true}); C('econ_pinyu'); run(n10,20,20.75); check('7. P4 沒去、認識她：只有「精算第一科過了。」', JSON.stringify(txt('p:econ_pinyu'))===JSON.stringify(['econ_pinyu:精算第一科過了。']));
    fresh(n10,5,'us_apartment',{SK12:true,PINYU_WORRY:'both',MET_PINYU:true,EXCHANGE_ROUTE:'US'}); C('econ_pinyu'); run(n10,5,7.75);
    check('7. 美國路線：照當地時間（臺灣 20:30＝美東 07:30）', txt('p:econ_pinyu').slice(-1)[0]==='econ_pinyu:沒有同時。一科一科。'&&Math.abs(at('p:econ_pinyu','沒有同時。一科一科。')-(n10*24+7.5))<0.26); }

  // ===== 8. 3-10 阿凱 K5 =====
  { const k22=D('2028-11-22');
    fresh(k22,23,'dorm'); R('kai','FRI'); run(k22,23,23.75);
    check('8. 11/22 23:40「你醒著嗎」…「這次不是開玩笑」＋三個語氣（選項 20 字內）', JSON.stringify(txt('p:kai'))===JSON.stringify(['kai:你醒著嗎','kai:我寫的一個 bug 讓一些玩家的道具不見了','kai:有一個玩家在論壇說要告我們','kai:所以他可以告我嗎','kai:這次不是開玩笑'])&&JSON.stringify(askOpts('r3_kai_k5'))===JSON.stringify(['先寫下來，明天問法務。','我不能給正式意見。','先修 bug。'])&&askOpts('r3_kai_k5').every(t=>t.length<=20)&&G.events.last.ev_kai_can_they_sue===k22);
    ans('r3_kai_k5',1);
    check('8. K1 選「我不能給正式意見。」：祐廷傳完整的句子、「好 那你不要睡」、電話的旁白；KAI_STAYED_UP', JSON.stringify(txt('p:kai').slice(-3))===JSON.stringify(['player:我還是學生，不能給你正式的法律意見。但我可以陪你醒著。','kai:好 那你不要睡',':（你們開著電話。二十分鐘，誰都沒說話，只聽得到兩邊在打字。）'])&&G.flags.KAI_STAYED_UP===true&&SOCIAL.has('kai','KAI_STAYED_UP')&&G.flags.KAI_K5==='awake');
    run(k22+1,8,22.75);
    check('8. 回了：沒有「沒事了 不用回」；11/23 22:30 四則', !PHONE.sent(G,'r3_kai_k5_none')&&JSON.stringify(txt('p:kai').slice(-4))===JSON.stringify(['kai:公司處理了 道具都補回去了','kai:我以前覺得玩家是數字','kai:昨天我把那個人的留言看了十遍','kai:他是一個國中生 存了三個月的錢']));
    { const ln=PG.epiLine(G,'kai'); check('8. 尾聲阿凱（postgrad3d.js 讀 KAI_STAYED_UP）：「我現在帶新人。第一天我就跟他們說：玩家不是數字。」', JSON.stringify(ln)===JSON.stringify([['kai','我現在帶新人。第一天我就跟他們說：玩家不是數字。']]), JSON.stringify(ln)); }
    fresh(k22,23,'dorm',{U_WORK:true}); R('kai','FRI'); run(k22,23,23.75); ans('r3_kai_k5',3);
    check('8. K2 修過勞動法（U_WORK）：四個選項；選 4「那我現在可以哭了嗎」「可以。哭完寫經過。」', askOpts('r3_kai_k5').length===4&&JSON.stringify(txt('p:kai').slice(-4))===JSON.stringify(['player:你是在工作時出的事，對外通常是公司處理。你要做的是把經過如實告訴公司。','kai:……所以不是我一個人被告','kai:那我現在可以哭了嗎','player:可以。哭完寫經過。'])&&G.flags.KAI_K5==='company');
    fresh(k22,9,'us_apartment',{EXCHANGE_ROUTE:'US'}); R('kai','FRI'); run(k22,9,11);
    check('8. K3 美國路線：「你那邊是早上吧 那剛好 我這邊睡不著」先；時間照美東（臺灣 23:40＝10:40）；選項 2 是「陪你聊到你睡著」', txt('p:kai')[0]==='kai:你那邊是早上吧 那剛好 我這邊睡不著'&&Math.abs(at('p:kai','你醒著嗎')-(k22*24+10+40/60))<0.26&&PHONE.byAsk(G,'r3_kai_k5').ask.opts[1].post==='我還是學生，不能給你正式的法律意見。但我可以陪你聊到你睡著。');
    run(k22,11,19.25); check('8. 美國路線的回覆期限：臺灣 11/23 08:00＝美東 11/22 19:00「沒事了 不用回」', txt('p:kai').slice(-1)[0]==='kai:沒事了 不用回'&&G.flags.KAI_K5==='none');
    fresh(k22,23,'dorm'); R('kai','FRI'); run(k22,23,23.75); run(k22+1,7,8.25);
    check('8. K4 沒回：11/23 08:00「沒事了 不用回」；KAI_K5 none', txt('p:kai').slice(-1)[0]==='kai:沒事了 不用回'&&G.flags.KAI_K5==='none'&&!G.flags.KAI_STAYED_UP); }

  // ===== 9. 3-15 子晴：凌晨三點的 build =====
  { const z16=D('2029-03-16');
    fresh(z16-1,26.5,'dorm'); date('heroine_04'); run(z16-1,26.5,27.25);
    check('9. Z1 交往中、熬夜到三點：02:58「欸不是，你醒著嗎」「📎 build_0316_0258.zip」「第二關我改了。我覺得改壞了。」＋三選一', JSON.stringify(txt('p:heroine_04'))===JSON.stringify(['heroine_04:欸不是，你醒著嗎','heroine_04:📎 build_0316_0258.zip','heroine_04:第二關我改了。我覺得改壞了。'])&&JSON.stringify(askOpts('r3_zq_3am'))===JSON.stringify(['第二關，貓卡在牆裡。','明天再測，妳去睡。','（直接打電話給她）']));
    G.hour=27.3; ans('r3_zq_3am',1); run(z16-1,27.3,27.45,0.05);
    check('9. Z1「明天再測，妳去睡。」→「……你這樣講很像我爸。」（五分鐘後）「好啦。晚安。」；ZQ_3AM_BUILD sleep', txt('p:heroine_04').slice(-2).join('|')==='heroine_04:……你這樣講很像我爸。|heroine_04:好啦。晚安。'&&G.flags.ZQ_3AM_BUILD==='sleep'&&(at('p:heroine_04','好啦。晚安。')-at('p:heroine_04','……你這樣講很像我爸。'))>=4/60);
    { const ln=PG.epiLine(G,'heroine_04'); check('9. Z3 選「明天再測」：尾聲「和祐廷」那一列多「我現在三點以前睡。……有人管。」', JSON.stringify(ln[ln.length-1])===JSON.stringify(['heroine_04','我現在三點以前睡。……有人管。'])&&ln.length===3, JSON.stringify(ln)); }
    fresh(z16,7.5,'dorm'); date('heroine_04'); run(z16,7.5,7.75);
    check('9. Z2 交往中、睡了：起床一次看到四則（02:58、03:20、04:45、04:45，照原本的時間）', JSON.stringify(txt('p:heroine_04'))===JSON.stringify(['heroine_04:欸不是，你醒著嗎','heroine_04:沒事。你睡。','heroine_04:修好了','heroine_04:你起來先測'])&&Math.abs(at('p:heroine_04','沒事。你睡。')-(z16*24+3+20/60))<0.02&&Math.abs(at('p:heroine_04','修好了')-(z16*24+4.75))<0.02&&G.flags.ZQ_3AM_BUILD==='morning');
    ans('r3_zq_3am',0);
    check('9. Z2「早。我現在測。」→「……你醒了。」「第二關，貓有沒有卡在牆裡？」有兩個回覆', JSON.stringify(txt('p:heroine_04').slice(-3))===JSON.stringify(['player:早。我現在測。','heroine_04:……你醒了。','heroine_04:第二關，貓有沒有卡在牆裡？'])&&JSON.stringify(askOpts('r3_zq_3am_cat'))===JSON.stringify(['有。','沒有。']));
    ans('r3_zq_3am_cat',0); check('9. 「有。」→「……我就知道。我再修。」', txt('p:heroine_04').slice(-1)[0]==='heroine_04:……我就知道。我再修。');
    fresh(z16-1,26.9,'dorm'); date('heroine_04'); run(z16-1,26.9,27.1,0.05); G.hour=27.15; ans('r3_zq_3am',2);
    check('9. 選「（直接打電話給她）」：不替你傳字', !txt('p:heroine_04').some(t=>/^player:/.test(t))&&G.flags.ZQ_3AM_BUILD==='call');
    said=[]; R3.tick(GM,0.6); for(let k=0;k<6;k++) await new Promise(r=>setImmediate(r));
    check('9. 手機關掉以後演電話：「……你打來幹嘛。」「……好啦。我在。」、半小時、「（你沒有掛。）」', has('……你打來幹嘛。')&&has('……好啦。我在。')&&has('（你沒有掛。）')&&!!G.events.done.ev_ziqing_3am_call, JSON.stringify(lines()));
    fresh(z16-1,26.5,'dorm'); R('heroine_04','FRI'); run(z16-1,26.5,27.5); check('9. 不是交往中：沒有', !TH('p:heroine_04').length); }

  // ===== 10. 3-16 沛珊 2029 年的營隊 =====
  { const c22=D('2029-07-22');
    fresh(c22,20.5,'home'); date('classmate_peishan'); run(c22,20.5,21.25);
    check('10. C1 交往中：7/22 21:00「明天上山帶營隊。五天。」「山上訊號很差，找得到訊號我就傳。」＋好／上山小心', JSON.stringify(txt('p:classmate_peishan'))===JSON.stringify(['classmate_peishan:明天上山帶營隊。五天。','classmate_peishan:山上訊號很差，找得到訊號我就傳。'])&&JSON.stringify(askOpts('r3_ps_camp1'))===JSON.stringify(['好。','上山小心。']));
    ans('r3_ps_camp1',1); check('10. 「上山小心。」→「嗯！」', txt('p:classmate_peishan').slice(-1)[0]==='classmate_peishan:嗯！');
    run(c22+2,22,22.75); check('10. C1 7/24 22:30「有一個小孩在名牌上寫「法官」。」「……是我以後的名字。」；PS_CAMP_2029_MSG', JSON.stringify(txt('p:classmate_peishan').slice(-2))===JSON.stringify(['classmate_peishan:有一個小孩在名牌上寫「法官」。','classmate_peishan:我問他那是你的名字嗎。他說不是，是我以後的名字。'])&&G.flags.PS_CAMP_2029_MSG===true);
    run(c22+5,19.5,20.25); check('10. 7/27 20:00「下山了。」「小孩寫了信給國中畢業的自己。我收走了，說那一年再寄。」', JSON.stringify(txt('p:classmate_peishan').slice(-2))===JSON.stringify(['classmate_peishan:下山了。','classmate_peishan:小孩寫了信給國中畢業的自己。我收走了，說那一年再寄。']));
    check('10. 7/23～7/27 不在（presence：在山上帶營隊）、7/28 回來', (G.day=c22+1,STORY.presence('classmate_peishan',G).here===false&&STORY.presence('classmate_peishan',G).away==='在山上帶營隊')&&(G.day=c22+5,STORY.presence('classmate_peishan',G).here===false)&&(G.day=c22+6,STORY.presence('classmate_peishan',G).away!=='在山上帶營隊'));
    fresh(c22+3,15,'home',{PS_BACK_FIRST:500}); R('classmate_peishan','FRI'); C('classmate_peishan');
    { const tp=MSG.topics(G,'classmate_peishan'); const r=tp.length?MSG.send(G,'classmate_peishan',tp[0].k):null; G.hour+=0.05; PHONE.tick(G);
      check('10. C2 重新聯絡上、7/25 傳訊息給她：「在山上帶營隊，訊號很差。下山再回你。」', !!r&&r.ok&&r.auto===true&&txt('p:classmate_peishan').slice(-1)[0]==='classmate_peishan:在山上帶營隊，訊號很差。下山再回你。', JSON.stringify(tp.map(q=>q.k))+' '+JSON.stringify(r)); }
    fresh(c22+6,15,'home',{PS_BACK_FIRST:500}); R('classmate_peishan','FRI'); C('classmate_peishan'); check('10. 7/28 以後照一般的回覆', !R3.psCampAuto(G));
    fresh(c22,20.5,'home'); R('classmate_peishan','FRI'); run(c22,20.5,21.25); check('10. 沒交往：沒有那三組訊息', !PHONE.sent(G,'r3_ps_camp1')); }

  // ===== 11. 3-11 學姊：讀書計畫和便條 =====
  { const a21=D('2028-10-21'), b18=D('2028-10-18'), c8=D('2029-01-08'), c20=D('2029-02-20'), d3=D('2029-02-03');
    const GT=()=>TH('g:family_law').map(m=>(m.name||m.from)+':'+m.text);
    fresh(a21,20,'dorm'); PHONE.join(G,'family_law','法律系直屬家族'); run(a21,20,20.5);
    check('11. S1 10/21 20:30 家族群組 Kevin「大四的各位 讀書計畫貼上來」「學姊說她可以幫忙看」＋貼／不貼', JSON.stringify(GT())===JSON.stringify(['Kevin:大四的各位 讀書計畫貼上來','Kevin:學姊說她可以幫忙看'])&&JSON.stringify(askOpts('r3_sis_plan_a'))===JSON.stringify(['（貼上自己的讀書計畫）','（不貼）']), JSON.stringify(GT()));
    ans('r3_sis_plan_a',0); run(a21,20.5,20.75);
    check('11. C5 群組裡玩家那一則是照片「📷（讀書計畫表，一週七欄。週日那一欄只寫了「休息」。）」，選項的字「（貼上自己的讀書計畫）」不進群組（AA_343 C5）', TH('g:family_law').some(m=>m.from==='player'&&m.text==='📷（讀書計畫表，一週七欄。週日那一欄只寫了「休息」。）')&&!TH('g:family_law').some(m=>m.text==='（貼上自己的讀書計畫）'), JSON.stringify(GT()));
    /* 2026-10-28 改：AA_497 5-2 家族的學妹（family_junior）有名字；第 8 節第 5 點（企劃線 60fc3b9a3）改叫「佳穎」（「宜蓁」是祐廷的姊姊；tests/aa497_supporting_unit.js 5-2、8）*/
    check('11. S1 貼了：20:40「祐廷的讀書計畫我看了。……」（叫名字，不是「學弟的」）、家族的學妹（佳穎）、「以前是以前。」；SIS_PLAN_POSTED', JSON.stringify(GT().slice(-3))===JSON.stringify(['溫學姊:祐廷的讀書計畫我看了。有休息日，有吃飯，有睡覺。','佳穎:學姊，妳以前不是這樣說的。','溫學姊:以前是以前。'])&&G.flags.SIS_PLAN_POSTED===true&&Math.abs(at('g:family_law','以前是以前。')-(a21*24+20+40/60))<0.26, JSON.stringify(GT()));
    fresh(a21,20,'dorm'); PHONE.join(G,'family_law','法律系直屬家族'); run(a21,20,20.5); ans('r3_sis_plan_a',1); run(a21,20.5,21.5);
    check('11. 「（不貼）」：沒有後續（也不替你傳字）', GT().length===2&&!G.flags.SIS_PLAN_POSTED);
    fresh(a21,20,'us_apartment',{EXCHANGE_ROUTE:'US'}); PHONE.join(G,'family_law','法律系直屬家族'); run(a21,20,21); check('11. 美國路線：沒有 A', !PHONE.sent(G,'r3_sis_plan_a'));
    fresh(b18,18.5,'us_apartment',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); C('heroine_05'); run(b18,18.5,19.25);
    { const q=OUT.get(G,'r3_sis_plan_us'); check('11. S2 美國路線、交往中：10/18 當地 19:00「你的讀書計畫，帶去會所給我看。八點。」＋20:00 會所（出遊）', txt('p:heroine_05').slice(-1)[0]==='heroine_05:你的讀書計畫，帶去會所給我看。八點。'&&!!q&&q.day===b18&&q.h===20&&q.late===0.5); }
    let P=await play('ev_sis_plan_us',['妳自己']);
    check('11. S2 會所「你週六排了十二個小時。」「改成八個。……」；選項是「妳自己呢？」→「……我也改。我們一起改。」；名字照交往中的叫法；SIS_PLAN_SEEN us', has('（會所的自習室。她把你的讀書計畫從頭看到尾。）')&&has('你週六排了十二個小時。')&&has('改成八個。剩下四個拿去睡覺。')&&JSON.stringify(opts[0])===JSON.stringify(['「好。」','「妳自己呢？」'])&&has('……我也改。我們一起改。')&&G.flags.SIS_PLAN_SEEN==='us'&&said.find(s=>s.t==='你週六排了十二個小時。').who===(SOCIAL.datingName('heroine_05')||NAME('heroine_05'))&&scenes.includes('dark'), JSON.stringify(P));
    G.day=c20; G.hour=20.5; run(c20,20.5,21.25); check('11. B 演過的：C 不再演', !PHONE.sent(G,'r3_sis_plan_c'));
    fresh(b18,18.5,'us_apartment',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); C('heroine_05'); run(b18,18.5,19.25); G.hour=20.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(b18,20.75,21.25);
    check('11. B 沒到（20:30 前）：21:00「……下次帶來。」；SIS_PLAN_SEEN missed', txt('p:heroine_05').slice(-1)[0]==='heroine_05:……下次帶來。'&&G.flags.SIS_PLAN_SEEN==='missed');
    fresh(b18,18.5,'us_apartment',{EXCHANGE_ROUTE:'US'}); R('heroine_05','FRI'); C('heroine_05'); run(b18,18.5,20); check('11. 美國路線、沒交往（挽回中）：沒有 B', !PHONE.sent(G,'r3_sis_plan_b')&&!OUT.get(G,'r3_sis_plan_us'));
    fresh(c8,20.5,'dorm',{Y4_PATH:'grad',SIS_PLAN_POSTED:true}); R('heroine_05','FRI'); C('heroine_05'); run(c8,20.5,21.25);
    { const q=OUT.get(G,'r3_sis_plan_lab'); check('11. S3 要考 2/3 筆試：1/8 21:00「你的讀書計畫，拿來研究室給我看。明天晚上七點。」＋1/9 19:00 研究室', txt('p:heroine_05').slice(-1)[0]==='heroine_05:你的讀書計畫，拿來研究室給我看。明天晚上七點。'&&!!q&&q.day===c8+1&&q.h===19); }
    P=await play('ev_sis_plan_lab',['學姊自己']);
    check('11. C 研究室（不是交往中）：選項「學姊自己呢？」；SIS_PLAN_SEEN lab；背景＝研究室的走廊', JSON.stringify(opts[0])===JSON.stringify(['「好。」','「學姊自己呢？」'])&&has('……我也改。我們一起改。')&&G.flags.SIS_PLAN_SEEN==='lab'&&scenes.some(b=>b&&b.image==='assets/bg/linze_prof_hall.webp'), JSON.stringify(P));
    fresh(c8,20.5,'dorm',{Y4_PATH:'grad',SIS_PLAN_POSTED:true}); R('heroine_05','FRI'); C('heroine_05'); run(c8,20.5,21.25); G.day=c8+1; G.hour=19.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(c8+1,19.75,21.25);
    check('11. S4 1/9 沒到、貼過計畫：21:00「我自己看了你傳在群組的那張。……週六十二個小時，改成八個。」', txt('p:heroine_05').slice(-1)[0]==='heroine_05:我自己看了你傳在群組的那張。……週六十二個小時，改成八個。'&&G.flags.SIS_PLAN_SEEN==='missed');
    fresh(c20,20.5,'dorm',{Y4_PATH:'bar'}); date('heroine_05'); C('heroine_05'); run(c20,20.5,21.25);
    check('11. 其他（不考筆試）、交往中：2/20 21:00 私訊、2/21 19:00；1/8 沒有', PHONE.sent(G,'r3_sis_plan_c')&&OUT.get(G,'r3_sis_plan_lab').day===c20+1);
    P=await play('ev_sis_plan_lab',['妳自己']); check('11. 交往中：選項「妳自己呢？」', JSON.stringify(opts[0])===JSON.stringify(['「好。」','「妳自己呢？」']));
    fresh(c20,20.5,'dorm',{Y4_PATH:'bar'}); date('heroine_05'); C('heroine_05'); run(c20,20.5,21.25); G.day=c20+1; G.hour=19.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(c20+1,19.75,21.25);
    check('11. C 沒到、沒貼過：21:00「……下次拿來。」', txt('p:heroine_05').slice(-1)[0]==='heroine_05:……下次拿來。');
    fresh(c20,20.5,'dorm',{Y4_PATH:'bar'}); R('heroine_05','FRI'); C('heroine_05'); run(c20,20.5,21.5); check('11. 不是交往中、她不知道你的計畫（沒貼過）：沒有 C', !PHONE.sent(G,'r3_sis_plan_c'));
    fresh(c20,20.5,'dorm',{Y4_PATH:'bar',SIS_PLAN_POSTED:true}); R('heroine_05','FAM'); C('heroine_05'); run(c20,20.5,21.5); check('11. 和她不到 FRIEND：沒有 C', !PHONE.sent(G,'r3_sis_plan_c'));
    fresh(d3,8.1,'dorm',{Y4_PATH:'grad'}); R('heroine_05','FRI');
    check('11. S3 2/3 08:00～08:40、要考筆試、雙方都單身：考場門口（noteDue）', R3.noteDue(G)&&(G.hour=8.7,!R3.noteDue(G))&&(G.hour=8.1,true));
    said=[]; R3.tick(GM,0.6); for(let k=0;k<8;k++) await new Promise(r=>setImmediate(r));
    check('11. D 當面：08:30「（教學館門口。……）」「（便條：「你可以。」）」「只有一句。」「一句就夠了。」（AA_398 第 37 列；不是交往中＝沒有便利商店那句）；SIS_NOTE_GRAD door', has('（教學館門口。她把一張摺好的便條放進你手裡。）')&&has('（便條：「你可以。」）')&&has('只有一句。')&&has('一句就夠了。')&&!has('我在對面的便利商店等。考完先傳訊息。')&&G.flags.SIS_NOTE_GRAD==='door'&&G.hour>=8.5-1e-6&&!R3.noteDue(G), JSON.stringify(lines()));
    fresh(d3,8.1,'home',{Y4_PATH:'grad',ROOM_Y4:d3-150}); date('heroine_05'); G.home={at:true};
    check('11. 在家（寒假）：home3d.js 的選單問 STORY.y4HomeDue＝stay', STORY.y4HomeDue(G)==='stay');
    said=[]; await STORY.y4HomeScene(GM); check('11. 交往中：多「我在對面的便利商店等。考完先傳訊息。」', has('我在對面的便利商店等。考完先傳訊息。')&&G.flags.SIS_NOTE_GRAD==='door');
    fresh(d3-1,20.5,'dorm',{Y4_PATH:'grad'}); R('heroine_05','FRI'); C('heroine_05'); date('kexin'); run(d3-1,20.5,21.25);
    check('11. D 祐廷和別人交往中：2/2 21:00 照片＋「只有一句。」／「謝謝。」', txt('p:heroine_05').slice(-1)[0]==='heroine_05:📷（一張手寫的便條：你可以。）'&&JSON.stringify(askOpts('r3_sis_note_photo'))===JSON.stringify(['只有一句。','謝謝。'])&&G.flags.SIS_NOTE_GRAD==='photo');
    ans('r3_sis_note_photo',1); check('11. 「謝謝。」→「考完傳訊息。」；2/3 早上不當面', txt('p:heroine_05').slice(-1)[0]==='heroine_05:考完傳訊息。'&&(G.day=d3,G.hour=8.2,!R3.noteDue(G)));
    fresh(d3,8.1,'dorm',{Y4_PATH:'bar'}); R('heroine_05','FRI'); check('11. 不考研究所：沒有便條', !R3.noteDue(G));
    fresh(d3,8.1,'dorm',{Y4_PATH:'grad',Y4_PUSH:'pass'}); R('heroine_05','FRI'); check('11. 推甄上了：沒有便條', !R3.noteDue(G)); }

  // ===== 12. 3-13 方奕廷 F4 兩千歲的紅檜 =====
  { const j24=D('2029-01-24'), j27=D('2029-01-27');
    fresh(j24,20.5,'home'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(j24,20.5,21.25);
    check('12. 1/24 21:00「📷（雲海）」「我在嘉義的山上。」；沒有 MOUNTAIN_DAY＝「這裡有一棵兩千歲的紅檜。」；好／下次', JSON.stringify(txt('p:npc_fangyt'))===JSON.stringify(['npc_fangyt:📷（雲海）','npc_fangyt:我在嘉義的山上。','npc_fangyt:這裡有一棵兩千歲的紅檜。','npc_fangyt:你要不要上來看。不用會。有點遠，你有車。'])&&JSON.stringify(askOpts('r3_fang_f4'))===JSON.stringify(['好。我開車上去。','下次。']), JSON.stringify(txt('p:npc_fangyt')));
    ans('r3_fang_f4',0); run(j24,21.25,21.5);
    { const q=OUT.get(G,'r3_fang_f4'); check('12. 「好。我開車上去。」→「週六早上七點出發剛好。霧中午會散。」、出遊 1/27 07:00（鬧鐘）', txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:週六早上七點出發剛好。霧中午會散。'&&!!q&&q.day===j27&&q.h===7&&q.alarm===true);
      check('12. 鬧鐘 06:30（宿舍的床、在家睡覺都一樣）', STORY.wakeAlarms(G,j27).some(a=>Math.abs(a.h-6.5)<0.01)&&Math.abs(HOME.wakeFor(G,j27,50/60)-6.5)<0.01, JSON.stringify(STORY.wakeAlarms(G,j27))+' '+HOME.wakeFor(G,j27,50/60)); }
    G.day=j27; G.hour=7; let F4=await play('ev_fangyt_chiayi',['看過很多人']);
    check('12. F1 出門前是媽媽「你交了什麼朋友，會約人開半個台灣去看樹。」；字卡；「我每天上班都經過它。」；選①；回到臺北 22:00；FANG_F4 went、CHIAYI_TREE', has('你交了什麼朋友，會約人開半個台灣去看樹。')&&said.find(s=>s.t==='你交了什麼朋友，會約人開半個台灣去看樹。').who==='媽媽'&&has('到了。……你開了五個小時。')&&has('兩千歲。……我每天上班都經過它。')&&has('嗯。看過很多人來，也看過很多人走。……我還沒走。')&&has('下次天氣好，再來。……不用約。你來，我就在。')&&F4[F4.length-1]==='（回到臺北，已經晚上十點。）'&&Math.abs(G.hour-22)<0.02&&G.flags.FANG_F4==='went'&&G.flags.CHIAYI_TREE===true&&SOCIAL.has('npc_fangyt','CHIAYI_TREE')&&scenes.some(b=>b&&b.image==='assets/bg/trip_mountain.webp')&&scenes.some(b=>b&&b.image==='assets/bg/cypress_trail.webp'), JSON.stringify(F4));
    { const ln=PG.epiLine(G,'npc_fangyt'); check('12. 尾聲方奕廷（postgrad3d.js 讀 CHIAYI_TREE）：「嘉義那棵，我上個月又去看了。」', JSON.stringify(ln).includes('嘉義那棵，我上個月又去看了。'), JSON.stringify(ln)); }
    fresh(j24,20.5,'home'); R('npc_fangyt','FAM'); C('npc_fangyt'); SOCIAL.remember('npc_fangyt','MOUNTAIN_DAY',''); run(j24,20.5,21.25);
    check('12. 大二暑假和他爬過山（MOUNTAIN_DAY）：「這裡的紅檜比那次爬山看的那棵老。兩千歲。」', txt('p:npc_fangyt').includes('npc_fangyt:這裡的紅檜比那次爬山看的那棵老。兩千歲。'));
    ans('r3_fang_f4',1); run(j24,21.25,21.5); check('12. F2「下次。」→「好。它也不會走。」；不排出遊；FANG_F4 later', txt('p:npc_fangyt').slice(-1)[0]==='npc_fangyt:好。它也不會走。'&&!OUT.get(G,'r3_fang_f4')&&G.flags.FANG_F4==='later');
    fresh(j24,20.5,'home'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(j24,20.5,21.25); ans('r3_fang_f4',0); run(j24,21.25,21.5); G.day=j27; G.hour=7.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(j27,7.75,15.25);
    check('12. F3 答應了、07:30 還沒出發：10:00「路上塞車嗎？」、15:00「霧散了。它還在。下次。」；不記 CHIAYI_TREE', JSON.stringify(txt('p:npc_fangyt').slice(-2))===JSON.stringify(['npc_fangyt:路上塞車嗎？','npc_fangyt:霧散了。它還在。下次。'])&&Math.abs(at('p:npc_fangyt','路上塞車嗎？')-(j27*24+10))<0.05&&G.flags.FANG_F4==='missed'&&!G.flags.CHIAYI_TREE);
    check('12. C4「路上塞車嗎？」可以回：「睡過頭了。對不起。」／「今天去不了了。」（AA_343 C4）', JSON.stringify(askOpts('r3_fang_f4_late'))===JSON.stringify(['睡過頭了。對不起。','今天去不了了。']));
    const f4late=k=>{ fresh(j24,20.5,'home'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(j24,20.5,21.25); ans('r3_fang_f4',0); run(j24,21.25,21.5); G.day=j27; G.hour=7.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(j27,7.75,10.25); ans('r3_fang_f4_late',k); run(j27,10.25,15.25); return txt('p:npc_fangyt').slice(-3); };
    check('12. C4 回「睡過頭了。對不起。」→「嗯。」；15:00 照樣「霧散了。它還在。下次。」', JSON.stringify(f4late(0))===JSON.stringify(['player:睡過頭了。對不起。','npc_fangyt:嗯。','npc_fangyt:霧散了。它還在。下次。']), JSON.stringify(txt('p:npc_fangyt').slice(-4)));
    check('12. C4 回「今天去不了了。」→「好。」；15:00 照樣那一則', JSON.stringify(f4late(1))===JSON.stringify(['player:今天去不了了。','npc_fangyt:好。','npc_fangyt:霧散了。它還在。下次。']), JSON.stringify(txt('p:npc_fangyt').slice(-4)));
    fresh(j24,20.5,'home'); R('npc_fangyt','ACQ'); C('npc_fangyt'); run(j24,20.5,22); check('12. 不到 FAMILIAR：沒有', !PHONE.sent(G,'r3_fang_f4')); }

  // ===== 13. 3-14 學姊：交往中的大四 =====
  { const f26=D('2029-02-26'), f28=D('2029-02-28'), m14=D('2029-03-14'), m17=D('2029-03-17'), a27=D('2029-04-27'), a28=a27+1;
    fresh(f26,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(f26,20.5,21.25);
    check('13. 2-7a 2/26 21:00「每週三晚上，研究室。」「你寫你的，我寫我的。」＋好／有時候會沒辦法', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:每週三晚上，研究室。','heroine_05:你寫你的，我寫我的。'])&&JSON.stringify(askOpts('r3_sis_desk'))===JSON.stringify(['好。','有時候會沒辦法。']));
    ans('r3_sis_desk',0); check('13. 「好。」→「九點。我先到。」', txt('p:heroine_05').slice(-1)[0]==='heroine_05:九點。我先到。');
    run(f28,12,12.25); { const q=OUT.get(G,'r3_desk_2029-02-28'); check('13. 每週三 21:00 研究室（行事曆上的固定格，出遊）', !!q&&q.day===f28&&q.h===21&&q.ev==='ev_sis_y4_desks'); }
    G.flags.SIS_DATING_D=D('2028-10-08'); G.hour=21; let W1=await play('ev_sis_y4_desks',['熱水']);
    check('13. W1 第一次：「（晚上十一點半。……「第四章　第二節」。）」「上學期都是視訊。……這樣比較好。」；三選一；熱水＝「……謝謝。」；SIS_DESK_NIGHTS 1', has('（晚上十一點半。她還在打字，螢幕上是「第四章　第二節」。）')&&has('上學期都是視訊。……這樣比較好。')&&JSON.stringify(opts[0])===JSON.stringify(['「十一點半了。」','（把一杯熱水放到她手邊）','（繼續寫自己的）'])&&has('……謝謝。')&&G.flags.SIS_DESK_NIGHTS===1&&Math.abs(G.hour-23.5)<0.02, JSON.stringify(W1));
    G.day=f28+7; G.hour=21; W1=await play('ev_sis_y4_desks'); check('13. 第二次以後：旁白一句（三句輪流）、快轉到 23:30', W1.length===1&&W1[0]==='（十一點。她的螢幕上還是第四章。你的筆記寫到第三頁。）'&&Math.abs(G.hour-23.5)<0.02&&G.flags.SIS_DESK_NIGHTS===2, JSON.stringify(W1));
    G.day=f28+21; G.hour=21; W1=await play('ev_sis_y4_desks'); check('13. 第三次：「（她起來倒水，……）」', W1[0]==='（她起來倒水，順便把你的杯子也加滿，沒說話。）');
    fresh(f28,21,'dorm',{EXCHANGE_ROUTE:'US'}); date('heroine_05'); G.flags.SIS_DATING_D=D('2028-10-08'); W1=await play('ev_sis_y4_desks',['十一點半']);
    check('13. 美國路線（上學期一起在美國）：沒有「上學期都是視訊」；「十一點半了。」→「我知道。再一段。」…「……好。今天到這裡。」', !has('上學期都是視訊。……這樣比較好。')&&has('我知道。再一段。')&&has('（五分鐘後她自己關掉螢幕。）')&&has('……好。今天到這裡。'));
    fresh(f26,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(f26,20.5,21.25); run(f28,12,12.25); G.hour=21.9; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(f28,22,23.25);
    check('13. 第一次沒去的那一週：23:10「📷（同一張桌子，對面的位子空著）」「你今天沒來。我寫到十一點。」', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:📷（同一張桌子，對面的位子空著）','heroine_05:你今天沒來。我寫到十一點。'])&&Math.abs(at('p:heroine_05','你今天沒來。我寫到十一點。')-(f28*24+23+10/60))<0.26);
    run(f28+7,12,12.25); G.hour=21.9; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(f28+7,22,23.5); check('13. 第二次沒去：沒有照片', TH('p:heroine_05').filter(m=>/對面的位子空著/.test(m.text)).length===1);
    fresh(m14,21,'dorm'); date('heroine_05'); C('heroine_05'); G.flags.SIS_DESK_NIGHTS=2; W1=await play('ev_sis_y4_desks',['好']);
    check('13. W2 3/14 人在研究室：21:10 她當面說「我爸週六會過來，他要請吃飯。」「……你要不要來。六點半，公館。」；「好。」→「好。不用穿太正式。」', has('我爸週六會過來，他要請吃飯。')&&has('……你要不要來。六點半，公館。')&&has('好。不用穿太正式。')&&G.flags.SIS_FATHER_GO===true&&G.flags.SIS_FATHER_ASKED==='face'&&!PHONE.sent(G,'r3_sis_father'), JSON.stringify(W1));
    run(m14,23.5,24); check('13. 當面說過：手機不再傳；3/17 18:30 出遊', !PHONE.sent(G,'r3_sis_father')&&OUT.get(G,'r3_sis_father').day===m17&&OUT.get(G,'r3_sis_father').h===18.5);
    fresh(m14,20.5,'dorm',{Y4_PATH:'bar'}); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25);
    check('13. 3/14 不在研究室：21:00 私訊兩則＋好／那天不行', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:我爸週六會過來，他要請吃飯。','heroine_05:……你要不要來。六點半，公館。'])&&JSON.stringify(askOpts('r3_sis_father'))===JSON.stringify(['好。','那天不行。']));
    ans('r3_sis_father',0); G.day=m17; G.hour=18.5; G.weekday=wdOf(m17); run(m17,17,17.25); W1=await play('ev_sis_y4_father',['有用的事']);
    check('13. W3 3/17「你念法律，以後要做什麼？」；照實說（bar＝「我在準備國考。」）；「我想做對別人有用的事。」→「……妳以前也這樣說過。……」「嗯。」；「他很少請人吃飯。」；MET_SIS_FATHER', W1[0]==='她爸爸：你念法律，以後要做什麼？'&&JSON.stringify(opts[0])===JSON.stringify(['「我在準備國考。」','「我還在想。」','「我想做對別人有用的事。」'])&&has('（她爸爸看了她一眼。）')&&has('……妳以前也這樣說過。現在還這樣想嗎？')&&has('嗯。')&&has('下次再來。')&&has('他很少請人吃飯。')&&G.flags.MET_SIS_FATHER===true&&SOCIAL.has('heroine_05','MET_SIS_FATHER'), JSON.stringify(W1));
    fresh(m17,18.5,'dorm',{Y4_PATH:'undecided'}); date('heroine_05'); await play('ev_sis_y4_father',['還在想']); check('13. 兩次都「還沒決定」：沒有照實說的那個選項；「我還在想。」→「爸，他還在想。……先吃飯。」', opts[0].length===2&&has('爸，他還在想。……先吃飯。'));
    fresh(m17,18.5,'dorm',{Y4_PATH:'grad',EXCHANGE_ROUTE:'JP'}); date('heroine_05'); await play('ev_sis_y4_father',[0]); check('13. 交換延畢、考研究所：「我明年考研究所。」→「……想清楚了就好。」', opts[0][0]==='「我明年考研究所。」'&&has('……想清楚了就好。'));
    fresh(m14,20.5,'dorm',{Y4_PATH:'bar'}); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25); ans('r3_sis_father',0); run(m17,18,18.25); run(m17,18.5,18.75);
    check('13. 答應了、18:45 還沒到：「我爸先點菜了。……你在路上嗎？」＋快到了／今天去不了', txt('p:heroine_05').slice(-1)[0]==='heroine_05:我爸先點菜了。……你在路上嗎？'&&JSON.stringify(askOpts('r3_sis_father_late'))===JSON.stringify(['快到了。','今天去不了。']));
    G.hour=19.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(m17,19.6,19.75);
    check('13. 19:30 還沒到：「我們吃完了。我爸說下次。」；不記 MET_SIS_FATHER', txt('p:heroine_05').slice(-1)[0]==='heroine_05:我們吃完了。我爸說下次。'&&!G.flags.MET_SIS_FATHER);
    fresh(m14,20.5,'dorm',{Y4_PATH:'bar'}); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25); ans('r3_sis_father',0); run(m17,18,18.25); run(m17,18.5,18.75); ans('r3_sis_father_late',1); run(m17,18.8,20);
    check('13. 「今天去不了。」→「好。」；不再問出發、沒有 19:30 那一則', txt('p:heroine_05').slice(-1)[0]==='heroine_05:好。'&&OUT.get(G,'r3_sis_father').state==='missed'&&!PHONE.sent(G,'r3_sis_father_miss'));
    /* AA_343 C2：私訊的邀約沒回＝3/16（五）21:00 她再確認一次；還是沒回＝3/17 不排出遊、21:00「我們吃完了。我爸說下次。」，不記 MET_SIS_FATHER */
    fresh(m14,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25); run(m17-1,20.5,21.25);
    check('13. C2 沒回：3/16（五）21:00「週六六點半，公館。……不能來也跟我說一聲。」＋好／那天不行', txt('p:heroine_05').slice(-1)[0]==='heroine_05:週六六點半，公館。……不能來也跟我說一聲。'&&Math.abs(at('p:heroine_05','週六六點半，公館。……不能來也跟我說一聲。')-((m17-1)*24+21))<0.05&&JSON.stringify(askOpts('r3_sis_father_re'))===JSON.stringify(['好。','那天不行。']), JSON.stringify(txt('p:heroine_05').slice(-2)));
    run(m17,17,21.25); check('13. C2 還是沒回：3/17 不排出遊；21:00「我們吃完了。我爸說下次。」；不記 MET_SIS_FATHER', !OUT.get(G,'r3_sis_father')&&txt('p:heroine_05').slice(-1)[0]==='heroine_05:我們吃完了。我爸說下次。'&&Math.abs(at('p:heroine_05','我們吃完了。我爸說下次。')-(m17*24+21))<0.05&&!G.flags.MET_SIS_FATHER&&!SOCIAL.has('heroine_05','MET_SIS_FATHER'), JSON.stringify(txt('p:heroine_05').slice(-2)));
    fresh(m14,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25); run(m17-1,20.5,21.25); ans('r3_sis_father_re',0); run(m17,17,17.25);
    check('13. C2 3/16 那一則回「好。」→「好。不用穿太正式。」；3/17 18:30 出遊', txt('p:heroine_05').slice(-1)[0]==='heroine_05:好。不用穿太正式。'&&!!OUT.get(G,'r3_sis_father')&&OUT.get(G,'r3_sis_father').h===18.5);
    fresh(m14,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25); run(m17-1,20.5,21.25); ans('r3_sis_father_re',1); run(m17,20.5,21.25);
    check('13. C2 3/16 那一則回「那天不行。」→「好。我跟他說。」；3/17 21:00「我爸說下次。他記住你的名字了。」', txt('p:heroine_05').includes('heroine_05:好。我跟他說。')&&txt('p:heroine_05').slice(-1)[0]==='heroine_05:我爸說下次。他記住你的名字了。'&&!OUT.get(G,'r3_sis_father'));
    fresh(m14,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(m14,20.5,21.25); ans('r3_sis_father',1); run(m17,20.5,21.25);
    check('13. 婉拒：「好。我跟他說。」；3/17 21:00「我爸說下次。他記住你的名字了。」', txt('p:heroine_05').includes('heroine_05:好。我跟他說。')&&txt('p:heroine_05').slice(-1)[0]==='heroine_05:我爸說下次。他記住你的名字了。'&&!OUT.get(G,'r3_sis_father'));
    fresh(a27,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(a27,20.5,21.25);
    check('13. 2-7c 4/27 21:00「明天我不寫論文。」「……你排。去哪裡都可以。」＋三選一', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:明天我不寫論文。','heroine_05:……你排。去哪裡都可以。'])&&JSON.stringify(askOpts('r3_sis_dayoff'))===JSON.stringify(['河堤，騎腳踏車。','貓空，喝茶。','哪裡都不去。妳睡到中午。']));
    ans('r3_sis_dayoff',0); run(a27,21.25,21.5);
    check('13. 河堤：「好。……我騎很慢。不要等我。」、祐廷「要等。」；4/28 10:00 河濱（出遊）', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:好。……我騎很慢。不要等我。','player:要等。'])&&OUT.get(G,'r3_sis_dayoff').day===a28&&OUT.get(G,'r3_sis_dayoff').h===10&&OUT.get(G,'r3_sis_dayoff').ev==='ev_sis_y4_dayoff_river');
    G.day=a28; G.hour=10; W1=await play('ev_sis_y4_dayoff_river');
    check('13. 4/28 河堤「（四月的河堤，風很大。……）」「……你真的在等。」；最後「（回去的路上，……）」「今天就這樣。」；SIS_DAY_OFF', has('（四月的河堤，風很大。她真的騎很慢。你騎到前面，停下來等。）')&&has('……你真的在等。')&&has('（回去的路上，她在計畫本 4/28 那一格畫了一條線，什麼都沒寫。）')&&said[said.length-1].t==='今天就這樣。'&&G.flags.SIS_DAY_OFF===true&&SOCIAL.has('heroine_05','SIS_DAY_OFF'), JSON.stringify(W1));
    { const ln=PG.epiLine(G,'heroine_05'); check('13. 尾聲「戀人」那一句換 SIS_DAY_OFF 的版本', JSON.stringify(ln).includes('口試前放假的那一天以後，我每年都留一天。'), JSON.stringify(ln)); }
    fresh(a28,13,'dorm'); date('heroine_05'); await play('ev_sis_y4_dayoff_tea',['纜車上']); check('13. 貓空「（到了山上，她第一個先說了論文。）」；「纜車上不談論文。」→「……我們已經下纜車了。」', has('（到了山上，她第一個先說了論文。）')&&has('……我們已經下纜車了。')&&scenes.some(b=>b&&b.image==='assets/bg/trip_mountain.webp'));
    fresh(a27,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(a27,20.5,21.25); ans('r3_sis_dayoff',2); run(a27,21.25,21.5); run(a28,11.5,12.25);
    check('13. W4「哪裡都不去」：「……這是最難的選項。」；隔天 12:00「我睡到十一點五十。差一點。」', txt('p:heroine_05').includes('heroine_05:……這是最難的選項。')&&txt('p:heroine_05').slice(-1)[0]==='heroine_05:我睡到十一點五十。差一點。'&&Math.abs(at('p:heroine_05','我睡到十一點五十。差一點。')-(a28*24+12))<0.05);
    run(a28,20.75,21.25); check('13. W4 21:00 計畫本那一格的照片＋「今天就這樣。」；SIS_DAY_OFF', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:📷（計畫本，4/28 那一格畫了一條線，什麼都沒寫）','heroine_05:今天就這樣。'])&&G.flags.SIS_DAY_OFF===true&&G.flags.SIS_DAY_OFF_PLAN==='sleep');
    fresh(a27,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(a27,20.5,21.25); run(a28,8.5,16.25);
    check('13. W5 沒回：4/28 16:00「📷（河邊）」「今天沒寫。」；SIS_DAY_OFF none', JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:📷（河邊）','heroine_05:今天沒寫。'])&&G.flags.SIS_DAY_OFF_PLAN==='none'&&G.flags.SIS_DAY_OFF===true);
    fresh(a27,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(a27,20.5,21.25); ans('r3_sis_dayoff',1); run(a27,21.25,21.5); G.day=a28; G.hour=13.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(a28,13.6,16.25);
    check('13. 貓空答應了、30 分鐘沒到：「我先上去了。纜車上不談論文。……我一個人也不談。」，16:00 換成「📷（纜車窗外的茶園）」「今天沒寫。」（AA_343 C3）', txt('p:heroine_05').includes('heroine_05:我先上去了。纜車上不談論文。……我一個人也不談。')&&JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:📷（纜車窗外的茶園）','heroine_05:今天沒寫。'])&&!txt('p:heroine_05').includes('heroine_05:📷（河邊）')&&G.flags.SIS_DAY_OFF===true, JSON.stringify(txt('p:heroine_05').slice(-3)));
    fresh(a27,20.5,'dorm'); date('heroine_05'); C('heroine_05'); run(a27,20.5,21.25); ans('r3_sis_dayoff',0); run(a27,21.25,21.5); G.day=a28; G.hour=10.6; for(const q of OUT.expire(G)) OUT.onMissed(GM,q); run(a28,10.6,16.25);
    check('13. 河堤答應了、30 分鐘沒到：「我先騎。慢慢騎。」，16:00 照舊「📷（河邊）」', txt('p:heroine_05').includes('heroine_05:我先騎。慢慢騎。')&&JSON.stringify(txt('p:heroine_05').slice(-2))===JSON.stringify(['heroine_05:📷（河邊）','heroine_05:今天沒寫。']), JSON.stringify(txt('p:heroine_05').slice(-3)));
    fresh(a27,20.5,'dorm'); R('heroine_05','FRI'); C('heroine_05'); run(a27,20.5,22); fresh(f26,20.5,'dorm'); R('heroine_05','FRI'); C('heroine_05'); run(f26,20.5,22);
    check('13. 不是交往中：都沒有', !PHONE.sent(G,'r3_sis_desk')&&!TH('p:heroine_05').length); }

  // ===== 14. 3-19 摘要日的手機小事（池＝每天的手機小事、定時＝固定日子）=====
  { const only=(id,f)=>{ const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(d=>d.id===id)); try{ f(); } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); } };
    const K=()=>{ const L=TH('p:kexin'), i=L.findIndex(m=>/^(dp_|r3_)/.test(m.tag||'')); return i<0?[]:L.slice(i).filter(m=>!m.tag||/^(dp_|r3_)/.test(m.tag)).map(m=>(m.from||'')+':'+m.text); };   /* 這一批的（別的事件包同一天傳的可昕訊息不算）*/
    check('14. 池的條目都加進 STORY.DAILY_PHONE（18 則）', R3.DP3.length===18&&R3.DP3.every(d=>STORY.DAILY_PHONE.includes(d)));
    fresh(D('2026-11-04'),8,'dorm'); date('kexin'); only('y2_kx_giraffe1',()=>run(G.day,8,23.5));
    check('14. M1 大二上第 9 週起 23:10：「（長頸鹿貼圖）」「以後我傳這隻，就是累了、不想打字」「你回一隻一樣的就好」＋（回一隻長頸鹿）', JSON.stringify(K())===JSON.stringify(['kexin:（長頸鹿貼圖）','kexin:以後我傳這隻，就是累了、不想打字','kexin:你回一隻一樣的就好'])&&JSON.stringify(askOpts('dp_y2_kx_giraffe1'))===JSON.stringify(['（回一隻長頸鹿）'])&&Math.abs(at('p:kexin','（長頸鹿貼圖）')-(G.day*24+23+10/60))<0.26, JSON.stringify(K()));
    ans('dp_y2_kx_giraffe1',0); check('14. 回一隻長頸鹿：貼出去是「（長頸鹿貼圖）」，沒有下文', K().slice(-1)[0]==='player:（長頸鹿貼圖）'&&K().length===4);
    fresh(D('2026-10-28'),8,'dorm'); date('kexin'); only('y2_kx_giraffe1',()=>run(G.day,8,23.5)); check('14. 第 8 週：還沒有', !K().length);
    fresh(D('2026-11-18'),8,'dorm',{dpN:{y2_kx_giraffe1:1}}); date('kexin'); only('y2_kx_giraffe',()=>run(G.day,8,23.5));
    check('14. M1 之後只有貼圖（第 11 週起；收過說明那一則）', JSON.stringify(K())===JSON.stringify(['kexin:（長頸鹿貼圖）'])&&askOpts('dp_y2_kx_giraffe_0')[0]==='（回一隻長頸鹿）'&&G.flags.R3_DPT.y2_kx_giraffe.Y2S1===1, JSON.stringify(K()));
    fresh(D('2026-11-18'),8,'dorm',{dpN:{y2_kx_giraffe1:1,y2_kx_giraffe:2},R3_DPT:{y2_kx_giraffe:{Y2S1:2}}}); date('kexin'); only('y2_kx_giraffe',()=>run(G.day,8,23.5)); check('14. 一學期最多 2 次', !K().length);
    fresh(D('2026-11-18'),8,'dorm'); date('kexin'); only('y2_kx_giraffe',()=>run(G.day,8,23.5)); check('14. 沒收過說明那一則：沒有', !K().length);
    fresh(D('2026-12-03'),8,'dorm'); date('kexin'); G.events.done.ev_kexin_bad_exam=1; G.events.last.ev_kexin_bad_exam=D('2026-11-19'); only('y2_kx_k10c',()=>run(G.day,8,21.5));
    check('14. K10c 演過 14 天以後：21:10「物權考壞的那一章，我講給予樂聽，講到她懂。」', K().slice(-1)[0]==='kexin:物權考壞的那一章，我講給予樂聽，講到她懂。');
    fresh(D('2026-12-02'),8,'dorm'); date('kexin'); G.events.done.ev_kexin_bad_exam=1; G.events.last.ev_kexin_bad_exam=D('2026-11-19'); only('y2_kx_k10c',()=>run(G.day,8,21.5)); check('14. 13 天：還沒有', !K().length);
    fresh(D('2027-07-19'),19,'home'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(G.day,19,19.75);
    check('14. M3 大二暑假 7/19 19:30 苔蘚的照片「沒訊號。下山才傳。」', JSON.stringify(txt('p:npc_fangyt'))===JSON.stringify(['npc_fangyt:📷（山上的一片苔蘚，上面有露水）','npc_fangyt:沒訊號。下山才傳。'])&&Math.abs(at('p:npc_fangyt','沒訊號。下山才傳。')-(G.day*24+19.5))<0.26);
    fresh(D('2027-10-15'),16.5,'dorm'); PHONE.join(G,'family_law','法律系直屬家族'); run(G.day,16.5,17.25,0.05);
    check('14. 大三上 10/15 17:05 家族群組 Kevin「這週辛苦了各位」「@學姊 妳也是」、溫學姊「辛苦了。」', JSON.stringify(TH('g:family_law').map(m=>m.name+':'+m.text))===JSON.stringify(['Kevin:這週辛苦了各位','Kevin:@學姊 妳也是','溫學姊:辛苦了。'])&&at('g:family_law','辛苦了。')-at('g:family_law','這週辛苦了各位')>=2/60);
    run(D('2027-12-03'),16.5,17.25,0.05); check('14. 12/03 再一次', TH('g:family_law').length===6);
    fresh(D('2027-09-15'),22,'dorm'); PHONE.join(G,'noodle_team','麵店團'); R('heroine_02','FAM'); run(G.day,22,22.75);
    check('14. M4 9/15 22:30 麵店團群組 Alison「芷若說英國的月亮比較小」「我不信」（沒有「欸芷若妳拍給我看」）', JSON.stringify(txt('g:noodle_team'))===JSON.stringify(['yu:芷若說英國的月亮比較小','yu:我不信']));
    fresh(D('2027-09-08'),20.5,'dorm'); date('kexin'); run(G.day,20.5,21.5); check('14. 大三上 9/8 21:10 可昕「民訴開課了。第一堂就抄了十一頁。」', K().includes('kexin:民訴開課了。第一堂就抄了十一頁。'));
    fresh(D('2027-11-10'),8,'dorm'); date('kexin'); only('y3_kx_mid',()=>run(G.day,8,21.5)); ans('dp_y3_kx_mid',1);
    check('14. 大三上第 10 週起「民訴期中，你們那邊考哪一題？」；「不想講。」→「好。不講。」「……我也不想講。」', JSON.stringify(K())===JSON.stringify(['kexin:民訴期中，你們那邊考哪一題？','player:不想講。','kexin:好。不講。','kexin:……我也不想講。']));
    fresh(D('2027-10-06'),8,'dorm'); date('kexin'); only('y3_kx_zhan',()=>run(G.day,8,21.5)); check('14. 沒見過詹靖：「我那個拍片的朋友詹靖，……」', K()[0]==='kexin:我那個拍片的朋友詹靖，拍了山下那家的老闆一整天。老闆只說了一句：好。');
    fresh(D('2027-10-06'),8,'dorm',{KX_NCCU_FRIENDS:true}); date('kexin'); only('y3_kx_zhan',()=>run(G.day,8,21.5)); check('14. 見過詹靖（木柵大學的電影夜）：「詹靖拍了山下那家的老闆一整天，……」', K()[0]==='kexin:詹靖拍了山下那家的老闆一整天，老闆只說了一句：好。');
    fresh(D('2027-10-06'),8,'dorm',{KX_BDAY:{2:'class'}}); date('kexin'); only('y3_kx_zhan',()=>run(G.day,8,21.5)); check('14. C7 見過詹靖＝系上小教室的生日在場（舊存檔只有 KX_BDAY[2] class）：「詹靖拍了……」（AA_343 C7）', K()[0]==='kexin:詹靖拍了山下那家的老闆一整天，老闆只說了一句：好。', JSON.stringify(K()));
    fresh(D('2027-09-29'),8,'dorm'); date('kexin'); only('y3_kx_eh1',()=>run(G.day,8,23)); ans('dp_y3_kx_eh1',0);
    check('14. 「欸。」「……以後我只打一個『欸』，就是想找你講話。」 22:40；「在。」→「好。……沒事了。」', JSON.stringify(K())===JSON.stringify(['kexin:欸。','kexin:……以後我只打一個『欸』，就是想找你講話。','player:在。','kexin:好。……沒事了。'])&&Math.abs(at('p:kexin','欸。')-(G.day*24+22+40/60))<0.26);
    fresh(D('2027-10-27'),8,'dorm',{dpN:{y3_kx_eh1:1}}); date('kexin'); only('y3_kx_eh',()=>run(G.day,8,23)); ans('dp_y3_kx_eh_0',0);
    check('14. 之後只有「欸」；「在。」→ 她打來的旁白', JSON.stringify(K())===JSON.stringify(['kexin:欸','player:在。',':（她打來，講了十分鐘今天的事。掛之前說：「好，我要讀書了。」）']));
    fresh(D('2027-11-01'),7,'dorm'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(G.day,7,7.75); check('14. 11/1 07:30 方奕廷「📷（雲海）」「畢業專題的樣區在這裡。這禮拜收不到訊號。」', JSON.stringify(txt('p:npc_fangyt'))===JSON.stringify(['npc_fangyt:📷（雲海）','npc_fangyt:畢業專題的樣區在這裡。這禮拜收不到訊號。']));
    fresh(D('2027-12-10'),19,'dorm'); date('classmate_peishan'); run(G.day,19,19.75); check('14. 和沛珊交往中：12/10 19:30 孩子的作業的照片「我回他：那你要先學會寫字。」', JSON.stringify(txt('p:classmate_peishan'))===JSON.stringify(['classmate_peishan:📷（一張孩子的作業，最上面寫著：老師我長大要當法官）','classmate_peishan:我回他：那你要先學會寫字。']));
    fresh(D('2027-12-10'),19,'dorm'); R('classmate_peishan','FRI'); C('classmate_peishan'); run(G.day,19,20); check('14. 沒交往：不傳訊息（裁定 25）', !TH('p:classmate_peishan').length);
    fresh(D('2028-03-06'),12,'dorm'); R('npc_fangyt','FAM'); C('npc_fangyt'); run(G.day,12,12.5); check('14. 大三下 3/6 12:20「📷（一叢杜鵑）」「畢業專題的樣區，花開了。」', JSON.stringify(txt('p:npc_fangyt'))===JSON.stringify(['npc_fangyt:📷（一叢杜鵑）','npc_fangyt:畢業專題的樣區，花開了。']));
    fresh(D('2028-03-29'),22,'jp',{EXCHANGE_ROUTE:'JP'}); R('heroine_04','FAM'); C('heroine_04'); SOCIAL.remember('heroine_04','DAD_PLAYS',''); run(G.day,22,24);
    check('14. 日本路線、DAD_PLAYS、還沒聽過：3/29 22:40（臺灣）＝日本 23:40「我爸：『第七關那隻狗是誰設計的，很討厭』」「是我」「他已讀了」', JSON.stringify(txt('p:heroine_04'))===JSON.stringify(['heroine_04:我爸：『第七關那隻狗是誰設計的，很討厭』','heroine_04:是我','heroine_04:他已讀了'])&&Math.abs(at('p:heroine_04','是我')-(G.day*24+23+40/60))<0.3&&!!R3.zqDogTold(G), JSON.stringify(txt('p:heroine_04')));
    fresh(D('2027-10-20'),15,'campus'); R('heroine_04','FAM'); SOCIAL.remember('heroine_04','DAD_PLAYS','');
    { const pk=INV.walkPick(G,'heroine_04','cafe'); check('14. 台灣路線、大三上和子晴一起走路（DAD_PLAYS）：「（她把手機舉起來，唸給你聽。）」「『第七關那隻狗是誰設計的，很討厭。』」「……是我。我很得意。」；ZQ_DOG_TOLD', !!pk&&JSON.stringify(pk.lines)===JSON.stringify(['（她把手機舉起來，唸給你聽。）','『第七關那隻狗是誰設計的，很討厭。』','……是我。我很得意。'])&&(pk.next(),SOCIAL.has('heroine_04','ZQ_DOG_TOLD'))&&(()=>{ const p2=INV.walkPick(G,'heroine_04','cafe'); return !p2||JSON.stringify(p2.lines)!==JSON.stringify(pk.lines); })()); }
    fresh(D('2027-10-20'),15,'campus'); R('heroine_04','FAM'); { const pk=INV.walkPick(G,'heroine_04','cafe'); check('14. 沒有 DAD_PLAYS：照原本的同行聊天', !pk||pk.lines[0]!=='（她把手機舉起來，唸給你聽。）'); }
    fresh(D('2028-04-02'),22.5,'jp',{EXCHANGE_ROUTE:'JP'}); R('kai','FRI'); SOCIAL.remember('kai','SUNDAY_SUPPER',''); run(G.day,22.5,24.25);
    check('14. M6 日本路線、阿凱宵夜：4/2 23:00（臺灣）「宵夜？」「喔你在日本」「拉麵比較好吃對不對」「不要回答」＋（傳一碗拉麵的照片）', JSON.stringify(txt('p:kai'))===JSON.stringify(['kai:宵夜？','kai:喔你在日本','kai:拉麵比較好吃對不對','kai:不要回答'])&&Math.abs(at('p:kai','宵夜？')-(D('2028-04-02')*24+24))<0.3&&JSON.stringify(askOpts('r3_y3s2_kai_jp'))===JSON.stringify(['（傳一碗拉麵的照片）']), JSON.stringify(txt('p:kai')));
    ans('r3_y3s2_kai_jp',0); check('14. M6 回拉麵照片 →「我就說不要回答」', txt('p:kai').slice(-1)[0]==='kai:我就說不要回答');
    fresh(D('2028-05-18'),21,'dorm'); R('classmate_mingxuan','FAM'); C('classmate_mingxuan'); SOCIAL.remember('classmate_mingxuan','SAW_HIM_TRY',''); run(G.day,21,22);
    check('14. M5 5/18 21:40 明軒「家教又多接了一個。……德國那筆。」（沒有「獎學金」）', JSON.stringify(txt('p:classmate_mingxuan'))===JSON.stringify(['classmate_mingxuan:家教又多接了一個。……德國那筆。'])&&!txt('p:classmate_mingxuan').some(t=>/獎學金/.test(t)));
    fresh(D('2028-05-18'),21,'dorm'); R('classmate_mingxuan','FAM'); C('classmate_mingxuan'); SOCIAL.remember('classmate_mingxuan','SAW_HIM_TRY',''); SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''); run(G.day,21,22); check('14. 有 SAW_HIM_STUDY：多「你什麼都沒看到。」', txt('p:classmate_mingxuan').slice(-1)[0]==='classmate_mingxuan:你什麼都沒看到。');
    fresh(D('2028-03-15'),8,'jp',{EXCHANGE_ROUTE:'JP',KX_NCCU_FRIENDS:true}); date('kexin'); G.day=D('2028-04-12'); only('y3s2_kx_film',()=>run(G.day,8,23));
    check('14. 日本路線：可昕照當地時間（21:10 臺灣＝22:10 日本）「詹靖的短片在小影展放了。我坐第一排。」', K()[0]==='kexin:詹靖的短片在小影展放了。我坐第一排。'&&Math.abs(at('p:kexin','詹靖的短片在小影展放了。我坐第一排。')-(G.day*24+22+10/60))<0.26, JSON.stringify(K()));
    fresh(D('2028-09-10'),10,'us_apartment',{EXCHANGE_ROUTE:'US'}); R('kai','FRI'); SOCIAL.remember('kai','SUNDAY_SUPPER',''); run(G.day,10,11.25);
    check('14. 美國路線：9/10 23:00（臺灣）＝美東 11:00 阿凱「宵夜？」「喔你在美國」「那我自己吃」「拍給你看」「📷（滷味，籃子夾得很滿）」', JSON.stringify(txt('p:kai'))===JSON.stringify(['kai:宵夜？','kai:喔你在美國','kai:那我自己吃','kai:拍給你看','kai:📷（滷味，籃子夾得很滿）'])&&Math.abs(at('p:kai','宵夜？')-(G.day*24+11))<0.26);
    fresh(D('2028-09-16'),9.5,'us_apartment',{EXCHANGE_ROUTE:'US'}); R('heroine_05','FRI'); C('heroine_05'); run(G.day,9.5,13); check('14. M7 美國路線 9/16：這一版的雞蛋（10:00）拿掉了（AA_370 M2：和 us_life3d.js 交往中 12:10 那則重複，留 USL 那則）', !PHONE.sent(G,'r3_y4_sis_egg_0')&&!txt('p:heroine_05').some(t=>/雞蛋/.test(t)));
    fresh(D('2028-09-16'),9.5,'dorm'); R('heroine_05','FRI'); C('heroine_05'); run(G.day,9.5,10.25); check('14. 台灣路線：沒有雞蛋那則', !PHONE.sent(G,'r3_y4_sis_egg_0'));
    fresh(D('2028-09-27'),8,'dorm'); date('kexin'); only('y4_kx_twenty1',()=>run(G.day,8,22.5)); ans('dp_y4_kx_twenty1',0);
    check('14. M8 大四上第 4 週起 22:10「二十分鐘。」「這段讀完就打給你。」；「好。」→（二十分鐘後，她真的打來了。）', JSON.stringify(K())===JSON.stringify(['kexin:二十分鐘。','kexin:這段讀完就打給你。','player:好。',':（二十分鐘後，她真的打來了。）']));
    fresh(D('2028-10-04'),8,'dorm',{dpN:{y4_kx_twenty1:1}}); date('kexin'); only('y4_kx_twenty',()=>run(G.day,8,22.5)); check('14. 之後「二十分鐘」', K()[0]==='kexin:二十分鐘');
    fresh(D('2028-10-04'),8,'dorm'); date('kexin'); only('y4_kx_index2',()=>run(G.day,8,21.5)); check('14. 沒見過邵鈞：「我們系那個考古題有目錄的人，現在出第二冊了。」', K()[0]==='kexin:我們系那個考古題有目錄的人，現在出第二冊了。');
    fresh(D('2028-10-04'),8,'dorm'); date('kexin'); SOCIAL.remember('kexin','ENC_D13_KX',''); only('y4_kx_index2',()=>run(G.day,8,21.5)); check('14. 見過邵鈞（ENC_D13_KX）：「邵鈞的考古題目錄，現在有第二冊。」', K()[0]==='kexin:邵鈞的考古題目錄，現在有第二冊。');
    { const seen=prep=>{ fresh(D('2028-10-04'),8,'dorm',prep.flags||{}); date('kexin'); if(prep.mem) SOCIAL.remember('kexin',prep.mem,''); only('y4_kx_index2',()=>run(G.day,8,21.5)); return K()[0]==='kexin:邵鈞的考古題目錄，現在有第二冊。'; };
      check('14. C7 見過邵鈞＝電影夜（KX_NCCU_FRIENDS）、小教室生日（KX_BDAY[2] class）、貓空（ENC_D09_KX）任一（AA_343 C7）', seen({flags:{KX_NCCU_FRIENDS:true}})&&seen({flags:{KX_BDAY:{2:'class'}}})&&seen({mem:'ENC_D09_KX'})&&!seen({flags:{KX_BDAY:{2:'shop'}}})); }
    fresh(D('2029-03-14'),8,'dorm'); date('kexin'); only('y4s2_kx_soon',()=>run(G.day,8,21.5)); check('14. 大四下「山下那家的老闆問我們是不是要畢業了。我說還沒。他說：快了。」', K()[0]==='kexin:山下那家的老闆問我們是不是要畢業了。我說還沒。他說：快了。');
    fresh(D('2029-03-14'),8,'dorm'); R('kexin','FRI'); only('y4s2_kx_soon',()=>run(G.day,8,21.5)); check('14. 可昕的只給交往中', !K().length); }

  // ===== 15. 3-12 何俊朗 1～5（美國路線）=====
  { const u14=D('2028-08-14'), s8=D('2028-09-08'), s15=D('2028-09-15'), o4=D('2028-10-04'), o6=D('2028-10-06'), o24=D('2028-10-24');
    const who=t=>{ const s=said.find(x=>x.t===t); return s?s.who:null; };
    check('15. 何俊朗只登錄名字（PORTRAIT_ONLY，compact）：對話框、手機都是「何俊朗」', typeof PORTRAIT_ONLY!=='undefined'&&PORTRAIT_ONLY.npc_long&&!CHARACTERS.npc_long&&(fresh(u14,9,'us_apartment',{EXCHANGE_ROUTE:'US'}),SOCIAL.displayName('npc_long')==='何俊朗'&&PHONE.title(G,'p:npc_long')==='何俊朗'));
    /* AA_370 M3（企劃線 a1dc3e61）：這一版停用——美國路線只跑 us_life3d.js 的 USL 版（AA_340 第 2 節裁定 1；tests/us_life_unit.js、tests/aa370_us_unit.js 測）。
       這裡改測「不排、不傳、舊存檔排了的取消」；第 6 節第 9 題（企劃線 9eaf4e98）：事件資料刪掉，原本逐句測這一版台詞的「15. 資料」拿掉（USL 版的台詞在 tests/us_life_unit.js 測）。
       原本測的「15. L1 交往中、US1 已經見過：『B 棟的。又見面了。』」拿掉：那一支作廢（裁定 1、AA_370 第 4 節），這一版停用以後演不到 */
    fresh(u14-3,9,'us_apartment',{EXCHANGE_ROUTE:'US'}); run(u14-3,9,9.25);
    check('15. AA_370 M3：8/11 起 R3 版不排迎新（r3_long_1）', !OUT.get(G,'r3_long_1'));
    fresh(s8-3,9,'us_apartment',{EXCHANGE_ROUTE:'US'}); SOCIAL.remember('npc_long','MET_LONG',''); run(s8-3,9,9.25); run(o4-3,9,9.25); run(o24,20.5,21.25);
    check('15. AA_370 M3：見過他也不排 2a、3（r3_long_2a、r3_long_3），10/24 不傳 r3_long_5', !OUT.get(G,'r3_long_2a')&&!OUT.get(G,'r3_long_3')&&!PHONE.sent(G,'r3_long_5'));
    fresh(s15-3,9,'us_apartment',{EXCHANGE_ROUTE:'US'}); G.outings=[{id:'r3_long_2b',ev:'ev_long_dinner',day:s15,h:18.5,late:0.5,place:'新開的餐廳',title:'新開的餐廳',travel:'',travelH:1/6,state:'planned',ask:null}]; run(s15-3,9,9.25);
    check('15. AA_370 M3：舊存檔排了還沒去的（r3_long_2b）取消', OUT.get(G,'r3_long_2b').state==='cancelled');
    check('15. AA_370 第 6 節第 9 題：R3 版的事件資料刪掉（演不到的舊稿）；回公寓的筆記、聚餐的旁白只由 USL 版演（ev_usl_long4、ev_usl_party，tests/us_life_unit.js）', !STORY_EVENTS.some(e=>/^ev_long_/.test(e.id))&&typeof R3.longNoteDue==='undefined'&&typeof R3.longPartyDue==='undefined', STORY_EVENTS.filter(e=>/^ev_long_/.test(e.id)).map(e=>e.id).join(','));
    fresh(u14-3,9,'dorm',{EXCHANGE_ROUTE:'TW'}); run(u14-3,9,9.25); check('15. 台灣、日本路線：都沒有', !OUT.get(G,'r3_long_1')); }

  { const M=SOCIAL.MEMORY_LABEL, W={MET_LONG:'在美國認識了香港來的 Long',LONG_HAIHAO:'被他問：台灣人的「還好」到底是好還是不好',LONG_BBQ:'「誰都」和「誰也」，最後兩個人一起去了聚餐',LONG_MENU:'中餐館的西蘭花：同一盤菜，兩個名字'};
    check('15. C8 何俊朗四項的人物面板名稱照 AA_343 第 5 節', Object.keys(W).every(k=>M[k]===W[k]), JSON.stringify(Object.keys(W).map(k=>M[k]))); }
  // ===== 16. 3-09 沛珊在台南的「再去」三版（hometown_lines.js 的台南那一組；presence 改台南是 AA_282 第 5 節——2026-10-21 已做（PS-TAINAN-AA282），下面多數項目照舊用假裝的 presence，第一項改成檢查真的 presence）=====
  { const ID='classmate_peishan', P0=STORY.presence; let tainan=false;
    STORY.presence=function(id,G1){ if(id===ID&&tainan) return {here:false,away:'在台南',kind:'after',city:'台南'}; return P0.apply(this,arguments); };
    try{
      fresh(D('2027-10-13'),12,'dorm',{PS_BACK_FIRST:500}); R(ID,'FRI'); C(ID);
      check('16. 真的 presence（AA_282 第 5 節已做）：大三學期中、重新聯絡上＝「我去台南找妳？」（原本這一項檢查「還沒改＝沒有」）', HV.key(G,ID)===ID+'@台南'&&!!HV.offer(G,ID)&&HV.offer(G,ID).ok===true&&STORY.presence(ID,G).kind==='city');
      tainan=true;
      check('16. 她在台南（presence city）：用台南那一組「我去台南找妳？」、高鐵約一小時四十分鐘、2700 元', HV.key(G,ID)===ID+'@台南'&&!!HV.offer(G,ID)&&HV.offer(G,ID).ok===true&&HOMETOWN_LINES[HV.key(G,ID)].ask==='我去台南找妳？'&&HOMETOWN_LINES[HV.key(G,ID)].fare===2700);
      G.day=D('2027-11-16'); check('16. BB_165 5-1（11/19）那天不能選', !HV.days(G,ID).includes(D('2027-11-19'))&&HV.days(G,ID).length===3, JSON.stringify(HV.days(G,ID)));
      G.day=D('2027-10-13'); picks=[0]; said=[]; const day=await HV.ask(GM,ID); const q=OUT.rec(G).find(x=>x.hv&&x.hv.id===ID);
      check('16. 約好：出遊去台南（hv.key 記著台南那一組）', day===D('2027-10-14')&&!!q&&q.place==='台南'&&q.travelH===1.75&&q.hv.key===ID+'@台南'&&has('我去台南找妳？')&&has('好啊！！我帶你去吃我家附近那間。……你不能嫌遠喔。'), JSON.stringify(q));
      G.day=q.day; G.hour=10.5; said=[]; opts=[]; picks=['曬黑']; const m0=G.money; await HV.play(GM,q);
      check('16. 第一次（AA_321 1B-11）：兩杯飲料、「祐廷！這杯你的。……」、她的學校、「欸，你覺得我有沒有哪裡不一樣？」；曬黑了／頭髮剪短了；送車「謝謝你跑這麼遠！到臺北傳給我喔。」；扣 2700；PS_TAINAN_VISITS 1', has('（台南車站。她站在出口，兩手各拿一杯飲料。）')&&has('祐廷！這杯你的。這邊的紅茶很甜喔，你先喝一口。')&&has('這是我們學校。很小吧？走一圈十分鐘。')&&JSON.stringify(opts[0])===JSON.stringify(['「曬黑了。」','「頭髮剪短了？」'])&&has('對！這裡的太陽跟台中不一樣。')&&has('（傍晚，她陪你坐車到高鐵站。）')&&said[said.length-1].t==='謝謝你跑這麼遠！到臺北傳給我喔。'&&G.money===m0-2700&&G.flags.PS_TAINAN_VISITS===1&&!(G.flags.HV_N||{})[ID], JSON.stringify(lines()));
      said=[]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
      check('16. T1 第二次：接人「（台南車站。她在出口揮手。）」「祐廷！你又來了！」「今天我已經想好要去哪裡了。」（沒有兩杯飲料）；三版之一（書店）；PS_AGAIN_LAST', has('（台南車站。她在出口揮手。）')&&has('祐廷！你又來了！')&&has('今天我已經想好要去哪裡了。')&&!has('（台南車站。她站在出口，兩手各拿一杯飲料。）')&&has('這一區是我排的。你看得出來照什麼排的嗎？')&&has('……照書背的顏色。老闆說隨便我。')&&G.flags.PS_TAINAN_VISITS===2&&G.flags.PS_AGAIN_LAST==='books');
      check('16. T2 去四次：三版輪完，第四次從頭（書店 → 老街 → 運河 → 書店）', ['books','food','canal','books'].every((v,i)=>{ G.flags.HV_N[ID+'@台南']=1+i; return HV.pickVariant(G,ID,false,ID+'@台南')===v; }));
      G.flags.HV_N[ID+'@台南']=2; G.day=D('2027-12-15'); said=[]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
      check('16. 老街「我室友說這攤一定要吃。……其實我也是第一次來。」；12/10 以後、沒交往、去過台南：當面看孩子的作業（3-19 裁定 25）', has('我室友說這攤一定要吃。……其實我也是第一次來。')&&has('（一張孩子的作業，最上面寫著：老師我長大要當法官）')&&has('我回他：那你要先學會寫字。')&&G.flags.PS_KID_SHOWN===true);
      said=[]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}}); check('16. 孩子的作業只看一次；運河「欸，那艘船是不是一直停在那裡？」「它在等什麼啊？」', !has('我回他：那你要先學會寫字。')&&has('欸，那艘船是不是一直停在那裡？')&&has('它在等什麼啊？'));
      fresh(D('2027-12-15'),10.5,'dorm',{PS_TAINAN_VISITS:1,HV_N:{[ID+'@台南']:1}}); date(ID); said=[]; await HV.play(GM,{hv:{id:ID,key:ID+'@台南'}});
      check('16. T3 交往中（第二次去）：送車「下次你搭晚一點的那班。我查過了，有一班十點的。」（AA_447 1-2 照第幾次換）；不演孩子的作業（交往中是 12/10 的私訊）', said[said.length-1].t==='下次你搭晚一點的那班。我查過了，有一班十點的。'&&!has('我回他：那你要先學會寫字。'));
      fresh(D('2027-07-10'),12,'dorm'); date(ID); tainan=false; { const o=HV.offer(G,ID); check('16. 寒暑假在台中：照台中那一組（「我去台中找妳？」）', HV.key(G,ID)===ID&&(!o||HOMETOWN_LINES[HV.key(G,ID)].ask==='我去台中找妳？')); }
    } finally { STORY.presence=P0; } }

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
