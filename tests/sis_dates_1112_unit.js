// DLG-FULL-REVIEW-1110／X324 學姊續改第一、二批（AA_837＋AA_838）：約會台詞 78 格＋D01 交往到達多一套，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 定稿（BB_385、BB_386 第二意見採納），企劃線 a573a50dca：
//   AA_837_sis_today_gag.json 33 列（「今天不X／今天只X」同一個梗的回話和到達句）＋_meta.added 一句（D01 交往到達 arrive.dating 多一套輪流的）；
//   AA_838_sis_remember_last.json 45 列（remember 格「上次…」開頭）——AA 直接改源稿 date_system/lines/Dxx.json（30 個檔），只動學姊（heroine_05）的格子。
//   白名單 33 筆改讀 a573a50dca（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有 STALE，
//   學姊跳過的列 81→86：AA_598 逐句表第 11、30、41、45、57 列從「已經是新句」變成「原句對不到（那一格新稿重寫了）」（已經是新句 34→29、跳過 55→60），照規則跳過。
//   第三批 AA_839（events.js）還沒定稿，不在這裡。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（a573a50dca）、approved；C.SIS_1112_PREV（b22e4d1277）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 SIS_1112（78 格）和 AA_837 的 33 列、AA_838 的 45 列一列對一格（地點、old、new 都一樣；who 都是 heroine_05）；SIS_1112_ADD＝AA_837 的 _meta.added
//   3. 源稿 a573a50dca 和上一版 b22e4d1277 逐格比（33 個檔、每個人、每一格、含 fx）：只有學姊這 78 格不同、old／new 都照稿，另外 D01 交往到達多的那一套（3 格：tier、who、text）；別人 0 格
//   4. 遊戲（src/data/date_lines.js）那 78 格＝稿的新字，一字不差（沒有被 AA_694 規則拿掉刪節號的格子）；D01 交往到達現在兩套，第二套＝稿加的那一句
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 78 格＋多的那一套不同（別人的格子、fx、不分地點的短句、交通偏好零差異）
//   6. 舊字不在遊戲檔裡了
//   7. src/date3d.js 照「整句一字不差」認句子的表（S.SHE_PAYS 等）裡沒有留著這 78 句的舊字（留著＝那個效果不會再觸發）
//   8. 新字（78 格＋加的一句）沒有「幾件事／第三件／一，二，三，」這種數件數的說法（tests/sis_no_three_unit.js 的同一條規則；AA_398 永久規則）
//   9. 交往到達輪流：S.pickSet 照陣列長度輪（key＋'#'＋i 記最近用過的），多一套不用改程式——D01 第一次以後連去兩次，兩套各出一次
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/sis_dates_1112_unit.js
'use strict';
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', SIS='heroine_05', BASE='93ae1238b6', PREV=C.SIS_1112_PREV;   /* BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=M959.unmapDeep(DL(NOWT),'date_lines.js'), R=C.SIS_1112, ADD=C.SIS_1112_ADD;
const ADDP=ADD.flatMap(a=>Object.keys(leaves(a.set,'',{})).map(p=>[a.loc,a.path+'/'+a.index+p,get(a.set,p)]));   /* 多的那一套攤開成格子：[地點, path, 值] */

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；'+PREV+' 在 history',C.ALLOW_SHA==='b4dcd9bf9a'&&C.KX944_1113_PREV==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&C.KX932_1112_PREV==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&C.PS914_1112_PREV==='f561545f38'&&C.PS913_1112_PREV==='6221c8e80f'&&C.ZQ909_1112_PREV==='417c5cb9ce'&&C.ZR904_1112_PREV==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV==='3cb2939d0'&&C.HAO3_1112_PREV==='d7d818f8a8'&&C.HAO2_1112_PREV==='41f77eab53'&&C.HAO_1112_PREV==='a573a50dca'&&PREV==='b22e4d1277'&&bad.length===0,J(bad));   /* 2026-11-12（X324「好」開頭回話 AA_842～845@41f77eab53）：白名單再換 41f77eab53（只動學姊、語彤、沛珊、芷若第一次選項的回話 259 格，見 date_src_sha.js HAO_1112）；a573a50dca＝C.HAO_1112_PREV。舊期望：C.ALLOW_SHA==='a573a50dca' */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：白名單再換 d7d818f8a8（子晴 81、可昕 83 格選項回話、語彤 66 格再訪句、學姊 5／芷若 2／沛珊 1 格再改，共 238 格）；41f77eab53＝C.HAO2_1112_PREV。舊期望：C.ALLOW_SHA==='41f77eab53' */   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：白名單再換 3cb2939d0（沛珊「今天」開頭 31 格、以安 D24.station 1 格、子晴 D06.cafe 1 格、可昕 D13.drink／D24.street 2 格，共 35 格）；d7d818f8a8＝C.HAO3_1112_PREV。舊期望：C.ALLOW_SHA==='d7d818f8a8' */   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：白名單再換 417c5cb9ce（只動芷若 remember 58 格，逐格在 tests/zr904_dates_1112_unit.js）；5afc5c0e3＝C.ZR904_1112_PREV。舊期望：C.ALLOW_SHA==='5afc5c0e3' */   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f，date_src_sha.js ZQ909_1112）：白名單再換 6221c8e80f（只動子晴 8 格）；417c5cb9ce＝C.ZQ909_1112_PREV。舊期望：C.ALLOW_SHA==='417c5cb9ce' */   /* 2026-11-12（沛珊收尾 AA_913@f561545f38，date_src_sha.js PS913_1112）：白名單再換 f561545f38（只動沛珊 42 格）；6221c8e80f＝C.PS913_1112_PREV。舊期望：C.ALLOW_SHA==='6221c8e80f' */   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b，date_src_sha.js PS914_1112）：白名單再換 dce2f8c08b（只動沛珊 53 格）；f561545f38＝C.PS914_1112_PREV。舊期望：C.ALLOW_SHA==='f561545f38' */
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ const a=show(C.ALLOW_SHA,SP+'AA_837_sis_today_gag.json'), a2=show(C.ALLOW_SHA,SP+'AA_838_sis_remember_last.json');
  if(a&&a2){ const da=JSON.parse(a), ra=da.rows, rb=JSON.parse(a2).rows, key=(doc,loc,o,n)=>J([doc,loc,o,n]), want=[...ra.map(r=>key('AA_837',r.file.slice(-8,-5),r.old,r.new)),...rb.map(r=>key('AA_838',r.file.slice(-8,-5),r.old,r.new))].sort(), have=R.map(r=>key(r.doc,r.loc,r.old,r.new)).sort();
    check('2. AA_837 的 33 列、AA_838 的 45 列都是學姊的（who＝heroine_05）、都在 date_system/lines/Dxx.json；AA_838 都在 remember 格、舊字都是「上次」開頭',ra.length===33&&rb.length===45&&[...ra,...rb].every(r=>r.who===SIS&&/^date_system\/lines\/D\d\d\.json$/.test(r.file))&&R.filter(r=>r.doc==='AA_838').every(r=>/\/remember\/lines\/\d+\/text$/.test(r.path)&&r.old.startsWith('上次')),J([ra.length,rb.length]));
    check('2. SIS_1112（'+R.length+' 格）和稿一列對一格（地點、old、new 都一樣；沒有重複）',R.length===78&&new Set(have).size===78&&new Set(R.map(r=>r.loc+'/'+r.path)).size===78&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
    const ad=(da._meta||{}).added||[];
    check('2. AA_837 的 _meta.added 只有一句（D01 交往到達）＝SIS_1112_ADD',ad.length===1&&ADD.length===1&&ad[0].file==='date_system/lines/'+ADD[0].loc+'.json'&&ad[0].at===SIS+'.'+ADD[0].path.replace('/','.')&&ad[0].new===ADD[0].set.lines[0].text&&ADD[0].set.lines.length===1&&ADD[0].set.lines[0].who===SIS,J(ad));
  } else console.log('（跳過第 2 項：讀不到 '+C.ALLOW_SHA+' 的 AA_837／AA_838，企劃線沒 fetch）'); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.ALLOW_SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    /* 2026-11-12（X324「好」開頭回話 AA_842～845@41f77eab53）：ALLOW_SHA 那一版又多改了四個人 259 格（date_src_sha.js HAO_1112；逐格在 tests/hao_dates_1112_unit.js）——先用 unHao 還原成 a573a50dca 的字再和上一版比。舊寫法：直接拿 SRC[k] 比 */
    /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：ALLOW_SHA 那一版再多改 238 格（HAO2_1112）——先用 unHao2 還原成 41f77eab53 的字，再 unHao。舊寫法：只 unHao */
    /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：ALLOW_SHA 那一版再多改 35 格——先用 unHao3 還原成 d7d818f8a8 的字，再 unHao2、unHao。舊寫法：unHao2 → unHao */
    /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：ALLOW_SHA 那一版再多改 49 格（可昕、沛珊）——先用 unD158 還原成 3cb2939d0 的字，再 unHao3、unHao2、unHao。舊寫法：unHao3 → unHao2 → unHao */
    /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：ALLOW_SHA 那一版再多改可昕 137 格——先用 unKxnl 還原成 f6aa917593 的字，再 unD158、unHao3、unHao2、unHao。舊寫法：unD158 → unHao3 → unHao2 → unHao */
    /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：ALLOW_SHA 那一版再多改芷若 58 格——先用 unZr904 還原成 5afc5c0e3 的字，再 unKxnl 以下。舊寫法：unKxnl → unD158 → unHao3 → unHao2 → unHao */
    for(const k of LOCS){ SRC[k]=JSON.parse(J(SRC[k])); for(const w of C.KX944_WHO) C.unKx944(SRC[k].lines&&SRC[k].lines[w],w,k);   /* 2026-11-13（收尾批 b4dcd9bf9a AA_944／945／946）：再多改沛珊 31、可昕 23 格＋對齊 12 格，先用 unKx944 還原 */ C.unKx938(SRC[k].lines&&SRC[k].lines.kexin,'kexin',k);   /* 2026-11-13（收尾批 4539b2ebaf AA_938）：再多改可昕 5 格，先用 unKx938 還原 */ C.unKx932(SRC[k].lines&&SRC[k].lines.kexin,'kexin',k);   /* 2026-11-13（收尾批 e622a59148 AA_932）：再多改可昕 5 格，先用 unKx932 還原 */ for(const w of C.KX921_WHO) C.unKx921(SRC[k].lines&&SRC[k].lines[w],w,k);   /* 2026-11-12（第五批 6dbfe10d7e）：再多改六個人 118 格，先用 unKx921 還原 */ C.unPs914(SRC[k].lines&&SRC[k].lines.classmate_peishan,'classmate_peishan',k);   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b）：再多改沛珊 53 格，先用 unPs914 還原 */ C.unPs913(SRC[k].lines&&SRC[k].lines.classmate_peishan,'classmate_peishan',k);   /* 2026-11-12（沛珊收尾 AA_913@f561545f38）：再多改沛珊 42 格，先用 unPs913 還原 */ C.unZq909(SRC[k].lines&&SRC[k].lines.heroine_04,'heroine_04',k);   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f）：再多改子晴 8 格，先用 unZq909 還原 */ C.unZr904(SRC[k].lines&&SRC[k].lines.heroine_02,'heroine_02',k); C.unKxnl(SRC[k].lines&&SRC[k].lines.kexin,'kexin',k); for(const w of C.D158_WHO) C.unD158(SRC[k].lines&&SRC[k].lines[w],w,k); for(const w of C.HAO3_WHO) C.unHao3(SRC[k].lines&&SRC[k].lines[w],w,k); for(const w of C.HAO2_WHO) C.unHao2(SRC[k].lines&&SRC[k].lines[w],w,k); for(const w of C.HAO_WHO) C.unHao(SRC[k].lines&&SRC[k].lines[w],w,k); }
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=[...R.map(r=>J([r.loc,'/lines/'+SIS+'/'+r.path,r.old,r.new])),...ADDP.map(([k,p,v])=>J([k,'/lines/'+SIS+'/'+p,undefined,v]))].sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+C.ALLOW_SHA+'（第三次重匯 238 格、「好」開頭回話 259 格先還原＝'+C.HAO_1112_PREV+'）和上一版 '+PREV+' 逐格比（含 fx）：只有學姊 78 格不同、old／new 都照稿，加上 D01 交往到達多的一套（'+ADDP.length+' 格）；別人 0 格',diff.length===78+ADDP.length&&ADDP.length===3&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿拿掉 fx、用 src248 還原（可昕 72、以安 59、學姊 78 格＋多的一套）＝上一版拿掉 fx、還原同樣那幾格',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ /* 2026-11-12（X324「好」開頭回話 AA_842@41f77eab53）：78 格裡 D22.maple 第一次選「我們慢慢走。」的回話這一版又改了（拿掉開頭的「好。」）——那一格現在認 HAO_1112 的 new（上一版的字要＝這裡的 new）。舊期望：78 格都＝這一輪的 new */
  /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：78 格裡 D20.trolley 第一次選「現在不覺得了？」的回話這一版又改了（AA_842 late_fix「還是覺得。可是我想坐。」）——那一格現在認 HAO2_1112 的 new。舊期望：之後又改過的只有 D22.maple 一格 */
  const later=r=>{ let v=(r.game||r.new); const h=C.HAO_1112.find(x=>x.who===SIS&&x.loc===r.loc&&x.path===r.path); if(h&&h.old===v) v=h.new; const h2=C.HAO2_1112.find(x=>x.who===SIS&&x.loc===r.loc&&x.path===r.path); if(h2&&h2.old===v) v=h2.new; return v; };
  check('4. 78 格裡之後又改過的只有兩格（D20.trolley 那句回話，AA_842 late_fix；D22.maple 那句回話，AA_842）',J(R.filter(r=>later(r)!==(r.game||r.new)).map(r=>r.loc+'/'+r.path))===J(['D20/hotspots/D20.trolley/first/choice/1/reply/0/text','D22/hotspots/D22.maple/first/choice/0/reply/0/text']),J(R.filter(r=>later(r)!==(r.game||r.new)).map(r=>r.loc+'/'+r.path)));
  const bad=R.filter(r=>get(NOW.loc[r.loc].lines[SIS],r.path)!==later(r)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW.loc[r.loc].lines[SIS],r.path)+'」');
  check('4. 遊戲那 78 格＝稿的新字（D20.trolley、D22.maple 那兩格＝AA_842 再改的字）',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0&&R.every(r=>require('./ellipsis694.js').strip(r.new)===r.new)&&ADD.every(a=>require('./ellipsis694.js').strip(a.set.lines[0].text)===a.set.lines[0].text),J(g.map(r=>[r.new,r.game])));
  const d=get(NOW.loc.D01.lines[SIS],'arrive/dating');
  check('4. D01 交往到達現在兩套（都是 tier any、各一句）：第一套＝AA_837 改的字、第二套＝稿加的那一句',Array.isArray(d)&&d.length===2&&J(d[1])===J(ADD[0].set)&&d[0].tier==='any'&&d[0].lines.length===1&&d[0].lines[0].text==='（她把手伸過來）走吧。',J(d)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */&&!require('./date_src_sha.js').SHORT921_1112.some(r=>r.p===p)/* （CANON-NO-ECON-1112 第五批：照 AA_921 §3-1 換字）可昕不分地點的短句七格 */) diff.push(p);
    const want=[...R.map(r=>'/loc/'+r.loc+'/lines/'+SIS+'/'+r.path),...ADDP.map(([k,p])=>'/loc/'+k+'/lines/'+SIS+'/'+p)].sort();
    { const HAOP=C.HAO_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!HAOP.includes(p)) diff.push(p); check('5. 之後 AA_842～845（41f77eab53）四個人第一次選項的回話 259 格也換了字（date_src_sha.js HAO_1112；逐格在 tests/hao_dates_1112_unit.js；D22.maple 那一格兩輪都改、留在這一輪的 78 格裡）——這裡先拿掉再比',HAOP.length===258&&HAOP.every(p=>all.includes(p)),J(HAOP.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324「好」開頭回話）：舊期望是整份只差這 78 格＋多的一套 */
    { const X=new Set([...C.HAO_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path),...want]), H2=C.HAO2_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!X.has(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H2.includes(p)) diff.push(p); check('5. 之後第三次重匯（d7d818f8a8）子晴、可昕第一次選項的回話、語彤再訪句和 late 8 格一共 238 格也換了字（date_src_sha.js HAO2_1112；逐格在 tests/hao2_dates_1112_unit.js；其中 7 格 HAO_1112 也有，上面拿過了；學姊 D20.trolley 那一格這一輪的 78 格裡也有、留在這一輪）——這裡先拿掉再比',H2.length===230&&H2.every(p=>all.includes(p)),J(H2.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const H3=C.HAO3_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H3.includes(p)) diff.push(p); check('5. 之後第四次重匯（3cb2939d0）沛珊「今天」開頭 31 格、以安 D24.station、子晴 D06.cafe、可昕 D13.drink／D24.street 一共 35 格也換了字（date_src_sha.js HAO3_1112；逐格在 tests/hao3_dates_1112_unit.js；其中子晴、可昕那三格 HAO2_1112 也有，上面拿過了或留在這一輪）——這裡先拿掉再比',C.HAO3_1112.length===35&&H3.length===32,J(H3.length)); }   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const D8=C.D158_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!D8.includes(p)) diff.push(p); check('5. 之後 D158 重匯（f6aa917593，AA_860）可昕 45 格、沛珊 4 格一共 49 格也換了字（date_src_sha.js D158_1112；逐格在 tests/d158_dates_1112_unit.js）——這裡先拿掉再比',C.D158_1112.length===49&&D8.length===49,J(D8.length)); }   /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===118,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const ZN=C.ZR904_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_02/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!ZN.includes(p)) diff.push(p); check('5. 之後芷若再去一次那一次重匯（417c5cb9ce，AA_904）58 格也換了字（date_src_sha.js ZR904_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZR904_1112.length===58&&ZN.length===58,J(ZN.length)); }   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const QN=C.ZQ909_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_04/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!QN.includes(p)) diff.push(p); check('5. 之後子晴到達句那一次重匯（6221c8e80f，AA_909）8 格也換了字（date_src_sha.js ZQ909_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZQ909_1112.length===8&&QN.length===8,J(QN.length)); }   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const SN=C.PS913_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!SN.includes(p)) diff.push(p); check('5. 之後沛珊收尾那一次重匯（f561545f38，AA_913）42 格也換了字（date_src_sha.js PS913_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS913_1112.length===42&&SN.length===42,J(SN.length)); }   /* 2026-11-12（沛珊收尾 AA_913@f561545f38）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const S4=C.PS914_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!S4.includes(p)) diff.push(p); check('5. 之後沛珊再訪那一次重匯（dce2f8c08b，AA_914）53 格也換了字（date_src_sha.js PS914_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS914_1112.length===53&&(S4.length===53||S4.length===52)/* D21.street 那一格 D158_1112 也改過：前面那一層已經拿掉、或是這一輪的 want 就算 52 */,J(S4.length)); }   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K5=C.KX921_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+(r.gpath||r.path)).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!K5.includes(p)) diff.push(p); check('5. 之後第五批（6dbfe10d7e，AA_917／918 收尾、AA_921 可昕清句、AA_923 D09）118 格也換了字（date_src_sha.js KX921_1112）——這裡先拿掉再比',C.KX921_1112.length===118&&K5.length===117/* 可昕 D02 收尾那一格 D158_1112 也改過，前面那一層已經拿掉 */,J(K5.length)); }   /* 2026-11-12（CANON-NO-ECON-1112 第五批 6dbfe10d7e）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K6=C.KX932_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a6=diff.slice(); diff.length=0; for(const p of a6) if(!K6.includes(p)) diff.push(p); check('5. 之後收尾批（e622a59148，AA_932 可昕外校前提句）5 格也換了字（date_src_sha.js KX932_1112；逐格在 tests/kx932_dates_1113_unit.js）——這裡先拿掉再比',C.KX932_1112.length===5&&K6.length===5,J(K6.length)); }   /* 2026-11-13（CANON-NO-ECON-1112 收尾 e622a59148）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K7=C.KX938_1113.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a7=diff.slice(); diff.length=0; for(const p of a7) if(!K7.includes(p)) diff.push(p); check('5. 之後收尾批（4539b2ebaf，AA_938 可昕記帳口氣）5 格也換了字（date_src_sha.js KX938_1113；逐格在 tests/kx938_dates_1113_unit.js）——這裡先拿掉再比（'+K7.length+' 格）',K7.length<=5,J(K7)); }
    { const K8=C.KX944_1113.filter(r=>!r.align).map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a8=diff.slice(); diff.length=0; for(const p of a8) if(!K8.includes(p)) diff.push(p); check('5. 之後收尾批（b4dcd9bf9a，AA_944 沛珊「今天」開頭 31 格＋AA_945 可昕再訪 23 格）也換了字（date_src_sha.js KX944_1113；AA_946 對齊的 12 格遊戲沒變；逐格在 tests/kx944_dates_1113_unit.js）——這裡先拿掉再比（'+K8.length+' 格）',K8.length<=54,J(K8)); }
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 78 格＋多的一套 3 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 78 格重匯以前＝稿的 old；多的那一套重匯以前沒有',R.every(r=>a['/loc/'+r.loc+'/lines/'+SIS+'/'+r.path]===r.old)&&ADDP.every(([k,p])=>!(('/loc/'+k+'/lines/'+SIS+'/'+p) in a)));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const left=R.filter(r=>NOWT.includes(J(r.old))).map(r=>r.old);
  check('6. 78 句舊字都不在 date_lines.js 裡了',left.length===0,J(left.slice(0,4))); }

// 7
{ const d3=read('src/date3d.js'), left=R.filter(r=>d3.includes("'"+r.old+"'")||d3.includes('"'+r.old+'"')).map(r=>r.loc+' '+r.old);
  check('7. src/date3d.js 照整句認句子的表裡沒有留著這 78 句的舊字',left.length===0,J(left)); }

// 8
{ const RE=/[一兩二三四]件事|第三件|第三格|第三點|^[一二三]，/;   /* ＝tests/sis_no_three_unit.js 的 RE */
  const t=read('tests/sis_no_three_unit.js');
  const hit=[...R.map(r=>r.new),...ADD.map(a=>a.set.lines[0].text)].filter(s=>RE.test(s));
  check('8. 新字沒有數件數的說法（和 tests/sis_no_three_unit.js 同一條規則）',t.includes('const RE='+String(RE)+';')&&hit.length===0,J(hit)); }

