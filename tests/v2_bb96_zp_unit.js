// 交接包 v2（BB_96）：芷若 Z4「十點的電話」（3-4，改寫 ev_zhiruo_secret）＋沛珊 P3b「課輔班的下午」（3-3）——不需要瀏覽器。修改前 P3b 不存在、Z4 在 Café（第 1 項失敗）。
// 檢查：Z4 在大一下第 12 週以後的週六 14–18 溫州街（她那時候在那裡）、台詞照原文、沒有「你不要跟別人說」、三個選項的反應與數字（交往中第一個沒有 aff、第三個不扣 comf）、SHARED_SECRET、Z4_PICK；
//   P3b：第 5 週起週二四 16:30–18:00 走進溫州街、P2 之後、2D 背景、第二個選項只給去過讀書會的、三個反應、SAW_HER_TEACH
// 用法：node tests/v2_bb96_zp_unit.js
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
  const z=ev('ev_zhiruo_secret'), p=ev('ev_peishan_tutoring');
  check('Z4 在溫州街（不是 Café）、P3b 事件在',!!z&&z.location==='wenzhou'&&!!p);
  if(!z||!p){ console.log('FAILED '+fails); process.exit(1); }
  /* Z4 */
  { const at=(term,w,wd,h,zone,fam)=>{ fresh(termDay(term,w,wd),h,zone||'wenzhou'); SOCIAL.meet('heroine_02','cafe'); R('heroine_02',fam==null?25:fam); return EVENTS.check(z); };
    const r={ok:at('Y1S2',12,6,15),w16:at('Y1S2',15,6,17.5),w11:at('Y1S2',10,6,15),w16b:at('Y1S2',16,6,15),sun:at('Y1S2',12,7,15),late:at('Y1S2',12,6,18.2),cafe:at('Y1S2',12,6,15,'cafe'),y1s1:at('Y1S1',12,6,15),acq:at('Y1S2',12,6,15,'wenzhou',10)};
    check('Z4：大一下第 11～15 週的週六 14–18（AA_243 #23）、溫州街、有點熟以上（第 10 週、第 16 週、週日、18:12、Café、大一上、只是認識都沒有）',r.ok&&r.w16&&!r.w11&&!r.w16b&&!r.sun&&!r.late&&!r.cafe&&!r.y1s1&&!r.acq,JSON.stringify(r));
    const sch=(CHARACTERS.heroine_02.daily_schedule||[]).find(e=>e.days.includes(6)&&e.zone==='wenzhou');
    check('她週六 14–18 照作息在溫州街（走得到）',!!sch&&sch.from<=14&&sch.to>=18,JSON.stringify(sch));
    const play=async(pick,dating)=>{ fresh(termDay('Y1S2',12,6),15,'wenzhou',dating?{dating_kexin:true}:{}); SOCIAL.meet('heroine_02','cafe'); R('heroine_02',25,10,10); const r0=Object.assign({},SOCIAL.rel('heroine_02')); picks=[pick]; await EVENTS.run(z); const r1=SOCIAL.rel('heroine_02'); return {L:lines(),d:{trust:r1.trust-r0.trust,aff:(r1.aff||0)-(r0.aff||0),comf:r1.comf-r0.comf,resp:(r1.resp||0)-(r0.resp||0)}}; };
    let r1=await play(0);
    const base=['林芷若：週六我都在溫州街。這裡的人不會問我週末在幹嘛。','林芷若：交換的申請，我拖了兩個月。不是懶。','林芷若：我媽每天晚上十點打給我。講店裡的事。','林芷若：誰來印考卷、哪一台又卡紙。','林芷若：我去英國的話，那邊是下午三點。','林芷若：……她十點要打給誰？'];
    check('Z4 台詞照原文；沒有「你不要跟別人說」',JSON.stringify(r1.L.slice(0,6))===JSON.stringify(base)&&!JSON.stringify(z.dialogue).includes('不要跟別人說'),JSON.stringify(r1.L.slice(0,6).filter((t,i)=>t!==base[i])));
    check('Z4 三個選項照原文',JSON.stringify(opts[0])==='["「妳想去嗎？」","「先交件再說，錄取了再煩惱。」","「家裡的事比較重要吧。」"]',JSON.stringify(opts[0]));
    check('「妳想去嗎？」：（她沉默很久。）「……想。」（捲頭髮三圈）「好可怕。說出來就變成真的了。」；trust+8 aff+3；SHARED_SECRET；Z4_PICK want',JSON.stringify(r1.L.slice(6))==='["她沉默很久。","林芷若：……想。","她用手指捲頭髮，捲了三圈。","林芷若：好可怕。說出來就變成真的了。"]'&&r1.d.trust===8&&r1.d.aff===3&&SOCIAL.has('heroine_02','SHARED_SECRET')&&G.flags.Z4_PICK==='want',JSON.stringify(r1.d));
    r1=await play(0,true); check('交往中「妳想去嗎？」：一樣的台詞，只有 trust+8（沒有 aff）',r1.L[r1.L.length-1]==='林芷若：好可怕。說出來就變成真的了。'&&r1.d.trust===8&&r1.d.aff===0&&JSON.stringify(opts[0]).split('妳想去嗎').length===2,JSON.stringify(r1.d)+' '+JSON.stringify(opts[0]));
    r1=await play(1); check('「先交件再說」：「你講得好簡單喔。」（AA_209）（她笑了。）「……可是你說得對。」；trust+5 resp+4',JSON.stringify(r1.L.slice(6))==='["林芷若：你講得好簡單喔。","她笑了。","林芷若：……可是你說得對。"]'&&r1.d.trust===5&&r1.d.resp===4&&G.flags.Z4_PICK==='apply',JSON.stringify(r1.d));
    r1=await play(2); check('「家裡的事比較重要吧。」：不扣分——「嗯。」（她點頭。）「我也這樣跟自己說了兩個月。」；trust+2、comf 沒有減',JSON.stringify(r1.L.slice(6))==='["林芷若：嗯。","她點頭。","林芷若：我也這樣跟自己說了兩個月。"]'&&r1.d.trust===2&&r1.d.comf>=0&&G.flags.Z4_PICK==='family',JSON.stringify(r1.d)); }
  /* P3b */
  { const at=(w,wd,h,o)=>{ o=o||{}; fresh(termDay('Y1S2',w,wd),h,o.zone||'wenzhou'); if(!o.noP2) G.events.done.ev_peishan_doubt=1; return EVENTS.check(p); };
    const r={ok:at(5,2,17),thu:at(9,4,16.6),w4:at(4,2,17),wed:at(5,3,17),early:at(5,2,16),late:at(5,2,18.1),noP2:at(5,2,17,{noP2:true}),gg:at(5,2,17,{zone:'gongguan'})};
    check('P3b：第 5 週起的週二、週四 16:30–18:00 走進溫州街、P2 之後（第 4 週、週三、16:00、18:06、沒有 P2、在公館都沒有）',r.ok&&r.thu&&!r.w4&&!r.wed&&!r.early&&!r.late&&!r.noP2&&!r.gg,JSON.stringify(r));
    check('P3b：走進溫州街就演（enter）；2D 背景「溫州街・課輔班門口」（不需要臨時位置）',p.trigger==='enter'&&p.dialogue[0].bg==='wenzhou_tutoring'&&!!OUT.BG.wenzhou_tutoring);
    const play=async(pick,club,formOnly)=>{ fresh(termDay('Y1S2',5,2),17,'wenzhou',club||formOnly?{CLUB_lawclub_study:true}:{}); if(club){ G.acts={att:{}}; G.acts.att['lawclub_study@'+(G.day-7)]={h:19}; } G.events.done.ev_peishan_doubt=1; picks=[pick]; await EVENTS.run(p); return lines(); };   /* BB_161 ④：去過讀書會＝出席紀錄；只有博覽會填表（CLUB_lawclub_study）不算 */
    let L=await play('開心');
    const nm=(CHARACTERS.classmate_peishan&&CHARACTERS.classmate_peishan.name)||'郭沛珊';
    check('P3b 台詞照原文',JSON.stringify(L.slice(0,4))===JSON.stringify(['她帶著一群國小生從課輔班走出來，手上拿著一疊作業本。',nm+'：喔，是你。我在這裡當志工。一週三天。','一個小孩拉她的衣角。她蹲下來聽他講完，站起來。',nm+'：……我在這裡的時候，不會看時間。']),JSON.stringify(L.slice(0,4)));
    check('沒去過讀書會：兩個選項（沒有「讀書會最近比較少看到妳」）',JSON.stringify(opts[0])==='["「妳看起來很開心。」","（幫她拿一半的作業本）"]',JSON.stringify(opts[0]));
    check('「妳看起來很開心。」：「有嗎。」（她想了一下。）「……有。」；SAW_HER_TEACH',JSON.stringify(L.slice(4))===JSON.stringify([nm+'：有嗎。','她想了一下。',nm+'：……有。'])&&SOCIAL.has('classmate_peishan','SAW_HER_TEACH'),JSON.stringify(L.slice(4)));
    { const Lf=await play('看起來',false,true); check('BB_161 ④：只在博覽會填了表、沒去過讀書會＝沒有「讀書會最近比較少看到妳。」',!opts[0].includes('「讀書會最近比較少看到妳。」'),JSON.stringify(opts[0])); }
    L=await play('讀書會',true); check('去過讀書會：多「讀書會最近比較少看到妳。」→「嗯。我還是會去，只是比較少。」（她不躲這個問題。）「我在找我比較想待的地方。」',JSON.stringify(opts[0])==='["「妳看起來很開心。」","「讀書會最近比較少看到妳。」","（幫她拿一半的作業本）"]'&&JSON.stringify(L.slice(4))===JSON.stringify([nm+'：嗯。我還是會去，只是比較少。','她不躲這個問題。',nm+'：我在找我比較想待的地方。']),JSON.stringify(L.slice(4)));
    L=await play('作業本'); check('（幫她拿一半的作業本）：「謝謝。……你走路很慢，跟小孩一樣。」（小孩們笑。）',JSON.stringify(L.slice(4))===JSON.stringify([nm+'：謝謝。……你走路很慢，跟小孩一樣。','小孩們笑。']),JSON.stringify(L.slice(4)));
    check('記憶的中文說明：SAW_HER_TEACH',!!SOCIAL.MEMORY_LABEL.SAW_HER_TEACH); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
