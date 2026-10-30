// 學姊（溫書瑀）準備法研所的那一年（祐廷法律大一；SIS-GRADSCHOOL-1017）：交付單 AA_332（AA-C b4c3204d）第 2 節的表逐列、第 8 節 G1～G9。
// 台詞照 AA_284 第 2 節（b4c3204d，含審稿改的三處）、BB_122 ★-3 5-2／5-3，逐字比對。
// 2026-10-21 AA_360 第 2 節（使用者 10-17 回 BB-LOGIC-14）：2-5 改成 1/24～1/27 晚上路過總圖（1/26 私訊、20:00 出遊、快轉 1/26 的停點拿掉）、開頭和選項 c 換；
//   2/2、2/3 前置 SIS_STUDY||SIS_PREEXAM_NIGHT；2-7 第一頁她自己寫。這個檔照新規格改，細的條件和舊存檔在 tests/aa360_unit.js。
// 修改前：沒有 src/sis_grad3d.js（SISG），邀約不設上限、熱水讀數值門檻、possible_endings 有三個、沒有 2-2～2-12 的事件與訊息。用法：node tests/sis_grad_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|VAC|VAC_DATA|DATE|DATE_DATA|DATE_LINES|ROM|CONFESS_LINES|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|SISG)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js',
  'src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/msg3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/classes3d.js','src/sis_grad3d.js'])
  if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const sec=async(name,f)=>{ try{ await f(); }catch(e){ check(name+'（執行出錯）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
const cgs=[]; global.ADV={active:false,preload(){},begin(){},end(){},log(){},speaker(){},cg(id){ cgs.push(id); },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen'],study:()=>[]};
let said=[], opts=[], picks=[], G=null, cards=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption(){},sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},money(d){ G.money+=d; },setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},spawnCharacter:(id,x,z)=>{ const n={obj:{position:{x,y:0,z},rotation:{y:0}},lv:0,charId:id}; GM.npc[id]=n; E.npcs.push(n); return n; },despawnLater(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },
  choose:async o=>{ if(++chooseN>300) throw new Error('選單一直重複（測試保護）'); opts.push(Object.assign(o.map(q=>q.t||q.text),{all:[].concat(...o.map(q=>q.sub||[q.t||q.text]))})); const want=picks.shift(); if(typeof want==='string'){ let k=o.findIndex(q=>(q.t||q.text).includes(want)); if(k<0){ k=o.findIndex(q=>(q.sub||[]).some(s=>s.includes(want))); if(k>=0&&!o[k].dim) picks.unshift(want); } /* INVITE-MENU-1030 分層：要選的名稱在某一類裡（選項的 sub）＝先選那一類，這個 pick 留給下一層（那一類整個灰掉＝和原本選到灰掉的那一項一樣，用掉這個 pick）*/ return k<0?0:k; } return want||0; }};
let chooseN=0;
global.GAME=undefined;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(day,hour,zone,flags)=>{ G={v:3,day,hour,zone:zone||'dorm',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,afternoonDone:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0,study:0},stage:'law'};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); said=[]; opts=[]; picks=[]; cards=[]; cgs.length=0; chooseN=0; GM.npc={}; E.interactables=[]; E.npcs=[]; if(STORY._fy) STORY._fy.reset(); };
const ID='heroine_05';
const R=(fam,trust,comf,o)=>{ const r=SOCIAL.rel(ID); r.fam=fam; r.trust=trust||0; r.comf=comf||0; if(o) Object.assign(r,o); SOCIAL.remember(ID,'FIRST_MET',''); };
const FAM=()=>R(25,10,5), FRI=()=>R(45,30,20);
const K=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h, td=(t,w,wd)=>STORY.termDay(t,w,wd);
const setT=(day,h)=>{ G.day=day; G.hour=h; G.weekday=wdOf(day); };
const tick=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const span=(t0,t1,st)=>{ st=st||0.05; for(let t=t0;t<=t1+1e-9;t+=st){ const d=Math.floor(t/24); setT(d,+(t-d*24).toFixed(4)); tick(); } };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const lines=()=>said.map(s=>(s.who?s.who+'：':'')+s.t);
const txts=()=>said.map(s=>s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th);
const her=()=>TH('p:'+ID).filter(m=>m.from===ID);
const fam=()=>TH('g:family_law');
const tagMsgs=tag=>(G.msgs||[]).filter(m=>m.tag===tag);
const herHere=()=>{ const n={obj:{position:{x:0.5,y:0,z:0}},lv:0,charId:ID}; GM.npc[ID]=n; E.npcs=[n]; E.player.obj.position.x=0; E.player.obj.position.z=0; E.player.lv=0; return n; };
const joinFam=()=>PHONE.join(G,'family_law','法律系直屬家族');
const relOf=()=>Object.assign({},SOCIAL.rel(ID));
const ask=tag=>(G.msgs||[]).find(m=>m.ask&&m.ask.id===tag);
const answer=(askId,k)=>PHONE.answer(G,askId,k);
const DECL=['「這學期我在準備研究所，晚上大多在圖書館。……約我沒關係，我只是真的沒空。」','「等我考完，你再約一次。」','「今天不行。刑訴在等我。」','「這週的時間用完了。下週再問我。」'];
(async()=>{
  /* ---------- 0. 掛勾、素材、舊資料 ---------- */
  await sec('0',async()=>{
    check('0. SISG 載入、登記在 STORY.TICKS／PHONE_RULES／WAKE_AT、HOME.STOPS',typeof SISG!=='undefined'&&STORY.TICKS.length>0&&STORY.PHONE_RULES.length>0&&STORY.WAKE_AT.length>0&&Array.isArray(HOME.STOPS)&&HOME.STOPS.length>0);
    const ids=['ev_sis_lawlib_meet','ev_sis_walk_alone','ev_sis_low_night','ev_sis_new_planner','ev_sis_results_dinner_y1','ev_sis_books_y1s2','ev_sis_give_notes','ev_sis_graduation'];
    check('0. 八個事件都在 STORY_EVENTS（2-2、2-4、2-5、2-7、2-9、2-10、2-11、2-12）',ids.every(i=>!!ev(i)),ids.filter(i=>!ev(i)).join(' '));
    const idx=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const a=idx.indexOf('src="src/sis_grad3d.js'), b=idx.indexOf('<script>GAME.boot();</script>'), c=idx.indexOf('src="src/story3d.js');
    check('0. index.html：sis_grad3d.js 在 story3d.js 之後、GAME.boot() 之前',a>0&&a<b&&a>c);
    const adv=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const m=/^const CG_REGISTRY=(\{.*\});$/m.exec(adv); const REG=m?eval('('+m[1]+')'):{}; const cg=REG.cg_planner_four_years_heroine05;
    check('0. BCG-42 登錄在 CG_REGISTRY（一行）、檔案在 assets/cg/heroine_05/',!!cg&&cg.file==='assets/cg/heroine_05/cg_planner_four_years.webp'&&fs.existsSync(path.join(ROOT,cg.file)),JSON.stringify(cg));
    check('0. LICENSES.md 記了 BCG-42 的來源與授權',/cg_planner_four_years\.webp/.test(fs.readFileSync(path.join(ROOT,'LICENSES.md'),'utf8')));
    check('0. 錄取固定（AA_332 第 1 節第 1 點）：possible_endings 只剩「她考上法研所」',JSON.stringify(CHARACTERS[ID].possible_endings)===JSON.stringify(['她考上法研所']),JSON.stringify(CHARACTERS[ID].possible_endings));
    check('0. 記憶名稱：SIS_LAWLIB_NOTE、SIS_RESULT_TOLD',SOCIAL.MEMORY_LABEL.SIS_LAWLIB_NOTE==='十月的法圖，她用便利貼問你小考'&&SOCIAL.MEMORY_LABEL.SIS_RESULT_TOLD==='放榜那天，你先查到她的名字');
  });
  /* ---------- 2-1 邀約上限、婉拒不扣分（G5）---------- */
  await sec('2-1',async()=>{
    const P=INV.place('noodle');
    const tryInv=(day,h,pid)=>{ setT(day,8); const Q=INV.place(pid||'noodle'); return INV.personal(G,ID,Q,day,h,INV.decide(G,ID,Q.id,day,h)); };
    const take=(r,day,h,pid)=>{ if(r.res==='accept') INV.accept(G,ID,pid||'noodle',day,h,{by:'player'}); return r.res==='accept'; };
    fresh(td('Y1S1',5,1),8,'dorm',{SIS_W1:true}); FRI(); const rel0=relOf(); const got={}, decl=[];
    for(let w=5;w<=16;w++){ got[w]=0; for(const wd of [2,4]){ const d=td('Y1S1',w,wd), r=tryInv(d,19); if(take(r,d,19)) got[w]++; else if(r.res==='decline'&&r.why==='exam') decl.push(r.lines[0]); } }
    check('2-1／G5. 十月（第 5～9 週）一週只答應一次',[5,6,7,8,9].every(w=>got[w]===1),JSON.stringify(got));
    check('2-1／G5. 十一月（第 10～13 週）兩週一次（10–11、12–13）',got[10]+got[11]===1&&got[12]+got[13]===1,JSON.stringify(got));
    check('2-1／G5. 十二月起（第 14 週～）都婉拒',[14,15,16].every(w=>got[w]===0),JSON.stringify(got));
    check('2-1. 婉拒句照 AA_284 2-1 四句輪流、不連續重複',decl.length>=4&&decl.every((t,i)=>t===DECL[i%4])&&decl.every((t,i)=>i===0||t!==decl[i-1]),JSON.stringify(decl.slice(0,5)));
    const rel1=relOf(); check('2-1／G5. 婉拒不扣任何數值',['fam','trust','aff','resp','comf','rom','npcRom'].every(k=>(+rel1[k]||0)>=(+rel0[k]||0)),JSON.stringify(rel0)+' → '+JSON.stringify(rel1));
    check('2-1. 「不是不想去，是真的在」不在遊戲裡（AA_332 第 3 節）',!fs.readdirSync(path.join(ROOT,'src')).concat(fs.readdirSync(path.join(ROOT,'src/data')).map(f=>'data/'+f)).filter(f=>/\.js$/.test(f)).some(f=>fs.readFileSync(path.join(ROOT,'src',f),'utf8').includes('不是不想去，是真的在')));
    fresh(td('Y1S1',7,1),8,'dorm',{SIS_W1:true}); FRI();
    { const d1=td('Y1S1',7,2), r1=tryInv(d1,12+10/60); take(r1,d1,12+10/60); const d2=td('Y1S1',7,3), r2=tryInv(d2,19); take(r2,d2,19); const d3=td('Y1S1',7,4), r3=tryInv(d3,19);   /* 第 7 週週一 10/13 是颱風假（麵店不開），從週二起 */
      check('2-1. 平日中午 12:00～13:00 吃飯一律答應、不算次數（週二午餐、週三晚餐都答應，週四才婉拒）',r1.res==='accept'&&r2.res==='accept'&&r3.res==='decline'&&r3.why==='exam',[r1.res,r2.res,r3.res+':'+r3.why].join(' ')); }
    fresh(td('Y1S1',14,3),8,'dorm',{SIS_W1:true}); FRI();
    { const d=td('Y1S1',14,3), r=tryInv(d,12+10/60), rl=tryInv(td('Y1S1',14,2),19,'library'), rj=tryInv(K('2026-01-13'),19), rx=tryInv(K('2026-02-02'),12+10/60), rp=tryInv(K('2026-02-03'),19);
      check('2-1. 第 14 週午餐照樣答應；總圖（一起念書）不受上限；1 月晚餐婉拒；2/2 午餐（她在考試、不在學校）婉拒；2/3（筆試以後）照一般規則',r.res==='accept'&&!(rl.res==='decline'&&rl.why==='exam')&&rj.res==='decline'&&rj.why==='exam'&&rx.res==='decline'&&rx.why==='exam'&&!(rp.why==='exam'),[r.res,rl.res+':'+rl.why,rj.res,rx.res,rp.res+':'+rp.why].join(' ')); }
    /* 當面約（INV.flow）：婉拒句講出來、數值沒動 */
    fresh(td('Y1S1',15,2),15,'campus',{SIS_W1:true}); FRI(); const r0=relOf(); picks=['阿鳳麵店','明天 19:00']; const iv=await INV.flow(GM,ID,null,false);
    check('2-1. 手機約她（第 15 週）：她說婉拒句、沒有約成、數值沒動',iv===null&&said.some(s=>DECL.includes(s.t))&&JSON.stringify(relOf())===JSON.stringify(r0),JSON.stringify(lines().slice(-2)));
    /* 校外約會：第 10 週起「等我考完。」；第 9 週以前照一般條件 */
    const dateOk=()=>{ const r=SOCIAL.rel(ID); Object.assign(r,{fam:50,trust:35,comf:20,npcRom:35,rom:10}); };
    fresh(td('Y1S1',10,2),15,'campus',{SIS_W1:true}); dateOk(); said=[]; picks=['算了','算了']; await DATE.menu(GM,ID,null);
    const s10=txts().slice(); fresh(td('Y1S1',9,2),15,'campus',{SIS_W1:true}); dateOk(); said=[]; picks=['算了','算了','算了']; await DATE.menu(GM,ID,null); const s9=txts().slice();
    fresh(K('2026-01-14'),15,'dorm',{SIS_W1:true}); dateOk(); said=[]; picks=['算了','算了','算了']; await DATE.menu(GM,ID,null); const sj=txts().slice();
    fresh(td('Y1S1',13,4),15,'campus',{SIS_W1:true}); dateOk(); said=[]; picks=['算了','算了']; await DATE.menu(GM,ID,null); const s13=txts().slice();
    fresh(td('Y1S1',14,2),15,'campus',{SIS_W1:true}); dateOk(); said=[]; picks=['算了','算了']; await DATE.menu(GM,ID,null); const s14=txts().slice();
    const FAR='校外的話，等我考完。……考完我想去很遠的地方。';
    check('2-1. 校外約會：第 10～13 週她說「等我考完。」；第 9 週照一般條件（不說）',s10.includes('等我考完。')&&s13.includes('等我考完。')&&!s10.includes(FAR)&&!s9.includes('等我考完。')&&!s9.includes(FAR),JSON.stringify([s10,s9.slice(0,2),s13]));
    check('2-1. AA_339 第 4 題：第 14 週～筆試（1 月寒假也是）換一句「校外的話，等我考完。……考完我想去很遠的地方。」',s14.includes(FAR)&&sj.includes(FAR)&&!s14.includes('等我考完。')&&!sj.includes('等我考完。'),JSON.stringify([s14,sj]));
  });
  /* ---------- 2-2 十月的法圖 ---------- */
  await sec('2-2',async()=>{
    const e=ev('ev_sis_lawlib_meet'); const at=(w,wd,h,o)=>{ o=o||{}; fresh(td('Y1S1',w,wd),h,o.zone||'lawlib',o.noW1?{}:{SIS_W1:true}); if(o.acq) R(10); else FAM(); if(!o.away) herHere(); return EVENTS.check(e); };
    const r={ok:at(6,3,19.5),w9:at(9,3,20.9),w5:at(5,3,19.5),w10:at(10,3,19.5),tue:at(6,2,19.5),late:at(6,3,21.1),noW1:at(6,3,19.5,{noW1:true}),acq:at(6,3,19.5,{acq:true}),cafe:at(6,3,19.5,{zone:'cafe'}),away:at(6,3,19.5,{away:true})};
    check('2-2. 大一上第 6～9 週週三 19:00～21:00、法圖、她在、有點熟以上、SIS_W1；其他都不演',r.ok&&r.w9&&!r.w5&&!r.w10&&!r.tue&&!r.late&&!r.noW1&&!r.acq&&!r.cafe&&!r.away,JSON.stringify(r));
    { fresh(td('Y1S1',6,3),19.5,'lawlib',{SIS_W1:true}); FAM(); herHere(); const r0=relOf(); picks=[0]; await EVENTS.run(e); const L=txts();
      check('2-2. 台詞逐字：便利貼「你民總小考考幾分？」→「七十二。」→「錯哪裡？」',JSON.stringify(L)===JSON.stringify(['（她的桌上三疊書、一疊考古題，便利貼排成一排顏色。桌角壓著一般入學考試的簡章。）','學弟，你走路好大聲。','……坐吧。旁邊沒人。','（十分鐘後，她推過來一張便利貼：「你民總小考考幾分？」）','（她在便利貼下面寫：「錯哪裡？」）','（你們用便利貼講了二十分鐘。）']),JSON.stringify(L));
      const r1=relOf(); check('2-2. 熟悉 +2、信任 +1、記 SIS_LAWLIB_NOTE（旗標＋記憶）、只一次',r1.fam-r0.fam===2&&r1.trust-r0.trust===1&&G.flags.SIS_LAWLIB_NOTE===true&&SOCIAL.has(ID,'SIS_LAWLIB_NOTE')&&!EVENTS.check(e)); }
    { fresh(td('Y1S1',6,3),19.5,'lawlib',{SIS_W1:true}); FAM(); herHere(); picks=[1]; await EVENTS.run(e); check('2-2. 畫問號 → 她畫一個哭臉推回來',txts().slice(-1)[0]==='（她看了一眼，在問號旁邊畫一個哭臉，推回來。）'&&opts[0].join('|')==='「七十二。」|（在便利貼上畫一個問號）'); }
  });
  /* ---------- 2-3 解鎖、她邀、一起念書的日常（G2）---------- */
  await sec('2-3',async()=>{
    const tue=td('Y1S1',7,2);
    fresh(tue,20,'dorm',{SIS_W1:true}); FRI(); span(Tm(tue,20),Tm(tue,21.6)); const m=her();
    check('2-3／G2. 第 7 週星期二 21:30：「我旁邊的位子常常空著」兩則（AA_458 3-4 尾巴補句號）＋兩個選項；SIS_STUDY',m.length===2&&m[0].text==='你晚上如果也要讀書，可以來法圖。我旁邊的位子常常空著。'&&m[1].text==='不要講話就好。閉館的時候，可以一起去買飲料。'&&Math.abs(m[0].h-21.5)<0.02&&!!m[1].ask&&m[1].ask.opts.map(o=>o.t).join('|')==='好。|這週有點忙。'&&G.flags.SIS_STUDY===true&&!!G.events.done.ev_sis_study_invite,JSON.stringify(m.map(x=>[x.h,x.text])));
    answer(m[1].ask.id,0); check('2-3. 「好。」→「明天七點。」',her().slice(-1)[0].text==='明天七點。');
    { fresh(tue,20,'dorm',{SIS_W1:true}); FRI(); span(Tm(tue,21.4),Tm(tue,21.6)); const a=ask('sisg_study_invite'); answer(a.ask.id,1); check('2-3. 「這週有點忙。」→「好。位子還是空的。」（也解鎖）',her().slice(-1)[0].text==='好。位子還是空的。'&&G.flags.SIS_STUDY===true); }
    { const none=(day,o)=>{ fresh(day,20,'dorm',o.w1===false?{}:{SIS_W1:true}); if(o.fam) FAM(); else FRI(); span(Tm(day,21),Tm(day,23)); return !her().length&&!G.flags.SIS_STUDY; };
      check('2-3. 第 6 週星期二、第 7 週星期一、只到有點熟、沒有 SIS_W1：都不傳',none(td('Y1S1',6,2),{})&&none(td('Y1S1',7,1),{})&&none(tue,{fam:true})&&none(tue,{w1:false})); }
    { fresh(tue,22,'dorm',{SIS_W1:true}); FRI(); setT(tue+1,8); tick(); const m2=her(); check('2-3. 星期二晚上睡著：隔天早上補（時間照星期二 21:30）',m2.length===2&&m2[0].day===tue&&Math.abs(m2[0].h-21.5)<0.05,JSON.stringify(m2.map(x=>[x.day,x.h]))); }
    /* 她邀：週日 21:30「這週三晚上，法圖。」（一週最多一次） */
    { fresh(tue,20,'dorm',{SIS_W1:true}); FRI(); span(Tm(tue,21.4),Tm(tue,21.6)); const sun=tue+5; span(Tm(sun,21),Tm(sun,22)); span(Tm(sun,22),Tm(sun+1,10),0.5);
      const inv=her().filter(x=>x.text==='這週三晚上，法圖。'); check('2-3. 解鎖後的星期日 21:30「這週三晚上，法圖。」一則（一週最多一次）',inv.length===1&&inv[0].day===sun&&Math.abs(inv[0].h-21.5)<0.02,JSON.stringify(inv.map(x=>[x.day,x.h])));
      const s16=td('Y1S1',16,7)-0; setT(s16,21.6); tick(); const sB=td('Y1S1',16,7)+7; G.flags.SISG_SAT_DAY=sB-1; setT(sB,21.6); tick();   /* 這一週有和她坐過：只剩「那個星期三」的條件 */
      check('2-3. 寒假的星期日（那個星期三法圖晚上沒開）不邀',her().filter(x=>x.text==='這週三晚上，法圖。'&&x.day>=sB).length===0); }
    /* AA_339 第 5 題：她不追人——上一個週三有來（或剛解鎖）才傳；連兩週沒來不傳；玩家自己再去法圖坐一次，下一個星期日恢復 */
    { fresh(tue,20,'dorm',{SIS_W1:true}); FRI(); span(Tm(tue,21.4),Tm(tue,21.6)); const invOn=d=>her().some(x=>x.text==='這週三晚上，法圖。'&&x.day===d), sunAt=d=>span(Tm(d,21.4),Tm(d,21.7));
      const sit=async d=>{ setT(d,21); G.zone='lawlib'; herHere(); STORY.onStudy(GM,2); if(SISG.tick(GM)) await SISG._p; G.zone='dorm'; E.npcs=[]; GM.npc={}; };
      const S1=tue+5, S2=tue+12, S3=tue+19, S4=tue+26, S5=tue+33;
      sunAt(S1); const a1=invOn(S1); sunAt(S2); const a2=invOn(S2); sunAt(S3); const a3=invOn(S3);
      await sit(tue+22); const sat=G.flags.SISG_SAT_DAY; sunAt(S4); const a4=invOn(S4);
      await sit(tue+29); sunAt(S5); const a5=invOn(S5);
      check('2-3. 剛解鎖的星期日傳；上一個週三沒來不傳；連兩週沒來也不傳；自己去法圖坐一次（她在）以後，下一個星期日恢復；那個週三有來，下一個星期日也傳',a1&&!a2&&!a3&&sat===tue+22&&a4&&a5,JSON.stringify({a1,a2,a3,sat,a4,a5})); }
    { fresh(tue,20,'dorm',{SIS_W1:true}); FRI(); span(Tm(tue,21.4),Tm(tue,21.6)); setT(tue+8,21); G.zone='lawlib'; E.npcs=[]; GM.npc={}; G.weekday=wdOf(tue+8);
      const sch=STORY.schedEnt; STORY.schedEnt=()=>null; try{ STORY.onStudy(GM,2); } finally { STORY.schedEnt=sch; }
      check('2-3. 她不在法圖的時候坐下來讀，不算「和她坐」',G.flags.SISG_SAT_DAY==null); }
    /* 熱水的條件改讀 SIS_STUDY（AA_284 2-3 最後一行）*/
    { const HW=ev('ev_sis_hot_water'); const at=(flag,lv)=>{ fresh(td('Y1S1',14,2),21.6,'lawlib',flag?{SIS_W1:true,SIS_STUDY:true}:{SIS_W1:true}); R(...lv); herHere(); return EVENTS.check(HW); };
      check('2-3. 熱水（ev_sis_hot_water）的條件＝有 SIS_STUDY，不用數值門檻',at(true,[25,10,5])&&!at(false,[65,50,40]),[at(true,[25,10,5]),at(false,[65,50,40])].join()); }
    /* 一起念書的日常：讀完一段輪到一段；③是那天晚上的家族群組；⑤要 SIS_TEA_ORDER */
    { fresh(td('Y1S1',8,3),19,'lawlib',{SIS_W1:true,SIS_STUDY:true}); FRI(); joinFam(); herHere(); const seen=[];
      for(let w=8;w<=13;w++){ const d=td('Y1S1',w,3); setT(d,21); said=[]; STORY.onStudy(GM,2); const r=SISG.tick(GM); if(r) await SISG._p; const s=said.slice(); span(Tm(d,21.05),Tm(d,22.1)); G.zone='lawlib'; const g=fam().filter(x=>x.tag==='sisg_seg3_'+d); seen.push(s.length?s.map(q=>q.t).join('/'):(g.length?'G:'+g.map(x=>x.text).join('/'):'—')); }
      check('2-3／G2. 第 8～13 週的星期三在法圖讀完：①（AA_339 第 7 題：不放同學名字「她和兩個也要考研究所的同學」）②③④輪流、⑤沒有 SIS_TEA_ORDER 不排、接著回到①',/^（她和兩個也要考研究所的同學在走廊對答案，吵一個爭點吵到笑出來。看到你，揮一下手，繼續吵。）$/.test(seen[0])&&seen[1]==='（她把字卡遞給你。）/念給我聽。/（你念錯一個字，她直接說出正確答案和條號。）/……你念錯了。不過我答對了。'&&seen[2]==='G:學姊今天有吃飯嗎/有。飯糰。……早餐、午餐、晚餐都是。'&&seen[3]==='（你卡在一題民總，她看了一眼。）/先看題目問誰。你在幫錯的人想。/（說完就回去讀自己的。）'&&seen[4]===seen[0],JSON.stringify(seen));
      const g3=fam().filter(x=>/^sisg_seg3_/.test(x.tag)); check('2-3. ③家族群組：Kevin 先問、她才回（那天晚上 22:00）',g3.length===2&&g3[0].from==='kevin'&&g3[1].from===ID&&Math.abs(g3[0].h-22)<0.06,JSON.stringify(g3.map(x=>[x.from,x.h])));
      G.flags.SIS_TEA_ORDER=true; G.flags.SISG_SEG=4; const d=td('Y1S1',13,3)+7; setT(td('Y1S1',14,3),21); said=[]; STORY.onStudy(GM,2); if(SISG.tick(GM)) await SISG._p; picks=[];
      check('2-3. ⑤有 SIS_TEA_ORDER 才排（④之後）：無糖綠茶去冰「……誰跟你說的。」',txts()[0]==='（你把一杯無糖綠茶去冰放在她的書旁邊。她看了杯子一眼。）'&&txts()[1]==='……誰跟你說的。'&&opts.slice(-1)[0].join('|')==='「一一八的店員。」|（不說）'&&txts()[2]==='……她記性比我好。謝謝。',JSON.stringify(txts())); }
    { const nope=(d,h,zone,flags,o)=>{ o=o||{}; fresh(d,h,zone,flags); FRI(); joinFam(); if(o.here!==false) herHere(); said=[]; STORY.onStudy(GM,o.hrs||2); const r=SISG.tick(GM); return !r&&!said.length; };
      check('2-3. 不排：還沒解鎖、星期四（她在 Café）、Café 讀書、筆試以後（大一下）',nope(td('Y1S1',8,3),21,'lawlib',{SIS_W1:true},{})&&nope(td('Y1S1',8,4),21,'lawlib',{SIS_W1:true,SIS_STUDY:true},{here:false})&&nope(td('Y1S1',8,3),21,'cafe',{SIS_W1:true,SIS_STUDY:true},{})&&nope(td('Y1S2',3,3),21,'lawlib',{SIS_W1:true,SIS_STUDY:true},{}));
      fresh(td('Y1S1',8,3),21,'lawlib',{SIS_W1:true,SIS_STUDY:true}); FRI(); herHere(); STORY.onStudy(GM,2); if(SISG.tick(GM)) await SISG._p; said=[]; G.hour=22; STORY.onStudy(GM,1); check('2-3. 同一天只輪一段',!SISG.tick(GM)&&!said.length); }
  });
  /* ---------- 2-4 一個人走回去 ---------- */
  await sec('2-4',async()=>{
    const e=ev('ev_sis_walk_alone'); const at=(w,wd,h,o)=>{ o=o||{}; const d=td('Y1S1',w,wd); fresh(d,h,'lawlib',Object.assign({SIS_W1:true},o.study===false?{}:{SIS_STUDY:true})); FRI(); if(o.hw!==false){ G.events.done.ev_sis_hot_water=1; G.events.last.ev_sis_hot_water=o.hwToday?d:d-1; } herHere(); return EVENTS.check(e); };
    const r={ok:at(14,2,21.7),w15:at(15,4,21.7),w13:at(13,2,21.7),fri:at(14,5,21.7),early:at(14,2,21.6),noStudy:at(14,2,21.7,{study:false}),noHW:at(14,2,21.7,{hw:false}),sameNight:at(14,2,21.7,{hwToday:true})};
    check('2-4. 第 14～15 週週一～四 21:40、法圖、SIS_STUDY、熱水先而且不同一晚；第 13 週、週五、21:36、沒解鎖、沒熱水、熱水同一晚都不演',r.ok&&r.w15&&!r.w13&&!r.fri&&!r.early&&!r.noStudy&&!r.noHW&&!r.sameNight,JSON.stringify(r));
    at(14,2,21.7); picks=[0]; await EVENTS.run(e); span(Tm(G.day,21.8),Tm(G.day,22.3));
    check('2-4. 台詞逐字；「好。到家傳一下。」→「嗯。」、22:10 私訊「到了」',JSON.stringify(txts())===JSON.stringify(['（那一週她比較安靜。閉館的廣播響了，她收書收得比平常慢。）','今天我想一個人走回去。','嗯。'])&&her().length===1&&her()[0].text==='到了'&&Math.abs(her()[0].h-(22+10/60))<0.06,JSON.stringify(txts())+JSON.stringify(her().map(x=>[x.h,x.text])));
    at(14,3,21.7); picks=[1]; await EVENTS.run(e); span(Tm(G.day,21.8),Tm(G.day,22.3)); check('2-4. （點頭）→ 她回頭揮手，沒有私訊',txts().slice(-1)[0]==='（她走到門口，回頭揮了一下手。）'&&!her().length);
  });
  /* ---------- 2-5 筆試前一週的晚上（AA_360 第 2-1 節：不再由她約；1/24～1/27 晚上在總圖、離開總圖的時候演。細的條件、舊存檔在 tests/aa360_unit.js）---------- */
  await sec('2-5',async()=>{
    const d=K('2026-01-26'), d25=K('2026-01-25'); fresh(d,17,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI(); span(Tm(d,17.9),Tm(d,21));
    check('2-5. 1/26 不再有她的私訊、不排 20:00 的出遊（AA_360 2-1）',!her().length&&!OUT.get(G,'sisg_low_night'));
    const pass=async(day,h,fl,k)=>{ fresh(day,h,'library_hall',Object.assign({SIS_W1:true,SIS_STUDY:true},fl||{})); FRI(); const r0=relOf(); picks=[k||0]; const a=SISG.tick(GM); if(a) await SISG._p; G.zone='campus'; const b=SISG.tick(GM); if(b) await SISG._p; return {a,b,L:txts(),r0,r1:relOf()}; };
    { const r=await pass(d25,20.5,{SIS_STUDY:false}); check('2-5. 沒有 SIS_STUDY：沒有這一場',!r.a&&!r.b&&!r.L.length); }
    const a=await pass(d25,20.5,{},0); const head=['（總圖門口的台階。兩個人剛收好東西先走了，走在後面的男生回頭看了一下。）','（她還坐在台階上，計畫本攤在膝蓋上，一頁一頁往回翻。）','學弟。你怎麼在這裡。','我在看我的計畫本。大一到現在的。','每一週都排滿了。我剛剛在找有沒有哪一週是空的。','……沒有。','（她把計畫本闔上。）','再一個禮拜就考試了。我有一點怕。'];
    check('2-5. 1/25 20:30 在總圖、走出總圖就演；台詞照 BB_122 ★-3 5-2＋AA_360 2-1（開頭兩行旁白、「學弟。你怎麼在這裡。」）；CG BCG-42；「我陪妳坐一下。」→「好。不用講話。」（坐到熄燈）→ 結尾',!a.a&&a.b===true&&JSON.stringify(a.L)===JSON.stringify(head.concat(['好。不用講話。','（你們坐到圖書館熄燈。）','好了，我回去了。明天還是八點到。']))&&cgs.includes('cg_planner_four_years_heroine05'),JSON.stringify(a.L));
    check('2-5. 記 SIS_PREEXAM_NIGHT；信任 +3、自在 +2；沒有告白選項；選項 c 換「我陪妳走到捷運站。」（AA_360 2-1）',G.flags.SIS_PREEXAM_NIGHT===true&&a.r1.trust-a.r0.trust===3&&a.r1.comf-a.r0.comf===2&&opts[0].join('|')==='「我陪妳坐一下。」|「妳準備得很夠了。」|「我陪妳走到捷運站。」');
    const b=await pass(d25,20.5,{},1), c=await pass(d25,20.5,{},2); check('2-5. 另外兩個選項的回答',b.L.slice(-2).join('/')==='大家都這樣說。……可是謝謝。/好了，我回去了。明天還是八點到。'&&c.L.slice(-2).join('/')==='……好。走到那裡就好。/好了，我回去了。明天還是八點到。');
    { const e=ev('ev_sis_low_night'); fresh(d,20,'dorm',{SIS_W1:true,SIS_STUDY:true}); await EVENTS.run(e); const ok=MSG.conds2(G,ID,'ok').some(x=>x.key==='low_night'); check('2-5. 手機話題「還好嗎（考前那晚）」綁這一場（演過才開）',ok); }
  });
  /* ---------- 2-6 考前、考完 ---------- */
  await sec('2-6',async()=>{
    const d31=K('2026-01-31'), d2=K('2026-02-02');
    fresh(d31,20,'dorm',{SIS_W1:true}); FAM(); joinFam(); span(Tm(d31,20.9),Tm(d31,21.1)); const g=fam().filter(x=>x.tag==='sisg_fam_0131');
    check('2-6. 1/31（六）21:00 家族群組：Kevin 起頭、兩個學弟妹貼圖（AA_339 第 1 題：學弟「致遠」、學妹「怡萱」）、她「謝謝。睡了。」',g.length===4&&g[0].from==='kevin'&&g[0].text==='學姊後天考試！！大家幫學姊集氣'&&g[1].text==='（貼圖）'&&g[2].text==='（貼圖）'&&PHONE.who(g[1])==='致遠'&&PHONE.who(g[2])==='怡萱'&&g[3].from===ID&&g[3].text==='謝謝。睡了。'&&Math.abs(g[0].h-21)<0.05,JSON.stringify(g.map(x=>[x.from,x.name,x.text])));
    fresh(d2,17,'dorm',{SIS_W1:true,SIS_STUDY:true,SIS_PREEXAM_NIGHT:true}); FRI(); span(Tm(d2,17.4),Tm(d2,17.6)); const m=her();
    check('2-6. 2/2（一）17:30 私訊「考完了」「我想吃一碗很燙的東西，然後睡十二個小時」＋兩個選項',m.length===2&&m[0].text==='考完了'&&m[1].text==='我想吃一碗很燙的東西，然後睡十二個小時'&&Math.abs(m[0].h-17.5)<0.02&&m[1].ask.opts.map(o=>o.t).join('|')==='去吃。|辛苦了。',JSON.stringify(m.map(x=>x.text)));
    answer(m[1].ask.id,0); const a1=her().slice(-1)[0].text; fresh(d2,17,'dorm',{SIS_PREEXAM_NIGHT:true}); span(Tm(d2,17.4),Tm(d2,17.6)); answer(her()[1].ask.id,1); const a2=her().slice(-1)[0].text;
    check('2-6. 「去吃。」→「嗯。」；「辛苦了。」→「不要問我考得怎麼樣。我也不知道」',a1==='嗯。'&&a2==='不要問我考得怎麼樣。我也不知道',a1+' / '+a2);
    fresh(d2,17,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI(); span(Tm(d2,17.4),Tm(d2,18)); const ms=her(); fresh(d2,17,'dorm',{SIS_W1:true}); FRI(); span(Tm(d2,17.4),Tm(d2,18));
    check('2-6. 沒有那一晚（SIS_PREEXAM_NIGHT）、一起念過書（SIS_STUDY）也收到 2/2 的私訊（AA_360 2-1 放寬）；兩個都沒有＝沒有',ms.length===2&&ms[0].text==='考完了'&&!her().length,JSON.stringify(ms.map(x=>x.text)));
  });
  /* ---------- 2-7 新的計畫本 ---------- */
  await sec('2-7',async()=>{
    const d3=K('2026-02-03'), d4=K('2026-02-04');
    fresh(d3,20,'dorm',{SIS_PREEXAM_NIGHT:true}); FRI(); span(Tm(d3,20.9),Tm(d3,21.1)); const m=tagMsgs('sisg_planner_ask');   /* 2/2 那兩則在這之前（這個測試直接從 2/3 開始，所以一起補進來）*/
    check('2-7. 2/3（二）21:00「我想去買一本新的計畫本」「你要一起來嗎？不來也沒關係」',m.length===2&&m[0].text==='我想去買一本新的計畫本'&&m[1].text==='你要一起來嗎？不來也沒關係'&&Math.abs(m[0].h-21)<0.06&&m[1].ask.opts.map(o=>o.t).join('|')==='好。|這次不行。',JSON.stringify(m.map(x=>x.text)));
    answer('sisg_planner_ask',0); span(Tm(d3,21.2),Tm(d3,21.3)); const q=OUT.get(G,'sisg_new_planner');
    check('2-7. 「好。」→ 2/4（三）14:00 公館的文具店（出遊）',!!q&&q.ev==='ev_sis_new_planner'&&q.day===d4&&q.h===14,JSON.stringify(q));
    fresh(d3,20,'dorm',{SIS_PREEXAM_NIGHT:true}); span(Tm(d3,20.9),Tm(d3,21.1)); answer('sisg_planner_ask',1); span(Tm(d3,21.2),Tm(d3,21.3));
    check('2-7. 「這次不行。」→「好。我自己去」、不排出遊',her().slice(-1)[0].text==='好。我自己去'&&!OUT.get(G,'sisg_new_planner'));
    const e=ev('ev_sis_new_planner'); const play=async k=>{ fresh(d4,14,'gongguan',{SIS_PREEXAM_NIGHT:true}); FRI(); const r0=relOf(); picks=[k]; await EVENTS.run(e); return {L:txts(),r0,r1:relOf()}; };
    const a=await play(0), b=await play(1), c=await play(2); const head=['這本。週末那一欄是空白的，沒有格子。','我想要一本可以留白的。','（結帳以後，她站在店門口，翻開第一頁寫了一行，寫完拿給你看。）','（第一頁只有一行：「二月四日　買計畫本。」）'];
    check('2-7. 文具店台詞：前兩句照 BB_122 ★-3 5-3，後面照 AA_360 2-2（第一頁她自己寫）；三個選項是看到以後的反應',JSON.stringify(a.L)===JSON.stringify(head.concat(['（她笑出來。）','對。第一件做完了。']))&&b.L.slice(-1)[0]==='嗯。慢慢寫。'&&c.L.slice(-1)[0]==='……好。這個我真的需要。'&&opts[0].join('|')==='「第一件就做完了。」|「後面都空著？」|「下一行寫『睡午覺』。」',JSON.stringify(a.L));
    check('2-7. 記 SIS_NEW_PLANNER；信任 +3、自在 +3、戀愛 +2',G.flags.SIS_NEW_PLANNER===true&&a.r1.trust-a.r0.trust===3&&a.r1.comf-a.r0.comf===3&&a.r1.rom-(a.r0.rom||0)===2,JSON.stringify([a.r0,a.r1]));
    { const sc=e.dialogue.find(l=>l.scene!==undefined); check('2-7. 背景：2D gongguan＋字幕「公館・文具店」',sc&&sc.scene==='公館・文具店'&&sc.bg==='gongguan'); }
  });
  /* ---------- G3 寒假快轉不跳過 ---------- */
  await sec('G3',async()=>{
    const d21=K('2026-01-21'), d26=K('2026-01-26'), d31=K('2026-01-31'), d2=K('2026-02-02'), d3=K('2026-02-03'), d4=K('2026-02-04'), d5=K('2026-02-05');
    fresh(d21,10,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI(); joinFam(); const stops=[];
    const ff=async()=>{ picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); stops.push(Tm(G.day,G.hour)); tick(); };
    await ff(); check('G3. 快轉 → 1/24～1/27 不停（AA_360 2-1：不再由她約，1/26 沒有私訊、沒有出遊）→ 1/31 21:00 家族群組',stops[0]===Tm(d31,21)&&!her().length&&!OUT.get(G,'sisg_low_night')&&fam().some(m=>m.text==='學姊後天考試！！大家幫學姊集氣'),JSON.stringify(stops));
    await ff(); check('G3. → 2/2 17:30「考完了」（一起念過書就有；沒有那一晚也有）',stops[1]===Tm(d2,17.5)&&her().some(m=>m.text==='考完了'),JSON.stringify(stops));
    await ff(); check('G3. → 2/3 21:00 邀去買計畫本',stops[2]===Tm(d3,21)&&!!ask('sisg_planner_ask'),JSON.stringify(stops));
    answer('sisg_planner_ask',0); tick(); await ff(); check('G3. 答應 → 2/4 出發去文具店之前停',stops[3]>Tm(d4,8)&&stops[3]<=Tm(d4,14)-0.25-0.25&&!!OUT.get(G,'sisg_new_planner'),JSON.stringify(stops));
    fresh(d21,10,'dorm',{SIS_W1:true}); FAM(); const st2=[]; for(let i=0;i<2;i++){ picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm'); st2.push(Tm(G.day,G.hour)); tick(); }
    check('G3. 沒解鎖、不在家族群組：1/26～2/4 都不停（直接到 2/5 的摘要日）',st2[0]===Tm(d5,18.5),JSON.stringify(st2.map(t=>[Math.floor(t/24)-d21,t%24])));
    { fresh(d26,17.6,'dorm',{SIS_STUDY:true}); const w=STORY.lawWakeAt(G); fresh(d3,19,'dorm',{SIS_STUDY:true}); const w2=STORY.lawWakeAt(G);
      check('G3. 宿舍睡著也會醒來：2/3 21:00（STORY.WAKE_AT；只有 SIS_STUDY 也會）；1/26 18:00 不再醒來（AA_360 2-1）',w!==18&&w2===21,w+' '+w2); }
  });
  /* ---------- 2-8 放榜（G4、G6）---------- */
  await sec('2-8',async()=>{
    const d=K('2026-03-23');
    fresh(d,7.5,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI(); const r0=relOf(); picks=['上網查榜']; const t=SISG.tick(GM); if(t) await SISG._p; const L=lines();
    check('2-8／G4. 3/23 早上：「（今天法研所放榜。）」→（上網查榜）→「（你在榜單上找到她的名字。）」→ 自動傳「學姊，榜單上有妳。恭喜。」',t===true&&L[0]==='（今天法研所放榜。）'&&opts[0].join('|')==='（上網查榜）|（先不要）'&&L[1]==='（你在榜單上找到她的名字。）'&&/學姊，榜單上有妳。恭喜。$/.test(L[2])&&TH('p:'+ID).some(m=>m.from==='player'&&m.text==='學姊，榜單上有妳。恭喜。'),JSON.stringify(L));
    span(Tm(d,8),Tm(d,12.4)); const m=her();
    check('2-8／G4. 12:10「……我還沒去看。你比我快」；12:13「真的有」「謝謝。我先去跟我媽說」',m.length===3&&m[0].text==='……我還沒去看。你比我快'&&Math.abs(m[0].h-(12+10/60))<0.06&&m[1].text==='真的有'&&m[2].text==='謝謝。我先去跟我媽說'&&Math.abs(m[1].h-(12+13/60))<0.06&&m[1].h>m[0].h,JSON.stringify(m.map(x=>[x.h,x.text])));
    const r1=relOf(); check('2-8. 記 SIS_RESULT_TOLD（旗標＋記憶）；信任 +3、戀愛 +1',G.flags.SIS_RESULT_TOLD===true&&SOCIAL.has(ID,'SIS_RESULT_TOLD')&&r1.trust-r0.trust===3&&(r1.rom||0)-(r0.rom||0)===1,JSON.stringify([r0,r1]));
    { fresh(d,7.5,'dorm',{SIS_PREEXAM_NIGHT:true}); FRI(); picks=['先不要']; if(SISG.tick(GM)) await SISG._p; span(Tm(d,8),Tm(d,13)); check('2-8. （先不要）：沒有私訊、沒有 SIS_RESULT_TOLD',!TH('p:'+ID).length&&!G.flags.SIS_RESULT_TOLD); }
    { fresh(d,13,'dorm',{SIS_STUDY:true}); FRI(); picks=['上網查榜']; if(SISG.tick(GM)) await SISG._p; span(Tm(d,13),Tm(d,13.4)); const m2=her(); check('2-8. 13:00 才起床查：她 10 分鐘、13 分鐘後回',m2.length===3&&Math.abs(m2[0].h-(13+10/60))<0.06,JSON.stringify(m2.map(x=>x.h))); }
    { fresh(d,7.5,'dorm',{SIS_W1:true}); FAM(); joinFam(); const t2=SISG.tick(GM); span(Tm(d,19.9),Tm(d,20.2)); const g=fam().filter(x=>x.tag==='sisg_rank_fam');
      check('2-8／G1／G6. 沒一起念書、沒送東西：沒有查榜；她照樣上榜——3/23 20:00 家族群組 Kevin「各位！！學姊上榜了！！！」她「收到。」Kevin「學姊妳可以多講兩個字」她「謝謝。」',!t2&&!said.length&&g.map(x=>x.from+':'+x.text).join('/')==='kevin:各位！！學姊上榜了！！！/heroine_05:收到。/kevin:學姊妳可以多講兩個字/heroine_05:謝謝。'&&G.flags.SIS_RESULT_OUT===true,JSON.stringify(g.map(x=>x.text)));
      check('2-8. ev_sis_results 3/23 20:00 對所有玩家算演過（閒聊階梯 S2-L3、S2-L5 讀它）',!!G.events.done.ev_sis_results); }
    { fresh(d,19,'dorm',{}); span(Tm(d,19.5),Tm(d,19.9)); const b=!!G.events.done.ev_sis_results; span(Tm(d,20),Tm(d,20.1)); check('2-8. 不在群組的也算（20:00 以前不算）',!b&&!!G.events.done.ev_sis_results); }
  });
  /* ---------- 2-9 上榜聚餐 ---------- */
  await sec('2-9',async()=>{
    const d=K('2026-03-23'), d27=K('2026-03-27');
    fresh(d,20.5,'dorm',{SIS_W1:true}); FAM(); joinFam(); span(Tm(d,20.9),Tm(d,21.1)); const g=fam().filter(x=>x.tag==='sisg_rank_dinner');
    check('2-9. 3/23 21:00 Kevin「學姊上榜聚餐！這週五七點，公館的日日定食。這次我們請學姊」；只有「去。」',g.length===1&&g[0].from==='kevin'&&g[0].text==='學姊上榜聚餐！這週五七點，公館的日日定食。這次我們請學姊'&&g[0].ask.opts.map(o=>o.t).join('|')==='去。',JSON.stringify(g.map(x=>x.text)));
    answer(g[0].ask.id,0); span(Tm(d,21.1),Tm(d,21.2)); const q=OUT.get(G,'sisg_rank_dinner'); check('2-9. 回「去。」→ 3/27（五）19:00 出遊',!!q&&q.day===d27&&q.h===19&&q.ev==='ev_sis_results_dinner_y1',JSON.stringify(q));
    const e=ev('ev_sis_results_dinner_y1'); const play=async fl=>{ fresh(d27,19,'gongguan',Object.assign({SIS_W1:true,met_sis:true},fl)); FAM(); await EVENTS.run(e); return txts(); };   /* 已經認識她（SIS_W1）：還沒認識的開頭多兩句自我介紹（AA_470 5-1），驗在 tests/aa470_sis_b12_unit.js */
    const head=['你們真的不用請我。','學姊，坐好。今天妳只負責吃。','……好。','（她點了最貴的那一份，然後看了 Kevin 一眼。Kevin 假裝沒看到。）'];
    const a=await play({SIS_RESULT_TOLD:true,SIS_NEW_PLANNER:true}), b=await play({SIS_NEW_PLANNER:true}), c=await play({});
    check('2-9. 聚餐台詞；有 SIS_RESULT_TOLD：「那天你傳的時候，我還在睡。」；沒有、但有 SIS_NEW_PLANNER：「計畫本今天這一格，我寫了『吃飯』。」',JSON.stringify(a)===JSON.stringify(head.concat(['（她小聲對你說。）','那天你傳的時候，我還在睡。']))&&JSON.stringify(b)===JSON.stringify(head.concat(['計畫本今天這一格，我寫了『吃飯』。']))&&JSON.stringify(c)===JSON.stringify(head),JSON.stringify([a,b,c]));
    { fresh(d,20.5,'dorm',{}); FAM(); joinFam(); span(Tm(d,20.9),Tm(d,21.1)); span(Tm(d27,21.4),Tm(d27,21.6)); const p=fam().filter(x=>x.tag==='sisg_rank_dinner_photo');
      check('2-9. 沒去的：3/27 21:30 Kevin 貼合照（AA_339 第 2 題「📷（定食店的長桌，學姊坐中間，面前是全桌最貴的那一份）」）「沒來的人錯過請學姊吃飯。千載難逢」',p.length===2&&p[0].from==='kevin'&&p[0].text==='📷（定食店的長桌，學姊坐中間，面前是全桌最貴的那一份）'&&p[1].text==='沒來的人錯過請學姊吃飯。千載難逢'&&Math.abs(p[0].h-21.5)<0.05,JSON.stringify(p.map(x=>x.text))); }
  });
  /* ---------- 2-10 舊教科書 ---------- */
  await sec('2-10',async()=>{
    const e=ev('ev_sis_books_y1s2'), d=K('2026-02-22'); const at=(day,zone,dinner)=>{ fresh(day,18,zone,{}); if(dinner){ G.events.done.ev_sis_family_dinner=1; } return EVENTS.check(e); };
    check('2-10. 去過 12/5 家族聚餐的玩家，2/22（日）在宿舍；沒去過、2/21、在校園都不演',at(d,'dorm',true)&&at(d,'dorm_hall',true)&&!at(d,'dorm',false)&&!at(d-1,'dorm',true)&&!at(d,'campus',true));
    { const end=CALENDAR.termDays('Y1S2').to; check('2-10. AA_339 第 10 題：2/22～2/28 在宿舍補演；2/22 沒回宿舍的，第一次回宿舍那天演（3/10 也演，到大一下結束；暑假不演）',at(d+6,'dorm_hall',true)&&at(K('2026-03-10'),'dorm',true)&&at(end,'dorm',true)&&!at(end+1,'dorm',true)); }
    at(d,'dorm',true); await EVENTS.run(e);
    check('2-10. 旁白「（管理室有你的一箱書。上面貼著一張便利貼。）」、便利貼「民總、刑總、憲法。紅筆是我的，藍筆是我學姊的。」；記 SIS_OLD_BOOKS',JSON.stringify(txts())===JSON.stringify(['（管理室有你的一箱書。上面貼著一張便利貼。）','（便利貼：「民總、刑總、憲法。紅筆是我的，藍筆是我學姊的。」）'])&&G.flags.SIS_OLD_BOOKS===true,JSON.stringify(txts()));
    check('2-10. 手機話題「謝謝（舊教科書）」綁這一場',MSG.conds2(G,ID,'thanks').some(x=>x.key==='old_books'));
    { const pts=HOME.breakPts(Object.assign({},G,{day:d-3,hour:10})); check('2-10. 回宿舍那一停（寒假表上 2/22 17:00 back）',pts.some(p=>p.day===d&&p.h===17&&p.k==='back')); }
  });
  /* ---------- 2-11 考古題送學妹 ---------- */
  await sec('2-11',async()=>{
    const e=ev('ev_sis_give_notes'); const at=(w,wd,h,o)=>{ o=o||{}; fresh(td('Y1S2',w,wd),h,'campus',{}); if(o.acq) R(10); else FAM(); E.player.obj.position.x=o.far?60:83.5; E.player.obj.position.z=3.5; return EVENTS.check(e); };
    const r={ok:at(8,1,12.5),w12:at(12,5,12.9),w7:at(7,1,12.5),w13:at(13,1,12.5),sat:at(8,6,12.5),late:at(8,1,13.1),acq:at(8,1,12.5,{acq:true})};
    check('2-11. 大一下第 8～12 週平日 12:00～13:00、有點熟以上；第 7、13 週、週六、13:06、只認識都不演',r.ok&&r.w12&&!r.w7&&!r.w13&&!r.sat&&!r.late&&!r.acq,JSON.stringify(r));
    check('2-11. 地點：總圖門口（3D 校園，離門口太遠不演）',e.location==='campus'&&!!e.near&&(at(8,1,12.5,{far:true}),Math.hypot(E.player.obj.position.x-e.near.x,E.player.obj.position.z-e.near.z)>e.near.r));
    const play=async k=>{ at(8,1,12.5); picks=[k]; await EVENTS.run(e); return txts(); };
    const a=await play(0), b=await play(1); const head=['（她把一個紙箱交給一個大三的學妹。）','拿去。有錯的地方我用紅筆改過了。','（學妹走了以後。）','……書架空了一層。我還沒想好要放什麼。'];
    check('2-11. 台詞；「放新的計畫本。」→「那本很薄。」（她笑了一下）／「先空著。」→「嗯。先空著。」',JSON.stringify(a)===JSON.stringify(head.concat(['那本很薄。','（她笑了一下。）']))&&JSON.stringify(b)===JSON.stringify(head.concat(['嗯。先空著。'])),JSON.stringify([a,b]));
  });
  /* ---------- 2-12 畢業典禮 ---------- */
  await sec('2-12',async()=>{
    const d=K('2026-06-06'); fresh(d,7.5,'dorm',{}); FAM(); span(Tm(d,7.9),Tm(d,8.1)); const q=OUT.get(G,'sisg_grad');
    check('2-12. 6/6（六）早上私訊「今天十一點，霖澤館。不用帶花。」（AA_459 第 5 節補句號）→ 11:00 出遊（有點熟以上）',her().length===1&&her()[0].text==='今天十一點，霖澤館。不用帶花。'&&!!q&&q.h===11&&q.ev==='ev_sis_graduation',JSON.stringify(q));
    { fresh(d,7.5,'dorm',{}); R(10); span(Tm(d,7.9),Tm(d,9)); check('2-12. 只認識：沒有私訊、沒有出遊',!her().length&&!OUT.get(G,'sisg_grad')); }
    fresh(d,11,'dorm',{}); FAM(); await EVENTS.run(ev('ev_sis_graduation'));
    check('2-12. 台詞：爸爸「九月開學？」→「九月。……開學前，我想先睡一個禮拜。」→ 媽媽笑 → 拍一張 →「你來了。」「……我本來想了很多要說的。」「今天只說一句：謝謝你來。」',JSON.stringify(lines())===JSON.stringify(['學姊的爸爸：九月開學？',SOCIAL.displayName(ID)+'：九月。……開學前，我想先睡一個禮拜。','（媽媽笑了。）','學姊的爸爸：來，拍一張。','（她看到你，笑了一下。）',SOCIAL.displayName(ID)+'：你來了。',SOCIAL.displayName(ID)+'：……我本來想了很多要說的。',SOCIAL.displayName(ID)+'：今天只說一句：謝謝你來。']),JSON.stringify(lines()));
    { const sc=ev('ev_sis_graduation').dialogue.find(l=>l.scene!==undefined); check('2-12. 背景 2D linze_auditorium（霖澤館一樓大廳）',sc&&sc.bg==='linze_auditorium'); }
  });
  /* ---------- G1 只有點熟、沒解鎖 ---------- */
  await sec('G1',async()=>{
    fresh(K('2026-01-25'),12,'dorm',{SIS_W1:true}); FAM(); joinFam(); span(Tm(G.day,12),Tm(K('2026-02-05'),12),0.25); const own=her().map(m=>m.text);
    check('G1. 只有點熟、沒解鎖：1/25～2/5 沒有她的私訊（2-5～2-7 都沒有），家族群組照常',!own.length&&fam().some(m=>m.tag==='sisg_fam_0131')&&!OUT.get(G,'sisg_low_night')&&!OUT.get(G,'sisg_new_planner'),JSON.stringify(own));
  });
  /* ---------- G7 筆試前告白 ---------- */
  await sec('G7',async()=>{
    const go=(k,h)=>{ fresh(K(k),h,'campus',{SIS_W1:true}); Object.assign(SOCIAL.rel(ID),{fam:65,trust:50,comf:45,npcRom:60,rom:35}); const L=DATE.log(G,ID); L.count=4; L.wish=true; L.wishKnown=true; return DATE.canConfess(G,ID); };
    const a=go('2026-01-20',15), b=go('2026-02-02',18), c=go('2026-03-23',10);
    check('G7. 筆試前告白婉拒（preexam）；考完到放榜前也婉拒（prerank）；3/23 以後照一般條件',a.ok&&a.decline==='preexam'&&b.ok&&b.decline==='prerank'&&c.ok&&!c.decline,JSON.stringify([a,b,c]));
  });
  /* ---------- G8 2/1～2/22 她不在學校 ---------- */
  await sec('G8',async()=>{
    const r=[]; for(const [k,h] of [['2026-02-01',10],['2026-02-02',15],['2026-02-04',19],['2026-02-11',10],['2026-02-22',14]]){ fresh(K(k),h,'library',{}); FAM(); const w=STORY.whereIs(GM,ID); r.push(w&&w.zone==null&&w.away==='在家'); }
    fresh(K('2026-01-28'),10,'library',{}); FAM(); const w0=STORY.whereIs(GM,ID); fresh(K('2026-02-25'),20,'lawlib',{}); FAM(); const w1=STORY.whereIs(GM,ID);
    check('G8. 2/1～2/22 總圖、法圖、Café 都找不到她；手機「現在大概在」寫「在家」（1/28 在總圖、2/25 週三在法圖）',r.every(Boolean)&&w0&&w0.zone==='library'&&w1&&w1.zone==='lawlib',JSON.stringify(r)+JSON.stringify([w0,w1]));
  });
  /* ---------- G9 她不在群組起頭 ---------- */
  await sec('G9',async()=>{
    fresh(td('Y1S1',8,3),21,'lawlib',{SIS_W1:true,SIS_STUDY:true,SIS_PREEXAM_NIGHT:true}); FRI(); joinFam(); herHere(); G.flags.SISG_SEG=2; STORY.onStudy(GM,2); span(Tm(G.day,21.5),Tm(G.day,22.5));
    span(Tm(K('2026-01-31'),20.5),Tm(K('2026-01-31'),21.5)); span(Tm(K('2026-03-23'),19.5),Tm(K('2026-03-23'),21.5)); G.flags.SISG_DINNER_GO=true; span(Tm(K('2026-03-27'),21),Tm(K('2026-03-27'),22));
    const byTag={}; for(const m of fam()) if(/^sisg_/.test(m.tag||'')) (byTag[m.tag]=byTag[m.tag]||[]).push(m);
    const bad=Object.entries(byTag).filter(([t,L])=>L[0].from===ID).map(([t])=>t);
    check('G9. 家族群組裡她的每一則都是回 Kevin（每一串第一則都是 Kevin）',Object.keys(byTag).length>=4&&!bad.length,JSON.stringify(Object.keys(byTag))+' bad='+bad.join());
    const src=fs.readFileSync(path.join(ROOT,'src/sis_grad3d.js'),'utf8'); check('G9. 「不是不想去，是真的在」不在新程式裡',!src.includes('不是不想去，是真的在'));
  });
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
