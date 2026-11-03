// AA_600 分手後不主動聯絡（企劃線 031414cad；使用者 2026-11-02、AA 定稿）的稿——給舊測試的「每一句都在稿裡」檢查用（同 tests/aa591_doc.js）：
//   AA_600 新寫的旁白、改寫的挽回台詞不在原來的源稿裡（AA 沒有回頭改源稿），改成「在原稿裡，或在 AA_600 的稿裡」。
//   has(t)：t 一字不差出現在 AA_600 本文（附錄是舊句的清查表，不算；「刪：」開頭的那幾行也不算）。
const cp=require('child_process'), path=require('path');
const ROOT=path.resolve(__dirname,'..');
const SHA='031414cad', P='docs/story_planning/AA_600_分手後不主動聯絡_全遊戲修正.md';
let DOC=''; try{ DOC=(cp.__worldEf||cp.execFileSync).call(cp,'git',['-C',ROOT,'show',SHA+':'+P],{encoding:'utf8',maxBuffer:64*1024*1024}); }catch(e){ DOC=''; }
const BODY=DOC.split('\n').filter(l=>!/^刪：/.test(l.trim())).join('\n');
module.exports={SHA,P,DOC,has:t=>!!t&&BODY.includes(t)};
