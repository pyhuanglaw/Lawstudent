// 林芷若 × 高子晴：從摯友到戀人（條件式 NPC 感情線；企劃線 AA_232 088556ed、BB_194 §23、AA_243 第 2 節甲；src/data/zrzq_events.js、src/zrzq3d.js）——不需要瀏覽器。
//   （AA_385 改的七題另外在 tests/aa385_zz_unit.js；這裡跟著改：稿換 088556ed、4-6 第 1 則改公館宵夜、日本路線婉拒改回國以後在 Café 當面說）
//   0 接線（index.html、TICKS、PHONE_RULES、事件都在、src 沒有「小語」）　1 讀稿逐字對照（台詞每一句都在稿裡；稿上的對話每一句都有接）　2 三場的日期與時間（每學期同一週、同一個星期幾、同一個時間）
//   3 自動播放（4-2：不管人在哪裡都帶到 Café 門口、入場旁白照位置、21:50）　4 順序（前一場沒播，後一場不播）、播過不重播
//   5 4-3 朋友版／一般版、{課名}　6 4-4 A／B、甲（那學期在追其中一人＝只有 4-4 順延）　7 條件不成立＝順延到下學期同週同星期同時間（交往中、分手那學期、路線 B）
//   8 她們畢業以後的版本（地點、入場旁白一起換）　9 祐廷在國外（交換）：世界照樣發生、沒有畫面；芷若在英國的學期跳過
//   10 狀態推進到 dating、4-4「先這樣」（大二下）、交換回來以後的 4-4　11 4-7 祐廷得知只在 dating 以後（兩版、聽過 4-4 的第一句、畢業典禮那天）
//   12 4-2b 四種狀態（F3 那一晚；6/21 小公園版）　13 F3 婉拒（Café 那四句、日本路線回國以後當面說、方奕廷三則〔日本路線：當面說完那天才送〕；r2y3b 的「我說好」不演）
//   14 互斥（她們交往中＝她有交往的對象；曖昧期照常）　15 舊存檔　16 結局（尾聲那一行）　17 4-5、4-6　18 手機子晴「芷若在英國」三則的標籤（AA_385 第 9 節）、在家、跳過時間的停點
// 修改前（開發分支 b857600c）：ZRZQ 不存在，除了「稿上有」以外全部 FAIL。用法：node tests/zrzq_line_unit.js
require('./alison.js');   // 讀企劃稿（git show）照匯入工具同一套換：Alison、虛構校名（WORLD-RENAME-1030，docs/WORLD_NAMING.md）
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.P3={CAST:{}};
global.document={ getElementById:()=>null, addEventListener(){} }; global.navigator={userAgent:'node'}; global.addEventListener=()=>{}; global.location={search:''};
const NAMES=/^(ROM|CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|STORY_EVENTS|STORY_EVENTS_V11|SMALLTALK|SOCIAL|EVENTS|STORY|CALENDAR|PLACES|INVITE_DATA|INV|PHONE|COURSES|CLS|ACTIVITIES|REL_LINES|OUT|LADDER|HOME|HOME_LINES|CG_REGISTRY|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|HV|DATE|CONFESS_LINES|TERMEND|TERMEND_LINES|DATE_LOCATIONS|DATE_LINES|VAC|VAC_DATA|R2Y3B|R2Y3B_EVENTS|POSTGRAD_LINES|PG|SYLLABUS|ZRZQ|ZRZQ_LINES|ZRZQ_EVENTS|ZRZQ_TOLINES|ZRZQ_FILM)$/;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.THREE={Vector3:class{ constructor(x,y,z){ this.x=x||0; this.y=y||0; this.z=z||0; } }};
global.CG_REGISTRY={};
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js','src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js','src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/classes3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/data/postgrad_lines.js','src/postgrad3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/zrzq_events.js','src/zrzq3d.js']) if(fs.existsSync(path.join(ROOT,f))) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const chk=async(name,fn)=>{ let r; try{ r=await fn(); }catch(e){ return check(name,false,'例外：'+(e&&e.message||e)); } if(Array.isArray(r)) check(name,!!r[0],r[1]); else check(name,!!r); };
let said=[], opts=[], picks=[], G=null, entered=[], caps=[];
global.ADV={active:false,preload(){},begin(){ this.active=true; },end(){ this.active=false; },log(){},speaker(){},cg(){ return true; },setBg(){},hide(){}}; global.CHAR={setExpr(){}};
global.LEGAL={ask:async()=>{},apply(){},stateOf:()=>'unseen',STATES:['unseen']};
const E={q:{level:'medium'},player:{busy:false,obj:{position:{x:0,y:0,z:0},rotation:{y:0}},lv:0},zone:{roomAt:()=>null,seats:[],spots:{}},npcs:[],interactables:[],levels:null,setWeather(){},hour:0};
const GM={get G(){ return G; },E,D:{active:false},npc:{},
  sceneBegin(){},sceneEnd(){},face(){},cine(){},caption:(a,b)=>{ caps.push(b); },sleep:()=>Promise.resolve(),memo(){},autosave(){},addNote(){},energy(){},setGoal(){},toast(){},updateHUD(){},letterbox(){},phoneBadge(){},
  titleCard:async()=>{},enter:async(z,sp)=>{ entered.push([z,sp]); G.zone=z; },advance(h){ G.hour+=h; },fade:()=>Promise.resolve(),rel(){},walkTo:()=>Promise.resolve(true),sitAt(){},standUp(){},money(n){ G.money+=n; },syncWeekday(){},
  say:async(who,t)=>{ said.push({who:who?(who.name||String(who)):null,t:String(t)}); },choose:async o=>{ opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='string'){ const k=o.findIndex(q=>(q.t||q.text).includes(want)); return k<0?0:k; } return want||0; }};
const D=k=>STORY.dayOfKey(k), K=d=>CALENDAR.dateOf(d).key, J=x=>JSON.stringify(x);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const fresh=(key,hour,zone,flags)=>{ const day=D(key); G={v:3,day,hour,zone,stage:'law',weekday:wdOf(day),weather:'clear',energy:70,money:5000,flags:Object.assign({KX_FIRST_MSG:true,fundsV2:1,allowanceMonth:CALENDAR.dateOf(day).m,introDone:true,afternoonDone:true,classDone:true,metAn:true,ROOM_Y2:300,ROOM_Y3:600},flags||{}),choices:{},events:{done:{},last:{},count:0},name:'祐廷',rel:{},social:null,stats:{classes:0},contacts:{},msgs:[],courses:{}};
  SOCIAL.bind(G); EVENTS.bind(GM); INV.rec(G); ROM.rec(G); said=[]; opts=[]; picks=[]; entered=[]; caps=[]; GM.npc={}; E.npcs=[]; E.player.busy=false; ADV.active=false; return G; };
