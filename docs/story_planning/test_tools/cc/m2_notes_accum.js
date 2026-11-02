// CC M2「訂正筆記長期累積」——不需要瀏覽器（Node）。
// 用法：
//   cd /home/user/Lawstudent && git archive <SHA> src tests index.html | tar -x -C <資料夾>
//   nice -n 19 node docs/story_planning/test_tools/cc/m2_notes_accum.js <資料夾> [種子數，預設 12]
//   （資料夾＝有 src/、tests/pg_harness.js 的受測版本根目錄）
// 做什麼：從大一上到大四下（LAW_TERMS），每學期照 CLS.examList 的日期順序，對每一門考五題的課呼叫真正的 CLS.runExam（期末考）；
//   考試時每一題（「n／5　題目」之後的選項）用種子亂數選；學期末呼叫 CLS.showGrades（真的排重修 planRetakes），重修照下學期 examList 一起考；
//   大四下 6/18 呼叫 FD.check（真的排補考），6/26 呼叫 FD.makeup（真的 runExam kind='makeup'）。
//   GM.addNote 用 src/game3d.js 裡的 addNote 原始碼（抽出來執行，不是自己重寫）。
// 模式：random（多個種子）、allright（全對）、allwrong（全錯：每學期都重修、大四下補考）、mkpass（大四下期末全錯、補考全對）。
// 檢查（每一項都會在有 bug 時 FAIL）：
//   1 訂正筆記數＝答錯的考試場數（每場 examfix_<學期:課:kind> 一則）；id 不重複、不漏、不多；內文題號＝答錯的題號、題幹、答案、考點逐題對；筆記日期＝考試那天
//   2 miss 清單＝獨立重算的模型（照作答順序、答錯的題的觀念卡、移到最後、上限 300）完全相同；miss 裡每張卡都對得上某一題答錯的題號、課程一致；沒有答錯過的卡不在 miss
//   3 筆記頁順序（renderNotes 照 G.notes 原順序）：訂正筆記的日期、學期不倒退；列出實際順序
//   4 全對的考試不產生筆記；snapshot→JSON→migrate（game3d.js 抽出）→STUDY.rec 以後筆記與 miss 不變
'use strict';
const path=require('path'), fs=require('fs'), vm=require('vm');
const SRC=path.resolve(process.argv[2]||'/tmp/claude-0/-home-user-Lawstudent/d06332e2-ec70-5e42-a15c-5a4b27dbdb56/scratchpad/m2src');
const NSEED=+(process.argv[3]||12);
const H=require(path.join(SRC,'tests/pg_harness.js'));
const {GM}=H;
const load=f=>{ const p=path.join(SRC,f); if(!fs.existsSync(p)){ console.log('（沒有 '+f+'）'); return; } const src=fs.readFileSync(p,'utf8').replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/study_units.js','src/study3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/faildelay3d.js']) try{ load(f); }catch(e){ console.log('載入失敗 '+f+'：'+e); }
GM.caption=()=>{}; GM.toast=()=>{};
/* 出席制的課（點名）不在 M2 範圍：一律算出席及格，免得「沒點名」被當干擾重修／補考（FD.check 只有全部是考五題的課才排補考）*/
CLS.attPass=()=>true;

/* ---- 真的 addNote（src/game3d.js）---- */
const g3=fs.readFileSync(path.join(SRC,'src/game3d.js'),'utf8');
const mAdd=g3.match(/function addNote\(id,title,body\)\{[\s\S]*?return true; \}/);
if(!mAdd){ console.log('FAIL 0. 找不到 game3d.js 的 addNote'); process.exit(1); }
GM.addNote=new Function('H','toast','A3','return function(id,title,body){ const G=H.G; return ('+mAdd[0]+')(id,title,body); };')(H,()=>{},{blip(){}});
GM.hasNote=id=>!!H.G.notes.find(n=>n.id===id);
/* renderNotes 的筆記迴圈：確認是照 G.notes 原順序（沒有 sort／reverse）*/
const grab=name=>{ const i=g3.indexOf('function '+name+'('); if(i<0) return null; let d=0; for(let j=g3.indexOf('{',i);j<g3.length;j++){ if(g3[j]==='{') d++; else if(g3[j]==='}'){ d--; if(!d) return g3.slice(i,j+1); } } return null; };
const mRender=(()=>{ const t=grab('renderNotes'); return t?[t]:null; })();
const renderPlain=!!mRender&&/for\(const n of G\.notes\)/.test(mRender[0])&&!/G\.notes(\.slice\([^)]*\))?\.(sort|reverse)\(/.test(mRender[0]);
/* game3d.js 的 migrate（讀檔時跑）：抽出來執行 */
const mMig=grab('migrate');
const mDef=g3.match(/function defaults\(name\)\{[^\n]*?savedAt:0\}; \}/);

