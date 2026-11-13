// CC N1（2026-11-02）：每學期期末考日期全面檢查（BUG-Y4S2-NOFINAL-1102 同一類）——純 Node，不開瀏覽器。
// 用法：LW=<工作樹> node n1_examdates.js        （LW 預設＝目前目錄；載入 <LW>/tests/pg_harness.js，只讀）
// 檢查：Y0S1～Y4S2（含交換路線 JP／US）每學期週數、最後一週、EXAM_WEEKS、每門考五題的課（CLS.isExamCourse）的期末考日 CLS.examDay(final)：
//   有沒有、落在不在那學期的期末週、是不是週末／假日、是不是補考（makeup）、同一天同一節有沒有兩門撞考；
//   重修學期（CLS.planRetakes 從每個學期排到下一學期）的重修課；延畢學期 Y5S1（CALENDAR.TERMS_DELAYED）；
//   Y0 舊序章的系：考試週每堂課都是考試（dayItems），檢查期末週有沒有不放假的一堂；
//   6/2 畢業典禮、5/10～5/11 國考報名、6/18 成績單、6/26 補考、8/4 國考一試的日期關係。
// 重驗（BB 09:01）加：N1-A、N1-B 兩個回歸情境（輸出 PASS／FAIL；修改前 0c3d9e7a5 應 FAIL、d2716c89e 以後應 PASS）；
//   考試重疊全面掃描（一般學期、重修的各種組合（被當的考五題課所有子集合 × 出席課全過／全當）、連續重修、大四下 6/26 補考）：
//   兩場考試同一天同一節、考試和那天照常上課的課（看出席的課、服務學習、沒考試的課）同一節；標出是不是 examDay 的最後手段（撞也照考）。
const path=require('path'); const LW=path.resolve(process.env.LW||'.');
const H=require(path.join(LW,'tests/pg_harness.js'));
let probs=0; let BUST=0;
/* CLS.examDay 的 memo（classes3d.js examDayMemo）key＝課id|學期|kind|選修 JSON，不含重修時段、不含 G：每個情境換一個假的選修欄位，避免沿用上一個情境的結果（memo 本身的問題另外在最後一節示範）*/
const bust=(G,tag)=>{ const R=CLS.rec(G); R.electives=R.electives||{}; R.electives.__n1=(tag||'')+'#'+(++BUST); return G; };
const freshB=(k,h,z,f,tag)=>bust(H.fresh(k,h,z,f),tag); const P=(...a)=>{ probs++; console.log('PROBLEM',...a); };
const key=d=>{ const x=CALENDAR.dateOf(d); return x.key+'('+'一二三四五六日'[x.wd-1]+')'; };
const WEEK=['','一','二','三','四','五','六','日'];
console.log('EXAM_WEEKS',JSON.stringify(CLS.EXAM_WEEKS));
const allT=CALENDAR.TERMS.concat(CALENDAR.TERMS_DELAYED);
console.log('\n## 學期表');
for(const T of allT){ const r=CALENDAR.termDays(T.id); const lastW=[]; for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===T.id&&t.exam==='final') lastW.push(d); }
  const hol=[]; for(const d of lastW){ const h=CALENDAR.holiday(d); if(h) hol.push(key(d)+h); }
  console.log(T.id, '週數',T.weeks, '開學',T.start, '最後一天',key(r.to), '期末週(termOf.exam=final)', lastW.length?key(lastW[0])+'～'+key(lastW[lastW.length-1]):'（無：延畢學期 termOf 不涵蓋）', 'EXAM_WEEKS.final含最後一週?',CLS.EXAM_WEEKS.final?CLS.EXAM_WEEKS.final.includes(T.weeks):'（已拿掉）', '期末週假日',hol.join('、')||'無', '成績公布',CALENDAR.gradeDay(T.id)!=null?key(CALENDAR.gradeDay(T.id)):'-'); }
