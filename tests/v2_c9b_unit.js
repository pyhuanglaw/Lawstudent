// 交接包 v2 C9 春假（AA 71186c7）＋BB_96 2-1 W2b 期末、9-5 K8 照片（BB 14265eb）——不需要瀏覽器。修改前沒有 ev_noodle_trip_spring_y1（第 1 項失敗）。
// 檢查：選完以後祐廷自動傳的一句（三種、有沒有群組、沒選就過期＝不傳）；麵店團那一趟（六句、認識的人、兩天一夜：回來是第二天傍晚、星期、體力）；
//   「宿舍變得很空。」只在 4/3 白天；W2b 期末家族群組三種；K8 旅行照片的房間物件
// 用法：node tests/v2_c9b_unit.js
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
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  const trip=ev('ev_noodle_trip_spring_y1'), empty=ev('ev_spring_dorm_empty_y1');
  check('1. 春假麵店團那一趟的事件在',!!trip&&!!empty);
  if(!trip){ console.log('FAILED '+fails); process.exit(1); }
  const D=STORY.springDays();
  const pick=(k,group,flags,silent)=>{ fresh(D.inv2,22,'dorm',Object.assign({},flags||{})); if(group) PHONE.join(G,'noodle_team','麵店團'); STORY.springChoose(GM,k,{silent:!!silent}); run(22,22.3,0.05); return G.msgs.filter(m=>m.tag==='spring_pick_msg').map(m=>(m.from==='player'?'我':m.from)+'@'+m.th+':'+m.text); };
  let M=pick('noodle',true);
  check('2. 選麵店團：群組「我去。」→ 以安「收到。行程表多一個人。」',JSON.stringify(M)===JSON.stringify(['我@g:noodle_team:我去。','heroine_01@g:noodle_team:收到。行程表多一個人。']),JSON.stringify(M));
  check('2. 選麵店團：排 4/3 的出遊（ev_noodle_trip_spring_y1）',!!OUT.get(G,'ndl_trip_y1s2')&&OUT.get(G,'ndl_trip_y1s2').day===D.d0);
  M=pick('kexin',true,{dating_kexin:true});
  check('2. 選可昕：私訊「好。我們去。」；群組「我這次有約了。」→ 阿哲「……喔～」',JSON.stringify(M)===JSON.stringify(['我@p:kexin:好。我們去。','我@g:noodle_team:我這次有約了。','zhe@g:noodle_team:……喔～']),JSON.stringify(M));
  M=pick('kexin',false,{dating_kexin:true}); check('2. 選可昕、沒有群組：只有私訊',JSON.stringify(M)===JSON.stringify(['我@p:kexin:好。我們去。']),JSON.stringify(M));
  M=pick('dorm',true); check('2. 留在宿舍：群組「我這次留在宿舍。」→ 阿哲「好啦，照片會傳給你。」',JSON.stringify(M)===JSON.stringify(['我@g:noodle_team:我這次留在宿舍。','zhe@g:noodle_team:好啦，照片會傳給你。']),JSON.stringify(M));
  M=pick('dorm',true,{},true); check('2. 沒選就過了 4/2（自動留在宿舍）：不替玩家傳',M.length===0,JSON.stringify(M));
  /* 那一趟 */
  const go=async(setup)=>{ fresh(D.d0,7.9,'dorm',{}); PHONE.join(G,'noodle_team','麵店團'); meet('heroine_01'); if(setup) setup(); G.energy=30; const wd0=G.weekday; STORY.springChoose(GM,'noodle',{silent:true}); const q=OUT.get(G,'ndl_trip_y1s2'); said=[]; await OUT.go(GM,q); return {L:lines(),wd0}; };
  let r=await go(()=>{ meet('yu'); });
  const WANT=['火車上，四個位子怎麼坐，討論了一整站。最後阿哲說：','阿哲：猜拳。','到的第一天就下雨。','沈以安：好，下午改去室內的地方，我再排一下。','雨停的空檔，大家在堤防上排成一排拍照。','第二天早上，阿哲睡過頭，Alison 在門外敲了五分鐘。','民宿老闆很熱情，每個人多拿了一顆茶葉蛋。'];
  const body=r.L.filter(l=>!/^春假・海邊的小鎮$/.test(l));
  check('3. 六句照 AA 的順序（認識 Alison）',JSON.stringify(body.slice(-7))===JSON.stringify(WANT),JSON.stringify(r.L));
  check('3. 兩天一夜：回來是 4/4（第二天）17:00、星期往後一天（體力拿掉了，DL-02）',G.day===D.d0+1&&Math.abs(G.hour-17)<0.01&&G.weekday===(r.wd0+1)%7,JSON.stringify({day:G.day,want:D.d0+1,h:G.hour,wd:G.weekday,e:G.energy}));
  r=await go(null); check('3. 不認識 Alison：第五句只有「第二天早上，阿哲睡過頭。」',r.L.includes('第二天早上，阿哲睡過頭。')&&!r.L.some(l=>l.includes('Alison')),JSON.stringify(r.L));
  /* 宿舍變得很空 */
  fresh(D.d0,10,'dorm',{SPRING_Y1:'dorm'}); check('4. 留在宿舍：4/3 白天走進宿舍會有「宿舍變得很空。」',EVENTS.check(empty));
  fresh(D.d0,20,'dorm',{SPRING_Y1:'dorm'}); check('4. 4/3 晚上不出現',!EVENTS.check(empty));
  fresh(D.d0+1,10,'dorm',{SPRING_Y1:'dorm'}); check('4. 4/4 不出現（只在 4/3 白天）',!EVENTS.check(empty));
  /* W2b 期末 */
  const dF=STORY.dayOfKey('2026-06-12');   /* 家族期末訊息改 6/12 21:00（AA_198 第 5 節）*/
  const fam=(setup)=>{ fresh(dF,20,'dorm',{}); PHONE.join(G,'family_law','法律系直屬家族'); if(setup) setup(); run(20,21.2,0.05); return G.msgs.filter(m=>m.tag==='fam_final_y1s2').map(m=>(m.name||m.from)+':'+m.text); };
  const K0='Kevin:期末考完，家族聚餐。這次地方我選：公館的火鍋吃到飽。全家族。';
  M=fam(()=>{ G.flags.TREATED_FAMILY=true; SOCIAL.remember('heroine_05','FAMILY_DINNER',''); });
  check('5. 6/12（五）21:00；去了而且請了：「收到。這次飲料我請。」',JSON.stringify(M)===JSON.stringify([K0,'溫學姊:收到。這次飲料我請。'])&&G.msgs.find(m=>m.tag==='fam_final_y1s2').h===21,JSON.stringify(M));
  M=fam(()=>{ G.flags.SAID_TREAT_SIS=true; });
  check('5. 沒去家聚、說過要請：學姊、Kevin、學姊三句（中間那句是 Kevin；AA_459 2-2 換字）',JSON.stringify(M)===JSON.stringify([K0,'溫學姊:你上次說要請全家族飲料。','Kevin:結果那天學弟沒來。','溫學姊:……這次記你的。']),JSON.stringify(M));
  M=fam(null); check('5. 其他：「收到。」',JSON.stringify(M)===JSON.stringify([K0,'溫學姊:收到。']),JSON.stringify(M));
  M=fam(()=>{ G.flags.SAID_TREAT_SIS=true; SOCIAL.remember('heroine_05','FAMILY_DINNER',''); }); check('5. 去了家聚、說過要請但沒記到請客（不會發生，保險）：照「其他」',JSON.stringify(M)===JSON.stringify([K0,'溫學姊:收到。']),JSON.stringify(M));
  /* K8 照片 */
  for(const [k,t] of [['sea','海邊。她拎著鞋子站在浪裡，褲管濕到膝蓋。'],['oldtown','老街。牆上貼滿發黃的老照片，她站在中間，手上拿著第三家的點心。'],['stars','山上。照片幾乎全黑，右上角有一個小白點。她說那是星星。你覺得是路燈。']]){
    fresh(D.d0+2,20,'dorm',{KX_TRIP:{Y1S2:k}}); const it=STORY.roomItemList(G).find(x=>x[0]==='旅行的照片'); check('6. K8 旅行的照片（'+k+'）：房間物件的文字',!!it&&it[1]===t,JSON.stringify(it)); }
  fresh(D.d0+2,20,'dorm',{}); check('6. 沒去旅行：沒有照片',!STORY.roomItemList(G).some(x=>x[0]==='旅行的照片'));
  // 交往中的版本（AA_71 2-10，AA-C e2bdcece；AA_216 大一下 #7）
  { const r1=await go(()=>{ meet('yu'); G.flags.dating_heroine_01=true; }), i=r1.L.indexOf('沈以安：好，下午改去室內的地方，我再排一下。');
    check('7. 和以安交往中：改行程那一句之後她小聲說「你想去哪？我照你的排。」；沒交往沒有',i>=0&&r1.L[i+1]==='沈以安：（她小聲對你說）你想去哪？我照你的排。'&&!r.L.some(l=>/我照你的排/.test(l)),JSON.stringify(r1.L)); }
  { const YT=k=>{ fresh(D.inv2,22,'dorm',{dating_heroine_03:true}); PHONE.join(G,'noodle_team','麵店團'); STORY.springChoose(GM,k,{silent:true}); G.day=D.d0; G.hour=18.1; STORY.phoneRules(GM); PHONE.tick(G); return G.msgs.filter(m=>m.th==='p:heroine_03').map(m=>m.text); };
    const a1=YT('noodle'), a2=YT('dorm'); fresh(D.inv2,22,'dorm',{}); STORY.springChoose(GM,'dorm',{silent:true}); G.day=D.d0; G.hour=18.1; STORY.phoneRules(GM); PHONE.tick(G); const a3=G.msgs.filter(m=>m.th==='p:heroine_03').map(m=>m.text);
    check('7. 和語彤交往中：去麵店團＝第一天傍晚「看到群組了。你們那邊也在下雨喔。」「店裡今天很空。」；留在宿舍＝「春假店裡很空。你要來吃嗎？」；沒交往沒有',JSON.stringify(a1)==='["看到群組了。你們那邊也在下雨喔。","店裡今天很空。"]'&&JSON.stringify(a2)==='["春假店裡很空。你要來吃嗎？"]'&&!a3.length,JSON.stringify([a1,a2,a3])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})();