let fails=0; const R0=[];
const check=(name,ok,info)=>{ const line=(ok?'PASS ':'FAIL ')+name+(info?'　'+info:''); console.log(line); R0.push(line); if(!ok) fails++; };
const rngOf=seed=>()=>{ seed|=0; seed=seed+0x6D2B79F5|0; let t=Math.imul(seed^seed>>>15,1|seed); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; };

/* 作答：最近一句是「n／5　題目」＝選答案（照模式）；其他選項＝0 */
let mode='random', rnd=Math.random, curQs=null;
const QRE=/^(\d)／5　/;
GM.choose=async o=>{ H.opts.push(o.map(q=>q.t)); const last=H.said[H.said.length-1]; const m=last&&QRE.exec(last.t);
  if(!m||!curQs) return 0; const q=curQs[+m[1]-1]; if(!q) return Math.floor(rnd()*o.length);
  const ok=x=>{ const t=x.t||x.text; return t===String(q.answer)||t.startsWith('（'+q.answer+'）'); };
  if(mode==='allright'){ const k=o.findIndex(ok); return k<0?0:k; }
  if(mode==='allwrong'||(mode==='mkpass'&&curKind!=='makeup'&&curTerm==='Y4S2')){ const k=o.findIndex(x=>!ok(x)); return k<0?0:k; }
  if(mode==='mkpass'&&curKind==='makeup'){ const k=o.findIndex(ok); return k<0?0:k; }
  if(mode==='mix'&&mixRight){ const k=o.findIndex(ok); return k<0?0:k; }
  return Math.floor(rnd()*o.length); };
let curKind=null, curTerm=null, mixRight=false;

/* 包住 CLS.runExam：記錄每一場（先 drawExam 拿題目，runExam 會用同一份）*/
const origRun=CLS.runExam; let LOG=[];
CLS.runExam=async function(gm,it){ const G=gm.G; curKind=it.exam; curTerm=it.term; mixRight=mode==='mix'&&rnd()<0.5; const d=CLS.drawExam(G,it.c.id,it.term,it.exam); curQs=d.ok?d.qs:null;
  const before=G.notes.length, missBefore=(G.study&&G.study.miss||[]).slice(); const r=await origRun.call(this,gm,it); curQs=null;
  const key=it.term+':'+it.c.id+':'+it.exam, e=(CLS.rec(G).exam||{})[key]||{};
  LOG.push({key,term:it.term,cid:it.c.id,cname:it.c.name,kind:it.exam,day:G.day,held:!!(r&&r.held),correct:r&&r.correct,qs:d.ok?d.qs:[],ans:(e.ans||[]).slice(),notesAdded:G.notes.length-before,missBefore});
  return r; };

const fmtD=d=>{ const x=CALENDAR.dateOf(d); return x?x.y+'/'+x.m+'/'+x.d:String(d); };

async function sim(seed,md){
  mode=md; rnd=rngOf(seed*7919+13); LOG=[];
  const G=H.fresh('2025-09-01',8,'dorm',{examSeed:1000+seed}); G.notes=[]; G.memo=[];
  for(const T of CLS.LAW_TERMS){
    const ex=CLS.examList(G,T).slice().sort((a,b)=>a.day-b.day||a.t0-b.t0);
    for(const e of ex){ G.day=e.day; G.hour=e.t0; await CLS.runExam(GM,{c:e.c,exam:'final',term:T}); }
    const last=ex.length?ex[ex.length-1].day:G.day; G.day=last+1; G.hour=9;
    if(T==='Y4S2'){ G.day=PG.DK('2029-06-18'); }
    await CLS.showGrades(GM,T,{inScene:true});
    if(T==='Y4S2'&&typeof FD!=='undefined'){ await FD.check(GM,{inScene:true}); if(FD.mkPending&&FD.mkPending(G)){ G.day=FD.mkDay(); G.hour=9.5; await FD.makeup(GM); } }
  }
  return {G,log:LOG.slice()};
}

