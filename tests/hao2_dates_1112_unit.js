// DLG-FULL-REVIEW-1110／X324 約會台詞第三次重匯（AA_846～AA_848＋上一批的 late_fix）：238 格，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 10:39 定稿（BB_395 聽過），企劃線 d7d818f8a8：
//   AA_846_zq_hao_replies.json 子晴（heroine_04）81 列、AA_847_kx_hao_replies.json 可昕（kexin）83 列：第一次選項的回話（hotspots.<互動點>.first.choice[i].reply[0].text）「好」開頭；
//   AA_848_yt_remember_last.json 語彤（heroine_03）66 列：再訪句（hotspots.<互動點>.remember.lines[i].text）「上次」開頭；
//   上一批（HAO_1112）匯完以後查到付錢／承諾對不上、AA 再改的 8 格（稿的 _meta.late_fix）：AA_842 學姊 D04.redhouse、D06.cafe、D20.trolley、D25.cafe、D30.stall；AA_844 沛珊 D05.cafe；AA_845 芷若 D04.snack、D10.bridge
//   （AA_842 只有 D06.cafe 那一列的 new 跟著改；學姊 D20.trolley 上一批沒動、稿的 rows 沒有這一格；其餘 6 格稿的 rows 還是上一版的字，新字只寫在 late_fix——已列給 AA）。
//   白名單 33 筆改讀 d7d818f8a8（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有 STALE。和上次比：
//   AA_812 path_rows 第一列（子晴 D06.cafe「好。下次我請你吃滷味。」→「好。下次我請。」）對不到——那一格 AA 在 AA_846 late_fix 改回「下次我請你吃滷味。」，工具加 SUPER812 只跳過這一列（換了 7→6 格）；
//   語彤跳過的列 289→292：AA_694 第 3 節第 158、161、176 列（語彤的句子，新稿重寫了）；AA_630 D-028、079、094、112、130、134、151、159、175 九列從「已經是改成的字」變成「那一格新稿重寫了」；
//   子晴 12 列照舊（AA_525 D30、D31、AA_526 D15 三列的原因跟著新字換）。
//   AA_812 白名單換 d7d818f8a8（她請／平分名單五句同步新字）、tools/date/import_she_pays.py 的 REWORD 清空、重匯 src/data/she_pays.js。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（d7d818f8a8）、approved；C.HAO2_1112_PREV（41f77eab53）在 history；AA_812 那一筆也是 d7d818f8a8（633b7f7d6 在 history）；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 HAO2_1112（238 格）：AA_846／847／848 的列一列對一格（檔、who、互動點、old、new；846、847 的 option＝那個選項的 t）；late 8 格的新字寫在那一份稿的 late_fix，其中 7 格 HAO_1112 也有（old＝HAO_1112 的 new）
//   3. 源稿 d7d818f8a8 和上一版 41f77eab53 逐格比（33 個檔、每個人、每一格、含 fx）：剛好這 238 格不同；子晴、可昕、late 8 格只動 first/choice/n/reply/0/text，語彤只動 remember/lines/n/text；以安 0 格、fx 0 格、選項的字 0 格
//   4. 遊戲（src/data/date_lines.js）那 238 格＝稿的新字，一字不差
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 238 格不同；那 238 格重匯以前＝稿的 old（子晴 D06.cafe 是 AA_812 換過的 was）
//   6. 舊字不在那一格了（同一句別的格子還有的另外列）
//   7. 照「整句一字不差」認句子的表：src/date3d.js 沒有留著舊字；src/data/she_pays.js＝AA_812@d7d818f8a8 的 SHE_PAYS_add／SPLIT（一字不差、cells812 沒有 was＝REWORD 清空了）、每一句都在遊戲那個互動點底下剛好一處；
//      拿選項的字當 key 的（S.PICK_FLAG、aa524_3d.js 的 rem）選項都還在；S.REMEMBER_IF、rem 指到的互動點都還有 remember
//   8. AA_812 path_rows 第一列被取代（SUPER812）：遊戲那一格＝AA_846 的字；第二列（語彤 D10.boat remember）照舊在
//   9. 新字：子晴、可昕 164 句沒有「好。／好，」開頭的；語彤 66 句沒有「上次」開頭的
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/hao2_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', SHA='d7d818f8a8', BASE='3e5da8ac04', PREV=C.HAO2_1112_PREV;   /* SHA＝這一批的那一版（以後白名單再換版也還是比這一版）；BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
const DOCS={AA_846:['AA_846_zq_hao_replies.json','heroine_04',81],AA_847:['AA_847_kx_hao_replies.json','kexin',83],AA_848:['AA_848_yt_remember_last.json','heroine_03',66]};
const LATE={AA_842:['AA_842_sis_hao_replies.json','heroine_05',5],AA_844:['AA_844_ps_hao_replies.json','classmate_peishan',1],AA_845:['AA_845_zr_hao_replies.json','heroine_02',2]};
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.HAO2_1112;
const RE_REPLY=/^hotspots\/(D\d\d\.\w+)\/first\/choice\/(\d+)\/reply\/0\/text$/, RE_REM=/^hotspots\/(D\d\d\.\w+)\/remember\/lines\/(\d+)\/text$/;
const reOf=r=>r.doc==='AA_848'?RE_REM:RE_REPLY, pt=r=>reOf(r).exec(r.path)[1];
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path;
const MAIN=R.filter(r=>!r.late), LT=R.filter(r=>r.late);

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；'+PREV+' 在 history',C.ALLOW_SHA==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV==='3cb2939d0'&&C.HAO3_1112_PREV===SHA&&PREV==='41f77eab53'&&bad.length===0,J(bad));   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：白名單再換 3cb2939d0（35 格，逐格在 tests/hao3_dates_1112_unit.js）；這一批的 d7d818f8a8＝C.HAO3_1112_PREV。舊期望：C.ALLOW_SHA===SHA（d7d818f8a8） */   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */
  const e=allow.filter(x=>x.path===SP+'AA_812_date_pays_promises.json');
  check('1. 白名單 AA_812 那一筆現在是 '+C.D158_1112_PREV+'（path_rows 少子晴 D06.cafe 一列）、approved；這一批的 '+SHA+'（她請／平分名單同步新字）和 633b7f7d6、f1fab0ec6 在 history',e.length===1&&e[0].sha===C.D158_1112_PREV&&C.D158_1112_PREV==='3cb2939d0'&&e[0].status==='approved'&&[SHA,'633b7f7d6','f1fab0ec6'].every(s=>(e[0].history||[]).some(h=>h.sha===s)),J(e.map(x=>x.sha)));   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：AA_812 白名單再換 3cb2939d0。舊期望：e[0].sha===SHA（d7d818f8a8）、history 有 633b7f7d6、f1fab0ec6 */   /* 2026-11-12（D158 約會台詞重匯 f6aa917593）：AA_812 這一版沒改（3cb2939d0 和 f6aa917593 的 AA_812、date_rewrite/ 逐檔一樣），白名單那一筆留在 3cb2939d0（tests/d158_dates_1112_unit.js 第 7 項驗）。舊期望：e[0].sha===C.ALLOW_SHA（那時候 ALLOW_SHA 就是 3cb2939d0） */
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身（不用讀稿）
{ const n={}; for(const r of R) n[r.doc+(r.late?'*':'')]=(n[r.doc+(r.late?'*':'')]||0)+1;
  check('HAO2_1112 一共 238 格：AA_846 子晴 81、AA_847 可昕 83、AA_848 語彤 66，late（*）AA_842 學姊 5、AA_844 沛珊 1、AA_845 芷若 2；每一列的 who＝那一份的人；沒有同一格',
    R.length===238&&J(Object.keys(n).sort())===J(['AA_842*','AA_844*','AA_845*','AA_846','AA_847','AA_848'])&&Object.keys(DOCS).every(d=>n[d]===DOCS[d][2])&&Object.keys(LATE).every(d=>n[d+'*']===LATE[d][2])&&R.every(r=>(r.late?LATE:DOCS)[r.doc][1]===r.who)&&new Set(R.map(gp)).size===238,J(n));
  check('HAO2_1112 的格子：語彤 66 格都是 hotspots/<互動點>/remember/lines/n/text，其餘 172 格都是 hotspots/<互動點>/first/choice/n/reply/0/text；互動點開頭＝地點；old≠new',R.every(r=>{ const m=reOf(r).exec(r.path); return m&&m[1].slice(0,3)===r.loc&&r.old!==r.new&&r.old&&r.new; }),J(R.filter(r=>!reOf(r).test(r.path)).slice(0,3)));
  const H=C.HAO_1112, miss=LT.filter(r=>!H.some(h=>h.who===r.who&&h.loc===r.loc&&h.path===r.path&&h.new===r.old)).map(r=>r.who+' '+pt(r));
  check('late 8 格裡 7 格 HAO_1112（上一批）也有、old＝HAO_1112 那一列的 new（兩輪都改過）；學姊 D20.trolley 那一格上一批沒動（原句「還是覺得。票我買，兩張。」不是「好」開頭）；其餘 230 格 HAO_1112 沒有',J(miss)===J(['heroine_05 D20.trolley'])&&!H.some(h=>h.who==='heroine_05'&&h.path===LT.find(r=>pt(r)==='D20.trolley').path)&&MAIN.every(r=>!H.some(h=>h.who===r.who&&h.loc===r.loc&&h.path===r.path)),J(miss));
  check('late 8 格是：學姊 D04.redhouse、D06.cafe、D20.trolley、D25.cafe、D30.stall，沛珊 D05.cafe，芷若 D04.snack、D10.bridge',J(LT.map(r=>r.who+' '+pt(r)).sort())===J(['classmate_peishan D05.cafe','heroine_02 D04.snack','heroine_02 D10.bridge','heroine_05 D04.redhouse','heroine_05 D06.cafe','heroine_05 D20.trolley','heroine_05 D25.cafe','heroine_05 D30.stall']),J(LT.map(r=>r.who+' '+pt(r))));
  const W=R.filter(r=>r.was);
  check('was（重匯以前遊戲那一格和源稿上一版不一樣）只有子晴 D06.cafe：「好。下次我請。」（AA_812 path_rows 換過的）',W.length===1&&W[0].who==='heroine_04'&&pt(W[0])==='D06.cafe'&&W[0].was==='好。下次我請。'&&W[0].old==='好。下次我請你吃滷味。'&&W[0].new==='下次我請你吃滷味。',J(W)); }

