// 第二天：下課她追出來、一起走、Café／總圖（D60 起；2026-11-02 改照 AA_587 第 7-2 節 S4 方案 A——使用者 11-02「你為什麼念法律」拿掉、她追出來是為了報告分組並交換 LINE；
// AA 第 9 節定案、使用者第 14 節看完）——不需要瀏覽器。
// （de2a31e 的 commit 訊息寫成「D60、D62」是筆誤：D62 是社科院與辜振甫圖書館）
// 檢查：
//   追出來（meetAn）：classAnswer 那句以後、邀約以前，以安「老師說報告兩人一組。我還沒有組。你呢？」→ 祐廷「那我們一組？」（自動說、對話框寫玩家的名字、不是選項）→「好。」→ CG-28 →「LINE。」；
//     記 AN_CONTACT_DAY2（＝那一天）、REPORT_PARTNER（開學第二天她追出來分組）；三種邀約選法都一樣；婉拒的多一句「題目出來我傳你。」；邀約的選項照舊三個。
//   走路（Café、總圖兩條路線）：「周老師說報告的題目下週公布。我猜就是今天那個賣家。」→ 祐廷「少打一個零那個？」→「嗯。我已經在找判決了。」；沒有舊句子。
//   Café、總圖：「為什麼念法律」整段拿掉（沒有那四個選項、沒有「說來話長」、whyLaw 不設、以安不會從這裡知道經濟系）；換成照 cafeView 的分工（新5～新8）；好感照舊 +3；
//     結尾「筆記我晚上拍給你。」（不再要聯絡方式、不在這裡記 AN_CONTACT_DAY2）；記憶 CAFE_AFTERNOON／LIBRARY_AFTERNOON 的備註「聊了報告」。
//   Café 第 88 條選「不應該」：「好狠。」之後「……但我懂。「我不是故意的」，每天都有人在說。」（AA_587 第 6 列）。
//   第 4～5 週的分組事件（ev_an_report_split）：條件多 notMemory REPORT_PARTNER——新玩家第二天就同組了，只剩舊存檔會演。
//   舊句子（分數到了、書記官、一年後我再問你、我媽說、我媽在法院）：story3d.js 整個檔案與實際演出都沒有。
//   ev_an_mother 停用：條件都符合也不觸發（同樣條件、拿掉 retired 的複本會觸發——證明這項測試抓得到）。
//   存檔：第二天之後存的（舊 key ok／hero／family／unknown 原值不變、以安不知道經濟系、下午之後找以安不再追問「家裡那件事」）、
//         第二天之前存的（照新版演）、已經演過 ev_an_mother 的（不會再演、記憶留著、人物面板照樣讀得出來）。
//   開局：自訂名字（祐廷自己說的話，對話框寫玩家取的名字）；遊戲只有一種新遊戲開局（STORY.newGame）。
// 修改前（d7a468868 的 story3d.js、events.js 放進這支測試實際跑）：FAIL 43、PASS 33（追出來、Café、總圖、分組事件、為什麼念法律那幾項）；修改後 ALL PASS（76 項）。
// 用法：node tests/day2_whylaw_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|SMALLTALK|SOCIAL|EVENTS|STORY)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js','src/story3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){}}; global.CHAR={setExpr(){}};
const OLD=['分數到了','書記官','一年後我再問你','我媽說','我媽在法院'];
const oldIn=lines=>OLD.filter(w=>lines.some(t=>String(t).includes(w)));
let said=[], opts=[], pick={law88:0,why:0,invite:0}, noteOK=true;
const mkG=name=>({v:2,day:2,hour:14.2,zone:'cafe',weekday:4,money:2000,flags:{introDone:true,campusIntro:true,readCase:'full',classDone:true,metAn:true,plan:'cafe',companion:'an',walkCk:{road:true},whyWalkNew:true},choices:{},events:{done:{},last:{},count:0},name:name||'祐廷',rel:{an:6,zhe:12,sis:2,kai:3,yu:2},social:null});
let G=mkG();
const P={busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:P,zone:{roomAt:()=>null,seats:[{x:1,z:1,lv:1,yaw:0},{x:2,z:2,lv:1,yaw:Math.PI}]},npcs:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},
  sitAt(){},standUp(){},walkTo:()=>Promise.resolve(true),removeNPC(){},spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:'heroine_01',name:spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },hasNote:()=>noteOK,advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ const tx=o.map(q=>q.t||q.text); opts.push(tx); if(tx.some(t=>/翻民法/.test(t))) return pick.why; if(tx.some(t=>/改天/.test(t))) return pick.invite; if(tx.length===3&&/^應該/.test(tx[0])) return pick.law88; return 0; }};