const checkOne=(G,c,T,tag,rows)=>{ const d=CLS.examDay(G,c,T,'final'); const t=d&&CALENDAR.termOf(d.day);
  const row={term:T,id:c.id,name:c.name,slots:(c.slots||[]).map(s=>WEEK[s.wd]+s.block).join('/'),day:d?key(d.day):null,block:d&&d.block,makeup:!!(d&&d.makeup),tag};
  if(!d){ P(tag,T,c.id,'沒有期末考日'); row.bad='沒有期末考日'; }
  else { const wd=CALENDAR.dateOf(d.day).wd, h=CALENDAR.holiday(d.day);
    if(!t||t.id!==T||t.exam!=='final'){ P(tag,T,c.id,'考試日不在那學期的期末週',key(d.day)); row.bad='不在期末週'; }
    if(wd>=6){ P(tag,T,c.id,'考試日是週末',key(d.day)); row.bad='週末'; }
    if(h){ P(tag,T,c.id,'考試日是假日',key(d.day),h); row.bad='假日'+h; } }
  rows.push(row); return d; };
const report=(rows)=>{ for(const r of rows) console.log(' ',r.tag,r.term,r.id,r.name,'['+r.slots+']','→',r.day,r.block,r.makeup?'（補一堂makeup）':'',r.bad?'★'+r.bad:''); };
const clash=(rows,label)=>{ const m={}; for(const r of rows){ if(!r.day) continue; const k=r.day+' '+r.block; (m[k]=m[k]||[]).push(r.id); } for(const [k,v] of Object.entries(m)) if(v.length>1) P(label,'同一天同一節兩門考試',k,v.join(',')); };
console.log('\n## 一般學期：每門考五題的課（COURSES.list，不管選修有沒有選；route 只看符合的）');
const LAW=CLS.LAW_TERMS;
let total=0;
for(const route of [null,'JP','US']){
  const G=freshB('2025-09-01',8,'dorm',route?{EXCHANGE_ROUTE:route}:{},'main'); const rows=[];
  for(const T of LAW){ for(const c of COURSES.list.filter(c=>c.term===T&&CLS.isExamCourse(c)&&(!c.route||c.route.includes(route)))){ if(route&&CLS.termAway(G,T)) continue; checkOne(G,c,T,'route='+(route||'TW'),rows); total++; } }
  if(!route) report(rows); else console.log('  route',route,'：',rows.length,'門（問題見 PROBLEM 行）', rows.filter(r=>r.makeup).map(r=>r.term+':'+r.id+'→'+r.day).join(' ')||'');
  /* 撞考：照實際選課（termCourses）*/ for(const T of LAW){ const rr=[]; for(const c of CLS.termCourses(G,T).filter(CLS.isExamCourse)){ const d=CLS.examDay(G,c,T,'final'); if(d) rr.push({id:c.id,day:key(d.day),block:d.block}); } clash(rr,'route='+(route||'TW')+' '+T); }
}
console.log('\n## Y0 舊序章的系（考試週每堂都是考試；成績固定及格）');
for(const T of ['Y0S1','Y0S2']){ const r=CALENDAR.termDays(T); const fin=[]; for(let d=r.from;d<=r.to;d++){ const t=CALENDAR.termOf(d); if(t&&t.id===T&&t.exam==='final') fin.push(d); }
  for(const c of COURSES.list.filter(c=>c.term===T)){ const ex=!(c.kind==='service'||CLS.noExam(c)); if(!ex){ console.log(' ',T,c.id,c.name,'（不考）'); continue; }
    const ok=fin.filter(d=>(c.slots||[]).some(s=>s.wd===CALENDAR.dateOf(d).wd)&&!CALENDAR.holiday(d)&&(!c.weeks||c.weeks.includes(CALENDAR.termOf(d).week)));
    const hol=fin.filter(d=>(c.slots||[]).some(s=>s.wd===CALENDAR.dateOf(d).wd)&&CALENDAR.holiday(d));
    console.log(' ',T,c.id,c.name,'期末週考試堂：',ok.map(key).join('、')||'★無', hol.length?'（放假：'+hol.map(d=>key(d)+CALENDAR.holiday(d)).join('、')+'）':''); if(!ok.length) P('Y0',T,c.id,'期末週沒有不放假的一堂（沒有期末考）'); } }