// 2、3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLD).length===33;
  const T={}, M={}; for(const d of Object.keys(DOCS)){ const t=show(SHA,SP+DOCS[d][0]); if(t) T[d]=JSON.parse(t).rows; } for(const d of Object.keys(LATE)){ const t=show(SHA,SP+LATE[d][0]); if(t) M[d]=JSON.parse(t); }
  if(Object.keys(T).length===3&&Object.keys(M).length===3){
    const key=(doc,loc,p,o,n)=>J([doc,loc,p,o,n]);
    const want=Object.keys(T).flatMap(d=>T[d].map(r=>key(d,r.file.slice(-8,-5),r.point,r.old,r.new))).sort(), have=MAIN.map(r=>key(r.doc,r.loc,pt(r),r.old,r.new)).sort();
    check('2. 稿的列數：AA_846 81、AA_847 83、AA_848 66；每一列的 who 是那一份的人、file 是 date_system/lines/Dxx.json、互動點開頭＝地點',Object.keys(DOCS).every(d=>T[d].length===DOCS[d][2]&&T[d].every(r=>r.who===DOCS[d][1]&&/^date_system\/lines\/D\d\d\.json$/.test(r.file)&&r.point.slice(0,3)===r.file.slice(-8,-5))),J(Object.keys(T).map(d=>T[d].length)));
    check('2. HAO2_1112 不是 late 的 230 格和稿一列對一格（哪一份、地點、互動點、old、new 都一樣；沒有重複）',new Set(want).size===230&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
    if(haveSrc){ const all=['AA_846','AA_847'].flatMap(d=>T[d].map(r=>[d,r]));
      const bad=all.filter(([d,r])=>{ const k=r.file.slice(-8,-5), x=MAIN.filter(q=>q.doc===d&&q.loc===k&&pt(q)===r.point&&q.old===r.old&&q.new===r.new); if(x.length!==1) return true; const ch=get(SRC[k].lines[r.who],x[0].path.replace(/\/reply\/0\/text$/,'')); return !(ch&&ch.t===r.option); });
      check('2. AA_846、AA_847 每一列的 option＝源稿那個選項的 t（那一格真的是那個選項的回話）；AA_848 的列沒有 option（再訪句）',bad.length===0&&T.AA_848.every(r=>r.option===undefined),J(bad.slice(0,3))); }
    /* late 8 格：新字寫在那一份稿 _meta.late_fix 裡（「…」括著）、互動點也寫在同一段；AA_842 D06.cafe 那一列的 new 也改了，其餘 7 格稿的 rows 還是上一版的 new（＝這一格的 old）*/
    const badL=LT.filter(r=>{ const f=String((M[r.doc]._meta||{}).late_fix||''); return !(f.includes('「'+r.new+'」')&&f.includes(pt(r))); });
    check('2. late 8 格的新字和互動點都寫在那一份稿（AA_842／AA_844／AA_845）的 _meta.late_fix',badL.length===0,J(badL.map(r=>[r.doc,pt(r),r.new])));
    const rowOf=r=>M[r.doc].rows.filter(x=>x.who===r.who&&x.point===pt(r)&&(x.new===r.new||x.new===r.old)), rn=LT.map(r=>[r.who+' '+pt(r),rowOf(r).length===1?(rowOf(r)[0].new===r.new?'new':'old'):'n'+rowOf(r).length]);
    check('2. late 8 格在稿的 rows：學姊 D06.cafe 那一列的 new 已經是新字；學姊 D20.trolley 沒有列（上一批沒動的格子）；其餘 6 格那一列還是上一版的字（新字只在 late_fix；已列給 AA）',rn.every(([k,v])=>v===(k==='heroine_05 D06.cafe'?'new':k==='heroine_05 D20.trolley'?'n0':'old')),J(rn));
    const zf=String((JSON.parse(show(SHA,SP+DOCS.AA_846[0]))._meta||{}).late_fix||'');
    check('2. 子晴 D06.cafe：AA_846 的 late_fix 寫「下次我請你吃滷味。」、那一列的 new 也是',zf.includes('D06.cafe')&&zf.includes('「下次我請你吃滷味。」')&&T.AA_846.some(r=>r.point==='D06.cafe'&&r.new==='下次我請你吃滷味。'),zf);
  } else console.log('（跳過第 2 項：讀不到 '+SHA+' 的 AA_842～AA_848，企劃線沒 fetch）');
  if(haveSrc){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 238 格不同、old／new 都照表',diff.length===238&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    const cnt={}; for(const [k,p] of diff){ const m=/^\/lines\/([^/]+)\/(.+)$/.exec(p); const kind=m?(RE_REPLY.test(m[2])?'reply':RE_REM.test(m[2])?'remember':'other'):'other'; const key=(m?m[1]:'?')+' '+kind; cnt[key]=(cnt[key]||0)+1; }
    check('3. 不同的格子：子晴 81、可昕 83、學姊 5、芷若 2、沛珊 1 格都是 first/choice/n/reply/0/text，語彤 66 格都是 remember/lines/n/text；以安 0 格、fx 0 格、選項的字 0 格',
      J(Object.entries(cnt).sort())===J(Object.entries({'heroine_04 reply':81,'kexin reply':83,'heroine_05 reply':5,'heroine_02 reply':2,'classmate_peishan reply':1,'heroine_03 remember':66}).sort()),J(cnt));
    check('3. 源稿用 src248 還原（拿掉 fx，各輪續改＋這 238 格）＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：238 格裡三格這一版 AA 又改了（子晴 D06.cafe「下次我請。」、可昕 D13.drink、D24.street）——那幾格現在認 HAO3_1112 的 new（上一版的字要＝這裡的 new）。舊期望：238 格都＝這一輪的 new */
  const later3=r=>{ const h=C.HAO3_1112.find(x=>x.who===r.who&&x.loc===r.loc&&x.path===r.path); return h&&h.old===r.new?h.new:r.new; }, LT3=R.filter(r=>later3(r)!==r.new);
  /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：238 格裡可昕的 16 格這一版 AA 又改了（不靠記帳）——那幾格現在認 KXNL_1112 的 new（上一版的字要＝這裡的字）。舊期望：只看 HAO3_1112（later3） */
  const later=r=>{ const v=later3(r), k=r.who==='kexin'?C.KXNL_1112.find(x=>x.loc===r.loc&&x.path===r.path):null; return k&&k.old===v?k.new:v; }, LTK=R.filter(r=>later(r)!==later3(r));
  check('4. 238 格裡可昕不靠記帳那一次又改過的 '+LTK.length+' 格都是可昕第一次選項的回話（KXNL_1112）',LTK.length===16&&LTK.every(r=>r.who==='kexin'&&/\/first\/choice\/\d+\/reply\/0\/text$/.test(r.path)),J(LTK.map(r=>r.loc+' '+r.path)));
  check('4. 238 格裡之後又改過的只有三格（子晴 D06.cafe、可昕 D13.drink、D24.street；HAO3_1112）',J(LT3.map(r=>r.who+' '+pt(r)).sort())===J(['heroine_04 D06.cafe','kexin D13.drink','kexin D24.street']),J(LT3.map(r=>r.who+' '+r.path)));
  const bad=R.filter(r=>get(NOW,gp(r))!==later(r)).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+later(r)+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 238 格＝稿的新字，一字不差（三格＝第四次重匯再改的字、可昕 16 格＝不靠記帳那一次再改的字）',bad.length===0,J(bad.slice(0,4)));
  const E=require('./ellipsis694.js'), g=R.filter(r=>r.game||E.strip(r.new)!==r.new);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0,J(g.map(r=>[r.new,r.game])));
  check('4. 那 238 格都是她自己說的（who＝那個人）',R.every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===r.who; })); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=R.map(gp).sort();
    { const H3=C.HAO3_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H3.includes(p)) diff.push(p); check('5. 之後第四次重匯（3cb2939d0）沛珊「今天」開頭 31 格、以安 D24.station、子晴 D06.cafe、可昕 D13.drink／D24.street 一共 35 格也換了字（date_src_sha.js HAO3_1112；逐格在 tests/hao3_dates_1112_unit.js；其中子晴、可昕那三格 HAO2_1112 也有，上面拿過了或留在這一輪）——這裡先拿掉再比',C.HAO3_1112.length===35&&H3.length===32,J(H3.length)); }   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const D8=C.D158_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!D8.includes(p)) diff.push(p); check('5. 之後 D158 重匯（f6aa917593，AA_860）可昕 45 格、沛珊 4 格一共 49 格也換了字（date_src_sha.js D158_1112；逐格在 tests/d158_dates_1112_unit.js）——這裡先拿掉再比',C.D158_1112.length===49&&D8.length===49,J(D8.length)); }   /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js；其中可昕這一輪也改過的那幾格留在這一輪）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===118,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 238 格不同（以安、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 238 格重匯以前＝稿的 old（子晴 D06.cafe＝was）',R.every(r=>a[gp(r)]===(r.was||r.old)),J(R.filter(r=>a[gp(r)]!==(r.was||r.old)).slice(0,3).map(r=>[gp(r),a[gp(r)],r.old])));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const b=leaves(NOW.loc,'',{}), cnt={}; for(const p of Object.keys(b)) if(typeof b[p]==='string') cnt[b[p]]=(cnt[b[p]]||0)+1;
  const left=[...new Set(R.map(r=>r.old))].filter(o=>cnt[o]).map(o=>[o,cnt[o]]);
  /* 同一句別的格子還有的（不是這一批的格子：AA 留著沒改的、別人的）——數目釘住，多了＝有格子沒換到 */
  /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：以安 D24.station 第一次選「坐一下。」只回「好。」的那一格這一版改了（AA_849 最後一列）。舊期望：'好。':12 */
  const WANT={'好。':11};   /* 12 處都是別的格子（別人的、AA 留著沒改的、不是第一次選項回話的）*/
  check('6. 238 句舊字都不在那一格了；整份裡還有同一句的只有 '+J(WANT)+'（別的格子，不是這一批的）',R.every(r=>get(NOW,gp(r))!==r.old)&&J(left.sort())===J(Object.entries(WANT).sort()),J(left)); }

