// v0 ★E37 第一次一起去政大（BB_104 8b-20；AA_154 A40）：8/28 21:00 私訊＋出發選單、從家裡出發（40 分鐘）、14:15 可昕打電話（在家／睡著／在外面）、三個選項、演完回家——不需要瀏覽器。
// 修改前沒有 ev_y0_e37（全部失敗）。用法：node tests/v0_e37_unit.js
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
const meet=id=>SOCIAL.remember(id,'FIRST_MET','');
let menus=[], hints=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); hints.push(o.map(q=>q.hint||'')); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
const atHome=()=>{ G.stage='econ'; Object.assign(G.flags,{Y0_MOVED_OUT:true,LEAVE_WEEK:6,Y0_LEFT:true}); const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };
let cards=[]; GM.titleCard=async(a,b)=>{ cards.push(a+'｜'+b); };
(async()=>{
  const D=STORY.dayOfKey('2025-08-30'); const e=STORY_EVENTS.find(x=>x.id==='ev_y0_e37'); check('0. E37 在、8/30 是週六',!!e&&CALENDAR.dateOf(D).wd===6); if(!e){ console.log('FAILED '+fails); process.exit(1); }
  fresh(D-2,20.5,'campus'); atHome(); run(20.5,20.9); check('1. 8/28 21:00 以前沒有',!PHONE.sent(G,'y0_e37_ask'));
  run(21,21.1); const K=TH('p:kexin').map(m=>m.text), q=OUT.get(G,'y0_e37');
  check('1. 8/28 21:00 可昕「我明天坐高鐵上去。後天你載我搬宿舍。」（AA_303，一則）；出發選單 8/30 14:00',K.includes('我明天坐高鐵上去。後天你載我搬宿舍。')&&!K.includes('週六下午兩點，木柵大學校門。')&&!K.includes('我九月要去的地方，想先給你看。')&&q&&q.day===D&&q.h===14,JSON.stringify(K));
  const snap=JSON.stringify(G); const back=()=>{ G=JSON.parse(snap); SOCIAL.bind(G); EVENTS.bind(GM); };
  // 2. 從家裡出發
  G.day=D; G.weekday=wdOf(D); G.hour=13.1; menus=[]; cards=[]; said=[]; script=['臺北的家樓下','我也以為']; await loop(); let L=said.map(x=>x.t);
  check('2. 家裡的選單有「出發：臺北的家樓下 14:00」（開車；AA_307 第 3 列）',(menus[0]||[]).some(t=>t.includes('臺北的家樓下 14:00'))&&cards[0]==='臺北的家樓下 14:00｜開車',JSON.stringify(menus[0])+JSON.stringify(cards));
  { const k=(menus[0]||[]).findIndex(t=>t.includes('臺北的家樓下 14:00')), h=k<0?'':(hints[0]||[])[k]||'';
    check('2b BB218-P3 ④：選項小字不再重複標題的地點、時間（原本「從家裡出發　臺北的家樓下　14:00　開車」）',k>=0&&h.includes('從家裡出發')&&h.includes('開車')&&!h.includes('臺北的家樓下')&&!h.includes('14:00'),JSON.stringify(h)); }
  check('2. E37（AA_303 第 2 節「法律系 8/30」：你開車載她搬宿舍）：「（八月三十日。你開家裡的車，載她和兩個行李箱上山。）」「（木柵大學的宿舍在山上。電梯很小，你們搬了三趟。）」「（擦汗）……好。這是我的床。」→ 小吃街「以後你開車來找我。我負責選宵夜。」→「去年這個時候……」→「我也以為我會在經濟系。」→「結果兩個人都繞了一圈。」→ 後面照舊；沒有導遊、沒有「我只是繞了一點路」「走到山下」',JSON.stringify(L.slice(0,3))===JSON.stringify(['（八月三十日。你開家裡的車，載她和兩個行李箱上山。）','（木柵大學的宿舍在山上。電梯很小，你們搬了三趟。）','（擦汗）……好。這是我的床。'])&&!L.some(t=>/導遊/.test(t))&&L[L.indexOf('以後你開車來找我。我負責選宵夜。')+1]==='去年這個時候，我以為我九月會在首都帝大念大二。'&&L.includes('去年這個時候，我以為我九月會在首都帝大念大二。')&&L.includes('結果兩個人都繞了一圈。')&&L[L.length-1]==='（到了宿舍門口，她回頭揮了一下手。你一個人開車下山。）'&&!L.some(t=>/繞了一點路|走到山下|念了零天/.test(t)),JSON.stringify(L));
  check('2. 演完回臺北的家',HOME.at(G)&&cards.some(c=>c.startsWith('回臺北的家')));
  // 3. 在家沒出發：14:15 可昕打電話 → 直接進出遊
  back(); G.day=D; G.weekday=wdOf(D); G.hour=14.3; said=[]; cards=[]; script=['現在呢']; await loop(); L=said.map(x=>x.t);
  check('3. 14:15 還在家：可昕打電話「你在哪？行李我都搬到樓下了。」→ 直接進出遊（不用選出發）→「（擦汗）……好。這是我的床。」',L[0]==='你在哪？行李我都搬到樓下了。'&&L.includes('（擦汗）……好。這是我的床。')&&L.includes('現在在想，湯餃要不要再買一份帶回去。')&&!!(G.events.done.ev_y0_e37)&&HOME.at(G),JSON.stringify(L.slice(0,3)));
  // 4. 在家先睡：14:15 被叫醒 → 電話 → 出遊
  back(); G.day=D; G.weekday=wdOf(D); G.hour=12; said=[]; script=['睡覺','照樣','等她說下去']; await loop(); L=said.map(x=>x.t);
  check('4. 12:00 在家睡覺 → 14:15 被叫醒（同一天）→ 電話 → 出遊「（木柵大學的宿舍在山上。電梯很小，你們搬了三趟。）」（AA_303：導遊那段拿掉）',L.includes('你在哪？行李我都搬到樓下了。')&&L.includes('（木柵大學的宿舍在山上。電梯很小，你們搬了三趟。）')&&!L.some(t=>/導遊/.test(t))&&L.includes('沒有後悔喔。只是有時候會想一下。')&&G.events.done.ev_y0_e37,JSON.stringify(L.slice(0,4)));
  // 5. 人在外面：phoneRules 的電話
  back(); HOME.rec(G).at=false; G.day=D; G.weekday=wdOf(D); G.zone='gongguan'; G.hour=14.3; said=[]; script=['我也以為']; run(14.3,14.3); await new Promise(r=>setTimeout(r,50)); L=said.map(x=>x.t);
  check('5. 14:15 在公館：可昕打電話 → 出遊',L[0]==='你在哪？行李我都搬到樓下了。'&&!!G.events.done.ev_y0_e37,JSON.stringify(L.slice(0,2)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
