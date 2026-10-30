// AA_392 學姊第六批（企劃線 e81a1afe1；任務 SIS-B6-L-1023；D111「學姊才是真正的女主角」）——不需要瀏覽器。
//   1  第 1 節：交往中（臺灣、日本路線，她在美國）每週日 10:00 視訊（ev_sis_video_gf）：六組照順序、各一次，還沒到那一組的週次只有旁白；T1、SA_X 照片照收，T2 不收；
//      逐字對稿（六組、旁白）；沒接＝「你在忙。下週。」；連兩週沒接，第三週她不打「這週我先不打了。你有空打給我。」，下一週照常；
//      臺灣路線大峽谷才交往：大峽谷那一週不排、中秋那組不演（AA_516 第 1 節 1-3 改：V1～V3 都算演過，10/22 是 2-2 的 h5）
//   3  第 3 節：交往中口試沒到——21:00 她打來（21:00 以前自己打也一樣），兩個選項；5/30 12:20～13:00 研究室的蛋糕
//   4  第 4 節：研究室走不到——便條改乙（總圖三樓）
//   5  第 5 節：第一次訪談選「下次還要記嗎？」→ 11/24 私訊、11/27 第二次訪談；不行／沒到 13:00「記完了。」
//   6  第 6 節：荷花池——交往中、大二情人節植物園約過的；7/1 私訊、7/3 09:00；2 月有來／沒來兩種選項；不行＝7/3 10:00 照片
//   7  第 7 節：7/31 出發前去總圖坐一下——7/30 群組提示、作息、自己走到閱覽室才有；交往中多一行
//   2  第 2 節：期末「那天我去送學姊。」只給臺灣路線；7/26 21:05 私訊三選一（開車＝原本、到機場等她＝新的一場、去不了＝客運版多一句）；群組按鈕不再出；交往中的送機多兩行
// 修改前（開發分支 8f9b305c1）：第 1 項 FAIL（交往中整個秋天沒有每週一格）。用法：node tests/aa392_sis_b6_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM}=H;
global.CG_REGISTRY={};
load('src/noodle_closed3d.js'); load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js');
{ const L2=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG2_POOL)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  L2('src/exchange3d.js'); L2('src/data/msg2_pool.js'); L2('src/msg3d.js'); L2('src/y34b3d.js'); }
{ const L3=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }; L3('src/data/sis_y2y3_events.js'); L3('src/sis_y2y3_3d.js'); L3('src/data/sis_b4_events.js'); L3('src/sis_b4_3d.js'); }
const Y=Y34B, has=t=>H.said.some(x=>x.t===t), idx=t=>H.said.findIndex(x=>x.t===t), thx=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const yphone=()=>{ Y.sisPhone(H.G); PHONE.tick(H.G); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=picks||[]; if(!q) return false; await OUT.go(GM,q); return true; };
const S=R2Y4B, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, J=JSON.stringify;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const fresh=(key,h,route)=>{ const G=H.fresh(key,h,'dorm',{EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1}); G.acts={att:{}}; G.outings=[]; H.at(key,h); return G; };
const th=()=>(H.G.msgs||[]).filter(m=>m.th==='p:heroine_05');
/* 一天一天走：跑手機規則、收訊息；交往版的視訊到了，miss(k) 為真＝沒接（missed＋outingMissed），否則當作接了（done）*/
const walk=(d0,d1,miss)=>{ for(let d=d0;d<=d1;d++) for(const h of [6,7.5,8.5,9.5,10.5,12,20]){ H.at(CALENDAR.dateOf(d).key,h); S.phone(H.G,GM); PHONE.tick(H.G);
  for(const q of OUT.rec(H.G)) if(/^y4_sa_(g|v)_/.test(q.id)&&q.state==='planned'&&T(q.day,q.h)<=T(d,h)){ if(miss&&q.sa&&miss(q.sa.k)){ q.state='missed'; OUT.onMissed(GM,q); } else q.state='done'; } } };
const gv=()=>OUT.rec(H.G).filter(q=>/^y4_sa_g_/.test(q.id)).sort((a,b)=>a.day-b.day);
const keyOf=d=>CALENDAR.dateOf(d).key;

