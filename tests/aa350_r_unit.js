// AA_350 第 7 節 R 節（企劃線 cae5cc76）——不需要瀏覽器。用法：node tests/aa350_r_unit.js
//   R2 ev_sk03_lunch：加一條路——那個週五沒去經原下、12:00～13:00 下課選單選「先去吃飯→活大」＝在活大演（開頭「……你今天沒來上課。坐。」、不出選項、直接接 go；還債、第一次、芯慈的先後照舊）
//   R5 法學研究第 11 週引用大四上那一題（B_Y4S1_public_judgment_sem_w3）沒有紀錄：美國路線／其他沒去的兩句（CLS.RECALL_MISSED）
//   R7 交往當天起祐廷說出口的「學姊」換句（兩點半 Café 選一個「書瑀。」）；掃全部事件，交往中可能播到的「學姊」都要有交往中的版本
// 修改前（開發分支 10dc79b1）：R2 七項 FAIL 4（R2-0、R2-4、R2-5 是前提和防回歸）；R5 三項 FAIL 1（R5-1；R5-0、R5-2 是前提和防回歸）；R7 兩項都 FAIL。
// R7-2 的表加一筆（AA_522 第 2 節，企劃線 fcc93126e；NPC-STORY2-1028）：ev_prof_xu_office 大三的選項「溫書瑀學姊是老師的學生？」是對許教授說的，和 ev_sis_office_together 同一類（對第三人說，R7 沒有寫法）：等 AA。
//   AA 定了（AA_522 第 8 節第 2 點，f36dfe3cf）：交往中那一題換「學姊的論文，老師覺得怎麼樣？」（對許教授說，稿上就是「學姊」）；原本那一題加 unless 交往中。表上那一筆的原因照改（檢查本身沒變）。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|SYLLABUS|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/syllabus.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js',
  'src/data/y2b_events.js','src/data/group_events.js','src/data/r2y3a_events.js','src/data/r2y3b_events.js','src/data/jp_events.js','src/data/r2y4a_events.js','src/data/r2y4b_events.js','src/data/r3_events.js','src/data/us_life_events.js','src/data/y1fill_events.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);   /* 後面那幾個事件包：R7 掃全部的事件 */
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(){},setBg(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], caps=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(w,t)=>caps.push(t),sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,stage:'law',day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,classDone:true,afternoonDone:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
(async()=>{
  /* ===================== R2 ev_sk03_lunch 的活大那一條 ===================== */
  const F2=termDay('Y1S2',2,5), F13=termDay('Y1S2',13,5), F11=termDay('Y1S2',11,5), W11T=termDay('Y1S2',11,4), F12=termDay('Y1S2',12,5);
  const base={P4D_ANSWER:'retake',ECON_HALLWAY_DAY:F2,MET_XUN:true,MET_PINYU:true};
  const econIt=()=>CLS.dayItems(G).find(q=>q.c&&q.c.id==='econ_principles_2');
  /* 那個週五沒去經原下：h 點在下課選單選「先去吃飯」→ 選 meal（'活大'／'阿鳳麵店'）*/
  const huoda=async(day,h,flags,meal,attended)=>{ fresh(day,h,'putong',Object.assign({},base,flags)); if(attended){ const it=econIt(); if(it) CLS.rec(G).done[it.key]=1; } const m0=G.money; picks=[meal||'活大']; said=[]; opts=[]; caps=[]; const r=await CLS.lunchBreak(GM); return {r,L:lines(),opts:opts.slice(),paid:m0-G.money,caps:caps.slice()}; };
  check('R2-0. 第 11、12、13 週週五是有經原下的日子（不是放假、不是期中考：第 8、9 週期中考不能翹、也不演；第 10 週週五 5/1 放假）',[F13,F11,F12].every(d=>{ fresh(d,12.2,'putong',base); const it=econIt(); return !!it&&!it.exam; }));
  { const x=await huoda(F13,12.3,{SK03_FIRST:true,SK03_N:0});
    check('R2-1. 第 13 週週五沒去經原下、12:18 選「活大」：第一句「阿勳：……你今天沒來上課。坐。」，沒有走廊那兩句、不出「一起去／今天不行」，接平常的週五（1-2）',
      x.r===true&&x.L[0]==='阿勳：……你今天沒來上課。坐。'&&!x.L.some(t=>/走不走|你要來就來/.test(t))&&x.opts.length===1&&!x.opts.flat().some(t=>/一起去|今天不行/.test(t))&&x.L.some(t=>t.includes('永遠在講統計')),JSON.stringify([x.L,x.opts]));
    check('R2-1. 記的跟「一起去」一樣：SK03_LAST、SK03_ASKED、SK03_INV1、SK03_N +1、習慣 meal:xiaofu:fri；快轉到 13:00「午休結束。」；付了活大的錢（90 元）；記 SK03_HUODA',
      G.flags.SK03_LAST===F13&&G.flags.SK03_ASKED===F13&&G.flags.SK03_INV1===true&&G.flags.SK03_N===1&&EVENTS.habitCount({key:'meal:xiaofu:fri'})===1&&Math.abs(G.hour-13)<1e-6&&x.caps.includes('午休結束。')&&x.paid===90&&G.flags.SK03_HUODA===F13,JSON.stringify([G.flags.SK03_LAST,G.flags.SK03_ASKED,G.flags.SK03_N,G.hour,x.caps,x.paid])); }
  { const x=await huoda(F13,12.3,{});
    check('R2-2. 第一次去（沒有 SK03_FIRST）：活大那一句以後接 1-1（「週五的活大。阿勳占了靠窗的四人桌…」「重修生？你看起來很有覺悟。」）',x.L[0]==='阿勳：……你今天沒來上課。坐。'&&x.L.includes('週五的活大。阿勳占了靠窗的四人桌，品妤已經在吃了。')&&x.L.includes('品妤：重修生？你看起來很有覺悟。')&&G.flags.SK03_FIRST===true,JSON.stringify(x.L)); }
  { const x=await huoda(F11,12.3,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true});
    check('R2-3. 第 11 週週五（10-3 一起讀到閉館的隔天）沒去經原下、去活大：照樣還債（「昨天那題的。還債。」）、沒有走廊那句「昨天那題我想通了。」',x.L[0]==='阿勳：……你今天沒來上課。坐。'&&x.L.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&!x.L.includes('阿勳：昨天那題我想通了。')&&G.flags.XUN_REPAID===true,JSON.stringify(x.L)); }
  { const a=await huoda(F13,12.3,{SK03_FIRST:true},'活大',true), b=await huoda(F13,13.1,{SK03_FIRST:true}), c=await huoda(F13,12.3,{SK03_FIRST:true},'阿鳳麵店'), d=await huoda(F13,12.3,{SK03_FIRST:true,SK03_ASKED:F13}), e=await huoda(F13+1,12.3,{SK03_FIRST:true}), f=await huoda(F13,11.9,{SK03_FIRST:true});
    const plain=x=>x.r===true&&!x.L.length&&x.caps.some(t=>/自助餐|乾麵/.test(t));
    check('R2-4. 不演的（照一般的吃飯）：去上了經原下、13:06、11:54、選阿鳳麵店、那天已經演過、週六',plain(a)&&plain(b)&&plain(c)&&plain(d)&&plain(e)&&plain(f),JSON.stringify([a,b,c,d,e,f].map(x=>[x.L.length,x.caps]))); }
  { fresh(F13,12.17,'putong',Object.assign({},base,{SK03_FIRST:true})); picks=['一起去']; said=[]; opts=[]; await CLS.afterClassEvent(GM,{c:{id:'econ_principles_2'}}); const L=lines();
    check('R2-5. 走廊那一條照舊（防回歸）：「活大。走不走？」＋「一起去／今天不行」',L[0]==='阿勳：活大。走不走？'&&JSON.stringify(opts[0])==='["「一起去」","「今天不行」"]'&&!L.includes('阿勳：……你今天沒來上課。坐。'),JSON.stringify([L,opts])); }

  /* ===================== R5 法學研究第 11 週引用大四上那一題 ===================== */
  { const wk=((SYLLABUS.courses||{}).legal_research||[]).find(w=>w.w===11), rc=wk&&wk.obs&&wk.obs.recall||[], r4=rc.find(x=>x.record==='B_Y4S1_public_judgment_sem_w3'), r1=rc.find(x=>x.record==='B_Y1S1_const_1_w11'), it={c:{id:'legal_research'},week:11};
    check('R5-0. 課表：法學研究第 11 週的回想引用大一憲法第 11 週、大四上公法判決研討第 3 週；大四上那一筆沒有 missed',!!r4&&!!r1&&!r4.missed);
    const at=(route,disc)=>{ fresh(termDay('Y4S2',11,1),14,'wsem',route?{EXCHANGE_ROUTE:route}:{}); if(disc!=null) CLS.rec(G).disc.B_Y4S1_public_judgment_sem_w3=disc; return CLS.recallText(G,r4,it); };
    const us=at('US'), tw=at('TW'), none=at(null), jp=at('JP');
    check('R5-1. 大四上那一堂沒有紀錄：美國路線「（大四上那一堂，你在美國。老師講的那一題，你是第一次聽。）」；其他（台灣、日本、沒選）「（大四上那一堂，你不在。老師講的那一題，你是第一次聽。）」',
      us==='（大四上那一堂，你在美國。老師講的那一題，你是第一次聽。）'&&[tw,none,jp].every(t=>t==='（大四上那一堂，你不在。老師講的那一題，你是第一次聽。）'),JSON.stringify([us,tw,none,jp]));
    const said0=at('TW',0), ch0=(((SYLLABUS.courses.public_judgment_sem||[]).find(w=>w.obs&&w.obs.record==='B_Y4S1_public_judgment_sem_w3')||{}).obs||{}).options||[];
    check('R5-2. 有紀錄的照舊（防回歸）：「大四上的你：「{選的那一句}」」；大一那一筆沒有紀錄照舊「（大一那一堂，你不在。…）」',!!ch0.length&&said0==='大四上的你：「'+ch0[0].text+'」'&&(fresh(termDay('Y4S2',11,1),14,'wsem',{}),CLS.recallText(G,r1,it))==='（大一那一堂，你不在。老師講的那一題，你是第一次聽。）',JSON.stringify(said0)); }

  /* ===================== R7 交往當天起祐廷不叫「學姊」 ===================== */
  { const e=STORY_EVENTS.find(x=>x.id==='ev_two_hearts_cafe'), ch=e&&e.dialogue.find(l=>l.choice&&l.choice.some(c=>c.set&&c.set.TWO_HEARTS_PICK));
    const shown=flags=>{ fresh(termDay('Y3S1',10,4),22.6,'cafe',flags); return ch.choice.filter(c=>(!c.if||EVENTS.cond(c.if))&&(!c.unless||!EVENTS.cond(c.unless))).map(c=>c.text+'>'+c.set.TWO_HEARTS_PICK); };
    const a=shown({dating_heroine_01:true,dating_heroine_05:true}), b=shown({dating_heroine_01:true});
    check('R7-1. 兩點半 Café 選一個（ev_two_hearts_cafe，兩個都在交往中）：祐廷叫學姊「書瑀。」（不是「學姊。」）；沒和學姊交往的寫法照原句',
      JSON.stringify(a)==='["「書瑀。」>heroine_05","「以安。」>heroine_01"]'&&JSON.stringify(b)==='["「學姊。」>heroine_05","「以安。」>heroine_01"]',JSON.stringify([a,b])); }
  { /* 防回歸：祐廷說出口的「學姊」（選項、speaker player），沒有「交往中換句」的事件只能是下面這幾場（交往以前一定已經過了的；或待 AA 定的）。新加的要照 R7 換句或加進這張表並寫原因 */
    const OK={ev_sis_w1:'大一上認識她',ev_sis_fam_hall:'大一上第 2 週',ev_sis_fam_hall2:'大一上第 2 週',ev_sis_fam_dinner:'大一上家聚',ev_sis_club_expo:'大一上社團博覽會',ev_sis_festival_booth:'大一上第 11 週',ev_sis_family_dinner:'大一上第 14 週',ev_sis_empty_flask:'大一上第 8、9 週',ev_sis_canyon:'告白那一場（還沒交往）',ev_sis_w1_late:'第一次認識她的晚到版（AA_379 §3：大一下以後才第一次在 Café、法圖遇到）',
      ev_sis_office_together:'「學姊叫我來的。」是對許教授說的，R7 沒有對第三人說的寫法：等 AA',
      ev_prof_xu_office:'大三交往中那一題「學姊的論文，老師覺得怎麼樣？」是 AA 定的交往中版本（AA_522 第 8 節第 2 點，f36dfe3cf；對許教授說，稿上就是「學姊」）；沒交往的「溫書瑀學姊是老師的學生？」有 unless 交往中',
      ev_family_dinner:'大一下 3/20 咖哩；「學姊好，我是…」只在還沒認識她（沒有 SIS_W1）時說（AA_470 5-1）',ev_family_xmas_y1:'大一上 12/22 家族聖誕；同上（AA_470 5-1）',ev_sis_results_dinner_y1:'大一下 3/27 上榜聚餐；同上（AA_470 5-1）',ev_sis_fam_study:'大三上 9/16 家族讀書會；同上（AA_470 12-4）'};
    const src=v=>typeof v==='function'?String(v):JSON.stringify(v,(k,x)=>typeof x==='function'?String(x):x)||'';
    const guarded=l=>!!l.unless&&/heroine_05/.test(src(l.unless))&&/dating/.test(src(l.unless));
    const bad=[];
    const walk=(ev,lines)=>{ for(const l of (lines||[])){ if(!l||typeof l!=='object') continue;
      if(l.choice) for(const c of l.choice){ if(/學姊/.test(c.text||'')&&!guarded(c)) bad.push(ev.id+'：'+c.text); if(c.say) walk(ev,c.say); }
      if((l.speaker==='player'||l.phoneMe)&&/學姊/.test(l.text||'')&&!guarded(l)) bad.push(ev.id+'：'+l.text); } };
    for(const ev of STORY_EVENTS){ if(ev.retired||ev.off) continue; walk(ev,ev.dialogue); }
    const extra=bad.filter(x=>!OK[x.split('：')[0]]);
    check('R7-2. 交往中可能播到、祐廷說出口的「學姊」：除了交往以前的那幾場（和等 AA 的許教授那一句）都已經有交往中的版本',!extra.length&&bad.length>0,JSON.stringify(extra.length?extra:bad.length)); }

  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
