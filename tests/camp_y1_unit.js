// 開學前迎新宿營 8/22～24（CAMP-L1；AA_205、BB_177 第五版）——不需要瀏覽器。在 Node 裡用遊戲自己的事件引擎跑 STORY.campY1 整段：
//   A 預設選項（都選第一個）：12 段都演、時間照 8/22 08:30 → 8/24、演完回家旁白；小隊五個同學 FIRST_MET（note 'camp'）、MET_ZHE、CAMP_MOLE_REVEALED、CAMP_SEEN=['yu']、CAMP_Y1；
//     手機：「法律系 114 新生（系學會）」有 8/15 公告與 8/21 名單、第七小隊群組排好 8/24 21:00 合照與 8/29 18:00 阿哲；接著 8/29 搬宿舍（startLawWeek1：錢 7,000、第 −18 天）。
//   B 夜遊跟 Kevin 走（看過三個破綻）→ 問他 → CAMP_MOLE_GUESSED，營火揭曉多「看了你一眼」與回隊伍那句、夜談阿哲「你早就知道了喔？」。
//   C 大地遊戲只演兩關；選第二關（沛珊）→ 交換聯絡方式；選兩人三腳和明軒 → MX_CAMP_PAIR。夜談選「我大一歲」→ ZHE_CALLS_GE，第三天早餐「哥，你的蛋。」。
//   D 中途讀檔：campStep=5 從第二天法律闖關接著演，前五段不重演。
//   E 宿營之後：9/1 ev_zhe_w1_meet 宿營版（AA_205 6-2：書包放旁邊、「欸，早。」／有 ZHE_CALLS_GE「哥，早。」、不換名字、不加熟悉）；明軒系籃開頭（BB_177 第 12 節）；9/27 舊迎新不排（有 CAMP_Y1）。
// 修改前（沒有 camp_y1.js、沒有 STORY.campY1）全部 FAIL。用法：node tests/camp_y1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start1'};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|CAMP_Y1_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/activities.js','src/data/characters.js','src/data/events.js','src/data/camp_y1.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},setBg(){},hide(){},slots:{}}; global.CHAR={setExpr(){}};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let G=null, said=[], cards=[], picks=[], entered=[];
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[]},npcs:[],extras:[],interactables:[{deskStudy:true,seat:{x:1.8,z:-1.9,yaw:Math.PI}}],levels:null,setWeather(){},endCinematic(){},cam:{distTarget:0}},D:{active:false,busyDepth:0},npc:{},
  advance(h){ G.hour+=h; },sitAt(p,seat){ GM.sat=seat; },standUp(){ GM.stood=true; },
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){ GM.saves=(GM.saves|0)+1; },energy(){},money(){},setGoal(g){ G.goal=g; },toast(){},updateHUD(){},letterbox(){},fade:()=>Promise.resolve(),
  titleCard:async(a,b)=>{ cards.push(a+'｜'+(b||'')); },
  say:async(who,t)=>{ said.push(typeof who==='string'?who+'：'+t:(who&&who.name?who.name+'：'+t:t)); },
  choose:async opts=>{ if(GM.prefer){ const k=opts.findIndex(o=>GM.prefer.some(w=>o.t.indexOf(w)>=0)); if(k>=0) return k; } const want=picks.shift(); if(want==null) return 0; const k=opts.findIndex(o=>o.t.indexOf(want)>=0); return k<0?0:k; },
  enter:async(z,sp)=>{ entered.push(z); G.zone=z; }};
const fresh=()=>{ G={day:1,weekday:3,hour:21.2,zone:'dorm',stage:'law',name:'祐廷',money:22000,flags:{},choices:{},events:{done:{},last:{},count:0},rel:{},social:null,msgs:[],goal:''};
  SOCIAL.bind(G); EVENTS.bind(GM); if(INV.bind) INV.bind(G); said=[]; cards=[]; picks=[]; entered=[]; GM.saves=0; };