// 7
{ const d3=read('src/date3d.js'), sp=read('src/data/she_pays.js'), a5=read('src/aa524_3d.js');
  const hit=(t,o)=>t.includes("'"+o+"'")||t.includes('"'+o+'"');
  const left=R.filter(r=>hit(d3,r.old)||(r.old!=='好。'&&hit(a5,r.old))).map(r=>r.loc+' '+r.old)   /* aa524_3d.js 的 '好。' 是私訊的回覆（z3 goR），不是約會的句子 */, SPD=vm.runInNewContext(sp+';SHE_PAYS_DATA'), keys=J([SPD.pays,SPD.split]), left2=R.filter(r=>keys.includes(J(r.old))).map(r=>r.who+' '+r.loc+' '+r.old);
  check('7. src/date3d.js、src/aa524_3d.js 照整句認句子的表裡沒有留著這 238 句的舊字',left.length===0,J(left));
  check('7. src/data/she_pays.js（S.SHE_PAYS、S.SPLIT）裡沒有留著這 238 句的舊字',left2.length===0,J(left2));
  const bad=[];
  for(const part of ['pays','split']) for(const who of Object.keys(SPD[part]||{})) for(const pid of Object.keys(SPD[part][who])) for(const t of SPD[part][who][pid]){
    const H=get(NOW,'/loc/'+pid.slice(0,3)+'/lines/'+who+'/hotspots/'+pid), n=Object.values(leaves(H||{},'',{})).filter(v=>v===t).length; if(n!==1) bad.push([part,who,pid,t,n]); }
  check('7. she_pays.js 的每一句（她請、平分）都還在遊戲裡那個互動點底下剛好一處',bad.length===0,J(bad));
  /* 舊期望（tests/hao_dates_1112_unit.js 第 7 項，41f77eab53 那一輪）：cells812 有 was 的三句（REWORD：語彤 D12.pier、學姊 D22.fish 兩句）。AA 在 d7d818f8a8 把 AA_812 同步成新字，REWORD 清空 */
  const rw=(SPD.cells812||[]).filter(c=>c.was), tool=read('tools/date/import_she_pays.py');
  check('7. REWORD 清空了：tools/date/import_she_pays.py 的 REWORD = {}、she_pays.js 的 cells812 沒有 was；來源寫 AA_812@'+C.D158_1112_PREV,/^REWORD = \{\}$/m.test(tool)&&rw.length===0&&SPD.src.endsWith('AA_812_date_pays_promises.json@'+C.D158_1112_PREV),J(rw));   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：she_pays.js 的來源跟著白名單換 3cb2939d0（名單沒動）。舊期望：來源寫 AA_812@d7d818f8a8（SHA） */   /* 2026-11-12（D158 約會台詞重匯 f6aa917593）：AA_812 沒改、she_pays.js 的來源照舊寫 AA_812@3cb2939d0（＝C.D158_1112_PREV）。舊期望：來源寫 AA_812@C.ALLOW_SHA（那時候就是 3cb2939d0） */
  const a812=show(SHA,SP+'AA_812_date_pays_promises.json');
  if(a812){ const A=JSON.parse(a812), flat=X=>Object.keys(X).flatMap(w=>Object.keys(X[w]).flatMap(p=>X[w][p].map(t=>J([w,p,t])))).sort();
    const c8=(SPD.cells812||[]), cp8=c8.filter(c=>c.kind==='pays').map(c=>J([c.who,c.pid,c.text])).sort(), cs8=c8.filter(c=>c.kind==='split').map(c=>J([c.who,c.pid,c.text])).sort();
    check('7. she_pays.js 和稿 AA_812@'+SHA+' 一字不差：cells812 的她請 '+cp8.length+' 句＝SHE_PAYS_add、平分 '+cs8.length+' 句＝SPLIT＝SPD.split；她請的每一句都在 SPD.pays 或 date3d.js 手寫的以安三格（dup）',
      J(cp8)===J(flat(A.SHE_PAYS_add))&&J(cs8)===J(flat(A.SPLIT))&&J(flat(SPD.split))===J(cs8)&&c8.filter(c=>c.kind==='pays').every(c=>c.dup||((SPD.pays[c.who]||{})[c.pid]||[]).includes(c.text)),J(flat(A.SPLIT).filter(x=>!cs8.includes(x))));
    const five=[['SHE_PAYS_add','heroine_03','D12.pier','盡頭有一個賣咖啡的貨櫃，我請你。'],['SPLIT','heroine_04','D32.stall','那甜湯我請你。'],['SPLIT','heroine_05','D22.fish','飯我請，飲料你請。'],['SPLIT','heroine_05','D22.fish','你堅持的話。'],['SPLIT','kexin','D31.egg','那紅茶我請。']];
    const o812=show('633b7f7d6',SP+'AA_812_date_pays_promises.json');
    check('7. AA_812 這一版同步的五句（語彤 D12.pier 她請；子晴 D32.stall、學姊 D22.fish 兩句、可昕 D31.egg 平分）都在稿、都在遊戲那個互動點第一次選項的回話',five.every(([part,w,p,t])=>((A[part][w]||{})[p]||[]).includes(t)&&((get(NOW,'/loc/'+p.slice(0,3)+'/lines/'+w+'/hotspots/'+p+'/first/choice')||[]).some(c=>c.reply[0].text===t))));
    if(o812){ const B=JSON.parse(o812), d=['SHE_PAYS_add','SPLIT'].flatMap(part=>{ const x=new Set(flat(B[part])), y=new Set(flat(A[part])); return [...y].filter(k=>!x.has(k)).map(k=>part+k); });
      check('7. AA_812 '+SHA+' 和 633b7f7d6 比：她請／平分名單只有這五句不同（各換一句）、path_rows 沒動',d.length===5&&J(d.sort())===J(five.map(([part,w,p,t])=>part+J([w,p,t])).sort())&&J(A.path_rows)===J(B.path_rows),J(d)); }
  } else console.log('（跳過第 7 項的對稿：讀不到 '+SHA+' 的 AA_812）');
  /* 拿選項的字當 key 的：S.PICK_FLAG（date3d.js）三筆、aa524_3d.js rem 兩筆——這一批沒動選項的字，選項都還在；REMEMBER_IF、rem 指到的互動點都還有 remember */
  const PF=[['D06','heroine_04','D06.cafe','「我請妳。」'],['D15','heroine_04','D15.store','「布丁不行。」'],['D05','classmate_peishan','D05.cafe','「我請妳。」'],['D04','heroine_02','D04.snack','「下次換我請。」'],['D10','heroine_03','D10.boat','「我請。」']];
  const pfBad=PF.filter(([l,w,p,t])=>!((d3+a5).includes("pid:'"+p+"'")&&(d3+a5).includes("'"+t+"'")&&(get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/first/choice')||[]).some(c=>c.t===t)&&get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/remember')));
  check('7. 拿選項的字當 key 的五筆（PICK_FLAG 子晴 D06.cafe、D15.store、沛珊 D05.cafe；aa524 rem 芷若 D04.snack、語彤 D10.boat）：選項的字都還在、那個互動點都還有 remember',pfBad.length===0,J(pfBad));
  const y9=get(NOW,'/loc/D10/lines/heroine_03/hotspots/D10.boat/remember/lines');
  check('7. 語彤 D10.boat 的 remember 這一批沒動（不在 AA_848 的 66 列）：還是「上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。」（她請名單那一句；aa524 y9 多的旁白「（這次她先去付了錢。）」接得上）',
    !R.some(r=>r.who==='heroine_03'&&pt(r)==='D10.boat')&&y9&&y9.length===1&&y9[0].text==='上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。'&&a5.includes("pid:'D10.boat',pick:'「我請。」',x:{narr:'（這次她先去付了錢。）'}")&&((SPD.pays.heroine_03||{})['D10.boat']||[]).includes(y9[0].text),J(y9)); }

