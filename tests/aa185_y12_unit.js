// AA_185 第 3 節（大一、大二的缺口補完，AA-B d85c1309）——不需要瀏覽器。
// 檢查：3-2 沛珊說分開（大二上第 6 週中午霖澤館二樓、沒遇到＝週五 21:00 麵店團群組、HEARD_PS_SPLIT、伴侶期間的 endEvent）；3-3 大二下 3/23 麵店團排春假（沒人 @ 沛珊）；3-4 可昕的三件物件分開以後；3-8 期中晚餐的旁白；3-11 慈 2 不需要慈 1。用法：node tests/aa185_y12_unit.js
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
  const NM={'郭沛珊':'沛珊','吳芯慈':'芯慈'}; const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  // 3-2
  const P=ev('ev_peishan_split'), mon=termDay('Y2S1',6,1), fri=termDay('Y2S1',6,5);
  { fresh(mon,12.3,'linze'); meet('classmate_peishan'); const ok=EVENTS.check(P); fresh(termDay('Y2S1',7,1),12.3,'linze'); meet('classmate_peishan'); const no=EVENTS.check(P); fresh(mon,13,'linze'); meet('classmate_peishan'); const no2=EVENTS.check(P);
    check('3-2. 大二上第 6 週週一 12:18 霖澤館：會演；第 7 週、13:00 不演',ok&&!no&&!no2); }
  { fresh(mon,12.3,'linze'); const e=STORY.schedEnt(CHARACTERS.classmate_peishan,G); check('3-2. 那一週中午她的作息在霖澤館二樓走廊（窗邊等柏翰）',e&&e.zone==='linze'&&e.at[3]===1,JSON.stringify(e)); }
  { fresh(mon,12.3,'linze'); meet('classmate_peishan'); said=[]; await EVENTS.run(P); const L=L0();
    check('3-2. 只認識她（沒看過 P3、還不熟）：AA_374 第 18 項的短的兩句（「跟你說一下，我跟柏翰分開了。」「我們都還好，讀書會照常。」）、沒有選項、記 HEARD_PS_SPLIT',JSON.stringify(L)===JSON.stringify(['沛珊：跟你說一下，我跟柏翰分開了。','沛珊：我們都還好，讀書會照常。'])&&G.flags.HEARD_PS_SPLIT===true&&!P.dialogue.some(l=>l.choice),JSON.stringify(L));
    check('3-2. 伴侶期間的 endEvent＝ev_peishan_split（演過就結束）',CHARACTERS.classmate_peishan.partner.endEvent==='ev_peishan_split'&&!STORY.partnerOn(G,CHARACTERS.classmate_peishan.partner)); }
  { fresh(fri,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); const T=txt('g:noodle_team');
    check('3-2. 沒遇到：週五 21:00 麵店團群組（AA_374 第 18 項：BB_97 版）「說一件事，說完就好。」「我和柏翰分開了。是我說的。我們都好。」「……大家照常吃飯，不用特別安慰我。」阿哲「……收到」；HEARD_PS_SPLIT',T.includes('classmate_peishan:說一件事，說完就好。')&&T.includes('classmate_peishan:我和柏翰分開了。是我說的。我們都好。')&&T.includes('classmate_peishan:……大家照常吃飯，不用特別安慰我。')&&T.includes('zhe:……收到')&&G.flags.HEARD_PS_SPLIT===true,JSON.stringify(T)); }
  { fresh(fri,20,'campus'); G.events.done.ev_peishan_split=1; PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); check('3-2. 遇到過：群組沒有那兩則',!txt('g:noodle_team').some(t=>/分開了/.test(t))); }
  // 3-3
  { const d=D('2027-03-23'); fresh(d,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.3); const T=txt('g:noodle_team');
    check('3-3. 大二下 3/23 21:00 麵店團排春假：八則，阿哲 @祐廷、Alison @語彤，沒有人 @ 沛珊、沛珊沒有回',T.length===8&&T[0]==='zhe:春假四天！要不要去哪裡？'&&T.includes('zhe:@祐廷')&&T.includes('yu:@語彤 妳可以嗎？')&&!T.some(t=>/沛珊/.test(t))&&!T.some(t=>/^classmate_peishan:/.test(t))&&T[7]==='zhe:那下週再排',JSON.stringify(T)); }
  // 3-4
  { fresh(400,10,'dorm',{EX_kexin:true,dating_kexin:false}); const L=STORY.roomItemList(G); const f=n=>L.find(x=>x[0].startsWith(n));
    check('3-4. 和可昕分開以後：票根「票根的日期，還是那一天。」、筆記「她在第一頁寫的那一句，你沒有擦掉。」、相簿「你翻到一半，又闔上了。……照片裡的河，還是一樣寬。」',f('摩天輪')[1]==='票根的日期，還是那一天。'&&f('寫滿的筆記本')[1]==='她在第一頁寫的那一句，你沒有擦掉。'&&JSON.stringify(f('手機相簿')[1])===JSON.stringify(['你翻到一半，又闔上了。','……照片裡的河，還是一樣寬。']));
    fresh(400,10,'dorm',{dating_kexin:true}); const L2=STORY.roomItemList(G); check('3-4. 還在交往：照原本',L2.find(x=>x[0].startsWith('摩天輪'))[1]==='摩天輪的票根。兩個人開始交往的那一天。'); }
  // 3-8
  { const S8=ev('ev_midterm_supper_y1s2'); check('3-8. 大一下期中晚餐：場景之後一句旁白「（阿姨的手腕綁著護腕。今天端麵的是語彤。）」',S8.dialogue[1].text==='（阿姨的手腕綁著護腕。今天端麵的是語彤。）'); }
  // 3-11
  { const X=ev('ev_xinci_double'); const d=X.day_min+1; fresh(d,14,'library'); G.weekday=wdOf(d); meet('classmate_xinci'); said=[]; picks=[0]; await EVENTS.run(X); const L=L0();
    check('3-11. 慈 2 不需要慈 1：前置只要認識她；沒有借過筆記＝第一句「你也有修經原喔？我在後面看到你。」（AA_209：前面一句旁白）',JSON.stringify(X.prereq)==='{"memory":[{"npc":"classmate_xinci","tag":"FIRST_MET"}]}'&&L[0]==='（總圖裡，她壓低聲音。）'&&L[1]==='芯慈：你也有修經原喔？我在後面看到你。',JSON.stringify(L.slice(0,2))); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
