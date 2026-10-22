// LIFE-LINE 第 3 組（AA_224 3-1～3-10 @31708531；休學在家、交往中的經濟系那幾個月）——不需要瀏覽器。
// E12「你經濟系的……喔，你休學了」、E14 品妤「交往中的人不能互換」、E18 唐睿「你上次那顆直球也是」、E18a 改成 12/3 21:30 私訊＋總圖門口 22:00（豆花）、
// E20「家裡的鑰匙」＋E20b 改在公館（12/28 20:00 放家裡信箱）、E21a 市府站 23:00（AA_293 第 7 節）、E22b 12/20 公館的咖啡店、E24 2/8「法律。」、腳踏車「（查完再回）」、
// E21 除夕交往中的電話（第三個選項要 KX_THINK_LEAVE）、10 月下旬社科院門口阿勳「休學的來了」。改版前會失敗。用法：node tests/lifeline_g3_unit.js
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
  const DK=k=>STORY.dayOfKey(k);
  const econ=(day,hour,zone,flags)=>{ fresh(day,hour,zone,Object.assign({dating_kexin:true,Y0_DATING:true,KX_CAR:'only_me',LEAVE_WEEK:6,Y0_MOVED_OUT:true},flags||{})); G.stage='econ'; G.flags.LIFELINE_V=1; };
  const J=x=>JSON.stringify(x), dl=id=>J(ev(id).dialogue);
  check('3-1 E12 手機版改 AA_307 第 10 列（「……休學的人好羨慕。」）：「你經濟系的，算一下。……喔，你休學了。那我自己算。」不再出現；湖邊版 AA_303 第 2 節 12 整段換（沒有這題）',!dl('ev_y0_e12').includes('你經濟系的，算一下。……喔，你休學了。那我自己算。')&&dl('ev_y0_e12').includes('休學的人，今天做了什麼？')&&require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8').includes("K('……休學的人好羨慕。')")&&!require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8').includes("K('對！所以學校要多一筆預算。你經濟系的，算一下。……喔，你休學了。那我自己算。')"));
  check('3-2 E14（AA_293 4-1：搬到 9/13 還不熟的時候）：「這件比較好看。」後面品妤「不能自己挑。要抽。」可昕「我沒有抽。所以沒有違規。」',(()=>{ const D=ev('ev_y0_e14').dialogue.map(x=>x.text); const i=D.indexOf('這件比較好看。'); return D[i+1]==='不能自己挑。要抽。'&&D[i+2]==='我沒有抽。所以沒有違規。'; })());
  check('3-3 E18 唐睿 b：「她什麼都接得住。……你上次那顆直球也是。」',dl('ev_y0_e18').includes('她什麼都接得住。……你上次那顆直球也是。')&&!dl('ev_y0_e18').includes('除了直球'));
  /* E18a */
  { const d3=DK('2024-12-03'); econ(d3,21.4,'home',{}); run(21.4,21.6); const q=OUT.get(G,'y0_e18a');
    check('3-4 12/3 21:30 私訊「我在總圖讀到十點。」「豆花店還開著。……我只是餓了。」＋出發選單「總圖門口 22:00」',J(txt('p:kexin'))===J(['kexin:我在總圖讀到十點。','kexin:豆花店還開著。……我只是餓了。'])&&q&&q.h===22&&q.place==='總圖門口',J([txt('p:kexin'),q]));
    picks=['坐妳對面']; await EVENTS.run(ev('ev_y0_e18a')); const L=lines();
    check('3-4 E18a：總圖門口「你真的來了。休學的人很閒耶。」→ 豆花店「你沒休學的話……」→「好答案。很像你。」、E18A_DOUHUA、標題「豆花」、不在總圖裡面',L.includes('杜可昕：你真的來了。休學的人很閒耶。')&&L.includes('杜可昕：你沒休學的話，現在會在裡面陪我讀嗎？')&&L.includes('杜可昕：好答案。很像你。')&&G.flags.E18A_DOUHUA===true&&ev('ev_y0_e18a').title==='豆花'&&ev('ev_y0_e18a').trigger==='outing',L.join('｜')); }
  /* E20、E20b */
  check('3-5 E20：「你把它掛在家裡的鑰匙上。」',dl('ev_y0_e20').includes('你把它掛在家裡的鑰匙上。')&&!dl('ev_y0_e20').includes('宿舍的鑰匙'));
  { econ(DK('2024-12-27'),15,'gongguan',{}); const e=ev('ev_y0_e20b'); const ok1=EVENTS.check(e); G.day=DK('2024-12-28'); G.hour=20.5; const ok2=EVENTS.check(e); G.day=DK('2024-12-26'); G.hour=12; G.zone='campus'; const ok3=EVENTS.check(e);
    check('3-5 E20b：12/26～12/28 走進公館就演（12/27 公館＝可以；12/28 20:00 以後不行；在校園不行）',ok1&&!ok2&&!ok3,J([ok1,ok2,ok3])); }
  { const w=DK('2024-12-25'); econ(w+3,19.5,'home',{}); run(19.5,20.5); const m=txt('p:kexin');
    check('3-5 12/28 20:00 沒去公館：「你的份，我放在你家信箱了。」',m.includes('kexin:你的份，我放在你家信箱了。')&&!G.flags.GIRAFFE_KEYCHAIN,J(m));
    G.day=w+4; G.hour=7; run(7,7.2); check('3-5 隔天早上拿到長頸鹿鑰匙圈',G.flags.GIRAFFE_KEYCHAIN===true); }
  /* E21a */
  { const d=DK('2024-12-31'); econ(d,18.9,'home',{}); run(18.9,19.2); const gid=PHONE.inGroup(G,'econ_friends')?'g:econ_friends':'g:econ_class', m=txt(gid), q=OUT.get(G,'y0_e21a');
    check('3-6 12/31 19:00 群組三則（AA_293 第 7 節：放假一個多禮拜、市府站二號出口，不提總圖、不提念書）＋出發選單「市府站 23:00：跨年」',m.length===3&&m[2].endsWith('十一點，市府站二號出口。')&&!m.join('').includes('總圖')&&q&&q.h===23&&q.title==='市府站 23:00：跨年',J([m,q]));
    opts=[]; await EVENTS.run(ev('ev_y0_e21a')); const L=lines();
    check('3-6 E21a（AA_293 第 7 節；AA_303 第 2 節 13）：「（十一點，市府站。人已經多到要排隊出站。）」…手放進你的外套口袋 → 倒數、大家喊新年快樂 → 可昕「新年快樂。」祐廷「新年快樂。」（沒有選項、沒有「我怕走散」）、E21A_WENT；沒有「書會等我」「今年最好的一件事」',L[0]==='（十一點，市府站。人已經多到要排隊出站。）'&&L.includes('（信義區的人潮。可昕把手塞進你的外套口袋。）')&&L.includes('（倒數。煙火。大家一起喊：「新年快樂！」）')&&L.slice(-2).join('｜')==='杜可昕：新年快樂。｜祐廷：新年快樂。'&&!opts.length&&!L.join('').includes('我怕走散')&&!L.join('').includes('書會')&&G.flags.E21A_WENT===true&&!L.join('').includes('最好的一件事'),L.join('｜'));
    econ(d,18.9,'home',{}); run(18.9,19.2); G.day=d+1; G.hour=0.2; run(0.2,0.3); check('3-6 沒去：可昕「新年快樂。你錯過了一場人潮。……下次你要來。」',txt('p:kexin').includes('kexin:新年快樂。你錯過了一場人潮。……下次你要來。'),J(txt('p:kexin'))); }
  /* E22b */
  { const d=DK('2024-12-20'); econ(d,9,'home',{CRAM_FREE_KNOWN:true}); run(9,9.1); const q=OUT.get(G,'y0_e22b');
    econ(d,9,'home',{}); run(9,9.1); const q0=OUT.get(G,'y0_e22b');
    check('3-7 12/20 出發選單「公館 17:00：等可昕下課」（12/13 補習班以後才有）',q&&q.h===17&&q.title==='公館 17:00：等可昕下課'&&!q0,J([q,q0]));
    econ(d,17,'home',{CRAM_FREE_KNOWN:true}); picks=['先看看']; await EVENTS.run(ev('ev_y0_e22b')); const L=lines();
    check('3-7 E22b：市立圖書館借的書、公館的咖啡店、「……你上禮拜說「還不知道」。」→「先看看而已。」→「先看看的書，你拿得很緊。」、E22B_TOLD false；不在總圖',L[0].includes('家附近的市立圖書館借的')&&L.includes('杜可昕：先看看的書，你拿得很緊。')&&G.flags.E22B_TOLD===false&&ev('ev_y0_e22b').location==='any',L.join('｜')); }
  /* E24 2/8 */
  { const d=DK('2025-02-08'); econ(d,22.9,'home',{}); run(22.9,23.1); const N=(G.msgs||[]).filter(x=>x.tag==='y0_e24n');
    check('3-8 AA_368 H3：2/8 23:00「我把高三的講義翻出來了。」「數學那本，每一頁都畫滿了。……我那時候到底在想什麼。」、沒有選項（原本「如果可以重來一次選科系」三選一：2/2 蓮池潭已經說好一起考法律、又是假設題）',J(N.map(x=>x.text))===J(['我把高三的講義翻出來了。','數學那本，每一頁都畫滿了。……我那時候到底在想什麼。'])&&N.every(x=>!x.ask),J(N.map(x=>x.text)));
    G.hour=23.2; run(23.2,23.6); const t=txt('p:kexin'); check('3-8 AA_368 H3：y0_e24n_late 拿掉（之後沒有「好。」「……我是在問我自己。晚安。」）',!PHONE.sent(G,'y0_e24n_late')&&!t.includes('kexin:……我是在問我自己。晚安。'),J(t.slice(-3))); }
  check('3-9 腳踏車：「（查完再回）」（他在家查）',(()=>{ const src=require('fs').readFileSync(require('path').join(ROOT,'src/story3d.js'),'utf8'); return src.includes("{t:'（查完再回）',")&&!src.includes("{t:'（去總圖查完再回）',"); })());
  /* E21 除夕 */
  { const d=DK('2025-01-28'); econ(d,22,'home',{}); picks=['我媽會問']; await EVENTS.run(ev('ev_y0_e21')); const L=lines(), O=opts[0];
    check('3-10 除夕（AA_303 第 2 節 14）：「（電話。很吵。）」…「好了。……新年快樂。」「初三你要不要來高雄？開車來。我帶你去玩。」→ 兩個選項「好。」「我媽會問我去哪。」→「說去找女朋友。……初三，不准遲到。」、KH_TRIP；沒有阿嬤、沒有「不是假設」、沒有「不然要在一起嗎」',L[0]==='（電話。很吵。）'&&L.includes('杜可昕：好了。……新年快樂。')&&L.includes('杜可昕：初三你要不要來高雄？開車來。我帶你去玩。')&&J(O)===J(['「好。」','「我媽會問我去哪。」'])&&L[L.length-1]==='杜可昕：說去找女朋友。……初三，不准遲到。'&&G.flags.KH_TRIP===true&&G.flags.E21_CALLED===true&&!L.join('').includes('阿嬤')&&!L.join('').includes('不是假設')&&!L.join('').includes('不然要在一起'),J([O,L]));
    econ(d,22,'home',{KX_THINK_LEAVE:'wait'}); picks=['好。']; await EVENTS.run(ev('ev_y0_e21')); const L2=lines();
    check('3-10 「好。」→「那初三早上出發。到了打給我。」、KH_TRIP；她說過在想休學（KX_THINK_LEAVE）也只有兩個選項（AA_303：第三個選項拿掉）',opts[0].length===2&&L2[L2.length-1]==='杜可昕：那初三早上出發。到了打給我。'&&G.flags.KH_TRIP===true&&!L2.join('').includes('跟家裡說了嗎'),J([opts[0],L2.slice(-2)])); }
  /* 社科院門口 */
  { const e=ev('ev_y0_soc_door'); econ(DK('2024-11-04'),12,'campus',{}); const a=e.prereq.custom(G); G.day=DK('2024-11-16'); const b=e.prereq.custom(G); G.day=DK('2024-11-04'); delete G.flags.LEAVE_WEEK; const c=e.prereq.custom(G); G.flags.LEAVE_WEEK=6; G.day=DK('2024-10-24'); const d0=e.prereq.custom(G);
    check('共同前提 A2-1b：搬家以後（11/1～11/15；AA_305：10/29 以前大家都不知道、10/31 才搬）在社科院門口＝阿勳「休學的來了。」「……然後還交了女朋友。你休學是去修這個學分喔。」；10 月、11/16 以後不演',a&&!b&&!c&&!d0&&dl('ev_y0_soc_door').includes('休學的來了。')&&dl('ev_y0_soc_door').includes('你休學是去修這個學分喔。'),J([a,b,c,d0])); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
