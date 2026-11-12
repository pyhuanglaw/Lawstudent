#!/usr/bin/env node
/* CC-C（帳號 C）11-05：D118_B7F（BB-C 01:32；SHA 301a74c2d＝7dbe93dfa＋860cb2618）——司法官二試、研究所筆試只出修過的課＋總複習＋兩則提醒，Node 那一組。
   期望值的出處：AA_692（企劃線 91874f326，介面字定稿）、AA_690（c860ff820，司法官二試「照一試那幾句」）、BB_255 00:3x D118-B7-FOLLOW-1104（機制）、BB-C 01:32 派工訊息。
   J 司法官二試題池：民 3 刑 3 公 2 訴 2，每一類只從修過的課；不夠由刑、民補（補的也只從修過的）；扣掉當年一試、往年二試抽過的題湊不到 10 題＝全部題庫；抽好的不重抽。
   G 研究所題池：只從修過的公法；行政救濟法沒修（大學選課照遊戲自己的 CLS.selectTerm 選「不修」那一個）＝三門；不到 10 題＝四門；抽好的不重抽。
   R 總複習：judge 6 小時、grad 4 小時；只有一試 ≥16（到司法官）的人有 judge，一試只到律師（律師二試）沒有；開始字幕、結束字幕、太晚的字照 AA_692／AA_690。
   M 提醒：judge_remind_open/week、grad_remind_open/week 各一則 20:00、字照 AA_692；畢業以後篇照自己「跳到下一件事」（PG.advance）走，要停在這兩個時間；
     沒報名的收不到；之後才讀檔、還沒考的存檔照原本的時間補發；寒假在家快轉（HOME.breakJump）停在 20:00 那一則、接著在家裡的書桌選單開得了研究所總複習；
     2031 以後的研究所沒有總複習、沒有提醒。
   【前置／捷徑】pg_harness 的假 GM；畢業、一試成績（BAR_SCORE＝答對數，司法官／律師照遊戲 PG.tier 算）、研究所報名的旗標直接設；成績單照 tests/d118_b7_unit.js 的 transcripts
     （期末考 CLS.drawExam、成績單 CLS.reportFor）；選項都選第一個。判定歸 BB。
      Q（BB-C 01:40，c9ad63dd3＝含 63847fe13）：二試（e2b）、研究所（gradQuiz）作答也有 cue、交卷逐題回寫觀念卡、計分不受影響。
   用法：LW_ROOT=<checkout> [CC_REPO=…] [SHA=…] node cc_d118b7f_node.js */
'use strict';
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(process.env.LW_ROOT||path.join(__dirname,'..','..','..','..'));
const CC_REPO=process.env.CC_REPO||path.resolve(__dirname,'..','..','..','..');
if(fs.existsSync(path.join(ROOT,'tests','alison.js'))) require(path.join(ROOT,'tests','alison.js'));
const H=require(path.join(ROOT,'tests','pg_harness.js'));
const {GM}=H, J=JSON.stringify;
let FAILS=0, PASSES=0; const FL=[]; const check=(name,ok,inf)=>{ console.log((ok?'PASS ':'FAIL ')+name+(inf?'　'+inf:'')); if(ok) PASSES++; else { FAILS++; FL.push(name.split(' ')[0]); } return ok; };
const info=s=>console.log('INFO '+s);
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{}; global.ZRUK=global.ZRUK||{W_FROM:'2028-09-01',playW:async()=>'orig'};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/date3d.js',
  'src/data/termend_lines.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
