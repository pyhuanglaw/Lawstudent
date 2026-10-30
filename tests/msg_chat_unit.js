// 玩家主動傳訊息（SYS-PHONE-CHAT／MSG-L1；AA_202 第 1～4 節、BB_178 第 0 節）：
//   A 開放：沒有聯絡方式不開；可昕只有交往中；子晴有聯絡方式就開（PHONE-UNIFY-1030；原本要 Q6 ev_ziqing_secret_game）；芷若在英國不開；學姊加了好友（或認識）就開、不到朋友是事務版（MSG-SIS-EARLY-1027）；沛珊重考消失期只顯示已送達、不回。
//   B 話題：在幹嘛、分享一直有；問課只給同一門課的（語彤沒有；芷若只有大一）；晚安 21:30 以後、好朋友以上或 L 層，祐廷和別人交往中而且她知道就不開。
//   C 一天一次；回覆照作息排時間（有空幾分鐘、上課等下課、以安 22:30 以後隔天早上「昨天睡了。早。」；傳晚安只回那一句）；回問選項接在最後一則。
//   D 層：A／R／L；L 只給戀愛對象（交往中，或第 5 階以上而且兩人都單身）；同一層輪流用；情況版（放假、深夜）先用；標籤不對不用。
//   E 熟悉度：SOCIAL.activity 'msg'（一天最多 +1）；一週第 4 次起不加。
//   F 真的回覆池（src/data/msg_pool.js）在的話：每一句都在 AA_202 第 6 節或 BB_178 的原文裡（逐字）。
//   H 第二批話題（MSG-2，src/data/msg2_pool.js）：生日當天才有「生日快樂」；1/1、除夕到初三才有「新年快樂」；「還好嗎」在那件事以後 3 天內、「謝謝」7 天內一次；
//     條件對不到遊戲裡的事件就不開；分年份的生日列；學姊事務版用 A；沛珊消失期已送達不回；方奕廷過年初三 15:00 才回；旁白不算她的訊息；每一句逐字在 AA_202／AA_257 原文裡。
// 修改前：沒有 MSG（第 A 項就失敗）。用法：node tests/msg_chat_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|ROM|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|HOME)$/.test(n)?'global.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
const REAL=fs.existsSync(path.join(ROOT,'src/data/msg_pool.js'));
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/home3d.js','src/romance3d.js'].concat(REAL?['src/data/msg_pool.js']:[]).concat(fs.existsSync(path.join(ROOT,'src/data/msg2_pool.js'))?['src/data/msg2_pool.js']:[]).concat(['src/data/msg_kx_y0.js']).concat(['src/msg3d.js'])) load(f);
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
  INV.addContact(G,'heroine_04'); STAGE.heroine_04=2; check('A5. 子晴：有聯絡方式、Q6 以前也開（PHONE-UNIFY-1030，使用者 10-30「很多女生腳色都不能在訊息頁面傳訊息……請統一」；原本 Q6 以前沒有她的私訊）',MSG.open(G,'heroine_04').ok); G.events.done.ev_ziqing_secret_game=1; check('A5. Q6 以後照舊開',MSG.open(G,'heroine_04').ok);
  STAGE.heroine_05=0; check('A6. 學姊：還沒見過、還沒加好友不開',!MSG.open(G,'heroine_05').ok); G.flags.SIS_CONTACTED=true; check('A6. 加了好友（SIS_CONTACTED）、還沒見過：事務版（MSG-SIS-EARLY-1027，AA_485 第 4 節：不用等第 2 階）',MSG.open(G,'heroine_05').mode==='business'); delete G.flags.SIS_CONTACTED;
  STAGE.heroine_05=1; check('A6. 認識（第 1 階）：事務版（原本「不到有點熟不開」，AA_485 第 4 節改成不用等第 2 階）',MSG.open(G,'heroine_05').mode==='business'); STAGE.heroine_05=2; check('A6. 有點熟：事務版',MSG.open(G,'heroine_05').mode==='business'); STAGE.heroine_05=3; check('A6. 朋友、兩人都單身：閒聊版',!MSG.open(G,'heroine_05').mode);
  G.flags.dating_kexin=true; ROM.learn(G,'heroine_05','kexin','test'); check('A6. 祐廷交往中而且她知道：事務版',MSG.open(G,'heroine_05').mode==='business'); G.flags.dating_kexin=false;
  INV.addContact(G,'classmate_peishan'); STAGE.classmate_peishan=2; const sd=STORY.dayOfKey('2027-01-10'); fresh(sd,15); INV.addContact(G,'classmate_peishan'); check('A7. 沛珊重考消失期（2026-12-17～2027-08-06）：照開、只顯示已送達',MSG.open(G,'classmate_peishan').mode==='silent');
  const r=MSG.send(G,'classmate_peishan','chat'); check('A7. 傳了：已送達，她不回（沒有排回覆）',r.ok&&r.silent&&!pend().length&&th('classmate_peishan').length===1,JSON.stringify(th('classmate_peishan')));
  const uk=STORY.dayOfKey('2027-10-20'); fresh(uk,15); INV.addContact(G,'heroine_02'); STAGE.heroine_02=3; const pr=STORY.presence('heroine_02',G);
  /* AA_276 第 2 節、BB_178 1-E（VAC-ZR-UK-1017）：芷若在英國照交情——朋友以上開（mode uk）、認識／有點熟不開（原本一律只寄明信片）*/
  { const o3=MSG.open(G,'heroine_02'); STAGE.heroine_02=2; const o2=MSG.open(G,'heroine_02'); STAGE.heroine_02=3;
    check('A8. 芷若在英國（大三上交換）：朋友＝開（照交情，mode uk）；有點熟＝不開（只寄明信片）',pr.here===false&&o3.ok&&o3.mode==='uk'&&o3.uk==='friend'&&!o2.ok&&o2.why==='她在英國，只寄明信片',JSON.stringify({pr,o3,o2})); } }
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
  fresh(STORY.dayOfKey('2026-07-30'),15); INV.addContact(G,'heroine_01'); STAGE.heroine_01=3; check('D5. 放假、她在台中（7/25～8/7）：先用情況版「在台中。」',MSG.pick(G,'heroine_01','chat').msgs[0]==='在台中。');
  fresh(STORY.dayOfKey('2026-07-15'),15); INV.addContact(G,'heroine_01'); STAGE.heroine_01=3; check('D5. 放假、她還在臺北（7/15）：不用「在台中。」，用一般版（AA_369 H5 ③）',MSG.pick(G,'heroine_01','chat').msgs[0]!=='在台中。',MSG.pick(G,'heroine_01','chat').msgs[0]);
  fresh(day,15); STAGE.heroine_05=2; INV.addContact(G,'heroine_05'); check('D6. 學姊事務版只用事務版的句子',MSG.pick(G,'heroine_05','chat').msgs[0]==='收到。'); }