/* 獨立模型：miss */
function missModel(log){ const m=[]; for(const x of log){ if(!x.held) continue; x.qs.forEach((q,i)=>{ if(String(x.ans[i])===String(q.answer)) return; for(const u of STUDY.unitsOfQ(q.id)){ const k=m.indexOf(u.id); if(k>=0) m.splice(k,1); m.push(u.id); } }); if(m.length>300) m.splice(0,m.length-300); } return m; }

function verify(tag,G,log,{printOrder}={}){
  const fixes=G.notes.filter(n=>/^examfix_/.test(n.id));
  const wrongEx=log.filter(x=>x.held&&x.correct<5), rightEx=log.filter(x=>x.held&&x.correct===5), notHeld=log.filter(x=>!x.held);
  const ids=G.notes.map(n=>n.id), dupIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
  const expIds=wrongEx.map(x=>'examfix_'+x.key), gotIds=fixes.map(n=>n.id);
  const missing=expIds.filter(i=>!gotIds.includes(i)), extra=gotIds.filter(i=>!expIds.includes(i));
  const dupKeys=log.map(x=>x.key).filter((k,i,a)=>a.indexOf(k)!==i);
  check(tag+' 1a 訂正筆記數＝答錯的考試場數（'+fixes.length+'／'+wrongEx.length+'；共考 '+log.length+' 場、全對 '+rightEx.length+'、未開考 '+notHeld.length+'）',fixes.length===wrongEx.length&&!missing.length&&!extra.length,missing.length||extra.length?JSON.stringify({missing,extra}):'');
  check(tag+' 1b 筆記 id 不重複、同一場考試 key 不重複',!dupIds.length&&!dupKeys.length,JSON.stringify({dupIds,dupKeys}));
  /* 每場答錯＝當場新增剛好一則；全對＝0 則 */
  const badAdd=log.filter(x=>x.held&&x.notesAdded!==(x.correct<5?1:0)).map(x=>x.key+':'+x.notesAdded);
  check(tag+' 1c 每場考試當下新增的筆記數（答錯＝1、全對＝0）',!badAdd.length,JSON.stringify(badAdd.slice(0,5)));
  /* 內文逐題 */
  const bodyErr=[];
  for(const x of wrongEx){ const n=fixes.find(f=>f.id==='examfix_'+x.key); if(!n) continue;
    const blocks=n.body.split('\n\n'); const wi=x.qs.map((q,i)=>String(x.ans[i])===String(q.answer)?-1:i).filter(i=>i>=0);
    if(blocks.length!==wi.length){ bodyErr.push(x.key+' 段數 '+blocks.length+'≠答錯 '+wi.length); continue; }
    wi.forEach((i,k)=>{ const q=x.qs[i], b=blocks[k], a=q.type==='tf'||!q.options?q.answer:'（'+q.answer+'）'+q.options[q.answer];
      if(!b.startsWith('第 '+(i+1)+' 題　'+q.q+'\n')) bodyErr.push(x.key+' 第'+(i+1)+'題 題號／題幹不符');
      if(!b.includes('\n答案：'+a)) bodyErr.push(x.key+' 第'+(i+1)+'題 答案不符');
      if(q.core&&!b.includes('\n考點：'+q.core)) bodyErr.push(x.key+' 第'+(i+1)+'題 考點不符');
      if(!q.core&&b.includes('考點：')) bodyErr.push(x.key+' 第'+(i+1)+'題 沒有考點卻寫了');
      if(!blocks.some(bb=>bb.includes(q.q))) bodyErr.push(x.key+' 題幹缺'); });
    if(n.day!==x.day) bodyErr.push(x.key+' 筆記日期 '+n.day+'≠考試日 '+x.day);
    const okQ=x.qs.filter((q,i)=>String(x.ans[i])===String(q.answer)); for(const q of okQ){ if(n.body.includes('　'+q.q+'\n')) bodyErr.push(x.key+' 答對的題也被寫進去：'+q.id); } }
  check(tag+' 1d 訂正內文：題號、題幹、答案、考點逐題對；答對的題不寫；筆記日期＝考試日',!bodyErr.length,JSON.stringify(bodyErr.slice(0,6)));
  /* 2 miss */
  const miss=(G.study&&G.study.miss)||[], model=missModel(log);
  check(tag+' 2a miss 清單＝獨立模型（作答順序、移到最後、上限 300）（長度 '+miss.length+'／模型 '+model.length+'）',JSON.stringify(miss)===JSON.stringify(model),miss.length!==model.length?'':JSON.stringify(miss.filter((u,i)=>model[i]!==u).slice(0,3)));
  const wrongQ=new Map(); for(const x of log) if(x.held) x.qs.forEach((q,i)=>{ if(String(x.ans[i])!==String(q.answer)) wrongQ.set(q.id,x); });
  const unmatched=[], courseBad=[];
  for(const uid of miss){ const u=STUDY.unit(uid); const qs=(u&&u.qids)||[]; const hit=qs.filter(q=>wrongQ.has(q)); if(!hit.length){ unmatched.push(uid); continue; }
    const x=wrongQ.get(hit[0]); const base=(CLS.redoOf&&CLS.redoOf(x.cid))||null; const cids=[x.cid,base&&base.id].filter(Boolean); if(!cids.includes(u.course)&&u.course!=='crimpro_qbank') courseBad.push(uid+'←'+x.key+'('+u.course+')'); }
  check(tag+' 2b miss 每張卡都對得上一題答錯的題號（卡片 qids）、課程一致',!unmatched.length&&!courseBad.length,JSON.stringify({unmatched:unmatched.slice(0,5),courseBad:courseBad.slice(0,5)}));
  const noUnit=[...wrongQ.keys()].filter(q=>!STUDY.unitsOfQ(q).length);
  const missSet=new Set(miss); const lost=[...wrongQ.keys()].filter(q=>STUDY.unitsOfQ(q).length&&!STUDY.unitsOfQ(q).some(u=>missSet.has(u.id)));
  check(tag+' 2c 答錯的題（有觀念卡的）都進了 miss（答錯題 '+wrongQ.size+'；沒有觀念卡的題 '+noUnit.length+'）',model.length>300||!lost.length,JSON.stringify({lost:lost.slice(0,5),noUnit:noUnit.slice(0,8)}));
  /* 3 順序 */
  const order=fixes.map(n=>{ const k=n.id.slice(8).split(':'); return {day:n.day,term:k[0],cid:k[1],kind:k[2],title:n.title}; });
  const ti=t=>CLS.LAW_TERMS.indexOf(t); const inv=[];
  for(let i=1;i<order.length;i++){ if(order[i].day<order[i-1].day) inv.push('日期倒退 '+i); if(ti(order[i].term)<ti(order[i-1].term)) inv.push('學期倒退 '+i); }
  check(tag+' 3a 筆記頁（G.notes 原順序）訂正筆記的日期、學期不倒退',renderPlain&&!inv.length,(renderPlain?'':'renderNotes 不是照 G.notes 原順序 ')+JSON.stringify(inv.slice(0,5)));
  if(printOrder){ console.log('   —— '+tag+' 筆記頁實際順序（訂正筆記，舊→新）——'); order.forEach((o,i)=>console.log('   '+String(i+1).padStart(2)+'. '+fmtD(o.day)+'（頁面顯示 '+SOCIAL.dayLabel(o.day)+'）'+o.term+' '+o.kind+'　'+o.title)); }
  /* 4 save/load */
  const snap=JSON.parse(JSON.stringify(Object.assign({},G,{v:2,savedAt:Date.now()})));
  let migOk=null, migErr='';
  if(mMig&&mDef){ try{ const mig=new Function('SAVE_VER','CLS','STUDY','SOCIAL','STORY','PG','FD',mDef[0]+'\n'+mMig+'\nreturn migrate;')(2,CLS,STUDY,SOCIAL,STORY,PG,typeof FD!=='undefined'?FD:undefined); const s2=mig(snap); migOk=s2||snap; }catch(e){ migErr=String(e).slice(0,160); } }
  const L=migOk||snap; STUDY.rec(L);
  const same=JSON.stringify(L.notes)===JSON.stringify(G.notes)&&JSON.stringify(L.study.miss)===JSON.stringify(G.study.miss);
  check(tag+' 4b 存讀檔（snapshot→JSON'+(migOk?'→game3d migrate':'（migrate 抽出失敗，只測 JSON）')+'→STUDY.rec）後筆記、miss 不變',same,migErr);
  return {fixes,order,wrongEx,rightEx,log,noUnit};
}