console.log('\n## 重修學期（planRetakes：某學期考五題的課全部沒考 → 排到下一學期；看重修課的期末考日）');
for(const route of [null,'JP','US']){ const rows=[];
  for(const F of LAW.slice(0,-1)) for(const mode of ['全部被當（含出席課）','只有考五題的課全被當'].concat(COURSES.list.filter(c=>c.term===F&&CLS.isExamCourse(c)).map(c=>'只當 '+c.id))){
    const G=freshB('2025-09-01',8,'dorm',route?{EXCHANGE_ROUTE:route}:{},'rt'); if(CLS.termAway(G,F)) continue;
    const ap=CLS.attPass, R=CLS.rec(G); R.exam=R.exam||{};
    if(mode!=='全部被當（含出席課）') CLS.attPass=()=>true;
    if(mode.startsWith('只當 ')){ const only=mode.slice(3); for(const c of CLS.termCourses(G,F).filter(CLS.isExamCourse)) if(c.id!==only) R.exam[F+':'+c.id+':final']={status:'done',correct:3}; }
    let made; try{ made=CLS.planRetakes(G,F); } finally { CLS.attPass=ap; }
    for(const r of made){ const c=CLS.rtCourse(r); if(!CLS.isExamCourse(c)) continue; checkOne(G,c,r.term,'retake '+(route||'TW')+' '+F+'→['+mode+']',rows); }
    for(const T of new Set(made.map(r=>r.term))){ const rr=[]; for(const c of CLS.termCourses(G,T).filter(CLS.isExamCourse)){ const d=CLS.examDay(G,c,T,'final'); if(d) rr.push({id:c.id,day:key(d.day),block:d.block}); } clash(rr,'retake '+(route||'TW')+' '+F+'→'+T); } }
  if(!route) report(rows); else console.log('  route',route,'：',rows.length,'門', rows.filter(r=>r.makeup||r.bad).map(r=>r.term+':'+r.id+'→'+r.day+(r.bad?'★'+r.bad:'')).join(' ')); }
/* 大四下被當＝沒有下一學期可重修：大四上的課重修到大四下（15 週）*/
console.log('\n## 延畢學期');
for(const T of CALENDAR.TERMS_DELAYED){ const r=CALENDAR.termDays(T.id); console.log(' ',T.id,'週數',T.weeks,key(r.from),'～',key(r.to),'termOfDelayed.exam=',JSON.stringify(CALENDAR.termOfDelayed(r.to).exam),'（AA_357 第 4 節：大五上沒有期末考；FD 重修只看出席三堂，faildelay3d.js S.result 12/24 判）');
  const ex=COURSES.list.filter(c=>c.term===T.id); console.log('   COURSES.list 裡 term='+T.id+' 的課：',ex.map(c=>c.id).join(',')||'（無）'); }
