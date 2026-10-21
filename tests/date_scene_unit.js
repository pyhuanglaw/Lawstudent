// 約會現場的台詞（DATE-S6；src/date3d.js 的 arriveLine／spotLine／closeLine、date_lines.js 的 loc＝lines/Dxx.json 白名單匯入；BB_128 2-6、2-7、2-9）。用法：node tests/date_scene_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|DATE|DATE_DATA|DATE_LINES|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/story3d.js','src/classes3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/date3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
GM.money=d=>{ G.money+=d; }; GM.toast=()=>{}; GM.caption=()=>{}; GM.updateHUD=()=>{};
const ADV2=global.ADV; ADV2.active=false;
(async()=>{
  const day=termDay('Y1S2',5,6);
  OUT.BG.d13_base_sunset=OUT.BG.d13_base_sunset||{label:'淡水',image:'x'};
  const go=async(who,picks0,o)=>{ o=o||{}; const b=DATE.book(G,{who,locs:['D13'],transport:'mrt',day:G.day,depart:15}); const q=OUT.get(G,'date_'+b.trip); G.hour=15; said=[]; opts=[]; picks=['出發'].concat(picks0); await OUT.prompt(GM,q); return {b,t:DATE.trip(G,b.trip),L:lines()}; };
  check('0. date_lines.js 有 D04、D06、D12、D13 的地點台詞（白名單＠8cac8eaa）',['D04','D06','D12','D13'].every(k=>DATE_LINES.loc&&DATE_LINES.loc[k]&&DATE_LINES.loc[k].lines)&&/D13\.json@8cac8eaa/.test(DATE_LINES.source),Object.keys(DATE_LINES.loc||{}).join(','));
  check('0. 她喜不喜歡讀地點檔（子晴：飲料攤喜歡、長椅不太喜歡）',DATE.likeOf('heroine_04','D13.drink')==='like'&&DATE.likeOf('heroine_04','D13.bench')==='dislike');
  // 芷若第一次去淡水
  fresh(day,9,'dorm',{}); G.money=5000;
  let r=await go('heroine_02',['飲料攤','「我幫妳點？」','河邊欄杆',0,'長椅',0,'差不多了']);
  check('1. 第一次：抵達句「第一次」那套（「淡水好像很多電影來拍過。」）',r.L.some(x=>/淡水好像很多電影來拍過。/.test(x)),r.L.join(' | '));
  check('1. 飲料攤第一次：那一套＋選擇「我幫妳點？」→「好。不要太甜。」；註記不顯示、記 TASTE＝player',r.L.some(x=>/我點最普通的那個/.test(x))&&r.L.some(x=>/好。不要太甜。/.test(x))&&!r.L.some(x=>/記 `?TASTE/.test(x))&&DATE.mem(G,'heroine_02','D13').taste==='player',r.L.join(' | '));
  check('1. 第三個互動點之後她說「差不多了」那一句（BB_128 3-6）',r.L.some(x=>/今天夠了|散場的感覺/.test(x)),r.L.join(' | '));
  check('1. 收尾句「第一次」（「太陽快下去了。」）',r.L.some(x=>/太陽快下去了。/.test(x)),r.L.join(' | '));
  check('1. 記得去過哪些互動點、上一次點的（dateMemory，存檔）',JSON.stringify(DATE.mem(G,'heroine_02','D13').picks)==='["D13.drink","D13.rail","D13.bench"]'&&DATE.mem(G,'heroine_02','D13').last.length===3,JSON.stringify(G.dateMemory));
  // 第二次：沒有第一次那套；飲料攤的「記得上次」有 {lastDrink}，TASTE 的說法還沒有＝跳過、用普通
  G.day+=1; G.weekday=wdOf(G.day); r=await go('heroine_02',['飲料攤',0,'拍照位置',0,'差不多了']);
  check('2. 第二次：抵達句不是「第一次」那套',!r.L.some(x=>/淡水好像很多電影來拍過/.test(x)),r.L.join(' | '));
  check('2. 飲料攤：「記得上次」有 {lastDrink}、TASTE 的說法 AA 還沒給 → 不出現沒填的欄位，用普通那套',!r.L.some(x=>/\{lastDrink\}|上次點，/.test(x))&&!r.L.some(x=>/我點最普通的那個/.test(x)),r.L.join(' | '));
  check('2. 拍照位置是第一次點：用「第一次」那套',r.L.length>3,r.L.join(' | '));
  DATE.TASTE_WORD.player='你幫她點的那杯'; G.day+=1; G.weekday=wdOf(G.day); r=await go('heroine_02',['自己選','飲料攤',0,'差不多了']);   /* 第三次：先問快速約會（AA_128 5-4）→ 自己選 */
  check('2. 有 TASTE 的說法以後：「記得上次」那套照記憶填進去',r.L.some(x=>/你上次點你幫她點的那杯/.test(x)),r.L.join(' | ')); DATE.TASTE_WORD={};
  // 子晴：不太喜歡的互動點（不是第一次）→ 她那一句；一個都沒做就走
  fresh(day,9,'dorm',{}); G.money=5000; DATE.mem(G,'heroine_04','D13').picks=['D13.bench']; DATE.log(G,'heroine_04').byLoc.D13=2; r=await go('heroine_04',['自己選','長椅','差不多了']);
  check('3. 子晴、長椅（不太喜歡、以前點過但上一次沒點、第三次來）：「坐著？才剛到耶。」',r.L.some(x=>/坐著？才剛到耶。/.test(x)),r.L.join(' | '));
  fresh(day,9,'dorm',{}); G.money=5000; r=await go('heroine_04',['就這樣回去']);
  check('3. 一個都沒做就走：子晴那一句（BB_128 3-6）、不算次數',r.L.some(x=>/才剛到？……好。下次補/.test(x))&&!r.L.some(x=>/就這樣？$/.test(x))&&r.t.status==='cancelled',r.L.join(' | '));
  // 語彤：淡水是她的心願地點（第一次是心願事件，還沒做）→ 普通的抵達句
  fresh(day,9,'dorm',{}); G.money=5000; r=await go('heroine_03',['河邊欄杆',0,'差不多了']);
  check('4. 語彤第一次去淡水（心願事件還沒做）：照普通的抵達句（「嗯。淡水。」那一池），不卡住',r.L.some(x=>/淡水|阿姨問我|雲很多/.test(x))&&r.t.status==='done',r.L.join(' | '));
  // 日落時間、最近 3 套不重複
  const ss=DATE.sunset(termDay('Y1S2',5,6)), ws=DATE.sunset(termDay('Y1S1',14,6)); const toM=x=>+x.slice(0,2)*60+ +x.slice(3);
  check('5. {sunset}：淡水的日落時間（三月底 18:00～18:30、十二月 17:00～17:20）',/^\d\d:\d\d$/.test(ss)&&toM(ss)>=18*60&&toM(ss)<=18*60+30&&toM(ws)>=17*60&&toM(ws)<=17*60+20,ss+' '+ws);
  fresh(day,9,'dorm',{}); const t0={locs:['D13'],day}; const pool=DATE_LINES.loc.D13.lines.heroine_02.arrive.normal; const got=[]; for(let i=0;i<4;i++){ const s=DATE.pickSet(G,'heroine_02',pool,t0,'arrive.normal'); got.push(JSON.stringify(s)); }
  check('5. 普通那一池（照階段能用的有 2 套）：輪流、不連續重複（都用過就挑最久以前的）',got.every((x,i)=>!i||x!==got[i-1]),got.map(x=>x.slice(40,70)).join(' / '));
  // 交往中：用交往中那一池
  fresh(day,9,'dorm',{dating_heroine_02:true}); G.money=5000; DATE.log(G,'heroine_02').byLoc.D13=2; r=await go('heroine_02',['自己選','差不多了']);
  check('6. 交往中、不是第一次：抵達句用交往中那一池（「今天走慢一點好不好？」）',r.L.some(x=>/今天走慢一點好不好/.test(x)),r.L.join(' | '));
  // 7 結算、快速約會、相簿（AA_128 5-1、5-4；DATE-S6）
  fresh(day,9,'dorm',{dating_heroine_04:true}); G.money=5000; G.contacts.heroine_04=1; r=await go('heroine_04',['拍照位置',0,'差不多了']);
  check('7. 結算：去了哪裡、做了什麼、花了多少錢（來回車資 200）、照片存進相簿',r.L.some(x=>/今天去了淡水金色水岸：拍照位置。花了 200 元（含來回車資）。照片存進相簿。/.test(x)),r.L.slice(-2).join(' | '));
  check('7. 相簿：G.album 一張（約會、子晴、D13、交往中＝合照）',Array.isArray(G.album)&&G.album.length===1&&G.album[0].who==='heroine_04'&&G.album[0].loc==='D13'&&G.album[0].both===true&&G.album[0].trip===r.t.trip,JSON.stringify(G.album));
  { const n0=G.album.length; G.day+=1; G.weekday=wdOf(G.day); r=await go('heroine_04',['河邊欄杆','差不多了','差不多了']); check('7. 沒去拍照位置：相簿不加、結算沒有「照片」',G.album.length===n0&&!r.L.some(x=>/照片存進相簿/.test(x))&&r.t.status==='done',JSON.stringify({n:G.album.length,n0,st:r.t&&r.t.status,L:r.L.slice(-2)})); }
  fresh(day,9,'dorm',{}); G.money=5000; DATE.log(G,'heroine_04').byLoc.D13=1; r=await go('heroine_04',['差不多了']);
  check('7. 第二次去：還沒有快速約會',!opts.some(o=>o.includes('快速約會')),JSON.stringify(opts.slice(0,3)));
  fresh(day,9,'dorm',{}); G.money=5000; DATE.log(G,'heroine_04').byLoc.D13=2; const c0=DATE.log(G,'heroine_04').count|0; r=await go('heroine_04',['快速約會']);
  check('7. 第三次：問「自己選／快速約會」，快速約會＝她喜歡的優先（子晴：飲料攤）、不用她不太喜歡的（長椅）、兩個、跳過抵達和收尾、直接結算、算一次',opts.some(o=>o[0]==='自己選'&&o[1]==='快速約會')&&r.t.spots.length===2&&r.t.spots[0]==='D13.drink'&&!r.t.spots.includes('D13.bench')&&r.t.status==='done'&&(DATE.log(G,'heroine_04').count|0)===c0+1&&r.L.filter(x=>!/^（|現在要出發/.test(x)).length===0,JSON.stringify({spots:r.t.spots,L:r.L}));
  // 8. DATE-L 第一批（AA-C f21eac3c，2026-10-21）匯入以後：每個有台詞的地點、七位都約得完一次（第一次＝自己選第一個互動點 →「差不多了」），有抵達的一句、沒有例外、錢照扣
  { const H7=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'], bad=[];
    for(const loc of Object.keys(DATE_LINES.loc||{})){ for(const k of Object.keys(OUT.BG)) if(k.startsWith(loc.toLowerCase()+'_base')) OUT.BG[k]=OUT.BG[k]||{image:'x'};
      for(const who of H7){ try{ fresh(day,9,'dorm',{}); G.money=20000; const b=DATE.book(G,{who,locs:[loc],transport:(DATE.loc(loc).transport||[{}])[0].mode||'mrt',day:G.day,depart:13});
          if(!b||!b.trip){ bad.push(loc+' '+who+' 約不了'); continue; } const q=OUT.get(G,'date_'+b.trip); G.hour=13; said=[]; opts=[]; picks=['出發',0,0,'差不多了','差不多了','差不多了']; const m0=G.money; await OUT.prompt(GM,q);
          const L=lines(); if(L.length<3) bad.push(loc+' '+who+' 句子太少：'+L.length); if(G.money>=m0&&((DATE.loc(loc).admission|0)>0)) bad.push(loc+' '+who+' 沒扣錢'); }
        catch(e){ bad.push(loc+' '+who+' 例外：'+e.message); } } }
    check('8. 有台詞的 '+Object.keys(DATE_LINES.loc||{}).length+' 個地點（含 DATE-L 第一批 D01 D02 D03 D05 D07 D15～D19）七位都約得完、沒有例外',!bad.length,bad.slice(0,8).join('；')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