// 8
{ const tool=read('tools/date/import_date_lines.py'), cur=get(NOW,'/loc/D06/lines/heroine_04/hotspots/D06.cafe/first/choice/1/reply/0/text');
  /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：AA 把 AA_812 path_rows 第一列刪掉、源稿那一格直接寫「下次我請。」，SUPER812 例外拿掉（空的）。
     舊期望：import_date_lines.py 的 SUPER812 只列這一格（原句「好。下次我請你吃滷味。」、現在「下次我請你吃滷味。」，AA_846 late_fix）；遊戲那一格＝「下次我請你吃滷味。」 */
  check('8. AA_812 path_rows 第一列（子晴 D06.cafe）AA 之後刪掉了：import_date_lines.py 的 SUPER812 是空的；遊戲那一格＝「下次我請。」（HAO3_1112 那一列的 new；這一批匯進來的時候是「下次我請你吃滷味。」＝那一列的 old）',
    /^SUPER812 = \{\}$/m.test(tool)&&cur==='下次我請。'&&C.HAO3_1112.some(r=>r.who==='heroine_04'&&r.loc==='D06'&&r.old==='下次我請你吃滷味。'&&r.new===cur),cur);
  const zq=get(NOW,'/loc/D06/lines/heroine_04/hotspots/D06.cafe/remember/lines');
  check('8. 子晴 D06.cafe 再訪句照舊（AA_812 改稿紀錄那一格）：「這家我來過兩次了。這次我請，你不要算。」',zq&&zq.length===1&&zq[0].text==='這家我來過兩次了。這次我請，你不要算。',J(zq)); }

// 9
{ const hao=R.filter(r=>['AA_846','AA_847'].includes(r.doc)&&!r.late), a=hao.filter(r=>/^好[。，！]/.test(r.new)), b=R.filter(r=>r.doc==='AA_848'&&/^上次/.test(r.new));
  check('9. 子晴、可昕 164 句：舊字都是「好」開頭、新字沒有「好。／好，／好！」開頭的',hao.length===164&&hao.every(r=>/^（[^）]*）好|^好/.test(r.old))&&a.length===0,J(a.map(r=>r.new).concat(hao.filter(r=>!/^（[^）]*）好|^好/.test(r.old)).map(r=>r.old))));
  check('9. 語彤 66 句：舊字都是「上次」開頭、新字沒有「上次」開頭的',R.filter(r=>r.doc==='AA_848').every(r=>/^上次/.test(r.old))&&b.length===0,J(b.map(r=>r.new))); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
