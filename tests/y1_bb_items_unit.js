// BB_106、BB_105 法律系大一那幾件（AA-C 2026-10-18 審過＝可以實作；企劃線 BB_106@71b3e6c3、BB_105@68a8479e；白名單 LAWWW-C 10-21 已登記）——不需要瀏覽器。
//   BB_106：SK06 特別感謝：法律系的路人（V2-SK06）、SK07 唐睿的即興劇（V2-SK07）、日常 D1 女舍門口的長椅＋D2 社科院—霖澤館—博雅的偶遇表（V1-B106-D1D2）、4-2 經濟系群組的三則（V1-B106-42）
//   BB_105：女舍 D4 還筆記、D4b 以安準時下樓、D7 宿舍的人們、D9 法服的攤位（V1-B105-D2）
// 修改前（y1b 19b4fb36）：每一項都會失敗。用法：node tests/y1_bb_items_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES|FREE_TRIPS|TRIP|ENCOUNTERS|ENC|CROWD)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js','src/crowd3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};
let said=[], opts=[], picks=[], caps=[], memos=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,removeNPC(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(who,t){ caps.push([who,t]); },sleep:()=>Promise.resolve(),memo(m){ memos.push(m); },autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },removeNPC(){},hasNote:()=>true,
  spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:id,name:spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>(q.t||q.text)+(q.hint?'〔'+q.hint+'〕':''))); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), TD=(t,w,wd)=>STORY.termDay?STORY.termDay(t,w,wd):null;
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,MAIN_D1:D('2025-09-03'),LAW_START_DAY:D('2025-08-29'),introDone:true,classDone:true,afternoonDone:true,metAn:true,AN_NAME_TOLD:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); if(EVENTS.zoneChanged) EVENTS.zoneChanged(); INV.rec(G); if(typeof ROM!=='undefined'&&ROM.rec) ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; memos=[]; GM.npc={}; E.npcs=[]; E.interactables=[]; E.player.obj.position={x:0,y:0,z:0}; ADV.active=false; return G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); if(typeof OUT!=='undefined') OUT.expire(G); } };
const setDay=(d,h)=>{ G.day=d; G.weekday=wdOf(d); G.hour=h; };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const has=(L,t)=>L.some(x=>x===t||x.endsWith('：'+t));
const RUN=async e=>{ if(e) await EVENTS.run(e); };
const B2={ key:(G,id)=>STORY.b106d2Key?STORY.b106d2Key(G,id):'(沒有)', due:(G,id)=>STORY.b106d2Due?STORY.b106d2Due(G,id):false, done:(G,id,k)=>{ if(STORY.b106d2Done) STORY.b106d2Done(G,id,k); }, term:G=>STORY.b106d2Term?STORY.b106d2Term(G):null };   /* 修改前這些函式不存在：各項照樣 FAIL，不整支當掉 */
const near=(id,dx)=>{ const n={id,charId:id,name:id,obj:{position:{x:E.player.obj.position.x+(dx||1),y:0,z:E.player.obj.position.z}},lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
(async()=>{
  const okId=id=>!!ev(id);
  // ======================= BB_106 =======================
  // ---- V2-SK06 特別感謝：法律系的路人 ----
  { const mon=TD('Y1S2',10,1), wed=mon+2, tue=mon+1;
    check('SK06：事件存在（ev_sk06_roadperson，大一下第 10～14 週週一三五 17:00～20:00，社科院大樓門口）',okId('ev_sk06_roadperson')&&J(ev('ev_sk06_roadperson').weeks)==='[10,11,12,13,14]'&&J(ev('ev_sk06_roadperson').weekday)==='[1,3,5]'&&ev('ev_sk06_roadperson').near&&ev('ev_sk06_roadperson').near.x===16);
    fresh(mon,15,'campus'); run(15,16.2);
    check('SK06：大一下第 10 週週一 16:00 品妤私訊「我們的報告卡在一個法律問題。社科院三樓討論室。一杯紅茶。」（加進聯絡人）',J(txt('p:econ_pinyu'))===J(['econ_pinyu:我們的報告卡在一個法律問題。社科院三樓討論室。一杯紅茶。'])&&G.contacts.econ_pinyu!=null,J(txt('p:econ_pinyu')));
    const E6=ev('ev_sk06_roadperson'); const ck=(d,h)=>{ setDay(d,h); return !!E6&&EVENTS.check(E6); };
    check('SK06：私訊以後週三 17:30 在校園＝可以開始；週二（補習班）、週一 15:00（私訊以前）不行',ck(wed,17.5)&&!ck(tue,17.5)&&!(()=>{ fresh(mon,15,'campus'); return E6&&EVENTS.check(E6); })(),'');
    const play=async(flags,pick)=>{ fresh(wed,17.5,'campus',Object.assign({SK06_DM_DAY:mon},flags||{})); picks=[pick]; await RUN(E6); return {L:lines(),F:G.flags,O:opts.slice()}; };
    let r=await play({PLAYED_Y0:true,MET_PINYU:true,KNOWS_TANG:true},'公立大學');
    check('SK06：開場三句「教授要「法律的觀點」。所以我們需要一個法律系的。」「所以我是被抽中的？」「你是被拍賣的。得標價，一杯紅茶。」',has(r.L,'教授要「法律的觀點」。所以我們需要一個法律系的。')&&has(r.L,'所以我是被抽中的？')&&has(r.L,'你是被拍賣的。得標價，一杯紅茶。'),J(r.L));
    check('SK06：三個選項（經濟學反問／法律的角度／找一個人來）',J(r.O[0])===J(['「先想想誰會被排擠：付不起的人。」〔用經濟學反問〕','「公立大學分配宿舍，要考慮平等，不能只看誰出得起錢。」〔用法律的角度〕','「我找一個人來。」']),J(r.O));
    check('SK06：選②＝品妤「這句放最後一頁。」；記 SOC_ROAD_PERSON、SK06_CHOICE=law；最後「特別感謝：法律系的路人」',has(r.L,'這句放最後一頁。')&&r.F.SOC_ROAD_PERSON===true&&r.F.SK06_CHOICE==='law'&&r.L.some(t=>/特別感謝：法律系的路人/.test(t)),J(r.L.slice(-3)));
    check('SK06：玩過經濟系那一年的、見過品妤的：不重新介紹（直接從「教授要「法律的觀點」」開始）',has(r.L,'教授要「法律的觀點」。所以我們需要一個法律系的。')&&!r.L.some(t=>/曾品妤。經濟系|全系最會講話/.test(t)),J(r.L.slice(0,4)));
    r=await play({PLAYED_Y0:true,MET_PINYU:true,KNOWS_TANG:true},'先想想');
    check('SK06：選①＝唐睿「……這是福利經濟學的問題。我們漏了。」',has(r.L,'……這是福利經濟學的問題。我們漏了。')&&r.F.SK06_CHOICE==='econ',J(r.L));
    r=await play({PLAYED_Y0:true,MET_PINYU:true,KNOWS_TANG:true},'我找一個人來');
    check('SK06：選③＝阿哲「用猜拳。」品妤「……其實那是抽籤的一種。」「唐睿把猜拳寫進了附錄。」',has(r.L,'用猜拳。')&&has(r.L,'……其實那是抽籤的一種。')&&r.L.includes('唐睿把猜拳寫進了附錄。'),J(r.L));
    r=await play({STICKY_NOTES:true,MET_PINYU:true},'公立大學');
    check('SK06：有 STICKY_NOTES＝桌上唐睿的便利貼「插座只有一個是好的。這次是真的。」',has(r.L,'插座只有一個是好的。這次是真的。'),J(r.L.slice(0,4)));
    r=await play({},'公立大學');
    check('SK06：從法律系開始、沒見過品妤和唐睿的玩家：先「曾品妤。經濟系，可昕以前的室友。」「唐睿。全系最會講話的那個。」；沒有便利貼',has(r.L,'曾品妤。經濟系，可昕以前的室友。')&&has(r.L,'唐睿。全系最會講話的那個。')&&!has(r.L,'插座只有一個是好的。這次是真的。')&&r.F.MET_PINYU===true&&r.F.MET_TANG===true,J(r.L.slice(0,5)));
    const d15=TD('Y1S2',15,1); fresh(mon,15,'campus'); run(15,16.2); setDay(d15,20.8); run(20.8,21.2);
    check('SK06 沒去：第 15 週週一 21:00「走啦」群組品妤「報告拿 A-。最後一頁謝了一個沒來的法律系路人。」，照樣記 SOC_ROAD_PERSON',txt('g:econ_friends').includes('econ_pinyu:報告拿 A-。最後一頁謝了一個沒來的法律系路人。')&&G.flags.SOC_ROAD_PERSON===true,J(txt('g:econ_friends').slice(-2))); }
  // ---- V2-SK07 唐睿的即興劇 ----
  { const mon=TD('Y1S2',14,1), wed=mon+2;
    fresh(mon,20.5,'campus'); run(20.5,21.2); const q=OUT.get(G,'sk07_improv');
    check('SK07：大一下第 14 週週一 21:00 群組唐睿「給我一個觀眾。一個就好。」＋排進行程：週三 19:00 博思',txt('g:econ_friends').includes('econ_tangrui:給我一個觀眾。一個就好。')&&!!q&&q.day===wed&&q.h===19&&q.ev==='ev_sk07_improv',J({g:txt('g:econ_friends').slice(-1),q}));
    const E7=ev('ev_sk07_improv'); const play=async(flags,pick)=>{ fresh(wed,19,'campus',flags); picks=[pick]; await RUN(E7); return {L:lines(),F:G.flags,O:opts.slice()}; };
    let r=await play({PLAYED_Y0:true,E12_ANSWER:'how',MET_PINYU:true,KNOWS_TANG:true},'善意第三人');
    check('SK07：玩過經濟系、知道長頸鹿的尾巴：三個詞；選①＝唐睿演一直說「我不知道」的路人、IMPROV_WORD=善意第三人',J(r.O[0])===J(['「善意第三人！」','「機會成本！」','「長頸鹿的尾巴！」'])&&r.L.includes('唐睿演一個一直買到怪東西、每次都說「我不知道」的路人。')&&r.F.IMPROV_WORD==='善意第三人',J(r.O));
    check('SK07：散場品妤「他說是為了練膽量。我覺得是為了社辦的冷氣。」',has(r.L,'他說是為了練膽量。我覺得是為了社辦的冷氣。'),J(r.L.slice(-1)));
    r=await play({PLAYED_Y0:true,E12_ANSWER:'how',MET_PINYU:true,KNOWS_TANG:true},'長頸鹿');
    check('SK07：選③＝唐睿「……這個詞，有人用過了。」然後還是演了一隻長頸鹿',has(r.L,'……這個詞，有人用過了。')&&r.L.includes('然後還是演了一隻長頸鹿。')&&r.F.IMPROV_WORD==='長頸鹿的尾巴',J(r.L));
    r=await play({MET_PINYU:true,STICKY_NOTES:true},'機會成本');
    check('SK07：沒玩過經濟系大一＝沒有「長頸鹿的尾巴！」；選②演到學活的自助餐收攤',J(r.O[0])===J(['「善意第三人！」','「機會成本！」'])&&r.L.includes('唐睿演一個選不出午餐的人，演到學活的自助餐收攤。'),J(r.O));
    fresh(wed,19.5,'campus'); run(19.5,19.5); if(E7&&E7.outingMissed) E7.outingMissed(G,GM,{day:wed}); run(21.4,21.6);
    check('SK07 沒去：當晚品妤在群組傳影片「唐睿的即興劇，今天演一棵樹。演得很好。」',txt('g:econ_friends').includes('econ_pinyu:唐睿的即興劇，今天演一棵樹。演得很好。'),J(txt('g:econ_friends').slice(-2))); }
  // ---- V1-B106-42 經濟系群組的三則 ----
  { const d=TD('Y3S2',12,4);
    const photo=(flags)=>{ fresh(d,20.5,'campus',flags); run(20.5,21.2); return {T:txt('g:econ_friends'),m:PHONE.byAsk(G,'b106_42_photo')}; };
    let r=photo({KNOWS_TANG:true});
    check('4-2①：大三下第 12 週週四（5/11）21:00 韋綸貼畢業照：「等一下。放大第三排右邊。」品妤「不要問。」唐睿「是她先的。」品妤「唐睿。」唐睿「……是我先的。」',J(r.T.slice(-6))===J(['econ_weilun:📷（畢業照。照片的角落，唐睿和品妤撐同一把傘。）','econ_weilun:等一下。放大第三排右邊。','econ_pinyu:不要問。','econ_tangrui:是她先的。','econ_pinyu:唐睿。','econ_tangrui:……是我先的。']),J(r.T.slice(-6)));
    check('4-2①：有 KNOWS_TANG＝三個回覆（恭喜／鼓掌貼圖／「我們全系都知道。」）',!!r.m&&J(r.m.ask.opts.map(o=>o.t))===J(['「恭喜。」','（貼一張鼓掌的貼圖）','「我們全系都知道。」']),r.m&&J(r.m.ask.opts.map(o=>o.t)));
    PHONE.answer(G,'b106_42_photo',2); const T2=txt('g:econ_friends');
    check('4-2①：選③＝品妤「全系？」韋綸「全系。」阿勳「全系。」唐睿「我以為我藏得很好。」（沒有 TANG_REHEARSAL 就沒有「我練了四年」）',J(T2.slice(-5))===J(['player:我們全系都知道。','econ_pinyu:全系？','econ_weilun:全系。','econ_zhengxun:全系。','econ_tangrui:我以為我藏得很好。']),J(T2.slice(-5)));
    r=photo({KNOWS_TANG:true,TANG_REHEARSAL:true}); PHONE.answer(G,'b106_42_photo',2);
    check('4-2①：舊存檔有 TANG_REHEARSAL＝唐睿多一句「我練了四年。最後是她先說的。」',txt('g:econ_friends').slice(-1)[0]==='econ_tangrui:我練了四年。最後是她先說的。');
    r=photo({});
    check('4-2①：沒有 KNOWS_TANG＝只有兩個回覆',!!r.m&&r.m.ask.opts.length===2,r.m&&J(r.m.ask.opts.map(o=>o.t)));
    r=photo({dating_kexin:true,KNOWS_TANG:true});
    check('4-2①：交往中＝可昕「我大一就看出來了。只是那時候沒有人問我。」；分開／沒交往＝沒有',r.T.includes('kexin:我大一就看出來了。只是那時候沒有人問我。')&&!photo({EX_kexin:true}).T.some(t=>/^kexin:/.test(t)),J(r.T.slice(-2)));
    const d2=TD('Y4S1',4,2); fresh(d2,20.5,'campus',{dating_kexin:true}); run(20.5,21.2); let m=PHONE.byAsk(G,'b106_42_survey');
    check('4-2②：大四上第 4 週週二 21:00 唐睿「徵求座談的受試者：二十到三十歲、每週喝三杯以上手搖飲。車馬費五百。」，三個回覆',!!m&&m.text==='徵求座談的受試者：二十到三十歲、每週喝三杯以上手搖飲。車馬費五百。'&&J(m.ask.opts.map(o=>o.t))===J(['「法律系的可以嗎？」','「你現在在做什麼？」','（不回）']),m&&J(m.ask.opts.map(o=>o.t)));
    PHONE.answer(G,'b106_42_survey',0);
    check('4-2②：選①＝唐睿「不行。你們會反問主持人。」；交往中可昕「那木柵大學法律的呢？」唐睿「更不行。」',J(txt('g:econ_friends').slice(-4))===J(['player:法律系的可以嗎？','econ_tangrui:不行。你們會反問主持人。','kexin:那木柵大學法律的呢？','econ_tangrui:更不行。']),J(txt('g:econ_friends').slice(-4)));
    fresh(d2,20.5,'campus'); run(20.5,21.2); setDay(d2+1,21.1); run(21.1,21.3);
    check('4-2②：一直沒回＝隔天 21:00 以後品妤替他回答②那一句，加「他每天都這樣介紹自己。」',J(txt('g:econ_friends').slice(-2))===J(['econ_pinyu:「在一間做消費者研究的公司帶焦點座談。我還是在聽人講話，只是現在有人付錢。」','econ_pinyu:他每天都這樣介紹自己。']),J(txt('g:econ_friends').slice(-2)));
    const d3=TD('Y4S2',6,3), sat=d3+3; fresh(d3,20.5,'campus',{dating_kexin:true}); run(20.5,21.2); m=PHONE.byAsk(G,'b106_42_ticket');
    check('4-2③：大四下第 6 週週三 21:00 韋綸四張門票「走啦！公司給的。」；交往中可昕「四張。……韋綸，你數過人數嗎？」；兩個回覆',!!m&&txt('g:econ_friends').includes('econ_weilun:走啦！公司給的。')&&m.text==='四張。……韋綸，你數過人數嗎？'&&J(m.ask.opts.map(o=>o.t))===J(['「走。」','「這週要讀書。」']),J(txt('g:econ_friends').slice(-3)));
    PHONE.answer(G,'b106_42_ticket',0); run(21.3,21.4); const q=OUT.get(G,'b106_wl_game');
    check('4-2③：選「走。」＝可昕「我自己買票，坐你們旁邊。」；那個週六 18:30 排進行程（一定會去，那晚不能另排別的事）',txt('g:econ_friends').includes('kexin:我自己買票，坐你們旁邊。')&&!!q&&q.day===sat&&q.h===18.5&&q.must===true&&q.ev==='ev_b106_42_game',J(q));
    if(q) q.state='done'; setDay(sat,21.9); run(21.9,22.2);
    check('4-2③：去了以後群組一張看台上的合照＋韋綸「我們隊輸了。可是我算過，下一場的勝率是百分之五十四。」、記 WL_GAME',J(txt('g:econ_friends').slice(-2))===J(['econ_weilun:📷（看台上的合照）','econ_weilun:我們隊輸了。可是我算過，下一場的勝率是百分之五十四。'])&&G.flags.WL_GAME===true,J(txt('g:econ_friends').slice(-2)));
    const d4=TD('Y4S2',15,5); setDay(d4,20.9); run(20.9,21.2);
    check('4-2④：大四下第 15 週週五 21:00，有 WL_GAME＝「下一季的門票，還是四張。」',txt('g:econ_friends').slice(-1)[0]==='econ_weilun:下一季的門票，還是四張。');
    fresh(d3,20.5,'campus'); run(20.5,21.2); PHONE.answer(G,'b106_42_ticket',1);
    check('4-2③：選「這週要讀書。」＝韋綸「那下一場。勝率比較高。」，不排出遊',txt('g:econ_friends').slice(-1)[0]==='econ_weilun:那下一場。勝率比較高。'&&!OUT.get(G,'b106_wl_game'));
    setDay(d4,20.9); run(20.9,21.2);
    check('4-2④：沒有 WL_GAME＝「下一季的球賽。你欠我一場。」',txt('g:econ_friends').slice(-1)[0]==='econ_weilun:下一季的球賽。你欠我一場。'); }
  // ---- V1-B106-D1D2 日常 D1 ----
  { const tue=TD('Y1S1',5,2), wed=tue+1, tue2=TD('Y1S2',5,2);
    const gather=(day,flags,grp)=>{ fresh(day,18.7,'campus',flags); if(grp!==false) PHONE.join(G,'noodle_team','麵店團'); return STORY.fdormGather?STORY.fdormGather(G):false; };
    check('D1：麵店團的女舍門口集合＝大一上的週二麵店日（在麵店團群組、以安報過名字）；週三、沒進群組都不是',gather(tue)&&!gather(wed)&&!gather(tue,{},false),'');
    const D1=ev('ev_b106_d1_bench'); const play=async(day,flags)=>{ fresh(day,18.7,'campus',flags); PHONE.join(G,'noodle_team','麵店團'); const ok=!!D1&&EVENTS.check(D1); if(ok) await RUN(D1); return {ok,L:lines()}; };
    let r=await play(tue,{MET_PINYU:true});
    check('D1：週二 18:30～19:00 女舍門口的長椅旁：品妤經過「你又在等人？這次等誰？」（所有玩家都有「又」字）',r.ok&&has(r.L,'你又在等人？這次等誰？')&&!has(r.L,'曾品妤。經濟系，可昕以前的室友。')&&!!D1.near&&D1.near.x===-93,J(r.L));
    r=await play(tue,{});
    check('D1：法律系時期第一次見到品妤＝先「曾品妤。經濟系，可昕以前的室友。」',r.ok&&r.L.indexOf('品妤：曾品妤。經濟系，可昕以前的室友。')>=0&&r.L.indexOf('品妤：曾品妤。經濟系，可昕以前的室友。')<r.L.indexOf('品妤：你又在等人？這次等誰？'),J(r.L));
    r=await play(tue2,{MET_PINYU:true});
    check('D1：大一下週二晚上品妤在補習班櫃台（作息）＝不會經過（同一個集合、大一上會經過）',!!D1&&!r.ok&&(await play(TD('Y1S1',6,2),{MET_PINYU:true})).ok); }
  // ---- V1-B106-D1D2 日常 D2 ----
  { const d8=TD('Y1S1',8,1), d10=TD('Y1S1',10,1);
    fresh(d10,12.1,'campus');
    check('D2：韋綸的句子照順序：第一次「欸！……」（WL_SAID_LAW）→「走啦！」→ 有 WL_BIKE 才有腳踏車那句 → 沒有了',(()=>{ const k=[]; k.push(B2.key(G,'econ_weilun')); G.flags.WL_SAID_LAW=true; k.push(B2.key(G,'econ_weilun')); B2.done(G,'econ_weilun','wl_go'); k.push(B2.key(G,'econ_weilun')); G.flags.WL_BIKE=true; k.push(B2.key(G,'econ_weilun')); B2.done(G,'econ_weilun','wl_bike'); k.push(B2.key(G,'econ_weilun')); return J(k)===J(['wl_first','wl_go',null,'wl_bike',null]); })());
    fresh(d10,15.5,'campus');
    check('D2：唐睿照旗標：都沒有「法律系的！」、SOC_WRONG_BUILDING「走錯棟的！」、SOC_ROAD_PERSON「路人！」（各一次）',(()=>{ const k=[B2.key(G,'econ_tangrui')]; G.flags.SOC_WRONG_BUILDING=true; k.push(B2.key(G,'econ_tangrui')); G.flags.SOC_ROAD_PERSON=true; k.push(B2.key(G,'econ_tangrui')); B2.done(G,'econ_tangrui','tr_road'); k.push(B2.key(G,'econ_tangrui')); return J(k)===J(['tr_law','tr_wrong','tr_road',null]); })());
    const dueDays=(id,term)=>{ let n=0, tot=0; for(let w=1;w<=16;w++) for(let wd=1;wd<=5;wd++){ const d=TD(term,w,wd); if(d==null) continue; fresh(d,12.1,'campus'); if(B2.term(G)){ tot++; if(B2.due(G,id)) n++; } } return {n,tot}; };
    const y11=dueDays('econ_weilun','Y1S1'), y21=dueDays('econ_weilun','Y2S1');
    check('D2：「可能遇到」＝上課週的平日擲一次（約三成）；大一上第 8 週以前（SK01、SK02 的窗口）、考試週不排',y11.n>0&&y21.n/y21.tot>0.15&&y21.n/y21.tot<0.6&&(()=>{ fresh(TD('Y1S1',7,2),12.1,'campus'); return !B2.term(G); })()&&(()=>{ fresh(TD('Y1S1',16,2),12.1,'campus'); return !B2.term(G); })()&&(()=>{ fresh(TD('Y4S1',3,2),12.1,'campus'); return !B2.term(G); })(),J({y11,y21}));
    let dd=null; for(let w=10;w<=15&&dd==null;w++) for(let wd=1;wd<=5&&dd==null;wd++){ const d=TD('Y2S1',w,wd); fresh(d,12.1,'campus'); if(B2.due(G,'econ_weilun')) dd=d; }
    if(dd==null) dd=TD('Y2S1',10,1);   /* 修改前：一天都擲不到（函式不存在），照樣往下跑讓各項 FAIL */
    fresh(dd,12.1,'campus'); const ent=STORY.schedEnt(CHARACTERS.econ_weilun,G);
    check('D2：擲到的那天 12:00～12:25 韋綸照作息站在法學院廣場（characters.js b106d2）',!!ent&&ent.zone==='campus'&&ent.b106d2===true&&J(ent.at.slice(0,2))==='[50,-93]',J(ent));
    const W=ev('ev_b106d2_weilun'); const okNear=dx=>{ fresh(dd,12.1,'campus'); near('econ_weilun',dx); return !!W&&EVENTS.check(W); };
    check('D2：走到他旁邊（npcNear 3 m）才說；人在遠處不說',okNear(1.5)&&!okNear(6));
    fresh(dd,12.1,'campus'); near('econ_weilun',1); await RUN(W); let L=lines();
    check('D2：從法律系開始的玩家第一次遇到韋綸：「韋綸！騎車的！」「欸！……喔你現在是法律系的。那也走啦！」；記 WL_SAID_LAW、MET_WEILUN；同一天不再說',J(L)===J(['韋綸：韋綸！騎車的！','韋綸：欸！……喔你現在是法律系的。那也走啦！'])&&G.flags.WL_SAID_LAW===true&&G.flags.MET_WEILUN===true&&!B2.due(G,'econ_weilun'),J(L));
    let dd2=null; for(let d=dd+1;d<dd+60&&dd2==null;d++){ G.day=d; G.weekday=wdOf(d); if(B2.due(G,'econ_weilun')) dd2=d; }
    if(dd2==null) dd2=dd+7;
    setDay(dd2,12.1); said=[]; await RUN(W); L=lines();
    check('D2：下一次只有「走啦！」（不再重新介紹）',J(L)===J(['韋綸：走啦！']),J(L));
    { let two=0, one=0; for(let w=10;w<=15;w++) for(let wd=1;wd<=5;wd++){ fresh(TD('Y2S1',w,wd),15.5,'campus'); const n=['econ_tangrui','econ_zhengxun'].filter(id=>B2.due(G,id)).length; if(n>1) two++; if(n===1) one++; }
      check('D2：15:30 社科院門口一天只有阿勳或唐睿其中一個（大二上第 10～15 週：有幾天擲到、沒有一天兩個都在）',one>0&&two===0,J({one,two})); }
    const X=ev('ev_b106d2_xun'); fresh(dd,15.5,'campus'); near('econ_zhengxun',1); await RUN(X); L=lines();
    check('D2：阿勳「你們法律系的課表，是不是也很不合理？」（沒見過＝先「盧正勳。你經濟系那年的室友。……你該不會連我都忘了。」）；只說一次',J(L)===J(['阿勳：盧正勳。你經濟系那年的室友。……你該不會連我都忘了。','阿勳：你們法律系的課表，是不是也很不合理？'])&&B2.key(G,'econ_zhengxun')===null,J(L));
    const TR=ev('ev_b106d2_tang'); fresh(dd,15.5,'campus',{SOC_WRONG_BUILDING:true,PLAYED_Y0:true,KNOWS_TANG:true}); near('econ_tangrui',1); await RUN(TR); L=lines();
    check('D2：唐睿（領過系外套）「走錯棟的！」',J(L)===J(['唐睿：走錯棟的！']),J(L));
    const Y=ev('ev_b106d2_yutong'); const yt=async(flags,pick)=>{ fresh(dd,17.4,'campus',flags); SOCIAL.remember('heroine_03','FIRST_MET',''); picks=[pick]; await RUN(Y); return {L:lines().map(t=>t.replace(/^[^：]*語彤：/,'語彤：')),F:G.flags,O:opts.slice()}; };
    let y=await yt({},0);
    check('D2：語彤（沒說過經濟系）：「你怎麼在我們這一區？」→「我以前在這棟上過課。」「……你以前是經濟系的？」「念了一個多月。」，記 YT_KNOWS_ECON',J(y.L)===J(['語彤：你怎麼在我們這一區？','祐廷：我以前在這棟上過課。','語彤：……你以前是經濟系的？','祐廷：念了一個多月。'])&&y.F.YT_KNOWS_ECON===true,J(y.L));
    y=await yt({ECON_PAST_SHARED:'full'},0);
    check('D2：語彤（麵店團已經知道 full）：「又回來看舊系館？」',J(y.L)===J(['語彤：你怎麼在我們這一區？','語彤：又回來看舊系館？']),J(y.L));
    y=await yt({ECON_PAST_SHARED:'half'},'其實');
    check('D2：語彤（說過自學 half）：選「我以前常來這棟借書。」或「……其實我念過一個多月。」（升成 full）',J(y.O[0])===J(['「我以前常來這棟借書。」','「……其實我念過一個多月。」'])&&y.F.ECON_PAST_SHARED==='full',J(y.O));
    check('D2：語彤週一、五 17:20～17:50 在社科院門口（週三她在 118 巷）；說過一次就不再排',(()=>{ const e=CHARACTERS.heroine_03.daily_schedule.find(x=>x.b106d2); fresh(dd,17.4,'campus'); G.events.done.ev_b106d2_yutong=1; return !!e&&J(e.days)==='[1,5]'&&!B2.due(G,'heroine_03'); })()); }
  // ======================= BB_105 大一女舍門口（V1-B105-D2）=======================
  // ---- D4 一年後，再走到女舍門口（AA_289 5-4：沛珊還筆記）----
  { const D4=ev('ev_b105_d4_notes'), wk5=TD('Y1S1',5,3), sat=D('2025-10-04'), wk9=TD('Y1S1',9,3);
    check('D4：事件存在（大一上第 4～8 週、大一女舍門口、12:00～21:00、一次）',!!D4&&J(D4.weeks)==='[4,5,6,7,8]'&&J(D4.term)==='["Y1S1"]'&&!!D4.near&&D4.near.x===-93&&D4.once===true);
    const ck=(day,h,contact)=>{ fresh(day,h,'campus'); if(contact!==false) INV.addContact(G,'classmate_peishan'); return !!D4&&EVENTS.check(D4); };
    check('D4：有沛珊的聯絡方式、她在臺北＝第 5 週週三 15:00 走到門口就演；沒有聯絡方式、她回台中的週末（10/4）、第 9 週都不演',ck(wk5,15)&&!ck(wk5,15,false)&&!ck(sat,15)&&!ck(wk9,15)&&!ck(wk5,22));
    ck(wk5,15); await RUN(D4); const L=lines().map(t=>t.replace(/^[^：]*沛珊（手機）：/,'沛珊（手機）：').replace(/^[^：]*沛珊：/,'沛珊：'));
    check('D4：「我下樓了！你等我一下下」（私訊）→ 旁白「一年前，你常在這裡等人。」→「（下樓）對不起！你的筆記我找了一下……」「在我手上。我自己拿著還在找。」「謝謝你借我！第三章我抄完了。」',
      J(L)===J(['沛珊（手機）：我下樓了！你等我一下下','一年前，你常在這裡等人。','沛珊：（下樓）對不起！你的筆記我找了一下……','沛珊：在我手上。我自己拿著還在找。','沛珊：謝謝你借我！第三章我抄完了。'])&&txt('p:classmate_peishan').includes('classmate_peishan:我下樓了！你等我一下下'),J(lines()));
    check('D4：演過一次就不再演（旁白只出現這一次）',!!D4&&!!G.events.done[D4.id]&&!EVENTS.check(D4));
    { let busy=null, free=null; for(let w=4;w<=8&&!(busy&&free);w++) for(let wd=1;wd<=5&&!(busy&&free);wd++) for(let h=12;h<21&&!(busy&&free);h+=0.5){ const d=TD('Y1S1',w,wd); fresh(d,h,'campus'); const e=STORY.schedEnt(CHARACTERS.classmate_peishan,G); if(!busy&&e&&e.act==='class') busy=[d,h,e.zone]; if(!free&&!e) free=[d,h]; }
      check('D4：她照作息在上課的時候不演（下不了樓）；沒有別的事的時候演',!!busy&&!!free&&!ck(busy[0],busy[1])&&ck(free[0],free[1]),J({busy,free})); } }
  // ---- D4b 以安準時下樓 ----
  { const D4B=ev('ev_b105_d4b_on_time'), tue=TD('Y1S1',5,2);
    const ck=(day,h,grp)=>{ G.day=day; G.weekday=wdOf(day); G.hour=h; return !!D4B&&EVENTS.check(D4B); };
    fresh(tue,19.05,'campus'); PHONE.join(G,'noodle_team','麵店團');
    check('D4b：麵店團在女舍門口集合（大一上週二麵店日）19:00～19:15＝以安下來；週三不是',ck(tue,19.05)&&!ck(tue+1,19.05)&&!ck(tue,18.9));
    G.day=tue; G.weekday=2; G.hour=19.05; said=[]; await RUN(D4B);
    check('D4b：以安「七點。你們遲到兩分鐘。」',J(lines().map(t=>t.replace(/^[^：]*：/,'')))===J(['七點。你們遲到兩分鐘。']),J(lines()));
    check('D4b：可以重複，隔兩週（下週二不會、兩週後的週二會）',!ck(tue+7,19.05)&&ck(tue+14,19.05)); }
  // ---- D7 宿舍的人們 ----
  { const C=typeof CROWD!=='undefined'?CROWD:null, sp=C&&C.SPOTS.find(s=>s.id==='fdorm');
    const L=(day,key)=>{ fresh(day,8,'campus'); return sp&&sp.lines?sp.lines(G,{key}):null; };
    const w1=TD('Y1S1',1,2), w5=TD('Y1S1',5,2), w8=TD('Y1S1',8,2);
    check('D7：開學第一週白天＝「（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……對，有電梯。」」',J(L(w1,'am'))===J(['（一個女生拖著兩個行李箱，在門口打電話）「媽，我到了。……對，有電梯。」']),J(L(w1,'am')));
    check('D7：傍晚「她說五分鐘。……我數到第三個五分鐘了。」；晚上兩句（宵夜、講電話）；考試週「總圖還有位子嗎？……那我去社科圖。」；第 5 週早上沒有',J(L(w5,'eve'))===J(['「她說五分鐘。……我數到第三個五分鐘了。」'])&&J(L(w5,'night'))===J(['（提著兩袋宵夜的人）「鹹酥雞到了，誰下來拿？」','（在門口講電話）「沒有啦，我只是想打給你。」'])&&J(L(w8,'eve'))===J(['（抱著一疊書的人）「總圖還有位子嗎？……那我去社科圖。」'])&&J(L(w5,'am'))==='[]',J([L(w5,'eve'),L(w5,'night'),L(w8,'eve'),L(w5,'am')]));
    fresh(w5,20.5,'campus'); const ns=[0,1,2].map(i=>({obj:{position:{x:i,y:0,z:0}}})); const got=C&&C.giveLines?C.giveLines(GM,sp,{key:'night'},ns):[];
    check('D7：一群人裡一句給一個人（晚上兩句＝兩個人可以點「聽一句」，第三個不行）',got.length===2&&ns[0].talkLabel==='聽一句'&&typeof ns[0].talk==='function'&&!ns[2].talk);
    said=[]; if(ns[1].talk) await ns[1].talk();
    check('D7：點了＝那一句（旁白）',J(said)===J([{who:null,t:'（在門口講電話）「沒有啦，我只是想打給你。」'}]),J(said)); }
  // ---- D9 法服的攤位 ----
  { const C=typeof CROWD!=='undefined'?CROWD:null, sp=C&&C.SPOTS.find(s=>s.id==='fdorm_fafu');
    const sl=(day,h,stage)=>{ fresh(day,h,'campus'); if(stage) G.stage=stage; return sp?C.slotAt(G,sp,h):null; };
    const y2w1=TD('Y2S1',1,2), y2w3=TD('Y2S1',3,2), y1w1=TD('Y1S1',1,2), y3w2=TD('Y3S1',2,4), sat=y2w1+4;
    check('D9：大二以後上學期第 1～2 週平日 12:00～17:00 法服在女舍外的路邊擺攤；大一、第 3 週、週末、晚上都沒有',!!sl(y2w1,13)&&!!sl(y3w2,16.5)&&!sl(y1w1,13)&&!sl(y2w3,13)&&!sl(sat,13)&&!sl(y2w1,18),'');
    const s1=sl(y2w1,13); const g=s1?(()=>{ const ox=STORY.CROWD_X; STORY.CROWD_X=2; const r=C.group(G,sp,s1); STORY.CROWD_X=ox; return r; })():[];
    check('D9：攤位兩位社員（路人加倍也不加）',g.length===2,String(g.length));
    const ns=[0,1].map(i=>({obj:{position:{x:i,y:0,z:0}}})); const got=sp&&C.giveLines?C.giveLines(GM,sp,s1,ns):[];
    check('D9：兩位都可以點「看法服的攤位」',got.length===2&&ns[0].talkLabel==='看法服的攤位'&&ns[1].talkLabel==='看法服的攤位');
    said=[]; if(ns[0].talk) await ns[0].talk();
    check('D9：點了＝旁白「（攤位上一疊傳單，法服的社員在喊：「法律服務社！免費法律諮詢的那個！」）」＋社員「新生可以來旁聽喔。……你是學長？那你也可以來。」',J(said)===J([{who:null,t:'（攤位上一疊傳單，法服的社員在喊：「法律服務社！免費法律諮詢的那個！」）'},{who:'法服的社員',t:'新生可以來旁聽喔。……你是學長？那你也可以來。'}]),J(said)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