console.log('\n## 大四下 → 畢業後的日期鏈');
const DK=PG.DK; if(typeof FD==='undefined'){ const fs=require('fs'),vm=require('vm'); vm.runInThisContext(fs.readFileSync(path.join(LW,'src/faildelay3d.js'),'utf8').replace(/^const FD\s*=/m,'globalThis.FD='),{filename:'faildelay3d.js'}); } const pr=(n,k,h)=>{ const d=DK(k); console.log(' ',n,key(d),h!=null?h+'時':'', CALENDAR.holiday(d)?'★假日 '+CALENDAR.holiday(d):'', CALENDAR.termOf(d)?CALENDAR.termOf(d).id+' 第'+CALENDAR.termOf(d).week+'週'+(CALENDAR.termOf(d).exam?'('+CALENDAR.termOf(d).exam+')':''):'（不在學期）'); return d; };
const dReg=pr('國考報名問（postgrad3d reg，「這週五截止」）','2029-05-10',21);
pr('  →週五截止','2029-05-11');
const G=freshB('2029-05-20',8,'dorm',{},'y4'); const y4=CLS.termCourses(G,'Y4S2').filter(CLS.isExamCourse).map(c=>({c,d:CLS.examDay(G,c,'Y4S2','final')}));
for(const x of y4) console.log('  大四下期末考',x.c.id,x.d?key(x.d.day)+' '+x.d.block:'★無');
const dGrad=pr('畢業典禮（postgrad3d GRAD）','2029-06-02',6);
const gd=CALENDAR.gradeDay('Y4S2'); console.log('  CALENDAR.gradeDay(Y4S2)＝',key(gd),'；6/18＝',key(DK('2029-06-18')), gd===DK('2029-06-18')?'一致':'★不一致');
pr('補考（FD.MK_AT）',FD.MK_AT[0],FD.MK_AT[1]); pr('補考前一晚提醒',FD.MK_REMIND_AT[0],FD.MK_REMIND_AT[1]);
pr('宿舍收鑰匙（PG.SOFT）','2029-06-28',10); pr('國考一試','2029-08-04');
const lastExam=Math.max(...y4.filter(x=>x.d).map(x=>x.d.day));
if(lastExam>=DK('2029-06-02')) P('大四下期末考在畢業典禮當天或之後',key(lastExam));
if(!(DK('2029-05-11')<lastExam)) P('國考報名截止不在期末考之前');
if(!(DK(FD.MK_AT[0])>gd&&DK(FD.MK_AT[0])<DK('2029-06-28'))) P('補考不在成績單之後、收鑰匙之前');
if(CALENDAR.holiday(DK(FD.MK_AT[0]))||CALENDAR.weekend(DK(FD.MK_AT[0]))) P('補考日是假日或週末');
console.log('\n## examDay memo 示範（同一個瀏覽器工作階段讀另一個存檔：重修時段不同、選修相同）');
{ const mk=(slots)=>{ const G=H.fresh('2026-12-21',8,'dorm',{}); const R=CLS.rec(G); R.electives.__n1='memo'; R.retake=[{id:'oblig_gen1',from:'Y1S2',base:'Y1S2',term:'Y2S1',slots,alt:true}]; const c=CLS.termCourses(G,'Y2S1').find(x=>x.id==='oblig_gen1'); return CLS.examDay(G,c,'Y2S1','final'); };
  const a=mk([{wd:4,block:'pm2'}]), b=mk([{wd:5,block:'pm1'}]);
  console.log('  存檔A 重修在週四 pm2 →',a&&key(a.day)+' '+a.block,'；接著讀存檔B 重修在週五 pm1 →',b&&key(b.day)+' '+b.block);
  if(a&&b&&a.day===b.day&&a.block===b.block) P('examDay memo 沿用上一個存檔的結果：存檔B 週五的課拿到週四的考試日（dayItems 那天找不到這門課＝考不到＝缺考）'); }
console.log('\n## 重驗 N1-A：大一下幾乎全當（含出席課）→ 大二上重修債總（一）');
let rv=0; const RV=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) rv++; };
{ const G=freshB('2025-09-01',8,'dorm',{},'n1a'); const ap=CLS.attPass; CLS.attPass=()=>false; let made; try{ made=CLS.planRetakes(G,'Y1S2'); } finally { CLS.attPass=ap; }
  const r=made.find(x=>x.id==='oblig_gen1'); const c=r&&CLS.rtCourse(r); const d=c&&CLS.examDay(G,c,'Y2S1','final'); const t=d&&CALENDAR.termOf(d.day);
  console.log('  重修時段',r&&JSON.stringify(r.slots),'→ 期末考',d?key(d.day)+' '+d.block+(d.makeup?'（補一堂）':''):'null');
  RV('N1-A 債總（一）重修（週五下午二、12/25 放假）有期末考日、在大二上期末週、不是週末假日',!!d&&!!t&&t.id==='Y2S1'&&t.exam==='final'&&CALENDAR.dateOf(d.day).wd<=5&&!CALENDAR.holiday(d.day),JSON.stringify(d)); }
