// v0 P1「初等會計：借方、貸方、和第一個朋友」（BB_105 P1、2-3；AA_154 第 95 行）——不需要瀏覽器。
//   1. 第 1 週（9/5 週四 13:20）會計：先選坐哪裡（Y0_P1_SEAT）→ 老師的第一題 → 阿勳、韋綸、品妤、遠處的可昕 → 被點到三個回答；
//   2. 上過以後第 2 週照第 2 週；3. 第 1 週沒去：之後第一次出席上第 1 週那一堂；4. 遲到超過 15 分鐘＝略過（一句旁白、不記座位）。
// 修改前：CLS.p1Due 不存在（第 0 項失敗）。用法：node tests/v0_p1_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const mkG=(day,hour)=>({day,hour,stage:'econ',flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'campus'});
function mkGM(G,pick){ const log=[]; return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},choose:async o=>{ log.push('choose:'+o.map(q=>q.t).join(' / ')); return pick||0; },fade:async()=>{},advance(){},energy(){},sleep:async()=>{},caption(){},autosave(){},setGoal(){},sayLine:async()=>{} }; }
function itemFor(week){ const CID='acct_y0'; for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==week) continue; const it=CLS.dayItems(mkG(d,8),d).find(x=>x.c.id===CID&&!x.exam); if(it) return it; } return null; }
(async()=>{
  check('0. CLS.p1Due 存在',typeof CLS.p1Due==='function');
  if(typeof CLS.p1Due!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const w1=itemFor(1), w2=itemFor(2), w3=itemFor(3); const d1=w1&&CALENDAR.dateOf(w1.day);
  check('0. 找到會計第 1、2、3 週；第 1 週是 9/5（四）13:20',!!w1&&!!w2&&!!w3&&d1.m===9&&d1.d===5&&Math.abs(w1.t0-(13+20/60))<0.01,JSON.stringify([d1,w1&&w1.t0]));
  const W1=SYLLABUS.courses.acct_y0.find(q=>q.w===1), W2=SYLLABUS.courses.acct_y0.find(q=>q.w===2);
  const seats='choose:（坐在阿勳旁邊） / （坐前排） / （坐靠窗）'   /* 按鈕字照 AA_154 A51 */, opts='choose:'+W1.call.options.map(o=>'「'+o+'」').join(' / ');
  const P1=['要看租約吧。'];   /* BB_179 段A #25 #26：韋綸、品妤兩句刪 */
  // 1. 第 1 週準時
  { const G=mkG(w1.day,w1.t0-0.05), GM=mkGM(G,1); GM.choose=async o=>{ GM.log.push('choose:'+o.map(q=>q.t).join(' / ')); return 2; }; await CLS.attend(GM,w1,{inScene:true}); const L=GM.log;
    const iS=L.indexOf(seats), iT=L.findIndex(t=>t.endsWith(W1.line)), iC=L.indexOf(opts);
    check('1. 先選坐哪裡（阿勳旁邊／前排／靠窗）→ 老師「今天第一題。你的宿舍，是資產還是負債？」',iS>=0&&iT>iS,JSON.stringify(L.slice(0,4)));
    check('1. 阿勳一句＋遠處的可昕（BB_179 段A：韋綸、品妤兩句刪）',P1.every((t,k)=>L[iT+1+k]&&L[iT+1+k].endsWith('「'+t+'」'))&&L[iT+2]==='（遠處，可昕舉手：「住得很開心的話，算資產嗎？」有幾個人笑了。）'&&!L.some(t=>t.includes('我室友打呼')||t.includes('你的室友是費用')),JSON.stringify(L.slice(iT,iT+4)));
    check('1. 被點到：三個回答＋共用收尾',iC>iT+2&&W1.call.follow.every(f=>L.some(t=>t.endsWith(f))));
    check('1. Y0_P1_SEAT＝window（選第三個）、Y0_P1_DONE',G.flags.Y0_P1_SEAT==='window'&&G.flags.Y0_P1_DONE===true,JSON.stringify(G.flags));
    G.day=w2.day; G.hour=w2.t0-0.05; const GM2=mkGM(G,0); await CLS.attend(GM2,w2,{inScene:true});
    check('2. 上過以後：第 2 週照第 2 週（會計恆等式），沒有選座位、沒有那兩句',GM2.log.some(t=>t.endsWith(W2.line))&&!GM2.log.includes(seats)&&!GM2.log.some(t=>t.includes('要看租約吧')),JSON.stringify(GM2.log.slice(0,4)));
    check('2. 座位不會被改掉',G.flags.Y0_P1_SEAT==='window'); }
  // 3. 第 1 週沒去，第 3 週第一次出席
  { const G=mkG(w3.day,w3.t0-0.05), GM=mkGM(G,0); check('3. 第 1 週沒去：第 3 週 p1Due',CLS.p1Due(G,w3)===true); await CLS.attend(GM,w3,{inScene:true});
    check('3. 第 3 週第一次出席：上的是第 1 週那一堂（選座位、宿舍那一題、阿勳和可昕）',GM.log.includes(seats)&&GM.log.some(t=>t.endsWith(W1.line))&&GM.log.some(t=>t.includes('要看租約吧')),JSON.stringify(GM.log.slice(0,4)));
    check('3. Y0_P1_SEAT＝xun（選第一個）',G.flags.Y0_P1_SEAT==='xun'); }
  // 4. 遲到超過 15 分鐘＝略過
  { const G=mkG(w1.day,w1.t0+0.4), GM=mkGM(G,0); await CLS.attend(GM,w1,{inScene:true,late:true}); const L=GM.log;
    const skip=L.includes('黑板已經寫滿了。你只來得及抄最後兩行。');   /* AA_200 7-2 */
    if(skip){ check('4. 遲到超過 15 分鐘才進去：一句旁白「黑板已經寫滿了。你只來得及抄最後兩行。」、沒有選座位和那兩句',!L.includes(seats)&&!L.some(t=>t.includes('要看租約吧')),JSON.stringify(L));
      check('4. 略過：Y0_P1_SEAT 不記、P1 記成做過（一次）',G.flags.Y0_P1_SEAT==null&&G.flags.Y0_P1_DONE==='skip'); }
    else console.log('SKIP 4. 這個測試環境進不了「遲到超過 15 分鐘」那一條（S.attend 的 lateAbs 要玩家在選單選）：'+JSON.stringify(L.slice(0,3))); }
  // 5. 其他課不受影響
  { const G={day:20,hour:8,stage:'law',flags:{},weekday:1}; const it=CLS.dayItems(G,20).find(x=>!x.exam); check('5. 法律系的課 p1Due 一律 false',!it||CLS.p1Due(G,it)===false); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