const loadErr=[];
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let s=fs.readFileSync(path.join(ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,100)); } }
let caps=[], says=[], want=[];
GM.caption=(w,t)=>{ caps.push(String(t)); }; GM.toast=()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.addNote=()=>true; GM.money=d=>{ H.G.money=(H.G.money|0)+(+d||0); };
const say0=GM.say; GM.say=async function(who,t){ says.push(String(t)); return say0?say0.apply(this,arguments):undefined; };
let quizAns=null; const ch0=GM.choose; GM.choose=async function(o){ if(quizAns){ const r=quizAns(o); if(r!=null) return r; } const w=want.shift(); if(w!=null){ const ts=o.map(q=>q.t||q.text), k=ts.findIndex(t=>t===w||String(t).startsWith(w)); if(k>=0) return k; return 0; } return ch0?ch0.apply(this,arguments):0; };
const DK=k=>PG.DK(k), K=d=>d==null?null:CALENDAR.dateOf(d).key, WDN=d=>'日一二三四五六'[CALENDAR.dateOf(d).wd%7], AT=(k,h)=>DK(k)*24+h;
const hm=h=>{ const x=Math.round(h*60); return String(Math.floor(x/60)).padStart(2,'0')+':'+String(x%60).padStart(2,'0'); };
const gitShow=(rev,p)=>{ try{ return cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','show',rev+':'+p],{encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const gitFind=(rev,re)=>{ try{ return cp.execFileSync('git',['-C',CC_REPO,'-c','core.quotepath=off','ls-tree','-r','--name-only',rev],{encoding:'utf8',maxBuffer:1<<26}).split('\n').find(l=>re.test(l))||''; }catch(e){ return ''; } };
const D692=gitShow('91874f326',gitFind('91874f326',/AA_692_/)), D690=gitShow('c860ff820','docs/story_planning/AA_690_國考總複習介面字定稿.md');
const fill=(t,o)=>String(t||'').replace(/\{(\w+)\}/g,(m,k)=>o[k]!=null?String(o[k]):m);
/* 期望的字（逐字；第 0 節先核對每一句都在原文裡）*/
const X={
  j_what:['司法官二試要考的',D692], j_hint:['要六個小時，今天其他的事照常可以做。',D690], j_open:['（你把四年的筆記攤開。{what} {n} 科，一共 {m} 張觀念卡。）',D690], j_late:['要讀六個小時。18:00 以後開始就太晚了。',D690],
  j_line:['{c}　二試範圍：學過 {x}／{y}・答對過 {z}',D692], j_more:['（另外還翻了 {k} 科。）',D690],
  j_ropen:['【國考】{M}/{D} 司法官二試。從今天起，坐到書桌或讀書的位子，可以把四年的筆記一次讀過一遍，要六個小時。',D692], j_rweek:['【國考】{M}/{D}（{W}）司法官二試。考前想把四年的筆記讀過一遍，坐到書桌或讀書的位子就可以。',D692],
  g_what:['研究所要考的',D692], g_hint:['要四個小時，今天其他的事照常可以做。',D692], g_open:['（你把公法的筆記攤開。{what} {n} 科，一共 {m} 張觀念卡。）',D692], g_late:['要讀四個小時。20:00 以後開始就太晚了。',D692],
  g_line:['{c}　研究所範圍：學過 {x}／{y}・答對過 {z}',D692],
  g_ropen:['【研究所】{M}/{D} 筆試。從今天起，坐到書桌或讀書的位子，可以把公法的筆記一次讀過一遍，要四個小時。',D692], g_rweek:['【研究所】{M}/{D}（{W}）筆試。考前想把公法的筆記讀過一遍，坐到書桌或讀書的位子就可以。',D692]};
const T=k=>X[k][0];
/* AA_692：「{M}/{D}＝二試第一天（2029＝10/20）」；研究所「2029-02-03（六）；延畢的人 2030-02-16（六）」；BB_255：二試在一試放榜上榜那天和考前 30 天取晚的那一個開放、研究所考前 30 天 */
/* BB-C 02:00（BB_255 02:0x，8267bc481）：開放那天的提醒一試、二試、研究所都改 12:00（停點跟著改）；考前一週的週日照舊 20:00；司法官二試從二試第一天算（2029 開放 9/20、2030 舊序章考試 9/19）*/
const OPEN_H=12, OPEN_HM='12:00';
const J29={M:10,D:20,W:'六',first:'2029-10-20',r1:'2029-09-07'}, G29={M:2,D:3,W:'六',key:'2029-02-03'}, G30={M:2,D:16,W:'六',key:'2030-02-16'};
const wrongOf=q=>q.type==='tf'||!q.options?(q.answer==='對'?'錯':'對'):Object.keys(q.options).find(k=>String(k)!==String(q.answer));
const transcripts=(G,o)=>{ o=o||{}; const R=CLS.rec(G); R.exam=R.exam||{};
  for(const t of CLS.LAW_TERMS){ if(CLS.termAway(G,t)) continue; if(o.terms&&!o.terms.includes(t)) continue;
    for(const c of CLS.termCourses(G,t)){ if(!CLS.isExamCourse(c)||(o.drop||[]).includes(c.id)) continue; const r=CLS.drawExam(G,c.id,t,'final'); if(!r.ok) continue;
      R.exam[r.key]={qs:r.qs.map(q=>q.id),ans:r.qs.map((q,i)=>i<3?q.answer:wrongOf(q)),correct:3,score:CLS.scoreOf(3),status:'done'}; }
    R.grades[t]=CLS.reportFor(G,t); for(const id of (o.drop||[])) delete R.grades[t][id]; } return R; };
const PGF={MOVED_OUT:DK('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:DK('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true};
const freshPG=(key,h,flags)=>{ const G=H.fresh(key,h,'dorm',Object.assign({},PGF,flags||{}));
  G.acts={att:{}}; G.outings=[]; G.flags.GRADUATED=PG.gradDay(); G.flags.GRAD_DONE=true; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; G.stats={classes:0,study:0}; H.G=G; return G; };
const JF=(score)=>({BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:score});   /* 一試答對數；司法官／律師照遊戲自己的 PG.tier（≥16 both、≥12 lawyer）*/
const judgeG=(key,h,score,o)=>{ o=o||{}; const G=freshPG(key,h,Object.assign(JF(score),o.flags||{})); PG.rec(G).done.exam_2029=1; PG.rec(G).done.r1_2029=1; if(o.tr!==false) transcripts(G,o.tr||{}); PG.draw(G,2029); return G; };
const GF={EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail',ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true}, TO_Y4S1=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'];
/* 大學選課照遊戲自己的 CLS.selectTerm（選單照 pick 選；其他組選預設）*/
const choose=async(G,picks)=>{ H.G=G; for(const t of CLS.LAW_TERMS){ if(!CLS.choiceGroups||!CLS.choiceGroups(t).length) continue; want=(picks[t]||[]).slice(); try{ await CLS.selectTerm(GM,t); }catch(e){} } want=[]; };
const walkPG=async(G,end,re)=>{ const now=()=>G.day*24+(+G.hour||0), visits=[], seen=new Set(), msgs=[]; let guard=0;
  const grab=()=>{ for(const m of (G.msgs||[])){ const k=[m.tag,m.text,m.day,m.h].join('|'); if(seen.has(k)) continue; seen.add(k); if(re.test(m.tag||'')||/^【(國考|研究所)】/.test(m.text||'')) msgs.push({tag:m.tag,text:m.text,key:K(m.day),wd:WDN(m.day),h:m.h,th:m.th}); } };
  while(guard++<3000&&now()<end){ try{ STORY.phoneRules(GM); }catch(e){} H.tick(); grab();
    const q=OUT.due(G); if(q){ H.picks=[0]; try{ await OUT.tick(GM); }catch(e){} grab(); continue; }
    const s=PG.due(G); if(s){ H.picks=[]; try{ await PG.runStep(GM,s); }catch(e){ PG.rec(G).done[s.id]=1; } grab(); continue; }
    const t0=now(); let nx=null; try{ nx=PG.nextStop(G); }catch(e){} if(nx!=null&&nx>=end) break;
    let ok=false; try{ ok=await PG.advance(GM); }catch(e){} visits.push(K(G.day)+' '+hm(G.hour));
    if(!ok||now()<=t0+1e-6){ const t=t0+1; PG.setT(G,H.E,Math.floor(t/24),t%24); } }
  try{ STORY.phoneRules(GM); }catch(e){} grab(); return {visits,msgs}; };
const sec=async(n,f)=>{ console.log('\n===== '+n); try{ await f(); }catch(e){ check(n.split(' ')[0]+'：丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const grpOf=qs=>{ const c={}; for(const q of qs){ const g=PG.judgeGroup(q); c[g]=(c[g]||0)+1; } return c; };
const qById=new Map(); const Q=id=>{ if(!qById.size){ for(const q of PG.judgePool()) qById.set(q.id,q); for(const q of PG.gradPool()) qById.set(q.id,q); } return qById.get(id); };
(async()=>{
console.log('cc_d118b7f_node　LW_ROOT='+ROOT+'　SHA='+(process.env.SHA||'?')+'　稿 AA_692 91874f326、AA_690 c860ff820');
check('0. 載得到 PG.judgePoolFor／gradPoolFor／judgeNext／gradNext、STUDY.reviewInfo／reviewOpt／review／examRemindNext、HOME.breakJump',typeof PG!=='undefined'&&['judgePoolFor','gradPoolFor','judgeNext','gradNext','drawJudge','drawGrad'].every(k=>typeof PG[k]==='function')&&typeof STUDY!=='undefined'&&['reviewInfo','reviewOpt','review','examRemindNext'].every(k=>typeof STUDY[k]==='function')&&typeof HOME!=='undefined'&&typeof HOME.breakJump==='function',loadErr.length?'載入錯誤 '+J(loadErr.slice(0,3)):'');
{ const miss=Object.keys(X).filter(k=>!X[k][1]||!X[k][1].includes(X[k][0])); check('0b. 這支探針的期望字每一句都在 AA_692／AA_690 原文裡（'+Object.keys(X).length+' 句）',!!D692&&!!D690&&!miss.length,J({miss,d692:D692.length,d690:D690.length})); }

/* ---------- J 司法官二試題池 ---------- */
await sec('J 司法官二試題池',async()=>{
  { const G=judgeG('2029-09-22',10,17), tk=PG.takenIds(G), used=new Set(PG.rec(G).exam[2029].qs), qs=PG.drawJudge(G,2029), g=grpOf(qs);
    info('J1 修過的課 '+tk.size+' 門；2029 一試抽了 '+used.size+' 題；二試 10 題的課 '+J(qs.map(q=>PG.qCourse(q)))+'；四類 '+J(g));
    check('J1 一般的存檔（四年成績單都有）：10 題、民 3 刑 3 公 2 訴 2',qs.length===10&&g.civ===3&&g.crim===3&&g.pub===2&&g.proc===2,J(g));
    check('J2 10 題都是修過的課（PG.qCourse ∈ CLS.takenCourses）',qs.every(q=>tk.has(PG.qCourse(q))),J(qs.filter(q=>!tk.has(PG.qCourse(q))).map(q=>q.id+':'+PG.qCourse(q))));
    check('J3 沒有當年（2029）一試抽過的題',qs.every(q=>!used.has(q.id)),J(qs.filter(q=>used.has(q.id)).map(q=>q.id)));
    const ids0=qs.map(q=>q.id); transcripts(G,{terms:['Y1S1'],drop:[]}); for(const t of CLS.LAW_TERMS) if(t!=='Y1S1') delete CLS.rec(G).grades[t];
    const qs2=PG.drawJudge(G,2029).map(q=>q.id); check('J4 已經抽好的不重抽（抽完以後成績單只剩大一上，再叫一次 PG.drawJudge 還是同一組 10 題）',J(qs2)===J(ids0),J({ids0,qs2}));
    /* 往年二試：2030 再考司法官（一試 2030 也到司法官）——扣掉 2030 一試、2029 二試抽過的題 */
    G.flags.BAR_SIT_2030=true; G.flags.BAR_SCORE_2030=17; const G2=judgeG('2030-09-20',10,17,{flags:{BAR_SIT_2030:true,BAR_SCORE_2030:17}}); PG.drawJudge(G2,2029); PG.draw(G2,2030);
    const u30=new Set([...PG.rec(G2).exam[2030].qs,...PG.rec(G2).judge[2029].qs]), q30=PG.drawJudge(G2,2030), tk2=PG.takenIds(G2);
    check('J5 2030 二試：沒有 2030 一試、2029 二試抽過的題；10 題都是修過的課',q30.length===10&&q30.every(q=>!u30.has(q.id))&&q30.every(q=>tk2.has(PG.qCourse(q))),J({n:q30.length,dup:q30.filter(q=>u30.has(q.id)).map(q=>q.id),notTaken:q30.filter(q=>!tk2.has(PG.qCourse(q))).map(q=>q.id)})); }
  /* 某一類修過的不夠：成績單只有大一（大一沒有訴訟法）＝訴訟法那一類修過的 0 題，由刑、民補 */
  { const G=judgeG('2029-09-22',10,17,{tr:{terms:['Y1S1','Y1S2']}}), tk=PG.takenIds(G), pool=PG.judgePoolFor(G,2029), used=new Set(PG.rec(G).exam[2029].qs);
    const avail={}; for(const q of PG.judgePool()) if(tk.has(PG.qCourse(q))&&!used.has(q.id)){ const g=PG.judgeGroup(q); avail[g]=(avail[g]||0)+1; }
    const qs=PG.drawJudge(G,2029), g=grpOf(qs); info('J6 成績單只有大一：修過的課 '+J([...tk])+'；扣掉 2029 一試以後各類修過的題數 '+J(avail)+'；二試 10 題四類 '+J(g));
    const short=['pub','proc'].reduce((s,k)=>s+Math.max(0,(k==='pub'?2:2)-(avail[k]||0)),0)+['civ','crim'].reduce((s,k)=>s+Math.max(0,3-(avail[k]||0)),0);
    if(Object.values(avail).reduce((a,b)=>a+b,0)>=10){
      check('J6 某一類修過的不夠：10 題都是修過的課；少的那幾類由刑、民補（多出來的只在 crim、civ）',qs.length===10&&qs.every(q=>tk.has(PG.qCourse(q)))&&(g.pub||0)<=2&&(g.proc||0)<=2&&((g.crim||0)>3||(g.civ||0)>3||short===0),J({g,avail,short}));
    } else check('J6 （前置不成立）大一的成績單修過的題湊不到 10 題，這一項改看 J7',true,J(avail)); }
  /* 修過的扣掉用過的湊不到 10 題＝退回全部題庫 */
  { const G=judgeG('2029-09-22',10,17,{tr:{terms:['Y1S1'],drop:['crim_gen1','civ_general']}}), tk=PG.takenIds(G), used=new Set(PG.rec(G).exam[2029].qs);   /* 【捷徑】成績單只有大一上的憲法（上）*/
    const n=PG.judgePool().filter(q=>tk.has(PG.qCourse(q))&&!used.has(q.id)).length, pool=PG.judgePoolFor(G,2029), all=PG.judgePool();
    info('J7 成績單只有大一上的憲法（上）：修過的課 '+J([...tk])+'，扣掉 2029 一試以後修過的二試題 '+n+' 題');
    if(n<10){ const qs=PG.drawJudge(G,2029); check('J7 修過的（扣掉用過的）湊不到 10 題＝退回全部題庫（PG.judgePoolFor 和全部一樣多；抽到 10 題）',pool.length===all.length&&qs.length===10,J({pool:pool.length,all:all.length,n:qs.length,notTaken:qs.filter(q=>!tk.has(PG.qCourse(q))).length})); }
    else check('J7 （前置不成立）大一上修過的題有 '+n+' 題、湊得到 10 題',false,'要換更少的成績單'); }
});

/* ---------- G 研究所題池 ---------- */
let ADMR=null;
await sec('G 研究所題池',async()=>{
  const GRP=[]; for(const t of CLS.LAW_TERMS) for(const g of (CLS.choiceGroups?CLS.choiceGroups(t):[])) GRP.push(Object.assign({term:t},g));
  const gr=GRP.find(g=>g.opts.some(c=>c.id==='admin_remedy')); ADMR=gr?{term:gr.term,group:gr.group,opts:gr.opts.map(c=>c.id),none:!!gr.none}:null;
  info('G 行政救濟法在哪一組選修（CLS.choiceGroups）：'+J(ADMR));
  { const c=COURSES.list.find(x=>x.id==='admin_remedy'); info('G 行政救濟法在遊戲的課表：'+J(c?{kind:c.kind,term:c.term}:null)+'——不在選修組；「沒修」用【捷徑】成績單、期末考紀錄都拿掉（BB_255：憲法一、二和行政法是必修；遊戲裡行政救濟法也是 kind required）'); }
  const mk=async(pickNot)=>{ const G=H.fresh('2029-01-10',10,'home',Object.assign({},GF)); G.stats={classes:0,study:0};
    if(!gr){ transcripts(G,{terms:TO_Y4S1,drop:pickNot?['admin_remedy']:[]}); return G; }
    if(gr){ const picks={}; const L=gr.opts.map(c=>c.name).concat(gr.none?['這學期不修']:[]); const other=pickNot?(gr.none?'這學期不修':gr.opts.find(c=>c.id!=='admin_remedy').name):gr.opts.find(c=>c.id==='admin_remedy').name;
      picks[gr.term]=CLS.choiceGroups(gr.term).map(g2=>g2.group===gr.group?other:null); await choose(G,picks); } else await choose(G,{});
    transcripts(G,{terms:TO_Y4S1}); return G; };
  const A=await mk(false), B=await mk(true);
  for(const [tag,G,exp] of [['修了行政救濟法',A,['admin_law','admin_remedy','const_1','const_2']],['沒修行政救濟法',B,['admin_law','const_1','const_2']]]){ H.G=G;
    const tk=PG.takenIds(G), pool=PG.gradPoolFor(G), cs=[...new Set(pool.map(q=>q.course))].sort(), qs=PG.drawGrad(G,2029);
    info('G '+tag+'：修過的公法 '+J(PG.GRAD_COURSES.filter(c=>tk&&tk.has(c)))+'；題池 '+pool.length+' 題、'+J(cs)+'；抽到 '+J(qs.map(q=>q.course)));
    check('G '+tag+'：題池只有修過的公法 '+J(exp),J(cs)===J(exp),J(cs));
    check('G '+tag+'：抽到 10 題、都在那幾門',qs.length===10&&qs.every(q=>exp.includes(q.course)),J(qs.map(q=>q.course)));
    const ids0=qs.map(q=>q.id); for(const t of CLS.LAW_TERMS) delete CLS.rec(G).grades[t]; const qs2=PG.drawGrad(G,2029).map(q=>q.id);
    check('G '+tag+'：已經抽好的不重抽（成績單拿掉以後再抽還是同一組）',J(qs2)===J(ids0)); }
  { const G=H.fresh('2029-01-10',10,'home',Object.assign({},GF)); const pool=PG.gradPoolFor(G), cs=[...new Set(pool.map(q=>q.course))].sort();
    check('G 沒有成績單（修過的不到 10 題）＝退回四門',J(cs)===J(['admin_law','admin_remedy','const_1','const_2'])&&pool.length===PG.gradPool().length,J(cs)); }
});

/* ---------- R 總複習 ---------- */
await sec('R 總複習',async()=>{
  { const G=judgeG('2029-09-22',10,17); H.G=G; const inf=STUDY.reviewInfo(G,'judge'), opt=STUDY.reviewOpt(G,{});
    check('R1 一試 17（到司法官）、9/22 10:00：有司法官二試總複習（what「'+T('j_what')+'」）；選單那一項 kind judge、提示「…'+T('j_hint')+'」',!!inf&&inf.what===T('j_what')&&!!opt&&opt.kind==='judge'&&!opt.dim&&String(opt.hint).endsWith(T('j_hint'))&&String(opt.hint).startsWith(T('j_what')+' '),J({what:inf&&inf.what,opt}));
    const qs0=J(PG.rec(G).judge&&PG.rec(G).judge[2029]||null); says=[]; caps=[]; const t0=G.day*24+G.hour, s0=G.stats.study|0; const ok=await STUDY.review(GM,'judge'); const t1=G.day*24+G.hour;
    const n=inf.courses.length, m=inf.courses.reduce((a,x)=>a+x.units.length,0), first=says.find(s=>/筆記攤開/.test(s))||'';
    check('R2 按一次：6 小時（10:00→16:00）、stats.study +6',ok!==false&&Math.abs(t1-t0-6)<1e-6&&(G.stats.study|0)-s0===6,J({ok,dt:t1-t0,study:(G.stats.study|0)-s0}));
    check('R3 開始字幕逐字「'+fill(T('j_open'),{what:T('j_what'),n,m})+'」',first===fill(T('j_open'),{what:T('j_what'),n,m}),J(first));
    const cap=caps[caps.length-1]||'', lines=cap.split('<br>'), body=lines.filter(l=>!/^（另外還翻了/.test(l));
    check('R4 結束字幕：每一行照「{c}　二試範圍：學過 x／y・答對過 z」、最多 8 科（多的那一行照「（另外還翻了 k 科。）」）',body.length>=1&&body.length<=8&&body.every(l=>/^.+　二試範圍：學過 \d+／\d+・答對過 \d+$/.test(l))&&lines.filter(l=>/^（另外還翻了/.test(l)).every(l=>/^（另外還翻了 \d+ 科。）$/.test(l)),J(lines));
    check('R5 總複習以後抽到的二試題不變',J(PG.rec(G).judge&&PG.rec(G).judge[2029]||null)===qs0||qs0==='null'); }
  { const G=judgeG('2029-09-22',10,14); H.G=G; const inf=STUDY.reviewInfo(G,'judge'), opt=STUDY.reviewOpt(G,{});
    info('R6 一試 14：PG.stage＝'+PG.stage(G,2029));
    check('R6 一試 14（只到律師＝律師二試）：沒有司法官二試總複習（reviewInfo null、選單沒有 judge 那一項）',inf===null&&!(opt&&opt.kind==='judge'),J({inf:!!inf,opt})); }
  { const G=judgeG('2029-09-22',18.5,17); H.G=G; const opt=STUDY.reviewOpt(G,{});
    check('R7 司法官二試 18:30：變灰「'+T('j_late')+'」',!!opt&&opt.dim===true&&opt.hint===T('j_late'),J(opt)); }
  { const G=H.fresh('2029-01-10',10,'home',Object.assign({},GF)); transcripts(G,{terms:TO_Y4S1}); G.stats={classes:0,study:0}; H.G=G; G.home={at:true};
    const inf=STUDY.reviewInfo(G,'grad'), opt=STUDY.reviewOpt(G,{home:true});
    check('R8 研究所 2029（1/10 寒假在家）：有研究所總複習（what「'+T('g_what')+'」）；在家的選單 kind grad、提示「…'+T('g_hint')+'」',!!inf&&inf.what===T('g_what')&&!!opt&&opt.kind==='grad'&&!opt.dim&&String(opt.hint).endsWith(T('g_hint')),J({what:inf&&inf.what,opt}));
    says=[]; caps=[]; const t0=G.day*24+G.hour, s0=G.stats.study|0; const ok=await STUDY.review(GM,'grad',{home:true}); const t1=G.day*24+G.hour;
    const n=inf.courses.length, m=inf.courses.reduce((a,x)=>a+x.units.length,0), first=says.find(s=>/筆記攤開/.test(s))||'', cap=caps[caps.length-1]||'', lines=cap.split('<br>');
    check('R9 研究所按一次：4 小時、stats.study +4',ok!==false&&Math.abs(t1-t0-4)<1e-6&&(G.stats.study|0)-s0===4,J({dt:t1-t0,study:(G.stats.study|0)-s0}));
    check('R10 研究所開始字幕逐字「'+fill(T('g_open'),{what:T('g_what'),n,m})+'」（'+n+' 科＝修過的公法）',first===fill(T('g_open'),{what:T('g_what'),n,m})&&(n===3||n===4),J(first));
    check('R11 研究所結束字幕照期末：範圍內每一科一行（'+n+' 行）、字照「{c}　研究所範圍：…」、沒有「另外還翻了」',lines.length===n&&lines.every(l=>/^.+　研究所範圍：學過 \d+／\d+・答對過 \d+$/.test(l)),J(lines)); }
  { const G=H.fresh('2029-01-10',20.5,'home',Object.assign({},GF)); transcripts(G,{terms:TO_Y4S1}); H.G=G; const opt=STUDY.reviewOpt(G,{home:true});
    check('R12 研究所 20:30：變灰「'+T('g_late')+'」',!!opt&&opt.dim===true&&opt.hint===T('g_late'),J(opt)); }
});

/* ---------- M 提醒 ---------- */
await sec('M 提醒',async()=>{
  const RJ=/^judge_remind_/, RG=/^grad_remind_/;
  { const G=judgeG('2029-09-08',10,17); const r=await walkPG(G,AT('2029-10-20',8),RJ), ms=r.msgs.filter(m=>RJ.test(m.tag||'')||/司法官二試/.test(m.text||''));
    info('M1 司法官 2029 跳過的時間：'+J(r.visits.filter(v=>/^2029-(09|10)/.test(v))).slice(0,1200)); info('M1 訊息：'+J(ms));
    const o=ms.filter(m=>m.tag==='judge_remind_open_2029'), w=ms.filter(m=>m.tag==='judge_remind_week_2029');
    const openExp=K(Math.max(DK(J29.r1),DK(J29.first)-30));
    check('M1 開放那天 '+OPEN_HM+' 一則，字逐字「'+fill(T('j_ropen'),J29)+'」（AA_692：{M}/{D}＝二試第一天 10/20；BB-C 02:00 開放那天 12:00）',o.length===1&&hm(o[0].h)===OPEN_HM&&o[0].text===fill(T('j_ropen'),J29),J(o));
    check('M2 開放那天＝一試放榜（9/7）和二試第一天 10/20 前 30 天（'+openExp+'）比較晚的那一天',o.length===1&&o[0].key===openExp,J(o.map(m=>m.key)));
    check('M3 考前一週的週日（2029-10-14）20:00 一則，字逐字「'+fill(T('j_rweek'),J29)+'」',w.length===1&&w[0].key==='2029-10-14'&&hm(w[0].h)==='20:00'&&w[0].text===fill(T('j_rweek'),J29),J(w));
    check('M4 畢業以後篇「跳到下一件事」停在這兩則的時間（'+openExp+' '+OPEN_HM+'、2029-10-14 20:00）',r.visits.includes(openExp+' '+OPEN_HM)&&r.visits.includes('2029-10-14 20:00'),J(r.visits.filter(v=>/ (12|20):00$/.test(v)))); }
  { const G=judgeG('2030-09-10',10,17,{flags:{BAR_SIT_2030:true,BAR_SCORE_2030:17,JUDGE_SCORE2_2029:5}}); for(const k of ['e2a_2029','e2b_2029','r2_2029','exam_2030','r1_2030']) PG.rec(G).done[k]=1; H.G=G;
    const nx=PG.judgeNext(G), rm=STUDY.examRemindNext(G,'judge'), J30={M:10,D:19,W:'六'};
    info('M2b 司法官 2030 重考：PG.judgeNext '+J(nx&&{y:nx.y,day:K(nx.day),open:K(nx.open)})+'；下一則提醒 '+J(rm&&{k:rm.k,day:K(rm.day),at:rm.at%24,text:rm.text}));
    check('M2b 2030 重考司法官（2030 一試也到司法官）：開放日 2030-09-19、那一則 '+OPEN_HM+'「'+fill(T('j_ropen'),J30)+'」（二試第一天 10/19）',!!nx&&nx.y===2030&&K(nx.open)==='2030-09-19'&&!!rm&&rm.k==='open'&&K(rm.day)==='2030-09-19'&&Math.abs(rm.at%24-OPEN_H)<1e-6&&rm.text===fill(T('j_ropen'),J30),J({nx:nx&&K(nx.open),rm:rm&&[K(rm.day),rm.at%24,rm.text]})); }
  { const G=judgeG('2029-09-08',10,14); const r=await walkPG(G,AT('2029-10-20',8),RJ), ms=r.msgs.filter(m=>RJ.test(m.tag||'')||/司法官二試/.test(m.text||''));
    check('M5 一試只到律師：收不到司法官二試的提醒',!ms.length,J(ms)); }
  { const G=freshPG('2029-09-08',10,{BAR_REG:false}); const r=await walkPG(G,AT('2029-10-20',8),RJ), ms=r.msgs.filter(m=>RJ.test(m.tag||'')||/司法官二試/.test(m.text||''));
    check('M6 沒報名一試：收不到司法官二試的提醒',!ms.length,J(ms)); }
  { const G=judgeG('2029-09-28',10,17); H.G=G; STORY.phoneRules(GM); PHONE.tick(G); const o=(G.msgs||[]).filter(m=>m.tag==='judge_remind_open_2029').map(m=>({key:K(m.day),h:m.h,text:m.text}));
    const nx=PG.judgeNext(G), openK=nx?K(nx.open):null;
    check('M7 之後才讀檔（9/28 讀進來、還沒考）：開放那一則照原本的時間補發（'+openK+' '+OPEN_HM+'）',o.length===1&&o[0].key===openK&&o[0].h===OPEN_H,J(o)); }
  { const G=H.fresh('2029-01-04',10,'home',Object.assign({},GF)); transcripts(G,{terms:TO_Y4S1}); G.stats={classes:0,study:0}; G.home={at:true}; H.G=G; const o={};
    let err=null; try{ await HOME.breakJump(GM,AT('2029-01-06',10),o); }catch(e){ err=String(e&&e.message||e).slice(0,200); }
    const a=(G.msgs||[]).filter(m=>m.tag==='grad_remind_open_2029').map(m=>({key:K(m.day),h:m.h,text:m.text})), stopAt=K(G.day)+' '+hm(G.hour);
    check('M8 研究所 2029 寒假在家快轉（HOME.breakJump 1/4 10:00 → 1/6）：停在 1/4 '+OPEN_HM+'，那一則逐字「'+fill(T('g_ropen'),G29)+'」',!err&&stopAt==='2029-01-04 '+OPEN_HM&&a.length===1&&a[0].key==='2029-01-04'&&a[0].h===OPEN_H&&a[0].text===fill(T('g_ropen'),G29),J({err,why:o.why,stopAt,a}));
    const opt=STUDY.reviewOpt(G,{home:true}); check('M9 停下來（1/4 '+OPEN_HM+'）以後在家裡的書桌選單：研究所總複習那一項在、按得下去（kind grad、不變灰）——BB-C 01:32 的條件；瀏覽器那一組再照玩家走一次',!!opt&&opt.kind==='grad'&&opt.dim!==true,J(opt));
    H.at('2029-01-05',10); const optB=STUDY.reviewOpt(G,{home:true}); info('M9b 隔天 1/5 10:00 在家：'+J(optB));
    const G2=H.fresh('2029-01-27',10,'home',Object.assign({},GF)); transcripts(G2,{terms:TO_Y4S1}); G2.home={at:true}; H.G=G2; const o2={}; let e2=null, stops2=[], b=[];
    for(let i=0;i<12;i++){ try{ await HOME.breakJump(GM,AT('2029-01-29',10),o2); }catch(e){ e2=String(e&&e.message||e).slice(0,200); break; } stops2.push(K(G2.day)+' '+hm(G2.hour)+' '+o2.why);
      b=(G2.msgs||[]).filter(m=>m.tag==='grad_remind_week_2029').map(m=>({key:K(m.day),h:m.h,text:m.text})); if(b.length||G2.day*24+G2.hour>=AT('2029-01-29',10)-1e-6) break; }
    info('M10 快轉停下來的地方（別的訊息也會停，停了就再快轉一次）：'+J(stops2));
    check('M10 研究所 2029 考前一週的週日（1/28）20:00「'+fill(T('g_rweek'),G29)+'」；在家快轉停在那一則',!e2&&b.length===1&&b[0].key==='2029-01-28'&&b[0].h===20&&b[0].text===fill(T('g_rweek'),G29)&&K(G2.day)+' '+hm(G2.hour)==='2029-01-28 20:00',J({e2,why:o2.why,at:K(G2.day)+' '+hm(G2.hour),b})); }
  { const G=H.fresh('2029-01-04',10,'home',Object.assign({},GF,{Y4_PUSH:'pass'})); transcripts(G,{terms:TO_Y4S1}); G.home={at:true}; H.G=G; const o={}; try{ await HOME.breakJump(GM,AT('2029-01-06',10),o); }catch(e){}
    const a=(G.msgs||[]).filter(m=>RG.test(m.tag||'')||/^【研究所】/.test(m.text||'')); check('M11 推甄上了（沒報研究所筆試）：寒假在家收不到【研究所】提醒、也沒有研究所總複習',!a.length&&!STUDY.reviewInfo(G,'grad'),J(a)); }
  { const G=freshPG('2030-01-10',10,{EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail',GRAD_EXAM_2029:true,GRAD_SCORE_2029:4,GRAD_EXAM_2029_PASS:false,GRAD_EXAM_RESULT:'fail',GRAD_RETRY:true}); transcripts(G,{});
    const r=await walkPG(G,AT('2030-02-16',8),RG), ms=r.msgs.filter(m=>RG.test(m.tag||'')); info('M12 研究所 2030 訊息：'+J(ms)+'；跳過的 12:00／20:00：'+J(r.visits.filter(v=>/ (12|20):00$/.test(v))));
    const o=ms.filter(m=>m.tag==='grad_remind_open_2030'), w=ms.filter(m=>m.tag==='grad_remind_week_2030');
    check('M12 研究所 2030（明年再考，畢業以後篇）：1/17 '+OPEN_HM+'「'+fill(T('g_ropen'),G30)+'」',o.length===1&&o[0].key==='2030-01-17'&&o[0].h===OPEN_H&&o[0].text===fill(T('g_ropen'),G30),J(o));
    check('M13 研究所 2030：2/10（日）20:00「'+fill(T('g_rweek'),G30)+'」',w.length===1&&w[0].key==='2030-02-10'&&w[0].h===20&&w[0].text===fill(T('g_rweek'),G30),J(w));
    check('M14 研究所 2030：「跳到下一件事」停在 1/17 '+OPEN_HM+'、2/10 20:00',r.visits.includes('2030-01-17 '+OPEN_HM)&&r.visits.includes('2030-02-10 20:00'),J(r.visits.filter(v=>/ (12|20):00$/.test(v)))); }
  { const G=freshPG('2031-01-05',10,{EXCHANGE_ROUTE:'TW',Y4_PATH:'grad',Y4_PUSH:'fail',GRAD_EXAM_2029:true,GRAD_EXAM_2029_PASS:false,GRAD_RETRY:true,GRAD_EXAM_2030:true,GRAD_SCORE_2030:4,GRAD_RETRY2:true}); transcripts(G,{}); PG.rec(G).done.r2y4b_grad_exam_2030=1;
    H.G=G; const inf0=STUDY.reviewInfo(G,'grad'), nx=STUDY.examRemindNext(G,'grad'); const r=await walkPG(G,AT('2031-02-15',8),RG), ms=r.msgs.filter(m=>RG.test(m.tag||'')||/^【研究所】/.test(m.text||''));
    H.G=G; H.at('2031-02-01',10); const inf1=STUDY.reviewInfo(G,'grad');
    check('M15 2031 再考研究所（GRAD_RETRY2）：沒有研究所總複習（1/5、2/1）、沒有提醒（走到 2/15 08:00）',!inf0&&!inf1&&!nx&&!ms.length,J({inf0:!!inf0,inf1:!!inf1,nx,ms})); }
});

/* ---------- Q 二試、研究所作答的 cue 和觀念卡回寫（BB-C 01:40，63847fe13：同一試那一套——讀過那張卡的題目前面出 cue、交卷後逐題回寫：答對＝got、答錯進 miss；計分不受影響）----------
   【前置／捷徑】先照玩家做一次總複習（STUDY.review，讀過範圍內所有卡）；作答用遊戲自己的那一場（司法官二試＝PG.runStep 10/21 08:30 e2b_2029；研究所＝PG.gradQuiz，ev_grad_exam 場景裡叫的那一個）；
   前 KQ 題選對、其他選錯（正確答案從題庫讀：這是「玩家選哪一個」） */
const KQ=6;
const quiz=async(G,getQs,run)=>{ const cues=[], asked=[]; let pendCue=null;
  const s1=GM.say; GM.say=async function(who,t){ const x=String(t); if(x.startsWith(STUDY.CUE_PREFIX)) pendCue=x; else { const m=x.match(/^(\d+)／(\d+)　/); if(m){ asked.push(+m[1]); cues[+m[1]-1]=pendCue; pendCue=null; } } return s1.apply(this,arguments); };
  quizAns=o=>{ const i=asked[asked.length-1]; if(!i) return null; const qs=getQs(); const q=qs&&qs[i-1]; if(!q) return null; const op=PG.opts(q), r=op.findIndex(x=>String(x.v)===String(q.answer)); if(r<0) return null; return i<=KQ?r:(r===0?1:0); };
  try{ await run(); } finally { GM.say=s1; quizAns=null; } return {cues,asked}; };
const cardsOf=(G,qs,ans)=>{ const mi=STUDY.rec(G).miss||[]; let got=0, miss=0; const bad=[]; qs.forEach((q,i)=>{ const ok=String(ans[i])===String(q.answer); for(const u of STUDY.unitsOfQ(q.id)){ const st=STUDY.stateOf(G,u.id), inM=mi.includes(u.id); if(st==='got') got++; if(inM) miss++; if(ok&&st!=='got') bad.push([i+1,'答對',u.id,st]); if(!ok&&!inM) bad.push([i+1,'答錯',u.id,st,inM]); } }); return {got,miss,bad}; };
await sec('Q 二試、研究所作答的 cue 和觀念卡回寫',async()=>{
  { const G=judgeG('2029-09-22',9,17); H.G=G; const qs0=PG.drawJudge(G,2029).map(q=>q.id); await STUDY.review(GM,'judge');
    const qsQ=qs0.map(id=>Q(id)), exp=qsQ.map(q=>{ try{ return STUDY.cueFor(G,q)||null; }catch(e){ return 'ERR'; } });
    H.at('2029-10-21',8.5); let s=null; for(let k=0;k<5;k++){ s=PG.due(G); if(!s||s.id==='e2b_2029') break; PG.rec(G).done[s.id]=1; s=null; }
    info('Q 司法官二試：10/21 08:30 PG.due＝'+J(s&&s.id)+'；總複習以後每題的 cue（STUDY.cueFor）'+J(exp.map(x=>x?x.slice(0,20):null)));
    const st0=J([G.flags.JUDGE_SCORE2_2029]); const r=await quiz(G,()=>qs0.map(id=>Q(id)),async()=>{ if(s) await PG.runStep(GM,s); });
    const Jd=PG.rec(G).judge[2029], ans=Jd&&Jd.ans||[], k=qsQ.filter((q,i)=>String(ans[i])===String(q.answer)).length, c=cardsOf(G,qsQ,ans);
    info('Q 司法官二試：作答的題號 '+J(r.asked)+'；出了 cue 的 '+J(r.cues.map(x=>!!x))+'；JUDGE_SCORE2_2029＝'+G.flags.JUDGE_SCORE2_2029+'；卡 got '+c.got+'、miss '+c.miss);
    check('Q1 司法官二試照遊戲那一場作答 10 題（e2b_2029）',r.asked.length===10&&J(Jd.qs)===J(qs0),J({asked:r.asked,s:s&&s.id}));
    check('Q2 司法官二試：讀過那張卡的題目前面有 cue（出 cue 的題＝STUDY.cueFor 有值的題；至少一題）',r.cues.length===10&&r.cues.every((x,i)=>!!x===!!exp[i])&&r.cues.some(Boolean),J({shown:r.cues.map(Boolean),exp:exp.map(Boolean)}));
    check('Q3 司法官二試：計分不受影響（JUDGE_SCORE2_2029＝答對題數 '+KQ+'）',G.flags.JUDGE_SCORE2_2029===KQ&&k===KQ,J({score:G.flags.JUDGE_SCORE2_2029,k}));
    check('Q4 司法官二試：交卷後逐題回寫（答對的卡＝got、答錯的卡進 miss）',!c.bad.length,J(c.bad.slice(0,6))); }
  { const G=H.fresh('2029-01-10',10,'home',Object.assign({},GF)); transcripts(G,{terms:TO_Y4S1}); G.stats={classes:0,study:0}; H.G=G; await STUDY.review(GM,'grad',{home:true});
    H.at('2029-02-03',9); const qs0=PG.drawGrad(G,2029).map(q=>q.id), qsQ=qs0.map(id=>Q(id)), exp=qsQ.map(q=>{ try{ return STUDY.cueFor(G,q)||null; }catch(e){ return 'ERR'; } });
    const r=await quiz(G,()=>qs0.map(id=>Q(id)),async()=>{ await PG.gradQuiz(GM,2029); });
    const X=PG.rec(G).grad[2029], ans=X&&X.ans||[], k=qsQ.filter((q,i)=>String(ans[i])===String(q.answer)).length, c=cardsOf(G,qsQ,ans);
    info('Q 研究所 2029：出了 cue 的 '+J(r.cues.map(x=>!!x))+'；GRAD_SCORE_2029＝'+G.flags.GRAD_SCORE_2029+'、GRAD_EXAM_2029_PASS＝'+G.flags.GRAD_EXAM_2029_PASS+'；卡 got '+c.got+'、miss '+c.miss);
    check('Q5 研究所 2/3 作答 10 題（PG.gradQuiz）',r.asked.length===10&&J(X.qs)===J(qs0),J(r.asked));
    check('Q6 研究所：讀過那張卡的題目前面有 cue（＝STUDY.cueFor 有值的題；至少一題）',r.cues.length===10&&r.cues.every((x,i)=>!!x===!!exp[i])&&r.cues.some(Boolean),J({shown:r.cues.map(Boolean),exp:exp.map(Boolean)}));
    check('Q7 研究所：計分不受影響（GRAD_SCORE_2029＝'+KQ+'、門檻 6＝錄取 true）',G.flags.GRAD_SCORE_2029===KQ&&k===KQ&&G.flags.GRAD_EXAM_2029_PASS===(KQ>=6),J({score:G.flags.GRAD_SCORE_2029,k,pass:G.flags.GRAD_EXAM_2029_PASS}));
    check('Q8 研究所：交卷後逐題回寫（答對＝got、答錯進 miss）',!c.bad.length,J(c.bad.slice(0,6))); }
});

/* ---------- W 寒假住家裡的選單（BB-C 01:32 條件；BB-C 02:00（8267bc481）：breakRound 加了「考前總複習」、開放那天的提醒 12:00；研究所 2029-01-25 在家要看得到、按下去開得了；快轉停 20:42 那件另開 HOME-FF-REMIND-ALIGN-1105，這一輪不判）----------
   照玩家：1/4 10:00 在宿舍 → HOME.go（選單「回家」那一條）→ 家裡的選單（住家裡）→「快轉」→「到下一個有事的日子」→ 途中 12:00 那一則打開手機 → 關掉 → 回到家裡的選單
   →（還沒到 1/25）「快轉」→「過一週」……→ 1/25 以後家裡的選單按「考前總複習」→ 讀完（先讀到這裡）→「回宿舍住」。記每一次家裡的選單、手機在幾點打開哪一則 */
await sec('W 寒假住家裡的選單',async()=>{
  const menus=[], phones=[]; let ph='start', nMenu=0, revDone=false, revSay=null; const ch1=GM.choose, pt1=GM.phoneThread;
  GM.choose=async function(o){ const ts=o.map(q=>(q.t||q.text)+(q.dim?'〔灰〕':'')), at=K(H.G.day)+' '+hm(H.G.hour), home=ts.some(t=>/^睡覺/.test(t)), ff=ts.some(t=>/^到下一個有事的日子/.test(t));
    const rvo=o.find(q=>/^考前總複習/.test(q.t||q.text||'')); menus.push({at,home,ff,opts:ts,rvHint:rvo?rvo.hint:null,rvDim:rvo?!!rvo.dim:null}); const idx=re=>{ const k=ts.findIndex(t=>re.test(t)); return k>=0?k:null; };
    if(++nMenu>80) return idx(/^回宿舍住|^不用了|^先讀到這裡/)??ts.length-1;
    if(ff) return ph==='first'?(idx(/^到下一個有事的日子/)??0):(idx(/^過一週/)??0);
    if(home){ if(revDone) return idx(/^回宿舍住/)??ts.length-1;
      if(ph==='start'){ ph='first'; return idx(/^快轉/)??0; }
      if(K(H.G.day)<'2029-01-25'){ ph='week'; return idx(/^快轉/)??0; }
      if(H.G.hour>=16) return idx(/^睡覺/)??0;   /* 晚上讀 4 小時太晚：照玩家先睡到隔天早上 */
      const r=idx(/^考前總複習/); if(r!=null&&!/〔灰〕/.test(ts[r])){ ph='review'; revDone=true; revSay=says.length; return r; } revDone=true; return idx(/^回宿舍住/)??ts.length-1; }
    return idx(/^先讀到這裡|^跳到下一科/)??0; };
  GM.phoneThread=async(th,o)=>{ phones.push({at:K(H.G.day)+' '+hm(H.G.hour),th,last:(H.G.msgs||[]).slice(-1).map(m=>m.text)[0]}); };
  try{ const G=H.fresh('2029-01-04',10,'dorm',Object.assign({},GF)); transcripts(G,{terms:TO_Y4S1}); G.stats={classes:0,study:0}; H.G=G; says=[];
    info('W 前置：1/4 10:00 宿舍，寒假（HOME.lawBreak '+J(HOME.lawBreak(G)&&HOME.lawBreak(G).key)+'），研究所總複習開著（STUDY.reviewOpt：'+J(STUDY.reviewOpt(G,{home:true}))+'）');
    let err=null; const s0=G.stats.study|0; let t0=null; try{ await HOME.go(GM); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
    const hm_=menus.filter(m=>m.home);
    info('W 家裡的選單（考前總複習那一項的提示、dim）：'+J(hm_.map(m=>({at:m.at,rv:(m.opts.find(t=>/^考前總複習/.test(t))||null),hint:m.rvHint,dim:m.rvDim})))); info('W 手機打開：'+J(phones)); info('W 結束：'+K(G.day)+' '+hm(G.hour)+(err?'；例外 '+err:''));
    const p=phones.find(x=>/^【研究所】2\/3 筆試/.test(x.last||'')), rm=(G.msgs||[]).find(m=>m.tag==='grad_remind_open_2029');
    check('W1 快轉途中停下來、手機打開那一則（【研究所】2/3 筆試…；訊息時間 1/4 '+OPEN_HM+'）',!!p&&p.at.startsWith('2029-01-04')&&!!rm&&K(rm.day)==='2029-01-04'&&rm.h===OPEN_H,J({p,rm:rm&&[K(rm.day),rm.h]}));
    info('W1b （這一輪不判：HOME-FF-REMIND-ALIGN-1105）停下來的時刻 '+J(p&&p.at));
    const first=hm_[0]; check('W2 1/4（研究所總複習開放那天）住家裡的選單有「考前總複習」、按得下去',!!first&&first.at.startsWith('2029-01-04')&&first.opts.some(t=>t.startsWith('考前總複習')&&!/〔灰〕/.test(t)),J(first));
    const mid=hm_.filter(m=>m.at>'2029-01-04 12:59'&&m.at<'2029-01-25');
    check('W3 手機關掉以後回到家裡的選單（'+J(mid.map(m=>m.at))+'）都有「考前總複習」',mid.length>0&&mid.every(m=>m.opts.some(t=>t.startsWith('考前總複習'))),J(mid.map(m=>[m.at,m.opts])));
    const m25=hm_.filter(m=>m.at>='2029-01-25').find(m=>+m.at.slice(11,13)<16)||hm_.find(m=>m.at>='2029-01-25');
    { const late=hm_.filter(m=>+m.at.slice(11,13)>=20&&m.opts.some(t=>/^考前總複習/.test(t)));
      info('W 晚上 20:00 以後的家裡選單：「考前總複習」那一項 dim＝'+J(late.map(m=>[m.at,m.rvDim,m.rvHint])));
      if(late.length) check('W5 20:00 以後（'+J(late.map(m=>m.at))+'）家裡選單的「考前總複習」是灰的、提示「要讀四個小時。20:00 以後開始就太晚了。」（193d1fd4f，BB-C 02:15；同宿舍書桌）',late.every(m=>m.rvDim===true&&m.rvHint===T('g_late')),J(late.map(m=>[m.at,m.rvDim,m.rvHint])));
      else info('W5 這一次沒遇到 20:00 以後的家裡選單（沒測到）'); } const L2=revSay!=null?says.slice(revSay):[], op=L2.find(x=>/筆記攤開/.test(x))||'';
    check('W4 1/25 以後（'+(m25&&m25.at)+'）住家裡的選單看得到「考前總複習」、按下去開得了（開始字幕「（你把公法的筆記攤開。…」、讀 4 小時）',!!m25&&m25.opts.some(t=>t.startsWith('考前總複習')&&!/〔灰〕/.test(t))&&/^（你把公法的筆記攤開。研究所要考的 \d 科，一共 \d+ 張觀念卡。）$/.test(op)&&(G.stats.study|0)-s0===4,J({m25,op,study:(G.stats.study|0)-s0}));
    { const G2=H.fresh('2029-01-04',10,'dorm',Object.assign({},GF)); transcripts(G2,{terms:TO_Y4S1}); H.G=G2; const o=STUDY.reviewOpt(G2,{}); info('W 對照：同一天在宿舍的書桌（story3d deskScene 照 STUDY.reviewOpt）：'+J(o)); }
  } finally { GM.choose=ch1; GM.phoneThread=pt1; }
});
console.log('\n'+(FAILS?'FAILED '+FAILS+'：'+FL.join('、'):'ALL PASS '+PASSES)+'（判定歸 BB）');
process.exit(FAILS?1:0);
})();
