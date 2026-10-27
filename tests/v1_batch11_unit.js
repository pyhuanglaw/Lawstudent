// 交接包 v1（大一上）第 11 批：颱風假（交付清單 B3，BB_110 第 2 節）——不需要瀏覽器。
// 檢查（修改前都會失敗）：
//   日曆：大一上第 7 週週一（2025-10-13，第 27 天）是颱風假（CALENDAR.typhoon、holiday＝「颱風假」）；前後一天不是。
//   停課：那天沒有課（憲法（上）不上、HUD「今天放假（颱風假），沒有課」）、活動不辦；前一週的週一照常有憲法。
//   天氣：睡到颱風假那天早上一定下雨（sleepNow）；別的日子照舊隨機。
//   T1b（手機）：前一晚 21:00 張教授的信（通知）；21:20～21:32 麵店團群組四則（那天以前就在群組裡才有）；最後一則可以回三種，各自的回覆照 BB_110；
//     沒在群組＝只有信；睡著／跳過時間＝隔天補收在原本的時間；颱風假過了不能再回。
//   T1a（宿舍）：颱風假晚上 18–23 點在宿舍房間才開始（其他時間、其他地方、別的週一都不會）；見過方奕廷才有他那三句（沒見過＝跳過）；
//     三個選項的阿凱回應照 BB_110；「看情況。」記 SAID_DEPENDS（阿凱）；只一次；生活 CG BCG-18 在方奕廷進來那一句（沒見過他＝不放）；前一晚 20:30 新聞通知。
//   明軒的三色螢光筆（聖誕抽到）放在房間：「看看房間」多一樣，旁白照 BB（有綠色螢光筆的另一句）。
// 用法：node tests/v1_batch11_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|OUT|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) load(f);
{ const src=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=/^const CG_REGISTRY=(\{.*\});$/m.exec(src); global.CG_REGISTRY=m?eval('('+m[1]+')'):{}; }
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(id){ cgs.push({id,at:said.length}); return true; },setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,t)=>{ caps.push(t); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; E.player.obj.position.x=0; E.player.obj.position.z=0; };
const keepOn=(day,hour,zone,flags)=>{ const ev=G.events, soc=G.social, msgs=G.msgs, phone=G.phone, contacts=G.contacts, ch=G.choices, act=G.activities; fresh(day,hour,zone,Object.assign({},G.flags,flags||{})); G.events=ev; G.social=soc; SOCIAL.bind(G); if(msgs) G.msgs=msgs; if(phone) G.phone=phone; if(contacts) G.contacts=contacts; G.choices=ch; if(act) G.activities=act; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const npc=(id,x,z)=>{ const n={id,charId:id,name:id,obj:{position:{x,y:0,z}},seat:null,lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const tickEv=()=>{ const r=EVENTS.tick(0.1); return r; };
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const WHO=['heroine_01','heroine_03','zhe','classmate_bohan','classmate_xinci','yu','classmate_mingxuan'];

(async()=>{
  const TY=termDay(7,1), EVE=TY-1, MON6=termDay(4,1);   /* 對照：第 4 週週一（第 5、6 週的週一是教師節補假、中秋節）*/
  /* ---------- 日曆、停課、活動 ---------- */
  { const k=d=>CALENDAR.dateOf(d).key;
    check('日曆：大一上第 7 週週一＝2025-10-13（第 27 天）是颱風假',TY===27&&k(TY)==='2025-10-13'&&CALENDAR.typhoon(TY)&&CALENDAR.holiday(TY)==='颱風假',JSON.stringify({TY,key:k(TY),h:CALENDAR.holiday(TY)}));
    check('日曆：前一天（週日）、後一天（週二）不是颱風假',!CALENDAR.typhoon(EVE)&&!CALENDAR.typhoon(TY+1)&&CALENDAR.holiday(TY+1)===null);
    fresh(TY,9,'dorm',{}); const its=CLS.dayItems(G,TY); fresh(MON6,9,'dorm',{}); const its6=CLS.dayItems(G,MON6);
    check('停課：颱風假沒有課；平常的週一（第 4 週）有憲法（上）',its.length===0&&its6.some(it=>it.c.id==='const_1'),JSON.stringify({ty:its.map(it=>it.c.id),w6:its6.map(it=>it.c.id)}));
    fresh(TY,9,'dorm',{}); check('停課：HUD「今天放假（颱風假），沒有課」',CLS.todayLine(G)==='今天放假（颱風假），沒有課',CLS.todayLine(G));
    const acts=(typeof ACTIVITIES!=='undefined'&&ACTIVITIES.on)?ACTIVITIES.on(G,TY):null; if(acts) check('停課：活動不辦',!acts.length,JSON.stringify(acts.map(a=>a.id))); }
  /* ---------- 天氣 ---------- */
  { const sleepTo=async(day)=>{ fresh(day-1,23,'dorm',{}); G.weather='clear'; Object.assign(GM,{titleCard:async()=>{},enter:async()=>{},money(){},memo(){}}); E.setWeather=()=>{}; await STORY.sleepNow(GM,7.5); return {day:G.day,w:G.weather}; };
    let ok=true, other=new Set(); for(let n=0;n<12;n++){ const r=await sleepTo(TY); if(r.day!==TY||r.w!=='rain') ok=false; } for(let n=0;n<25;n++){ const r=await sleepTo(MON6); other.add(r.w); }
    check('天氣：睡到颱風假那天早上一定下雨（12 次）',ok); check('天氣：別的日子照舊隨機（第 4 週週一 25 次不全是雨）',other.size>1||!other.has('rain'),JSON.stringify([...other])); }
  /* ---------- T1b：前一晚的信與群組 ---------- */
  const tyMsgs=()=>G.msgs.filter(m=>/^ty1_/.test(m.tag||'')).map(m=>({tag:m.tag,day:m.day,h:m.h,th:m.th,from:m.from,name:m.name,text:m.text,ask:!!m.ask}));
  const joinOn=d=>{ PHONE.join(G,'noodle_team','麵店團'); PHONE.rec(G).groups.noodle_team.day=d; };
  { fresh(EVE,20.5,'dorm',{}); joinOn(EVE-3); run(20.5,21.7); const M=tyMsgs();
    const news=M.find(m=>m.tag==='ty1_news');
    check('T1b：前一晚 20:30 新聞通知「明天停止上班上課。」（BB 2026-10-14 照 AA 建議加）',!!news&&news.day===EVE&&news.h===20.5&&news.th==='sys'&&news.name==='新聞'&&news.text==='明天停止上班上課。',JSON.stringify(news));
    const mail=M.find(m=>m.tag==='ty1_mail');
    check('T1b：前一晚 21:00 張教授的信（通知）：「明日停課。附件為明日進度的講義，共四十二頁，請自行閱讀。」',!!mail&&mail.day===EVE&&mail.h===21&&mail.th==='sys'&&mail.name==='張教授（信）'&&mail.text==='明日停課。附件為明日進度的講義，共四十二頁，請自行閱讀。',JSON.stringify(mail));
    const g=M.filter(m=>m.th==='g:noodle_team');
    const WANTG=[['zhe',20,'四十二頁 颱風比較仁慈'],['yu',24,'我讀完第一頁了。第一頁是目錄。'],['classmate_bohan',31,'我讀到第十二頁。'],['zhe',32,'……你是颱風嗎？']];   /* 時間：手機每次檢查時送出，差 run() 的一步（3 分鐘）以內 */
    check('T1b：麵店團群組 21:20 阿哲、21:24 Alison、21:31 柏翰、21:32 阿哲（照 BB_110 的字）',g.length===4&&g.every((m,k)=>m.from===WANTG[k][0]&&m.text===WANTG[k][2]&&m.day===EVE&&Math.abs(m.h*60-21*60-WANTG[k][1])<=3.01),JSON.stringify(g.map(m=>[m.from,m.h,m.text])));
    const last=G.msgs.find(m=>m.tag==='ty1_g4'); check('T1b：最後一則可以回三種',!!last&&!!last.ask&&last.ask.opts.map(o=>o.t).join('／')==='「我讀到第三頁。」／「我在吃泡麵。」／（貼一張颱風的貼圖）',last&&JSON.stringify(last.ask.opts.map(o=>o.t)));
    const WANT=[['我讀到第三頁。','classmate_bohan','很好。','page3'],['我在吃泡麵。','zhe','這才是正確的颱風假','noodle'],['🌀（颱風的貼圖）','yu','這張貼圖比講義有用。','sticker']]; const bad=[];
    for(let k=0;k<3;k++){ fresh(EVE,20.5,'dorm',{}); joinOn(EVE-3); run(20.5,21.7); const m=G.msgs.find(x=>x.tag==='ty1_g4'); const r=PHONE.answer(G,m.ask.id,k); const out=r&&r.out.map(x=>[x.from,x.text]);
      if(!r||JSON.stringify(out)!==JSON.stringify([['player',WANT[k][0]],[WANT[k][1],WANT[k][2]]])||G.flags.TY1_REPLY!==WANT[k][3]) bad.push(k+':'+JSON.stringify(out)); }
    check('T1b：三種回覆各自的回應（柏翰「很好。」／阿哲「這才是正確的颱風假」／Alison「這張貼圖比講義有用。」）',!bad.length,bad.join(' ')); }
  { fresh(EVE,20.5,'dorm',{}); run(20.5,21.7); const M=tyMsgs(); check('T1b：沒在麵店團群組＝只有新聞通知和張教授的信',M.map(m=>m.tag).join()==='ty1_news,ty1_mail',JSON.stringify(M.map(m=>m.tag))); }
  { fresh(EVE,20.5,'dorm',{}); joinOn(TY); run(20.5,21.7); const M=tyMsgs(); check('T1b：颱風假當天才加入群組＝看不到前一晚的群組訊息（只有新聞和信）',M.map(m=>m.tag).join()==='ty1_news,ty1_mail',JSON.stringify(M.map(m=>m.tag))); }
  { fresh(TY,9,'dorm',{}); joinOn(EVE-3); run(9,9.2); const M=tyMsgs();
    check('T1b：前一晚睡著了（颱風假早上才看手機）＝新聞、信和群組都補收、時間是前一晚',M.length===6&&M.every(m=>m.day===EVE&&m.h>=20.5&&m.h<21.6),JSON.stringify(M.map(m=>[m.tag,m.day,m.h])));
    G.day=TY+1; G.hour=9; const m=G.msgs.find(x=>x.tag==='ty1_g4'); check('T1b：颱風假過了（隔天）就不能回了',!PHONE.askOpen(G,m)&&PHONE.answer(G,m.ask.id,0)===null); }
  { fresh(TY+3,9,'dorm',{}); joinOn(EVE-3); run(9,9.2); check('T1b：颱風假之後才玩到（例如讀到之後的存檔）＝不補這些訊息',!tyMsgs().length); }
  /* ---------- T1a：泡麵之夜 ---------- */
  const T1A=ev('ev_typhoon_noodles_y1');
  { const can=(day,hour,zone)=>{ fresh(day,hour,zone,{}); return EVENTS.check(T1A); };
    check('T1a：颱風假晚上 19:00 在宿舍房間＝會開始',can(TY,19,'dorm'));
    check('T1a：颱風假 17:00、23:30 不會；不在宿舍房間（校園、麵店）不會；別的週一晚上不會',!can(TY,17,'dorm')&&!can(TY,23.5,'dorm')&&!can(TY,19,'campus')&&!can(TY,19,'noodle')&&!can(MON6,19,'dorm'));   /* 別的週一＝第 4 週 */ }
  const KAI={yes:'這個推論有問題，但我接受。',no:'你好無情。……拿去。',dep:'又來了。……好啦，拿去。'};   /* AA_207 附錄 §2：「你們法律系每次都這樣。」改 */
  const FANG=['（抱著一盆植物進來）放陽台會被吹倒，先放你們這邊一晚。','……你帶一盆植物來吃泡麵？','它不用吃啦，放角落就好。'];   /* AA_207 §5（BB_167 SC4 第 39 列）*/
  const t1a=async(knowFang,pick)=>{ fresh(TY,19,'dorm',{}); cgs=[]; if(knowFang) meet('npc_fangyt'); picks=[pick]; await EVENTS.run(T1A); return {L:lines(),who:said.map(s=>s.who),F:G.flags,O:opts,cg:cgs.slice()}; };
  { let r=await t1a(true,'算');
    check('T1a：見過方奕廷＝阿凱「我上禮拜就囤了二十包。你看，有用吧。」、方奕廷三句、阿凱「欸，颱風天泡麵，算不算你們說的那個……不可抗力？」（AA_207 附錄 §2）',r.L[0]==='我上禮拜就囤了二十包。你看，有用吧。'&&FANG.every(t=>r.L.includes(t))&&r.L.includes('欸，颱風天泡麵，算不算你們說的那個……不可抗力？'),JSON.stringify(r.L.slice(0,5)));
    check('T1a：見過方奕廷＝生活 CG BCG-18（cg_typhoon_noodles）在他進來那一句出現（之前只有阿凱第一句）、登錄的是正式檔',r.cg.length===1&&r.cg[0].id==='cg_typhoon_noodles'&&r.cg[0].at===1&&r.L[1]==='（抱著一盆植物進來）放陽台會被吹倒，先放你們這邊一晚。'&&CG_REGISTRY.cg_typhoon_noodles&&CG_REGISTRY.cg_typhoon_noodles.file==='assets/cg/kai/event_typhoon_noodles.webp'&&fs.existsSync(path.join(ROOT,CG_REGISTRY.cg_typhoon_noodles.file)),JSON.stringify(r.cg));
    check('T1a：三個選項照 BB_110',JSON.stringify(r.O[0])===JSON.stringify(['「算。所以你要分我。」','「不算。這是你自己囤的。」','「看情況。」']),JSON.stringify(r.O[0]));
    check('T1a：「算。」→「這個推論有問題，但我接受。」、不記 SAID_DEPENDS；記 TYPHOON_Y1',r.L.includes(KAI.yes)&&!r.L.includes(KAI.no)&&!SOCIAL.has('kai','SAID_DEPENDS')&&r.F.TYPHOON_Y1===true);
    r=await t1a(true,'不算'); check('T1a：「不算。」→「你好無情。……拿去。」',r.L.includes(KAI.no)&&!r.L.includes(KAI.yes)&&!SOCIAL.has('kai','SAID_DEPENDS'));
    r=await t1a(true,'看情況'); check('T1a：「看情況。」→「又來了。……好啦，拿去。」＋記 SAID_DEPENDS（阿凱，大二 F2 用）',r.L.includes(KAI.dep)&&SOCIAL.has('kai','SAID_DEPENDS'));
    r=await t1a(false,'算'); check('T1a：沒見過方奕廷＝不放 BCG-18（圖裡有他；BB 2026-10-14 同意）',!r.cg.length,JSON.stringify(r.cg));
    check('T1a：沒見過方奕廷＝他那三句都跳過，其他照舊',!FANG.some(t=>r.L.includes(t))&&r.L[0]==='我上禮拜就囤了二十包。你看，有用吧。'&&r.L.includes('欸，颱風天泡麵，算不算你們說的那個……不可抗力？')&&r.L.includes(KAI.yes),JSON.stringify(r.L));
    check('T1a：沒見過方奕廷＝演完也還是沒見過（不會因為這個事件變成認識）',!STORY.knows('npc_fangyt',G));
    fresh(TY,19,'dorm',{}); picks=['算']; await EVENTS.run(T1A); G.hour=20; check('T1a：只一次（演完再檢查不會開始）',!EVENTS.check(T1A)); }
  /* ---------- 明軒的三色螢光筆放在房間（BB_95 3-6b，BB 2026-10-14 的旁白）---------- */
  { const HL='明軒送的三色螢光筆。他說他用不到。', HLG='明軒送的三色螢光筆，和上次那支綠的放在一起。他說他用不到。';
    const look=async(flags)=>{ fresh(TY+60,21,'dorm',flags); picks=['三色螢光筆']; await STORY.interact({roomItems:true,label:'看看房間'},GM); return {L:lines(),O:opts[0]||[]}; };
    let r=await look({}); check('房間：沒抽到明軒的禮物＝沒有螢光筆',!r.O.some(t=>/螢光筆/.test(t)),JSON.stringify(r.O));
    r=await look({XMAS_HL3:true}); check('房間：抽到明軒的禮物＝「桌上的三色螢光筆」→「明軒送的三色螢光筆。他說他用不到。」',r.O.includes('桌上的三色螢光筆')&&r.L.includes(HL),JSON.stringify({O:r.O,L:r.L}));
    r=await look({XMAS_HL3:true,GREEN_HIGHLIGHTER:true}); check('房間：也有綠色螢光筆＝「明軒送的三色螢光筆，和上次那支綠的放在一起。他說他用不到。」',r.L.includes(HLG)&&!r.L.includes(HL),JSON.stringify(r.L)); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
