// AA_599（使用者：開車從宿舍出發，不寫取車過程）的 BAD 字串清單：玩家看得到的字裡不能再有「回家把車開出來」「回家開車」「去玄關拿車鑰匙」「把車開回家，再搭捷運」。
// 2026-11-03 BB 找到兩句漏網（group_events.js:26、r2y4b3d.js:153），AA 定字：①「（後座擠了三個人。）」②刪掉。修改前 FAIL（2 處）；修改後 ALL PASS。
// 用法：node tests/aa599_nocar_fetch_unit.js
'use strict';
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
const BAD=[/回家把車開出來/,/回家開車/,/去玄關拿車鑰匙/,/把車開回家，再搭捷運/];
const files=[]; (function walk(d){ for(const f of fs.readdirSync(d)){ const p=path.join(d,f); if(fs.statSync(p).isDirectory()) walk(p); else if(/\.js$/.test(f)&&!/chars3d\.js$/.test(f)) files.push(p); } })(path.join(ROOT,'src'));
let fails=0; const hits=[];
for(const f of files){ fs.readFileSync(f,'utf8').split('\n').forEach((ln,i)=>{ const code=ln.replace(/\/\*[\s\S]*?\*\//g,'').replace(/\/\/.*$/,''); const strs=code.match(/'[^'\n]*'|"[^"\n]*"|`[^`\n]*`/g)||[]; for(const s of strs) for(const b of BAD) if(b.test(s)) hits.push(path.relative(ROOT,f)+':'+(i+1)+' '+s.slice(0,40)); }); }
const ok=hits.length===0; console.log((ok?'PASS':'FAIL')+' 1. src 的字串裡沒有取車過程（AA_599 BAD 清單）'+(ok?'':'　'+hits.join(' ／ '))); if(!ok) fails++;
console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