// E 熟悉度
{ const acts=[]; const orig=SOCIAL.activity; SOCIAL.activity=(id,k)=>{ acts.push(id+':'+k); return {}; };
  for(let i=0;i<5;i++){ fresh(day+i,15); G.msgChat=i?keep:undefined; INV.addContact(G,'heroine_01'); STAGE.heroine_01=1; MSG.send(G,'heroine_01','chat'); var keep=G.msgChat; }
  SOCIAL.activity=orig; const wk=new Set([0,1,2,3,4].map(i=>CALENDAR.termOf(day+i).week)).size;
  check('E1. 熟悉度用 SOCIAL.activity msg；同一週第 4 次起不加',wk===1?acts.length===3:acts.length>=3,JSON.stringify({acts,wk}));
  check('E2. SOCIAL 有 msg 這種活動（fam +1）',/msg:\{fam:1\}/.test(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8'))); }
// F 真的回覆池
if(REAL){ global.MSG_POOL=realPool; const P=realPool.people||{}; let src=''; try{ src=cp.execSync('git show '+realPool.source.AA_202+':"docs/story_planning/AA_202_玩家主動傳訊息_規格.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']})+cp.execSync('git show '+realPool.source.BB_178+':"docs/story_planning/BB_178_玩家主動傳訊息_BB回覆池.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']}); }catch(e){}
  if(src&&realPool.source.AA_370){ try{ src+=cp.execSync('git show '+realPool.source.AA_370+':"docs/story_planning/AA_370_美國交換_時差與人在哪_修正稿.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']}); }catch(e){} }   /* AA_370 第 6 節第 3 題：學姊事務版「在圖書館。有事嗎？」（祐廷也在布魯明頓）*/
  if(src&&realPool.source.AA_393){ try{ src+=cp.execSync('git show '+realPool.source.AA_393+':"docs/story_planning/AA_393_學姊第七批_日本路線.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']}); }catch(e){} }   /* AA_393 第 4 節：學姊「祐廷在日本」 */
  if(src&&realPool.source.AA_538){ try{ src+=cp.execSync('git -c core.quotepath=false show '+realPool.source.AA_538+':"docs/story_planning/AA_538_實作問答定稿句_佳蓉B館版_SK02系辦三句.md"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']}); }catch(e){} }   /* AA_538 4-2：子晴分享 A 層各補兩則（PHONE-UNIFY-1030）*/
  src=src.replace(/《東京物語》/g,'《進城的那一週》').replace(/《晚春》/g,'《父親的午後》');   /* AA_313 6-2：真實片名改虛構的（AA 定，原文之後照這張表讀）*/
  src=src.replace(/今天的課講小津。我有舉手。/g,'今天的課講一個日本的老導演。他的鏡頭幾乎都不動。');
  src=src.replace(/在改論文的第二章。/g,'在改論文的第四章。');   /* AA_509 0-2 第 1 點（企劃線 691a26400）：學姊大四上回覆池第二章改第四章（產生器 tools/msg/build_pool.py 的 FIX）*/
  src=src.replace(/在追劇，這集好扯。/g,'在讀書。等我一章。').replace(/一家多一顆滷蛋 哈哈/g,'一家多送一碗湯 哈哈');   /* AA_497 第 8 節第 3、4 點（企劃線 60fc3b9a3；2026-10-28 加）：芯慈追劇減量、明軒的滷蛋（同產生器的 FIX）*/   /* AA_350 R6（企劃線 cae5cc76）：真實的導演名字不寫，1-E 第 5 則換這一句 */
  if(!src) console.log('（略過 F：沒有企劃原文的歷史）'); else { const miss=[]; for(const id in P) for(const e of P[id].replies||[]) for(const t of e.msgs.concat(...(e.ask?e.ask.opts.map(o=>[o.t].concat(o.r||[])):[]))) if(src.indexOf(t)<0) miss.push(id+':'+t);
    check('F1. 回覆池每一句都在 AA_202／BB_178 原文裡（逐字）',!miss.length,miss.slice(0,8).join(' ｜ ')+(miss.length>8?' …共 '+miss.length:'')); }
  const n=Object.values(P).reduce((a,p)=>a+(p.replies||[]).length,0); check('F2. 十五位都有回覆池',Object.keys(P).length>=15&&n>200,Object.keys(P).length+' 人、'+n+' 則'); }
