// 學姊 W8「今天先不改了」＋W9「她沒有去面試」（BB_97 2-3、2-4；AA_177 第 8 節；任務 V3-B04、V3-B05）——不需要瀏覽器。
// 檢查：W8 的時間（第 12 週週一二四 19～22、Café）與前置（朋友以上，或 NOTICED_HER／HELPED／GAVE_HER_NOTE）、HEARD_PROF_XU 兩版、四個選項、必要 CG「熱水」、HOT_WATER；沒演到的玩家 11/27 的兩則訊息；STORY.sisW8（演過或過了第 12 週）；W9 11/28 9～10 點總圖門口、三個選項、結尾、SKIPPED_INTERVIEW。用法：node tests/v3_sis_w8_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const R=(id,fam,trust,comf)=>{ const r=SOCIAL.rel(id); r.fam=fam; r.trust=trust||0; r.comf=comf||0; };
const LV={ACQ:[10],FAM:[25],FRI:[45,30],CLO:[65,50,45]};
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const TH=(th)=>(G.msgs||[]).filter(m=>m.th===th);
const txt=(th)=>TH(th).map(m=>(m.from||'')+':'+m.text);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
const D=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
let cards=[], entered=[];
GM.titleCard=async(a,b)=>{ cards.push([a,b]); }; GM.enter=async(z)=>{ entered.push(z); G.zone=z; };
GM.money=function(n){ G.money+=n; };