(async()=>{
  console.log('受測：'+SRC+'　種子數 '+NSEED);
  check('0. renderNotes 照 G.notes 原順序顯示（沒有 sort／reverse，舊→新）',renderPlain);
  let agg={exams:0,wrong:0,right:0,notes:0,retake:0,makeup:0}; const noUnitAll=new Set();
  for(let s=1;s<=NSEED;s++){ const {G,log}=await sim(s,'random'); const v=verify('[seed '+s+']',G,log,{printOrder:s===1});
    agg.exams+=log.length; agg.wrong+=v.wrongEx.length; agg.right+=v.rightEx.length; agg.notes+=v.fixes.length; agg.retake+=log.filter(x=>CLS.LAW_TERMS.indexOf(x.term)>=0&&(G.courses.retake||[]).some(r=>r.term===x.term&&r.id===x.cid)).length; agg.makeup+=log.filter(x=>x.kind==='makeup').length; v.noUnit.forEach(q=>noUnitAll.add(q)); }
  for(let s=1;s<=Math.max(2,NSEED>>1);s++){ const {G,log}=await sim(500+s,'mix'); const v=verify('[mix '+s+']',G,log,{printOrder:s===1});
    check('[mix '+s+'] 全對場次與答錯場次交錯出現（全對 '+v.rightEx.length+'、答錯 '+v.wrongEx.length+'）',v.rightEx.length>0&&v.wrongEx.length>0); }
  console.log('隨機種子合計：'+JSON.stringify(agg)+'　答錯但沒有觀念卡的題：'+[...noUnitAll].join(','));
  { const {G,log}=await sim(101,'allright'); const v=verify('[allright]',G,log);
    check('[allright] 4a 全對：沒有任何訂正筆記、miss 空、沒有重修／補考',v.fixes.length===0&&!(G.study&&G.study.miss||[]).length&&!(G.courses.retake||[]).length&&!(G.flags.FD_MAKEUP)&&!log.some(x=>x.kind==='makeup')&&log.length>0,JSON.stringify({notes:v.fixes.length,exams:log.length})); }
  { const {G,log}=await sim(202,'allwrong'); const v=verify('[allwrong]',G,log,{printOrder:true});
    const rt=log.filter(x=>(G.courses.retake||[]).some(r=>r.term===x.term&&r.id===x.cid)), mk=log.filter(x=>x.kind==='makeup');
    check('[allwrong] 重修、補考都有發生而且各有自己的筆記（重修 '+rt.length+' 場、補考 '+mk.length+' 場）',rt.length>0&&mk.length>0&&rt.concat(mk).every(x=>G.notes.some(n=>n.id==='examfix_'+x.key)));
    const titles=v.fixes.map(n=>n.title), dupT=titles.filter((t,i)=>titles.indexOf(t)!==i);
    console.log('   [allwrong] 標題重複的訂正筆記（不同場、同一個標題）：'+dupT.length+' 則，例：'+[...new Set(dupT)].slice(0,4).join('、'));
    const mkN=mk.map(x=>G.notes.find(n=>n.id==='examfix_'+x.key)).filter(Boolean);
    console.log('   [allwrong] 補考的訂正筆記標題：'+mkN.map(n=>n.title).join('、')); }
  { const {G,log}=await sim(303,'mkpass'); const v=verify('[mkpass]',G,log);
    const mk=log.filter(x=>x.kind==='makeup'); check('[mkpass] 大四下補考全對：補考那幾場沒有筆記、期末那幾場有',mk.length>0&&mk.every(x=>x.correct===5&&!G.notes.some(n=>n.id==='examfix_'+x.key))&&mk.every(x=>G.notes.some(n=>n.id==='examfix_Y4S2:'+x.cid+':final')),JSON.stringify(mk.map(x=>x.key+':'+x.correct))); }
  console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
