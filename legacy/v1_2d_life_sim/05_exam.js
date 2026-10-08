/* ===== 05 考試引擎：期中／期末、小考、分組報告 ===== */
const STYLE_W={ sys:{u:.28,s:.28,m:.14,r:.14,i:.08,a:.08}, case:{u:.2,s:.1,m:.1,r:.15,i:.25,a:.2}, disc:{u:.25,s:.15,m:.1,r:.1,i:.15,a:.1,part:.15}, prac:{u:.2,s:.1,m:.1,r:.15,i:.2,a:.25}, report:{u:.3,s:.2,m:.1,r:.1,i:.15,a:.15} };
const DIM_NAME={u:'概念理解',s:'體系',m:'記憶熟悉',r:'提取',i:'爭點辨識',a:'涵攝',part:'課堂參與'};
function prepScore(cid){
  const c=G.courses[cid]; const co=COURSES[cid]; const w=STYLE_W[TEACHERS[co.teacher].style]||STYLE_W.sys;
  const m=Math.min(100,c.m+c.cram), r=Math.min(100,c.r+c.cram*0.8); const d={u:c.u,s:c.s,m,r,i:c.i,a:c.a,part:c.part};
  let p=0; for(const k in w) p+=w[k]*(d[k]||0);
  return {p:clamp(p,0,100), d, w};
}
function examCaseFor(cid, which){
  const key=cid+'_'+which; if(CASES[key]) return CASES[key];
  const subj=COURSES[cid].subj||'civ'; const bank=SUBJ_CASE[subj]||SUBJ_CASE.civ; const idx=(which==='mid'?0:1)+(G.time.year-1); return CASES[bank[idx%bank.length]];
}
function startExamWeek(which){
  const cs=examCoursesNow(); if(!cs.length){ G.lastExam=which; nextBlock(); return; }
  G.examQueue=cs.slice(); G.examWhich=which; G.examResults=[]; G.screen='examIntro'; save();
}
function examBegin(){
  const cid=G.examQueue[0]; const co=COURSES[cid]; const T=TEACHERS[co.teacher]; const pr=prepScore(cid);
  G.exam={ cid, which:G.examWhich, step:0, T:100, used:0, q:[], prep:pr.p, case:examCaseFor(cid,G.examWhich), bonusQ3:0, log:[] };
  G.screen='exam'; save();
}
function examOptions(step){
  const e=G.exam; const p=G.player;
  if(step===0) return [
    {k:'A', label:'繼續完整處理第一題', hint:'寫完整，但會花很多時間'},
    {k:'B', label:'先寫出主要爭點，跳到下一題', hint:'省時間；分數看你抓不抓得到主要爭點'},
    {k:'C', label:'快速掃描剩下的題目，重新分配時間', hint:'多花幾分鐘，但後面比較從容'},
  ];
  if(step===1) return e.case.opts.map((o,i)=>({k:o.k, label:o.t, idx:i}));
  const R=e.T-e.used; const spd=p.skills.speed;
  return [
    {k:'full', label:'完整的三段論：爭點、規範、涵攝、結論', hint:'需要約 '+Math.round(35*(1-spd/300))+' 分鐘'},
    {k:'list', label:'條列出爭點與結論，涵攝寫簡單一點', hint:'需要約 '+Math.round(20*(1-spd/300))+' 分鐘'},
    {k:'concl', label:'只寫結論和關鍵理由', hint:'需要約 10 分鐘'},
  ];
}
function examAnswer(k, idx){
  const e=G.exam; const p=G.player; const c=e.bar?barAvgDims():G.courses[e.cid]; const spd=p.skills.speed, str=p.skills.structure; const i=c.i, a=c.a;
  if(e.step===0){
    let time,q,txt;
    if(k==='A'){ time=Math.round(45-spd*0.12); q=0.72+0.28*(i/100); txt= i>=40?'你把三個爭點都寫了。寫完抬頭看鐘，'+(time>40?'花掉的時間比想像中多。':'還好，速度不慢。'):'你寫了很多，但寫到第三個爭點時，開始懷疑前兩個抓得對不對。'; if(i<30) q*=0.9; }
    else if(k==='B'){ time=25; q=0.7+0.22*(i/100); txt= i>=30?'主要爭點寫出來了，其他的用一句話帶過。':'你寫了一個爭點，但不太確定那是不是主要的。'; }
    else { time=32; q=0.88; e.bonusQ3=6; txt='你翻了整份考卷，發現第三題其實最好拿分。你在心裡重新分配了時間。'; }
    e.used+=time; e.q.push({q,k,time,txt}); e.step=1;
  } else if(e.step===1){
    const o=e.case.opts[idx]; const base={core:1,sec:0.75,tan:0.5,irr:0.25}[o.k]; const q=Math.min(1,base*(0.8+0.2*(a/100))*(e.q[0].k==='C'?1.05:1));
    const time=Math.round(30-spd*0.06); e.used+=time; e.q.push({q,k:o.k,time,txt:o.why,pickTxt:o.t}); e.step=2;
  } else {
    let R=e.T-e.used+e.bonusQ3; let need,q,txt;
    if(k==='full'){ need=35*(1-spd/300); const comp=Math.min(1,R/need); q=comp*(0.8+0.2*(str/100)); txt= comp>=1?'寫完了。最後五分鐘在檢查錯字。':'鐘響的時候你寫到涵攝的一半。完成約 '+Math.round(comp*100)+'%。'; }
    else if(k==='list'){ need=20*(1-spd/300); const comp=Math.min(1,R/need); q=comp*0.8*(0.85+0.15*(str/100)); txt= comp>=1?'條列寫完了，涵攝很薄，但每個爭點都有結論。':'連條列都沒寫完。'; }
    else { need=10; const comp=Math.min(1,R/need); q=comp*0.5; txt='寫了結論和兩句理由。老師大概看得出你知道答案，但看不出你為什麼知道。'; }
    e.q.push({q,k,time:Math.min(R,need),txt}); e.step=3; if(e.bar) barExam2Finish(); else examFinishCourse();
  }
  save();
}
function examFinishCourse(){
  const e=G.exam; const c=G.courses[e.cid]; const co=COURSES[e.cid]; const p=G.player; const pr=prepScore(e.cid);
  let cond=1; if(p.energy<30) cond*=0.92; if(p.stress>80) cond*=0.93;
  const strat=0.35*e.q[0].q+0.30*e.q[1].q+0.35*e.q[2].q;
  let score=22+pr.p*0.98*strat*cond - (G.examPenalty||0) + rnd(-3,3); score=Math.round(clamp(score,5,100));
  p.skills.speed=clamp(p.skills.speed+0.6,0,100); p.skills.structure=clamp(p.skills.structure+0.5,0,100);
  if(e.which==='mid') c.mid=score; else c.fin=score;
  c.cram*=0.35;
  // 回饋
  const d=pr.d, w=pr.w; const dims=Object.keys(w).filter(k=>k!=='part'); let best=dims[0], worst=dims[0]; for(const k of dims){ if(d[k]>d[best]) best=k; if(d[k]<d[worst]) worst=k; }
  const strong={u:'理解很好',s:'體系很清楚',m:'記得很多',r:'複習做得夠，該想起來的都想起來了',i:'爭點抓得準',a:'涵攝寫得紮實'}[best];
  const weak={u:'但基礎概念還不夠穩',s:'但架構還沒建立起來，寫的時候東一塊西一塊',m:'但很多內容其實沒記熟',r:'但有些明明看過的東西，考場上就是提取不出來',i:'但爭點抓得不夠準',a:'但涵攝寫得太薄，看得出你知道結論卻沒有把事實套進去'}[worst];
  const parts=[];
  parts.push('你的'+co.name+strong+ (d[worst]<40?'，'+weak:'') +'。');
  const q0=e.q[0], q1=e.q[1], q2=e.q[2];
  if(q0.k==='A'&&q0.time>40) parts.push('第一題花掉太多時間。');
  if(q0.k==='B'&&c.i<30) parts.push('第一題你選擇先寫主要爭點，但抓到的不是最主要的那個。');
  if(q1.k==='sec') parts.push('第二題你記得相關見解，但沒有先處理題目真正的核心問題。');
  if(q1.k==='tan'||q1.k==='irr') parts.push('第二題的方向抓錯了，寫得再多也拿不到分。');
  if(q1.k==='core') parts.push('第二題直接切進核心，這是這份考卷最好的部分。');
  if(q2.q<0.5&&q2.k==='full') parts.push('第三題最後只完成約'+Math.round(Math.min(1,(e.T-e.used+e.bonusQ3)/(35*(1-p.skills.speed/300)))*100)+'%。');
  if(q2.k==='concl') parts.push('第三題只寫結論，分數很有限。');
  if(TEACHERS[co.teacher].style==='sys'&&d.s<35) parts.push('這位老師很看重體系位置，你的答案沒有先講「這個概念放在哪裡」。');
  if(TEACHERS[co.teacher].style==='case'&&d.i<35) parts.push('案例派的考試，重點永遠在爭點。');
  if(TEACHERS[co.teacher].style==='disc'&&d.part<20) parts.push('這學期你在課堂上幾乎沒有講過話，老師對你沒什麼印象。');
  if(c.cram>8) parts.push('考前硬塞的那些，一兩週後大概會忘掉一半。');
  e.result={score, text:parts.join(''), best, worst, d};
  G.examResults.push({cid:e.cid,score});
  diary(co.name+(e.which==='mid'?'期中':'期末')+' '+score+' 分');
  G.screen='examResult'; save();
}
function examNext(){
  G.examQueue.shift();
  if(G.examQueue.length){ examBegin(); return; }
  const avg=G.examResults.reduce((a,r)=>a+r.score,0)/G.examResults.length;
  G.lastExam=G.examWhich; G.examPenalty=0;
  if(G.examWhich==='mid'&&avg<55) setFlag('mid_bad');
  G.player.stress=clamp(G.player.stress-12,0,100);
  G.pendingEvent=null; nextBlock();
}
// ---------- 大一上第一次小考與分組報告 ----------
function quizAnswer(idx){
  const q=QUIZ_CIV1[G.quiz.i]; const ok=idx===q.a; G.quiz.answers.push({ok,why:q.why,pick:q.opts[idx]}); if(ok) G.quiz.score++;
  G.quiz.i++; if(G.quiz.i>=QUIZ_CIV1.length){ const c=G.courses.civ1; if(c){ c.part=clamp(c.part+G.quiz.score*4,0,100); gain('civ1',{r:2,i:2},1); } if(G.quiz.score>=3) setFlag('quiz_good'); if(G.quiz.score<=1) setFlag('quiz_bad'); G.quiz.stage='assign'; }
  save();
}
function assignChoose(k){
  const p=G.player; let s=0, txt='';
  if(k==='lead'){ s=70+p.skills.research*0.6+(G.npcs.an.rel>=10?6:0); txt='你把整份報告的架構扛下來，小安負責查資料，阿哲負責簡報。報告前一晚你只睡四小時，但報告很完整。'; p.energy-=8; p.stress+=6; addRel('an',4); addRel('zhe',4); p.skills.structure+=1.5; }
  else if(k==='split'){ s=62+p.skills.research*0.4+(G.npcs.an.rel+G.npcs.zhe.rel)*0.15; txt='三個人平均分工。合起來的時候發現三段的格式都不一樣，花了一個晚上統一。'; addRel('an',2); addRel('zhe',2); }
  else { s=66+p.skills.research*0.3+(G.npcs.sis.rel>=8?10:0); txt= G.npcs.sis.rel>=8?'你把初稿拿給溫學姊看。她畫了六個問號，全部都是對的。':'你想找學長姐看，但還不熟，最後自己改了兩遍。'; addRel('sis',G.npcs.sis.rel>=8?4:1); p.skills.research+=1; }
  s=Math.round(clamp(s+rnd(-3,3),40,100)); G.assignScore=s; G.quiz.assignTxt=txt; G.quiz.assignScore=s; G.quiz.stage='done'; G.quizDone=true; diary('法緒分組報告 '+s+' 分；民總小考 '+G.quiz.score+'/3'); save();
}

function barAvgDims(){ const S=G.bar.subj; const d={u:0,s:0,m:0,r:0,i:0,a:0}; for(const k of SUBJ_IDS) for(const x in d) d[x]+=S[k][x]/6; return d; }
