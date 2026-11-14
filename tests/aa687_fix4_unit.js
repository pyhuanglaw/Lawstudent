// AA687-FIX4-1104：AA_687 回 LAWWW-C「AA_686＋AA_685 D 節合併（開發分支 2a3b6434e）以後要 AA 定的七件」（企劃線 d41750385，AA-C 定 D109）。不需要瀏覽器。
//   1、2  語彤期末飯（朋友那一則）的邀約換字：y1s1 照留；gen「考完了。禮拜六下班以後，要吃飯嗎。」；Y1S2 那一欄拿掉（用 gen）；Y2S1～Y4S1 照稿（每一句都從 AA_687 的表直接讀）
//   3     那一頓 18:00（原本 17:30；小路 18:00 才開）
//   4     小路的開場、收尾旁白（稿逐字）；背景照現在：十二月 teishoku_night、六月 3D 的小路（S.komichiStage）
//   5     邀約照心意邀約的規則（AA_684 第 6 項）：玩家最後一科考完的那天 20:30 發、飯在那天以後的第一個週六 18:00——週五考完＝隔天週六（大二下 2027-06-12、大四上 2028-12-23）
//   6     平日旅行訊息玩家能回的：寒假「淡水冷嗎？」、暑假「淡水熱嗎？」；「好好休息。」兩個都有（寒假、暑假照那一天：HOME.breakOf）
//   7     平日新的三則排前面照舊；過年茶屋休息那幾天的輪流也用平日那一組（新的三則＋不講店裡的那兩則，不管星期幾）；shut 的 first、pool、back、rep 照舊
//   另外  心意邀約（一盞茶屋 17:30）、交往中那一則（打烊以後 20:30）不動；舊存檔：已經排好的那一頓照排好的時間、已經傳來的邀約不動、讀檔不會出錯
// 修改前（39c9d8b5c）：38 項 FAILED 21（1～7 每一項都有 FAIL）；修改後 ALL PASS（全套 999 支 *_unit.js 也全過）；用法：node tests/aa687_fix4_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify, YT='heroine_03', AN='heroine_01';
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
GM.toast=()=>{}; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const DK=k=>STORY.dayOfKey(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WD=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:DK(k); H.G.day=d; H.G.hour=h; H.G.weekday=WD(d); };
const fresh=(k,h,zone,flags)=>{ H.fresh(typeof k==='number'?'2025-09-01':k,h,zone,flags); if(typeof k==='number') at(k,h); return H.G; };
const run=(h0,h1,st)=>{ st=st||0.05; for(let h=h0;h<=h1+1e-9;h+=st){ H.G.hour=+h.toFixed(3); STORY.phoneRules(GM); PHONE.tick(H.G); } };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
/* 企劃稿、舊版的檔直接讀（spawnSync：不經 tests/alison.js 的換字表）*/
const gshow=(sha,p)=>{ const r=cp.spawnSync('git',['-C',H.ROOT,'show',sha+':'+p],{encoding:'utf8',maxBuffer:32<<20}); return r.status===0?r.stdout:''; };
const AA687=gshow('d41750385','docs/story_planning/AA_687_回LAWWW_AA686合併後七件.md'), in687=t=>!!AA687&&AA687.includes(t);
/* AA_687 第 1、2 項的表：| 欄 | 現在 | 改成 | */
const ROWS={}; for(const l of AA687.split('\n')){ const m=l.match(/^\| (y1s1|gen|Y\dS\d) \| (.*?) \| (.*?) \|\s*$/); if(m) ROWS[m[1]]={now:m[2],to:m[3]}; }
const NARR=(()=>{ const m=AA687.match(/^- 開場：(.+)$/m), c=AA687.match(/^- 收尾：(.+)$/m); return {open:m?m[1].trim():null,close:c?c[1].trim():null}; })();
const TERMS=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'], LATER=['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'];
const outOf=id=>OUT.get(H.G,id), dayH=q=>q?[K(q.day),WD(q.day),q.h]:null;
const tagOf=term=>'te_'+term+'_'+YT;
/* 這學期語彤是朋友的邀約（不是心意）：常接觸 9 分、FAMILIAR 以上 */
const setupTerm=(term,ids)=>{ const w=TERMEND.windowOf(term); fresh(w.from,9,'campus',{}); H.G.stage='law'; const C={}; for(const id of (ids||[YT])){ H.rel(id,30,10,5); C[id]={pts:9,k:{}}; } H.G.termend={contact:{[term]:C},think:{}}; const P=TERMEND.plan(H.G,w); return {w,P}; };
/* 走到她那一則傳來（每一天 19:54～21:30 跑手機規則）：回傳那一則 */
const walkInvite=(term,w)=>{ let m=null; for(let d=w.from;d<=w.to&&!m;d++){ at(d,19.9); run(19.9,21.5); m=PHONE.byAsk(H.G,tagOf(term)); } return m; };
/* 排好的（PHONE.at 進了佇列、還沒到）＋已經到的 */
const sched=th=>{ const o=[]; for(const m of (H.G.msgs||[])) if(m.th===th) o.push({day:m.day,h:m.h,tag:m.tag||'',t:m.text,ask:m.ask?m.ask.opts.map(x=>x.t):null}); for(const q of PHONE.rec(H.G).q) for(const x of (q.items||[])) if(x.th===th) o.push({day:q.day,h:q.h,tag:q.tag||'',t:x.text,ask:x.ask?x.ask.opts.map(y=>y.t):null}); return o; };
const P3=()=>VAC_DATA.TRIP_MSG.gf.heroine_03;
/* 交往中的語彤在玩家出國那幾天傳的（sd 出發、ed 回來；season＝這一趟的 A.season）*/
const ytTrip=(sdK,edK,season)=>{ fresh(sdK,7,'dorm',{dating_heroine_03:true}); H.CLOSE(YT);
  const I={key:'T687',A:{id:'T687',place:{kind:'abroad'},season,trip:{sd:DK(sdK),ed:DK(edK),start:{h:8},end:{h:18}}},yk:null}; VAC.tripMsgs(H.G,I); return sched('p:heroine_03'); };
