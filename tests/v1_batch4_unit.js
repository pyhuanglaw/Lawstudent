// 交接包 v1（大一上）第 4 批：BB 的新事件（BB_95 第 3 節）——不需要瀏覽器。
// 檢查（修改前都會失敗：事件、睡覺觸發、房間物件都不存在）：
//   F1 方奕廷的黃金葛（3-1）：平日 12–13 在校園和他說話才觸發（週六、14 點、在宿舍都不會）、只一次；五句台詞與三個選項的回答（BB_95 原文）；
//     記 FIRST_MET；之後宿舍書桌旁多一個「黃金葛」互動點（不重複加）；每週澆一次（同一週第二次是「這週澆過了」，下一週又可以澆）；
//     沒澆也不會枯（幾週不澆照樣在、照樣可以澆）。
//   K1 阿凱凌晨三點的螢幕（3-2）：睡覺觸發——大一上第 3～4 週、平日晚上、隔天早上有課才有（週五晚上隔天沒課、第 5 週、三點以後才睡、第一二天都沒有）；
//     sleepNow 裡在天亮之前演、演完照常到隔天早上；旁白與「……喔。」照 BB_95 原文；只一次。
//     說了「我明天早八」→ 隔天晚上（18 點後進宿舍）螢幕調暗、換鍵盤（當天晚上不會）；書桌下的盒子：「靜音軸。這個很貴喔。」阿凱「……我本來就想換。」、
//     記憶 HELPED（為你換鍵盤）、看過就收起來；阿凱不在房間時只有前一句、不記憶。
//     蓋棉被／戴耳塞 → 一週後的晚上阿凱「你黑眼圈好重，是我嗎。」（第 6 天不會、阿凱不在不會）→ 再隔天晚上換鍵盤（不懲罰，只是晚一點）。
//     現有的「法無明文」（ev_dorm_late_kai）照舊在。
// 用法：node tests/v1_batch4_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], titles=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ titles.push(a+(b?' '+b:'')); },enter:async(z)=>{ G.zone=z; },
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; titles=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const lines=()=>said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const kaiN=()=>({id:'kai',charId:'kai',name:'阿凱',obj:{position:{x:1.8,y:0,z:2.2}},seat:null});
const withKai=()=>{ const n=kaiN(); GM.npc.kai=n; E.npcs=[n]; return n; };
const enterEv=()=>{ const L=STORY_EVENTS.filter(e=>e.trigger==='enter'&&EVENTS.check(e)); return L.length?L[0].id:null; };   /* EVENTS.onEnter 照陣列順序取第一個 */
(async()=>{
  /* ---------- F1 黃金葛 ---------- */
  { const e=ev('ev_fangyt_pothos'); check('F1 事件存在（ev_fangyt_pothos，和方奕廷說話觸發）',!!e&&e.trigger==='interact'&&e.participants[0]==='npc_fangyt');
    const mon=6;   /* 9/22 週一 */
    fresh(mon,12.5,'campus'); const a=EVENTS.check(e); fresh(mon,14,'campus'); const b=EVENTS.check(e); fresh(4,12.5,'campus'); const c=EVENTS.check(e); fresh(mon,12.5,'dorm'); const d=EVENTS.check(e);
    check('F1 平日 12–13 在校園才觸發（14 點、週六、宿舍都不會）',a===true&&b===false&&c===false&&d===false,JSON.stringify({a,b,c,d,sat:wdOf(4)}));
    const F1=['你是隔壁房的吧。我經過的時候看到，你們房間沒有綠色的東西。','（從袋子裡拿出一盆小小的黃金葛）黃金葛。天南星科，耐陰，空氣不好也可以活。','莖節會長氣根，所以可以水耕，也可以土耕，而且——','……總之，很好養。忘記澆也不會死。','跟你室友一樣。'];
    for(const [pick,reply] of [['謝謝學長','不用謝。它比較需要謝謝你。'],['我會養死','不會。我說過了，它很難死。'],['還有幾盆','（笑）七盆。整層樓都要有。']]){
      fresh(mon,12.5,'campus'); picks=[pick]; await EVENTS.run(e); const L=lines();
      check('F1 選「'+pick+'」：五句（BB_95 3-1 原文）＋回答「'+reply+'」、只有這一個回答',JSON.stringify(L)===JSON.stringify(F1.concat([reply])),JSON.stringify(L)); }
    check('F1 三個選項（BB_95 原文）',JSON.stringify(opts[0])===JSON.stringify(['「謝謝學長。」','「我會養死。」','「你袋子裡還有幾盆？」']),JSON.stringify(opts[0]));
    check('F1 之後：POTHOS、記方奕廷 FIRST_MET、只一次',G.flags.POTHOS===true&&SOCIAL.has('npc_fangyt','FIRST_MET')&&EVENTS.check(e)===false);
    /* 宿舍的互動點 */
    const keep=G.flags; fresh(mon,20,'dorm',keep); STORY.dormItems(GM); STORY.dormItems(GM); const its=E.interactables.filter(it=>it.pothos);
    check('F1 宿舍書桌旁多一個「黃金葛」互動點（不重複加）',its.length===1&&its[0].label==='黃金葛',JSON.stringify(its));
    fresh(mon,20,'dorm',{}); STORY.dormItems(GM); check('F1 沒拿到黃金葛的存檔：宿舍沒有這個互動點',!E.interactables.some(it=>it.pothos));
    fresh(mon,20,'dorm',{POTHOS:true}); picks=[0]; await STORY._v1.pothosScene(GM); const w1=G.flags.pothosWaterN; said=[]; await STORY._v1.pothosScene(GM); const L2=lines();
    check('F1 澆水：第一次「你幫黃金葛澆了水。」，同一週第二次「土還是濕的。這週澆過了。」（不能再澆）',w1===1&&L2.join('')==='土還是濕的。這週澆過了。'&&G.flags.pothosWaterN===1,JSON.stringify({w1,L2}));
    G.day=mon+6; said=[]; picks=[0]; await STORY._v1.pothosScene(GM); const sameWk=lines().join(''); G.day=mon+7; said=[]; picks=[0]; await STORY._v1.pothosScene(GM);
    check('F1 週日還是同一週；下一個週一又可以澆',sameWk==='土還是濕的。這週澆過了。'&&G.flags.pothosWaterN===2&&lines().includes('你幫黃金葛澆了水。'),sameWk+' n='+G.flags.pothosWaterN);
    G.day=mon+40; E.interactables=[]; STORY.dormItems(GM); said=[]; picks=[0]; await STORY._v1.pothosScene(GM);
    check('F1 五週沒澆也不會枯：互動點照樣在、照樣可以澆（沒有枯掉的旗標）',E.interactables.some(it=>it.pothos)&&lines().includes('你幫黃金葛澆了水。')&&!Object.keys(G.flags).some(k=>/dead|wither|枯/i.test(k))); }
  /* ---------- K1 凌晨三點的螢幕 ---------- */
  { const e=ev('ev_kai_late_screen'); check('K1 事件存在（ev_kai_late_screen，睡覺觸發）',!!e&&e.trigger==='sleep');
    const at=(day,hour)=>{ fresh(day,hour,'dorm'); return EVENTS.sleepEvent(); };
    const r={mon6:at(6,23.5),tue7:at(7,25.5),fri3:at(3,23),sun5:at(5,23),mon13:at(13,23),late:at(6,27.5),evening:at(6,17)};
    check('K1 第 4 週週一 23:30、週二凌晨 1:30 上床：有（隔天早上有課）',r.mon6===e&&r.tue7===e,JSON.stringify({mon6:!!r.mon6,tue7:!!r.tue7,wk:CALENDAR.termOf(6).week}));
    check('K1 週五（隔天週六沒課）、週日（不是平日晚上）、第 5 週、三點以後才睡、傍晚 17:00 都沒有',!r.fri3&&!r.sun5&&!r.mon13&&!r.late&&!r.evening,JSON.stringify(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,!!v]))));
    for(const d of [1,2]){ fresh(d,23,'dorm'); check('K1 第 '+d+' 天晚上沒有（開場劇情）',!EVENTS.sleepEvent()); }
    /* sleepNow 裡演 */
    fresh(6,23.5,'dorm'); withKai(); picks=['我明天早八']; await STORY.sleepNow(GM,7.5);
    const L=lines(); check('K1 睡覺時演：旁白（BB_95 原文）→ 選項 → 阿凱「（頭沒回）……喔。」',L[0]==='凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天早八。'&&L[1]==='（頭沒回）……喔。'&&JSON.stringify(opts[0])===JSON.stringify(['「阿凱，我明天早八。」','（翻身，用棉被蓋住頭）','（戴耳塞）']),JSON.stringify({L,o:opts[0]}));
    check('K1 畫面是凌晨三點（標題 03:00），演完照常醒在隔天早上（第 7 天 07:30）',titles[0]==='03:00'&&G.day===7&&Math.abs(G.hour-7.5)<0.01,JSON.stringify({titles,day:G.day,hour:G.hour}));
    check('K1 記下選了什麼、哪一晚（kaiScreenChoice 0、kaiScreenDay 6）；只一次',G.flags.kaiScreenChoice===0&&G.flags.kaiScreenDay===6&&(G.hour=23,!EVENTS.sleepEvent()));
    /* 說了 → 隔天晚上換鍵盤 */
    const F0=Object.assign({},G.flags);
    fresh(6,20,'dorm',F0); withKai(); const same=enterEv(); fresh(7,17.5,'dorm',F0); withKai(); const early=enterEv(); fresh(7,19,'dorm',F0); withKai(); const next=enterEv();
    check('K1 說了：隔天晚上 18 點後進宿舍才換鍵盤（當晚、隔天 17:30 都不會）',same!=='ev_kai_keyboard_quiet'&&early!=='ev_kai_keyboard_quiet'&&next==='ev_kai_keyboard_quiet',JSON.stringify({same,early,next}));
    await EVENTS.run(ev('ev_kai_keyboard_quiet')); check('K1 換鍵盤：旁白「螢幕調暗了，鍵盤換成很安靜的一把。」、KAI_SILENT_KB',lines()[0]==='螢幕調暗了，鍵盤換成很安靜的一把。'&&G.flags.KAI_SILENT_KB===true,JSON.stringify(lines()));
    STORY.dormItems(GM); STORY.dormItems(GM); const box=E.interactables.filter(it=>it.kaiBox); check('K1 書桌下的盒子出現（一個）',box.length===1&&box[0].label==='書桌下的盒子');
    const keep=G.flags; GM.npc={}; said=[]; await STORY._v1.kaiBoxScene(GM,box[0]);
    check('K1 阿凱不在：只有「靜音軸。這個很貴喔。」、不記憶、盒子還在',JSON.stringify(lines())==='["靜音軸。這個很貴喔。"]'&&!SOCIAL.has('kai','HELPED')&&E.interactables.includes(box[0]));
    withKai(); said=[]; await STORY._v1.kaiBoxScene(GM,box[0]); const BL=said.map(s=>(s.who||'')+'：'+s.t);
    check('K1 盒子：祐廷「靜音軸。這個很貴喔。」→ 阿凱「……我本來就想換。」（BB_95 原文）',JSON.stringify(BL)===JSON.stringify(['祐廷：靜音軸。這個很貴喔。','阿凱：……我本來就想換。']),JSON.stringify(BL));
    const mem=SOCIAL.memories('kai'); check('K1 記憶 HELPED（為你換鍵盤）、看過就收起來、不再出現',SOCIAL.has('kai','HELPED')&&JSON.stringify(mem).includes('為你換鍵盤')&&!E.interactables.some(it=>it.kaiBox)&&(STORY.dormItems(GM),!E.interactables.some(it=>it.kaiBox)),JSON.stringify(mem));
    /* 蓋棉被／戴耳塞 → 一週後黑眼圈 → 再隔天換 */
    for(const [pick,k] of [['棉被',1],['耳塞',2]]){
      fresh(7,23,'dorm'); withKai(); picks=[pick]; await STORY.sleepNow(GM,7.5); const F1=Object.assign({},G.flags);
      check('K1 選「'+pick+'」：沒有阿凱的回答、kaiScreenChoice '+k,lines().length===1&&G.flags.kaiScreenChoice===k&&G.flags.kaiScreenDay===7,JSON.stringify(lines()));
      fresh(8,19,'dorm',F1); withKai(); const d1=enterEv(); fresh(13,19,'dorm',F1); withKai(); const d6=enterEv(); fresh(14,19,'dorm',F1); const noKai=enterEv(); withKai(); const d7=enterEv();
      check('K1 「'+pick+'」：隔天不換；一週後（第 14 天）阿凱在房間時才說黑眼圈（第 13 天、他不在都不會）',d1!=='ev_kai_keyboard_quiet'&&d6!=='ev_kai_dark_circles'&&noKai!=='ev_kai_dark_circles'&&d7==='ev_kai_dark_circles',JSON.stringify({d1,d6,noKai,d7}));
      await EVENTS.run(ev('ev_kai_dark_circles')); check('K1 黑眼圈：「你黑眼圈好重，是我嗎。」（BB_95 原文）、當晚還沒換',lines()[0]==='你黑眼圈好重，是我嗎。'&&enterEv()!=='ev_kai_keyboard_quiet');
      const F2=Object.assign({},G.flags), EV2=JSON.parse(JSON.stringify(G.events)); fresh(15,19,'dorm',F2); G.events=EV2; withKai();   /* 演過的事件（once）跟著存檔 */ check('K1 「'+pick+'」：黑眼圈的隔天晚上換鍵盤（不懲罰，只是晚一點）',enterEv()==='ev_kai_keyboard_quiet'); }
    check('K1 現有的「法無明文」（ev_dorm_late_kai）照舊在',!!ev('ev_dorm_late_kai')&&ev('ev_dorm_late_kai').dialogue.some(l=>l.text==='有。叫「法無明文」。')); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