else console.log('（略過 F：src/data/msg_pool.js 還沒有）');
// G 真的回覆池的規則（BB_178 各人那一節）
if(REAL){ global.MSG_POOL=realPool; const P=realPool.people;
  const mk=(id,stage,d,h,flags)=>{ fresh(d,h,flags); INV.addContact(G,id); STAGE[id]=stage; return G; };
  { mk('heroine_05',2,day,10); const a=MSG.replyAt(G,'heroine_05'); G.hour=13; const b=MSG.replyAt(G,'heroine_05'); G.hour=23; const c=MSG.replyAt(G,'heroine_05');
    check('G1. 學姊很準時：10:00 傳→12:10 回、13:00→17:05、23:00→隔天 12:10（先「抱歉，昨天十點半就睡了。」）',Math.abs(a.h-(12+10/60))<1e-6&&Math.abs(b.h-(17+5/60))<1e-6&&c.day===day+1&&c.late&&MSG.timing('heroine_05').wakeLine[0]==='抱歉，昨天十點半就睡了。',JSON.stringify([a,b,c]));
    G.hour=10; const e=MSG.pick(G,'heroine_05','chat'); const vv=x=>x.version||x.variant;
    check('G2. 學姊有點熟＝事務版的句子（事務版或兩版都用）',!!e&&/事務版|都/.test(vv(e)||''),JSON.stringify(e));
    STAGE.heroine_05=3; const e2=MSG.pick(G,'heroine_05','chat'); check('G2. 朋友、兩人都單身＝閒聊版',!!e2&&/閒聊版|都/.test(vv(e2)||''),JSON.stringify(e2)); }
  { const zq=P.heroine_04.replies.find(e=>e.immediateOnly); mk('heroine_04',6,day,22.5,{dating_heroine_04:true}); G.events.done.ev_ziqing_secret_game=1;   /* 22:30（23:00 起是深夜，情況版優先）*/
    let hit=false; for(let i=0;i<8;i++){ const e=MSG.pick(G,'heroine_04','chat',null,{immediate:false}); if(e===zq) hit=true; }
    let hit2=false; for(let i=0;i<8;i++){ const e=MSG.pick(G,'heroine_04','chat',null,{immediate:true}); if(e===zq) hit2=true; }
    check('G3. 子晴「你就傳了」只在立即回覆',!!zq&&!hit&&hit2); }
  { mk('zhe',3,day,15); const ge=P.zhe.replies.filter(e=>e.geFlag); let bad=0; for(let i=0;i<10;i++){ const e=MSG.pick(G,'zhe','chat'); if(e&&e.geFlag) bad++; }
    G.flags.ZHE_CALLS_GE=true; let ok=0; for(let i=0;i<10;i++){ const e=MSG.pick(G,'zhe','chat'); if(e&&e.geFlag) ok++; }
    check('G4. 阿哲有「哥」的句子：沒有 ZHE_CALLS_GE 不用、有了才用',ge.length>0&&bad===0&&(ok>0||!ge.some(e=>e.topic==='chat')),JSON.stringify({bad,ok})); }
  /* BB_178 1-E（bb6baddf：原本停用的「大四在倫敦」三則搬到 1-E 朋友那一組，取消停用）：她在英國只用「在英國」那一組，不用 Café 的句子 */
  { const uk=STORY.dayOfKey('2028-10-20'); mk('heroine_02',3,uk,15); let other=0, n=0; for(let i=0;i<10;i++){ const e=MSG.pick(G,'heroine_02','chat'); if(e){ n++; if(e.variant!=='在英國') other++; } }
    check('G5. 芷若大四在英國（朋友）：按鈕開、回的都是「在英國」那一組（不用 Café 的句子）；原本停用的倫敦句子沒有了',MSG.open(G,'heroine_02').ok&&n===10&&other===0&&!P.heroine_02.replies.some(e=>e.disabled||e.variant==='大四在倫敦'),JSON.stringify({n,other})); }
  { const tue=STORY.termDay('Y1S1',5,2); mk('classmate_mingxuan',3,tue,19.5); const r=MSG.send(G,'classmate_mingxuan','chat'); const q=PHONE.rec(G).q[0];
    check('G6. 明軒週二 19:30（家教）：21:05 一次回，先「剛家教完 你說什麼」再接一般句',r.ok&&Math.abs(q.h-(21+5/60))<1e-6&&q.items[0].text==='剛家教完 你說什麼'&&q.items.length>=2,JSON.stringify(q)); }
  { mk('heroine_04',3,day,10); G.events.done.ev_ziqing_secret_game=1; MSG.send(G,'heroine_04','chat'); const q=PHONE.rec(G).q[0];
    check('G6b. 子晴早上傳：下午兩點多回，開頭「早／剛看到」或「剛起床」（上午傳的），再接一般句、不接「你就傳了」',q.h>=14&&q.h<14.4&&['早','剛起床'].includes(q.items[0].text)&&q.items.length>=3&&!q.items.some(x=>x.text==='你就傳了'),JSON.stringify(q.items)); }
  { mk('kai',3,day,10); const at=MSG.replyAt(G,'kai'); check('G7. 阿凱一點以前傳的：一點多回，先「剛醒」',at.late&&at.h>=13&&at.h<13.4&&MSG.timing('kai').wakeLine[0]==='剛醒',JSON.stringify(at)); }
  { mk('heroine_03',3,STORY.termDay('Y1S1',5,2),18); const at=MSG.replyAt(G,'heroine_03'); check('G8. 語彤週二麵店時間：20:30 以後才回',Math.abs(at.h-20.5)<1e-6,JSON.stringify(at)); }
  /* 全部的人、話題、層、時間掃一遍：不出錯、不挑到停用的；平日下午學期中每個人的「在幹嘛」都挑得到 */
  { const errs=[], none=[]; const ids=Object.keys(P).filter(id=>id!=='kevin'); const days=[day,STORY.termDay('Y2S1',8,6),STORY.dayOfKey('2026-07-15'),STORY.dayOfKey('2027-01-20'),STORY.termDay('Y3S2',16,3),STORY.termDay('Y4S1',3,1)];
    for(const id of ids) for(const d of days) for(const h of [9,15,20,23.5,1]) for(const st of [1,3,4,6]){ try{ fresh(d,h,id==='kexin'?{dating_kexin:true}:{}); INV.addContact(G,id); STAGE[id]=st; G.events.done.ev_ziqing_secret_game=1;
        for(const tp of ['chat','course','share','night']){ const e=MSG.pick(G,id,tp,tp==='share'?'cat':null); if(e&&e.disabled) errs.push(id+':停用'); }
        if(d===day&&h===15&&st===3&&MSG.open(G,id).ok&&!MSG.pick(G,id,'chat')) none.push(id); }catch(x){ errs.push(id+':'+x.message); } }
    check('G9. 15 人 × 6 天 × 5 個時間 × 4 個關係掃過：不出錯、不挑到停用的',!errs.length,errs.slice(0,5).join(' '));
    check('G9. 大一上平日 15:00、朋友：每個開得了的人「在幹嘛」都挑得到句子',!none.length,none.join(' ')); } }
