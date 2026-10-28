// 交接包 v1（大一上）第 5 批：每天的手機小事（BB_95 4-4）——不需要瀏覽器。
// 檢查（修改前都會失敗：沒有每天的手機小事、F1 沒有留聯絡方式）：
//   大一上第 4 週起才有、一天最多一則、照順序輪流（不會連兩天同一個人）；那天已經有排好時間的劇情訊息就不加；時間已經過了的不挑。
//   每則的條件與內容（BB_95 原文）：Kevin 的貓影片＋學姊「收到。」（家族群組）；子晴拆五則（吉他社群組、社課那天）；子晴全黑截圖「不要問。」
//   （ZIQING_MAKING_SOMETHING、下午、群組不是私訊）；芷若「跟昨天一樣」（有聯絡方式；交往中 15:10、單身 22:07）；阿凱宵夜四則、間隔一分鐘
//   （醒著待在宿舍或便利商店時不傳、改天；睡過去的照原本的時間補）；方奕廷「新葉。你的。」（有黃金葛、這週澆過、有他的聯絡方式）；
//   明軒便當店（SAW_HIM_STUDY）；沛珊講義照片（讀書會群組、沒有字、不用招牌句）。每則一次。
//   F1：最後一句「死掉的話傳照片給我。」、拿到方奕廷的聯絡方式。
//   舊存檔（沒有 dp 欄位）照常；同一天重複呼叫不會重複送。
// 用法：node tests/v1_batch5_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/story3d.js','src/classes3d.js']) load(f);
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
  SOCIAL.bind(G); { const rk=SOCIAL.rel('kai'); rk.fam=25; }   /* 阿凱的「宵夜？」要有點熟以後（BB_120 1-5）：室友到第 4 週通常已經有點熟 */ EVENTS.bind(GM); said=[]; opts=[]; picks=[]; GM.npc={}; E.interactables=[]; E.npcs=[]; };
