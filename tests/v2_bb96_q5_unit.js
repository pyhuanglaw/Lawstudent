// 交接包 v2（BB_96 4-4、AA_13 G3）：子晴 Q5「你負責拍手」——吉他社成發——不需要瀏覽器。修改前沒有（第 1 項失敗）。
// 檢查：成發活動（大一下第 14 週週三 19–21 萬才館大廳）；第 13 週週三的群組邀請；照玩家流程參加（attendActivity）播 Q5；拍手／坐著聽完／先走三種；
//   貼紙兩種（雙方單身＋朋友以上直接貼、其他遞給你）；隔天的手機（看到一半、你沒來）；ZQ_SHOW；CLAPPED
// 用法：node tests/v2_bb96_q5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const e=ev('ev_ziqing_show'), A=ACTIVITIES.list.find(a=>a.id==='guitar_show_y1s2');
  check('Q5：事件、成發活動都在',!!e&&!!A);
  if(!e||!A){ console.log('FAILED '+fails); process.exit(1); }
  const dShow=termDay('Y1S2',14,3), dInv=termDay('Y1S2',13,3);
  check('成發：大一下第 14 週週三 19:00–21:00、萬才館大廳（第 13 週、週四、大一上沒有）；去看＝演 Q5',ACTIVITIES.on(A,dShow)&&!ACTIVITIES.on(A,dInv)&&!ACTIVITIES.on(A,dShow+1)&&A.t0===19&&A.t1===21&&A.zone==='wancai'&&A.event==='ev_ziqing_show');
  const lawL=ACTIVITIES.list.find(a=>a.id==='lawclub_study'); check('法服讀書會停用（AA_218 17-4）：成發那晚不再撞期',!ACTIVITIES.on(lawL,dShow));
  { fresh(dInv,20,'dorm'); PHONE.join(G,'guitar','吉他社'); run(20,22); check('第 13 週週三 21:30 吉他社群組：子晴「期末成發你要來。這不是問句。」',txt('g:guitar').slice(-1)[0]==='heroine_04:期末成發你要來。這不是問句。',JSON.stringify(txt('g:guitar'))); }
  const nm=CHARACTERS.heroine_04.name;
  const show=async(pick,o)=>{ o=o||{}; fresh(dShow,19.05,'wancai',o.flags||{}); SOCIAL.meet('heroine_04','wancai'); if(o.fam) R('heroine_04',...o.fam); picks=[pick]; await CLS.attendActivity(GM,A,{}); return lines(); };
  { let L=await show('拍手');
    const base=['（後台。）',nm+'：欸不是，我手在抖。',nm+'：我寫程式從來不抖。','（第二首，她按錯一個和弦。全場安靜一秒。她自己先笑出來。）',nm+'：（對著麥克風）這個 bug 我下次修。','（全場笑。）'];
    const i=L.indexOf(base[0]);
    check('照玩家流程參加成發（attendActivity）：台詞照原文',i>=0&&JSON.stringify(L.slice(i,i+6))===JSON.stringify(base),JSON.stringify(L.slice(i,i+6)));
    check('演出中三選一：拍手／坐著聽完／先走',JSON.stringify(opts[0])==='["（拍手）","（坐著聽完）","（先走）"]',JSON.stringify(opts[0]));
    check('拍手：「我看到你了。你拍得超大聲。很丟臉。……謝啦。」＋（她遞給你一張插座貓貼紙。）；CLAPPED；ZQ_SHOW clap',L.includes(nm+'：我看到你了。你拍得超大聲。很丟臉。……謝啦。')&&L.includes('（她遞給你一張插座貓貼紙。）')&&SOCIAL.has('heroine_04','CLAPPED')&&G.flags.ZQ_SHOW==='clap',JSON.stringify(L.slice(i+6)));
    L=await show('拍手',{fam:[45,30,30]}); check('雙方都單身、和她朋友以上：貼紙直接貼在你的手機殼上',L.includes('（她把一張插座貓貼紙，直接貼在你的手機殼上。）'),JSON.stringify(L.slice(-3)));
    L=await show('拍手',{fam:[45,30,30],flags:{dating_kexin:true}}); check('交往中：照樣是遞給你（不是貼在手機上）',L.includes('（她遞給你一張插座貓貼紙。）')&&!L.some(t=>/手機殼/.test(t)));
    L=await show('坐著聽完'); check('坐著聽完：（她下台經過，點個頭。）「你有來。」；沒有 CLAPPED；ZQ_SHOW came',L.includes('（她下台經過，點個頭。）')&&L.includes(nm+'：你有來。')&&!SOCIAL.has('heroine_04','CLAPPED')&&G.flags.ZQ_SHOW==='came');
    L=await show('先走'); G.hour=21.3; run(21.3,23); G.day=dShow+1; run(9,10.5);
    check('先走：隔天 10:00 手機「你看到一半。後半比較好。」；沒有 CLAPPED',txt('p:heroine_04').slice(-1)[0]==='heroine_04:你看到一半。後半比較好。'&&!SOCIAL.has('heroine_04','CLAPPED')&&G.flags.ZQ_SHOW==='half',JSON.stringify(txt('p:heroine_04').slice(-2))); }
  /* 沒去 */
  { const absent=(o)=>{ fresh(dShow,18,'dorm',o.flags||{}); SOCIAL.meet('heroine_04','wancai'); if(o.grp) PHONE.join(G,'guitar','吉他社'); if(o.grp) PHONE.at(G,dInv,21.5,[{th:'g:guitar',from:'heroine_04',text:'期末成發你要來。這不是問句。'}],'zq_show_inv'); run(18,23); G.day=dShow+1; run(9,10.5); return txt('p:heroine_04'); };
    let L=absent({grp:true}); check('收到邀請卻沒去：隔天 10:00「你沒來」（沒有標點）；ZQ_SHOW absent；之後一週她不約（zqColdUntil）',L.slice(-1)[0]==='heroine_04:你沒來'&&G.flags.ZQ_SHOW==='absent'&&G.flags.zqColdUntil===dShow+8,JSON.stringify(L.slice(-1)));
    L=absent({flags:{CLUB_club_guitar:true}}); check('吉他社的人（沒有群組）沒去：一樣「你沒來」',L.slice(-1)[0]==='heroine_04:你沒來');
    L=absent({}); check('沒收到邀請、不是吉他社：沒有訊息',!L.some(t=>/你沒來/.test(t))&&G.flags.ZQ_SHOW==null); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
