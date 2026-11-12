// DLG-FULL-REVIEW-1110／X324 以安續改第一批（AA_832）：約會台詞 32 格照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 定稿（BB_381 ③ 第二意見四處採納），企劃線 b84e779563：
//   AA_832_an_triple_short.json 32 列（約會三連短句 31 格＋D21 染布「退色→褪色」錯字一格）——AA 直接改源稿 date_system/lines/D03～D30.json（18 個檔），只動以安（heroine_01）的格子。
//   白名單 33 筆改讀 b84e779563（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有新的 AN_STALE、跳過的列和上一版一樣（321 列）。
// 同一天再匯（AA-C AA_834 以安第三批定稿，BB_383 第二意見採納，企劃線 6d503411c1）：AA_834_an_arrive.json 27 列（約會到達句 26 格＋D09 closing 一格）——同一批源稿 23 個檔，只動以安的格子；
//   白名單 33 筆再改讀 6d503411c1、重匯。AN_1112 一共 59 格（AA_832 32＋AA_834 27，沒有同一格）；匯入工具沒有新的 AN_STALE（AA_594 以安的列：源稿寫回了 105→100、那一格重寫了 183→188，照規則都跳過）。
//   舊期望（只有 AA_832 那一版，fc44579dbe）：ALLOW_SHA b84e779563、32 格。下面寫 32 格的地方現在都是 59 格。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（6d503411c1）、approved；C.AN_1112_SHA（b84e779563）、C.KX_1112_FIX_SHA（74e0421b8）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
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
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===PREV)&&(e[0].history||[]).some(h=>h.sha===C.AN_1112_SHA)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；'+C.AN_1112_SHA+'、'+PREV+' 在 history',C.ALLOW_SHA==='6221c8e80f'&&C.ZQ909_1112_PREV==='417c5cb9ce'&&C.ZR904_1112_PREV==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV==='3cb2939d0'&&C.HAO3_1112_PREV==='d7d818f8a8'&&C.HAO2_1112_PREV==='41f77eab53'&&C.HAO_1112_PREV==='a573a50dca'&&C.SIS_1112_PREV==='b22e4d1277'&&C.AN_1112_SHA==='b84e779563'&&PREV==='74e0421b8'&&bad.length===0,J(bad));   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：白名單再換 a573a50dca（只動學姊，見 date_src_sha.js SIS_1112）；以安這一輪最後一版 b22e4d1277＝C.SIS_1112_PREV。舊期望：C.ALLOW_SHA==='b22e4d1277' */   /* 2026-11-12（X324「好」開頭回話 AA_842～845@41f77eab53）：白名單再換 41f77eab53（只動學姊、語彤、沛珊、芷若第一次選項的回話 259 格，見 date_src_sha.js HAO_1112）；a573a50dca＝C.HAO_1112_PREV。舊期望：C.ALLOW_SHA==='a573a50dca' */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：白名單再換 d7d818f8a8（子晴 81、可昕 83 格選項回話、語彤 66 格再訪句、學姊 5／芷若 2／沛珊 1 格再改，共 238 格）；41f77eab53＝C.HAO2_1112_PREV。舊期望：C.ALLOW_SHA==='41f77eab53' */   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：白名單再換 3cb2939d0（沛珊「今天」開頭 31 格、以安 D24.station 1 格、子晴 D06.cafe 1 格、可昕 D13.drink／D24.street 2 格，共 35 格）；d7d818f8a8＝C.HAO3_1112_PREV。舊期望：C.ALLOW_SHA==='d7d818f8a8' */   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：白名單再換 417c5cb9ce（只動芷若 remember 58 格，逐格在 tests/zr904_dates_1112_unit.js）；5afc5c0e3＝C.ZR904_1112_PREV。舊期望：C.ALLOW_SHA==='5afc5c0e3' */   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f，date_src_sha.js ZQ909_1112）：白名單再換 6221c8e80f（只動子晴 8 格）；417c5cb9ce＝C.ZQ909_1112_PREV。舊期望：C.ALLOW_SHA==='417c5cb9ce' */
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ const a=show(C.ALLOW_SHA,SP+'AA_832_an_triple_short.json'), a2=show(C.ALLOW_SHA,SP+'AA_834_an_arrive.json');
  if(a&&a2){ const ra=JSON.parse(a).rows, rb=JSON.parse(a2).rows, key=(doc,loc,o,n)=>J([doc,loc,o,n]), want=[...ra.map(r=>key('AA_832',r.src.slice(-8,-5),r.old,r.new)),...rb.map(r=>key('AA_834',r.src.slice(-8,-5),r.old,r.new))].sort(), have=R.map(r=>key(r.doc,r.loc,r.old,r.new)).sort();
    check('2. AA_832 的 32 列、AA_834 的 27 列都是以安的（who＝heroine_01）、都在 date_system/lines/Dxx.json；AA_834 都在到達（arrive）或 D09 的 closing',ra.length===32&&rb.length===27&&[...ra,...rb].every(r=>r.who===AN&&/^date_system\/lines\/D\d\d\.json$/.test(r.src))&&R.filter(r=>r.doc==='AA_834').every(r=>/^arrive\//.test(r.path)||(r.loc==='D09'&&/^closing\//.test(r.path)))&&R.filter(r=>r.doc==='AA_834'&&/^closing\//.test(r.path)).length===1,J([ra.length,rb.length]));
    check('2. AN_1112（'+R.length+' 格）和稿一列對一格（地點、old、new 都一樣；沒有重複）',R.length===59&&new Set(have).size===59&&new Set(R.map(r=>r.loc+'/'+r.path)).size===59&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
  } else console.log('（跳過第 2 項：讀不到 '+C.ALLOW_SHA+' 的 AA_832／AA_834，企劃線沒 fetch）'); }

// 3
{ const AS=C.SIS_1112_PREV;   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838，白名單換 a573a50dca）：這一項的「源稿」固定讀以安這一輪最後那一版 AS＝b22e4d1277（之後 ALLOW_SHA 只多學姊 78 格＋D01 多一套，tests/sis_dates_1112_unit.js 第 3 項驗）。舊寫法：show(C.ALLOW_SHA,…) */
  const SRC={}, OLD={}; for(const k of LOCS){ const t=show(AS,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+AN+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+AS+' 和上一版 '+PREV+' 逐格比（含 fx）：只有以安 59 格不同，old／new 都照稿；別人 0 格',diff.length===59&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW.loc[r.loc].lines[AN],r.path)!==(r.game||r.new)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW.loc[r.loc].lines[AN],r.path)+'」');
  check('4. 遊戲那 59 格＝稿的新字（一格照 AA_694 拿掉「。」後面的「……」）',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game);
  check('4. 和稿不一樣的格子：0（D16 車上那句 AA 08:1x 把停頓移到句中，b22e4d1277，不再被 AA_694 規則拿掉）',g.length===0,J(g.map(r=>[r.new,r.game])));
  const ty=R.filter(r=>r.typo);
  check('4. D21 染布那一格只改錯字（退色→褪色）',ty.length===1&&ty[0].loc==='D21'&&ty[0].old.replace('退色','褪色')===ty[0].new,J(ty)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */) diff.push(p);
    const SISP=[...C.SIS_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_05/'+r.path),...C.SIS_1112_ADD.flatMap(x=>['/tier','/lines/0/who','/lines/0/text'].map(q=>'/loc/'+x.loc+'/lines/heroine_05/'+x.path+'/'+x.index+q))]; { const all=diff.slice(); diff.length=0; for(const p of all) if(!SISP.includes(p)) diff.push(p); check('5. 之後 AA_837＋AA_838（a573a50dca）學姊那 78 格也換了字、D01 交往到達多一套 3 格（date_src_sha.js SIS_1112、SIS_1112_ADD；逐格在 tests/sis_dates_1112_unit.js）——這裡先拿掉再比',SISP.length===81&&SISP.every(p=>all.includes(p)),J(SISP.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324 學姊續改）：舊期望是拿掉以前就只差這一輪的格子 */
    { const HAOP=C.HAO_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!SISP.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!HAOP.includes(p)) diff.push(p); check('5. 之後 AA_842～845（41f77eab53）學姊、語彤、沛珊、芷若第一次選項的回話 259 格也換了字（date_src_sha.js HAO_1112；逐格在 tests/hao_dates_1112_unit.js；其中學姊 D22.maple 那一格 SIS_1112 也有，上面拿過了）——這裡先拿掉再比',HAOP.length===258&&HAOP.every(p=>all.includes(p)),J(HAOP.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324「好」開頭回話）：舊期望是拿掉學姊那 81 格以後就只差這一輪的格子 */
    { const X=new Set([...C.HAO_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path),...C.SIS_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_05/'+r.path)]), H2=C.HAO2_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!X.has(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H2.includes(p)) diff.push(p); check('5. 之後第三次重匯（d7d818f8a8）子晴、可昕第一次選項的回話、語彤再訪句和 late 8 格一共 238 格也換了字（date_src_sha.js HAO2_1112；逐格在 tests/hao2_dates_1112_unit.js；其中 7 格 HAO_1112 也有、學姊 D20.trolley 那一格 SIS_1112 也有，上面拿過了）——這裡先拿掉再比',H2.length===230&&H2.every(p=>all.includes(p)),J(H2.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    const want=R.map(r=>'/loc/'+r.loc+'/lines/'+AN+'/'+r.path).sort();
    { const H3=C.HAO3_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H3.includes(p)) diff.push(p); check('5. 之後第四次重匯（3cb2939d0）沛珊「今天」開頭 31 格、以安 D24.station、子晴 D06.cafe、可昕 D13.drink／D24.street 一共 35 格也換了字（date_src_sha.js HAO3_1112；逐格在 tests/hao3_dates_1112_unit.js；其中子晴、可昕那三格 HAO2_1112 也有，上面拿過了或留在這一輪）——這裡先拿掉再比',C.HAO3_1112.length===35&&H3.length===32,J(H3.length)); }   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const D8=C.D158_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!D8.includes(p)) diff.push(p); check('5. 之後 D158 重匯（f6aa917593，AA_860）可昕 45 格、沛珊 4 格一共 49 格也換了字（date_src_sha.js D158_1112；逐格在 tests/d158_dates_1112_unit.js）——這裡先拿掉再比',C.D158_1112.length===49&&D8.length===49,J(D8.length)); }   /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===118,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const ZN=C.ZR904_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_02/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!ZN.includes(p)) diff.push(p); check('5. 之後芷若再去一次那一次重匯（417c5cb9ce，AA_904）58 格也換了字（date_src_sha.js ZR904_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZR904_1112.length===58&&ZN.length===58,J(ZN.length)); }   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const QN=C.ZQ909_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_04/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!QN.includes(p)) diff.push(p); check('5. 之後子晴到達句那一次重匯（6221c8e80f，AA_909）8 格也換了字（date_src_sha.js ZQ909_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZQ909_1112.length===8&&QN.length===8,J(QN.length)); }   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 59 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 59 格重匯以前＝稿的 old',R.every(r=>a['/loc/'+r.loc+'/lines/'+AN+'/'+r.path]===r.old));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const left=R.filter(r=>NOWT.includes(J(r.old))).map(r=>r.old);
  check('6. 59 句舊字都不在 date_lines.js 裡了',left.length===0,J(left.slice(0,4))); }

// 7
{ const d3=read('src/date3d.js'), left=R.filter(r=>d3.includes("'"+r.old+"'")).map(r=>r.loc+' '+r.old);
  check('7. src/date3d.js 照整句認句子的表裡沒有留著這 59 句的舊字',left.length===0,J(left)); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
