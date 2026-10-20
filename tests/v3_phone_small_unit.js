// 大二的手機小事（BB_97 第 5 節＋9-16；任務 V3-B22）——不需要瀏覽器。
// 檢查：大二才有（大一、經濟系沒有）；學姊值班表、Kevin「學姊卸任了！」接在 W6 交接之後；子晴 LAB_LETTER 五則；芷若 Z7 之後、Z9 之前（單身 22:07、交往中 15:10）；可昕（交往中）照學期、下雨那則只在下雨；邵鈞那則兩種；第三隻手三個條件都成立才有、可以回。用法：node tests/v3_phone_small_unit.js
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
  const only=(id,day,flags,setup,h0,h1)=>{ fresh(day,h0==null?7.5:h0,'campus',Object.assign({},flags)); if(setup) setup(); const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(d=>d.id===id));
    try{ run(h0==null?7.5:h0,h1==null?26.5:h1); } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); } return (G.msgs||[]).filter(m=>m.tag&&m.tag.startsWith('dp_'+id+'_')); };
  const T=ms=>ms.map(m=>(m.from||'')+':'+m.text).join('｜');
  const W5=termDay('Y2S1',5,2), W7=termDay('Y2S1',7,2), Y1=termDay('Y1S1',5,2), B5=termDay('Y2S2',5,2);
  const done=ids=>{ for(const i of ids) G.events.done[i]=1; };
  let m=only('y2_sis_shift',W5,{},()=>{ done(['ev_sis_handover']); PHONE.join(G,'lawclub_study','法服讀書會'); });
  check('1. 學姊值班表那則拿掉了（W6 交接刪了，BB_191 §7-3；法服沒有讀書會）：舊存檔演過交接也不送',m.length===0&&!STORY.DAILY_PHONE.some(d=>d.id==='y2_sis_shift'),T(m));
  m=only('y2_kevin_retire',W5,{},()=>{ done(['ev_sis_handover']); PHONE.join(G,'family_law','法律系直屬家族'); });
  check('2. 家族群組「學姊卸任了！」拿掉了（她在祐廷大一時已經是前任社長，BB_191 §7-3）：舊存檔演過 W6 也不送',m.length===0&&!STORY.DAILY_PHONE.some(d=>d.id==='y2_kevin_retire'),T(m));
  m=only('y2_sis_hotwater',W5,{HOT_WATER:true},()=>{ PHONE.join(G,'family_law','法律系直屬家族'); });
  check('2. 學姊（選了熱水）家族群組改 Kevin 起頭（BB_205 第 4 節）：「📷（學姊桌上的保溫瓶）」「學姊今天裝熱水欸」→ 學姊「偶爾。」',T(m)==='kevin:📷（學姊桌上的保溫瓶）｜kevin:學姊今天裝熱水欸｜heroine_05:偶爾。',T(m));
  check('2. 學姊 M2 之後「今天讀了四章」大二不發（BB_205 第 4 節）',!STORY.DAILY_PHONE.some(d=>d.id==='y2_sis_m2read'));
  m=only('y2_sis_hotwater',W5,{},()=>{ PHONE.join(G,'family_law','法律系直屬家族'); }); check('2. 沒有 HOT_WATER：沒有',m.length===0);
  m=only('y2_zq_lab',W5,{},()=>{ SOCIAL.remember('heroine_04','LAB_LETTER','x'); INV.rec(G); G.contacts.heroine_04=1; });
  check('3. 子晴（Q7 實驗室的信之後）五則：實驗室那封信 我回了（AA_328）｜說不要｜教授說好｜就這樣｜好簡單喔',T(m)==='heroine_04:實驗室那封信 我回了｜heroine_04:說不要｜heroine_04:教授說好｜heroine_04:就這樣｜heroine_04:好簡單喔',T(m));
  const zr=(flags)=>only('y2_zr_order',W5,flags,()=>{ done(['ev_zhiruo_applied']); INV.rec(G); G.contacts.heroine_02=1; });
  const a=zr({dating_kexin:false}), b=zr({dating_kexin:true});
  check('4. 芷若（Z7 之後、Z9 之前）「今天第三個客人點錯。我記得他上週點什麼。我沒說。」：單身 22:07、交往中 15:10',a.length===1&&Math.abs(a[0].h-(22+7/60))<0.06&&b.length===1&&Math.abs(b[0].h-(15+10/60))<0.06&&a[0].text==='今天第三個客人點錯。我記得他上週點什麼。我沒說。',JSON.stringify([a.map(x=>x.h),b.map(x=>x.h)]));
  const c=only('y2_zr_order',W5,{},()=>{ done(['ev_zhiruo_applied','ev_zhiruo_last_shift']); INV.rec(G); G.contacts.heroine_02=1; }); check('4. Z9 之後沒有',c.length===0);
  m=only('y2_kx_usual',W5,{dating_kexin:true}); const m2=only('y2_kx_usual',W5,{dating_kexin:false}), m3=only('y2_kx_usual',Y1,{dating_kexin:true}), m4=only('y2_kx_usual',B5,{dating_kexin:true});
  check('5. 可昕「午餐老樣子，山下那攤的酸辣湯餃。」（BB_97 9-16）：大二上、交往中才有（沒交往、大一、大二下都沒有）',T(m)==='kexin:午餐老樣子，山下那攤的酸辣湯餃。'&&!m2.length&&!m3.length&&!m4.length&&Math.abs(m[0].h-(21+10/60))<0.06);
  m=only('y2_kx_river',B5,{dating_kexin:true}); const r2=only('y2_kx_river',B5,{dating_kexin:true},()=>{ G.weather='rain'; });
  check('5. 大二下「今天下雨，山變成一條河。」只在下雨的日子',!m.length&&T(r2)==='kexin:今天下雨，山變成一條河。');
  m=only('y2_kx_index',W5,{dating_kexin:true}); const i2=only('y2_kx_index',W5,{dating_kexin:true},()=>{ SOCIAL.remember('kexin','ENC_D13_KX',''); });
  check('6. 邵鈞：還沒見過＝「我們系有一個人，考古題有目錄。目錄有索引。」；淡水遇過＝「邵鈞的考古題有目錄。目錄有索引。」',m[0].text==='我們系有一個人，考古題有目錄。目錄有索引。'&&i2[0].text==='邵鈞的考古題有目錄。目錄有索引。');
  const H=f=>only('y2_kx_hand',W7,Object.assign({dating_kexin:true,PLAYED_Y0:true,E12_ANSWER:'hand'},f));
  m=H({}); const h2=H({PLAYED_Y0:false}), h3=H({E12_ANSWER:'eye'}), h4=H({dating_kexin:false}), h5=only('y2_kx_hand',W5,{dating_kexin:true,PLAYED_Y0:true,E12_ANSWER:'hand'});
  check('7. 第三隻手：玩過經濟系、E12 選「第三隻手」、還在交往，第 6 週以後才有；少一個條件就沒有',m.length===1&&m[0].text==='我還在等你的第三隻手。'&&!h2.length&&!h3.length&&!h4.length&&!h5.length);
  m=H({}); G.hour=23; const ans=PHONE.answer(G,'dp_y2_kx_hand',0);
  check('7. 回「……長頸鹿的尾巴？」→「你記得。很好。尾巴還在等。」',!!ans&&txt('p:kexin').slice(-2).join('｜')==='player:……長頸鹿的尾巴？｜kexin:你記得。很好。尾巴還在等。',JSON.stringify(txt('p:kexin')));
  const econ=STORY.DAILY_PHONE.filter(d=>/^y2_/.test(d.id)).every(d=>!d.ok({flags:{dating_kexin:true},stage:'econ',events:{done:{}}},1));
  check('8. 經濟系那一年都沒有',econ);
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
