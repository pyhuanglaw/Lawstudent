// CANON-NO-ECON-1112／D158 約會台詞重匯（AA_860）：49 格，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 13:57 定稿（BB_405 聽過），企劃線 f6aa917593：
//   AA_860_date_lines_no_outside.json 49 列：約會稿裡提到舊序章、外校、外校室友的句子重寫——可昕（kexin）42 句＋第一次選項的字 3 格、沛珊（classmate_peishan）4 句。
//   同一版 AA 把 date_system/lines/ 底下的 Dxx.py 舊產生器刪掉了（匯入工具只讀 .json）。
//   白名單 33 筆改讀 f6aa917593（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有 STALE，各人跳過的列數和上一次一樣。
//   AA_812、date_rewrite/ 這一版沒動：白名單 AA_812 那一筆留在 3cb2939d0，src/data/she_pays.js、src/data/date_wish.js 重匯以後一個字都沒變。
// D158：舊字不寫在這支測試和 tests/date_src_sha.js 裡——表裡只有 oh（上一版那一格的字的 sha1 前 16 碼）、code（稿的 old_code，代號版）、new；
//       要舊字的地方從 git 讀（上一版的源稿、重匯以前的遊戲檔），讀不到就跳過並印出來。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（f6aa917593）、approved；C.D158_1112_PREV（3cb2939d0）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 D158_1112（49 格）和 AA_860 的 49 列一列對一格（row、new、code＝old_code、地點）
//   3. 源稿 f6aa917593 和上一版 3cb2939d0 逐格比（33 個檔、每個人、每一格、含 fx）：剛好這 49 格不同；舊字的 sha16＝oh
//   4. 遊戲（src/data/date_lines.js）那 49 格＝稿的新字，一字不差
//   5. 遊戲整份和重匯以前（開發分支 C.D158_1112_BASE）逐格比：只有這 49 格不同；那 49 格重匯以前的字 sha16＝oh
//   6. 舊字不在遊戲檔任何一格了（照 sha16 認）；33 個地點的格子裡沒有 tools/handoff/canon_scan.py 字表上的字
//   7. src/date3d.js、src/aa524_3d.js、src/data/she_pays.js 沒有留著舊字（選項的字當 key 的也沒有）；she_pays.js 每一句都還在、和重匯以前一模一樣；AA_812 兩版一樣
//   8. 匯入工具不讀 Dxx.py；f6aa917593 的 date_system/lines/ 33 個 Dxx.json 都在、Dxx.py 一支都不剩
//   9. 換了字的三個選項：選項數、回話、fx 都沒動（只換 t）
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5、7、8 項的那幾條跳過並印出來。用法：node tests/d158_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', SHA='f6aa917593', BASE=C.D158_1112_BASE, PREV=C.D158_1112_PREV;   /* SHA＝這一批的那一版（以後白名單再換版也還是比這一版）；BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.D158_1112;
const PS='classmate_peishan', KX='kexin';
const RE_T=/^hotspots\/(D\d\d\.\w+)\/first\/choice\/(\d+)\/t$/;
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path;
const N=R.length;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&e[0].approvedBy.includes('AA_860 定稿（BB_405 聽過）f6aa917593')&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有「AA_860 定稿（BB_405 聽過）f6aa917593」；'+PREV+' 在 history',C.ALLOW_SHA==='b4dcd9bf9a'&&C.KX944_1113_PREV==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&C.KX932_1112_PREV==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&C.PS914_1112_PREV==='f561545f38'&&C.PS913_1112_PREV==='6221c8e80f'&&C.ZQ909_1112_PREV==='417c5cb9ce'&&C.ZR904_1112_PREV==='5afc5c0e3'&&C.KXNL_1112_PREV===SHA&&PREV==='3cb2939d0'&&bad.length===0,J(bad));   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：白名單再換 417c5cb9ce（只動芷若 remember 58 格，逐格在 tests/zr904_dates_1112_unit.js）；5afc5c0e3＝C.ZR904_1112_PREV。舊期望：C.ALLOW_SHA==='5afc5c0e3' */   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f，date_src_sha.js ZQ909_1112）：白名單再換 6221c8e80f（只動子晴 8 格）；417c5cb9ce＝C.ZQ909_1112_PREV。舊期望：C.ALLOW_SHA==='417c5cb9ce' */   /* 2026-11-12（沛珊收尾 AA_913@f561545f38，date_src_sha.js PS913_1112）：白名單再換 f561545f38（只動沛珊 42 格）；6221c8e80f＝C.PS913_1112_PREV。舊期望：C.ALLOW_SHA==='6221c8e80f' */   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b，date_src_sha.js PS914_1112）：白名單再換 dce2f8c08b（只動沛珊 53 格）；f561545f38＝C.PS914_1112_PREV。舊期望：C.ALLOW_SHA==='f561545f38' */
  const e=allow.filter(x=>x.path===SP+'AA_812_date_pays_promises.json');
  check('1. 白名單 AA_812 那一筆留在 '+PREV+'（這一版 AA_812 沒改）、approved',e.length===1&&C.allow812(e[0],PREV)/* 2026-11-13（AA_946@b4dcd9bf9a）：之後 AA_812 換 b4dcd9bf9a（加可昕 D23.market），PREV 在 history 也算。舊期望：e[0].sha===PREV */&&e[0].status==='approved',J(e.map(x=>x.sha)));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身（不用讀稿）
{ const n={}; for(const r of R){ const k=r.who+' '+(RE_T.test(r.path)?'t':/\/text$/.test(r.path)?'text':'other'); n[k]=(n[k]||0)+1; }
  check('D158_1112 一共 49 格：可昕 42 句＋第一次選項的字 3 格、沛珊 4 句；沒有同一格、row 是 0～48 各一次、oh 是 16 碼、code／new 都有字而且不一樣；表裡沒有 old（D158 舊字不留）',
    N===49&&J(Object.entries(n).sort())===J(Object.entries({'kexin text':42,'kexin t':3,'classmate_peishan text':4}).sort())&&new Set(R.map(gp)).size===49&&J(R.map(r=>r.row).sort((a,b)=>a-b))===J(Array.from({length:49},(_,i)=>i))
    &&R.every(r=>/^[0-9a-f]{16}$/.test(r.oh)&&r.code&&r.new&&r.code!==r.new&&r.doc==='AA_860'&&r.old===undefined&&!r.was&&!r.game),J(n));
  check('D158_1112 換了字的三個選項：可昕 D02.pond、D06.gallery、D29.warehouse 第一次的第一個選項；互動點開頭＝地點',
    J(R.filter(r=>RE_T.test(r.path)).map(r=>r.who+' '+RE_T.exec(r.path)[1]+' '+RE_T.exec(r.path)[2]))===J(['kexin D02.pond 0','kexin D06.gallery 0','kexin D29.warehouse 0'])&&R.every(r=>!/hotspots\//.test(r.path)||r.path.split('/')[1].slice(0,3)===r.loc));
  const KXR=R.filter(r=>r.who===KX&&C.KX_1112.some(k=>k.loc===r.loc&&k.path===r.path));
  check('KX_1112（可昕續改）也改過的只有四格：D15.car 再訪、D16.beach 再訪、D21.street、D32.meadow 再訪——KX_1112 那一列的 new 的 sha16＝這裡的 oh（兩輪接得起來）；別的層（HAO_1112、HAO2_1112、HAO3_1112…）沒有這 49 格',
    J(KXR.map(r=>r.path.split('/')[1]))===J(['D15.car','D16.beach','D21.street','D32.meadow'])&&KXR.every(r=>{ const k=C.KX_1112.find(x=>x.loc===r.loc&&x.path===r.path); return C.sha16(k.game||k.new)===r.oh; })
    &&['HAO_1112','HAO2_1112','HAO3_1112'].every(t=>!C[t].some(h=>R.some(r=>r.who===h.who&&r.loc===h.loc&&r.path===h.path))),J(KXR.map(gp))); }

// 2、3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLD).length===33;
  const t860=show(SHA,SP+'AA_860_date_lines_no_outside.json');
  if(t860){ const A=JSON.parse(t860), rows=A.rows;
    check('2. AA_860 一共 49 列（file、old_code、new 三欄）；status 寫定稿、BB_405 聽過、已套源稿',rows.length===49&&rows.every(r=>J(Object.keys(r).sort())===J(['file','new','old_code']))&&/定稿/.test(A._meta.status)&&/BB_405/.test(A._meta.status)&&/已套源稿/.test(A._meta.status),A._meta.status);
    const bad=R.filter(r=>{ const x=rows[r.row]; return !(x&&x.new===r.new&&x.old_code===r.code&&(/D\d\d\.json$/.test(x.file)?x.file.endsWith('date_system/lines/'+r.loc+'.json'):x.file==='date_system/lines')); });
    check('2. D158_1112 的 49 格和稿一列對一格（row＝稿的第幾列；new、code＝old_code 都一樣；寫了檔名的 45 列檔名＝地點，最後 4 列（BB_405 以後加的）只寫資料夾）',bad.length===0&&rows.filter(x=>x.file==='date_system/lines').length===4,J(bad.map(r=>r.row)));
  } else console.log('（跳過第 2 項：讀不到 '+SHA+' 的 AA_860，企劃線沒 fetch）');
  if(haveSrc){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.oh,r.new])).sort(), have=diff.map(x=>J([x[0],x[1],typeof x[2]==='string'?C.sha16(x[2]):x[2],x[3]])).sort();
    check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 49 格不同，新字照表、舊字的 sha16＝oh（以安、子晴、學姊、芷若、語彤 0 格、fx 0 格）',diff.length===49&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原（拿掉 fx，各輪續改＋這 49 格）＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
    const ch=R.filter(r=>RE_T.test(r.path)).map(r=>[get(OLD[r.loc].lines[r.who],r.path.replace(/\/t$/,'')),get(SRC[r.loc].lines[r.who],r.path.replace(/\/t$/,''))]);
    check('9. 換了字的三個選項：源稿兩版那個選項只差 t（回話、fx、其他欄都一樣）',ch.length===3&&ch.every(([a,b])=>a&&b&&a.t!==b.t&&J(Object.assign({},a,{t:0}))===J(Object.assign({},b,{t:0}))),J(ch.map(x=>x[1]&&x[1].t)));
  } else console.log('（跳過第 3 項和第 9 項的對稿：讀不到源稿，企劃線沒 fetch）'); }

