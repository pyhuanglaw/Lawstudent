// AA_591 學姊改稿第四批（企劃線 6b35748c7；使用者 2026-11-02 18:5x 起選擇題 14 題確認，第 11 節）的稿——給舊測試的「每一句都在稿裡」檢查用（同 tests/aa590_doc.js）：
//   被 AA_591 改過的句子不在原來的源稿裡（AA 沒有回頭改源稿），改成「在原稿裡，或在 AA_591 表的『改成』欄」。
//   has(t)：t 一字不差是 AA_591 某一列「改成」欄的整格（或那一格以「／」分開的一段），或是第 11 節使用者原話裡用「」引的整句。
const cp=require('child_process'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SHA='6b35748c7', P='docs/story_planning/AA_591_學姊改稿_第四批_大三大四畢業後.md';
let DOC=''; try{ DOC=cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+P],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ DOC=''; }
/* 原句是到處都有的短句（別人也說、同一個人別的場也說）的列不放進 MAP：只換表上那一處，舊測試逐一改（第 9、17、22、57、75、78、85、86、95、103、126、172、175、205、218 列）*/
const AMBIG=new Set(['9','17','22','57','75','78','85','86','95','103','126','172','175','205','218']);
const NEW=new Set(), MAP={};   /* MAP：數字列 原句 → 改成（舊測試從原稿抄的句子換成 AA_591 的；刪句不在裡面）*/
for(const line of DOC.split('\n')){
  const m=line.match(/^\|\s*([0-9]+|保[0-9]+|新[0-9]+)\s*\|(.*)$/); if(!m) continue;
  const c=m[2].split('|').map(s=>s.trim()); if(c.length<4) continue;
  const v=c[3].replace(/^`|`$/g,''); if(!v||v.startsWith('（刪')) continue;
  NEW.add(v); for(const p of v.split('／')) NEW.add(p.trim());
  if(/^(保)?[0-9]+$/.test(m[1])&&!AMBIG.has(m[1])){ const o=c[2].replace(/^`|`$/g,''); if(o&&o!=='—'&&o!==v&&!(o in MAP)) MAP[o]=v; }
}
const sec11=DOC.slice(DOC.indexOf('## 11.'));
for(const q of sec11.match(/「[^」]+」/g)||[]) NEW.add(q.slice(1,-1));
module.exports={SHA,P,DOC,NEW,MAP,has:t=>NEW.has(t)};
