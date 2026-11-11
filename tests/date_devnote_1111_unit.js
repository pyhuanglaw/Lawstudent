// 約會台詞裡寫成旁白／寫在選項後面的開發註記不演（AA 2026-11-11 企劃線 82dc74ca7：子晴 D13「爸爸的事只說到這裡，留給 Q12」會顯示成括號旁白）。不需要瀏覽器。
//  1 date_lines.js 裡 who 是 narr、或選項的字裡，長得像開發註記的（留給 Q12、第 N 階以上、AA_／BB_ 代號、事件 N、C2、TASTE、你說了）——每一個都要被 DATE.DEV_NOTE／DEV_STRIP／optText 處理到
//  2 DATE.DEV_NOTE 的每一句、DEV_STRIP 的每一句都還在資料裡（稿改掉了就從表上拿掉）
//  3 optText：只拿掉最後面的「（第 N 階以上…）」，其他選項的字不動
// 修改前（開發分支 bc407bfc5）：沒有 DATE.DEV_NOTE → 全部 FAIL；遊戲裡這四處會演出來。
// 用法：node tests/date_devnote_1111_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const D=(new Function(fs.readFileSync(path.join(ROOT,'src/data/date_lines.js'),'utf8').replace(/^const DATE_LINES\s*=/m,'return ')))();
const SRC=fs.readFileSync(path.join(ROOT,'src/date3d.js'),'utf8');
const m=/  S\.DEV_NOTE=new Set\([^\n]*\n  S\.DEV_STRIP=[^\n]*\n(?:  \/\*[^\n]*\n)?  S\.optNeed=[^\n]*\n  S\.optOk=[^\n]*\n  S\.optText=[^\n]*\n/.exec(SRC); check('0. date3d.js 有 S.DEV_NOTE／S.DEV_STRIP／S.optText，run() 和選項都接了',!!m&&/if\(ln&&S\.DEV_NOTE\.has\(ln\.text\)\) continue;/.test(SRC)&&/fill\(S\.DEV_STRIP\[ln\.text\]\|\|ln\.text\)/.test(SRC)&&/S\.xiuqin\(G,id,S\.optText\(c\.t\)\)/.test(SRC));
if(!m){ console.log('FAILED'); process.exit(1); }
const S={}; vm.runInNewContext(m[0],{S,Set,String}); let STAGE=0; S.stageNum=()=>STAGE;
const RE=/留給 ?Q\d|第 ?\d+ ?階|AA_\d+|BB_\d+|事件 ?\d+|TASTE|^你說了$|(^|，)C\d$|才第一次說|伏筆/;
const narr=[], opts=[]; const walk=(x,p)=>{ if(x&&typeof x==='object'){ if(typeof x.text==='string'&&x.who==='narr'&&RE.test(x.text)) narr.push([p,x.text]); if(typeof x.t==='string'&&/第 ?\d+ ?階|AA_\d|BB_\d|\bC\d\b/.test(x.t)) opts.push([p,x.t]); for(const k in x) walk(x[k],p+'/'+k); } }; walk(D.loc,'loc');
const leftN=narr.filter(([p,t])=>!S.DEV_NOTE.has(t)&&!(S.DEV_STRIP[t]&&!RE.test(S.DEV_STRIP[t]))), leftO=opts.filter(([p,t])=>/第 ?\d+ ?階|AA_\d|BB_\d|\bC\d\b/.test(S.optText(t)));
check('1. 會演出來的旁白裡長得像開發註記的 '+narr.length+' 句都擋掉或拿掉代號了',narr.length>=3&&!leftN.length,JSON.stringify(leftN));
check('1. 選項的字裡的條件說明 '+opts.length+' 個都拿掉了',opts.length>=1&&!leftO.length,JSON.stringify(leftO));
const all=new Set(); const w2=x=>{ if(x&&typeof x==='object'){ if(typeof x.text==='string') all.add(x.text); for(const k in x) w2(x[k]); } }; w2(D.loc);
check('2. DEV_NOTE、DEV_STRIP 的每一句都還在資料裡（稿改掉了就從表上拿掉）',[...S.DEV_NOTE].every(t=>all.has(t))&&Object.keys(S.DEV_STRIP).every(t=>all.has(t)),JSON.stringify([...S.DEV_NOTE].concat(Object.keys(S.DEV_STRIP)).filter(t=>!all.has(t))));
check('3. optText 只拿掉最後面的「（第 N 階以上…）」',S.optText('「一起拍？」（第 6 階以上）')==='「一起拍？」'&&S.optText('「我請妳。」')==='「我請妳。」'&&S.optText('（不說話）')==='（不說話）'&&S.optText('去第 6 階以上的地方')==='去第 6 階以上的地方');
// 4（2026-11-11 AA 企劃線 d501078a3：「一起拍？」接成第 6 階以上才出現，和合照那一組同一個條件＝第 6 階或交往中）
{ const T='「一起拍？」（第 6 階以上）', G0={flags:{}}, GD={flags:{dating_heroine_04:1}};
  STAGE=5; const a=S.optOk(G0,'heroine_04',T), b=S.optOk(GD,'heroine_04',T), c=S.optOk(G0,'heroine_04','「我請妳。」'); STAGE=6; const d=S.optOk(G0,'heroine_04',T);
  check('4. 「（第 6 階以上）」的選項：第 5 階不出現、第 6 階出現、交往中出現；沒寫條件的選項照常',a===false&&b===true&&c===true&&d===true&&S.optNeed(T)===6&&S.optNeed('好')===0,JSON.stringify([a,b,c,d]));
  check('4. playSet 的選項先過 S.optOk 再顯示',/c\.t\.trim\(\)&&S\.optOk\(G,id,c\.t\)/.test(SRC));
  const lone=[]; const w=(x,p)=>{ if(x&&typeof x==='object'){ if(Array.isArray(x.choice)&&x.choice.length&&x.choice.every(c=>c&&S.optNeed(c.t))) lone.push(p); for(const k in x) w(x[k],p+'/'+k); } }; w(D.loc,'loc');
  check('4. 沒有哪一套的選項全部都有階段條件（不然沒到的人整組選項不見）',!lone.length,JSON.stringify(lone)); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