const LV={ACQ:[10,0,0],FAM:[25,10,10],FRI:[45,30,10],CLO:[65,50,45]};
const R=(id,lv)=>{ const r=SOCIAL.rel(id); const [f,t,c]=LV[lv||'FAM']; r.fam=f; r.trust=t; r.comf=c; SOCIAL.remember(id,'FIRST_MET',''); };
const both=lv=>{ R('heroine_02',lv); R('heroine_04',lv); };
const at=(key,h)=>{ G.day=D(key); G.hour=h; G.weekday=wdOf(G.day); };
const zz=o=>{ const Z=ZRZQ.rec(G); Object.assign(Z,o||{}); G.flags.ZZ_STATE=Z.state; return Z; };
const tick=async()=>{ said=[]; opts=[]; entered=[]; STORY.phoneRules(GM); PHONE.tick(G); const r=ZRZQ.tick(GM); if(r) await ZRZQ._p; return r; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(G); };
const txt=()=>said.map(s=>s.t), has=t=>said.some(s=>s.t===t);
const exp=arr=>ZRZQ_TOLINES(arr).map(l=>l.text.replace(/\{name\}/g,'祐廷'));
const seq=arr=>{ const want=exp(arr), got=txt(); for(let i=0;i+want.length<=got.length;i++) if(want.every((w,k)=>got[i+k]===w)) return true; return false; };   /* 一整段照順序連著出現 */
const L=typeof ZRZQ_LINES!=='undefined'?ZRZQ_LINES:null;
/* 稿：企劃線 AA_232（088556ed＝AA_385 跟著改的版本；沒有這個 commit 就用 origin/claude/story-planning）、BB_194 */
const show=(refs,p)=>{ for(const r of refs){ try{ return cp.execSync('git show "'+r+':'+p+'"',{cwd:ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:1<<26}); }catch(e){} } return null; };
const SPEC=show(['088556ed','origin/claude/story-planning'],'docs/story_planning/AA_232_芷若子晴_摯友到戀人_核對與台詞.md');
const BB=show(['a90e8569','origin/claude/story-planning'],'docs/story_planning/BB_194_多線交往_知情_說謊承諾_挽回_機制總表.md');
const ZR='heroine_02', ZQ='heroine_04';