const pool=L=>L.filter(x=>/_p\d+$/.test(x.tag));
const byDay=L=>{ const o={}; for(const x of L) (o[K(x.day)]=o[K(x.day)]||[]).push(x.t); return o; };
const askBy=L=>{ const o={}; for(const x of pool(L)) if(x.ask) o[K(x.day)]=x.ask; return o; };
const WE=d=>[0,6].includes(WD(d));
const hookFor0=TERMEND.hookFor;
/* 舊版（39c9d8b5c）和現在的 termend_lines.js 各自單獨跑一次（不用遊戲裡那一份：postgrad3d.js 載入時會在 HEART／GF 加 Y4S2 的 over）：比對心意、交往中那兩則沒有動 */
const ser=o=>JSON.stringify(o,(k,v)=>typeof v==='function'?'fn:'+String(v):v);
const evalTL=s=>{ if(!s) return null; const ctx={console}; try{ vm.runInNewContext(s.replace(/^const TERMEND_LINES\s*=/m,'this.TERMEND_LINES='),ctx); }catch(e){ return null; } return ctx.TERMEND_LINES||null; };
const BASE=evalTL(gshow('39c9d8b5c','src/data/termend_lines.js')), CUR=evalTL(fs.readFileSync(path.join(H.ROOT,'src/data/termend_lines.js'),'utf8'));