// 4
/* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：49 格裡三個選項的字（D02.pond、D06.gallery、D29.warehouse）這一版 AA 又改了——那三格現在認 KXNL_1112 的 new（那一列的 old＝這裡的 new）。舊期望：49 格都＝這一輪的 new */
const later=r=>{ const k=r.who===KX?C.KXNL_1112.find(x=>x.loc===r.loc&&x.path===r.path):(r.who==='classmate_peishan'?C.PS914_1112.find(x=>x.loc===r.loc&&x.path===r.path):null); const v=k&&k.old===r.new?(k.game||k.new):r.new; const k5=C.KX921_1112.find(x=>x.who===r.who&&x.loc===r.loc&&x.path===r.path); const v5=k5&&k5.old===v?(k5.game||k5.new):v; const k6=r.who===KX?C.KX938_1113.find(x=>x.loc===r.loc&&x.path===r.path):null; const v6=k6&&k6.old===v5?(k6.game||k6.new):v5; const k8=C.KX944_1113.find(x=>!x.align&&x.who===r.who&&x.loc===r.loc&&x.path===r.path); return k8&&k8.old===v6?(k8.game||k8.new):v6; };   /* 2026-11-13（收尾批 b4dcd9bf9a，KX944_1113）：可昕 D21.street 再訪那一格 AA_945 又改了——認 KX944_1113 的新字 */   /* 2026-11-13（收尾批 4539b2ebaf，KX938_1113）：可昕 D09 到達那一格 AA_938 又改了——認 KX938_1113 的新字 */   /* 2026-11-12（第五批 6dbfe10d7e，KX921_1112）：可昕 D02 收尾那一格 AA_917 又改了——認 KX921_1112 的新字 */   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b，PS914_1112）：沛珊 D21.street 那一格 AA 又改了——認 PS914_1112 的新字。舊期望：只有可昕三格 */
check('4. 49 格裡之後又改過的只有七格：可昕三個選項的字（KXNL_1112）、沛珊 D21.street（PS914_1112）、可昕 D02 收尾（KX921_1112）、可昕 D09 到達（KX938_1113，AA_938 第 4 節）、可昕 D21.street 再訪（KX944_1113，AA_945；舊期望六格）',J(R.filter(r=>later(r)!==r.new).map(r=>RE_T.test(r.path)?RE_T.exec(r.path)[1]:r.loc+'.'+r.path.split('/')[1]))===J(['D02.normal','D02.pond','D06.gallery','D09.normal','D21.D21.street','D21.D21.street','D29.warehouse']),J(R.filter(r=>later(r)!==r.new).map(r=>RE_T.test(r.path)?RE_T.exec(r.path)[1]:r.loc+'.'+r.path.split('/')[1])));
{ const bad=R.filter(r=>get(NOW,gp(r))!==later(r)).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+later(r)+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 49 格＝稿的新字，一字不差',bad.length===0,J(bad.slice(0,4)));
  const E=require('./ellipsis694.js'), g=R.filter(r=>E.strip(r.new)!==r.new);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0,J(g.map(r=>r.new)));
  check('4. 那 46 句都是她自己說的（who＝那個人）；三個選項的字還是「…」包著',R.filter(r=>!RE_T.test(r.path)).every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===r.who; })&&R.filter(r=>RE_T.test(r.path)).every(r=>/^「.+」$/.test(r.new))); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */&&!require('./date_src_sha.js').SHORT921_1112.some(r=>r.p===p)/* （CANON-NO-ECON-1112 第五批：照 AA_921 §3-1 換字）可昕不分地點的短句七格 */) diff.push(p);
    const want=R.map(gp).sort();
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js；其中三個選項的字這一輪也改過、留在這一輪）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===134,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const ZN=C.ZR904_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_02/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!ZN.includes(p)) diff.push(p); check('5. 之後芷若再去一次那一次重匯（417c5cb9ce，AA_904）58 格也換了字（date_src_sha.js ZR904_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZR904_1112.length===58&&ZN.length===58,J(ZN.length)); }   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const QN=C.ZQ909_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_04/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!QN.includes(p)) diff.push(p); check('5. 之後子晴到達句那一次重匯（6221c8e80f，AA_909）8 格也換了字（date_src_sha.js ZQ909_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZQ909_1112.length===8&&QN.length===8,J(QN.length)); }   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const SN=C.PS913_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!SN.includes(p)) diff.push(p); check('5. 之後沛珊收尾那一次重匯（f561545f38，AA_913）42 格也換了字（date_src_sha.js PS913_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS913_1112.length===42&&SN.length===42,J(SN.length)); }   /* 2026-11-12（沛珊收尾 AA_913@f561545f38）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const S4=C.PS914_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!S4.includes(p)) diff.push(p); check('5. 之後沛珊再訪那一次重匯（dce2f8c08b，AA_914）53 格也換了字（date_src_sha.js PS914_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS914_1112.length===53&&(S4.length===53||S4.length===52)/* D21.street 那一格 D158_1112 也改過：前面那一層已經拿掉、或是這一輪的 want 就算 52 */,J(S4.length)); }   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K5=C.KX921_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+(r.gpath||r.path)).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!K5.includes(p)) diff.push(p); check('5. 之後第五批（6dbfe10d7e，AA_917／918 收尾、AA_921 可昕清句、AA_923 D09）118 格也換了字（date_src_sha.js KX921_1112）——這裡先拿掉再比',C.KX921_1112.length===118&&K5.length===117/* 可昕 D02 收尾那一格 D158_1112 也改過，前面那一層已經拿掉 */,J(K5.length)); }   /* 2026-11-12（CANON-NO-ECON-1112 第五批 6dbfe10d7e）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K6=C.KX932_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a6=diff.slice(); diff.length=0; for(const p of a6) if(!K6.includes(p)) diff.push(p); check('5. 之後收尾批（e622a59148，AA_932 可昕外校前提句）5 格也換了字（date_src_sha.js KX932_1112；逐格在 tests/kx932_dates_1113_unit.js）——這裡先拿掉再比',C.KX932_1112.length===5&&K6.length===5,J(K6.length)); }   /* 2026-11-13（CANON-NO-ECON-1112 收尾 e622a59148）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K7=C.KX938_1113.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a7=diff.slice(); diff.length=0; for(const p of a7) if(!K7.includes(p)) diff.push(p); check('5. 之後收尾批（4539b2ebaf，AA_938 可昕記帳口氣）5 格也換了字（date_src_sha.js KX938_1113；逐格在 tests/kx938_dates_1113_unit.js）——這裡先拿掉再比（'+K7.length+' 格）',K7.length<=5,J(K7)); }
    { const K8=C.KX944_1113.filter(r=>!r.align).map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a8=diff.slice(); diff.length=0; for(const p of a8) if(!K8.includes(p)) diff.push(p); check('5. 之後收尾批（b4dcd9bf9a，AA_944 沛珊「今天」開頭 31 格＋AA_945 可昕再訪 23 格）也換了字（date_src_sha.js KX944_1113；AA_946 對齊的 12 格遊戲沒變；逐格在 tests/kx944_dates_1113_unit.js）——這裡先拿掉再比（'+K8.length+' 格）',K8.length<=54,J(K8)); }
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 49 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 49 格重匯以前的字：sha16＝oh',R.every(r=>typeof a[gp(r)]==='string'&&C.sha16(a[gp(r)])===r.oh),J(R.filter(r=>C.sha16(a[gp(r)])!==r.oh).slice(0,3).map(gp)));
    check('5. d158Old 讀得到重匯以前那 49 格（每一格的 sha16＝oh）；un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',R.every(r=>C.sha16(C.d158Old(r))===r.oh)&&J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
    /* 7：舊字（從重匯以前的遊戲檔讀）不在照整句認句子的表裡 */
    const d3=read('src/date3d.js'), sp=read('src/data/she_pays.js'), a5=read('src/aa524_3d.js'), w3=read('src/data/date_wish.js');
    const left=R.filter(r=>[d3,a5,sp,w3].some(t=>t.includes(a[gp(r)]))).map(gp);
    check('7. src/date3d.js、src/aa524_3d.js、src/data/she_pays.js、src/data/date_wish.js 裡沒有留著這 49 格的舊字（含拿選項的字當 key 的）',left.length===0,J(left));
    const osp=show(BASE,'src/data/she_pays.js'), ow=show(BASE,'src/data/date_wish.js');
    check('7. src/data/she_pays.js、src/data/date_wish.js 和重匯以前（'+BASE+'）一模一樣（AA_812 沒改、心願事件不讀這 49 格）',C.spSame944(osp,sp)/* 2026-11-13（AA_946@b4dcd9bf9a）：之後 she_pays.js 多可昕 D23.market 一句，unSp944 還原再比。舊期望：osp===sp */&&C.wishSame921(ow,w3)/* 2026-11-12（CANON-NO-ECON-1112 第五批）：心願源稿換 6dbfe10d7e——可昕心願換主題、沛珊說明欄四格（date_src_sha.js WISH921_1112）還原以後一樣（source 不算） */);
  } else console.log('（跳過第 5 項和第 7 項的舊字比對：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const b=leaves(NOW,'',{}), OH=new Set(R.map(r=>r.oh)), left=Object.keys(b).filter(p=>typeof b[p]==='string'&&b[p].length<200&&OH.has(C.sha16(b[p])));
  check('6. 49 句舊字（照 sha16 認）不在遊戲檔任何一格了',left.length===0,J(left.slice(0,4)));
  /* 字表從 tools/handoff/canon_scan.py 讀（\u 跳脫寫的那一列），這支測試不出現那些字 */
  const cs=read('tools/handoff/canon_scan.py'), line=(cs.split('\n').find(l=>l.startsWith('TERMS = '))||''), TERMS=(line.match(/r'((?:\\u[0-9a-fA-F]{4})+)'/g)||[]).map(x=>x.slice(2,-1).replace(/\\u([0-9a-fA-F]{4})/g,(m,h)=>String.fromCharCode(parseInt(h,16))));
  const loc=leaves(NOW.loc,'',{}), hit=Object.keys(loc).filter(p=>typeof loc[p]==='string'&&TERMS.some(t=>loc[p].includes(t)));
  check('6. 33 個地點的格子（'+Object.keys(loc).length+' 格）裡沒有 canon_scan.py 字表（'+TERMS.length+' 個詞）上的字',TERMS.length>=10&&Object.keys(loc).length>30000&&hit.length===0,J(hit.slice(0,4)));
  /* 還沒清的：不分地點的短句（DATE_LINES.lines，源頭 BB_128 3-6／AA_769，不是 Dxx.json）可昕「改天」那一類第二句——AA 還沒給新字，已列給 LAWWW 轉 AA。清掉以後這一條改成 0 */
  const rest=leaves(Object.assign({},NOW,{loc:undefined,source:undefined}),'',{}), hit2=Object.keys(rest).filter(p=>typeof rest[p]==='string'&&TERMS.some(t=>rest[p].includes(t)));
  check('6. 地點以外（不分地點的短句等）沒有字表上的字（/lines/kexin/cancel/1 照 AA_899 換了；CANON-NO-ECON-1112 第四批）',J(hit2)===J([]),J(hit2)); }