const flush=()=>new Promise(r=>setTimeout(r,10));
const day=k=>STORY.dayOfKey(k);
(async()=>{
  check('0. camp_y1.js 有 12 段、STORY.campY1 存在',typeof STORY.campY1==='function'&&STORY_EVENTS.filter(e=>e.trigger==='camp').length===12);
  // ---------- A 預設選項 ----------
  fresh(); await STORY.campY1(GM);
  const F=G.flags, met=id=>(G.social.mem[id]||[]).find(m=>m.tag==='FIRST_MET');
  const ids=['zhe','classmate_xinci','classmate_peishan','classmate_mingxuan','classmate_bohan'];
  check('A1. 12 段都演完（events.done）、CAMP_Y1、沒有 campStep',STORY.CAMP_SEQ.every(([id])=>G.events.done[id])&&F.CAMP_Y1===true&&F.campStep==null,STORY.CAMP_SEQ.filter(([id])=>!G.events.done[id]).join());
  check('A2. 字卡：8/22 迎新宿營、第 2 天、第 3 天',cards[0]==='2025 年 8 月 22 日（五）｜迎新宿營'&&cards.some(c=>/8 月 23 日（六）｜迎新宿營 第 2 天/.test(c))&&cards.some(c=>/8 月 24 日（日）｜迎新宿營 第 3 天/.test(c)),cards.join(' / '));
  check('A3. 小隊五個同學 FIRST_MET，note＝camp；MET_ZHE',ids.every(id=>met(id)&&met(id).note==='camp')&&F.MET_ZHE===true,ids.map(id=>id+':'+(met(id)?met(id).note:'-')).join(' '));
  check('A4. 臥底揭曉 CAMP_MOLE_REVEALED、破綻至少 3 個（隊呼、生日、晚會）、CAMP_SEEN＝["yu"]',F.CAMP_MOLE_REVEALED===true&&(F.CAMP_MOLE_CLUE|0)>=3&&JSON.stringify(F.CAMP_SEEN)==='["yu"]',JSON.stringify({c:F.CAMP_MOLE_CLUE,s:F.CAMP_SEEN}));
  check('A5. 大地遊戲只演兩關（CAMP_FIELD_N＝2）',F.CAMP_FIELD_N===2,String(F.CAMP_FIELD_N));
  check('A6. 回家旁白（AA_205 2-2）在最後',said.some(t=>t==='（回到家，你把營地帶回來的衣服丟進洗衣機。）'));
  const grpNew=G.msgs.filter(m=>m.th==='g:law_new');
  check('A7. 手機：系學會新生群組有 8/15 公告與 8/21 小隊名單（含玩家名字與凱文）',PHONE.inGroup(G,'law_new')&&grpNew.some(m=>m.day===day('2025-08-15')&&/新生都要參加/.test(m.text))&&grpNew.some(m=>m.day===day('2025-08-21')&&/祐廷/.test(m.text)&&/凱文/.test(m.text)),grpNew.map(m=>m.day+':'+m.text.slice(0,12)).join(' | '));
  const q=(G.phone.q||[]).map(x=>x.tag+'@'+x.day+'/'+x.h);
  check('A8. 第七小隊群組：8/24 21:00 合照、8/29 18:00 阿哲（排好）',PHONE.inGroup(G,'camp_squad_y1')&&q.includes('camp_squad_photo@'+day('2025-08-24')+'/21')&&q.includes('camp_squad_829@'+day('2025-08-29')+'/18'),q.join(' '));
  check('A9. 接著 8/29 搬宿舍：第 −18 天、錢 7,000、進宿舍',G.day===day('2025-08-29')&&G.money===7000&&entered.includes('dorm')&&cards.some(c=>/8 月 29 日/.test(c)),G.day+' '+G.money+' '+entered.join());
  check('A10. 每段演完都自動存檔（12 次以上）',GM.saves>=12,String(GM.saves));
  // ---------- F 8/29 搬進宿舍（AA_195 4-2＋BB_168 第 1 節 ev_kai_movein）----------
  { const ix=t=>said.findIndex(x=>x.indexOf(t)>=0), km=(G.social.mem.kai||[]).find(m=>m.tag==='FIRST_MET');
    check('F1. 日期卡「8 月 29 日（五）｜16:05 · 男生宿舍」',cards.includes('8 月 29 日（五）｜16:05 · 男生宿舍'),cards.slice(-2).join(' / '));
    const o=[ix('行李箱的輪子在宿舍走廊上一直卡到地磚的縫。'),ix('（房間裡已經有一個人。'),ix('阿凱：（回頭）喔，嗨。'),ix('阿凱：好，謝謝。'),ix('（你們各自整理到快十點。'),ix('以前遇到事情，你會去翻民法。'),ix('經濟系的那一年，你不是一個人過的。'),ix('阿凱（手機）：你的冷氣遙控器在我這'),ix('（遙控器最後放在兩張書桌中間。）')];
    check('F2. 順序：行李箱 → 阿凱初遇（預設選第一個「好，謝謝」）→ 整理到快十點 → DAY1_NARR 三句 → 22:40 冷氣訊息 → 遙控器',o.every((v,k)=>v>=0&&(k===0||v>o[k-1])),o.join(','));
    check('F3. MET_KAI、KAI_MOVEIN、阿凱 FIRST_MET＝dorm、ACQUAINTANCE、手機聯絡人有阿凱',F.MET_KAI===true&&F.KAI_MOVEIN===true&&km&&km.note==='dorm'&&SOCIAL.stage('kai')==='ACQUAINTANCE'&&G.contacts.kai!=null,JSON.stringify({km,st:SOCIAL.stage('kai')}));
    check('F4. 坐到書桌前（第一次）、站起來；22:40 以後、冷氣 27 度、目標「整理行李。缺的東西明天去公館買。」',GM.sat&&GM.sat.x===1.8&&GM.stood&&G.hour>=22+40/60-1e-6&&F.DORM_AC===27&&G.goal==='整理行李。缺的東西明天去公館買。'&&F.DAY1_NARR_SEEN===true,G.hour+' '+G.goal);
    const km2=G.msgs.filter(m=>m.th==='p:kai');
    check('F5. 手機：阿凱的對話串有冷氣訊息和回覆',km2.some(m=>m.text==='你的冷氣遙控器在我這')&&km2.some(m=>/27 可以嗎|懶得拿下來/.test(m.text)),km2.map(m=>m.text).join(' | '));
    const n0=said.length; await STORY.lawMoveIn(GM);
    check('F6. 演過就不再演（KAI_MOVEIN）',said.length===n0); }
  fresh(); G.flags.CAMP_Y1=true; G.day=day('2025-08-29'); G.hour=9; picks=['我是']; await STORY.startLawWeek1(GM,null,{day:G.day,hour:15,econ:true});
  { const ix=t=>said.findIndex(x=>x.indexOf(t)>=0);
    check('F7. 經濟系轉過來：「你去年也搬過一次宿舍」在行李箱那句前面；錢不重設',ix('你去年也搬過一次宿舍，這次只有一個行李箱。')>=0&&ix('你去年也搬過一次宿舍')<ix('行李箱的輪子')&&G.money===22000,String(G.money));
    check('F8. 選「我是祐廷，法律系。」→「阿凱。資工。」「法律系喔，那你書應該很多。櫃子大的那格給你。」',said.includes('阿凱：阿凱。資工。')&&said.includes('阿凱：法律系喔，那你書應該很多。櫃子大的那格給你。')); }
  // ---------- B 猜臥底 ----------
  fresh(); picks=['坐阿哲旁邊','洋芋片',null,'第三關','第一關','和阿哲一組','跟 Kevin 走在一起','你是不是來過這裡']; await STORY.campY1(GM,{next:false});
  check('B1. 夜遊跟 Kevin 走、看過三個破綻 → 問他 → CAMP_MOLE_GUESSED',G.flags.CAMP_MOLE_GUESSED===true&&G.flags.CAMP_MOLE_CLUE===4,String(G.flags.CAMP_MOLE_CLUE));
  check('B2. 揭曉多兩句（看了你一眼、回隊伍那句）、夜談阿哲「你早就知道了喔？」',said.includes('（他走出去之前，看了你一眼。）')&&said.some(t=>/我差點就承認了/.test(t))&&said.includes('阿哲：你早就知道了喔？'));
  check('B3. next:false 不接 8/29（還在 8/24）',G.day===day('2025-08-24'),String(G.day));
  // ---------- C 沛珊、明軒、哥 ----------
  fresh(); picks=['坐明軒旁邊',null,'第二關','應該是被罵吧','第一關','和明軒一組','走前面','我上去','付了錢就是我的','幫忙裝水球','負責吃','在旁邊看','我大一歲']; await STORY.campY1(GM,{next:false});
  check('C1. 沛珊那一關 → 交換聯絡方式；兩人三腳和明軒 → MX_CAMP_PAIR',INV.hasContact(G,'classmate_peishan')&&G.flags.MX_CAMP_PAIR===true);
  check('C2. 夜談「我大一歲」→ ZHE_CALLS_GE；第三天早餐「哥，你的蛋。」、明軒要蛋',G.flags.ZHE_CALLS_GE===true&&said.includes('阿哲：（隔著桌子）哥，你的蛋。')&&said.includes('江明軒：那顆蛋你不吃的話給我。'));
  check('C3. 沒猜的人：揭曉沒有「看了你一眼」',!said.includes('（他走出去之前，看了你一眼。）'));
  // ---------- D 中途讀檔 ----------
  fresh(); G.flags.CAMP_Y1_ON=true; G.flags.campStep=5; G.day=day('2025-08-22'); await STORY.campY1(GM,{next:false});
  check('D1. campStep=5：第一天的五段不重演（沒有遊覽車那句），從法律闖關接著演到結束',!said.some(t=>/校門口停了兩台遊覽車/.test(t))&&said.some(t=>/這關很簡單/.test(t))&&G.flags.CAMP_Y1===true&&!G.events.done.ev_camp_d1_bus);
  // ---------- E 宿營之後 ----------
  fresh(); picks=[]; GM.prefer=['跟你們一樣啦']; await STORY.campY1(GM,{next:false}); GM.prefer=null; const evZ=STORY_EVENTS.find(e=>e.id==='ev_zhe_w1_meet'); G.day=day('2025-09-01'); G.flags.LAW_START_DAY=day('2025-08-29'); G.flags.MAIN_D1=-13;
  check('E1. 9/1 宿營認識阿哲：ev_zhe_w1_meet 的條件成立（已經 MET_ZHE 也演宿營版）',EVENTS.cond(evZ.prereq)===true||(evZ.prereq.custom&&evZ.prereq.custom(G)===true));
  const fam0=JSON.stringify(G.rel.zhe||null); said=[]; await EVENTS.run(evZ);
  check('E2. 宿營版：書包放旁邊、「欸，早。」、問中午吃什麼；不換名字、不加熟悉、記 ZHE_W1_CAMP',said.includes('（你坐下沒多久，有人把書包放到你旁邊的位子。）')&&said.includes('阿哲：欸，早。')&&said.some(t=>/我昨天在公館繞了半小時/.test(t))&&!said.some(t=>/我阿哲。張哲維。/.test(t))&&!said.some(t=>/用筆輕輕戳/.test(t))&&JSON.stringify(G.rel.zhe||null)===fam0&&G.flags.ZHE_W1_CAMP===true,said.join(' / '));
  fresh(); picks=['坐阿哲旁邊','洋芋片',null,'第一關','和明軒一組','第三關','走前面','我上去',null,'衝前面','顧火','在旁邊看','我大一歲']; await STORY.campY1(GM,{next:false}); G.day=day('2025-09-01'); said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_zhe_w1_meet'));
  check('E3. 有 ZHE_CALLS_GE：「哥，早。」',said.includes('阿哲：哥，早。'));
  said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_mingxuan_ball'));
  check('E4. 兩人三腳和明軒一組：系籃開頭「欸，宿營兩人三腳那個。你也來打球喔？」、不再自我介紹',said[0]==='江明軒：欸，宿營兩人三腳那個。你也來打球喔？'&&!said.some(t=>/阿哲的隊友/.test(t)),said.slice(0,2).join(' / '));
  const wel=ACTIVITIES.list.find(a=>a.id==='welcome_y1s1'), d927=day('2025-09-27');
  check('E5. 有宿營（CAMP_Y1）的局 9/27 舊迎新不排；沒有宿營的（開發起點）照排',ACTIVITIES.on(wel,d927,G)===false&&ACTIVITIES.on(wel,d927,{flags:{}})===true);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