(async()=>{
  /* ===================== 0 接線 ===================== */
  await chk('0. ZRZQ、ZRZQ_LINES、事件都在；STORY.TICKS、PHONE_RULES 掛上去了；index.html：r2y3b3d.js → data/zrzq_events.js → zrzq3d.js → GAME.boot()',()=>{
    const h=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'), a=h.indexOf('src/r2y3b3d.js'), b=h.indexOf('src/data/zrzq_events.js'), c=h.indexOf('src/zrzq3d.js'), z=h.indexOf('GAME.boot()');
    const ids=['ev_zz_home_together','ev_zz_next_time','ev_zz_serious','ev_zz_serious_again','ev_zz_zq_mind','ev_zz_yt_learns','ev_zz_f3_told','ev_zz_daily_1','ev_zz_uk_1'];
    return [typeof ZRZQ!=='undefined'&&!!L&&ids.every(id=>STORY_EVENTS.some(e=>e.id===id))&&a>0&&b>a&&c>b&&z>c,[a,b,c,z].join(',')]; });
  await chk('0. 新檔沒有「小語」（Alison 改名，AA_380）、顯示的台詞沒有真實導演「小津」（AA_312 第 12 列：換成《秋天的晚飯》）',()=>{
    const src=['src/data/zrzq_events.js','src/zrzq3d.js'].map(f=>fs.existsSync(path.join(ROOT,f))?fs.readFileSync(path.join(ROOT,f),'utf8'):'').join('');
    const shown=ZRZQ_EVENTS.flatMap(e=>(e.dialogue||[]).map(l=>l.text||'')).concat(ZRZQ_TOLINES(L.F3_TOLD_JP).map(l=>l.text),ZRZQ_TOLINES(L.MIND.first).map(l=>l.text));
    return [src.length>0&&!/小語/.test(src)&&!shown.some(t=>/小津/.test(t))&&shown.some(t=>/《秋天的晚飯》/.test(t)),''];
  });

  /* ===================== 1 讀稿逐字 ===================== */
  await chk('1. 稿讀得到（AA_232 088556ed、BB_194）',()=>[!!SPEC&&!!BB&&/林芷若 × 高子晴/.test(SPEC),'']);
  const WHO={zr:'芷若',zq:'子晴',yt:'祐廷'};
  const flat=()=>{ const out=[]; const add=(arr,tag)=>{ for(const [w,t] of arr) out.push({w,t,tag}); };
    add(L.HOME,'4-2'); for(const k of ['first','mutual','dating']) add(L.MIND[k],'4-2b'); add(L.NEXT_FRIEND,'4-3'); add(L.NEXT,'4-3'); add(L.NEXT_END.plain,'4-3'); add(L.NEXT_END.friend,'4-3');
    for(const k of ['A','B','END','HELD','AGAIN','AGAIN_A']) add(L.SERIOUS[k],'4-4'); L.DAILY.forEach(d=>add(d,'4-5')); L.UK.forEach(d=>add(d,'4-6'));
    add(L.LEARN.hurt,'4-7'); add(L.LEARN.friend,'4-7'); add(L.F3_TOLD,'三');   /* 七-6 的訊息版 AA_385 第 7 項拿掉了；日本路線那一版（F3_TOLD_JP）、ZZ_TOLD_YT（TOLD）、C_FY 只在 AA_385，tests/aa385_zz_unit.js 對稿 */
    for(const k of ['B','C_UK','C']) out.push({w:'n',t:L.END[k],tag:'五'}); return out; };
  await chk('1. 程式裡的每一句都在 AA_232 裡（人物：句子／「句子」／旁白原文；入場旁白、結局那一行、方奕廷三則、內心選項、4-7 第一句的改法也是）',()=>{
    if(!SPEC) return [false,'讀不到稿']; const bad=[];
    for(const x of flat()){ const k=x.w.slice(0,2), lab=WHO[k];
      const ok=lab?(SPEC.includes(lab+'：'+x.t)||SPEC.includes('「'+x.t+'」')):SPEC.includes(x.t); if(!ok) bad.push(x.tag+' '+x.w+' '+x.t); }
    const IN=L.IN; for(const g of ['home','next','serious']) for(const k in IN[g]) if(!SPEC.includes(IN[g][k])) bad.push('入場 '+g+'.'+k);
    if(!SPEC.includes(IN.mindPark)) bad.push('mindPark'); if(!SPEC.includes('「'+IN.mindPass+'」')) bad.push('mindPass');
    for(const k of ['B','C_UK','C']) if(!SPEC.includes(L.END[k])) bad.push('END.'+k);
    for(const t of L.F3_FANG) if(!SPEC.includes('「'+t+'」')) bad.push('F3_FANG '+t);
    for(const [t] of L.SERIOUS.FEEL) if(!SPEC.includes('「'+t+'」')) bad.push('FEEL '+t);
    if(!SPEC.includes('「'+L.LEARN.heard+'」')) bad.push('LEARN.heard');
    return [!bad.length,bad.join('；')]; });
  await chk('1. 4-7 畢業典禮那天的入場旁白照 BB_194 23-3（AA-C 同意）',()=>[!!BB&&BB.includes(L.IN.learnGrad),'']);
  await chk('1. 4-2b 小公園版：只換 AA 寫好的場景字（萬才館→小公園、吉他→手機、台階→長椅、門口→路燈下）',()=>{
    if(!SPEC) return [false,'讀不到稿']; const P=L.MIND.park, pairs=[['「B館一樓……坐在門口的台階上」→「小公園的鞦韆旁邊，子晴坐在長椅上，手機一直亮著。」'],['「把吉他背起來，往溫州街的方向走」→「把手機收進口袋，往巷子裡走」'],['「坐回台階上」→「坐回長椅上」'],
      ['「法律系館B門口」→「小公園門口」'],['「B館門口。子晴在等人。芷若從溫州街那邊走過來。」→「小公園的長椅。子晴在等人。芷若從巷口走過來。」'],['「你在門口站了一下」→「你在路燈下站了一下」']];
    const okSpec=pairs.every(([p])=>SPEC.includes(p));
    const want={'（法律系館B一樓。吉他社的人陸續走了，子晴坐在門口的台階上，手機一直亮著。）':'（小公園的鞦韆旁邊，子晴坐在長椅上，手機一直亮著。）',
      '（她把吉他背起來，往溫州街的方向走。走了一段，又走回來，坐回台階上。）':'（她把手機收進口袋，往巷子裡走。走了一段，又走回來，坐回長椅上。）',
      '（法律系館B門口。子晴在講電話。）':'（小公園門口。子晴在講電話。）','（法律系館B門口。子晴在等人。芷若從溫州街那邊走過來。）':'（小公園的長椅。子晴在等人。芷若從巷口走過來。）',
      '（芷若勾住她的手臂。兩人往公館走。你在門口站了一下，才走另一邊。）':'（芷若勾住她的手臂。兩人往公館走。你在路燈下站了一下，才走另一邊。）'};
    return [okSpec&&J(P)===J(want),okSpec?'':'稿上找不到替換']; });
  await chk('1. 稿上（4-2～七）每一句對話都有接進來（不接的：入場旁白的說明、被第九節取代的兩句開頭、4-6 兩人私下的原版（七-3：「想妳」不在祐廷面前）、4-7 作廢的第三版、七-6 的訊息版（AA_385 第 7 項拿掉））',()=>{
    if(!SPEC) return [false,'讀不到稿']; const lines=SPEC.split('\n'), i0=lines.findIndex(s=>/^### 4-2\./.test(s)), i1=lines.findIndex(s=>/^## 五/.test(s)), i7=lines.findIndex(s=>/^## 七/.test(s)), i8=lines.findIndex(s=>/^## 八/.test(s));
    const i3=lines.findIndex(s=>/^## 三/.test(s)), i4=lines.findIndex(s=>/^## 四/.test(s));
    const pick=(a,b)=>lines.slice(a,b).filter(s=>/^\s*>\s/.test(s)).map(s=>s.replace(/^\s*>\s*/,'').trim().replace(/（20\d\d-\d\d-\d\d `AA_385` 第 \d+ 項：[^）]*）$/,''));   /* 088556ed：AA_385 改過的句子後面附了改字說明（不是台詞）*/
    const ex=['（入場旁白照第九節的表，依祐廷那時在哪裡挑一句。）','（公館。二輪戲院剛散場，你正要過馬路，看到子晴和芷若從門口走出來。）','（你經過映月湖，聽到熟悉的聲音。轉角那邊是子晴和芷若。你停下來，她們沒看到你。）'];
    const iUK=lines.findIndex(s=>/^### 4-6/.test(s)), iUKend=lines.findIndex(s=>/^- AA 補：/.test(s)&&lines.indexOf(s)>iUK), i47=lines.findIndex(s=>/^### 4-7/.test(s)), iVoid=lines.findIndex(s=>/作廢/.test(s)&&lines.indexOf(s)>i47);
    const i76=lines.findIndex(s=>/^6\. ~~\*\*F3 婉拒那四句的國外訊息版/.test(s)), i76end=lines.findIndex((s,k)=>k>i76&&!/^\s*>\s/.test(s));   /* 七-6 訊息版：AA_385 第 7 項拿掉（「下面這四句不用」）*/
    const voided=new Set(pick(iUK,iUKend).concat(lines.slice(iVoid,i1).filter(s=>/^\s*>\s/.test(s)&&lines.indexOf(s)<lines.findIndex((q,k)=>k>iVoid&&/^- 他之後/.test(q))).map(s=>s.replace(/^\s*>\s*/,'').trim()),i76>0?pick(i76+1,i76end):[]));
    const all=pick(i3,i4).concat(pick(i0,i1),pick(i7,i8)).filter(s=>!ex.includes(s)&&!voided.has(s));
    const mine=new Set(flat().map(x=>{ const lab=WHO[x.w.slice(0,2)]; return lab?lab+'：'+x.t:x.t; }));
    const miss=all.filter(s=>!mine.has(s));
    return [all.length>100&&!miss.length,'稿 '+all.length+' 句；沒接：'+miss.join('｜')]; });

  /* ===================== 2 日期與時間 ===================== */
  await chk('2. 三場的日子：大一下 3/11（三）21:30 觸發、21:50 相遇；4/30（四）16:40；6/5（五）14:30；順延表（大二上 9/23、11/12、12/18；大二下 3/10、4/29、6/4；大三下 3/8、4/27、6/2）',()=>{
    const want={Y1S2:['2026-03-11','2026-04-30','2026-06-05'],Y2S1:['2026-09-23','2026-11-12','2026-12-18'],Y2S2:['2027-03-10','2027-04-29','2027-06-04'],Y3S2:['2028-03-08','2028-04-27','2028-06-02']};
    const got={}; for(const t in want) got[t]=['home','next','serious'].map(k=>K(ZRZQ.slotOf(k,t).day));
    const s=ZRZQ.slotOf('home','Y1S2'), n=ZRZQ.slotOf('next','Y1S2'), q=ZRZQ.slotOf('serious','Y1S2');
    return [J(got)===J(want)&&s.h===21.5&&Math.abs(s.meet-(21+50/60))<1e-9&&Math.abs(n.h-(16+40/60))<1e-9&&q.h===14.5,J(got)]; });

  /* ===================== 3 自動播放（4-2）===================== */
  await chk('3. 4-2 自動播放：3/11 21:29 還沒有；21:30 人在總圖＝總圖那一句入場旁白→帶到溫州街 Café 門口→21:50→整段逐字（稿上的「祐廷心想」照原文）',async()=>{
    fresh('2026-03-11',21.45,'library_hall'); both('FAM'); const r0=await tick();
    at('2026-03-11',21.5); const r1=await tick(); const Z=G.flags.ZZ;
    return [!r0&&r1&&said[0]&&said[0].who===null&&said[0].t===L.IN.home.lib&&entered.length===1&&entered[0][0]==='wenzhou'&&Math.abs(G.hour-(21+50/60))<1e-6&&seq(L.HOME)&&Z.state==='feelings_emerging'&&G.flags.YT_SAW_ZZ_1===true&&Z.yt==='hint'&&G.events.done.ev_zz_home_together===1&&Z.ev.ev_zz_home_together.seen===true&&G.flags.ZZ_STATE==='feelings_emerging',J({r0,r1,said:said.slice(0,2),entered,h:G.hour,Z})]; });
  await chk('3. 入場旁白照祐廷那時在哪裡（宿舍、公館或溫州街、Café 店裡、校園其他地方）',async()=>{ const out={};
    for(const [z,k] of [['dorm','dorm'],['gongguan','town'],['cafe','cafe'],['linze','campus']]){ fresh('2026-03-11',21.6,z); both('FAM'); await tick(); out[k]=said[0]&&said[0].t===L.IN.home[k]; }
    return [Object.values(out).every(Boolean),J(out)]; });
  await chk('3. 祐廷在別的事件、對話裡＝等它結束（還在時段內才演）；過了時段（睡著、跳過）＝這學期不演，順延到下一個學期的同一天',async()=>{
    fresh('2026-03-11',21.6,'dorm'); both('FAM'); E.player.busy=true; const a=await tick(); E.player.busy=false; const b=await tick();
    fresh('2026-03-12',8,'dorm'); both('FAM'); const c=await tick(); const st=G.flags.ZZ.state;
    at('2026-09-23',21.5); const d=await tick();
    return [!a&&b&&!c&&st==='friends'&&d&&G.flags.ZZ.state==='feelings_emerging'&&K(G.flags.ZZ.ev.ev_zz_home_together.day)==='2026-09-23',J({a,b,c,st,d})]; });

  /* ===================== 4 順序、不重播 ===================== */
  await chk('4. 前一場沒播，後一場不播：沒有 4-2 的存檔 4/30 16:40 不演 4-3、6/5 14:30 不演 4-4',async()=>{
    fresh('2026-04-30',16.7,'campus'); both('FAM'); zz({since:0}); const a=await tick(); at('2026-06-05',14.6); const b=await tick();
    return [!a&&!b&&G.flags.ZZ.state==='friends'&&!G.events.done.ev_zz_next_time,J({a,b})]; });
  await chk('4. 播過不重播：4-2 演過以後，下一學期 9/23 21:30 不再演',async()=>{
    fresh('2026-03-11',21.5,'dorm'); both('FAM'); await tick(); at('2026-09-23',21.5); const r=await tick();
    return [!r&&G.events.done.ev_zz_home_together===1,'']; });

  /* ===================== 5 4-3 ===================== */
  await chk('5. 4-3：4/30 16:40 帶到公館（二輪戲院在畫面外）；入場旁白的{課名}＝那天實際上的最後一堂課；一般版結尾；推進到 mutual_interest、YT_SAW_ZZ_2',async()=>{
    fresh('2026-04-30',16.7,'linze'); both('FAM'); zz({state:'feelings_emerging',since:0,lastDay:D('2026-03-11')});
    const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='oblig_gen1'); G.courses.done={[it.key]:1}; await tick();
    const want=L.IN.next.cls.replace('{課名}',it.c.name);
    return [said[0].t===want&&entered[0][0]==='gongguan'&&seq(L.NEXT)&&seq(L.NEXT_END.plain)&&!has(exp(L.NEXT_FRIEND)[0])&&G.flags.ZZ.state==='mutual_interest'&&G.flags.YT_SAW_ZZ_2===true,J({intro:said[0],want})]; });
  await chk('5. 4-3：祐廷和兩人都是朋友以上＝朋友版（她們先看到他、短聊、他退開，結尾「你回頭看了一眼」）；沒課＝「你在公館晃了一個下午」',async()=>{
    fresh('2026-04-30',16.7,'campus'); both('FRI'); zz({state:'feelings_emerging',since:0,lastDay:D('2026-03-11')}); await tick();
    return [said[0].t===L.IN.next.none&&seq(L.NEXT_FRIEND)&&seq(L.NEXT)&&seq(L.NEXT_END.friend)&&!has('（你原本正要上前打招呼，卻停下腳步。）')&&has('欸，祐廷。你也來看？'),J(said.slice(0,3))]; });

  /* ===================== 6 4-4、甲 ===================== */
  await chk('6. 4-4：6/5 14:30 帶到映月湖；A（子晴先開口）逐字＋結尾；明確說好在一起以後才 dating；YT_HEARD_ZZ、祐廷知道兩人互相喜歡（mutual）',async()=>{
    fresh('2026-06-05',14.6,'campus'); both('FAM'); zz({state:'mutual_interest',since:D('2026-06-05'),lastDay:D('2026-04-30')}); await tick(); const Z=G.flags.ZZ;
    return [said[0].t===L.IN.serious.campus&&entered[0][0]==='campus'&&seq(L.SERIOUS.A.concat(L.SERIOUS.END))&&Z.state==='dating'&&Z.version==='A'&&G.flags.YT_HEARD_ZZ===true&&Z.yt==='mutual'&&K(Z.datingDay)==='2026-06-05'&&!opts.length,J({Z,opts})]; });
  await chk('6. 4-4：芷若「她自己條件成立」的學期比子晴多＝B（芷若先開口）；上午有課＝「經濟學原理（重修）下課，吃完午餐…」',async()=>{
    fresh('2026-06-05',14.6,'campus'); both('FAM'); zz({state:'mutual_interest',since:0,lastDay:D('2026-04-30'),sem:{Y1S1:{zr:true,zq:false}}});
    const it=CLS.dayItems(G,G.day).find(x=>x.c.id==='econ_principles_2'); G.courses.done={[it.key]:1}; await tick();
    return [said[0].t===L.IN.serious.cls.replace('{課名}','經濟學原理（重修）')&&seq(L.SERIOUS.B.concat(L.SERIOUS.END))&&G.flags.ZZ.version==='B',J(said[0])]; });
  await chk('6. 甲：那學期和芷若有過正式校外約會＝只有 4-4 順延（6/5 不演），下學期同一天 12/18 14:30 演；4-2、4-3 照演',async()=>{
    fresh('2026-03-11',21.5,'dorm'); both('FAM'); G.trips=[{trip:'T0001',who:ZR,locs:['D01'],day:D('2026-03-01'),counted:true,status:'done'}];
    const a=await tick(); at('2026-04-30',16.7); G.zone='campus'; const b=await tick(); at('2026-06-05',14.6); const c=await tick(); const st=G.flags.ZZ.state;
    at('2026-12-18',14.6); const d=await tick();
    return [a&&b&&!c&&st==='mutual_interest'&&d&&G.flags.ZZ.state==='dating'&&K(G.flags.ZZ.datingDay)==='2026-12-18',J({a,b,c,st,d})]; });
  await chk('6. 甲：她到第 4 階以上（好朋友）也算在追＝4-4 順延',async()=>{
    fresh('2026-06-05',14.6,'campus'); R(ZR,'FAM'); R(ZQ,'CLO'); zz({state:'mutual_interest',since:0,lastDay:D('2026-04-30')}); const r=await tick();
    return [DATE.stageNum(ZQ)>=4&&!r&&G.flags.ZZ.state==='mutual_interest','stage '+DATE.stageNum(ZQ)]; });
  await chk('6. 他曾經和其中一人交往過：4-4 結尾多三選一的內心選擇，只記 YT_ZZ_FEEL',async()=>{
    fresh('2026-06-05',14.6,'campus'); both('FAM'); G.flags.EX_heroine_04=true; zz({state:'mutual_interest',since:0,lastDay:D('2026-04-30')}); picks=['複雜']; await tick();
    return [J(opts[0])===J(L.SERIOUS.FEEL.map(x=>x[0]))&&G.flags.YT_ZZ_FEEL==='complex'&&G.flags.ZZ.state==='dating',J(opts)]; });

  /* ===================== 7 順延 ===================== */
  await chk('7. 那天條件不成立（芷若在和祐廷交往）＝不演，下一個條件成立的學期同一週、同一個星期幾、同一個時間（9/23 21:30）',async()=>{
    fresh('2026-03-11',21.5,'dorm',{dating_heroine_02:true}); both('FAM'); ROM.get(G,ZR).status='dating'; const a=await tick();
    at('2026-09-23',21.5); G.flags.dating_heroine_02=false; ROM.get(G,ZR).status='ex'; ROM.get(G,ZR).history.push({ev:'end',day:D('2026-07-10')}); const b=await tick();
    return [!a&&b&&G.flags.ZZ.state==='feelings_emerging',J({a,b})]; });
  await chk('7. 和祐廷分手的那個學期不推進（只和子晴分手：那學期 9/23 不演；下學期 3/10 演）',async()=>{
    fresh('2026-09-23',21.5,'dorm'); both('FAM'); ROM.get(G,ZQ).status='ex'; ROM.get(G,ZQ).history.push({ev:'end',day:D('2026-09-15')}); G.flags.EX_heroine_04=true; const a=await tick();
    at('2027-03-10',21.5); const b=await tick();
    return [!a&&b,J({a,b,why:ZRZQ.cond(G,'home',ZRZQ.slotOf('home','Y2S1'),true)})]; });
  await chk('7. 路線 B（兩人一起和祐廷分手，§22）：分手那學期跳過，之後照週次順延',async()=>{
    fresh('2026-03-11',21.5,'dorm',{ZQ_ZR_ENDED_DAY:D('2026-03-02')}); both('FAM'); for(const id of [ZR,ZQ]){ const r=ROM.get(G,id); r.status='ex'; r.history.push({ev:'end',day:D('2026-03-02')}); G.flags['EX_'+id]=true; }
    const a=await tick(); at('2026-09-23',21.5); const b=await tick();
    return [!a&&b,J({a,b})]; });

  /* ===================== 8 她們畢業以後 ===================== */
  await chk('8. 她們畢業以後（2028-06-03 以後）的場次：4-2 Café 打烊（公館宵夜那一句）、4-3 公館（書店待到六點、18:00）、4-4 溫州街的小公園（傍晚、交換回來以後的開頭）',async()=>{
    const p0=STORY.presence; STORY.presence=function(id,g){ if(id===ZR&&g.day>D('2028-09-01')) return {here:true}; return p0.apply(this,arguments); };   /* 假設芷若沒出國（規則先寫好，BB 23-3）*/
    try{
      fresh('2028-09-20',21.5,'dorm'); both('FAM'); zz({since:0}); await tick(); const a=said[0]&&said[0].t===L.IN.home.grad&&entered[0][0]==='wenzhou';
      fresh('2028-11-09',17.9,'campus'); both('FAM'); zz({state:'feelings_emerging',since:0,lastDay:D('2028-09-20')}); const b0=await tick(); at('2028-11-09',18); await tick(); const b=!b0&&said[0]&&said[0].t===L.IN.next.grad&&entered[0][0]==='gongguan';
      fresh('2028-12-15',17.5,'campus'); both('FAM'); zz({state:'mutual_interest',since:0,lastDay:D('2028-11-09')}); await tick(); const Z=G.flags.ZZ;
      const c=said[0]&&said[0].t===L.IN.serious.grad&&entered[0][0]==='wenzhou'&&seq(L.SERIOUS.AGAIN)&&Z.state==='dating'&&!!Z.ev.ev_zz_serious_again;
      return [a&&b&&c,J({a,b,c})]; } finally { STORY.presence=p0; } });

  /* ===================== 9 交換、芷若在英國 ===================== */
  await chk('9. 祐廷在國外（日本路線 4/27）：事件照樣發生（seen:false、沒有畫面、狀態推進）；之後回來也不補演',async()=>{
    fresh('2028-04-27',17,'campus',{EXCHANGE_ROUTE:'JP'}); both('FAM'); zz({state:'feelings_emerging',since:0,lastDay:D('2028-03-08')}); const r=await tick(); const Z=G.flags.ZZ;
    return [!r&&!said.length&&Z.state==='mutual_interest'&&Z.ev.ev_zz_next_time&&Z.ev.ev_zz_next_time.seen===false&&!G.flags.YT_SAW_ZZ_2&&G.events.done.ev_zz_next_time===1&&Z.yt==='none',J(Z)]; });
  await chk('9. 芷若在英國的學期（大三上 9/22）跳過；大四（芷若整年在英國）也不演',async()=>{
    fresh('2027-09-22',21.5,'dorm'); both('FAM'); zz({since:0}); const a=await tick(); at('2028-09-20',21.5); const b=await tick();
    return [!a&&!b&&G.flags.ZZ.state==='friends',J({a,b})]; });

  /* ===================== 10 dating、先這樣、交換回來 ===================== */
  await chk('10. 大二下 6/4（她最後一個班 6/3 之後、出國前）：「那就先這樣」——說好在一起的那幾句不說、停在 held；祐廷知道她們先不開始',async()=>{
    fresh('2027-06-04',14.6,'campus'); both('FAM'); zz({state:'mutual_interest',since:0,lastDay:D('2027-04-29')}); await tick(); const Z=G.flags.ZZ, Q=L.SERIOUS;
    return [seq(Q.A.slice(0,Q.cutA).concat(Q.HELD,Q.END))&&!has('……那我們要不要在一起？')&&Z.state==='held'&&Z.held==='uk'&&Z.heldSeen===true&&Z.yt==='mutual',J(Z)]; });
  await chk('10. 交換回來以後（大三下 6/2）：ev_zz_serious_again「妳回來了」開頭，一律交往（A：子晴「……我也是。」接「我們現在這樣，算什麼啊？」）',async()=>{
    fresh('2028-06-02',14.6,'campus'); both('FAM'); zz({state:'held',held:'uk',since:0,lastDay:D('2027-06-04')}); await tick(); const Z=G.flags.ZZ, Q=L.SERIOUS;
    return [seq(Q.AGAIN.concat(Q.AGAIN_A,Q.A.slice(Q.fromA),Q.END))&&Z.state==='dating'&&G.events.done.ev_zz_serious_again===1&&!G.events.done.ev_zz_serious,J(Z)]; });

  /* ===================== 11 4-7 ===================== */
  await chk('11. 4-7 只在 dating 以後：mutual_interest 的存檔 9/18 不演；交往（6/5）以後＝下一個學期第 2 週週五 9/18 14:30，一般朋友版；聽過 4-4 的第一句「妳們……真的在一起了？」；祐廷知道（confirmed）、人物頁兩人各多一條「她和○○在交往」',async()=>{
    fresh('2026-09-18',14.6,'campus'); both('FAM'); zz({state:'mutual_interest',since:0,lastDay:D('2026-06-05')}); const a=await tick();
    fresh('2026-09-18',14.6,'dorm',{YT_HEARD_ZZ:true}); both('FAM'); zz({state:'dating',since:0,datingDay:D('2026-06-05'),datingTerm:'Y1S2',lastDay:D('2026-06-05'),yt:'mutual'}); const b=await tick(); const Z=G.flags.ZZ;
    const want=[['yt',L.LEARN.heard]].concat(L.LEARN.friend.slice(1));
    return [!a&&b&&said[0].t===L.IN.serious.out&&seq(want)&&Z.yt==='confirmed'&&Z.ev.ev_zz_yt_learns&&SOCIAL.has(ZR,'ZR_WITH_ZQ')&&SOCIAL.has(ZQ,'ZQ_WITH_ZR')&&SOCIAL.MEMORY_LABEL.ZR_WITH_ZQ==='她和子晴在交往'&&SOCIAL.MEMORY_LABEL.ZQ_WITH_ZR==='她和芷若在交往',J({a,b,s:said.slice(0,3)})]; });
  await chk('11. 4-7：兩人一起被祐廷傷害過（§22）＝「干你屁事」那一版；沒聽過 4-4＝「妳們……在一起了？」',async()=>{
    fresh('2026-09-18',14.6,'campus',{ZQ_ZR_ENDED_DAY:D('2025-12-01')}); both('FAM'); zz({state:'dating',since:0,datingDay:D('2026-06-05'),datingTerm:'Y1S2',lastDay:D('2026-06-05')}); await tick();
    return [seq(L.LEARN.hurt)&&has('干你屁事。'),J(txt())]; });
  await chk('11. 4-4 在大三下 6/2（畢業前一天）＝4-7 在 6/3 畢業典禮（總圖前面、牽著手拍照的入場旁白）',async()=>{
    fresh('2028-06-03',14.6,'dorm'); both('FAM'); zz({state:'dating',since:0,datingDay:D('2028-06-02'),datingTerm:'Y3S2',lastDay:D('2028-06-02')}); await tick();
    return [said[0]&&said[0].t===L.IN.learnGrad&&entered[0][0]==='campus'&&seq(L.LEARN.friend),J(said[0])]; });

  /* ===================== 12 4-2b ===================== */
  /* ZZ 先建（這一版開始玩的存檔，F3 以前就有 ZZ），F3 那天的結果才照當時的狀態決定 */
  const f3=(st,o)=>{ fresh(o&&o.day||'2028-05-31',o&&o.h||21,o&&o.zone||'campus',o&&o.flags||{}); both('FAM'); zz(Object.assign({state:st,since:0,lastDay:D('2028-04-27')},o&&o.zz||{}));
    Object.assign(G.flags,{FANG_F3_DAY:D(o&&o.f3||'2028-05-29'),FANG_F3:'bought'}); };
  await chk('12. 4-2b 已經在交往（F3 那天 dating）：芷若婉拒（fy declined）、5/31 21:00 法律系館B門口情侶版（吉他社的玩家沒有「你經過法律系館B」）；片名換成《秋天的晚飯》',async()=>{
    f3('dating',{flags:{CLUB_club_guitar:true}}); await tick(); const Z=G.flags.ZZ;
    return [Z.fy==='declined'&&Z.f3==='dating'&&entered[0][0]==='campus'&&said[0].t===exp(L.MIND.dating)[0]&&seq(L.MIND.dating)&&has('他約妳看《秋天的晚飯》喔？')&&Z.ev.ev_zz_zq_mind.seen===true,J({fy:Z.fy,s:said.slice(0,2)})]; });
  await chk('12. 4-2b 互相喜歡、還沒交往：婉拒、跟子晴說了（講電話那一版）；之後的 4-4（6/2）一律 B',async()=>{
    f3('mutual_interest'); await tick(); const Z=G.flags.ZZ; const a=Z.fy==='declined'&&Z.forceB===true&&said[0].t==='（你經過法律系館B。）'&&seq(L.MIND.mutual);
    at('2028-06-02',14.6); await tick(); const Q=L.SERIOUS;
    return [a&&seq(Q.AGAIN.concat(Q.B.slice(Q.fromB),Q.END))&&G.flags.ZZ.version==='B',J({a,v:G.flags.ZZ.version})]; });
  await chk('12. 4-2b 曖昧（feelings_emerging、兩人都單身）：芷若接受、去看了（went）＝第一次在意版；隔天起芷若選方奕廷（seeing、held＝結局 C）',async()=>{
    f3('feelings_emerging'); await tick(); const Z=G.flags.ZZ; const a=Z.fy==='went'&&seq(L.MIND.first)&&has('欸，你覺得《秋天的晚飯》好看嗎？')&&has('《秋天的晚飯》？');
    at('2028-06-01',10); rules();
    return [a&&G.flags.ZZ.fy==='seeing'&&G.flags.ZZ.state==='held'&&G.flags.ZZ.held==='fy'&&ZRZQ.ending(G)==='C',J({a,Z:G.flags.ZZ})]; });
  await chk('12. 4-2b 只是朋友（4-2 沒演過）：照原本的方奕廷路線，不演、不強制吃醋',async()=>{
    f3('friends'); const r=await tick(); return [!r&&!said.length&&G.flags.ZZ.fy==='seeing',J(G.flags.ZZ)]; });
  await chk('12. F3 延到 6/19：4-2b 在 6/21（三）21:30 溫州街的小公園（入場旁白「阿凱約你在公館吃宵夜…」、場景字照 AA 換）',async()=>{
    f3('dating',{day:'2028-06-21',h:21.4,zone:'dorm',f3:'2028-06-19'}); const r0=await tick(); at('2028-06-21',21.5); await tick();
    const want=L.MIND.dating.map(([w,t])=>[w,L.MIND.park[t]||t]);
    return [!r0&&said[0].t===L.IN.mindPark&&entered[0][0]==='wenzhou'&&seq(want),J(said.slice(0,2))]; });
  await chk('12. 開場字幕（也是筆記本日誌的標題）照地點：4-2b 法律系館B門口／溫州街的小公園；4-7 映月湖／畢業典禮；不劇透（沒有「在一起」）',async()=>{
    const got=[];
    f3('dating',{flags:{CLUB_club_guitar:true}}); caps=[]; await tick(); got.push(caps.slice());
    f3('dating',{day:'2028-06-21',h:21.5,zone:'dorm',f3:'2028-06-19'}); caps=[]; await tick(); got.push(caps.slice());
    fresh('2026-09-18',14.6,'campus'); both('FAM'); zz({state:'dating',since:0,datingDay:D('2026-06-05'),datingTerm:'Y1S2',lastDay:D('2026-06-05')}); caps=[]; await tick(); got.push(caps.slice());
    fresh('2028-06-03',14.6,'dorm'); both('FAM'); zz({state:'dating',since:0,datingDay:D('2028-06-02'),datingTerm:'Y3S2',lastDay:D('2028-06-02')}); caps=[]; await tick(); got.push(caps.slice());
    const want=['法律系館B門口','溫州街的小公園','映月湖','畢業典禮'];
    return [want.every((w,i)=>got[i].length===1&&got[i][0]===w)&&!got.flat().some(c=>/在一起/.test(c)),J(got)]; });
  await chk('12. 祐廷不在台灣（日本路線）：4-2b 不演（狀態照樣決定）',async()=>{
    f3('dating',{flags:{EXCHANGE_ROUTE:'JP'}}); const r=await tick(); return [!r&&G.flags.ZZ.fy==='declined'&&G.flags.ZZ.ev.ev_zz_zq_mind&&G.flags.ZZ.ev.ev_zz_zq_mind.seen===false,J(G.flags.ZZ.ev)]; });

  /* ===================== 13 F3 婉拒 ===================== */
  await chk('13. F3 婉拒（已經和子晴在交往）：r2y3b 的「……我說好。」不演（R2Y3B.f3CafeDue false）；之後第一次在 Café 找芷若說話＝那四句（片名換掉）、祐廷知道（confirmed）',async()=>{
    fresh('2028-05-30',15,'cafe'); both('FAM'); zz({state:'dating',since:0,lastDay:D('2026-06-05'),datingDay:D('2026-06-05'),datingTerm:'Y1S2'}); Object.assign(G.flags,{FANG_F3_DAY:D('2028-05-29'),FANG_F3:'bought'}); rules();
    const ev=STORY_EVENTS.find(e=>e.id==='ev_zz_f3_told'), cafe=STORY_EVENTS.find(e=>e.id==='ev_zhiruo_f3_cafe');
    const ok1=!R2Y3B.f3CafeDue(G)&&EVENTS.check(ev)&&!EVENTS.check(cafe); said=[]; await EVENTS.run(ev);
    return [ok1&&seq(L.F3_TOLD)&&has('奕廷約我去看《秋天的晚飯》。')&&G.flags.ZZ.yt==='confirmed',J({ok1,t:txt()})]; });
  await chk('13. 對照：芷若接受（曖昧期去看了）＝r2y3b 那一場照演',()=>{
    fresh('2028-05-30',15,'cafe'); both('FAM'); zz({state:'feelings_emerging',since:0,lastDay:D('2028-03-08')}); Object.assign(G.flags,{FANG_F3_DAY:D('2028-05-29'),FANG_F3:'bought'}); rules();
    return [R2Y3B.f3CafeDue(G)===true&&!EVENTS.check(STORY_EVENTS.find(e=>e.id==='ev_zz_f3_told')),'']; });
  await chk('13. 日本路線（人在國外）：原本那則「……我說好。」不會出現（AA_296 ⑤ 起日本路線本來就不排；排了也會收回）；芷若不傳訊息（七-6 的訊息版 AA_385 第 7 項拿掉），8/5 回國以後在 Café 當面說（「你不在的時候，」那一版，tests/aa385_zz_unit.js）；方奕廷那三則 5/30 不送（AA_385 第 10 節：她當面說完那天 21:00 才送，同上）',async()=>{
    fresh('2028-05-29',21.2,'dorm',{EXCHANGE_ROUTE:'JP'}); both('FAM'); R('npc_fangyt','FAM'); G.contacts[ZR]=1; zz({state:'dating',since:0,lastDay:D('2026-06-05'),datingDay:D('2026-06-05'),datingTerm:'Y1S2'});
    R2Y3B.f3Go(G,G.day); const q0=PHONE.rec(G).q.some(q=>q.tag==='y3_zr_f3_jp'); rules(); const q1=PHONE.rec(G).q.some(q=>q.tag==='y3_zr_f3_jp');
    at('2028-05-29',23.5); rules(); at('2028-05-30',22.5); rules();
    const zr=(G.msgs||[]).filter(m=>m.th==='p:heroine_02').map(m=>m.text), fy=(G.msgs||[]).filter(m=>m.tag==='zz_f3_fang'||m.th==='p:npc_fangyt').map(m=>m.text);
    const ev=STORY_EVENTS.find(e=>e.id==='ev_zz_f3_told'), d0=!EVENTS.check(ev); at('2028-08-05',15); G.zone='cafe'; rules(); const d1=EVENTS.check(ev);
    return [!q1&&!zr.length&&!fy.length&&G.flags.ZZ.yt!=='confirmed'&&d0&&d1,J({q0,q1,zr,fy,yt:G.flags.ZZ.yt,d0,d1})]; });

  /* ===================== 14 互斥 ===================== */
  await chk('14. 她們交往中（dating）＝「她有交往的對象」：校外約會、告白不出現（DATE）；互相喜歡（mutual_interest）時照常',()=>{
    fresh('2026-07-01',15,'campus'); both('FRI'); zz({state:'mutual_interest',since:0}); const a=STORY.partnerOn(G,CHARACTERS[ZR].partner), w0=DATE.willing(G,ZQ).ok;
    zz({state:'dating'}); const b=STORY.partnerOn(G,CHARACTERS[ZR].partner)&&STORY.partnerOn(G,CHARACTERS[ZQ].partner), w1=DATE.willing(G,ZQ), c1=DATE.canAskCore(G,ZR);
    return [!a&&w0&&b&&!w1.ok&&w1.why==='partner'&&!c1.ok,J({a,w0,b,w1,c1})]; });
  await chk('14. 對照：別人的伴侶照舊（沛珊×柏翰的 partnerOn 不受影響）',()=>{
    fresh('2026-05-04',15,'campus'); return [STORY.partnerOn(G,CHARACTERS.classmate_peishan.partner)===true,'']; });

  /* ===================== 15 舊存檔 ===================== */
  await chk('15. 舊存檔（沒有 ZZ，4/1 讀檔）：建 ZZ＝friends；讀檔以前的場次（3/11）不補演、4/30 不演 4-3；下學期 9/23 演 4-2',async()=>{
    fresh('2026-04-01',12,'dorm'); both('FAM'); delete G.flags.ZZ; rules(); const Z=G.flags.ZZ, a=!!Z&&Z.state==='friends'&&Z.since===D('2026-04-01');
    at('2026-04-30',16.7); const b=await tick(); at('2026-09-23',21.5); const c=await tick();
    return [a&&!b&&c,J({a,b,c})]; });
  await chk('15. F3 已經過了的舊存檔：芷若接受了＝fy seeing；和祐廷交往中（恭喜）＝null',()=>{
    fresh('2028-06-10',12,'dorm',{FANG_F3_DAY:D('2028-05-29'),FANG_F3:'direct'}); delete G.flags.ZZ; rules(); const a=G.flags.ZZ.fy==='seeing';
    fresh('2028-06-10',12,'dorm',{FANG_F3:'congrats'}); delete G.flags.ZZ; rules(); return [a&&G.flags.ZZ.fy==null,'']; });

  /* ===================== 16 結局 ===================== */
  const epi=async()=>{ said=[]; for(const f of PG.EPI_AFTER_CG) await f(GM); return txt(); };
  await chk('16. 尾聲：B 成為情侶＝明信片那一行（祐廷沒看過任何一場也有）；C 英國版＝「她回來再說」；C 非英國版＝第七節第 5 點；A＝不加、記 remain_friends',async()=>{
    fresh('2034-06-03',19,'cafe'); zz({state:'dating',since:0,yt:'none'}); const b=await epi();
    zz({state:'held',held:'uk'}); const c1=await epi(); zz({state:'mutual_interest',held:null}); const c2=await epi(); zz({state:'friends'}); const a=await epi();
    return [b.includes(L.END.B)&&c1.includes(L.END.C_UK)&&c2.includes(L.END.C)&&!a.some(t=>/芷若|子晴/.test(t))&&G.flags.ZZ.state==='remain_friends'&&G.flags.ZZ.ending==='A',J({b,c1,c2,a})]; });

  /* ===================== 17 4-5、4-6 ===================== */
  await chk('17. 4-5：交往以後，祐廷在 Café、芷若在班上＝第 1 則（使用者的示範）；同一個月不再有第二則；下個月第 2 則；第 3 則要下雨的晚上',async()=>{
    fresh('2026-09-20',19,'cafe'); both('FAM'); zz({state:'dating',since:0,yt:'confirmed'}); const n={id:ZR,charId:ZR,obj:{position:{x:0,y:0,z:0}},lv:0}; GM.npc[ZR]=n; E.npcs=[n];
    const e=i=>STORY_EVENTS.find(x=>x.id==='ev_zz_daily_'+i), a=EVENTS.check(e(1))&&!EVENTS.check(e(2)); said=[]; await EVENTS.run(e(1)); const a2=seq(L.DAILY[0]);
    const b=!EVENTS.check(e(2)); at('2026-10-05',19); const c=EVENTS.check(e(2))&&!EVENTS.check(e(3)); await EVENTS.run(e(2));
    at('2026-11-05',19); const d=!EVENTS.check(e(3))&&EVENTS.check(e(4)); G.weather='rain'; const f=EVENTS.check(e(3))&&!EVENTS.check(e(4));
    return [a&&a2&&b&&c&&d&&f,J({a,a2,b,c,d,f})]; });
  await chk('17. 4-6：芷若在英國（大三上）、找子晴說話：晚上＝她給祐廷看的那幾則；公館宵夜（22:00～24:00）＝第七節第 3 點那一段（AA_385 第 5 項，原本臺灣凌晨四點多；「想妳」「我也是」不在祐廷面前）',async()=>{
    fresh('2027-10-13',21.5,'dorm'); both('FRI'); zz({state:'dating',since:0,yt:'confirmed'});
    const e=i=>STORY_EVENTS.find(x=>x.id==='ev_zz_uk_'+i), a=!EVENTS.check(e(1))&&EVENTS.check(e(2)); said=[]; await EVENTS.run(e(2)); const a2=said.length===2&&said[0].who==='高子晴（手機）'&&said[1].who==='林芷若（手機）';
    at('2027-11-13',28.3); const b0=!EVENTS.check(e(1)); at('2027-11-15',23); G.zone='gongguan'; const b=EVENTS.check(e(1)); said=[]; await EVENTS.run(e(1));
    return [a&&a2&&b0&&b&&seq(L.UK[0])&&!has('想妳。')&&!has('我也是。'),J({a,a2,b0,b,said})]; });

  /* ===================== 17b 曼谷（AA_244）===================== */
  const A244=show(['2d3a0735','origin/claude/story-planning'],'docs/story_planning/AA_244_以安假期計畫_出國旅遊台詞.md');
  await chk('17b. 曼谷（大三暑假 T03）：她們交往中＝6/10 子晴的私訊多「芷若也去」（AA_244）、同行的人有芷若；沒交往＝照舊',()=>{
    const okSpec=!!A244&&A244.includes('〔芷若×子晴交往中〕子晴：'+L.BKK.dm)&&A244.includes(L.BKK.coconut);
    fresh('2028-06-10',21.2,'dorm'); R(ZQ,'FAM'); R(ZR,'FAM'); zz({state:'dating',since:0}); rules(); const m1=(G.msgs||[]).filter(m=>m.th==='p:heroine_04').map(m=>m.text), mt1=[...VAC.mates(VAC.inst('T03','Y3'))];
    fresh('2028-06-10',21.2,'dorm'); R(ZQ,'FAM'); zz({state:'mutual_interest',since:0}); rules(); const m0=(G.msgs||[]).filter(m=>m.th==='p:heroine_04').map(m=>m.text), mt0=[...VAC.mates(VAC.inst('T03','Y3'))];
    return [okSpec&&J(m1)===J(['欸 七月三號到七號 曼谷','有個獨立遊戲展 我想去看','阿凱也去','芷若也去'])&&J(m0)===J(['欸 七月三號到七號 曼谷','有個獨立遊戲展 我想去看','阿凱也去'])&&mt1.includes(ZR)&&!mt0.includes(ZR)&&J(VAC_DATA.A.T03.signup.msgs)===J(m0),J({m1,m0,mt1,mt0})]; });
  await chk('17b. 曼谷夜市那天：她們分一杯椰子汁——祐廷第一次看到（4-7 還沒演）＝算 4-7，接一般朋友版；4-7 演過的玩家只有那一句旁白',async()=>{
    fresh('2028-07-05',20,'dorm'); both('FAM'); zz({state:'dating',since:0,datingDay:D('2027-12-17'),datingTerm:'Y3S1'}); rules();
    const I=VAC.inst('T03','Y3'), k=VAC_DATA.A.T03.keys.find(x=>x.day==='07-05'); said=[]; await VAC.key(GM,k,I); const Z=G.flags.ZZ;
    const a=has('（阿凱一個人吃了三份炒河粉。）')&&has(L.BKK.coconut)&&seq(L.LEARN.friend)&&Z.ev.ev_zz_yt_learns&&Z.ev.ev_zz_yt_learns.bkk===true&&Z.yt==='confirmed';
    said=[]; await VAC.key(GM,k,I); const b=has(L.BKK.coconut)&&!has('妳們在一起了？');
    fresh('2028-07-05',20,'dorm'); both('FAM'); zz({state:'mutual_interest',since:0}); rules(); said=[]; await VAC.key(GM,k,I); const c=!has(L.BKK.coconut);
    return [a&&b&&c,J({a,b,c,t:txt()})]; });

  /* ===================== 18 其他接線 ===================== */
  await chk('18. 手機子晴「芷若在英國」三則的標籤（AA_385 第 9 節選③）：mutual_interest＝兩人是好朋友；dating＝兩人交往中；兩人是朋友只給沒有 ZZ 的舊存檔',()=>{ fresh('2027-10-13',22,'dorm'); zz({state:'mutual_interest',since:0}); const t=()=>['兩人是朋友','兩人是好朋友','兩人交往中'].map(p=>MSG.tok(G,ZQ,p)); const a=t(); zz({state:'dating'}); const b=t(); delete G.flags.ZZ; const c=t();
    return [J(a)===J([false,true,false])&&J(b)===J([false,false,true])&&J(c)===J([true,false,false]),J({a,b,c})]; });
  await chk('18. 其中一人自己告訴他（閒聊階梯記 ZZ_TOLD_YT，23-4）＝祐廷知道（confirmed）、4-7 就不演',()=>{
    fresh('2026-09-10',15,'campus'); both('FAM'); zz({state:'dating',since:0,datingDay:D('2026-06-05'),datingTerm:'Y1S2',yt:'mutual'}); SOCIAL.remember(ZQ,'ZZ_TOLD_YT',''); rules(); at('2026-09-18',14.6);
    return [G.flags.ZZ.yt==='confirmed'&&!ZRZQ.next(G),'']; });
  await chk('18. 在家（臺北的家）：該帶到場了＝STORY.y4HomeDue 回 zrzq（先離開家）',()=>{ fresh('2026-03-11',21.6,'dorm'); both('FAM'); HOME.rec(G).at=true; const r=STORY.y4HomeDue(G); HOME.rec(G).at=false; return [r==='zrzq',String(r)]; });
  await chk('18. 跳過時間停在帶到場的那一刻（3/11 20:00 在總圖跳到 23:00＝停在 21:30）；寒暑假快轉也停（HOME.STOPS）',()=>{
    fresh('2026-03-11',20,'library_hall'); both('FAM'); const st=CLS.skipStops(GM,23), hs=HOME.STOPS.map(f=>f(G,G.day*24+20)).flat().filter(x=>x!=null);
    return [st.some(s=>Math.abs(s.h-21.5)<1e-6)&&hs.includes(G.day*24+21.5),J({st,hs})]; });

  await chk('18. 帶到場的時候出錯（換區失敗）：黑幕拿掉、記下來、不每 0.5 秒重來；其他場次照常',async()=>{
    fresh('2026-03-11',21.6,'library_hall'); both('FAM'); const e0=GM.enter, w0=console.warn, f0=GM.fade, fd=[]; let n=0; GM.enter=async()=>{ n++; throw new Error('換區失敗'); }; GM.fade=on=>{ fd.push(on); return Promise.resolve(); }; console.warn=()=>{};
    try{ await tick(); const r2=await tick(), r3=await tick(); var a=n===1&&!r2&&!r3&&fd[fd.length-1]===false&&ZRZQ._fail.ev_zz_home_together===true&&G.flags.ZZ.state==='friends'; }
    finally{ GM.enter=e0; GM.fade=f0; console.warn=w0; }
    delete ZRZQ._fail.ev_zz_home_together; fresh('2026-03-11',21.6,'library_hall'); both('FAM'); await tick();
    return [a&&G.flags.ZZ.state==='feelings_emerging',J({n,a,fd})]; });

  console.log(fails?('FAILED: '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
