// C04 托福／多益補習（AA_199 7-2、AA_241 第 9、10 節、AA_264 第 2 節；BB_198 Kevin 當助教）——不需要瀏覽器。用法：node tests/vac_c04_unit.js
// 修改前：沒有 C04／C04W（全部失敗）
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const I1=VAC.inst('C04','Y1'), I2=VAC.inst('C04','Y2'), W2=VAC.inst('C04W','Y2'), W3=VAC.inst('C04W','Y3');
  check('1. 大一暑假 7/6～8/12 週一、三晚上（12 堂）；大二暑假 7/12～8/18',!!I1&&I1.from===D('2026-07-06')&&I1.to===D('2026-08-12')&&VAC.daysOf(I1).length===12&&!!I2&&I2.from===D('2027-07-12'),JSON.stringify(I1&&VAC.daysOf(I1).length));
  check('1. 考試：8/22（六）、2027-08-28（六）、寒假 2027-01-23（六）、大三寒假多益 2028-01-16（日）',[I1,I2,W2,W3].map(I=>CALENDAR.dateOf(VAC.dayOf(I.yk,I.A.season,I.A.keys[3].day)).key).join()==='2026-08-22,2027-08-28,2027-01-23,2028-01-16');
  check('1. 大一寒假不開（AA_199，AA-C 16:51 確認）',VAC.inst('C04W','Y1')===null);
  check('1. 大三寒假是多益',W3.A.title==='多益補習（寒假班）'&&W3.A.score.test==='toeic');
  // 2. 報名（假期行事曆）→ 當晚 21:00 家人群組兩則 → 關鍵事件排好
  const w12=termDay('Y1S2',12,1); fresh(w12,11.9,'dorm',{}); G.stage='law'; run(11.9,12.2);
  const o=VAC.signupOpen(G,I1); check('2. 大一下第 12 週週一起行事曆可以報、到 7/5',!!o&&o.from===w12&&o.to===D('2026-07-05'),JSON.stringify(o));
  G.hour=15; VAC.signup(G,'C04@Y1','yes'); run(15,21.2); const H=TH('g:home');
  check('2. 當晚 21:00 家人群組：「補習費轉過去了。」「上課不要坐最後一排。」，回「收到，謝謝。」→「👍」',H.length>=2&&H[H.length-2].text==='補習費轉過去了。'&&H[H.length-1].text==='上課不要坐最後一排。'&&H[H.length-1].h===21&&!!H[H.length-1].ask&&H[H.length-1].ask.opts[0].t==='收到，謝謝。',JSON.stringify(H.map(m=>m.text)));
  check('2. 四個關鍵事件：7/6、7/22、8/3 19:00，8/22 09:00 在考場（別的學校）',['vac_C04@Y1_0','vac_C04@Y1_1','vac_C04@Y1_2','vac_C04@Y1_3'].every(k=>!!OUT.get(G,k))&&OUT.get(G,'vac_C04@Y1_3').place==='考場（別的學校）'&&OUT.get(G,'vac_C04@Y1_3').h===9&&OUT.get(G,'vac_C04@Y1_0').day===D('2026-07-06'));
  // 3. 第一堂：暑假才第一次來＝「欸，學弟？你也來這裡補？這期老師講比較快…」；記 KEVIN_TA_MET
  G.day=D('2026-07-06'); G.weekday=1; G.hour=19; said=[]; picks=[0]; await VAC.outing(GM,OUT.get(G,'vac_C04@Y1_0')); let L=lines();
  check('3. 第一堂（暑假、第一次）：Kevin「欸，學弟？你也來這裡補？這期老師講比較快，跟不上就問我。」→「學長暑假也在？」「暑假班人多，老闆說我不能請假。」',L.includes('Kevin：欸，學弟？你也來這裡補？這期老師講比較快，跟不上就問我。')&&L.includes('Kevin：暑假班人多，老闆說我不能請假。')&&G.flags.KEVIN_TA_MET===true,JSON.stringify(L));
  G.day=D('2026-07-22'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C04@Y1_1')); check('3. 模擬考：「第一次模擬考。聽力的速度比你想的快很多。」',lines()[0]==='第一次模擬考。聽力的速度比你想的快很多。');
  G.day=D('2026-08-03'); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C04@Y1_2')); check('3. 累到不行（住宿舍）：「補完習回宿舍，單字本攤在胸口就睡著了。」',lines()[0]==='補完習回宿舍，單字本攤在胸口就睡著了。');
  // 4. 考前一週 Kevin 私訊
  G.day=D('2026-08-15'); G.weekday=wdOf(G.day); run(20.8,21.2); const K=TH('p:kevin');
  check('4. 考前七天 21:00 Kevin：「考前一週了」「不要熬夜 前一天背的單字都會忘」「考完請我喝飲料」＋兩個回覆（選項①的回覆 AA_335 T5「說好了喔」）',K.map(m=>m.text).join('|')==='考前一週了|不要熬夜 前一天背的單字都會忘|考完請我喝飲料'&&K[2].ask.opts.map(o=>o.t+'→'+o.say[0].text).join('|')==='好，考完請學長。→說好了喔|學長也是熬夜背的吧。→所以我知道會忘',JSON.stringify(K.map(m=>m.text)));
  G.day=D('2026-08-22'); G.hour=9; said=[]; await VAC.outing(GM,OUT.get(G,'vac_C04@Y1_3'));
  check('4. 正式考試：「考場在別的學校。你提早半小時到，還是找了一下教室。」；考完＝done',lines()[0]==='考場在別的學校。你提早半小時到，還是找了一下教室。'&&VAC.state(G,'C04@Y1')==='done');
  G.day=D('2026-09-01'); G.weekday=wdOf(G.day); run(20.8,21.2); const S1=TH('sys').filter(m=>m.tag==='vac_score_C04@Y1').map(m=>m.text);
  check('4. 考完 10 天 21:00 系統字「成績出來了。」＋分數（四場都去＝84）',S1[0]==='成績出來了。'&&S1[1]==='托福 84 分。',JSON.stringify(S1));
  // 5. 大二寒假（第二次）：日誌、比上次多
  G.day=termDay('Y2S1',12,1); G.weekday=1; G.hour=12.1; run(12.1,12.2); VAC.signup(G,'C04W@Y2','yes'); G.day=D('2026-12-28'); G.weekday=1; G.hour=19; said=[]; await VAC.outing(GM,OUT.get(G,'vac_C04W@Y2_0'));
  check('5. 第二次的第一堂＝日誌「補習班第一堂。櫃台的人說：「又來了喔。」」（Kevin 那段只有第一次）',lines().join('|')==='補習班第一堂。櫃台的人說：「又來了喔。」',JSON.stringify(lines()));
  for(const [i,dk] of [[1,'2027-01-06'],[2,'2027-01-11'],[3,'2027-01-23']]){ G.day=D(dk); said=[]; await VAC.outing(GM,OUT.get(G,'vac_C04W@Y2_'+i)); }
  G.day=D('2027-02-02'); G.weekday=wdOf(G.day); run(20.8,21.2); const S2=TH('sys').filter(m=>m.tag==='vac_score_C04W@Y2').map(m=>m.text);
  check('5. 第二次托福：分數比上次高＝「比上次多。」',S2[1]==='托福 90 分。比上次多。',JSON.stringify(S2));
  // 6. 寒假版第一堂（寒假第一次來的玩家）；暑假版給 KEVIN_TA_MET 的
  fresh(termDay('Y2S1',12,1),12.1,'dorm',{}); G.stage='law'; run(12.1,12.2); VAC.signup(G,'C04W@Y2','yes'); G.day=D('2026-12-28'); G.weekday=1; G.hour=19; said=[]; picks=[1]; await VAC.outing(GM,OUT.get(G,'vac_C04W@Y2_0')); L=lines();
  check('6. 寒假第一次：「（發講義的助教抬起頭，是 Kevin。）」「坐前面，後面聽不清楚。講義多給你一份，上一期的。」→「謝謝學長。」「不用謝。不要跟老師說我多給的。」',L[0]==='（發講義的助教抬起頭，是 Kevin。）'&&L.includes('Kevin：坐前面，後面聽不清楚。講義多給你一份，上一期的。')&&L.includes('Kevin：不用謝。不要跟老師說我多給的。'),JSON.stringify(L));
  const kv=VAC_DATA.A.C04.keys[0].lines[1].text; check('6. 暑假版：寒假見過他的（KEVIN_TA_MET）＝「暑假也來？坐前面，冷氣比較不吵。……」',kv({flags:{KEVIN_TA_MET:true}}).startsWith('暑假也來？坐前面，冷氣比較不吵。'));
  // 7. 寒假沒報：平日 18:00～18:30 公館門口招呼（大二寒假起，一個假期一次；第二個假期換句）
  const door=ev('ev_kevin_cram_door');
  fresh(D('2027-01-12'),18.1,'gongguan',{}); G.stage='law'; check('7. 大二寒假、沒報、平日 18:05 在公館：Kevin 招呼',EVENTS.check(door));
  said=[]; await EVENTS.run(door); check('7. 第一次：「學弟！路過喔？我要上班了，下次聊。」；這個寒假不再',lines().join('|')==='Kevin：學弟！路過喔？我要上班了，下次聊。'&&!EVENTS.check(door),JSON.stringify(lines()));
  G.day=D('2028-01-04'); G.weekday=wdOf(G.day); G.hour=18.2; check('7. 大三寒假又可以',EVENTS.check(door)); said=[]; await EVENTS.run(door); check('7. 第二個假期：「又是你。……真的不報一下？我開玩笑的。」',lines().join('|')==='Kevin：又是你。……真的不報一下？我開玩笑的。');
  fresh(D('2026-01-12'),18.1,'gongguan',{}); G.stage='law'; check('7. 大一寒假（C04 不開）：每個玩家都有一次門口招呼（BB-C 17:17）',EVENTS.check(door)); said=[]; await EVENTS.run(door); check('7. 大一寒假是第一次：「學弟！路過喔？……」',lines().join('|')==='Kevin：學弟！路過喔？我要上班了，下次聊。');
  G.day=D('2027-01-12'); G.weekday=wdOf(G.day); G.hour=18.1; said=[]; await EVENTS.run(door); check('7. 大一寒假招呼過，大二寒假就是第二次：「又是你。……」',lines().join('|')==='Kevin：又是你。……真的不報一下？我開玩笑的。');
  fresh(D('2026-01-26'),18.1,'gongguan',{}); G.stage='law'; check('7. 大一寒假 1/24～1/31 他在日本：不招呼',!EVENTS.check(door));
  fresh(D('2027-01-12'),18.1,'gongguan',{}); G.stage='law'; G.vac={reg:{'C04W@Y2':'yes'}}; check('7. 報了寒假班：不在門口招呼（他是那一班的助教）',!EVENTS.check(door));
  fresh(D('2027-01-16'),18.1,'gongguan',{}); G.stage='law'; check('7. 週末：不招呼',!EVENTS.check(door));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
