// v0 E03＝BB_105 B1「第一次經濟學原理：機會成本」（AA_154 第 97 行；BB_104 E03）——不需要瀏覽器。
//   1. 第 2 週週一（9/9）上經原：第 2 週那一堂（C 類、被點到的三個選項），選的回答記成 Y0_B1_ANSWER（選項原文，法律系 P4 讀它）；
//   2. 第 2 週沒去：之後第一次出席（例：第 3 週）上的是第 2 週那一堂，記下回答；
//   3. 上過以後：第 3 週照第 3 週的內容，回答不會被改掉；
//   4. 第 1 週不算（稀少性，沒有點名、不記）。
// 修改前：CLS.e03Due 不存在、Y0_B1_ANSWER 沒有記（第 1、2 項失敗）。用法：node tests/v0_e03_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
global.window=global;
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CHARACTERS|UNFAMILIAR_POOL|SOCIAL_GRAPH|PORTRAITS|CALENDAR|PLACES|COURSES|CLS|SYLLABUS|QBANK|QBANK_INCOMPLETE|EXAM_BANK)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/characters.js','src/data/calendar.js','src/data/places.js','src/data/courses.js','src/data/syllabus.js','src/data/legal_qbank.js','src/data/exam_bank.js','src/classes3d.js']) load(f);
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'　'+info:'')); if(!ok) fails++; };
const mkG=(day,hour)=>({day,hour,stage:'econ',flags:{},weekday:CALENDAR.dateOf(day).wd%7,zone:'campus'});
function mkGM(G,pick){ const log=[]; return {G,log,D:{active:false},E:{player:{busy:false}},sceneBegin(){},sceneEnd(){},say:async(n,t)=>{ log.push(t); },toast(){},choose:async o=>{ log.push('choose:'+o.map(q=>q.t).join(' / ')); return pick||0; },fade:async()=>{},advance(){},energy(){},sleep:async()=>{},caption(){},autosave(){},setGoal(){},sayLine:async()=>{} }; }
function itemFor(week){ for(let d=-400;d<0;d++){ const t=CALENDAR.termOf(d); if(!t||t.id!=='Y0S1'||t.week!==week) continue; const it=CLS.dayItems(mkG(d,8),d).find(x=>x.c.id==='econ_principles_y0'&&!x.exam); if(it) return it; } return null; }
(async()=>{
  check('0. CLS.e03Due 存在',typeof CLS.e03Due==='function');
  if(typeof CLS.e03Due!=='function'){ console.log('FAILED '+fails); process.exit(1); }
  const w1=itemFor(1), w2=itemFor(2), w3=itemFor(3);
  const d2=w2&&CALENDAR.dateOf(w2.day); check('0. 找到經原第 1、2、3 週；第 2 週是 9/9（一）',!!w1&&!!w2&&!!w3&&d2.m===9&&d2.d===9,JSON.stringify(d2));
  const W2=SYLLABUS.courses.econ_principles_y0.find(q=>q.w===2), W3=SYLLABUS.courses.econ_principles_y0.find(q=>q.w===3);
  const opts='choose:'+W2.call.options.map(o=>'「'+o+'」').join(' / ');
  // 1. 第 2 週照常去
  { const G=mkG(w2.day,w2.t0+0.05), GM=mkGM(G,2); await CLS.attend(GM,w2,{inScene:true});
    check('1. 第 2 週：教授問「你今天來上這堂課，放棄了什麼？」、被點到、三個選項',GM.log.some(t=>t.endsWith(W2.line))&&GM.log.includes(opts),JSON.stringify(GM.log.slice(0,8)));
    check('1. 記 Y0_B1_ANSWER＝選的那一個（第三個「好像沒放棄什麼。」）',G.flags.Y0_B1_ANSWER==='好像沒放棄什麼。',G.flags.Y0_B1_ANSWER);
    check('1. 共用收尾兩句',W2.call.follow.every(f=>GM.log.some(t=>t.endsWith(f))));
    // 3. 上過以後第 3 週照第 3 週
    G.day=w3.day; G.hour=w3.t0+0.05; const GM3=mkGM(G,0); await CLS.attend(GM3,w3,{inScene:true});
    check('3. 上過以後：第 3 週是第 3 週的內容（生產可能線），沒有再點名',GM3.log.some(t=>t.endsWith(W3.line))&&!GM3.log.includes(opts),JSON.stringify(GM3.log.slice(0,6)));
    check('3. 回答沒有被改掉',G.flags.Y0_B1_ANSWER==='好像沒放棄什麼。'); }
  // 2. 第 2 週沒去，第 3 週第一次出席
  { const G=mkG(w3.day,w3.t0+0.05), GM=mkGM(G,0); check('2. 第 2 週沒去：第 3 週 e03Due',CLS.e03Due(G,w3)===true);
    await CLS.attend(GM,w3,{inScene:true});
    check('2. 第 3 週第一次出席：上的是第 2 週那一堂（機會成本）',GM.log.some(t=>t.endsWith(W2.line))&&GM.log.includes(opts)&&!GM.log.some(t=>t.endsWith(W3.line)),JSON.stringify(GM.log.slice(0,8)));
    check('2. 記 Y0_B1_ANSWER＝「睡覺。」',G.flags.Y0_B1_ANSWER==='睡覺。',G.flags.Y0_B1_ANSWER);
    check('2. 之後 e03Due 是 false',CLS.e03Due(G,w3)===false); }
  // 4. 第 1 週不算
  { const G=mkG(w1.day,w1.t0+0.05), GM=mkGM(G,0); check('4. 第 1 週不是 E03',CLS.e03Due(G,w1)===false); await CLS.attend(GM,w1,{inScene:true});
    check('4. 第 1 週上完沒有記回答',!G.flags.Y0_B1_ANSWER);
    check('4. 第 1 週：魏老師順口講「第一口珍奶……這叫邊際效用遞減。期中會考。」一次（AA_200 7-2，可昕下午迎新用）',GM.log.filter(t=>t.endsWith('第一口珍奶最好喝，第五口就普通了。這叫邊際效用遞減。期中會考。')).length===1,JSON.stringify(GM.log.slice(0,4))); }
  { const G=mkG(w3.day,w3.t0+0.05), GM=mkGM(G,0); await CLS.attend(GM,w3,{inScene:true}); check('4. 其他週（第 2 週沒去、第 3 週補上的機會成本那堂）沒有珍奶那句',!GM.log.some(t=>t.includes('第一口珍奶'))); }
  // 法律系那幾年的課不受影響
  { const G={day:20,hour:8,stage:'law',flags:{},weekday:1}; const it=CLS.dayItems(G,20).find(x=>!x.exam); check('5. 法律系的課 e03Due 一律 false',!it||CLS.e03Due(G,it)===false); }
  console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
})().catch(e=>{ console.error(e); process.exit(1); });