console.log('\n## 重驗 N1-B：同一頁先讀存檔 A 再讀存檔 B（重修時段不同、選修相同）');
{ const mkG=(slots)=>{ const G=H.fresh('2026-12-21',8,'dorm',{}); const R=CLS.rec(G); R.electives.__n1='n1b'; R.retake=[{id:'oblig_gen1',from:'Y1S2',base:'Y1S2',term:'Y2S1',slots,alt:true}]; return G; };
  const ex=G=>{ const c=CLS.termCourses(G,'Y2S1').find(x=>x.id==='oblig_gen1'); return CLS.examDay(G,c,'Y2S1','final'); };
  const expectWd=5;
  /* 照遊戲讀檔路徑：game3d.js loadFrom → CLS.resetExamMemo()（有的話）＋新的 G 物件 */
  const GA=mkG([{wd:4,block:'pm2'}]); const a=ex(GA); if(CLS.resetExamMemo) CLS.resetExamMemo(); const GB=mkG([{wd:5,block:'pm1'}]); const b=ex(GB);
  console.log('  resetExamMemo',typeof CLS.resetExamMemo,'；A',a&&key(a.day)+' '+a.block,'；B',b&&key(b.day)+' '+b.block);
  /* B 的正解：同一個情境在全新的 Node 行程算（不經過 A）＝週五 12/25 放假 → 補一堂；至少不能是 A 的週四 pm2 */
  RV('N1-B 讀檔路徑（清快取＋新 G）：存檔 B 不沿用存檔 A 的考試日',!!b&&!(a&&b.day===a.day&&b.block===a.block),JSON.stringify({a,b}));
  /* 更嚴：不清快取、同一個 G 物件就地換成 B 的內容（快取鍵要含重修時段）*/
  const GC=mkG([{wd:4,block:'pm2'}]); const c1=ex(GC); CLS.rec(GC).retake=[{id:'oblig_gen1',from:'Y1S2',base:'Y1S2',term:'Y2S1',slots:[{wd:5,block:'pm1'}],alt:true}]; const c2=ex(GC);
  RV('N1-B 同一個 G 就地換重修時段、不清快取：考試日跟著變',!!c2&&!(c1&&c2.day===c1.day&&c2.block===c1.block),JSON.stringify({c1,c2})); }
console.log('\n## 重驗 (3) 考試重疊掃描');
const exClash=(G,T,label,out)=>{ const rr=[]; const tc=CLS.termCourses(G,T);
  for(const c of tc.filter(CLS.isExamCourse)){ const d=CLS.examDay(G,c,T,'final'); if(!d){ out.push({label,T,kind:'沒有考試日',ids:[c.id]}); continue; }
    const wd=CALENDAR.dateOf(d.day).wd; const own=c.slots.some(s=>s.wd===wd&&s.block===d.block);
    const other=tc.filter(x=>x!==c&&x.slots.some(s=>s.wd===wd&&s.block===d.block));
    const last=d.makeup&&other.length>0;   /* 最後手段：補一堂卻落在別的課的時段 */
    rr.push({id:c.id,day:d.day,block:d.block,makeup:!!d.makeup,own,last});
    /* 和那天照常上課的課撞：非考五題的課（出席課、服務學習、沒考試的課）那天那一節有課（不放假、在它的 weeks 裡）*/
    for(const x of other){ if(CLS.isExamCourse(x)) continue; const wk=CALENDAR.termOf(d.day).week; if(x.weeks&&!x.weeks.includes(wk)) continue; out.push({label,T,kind:'考試和照常上課的課同一節'+(last?'（最後手段）':''),ids:[c.id,x.id],at:key(d.day)+' '+d.block}); } }
  const m={}; for(const r of rr){ const k=r.day+'|'+r.block; (m[k]=m[k]||[]).push(r); }
  for(const [k,v] of Object.entries(m)) if(v.length>1) out.push({label,T,kind:'兩場考試同一天同一節'+(v.some(r=>r.last)?'（含最後手段）':''),ids:v.map(r=>r.id+(r.makeup?'(補)':'')),at:key(+k.split('|')[0])+' '+k.split('|')[1]});
  return rr; };
