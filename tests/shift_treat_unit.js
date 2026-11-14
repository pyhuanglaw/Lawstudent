// 她打工的時候你走進店裡（SHIFT-TREAT-1110；USER_WANTS X302）——不需要瀏覽器（D131）。
// 台詞 AA_739（企劃線 dc607dd90，AA 定稿 D109），一律從 src/data/shift_treat.js 讀來比對（不寫死台詞）。檢查：
//   0. shift_treat.js 和白名單上的 AA_739 一致（import_shift_treat.py --check）、和 dc607dd90 的 lines 一字不差；index.html 載入順序
//   1. 在班／不在班：芷若（作息 barista＝ladWorking）、語彤（作息 label「一盞茶屋（打工）」）；不在場、正在下班（leaving）不演；經濟系那一年不演
//   2. 未認識（沒有 FIRST_MET）不演；今天才認識也不演
//   3. 玩家自己在這家店上班（JOBS 這一班）不演；別家店的班、這家店下班以後照演
//   4. 當天有她的其他事件不演（她在這家店的事件今天演過；語彤 ev_yt_tell_mom 那一天；S.OTHER）；每天的點餐「兩點半的店員」不算；今天 rel_lines up 說過不演
//   5. 隔一天以上才再演（今天、明天不演，第三天起）
//   6. 四個階段各一組照順序輪（acq 2 句輪、familiar／friend.happy／dating.happy 三組輪），旁白／她說的分開
//   7. 招待頻率：朋友＝朋友以上第 3 次起、隔 3 次、7 天以上；交往＝隔 2 次、5 天以上；輪不到演 happy
//   8. 招待：熟悉 +1（不動戀愛點數）；happy 不加
//  10b. 還沒等滿兩秒就按了店裡的東西（點餐）：先演完再點（BB 11-10 15:47）
//   9. T3（芷若熱可可、語彤先端來一壺）：那天在那家店點的下一樣不扣錢（兩點半點餐、「兩點半的店員」事件、一盞點茶）；別家店、隔天不算；其他招待照付
//  10. 走進店裡（STORY.onEnter）等兩秒才演；讀檔回到店裡不演；對話中等
//  11. 舊存檔（沒有 G.flags.SHIFTT、壞掉的）讀得進來、從 idx 0 開始
// 用法：node tests/shift_treat_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H;
const fs=require('fs'), path=require('path'), vm=require('vm'), cp=require('child_process');
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); return true; };
let ok0=false, err=''; try{ ok0=load('src/data/shift_treat.js')&&load('src/shifttreat3d.js'); }catch(e){ err=String(e&&e.stack||e); }
const J=JSON.stringify;
const ZR='heroine_02', YT='heroine_03';
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（中斷這一節）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
global.GAME=GM;
let money=[]; GM.money=(d,label)=>{ H.G.money+=d; money.push([d,label]); };
const wd=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(day,h)=>{ const G=H.G; G.day=day; G.hour=h; G.weekday=wd(day); };
/* 認識了（FIRST_MET 記在 30 天前，不是「今天才認識」）＋階段 */
const LV={acq:[10,0,0],familiar:[25,0,0],friend:[45,30,0],close:[65,50,45]};
const know=(id,lv)=>{ const r=SOCIAL.rel(id), v=LV[lv||'acq']; r.fam=v[0]; r.trust=v[1]; r.comf=v[2]; const M=H.G.social.mem; (M[id]=M[id]||[]).push({tag:'FIRST_MET',day:H.G.day-30,note:''}); };
const npc=(id,o)=>{ GM.npc[id]=Object.assign({obj:{position:{x:0,y:0,z:0},rotation:{y:0}},pose:'idle',charId:id,name:SOCIAL.displayName(id)},o||{}); return GM.npc[id]; };
/* 芷若：法律系大一下的平日晚班（characters.js 週一～五 19:00～22:00）；語彤：學期中週六 13:00～17:00 */
const ZR_DAY=()=>H.D('2026-03-10'), YT_DAY=()=>H.D('2026-03-14');
const setup=(id,lv,o)=>{ o=o||{}; const zone=SHIFTT.SHOP[id]; const G=H.fresh(id===ZR?'2026-03-10':'2026-03-14',id===ZR?20:14,zone,o.flags||{}); G.money=1000; if(STORY._bindGM) STORY._bindGM(GM);
  if(lv==='dating'){ know(id,'friend'); G.flags['dating_'+id]=true; } else if(lv) know(id,lv); npc(id,id===ZR?{staff:'cafe',frozen:true}:{sched:true}); money=[]; return G; };