(async()=>{
await sec(0,()=>{ check('0. 載得到 TERMEND、VAC、NOODLE_CLOSED、HOME；AA_687（d41750385）讀得到：表 8 列、開場收尾兩句；舊版 termend_lines.js（39c9d8b5c）讀得到',
  typeof TERMEND!=='undefined'&&typeof VAC!=='undefined'&&typeof NOODLE_CLOSED!=='undefined'&&typeof HOME!=='undefined'&&!!HOME.breakOf&&Object.keys(ROWS).length===8&&!!NARR.open&&!!NARR.close&&!!BASE&&!!CUR,J({rows:Object.keys(ROWS),NARR,base:!!BASE,cur:!!CUR})); });

/* ---------- 1、2 邀約的字 ---------- */
await sec('1',()=>{
  const f=TERMEND_LINES.FRIEND[YT];
  check('1. y1s1 照留：「'+(ROWS.y1s1||{}).now+'」（稿「照留」）',!!ROWS.y1s1&&ROWS.y1s1.to==='照留'&&f.y1s1===ROWS.y1s1.now,J([f.y1s1,ROWS.y1s1]));
  check('1. gen 換成稿的「改成」：「'+(ROWS.gen||{}).to+'」（原本「'+(ROWS.gen||{}).now+'」）',!!ROWS.gen&&f.gen===ROWS.gen.to&&f.gen==='考完了。禮拜六下班以後，要吃飯嗎。',J(f.gen));
  { const P87=gshow('1881111f2','docs/story_planning/AA_687_回LAWWW_AA686合併後七件.md'), L87='考完了。我十八號還有雙主修的筆試。考完那個禮拜六，下班以後吃飯嗎。', y=f.genByTerm&&f.genByTerm.Y1S2;
    check('1. Y1S2（AA_687 補 1881111f2 加回來）：邀約那天在 6/18 以前＝「'+L87+'」、6/18 以後（筆試考完了）＝gen',!!P87&&P87.includes(L87)&&P87.includes('用 gen')&&typeof y==='function'&&y(H.G,DK('2026-06-11'))===L87&&y(H.G,DK('2026-06-17'))===L87&&y(H.G,DK('2026-06-18'))===f.gen&&y(H.G,DK('2026-06-19'))===f.gen,J([typeof y,typeof y==='function'?[y(H.G,DK('2026-06-11')),y(H.G,DK('2026-06-18'))]:y])); }
  const bad=LATER.filter(t=>!ROWS[t]||f.genByTerm[t]!==ROWS[t].to);
  check('2. Y2S1～Y4S1 一字不差照稿的「改成」（五句，Y2S1 是「小路，我想吃那裡的玉子燒。」那一句；Y1S2 是 AA_687 補的函式）',!bad.length&&Object.keys(f.genByTerm).filter(k=>k!=='Y1S2').sort().join()===LATER.join()&&f.genByTerm.Y2S1==='考完了。禮拜六我五點下班。小路，我想吃那裡的玉子燒。',J(bad.map(t=>[t,f.genByTerm[t],ROWS[t]&&ROWS[t].to])));
  const s=J(f), old=['gen','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'].map(k=>ROWS[k]&&ROWS[k].now).filter(Boolean);
  check('1、2. 舊的七句（禮拜四、禮拜五、秀琴姨說要煮火鍋、我煮…）都不在資料裡',old.length===7&&!old.some(t=>s.includes(t)),J(old.filter(t=>s.includes(t))));
  check('1、2. 心意邀約（第 64 行，一盞茶屋 17:30）、交往中那一則（第 179 行，打烊以後 20:30）、茶屋的 PLACE.tea_closed 沒有動（和 39c9d8b5c 一字不差）',
    !!BASE&&!!CUR&&ser(BASE.HEART[YT])===ser(CUR.HEART[YT])&&ser(BASE.GF[YT])===ser(CUR.GF[YT])&&ser(BASE.PLACE.tea_closed)===ser(CUR.PLACE.tea_closed)
    &&TERMEND_LINES.HEART[YT].h===17.5&&TERMEND_LINES.HEART[YT].place==='tea_closed'&&TERMEND_LINES.GF[YT].h===20.5&&TERMEND_LINES.GF[YT].invite==='打烊以後。我泡茶。');
});

/* ---------- 1、2、3、5 每一學期實際走一次：傳來的字、那一天幾點、答應以後排在哪裡 ---------- */
const EXP={Y1S1:['2025-12-18','2025-12-20'],Y1S2:['2026-06-11','2026-06-20'],Y2S1:['2026-12-24','2026-12-26'],Y2S2:['2027-06-11','2027-06-12'],Y3S1:['2027-12-23','2027-12-25'],Y3S2:['2028-06-08','2028-06-10'],Y4S1:['2028-12-22','2028-12-23']};
const R={};
await sec('5',()=>{
  for(const term of TERMS){ const {w,P}=setupTerm(term); const ex=TERMEND.examDay(H.G,w);
    /* 考完那天 20:25 以前還沒傳 */
    at(ex,19.9); run(19.9,20.42); const early=!!PHONE.byAsk(H.G,tagOf(term));
    const m=walkInvite(term,w); let q=null; if(m){ PHONE.answer(H.G,tagOf(term),0); rules(); q=outOf('te_'+term); }
    R[term]={friend:P.friend.includes(YT),exempt:J(P.exempt),exam:K(ex),examWd:WD(ex),back:K(P.back),early,sent:m?[K(m.day),WD(m.day),m.h]:null,text:m&&m.text,dinner:dayH(q),place:q&&q.place}; }
  const want=t=>t==='Y1S1'?ROWS.y1s1.now:(t==='Y1S2'?'考完了。我十八號還有雙主修的筆試。考完那個禮拜六，下班以後吃飯嗎。':ROWS[t].to);   /* Y1S2：AA_687 補 1881111f2（6/11 傳＝6/18 以前那一句）*/
  check('1、2. 每一學期她傳來的那一句：大一上 y1s1、大一下 AA_687 補的那一句（6/11 傳）、大二上～大四上照稿',TERMS.every(t=>R[t].text===want(t)),J(TERMS.map(t=>[t,R[t].text])));
  check('5. 這學期語彤是朋友的邀約、不佔名額的只有心意那一則（exempt 是空的：朋友那一則照舊佔「只能接一個」）',TERMS.every(t=>R[t].friend&&R[t].exempt==='[]'),J(TERMS.map(t=>[t,R[t].friend,R[t].exempt])));
  check('5. 邀約在玩家最後一科考完的那天 20:30 傳（照心意邀約的規則；20:25 以前還沒有）',TERMS.every(t=>!!R[t].sent&&R[t].sent[0]===R[t].exam&&R[t].sent[2]>=20.5&&R[t].sent[2]<21&&!R[t].early)&&in687('**最後一科考完的那天 20:30 發**'),J(TERMS.map(t=>[t,R[t].exam,R[t].sent,R[t].early])));
  check('5. 週五考完的學期：大二下 6/11（五）20:30 傳 → 6/12（六）18:00；大四上 12/22（五）20:30 傳 → 12/23（六）18:00（稿「週五考完＝隔天週六（大二下 2027-06-12、大四上 2028-12-23）」；原本隔天 20:30 才傳、飯排到下一個週六 6/19、12/30）',
    R.Y2S2.examWd===5&&R.Y4S1.examWd===5&&J(R.Y2S2.sent.slice(0,2))===J(['2027-06-11',5])&&J(R.Y2S2.dinner)===J(['2027-06-12',6,18])&&J(R.Y4S1.sent.slice(0,2))===J(['2028-12-22',5])&&J(R.Y4S1.dinner)===J(['2028-12-23',6,18])&&in687('週五考完＝隔天週六（大二下 2027-06-12、大四上 2028-12-23）'),J([R.Y2S2,R.Y4S1]));
  check('5. 週四考完的學期：考完那天（週四）20:30 傳、飯在那天以後的第一個週六——大一上 12/20、大二上 12/26、大三上 12/25、大三下 6/10',
    ['Y1S1','Y2S1','Y3S1','Y3S2'].every(t=>R[t].examWd===4&&J(R[t].dinner)===J([EXP[t][1],6,18])),J(['Y1S1','Y2S1','Y3S1','Y3S2'].map(t=>[t,R[t].exam,R[t].dinner])));
  check('5. 大一下：6/11（四）20:30 傳；她 6/18 雙主修筆試以前不來（AA_250 第 2 節，照舊）＝6/18 以後的第一個週六 6/20（稿：「和週六的飯不衝突了」）',J(R.Y1S2.sent.slice(0,2))===J(['2026-06-11',4])&&J(R.Y1S2.dinner)===J(['2026-06-20',6,18])&&in687('她 6/18 的雙主修筆試和週六的飯不衝突了'),J(R.Y1S2));
  check('5. 全部學期（傳的那天、飯的那天）：'+TERMS.map(t=>t+' '+EXP[t][0]+'→'+EXP[t][1]).join('、'),TERMS.every(t=>!!R[t].sent&&R[t].sent[0]===EXP[t][0]&&!!R[t].dinner&&R[t].dinner[0]===EXP[t][1]),J(TERMS.map(t=>[t,R[t].sent&&R[t].sent[0],R[t].dinner&&R[t].dinner[0]])));
  check('3. 那一頓 18:00（原本 17:30；稿「改成 **18:00**」）、溫州街・小路、週六；資料 h 18、examDay',TERMS.every(t=>!!R[t].dinner&&R[t].dinner[1]===6&&R[t].dinner[2]===18&&R[t].place==='溫州街・小路')&&TERMEND_LINES.FRIEND[YT].h===18&&TERMEND_LINES.FRIEND[YT].examDay===true&&TERMEND.dinnerH('Y2S1','friend',TERMEND.friend(YT,'Y2S1'))===18&&in687('改成 **18:00**'),J(TERMS.map(t=>[t,R[t].dinner,R[t].place])));
  /* 週五考完：別人的朋友邀約原本照舊隔天（週六）20:30；TE-FRI-SAME-NIGHT-1104（BB-C 22:09）起接在語彤那一則後面、同一個週五晚上到（20:39），飯的日子照原本 */
  { const {w}=setupTerm('Y2S2',[YT,AN]); at('2027-06-11',19.9); run(19.9,21.5); const a1=PHONE.byAsk(H.G,tagOf('Y2S2')), b1=PHONE.byAsk(H.G,'te_Y2S2_'+AN); at('2027-06-12',19.9); run(19.9,21.5); const b2=PHONE.byAsk(H.G,'te_Y2S2_'+AN);
    check('5. 大二下：語彤那一則 6/11（五）20:30 到；另一位朋友（以安）的邀約同一晚 20:30 一起到（TE-FRI-SAME-NIGHT／TE-SAME-TIME-1104，原本隔天 6/12）、隔天不再傳',!!a1&&K(a1.day)==='2027-06-11'&&a1.h===20.5&&!!b1&&K(b1.day)==='2027-06-11'&&b1.h===20.5&&!!b2&&K(b2.day)==='2027-06-11'&&b2.h===20.5&&(H.G.msgs||[]).filter(m=>m.tag==='te_Y2S2_'+AN).length===1,J([a1&&[K(a1.day),a1.h],b1&&[K(b1.day),b1.h],b2&&[K(b2.day),b2.h]])); }
});

/* ---------- 4 小路的開場、收尾；背景 ---------- */
await sec('4',async()=>{
  const PL=TERMEND_LINES.PLACE.teishoku;
  check('4. PLACE.teishoku 的開場、收尾＝稿那兩句（逐字）；名稱、背景照舊（溫州街・小路、teishoku_night）',PL.open===NARR.open&&PL.close===NARR.close&&PL.open==='（六點，小路的布簾剛掛出來。你們是今天第一組客人。）'&&PL.close==='（出來的時候，巷子裡的燈都亮了。她往新生南路那邊走，到巷口回頭揮了一下手。）'&&PL.name==='溫州街・小路'&&PL.bg==='teishoku_night',J(PL));
  /* 大一上：12/18 20:30 傳 → 好。→ 12/20（六）18:00 演那一頓 */
  const {w}=setupTerm('Y1S1'); const m=walkInvite('Y1S1',w); PHONE.answer(H.G,tagOf('Y1S1'),0); rules(); const q=outOf('te_Y1S1');
  TERMEND.hookFor=()=>null; H.said=[]; H.bgs=[]; H.picks=[0,0,0,0]; at(q.day,18); await TERMEND.dinner(GM,q); const L=H.lines();
  check('4. 十二月（大一上 12/20）那一頓：第一句是開場、最後一句是收尾（她往新生南路那邊走…），中間是話題；各一次；背景 teishoku_night（照現在）',!!m&&L[0]===NARR.open&&L[L.length-1]===NARR.close&&L.filter(t=>t===NARR.open||t===NARR.close).length===2&&L.length>3&&H.bgs.some(b=>b&&b.image&&/teishoku_night/.test(b.image))&&!L.includes('（溫州街・小路。）'),J({L,bg:H.bgs}));
  TERMEND.hookFor=hookFor0;
  /* 六月那幾次（大一下 6/20、大二下 6/12、大三下 6/10）在 3D 的小路室內演（TE-KOMICHI-STAGE），十二月照 2D——照現在 */
  const ev={id:'ev_termend_dinner'}, due={}; for(const t of TERMS){ const {w:w2}=setupTerm(t); walkInvite(t,w2); PHONE.answer(H.G,tagOf(t),0); rules(); const q2=outOf('te_'+t); due[t]=[q2&&K(q2.day),!!q2&&TERMEND.komichiDue(H.G,q2,ev)]; }
  check('4. 背景照現在：六月那三次（大一下 6/20、大二下 6/12、大三下 6/10）在 3D 的小路演（S.komichiStage），十二月那四次照 2D 的 teishoku_night；稿「沒有以前照現在」',
    ['Y1S2','Y2S2','Y3S2'].every(t=>due[t][1])&&['Y1S1','Y2S1','Y3S1','Y4S1'].every(t=>!due[t][1])&&in687('沒有以前照現在用 `teishoku_night`'),J(due));
  /* 舊存檔：更新以前排好、出遊寫公館燒臘的那一頓（AA_686 以前）照公館燒臘演——沒有小路那兩句 */
  { fresh('2025-12-25',18,'dorm',{}); H.G.stage='law'; H.rel(YT,30,10,5);
    H.G.termend={contact:{},think:{},Y1S1:{plan:{back:w.from,heart:[],friend:[YT],fallback:null,gf:[],nope:{},kx:false},picked:{who:YT,kind:'friend',day:DK('2025-12-18')}}};
    OUT.plan(H.G,{id:'te_Y1S1',ev:'ev_termend_dinner',day:DK('2025-12-25'),h:19,late:0.25,place:'公館燒臘',title:'學期末的飯：語彤（公館燒臘）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y1S1',who:YT,kind:'friend'}});
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); const q3=outOf('te_Y1S1'); TERMEND.hookFor=()=>null; H.said=[]; H.bgs=[]; H.picks=[0,0,0,0]; await TERMEND.dinner(GM,q3); TERMEND.hookFor=hookFor0; const L3=H.lines();
    check('4. 舊存檔排好的公館燒臘那一頓（12/25 週四 19:00）：照排好的演，開場收尾是公館燒臘那兩句；沒有小路的開場、收尾',J(dayH(q3))===J(['2025-12-25',4,19])&&L3[0]===TERMEND_LINES.PLACE.noodle.open&&L3.includes(TERMEND_LINES.PLACE.noodle.close)&&!L3.includes(NARR.open)&&!L3.includes(NARR.close),J([L3[0],L3[L3.length-1]])); }
});

