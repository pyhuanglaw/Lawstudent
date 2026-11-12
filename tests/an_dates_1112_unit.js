// DLG-FULL-REVIEW-1110／X324 以安續改第一批（AA_832）：約會台詞 32 格照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 定稿（BB_381 ③ 第二意見四處採納），企劃線 b84e779563：
//   AA_832_an_triple_short.json 32 列（約會三連短句 31 格＋D21 染布「退色→褪色」錯字一格）——AA 直接改源稿 date_system/lines/D03～D30.json（18 個檔），只動以安（heroine_01）的格子。
//   白名單 33 筆改讀 b84e779563（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有新的 AN_STALE、跳過的列和上一版一樣（321 列）。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（b84e779563）、approved；上一版 C.KX_1112_FIX_SHA（74e0421b8）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 AN_1112（32 格）和 AA_832 的 32 列一列對一格（地點、old、new 都一樣；who 都是 heroine_01）
//   3. 源稿 b84e779563 和上一版 74e0421b8 逐格比（33 個檔、每個人、每一格、含 fx）：只有以安這 32 格不同、old／new 都照稿；別人 0 格
//   4. 遊戲（src/data/date_lines.js）那 32 格＝稿的新字；其中一格（D16 車上）稿的新句在「。」後面有「……」，匯入工具照 AA_694 的規則拿掉了（AN_1112 的 game）
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 32 格不同（別人的格子、fx、不分地點的短句、交通偏好零差異）
//   6. 舊字不在遊戲檔裡了
//   7. src/date3d.js 照「整句一字不差」認句子的表（S.SHE_PAYS 等）裡沒有留著這 32 句的舊字（留著＝那個效果不會再觸發）
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/an_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', AN='heroine_01', BASE='3611dfac34', PREV=C.KX_1112_FIX_SHA;   /* BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.AN_1112;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；上一版 '+PREV+' 在 history',C.ALLOW_SHA==='b84e779563'&&PREV==='74e0421b8'&&bad.length===0,J(bad));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ const a=show(C.ALLOW_SHA,SP+'AA_832_an_triple_short.json');
  if(a){ const ra=JSON.parse(a).rows, key=(loc,o,n)=>J([loc,o,n]), want=ra.map(r=>key(r.src.slice(-8,-5),r.old,r.new)).sort(), have=R.map(r=>key(r.loc,r.old,r.new)).sort();
    check('2. AA_832 的 32 列都是以安的（who＝heroine_01）、都在 date_system/lines/Dxx.json',ra.length===32&&ra.every(r=>r.who===AN&&/^date_system\/lines\/D\d\d\.json$/.test(r.src)),J(ra.length));
    check('2. AN_1112（'+R.length+' 格）和稿一列對一格（地點、old、new 都一樣；沒有重複）',R.length===32&&new Set(have).size===32&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
  } else console.log('（跳過第 2 項：讀不到 '+C.ALLOW_SHA+' 的 AA_832，企劃線沒 fetch）'); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.ALLOW_SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+AN+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+C.ALLOW_SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：只有以安 32 格不同，old／new 都照稿；別人 0 格',diff.length===32&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW.loc[r.loc].lines[AN],r.path)!==(r.game||r.new)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW.loc[r.loc].lines[AN],r.path)+'」');
  check('4. 遊戲那 32 格＝稿的新字（一格照 AA_694 拿掉「。」後面的「……」）',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game);
  check('4. 和稿不一樣的只有一格（D16 車上的回話），差的只是那一個「……」',g.length===1&&g[0].loc==='D16'&&g.every(r=>r.new.replace('……','')===r.game&&r.new.split('……').length===2),J(g.map(r=>[r.new,r.game])));
  const ty=R.filter(r=>r.typo);
  check('4. D21 染布那一格只改錯字（退色→褪色）',ty.length===1&&ty[0].loc==='D21'&&ty[0].old.replace('退色','褪色')===ty[0].new,J(ty)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=R.map(r=>'/loc/'+r.loc+'/lines/'+AN+'/'+r.path).sort();
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 32 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 32 格重匯以前＝稿的 old',R.every(r=>a['/loc/'+r.loc+'/lines/'+AN+'/'+r.path]===r.old));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const left=R.filter(r=>NOWT.includes(J(r.old))).map(r=>r.old);
  check('6. 32 句舊字都不在 date_lines.js 裡了',left.length===0,J(left.slice(0,4))); }

// 7
{ const d3=read('src/date3d.js'), left=R.filter(r=>d3.includes("'"+r.old+"'")).map(r=>r.loc+' '+r.old);
  check('7. src/date3d.js 照整句認句子的表裡沒有留著這 32 句的舊字',left.length===0,J(left)); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
