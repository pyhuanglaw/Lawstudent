// DLG-FULL-REVIEW-1110 芷若第一批（AA_904）：約會「再去一次」那一格 58 句，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 20:00 定稿（BB_435 採用），企劃線 417c5cb9ce：
//   AA_904_zr_remember_this_last.json 58 列，都是芷若（heroine_02）hotspots.*.remember.lines[0].text。
//   白名單 33 筆改讀 417c5cb9ce（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；src/data/date_wish.js 一個字都沒變。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（417c5cb9ce）、approved；C.ZR904_1112_PREV（5afc5c0e3）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 ZR904_1112（58 格）和稿的 58 列一列對一格（row、地點、互動點、old、new）
//   3. 源稿 417c5cb9ce 和上一版 5afc5c0e3 逐格比（33 個檔、每個人、每一格、含 fx）：剛好這 58 格不同
//   4. 遊戲（src/data/date_lines.js）那 58 格＝稿的新字，一字不差；都是芷若自己說的
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 58 格不同；那 58 格重匯以前＝稿的 old；un812 還原以後兩版一樣
//   6. 舊字不在那一格了
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/zr904_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', SHA='417c5cb9ce', BASE='d5a4e23a8e', PREV=C.ZR904_1112_PREV;   /* SHA＝這一批的那一版（以後白名單再換版也還是比這一版）；BASE＝匯入以前的開發分支 */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOW=DL(read('src/data/date_lines.js')), R=C.ZR904_1112, ZR='heroine_02';
const gp=r=>'/loc/'+r.loc+'/lines/'+ZR+'/'+r.path;
const RE=/^hotspots\/(D\d\d\.\w+)\/remember\/lines\/0\/text$/;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&(e[0].approvedBy||'').includes('AA_904 定稿（BB_435）')&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有「AA_904 定稿（BB_435）」；'+PREV+' 在 history',C.ALLOW_SHA===SHA&&PREV==='5afc5c0e3'&&bad.length===0,J(bad));
  const e=allow.filter(x=>x.path===SP+'AA_904_zr_remember_this_last.json');
  check('1. 白名單有 AA_904 那一份稿、'+SHA+'、approved',e.length===1&&e[0].sha===SHA&&e[0].status==='approved',J(e.map(x=>x.sha)));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身
{ check('ZR904_1112 一共 58 格，都是 hotspots.<互動點>.remember.lines[0].text、互動點開頭＝地點；row 0～57 各一次；old≠new',
    R.length===58&&R.every(r=>RE.test(r.path)&&RE.exec(r.path)[1].slice(0,3)===r.loc&&r.doc==='AA_904'&&r.old&&r.new&&r.old!==r.new)&&J(R.map(r=>r.row).sort((a,b)=>a-b))===J([...Array(58).keys()])&&new Set(R.map(gp)).size===58); }

// 2、3
{ const A=(t=>t?JSON.parse(t):null)(show(SHA,SP+'AA_904_zr_remember_this_last.json'));
  if(A){
    check('2. 稿是定稿（BB_435）、58 列、每列 src、who＝heroine_02、where、old、new',/^定稿/.test(A._meta.status)&&A._meta.status.includes('BB_435')&&A._meta.count===58&&A.rows.length===58&&A.rows.every(r=>r.who===ZR&&/^date_system\/lines\/D\d\d\.json$/.test(r.src)&&/\.remember$/.test(r.where)),J(A._meta.status));
    const bad=R.filter(r=>{ const x=A.rows[r.row]; return !(x&&x.src==='date_system/lines/'+r.loc+'.json'&&x.where===RE.exec(r.path)[1]+'.remember'&&x.old===r.old&&x.new===r.new); });
    check('2. ZR904_1112 的 58 格和稿一列對一格（row、地點、互動點、old、new 都一樣）',bad.length===0,J(bad.map(r=>r.row)));
  } else console.log('（跳過第 2 項：讀不到 '+SHA+' 的 AA_904，企劃線沒 fetch）');
  const SRC={}, OLD={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+ZR+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 58 格不同、old／new 都照表（別人 0 格、fx 0 格）',diff.length===58&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==r.new).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 58 格＝稿的新字，一字不差',bad.length===0,J(bad.slice(0,4)));
  check('4. 那 58 句都是芷若自己說的（who＝heroine_02）',R.every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===ZR; })); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=R.map(gp).sort();
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 58 格不同',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 58 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old),J(R.filter(r=>a[gp(r)]!==r.old).slice(0,3).map(gp)));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
    check('5. src/data/date_wish.js、src/data/she_pays.js 和重匯以前一模一樣',show(BASE,'src/data/date_wish.js')===read('src/data/date_wish.js')&&show(BASE,'src/data/she_pays.js')===read('src/data/she_pays.js'));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const bad=R.filter(r=>get(NOW,gp(r))===r.old);
  check('6. 58 句舊字都不在那一格了',bad.length===0,J(bad.map(gp).slice(0,4))); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
