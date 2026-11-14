// DLG-FULL-REVIEW-1110 芷若第一批（AA_904）＋子晴第一批（AA_909）＋沛珊第一批（AA_913）、第二批（AA_914）：約會台詞四次重匯，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
//   AA_904（AA-C 2026-11-12 20:00 定稿，BB_435 採用；企劃線 417c5cb9ce）：芷若（heroine_02）「再去一次」hotspots.*.remember.lines[0].text 58 格。上一版 5afc5c0e3（C.ZR904_1112_PREV）。
//   AA_909（AA-C 2026-11-12 20:3x 定稿，BB_437 採用；企劃線 6221c8e80f）：子晴（heroine_04）到達句 8 格（7 格 arrive.dating[0]、D08.giraffe 一格）。上一版 417c5cb9ce（C.ZQ909_1112_PREV）。
//   AA_913（AA-C 2026-11-12 20:5x 定稿，BB_438 採用、D19／D20 照補節換開頭；企劃線 f561545f38）：沛珊（classmate_peishan）約會收尾「下次…」42 格。上一版 6221c8e80f（C.PS913_1112_PREV）。
//   AA_914（AA-C 2026-11-12 21:0x 定稿，BB_439 採用；企劃線 dce2f8c08b）：沛珊再訪「上次」開頭 53 格（remember；D18.shop 遊戲照 AA_694 拿掉句中「……」＝game）。上一版 f561545f38（C.PS914_1112_PREV）。
//   白名單 33 筆改讀 dce2f8c08b（tools/date/bump_lines_sha.py 四次）、tools/date/import_date_lines.py 重匯；src/data/date_wish.js、she_pays.js 一個字都沒變。
// 檢查（每一輪各做一次）：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（6221c8e80f）、approved；兩輪的 PREV 都在 history；兩份稿都在白名單；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的表（ZR904_1112 58 格、ZQ909_1112 8 格）和稿一列對一格
//   3. 源稿和那一輪的上一版逐格比（33 個檔、每個人、每一格、含 fx）：剛好表上的格子不同
//   4. 遊戲（src/data/date_lines.js）那些格＝稿的新字，一字不差；都是那個人自己說的
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 161 格不同；重匯以前＝稿的 old；un812 還原以後兩版一樣
//   6. 舊字不在那一格了
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/zr904_dates_1112_unit.js
'use strict';
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='d5a4e23a8e';   /* BASE＝四次重匯以前的開發分支 */
const ROUNDS=[
  {name:'AA_904',who:'heroine_02',R:C.ZR904_1112,n:58,sha:'417c5cb9ce',prev:C.ZR904_1112_PREV,prevWant:'5afc5c0e3',doc:'AA_904_zr_remember_this_last.json',bb:'BB_435',
    re:/^hotspots\/(D\d\d\.\w+)\/remember\/lines\/0\/text$/,where:r=>/^hotspots\/(D\d\d\.\w+)\//.exec(r.path)[1]+'.remember'},
  {name:'AA_909',who:'heroine_04',R:C.ZQ909_1112,n:8,sha:'6221c8e80f',prev:C.ZQ909_1112_PREV,prevWant:'417c5cb9ce',doc:'AA_909_zq_arrive_template.json',bb:'BB_437',
    re:/^(arrive\/dating\/0\/lines\/0\/text|hotspots\/D08\.giraffe\/normal\/2\/lines\/0\/text)$/,where:null},
  {name:'AA_913',who:'classmate_peishan',R:C.PS913_1112,n:42,sha:'f561545f38',prev:C.PS913_1112_PREV,prevWant:'6221c8e80f',doc:'AA_913_ps_closing_next.json',bb:'BB_438',
    re:/^(closing\/((normal|dating)\/\d|first)\/lines\/\d\/text|hotspots\/D09\.tea\/normal\/2\/lines\/0\/text)$/,where:null},
  {name:'AA_914',who:'classmate_peishan',R:C.PS914_1112,n:53,sha:'dce2f8c08b',prev:C.PS914_1112_PREV,prevWant:'f561545f38',doc:'AA_914_ps_remember_last.json',bb:'BB_439',
    re:/^hotspots\/(D\d\d\.\w+)\/remember\/lines\/0\/text$/,where:null}];
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOW=M959.unmapDeep(DL(read('src/data/date_lines.js')),'date_lines.js');
const gp=(X,r)=>'/loc/'+r.loc+'/lines/'+X.who+'/'+r.path;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&(e[0].approvedBy||'').includes('AA_904 定稿（BB_435）')&&(e[0].approvedBy||'').includes('AA_909 定稿（BB_437）')&&(e[0].approvedBy||'').includes('AA_913 定稿（BB_438）')&&(e[0].approvedBy||'').includes('AA_914 定稿（BB_439）')&&ROUNDS.every(X=>(e[0].history||[]).some(h=>h.sha===X.prev))); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有 AA_904、AA_909、AA_913、AA_914 四次定稿；5afc5c0e3、417c5cb9ce、6221c8e80f、f561545f38 都在 history',C.ALLOW_SHA==='b4dcd9bf9a'&&C.KX944_1113_PREV==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&C.KX932_1112_PREV==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&ROUNDS.every(X=>X.prev===X.prevWant)&&bad.length===0,J(bad));
  for(const X of ROUNDS){ const e=allow.filter(x=>x.path===SP+X.doc);
    check('1. 白名單有 '+X.name+' 那一份稿、'+X.sha+'、approved',e.length===1&&e[0].sha===X.sha&&e[0].status==='approved',J(e.map(x=>x.sha))); }
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

