// 多段感情交接包 v6（BB 人物）還沒進遊戲的幾場（V6-B2、V6-B5；任務 feat-v6b-1101；src/v6b_3d.js）——不需要瀏覽器。
// 台詞從企劃線 claude/cool-heisenberg-o8kuqx 用 git show 讀 BB_119、BB_165、AA_258 逐字比對；條件真的跑（手機規則、出遊 OUT.go、VAC 的跳日子）。
//   0 載入、index.html 位置、讀稿（每一句都在稿裡）
//   1 芷若「英國的雨」ev_zhiruo_uk_visit（BB_119 1c-1、9-2）：12/18 21:00 邀約、兩個回覆、沒回、2-3 承諾過的 12/19 12:00 那一則、美國路線照臺灣時間；
//     1/15 21:00 出發 → 1/16 → 1/20 19:30 老戲院（英國時間、BCG-25）→ 1/22 08:30 回到臺北；途中她的每週視訊不打；那幾天 VAC.abroadOn；沒去；
//     2-3 的「寒假我去英國找妳。」期限過了不出、去過＝修補承諾做到
//   2 沛珊 5-2 剩下的兩樣（BB_165 5-2）：短版的視訊那一種、紅筆以後摘要日的照片（一個月最多一次）；5-1 PS_WAITED 尾聲那一句（原本就有）；1b-1 考完再說（作廢）不在遊戲裡
//   3 沛珊「她的第一堂試教」ev_peishan_first_lesson（BB_119 3-1、9-3）：11/7 21:00 邀約、好／不行／沒回、沒到、台南那一趟、只給 3-1 的玩家、只一次
//   4 子晴「工作室的深夜」ev_ziqing_studio_night（BB_119 3-3、9-3）：11/10 18:00 邀約、好／不行／沒回、沒到、只給 3-3 的玩家
// 修改前（開發分支 d506a6a2f，git archive 出來放進這支測試真的跑過）見回報。用法：node tests/v6b_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/msg3d.js','src/zr_uk3d.js','src/data/hometown_lines.js','src/hometown3d.js',
  'src/data/zrzq_events.js','src/zrzq3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/data/rom1016_events.js','src/rom1016_3d.js']) L3(f);
const okNew=L3('src/v6b_3d.js');
GM.toast=()=>{}; GM.caption=()=>{}; GM.money=n=>{ H.G.money=(H.G.money|0)+n; };   /* pg_harness 的 GM.money 不記錢（高鐵票要看得到）*/
/* 收到的時間：PHONE.tick 在排定時間 15 分鐘內送到的，記成送到那一刻（走的間隔）——比對容許 0.2 小時 */
const near=(L,want)=>L.length===want.length&&L.every((x,i)=>x.text===want[i][0]&&Math.abs(x.h-want[i][1])<0.2);
const ZR='heroine_02', PS='classmate_peishan', ZQ='heroine_04';
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h)=>{ const G=H.G; G.day=typeof d==='string'?D(d):d; G.hour=h; G.weekday=wdOf(G.day); };
const setup=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'dorm',o.flags||{}); G.outings=[]; G.contacts={}; PHONE.rec(G); E.npcs=[];
  for(const id of (o.know||[])){ (o.lv==='fam'?H.FAMILIAR:H.FRIEND)(id); if(o.noContact!==true) G.contacts[id]=G.day-60; }
  for(const id of [].concat(o.dh||[])) H.date(id);
  return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const walk=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); rules(); } };
