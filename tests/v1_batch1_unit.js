// 交接包 v1（大一上）第 1 批：交付清單第 1 節「先改的文字」——不需要瀏覽器。
// 檢查（每項修改前都會失敗）：
//   A3 ev_an_library_study：選項改「刑總。吳老師說期中會考。」、記憶備註「總圖讀刑總」、只在大一上觸發。
//   A4 ev_an_report_feedback：cafeView A 的評語改成「兩邊的利益都有看到。」；「周老師寫給妳的，不關我的事。」（comf −3）拿掉。
//   A5 ev_bohan_kaogu：「我在看刑總的題目……」；不出題（沒有 legal 那一行，演一次不會問法律題）。
//   A7 ev_yutong_absent、ev_yutong_thanks：大一上條件都成立也不觸發，大一下才會。
//   A8 ev_course_selection：通識「城市與散步」；選項二「算了，下學期再選。」、不設 ge_econ。
//   關掉 ev_mingxuan_money、ev_sis_collapse：條件都成立也不觸發；舊存檔演過的備註照常顯示（off 不是 retired）。
//   Z1 ev_cafe_barista_zhiruo（BB_95 2-2）：點五次，名字只出現一次；第 2～4 次「老樣子？」；第 5 次她先做（第一次點的東西）＋集點卡＋店裡的聯絡方式；
//      先在經原分組認識的，第一次點餐開場是「……經原那組的。」、不說名字；舊存檔（點過、沒有計數）讀檔補成 1。
//      好朋友以上（BB_120 1-2）：開場、點餐之後多一句「（紙杯上多了一行字……）」、記 zhiruoCupNote；朋友以下、只是看看都沒有。
//   引擎：flagNum、inc、setOnce、stamp、{flag:key|預設}。
// 用法：node tests/v1_batch1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}}; global.THREE={Vector3:function(){}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/events.js','src/social3d.js','src/events3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){}}; global.CHAR={setExpr(){}};
let said=[], opts=[], picks=[], legalAsked=0, money=0, G=null;
global.LEGAL={ask:async()=>{ legalAsked++; },apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const GM={get G(){ return G; },E:{q:{level:'medium'},player:{busy:false,obj:{position:{x:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null},D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(v){ money+=v; },setGoal(){},toast(){},advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const dayIn=id=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===id&&!CALENDAR.weekend(d)&&!CALENDAR.holiday(d)) return d; } return null; };
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone)=>{ G={day,hour,zone,weekday:wdOf(day),weather:'clear',flags:{},choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,energy:80,money:5000}; SOCIAL.bind(G); EVENTS.bind(GM); said=[]; opts=[]; picks=[]; legalAsked=0; money=0; };
const at=(day,hour,zone)=>{ G.day=day; G.hour=hour; G.zone=zone; G.weekday=wdOf(day); said=[]; opts=[]; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id)||(typeof STORY_EVENTS_V11!=='undefined'&&STORY_EVENTS_V11.find(e=>e.id===id));
const lines=()=>said.map(s=>s.t);
const Y1S1=dayIn('Y1S1'), Y1S2=dayIn('Y1S2');
(async()=>{
  check('日曆：找得到大一上、大一下的上課日',!!Y1S1&&!!Y1S2,JSON.stringify({Y1S1,Y1S2}));
  /* ---------- A3 ---------- */
  { const e=ev('ev_an_library_study'); fresh(Y1S1+7,9,'library'); SOCIAL.meet('heroine_01','campus'); SOCIAL.adjust('heroine_01',{fam:30});
    check('A3 大一上、認識以安：總圖的早上會觸發',EVENTS.check(e)===true);
    picks=['刑總']; await EVENTS.run(e); const o=opts[0]||[];
    check('A3 選項是「刑總。吳老師說期中會考。」（沒有刑訴）',o.includes('「刑總。吳老師說期中會考。」')&&!o.some(t=>/刑訴/.test(t)),JSON.stringify(o));
    check('A3 記憶備註「總圖讀刑總」',(G.social.mem.heroine_01||[]).some(m=>m.tag==='STUDIED_TOGETHER'&&m.note==='總圖讀刑總'));
    fresh(Y1S2+7,9,'library'); SOCIAL.meet('heroine_01','campus'); SOCIAL.adjust('heroine_01',{fam:30});
    check('A3 大一下：不觸發（兩個選項都是大一上的課）',EVENTS.check(e)===false); }
  /* ---------- A4 ---------- */
  { const e=ev('ev_an_report_feedback');
    for(const v of ['A','B','C']){ fresh(Y1S1+20,15,'cafe'); SOCIAL.meet('heroine_01','campus'); SOCIAL.remember('heroine_01','CAFE_AFTERNOON','x'); G.choices.cafeView=v; await EVENTS.run(e); const L=lines(), o=opts[0]||[];
      if(v==='A') check('A4 cafeView A：「「兩邊的利益都有看到。」……那是你那天講的。」（沒有「法律依據不夠」）',L.includes('「兩邊的利益都有看到。」……那是你那天講的。')&&!L.some(t=>/法律依據不夠/.test(t)),JSON.stringify(L));
      check('A4 cafeView '+v+'：沒有「周老師寫給妳的，不關我的事。」，只剩兩個選項',o.length===2&&!o.some(t=>/不關我的事/.test(t)),JSON.stringify(o)); }
    check('A4 事件資料裡沒有 comf −3 的那個選項',!JSON.stringify(e.dialogue).includes('不關我的事')); }
  /* ---------- A5 ---------- */
  { const e=ev('ev_bohan_kaogu'); fresh(Y1S1+30,14,'library'); SOCIAL.meet('classmate_bohan','campus'); legalAsked=0; await EVENTS.run(e); const L=lines();
    check('A5 「我在看刑總的題目，有一題我跟班上的芯慈吵了半小時。」',L.includes('你來得正好。我在看刑總的題目，有一題我跟班上的芯慈吵了半小時。'),JSON.stringify(L.slice(0,2)));
    check('A5 不出題（沒有 legal 那一行、演一次沒有問法律題）',legalAsked===0&&!e.dialogue.some(l=>l.legal),String(legalAsked)); }
  /* ---------- A7 ---------- */
  for(const id of ['ev_yutong_absent','ev_yutong_thanks']){ const e=ev(id);
    const setup=day=>{ fresh(day,id==='ev_yutong_absent'?18:21.2,id==='ev_yutong_absent'?'noodle':'library');   /* ev_yutong_thanks：20:30～22:00（AA_178 ②）*/ while(![2,4].includes(G.weekday)){ G.day++; G.weekday=wdOf(G.day); } SOCIAL.meet('heroine_03','campus'); SOCIAL.remember('heroine_03','TALKED_FAMILY','x'); G.flags.yutong_hospital=true; };
    /* 語彤 4 從交接包 v2 起放在期中這兩週（第 8～9 週，AA_11 事件 4）：大一上、下都用第 8 週比 */
    const wk=(term,w)=>{ for(let d=1;d<2000;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===term&&t.week===w) return d; } return null; };
    const dA=id==='ev_yutong_absent'?wk('Y1S1',8):Y1S1+14, dB=id==='ev_yutong_absent'?wk('Y1S2',8):Y1S2+14;
    setup(dA); const a=EVENTS.check(e); setup(dB); const b=EVENTS.check(e);
    check('A7 '+id+'：大一上條件都成立也不觸發，大一下才會',a===false&&b===true,JSON.stringify({Y1S1:a,Y1S2:b})); }
  /* ---------- A8 ---------- */
  { const e=ev('ev_course_selection'); fresh(Y1S1+3,8,'dorm'); picks=[1]; await EVENTS.run(e); const L=lines(), o=opts[0]||[];
    check('A8 「選課結果出來了。通識「城市與散步」——沒選上。備取十七。」',L[0]==='選課結果出來了。通識「城市與散步」——沒選上。備取十七。',L[0]);
    check('A8 選項：第二階段再上網加（AA_195 4-7 B8：114 學年起取消人工加簽）、「算了，下學期再選。」（沒有「經濟學原理」）',o.length===2&&o[0]==='沒選到的那堂，等第二階段有人退選，再上網加加看。'&&o[1]==='算了，下學期再選。'&&!o.some(t=>/經濟學原理/.test(t)),JSON.stringify(o));
    check('A8 選「下學期再選」不設 ge_econ',!G.flags.ge_econ);
    fresh(Y1S1+3,8,'dorm'); picks=[0]; await EVENTS.run(e); check('A8 選「加簽」：記下備取（ge_walk_waitlist）',G.flags.ge_walk_waitlist===true&&!G.flags.ge_econ); }
  /* ---------- 關掉的兩件 ---------- */
  { const m=ev('ev_mingxuan_money'), s=ev('ev_sis_collapse');
    fresh(Y1S1+30,14,'campus'); SOCIAL.meet('classmate_mingxuan','campus'); SOCIAL.adjust('classmate_mingxuan',{fam:60,trust:40,comf:40});
    check('關掉 ev_mingxuan_money：明軒「熟悉」以上也不觸發',SOCIAL.STAGES.indexOf(SOCIAL.stage('classmate_mingxuan'))>=SOCIAL.STAGES.indexOf('FAMILIAR')&&EVENTS.check(m)===false,SOCIAL.stage('classmate_mingxuan'));
    fresh(Y1S1+30,21,'cafe'); SOCIAL.meet('heroine_05','campus'); SOCIAL.adjust('heroine_05',{fam:90,trust:80,comf:80,aff:60}); SOCIAL.remember('heroine_05','IMPORTANT_CONVERSATION','x');
    check('關掉 ev_sis_collapse：學姊「朋友」以上、有重要對話也不觸發',EVENTS.check(s)===false,SOCIAL.stage('heroine_05'));
    SOCIAL.remember('heroine_05','SHARED_SECRET','她不確定要不要繼續念法律');
    check('關掉（off）不是停用（retired）：舊存檔演過的備註照常顯示',SOCIAL.noteShown('heroine_05',{tag:'SHARED_SECRET',note:'她不確定要不要繼續念法律'})==='她不確定要不要繼續念法律'); }
  /* ---------- Z1 ---------- */
  { const e=ev('ev_cafe_barista_zhiruo'); const NAME=/林芷若/; let names=0; const runs=[];
    fresh(Y1S1+1,15,'cafe');
    for(let k=0;k<6;k++){ at(Y1S1+1+k,15,'cafe'); picks=['拿鐵','加店裡']; money=0; await EVENTS.run(e); const L=lines(); names+=L.filter(t=>NAME.test(t)).length; runs.push({L,o:opts.slice(),money,v:G.flags.CAFE_VISITS}); }
    check('Z1 點五次（含第六次）：名字只出現一次（第一次）',names===1&&runs[0].L.some(t=>NAME.test(t)),String(names));
    check('Z1 第 1 次：開場「歡迎光臨——喔，法律系的。……」',runs[0].L[0]==='歡迎光臨——喔，法律系的？要喝什麼，慢慢看。',runs[0].L[0]);
    check('Z1 第 2～4 次：「老樣子？」、不說名字、有點餐選項',[1,2,3].every(k=>runs[k].L[0]==='老樣子？'&&!runs[k].L.some(t=>NAME.test(t))&&runs[k].o.length===1),JSON.stringify(runs.slice(1,4).map(r=>r.L[0])));
    check('Z1 第 5 次：不問、直接做第一次點的東西（「拿鐵。……我已經在做了。」）、照樣收錢',runs[4].L[0]==='拿鐵。……我已經在做了。'&&runs[4].money===-120&&!runs[4].o.some(o=>o.some(t=>/拿鐵。妳怎麼知道/.test(t))),JSON.stringify({L0:runs[4].L[0],money:runs[4].money}));
    check('Z1 第 5 次：集點卡（補蓋到第五格）、背面的聯絡方式；加了記下這一天（zhiruoShopContactDay）',runs[4].L.some(t=>/集點卡/.test(t)&&/第五格/.test(t))&&runs[4].L.some(t=>/點餐可以先傳/.test(t))&&G.flags.zhiruoShopContactDay===Y1S1+5,JSON.stringify(runs[4].L));
    check('Z1 第 6 次：一樣直接做，沒有第二張集點卡',runs[5].L[0]==='拿鐵。……我已經在做了。'&&!runs[5].L.some(t=>/集點卡/.test(t)));
    check('Z1 計數：每次點餐 +1（1→6）',runs.map(r=>r.v).join(',')==='1,2,3,4,5,6',runs.map(r=>r.v).join(','));
    check('Z1 第一次點的東西寫在 SHARED_MEAL 的備註（只寫一次）',(G.social.mem.heroine_02||[]).filter(m=>m.tag==='SHARED_MEAL').length===1&&(G.social.mem.heroine_02||[]).some(m=>m.tag==='SHARED_MEAL'&&m.note==='第一次在兩點半點了拿鐵'));
    /* 第一次點手沖：第 5 次做的是手沖、收手沖的錢 */
    fresh(Y1S1+1,15,'cafe'); for(let k=0;k<5;k++){ at(Y1S1+1+k,15,'cafe'); picks=k<4?['手沖']:['收進錢包']; money=0; await EVENTS.run(e); }   /* 第 5 次沒有點餐選項：只回答集點卡 */
    check('Z1 第一次點手沖：第 5 次是「手沖。……我已經在做了。」、收 150、不加帳號',lines()[0]==='手沖。……我已經在做了。'&&money===-150&&G.flags.zhiruoShopContactDay==null,JSON.stringify({L0:lines()[0],money}));
    /* 第一次點檸檬塔：第 5 次是「檸檬塔。……我已經在切了。」（點心用「切」，BB 2026-10-14）*/
    fresh(Y1S1+1,15,'cafe'); for(let k=0;k<5;k++){ at(Y1S1+1+k,15,'cafe'); picks=k<4?['檸檬塔']:['收進錢包']; money=0; await EVENTS.run(e); }
    check('Z1 第一次點檸檬塔：第 5 次是「檸檬塔。……我已經在切了。」（不說「做」）、收 110',lines()[0]==='檸檬塔。……我已經在切了。'&&!lines().some(t=>/在做了/.test(t))&&money===-110,JSON.stringify({L0:lines()[0],money}));
    /* 只是看看：不算點餐 */
    fresh(Y1S1+1,15,'cafe'); picks=['只是看看']; await EVENTS.run(e); check('Z1 「只是看看」不算點餐（計數沒有加）',!(G.flags.CAFE_VISITS>0));
    /* 先在經原分組認識 */
    fresh(Y1S1+2,15,'cafe'); SOCIAL.meet('heroine_02','classroom'); G.events.done.ev_zhiruo_ge_group=1; picks=['拿鐵']; await EVENTS.run(e); const L=lines(), o=opts[0]||[];
    check('Z1 先在經原分組認識：第一次點餐「啊，經原那組的。今天喝什麼？」（AA_207 §5／BB_167 SC3 第 25 列；原本「……經原那組的。法律系的。……」）、不說名字、沒有「妳是外文系的？」',L[0]==='啊，經原那組的。今天喝什麼？'&&!L.some(t=>NAME.test(t))&&!o.some(t=>/外文系/.test(t)),JSON.stringify({L0:L[0],o}));
    /* SHARED_SECRET 的開場（第 2～4 次優先）*/
    fresh(Y1S1+2,15,'cafe'); SOCIAL.meet('heroine_02','cafe'); G.flags.CAFE_VISITS=2; SOCIAL.remember('heroine_02','SHARED_SECRET','x'); await EVENTS.run(e);
    check('Z1 有 SHARED_SECRET 的第 2～4 次：「又來了。今天要「老樣子」嗎？我記得你的。」',lines()[0]==='又來了。今天要「老樣子」嗎？我記得你的。',lines()[0]);
    /* 好朋友以上：開場、點餐之後多一句紙杯旁白（BB_120 1-2，2026-10-14 對齊 Z1）；朋友以下沒有；第 5 次以後直接做的那種也有 */
    const CUP='（紙杯上多了一行字，寫的是一部電影裡的一個場景。）', setRel=(f,t,c)=>{ const r=SOCIAL.rel('heroine_02'); r.fam=f; r.trust=t; r.comf=c; };
    fresh(Y1S1+3,15,'cafe'); SOCIAL.meet('heroine_02','cafe'); G.flags.CAFE_VISITS=2; setRel(45,30,20); picks=['拿鐵']; await EVENTS.run(e);
    check('Z1 朋友（還不是好朋友）：沒有紙杯那一句',lines()[0]==='老樣子？'&&!lines().includes(CUP)&&!G.flags.zhiruoCupNote,JSON.stringify(lines()));
    fresh(Y1S1+3,15,'cafe'); SOCIAL.meet('heroine_02','cafe'); G.flags.CAFE_VISITS=2; setRel(70,50,45); picks=['拿鐵']; await EVENTS.run(e); const Lc=lines();
    check('Z1 好朋友：開場「老樣子？」、點了以後多一句紙杯旁白（在「杯子放著就好」之前）、記 zhiruoCupNote',Lc[0]==='老樣子？'&&Lc.indexOf(CUP)>0&&Lc.indexOf(CUP)<Lc.indexOf('杯子放著就好，慢慢來。')&&G.flags.zhiruoCupNote===true,JSON.stringify(Lc));
    fresh(Y1S1+3,15,'cafe'); SOCIAL.meet('heroine_02','cafe'); G.flags.CAFE_VISITS=7; G.flags.zhiruoFirstOrder='拿鐵'; setRel(70,50,45); await EVENTS.run(e); const Ld=lines();
    check('Z1 好朋友、第 8 次（直接做）：「拿鐵。……我已經在做了。」之後是紙杯旁白',Ld[0]==='拿鐵。……我已經在做了。'&&Ld[1]===CUP,JSON.stringify(Ld));
    fresh(Y1S1+3,15,'cafe'); SOCIAL.meet('heroine_02','cafe'); G.flags.CAFE_VISITS=2; setRel(70,50,45); picks=['只是看看']; await EVENTS.run(e);
    check('Z1 好朋友「只是看看」：沒點就沒有紙杯',!lines().includes(CUP)&&!G.flags.zhiruoCupNote,JSON.stringify(lines())); }
  /* ---------- 舊存檔：點過、沒有計數 → 讀檔補成 1 ---------- */
  { const src=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); const a=src.indexOf('  function migrate(s){'), b=src.indexOf('  function ls(){',a); const body=src.slice(a,b);
    const migrate=new Function('defaults','SAVE_VER',body+'; return migrate;')(()=>({rel:{}}),3);
    const s1=migrate({v:3,name:'x',rel:{},flags:{},events:{done:{ev_cafe_barista_zhiruo:3}}}), s2=migrate({v:3,name:'x',rel:{},flags:{CAFE_VISITS:4},events:{done:{ev_cafe_barista_zhiruo:5}}}), s3=migrate({v:3,name:'x',rel:{},flags:{},events:{done:{}}});
    const s4=migrate(migrate({v:3,name:'x',rel:{},flags:{},events:{done:{ev_cafe_barista_zhiruo:1}}}));
    check('舊存檔：點過、沒有計數 → 1；已有計數不動；沒點過不加；讀兩次一樣',s1.flags.CAFE_VISITS===1&&s2.flags.CAFE_VISITS===4&&s3.flags.CAFE_VISITS===undefined&&s4.flags.CAFE_VISITS===1,JSON.stringify([s1.flags,s2.flags,s3.flags,s4.flags])); }
  /* ---------- 引擎 ---------- */
  { fresh(Y1S1,10,'dorm'); G.flags.k=2; await EVENTS.runLines([{inc:{k:3}},{setOnce:{a:'x'}},{setOnce:{a:'y'}},{stamp:['d']},{speaker:null,text:'{flag:a}/{flag:none|預設}'},{if:{flagNum:{k:{min:5,max:5}}},speaker:null,text:'五'},{if:{flagNum:{z:{max:0}}},speaker:null,text:'沒有＝0'}],{});
    check('引擎：inc、setOnce、stamp、{flag:key|預設}、flagNum',G.flags.k===5&&G.flags.a==='x'&&G.flags.d===G.day&&JSON.stringify(lines())===JSON.stringify(['x/預設','五','沒有＝0']),JSON.stringify({flags:G.flags,L:lines()})); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
