// 可昕自己的線（CANON-NO-ECON-1112 第四批；企劃線 AA_873 定稿，BB_416）：①～⑥ 的觸發條件、逐字（② 在 tests/y2b_events_unit.js、④ 在 tests/r2y3a_events_unit.js、⑤ 在 tests/r2y3b_events_unit.js）；檔尾加 AA_877、AA_878 補的機制（情人節補過、跨年沒去那一則）。用法：node tests/kx_line_873_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|Y2B|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/data/y2b_events.js','src/y2b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
let cgs=[]; global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(id){ if(!CG_REGISTRY[id]) return false; cgs.push(id); return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
let said=[], opts=[], picks=[], G=null, caps=[], toasts=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{pothos:[0.7,-2.3]}},npcs:[],interactables:[],levels:null,setWeather(w){ this.w=w; },hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast:t=>{ toasts.push(t); },updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,YT_MET_JOB:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cgs=[]; caps=[]; toasts=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; ADV.active=false; return G; };
const LV={FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };

const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const has=t=>said.some(s=>s.t===t);
const all=()=>said.map(s=>s.t);
const run=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; await EVENTS.run(ev(id)); };
const J=JSON.stringify;
(async()=>{
  check('0. 六拍都在、id 不重複（①⑥ 新事件；②③④ 沿用 id；⑤ ev_kexin_k20 在 r2y3b_events.js）', ['ev_kx_s1_deposit','ev_kx_s1_heard','ev_kexin_bad_exam','ev_kexin_tutor_practice','ev_kexin_call_helper','ev_kx_s6_same'].every(id=>STORY_EVENTS.filter(e=>e.id===id).length===1));
  // ① 室友的押金
  { const e=ev('ev_kx_s1_deposit'); check('①. 大一下第 12 週起（順延到第 15 週）、宿舍樓下傍晚', J(e.term)===J(['Y1S2'])&&J(e.weeks)===J([12])&&e.carryTo===15&&e.location==='campus'&&!!e.near); }
  fresh('2026-05-11',18,'campus',{KX_MET:true}); R('kexin','FAM'); check('①. 熟悉、在臺北：條件成立（沒在交往也有）', EVENTS.checkAt(ev('ev_kx_s1_deposit')));
  fresh('2026-05-11',18,'campus',{KX_MET:true}); check('①. 還不熟：沒有', !EVENTS.checkAt(ev('ev_kx_s1_deposit')));
  fresh('2026-05-11',18,'campus',{KX_MET:true}); R('kexin','FAM'); await run('ev_kx_s1_deposit',[0]);
  check('①. 照 AA_873 ① 逐字（選「我看看。」）；記 KX_S1', J(all())===J(['（宿舍樓下的長椅。可昕旁邊坐著她室友，兩個人中間攤著幾張紙。室友眼睛是紅的。）','你來得剛好。你看得懂租約嗎？','她暑假要搬出去住，簽了約、付了押金。現在不想租了，房東說押金一毛都不退。','（你把那幾張紙看了一遍。有幾行字很小。）','你看這麼久，是看懂了還是沒看懂？……我也是。走，去問助教。','（她把租約拿回去，一行一行用手指著念。念到第三頁她停下來。）','這裡。「簽約後反悔，押金不退」是房東自己講的。紙上寫的是另一回事，寫的是搬進去以後的事。','她根本還沒搬進去。','（對室友）我沒有說妳一定拿得回來。我是說，他講的那句話，紙上沒有。妳明天拿這一頁去問他，叫他指給妳看是哪一行。','（室友看著那一頁，過了一會兒，把眼淚擦掉了。）','……妳這樣講我就懂了。我本來以為是我笨。','妳哪裡笨。是字太小。','（室友先上樓了。可昕把剩下的紙疊好。）','我剛剛其實很怕講錯。','可是她聽懂的時候，整個人就不抖了。你有看到嗎。'])&&J(opts[0])===J(['「我看看。」','「這個要問老師吧。」'])&&G.flags.KX_S1===true, J(all()));
  fresh('2026-05-11',18,'campus',{KX_MET:true}); R('kexin','FAM'); await run('ev_kx_s1_deposit',[1]); check('①. 選「這個要問老師吧。」：她那一句，接同一段', has('我知道要問。可是她現在就在哭，我不能叫她哭到禮拜一。')&&has('她根本還沒搬進去。'));
  fresh('2026-09-15',12,'linze',{KX_MET:true}); R('kexin','FAM'); check('①. 大一下沒遇到：大二上第一次遇到她有那一句', EVENTS.checkAt(ev('ev_kx_s1_heard'))); await run('ev_kx_s1_heard'); check('①. 那一句照稿；記 KX_S1 heard', J(all())===J(['（她說上學期幫室友看了一份租約，押金後來拿回一半。）'])&&G.flags.KX_S1==='heard');
  fresh('2026-09-15',12,'linze',{KX_MET:true,KX_S1:true}); R('kexin','FAM'); check('①. 看過那一場的：沒有那一句', !EVENTS.checkAt(ev('ev_kx_s1_heard')));
  // ③ 學弟妹來問
  { const e=ev('ev_kexin_tutor_practice'); check('③. 大二下第 7 週起、法律系館傍晚', J(e.term)===J(['Y2S2'])&&J(e.weeks)===J([7])&&e.location==='linze'); }
  fresh('2027-04-06',17,'linze',{KX_MET:true}); R('kexin','FAM'); check('③. 熟悉：條件成立', EVENTS.checkAt(ev('ev_kexin_tutor_practice'))); await run('ev_kexin_tutor_practice',[1]);
  check('③. 照 AA_873 ③（選「這裡我補一句。」）；學妹的名牌；記 KX_S3', has('坐。他們說有一題看不懂，來問我。我也不知道為什麼是問我。')&&said.some(s=>s.who==='大一學妹'&&s.t==='因為學姊上次在走廊跟人講話，我們聽得懂。')&&has('你。你是來問的還是來坐的？')&&has('好，你補。（你補完）……對，這個我漏了。你們記他講的那句。')&&has('課本比較對。我只是比較吵。')&&has('她那句話我會記很久。你不要笑。')&&J(opts[0])===J(['（不插話，聽她講完）','「這裡我補一句。」'])&&G.flags.KX_S3===true, J(all()));
  // ④ 人在國外的順延
  fresh('2028-10-30',20,'campus',{KX_MET:true}); R('kexin','FRI'); check('④. 大三上人在臺灣、演過了以後的學期：不再有（once）', (G.events.done.ev_kexin_call_helper=1, !EVENTS.checkAt(ev('ev_kexin_call_helper'))));
  fresh('2028-04-17',20,'campus',{KX_MET:true}); R('kexin','FRI'); check('④. 大三上在臺灣（沒出國）：大三下不再排', !EVENTS.checkAt(ev('ev_kexin_call_helper')));
  // ⑥ 同一件事
  { const e=ev('ev_kx_s6_same'); check('⑥. 大四下第 10 週起（順延到第 14 週）、法律系館', J(e.term)===J(['Y4S2'])&&J(e.weeks)===J([10])&&e.carryTo===14&&e.location==='linze'); }
  fresh('2029-04-25',14,'linze',{KX_MET:true}); R('kexin','FRI'); check('⑥. 朋友：條件成立', EVENTS.checkAt(ev('ev_kx_s6_same'))); await run('ev_kx_s6_same',[1]);
  check('⑥. 照 AA_873 ⑥ 逐字（選「妳想當哪一個？」）；記 KX_S6', J(all())===J(['（系館的布告欄前面。她在看一張國考的時程表，看完把手機收起來。）','很多人問我要考哪一個。','我本來也覺得要先選好。律師、司法官，選一個，然後照那個念。','都可以。我講真的。','不管最後坐在哪一邊，我要做的是同一件事——有人拿著一張看不懂的紙站在那裡，我過去，用他聽得懂的話講一遍。','考不考得上，都可以這樣做。','（她看了你一眼。）','這句不准跟阿哲講。他好不容易才不怕我。'])&&G.flags.KX_S6===true, J(all()));
  check('全部. 六拍不讀 dating_kexin、沒有「如果」「比你」', ['ev_kx_s1_deposit','ev_kexin_bad_exam','ev_kexin_tutor_practice','ev_kexin_call_helper','ev_kx_s6_same'].every(id=>!/dating_kexin|如果|比你/.test(J(ev(id).dialogue))));
  /* ===== AA_877／878 補的機制（CANON-NO-ECON-1112 第四批）===== */
  { const e=ev('ev_kexin_vday_makeup_y1'); fresh('2026-02-23',10,'classroom',{dating_kexin:true,KX_VDAY_MAKEUP:true});
    check('AA_877 #10. 情人節補過：大一下開學第一週下課、交往中、選過二或三＝她在教室門口那一句', !!e&&e.trigger==='class'&&J(e.term)===J(['Y1S2'])&&J(e.weeks)===J([1])&&EVENTS.cond(e.prereq)&&J(e.dialogue.slice(0,2).map(l=>l.text))===J(['（她在教室門口等。）','走。情人節補過。']));
    fresh('2026-02-23',10,'classroom',{dating_kexin:true}); check('AA_877 #10. 選一（讀民總）的：沒有', !EVENTS.cond(e.prereq)); }
  { const e=ev('ev_nye_river'), nye=D('2025-12-31'); fresh('2025-12-31',23.9,'dorm',{dating_kexin:true}); e.outingMissed(G,GM,{day:nye}); G.day=nye+1; G.hour=0.2; PHONE.tick(G);
    check('AA_877 #3. 高雄跨年沒去：當晚她傳「新年快樂。河邊沒什麼人，我自己看完了。」', (G.msgs||[]).some(m=>m.th==='p:kexin'&&m.text==='新年快樂。河邊沒什麼人，我自己看完了。')&&G.flags.KX_NYE[1]==='missed'); }
  for(const [y,key,t] of [[2,'2026-12-31','新年快樂。河邊今年人比較多。'],[3,'2027-12-31','新年快樂。暖暖包我多帶了一個，自己用掉了。'],[4,'2028-12-31','新年快樂。那個位置今年被別人占走了。']]){
    fresh(key,23.5,'dorm',{dating_kexin:true,KX_NYE:{[y]:'video'}}); STORY.kxNye(GM); G.day=D(key)+1; G.hour=0.3; STORY.kxNye(GM); PHONE.tick(G);
    check('AA_878 #19～21. 大'+['','','二','三','四'][y]+'沒去高雄：零點她傳一則「'+t+'」；沒有視訊', (G.msgs||[]).some(m=>m.th==='p:kexin'&&m.text===t)&&!(G.outings||[]).some(q=>/視訊/.test(q.place||'')), J((G.msgs||[]).filter(m=>m.th==='p:kexin').map(m=>m.text))); }
  check('AA_878 #19～21. 三場高雄跨年的 kxAway 拿掉', [2,3,4].every(y=>!ev('ev_kx_nye_river_y'+y).kxAway));
  /* ===== AA_879 週年（在一起那一天、提前、沒去那一則、地點）===== */
  { fresh('2027-01-10',9,'dorm',{KX_MET:true,dating_kexin:true,confessed:{kexin:D('2026-01-20')}}); const A=STORY.kxAnnivAt(G,1), last=CALENDAR.termDays('Y2S1').to;
    check('AA_879 第 1 節. 週年＝在一起那天的同月同日；那天放假、她在高雄＝提前到學期最後一天（early）', !!A&&A.early===true&&A.day===last, J([A,last]));
    fresh('2027-01-10',9,'dorm',{KX_MET:true,dating_kexin:true,confessed:{kexin:D('2026-05-20')}}); const B=STORY.kxAnnivAt(G,1);
    check('AA_879 第 1 節. 那天還在學期中＝當天、不提前', !!B&&B.early===false&&B.day===D('2027-05-20'), J(B));
    fresh('2025-10-10',9,'dorm',{dating_kexin:true}); check('AA_879. 舊存檔（沒有在一起那一天）照原本的 10/17', STORY.kxAnnivDay(G,1)===D('2025-10-17')); }
  { const B=D('2027-05-20'); fresh('2027-05-13',20.9,'dorm',{KX_MET:true,dating_kexin:true,confessed:{kexin:D('2026-05-20')}}); STORY.phoneRules(GM); G.hour=21.1; STORY.phoneRules(GM); PHONE.tick(G);
    const m=(G.msgs||[]).filter(x=>x.tag==='kx_anniv_ask').map(x=>x.text);
    check('AA_879. 邀約那一句的星期幾照算出來的那一天（2027-05-20 是禮拜'+STORY.wdName(B)+'）；地點三選一的第二個是「後門那家湯餃。」', m[0]==='下禮拜'+STORY.wdName(B)+'是我們的週年。'&&J(((G.msgs||[]).find(x=>x.tag==='kx_anniv_ask'&&x.ask)||{ask:{opts:[]}}).ask.opts.map(o=>o.t))===J(['摩天輪。','後門那家湯餃。','河堤。']), J(m)); }
  { const e=ev('ev_kexin_anniversary_y1'); fresh('2026-12-31',18,'dorm',{dating_kexin:true,KX_ANNIV_PLACE:'shop',K7_GIFT:'none'}); said=[]; opts=[]; picks=[0]; await e.beforeOuting(G,GM,{early:true}); await EVENTS.run(e);
    check('AA_879. 提前的那一年開場多「提早過。那天我在高雄，這個我不想用視訊。」；地點湯餃店（深色底＋字幕）', all()[0]==='提早過。那天我在高雄，這個我不想用視訊。'&&e.dialogue.some(l=>l.scene==='學校後門・湯餃店'&&l.bg==='dark'), J(all().slice(0,2)));
    fresh('2026-12-31',18,'dorm',{dating_kexin:true}); STORY.kxAnnivMissed(G,1,D('2026-12-31')); G.day=D('2027-01-01'); G.hour=12.1; PHONE.tick(G);
    check('AA_879. 沒去：隔天中午卡片的照片＋「卡片我寫了。你沒來，先給你看第一頁。」；記那一天（AA_876 讀）', J((G.msgs||[]).filter(x=>x.tag==='kx_anniv_photo').map(x=>x.text))===J(['📷（一張卡片）','卡片我寫了。你沒來，先給你看第一頁。','週年快樂。下次你準備。'])&&G.flags.KX_ANNIV_MISSED_DAY===D('2026-12-31')); }
  /* ===== AA_881 她的回覆池（MSG-2）===== */
  { const P=MSG2_POOL.people.kexin, row=(tp,tr,c)=>{ const e=P.replies.find(x=>x.topic===tp&&x.tier===tr&&(x.cond||null)===(c||null)); return e?e.msgs.join('/'):null; };
    const W=[['bday','A',null,'謝謝。'],['bday','R',null,'謝謝/你怎麼知道的？……算了，收下'],['bday','L',null,'謝謝/（長頸鹿貼圖）/晚上我室友幫我過，過完我下樓找你'],
      ['bday','R','y2028_japan','謝謝。日本現在幾點？'],['bday','L','y2028_japan','謝謝。你那邊比較早一個小時，你比我先過我的生日。'],['bday','R','y2028_us','謝謝。美國現在是昨天吧？'],['bday','L','y2028_us','謝謝。你那邊還是昨天，我先過了。你明天再跟我說一次。'],
      ['bday','R','y2029','謝謝。今天在圖書館過'],['bday','L','y2029','謝謝！！/（長頸鹿貼圖）/今天在圖書館過 國考的書比蛋糕還厚'],
      ['ok','A','k10c_bad_exam','還好。'],['ok','R','k10c_bad_exam','還好啦/我說了不要安慰/下次考好給你看'],['ok','L','k10c_bad_exam','還好啦/我說了不要安慰/……你陪我吃東西就好，不要講考試'],
      ['newyear','A',null,'新年快樂。'],['newyear','R',null,'新年快樂/我在高雄，我媽在煮，整間都是油味'],['newyear','L',null,'新年快樂/（長頸鹿貼圖）/今年也要一起'],
      ['thanks','A',null,'不會。'],['thanks','R',null,'不會啦。下次換你幫我。'],['thanks','L',null,'不會。']];
    const bad=W.filter(([tp,tr,c,t])=>row(tp,tr,c)!==t);
    check('AA_881. 可昕的回覆池 A／R／L 照稿逐字；沒有回問（上山、下山）、沒有走向 C 那一列；style 換字', !bad.length&&!P.replies.some(e=>e.ask||e.cond==='route_c')&&P.style==='短；不太用語助詞；熟了會直接叫你去吃飯；累了傳長頸鹿貼圖', J(bad)); }
  /* ===== AA_882 長頸鹿鑰匙圈 ===== */
  { const e=ev('ev_kx_souvenir'); fresh('2026-02-24',10,'linze',{KX_MET:true,KX_Y1S1_END:'taipei'}); R('kexin','FAM');
    check('AA_882. 大一下開學第一週、大一上選「臺北。」：她給那一盒（兩列照稿）、設 KX_SOUVENIR、GIRAFFE_KEYCHAIN', EVENTS.checkAt(e)&&(await run('ev_kx_souvenir'),J(all())===J(['（盒子上面用膠帶黏著一個小小的長頸鹿鑰匙圈。）','那個是附的。我在高雄的動物園買了一袋，班上每個人都有。你的是脖子最短的那隻。']))&&G.flags.GIRAFFE_KEYCHAIN===true&&G.flags.KX_SOUVENIR===true, J(all()));
    fresh('2026-02-24',10,'linze',{KX_MET:true,KX_Y1S1_END:'unsure'}); R('kexin','FAM'); check('AA_882. 選「還沒想。」的：沒有', !EVENTS.checkAt(e)); }
  /* ===== AA_885 她的手機動態（逐欄）===== */
  { const K885=require('./kx885_expect.js'), posts={};
    for(const f of ['feed_y1s1','feed_y1s2','feed_y2s1','feed_y2s2','feed_y3s1','feed_y3s2','feed_y4s1','feed_y4s2','feed_pg']){ const ctx={}; vm.runInNewContext(fs.readFileSync(path.join(ROOT,'src/data/'+f+'.js'),'utf8')+';this.__F=[typeof FEED_Y1S1!=="undefined"?FEED_Y1S1:null,typeof FEED_Y1S2!=="undefined"?FEED_Y1S2:null,typeof FEED_Y2S1!=="undefined"?FEED_Y2S1:null,typeof FEED_Y2S2!=="undefined"?FEED_Y2S2:null,typeof FEED_Y3S1!=="undefined"?FEED_Y3S1:null,typeof FEED_Y3S2!=="undefined"?FEED_Y3S2:null,typeof FEED_Y4S1!=="undefined"?FEED_Y4S1:null,typeof FEED_Y4S2!=="undefined"?FEED_Y4S2:null,typeof FEED_PG!=="undefined"?FEED_PG:null].filter(Boolean);',ctx); for(const S of ctx.__F) for(const q of (S.posts||[])) posts[q.id]=q; }
    const bad=[]; for(const id in K885.CH){ const q=posts[id], c=K885.CH[id]; if(!q||q.who!=='kexin'){ bad.push(id+' 沒有'); continue; }
      for(const f in c){ const v=c[f]; if(f==='-went'){ if(q.went) bad.push(id+' 還有 went'); continue; } const m=/^(cm|dm)([01])$/.exec(f); const got=m?(q[m[1]]||[])[+m[2]]:q[f]; if(J(got)!==J(v)) bad.push(id+'.'+f+'：'+J(got)); } }
    check('AA_885. 可昕的動態照稿逐欄（'+Object.keys(K885.CH).length+' 則）；去了／沒去兩版拿掉的兩則沒有 went', !bad.length, J(bad.slice(0,6))); }
  if(fails){ console.log('FAILED '+fails); process.exit(1); } console.log('ALL PASS');
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
