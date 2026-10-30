// 交接包 v3 D12：大二的聖誕交換禮物、跨年、期末最後一頓（AA_143 1-6～1-8、AA_177 第 6 節）——不需要瀏覽器。
// （2026-10-28 AA_519 1-3（企劃線 d75cd0228，NPC-STORY2-1028）：期末那一頓大二版的阿姨「吃好一點。」換成「吃完再走。」（下雨「吃完再走。外面在下雨。」）、送小菜第四處「（桌上多了一碟小黃瓜。沒有人點。）」——第 4 項照新字查、「吃好一點」不在）
// 檢查：邀約時間與字（12/16 21:00、12/31 21:00、最後一科考完那天 17:00；聖誕交換改 12/17，AA_313 第 4-1 節第 8 點）、出發選單時間（12:20、23:50）、沒去的照片（21:30／跨年 00:05 照片＋阿哲）；聖誕兩個保溫杯、抽到誰的禮物；跨年大二版那兩句；期末那一頓的大二版。用法：node tests/v3_d12_unit.js
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
  const d16=D('2026-12-16'), d17=D('2026-12-17'), d31=D('2026-12-31');
  fresh(d16,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); let o=OUT.get(G,'y2_xmas');
  check('1. 聖誕：12/16 21:00 阿哲「聖誕交換禮物，明天中午，A館一樓 兩百以內」；出發選單 12/17（四）12:20（12/24 是第 16 週期末考週，AA_313 第 4-1 節第 8 點）',txt('g:noodle_team').includes('zhe:聖誕交換禮物，明天中午，A館一樓 兩百以內')&&o&&o.day===d17&&Math.abs(o.h-(12+20/60))<1e-6&&CALENDAR.termOf(d17).week<16,JSON.stringify([txt('g:noodle_team'),o]));
  const X=ev('ev_y2_xmas'); fresh(d17,12.4,'campus'); const k0=STORY.knows; STORY.knows=id=>['zhe','yu','heroine_01'].includes(id); meet('heroine_01'); said=[]; G.flags.Y2_XMAS_FROM=null; const r0=Math.random; Math.random=()=>0; await EVENTS.run(X); Math.random=r0; STORY.knows=k0; let L=lines();
  check('2. 兩個一樣的保溫杯「……為什麼有兩個一樣的保溫杯？」阿哲、Alison「不是我們。」；抽到以安＝空白手帳「跟我用的同一款。你不用寫得很整齊。」（AA_313 4-3）',L.includes('拆到的人：……為什麼有兩個一樣的保溫杯？')&&L.includes('阿哲、Alison：不是我們。')&&L.includes('你抽到以安的：一本空白手帳。')&&L.includes('沈以安：跟我用的同一款。你不用寫得很整齊。')&&!L.some(t=>/理由欄/.test(t)),JSON.stringify(L));
  // 3. 跨年大二（AA_210 第 1 節＋第 5 節 881ed505：16 週制 12/31 在寒假；取代原本的「十一點五十，頂樓。十分鐘就好。」）
  fresh(d31,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); meet('heroine_01'); run(20,21.2); o=OUT.get(G,'nye_y2'); const g3=txt('g:noodle_team');
  check('3. 跨年：12/31 21:00 群組六句（以安「今年頂樓幾點？」…阿哲「宿委會今年也開頂樓…」（AA_210 第 0 節）…阿哲「去年沒看到，今年要看到」）；出發選單 23:30 宿舍頂樓',g3[0]==='heroine_01:今年頂樓幾點？'&&g3.length===6&&g3[2]==='zhe:宿委會今年也開頂樓 訪客一樓登記，十二點半前要走'&&g3[5]==='zhe:去年沒看到，今年要看到'&&!g3.some(t=>/十分鐘就好/.test(t))&&o&&Math.abs(o.h-23.5)<1e-6,JSON.stringify([g3,o&&o.h]));
  fresh(d31,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); check('3. 以安不認識：第一句換成柏翰「今年頂樓有人要去嗎？十一點半。」',txt('g:noodle_team')[0]==='classmate_bohan:今年頂樓有人要去嗎？十一點半。');
  OUT.get(G,'nye_y2').state='missed'; G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); const nm=TH('g:noodle_team').filter(m=>m.tag==='nye_y2_photo');
  check('3. 沒去：00:05 阿哲的照片（信義區人擠人）＋Alison「人超多」；NYE_Y2＝none',nm.length===2&&/人擠人/.test(nm[0].text)&&nm[1].text==='人超多'&&G.flags.NYE_Y2==='none',JSON.stringify(nm.map(m=>[m.day,m.h,m.text])));
  fresh(d31,20,'campus'); SOCIAL.rel('zhe').fam=30; meet('zhe'); run(20,21.2); check('3. 不在群組、和阿哲 FAMILIAR 以上：阿哲私訊兩則「跨年頂樓十一點半 柏翰他們會去」「我跟 Alison 去信義區 你去頂樓就好」（AA_210 5-5）',JSON.stringify(txt('p:zhe'))===JSON.stringify(['zhe:跨年頂樓十一點半 柏翰他們會去','zhe:宿委會今年也開頂樓 訪客一樓登記，十二點半前要走','zhe:我跟 Alison 去信義區 你去頂樓就好'])&&!!OUT.get(G,'nye_y2'),JSON.stringify(txt('p:zhe')));
  fresh(d31,23.5,'dorm',{NYE_Y2:'roof',NYE_Y2_PHOTO:true}); PHONE.join(G,'noodle_team','麵店團'); G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); const ph=TH('g:noodle_team').filter(m=>m.tag==='nye_y2_photo').map(m=>m.text);
  check('3. 拍了照：阿哲的照片、Alison 之後，玩家的照片「頂樓的欄杆後面，煙火的上半截，很清楚」、阿哲「你們那邊比較清楚耶」',ph.length===4&&/欄杆後面/.test(ph[2])&&ph[3]==='你們那邊比較清楚耶',JSON.stringify(ph));
  // 3. 可昕交往中（AA_210 5-2）：12/24 21:00 私訊「今年跨年，高雄還是頂樓？」→ 高雄（2980，錢不夠變灰）／頂樓（零點視訊）；沒回＝視訊；答應高雄沒去＝兩句
  { const kxa=m=>TH('p:kexin').filter(x=>x.tag===m); fresh(d31-7,20,'dorm',{dating_kexin:true}); run(20,21.2); const a=kxa('kx_nye_y2');
    check('5-2. 大二 12/24 21:00 可昕「今年跨年，高雄還是頂樓？」、選項「高雄。／頂樓。」',a.length===1&&a[0].text==='今年跨年，高雄還是頂樓？'&&a[0].ask.opts.map(o=>o.t).join('|')==='高雄。|頂樓。',JSON.stringify(a.map(x=>x.text)));
    G.money=2000; check('5-2. 錢不夠（2000 元）：「高雄。」不能選（高鐵票錢不夠。）',PHONE.optBlocked(G,a[0].ask.opts[0])&&PHONE.answer(G,'kx_nye_y2',0)===null&&a[0].ask.opts[0].need.why==='高鐵票錢不夠。');
    G.money=5000; PHONE.answer(G,'kx_nye_y2',0); G.day=d31; G.hour=21; STORY.phoneRules(GM); const q=OUT.get(G,'kx_nye_y2');
    check('5-2. 選「高雄。」→ 她「好。我去車站接你。幾點的車先跟我說。」；12/31 23:30 去高雄（不排頂樓）',txt('p:kexin').includes('kexin:好。我去車站接你。幾點的車先跟我說。')&&G.flags.KX_NYE[2]==='river'&&!!q&&q.ev==='ev_kx_nye_river_y2'&&!OUT.get(G,'nye_y2'),JSON.stringify([G.flags.KX_NYE,q&&q.ev]));
    q.state='missed'; G.hour=23.9; STORY.phoneRules(GM); PHONE.tick(G); G.hour=24.1; STORY.phoneRules(GM); PHONE.tick(G); const qc=OUT.get(G,'kx_nye_call_y2');
    check('5-2. 答應高雄沒去：KX_NYE[2]＝missed；00:05 她打來（演出來的電話，AA_313 2-3 B）；當晚不傳那兩句',G.flags.KX_NYE[2]==='missed'&&!!qc&&qc.day===d31+1&&Math.abs(qc.h-5/60)<1e-6&&qc.ev==='ev_kexin_nye_missed_call'&&qc.verb==='接起來'&&!txt('p:kexin').includes('kexin:愛河的煙火，我一個人看了。'),JSON.stringify(qc));
    { const sv=said; said=[]; G.day=d31+1; G.hour=0.05; await OUT.go(GM,qc); const Lc=lines(); said=sv;
      check('5-2. 00:05 的電話照稿：「你在哪。」「……臺北。」「我在愛河等到零點。」「……新年快樂。我要回家了。」（她掛掉了。）',JSON.stringify(Lc)===JSON.stringify(['（電話。很吵，她那邊還有人在放煙火。）','杜可昕：你在哪。','祐廷：……臺北。','杜可昕：我在愛河等到零點。','杜可昕：……新年快樂。我要回家了。','（她掛掉了。）']),JSON.stringify(Lc)); }
    G.day=d31+1; G.hour=9.05; PHONE.tick(G); const mm=TH('p:kexin').filter(m=>m.tag==='kx_nye_miss_y2');
    check('5-2. 答應高雄沒去：「愛河的煙火，我一個人看了。」「……新年快樂。」改到隔天早上 09:00',mm.map(m=>m.text).join('｜')==='愛河的煙火，我一個人看了。｜……新年快樂。'&&mm.every(m=>m.day===d31+1&&Math.abs(m.h-9)<0.06),JSON.stringify(mm.map(m=>[m.day,m.h,m.text])));
    fresh(d31-7,20,'dorm',{dating_kexin:true}); run(20,21.2); G.day=d31; G.hour=21.1; STORY.phoneRules(GM); G.hour=23.8; STORY.phoneRules(GM); const v=OUT.get(G,'kx_nye_video_y2');
    check('5-2. 12/31 21:00 以前沒回＝視訊：23:59「可昕打視訊來」（接起來）',G.flags.KX_NYE[2]==='video'&&!!v&&v.verb==='接起來'&&Math.abs(v.h-(23+59/60))<1e-6,JSON.stringify(v));
    const RV=ev('ev_kx_nye_river_y2'); fresh(d31,23.5,'dorm',{dating_kexin:true,KX_NYE:{1:'river',2:'river'}}); said=[]; let paid=0; const mo=GM.money; GM.money=d=>{ paid+=d; }; await RV.beforeOuting(G,GM); GM.money=mo; await EVENTS.run(RV); const LR=lines();
    check('5-2. 高雄那一場：高鐵 -2980；大一也去過＝「第二年了。你認得路了吧。」；最後「（凌晨一點，加開的那班高鐵。）」',paid===-2980&&LR.some(t=>/第二年了。你認得路了吧。/.test(t))&&LR.includes('（凌晨一點，加開的那班高鐵。）'),JSON.stringify(LR));
    const RF=ev('ev_y2_newyear'); fresh(d31,23.5,'dorm',{dating_kexin:true,KX_NYE:{2:'video'}}); said=[]; await EVENTS.run(RF); const LF=lines();
    check('5-2. 選頂樓：頂樓那一場裡 23:59 可昕視訊「讓我看一下頂樓。」',LF.some(t=>/讓我看一下頂樓。/.test(t))&&LF.indexOf('（十一點五十九分，手機響了。可昕打視訊來。）')<LF.indexOf('（零點。很遠的地方亮了一下。今年也只看得到上半截。）'),JSON.stringify(LF));
    check('5-2. 頂樓版她那段的旁白「（她那邊的煙火聲，比畫面慢了一秒。）」（AA_313 第 2 節第 37 列：不要連著兩次「零點」）',LF.includes('（她那邊的煙火聲，比畫面慢了一秒。）')&&!LF.includes('（零點。她那邊的煙火聲，比畫面慢了一秒。）')&&LF.filter(t=>t.startsWith('（零點。')).length===1,JSON.stringify(LF));
    { const V3=ev('ev_kx_nye_video_y3'); fresh(d31+365,23.9,'dorm',{dating_kexin:true}); said=[]; await EVENTS.run(V3); const LV=lines(); check('5-2. 大三單獨視訊：「我數到零就掛。」（AA_313 第 2 節第 43 列：他一個人，沒有「你們繼續。」）',LV.includes('杜可昕：我數到零就掛。')&&!LV.some(t=>/你們繼續/.test(t)),JSON.stringify(LV)); } }
  { const d3=STORY.dayOfKey('2027-12-31'), d4=STORY.dayOfKey('2028-12-31');
    fresh(d3-7,20,'dorm',{dating_kexin:true,KX_NYE:{2:'video'}}); run(20,21.2); const a3=TH('p:kexin').filter(x=>x.tag==='kx_nye_y3').map(x=>x.text);
    check('5-2. 大三 12/24：「跨年。我列了選項。」「一、你來高雄。二、零點視訊。沒有三。」，大二選視訊多「去年是二。今年我比較想要一。」',JSON.stringify(a3)===JSON.stringify(['跨年。我列了選項。','一、你來高雄。二、零點視訊。沒有三。','去年是二。今年我比較想要一。']),JSON.stringify(a3));
    fresh(d4-7,20,'dorm',{dating_kexin:true,EXCHANGE_ROUTE:'US'}); run(20,21.2); const a4=TH('p:kexin').filter(x=>x.tag==='kx_nye_y4').map(x=>x.text);
    check('5-2. 大四 12/24（美國路線）：「你的時差調回來了嗎？」＋「跨年。高雄或視訊，你選。我兩個都可以。」',JSON.stringify(a4)===JSON.stringify(['你的時差調回來了嗎？','跨年。高雄或視訊，你選。我兩個都可以。']),JSON.stringify(a4)); }
  // 3. 跨年大三（AA_210 第 2 節＋5-1）
  { const d3=STORY.dayOfKey('2027-12-31'); fresh(d3,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); const g0=txt('g:noodle_team'), o30=OUT.get(G,'nye_y3'); o30.state='missed'; G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); const ph0=TH('g:noodle_team').filter(m=>m.tag==='nye_y3_photo').length;
    check('大三跨年：不認識以安、芯慈＝群組只有阿哲兩則（「十一點半，頂樓」；第二則 AA_456 1-1 換字）、沒去也沒有那張寫著芯慈的合照（AA_313 第 672 行）',JSON.stringify(g0)===JSON.stringify(['zhe:十一點半，頂樓','zhe:頂樓照開 登記一樣在一樓'])&&!ph0,JSON.stringify(g0));
    fresh(d3,20,'campus'); meet('heroine_01'); meet('classmate_xinci'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); const g=txt('g:noodle_team'), o3=OUT.get(G,'nye_y3');
    check('大三跨年：12/31 21:00 群組四句（阿哲「十一點半，頂樓 以安說她要來」「頂樓照開 登記一樣在一樓」（AA_456 1-1）以安、芯慈）；23:30 頂樓',JSON.stringify(g)===JSON.stringify(['zhe:十一點半，頂樓 以安說她要來','zhe:頂樓照開 登記一樣在一樓','heroine_01:我會到。','classmate_xinci:我家吃完飯就過去，可能晚一點。'])&&!!o3&&Math.abs(o3.h-23.5)<1e-6,JSON.stringify(g));
    o3.state='missed'; G.hour=24.2; STORY.phoneRules(GM); PHONE.tick(G); const ph=TH('g:noodle_team').filter(m=>m.tag==='nye_y3_photo').map(m=>m.text);
    check('大三跨年沒去：00:05 Alison 的合照（五個人，芯慈站在最旁邊）＋「今年人到得最齊」',ph.length===2&&/芯慈站在最旁邊/.test(ph[0])&&ph[1]==='今年人到得最齊'&&G.flags.NYE_Y3==='none',JSON.stringify(ph));
    const E3=ev('ev_y3_newyear'); fresh(d3,23.5,'dorm',{EXCHANGE_ROUTE:'JP',dating_heroine_01:true,dating_kexin:true,KX_NYE:{3:'video'}}); meet('heroine_01'); meet('classmate_xinci'); said=[]; await EVENTS.run(E3); const L3=lines();
    check('大三頂樓：鹹酥雞、以安的行李、日本路線「你跟以安同一班喔？」「對。」、芯慈「捷運好多人。」、可昕視訊「我數到零就掛。」、倒數 Alison 起頭；沒有美國路線那句',L3.includes('（十一點半。阿哲和 Alison 已經在了，地上放著一袋鹹酥雞。）')&&L3.includes('阿哲：你跟以安同一班喔？')&&L3.some(t=>/：對。$/.test(t))&&L3.includes('吳芯慈：捷運好多人。')&&L3.some(t=>/我數到零就掛。/.test(t))&&L3.includes('（倒數是 Alison 起的頭，數到三，大家才跟上。）')&&L3.includes('（零點。煙火照樣只看得到上半截。鹹酥雞的袋子被風吹得沙沙響。）')&&!L3.some(t=>/一月就走/.test(t)),JSON.stringify(L3));
    check('大三頂樓的可昕視訊：23:59 打來、「我數到零就掛。你們繼續。」在群戲倒數之前；她的倒數、「新年快樂。」在群戲零點之後（AA_313 第 2 節第 43 列）',L3.indexOf('（十一點五十九分，可昕打視訊來。）')>=0&&L3.indexOf('杜可昕：我數到零就掛。你們繼續。')<L3.indexOf('（倒數是 Alison 起的頭，數到三，大家才跟上。）')&&L3.indexOf('（零點。煙火照樣只看得到上半截。鹹酥雞的袋子被風吹得沙沙響。）')<L3.indexOf('（她那邊的倒數，晚了一秒。）')&&L3.indexOf('（她那邊的倒數，晚了一秒。）')<L3.indexOf('杜可昕：新年快樂。'),JSON.stringify(L3));
    check('大三和以安交往中：她留下來「你排一下。」、選項「好。／妳不是最會排嗎？」；NYE_Y3＝roof',L3.includes('沈以安：你排一下。')&&L3.includes('沈以安：排好傳給我。')&&!L3.includes('沈以安：我也回去了。')&&G.flags.NYE_Y3==='roof',JSON.stringify(L3.slice(-6))); }
  // 3. 跨年大四（AA_210 第 3 節）
  { const d4=STORY.dayOfKey('2028-12-31'); fresh(d4,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); const g=txt('g:noodle_team'), o4=OUT.get(G,'nye_y4');
    check('大四跨年：12/31 21:00 群組四句（「十一點半，頂樓」「頂樓照開。舍監說十二點半…」（AA_456 1-1）「最後一年了耶」「所以要來」）；23:30 頂樓',JSON.stringify(g)===JSON.stringify(['zhe:十一點半，頂樓','zhe:頂樓照開 舍監說十二點半，一分鐘都不能多','yu:最後一年了耶','zhe:所以要來'])&&!!o4,JSON.stringify(g));
    fresh(d4,20,'campus'); SOCIAL.rel('zhe').fam=30; meet('zhe'); run(20,21.2); check('大四跨年：不在群組＝阿哲私訊「十一點半，頂樓」（第二則 AA_456 1-1 換字）',JSON.stringify(txt('p:zhe'))===JSON.stringify(['zhe:十一點半，頂樓','zhe:頂樓照開 舍監說十二點半，一分鐘都不能多']));
    const E4=ev('ev_y4_newyear'); fresh(d4,23.5,'dorm',{Y4_PATH:'grad',dating_heroine_01:true}); meet('heroine_01'); meet('classmate_xinci'); said=[]; await EVENTS.run(E4); const L4=lines();
    check('大四頂樓：芯慈的野餐墊、「看得到一點。」、考研究所沒推上＝單字卡（柏翰「今天先不要看。」）、倒數芯慈起頭、和以安交往中「明天中午一起吃飯？」',L4.includes('（十一點半。芯慈比你們都早到，已經把野餐墊鋪好了。）')&&L4.includes('阿哲：看得到一點。')&&L4.includes('許柏翰：今天先不要看。')&&L4.includes('（倒數是芯慈起的頭，比電視早了一秒。）')&&L4.includes('沈以安：明天中午一起吃飯？')&&!L4.some(t=>/講義/.test(t))&&G.flags.NYE_Y4==='roof',JSON.stringify(L4));
    { fresh(d4,23.5,'dorm',{}); said=[]; await EVENTS.run(E4); const L4u=lines(); check('大四頂樓、不認識芯慈：沒有她開頭的野餐墊、「去年我就覺得這裡很冷。」、阿哲「每年都冷。」、她起頭的倒數（AA_313 第 674 行）',!L4u.some(t=>/芯慈|每年都冷/.test(t))&&L4u.includes('Alison：今年看得到嗎？'),JSON.stringify(L4u)); }
    { fresh(d4,23.5,'dorm',{dating_kexin:true,KX_NYE:{4:'video'}}); meet('classmate_xinci'); said=[]; await EVENTS.run(E4); const L4k=lines();
      check('大四頂樓的可昕視訊：她的「（零點。兩邊的煙火，一大一小。）」「新年快樂。」在群戲倒數之後（AA_313 第 2 節第 47 列）',L4k.indexOf('杜可昕：你們那邊好冷的樣子。……外套拉起來。')>=0&&L4k.indexOf('杜可昕：你們那邊好冷的樣子。……外套拉起來。')<L4k.indexOf('（倒數是芯慈起的頭，比電視早了一秒。）')&&L4k.indexOf('（倒數是芯慈起的頭，比電視早了一秒。）')<L4k.indexOf('（零點。兩邊的煙火，一大一小。）')&&L4k.indexOf('（零點。兩邊的煙火，一大一小。）')<L4k.indexOf('杜可昕：新年快樂。'),JSON.stringify(L4k)); }
    fresh(d4,23.2,'dorm',{dating_heroine_03:true}); run(23.2,23.3); const c=OUT.get(G,'yt_nye_call_y4'); check('大四和語彤交往中：00:01 她打電話來（接起來）',!!c&&c.verb==='接起來'&&c.day===d4+1); }
  // 芷若在英國的跨年（AA_210 5-7）＋大四沒去的照片
  { const d3=STORY.dayOfKey('2027-12-31'), d4=STORY.dayOfKey('2028-12-31'), zr='heroine_02';
    fresh(d4,20,'campus'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); OUT.get(G,'nye_y4').state='missed'; G.day=d4+1; G.hour=0.2; STORY.phoneRules(GM); PHONE.tick(G); const p40=TH('g:noodle_team').filter(m=>m.tag==='nye_y4_photo').length;
    check('大四沒去、不認識芯慈：沒有那張寫著芯慈的照片',!p40);
    fresh(d4,20,'campus'); meet('classmate_xinci'); PHONE.join(G,'noodle_team','麵店團'); run(20,21.2); OUT.get(G,'nye_y4').state='missed'; G.day=d4+1; G.hour=0.2; STORY.phoneRules(GM); PHONE.tick(G); const p4=TH('g:noodle_team').filter(m=>m.tag==='nye_y4_photo').map(m=>m.text);
    check('大四沒去：00:05 Alison「野餐墊上的五個人，芯慈坐在正中間」、芯慈「今年我最早到。」',p4.length===2&&/芯慈坐在正中間/.test(p4[0])&&p4[1]==='今年我最早到。',JSON.stringify(p4));
    fresh(d3,23.5,'dorm',{dating_heroine_02:true}); meet(zr); run(23.5,24.0,0.05); const e3=txt('p:'+zr); const v3=OUT.get(G,'zr_nye_video_y3');
    check('芷若交往中（大三）：12/31 23:59「你那邊快零點了吧。」「我這邊還是下午。等一下打給你。」；1/1 08:00 視訊（接起來）',JSON.stringify(e3)===JSON.stringify(['heroine_02:你那邊快零點了吧。','heroine_02:我這邊還是下午。等一下打給你。'])&&!!v3&&v3.day===d3+1&&v3.h===8&&v3.verb==='接起來',JSON.stringify([e3,v3]));
    const V3=ev('ev_zr_nye_video_y3'); said=[]; await EVENTS.run(V3); const LV=lines(); check('芷若視訊（大三）：開場兩句、窗外煙火、收尾「我要去睡了。你去吃早餐。」',LV.some(t=>/我這邊剛好跨年。/.test(t))&&LV.includes('（她把手機轉向窗外。很遠的地方有煙火，聲音比畫面慢了一點。）')&&LV.some(t=>/我要去睡了。你去吃早餐。/.test(t)),JSON.stringify(LV));
    V3.outingMissed(G,GM,{day:d3+1}); G.day=d3+1; G.hour=9; PHONE.tick(G); check('芷若視訊沒接：08:30「沒關係。你那邊早上了，可能還在睡。新年快樂。」',txt('p:'+zr).includes('heroine_02:沒關係。你那邊早上了，可能還在睡。新年快樂。'));
    fresh(d4+1,7.5,'dorm'); meet(zr); SOCIAL.rel(zr).fam=65; SOCIAL.rel(zr).trust=50; SOCIAL.rel(zr).comf=45; run(7.5,8.2); const f4=txt('p:'+zr);
    check('芷若好朋友（大四，AA_446 第 8 節）：1/1 08:00「新年快樂。今年我在這邊跨第二次了。」＋「去年說臺灣的煙火比較大。……今年還是。」',f4.includes('heroine_02:新年快樂。今年我在這邊跨第二次了。')&&f4.includes('heroine_02:去年說臺灣的煙火比較大。……今年還是。'),JSON.stringify(f4));
    fresh(d4+1,7.5,'dorm'); meet(zr); run(7.5,8.2); check('芷若只是認識：什麼都不收（5-7 第 2 點）',!txt('p:'+zr).length); }
  const N=ev('ev_y2_newyear'); fresh(d31,23.5,'dorm',{dating_heroine_01:true}); meet('heroine_01'); said=[]; await EVENTS.run(N); L=lines();
  check('3. 頂樓：「頂樓只有幾個人」；以安在場（交往中）；大一沒走信義區那條＝「今年風比較小。」（AA_313 4-3）；沒有期末考週的句子；交往中下樓「……手給我。」「看不到台階。……你走慢一點。」',L.includes('（十一點半。頂樓只有幾個人。）')&&L.includes('沈以安：今年風比較小。')&&!L.includes('沈以安：去年這時候還在捷運上。')&&L.includes('沈以安：……手給我。')&&L.includes('沈以安：看不到台階。……你走慢一點。')&&!L.some(t=>/回去念|宵夜|安全上的考量/.test(t))&&G.flags.NYE_Y2==='roof',JSON.stringify(L));
  fresh(d31,23.5,'dorm',{dating_heroine_01:true,NYE_Y1:'roof',NYE_Y1_AN:true}); G.events.done.ev_nye_dinner=1; meet('heroine_01'); said=[]; await EVENTS.run(N); L=lines();
  check('3. 大一走「一起去信義區」那條、她也在（ev_nye_dinner、NYE_Y1 roof、NYE_Y1_AN）：「去年這時候還在捷運上。」（AA_313 4-3）',L.includes('沈以安：去年這時候還在捷運上。')&&!L.includes('沈以安：今年風比較小。'),JSON.stringify(L));
  const e=CLS.lastExamEnd({flags:{},day:1},'Y2S1','final'); check('4. 大二上最後一科考完的時間算得出來（第 18 週）',!!e&&CALENDAR.termOf(e.day).id==='Y2S1',JSON.stringify(e));
  if(e){ fresh(e.day,16,'campus',{noodleTableDay:3}); PHONE.join(G,'noodle_team','麵店團'); run(16,17.1); check('4. 那天 17:00 阿哲「考完了 七點，麵店」',txt('g:noodle_team').includes('zhe:考完了 七點，麵店'),JSON.stringify(txt('g:noodle_team')));
    run(17.2,21.8,0.3); check('4. 21:30 還沒去＝「（空碗疊成一座塔。）」',txt('g:noodle_team').includes('zhe:📷（空碗疊成一座塔。）'));
    const M=ev('ev_term_last_meal_y2s1'); fresh(e.day,19,'noodle',{noodleTableDay:3,YU_ZHE_TOLD:'msg'}); G.hour=Math.max(19,e.h+0.1); const ok=EVENTS.check(M); meet('heroine_01'); meet('heroine_03'); const k1=STORY.knows; STORY.knows=id=>['zhe','yu','heroine_01','heroine_03'].includes(id); said=[]; await EVENTS.run(M); STORY.knows=k1; L=lines();
    const W519=(G.weather==='rain'||G.weather==='typhoon')?'阿姨：吃完再走。外面在下雨。':'阿姨：吃完再走。';
    check('4. 期末最後一頓（大二上）：（桌上多了一碟小黃瓜。沒有人點。）阿姨「吃完再走。」（AA_519 1-3；AA_467 第 1 節原本換成「吃好一點。」）；Alison 和阿哲坐一起；以安「大二上：完成」；語彤「今天阿姨叫我坐下來吃。」（AB65-3：AA_211 附錄 A 語彤一列）',ok&&L.includes('（桌上多了一碟小黃瓜。沒有人點。）')&&L.includes(W519)&&!L.some(t=>/吃好一點/.test(t))&&L.includes('（Alison 和阿哲坐在一起。）')&&L.includes('（以安在手帳上寫：「大二上：完成」。）')&&L.some(t=>/語彤：今天阿姨叫我坐下來吃。$/.test(t))&&!L.some(t=>/不用端/.test(t)),JSON.stringify(L)); }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
