// AA_595 四條新規則（D127；企劃線 320760260「AA 處理決定」；任務 AA595-LIB-NOD-THERMOS-1102）——不需要瀏覽器。
//   1  圖書館讀書區「小聲講」（src/libquiet3d.js）：讀書區今天第一次遇到＝按說話只播點頭（不說話）；第二次起所有人的台詞前面加「（小聲）」（旁白、整句動作、已經小聲的不加）；
//      讀書區以外（校園、總圖一樓大廳、法圖影印室、B1 門廳、館外的 2D 背景）不點頭、不加；換一天重新點頭；事件 loud:true 整場不加；事件自己開口的人也記成見過
//   2  src 全部沒有「臺北的家」「回臺北的家」（字卡、地點、提示「回家」）；以安 A-L10「寒假你會回家住嗎？」；祐廷自己的地點不再寫「回臺北」（AA_595 第 4 節列的那幾處）
//   3  學姊不說「你們系」（sis_y2y3_events.js「系上的交換名單」、ladder 的「系上的交換」）
//   4  空的保溫瓶那條線：ev_sis_empty_flask、ev_sis_flask_full retired（原本的時段不演）；熱水沒有 HELPED 那一句；心願 D15 沒有「妳的保溫瓶今天是滿的。」；旁白不寫「空的」
//   6  畢業那天的新保溫瓶（AA 2026-11-02 20:26 定稿）：照留；「裡面是熱水。」（不是咖啡拿掉）、THERMOS.helped（黑咖啡）拿掉
//   5  舊存檔：沒有 G.libNod、libNod 壞掉、存著空保溫瓶的旗標與記憶（flaskCoffeeDay、HELPED、done）——不丟例外、照常
// 修改前（int/m590 0e11c43a3）：第 1 項沒有 LIBQ、第 2～4 項 FAIL。用法：node tests/aa595_rules_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
/* index.html 的順序載入其餘的檔（同 tests/aa590_sis_b3_unit.js）*/
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
check('0. index.html 載入 src/libquiet3d.js（在 game3d.js 前面）',ORDER.includes('src/libquiet3d.js')&&ORDER.indexOf('src/libquiet3d.js')<ORDER.indexOf('src/game3d.js'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ /* 和這一批無關的檔載不進來就跳過 */ } }
GM.toast=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{};
check('0. LIBQ 載得進來',typeof LIBQ!=='undefined'&&typeof LIBQ.gate==='function'&&typeof LIBQ.whisper==='function');
/* game3d.js 的 say、caption：說出口以前先過 LIBQ.whisper（同一行程式碼，這裡照抄到假的 GM 上）*/
const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
check('0. game3d.js 的 say、caption 過 LIBQ.whisper；doInteract 說話前問 LIBQ.gate（之後走 GM.guardTalk＝BUG-TALK-STUCK-1104 的保護，裡面照舊 it.onInteract(it)）',/function say\(who,text,opts\)\{[^\n]*LIBQ\.whisper\(GM,who,text\)/.test(g3)&&/function caption\(who,text,ms\)\{[^\n]*LIBQ\.whisper\(GM,who,text\)/.test(g3)&&/if\(it\.onInteract\)\{[^\n]*LIBQ\.gate\(GM,it\.npc\)\) return;[^\n]*(it\.onInteract\(it\)|GM\.guardTalk\(it\))/.test(g3));
const say0=GM.say; GM.say=async(who,t,o)=>say0(who,LIBQ.whisper(GM,who,t),o);
const caps=[]; GM.caption=(who,t)=>{ caps.push(who?LIBQ.whisper(GM,who,t):t); };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const P=H.E.player; const at=(zone,lv,x,z)=>{ H.G.zone=zone; P.lv=lv|0; P.obj.position.x=x||0; P.obj.position.z=z||0; };
const npc=id=>({id,charId:id,name:SOCIAL.displayName(id),obj:{position:{x:1,y:0,z:1},rotation:{y:0}},pose:'read',idlePose:'read'});
const spoken=()=>H.said.filter(s=>s.who);
const PRE='（小聲）';
const allQuiet=()=>spoken().every(s=>s.t.startsWith(PRE)||!LIBQ.needsPrefix(s.t));

(async()=>{
await sec('1',async()=>{
  const ID='classmate_bohan';
  H.fresh('2025-10-07',15,'library_hall'); STORY._bindGM(GM); H.FAMILIAR(ID); at('library_hall',1,0,0); LIBQ.reset();
  check('1. 總圖二樓自習區（library_hall lv1）是讀書區；一樓大廳（lv0）不是',LIBQ.quietNow(GM)===true&&(at('library_hall',0,0,0),LIBQ.quietNow(GM)===false));
  at('library_hall',1,0,0); const n=npc(ID); H.said=[];
  const g1=await LIBQ.gate(GM,n);
  check('1. 讀書區今天第一次遇到：按說話只點頭（一句旁白，他／她照性別），不說話',g1===true&&H.said.length===1&&H.said[0].who===null&&H.said[0].t===LIBQ.NOD.m,J(H.said));
  check('1. 記在存檔 G.libNod（今天、這個人）',!!H.G.libNod&&H.G.libNod.day===H.G.day&&H.G.libNod.ids[ID]===1,J(H.G.libNod));
  H.said=[]; const g2=await LIBQ.gate(GM,n); await STORY.talkCharacter(ID,n);
  check('1. 第二次：不再點頭，照常說話',g2===false&&spoken().length>0&&!H.said.some(s=>s.t===LIBQ.NOD.m),J(H.lines()));
  check('1. 第二次起說出口的每一句前面有「（小聲）」（只有動作的不加）',spoken().some(s=>s.t.startsWith(PRE))&&allQuiet(),J(H.lines()));
  /* 女生：她 */
  H.said=[]; const g3=await LIBQ.gate(GM,npc('heroine_05')); check('1. 女生的點頭用「她」',g3===true&&H.said[0].t===LIBQ.NOD.f,J(H.said));
  /* 換一天：重新點頭 */
  H.G.day++; H.said=[]; check('1. 換一天：再點頭一次',await LIBQ.gate(GM,n)===true&&H.said.length===1);
  /* 讀書區以外 */
  at('campus',0,0,0); H.said=[]; const gc=await LIBQ.gate(GM,npc('classmate_peishan')); await STORY.talkCharacter(ID,n);
  check('1. 校園：不點頭、沒有「（小聲）」',gc===false&&spoken().length>0&&!spoken().some(s=>s.t.startsWith(PRE)),J(H.lines()));
  check('1. whisper 本身：校園原樣、讀書區加前綴；旁白、手機、整句動作、已經小聲的不加',
    LIBQ.whisper(GM,{name:'許柏翰'},'早。')==='早。'&&(at('library',0,0,0),LIBQ.whisper(GM,{name:'許柏翰'},'早。')===PRE+'早。')&&LIBQ.whisper(GM,null,'（他翻了一頁。）')==='（他翻了一頁。）'
    &&LIBQ.whisper(GM,{name:'許柏翰（手機）'},'早。')==='早。'&&LIBQ.whisper(GM,{name:'許柏翰'},'（他抬頭看了你一眼）')==='（他抬頭看了你一眼）'&&LIBQ.whisper(GM,{name:'以安'},'（她小聲）外面說。')==='（她小聲）外面說。'
    &&LIBQ.whisper(GM,{name:'以安'},PRE+'報告我寫完了。')===PRE+'報告我寫完了。'&&LIBQ.whisper(GM,{name:'學姊'},'（抬頭）喔，hi。')==='（抬頭，小聲）喔，hi。');   /* 開頭有動作括號的合成一個（AA 2026-11-02 20:54 第 4 點；tests/libq_aa_1102_unit.js 第 4 節）*/
  caps.length=0; GM.caption('以安','明天見。'); GM.caption('','（閉館的音樂響了。）'); check('1. 讀書區有名字的 caption 也小聲，沒名字的不加',caps[0]===PRE+'明天見。'&&caps[1]==='（閉館的音樂響了。）',J(caps));
  /* 各圖書館的範圍 */
  const L=LAWLIB_LAYOUT, cp=L.rooms.find(r=>r.id==='copy'), dA=L.rooms.find(r=>r.id==='discA'), T1=L.tables.find(t=>t.lv===0);
  const B=LIBRARY_B1_LAYOUT.rooms, s24=B.find(r=>r.id==='study24'), lob=B.find(r=>r.id==='lobby'), d1=B.find(r=>r.id==='disc1'), co=B.find(r=>r.id==='copy');
  const mid=r=>[(r.x0+r.x1)/2,(r.z0+r.z1)/2];
  const r={lawTable:LIBQ.studyAt('lawlib',0,T1.x,T1.z),law2F:LIBQ.studyAt('lawlib',1,0,0),lawCopy:LIBQ.studyAt('lawlib',0,(cp.x0+cp.x1)/2,-6.4),lawDisc:LIBQ.studyAt('lawlib',0,(dA.x0+dA.x1)/2,-6.4),lawCounter:LIBQ.studyAt('lawlib',0,L.counter.it.x,L.counter.it.z),
    b1Study:LIBQ.studyAt('library_b1',0,...mid(s24)),b1Disc:LIBQ.studyAt('library_b1',0,...mid(d1)),b1Lobby:LIBQ.studyAt('library_b1',0,...mid(lob)),b1Copy:LIBQ.studyAt('library_b1',0,...mid(co)),
    lib3F:LIBQ.studyAt('library',0,0,0),soclib:LIBQ.studyAt('soclib',0,0,0),stacks:LIBQ.studyAt('library_stacks',0,0,0),carrels:LIBQ.studyAt('library_carrels',0,0,0),usStacks:LIBQ.studyAt('us_lawlib_2f',0,0,0),usAtrium:LIBQ.studyAt('us_lawlib',0,0,0),media:LIBQ.studyAt('library_media',0,0,0),cafe:LIBQ.studyAt('cafe',0,0,0)};
  check('1. 讀書區：法圖自習桌、法圖二樓、法圖討論室、B1 自習室、B1 討論室、總圖 3F、社科圖、書庫、研究小間、美國法圖 2F；不算：法圖影印室、櫃台、B1 門廳、B1 影印中心、美國法圖一樓中庭、多媒體中心、Café',
    r.lawTable&&r.law2F&&r.lawDisc&&r.b1Study&&r.b1Disc&&r.lib3F&&r.soclib&&r.stacks&&r.carrels&&r.usStacks&&!r.lawCopy&&!r.lawCounter&&!r.b1Lobby&&!r.b1Copy&&!r.usAtrium&&!r.media&&!r.cafe,J(r));
  /* 2D 場景照背景 */
  at('library',0,0,0); ADV.active=true; ADV.bgMode={image:'assets/bg/library_gate_day.webp'}; const gate=LIBQ.quietNow(GM); ADV.bgMode={image:'assets/bg/law_library.webp'}; const inLib=LIBQ.quietNow(GM);
  at('campus',0,0,0); const inLib2=LIBQ.quietNow(GM); ADV.bgMode='blur'; const blur=LIBQ.quietNow(GM); ADV.active=false; ADV.bgMode=null;
  check('1. 2D 背景：總圖門口不加（人在總圖也一樣）、法圖二樓的背景加（人不在圖書館也一樣）；3D 模糊背景照所在區域',gate===false&&inLib===true&&inLib2===true&&blur===false,J([gate,inLib,inLib2,blur]));
  /* 事件：一般事件在讀書區小聲、loud:true 整場不加；事件裡開口的人記成見過 */
  H.fresh('2025-10-07',15,'library'); at('library',0,0,0); LIBQ.reset();
  const T={id:'t_aa595',title:'測試',participants:['heroine_01'],location:'library',trigger:'auto',dialogue:[{speaker:'heroine_01',text:'這裡有位子。'},{speaker:'player',text:'謝謝。'},{speaker:null,text:'（她把包拿起來。）'}]};
  H.said=[]; await EVENTS.run(T); const a=H.lines();
  check('1. 讀書區的事件：說話的人（含祐廷）加「（小聲）」，旁白不加；事件裡開口的以安記成今天見過（之後按說話不再點頭）',a.some(t=>t.endsWith(PRE+'這裡有位子。'))&&a.some(t=>t.endsWith(PRE+'謝謝。'))&&a.includes('（她把包拿起來。）')&&LIBQ.seen(H.G,'heroine_01'),J(a));
  H.said=[]; await EVENTS.run(Object.assign({},T,{id:'t_aa595_loud',loud:true})); const b=H.lines();
  check('1. 事件寫 loud:true：整場不加',b.some(t=>t.endsWith('：這裡有位子。'))&&!b.some(t=>t.includes(PRE)),J(b));
  check('1. 跟著你走的人、櫃台後面的店員不點頭',await LIBQ.gate(GM,Object.assign(npc('heroine_03'),{beh:'follow'}))===false&&await LIBQ.gate(GM,Object.assign(npc('heroine_02'),{staff:'cafe'}))===false);
});

await sec('2',async()=>{
  const SRC=[]; const walk=d=>{ for(const f of fs.readdirSync(path.join(H.ROOT,d))){ const p=path.join(d,f); if(fs.statSync(path.join(H.ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)) SRC.push(p); } }; walk('src');
  const hit=[]; for(const p of SRC){ const s=fs.readFileSync(path.join(H.ROOT,p),'utf8'); for(const w of ['臺北的家','台北的家']) if(s.includes(w)) hit.push(p+'：'+w); }
  check('2. src 全部沒有「臺北的家」「台北的家」（含「回臺北的家」「搬回臺北的家」「收拾背包回臺北的家」）',hit.length===0,J(hit));
  const all=SRC.map(p=>fs.readFileSync(path.join(H.ROOT,p),'utf8')).join('\n');
  check('2. 手機「地點」、校門口、宿舍房間：「回家」「收拾背包回家」',/<span>回家<\/span>/.test(all)&&/label:'回家',home:true/.test(all)&&/label:'收拾背包回家',home:true/.test(all));
  // CANON-NO-ECON-1112：經濟系那一年拿掉（字卡「搬回家」是經濟系休學退宿那一場）
  check('2. AA_595 第 4 節的旁白：「你回家，帶了一袋要洗的衣服」「車開回家。你的房間」；字卡「回家」「搬回家」；提示「手機「地點」→ 回家」',
    all.includes('（車開回家。你的房間，媽媽又打掃過了。）')&&/titleCard\('回家'/.test(all)&&all.includes('手機「地點」→ 回家（或走到校門口）'));
  const A=LADDER.characters.heroine_01.steps.find(s=>s.id==='A-L10');
  check('2. 以安 A-L10：「寒假你會回家住嗎？」（ladder.js 由 import_ladder.py 疊 AA_595）',!!A&&A.lines[0]==='寒假你會回家住嗎？'&&LADDER.source.includes('AA_595@'),J(A&&A.lines));
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=(allow.files||allow.entries||allow.allow||[]).find(x=>/AA_595_/.test(x.path||''))||JSON.stringify(allow).includes('AA_595_');
  check('2. 白名單有 AA_595（task AA595-LIB-NOD-THERMOS-1102，approved）',!!e&&JSON.stringify(allow).includes('AA595-LIB-NOD-THERMOS-1102'));
});

await sec('3',async()=>{
  const s=fs.readFileSync(path.join(H.ROOT,'src/data/sis_y2y3_events.js'),'utf8');
  const sisLines=[]; for(const e of STORY_EVENTS) for(const l of e.dialogue||[]) if(l&&l.speaker==='heroine_05'&&typeof l.text==='string') sisLines.push(l.text);
  const walkL=(o)=>{ if(!o||typeof o!=='object') return; if(Array.isArray(o)) return o.forEach(walkL); for(const k in o){ const v=o[k]; if(typeof v==='string'&&/你們系/.test(v)) sisLines.push(v); else walkL(v); } };
  for(const T in LADDER.byTerm) walkL(LADDER.byTerm[T].heroine_05);
  check('3. 學姊不說「你們系」：「系上的交換名單，美國那間我查過了。」；事件、階梯裡她的台詞都沒有「你們系」',s.includes("text:'系上的交換名單，美國那間我查過了。跟我同一個學期。'")&&!s.includes('你們系的交換名單')&&!sisLines.some(t=>/你們系/.test(t)),J(sisLines.filter(t=>/你們系/.test(t))));
});

await sec('4',async()=>{
  const ef=ev('ev_sis_empty_flask'), ff=ev('ev_sis_flask_full');
  check('4. 空的保溫瓶（AA_590）、已裝滿（AA_595）：定義還在，retired',!!ef&&!!ff&&!!ef.retired&&/AA_595/.test(String(ff.retired)),J([ef&&ef.retired,ff&&ff.retired]));
  H.fresh('2025-10-21',15,'lawlib'); H.FAMILIAR('heroine_05'); H.G.flags.flaskCoffeeDay=H.G.day-1; H.G.events.done.ev_sis_empty_flask=1;
  check('4. 原本會演的時候也不演（空的保溫瓶的週次時段、喝過黑咖啡的隔天）',EVENTS.check(ef)===false&&EVENTS.check(ff)===false);
  const HW=ev('ev_sis_hot_water'); SOCIAL.remember('heroine_05','HELPED','空的保溫瓶，買了黑咖啡');
  H.said=[]; H.picks=[0]; await EVENTS.run(HW); const L=H.said.map(s=>s.t);
  check('4. 熱水：開場「手上拿著保溫瓶」（不寫空的）；HELPED 的舊存檔也沒有「又遇到你了。」「上次是黑咖啡」',L[0]&&L[0].includes('手上拿著保溫瓶，沒有按。')&&!L.some(t=>/又遇到你了|上次是黑咖啡/.test(t))&&L.some(t=>t.includes('謝謝。明天八點，一樣的位子？')),J(L));
  const W=JSON.stringify(DATE_WISH);
  check('4. 心願約會 D15：沒有「妳的保溫瓶今天是滿的。」（也沒有記憶「W4 空的保溫瓶」）',!W.includes('妳的保溫瓶今天是滿的')&&!W.includes('W4 空的保溫瓶'));
  const files=['src/data/sis_b8_events.js','src/data/sis_b15_events.js','src/data/feed_y1s1.js'].map(f=>fs.readFileSync(path.join(H.ROOT,f),'utf8')).join('\n');
  check('4. 旁白、動態照片說明、事件標題不寫「空的保溫瓶」「保溫瓶…空的」「裡面是空的」（已停用的 W8 照留）',!/空的保溫瓶|保溫瓶[^。）']{0,8}空的|裡面是空的/.test(files)&&files.includes("title:'裝熱水'")&&files.includes('（她趴在桌上。保溫瓶倒在旁邊。）'));
  const live=STORY_EVENTS.filter(e=>!e.retired&&e.id!=='ev_sis_collapse'); const bad=[]; for(const e of live) for(const l of e.dialogue||[]) if(l&&typeof l.text==='string'&&/空的保溫瓶|保溫瓶是空的|保溫瓶[^。）]{0,6}，空的/.test(l.text)) bad.push(e.id+'：'+l.text);
  check('4. 還會演的事件沒有「看得出保溫瓶是空的」的句子',bad.length===0,J(bad));
});

await sec('5',async()=>{
  /* 舊存檔：沒有 libNod、libNod 壞掉；空保溫瓶的旗標與記憶都在 */
  H.fresh('2025-10-21',15,'library_hall'); at('library_hall',1,0,0); LIBQ.reset(); delete H.G.libNod;
  const old=JSON.parse(JSON.stringify(H.G)); old.flags.flaskCoffeeDay=10; old.events.done.ev_sis_empty_flask=1; old.events.done.ev_sis_flask_full=1;
  check('5. 舊存檔沒有 G.libNod：今天誰都還沒見過（rec 補預設值）',LIBQ.seen(H.G,'heroine_01')===false&&H.G.libNod&&H.G.libNod.day===H.G.day&&J(H.G.libNod.ids)==='{}');
  H.G.libNod='壞掉'; let threw=null; try{ await LIBQ.gate(GM,npc('heroine_01')); }catch(e){ threw=String(e); }
  check('5. libNod 壞掉（不是物件）：重設、不丟例外',threw===null&&typeof H.G.libNod==='object'&&H.G.libNod.ids.heroine_01===1,threw||J(H.G.libNod));
  H.G.libNod={day:H.G.day-3,ids:{heroine_01:1}}; check('5. 前幾天的紀錄：今天重新算',LIBQ.seen(H.G,'heroine_01')===false);
  const rt=JSON.parse(JSON.stringify(H.G)); check('5. 存檔來回（JSON）libNod 照留',J(rt.libNod)===J(H.G.libNod));
  H.G=old; SOCIAL.bind(H.G); EVENTS.bind(GM); SOCIAL.remember('heroine_05','HELPED','空的保溫瓶，買了黑咖啡'); SOCIAL.remember('heroine_05','NOTICED_HER','空的保溫瓶');
  threw=null; let r=null; try{ r=[EVENTS.check(ev('ev_sis_flask_full')),EVENTS.check(ev('ev_sis_empty_flask'))]; SOCIAL.noteShown('heroine_05',{tag:'HELPED',note:'空的保溫瓶，買了黑咖啡'}); STORY.talkCharacter; }catch(e){ threw=String(e&&e.stack||e); }
  check('5. 舊存檔（存著 flaskCoffeeDay、演過兩場、HELPED／NOTICED_HER 記憶）：檢查事件、人物面板都不丟例外，兩場都不再演',threw===null&&J(r)===J([false,false]),threw||J(r));
  H.said=[]; const n=npc('classmate_bohan'); H.FAMILIAR('classmate_bohan'); STORY._bindGM(GM); threw=null; try{ await LIBQ.gate(GM,n); await STORY.talkCharacter('classmate_bohan',n); }catch(e){ threw=String(e&&e.stack||e); }
  check('5. 舊存檔在總圖二樓找人說話：點頭、說話照常',threw===null&&H.said[0]&&H.said[0].t===LIBQ.NOD.m&&spoken().length>0&&allQuiet(),threw||J(H.lines()));
});

await sec('6',async()=>{
  /* AA 2026-11-02 20:26 定稿：畢業那天學姊遞的新保溫瓶留著（PG.thermos、SIS_THERMOS、epiThermos）；只改 (a)「裡面是熱水。不是咖啡。」→「裡面是熱水。」、(b) THERMOS.helped（黑咖啡）拿掉 */
  const T=POSTGRAD_LINES.THERMOS;
  check('6. (a) 新保溫瓶那一段還在：「（她還穿著碩士服，手上拿著一個新的保溫瓶。）」「（把保溫瓶遞給他）裡面是熱水。」「每天帶出門。」；沒有「不是咖啡」',J(T.lines).includes('手上拿著一個新的保溫瓶')&&T.lines.some(x=>x[1]==='（把保溫瓶遞給他）裡面是熱水。')&&T.lines.some(x=>x[1]==='每天帶出門。')&&!J(T.lines).includes('不是咖啡'),J(T.lines));
  check('6. (b) THERMOS.helped 拿掉；postgrad3d.js 不再叫 helpedCoffee',!('helped' in T)&&!/helpedCoffee|W\.helped/.test(fs.readFileSync(path.join(H.ROOT,'src/postgrad3d.js'),'utf8'))&&typeof PG.helpedCoffee==='undefined');
  const run=async(fl,mem)=>{ H.fresh('2029-06-02',12,'campus',fl); if(mem) SOCIAL.remember('heroine_05',mem[0],mem[1]); H.said=[]; H.opts=[]; H.picks=[]; await PG.thermos(GM); return H.said.map(s=>s.t); };
  const a=await run({},['HELPED','空的保溫瓶，買了黑咖啡']);
  check('6. 舊存檔（空保溫瓶選黑咖啡 HELPED）：新保溫瓶照演、遞保溫瓶「裡面是熱水。」，沒有黑咖啡那一句；記 SIS_THERMOS（尾聲 epiThermos 用）',a.includes('恭喜畢業。')&&a.some(t=>t.endsWith('裡面是熱水。'))&&!a.some(t=>/黑咖啡|不是咖啡/.test(t))&&H.G.flags.SIS_THERMOS===true,J(a));
  const b=await run({HOT_WATER:true});
  check('6. 陪她等過熱水（HOT_WATER）：多一句「大一那年冬天，你陪我等熱水。我記到現在。」',b.includes(T.hotWater)&&!b.some(t=>/黑咖啡/.test(t)),J(b));
  const D=typeof SISB16_LINES!=='undefined'?SISB16_LINES:null;
  check('6. 尾聲學姊的保溫瓶（EPI_PARTNER.heroine_05.thermos）照留',!!(POSTGRAD_LINES.EPI_PARTNER&&POSTGRAD_LINES.EPI_PARTNER.heroine_05&&POSTGRAD_LINES.EPI_PARTNER.heroine_05.thermos));
});

H.done();
})();
