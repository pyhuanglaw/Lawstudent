/* CANON-NO-ECON-1112 第五批：匯入工具寫檔前照整句換的那幾句（tools/story/canon_b5_rows.py 的 ROWS，AA_920／AA_921 第 3 節／AA_923 第 4 節）。
   拿「稿」逐字比遊戲資料的測試用：fwd(稿的物件, 檔名) 把稿裡剛好是舊字的字串換成新字再比（稿是舊版、遊戲照 AA 的對照表換過）。
   表從 canon_b5_rows.py 讀（同一份，不另外抄）。 */
'use strict';
const fs=require('fs'), path=require('path');
let ROWS=null;
const load=()=>{ if(ROWS) return ROWS; ROWS={}; const t=fs.readFileSync(path.join(__dirname,'..','tools','story','canon_b5_rows.py'),'utf8');
  let cur=null; for(const l of t.split('\n')){ const m=/^\s*'(src\/data\/[\w.]+)': \[/.exec(l); if(m){ cur=ROWS[m[1]]=[]; continue; } const r=/^\s*\('([^']*)', '([^']*)'\),/.exec(l); if(cur&&r) cur.push([r[1],r[2]]); if(/^\s*\],/.test(l)) cur=null; }
  return ROWS; };
const fwd=(o,file)=>{ const R=load()['src/data/'+String(file).split('/').pop()]||[]; const f=x=>{ if(typeof x==='string'){ const r=R.find(([a])=>a===x); return r?r[1]:x; } if(Array.isArray(x)) return x.map(f); if(x&&typeof x==='object'){ const y={}; for(const k of Object.keys(x)) y[k]=f(x[k]); return y; } return x; }; return f(o); };
module.exports={ rows:f=>load()['src/data/'+String(f).split('/').pop()]||[], fwd };
