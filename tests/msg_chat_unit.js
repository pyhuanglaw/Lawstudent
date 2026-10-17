// 玩家主動傳訊息（SYS-PHONE-CHAT／MSG-L1；AA_202 第 1～4 節、BB_178 第 0 節）：
//   A 開放：沒有聯絡方式不開；可昕只有交往中；子晴要 Q6（ev_ziqing_secret_game）；芷若在英國不開；學姊有點熟才開、不到朋友是事務版；沛珊重考消失期只顯示已送達、不回。
//   B 話題：在幹嘛、分享一直有；問課只給同一門課的（語彤沒有；芷若只有大一）；晚安 21:30 以後、好朋友以上或 L 層，祐廷和別人交往中而且她知道就不開。
//   C 一天一次；回覆照作息排時間（有空幾分鐘、上課等下課、以安 22:30 以後隔天早上「昨天睡了。早。」；傳晚安只回那一句）；回問選項接在最後一則。
//   D 層：A／R／L；L 只給戀愛對象（交往中，或第 5 階以上而且兩人都單身）；同一層輪流用；情況版（放假、深夜）先用；標籤不對不用。
//   E 熟悉度：SOCIAL.activity 'msg'（一天最多 +1）；一週第 4 次起不加。
//   F 真的回覆池（src/data/msg_pool.js）在的話：每一句都在 AA_202 第 6 節或 BB_178 的原文裡（逐字）。
// 修改前：沒有 MSG（第 A 項就失敗）。用法：node tests/msg_chat_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ROM|MSG|MSG_POOL|HOME)$/.test(n)?'global.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const REAL=fs.existsSync(path.join(ROOT,'src/data/msg_pool.js'));
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/home3d.js','src/romance3d.js'].concat(REAL?['src/data/msg_pool.js']:[]).concat(['src/msg3d.js'])) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let G=null; const STAGE={};
const GM={get G(){ return G; },E:{player:{busy:false,obj:{position:{x:0,y:0,z:0}}},zone:{seats:[]},npcs:[],interactables:[]},D:{active:false},npc:{},say:async()=>{},choose:async()=>0,sceneBegin(){},sceneEnd(){}};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,flags)=>{ G={v:3,day,hour,zone:'campus',weekday:wdOf(day),weather:'clear',flags:Object.assign({},flags||{}),events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,contacts:{},stage:'law'}; SOCIAL.bind(G); EVENTS.bind(GM); return G; };
global.DATE={stageNum:id=>STAGE[id]||1};
const STN=['STRANGER','ACQUAINTANCE','FAMILIAR','FRIEND','CLOSE_FRIEND','POSSIBLE_ROMANTIC_INTEREST','ROMANTIC_TENSION']; SOCIAL.stage=id=>STN[STAGE[id]||0];   /* 第幾階（DATE.stageNum 的 1～6）→ SOCIAL 的階段名 */
/* 假的回覆池（真的不在時用；真的在時第 A～E 項也用假的，避免台詞改了測試跟著變）*/
const FAKE={people:{
  heroine_01:{replies:[{topic:'chat',tier:'A',msgs:['在總圖。'],tags:[]},{topic:'chat',tier:'A',msgs:['剛下課，要去吃飯。'],tags:['學期中、平日']},{topic:'chat',tier:'R',msgs:['總圖二樓，旁邊有位子。'],tags:[]},{topic:'chat',tier:'R',msgs:['剛跑完步，在等洗澡。'],tags:['傍晚、晚上']},
    {topic:'chat',tier:'L',msgs:['在宿舍，剛洗好頭。','你呢？'],tags:['晚上'],ask:{opts:[{t:'在讀書',r:['好。']},{t:'在發呆',r:['嗯。']}]}},{topic:'course',tier:'A',msgs:['我有抄到。','（照片：一頁筆記，字很整齊）'],tags:[]},
    {topic:'share_cat',tier:'A',msgs:['（兔子「收到」）'],tags:[]},{topic:'night',tier:'R',msgs:['晚安。','（兔子「收到」）'],tags:[]},{topic:'chat',tier:'R',variant:'放假',msgs:['在台中。'],tags:[]}]},
  heroine_03:{replies:[{topic:'chat',tier:'A',msgs:['在店裡'],tags:[]},{topic:'share',tier:'A',msgs:['（照片）'],tags:[]},{topic:'course',tier:'A',msgs:['不該出現'],tags:[]}]},
  heroine_05:{replies:[{topic:'chat',tier:'A',variant:'事務版',msgs:['收到。'],tags:[]},{topic:'chat',tier:'R',variant:'閒聊版',msgs:['在法圖。'],tags:[]}]},
  classmate_peishan:{replies:[{topic:'chat',tier:'A',msgs:['在課輔班'],tags:[]}]},
  kexin:{replies:[{topic:'chat',tier:'L',msgs:['在政大'],tags:[]}]},
  heroine_04:{replies:[{topic:'chat',tier:'A',msgs:['在寫 code'],tags:[]}]},
  heroine_02:{replies:[{topic:'chat',tier:'A',msgs:['在店裡。'],tags:[]}]}
}};
const realPool=global.MSG_POOL; global.MSG_POOL=FAKE;
const day=STORY.termDay('Y1S1',5,3);   /* 大一上第 5 週週三 */
const pend=()=>PHONE.rec(G).q.slice();
const th=id=>PHONE.thread(G,'p:'+id).filter(m=>m.from).map(m=>(m.from==='player'?'我：':'')+m.text);   /* 系統的「加了聯絡方式」不算 */
// A 開放
{ fresh(day,15); check('A1. 有 MSG（open、topics、send、replyAt、pick）',typeof MSG!=='undefined'&&['open','topics','send','replyAt','pick','tier'].every(k=>typeof MSG[k]==='function'));
  check('A2. 沒有聯絡方式：不開',!MSG.open(G,'heroine_01').ok,MSG.open(G,'heroine_01').why);
  INV.addContact(G,'heroine_01'); STAGE.heroine_01=1; check('A3. 有聯絡方式：開',MSG.open(G,'heroine_01').ok);
  STAGE.kexin=4; check('A4. 可昕：交往中才開（法律系開場預設交往）',!MSG.open(G,'kexin').ok&&(G.flags.dating_kexin=true,MSG.open(G,'kexin').ok)); G.flags.dating_kexin=false;
  INV.addContact(G,'heroine_04'); STAGE.heroine_04=2; check('A5. 子晴：Q6 以前沒有她的私訊',!MSG.open(G,'heroine_04').ok); G.events.done.ev_ziqing_secret_game=1; check('A5. Q6 以後開',MSG.open(G,'heroine_04').ok);
  STAGE.heroine_05=1; check('A6. 學姊：不到有點熟不開',!MSG.open(G,'heroine_05').ok); STAGE.heroine_05=2; check('A6. 有點熟：事務版',MSG.open(G,'heroine_05').mode==='business'); STAGE.heroine_05=3; check('A6. 朋友、兩人都單身：閒聊版',!MSG.open(G,'heroine_05').mode);
  G.flags.dating_kexin=true; ROM.learn(G,'heroine_05','kexin','test'); check('A6. 祐廷交往中而且她知道：事務版',MSG.open(G,'heroine_05').mode==='business'); G.flags.dating_kexin=false;
  INV.addContact(G,'classmate_peishan'); STAGE.classmate_peishan=2; const sd=STORY.dayOfKey('2027-01-10'); fresh(sd,15); INV.addContact(G,'classmate_peishan'); check('A7. 沛珊重考消失期（2026-12-17～2027-08-06）：照開、只顯示已送達',MSG.open(G,'classmate_peishan').mode==='silent');
  const r=MSG.send(G,'classmate_peishan','chat'); check('A7. 傳了：已送達，她不回（沒有排回覆）',r.ok&&r.silent&&!pend().length&&th('classmate_peishan').length===1,JSON.stringify(th('classmate_peishan')));
  const uk=STORY.dayOfKey('2027-10-20'); fresh(uk,15); INV.addContact(G,'heroine_02'); STAGE.heroine_02=3; const pr=STORY.presence('heroine_02',G);
  check('A8. 芷若在英國（大三上交換）：不開（只寄明信片）',pr.here===false&&!MSG.open(G,'heroine_02').ok,JSON.stringify(pr)); }
