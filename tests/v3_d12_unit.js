// 交接包 v3 D12：大二的聖誕交換禮物、跨年、期末最後一頓（AA_143 1-6～1-8、AA_177 第 6 節）——不需要瀏覽器。
// 檢查：邀約時間與字（12/23 21:00、12/31 21:00、最後一科考完那天 17:00）、出發選單時間（12:20、23:50）、沒去的照片（21:30／跨年 00:05 照片＋阿哲）；聖誕兩個保溫杯、抽到誰的禮物；跨年大二版那兩句；期末那一頓的大二版。用法：node tests/v3_d12_unit.js
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
  const d23=D('2026-12-23'), d24=D('2026-12-24'), d31=D('2026-12-31');
  fresh(d23,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); let o=OUT.get(G,'y2_xmas');
  check('1. 聖誕：12/23 21:00 阿哲「聖誕交換禮物，明天中午，霖澤館一樓。兩百以內。」；出發選單 12/24 12:20',txt('g:noodle_team').includes('zhe:聖誕交換禮物，明天中午，霖澤館一樓。兩百以內。')&&o&&o.day===d24&&Math.abs(o.h-(12+20/60))<1e-6,JSON.stringify([txt('g:noodle_team'),o]));
  const X=ev('ev_y2_xmas'); fresh(d24,12.4,'campus'); const k0=STORY.knows; STORY.knows=id=>['zhe','yu','heroine_01'].includes(id); meet('heroine_01'); said=[]; G.flags.Y2_XMAS_FROM=null; const r0=Math.random; Math.random=()=>0; await EVENTS.run(X); Math.random=r0; STORY.knows=k0; let L=lines();
  check('2. 兩個一樣的保溫杯「……為什麼有兩個一樣的保溫杯？」阿哲、小語「不是我們。」；抽到以安＝空白手帳「理由欄是空的。給你自己寫。」',L.includes('拆到的人：……為什麼有兩個一樣的保溫杯？')&&L.includes('阿哲、小語：不是我們。')&&L.includes('你抽到以安的：一本空白手帳。')&&L.some(t=>/理由欄是空的。給你自己寫。/.test(t)),JSON.stringify(L));
  // 3. 跨年大二（AA_210 第 1 節＋第 5 節 881ed505：16 週制 12/31 在寒假；取代原本的「十一點五十，頂樓。十分鐘就好。」）
  fresh(d31,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); meet('heroine_01'); run(20,21.2); o=OUT.get(G,'nye_y2'); const g3=txt('g:noodle_team');
  check('3. 跨年：12/31 21:00 群組五句（以安「今年頂樓幾點？」…阿哲「去年沒看到，今年要看到」）；出發選單 23:30 宿舍頂樓',g3[0]==='heroine_01:今年頂樓幾點？'&&g3.length===5&&g3[4]==='zhe:去年沒看到，今年要看到'&&!g3.some(t=>/十分鐘就好/.test(t))&&o&&Math.abs(o.h-23.5)<1e-6,JSON.stringify([g3,o&&o.h]));
  fresh(d31,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); check('3. 以安不認識：第一句換成柏翰「今年頂樓有人要去嗎？十一點半。」',txt('g:noodle_team')[0]==='classmate_bohan:今年頂樓有人要去嗎？十一點半。');
  OUT.get(G,'nye_y2').state='missed'; G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); const nm=TH('g:noodle_team').filter(m=>m.tag==='nye_y2_photo');
  check('3. 沒去：00:05 阿哲的照片（信義區人擠人）＋小語「人超多」；NYE_Y2＝none',nm.length===2&&/人擠人/.test(nm[0].text)&&nm[1].text==='人超多'&&G.flags.NYE_Y2==='none',JSON.stringify(nm.map(m=>[m.day,m.h,m.text])));
  fresh(d31,20,'campus'); SOCIAL.rel('zhe').fam=30; meet('zhe'); run(20,21.2); check('3. 不在群組、和阿哲 FAMILIAR 以上：阿哲私訊兩則「跨年頂樓十一點半 柏翰他們會去」「我跟小語去信義區 你去頂樓就好」（AA_210 5-5）',JSON.stringify(txt('p:zhe'))===JSON.stringify(['zhe:跨年頂樓十一點半 柏翰他們會去','zhe:我跟小語去信義區 你去頂樓就好'])&&!!OUT.get(G,'nye_y2'),JSON.stringify(txt('p:zhe')));
  fresh(d31,23.5,'dorm',{NYE_Y2:'roof',NYE_Y2_PHOTO:true}); PHONE.join(G,'noodle_team','麵店團'); G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); const ph=TH('g:noodle_team').filter(m=>m.tag==='nye_y2_photo').map(m=>m.text);
  check('3. 拍了照：阿哲的照片、小語之後，玩家的照片「頂樓的欄杆後面，煙火的上半截，很清楚」、阿哲「你們那邊比較清楚耶」',ph.length===4&&/欄杆後面/.test(ph[2])&&ph[3]==='你們那邊比較清楚耶',JSON.stringify(ph));
  // 3. 可昕交往中（AA_210 5-2）：12/24 21:00 私訊「今年跨年，高雄還是頂樓？」→ 高雄（2980，錢不夠變灰）／頂樓（零點視訊）；沒回＝視訊；答應高雄沒去＝兩句
  { const kxa=m=>TH('p:kexin').filter(x=>x.tag===m); fresh(d31-7,20,'dorm',{dating_kexin:true}); run(20,21.2); const a=kxa('kx_nye_y2');
    check('5-2. 大二 12/24 21:00 可昕「今年跨年，高雄還是頂樓？」、選項「高雄。／頂樓。」',a.length===1&&a[0].text==='今年跨年，高雄還是頂樓？'&&a[0].ask.opts.map(o=>o.t).join('|')==='高雄。|頂樓。',JSON.stringify(a.map(x=>x.text)));
    G.money=2000; check('5-2. 錢不夠（2000 元）：「高雄。」不能選（高鐵票錢不夠。）',PHONE.optBlocked(G,a[0].ask.opts[0])&&PHONE.answer(G,'kx_nye_y2',0)===null&&a[0].ask.opts[0].need.why==='高鐵票錢不夠。');
    G.money=5000; PHONE.answer(G,'kx_nye_y2',0); G.day=d31; G.hour=21; STORY.phoneRules(GM); const q=OUT.get(G,'kx_nye_y2');
    check('5-2. 選「高雄。」→ 她「好。我去車站接你。幾點的車先跟我說。」；12/31 23:30 去高雄（不排頂樓）',txt('p:kexin').includes('kexin:好。我去車站接你。幾點的車先跟我說。')&&G.flags.KX_NYE[2]==='river'&&!!q&&q.ev==='ev_kx_nye_river_y2'&&!OUT.get(G,'nye_y2'),JSON.stringify([G.flags.KX_NYE,q&&q.ev]));
    q.state='missed'; G.hour=24.1; STORY.phoneRules(GM); PHONE.tick(G); check('5-2. 答應高雄沒去：00:00「愛河的煙火，我一個人看了。」「……新年快樂。」、KX_NYE[2]＝missed',txt('p:kexin').includes('kexin:愛河的煙火，我一個人看了。')&&G.flags.KX_NYE[2]==='missed');
    fresh(d31-7,20,'dorm',{dating_kexin:true}); run(20,21.2); G.day=d31; G.hour=21.1; STORY.phoneRules(GM); G.hour=23.8; STORY.phoneRules(GM); const v=OUT.get(G,'kx_nye_video_y2');
    check('5-2. 12/31 21:00 以前沒回＝視訊：23:59「可昕打視訊來」（接起來）',G.flags.KX_NYE[2]==='video'&&!!v&&v.verb==='接起來'&&Math.abs(v.h-(23+59/60))<1e-6,JSON.stringify(v));
    const RV=ev('ev_kx_nye_river_y2'); fresh(d31,23.5,'dorm',{dating_kexin:true,KX_NYE:{1:'river',2:'river'}}); said=[]; let paid=0; const mo=GM.money; GM.money=d=>{ paid+=d; }; await RV.beforeOuting(G,GM); GM.money=mo; await EVENTS.run(RV); const LR=lines();
    check('5-2. 高雄那一場：高鐵 -2980；大一也去過＝「第二年了。你認得路了吧。」；最後「（凌晨一點，加開的那班高鐵。）」',paid===-2980&&LR.some(t=>/第二年了。你認得路了吧。/.test(t))&&LR.includes('（凌晨一點，加開的那班高鐵。）'),JSON.stringify(LR));
    const RF=ev('ev_y2_newyear'); fresh(d31,23.5,'dorm',{dating_kexin:true,KX_NYE:{2:'video'}}); said=[]; await EVENTS.run(RF); const LF=lines();
    check('5-2. 選頂樓：頂樓那一場裡 23:59 可昕視訊「讓我看一下頂樓。」',LF.some(t=>/讓我看一下頂樓。/.test(t))&&LF.indexOf('（十一點五十九分，手機響了。可昕打視訊來。）')<LF.indexOf('（零點。很遠的地方亮了一下。今年也只看得到上半截。）'),JSON.stringify(LF)); }
  { const d3=STORY.dayOfKey('2027-12-31'), d4=STORY.dayOfKey('2028-12-31');
    fresh(d3-7,20,'dorm',{dating_kexin:true,KX_NYE:{2:'video'}}); run(20,21.2); const a3=TH('p:kexin').filter(x=>x.tag==='kx_nye_y3').map(x=>x.text);
    check('5-2. 大三 12/24：「跨年。我列了選項。」「一、你來高雄。二、零點視訊。沒有三。」，大二選視訊多「去年是二。今年我比較想要一。」',JSON.stringify(a3)===JSON.stringify(['跨年。我列了選項。','一、你來高雄。二、零點視訊。沒有三。','去年是二。今年我比較想要一。']),JSON.stringify(a3));
    fresh(d4-7,20,'dorm',{dating_kexin:true,EXCHANGE_ROUTE:'US'}); run(20,21.2); const a4=TH('p:kexin').filter(x=>x.tag==='kx_nye_y4').map(x=>x.text);
    check('5-2. 大四 12/24（美國路線）：「你的時差調回來了嗎？」＋「跨年。高雄或視訊，你選。我兩個都可以。」',JSON.stringify(a4)===JSON.stringify(['你的時差調回來了嗎？','跨年。高雄或視訊，你選。我兩個都可以。']),JSON.stringify(a4)); }
  const N=ev('ev_y2_newyear'); fresh(d31,23.5,'dorm',{dating_heroine_01:true}); meet('heroine_01'); said=[]; await EVENTS.run(N); L=lines();
  check('3. 頂樓：「今年頂樓的人少了兩個」；以安在場（交往中）；沒有期末考週的句子；交往中下樓「……手給我。」',L.includes('（十一點半。今年頂樓的人少了兩個。）')&&L.includes('沈以安：去年這時候還在捷運上。')&&L.includes('沈以安：……手給我。')&&!L.some(t=>/回去念|宵夜/.test(t))&&G.flags.NYE_Y2==='roof',JSON.stringify(L));
  const e=CLS.lastExamEnd({flags:{},day:1},'Y2S1','final'); check('4. 大二上最後一科考完的時間算得出來（第 18 週）',!!e&&CALENDAR.termOf(e.day).id==='Y2S1',JSON.stringify(e));
  if(e){ fresh(e.day,16,'campus',{noodleTableDay:3}); PHONE.join(G,'noodle_team','麵店團'); run(16,17.1); check('4. 那天 17:00 阿哲「考完了。七點，麵店。」',txt('g:noodle_team').includes('zhe:考完了。七點，麵店。'),JSON.stringify(txt('g:noodle_team')));
    run(17.2,21.8,0.3); check('4. 21:30 還沒去＝「（空碗疊成一座塔。）」',txt('g:noodle_team').includes('zhe:📷（空碗疊成一座塔。）'));
    const M=ev('ev_term_last_meal_y2s1'); fresh(e.day,19,'noodle',{noodleTableDay:3,YU_ZHE_TOLD:'msg'}); G.hour=Math.max(19,e.h+0.1); const ok=EVENTS.check(M); meet('heroine_01'); meet('heroine_03'); const k1=STORY.knows; STORY.knows=id=>['zhe','yu','heroine_01','heroine_03'].includes(id); said=[]; await EVENTS.run(M); STORY.knows=k1; L=lines();
    check('4. 期末最後一頓（大二上）：阿姨「考完了，吃好一點。」；小語和阿哲坐一起；以安「大二上：完成」；語彤「……今天阿姨說我不用端。」',ok&&L.includes('阿姨：考完了，吃好一點。')&&L.includes('（小語和阿哲坐在一起。）')&&L.includes('（以安在手帳上寫：「大二上：完成」。）')&&L.some(t=>/今天阿姨說我不用端。/.test(t)),JSON.stringify(L)); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
