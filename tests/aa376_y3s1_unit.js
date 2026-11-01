// AA_376（企劃線 69aa3b0c；AA 2026-10-21 定稿）法律系大三上：作息、重複、時間＋AA_342 第 3-1 節大三上的補稿（企劃線 b7c437a1；白名單現在是 f2de8d1c，第 3-1 節一字不差）——不需要瀏覽器。
//   任務 AA376-Y3S1-FIX-1021、AA342-COVERAGE-1021。第 2 項（v7 舊刑訴課堂）LAWWW 已經在 2469df7f 停用，這裡只當對照測（第 6 節 BB 的第 2 點）。
//   1 語彤 12/16 以後的週四 17:00～20:00 在總圖三樓（期末週也是；手機「現在大概在」）、大三下 2/24 起才是田野　3 9/13 總圖「明天第一次上台」
//   4 子晴 Q10 演過 Q8b 的換「……上次跟你說的那個遊戲。」　5 K5-L3 K17 演過就算過、K17 聽過 K5-L3 換第一句　6 K5-L2 要 KX_SHORT_MEET　7 開學第一頓「讀書會八點。……我們先走。」、19:40 先走
//   8 颱風夜「那棟」　9 以安 A5-L2 三句　10 語彤 Y5-L6 到過現場的不播、Y5-L7 第 14～15 週且 12/16 以前、續約轉述「他高中的時候」　11 A5-L1 第 2 週起、Y5-L1 事件 12 以後
//   12 K15 選項「昨天」　13 K15「我七點要回學校。」　14 感冒週可昕「我下週也期中」　15 9/14 語彤 17:30～18:30 在總圖門口、麵店 18:30 起　16 方奕廷 11/1～11/7 上山沒訊號
//   17 學姊（交往中、沒被告知）語彤知道才說「語彤說」　18 日本路線 A5-L8、Y5-L8 的選項　19 四件大一的初識事件限大一　20 「大四還沒開始」
//   AA_342 3-1：9/21 第一次週二麵店、9/27 群組→9/28 河濱、10/7「下週的題目，你帶。」→10/14「理由呢？」（BB T3）、10/8 柏翰私訊、11/3 摘要日、11/5 群組、12/8 群組→12/9 麵店、12/18 摘要日
//   台詞逐字比對企劃線的稿（git show 69aa3b0c、f2de8d1c；第 3-1 節和 b7c437a1 一字不差；PG_DOC_REPO＝讀稿的 repo，預設這個 repo）。
// 修改前（開發分支 f23f5c47）：上面每一項都會失敗（標「對照」的照樣通過）。用法：node tests/aa376_y3s1_unit.js
// 2026-10-28 AA_518 第 4-12 改的（企劃線 973dd1b74，SIS-B15-1028）：研究所說明會要見過學姊（met_sis）——第 19 節說明會那一項的前置多 met_sis（限大一照舊查）。
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|PORTRAIT_ONLY|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|HOMETOWN_LINES|NEEDED_MSGS|TERMEND|TERMEND_LINES|SYLLABUS|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|Y2B|Y2B_EVENTS|Y2R2|GROUP|GROUP_EVENTS|Y34B|R2Y3A|R2Y3A_EVENTS|MENTOR_WHY_TEXT|HV|Y3FILL|Y3FILL_LINES|Y3FILL_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/data/hometown_lines.js','src/data/needed_msgs.js','src/data/termend_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/story3d.js','src/data/syllabus.js','src/classes3d.js','src/termend3d.js',
  'src/data/y2b_events.js','src/y2b3d.js','src/data/group_events.js','src/group3d.js','src/y2r2_3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/y3fill_events.js','src/y3fill3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info&&!ok?'　'+info:'')); if(!ok) fails++; };