// H 第二批話題（MSG-2：謝謝、生日快樂、還好嗎、新年快樂；AA_202 第 7 節、AA_257、BB_178 第 10 節）
if(typeof MSG2_POOL!=='undefined'){ global.MSG_POOL=REAL?realPool:FAKE; const P2=MSG2_POOL.people;
  const mk=(id,stage,d,h,flags)=>{ fresh(d,h,flags); INV.addContact(G,id); STAGE[id]=stage; return G; };
  const tk=id=>MSG.topics(G,id).map(q=>q.k); const K=k=>STORY.dayOfKey(k);
  const reply=()=>{ const q=PHONE.rec(G).q; return q.length?q[q.length-1].items.map(x=>x.text):[]; };
  { let src=''; try{ for(const [f,k] of [['AA_202_玩家主動傳訊息_規格.md','AA_202'],['AA_257_MSG2_BB九位回覆池.md','AA_257'],['AA_389_回AA313剩下九點.md','AA_389']]) src+=cp.execSync('git show '+MSG2_POOL.source[k]+':"docs/story_planning/'+f+'"',{cwd:ROOT,encoding:'utf8',maxBuffer:32<<20,stdio:['ignore','pipe','ignore']}); }catch(x){ src=''; }
    const SUBST={'heroine_02:十點，店門口。':'九點，店門口。'};   /* AA 裁定的改字（原文找改字前的那句）：AA_373 第 6 節第 9 題（企劃線 bdab2f42）「九點」改「十點」——芷若生日 L 回問，只在 2025、2026 開 */
    if(!src) console.log('（略過 H1：沒有企劃原文的歷史）'); else { const miss=[]; let n=0; for(const id in P2) for(const e of P2[id].replies) for(const t of (e.msgs||[]).concat(...(e.ask?e.ask.opts.map(o=>[o.t].concat(o.r||[])):[])).concat(e.ask?[e.ask.q]:[])){ n++; const t0=SUBST[id+':'+t]||t; if(src.indexOf(t0.replace(/\*\*/g,''))<0) miss.push(id+':'+t); }
      check('H1. MSG-2 每一句（含回問）都在 AA_202 第 7 節／AA_257／AA_389 原文裡（逐字；AA 裁定的改字照 SUBST 找原句）',!miss.length&&n>150,miss.slice(0,6).join(' ｜ ')+' 共 '+n+' 句'); } }
  { mk('heroine_01',1,K('2025-09-14'),15); const a=tk('heroine_01').includes('bday'); G.day=K('2025-09-15'); G.weekday=wdOf(G.day); const b=tk('heroine_01').includes('bday');
    check('H2. 以安 9/15：當天才有「生日快樂」',!a&&b); const r=MSG.send(G,'heroine_01','bday'); check('H2. 傳了：回「謝謝。」（A）',r.ok&&r.text==='生日快樂'&&reply()[0]==='謝謝。',JSON.stringify(reply())); }
  { const ny=k=>{ mk('heroine_01',3,K(k),15); return tk('heroine_01').includes('newyear'); };
    check('H3. 新年快樂：1/1、除夕（2026-02-16）、初三（02-19）有；除夕前一日（02-15）、初四（02-20）、1/2 沒有',ny('2026-01-01')&&ny('2026-02-16')&&ny('2026-02-19')&&!ny('2026-02-15')&&!ny('2026-02-20')&&!ny('2026-01-02')); }
  { const d0=STORY.termDay('Y1S2',12,4); const okAt=dd=>{ mk('heroine_01',3,dd,15); G.events.done.ev_an_yu_argument=1; G.events.last.ev_an_yu_argument=d0; return tk('heroine_01').includes('ok'); };
    check('H4. 以安「還好嗎」：和 Alison 吵架那天起 3 天內有，第 4 天以後、還沒吵架的沒有',okAt(d0)&&okAt(d0+3)&&!okAt(d0+4)&&(mk('heroine_01',3,d0,15),!tk('heroine_01').includes('ok')));
    okAt(d0+1); MSG.send(G,'heroine_01','ok'); check('H4. 回 R「還好。……想一下就好了。」',reply().join('/')==='還好。……想一下就好了。',JSON.stringify(reply())); }
  { mk('zhe',3,K('2025-11-03'),15); check('H5. 阿哲「還好嗎」（系籃輸球那天）：遊戲裡還沒有那一場，不開',!tk('zhe').includes('ok')&&!MSG.conds2(G,'zhe','ok').length); }
  { const d=STORY.termDay('Y1S1',5,3); mk('heroine_01',3,d,15); const R=MSG.rec(G); const a=tk('heroine_01').includes('thanks');
    global.MSG_POOL=FAKE; MSG.send(G,'heroine_01','course'); global.MSG_POOL=REAL?realPool:FAKE; const h=R.help.heroine_01;
    G.day=d+1; G.weekday=wdOf(G.day); const b=tk('heroine_01').includes('thanks'); MSG.send(G,'heroine_01','thanks'); const rp=reply().join('/');
    G.day=d+2; G.weekday=wdOf(G.day); const c=tk('heroine_01').includes('thanks');
    check('H6. 以安問課回了筆記照片（通則）：之後才有「謝謝」，傳過一次就不再有',!a&&!!h&&h.k==='notes'&&b&&!c,JSON.stringify({a,h,b,c}));
    check('H6. 「謝謝」回 R「不會。下次換你。」',rp==='不會。下次換你。',rp);
    G.day=d+9; G.weekday=wdOf(G.day); R.thx={}; check('H6. 超過 7 天：沒有',!tk('heroine_01').includes('thanks')); }
  { const d=STORY.termDay('Y1S1',4,5); const z=fl=>{ mk('heroine_02',3,d+1,15,fl); G.events.done.ev_zhiruo_ge_group=1; G.events.last.ev_zhiruo_ge_group=d; return tk('heroine_02').includes('thanks'); };
    check('H7. 芷若 Z2 經原小組：選了加入（ge_group_zhiruo）才有「謝謝」，「我已經有組了」沒有',z({ge_group_zhiruo:true})&&!z({})); }
  { const s=(k,st,fl)=>{ mk('heroine_05',st,K(k),10,fl); return tk('heroine_05').includes('bday'); };
    check('H8. 學姊 6/2：2026 有；2028（照 BB_98 2-11，句子還沒進回覆池）先不開',s('2026-06-02',3)&&!s('2028-06-02',3));
    s('2026-06-02',2); MSG.send(G,'heroine_05','bday'); check('H8. 有點熟（事務版）：回 A「謝謝。」',reply().slice(-1)[0]==='謝謝。',JSON.stringify(reply()));
    s('2027-06-02',3); MSG.send(G,'heroine_05','bday'); check('H8. 朋友、兩人都單身：回 R「謝謝。今天的計畫本，我沒有排事情。」',reply().slice(-1)[0]==='謝謝。今天的計畫本，我沒有排事情。',JSON.stringify(reply())); }
  { const zq=k=>{ mk('heroine_04',3,K(k),15); G.events.done.ev_ziqing_secret_game=1; MSG.send(G,'heroine_04','bday'); return reply().join('/'); };
    const a=zq('2027-02-10'), b=zq('2029-02-10'); check('H9. 子晴生日 R：2027「我今天收到一個 bug 當禮物」、2029 換「同事買了一個很大的蛋糕」',/bug/.test(a)&&/同事買了一個很大的蛋糕/.test(b),a+' ｜ '+b); }
  { mk('classmate_peishan',3,K('2027-03-15'),15); const t=tk('classmate_peishan'); const r=MSG.send(G,'classmate_peishan','bday');
    check('H10. 沛珊 2027-03-15（重考消失期）：「生日快樂」照開、已送達、不回，記下傳過',t.includes('bday')&&r.ok&&r.silent&&!PHONE.rec(G).q.length&&MSG.rec(G).bday['classmate_peishan:2027']===G.day,JSON.stringify(t)); }
  { mk('heroine_04',6,STORY.termDay('Y2S1',3,1),20,{dating_heroine_04:true}); G.events.done.ev_ziqing_secret_game=1; G.events.done.ev_ziqing_lab_letter=1; G.events.last.ev_ziqing_lab_letter=G.day;
    MSG.send(G,'heroine_04','ok'); const q=PHONE.rec(G).q.slice(-1)[0]; const last=q&&q.items[q.items.length-1]; const op=last&&last.ask&&last.ask.opts;
    check('H11. 子晴 L「還好嗎」（Q7）：最後一則帶回問「好 打給我」「現在不行 晚一點」',!!op&&op.map(o=>o.t).join('/')==='好 打給我/現在不行 晚一點',JSON.stringify(op&&op.map(o=>o.t)));
    check('H11. 回問裡的旁白不算她的訊息（from 空的）',!!op&&op[0].say[0].from===null&&/^（旁白：/.test(op[0].say[0].text)&&op[1].say[0].from==='heroine_04'); }
  { mk('npc_fangyt',3,K('2026-02-17'),10); MSG.send(G,'npc_fangyt','newyear'); const q=PHONE.rec(G).q.slice(-1)[0];
    check('H12. 方奕廷過年（初一 10:00 傳）：R「初一在山上」那則初三 15:00 以後才回',!!q&&q.day===K('2026-02-19')&&q.h>=15&&/大雪山/.test(q.items.map(x=>x.text).join('/')),JSON.stringify(q&&{day:q.day,h:q.h,t:q.items.map(x=>x.text)}));
    mk('npc_fangyt',3,K('2026-01-01'),10); MSG.send(G,'npc_fangyt','newyear'); check('H12. 1/1 傳：回「新年快樂。剛下山。」（不延後）',reply().join('/')==='新年快樂。剛下山。'&&PHONE.rec(G).q.slice(-1)[0].day===G.day,JSON.stringify(reply())); }
  { mk('zhe',3,K('2025-11-02'),15); MSG.send(G,'zhe','bday'); const a=reply().join('/'); mk('zhe',3,K('2025-11-02'),15,{ZHE_CALLS_GE:true}); MSG.send(G,'zhe','bday'); const b=reply().join('/');
    check('H13. 阿哲生日：沒有 ZHE_CALLS_GE 用 A「謝啦！！」，有了才用「哥記得！！」',a==='謝啦！！'&&/哥記得/.test(b),a+' ｜ '+b); }
  { mk('heroine_02',3,K('2026-01-01'),15); MSG.send(G,'heroine_02','newyear'); const a=reply().join('/'); mk('heroine_02',3,K('2026-02-17'),15); MSG.send(G,'heroine_02','newyear'); const b=reply().join('/');
    check('H14. 芷若新年 R：1/1（大一）「店裡今天公休」、過年「台中家裡陽台的盆栽」',a==='新年快樂。店裡今天公休。'&&/盆栽/.test(b),a+' ｜ '+b); }
  { const errs=[]; const ids=Object.keys(P2).filter(id=>id!=='kevin'); const days=['2025-09-15','2026-01-01','2026-02-17','2026-06-02','2027-02-10','2027-03-15','2028-04-24','2028-06-02','2029-01-01'].map(K);
    for(const id of ids) for(const d of days) for(const st of [1,3,6]){ try{ fresh(d,15,id==='kexin'?{dating_kexin:true}:{}); INV.addContact(G,id); STAGE[id]=st; G.events.done.ev_ziqing_secret_game=1;
      for(const tp of ['thanks','bday','ok','newyear']){ const e=MSG.pick2(G,id,tp,true); if(e&&(!e.e.msgs.length||e.e.disabled)) errs.push(id+':'+tp); }
      for(const q of MSG.topics(G,id)) if(MSG.isT2(q.k)){ const r=MSG.send(G,id,q.k); if(!r.ok) errs.push(id+':'+q.k+':'+r.why); break; } }catch(x){ errs.push(id+':'+x.message); } }
    check('H15. 14 人 × 9 個日子 × 3 個關係掃過第二批話題：不出錯、不挑到空的或停用的句子、開了就傳得出去',!errs.length,errs.slice(0,5).join(' ')); }
  /* AA_389 第 5 點：可昕「生日快樂」L 層的回問「你晚上要上山來，還是我下山」後面要有生日事件——2026、2027（ev_kexin_birthday_y1s2／_y2）、2028 臺灣美國路線（ev_kexin_birthday_y3 的「其他玩家」接這個回問，r2y3b3d.js kxBdayButton）照問；
     2028 日本路線用 y2028_japan；2029 沒有生日事件：不問，回 AA_389 那一句 */
  { const kx=(d,f)=>{ fresh(K(d),15,Object.assign({dating_kexin:true},f||{})); INV.addContact(G,'kexin'); STAGE.kexin=6; const p=MSG.pick2(G,'kexin','bday',true); return p?p.e:null; };
    const a=kx('2026-04-24'), b=kx('2027-04-24'), c=kx('2028-04-24',{EXCHANGE_ROUTE:'TW'}), j=kx('2028-04-24',{EXCHANGE_ROUTE:'JP'}), z=kx('2029-04-24',{EXCHANGE_ROUTE:'TW'});
    check('H16. 可昕生日 2026、2027、2028 臺灣路線：L 照問「你晚上要上山來，還是我下山」',[a,b,c].every(e=>e&&!!e.ask&&/上山來/.test(e.ask.q)),[a,b,c].map(e=>e&&e.msgs.join('/')).join(' ｜ '));
    check('H16. 2028 日本路線（人在日本）：不問上山下山，用 y2028_japan',!!j&&!j.ask&&j.cond==='y2028_japan',j&&j.msgs.join('/'));
    check('H16. 2029：沒有生日事件，不問；回「今天在圖書館過 國考的書比蛋糕還厚」',!!z&&!z.ask&&z.msgs.join('/')==='謝謝！！/（長頸鹿貼圖）/今天在圖書館過 國考的書比蛋糕還厚',z&&z.msgs.join('/')); }
  /* AA_202@65239add 第 257 行（AA_313 第 5 節）：Alison 營隊結束那天的「還好嗎」R 層收在「明天見面再說」（不好的事當面講）；產生器 build_msg2.py 原本寫死「可是會好的」 */
  { const t=fs.readFileSync(path.join(ROOT,'src/data/msg2_pool.js'),'utf8'), m=t.match(/"cond": "camp_end", "tier": "R", "msgs": \[([^\]]*)\]/);
    check('H17. Alison 營隊結束那天「還好嗎」R：「還好啦」「……其實沒有很好」「明天見面再說」',!!m&&/明天見面再說/.test(m[1])&&!/可是會好的/.test(m[1]),m&&m[1]); } }
