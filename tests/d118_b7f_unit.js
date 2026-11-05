// D118-B7-FOLLOW（BB 定的機制；LAWWW-C 11-05 00:3x 派工；字：暫定字照 AA_690 最小替換＋AA_692（企劃線 91874f326）定稿四處）：
//   司法官二試、研究所筆試也只出修過的課；兩種都有總複習、兩則提醒（同國考一試 D118-B7，tests/d118_b7_unit.js）——不需要瀏覽器。
//   t  介面字逐字比對：STUDY.JUDGE_TEXT／GRAD_TEXT／JUDGE_REMIND／GRAD_REMIND（AA_692 定稿：司法官二試 what、研究所 open、研究所提醒 open、研究所沒有 more）；時數 6／4
//   j  司法官二試題池：每一類只從修過的課（沒修的四門 40 個 examSeed 都抽不到；民 3 刑 3 公 2 訴 2 照舊；對照組抽得到）；某一類不夠由刑法補、補的也只從修過的課（只有大一上的成績單）；
//      修過的課湊不到 10 題＝全部（只有憲法上、民總：6 題；扣掉當年一試的 6 題只剩 9 題）；沒有成績單＝和修改前一模一樣；已經存下的不重抽；當年一試、往年二試的題照樣排除；
//      刑訴題庫（QBANK，沒有 course）＝刑事訴訟法（修過才收）
//   g  研究所筆試題池：沒修行政救濟法＝只從憲法上、下、行政法（40 個 examSeed；對照組抽得到）；四門都修＝四門；沒有成績單＝和修改前一樣；已經存下的不重抽；門檻 6 不變
//   d  司法官二試總複習什麼時候開：一試到司法官的人 9/21 起（10/21 二試的 30 天前；一試放榜 9/7 比較早）～10/21 08:30 開考（讀到一半會過了開考＝變灰）；
//      一試放榜比較晚（測試把 2029 放榜挪到 9/25）＝9/25 起；一試只到律師＝沒有；考完（e2b 演過、記了 JUDGE_SCORE2）＝沒有；司法官重考那一年（2030）照那一年
//   e  研究所筆試總複習什麼時候開：報了 2029 筆試的人（台灣路線、選研究所、推甄沒上）1/4 起～2/3 09:00；沒報（推甄上了、選國考、美國路線的 2029）＝沒有；
//      2030（明年再考、交換延畢）1/17 起～2/16 09:00；考完＝沒有；學期中（寒假）不建 flags.PG、不在存檔多寫東西；住家裡的選單也有、按了地點記「家」、4 小時
//   h  時數與太晚：司法官二試 6 小時（18:00 以後、閉館前讀不完＝變灰；字照表）；研究所 4 小時（20:00 以後、閉館前讀不完＝變灰）；stats.study +6／+4、STORY.onStudy 照讀的時數
//   r  按一次：範圍＝那一場題池每一題的觀念卡（司法官二試＝四類裡修過的課、研究所＝修過的公法），全部讀過；開始字幕照表；
//      結束字幕——司法官二試照一試（翻到的、最多 8 科＋「（另外還翻了 k 科。）」）、研究所照期末（範圍內每一科一行、全部列出、沒有 more）；抽到的題不變
//   p  同時開著：期末（含補考）先；考試之間＝開考最早的那一場（國考一試／司法官二試／研究所）
//   m  提醒：20:00 開放那天、考前一週的週日（各一次、字照表、tag judge_remind_*／grad_remind_*）；一試沒到司法官、沒報名＝沒有；
//      研究所 2029（寒假在家）：在家的快轉停在 20:00 那一則（本來就停、不加停點）、睡過頭照原本的時間補；學期中 PG.stops 的兩個新停點不給時間；
//      畢業以後：PG.stops 有這兩個時間（跳到下一件事停在 20:00、打開那一則）；研究所 2030 也一樣
//   o  舊存檔：v9.10 結構（PG 沒有 judge／grad、沒有 G.study）讀進來不報錯；PG.judge 有空的、壞的年份不報錯；寒假的舊存檔做研究所總複習不建 flags.PG
// 一共 71 項。修改前（開發分支 12c5b522e，2026-11-05 在暫時的 worktree 跑）：FAILED 52——PG.judgeTaken／judgePoolFor／gradPoolFor／judgeNext／judgeReview／gradNext／gradReview、
//   STUDY.JUDGE_TEXT／GRAD_TEXT／JUDGE_REMIND／GRAD_REMIND／examRemindNext 都沒有：0、t1～t5、j1、j2、j4～j8、j10、g1～g3、d2、d3、d6～d8、e2、e3、e5～e7、e9、h1～h5、r1、p1、p2、m1～m3、m5、m6、m8～m14、o1～o3 FAIL，
//   r 那一段在 r1 之後丟出例外（r2～r7 沒跑到，算一項「r. 丟出例外」）；修改前也 PASS 的 14 項（本來就成立、這次不能弄壞的）：j3、j8b、j9、g4、g5、g6、d1、d4、d5、e1、e4、e8、m4、m7。
//   修改後 ALL PASS。用法：node tests/d118_b7f_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
{ const load=(f,re)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return; const src=fs.readFileSync(p,'utf8').replace(/^const (\w+)\s*=/mg,(m,n)=>re.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  global.CG_REGISTRY=global.CG_REGISTRY||{};
  for(const f of ['src/data/study_units.js','src/study3d.js','src/jp3d.js']) load(f,/^[A-Z][A-Z0-9_]*$/);   /* jp3d.js：日本路線的大三下（JP.skipTerm＝CLS.termAway）*/
  for(const f of ['src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js']) load(f,/^(R2Y4A|R2Y4A_EVENTS|R2Y4B|R2Y4B_EVENTS|FD)$/); }   /* 研究所筆試報名的條件（R2Y4A.examOn、R2Y4B.gradExam2030Due）*/
GM.spawnCharacter=()=>null;
let caps=[], toasts=[], picks=[];
GM.addNote=(id,title,body)=>{ const G=H.G; G.notes=G.notes||[]; if(G.notes.find(n=>n.id===id)) return false; G.notes.push({id,title,body,day:G.day}); return true; };
GM.caption=(who,t)=>{ caps.push(String(t)); };
GM.toast=t=>{ toasts.push(String(t)); };
GM.choose=async o=>{ H.opts.push(o.map(q=>q.t||q.text)); const want=picks.shift(); if(typeof want==='number') return want; if(want){ const k=o.findIndex(q=>String(q.t||q.text).includes(want)); if(k>=0) return k; } return 0; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const has=(o,k)=>!!o&&typeof o[k]==='function';
const pf=(k,...a)=>has(PG,k)?PG[k](...a):undefined;   /* 修改前沒有的函式＝undefined（那一項 FAIL，不丟例外）*/
const info=(G,kind)=>{ try{ return STUDY.reviewInfo(G,kind); }catch(e){ return 'ERR'; } };
const opt=(G,o)=>{ try{ return STUDY.reviewOpt(G,o); }catch(e){ return 'ERR'; } };
const ids=a=>(a||[]).map(q=>q.id);
const courseSet=a=>[...new Set((a||[]).map(q=>q.course||'crimpro'))].sort();
const grp=qs=>{ const c={}; for(const q of qs) c[PG.judgeGroup(q)]=(c[PG.judgeGroup(q)]||0)+1; return c; };
const K=d=>d==null?null:CALENDAR.dateOf(d).key, DAY=k=>PG.DK(k), AT=(k,h)=>DAY(k)*24+h;
const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
/* 有成績單的存檔（照 tests/d118_b7_unit.js）：每一學期（不在國外的）的期末考照 CLS.drawExam 抽、答對 k 題，成績單照 CLS.reportFor 發。skip＝那幾門不在成績單上、沒有考試紀錄；terms＝只發這幾學期 */
const transcripts=(G,o)=>{ o=o||{}; const R=CLS.rec(G); R.exam=R.exam||{}; const k=o.k==null?3:o.k;
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue; if(o.terms&&!o.terms.includes(t)) continue;
    for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)||(o.skip||[]).includes(c.id)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      R.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<k?q.answer:wrongOf(q)),correct:k,score:CLS.scoreOf(k),status:'done'}; }
    R.grades[t]=CLS.reportFor(G,t); for(const id of (o.skip||[])) delete R.grades[t][id]; }
  return R; };