// B 話題
{ fresh(day,15); INV.addContact(G,'heroine_01'); STAGE.heroine_01=1; const tk=id=>MSG.topics(G,id).map(q=>q.k).join(',');
  check('B1. 以安（同班、有點熟、15:00）：在幹嘛、問課、分享，沒有晚安',tk('heroine_01')==='chat,course,share',tk('heroine_01'));
  INV.addContact(G,'heroine_03'); STAGE.heroine_03=1; check('B2. 語彤（社會系）：沒有問課',!/course/.test(tk('heroine_03')),tk('heroine_03'));
  G.hour=22; STAGE.heroine_01=3; check('B3. 22:00、朋友（第 3 階）：還沒有晚安（好朋友以上）',!/night/.test(tk('heroine_01')),tk('heroine_01'));
  STAGE.heroine_01=4; check('B3. 好朋友（第 4 階）：有晚安',/night/.test(tk('heroine_01')),tk('heroine_01'));
  G.flags.dating_kexin=true; ROM.learn(G,'heroine_01','kexin','test'); check('B4. 祐廷和可昕交往中、以安知道：不開晚安',!/night/.test(tk('heroine_01')),tk('heroine_01'));
  G.hour=15; check('B5. 放假（沒有學期）：沒有問課',(()=>{ fresh(STORY.dayOfKey('2026-07-15'),15); INV.addContact(G,'heroine_01'); return !/course/.test(tk('heroine_01')); })()); }
