// 修改前基準：期末成績是否只看答題（不讀書全對 vs 讀很多全錯）。node score_sim.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT='/tmp/claude-0/-home-user-Lawstudent/a08a2075-8dd6-5be2-9e44-b63f69067248/scratchpad/lw';
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK|HONOR|GRADES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js','src/honor3d.js','src/grades3d.js']) load(f);
const DAY=86400000, dayOf=s=>{ const [y,m,d]=s.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const mkG=(day,hour)=>({day,hour,flags:{examSeed:12345},weekday:CALENDAR.dateOf(day).wd%7,zone:'dorm',stage:'law',stats:{study:0},notes:[]});
function mkGM(G,ans){ const log=[]; return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},choose:async o=>ans(o),fade:async()=>{},advance(){},sleep:async()=>{},caption(){},autosave(){},setGoal(){} }; }
const vals=q=>q.type==='tf'||!q.options?['對','錯']:Object.keys(q.options);
// policy(q, opts, nthChoiceForThisQ) -> index
async function takeFinal(G,cid,term,policy){ const r=CLS.drawExam(G,cid,term,'final'); let i=-1, tries=0, cur=null;
  const GM=mkGM(G,(o)=>{ const ts=o.map(x=>x.t); if(!cur||tries>=1&&ts.length===vals(cur).length){} return 0; });
  // 依題目逐次回應：runExam 每題先 choose 一次；有書且答錯才再 choose 一次（選項少一個）
  let qi=0, pendingRetry=false, recallLeft=CLS.hasBook(G,CLS.byId(cid))?1:0;   /* runExam：一場期末考只有一次「想起」（recall），之後答錯就照錯 */
  GM.choose=async o=>{ const q=r.qs[qi]; const ts=o.map(x=>x.t); const isRetry=pendingRetry;
    const optVals=ts.map(t=>{ const m=/^（([A-Z])）/.exec(t); return m?m[1]:t; });
    const idx=policy(q,optVals,isRetry);
    if(isRetry){ pendingRetry=false; qi++; }
    else if(String(optVals[idx])!==String(q.answer)&&recallLeft&&optVals.length>2){ recallLeft=0; pendingRetry=true; }
    else qi++;
    return idx; };
  const res=await CLS.runExam(GM,{c:CLS.byId(cid),exam:'final',term}); return res; }
const right=(q,ov)=>ov.findIndex(v=>String(v)===String(q.answer));
const wrong=(q,ov)=>ov.findIndex(v=>String(v)!==String(q.answer));
const firstWrongThenRight=(q,ov,retry)=>retry?right(q,ov):wrong(q,ov);
const LAW=['const_1','crim_gen1','civ_general'];
const ATT=['pe_y1s1','chinese_y1','ge_film_y1s1','english_y1','econ_principles_1'];
async function scenario(name,setup,policyFor){
  const G=mkG(dayOf('2025-12-19'),9); setup(G); const R=CLS.rec(G); const out={};
  for(const c of LAW){ const res=await takeFinal(G,c,'Y1S1',policyFor(c)); out[c]=res.correct+'題/'+res.score+'分'; }
  const rep=CLS.reportFor(G,'Y1S1'); const fails=CLS.failedIn(G,'Y1S1').map(c=>c.id);
  console.log('\n## '+name); console.log('  prep='+JSON.stringify(R.prep)+' attend='+JSON.stringify(R.attend)+' stats.study='+G.stats.study+' books='+JSON.stringify(G.flags.books||{}));
  console.log('  期末作答：'+JSON.stringify(out)); console.log('  成績單：'+JSON.stringify(rep)); console.log('  failedIn：'+JSON.stringify(fails));
  console.log('  HONOR.avg='+HONOR.avg(G,'Y1S1')+' 書卷獎='+HONOR.won(G,'Y1S1')+' GRADES.lv='+GRADES.lv(G,'Y1S1'));
  return {G,rep}; }
(async()=>{
  await scenario('A 完全不讀書、不出席、法律課期末全答對', G=>{}, c=>right);
  await scenario('A2 完全不讀書、看出席的課各去 3 堂、法律課期末全答對', G=>{ const R=CLS.rec(G); for(const c of ATT) R.attend[c]=3; }, c=>right);
  await scenario('B 讀很多（prep 200、出席 40、自習 999 小時、教科書都買）、法律課期末全答錯', G=>{ const R=CLS.rec(G); for(const c of LAW.concat(ATT)){ R.prep[c]=200; R.attend[c]=40; } G.stats.study=999; G.flags.books={'憲法':true,'刑法總則':true,'民法總則':true}; for(let i=0;i<60;i++) G.notes.push({id:'n'+i}); }, c=>wrong);
  await scenario('C 不讀書、出席各 3 堂、每科答對 3 題', G=>{ const R=CLS.rec(G); for(const c of ATT) R.attend[c]=3; }, c=>{ let n=0; return (q,ov)=>(n++<3?right(q,ov):wrong(q,ov)); });
  await scenario('C2 讀很多（同 B，但沒買書）、每科答對 3 題', G=>{ const R=CLS.rec(G); for(const c of LAW.concat(ATT)){ R.prep[c]=200; R.attend[c]=40; } G.stats.study=999; }, c=>{ let n=0; return (q,ov)=>(n++<3?right(q,ov):wrong(q,ov)); });
  await scenario('D 有買教科書（三本）、不讀書、每題第一次都選錯、第二次選對', G=>{ const R=CLS.rec(G); for(const c of ATT) R.attend[c]=3; G.flags.books={'憲法':true,'刑法總則':true,'民法總則':true}; }, c=>firstWrongThenRight);
  await scenario('D2 沒買書、不讀書、每題第一次都選錯（無第二次）', G=>{ const R=CLS.rec(G); for(const c of ATT) R.attend[c]=3; }, c=>firstWrongThenRight);
  // F 缺考
  { const G=mkG(dayOf('2026-01-20'),9); const R=CLS.rec(G); for(const c of ATT) R.attend[c]=3; R.prep.civ_general=500; console.log('\n## F 讀很多但期末缺考（沒有考試紀錄）'); console.log('  成績單：'+JSON.stringify(CLS.reportFor(G,'Y1S1'))+' HONOR.avg='+HONOR.avg(G,'Y1S1')); }
  // 期中練習是否影響
  { const G=mkG(dayOf('2025-11-05'),9); const r=CLS.drawExam(G,'civ_general','Y1S1','mid'); const GM=mkGM(G,(o)=>0); const res=await CLS.runExam(GM,{c:CLS.byId('civ_general'),exam:'mid',term:'Y1S1'}); console.log('\n## M 期中練習（全選第一個）'); console.log('  '+GM.log[0]+' → '+JSON.stringify(res)+'；R.exam keys='+Object.keys(CLS.rec(G).exam)+'；reportFor civ_general='+CLS.reportFor(G,'Y1S1').civ_general); }
  console.log('\nscoreOf 0..5 =',[0,1,2,3,4,5].map(CLS.scoreOf).join(','));
})().catch(e=>{ console.log('ERR',e.stack); });