(async()=>{
  const fs2=require('fs'); const NM={'溫書瑀':'學姊','溫學姊':'學姊','不認識的女生':'學姊'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const W8=ev('ev_sis_collapse'), W9=ev('ev_sis_skip_interview');
  check('0. W8、W9 作廢（BB_207 第 1 節：W8 的熱水搬到大一上 ev_sis_hot_water；推甄整段取消）：retired，定義留給舊存檔',!!W8&&!!W8.retired&&W8.title==='今天先不改了'&&!!W9&&!!W9.retired);
  const mon=termDay('Y2S1',12,1), wed=termDay('Y2S1',12,3), thu=termDay('Y2S1',12,4);
  const at8=(day,hh,setup)=>{ fresh(day,hh,'cafe'); meet('heroine_05'); if(setup) setup(); return EVENTS.check(W8); };
  check('1. W8 作廢：第 12 週週一 20:00 Café、朋友也不演',!at8(mon,20,()=>R('heroine_05',...LV.FRI)));
  const play8=async(pick,xu)=>{ fresh(thu,20,'cafe'); meet('heroine_05'); R('heroine_05',...LV.FRI); if(xu) SOCIAL.remember('heroine_05','HEARD_PROF_XU',''); said=[]; opts=[]; picks=[pick]; const cg=[]; const c0=ADV.cg; ADV.cg=id=>{ cg.push(id); }; try{ await EVENTS.run(W8); } finally { ADV.cg=c0; } return {L:L0(),O:opts[0]||[],cg}; };
  let r=await play8(0,true);
  check('2. 開場旁白、「你怎麼會在這。」；有 HEARD_PROF_XU＝「我改了七次。許老師說得對。」；四個選項',r.L[0]==='（吧檯旁的單人座。研究計畫攤開，紅筆劃了半頁。保溫瓶是空的。）'&&r.L[1]==='學姊：你怎麼會在這。'&&r.L.includes('學姊：我改了七次。許老師說得對。')&&r.O.length===4,JSON.stringify(r));
  check('2. 「那妳想做什麼？」→「……我不知道。」「說『不知道』的感覺，還不錯。」；SHARED_SECRET、信任 +9',r.L.includes('學姊：……我不知道。')&&r.L.includes('學姊：說『不知道』的感覺，還不錯。')&&SOCIAL.has('heroine_05','SHARED_SECRET')&&SOCIAL.rel('heroine_05').trust>=LV.FRI[1]+9);
  check('2. 結尾兩句「明天我還是會列三件事。」「今天，先列到二。」',r.L.slice(-2).join('｜')==='學姊：明天我還是會列三件事。｜學姊：今天，先列到二。');
  r=await play8(3,false);
  check('3. 沒有 HEARD_PROF_XU：「我改了七次。今天被問了一句話，我答不出來。」；熱水：「……是熱水。」祐廷「嗯。」「好。今天就喝這個。」；HELPED、HOT_WATER',r.L.includes('學姊：我改了七次。今天被問了一句話，我答不出來。')&&!r.L.some(t=>/許老師/.test(t))&&r.L.includes('學姊：……是熱水。')&&r.L.includes('祐廷：嗯。')&&r.L.includes('學姊：好。今天就喝這個。')&&G.flags.HOT_WATER===true&&SOCIAL.has('heroine_05','HELPED'),JSON.stringify(r.L));
  const cgs=[]; for(const k of [0,1,2,3]){ const x=await play8(k,true); cgs.push(x.cg.includes('cg_hot_water_heroine05')||x.L.length>0&&G.cg&&false); }
  const reg=typeof CG_REGISTRY!=='undefined'?CG_REGISTRY:null; const src=fs2.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8');
  check('4. 必要 CG「熱水」（BCG-01）：四個選項都有 {cg} 那一行、登記在 CG_REGISTRY、圖檔在',W8.dialogue.filter(l=>l.cg==='cg_hot_water_heroine05').length===1&&W8.dialogue.findIndex(l=>l.cg)>W8.dialogue.findIndex(l=>l.label==='d')&&/cg_hot_water_heroine05:\{file:'assets\/cg\/heroine_05\/cg_hot_water\.webp'/.test(src)&&fs2.existsSync(path.join(ROOT,'assets/cg/heroine_05/cg_hot_water.webp')));
  r=await play8(1,true); const r2=await play8(2,true);
  check('4. 「學姊，妳只是累了。」→「我只是累了。這句話我以前不讓自己說。」；「今天不要改了。」→「我剛剛就這樣說了。」「……我要回家了。你也早點回去。」（不寫兩個人的夜路）',r.L.includes('學姊：我只是累了。這句話我以前不讓自己說。')&&r2.L.includes('學姊：我剛剛就這樣說了。')&&r2.L.includes('學姊：……我要回家了。你也早點回去。')&&SOCIAL.has('heroine_05','TOLD_HER_STOP'));
  check('4. 不崩潰、不哭、不寫「不想念法律」；表情沒有 sad、annoyed',!W8.dialogue.some(l=>/不想念法律|哭/.test(l.text||''))&&!W8.dialogue.some(l=>['sad','annoyed'].includes(l.expression)));
  // 5. sisW8
  fresh(termDay('Y2S1',12,5),10,'campus'); const a=STORY.sisW8(G); G.events.done.ev_sis_collapse=1; const b=STORY.sisW8(G); fresh(termDay('Y2S1',13,1),10,'campus'); const c=STORY.sisW8(G);
  check('5. STORY.sisW8：第 12 週沒演＝還沒；演過＝之後；第 13 週起不管有沒有演都算之後（AA_177 第 8 節①）',!a&&b&&c);
  // 6. 11/27 的兩則
  const d27=D('2026-11-27'); fresh(d27,20,'campus'); PHONE.join(G,'lawclub_study','法服讀書會'); PHONE.join(G,'family_law','法律系直屬家族'); run(20,21.2);
  const m1=txt('g:lawclub_study'), m2=txt('g:family_law');
  check('6. 沒演到 W8：11/27 的兩則都刪（讀書會群組她請假；家族群組 Kevin「學姊請假了？？」——AA-C 2af03a63）',!m1.some(t=>/請假/.test(t))&&!m2.some(t=>/請假/.test(t)),JSON.stringify([m1,m2]));
  fresh(d27,20,'campus'); G.events.done.ev_sis_collapse=1; PHONE.join(G,'lawclub_study','法服讀書會'); run(20,21.2); check('6. 演過 W8：沒有那兩則',!txt('g:lawclub_study').some(t=>/請假/.test(t)));
  // 7. W9
  const d28=D('2026-11-28'); const at9=(hh,lv)=>{ fresh(d28,hh,'campus'); meet('heroine_05'); R('heroine_05',...lv); return EVENTS.check(W9); };
  check('7. W9 作廢：11/28 9:30 有點熟也不演',CALENDAR.termOf(d28).week===12&&wdOf(d28)===6&&!at9(9.5,LV.FAM));
  { fresh(d28,9.5,'campus'); const e=STORY.schedEnt(CHARACTERS.heroine_05,G); check('7. 那天 9～10 點她不在總圖門口的台階（W9 的作息拿掉）',!e||!(e.at&&e.at[0]===83),JSON.stringify(e)); }
  const play9=async(pick)=>{ fresh(d28,9.5,'campus'); meet('heroine_05'); R('heroine_05',...LV.FAM); said=[]; opts=[]; picks=[pick]; await EVENTS.run(W9); return L0(); };
  let w=await play9(0); check('7. 「現在去還來得及。」→「我知道。」「她沒有動。」…；結尾「我會再考一次。一般考試，二月。」「這次，我要先想好為什麼。」；SKIPPED_INTERVIEW',w[0]==='學姊：面試九點半。'&&w.includes('學姊：我知道。')&&w.includes('她沒有動。')&&w.slice(-2).join('｜')==='學姊：我會再考一次。一般考試，二月。｜學姊：這次，我要先想好為什麼。'&&SOCIAL.has('heroine_05','SKIPPED_INTERVIEW'),JSON.stringify(w));
  w=await play9(2); check('7. 「我要進去念書。」→「我也進去。」、手錶放進口袋',w.includes('學姊：我也進去。')&&w.some(t=>/把手錶拿下來，放進口袋/.test(t)));
  /* 立繪：W9 學姊每一句都用面試的西裝（heroine_05/formal，LAWWW2-B 4e812ce5、BB-B ART_APPROVED）；立繪清單有 formal 的三種表情 */
  { const sl=W9.dialogue.filter(l=>l.speaker==='heroine_05'); check('W9：學姊 '+sl.length+' 句都是 outfit formal',sl.length>0&&sl.every(l=>l.outfit==='formal'));
    const fs=require('fs'), mf=fs.readFileSync(path.join(ROOT,'src/data/portrait_manifest.js'),'utf8'); check('立繪清單有 heroine_05/formal 的 neutral、serious、smile',/"formal":\s*\[\s*"neutral",\s*"serious",\s*"smile"\s*\]/.test(mf)&&['neutral','serious','smile'].every(e=>fs.existsSync(path.join(ROOT,'assets/portraits/heroine_05/formal/'+e+'.webp')))); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