for(const X of ROUNDS){ const R=X.R;
  // 表本身
  check(X.name+'：表一共 '+X.n+' 格、path 照這一輪的形狀、row 0～'+(X.n-1)+' 各一次；old≠new；沒有同一格',
    R.length===X.n&&R.every(r=>X.re.test(r.path)&&r.doc===X.name&&r.old&&r.new&&r.old!==r.new&&(!/^hotspots\//.test(r.path)||r.path.split('/')[1].slice(0,3)===r.loc))&&J(R.map(r=>r.row).sort((a,b)=>a-b))===J([...Array(X.n).keys()])&&new Set(R.map(r=>gp(X,r))).size===X.n);
  // 2
  const A=(t=>t?JSON.parse(t):null)(show(X.sha,SP+X.doc));
  if(A){
    check('2. '+X.name+' 是定稿（'+X.bb+'）、'+X.n+' 列、每列 src、who＝'+X.who+'、old、new',/^定稿/.test(A._meta.status)&&A._meta.status.includes(X.bb)&&A.rows.length===X.n&&A.rows.every(r=>r.who===X.who&&/^date_system\/lines\/D\d\d\.json$/.test(r.src)),J(A._meta.status));
    const bad=R.filter(r=>{ const x=A.rows[r.row]; return !(x&&x.src==='date_system/lines/'+r.loc+'.json'&&(!X.where||x.where===X.where(r))&&x.old===r.old&&x.new===r.new); });
    check('2. '+X.name+' 的 '+X.n+' 格和稿一列對一格（row、地點、old、new 都一樣）',bad.length===0,J(bad.map(r=>r.row)));
  } else console.log('（跳過第 2 項：讀不到 '+X.sha+' 的 '+X.name+'，企劃線沒 fetch）');
  // 3
  const SRC={}, OLD={}; for(const k of LOCS){ const t=show(X.sha,SP+'date_system/lines/'+k+'.json'), u=show(X.prev,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+X.who+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+X.sha+' 和上一版 '+X.prev+' 逐格比（含 fx）：剛好 '+X.n+' 格不同、old／new 都照表（別人 0 格、fx 0 格）',diff.length===X.n&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. '+X.name+'：源稿用 src248 還原＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到 '+X.name+' 的源稿，企劃線沒 fetch）');
  // 4、6
  const L8=r=>{ const k=C.KX944_1113.find(x=>!x.align&&x.who===X.who&&x.loc===r.loc&&x.path===r.path); return k&&k.old===(r.game||r.new)?(k.game||k.new):(r.game||r.new); };   /* 2026-11-13（收尾批 b4dcd9bf9a，KX944_1113）：沛珊收尾 7 格 AA_944「今天」開頭又改了——認 KX944_1113 的新字 */
  check('4. '+X.name+'：之後 AA_944（KX944_1113）又改過的格子（AA_913 七格收尾，其他輪 0 格）',J(R.filter(r=>L8(r)!==(r.game||r.new)).map(r=>r.loc))===J(X.name==='AA_913'?['D01','D02','D04','D15','D24','D27','D29']:[]),J(R.filter(r=>L8(r)!==(r.game||r.new)).map(r=>r.loc)));
  const bad=R.filter(r=>get(NOW,gp(X,r))!==L8(r)).map(r=>r.loc+' '+r.path+'：稿「'+L8(r)+'」遊戲「'+get(NOW,gp(X,r))+'」');
  check('4. '+X.name+'：遊戲那 '+X.n+' 格＝稿的新字，一字不差',bad.length===0,J(bad.slice(0,4)));
  check('4. '+X.name+'：那 '+X.n+' 句都是 '+X.who+' 自己說的',R.every(r=>{ const x=get(NOW,gp(X,r).replace(/\/text$/,'')); return x&&x.who===X.who; }));
  { const E=require('./ellipsis694.js'), g=R.filter(r=>r.game||E.strip(r.new)!==r.new);
    check('4. '+X.name+'：遊戲和稿不一樣的格子（game）都是 AA_694 拿掉句中「……」的結果（沛珊 D18.shop 一格；其他輪 0 格）',g.every(r=>r.game===E.strip(r.new))&&J(g.map(r=>r.loc))===J(X.name==='AA_914'?['D18']:[]),J(g.map(r=>r.loc))); }
  check('6. '+X.name+'：舊字都不在那一格了',R.every(r=>get(NOW,gp(X,r))!==r.old)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&!require('./date_src_sha.js').SHORT921_1112.some(r=>r.p===p)/* （CANON-NO-ECON-1112 第五批：照 AA_921 §3-1 換字）可昕不分地點的短句七格 */) diff.push(p);
    const all=[].concat(...ROUNDS.map(X=>X.R.map(r=>[X,r]))), want=all.map(([X,r])=>gp(X,r)).sort();
    { const K5=C.KX921_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+(r.gpath||r.path)).filter(p=>diff.includes(p)&&!want.includes(p)), al=diff.slice(); diff.length=0; for(const p of al) if(!K5.includes(p)) diff.push(p); check('5. 之後第五批（6dbfe10d7e，AA_917／918 收尾、AA_921 可昕清句、AA_923 D09）118 格也換了字（date_src_sha.js KX921_1112；逐格在 tests/kx921_dates_1112_unit.js）——這裡先拿掉再比',C.KX921_1112.length===118&&K5.length===118,J(K5.length)); }   /* 2026-11-12（CANON-NO-ECON-1112 第五批）：舊期望是重匯以前就只差這四輪的格子 */
    { const K6=C.KX932_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a6=diff.slice(); diff.length=0; for(const p of a6) if(!K6.includes(p)) diff.push(p); check('5. 之後收尾批（e622a59148，AA_932 可昕外校前提句）5 格也換了字（date_src_sha.js KX932_1112；逐格在 tests/kx932_dates_1113_unit.js）——這裡先拿掉再比',C.KX932_1112.length===5&&K6.length===5,J(K6.length)); }   /* 2026-11-13（CANON-NO-ECON-1112 收尾 e622a59148）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K7=C.KX938_1113.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a7=diff.slice(); diff.length=0; for(const p of a7) if(!K7.includes(p)) diff.push(p); check('5. 之後收尾批（4539b2ebaf，AA_938 可昕記帳口氣）5 格也換了字（date_src_sha.js KX938_1113；逐格在 tests/kx938_dates_1113_unit.js）——這裡先拿掉再比（'+K7.length+' 格）',K7.length<=5,J(K7)); }
    { const K8=C.KX944_1113.filter(r=>!r.align).map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a8=diff.slice(); diff.length=0; for(const p of a8) if(!K8.includes(p)) diff.push(p); check('5. 之後收尾批（b4dcd9bf9a，AA_944 沛珊「今天」開頭 31 格＋AA_945 可昕再訪 23 格）也換了字（date_src_sha.js KX944_1113；AA_946 對齊的 12 格遊戲沒變；逐格在 tests/kx944_dates_1113_unit.js）——這裡先拿掉再比（'+K8.length+' 格）',K8.length<=54,J(K8)); }
    C.rc2Layer(diff,a,b,check,want);   /* 2026-11-13 76f8 rc2（D158-KX-SAMESCHOOL，BB_467／AA_987）：可昕外校前提 5 格（date_src_sha.js RC2_1113；新舊字在 tests/d158_rc2_rows.json）也換了字——這裡先拿掉再比（同時驗 5 格都是新字、舊字整份 0 格）；舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 161 格不同',Object.keys(b).length>30000&&want.length===161&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 161 格重匯以前＝稿的 old',all.every(([X,r])=>a[gp(X,r)]===r.old),J(all.filter(([X,r])=>a[gp(X,r)]!==r.old).slice(0,3).map(([X,r])=>gp(X,r))));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
    check('5. src/data/date_wish.js、src/data/she_pays.js 和重匯以前一模一樣',C.wishSame921(show(BASE,'src/data/date_wish.js'),read('src/data/date_wish.js'))/* 2026-11-12（CANON-NO-ECON-1112 第五批）：心願源稿換 6dbfe10d7e——可昕心願換主題、沛珊說明欄四格（date_src_sha.js WISH921_1112）還原以後一樣（source 不算） */&&C.spSame944(show(BASE,'src/data/she_pays.js'),read('src/data/she_pays.js'))/* 2026-11-13（AA_946@b4dcd9bf9a）：之後 she_pays.js 多可昕 D23.market，unSp944 還原再比。舊期望：兩份字一樣 */);
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
