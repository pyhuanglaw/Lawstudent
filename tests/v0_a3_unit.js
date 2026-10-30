// v0 第 2 批（交接包 v0 A3；AA_106 第 3 節）：經濟系／法律系兩種開局、存檔階段 G.stage、開場劇情的日子——不需要瀏覽器。
// 檢查：新遊戲預設 stage 'law'、舊存檔 migrate 補 'law'；法律系開局先放④＋③的摘要再進第一天；經濟系開局 2024-09-01（日）21:00 男宿、stage 'econ'、還沒交往；
//       STORY.opening：法律系第 1、2 天、經濟系 9/1；經濟系其他日子一鍵上課、跳過時間、時段次數都照常（原本 G.day<3 會把整個經濟系年鎖住）；法律系事件在經濟系那年不觸發。
// 修改前：沒有 STORY.opening、newGameEcon（第 1 項就失敗）。用法：node tests/v0_a3_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:'?start0'};   /* 舊開局（9/17）；新遊戲預設是宿營（CAMP-L1），新開局的轉場在 start_b_unit 第 14、15 項 */
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
(async()=>{
  check('有 STORY.opening、newGameEcon、LAW_START_RECAP',typeof STORY.opening==='function'&&typeof STORY.newGameEcon==='function'&&STORY.LAW_START_RECAP.length===10);
  const gsrc=fs.readFileSync(path.join(ROOT,'src/game3d.js'),'utf8'); check('新遊戲的預設存檔 stage:\'law\'（migrate 用 defaults 補，舊存檔＝法律系）',/function defaults\(name\)\{ return \{v:SAVE_VER,stage:'law'/.test(gsrc)&&/for\(const k in d\)\{ if\(s\[k\]===undefined\|\|s\[k\]===null\) s\[k\]=d\[k\]; \}/.test(gsrc));
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); check('標題畫面：經濟系開局的按鈕預設藏著（v0 做完以前，網址 ?y0 才出現）',/id="btnNewEcon"/.test(html)&&/class="btn hide" id="btnNewEcon"/.test(html)&&/\[\?&\]y0/.test(gsrc));
  const Y0=STORY.y0Day1(); check('前提：2024-09-01 是負的天數、週日',Y0<0&&CALENDAR.dateOf(Y0).key==='2024-09-01'&&CALENDAR.dateOf(Y0).wd%7===0,String(Y0));
  /* opening */
  check('opening：法律系第 1、2 天是、第 3 天不是',STORY.opening({day:1})&&STORY.opening({day:2})&&!STORY.opening({day:3}));
  check('opening：經濟系 9/1 是；9/2 以後不是（一鍵上課、時段次數照常）',STORY.opening({stage:'econ',day:Y0})&&!STORY.opening({stage:'econ',day:Y0+1})&&!STORY.opening({stage:'econ',day:Y0+30}));
  { fresh(Y0+2,10,'dorm',{}); G.stage='econ'; const why=CLS.canSkip({G,E,D:{active:false}}); check('經濟系 9/3：跳過時間可以用（原本 G.day<3 寫死，整年都不能跳）',why==='',why);
    check('經濟系 9/3：時段次數照常（slotsOn）',CLS.slotsOn(G)); }
  /* 法律系開局 */
  { fresh(1,21.2,'dorm',{}); G.flags={dating_kexin:true}; said=[]; const E0=GM.E; GM.E=Object.assign({},E,{player:{busy:false},endCinematic(){},setWeather(){}}); GM.titleIdle=true; GM.hideHUD=()=>{}; let entered=null; const en=GM.enter; GM.enter=async(z)=>{ entered=z; G.zone=z; };
    await STORY.newGame(GM); GM.enter=en; GM.E=E0; const L=said.map(s=>s.t);
    check('法律系開局：先放④（10 句，AA_224 第 2 組）再放③（4 句），然後進宿舍（現有的第一天）',L[0]==='你從小就想念首都帝大法律。'&&L[9]==='九月，你回到同一個校園，換了一個系。'&&L[10]==='開學第一週，你走進法律系館A。沒有人知道你來過這個校園。'&&L.length===14&&entered==='dorm'&&G.day===1&&G.stage==='law',JSON.stringify({n:L.length,first:L[0],entered,day:G.day}));
    check('法律系開局：記下看過摘要（舊存檔另外處理）',G.flags.LAW_RECAP_SEEN===true); }
  /* 經濟系開局 */
  { fresh(1,21.2,'dorm',{}); G.flags={dating_kexin:true,KX_DEC3_MIGRATED:true,E01_DONE:true}; /* E01（宿舍第一晚）另外在 tests/v0_e01_unit.js 測；這裡只看開局的狀態 */ const E0=GM.E; GM.E=Object.assign({},E,{player:{busy:false},endCinematic(){},setWeather(){}}); GM.hideHUD=()=>{}; let card=null; GM.titleCard=async(a,b)=>{ card=a+'｜'+b; };
    await STORY.newGameEcon(GM); GM.E=E0; GM.titleCard=async()=>{};
    check('經濟系開局：2024-09-01（日）21:00、男宿、stage econ',G.stage==='econ'&&G.day===Y0&&G.weekday===0&&Math.abs(G.hour-21)<1e-6&&G.zone==='dorm',JSON.stringify({stage:G.stage,day:G.day,wd:G.weekday,h:G.hour}));
    check('經濟系開局：還沒和可昕交往（dating_kexin false）、法律系第一天的可昕訊息不補（KX_FIRST_MSG）',G.flags.dating_kexin===false&&G.flags.KX_FIRST_MSG===true);
    check('經濟系開局：標題卡「2024 年 9 月 1 日（日）｜開學前一天」（AA_168 第 1 節）',card==='2024 年 9 月 1 日（日）｜開學前一天',card); }
  /* 事件的階段 */
  { fresh(Y0+20,15,'campus',{introDone:true,classDone:true,afternoonDone:true}); G.stage='econ'; const law=STORY_EVENTS.filter(e=>!e.retired&&!e.off&&!e.stage); const fired=law.filter(e=>EVENTS.check(e));
    check('經濟系那一年：現有的法律系事件一個都不觸發（stage 不同）',fired.length===0,fired.slice(0,5).map(e=>e.id).join(','));
    G.stage='law'; G.day=40; G.weekday=wdOf(40); check('法律系：照常可以觸發（stage 預設 law）',law.some(e=>EVENTS.check(e))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