// C 一天一次、回覆時間
{ fresh(day,15); INV.addContact(G,'heroine_01'); STAGE.heroine_01=1;
  const at=MSG.replyAt(G,'heroine_01'); const r=MSG.send(G,'heroine_01','chat');
  check('C1. 傳「在幹嘛」：祐廷那一句馬上在對話裡',r.ok&&th('heroine_01')[0]==='我：在幹嘛',JSON.stringify(th('heroine_01')));
  check('C2. 回覆排在 1～10 分鐘後（以安有空時），時間到才出現',pend().length===1&&(pend()[0].h-15)*60>=1&&(pend()[0].h-15)*60<=10.01&&th('heroine_01').length===1,JSON.stringify(pend()));
  check('C3. 同一天第二次：不行',!MSG.send(G,'heroine_01','share','cat').ok&&!MSG.canSend(G,'heroine_01'));
  G.hour=15.3; PHONE.tick(G,()=>{}); check('C4. 時間到：她的回覆出現（A 層、學期中平日的句子都可能）',th('heroine_01').length===2&&['在總圖。','剛下課，要去吃飯。'].includes(th('heroine_01')[1]),JSON.stringify(th('heroine_01')));
  fresh(day,23); INV.addContact(G,'heroine_01'); STAGE.heroine_01=4; const r2=MSG.send(G,'heroine_01','night'); const q=pend();
  check('C5. 23:00 傳晚安：以安睡了（22:30 以後）→ 隔天早上 7 點多只回「昨天睡了。早。」',r2.ok&&q.length===1&&q[0].day===day+1&&q[0].h>=7.25&&q[0].h<7.7&&q[0].items.length===1&&q[0].items[0].text==='昨天睡了。早。',JSON.stringify(q));
  fresh(day,23); INV.addContact(G,'heroine_01'); STAGE.heroine_01=1; MSG.send(G,'heroine_01','chat'); const q2=pend()[0];
  check('C6. 23:00 傳在幹嘛：隔天早上先「昨天睡了。早。」再接一般句',q2.items[0].text==='昨天睡了。早。'&&q2.items.length>=2,JSON.stringify(q2.items));
  fresh(day,20); INV.addContact(G,'heroine_01'); STAGE.heroine_01=6; G.flags.dating_heroine_01=true; MSG.send(G,'heroine_01','chat'); const q3=pend()[0]; const last=q3.items[q3.items.length-1];
  check('C7. L 層（交往中）晚上：「在宿舍，剛洗好頭。」「你呢？」，回問兩個選項接在最後一則',q3.items[0].text==='在宿舍，剛洗好頭。'&&last.ask&&last.ask.opts.length===2&&last.ask.opts[0].say[0].text==='好。',JSON.stringify(q3.items));
  G.hour=q3.h+0.01; G.day=q3.day; PHONE.tick(G,()=>{}); const m=PHONE.thread(G,'p:heroine_01').find(x=>x.ask); const a=m&&PHONE.answer(G,m.ask.id,0);
  check('C8. 回問選「在讀書」：祐廷那一句＋她「好。」',!!a&&th('heroine_01').slice(-2).join('|')==='我：在讀書|好。',JSON.stringify(th('heroine_01')));
  const cls=STORY.termDay('Y1S1',5,4); fresh(cls,13.5); INV.addContact(G,'heroine_01'); STAGE.heroine_01=1; const bu=MSG.busyUntil(G,'heroine_01');
  if(bu!=null){ MSG.send(G,'heroine_01','chat'); check('C9. 她在上課（13:10～15:12）：下課以後才回',pend()[0].h>=bu,JSON.stringify({bu,at:pend()[0].h})); } else check('C9. 週四 13:30 以安在上課（作息有 class）',false,JSON.stringify(STORY.schedEnt(CHARACTERS.heroine_01,G))); }
