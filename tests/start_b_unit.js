// 開局 B 的程式結構（D91；AA_191 第 2 節）——不需要瀏覽器。檢查：S.opening 只有第 1、2 天；S.lawStart（舊存檔＝1、開局 B＝−16）；課表：從第 1 天開始的局，第 1 天以前與 9/17 白天沒有課（和以前一樣）；開局 B 的局，第 1、2 週照常有課、9/17 白天也有課；第 2 天 13:05 以前的課兩種都不排。用法：node tests/start_b_unit.js
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
  const D=k=>STORY.dayOfKey(k);
  check('0. 2025-08-31 是第 −16 天、9/1 是大一上第 1 週、9/17 是第 1 天',D('2025-08-31')===-16&&CALENDAR.termOf(D('2025-09-01')).week===1&&D('2025-09-17')===1);
  fresh(-5,10,'campus',{}); G.stage='law'; const o0=STORY.opening(G); G.day=1; const o1=STORY.opening(G); G.day=2; const o2=STORY.opening(G); G.day=3; const o3=STORY.opening(G);
  check('1. 法律系：第 −5 天不是開場、第 1、2 天是、第 3 天不是',!o0&&o1&&o2&&!o3);
  fresh(1,10,'campus',{}); G.stage='law';
  check('2. 舊存檔／現在的開局：lawStart＝1',STORY.lawStart(G)===1);
  const names=day=>CLS.dayItems(G,day).map(it=>CLS.hhmm(it.t0)+' '+it.c.name).join('、');
  const mon1=D('2025-09-01'), wed1=D('2025-09-03');
  check('3. 從第 1 天開始的局：第 1 週週一沒有課、9/17 白天沒有課（和以前一樣）',names(mon1)===''&&names(1)==='',names(mon1)+'｜'+names(1));
  G.flags.LAW_START_DAY=-16;
  check('4. 開局 B（lawStart −16）：第 1 週週一有憲法、週三有刑總',/憲法/.test(names(mon1))&&/刑法總則/.test(names(wed1)),names(mon1)+'｜'+names(wed1));
  check('4. 開局 B：9/17（第 1 天）白天有刑總',/刑法總則/.test(names(1)),names(1));
  check('5. 從第 −16 天開始的局（已經住在宿舍）：第 2 天早上的課照排（AA-B 20:50 第 5 題）',names(2).split('、').length>1&&/13:20 民法總則/.test(names(2)),names(2));
  { const ls0=G.flags.LAW_START_DAY; delete G.flags.LAW_START_DAY; check('5. 從第 1 天開始的局（舊存檔）：第 2 天 13:05 以前的課都不排（只有民總）',names(2)==='13:20 民法總則',names(2)); G.flags.LAW_START_DAY=ls0; }
  G.flags.LAW_START_DAY=-18; check('6. 選 1：8/29～8/31（第 −18～−16 天）沒有課、8/28 以前也沒有',names(-18)===''&&names(-17)===''&&names(-16)===''&&names(-19)==='');
  /* START-WEEK 選 1（使用者 20:39 對 AA-B；AA-B 20:4x 規格）：主線第一、二天看存檔的 MAIN_D1 */
  { fresh(1,10,'campus',{}); G.stage='law'; check('7. 舊存檔（沒有 MAIN_D1）：mainD1＝1、mainDay＝G.day',STORY.mainD1(G)===1&&STORY.mainDay(G)===1&&STORY.mainDay(G,40)===40); }
  { fresh(D('2025-09-03'),10,'campus',{LAW_START_DAY:-18,MAIN_D1:-13}); G.stage='law'; const md=d=>{ G.day=d; return STORY.opening(G); };
    check('8. 選 1：9/3、9/4 是開場劇情，9/2、9/5、9/17、9/18 不是',md(D('2025-09-03'))&&md(D('2025-09-04'))&&!md(D('2025-09-02'))&&!md(D('2025-09-05'))&&!md(1)&&!md(2));
    G.day=D('2025-09-03');
    check('9. 選 1：9/3（主線第一天）白天照常上課（已經住了幾天）',/刑法總則/.test(names(D('2025-09-03'))),names(D('2025-09-03')));
    check('9. 選 1：9/4（主線第二天）早上的課照排（玩家已經住在宿舍，AA-B 20:50 第 5 題）＋13:20 民總',/09:10 大一英文/.test(names(D('2025-09-04')))&&/13:20 民法總則/.test(names(D('2025-09-04'))),names(D('2025-09-04')));
    const thu3=names(2); check('9. 選 1：9/18（第 2 天）是普通的週四，早上的課照排',thu3.split('、').length>1&&/民法總則/.test(thu3),thu3);
    const civ=d=>CLS.dayItems(G,d).find(it=>it.c.id==='civ_general');
    check('10. 選 1：劇情課是 9/4 的民總，不是 9/18 的',CLS.storyClass(G,civ(D('2025-09-04')))&&!CLS.storyClass(G,civ(2)));
    fresh(1,10,'campus',{}); G.stage='law'; check('10. 舊存檔：劇情課照舊是第 2 天的民總',CLS.storyClass(G,civ(2))); }
  { const e3=STORY_EVENTS.find(e=>e.day_min===3); fresh(D('2025-09-04'),12,'campus',{LAW_START_DAY:-18,MAIN_D1:-13}); G.stage='law';
    const blocked=STORY.mainDay(G)<e3.day_min; G.day=D('2025-09-05'); const ok=STORY.mainDay(G)>=e3.day_min;
    check('11. day_min 從主線第一天算：選 1 的 9/4 還不到 day_min 3、9/5 到了（'+e3.id+'）',blocked&&ok);
    const src=require('fs').readFileSync(require('path').join(ROOT,'src/events3d.js'),'utf8'); check('11. events3d 的 day_min／day_max 用 STORY.mainDay',/md<ev\.day_min/.test(src)&&/md>ev\.day_max/.test(src)); }
  { const x=STORY_EVENTS.find(e=>e.id==='ev_xinci_double'); const inW=d=>{ const t=CALENDAR.termOf(d); return !!t&&x.term.includes(t.id)&&x.weeks.includes(t.week); };
    let same=true; for(let d=180;d<=220;d++) if(inW(d)!==(d>=195&&d<=208)) same=false;
    check('12. ev_xinci_double 改成 Y1S2 第 6～7 週，和原本的第 195～208 天完全一樣（不跟著主線第一天移動）',same&&!x.day_min&&!x.day_max); }
  { fresh(1,21.2,'title',{}); cards=[]; entered=[]; global.location={search:'?start0'}; GM.titleIdle=true; GM.hideHUD=()=>{}; E.endCinematic=()=>{}; GM.D.busyDepth=0; STORY.recap=async()=>{};
    await STORY.newGame(GM); const old={day:G.day,m1:G.flags.MAIN_D1,zone:G.zone};
    fresh(1,21.2,'title',{}); global.location={search:'?start1'}; await STORY.newGame(GM);   /* 2026-10-17 第 7 組：預設新遊戲改成經濟系開局，法律系開局只留給 ?start1 */
    check('13. 新遊戲 ?start0（舊開局）：從第 1 天（9/17）宿舍開始、沒有 MAIN_D1',old.day===1&&old.m1===undefined&&old.zone==='dorm',JSON.stringify(old));
    check('13. 新遊戲 ?start1（法律系開局；第 7 組以後預設是經濟系）：8/29（第 −18 天，週五）下午搬進宿舍、演完阿凱初遇（AA_195 4-2）、LAW_START_DAY −18、MAIN_D1 −13（使用者 10-16 選 8/29）',G.day===-18&&D('2025-08-29')===-18&&STORY.LAW_D0===-18&&G.weekday===5&&G.flags.LAW_MOVEIN_DAY===-18&&G.flags.KAI_MOVEIN===true&&G.flags.LAW_START_DAY===-18&&G.flags.MAIN_D1===-13&&G.zone==='dorm'&&G.stage==='law',JSON.stringify({d:G.day,w:G.weekday,f:[G.flags.LAW_START_DAY,G.flags.MAIN_D1],z:G.zone}));
    global.location={search:''}; }
  { fresh(D('2025-08-31'),14,'campus',{LAW_START_DAY:-18,MAIN_D1:-13}); G.stage='law'; run(14,14.6); const before=PHONE.inGroup(G,'law_class'); run(14.7,14.9); const after=PHONE.inGroup(G,'law_class');
    check('14. 選 1：8/31 開學典禮中（約 14:40）加進班群，之前沒有（AA-B 7b2d057f）',!before&&after);
    fresh(1,20,'dorm',{}); G.stage='law'; run(20,20.9); const o1=PHONE.inGroup(G,'law_class'); run(21,21.2);
    check('14. 舊局：照舊第 1 天 21:00 加進班群',!o1&&PHONE.inGroup(G,'law_class')); }
  { fresh(D('2025-08-29'),7,'dorm',{}); G.stage='econ'; global.location={search:'?start1'}; const recaps=[]; STORY.recap=async(gm,lines)=>{ recaps.push(lines.slice()); }; GM.backupNow=()=>{}; GM.autosave=()=>{}; cards=[]; said=[];
    const due=STORY.toLawDue(G); G.day=D('2025-08-28'); const notYet=!STORY.toLawDue(G); G.day=D('2025-08-29');
    await STORY.toLaw(GM);
    check('15. 經濟系（?start1）8/29 早上就轉（8/28 還沒）（AA-B 21:09）',due&&notYet);
    check('15. 轉過去：8/29 16:05 搬進宿舍（日期卡「8 月 29 日（五）16:05 · 男生宿舍」，AA_195 4-2）、LAW_START_DAY −18、MAIN_D1 −13；只有日期卡（沒有「2025 年 9 月 臺大法律系 大一」）；經濟系版旁白',G.stage==='law'&&G.day===-18&&G.flags.LAW_START_DAY===-18&&G.flags.MAIN_D1===-13&&G.flags.KAI_MOVEIN===true&&G.zone==='dorm'&&!cards.some(c=>/臺大法律系/.test(c[0]))&&cards.some(c=>c[0]==='8 月 29 日（五）'&&c[1]==='16:05 · 男生宿舍')&&said.some(x=>x.t==='你去年也搬過一次宿舍，這次只有一個行李箱。'),JSON.stringify({d:G.day,h:G.hour,f:[G.flags.LAW_START_DAY,G.flags.MAIN_D1],z:G.zone,cards,said:said.map(x=>x.t)}));
    check('15. 暑假摘要只留前兩句（拿掉「八月底，你搬進法律系的宿舍」「經濟學原理還沒收起來」）',recaps[0]&&recaps[0].length===2&&!recaps.some(r=>r.some(t=>/搬進法律系的宿舍|經濟學原理還沒收起來/.test(t))),JSON.stringify(recaps));
    check('15. 新局的開頭摘要最後一句：「八月底，你回到同一個校園，換了一個系。」',STORY.LAW_START_RECAP_W1.slice(-1)[0]==='八月底，你回到同一個校園，換了一個系。'&&STORY.LAW_START_RECAP_W1.length===STORY.LAW_START_RECAP.length);
    global.location={search:'?start0'}; fresh(D('2025-08-29'),7,'dorm',{}); G.stage='econ'; check('15. ?start0（舊開局）：照舊 8/31 才轉',!STORY.toLawDue(G)); }
  { const play=async(day,hour,flags)=>{ fresh(day,hour,'dorm',flags); G.stage='law'; cards=[]; GM.sceneBegin=()=>{}; GM.letterbox=()=>{}; try{ await STORY.onEnter('dorm',GM); }catch(e){ said.push({t:'例外 '+e.message}); } return {lines:said.map(x=>x.t),cards:cards.slice()}; };
    const w1=await play(D('2025-09-03'),21,{LAW_START_DAY:-18,MAIN_D1:-13});
    check('16. 選 1：9/3 晚上回宿舍演宿舍那一晚：日期卡「9 月 3 日（三）」、AA_195 4-1 的三句、沒有「開學第三週」「老師上週說」、沒有 DAY1_NARR',
      (w1.cards[0]||[])[0]==='9 月 3 日（三）'&&w1.lines[0]==='明天下午是民法總則的第一堂。'&&w1.lines.some(t=>/課綱第一週那一格/.test(t))&&!w1.lines.some(t=>/開學第三週|老師上週說|以前遇到事情|例外/.test(t)),JSON.stringify(w1).slice(0,400));
    const wl=await play(D('2025-09-03'),23.6,{LAW_START_DAY:-18,MAIN_D1:-13});
    check('16. 選 1：23:30 以後才回宿舍＝短版兩句（AA_195 4-1）',wl.lines[0]==='你回到宿舍的時候已經很晚了。'&&/明天下午是民法總則的第一堂。印好的案例還在桌上/.test(wl.lines[1]||'')&&!wl.lines.some(t=>/一個字都沒畫|例外/.test(t)),JSON.stringify(wl).slice(0,300));
    const w0=await play(D('2025-09-03'),19.5,{LAW_START_DAY:-18,MAIN_D1:-13});
    check('16. 選 1：9/3 晚上 8 點以前回宿舍不演',!w0.lines.length&&!w0.cards.length,JSON.stringify(w0).slice(0,200));
    const old=await play(1,21.2,{});
    check('16. 舊局：第 1 天照舊（「第一天」標題卡、「開學第三週」、DAY1_NARR）',(old.cards[0]||[])[0]==='第一天'&&old.lines.some(t=>/開學第三週/.test(t))&&old.lines.some(t=>/以前遇到事情/.test(t))&&!old.lines.some(t=>/例外/.test(t)),JSON.stringify(old).slice(0,300)); }
  { const e=ev('ev_zhe_w1_meet'); const W1={LAW_START_DAY:-18,MAIN_D1:-13};
    const ok=(day,hour,flags)=>{ fresh(day,hour,'classroom',flags); G.stage='law'; return EVENTS.check(e,{chain:true}); };
    check('17. 阿哲初遇：新局 9/1 上課前（09:00）在 201 坐下會演、9/3 也會；9/2、上課以後（09:30）、已經認識、舊局都不演',
      ok(D('2025-09-01'),9,W1)&&ok(D('2025-09-03'),8.9,W1)&&!ok(D('2025-09-02'),9,W1)&&!ok(D('2025-09-01'),9.5,W1)&&!ok(D('2025-09-01'),9,Object.assign({MET_ZHE:true},W1))&&!ok(D('2025-09-01'),9,{}));
    fresh(D('2025-09-01'),9,'classroom',W1); G.stage='law'; check('17. 新局還沒遇到：STORY.knows(zhe) 是 false；舊局是 true',!STORY.knows('zhe',G)&&(()=>{ const g0=G; fresh(5,10,'campus',{}); const r=STORY.knows('zhe',G); G=g0; return r; })());
    fresh(D('2025-09-01'),9,'classroom',W1); G.stage='law'; picks=[0]; await EVENTS.run(e);
    check('17. 9/1 演完：MET_ZHE、選麵店記 ZHE_W1_NOODLE、FIRST_MET、knows(zhe)；第二句是「昨天在公館繞了半小時」',G.flags.MET_ZHE===true&&G.flags.ZHE_W1_NOODLE===true&&SOCIAL.has('zhe','FIRST_MET')&&STORY.knows('zhe',G)&&lines().some(t=>/昨天在公館繞了半小時/.test(t))&&lines().some(t=>/我阿哲。張哲維。/.test(t)),lines().join('｜').slice(0,300));
    fresh(D('2025-09-03'),9,'classroom',W1); G.stage='law'; picks=[2]; await EVENTS.run(e);
    check('17. 9/3 備案：第二句換「這幾天中午都在便利商店解決」、選「還在找」沒有 ZHE_W1_NOODLE',G.flags.MET_ZHE===true&&!G.flags.ZHE_W1_NOODLE&&lines().some(t=>/這幾天中午都在便利商店解決/.test(t))&&!lines().some(t=>/昨天在公館/.test(t))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
