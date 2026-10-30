// V2-B10 第二部分：阿勳、品妤的作息（AA_155）、「走啦」群組（AA_157）、10-3 共同教學館的阿勳（V2-C13）、10-4 小福的還債、1-4 芯慈在重修教室（BB_135）、AA-B 2026-10-16 的先後裁定——不需要瀏覽器。
// 修改前：作息是空的、沒有 econ_friends、沒有 ev_xun_gongtong／ev_sk03_xinci_class（第 1、2、4、7 項失敗）。
// 用法：node tests/v2_b10b_unit.js
// 用法：node tests/v2_b10_unit.js
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
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
const termDay=(term,w,wd)=>STORY.termDay(term,w,wd);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
let caps=[]; GM.caption=(w,t)=>caps.push(t);
const after=async(day)=>{ G.day=day; G.weekday=wdOf(day); G.hour=12.17; G.zone='putong'; const it={c:{id:'econ_principles_2'}}; said=[]; opts=[]; caps=[]; return await CLS.afterClassEvent(GM,it); };
  const e=ev('ev_sk03_lunch'); check('1. ev_sk03_lunch 存在（afterClass econ_principles_2、大一下、週五）',!!e&&e.afterClass==='econ_principles_2'&&JSON.stringify(e.term)==='["Y1S2"]');
  if(!e){ console.log('FAILED '+fails); process.exit(1); }
  const F2=termDay('Y1S2',2,5), F3=termDay('Y1S2',3,5), F4=termDay('Y1S2',4,5), F5=termDay('Y1S2',5,5), F7=termDay('Y1S2',7,5), F9=termDay('Y1S2',9,5);
  fresh(F2,12.17,'putong',{introDone:true,classDone:true,afternoonDone:true});
