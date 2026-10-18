// LIFE-LINE 第 5 組（AA_224 5-0～5-4 @31708531；機制 BB_188 A9-1）——不需要瀏覽器。
// 2/12 20:00 E23（書放在書桌上、不回宿舍）→ 2/13 19:00 公館的水餃店 E27（固定出遊、祐廷提出、RETAKE_TOGETHER）→ 22:30 經濟系群組 E28（只宣布重考）→
// 23:00 阿勳私訊 E24c（E24C_REASON honest／short／later）→ 2/21 群組 T3＋22:00 唐睿私訊。舊的 3/26 E27、E28、3/13 E24c、小福的 T3 不再發生。改版前會失敗。
// 用法：node tests/lifeline_g5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|NEEDED_MSGS|ROM)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js','src/romance3d.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/story3d.js','src/classes3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
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
(async()=>{
  const DK=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
  const econ=(day,hour,zone,flags)=>{ fresh(day,hour,zone,Object.assign({dating_kexin:true,Y0_DATING:true,KX_CAR:'only_me',LEAVE_WEEK:6,Y0_MOVED_OUT:true,CRAM_FREE_KNOWN:true},flags||{})); G.stage='econ'; G.flags.LIFELINE_V=1; };
  const d12=DK('2025-02-12'), d13=DK('2025-02-13');
  /* E23 */
  { const e=ev('ev_y0_e23'); econ(d12,19.9,'home',{}); const a=EVENTS.check(e); G.hour=20; const b=EVENTS.check(e); G.day=d13; G.hour=10; const c=EVENTS.check(e); G.hour=18.2; const x=EVENTS.check(e);
    G.day=d12; G.hour=20; await EVENTS.run(e); const L=lines();
    check('5-1 E23：2/12 20:00 在家（19:59 不會；隔天 18:00 以前回家也會；之後不會）、最後「（你把書拿下來，放在書桌上。這次沒有放回去。）」、沒有行李箱',!a&&b&&c&&!x&&L[L.length-1]==='（你把書拿下來，放在書桌上。這次沒有放回去。）'&&!L.join('').includes('行李箱'),J([a,b,c,x,L.slice(-2)])); }
  /* E27 */
  { econ(d12,10,'home',{}); run(10,10.1); const q=OUT.get(G,'y0_e27');
    check('5-1 E27 固定出遊：2/13 14:00 行政大樓（AA_303 第 17 場：陪她辦休學）、must（只有「出發」）',q&&q.day===d13&&q.h===14&&q.place==='行政大樓'&&q.must===true&&q.ev==='ev_y0_e27',J(q));
    econ(d13,19,'home',{E22B_TOLD:false}); picks=['歡迎']; await EVENTS.run(ev('ev_y0_e27')); const L=lines();
    check('5-1 E27（AA_303 第 17 場）：行政大樓「（二月十三日，行政大樓。你陪她來的。）」→「……十五分鐘。跟你那時候一樣。」→ 水餃店「從今天開始，我們兩個都是休學的人了。」→「歡迎。」→「……一點都不想被歡迎。」；休學原因、一起重考不在這裡（在高雄）；RETAKE_TOGETHER、E27_DAY、E27B_PLAN',
      L[0]==='（二月十三日，行政大樓。你陪她來的。）'&&L.includes('杜可昕：……十五分鐘。跟你那時候一樣。')&&L.includes('杜可昕：從今天開始，我們兩個都是休學的人了。')&&L.includes('杜可昕：……一點都不想被歡迎。')&&!L.some(t=>/國文那份報告|你是說真的/.test(t))&&G.flags.RETAKE_TOGETHER===true&&G.flags.E27_DAY!=null&&G.flags.E27B_PLAN===true,J(L));
    { const s0=opts.slice(); G.events.done.ev_y0_e27=1; G.hour=22; run(22,22.1); const qb=OUT.get(G,'y0_e27b');
      check('5-1 E27b（AA_272 8-2）：E27 演完排 2/14 15:00 以前的補習班（固定、must）',!!qb&&qb.day===d13+1&&qb.h===15&&qb.must===true&&qb.ev==='ev_y0_e27b',J(qb));
      G.day=d13+1; G.hour=15.3; const c=STORY.homeCall(G); check('5-1 E27b 15:15 還沒出發：可昕電話「我在補習班樓下了。你呢？」',!!c&&c.q===qb&&c.line==='我在補習班樓下了。你呢？',J(c&&c.line));
      said=[]; opts=[]; picks=['那我也在家讀']; await EVENTS.run(ev('ev_y0_e27b')); const Lb=lines();
      check('5-1 E27b：櫃台（AA_272 8-2 52c73c73：進去幫她問、管理說沒有社會科分數不行、全年二十萬剩下十三萬；沒有免費標準、沒有十二萬八）→ 飲料店「你去上啊。你免費耶。」→ 三選一「那我也在家讀。」→「……好。在家讀。」→「所以說好了。每天早上，比誰先坐到桌子前面。」「輸的人請早餐。……我不會輸。」（AA_293 第 9 節）、CRAM_ASKED_TOGETHER',
        Lb[0]==='（同一個櫃台。上次那個工作人員認得你。）'&&Lb.includes('工作人員：不好意思。管理那邊說，沒有社會科的分數，就沒辦法。')&&Lb.includes('工作人員：要上的話，全年班原本是二十萬。現在二月了，前面的課已經上掉一大半，剩下的算妳十三萬。')&&Lb.includes('杜可昕：十三萬。')&&!Lb.join('').includes('十二萬八')&&!Lb.join('').includes('差四分以內')&&Lb.includes('杜可昕：你去上啊。你免費耶。')&&Lb.includes('杜可昕：……好。在家讀。')&&Lb.includes('杜可昕：所以說好了。每天早上，比誰先坐到桌子前面。')&&Lb[Lb.length-1]==='杜可昕：輸的人請早餐。……我不會輸。'&&G.flags.CRAM_ASKED_TOGETHER===true&&opts[0].length===3,J(Lb));
      opts=s0; }
    check('5-1 E27 兩個選項（「歡迎。」「明天去問補習班。」）',opts[0].length===2&&opts[0].every(t=>t.startsWith('「')));
    { econ(DK('2025-02-02'),15,'home',{}); picks=['我要再考一次']; said=[]; await EVENTS.run(ev('ev_y0_kh3')); const K=lines();
      check('5-1 高雄三天兩夜（AA_303 第 15 場）：「（大年初三。你開了四個多小時的車到高雄……）」→ 蓮池潭「我在想要不要休學。」→ 三選一（祐廷提）→「先說好。我考法律，不是因為你。」→「那回台北，一起去問。」；RETAKE_TOGETHER、E27B_PLAN',K[0].startsWith('（大年初三。')&&K.includes('杜可昕：我在想要不要休學。')&&K.includes('杜可昕：好。一起。')&&K[K.length-1]==='杜可昕：那回台北，一起去問。'&&G.flags.RETAKE_TOGETHER===true&&G.flags.E27B_PLAN===true,J(K)); }
    econ(d13,19,'home',{CRAM_FREE_KNOWN:false}); picks=['一起考吧']; await EVENTS.run(ev('ev_y0_e27')); const L2=lines();
    check('5-1 沒有 CRAM_FREE_KNOWN（防呆）：沒有「你十二月去補習班那天」的選項、沒有「那間補習班說我可以免費」，照樣說好',opts[0].length===2&&!L2.join('').includes('補習班')&&G.flags.RETAKE_TOGETHER===true); }
  /* E28、E24c */
  { econ(d13,22.4,'home',{RETAKE_TOGETHER:true,BIKE_LOOKED_UP:true}); run(22.4,22.6); const gid=PHONE.inGroup(G,'econ_friends')?'g:econ_friends':'g:econ_class', m=txt(gid);
    check('5-3 E28 22:30 經濟系群組：祐廷「我跟可昕要重考。」…品妤「可昕跟我說了。……」可昕「妳可以跟唐睿。」…韋綸（腳踏車查過也一樣，AA_305 第 8 節拿掉「腳踏車那次欠的」）「考完要說。我請你們吃飯。」；ev_y0_e28 標演過',m[0]==='player:我跟可昕要重考。'&&m.includes('econ_pinyu:可昕跟我說了。……那下學期分組誰要跟我。')&&m.includes('kexin:妳可以跟唐睿。')&&m[m.length-1]==='econ_weilun:考完要說。我請你們吃飯。'&&!!G.events.done.ev_y0_e28&&!!ev('ev_y0_e28').retired,J(m));
    run(22.9,23.1); const q=(G.msgs||[]).find(x=>x.ask&&x.ask.id==='y0_e24c_why');
    check('5-2 E24c 23:00 阿勳私訊「欸。群組不好問。」「你為什麼要重考？我是認真問。」＋三個說法',!!q&&q.text==='你為什麼要重考？我是認真問。'&&q.ask.opts.length===3&&txt('p:econ_zhengxun')[0]==='econ_zhengxun:欸。群組不好問。');
    PHONE.answer(G,'y0_e24c_why',0); const t=txt('p:econ_zhengxun');
    check('5-2 honest：「……差四分喔。那很煩。」「考上要請保齡球。」、E24C_REASON honest；ev_y0_e24c 標演過、舊的 3/13 頂樓 retired',t.includes('econ_zhengxun:……差四分喔。那很煩。')&&G.flags.E24C_REASON==='honest'&&!!G.events.done.ev_y0_e24c&&!!ev('ev_y0_e24c').retired,J(t)); }
  { econ(d13,22.4,'home',{RETAKE_TOGETHER:true}); run(22.4,22.6); const gid=PHONE.inGroup(G,'econ_friends')?'g:econ_friends':'g:econ_class';
    check('5-3 沒查腳踏車：韋綸「考完要說。我請你們吃飯。」',txt(gid).slice(-1)[0]==='econ_weilun:考完要說。我請你們吃飯。'); }
  /* T3 */
  { const d=DK('2025-02-21'); econ(d,20.9,'home',{}); run(20.9,22.1); const tr=txt('p:econ_tangrui');
    check('5-4 T3：2/21 21:00 群組（品妤、韋綸）＋22:00 唐睿私訊「她說很實用。」「……這樣算成功嗎。」→「算。」／「下次送花。」；小福的現場版 retired',PHONE.sent(G,'y0_t3_miss')&&J(tr)===J(['econ_tangrui:她說很實用。','econ_tangrui:……這樣算成功嗎。'])&&!!ev('ev_y0_t3').retired,J(tr));
    PHONE.answer(G,'y0_t3_tr',1); check('5-4「下次送花。」→「花不能按。」',txt('p:econ_tangrui').slice(-1)[0]==='econ_tangrui:花不能按。'); }
  /* 舊的不再發生 */
  { const d=DK('2025-03-26'); econ(d,12,'campus',{RETAKE_TOGETHER:true}); run(12,22.5);
    check('舊 3/26 的 E27（總圖門口）、E28（宵夜攤）不再排',!PHONE.sent(G,'y0_e27_ask')&&!PHONE.sent(G,'y0_e28_ask')&&!OUT.get(G,'y0_e28')); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