else console.log('（略過 H：src/data/msg2_pool.js 還沒有）');
// 方奕廷暑假上山（BB_171 第 1 節）：沒訊號，下山那天 15:00 才回；回台中過年的期間照平常
{ fresh(STORY.dayOfKey('2026-07-10'),20); const at=MSG.replyAt(G,'npc_fangyt'), back=STORY.dayOfKey('2026-07-20');
  check('I1. 方奕廷 7/10 上山：7/20（下山那天）15:00 才回',at.day===back&&at.h===15&&at.late===true,JSON.stringify(at));
  fresh(STORY.dayOfKey('2026-07-25'),20); const a2=MSG.replyAt(G,'npc_fangyt'); check('I1. 下山以後照平常',!(a2.day===back&&a2.h===15)&&a2.day<=G.day+1,JSON.stringify(a2)); }
{ const K=k=>STORY.dayOfKey(k); const eg=(key,h,f)=>{ fresh(K(key),h,Object.assign({dating_kexin:true},f||{})); G.stage='econ'; G.contacts={kexin:0}; return G; };
  eg('2024-11-20',20); const o1=MSG.open(G,'kexin'), t1=MSG.topics(G,'kexin').map(q=>q.k), p1=MSG.pick(G,'kexin','chat');
  check('Y0. 經濟系那一年交往以後（11/20）：可以傳給可昕（AA_301）；話題在幹嘛、分享；回覆是「經濟系學期中」那一版',o1.ok&&o1.mode==='y0'&&t1.includes('chat')&&t1.includes('share')&&!t1.includes('course')&&p1&&p1.variant==='經濟系學期中',JSON.stringify([o1,t1,p1&&p1.msgs]));
  eg('2024-12-17',20); const p2=MSG.pick(G,'kexin','chat'), p2n=MSG.pick(G,'kexin','share','notes'); check('Y0. AA_368 H5＋AA_371 第 2 題：期末是 12/14～12/20（16 週制 12/20 考完；原本 1/6～1/13）——12/17 在幹嘛用期末那一版；學期中延到 12/20（和期末重疊、期末優先），期末沒有的話題（講義）照學期中（AA_301 第 1 節；AA_368 原本學期中到 12/13，期末那週只剩兩則在幹嘛）',p2&&p2.variant==='經濟系期末'&&!!p2n&&p2n.variant==='經濟系學期中',JSON.stringify([p2&&p2.variant,p2n&&p2n.variant]));
  eg('2024-12-13',20); check('Y0. AA_368 H5：12/13 還是學期中',MSG.pick(G,'kexin','chat').variant==='經濟系學期中');
  { const seen=new Set(), bad=[]; for(const [k,h] of [['2024-12-21',14],['2024-12-25',23],['2025-01-03',15],['2025-01-08',20],['2025-01-13',22.5]]){ eg(k,h); for(const tp of ['chat','share','night']) for(let i=0;i<6;i++){ const p=tp==='share'?MSG.pick(G,'kexin','share','food'):MSG.pick(G,'kexin',tp); if(!p) continue; if(p.variant!=='寒假在臺北') bad.push(k+' '+tp+' '+p.variant); for(const t of p.msgs){ seen.add(t); if(/剛下課|明天八點的課|期末考|國文|休學/.test(t)) bad.push(k+'：'+t); } } }
    check('Y0. AA_368 H5：寒假在臺北（12/21～1/13，她過年前才回高雄）用新分期「寒假在臺北」——不會回「剛下課」「明天八點的課」「期末考」，也不提國文、休學',!bad.length&&seen.has('在宿舍。品妤回家了，整間都是我的。')&&seen.has('晚安。明天不用早起。……好爽。')&&seen.has('公館那家麵店放假也開。阿姨認得我了。'),bad.slice(0,4).join(' | ')); }
  { const R=(MSG_KX_Y0.replies||[]).filter(e=>e.variant==='寒假在臺北'), V=MSG_KX_Y0.variants.find(v=>v.variant==='寒假在臺北');
    check('Y0. AA_368 第 4 節：「寒假在臺北」12/21～1/13 五則（在幹嘛三則、分享吃的一則、晚安一則），句子照 AA_368（第三則照 AA_371 第 3 題改字、不限時段）',!!V&&V.from==='2024-12-21'&&V.to==='2025-01-13'&&R.length===5&&JSON.stringify(R.map(e=>[e.topic,e.msgs]))===JSON.stringify([['chat',['在宿舍。品妤回家了，整間都是我的。']],['chat',['在總圖。放假了還是很多人。……我不是在讀書，我只是不想待在宿舍。']],['chat',['剛起床。……不要問我現在幾點。']],['share_food',['公館那家麵店放假也開。阿姨認得我了。']],['night',['晚安。明天不用早起。……好爽。']]]),JSON.stringify(R.map(e=>e.msgs))); }
  { const A=(MSG_KX_Y0.replies||[]).find(e=>e.variant==='經濟系學期中'&&e.affection);
    check('Y0. AA_368 M5：學期中帶感情的那一句「今天你沒來。旁邊的位子品妤坐了。」「……她上課一直講話。」（日期卡寫 10/18～11/20 他照樣陪她上課；tags、affection 不改）',!!A&&JSON.stringify(A.msgs)===JSON.stringify(['今天你沒來。旁邊的位子品妤坐了。','……她上課一直講話。'])&&JSON.stringify(A.tags)===JSON.stringify(['帶感情的那一句'])&&!(MSG_KX_Y0.replies||[]).some(e=>e.msgs.some(t=>/旁邊的位子空著|習慣放包包/.test(t))),JSON.stringify(A&&A.msgs)); }
  eg('2025-01-14',20); check('Y0. 寒假在高雄 1/14 起（不變）',MSG.pick(G,'kexin','chat').variant==='寒假在高雄');
  check('Y0. AA_368 L8：「高雄冬天還可以穿短袖。」（分期到 2/13；原本「一月」）',(MSG_KX_Y0.replies||[]).some(e=>e.variant==='寒假在高雄'&&e.msgs[0]==='高雄冬天還可以穿短袖。'&&e.msgs[1]==='你那邊幾度？')&&!(MSG_KX_Y0.replies||[]).some(e=>e.msgs.includes('高雄一月還可以穿短袖。')));
  eg('2025-01-20',20); check('Y0. 寒假在高雄（1/20）：沒有講義那一則就不出',MSG.pick(G,'kexin','share','notes')===null&&MSG.pick(G,'kexin','chat').variant==='寒假在高雄');
  eg('2025-03-10',20); const o4=MSG.open(G,'kexin'); check('Y0. 2/14～7/11 住在一起：不開，顯示「她就在家裡。直接去講。」',!o4.ok&&o4.show&&o4.why==='她就在家裡。直接去講。');
  eg('2024-11-20',20,{dating_kexin:false}); check('Y0. 沒交往：不開；其他人經濟系那一年照舊不開',!MSG.open(G,'kexin').ok&&(G.flags.dating_kexin=true,!MSG.open(G,'econ_pinyu').ok));
  eg('2024-11-20',20); { let r=null, err=null; try{ r=MSG.send(G,'kexin','chat'); }catch(e){ err=e.message; } check('Y0. 經濟系那一年真的傳得出去（MSG.send 不出錯、已送達）',!err&&r&&r.ok,err||JSON.stringify(r)); }
  eg('2025-08-20',23); check('Y0. 放榜以後（8/20 23:00）：晚安有',MSG.topics(G,'kexin').some(q=>q.k==='night')&&MSG.pick(G,'kexin','night').variant==='放榜以後'); }
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
