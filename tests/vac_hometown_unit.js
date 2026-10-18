// AA_276 第 1 節（AA-C a5d17b91；使用者 23:4x）：寒暑假可昕回高雄、沛珊回台中——放假第一天起到開學前 2 天在老家；偶遇、作息、當面約都不在臺北，手機照常、「在老家」標籤；出國、外縣市旅行照樣約得到；經濟系那年不算。改版前會失敗。用法：node tests/vac_hometown_unit.js
// （載入照 LIFE-LINE 第 6 組）
// 2/15 起在祐廷家的餐桌讀書（kxFreeAt 拿掉、她 10:00 到；R1 開頭「她第一次來你家」；S1、S2 改字）、RP 從 2/15；6/8 衝刺班的私訊＋6/9～7/9 一三五 19～22 點（「這次不去」、第一次三句旁白、
// 那幾晚可昕的訊息改到 22:10）；E35 在他家樓下（睡著 21:00 醒來）；E36 早上三句旁白（0.1）、晚上「只高 0.1。」「上了就是上了。」。改版前會失敗。用法：node tests/lifeline_g6_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(HOMETOWN_LINES|HV|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM|MSG|MSG_POOL|MSG2_POOL|VAC|VAC_DATA)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/home3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/vac_activities.js','src/vac3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const law=(k,h,flags)=>{ fresh(DK(k),h||12,'campus',Object.assign({},flags||{})); G.stage='law'; return G; };
  const pr=(id,k,stage)=>{ const g=law(k); if(stage) g.stage=stage; return STORY.presence(id,g); };
  // 1. 期間：法律系大一寒假 2025-12-22（放假第一天＝期末考最後一天 12/19 的第 3 天）～2026-02-20；開學 2/23 前 2 天（2/21）回臺北
  check('1. 12/21（放假前一天）可昕在臺北',pr('kexin','2025-12-21').here===true);
  const a=pr('kexin','2025-12-22'); check('1. 12/22 放假第一天：可昕在高雄（kind home）',a.here===false&&a.kind==='home'&&a.home==='高雄',J(a));
  check('1. 2/20 還在高雄、2/21（開學前 2 天）回臺北',pr('kexin','2026-02-20').kind==='home'&&pr('kexin','2026-02-21').here===true);
  check('1. 暑假 2026-07-10：可昕在高雄；沛珊在台中',pr('kexin','2026-07-10').home==='高雄'&&pr('classmate_peishan','2026-07-10').home==='台中');
  // 1 例外（AA_276 第 1 節、13c583c9）：已經排在臺北的活動照常，結束隔天才回老家——沛珊大一暑假 C02 營隊隊輔 7/1～7/5，7/6 才回台中；可昕照舊放假第一天就回高雄
  { const b=pr('classmate_peishan','2026-06-20'), c=pr('classmate_peishan','2026-07-05'), d=pr('classmate_peishan','2026-07-06');
    check('1 例外. 沛珊 6/20、7/5 還在臺北（C02 營隊），7/6 回台中',b.kind!=='home'&&c.kind!=='home'&&d.kind==='home'&&d.home==='台中',J([b.kind,c.kind,d.kind]));
    check('1 例外. 只限那個暑假：寒假 2025-12-22 沛珊照舊在台中；可昕 6/20 在高雄',pr('classmate_peishan','2025-12-22').kind==='home'&&pr('kexin','2026-06-20').kind==='home'); }
  check('1. 學期中 2026-03-10：都在臺北',pr('kexin','2026-03-10').here===true&&pr('classmate_peishan','2026-03-10').here===true);
  check('1. 經濟系那年的寒假（2025-01-20）不算（照 AA_272）',pr('kexin','2025-01-20','econ').here===true&&STORY.homeAway({day:DK('2025-01-20')})===false);
  check('1. 其他人不受影響：以安 2026-07-10 照舊',pr('heroine_01','2026-07-10').kind!=='home');
  // 2. 作息：放假在臺北不會出現
  { const g=law('2026-07-10',15); const e=STORY.schedEnt?STORY.schedEnt(CHARACTERS.kexin,g):null; check('2. 暑假的作息：可昕不在臺北的任何區域（schedEnt 沒有 zone）',!e||!e.zone,J(e)); }
  // 3. 手機：「在老家」標籤
  { const g=law('2026-07-10',21); check('3. 手機標籤「在老家」：放假中成立、學期中不成立',MSG.tok(g,'kexin','在老家')===true&&(law('2026-03-10',21),MSG.tok(G,'kexin','在老家')===false)); }
  // 4. 當面約臺北的地點：不答應，原因寫回高雄
  { const g=law('2026-07-10',12); const why=INV.why?INV.why(g,'kexin',{why:'away'}):null; const pid=(INVITE_DATA.places||[]).map(p=>p.id||p)[0]; const d=INV.decide(g,'kexin',pid,g.day+1,15), m=INV.declineText?null:null;
    check('4. 暑假約可昕在臺北：不答應，原因是不在（away）；學期中不是因為 away',d.res==='decline'&&d.why==='away'&&(law('2026-03-10',12),INV.decide(G,'kexin',pid,G.day+1,15).why!=='away'),J([pid,d])); }
  // 5. 出國：女朋友在老家照樣約得出國（VAC.gfCan 不因為在老家說不行）
  { const g=law('2026-07-01',12,{dating_kexin:true}); const r=VAC.gfCan?VAC.gfCan(g,'kexin','jp',g.day+10,g.day+14):'skip';
    check('5. 暑假約在高雄的女朋友出國：不會因為「不在臺北」直接說不行',r!=='no',J(r)); }
  // 6. 沛珊重考消失期（2026-12-18～2027-08-06）：交往中的玩家是例外（AA_276 第 4 節、13c583c9；使用者 23:5x）
  { const ps='classmate_peishan', D0=DK('2026-12-18');
    const g1=law('2027-03-01',15); R(ps,30,20,20); G.contacts[ps]=D0-100; const a=STORY.presence(ps,g1);
    check('6. 沒交往：聯絡不到（unreachable）、群組也不在（psGone）、訊息只顯示已送達（silent）',a.kind==='unreachable'&&STORY.psGone(g1)&&MSG.open(g1,ps).mode==='silent',J([a.kind,MSG.open(g1,ps)]));
    const g2=law('2027-03-01',15,{dating_classmate_peishan:true}); g2.flags.romance={[ps]:{status:'dating',sinceDay:D0-30}}; R(ps,30,20,20); G.contacts[ps]=D0-100; const b=STORY.presence(ps,g2);
    check('6. 12/18 以前開始交往、還在交往：她在台中老家（kind home、keep）',b.here===false&&b.kind==='home'&&b.keep===true&&b.home==='台中',J(b));
    check('6. 例外時群組、其他人照樣聯絡不到（psGone 仍成立）；她的私訊不是 silent',STORY.psGone(g2)&&MSG.open(g2,ps).mode!=='silent',J(MSG.open(g2,ps)));
    G.hour=8; STORY.phoneRules(GM); G.hour=23.9; PHONE.tick(G); const m1=txt('p:'+ps);
    G.day++; G.hour=8; STORY.phoneRules(GM); G.hour=23.9; PHONE.tick(G); const m2=txt('p:'+ps);
    check('6. 每晚 23:00 以後一則，輪流（第一晚「兩回考古題」、第二晚「一大鍋湯」）',m1.length===1&&/兩回考古題/.test(m1[0])&&m2.length===2&&/一大鍋湯/.test(m2[1])&&G.flags.PS_KEPT===true,J(m2));
    const g3=law('2027-03-01',15,{dating_classmate_peishan:true}); g3.flags.romance={[ps]:{status:'dating',sinceDay:D0+5}};
    check('6. 消失期開始以後才交往：照原規則聯絡不到',STORY.presence(ps,g3).kind==='unreachable');
    check('6. 放榜那天（8/6）起照舊在臺北的規則（不是 keep）',!STORY.presence(ps,law('2027-08-06',15,{dating_classmate_peishan:true})).keep); }
  // 7. 去她的縣市（AA_276 第 1-1、5 節）：手機約她多一個「我去高雄找妳？」→ 選日子 → 她答應 → 排一趟高鐵當天來回 → 那一天演 first，之後輪流 again
  { const said0=()=>said.map(x=>x.t);
    law('2026-07-10',20); R('kexin',40,30,30); G.contacts.kexin=G.day-200;
    check('7. 暑假可昕在高雄：手機可以約（whyNot 空白、canInvite），清單有「我去高雄找妳？」',INV.whyNot(G,'kexin')===''&&INV.canInvite(G,'kexin')&&HV.offer(G,'kexin').ok===true,J([INV.whyNot(G,'kexin'),HV.offer(G,'kexin')]));
    picks=['我去高雄找妳？',0]; const d=await INV.flow(GM,'kexin',null,false); const q=OUT.rec(G).find(x=>x.hv&&x.hv.id==='kexin');
    check('7. 約：玩家「我去高雄找妳？」、她「真的？……那我去車站接你。」、排明天高鐵當天來回',d===G.day+1&&said0().includes('我去高雄找妳？')&&said0().includes('真的？……那我去車站接你。來之前先跟我說幾點的車。')&&!!q&&q.ev==='ev_hv_kx'&&q.travelH===1.5&&q.h===10.5,J([d,said0().slice(-3),q&&q.ev]));
    check('7. 約好以後清單那一項變成不能選（已經約好了）',HV.offer(G,'kexin').ok===false);
    said=[]; G.day=q.day; G.hour=10.5; const mo=GM.money, paid=[]; GM.money=(d,w)=>{ paid.push([d,w]); G.money+=d; }; await HV.play(GM,q); GM.money=mo; q.state='done';
    check('7. 第一次：車站接人 → 高雄・港邊 → 傍晚送上車（沒交往：「路上小心。到了傳一下。」）',said0().includes('你真的來了。')&&said0().includes('現在也是。高鐵一個半小時，還是很遠。')&&said0().includes('路上小心。到了傳一下。')&&!said0().some(t=>/開學我就上去了/.test(t))&&G.hour>=17,J(said0()));
    check('7. 高鐵來回 2980 元：出發那天扣（AA_276 第 7 節第 2 點）',paid.length===1&&paid[0][0]===-2980,J(paid));
    { const m0=G.money; G.money=2000; const o=HV.offer(G,'kexin'); check('7. 錢不夠：那一項不能選，提示「高鐵票錢不夠」',o&&o.ok===false&&/高鐵票錢不夠/.test(o.why),J(o)); G.money=m0; }
    { const q9={hv:{id:'kexin'}}; said=[]; G.flags.HV_N.kexin=1; await HV.play(GM,q9);
      check('7. 第二次以後的接人換句「這次換這頂安全帽了。……上車。」、不說「你真的來了。」（第 7 節第 1 點）',said0().includes('這次換這頂安全帽了。……上車。')&&!said0().includes('你真的來了。'),J(said0().slice(0,3))); }
    check('7. 再去輪流：第二次夜市、第三次下雨、第四次河邊、第五次回到夜市',['night','rain','river','night'].every((v,i)=>{ G.flags.HV_N.kexin=1+i; return HV.pickVariant(G,'kexin',false)===v; })); G.flags.HV_N.kexin=1;
    law('2026-07-10',20,{dating_kexin:true}); R('kexin',40,30,30); G.contacts.kexin=G.day-200; picks=['我去高雄找妳？',0]; await INV.flow(GM,'kexin',null,false);
    check('7. 交往中答應：「你要來？……好。幾點的車，我去接你。」',said0().includes('你要來？……好。幾點的車，我去接你。'),J(said0().slice(-2)));
    const q2=OUT.rec(G).find(x=>x.hv&&x.hv.id==='kexin'); said=[]; G.flags.HV_N={kexin:3}; G.day=q2.day; G.hour=10.5; await HV.play(GM,q2);
    check('7. 交往中第四次（河邊）：多一句「……下次住一晚啦。」；送上車是「開學我就上去了。」',said0().includes('……下次住一晚啦。')&&said0().includes('開學我就上去了。……到時候換你來接我。'),J(said0()));
    law('2026-07-10',20); R('classmate_peishan',40,30,30); G.contacts.classmate_peishan=G.day-200; G.flags.dating_classmate_peishan=true;
    picks=['我去台中找妳？',0]; await INV.flow(GM,'classmate_peishan',null,false); const q3=OUT.rec(G).find(x=>x.hv&&x.hv.id==='classmate_peishan');
    said=[]; opts=[]; picks=['常笑']; G.day=q3.day; G.hour=10.5; await HV.play(GM,q3); const o3=opts[opts.length-1]||[];
    check('7. 沛珊第一次（交往中）：「{name}！這裡這裡！」換成名字、三個選項（多「妳在這裡比較常笑。」）、送上車「下次換我上去找你。」',said0().includes((G.name||'祐廷')+'！這裡這裡！')&&o3.length===3&&said0().includes('……你不要突然講這種話啦。')&&said0().includes('下次換我上去找你。……這樣比較公平。'),J([o3,said0()]));
    // 7 例外：沛珊重考消失期、交往中（第 4、5-5 節）：下午三個小時、一個月一次
    const D0=DK('2026-12-18'); law('2027-03-03',20,{dating_classmate_peishan:true}); G.flags.romance={classmate_peishan:{status:'dating',sinceDay:D0-30}}; R('classmate_peishan',40,30,30); G.contacts.classmate_peishan=D0-200;
    check('7 例外. 消失期交往中：可以約「我去台中找妳？」',INV.whyNot(G,'classmate_peishan')===''&&HV.offer(G,'classmate_peishan').ok===true,J([INV.whyNot(G,'classmate_peishan'),HV.offer(G,'classmate_peishan')]));
    picks=['我去台中找妳？',0]; await INV.flow(GM,'classmate_peishan',null,false); const q4=OUT.rec(G).find(x=>x.hv&&x.hv.id==='classmate_peishan');
    check('7 例外. 她答應「好。……一個下午就好，我晚上還要念。」、14:00 到',said0().includes('好。……一個下午就好，我晚上還要念。')&&q4&&q4.h===14&&q4.hv.keep===true,J(q4));
    said=[]; G.day=q4.day; G.hour=14; await HV.play(GM,q4); q4.state='done';
    check('7 例外. 那一天演 5-5（螢光筆、公園兩圈、「回去的路上不要傳訊息給我，我會想回。」），不演 5-3',said0().includes('我只能出來三個小時。')&&said0().includes('回去的路上不要傳訊息給我，我會想回。')&&!said0().some(t=>/這裡這裡/.test(t)),J(said0()));
    const o5=HV.offer(G,'classmate_peishan'); check('7 例外. 同一個月不能再約（她說一個月一次）',o5&&o5.ok===false&&/一個月一次/.test(o5.why),J(o5));
    law('2027-03-03',20); R('classmate_peishan',40,30,30); G.contacts.classmate_peishan=D0-200;
    check('7 例外. 沒交往：清單沒有這一項、手機照樣約不到（沒有回覆）',HV.offer(G,'classmate_peishan')===null&&/沒有回覆/.test(INV.whyNot(G,'classmate_peishan'))); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
