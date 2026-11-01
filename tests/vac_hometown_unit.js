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
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(Object.assign(o.map(q=>q.t||q.text),{all:[].concat(...o.map(q=>q.sub||[q.t||q.text]))})); const want=picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0&&!o[k].dim) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ return k<0?0:k; } return want||0; }};
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
    check('6. 每晚 23:00 以後一則（AA_460 第 2 節起照日子挑：3/1、3/2 是平常的晚上＝短句，兩晚不同句；排法另見 tests/aa460_y2s1_unit.js）',m1.length===1&&m1[0]===ps+':'+STORY.psKeepLine(G.day-1)&&STORY.PS_KEEP_SHORT.includes(STORY.psKeepLine(G.day-1))&&m2.length===2&&m2[1]===ps+':'+STORY.psKeepLine(G.day)&&m2[1]!==m2[0]&&G.flags.PS_KEPT===true,J(m2));
    { const g4=law('2027-03-02',15,{dating_classmate_peishan:true}); g4.flags.romance={[ps]:{status:'dating',sinceDay:D0-30}}; R(ps,30,20,20); G.contacts[ps]=D0-100;
      const tp=MSG.topics(G,ps).map(q=>q.k); const r=MSG.send(G,ps,'chat'); G.hour=22.9; PHONE.tick(G); const before=txt('p:'+ps); G.hour=23.6; PHONE.tick(G); const after=txt('p:'+ps);
      check('6-1. 消失期交往中：傳「在幹嘛」她 23:00 以後才回「在念地理。」；問課不開（AA_276 6-1）',!tp.includes('course')&&tp.includes('chat')&&r.ok&&!before.some(t=>/在念地理/.test(t))&&after.some(t=>t==='classmate_peishan:在念地理。'),J([tp,before,after])); }
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
    check('7. 交往中第四次（河邊）：多一句「……下次住一晚啦。」；送上車是「開學我就上去了。台北見。」（AA_525 3-8 K-10 改句）',said0().includes('……下次住一晚啦。')&&said0().includes('開學我就上去了。台北見。'),J(said0()));
    law('2026-07-10',20); R('classmate_peishan',40,30,30); G.contacts.classmate_peishan=G.day-200; G.flags.dating_classmate_peishan=true;
    picks=['我去台中找妳？',0]; await INV.flow(GM,'classmate_peishan',null,false); const q3=OUT.rec(G).find(x=>x.hv&&x.hv.id==='classmate_peishan');
    said=[]; opts=[]; picks=['常笑']; G.day=q3.day; G.hour=10.5; await HV.play(GM,q3); const o3=opts[opts.length-1]||[];
    check('7. 沛珊第一次（交往中，2026 暑假＝還沒考上台南）：「{name}！這裡這裡！」換成名字、三個選項（多「妳在這裡比較常笑。」）、送上車「下次來，我帶你去我國中走路上學那條路。」（AA-C 12:2x：她 2027-08-06 才考上台南；「下次換你來台南」是那天以後）',said0().includes((G.name||'祐廷')+'！這裡這裡！')&&o3.length===3&&said0().includes('……你不要突然講這種話啦。')&&said0().includes('下次來，我帶你去我國中走路上學那條路。')&&!said0().includes('下次換你來台南。……我帶你走。'),J([o3,said0()]));
    { const sd=HOMETOWN_LINES.classmate_peishan.send.dating, g0={day:STORY.dayOfKey('2027-08-05')}, g1={day:STORY.dayOfKey('2027-08-06')};
      check('7. 沛珊送行句照日子分兩句：2027-08-05「下次來，我帶你去我國中……」、2027-08-06 起「下次換你來台南。……我帶你走。」',typeof sd==='function'&&sd(g0)[0]==='下次來，我帶你去我國中走路上學那條路。'&&sd(g1)[0]==='下次換你來台南。……我帶你走。'); }
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
  // 8. VA-09 芯慈大二暑假在事務所（AA_256 第 1 節，71b184ba）：FAMILIAR 以上收到四則（一次一則、照順序）；回覆兩個；第 2、3 則多「要不要一起吃午餐？」→ 最近的平日 12:00
  { const xc='classmate_xinci', step=(k,h)=>{ G.day=DK(k); G.weekday=wdOf(G.day); G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); };
    law('2027-07-05',17); R(xc,30,20,20); SOCIAL.remember(xc,'FIRST_MET'); G.contacts[xc]=G.day-300; step('2027-07-05',18.5);
    const m1=txt('p:'+xc); check('8. 7/5 18:10「第一天。我負責影印。」＋卡紙那句；回覆兩個（沒有午餐）',m1.includes(xc+':第一天。我負責影印。')&&(TH('p:'+xc).slice(-1)[0].ask||{opts:[]}).opts.length===2,J(m1));
    step('2027-07-14',22); const last=TH('p:'+xc).slice(-1)[0]; const op=(last.ask||{opts:[]}).opts.map(o=>o.t);
    check('8. 7/14 21:30 開庭時間表（沒去過 C14：「我爸說排得很好」）、多「要不要一起吃午餐？」',/我爸說排得很好/.test(last.text)&&op.includes('要不要一起吃午餐？'),J([last.text,op]));
    const r=PHONE.answer(G,last.ask.id,op.indexOf('要不要一起吃午餐？')); G.hour=22.2; STORY.phoneRules(GM); const q=OUT.get(G,'va09_lunch');
    check('8. 回「要不要一起吃午餐？」→ 她「平日十二點到一點。事務所樓下有一間。」、行事曆排隔天（週四）12:00',txt('p:'+xc).includes(xc+':平日十二點到一點。事務所樓下有一間。')&&!!q&&q.day===DK('2027-07-15')&&q.h===12,J(q));
    step('2027-07-28',13); const l3=TH('p:'+xc).slice(-1)[0]; check('8. 7/28 便當照片那則：午餐問過了就不再出現',/午餐。/.test(l3.text)&&!(l3.ask.opts.map(o=>o.t).includes('要不要一起吃午餐？')),J(l3.ask.opts.map(o=>o.t)));
    law('2027-07-14',20,{C14_VISITED:DK('2026-12-30')}); R(xc,30,20,20); SOCIAL.remember(xc,'FIRST_MET'); G.contacts[xc]=G.day-300; step('2027-07-05',18.5); step('2027-07-14',22);
    check('8. 去過 C14 的玩家：第二句換「就是你上次來，白板上那種。現在是我排的。」',txt('p:'+xc).includes(xc+':就是你上次來，白板上那種。現在是我排的。'));
    law('2027-07-05',17); step('2027-07-05',18.5); check('8. 不熟（沒有 FAMILIAR）：收不到',!txt('p:'+xc).length); }
  // 9. VA-10 麵店團出國：香港（AA_256 第 2 節）：7/20 21:00 群組揪 → 我也去 → 8/25 出發的行程；三場（以安交往中最後一晚多一句）；8/28 21:00 群組四則。沒去：阿哲一句、地鐵門外 Alison 的照片、最後「欠一次」
  { const step=(k,h)=>{ G.day=DK(k); G.weekday=wdOf(G.day); G.hour=h; STORY.phoneRules(GM); PHONE.tick(G); }, g='g:noodle_team';
    law('2027-07-20',20,{dating_heroine_01:true}); PHONE.join(G,'noodle_team','麵店團'); step('2027-07-20',21.2);
    const L=TH(g).filter(m=>!/^dorm_lottery/.test(m.tag||'')), last=L.slice(-1)[0]; check('9. 7/20 21:00 群組十則（阿哲揪…語彤「你們拍麵給我看」），最後一則可以回「我也去。／我那幾天不行。」',L.length===10&&/拍麵給我看/.test(last.text)&&last.ask&&last.ask.opts.map(o=>o.t).join('|')==='我也去。|我那幾天不行。',J(L.map(m=>m.text)));
    /* AA_369 H1：以安 8/9～8/27 在京都，不去香港——她「我那幾天在京都。你們去，拍照給我。」；排行程的兩句改柏翰（沒有「可以。」）*/
    const who=t=>(L.find(m=>m.text===t)||{}).from;
    check('9. AA_369 H1：以安「我那幾天在京都。你們去，拍照給我。」；柏翰「行程我來排？」→ 阿哲「不要…」→ 柏翰「……好。我只排第一天。」；沒有「可以。行程我來排？」',who('我那幾天在京都。你們去，拍照給我。')==='heroine_01'&&who('行程我來排？')==='classmate_bohan'&&who('……好。我只排第一天。')==='classmate_bohan'&&!L.some(m=>m.text==='可以。行程我來排？')&&!L.some(m=>m.from==='heroine_01'&&/排/.test(m.text))&&L.map(m=>m.text).indexOf('行程我來排？')<L.map(m=>m.text).indexOf('不要 這次不排 走到哪吃到哪'),J(L.map(m=>m.from+':'+m.text)));
    PHONE.answer(G,'va10_ask',0); G.hour=21.4; STORY.phoneRules(GM); const q=OUT.get(G,'vac_va10');
    check('9. 回「我也去。」→ 行事曆 8/25 出發（香港）',G.flags.VA10==='yes'&&!!q&&q.day===DK('2027-08-25'),J(q));
    said=[]; G.day=DK('2027-08-25'); G.hour=8; await VAC.outing(GM,q); const S0=said.map(x=>x.t), W0=said.map(x=>x.who+'：'+x.t);
    check('9. 三場：地鐵門外的 Alison、茶餐廳的奶茶、海邊步道；回到 8/28',S0.includes('（在門外）欸——！')&&S0.includes('你喝個奶茶也要分析喔。')&&G.day===DK('2027-08-28'),J(S0.slice(0,12)));
    check('9. AA_369 H1：8/25、8/27 那兩句是柏翰說；以安不在香港（三場沒有她）、交往版「……下次只有我們兩個的時候，我再排。」拿掉',W0.includes('許柏翰：……下一站等她。我第一天的行程有寫「走散的話在下一站等」。')&&W0.includes('許柏翰：（看著對岸）……第二天以後都沒排，結果也走完了。')&&!said.some(x=>x.who==='沈以安')&&!S0.includes('……下次只有我們兩個的時候，我再排。'),J(W0));
    const AN=TH('p:heroine_01').find(m=>m.tag==='va10_dm_heroine_01');
    check('9. AA_369 H1：和以安交往中，8/27 21:00 她私訊「📷（京都車站的月台）」「明天回去。……香港好玩嗎？」',!!AN&&AN.day===DK('2027-08-27')&&AN.h===21&&J(TH('p:heroine_01').filter(m=>m.tag==='va10_dm_heroine_01').map(m=>m.text))===J(['📷（京都車站的月台）','明天回去。……香港好玩嗎？']),J(TH('p:heroine_01').map(m=>[m.day,m.h,m.text,m.tag])));
    q.state='done'; step('2027-08-28',21.5); const B=TH(g).map(m=>m.text); check('9. 8/28 晚上群組四則（兩盒蛋塔…蛋用得比較少），去了的沒有「欠一次」',B.some(t=>/兩盒蛋塔/.test(t))&&B.some(t=>/蛋用得比較少/.test(t))&&!B.some(t=>/欠一次/.test(t)),J(B.slice(-4)));
    law('2027-07-20',20); PHONE.join(G,'noodle_team','麵店團'); step('2027-07-20',21.2); PHONE.answer(G,'va10_ask',1);
    check('9. 回「我那幾天不行。」→ 阿哲「靠 好啦 下次」、沒有行程',txt(g).includes('zhe:靠 好啦 下次')&&!OUT.get(G,'vac_va10'));
    step('2027-08-25',16.5); step('2027-08-28',21.5); const B2=txt(g);
    check('9. 沒去：8/25 阿哲傳 Alison 在月台上的照片＋「第一天就丟一個」、Alison「是門自己關的！！」（AA_256@247198e8）；8/28 四則最後阿哲「下次你一定要來 欠一次」',B2.some(t=>/隔著地鐵的車門玻璃/.test(t))&&B2.includes('zhe:第一天就丟一個')&&B2.includes('yu:是門自己關的！！')&&B2[B2.length-1]==='zhe:下次你一定要來 欠一次',J(B2.slice(-3)));
    law('2027-07-20',20); PHONE.join(G,'noodle_team','麵店團'); step('2027-07-20',21.2); step('2027-08-01',20.5); const N=txt('p:zhe');
    step('2027-08-04',10); check('9. 不回：8/1 阿哲私訊「香港 你到底要不要」；8/3 以後還沒回＝不去',N.includes('zhe:香港 你到底要不要')&&G.flags.VA10==='no'&&!OUT.get(G,'vac_va10'),J([N,G.flags.VA10])); }
  // 10. AA_275 第 1 節：快轉跳過的日子裡，第二次以後、只有一行的活動不停（C03 日語課第二年），跳過的旁白換成 AA_264 那一句；第一次參加的照常停
  { law('2027-07-05',10); const V=VAC.rec(G); V.reg['C03@Y1']='done'; VAC.signup(G,'C03@Y2','yes'); const qs=OUT.rec(G).filter(q=>q.vac&&q.vac.key==='C03@Y2');
    const nx=HOME.breakNext(G), k0=T0=>qs.find(q=>q.vac.k===0);
    check('10. 第二年日語課：三場都排了（AA_369 M4：照 2027 的週二、四＝7/8、7/15、7/22）；快轉的「下一個有事的日子」不停在 7/8 第一堂',qs.length===3&&JSON.stringify(qs.map(q=>q.day))===JSON.stringify(['2027-07-08','2027-07-15','2027-07-22'].map(k=>STORY.dayOfKey(k)))&&(nx==null||nx>STORY.dayOfKey('2027-07-08')*24+19),JSON.stringify([qs.map(q=>q.day),nx]));
    said=[]; await HOME.breakJump(GM,STORY.dayOfKey('2027-07-10')*24+8.5,{dorm:true}); const q0=qs.find(q=>q.vac.k===0);
    check('10. 跳過 7/8：第一堂記成去過，旁白換成「第一堂。老師記得你，說你去年的作業字很工整。」',q0.state==='done'&&G.flags._repSkipLine==='第一堂。老師記得你，說你去年的作業字很工整。'&&(V.att||{})['C03@Y2']===1,JSON.stringify([q0.state,G.flags._repSkipLine]));
    law('2027-07-05',10); VAC.signup(G,'C03@Y2','yes'); const nx2=HOME.breakNext(G), d7=STORY.dayOfKey('2027-07-08');
    check('10. 第一次參加（沒上過大一那期）：快轉停在第一堂（7/8）前',nx2!=null&&nx2<=d7*24+19,JSON.stringify(nx2)); }
  // 11. AA_275 第 6 節：摘要日那天有已報名的活動（或人在國外）＝跳過，不播、快轉不停
  { law('2027-07-10',10); const d20=STORY.dayOfKey('2027-07-20'); const has=()=>HOME.breakPts(G).some(p=>p.k==='sum'&&p.day===d20);
    const before=has(); OUT.plan(G,{id:'t_vac_0720',ev:'ev_vac_key',day:d20,h:14,place:'x',title:'x',vac:{key:'C99@Y2',k:0}});
    check('11. 7/20 摘要日：平常在；那天有已報名的活動就跳過',before&&!has(),JSON.stringify([before,has()])); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
