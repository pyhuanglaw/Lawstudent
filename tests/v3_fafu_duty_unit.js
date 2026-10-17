// V3-D25 法服週六值班：大二起的社員做初談紀錄（AA_184 定稿 ab663b90、BB_160 51a5d106）——不需要瀏覽器。用法：node tests/v3_fafu_duty_unit.js
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
  if(!STORY.fafuShift){ console.log('FAIL 0. 沒有 STORY.fafuShift'); console.log('FAILED 1'); process.exit(1); }
  const sat=(term,w)=>termDay(term,w,6), MEM={lawclub:true,CLUB_lawclub_study:true}; let SN='溫書瑀';   /* 學姊的名字照關係顯示（認識以後＝溫書瑀）*/
  const mem=(day,h,extra)=>{ fresh(day,h,'wancai',Object.assign({},MEM,extra||{})); G.stage='law'; meet('heroine_03'); meet('classmate_bohan'); meet('heroine_05'); G.flags.YT_LEGALAID_Y2=true; return G; };
  // 1. 誰、哪幾天
  mem(sat('Y2S1',7),10); check('1. 大二上 10/24（第 7 週六）：社員可以做紀錄、不旁觀',STORY.fafuShiftable(G)&&!STORY.fafuWatchable(G)&&CALENDAR.dateOf(G.day).key==='2026-10-24');
  mem(sat('Y2S1',3),10); check('1. 9/26 語彤事件 7 那天：不抽池（演事件）',!STORY.fafuShiftable(G));
  mem(sat('Y2S1',5),10); check('1. 10/10 國慶日：不值班',!STORY.fafuDuty(G));
  mem(sat('Y2S1',9),10); check('1. 期中考週：不開',!STORY.fafuDuty(G));
  fresh(sat('Y2S1',7),10,'wancai',{}); G.stage='law'; check('1. 沒加入法服＝照舊在旁邊看，不能做紀錄',STORY.fafuWatchable(G)&&!STORY.fafuShiftable(G));
  mem(sat('Y1S2',3),10); check('1. 大一的社員照舊旁觀（志工從大二開始）',STORY.fafuWatchable(G)&&!STORY.fafuShiftable(G));
  // 2. 出發選單
  mem(sat('Y2S1',7),8); STORY.phoneRules(GM); const q=OUT.get(G,'fafu_'+G.day);
  check('2. 08:30 出發選單「法服值班（萬才館一樓 9:00）」（出發／這週請假），到萬才館一樓',!!q&&q.title==='法服值班（萬才館一樓 9:00）'&&q.no==='這週請假'&&q.goto&&q.goto.zone==='wancai'&&!OUT.due(G)&&(G.hour=8.5,!!OUT.due(G)),JSON.stringify(q));
  // 3. 第一次一般值班（10/24）：①排最前面，之後才輪到語彤、柏翰
  mem(sat('Y2S1',7),9); picks=['從頭講','再待到十二點']; said=[]; opts=[]; await STORY.fafuShift(GM); let L=lines();
  const i1=L.indexOf(SN+'：學弟，今年換你寫。三件事。'), iyt=L.findIndex(t=>/^陳語彤：|^語彤：/.test(t)), ibh=L.findIndex(t=>/^(柏翰|.*柏翰)：/.test(t));
  check('3. 開場「今天兩桌。你跟我。」→ 學姊①（三件事）→ 民眾第 1 件 →「你先問什麼？」→ 從頭講 → 民眾「我只停了五分鐘。」→ 研究所學長的結尾',L[0]==='研究所學姊：今天兩桌。你跟我。'&&i1===1&&L.includes('（一位大學生，機車停在騎樓被拖吊了。）')&&L.includes('你先問什麼？')&&L.includes('研究所學姊：好。先聽完。')&&L.includes('（他講了十五分鐘。最重要的那一句，在最後。）')&&L.includes('民眾：我只停了五分鐘。')&&L.includes('研究所學長：那天的時間、地點先寫清楚。單子還在嗎？'),JSON.stringify(L));
  check('3. 學姊①在語彤、柏翰之前；語彤、柏翰各一句（柏翰第 6 週起是社長）',iyt>i1&&ibh>iyt,JSON.stringify([i1,iyt,ibh]));
  check('3. 結尾「（初談紀錄，一頁。學長在最下面簽名。）」→ 再待到十二點＝輪流的旁白、12:00；LAWCLUB_SAT_VISITS +1',L.includes('（初談紀錄，一頁。學長在最下面簽名。）')&&L.includes('（後來又來了一位，學姊自己接了。）')&&G.hour>=12&&G.flags.LAWCLUB_SAT_VISITS===1&&JSON.stringify(opts[0])==='["「先請他從頭講一次。」","「先問什麼時候發生的。」","「先問手上有什麼資料。」"]');
  check('3. 同一天不能再做一次',!STORY.fafuShiftable(G)&&!(await STORY.fafuShift(GM)));
  // 4. 第二次：②；第三次：③；第四次選從頭講：④；民眾依序
  const keep=JSON.parse(JSON.stringify(G.flags)); const next=async(w,pk)=>{ mem(sat('Y2S1',w),9); Object.assign(G.flags,JSON.parse(JSON.stringify(keep)),{LAWCLUB_SAT_LAST:null}); picks=pk; said=[]; await STORY.fafuShift(GM); Object.assign(keep,JSON.parse(JSON.stringify(G.flags))); return lines(); };
  L=await next(11,['時候','先走']); check('4. 第二次：學姊②「上次的第三件。」（民眾之後）、民眾第 2 件、開場第 2 句',L.includes(SN+'：上次的第三件。')&&L.indexOf(SN+'：上次的第三件。')>L.indexOf('民眾：我不想吵架。我只想要它不要再滴。')&&L[0]==='研究所學長：紀錄表在左邊。先寫日期。'&&L.includes('研究所學長：時間寫在最上面。對。'),JSON.stringify(L));
  check('4. 先走＝沒有輪流旁白、不到 12:00',!L.some(t=>/後來又來了一位|重新抄了一次/.test(t))&&G.hour<12);
  L=await next(13,['資料','先走']); check('4. 第三次：③（她把紀錄拿過去）',L.includes('（她把你的紀錄拿過去，看了一遍，還給你。）')&&L.includes(SN+'：原話寫得很好。……不要替他整理成好聽的話。'));
  L=await next(15,['時候','先走']); check('4. 第四次沒選「從頭講」＝沒有④',!L.includes(SN+'：你讓他講完才開口。'));
  L=await next(3+0,[]); // Y2S1 第 3 週是語彤事件那天，不能做
  check('4. （9/26 不能做）',!L.length);
  // ④ 在大二下選從頭講的那天；⑤ 3/19 以後
  { mem(sat('Y2S2',3),9); Object.assign(G.flags,JSON.parse(JSON.stringify(keep)),{LAWCLUB_SAT_LAST:null}); picks=['從頭講','先走']; said=[]; await STORY.fafuShift(GM); Object.assign(keep,JSON.parse(JSON.stringify(G.flags))); L=lines();
    check('4. 選了「先請他從頭講一次。」的那天：④「你讓他講完才開口。」「重點是，你沒有看錶。」',L.includes(SN+'：你讓他講完才開口。')&&L.includes(SN+'：重點是，你沒有看錶。')); }
  { mem(sat('Y2S2',3),9); const before=STORY.dayOfKey('2027-03-19'); check('4. 大二下第 3 週六（3/13）在 3/19 以前',G.day<before); Object.assign(G.flags,JSON.parse(JSON.stringify(keep)),{LAWCLUB_SAT_LAST:null}); G.day=sat('Y2S2',5); picks=['時候','先走']; said=[]; await STORY.fafuShift(GM); Object.assign(keep,JSON.parse(JSON.stringify(G.flags)));
    check('4. 3/19 以後（第 5 週六）：⑤「一件事。九月我還在這裡。……換一個身分。」',lines().includes(SN+'：一件事。九月我還在這裡。……換一個身分。'),JSON.stringify(lines().slice(-4))); }
  // 5. 大三上：⑥ 最前面＋她簽名；第二次學長簽；第三次 ⑦＋她簽名
  { const k3=JSON.parse(JSON.stringify(keep)); const y3=async(w)=>{ mem(sat('Y3S1',w),9); Object.assign(G.flags,JSON.parse(JSON.stringify(k3)),{LAWCLUB_SAT_LAST:null}); picks=['時候','先走']; said=[]; await STORY.fafuShift(GM); Object.assign(k3,JSON.parse(JSON.stringify(G.flags))); return lines(); };
    let A=await y3(3); check('5. 大三上第一次：⑥「今天你跟我一桌。兩件事。」排最前面、學姊簽名',A[1]===SN+'：今天你跟我一桌。兩件事。'&&A.includes('（初談紀錄，一頁。學姊在最下面簽名。）'),JSON.stringify(A.slice(0,3)));
    A=await y3(5); check('5. 第二次：學長簽名（隔一次）',A.includes('（初談紀錄，一頁。學長在最下面簽名。）'));
    A=await y3(7); check('5. 第三次：學姊簽名＋⑦「以前都是學長簽。……我還不太習慣。」',A.includes('（初談紀錄，一頁。學姊在最下面簽名。）')&&A.includes(SN+'：以前都是學長簽。……我還不太習慣。')); }
  // 6. 學姊在不在
  check('6. 大三下在美國（不在）；大四上隔一次；大四下第 9 週以前三次一次、第 10 週以後不在',!STORY.fafuSisHere(mem(sat('Y3S2',3),9))&&STORY.fafuSisHere(mem(sat('Y4S1',3),9))&&!STORY.fafuSisHere(mem(sat('Y4S1',5),9))&&STORY.fafuSisHere(mem(sat('Y4S2',3),9))&&!STORY.fafuSisHere(mem(sat('Y4S2',5),9))&&!STORY.fafuSisHere(mem(sat('Y4S2',11),9)));
  { mem(sat('Y4S1',3),9); picks=['時候','先走']; said=[]; await STORY.fafuShift(GM); L=lines(); check('6. 大四第一次：⑨「一件事。我只是路過。」，先走也有「（她坐到十二點。）」',L[1]===SN+'：一件事。我只是路過。'&&L[L.length-1]==='（她坐到十二點。）',JSON.stringify(L.slice(-2))); }
  { mem(sat('Y2S2',15),9); check('6. 大二下第 15 週學姊還在',STORY.fafuSisHere(G)); }
  // 7. 連續三次沒去：柏翰私訊；「先不排我。」＝這學期不提醒；下學期第一週再問
  { mem(sat('Y2S1',7)-1,20); STORY.phoneRules(GM); for(const w of [7,11,13]){ G.day=sat('Y2S1',w); G.weekday=6; G.hour=8; STORY.phoneRules(GM); G.hour=12.5; STORY.phoneRules(GM); }
    PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='fafu_bohan_Y2S1');
    check('7. 連續三次沒去（10/24、11/21、12/5）：柏翰私訊「這學期的班表要排了。你還來嗎？」（來。／先不排我。）',!!m&&m.th==='p:classmate_bohan'&&m.text==='這學期的班表要排了。你還來嗎？'&&m.ask.opts.map(o=>o.t).join('／')==='來。／先不排我。');
    PHONE.answer(G,m.ask.id,1); G.day=sat('Y2S1',15); G.hour=8; STORY.phoneRules(GM); check('7. 先不排我＝這學期不再排出發選單',G.flags.FAFU_OFF==='Y2S1'&&!OUT.get(G,'fafu_'+G.day));
    G.day=termDay('Y2S2',1,1); G.hour=12.5; STORY.phoneRules(GM); PHONE.tick(G); check('7. 下學期第一週：再問一次',(G.msgs||[]).some(x=>x.tag==='fafu_bohan_Y2S2')&&!G.flags.FAFU_OFF); }
  { mem(sat('Y2S1',7)-1,20); STORY.phoneRules(GM); for(const w of [7,11]){ G.day=sat('Y2S1',w); G.hour=12.5; STORY.phoneRules(GM); } G.day=sat('Y2S1',13); G.hour=9.5; G.flags.LAWCLUB_SAT_LAST=G.day; G.hour=12.5; STORY.phoneRules(GM); PHONE.tick(G);
    check('7. 兩次沒去、第三次有去＝不算連續三次',!(G.msgs||[]).some(x=>x.tag==='fafu_bohan_Y2S1')); }
  // 8. 大二起沒加入法服的旁觀（BB_160 第 5 節，BB-B 00fdb990）：學姊在場那天最多一句、和旁白池一起輪；每個年級第一次排最前面
  const watch=async(day,flags,n)=>{ fresh(day,9.5,'wancai',Object.assign({},flags)); G.stage='law'; said=[]; const out=[]; for(let i=0;i<(n||1);i++){ G.flags.LAWCLUB_SAT_LAST=null; G.hour=9.5; said=[]; await STORY.fafuWatch(GM); out.push(lines()); } return out; };
  const SIS=/^溫學姊：|^溫書瑀：/, sisOf=L=>L.filter(t=>SIS.test(t)).map(t=>t.replace(SIS,''));
  { const R=await watch(sat('Y2S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true,LAWCLUB_SAT_FIVE:true},1);
    check('8. 大一聽過「明年記得報名」、大二沒報名：大二第一次旁觀出 ⓐ1「我說過，明年記得報名。」「……你沒報。也好。站那邊，看得最清楚。」',JSON.stringify(sisOf(R[0]))===JSON.stringify(STORY.FAFU_W1.a1),JSON.stringify(R[0])); }
  { const R=await watch(sat('Y2S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true},1);
    check('8. 大一來過、沒聽過那一句：ⓐ2「學弟。沒報名，也還是來。」',JSON.stringify(sisOf(R[0]))===JSON.stringify(STORY.FAFU_W1.a2),JSON.stringify(R[0])); }
  { const R=await watch(sat('Y2S1',7),{},2);
    check('8. 大一一次都沒來、大二才來：第一次是 BB_145 第 1 節那兩句（ⓐ3）；第二次不再有 ⓐ',JSON.stringify(sisOf(R[0]))===JSON.stringify(STORY.FAFU_W1.a3)&&!sisOf(R[1]).some(t=>STORY.FAFU_W1.a1.concat(STORY.FAFU_W1.a2,STORY.FAFU_W1.a3).includes(t)),JSON.stringify(R)); }
  { const R=await watch(sat('Y2S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true},7); const S2=R.map(sisOf);
    check('8. 大二：一天最多一句（同一天沒有兩組學姊的句子）；ⓑ「哪天想坐下來，跟我說。」和旁白池一起輪；不勸加入、沒有志工才有的句子',R.every(L=>L.filter(t=>t==='（學姊點頭，回到圓桌。）').length<=1)&&S2.some(x=>x[0]==='哪天想坐下來，跟我說。')&&R.some(L=>L.some(t=>/^（?今天來的是|一位阿嬤|上午很安靜|和解書/.test(t)))&&!S2.flat().some(t=>/今年換你寫|簽|範本|路過/.test(t)),JSON.stringify(S2)); }
  { const R=await watch(sat('Y3S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true,FAFU_W:{y2:1}},6); const S3=R.map(sisOf);
    check('8. 大三上第一次她在場：ⓒ「學弟，還是旁邊？」「……兩件事。看我怎麼問。看他在哪裡停下來。」；同一天沒有⑦（簽名）；之後⑧（阿伯問升官）在輪',JSON.stringify(S3[0])===JSON.stringify(STORY.FAFU_W1.c)&&!S3.flat().some(t=>/學長簽/.test(t))&&S3.some(x=>x[0]==='帶橘子的阿伯問我是不是升官了。'),JSON.stringify(S3)); }
  { const k1=STORY.termDay('Y4S1',3,6); const R=await watch(k1,{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true,FAFU_W:{y2:1,y3:1}},1); const here=STORY.fafuSisHere(G);
    check('8. 大四第一次她在場：ⓓ「一件事。」「……下次換你告訴我，今天哪一句最重要。」；沒有⑨（我只是路過）、⑩（範本）',!here||(JSON.stringify(sisOf(R[0]))===JSON.stringify(STORY.FAFU_W1.d)&&!R[0].some(t=>/路過|範本|坐到十二點/.test(t))),JSON.stringify([here,R[0]])); }
  { const d=STORY.termDay('Y3S2',5,6); const R=await watch(d,{LAWCLUB_SAT_FIRST:true,FAFU_W:{y2:1}},2);
    check('8. 大三下她在美國：只有旁白',R.every(L=>!sisOf(L).length),JSON.stringify(R)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
