// 交接包 v3 D7：G1 考完走出教室（大二上版，AA_143 1-4）＋語彤事件 10 期中考那一週（AA_11 事件 10、AA_177 第 5 節）——不需要瀏覽器。
// 檢查：G1 接在刑法分則期中考之後、只有認識的人說話；語彤 10 的時間（大二上第 10 週起的週二、週四 20:45～21:15、麵店、朋友以上；大二下補；大三以後不演）、第一句的兩種、「位子空著」只有大一下期中去過總圖才有（含舊存檔的習慣記錄）。用法：node tests/v3_d7_unit.js
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
  const NM={'許柏翰':'柏翰','吳芯慈':'芯慈','沈以安':'以安','陳語彤':'語彤','不認識的女生':'以安'}; const lines0=lines; const linesN=()=>lines0().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const G1=ev('ev_midterm_walkout_y2'), Y10=ev('ev_yutong_midterm_week');
  check('0. 兩個事件都在',!!G1&&!!Y10);
  check('1. G1 大二上版：刑法分則期中考之後（afterClass crim_spec、afterExam mid、大二上），一次；刑法分則是大二上的課',G1.afterClass==='crim_spec'&&G1.afterExam==='mid'&&JSON.stringify(G1.term)==='["Y2S1"]'&&G1.once&&!!COURSES.list.find(c=>c.id==='crim_spec'&&c.term==='Y2S1'));
  const mid=[...Array(20).keys()].map(w=>termDay('Y2S1',w,2)).filter(d=>d!=null&&(CALENDAR.termOf(d)||{}).exam==='mid');
  check('1. 大二上有期中考週（刑法分則週二的考試在那裡）',mid.length>=1,JSON.stringify(mid.map(d=>CALENDAR.termOf(d).week)));
  const g1=async(know)=>{ fresh(mid[0],12.3,'classroom'); const k0=STORY.knows; STORY.knows=(id)=>id==='zhe'||know.includes(id); try{ said=[]; await EVENTS.run(G1); } finally { STORY.knows=k0; } return linesN(); };
  let L=await g1(['classmate_bohan','classmate_xinci','heroine_01']);
  check('1. 都認識：阿哲、柏翰、芯慈、以安照 AA_143 原文，以安後面一句「（她自己在手帳上偷偷對了一題）」',JSON.stringify(L)===JSON.stringify(['阿哲：第三題，我寫了一整面。……寫的是第二題的答案。','柏翰：大家都考幾分？……我是說，大家覺得考得怎樣。','芯慈：還沒考完的人在旁邊，小聲一點。','以安：考完的題目，不要對答案。理由：改不了。','（她自己在手帳上偷偷對了一題）']),JSON.stringify(L));
  L=await g1([]); check('1. 只認識阿哲：只有阿哲那一句（不認識的人不說話）',L.length===1&&/^阿哲：第三題/.test(L[0]),JSON.stringify(L));
  // 語彤 10 的時間
  const at=(term,w,wd,hh,stage)=>{ const d=termDay(term,w,wd); fresh(d,hh,'noodle'); R('heroine_03',...(stage||LV.FRI)); meet('heroine_03'); return EVENTS.check(Y10); };
  check('2. 大二上第 10 週週二 20:50、麵店、朋友：會演',at('Y2S1',10,2,20+50/60));
  check('2. 第 9 週不演；週三不演；20:30 不演；有點熟不演',!at('Y2S1',9,2,20+50/60)&&!at('Y2S1',10,3,20+50/60)&&!at('Y2S1',10,2,20.5)&&!at('Y2S1',10,4,21,LV.FAM));
  check('2. 大二上沒遇到：大二下週四 21:10 照樣演；大三上不演',at('Y2S2',3,4,21+10/60)&&!at('Y3S1',3,4,21));
  // 台詞
  const play=async(flags,pick)=>{ fresh(termDay('Y2S1',10,2),20.8,'noodle',flags); R('heroine_03',...LV.FRI); meet('heroine_03'); said=[]; opts=[]; picks=[pick]; await EVENTS.run(Y10); return {L:linesN(),O:opts[0]||[]}; };
  let r=await play({},'為什麼不說');
  check('3. 一般版：「大一期中考那週，你有沒有發現我不在圖書館？」→ 顧店、社會學理論 → 「後來那科是我考最好的一科。很好笑。」',r.L[0]==='語彤：大一期中考那週，你有沒有發現我不在圖書館？'&&r.L[1]==='語彤：阿姨扭到手。我每天顧店到打烊，在櫃台念社會學理論。客人都在看我念書。'&&r.L[2]==='語彤：後來那科是我考最好的一科。很好笑。',JSON.stringify(r.L));
  check('3. 大一下期中沒去過總圖：只有「妳那時候為什麼不說？」；選了＝「說了你要來幫我顧店嗎？」「……可以啊。」「你連蔥都不會切。」',r.O.length===1&&r.O[0]==='「妳那時候為什麼不說？」'&&r.L.slice(3).join('｜')==='語彤：說了你要來幫我顧店嗎？｜祐廷：……可以啊。｜語彤：你連蔥都不會切。',JSON.stringify(r));
  r=await play({yutong_hospital:true,Y1_MID_LIB:180},'位子空著');
  check('3. 阿姨講過扭到手（yutong_hospital）：第一句「你那週來過麵店，阿姨跟你講了吧。」；去過總圖：多一個「我那週有注意到妳的位子空著。」→「……你有注意到。」、記住',r.L[0]==='語彤：你那週來過麵店，阿姨跟你講了吧。'&&r.O.length===2&&r.L.includes('語彤：……你有注意到。')&&SOCIAL.has('heroine_03','NOTICED_EMPTY_SEAT'),JSON.stringify(r));
  // 舊存檔：習慣記錄
  { fresh(termDay('Y2S1',10,2),20.8,'noodle',{}); const d=termDay('Y1S2',8,3); G.habits={'place:library_hall:evening':{n:3,first:d-40,last:d,days:[d-40,d]}}; const a=STORY.y1MidLib(G); G.habits={'place:library_hall:evening':{n:2,first:d-40,last:d-30,days:[d-40,d-30]}}; const b=STORY.y1MidLib(G);
    check('4. 舊存檔沒有 Y1_MID_LIB：大一下第 8～9 週有去總圖的習慣記錄就算',a&&!b); }
  { fresh(termDay('Y1S2',8,3),19,'campus',{}); await STORY.onEnter('library_hall',GM,{fromLoad:true}).catch(()=>{}); const a=G.flags.Y1_MID_LIB; fresh(termDay('Y1S2',10,3),19,'campus',{}); await STORY.onEnter('library_hall',GM,{fromLoad:true}).catch(()=>{});
    check('4. 大一下第 8 週走進總圖＝記 Y1_MID_LIB；第 10 週不記',!!a&&!G.flags.Y1_MID_LIB,JSON.stringify([a,G.flags.Y1_MID_LIB])); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
