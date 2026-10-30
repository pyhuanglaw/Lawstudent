// 交接包 v2 C18：Alison 語 2「剛好路過」（草稿第 3 節、AA_40 語 2）——不需要瀏覽器。修改前沒有這幾個事件（第 1 項失敗）。
// 檢查：大一下第 13～15 週的三個徵兆（16 週制，AA-C 11:23 往前補一週）——① 傅鐘的早餐（走到 Alison 附近就演）② 麵店日的麵店一句旁白 ③ Alison 問祐廷（吉他社的玩家在社課後、其他玩家在麵店散場後的騎樓），
//   ③ 要先看過 ① 或 ② 其中一個（看到 ③ 的人一定看過兩個以上）；三個選項的反應照 AA_40 的表、都不改變結果（YU2_PICK）；整個存檔只問一次；吉他社大一下也有
// 用法：node tests/v2_c18_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|YU2_QUESTION)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const eA=ev('ev_yu_sign_soymilk'), eB=ev('ev_yu_sign_seat'), eC1=ev('ev_yu_sign_question_club'), eC2=ev('ev_yu_sign_question_arcade'), GT=ACTIVITIES.list.find(a=>a.id==='club_guitar');
  check('C18：四個事件都在（① 豆漿、② 麵店、③ 社課後／騎樓）',!!eA&&!!eB&&!!eC1&&!!eC2);
  if(!eA||!eB||!eC1||!eC2){ console.log('FAILED '+fails); process.exit(1); }
  const met=()=>{ G.flags.met_yu=true; };
  /* ① 傅鐘的早餐 */
  { const at=(term,w,wd,h,zone,known)=>{ fresh(termDay(term,w,wd),h,zone||'campus'); if(known!==false) met(); return EVENTS.check(eA); };
    const r={w14:at('Y1S2',13,1,8.6),w16:at('Y1S2',15,5,9),w13:at('Y1S2',12,1,8.6),w17:at('Y1S2',16,1,8.6),sat:at('Y1S2',14,6,8.6),noon:at('Y1S2',14,1,9.2),y1s1:at('Y1S1',14,1,8.6),notMet:at('Y1S2',14,1,8.6,'campus',false),lib:at('Y1S2',14,1,8.6,'library')};   /* AA_156 第 4 節：Alison 在傅鐘是平日 08:20～09:05 */
    check('① 豆漿：大一下第 13～15 週平日 08:20～09:05、校園、認識 Alison（AA-C 11:23：16 週制往前補一週；第 12／16 週、週六、09:12、大一上、不認識、總圖都沒有）',r.w14&&r.w16&&!r.w13&&!r.w17&&!r.sat&&!r.noon&&!r.y1s1&&!r.notMet&&!r.lib,JSON.stringify(r));
    check('① 走到 Alison 附近就演（auto、4 m 內，不用特地找她說話）',eA.trigger==='auto'&&eA.near&&eA.near.npc==='yu'&&eA.near.r===4);
    /* 引擎的 auto：Alison 在傅鐘的長椅（-46, 20.94），玩家 10 m 外不演、3 m 內演 */
    fresh(termDay('Y1S2',14,2),8.6,'campus'); met(); GM.npc={yu:{id:'yu',charId:'yu',obj:{position:{x:-46,y:0,z:20.94}},lv:0}}; E.player.obj.position.x=-46; E.player.obj.position.z=31;
    const far=EVENTS.tick(0.1); E.player.obj.position.z=23.5; const near=EVENTS.tick(0.1); await new Promise(r=>setTimeout(r,30));
    check('① 引擎：10 m 外不演、2.6 m 內演',!far&&near&&!!G.events.done.ev_yu_sign_soymilk,JSON.stringify({far,near}));
    check('① 台詞：（阿哲出現，帶著兩杯豆漿。）阿哲「剛好路過。」Alison「你宿舍又不在這邊。」（AA_209）阿哲「……剛好路過。」',JSON.stringify(lines())===JSON.stringify(['阿哲出現，帶著兩杯豆漿。','阿哲：剛好路過。','Alison：你宿舍又不在這邊。','阿哲：……剛好路過。'])&&G.flags.yu2SoymilkDay===G.day,JSON.stringify(lines()));
    E.player.obj.position.x=0; E.player.obj.position.z=0; GM.npc={}; }
  /* ② 麵店 */
  { const ND=(w,k)=>{ const L=[]; for(let wd=1;wd<=5;wd++){ const d=termDay('Y1S2',w,wd); if(d!=null&&STORY.noodleDay(d)) L.push(wd); } return L[k|0]!=null?L[k|0]:L[0]; }, NN=w=>{ for(let wd=1;wd<=5;wd++){ const d=termDay('Y1S2',w,wd); if(d!=null&&!STORY.noodleDay(d)) return wd; } return 3; };   /* AA_542 第 5 節：麵店日每週不固定兩天 */
    const at=(w,wd,h,o)=>{ o=o||{}; fresh(termDay('Y1S2',w,wd),h,o.zone||'noodle'); if(!o.notMet) met(); if(!o.noTeam) G.flags.noodleTableDay=termDay('Y1S1',6,2); return EVENTS.check(eB); };
    const r={tue:at(14,ND(14,0),18),thu:at(15,ND(15,1),20.5),wk16:at(16,4,20.5),wed:at(14,NN(14),18),w13:at(12,ND(12,0),18),late:at(14,ND(14,0),21.2),noTeam:at(14,ND(14,0),18,{noTeam:true}),notMet:at(14,ND(14,0),18,{notMet:true}),gg:at(14,ND(14,0),18,{zone:'gongguan'})};
    check('② 麵店：大一下第 13～15 週的麵店日（AA_542 起每週不固定兩天；AA-C 11:23 往前補一週，第 16 週期末不放）17:30–21:00 走進麵店；在群組、認識 Alison 才有（不是麵店日、第 12 週、21:12、沒有群組、不認識、在公館都沒有）',r.tue&&r.thu&&!r.wk16&&!r.wed&&!r.w13&&!r.late&&!r.noTeam&&!r.notMet&&!r.gg,JSON.stringify(r));
    at(14,2,18); await EVENTS.run(eB); check('② 台詞：（Alison 每次都坐阿哲旁邊。）只有一句、沒有選項',JSON.stringify(lines())==='["Alison 每次都坐阿哲旁邊。"]'&&!opts.length&&G.flags.yu2SeatDay===G.day,JSON.stringify(lines())); }
  /* 吉他社大一下 */
  { const M=w=>termDay('Y1S2',w,1);
    check('吉他社：大一下也有（第 5～7、10～16 週的週一、三；期中第 8～9 週沒有）；大一上照舊',ACTIVITIES.on(GT,M(14))&&ACTIVITIES.on(GT,termDay('Y1S2',15,3))&&ACTIVITIES.on(GT,M(5))&&!ACTIVITIES.on(GT,M(8))&&!ACTIVITIES.on(GT,M(4))&&ACTIVITIES.on(GT,termDay('Y1S1',5,3)));   /* 大一上第 5 週週一是教師節補假，用週三 */ }
  /* ③ 吉他社的玩家：社課結束後 */
  { const at=(w,o)=>{ o=o||{}; fresh(termDay('Y1S2',w,1),21,'wancai'); met(); if(!o.noClub) G.flags.CLUB_club_guitar=true; if(o.sign!==false) G.flags.yu2SeatDay=termDay('Y1S2',14,2); if(o.picked) G.flags.YU2_PICK='ask'; return CLS.afterActEvent(G,GT); };
    const r={ok:at(14)===eC1,w16:at(15)===eC1,w13:at(12),noSign:at(14,{sign:false}),noClub:at(14,{noClub:true}),picked:at(14,{picked:true})};
    check('③ 社課後：吉他社的玩家、看過 ① 或 ② 其中一個、第 13～15 週＝演（16 週制，AA-C 11:23）；第 12 週、還沒看過其他徵兆、不是吉他社、已經問過都沒有',r.ok&&r.w16&&!r.w13&&!r.noSign&&!r.noClub&&!r.picked,JSON.stringify(r));
    /* 玩家流程：週一 19:05 參加吉他社（認識子晴，不演初遇）→ 社課結束了 → Alison 問 */
    fresh(termDay('Y1S2',14,1),19.08,'wancai'); met(); G.flags.CLUB_club_guitar=true; G.flags.yu2SoymilkDay=termDay('Y1S2',14,1); SOCIAL.meet('heroine_04','wancai'); picks=['對每個人都好'];
    await CLS.attendActivity(GM,GT,{door:true}); const L=lines();
    check('③ 照玩家流程參加吉他社（attendActivity）：社課結束以後 Alison 問「欸，阿哲是不是對每個人都這麼好？」，三個選項照原文',L.includes('Alison：欸，阿哲是不是對每個人都這麼好？')&&JSON.stringify(opts[opts.length-1])==='["「對每個人都好。」","「對妳比較好。」","「妳自己問他。」"]',JSON.stringify(L.slice(-6))+' '+JSON.stringify(opts)); }
  /* ③ 其他玩家：麵店散場後的騎樓（公館） */
  { const T=termDay('Y1S2',14,2);
    const setup=(o)=>{ o=o||{}; fresh(T,18,'noodle'); met(); G.flags.noodleTableDay=termDay('Y1S1',6,2); if(o.club) G.flags.CLUB_club_guitar=true; if(o.sign!==false) G.flags.yu2SeatDay=T;
      if(o.ate!==false) STORY.phoneRules(GM);   /* 麵店日 17–21 在麵店＝記 ndlDays（story3d.js）*/
      G.zone='gongguan'; G.hour=o.h||20.6; return EVENTS.check(eC2); };
    const r={ok:setup(),club:setup({club:true}),noSign:setup({sign:false}),notAte:setup({ate:false}),late:setup({h:22.3})};
    check('③ 騎樓：麵店團、今天有在麵店（ndlDays）、看過 ① 或 ② 其中一個、不是吉他社、走到公館＝演；吉他社的玩家、沒看過其他徵兆、今天沒去麵店、22:18 都沒有',r.ok&&!r.club&&!r.noSign&&!r.notAte&&!r.late,JSON.stringify(r));
    const play=async k=>{ setup(); picks=[k]; await EVENTS.run(eC2); return lines(); };
    let L=await play(0); check('③ 騎樓（她沒背吉他，AA 50da3a9）選「對每個人都好。」：Alison「……喔。」（她低頭滑手機。）「也是啦。」',JSON.stringify(L.slice(1))===JSON.stringify(['Alison：……喔。','她低頭滑手機。','Alison：也是啦。'])&&G.flags.YU2_PICK==='everyone'&&SOCIAL.has('yu','ASKED_ABOUT_ZHE'),JSON.stringify(L));
    L=await play(1); check('③ 騎樓選「對妳比較好。」：（她停住，然後很大聲地哼了一段成發要彈的旋律。）Alison「欸你很煩！」',JSON.stringify(L.slice(1))===JSON.stringify(['她停住，然後很大聲地哼了一段成發要彈的旋律。','Alison：欸你很煩！'])&&G.flags.YU2_PICK==='you',JSON.stringify(L));
    { const playClub=async k=>{ setup(); picks=[k]; await EVENTS.run(eC1); return lines(); };
      let C=await playClub(0); check('③ 社課後的版本照舊（背著吉他）：「她低頭調弦。」',JSON.stringify(C.slice(1))===JSON.stringify(['Alison：……喔。','她低頭調弦。','Alison：也是啦。']),JSON.stringify(C));
      C=await playClub(1); check('③ 社課後：「她停住，然後很大聲地彈了一個和弦。」',JSON.stringify(C.slice(1))===JSON.stringify(['她停住，然後很大聲地彈了一個和弦。','Alison：欸你很煩！']),JSON.stringify(C)); }
    L=await play(2); check('③ 選「妳自己問他。」：Alison「我才不要。」（她想了一下。）「……再看看啦。」（AA_313 5-4：不用「……好啦」反轉）',JSON.stringify(L.slice(1))===JSON.stringify(['Alison：我才不要。','她想了一下。','Alison：……再看看啦。'])&&G.flags.YU2_PICK==='ask',JSON.stringify(L));
    check('三個選項都不改變結果：只記 YU2_PICK 和一筆記憶（沒有好感數字、沒有別的旗標）',[eC1,eC2].every(e=>!e.consequences)&&!JSON.stringify(YU2_QUESTION).includes('rel'));
    /* 整個存檔只問一次：騎樓問過以後，吉他社那一個也不演 */
    G.flags.CLUB_club_guitar=true; G.zone='wancai'; G.day=termDay('Y1S2',15,1); G.hour=21; check('整個存檔只問一次：騎樓問過以後，社課後那一個也不演',CLS.afterActEvent(G,GT)===null); }
  check('記憶的中文說明：ASKED_ABOUT_ZHE',!!(SOCIAL.MEMORY_LABEL&&SOCIAL.MEMORY_LABEL.ASKED_ABOUT_ZHE),SOCIAL.MEMORY_LABEL&&SOCIAL.MEMORY_LABEL.ASKED_ABOUT_ZHE);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