/* 一天裡每 3 分鐘（st：可以更細）跑一次（S.tick 的手機部分：phoneRules＋PHONE.tick）*/
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(G); } };
const dp=()=>G.msgs.filter(m=>m.tag&&m.tag.startsWith('dp_'));
const txt=L=>L.map(m=>(m.from==='player'?'你':(m.name||m.from||m.who))+'｜'+m.text);
const termDay=(w,wd)=>STORY.termDay('Y1S1',w,wd);
const W4MON=termDay(4,1), W5MON=termDay(5,1), W5TUE=termDay(5,2);
(async()=>{
  check('日曆：大一上第 4 週週一＝第 '+W4MON+' 天、第 5 週週一＝第 '+W5MON+' 天',W4MON===6&&W5MON===13,JSON.stringify({W4MON,W5MON}));
  /* ---------- F1：死掉的話傳照片給我 ---------- */
  { const e=STORY_EVENTS.find(x=>x.id==='ev_fangyt_pothos'); fresh(W4MON,12.5,'campus'); picks=['謝謝學長']; await EVENTS.run(e); const L=said.map(s=>s.t);
    check('F1 最後一句「死掉的話傳照片給我。」（BB_95 4-4）',L[L.length-1]==='死掉的話傳照片給我。'&&L[L.length-2]==='不用啦。我種太多了，房間放不下。'   /* AA_207 §5（BB_167 SC4 第 39 列；原本「不用謝。它比較需要謝謝你。」）*/,JSON.stringify(L.slice(-3)));
    check('F1 拿到方奕廷的聯絡方式（第 '+W4MON+' 天）',INV.hasContact(G,'npc_fangyt')&&G.contacts.npc_fangyt===W4MON); }
  /* ---------- 大一上第 2 週以前沒有（BB_170 第 26 列：開學改 9/1 以後第 1 週事情已經很多；原本第 4 週起）---------- */
  { const W1={LAW_START_DAY:-18,MAIN_D1:-13}; fresh(termDay(1,5),7.5,'dorm',W1); PHONE.join(G,'family_law','法律系直屬家族'); run(7.5,26); const a=dp().length;
    fresh(termDay(2,1),7.5,'dorm',W1); PHONE.join(G,'family_law','法律系直屬家族'); run(7.5,26); const b=dp();
    check('大一上第 1 週（9/5）沒有；第 2 週週一（9/8）開始有',a===0&&b.length>0,JSON.stringify({a,b:txt(b)}));
    check('Kevin 的第一支影片＋學姊「收到。」（家族群組，21:18；BB 2026-10-14 補的四支之一）',JSON.stringify(txt(b))===JSON.stringify(['Kevin｜📹（一隻貓把桌上的筆一支一支推下去）','溫學姊｜收到。'])&&b.every(m=>m.th==='g:family_law')&&Math.abs(b[0].h-21.3)<0.06,JSON.stringify(b.map(m=>[m.th,m.h])));
    run(7.5,26); check('同一天重複跑不會重複送',dp().length===2);
    const F0=Object.assign({},G.flags); fresh(W4MON+1,7.5,'dorm',F0); PHONE.join(G,'family_law','法律系直屬家族'); run(7.5,26);
    check('第二天輪到阿凱（你在宿舍：那天不傳），Kevin 不會連兩天',dp().length===0&&G.flags.dpN.kevin_video===1&&G.flags.dpLast==='kai_snack',JSON.stringify(G.flags));
    const F1=Object.assign({},G.flags); fresh(W4MON+7,7.5,'dorm',F1); PHONE.join(G,'family_law','法律系直屬家族'); run(7.5,26);
    check('一週後（還是待在宿舍）：阿凱那則跳過以後輪下去（不會每天都挑到阿凱、別人永遠輪不到）——輪回 Kevin 的第二支（Kevin 隔 7 天）',JSON.stringify(txt(dp()))===JSON.stringify(['Kevin｜📹（一隻柯基在海邊追浪，又被浪追回來）','溫學姊｜收到。']),JSON.stringify(txt(dp()))); }
  /* ---------- Kevin 的四支影片（BB 2026-10-14）：照順序、第四支 Kevin 多問一句 ---------- */
  { const only=(n)=>{ fresh(W4MON+n,7.5,'campus',{dpN:{kevin_video:n}}); PHONE.join(G,'family_law','法律系直屬家族'); const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(d=>d.id==='kevin_video'));
      try{ run(7.5,26); } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); } return txt(dp()); };
    /* 2026-10-28 改：AA_497 5-4（企劃線 7a38216ca）Kevin 的動物影片保留前 2 則，第 3、4 支照原本的日期換成他自己的事；跟著影片的「學姊妳到底有沒有看」「有。三分十二秒。」拿掉（tests/aa497_supporting_unit.js 5-4）*/
    check('Kevin 第三支（AA_497 5-4 換）：「補習班的學生問我律師是不是很賺 我說等我考上再告訴你」',JSON.stringify(only(2))===JSON.stringify(['Kevin｜補習班的學生問我律師是不是很賺 我說等我考上再告訴你','溫學姊｜收到。']),JSON.stringify(only(2)));
    const v4=only(3); check('Kevin 第四支（AA_497 5-4 換）：「今天在法圖趴著睡 醒來臉上印著考古題 民法第一百八十四條」；「學姊妳到底有沒有看」「有。三分十二秒。」拿掉',JSON.stringify(v4)===JSON.stringify(['Kevin｜今天在法圖趴著睡 醒來臉上印著考古題 民法第一百八十四條','溫學姊｜收到。']),JSON.stringify(v4));
    check('Kevin 最多四次：第五次不送',only(4).length===0); }
  /* ---------- 一天最多一則、輪流 ---------- */
  { const flags={ZIQING_MAKING_SOMETHING:true,POTHOS:true}; fresh(W5MON,7.5,'campus',flags);
    PHONE.join(G,'family_law','法律系直屬家族'); PHONE.join(G,'guitar','吉他社'); PHONE.join(G,'public_law','公法讀書會'); G.contacts={heroine_02:3,npc_fangyt:6,classmate_mingxuan:8}; SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY');
    G.flags.pothosWaterWk=STORY.pothosWeek(W5MON);
    const seen=[]; let day=W5MON, F=G.flags, contacts=G.contacts;
    for(let k=0;k<18;k++){ const before=dp().length;   /* 18 天（9/29～10/16）：第 7 週週一 10/13 是颱風假（吉他社不上課），子晴的五則排到下一次社課（週三 10/15）*/ run(7.5,26.5,0.01); const got=dp().slice(before); seen.push({day,ids:[...new Set(got.map(m=>m.tag.split('_').slice(1,-2).join('_')))],n:got.length});
      const msgs=G.msgs, phone=G.phone, soc=G.social; day++; fresh(day,7.5,'campus',F); G.msgs=msgs; G.phone=phone; G.contacts=contacts; G.social=soc; SOCIAL.bind(G); F=G.flags; F.pothosWaterWk=STORY.pothosWeek(day); }
    check('一天最多一則（每天的 dp_ 訊息都來自同一則）',seen.every(s=>s.ids.length<=1),JSON.stringify(seen));
    const by=id=>G.msgs.filter(m=>m.tag&&m.tag.startsWith('dp_'+id+'_'));
    const order=seen.map(s=>s.ids[0]).filter(Boolean);
    const cnt={}; for(const id of order) cnt[id]=(cnt[id]||0)+1;
    check('照順序輪流（不會連兩天同一則；Kevin 的影片至少隔 7 天）：Kevin（最多四次）、子晴五則（社課那天）、子晴截圖、芷若、阿凱、方奕廷、明軒、沛珊都出現過；其他每則一次',order.every((id,i)=>i===0||id!==order[i-1])&&['kevin_video','ziqing_five','ziqing_black','zhiruo_latte','kai_snack','fangyt_leaf','mingxuan_bento','peishan_handout'].every(id=>cnt[id]>=1&&cnt[id]<=(id==='kevin_video'?4:1))&&(()=>{ const kd=by('kevin_video').filter(m=>m.from==='kevin').map(m=>m.day); return kd.every((d,i)=>i===0||d-kd[i-1]>=7); })(),JSON.stringify(seen.map(x=>[x.day,x.ids[0]||'-'])));
    check('學姊讀書會前一天那則拿掉了（法服沒有讀書會，AA_218 17-4、BB_191 §7）',by('sis_study_eve').length===0&&!STORY.DAILY_PHONE.some(d=>d.id==='sis_study_eve'));
    const z5=by('ziqing_five'); const zd=z5.length?z5[0].day:null;
    check('子晴拆三則（BB_175 D3 改稿、吉他社群組、17:30、社課那天＝週一或週三）',JSON.stringify(z5.map(m=>m.text))===JSON.stringify(['今天社課','練 C 和弦','不會的不准走喔'])&&z5.every(m=>m.th==='g:guitar'&&m.from==='heroine_04')&&zd!=null&&[1,3].includes(CALENDAR.dateOf(zd).wd)&&ACTIVITIES.on(ACTIVITIES.list.find(a=>a.id==='club_guitar'),zd)&&Math.abs(z5[0].h-17.5)<0.06,JSON.stringify(z5.map(m=>[m.day,m.h])));
    const zb=by('ziqing_black');
    check('子晴全黑截圖＋「不要問。」：吉他社群組（不是私訊）、下午',JSON.stringify(zb.map(m=>m.text))==='["📷（截圖：畫面全黑，角落只有一個小小的插座）","不要問。"]'&&zb.every(m=>m.th==='g:guitar')&&zb[0].h>=12&&zb[0].h<18,JSON.stringify(zb.map(m=>[m.th,m.h])));
    const zr=by('zhiruo_latte');
    check('芷若（單身的存檔）22:07：「欸今天超好笑」……「他說對」五則（BB_175 D5）',zr.length===5&&zr[0].text==='欸今天超好笑'&&zr[4].text==='他說對'&&zr.every(m=>m.th==='p:heroine_02')&&Math.abs(zr[0].h-22.12)<0.06,JSON.stringify(zr.map(m=>[m.h,m.text])));
    const ks=by('kai_snack');
    const kmin=ks.map(m=>Math.round(m.h*60));   /* 手機上顯示的分鐘（訊息時間存到 0.01 小時）*/
    check('阿凱四則、間隔一分鐘（你在校園，不在宿舍；手機上 22:42、22:43、22:44、22:45）',JSON.stringify(ks.map(m=>m.text))==='["宵夜？","我餓了","我已經在便利商店了","你要什麼"]'&&ks.every(m=>m.th==='p:kai')&&kmin.slice(1).every((m,i)=>m-kmin[i]===1)&&kmin[0]===22*60+42,JSON.stringify(ks.map(m=>m.h)));
    const fy=by('fangyt_leaf');
    check('方奕廷：你傳新葉的照片，他回「新葉耶。」「你養得不錯。」（BB_175 D7）',JSON.stringify(fy.map(m=>[m.from,m.text]))==='[["player","📷（黃金葛長出一片新葉）"],["npc_fangyt","新葉耶。"],["npc_fangyt","你養得不錯。"]]',JSON.stringify(fy.map(m=>[m.from,m.text])));
    const mx=by('mingxuan_bento');
    check('明軒：「公館新開一家便當 八十塊」「我加進清單了」「念書念到餓的時候可以去 哈哈」（BB_175 D8）',mx.length===3&&mx[0].text==='公館新開一家便當 八十塊'&&mx[2].text==='念書念到餓的時候可以去 哈哈'&&mx.every(m=>m.th==='p:classmate_mingxuan'));
    const ps=by('peishan_handout');
    check('沛珊：公法讀書會群組一張講義照片（邊角一個問號、沒有字、不用招牌句；BB_191 §8-7）',ps.length===1&&ps[0].th==='g:public_law'&&ps[0].from==='classmate_peishan'&&ps[0].text.startsWith('📷')&&!/奇怪的問題/.test(ps[0].text),JSON.stringify(ps.map(m=>m.text)));
    const rep=Object.entries(G.flags.dpN||{}).filter(([k,v])=>v>(k==='kevin_video'?4:1)); check('每則一次（Kevin 最多四次）',rep.length===0,JSON.stringify(G.flags.dpN)); }
  /* ---------- 條件 ---------- */
  { const only=(id,flags,setup,h0,h1,zone)=>{ fresh(W5TUE,h0==null?7.5:h0,zone||'campus',Object.assign({},flags)); if(setup) setup(); const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(d=>d.id===id));
      try{ run(h0==null?7.5:h0,h1==null?26.5:h1); } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); } return dp(); };
    check('子晴五則：不是社課那天（週二）不送',only('ziqing_five',{},()=>PHONE.join(G,'guitar','吉他社')).length===0);
    check('子晴截圖：沒有 ZIQING_MAKING_SOMETHING 不送；不在吉他社群組不送',only('ziqing_black',{},()=>PHONE.join(G,'guitar','吉他社')).length===0&&only('ziqing_black',{ZIQING_MAKING_SOMETHING:true}).length===0);
    const zrD=only('zhiruo_latte',{dating_kexin:true},()=>{ G.contacts={heroine_02:3}; });
    check('芷若：交往中（大一上所有玩家）15:10（AA_112 8-1；BB_175 D5 五則，第一則 15:10）',zrD.length===5&&Math.abs(zrD[0].h-(15+10/60))<0.06,JSON.stringify(zrD.map(m=>m.h)));
    check('芷若：今天才拿到聯絡方式（第一則私訊那天）不送；沒有聯絡方式不送',only('zhiruo_latte',{},()=>{ G.contacts={heroine_02:W5TUE}; }).length===0&&only('zhiruo_latte',{}).length===0);
    check('阿凱：醒著待在宿舍（他的位子上看得到他）不送、改天',only('kai_snack',{},null,7.5,26.5,'dorm').length===0&&!(G.flags.dpN&&G.flags.dpN.kai_snack));
    check('阿凱：在便利商店也不送',only('kai_snack',{},null,7.5,26.5,'cvs').length===0);
    { const save=SOCIAL.rel('kai').fam; const r=only('kai_snack',{},()=>{ SOCIAL.rel('kai').fam=10; },7.5,26.5,'campus'); check('阿凱：還不到「有點熟」（熟悉 10）——「宵夜？」沒有你的份（BB_120 1-5 固定的改變）',r.length===0,JSON.stringify(r)); }
    { const r=only('kai_snack',{},null,7.5,21,'dorm'); const F0=Object.assign({},G.flags); const msgs=G.msgs, phone=G.phone; fresh(W5TUE+1,7.5,'dorm',F0); G.msgs=msgs; G.phone=phone;
      const keep=STORY.DAILY_PHONE.slice(); STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep.filter(d=>d.id==='kai_snack')); try{ run(7.5,8); } finally { STORY.DAILY_PHONE.splice(0,STORY.DAILY_PHONE.length,...keep); }
      const k=dp(); check('阿凱：21:00 就睡了（睡過 22:42）→ 醒來時照原本的時間補在昨晚（第 '+W5TUE+' 天 22:42 起）',r.length===0&&k.length===4&&k.every(m=>m.day===W5TUE)&&Math.abs(k[0].h-22.7)<0.02,JSON.stringify(k.map(m=>[m.day,m.h]))); }
    check('方奕廷：這週沒澆不送；沒有黃金葛不送；沒有他的聯絡方式不送',only('fangyt_leaf',{POTHOS:true,pothosWaterWk:STORY.pothosWeek(W5TUE)-1},()=>{ G.contacts={npc_fangyt:6}; }).length===0&&only('fangyt_leaf',{pothosWaterWk:STORY.pothosWeek(W5TUE)},()=>{ G.contacts={npc_fangyt:6}; }).length===0&&only('fangyt_leaf',{POTHOS:true,pothosWaterWk:STORY.pothosWeek(W5TUE)}).length===0);
    check('明軒：沒有 SAW_HIM_STUDY 不送',only('mingxuan_bento',{},()=>{ G.contacts={classmate_mingxuan:8}; }).length===0);
    check('沛珊：不在公法讀書會群組不送',only('peishan_handout',{}).length===0);
    check('時間已經過了的不挑（23:00 才讀檔：沛珊 21:36 那則今天不送）',only('peishan_handout',{},()=>PHONE.join(G,'public_law','公法讀書會'),23,26.5).length===0);
    { fresh(W5TUE,7.5,'campus',{}); PHONE.join(G,'public_law','公法讀書會'); PHONE.at(G,W5TUE,20,[{th:'g:public_law',from:'heroine_05',name:'溫學姊',text:'（劇情訊息）'}],'story_x'); run(7.5,26.5);
      check('那天已經有排好時間的劇情訊息就不加',dp().length===0&&G.msgs.some(m=>m.tag==='story_x')); } }
  /* ---------- 舊存檔 ---------- */
  { fresh(W5TUE,7.5,'campus',{}); delete G.phone; G.msgs=[{day:3,h:20,who:'zhe',text:'舊訊息',iv:null}]; run(7.5,26.5);
    check('舊存檔（沒有 dp 欄位、舊訊息格式）照常：舊訊息還在、今天的一則送到（從第一則開始輪：學姊讀書會前一天那則拿掉以後，條件成立的是阿凱的宵夜——一則四句，同一個人）（「走啦」群組 2025-08-13 的照片排在更前面，AA_157）',G.msgs.some(m=>m.text==='舊訊息'&&m.day===3)&&dp().length>=1&&dp().every(m=>m.from===dp()[0].from),JSON.stringify(txt(dp()))); }
  /* ---------- 大一上以外沒有 ---------- */
  { const d=termDay(18,2)||null; let after=null; for(let x=100;x<400;x++){ const t=CALENDAR.termOf(x); if(t&&t.id!=='Y1S1'){ after=x; break; } }
    fresh(after,7.5,'campus',{}); PHONE.join(G,'public_law','公法讀書會'); run(7.5,26.5); check('大一下（第 '+after+' 天）沒有（4-4 是大一上的）',dp().length===0); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
