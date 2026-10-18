// 課堂提問（AA_130 第 3 節第 3 點；企劃分支 7180b53 的 syllabus ask:{qid}、exam_official 的 askedIn）——不需要瀏覽器。
//   1. 匯入：syllabus 69 週有 ask，每一題都在 EXAM_BANK、askedIn 和那一週一致；
//   2. 那堂課最後：黑板角落一題 → 題幹（題庫原文）→ 選項（原文、不洗牌）→「答案是（X）。」＋考點 → 這學期第一次才有「期末考，會考這樣的題目。」；
//   3. 不計分（attend／prep 只照上課加一、grades 不動）；同一學期第二次提問沒有那句；第二格的短片段、沒有 ask 的週不問。
// 修改前：syllabus 沒有 ask、CLS.classAsk 不存在（第 1、2 項失敗）。用法：node tests/class_ask_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const mkG=(day,hour)=>({day,hour,flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'dorm'});
function mkGM(G,pick){ const log=[]; return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},choose:async o=>{ log.push('choose:'+o.map(q=>q.t).join(' / ')); return pick||0; },fade:async()=>{},advance(){},energy(){},sleep:async()=>{},caption(){},autosave(){},setGoal(){} }; }
// 找某門課有 ask 的週，排在課表裡的那一天
function itemFor(cid,week){ for(let d=1;d<1500;d++){ const t=CALENDAR.termOf(d); if(!t||t.week!==week) continue; const it=CLS.dayItems(mkG(d,8),d).find(x=>x.c.id===cid&&!x.exam&&CLS.slotOrder(x).i<1); if(it) return it; } return null; }
(async()=>{
  const Q={}; for(const q of EXAM_BANK.questions) Q[q.id]=q;
  let n=0, bad=[]; const asks=[];
  for(const cid in SYLLABUS.courses) for(const w of SYLLABUS.courses[cid]) if(w.ask){ n++; asks.push([cid,w.w,w.ask.qid]); const q=Q[w.ask.qid]; if(!q||!q.askedIn||q.askedIn.course!==cid||q.askedIn.week!==w.w||q.status!=='USER_CONFIRMED') bad.push(w.ask.qid); }
  check('1. syllabus 有 ask 的週 74 個（2026-10-15 的 76 個，16 週制 civil40 拿掉 2 個第 16 週的 askedIn，AA 7abe189a），每一題都在 EXAM_BANK（USER_CONFIRMED），askedIn 和那一週一致',n===74&&!bad.length,'n='+n+' 不一致 '+JSON.stringify(bad));
  check('2. CLS.classAsk、CLS.askOf 存在',typeof CLS.classAsk==='function'&&typeof CLS.askOf==='function');
  if(typeof CLS.classAsk!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  // 大一上民法總則：第一題（第 5 週）、第二題
  const civ=asks.filter(a=>a[0]==='civ_general').sort((a,b)=>a[1]-b[1]);
  const it1=itemFor('civ_general',civ[0][1]), it2=itemFor('civ_general',civ[1][1]); const q1=Q[civ[0][2]], q2=Q[civ[1][2]];
  check('2. 找到民法總則第 '+civ[0][1]+'、'+civ[1][1]+' 週那一堂',!!it1&&!!it2);
  const G=mkG(it1.day,it1.t0+0.1); const GM=mkGM(G,1); await CLS.attend(GM,it1,{inScene:true});
  const L=GM.log; const iB=L.indexOf('（下課前，教授在黑板角落寫了一題。）'), iQ=L.indexOf(q1.q);
  const opt='choose:'+Object.keys(q1.options).map(k=>'（'+k+'）'+q1.options[k]).join(' / ');
  check('2. 黑板角落一題 → 題幹（題庫原文）',iB>=0&&iQ===iB+1,JSON.stringify(L.slice(-6)));
  check('2. 選項是題庫原文、照 A～D 的順序（不洗牌）',L[iQ+1]===opt,L[iQ+1]);
  const ansLine=L[iQ+2]||''; check('2. 「答案是（'+q1.answer+'）。」＋使用者給的考點',ansLine.startsWith('答案是（'+q1.answer+'）。')&&(!q1.core||ansLine.includes('考點：'+q1.core)),ansLine);
  check('2. 這學期第一次：教授說「期末考，會考這樣的題目。」',L.some(t=>/期末考，會考這樣的題目。$/.test(t)));
  check('2. 提問在那堂課的最後（之後沒有別的台詞）',L.length===iQ+4,JSON.stringify(L.slice(iQ)));
  const R=CLS.rec(G); check('3. 記下玩家選的（B），不計分：grades 沒動、出席只加一',R.ask[it1.term+':'+q1.id]==='B'&&!Object.keys(R.grades).length&&R.attend.civ_general===1,JSON.stringify({ask:R.ask,grades:R.grades,att:R.attend}));
  G.day=it2.day; G.hour=it2.t0+0.1; const GM2=mkGM(G); await CLS.attend(GM2,it2,{inScene:true});
  check('3. 同一學期第二次提問：有題目、沒有「期末考，會考這樣的題目。」',GM2.log.includes(q2.q)&&!GM2.log.some(t=>/期末考，會考這樣的題目/.test(t)),JSON.stringify(GM2.log.slice(-4)));
  // 沒有 ask 的週
  let noAsk=0, it3=null; for(const w of SYLLABUS.courses.civ_general){ if(w.ask||w.w<2||w.w>15) continue; it3=itemFor('civ_general',w.w); if(it3){ noAsk=w.w; break; } }
  const G3=mkG(it3.day,it3.t0+0.1), GM3=mkGM(G3); await CLS.attend(GM3,it3,{inScene:true});
  check('3. 沒有 ask 的週（第 '+noAsk+' 週）不問',!GM3.log.some(t=>/黑板角落/.test(t)));
  // 舊存檔（沒有 ask 欄位）
  const G4=mkG(it1.day,it1.t0+0.1); G4.courses={idv:3,done:{},attend:{}}; check('3. 舊存檔：CLS.rec 補上空的 ask',typeof CLS.rec(G4).ask==='object');
  // 討論課的題目（BB-B 64406c8）：syllabus 的 obs.disc 指到 EXAM_BANK 的 CLASS_DISC 題，討論收尾之後問
  const discs=[]; for(const cid in SYLLABUS.courses) for(const w of SYLLABUS.courses[cid]) if(w.obs&&w.obs.disc) discs.push([cid,w.w,w.obs.disc.qid,CLS.sylReviewed({id:cid},w.w)]);
  check('5. 討論課題目：syllabus 有 obs.disc 的週 10 個，每一題都在 EXAM_BANK（source CLASS_DISC、USER_CONFIRMED）',discs.length===10&&discs.every(d=>{ const q=Q[d[2]]; return q&&q.source==='CLASS_DISC'&&q.status==='USER_CONFIRMED'&&q.course===d[0]; }),JSON.stringify(discs));
  const dsc=discs.find(d=>d[0]==='crim_gen1'); const itD=dsc&&itemFor(dsc[0],dsc[1]);
  if(itD&&dsc[3]){ const GD=mkG(itD.day,itD.t0+0.1); const GMD=mkGM(GD); await CLS.attend(GMD,itD,{inScene:true}); const qd=Q[dsc[2]];
    check('5. 刑總（一）第 '+dsc[1]+' 週：討論之後問 '+dsc[2]+'（題幹原文）、答案＋考點',GMD.log.includes(qd.q)&&GMD.log.some(t=>t.startsWith('答案是（'+qd.answer+'）。')),JSON.stringify(GMD.log.slice(-6))); }
  else check('5. 刑總（一）討論課那一週（審查過、排得到）',false,JSON.stringify(dsc));
  // 讀書主題照科目（AA_134 第 1 節）
  { const G=mkG(6,20); const c=CLS.byId('const_1'); const had=new Set(); const t1=CLS.studyTopic(G,c,id=>had.has(id));
    check('6. 9/22（第 4 週）讀憲法（上）：主題是憲法自己的課表（const_1_w…，第 4 週以前），不是民法',!!t1&&/^const_1_w[1-4]$/.test(t1.id)&&!/民法|強行規定/.test(t1.title+t1.body),JSON.stringify(t1));
    let n=0, last=null; while(true){ const t=CLS.studyTopic(G,c,id=>had.has(id)); if(!t) break; had.add(t.id); last=t; if(++n>20) break; }
    check('6. 讀完第 4 週以前的每一週以後＝沒有了（「這週的進度都讀完了。」）',n>0&&n<=4&&!CLS.studyTopic(G,c,id=>had.has(id)),n+' 週，最後 '+(last&&last.id)); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.log('FAIL 例外 '+e.stack); process.exit(1); });