// D 層、輪流、情況版
{ fresh(day,15); INV.addContact(G,'heroine_01'); STAGE.heroine_01=3; global.MSG_POOL=FAKE;
  const a=MSG.pick(G,'heroine_01','chat').msgs[0], b=MSG.pick(G,'heroine_01','chat').msgs[0];
  check('D1. R 層 15:00：只有沒有標籤的「總圖二樓」（「剛跑完步」標傍晚、晚上）',a==='總圖二樓，旁邊有位子。'&&b===a,a+' / '+b);
  G.hour=18.5; const c1=MSG.pick(G,'heroine_01','chat').msgs[0], c2=MSG.pick(G,'heroine_01','chat').msgs[0]; check('D2. 18:30：兩句輪流',c1!==c2,c1+' / '+c2);
  check('D3. L 層只給交往中或第 5 階以上而且兩人都單身',MSG.tier(G,'heroine_01')==='R'&&(STAGE.heroine_01=5,MSG.tier(G,'heroine_01')==='L')&&(G.flags.dating_classmate_peishan=true,MSG.tier(G,'heroine_01')==='R'));
  delete G.flags.dating_classmate_peishan; STAGE.zhe=6; check('D4. 不是戀愛對象：最高 R',MSG.tier(G,'zhe')==='R');
  fresh(STORY.dayOfKey('2026-07-15'),15); INV.addContact(G,'heroine_01'); STAGE.heroine_01=3; check('D5. 放假：先用情況版「在台中。」',MSG.pick(G,'heroine_01','chat').msgs[0]==='在台中。');
  fresh(day,15); STAGE.heroine_05=2; INV.addContact(G,'heroine_05'); check('D6. 學姊事務版只用事務版的句子',MSG.pick(G,'heroine_05','chat').msgs[0]==='收到。'); }
// E 熟悉度
{ const acts=[]; const orig=SOCIAL.activity; SOCIAL.activity=(id,k)=>{ acts.push(id+':'+k); return {}; };
  for(let i=0;i<5;i++){ fresh(day+i,15); G.msgChat=i?keep:undefined; INV.addContact(G,'heroine_01'); STAGE.heroine_01=1; MSG.send(G,'heroine_01','chat'); var keep=G.msgChat; }
  SOCIAL.activity=orig; const wk=new Set([0,1,2,3,4].map(i=>CALENDAR.termOf(day+i).week)).size;
  check('E1. 熟悉度用 SOCIAL.activity msg；同一週第 4 次起不加',wk===1?acts.length===3:acts.length>=3,JSON.stringify({acts,wk}));
  check('E2. SOCIAL 有 msg 這種活動（fam +1）',/msg:\{fam:1\}/.test(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8'))); }
// F 真的回覆池
if(REAL){ global.MSG_POOL=realPool; const P=realPool.people||{}; let src=''; try{ src=cp.execSync('git show '+realPool.source.AA_202+':"docs/story_planning/AA_202_玩家主動傳訊息_規格.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']})+cp.execSync('git show '+realPool.source.BB_178+':"docs/story_planning/BB_178_玩家主動傳訊息_BB回覆池.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(!src) console.log('（略過 F：沒有企劃原文的歷史）'); else { const miss=[]; for(const id in P) for(const e of P[id].replies||[]) for(const t of e.msgs.concat(...(e.ask?e.ask.opts.map(o=>[o.t].concat(o.r||[])):[]))) if(src.indexOf(t)<0) miss.push(id+':'+t);
    check('F1. 回覆池每一句都在 AA_202／BB_178 原文裡（逐字）',!miss.length,miss.slice(0,8).join(' ｜ ')+(miss.length>8?' …共 '+miss.length:'')); }
  const n=Object.values(P).reduce((a,p)=>a+(p.replies||[]).length,0); check('F2. 十五位都有回覆池',Object.keys(P).length>=15&&n>200,Object.keys(P).length+' 人、'+n+' 則'); }
else console.log('（略過 F：src/data/msg_pool.js 還沒有）');
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