const reset=G=>{ caps=[]; toasts=[]; picks=[]; G.notes=[]; G.stats={classes:0,study:0}; H.G=G; return G; };
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const pgSave=(key,h,flags,zone)=>{ const G=H.fresh(key,h,zone||'library_b1',flags||{}); graduated(G); return reset(G); };
/* 司法官二試：2029 一試答對 17（到司法官）、放榜演過；有成績單、2029 一試的 20 題已經抽好（二試要排除）*/
const JF={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:17,BAR_STAGE_2029:'both'};
const judgeSave=(key,h,o)=>{ o=o||{}; const G=pgSave(key,h,Object.assign({},JF,o.flags||{}),o.zone); for(const k of ['exam_2029','r1_2029']) PG.rec(G).done[k]=1; if(o.tr!==false) transcripts(G,o.tr||{}); if(o.draw!==false) PG.draw(G,2029); return reset(G); };
/* 研究所 2029：台灣路線、選研究所、推甄沒上（R2Y4A.examOn）；寒假（學期中）：沒有 flags.PG；成績單到大四上 */
const GF={EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail'}, TO_Y4S1=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'];
const grad29=(key,h,o)=>{ o=o||{}; const G=H.fresh(key,h,o.zone||'library_b1',Object.assign({},GF,o.flags||{})); if(o.tr!==false) transcripts(G,Object.assign({terms:TO_Y4S1},o.tr||{})); return reset(G); };
/* 研究所 2030：台灣路線 2029 沒上、選「明年再考」（R2Y4B.gradExam2030Due）；已經畢業 */
const GF30={EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail',GRAD_EXAM_2029:true,GRAD_SCORE_2029:4,GRAD_EXAM_2029_PASS:false,GRAD_EXAM_RESULT:'fail',GRAD_RETRY:true};
const grad30=(key,h,o)=>{ o=o||{}; const G=pgSave(key,h,Object.assign({},GF30,o.flags||{}),o.zone); if(o.tr!==false) transcripts(G,o.tr||{}); return reset(G); };
/* 修改前（12c5b522e）的抽題（PG.drawJudge、PG.drawGrad 新抽那一段，照抄）：沒有成績單的存檔要抽到一模一樣的題 */
const hashStr=str=>{ let h=2166136261>>>0; for(let i=0;i<str.length;i++){ h^=str.charCodeAt(i); h=Math.imul(h,16777619)>>>0; } return h>>>0; };
const rng=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };
const shuffled=(arr,s)=>{ const r=rng(hashStr(s)), a=arr.slice(); for(let i=a.length-1;i>0;i--){ const j=Math.floor(r()*(i+1)); const x=a[i]; a[i]=a[j]; a[j]=x; } return a; };
const legacyJudge=(G,y)=>{ const R=PG.rec(G), Jd=R.judge||{}, X=R.exam||{}, pool=PG.judgePool(), used=new Set(); for(const id of ((X[y]&&X[y].qs)||[])) used.add(id); for(const k in Jd) if(+k!==+y) for(const id of (Jd[k].qs||[])) used.add(id);
  const left={}; for(const [g] of PG.JUDGE_QUOTA) left[g]=shuffled(pool.filter(q=>!used.has(q.id)&&PG.judgeGroup(q)===g),G.flags.examSeed+'|judge|'+y+'|'+g);
  const qs=[]; let short=0; for(const [g,n] of PG.JUDGE_QUOTA){ const t=left[g].splice(0,n); qs.push(...t); short+=n-t.length; } for(const g of ['crim','civ','pub','proc']){ while(short>0&&left[g].length){ qs.push(left[g].shift()); short--; } } return qs.map(q=>q.id); };
const legacyGrad=(G,y)=>{ const X=PG.rec(G).grad||{}, pool=PG.gradPool(), used=new Set(); for(const k in X) if(+k!==+y) for(const id of (X[k].qs||[])) used.add(id);
  let a=shuffled(pool.filter(q=>!used.has(q.id)),G.flags.examSeed+'|grad|'+y); if(a.length<10) a=a.concat(shuffled(pool.filter(q=>used.has(q.id)),G.flags.examSeed+'|grad2|'+y)); return a.slice(0,10).map(q=>q.id); };