(async()=>{
let doc=''; try{ doc=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_392_學姊第六批_說了沒發生與每週視訊.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
/* ---- 1 ---- */
await sec(1,async()=>{ check('1. 讀得到稿（企劃線 e81a1afe1 的 AA_392）',!!doc);
  const ev=STORY_EVENTS.find(e=>e.id==='ev_sis_video_gf'), txt=ev?ev.dialogue.filter(n=>n.text).map(n=>n.text):[];
  const sec13=(doc.split('### 1-3.')[1]||'').split('### 1-4.')[0], lines=[...sec13.matchAll(/^書瑀：(.+)$/mg)].map(m=>m[1]).concat([...sec13.matchAll(/書瑀：「(.+?)」/g)].map(m=>m[1]));
  const narr=(doc.match(/用完以後每週一行旁白：「(.+?)」/)||[])[1];
  const A516={'二十三號早上到。':'二十三號晚上八點落地。','機場的班次我傳給你了。':'班次，回去前傳給你。'};   /* AA_516 第 1 節 1-1（企劃線 a9b87c588）：g6 這兩句改了（和 12/23 20:30 的接機對齊）*/
  const lines2=lines.map(l=>A516[l]||l);
  check('1. 六組視訊的台詞（書瑀說的）和稿一字不差都在（g6 兩句照 AA_516 1-1 改過的）',lines2.length>=20&&lines2.every(l=>txt.includes(l)||txt.includes(l.replace(/^照片你看到了吧。$/,'照片你看到了吧。')))&&Object.keys(A516).every(l=>lines.includes(l)&&!txt.includes(l)),J(lines2.filter(l=>!txt.includes(l))));
  check('1. 用完以後的旁白和稿一字不差',!!narr&&txt.includes(narr)&&S.SA_VG_NARR===narr,narr);
  /* 臺灣路線、7/29 就交往：8/6～12/17 每週日 10:00 */
  fresh('2028-08-02',20,'TW'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-12-20'));
  const V=gv(), sun=V.every(q=>CALENDAR.dateOf(q.day).wd===7&&q.h===10);
  check('1. 交往中（臺灣路線）：8/6 起每週日 10:00 一格視訊「和書瑀視訊（她那邊週六晚上）」，到 12/17',V.length===20&&sun&&keyOf(V[0].day)==='2028-08-06'&&keyOf(V[V.length-1].day)==='2028-12-17'&&V.every(q=>q.ev==='ev_sis_video_gf'),J(V.map(q=>keyOf(q.day)+'@'+q.h)));
  const sets=V.filter(q=>q.sa.gset<6).map(q=>keyOf(q.day)+':V'+(q.sa.gset+1));
  check('1. 六組照順序、各一次：V1 8/13、V2 9/3、V3 10/1（中秋）、V4 11/5（冬令時間）、V5 11/26（感恩節）、V6 12/10',J(sets)===J(['2028-08-13:V1','2028-09-03:V2','2028-10-01:V3','2028-11-05:V4','2028-11-26:V5','2028-12-10:V6']),J(sets));
  const tags=th().filter(m=>m.from==='heroine_05').map(m=>m.tag||'');
  check('1. 交往中：T1、SA_X 照片照收（花生醬、烏龍茶、感恩節…），T2（直屬學姊問近況）不收、朋友版視訊和 10/11 朋友版大峽谷照片不排',tags.some(t=>/^y4_sa_t1_/.test(t))&&tags.some(t=>/^y4_sa_x_/.test(t))&&!tags.some(t=>/^y4_sa_t2_/.test(t))&&!OUT.rec(H.G).some(q=>/^y4_sa_v_/.test(q.id))&&!tags.includes('y4_sa_canyon_photo'),J([...new Set(tags)]));
  /* 演出來：V1、旁白 */
  { const q=V.find(x=>x.sa.gset===0); q.state='planned'; H.at(keyOf(q.day),10); H.said=[]; H.picks=[0]; await OUT.go(GM,q);
    const t=H.said.map(s=>s.t); check('1. V1 演出來：「到這邊一個禮拜了。」→「給我看。」→「三本是今天借的。」',t.includes('到這邊一個禮拜了。')&&t.includes('三本是今天借的。'),J(t)); }
  { const q=V.find(x=>x.sa.gset===6); q.state='planned'; H.at(keyOf(q.day),10); H.said=[]; await OUT.go(GM,q);
    check('1. 沒輪到一組的週次：只有那一行旁白',H.said.length>=1&&H.said[0].t===S.SA_VG_NARR,J(H.said)); }
  /* 沒接 */
  fresh('2028-08-02',20,'TW'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-09-12'),k=>k===1||k===2);
  const m=th().filter(x=>x.from==='heroine_05').map(x=>keyOf(x.day)+' '+x.text), V2=gv().map(q=>keyOf(q.day));
  check('1. 沒接（8/13）：她只傳一則「你在忙。下週。」',m.includes('2028-08-13 你在忙。下週。'),J(m));
  check('1. 連兩週沒接（8/13、8/20）：8/27 她不打，傳「這週我先不打了。你有空打給我。」；9/3 照常',!V2.includes('2028-08-27')&&m.includes('2028-08-27 這週我先不打了。你有空打給我。')&&V2.includes('2028-09-03'),J({m,V2}));
  check('1. 沒接的那一組不補（8/13 的 V1 沒接，9/3 是 V2）',(gv().find(q=>keyOf(q.day)==='2028-09-03')||{sa:{}}).sa.gset===1,J(gv().map(q=>keyOf(q.day)+':'+q.sa.gset)));
  /* 日本路線（8/5 回臺灣）：也排 */
  fresh('2028-08-05',20,'JP'); H.G.flags.JP_DEPARTED=D('2028-03-25'); H.G.flags.JP_RETURNED=D('2028-08-05'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-06'),D('2028-08-14'));
  check('1. 日本路線交往中：8/6 起也每週日視訊，8/13 是 V1',gv().length===2&&gv()[1].sa.gset===0,J(gv().map(q=>keyOf(q.day)+':'+q.sa.gset)));
  /* 美國路線：不排（同一班飛機）；前任：不排 */
  fresh('2028-08-02',20,'US'); H.G.flags.dating_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-08-14'));
  check('1. 美國路線：不排每週視訊',!gv().length);
  fresh('2028-08-02',20,'TW'); H.G.flags.EX_heroine_05=true; H.FRIEND('heroine_05'); walk(D('2028-08-03'),D('2028-08-14'));
  check('1. 和學姊分手過：不排',!gv().length&&!th().some(x=>/^y4_sa_/.test(x.tag||'')));
  /* 臺灣路線 10/13 大峽谷才交往 */
  fresh('2028-08-02',20,'TW'); H.rel('heroine_05',60,45,40); walk(D('2028-08-03'),D('2028-10-06'));
  OUT.plan(H.G,{id:'y4_sis_canyon',ev:'ev_sis_canyon',day:D('2028-10-07'),h:7,place:'桃園機場',title:'秋假',travel:'',travelH:1}); OUT.get(H.G,'y4_sis_canyon').state='done';
  H.at('2028-10-13',18); S.canyonAfter(H.G,'tw'); H.at('2028-10-15',21); S.phone(H.G,GM); walk(D('2028-10-15'),D('2028-11-07'));
  const C=gv().map(q=>keyOf(q.day)+':'+(q.sa.gset<6?'V'+(q.sa.gset+1):(q.sa.gset>6?'H'+(q.sa.gset-6):'旁白')));
  /* AA_516 第 1 節 1-3（企劃線 a9b87c588）：開始交往以前的 g1、g2、g3（和 2-2 的 h1～h3）都算演過；h4 那一週她在峽谷也不演——10/22 是 h5（開頭多一句「峽谷回來以後……」，tests/aa516_sis_b14_unit.js 驗），10/29 旁白，11/5 V4 */
  check('1. 大峽谷才交往：大峽谷那一週（10/8、10/15）不排；10/22 不從第一組開始（AA_516 1-3：V1～V3 算演過）＝H5，10/29 旁白，11/5 V4',!!H.G.flags.dating_heroine_05&&J(C)===J(['2028-10-22:H5','2028-10-29:旁白','2028-11-05:V4']),J(C)); });
/* ---- 2 ---- */
await sec(2,async()=>{ const hk=TERMEND_LINES.HOOK.Y3S2.heroine_05, fl=r=>({flags:{EXCHANGE_ROUTE:r}});
  check('2. 期末聚餐「那天我去送學姊。」：臺灣路線才有（日本、美國路線不出）',hk.if(fl('TW'))&&!hk.if(fl('JP'))&&!hk.if(fl('US')));
  const s0=(flags,rel)=>{ fresh('2028-07-26',20,'TW'); Object.assign(H.G.flags,flags||{}); (rel||H.FRIEND)('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); H.at('2028-07-26',21); yphone(); };
  s0({HOOK_SIS_SENDOFF:1,SAID_HAS_CAR:true}); const gb=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_ride'); const pre=thx('p:heroine_05').length; H.at('2028-07-26',21.1); yphone();
  const dm=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_hook_dm');
  check('2. 說過要送：群組那則沒有 Kevin 的按鈕；21:05 她私訊「八月二號早上八點，我家樓下。」「你說要送我。」，三個選項（有車）',!gb&&!pre&&J(thx('p:heroine_05'))===J(['八月二號早上八點，我家樓下。','你說要送我。'])&&!!dm&&J(dm.ask.opts.map(o=>o.t))===J(['我開車去載妳。','我到機場等妳。','那天我去不了了。']),J({dm:dm&&dm.ask.opts,th:thx('p:heroine_05')}));
  PHONE.answer(H.G,'y4_sis_hook_dm',1); yphone(); const q=OUT.get(H.G,'y4_sis_airport_wait');
  check('2. 「我到機場等妳。」：SIS_RIDE_ASK airport；8/2 08:30「桃園機場第二航廈・出境大廳」（機場捷運 1 小時）',H.G.flags.SIS_RIDE_ASK==='airport'&&!!q&&q.day===D('2028-08-02')&&q.h===8.5&&q.place==='桃園機場第二航廈・出境大廳'&&q.travelH===1&&!OUT.get(H.G,'y4_sis_airport'),J(q));
  H.at('2028-08-02',7.4); await goOut('y4_sis_airport_wait'); const T5=['（八點半。她從客運站那邊走過來，戴著口罩，一個行李箱。）','……你說你會來。','（她從包包拿出冰的罐裝飲料。）','回程喝。','……回到家，傳訊息給我。'];
  check('2. 機場等她：「（八點半。她從客運站那邊走過來…）」「……你說你會來。」→ 冰的罐裝飲料「回程喝。」「……回到家，傳訊息給我。」（照順序）',T5.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(T5[i-1]))),J(H.said.map(x=>x.t)));
  check('2. 記 SIS_SENDOFF airport、記憶 SAW_HER_OFF（不是 DROVE_HER）；09:00 沒有客運那則',H.G.flags.SIS_SENDOFF==='airport'&&SOCIAL.has('heroine_05','SAW_HER_OFF')&&!SOCIAL.has('heroine_05','DROVE_HER')&&(H.at('2028-08-02',9.2),yphone(),!thx('g:family_law').includes('出發了。'))&&!!SOCIAL.MEMORY_LABEL.SAW_HER_OFF);
  s0({HOOK_SIS_SENDOFF:1}); H.at('2028-07-26',21.1); yphone(); const dm2=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_hook_dm');
  check('2. 沒說過有車（SAID_HAS_CAR）：只有「我到機場等妳。」「那天我去不了了。」',!!dm2&&J(dm2.ask.opts.map(o=>o.t))===J(['我到機場等妳。','那天我去不了了。']),J(dm2&&dm2.ask.opts));
  PHONE.answer(H.G,'y4_sis_hook_dm',1); yphone(); H.at('2028-07-26',21.3); yphone(); H.at('2028-08-02',9); yphone(); const g=thx('g:family_law');
  check('2. 「那天我去不了了。」→「好。」；8/2 09:00 客運那則前面多一句「說好的那個，沒關係。」',thx('p:heroine_05').includes('好。')&&H.G.flags.SIS_RIDE_ASK==='no'&&g.indexOf('說好的那個，沒關係。')>=0&&g.indexOf('說好的那個，沒關係。')===g.indexOf('（照片：客運的窗外）')-1&&H.G.flags.SIS_SENDOFF==='bus',J(g));
  s0({HOOK_SIS_SENDOFF:1}); H.at('2028-07-26',21.1); yphone(); PHONE.answer(H.G,'y4_sis_hook_dm',0); yphone(); H.at('2028-08-02',9.1); yphone();
  check('2. 答應到機場等她卻沒去：照客運版（09:00 照片「出發了。」）',OUT.get(H.G,'y4_sis_airport_wait')&&thx('g:family_law').includes('出發了。')&&!thx('g:family_law').includes('說好的那個，沒關係。'));
  s0({}); H.at('2028-07-26',21.2); yphone(); const gb2=(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='y4_sis_ride');
  check('2. 沒說過要送的：照舊，群組有「我送妳。我有車。」，沒有私訊',!!gb2&&!thx('p:heroine_05').length);
  /* 交往中（和學姊）：家族共乘、機場等她 */
  s0({HOOK_SIS_SENDOFF:1,SAID_HAS_CAR:true}); H.date('heroine_05'); H.at('2028-07-26',21.1); yphone(); PHONE.answer(H.G,'y4_sis_hook_dm',0); yphone(); H.at('2028-07-26',21.3); yphone();
  H.at('2028-08-02',7.9); await goOut('y4_sis_airport'); const a=idx('回程路上喝。冰的。');
  check('2. 交往中的送機（家族共乘）：「回程路上喝。冰的。」後面「（Kevin 去還推車的時候，她把口罩拉下來一下。）」「到了先在群組說，再打給你。」',H.G.flags.SIS_RIDE==='family'&&a>=0&&idx('（Kevin 去還推車的時候，她把口罩拉下來一下。）')===a+1&&idx('到了先在群組說，再打給你。')===a+2,J(H.said.map(x=>x.t)));
  s0({HOOK_SIS_SENDOFF:1}); H.date('heroine_05'); H.at('2028-07-26',21.1); yphone(); PHONE.answer(H.G,'y4_sis_hook_dm',0); yphone(); H.at('2028-08-02',7.4); await goOut('y4_sis_airport_wait');
  check('2. 交往中、機場等她：「回程喝。」後面「（排進出境的隊伍以前，她把口罩拉下來一下，又拉回去。）」「到了先在群組說，再打給你。」（AA 74fba9b7）',idx('（排進出境的隊伍以前，她把口罩拉下來一下，又拉回去。）')===idx('回程喝。')+1&&idx('到了先在群組說，再打給你。')===idx('回程喝。')+2&&!has('（Kevin 去還推車的時候，她把口罩拉下來一下。）'),J(H.said.map(x=>x.t)));
  fresh('2028-08-02',7.9,'TW'); H.FRIEND('heroine_05'); H.G.flags.SIS_RIDE='two'; OUT.plan(H.G,{id:'y4_sis_airport',ev:'ev_sis_airport',day:D('2028-08-02'),h:8,place:'學姊家樓下',title:'載學姊',travel:'',travelH:0}); await goOut('y4_sis_airport');
  check('2. 沒交往：車上那一版沒有那兩行',has('回程路上喝。冰的。')&&!has('到了先在群組說，再打給你。')); });
/* ---- 3 ---- */
await sec(3,async()=>{ const yph=()=>{ Y.m9Phone(H.G); PHONE.tick(H.G); };
  const s3=()=>{ fresh('2029-05-28',21,'TW'); H.FRIEND('heroine_05'); H.date('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); yph(); H.at('2029-05-29',18.5); OUT.tick(GM); yph(); };
  s3(); H.at('2029-05-29',19); yph(); const q0=OUT.get(H.G,'y4_m9_call');
  check('3. 交往中、口試沒到：18:30 那則照舊，21:00 她打電話來（「書瑀打電話來」）',H.G.flags.SIS_DEFENSE==='missed'&&thx('p:heroine_05').includes('……你今天在忙？好。晚上打給我。')&&!!q0&&q0.h===21&&q0.title==='書瑀打電話來'&&q0.verb==='接起來',J(q0));
  H.at('2029-05-29',21); await goOut('y4_m9_call',[0]); const C=['（電話那頭有人在笑。研究室的人在幫她慶祝。）','等一下。……好，我走到外面了。','過了。委員問了兩個小時。','嗯。','下次不要忘。……蛋糕還有一半，明天中午研究室。'];
  check('3. 電話：「等一下。……好，我走到外面了。」「過了。委員問了兩個小時。」→「對不起，我忘了時間。」→「嗯。」「下次不要忘。……蛋糕還有一半，明天中午研究室。」；記 SIS_DEFENSE_CALL',C.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(C[i-1])))&&H.G.flags.SIS_DEFENSE_CALL===true,J(H.said.map(x=>x.t)));
  const k=OUT.get(H.G,'y4_m9_cake');
  check('3. 明天中午研究室：5/30（三）12:20～13:00 出遊',!!k&&keyOf(k.day)==='2029-05-30'&&Math.abs(k.h-(12+20/60))<1e-6&&Math.abs(k.h+k.late-13)<1e-6&&CALENDAR.dateOf(k.day).wd===3,J(k));
  H.at('2029-05-30',12.3); await goOut('y4_m9_cake'); check('3. 有來：「（蛋糕上寫著『溫書玉』。她用叉子把那個字刮掉了。）」',has('（蛋糕上寫著『溫書玉』。她用叉子把那個字刮掉了。）'));
  s3(); H.at('2029-05-29',21); yph(); await goOut('y4_m9_call',[1]); check('3. 「恭喜。」→「……謝謝。他們買的蛋糕把我的名字寫錯了。明天中午你來，我給你看。」',has('……謝謝。他們買的蛋糕把我的名字寫錯了。明天中午你來，我給你看。')&&!!OUT.get(H.G,'y4_m9_cake'));
  s3(); H.at('2029-05-29',19); PHONE.answer(H.G,'y4_m9_callme',0); yph(); const q1=OUT.get(H.G,'y4_m9_call');
  check('3. 21:00 以前自己打（18:30 那則的「（打給她）」）：同一通，現在就打（「打給書瑀」）',!!q1&&q1.h===19&&q1.verb==='打過去'&&q1.ev==='ev_sis_defense_call',J(q1));
  fresh('2029-05-28',21,'TW'); H.FRIEND('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); yph(); H.at('2029-05-29',18.5); OUT.tick(GM); yph(); H.at('2029-05-29',21); yph();
  check('3. 朋友（沒交往）：沒有這通電話',H.G.flags.SIS_DEFENSE==='missed'&&!OUT.get(H.G,'y4_m9_call')); });
/* ---- 4、5 ---- */
await sec(4,async()=>{ const e=STORY_EVENTS.find(x=>x.id==='ev_sis_lab_desk'), t=J(e&&e.dialogue||[]);
  check('4. 研究室 5F 開了（AA_399 1-2，10-23）：便條回到甲「中午十二點二十以後，我在這裡。」；她週一～週四 12:20～14:00 在研究室（linze_5f），其他平日白天照舊總圖（library）',t.includes('中午十二點二十以後，我在這裡。」')&&!t.includes('研究室我只放書')&&CHARACTERS.heroine_05.daily_schedule.some(r=>r.zone==='linze_5f'&&Math.abs(r.from-(12+20/60))<1e-9&&r.to===14&&J(r.days)===J([1,2,3,4]))&&CHARACTERS.heroine_05.daily_schedule.some(r=>r.zone==='library'&&r.from<=12.34&&r.to>=13&&J(r.days)===J([1,2,3,4,5])),t.slice(0,80)); });
await sec(5,async()=>{ const ID='heroine_05', X=SISY23;
  const s5=(flags)=>{ const G=H.fresh('2027-11-24',20,'dorm',Object.assign({met_sis:true,SIS_W1:true,EXCHANGE_ROUTE:'TW'},flags||{})); H.FRIEND(ID); G.contacts={[ID]:G.day-60}; G.outings=[]; H.at('2027-11-24',20); X.phone(G); H.at('2027-11-24',21); X.phone(G); PHONE.tick(G); return G; };
  const iv=STORY_EVENTS.find(x=>x.id==='ev_sis_interview'), b=iv&&iv.dialogue.findIndex(n=>n.label==='b'), e2=iv&&iv.dialogue.findIndex(n=>n.label==='end');
  check('5. 第一次訪談選「下次還要記嗎？」記 SIS_IV_AGAIN',!!iv&&iv.dialogue.slice(b,e2).some(n=>n.set&&n.set.SIS_IV_AGAIN===true));
  s5({SIS_IV_AGAIN:true}); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisy23_iv2_ask');
  check('5. 11/24 21:00 私訊「週六早上十點，有第二次訪談。這次是當事人。」「你說要記的。」；「好。」／「那天不行。」',J(thx('p:heroine_05'))===J(['週六早上十點，有第二次訪談。這次是當事人。','你說要記的。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','那天不行。']),J(thx('p:heroine_05')));
  PHONE.answer(H.G,'sisy23_iv2_ask',0); X.phone(H.G); PHONE.tick(H.G); const q=OUT.get(H.G,'sisy23_iv2');
  check('5. 回「好。」→「十點，社區活動中心。我傳地址給你。」；排 11/27（六）10:00 社區活動中心・小房間',thx('p:heroine_05').includes('十點，社區活動中心。我傳地址給你。')&&!!q&&keyOf(q.day)==='2027-11-27'&&q.h===10&&q.place==='社區活動中心・小房間',J(q));
  H.at('2027-11-27',9.6); H.picks=[0]; await goOut('sisy23_iv2',[0]); const C=['（一個五十幾歲的男人，手上一直轉著一支原子筆。）','他同意錄音。你一樣要記。','（他講了一個多小時。講到他太太的時候，原子筆停了。）','你記到哪裡？','……那段我不會寫進論文。','可是我要記得。','（她去便利商店買了兩杯咖啡，一杯給你。）','今天的工資。'];
  check('5. 第二次訪談照稿（他太太那段）；記 SIS_INTERVIEW2 went',C.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(C[i-1])))&&H.G.flags.SIS_INTERVIEW2==='went',J(H.said.map(x=>x.t)));
  s5({SIS_IV_AGAIN:true}); PHONE.answer(H.G,'sisy23_iv2_ask',1); X.phone(H.G); PHONE.tick(H.G); H.at('2027-11-27',13); X.phone(H.G); PHONE.tick(H.G);
  check('5. 回「那天不行。」→「好。我自己記。」；11/27 13:00「記完了。」',thx('p:heroine_05').includes('好。我自己記。')&&thx('p:heroine_05').includes('記完了。')&&!OUT.get(H.G,'sisy23_iv2')&&H.G.flags.SIS_INTERVIEW2==='missed',J(thx('p:heroine_05')));
  s5({}); check('5. 第一次沒選「下次還要記嗎？」：沒有這則',!thx('p:heroine_05').length); });
/* ---- 6 ---- */
await sec(6,async()=>{ const ID='heroine_05', X=SISB4;
  const s6=(v2)=>{ const G=H.fresh('2027-07-01',20,'dorm',{met_sis:true,SIS_W1:true,EXCHANGE_ROUTE:'TW'}); H.FRIEND(ID); H.date(ID); if(v2) G.flags.SIS_VDAY_Y2=v2; G.contacts={[ID]:G.day-60}; G.outings=[]; H.at('2027-07-01',20); X.phone(G); H.at('2027-07-01',21); X.phone(G); PHONE.tick(G); return G; };
  s6('went'); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='sisb4_lotus_ask');
  check('6. 交往中、情人節植物園約過：7/1 21:00「荷花開了。」「週六早上九點，植物園。早上開得比較好。」；「好。」／「那天不行。」',J(thx('p:heroine_05'))===J(['荷花開了。','週六早上九點，植物園。早上開得比較好。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','那天不行。']),J(thx('p:heroine_05')));
  PHONE.answer(H.G,'sisb4_lotus_ask',0); X.phone(H.G); const q=OUT.get(H.G,'sisb4_lotus');
  check('6. 「好。」→ 7/3（六）09:00 臺北植物園・荷花池',!!q&&keyOf(q.day)==='2027-07-03'&&q.h===9&&CALENDAR.dateOf(q.day).wd===6,J(q));
  const r0=Object.assign({},SOCIAL.rel(ID)); H.at('2027-07-03',8.6); await goOut('sisb4_lotus',[0]); const r1=SOCIAL.rel(ID);
  check('6. 2 月有來：「二月的時候，這裡只有水。」→「妳說妳喜歡什麼都還沒長出來的時候。」→「嗯。」「長出來也不錯。」；SIS_LOTUS went；熟悉 +2、自在 +3、她的戀愛 +2',has('二月的時候，這裡只有水。')&&H.opts[0]&&H.opts[0][0]==='「妳說妳喜歡什麼都還沒長出來的時候。」'&&!H.opts[0].includes('「上次我沒來。」')&&has('長出來也不錯。')&&H.G.flags.SIS_LOTUS==='went'&&r1.fam-r0.fam===2&&r1.comf-r0.comf===3&&r1.npcRom-r0.npcRom===2,J({o:H.opts,d:[r1.fam-r0.fam,r1.comf-r0.comf,r1.npcRom-r0.npcRom]}));
  s6('missed'); PHONE.answer(H.G,'sisb4_lotus_ask',0); X.phone(H.G); H.at('2027-07-03',8.6); await goOut('sisb4_lotus',[0]);
  check('6. 2 月沒來：「上次我沒來。」→「所以這次是補的。……你遲到四個月。」',H.opts[0]&&H.opts[0][0]==='「上次我沒來。」'&&has('所以這次是補的。……你遲到四個月。'),J(H.opts));
  s6('no'); PHONE.answer(H.G,'sisb4_lotus_ask',1); X.phone(H.G); PHONE.tick(H.G); H.at('2027-07-03',10); X.phone(H.G); PHONE.tick(H.G);
  check('6. 「那天不行。」→「好。我拍給你看。」；7/3 10:00「📷（荷花池，開了幾朵）」',thx('p:heroine_05').includes('好。我拍給你看。')&&thx('p:heroine_05').includes('📷（荷花池，開了幾朵）')&&!OUT.get(H.G,'sisb4_lotus'),J(thx('p:heroine_05')));
  s6(null); check('6. 情人節植物園沒約過：沒有這則',!thx('p:heroine_05').length); });
/* ---- 7 ---- */
await sec(7,async()=>{ const E=H.E, ev=STORY_EVENTS.find(x=>x.id==='ev_sis_lib_last');
  const here=()=>{ H.G.zone='library'; GM.npc.heroine_05={obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}; E.npcs=[GM.npc.heroine_05]; };
  fresh('2028-07-30',20,'TW'); H.FRIEND('heroine_05'); PHONE.join(H.G,'family_law','法律系直屬家族'); H.at('2028-07-30',21); Y.sisPhone(H.G); PHONE.tick(H.G);
  check('7. 7/30 21:00 家族群組她一則「明天我在總圖三樓。最後一天。」',thx('g:family_law').includes('明天我在總圖三樓。最後一天。'),J(thx('g:family_law')));
  const sch=CHARACTERS.heroine_05.daily_schedule.find(r=>r.dates&&J(r.dates)===J([['2028-07-31','2028-07-31']]));
  check('7. 7/31 的作息：10:00～16:00 總圖三樓（library）',!!sch&&sch.zone==='library'&&sch.from===10&&sch.to===16);
  H.at('2028-07-31',9.5); here(); const c0=EVENTS.check(ev); H.at('2028-07-31',11); here(); const c1=EVENTS.check(ev); H.G.zone='campus'; const c2=EVENTS.check(ev); here();
  check('7. 7/31 10:00～16:00 走到閱覽室、她在：開始（9:30 不開始、不在閱覽室不開始）',!c0&&c1&&!c2,J([c0,c1,c2]));
  H.said=[]; await EVENTS.run(ev); const L=['（她坐在三樓靠窗那個位子。桌上沒有書，只有一個保溫瓶。）','最後一天了。……坐。','（你們坐了二十分鐘，誰都沒有講話。窗外的椰子樹被風吹得一直晃。）','好。可以走了。'];
  check('7. 照稿四行（朋友版沒有桌子底下那一行）；記 SIS_LIB_LAST',L.every((t,i)=>idx(t)>=0&&(i===0||idx(t)>idx(L[i-1])))&&!has('（她在桌子底下碰了一下你的手，又縮回去。這裡是閱覽室。）')&&H.G.flags.SIS_LIB_LAST===true,J(H.said.map(x=>x.t)));
  fresh('2028-07-31',11,'TW'); H.FRIEND('heroine_05'); H.date('heroine_05'); here(); H.said=[]; await EVENTS.run(ev);
  check('7. 交往中：「坐了二十分鐘」後面多「（她在桌子底下碰了一下你的手，又縮回去。這裡是閱覽室。）」',idx('（她在桌子底下碰了一下你的手，又縮回去。這裡是閱覽室。）')===idx('（你們坐了二十分鐘，誰都沒有講話。窗外的椰子樹被風吹得一直晃。）')+1);
  fresh('2028-07-31',11,'JP'); H.FRIEND('heroine_05'); here(); const j=EVENTS.check(ev); fresh('2028-07-31',11,'TW'); H.FAMILIAR('heroine_05'); here(); const f=EVENTS.check(ev); fresh('2028-07-31',11,'TW'); H.FRIEND('heroine_05'); H.G.flags.EX_heroine_05=true; here(); const x=EVENTS.check(ev);
  check('7. 日本路線、不到朋友、前任：沒有',!j&&!f&&!x,J([j,f,x])); E.npcs=[]; GM.npc={}; });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
