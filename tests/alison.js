// AA_380（企劃線 eb0ccfec；使用者 2026-10-21 23:2x「改成Alison」）：遊戲裡「小語」改名 Alison，企劃線的舊稿還寫「小語」。
// 讀稿對字的測試第一行先 require('./alison.js')：之後 child_process 讀 docs/story_planning/ 的 git show，文字照匯入工具同一套規則換
// （tools/story/import_guard.py 的 alison：Alison 和中文字之間空一個半形空格；挨著標點、行頭行尾、已經有空格的不空）。
'use strict';
const cp=require('child_process');
const CJK=/[㐀-䶿一-鿿぀-ヿ豈-﫿]/;
function alison(s){ if(typeof s!=='string'||s.indexOf('小語')<0) return s;
  return s.replace(/小語/g,(m,i)=>{ const pre=i>0?s[i-1]:'', nx=s[i+2]||''; return (pre&&CJK.test(pre)?' ':'')+'Alison'+(nx&&CJK.test(nx)?' ':''); }); }
const fix=r=>typeof r==='string'?alison(r):(Buffer.isBuffer(r)?Buffer.from(alison(r.toString('utf8')),'utf8'):r);
const isDoc=s=>/\bshow\b/.test(s)&&/docs\/story_planning\//.test(s);
if(!cp.__alison){
  const ex=cp.execSync, ef=cp.execFileSync;
  cp.execSync=function(cmd){ const r=ex.apply(this,arguments); return typeof cmd==='string'&&isDoc(cmd)?fix(r):r; };
  cp.execFileSync=function(file,args){ const r=ef.apply(this,arguments); return Array.isArray(args)&&isDoc(args.join(' '))?fix(r):r; };
  cp.__alison=true; }
module.exports={alison};
