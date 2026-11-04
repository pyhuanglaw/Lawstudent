// AA_637 好朋友的自動劇情第二批（X157 STORY-FRIENDS-EVENTS-1103，企劃線 b1ad8aa99）＋第 3 節名字卡——不需要瀏覽器。修改前（沒有 src/friends2_3d.js）全部 FAIL。用法：node tests/aa637_friends2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start1'};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|CAMP_Y1_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ACTIVITIES|REL_LINES|SUP497|SUP497_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/characters.js','src/data/events.js','src/data/camp_y1.js','src/data/rel_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
for(const f of ['src/data/sup497_lines.js','src/sup497_3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},setBg(){},hide(){},show(){},slots:{}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[], picks=[], optsSeen=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}],levels:null,setWeather(){},endCinematic(){},cam:{distTarget:0}},D:{active:false,busyDepth:0},npc:{},
  advance(h){ G.hour+=h; },sitAt(){},standUp(){},rel(){},sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},energy(){},money(){},setGoal(g){ G.goal=g; },toast(){},updateHUD(){},letterbox(){},fade:()=>Promise.resolve(),titleCard:async()=>{},
  say:async(who,t)=>{ said.push(typeof who==='string'?who+'：'+t:(who&&who.name?who.name+'：'+t:t)); },
  choose:async opts=>{ optsSeen.push(opts.map(o=>o.t).join('/')); const want=picks.shift(); if(want==null) return 0; const k=opts.findIndex(o=>o.t.indexOf(want)>=0); return k<0?0:k; },
  enter:async(z)=>{ G.zone=z; }, spawnNPC(){ return null; }, spawnCharacter(){ return null; }};
