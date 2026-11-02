// AA_590 學姊改稿第三批（企劃線 68ceea665；使用者 2026-11-02 18:2x 選擇題 11 題確認，第 10 節）的稿——給舊測試的「每一句都在稿裡」檢查用：
//   被 AA_590 改過的句子不在原來的源稿裡（AA 沒有回頭改源稿），改成「在原稿裡，或在 AA_590 表的『改成』欄」。
//   has(t)：t 一字不差是 AA_590 某一列「改成」欄的整格（或那一格以「／」分開的一段），或是第 10 節使用者原話裡用「」引的整句。
const cp=require('child_process'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SHA='68ceea665', P='docs/story_planning/AA_590_學姊改稿_第三批_大一大二事件.md';
let DOC=''; try{ DOC=cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+P],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ DOC=''; }
const NEW=new Set();
for(const line of DOC.split('\n')){
  const m=line.match(/^\|\s*([0-9]+|保[0-9]+)\s*\|(.*)$/); if(!m) continue;
  const c=m[2].split('|').map(s=>s.trim()); if(c.length<4) continue;
  const v=c[3].replace(/^`|`$/g,''); if(!v||v.startsWith('（刪')) continue;
  NEW.add(v); for(const p of v.split('／')) NEW.add(p.trim());
}
const sec10=DOC.slice(DOC.indexOf('## 10.'));
for(const q of sec10.match(/「[^」]+」/g)||[]) NEW.add(q.slice(1,-1));
module.exports={SHA,P,DOC,NEW,has:t=>NEW.has(t)};