// 7
{ const sp=read('src/data/she_pays.js'), SPD=C.unSp944(vm.runInNewContext(sp+';SHE_PAYS_DATA'))/* 2026-11-13（AA_946@b4dcd9bf9a）：之後多的可昕 D23.market 先還原（date_src_sha.js unSp944） */, keys=J([SPD.pays,SPD.split]);
  check('7. src/data/she_pays.js（她請、平分）裡沒有這 49 格的新字（這一批沒有她請客的格）；來源照舊寫 AA_812@'+PREV,R.every(r=>!keys.includes(J(r.new)))&&SPD.src.endsWith('AA_812_date_pays_promises.json@'+PREV));
  const bad=[];
  for(const part of ['pays','split']) for(const who of Object.keys(SPD[part]||{})) for(const pid of Object.keys(SPD[part][who])) for(const t of SPD[part][who][pid]){
    const H=get(NOW,'/loc/'+pid.slice(0,3)+'/lines/'+who+'/hotspots/'+pid), n=Object.values(leaves(H||{},'',{})).filter(v=>v===t).length; if(n!==1) bad.push([part,who,pid,t,n]); }
  check('7. she_pays.js 的每一句（她請、平分）都還在遊戲裡那個互動點底下剛好一處',bad.length===0,J(bad));
  const a812=show(SHA,SP+'AA_812_date_pays_promises.json'), o812=show(PREV,SP+'AA_812_date_pays_promises.json');
  if(a812&&o812){ const d=git(['diff','--name-only',PREV,SHA,'--',SP+'AA_812_date_pays_promises.json',SP+'date_rewrite/']);
    check('7. AA_812 和改稿紀錄 date_rewrite/ 在 '+SHA+' 和 '+PREV+' 逐檔一樣（所以白名單那幾筆不換版）',a812===o812&&d!==null&&d.trim()==='',d); }
  else console.log('（跳過第 7 項的對稿：讀不到 '+SHA+'／'+PREV+' 的 AA_812）');
  /* 拿選項的字當 key 的五筆（同 tests/hao3_dates_1112_unit.js 第 7 項）：這一批換了三個選項的字，都不是這五筆 */
  const d3=read('src/date3d.js'), a5=read('src/aa524_3d.js');
  const PF=[['D06','heroine_04','D06.cafe','「我請妳。」'],['D15','heroine_04','D15.store','「布丁不行。」'],['D05','classmate_peishan','D05.cafe','「我請妳。」'],['D04','heroine_02','D04.snack','「下次換我請。」'],['D10','heroine_03','D10.boat','「我請。」']];
  const pfBad=PF.filter(([l,w,p,t])=>!((d3+a5).includes("pid:'"+p+"'")&&(d3+a5).includes("'"+t+"'")&&(get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/first/choice')||[]).some(c=>c.t===t)&&get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/remember')));
  check('7. 拿選項的字當 key 的五筆：選項的字都還在、那個互動點都還有 remember；換了字的三個選項（可昕）不在這五筆裡',pfBad.length===0&&!PF.some(([l,w,p])=>R.some(r=>RE_T.test(r.path)&&r.who===w&&RE_T.exec(r.path)[1]===p)),J(pfBad)); }