const fresh=()=>{ G={day:1,weekday:3,hour:21.2,zone:'dorm',stage:'law',name:'祐廷',money:22000,flags:{},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,msgs:[],goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); if(INV.bind) INV.bind(G); said=[]; picks=[]; optsSeen=[]; };
const day=k=>STORY.dayOfKey(k), ev=id=>STORY_EVENTS.find(e=>e.id===id);
const at=(k,h,o)=>{ G.day=day(k); G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=h; Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29'),KAI_MOVEIN:true,MET_KAI:true},o||{}); };
const is=(s,t)=>s===t||(s||'').endsWith('：'+t), block=list=>{ const i0=said.findIndex(s=>is(s,list[0])); if(i0<0) return 'missing: '+list[0]; for(let k=0;k<list.length;k++) if(!is(said[i0+k],list[k])) return 'at '+k+': '+said[i0+k]; return ''; };
const card=id=>{ const m=(G.social.mem[id]||[]).find(x=>x.tag==='FRIEND_CARD'); return m?m.note:null; }, fam=id=>SOCIAL.rel(id).fam|0;

load('src/friends2_3d.js');
const cp=require('child_process'); require('./alison.js');
const DOC=(()=>{ try{ return cp.execSync('git -C '+JSON.stringify(ROOT)+' show b1ad8aa99:"docs/story_planning/AA_637_好朋友的自動劇情_第二批_第6到16週.md"',{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ return ''; } })();
const inDoc=t=>DOC.indexOf(t)>=0;
const slot=c=>FRIENDS2.slotDay(c);
const setDay=(d,h)=>{ G.day=d; G.weekday=CALENDAR.dateOf(d).wd%7; G.hour=h; Object.assign(G.flags,{MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:day('2025-08-29'),KAI_MOVEIN:true,MET_KAI:true}); };
(async()=>{
  fresh();
  // ---------- 0. 九場都在、台詞一字照稿 ----------
  check('0. 稿讀得到（企劃線 b1ad8aa99 AA_637）',DOC.length>1000);
  const ids=['ev_f2_kai_submit','ev_f2_zhe_bohan_page','ev_f2_bohan_lamp','ev_f2_yu_debate_lose','ev_f2_youchen_back','ev_f2_xc_report'];
  check('0. 六個事件在 STORY_EVENTS（203 三場、教室三場）',ids.every(id=>!!ev(id)),ids.filter(id=>!ev(id)).join(','));
  const texts=[]; for(const id of ids) for(const l of ev(id).dialogue){ if(l.text) texts.push(l.text); if(l.choice) for(const c of l.choice) texts.push(c.text); }
  for(const c in FRIENDS2.MSG){ G.name='祐廷'; for(const it of FRIENDS2.MSG[c].items(G)){ texts.push(it.text); if(it.ask) for(const o of it.ask.opts){ texts.push(o.t); for(const s of o.say) texts.push(s.text.replace('祐廷','{name}')); } } if(FRIENDS2.MSG[c].after) for(const it of FRIENDS2.MSG[c].after.items) texts.push(it.text); }
  const norm=t=>t.replace(/^「|」$/g,'').replace(/^（|）$/g,'');
  const miss=texts.filter(t=>!inDoc(t)&&!inDoc(norm(t))&&!inDoc('（'+norm(t)+'）'));
  check('0. 台詞、旁白、選項都在稿裡（一字不差）',miss.length===0,JSON.stringify(miss.slice(0,6)));
  // ---------- 1. 時段：第 9 週週四 22:00（阿凱）——今天沒事件＝演；同一天有女主角的事件＝延；延不到 3 天以上＝不演 ----------
  fresh(); const d1=slot('F2_01'); setDay(d1,22.5); G.zone='dorm';
  check('1. F2-01 的日子是大一上第 9 週週四',CALENDAR.termOf(d1).week===9&&CALENDAR.dateOf(d1).wd===4,CALENDAR.dateOf(d1).key);
  const kai=ev('ev_f2_kai_submit'); global.STORY.dormWho=()=>[['kai'],['zhe'],['classmate_bohan']];
  check('1. 週四 22:30 在 203、阿凱在＝可以演',EVENTS.check(kai));
  G.events.last.ev_rain_library_door=G.day;   /* 語彤的事件（女主角）同一天演過 */
  check('1. 同一天演過女主角的事件＝今天不演（延）',!EVENTS.check(kai));
  setDay(d1+1,22.5); check('1. 隔天同一個時段＝演（延一天）',EVENTS.check(kai));
  setDay(d1+4,22.5); check('1. 延到第 4 天＝不演（最多 3 天）',!EVENTS.check(kai));
  setDay(d1,21); delete G.events.last.ev_rain_library_door; check('1. 21:00（還沒到 22:00）不演',!EVENTS.check(kai));
  setDay(d1,22.5); said=[]; await EVENTS.run(kai);
  check('1. 演完：第一、二句有人叫名字（阿哲：阿凱？）、記 FRIEND_AUTO_F2_01、阿凱熟悉 +1',said[1]==='阿哲：阿凱？'&&G.flags.FRIEND_AUTO_F2_01===true&&fam('kai')>=1,said.slice(0,3).join(' | '));
  check('1. 演過就不再演',!EVENTS.check(kai));
  // ---------- 2. 考試週不排：第 15 週週六 24:30（柏翰檯燈）延三天會碰到第 16 週＝不演 ----------
  fresh(); const d7=slot('F2_07'); setDay(d7,24.6); G.zone='dorm';
  check('2. F2-07 是第 15 週週六那個遊戲日的 24:30（＝週日 00:30）',CALENDAR.termOf(d7).week===15&&CALENDAR.dateOf(d7).wd===6);
  check('2. 週六 24:36 在 203、柏翰在＝演',EVENTS.check(ev('ev_f2_bohan_lamp')));
  setDay(d7+2,24.6); check('2. 延到第 16 週（期末考週）＝不演',CALENDAR.termOf(d7+2).week===16&&!EVENTS.check(ev('ev_f2_bohan_lamp')));
  setDay(d7,24.6); said=[]; picks=['有一點']; await EVENTS.run(ev('ev_f2_bohan_lamp'));
  check('2. 「有一點。」→「抱歉。（把檯燈轉向牆壁）再一章。」、最後「……晚安，{name}。」',said.includes('柏翰：抱歉。（把檯燈轉向牆壁）再一章。')&&said.some(s=>/晚安，祐廷。$/.test(s)),said.join(' | '));
  // ---------- 3. 阿哲、柏翰「第幾頁」：ball_invite 多一句 ----------
  fresh(); setDay(slot('F2_03'),23.6); G.zone='dorm'; G.flags.ball_invite=true; said=[]; await EVENTS.run(ev('ev_f2_zhe_bohan_page'));
  check('3. F2-03：第二句「阿哲：柏翰。」、有 ball_invite 多「你下禮拜也來啊。練完一起念。」、兩人熟悉 +1',said[1]==='阿哲：柏翰。'&&said.includes('阿哲：你下禮拜也來啊。練完一起念。')&&fam('zhe')>=1&&fam('classmate_bohan')>=1);
  // ---------- 4. 教室：宥辰要演過第 2 週那場；芯慈第 10 週民總下課 ----------
  fresh(); setDay(slot('F2_06'),13);
  const yc=ev('ev_f2_youchen_back'); check('4. F2-06 的 prereq 讀 ev_yc_meet_after',!EVENTS.cond(yc.prereq)); G.events.done.ev_yc_meet_after=1; check('4. 演過 ev_yc_meet_after＝prereq 通過',EVENTS.cond(yc.prereq));
  check('4. F2-06 讓位：beforeClass 只認民總（civ_general）',yc.beforeClass({c:{id:'civ_general'}})===true&&yc.beforeClass({c:{id:'const_1'}})===false);
  check('4. F2-04 只認憲法（上）上課前、F2-08 只認民總下課',ev('ev_f2_yu_debate_lose').beforeClass({c:{id:'const_1'}})&&!ev('ev_f2_yu_debate_lose').beforeClass({c:{id:'civ_general'}})&&typeof ev('ev_f2_xc_report').afterClass==='function');
  fresh(); setDay(slot('F2_08'),15.5); said=[]; await EVENTS.run(ev('ev_f2_xc_report'));
  check('4. F2-08：第二句「阿哲：芯慈，等一下一起吃飯？」、最後「祐廷 也來。」',said[1]==='阿哲：芯慈，等一下一起吃飯？'&&said[said.length-1].endsWith('祐廷 也來。'),said.join(' | '));
  // ---------- 5. 群組：還沒在桌遊團群組＝不發；在群組＝時間到了發、記 YU_DEBATE_R1；芯慈 07:10 柏翰那一則 ----------
  fresh(); const d2=slot('F2_02'); setDay(d2,18.2); FRIENDS2.phone(G);
  check('5. F2-02：還沒進桌遊團群組＝不發',!PHONE.sent(G,'msg_f2_yu_debate1'));
  PHONE.rec(G).groups.noodle_team={name:'桌遊團',members:['zhe','yu','classmate_bohan']}; setDay(d2,17.5); FRIENDS2.phone(G); check('5. 17:30（還沒 18:00）不發',!PHONE.sent(G,'msg_f2_yu_debate1'));
  setDay(d2,18.2); FRIENDS2.phone(G); check('5. 在群組、18:12＝發，記 YU_DEBATE_R1、FRIEND_AUTO_F2_02',PHONE.sent(G,'msg_f2_yu_debate1')&&G.flags.YU_DEBATE_R1===true&&G.flags.FRIEND_AUTO_F2_02===true);
  const d9=slot('F2_09'); check('5. F2-09 是第 14 週週五那一晚過了午夜（週六 00:40）',CALENDAR.termOf(d9).week===14&&CALENDAR.dateOf(d9).wd===5);
  setDay(d9,24.7); FRIENDS2.phone(G); check('5. F2-09：24:42 發',PHONE.sent(G,'msg_f2_xc_wrong'));
  setDay(d9+1,7); FRIENDS2.phone(G); check('5. 隔天 07:00 柏翰那一則還沒',!PHONE.sent(G,'msg_f2_xc_wrong_am'));
  setDay(d9+1,7.2); FRIENDS2.phone(G); check('5. 隔天 07:12 柏翰「一點了還不睡。」',PHONE.sent(G,'msg_f2_xc_wrong_am'));
  const d5=slot('F2_05'); setDay(d5,21.1); FRIENDS2.phone(G); const th=(PHONE.rec(G).msgs||PHONE.rec(G).list||[]);
  check('5. F2-05 第 14 週週日 21:00；沒演過 ev_card_mingxuan＝第一句「之前做的清單，更新了。」',PHONE.sent(G,'msg_f2_mx_xlsx2')&&JSON.stringify(PHONE.rec(G)).indexOf('之前做的清單，更新了。')>=0);
  // ---------- 6. 名字卡 ----------
  fresh(); G.stage='law';
  check('6. 名字卡文字照 characters.js（叫的名字｜全名・科系年級）',FRIENDS2.cardText('zhe')==='阿哲｜張哲維・法律系一年級'&&FRIENDS2.cardText('kai')==='阿凱｜王凱翔・資工系一年級（203 室友）'&&FRIENDS2.cardText('yu')==='Alison｜李語晴・法律系一年級',[FRIENDS2.cardText('zhe'),FRIENDS2.cardText('kai'),FRIENDS2.cardText('yu')].join(' / '));
  check('6. 第一次說話＝出現、記 NAMECARD_zhe；第二次不出現',FRIENDS2.onSay(G,{name:'阿哲',charId:'zhe'})==='阿哲｜張哲維・法律系一年級'&&G.flags.NAMECARD_zhe===true&&FRIENDS2.onSay(G,{name:'阿哲',charId:'zhe'})===null);
  check('6. 只寫名字的說話者也認得（{name:"明軒"}）、手機訊息（「（手機）」）不算',FRIENDS2.onSay(G,{name:'明軒（手機）'})===null&&FRIENDS2.onSay(G,{name:'明軒'})!==null);
  check('6. 不是 A 層朋友（以安）不出現',FRIENDS2.onSay(G,{name:'以安',charId:'heroine_01'})===null);
  G.stage='econ'; check('6. 經濟系那一年不出現',FRIENDS2.onSay(G,{name:'柏翰',charId:'classmate_bohan'})===null); G.stage='law';
  const old={flags:{},social:{mem:{yu:[{tag:'FIRST_MET'}]},rel:{classmate_bohan:{fam:12}}}}; FRIENDS2.migrate(old);
  check('6. 舊存檔：已經認識的（記憶、熟悉度）記 NAMECARD_，沒認識的不記；新遊戲有 NAMECARD_V 不看',old.flags.NAMECARD_V===1&&old.flags.NAMECARD_yu===true&&old.flags.NAMECARD_classmate_bohan===true&&!old.flags.NAMECARD_classmate_youchen&&FRIENDS2.migrate({flags:{NAMECARD_V:1}})===false);
  const gsrc=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'), html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
  check('6. 接線：game3d showLine 叫 FRIENDS2.onSay、defaults 有 NAMECARD_V、migrate 叫 FRIENDS2.migrate；index.html 載 friends2_3d.js、有 #nameCard 的樣式（pointer-events:none）',/FRIENDS2\.onSay\(GM\.G,who\)/.test(gsrc)&&/NAMECARD_V:1/.test(gsrc)&&/FRIENDS2\.migrate\(s\)/.test(gsrc)&&html.includes('src/friends2_3d.js')&&/#nameCard\{[^}]*pointer-events:none/.test(html));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
