// AA_358（AA-C 2026-10-21，企劃線 659d9d81）人物知道不該知道的事——第 2 節要 LAWWW 加條件的 2-1、2-2（不需要瀏覽器）。
//   2-1 第二天傍晚麵店：阿哲只有在玩家真的跟小安走了（F.plan）才問「下午你跟小安去哪了」和那組選項；拒絕小安（anSkipped）、沒等到小安（anMissed）的玩家阿哲改說
//       「下午沒看到你，我還以為你先回宿舍了。」，接下來法服那句照舊。
//   2-2 小安「你那個『不能賠十倍』的講法」只給 cafeView A；沒有 cafeView（拒絕咖啡廳）的：第一週版「民總的筆記我整理好了。你要借再跟我說。」、
//       其他「報告我先寫了一半。民總那題你有想法再跟我說。」
//   （2-3 在 tests/lifeline_g1_unit.js、2-4 在 tests/v1_batch6_unit.js、2-5 在 tests/v3_batch1_unit.js、2-6 在表上那八支測試）
// 修改前：2-1 的拒絕、沒等到兩項 FAIL；2-2 的兩項 FAIL（照用原句的兩項本來就過）。用法：node tests/aa358_unit.js
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
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(n){ G.money+=n; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,weekday:wdOf(day),weather:'clear',energy:70,money:5000,stage:'law',flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,classDone:true,afternoonDone:true,zheInvite:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
(async()=>{
  /* ===== 2-1 第二天傍晚的阿鳳麵店（story3d.js noodleScene，經 STORY.interact 的 it.eat）===== */
  const noodle=async flags=>{ fresh(2,18.6,'noodle',flags); meet('heroine_01'); GM.npc.zhe={name:'阿哲',charId:'zhe',obj:{position:{x:0,y:0,z:0}},seat:{x:0,z:0}}; picks=[0,0]; await STORY.interact({eat:'noodle',seat:{x:0,z:0}},GM); return lines(); };
  const ASK='阿哲：所以下午你跟小安去哪了？我在球場看到你們兩個一起走。'   /* AA_372 第 15 項：原本「往校門走」（總圖那條路不是往校門）*/, NO='阿哲：下午沒看到你，我還以為你先回宿舍了。', FAFU='阿哲：對了，法服在招人。學長說一年級去會被操，但真的學得到東西。';
  for(const [k,flags] of [['拒絕小安（anSkipped）',{anSkipped:true}],['沒等到小安（anMissed）',{anMissed:true,anAfter:true}]]){ const L=await noodle(flags), i=L.indexOf(NO);
    check('2-1 '+k+'：阿哲不問「下午你跟小安去哪了」、沒有那組選項，改說「下午沒看到你，我還以為你先回宿舍了。」，接著法服那句照舊',
      !L.includes(ASK)&&i>0&&L[i-1]==='阿哲：來了。我點了滷蛋，你要不要？'&&L[i+1]===FAFU&&opts.length===1&&!opts.some(o=>o.some(t=>/剛好同路/.test(t)))&&G.flags.zheNoodleDone===true,JSON.stringify([L,opts])); }
  for(const [plan,ans] of [['cafe','溫州街的咖啡廳。她在整理今天的筆記。'],['library','總圖。她在整理今天的筆記。']]){ const L=await noodle({plan});
    check('2-1 真的跟小安走了（F.plan＝'+plan+'）：照原句「所以下午你跟小安去哪了？……」和那組選項（「'+ans+'」「沒有啊，剛好同路。」）',L.includes(ASK)&&!L.includes(NO)&&JSON.stringify(opts[1])===JSON.stringify([ans,'沒有啊，剛好同路。'])&&L.includes(FAFU),JSON.stringify([L,opts])); }

  /* ===== 2-2 下午那段之後第一次找小安說話（story3d.js talkAn 的 anAfter）===== */
  const talk=async(flags,view)=>{ fresh(3,12,'campus',flags); meet('heroine_01'); if(view){ G.flags.cafeView=view; G.choices.cafeView=view; } const n={id:'an',charId:'heroine_01',name:'小安',obj:{position:{x:1,y:0,z:1}},seat:null,lv:0}; GM.npc.an=n; await STORY._day2.talkAn(GM,n); return said.map(s=>s.t); };
  { const L=await talk({anSkipped:true});
    check('2-2 拒絕咖啡廳（沒有 cafeView）：不說「不能賠十倍」；說「報告我先寫了一半。民總那題你有想法再跟我說。」',!L.some(t=>/不能賠十倍/.test(t))&&L.includes('報告我先寫了一半。民總那題你有想法再跟我說。')&&G.flags.anAfter===true,JSON.stringify(L)); }
  { const L=await talk({anSkipped:true,LAW_START_DAY:-16,MAIN_D1:1});
    check('2-2 拒絕咖啡廳、第一週版（開學 9/1 的局）：「民總的筆記我整理好了。你要借再跟我說。」',!L.some(t=>/不能賠十倍/.test(t))&&L.includes('民總的筆記我整理好了。你要借再跟我說。'),JSON.stringify(L)); }
  { const L=await talk({plan:'cafe'},'A'), L1=await talk({plan:'cafe',LAW_START_DAY:-16,MAIN_D1:1},'A');
    check('2-2 cafeView A：照原句（「報告寫到一半。你那個「不能賠十倍」的講法，我放在結論。」；第一週版「你那個『不能賠十倍』的講法，我記在筆記旁邊了。」）',L.includes('報告寫到一半。你那個「不能賠十倍」的講法，我放在結論。')&&L1.includes('你那個『不能賠十倍』的講法，我記在筆記旁邊了。'),JSON.stringify([L,L1])); }
  { const L=await talk({plan:'library'},'C'); check('2-2 cafeView C、B 照舊（「無過失」）',L.includes('報告我用了你說的那個——「無過失」。老師如果打槍我，就說是你的主意。'),JSON.stringify(L)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
