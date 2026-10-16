// 模擬法庭：可昕的部分（BB_97 9-19；V3-D16 的一部分）——不需要瀏覽器。
// 檢查：交往中＝4/23（五）21:00 她問、兩個回覆照原文；說了＋週六的模 5＝散場一句、麵店一句（輸贏都一樣），KX_MOOT came；沒說／沒回＝22:00 粉專照片＋一則（photo）；說了但平日白天＝散場後一則（call）；沒交往＝都沒有。用法：node tests/v3_kx_moot_unit.js
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
  const NM={'沈以安':'以安','許柏翰':'柏翰','溫書瑀':'學姊','溫學姊':'學姊','吳芯慈':'芯慈','杜可昕':'可昕'}; GM.memo=t=>{ (G.memo=G.memo||[]).push({day:G.day,t}); };
  const L0=()=>lines().map(t=>t.replace(/^([^：]+)：/,(m,n)=>(NM[n]||n)+'：'));
  const dq=D('2027-04-23'), d5=D('2027-05-01'), KT='p:kexin';
  check('0. 4/23 是大二下第 9 週週五；5/1 第 10 週週六',termDay('Y2S2',9,5)===dq&&termDay('Y2S2',10,6)===d5);
  const base=(day,h,zone,flags)=>{ fresh(day,h,zone,flags); for(const id of ['heroine_01','classmate_bohan','heroine_05','classmate_xinci','zhe','kexin']) meet(id); PHONE.join(G,'moot_seller','模擬法庭・賣家組'); };
  base(dq,20.5,'dorm',{dating_kexin:true}); run(20.5,20.95);
  check('1. 交往中：20:57 還沒有',!PHONE.sent(G,'kx_moot_ask'));
  run(21,21.2); let m=TH(KT).find(q=>q.tag==='kx_moot_ask');
  check('1. 21:00 可昕「你最近的訊息都很短。在忙什麼？」＋兩個回覆照原文',!!m&&m.text==='你最近的訊息都很短。在忙什麼？'&&m.ask&&m.ask.opts.map(o=>o.t).join('｜')==='模擬法庭。第 10 週比賽，妳要來嗎？｜一個比賽。比完再跟妳說。',JSON.stringify(m&&m.ask&&m.ask.opts.map(o=>o.t)));
  PHONE.answer(G,'kx_moot_ask',0);
  check('2. 說了：「要。我坐最後一排，你不要看我。」、KX_MOOT_TOLD',txt(KT).slice(-1)[0]==='kexin:要。我坐最後一排，你不要看我。'&&G.flags.KX_MOOT_TOLD===true);
  base(dq,20.5,'dorm',{dating_kexin:true}); run(20.5,21.2); PHONE.answer(G,'kx_moot_ask',1);
  check('2. 不說：「好。比完要說。」',txt(KT).slice(-1)[0]==='kexin:好。比完要說。'&&G.flags.KX_MOOT_TOLD===false);
  base(dq,20.5,'dorm',{}); run(20.5,21.2);
  check('3. 沒交往：不問',!PHONE.sent(G,'kx_moot_ask'));
  const play=async(id,flags,day,h,zone,pick)=>{ base(day,h,zone,flags); said=[]; opts=[]; picks=[].concat(pick==null?0:pick); await EVENTS.run(ev(id)); return L0(); };
  let L=await play('ev_moot_5',{dating_kexin:true,KX_MOOT_TOLD:true},d5,9.6,'classroom');
  check('4. 說了、週六：散場最後一句是可昕「你第二個爭點講得比第一個好。第一個你在發抖。」、KX_MOOT came',L.slice(-1)[0]==='可昕：你第二個爭點講得比第一個好。第一個你在發抖。'&&G.flags.KX_MOOT==='came',JSON.stringify(L.slice(-2)));
  check('4. 她只有那一句（模 5 裡沒有別的可昕台詞）',L.filter(t=>t.startsWith('可昕：')).length===1);
  for(const win of [false,true]){ L=await play('ev_moot_6',{dating_kexin:true,KX_MOOT:'came',MOOT_WIN:win},d5,19.1,'noodle');
    check('5. 麵店（'+(win?'贏':'輸')+'）：最後是豆干那一句和「發抖的人要補充。」',L.slice(-2).join('｜')==='（可昕把自己那份滷味的豆干夾給你。）｜可昕：發抖的人要補充。',JSON.stringify(L.slice(-3))); }
  L=await play('ev_moot_6',{dating_kexin:true,KX_MOOT:'photo'},d5,19.1,'noodle');
  check('5. 沒來的話麵店沒有她',!L.some(t=>t.includes('可昕')));
  L=await play('ev_moot_5',{dating_kexin:true,KX_MOOT_TOLD:false},d5,9.6,'classroom');
  check('6. 沒說：模 5 沒有她、KX_MOOT photo',!L.some(t=>t.startsWith('可昕：'))&&G.flags.KX_MOOT==='photo');
  G.events.done.ev_moot_5=1; G.hour=21.5; run(21.5,21.95); const a=PHONE.sent(G,'kx_moot_photo'); run(22,22.2);
  check('6. 22:00 粉專照片＋「下次要說。我想看你發抖。」（21:57 還沒有）',!a&&txt(KT).slice(-2).join('｜')==='kexin:📷（法律系學會粉專貼的模擬法庭照片）｜kexin:下次要說。我想看你發抖。');
  L=await play('ev_moot_5',{dating_kexin:true},d5,9.6,'classroom');
  check('6. 沒回她：當作沒說（photo）',G.flags.KX_MOOT==='photo');
  /* 說了、平日白天的比賽（現在的模 5 是週六；用 KX_MOOT_CAME 換成平日檢查）*/
  const wdDay=termDay('Y2S2',10,4); base(wdDay,10,'classroom',{dating_kexin:true,KX_MOOT_TOLD:true});
  check('7. 說了、平日 10:00＝她有課（不來）；平日 19:00 能來',!KX_MOOT_CAME(G)&&(G.hour=19,KX_MOOT_CAME(G)));
  base(d5,13,'campus',{dating_kexin:true,KX_MOOT:'call'}); G.events.done.ev_moot_5=1; run(13,13.1);
  check('7. call：散場後一則「你們學校的評審是不是比較兇？」',txt(KT).slice(-1)[0]==='kexin:你們學校的評審是不是比較兇？');
  L=await play('ev_moot_5',{KX_MOOT_TOLD:true},d5,9.6,'classroom');
  check('8. 沒交往：沒有她、不記 KX_MOOT',!L.some(t=>t.startsWith('可昕：'))&&G.flags.KX_MOOT==null);
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