/* ---------- 6 平日的回覆分寒假、暑假 ---------- */
await sec('6',()=>{
  const OW=P3().offWd||{};
  check('6. 資料：寒假 rep「淡水冷嗎？」「好好休息。」、暑假 repSummer「淡水熱嗎？」「好好休息。」；稿：寒假「淡水冷嗎？」，暑假換成「淡水熱嗎？」、「好好休息。」兩個假期都用',
    J(OW.rep)===J(['淡水冷嗎？','好好休息。'])&&J(OW.repSummer)===J(['淡水熱嗎？','好好休息。'])&&in687('寒假「淡水冷嗎？」，暑假換成「淡水熱嗎？」')&&in687('「好好休息。」兩個假期都用'),J(OW));
  /* 暑假 2026-07-13（一）～07-24（五）：平日 7/14～7/17、7/20～7/23 */
  const S=ytTrip('2026-07-13','2026-07-24','summer'), SA=askBy(S), sWk=Object.keys(SA).filter(k=>!WE(DK(k))), sWe=Object.keys(SA).filter(k=>WE(DK(k)));
  check('6. 暑假（2026-07 出國）：平日玩家能回「淡水熱嗎？」「好好休息。」；週末照舊「辛苦了。」「想喝茶。」',sWk.length===8&&sWk.every(k=>J(SA[k])===J(['淡水熱嗎？','好好休息。']))&&sWe.length>=1&&sWe.every(k=>J(SA[k])===J(['辛苦了。','想喝茶。'])),J(SA));
  const S2=ytTrip('2026-08-24','2026-08-29','summer'), SA2=askBy(S2);
  check('6. 暑假最後一週（2026-08-24～08-29）平日也是「淡水熱嗎？」',Object.keys(SA2).filter(k=>!WE(DK(k))).length>=4&&Object.keys(SA2).filter(k=>!WE(DK(k))).every(k=>J(SA2[k])===J(['淡水熱嗎？','好好休息。'])),J(SA2));
  /* 寒假 2027-01-17（日）～01-29（五）：店休（1/30 起）以前，平日 1/18～1/22、1/25～1/28（1/23 週六是中間那則「今天也有開」，沒有回覆）*/
  const W=ytTrip('2027-01-17','2027-01-29','winter'), WA=askBy(W), wWk=Object.keys(WA).filter(k=>!WE(DK(k))), wWe=Object.keys(WA).filter(k=>WE(DK(k)));
  check('6. 寒假（2027-01 出國、店休以前）：平日玩家能回「淡水冷嗎？」「好好休息。」；週末照舊「辛苦了。」「想喝茶。」',wWk.length===9&&wWk.every(k=>J(WA[k])===J(['淡水冷嗎？','好好休息。']))&&wWe.length>=1&&wWe.every(k=>J(WA[k])===J(['辛苦了。','想喝茶。'])),J(WA));
  /* 寒假、暑假照那一天（HOME.breakOf），不是照這一趟寫的 season */
  const X=ytTrip('2028-01-10','2028-01-15','summer'), XA=askBy(X);
  check('6. 寒暑假照那一天（HOME.breakOf 的 kind：2028-01-11 是寒假）——這一趟就算寫 season summer，一月的平日照樣「淡水冷嗎？」',HOME.breakOf(DK('2028-01-11')).kind==='winter'&&HOME.breakOf(DK('2026-07-14')).kind==='summer'&&Object.keys(XA).filter(k=>!WE(DK(k))).length>=4&&Object.keys(XA).filter(k=>!WE(DK(k))).every(k=>J(XA[k])===J(['淡水冷嗎？','好好休息。'])),J(XA));
  { const b0=HOME.breakOf; HOME.breakOf=()=>null;   /* 測試用：那一天不在 HOME.breakOf 的假期裡（沒載到、經濟系那一年、畢業以後）＝照這一趟的 season */
    try{ const Y=askBy(ytTrip('2026-07-13','2026-07-17','summer')), Z=askBy(ytTrip('2026-07-13','2026-07-17','winter'));
      check('6. 那一天不在假期裡（HOME.breakOf 沒有）＝照這一趟的 season：summer「淡水熱嗎？」、winter「淡水冷嗎？」',Object.values(Y).length>=3&&Object.values(Y).every(a=>J(a)===J(['淡水熱嗎？','好好休息。']))&&Object.values(Z).length>=3&&Object.values(Z).every(a=>J(a)===J(['淡水冷嗎？','好好休息。'])),J([Y,Z])); }
    finally{ HOME.breakOf=b0; } }
  /* 真的活動卡：大三寒假東京（C11@Y3）、大一暑假首爾（C08@Y1） */
  const inst=(id,yk)=>{ const I=VAC.inst(id,yk); fresh(I.from,7,'dorm',{dating_heroine_03:true}); H.CLOSE(YT); VAC.tripMsgs(H.G,I); return {I,A:askBy(sched('p:heroine_03'))}; };
  const c11=inst('C11','Y3'), c08=inst('C08','Y1'), opn=x=>Object.keys(x.A).filter(k=>!WE(DK(k))&&!NOODLE_CLOSED.closed(H.G,DK(k)));
  check('6. 活動卡：大三寒假東京（'+K(c11.I.from)+'～'+K(c11.I.to)+'）店休以外的平日「淡水冷嗎？」、店休那幾天照舊「好好休息。」「開店我第一個去。」；大一暑假首爾（'+K(c08.I.from)+'～'+K(c08.I.to)+'）平日「淡水熱嗎？」',
    c11.I.A.season==='winter'&&opn(c11).length>=1&&opn(c11).every(k=>J(c11.A[k])===J(['淡水冷嗎？','好好休息。']))&&Object.keys(c11.A).filter(k=>NOODLE_CLOSED.closed(H.G,DK(k))).every(k=>J(c11.A[k])===J(P3().shut.rep))
    &&c08.I.A.season==='summer'&&opn(c08).length>=1&&opn(c08).every(k=>J(c08.A[k])===J(['淡水熱嗎？','好好休息。'])),J([c11.A,c08.A]));
});

