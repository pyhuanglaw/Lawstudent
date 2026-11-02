// D118-B6 職涯落點 v2（docs/handoff/D118_PLAN.md 第 4 節 B6、第 1 節 ①-2／①-3／③-5、第 13 節；BB Q3／Q4（CC M7）；CC N4）——不需要瀏覽器。
//   (a) careerLean v2：法服週六 30 次和 3 次、自習 500 小時和 0 小時＝結果一樣（不准隱藏累計、不能刷）；只算 ge_ 通識（國文、英文、體育不算）；期末平均答對高（pushLevel high）+2；交換回來 +2（不再固定落 C）
//   (b) 有律師證照（BAR_YEAR）一定在律師家族：A→A_bar、C＋子晴線→C_zq、B＋研究所錄取→B_grad、其他（含傾向 C 沒子晴線、出國回來、B 沒上研究所）→L_firm；FIRST.me／EPI.last 都有 L_firm
//   (c) 研究所筆試照作答（GRAD_SCORE_<年>：10 題公法、≥6 錄取）；總圖 0 天和 200 天結果一樣；7 題錄取、3 題落榜
//   (d) 舊存檔已經記了 GRAD_EXAM_2029_PASS（照總圖天數算的）＝照舊，不再考
//   (e) 第一份工作照片和尾聲最後一句同一個落點（S.path）；2030 一試錯過的人照片不是「補習班」
//   修改前 FAIL。用法：node tests/d118_b6_unit.js
const H=require('./pg_harness.js'); const {check}=H;
const fs=require('fs'), vm=require('vm'), path=require('path');
{ const NAMES=/^(R2Y4A|R2Y4A_EVENTS|R2Y4B|R2Y4B_EVENTS|FD)$/; global.CG_REGISTRY=global.CG_REGISTRY||{};
  const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  for(const f of ['src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f); }
const GM=H.GM; GM.spawnCharacter=()=>null;
const graduated=G=>{ G.flags.GRADUATED=PG.gradDay(); PG.rec(G).done.grad=1; };
const answerK=(qs,k)=>qs.map((q,i)=>{ const o=PG.opts(q); const right=o.findIndex(x=>String(x.v)===String(q.answer)); return i<k?right:(right===0?1:0); });
const FAMILY=['A_bar','C_zq','B_grad','L_firm'];
(async()=>{
  check('0. 有 STORY.pushHigh、PG.gradQuiz、PG.isJ、POSTGRAD_LINES.EPI.last.L_firm',typeof STORY.pushHigh==='function'&&typeof PG.gradQuiz==='function'&&typeof PG.isJ==='function'&&!!POSTGRAD_LINES.EPI.last.L_firm);
  if(typeof PG.gradQuiz!=='function'){ console.log('FAILED'); process.exit(1); }
  const mk=(key,flags)=>{ const G=H.fresh(key||'2028-10-01',15,'campus',flags||{}); G.stats.study=0; G.vac={reg:{}}; G.acts={att:{}}; G.courses={grades:{}}; return G; };
  const L=G=>STORY.careerLean(G);
  // ---- (a) ----
  { const G=mk(); G.flags.LAWCLUB_SAT_VISITS=30; G.stats.study=500; const a=L(G); G.flags.LAWCLUB_SAT_VISITS=3; G.stats.study=0; const b=L(G);
    check('a1. 法服週六 30 次／3 次、自習 500／0 小時＝careerLean 一樣（D118_PLAN B6 (a)）',JSON.stringify(a)===JSON.stringify(b),JSON.stringify([a,b]));
    G.stats.study=5000; for(let d=0;d<40;d++) G.acts.att['public_law_group@'+d]={end:'full'}; const c=L(G);
    check('a2. 讀書會出席最多算 3、自習時數不算（BB Q4：不能刷）',c.B===3,JSON.stringify(c)); }
  { const G=mk(); G.courses.grades={Y1S1:{chinese_y1:'及格',english_y1:'及格',pe_y1s1:'及格'},Y1S2:{pe_y1s2:'及格'}}; const a=L(G).C; G.courses.grades.Y1S1.ge_film_y1s1='及格'; const b=L(G).C;
    check('a3. 只算真正的通識（ge_），國文、英文、體育不算（BB Q3）',a===0&&b===1,a+' '+b); }
  { const G=mk(); const C=CLS.rec(G); C.exam={}; for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']) C.exam[t+':civ_x:final']={status:'done',correct:5};
    const a=L(G); for(const t of ['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2']) C.exam[t+':civ_x:final']={status:'done',correct:1}; const b=L(G);
    check('a4. 期末平均答對高（大一～大三）＝B +2；低＝不加（看課業）',a.B===2&&b.B===0&&STORY.pushHigh(G)===false,JSON.stringify([a,b])); }
  { const G=mk('2028-09-10',{EXCHANGE_ROUTE:'JP'}); const r=L(G);
    check('a5. 交換回來只 +2（原本 +6，出國回來幾乎固定落 C）',r.C===2,JSON.stringify(r)); }
  // ---- (b) ----
  { const stub=c=>{ STORY.careerLean=()=>c; }; const orig=STORY.careerLean;
    const LEANS={A:{A:5,B:0,C:0,top:'A'},B:{A:0,B:5,C:0,top:'B'},C:{A:0,B:0,C:5,top:'C'},Bc:{A:0,B:5,C:3,top:'B'}};
    let bad=[], n=0;
    for(const ln in LEANS) for(const grad of ['none','admit','fail']) for(const zq of [false,true]) for(const dly of [false,true]){
      const G=H.fresh('2030-12-20',12,'dorm',{BAR_YEAR:2029,EXCHANGE_ROUTE:dly?'JP':undefined}); if(zq){ H.FRIEND('heroine_04'); G.flags.ZQ_CONTRACT='lawyer'; } stub(LEANS[ln]);
      if(grad!=='none'){ G.flags.Y4_PATH='grad'; if(grad==='admit') G.flags.GRAD_ADMIT='exam'; else G.flags.GRAD_QUIT=true; }
      const p=PG.path(G); n++; if(!FAMILY.includes(p)) bad.push([ln,grad,zq,dly,p].join('/')); }
    check('b1. 有 BAR_YEAR 的 '+n+' 組都在律師家族（A_bar／C_zq／B_grad／L_firm）',!bad.length,bad.slice(0,5).join(' '));
    const one=(ln,o)=>{ const G=H.fresh('2030-12-20',12,'dorm',Object.assign({BAR_YEAR:2029},o||{})); stub(LEANS[ln]); return G; };
    let G=one('C'); check('b2. 有 BAR_YEAR、傾向 C、沒有子晴線＝L_firm（原本出版社）',PG.path(G)==='L_firm');
    G=one('B',{Y4_PATH:'grad',GRAD_QUIT:true}); check('b3. 傾向 B、研究所沒上＝L_firm（原本研究室助理）',PG.path(G)==='L_firm');
    G=one('A'); check('b4. 傾向 A＝A_bar',PG.path(G)==='A_bar');
    G=one('B',{Y4_PATH:'grad',GRAD_ADMIT:'exam'}); check('b5. 傾向 B、研究所錄取＝B_grad',PG.path(G)==='B_grad');
    G=one('C',{BAR_YEAR:undefined}); delete G.flags.BAR_YEAR; check('b6. 沒有證照照舊（傾向 C＝C）',PG.path(G)==='C');
    G=H.fresh('2030-12-20',12,'dorm',{}); stub({A:0,B:0,C:0,top:'B'}); check('b7. 什麼都沒做、沒有證照＝A_none（BB 可以接受）',PG.path(G)==='A_none');
    STORY.careerLean=orig;
    check('b8. L_firm 有第一份工作照片（AA_582 (j)）和尾聲最後一句',POSTGRAD_LINES.FIRST.me.L_firm==='（照片：事務所會議室的白板。上面是你寫的第一份案件時間表。）'&&POSTGRAD_LINES.EPI.last.L_firm==='我在事務所。這禮拜寫了兩份書狀，有一份我改了七次。'); }
  // ---- (c) 研究所筆試作答 ----
  { const run=async(k,libDays)=>{ const G=H.fresh('2029-02-03',8.5,'campus',{Y4_PATH:'grad',examSeed:4242}); if(libDays) G.habits={'place:library:day':{n:libDays,days:Array.from({length:libDays},(_,i)=>PG.DK('2028-09-04')+i)}};
      const qs=PG.drawGrad(G,2029); H.picks=answerK(qs,k); H.said=[]; await PG.gradQuiz(GM,2029); H.picks=[]; G.flags.GRAD_EXAM_2029=true; return {G,qs}; };
    const r7=await run(7,0), r3=await run(3,200), r3b=await run(3,0);
    check('c1. 10 題、都是公法（憲法一、二、行政法、行政救濟法）、已核對的題、照期末考的介面',r7.qs.length===10&&r7.qs.every(q=>PG.GRAD_COURSES.includes(q.course)&&PG.OK_STATUS.includes(q.status))&&H.said.some(x=>x.t.startsWith('1／10　')));
    check('c2. 答對 7＝錄取、3＝落榜（GRAD_SCORE_2029；GRAD_EXAM_2029_PASS 同步）',r7.G.flags.GRAD_SCORE_2029===7&&R2Y4A.gradExamPass(r7.G)===true&&R2Y4B.gradPass2029(r7.G)===true&&r3.G.flags.GRAD_SCORE_2029===3&&R2Y4B.gradPass2029(r3.G)===false);
    check('c3. 總圖 0 天和 200 天結果一樣（只看作答，D118 ①-3）',R2Y4B.gradPass2029(r3.G)===R2Y4B.gradPass2029(r3b.G)&&R2Y4A.gradExamPass(r3.G)===false);
    const ev=STORY_EVENTS.find(e=>e.id==='ev_grad_exam'); check('c4. 2/3 考場（ev_grad_exam）裡作答（call → PG.gradQuiz）',!!ev&&ev.dialogue.some(l=>typeof l.call==='function'));
    const G5=H.fresh('2030-02-16',9,'campus',{EXCHANGE_ROUTE:'US',Y4_PATH:'grad',Y5_DAYS:'study',examSeed:7}); const q5=PG.drawGrad(G5,2030); H.picks=answerK(q5,5); await R2Y4B.gradExam(GM,2030); H.picks=[];
    check('c5. 交換延畢 2030 筆試也作答（GRAD_SCORE_2030）；Y5_DAYS study 門檻 5',G5.flags.GRAD_SCORE_2030===5&&R2Y4B.gradPass2030(G5)===true&&G5.flags.GRAD_EXAM_2030===true);
    G5.flags.Y5_DAYS='work'; check('c5. Y5_DAYS 不是 study：5 題不上',R2Y4B.gradPass2030(G5)===false);
    const r2=PG.drawGrad(r7.G,2030); check('c6. 第二年換題',r2.every(q=>!r7.qs.includes(q))); }
  // ---- (d) 舊存檔 ----
  { const G=H.fresh('2029-02-03',8.5,'campus',{Y4_PATH:'grad',GRAD_EXAM_2029_PASS:true}); H.said=[]; const k=await PG.gradQuiz(GM,2029);
    check('d1. 已經記了 GRAD_EXAM_2029_PASS 的舊存檔：不再考、結果照舊',k===null&&!H.said.length&&R2Y4B.gradPass2029(G)===true&&R2Y4A.gradExamPass(G)===true);
    const G2=H.fresh('2029-03-22',16,'campus',{Y4_PATH:'grad',GRAD_EXAM_2029:true}); G2.habits={'place:library:day':{n:30,days:Array.from({length:30},(_,i)=>PG.DK('2028-10-01')+i)}};
    check('d2. 考試日過了、沒有作答也沒有 GRAD_EXAM_2029_PASS 的舊存檔：照舊規則（總圖天數）算一次',R2Y4B.gradPass2029(G2)===true); }
  // ---- (e) 第一份工作照片和尾聲同一個落點 ----
  { const G=H.fresh('2030-10-01',20,'dorm',{BAR_YEAR:2029,EXCHANGE_ROUTE:'JP'}); graduated(G); PHONE.join(G,'noodle_team','麵店團'); await H.run('first');
    const ph=(G.msgs||[]).find(m=>m.tag==='pg_first_day'&&m.from==='player'); check('e1. 出國回來、有證照：照片＝S.path 的那一張（律師家族）',!!ph&&ph.text==='📷'+POSTGRAD_LINES.FIRST.me[PG.path(G)]&&FAMILY.includes(PG.path(G)),ph&&ph.text+' '+PG.path(G));
    const G2=H.fresh('2030-10-01',20,'dorm',{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:4,BAR_STAGE_2029:'none'}); graduated(G2); PG.rec(G2).done.exam_2030='missed'; PHONE.join(G2,'noodle_team','麵店團'); H.said=[]; await H.run('first');
    const ph2=(G2.msgs||[]).find(m=>m.tag==='pg_first_day'&&m.from==='player');
    check('e2. 2030 一試錯過：照片不是「補習班」（firstLate 不算錯過的）、沒有「你的第一天，還在後面。」',!!ph2&&ph2.text==='📷'+POSTGRAD_LINES.FIRST.me[PG.path(G2)]&&!H.has(POSTGRAD_LINES.FIRST.lateNarr),ph2&&ph2.text); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
