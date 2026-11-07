// AA_667 交換路線第二批：同時交往、沒有一起出國的另一位（企劃線 claude/cool-heisenberg-o8kuqx 090981ebe；任務 AA667-VAC-GAP2-1104；src/aa667_3d.js）——不需要瀏覽器。用法：node tests/aa667_vacgap2_unit.js
//   0 載入、index.html 的順序、白名單、每一句都在稿裡（一字不差，說的人也對）、接線的掛勾（fest3d ASK_PRE／HEAD、heroine_asks3d SEND_BLOCK、cracktalk3d ZQ2_SKIP、ytjob3d 兩個 call）
//   第 2 節 日本路線：2-1 子晴（3/23 住宿舍才有、男一舍門口、沒下去 23:30 兩則；3/25 臺灣 22:40＝當地 23:40；8/5 22:10＋8/6 公園／宵夜；8/5 她的一般邀約不傳）
//     2-2 語彤（3/18～3/24 第一次去她家＝這一版；護照 22:00；3/25 臺灣 17:10；摘要日；8/7 20:00＋8/8 那一頓兩版）　2-3 芷若　2-4 沛珊　2-5 學姊　2-6 可昕（沒接＝隔天同一場）
//   第 3 節 美國路線：3-1 以安（8/1 視訊、8/2 起飛以後、12/23 06:00、聖誕邀約前一句、12/24 開頭兩版）　3-2 子晴（7/29 兩個回法、8/2 取代 bug 那則、12/23 兩則）
//     3-3 語彤（7/22 茶屋、8/7 當地 08:00、12/23 17:10）　3-4 芷若（8/1 捷運出口、沒去 22:07、12/23 兩則）　3-5 沛珊（8/1 電話兩條路都到蛋餅、8/2 06:10、12/23 兩則）
//   第 5 節：同一晚兩場（提早一天）、H6 子晴期末飯、H7 語彤不在臺北不約、沛珊聖誕句尾；臺灣路線、沒交往、一起出國的那一位都不出現；舊存檔過了日期不補。
// 修改前（開發分支 7718c6f4b 的程式＋這支測試）：FAILED 10（模組、白名單、index.html、台詞表、掛勾、H6、H7、沛珊那句；模組沒載入＝第 2、3 節的功能檢查跳過）；修改前後都 PASS 的 3 項：讀稿、H6 句子在稿裡、「不出現」。修改後 ALL PASS（73 項）。
// 「住宿舍」那一條（2-1 子晴 3/23）：遊戲裡日本路線 2/20 就退宿，只能把 JP.movedOut 換掉來測（測試裡 dormOn／dormOff）。
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const loadG=f=>{ const s=fs.readFileSync(path.join(H.ROOT,f),'utf8').replace(/^const ([A-Z_][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); };
const FILES=['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/exchange3d.js','src/holff3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js',
  'src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js','src/data/us_layouts.js','src/data/r2y4a_events.js','src/r2y4a3d.js',
  'src/data/us_life_events.js','src/us_life3d.js','src/data/fest_events.js','src/fest3d.js','src/ytjob3d.js','src/data/multirel_lines.js','src/multirel3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js',
  'src/data/heroine_asks.js','src/heroine_asks3d.js','src/data/heard_lines.js','src/heard3d.js','src/aa660_3d.js','src/aa667_3d.js'];   /* 照 index.html 的順序（jobs3d.js 在 Node 載不起來，ytjob3d.js 不靠它）*/
for(const f of FILES){ if(!fs.existsSync(path.join(H.ROOT,f))){ loadErr.push(f+'：沒有這個檔'); continue; } try{ loadG(f); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,160)); } }
const A=()=>typeof AA667!=='undefined'&&AA667&&AA667.L?AA667:null;
const git=(ref,p)=>{ try{ return cp.execSync('git -c core.quotepath=false show '+ref+':"'+p+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26,stdio:['ignore','pipe','ignore']}); }catch(e){ return ''; } };
const SHA='090981ebe', A667='docs/story_planning/AA_667_交換路線_同時交往的另一位_出發前回國當天.md';
const doc=git(SHA,A667);
const D=H.D, T=(d,h)=>d*24+h, wd=d=>CALENDAR.dateOf(d).wd%7;
const at=(k,h)=>{ const d=typeof k==='number'?k:D(k); H.G.day=d; H.G.hour=h; H.G.weekday=wd(d); E.hour=h; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const runAt=(k,h)=>{ at(k,h); phone(); };
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const tx=L=>L.map(m=>m.text), fr=L=>L.map(m=>m.from);
const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
const JP0={EXCHANGE_ROUTE:'JP',EXCH_RULE:1}, US0={EXCHANGE_ROUTE:'US',EXCH_RULE:1}, TW0={EXCHANGE_ROUTE:'TW',EXCH_RULE:1};
const dt=(...ids)=>{ const o={}; for(const id of ids) o['dating_'+id]=true; return o; };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; if(!G.acts) G.acts={att:{}}; G.visited=G.visited||{}; if(typeof HOME!=='undefined') HOME.rec(G); return G; };
const JPA=f=>Object.assign({},JP0,{X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25')},f||{});   /* 日本路線、出發了 */
const JPB=f=>Object.assign({},JPA(),{JP_RETURNED:D('2028-08-05'),JP_RETURN_H:13},f||{});   /* 回來了 */
const USA=f=>Object.assign({},US0,{US_DEPARTED:true,US_ARRIVED:true,US_ARRIVED_DAY:D('2028-08-02')},f||{});
const USB=f=>Object.assign({},USA(),{US_RETURNED:D('2028-12-23'),US_TRIP_DONE:true,ROOM_Y4:D('2028-12-23')},f||{});
const NM={heroine_01:'以安',heroine_02:'芷若',heroine_03:'語彤',heroine_04:'子晴',heroine_05:'學姊',classmate_peishan:'沛珊',kexin:'可昕','秀琴姨':'秀琴姨','蘇姨':'蘇姨',player:'你（自動）'};
const play=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); if(!q) return null; await OUT.go(GM,q,{fromHome:true}); return H.lines(); };
const bgHas=k=>H.bgs.some(b=>k==='dark'?b==='dark':!!(b&&OUT.BG[k]&&b.image===OUT.BG[k].image));
(async()=>{
  /* ================= 0 ================= */
  check('0. AA_667（企劃線 090981ebe）讀得到；第 2、3、5 節都在',doc.length>5000&&doc.includes('## 2. 日本路線')&&doc.includes('## 3. 美國路線')&&doc.includes('## 5. 給 LAWWW（接線）'),doc?'':'git fetch origin claude/cool-heisenberg-o8kuqx');
  check('0. 模組都載得到（src/aa667_3d.js：AA667）',!loadErr.length&&!!A()&&typeof A().phone==='function'&&Array.isArray(A().EVENTS),J(loadErr));
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]), ia=sc.indexOf('src/aa667_3d.js');
  check('0. index.html：aa667_3d.js 在 aa660_3d、fest3d、ytjob3d、cracktalk3d、heroine_asks3d、jp3d、exchange3d、termend3d 之後，data/bbpack_events.js 前面',
    ia>0&&['src/aa660_3d.js','src/fest3d.js','src/ytjob3d.js','src/cracktalk3d.js','src/heroine_asks3d.js','src/jp3d.js','src/exchange3d.js','src/termend3d.js','src/outings3d.js','src/story3d.js'].every(f=>sc.indexOf(f)>=0&&sc.indexOf(f)<ia)&&ia<sc.indexOf('src/data/bbpack_events.js'),J(ia));
  { let W=null; try{ W=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')); }catch(e){}
    const e=W&&W.files&&W.files.find(x=>x.path===A667);
    check('0. 劇情匯入白名單：AA_667＝090981ebe、approved、approvedBy「AA-C（D109 定稿）」、任務 AA667-VAC-GAP2-1104',!!e&&e.sha===SHA&&e.status==='approved'&&e.approvedBy==='AA-C（D109 定稿）'&&e.task==='AA667-VAC-GAP2-1104',J(e&&{sha:e.sha,st:e.status})); }
  /* 每一句都在稿裡：走一遍 AA667.L（[說的人, 句子]＝那個人說的、null＝旁白；字串＝那一段的人說的；{t}＝選項）*/
  { const SEC={jzq:ZQ,jyt:YT,jzr:ZR,jps:PS,jsis:SIS,jkx:KX,uan:AN,uzq:ZQ,uyt:YT,uzr:ZR,ups:PS}, all=[], bad=[];
    const okLine=(w,t)=>w?(doc.includes(NM[w]+'：'+t)||doc.includes(NM[w]+'：「'+t+'」')||doc.includes('」「'+t+'」')||doc.includes('）「'+t+'」')||doc.includes('私訊「'+t+'」')||doc.includes('她傳「'+t+'」')):doc.includes(t);
    const OPTK=new Set(['go','backGo','backOpts','opts']);   /* 手機上玩家的回法（字串）*/
    const walk=(x,sp,key)=>{ if(x==null) return; if(typeof x==='string'){ if(key==='scene') return; if(OPTK.has(key)){ all.push([null,x]); if(!doc.includes('「'+x+'」')) bad.push('回法 '+x); return; } if(key==='sum') sp=null; all.push([sp,x]); if(!okLine(sp,x)) bad.push((sp?NM[sp]+'：':'')+x); return; }
      if(Array.isArray(x)){ if(x.length===2&&(x[0]===null||(typeof x[0]==='string'&&NM[x[0]]))&&typeof x[1]==='string'){ all.push(x); if(!okLine(x[0],x[1])) bad.push((x[0]?NM[x[0]]+'：':'')+x[1]); return; } for(const y of x) walk(y,sp,key); return; }
      if(typeof x==='object'){ for(const k in x){ if(k==='t'){ const t=x.t; all.push([null,t]); if(!(doc.includes(t)||doc.includes('「'+t+'」'))) bad.push('選項 '+t); continue; } if(k==='me'){ all.push(['player',x.me]); if(!okLine('player',x.me)) bad.push('你（自動）：'+x.me); continue; } walk(x[k],sp,k); } } };
    const L=A()?A().L:{}; for(const k in L) walk(L[k],SEC[k],k);
    const opts=['下去。','好。','明天要睡。','回來了。','明天不行。'].filter(t=>!doc.includes('「'+t+'」'));
    check('0. 每一句都在 AA_667 第 2、3 節裡（一字不差；說的人也對，'+all.length+' 句）',!!A()&&!bad.length&&all.length>=170&&!opts.length,J(bad.concat(opts)));
    check('0. 捷運出口的地點字幕是「家附近的捷運站出口」（稿：地點 LAWWW 照家的設定填；家的設定沒有站名）、男一舍門口照稿',!!A()&&A().L.uzr.scene==='家附近的捷運站出口'&&A().L.jzq.scene==='男一舍門口'&&doc.includes('地點 LAWWW 照家的設定填')); }
  check('0. 接線的掛勾都在：FEST.ASK_PRE、FEST.HEAD、HASK.SEND_BLOCK、CRACKTALK.ZQ2_SKIP（各有 AA667 的一個）；ytjob3d.js 第一次去她家叫 AA667.ytHomeHead／ytHomeTail',
    typeof FEST!=='undefined'&&Array.isArray(FEST.ASK_PRE)&&FEST.ASK_PRE.length>=1&&Array.isArray(FEST.HEAD)&&FEST.HEAD.length>=1&&typeof HASK!=='undefined'&&Array.isArray(HASK.SEND_BLOCK)&&HASK.SEND_BLOCK.length>=1
    &&typeof CRACKTALK!=='undefined'&&Array.isArray(CRACKTALK.ZQ2_SKIP)&&CRACKTALK.ZQ2_SKIP.length>=1&&/AA667\.ytHomeHead/.test(fs.readFileSync(path.join(H.ROOT,'src/ytjob3d.js'),'utf8'))&&/AA667\.ytHomeTail/.test(fs.readFileSync(path.join(H.ROOT,'src/ytjob3d.js'),'utf8')));
  if(!A()){ check('（模組沒載入，後面的功能檢查跳過）',false); }
  const L=A()?A().L:null;
  const SN=w=>typeof SOCIAL!=='undefined'&&SOCIAL.npcName?SOCIAL.npcName(w):(SOCIAL.displayName?SOCIAL.displayName(w):w);   /* 對話框上的名字（同 events3d.js）*/
  const LN=arr=>arr.map(([w,t])=>(w?SN(w)+'：':'')+t), SL=(w,t)=>SN(w)+'：'+t;

  /* ================= 2-1 子晴（日本）================= */
  if(L){ const X=L.jzq;
    /* 3/23 住宿舍（沒退宿：測試用、遊戲裡日本路線 2/20 就退宿）*/
    /* 遊戲裡日本路線 2/20 就退宿（jp3d.js JP.phone 的 x1Late 一定記 X1_JP）：「住宿舍」那一條只能把 JP.movedOut 換掉來測 */
    const mo0=JP.movedOut, dormOn=()=>{ JP.movedOut=()=>false; }, dormOff=()=>{ JP.movedOut=mo0; };
    const s0=()=>{ fresh('2028-03-23',21,'dorm',Object.assign({},JP0,dt(AN,ZQ))); };
    dormOn();
    s0(); runAt('2028-03-23',22.45); const n0=byTag('aa667_jp_zq_bye_dm').length; runAt('2028-03-23',22.5); const M=byTag('aa667_jp_zq_bye_dm');
    check('2-1 日本路線、和子晴交往中、住宿舍：3/23 22:27 還沒有；22:30「你在宿舍嗎」「下來」「五分鐘」（一個回法「下去。」）',n0===0&&J(tx(M))===J(X.dm)&&M.every(m=>m.from===ZQ&&m.th==='p:'+ZQ)&&!!M[2].ask&&J(M[2].ask.opts.map(o=>o.t))===J(['下去。']),J(tx(M)));
    PHONE.answer(H.G,'aa667_jp_zq_bye_dm',0); runAt('2028-03-23',22.55); const q=OUT.get(H.G,'aa667_jp_zq_bye');
    const s=await play('aa667_jp_zq_bye',[0]);
    const want=LN(X.s1).concat(LN(X.s2),[SL(ZQ,X.q6[1]),SL(ZQ,X.end[1])]);
    check('2-1 回「下去。」：出遊「子晴在宿舍樓下」（男一舍門口，2D 深色）→ 稿上那一場（選「行李箱塞不下吧。」→「塞得下。……」；Q6＝「五個月。我會把那個東西做完。……」）；記 ZQ_JP_BYE',
      !!q&&q.day===D('2028-03-23')&&q.h>=22.5&&q.h<23&&!!s&&J(s.filter(t=>t!==SL(ZQ,'塞得下。衣服少帶一件。')))===J(want)&&s.includes(SL(ZQ,'塞得下。衣服少帶一件。'))&&bgHas('dark')&&H.G.flags.ZQ_JP_BYE===D('2028-03-23')&&J(H.opts[0]||[])===J(['「行李箱塞不下吧。」','「謝啦。」']),J(s));
    runAt('2028-03-23',23.6); const bag1=byTag('aa667_jp_zq_bag').length;
    s0(); runAt('2028-03-23',22.5); runAt('2028-03-23',23.45); const bag0=byTag('aa667_jp_zq_bag').length; runAt('2028-03-23',23.5); const B=byTag('aa667_jp_zq_bag');
    check('2-1 沒回：23:30「袋子掛在你們宿舍的信箱上」「洋芋片」（23:27 還沒有）；下去過的不傳',bag1===0&&bag0===0&&J(tx(B))===J(X.miss)&&!H.G.flags.ZQ_JP_BYE,J(tx(B)));
    s0(); runAt('2028-03-23',22.5); PHONE.answer(H.G,'aa667_jp_zq_bye_dm',0); runAt('2028-03-23',22.6); const qq=OUT.get(H.G,'aa667_jp_zq_bye'); if(qq) qq.state='missed'; runAt('2028-03-23',23.5); const B2=byTag('aa667_jp_zq_bag');
    check('2-1 回了沒下去（出發選單選了「不去了」）：一樣 23:30 那兩則',J(tx(B2))===J(X.miss),J(tx(B2)));
    dormOff(); fresh('2028-03-23',21,'home',Object.assign({},JP0,dt(AN,ZQ),{X1_JP:D('2028-02-20')})); runAt('2028-03-23',22.6); const home=byTag('aa667_jp_zq_bye_dm').length;
    const nope=[]; for(const fl of [Object.assign({},TW0,dt(ZQ)),Object.assign({},US0,dt(SIS,ZQ)),Object.assign({},JP0,dt(AN))]){ fresh('2028-03-23',21,'dorm',fl); runAt('2028-03-23',22.6); if(byTag('aa667_jp_zq_bye_dm').length) nope.push(J(fl)); }
    check('2-1 住家裡（日本路線 2/20 退宿，JP.movedOut）不演；臺灣路線、美國路線、沒和子晴交往都沒有',home===0&&!nope.length,J({home,nope}));
    /* 3/25 臺灣 22:40＝當地 23:40 */
    fresh('2028-03-25',20,'jp_hub',JPA(dt(AN,ZQ))); runAt('2028-03-25',23.6); const d0=byTag('aa667_jp_zq_dep').length; runAt('2028-03-25',23+40/60); const DP=byTag('aa667_jp_zq_dep');
    check('2-1 3/25 出發當天：臺灣 22:40（日本 23:40）「到了沒」「宿舍床旁邊有沒有插座」',STORY.tzOffset(H.G,D('2028-03-25'))===1&&d0===0&&J(tx(DP))===J(X.dep)&&DP.every(m=>Math.abs(m.h-(23+40/60))<0.05),J(DP.map(m=>[m.text,m.h])));
    /* 8/5 22:10 */
    const back=(pick)=>{ fresh('2028-08-05',20,'home',JPB(dt(AN,ZQ))); runAt('2028-08-05',22.1); const n=byTag('aa667_jp_zq_back').length; runAt('2028-08-05',22+10/60); const M2=byTag('aa667_jp_zq_back'); let r=null; if(pick!=null){ r=PHONE.answer(H.G,'aa667_jp_zq_back',pick); runAt('2028-08-05',22.4); } return {n,M2,r}; };
    const b1=back(0); const qp=OUT.get(H.G,'aa667_jp_zq_park');
    check('2-1 8/5 回來那天 22:10：「回來了齁」「明天下午我沒班」「東西做完了 你要不要來玩」（Q6）；「好。」＝8/6（日）14:00 溫州街的公園',b1.n===0&&J(tx(b1.M2))===J(X.back.concat([X.backQ6]))&&!!qp&&qp.day===D('2028-08-06')&&qp.h===14&&qp.ev==='ev_aa667_jp_zq_park',J({t:tx(b1.M2),q:qp&&[qp.day,qp.h]}));
    const sp=await play('aa667_jp_zq_park');
    check('2-1 8/6 溫州街的公園：稿上四句（筆電、關卡、第三關、「……那邊要先跳。……」）',!!sp&&J(sp)===J(LN(X.park))&&bgHas('wenzhou_park'),J(sp));
    const b2=back(1);
    check('2-1「明天要睡。」：子晴「好喔 那下禮拜」（不另外排）',!!b2.r&&J(tx(b2.r.out))===J(['明天要睡。',X.backNoRep])&&!OUT.get(H.G,'aa667_jp_zq_park')&&!OUT.get(H.G,'aa667_jp_zq_night'),J(b2.r&&tx(b2.r.out)));
    { const q0=A().q6; A().q6=()=>false; try{ const b3=back(0); const qn=OUT.get(H.G,'aa667_jp_zq_night'); const sn=await play('aa667_jp_zq_night');
        check('2-1 沒有 Q6：第三則「宵夜 明天」；「好。」＝8/6 22:00 公館宵夜（兩句）',J(tx(b3.M2))===J(X.back.concat([X.backNo]))&&!!qn&&qn.day===D('2028-08-06')&&qn.h===22&&J(sn)===J(LN(X.night)),J({t:tx(b3.M2),sn}));
        dormOn(); fresh('2028-03-23',21,'dorm',Object.assign({},JP0,dt(AN,ZQ))); runAt('2028-03-23',22.5); PHONE.answer(H.G,'aa667_jp_zq_bye_dm',0); runAt('2028-03-23',22.55); const s2=await play('aa667_jp_zq_bye',[1]); dormOff();
        check('2-1 沒有 Q6 的那一場：「五個月喔。」（選「謝啦。」→「嗯。」）',!!s2&&s2.includes(SL(ZQ,X.noQ6[1]))&&!s2.includes(SL(ZQ,X.q6[1]))&&s2.includes(SL(ZQ,'嗯。')),J(s2)); } finally{ A().q6=q0; } }
    /* 那天她的一般邀約（heroine_asks3d.js）延到 8/6 以後 */
    fresh('2028-08-05',15,'home',JPB(dt(AN,ZQ)));
    check('2-1 8/5 她的一般邀約（「明天羽球 這次我要贏一球」）不傳、8/6 以後照常（HASK.sendBlocked）；美國路線不擋',!!HASK.sendBlocked&&HASK.sendBlocked(H.G,ZQ,D('2028-08-05'))&&!HASK.sendBlocked(H.G,ZQ,D('2028-08-06'))&&!HASK.sendBlocked(H.G,YT,D('2028-08-05'))
      &&(()=>{ fresh('2028-08-05',15,'home',Object.assign({},US0,dt(SIS,ZQ))); return !HASK.sendBlocked(H.G,ZQ,D('2028-08-05')); })());
    { fresh('2028-08-05',12.5,'home',JPB(dt(AN,ZQ))); let c=[]; try{ c=HASK.candidates(H.G,D('2028-08-05')).filter(x=>x.id===ZQ); }catch(e){ c=['err:'+e.message]; }
      check('2-1 HASK.candidates 8/5 沒有子晴（擋在送出那一天）',c.length===0,J(c)); }
    const late=[]; fresh('2028-08-07',10,'home',JPB(dt(AN,ZQ))); runAt('2028-08-07',10.5); if(byTag('aa667_jp_zq_back').length) late.push('8/7');
    check('2-1 舊存檔 8/7 才讀進來：8/5 那則不補',!late.length,J(late)); }

  /* ================= 2-2 語彤（日本）================= */
  if(L){ const X=L.jyt;
    const noRent=()=>{ H.G.events.done.ev_yutong_landlord=1; };   /* 租約那一段（事件 6）不在這裡 */
    const home=async(day,flags,picks)=>{ fresh(day,17,'home',Object.assign({},JP0,{X1_JP:D('2028-02-20')},dt(AN,YT),flags||{})); noRent(); H.G.flags.YT_HOME_GO=H.G.day; YTJOB.homePlan(H.G); at(day,18.4); return play('yt_home_first',picks||[0,0]); };
    const s=await home('2028-03-22',{},[0,0]);
    const tail=LN(X.bye).concat([SL(YT,'拿出來。放外套內袋。')],LN(X.bye2));
    check('2-2 日本路線出發前那一週（3/22）答應的第一次去她家：照原本那一場，晚餐那句旁白（秀琴姨收完碗就走了）不演，最後接稿上那一段（滷肉的做法、護照）；記 YT_JP_BYE',
      !!s&&s.includes('（新生南路、學校對面的大樓。電梯到七樓。）')&&!s.includes('（晚餐。秀琴姨煮了三菜一湯，收完碗就走了。）')&&J(s.slice(-tail.length))===J(tail)&&H.G.flags.YT_JP_BYE===D('2028-03-22')&&H.G.flags.YT_HOME_SEEN===true,J(s&&s.slice(-9)));
    const s1=await home('2028-03-22',{},[0,1]); runAt('2028-03-22',21.9); const p0=byTag('aa667_jp_yt_pass').length; runAt('2028-03-22',22); const PS1=byTag('aa667_jp_yt_pass');
    check('2-2「……還沒找到。」：語彤「今天回去就找。找到跟我說。」；當晚 22:00 你（自動）「找到了。」、語彤「嗯。」',!!s1&&s1.includes(SL(YT,'今天回去就找。找到跟我說。'))&&p0===0&&J(tx(PS1))===J([X.pass.me,X.pass.her])&&J(fr(PS1))===J(['player',YT]),J(tx(PS1)));
    const s2=await home('2028-03-10',{},[0,0]); const s3=await (async()=>{ fresh('2028-03-22',17,'dorm',Object.assign({},TW0,dt(YT))); noRent(); H.G.flags.YT_HOME_GO=H.G.day; YTJOB.homePlan(H.G); at('2028-03-22',18.4); return play('yt_home_first',[0]); })();
    check('2-2 那一週以外（3/10）、臺灣路線：照原本那一場（晚餐那句旁白照演，沒有滷肉那一段、不記 YT_JP_BYE）',!!s2&&!!s3&&[s2,s3].every(x=>x.includes('（晚餐。秀琴姨煮了三菜一湯，收完碗就走了。）')&&!x.some(t=>/滷肉的做法|護照/.test(t)))&&H.G.flags.YT_JP_BYE==null,J([s2&&s2.slice(-3),s3&&s3.slice(-3)]));
    fresh('2028-03-25',17,'jp_hub',JPA(dt(AN,YT))); runAt('2028-03-25',18.1); const d0=byTag('aa667_jp_yt_dep').length; runAt('2028-03-25',18+10/60); const DP=byTag('aa667_jp_yt_dep');
    check('2-2 3/25 臺灣 17:10（日本 18:10）「📷（茶屋的櫃台。蘇姨在擦茶壺。）」「蘇姨問你到了沒。」',d0===0&&J(tx(DP))===J(X.dep)&&DP.every(m=>m.from===YT),J(tx(DP)));
    /* 摘要日 */
    const sumAt=(fl,k)=>{ fresh(k,18,'jp_hub',JPA(fl)); at(k,18.5); const out=[]; for(let i=0;i<6;i++){ const st=JP.dueStop(H.G,'jp'); if(!st) break; JP.rec(H.G).done[st.k]=H.G.day; if(st.sum) out.push(st.k+':'+(typeof st.sum==='function'?st.sum(H.G):st.sum)); } return out; };
    const r1=sumAt(Object.assign({YT_JP_BYE:D('2028-03-22'),ZR_JP_BYE:D('2028-03-22')}),'2028-05-03'); const F1=H.G.flags;
    check('2-2／2-3 日本那幾個月（挽回中）：5/3 g4_s 後面接語彤那一句、芷若明信片那一句（記 ZR_JP_CARD）',J(r1.map(x=>x.split(':')[0]))===J(['g4_s','aa667_yt_0503','aa667_zr_0503'])&&r1[1].endsWith(X.sum)&&r1[2].endsWith(L.jzr.sum)&&F1.ZR_JP_CARD===D('2028-05-03'),J(r1));
    const r2=sumAt(Object.assign(dt(AN),{YT_JP_BYE:1,ZR_JP_BYE:1}),'2028-05-03'), r3=sumAt(Object.assign(dt(AN),{YT_JP_BYE:1,ZR_JP_BYE:1}),'2028-06-28'), r4=sumAt({YT_JP_BYE:1,ZR_JP_BYE:1,AA667_JPSUM:{yt:D('2028-05-03'),zr:D('2028-05-03')}},'2028-06-28'), r5=sumAt({},'2028-05-03');
    check('2-2／2-3 和以安交往中＝6/28 g7_s 後面；5/3 已經說過的 6/28 不再說；沒有 YT_JP_BYE、ZR_JP_BYE＝沒有',J(r2)===J([])&&J(r3.map(x=>x.split(':')[0]))===J(['g7_s','aa667_yt_0628','aa667_zr_0628'])&&J(r4.map(x=>x.split(':')[0]))===J(['g7_s'])&&J(r5.map(x=>x.split(':')[0]))===J(['g4_s']),J({r2,r3,r4,r5}));
    /* 8/7 20:00 → 8/8 那一頓 */
    const bk=(fl)=>{ fresh('2028-08-07',18,'home',JPB(Object.assign(dt(AN,YT),fl||{}))); noRent(); runAt('2028-08-07',19.9); const n=byTag('aa667_jp_yt_back').length; runAt('2028-08-07',20); const M=byTag('aa667_jp_yt_back'); PHONE.answer(H.G,'aa667_jp_yt_back',0); runAt('2028-08-07',20.2); return {n,M,q:OUT.get(H.G,'aa667_jp_yt_home')}; };
    const k1=bk({YT_HOME_SEEN:true,YT_JP_BYE:D('2028-03-22')});
    check('2-2 8/7 20:00「回來了。」「山上收不到訊號。……」「……秀琴姨明天煮。你要不要來吃。」→「好。」＝8/8 18:30 去她家（去過了＝ev_aa667_yt_back）',k1.n===0&&J(tx(k1.M))===J(X.back)&&!!k1.q&&k1.q.day===D('2028-08-08')&&k1.q.h===18.5&&k1.q.ev==='ev_aa667_yt_back',J({t:tx(k1.M),q:k1.q&&[k1.q.day,k1.q.ev]}));
    at('2028-08-08',18.2); const sb=await play('aa667_jp_yt_home',[0]);
    check('2-2 8/8 那一頓：秀琴姨「在那邊有自己煮嗎？」→ 有 YT_JP_BYE 兩個回法（「照妳那張紙滷過。」→「醬油不一樣吧。」）',!!sb&&J(sb)===J([SL('秀琴姨','在那邊有自己煮嗎？'),SL('秀琴姨','醬油不一樣吧。')])&&J(H.opts[0]||[])===J(['「照妳那張紙滷過。」','「都吃便利商店。」']),J({sb,o:H.opts}));
    const k2=bk({}); at('2028-08-08',18.2); const sf=await play('aa667_jp_yt_home',[0,0]);
    const ig=sf?sf.indexOf(SL(YT,'秀琴姨。')):-1;
    check('2-2 還沒去過她家：8/8 是第一次去她家（ev_yt_home_first），秀琴姨打完招呼以後加那一問，只有「都吃便利商店。」→「難怪瘦了。」；不接日本出發前那一段',
      !!k2.q&&k2.q.ev==='ev_yt_home_first'&&!!sf&&ig>0&&sf[ig+1]===SL('秀琴姨','在那邊有自己煮嗎？')&&sf[ig+2]===SL('秀琴姨','難怪瘦了。')&&J(H.opts[0]||[])===J(['「都吃便利商店。」'])&&!sf.some(t=>/滷肉的做法/.test(t))&&sf.includes('（晚餐。秀琴姨煮了三菜一湯，收完碗就走了。）'),J(sf&&sf.slice(ig-1,ig+4)));
    fresh('2028-08-06',20,'home',JPB(dt(AN,YT))); runAt('2028-08-06',20.5); const e6=byTag('aa667_jp_yt_back').length;
    check('2-2 8/5、8/6 她收不到訊號，不發（8/7 才發）',e6===0); }

  /* ================= 2-3 芷若（日本）================= */
  if(L){ const X=L.jzr;
    const bye=async(fl,picks)=>{ fresh('2028-03-21',20,'home',Object.assign({},JP0,{X1_JP:D('2028-02-20')},dt(AN,ZR),fl||{})); runAt('2028-03-21',20.9); const n=byTag('aa667_jp_zr_bye_dm').length; runAt('2028-03-21',21); const M=byTag('aa667_jp_zr_bye_dm'); runAt('2028-03-21',21.2); const q=OUT.get(H.G,'aa667_jp_zr_bye'); at('2028-03-22',21.5); return {n,M,q,s:await play('aa667_jp_zr_bye',picks)}; };
    const a=await bye({ZR_CARDS_SENT:['film']},[0]);
    check('2-3 3/21（二）21:00「禮拜三我上到十點。」「打烊以後你來。」→ 3/22 22:00 2:30 AM 打烊後；有 ZR_CARDS_SENT＝明信片那一段（「在抽屜裡。」→「……好。」）；記 ZR_JP_BYE',
      a.n===0&&J(tx(a.M))===J(X.dm)&&!!a.q&&a.q.day===D('2028-03-22')&&a.q.h===22&&!!a.s&&J(a.s)===J(LN(X.s1).concat(LN(X.cards),[SL(ZR,'……好。'),SL(ZR,X.cards2[1])]))&&H.G.flags.ZR_JP_BYE===D('2028-03-22')&&bgHas('cafe_night'),J(a.s));
    const b=await bye({},[]);
    check('2-3 沒有 ZR_CARDS_SENT：「到了寄一張明信片給我。寄店裡。」',!!b.s&&J(b.s)===J(LN(X.s1).concat([SL(ZR,X.noCards[1])])),J(b.s));
    fresh('2028-03-25',22,'jp_hub',JPA(dt(AN,ZR))); runAt('2028-03-25',23+7/60); const DP=byTag('aa667_jp_zr_dep');
    check('2-3 3/25 臺灣 22:07（日本 23:07）「今天下午有人點熱拿鐵，不加糖。」「我差點寫你的名字。」',J(tx(DP))===J(X.dep)&&DP.every(m=>Math.abs(m.h-(23+7/60))<0.05),J(DP.map(m=>[m.text,m.h])));
    const ret=fl=>{ fresh('2028-08-05',21,'home',JPB(Object.assign(dt(AN,ZR),fl||{}))); runAt('2028-08-05',22); const n=byTag('aa667_jp_zr_back').length; runAt('2028-08-05',22+7/60); return [n,tx(byTag('aa667_jp_zr_back'))]; };
    const [n1,t1]=ret({ZR_JP_CARD:D('2028-05-03')}), [,t2]=ret({});
    check('2-3 8/5 22:07「落地了嗎。」＋有 ZR_JP_CARD「你寄的那張，老闆貼在吧檯後面了。……」／沒有「下禮拜找一天。我想聽日本的事。」',n1===0&&J(t1)===J([X.back,X.backCard])&&J(t2)===J([X.back,X.backNo]),J({t1,t2})); }

  /* ================= 2-4 沛珊（日本）================= */
  if(L){ const X=L.jps;
    fresh('2028-03-24',20,'home',Object.assign({},JP0,{X1_JP:D('2028-02-20')},dt(AN,PS))); runAt('2028-03-24',20.5); const q0=OUT.get(H.G,'aa667_jp_ps_call'); runAt('2028-03-24',21); const q=OUT.get(H.G,'aa667_jp_ps_call');
    at('2028-03-24',22.9); const s=await play('aa667_jp_ps_call',[0,0]);
    check('2-4 3/24（五）23:00 她打來（電話）：「你回宿舍了嗎？……」→「還差一點。」→ 厚外套 →「妳最近還好嗎？」→（停了一下）→「十點我應該還在睡。……我定鬧鐘。」；記 PS_JP_BYE',
      !q0&&!!q&&q.day===D('2028-03-24')&&q.h===23&&q.call&&q.place==='電話'&&!!s&&J(s)===J(LN(X.call).concat([SL(PS,'那你收。我在電話這邊陪你。')],LN(X.mid),LN(X.opts2[0].say),[SL(PS,X.end[1])]))&&H.G.flags.PS_JP_BYE===D('2028-03-24'),J(s));
    fresh('2028-03-25',8,'home',Object.assign({},JP0,{X1_JP:D('2028-02-20')},dt(AN,PS),{PS_JP_BYE:D('2028-03-24')})); runAt('2028-03-25',9.8); const d0=byTag('aa667_jp_ps_dep').length; runAt('2028-03-25',9+50/60); const DP=byTag('aa667_jp_ps_dep');
    fresh('2028-03-25',8,'home',Object.assign({},JP0,{X1_JP:D('2028-02-20')},dt(AN,PS))); runAt('2028-03-25',10); const no=byTag('aa667_jp_ps_dep').length;
    check('2-4 3/25 09:50（出發前、臺灣時間）「我起來了！」「一路平安。到了跟我說～」；沒有 PS_JP_BYE（沒接那通）不發',d0===0&&J(tx(DP))===J(X.dep)&&no===0,J(tx(DP)));
    fresh('2028-08-05',21,'home',JPB(dt(AN,PS))); runAt('2028-08-05',23); const M=byTag('aa667_jp_ps_back'); const r=PHONE.answer(H.G,'aa667_jp_ps_back',0);
    check('2-4 8/5 23:00「回來了嗎？」「我這禮拜每天四點半起來開店。……」→「回來了。」→「好。那我去睡了。」「……我家的蛋餅，你還沒吃過。」',J(tx(M))===J(X.back)&&!!r&&J(tx(r.out))===J([X.backGo].concat(X.backRep)),J({m:tx(M),r:r&&tx(r.out)})); }

  /* ================= 2-5 學姊、2-6 可昕（日本）================= */
  if(L){ fresh('2028-08-02',9,'jp_hub',JPA(dt(AN,SIS))); runAt('2028-08-02',9.9); const n0=byTag('aa667_jp_sis_fly').length; runAt('2028-08-02',10); const M=byTag('aa667_jp_sis_fly');
    fresh('2028-08-05',21,'home',JPB(dt(AN,SIS))); runAt('2028-08-05',22); const M2=byTag('aa667_jp_sis_back');
    check('2-5 學姊（日本路線、交往中）：8/2 臺灣 09:00（日本 10:00）三則；8/5 22:00 兩則',n0===0&&J(tx(M))===J(L.jsis.fly)&&M.every(m=>m.from===SIS)&&J(tx(M2))===J(L.jsis.back),J({m:tx(M),m2:tx(M2)}));
    const X=L.jkx; fresh('2028-08-05',20,'home',JPB(dt(AN,KX))); runAt('2028-08-05',21); const K1=byTag('aa667_jp_kx_dm'); runAt('2028-08-05',21.2); const q=OUT.get(H.G,'aa667_jp_kx_video');
    at('2028-08-05',21.9); const s=await play('aa667_jp_kx_video',[1]);
    check('2-6 可昕 8/5 21:00「回來了？」「十點視訊。」→ 22:00 視訊（「不要。」→「轉。」→（你轉了一圈。）→「瘦了。」）',J(tx(K1))===J(X.dm)&&!!q&&q.h===22&&q.place==='視訊'&&!!s&&J(s)===J(LN(X.v1).concat(LN(X.opts[1].say),LN(X.v2)))&&bgHas('video'),J(s));
    fresh('2028-08-05',20,'home',JPB(dt(AN,KX))); runAt('2028-08-05',21.2); const qm=OUT.get(H.G,'aa667_jp_kx_video'); if(qm){ qm.state='missed'; OUT.onMissed(GM,qm); } runAt('2028-08-05',22.6); const KM=byTag('aa667_jp_kx_miss'), q2=OUT.get(H.G,'aa667_jp_kx_video2');
    check('2-6 沒接：22:30「好喔。明天再打。」、隔天 22:00 同一場',J(tx(KM))===J([X.miss])&&!!q2&&q2.day===D('2028-08-06')&&q2.h===22&&q2.ev==='ev_aa667_jp_kx_video',J({km:tx(KM),q2:q2&&[q2.day,q2.h]}));
    fresh('2028-08-05',20,'home',JPB(dt(AN))); runAt('2028-08-05',23.5); const nobody=['aa667_jp_zq_back','aa667_jp_zr_back','aa667_jp_ps_back','aa667_jp_sis_back','aa667_jp_kx_dm'].filter(t=>byTag(t).length);
    check('2-* 日本路線只和以安交往（一起出國的那一位）：8/5 都沒有',!nobody.length,J(nobody)); }

  /* ================= 3-1 以安（美國）================= */
  if(L){ const X=L.uan;
    fresh('2028-08-01',19,'home',Object.assign({},US0,dt(SIS,AN))); runAt('2028-08-01',19.9); const n0=byTag('aa667_us_an_dm').length; runAt('2028-08-01',20); const M=byTag('aa667_us_an_dm'); runAt('2028-08-01',20.1); const q=OUT.get(H.G,'aa667_us_an_video');
    at('2028-08-01',20.4); const s=await play('aa667_us_an_video',[1]);
    check('3-1 美國路線、和以安交往中：8/1 20:00「八點半，視訊。」→ 20:30 視訊（她那邊 22:30 以後不回＝最晚 21:30）；選「早上。」→「幾點？」→（你說九點半。）→「我那時候在上課。……」；記 AN_US_BYE',
      n0===0&&J(tx(M))===J([X.dm])&&!!q&&q.h===20.5&&q.late===1&&!!s&&J(s)===J(LN(X.v1).concat(LN(X.opts[1].say),LN(X.v2)))&&H.G.flags.AN_US_BYE===D('2028-08-01'),J(s));
    fresh('2028-08-02',16.5,'us_apartment',USA(dt(SIS,AN))); runAt('2028-08-02',16.6); const F1=byTag('aa667_us_an_fly');
    check('3-1 8/2 臺灣 10:20 她下課（祐廷在飛機上）：落地（當地 16:30）以後收到「下課了。你應該在天上。」「落地傳一則就好。」，時間不早於起飛',J(tx(F1))===J(X.fly)&&F1.every(m=>m.day===D('2028-08-02')&&m.h>=9.5&&m.h<16.5),J(F1.map(m=>[m.text,m.day,m.h])));
    fresh('2028-12-23',5.5,'home',USB(dt(SIS,AN))); runAt('2028-12-23',5.9); const l0=byTag('aa667_us_an_land').length; runAt('2028-12-23',6); const LD=byTag('aa667_us_an_land');
    check('3-1 12/23 06:00（05:40 落地）「落地了嗎。」',l0===0&&J(tx(LD))===J([X.land]),J(tx(LD)));
    const pre=A().xmasPre(H.G,{id:AN,k:'xmas',y:2028,d:D('2028-12-24')}), preTW=(()=>{ fresh('2028-12-23',20,'dorm',Object.assign({},TW0,dt(AN))); return A().xmasPre(H.G,{id:AN,k:'xmas',y:2028}); })();
    check('3-1 12/23 她的聖誕邀約前面多一句「睡醒了嗎。」（FEST.ASK_PRE）；臺灣路線沒有',J(pre)===J(X.xmasPre)&&preTW==null,J({pre,preTW}));
    { fresh('2028-12-20',20,'home',USB(dt(SIS,AN))); INV.addContact(H.G,AN); H.G.contacts[AN]=D('2028-01-01'); runAt('2028-12-23',21); const FA=byTag('fest_ask_heroine_01_xmas_2028');
      check('3-1 fest3d.js 真的接上：12/23 21:00 以安的聖誕邀約＝「睡醒了嗎。」＋「明天是聖誕節。」「晚上六點半，總圖門口。……穿暖一點。」',J(tx(FA))===J(['睡醒了嗎。','明天是聖誕節。','晚上六點半，總圖門口。……穿暖一點。'])&&FA.every(m=>m.from===AN),J(tx(FA))); }
    const head=async fl=>{ fresh('2028-12-24',18.5,'dorm',USB(Object.assign(dt(SIS,AN),fl||{}))); H.FRIEND(AN); H.said=[]; H.picks=['（沒有準備）']; await FEST.play(GM,{id:AN,k:'xmas',y:2028,mode:'meet',scene:'總圖門口',bg:'library_gate_night'}); return H.lines(); };
    const h1=await head({AN_SENDOFF:'went'}), h2=await head({AN_SENDOFF:'missed'});
    check('3-1 12/24 總圖門口那一場（美國路線、和以安交往中）：開頭三句（有去送機＝「上一次見面是三月二十五號，在機場。」／沒去＝「三月二十四號，在麵店。」），後面照原本那一場（卡片）',
      J(h1.slice(0,3))===J(LN([X.head,X.headAir,X.head2]))&&J(h2.slice(0,3))===J(LN([X.head,X.headNoodle,X.head2]))&&h1.includes('（她遞過來一張卡片）')&&h1.includes(SL(AN,'字很少。回去再看。')),J({h1:h1.slice(0,5),h2:h2.slice(0,3)}));
    const h3=await (async()=>{ fresh('2028-12-24',18.5,'dorm',Object.assign({},TW0,dt(AN))); H.FRIEND(AN); H.said=[]; H.picks=['（沒有準備）']; await FEST.play(GM,{id:AN,k:'xmas',y:2028,mode:'meet',scene:'總圖門口'}); return H.lines(); })();
    check('3-1 臺灣路線那一場：沒有那三句',!h3.some(t=>/上一次見面|頭髮長了|看了一下手錶/.test(t))&&h3.includes('（她遞過來一張卡片）'),J(h3.slice(0,3))); }

  /* ================= 3-2 子晴（美國）================= */
  if(L){ const X=L.uzq;
    const ask=(k)=>{ fresh('2028-07-29',20,'home',Object.assign({},US0,dt(SIS,ZQ))); runAt('2028-07-29',20.9); const n=byTag('aa667_us_zq_dm').length; runAt('2028-07-29',21); const M=byTag('aa667_us_zq_dm'); const r=PHONE.answer(H.G,'aa667_us_zq_dm',k); runAt('2028-07-29',21.2); return {n,M,r,q:OUT.get(H.G,'aa667_us_zq_night')}; };
    const a=ask(0);
    check('3-2 7/29（六）21:00「明天宵夜」「我加班到九點半」→「好。」＝7/30 22:00 公館宵夜',a.n===0&&J(tx(a.M))===J(X.dm)&&J(a.M[1].ask.opts.map(o=>o.t))===J(X.opts)&&!!a.q&&a.q.day===D('2028-07-30')&&a.q.h===22,J({t:tx(a.M),q:a.q&&[a.q.day,a.q.h]}));
    at('2028-07-30',21.6); const s=await play('aa667_us_zq_night',[1]);
    check('3-2 7/30 公館宵夜：稿上那一場（選「我會自己煮。」→「你會？」（她看了你一眼。）「……好喔。煮了拍給我看。」；Q6 那句）；記 ZQ_US_BYE',
      !!s&&J(s)===J(LN(X.s1).concat(LN(X.sOpts[1].say),[SL(ZQ,X.q6[1])],LN(X.s2)))&&H.G.flags.ZQ_US_BYE===D('2028-07-30')&&bgHas('gongguan_luwei'),J(s));
    const b=ask(1);
    check('3-2「明天不行。」→「那禮拜一」＝7/31 22:00 同一場',!!b.r&&J(tx(b.r.out))===J([X.opts[1],X.noRep])&&!!b.q&&b.q.day===D('2028-07-31')&&b.q.h===22,J({r:b.r&&tx(b.r.out),q:b.q&&[b.q.day]}));
    fresh('2028-08-02',16.5,'us_apartment',USA(dt(SIS,ZQ))); runAt('2028-08-02',16.6); const F1=byTag('aa667_us_zq_fly');
    check('3-2 8/2 臺灣 22:30「你現在在哪」「舊金山？」「我今天又改了三個 bug 跟你報告一下」（當地 10:30，落地以後收到）',J(tx(F1))===J(X.fly)&&F1.every(m=>Math.abs(m.h-10.5)<0.05),J(F1.map(m=>[m.text,m.h])));
    check('3-2 8/2 那天的「今天又改了三個 bug」「眼睛快掉了」（cracktalk3d.js 每月第一個週三）不傳（CRACKTALK.zq2Skip）；9/6 照常；臺灣路線照常',!!CRACKTALK.zq2Skip&&CRACKTALK.zq2Skip(H.G,D('2028-08-02'))&&!CRACKTALK.zq2Skip(H.G,D('2028-09-06'))&&(()=>{ fresh('2028-08-02',20,'dorm',Object.assign({},TW0,dt(ZQ))); return !CRACKTALK.zq2Skip(H.G,D('2028-08-02')); })());
    fresh('2028-12-23',20,'dorm',USB(dt(SIS,ZQ))); const pre=A().xmasPre(H.G,{id:ZQ,k:'xmas',y:2028});
    check('3-2 12/23 聖誕邀約前面兩則「回來了齁」「時差先調」',J(pre)===J(X.xmasPre),J(pre)); }

  /* ================= 3-3 語彤（美國）================= */
  if(L){ const X=L.uyt;
    fresh('2028-07-21',20,'dorm',Object.assign({},US0,dt(SIS,YT))); runAt('2028-07-21',21); const M=byTag('aa667_us_yt_dm'); runAt('2028-07-21',21.2); const q=OUT.get(H.G,'aa667_us_yt_tea');
    at('2028-07-22',16.7); const s=await play('aa667_us_yt_tea',[0]);
    check('3-3 7/21（五）21:00「明天我五點下班。」「你來店裡。」→ 7/22 17:00 一盞茶屋前院（選「那我二號出發那天……」）；記 YT_US_BYE',
      J(tx(M))===J(X.dm)&&!!q&&q.day===D('2028-07-22')&&q.h===17&&!!s&&J(s)===J(LN(X.s1).concat(LN(X.opts[0].say),LN(X.s2)))&&H.G.flags.YT_US_BYE===D('2028-07-22')&&bgHas('wenzhou_teahouse'),J(s));
    fresh('2028-08-07',7,'us_apartment',USA(dt(SIS,YT))); runAt('2028-08-07',7.9); const n0=byTag('aa667_us_yt_down').length; runAt('2028-08-07',8); const DN=byTag('aa667_us_yt_down');
    check('3-3 8/7 臺灣 20:00（美國早上 8 點）五則（三張照片、「下山了。」「你那邊是早上吧。有吃早餐嗎。」）',n0===0&&J(tx(DN))===J(X.down),J(tx(DN)));
    fresh('2028-12-23',16,'dorm',USB(dt(SIS,YT))); runAt('2028-12-23',17.1); const b0=byTag('aa667_us_yt_back').length; runAt('2028-12-23',17+10/60); const BK=byTag('aa667_us_yt_back');
    check('3-3 12/23 17:10「下班了。」「你回來了嗎。」',b0===0&&J(tx(BK))===J(X.back),J(tx(BK))); }

  /* ================= 3-4 芷若（美國）================= */
  if(L){ const X=L.uzr;
    fresh('2028-08-01',20,'home',Object.assign({},US0,dt(SIS,ZR))); runAt('2028-08-01',20.5); const M=byTag('aa667_us_zr_dm'); runAt('2028-08-01',20.6); const q=OUT.get(H.G,'aa667_us_zr_mrt');
    at('2028-08-01',21.2); const s=await play('aa667_us_zr_mrt');
    check('3-4 8/1 20:30「我剛回臺北。」「你明天就走了吧。……」→ 21:30 家附近的捷運站出口（七句）；記 ZR_US_BYE；沒有 22:07 那則',
      J(tx(M))===J(X.dm)&&!!q&&q.h===21.5&&!!s&&J(s)===J(LN(X.s1))&&H.G.flags.ZR_US_BYE===D('2028-08-01')&&(runAt('2028-08-01',22.2),byTag('aa667_us_zr_miss').length===0),J(s));
    fresh('2028-08-01',20,'home',Object.assign({},US0,dt(SIS,ZR))); runAt('2028-08-01',20.6); runAt('2028-08-01',22.1); const m0=byTag('aa667_us_zr_miss').length; runAt('2028-08-01',22+7/60); const MS=byTag('aa667_us_zr_miss');
    check('3-4 沒去：22:07「好。那到了跟我說。」',m0===0&&J(tx(MS))===J([X.miss]),J(tx(MS)));
    fresh('2028-08-02',16.5,'us_apartment',USA(dt(SIS,ZR))); runAt('2028-08-02',16.6); const F1=byTag('aa667_us_zr_fly');
    fresh('2028-12-23',6,'home',USB(dt(SIS,ZR))); runAt('2028-12-23',6.97); const b0=byTag('aa667_us_zr_back').length; runAt('2028-12-23',6.99); const BK=byTag('aa667_us_zr_back');
    check('3-4 8/2 臺灣 22:07「起飛了吧。」「我今天開始收行李。……」；12/23「你回到臺灣了。」「換我在國外。」（她英國那一週的訊息 07:00 前面）',J(tx(F1))===J(X.fly)&&b0===0&&J(tx(BK))===J(X.back)&&BK.every(m=>m.h<7),J({f:tx(F1),b:BK.map(m=>[m.text,m.h])})); }

  /* ================= 3-5 沛珊（美國）================= */
  if(L){ const X=L.ups;
    const call=async picks=>{ fresh('2028-08-01',20,'home',Object.assign({},US0,dt(SIS,PS))); runAt('2028-08-01',21); const q=OUT.get(H.G,'aa667_us_ps_call'); at('2028-08-01',22.9); return {q,s:await play('aa667_us_ps_call',picks)}; };
    const a=await call([0]), sixL=[SL(PS,X.ask[1])].concat(LN(X.six.say));
    check('3-5 8/1 23:00 她打來：「你明天幾點出門？」→「六點。」→「那時候我們店剛開門。」「我在煎蛋餅。……我煎一個你的。」；記 PS_US_BYE',!!a.q&&a.q.h===23&&a.q.call&&J(a.s)===J(sixL)&&H.G.flags.PS_US_BYE===D('2028-08-01'),J(a.s));
    const b=await call([1,0]);
    check('3-5「妳最近好嗎？」→「還好啦。」（電話那頭有鍋子的聲音。）「……我媽在叫我。你早點睡。」→ 之後也接「你明天幾點出門？」那一段（只有「六點。」）',
      J(b.s)===J([SL(PS,X.ask[1])].concat(LN(X.how.say),sixL))&&J(H.opts[1]||[])===J(['「六點。」'])&&H.G.flags.PS_US_BYE===D('2028-08-01'),J(b.s));
    fresh('2028-08-02',5,'home',Object.assign({},US0,dt(SIS,PS),{PS_US_BYE:D('2028-08-01')})); runAt('2028-08-02',6.1); const d0=byTag('aa667_us_ps_dep').length; runAt('2028-08-02',6+10/60); const DP=byTag('aa667_us_ps_dep');
    fresh('2028-12-23',20,'dorm',USB(dt(SIS,PS))); const pre=A().xmasPre(H.G,{id:PS,k:'xmas',y:2028});
    check('3-5 8/2 06:10「📷（鐵板上一個煎好的蛋餅。）」「這是你的。我吃掉了。一路平安～」；12/23 聖誕邀約前面「你回來了！！」「時差會很累，先睡。」',d0===0&&J(tx(DP))===J(X.dep)&&J(pre)===J(X.xmasPre),J({dp:tx(DP),pre})); }

  /* ================= 第 5 節：同一晚兩場撞在一起 ================= */
  if(L){ fresh('2028-07-20',10,'home',Object.assign({},US0,dt(SIS,AN,ZR,PS)));
    const sl=k=>A().slot(H.G,'US',k), keyOf=d=>d==null?null:CALENDAR.dateOf(d).key;
    check('5. 同時和學姊、以安、芷若、沛珊交往（美國）：以安 8/1 20:30 照演、芷若提早一天（7/31）、沛珊再提早（7/30；7/31 有了）',keyOf(sl('an'))==='2028-08-01'&&keyOf(sl('zr'))==='2028-07-31'&&keyOf(sl('ps'))==='2028-07-30',J(['an','zr','ps'].map(k=>keyOf(sl(k)))));
    runAt('2028-07-31',20.5); const ZM=byTag('aa667_us_zr_dm'); runAt('2028-07-31',20.6); const qz=OUT.get(H.G,'aa667_us_zr_mrt');
    check('5. 提早的那一場連前面那則訊息一起提早、同一個時間（芷若 7/31 20:30 → 21:30）；傳出去就定下那一天',ZM.length===2&&ZM.every(m=>m.day===D('2028-07-31')&&Math.abs(m.h-20.5)<0.05)&&!!qz&&qz.day===D('2028-07-31')&&qz.h===21.5&&H.G.flags.AA667_SLOT&&H.G.flags.AA667_SLOT.US_zr===D('2028-07-31'),J(ZM.map(m=>[m.day,m.h])));
    fresh('2028-07-20',10,'home',Object.assign({},US0,dt(SIS,ZR)));
    check('5. 只有兩位（學姊＋芷若）：照原本的日子',keyOf(A().slot(H.G,'US','zr'))==='2028-08-01');
    fresh('2028-03-20',10,'dorm',Object.assign({},JP0,dt(AN,ZR,ZQ,PS)));
    check('5. 日本路線（3/22 芷若、3/23 子晴、3/24 沛珊）本來就不同天：不動',['zr','zq','ps'].map(k=>keyOf(A().slot(H.G,'JP',k))).join(',')==='2028-03-22,2028-03-23,2028-03-24'); }

  /* ================= 第 5 節：H6、H7、沛珊那句 ================= */
  { const g=TERMEND.gf('heroine_04','Y4S1'), iv=g&&g.invite;
    fresh('2028-12-26',20,'dorm',USB(dt(SIS,ZQ))); const us=typeof iv==='function'?iv(H.G):iv; fresh('2028-12-26',20,'dorm',Object.assign({},TW0,dt(ZQ))); const tw=typeof iv==='function'?iv(H.G):iv;
    check('H6 子晴交往中 Y4S1 期末飯：美國路線「你時差調好了沒 宵夜 工作室今天放我走」、其他路線照舊「你考完了吧 宵夜 工作室今天放我走」',us==='你時差調好了沒 宵夜 工作室今天放我走'&&tw==='你考完了吧 宵夜 工作室今天放我走',J({us,tw}));
    check('H6 句子在稿裡',doc.includes('「你考完了吧 宵夜 工作室今天放我走」→「你時差調好了沒 宵夜 工作室今天放我走」')); }
  { const inv=(k,h)=>{ fresh(k,16.5,'dorm',Object.assign({},dt(YT))); ROM.rec?ROM.rec(H.G):null; H.G.flags.romance=H.G.flags.romance||{}; H.G.flags.romance[YT]={status:'dating',sinceDay:D('2027-01-01')}; at(k,h); YTJOB.homePhone(H.G); PHONE.tick(H.G); return (H.G.msgs||[]).filter(m=>m.from===YT&&m.text===YTJOB.HOME_INV[0]).length; };
    const yi=inv('2028-07-26',17), ds=inv('2028-07-12',17), tp=inv('2028-03-22',17);
    check('H7 語彤不在臺北（7/26 宜蘭田野、7/12 寒暑假平日回淡水）不傳「……今天秀琴姨煮很多。你要不要來吃。」；學期中照傳',yi===0&&ds===0&&tp===1,J({yi,ds,tp})); }
  { const hb=FEST_DATA.PEOPLE.classmate_peishan.ask.homeBy, src=fs.readFileSync(path.join(H.ROOT,'src/data/fest_events.js'),'utf8');
    check('沛珊聖誕（台南）：「明天聖誕節。台南的街上也有燈。你要下來嗎？」拿掉「……不用勉強。」（其他節日那幾句不動）',J(hb.xmas.台南)===J(['明天聖誕節。台南的街上也有燈。你要下來嗎？'])&&!src.includes('你要下來嗎？……不用勉強。\']}}}')&&/明天情人節。……你要下來台中嗎？不用勉強。/.test(src)&&doc.includes('「明天聖誕節。台南的街上也有燈。你要下來嗎？」'),J(hb&&hb.xmas)); }
  /* ================= 不出現 ================= */
  { const all=()=>(H.G.msgs||[]).filter(m=>/^aa667_/.test(m.tag||'')).length+(H.G.outings||[]).filter(q=>/^aa667_/.test(q.id||'')).length;
    const cases=[['2028-03-21',21.5,Object.assign({},TW0,dt(ZR))],['2028-08-01',23.2,Object.assign({},TW0,dt(AN,ZR,PS))],['2028-08-01',23.2,Object.assign({},US0,dt(SIS))],['2028-03-24',23.2,Object.assign({},JP0,dt(AN))],['2028-08-05',23.5,Object.assign({},JPB(),dt(AN))]];
    const bad=[]; for(const [k,h,fl] of cases){ fresh(k,h-0.5,'home',fl); runAt(k,h); if(all()) bad.push(k+J(fl)); }
    fresh('2028-08-03',10,'home',Object.assign({},US0,dt(SIS,AN,ZR,ZQ,YT,PS))); runAt('2028-08-03',10.5); const late=all();
    check('不出現：臺灣路線、只和一起出國的那一位交往；舊存檔 8/3 才讀進來（還沒出發的舊存檔）不補出發前那幾場',!bad.length&&late===0,J({bad,late})); }
  H.done();
})();