/* ---------- 7 過年茶屋休息那幾天也用平日那一組 ---------- */
await sec('7',()=>{
  const P=P3(), OW=P.offWd, SH=P.shut, NEU=[P.pool[6],P.pool[7]], GRP=OW.pool.concat(NEU), NEW=[].concat(...OW.pool), SHOP=[].concat(...[0,1,2,3,4,5].map(i=>P.pool[i])).concat(P.mid,P.back.slice(1));
  check('7. 平日那一組＝新的三則（排前面）＋不講店裡的那兩則（「你那邊在吃什麼」「晚安」）；稿「新的三則＋不講店裡的那幾則，不管星期幾」',J(NEU)===J([['你那邊在吃什麼'],['晚安']])&&OW.pool.length===3&&in687('**過年茶屋休息那幾天也用平日那一組**')&&in687('不管星期幾'),J(GRP));
  /* 暑假：平日新的三則排前面（照現在）*/
  const S=byDay(pool(ytTrip('2026-07-13','2026-07-24','summer'))), sWk=Object.keys(S).filter(k=>!WE(DK(k)));
  check('7. 平日新的三則排前面照現在（7/14 今天在淡水、7/15 盆栽、7/16 秀琴姨、7/17 你那邊在吃什麼、7/20 ……晚安、7/21 今天在淡水）',J(sWk.map(k=>S[k]))===J([GRP[0],GRP[1],GRP[2],GRP[3],GRP[4],GRP[0],GRP[1],GRP[2]]),J(sWk.map(k=>[k,S[k]])));
  /* 大三寒假 2028-01-17（一）～01-30（日）：店休 1/19～1/28（初一 1/26）。1/18 平日；1/19 shut.first、1/20、1/21 shut.pool；1/22 起店休的輪流＝平日那一組（接著 1/18 的順序）*/
  const L=ytTrip('2028-01-17','2028-01-30','winter'), D=byDay(pool(L)), A=askBy(L), sk=Object.keys(D).filter(k=>NOODLE_CLOSED.closed(H.G,DK(k))).sort();
  const fill=sk.filter(k=>k>='2028-01-22');
  check('7. 店休第一天、初一以前的兩句照舊（1/19「茶屋過年休息。…」、1/20、1/21）；店休以前的平日 1/18 是新的三則的第一則',sk.length===10&&sk[0]==='2028-01-19'&&J(D['2028-01-19'])===J(SH.first)&&J(D['2028-01-20'])===J(SH.pool[0])&&J(D['2028-01-21'])===J(SH.pool[1])&&J(D['2028-01-18'])===J(GRP[0]),J(sk.map(k=>[k,D[k]])));
  check('7. 之後的店休日子（1/22～1/28，含週六 1/22、週日 1/23）用平日那一組、和平日同一個順序：盆栽、秀琴姨、你那邊在吃什麼、……晚安、今天在淡水、盆栽、秀琴姨（原本只用不講店裡的那兩則）',
    J(fill)===J(['2028-01-22','2028-01-23','2028-01-24','2028-01-25','2028-01-26','2028-01-27','2028-01-28'])&&J(fill.map(k=>D[k]))===J([GRP[1],GRP[2],GRP[3],GRP[4],GRP[0],GRP[1],GRP[2]])&&WE(DK('2028-01-22'))&&WE(DK('2028-01-23')),J(fill.map(k=>[k,WD(DK(k)),D[k]])));
  check('7. 店休那幾天沒有講店裡的句子；玩家能回的照舊「好好休息。」「開店我第一個去。」（shut.rep，週末、平日都一樣）',sk.every(k=>!D[k].some(t=>SHOP.includes(t)))&&sk.every(k=>J(A[k])===J(SH.rep)),J(sk.map(k=>[k,A[k]])));
  check('7. 店休完的週六（1/29）照舊講店裡的那幾則；週日回國（1/30，茶屋 1/29 開了）照舊「回來了嗎」「蘇姨說幫你留一杯」',(D['2028-01-29']||[]).some(t=>SHOP.includes(t))&&J(L.filter(x=>/_back$/.test(x.tag)).map(x=>x.t))===J(['回來了嗎','蘇姨說幫你留一杯']),J([D['2028-01-29'],L.filter(x=>/_back$/.test(x.tag)).map(x=>x.t)]));
  /* 店休當中出發（2027-02-01（一）～02-12（五）：店休 1/30～2/8，初一 2/6）：先 shut.pool 兩句，之後平日那一組從新的三則開始 */
  const L2=ytTrip('2027-02-01','2027-02-12','winter'), D2=byDay(pool(L2)), k2=Object.keys(D2).sort();
  check('7. 店休當中出發（2027-02-01）：2/2、2/3 照舊 shut.pool 兩句；2/4 起平日那一組從新的三則開始（今天在淡水、盆栽、秀琴姨…，2/6 週六也一樣）；店休完的平日（2/9 起）接著同一個順序',
    J(D2['2027-02-02'])===J(SH.pool[0])&&J(D2['2027-02-03'])===J(SH.pool[1])&&J(['2027-02-04','2027-02-05','2027-02-06','2027-02-07','2027-02-08'].map(k=>D2[k]))===J([GRP[0],GRP[1],GRP[2],GRP[3],GRP[4]])&&J(D2['2027-02-09'])===J(GRP[0])&&WE(DK('2027-02-06')),J(k2.map(k=>[k,D2[k]])));
  check('7. 回國那天是店休＝shut.back 照舊（2027-01-30 回來：「回來了嗎」「茶屋初五開。蘇姨說第一壺留給你。」）',J(ytTrip('2027-01-25','2027-01-30','winter').filter(x=>/_back$/.test(x.tag)).map(x=>x.t))===J(['回來了嗎','茶屋初五開。蘇姨說第一壺留給你。']));
});

