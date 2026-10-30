// AA_372（企劃線 da456892；AA 2026-10-21 定稿）法律系大一上：知道太早、重複、作廢設定——不需要瀏覽器。任務 AA372-Y1S1-FIX-1021。
//   第 1 項（博覽會法服的小字）另外在 tests/clubs_aa110_unit.js。這裡測第 2～18 項：
//   2 9/4 家族群組 Kevin 不再自我介紹　3 芯慈借筆記、柏翰考古題、明軒系籃只演一次、限大一上；柏翰、芯慈的升級句
//   4 以安自我介紹以前：旁白「前排那個女生」、字幕「前排的女生」、按鈕「和她說話」；語彤雨天「便利商店」那一版日誌「遇到一個借傘的女生」，拿到聯絡方式才換名字
//   5 翹課版：「請問——你是{name}嗎？」、「阿哲說你應該在這附近。……」　6 可昕 12/16「期末考還剩幾科？」　7 政大導遊兩句
//   8 以安第 4、8、12 週末回台中（presence、Café、美術館）；沛珊單數週回台中（週五那句、週末 presence、迪化街只剩雙數週）
//   9 阿勳「兩個月。」　10 自介拿掉「重考一年」、阿哲「欸，明軒說你比我們大一屆？」　11 可昕「她來台大找你」　12 班群「會說家族怎麼分」、聯絡人 9/4 21:00 以後才「（直屬）」、W1 21:00 以前「法律系大一」
//   13、18 以安閒聊階梯兩句（tools/ladder/import_ladder.py 疊 AA_372）　14「等一下還有課。」　15 阿哲「我在球場看到你們兩個一起走。」　16 柏翰「考古題我晚上傳給你。」　17 柏翰「第二十頁了」
//   舊存檔：演過很多次的一次性事件不再演；舊的日誌（字串）照舊顯示；第 3 天以後照舊叫「小安」。
//   第 6 節（企劃線 7fca0df5，AA 答實作後十題；1、4、5、6 照現在）：2 柏翰加回「我想調一下我的時間表。」　3 9/4 追出來那場補報名字　7 拿掉「……這是分工，不是命令。」
//   8 沛珊大一下、大二上也隔週回台中（迪化街只排雙數週）、以安 D26 台中偶遇加大一上第 4、8、12 週的週六　9 日誌「可昕來台大找你」　10 9/3 起手機寫「溫書瑀」
//   階梯：以安那兩句改由企劃線 ladder_aa.json@7fca0df5 匯入（import_ladder.py 不再疊 AA_372）
// 修改前（開發分支 2d0a075c）：上面每一項都會失敗（標「對照」的照樣通過）；第 6 節的檢查在 172696ca 上失敗。用法：node tests/aa372_y1s1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|NEEDED_MSGS|MSG|MSG_POOL|MSG2_POOL|HOMETOWN_LINES|HV|TERMEND|TERMEND_LINES|FREE_TRIPS|TRIP|ENCOUNTERS|ENC)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } length(){ return Math.hypot(this.x,this.y,this.z); } normalize(){ const l=this.length()||1; this.x/=l; this.y/=l; this.z/=l; return this; } }};
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const FILES=['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/needed_msgs.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/romance3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/story3d.js','src/classes3d.js','src/data/free_trips.js','src/freetrip3d.js','src/data/encounters.js','src/encounter3d.js'];
for(const f of FILES) if(fs.existsSync(path.join(ROOT,f))) load(f);
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組週四 20:00 那一則和這裡無關（9/4 是負的天數，home3d.js 會丟例外、印一堆警告：另外回報）*/
let said=[], opts=[], picks=[], caps=[], memos=[], G=null;
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[{row:1,col:3,x:0,z:0}]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0,removeNPC(){}};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(who,t){ caps.push([who,t]); },sleep:()=>Promise.resolve(),memo(m){ memos.push(m); },autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },removeNPC(){},hasNote:()=>true,
  spawnNPC(id,spec,x,z,o){ const n=Object.assign({id,charId:'heroine_01',name:spec.name,obj:{position:{x,y:0,z}},beh:'idle'},o||{}); GM.npc[id]=n; return n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>(q.t||q.text)+(q.hint?'〔'+q.hint+'〕':''))); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x), termDay=(t,w,wd)=>STORY.termDay(t,w,wd);
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:9000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,MAIN_D1:D('2025-09-03'),LAW_START_DAY:D('2025-08-29')},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},memo:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); if(typeof ROM!=='undefined'&&ROM.rec) ROM.rec(G); said=[]; opts=[]; picks=[]; caps=[]; memos=[]; GM.npc={}; E.npcs=[]; E.interactables=[]; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>{ const e=ev(id); return e?(e.dialogue||[]).map(l=>l&&l.text).filter(t=>typeof t==='string'):[]; };
const D2=STORY._day2||{};
(async()=>{
  const d31=D('2025-08-31'), d1=D('2025-09-01'), d2=d1+1, d3=d1+2, d4=d1+3, d5=d1+4;
  check('0. 對照：9/4 是週四、主線第 2 天',wdOf(d4)===4&&STORY.mainDay({day:d4,flags:{MAIN_D1:D('2025-09-03')}})===2);
  // ===== 第 2 項、第 10 項（自介）、第 12 項（班群、聯絡人）：系上社群 → 家族群組 =====
  const groupRun=(camp)=>{ fresh(d31,15,'campus',{introDone:true,CAMP_Y1:camp||undefined}); STORY.lawClassJoinY1(G); run(15,15.2);
    const LC=txt('g:law_class'); G.day=d1; G.weekday=1; run(21,21.1); const B=txt('g:law_board'); G.day=d2; G.weekday=2; run(12.5,12.6); G.day=d3; G.weekday=3; run(7.9,8.1);
    const c93=SOCIAL.contactName('heroine_05'); G.flags.FAM_GROUP_SENT=true; PHONE.join(G,'family_law','法律系直屬家族'); G.day=d4; G.weekday=4; run(20.5,20.95); const c94=SOCIAL.contactName('heroine_05');
    run(21,21.1); const c94n=SOCIAL.contactName('heroine_05'); G.day=d5; G.weekday=5; G.hour=10; const c95=SOCIAL.contactName('heroine_05');
    return {LC,B,FM:txt('g:family_law').filter(t=>!/新的家族學弟妹|臥底那一隊|騙了自己家|考古題茶會|學弟妹好～|有進來的舉個手/.test(t)),FALL:txt('g:family_law'),c93,c94,c94n,c95}; };
  { const r=groupRun(true);
    check('2. 9/4 21:00 家族群組（去過宿營）：Kevin「家族群組開好了。學弟，這次不用臥底了。」「上面那位是你的直屬學姊。」，接著她兩句、Kevin「你們認識？」',J(r.FM.slice(-5))===J(['kevin:家族群組開好了。學弟，這次不用臥底了。','kevin:上面那位是你的直屬學姊。','heroine_05:學弟好。我們留言區見過了。','kevin:你們認識？','heroine_05:他自介我有留言。']),J(r.FM));
    check('2. 9/4 那一串 Kevin 不再自我介紹（沒有「我是 Kevin」「歡迎學弟」）',!r.FM.some(t=>/我是 Kevin|歡迎學弟/.test(t)),J(r.FM));
    check('10. 9/1 21:00 系上社群祐廷的自介拿掉「重考一年」',r.B.includes('player:大家好，我是祐廷，財經法學組，澄嶼高中畢業。興趣是數學跟睡覺。請多指教。')&&!r.B.some(t=>/重考/.test(t)),J(r.B));
    check('12. 8/31 班群：「新生茶會：9/2（二）18:30，法律系館B一樓大廳。會說家族怎麼分，有點心。」（不說「公布直屬」）',r.LC.includes('law_assoc:新生茶會：9/2（二）18:30，法律系館B一樓大廳。會說家族怎麼分，有點心。')&&!r.LC.some(t=>/公布直屬/.test(t)),J(r.LC));
    check('12. 聯絡人：9/3 加進來、9/4 20:5x 都還是「溫書瑀」；9/4 21:00 Kevin 公布以後才「溫書瑀（直屬）」',r.c93==='溫書瑀'&&r.c94==='溫書瑀'&&r.c94n==='溫書瑀（直屬）'&&r.c95==='溫書瑀（直屬）',J([r.c93,r.c94,r.c94n,r.c95])); }
  { const r=groupRun(false);
    check('2. 沒有宿營的局（開發用起點）：9/4 Kevin 只說「上面那位是你的直屬學姊。」（不自我介紹）',J(r.FM.slice(-4))===J(['kevin:上面那位是你的直屬學姊。','heroine_05:學弟好。我們留言區見過了。','kevin:你們認識？','heroine_05:他自介我有留言。']),J(r.FM)); }
  // ===== 第 12 項：W1（Café）21:00 以前不說「直屬學弟」=====
  { const W1=ev('ev_sis_w1'); const w1=async(day,h)=>{ fresh(day,h,'cafe',{introDone:true,afternoonDone:true}); said=[]; await EVENTS.run(W1); return lines().find(t=>/^祐廷：學姊好/.test(t)); };
    const a=await w1(d4,19.5), b=await w1(d4,21.2), c=await w1(d5,19.5);
    check('12. W1：9/4 19:30 在 Café 遇到她＝「學姊好，我是祐廷，法律系大一。」（21:00 Kevin 才公布直屬）',a==='祐廷：學姊好，我是祐廷，法律系大一。',String(a));
    check('12. W1：9/4 21:10、9/5 照舊「學姊好，我是祐廷，妳的直屬學弟。」',b==='祐廷：學姊好，我是祐廷，妳的直屬學弟。'&&c===b,J([b,c])); }
  // ===== 第 3 項：一次性的事件只演一次、限大一上 =====
  { const w8=termDay('Y1S1',8,2), s2=termDay('Y1S2',5,2), s2b=termDay('Y1S2',5,5);
    const chk=(id,day,h,zone,done)=>{ fresh(day,h,zone,{introDone:true,classDone:true,afternoonDone:true}); if(done){ G.events.done[id]=done; G.events.last[id]=day-20; } return EVENTS.check(ev(id),{}); };
    check('3. 對照：芯慈借筆記、柏翰考古題第一次照樣會演（大一上第 8 週）',chk('ev_xinci_notes',w8,12,'library')&&chk('ev_bohan_kaogu',w8,12,'library'));
    check('3. 芯慈借筆記（「我上週民總請假」）：演過一次就不再演（20 天以後也一樣）',!chk('ev_xinci_notes',w8,12,'library',1));
    check('3. 芯慈借筆記：大一下以後不演（沒演過也一樣）',!chk('ev_xinci_notes',s2,12,'library'));
    check('3. 柏翰考古題：演過一次就不再演；大一下不演',!chk('ev_bohan_kaogu',w8,12,'library',1)&&!chk('ev_bohan_kaogu',s2,12,'library'));
    const m5=termDay('Y1S1',5,3);
    check('3. 對照：明軒系籃第一次照樣會演（大一上第 5 週）',chk('ev_mingxuan_ball',m5,16,'campus'));
    check('3. 明軒系籃（「欸，宿營兩人三腳那個…」）：演過一次就不再演；大一下不演',!chk('ev_mingxuan_ball',m5,16,'campus',1)&&!chk('ev_mingxuan_ball',s2b,16,'campus'));
    check('3. 舊存檔已經演了很多次（7 次）：不會再演、不會壞',!chk('ev_xinci_notes',w8,12,'library',7)&&!chk('ev_bohan_kaogu',w8,12,'library',12)&&!chk('ev_mingxuan_ball',m5,16,'campus',9));
    const once=['ev_xinci_notes','ev_bohan_kaogu','ev_mingxuan_ball'].every(id=>{ const e=ev(id); return e.once===true&&J(e.term)===J(['Y1S1']); });
    check('3. 三個事件都是 once、term Y1S1',once);
    check('3／第 6 節第 2 題. 柏翰升到「有點熟」：「我現在每天記讀書時數。……昨天四小時二十分。」「我想調一下我的時間表。」（後半加回來；不再問「你一週大概念幾小時？」）',J(REL_LINES.classmate_bohan.up.FAMILIAR.l)===J(['「我現在每天記讀書時數。……昨天四小時二十分。」','「我想調一下我的時間表。」']),J(REL_LINES.classmate_bohan.up.FAMILIAR.l));
    check('3. 芯慈升到「有點熟」那一句改成「我的筆記用了四種顏色。……你要的話，我可以借你。」（不再借他的筆記）',J(REL_LINES.classmate_xinci.up.FAMILIAR.l)===J(['「我的筆記用了四種顏色。……你要的話，我可以借你。」']),J(REL_LINES.classmate_xinci.up.FAMILIAR.l)); }
  // ===== 第 4、5 項：以安自我介紹以前 =====
  { const prof={id:'prof',name:'周教授',obj:{position:{x:0,y:0,z:-4}}}, zhe={id:'zhe',name:'阿哲',obj:{position:{x:1,y:0,z:0}}};
    if(typeof D2.classScene==='function'){
      const cls=async(flags,pick)=>{ fresh(d4,13.4,'classroom',Object.assign({introDone:true,readCase:'full'},flags||{})); const an={id:'an',charId:'heroine_01',name:'小安',obj:{position:{x:0,y:0,z:-1}}}; GM.npc={prof,an,zhe}; picks=[pick||0,0]; await D2.classScene(GM); return lines(); };
      let L=await cls({},0);
      check('4. 民總上課（她還沒報名字）：旁白「教室安靜了兩秒。前排那個女生低頭寫字。」「前排那個女生回頭看了你一眼，很快又轉回去。」，沒有「前排的小安」',L.includes('教室安靜了兩秒。前排那個女生低頭寫字。')&&L.includes('前排那個女生回頭看了你一眼，很快又轉回去。')&&!L.some(t=>/前排的小安/.test(t)),J(L.filter(t=>/前排/.test(t))));
      L=await cls({AN_NAME_TOLD:true},0);
      check('4. 上課前她已經自我介紹過（AN_NAME_TOLD）：照舊「前排的小安」',L.includes('教室安靜了兩秒。前排的小安低頭寫字。')&&L.includes('前排的小安回頭看了你一眼，很快又轉回去。'),J(L.filter(t=>/前排/.test(t)))); }
    else { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8'); check('4. 民總上課的旁白（她還沒報名字）：「前排那個女生低頭寫字。」「前排那個女生回頭看了你一眼…」',src.includes('前排那個女生低頭寫字。')&&src.includes('前排那個女生回頭看了你一眼，很快又轉回去。'),'沒有 STORY._day2.classScene'); }
    const meet=async(flags)=>{ fresh(d4,15.3,'campus',Object.assign({introDone:true,classDone:true,metAn:true},flags||{})); picks=[0]; await D2.meetAn(GM); return {L:lines(),caps:caps.slice(),an:GM.npc.an,opts:opts.slice(),S:said.slice()}; };
    let r=await meet({classAnswer:'good'});
    check('4. 下課追出來：字幕「前排的女生」＋「{name}！等一下！」（不是「小安」）',J(r.caps[0])===J(['前排的女生','{name}！等一下！']),J(r.caps[0]));
    check('4／第 6 節第 3 題. 追出來的以安：「呼——你走好快。」「我是沈以安。……大家都叫我小安。」是「前排的女生」說的；報了名字以後對話框、按鈕換「小安」「和小安說話」，記 AN_NAME_TOLD',!!r.an&&J(r.S.slice(0,2).map(s=>s.who+'：'+s.t))===J(['前排的女生：呼——你走好快。','前排的女生：我是沈以安。……大家都叫我小安。'])&&r.S.slice(2).filter(s=>s.who!==null&&s.who!=='祐廷').every(s=>s.who==='小安')&&r.an.name==='小安'&&r.an.talkLabel==='和小安說話'&&G.flags.AN_NAME_TOLD===true,J([r.S.slice(0,4),r.an&&[r.an.name,r.an.talkLabel]]));
    check('4／第 6 節第 3 題. 她約你的三個選項（她已經報了名字）：小字「跟小安一起走去溫州街」「跟小安一起走去總圖」',/〔跟小安一起走去溫州街〕/.test(J(r.opts[0]))&&/〔跟小安一起走去總圖〕/.test(J(r.opts[0]))&&!/跟她一起/.test(J(r.opts[0])),J(r.opts[0]));
    r=await meet({classAnswer:'absent'});
    check('5. 翹課版：字幕「請問——你是{name}嗎？」',!!r.caps[0]&&r.caps[0][1]==='請問——你是{name}嗎？',J(r.caps[0]));
    check('5／第 6 節第 3、5 題. 翹課版：「呼——你走好快。」→「阿哲說你應該在這附近。」→「我是沈以安。……大家都叫我小安。」→「你今天沒來？周老師點了你的名字，全班都在找你。……我有抄筆記，等一下給你看。」（報名字以後是「小安」說的）；沒有「{name}！等一下！」',J(r.L.slice(0,4))===J(['不認識的女生：呼——你走好快。','不認識的女生：阿哲說你應該在這附近。','不認識的女生：我是沈以安。……大家都叫我小安。','小安：你今天沒來？周老師點了你的名字，全班都在找你。……我有抄筆記，等一下給你看。'])&&!r.caps.some(c=>/等一下！/.test(c[1])),J(r.L.slice(0,4)));
    check('4/5. 翹課版他沒在教室看過她：字幕寫「不認識的女生」（不是「前排的女生」，給 AA 的問題）',!!r.caps[0]&&r.caps[0][0]==='不認識的女生',J(r.caps[0]));
    if(typeof D2.playLines==='function'){
      fresh(d4,15.5,'campus',{introDone:true,classDone:true,metAn:true,plan:'cafe',companion:'an'}); caps=[]; await D2.playLines(GM,D2.walkChecks('cafe')[0].lines);
      check('4. 一起走的路上：字幕「前排的女生」（祐廷那句照舊寫名字）',J(caps.map(c=>c[0]))===J(['前排的女生','祐廷','前排的女生']),J(caps.map(c=>c[0])));
      G.flags.AN_NAME_TOLD=true; caps=[]; await D2.playLines(GM,D2.walkChecks('cafe')[0].lines);
      check('4. 對照：她報過名字以後字幕照舊「小安」',J(caps.map(c=>c[0]))===J(['小安','祐廷','小安']),J(caps.map(c=>c[0]))); }
    else check('4. 一起走的路上：字幕「前排的女生」',false,'沒有 STORY._day2.playLines');
    if(typeof D2.spawnCompanion==='function'){ fresh(d4,15.5,'gongguan',{introDone:true,classDone:true,metAn:true,plan:'cafe',companion:'an'}); const sc=D2.spawnCompanion(GM);
      check('4. 一起走的以安（換區域重新生出來）：按鈕「和她說話」',!!sc&&sc.talkLabel==='和她說話'&&sc.name==='前排的女生',J(sc&&[sc.name,sc.talkLabel])); }
    else check('4. 一起走的以安（換區域重新生出來）：按鈕「和她說話」',false,'沒有 STORY._day2.spawnCompanion');
    // 上課前在教室找她說話：她自我介紹，之後叫「小安」（教室裡的以安是「前排的女生」）
    fresh(d4,13.0,'classroom',{introDone:true}); const n={id:'an',charId:'heroine_01',name:'前排的女生',talkLabel:'和她說話',obj:{position:{x:1,y:0,z:1}}}; const io=EVENTS.onInteract; EVENTS.onInteract=()=>false;
    try{ await D2.talkAn(GM,n); } finally { EVENTS.onInteract=io; }
    check('4. 上課前找她說話：「你好，我是沈以安。大家都叫我小安。」是「前排的女生」說的，之後對話框、按鈕換成「小安」（記 AN_NAME_TOLD）',!!said[0]&&said[0].who==='前排的女生'&&said[0].t==='你好，我是沈以安。大家都叫我小安。'&&!!said[1]&&said[1].who==='小安'&&G.flags.AN_NAME_TOLD===true&&n.talkLabel==='和小安說話',J(said));
    fresh(d5,12,'campus',{introDone:true,classDone:true,afternoonDone:true});
    check('4. 舊存檔／第 3 天以後：照舊「小安」',typeof STORY.anLabel==='function'&&STORY.anLabel(G)==='小安'&&STORY.anNameTold(G)===true); }
  // ===== 第 4 項：語彤雨天「便利商店」那一版的日誌 =====
  { const RAIN=ev('ev_rain_library_door'); const rain=async(pick)=>{ fresh(D('2025-09-24'),19,'campus',{introDone:true,classDone:true,afternoonDone:true}); G.weather='rain'; picks=[pick]; memos=[]; await EVENTS.run(RAIN); return memos.slice(); };
    let M=await rain('便利商店'); const obj=M.find(m=>m&&typeof m==='object');
    check('4. 語彤雨天選「便利商店應該有賣。」（她沒報名字）：日誌「雨天在總圖門口遇到一個借傘的女生」，不寫「遇到陳語彤」',!!obj&&obj.t==='雨天在總圖門口遇到一個借傘的女生'&&obj.named==='雨天在總圖門口遇到陳語彤'&&obj.who==='heroine_03'&&!M.includes('雨天在總圖門口遇到陳語彤'),J(M));
    const mt=typeof STORY.memoText==='function'?STORY.memoText:null; const e={day:G.day,...(obj||{})};
    const before=mt&&mt(G,e); if(typeof INV!=='undefined') INV.addContact(G,'heroine_03'); const after=mt&&mt(G,e);
    check('4. 日誌之後見面報了名字（拿到她的聯絡方式）才換成「雨天在總圖門口遇到陳語彤」',before==='雨天在總圖門口遇到一個借傘的女生'&&after==='雨天在總圖門口遇到陳語彤',J([before,after]));
    check('4. 舊存檔的日誌（字串）照舊顯示',!!mt&&mt(G,{day:1,t:'上了民法總則：要約之引誘'})==='上了民法總則：要約之引誘');
    M=await rain('一起走吧'); check('4. 對照：她報了名字的版本（一起撐傘）照舊「雨天在總圖門口遇到陳語彤」',M.includes('雨天在總圖門口遇到陳語彤')&&!M.some(m=>m&&typeof m==='object'),J(M)); }
  // ===== 第 6、7、9、10、11、14、16、17 項：台詞 =====
  { const V=evText('ev_kexin_video_study'); check('6. 可昕 12/16 視訊：「你們期末考還剩幾科？我在算哪天可以見面。」（不問第一科）',V.includes('你們期末考還剩幾科？我在算哪天可以見面。')&&!V.some(t=>/第一科/.test(t)));
    const N=evText('ev_kexin_tour_nccu'); check('7. 木柵大學導遊：「山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。」「下次你來，我們吃山下那家。」（AA_525 3-5 改「山上」→「山下」）；沒有「吃了一學期」「選宵夜」',N.includes('山下那家酸辣湯餃。開學到現在，我已經吃到老闆認得我了。')&&N.includes('下次你來，我們吃山下那家。')&&!N.some(t=>/吃了一學期|選宵夜/.test(t)),J(N.slice(-3)));
    const X=evText('ev_sk01_soc'); check('9. 阿勳：「兩個月。看也看會了。」（不是「一年。」）',X.includes('兩個月。看也看會了。')&&!X.includes('一年。看也看會了。'));
    const B=evText('ev_mid_autumn_bbq'); check('10. 中秋烤肉阿哲：「欸，明軒說你比我們大一屆？」（宿營時明軒問過「你幾年次的」）；「等一下。經濟系？重考？」照留',B.includes('欸，明軒說你比我們大一屆？')&&!B.some(t=>/你幾年次的/.test(t))&&B.includes('等一下。經濟系？重考？'));
    const K=ev('ev_kexin_visits_ntu'), KT=evText('ev_kexin_visits_ntu'); check('11. 可昕 K2：標題「她來台大找你」、「霖澤館。以前每天從社科院看過來。……第一次走進來。」',K.title==='她來首都帝大找你'&&KT.includes('A館。以前每天從社科院看過來。……第一次走進來。')&&!KT.some(t=>/比照片高/.test(t)),K.title);
    const A=evText('ev_almost_late'); check('14. 週二快遲到：「等一下還有課。你看了一眼手機，……」（大一上週二沒有 10:20 的課）',J(A)===J(['等一下還有課。你看了一眼手機，開始用走的假裝自己沒有在跑。']),J(A));
    const S=ev('ev_bohan_score').dialogue.find(l=>l&&l.consequences&&l.consequences.contact==='classmate_bohan');
    check('16. 柏翰期中放榜的最後一句：「考古題我晚上傳給你。」（8/29 起同寢，不再要聯絡方式那句），沒有聯絡方式的照樣加',!!S&&S.text==='考古題我晚上傳給你。',S&&S.text);
    const T=evText('ev_typhoon_noodles_y1'); check('17. 颱風夜柏翰：「（在讀張教授寄來的講義）……第二十頁了。」（10/12 群組說第十二頁）',T.includes('（在讀張教授寄來的講義）……第二十頁了。')&&!T.some(t=>/第十二頁了/.test(t))); }
  // ===== 第 15 項：9/4 晚上麵店阿哲 =====
  { const src=fs.readFileSync(path.join(ROOT,'src/story3d.js'),'utf8');
    check('15. 9/4 晚上麵店阿哲：「所以下午你跟小安去哪了？我在球場看到你們兩個一起走。」（總圖那條路不是往校門）',src.includes("'所以下午你跟小安去哪了？我在球場看到你們兩個一起走。'")&&!src.includes('我在球場看到你們往校門走')); }
  // ===== 第 13、18 項：以安閒聊階梯（tools/ladder/import_ladder.py 疊 AA_372）=====
  { const A=LADDER.characters.heroine_01, w16=(A.greet.when||[]).find(w=>J(w.week)===J([16,16])&&J(w.weekday)===J([5])), L9=A.steps.find(s=>s.id==='A-L9');
    check('13. 以安第 16 週週五：「考完我還會留在臺北一個月。」（1/20 才回台中）',!!w16&&w16.t==='考完我還會留在臺北一個月。',w16&&w16.t);
    check('18. 以安 A-L9：「你期中哪一週最多？期中考那週我有三科。」（三科都在第 8 週）',!!L9&&J(L9.lines)===J(['你期中哪一週最多？期中考那週我有三科。']),J(L9&&L9.lines));
    const allow=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>/AA_372_/.test(e.path));
    const lad=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(e=>e.path==='docs/story_planning/ladder/ladder_aa.json');
    check('13/18／第 6 節. 那兩句改由企劃線 ladder_aa.json@7fca0df5 匯入（白名單 approved；ladder.js 的來源寫 7fca0df5、不再寫 AA_372@ 疊句）；AA_372 本身的白名單換到 7fca0df5（第 6 節），之後第 7 節週末回台中（da55ec2b→965815f5，7fca0df5 在 history）',lad.length===1&&lad[0].sha==='7fca0df5'&&lad[0].status==='approved'&&allow.length===1&&allow[0].sha==='965815f5'&&allow[0].status==='approved'&&(allow[0].history||[]).some(h=>h.sha==='7fca0df5'&&h.task==='AA372-Y1S1-FIX-1021')&&/7fca0df5（1 檔）/.test(LADDER.source)&&!/AA_372@/.test(LADDER.source),J([lad.map(e=>e.sha),allow.map(e=>e.sha)])+' '+LADDER.source.slice(-60)); }
  // ===== 第 8 項：以安、沛珊說回台中的週末 =====
  { const pr=(id,k)=>STORY.presence(id,Object.assign({},G,{day:D(k)}));
    fresh(D('2025-09-26'),18,'campus',{introDone:true,classDone:true,afternoonDone:true}); R('heroine_01','FAM'); R('classmate_peishan','FAM');
    const AW=['2025-09-27','2025-09-28','2025-10-25','2025-10-26','2025-11-22','2025-11-23'], AH=['2025-09-26','2025-09-29','2025-10-04','2025-10-05','2025-10-24','2025-10-27','2025-11-21','2025-11-24'];
    check('8. 以安：第 4、8、12 週的週六日在台中（presence「回台中」）',AW.every(k=>{ const p=pr('heroine_01',k); return p.here===false&&p.away==='回台中'; }),J(AW.map(k=>pr('heroine_01',k))));
    check('8. 以安：前一天週五、隔週一、其他週末照舊在臺北（對照）',AH.every(k=>pr('heroine_01',k).here===true),J(AH.filter(k=>pr('heroine_01',k).here!==true)));
    const sched=(k,h,zone)=>{ G.day=D(k); G.weekday=wdOf(G.day); G.hour=h; G.zone=zone; return STORY.whereIs(GM,'heroine_01'); };
    let w=sched('2025-09-27',15,'cafe'); check('8. 以安 9/27（六）15:00：不在 Café（人物線索「回台中」）',!!w&&w.zone==null&&w.away==='回台中',J(w));
    w=sched('2025-10-04',15,'cafe'); check('8. 對照：第 5 週週六 15:00 照舊在 Café',!!w&&w.zone==='cafe',J(w));
    const row=ENCOUNTERS.rows.find(r=>r.who==='heroine_01'&&r.spot==='D06'); const enc=(k,h)=>{ G.day=D(k); G.weekday=wdOf(G.day); G.hour=h; G.zone='gongguan'; const why=[]; const ok=!!ENC.eligible(G,row,why); return {ok,why}; };
    let e1=enc('2025-09-28',10.5), e2=enc('2025-10-05',10.5);
    check('8. 以安美術館偶遇：9/28（日）不排（她在台中）；10/5（日）照舊（對照）',!e1.ok&&e2.ok,J([e1.why,e2.why]));
    const PW=['2025-09-06','2025-09-07','2025-09-20','2025-10-04','2025-10-05','2025-11-15','2025-12-13','2025-12-14'], PH=['2025-09-13','2025-09-14','2025-09-27','2025-10-11','2025-11-22','2025-12-06'];
    check('8. 沛珊：單數週的週六日在台中（presence「回台中」）',PW.every(k=>{ const p=pr('classmate_peishan',k); return p.here===false&&p.away==='回台中'; }),J(PW.filter(k=>pr('classmate_peishan',k).here!==false)));
    check('8. 沛珊：雙數週的週末在臺北（對照）',PH.every(k=>pr('classmate_peishan',k).here===true),J(PH.filter(k=>pr('classmate_peishan',k).here!==true)));
    const prow=ENCOUNTERS.rows.find(r=>r.who==='classmate_peishan'&&r.spot==='D12'); const penc=(k,h)=>{ G.day=D(k); G.weekday=wdOf(G.day); G.hour=h; G.zone='gongguan'; const why=[]; return {ok:!!ENC.eligible(G,prow,why),why}; };
    const p1=penc('2025-09-20',16), p2=penc('2025-09-27',16);
    check('8. 沛珊迪化街偶遇：單數週週六（9/20，第 3 週）不排；雙數週週六（9/27，第 4 週）照舊',!p1.ok&&p2.ok,J([p1.why,p2.why]));
    const greet=(k,zone)=>{ fresh(D(k),18,zone,{introDone:true,classDone:true,afternoonDone:true}); R('classmate_peishan','FAM'); R('heroine_01','FAM'); const out=[]; for(let i=0;i<4;i++){ const t=STORY.ladGreet(G,'classmate_peishan'); if(t) out.push(t); } return out; };
    const g1=greet('2025-09-19','library'), g2=greet('2025-09-26','library');
    check('8. 沛珊週五 18:00 的招呼：單數週（9/19，第 3 週）「我要去搭客運回台中了，下禮拜見！」；雙數週（9/26，第 4 週）不說',g1.includes('我要去搭客運回台中了，下禮拜見！')&&!g2.includes('我要去搭客運回台中了，下禮拜見！'),J([g1,g2]));
    const ga=(k)=>{ fresh(D(k),18,'library',{introDone:true,classDone:true,afternoonDone:true}); R('heroine_01','FAM'); const out=[]; for(let i=0;i<4;i++){ const t=STORY.ladGreet(G,'heroine_01'); if(t) out.push(t); } return out; };
    check('8. 對照：以安第 4 週週五照舊說「這個週末我要回台中。」',ga('2025-09-26').includes('這個週末我要回台中。'));
    fresh(D('2025-09-27'),14,'campus',{introDone:true,classDone:true,afternoonDone:true}); R('heroine_01','FAM'); R('classmate_peishan','FAM');
    const d1x=INV.decide(G,'heroine_01','cafe',D('2025-09-27'),15), d2x=INV.decide(G,'classmate_peishan','cafe',D('2025-09-20'),15);
    check('8. 約她們在台中的那天：以安 9/27、沛珊 9/20 都不答應（人不在臺北）',d1x.res==='decline'&&d1x.why==='away'&&d2x.res==='decline'&&d2x.why==='away',J([d1x,d2x]));
    const hv=typeof HV!=='undefined'&&HV.offer?HV.offer(Object.assign(G,{day:D('2025-09-20'),weekday:6}),'classmate_peishan'):null;
    check('8. 沛珊單數週末不開「我去台中找妳？」（那是寒暑假的）',hv==null,J(hv)); }
  // ===== 第 6 節（企劃線 7fca0df5，AA 答實作後十題）=====
  { // 第 3 題：之前在教室已經自我介紹過的，追出來那場不再報名字（對照）
    if(typeof D2.meetAn==='function'){ fresh(d4,15.3,'campus',{introDone:true,classDone:true,metAn:true,classAnswer:'good',AN_NAME_TOLD:true}); picks=[0]; await D2.meetAn(GM);
      check('第 6 節第 3 題. 對照：上課前已經自我介紹過（AN_NAME_TOLD）的玩家，追出來那場不再說「我是沈以安。……」',!said.some(s=>/我是沈以安/.test(s.t))&&said.some(s=>s.t==='呼——你走好快。'&&s.who==='小安'),J(said.slice(0,2))); }
    // 第 7 題、第 9 題
    const N=evText('ev_kexin_tour_nccu'); check('第 6 節第 7 題. 木柵大學導遊：拿掉「……這是分工，不是命令。」，最後一句「下次你來，我們吃山下那家。」（AA_525 3-5）',!N.some(t=>/分工/.test(t))&&N[N.length-1]==='下次你來，我們吃山下那家。',J(N.slice(-2)));
    const K2=ev('ev_kexin_visits_ntu'); check('第 6 節第 9 題. K2 的日誌：「可昕來首都帝大找你」（不是「可昕第一次來首都帝大」）',!!K2&&!!K2.consequences&&K2.consequences.memo==='可昕來首都帝大找你',K2&&K2.consequences&&K2.consequences.memo);
  }
  { // 第 10 題：9/3 她接受交友邀請起，手機的私訊串、聯絡人寫「溫書瑀」；「（直屬）」照舊 9/4 21:00 以後
    fresh(d31,15,'campus',{introDone:true,CAMP_Y1:true}); STORY.lawClassJoinY1(G); run(15,15.2); G.day=d1; G.weekday=1; run(21,21.1); G.day=d2; G.weekday=2; run(12.5,12.6); G.day=d3; G.weekday=3; run(7.9,8.1);
    const t0=PHONE.title(G,'p:heroine_05'); run(21,21.2); const dm=TH('p:heroine_05').filter(m=>m.from==='heroine_05'), t1=PHONE.title(G,'p:heroine_05'), w1=dm.length?PHONE.who(dm[0]):null;
    G.day=d4; G.weekday=4; run(21.1,21.2); const t2=PHONE.title(G,'p:heroine_05');
    check('第 6 節第 10 題. 9/3 接受交友邀請以後：學姊的私訊串標題「溫書瑀」（不是「不認識的女生」），她傳的訊息也寫「溫書瑀」',G.flags.SIS_CONTACTED===true&&t0==='溫書瑀'&&t1==='溫書瑀'&&dm.length>0&&w1==='溫書瑀',J([t0,t1,w1,dm.length]));
    check('第 6 節第 10 題. 「（直屬）」照舊 9/4 21:00 Kevin 公布以後才加；還沒在現實見過她（不算認識）',t2==='溫書瑀（直屬）'&&!SOCIAL.has('heroine_05','FIRST_MET'),t2);
  }
  { // 第 8 題：沛珊大一下、大二上也隔週回台中；迪化街只排雙數週六；以安 D26 加大一上第 4、8、12 週的週六
    const pr=(id,k)=>STORY.presence(id,Object.assign({},G,{day:D(k)}));
    fresh(D('2026-03-02'),10,'campus',{introDone:true,classDone:true,afternoonDone:true}); R('classmate_peishan','FAM'); R('heroine_01','FAM');
    const S2W=['2026-02-28','2026-03-01','2026-03-14','2026-03-28','2026-04-11','2026-05-09','2026-05-23','2026-06-06','2026-06-07'], S2H=['2026-03-07','2026-03-08','2026-03-21','2026-04-04','2026-04-18','2026-05-02','2026-06-13','2026-03-06','2026-03-09'];
    check('第 6 節第 8 題. 沛珊大一下：單數週的週六日在台中（presence「回台中」）',S2W.every(k=>{ const p=pr('classmate_peishan',k); return p.here===false&&p.away==='回台中'; }),J(S2W.filter(k=>pr('classmate_peishan',k).here!==false)));
    check('第 6 節第 8 題. 對照：大一下雙數週的週末、單數週的週五和週一在臺北',S2H.every(k=>pr('classmate_peishan',k).here===true),J(S2H.filter(k=>pr('classmate_peishan',k).here!==true)));
    check('第 6 節第 8 題. 大一下第 9 週週六 4/25：她帶課輔班去動物園（D08），那個週末留在臺北',pr('classmate_peishan','2026-04-25').here===true&&pr('classmate_peishan','2026-04-26').here===true);
    const Y2W=['2026-09-12','2026-09-26','2026-10-10','2026-10-24','2026-11-07','2026-11-21','2026-12-05','2026-12-06'], Y2H=['2026-09-19','2026-10-03','2026-10-17','2026-11-14','2026-11-28','2026-12-12'];
    check('第 6 節第 8 題. 沛珊大二上（12/17 消失以前）：單數週的週六日在台中；雙數週在臺北（對照）',Y2W.every(k=>{ const p=pr('classmate_peishan',k); return p.here===false&&p.away==='回台中'; })&&Y2H.every(k=>pr('classmate_peishan',k).here===true),J([Y2W.filter(k=>pr('classmate_peishan',k).here!==false),Y2H.filter(k=>pr('classmate_peishan',k).here!==true)]));
    check('第 6 節第 8 題. 對照：12/19 起照舊「聯絡不到」（消失期）',pr('classmate_peishan','2026-12-19').kind==='unreachable');
    const prow=ENCOUNTERS.rows.find(r=>r.who==='classmate_peishan'&&r.spot==='D12'); const penc=k=>{ G.day=D(k); G.weekday=wdOf(G.day); G.hour=16; G.zone='gongguan'; const why=[]; return {ok:!!ENC.eligible(G,prow,why),why}; };
    const P=[penc('2026-03-14'),penc('2026-03-21'),penc('2026-09-26'),penc('2026-10-03')];
    check('第 6 節第 8 題. 迪化街偶遇只排雙數週六：大一下第 3 週 3/14 不排、第 4 週 3/21 照排；大二上第 3 週 9/26 不排、第 4 週 10/3 照排',!P[0].ok&&P[1].ok&&!P[2].ok&&P[3].ok,J(P.map(x=>x.why)));
    const ps=CHARACTERS.classmate_peishan, e9=(()=>{ G.day=D('2026-04-25'); G.weekday=6; G.hour=10; return STORY.schedEnt(ps,G); })();
    check('第 6 節第 8 題. 對照：4/25 10:00 作息照舊「帶課輔班去動物園」（D08）',!!e9&&e9.enc==='D08',J(e9&&e9.away));
    const arow=ENCOUNTERS.rows.find(r=>r.who==='heroine_01'&&r.spot==='D26'); const aenc=k=>{ G.day=D(k); G.weekday=wdOf(G.day); G.hour=15; G.zone='taichung'; const why=[]; return {ok:!!ENC.eligible(G,arow,why),why}; };
    fresh(D('2025-09-26'),18,'campus',{introDone:true,classDone:true,afternoonDone:true}); R('heroine_01','FAM');
    const A=[aenc('2025-09-27'),aenc('2025-10-25'),aenc('2025-11-22'),aenc('2025-10-04')];
    check('第 6 節第 8 題. 以安在台中的偶遇（D26 審計新村）：大一上第 4、12 週的週六 9/27、11/22 照排；第 5 週 10/4（她在臺北）不排；第 8 週 10/25 是期中考週，AA_383 第 2 節拿掉（她照樣回台中、不給約）',A[0].ok&&!A[1].ok&&A[2].ok&&!A[3].ok,J(A.map(x=>x.why)));
    const ax=pr('heroine_01','2025-09-27'); check('第 6 節第 8 題. 對照：那幾個週末手機照舊「回台中」、邀約「回台中，不在臺北。」（不開寒暑假的「我去台中找妳？」）',ax.away==='回台中'&&ax.kind==='trip'&&INV.whyNot(Object.assign(G,{day:D('2025-09-27'),weekday:6}),'heroine_01')==='回台中，不在臺北。'&&(typeof HV==='undefined'||!HV.offer||HV.offer(G,'heroine_01')==null),J([ax,INV.whyNot(G,'heroine_01')]));
  }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
