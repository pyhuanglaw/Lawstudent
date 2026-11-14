'use strict';
/* 2026-11-13 76f8 rc2（D158-KX-SAMESCHOOL，BB_467；AA_987 rows＋pairs、AA_959 總表 5 列）：可昕外校前提那 50 句換字。
   新舊字只在 tests/d158_rc2_rows.json 一個地方；這支給「和重匯以前比」的測試用：
   - unmap(o,file)：o（整份資料或其中一塊）裡，字串剛好是新字的換回舊字（就地改），回傳換了幾格——拿去和舊版比以前先做
   - fresh(o,file)：o 裡是新字的格數；stale(o,file)：o 裡還是舊字的路徑（應該 0）
   - check(o,file,checkFn,label,min)：驗「新字都在（至少 min 格）、舊字 0 格」 */
const ROWS=require('./d158_rc2_rows.json').rows;
const rows=file=>ROWS.filter(r=>r.file===file);
function walk(o,f,p){ if(Array.isArray(o)){ for(let i=0;i<o.length;i++){ if(typeof o[i]==='string') f(o,i,p+'['+i+']'); else walk(o[i],f,p+'['+i+']'); } } else if(o&&typeof o==='object'){ for(const k of Object.keys(o)){ if(typeof o[k]==='string') f(o,k,p+'.'+k); else walk(o[k],f,p+'.'+k); } } }
function unmap(o,file){ const M=new Map(rows(file).map(r=>[r.new,r.old])); let n=0; walk(o,(c,k)=>{ if(M.has(c[k])){ c[k]=M.get(c[k]); n++; } },''); return n; }
function fresh(o,file){ const S=new Set(rows(file).map(r=>r.new)); let n=0; walk(o,(c,k)=>{ if(S.has(c[k])) n++; },''); return n; }
function stale(o,file){ const S=new Set(rows(file).map(r=>r.old)), out=[]; walk(o,(c,k,p)=>{ if(S.has(c[k])) out.push(p); },''); return out; }
function check(o,file,checkFn,label,min){ const n=fresh(o,file), s=stale(o,file), want=min==null?rows(file).length:min;
  checkFn((label||file)+'：76f8 rc2（D158-KX-SAMESCHOOL，tests/d158_rc2_rows.json）這 '+rows(file).length+' 列新字在遊戲裡（'+n+' 格）、舊字 0 格',rows(file).length>0&&n>=want&&s.length===0,JSON.stringify({n,stale:s.slice(0,5)})); }
module.exports={ROWS,rows,unmap,fresh,stale,check};
