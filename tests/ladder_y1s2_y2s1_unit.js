// 大一下（AA_209，3b7e2268→e2bdcece 交往版）、大二上（AA_211，0ba8d336）閒聊階梯：白名單匯入＋資料做不到的程式點（AB65-3-Y1S2-L、AB65-3-Y2S1-L）。用法：node tests/ladder_y1s2_y2s1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
const stepOf=(term,who,id)=>{ const L=LADDER.byTerm[term][who]; return [L.steps.find(s=>s.id===id),L.steps.findIndex(s=>s.id===id)]; };
(async()=>{
  check('0. ladder.js 來自匯入白名單（2026-10-17 一次匯入 AA 25e89f6e；2026-10-20 AA-C 定稿 14 檔改 49ed7e6a）',/白名單/.test(LADDER.source)&&LADDER.source.includes('25e89f6e')&&LADDER.source.includes('49ed7e6a'),LADDER.source);
  { const st=LADDER.byTerm.Y1S2.heroine_01.steps.find(x=>x.id==='A2-L1'), y3=LADDER.byTerm.Y1S2.heroine_03.steps.find(x=>x.id==='Y2-L3');
    check('0b. ROM-1017 交往版：A2-L1 選項②回覆「等我多練幾次，現在煎得還不好看。」、交往中多一句（extraIf dating_heroine_01）；Y2-L3 交往中多一句（dating_heroine_03）',st&&st.choices[1].reply==='等我多練幾次，現在煎得還不好看。'&&(st.extraIf||[]).some(x=>JSON.stringify(x.if||{}).includes('dating_heroine_01'))&&y3&&(y3.extraIf||[]).some(x=>JSON.stringify(x.if||{}).includes('dating_heroine_03')),JSON.stringify([st&&st.choices[1],y3&&y3.extraIf])); }
  // A-L11（大一上以安；AA_238 5-5 讀書會改到大一上，「我可以去嗎？」從 A2-L6 搬來）去過公法讀書會的不出現
  fresh(termDay('Y1S1',11,2),12,'campus',{}); let [st]=stepOf('Y1S1','heroine_01','A-L11');
  check('1. A-L11 沒去過公法讀書會：兩個選項都有（含「我可以去嗎？」）',STORY.ladChoices(st).map(c=>c.t).includes('「我可以去嗎？」'),JSON.stringify(STORY.ladChoices(st).map(c=>c.t)));
  G.events.done.ev_public_law_group=1;
  check('1. A-L11 去過公法讀書會（ev_public_law_group）：「我可以去嗎？」不出現、另一個還在',!STORY.ladChoices(st).map(c=>c.t).includes('「我可以去嗎？」')&&STORY.ladChoices(st).length===1,JSON.stringify(STORY.ladChoices(st).map(c=>c.t)));
  // A3-L3（大二上以安）「三條是哪三條？」看過規則的不出現
  fresh(termDay('Y2S1',5,2),12,'campus',{}); [st]=stepOf('Y2S1','heroine_01','A3-L3');
  check('2. A3-L3 沒看過讀書會規則：「三條是哪三條？」在',STORY.ladChoices(st).map(c=>c.t).includes('「三條是哪三條？」'));
  G.flags.PLG_RULES_SEEN=true;
  check('2. A3-L3 看過規則（PLG_RULES_SEEN）：「三條是哪三條？」不出現',!STORY.ladChoices(st).map(c=>c.t).includes('「三條是哪三條？」')&&STORY.ladChoices(st).length===1);
  // K3-L7（大二上可昕）選項①回覆依電影夜
  fresh(termDay('Y2S1',15,2),12,'campus',{dating_kexin:true}); [st]=stepOf('Y2S1','kexin','K3-L7'); const c1=st.choices.find(c=>c.t==='「我看電影很認真。」');
  check('3. K3-L7 選項①沒去電影夜：「真的嗎？那下次我坐你旁邊看。」',STORY.ladReply(st,c1)==='真的嗎？那下次我坐你旁邊看。',STORY.ladReply(st,c1));
  G.events.done.ev_kexin_film_night=1;
  check('3. K3-L7 選項①去過電影夜：原本的回覆（「我知道。你哭的時候也很認真。」）',STORY.ladReply(st,c1)===c1.reply&&/哭的時候/.test(c1.reply),STORY.ladReply(st,c1));
  const c2=st.choices.find(c=>c.t!=='「我看電影很認真。」'); check('3. K3-L7 選項②不受影響',STORY.ladReply(st,c2)===c2.reply);
  // A4-L5、A4-L7（大二下以安）和她交往中的回覆（ROM-1017，AA-C b39f0bb9 的 note）
  for(const [id,ct,def,dat] of [['A4-L5','「妳跟我講話好像也是。」','真的？我自己沒發現。','真的？……跟你講話本來就不用敬語啊。'],['A4-L7','「讀書會可以先交給 Alison。」','嗯。家教比較難，學生才剛習慣我。','嗯。……還有你，半年見不到。']]){   /* AA_255 改稿（25e89f6e）*/
    fresh(termDay('Y2S2',6,2),12,'campus',{}); const [s4]=stepOf('Y2S2','heroine_01',id); const ch=s4.choices.find(c=>c.t===ct);
    check('3b. '+id+' '+ct+'：沒交往＝原本的回覆',STORY.ladReply(s4,ch)===def,STORY.ladReply(s4,ch));
    G.flags.dating_heroine_01=true; check('3b. '+id+' '+ct+'：和以安交往中＝交往版「……還有你。」',STORY.ladReply(s4,ch)===dat,STORY.ladReply(s4,ch));
    const other=s4.choices.find(c=>c.t!==ct); check('3b. '+id+' 另一個選項不受影響',STORY.ladReply(s4,other)===other.reply); }
  // 學姊招呼「值班表你看了嗎？」只說一次、只給法服成員
  const greetAt=(day,flags)=>{ fresh(day,10,'campus',flags); return STORY.ladGreet(G,'heroine_05'); };
  const d7=termDay('Y2S1',7,1);
  let g=greetAt(d7,{}); check('4. 不是法服成員：第 7 週不說「值班表你看了嗎？」',!/值班表你看了嗎/.test(g||''),g);
  g=greetAt(d7,{lawclub:true}); check('4. 法服成員第 7 週也不說（BB 2026-10-17：學姊不參加法服週六服務，這句刪了）',!/值班表你看了嗎/.test(g||''),g);
  G.day=d7+1; G.weekday=wdOf(G.day); const g2=STORY.ladGreet(G,'heroine_05'); check('4. 隔天同一個存檔：不再說第二次（只說一次）',!/值班表你看了嗎/.test(g2||''),g2);
  // A3-L6、Y3-L5：演過 ev_yu_together 從第 15 週可以播
  const atStep=(who,id,week,done)=>{ fresh(termDay('Y2S1',week,2),12,'campus',{}); R(who,...LV.FAM); const [s,i]=stepOf('Y2S1',who,id); const D=STORY.ladData(G,who); G.social.ladder=G.social.ladder||{}; G.social.ladderDay=G.social.ladderDay||{}; G.social.greetUsed=G.social.greetUsed||{}; G.social.ladder[D.key]=i; if(done) G.events.done.ev_yu_together=1; const n=STORY.ladNext(G,who); return n&&n.id; };
  for(const [who,id] of [['heroine_01','A3-L6'],['heroine_03','Y3-L5']]){
    check(`5. ${id} 第 15 週沒演過 ev_yu_together：不播`,atStep(who,id,15,false)!==id);
    check(`5. ${id} 第 15 週演過 ev_yu_together：可以播`,atStep(who,id,15,true)===id,atStep(who,id,15,true));
    check(`5. ${id} 第 16 週沒演過也照資料播`,atStep(who,id,16,false)===id);
  }
  // ROM-1017（BB_187，a73c6299）：交往中的芷若、子晴在大一下階梯多兩句（extraIf dating_*）
  for(const [who,id,flag] of [['heroine_02','Z2-L1','dating_heroine_02'],['heroine_04','Q2-L8','dating_heroine_04']]){
    fresh(termDay('Y1S2',5,2),12,'campus',{}); const [s2]=stepOf('Y1S2',who,id); const base=STORY.ladLines(s2,G,who).length;
    G.flags[flag]=true; const L2=STORY.ladLines(s2,G,who); const ex=s2.extraIf[0].lines;
    check(`6. ${id} 交往中（${flag}）多兩句；沒交往不出現`,base===s2.lines.length&&L2.length===base+ex.length&&ex.every(x=>L2.map(y=>typeof y==='string'?y:y.t).includes(x)),JSON.stringify(L2).slice(0,200));
  }
  check('6. 白名單：BB 的大一下（ladder_bb_y1s2）來自 49ed7e6a（AA-C 2026-10-20 定稿；之前 9fecc202、408398d7）',LADDER.source.includes('49ed7e6a'),LADDER.source);
  console.log(fails?`\nFAILED ${fails}`:'\nALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
