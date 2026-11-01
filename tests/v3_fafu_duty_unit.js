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
  mem(sat('Y2S1',3),10); check('1. 9/26：舊的語彤事件 7 退休（AA_325 2-Y2-01），語彤不在法服＝照常值班（大二最早的一次）',STORY.fafuShiftable(G));
  mem(sat('Y2S1',5),10); check('1. 10/10 國慶日：不值班',!STORY.fafuDuty(G));
  mem(sat('Y2S1',9),10); check('1. 期中考週：不開',!STORY.fafuDuty(G));
  fresh(sat('Y2S1',7),10,'wancai',{}); G.stage='law'; check('1. 沒加入法服＝照舊在旁邊看，不能做紀錄',STORY.fafuWatchable(G)&&!STORY.fafuShiftable(G));
  mem(sat('Y1S2',3),10); check('1. 大一的社員照舊旁觀（志工從大二開始）',STORY.fafuWatchable(G)&&!STORY.fafuShiftable(G));
  // 2. 出發選單
  mem(sat('Y2S1',7),8); STORY.phoneRules(GM); const q=OUT.get(G,'fafu_'+G.day);
  check('2. 08:30 出發選單「法服值班（萬才館一樓 9:00）」（出發／這週請假），到萬才館一樓',!!q&&q.title==='法服值班（法律系館B一樓 9:00）'&&q.no==='這週請假'&&q.goto&&q.goto.zone==='wancai'&&!OUT.due(G)&&(G.hour=8.5,!!OUT.due(G)),JSON.stringify(q));
  // 3. 第一次一般值班（10/24）：2026-10-17 起學姊四年都不在法律服務現場（AA_218 17-7、AA_238 第 2 節）——志工值班的學姊句子（BB_160 第 1 節 ①～⑪）跟著拿掉；值班本身照舊
  const SISRE=/^(溫書瑀|溫學姊)：|學姊在最下面簽名|她坐到十二點/;
  mem(sat('Y2S1',7),9); picks=['從頭講','再待到十二點']; said=[]; opts=[]; await STORY.fafuShift(GM); let L=lines();
  const iyt=L.findIndex(t=>/^陳語彤：|^語彤：/.test(t)), ibh=L.findIndex(t=>/^(柏翰|.*柏翰)：/.test(t));
  check('3. 開場「今天兩桌。你跟我。」→ 民眾第 1 件 →「你先問什麼？」→ 從頭講 → 民眾「我只停了五分鐘。」；沒有學姊的句子',L[0]==='雅筑學姊：今天兩桌。你跟我。'&&L.includes('你先問什麼？')&&L.includes('民眾：我只停了五分鐘。')&&!L.some(t=>SISRE.test(t)),JSON.stringify(L));
  check('3. 柏翰一句（柏翰第 6 週起是社長）；語彤不在法服（AA_255 第 4 節第 2 點）＝沒有她的句子',iyt<0&&ibh>0,JSON.stringify([iyt,ibh]));
  check('3. 結尾「（初談紀錄，一頁。學長在最下面簽名。）」→ 再待到十二點＝輪流的旁白（「學長自己接了」，AA_238 旁白的學姊改掉）、12:00；LAWCLUB_SAT_VISITS +1',L.includes('（初談紀錄，一頁。學長在最下面簽名。）')&&L.includes('（後來又來了一位，學長自己接了。）')&&G.hour>=12&&G.flags.LAWCLUB_SAT_VISITS===1,JSON.stringify(L.slice(-3)));
  check('3. 同一天不能再做一次',!STORY.fafuShiftable(G)&&!(await STORY.fafuShift(GM)));
  // 4. 之後幾次：民眾依序、沒有學姊；先走＝沒有輪流旁白
  const keep=JSON.parse(JSON.stringify(G.flags)); const next=async(w,pk,term)=>{ mem(sat(term||'Y2S1',w),9); Object.assign(G.flags,JSON.parse(JSON.stringify(keep)),{LAWCLUB_SAT_LAST:null}); picks=pk; said=[]; await STORY.fafuShift(GM); Object.assign(keep,JSON.parse(JSON.stringify(G.flags))); return lines(); };
  L=await next(11,['時候','先走']); check('4. 第二次：民眾第 2 件、開場第 2 句；沒有學姊',L[0]==='研究所學長：紀錄表在左邊。先寫日期。'&&L.some(t=>/樓上漏水/.test(t))&&!L.some(t=>SISRE.test(t)),JSON.stringify(L));
  check('4. 先走＝沒有輪流旁白、不到 12:00',!L.some(t=>/後來又來了一位|重新抄了一次/.test(t))&&G.hour<12);
  L=await next(3,['從頭講','先走'],'Y2S2'); check('4. 大二下也沒有學姊（原本的②～⑤拿掉）',L.length>0&&!L.some(t=>SISRE.test(t)),JSON.stringify(L));
  L=await next(5,['時候','先走'],'Y2S2'); check('4. 3/19 以後也沒有「九月我還在這裡」',!L.some(t=>/九月我還在這裡/.test(t)));
  // 5. 大三上：都是學長簽名
  for(const w of [3,5,7]){ L=await next(w,['時候','先走'],'Y3S1'); check('5. 大三上第 '+w+' 週：學長簽名、沒有學姊',L.includes('（初談紀錄，一頁。學長在最下面簽名。）')&&!L.some(t=>SISRE.test(t)),JSON.stringify(L.slice(0,3))); }
  // 6. 學姊四年都不在
  check('6. 學姊四年都不在（STORY.fafuSisHere 一律 false）',['Y1S1','Y2S1','Y2S2','Y3S1','Y4S1','Y4S2'].every(t=>!STORY.fafuSisHere(mem(sat(t,3),9))));
  check('6. 圓桌帶的人：大一社長、大二學長、大三大四值班的學長',STORY.fafuLead(mem(sat('Y1S1',3),9))==='法服的社長'&&STORY.fafuLead(mem(sat('Y2S1',3),9))==='學長'&&STORY.fafuLead(mem(sat('Y3S1',3),9))==='值班的學長'&&STORY.fafuLead(mem(sat('Y4S1',3),9))==='值班的學長');   /* 大一的標籤寫全名「法服的社長」（AA_496 第 9 節第 6 點，2026-10-28；原本「社長」）*/
  { L=await next(3,['時候','先走'],'Y4S1'); check('6. 大四沒有「我只是路過」「她坐到十二點」',!L.some(t=>/我只是路過|她坐到十二點/.test(t))); }
  // 7. 連續三次沒去：柏翰私訊；「先不排我。」＝這學期不提醒；下學期第一週再問
  { mem(sat('Y2S1',7)-1,20); STORY.phoneRules(GM); for(const w of [7,11,13]){ G.day=sat('Y2S1',w); G.weekday=6; G.hour=8; STORY.phoneRules(GM); G.hour=12.5; STORY.phoneRules(GM); }
    PHONE.tick(G); const m=(G.msgs||[]).find(x=>x.tag==='fafu_bohan_Y2S1');
    check('7. 連續三次沒去（10/24、11/21、12/5）：柏翰私訊「這學期的班表要排了。你還來嗎？」（來。／先不排我。）',!!m&&m.th==='p:classmate_bohan'&&m.text==='這學期的班表要排了。你還來嗎？'&&m.ask.opts.map(o=>o.t).join('／')==='來。／先不排我。');
    PHONE.answer(G,m.ask.id,1); G.day=sat('Y2S1',15); G.hour=8; STORY.phoneRules(GM); check('7. 先不排我＝這學期不再排出發選單',G.flags.FAFU_OFF==='Y2S1'&&!OUT.get(G,'fafu_'+G.day));
    G.day=termDay('Y2S2',1,1); G.hour=12.5; STORY.phoneRules(GM); PHONE.tick(G); check('7. 下學期第一週：再問一次',(G.msgs||[]).some(x=>x.tag==='fafu_bohan_Y2S2')&&!G.flags.FAFU_OFF); }
  { mem(sat('Y2S1',7)-1,20); STORY.phoneRules(GM); for(const w of [7,11]){ G.day=sat('Y2S1',w); G.hour=12.5; STORY.phoneRules(GM); } G.day=sat('Y2S1',13); G.hour=9.5; G.flags.LAWCLUB_SAT_LAST=G.day; G.hour=12.5; STORY.phoneRules(GM); PHONE.tick(G);
    check('7. 兩次沒去、第三次有去＝不算連續三次',!(G.msgs||[]).some(x=>x.tag==='fafu_bohan_Y2S1')); }
  // 8. 大二起沒加入法服的旁觀（AA_238 2-4：說話的人換成學長／值班的學長，每次都在；w5、w8、w11 刪）
  const watch=async(day,flags,n)=>{ fresh(day,9.5,'wancai',Object.assign({},flags)); G.stage='law'; said=[]; const out=[]; for(let i=0;i<(n||1);i++){ G.flags.LAWCLUB_SAT_LAST=null; G.hour=9.5; said=[]; await STORY.fafuWatch(GM); out.push(lines()); } return out; };
  const LD=/^(學長|值班的學長)：/, ldOf=L=>L.filter(t=>LD.test(t)).map(t=>t.replace(LD,''));
  { const R=await watch(sat('Y2S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true,LAWCLUB_SAT_FIVE:true},1);
    check('8. 大一聽過「明年可以報名」、大二沒報名：大二第一次旁觀＝學長 ⓐ1「我說過，明年可以報名。……你沒報。也好，站那邊，看得最清楚。」',JSON.stringify(ldOf(R[0]))===JSON.stringify(STORY.FAFU_W1.a1)&&R[0].some(t=>t.startsWith('學長：')),JSON.stringify(R[0])); }
  { const R=await watch(sat('Y2S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true},1);
    check('8. 大一來過、沒聽過那一句：ⓐ2「沒報名，也還是來。站那邊，回去記得寫下來。」',JSON.stringify(ldOf(R[0]))===JSON.stringify(['沒報名，也還是來。站那邊，回去記得寫下來。']),JSON.stringify(R[0])); }
  { const R=await watch(sat('Y2S1',7),{},2);
    check('8. 大一一次都沒來、大二才來：第一次是值班的學長那兩句（AA_238 2-1）；第二次不再有 ⓐ',JSON.stringify(ldOf(R[0]))===JSON.stringify(['第一次來？站這邊聽就好。','不要插話，也先不要給意見。看我們怎麼問。……問題問對了，事情就清楚一半。'])&&R[0].some(t=>t.startsWith('值班的學長：'))&&!ldOf(R[1]).some(t=>STORY.FAFU_W1.a1.concat(STORY.FAFU_W1.a2,STORY.FAFU_W1.a3).includes(t)),JSON.stringify(R)); }
  { const R=await watch(sat('Y2S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true},7); const S2=R.map(ldOf);
    check('8. 大二：一天最多一句；ⓑ「哪天想坐下來，跟我說。……不說也沒關係。」和旁白池一起輪；沒有學姊、沒有「九月我還在這裡」',R.every(L=>L.filter(t=>/點頭，回到圓桌/.test(t)).length<=1)&&S2.some(x=>x.includes('哪天想坐下來，跟我說。……不說也沒關係。'))&&!R.some(L=>L.some(t=>SISRE.test(t)||/九月我還在這裡/.test(t))),JSON.stringify(S2)); }
  { const R=await watch(sat('Y3S1',7),{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true,FAFU_W:{y2:1}},6); const S3=R.map(ldOf);
    check('8. 大三上第一次：值班的學長 ⓒ「還是站旁邊？看我們怎麼問，看他在哪裡停下來。」；之後沒有「升官」（w8 刪）',JSON.stringify(S3[0])===JSON.stringify(STORY.FAFU_W1.c)&&!R.some(L=>L.some(t=>/升官/.test(t))),JSON.stringify(S3)); }
  { const k1=STORY.termDay('Y4S1',3,6); const R=await watch(k1,{LAWCLUB_SAT_FIRST:true,FAFU_Y1_SEEN:true,FAFU_W:{y2:1,y3:1}},3);
    check('8. 大四第一次：值班的學長 ⓓ「下次換你告訴我，今天哪一句最重要。」；沒有「論文的第三章」（w11 刪）',JSON.stringify(ldOf(R[0]))===JSON.stringify(STORY.FAFU_W1.d)&&!R.some(L=>L.some(t=>/論文的第三章/.test(t))),JSON.stringify(R)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
