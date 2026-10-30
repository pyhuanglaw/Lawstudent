// 交接包 v1（大一上）第 2 批：手機的對話（群組、置頂、回覆、排定時間）＋第一天（AA_12 0-2、0-3；BB_95 9-0、4-1）＋舊存檔補一次＋芷若的第一則私訊（4-2）＋語彤事件 3（AA_11、BB_95 4-3）＋房間物件——不需要瀏覽器。
// 檢查（修改前都會失敗：沒有 PHONE、沒有可昕、第一天沒有旁白和訊息、語彤事件 3 還在出刑訴題）：
//   A 手機：一對一、群組（置頂）、未讀、看過、排定時間（準時、睡過頭照原時間補、同一則只送一次）、回覆（祐廷那一句＋對方的回覆＋旗標＋記憶，回過不能再回）。
//   B 新遊戲第一天：案例那一句之後是三句旁白（原文、順序），接著可昕的四則訊息（「可昕（手機）」）、三個回覆、她的回答＋「晚安。不要讀到太晚。」；手機裡有整段；
//     交往中（dating_kexin）、有她的聯絡方式；家族群組「法律系直屬家族」：Kevin 的置頂（開學前；2026-10-17 改，原本學姊，AA_218 L512）、Kevin 的問題可以回（學姊「先看置頂。」刪，17-12）。
//   C 家族群組：回「（舉手）」或「活著。」設 FAM_GROUP_REPLIED、Kevin「很好，有一個活的。」；不回就沒有旗標。
//   D 重進宿舍、讀檔：不重播（訊息不會變兩份）。
//   E 舊存檔：讀檔遷移後交往中、有聯絡方式；第三天以後的早上補一次（旁白＋早上版：「早安。今天讀到哪了？」、最後「去上課吧……」）；只補一次；看過的不補；家族群組不補。
//   F 芷若的第一則私訊：交往中＝加帳號隔天 15:10、第三句是友情版；單身＝當天 22:07、第三句照第一次點的東西；時間到才出現；收到後有她的聯絡方式。
//   G 語彤事件 3：三個選項照 AA_11、不出題、最後一句；「我知道誰會知道」→ 學姊 22:30 四句（BB_95 4-3）→ 截圖轉給語彤「……法服是什麼？」（有聯絡方式）／麵店當面（沒有）；
//     裝懂 → BLUFFED；結果（阿姨週三去了法服）在那一週的週三之後才出現。
//   H 房間物件：五個物件的旁白（原文）；宿舍的互動點站得到。
// 用法：node tests/v1_batch2_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{ legalAsked++; },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], legalAsked=0, toasts=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},titleCard:()=>Promise.resolve(),enter:()=>Promise.resolve(),phoneBadge(){},
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}}; SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; legalAsked=0; toasts=[]; GM.npc={}; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||(typeof STORY_EVENTS_V11!=='undefined'&&STORY_EVENTS_V11.find(e=>e.id===id));
const KX=th=>PHONE.thread(G,th);
/* game3d.js 的 defaults／migrate（只拿出來跑，不需要瀏覽器）*/
const g3=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8');
const defaults=new Function('SAVE_VER',g3.slice(g3.indexOf('  function defaults(name){'),g3.indexOf('\n',g3.indexOf('  function defaults(name){')))+'; return defaults;')(3);
const migrate=new Function('defaults','SAVE_VER',g3.slice(g3.indexOf('  function migrate(s){'),g3.indexOf('  function ls(){'))+'; return migrate;')(defaults,3);
(async()=>{
  /* ---------- A 手機 ---------- */
  { fresh(10,10,'campus'); PHONE.join(G,'g1','測試群組'); PHONE.post(G,{th:'g:g1',from:'zhe',text:'第一句'}); PHONE.postAt(G,{th:'g:g1',from:'heroine_05',name:'溫學姊',text:'置頂',pin:true},2,9); G.hour=10.5; PHONE.post(G,{th:'p:kexin',from:'kexin',text:'嗨'});
    const ths=PHONE.threads(G); check('A 兩個對話串，最新的在前面；群組名稱、可昕的手機名字是「可昕」',ths.length===2&&ths[0].th==='p:kexin'&&ths[0].title==='可昕'&&ths[1].title==='測試群組',JSON.stringify(ths.map(t=>[t.th,t.title])));
    check('A 未讀：別人傳的才算、置頂不算（群組 1、可昕 1）',PHONE.unread(G)===2&&ths[1].unread===1,String(PHONE.unread(G)));
    PHONE.markSeen(G,'g:g1'); check('A 看過群組以後只剩可昕的未讀',PHONE.unread(G)===1);
    check('A 置頂照開學前的時間排在前面（postAt 照時間插進去）',PHONE.thread(G,'g:g1')[0].pin===true&&PHONE.thread(G,'g:g1')[0].day===2);
    check('A 舊訊息（沒有 th）照 who 歸到一對一，沒有 who 的是通知',PHONE.th({who:'zhe',text:'x'})==='p:zhe'&&PHONE.th({who:null,text:'x'})==='sys');
    PHONE.at(G,10,12,[{th:'p:kexin',from:'kexin',text:'中午'}],'t1'); check('A 同一個 tag 只排一次',PHONE.at(G,10,12,[{th:'p:kexin',from:'kexin',text:'中午'}],'t1')===false);
    G.hour=11.9; check('A 時間還沒到不送',PHONE.tick(G)===0&&!G.msgs.some(m=>m.text==='中午'));
    G.hour=12.05; check('A 時間到了送出（準時：時間是現在）',PHONE.tick(G)===1&&G.msgs.some(m=>m.text==='中午'&&Math.abs(m.h-12.05)<0.01));
    PHONE.at(G,10,22,[{th:'p:kexin',from:'kexin',text:'晚上'}],'t2'); G.day=11; G.hour=8; PHONE.tick(G); const late=G.msgs.find(m=>m.text==='晚上');
    check('A 睡過頭：醒來照原本的時間補（第 10 天 22:00），不會跑到未來',late&&late.day===10&&Math.abs(late.h-22)<0.02,JSON.stringify(late&&{d:late.day,h:late.h}));
    check('A 送過的 tag 不再排',PHONE.at(G,12,12,[{th:'p:kexin',text:'x'}],'t2')===false);
    const m=PHONE.post(G,{th:'g:g1',from:'zhe',text:'回我',ask:{opts:[{t:'好',set:{QQ:1},mem:[{npc:'zhe',tag:'HELPED',note:'n'}],say:[{from:'zhe',text:'讚'}]},{t:'不要'}]}});
    check('A 可以回的訊息在「待回覆」',PHONE.pending(G).includes(m));
    const r=PHONE.answer(G,m.ask.id,0); const L=PHONE.thread(G,'g:g1').map(q=>q.text);
    check('A 回覆：祐廷那一句、對方的回覆接在後面；旗標、記憶寫進去',r&&L.slice(-2).join('/')==='好/讚'&&PHONE.thread(G,'g:g1').slice(-2)[0].from==='player'&&G.flags.QQ===1&&SOCIAL.has('zhe','HELPED'),JSON.stringify(L.slice(-3)));
    check('A 回過不能再回、不在「待回覆」',PHONE.answer(G,m.ask.id,1)===null&&!PHONE.pending(G).includes(m)); }
  /* ---------- B 新遊戲第一天 ---------- */
  const d0=defaults('祐廷'); check('B 新遊戲預設和可昕交往中（dating_kexin）',d0.flags.dating_kexin===true);
  fresh(1,21.2,'dorm',d0.flags); picks=['講了兩個小時']; await STORY.onEnter('dorm',GM);
  { const L=lines(), i=L.findIndex(t=>/書桌上放著明天民法總則/.test(t));
    const NARR=['以前遇到事情，你會去翻民法。翻得到條文，卻不知道條文和條文怎麼接起來，也不知道怎麼用在一件真的事情上。','這次不一樣。這次有人要教你怎麼讀。','休學到重考的那幾個月，你不是一個人過的。'];
    check('B 案例那一句之後是三句旁白（AA_12 原文、順序）',i>=0&&JSON.stringify(L.slice(i+1,i+4))===JSON.stringify(NARR),JSON.stringify(L.slice(i+1,i+4)));
    const KXL=['今天讀到哪了？','我們老師今天講的案例，好像跟你們的是同一個。','兩個老師講的不一樣。……我好奇你們的怎麼講。','……不用回答。我只是想知道你讀到哪了。'];   /* AA_295 */
    check('B 接著是可昕的四則訊息（對話框名字「可昕（手機）」）',JSON.stringify(L.slice(i+4,i+8))===JSON.stringify(KXL)&&said[i+4].who==='可昕（手機）',JSON.stringify(said.slice(i+4,i+8)));
    const o=opts.find(q=>q.some(t=>/讀到一半/.test(t)))||[];
    check('B 三個回覆（BB_95 9-0 原文）',JSON.stringify(o)===JSON.stringify(['讀到一半。案例比想像的長。','我們老師講了兩個小時。','讀到一半，在想妳。']),JSON.stringify(o));
    check('B 她的回答＋「晚安。不要讀到太晚。」',L[i+8]==='……我們也是。我只記得他的領帶。'&&L[i+9]==='晚安。不要讀到太晚。',JSON.stringify(L.slice(i+8,i+10)));
    const T=KX('p:kexin'); check('B 手機裡有整段（四則＋祐廷的回覆＋她的兩句）、回過了',T.length===7&&T[4].from==='player'&&T[4].text==='我們老師講了兩個小時。'&&T[3].ans===1,JSON.stringify(T.map(q=>q.text)));
    check('B 旗標 KX_FIRST_MSG、交往中、有她的聯絡方式（不會跳「加了聯絡方式」的訊息）',G.flags.KX_FIRST_MSG===true&&G.flags.dating_kexin===true&&INV.hasContact(G,'kexin')&&!G.msgs.some(q=>/加了.*可昕/.test(q.text)));
    check('B 交往中＝關係階段 RELATIONSHIP',SOCIAL.stage('kexin')==='RELATIONSHIP',SOCIAL.stage('kexin'));
    const F=KX('g:family_law'); const pin=F.find(q=>q.pin);
    check('B 家族群組「法律系直屬家族」：Kevin 開學前的置頂（AA_218 L512 原文）',PHONE.inGroup(G,'family_law')&&PHONE.title(G,'g:family_law')==='法律系直屬家族'&&pin&&pin.from==='kevin'&&pin.text==='學弟妹好～我是 Kevin，大二。先講幾件事：開學前先不要買二手書，等學長姐的；民總很重要；有問題就問，先自己查一下也可以。'&&pin.day<1,JSON.stringify(pin));
    let kq=null;
    check('B Kevin「第三週了，家族的學弟妹還活著嗎？要考古題的舉手」（BB_95 e627d747：Kevin 不是直屬）可以回（（舉手）／活著。）；學姊沒有發言（17-12）',(kq=F.find(q=>q.from==='kevin'&&!q.pin))&&kq.text==='第三週了，家族的學弟妹還活著嗎？要考古題的舉手'&&JSON.stringify(kq.ask.opts.map(x=>x.t))===JSON.stringify(['（舉手）','活著。'])&&!F.some(q=>q.from==='heroine_05'));
    check('B 第一天就在手機上看到學姊（不需要見面：沒有因此「認識」她）',!SOCIAL.has('heroine_05','FIRST_MET'));
    check('B 有通知（toast）',toasts.some(t=>/可昕/.test(t))&&toasts.some(t=>/法律系直屬家族/.test(t)),JSON.stringify(toasts));
    /* C 家族群組回覆 */
    const before=G.flags.FAM_GROUP_REPLIED; PHONE.answer(G,kq.ask.id,0);
    check('C 回「（舉手）」：FAM_GROUP_REPLIED、Kevin「很好，有一個活的。」',before===undefined&&G.flags.FAM_GROUP_REPLIED===true&&KX('g:family_law').slice(-1)[0].text==='很好，有一個活的。');
    /* D 重進宿舍、再呼叫：不重播 */
    const n0=G.msgs.length; said=[]; await STORY.onEnter('dorm',GM); const r2=await STORY._v1.kexinFirstMsg(GM,'night');
    check('D 重進宿舍、再呼叫：不重播（訊息數不變、沒有再演）',G.msgs.length===n0&&r2===false&&!lines().some(t=>/今天讀到哪了/.test(t))); }
  { fresh(1,21.2,'dorm',defaults('祐廷').flags); picks=['讀到一半。']; await STORY.onEnter('dorm',GM);
    check('C 不回家族群組：沒有 FAM_GROUP_REPLIED',G.flags.FAM_GROUP_REPLIED===undefined&&PHONE.pending(G).some(q=>q.from==='kevin')); }
  /* ---------- E 舊存檔 ---------- */
  { const old={v:3,name:'祐廷',day:4,weekday:6,hour:22,zone:'dorm',flags:{introDone:true,classDone:true,readCase:'full'},events:{done:{},last:{},count:0},rel:{},social:null};
    const s=migrate(JSON.parse(JSON.stringify(old)));
    check('E 舊存檔讀檔：交往中、有她的聯絡方式；家族群組不補',s.flags.dating_kexin===true&&s.contacts&&s.contacts.kexin===0&&!s.flags.FAM_GROUP_SENT);
    check('E 已經設過的不動（之後分開設成 false，讀檔不會又變回交往中）',migrate({v:3,name:'x',rel:{},flags:{dating_kexin:false}}).flags.dating_kexin===false);
    fresh(4,22,'dorm',s.flags); G.contacts=s.contacts; await STORY.sleepNow(GM); const L=lines();
    const i=L.indexOf('休學到重考的那幾個月，你不是一個人過的。');
    check('E 第三天以後的早上：補一次（旁白＋早上版第一句「早安。今天讀到哪了？」）',G.day===5&&i>=0&&L[i+1]==='早安。今天讀到哪了？',JSON.stringify(L.slice(0,8)));
    check('E 早上版最後一句「去上課吧。下課再跟我說你讀到哪了。」、中間相同',L.includes('去上課吧。下課再跟我說你讀到哪了。')&&L.includes('兩個老師講的不一樣。……我好奇你們的怎麼講。')&&!L.includes('晚安。不要讀到太晚。'));
    check('E 家族群組沒有補發',!PHONE.inGroup(G,'family_law'));
    said=[]; await STORY.sleepNow(GM); check('E 只補一次（再睡一次不會再出現）',!lines().some(t=>/今天讀到哪了/.test(t)));
    fresh(4,22,'dorm',{introDone:true,KX_FIRST_MSG:true,dating_kexin:true}); await STORY.sleepNow(GM); check('E 看過的（有 KX_FIRST_MSG）不補',!lines().some(t=>/今天讀到哪了/.test(t)));
    fresh(1,22,'dorm',{introDone:true,dating_kexin:true}); await STORY.sleepNow(GM); check('E 第二天（劇情的那一天）不補，等第三天的早上',G.day===2&&!lines().some(t=>/今天讀到哪了/.test(t))); }
  /* ---------- F 芷若的第一則私訊 ---------- */
  for(const [dating,order] of [[true,'手沖'],[false,'手沖'],[true,'檸檬塔'],[false,'檸檬塔'],[false,'拿鐵'],[true,'拿鐵'],[false,'卡布奇諾'],[false,'熱可可'],[false,'美式'],[false,'茶']]){ fresh(20,15,'cafe',{dating_kexin:dating,zhiruoShopContactDay:20,zhiruoFirstOrder:order}); STORY.phoneRules(GM); PHONE.tick(G);
    const at=dating?{day:21,h:15+10/60}:{day:20,h:22+7/60}, before=at.day*24+at.h-0.1; G.day=Math.floor(before/24); G.hour=before-G.day*24; PHONE.tick(G);
    const none=!G.msgs.some(m=>m.tag==='zr_dm1'); G.day=at.day; G.hour=at.h+0.02; PHONE.tick(G); STORY.phoneRules(GM); const T=KX('p:heroine_02').map(m=>m.text);
    /* 第三句（BB_95 4-2，BB 2026-10-14 654f5dd）：照第一次點的東西；交往中隔天才傳＝「昨天」，飲料都是同一句 */
    /* AA_207 §5（BB_167 SC3 第 27 列）：前兩則換成店員帳號的正事；「你沒發現。」換成「不知道你喝不喝得出來」、點心的刪掉；交往中隔天那一版照留 */
    const DRINK={'手沖':'你今天的手沖，悶蒸我多等了十秒。不知道你喝不喝得出來。','拿鐵':'今天那杯拿鐵，奶泡我多打了一點，不知道你喝不喝得出來。','卡布奇諾':'今天那杯卡布奇諾，奶泡我多打了一點，不知道你喝不喝得出來。','熱可可':'今天那杯熱可可，奶泡我多打了一點，不知道你喝不喝得出來。','美式':'你今天的美式，水我少加了一點。不知道你喝不喝得出來。','茶':'你今天的茶，我多泡了十秒。不知道你喝不喝得出來。'};
    const third=order==='檸檬塔'?(dating?'你昨天的檸檬塔，是我挑的。好吃的話，跟老闆說。':'你今天的檸檬塔，我挑了邊邊最脆的那一塊。'):(dating?'你昨天的那杯，是我做的。好喝的話，跟老闆說。':DRINK[order]);
    check('F '+(dating?'交往中：加帳號隔天 15:10':'單身：當天 22:07')+'、第一次點'+order+'；時間到才出現；三句（第三句'+(dating?'友情版、「昨天」':'照第一次點的東西')+'）',none&&JSON.stringify(T)===JSON.stringify(['我是兩點半的芷若。店裡的帳號是我在回。','要外帶可以先傳，我先做。',third]),JSON.stringify(T));
    check('F 收到以後有她的聯絡方式',INV.hasContact(G,'heroine_02')); }
  /* ---------- G 語彤事件 3 ---------- */
  { const e=ev('ev_yutong_customer'); const setup=()=>{ fresh(80,20.5,'noodle',{dating_kexin:true}); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','SHARED_MEAL','x'); };
    setup(); picks=['我不知道']; await EVENTS.run(e); const L=lines(), o=opts[0]||[];
    check('G 三個選項（AA_11 原文）',JSON.stringify(o)===JSON.stringify(['「我不知道。我才大一。但我知道誰會知道。」','「這種人通常只是嚇人。」','「我覺得不能用吧……」']),JSON.stringify(o));
    check('G 不出法律題目（沒有 legal 那一行、沒有問）',legalAsked===0&&!e.dialogue.some(l=>l.legal));
    check('G 最後一句「今天的麵不用錢。……阿姨問的話，我就說你洗了碗。」（沒有「不要跟阿姨說是我說的」）',L[L.length-1]==='今天的麵不用錢。……阿姨問的話，我就說你洗了碗。'&&!L.some(t=>/不要跟阿姨說/.test(t)));
    STORY.phoneRules(GM); const q=KX('p:heroine_05');
    check('G 選「我知道誰會知道」：祐廷傳給學姊兩則（AA 2026-10-14 的原文，不用括號說明），學姊的回覆排在當晚 22:30',JSON.stringify(q.map(m=>m.from+'：'+m.text))===JSON.stringify(['player：學姊，想請問一件事。麵店的阿姨被客人說吃壞肚子，要賠三萬。','player：客人還錄了跟阿姨吵架的聲音，說要告。這種事可以去法服問嗎？'])&&G.phone.q.some(x=>x.tag==='sis_yutong'&&x.day===80&&Math.abs(x.h-22.5)<1e-6),JSON.stringify(q.map(m=>m.text)));
    check('G 語彤第二句拆成兩句（AA：一句 40 字以內）',L.includes('上週有客人說他在我們店吃壞肚子，要我阿姨賠三萬。')&&L.includes('他還錄了跟我阿姨吵架的聲音，說要拿去告。')&&L.every(t=>[...t].length<=40),JSON.stringify(L.filter(t=>[...t].length>40)));
    G.hour=22.55; PHONE.tick(G); STORY.phoneRules(GM); const W=KX('p:heroine_05').filter(m=>m.from==='heroine_05').map(m=>m.text);
    check('G 學姊 22:30 的三句（BB_95 4-3；AA_398 第 6 列拿掉「三件事。」與編號；第 80 天是第 14 週＝雙週，這週六法服沒有值班 → 雙週版「下週六」，AA_140 G47；AA_207 §7 第 2 列：第三句後半的標語句拿掉）',JSON.stringify(W)===JSON.stringify(['叫阿姨下週六早上九點來B館，法服有值班。','發票、那天的進貨單、監視器的時間，全部留著。','然後叫阿姨先睡覺。']),JSON.stringify(W));
    check('G 沒有語彤的聯絡方式：下次在麵店當面給她看（ev_yutong_fwd）',G.flags.yutongFwdInPerson===true&&EVENTS.check(ev('ev_yutong_fwd'))===true);
    said=[]; await EVENTS.run(ev('ev_yutong_fwd')); check('G 當面：「你把學姊的回覆給語彤看。」「……法服是什麼？」',JSON.stringify(lines())===JSON.stringify(['你把學姊的回覆給語彤看。','……法服是什麼？'])); }
  { const e=ev('ev_yutong_customer'); fresh(80,20.5,'noodle',{dating_kexin:true}); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','SHARED_MEAL','x'); INV.rec(G); G.contacts.heroine_03=70; picks=['我不知道']; await EVENTS.run(e);
    STORY.phoneRules(GM); G.hour=22.55; PHONE.tick(G); STORY.phoneRules(GM); G.hour=22.75; PHONE.tick(G); const Y=KX('p:heroine_03').map(m=>m.text);
    check('G 有語彤的聯絡方式：祐廷把截圖傳給她，她回「……法服是什麼？」',Y.length===2&&/截圖/.test(Y[0])&&Y[1]==='……法服是什麼？'&&!G.flags.yutongFwdInPerson,JSON.stringify(Y)); }
  { const e=ev('ev_yutong_customer'); fresh(80,20.5,'noodle',{}); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','SHARED_MEAL','x'); picks=['我覺得不能用']; await EVENTS.run(e); const L=lines();
    check('G 裝懂：「語彤看了你三秒。」「你剛剛停頓了。」……「那你一開始就說不知道就好。」、記下 BLUFFED',L.includes('語彤看了你三秒。')&&L.includes('你剛剛停頓了。')&&L.includes('……對，我不知道。')&&L.includes('嗯。那你一開始就說不知道就好。')&&SOCIAL.has('heroine_03','BLUFFED'));
    STORY.phoneRules(GM); check('G 裝懂、說只是嚇人：不會私訊學姊',!KX('p:heroine_05').length);
    const after=ev('ev_yutong_customer_after'), d=G.flags.yutongCustomerDay, wed=STORY.fafuSat(d).day;   /* 2026-10-15 法服方案 A：週六（變數名沿用 wed）；G47：下一個值班的週六（第 80 天第 14 週 → 第 15 週的週六）*/
    G.day=wed; G.weekday=wdOf(wed); G.zone='noodle'; const a=EVENTS.check(after); G.day=wed+1; G.weekday=wdOf(wed+1); const b=EVENTS.check(after);
    check('G 結果（阿姨那個週六早上去了法服）：那個週六還不出現、之後才出現',a===false&&b===true,JSON.stringify({d,wed,a,b}));
    said=[]; await EVENTS.run(after); check('G 結果的旁白（三種選擇都一樣；AA_236 A4：學姊不在週六服務現場，改「值班的學長姐」）',lines()[0]==='阿姨那個週六早上去了法服。值班的學長姐幫她把那天的進貨單、發票、監視器的時間整理好。'&&lines()[1]==='客人看到阿姨準備得這麼齊，就沒有再來了。'); }
  /* AA_140 G47：單週（第 15 週）＝「這週六」、事件 3 只在大一 */
  { const termDay=(t,w,d)=>STORY.termDay(t,w,d), e=ev('ev_yutong_customer'), D15=termDay('Y1S1',15,3); fresh(D15,20.5,'noodle',{dating_kexin:true}); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','SHARED_MEAL','x'); picks=['我不知道']; await EVENTS.run(e);
    STORY.phoneRules(GM); G.hour=22.55; PHONE.tick(G); STORY.phoneRules(GM); const W=KX('p:heroine_05').filter(m=>m.from==='heroine_05').map(m=>m.text);
    const fs=STORY.fafuSat(D15);
    check('G47 第 15 週（單週）：「這週六」；值班週六就是這一週的週六',W[0]==='叫阿姨這週六早上九點來B館，法服有值班。'&&fs.thisWeek&&fs.day===termDay('Y1S1',15,6),JSON.stringify({W:W[0],fs}));
    const f16=STORY.fafuSat(termDay('Y1S1',16,2)), f8=STORY.fafuSat(termDay('Y1S2',8,2)), f1=STORY.fafuSat(termDay('Y1S2',1,2));
    check('G47 法服值班的週六：第 16 週 → 不是這週；考試週（大一下第 8、9 週）跳過；第 1 週 → 第 3 週',!f16.thisWeek&&CALENDAR.termOf(f8.day).week===11&&CALENDAR.termOf(f1.day).week===3,JSON.stringify([f16,f8&&CALENDAR.termOf(f8.day),f1&&CALENDAR.termOf(f1.day)]));
    fresh(termDay('Y2S1',15,3),20.5,'noodle',{dating_kexin:true}); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','SHARED_MEAL','x');
    check('G47 事件 3 只在大一：大二上第 15 週不觸發',EVENTS.check(e)===false);
    /* AA-B G47 邊界：下一個值班週六在這週或下週才演；當天是週六＝從下週算（不會說「這週六」） */
    const can=(day)=>{ fresh(day,20.5,'noodle',{dating_kexin:true}); SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','SHARED_MEAL','x'); return EVENTS.check(e); };
    const sat15=termDay('Y1S1',15,6), fsat=STORY.fafuSat(sat15), y2w8=termDay('Y1S2',8,2), y2w1=termDay('Y1S2',1,2), f8b=STORY.fafuSat(y2w8), f1b=STORY.fafuSat(y2w1);
    check('G47 邊界：第 15 週週六晚上 → 值班週六是下週以後（不是今天），不說「這週六」',fsat&&fsat.day>sat15&&!fsat.thisWeek,JSON.stringify(fsat));
    check('G47 邊界：大一下第 8 週二（期中考週，下一個值班週六在第 11 週）、第 1 週二（第 3 週）不演；第 15 週（這週六值班）演',f8b&&f8b.wk===3&&f1b&&f1b.wk===2&&can(y2w8)===false&&can(y2w1)===false&&can(D15)===true,JSON.stringify({f8b,f1b}));
    const okDays=[]; for(let d=termDay('Y1S2',1,1);d<=termDay('Y1S2',18,7);d++){ const f=STORY.fafuSat(d); if(can(d)) okDays.push(d); if(can(d)&&!(f&&f.wk<=1)) { okDays.length=0; break; } }
    check('G47 邊界：大一下會演的每一天，值班週六都在這週或下週',okDays.length>0,String(okDays.length)); }
  /* ---------- H 房間物件 ---------- */
  { fresh(5,20,'dorm',{dating_kexin:true}); picks=[0,1,2,3,4,6]; await STORY._v1.roomItems(GM);   /* 大一同房時多一樣「阿凱的泡麵評鑑表」（BB_120 1-7c，在固定的五樣後面；內容在 bb120_fixed_unit）*/
    const W=['以前翻過。看得到字，看不懂意思。','念了一個多月的課本。前六章有畫線，後面是新的。','重考那段時間的筆記。一半是你的字，一半是她的。','摩天輪的票根。兩個人開始交往的那一天。','河堤邊停著幾台腳踏車。那一群人。你休學以後，他們還是會叫你。'];
    check('H 五個物件的旁白（AA_12 原文）、「不看了」結束',JSON.stringify(lines())===JSON.stringify(W)&&JSON.stringify(opts[0])===JSON.stringify(['書架上的舊《民法》','經濟學原理','寫滿的筆記本','摩天輪的票根（夾在桌墊下）','手機相簿的一張照片','阿凱的泡麵評鑑表','不看了']),JSON.stringify(lines()));
    const zsrc=fs.readFileSync(path.join(ROOT,'src/zones3d.js'),'utf8'); check('H 宿舍有「看看房間裡的東西」的互動點',/label:'看看房間裡的東西',roomItems:true/.test(zsrc)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
