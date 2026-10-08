/* ===== 07 國考：備考、一試二試、訓練、落榜分岔 ===== */
// 制度依應考人常見的說明整理（一試選擇題四卷、二試申論五科＋選試、前 33% 及格、四大核心 800 分中須達 400）；分數線每年不同，遊戲以近似值代替，屬遊戲簡化。
const BAR_ACTS={
  b1:{ id:'b1', name:'第一輪閱讀', cat:'學習', subj:true, scene:'library', pose:'read', desc:'把體系重新建一遍', energy:-8, stress:3 },
  b2:{ id:'b2', name:'第二輪整理', cat:'學習', subj:true, scene:'dorm', pose:'type', desc:'把重點壓成自己的筆記', energy:-7, stress:2 },
  bp:{ id:'bp', name:'練題', cat:'學習', subj:true, scene:'library', pose:'type', desc:'爭點、涵攝、寫完', energy:-9, stress:4 },
  br:{ id:'br', name:'複習與回想', cat:'學習', subj:true, scene:'dorm', pose:'read', desc:'對抗遺忘', energy:-6, stress:1 },
  bmc:{ id:'bmc', name:'選擇題題庫', cat:'學習', subj:false, scene:'dorm', pose:'type', desc:'一試是選擇題：記憶與辨識', energy:-7, stress:2 },
  bm:{ id:'bm', name:'模擬考', cat:'學習', subj:false, scene:'classroom', pose:'type', desc:'找出弱科，很累', energy:-12, stress:6 },
  bc:{ id:'bc', name:'補習班課程', cat:'學習', subj:false, scene:'classroom', pose:'sit', desc:'有人幫你整理，但要錢', energy:-6, stress:1, money:-7000 },
  bg:{ id:'bg', name:'讀書會', cat:'學習', subj:false, scene:'library', pose:'read', desc:'和還在考的同學', energy:-6, stress:0 },
  bwork:{ id:'bwork', name:'打工', cat:'金錢', subj:false, scene:'store', pose:'stand', desc:'補貼生活費', energy:-10, stress:3, money:6000 },
  brest:{ id:'brest', name:'什麼都不做', cat:'生活', subj:false, scene:'dorm', pose:'sleep', desc:'睡眠與恢復', energy:18, stress:-10 },
  bsport:{ id:'bsport', name:'運動', cat:'生活', subj:false, scene:'park', pose:'walk', desc:'', energy:6, stress:-7 },
  bfriend:{ id:'bfriend', name:'見朋友', cat:'人際', subj:false, scene:'street', pose:'stand', desc:'', energy:-2, stress:-6, money:-500 },
  bpartner:{ id:'bpartner', name:'陪伴伴侶', cat:'人際', subj:false, scene:'street', pose:'stand', desc:'', energy:0, stress:-8, money:-700, need:'partner' },
  bhome:{ id:'bhome', name:'回家', cat:'生活', subj:false, scene:'home', pose:'sit', desc:'', energy:8, stress:-6, money:1000 },
};
const BAR_ACT_ORDER=['b1','b2','bp','br','bmc','bm','bc','bg','bwork','brest','bsport','bfriend','bpartner','bhome'];
const BAR_MONTHS=['1月','2月','3月','4月','5月','6月','7月','8月（一試）','9月','10月（二試）','11月','12月（放榜）'];
const ELECTIVES={ ip:{name:'智慧財產法',course:'ip'}, labor:{name:'勞動社會法',course:'labor'}, tax:{name:'財稅法',course:'tax'}, marine:{name:'海商法與海洋法',course:null} };
function barTimeLabel(){ const b=G.bar; return '備考第'+b.year+'年・'+BAR_MONTHS[b.month]; }
function barInitSubjects(){
  const S={}; for(const k of SUBJ_IDS){ const cs=subjCourses(k); const d={u:8,s:6,m:6,r:5,i:5,a:5}; if(cs.length){ for(const dim of ['u','s','m','r','i','a']){ d[dim]=cs.reduce((a,c)=>a+G.courses[c][dim],0)/cs.length; } d.r=d.r*0.8; } S[k]=d; } return S;
}
function barBegin(mode, target, elective){
  G.phase='bar'; G.ctx='bar'; G.postYears=(G.postYears||0);
  G.bar={ mode, target, elective:elective||'labor', month:0, year:1, attempts:0, subj:barInitSubjects(), mocks:[], streak:0, passed1:null, exam2:null, mc:0, results:[] };
  G.barGoal=target; diary('畢業後：'+(mode==='full'?'全職':'工作兼')+'準備'+(target==='both'?'律師與司法官':target==='judge'?'司法官':'律師')+'考試，選試科目：'+ELECTIVES[G.bar.elective].name+'。');
  MAIN_NPCS.forEach(npcLifeUpdate); G.sched=[]; G.screen='plan'; save();
}
function barActs(){ return BAR_ACT_ORDER.map(k=>BAR_ACTS[k]).filter(a=>!(a.need==='partner'&&!G.flags.yu_partner)); }
function barFreeSlots(){ return G.bar.mode==='part'?5:8; }
function barPreview(){
  const lines=[]; let en=0,st=0,mo=0; const touched={}; let study=0,rest=0;
  for(const s of G.sched){ const a=BAR_ACTS[s.act]; if(!a) continue; en+=a.energy; st+=a.stress; mo+=a.money||0; if(a.cat==='學習') study++; if(['brest','bsport'].includes(a.id)) rest++; if(s.course) (touched[s.course]=touched[s.course]||[]).push(a.id); }
  for(const k in touched){ const acts=touched[k]; const up=[]; if(acts.includes('b1')) up.push('理解・體系'); if(acts.includes('b2')) up.push('結構・記憶'); if(acts.includes('bp')) up.push('爭點・涵攝・速度'); if(acts.includes('br')) up.push('提取'); lines.push('<b>'+SUBJ[k].name+'</b>：'+up.join('、')+'<span class="arrow">↑</span>'); }
  if(G.sched.some(s=>s.act==='bmc')) lines.push('一試選擇題手感 <span class="arrow">↑</span>');
  const un=SUBJ_IDS.filter(k=>!touched[k]); if(un.length&&G.sched.length>=4) lines.push('<span class="sub">沒碰：'+un.map(k=>SUBJ[k].short).join('、')+'</span>');
  if(G.bar.mode==='part') mo+=22000;
  lines.push('精力 '+(en>=0?'+':'')+en+'　壓力 '+(st>=0?'+':'')+st+'　金錢 '+(mo>=0?'+':'')+money(mo)+'（生活費另計 −14,000）');
  if(study>=6&&rest===0) lines.push('<span class="arrow d">整個月沒有休息：邊際效益會下降。</span>');
  if(G.bar.streak>=2) lines.push('<span class="arrow d">已連續 '+G.bar.streak+' 個月高強度。</span>');
  return lines;
}
function barEff(){ let e=1; const p=G.player; if(p.energy<30) e*=0.65; else if(p.energy<50) e*=0.85; if(p.stress>75) e*=0.85; e*=Math.max(0.55,1-0.08*G.bar.streak); return e; }
function barResolve(){
  const b=G.bar; const p=G.player; G.log=[]; const S=b.subj;
  pushLog({kind:'n',scene:'library',pose:'read',t:barTimeLabel()+(b.mode==='part'?'（白天在'+(b.job||'事務所')+'工作）':'')});
  let study=0,rest=0; const eff=barEff();
  if(b.mode==='part'){ p.money+=22000; p.energy-=10; p.skills.judgment=clamp(p.skills.judgment+0.8,0,100); pushLog({kind:'line',scene:'firm',pose:'type',t:'白天上班：影印、查資料、整理卷。薪水 +22,000。晚上才是自己的時間。'}); }
  for(const s of G.sched){ const a=BAR_ACTS[s.act]; if(!a) continue; const k=s.course; const d=k?S[k]:null; let t=''; const nm=k?SUBJ[k].short:'';
    switch(a.id){
      case 'b1': d.u=clamp(d.u+8*eff*(1-d.u/140),0,100); d.s=clamp(d.s+5*eff,0,100); d.m=clamp(d.m+4*eff,0,100); t='第一輪讀'+nm+'：'+(d.u>70?'這科已經很熟，再讀課本的邊際效益不高。':'體系重新建了一遍。'); break;
      case 'b2': { const ok=d.u>=30; d.s=clamp(d.s+(ok?8:3)*eff,0,100); d.m=clamp(d.m+(ok?7:3)*eff,0,100); d.r=clamp(d.r+2*eff,0,100); p.skills.structure=clamp(p.skills.structure+1*eff,0,100); t='第二輪整理'+nm+'：'+(ok?'筆記壓成三十頁。':'還沒讀懂就在整理，效果有限。'); break; }
      case 'bp': { const ok=d.u>=30; if(ok){ d.i=clamp(d.i+7*eff,0,100); d.a=clamp(d.a+6*eff,0,100); d.r=clamp(d.r+3*eff,0,100); p.skills.structure=clamp(p.skills.structure+1.2*eff,0,100); p.skills.speed=clamp(p.skills.speed+1.5*eff,0,100); t='練'+nm+'題：'+(p.skills.speed<35?'知道爭點，但常常寫不完。':'爭點與涵攝都在進步。'); } else { d.i=clamp(d.i+2*eff,0,100); t='練'+nm+'題：看到題目不知道從哪裡下手。基礎不足。'; } break; }
      case 'br': d.r=clamp(Math.min(d.m+15,d.r+10*eff),0,100); d.m=clamp(d.m+2*eff,0,100); t='複習'+nm+'：提取度回來了。'; break;
      case 'bmc': b.mc=clamp((b.mc||0)+6*eff,0,100); SUBJ_IDS.forEach(k=>{ S[k].m=clamp(S[k].m+1.2*eff,0,100); S[k].r=clamp(S[k].r+1*eff,0,100); }); t='刷選擇題：一試是四卷選擇題，每題兩分。'+(b.mc<40?'錯的比對的多，但錯的地方都知道為什麼了。':'手感出來了。'); break;
      case 'bm': { const rows=SUBJ_IDS.map(k=>({k,sc:S[k].u*0.2+S[k].r*0.25+S[k].i*0.3+S[k].a*0.25})); rows.sort((x,y)=>x.sc-y.sc); const weak=rows[0]; b.mocks.push({m:b.month,y:b.year,weak:weak.k,avg:rows.reduce((x,y)=>x+y.sc,0)/6}); SUBJ_IDS.forEach(k=>{ S[k].r=clamp(S[k].r+2*eff,0,100); S[k].i=clamp(S[k].i+1.5*eff,0,100); }); p.skills.speed=clamp(p.skills.speed+1*eff,0,100); t='模擬考：最弱的是'+SUBJ[weak.k].name+'（'+Math.round(weak.sc)+'）。'+(p.skills.speed<35?'另外，你三科都沒寫完。':''); break; }
      case 'bc': SUBJ_IDS.forEach(k=>{ S[k].u=clamp(S[k].u+2.5*eff,0,100); S[k].s=clamp(S[k].s+2.5*eff,0,100); }); t='補習班：老師的體系圖很好用。你花了七千塊，換到一份別人的整理。'; break;
      case 'bg': { const anHere=G.careerYears<=2; SUBJ_IDS.forEach(k=>{ S[k].i=clamp(S[k].i+2*eff,0,100); S[k].r=clamp(S[k].r+2*eff,0,100); }); if(anHere) addRel('an',3); addRel('zhe',2); t= anHere?'讀書會：小安把刑訴的爭點表列出來。你們對了一輪，發現大家抓的都不一樣。':'讀書會：還在考的人變少了，話題也變了。'; break; }
      case 'bwork': p.money+=a.money; t='打工。'; break;
      case 'brest': t='什麼都不做。你發現自己已經很久沒有在白天走出圖書館。'; break;
      case 'bsport': t='運動。'; break;
      case 'bfriend': addRel('zhe',4); addRel('kai',3); t='見朋友。有人已經在上班了，聊天的節奏不太一樣。'; break;
      case 'bpartner': addRel('yu',6); t='陪伴。她說你講話的時候眼睛還在看書。你把書收起來。'; break;
      case 'bhome': addRel('mom',4); t='回家。媽媽沒有問考試，你反而有點不習慣。'; break;
    }
    if(a.cat==='學習') study++; if(['brest','bsport'].includes(a.id)) rest++;
    p.energy=clamp(p.energy+a.energy,0,100); p.stress=clamp(p.stress+a.stress,0,100); if(a.money&&a.id!=='bwork') p.money+=a.money;
    pushLog({kind:a.cat==='學習'?'gain':'line',scene:a.scene,pose:a.pose,t});
  }
  SUBJ_IDS.forEach(k=>{ S[k].r=clamp(S[k].r-3,0,100); if(S[k].r<25) S[k].m=clamp(S[k].m-1,0,100); });
  p.energy=clamp(p.energy+12,0,100); p.stress=clamp(p.stress-3+(b.month>=6&&b.month<=9?6:0),0,100); p.money-=14000; if(G.exch.loan&&p.money>50000){ p.money-=4000; }
  if(study>=6&&rest===0) b.streak++; else if(rest>0||study<=3) b.streak=0;
  if(b.streak>=3) setFlag('overwork');
  G.time.absWeek+=4;
  pushLog({kind:'n',scene:'store',pose:'stand',t:'生活費 −14,000。餘額 '+money(p.money)+' 元。'});
  if(p.money<0){ p.money=0; }
  G.pendingEvent=pickEvent(BAR_EVENTS); save();
}
function barReport(){
  const b=G.bar; const S=b.subj; const p=G.player; const lines=[]; const goals=[];
  const rows=SUBJ_IDS.map(k=>({k,d:S[k]})); const lowR=rows.slice().sort((x,y)=>(x.d.m-x.d.r)-(y.d.m-y.d.r)).reverse()[0]; const lowU=rows.slice().sort((x,y)=>x.d.u-y.d.u)[0];
  const avgI=rows.reduce((a,r)=>a+r.d.i,0)/6, avgU=rows.reduce((a,r)=>a+r.d.u,0)/6;
  if(lowR.d.m-lowR.d.r>18) lines.push('目前最大的風險不是'+SUBJ[lowU.k].short+'不會，而是<b>'+SUBJ[lowR.k].name+'</b>的熟悉度正在下降：看過，但提取不出來。');
  else if(lowU.d.u<30) lines.push('<b>'+SUBJ[lowU.k].name+'</b>的基礎還沒建立，先第一輪閱讀。');
  if(avgI>=45&&(p.skills.speed<35||p.skills.structure<35)) lines.push('你抓得到爭點，但最近的練習都出現「知道爭點卻寫不完整」的情況。限時練題、模擬考。');
  if(avgU>=55&&avgI<30) lines.push('你讀得很多，但輸出能力不足。二試是用寫的。');
  if(b.month<7&&(b.mc||0)<30&&b.month>=3) lines.push('一試是選擇題。你還沒怎麼碰題庫。');
  if(b.streak>=2) lines.push('<span class="arrow d">你已經連續 '+b.streak+' 個月高強度學習，繼續硬讀的邊際效益正在下降。</span>');
  if(p.energy<30) lines.push('<span class="arrow d">精力很低。睡眠也是準備的一部分。</span>');
  for(const r of rows){ const st=barStatus(r.d); lines.push('<b>'+SUBJ[r.k].short+'</b> <span class="status s'+st.s+'">'+st.t+'</span>'); }
  const m=b.month; if(m<7) goals.push('一試在 8 月，還有 '+(7-m)+' 個月。四卷選擇題。'); else if(m<9) goals.push('二試在 10 月：兩天，申論。'); else goals.push('12 月放榜。');
  if(p.money<30000) goals.push('錢快不夠了。可以打工、回家，或考慮工作兼備考。');
  return {lines,goals};
}
function barStatus(d){ if(d.u>=70&&d.i>=60&&d.a>=55&&d.r>=55) return {s:5,t:'已相當熟練'}; if(d.i>=45&&d.a>=35&&d.r>=35) return {s:4,t:'能獨立作答'}; if(d.i>=30||(d.u>=45&&d.r>=30)) return {s:3,t:'能辨識'}; if(d.m>=25&&d.r<20) return {s:2,t:'熟悉但提取不出來'}; if(d.u>=20) return {s:2,t:'尚未穩固'}; return {s:1,t:'剛開始'}; }
function barNext(){
  const b=G.bar; b.month++;
  if(b.month===7){ barExam1(); return; }
  if(b.month===9){ if(b.passed1){ barExam2Begin(); return; } }
  if(b.month===11){ barAnnounce(); return; }
  if(b.month>=12){ b.month=0; b.year++; G.postYears=(G.postYears||0)+1; G.careerYears=(G.careerYears||0)+1; MAIN_NPCS.forEach(npcLifeUpdate); }
  G.sched=[]; G.screen='plan'; save();
}
// 一試：四卷選擇題，總分 600（遊戲簡化：以前 33% 的近似分數線作為門檻）
function barExam1(){
  const b=G.bar; const S=b.subj; const p=G.player; const mc=(b.mc||0)/100;
  const sub=k=>clamp((S[k].m*0.35+S[k].r*0.35+S[k].i*0.3)/100*(0.75+0.35*mc),0,1);
  const gen=clamp((p.skills.judgment+p.skills.research)/200,0,1), en=clamp(p.skills.lang.en/100,0,1);
  const cond=(p.energy<30?0.9:1)*(p.stress>85?0.93:1);
  const paper=[
    {name:'第一卷 綜合法學（一）：刑法 70、刑訴 50、法倫 30', score: (70*sub('crim')+50*sub('crimpro')+30*(0.4+0.6*gen))},
    {name:'第二卷 綜合法學（一）：行政法 70、憲法 40、國公 20、國私 20', score: (110*sub('const_')+40*(0.35+0.65*gen))},
    {name:'第三卷 綜合法學（二）：民法 100、民訴 60', score: (100*sub('civ')+60*sub('civpro'))},
    {name:'第四卷 綜合法學（二）：公司 30、保險 20、票據 20、證交 20、法英 30、強執 20', score: (90*sub('com')+30*(0.3+0.7*en)+20*sub('civpro'))},
  ].map(x=>({name:x.name, score:Math.round(clamp(x.score*cond*1.15+rnd(-6,6),0,x.name.includes('第三')?160:x.name.includes('第四')?140:150))}));
  const total=paper.reduce((a,x)=>a+x.score,0); const cut=Math.round(330+rnd(-12,12));
  b.exam1={paper,total,cut}; b.passed1=total>=cut;
  b.results.push({y:b.year,stage:'一試',score:total,pass:b.passed1});
  diary('一試 '+total+'/600（分數線約 '+cut+'）：'+(b.passed1?'通過':'未通過'));
  G.screen='barExam1'; save();
}
function barExam1Next(){ const b=G.bar; if(!b.passed1){ b.month=11; barAnnounce(); return; } G.sched=[]; G.screen='plan'; save(); }
// 二試：申論。憲法行政法 200、刑法刑訴 200、國文 100、民法民訴 300、公司保險證交 100、選試 100，共 1000。
function barExam2Begin(){
  const b=G.bar; const S=b.subj; const p=G.player;
  const prep=SUBJ_IDS.reduce((a,k)=>a+(S[k].u*0.15+S[k].s*0.15+S[k].r*0.2+S[k].i*0.25+S[k].a*0.25),0)/6;
  const weakest=SUBJ_IDS.slice().sort((x,y)=>(S[x].i+S[x].a)-(S[y].i+S[y].a))[0];
  const bank=SUBJ_CASE[weakest]; const cs=CASES[bank[b.year%bank.length]];
  G.exam={ cid:'bar', which:'bar', step:0, T:120, used:0, q:[], prep, case:cs, bonusQ3:0, subjName:SUBJ[weakest].name, bar:true };
  G.screen='exam'; save();
}
function barExam2Finish(){
  const e=G.exam; const b=G.bar; const S=b.subj; const p=G.player; let cond=1; if(p.energy<30) cond*=0.92; if(p.stress>85) cond*=0.93;
  const strat=0.35*e.q[0].q+0.30*e.q[1].q+0.35*e.q[2].q; const mult=(0.25+0.85*strat)*cond;
  const essay=k=>clamp((S[k].u*0.15+S[k].s*0.15+S[k].r*0.2+S[k].i*0.25+S[k].a*0.25)/100*mult,0,1);
  const elec=ELECTIVES[b.elective]; const elecBase= elec.course&&G.courses[elec.course]? 0.45+0.4*(G.courses[elec.course].u/100) : 0.35+0.15*(p.skills.research/100);
  const rows=[
    {name:'憲法與行政法', max:200, score:200*essay('const_'), core:true},
    {name:'刑法與刑事訴訟法', max:200, score:200*(essay('crim')*0.55+essay('crimpro')*0.45), core:true},
    {name:'國文（作文）', max:100, score:100*(0.45+0.3*(p.skills.express/100)+0.15*(p.skills.structure/100)), core:false},
    {name:'民法與民事訴訟法', max:300, score:300*(essay('civ')*0.6+essay('civpro')*0.4), core:true},
    {name:'公司法、保險法與證券交易法', max:100, score:100*essay('com'), core:true},
    {name:'選試：'+elec.name, max:100, score:100*elecBase*(0.85+0.3*strat), core:false},
  ].map(r=>({...r, score:Math.round(clamp(r.score+rnd(-4,4),0,r.max))}));
  const total=rows.reduce((a,r)=>a+r.score,0); const core=rows.filter(r=>r.core).reduce((a,r)=>a+r.score,0);
  const judgeTotal=total-rows[5].score; // 司法官二試無選試科目，五科共 900 分
  b.exam2={rows,total,core,strat,judgeTotal};
  const parts=[]; if(e.q[0].k==='A'&&e.q[0].time>40) parts.push('第一題花掉太多時間。'); if(e.q[1].k==='core') parts.push('第二題直接切進核心。'); if(e.q[1].k==='sec') parts.push('第二題記得見解，但沒有先處理核心問題。'); if(e.q[2].q<0.5) parts.push('第三題沒寫完。'); if(p.skills.speed<35) parts.push('整體來說，速度還是最大的問題。'); if(e.prep<45) parts.push('準備程度本身就不夠，策略救不了太多。');
  e.result={score:total, max:1000, text:parts.join('')||'發揮穩定。', rows, core};
  b.results.push({y:b.year,stage:'二試',score:total,pass:null});
  diary('二試 '+total+'/1000（四大核心 '+core+'/800）'); G.screen='examResult'; save();
}
function barAnnounce(){
  const b=G.bar; const p=G.player; b.attempts++;
  let lawyer=false, judgeStage=false, why='';
  const lawyerCut=Math.round(500+rnd(-15,15)), judgeCut=Math.round(555+rnd(-15,15));
  if(!b.passed1){ why='一試未達分數線。'; }
  else if(!b.exam2){ why='未參加二試。'; }
  else { const t=b.exam2.total, c=b.exam2.core, jt=b.exam2.judgeTotal;
    if(b.target!=='judge'){ if(c<400) why='律師二試四大核心領域合計 '+c+' 分，未達 400 分的及格門檻（總分 '+t+'）。'; else { lawyer=t>=lawyerCut; if(!lawyer) why='律師二試總分 '+t+'，未達當年前 33% 的分數線（約 '+lawyerCut+'）。'; } }
    if(b.target!=='lawyer'){ judgeStage=jt>=judgeCut; if(!judgeStage){ why+=(why?' ':'')+'司法官二試五科合計 '+jt+'/900，未達進入三試的分數（約 '+judgeCut+'，遊戲簡化：實際依需用名額擇優）。'; } }
  }
  b.lawyerPass=lawyer; b.judgePass=false; b.judgeStage=judgeStage; b.why=why; b.cuts={lawyerCut,judgeCut};
  if(lawyer) setFlag('bar_pass');
  if(judgeStage){ b.month=11; G.screen='barOral'; b.oralStep=0; diary('二試放榜：司法官進入三試（隔年一月口試）。'+(lawyer?'律師考試通過。':'')); save(); return; }
  if(!lawyer) setFlag('bar_fail');
  if(lawyer) diary('放榜：律師考試通過。'); else diary('放榜：落榜。'+why);
  b.month=11; G.screen='barResult'; save();
}
// 三試：集體口試（儀態、溝通、人格特質、才識、應變），100 分，未滿 60 不錄取；二試與三試合併計分擇優（遊戲簡化）
const ORAL_QS=[
  { q:'口試委員：「如果當事人在法庭上情緒失控，你會怎麼處理？」', opts:[
    {t:'先暫停程序，讓當事人冷靜，再說明接下來的程序與他的權利', v:1.0},
    {t:'嚴正告誡，維持法庭秩序，必要時請法警處理', v:0.7},
    {t:'我會盡量同理他，聽他把話講完', v:0.75} ]},
  { q:'口試委員：「你認為司法官最需要的特質是什麼？請舉一個你自己的例子。」', opts:[
    {t:'耐心與說理：舉大學時處理小組報告分歧的經驗', v:0.9},
    {t:'正義感：舉自己對某個社會案件的看法', v:0.6},
    {t:'誠實面對自己不知道的事：舉曾經在朋友面前承認自己不懂勞動法的經驗', v:1.0} ]},
];
function barOralChoose(idx){
  const b=G.bar; const p=G.player; const q=ORAL_QS[b.oralStep]; const o=q.opts[idx]; b.oralV=(b.oralV||0)+o.v;
  b.oralStep++; if(b.oralStep<ORAL_QS.length){ save(); return; }
  const oral=Math.round(clamp(46+p.skills.express*0.22+p.skills.judgment*0.1+(b.oralV/ORAL_QS.length)*22+rnd(-4,4),0,100)); b.oral=oral;
  const jt=b.exam2.judgeTotal; const combined=jt+oral; const need=b.cuts.judgeCut+62;
  const judge= oral>=60 && combined>=need;
  b.judgePass=judge; if(judge) setFlag('judicial_pass'); if(!judge&&!b.lawyerPass) setFlag('bar_fail');
  if(!judge) b.why= oral<60?'三試口試 '+oral+' 分，未滿 60 分，不予錄取。':'二試與三試合計 '+combined+'，未達錄取名額內的分數（約 '+need+'，遊戲簡化）。';
  diary('三試口試 '+oral+' 分：'+(judge?'司法官考試錄取。':'未錄取。'));
  G.postYears=(G.postYears||0); G.screen='barResult'; save();
}
function barAfterResult(choice){
  const b=G.bar;
  if(choice==='trainLawyer'){ G.screen='training'; G.training={kind:'lawyer',step:0}; save(); return; }
  if(choice==='trainJudge'){ G.screen='training'; G.training={kind:'judicial',step:0}; save(); return; }
  if(choice==='retryFull'||choice==='retryPart'){ b.mode=choice==='retryFull'?'full':'part'; b.month=0; b.year++; b.passed1=null; b.exam2=null; b.exam1=null; G.postYears=(G.postYears||0)+1; G.careerYears=(G.careerYears||0)+1; MAIN_NPCS.forEach(npcLifeUpdate); G.sched=[]; G.screen='plan'; diary('決定再戰一年（'+(b.mode==='full'?'全職':'工作兼備考')+'）。'); save(); return; }
  if(choice==='legal'){ G.screen='careerSetup'; G.setupRole='legal'; save(); return; }
  if(choice==='grad'){ gradSchool(); return; }
  if(choice==='leave'){ G.screen='ending'; G.endingKey='newpath'; save(); return; }
}
function gradSchool(){
  G.postYears=(G.postYears||0)+2; G.careerYears=(G.careerYears||0)+2; const p=G.player; p.skills.research=clamp(p.skills.research+18,0,100); p.skills.structure=clamp(p.skills.structure+6,0,100);
  if(G.bar){ SUBJ_IDS.forEach(k=>{ G.bar.subj[k].u=clamp(G.bar.subj[k].u+12,0,100); G.bar.subj[k].s=clamp(G.bar.subj[k].s+10,0,100); }); } else { for(const cid in G.courses){ G.courses[cid].u=clamp(G.courses[cid].u+10,0,100); G.courses[cid].s=clamp(G.courses[cid].s+8,0,100); } }
  p.money-=60000; setFlag('grad_school'); MAIN_NPCS.forEach(npcLifeUpdate); diary('念了兩年研究所，寫了一本論文，學會了怎麼跟一個問題相處很久。');
  G.gradDone=true; G.phase='uni'; G.screen='gradChoice'; save();
}
// 訓練（遊戲簡化）
const TRAINING={
  lawyer:[
    { q:'律師職前訓練（遊戲簡化：基礎訓練加上約半年的事務所實習）。你要去哪裡實習？', opts:[
      {t:'溫學姊所在的事務所', hint:'需要她的信任', when:()=>!!G.flags.sis_trust, fx:()=>{ G.firmPick='sis'; addRel('sis',6); } },
      {t:'大型事務所：案子大，人多，你是最小的那個', hint:'成績或實習經驗要夠', when:()=>gpaAll()>=78||G.flags.intern_firm, fx:()=>{ G.firmPick='big'; } },
      {t:'小型事務所：什麼都要做，什麼都看得到', fx:()=>{ G.firmPick='small'; } },
      {t:'公益與法扶：薪水低，案子很真', fx:()=>{ G.firmPick='aid'; } } ]},
    { q:'實習第三個月。指導律師把你寫的第一份書狀改了六成，紅字比黑字多。', opts:[
      {t:'逐字看他改了什麼，做成自己的「改狀清單」', fx:()=>{ G.player.skills.structure+=4; G.player.skills.judgment+=2; } },
      {t:'先照改，然後問他為什麼', fx:()=>{ G.player.skills.express+=3; G.player.skills.judgment+=2; addRel('boss',5); } },
      {t:'覺得很受傷，但沒有說', fx:()=>{ G.player.stress+=8; G.player.skills.judgment+=1; } } ]},
  ],
  judicial:[
    { q:'司法官學院受訓：分三階段，為期兩年，包含一般課程、司法實務課程與專題課程（遊戲把兩年壓縮成兩個決定）。第一年，你發現自己在哪裡花最多時間？', opts:[
      {t:'裁判書的寫法：每一段為什麼要這樣寫', fx:()=>{ G.player.skills.structure+=5; G.judicialLean='judge'; } },
      {t:'偵查實務：從一份報案紀錄開始，證據要怎麼補', fx:()=>{ G.player.skills.judgment+=5; G.judicialLean='pros'; } },
      {t:'訊問技巧：怎麼問，別人才會說', fx:()=>{ G.player.skills.express+=5; } } ]},
    { q:'第二年結束前，填分發志願（遊戲簡化：實際分發依成績、志願與缺額）。你想當？', opts:[
      {t:'法官：審理、證據評價、裁判說理', fx:()=>{ G.setupRole='judge'; } },
      {t:'檢察官：偵查、蒐證、處分', fx:()=>{ G.setupRole='pros'; } } ]},
  ],
};
function trainingChoose(idx){
  const t=G.training; const steps=TRAINING[t.kind]; const step=steps[t.step]; const opt=step.opts.filter(o=>!o.when||o.when())[idx]; if(opt&&opt.fx) opt.fx();
  t.step++; if(t.step>=steps.length){ if(t.kind==='lawyer'){ G.postYears=(G.postYears||0)+1; G.careerYears=(G.careerYears||0)+1; G.setupRole='lawyer'; } else { G.postYears=(G.postYears||0)+2; G.careerYears=(G.careerYears||0)+2; if(G.setupRole!=='judge'&&G.setupRole!=='pros') G.setupRole='judge'; } G.screen='careerSetup'; }
  save();
}
const BAR_EVENTS=[
  { id:'b_an', title:'小安', scene:'library', once:true, weight:60, when:()=>G.phase==='bar'&&G.bar.month<=3&&G.bar.year===1,
    lines:[L('an','我一試過了，二試差三十幾分。'),L('an','今年一定要。'),L('n','她的桌上有一份表，每一科每一週該讀到哪裡。')],
    options:[ {label:'「那我們一起。」', do:()=>{ setFlag('study_with_an'); addRel('an',8); G.anGroup=true; return [L('an','好。週二週五。'),L('n','她把表複製了一份給你。你發現自己的進度差她很多，然後開始追。')]; }},
      {label:'「我自己讀比較習慣。」', do:()=>{ addRel('an',0); return [L('an','嗯。加油。'),L('n','你們還是常在圖書館遇到。她點頭，你點頭。')]; }} ]},
  { id:'b_zhe', title:'阿哲的訊息', scene:'street', once:true, weight:60, when:()=>G.phase==='bar'&&G.bar.month>=2&&G.bar.month<=5,
    linesFn:()=>[L('zhe',G.flags.help_zhe?'我在事務所當助理，晚上讀書。律師人很好，但很累。':'我不考了。我找到一份法務助理的工作，下個月開始。'),L('zhe','你呢？還好嗎？')],
    options:[ {label:'「還好。」', do:()=>[L('zhe','騙人。'),L('you','……不太好。'),L('zhe','週六出來吃飯。'),L('n','你去了。那天你什麼書都沒讀，也沒有想書的事。')] },
      {label:'「不好。」', do:()=>{ addRel('zhe',6); G.player.stress-=8; return [L('zhe','我知道。週六出來吃飯。'),L('n','他請客。他說等你考上再還。')]; }} ]},
  { id:'b_mom', title:'媽媽', scene:'dorm', once:true, weight:50, when:()=>G.phase==='bar'&&G.bar.month>=3,
    lines:[L('mom','考試準備得怎麼樣？'),L('mom','你二舅說他朋友的小孩考了五年。'),L('mom','我不是那個意思。')],
    options:[ {label:'「我知道。」', do:()=>{ addRel('mom',3); return [L('mom','好好吃飯。'),L('n','你掛掉電話，把二舅那句話從腦袋裡趕出去。趕了三次。')]; }},
      {label:'「媽，先不要跟我講別人考幾年。」', do:()=>{ addRel('mom',1); G.player.skills.express+=1; G.player.stress-=4; return [L('mom','好。'),L('n','她之後真的沒有再講。你有點內疚，又有點輕鬆。')]; }} ]},
  { id:'b_burn', title:'四樓', scene:'library', once:true, weight:80, when:()=>G.phase==='bar'&&G.bar.streak>=2,
    lines:[L('n','圖書館四樓。你發現這一頁已經看了三遍。'),L('n','旁邊的人也停下來，盯著天花板。你們沒有講話，但你知道。')],
    options:[ {label:'收書，去河濱走一圈', do:()=>{ G.bar.streak=0; G.player.energy+=12; G.player.stress-=12; setFlag('rest_lots'); return [L('n','走了一圈，四十分鐘。回來的時候那一頁只看了一次就過了。')]; }},
      {label:'撐下去', do:()=>{ setFlag('overwork'); G.player.stress+=6; return [L('n','你又看了兩遍。這次記住的是頁碼。')]; }} ]},
  { id:'b_wedding', title:'喜帖', scene:'street', once:true, weight:40, when:()=>G.phase==='bar'&&G.bar.month>=4&&G.bar.month<=6,
    lines:[L('n','溫學姊要結婚了。喜帖上的日期是一試前一個月。'),L('n','群組裡大家在討論要包多少。')],
    options:[ {label:'去，坐一個下午', do:()=>{ addRel('sis',6); addRel('an',2); addRel('zhe',2); G.player.money-=2600; G.player.stress-=8; return [L('n','婚禮上她穿得很漂亮，講話還是很直。她說：「考完來找我。」你說好。')]; }},
      {label:'包紅包，人不去', do:()=>{ addRel('sis',1); G.player.money-=2000; return [L('n','你在圖書館看到大家傳的照片。你想，這種事以後還會有很多次，也不會有很多次。')]; }} ]},
  { id:'b_insomnia', title:'考前', scene:'dorm', once:true, weight:90, when:()=>G.phase==='bar'&&(G.bar.month===6||G.bar.month===8),
    lines:[L('n','考前一週。你躺在床上，腦袋裡在跑刑訴的體系圖。'),L('n','凌晨兩點。三點。')],
    options:[ {label:'起來喝水，寫下明天要複習的三件事，再躺回去', do:()=>{ G.player.energy+=4; G.player.stress-=6; return [L('n','寫完三件事，腦袋安靜了一點。四點睡著。')]; }},
      {label:'乾脆起來讀', do:()=>{ G.player.energy-=8; SUBJ_IDS.forEach(k=>{ G.bar.subj[k].r+=1; }); return [L('n','讀到天亮。白天在圖書館睡了兩個小時。')]; }} ]},
  { id:'b_hall', title:'考場', scene:'classroom', once:true, weight:100, when:()=>G.phase==='bar'&&G.bar.month===6,
    lines:[L('n','考場外面，每個人都拿著一疊紙，沒有人在看。'),L('n','有人在做伸展操。有人在吃三明治。小安在閉眼睛。')],
    options:[ {label:'深呼吸，進去', do:()=>[L('n','鈴響。翻卷。第一題你看過。')] } ]},
];
