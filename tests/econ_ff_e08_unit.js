// 經濟系事件接事件 9/21 中秋系烤：短版也要能「不去」（AA-B 11-09 17:21「留」；BUG-Y0-E08-MISSED-AFTER-GOING-1109 的另一半）——不需要瀏覽器。
// 原本 src/econff3d.js 第 12 步固定 17:00 直接演 ev_y0_e08，跳過 16:00 韋綸那則私訊（story3d.js 手機規則只在 16:00～17:00 送），玩家沒機會回「今天不行」，AA_358 2-3「沒去系烤」走不到。
// 檢查：1 第 12 步是 dyn e08；還沒送私訊＝停在 16:00 ／ 2 送了沒回：17:00 以前等到 17:00，到了 17:00 還沒回＝做完（沒去）
//      3 回「好」＝17:00 演；演過＝做完 ／ 4「今天不行」＝做完 ／ 5 ECONFF.next：9/21 早上下一步是系烤、時間 16:00
//      3b 回「好」但出遊 missed＝做完、不補演（BB-B 11-09 19:43）
//      2b 私訊沒送就已經過 17:00（等到晚上一次跳過去）＝做完、不補演（BB-B 11-09 18:14 (b)）
//      6 advance：跳到 17:00 才發現沒回、今天不行＝不演 ev_y0_e08（原始碼）
// 修改前（沒有 dyn）：1、2、4、5、6 FAIL。用法：node tests/econ_ff_e08_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/econff3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i!=null?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
global.STORY={dayOfKey:dayOf}; global.STORY_EVENTS=[]; global.EVENTS={running:null};
const SENT=new Set(); global.PHONE={pending:()=>[],tick(){},at:()=>true,sent:(G,tag)=>SENT.has(tag)};
global.OUT={get:(G,id)=>(G._out||{})[id]||null};
const mkG=(k,h,f)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:Object.assign({E01_MORNING:true},f||{}),events:{done:{}}});
const D=dayOf('2024-09-21'), s12=ECONFF.STEPS.find(s=>s.n===12), dyn=G=>ECONFF.dynOf?ECONFF.dynOf(G,s12):null;
check('1. 第 12 步（9/21 系烤）是 dyn e08',!!s12&&s12.dyn==='e08'&&s12.ev==='ev_y0_e08',s12&&JSON.stringify(s12));
{ SENT.clear(); const G=mkG('2024-09-21',10); const x=dyn(G); check('1. 還沒送韋綸的私訊：停在 16:00',!!x&&x.t===D*24+16,JSON.stringify(x)); }
{ SENT.clear(); SENT.add('y0_e08_dm'); const G=mkG('2024-09-21',16.2); const x=dyn(G); check('2. 送了、還沒回、16:12：等到 17:00',!!x&&x.t===D*24+17&&!x.done,JSON.stringify(x));
  G.hour=17; const y=dyn(G); check('2. 17:00 還沒回＝做完（沒去）',!!y&&y.done===true,JSON.stringify(y)); check('2. stepDone 也是做完',ECONFF.stepDone(G,s12)); }
{ SENT.clear(); const G=mkG('2024-09-21',20); const x=dyn(G); check('2b. 私訊沒送就已經 20:00（13:00 按「等到晚上」一次跳過去）＝做完（沒去）、不補演',!!x&&x.done===true&&ECONFF.stepDone(G,s12),JSON.stringify(x));
  G.hour=17; check('2b. 私訊沒送、17:00 整＝做完',(dyn(G)||{}).done===true); G.hour=16.5; const y=dyn(G); check('2b. 私訊沒送、16:30＝還停在 16:00 那一步（時間已過＝下一次馬上處理）',!!y&&y.t===D*24+16,JSON.stringify(y)); }
{ SENT.clear(); SENT.add('y0_e08_dm'); const G=mkG('2024-09-21',16.3,{E08_GO:'yes'}); const x=dyn(G); check('3. 回「好」：17:00 演（還沒做完）',!!x&&x.t===D*24+17&&!x.done&&!ECONFF.stepDone(G,s12),JSON.stringify(x));
  G.events.done.ev_y0_e08=D; check('3. 演過＝做完',ECONFF.stepDone(G,s12)); }
{ SENT.clear(); SENT.add('y0_e08_dm'); const G=mkG('2024-09-21',20,{E08_GO:'yes'}); G._out={y0_e08:{state:'missed'}}; check('3b. 回「好」但出遊錯過（missed）＝做完、不補演（BB-B 11-09 19:43 (b)）',(dyn(G)||{}).done===true&&ECONFF.stepDone(G,s12));
  G._out={y0_e08:{state:'planned'}}; G.hour=16.5; check('3b. 回「好」、出遊還在排（planned）＝照舊 17:00 演',(dyn(G)||{}).t===D*24+17); }
{ SENT.clear(); SENT.add('y0_e08_dm'); const G=mkG('2024-09-21',16.3,{E08_GO:'no'}); check('4. 回「今天不行」＝做完（沒去）',ECONFF.stepDone(G,s12)&&(dyn(G)||{}).done===true); }
{ SENT.clear(); const G=mkG('2024-09-21',9); for(const s of ECONFF.STEPS) if(s.n!==12&&ECONFF.tOf(G,s)!=null&&ECONFF.tOf(G,s)<D*24+16) ECONFF.rec(G).done[s.n]=1;
  const s=ECONFF.next(G); check('5. 9/21 09:00 的下一步是系烤、時間 16:00（短版也會停在韋綸的私訊）',!!s&&s.n===12&&ECONFF.tOf(G,s)===D*24+16,s&&(s.n+' '+ECONFF.tOf(G,s))); }
{ const src=fs.readFileSync(path.join(ROOT,'src/econff3d.js'),'utf8');
  check('6. advance：E08 跳到才發現做完（沒回／今天不行）＝不跑 runEv',/else if\(!\(s\.dyn==='e08'&&\(S\.dynOf\(G,s\)\|\|\{\}\)\.done\)\)\{ await runEv\(GM,s\.ev\)/.test(src)); }
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