const OV=[]; let scen=0, lastUsed=0;
const subsets=a=>{ const o=[]; for(let m=1;m<(1<<a.length);m++) o.push(a.filter((_,i)=>m&(1<<i))); return o; };
for(const route of [null,'JP','US']){
  { const G=freshB('2025-09-01',8,'dorm',route?{EXCHANGE_ROUTE:route}:{},'ov'); for(const T of LAW){ if(CLS.termAway(G,T)) continue; scen++; exClash(G,T,'一般 '+(route||'TW'),OV); } }
  for(const F of LAW.slice(0,-1)){ const G0=freshB('2025-09-01',8,'dorm',route?{EXCHANGE_ROUTE:route}:{},'ov'); if(CLS.termAway(G0,F)) continue;
    const exIds=CLS.termCourses(G0,F).filter(CLS.isExamCourse).map(c=>c.id);
    for(const sub of subsets(exIds)) for(const attFail of [false,true]){
      const G=freshB('2025-09-01',8,'dorm',route?{EXCHANGE_ROUTE:route}:{},'ov'); const R=CLS.rec(G); R.exam=R.exam||{};
      for(const id of exIds) if(!sub.includes(id)) R.exam[F+':'+id+':final']={status:'done',correct:3};
      const ap=CLS.attPass; CLS.attPass=()=>!attFail; let made; try{ made=CLS.planRetakes(G,F); } finally { CLS.attPass=ap; }
      const to=CLS.retakeTermAfter(G,F); if(!to) continue; scen++;
      const rr=exClash(G,to,'重修 '+(route||'TW')+' '+F+'['+sub.join('+')+(attFail?'＋出席課全當':'')+']',OV); lastUsed+=rr.filter(r=>r.last).length;
      /* 連續重修：to 那學期也全部沒考（含重修課）、出席課也全當 → 再下一學期 */
      if(sub.length===exIds.length&&attFail){ const CL=CLS.attPass; CLS.attPass=()=>false; try{ CLS.planRetakes(G,to); } finally { CLS.attPass=CL; } const to2=CLS.retakeTermAfter(G,to); if(to2){ scen++; const r2=exClash(G,to2,'連續重修 '+(route||'TW')+' '+F+'→'+to+'→'+to2,OV); lastUsed+=r2.filter(r=>r.last).length; } } } } }
const agg={}; for(const o of OV){ const k=o.kind+'｜'+o.T+'｜'+o.ids.join(',')+'｜'+(o.at||''); (agg[k]=agg[k]||[]).push(o.label); }
console.log('  情境',scen,'個；最後手段（補一堂落在別的課的時段）觸發',lastUsed,'次；重疊／問題',OV.length,'筆（合併後',Object.keys(agg).length,'種）');
for(const [k,v] of Object.entries(agg)) console.log('  ★',k,'×'+v.length,'例：',v.slice(0,3).join('；'));
{ /* 大四下 6/26 補考：同一場依序考所有補考科目（faildelay3d.js S.makeup 的 for 迴圈），不是並行 */
  if(typeof FD!=='undefined') console.log('  6/26 補考：FD.MK_AT',JSON.stringify(FD.MK_AT),'— 被當的科目在同一場依序考（S.makeup 逐科 runExam），不算重疊；那天沒有學期課（6/26 不在學期）'); }
console.log('\n重驗結果：FAIL',rv,'項');
console.log('\n考五題的課（一般學期，各 route 合計）檢查',total,'門次；PROBLEM',probs,'項');
process.exit(0);
