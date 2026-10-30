// 交接包 v2 C2：主線 2 親戚的土地資料（一）（AA_12 主線 2）——不需要瀏覽器。修改前沒有這個事件（第 1 項失敗）。
// 檢查：除夕（2026-02-16）12:00 以後有空就演（在哪裡都可以）、別天沒有；台詞照原文（{name} 換成玩家的名字）；三個選項的後續；FAMILY_LAND_Y1；
//   2D 背景（臺北家裡的客廳、陽台；2026-10-14 祐廷改成臺北人，原本是嘉義老家）；除夕還沒演就上床＝睡覺時演；不寫真實地號（台詞裡沒有數字地號）
//   ＋可昕 KN 除夕的訊息（BB_96 9-2；AA_295 不是假設題了）：主線 2 演完以後 22:00；三個回覆（「家裡在講一件事」只在有 FAMILY_LAND_Y1）、之後兩個選項、KX_FAMILY_LAND；不回＝隔天 9:00 一句
// 用法：node tests/v2_c2_unit.js
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
  const e=ev('ev_chiayi_land_y1'), eb=ev('ev_chiayi_land_y1_bed');
  check('C2：除夕的事件（白天、上床）都在',!!e&&!!eb);
  if(!e||!eb){ console.log('FAILED '+fails); process.exit(1); }
  const EVE=STORY.lunarNewYear()-1, x=CALENDAR.dateOf(EVE);
  check('除夕＝2026-02-16（CALENDAR 的「除夕」）',x.y===2026&&x.m===2&&x.d===16&&CALENDAR.holiday(EVE)==='除夕',JSON.stringify(x));
  { const at=(day,h,zone,flags)=>{ fresh(day,h,zone||'dorm',flags); return EVENTS.check(e); };
    const r={dorm:at(EVE,18),campus:at(EVE,12.5,'campus'),morning:at(EVE,11),next:at(EVE+1,18),prev:at(EVE-1,18),done:at(EVE,18,'dorm',{FAMILY_LAND_Y1:'ask'})};
    check('除夕 12:00 以後、在哪裡都演（宿舍、校園）；早上 11 點、初一、前一天、已經演過都沒有',r.dorm&&r.campus&&!r.morning&&!r.next&&!r.prev&&!r.done,JSON.stringify(r));
    check('固定節點：auto（不用找人說話）',e.trigger==='auto'&&e.location==='any'); }
  const play=async(pick)=>{ fresh(EVE,18,'dorm'); G.name='祐廷'; picks=[pick]; const h0=G.hour; await EVENTS.run(e); return {L:lines(),dh:G.hour-h0}; };
  let r=await play('回去問老師');
  const base=['除夕。臺北家裡的客廳，一桌親戚。','大伯從公事包裡拿出一疊影印的土地謄本。','大伯：祐廷念首都帝大法律喔？你不是從小就在看法律？來來來，你幫大伯看一下這個。','全桌安靜，看著你。','大伯：這塊地是你阿公留下來的，現在登記十四個人，有人要賣、有人不要。這怎麼辦？','你看了三秒。第一頁就是看不懂的地號。','小時候我也是這樣，翻得到，看不懂。不一樣的是，現在我知道要先問什麼：這塊地是誰的、他們之間是什麼關係、大家想要什麼。','媽媽：他才大一啦，你不要嚇他。','大伯：大一也是法律系啊。','姊姊在旁邊憋笑。','姊姊：（小聲）歡迎來到法律系的第一個寒假。'];
  check('前半照原文（大伯兩句、媽媽、大伯、姊姊；流程寫成旁白；祐廷心裡的話）',JSON.stringify(r.L.slice(0,base.length))===JSON.stringify(base),JSON.stringify(r.L.slice(0,base.length).filter((t,i)=>t!==base[i])));
  check('三個選項照原文',JSON.stringify(opts[0])==='["「大伯，我回去問老師。」","「我現在還看不懂。可是我知道要先問哪幾件事。」","「這要找律師。」"]',JSON.stringify(opts[0]));
  check('選「回去問老師」：大伯很高興「好好好，首都帝大的老師！」；FAMILY_LAND_Y1＝teacher；時間過了 2 小時',JSON.stringify(r.L.slice(base.length))==='["大伯很高興。","大伯：好好好，首都帝大的老師！"]'&&G.flags.FAMILY_LAND_Y1==='teacher'&&Math.abs(r.dh-2)<0.01,JSON.stringify(r.L.slice(base.length))+' '+r.dh);
  r=await play('先問哪幾件事');
  check('選「先問哪幾件事」：問了三個問題 → 大伯「……原來我們家連誰想賣都沒講清楚。」→ 全桌笑 → 陽台，姊姊「你從小遇到事情就去翻那本書。現在你會問問題了。」；ask',JSON.stringify(r.L.slice(base.length))===JSON.stringify(['你問了三個問題：誰的、什麼關係、大家想要什麼。','大伯答到一半，自己說：','大伯：……原來我們家連誰想賣都沒講清楚。','全桌笑。','姊姊：你從小遇到事情就去翻那本書。現在你會問問題了。'])&&G.flags.FAMILY_LAND_Y1==='ask',JSON.stringify(r.L.slice(base.length)));
  r=await play('找律師');
  check('選「找律師」：大伯「找律師要錢啊，你不就是嗎？」；lawyer',JSON.stringify(r.L.slice(base.length))==='["大伯：找律師要錢啊，你不就是嗎？"]'&&G.flags.FAMILY_LAND_Y1==='lawyer',JSON.stringify(r.L.slice(base.length)));
  { fresh(EVE,18,'dorm'); G.name='小明'; picks=[2]; await EVENTS.run(e); check('玩家改了名字：大伯叫的是玩家的名字',lines()[2]==='大伯：小明念首都帝大法律喔？你不是從小就在看法律？來來來，你幫大伯看一下這個。',lines()[2]); }
  check('2D 背景：除夕的客廳 home_living_cny（BB-B 第 25 組：年夜飯；10-18 換使用者生成的 home_dining_cny，只看檔案在）、陽台 home_balcony（第 26 組）都有圖；平常的客廳 home_living 不用除夕那張（ART-12 平常版）',!!OUT.BG.home_living_cny&&require('fs').existsSync(require('path').join(__dirname,'..',OUT.BG.home_living_cny.image))&&OUT.BG.home_balcony.image==='assets/bg/home_balcony.webp'&&e.dialogue[0].bg==='home_living_cny'&&OUT.BG.home_living.image!==OUT.BG.home_living_cny.image);
  check('不寫真實地號：台詞裡沒有數字地號（地號只說「看不懂的地號」）',!e.dialogue.some(l=>/\d{2,}/.test(String(l.text||'').replace('{name}',''))));
  { fresh(EVE,22.5,'dorm'); G.events.done={}; check('除夕還沒演就上床：睡覺時演（sleep）；演過了就沒有',EVENTS.sleepEvent()===eb&&(G.events.done.ev_chiayi_land_y1=1,EVENTS.sleepEvent()!==eb));
    fresh(EVE+1,0.5,'dorm'); check('過了午夜（已經是初一）上床：不演',EVENTS.sleepEvent()!==eb); }
  /* 可昕 KN（BB_96 9-2）*/
  { const NY=STORY.lunarNewYear(), askMsg=()=>(G.msgs||[]).find(m=>m.tag==='kx_kn_y1'&&m.ask);
    const kn=(land,flags)=>{ fresh(EVE,18,'dorm',Object.assign({dating_kexin:true},flags||{})); if(land) G.flags.FAMILY_LAND_Y1=land; run(18,22.2); return askMsg(); };
    let m=kn('ask'); const K=(G.msgs||[]).filter(q=>q.th==='p:kexin'&&q.tag==='kx_kn_y1').map(q=>(q.from||'')+':'+q.text);
    check('主線 2 演完（FAMILY_LAND_Y1）：22:00 可昕「你們家年夜飯吃完了嗎？」（AA_295；AA_313 第 2 節第 19 列：開頭的「新年快樂。」拿掉，電話裡說過了）；三個回覆',JSON.stringify(K)==='["kexin:你們家年夜飯吃完了嗎？"]'&&m&&Math.abs(m.h-22)<0.01&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["再吃一輪。","打給妳。","今天家裡在講一件事。"]',JSON.stringify(K)+' '+JSON.stringify(m&&m.ask.opts.map(o=>o.t)));
    m=kn(null); check('22:00 主線 2 還沒演：照樣傳，沒有「今天家裡在講一件事。」',m&&JSON.stringify(m.ask.opts.map(o=>o.t))==='["再吃一輪。","打給妳。"]',JSON.stringify(m&&m.ask.opts.map(o=>o.t)));
    fresh(EVE,18,'dorm',{FAMILY_LAND_Y1:'ask'}); run(18,23); check('單身：沒有',!askMsg());
    m=kn('ask'); PHONE.answer(G,m.ask.id,0); check('「再吃一輪。」→「……我們家也還在吃。我阿嬤一直夾。」',txt('p:kexin').slice(-1)[0]==='kexin:……我們家也還在吃。我阿嬤一直夾。');
    m=kn('ask'); PHONE.answer(G,m.ask.id,1); check('「打給妳。」→「……好。我去陽台。」「（你打過去。她那邊的鞭炮聲還沒停。）」「早點睡。」（AA_313 第 2 節第 19 列：不再說一次「新年快樂。」）',JSON.stringify((G.msgs||[]).filter(q=>q.th==='p:kexin').slice(-3).map(q=>q.text))==='["……好。我去陽台。","（你打過去。她那邊的鞭炮聲還沒停。）","早點睡。"]'&&(G.msgs||[]).filter(q=>q.th==='p:kexin'&&q.text==='新年快樂。').length===1,JSON.stringify((G.msgs||[]).filter(q=>q.th==='p:kexin').slice(-4).map(q=>q.text)));
    m=kn('ask'); PHONE.answer(G,m.ask.id,2); const m2=(G.msgs||[]).filter(q=>q.th==='p:kexin'&&q.ask).slice(-1)[0];
    check('「今天家裡在講一件事。」→「我可以只聽，也可以一起看。你選。」→ 兩個選項',m2&&m2.text==='我可以只聽，也可以一起看。你選。'&&JSON.stringify(m2.ask.opts.map(o=>o.t))==='["妳聽就好。","一起看。"]');
    PHONE.answer(G,m2.ask.id,0); check('「妳聽就好。」→（她聽你講完大伯、十四個名字、姊姊在旁邊憋笑。）「……你還好嗎？」「還好。有點好笑。」「那就好。」；KX_FAMILY_LAND＝listen',JSON.stringify((G.msgs||[]).filter(q=>q.th==='p:kexin').slice(-4).map(q=>(q.from||'')+':'+q.text))==='[":（她聽你講完大伯、十四個名字、姊姊在旁邊憋笑。）","kexin:……你還好嗎？","player:還好。有點好笑。","kexin:那就好。"]'&&G.flags.KX_FAMILY_LAND==='listen',JSON.stringify((G.msgs||[]).filter(q=>q.th==='p:kexin').slice(-4).map(q=>(q.from||'')+':'+q.text)));
    for(const [land,more] of [['ask',true],['teacher',false]]){ m=kn(land); PHONE.answer(G,m.ask.id,2); const q2=(G.msgs||[]).filter(q=>q.th==='p:kexin'&&q.ask).slice(-1)[0]; PHONE.answer(G,q2.ask.id,1);
      const L=(G.msgs||[]).filter(q=>q.th==='p:kexin').map(q=>q.text); const has=L.includes('……可是你先問了大家想要什麼。這很好。');
      check('「一起看。」（主線 2 選 '+land+'）：傳謄本照片（地號遮住）→「我們還沒教到物權。所以先查清楚，不要猜。」'+(more?'＋「……可是你先問了大家想要什麼。這很好。」':'（沒有多的那一句）')+'；KX_FAMILY_LAND＝look',L.includes('📷（土地謄本，地號遮住）')&&L.includes('我們還沒教到物權。所以先查清楚，不要猜。')&&has===more&&G.flags.KX_FAMILY_LAND==='look'); }
    m=kn('lawyer'); G.day=NY; run(8.5,9.2); const L=txt('p:kexin');
    check('不回：初一 9:00「新年快樂。……昨天講到一半，我先睡著了。」；之後不能再回',L.slice(-1)[0]==='kexin:新年快樂。……昨天講到一半，我先睡著了。'&&!PHONE.askOpen(G,askMsg()),JSON.stringify(L.slice(-2)));
    m=kn('lawyer'); PHONE.answer(G,m.ask.id,0); G.day=NY; run(8.5,9.5); check('回過了：初一沒有那一句',!txt('p:kexin').some(t=>/昨天講到一半/.test(t))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
