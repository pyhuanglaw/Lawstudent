// AA_657 補二（企劃線 65a1b2fe9，AA 2026-11-04 07:11 定稿，D109）：一盞沒有桌號，和一盞有關的「三號桌」八句改「常來的阿伯」。
// 對稿的測試讀舊稿（AA_506／AA_507／AA_503 那幾版）以後，用這張表把原句換成定稿再比；表從 AA_657 那一版讀，原句、定稿都要在表上找得到（找不到＝rows 是空的，呼叫的測試 FAIL）。
'use strict';
const cp=require('child_process'), path=require('path');
const ROOT=path.join(__dirname,'..'), SHA='65a1b2fe9', SPEC='docs/story_planning/AA_657_一盞茶屋_劇情對位置的決定.md';
let doc=''; try{ doc=cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:process.env.PRIV_GIT_DIR||ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){}
const rows=[]; { let on=false; for(const l of doc.split('\n')){ if(/^## 補二/.test(l)){ on=true; continue; } if(on&&/^## /.test(l)) break; if(!on) continue;
  const m=/^\| (\d+) \| (.+?) \| (.+?) \| (.+?) \|$/.exec(l); if(m) rows.push({n:+m[1],where:m[2],from:m[3],to:m[4]}); } }
/* 稿上的寫法可能只有「說話人：句子」的一段，所以也收「／」前後拆開的每一段 */
const pairs=[]; for(const r of rows){ pairs.push([r.from,r.to]); const a=r.from.split('／'), b=r.to.split('／'); if(a.length===b.length&&a.length>1) a.forEach((x,i)=>{ if(x!==b[i]) pairs.push([x,b[i]]); }); }
const fix=s=>{ let t=String(s||''); for(const [a,b] of pairs) t=t.split(a).join(b); return t; };
module.exports={SHA,SPEC,rows,pairs,fix};
