// 第二天「為什麼念法律」＋以安三項（D60；AA_12 0-4、AA_120 7-5 第 4、5 項；使用者 2026-10-14 正式決定二、三）——不需要瀏覽器。
// （de2a31e 的 commit 訊息寫成「D60、D62」是筆誤：D62 是社科院與辜振甫圖書館）
// 檢查：
//   走路（Café、總圖兩條路線）：祐廷「……說來話長。你呢？」、以安講「理由要怎麼講才算數」；沒有舊句子。
//   Café、總圖各四個回答（AA 原文）都選一次：F.whyLaw／G.choices.whyLaw 是新 key；只有 econ 以安記得 KNOWS_ECON_YEAR；不設全域旗標（ECON_PAST_SHARED 另外管）。
//   以安的反應照 AA 原文；Café 第 88 條選「不應該」的反應改成「現實裡」那句（整句，不是只換兩個字）。
//   舊句子（分數到了、書記官、一年後我再問你、我媽說、我媽在法院）：story3d.js 整個檔案與實際演出都沒有。
//   ev_an_mother 停用：條件都符合也不觸發（同樣條件、拿掉 retired 的複本會觸發——證明這項測試抓得到）。
//   存檔：第二天之後存的（舊 key ok／hero／family／unknown 原值不變、以安不知道經濟系、下午之後找以安不再追問「家裡那件事」）、
//         第二天之前存的（照新版演）、已經演過 ev_an_mother 的（不會再演、記憶留著、人物面板照樣讀得出來）。
//   以安要聯絡方式（A19 的前提，AA 2026-10-14）：Café、總圖兩條路線的結尾各一句，記 AN_CONTACT_DAY2。
//   開局：自訂名字（祐廷自己說的話，對話框寫玩家取的名字）；遊戲只有一種新遊戲開局（STORY.newGame），第二天拒絕以安的邀約時沒有這段對話。
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
const lines=()=>said.map(s=>s.t);
const has=(id,tag)=>SOCIAL.has(id,tag);
const D2=STORY._day2;
// AA_12 0-4（Café）、AA_120 7-5 第 5 項（總圖短版）的原文
const CAFE_OPTS=['我小時候遇到事情就會去翻民法。翻得到，看不懂。我想知道怎麼看懂。','我念過一個多月經濟。還是想念這個。','我想幫身邊的人把事情弄清楚。','還在找怎麼說。但這是我自己選的。'];
const LIB_OPTS=['小時候遇到事情就去翻民法。翻得到，看不懂。','我念過一個多月經濟。還是想念這個。','想幫身邊的人把事情弄清楚。','還在找怎麼說。但是我自己選的。'];
const KEYS=['curious','econ','help','own'];
const CAFE_REACT=[['……小時候？','她停了一下。','那你很誠實。大部分人會說自己從小就懂。'],['所以你比我大？','一歲。','……學長。','不要。'],['這個理由我喜歡。很多人不是輸在法律，是輸在沒人幫他把事情弄清楚。'],['「自己選的」。','她重複一次，好像要記住。']];
const LIB_REACT=[['（小聲）……小時候？那你很誠實。'],['（小聲）所以你比我大？','一歲。','（小聲）……學長。','不要。'],['（小聲）這個理由我喜歡。'],['（小聲）「自己選的」。……好。']];
const after=(arr,q)=>{ const i=arr.indexOf(q); return i<0?[]:arr.slice(i+1); };
(async()=>{
  // ---------- 1 走路（兩條路線）----------
  for(const plan of ['cafe','library']){ const cks=D2.walkChecks(plan); const first=cks[0]; const all=[].concat(...cks.map(c=>c.lines.map(l=>l[1])));
    check('1 走路（'+plan+'）：「為什麼是法律系？」→ 祐廷「……說來話長。你呢？」→ 以安講吃飯講理由（AA_12 0-4）',
      first.lines.length===3&&first.lines[0][1]==='你有沒有想過，為什麼是法律系？'&&first.lines[1][0]==='我'&&first.lines[1][1]==='……說來話長。你呢？'&&first.lines[2][1]==='我家吃飯的時候，一件小事也要講理由講半天。我想知道，理由要怎麼講才算數。',JSON.stringify(first.lines));
    check('1 走路（'+plan+'）：沒有舊句子（'+OLD.join('、')+'）',oldIn(all).length===0,oldIn(all).join('、')); }
  // ---------- 2 Café 四個回答 ----------
  for(let k=0;k<4;k++){ fresh(); pick={law88:0,why:k}; await D2.cafeScene(GM); const L=lines(), whyOpts=opts.find(o=>o.some(t=>/翻民法/.test(t)))||[];
    const q='欸，剛剛路上你說「說來話長」。我們有一整個下午。';
    check('2 Café 選 '+KEYS[k]+'：以安先接回路上的話「'+q+'」',L.includes(q));
    check('2 Café 選 '+KEYS[k]+'：四個選項＝AA 原文（沒有否認是自己選的）',JSON.stringify(whyOpts)===JSON.stringify(CAFE_OPTS),JSON.stringify(whyOpts));
    check('2 Café 選 '+KEYS[k]+'：F.whyLaw＝G.choices.whyLaw＝'+KEYS[k],G.flags.whyLaw===KEYS[k]&&G.choices.whyLaw===KEYS[k],G.flags.whyLaw+'/'+G.choices.whyLaw);
    const exp=CAFE_REACT[k], got=after(L,q).slice(0,exp.length);
    check('2 Café 選 '+KEYS[k]+'：以安的反應＝AA 原文',JSON.stringify(got)===JSON.stringify(exp),JSON.stringify(got));
    check('2 Café 選 '+KEYS[k]+'：只有 econ 以安記得念過經濟系（KNOWS_ECON_YEAR）；沒有設全域旗標',has('heroine_01','KNOWS_ECON_YEAR')===(k===1)&&G.flags.ECON_PAST_SHARED===undefined&&!('KNOWS_ECON_YEAR' in G.flags));
    check('2 Café 選 '+KEYS[k]+'：整段演出沒有舊句子',oldIn(L).length===0,oldIn(L).join('、'));
    check('2 Café 選 '+KEYS[k]+'：下午照樣結束（afternoonDone、CAFE_AFTERNOON）',G.flags.afternoonDone===true&&has('heroine_01','CAFE_AFTERNOON'));
    if(k===1) check('2 econ：祐廷自己說「一歲。」「不要。」（對話框寫玩家的名字）',said.filter(s=>s.t==='一歲。'||s.t==='不要。').every(s=>s.who==='祐廷')&&said.filter(s=>s.who==='祐廷').length===2,JSON.stringify(said.filter(s=>s.who==='祐廷'))); }
  // Café 第 88 條三個選項各一次：「不應該」的反應是「現實裡」那句；其他兩個不變
  { fresh(); pick={law88:1,why:2}; await D2.cafeScene(GM); const L=lines();
    check('2 Café 第 88 條選「不應該」：「好狠。」之後是「……但我懂。「我不是故意的」，現實裡每天都有人說。可是法律不是用來原諒粗心的。」',
      after(L,'好狠。')[0]==='……但我懂。「我不是故意的」，現實裡每天都有人說。可是法律不是用來原諒粗心的。'&&G.flags.cafeView==='B',after(L,'好狠。')[0]);
    check('2 Café 第 88 條選「不應該」：沒有提到媽媽',!L.some(t=>/媽/.test(t)),L.filter(t=>/媽/.test(t)).join(' / ')); }
  for(const [a,key] of [[0,'A'],[2,'C']]){ fresh(); pick={law88:a,why:0}; await D2.cafeScene(GM); const L=lines();
    check('2 Café 第 88 條選 '+key+'：照舊演完、沒有舊句子',G.flags.cafeView===key&&oldIn(L).length===0&&G.flags.whyLaw==='curious',key+' '+oldIn(L).join('、')); }
  // ---------- 3 總圖四個回答（小聲版）----------
  for(let k=0;k<4;k++){ fresh({plan:'library',walkCk:{soc:true}}); G.zone='library_hall'; pick={law88:0,why:k}; await D2.libraryScene(GM); const L=lines(), whyOpts=opts.find(o=>o.some(t=>/翻民法/.test(t)))||[];
    const q='（小聲）剛剛路上你說「說來話長」。……小聲講，可以講短一點。';
    check('3 總圖 選 '+KEYS[k]+'：以安先接回路上的話「'+q+'」',L.includes(q));
    check('3 總圖 選 '+KEYS[k]+'：四個選項＝AA 短版原文',JSON.stringify(whyOpts)===JSON.stringify(LIB_OPTS),JSON.stringify(whyOpts));
    check('3 總圖 選 '+KEYS[k]+'：F.whyLaw＝G.choices.whyLaw＝'+KEYS[k],G.flags.whyLaw===KEYS[k]&&G.choices.whyLaw===KEYS[k]);
    const exp=LIB_REACT[k], got=after(L,q).slice(0,exp.length);
    check('3 總圖 選 '+KEYS[k]+'：以安的反應＝AA 原文',JSON.stringify(got)===JSON.stringify(exp),JSON.stringify(got));
    check('3 總圖 選 '+KEYS[k]+'：只有 econ 記得 KNOWS_ECON_YEAR；沒有全域旗標',has('heroine_01','KNOWS_ECON_YEAR')===(k===1)&&G.flags.ECON_PAST_SHARED===undefined);
    check('3 總圖 選 '+KEYS[k]+'：沒有舊句子；下午照樣結束（LIBRARY_AFTERNOON）',oldIn(L).length===0&&G.flags.afternoonDone===true&&has('heroine_01','LIBRARY_AFTERNOON'),oldIn(L).join('、')); }
  // ---------- 3b 以安要聯絡方式（交付清單 A19 的前提，AA 2026-10-14）：兩條路線的結尾 ----------
  { fresh(); pick={law88:0,why:1}; await D2.cafeScene(GM); const L=lines(); const i=L.indexOf('今天……謝謝。');
    check('3b Café 的結尾：「今天……謝謝。」之後以安「你的聯絡方式給我。筆記我拍給你。」、記 AN_CONTACT_DAY2＝那一天',i>=0&&L[i+1]==='你的聯絡方式給我。筆記我拍給你。'&&G.flags.AN_CONTACT_DAY2===G.day,JSON.stringify(L.slice(-3)));
    fresh({plan:'library',walkCk:{soc:true}}); G.zone='library_hall'; pick={law88:0,why:1}; await D2.libraryScene(GM); const L2=lines(); const j=L2.indexOf('（小聲）我再待一下。今天……謝謝。');
    check('3b 總圖的結尾（小聲版）：以安「（小聲）你的聯絡方式給我。筆記我拍給你。」、記 AN_CONTACT_DAY2',j>=0&&L2[j+1]==='（小聲）你的聯絡方式給我。筆記我拍給你。'&&G.flags.AN_CONTACT_DAY2===G.day,JSON.stringify(L2.slice(-3))); }
  // ---------- 4 以安的記憶：人物面板讀得出來（只在 econ）----------
  { fresh(); pick={law88:0,why:1}; await D2.cafeScene(GM); const d=SOCIAL.describe('heroine_01');
    check('4 econ 之後：以安的人物面板寫「知道你念過經濟系」',/知道你念過經濟系/.test(d),d);
    fresh(); pick={law88:0,why:3}; await D2.cafeScene(GM); const d2=SOCIAL.describe('heroine_01');
    check('4 own 之後：以安的人物面板沒有經濟系',!/經濟/.test(d2),d2); }
  // ---------- 5 程式碼與資料：舊句子、以安的家庭欄 ----------
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    /* 別的事件合法用到同樣的字（經濟系寒假 E24 可昕「我媽說我寒假胖了。」，BB_104 8b-16；BB_179 段 E 改短）：先拿掉這幾句再搜尋 */
    const LEGIT=['我媽說我寒假胖了。','我媽說她不好意思拒絕。','我媽說今年要包一百個。'];   /* 法服值班民眾第 6 件（AA_184）；阿哲的大二過年（AA_143 2-1，AA-B 9035ede0）*/ const src2=LEGIT.reduce((a,w)=>a.split(w).join(''),src);
    check('5 story3d.js 整個檔案搜尋不到：'+OLD.join('、')+'（不算 '+LEGIT.join('、')+'）',oldIn([src2]).length===0,oldIn([src2]).join('、'));
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
    check('7-2 第二天之前的舊存檔：讀進來以後走到路上的觸發點，播新版走路台詞、記下 whyWalkNew',G.flags.walkCk.road===true&&G.flags.whyWalkNew===true,JSON.stringify({walkCk:G.flags.walkCk,whyWalkNew:G.flags.whyWalkNew}));
    G.hour=14.2; G.zone='cafe'; pick={law88:1,why:1}; said=[]; opts=[]; await D2.cafeScene(GM); const L=lines();
    check('7-2 第二天之前的舊存檔：第二天照新版演（「說來話長」、新選項、econ 記得、「現實裡」）',L.includes('欸，剛剛路上你說「說來話長」。我們有一整個下午。')&&G.flags.whyLaw==='econ'&&has('heroine_01','KNOWS_ECON_YEAR')&&L.some(t=>/現實裡每天都有人說/.test(t))&&oldIn(L).length===0,oldIn(L).join('、')); }
  // 7-3 已經演過 ev_an_mother 的：不會再演、記憶留著、人物面板讀得出來
  { fresh({afternoonDone:true,whyLaw:'ok'}); G.zone='campus'; G.hour=18; G.day=15; G.events.done.ev_an_mother=1; G.events.last.ev_an_mother=11; SOCIAL.adjust('heroine_01',{fam:30,trust:20});
    SOCIAL.remember('heroine_01','TALKED_FAMILY','她媽媽是書記官');
    const snap=JSON.parse(JSON.stringify(G)); G=snap; SOCIAL.bind(G); EVENTS.bind(GM); const ev=STORY_EVENTS.find(e=>e.id==='ev_an_mother'); let d='';
    try{ d=SOCIAL.describe('heroine_01'); }catch(e){ d='例外 '+e.message; }
    check('7-3 演過 ev_an_mother 的舊存檔：讀得進來、不會再演、記憶照舊（已經演過的舊存檔不改，AA_120 7-5）',EVENTS.check(ev)===false&&G.events.done.ev_an_mother===1&&has('heroine_01','TALKED_FAMILY')&&/聊過家裡的事/.test(d),d);
    check('7-3 人物面板只寫「聊過家裡的事」，不顯示舊備註（存檔裡的備註不改，AA 2026-10-14）',!/書記官/.test(d)&&G.social.mem.heroine_01.some(m=>m.tag==='TALKED_FAMILY'&&m.note==='她媽媽是書記官'),d);
    SOCIAL.remember('heroine_01','LATE_NIGHT_TALK','聊到很晚'); const d2=SOCIAL.describe('heroine_01');
    check('7-3 不是停用事件留下的備註照常顯示',/深夜聊過（聊到很晚）/.test(d2),d2); }
  // 7-4 舊版走到一半存的檔（聽過舊的走路台詞、還沒到店裡）：到 Café／總圖用不提「說來話長」的問句（AA 2026-10-14）；也涵蓋沒經過觸發點就到店裡的玩家
  { fresh(); delete G.flags.whyWalkNew; pick={law88:0,why:2}; await D2.cafeScene(GM); const L=lines(), whyOpts=opts.find(o=>o.some(t=>/翻民法/.test(t)))||[];
    check('7-4 Café：沒聽過新版走路台詞 → 「欸，剛剛路上那個問題——為什麼是法律系？我們有一整個下午。」，四個選項、key 照舊',L.includes('欸，剛剛路上那個問題——為什麼是法律系？我們有一整個下午。')&&!L.some(t=>/說來話長/.test(t))&&JSON.stringify(whyOpts)===JSON.stringify(CAFE_OPTS)&&G.flags.whyLaw==='help',JSON.stringify(L.filter(t=>/剛剛路上/.test(t))));
    fresh({plan:'library',walkCk:{soc:true}}); delete G.flags.whyWalkNew; G.zone='library_hall'; pick={law88:0,why:3}; await D2.libraryScene(GM); const L2=lines();
    check('7-4 總圖：沒聽過新版走路台詞 → 「（小聲）剛剛路上那個問題……小聲講，可以講短一點。」',L2.includes('（小聲）剛剛路上那個問題……小聲講，可以講短一點。')&&!L2.some(t=>/說來話長/.test(t))&&G.flags.whyLaw==='own',JSON.stringify(L2.filter(t=>/剛剛路上/.test(t)))); }
  // ---------- 8 開局 ----------
  { fresh(null,'阿明'); pick={law88:0,why:1}; await D2.cafeScene(GM);
    check('8 自訂名字「阿明」：祐廷自己說的「一歲。」「不要。」對話框寫「阿明」',said.filter(s=>s.t==='一歲。'||s.t==='不要。').every(s=>s.who==='阿明')&&said.filter(s=>s.who==='阿明').length===2,JSON.stringify(said.filter(s=>s.t==='一歲。'||s.t==='不要。')));
    const nm=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8').match(/S\.newGame=async function/g)||[];
    check('8 新遊戲只有一種開局（STORY.newGame）：第一天 21:12 宿舍；第二天才有這段對話',nm.length===1);
    // 第二天下課後以安的邀約（meetAn）：三種選法都從新遊戲的狀態開始（第二天、上完課、還沒有 plan）
    for(const [inv,plan] of [[0,'cafe'],[1,'library'],[2,null]]){ fresh({plan:undefined,companion:undefined,walkCk:undefined}); G.zone='campus'; G.hour=12.1; GM.npc={}; pick={law88:0,why:0,invite:inv}; await D2.meetAn(GM); const L=lines();
      if(plan) check('8 下課後的邀約選「'+(plan==='cafe'?'咖啡廳':'總圖')+'」：一起走、路上的對話照新版（plan='+plan+'）、還沒有 whyLaw（坐下來才問）',G.flags.plan===plan&&G.flags.companion==='an'&&G.flags.whyLaw===undefined&&oldIn(L).length===0&&D2.walkChecks(G.flags.plan)[0].lines[1][1]==='……說來話長。你呢？',JSON.stringify({plan:G.flags.plan,companion:G.flags.companion}));
      else check('8 下課後的邀約選「改天」：沒有走路／Café／總圖的對話，whyLaw 沒設（之後讀成 null）、以安沒有記得經濟系',G.flags.anSkipped===true&&G.flags.plan===undefined&&G.flags.whyLaw===undefined&&STORY.whyLawKey(G.flags)===null&&!has('heroine_01','KNOWS_ECON_YEAR')&&oldIn(L).length===0,JSON.stringify({anSkipped:G.flags.anSkipped,plan:G.flags.plan})); } }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