/* ---------- 舊存檔 ---------- */
await sec('old',async()=>{
  /* 更新以前排好的小路那一頓（開發分支 2a3b6434e 起：17:30）：照排好的時間，不重排；演得起來 */
  { const w=TERMEND.windowOf('Y1S1'); fresh('2025-12-19',12,'dorm',{}); H.G.stage='law'; H.rel(YT,30,10,5);
    H.G.termend={contact:{},think:{},Y1S1:{plan:{back:w.from,heart:[],friend:[YT],fallback:null,gf:[],nope:{},kx:false,exempt:[]},asks:{[YT]:tagOf('Y1S1')},picked:{who:YT,kind:'friend',day:DK('2025-12-18')}}};
    OUT.plan(H.G,{id:'te_Y1S1',ev:'ev_termend_dinner',day:DK('2025-12-20'),h:17.5,late:0.25,place:'溫州街・小路',title:'學期末的飯：語彤（溫州街・小路）',travel:'走過去約 15 分鐘',travelH:0.25,te:{term:'Y1S1',who:YT,kind:'friend'}});
    H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); let err=null; try{ run(12,21); }catch(e){ err=String(e); } const q=outOf('te_Y1S1');
    check('舊存檔. 更新以前排好的那一頓（12/20 17:30 小路）讀檔以後照排好的時間（不重排、不多排一頓）；手機規則跑起來沒有錯誤',!err&&J(dayH(q))===J(['2025-12-20',6,17.5])&&OUT.rec(H.G).filter(x=>x&&/^te_/.test(x.id||'')).length===1,J({err,q:dayH(q)}));
    at('2025-12-20',17.5); TERMEND.hookFor=()=>null; H.said=[]; H.picks=[0,0,0,0]; let e2=null; try{ await TERMEND.dinner(GM,q); }catch(e){ e2=String(e); } TERMEND.hookFor=hookFor0;
    check('舊存檔. 那一頓演得起來（沒有錯誤）',!e2&&H.said.length>0,e2); }
  /* 更新以前已經傳來的邀約（舊字、週六 20:30 才傳的那一則）：不再傳一次、字不動 */
  { const {w}=setupTerm('Y2S2'); const OLD='考完了。禮拜四……田野出發前，吃一頓。', tag=tagOf('Y2S2');
    PHONE.at(H.G,DK('2027-06-12'),20.5,[{th:'p:'+YT,from:YT,text:OLD,ask:{id:tag,until:24*w.to+18,opts:[{t:'好。',set:{TE_PICK:'Y2S2|'+YT+'|friend'}},{t:'那天有約了。',set:{TE_NO:'Y2S2|'+YT}}]}}],tag);
    TERMEND.rec(H.G,'Y2S2').asks={[YT]:tag}; at('2027-06-12',20.4); run(20.4,21.2); H.G=JSON.parse(J(H.G)); SOCIAL.bind(H.G); at('2027-06-12',21.2); let err=null; try{ run(21.2,21.6); }catch(e){ err=String(e); }
    const T=(H.G.msgs||[]).filter(m=>m.tag===tag).map(m=>m.text);
    check('舊存檔. 更新以前已經傳來的那一則（大二下 6/12 20:30 舊字）：不再傳一次、字不動；讀檔沒有錯誤',!err&&J(T)===J([OLD]),J({err,T})); }
});

H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