const said=()=>H.said.map(s=>[s.who,s.t]);
const run=async(fn,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const r=await fn(); return {r,L:said()}; };
const expect=(lines,who)=>lines.map(t=>/^（/.test(t)?[null,t]:[who,t]);
const playAt=async(id,day)=>{ at(day,id===ZR?20:14); return run(()=>SHIFTT.play(GM,id)); };

(async()=>{
  /* ======================= 0 資料 ======================= */
  await sec(0,async()=>{ check('0. 載入 shift_treat.js、shifttreat3d.js',ok0&&typeof SHIFTT!=='undefined'&&SHIFTT.on(),err.slice(0,300));
    let out='', ok=false; try{ out=cp.execFileSync('python3',[path.join(H.ROOT,'tools/shift/import_shift_treat.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); ok=/^OK/.test(out); }catch(e){ out=String(e.stderr||e.message); }
    check('0. shift_treat.js 和白名單上的 AA_739（dc607dd90）一致（import_shift_treat.py --check）',ok&&J(SHIFT_TREAT.src)===J(['docs/story_planning/AA_739_shift_treat.json@dc607dd90']),out.trim().slice(0,200));
    let src=null; try{ src=JSON.parse(cp.execFileSync('git',['-C',H.ROOT,'show','dc607dd90:docs/story_planning/AA_739_shift_treat.json'],{encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(e){}
    check('0. lines 和企劃線 dc607dd90 一字不差（拿得到那個 commit 才比）',!src||J(require('./aa959_map.js').mapDeep(src.lines,'shift_treat.js')/* RC2-PORT-DEV-1114：AA_959 783 列，稿上的字照表換完再比 */)===J(SHIFT_TREAT.lines),src?'':'（沒有 dc607dd90：先 git fetch origin claude/story-planning）');
    const L=SHIFT_TREAT.lines; check('0. 兩人都有 acq、familiar、friend{happy,treat}、dating{happy,treat}',[ZR,YT].every(p=>L[p].acq.length&&L[p].familiar.length===3&&['friend','dating'].every(s=>L[p][s].happy.length===3&&L[p][s].treat.length===3)));
    check('0. T3＝friend.treat 第 3 組（芷若熱可可、語彤先端來一壺）',L[ZR].friend.treat[SHIFTT.FREE[ZR]].join('').includes('熱可可')&&L[YT].friend.treat[SHIFTT.FREE[YT]].join('').includes('端了一壺'));
    check('0. 每一句：（開頭的整句是旁白（以）結尾）、其他是她說的（不加「」）',[ZR,YT].every(p=>{ const all=[].concat(...['acq','familiar'].map(k=>L[p][k]),...['friend','dating'].map(s=>[].concat(L[p][s].happy,L[p][s].treat))); return all.every(g=>g.every(t=>/^（/.test(t)?/）$/.test(t):!/^「.*」$/.test(t))); }));
    const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), i=f=>html.indexOf('src="'+f);
    check('0. index.html：shift_treat.js → shifttreat3d.js，在 story3d.js、wzshops3d.js 之後、gift_holiday.js 之前',i('src/data/shift_treat.js')>0&&i('src/data/shift_treat.js')<i('src/shifttreat3d.js')&&i('src/story3d.js')<i('src/shifttreat3d.js')&&i('src/wzshops3d.js')<i('src/shifttreat3d.js')&&i('src/shifttreat3d.js')<i('src/data/gift_holiday.js')); });

  /* ======================= 1 在班／不在班 ======================= */
  await sec(1,async()=>{ let G=setup(ZR,'familiar');
    check('1. 芷若：週二 20:00 在 Café 吧檯（ladWorking）＝在班、會演',STORY.ladWorking(G,ZR)&&SHIFTT.onShift(G,ZR)&&SHIFTT.due(GM,ZR));
    at(ZR_DAY(),16); check('1. 芷若：週二 16:00 不在班＝不演',!SHIFTT.onShift(G,ZR)&&!SHIFTT.due(GM,ZR)); at(ZR_DAY(),20);
    G.zone='wenzhou'; check('1. 人不在 Café（溫州街）不演',!SHIFTT.due(GM,ZR)); G.zone='cafe';
    delete GM.npc[ZR]; check('1. 3D 裡她不在店裡不演',!SHIFTT.due(GM,ZR)); npc(ZR,{staff:'cafe',leaving:true}); check('1. 她正在下班（leaving）不演',!SHIFTT.due(GM,ZR)); npc(ZR,{staff:'cafe'});
    G.stage='econ'; check('1. 經濟系那一年不演',!SHIFTT.due(GM,ZR)); G.stage='law';
    G=setup(YT,'familiar'); const e=STORY.schedEnt(CHARACTERS[YT],G);
    check('1. 語彤：週六 14:00 作息是「一盞茶屋（打工）」＝在班、會演',!!e&&e.label==='一盞茶屋（打工）'&&SHIFTT.onShift(G,YT)&&SHIFTT.due(GM,YT),e&&e.label);
    at(YT_DAY(),18); check('1. 語彤：週六 18:00（下班了）不演',!SHIFTT.onShift(G,YT)&&!SHIFTT.due(GM,YT));
    at(YT_DAY()+2,14); check('1. 語彤：週一 14:00（沒有班）不演',!SHIFTT.onShift(G,YT)); });

  /* ======================= 2 未認識 ======================= */
  await sec(2,async()=>{ let G=setup(ZR,null); check('2. 芷若沒有 FIRST_MET（還不認識）不演',!SHIFTT.due(GM,ZR));
    SOCIAL.remember(ZR,'FIRST_MET','cafe'); SOCIAL.rel(ZR).fam=10; check('2. 今天才認識（FIRST_MET 記在今天）不演',!SHIFTT.due(GM,ZR));
    at(ZR_DAY()+1,20); check('2. 認識隔天就會演',SHIFTT.due(GM,ZR));
    G=setup(YT,null); check('2. 語彤沒有 FIRST_MET 不演',!SHIFTT.due(GM,YT)); });

  /* ======================= 3 玩家自己上班 ======================= */
  await sec(3,async()=>{ const G=setup(ZR,'friend'); const J0=global.JOBS;
    global.JOBS={ZONE_KEY:{cafe:'cafe',wz_teahouse:'tea'},running:false,active:(G,k)=>k==='cafe',due:(G,k,d)=>k==='cafe',hrs:()=>[19,22]};
    check('3. 玩家今天在兩點半有班、現在 20:00（班上）＝不演',SHIFTT.playerShift(G,'cafe')&&!SHIFTT.due(GM,ZR));
    at(ZR_DAY(),18.6); check('3. 開班前 30 分鐘內（18:36）也不演',!SHIFTT.due(GM,ZR));
    at(ZR_DAY(),21.99); check('3. 21:59 還在班上',!SHIFTT.due(GM,ZR));
    at(ZR_DAY(),18); check('3. 18:00（還沒開班前 30 分鐘）……芷若也還沒上班，用 playerShift 看＝false',!SHIFTT.playerShift(G,'cafe'));
    at(ZR_DAY(),20); global.JOBS.due=()=>false; check('3. 這家店今天沒班（請假、不是排班日）＝照演',SHIFTT.due(GM,ZR));
    global.JOBS.due=(G,k)=>k==='tea'; global.JOBS.active=(G,k)=>k==='tea'; check('3. 玩家的班在一盞（別家店）＝兩點半照演',SHIFTT.due(GM,ZR));
    global.JOBS.running=true; check('3. 打工那一班正在跑（JOBS.running）而且人在這家店＝不演',!SHIFTT.due(GM,ZR));
    if(J0===undefined) delete global.JOBS; else global.JOBS=J0; });

  /* ======================= 4 當天有她的其他事 ======================= */
  await sec(4,async()=>{ let G=setup(ZR,'friend');
    G.events.last.ev_zhiruo_film_night=G.day; check('4. 芷若在 Café 的事件（週末看片）今天演過＝不演',!SHIFTT.due(GM,ZR)); delete G.events.last.ev_zhiruo_film_night;
    G.events.last.ev_zhiruo_film_night=G.day-1; check('4. 昨天演過的不算',SHIFTT.due(GM,ZR));
    G.events.last.ev_cafe_barista_zhiruo=G.day; check('4. 每天的點餐「兩點半的店員」今天演過＝照演（不算其他事件）',SHIFTT.due(GM,ZR));
    G.events.last.ev_zhiruo_bell=G.day; check('4. 她在別的地方（晨思鐘）的事件不算這家店的',SHIFTT.due(GM,ZR));
    const ev={id:'ev_test_shift_tmp',participants:[ZR],location:'cafe',trigger:'interact',once:true,prereq:{}}; STORY_EVENTS.push(ev);
    check('4. 現在就成立、還沒演的她在 Café 的事件＝不演（讓給它）',EVENTS.check(ev)&&!SHIFTT.due(GM,ZR)); ev.off=true; check('4. 關掉的事件不算',SHIFTT.due(GM,ZR)); STORY_EVENTS.splice(STORY_EVENTS.indexOf(ev),1);
    G.social.relUpDay={[ZR]:G.day}; check('4. 今天 rel_lines 的 up 已經說過＝不演',!SHIFTT.due(GM,ZR)); G.social.relUpDay={[ZR]:G.day-1}; check('4. up 是昨天說的＝照演',SHIFTT.due(GM,ZR));
    SHIFTT.OTHER.push((G,pid)=>pid===ZR); check('4. 事件包登記的（S.OTHER）＝不演',!SHIFTT.due(GM,ZR)); SHIFTT.OTHER.pop();
    G=setup(YT,'friend'); const A0=global.AA720P; global.AA720P={ytTell:()=>true,YT_DAY:'2026-04-25'};
    at(H.D('2026-04-25'),14); check('4. 語彤：2026-04-25（她跟媽媽說的那天，ev_yt_tell_mom）在一盞＝不演',SHIFTT.onShift(G,YT)&&!SHIFTT.due(GM,YT));
    at(H.D('2026-04-26'),14); check('4. 隔天（4/26 週日）照演',SHIFTT.due(GM,YT));
    global.AA720P={ytTell:()=>false,YT_DAY:'2026-04-25'}; at(H.D('2026-04-25'),14); check('4. 沒走那條線（ytTell 不成立）＝4/25 照演',SHIFTT.due(GM,YT));
    if(A0===undefined) delete global.AA720P; else global.AA720P=A0;
    const ev2={id:'ev_test_shift_tmp2',participants:[YT],location:['wz_teahouse','noodle'],trigger:'auto',once:true,prereq:{custom:()=>false}}; STORY_EVENTS.push(ev2); G.events.last[ev2.id]=G.day;
    check('4. 語彤在一盞的事件（location 寫成陣列也認得）今天演過＝不演',!SHIFTT.due(GM,YT)); STORY_EVENTS.splice(STORY_EVENTS.indexOf(ev2),1); });

  /* ======================= 5 隔一天以上 ======================= */
  await sec(5,async()=>{ const G=setup(ZR,'familiar'); const d=G.day; await playAt(ZR,d);
    at(d,21); check('5. 同一天不再演',!SHIFTT.due(GM,ZR)); at(d+1,20); check('5. 隔天不演',!SHIFTT.due(GM,ZR)); at(d+2,20); check('5. 第三天起可以',SHIFTT.due(GM,ZR)); });

  /* ======================= 6 輪流 ======================= */
  await sec(6,async()=>{ const L=SHIFT_TREAT.lines;
    for(const [id,lv,st] of [[ZR,'acq','acq'],[ZR,'familiar','familiar'],[YT,'acq','acq'],[YT,'familiar','familiar'],[ZR,'friend','friend.happy'],[YT,'friend','friend.happy']]){
      const G=setup(id,lv), d=G.day, grp=st.includes('.')?L[id][st.split('.')[0]][st.split('.')[1]]:L[id][st], nm=SOCIAL.displayName(id), got=[];
      for(let k=0;k<grp.length+1;k++){ const o=SHIFTT.per(G,id); o.tn=o.nf; o.tday=d+100;   /* 朋友：招待輪不到（這一節只看 happy 的輪法）*/ const r=await playAt(id,d+3*k); got.push(J(r.L)===J(expect(grp[k%grp.length],r.L.find(x=>x[0])?r.L.find(x=>x[0])[0]:nm))&&r.r.key===st); }
      check('6. '+nm+' '+st+'：'+grp.length+' 組照順序輪、演完一輪從頭（idx 存檔）',got.every(Boolean)&&SHIFTT.per(G,id).idx[st]===1,J(got)); }
    /* dating.happy：交往中（朋友以上），招待輪不到時照順序輪 */
    for(const id of [ZR,YT]){ const G=setup(id,'dating'), d=G.day, grp=L[id].dating.happy; const o=SHIFTT.per(G,id); const got=[];
      for(let k=0;k<3;k++){ o.tn=o.nf; o.tday=d+100; const r=await playAt(id,d+3*k); got.push(r.r.key==='dating.happy'&&J(r.L.map(x=>x[1]))===J(grp[k])); }
      check('6. '+SOCIAL.displayName(id)+' dating.happy：三組照順序輪',got.every(Boolean),J(got)); }
    { const G=setup(ZR,'acq'); const r=await playAt(ZR,G.day); const g=L[ZR].acq[0];
      check('6. 說話的人是她（對話框寫她的名字）、（開頭的是旁白',J(r.L)===J(expect(g,SOCIAL.npcName(ZR)))&&r.L.some(x=>x[0]===null)&&r.L.some(x=>x[0]===SOCIAL.npcName(ZR)),J(r.L)); }
    { const G=setup(ZR,'close'); check('6. 好朋友（CLOSE_FRIEND）用 friend',SOCIAL.friendLevel(ZR)==='CLOSE_FRIEND'&&SHIFTT.stageKey(G,ZR)==='friend'); }
    { const G=setup(ZR,'dating'); check('6. 交往中用 dating（不管熟悉度）',SHIFTT.stageKey(G,ZR)==='dating'); }
    { const G=setup(ZR,'acq'); SOCIAL.rel(ZR).fam=2; check('6. 認識了、熟悉還不到「認識」那一階（STRANGER）也用 acq',SOCIAL.friendLevel(ZR)==='STRANGER'&&SHIFTT.stageKey(G,ZR)==='acq'&&SHIFTT.due(GM,ZR)); } });

  /* ======================= 7 招待頻率 ======================= */
  await sec(7,async()=>{ const seq=async(id,lv,gaps)=>{ const G=setup(id,lv); let d=G.day; const out=[]; for(const g of gaps){ d+=g; const r=await playAt(id,d); out.push(r.r.kind==='treat'?'t':'h'); } return out.join(''); };
    let s=await seq(ZR,'friend',[0,2,2,2,2,2,2]); check('7. 朋友（每 2 天來一次）：第 3 次招待；第 6 次離上次招待 6 天（<7）演 happy；第 7 次（8 天）招待',s==='hhthhht',s);
    s=await seq(YT,'friend',[0,3,3,3,3,3]); check('7. 朋友（每 3 天）：第 3、6 次招待（隔 3 次、9 天）',s==='hhthht',s);
    s=await seq(ZR,'friend',[0,2,10,2,2,2]); check('7. 朋友：第 3 次以前隔多久都不招待；招待以後隔 3 次但只過 6 天（<7）＝happy',s==='hhthhh',s);
    s=await seq(ZR,'dating',[0,2,2,2,2]); check('7. 交往（每 2 天）：第 2 次招待；第 4 次離上次 4 天（<5）happy；第 5 次（6 天）招待',s==='hthht',s);
    s=await seq(YT,'dating',[0,5,5,5,5]); check('7. 交往（每 5 天）：每 2 次一次',s==='hthth',s);
    s=await seq(ZR,'familiar',[0,2,2,2,2,2,2,2,2]); check('7. 有點熟：不招待',!s.includes('t'),s);
    { const G=setup(ZR,'friend'); let d=G.day; for(const g of [0,2]){ d+=g; await playAt(ZR,d); } G.flags['dating_'+ZR]=true; d+=2; const r=await playAt(ZR,d);
      check('7. 朋友兩次以後開始交往：朋友以上的次數接著算（交往第 1 次＝第 3 次、隔 2 次以上）＝招待',r.r.key==='dating.treat',r.r.key); } });

  /* ======================= 8 招待的效果 ======================= */
  await sec(8,async()=>{ const G=setup(ZR,'friend'); let d=G.day; const r0=Object.assign({},SOCIAL.rel(ZR)); await playAt(ZR,d); const r1=Object.assign({},SOCIAL.rel(ZR));
    check('8. happy：關係不變',J(r0)===J(r1));
    await playAt(ZR,d+2); const m0=G.money, r2=Object.assign({},SOCIAL.rel(ZR)); const r=await playAt(ZR,d+4); const r3=SOCIAL.rel(ZR);
    check('8. 招待：熟悉 +1，戀愛點數、信任、自在不變；不扣錢',r.r.kind==='treat'&&r3.fam===r2.fam+1&&(r3.npcRom|0)===(r2.npcRom|0)&&(r3.rom|0)===(r2.rom|0)&&r3.trust===r2.trust&&r3.comf===r2.comf&&G.money===m0,J([r2,r3]));
    check('8. 不記送禮（G.flags.GIFT／GIFTH 沒有動）',!G.flags.GIFT&&!G.flags.GIFTH); });

  /* ======================= 9 T3 ======================= */
  await sec(9,async()=>{ const L=SHIFT_TREAT.lines;
    /* 第一、二次招待照付；第三次（T3）點的下一樣不扣 */
    const G=setup(ZR,'friend'); const o=SHIFTT.per(G,ZR); o.nf=5; o.tn=2; o.tday=G.day-30;
    let r=await playAt(ZR,G.day); check('9. 第一次招待（friend.treat 第 1 組）不是 T3：沒有免費',r.r.key==='friend.treat'&&r.r.i===0&&!SHIFTT.freeOn(G,'cafe'));
    o.idx['friend.treat']=2; o.tn=0; o.tday=G.day-30; r=await playAt(ZR,G.day+2);
    check('9. T3 是芷若的熱可可那一組',r.r.free&&J(r.L.map(x=>x[1]))===J(L[ZR].friend.treat[2])&&r.L.map(x=>x[1]).join('').includes('熱可可'));
    check('9. T3 演完：今天在兩點半點的下一樣不扣錢（free 待用）',SHIFTT.freeOn(G,'cafe')&&!SHIFTT.freeOn(G,'wz_teahouse'));
    /* 兩點半的點餐（story3d.js counter，透過吧檯的她：n.staff cafe）*/
    G.events.last.ev_cafe_barista_zhiruo=G.day;   /* 今天的「兩點半的店員」演過了（一天一次）：再找她＝點餐（counter）*/
    let m0=G.money; await run(()=>STORY.talkCharacter(ZR,GM.npc[ZR]),[0]); check('9. 兩點半點餐（counter）：T3 那天點的第一樣不扣錢、free 用掉',G.money===m0&&!SHIFTT.freeOn(G,'cafe')&&H.said.some(s=>/你買了/.test(s.t)),G.money-m0+' '+J(H.said.map(s=>s.t)).slice(0,200));
    m0=G.money; await run(()=>STORY.talkCharacter(ZR,GM.npc[ZR]),[0]); check('9. 再點一樣照付',G.money<m0,G.money-m0);
    /* 「兩點半的店員」事件裡點的第一筆 */
    delete G.events.last.ev_cafe_barista_zhiruo; SHIFTT.rec(G).free={pid:ZR,zone:'cafe',day:G.day}; G.flags.CAFE_VISITS=2; const ev=STORY_EVENTS.find(e=>e.id==='ev_cafe_barista_zhiruo'); money=[]; m0=G.money;
    await run(()=>EVENTS.run(ev),[0,0,0,0]); check('9. 「兩點半的店員」事件：點的那一杯不扣（第一筆）、free 用掉、GM.money 還原',!SHIFTT.freeOn(G,'cafe')&&G.money===m0&&GM.money.toString().includes('money.push'),J(money)+' '+(G.money-m0));
    G.events.last.ev_cafe_barista_zhiruo=G.day-2; money=[]; m0=G.money; await run(()=>EVENTS.run(ev),[0,0,0,0]); check('9. 沒有 free 的那一場照付',G.money<m0&&money.length>0,J(money));
    /* 隔天不算 */
    SHIFTT.rec(G).free={pid:ZR,zone:'cafe',day:G.day}; at(G.day+1,20); check('9. 隔天 free 失效',!SHIFTT.freeOn(G,'cafe')&&!SHIFTT.freeTake(G,'cafe'));
    /* 語彤：一盞點茶（wzshops3d.js buy）*/
    let okW=false, ew=''; try{ okW=typeof WZS!=='undefined'||load('src/wzshops3d.js'); }catch(e){ ew=String(e&&e.message||e); }
    const Y=setup(YT,'friend'); const oy=SHIFTT.per(Y,YT); oy.idx['friend.treat']=2; oy.nf=5; oy.tn=0; oy.tday=Y.day-30; r=await playAt(YT,Y.day);
    check('9. 語彤 T3＝先端來一壺那一組',r.r.free&&r.L.map(x=>x[1]).join('').includes('端了一壺')&&SHIFTT.freeOn(Y,'wz_teahouse'));
    if(okW&&WZS.interact){ m0=Y.money; await run(()=>WZS.interact(GM,{wzShop:'teahouse',kind:'tea'}),[0]); check('9. 一盞點茶（buy）：T3 那天點的第一樣不扣錢、free 用掉',Y.money===m0&&!SHIFTT.freeOn(Y,'wz_teahouse'),Y.money-m0+' '+J(H.said.map(s=>s.t)).slice(0,160));
      m0=Y.money; await run(()=>WZS.interact(GM,{wzShop:'teahouse',kind:'tea'}),[0]); check('9. 再點一壺照付',Y.money<m0,Y.money-m0); }
    else check('9. 載入 wzshops3d.js（一盞點茶）',false,ew);
    const src=fs.readFileSync(path.join(H.ROOT,'src/wzshops3d.js'),'utf8'); check('9. buy() 只在一盞（溫州街・一盞）用 free',src.includes("key==='溫州街・一盞'&&typeof SHIFTT!=='undefined'&&SHIFTT.freeTake&&SHIFTT.freeTake(G,'wz_teahouse')"));
    /* 交往中的招待第 3 組（芷若杯套、語彤自己泡）不是 T3 */
    const D=setup(ZR,'dating'); const od=SHIFTT.per(D,ZR); od.idx['dating.treat']=2; od.nf=5; od.tn=0; od.tday=D.day-30; r=await playAt(ZR,D.day);
    check('9. 交往中的招待第 3 組不是 T3（照付）',r.r.key==='dating.treat'&&r.r.i===2&&!r.r.free&&!SHIFTT.freeOn(D,'cafe')); });

  /* ======================= 10 走進店裡 ======================= */
  await sec(10,async()=>{ const G=setup(ZR,'familiar'); GM.enterN=7; GM.D.active=false;
    STORY.onEnter('cafe',GM,{}); const p=SHIFTT.pending(); check('10. 走進 Café（STORY.onEnter）記下要等',!!p&&p.zone==='cafe');
    let fired=-1; for(let k=1;k<=6;k++){ if(SHIFTT.tick(GM)){ fired=k; break; } } await new Promise(r=>setTimeout(r,20));
    check('10. 等兩秒（第 4 格）才演，演了一次',fired===SHIFTT.WAIT&&SHIFTT.per(G,ZR).day===G.day,fired);
    at(G.day+2,20); STORY.onEnter('cafe',GM,{fromLoad:true}); let f2=false; for(let k=0;k<6;k++) if(SHIFTT.tick(GM)) f2=true; check('10. 讀檔回到店裡不演',!f2&&!SHIFTT.pending());
    GM.enterN=8; STORY.onEnter('cafe',GM,{}); GM.D.active=true; let f3=false; for(let k=0;k<8;k++) if(SHIFTT.tick(GM)) f3=true; check('10. 對話框開著就等',!f3&&!!SHIFTT.pending());
    GM.D.active=false; f3=SHIFTT.tick(GM); await new Promise(r=>setTimeout(r,20)); check('10. 對話結束接著演',f3&&SHIFTT.per(G,ZR).day===G.day);
    GM.enterN=9; STORY.onEnter('cafe',GM,{}); G.zone='wenzhou'; check('10. 等的時候離開了＝不演',!SHIFTT.tick(GM)&&!SHIFTT.pending()); G.zone='cafe';
    GM.enterN=10; STORY.onEnter('noodle',GM,{}); check('10. 別家店不記',!SHIFTT.pending());
    at(G.day+4,20); GM.enterN=11; STORY.onEnter('cafe',GM,{}); SHIFTT.tick(GM); const fl=await SHIFTT.flush(GM);   /* BB 11-10 15:47 P3：還沒等滿就按了店裡的東西 */
    check('10. 等滿以前按了店裡的東西（flush）＝先演完',fl===true&&SHIFTT.per(G,ZR).day===G.day&&!SHIFTT.pending(),fl);
    check('10. 演過了再 flush 不重演',(await SHIFTT.flush(GM))===false);
    check('10. STORY.interact 包了 flush（出口不算）',/SHIFTT\.flush|S\.flush/.test(String(STORY.interact))&&/it\.exit/.test(String(STORY.interact)));
    check('10. STORY.TICKS 有登記',STORY.TICKS.some(f=>/SHIFTT|S\.tick/.test(String(f)))||STORY._shiftt===true); });

  /* ======================= 11 舊存檔 ======================= */
  await sec(11,async()=>{ let G=setup(ZR,'familiar'); delete G.flags.SHIFTT; check('11. 沒有 G.flags.SHIFTT＝照演、從 idx 0 開始',SHIFTT.due(GM,ZR)&&SHIFTT.pick(G,ZR).i===0);
    G.flags.SHIFTT=[1,2]; check('11. 壞掉的（陣列）讀得進來',!Array.isArray(SHIFTT.rec(G))&&J(SHIFTT.rec(G).p)==='{}'&&SHIFTT.due(GM,ZR));
    G.flags.SHIFTT={p:{[ZR]:{idx:'x',day:'?'}},free:5}; check('11. 欄位壞掉也讀得進來',!!SHIFTT.pick(G,ZR)&&SHIFTT.rec(G).free===null);
    G.flags.SHIFTT={p:{[ZR]:{day:G.day-2,n:3,nf:0,tn:0,idx:{familiar:2}}},free:null}; const r=await playAt(ZR,G.day); check('11. 存檔的 idx 接著輪（familiar 第 3 組）',r.r.i===2&&SHIFTT.per(G,ZR).idx.familiar===0);
    const s=JSON.parse(JSON.stringify(G)); check('11. 存檔序列化得了',!!s.flags.SHIFTT&&s.flags.SHIFTT.p[ZR].n===4); });

  H.done();
})();
