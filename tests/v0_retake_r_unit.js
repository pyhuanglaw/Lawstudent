// v0 重考期 R 系列（BB_112 第 4 節＋4-1 AB-38；AA_154 A39／A45）：可昕到博雅的時間、R1／R2／R5、讀書日輪流句、玩樂日 R3／R6／輪流旁白、R4、R7、沒遇到的照片——不需要瀏覽器。
// 修改前沒有 ev_y0_r1 等事件（全部失敗）。用法：node tests/v0_retake_r_unit.js
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
const K=k=>STORY.dayOfKey(k);
const kx=()=>TH('p:kexin').map(m=>m.text);
let menus=[], script=[]; GM.choose=async o=>{ const t=o.map(q=>q.t||q.text); menus.push(t); const w=script.shift(); if(w==null) throw new Error('STOP'); const k=t.findIndex(x=>x.includes(w)); return k<0?0:k; };
const loop=async()=>{ try{ await HOME.loop(GM); }catch(e){ if(e.message!=='STOP') throw e; } };
const study=(key,h,flags)=>{ fresh(K(key),h,'home',Object.assign({LEAVE_WEEK:6,Y0_LEFT:true,Y0_MOVED_OUT:true},flags||{})); G.stage='econ'; G.flags.RT_DAY={day:G.day,type:'study'}; const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };   /* AA_224 第 6 組：讀書日在祐廷家的餐桌 */
const runEv=async(id,pick)=>{ said=[]; script=pick==null?[]:[].concat(pick); await EVENTS.run(ev(id)); await new Promise(r=>setTimeout(r,10)); return said.map(x=>x.t); };
const keep=()=>JSON.stringify(G), back=s=>{ G=JSON.parse(s); SOCIAL.bind(G); EVENTS.bind(GM); };
(async()=>{
  const ids=['ev_y0_r1','ev_y0_r2','ev_y0_r3','ev_y0_r4','ev_y0_r5','ev_y0_r6','ev_y0_r7','ev_y0_rs','ev_y0_rp']; check('0. R 系列九個事件都在',ids.every(i=>!!ev(i))); if(!ids.every(i=>!!ev(i))){ console.log('FAILED '+fails); process.exit(1); }
  // 1. 她 2025-02 休學、沒有課了：kxFreeAt 拿掉，讀書日 10:00 到（AA_224 6-1）
  check('1. kxFreeAt 拿掉、她 10:00 到祐廷家',typeof STORY.kxFreeAt==='undefined'&&STORY.KX_ARRIVE===10);
  // 2. R1
  study('2025-02-15',9.9); check('2. 2/15 讀書日、在家、她還沒到（09:54）：不演',!EVENTS.check(ev('ev_y0_r1')));
  G.hour=10; check('2. 10:00 她到了：R1，不是輪流句',EVENTS.check(ev('ev_y0_r1'))&&!EVENTS.check(ev('ev_y0_rs')));
  G.flags.RT_DAY={day:G.day,type:'free'}; check('2. 不是讀書日：不演',!EVENTS.check(ev('ev_y0_r1'))); G.flags.RT_DAY={day:G.day,type:'study'};
  let L=await runEv('ev_y0_r1','白飯');
  check('2. R1：開頭「（她第一次來你家。……）」→「如果憲法是一間餐廳，第七條是什麼菜？」→ 白飯 →「不行。平等不是每個人拿到一模一樣。」「牙齒不好的客人……」→ 旁白 →「第七條這題我還沒吵完喔。」「等一下吃飯繼續，你先不要去翻課本。」（BB_179 段 D #43）',L[0]==='（她搬來的第一天。你媽端了一盤水果出來，放下就回廚房了。）'&&L[1]==='如果憲法是一間餐廳，第七條是什麼菜？'&&L.includes('不行。平等不是每個人拿到一模一樣。')&&L.includes('牙齒不好的客人，那碗可以煮軟一點。只要有理由。')&&L.includes('（她在筆記本上寫了一行，停了一下。）')&&L[L.length-2]==='第七條這題我還沒吵完喔。'&&L[L.length-1]==='等一下吃飯繼續，你先不要去翻課本。',JSON.stringify(L));
  check('2. 同一天不再有輪流句',!EVENTS.check(ev('ev_y0_rs')));
  // 3. R1 沒演到：那句移到下一次；讀書日輪流句（平日 S1）
  study('2025-03-31',12.4); check('3. 3/31 週一 12:24：輪流句',EVENTS.check(ev('ev_y0_rs'))&&!EVENTS.check(ev('ev_y0_r1')));
  L=await runEv('ev_y0_rs');
  check('3. 第一次＝S1「你又比我早起。……今天早餐我請。」；R1 沒演過＝接「我發現我喜歡吵贏……」（只一次）',L.includes('你又比我早起。……今天早餐我請。')&&L.includes('我昨天想一題想到睡不著。等一下要跟你吵。')&&G.flags.R1_LINE===true&&JSON.stringify(G.flags.RS_USED)==='[0]',JSON.stringify(L));
  const s3=keep(); G.day=K('2025-04-01'); G.weekday=wdOf(G.day); G.hour=12.4; G.flags.RT_DAY={day:G.day,type:'study'}; L=await runEv('ev_y0_rs');
  check('3. 下一個讀書日：S2「（她放下包包）」「你讀到哪了？……三章？我才讀到第二章。」（不再限週四）；R1 那句不再說',L.includes('你讀到哪了？……三章？我才讀到第二章。')&&!L.some(t=>/喜歡吵贏/.test(t)),JSON.stringify(L));
  back(s3); G.day=K('2025-03-28')+7; G.weekday=wdOf(G.day); G.hour=10.2; G.flags.RT_DAY={day:G.day,type:'study'}; L=await runEv('ev_y0_rs');
  check('3. 週五也一樣輪流（她沒有課了）：S2',L.includes('你讀到哪了？……三章？我才讀到第二章。'),JSON.stringify(L));
  // 4. R5
  study('2025-04-02',9.9); check('4. 4/2 09:54：她還沒到',!EVENTS.check(ev('ev_y0_r5'))); G.hour=10.1; G.events.done.ev_y0_r1=1;
  check('4. 10:06：R5',EVENTS.check(ev('ev_y0_r5'))&&!EVENTS.check(ev('ev_y0_rs'))); L=await runEv('ev_y0_r5');
  check('4. R5（AA_295）：「牆上的倒數撕到一百。」→「一百天。」「妳在想什麼？」「我們都考上的話——」「她停住。」「不行，這個太早講。」',L.join('|')==='牆上的倒數撕到一百。|一百天。|妳在想什麼？|我們都考上的話——|她停住。|不行，這個太早講。',JSON.stringify(L));
  fresh(K('2025-04-02'),20,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; run(20.9,21.1); check('4. 沒去：4/2 21:00 她傳「100」的照片',kx().includes('📷（牆上的倒數：100）'));
  // 5. R2
  study('2025-04-07',12.4); check('5. 第 8 週第一個讀書日（4/7 週一）：R2',EVENTS.check(ev('ev_y0_r2'))&&!EVENTS.check(ev('ev_y0_rs'))); L=await runEv('ev_y0_r2');
  check('5. R2：「錯一題請一碗。」「你欠我四碗。」「妳欠我三碗。」「所以你欠我一碗。」「……好啦。」（AA_203 #28）',L.slice(0,5).join('|')==='錯一題請一碗。|你欠我四碗。|妳欠我三碗。|所以你欠我一碗。|……好啦。',JSON.stringify(L));
  G.day=K('2025-04-08'); G.weekday=wdOf(G.day); G.hour=12.4; G.flags.RT_DAY={day:G.day,type:'study'}; check('5. 同一週下一個讀書日：輪流句',EVENTS.check(ev('ev_y0_rs'))&&!EVENTS.check(ev('ev_y0_r2')));
  fresh(K('2025-04-13'),20,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; run(20.9,21.1); check('5. 第 8 週都沒讀書日：4/13 21:00 四碗豆花＋「帳先記著。」',kx().includes('📷（四碗豆花）')&&kx().includes('以後互相出題，錯一題請一碗豆花。帳先記著。'));
  // 6. 玩樂日：R3（3/30 從家裡出門）
  const homeBase=(key,h,flags)=>{ fresh(K(key),h,'dorm',Object.assign({LEAVE_WEEK:6,Y0_LEFT:true,Y0_MOVED_OUT:true},flags||{})); G.stage='econ'; const H=HOME.rec(G); H.at=true; H.base=true; H.day=G.day; };
  homeBase('2025-03-30',8.5); script=['出去走走']; await STORY.retakeWake(GM); const q3=OUT.get(G,'rt_play_'+K('2025-03-30'));
  check('6. 3/30 起床選「今天出去走走」：排一個和可昕出門（10:00，R3 杜鵑花）',STORY.retakeType(G)==='play'&&q3&&q3.ev==='ev_y0_r3'&&q3.h===10,JSON.stringify(q3));
  G.hour=9.3; said=[]; menus=[]; let card=[]; const tc=GM.titleCard; GM.titleCard=async(a,b)=>{ card.push(a+'｜'+b); }; script=['和可昕出門','慢慢走']; await loop(); GM.titleCard=tc; L=said.map(x=>x.t);
  check('6. 家裡的選單出發（捷運＋公車 30 分鐘）→ R3 大安森林公園（AA_298 第 3 節）：「（大安森林公園。杜鵑花季快過了……）」→「今天不讀書。走到水池那邊，再走回來。」→「好了。去吃東西。」',(menus[0]||[]).some(t=>t.includes('和可昕出門'))&&card[0]==='和可昕出門 10:00｜捷運＋公車 約 30 分鐘'&&L.includes('（大安森林公園。杜鵑花季快過了，靠捷運站那一排還開著。）')&&L.includes('今天不讀書。走到水池那邊，再走回來。')&&L.includes('（你們走得很慢。到了水池，她站在欄杆邊看水裡的烏龜，看了很久。）')&&L.includes('好了。去吃東西。')&&!L.some(t=>/椰林|投票/.test(t)),JSON.stringify(card)+JSON.stringify(L));
  check('6. habit retake:play +1；演完回臺北的家（不是回宿舍）',EVENTS.habitCount({key:'retake:play'})===1&&HOME.at(G)&&card.some(c=>c.startsWith('回臺北的家')),JSON.stringify(card));
  fresh(K('2025-04-01'),20,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; run(20.9,21.1); check('6. 3/30～4/1 都沒玩樂日：4/1 21:00 杜鵑花照片「大安森林公園的杜鵑。今天自己去走了一圈。」',kx().includes('大安森林公園的杜鵑。今天自己去走了一圈。'));
  // 7. 沒有 R 的玩樂日：旁白一句輪流
  homeBase('2025-04-10',8.5); script=['出去走走']; await STORY.retakeWake(GM); const q7=OUT.get(G,'rt_play_'+G.day);
  check('7. 4/10（週四）的玩樂日：她沒有課了＝10:00、輪流旁白',q7&&q7.ev==='ev_y0_rp'&&q7.h===10,JSON.stringify(q7));
  G.hour=9.5; said=[]; script=['和可昕出門']; await loop(); L=said.map(x=>x.t);
  check('7. 第一次＝P1「（你們在公館的二輪戲院看了一部老電影。……）」',L.includes('（你們在公館的二輪戲院看了一部老電影。片尾字幕跑完以前，她不准你站起來。）'),JSON.stringify(L));
  const s7=keep(); G.day=K('2025-05-20'); G.weekday=wdOf(G.day); G.flags.RT_DAY={day:G.day,type:'play'}; G.outings=[]; G.hour=8.5; STORY.rtPlanPlay(G); G.hour=STORY.KX_ARRIVE-0.3; said=[]; script=['和可昕出門']; await loop(); L=said.map(x=>x.t);
  check('7. 5/20：P2 溫州街（到 5/15）過了 → P3 映月湖',L.includes('（你們坐在映月湖邊吃雞蛋糕。她說湖裡的魚看起來也在準備考試。）'),JSON.stringify(L));
  // 8. R6
  homeBase('2025-05-06',8.5); script=['出去走走']; await STORY.retakeWake(GM); check('8. 第 12 週第一個玩樂日（5/6）：R6 河濱',OUT.get(G,'rt_play_'+G.day).ev==='ev_y0_r6');
  L=await runEv('ev_y0_r6'); check('8. R6：「今天不讀書。這是規定。」「誰規定的？」「我。剛剛。」…「好。這一題，七月再對答案。」',L.includes('今天不讀書。這是規定。')&&L.includes('誰規定的？')&&L.includes('我。剛剛。')&&L.includes('你手機也收起來。')&&L[L.length-1]==='（你也把手機收起來。你們躺到太陽快下山，才騎回去。）',JSON.stringify(L));
  fresh(K('2025-05-10'),20,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; run(20.9,21.1);
  check('8. 到 5/10 都沒去成：21:00 夕陽照片「讀不下去，自己騎來河濱了。」；5/11 的玩樂日不是 R6',kx().includes('讀不下去，自己騎來河濱了。')&&G.flags.R6_MISSED&&(()=>{ G.day=K('2025-05-11'); return STORY.rPlayEv(G)[0]==='ev_y0_rp'; })());
  // 9. R4 模擬考拿掉（AA_298 第 2 節「根本沒有模擬考」）
  fresh(K('2025-04-19'),15.5,'dorm',{LEAVE_WEEK:6}); G.stage='econ'; run(15.5,20.9); run(20.9,21.1);
  check('9. 4/19：沒有「模擬考考完了。」「今天考爛了。」私訊',!kx().some(t=>/模擬考|考爛了/.test(t)),JSON.stringify(kx()));
  fresh(K('2025-04-19'),16.5,'campus',{LEAVE_WEEK:6}); G.stage='econ'; check('9. 4/19 16:00 在校園：R4 不演（retired）',!EVENTS.check(ev('ev_y0_r4')));
  // 10. R7
  homeBase('2025-05-23',20.5); run(20.5,21.1); const T7=(G.msgs||[]).filter(m=>/^g:econ/.test(m.th)).map(m=>(m.from==='player'?'我:':'')+m.text);
  check('10. 5/23 21:00 阿勳在群組「那張便利貼，你還留著嗎？」→ 祐廷傳照片 →「好。那就算數。……明天兩點。欠我一場。」；出發選單 5/24 保齡球館 14:00',T7.join('|').includes('那張便利貼，你還留著嗎？|我:📷（臺北的家，檯燈上的便利貼）|還在喔。|明天兩點，保齡球館。欠我的那場。')&&OUT.get(G,'y0_r7')&&OUT.get(G,'y0_r7').h===14,JSON.stringify(T7));
  L=await runEv('ev_y0_r7'); check('10. R7：旁白「這次不換制服，輸的人請宵夜。」…阿勳「這次看好。」→「（十支瓶子一起倒下。這次，大家都看到了。）」',L[0]==='（週六下午兩點，保齡球館。這次不換制服，輸的人請宵夜。）'&&L[L.length-1]==='（十支瓶子一起倒下。可昕站起來拍手。）',JSON.stringify(L));
  homeBase('2025-05-23',20.5); run(20.5,21.1); G.day=K('2025-05-24'); G.hour=16.9; run(16.9,17.1); check('10. 沒去：5/24 17:00 阿勳舉著球「全倒。這次有證人。」',(G.msgs||[]).some(m=>m.text==='全倒。這次有證人。'));
  // 11. 法律系不受影響
  fresh(termDay('Y1S1',4,3),20.5,'dorm'); G.stage='law'; run(20.5,21.2); check('11. 法律系的存檔：沒有 R 系列的訊息',!PHONE.sent(G,'y0_r7_ask')&&!PHONE.sent(G,'y0_r5_miss')&&!(G.msgs||[]).some(m=>/四碗豆花|杜鵑花/.test(m.text)));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
