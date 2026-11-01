// 學姊 A5-1 新版（BB_188 @05571a45，使用者 10:3x 通過；實作照 AA_218 17-13；LIFE-HS-1017）——不需要瀏覽器。用法：node tests/sis_a51_unit.js
//   B：開學典禮加入「法律系新生（自介版）」→ 9/1 21:00 自我介紹（澄嶼高中）→ 9/2 12:30 她的留言 → 關手機時三行旁白（按讚、加好友）
//      → 9/3 早上加進聯絡人 → 9/3 21:00 祐廷先私訊（五則）；9/4 21:00 家族群組 Kevin 點到她、她兩句
//   C1：3/23 放榜以後，4/8（三）16:30 校內自動演（不在校內延下一個週三、跳過第 8～9 週、最晚第 15 週）；祐廷說「高二校慶好像被問過」以後插播回想 A
//   C2：交往中＋C1 演過：7/11 已交往＝當天 15:00 房間、16:00 私訊；之後才交往＝隔 3 天以上的第一個週六（第一句換「搬家後還有幾箱沒拆。」）；沒交往不演
// 修改前：沒有這些群組、訊息和事件（全部失敗）
// 2026-10-28 AA_518 第 4-12 改的（企劃線 973dd1b74，SIS-B15-1028）：C1 要見過她（met_sis）——第 4 節的前置多 met_sis；沒見過的不演在 tests/aa518_sis_b15_unit.js。
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/vac_activities.js','src/vac3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
  const d31=D('2025-08-31'), d1=D('2025-09-01'), d2=d1+1, d3=d1+2, d4=d1+3, r23=D('2026-03-23'), a8=D('2026-04-08'), j11=D('2026-07-11');
  check('0. 9/1 週一、4/8 週三、7/11 週六',wdOf(d1)===1&&wdOf(a8)===3&&wdOf(j11)===6);
  { const t=CALENDAR.termOf(a8), t2=CALENDAR.termOf(a8+7), t3=CALENDAR.termOf(D('2026-06-03')); check('0. 4/8＝大一下第 7 週、4/15＝第 8 週（考試週）、6/3＝第 15 週',t&&t.id==='Y1S2'&&t.week===7&&t2&&t2.week===8&&t3&&t3.week===15,JSON.stringify([t&&t.week,t2&&t2.week,t3&&t3.week])); }
  // B
  fresh(d31,15,'campus',{LAW_START_DAY:D('2025-08-29'),introDone:true}); G.stage='law';
  STORY.lawClassJoinY1(G); check('1. 開學典禮和班群一起加入「法律系新生（自介版）」',PHONE.inGroup(G,'law_class')&&PHONE.inGroup(G,'law_board'));
  G.day=d1; G.weekday=1; run(20.5,20.9); check('1. 9/1 21:00 以前沒有自我介紹',!PHONE.sent(G,'sis_b_intro'));
  run(21,21.1); let B=txt('g:law_board');
  check('1. 9/1 21:00 祐廷的自我介紹（原文，○○高中＝澄嶼高中；AA_372 第 10 項拿掉「重考一年」），前後有不具名同學的自介',B.includes('player:大家好，我是祐廷，財經法學組，澄嶼高中畢業。興趣是數學跟睡覺。請多指教。')&&B.length>=4&&TH('g:law_board').filter(m=>m.from!=='player').every(m=>!m.from&&m.name&&m.text.includes(m.name)),JSON.stringify(B));
  G.day=d2; G.weekday=2; run(11,12.4); check('1. 9/2 12:30 以前沒有她的留言',!PHONE.sent(G,'sis_b_comment'));
  said=[]; check('1. 留言還沒出現：關手機不演旁白',!(await STORY.afterPhoneClose(GM))&&!said.length);
  run(12.5,12.6); B=txt('g:law_board'); check('1. 9/2 12:30 她的留言「歡迎學弟～選課或宿舍有問題可以私訊問我。」',B.includes('heroine_05:歡迎學弟～選課或宿舍有問題可以私訊問我。'),JSON.stringify(B));
  said=[]; check('1. 留言出現了、但還沒打開自介版：關手機不演',!(await STORY.afterPhoneClose(GM))&&!said.length);
  PHONE.markSeen(G,'g:law_board'); said=[]; await STORY.afterPhoneClose(GM); let L=lines();
  check('1. 看過留言後第一次關手機：三行旁白（按讚加好友、大頭貼、多看了兩秒），只演一次',JSON.stringify(L)===JSON.stringify(['（你按了讚，點進她的名字，送出交友邀請。）','（她的大頭貼是在總圖前面拍的，綁著馬尾，看著鏡頭外面的某個地方。）','（你多看了兩秒。）'])&&G.flags.SIS_B_FRIEND===true,JSON.stringify(L));
  said=[]; await STORY.afterPhoneClose(GM); check('1. 再關一次手機：不再演',!said.length);
  G.day=d3; G.weekday=3; run(7.5,8.1); check('1. 9/3 早上她接受＝加進聯絡人（SIS_CONTACTED）',G.flags.SIS_CONTACTED===true&&INV.hasContact(G,'heroine_05'));
  run(20.9,21.1); const S=txt('p:heroine_05');
  check('1. 9/3 21:00 祐廷先私訊（五則原文）',JSON.stringify(S.slice(-5))===JSON.stringify(['player:學姊好，謝謝妳的留言。想問一下，民總要先買哪一本嗎？','heroine_05:先不要買。第一堂課老師會說用哪一本。','heroine_05:真的想先看的話，系圖有，二樓。','player:好，謝謝學姊。','heroine_05:不會。']),JSON.stringify(S));
  G.flags.FAM_GROUP_SENT=true; PHONE.join(G,'family_law','法律系直屬家族'); G.day=d4; G.weekday=4; run(20.9,21.1); const FM=txt('g:family_law');
  check('2. 9/4 21:00 家族群組：Kevin 點到她、她兩句、Kevin「你們認識？」（AA_372 第 2 項：不再自我介紹；這裡沒有宿營＝只留「上面那位是你的直屬學姊。」，宿營版在 aa372_y1s1_unit）',JSON.stringify(FM.slice(-4))===JSON.stringify(['kevin:上面那位是你的直屬學姊。','heroine_05:學弟好。我們留言區見過了。','kevin:你們認識？','heroine_05:他自介我有留言。']),JSON.stringify(FM));
  // 9/17 開局（舊的）：沒有 B
  fresh(D('2025-09-17'),21.2,'dorm',{LAW_START_DAY:1}); G.stage='law'; STORY.lawClassJoinY1(G); run(21.2,21.4); check('1. 9/1 以後才開始的局：不補自我介紹',!PHONE.sent(G,'sis_b_intro'));
  // 放榜
  fresh(r23-1,23,'dorm',{SIS_CONTACTED:true}); G.stage='law'; STORY.phoneRules(GM); check('3. 3/22 還沒放榜',!G.flags.SIS_RESULT_OUT);
  G.day=r23; G.hour=8; STORY.phoneRules(GM); check('3. 3/23 放榜（SIS_RESULT_OUT）',G.flags.SIS_RESULT_OUT===true);
  // C1
  const c1=ev('ev_sis_c1_festival'); const at=(day,h,zone,fl)=>{ fresh(day,h,zone,Object.assign({SIS_CONTACTED:true,SIS_RESULT_OUT:true,met_sis:true},fl||{})); G.stage='law'; };   /* 2026-10-28 AA_518 第 4-12 改的（企劃線 973dd1b74）：C1 要見過她（met_sis）；沒見過的不演在 tests/aa518_sis_b15_unit.js */
  at(a8,16.5,'campus'); check('4. 4/8（三）16:30 在校園：演',EVENTS.check(c1));
  at(a8,16.5,'wancai'); check('4. 在萬才館也演',EVENTS.check(c1));
  at(a8,16.4,'campus'); check('4. 16:30 以前不演',!EVENTS.check(c1));
  at(a8,16.5,'gongguan'); check('4. 在公館：不演（延到下一個週三）',!EVENTS.check(c1));
  at(a8+7,16.5,'campus'); check('4. 4/15（第 8 週，考試週）不演',!EVENTS.check(c1));
  at(a8+14,16.5,'campus'); check('4. 4/22（第 9 週，考試週）不演',!EVENTS.check(c1));
  at(a8+21,16.5,'campus'); check('4. 4/29（第 10 週）演',EVENTS.check(c1));
  at(a8-7,16.5,'campus'); check('4. 4/1（4/8 以前）不演',!EVENTS.check(c1));
  at(a8+63,16.5,'campus'); check('4. 6/10（第 16 週）不演（最晚第 15 週）',!EVENTS.check(c1));
  at(a8,16.5,'campus',{SIS_CONTACTED:false}); check('4. 沒有 B（沒加好友）不演',!EVENTS.check(c1));
  at(a8,16.5,'campus',{SIS_RESULT_OUT:false}); check('4. 還沒放榜不演',!EVENTS.check(c1));
  at(a8,16.5,'campus'); picks=['長什麼樣子']; await EVENTS.run(c1); L=lines();
  const iAsk=L.findIndex(t=>t==='祐廷：……等一下。我高二校慶好像被問過。一群大學生，說他們是首都帝大法律的，要錄影、要約好幾次。'), iFb=L.indexOf('（高二上，校慶。操場邊排滿攤位，很吵。你手上一碗剉冰，煉乳快要和紅豆化在一起。）'), iBack=L.findIndex(t=>t.endsWith('真的假的？你高二是哪一年？'));
  check('4. 入場旁白「（你走過法學院圖書館外面的台階……）」、第一句「你下學期通識選好了嗎？」',L[0]==='（你走過法學院圖書館外面的台階，學姊坐在最上面一階，旁邊放著一杯咖啡。）'&&L[1].endsWith('你下學期通識選好了嗎？'),JSON.stringify(L.slice(0,3)));
  check('4. 回想 A 插在「……等一下。我高二校慶好像被問過。」之後、「真的假的？你高二是哪一年？」之前',iAsk>0&&iFb===iAsk+1&&iBack>iFb,JSON.stringify([iAsk,iFb,iBack]));
  check('4. 回想：她抄號碼「不好意思，最後四個數字再念一次？」（名字溫書瑀、不用現在的立繪）、「冰已經化掉一半了」',L.includes('溫書瑀：不好意思，最後四個數字再念一次？')&&L[iBack-1]==='（他們往下一攤走。你低頭繼續吃冰。冰已經化掉一半了。）',JSON.stringify(L.slice(iFb,iBack)));
  check('4. 三個選項照原文',JSON.stringify(opts[0])===JSON.stringify(['「我們那時候就見過了耶。」','「妳那時候長什麼樣子？」','「早知道那天就好好看一下。」']),JSON.stringify(opts));
  check('4. 選「長什麼樣子」：「頭髮放下來，沒綁。你呢？」「……金色的。」「金色？」（她笑到停不下來。）；記 SIS_FESTIVAL_MET',L.some(t=>t.endsWith('頭髮放下來，沒綁。你呢？'))&&L.includes('祐廷：……金色的。')&&L[L.length-1]==='（她笑到停不下來。）'&&G.flags.SIS_FESTIVAL_MET===true,JSON.stringify(L.slice(-5)));
  { const n=c1.dialogue.filter(l=>l.text!==undefined).length; check('4. 對話裡沒有筆記本（C1 她不記得有筆記本：不翻、不提）',!c1.dialogue.some(l=>l.text&&/筆記本/.test(l.text)&&!/拿著筆記本|抄進筆記本/.test(l.text)),n); }
  check('4. 相簿收「高二的校慶」（memory，背景先用操場）',(G.album||[]).some(a=>a.kind==='memory'&&a.id==='sis_hs_festival'&&a.title==='高二的校慶'&&a.bg==='camp_school'),JSON.stringify(G.album));
  await EVENTS.run(c1); check('4. 只演一次',!EVENTS.check(c1));
  // C2
  const c2=ev('ev_sis_c2_room'); const dat=(sinceDay,day,h)=>{ fresh(sinceDay,12,'dorm',{SIS_FESTIVAL_MET:true}); G.stage='law'; ROM.start(G,'heroine_05'); G.day=day; G.weekday=wdOf(day); G.hour=h; STORY.phoneRules(GM); };
  dat(j11-30,j11,14.9); check('5. 7/11 以前就交往：C2 日子＝7/11；15:00 以前不演',STORY.sisC2Day(G)===j11&&!EVENTS.check(c2),String(STORY.sisC2Day(G)));
  G.hour=15; check('5. 7/11 15:00 演',EVENTS.check(c2));
  said=[]; await EVENTS.run(c2); L=lines(); check('5. 房間：「（家裡要搬家。她的房間地上好幾個紙箱……）」＋筆記本拍照',JSON.stringify(L)===JSON.stringify(['（家裡要搬家。她的房間地上好幾個紙箱，一半已經封起來。）','（書架最下面一層，一本封面有點皺的筆記本。大一的通識課。她翻開，停在一頁，笑了一下，拿起手機拍照。）'])&&G.flags.SIS_C2_ROOM===j11,JSON.stringify(L));
  check('5. 相簿收「筆記本那一頁」（不放圖）',(G.album||[]).filter(a=>a.id==='sis_notebook').length===1&&G.album.find(a=>a.id==='sis_notebook').bg==='');
  check('5. 房間只演她：participants 空的（不算期末的一起在場）',c2.participants.length===0);
  run(15.1,15.9); check('5. 16:00 以前沒有私訊',!PHONE.sent(G,'sis_c2_msg'));
  run(16,16.1); const C=TH('p:heroine_05'), last=C[C.length-1];
  check('5. 16:00 私訊：照片（號碼不寫出來）、「剛剛整理東西看到的。」祐廷「哈哈，真的是我的號碼。妳還留著喔。」「我自己都忘了。」',C.some(m=>/^📷（一張照片：筆記本的一頁/.test(m.text)&&!/\d{4}/.test(m.text))&&C.some(m=>m.text==='剛剛整理東西看到的。')&&C.some(m=>m.from==='player'&&m.text==='哈哈，真的是我的號碼。妳還留著喔。')&&last.text==='我自己都忘了。'&&G.flags.SIS_FESTIVAL_NOTEBOOK===true,JSON.stringify(C.map(m=>m.text)));
  check('5. 三個回覆選項照原文',!!last.ask&&JSON.stringify(last.ask.opts.map(o=>[o.t,o.say[0].text]))===JSON.stringify([['那本不要丟。','不會丟啦。'],['我現在過去幫妳整理。','好啊。來了先幫我搬書。'],['早知道那天就抬頭看一下。','你在吃冰耶。']]),JSON.stringify(last.ask));
  // 7/11 以後才交往
  const j20=D('2026-07-20'); dat(j20,j20,15); const want=(()=>{ for(let d=j20+3;;d++) if(wdOf(d)===6) return d; })();
  check('6. 7/20 才交往：C2＝隔 3 天以上的第一個週六（7/25）',STORY.sisC2Day(G)===want&&CALENDAR.dateOf(want).m===7&&CALENDAR.dateOf(want).d===25,String(STORY.sisC2Day(G)));
  check('6. 交往當天不演',!EVENTS.check(c2));
  G.day=want; G.weekday=6; G.hour=15; check('6. 那個週六 15:00 演',EVENTS.check(c2));
  said=[]; await EVENTS.run(c2); L=lines(); check('6. 第一句換成「（搬家後還有幾箱沒拆。）」',L[0]==='（搬家後還有幾箱沒拆。）'&&L.length===2,JSON.stringify(L));
  // 7/11 那天沒演到（暑假快轉）
  dat(j11-30,j11+1,10); G.hour=15.5; check('7. 7/11 沒演到：之後補演（7/12）',EVENTS.check(c2));
  said=[]; await EVENTS.run(c2); check('7. 補演用「搬家後還有幾箱沒拆。」',lines()[0]==='（搬家後還有幾箱沒拆。）');
  G.hour=20; G.flags.SIS_C2_H=undefined; delete G.flags.SIS_C2_H; G.flags.SIS_C2_ROOM=G.day; G.flags.SIS_C2_H=20.25; run(20,20.2); check('7. 晚演的：演完 15 分鐘後才傳私訊',!PHONE.sent(G,'sis_c2_msg')); run(20.25,20.4); check('7. 20:15 傳',PHONE.sent(G,'sis_c2_msg'));
  // 沒交往／C1 沒演過
  fresh(j11,15,'dorm',{SIS_FESTIVAL_MET:true}); G.stage='law'; check('8. 沒交往：不演',!EVENTS.check(c2)&&STORY.sisC2Day(G)==null);
  fresh(j11-30,12,'dorm'); G.stage='law'; ROM.start(G,'heroine_05'); G.day=j11; G.weekday=6; G.hour=15; STORY.phoneRules(GM); check('8. C1 沒演過：不演',!EVENTS.check(c2));
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