// 8
{ const tool=read('tools/date/import_date_lines.py');
  check('8. tools/date/import_date_lines.py 不讀 Dxx.py（只 git show 白名單上的 .json）',!/lines\/D\d\d\.py|D\{[^}]*\}\.py|\.py'\)/.test(tool.replace(/import_[a-z_]+\.py|bump_lines_sha\.py|date_rewrite\.py/g,'')));
  const ls=git(['ls-tree','--name-only',SHA,SP+'date_system/lines/']), lp=git(['ls-tree','--name-only',PREV,SP+'date_system/lines/']);
  if(ls&&lp){ const f=ls.trim().split('\n').map(x=>x.split('/').pop()), g=lp.trim().split('\n').map(x=>x.split('/').pop());
    const py=x=>/^D\d\d\.py$/.test(x);
    check('8. '+SHA+' 的 date_system/lines/：33 個 Dxx.json 都在、Dxx.py 產生器一支都不剩（上一版有 '+g.filter(py).length+' 支）',J(f.filter(x=>/^D\d\d\.json$/.test(x)).sort())===J(LOCS.map(k=>k+'.json'))&&f.filter(py).length===0&&g.filter(py).length>=30,J(f.filter(x=>!/^D\d\d\.json$/.test(x)))); }
  else console.log('（跳過第 8 項的資料夾比對：讀不到 '+SHA+'／'+PREV+'）'); }

// 9（遊戲這一邊）
{ const bad=R.filter(r=>RE_T.test(r.path)).filter(r=>{ const c=get(NOW,gp(r).replace(/\/t$/,'')); return !(c&&c.t===later(r)&&Array.isArray(c.reply)&&c.reply.length>=1&&c.reply.every(x=>x&&typeof x.text==='string'&&x.text)); });
  check('9. 換了字的三個選項在遊戲裡：t＝新字（之後 KXNL_1112 再改的字）、回話都還在',bad.length===0,J(bad.map(gp))); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