/* 走過好幾天：終點先存起來，迴圈的變數不讀 G.day（G.day 會被走的過程改到） */
const days=(k0,k1,st)=>{ const a=D(k0), b=D(k1); for(let d=a;d<=b;d++){ H.G.day=d; H.G.weekday=wdOf(d); walk(0,23.95,st||0.25); } };
const thread=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id&&m.from===id);
const txt=id=>thread(id).map(m=>m.text);
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const said=()=>H.said.map(s=>s.t);
const outQ=id=>OUT.get(H.G,id);
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const go=async(q,picks)=>{ H.said=[]; H.opts=[]; H.cards=[]; H.cgs=[]; H.picks=(picks||[]).slice(); await OUT.go(GM,q); return said(); };
/* 讀稿：企劃線（cool-heisenberg）*/
const REF='origin/claude/cool-heisenberg-o8kuqx';
const repo=[H.ROOT,process.env.V6B_REPO].filter(Boolean);
const git=f=>{ for(const r of repo){ try{ return cp.execSync('git -c core.quotepath=false show "'+REF+':docs/story_planning/'+f+'"',{cwd:r,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){} } return ''; };
const BB119=git('BB_119_多段感情_交接包v6_BB人物.md'), BB165=git('BB_165_AB61_BB五位戀愛線補拍與矛盾.md'), AA258=git('AA_258_回BB198_假期空白_與晚窗口訊息.md'), AA281=git('AA_281_沛珊消失前什麼都不說_台南.md');
const L=typeof V6B!=='undefined'?V6B.L:{};

(async()=>{
/* ======================= 0 ======================= */
await sec('0',async()=>{
  check('0. 新檔 src/v6b_3d.js 載得到、三場事件在 STORY_EVENTS（都是出遊、只演一次）',okNew&&typeof V6B!=='undefined'&&['ev_zhiruo_uk_visit','ev_peishan_first_lesson','ev_ziqing_studio_night'].every(id=>!!ev(id)&&ev(id).trigger==='outing'&&ev(id).once===true),J(loadErr));
  check('0. 其他相依的檔都載得到',!loadErr.length,J(loadErr));
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), a=s=>html.indexOf(s);
  check('0. index.html：v6b_3d.js 接在 aa524_3d.js 後面、GAME.boot() 以前；在 vac3d、msg3d、zr_uk3d、hometown3d、cracktalk3d、rom1016_3d、r2y4b3d 之後',
    /<script src="src\/aa524_3d\.js\?v=[^"]+"><\/script>\n<script src="src\/v6b_3d\.js\?v=[^"]+"><\/script>/.test(html)&&a('src/v6b_3d.js')<a('GAME.boot()')&&['src/vac3d.js','src/msg3d.js','src/zr_uk3d.js','src/hometown3d.js','src/cracktalk3d.js','src/rom1016_3d.js','src/r2y4b3d.js'].every(f=>a(f)>0&&a(f)<a('src/v6b_3d.js')));
  check('0. 讀得到企劃線的 BB_119、BB_165、AA_258、AA_281',BB119.length>1000&&BB165.length>1000&&AA258.length>500&&AA281.length>500);
  const inDoc=(doc,t)=>doc.indexOf(t)>=0, miss=[];
  const W=[['BB_119',BB119,[...(L.zrAsk||['?']),...(L.zrYes||['?']),...(L.zrNo||['?']),L.zrNudge,L.ukTown,L.ukTwo,L.ukAfter,...(L.psAsk||['?']),L.psMiss1,L.psMiss2,L.psNo,L.psNoAfter,...(L.zqAsk||['?']),L.zqMiss,L.zqNo]],
    ['AA_258',AA258,[L.psLine]]];
  for(const [n,doc,arr] of W) for(const t of arr) if(!t||!inDoc(doc,t)) miss.push(n+'：'+t);
  check('0. 台詞逐字在稿裡（BB_119 1c-1、9-2、9-3；AA_258 第 4 節她這學期那一句）',!miss.length,J(miss));
  /* 旁白、照片、按鈕：稿裡是流程句／描述，括號裡的字在稿裡 */
  const inner=t=>String(t||'').replace(/^(📷)?（/u,'').replace(/）$/u,'');
  const m2=[]; for(const [doc,t] of [[BB119,inner(L.ukLast)],[BB119,'她指給你看的書店櫥窗'],[BB119,'兩杯熱可可'],[BB119,'一杯加了濃縮'],[BB119,'雨中的紅磚街'],[BB119,inner(L.psLesson)],[BB119,'試玩新關卡'],[BB119,'回「好」'],[BB119,'回不行'],
    [BB165,'便利貼上一個紅筆笑臉'],[BB165,'「'+((L.rpPhoto||[])[1])+'」']]) if(!t||!inDoc(doc,t)) m2.push(t);
  check('0. 旁白、照片、按鈕的字照稿（1c-1 最後一晚、三張手機照片；3-1、3-3 流程句；9-3「回『好』」「回不行」；BB_165 5-2 便利貼、「今天的」）',!m2.length&&inner(L.ukPhotos&&L.ukPhotos[0])==='她指給你看的書店櫥窗'&&L.yes==='好'&&L.no==='不行',J(m2));
  check('0. 子晴 18:00 那兩句是 AA_262 ZQ5 改過的版本（沒有「欸不是」「這是直述句」）',J(L.zqAsk)===J(['今天晚上九點 來工作室','新關卡要人試玩 你是測試員'])&&BB119.indexOf('「今天晚上九點 來工作室」「新關卡要人試玩 你是測試員」')>=0);
  check('0. 1b-1「考完再說」ev_peishan_wait 作廢（AA_281）：遊戲裡沒有這個事件',AA281.indexOf('`ev_peishan_wait`（「你可以等嗎？」）：作廢')>=0&&!ev('ev_peishan_wait')&&!STORY_EVENTS.some(e=>e&&/peishan_wait$/.test(e.id)));
});

/* ======================= 1 芷若：英國的雨 ======================= */
const ukSet=(key,h,o)=>{ o=o||{}; const G=setup(key,h,{know:[ZR],dh:o.notDating?[]:[ZR],flags:o.flags}); if(o.notDating) H.CLOSE(ZR); return G; };
await sec('1',async()=>{
  /* 1-1 邀約 */
  ukSet('2028-12-18',20.9); rules();
  check('1-1. 12/18 21:00 以前沒有；她在英國（MSG.inUK）',!txt(ZR).some(t=>t===L.zrAsk[0])&&MSG.inUK(H.G,ZR));
  walk(20.95,21.1); const m=byTag(V6B.ASK_TAG);
  check('1-1. 12/18（一）21:00 她私訊「這裡的寒假很冷。雨一直下。」「……你要來嗎？不來也沒關係，真的。」，兩個回覆「我去。」「這個寒假不行。」，回覆到 12/19 18:00',
    J(m.map(x=>x.text))===J(L.zrAsk)&&m[0].day===D('2028-12-18')&&m[0].h===21&&!!m[1].ask&&J(m[1].ask.opts.map(o=>o.t))===J(['我去。','這個寒假不行。'])&&m[1].ask.until===T(D('2028-12-19'),18),J(m.map(x=>[x.text,x.day,x.h,x.ask&&x.ask.until])));
  const r=PHONE.answer(H.G,V6B.ASK_TAG,0); rules(); const q=outQ(V6B.UK_OUT);
  check('1-1. 「我去。」→「……好。那我先排好要看的片。」；ZR_UK_GO yes；排 2029-01-15（一）21:00 出發（去機場 約 1 小時、late 0.5、睡覺快轉停在出發前）',!!r&&J(r.out.map(x=>x.text))===J(['我去。','……好。那我先排好要看的片。'])&&H.G.flags.ZR_UK_GO==='yes'&&!!q&&q.day===D('2029-01-15')&&q.h===21&&q.travel==='去機場 約 1 小時'&&q.travelH===1&&q.late===0.5&&q.alarm===true&&q.ev==='ev_zhiruo_uk_visit',J(q));
  ukSet('2028-12-18',21); rules(); PHONE.tick(H.G); const r2=PHONE.answer(H.G,V6B.ASK_TAG,1); rules();
  check('1-1. 「這個寒假不行。」→「好。那我寄一張下雨的明信片給你。」；ZR_UK_GO no；沒有出遊',!!r2&&J(r2.out.map(x=>x.text))===J(['這個寒假不行。','好。那我寄一張下雨的明信片給你。'])&&H.G.flags.ZR_UK_GO==='no'&&!outQ(V6B.UK_OUT));
  ukSet('2028-12-18',21); rules(); const n0=txt(ZR).length; at('2028-12-19',12.5); rules(); const n1=txt(ZR).length; at('2028-12-19',18.05); rules();
  check('1-1. 沒回：12/19 18:00 算「這個寒假不行」（ZR_UK_GO none）、她不另外回話、沒有出遊；沒有承諾過的不傳 12:00 那一則',H.G.flags.ZR_UK_GO==='none'&&txt(ZR).length===n0&&n1===n0&&!outQ(V6B.UK_OUT)&&!byTag(V6B.NUDGE_TAG).length);
  /* 2-3 承諾過「寒假我去英國找妳。」：12/19 12:00 多一則 */
  ukSet('2028-12-18',21); rules(); if(typeof CRACKTALK!=='undefined'&&CRACKTALK.pr) CRACKTALK.pr(H.G,ZR).commit={kind:'zr_trip',day:D('2028-12-01')}; at('2028-12-19',11.9); rules(); const b=byTag(V6B.NUDGE_TAG).length; at('2028-12-19',12.05); rules();
  check('1-1. 2-3 承諾過要去、還沒回：12/19 12:00 她多傳「機票我先不幫你看。……你回我，我再看。」',b===0&&near(byTag(V6B.NUDGE_TAG),[[L.zrNudge,12]]),J(byTag(V6B.NUDGE_TAG).map(x=>[x.text,x.h])));
  ukSet('2028-12-18',21,{notDating:true}); rules(); check('1-1. 沒和她交往：沒有邀約',!byTag(V6B.ASK_TAG).length);
  ukSet('2028-12-18',21); H.G.flags.romance[ZR].status='paused'; H.G.flags.dating_heroine_02=false; rules(); check('1-1. 挽回中（paused）：沒有邀約',!byTag(V6B.ASK_TAG).length);
  ukSet('2028-12-19',18.5); rules(); check('1-1. 第一次走到已經過了回覆期限（12/19 18:00）：不傳',!byTag(V6B.ASK_TAG).length);
  /* 美國路線：12/18 人在美國（12/23 回來）——照臺灣 21:00（美東比臺灣慢 13 小時＝當地 08:00）*/
  ukSet('2028-12-18',7.5,{flags:{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together',Y4_PATH:'bar'}}); const tzv=STORY.tzOffset(H.G); walk(7.5,8.2);
  const mu=byTag(V6B.ASK_TAG); check('1-1. 美國路線：照臺灣時間 12/18 21:00 傳（遊戲時鐘＝當地 08:00，tzOffset −13）；回覆期限也換算',tzv===-13&&mu.length===2&&mu[0].day===D('2028-12-18')&&Math.abs(mu[0].h-8)<1e-6&&mu[1].ask.until===T(D('2028-12-19'),18)-13,J(mu.map(x=>[x.day,x.h,x.ask&&x.ask.until])));

  /* 1-2 那一趟 */
  CG_REGISTRY.cg_uk_rain_heroine02={file:'x',title:'英國的雨：這次兩張'};
  ukSet('2028-12-18',21); rules(); PHONE.answer(H.G,V6B.ASK_TAG,0); rules();
  check('1-2. 答應了：1/16～1/21 算人在國外（VAC.abroadOn），1/15、1/22 不算',VAC.abroadOn(H.G,D('2029-01-17'))&&VAC.abroadOn(H.G,D('2029-01-21'))&&!VAC.abroadOn(H.G,D('2029-01-15'))&&!VAC.abroadOn(H.G,D('2029-01-22')));
  at('2029-01-15',19.8); const due=OUT.due(H.G);
  /* 記下台詞說出來的那一刻（日子、時刻、時差）*/
  const sayWas=GM.say, when={}; GM.say=async(who,t)=>{ when[t]=[H.G.day,+H.G.hour.toFixed(2),STORY.tzOffset(H.G)]; return sayWas(who,t); };
  let s=[]; try{ s=await go(due,[]); } finally { GM.say=sayWas; }
  const want=[L.ukTown,...L.ukPhotos,L.ukLast,L.ukTwo,L.ukAfter];
  check('1-2. 19:45 起問出發；那一趟照順序：「英國的一座小城。雨一直下。」、三張手機照片、（老戲院門口）、「這次，兩張是本來就買的。」、散場後「這間只有六十個位子。……我以後的，要再小一點。」',
    !!due&&due.id===V6B.UK_OUT&&J(s.filter(t=>want.includes(t)))===J(want),J(s));
  check('1-2. 到英國那天 1/16、最後一晚 1/20（六）19:30 英國時間（遊戲時鐘換當地，時差 −8）；散場後 21:30',
    !!when[L.ukTown]&&when[L.ukTown][0]===D('2029-01-16')&&when[L.ukTown][2]===-8&&J(when[L.ukTwo])===J([D('2029-01-20'),19.5,-8])&&J(when[L.ukAfter])===J([D('2029-01-20'),21.5,-8]),J(when));
  check('1-2. BCG-25（cg_uk_rain_heroine02）放在「這次，兩張是本來就買的。」那一句；日期卡 1/16（二）、1/20（六）、地點「英國」',
    J(H.cgs)===J(['cg_uk_rain_heroine02'])&&H.cards.some(c=>c[0]==='1/16（二）'&&c[1]==='英國')&&H.cards.some(c=>c[0]==='1/20（六）'&&c[1]==='英國'),J({cg:H.cgs,cards:H.cards}));
  const F=H.G.flags;
  check('1-2. 演完：1/22（一）早上回到臺北（08:30、時鐘換回臺灣）；記憶 UK_VISIT、ZR_UK_VISIT、ZR_UK_TRIP done；出遊 done',
    H.G.day===D('2029-01-22')&&Math.abs(H.G.hour-8.5)<1e-6&&STORY.tzOffset(H.G)===0&&!VAC.clock(H.G)&&SOCIAL.has(ZR,'UK_VISIT')&&F.ZR_UK_VISIT===true&&F.ZR_UK_TRIP==='done'&&outQ(V6B.UK_OUT).state==='done',J({d:keyOf(H.G.day),h:H.G.hour,clock:VAC.clock(H.G),t:F.ZR_UK_TRIP}));
  check('1-2. 途中她在英國的每週視訊（1/21 週日）不打、也沒有「沒接」',!outQ('zruk_w_2029-01-21')&&!byTag('zruk_w_miss_2029-01-21').length);
  at('2029-01-28',21); rules(); check('1-2. 對照：回來以後的週日（1/28）照常約視訊',!!outQ('zruk_w_2029-01-28'));
  /* 2-3 修補承諾：去過＝做到（cracktalk3d.js 寒假結束 2/19 判斷）*/
  if(typeof CRACKTALK!=='undefined'&&CRACKTALK.pr&&CRACKTALK.commit){ const r0=CRACKTALK.pr(H.G,ZR); r0.commit={kind:'zr_trip',day:D('2028-12-10')}; r0.kept=0; at('2029-02-19',10); CRACKTALK.commit(H.G,ZR);
    check('1-2. 2-3 承諾過「寒假我去英國找妳。」、去了：寒假結束（2/19）算做到、還在交往',H.G.flags.dating_heroine_02===true&&r0.commit==null&&r0.kept===1); }
  else check('1-2. 2-3 修補承諾（CRACKTALK 沒載到）',false);
  /* 1-3 沒去 */
  ukSet('2028-12-18',21); rules(); PHONE.answer(H.G,V6B.ASK_TAG,0); rules(); at('2029-01-15',21.6); expire();
  check('1-3. 答應了沒出發（21:30 以後）：ZR_UK_TRIP missed、沒有 UK_VISIT、那幾天不算在國外',H.G.flags.ZR_UK_TRIP==='missed'&&!SOCIAL.has(ZR,'UK_VISIT')&&!H.G.flags.ZR_UK_VISIT&&!VAC.abroadOn(H.G,D('2029-01-17')));
  /* 1-4 2-3 談話的「寒假我去英國找妳。」（CT_ZR_TRIP_OK）*/
  const ok=(k,go)=>{ ukSet(k,10,{flags:go?{ZR_UK_GO:go}:{}}); CRACKTALK.prep(H.G,ZR); return !!H.G.flags.CT_ZR_TRIP_OK; };
  check('1-4. 「寒假我去英國找妳。」：這一趟在遊戲裡以後出現（12/10 談話＝有）；回了「我去。」＝12/20 也有；12/20 已經回「不行」或沒回（期限過了）＝沒有',
    typeof CRACKTALK!=='undefined'&&ok('2028-12-10')===true&&ok('2028-12-20','yes')===true&&ok('2028-12-20','no')===false&&ok('2028-12-20','none')===false&&ok('2028-12-20')===false);
});

/* ======================= 2 沛珊 5-2 剩下的兩樣 ======================= */
await sec('2',async()=>{
  const psSet=(key,h,flags)=>{ const G=setup(key,h,{know:[PS],dh:[PS],flags:Object.assign({PS_RECONNECT:true},flags||{})}); return G; };
  /* 短版：視訊 */
  psSet('2028-11-20',21.2,{PS_RED_PEN_SHORT:D('2028-11-17')}); const vo=HV.videoOffer(H.G,PS); H.said=[]; await HV.video(GM,PS); const s=said();
  const SHORT=ROM1016_EVENTS.RED_PEN_SHORT.map(x=>x.text||x.narr);
  check('2-1. 5-2 沒到以後，下一次是交往中的視訊（她在台南）：演短版「這裡你寫得特別快。」到畫笑臉那四句、記 PS_RED_PEN（短版的記號清掉）',!!vo&&vo.ok&&s.filter(t=>SHORT.includes(t)).length===4&&J(s.filter(t=>SHORT.includes(t)))===J(SHORT)&&H.G.flags.PS_RED_PEN===true&&H.G.flags.PS_RED_PEN_SHORT==null,J(s));
  psSet('2028-11-17',21.2,{PS_RED_PEN_SHORT:D('2028-11-17')}); H.said=[]; await HV.video(GM,PS); check('2-1. 沒到的那一天晚上視訊：不演（要之後的下一次）',!said().some(t=>SHORT.includes(t))&&!H.G.flags.PS_RED_PEN);
  psSet('2028-11-20',21.2,{}); H.said=[]; await HV.video(GM,PS); check('2-1. 沒有 5-2 沒到的記號：視訊照舊、不演短版',!said().some(t=>SHORT.includes(t)));
  psSet('2028-11-20',21.2,{PS_RED_PEN_SHORT:D('2028-11-17')}); H.said=[]; await HV.video(GM,PS); H.said=[]; at('2028-11-24',21.3); await HV.video(GM,PS); check('2-1. 只演一次（再視訊沒有）',!said().some(t=>SHORT.includes(t)));
  /* 摘要日的照片 */
  const dp=STORY.DAILY_PHONE.find(x=>x.id===V6B.RP_ID);
  psSet('2028-11-20',10,{PS_RED_PEN:true}); const t1=STORY.dpTerm(H.G);
  check('2-2. 每天的手機小事多一則：大四上、大四下的學期中；交往中、PS_RECONNECT、PS_RED_PEN 以後才成立；23:10；「📷（便利貼上一個紅筆笑臉）」「今天的」',
    !!dp&&dp.term(t1)&&dp.term({id:'Y4S2',week:5})&&!dp.term({id:'Y3S2',week:5})&&dp.ok(H.G,H.G.day)&&Math.abs(dp.h(H.G)-(23+10/60))<1e-6&&J(dp.items(H.G,0).map(x=>x.text))===J(['📷（便利貼上一個紅筆笑臉）','今天的']));
  psSet('2028-11-20',10,{}); check('2-2. 還沒有紅筆（5-2 沒演、短版也沒演）：不成立',!dp.ok(H.G,H.G.day));
  setup('2028-11-20',10,{know:[PS],flags:{PS_RED_PEN:true,PS_RECONNECT:true}}); check('2-2. 沒在交往：不成立',!dp.ok(H.G,H.G.day));
  /* 真的跑每天的手機小事：別的小事先排滿（只看這一則）*/
  psSet('2028-11-20',8,{PS_RED_PEN:true}); const F=H.G.flags; F.dpN={}; for(const d of STORY.DAILY_PHONE) if(d.id!==V6B.RP_ID) F.dpN[d.id]=999;
  walk(8,22.9,0.25); walk(23,23.5,1/120); const p1=thread(PS).filter(m=>/^dp_v6b_ps_redpen_/.test(m.tag||''));
  check('2-2. 每天的手機小事真的發：11/20 23:10 照片、23:11「今天的」',p1.length===2&&p1.every(m=>m.day===D('2028-11-20'))&&near(p1,[['📷（便利貼上一個紅筆笑臉）',23+10/60],['今天的',23+11/60]])&&p1[0].h<p1[1].h,J(p1.map(m=>[m.text,keyOf(m.day),m.h])));
  days('2028-11-28','2028-11-30'); const p2=thread(PS).filter(m=>/^dp_v6b_ps_redpen_/.test(m.tag||''));
  check('2-2. 同一個月不再發（11/28～11/30）',p2.length===2);
  days('2028-12-04','2028-12-04'); const p3=thread(PS).filter(m=>/^dp_v6b_ps_redpen_/.test(m.tag||''));
  check('2-2. 下個月（12/4）再發一次',p3.length===4&&p3[2].day===D('2028-12-04'));
  /* 5-1 PS_WAITED 尾聲那一句（BB_165 5-1；原本就有，postgrad3d.js）*/
  H.fresh('2029-07-01',20,'cafe',{}); H.G.flags.dating_classmate_peishan=true; const e0=PG.epiLine(H.G,PS); H.G.flags.PS_WAITED=true; const e1=PG.epiLine(H.G,PS);
  check('2-3. 5-1 PS_WAITED 尾聲多一句「我現在上課，學生問問題，我都會先等一下。」（原本就在 postgrad3d.js）',J(e1)===J(e0.concat([[PS,'我現在上課，學生問問題，我都會先等一下。']])));
});

/* ======================= 3 沛珊：她的第一堂試教 ======================= */
await sec('3',async()=>{
  const TW={EXCHANGE_ROUTE:'TW'};
  const psSet=(key,h,o)=>{ o=o||{}; return setup(key,h,{know:o.know||[PS],lv:o.lv,dh:o.dh,noContact:o.noContact,flags:Object.assign({},TW,o.re===false?{}:{PS_RECONNECT:true},o.flags||{})}); };
  psSet('2028-11-07',20.9); rules(); const a0=byTag(V6B.PSL_ASK).length; walk(20.95,21.1); const m=byTag(V6B.PSL_ASK);
  check('3-1. 11/7（二）21:00 以前沒有；21:00 她私訊「明天傍晚六點半，我第一次站上講台。課輔班。」「……下課以後，可以陪我走去小公園嗎？」；回覆「好」「不行」到 11/8 18:00；她那天在台南',
    a0===0&&J(m.map(x=>x.text))===J(L.psAsk)&&m[0].day===D('2028-11-07')&&m[0].h===21&&J(m[1].ask.opts.map(o=>o.t))===J(['好','不行'])&&m[1].ask.until===T(D('2028-11-08'),18)&&DATE.whereOn(H.G,PS,D('2028-11-08')).city==='台南',J(m.map(x=>[x.text,x.h])));
  PHONE.answer(H.G,V6B.PSL_ASK,0); rules(); const q=outQ(V6B.PSL_OUT);
  check('3-1. 回「好」：排 11/8（三）19:30 去台南（高鐵、18:00 以前要出發＝19:45 前到）',H.G.flags.PS_FIRST_LESSON_GO==='yes'&&!!q&&q.day===D('2028-11-08')&&q.h===19.5&&q.place==='台南'&&q.travel===HOMETOWN_LINES['classmate_peishan@台南'].travel&&Math.abs(q.late-(-1.5))<1e-9&&q.ev==='ev_peishan_first_lesson',J(q));
  at('2028-11-08',17.4); const d0=OUT.due(H.G); at('2028-11-08',17.6); const d1=OUT.due(H.G);
  const m0=H.G.money, c0=(typeof DATE!=='undefined'&&DATE.log)?(DATE.log(H.G,PS).count|0):0; const s=await go(d1,[]);
  check('3-1. 17:30 起問出發；那一場：（她第一次站上課輔班的講台試教。）→ 沛珊「有一個小朋友舉了六次手。……這次我有看到他。」；沒有告白（沒有「奇怪的問題」）',
    !d0&&!!d1&&J(s.filter(t=>[L.psLesson,L.psLine].includes(t)))===J([L.psLesson,L.psLine])&&!s.some(t=>/奇怪的問題|重新認識/.test(t))&&H.G.flags.PS_FIRST_LESSON==='met',J(s));
  check('3-1. 去台南：高鐵票扣 '+HOMETOWN_LINES['classmate_peishan@台南'].fare+'、那一天算一次正式校外約會（AA_349 K3）、回到臺北',m0-H.G.money===HOMETOWN_LINES['classmate_peishan@台南'].fare&&(DATE.log(H.G,PS).count|0)===c0+1&&outQ(V6B.PSL_OUT).state==='done',J({m:m0-H.G.money,c:DATE.log(H.G,PS).count}));
  /* 沒到 */
  psSet('2028-11-07',21); rules(); PHONE.answer(H.G,V6B.PSL_ASK,0); rules(); at('2028-11-08',18.1); expire(); walk(18.1,21,0.1);
  check('3-2. 回「好」但沒出發（18:00 以後）：19:45「下課了。……他們都有舉手。」、20:30「我自己走了一圈。第一堂課，下次再跟你說。」；PS_FIRST_LESSON missed',
    H.G.flags.PS_FIRST_LESSON==='missed'&&near(thread(PS).filter(x=>/^v6b_ps_lesson_miss/.test(x.tag)),[[L.psMiss1,19.75],[L.psMiss2,20.5]]),J(thread(PS).map(x=>[x.text,x.h])));
  psSet('2028-11-07',21); rules(); const r=PHONE.answer(H.G,V6B.PSL_ASK,1); walk(21,23); at('2028-11-08',19.9); rules(); const a1=byTag('v6b_ps_lesson_after').length; at('2028-11-08',20.05); rules();
  check('3-3. 回「不行」：她回「好。那我下課再跟你說。」，11/8 20:00「他們都有舉手。」；沒有出遊',!!r&&J(r.out.map(x=>x.text))===J(['不行',L.psNo])&&a1===0&&near(byTag('v6b_ps_lesson_after'),[[L.psNoAfter,20]])&&!outQ(V6B.PSL_OUT)&&H.G.flags.PS_FIRST_LESSON==='no');
  psSet('2028-11-07',21); rules(); at('2028-11-08',17.9); rules(); const b0=txt(PS).length; at('2028-11-08',18.05); rules(); at('2028-11-08',20.05); rules();
  check('3-4. 沒回：11/8 18:00 她回「好。那我下課再跟你說。」、20:00「他們都有舉手。」',J(txt(PS).slice(b0))===J([L.psNo,L.psNoAfter])&&H.G.flags.PS_FIRST_LESSON_GO==='none');
  const none=(o,f)=>{ psSet('2028-11-07',21,o); if(f) f(H.G); rules(); return !byTag(V6B.PSL_ASK).length; };
  check('3-5. 給誰：美國路線（人在美國）、和她交往中、前任、放榜後沒重新聯絡上、只到有點熟、沒有聯絡方式——都沒有',
    none({flags:{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together'}})&&none({dh:[PS]})&&none({flags:{EX_classmate_peishan:true}})&&none({re:false})&&none({lv:'fam'})&&none({noContact:true}));
  check('3-5. 日本路線（大四上在臺灣）照台灣路線',!none({flags:{EXCHANGE_ROUTE:'JP'}}));
  psSet('2028-11-08',18.5); rules(); check('3-5. 第一次走到已經過了 11/8 18:00：不傳',!byTag(V6B.PSL_ASK).length);
  psSet('2028-11-07',21); rules(); PHONE.answer(H.G,V6B.PSL_ASK,0); rules(); at('2028-11-08',17.6); await go(OUT.due(H.G),[]); at('2028-11-09',12); rules();
  check('3-5. 只一次（演過以後不再排、不再傳）',byTag(V6B.PSL_ASK).length===2&&OUT.rec(H.G).filter(x=>x.ev==='ev_peishan_first_lesson').length===1);
});

/* ======================= 4 子晴：工作室的深夜 ======================= */
await sec('4',async()=>{
  const zqSet=(key,h,o)=>{ o=o||{}; return setup(key,h,{know:[ZQ],lv:o.lv,dh:o.dh,noContact:o.noContact,flags:Object.assign({EXCHANGE_ROUTE:'TW',ZQ_CONTRACT:'lawyer'},o.flags||{})}); };
  zqSet('2028-11-10',17.9); rules(); const a0=byTag(V6B.ZQS_ASK).length; walk(17.95,18.1); const m=byTag(V6B.ZQS_ASK);
  check('4-1. 11/10（五）18:00 以前沒有；18:00 她私訊「今天晚上九點 來工作室」「新關卡要人試玩 你是測試員」；回覆「好」「不行」到 20:30',
    a0===0&&J(m.map(x=>x.text))===J(L.zqAsk)&&m[0].h===18&&J(m[1].ask.opts.map(o=>o.t))===J(['好','不行'])&&m[1].ask.until===T(D('2028-11-10'),20.5),J(m.map(x=>[x.text,x.h])));
  PHONE.answer(H.G,V6B.ZQS_ASK,0); rules(); const q=outQ(V6B.ZQS_OUT);
  check('4-1. 回「好」：排 21:00 子晴的工作室（捷運＋公車 約 30 分鐘、late 0.25）',H.G.flags.ZQ_STUDIO_GO==='yes'&&!!q&&q.day===D('2028-11-10')&&q.h===21&&q.place==='子晴的工作室'&&q.travelH===0.5&&q.late===0.25,J(q));
  at('2028-11-10',20.3); const s=await go(OUT.due(H.G),[]);
  check('4-1. 那一場：（她請你試玩新關卡。）；沒有告白（沒有「欸不是……你認真的？」）；ZQ_STUDIO met；背景 ziqing_studio（沒有圖＝深色底）',
    s.includes(L.zqPlay)&&!s.some(t=>/你認真的|回答\.exe/.test(t))&&H.G.flags.ZQ_STUDIO==='met'&&outQ(V6B.ZQS_OUT).state==='done',J(s));
  zqSet('2028-11-10',18); rules(); PHONE.answer(H.G,V6B.ZQS_ASK,0); rules(); at('2028-11-10',21.3); expire(); walk(21.3,22,0.1);
  check('4-2. 回「好」但沒到（21:15 以後不能出發）：21:30「我自己測了。……第三關還是太難。」；ZQ_STUDIO missed',H.G.flags.ZQ_STUDIO==='missed'&&near(byTag('v6b_zq_studio_miss'),[[L.zqMiss,21.5]]));
  zqSet('2028-11-10',18); rules(); const r=PHONE.answer(H.G,V6B.ZQS_ASK,1); rules();
  check('4-3. 回「不行」：她回「好 那我自己測」；沒有出遊',!!r&&J(r.out.map(x=>x.text))===J(['不行',L.zqNo])&&!outQ(V6B.ZQS_OUT)&&H.G.flags.ZQ_STUDIO==='no');
  zqSet('2028-11-10',18); rules(); const b0=txt(ZQ).length; at('2028-11-10',20.55); rules();
  check('4-4. 沒回：20:30 她回「好 那我自己測」',J(txt(ZQ).slice(b0))===J([L.zqNo])&&H.G.flags.ZQ_STUDIO_GO==='none');
  const none=(o)=>{ zqSet('2028-11-10',18,o); rules(); return !byTag(V6B.ZQS_ASK).length; };
  check('4-5. 給誰：Q15 發生過（ZQ_Q15）、Q14 沒回（沒有 ZQ_CONTRACT）、和她交往中、前任、她和芷若在一起（ZZ dating）、美國路線、只到有點熟、沒有聯絡方式——都沒有',
    none({flags:{ZQ_Q15:{day:D('2028-06-10'),k:'first_player'}}})&&none({flags:{ZQ_CONTRACT:null}})&&none({dh:[ZQ]})&&none({flags:{EX_heroine_04:true}})&&none({flags:{ZZ:{state:'dating'}}})
    &&none({flags:{EXCHANGE_ROUTE:'US',EXCH_RULE:1,US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02'),US1:'together'}})&&none({lv:'fam'})&&none({noContact:true}));
  check('4-5. 日本路線照台灣路線',!none({flags:{EXCHANGE_ROUTE:'JP'}}));
});
H.done();
})();
function T(d,h){ return d*24+h; }
