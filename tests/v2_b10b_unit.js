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
  { const a=at(F3,12.15), b=at(F3,12.15,{MET_XUN:true}), c=at(F3,12.5,{MET_XUN:true}), d=at(W11T,20.9), e=at(W10T,19.5), f=at(W10T,19.5,{MET_XUN:true}), g=at(termDay('Y1S2',17,2),22), y4=at(termDay('Y1S2',3,5),12.15,{MET_XUN:true});
    check('1. 阿勳：P4d 之前（沒有 MET_XUN）週五 12:15 不在走廊；之後在普通教學館走廊；12:30「在小福吃午餐」',!(a&&a.zone)&&b&&b.zone==='putong'&&b.act==='linger'&&c&&c.zone===null&&c.away==='在小福吃午餐',JSON.stringify([a&&a.zone,b&&b.zone,c&&c.away]));
    check('1. 阿勳：第 11 週週四 20:54 共同教學館自習區（沒見過也在）；第 10 週週四 19:30 要 MET_XUN',d&&d.zone==='gongtong'&&d.room==='study'&&!(e&&e.zone)&&f&&f.zone==='gongtong',JSON.stringify([d,e&&e.zone,f&&f.zone]));
    check('1. 阿勳：期末考週 22:00「在社科院四樓的窗邊讀書」',g&&g.zone===null&&g.away==='在社科院四樓的窗邊讀書',JSON.stringify(g));
    const lab=termDay('Y1S2',10,5); fresh(lab,12.15,'campus',{MET_XUN:true,MET_PINYU:true}); const hol=CALENDAR.holiday(lab);
    fresh(termDay('Y1S2',4,5),12.15,'campus',{MET_PINYU:true}); const p1=STORY.schedEnt(Pn,G); fresh(termDay('Y1S2',4,2),19,'campus',{}); const p2=STORY.schedEnt(Pn,G);
    check('1. 品妤：P4d 之後週五 12:15 在走廊（MET_PINYU）、週二 19:00「在補習班櫃台打工」',p1&&p1.zone==='putong'&&p2&&p2.away==='在補習班櫃台打工',JSON.stringify([p1&&p1.zone,p2&&p2.away]));
    let holOk=true; for(let d=termDay('Y1S2',1,1);d<=termDay('Y1S2',18,7);d++){ fresh(d,12.15,'campus',{MET_XUN:true}); if(CALENDAR.holiday(d)&&G.weekday===5){ const en=STORY.schedEnt(X,G); if(en&&en.zone) holOk=false; } }
    check('1. 國定假日的週五不在走廊（noHoliday）',holOk); }
  /* 2. 「走啦」群組 */
  { fresh(1,9,'dorm',{}); STORY.phoneRules(GM); const g=G.phone.groups.econ_friends, M=G.msgs.filter(m=>m.th==='g:econ_friends'), u=PHONE.unreadAll?PHONE.unreadAll(G):null;
    check('2. 第一天就有群組「走啦」，裡面只有 2025-08-13 那張照片（韋綸）',!!g&&g.name==='走啦'&&M.length===1&&M[0].text==='📷（公館的宵夜攤，六個人和準備收攤的老闆）'&&CALENDAR.dateOf(M[0].day).key==='2025-08-13',JSON.stringify([g,M]));
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
    check('4. 第 11 週週五：走廊「昨天那題我想通了。」→「小福。走不走？」→ 去了＝還債三句（不是平常的輪替句）、XUN_REPAID',L[0]==='阿勳：昨天那題我想通了。'&&L[1]==='阿勳：小福。走不走？'&&L.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&L.includes('品妤：他從來沒請過我。')&&L.includes('阿勳：妳又沒教過我統計。')&&!L.includes('吳芯慈：……經濟系的人也會還債。')&&!L.some(t=>t.includes('永遠在講統計'))&&G.flags.XUN_REPAID,JSON.stringify(L));
    const L2=await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T});
    check('4. 還債那天也是第一次去：先 1-1（品妤「重修生？…」）再還債三句',L2.indexOf('品妤：重修生？你看起來很有覺悟。')>0&&L2.indexOf('阿勳：（把一個便當推過來）昨天那題的。還債。')>L2.indexOf('品妤：……經濟系的冷笑話，還是你最多。')&&G.flags.SK03_FIRST,JSON.stringify(L2));
    const L3=await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true,ECON_LAW_BRIDGE:true});
    check('4. 芯慈已經加入（1-3 之後）：多一句「……經濟系的人也會還債。」',L3.includes('吳芯慈：……經濟系的人也會還債。'),JSON.stringify(L3));
    const lunchH=async(day,flags,n)=>{ fresh(day,12.17,'putong',Object.assign({introDone:true,classDone:true,afternoonDone:true,P4D_ANSWER:'retake',ECON_HALLWAY_DAY:F2,MET_XUN:true,MET_PINYU:true},flags)); G.habits={'meal:xiaofu:fri':{n,first:day-7*n,last:day-7,days:Array.from({length:n},(_,i)=>day-7*(i+1))}}; picks=['一起去']; said=[]; opts=[]; await CLS.afterClassEvent(GM,{c:{id:'econ_principles_2'}}); return lines(); };
    const L4=await lunchH(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true},2), br4=!!G.flags.ECON_LAW_BRIDGE, rp4=!!G.flags.XUN_REPAID;
    const L4b=await lunchH(F12,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true,XUN_REPAID:true},3);
    check('4. 撞到 1-3（去過兩次以上）：還債優先、芯慈那一幕留到下一個週五',!L4.some(t=>t.includes('芯慈端著餐盤'))&&rp4&&!br4&&L4b.some(t=>t.includes('芯慈端著餐盤'))&&G.flags.ECON_LAW_BRIDGE,JSON.stringify([L4,L4b]));
    await lunch(F11,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true},'今天不行'); G.hour=12.7; STORY.phoneRules(GM); PHONE.tick(G); const ph=G.msgs.filter(m=>m.th==='g:econ_friends'&&m.from==='econ_zhengxun').map(m=>m.text);
    check('4. 第 11 週沒去午餐：12:40「走啦」群組便當照片＋「欠你的，下週。」',JSON.stringify(ph)==='["📷（一個便當）","欠你的，下週。"]',JSON.stringify(ph));
    const L5=await lunch(F12,{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true});
    check('4. 下一個去的週五照樣推過來（只一次）、沒有走廊那句',L5.includes('阿勳：（把一個便當推過來）昨天那題的。還債。')&&!L5.includes('阿勳：昨天那題我想通了。')&&G.flags.XUN_REPAID,JSON.stringify(L5));
    const L6=await lunch(termDay('Y1S2',13,5),{XUN_NIGHT:true,XUN_DAY:W11T,SK03_FIRST:true,XUN_REPAID:true,SK03_N:0});
    check('4. 還過了：之後是平常的週五',!L6.some(t=>t.includes('還債'))&&L6.some(t=>t.includes('永遠在講統計')),JSON.stringify(L6)); }
  /* 5. 1-4 芯慈在重修教室（上課前） */
  { const e4=ev('ev_sk03_xinci_class'); check('5. ev_sk03_xinci_class：beforeClass econ_principles_2、週五、大一下',!!e4&&e4.beforeClass==='econ_principles_2');
    const before=async(day,flags)=>{ fresh(day,9.05,'putong',Object.assign({P4D_ANSWER:'retake',ECON_HALLWAY_DAY:F2,MET_XUN:true},flags)); said=[]; await CLS.beforeClassEvent(GM,{c:{id:'econ_principles_2'}}); return lines(); };
    const a=await before(F3,{}), b=await before(F8,{}), brB=G.flags.ECON_LAW_BRIDGE===true, c=await before(F8,{ECON_PAST_SHARED:'full'}), d=await before(F9,{}), e=await before(F8,{ECON_LAW_BRIDGE:true}), f=await before(F8,{P4D_ANSWER:null});
    check('5. 第 8 週之前沒有；第 8 週（期中考）先「考卷還沒發。」再芯慈四句、記 ECON_LAW_BRIDGE',!a.length&&b[0]==='考卷還沒發。'&&b.includes('吳芯慈：盧正勳。他說你以前每天講一個冷笑話。')&&b.includes('吳芯慈：你沒說過。……沒關係，不用說。')&&b[b.length-1]==='吳芯慈：下次週五，帶我去小福。'&&brB,JSON.stringify([a,b]));
    check('5. full＝「……原來是你室友。」；第 9 週（延到下一個有去的週五）沒有「考卷還沒發。」；已經有 ECON_LAW_BRIDGE、沒有 P4d＝沒有',c.includes('吳芯慈：……原來是你室友。')&&d.length&&d[0]!=='考卷還沒發。'&&!e.length&&!f.length,JSON.stringify([c,d,e,f])); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
