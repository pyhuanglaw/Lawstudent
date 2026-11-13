// CANON-NO-ECON-1112 收尾：約會源稿 e622a59148 → 4539b2ebaf（AA_938 第 4 節：可昕約會台詞裡記帳、排表口氣的五句；BB-C 照用）——不需要瀏覽器（D131）。
//   白名單 33 筆改讀 4539b2ebaf（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；逐格表在 tests/date_src_sha.js 的 KX938_1113（上一版 KX938_1113_PREV）。
//   1. 白名單 D01～D33 都是 4539b2ebaf、approved、approvedBy 有 AA_938；e622a59148 在 history
//   2. 表 5 格，全部可昕、AA_938；AA_938 第 4 節約會那張表的新字都在表上
//   3. 源稿 4539b2ebaf 和上一版 e622a59148 逐格比：剛好這 5 格不同；src248 還原以後兩版一樣
//   4. 遊戲那 5 格＝稿的新字（D20、D31 句中「……」照 AA_694 拿掉＝game）；舊字都不在遊戲檔了
//   5. 遊戲整份和重匯以前的開發分支（BASE）逐格比：只有這 5 格不同；un812 還原以後兩版一樣
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='3cf99b0c73', R=C.KX938_1113;   /* BASE＝重匯以前的開發分支 */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOW=DL(read('src/data/date_lines.js'));
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&(e[0].approvedBy||'').includes('AA_938')&&(e[0].history||[]).some(h=>h.sha===C.KX938_1113_PREV)&&(e[0].history||[]).some(h=>h.sha===C.KX944_1113_PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有 AA_938；'+C.KX938_1113_PREV+' 在 history（之後 AA_944／945／946 再換一版，KX944_1113）',C.ALLOW_SHA==='b4dcd9bf9a'&&C.KX944_1113_PREV==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&bad.length===0,J(bad));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ check('2. 表 5 格、全部可昕、AA_938；沒有同一格；old≠new',R.length===5&&R.every(r=>r.who==='kexin'&&r.doc==='AA_938'&&r.old&&r.new&&r.old!==r.new)&&new Set(R.map(gp)).size===5);
  const t=show(C.ALLOW_SHA,SP+'AA_938_回LAWWW_CANON收尾四件.md');
  if(t){ const sec=t.slice(t.indexOf('**約會台詞「山上／下山」18 句**'),t.indexOf('## 另：'));
    check('2. AA_938 第 4 節約會那張表的舊字、新字都在表上',sec.length>100&&R.every(r=>sec.includes(r.new)&&sec.includes(r.old)),J(R.filter(r=>!sec.includes(r.new)||!sec.includes(r.old)).map(r=>r.new)));
  } else console.log('（跳過第 2 項後半：讀不到 AA_938，企劃線沒 fetch）'); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.KX944_1113_PREV,SP+'date_system/lines/'+k+'.json'), u=show(C.KX938_1113_PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&!p.startsWith('/_meta')) diff.push(J([k,p,a[p],b[p]])); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new]));
    check('3. 源稿 '+C.KX944_1113_PREV+'（這一輪的版本；之後 AA_944／945／946 再改＝KX944_1113，逐格在 tests/kx944_dates_1113_unit.js）和上一版 '+C.KX938_1113_PREV+' 逐格比：剛好 5 格不同、old／new 都照表',diff.length===5&&J(diff.sort())===J(want.sort()),J(diff.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==(r.game||r.new)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 5 格＝稿的新字（D20、D31 句中「……」照 AA_694 拿掉）',bad.length===0&&R.filter(r=>r.game).map(r=>r.loc).join()==='D20,D31'&&R.every(r=>!r.game||r.game===r.new.replace(/……/g,'')),J(bad));
  const txt=read('src/data/date_lines.js');
  check('4. 舊字都不在遊戲檔了',R.every(r=>!txt.includes(J(r.old))),J(R.filter(r=>txt.includes(J(r.old))).map(r=>r.old))); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=R.map(gp).sort();
    { const K8=C.KX944_1113.filter(r=>!r.align).map(gp).filter(p=>diff.includes(p)&&!want.includes(p)), a8=diff.slice(); diff.length=0; for(const p of a8) if(!K8.includes(p)) diff.push(p); check('5. 之後收尾批（b4dcd9bf9a，AA_944 沛珊 31 格＋AA_945 可昕 23 格）也換了字（date_src_sha.js KX944_1113；逐格在 tests/kx944_dates_1113_unit.js）——這裡先拿掉再比（'+K8.length+' 格）',K8.length<=54,J(K8)); }   /* 2026-11-13（收尾批 b4dcd9bf9a）：舊期望是只差這一輪的 5 格 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 5 格不同',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 5 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
