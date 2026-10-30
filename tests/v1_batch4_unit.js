// 交接包 v1（大一上）第 4 批：BB 的新事件（BB_95 第 3 節）——不需要瀏覽器。
// 檢查（修改前都會失敗：事件、睡覺觸發、房間物件都不存在）：
//   F1 方奕廷的黃金葛（3-1）：平日 12–13 在校園和他說話才觸發（週六、14 點、在宿舍都不會）、只一次；五句台詞與三個選項的回答（BB_95 原文）；
//     記 FIRST_MET；之後宿舍書桌旁多一個「黃金葛」互動點（不重複加）；每週澆一次（同一週第二次是「這週澆過了」，下一週又可以澆）；
//     沒澆也不會枯（幾週不澆照樣在、照樣可以澆）。
//   K1 阿凱凌晨三點的螢幕（3-2）：睡覺觸發——大一上第 3～4 週、平日晚上、隔天早上有課才有（週五晚上隔天沒課、第 5 週、三點以後才睡、第一二天都沒有）；
//     sleepNow 裡在天亮之前演、演完照常到隔天早上；旁白與「……喔。」照 BB_95 原文；只一次。
//     說了「我明天第一堂有課」→ 隔天晚上（18 點後進宿舍）螢幕調暗、換鍵盤（當天晚上不會）；書桌下的盒子：「靜音軸。這個很貴喔。」阿凱「……我本來就想換。」、
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
let legalAsked=0, toasts=[]; global.LEGAL={ask:async()=>{ legalAsked++; },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], titles=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(){},setGoal(){},toast(t){ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async(a,b)=>{ titles.push(a+(b?' '+b:'')); },enter:async(z)=>{ G.zone=z; },
  advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; titles=[]; legalAsked=0; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
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
    const F1=['你是住我隔壁那間的吧？我方奕廷，森林系二年級。','我經過的時候看到，你們房間沒有綠色的東西。',   /* AA_207 附錄 §2：第一次見面先報名字（原本「你是隔壁房的吧。」，選項卻叫他學長）*/'（從袋子裡拿出一盆小小的黃金葛）黃金葛。天南星科，耐陰，空氣不好也可以活。','莖節會長氣根，所以可以水耕，也可以土耕，而且——','……總之，很好養。忘記澆也不會死。','跟你室友一樣。'];
    for(const [pick,reply] of [['謝謝學長','不用啦。我種太多了，房間放不下。'],   /* AA_207 §5（BB_167 SC4 第 39 列）*/['我會養死','不會。我說過了，它很難死。'],['還有幾盆','（笑）七盆。整層樓都要有。']]){
      fresh(mon,12.5,'campus'); picks=[pick]; await EVENTS.run(e); const L=lines();
      check('F1 選「'+pick+'」：五句（BB_95 3-1 原文）＋回答「'+reply+'」、只有這一個回答＋最後「死掉的話傳照片給我。」（4-4：留聯絡方式）',JSON.stringify(L)===JSON.stringify(F1.concat([reply,'死掉的話傳照片給我。'])),JSON.stringify(L)); }
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
    /* BB_170 第 20 列：開學改 9/1 以後 K1 是第 2～3 週（住進來的前兩週）、introDone 以後；用開學改 9/1 的局測 */
    const W1={LAW_START_DAY:-18,MAIN_D1:-13,introDone:true}, DK=k=>STORY.dayOfKey(k), at=(day,hour)=>{ fresh(day,hour,'dorm',W1); return EVENTS.sleepEvent(); };
    const r={mon6:at(DK('2025-09-08'),23.5),tue7:at(DK('2025-09-09'),25.5),fri3:at(DK('2025-09-12'),23),sun5:at(DK('2025-09-14'),23),mon13:at(DK('2025-09-22'),23),late:at(DK('2025-09-08'),27.5),evening:at(DK('2025-09-08'),17)};
    check('K1 第 2 週週一（9/8）23:30、週二凌晨 1:30 上床：有（隔天早上有課）',r.mon6===e&&r.tue7===e,JSON.stringify({mon6:!!r.mon6,tue7:!!r.tue7,wk:CALENDAR.termOf(DK('2025-09-08')).week}));
    check('K1 週日晚上（隔天週一有課）有（AA_207 附錄 §2：weekday 改 [0,1,2,3,4]，原本週日不演、週五會演）',r.sun5===e,JSON.stringify({sun5:!!r.sun5}));
    check('K1 週五（隔天週六沒課）、第 4 週（9/22）、三點以後才睡、傍晚 17:00 都沒有',!r.fri3&&!r.mon13&&!r.late&&!r.evening,JSON.stringify(Object.fromEntries(Object.entries(r).map(([k,v])=>[k,!!v]))));
    for(const k of ['2025-09-03','2025-09-04']){ fresh(DK(k),23,'dorm',W1); check('K1 '+k+'（主線第一、二天）晚上沒有',!EVENTS.sleepEvent()); }
    { fresh(DK('2025-09-08'),23.5,'dorm',{LAW_START_DAY:-18,MAIN_D1:-13}); check('K1 還沒 introDone 沒有',!EVENTS.sleepEvent()); }
    /* sleepNow 裡演 */
    fresh(DK('2025-09-08'),23.5,'dorm',W1); withKai(); picks=['我明天第一堂有課']; await STORY.sleepNow(GM,7.5);
    const L=lines(); check('K1 睡覺時演：旁白（BB_95 原文）→ 選項 → 阿凱「（頭沒回）……喔。」',L[0]==='凌晨三點。阿凱的螢幕很亮，鍵盤很吵。你明天第一堂就有課。'&&L[1]==='（頭沒回）……喔。'&&JSON.stringify(opts[0])===JSON.stringify(['「阿凱，我明天第一堂有課。」','（翻身，用棉被蓋住頭）','（戴耳塞）']),JSON.stringify({L,o:opts[0]}));
    check('K1 畫面是凌晨三點（標題 03:00），演完照常醒在隔天早上（9/9 07:30）',titles[0]==='03:00'&&G.day===DK('2025-09-09')&&Math.abs(G.hour-7.5)<0.01,JSON.stringify({titles,day:G.day,hour:G.hour}));
    check('K1 記下選了什麼、哪一晚（kaiScreenChoice 0、kaiScreenDay 9/8）；只一次',G.flags.kaiScreenChoice===0&&G.flags.kaiScreenDay===DK('2025-09-08')&&(G.hour=23,!EVENTS.sleepEvent()));
    /* 說了 → 隔天晚上換鍵盤 */
    const F0=Object.assign({},G.flags);
    fresh(DK('2025-09-08'),20,'dorm',F0); withKai(); const same=enterEv(); fresh(DK('2025-09-09'),17.5,'dorm',F0); withKai(); const early=enterEv(); fresh(DK('2025-09-09'),19,'dorm',F0); withKai(); const next=enterEv();
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
      const b=DK('2025-09-09'); fresh(b,23,'dorm',W1); withKai(); picks=[pick]; await STORY.sleepNow(GM,7.5); const F1=Object.assign({},G.flags);
      check('K1 選「'+pick+'」：沒有阿凱的回答、kaiScreenChoice '+k,lines().length===1&&G.flags.kaiScreenChoice===k&&G.flags.kaiScreenDay===b,JSON.stringify(lines()));
      fresh(b+1,19,'dorm',F1); withKai(); const d1=enterEv(); fresh(b+6,19,'dorm',F1); withKai(); const d6=enterEv(); fresh(b+7,19,'dorm',F1); const noKai=enterEv(); withKai(); const d7=enterEv();
      check('K1 「'+pick+'」：隔天不換；一週後阿凱在房間時才說黑眼圈（第 6 天、他不在都不會）',d1!=='ev_kai_keyboard_quiet'&&d6!=='ev_kai_dark_circles'&&noKai!=='ev_kai_dark_circles'&&d7==='ev_kai_dark_circles',JSON.stringify({d1,d6,noKai,d7}));
      await EVENTS.run(ev('ev_kai_dark_circles')); check('K1 黑眼圈：「你黑眼圈好重欸，是不是我昨天太吵？」（AA_207 §5／BB_167 SC4 第 40 列；原本「你黑眼圈好重，是我嗎。」）、當晚還沒換',lines()[0]==='你黑眼圈好重欸，是不是我昨天太吵？'&&enterEv()!=='ev_kai_keyboard_quiet');
      const F2=Object.assign({},G.flags), EV2=JSON.parse(JSON.stringify(G.events)); fresh(b+8,19,'dorm',F2); G.events=EV2; withKai();   /* 演過的事件（once）跟著存檔 */ check('K1 「'+pick+'」：黑眼圈的隔天晚上換鍵盤（不懲罰，只是晚一點）',enterEv()==='ev_kai_keyboard_quiet'); }
    check('K1 現有的「法無明文」（ev_dorm_late_kai）照舊在',!!ev('ev_dorm_late_kai')&&ev('ev_dorm_late_kai').dialogue.some(l=>l.text==='有。叫「法無明文」。')); }
  /* ---------- P1／P1b 搬到以安的公法讀書會（方案 A；BB_191 §8-7、AA_222）：classes3d.js 的 clubEvent 在公法讀書會那一次挑 ---------- */
  { const thuOf=w=>STORY.termDay('Y1S1',w,4), t11=thuOf(11), A={id:'public_law_group'};
    const club=(day,flags,extra)=>{ fresh(day,20.1,'wancai',flags||{}); G.events.done.ev_public_law_group=1; SOCIAL.meet('classmate_peishan','campus'); SOCIAL.meet('heroine_01','campus'); if(extra) extra(); const e=CLS.clubEvent(G,A); return e?e.id:null; };
    check('法服讀書會停用：週三那一場不挑任何人物事件',(()=>{ fresh(STORY.termDay('Y1S1',5,3),19,'wancai',{lawclub:true}); return CLS.clubEvent(G,{id:'lawclub_study'})===null; })());
    check('公法讀書會第一次（還沒演過白板）：先演白板 ev_public_law_group',(()=>{ fresh(STORY.termDay('Y1S1',10,4),20.1,'wancai',{}); const e=CLS.clubEvent(G,A); return !!e&&e.id==='ev_public_law_group'; })());
    check('P1：第 11 週的公法讀書會（已認識沛珊）＝ev_peishan_why_plg',club(t11,{})==='ev_peishan_why_plg');
    const P={PEISHAN_ASKED_WHY:true,peishanAskedDay:t11};
    check('P1b：7 天內下一次＝以安回答 ev_peishan_why_answer_plg',club(t11+7,P)==='ev_peishan_why_answer_plg');
    check('P1b：同一天（P1 那一次）不會接著演',club(t11,P)===null);
    check('P1b：兩週後才來＝沒有獨立場面（AA_222：P-L3 帶一句）',club(t11+14,P)===null);
    check('P1b 演過之後：不再演',club(t11+7,P,()=>{ G.flags.PS_WHY_ANSWERED=true; })===null);
    check('舊存檔已經聽過學姊回答（SIS_ANSWERED_WHY）：P1b 不再演',club(t11+7,Object.assign({SIS_ANSWERED_WHY:true},P))===null); }
  /* ---------- P2b 沛珊：三段論（BB_95 3-5）---------- */
  { const e=ev('ev_peishan_syllogism'), dOf=(w,wd)=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===wd) return d; } };
    const can=(day,h,zone,done)=>{ fresh(day,h,zone,{dating_kexin:true}); if(done) G.events.done.ev_peishan_doubt=1; return EVENTS.check(e); };
    check('P2b 第 6、7 週平日 16–19 在總圖（P2 之後）才有',can(dOf(6,2),17,'library',true)&&can(dOf(7,4),18.5,'library_hall',true),'');
    check('P2b 第 5、8 週、週六、15 點、在校園、沒有 P2 都沒有',!can(dOf(5,2),17,'library',true)&&!can(dOf(8,2),17,'library',true)&&!can(dOf(6,6),17,'library',true)&&!can(dOf(6,2),15,'library',true)&&!can(dOf(6,2),17,'campus',true)&&!can(dOf(6,2),17,'library',false));
    const BODY=['老師說法律的推理是三段論。大前提是法條，小前提是事實，結論是……把事實放進法條。','（在紙上畫了三個框）所以先找規則，再看這件事符不符合，最後才說結果。','……我小時候翻民法，就是少了中間那一步。','（看著那三個框）你講得很開心耶。','我聽完的感覺是，人被放進一個框裡。','……我是不是不適合念這個。'];
    for(const [dating,first] of [[true,'總圖不能講話。去外面講。'],[false,'總圖不能講話。去 Café？我請你。']]){
      for(const [pick,reply] of [['框是用來',['嗯。','她想了很久。','我懂你的意思。可是我比較想知道框外面的人在想什麼。']],['可以不喜歡',['……可以不喜歡？','她重複一次，好像第一次聽到有這個選項。','好，我先記著。']],['再寫一題',['兩人又寫了一題。她寫得很好。','我寫得出來。可是寫的時候一點都不想寫。']]   /* AA_207 §5（BB_167 SC4 第 27 列）*/]){
        fresh(dOf(6,2),17,'library',{dating_kexin:dating}); G.events.done.ev_peishan_doubt=1; picks=[pick]; await EVENTS.run(e); const L=lines();
        check('P2b '+(dating?'交往中':'單身')+'、選「'+pick+'」：開場「'+first+'」＋BB_95 原文＋回答',JSON.stringify(L)===JSON.stringify([first].concat(BODY,reply)),JSON.stringify(L)); } }
    check('P2b 三個選項（BB_95 原文）',JSON.stringify(opts[0])===JSON.stringify(['「框是用來想清楚的，不是用來關人的。」','「妳可以不喜歡。」','「我們再寫一題。」']),JSON.stringify(opts[0]));
    check('P2b 之後：沛珊記憶 NOT_FOR_ME、筆記第一頁改寫（NOTE_PAGE1＝1）、提示、只一次',SOCIAL.has('classmate_peishan','NOT_FOR_ME')&&G.flags.NOTE_PAGE1===1&&toasts.some(t=>/第一頁/.test(t))&&EVENTS.check(e)===false,JSON.stringify(toasts)); }
  /* ---------- M1 明軒：公車站的筆記（BB_95 3-6）---------- */
  { const e=ev('ev_mingxuan_notes'), MX='classmate_mingxuan', dOf=(w,wd)=>{ for(let d=1;d<200;d++){ const t=CALENDAR.termOf(d); if(t&&t.id==='Y1S1'&&t.week===w&&CALENDAR.dateOf(d).wd===wd) return d; } };
    const can=(day,h,acq)=>{ fresh(day,h,'gongguan'); if(acq) SOCIAL.meet(MX,'campus'); return EVENTS.check(e); };
    check('M1 第 7 週起、週二週四 21–22 點在公館、認識明軒才有',can(dOf(7,2),21.5,true)&&can(dOf(9,4),21.2,true));
    check('M1 第 6 週、週三、20:30、還不認識都沒有',!can(dOf(6,2),21.5,true)&&!can(dOf(7,3),21.5,true)&&!can(dOf(7,2),20.5,true)&&!can(dOf(7,2),21.5,false));
    { fresh(dOf(7,2),21.5,'gongguan'); const ent=STORY.schedEnt(CHARACTERS[MX],G); check('M1 他照日程在公館騎樓的公車站（週二 21:30，linger）',!!ent&&ent.zone==='gongguan'&&ent.act==='linger',JSON.stringify(ent)); }
    const HEAD=['明軒戴著耳機，膝蓋上攤著民總的筆記，三種顏色的螢光筆。','他看到你，把筆記蓋起來。','……你沒看到。','（笑）我在看漫畫啦。'];   /* AA_207 §5（BB_167 SC4 第 29 列）*/
    for(const [pick,tail,secret,pen] of [['什麼都沒看到',['很好。','他把筆記打開，繼續畫。','走到校門口。','我先回宿舍了。'],false,false]   /* AA_207 §6 */,['從哪裡回來',['……家教。三個。','他看馬路。','我爸的店最近生意不太好，我多接一點。','然後轉回來，笑了。','好，這個話題結束。你要不要看漫畫？'],true,false],['坐到他旁邊',['兩個人一路沒講話。','你的螢光筆只有一種顏色？很可憐耶。','他給你一支綠色的。'],false,true]]){
      fresh(dOf(7,2),21.5,'gongguan'); SOCIAL.meet(MX,'campus'); picks=[pick]; await EVENTS.run(e); const L=lines();
      check('M1 選「'+pick+'」：BB_95 原文（舞台指示做成第二人稱旁白）',JSON.stringify(L)===JSON.stringify(HEAD.concat(tail)),JSON.stringify(L));
      check('M1 選「'+pick+'」：SAW_HIM_STUDY'+(secret?'＋SHARED_SECRET':'')+(pen?'＋綠色螢光筆':'')+'、有他的聯絡方式、只一次',SOCIAL.has(MX,'SAW_HIM_STUDY')&&SOCIAL.has(MX,'SHARED_SECRET')===secret&&!!G.flags.GREEN_HIGHLIGHTER===pen&&INV.hasContact(G,MX)&&EVENTS.check(e)===false); }
    check('M1 三個選項（BB_95 原文）',JSON.stringify(opts[0])===JSON.stringify(['「我什麼都沒看到。」','「你從哪裡回來？」','（坐到他旁邊，也拿出筆記）']),JSON.stringify(opts[0])); }
  /* ---------- 校慶：法律問答攤（BB_95 3-7）---------- */
  { const e=ev('ev_sis_festival_booth'), sat=STORY.termDay('Y1S1',11,6), sisN=()=>{ const n={id:'sis',charId:'heroine_05',name:'溫學姊',obj:{position:{x:-17.8,y:0,z:13}}}; GM.npc.sis=n; E.npcs=[n]; return n; };
    check('校慶是第 11 週週六 11/15（園遊會：法服的帳篷擺出來）',!!sat&&CALENDAR.dateOf(sat).m===11&&CALENDAR.dateOf(sat).d===15,JSON.stringify(CALENDAR.dateOf(sat)));
    { fresh(sat,10.5,'campus'); const ent=STORY.schedEnt(CHARACTERS.heroine_05,G); check('學姊那天 10–12 點在攤前（linger），其他週六照舊在校園走走',!!ent&&ent.act==='linger'&&ent.zone==='campus'&&(fresh(sat+7,10.5,'campus'),STORY.schedEnt(CHARACTERS.heroine_05,G).act==='wander'),JSON.stringify(ent)); }
    const can=(day,h,near,sis,met)=>{ fresh(day,h,'campus',met===false?{}:{met_sis:true}); if(sis) sisN(); E.player.obj.position={x:near?-17.5:0,y:0,z:near?12:0}; const ok=EVENTS.check(e); E.player.obj.position={x:0,y:0,z:0}; return ok; };
    check('走近攤位（學姊在）才有；沒加入法服的玩家也會被叫住（要見過學姊：AA_207 §5 加 met_sis）',can(sat,10.5,true,true,true)&&!can(sat,10.5,true,true,false));
    check('別的週六、12 點以後、學姊不在都不會',!can(sat+7,10.5,true,true)&&!can(sat,12.2,true,true)&&!can(sat,10.5,true,false));
    const HEAD=['你。過來。','幫我顧十分鐘。不會的不要亂答，叫我就好。','少年仔，隔壁的樹長到我家這邊，我可以自己剪嗎？'];
    for(const [pick,tail,d,helped] of [['幫妳問學姊',['阿嬤，先跟鄰居講，請他剪。講了一直沒剪，兩週後的週六早上，九點到十二點，來B館。值班的學長姊會幫妳看。'],{fam:2},false],['翻民總',['翻了半天找不到。學姊探頭。','那是物權。你們大二才上。','物權是什麼？','……阿嬤，下一次值班，週六早上來。']   /* AA_207 附錄 §2：感悟旁白刪掉 */,{fam:2},false],['一起查',['你和阿嬤用手機一起查。學姊在旁邊看完。','……還可以。'],{fam:3,resp:2},true]]){
      fresh(sat,10.5,'campus'); sisN(); SOCIAL.meet('heroine_05','wancai'); const r0=Object.assign({},SOCIAL.rel('heroine_05'));   /* 已經認識學姊（第一次見面的熟悉度另外算）*/ picks=[pick]; await EVENTS.run(e); const L=lines(), r1=SOCIAL.rel('heroine_05'); const got={}; for(const k in r1){ const dd=(r1[k]||0)-(r0[k]||0); if(dd&&typeof dd==='number') got[k]=dd; }
      check('校慶 選「'+pick+'」：BB_95 原文、學姊 '+JSON.stringify(d)+(helped?'、HELPED':''),JSON.stringify(L)===JSON.stringify(HEAD.concat(tail))&&Object.keys(d).every(k=>got[k]===d[k])&&SOCIAL.has('heroine_05','HELPED')===helped,JSON.stringify({L,got})); }
    check('校慶 阿嬤用名字顯示（路人，不是人物資料）',said.some(x=>x.who==='阿嬤'));
    /* 芷若的手機插曲：有她的聯絡方式、FAMILIAR 以上 */
    fresh(sat,10.5,'campus'); sisN(); SOCIAL.meet('heroine_02','cafe'); SOCIAL.adjust('heroine_02',{fam:40,trust:20,comf:20}); INV.addContact(G,'heroine_02'); picks=['幫妳問學姊']; await EVENTS.run(e); const L2=said.map(x=>(x.who||'')+'：'+x.t);
    const ZN=SOCIAL.displayName('heroine_02'), SN=SOCIAL.displayName('heroine_05');
    check('校慶 芷若（有聯絡方式、熟）：手機問一題，學姊從旁邊看到螢幕（BB_95 原文）、訊息也進手機',JSON.stringify(L2.slice(-4))===JSON.stringify([ZN+'（手機）：聽說你在顧法律問答攤。問一題：電影裡偷看別人的信，算犯罪嗎。',SN+'：（從旁邊看到螢幕）哪部電影？',ZN+'（手機）：……很多部。',SN+'：那要一部一部看。'])&&PHONE.thread(G,'p:heroine_02').filter(m=>m.from==='heroine_02').length===2,JSON.stringify(L2.slice(-4))+' 手機 '+JSON.stringify(PHONE.thread(G,'p:heroine_02').map(m=>m.text)));
    fresh(sat,10.5,'campus'); sisN(); SOCIAL.meet('heroine_02','cafe'); picks=['幫妳問學姊']; await EVENTS.run(e); check('校慶 沒有芷若的聯絡方式：沒有手機插曲',!lines().some(t=>/偷看別人的信/.test(t)));
    /* 子晴：吉他社群組的攤位照片 */
    fresh(sat,11,'campus'); sisN(); PHONE.join(G,'guitar','吉他社'); SOCIAL.remember('heroine_04','INVITED_CLUB'); picks=['幫妳問學姊']; await EVENTS.run(e); STORY.phoneRules(GM); G.hour=12.2; PHONE.tick(G);
    check('校慶 子晴（吉他社群組、INVITED_CLUB）：群組的攤位照片「吉他撥片賣了三個。三個都是阿凱買的。」',PHONE.thread(G,'g:guitar').some(m=>m.from==='heroine_04'&&/三個都是阿凱買的/.test(m.text)));
    fresh(sat,11,'campus'); sisN(); PHONE.join(G,'guitar','吉他社'); picks=['幫妳問學姊']; await EVENTS.run(e); STORY.phoneRules(GM); G.hour=12.2; PHONE.tick(G); check('校慶 沒有 INVITED_CLUB：沒有群組照片',!PHONE.thread(G,'g:guitar').length); }
  /* ---------- 家族聚餐（BB_95 3-8）---------- */
  { const e=ev('ev_sis_family_dinner'), fri=STORY.termDay('Y1S1',14,5), grp=()=>PHONE.join(G,'family_law','法律系直屬家族'), T=()=>PHONE.thread(G,'g:family_law').map(m=>(m.name||m.from)+'：'+m.text);
    const can=(day,h)=>{ fresh(day,h,'gongguan'); return EVENTS.check(e); };
    check('家族聚餐：第 14 週週五 18:00–19:30 在公館（DL-04B 放寬，AA_160 3-4、BB_95 3-8）',!!fri&&can(fri,18.05)&&can(fri,19.4)&&!can(fri,19.6)&&!can(fri,17.9)&&!can(fri-7,18.4)&&!can(fri+1,18.4));
    fresh(fri-7,21,'campus'); grp(); STORY.phoneRules(GM); PHONE.tick(G);
    check('前一週 Kevin 在家族群組約（BB_95 原文；AA_458 3-1「週五」→「下週五」）＋學姊「收到。」',JSON.stringify(T())===JSON.stringify(['Kevin：家族聚餐！下週五 18:30，阿鳳麵店。學姊說她會來（截圖為證）','溫學姊：收到。']),JSON.stringify(T()));
    const HEAD=['18:31。她跑進來，有點喘。','抱歉。抱歉。……抱歉，我遲到了。','一分鐘。學姊，一分鐘。','一分鐘也是遲到。','她坐下，從包包拿出一個資料夾。','周老師歷年的考古題。我整理過，錯的地方用紅筆改了。','下學期的書，開學前我會分。書上標紅的地方是修法了，自己查新的。','……還有——','還有傳統！直屬學姊要講一個自己大一的糗事！','……','我大一第一次被點名，老師問什麼是「善意第三人」。我說：心地善良的第三人。','老師說：「那心地不好的第三人，是不是就不用保護了？」','全桌笑。她也笑了一下。','其實「善意」在法律上是「不知道」的意思。下學期你們就會學到。'];
    for(const [pick,tail,sticker] of [['手心都是汗',['那一題大家都會卡。你有回答就很好了。'],false],['收到',['因為收到了。','她連過年都回收到。','……不然要回什麼？','貼圖啊！','我沒有貼圖。'],true],['資料夾收進書包',['學姊看了一眼。','資料夾回去再看。現在吃麵。','學姊說吃麵耶！'],false]]){
      fresh(fri,18.55,'gongguan',{classDone:true,classAnswer:'good',SIS_W1:true,met_sis:true}); grp(); picks=[pick]; await EVENTS.run(e); const L=lines();   /* 已經認識她（SIS_W1）：還沒認識的多兩句自我介紹（AA_470 5-1），驗在 tests/aa470_sis_b12_unit.js */
      check('家族聚餐 選「'+pick+'」：BB_95 原文、散會「下學期的書，我會留給你。」、SHARED_MEAL'+(sticker?'、SIS_NO_STICKER':''),JSON.stringify(L)===JSON.stringify(HEAD.concat(tail,['下學期的書，我會留給你。']))&&SOCIAL.has('heroine_05','SHARED_MEAL')&&!!G.flags.SIS_NO_STICKER===sticker,JSON.stringify(L.slice(-6))); }
    fresh(fri,18.55,'gongguan',{classAnswer:'absent'}); picks=[0]; await EVENTS.run(e); check('家族聚餐 第二天沒上課（absent）：沒有「被周老師點名」那個選項；不在家族群組：沒有「收到」那個選項',opts[0].length===1&&/資料夾/.test(opts[0][0]),JSON.stringify(opts[0]));
    fresh(fri,18.55,'gongguan',{}); grp(); picks=['資料夾']; await EVENTS.run(e); G.hour=22.6; STORY.phoneRules(GM); PHONE.tick(G);
    check('家族聚餐 去了：當晚學姊沒有在群組訂正（AA_218 17-12a：她不在群組主動發言）、沒有「沒來的人自己拿」',!T().some(t=>/紅筆改錯/.test(t))&&!T().some(t=>/沒來的人/.test(t)),JSON.stringify(T()));
    fresh(fri,18.1,'gongguan',{}); grp(); picks=['資料夾']; await EVENTS.run(e); { const L=lines(); check('家族聚餐 18:00～18:30 先到：先旁白「你先到了。麵店的阿姨把你們那一桌的椅子擺好。」，再接 18:31 她跑進來',L[0]==='你先到了。麵店的阿姨把你們那一桌的椅子擺好。'&&L[1]==='18:31。她跑進來，有點喘。',JSON.stringify(L.slice(0,2))); }
    fresh(fri-1,21.1,'campus',{}); grp(); STORY.phoneRules(GM); PHONE.tick(G); check('家族聚餐 前一天 21:00 Kevin 提醒一次「明天六點半，公館。記得來。」（AA_218 17-12a）',T().filter(t=>t==='Kevin：明天六點半，公館。記得來。').length===1&&!T().some(t=>/三件事/.test(t)),JSON.stringify(T()));
    fresh(fri,17.6,'campus',{}); grp(); toasts=[]; STORY.phoneRules(GM); STORY.phoneRules(GM); check('家族聚餐 當天 17:30 一則 toast「今天 18:30 家族聚餐（公館）」（只一次）',toasts.filter(t=>t==='今天 18:30 家族聚餐（公館）').length===1,JSON.stringify(toasts));
    fresh(fri,17.6,'campus',{}); toasts=[]; STORY.phoneRules(GM); check('不在家族群組：沒有當天的 toast',!toasts.some(t=>/家族聚餐/.test(t)));
    { const fsat=STORY.termDay('Y1S1',11,6); fresh(fsat-1,21.1,'campus',{}); PHONE.join(G,'lawclub_study','法服讀書會'); STORY.phoneRules(GM); PHONE.tick(G); const L=PHONE.thread(G,'g:lawclub_study').map(m=>m.text);
      check('校慶前一天（週五）21:00 法服群組：學姊「明天校慶，問答攤十點開。輪班表在記事本。」',L.includes('明天校慶，問答攤十點開。輪班表在記事本。'),JSON.stringify(L));
      const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('沒加入法服：校慶前一天走過大道的公告欄，旁白「公告欄：明天校慶，各社團擺攤。」（AMBIENT festEve）',/key:'festEve'[^]*?PHONE\.inGroup\(G,'lawclub_study'\)\)\) return null; return \['公告欄：明天校慶，各社團擺攤。'\]/.test(src)); }
    fresh(fri,19.2,'campus',{}); grp(); STORY.phoneRules(GM); G.hour=22.6; STORY.phoneRules(GM); PHONE.tick(G);
    check('家族聚餐 沒去：22:00 只有 Kevin 貼資料夾（AA_458 3-2：照片寫「周老師　歷年考古題」＋「學姊整理的。沒來的人，跟我拿。」兩則；學姊那句、22:30 的訂正都刪，AA_218 17-12a）',T().some(t=>/學姊整理的。沒來的人，跟我拿。/.test(t))&&T().some(t=>/周老師　歷年考古題/.test(t))&&!T().includes('溫學姊：下學期的書，我會留給學弟。')&&!T().some(t=>/紅筆改錯/.test(t)),JSON.stringify(T())); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