/* 逐字的字（LAWWW-C 11-05 00:3x 的暫定字＋AA_692 定稿四處）*/
const JT={what:'司法官二試要考的',hint:'要六個小時，今天其他的事照常可以做。',open:'（你把四年的筆記攤開。{what} {n} 科，一共 {m} 張觀念卡。）',late:'要讀六個小時。18:00 以後開始就太晚了。',closed:'快閉館了，讀不完六個小時。',miss:'會錯過：{x}。',exam:'二試',line:'{c}　二試範圍：學過 {x}／{y}・答對過 {z}',more:'（另外還翻了 {k} 科。）'};
const GT={what:'研究所要考的',hint:'要四個小時，今天其他的事照常可以做。',open:'（你把公法的筆記攤開。{what} {n} 科，一共 {m} 張觀念卡。）',late:'要讀四個小時。20:00 以後開始就太晚了。',closed:'快閉館了，讀不完四個小時。',miss:'會錯過：{x}。',exam:'研究所筆試',line:'{c}　研究所範圍：學過 {x}／{y}・答對過 {z}'};
const JRM=[{k:'open',text:'【國考】{M}/{D} 司法官二試。從今天起，坐到書桌或讀書的位子，可以把四年的筆記一次讀過一遍，要六個小時。'},{k:'week',text:'【國考】{M}/{D}（{W}）司法官二試。考前想把四年的筆記讀過一遍，坐到書桌或讀書的位子就可以。'}];
const GRM=[{k:'open',text:'【研究所】{M}/{D} 筆試。從今天起，坐到書桌或讀書的位子，可以把公法的筆記一次讀過一遍，要四個小時。'},{k:'week',text:'【研究所】{M}/{D}（{W}）筆試。考前想把公法的筆記讀過一遍，坐到書桌或讀書的位子就可以。'}];
const same=(a,b)=>!!a&&!!b&&Object.keys(a).length===Object.keys(b).length&&Object.keys(b).every(k=>a[k]===b[k]);
const sysOf=(G,re)=>(G.msgs||[]).filter(m=>m.th==='sys'&&re.test(m.text||'')).map(m=>[K(m.day),m.h,m.text,m.tag]);
const ruleAt=(G,k,h)=>{ H.G=G; H.at(k,h); STORY.phoneRules(GM); PHONE.tick(G); };
const stopOf=k=>(PG.stops||[]).find(f=>f&&f._examRemind===k)||null;
const SKIPJ=['crim_spec','oblig_gen2','civpro_2','const_2'];   /* 司法官二試四類各拿掉一門（成績單上沒有）*/
(async()=>{
  check('0. 有 PG.judgePoolFor、PG.gradPoolFor、PG.judgeReview、PG.gradReview、STUDY.examRemindNext；STUDY.JUDGE_TEXT、GRAD_TEXT',['judgeTaken','judgePoolFor','gradPoolFor','judgeNext','judgeReview','gradNext','gradReview'].every(k=>has(PG,k))&&has(STUDY,'examRemindNext')&&!!STUDY.JUDGE_TEXT&&!!STUDY.GRAD_TEXT);
  /* ---------- t 介面字 ---------- */
  await sec('t',async()=>{ const B=STUDY.BAR_TEXT, BR=STUDY.BAR_REMIND;
    check('t1. 司法官二試的字（STUDY.JUDGE_TEXT）逐字：what「司法官二試要考的」（AA_692 定稿）、exam「二試」、line「二試範圍」，其他和國考一試一樣（六個小時、more）',same(STUDY.JUDGE_TEXT,JT),J(STUDY.JUDGE_TEXT));
    check('t2. 研究所的字（STUDY.GRAD_TEXT）逐字：open「（你把公法的筆記攤開。…）」（AA_692 定稿）、四個小時、20:00、exam「研究所筆試」、line「研究所範圍」；沒有 more（AA_692 第 4 點）',same(STUDY.GRAD_TEXT,GT)&&!('more' in (STUDY.GRAD_TEXT||{})),J(STUDY.GRAD_TEXT));
    check('t3. 兩則提醒逐字：司法官二試（STUDY.JUDGE_REMIND）、研究所（STUDY.GRAD_REMIND：open 多「一次」，AA_692 定稿）',J(STUDY.JUDGE_REMIND)===J(JRM)&&J(STUDY.GRAD_REMIND)===J(GRM),J({j:STUDY.JUDGE_REMIND,g:STUDY.GRAD_REMIND}));
    const J2=STUDY.JUDGE_TEXT||{}, G2=STUDY.GRAD_TEXT||{}, rj=STUDY.JUDGE_REMIND||[], rg=STUDY.GRAD_REMIND||[];
    check('t4. 和國考一試的字同一套符號（全形括號、全形斜線、「・」、全形空白）：line、提醒都是一試那一句換詞',J2.line===B.line.replace('一試範圍','二試範圍')&&G2.line===B.line.replace('一試範圍','研究所範圍')&&['hint','open','late','closed','miss','more'].every(k=>J2[k]===B[k])&&G2.miss===B.miss&&
      (rj[0]||{}).text===BR[0].text.replace('一試','司法官二試')&&(rj[1]||{}).text===BR[1].text.replace('一試','司法官二試')&&
      (rg[0]||{}).text===BR[0].text.replace('【國考】','【研究所】').replace('一試','筆試').replace('四年','公法').replace('六個小時','四個小時')&&(rg[1]||{}).text===BR[1].text.replace('【國考】','【研究所】').replace('一試','筆試').replace('四年','公法'));
    check('t5. 時數：司法官二試 6 小時、研究所 4 小時（STUDY.JUDGE_HRS／GRAD_HRS）；國考一試照舊 6、結束字幕上限照舊 8',STUDY.JUDGE_HRS===6&&STUDY.GRAD_HRS===4&&STUDY.BAR_HRS===6&&STUDY.BAR_CAP_LINES===8); });
  /* ---------- j 司法官二試題池 ---------- */
  await sec('j',async()=>{ { const G=judgeSave('2029-10-01',10,{tr:{skip:SKIPJ}}); const tk=new Set(CLS.takenCourses(G).map(c=>c.id)), t0=pf('judgeTaken',G), p0=pf('judgePoolFor',G,2029);
      check('j1. 成績單上沒有刑法分則、債各、民訴甲下、憲法下：二試的修過題池（PG.judgeTaken）一題都沒有，每一題的課都在 CLS.takenCourses；夠 10 題＝PG.judgePoolFor 就是這一份',!!t0&&t0.length>=10&&!t0.some(q=>SKIPJ.includes(q.course))&&t0.every(q=>tk.has(q.course||'crimpro'))&&!!p0&&J(ids(p0))===J(ids(t0)),J({n:t0&&t0.length,c:courseSet(t0)})); }
    let bad=[], quota=[], ctl=0, ex1=[], ex2=[];
    for(let s=1;s<=40;s++){ const G1=judgeSave('2029-10-01',10,{flags:{examSeed:6000+s},tr:{skip:SKIPJ}}); const j=PG.drawJudge(G1,2029), c=grp(j), b1=new Set(PG.rec(G1).exam[2029].qs);
      if(j.some(q=>SKIPJ.includes(q.course))) bad.push(s); if(!(j.length===10&&c.civ===3&&c.crim===3&&c.pub===2&&c.proc===2)) quota.push(s+':'+J(c));
      if(j.some(q=>b1.has(q.id))) ex1.push(s);
      if(s<=10){ PG.draw(G1,2030); const j2=PG.drawJudge(G1,2030), s1=new Set(ids(j)), b2=new Set(PG.rec(G1).exam[2030].qs); if(j2.length!==10||j2.some(q=>s1.has(q.id)||b2.has(q.id)||SKIPJ.includes(q.course))) ex2.push(s); }
      const G2=judgeSave('2029-10-01',10,{flags:{examSeed:6000+s}}); if(PG.drawJudge(G2,2029).some(q=>SKIPJ.includes(q.course))) ctl++; }
    check('j2. 換 40 個 examSeed：沒修那四門的 40 份二試都抽不到那四門；對照組（成績單上都有）抽得到（'+ctl+'／40 份有）',!bad.length&&ctl>=20,J({bad,ctl}));
    check('j3. 民法 3、刑法 3、公法 2、訴訟法 2 照舊（四類都還有修過的課夠抽）',!quota.length,J(quota.slice(0,3)));
    check('j4. 排除當年一試抽到的題（40 份都沒有重複）；重考年（2030）換一組：和 2029 二試、2030 一試都不重複，也只從修過的課（10 份）',!ex1.length&&!ex2.length,J({ex1,ex2}));
    { const G=judgeSave('2029-10-01',10,{tr:{terms:['Y1S1']},draw:false}); const t0=pf('judgeTaken',G)||[], j=PG.drawJudge(G,2029), c=grp(j);
      check('j5. 只有大一上的成績單（憲法上、刑總一、民總）：修過的二試題 '+t0.length+' 題（夠 10 題）——公法只有 1 題、訴訟法 0 題，不夠的 3 題由刑法補，補的也是修過的課（民 3 刑 6 公 1）',t0.length>=10&&j.length===10&&c.civ===3&&c.crim===6&&c.pub===1&&!c.proc&&j.every(q=>['const_1','crim_gen1','civ_general'].includes(q.course)),J({n:t0.length,c,course:courseSet(j)})); }
    { const G=judgeSave('2029-10-01',10,{tr:{terms:['Y1S1'],skip:['crim_gen1']},draw:false,flags:{examSeed:2468}}); const t0=pf('judgeTaken',G)||[], p0=pf('judgePoolFor',G,2029), j=ids(PG.drawJudge(G,2029));
      check('j6. 修過的二試題湊不到 10 題（只有憲法上、民總：'+t0.length+' 題）：退回全部的題池（PG.judgePoolFor＝PG.judgePool，同一份、同一個順序），抽到的題和修改前一模一樣',t0.length>0&&t0.length<10&&!!p0&&J(ids(p0))===J(ids(PG.judgePool()))&&J(j)===J(legacyJudge(G,2029)),J({n:t0.length,j:j.slice(0,3)})); }
    { const G=judgeSave('2029-10-01',10,{tr:{terms:['Y1S1']},draw:false,flags:{examSeed:1357}}); const t0=pf('judgeTaken',G)||[], six=ids(t0).slice(0,6), five=six.slice(0,5);
      PG.rec(G).exam={2029:{qs:five.slice()}}; const p5=pf('judgePoolFor',G,2029);
      PG.rec(G).exam={2029:{qs:six.slice()}}; const p6=pf('judgePoolFor',G,2029), j=ids(PG.drawJudge(G,2029));
      check('j7. 扣掉當年一試抽到的題才算：修過的 '+t0.length+' 題扣 5 題剩 10＝照修過的；扣 6 題剩 9＝退回全部（抽到的和修改前一樣、那 6 題都不在裡面）',t0.length===15&&!!p5&&J(ids(p5))===J(ids(t0))&&!!p6&&p6.length===PG.judgePool().length&&J(j)===J(legacyJudge(G,2029))&&!j.some(id=>six.includes(id)),J({n:t0.length,p5:p5&&p5.length,p6:p6&&p6.length})); }
    { const G=pgSave('2029-10-21',8.5,Object.assign({},JF,{examSeed:31337})); const p0=pf('judgePoolFor',G,2029); PG.draw(G,2029); const j=ids(PG.drawJudge(G,2029)), l1=legacyJudge(G,2029); PG.draw(G,2030); const j2=ids(PG.drawJudge(G,2030)), l2=legacyJudge(G,2030);   /* 修改前的抽法照抽的那一刻算（之後多了 2030 那一組，2029 的排除就不一樣了）*/
      check('j8. 沒有成績單（舊的測試存檔、捷徑存檔）：二試題池（PG.judgePoolFor）＝全部（同一份、同一個順序）',!!p0&&J(ids(p0))===J(ids(PG.judgePool())),p0&&String(p0.length));
      check('j8b. 沒有成績單：2029、2030 抽到的二試和修改前一模一樣',J(j)===J(l1)&&J(j2)===J(l2),J({j:j.slice(0,3),l1:l1.slice(0,3)})); }
    { const G=judgeSave('2029-10-21',8.5,{tr:{skip:SKIPJ}}); const pool=PG.judgePool(), saved=pool.filter(q=>SKIPJ.includes(q.course)).slice(0,6).concat(pool.filter(q=>!SKIPJ.includes(q.course)).slice(0,4)).map(q=>q.id);
      PG.rec(G).judge={2029:{qs:saved.slice()}}; const qs=PG.drawJudge(G,2029);
      check('j9. 已經存下 PG.judge[2029].qs（有沒修過的刑法分則、債各…）：照存下的 10 題、順序一樣，不換（讀檔不重抽）',J(ids(qs))===J(saved)&&qs.every(q=>pool.includes(q))&&J(PG.rec(G).judge[2029].qs)===J(saved),J(ids(qs))); }
    { const src=PG.judgePool().find(q=>q.course==='civpro_1'), fake=Object.assign({},src,{id:'B7F_TEST_QBANK'}); delete fake.course; delete fake.status; fake.complete=true; QBANK.push(fake);   /* 測試用：一題沒有 course 的 QBANK 事例題（照現有的題複製，測完拿掉）*/
      try{ const G=judgeSave('2029-10-01',10,{draw:false}), a=pf('judgeTaken',G)||[]; const G2=judgeSave('2029-10-01',10,{tr:{skip:['crimpro']},draw:false}), b=pf('judgeTaken',G2)||[];
        check('j10. 刑訴題庫（QBANK，沒有 course）＝刑事訴訟法、訴訟法那一類（同一試 PG.qCourse）：修過刑訴才收、沒修不收',PG.judgeGroup(fake)==='proc'&&PG.qCourse(fake)==='crimpro'&&a.includes(fake)&&!b.includes(fake),J({a:a.includes(fake),b:b.includes(fake)})); }
      finally{ QBANK.splice(QBANK.indexOf(fake),1); } } });
  /* ---------- g 研究所筆試題池 ---------- */
  await sec('g',async()=>{ const PUB3=['const_1','const_2','admin_law'];
    { const G=grad29('2029-01-10',10,{tr:{skip:['admin_remedy']}}); const p0=pf('gradPoolFor',G);
      check('g1. 沒修行政救濟法：研究所題池（PG.gradPoolFor）只有憲法上、憲法下、行政法（三門必修都在）',!!p0&&J(courseSet(p0))===J(PUB3.slice().sort())&&p0.length===PG.gradPool().filter(q=>PUB3.includes(q.course)).length,J({c:courseSet(p0),n:p0&&p0.length})); }
    let bad=[], ctl=0, n10=true; for(let s=1;s<=40;s++){ const G1=grad29('2029-01-10',10,{flags:{examSeed:7000+s},tr:{skip:['admin_remedy']}}); const q=PG.drawGrad(G1,2029); if(q.length!==10) n10=false; if(q.some(x=>!PUB3.includes(x.course))) bad.push(s);
      const G2=grad29('2029-01-10',10,{flags:{examSeed:7000+s}}); if(PG.drawGrad(G2,2029).some(x=>x.course==='admin_remedy')) ctl++; }
    check('g2. 換 40 個 examSeed：沒修行政救濟法的 40 份筆試都是 10 題、都在那三門；對照組（四門都修）抽得到行政救濟法（'+ctl+'／40 份有）',n10&&!bad.length&&ctl>=20,J({bad,ctl}));
    { const G=grad29('2029-01-10',10); const p0=pf('gradPoolFor',G); check('g3. 四門都修：題池＝四門全部（和 PG.gradPool 同一份）',!!p0&&J(ids(p0))===J(ids(PG.gradPool())),p0&&String(p0.length)); }
    { const G=H.fresh('2029-02-03',8.5,'campus',Object.assign({},GF,{examSeed:4242})); reset(G); const q=ids(PG.drawGrad(G,2029)), w=legacyGrad(G,2029); const q2=ids(PG.drawGrad(G,2030)), w2=legacyGrad(G,2030);
      check('g4. 沒有成績單：四門全部；2029、2030 抽到的題和修改前一模一樣',J(q)===J(w)&&J(q2)===J(w2),J(q.slice(0,3))); }
    { const G=grad30('2030-02-16',9,{tr:{skip:['admin_remedy']}}); const saved=PG.gradPool().filter(q=>q.course==='admin_remedy').slice(0,3).concat(PG.gradPool().filter(q=>q.course!=='admin_remedy').slice(0,7)).map(q=>q.id);
      PG.rec(G).grad={2030:{qs:saved.slice()}}; const q=ids(PG.drawGrad(G,2030));
      check('g5. 已經存下 PG.grad[2030].qs（有沒修過的行政救濟法）：照存下的 10 題、順序一樣，不換',J(q)===J(saved),J(q)); }
    check('g6. 錄取門檻不變（PG.GRAD_PASS 6；2030 Y5_DAYS study 5）',PG.GRAD_PASS===6&&PG.N_GRAD===10); });
  /* ---------- d 司法官二試總複習：什麼時候開 ---------- */
  await sec('d',async()=>{ const G=judgeSave('2029-09-20',23);
    check('d1. 2029-09-20 23:00（二試 10/21 的 31 天前）：沒有司法官二試總複習（reviewInfo null、座位選單沒有那一項）',info(G,'judge')===null&&opt(G)===null,J(info(G,'judge')));
    H.at('2029-09-21',0); const i1=info(G,'judge'), o1=opt(G), nx=pf('judgeNext',G);
    check('d2. 2029-09-21 00:00 起（30 天前；一試放榜 9/7 比較早）：有；座位選單「考前總複習」kind judge',!!i1&&i1!=='ERR'&&i1.kind==='judge'&&i1.year===2029&&!!o1&&o1!=='ERR'&&o1.t==='考前總複習'&&o1.kind==='judge'&&o1.review===true&&!!nx&&K(nx.open)==='2029-09-21'&&K(nx.day)==='2029-10-21'&&nx.at===AT('2029-10-21',8.5),J({i:i1&&i1.kind,o1,nx}));
    H.at('2029-10-21',2.5); const o2=opt(G); H.at('2029-10-21',2.6); const o3=opt(G);
    check('d3. 10/21 02:30（讀完 08:30）可以；02:36（會跨過 08:30 開考）＝變灰「會錯過：二試。」',!!o2&&o2!=='ERR'&&!o2.dim&&!!o3&&o3!=='ERR'&&o3.dim===true&&o3.hint==='會錯過：二試。',J({o2,o3}));
    H.at('2029-10-21',8.5); check('d4. 10/21 08:30（開考）以後：沒有',info(G,'judge')===null&&opt(G)===null);
    { const G2=judgeSave('2029-10-10',10); PG.rec(G2).done.e2b_2029=1; const a=info(G2,'judge'); delete PG.rec(G2).done.e2b_2029; G2.flags.JUDGE_SCORE2_2029=6; const b=info(G2,'judge');
      check('d5. 考完（e2b_2029 演過、或記了 JUDGE_SCORE2_2029）：沒有',a===null&&b===null); }
    { const Y=PG.Y[2029], r0=Y.r1; let a=null, b=null; try{ Y.r1='2029-09-25'; const G3=judgeSave('2029-09-24',23); a=info(G3,'judge'); H.at('2029-09-25',0); b=info(G3,'judge'); } finally { Y.r1=r0; }
      check('d6. 一試放榜比較晚的那一年（測試把 2029 放榜挪到 9/25）：開放＝放榜那天（9/24 沒有、9/25 起有）——比較晚的那一天',a===null&&!!b&&b!=='ERR'&&b.kind==='judge',J({a,b:b&&b.kind})); }
    { const G4=judgeSave('2029-10-01',10,{flags:{BAR_SCORE_2029:13,BAR_STAGE_2029:'lawyer'}});
      check('d7. 一試只到律師（13 題）：一試以後也沒有司法官二試總複習',info(G4,'judge')===null&&opt(G4)===null&&pf('judgeNext',G4)===null); }
    { const G5=judgeSave('2030-09-19',23,{flags:{BAR_YEAR:2029,JUDGE_RETAKE:true,JUDGE_RETAKE_Y:2030,JUDGE_SCORE2_2029:5,JUDGE_PASS_2029:false,BAR_SIT_2030:true,BAR_SCORE_2030:16}});
      for(const k of ['e2a_2029','e2b_2029','r2_2029','exam_2030','r1_2030']) PG.rec(G5).done[k]=1; const a=info(G5,'judge'); H.at('2030-09-20',0); const b=info(G5,'judge');
      check('d8. 司法官重考那一年（2030，已經是律師）一試到司法官：9/19 沒有、9/20（10/20 二試的 30 天前）起有（year 2030）',a===null&&!!b&&b!=='ERR'&&b.year===2030,J({a,b:b&&b.year})); } });
  /* ---------- e 研究所筆試總複習：什麼時候開 ---------- */
  await sec('e',async()=>{ const G=grad29('2029-01-03',23);
    check('e1. 2029-01-03 23:00（筆試 2/3 的 31 天前）：沒有研究所總複習',info(G,'grad')===null&&opt(G)===null);
    H.at('2029-01-04',0); const i1=info(G,'grad'), o1=opt(G);
    const n1=i1&&i1!=='ERR'?i1.courses.reduce((a,x)=>a+x.units.length,0):-1;
    check('e2. 2029-01-04 00:00 起（30 天前）：有；座位選單「考前總複習」kind grad，提示「研究所要考的 4 科，n 張觀念卡。要四個小時，今天其他的事照常可以做。」',!!i1&&i1!=='ERR'&&i1.kind==='grad'&&i1.year===2029&&i1.courses.length===4&&!!o1&&o1!=='ERR'&&o1.kind==='grad'&&!o1.dim&&o1.hint==='研究所要考的 4 科，'+n1+' 張觀念卡。要四個小時，今天其他的事照常可以做。',J({o1}));
    H.at('2029-02-03',5); const o2=opt(G); H.at('2029-02-03',5+1/60); const o3=opt(G); H.at('2029-02-03',9); const i4=info(G,'grad');
    check('e3. 2/3 05:00（讀完 09:00）可以；05:01（會跨過 09:00 開考）＝變灰「會錯過：研究所筆試。」；09:00 以後沒有',!!o2&&o2!=='ERR'&&!o2.dim&&!!o3&&o3!=='ERR'&&o3.dim===true&&o3.hint==='會錯過：研究所筆試。'&&i4===null,J({o2,o3,i4}));
    { const a=grad29('2029-01-20',10); a.events.done.ev_grad_exam=1; const b=grad29('2029-01-20',10,{flags:{GRAD_SCORE_2029:7}}); const c=grad29('2029-01-20',10,{flags:{GRAD_EXAM_2029:true}});
      check('e4. 考過（ev_grad_exam 演過、記了 GRAD_SCORE_2029、GRAD_EXAM_2029）：沒有',info(a,'grad')===null&&info(b,'grad')===null&&info(c,'grad')===null); }
    { const a=grad29('2029-01-10',10,{flags:{Y4_PUSH:'pass'}}), b=grad29('2029-01-10',10,{flags:{Y4_PATH:'bar'}}), c=grad29('2029-01-10',10,{flags:{EXCHANGE_ROUTE:'US'}});
      check('e5. 沒報 2029 筆試（推甄上了、選國考、美國路線）：1 月沒有研究所總複習',info(a,'grad')===null&&info(b,'grad')===null&&info(c,'grad')===null&&pf('gradNext',a)===null&&pf('gradNext',b)===null);
      const nu=pf('gradNext',c); check('e6. 美國路線選研究所（交換延畢、還沒上）：下一場是 2030-02-16（1/17 開放）',!!nu&&nu.y===2030&&K(nu.open)==='2030-01-17'&&nu.at===AT('2030-02-16',9),J(nu)); }
    { const G3=grad30('2030-01-16',23); const a=info(G3,'grad'); H.at('2030-01-17',0); const b=info(G3,'grad'); PG.rec(G3).done.r2y4b_grad_exam_2030=1; const c=info(G3,'grad');
      check('e7. 2030（2029 沒上、選明年再考，已經畢業）：1/16 沒有、1/17（2/16 的 30 天前）起有（year 2030）；考完（r2y4b_grad_exam_2030 演過）沒有',a===null&&!!b&&b!=='ERR'&&b.year===2030&&b.kind==='grad'&&c===null,J({a,b:b&&b.year,c})); }
    { const G4=grad29('2029-01-10',10); delete G4.study; const before=J(G4.flags); let err=null; try{ info(G4,'grad'); opt(G4); if(has(STUDY,'examRemindNext')) STUDY.examRemindNext(G4,'grad'); pf('gradNext',G4); pf('gradReview',G4); }catch(e){ err=String(e); }
      check('e8. 學期中（大四寒假）：查研究所總複習、提醒不建 flags.PG、不改 flags',!err&&J(G4.flags)===before&&!G4.flags.PG,err||''); }
    { const Gh=grad29('2029-01-12',10,{zone:'dorm'}); Gh.home={at:true}; const ho=HOME.MENU_OPTS.map(f=>{ try{ return f(Gh); }catch(e){ return null; } }).find(x=>x&&x.t==='考前總複習');
      let calls=[]; const on0=STORY.onStudy; STORY.onStudy=function(GM2,hrs){ calls.push([hrs,GM2.G.zone]); }; picks=['先讀到這裡'];
      try{ if(ho) await ho.run(GM); } finally { STORY.onStudy=on0; }
      check('e9. 寒假住家裡：家裡的選單有「考前總複習」（研究所，提示「研究所要考的…」）；按下去 4 小時（10:00 → 14:00）、地點記「家」',!!ho&&/^研究所要考的 /.test(ho.hint||'')&&Gh.hour===14&&calls.length===1&&calls[0][0]===4&&calls[0][1]==='home'&&Gh.zone==='dorm',J({h:ho&&ho.hint,hour:Gh.hour,calls})); } });
  /* ---------- h 時數與太晚 ---------- */
  await sec('h',async()=>{ const G=judgeSave('2029-10-01',18);
    const a=opt(G); H.at('2029-10-01',17.5); const b=opt(G); G.zone='library_hall'; H.at('2029-10-01',16.5); const c=opt(G); H.at('2029-10-01',15.5); const d=opt(G); G.zone='library_b1';
    check('h1. 司法官二試：18:00 變灰「要讀六個小時。18:00 以後開始就太晚了。」、17:30 可以；總圖（22:00 閉館）16:30 變灰「快閉館了，讀不完六個小時。」、15:30 可以',!!a&&a.dim&&a.hint===JT.late&&!!b&&!b.dim&&!!c&&c.dim&&c.hint===JT.closed&&!!d&&!d.dim,J({a,c}));
    toasts=[]; H.at('2029-10-01',18.5); const r0=await STUDY.review(GM,'judge');
    check('h2. 18:30 直接叫 STUDY.review(GM,\'judge\')：不做（false）、不耗時間、toast 同一句',r0===false&&G.hour===18.5&&toasts.includes(JT.late),J({r0,toasts}));
    let calls=[]; const on0=STORY.onStudy; STORY.onStudy=function(GM2,hrs){ calls.push([hrs,GM2.G.zone]); };
    try{ H.at('2029-10-02',9); const s0=G.stats.study; picks=['先讀到這裡']; const r=await STUDY.review(GM,'judge');
      check('h3. 司法官二試總複習按一次：6 小時（09:00 → 15:00）、G.stats.study +6、STORY.onStudy（6 小時、讀書的地方）',!!r&&r.kind==='judge'&&G.hour===15&&G.stats.study===s0+6&&calls.length===1&&calls[0][0]===6&&calls[0][1]==='library_b1',J({r,h:G.hour,calls}));
      const G2=grad29('2029-01-10',20); calls=[]; const e=opt(G2); H.at('2029-01-10',19.5); const f=opt(G2); G2.zone='library_hall'; H.at('2029-01-10',18.5); const g=opt(G2); H.at('2029-01-10',17.5); const h=opt(G2); G2.zone='library_b1';
      check('h4. 研究所：20:00 變灰「要讀四個小時。20:00 以後開始就太晚了。」、19:30 可以；總圖 18:30 變灰「快閉館了，讀不完四個小時。」、17:30 可以',!!e&&e.dim&&e.hint===GT.late&&!!f&&!f.dim&&!!g&&g.dim&&g.hint===GT.closed&&!!h&&!h.dim,J({e,g}));
      H.at('2029-01-11',9); const s1=G2.stats.study; picks=['先讀到這裡']; const r2=await STUDY.review(GM,'grad');
      check('h5. 研究所總複習按一次：4 小時（09:00 → 13:00）、G.stats.study +4、STORY.onStudy（4 小時）',!!r2&&r2.kind==='grad'&&G2.hour===13&&G2.stats.study===s1+4&&calls.length===1&&calls[0][0]===4,J({r2,h:G2.hour,calls}));
    } finally { STORY.onStudy=on0; } });
  /* ---------- r 按一次：範圍、字幕 ---------- */
  await sec('r',async()=>{ const on0=STORY.onStudy; STORY.onStudy=()=>{};
    try{ { const G=judgeSave('2029-10-03',9,{tr:{skip:SKIPJ}}); const i=info(G,'judge'), pool=pf('judgePoolFor',G,2029)||[]; const want=new Set(); for(const q of pool) for(const u of STUDY.unitsOfQ(q.id)) want.add(u.id);
        const scope=new Set(); for(const x of (i&&i!=='ERR'?i.courses:[])) for(const u of x.units) scope.add(u.id);
        check('r1. 司法官二試的範圍＝那一年二試題池（四類裡修過的課）每一題的觀念卡；沒修的刑法分則、債各、民訴甲下、憲法下不在裡面；一科一節、照課程順序',!!i&&i!=='ERR'&&scope.size>20&&J([...scope].sort())===J([...want].sort())&&!i.courses.some(x=>SKIPJ.includes(x.c.id))&&J(i.courses.map(x=>x.c.id))===J(COURSES.list.filter(c=>i.courses.some(x=>x.c.id===c.id)).map(c=>c.id)),J({n:scope.size,m:want.size,c:i&&i.courses&&i.courses.map(x=>x.c.id)}));
        const d0=J(ids(PG.drawJudge(JSON.parse(J(G)),2029))); H.said=[]; caps=[]; picks=['先讀到這裡']; const r=await STUDY.review(GM,'judge'); const L=H.said.map(s=>s.t), n=i.courses.length, m=i.courses.reduce((a,x)=>a+x.units.length,0);
        check('r2. 開始字幕逐字：「（你把四年的筆記攤開。司法官二試要考的 n 科，一共 m 張觀念卡。）」',!!r&&L[0]==='（你把四年的筆記攤開。司法官二試要考的 '+n+' 科，一共 '+m+' 張觀念卡。）',J(L[0]));
        const bad=[...scope].filter(id=>STUDY.rank(G,id)<2), c0=i.courses[0], x0=c0.units.filter(u=>STUDY.rank(G,u)>=1).length, z0=c0.units.filter(u=>STUDY.rank(G,u)>=3).length;
        check('r3. 第一張就「先讀到這裡」：範圍內每一張卡都讀過；結束字幕＝翻到的那一科一行「<課名>　二試範圍：學過 x／y・答對過 z」；二試抽到的題不變',!bad.length&&caps[caps.length-1]===c0.c.name+'　二試範圍：學過 '+x0+'／'+c0.units.length+'・答對過 '+z0&&J(ids(PG.drawJudge(JSON.parse(J(G)),2029)))===d0,J({bad:bad.length,cap:caps[caps.length-1]})); }
      { const G=judgeSave('2029-10-04',9); const i=info(G,'judge'); caps=[]; picks=[]; for(let k=0;k<80;k++) picks.push('跳到下一科'); const r=await STUDY.review(GM,'judge'); picks=[];
        const capL=(caps[caps.length-1]||'').split('<br>'), keep=i.courses.slice(-8), want=keep.map(x=>x.c.name+'　二試範圍：學過 '+x.units.filter(u=>STUDY.rank(G,u)>=1).length+'／'+x.units.length+'・答對過 '+x.units.filter(u=>STUDY.rank(G,u)>=3).length).concat(['（另外還翻了 '+(i.courses.length-8)+' 科。）']);
        check('r4. 司法官二試一路「跳到下一科」翻完 '+i.courses.length+' 科：結束字幕照國考一試——只列翻到的最後 8 科，最後一行「（另外還翻了 k 科。）」',!!r&&i.courses.length>8&&J(capL)===J(want),J({capL:capL.length,n:i.courses.length,last:capL[capL.length-1]})); }
      { const G=grad29('2029-01-15',9); const i=info(G,'grad'), pool=pf('gradPoolFor',G)||[]; const want=new Set(); for(const q of pool) for(const u of STUDY.unitsOfQ(q.id)) want.add(u.id); const scope=new Set(); for(const x of (i&&i!=='ERR'?i.courses:[])) for(const u of x.units) scope.add(u.id);
        const d0=J(ids(PG.drawGrad(JSON.parse(J(G)),2029))); H.said=[]; caps=[]; picks=['先讀到這裡']; const r=await STUDY.review(GM,'grad'); const L=H.said.map(s=>s.t), n=i.courses.length, m=i.courses.reduce((a,x)=>a+x.units.length,0);
        const line=x=>x.c.name+'　研究所範圍：學過 '+x.units.filter(u=>STUDY.rank(G,u)>=1).length+'／'+x.units.length+'・答對過 '+x.units.filter(u=>STUDY.rank(G,u)>=3).length, capL=(caps[caps.length-1]||'').split('<br>');
        check('r5. 研究所的範圍＝修過的公法（四門）每一題的觀念卡；開始字幕逐字「（你把公法的筆記攤開。研究所要考的 4 科，一共 m 張觀念卡。）」（AA_692 定稿）',!!i&&i!=='ERR'&&J([...scope].sort())===J([...want].sort())&&J(i.courses.map(x=>x.c.id))===J(['const_1','const_2','admin_law','admin_remedy'])&&!!r&&L[0]==='（你把公法的筆記攤開。研究所要考的 '+n+' 科，一共 '+m+' 張觀念卡。）',J({L0:L[0],c:i&&i.courses&&i.courses.map(x=>x.c.id)}));
        check('r6. 研究所的結束字幕照期末：只翻了第一張也列範圍內每一科一行（4 行「<課名>　研究所範圍：學過 x／y・答對過 z」）、沒有「另外還翻了」那一行；筆試抽到的題不變',J(capL)===J(i.courses.map(line))&&!capL.some(t=>t.includes('另外還翻了'))&&J(ids(PG.drawGrad(JSON.parse(J(G)),2029)))===d0,J(capL)); }
      { const G=grad29('2029-01-16',9,{tr:{skip:['admin_remedy']}}); const i=info(G,'grad'); caps=[]; picks=['先讀到這裡']; await STUDY.review(GM,'grad'); const capL=(caps[caps.length-1]||'').split('<br>');
        check('r7. 沒修行政救濟法：研究所總複習的範圍只有憲法上、下、行政法（3 科、結束字幕 3 行）',!!i&&i!=='ERR'&&J(i.courses.map(x=>x.c.id))===J(['const_1','const_2','admin_law'])&&capL.length===3&&capL.every(t=>t.includes('　研究所範圍：學過 ')),J({c:i&&i.courses&&i.courses.map(x=>x.c.id),capL})); }
    } finally { STORY.onStudy=on0; } });
  /* ---------- p 同時開著 ---------- */
  await sec('p',async()=>{ const G=judgeSave('2029-10-05',10); const ja=AT('2029-10-21',8.5);
    { const extra=G2=>G2===G?{kind:'final',term:'Y4S2',courses:[{c:COURSES.list.find(c=>c.id==='const_1'),exam:{kind:'makeup',day:G.day+3,t0:10},units:STUDY.units(G,'const_1','Y1S1','final')}]}:null;   /* 測試用：期末（補考）那一種的總複習也開著 */
      STUDY.REVIEW_EXTRA.push(extra); let a=null; try{ a=opt(G); } finally { STUDY.REVIEW_EXTRA.splice(STUDY.REVIEW_EXTRA.indexOf(extra),1); } const b=opt(G);
      check('p1. 期末（含補考）和司法官二試同時開著：期末那一項先（kind final）；期末沒有了＝司法官二試',!!a&&a!=='ERR'&&a.kind==='final'&&!!b&&b!=='ERR'&&b.kind==='judge',J({a:a&&a.kind,b:b&&b.kind})); }
    { const g0=PG.gradReview, b0=PG.barReview, mk=at=>({y:2030,day:Math.floor(at/24),at,open:G.day-1}); let r=[];
      try{ PG.gradReview=()=>mk(ja-24); r.push(opt(G)); PG.gradReview=()=>mk(ja+24); r.push(opt(G)); PG.barReview=()=>({y:2030,day:Math.floor((ja-48)/24),at:ja-48}); r.push(opt(G)); } finally { PG.gradReview=g0; PG.barReview=b0; }
      check('p2. 考試之間（測試把研究所、國考一試的開放時間改成同時開著）：開考最早的那一場——研究所比二試早＝研究所；比二試晚＝二試；國考一試最早＝國考一試',r.length===3&&r.every(o=>!!o&&o!=='ERR')&&r[0].kind==='grad'&&r[1].kind==='judge'&&r[2].kind==='bar',J(r.map(o=>o&&o.kind))); } });
  /* ---------- m 提醒 ---------- */
  await sec('m',async()=>{ const RJ=/^【國考】.*司法官二試/, RG=/^【研究所】/;
    { const G=judgeSave('2029-09-15',10); ruleAt(G,'2029-09-21',19.9); const n0=sysOf(G,RJ).length; ruleAt(G,'2029-09-21',20.05); const a=sysOf(G,RJ);
      check('m1. 一試到司法官：9/21（總複習開放那天）20:00 系統訊息一則「【國考】10/21 司法官二試。從今天起…要六個小時。」（tag judge_remind_open_2029）；20:00 以前沒有',n0===0&&a.length===1&&a[0][0]==='2029-09-21'&&a[0][2]==='【國考】10/21 司法官二試。從今天起，坐到書桌或讀書的位子，可以把四年的筆記一次讀過一遍，要六個小時。'&&a[0][3]==='judge_remind_open_2029',J(a));
      ruleAt(G,'2029-09-22',20.1); const b0=sysOf(G,RJ).length; ruleAt(G,'2029-10-14',19.9); const b1=sysOf(G,RJ).length; ruleAt(G,'2029-10-14',20.05); const b=sysOf(G,RJ);
      check('m2. 隔天不再發；二試前一週的週日（10/14）20:00 第二則「【國考】10/21（日）司法官二試。考前想…」（tag judge_remind_week_2029）',b0===1&&b1===1&&b.length===2&&b[1][0]==='2029-10-14'&&CALENDAR.dateOf(DAY('2029-10-14')).wd%7===0&&b[1][2]==='【國考】10/21（日）司法官二試。考前想把四年的筆記讀過一遍，坐到書桌或讀書的位子就可以。'&&b[1][3]==='judge_remind_week_2029',J(b));
      ruleAt(G,'2029-10-18',20.1); check('m3. 之後不再發（各一次）',sysOf(G,RJ).length===2,J(sysOf(G,RJ))); }
    { const G=judgeSave('2029-09-15',10,{flags:{BAR_SCORE_2029:13,BAR_STAGE_2029:'lawyer'}}); for(const k of ['2029-09-21','2029-10-14']) ruleAt(G,k,20.1);
      check('m4. 一試只到律師：兩則都沒有（要考司法官二試的人才有）',!sysOf(G,RJ).length&&!sysOf(G,/司法官二試/).length,J(sysOf(G,RJ))); }
    { const G=grad29('2029-01-01',10); ruleAt(G,'2029-01-04',19.9); const n0=sysOf(G,RG).length; ruleAt(G,'2029-01-04',20.05); const a=sysOf(G,RG); ruleAt(G,'2029-01-05',20.1); const a2=sysOf(G,RG).length;
      ruleAt(G,'2029-01-28',19.9); const b1=sysOf(G,RG).length; ruleAt(G,'2029-01-28',20.05); const b=sysOf(G,RG); ruleAt(G,'2029-02-01',20.1);
      check('m5. 研究所 2029（寒假）：1/4 20:00「【研究所】2/3 筆試。從今天起…一次讀過一遍，要四個小時。」（AA_692 定稿；tag grad_remind_open_2029）；隔天不再發',n0===0&&a.length===1&&a[0][0]==='2029-01-04'&&a[0][2]==='【研究所】2/3 筆試。從今天起，坐到書桌或讀書的位子，可以把公法的筆記一次讀過一遍，要四個小時。'&&a[0][3]==='grad_remind_open_2029'&&a2===1,J(a));
      check('m6. 筆試前一週的週日（1/28）20:00 第二則「【研究所】2/3（六）筆試。考前想把公法的筆記讀過一遍…」（tag grad_remind_week_2029）；之後不再發',b1===1&&b.length===2&&b[1][0]==='2029-01-28'&&b[1][2]==='【研究所】2/3（六）筆試。考前想把公法的筆記讀過一遍，坐到書桌或讀書的位子就可以。'&&b[1][3]==='grad_remind_week_2029'&&sysOf(G,RG).length===2,J(b)); }
    { const a=grad29('2029-01-01',10,{flags:{Y4_PUSH:'pass'},tr:false}), b=grad29('2029-01-01',10,{flags:{Y4_PATH:'bar'},tr:false}); for(const G of [a,b]) for(const k of ['2029-01-04','2029-01-28']) ruleAt(G,k,20.1);
      check('m7. 沒報研究所筆試（推甄上了、選國考）：兩則都沒有',!sysOf(a,RG).length&&!sysOf(b,RG).length); }
    { const G=grad30('2030-01-10',10,{tr:false}); ruleAt(G,'2030-01-17',20.05); ruleAt(G,'2030-02-10',20.05); const c=sysOf(G,RG);
      check('m8. 研究所 2030（明年再考）：1/17 20:00「【研究所】2/16 筆試。…」、2/10（日）20:00「【研究所】2/16（六）筆試。…」',c.length===2&&c[0][0]==='2030-01-17'&&c[0][2]==='【研究所】2/16 筆試。從今天起，坐到書桌或讀書的位子，可以把公法的筆記一次讀過一遍，要四個小時。'&&c[1][0]==='2030-02-10'&&c[1][2]==='【研究所】2/16（六）筆試。考前想把公法的筆記讀過一遍，坐到書桌或讀書的位子就可以。'&&c[0][3]==='grad_remind_open_2030'&&c[1][3]==='grad_remind_week_2030',J(c)); }
    { const G=grad29('2029-01-04',18,{tr:false}); ruleAt(G,'2029-01-04',18); ruleAt(G,'2029-01-05',8); const a=(G.msgs||[]).filter(m=>m.tag==='grad_remind_open_2029');
      check('m9. 學期中睡過頭（1/4 18:00 → 1/5 08:00 才跑手機規則）：照原本的時間補進去（1/4 20:00）',a.length===1&&K(a[0].day)==='2029-01-04'&&a[0].h===20,J(a.map(m=>[K(m.day),m.h]))); }
    { const G=grad29('2029-01-04',10,{zone:'dorm',tr:false}); G.home={at:true}; const o={}; await HOME.breakJump(GM,AT('2029-01-06',10),o); const a=(G.msgs||[]).filter(m=>m.tag==='grad_remind_open_2029'), stopAt=[K(G.day),G.hour];
      const s1=stopOf('judge'), s2=stopOf('grad'); H.at('2029-01-02',10); const st=[s1?s1(G):'none',s2?s2(G):'none'];
      check('m10. 寒假在家的快轉（HOME.breakJump）：停在 1/4 20:00 那一則（收到訊息本來就停，不另外加停點）；學期中 PG.stops 的兩個新停點不給時間',o.why==='msg'&&J(stopAt)===J(['2029-01-04',20])&&a.length===1&&a[0].h===20&&J(st)===J([null,null])&&!G.flags.PG,J({why:o.why,stopAt,st})); }
    { const G=judgeSave('2029-09-15',10,{tr:false}); const sj=stopOf('judge'), w1=AT('2029-09-21',20), t1=PG.nextStop(G), v1=sj?sj(G):null;
      check('m11. 畢業以後篇：PG.stops 的司法官二試停點＝9/21 20:00；「跳到下一件事」的下一站不晚於它',!!sj&&v1===w1&&t1!=null&&t1<=w1+1e-6,J({v1,t1,w1}));
      H.at('2029-09-21',19); const t2=PG.nextStop(G); const res=t2!=null?PG.jumpTo(GM,t2):null; const got=sysOf(G,RJ);
      check('m12. 9/21 19:00 跳到下一件事：停在 20:00（PG.jumpTo 回 msg）、那一則剛送到',t2===w1&&res==='msg'&&G.hour===20&&got.length===1&&got[0][3]==='judge_remind_open_2029',J({t2,res,h:G.hour,got}));
      H.at('2029-09-22',10); const w2=AT('2029-10-14',20), v2=sj?sj(G):null, t3=PG.nextStop(G);
      check('m13. 第一則傳了以後：停點換成 10/14 20:00（第二則）',v2===w2&&t3!=null&&t3<=w2+1e-6,J({v2,t3,w2})); }
    { const G=grad30('2030-01-10',10,{tr:false}); const sg=stopOf('grad'), w=AT('2030-01-17',20), v=sg?sg(G):null, t=PG.nextStop(G);
      check('m14. 研究所 2030（畢業以後）：PG.stops 的研究所停點＝1/17 20:00；下一站不晚於它',!!sg&&v===w&&t!=null&&t<=w+1e-6,J({v,t,w})); } });
  /* ---------- o 舊存檔 ---------- */
  await sec('o',async()=>{ const on0=STORY.onStudy; STORY.onStudy=()=>{};
    try{ { const G=judgeSave('2029-10-06',10,{tr:{k:2}}); delete G.study; delete PG.rec(G).judge; const S0=JSON.parse(J(G)); H.G=S0; let err=null, o=null, r=null, q=null;
        try{ STUDY.rec(S0); o=STUDY.reviewOpt(S0); picks=['先讀到這裡']; r=await STUDY.review(GM,o&&o.kind||'judge'); q=PG.drawJudge(S0,2029); }catch(e){ err=String(e&&e.stack||e); }
        check('o1. v9.10 結構的存檔（PG 有 done、exam，沒有 judge、grad；沒有 G.study）在二試前讀進來：觀念卡 backfill、司法官二試總複習的選項、按一次、二試抽題都不報錯',!err&&!!o&&o.kind==='judge'&&!!r&&r.kind==='judge'&&!!q&&q.length===10,err||J(o&&o.hint)); }
      { const G=judgeSave('2029-10-06',10,{tr:{k:2}}); PG.rec(G).judge={2028:null,2027:{qs:null},2029:{}}; let err=null, q=null, o=null; try{ o=STUDY.reviewOpt(G); q=PG.drawJudge(G,2029); }catch(e){ err=String(e&&e.stack||e); }
        check('o2. PG.judge 有空的、壞的年份（null、qs:null、{}）：不報錯，2029 照新規則抽 10 題',!err&&!!o&&o.kind==='judge'&&!!q&&q.length===10,err||''); }
      { const G=grad29('2029-01-20',10,{tr:{k:2}}); delete G.study; const S0=JSON.parse(J(G)); H.G=S0; let err=null, r=null; const before=J(S0.flags);
        try{ STUDY.rec(S0); picks=['先讀到這裡']; r=await STUDY.review(GM,'grad'); }catch(e){ err=String(e&&e.stack||e); }
        check('o3. 寒假的舊存檔（沒有 G.study、沒有 flags.PG）做研究所總複習：不報錯、不建 flags.PG、不改 flags',!err&&!!r&&r.kind==='grad'&&!S0.flags.PG&&J(S0.flags)===before,err||''); }
    } finally { STORY.onStudy=on0; } });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