const fresh=(over,name)=>{ G=mkG(name); Object.assign(G.flags,over||{}); SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; GM.npc={an:{id:'an',charId:'heroine_01',name:'小安',obj:{position:{x:0,z:0}},beh:'follow'}}; };
global.ADV.cg=id=>{ said.push({who:'#CG',t:'#CG:'+id}); };   /* CG 那一拍記進同一串，看順序 */
const lines=()=>said.map(s=>s.t);
const has=(id,tag)=>SOCIAL.has(id,tag);
const D2=STORY._day2;
const KEYS=['curious','econ','help','own'];
const after=(arr,q)=>{ const i=arr.indexOf(q); return i<0?[]:arr.slice(i+1); };
const WHY=/為什麼是法律系|說來話長|翻民法|自己選的|小時候|學長|理由/;   /* 「為什麼念法律」那一段的字（AA_587 第 46～49、51～55 列刪掉的） */
const NOTE=['那結論你寫。','那反方你寫。','那判斷標準你寫，你比我會講。'], NOTE_Q=['（小聲）那結論你寫。','（小聲）那反方你寫。','（小聲）那判斷標準你寫。'];
const memNote=(id,tag)=>{ const m=(G.social&&G.social.mem&&G.social.mem[id]||[]).find(x=>x.tag===tag); return m?m.note:null; };
(async()=>{
  // ---------- 1 走路（兩條路線）----------
  for(const plan of ['cafe','library']){ const cks=D2.walkChecks(plan); const first=cks[0]; const all=[].concat(...cks.map(c=>c.lines.map(l=>l[1])));
    check('1 走路（'+plan+'）：「周老師說報告的題目下週公布。我猜就是今天那個賣家。」→ 祐廷「少打一個零那個？」→「嗯。我已經在找判決了。」（AA_587 第 43～45 列）',
      first.lines.length===3&&first.lines[0][1]==='周老師說報告的題目下週公布。我猜就是今天那個賣家。'&&first.lines[1][0]==='我'&&first.lines[1][1]==='少打一個零那個？'&&first.lines[2][1]==='嗯。我已經在找判決了。',JSON.stringify(first.lines));
    check('1 走路（'+plan+'）：沒有舊句子（'+OLD.join('、')+'）、沒有「為什麼是法律系」',oldIn(all).length===0&&!all.some(t=>/為什麼是法律系|說來話長/.test(t)),oldIn(all).join('、')); }
  // ---------- 2 Café：第 88 條三個選項各一次 ----------
  for(const [a,key] of [[0,'A'],[1,'B'],[2,'C']]){ fresh(); pick={law88:a}; await D2.cafeScene(GM); const L=lines(); const n=after(L,'她打開筆電，打了幾行字，又停下來。');
    check('2 Café 第 88 條選 '+key+'：「她打開筆電…」之後是「'+NOTE[a]+'」「其他的我來。題目一公布就開始。」（AA_587 新5、新6）',G.flags.cafeView===key&&n[0]===NOTE[a]&&n[1]==='其他的我來。題目一公布就開始。',JSON.stringify(n.slice(0,2)));
    check('2 Café 選 '+key+'：「為什麼念法律」整段拿掉：沒有那四個選項、whyLaw 不設、以安不記得經濟系',!opts.some(o=>o.some(t=>/翻民法|經濟/.test(t)))&&G.flags.whyLaw===undefined&&G.choices.whyLaw===undefined&&!has('heroine_01','KNOWS_ECON_YEAR')&&!L.some(t=>WHY.test(t)),JSON.stringify(L.filter(t=>WHY.test(t))));
    check('2 Café 選 '+key+'：結尾「今天……謝謝。」→「筆記我晚上拍給你。」（AA_587 第 50 列）；不在這裡記 AN_CONTACT_DAY2；下午照樣結束（afternoonDone、CAFE_AFTERNOON「聊了報告」）',
      after(L,'今天……謝謝。')[0]==='筆記我晚上拍給你。'&&!L.includes('你的聯絡方式給我。筆記我拍給你。')&&G.flags.AN_CONTACT_DAY2===undefined&&G.flags.afternoonDone===true&&memNote('heroine_01','CAFE_AFTERNOON')==='聊了報告',JSON.stringify(L.slice(-2)));
    check('2 Café 選 '+key+'：整段演出沒有舊句子',oldIn(L).length===0,oldIn(L).join('、')); }
  { fresh(); pick={law88:1}; await D2.cafeScene(GM); const L=lines();
    check('2 Café 第 88 條選「不應該」：「好狠。」之後是「……但我懂。「我不是故意的」，每天都有人在說。」（AA_587 第 6 列）',after(L,'好狠。')[0]==='……但我懂。「我不是故意的」，每天都有人在說。'&&G.flags.cafeView==='B',after(L,'好狠。')[0]);
    check('2 Café 第 88 條選「不應該」：沒有提到媽媽',!L.some(t=>/媽/.test(t)),L.filter(t=>/媽/.test(t)).join(' / ')); }
  // 好感：S4 拿掉的那段原本的 GM.rel('an',3) 搬到分工那兩句後面（總量不變）
  { const rels=[]; const r0=GM.rel; GM.rel=(id,n)=>rels.push([id,n]); fresh(); pick={law88:0}; await D2.cafeScene(GM); const c=rels.slice(); rels.length=0;
    fresh({plan:'library',walkCk:{soc:true}}); G.zone='library_hall'; pick={law88:0}; await D2.libraryScene(GM); GM.rel=r0;
    check('2 好感照舊：Café、總圖選 A 各 GM.rel(an,3) 一次（原本「為什麼念法律」那段的，搬到分工後面）',JSON.stringify(c)===JSON.stringify([['an',3]])&&JSON.stringify(rels)===JSON.stringify([['an',3]]),JSON.stringify({c,rels})); }
  // ---------- 3 總圖（小聲版）----------
  for(const [a,key] of [[0,'A'],[1,'B'],[2,'C']]){ fresh({plan:'library',walkCk:{soc:true}}); G.zone='library_hall'; pick={law88:a}; await D2.libraryScene(GM); const L=lines();
    const i=L.findIndex(t=>/^（小聲）(我也這樣想|好狠|對，「無過失」)/.test(t)), n=L.slice(i+1);
    check('3 總圖 選 '+key+'：第 88 條的反應之後是「'+NOTE_Q[a]+'」「（小聲）其他的我來。」（AA_587 新7、新8）',i>=0&&n[0]===NOTE_Q[a]&&n[1]==='（小聲）其他的我來。'&&G.flags.cafeView===key,JSON.stringify(n.slice(0,2)));
    check('3 總圖 選 '+key+'：沒有「為什麼念法律」、whyLaw 不設、沒有 KNOWS_ECON_YEAR',!opts.some(o=>o.some(t=>/翻民法|經濟/.test(t)))&&G.flags.whyLaw===undefined&&!has('heroine_01','KNOWS_ECON_YEAR')&&!L.some(t=>WHY.test(t)),JSON.stringify(L.filter(t=>WHY.test(t))));
    check('3 總圖 選 '+key+'：結尾「（小聲）我再待一下。今天……謝謝。」→「（小聲）筆記我晚上拍給你。」；不在這裡記 AN_CONTACT_DAY2；LIBRARY_AFTERNOON「聊了報告」；沒有舊句子',
      after(L,'（小聲）我再待一下。今天……謝謝。')[0]==='（小聲）筆記我晚上拍給你。'&&G.flags.AN_CONTACT_DAY2===undefined&&G.flags.afternoonDone===true&&memNote('heroine_01','LIBRARY_AFTERNOON')==='聊了報告'&&oldIn(L).length===0,JSON.stringify(L.slice(-2))); }
  // ---------- 4 分組事件只剩舊存檔 ----------
  { const ev=STORY_EVENTS.find(e=>e.id==='ev_an_report_split'), nm=(ev.prereq&&ev.prereq.notMemory)||[];
    check('4 ev_an_report_split 條件多 notMemory REPORT_PARTNER（第二天已經同組的不演；AA_587 第 7-2 節）',nm.some(m=>m.npc==='heroine_01'&&m.tag==='REPORT_PARTNER'),JSON.stringify(ev.prereq));
    check('4 ev_an_report_split 的原句照 AA_587 第 8、9 列（舊存檔看得到）',ev.dialogue[0].text==='（把講義收好）民總的報告兩人一組。我還沒有組。'&&ev.dialogue.some(l=>l.text==='你呢？')); }
  // ---------- 5 程式碼與資料：舊句子、以安的家庭欄 ----------
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    /* 別的事件合法用到同樣的字（經濟系寒假 E24 可昕「我媽說我寒假胖了。」，BB_104 8b-16；BB_179 段 E 改短）：先拿掉這幾句再搜尋 */
    const LEGIT=['我媽說我寒假胖了。','我媽說我這三天胖了。……都是夜市害的。','我媽說她不好意思拒絕。','我媽說今年要包一百個','我媽說，下次她會先打給我。'];   /* 法服值班民眾第 6 件（AA_184）；阿哲的大二過年（AA_143 2-1，AA-B 9035ede0）；法服值班第二輪第 6 位回來（AA_469 2-1，企劃線 9f465dcef）*/ const src2=LEGIT.reduce((a,w)=>a.split(w).join(''),src);
    check('5 story3d.js 整個檔案搜尋不到：'+OLD.join('、')+'（不算 '+LEGIT.join('、')+'）',oldIn([src2]).length===0,oldIn([src2]).join('、'));
    check('5 story3d.js 沒有第二天的「為什麼念法律」台詞（說來話長、我們有一整個下午、這個理由我喜歡）、whyLawChosen 拿掉',!/說來話長|我們有一整個下午|這個理由我喜歡|whyLawChosen/.test(src.slice(src.indexOf('async function meetAn('),src.indexOf("GM.memo('和小安在總圖待到黃昏')")).replace(/\/\*[\s\S]*?\*\//g,''))&&src.indexOf('async function meetAn(')>0);   /* 第二天那幾段（meetAn～libraryScene）；別處合法的「說來話長」（經濟系寒假 E24C）不算 */
    const h=CHARACTERS.heroine_01;
    check('5 以安的 family_context＝「母親是高等法院庭長，單親；家在台中，家境寬裕」（2026-10-18 01:3x 使用者經 AA-C）',h.family_context==='母親是高等法院庭長，單親；家在台中，家境寬裕',h.family_context);
    check('5 以安的 contradictions：還沒決定司法官或大事務所律師、媽媽是高等法院庭長、不想被當成『庭長的女兒』；沒有書記官',h.contradictions==='看起來對人生極有規劃，其實還沒決定要當司法官還是大事務所律師；媽媽是高等法院庭長，她給自己的標準很高，也不想被當成『庭長的女兒』'&&!/書記官/.test(JSON.stringify(h)),h.contradictions); }
  // ---------- 6 ev_an_mother 停用 ----------
  { fresh(); G.zone='campus'; G.hour=18.0; G.day=12; SOCIAL.adjust('heroine_01',{fam:25,trust:10}); const ev=STORY_EVENTS.find(e=>e.id==='ev_an_mother'); const ctl=Object.assign({},ev); delete ctl.retired;
    check('6 對照組：同樣條件（校園、18:00、以安有點熟）拿掉 retired 的複本會觸發——證明這項測試抓得到',SOCIAL.stage('heroine_01')==='FAMILIAR'&&EVENTS.check(ctl)===true,SOCIAL.stage('heroine_01'));
    check('6 ev_an_mother（retired）不觸發；事件清單裡也不是 eligible',EVENTS.check(ev)===false&&EVENTS.list().find(e=>e.id==='ev_an_mother').eligible===false);
    let ran=null; const run0=EVENTS.run; EVENTS.run=e=>{ ran=e.id; return Promise.resolve(); }; const r=EVENTS.onInteract('heroine_01'); EVENTS.run=run0;
    check('6 對以安按互動：不會演 ev_an_mother',ran!=='ev_an_mother',String(ran)+' / onInteract='+r); }
  // ---------- 7 舊存檔 ----------
  // 7-1 第二天之後存的（舊 key）：原值不變、以安不知道經濟系、下午之後找她不再追問「家裡那件事」
  for(const old of ['ok','hero','family','unknown']){ fresh({afternoonDone:true,whyLaw:old,cafeView:'A',companion:null}); G.choices.whyLaw=old; G.day=3; SOCIAL.bind(G);
    const snap=JSON.parse(JSON.stringify(G)); G=snap; SOCIAL.bind(G); EVENTS.bind(GM);   /* 存檔是 JSON：存進去、讀出來 */
    check('7-1 第二天之後的舊存檔 whyLaw='+old+'：讀進來原值不變（不遷移）、以安不知道經濟系',G.flags.whyLaw===old&&G.choices.whyLaw===old&&!has('heroine_01','KNOWS_ECON_YEAR'));
    check('7-1 whyLaw='+old+' 照 AA_120 7-5 讀成 '+(old==='hero'?'help':'own'),STORY.whyLawKey(G.flags)===(old==='hero'?'help':'own'),STORY.whyLawKey(G.flags));
    const talk0=EVENTS.onInteract; EVENTS.onInteract=()=>false; said=[];
    const an={id:'an',charId:'heroine_01',name:'小安',obj:{position:{x:1,z:1}}}; GM.npc.an=an; await D2.talkAn(GM,an); EVENTS.onInteract=talk0; const L=lines();
    check('7-1 whyLaw='+old+'：下午之後第一次找以安，照舊講報告（「不能賠十倍」），不再追問「家裡那件事」',L.some(t=>/不能賠十倍/.test(t))&&!L.some(t=>/家裡那件事/.test(t))&&G.flags.anAfter===true,JSON.stringify(L)); }
  check('7-1 whyLawKey：新 key 原樣、沒聊過是 null',KEYS.every(k=>STORY.whyLawKey({whyLaw:k})===k)&&STORY.whyLawKey({})===null&&STORY.whyLawKey(null)===null);
  // 7-2 第二天之前存的：讀進來以後第二天照新版演
  { fresh({plan:undefined,companion:undefined,walkCk:undefined,classDone:false}); G.day=1; G.hour=22.5; G.zone='dorm'; const snap=JSON.parse(JSON.stringify(G)); G=snap; SOCIAL.bind(G); EVENTS.bind(GM);
    check('7-2 第二天之前的舊存檔：還沒有 whyLaw',G.flags.whyLaw===undefined&&STORY.whyLawKey(G.flags)===null);
    delete G.flags.whyWalkNew;   /* 舊存檔沒有這個旗標 */
    G.day=2; G.hour=13.5; G.zone='campus'; Object.assign(G.flags,{classDone:true,plan:'cafe',companion:'an',walkCk:{}});
    { const si=global.setInterval, ci=global.clearInterval; let cb=null; global.setInterval=f=>{ cb=f; return 1; }; global.clearInterval=()=>{};
      try{ D2.startWalkTalk(GM); P.obj.position.x=30; P.obj.position.z=-40; cb&&cb(); } finally { global.setInterval=si; global.clearInterval=ci; P.obj.position.x=0; P.obj.position.z=0; } }
    check('7-2 第二天之前的舊存檔：讀進來以後走到路上的觸發點，播新版走路台詞（walkCk.road）',G.flags.walkCk.road===true,JSON.stringify({walkCk:G.flags.walkCk}));
    G.hour=14.2; G.zone='cafe'; pick={law88:1}; said=[]; opts=[]; await D2.cafeScene(GM); const L=lines();
    check('7-2 第二天之前的舊存檔：第二天照新版演（分工「那反方你寫。」、「每天都有人在說」、沒有「為什麼念法律」）',L.includes('那反方你寫。')&&L.some(t=>/每天都有人在說/.test(t))&&G.flags.whyLaw===undefined&&!L.some(t=>WHY.test(t))&&oldIn(L).length===0,oldIn(L).join('、')); }
  // 7-3 已經演過 ev_an_mother 的：不會再演、記憶留著、人物面板讀得出來
  { fresh({afternoonDone:true,whyLaw:'ok'}); G.zone='campus'; G.hour=18; G.day=15; G.events.done.ev_an_mother=1; G.events.last.ev_an_mother=11; SOCIAL.adjust('heroine_01',{fam:30,trust:20});
    SOCIAL.remember('heroine_01','TALKED_FAMILY','她媽媽是書記官');
    const snap=JSON.parse(JSON.stringify(G)); G=snap; SOCIAL.bind(G); EVENTS.bind(GM); const ev=STORY_EVENTS.find(e=>e.id==='ev_an_mother'); let d='';
    try{ d=SOCIAL.describe('heroine_01'); }catch(e){ d='例外 '+e.message; }
    check('7-3 演過 ev_an_mother 的舊存檔：讀得進來、不會再演、記憶照舊（已經演過的舊存檔不改，AA_120 7-5）',EVENTS.check(ev)===false&&G.events.done.ev_an_mother===1&&has('heroine_01','TALKED_FAMILY')&&/聊過家裡的事/.test(d),d);
    check('7-3 人物面板只寫「聊過家裡的事」，不顯示舊備註（存檔裡的備註不改，AA 2026-10-14）',!/書記官/.test(d)&&G.social.mem.heroine_01.some(m=>m.tag==='TALKED_FAMILY'&&m.note==='她媽媽是書記官'),d);
    SOCIAL.remember('heroine_01','LATE_NIGHT_TALK','聊到很晚'); const d2=SOCIAL.describe('heroine_01');
    check('7-3 不是停用事件留下的備註照常顯示',/深夜聊過（聊到很晚）/.test(d2),d2); }
  // 7-4 舊版走到一半存的檔（聽過舊的走路台詞、還沒到店裡）：到 Café／總圖也沒有「為什麼念法律」
  { fresh(); delete G.flags.whyWalkNew; pick={law88:0}; await D2.cafeScene(GM); const L=lines();
    check('7-4 Café：沒聽過新版走路台詞的舊存檔，到店裡也照新版（分工、沒有「為什麼是法律系」）',L.includes('那結論你寫。')&&!L.some(t=>WHY.test(t))&&G.flags.whyLaw===undefined,JSON.stringify(L.filter(t=>WHY.test(t))));
    fresh({plan:'library',walkCk:{soc:true}}); delete G.flags.whyWalkNew; G.zone='library_hall'; pick={law88:0}; await D2.libraryScene(GM); const L2=lines();
    check('7-4 總圖：同上（小聲版分工、沒有「為什麼是法律系」）',L2.includes('（小聲）那結論你寫。')&&!L2.some(t=>WHY.test(t))&&G.flags.whyLaw===undefined,JSON.stringify(L2.filter(t=>WHY.test(t)))); }
  // ---------- 8 開局、追出來（meetAn）----------
  { const nm=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8').match(/S\.newGame=async function/g)||[];
    check('8 新遊戲只有一種開局（STORY.newGame）：第一天 21:12 宿舍；第二天才有這段對話',nm.length===1); }
  const SEQ=['老師說報告兩人一組。我還沒有組。你呢？','那我們一組？','好。','#CG:cg_line_qr_heroine01','LINE。','#CG:null'];
  for(const [inv,plan,name] of [[0,'cafe','祐廷'],[1,'library','祐廷'],[2,null,'祐廷'],[0,'cafe','阿明']]){
    fresh({plan:undefined,companion:undefined,walkCk:undefined,metAn:undefined},name); G.zone='campus'; G.hour=12.1; GM.npc={}; pick={law88:0,invite:inv}; await D2.meetAn(GM); const L=lines();
    const i=L.indexOf(SEQ[0]), inviteAt=L.indexOf('我等一下要去溫州街那間咖啡廳整理今天的筆記，就是開到凌晨兩點半那間。'), classAt=L.findIndex(t=>/^剛剛周老師/.test(t));
    const tag='8 追出來（'+(plan||'改天')+'，'+name+'）';
    check(tag+'：classAnswer 那句以後、邀約以前：'+SEQ.join('→')+'（AA_587 新1～新4；「LINE。」那一拍放 CG-28）',i>classAt&&classAt>=0&&JSON.stringify(L.slice(i,i+SEQ.length))===JSON.stringify(SEQ)&&inviteAt===i+SEQ.length,JSON.stringify(L.slice(Math.max(0,i-1),i+SEQ.length+1)));
    check(tag+'：「那我們一組？」是祐廷自己說的（對話框寫「'+name+'」），不是選項；邀約的選項照舊三個',(said.find(s=>s.t==='那我們一組？')||{}).who===name&&opts.length===1&&opts[0].length===3&&!opts.some(o=>o.includes('那我們一組？')),JSON.stringify(opts));
    check(tag+'：記 AN_CONTACT_DAY2＝那一天、REPORT_PARTNER（開學第二天她追出來分組）',G.flags.AN_CONTACT_DAY2===G.day&&has('heroine_01','REPORT_PARTNER')&&memNote('heroine_01','REPORT_PARTNER')==='開學第二天她追出來分組');
    if(plan) check(tag+'：一起走（plan='+plan+'）、whyLaw 沒設、沒有舊句子',G.flags.plan===plan&&G.flags.companion==='an'&&G.flags.whyLaw===undefined&&oldIn(L).length===0&&!L.includes('題目出來我傳你。'),JSON.stringify({plan:G.flags.plan,companion:G.flags.companion}));
    else check(tag+'：「好。那明天見。」→「題目出來我傳你。」（AA_587 第 4 列、新9）；沒有走路／Café／總圖、whyLaw 沒設（之後讀成 null）',G.flags.anSkipped===true&&G.flags.plan===undefined&&after(L,'好。那明天見。')[0]==='題目出來我傳你。'&&STORY.whyLawKey(G.flags)===null&&!has('heroine_01','KNOWS_ECON_YEAR')&&oldIn(L).length===0,JSON.stringify(L.slice(-3))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