(async()=>{

  const X=CHARACTERS.econ_zhengxun, Pn=CHARACTERS.econ_pinyu, at=(day,hour,flags)=>{ fresh(day,hour,'campus',flags); return STORY.schedEnt(X,G); };
  const F2=termDay('Y1S2',2,5), F3=termDay('Y1S2',3,5), W11T=termDay('Y1S2',11,4), F11=termDay('Y1S2',11,5), F12=termDay('Y1S2',12,5), W10T=termDay('Y1S2',10,4), F8=termDay('Y1S2',8,5), F9=termDay('Y1S2',9,5);
  /* 1. AA_155 作息 */
  { const a=at(F3,12.15), b=at(F3,12.15,{MET_XUN:true}), c=at(F3,12.5,{MET_XUN:true}), d=at(W11T,20.9), e=at(W10T,19.5), f=at(W10T,19.5,{MET_XUN:true}), g=at(termDay('Y1S2',16,2),22), y4=at(termDay('Y1S2',3,5),12.15,{MET_XUN:true});
    check('1. 阿勳：P4d 之前（沒有 MET_XUN）週五 12:15 不在走廊；之後在普通教學館走廊；12:30「在學活吃午餐」（AA_373 #23：小松已拆）',!(a&&a.zone)&&b&&b.zone==='putong'&&b.act==='linger'&&c&&c.zone===null&&c.away==='在學活吃午餐',JSON.stringify([a&&a.zone,b&&b.zone,c&&c.away]));
    check('1. 阿勳：第 11 週週四 20:54 共同教學館自習區（沒見過也在）；第 10 週週四 19:30 要 MET_XUN',d&&d.zone==='gongtong'&&d.room==='study'&&!(e&&e.zone)&&f&&f.zone==='gongtong',JSON.stringify([d,e&&e.zone,f&&f.zone]));
    check('1. 阿勳：期末考週 22:00「在社科院四樓的窗邊讀書」',g&&g.zone===null&&g.away==='在社科院四樓的窗邊讀書',JSON.stringify(g));
    const lab=termDay('Y1S2',10,5); fresh(lab,12.15,'campus',{MET_XUN:true,MET_PINYU:true}); const hol=CALENDAR.holiday(lab);
    fresh(termDay('Y1S2',4,5),12.15,'campus',{MET_PINYU:true}); const p1=STORY.schedEnt(Pn,G); fresh(termDay('Y1S2',4,2),19,'campus',{}); const p2=STORY.schedEnt(Pn,G);
    check('1. 品妤：P4d 之後週五 12:15 在走廊（MET_PINYU）、週二 19:00「在補習班櫃台打工」',p1&&p1.zone==='putong'&&p2&&p2.away==='在補習班櫃台打工',JSON.stringify([p1&&p1.zone,p2&&p2.away]));
    let holOk=true; for(let d=termDay('Y1S2',1,1);d<=termDay('Y1S2',18,7);d++){ fresh(d,12.15,'campus',{MET_XUN:true}); if(CALENDAR.holiday(d)&&G.weekday===5){ const en=STORY.schedEnt(X,G); if(en&&en.zone) holOk=false; } }
    check('1. 國定假日的週五不在走廊（noHoliday）',holOk); }
  /* 2. 「走啦」群組 */
  { fresh(1,9,'dorm',{}); STORY.phoneRules(GM); const g=G.phone.groups.econ_friends, M=G.msgs.filter(m=>m.th==='g:econ_friends'), u=PHONE.unreadAll?PHONE.unreadAll(G):null;
    check('2. 第一天就有群組「走啦」，裡面只有 2025-08-13 那張照片（韋綸）；AA_368 M1：「四個人和準備收攤的老闆。桌上多擺了兩副碗筷。」（那晚可昕在高雄，原本「六個人」）',!!g&&g.name==='走啦'&&M.length===1&&M[0].text==='📷（公館的宵夜攤，四個人和準備收攤的老闆。桌上多擺了兩副碗筷。）'&&CALENDAR.dateOf(M[0].day).key==='2025-08-13',JSON.stringify([g,M]));
    const sum=PHONE.threads?PHONE.threads(G).find(t=>t.th==='g:econ_friends'):null; check('2. 舊照片不算未讀',!sum||!sum.unread,JSON.stringify(sum));
    STORY.phoneRules(GM); check('2. 重跑不會多一張',G.msgs.filter(m=>m.th==='g:econ_friends').length===1); }
  /* 3. 10-3 */
  const e3=ev('ev_xun_gongtong'); check('3. ev_xun_gongtong：共同教學館、npcNear 阿勳、20:48～23:00、大一下第 11 週週四',!!e3&&e3.location==='gongtong'&&e3.npcNear==='econ_zhengxun'&&JSON.stringify(e3.weeks)==='[11]'&&JSON.stringify(e3.weekday)==='[4]'&&e3.time[0]===20.8);
  if(e3){ fresh(W11T,20.9,'gongtong',{}); picks=['一起讀到閉館']; await EVENTS.run(e3); const L=lines();
    check('3. 沒見過的玩家先重新介紹；三個選項；一起讀到閉館＝閉館音樂兩句、時間到 23:00、記 XUN_NIGHT／MET_XUN',L[0]==='阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。'&&JSON.stringify(opts[0])==='["一起讀到閉館","聊兩句就走","「期末考一起讀？」"]'&&L.includes('23:00 閉館的音樂響起。')&&L.includes('阿勳：……謝了。')&&G.flags.XUN_NIGHT&&G.flags.MET_XUN&&Math.abs(G.hour-23)<0.01&&G.flags.XUN_DAY===W11T,JSON.stringify(L)+' '+G.hour);
    fresh(W11T,20.9,'gongtong',{MET_XUN:true}); picks=['聊兩句']; await EVENTS.run(e3); const L2=lines(); G.hour=21.3; STORY.phoneRules(GM); PHONE.tick(G); const g2=G.msgs.filter(m=>m.th==='g:econ_friends').map(m=>m.text);
    check('3. 見過的不重新介紹；聊兩句就走＝「好。法律系的去忙。」、群組「我在共同遇到他。法律系果然比較累。」',L2[0]==='阿勳：（抬頭）法律系的也來共同讀書？你們不是有自己的館？'&&L2.includes('阿勳：好。法律系的去忙。')&&g2.includes('我在共同遇到他。法律系果然比較累。')&&!G.flags.XUN_NIGHT,JSON.stringify([L2,g2]));
    fresh(W11T,20.9,'gongtong',{MET_XUN:true}); picks=['期末考']; await EVENTS.run(e3); G.hour=21.3; STORY.phoneRules(GM); PHONE.tick(G); const pm=G.msgs.filter(m=>m.th==='p:econ_zhengxun').map(m=>m.text);
    check('3. 「期末考一起讀？」＝「你們期末也是那兩週吧？……」、XUN_PACT、私訊行程表',lines().includes('阿勳：你們期末也是那兩週吧？……好，我把行程傳給你。')&&G.flags.XUN_PACT&&pm.length===1,JSON.stringify(pm)); }
  /* 4. 10-4 還債（ev_sk03_lunch） */
  const lunch=async(day,flags,pick)=>{ fresh(day,12.17,'putong',Object.assign({introDone:true,classDone:true,afternoonDone:true,P4D_ANSWER:'retake',ECON_HALLWAY_DAY:F2,MET_XUN:true,MET_PINYU:true},flags)); picks=[pick||'一起去']; said=[]; opts=[]; caps=[]; await CLS.afterClassEvent(GM,{c:{id:'econ_principles_2'}}); return lines(); };
  { const L=await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true});
    check('4. 第 11 週週五：走廊「昨天那題我想通了。」→「學活。走不走？」→ 去了＝還債三句（不是平常的輪替句）、XUN_REPAID',L[0]==='阿勳：昨天那題我想通了。'&&L[1]==='阿勳：學活。走不走？'&&L.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&L.includes('品妤：他從來沒請過我。')&&L.includes('阿勳：妳又沒教過我統計。')&&!L.includes('吳芯慈：……經濟系的人也會還債。')&&!L.some(t=>t.includes('永遠在講統計'))&&G.flags.XUN_REPAID,JSON.stringify(L));
    const L2=await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T});
    check('4. 還債那天也是第一次去：先 1-1（品妤「重修生？…」，最後一句 AA_305 第 9 節「……你講話還是一樣，不留情。」）再還債三句',L2.indexOf('品妤：重修生？你看起來很有覺悟。')>0&&L2.indexOf('阿勳：（把一個便當推過來）昨天那題的。還債。')>L2.indexOf('品妤：……你講話還是一樣，不留情。')&&G.flags.SK03_FIRST,JSON.stringify(L2));
    const L3=await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true,ECON_LAW_BRIDGE:true});
    check('4. 芯慈已經加入（1-3 之後）：照樣還債三句；芯慈「……經濟系的人也會還債。」AA_209 附錄A §2 刪掉',L3.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&!L3.some(t=>t.includes('也會還債')),JSON.stringify(L3));
    const lunchH=async(day,flags,n)=>{ fresh(day,12.17,'putong',Object.assign({introDone:true,classDone:true,afternoonDone:true,P4D_ANSWER:'retake',ECON_HALLWAY_DAY:F2,MET_XUN:true,MET_PINYU:true},flags)); G.habits={'meal:xiaofu:fri':{n,first:day-7*n,last:day-7,days:Array.from({length:n},(_,i)=>day-7*(i+1))}}; picks=['一起去']; said=[]; opts=[]; await CLS.afterClassEvent(GM,{c:{id:'econ_principles_2'}}); return lines(); };
    const L4=await lunchH(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true},2), br4=!!G.flags.ECON_LAW_BRIDGE, rp4=!!G.flags.XUN_REPAID;
    const L4b=await lunchH(F12,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true,XUN_REPAID:true},3);
    check('4. 撞到 1-3（去過兩次以上）：還債優先、芯慈那一幕留到下一個週五',!L4.some(t=>t.includes('芯慈端著餐盤'))&&rp4&&!br4&&L4b.some(t=>t.includes('芯慈端著餐盤'))&&G.flags.ECON_LAW_BRIDGE,JSON.stringify([L4,L4b]));
    await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true},'今天不行'); G.hour=12.7; STORY.phoneRules(GM); PHONE.tick(G); const ph=G.msgs.filter(m=>m.th==='g:econ_friends'&&m.from==='econ_zhengxun').map(m=>m.text);
    check('4. 第 11 週沒去午餐：12:40「走啦」群組便當照片＋「欠你的，下週。」',JSON.stringify(ph)==='["📷（一個便當）","欠你的，下週。"]',JSON.stringify(ph));
    const L5=await lunch(F12,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true});
    check('4. 下一個去的週五照樣推過來（只一次）、沒有走廊那句；延後一週改一個詞「上週那題的。還債。」（AA-B）',L5.includes('阿勳：（把一個便當推過來）上週那題的。還債。')&&!L5.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&!L5.includes('阿勳：昨天那題我想通了。')&&G.flags.XUN_REPAID,JSON.stringify(L5));
    const L6=await lunch(termDay('Y1S2',13,5),{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true,XUN_REPAID:true,SK03_N:0});
    check('4. 還過了：之後是平常的週五',!L6.some(t=>t.includes('還債'))&&L6.some(t=>t.includes('永遠在講統計')),JSON.stringify(L6)); }
  /* 4b. 只在 10-3 見過阿勳（沒有 P4d）：第 11 週週五開 SK03（AA-B 2026-10-16） */
  { const only=async(day,flags,pick)=>{ fresh(day,12.17,'putong',Object.assign({introDone:true,classDone:true,afternoonDone:true,MET_XUN:true,XUN_DAY:W11T},flags)); picks=[pick||'一起去']; said=[]; opts=[]; await CLS.afterClassEvent(GM,{c:{id:'econ_principles_2'}}); return lines(); };
    const before=await only(W11T,{}), L=await only(F11,{XUN_NIGHT:true});
    check('4b. 10-3 那天（週四）不問；第 11 週週五：「昨天那題我想通了。」→ 邀約照用 P4d 原句「週五中午，我們在學活。你要來就來。」',!before.length&&L[0]==='阿勳：昨天那題我想通了。'&&L[1]==='阿勳：週五中午，我們在學活。你要來就來。',JSON.stringify(L));
    check('4b. 去了：1-1 品妤沒見過先「曾品妤。經濟系，可昕以前的室友。」、記 MET_PINYU，再接還債三句',L.indexOf('品妤：曾品妤。經濟系，可昕以前的室友。')>0&&L.indexOf('品妤：曾品妤。經濟系，可昕以前的室友。')<L.indexOf('品妤：重修生？你看起來很有覺悟。')&&L.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&G.flags.MET_PINYU,JSON.stringify(L));
    const L2=await only(F12,{XUN_NIGHT:true,SK03_INV1:true,SK03_FIRST:true,MET_PINYU:true,XUN_REPAID:true,SK03_N:0});
    check('4b. 之後的週五照一般邀約「學活。走不走？」',L2[0]==='阿勳：學活。走不走？',JSON.stringify(L2));
    await only(F11,{XUN_NIGHT:true},'今天不行'); G.hour=12.7; STORY.phoneRules(GM); PHONE.tick(G);
    check('4b. 沒去：便當照片照發',G.msgs.some(m=>m.th==='g:econ_friends'&&m.text==='欠你的，下週。')); }
  /* 5. 1-4 芯慈在重修教室（上課前） */
  { const e4=ev('ev_sk03_xinci_class'); check('5. ev_sk03_xinci_class：beforeClass econ_principles_2、週五、大一下',!!e4&&e4.beforeClass==='econ_principles_2');
    const before=async(day,flags)=>{ fresh(day,9.05,'putong',Object.assign({P4D_ANSWER:'retake',ECON_HALLWAY_DAY:F2,MET_XUN:true},flags)); said=[]; await CLS.beforeClassEvent(GM,{c:{id:'econ_principles_2'}}); return lines(); };
    const a=await before(F3,{}), b=await before(F8,{}), brB=G.flags.ECON_LAW_BRIDGE===true, c=await before(F8,{ECON_PAST_SHARED:'full'}), d=await before(F9,{}), e=await before(F8,{ECON_LAW_BRIDGE:true}), f=await before(F8,{P4D_ANSWER:null});
    check('5. 第 8 週之前沒有；第 8 週（期中考）先「考卷還沒發。」再芯慈四句（「他說你還欠他一場保齡球。」AA_305 第 9 節）、記 ECON_LAW_BRIDGE',!a.length&&b[0]==='考卷還沒發。'&&b.includes('吳芯慈：盧正勳。他說你還欠他一場保齡球。')&&b.includes('吳芯慈：你沒說過。……沒關係，不用說。')&&b[b.length-1]==='吳芯慈：你們週五都在學活吃？那我下次可以一起嗎？'&&brB,JSON.stringify([a,b]));
    check('5. full＝「原來你們以前住同一間。」（AA_209）；第 9 週（延到下一個有去的週五）沒有「考卷還沒發。」；已經有 ECON_LAW_BRIDGE、沒有 P4d＝沒有',c.includes('吳芯慈：原來你們以前住同一間。')&&d.length&&d[0]!=='考卷還沒發。'&&!e.length&&!f.length,JSON.stringify([c,d,e,f])); }
  /* 6. SK05 三閃，販賣機見（大一版） */
  { const D17=termDay('Y1S2',16,2)   /* SK05 三閃改第 16 週（AA_198 第 5 節）*/, XM=()=>G.msgs.filter(m=>m.th==='p:econ_zhengxun');
    const night=(zone,hour,flags)=>{ fresh(D17,hour,zone,flags); STORY.phoneRules(GM); G.hour=Math.max(hour,23)+0.05; PHONE.tick(G); STORY.phoneRules(GM); return XM(); };
    const a=night('linze',22.95,{MET_XUN:true});
    check('6. 期末考週、22:57 在霖澤館：23:00 阿勳說暗號（五則，最後一則三個回覆）',JSON.stringify(a.map(m=>m.text))==='["你們那邊燈還亮著。","我在社科院四樓，窗邊。看對面。","（對面的窗，燈閃了一下。）","一閃是還活著。兩閃是救我。","三閃是販賣機見。"]'&&a[2].who===null&&JSON.stringify(a[4].ask.opts.map(o=>o.t))==='["（閃三下）","（閃一下）","還活著。"]',JSON.stringify(a.map(m=>m.text)));
    const b=night('campus',22.95,{MET_XUN:true}), c=night('linze',23.6,{MET_XUN:true}), d=night('linze',23.2,{}), e=night('linze',22.95,{MET_XUN:true,XUN_PACT:true,XUN_NIGHT:true});
    check('6. 不在霖澤館、23:30 以後才進去＝沒有；23:12 才走進去＝一進去就亮；沒見過的先「我是盧正勳。…」',!b.length&&!c.length&&d.length&&d[0].text==='盧正勳。你經濟系那年的室友。……你該不會連我都忘了。',JSON.stringify([b.length,c.length,d.map(m=>m.text)]));
    check('6. pact＋night：「（對面的窗又閃了三下。）」「我先閃了。」「這次不用等你了。」接在暗號後面，回覆在最後一則',JSON.stringify(e.slice(5).map(m=>m.text))==='["（對面的窗又閃了三下。）","我先閃了。","這次不用等你了。"]'&&e[7].ask&&!e[4].ask,JSON.stringify(e.map(m=>m.text)));
    fresh(D17,22.95,'linze',{MET_XUN:true}); STORY.phoneRules(GM); G.hour=23.05; PHONE.tick(G); let q=XM().find(m=>m.ask); PHONE.answer(G,q.ask.id,0);
    G.hour=23.1; G.zone='campus'; const en=STORY.schedEnt(CHARACTERS.econ_zhengxun,G); const r1=XM().map(m=>m.text);
    check('6. 閃三下：「……真的？好，五分鐘。」、SK05_GO＝今天、阿勳在法學院廣場的販賣機前',r1.includes('……真的？好，五分鐘。')&&G.flags.SK05_GO===D17&&en&&en.zone==='campus'&&en.label==='法學院廣場的販賣機前',JSON.stringify(en));
    const v=ev('ev_sk05_vending_y1'); said=[]; await EVENTS.run(v); const L=lines();
    check('6. 走到販賣機前（npcNear）：五分鐘的台詞、記 SK05_Y1',!!v&&v.npcNear==='econ_zhengxun'&&L[0]==='阿勳：法律系考試考什麼？'&&L.includes('他按了兩罐一樣的飲料，丟一罐給你。')&&L[L.length-1]==='阿勳：明年也閃三下。'&&G.flags.SK05_Y1,JSON.stringify(L));
    fresh(D17,22.95,'linze',{MET_XUN:true}); STORY.phoneRules(GM); G.hour=23.05; PHONE.tick(G); q=XM().find(m=>m.ask); PHONE.answer(G,q.ask.id,0); G.hour=23.8; STORY.phoneRules(GM); PHONE.tick(G);
    check('6. 閃了三下沒去：23:45「……你閃了三下又不來。」「明年再說。」',JSON.stringify(XM().slice(-2).map(m=>m.text))==='["……你閃了三下又不來。","明年再說。"]');
    fresh(D17,22.95,'linze',{MET_XUN:true}); STORY.phoneRules(GM); G.hour=23.05; PHONE.tick(G); q=XM().find(m=>m.ask); PHONE.answer(G,q.ask.id,2); G.hour=23.1; G.zone='campus'; const en2=STORY.schedEnt(CHARACTERS.econ_zhengxun,G);
    check('6. 只回「還活著。」：「用閃的比較快。……好啦，加油。」、不在販賣機前',XM().some(m=>m.text==='用閃的比較快。……好啦，加油。')&&!(en2&&en2.zone),JSON.stringify(en2));
    fresh(termDay('Y1S2',18,3),23.0,'linze',{MET_XUN:true}); PHONE.at(G,D17,23,[{th:'p:econ_zhengxun',from:'econ_zhengxun',text:'x'}],'sk05_y1'); STORY.phoneRules(GM); G.hour=23.1; PHONE.tick(G);
    check('6. 一年一次：已經說過就不再說',XM().filter(m=>m.text==='你們那邊燈還亮著。').length===0); }
  /* 7. 9-9 大一下＋P4e＋暑假第一天（AA_157 第 2 節、BB_139 第 2 節、BB_135 第 3 節） */
  { const last=STORY.dayOfKey('2026-06-12'), sum1=STORY.dayOfKey('2026-06-29'),   /* AA_209／AA_198 第 5 節（AA-B 02:28）：約定 6/12、P4e 和一起看 6/29 */ KM=()=>G.msgs.filter(m=>m.th==='p:kexin').map(m=>m.text), SM=()=>G.msgs.filter(m=>m.th==='sys');
    check('7. 日期：約定 6/12（五，期末最後一天）、成績公布 6/29（一）',CALENDAR.dateOf(last).key==='2026-06-12'&&CALENDAR.dateOf(sum1).key==='2026-06-29',CALENDAR.dateOf(last).key+' '+CALENDAR.dateOf(sum1).key);
    const s99=(flags)=>{ fresh(last,20,'dorm',Object.assign({dating_kexin:true},flags)); STORY.phoneRules(GM); G.hour=21.05; PHONE.tick(G); return KM(); };
    const a=s99({}), a2=G.flags.KX_GRADES_Y1S2, b=s99({KX_GRADES_PACT:'peeked'}), b2=G.flags.KX_GRADES_Y1S2, c=s99({KX_GRADES_PACT:'kept'});
    check('7. 9-9：舊存檔／kept＝「這次也一起打開。成績出來那天。」（AA_313 第 2 節第 29 列：句號）together；peeked＝「這次換個方式：…」best_one',a.slice(-1)[0]==='這次也一起打開。成績出來那天。'&&a2==='together'&&b.slice(-1)[0]==='這次換個方式：各自先看，然後各說一科最滿意的。'&&b2==='best_one'&&c.slice(-1)[0]==='這次也一起打開。成績出來那天。',JSON.stringify([a,b]));
    const p4e=(att,flags,pick)=>{ fresh(sum1,9.9,'dorm',flags); CLS.rec(G).attend.econ_principles_2=att; STORY.phoneRules(GM); G.hour=10.05; PHONE.tick(G); const sys=SM(); const q=sys.find(m=>m.ask); if(q&&pick!=null) PHONE.answer(G,q.ask.id,pick); return {sys:SM().map(m=>m.text),xc:G.msgs.filter(m=>m.th==='p:classmate_xinci').map(m=>(m.from==='player'?'我：':'')+m.text),k:KM(),q}; };
    const r1=p4e(8,{}), r2=p4e(3,{});
    check('7. P4e 6/29 10:00：去了 6 堂以上＝「一年前沒拿到的，這次拿到了。」；單身＝「你把成績單收進抽屜。」',JSON.stringify(r1.sys)==='["經濟學原理（下）的成績公布了。","一年前沒拿到的，這次拿到了。","你把成績單收進抽屜。"]'&&!r1.q,JSON.stringify(r1.sys));
    check('7. P4e 5 堂以下：芯慈「過了吧？……」→ 我「請妳吃飯。」→「兩次。」＋「……靠一本借來的筆記拿到了。」',JSON.stringify(r2.xc)==='["過了吧？……我的筆記功不可沒。","我：請妳吃飯。","兩次。"]'&&r2.sys.includes('一年前沒拿到的，這次靠一本借來的筆記拿到了。'),JSON.stringify(r2));
    const r3=p4e(8,{dating_kexin:true,KX_GRADES_Y1S2:'together'},0), r4=p4e(8,{dating_kexin:true,KX_GRADES_PACT:'peeked',KX_GRADES_Y1S2:'best_one'},0), r5=p4e(8,{dating_kexin:true,KX_GRADES_Y1S2:'together'},1);
    check('7. P4e 交往中傳給可昕：長頸鹿貼圖＋together「這一科可以先說。…」／best_one「這科就是你最滿意的那一科吧。」；不傳＝「你把成績單收進抽屜。」',JSON.stringify(r3.k.slice(-3))==='["📷（經濟學原理（下）的成績）","（貼圖：長頸鹿）","這一科可以先說。其他的，等全部出來再一起開。"]'&&r4.k.slice(-1)[0]==='這科就是你最滿意的那一科吧。'&&r5.sys.slice(-1)[0]==='你把成績單收進抽屜。'&&!r5.k.some(t=>t.startsWith('📷')),JSON.stringify([r3.k,r4.k,r5.sys]));
    const BO=['說好的，各說一科。我先：憲法。老師說我的答案像在寫信。','換你。'], bo=(flags)=>{ fresh(sum1,20.9,'dorm',Object.assign({dating_kexin:true,KX_GRADES_Y1S2:'best_one'},flags)); STORY.phoneRules(GM); G.hour=21.05; PHONE.tick(G); return G.msgs.filter(m=>m.th==='p:kexin'&&BO.includes(m.text)); };
    const m1=bo({}); const q=m1.find(m=>m.ask), ko=q?q.ask.opts.map(o=>o.t):[];
    check('7. best_one 6/29 21:00：「說好的，各說一科。我先：憲法。…」「換你。」、選這學期的一科（短名）',m1.length===2&&m1[0].text==='說好的，各說一科。我先：憲法。老師說我的答案像在寫信。'&&ko.includes('經濟學原理')&&ko.includes('刑法總則')&&!ko.some(t=>t.includes('（')),JSON.stringify(ko));
    PHONE.answer(G,q.ask.id,ko.indexOf('經濟學原理')); const e1=KM().slice(-1)[0]; bo({}); const q2=G.msgs.find(m=>m.ask&&m.th==='p:kexin'&&m.text==='換你。'); PHONE.answer(G,q2.ask.id,ko.indexOf('刑法總則')); const e2=KM().slice(-1)[0];
    check('7. 選經原＝「經原？……那一科，我們以前坐在同一間教室。……恭喜。」（AA_313 第 2 節第 31 列）；其他＝「「刑法總則」。好，我記下來了。……明年再各說一科。」（AA_373 第 6-1 節：不比）',e1==='經原？……那一科，我們以前坐在同一間教室。……恭喜。'&&e2==='「刑法總則」。好，我記下來了。……明年再各說一科。',JSON.stringify([e1,e2]));
    check('7. P4e 已經傳給她的 best_one：6/29 不問',bo({KX_P4E:'sent'}).length===0);
    fresh(sum1,8,'dorm',{dating_kexin:true,KX_GRADES_Y1S2:'together'}); picks=['等到晚上']; let held=await STORY.holdGrades(GM,'Y1S2'); const plan=(G.outings||[]).find(o=>o.id==='kx_grades2');
    fresh(sum1,8,'dorm',{dating_kexin:true,KX_GRADES_Y1S2:'best_one'}); const held2=await STORY.holdGrades(GM,'Y1S2');
    const ev2=ev('ev_kexin_grades_open_y1s2');
    check('7. together 暑假第一天早上：「大一下的成績出來了。」先看／等到晚上、21:00 視訊（「……都過了。好，這下暑假真的開始了。」）；best_one 照常發',held===true&&!!plan&&plan.h===21&&held2===false&&!!ev2&&ev2.dialogue.some(l=>l.text==='……都過了。好，這下暑假真的開始了。'),JSON.stringify([held,plan,held2])); }
  /* 8. 坐在 3D 座位上課（inScene）也演課前／課後事件（AA-B 2026-10-16 回報：原本只有門口上課才演） */
  { const seat=async(day,hour,flags)=>{ fresh(day,hour,'putong',Object.assign({introDone:true,classDone:true,afternoonDone:true},flags)); said=[]; opts=[]; caps=[]; picks=['今天不行']; if(flags.P4D_ANSWER) G.events.done.ev_econ_hallway=1; const it=CLS.dayItems(G).find(x=>x.c.id==='econ_principles_2'); if(!it) return null; await CLS.attend(GM,it,{inScene:true}); return lines(); };
    const F3=termDay('Y1S2',3,5), F8=termDay('Y1S2',8,5);
    const a=await seat(F3,9.05,{P4D_ANSWER:'retake',ECON_HALLWAY_DAY:termDay('Y1S2',2,5),MET_XUN:true,MET_PINYU:true});
    check('9. 坐在普通 101 的座位上「上課：經原（下）」：下課後照樣演 SK03（「學活。走不走？」）',!!a&&a.includes('阿勳：學活。走不走？'),JSON.stringify(a&&a.slice(-4)));
    const b=await seat(F8,9.05,{P4D_ANSWER:'retake',ECON_HALLWAY_DAY:termDay('Y1S2',2,5),MET_XUN:true});
    check('9. 坐著上第 8 週（期中考）：考卷發下來之前先演 1-4「考卷還沒發。」芯慈那段（課前事件）',!!b&&b[0]==='考卷還沒發。'&&b.includes('吳芯慈：你們週五都在學活吃？那我下次可以一起嗎？'),JSON.stringify(b&&b.slice(0,3))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