// 9
{ const d3=read('src/date3d.js');
  check('9. S.arriveLine 交往中的到達句走 S.pickSet(G,id,A.dating,t,\'arrive.dating\')；S.pickSet 用 key＋\'#\'＋i 記最近用過的、照陣列長度輪',d3.includes("set=S.pickSet(G,id,A.dating,t,'arrive.dating')")&&d3.includes("(pool||[]).map((x,i)=>({x,k:key+'#'+i}))"));
  /* 把 S.pickSet 那一段原樣拿出來跑（不載整個遊戲）：setUsable 一律 true、S.mem 用一個假的、S.tierOf 回 'mid' */
  const i=d3.indexOf('S.pickSet=function'), j=d3.indexOf('return c.x; };',i);
  if(i>0&&j>i){ const S={}, m={recent:[]}; S.mem=()=>m; S.tierOf=()=>'mid'; const setUsable=()=>true;   // eslint-disable-line no-unused-vars
    eval(d3.slice(i,j+'return c.x; };'.length));
    const pool=get(NOW.loc.D01.lines[SIS],'arrive/dating'), got=[0,1,2,3].map(()=>S.pickSet({},SIS,pool,{locs:['D01']},'arrive.dating').lines[0].text);
    check('9. D01 交往到達連去四次：兩套輪流（第一套、第二套、第一套、第二套）',got[0]===pool[0].lines[0].text&&got[1]===pool[1].lines[0].text&&got[2]===got[0]&&got[3]===got[1],J(got));
  } else check('9. 找得到 S.pickSet',false); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
