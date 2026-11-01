// v0 ★E36 放榜（BB_104 8-11、8b-19；AA_154 A35、2-4b）：10:00 私訊＋出發選單、椰林大道 3D、帶到場（在家／睡著）、E36_REPLY／E36_PACT、22:00 放榜的宵夜、23:30 群組照片——不需要瀏覽器。
// 修改前沒有 ev_y0_e36（全部失敗）。用法：node tests/v0_e36_unit.js
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
let spawned=[]; GM.spawnCharacter=(id,x,z,o)=>{ spawned.push([id,x,z]); return null; };
let menus=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
const atHome=()=>{ G.stage='econ'; Object.assign(G.flags,{Y0_MOVED_OUT:true,LEAVE_WEEK:6,Y0_LEFT:true}); const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };
const grp=()=>(G.msgs||[]).filter(m=>/^g:econ/.test(m.th)).map(m=>m.text);
(async()=>{
  const J=x=>JSON.stringify(x);
  const D=STORY.dayOfKey('2025-08-13'); const e=STORY_EVENTS.find(x=>x.id==='ev_y0_e36'), eh=STORY_EVENTS.find(x=>x.id==='ev_y0_e36h'), en=STORY_EVENTS.find(x=>x.id==='ev_y0_e36n');
  check('0. E36 三個事件都在（ev_y0_e36n 留 id）、8/13 是週三',!!e&&!!eh&&!!en&&CALENDAR.dateOf(D).wd===3); if(!e||!eh||!en){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D,9.5,'campus'); atHome(); run(9.5,9.9); check('1. 10:00 以前沒有',!PHONE.sent(G,'y0_e36_ask'));
  run(10,10.1); check('1. 10:00 還沒看到榜單：可昕還沒傳',!PHONE.sent(G,'y0_e36_ask'));
  check('1. coreCallAt：8/13 09:00 睡著＝10:00 醒來看榜單',(()=>{ const h0=G.hour; G.hour=9; const r=STORY.coreCallAt(G); G.hour=h0; return r===10; })());
  said=[]; menus=[]; script=[]; await loop(); const L0=said.map(x=>x.t);
  check('1. 在家：先三句系統旁白「（八月十三日，早上十點。榜單公布了。）」「（首都帝大法律學系，財經法學組。你的名字在上面。）」「（分數只比那一組的錄取分數高 0.1。）」（AA_224 6-6）',L0[0]==='（八月十三日，早上十點。榜單公布了。）'&&L0[1]==='（首都帝大法律學系，財經法學組。你的名字在上面。）'&&L0[2]==='（分數只比那一組的錄取分數高 0.1。）'&&G.flags.E36_RESULT===true,JSON.stringify(L0.slice(0,3)));
  const K=TH('p:kexin').map(m=>m.text);
  check('1. 10:05 可昕「木柵大學法律。跟表上一樣。」「你的也是吧。」→ 祐廷「嗯。」（AA_272 4-4）；沒有椰影大道的出發選單',J(K.slice(-3))===J(['木柵大學法律。跟表上一樣。','你的也是吧。','嗯。'])&&!OUT.get(G,'y0_e36')&&G.flags.E36_ASKED===true,J(K));
  const snap=JSON.stringify(G); const back=()=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); };
  // 2. 20:00 電話：在家
  G.hour=19.9; check('2. 20:00 以前沒有電話',!EVENTS.check(e)&&!EVENTS.check(eh)); G.hour=20; check('2. 20:00 在家：家裡那一個（外面那一個不演）',EVENTS.check(eh)&&!EVENTS.check(e));
  G.flags.KX_CAR='only_me'; said=[]; script=['每週一天']; await EVENTS.run(eh); await new Promise(r=>setTimeout(r,20)); let L=said.map(x=>x.t);
  check('3. 電話（AA_298 第 9 節、d744bf3d 更正）：「首都帝大法律。恭喜你。真的。」→ 祐廷「只高 0.1。」→ 可昕「上了就是上了。」→ 祐廷「……妳要不要回首都帝大？……」（AA_298 第 10 節）；沒有「木柵大學的山比較多……比你強壯」；only_me 那兩句拿掉；沒有椰影大道、路燈、「一點點不甘心」「差一點點」「消化」',
    J(L.slice(0,3))===J(['首都帝大法律。恭喜你。真的。','只高 0.1。','上了就是上了。'])&&said[1].who!==said[0].who&&said[2].who===said[0].who&&L[3]==='……妳要不要回首都帝大？休學兩年內，都可以復學。'&&!L.some(t=>/木柵大學的山|強壯/.test(t))&&!L.some(t=>/你以為只有你|不是只有妳/.test(t))&&!L.some(t=>/椰影大道|路燈|不甘心|差一點點|消化/.test(t)),J(L));
  check('3. 沒有重考期的讀書日／玩樂日紀錄（一樣多）：E29 的旁白不說',!L.includes('這半年，你幾乎每天都在念書。')&&!L.includes('這半年，你們很常騎去河堤。'));
  { const s3=JSON.stringify(G); for(const [k,n,want] of [['study',3,'這半年，你幾乎每天都在念書。'],['play',2,'這半年，你們很常騎去河堤。']]){ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); G.day=D-40; for(let i=0;i<n;i++){ G.day=D-40+i; EVENTS.habit('retake:'+k); } G.day=D; G.hour=20;
      said=[]; script=['到時候']; await EVENTS.run(eh); await new Promise(r=>setTimeout(r,20)); const LL=said.map(x=>x.t);
      check('3. 重考期 '+k+' 比較多：電話開頭、可昕第一句之前說「'+want.slice(0,10)+'……」',LL.indexOf(want)>=0&&LL.indexOf(want)<LL.indexOf('首都帝大法律。恭喜你。真的。'),JSON.stringify(LL.slice(0,3))); } G=JSON.parse(s3); SOCIAL.bind(G); EVENTS.bind(GM); }
  check('3. 安靜了一下以後，她說回去經濟系要一個人從大一開始（AA_298 第 10 節、d744bf3d）；E36_REPLY 不再記；E36_PACT weekly 照用；最後一句「月底我就上去了。……」',L.includes('（電話那頭安靜了一下。）')&&L.includes('回去經濟系，要一個人從大一開始。那時候的朋友都大二了，你也不在。')&&L.includes('（你想再說什麼，最後沒有說。之後，你也沒有再問過。）')&&L.indexOf('九月以後，就不是同一張桌子了。')>L.indexOf('回去經濟系，要一個人從大一開始。那時候的朋友都大二了，你也不在。')&&!G.flags.E36_REPLY&&L.includes('是哪一天，等我們都摸熟自己的課表再說。不准忘記。')&&G.flags.E36_PACT==='weekly'&&L[L.length-1]==='月底我就上去了。行李很多，你要載我。',J(L));
  check('3. 演完不接宵夜（E36n 不再演）、一次',!EVENTS.check(en)&&!EVENTS.check(e)&&!EVENTS.check(eh));
  run(21.9,21.95); check('4. 22:00 以前群組沒有',!grp().includes('祐廷！！看到了！！'));
  run(22,22.1); const P=grp(); check('4. 22:00 經濟系群組四則：阿勳「祐廷！！看到了！！」品妤「恭喜。」（AA_368 M2：原本「0.1 也是分數。恭喜。」，只高 0.1 只有電話裡講過）韋綸「走啦！！回來請吃宵夜！！」品妤「可昕也恭喜。」；沒有宵夜攤照片',J(P.slice(-4))===J(['祐廷！！看到了！！','恭喜。','走啦！！回來請吃宵夜！！','可昕也恭喜。'])&&!P.some(t=>t.includes('宵夜攤')||t.includes('0.1')),J(P.slice(-4)));
  { const s4=JSON.stringify(G); back(); G.name='阿明'; run(22,22.1); const P2=grp(); check('4. AA_368 L5：阿勳那則照玩家取的名字（「{name}！！看到了！！」；手機訊息不換 {name}，送出時就換好）——名字「阿明」＝「阿明！！看到了！！」',P2.includes('阿明！！看到了！！')&&!P2.some(t=>t.includes('祐廷')||t.includes('{name}')),J(P2.slice(-4))); G=JSON.parse(s4); SOCIAL.bind(G); EVENTS.bind(GM); }
  // 5. 在外面接；睡著被叫醒
  back(); G.hour=20.2; HOME.rec(G).at=false; G.zone='gongguan'; check('5. 20:00 以後人在外面：外面那一個演（家裡那一個只在家裡的選單那一輪演）',EVENTS.check(e));
  check('5. coreCallAt：8/13 19:00 睡著＝20:00 手機響',(()=>{ back(); G.hour=19; return STORY.coreCallAt(G)===20; })());
  back(); G.hour=19; said=[]; script=['睡覺','妳想怎麼做']; await loop(); L=said.map(x=>x.t);
  check('5. 19:00 在家睡覺 → 20:00 被叫醒（同一天）→ 電話；ask',G.day===D&&L.includes('首都帝大法律。恭喜你。真的。')&&!G.flags.E36_REPLY&&G.flags.E36_PACT==='ask',J([G.day-D,G.hour,L.slice(0,2)]));
  // 6. 法律系不受影響
  fresh(termDay('Y1S1',4,3),10.5,'dorm'); G.stage='law'; run(10,11); check('6. 法律系的存檔：沒有 E36',!PHONE.sent(G,'y0_e36_ask')&&!G.flags.E36_ASKED);
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