const sec=async(name,f)=>{ try{ await f(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},hide(){},cg(){ return true; },setBg(b){ this.bg=b; }}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
if(typeof HOME!=='undefined') HOME.phoneRules=()=>{};   /* 家人群組的週訊息和這裡無關 */
let said=[], opts=[], picks=[], G=null, cards=[], caps=[];
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[]},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},syncWeekday(){ G.weekday=wdOf(G.day); },
  titleCard:async(a,b)=>{ cards.push([a,b]); },enter:async(z)=>{ G.zone=z; },advance(h){ G.hour+=h; while(G.hour>=24){ G.hour-=24; G.day++; } G.weekday=wdOf(G.day); },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},
  money(n){ G.money+=n; },
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k), J=x=>JSON.stringify(x);
/* ROOM_Y2、ROOM_Y3：大三上的存檔都已經搬過 312、507（沒有這兩個，到宿舍會先演搬房間的字卡）*/
const fresh=(key,hour,zone,flags)=>{ const day=typeof key==='number'?key:D(key); G={v:3,day,hour,zone:zone||'dorm',stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true,ROOM_Y2:true,ROOM_Y3:true},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[]};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; cards=[]; caps=[]; GM.npc={}; E.interactables=[]; E.npcs.length=0; ADV.active=false; if(typeof Y3FILL!=='undefined'&&Y3FILL.reset) Y3FILL.reset(); return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv]; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const date=id=>{ G.flags['dating_'+id]=true; const r=ROM.get(G,id); if(r) r.status='dating'; SOCIAL.remember(id,'FIRST_MET',''); };
const join=g=>PHONE.join(G,g,g);
const has=t=>said.some(s=>s.t===t), any=re=>said.some(s=>re.test(s.t)), all=()=>said.map(s=>s.t);
const TH=th=>(G.msgs||[]).filter(m=>m.th===th), txt=th=>TH(th).map(m=>(m.from||'')+':'+m.text);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const to=(key,h)=>{ G.day=typeof key==='number'?key:D(key); G.hour=h; G.weekday=wdOf(G.day); };
const play=async(id,pk)=>{ said=[]; opts=[]; picks=pk||[]; await EVENTS.run(ev(id)); };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const runPhone=(key,h0,h1,st)=>{ st=st||0.25; for(let h=h0;h<=h1+1e-9;h+=st){ to(key,+h.toFixed(3)); phone(); } };
const lad=(id,term)=>(LADDER.byTerm[term]||{})[id], stepOf=(id,term,sid)=>{ const L=lad(id,term); return L?L.steps.find(s=>s.id===sid):null; }, idxOf=(id,term,sid)=>{ const L=lad(id,term); return L?L.steps.findIndex(s=>s.id===sid):-1; };
const ladAt=(id,term,sid)=>{ STORY.ladData(G,id); const so=G.social||(G.social={}); so.ladder=so.ladder||{}; so.ladderDay=so.ladderDay||{}; so.ladder[id+'@'+term]=idxOf(id,term,sid); delete so.ladderDay[id]; };
const ladKey=(id,term)=>((G.social&&G.social.ladder)||{})[id+'@'+term]|0;
const whereText=w=>!w?'':(w.away?w.away:((PLACES.names[w.zone]||w.zone)+(w.act?'（'+w.act+'，到 '+w.until+'）':'')));   /* 同 game3d.js 的 whereText（手機「現在大概在」）*/
const DOCR=process.env.PG_DOC_REPO||ROOT;
const doc=(sha,p)=>{ try{ return cp.execSync('git -C "'+DOCR+'" show "'+sha+':'+p+'"',{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const P376='docs/story_planning/AA_376_法律系大三上_作息與重複_修正稿.md', P342='docs/story_planning/AA_342_臺灣路線六學期_每一週能做什麼_覆蓋盤點與補空白.md';
const MD376=doc('69aa3b0c',P376), MD342=doc('f2de8d1c',P342);
const in376=t=>MD376.includes(t), in342=t=>MD342.includes(t);
(async()=>{
  await sec('0',async()=>{
    check('0. 讀得到稿（企劃線 69aa3b0c AA_376、f2de8d1c AA_342）',MD376.length>1000&&MD342.length>1000&&in376('AA_376')&&in342('3-1. 大三上'));
    const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/data/y3fill_events.js'), b=h.indexOf('src/y3fill3d.js');
    check('0. index.html：y1fill3d.js → data/y3fill_events.js → y3fill3d.js → GAME.boot()',a>0&&b>a&&a>h.indexOf('src/y1fill3d.js')&&a>h.indexOf('src/r2y3a3d.js')&&b<h.indexOf('GAME.boot()'));
    check('0. Y3FILL、Y3FILL_EVENTS 載入；五個事件在 STORY_EVENTS、id 不重複',typeof Y3FILL!=='undefined'&&typeof Y3FILL_EVENTS!=='undefined'&&['ev_y3_tue_noodle','ev_y3_river33','ev_y3_plg_topic','ev_y3_plg_lead','ev_y3_last_noodle'].every(i=>STORY_EVENTS.filter(e=>e.id===i).length===1));
    check('0. 掛勾：STORY.PHONE_RULES、STORY.TICKS 有這一包',typeof Y3FILL!=='undefined'&&STORY.PHONE_RULES.some(f=>/S\.phone\(G\)/.test(String(f))&&String(f).length<40)&&STORY.TICKS.some(f=>/S\.tick\(GM,dt\)/.test(String(f))));
    const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files, a376=A.find(e=>e.path===P376), a342=A.find(e=>e.path===P342);
    check('0. 匯入白名單：AA_376@69aa3b0c、AA_342@f2de8d1c（approved）',!!a376&&a376.sha==='69aa3b0c'&&a376.status==='approved'&&!!a342&&a342.sha==='f2de8d1c'&&a342.status==='approved');
    const L=typeof Y3FILL_LINES!=='undefined'?Y3FILL_LINES:null, flat=x=>typeof x==='string'?[x]:Array.isArray(x)?x.flatMap(flat):x&&typeof x==='object'?Object.values(x).flatMap(flat):[];
    const S342=L?flat(L).filter(t=>!/^(zhe|yu|classmate_bohan)$/.test(t)).map(t=>t.replace(/^「(.*)」$/,'$1')):[];
    check('0. AA_342 3-1 的每一句都在稿上（逐字）',!!L&&S342.length>=14&&S342.every(in342),S342.filter(t=>!in342(t)).join('｜'));
    const NEW376=['明天第一次上台。我要講二十分鐘。','……上次跟你說的那個遊戲。','民總讀書會，我先講一次給你聽。','（翻開手帳）讀書會八點。……我們先走。','我們那棟停電了。你們這棟還有電。','那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。','那天晚上，我看了手機好幾次。','他高中的時候也來這裡吃過麵。','刑訴老師昨天點了後面三排。','我七點要回學校。','……我下週也期中，二十六號考第一科。','你兩天沒出門了吧。……我猜的。','那我們在日本找一家麵店。','我們同一班。','……那我十點去機場。送兩個。','嗯。大四還沒開始，我想在這裡過。','（你想，大四還沒開始。你想在這裡過。）'];
    check('0. AA_376 的「改成」都在稿上（測試用的句子對過稿）',NEW376.every(in376),NEW376.filter(t=>!in376(t)).join('｜'));
  });
  // ===== 1. 語彤週四 =====
  await sec('1',async()=>{
    const YT='heroine_03'; fresh('2027-12-09',18,'campus'); R(YT,'FRI');
    const w0=STORY.whereIs(GM,YT); to('2027-12-16',17.5); const w1=STORY.whereIs(GM,YT); to('2027-12-23',18); const w2=STORY.whereIs(GM,YT); to('2027-12-23',19.9); const w3=STORY.whereIs(GM,YT);
    check('1. 12/9（四）18:00 在麵店顧店；12/16（四）17:30、12/23（四，期末週）18:00、19:54 在總圖三樓（看書）',!!w0&&w0.zone==='noodle'&&!!w1&&w1.zone==='library'&&!!w2&&w2.zone==='library'&&w2.act==='看書'&&!!w3&&w3.zone==='library'&&(CALENDAR.termOf(D('2027-12-23'))||{}).exam==='final',J([w0,w1,w2,w3]));
    check('1. 手機「現在大概在」：「總圖 3F 閱覽區（看書，到 20:00）」，不是「在做田野訪談」',whereText(w2)==='總圖 3F 閱覽區（看書，到 20:00）',whereText(w2));
    to('2028-01-06',18); const w4=STORY.whereIs(GM,YT); to('2028-02-24',18); const w5=STORY.whereIs(GM,YT); to('2028-03-02',17.5); const w6=STORY.whereIs(GM,YT);
    check('1. 寒假的週四不是田野；大三下 2/24（第 1 週週四）起才在做田野訪談',!/田野/.test((w4&&w4.away)||'')&&!!w5&&w5.zone===null&&w5.away==='在做田野訪談'&&!!w6&&w6.away==='在做田野訪談',J([w4,w5,w6]));
  });
  // ===== 2. 對照：v7 舊刑訴課堂（LAWWW 2469df7f 已停用）=====
  await sec('2',async()=>{
    fresh('2027-09-14',9.3,'classroom'); check('2. 對照（BB 第 2 點）：大三上週二走進 201，舊的刑訴課堂、小考不演',!EVENTS.check(ev('ev_class_crimpro'))&&!EVENTS.check(ev('ev_quiz_crimpro')));
  });
  // ===== 3. 9/13 總圖「明天第一次上台」=====
  await sec('3',async()=>{
    fresh('2027-09-13',19.5,'library'); R('heroine_03','FRI'); await play('ev_yt_ta_news_lib');
    check('3. 9/13（週一）總圖：「明天第一次上台。我要講二十分鐘。」（BB 第 3 點）',has('明天第一次上台。我要講二十分鐘。')&&!any(/下週二第一次上台/),J(all()));
    fresh('2027-09-07',18,'noodle'); R('heroine_03','FRI'); await play('ev_yt_ta_news');
    check('3. 對照：第 1 週在麵店那一版照舊「下週二第一次上台。」',has('下週二第一次上台。我要講二十分鐘。'));
  });
  // ===== 4. 子晴 Q10 =====
  await sec('4',async()=>{
    const Q='heroine_04'; fresh('2027-11-09',19.5,'cafe'); R(Q,'FRI'); await play('ev_ziqing_capstone'); const a=all().slice(0,2);
    fresh('2027-11-09',19.5,'cafe'); R(Q,'FRI'); G.events.done.ev_ziqing_dad_stuck=1; await play('ev_ziqing_capstone'); const b=all().slice(0,2);
    fresh('2027-11-09',19.5,'cafe'); R(Q,'FRI'); SOCIAL.remember(Q,'PLAYTESTED',''); await play('ev_ziqing_capstone'); const c=all().slice(0,1);
    check('4. 沒演過 Q8b、沒看過 Q6：「……你應該不知道。我在做遊戲…」',a[0]==='……你應該不知道。我在做遊戲，大一就開始了。上個月丟到網路上。'&&a[1]==='畢業專題。我要交那隻貓。',J(a));
    check('4. 演過 Q8b（ev_ziqing_dad_stuck）：第一句換「……上次跟你說的那個遊戲。」，後面照接',b[0]==='……上次跟你說的那個遊戲。'&&b[1]==='畢業專題。我要交那隻貓。',J(b));
    check('4. 對照：看過 Q6、沒演過 Q8b：照舊沒有開頭那一句',c[0]==='畢業專題。我要交那隻貓。',J(c));
  });
  // ===== 5. K5-L3／K17 =====
  await sec('5',async()=>{
    const KX='kexin', w14=STORY.termDay('Y3S1',14,5); fresh(w14,21,'dorm'); date(KX); ladAt(KX,'Y3S1','K5-L3');
    const s0=STORY.ladNext(G,KX,'video'); G.events.done.ev_kexin_tutor_practice=1; ladAt(KX,'Y3S1','K5-L3'); const s1=STORY.ladNext(G,KX,'video');
    check('5. K17 還沒演：視訊推進 K5-L3；K17（12/9）演過以後 K5-L3 直接算過（不再宣布一次）',!!s0&&s0.id==='K5-L3'&&(!s1||s1.id!=='K5-L3')&&ladKey(KX,'Y3S1')>idxOf(KX,'Y3S1','K5-L3'),J([s0&&s0.id,s1&&s1.id,ladKey(KX,'Y3S1')]));
    fresh('2027-12-09',21.75,'dorm'); date(KX); SOCIAL.remember(KX,'KX5_HYPO_SENIOR','K5-L3'); await play('ev_kexin_tutor_practice'); const a=all();
    fresh('2027-12-09',21.75,'dorm'); date(KX); await play('ev_kexin_tutor_practice'); const b=all();
    check('5. 聽過 K5-L3（KX5_HYPO_SENIOR）：K17 第一句「民總讀書會，我先講一次給你聽。」，那通視訊只宣布一次（BB 第 4 點）',a[0]==='民總讀書會，我先講一次給你聽。'&&!a.some(t=>/我開始帶大一的民總讀書會了/.test(t))&&a.filter(t=>/民總讀書會/.test(t)).length===1,J(a.slice(0,2)));
    check('5. 對照：沒聽過 K5-L3 的照原句',b[0]==='我開始帶大一的民總讀書會了。我先講一次給你聽，你當學弟妹。',J(b.slice(0,1)));
  });
  // ===== 6. K5-L2 要 KX_SHORT_MEET =====
  await sec('6',async()=>{
    const KX='kexin'; fresh('2027-09-29',19,'any'); date(KX); ladAt(KX,'Y3S1','K5-L2'); const s0=STORY.ladNext(G,KX,'meet'), k0=ladKey(KX,'Y3S1');
    fresh('2027-09-29',19,'any'); date(KX); G.flags.KX_SHORT_MEET=true; ladAt(KX,'Y3S1','K5-L2'); const s1=STORY.ladNext(G,KX,'meet');
    fresh('2027-09-20',19,'any'); date(KX); ladAt(KX,'Y3S1','K5-L2'); STORY.ladNext(G,KX,'meet'); const k2=ladKey(KX,'Y3S1');
    check('6. K15 沒有三十分鐘的見面（沒有 KX_SHORT_MEET）：K5-L2「三十分鐘的見面…」算過；有的照播；9/22 以前還不判斷',(!s0||s0.id!=='K5-L2')&&k0>idxOf(KX,'Y3S1','K5-L2')&&!!s1&&s1.id==='K5-L2'&&k2===idxOf(KX,'Y3S1','K5-L2'),J([s0&&s0.id,k0,s1&&s1.id,k2]));
  });
  // ===== 7. 開學第一頓 =====
  await sec('7',async()=>{
    for(const id of ['zhe','yu','classmate_bohan','heroine_01']) void 0;
    fresh('2027-09-09',19,'noodle'); for(const id of ['zhe','yu','classmate_bohan','heroine_01']) R(id,'FAM'); await play('ev_y3_first_meal',[1]); const L=all(), h1=G.hour;
    check('7. 以安「（翻開手帳）讀書會八點。……我們先走。」（原本「週四的讀書會照常。八點。」）',has('（翻開手帳）讀書會八點。……我們先走。')&&!any(/週四的讀書會照常/),J(L));
    check('7. 19:40 以安、Alison、柏翰先走（照 10/21 那一場：跳到 19:40）；出遊照樣 20:30 結束（hours 剩 50 分鐘）',Math.abs(h1-(19+40/60))<0.01&&Math.abs(ev('ev_y3_first_meal').hours*60-50)<1e-6,String(h1));
  });
  // ===== 8. 颱風夜 =====
  await sec('8',async()=>{
    fresh('2027-10-13',20,'dorm'); R('kai','FAM'); await play('ev_typhoon_y3_noodle');
    check('8. 阿凱「我們那棟停電了。你們這棟還有電。」（大二起他住別棟）',has('我們那棟停電了。你們這棟還有電。')&&!any(/那層停電/),J(all().slice(0,6)));
  });
  // ===== 9. 以安 A5-L2 =====
  await sec('9',async()=>{
    const s=stepOf('heroine_01','Y3S1','A5-L2'), li=s&&(s.linesIf||[]).find(x=>x.if&&x.if.memory), ex=s&&(s.extraIf||[])[0], ch=s&&s.choices[1];
    check('9. 在場的：「那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。」（照中秋那場）',!!li&&li.lines[1]==='那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。',J(li));
    check('9. 選項②「柚子好吃嗎？」：引號裡那一句換掉（「很甜。」照舊）',!!ch&&ch.t==='「柚子好吃嗎？」'&&ch.reply==='很甜。那天的柚子，阿哲剝完就沒人吃。……我帶回去了，我室友說太酸。',J(ch));
    check('9. 交往中：「那天晚上，我看了手機好幾次。」',!!ex&&J(ex.lines)===J(['那天晚上，我看了手機好幾次。']),J(ex));
  });
  // ===== 10. 語彤 Y5-L6／L7、續約轉述 =====
  await sec('10',async()=>{
    const YT='heroine_03', w13=STORY.termDay('Y3S1',13,1); fresh(w13,15,'campus'); R(YT,'FRI'); G.flags.RENT_RENEWED=true; G.flags.YT_EV14='there'; ladAt(YT,'Y3S1','Y5-L6'); const s0=STORY.ladNext(G,YT);
    fresh(w13,15,'campus'); R(YT,'FRI'); G.flags.RENT_RENEWED=true; G.flags.YT_EV14='heard'; ladAt(YT,'Y3S1','Y5-L6'); const s1=STORY.ladNext(G,YT);
    check('10. Y5-L6「房東那件事結束了…」只給沒到續約現場的（YT_EV14 不是 there）',(!s0||s0.id!=='Y5-L6')&&!!s1&&s1.id==='Y5-L6',J([s0&&s0.id,s1&&s1.id]));
    const at=(key,h)=>{ fresh(key,h,'campus'); R(YT,'FRI'); ladAt(YT,'Y3S1','Y5-L7'); return STORY.ladNext(G,YT); };
    const a=at(STORY.termDay('Y3S1',13,5),15), b=at(STORY.termDay('Y3S1',14,1),15), c=at('2027-12-15',15), d=at('2027-12-16',12);
    check('10. Y5-L7「阿姨在找工讀生…」第 14～15 週、事件 13（12/16）以前：第 13 週不播、第 14 週週一和 12/15 播、12/16 以後算過',!a&&!!b&&b.id==='Y5-L7'&&!!c&&c.id==='Y5-L7'&&(!d||d.id!=='Y5-L7')&&ladKey(YT,'Y3S1')>idxOf(YT,'Y3S1','Y5-L7'),J([a&&a.id,b&&b.id,c&&c.id,d&&d.id]));
    fresh('2027-11-25',18,'noodle'); R(YT,'FAM'); await play('ev_yt_lease_retell'); const L=all();
    fresh('2027-12-14',20.9,'dorm'); R(YT,'FAM'); runPhone('2027-12-14',20.9,21.2,0.1); const M=txt('p:heroine_03');
    check('10. 續約轉述（當面、手機）：「……新屋主說，他高中的時候也來這裡吃過麵。」（和現場一致）',L[1]==='……新屋主說，他高中的時候也來這裡吃過麵。'&&M.includes('heroine_03:……新屋主說，他高中的時候也來這裡吃過麵。')&&!L.concat(M).some(t=>/小時候/.test(t)),J([L[1],M]));
  });
  // ===== 11. A5-L1、Y5-L1 =====
  await sec('11',async()=>{
    const AN='heroine_01', YT='heroine_03'; fresh(STORY.termDay('Y3S1',1,1),12,'campus'); R(AN,'FAM'); ladAt(AN,'Y3S1','A5-L1'); const a=STORY.ladNext(G,AN);
    fresh(STORY.termDay('Y3S1',2,1),12,'campus'); R(AN,'FAM'); ladAt(AN,'Y3S1','A5-L1'); const b=STORY.ladNext(G,AN);
    check('11. 以安 A5-L1「刑訴我每堂都寫四頁筆記」第 2 週起（第 1 週週一不播）',!a&&!!b&&b.id==='A5-L1',J([a&&a.id,b&&b.id]));
    fresh('2027-09-13',12,'campus'); R(YT,'FAM'); ladAt(YT,'Y3S1','Y5-L1'); const c=STORY.ladNext(G,YT);
    fresh('2027-09-15',12,'campus'); R(YT,'FAM'); ladAt(YT,'Y3S1','Y5-L1'); const d=STORY.ladNext(G,YT);
    check('11. 語彤 Y5-L1（回覆「上台前我都要先去洗手。」）在事件 12（9/14 第一次上台）之後：9/13 不播、9/15 播',!c&&!!d&&d.id==='Y5-L1',J([c&&c.id,d&&d.id]));
  });
  // ===== 12、13. K15 =====
  await sec('12',async()=>{
    fresh('2027-09-22',18,'gongguan'); date('kexin'); await play('ev_kexin_30min',[0,0]);
    check('12. K15 選項「刑訴老師昨天點了後面三排。」（刑訴在週二、五）',(opts[1]||[]).includes('「刑訴老師昨天點了後面三排。」')&&!(opts[1]||[]).includes('「刑訴老師點了後面三排。」'),J(opts));
    fresh('2027-09-22',16.9,'dorm'); date('kexin'); runPhone('2027-09-22',16.9,17.1,0.1);
    check('13. K15 手機「我七點要回學校。六點公館，吃三十分鐘，夠嗎？」',txt('p:kexin').includes('kexin:我七點要回學校。六點公館，吃三十分鐘，夠嗎？'),J(txt('p:kexin')));
  });
  // ===== 14、17. 感冒週 =====
  await sec('14',async()=>{
    fresh('2027-10-23',8,'dorm'); date('kexin'); picks=['跟可昕']; await STORY.coldWeekSneeze(GM);
    check('14. 可昕「……我下週也期中，二十六號考第一科。」（10/23 週六）',txt('p:kexin').includes('kexin:……我下週也期中，二十六號考第一科。')&&!txt('p:kexin').some(t=>/這週也期中/.test(t)),J(txt('p:kexin')));
    fresh('2027-10-24',21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); date('heroine_05'); const A=STORY.coldWeekLines(G,'heroine_05');
    fresh('2027-10-24',21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'none'}); date('heroine_05'); R('heroine_03','CLO'); const C=STORY.coldWeekCast(G), B=STORY.coldWeekLines(G,'heroine_05',C);
    check('17. 學姊交往中、沒被告知：語彤沒來（不知道）＝「你兩天沒出門了吧。……我猜的。」；語彤有來（送湯那一條的條件）＝「語彤說你兩天沒出門。」',J(A[0])===J(['heroine_05','你兩天沒出門了吧。……我猜的。'])&&C.visitors.includes('heroine_03')&&J(B[0])===J(['heroine_05','語彤說你兩天沒出門。']),J([A[0],B[0]]));
    fresh('2027-10-24',21.5,'dorm',{COLD_WEEK:'night',COLD_WEEK_TOLD:'heroine_05'}); date('heroine_05'); const T=STORY.coldWeekLines(G,'heroine_05');
    check('17. 對照：被告知的照舊沒有那一句',T[0][1]==='粥。還是熱的。你先吃，我坐一下就走。',J(T[0]));
  });
  // ===== 15. 9/14 語彤 =====
  await sec('15',async()=>{
    const YT='heroine_03'; fresh('2027-09-14',17.75,'campus'); R(YT,'FRI'); const a=STORY.whereIs(GM,YT); to('2027-09-14',18.75); const b=STORY.whereIs(GM,YT); to('2027-09-21',17.75); const c=STORY.whereIs(GM,YT);
    check('15. 9/14（二）17:30～18:30 在總圖門口（校園）、18:30 起才在麵店；對照：9/21 週二 17:45 照舊在麵店',!!a&&a.zone==='campus'&&!!b&&b.zone==='noodle'&&!!c&&c.zone==='noodle',J([a,b,c]));
  });
  // ===== 16. 方奕廷 =====
  await sec('16',async()=>{
    fresh('2027-11-03',12.5,'campus'); const p=STORY.presence('npc_fangyt',G); to('2027-11-08',12.5); const q=STORY.presence('npc_fangyt',G); to('2027-10-31',12.5); const r=STORY.presence('npc_fangyt',G);
    check('16. 11/1～11/7 上山（沒訊號）：不在校園、手機寫「上山做調查（沒有訊號）」；11/8 下山、10/31 還在',!!p&&p.here===false&&p.kind==='trip'&&!p.signal&&/上山/.test(p.away||'')&&!!q&&q.here!==false&&!!r&&r.here!==false,J([p,q,r]));
  });
  // ===== 18. 日本路線的選項 =====
  await sec('18',async()=>{
    const a=stepOf('heroine_01','Y3S1','A5-L8'), y=stepOf('heroine_03','Y3S1','Y5-L8');
    fresh('2027-12-13',12,'campus',{EXCHANGE_ROUTE:'JP'}); const aj=STORY.ladChoices(a).map(c=>c.t), yj=STORY.ladChoices(y), yr=yj.find(c=>c.t==='「我們同一班。」');
    fresh('2027-12-13',12,'campus',{EXCHANGE_ROUTE:'TW'}); const at=STORY.ladChoices(a).map(c=>c.t), yt=STORY.ladChoices(y).map(c=>c.t);
    check('18. 以安 A5-L8 日本路線：「那我們在日本找一家麵店。」（不出「我們幫妳把位子占著。」）；臺灣路線照舊',J(aj)===J(['「那我們在日本找一家麵店。」','「回來第一碗我請。」'])&&J(at)===J(['「我們幫妳把位子占著。」','「回來第一碗我請。」']),J([aj,at]));
    check('18. 語彤 Y5-L8 日本路線：「我們同一班。」→「……那我十點去機場。送兩個。」；臺灣路線照舊「一起去。」',J(yj.map(c=>c.t))===J(['「我們同一班。」','「以安會想念麵店。」'])&&!!yr&&STORY.ladReply(y,yr)==='……那我十點去機場。送兩個。'&&J(yt)===J(['「一起去。」','「以安會想念麵店。」']),J([yj.map(c=>c.t),yt]));
  });
  // ===== 19. 大一的初識事件限大一 =====
  await sec('19',async()=>{
    const C=[['ev_sis_w1','cafe',['2025-09-10','2027-09-15'],15],['ev_fangyt_pothos','campus',['2025-09-10','2027-09-15'],12.5],['ev_prof_zhou_office','wancai',['2025-09-11','2027-09-16'],15.5],['ev_grad_info_session','wancai',['2025-09-12','2027-09-17'],15]];
    const M={MAIN_D1:STORY.MAIN_D1_NEW,LAW_START_DAY:STORY.LAW_D0};   /* [前置] 新局：法律系主線第一天（day_min 照這個算）*/
    const out=C.map(([id,z,[y1,y3],h])=>{ const M2=id==='ev_grad_info_session'?Object.assign({met_sis:true},M):M;   /* AA_518 4-12：說明會要見過她 */ fresh(y1,h,z,M2); const a=EVENTS.check(ev(id)); fresh(y3,h,z,M2); const b=EVENTS.check(ev(id)); return [id,a,b]; });
    check('19. ev_sis_w1、ev_fangyt_pothos、ev_prof_zhou_office、ev_grad_info_session：大一照常、大三上不演（大一沒觸發就不演）',out.every(([,a,b])=>a===true&&b===false),J(out));
  });
  // ===== 20. 交換志願表 =====
  await sec('20',async()=>{
    const d17=D('2027-11-17'); fresh(d17,15.5,'cafe'); R('heroine_01','FAM'); PHONE.at(G,d17-1,21,[{th:'p:heroine_01',from:'heroine_01',text:'明天下午三點半，兩點半 Café。交換的志願表，後天截止。'}],'y3_an15_invite'); PHONE.tick(G); picks=['還在想']; await STORY.an15Cafe(GM);   /* [前置] 11/16 21:00 她約了（an15Due 要有這一則）*/ const o=(opts[0]||[]).slice();
    fresh('2027-11-18',9,'dorm'); const L=STORY.routeNarrLines(G);
    check('20. 臺灣路線：「嗯。大四還沒開始，我想在這裡過。」「（你想，大四還沒開始。你想在這裡過。）」',o[0]==='「嗯。大四還沒開始，我想在這裡過。」'&&L[1]==='（你想，大四還沒開始。你想在這裡過。）'&&!J(o.concat(L)).includes('臺灣的大四'),J([o,L]));
  });
  // ===== AA_342 3-1 =====
  const NOODLE=()=>{ for(const id of ['zhe','yu','classmate_bohan','heroine_01']) R(id,'FAM'); join('noodle_team'); G.flags.noodleTableDay=D('2026-03-01'); };
  await sec('342a',async()=>{
    fresh('2027-09-21',17.5,'noodle'); NOODLE(); said=[]; EVENTS.onEnter('noodle'); await new Promise(r=>setTimeout(r,0)); const a=all();
    check('3-1 9/21（二）這學期第一次週二進麵店：旁白（逐字），只演一次',a.includes('（大三第一次在麵店遇到大家。阿姨看了一圈：「大三了，點的還是一樣。」）')&&!!G.events.done.ev_y3_tue_noodle&&!EVENTS.check(ev('ev_y3_tue_noodle')),J(a));
    const ndBefore=(()=>{ for(let d=D('2027-09-06');d<D('2027-09-21');d++) if(STORY.noodleDay(d)) return d; return D('2027-09-14'); })();   /* AA_542：麵店日每週不固定兩天，這學期 9/21 以前第一個麵店日 */
    fresh('2027-09-21',17.5,'noodle'); NOODLE(); G.flags.ndlDays=[ndBefore]; check('3-1 這學期 9/21 以前的麵店日已經去過麵店的：9/21 不演（不是第一次）',!EVENTS.check(ev('ev_y3_tue_noodle')));
    fresh('2027-09-14',17.5,'noodle'); NOODLE(); check('3-1 9/14（第 2 週）還不演（9/21 起）',!EVENTS.check(ev('ev_y3_tue_noodle')));
  });
  await sec('342b',async()=>{
    fresh('2027-09-27',20.9,'dorm'); NOODLE(); runPhone('2027-09-27',20.9,21.2,0.1); const M=TH('g:noodle_team').filter(m=>m.from==='zhe').map(m=>m.text), q=TH('g:noodle_team').find(m=>m.ask&&m.ask.id==='y3_river33_ask');
    check('3-1 9/27 21:00 群組：阿哲「明天放假 河濱 三對三」「輸的請飲料」＋「去。」「不去。」',J(M.slice(-2))===J(['明天放假 河濱 三對三','輸的請飲料'])&&!!q&&J(q.ask.opts.map(o=>o.t))===J(['去。','不去。']),J(M));
    PHONE.answer(G,'y3_river33_ask',0); runPhone('2027-09-27',21.2,21.3,0.1); const P=OUT.get(G,'y3_river33');
    check('3-1「去。」＝9/28（教師節）15:00 公館河濱的出遊',!!P&&P.day===D('2027-09-28')&&P.h===15&&P.place==='公館河濱'&&G.flags.Y3_RIVER33==='go',J(P));
    G.day=P.day; G.weekday=wdOf(G.day); G.hour=14.75; said=[]; await OUT.go(GM,P);
    check('3-1 9/28 河濱：「（三對三。你們輸了兩場，贏了一場。阿哲說贏的那一場才算。飲料還是你們請的。）」',has('（三對三。你們輸了兩場，贏了一場。阿哲說贏的那一場才算。飲料還是你們請的。）')&&G.flags.Y3_RIVER33==='went',J(all()));
    fresh('2027-09-27',20.9,'dorm'); NOODLE(); runPhone('2027-09-27',20.9,21.2,0.1); PHONE.answer(G,'y3_river33_ask',1); runPhone('2027-09-28',9,16,0.5);
    check('3-1「不去。」＝阿哲「好喔」、沒有出遊',txt('g:noodle_team').slice(-2).join('|')==='player:不去。|zhe:好喔'&&!OUT.get(G,'y3_river33'),J(txt('g:noodle_team').slice(-3)));
  });
  await sec('342c',async()=>{
    const PL=ACTIVITIES.list.find(a=>a.id==='public_law_group'); fresh('2027-10-07',19.9,'wancai',{PUBLIC_LAW_GROUP:true,CLUB_public_law_group:true}); R('heroine_01','FRI'); G.events.done.ev_public_law_group=1;
    picks=['我還不會']; said=[]; await CLS.attendActivity(GM,PL,{door:true}); const a=all();
    check('3-1 10/7（四）讀書會散會：以安「下週的題目，你帶。」→「我還不會。」→「不會才要帶。」（BB T3）',a.includes('下週的題目，你帶。')&&a.includes('不會才要帶。')&&a.indexOf('不會才要帶。')>a.indexOf('下週的題目，你帶。')&&J(opts[opts.length-1])===J(['「好。」','「我還不會。」'])&&G.flags.Y3_PLG_TOPIC==='notyet',J([a,opts]));
    to('2027-10-14',19.9); G.zone='wancai'; said=[]; await CLS.attendActivity(GM,PL,{door:true}); const b=all();
    check('3-1 10/14（四）讀書會（颱風假隔天照開）：「（你講了十五分鐘。以安只問了一個問題：「理由呢？」你答了。她在手帳上畫了一個勾。）」（BB T3）',ACTIVITIES.on(PL,D('2027-10-14'),G)&&b.includes('（你講了十五分鐘。以安只問了一個問題：「理由呢？」你答了。她在手帳上畫了一個勾。）'),J(b));
    fresh('2027-10-14',19.9,'wancai',{PUBLIC_LAW_GROUP:true}); R('heroine_01','FRI'); G.events.done.ev_public_law_group=1; said=[]; await CLS.attendActivity(GM,PL,{door:true});
    check('3-1 10/7 沒被點名的（沒去 10/7）：10/14 沒有那一句',!any(/你講了十五分鐘/),J(all()));
    fresh('2027-10-08',20.9,'dorm'); R('classmate_bohan','FAM'); INV.addContact(G,'classmate_bohan'); G.contacts.classmate_bohan=D('2026-09-01'); runPhone('2027-10-08',20.9,21.2,0.1); const m=txt('p:classmate_bohan');
    fresh('2027-10-08',20.9,'dorm',{PUBLIC_LAW_GROUP:true}); R('classmate_bohan','FAM'); INV.addContact(G,'classmate_bohan'); G.contacts.classmate_bohan=D('2026-09-01'); runPhone('2027-10-08',20.9,21.2,0.1); const n=txt('p:classmate_bohan');
    check('3-1 沒參加讀書會的：10/8（五）21:00 柏翰私訊兩則（逐字）；參加的沒有',J(m.slice(-2))===J(['classmate_bohan:民訴甲上第三章，我的筆記寫錯一個條號。','classmate_bohan:改好了。你那份也改一下。'])&&!n.some(t=>/條號/.test(t)),J([m,n]));
  });
  await sec('342d',async()=>{
    fresh('2027-11-03',18.4,'dorm'); STORY.tick(GM); const c0=cards.length; to('2027-11-03',18.6); STORY.tick(GM); await new Promise(r=>setTimeout(r,0)); const c1=cards.slice(); STORY.tick(GM); await new Promise(r=>setTimeout(r,0));
    check('3-1 11/3（三）摘要日：18:30 以後日期卡「11/3（三）…」＋「（期中考完的那一週，沒有課。你把刑訴旁聽作業的筆記整理成兩頁。）」，只一次（18:24 還沒有）',c0===0&&c1.length===1&&/^11\/3（三）18:3/.test(c1[0][0])&&c1[0][1]==='（期中考完的那一週，沒有課。你把刑訴旁聽作業的筆記整理成兩頁。）'&&cards.length===1,J(cards));
    fresh('2027-11-04',8,'dorm'); STORY.tick(GM); await new Promise(r=>setTimeout(r,0)); check('3-1 11/3 那天睡過去了：11/4 不補',cards.length===0);
    fresh('2027-12-18',19,'campus'); STORY.tick(GM); await new Promise(r=>setTimeout(r,0));
    check('3-1 12/18（六）摘要日：「（期末考前的週末。總圖的位子早上八點就沒了。）」',cards.length===1&&cards[0][1]==='（期末考前的週末。總圖的位子早上八點就沒了。）',J(cards));
    fresh('2027-11-05',21.9,'dorm'); NOODLE(); runPhone('2027-11-05',21.9,22.2,0.1);
    check('3-1 11/5（五）22:00 群組：Alison「沒課的一週」「我睡了三天」',J(txt('g:noodle_team').slice(-2))===J(['yu:沒課的一週','yu:我睡了三天']),J(txt('g:noodle_team')));
    fresh('2027-12-08',20.9,'dorm'); NOODLE(); runPhone('2027-12-08',20.9,21.2,0.1);
    check('3-1 12/8（三）21:00 群組：阿哲「期末前最後一頓 明天 麵店」',J(txt('g:noodle_team').slice(-1))===J(['zhe:期末前最後一頓 明天 麵店']),J(txt('g:noodle_team')));
    fresh('2027-12-09',18,'noodle'); NOODLE(); G.events.done.ev_y3_tue_noodle=D('2027-09-21'); said=[]; EVENTS.onEnter('noodle'); await new Promise(r=>setTimeout(r,0));   /* 這學期已經在麵店遇過大家（AA_542 起「第一次在麵店遇到大家」不只週二，沒演過的話 12/9 會先演它）*/
    check('3-1 12/9（四）進麵店：「（期末前最後一次在麵店。大家都帶了講義，沒有人翻開。）」',has('（期末前最後一次在麵店。大家都帶了講義，沒有人翻開。）'),J(all()));
  });
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})();
