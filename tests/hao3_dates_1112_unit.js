// DLG-FULL-REVIEW-1110／X324 約會台詞第四次重匯（AA_849＋AA_846／AA_847 三格）：35 格，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 11:28 交付，企劃線 3cb2939d0：
//   AA_849_ps_today.json 沛珊（classmate_peishan）31 列：「今天…」開頭的交往到達句（arrive.dating[0].lines[0].text）24 格、第一次約會的結尾（closing.first.lines[0].text）7 格；
//   同一份稿最後一列：以安（heroine_01）D24.station 第一次選「坐一下。」的回話（hotspots.D24.station.first.choice[1].reply[0].text）；
//   AA_846 子晴 D06.cafe 第一次選「我請妳。」的回話改成「下次我請。」；AA_847 可昕 D13.drink、D24.street 第一次選項的回話改字。
//   白名單 33 筆改讀 3cb2939d0（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有 STALE，各人跳過的列數和上一次一樣。
//   AA_812 白名單換 3cb2939d0：path_rows 子晴 D06.cafe 那一列 AA 刪掉了（_meta.aa_c_1112），剩語彤 D10.boat 一列——import_date_lines.py 的 SUPER812 例外拿掉（空的）、
//   「path_rows 應該是兩列」改成一列；AA_812 那一步照舊換 6 格（改稿紀錄 5 格＋path_rows 1 列；上一次是 path_rows 2 列跳過 1 列）。她請／平分名單沒動，src/data/she_pays.js 只換來源的 SHA。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（3cb2939d0）、approved；C.HAO3_1112_PREV（d7d818f8a8）在 history；AA_812 那一筆也是 3cb2939d0（d7d818f8a8 在 history）；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 HAO3_1112（35 格）：AA_849 的 32 列一列對一格（檔、who、old、new；以安那一列的 option＝那個選項的 t）；子晴、可昕三格＝AA_846／AA_847 那一列的 new
//   3. 源稿 3cb2939d0 和上一版 d7d818f8a8 逐格比（33 個檔、每個人、每一格、含 fx）：剛好這 35 格不同
//   4. 遊戲（src/data/date_lines.js）那 35 格＝稿的新字，一字不差
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 35 格不同；那 35 格重匯以前＝稿的 old
//   6. 舊字不在那一格了
//   7. 照「整句一字不差」認句子的表：src/date3d.js、src/aa524_3d.js、src/data/she_pays.js 沒有留著舊字；she_pays.js＝AA_812@3cb2939d0 的 SHE_PAYS_add／SPLIT、每一句都在遊戲那個互動點底下剛好一處；
//      AA_812 3cb2939d0 和 d7d818f8a8 比：SHE_PAYS_add／SPLIT 沒動、path_rows 只少子晴 D06.cafe 那一列；拿選項的字當 key 的選項都還在
//   8. SUPER812 拿掉了（空的）；子晴 D06.cafe 第一次的回話＝「下次我請。」、再訪句照舊
//   9. 沛珊 31 句：舊字都是「今天」開頭、新字沒有「今天」開頭的
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/hao3_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', SHA='3cb2939d0', BASE='ebfb849c03', PREV=C.HAO3_1112_PREV;   /* SHA＝這一批的那一版（以後白名單再換版也還是比這一版）；BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.HAO3_1112;
const PS='classmate_peishan', AN='heroine_01', ZQ='heroine_04', KX='kexin';
const RE_REPLY=/^hotspots\/(D\d\d\.\w+)\/first\/choice\/(\d+)\/reply\/0\/text$/, RE_ARR=/^arrive\/dating\/0\/lines\/0\/text$/, RE_CLO=/^closing\/first\/lines\/0\/text$/;
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path, pt=r=>(RE_REPLY.exec(r.path)||[])[1];
const N=R.length;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&e[0].approvedBy.includes('AA-C 11-12 11:28 交付 3cb2939d0')&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有「AA-C 11-12 11:28 交付 3cb2939d0」；'+PREV+' 在 history',C.ALLOW_SHA==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV===SHA&&PREV==='d7d818f8a8'&&bad.length===0,J(bad));   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */
  const e=allow.filter(x=>x.path===SP+'AA_812_date_pays_promises.json');
  check('1. 白名單 AA_812 那一筆也是 '+SHA+'（path_rows 少一列）、approved；d7d818f8a8、633b7f7d6、f1fab0ec6 在 history',e.length===1&&e[0].sha===SHA&&e[0].status==='approved'&&['d7d818f8a8','633b7f7d6','f1fab0ec6'].every(s=>(e[0].history||[]).some(h=>h.sha===s)),J(e.map(x=>x.sha)));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身（不用讀稿）
{ const n={}; for(const r of R){ const k=r.who+' '+(RE_ARR.test(r.path)?'arrive':RE_CLO.test(r.path)?'closing':RE_REPLY.test(r.path)?'reply':'other'); n[k]=(n[k]||0)+1; }
  check('HAO3_1112 一共 35 格：沛珊交往到達句 24、第一次約會結尾 7，以安 1、子晴 1、可昕 2 格第一次選項的回話；沒有同一格、old≠new、沒有 was／game',
    N===35&&J(Object.entries(n).sort())===J(Object.entries({'classmate_peishan arrive':24,'classmate_peishan closing':7,'heroine_01 reply':1,'heroine_04 reply':1,'kexin reply':2}).sort())&&new Set(R.map(gp)).size===35&&R.every(r=>r.old&&r.new&&r.old!==r.new&&!r.was&&!r.game),J(n));
  check('HAO3_1112 每一列的 doc：沛珊、以安＝AA_849，子晴＝AA_846，可昕＝AA_847；回話那四格的互動點開頭＝地點（以安 D24.station、子晴 D06.cafe、可昕 D13.drink、D24.street）',
    R.every(r=>r.doc===({[PS]:'AA_849',[AN]:'AA_849',[ZQ]:'AA_846',[KX]:'AA_847'})[r.who])&&J(R.filter(r=>pt(r)).map(r=>r.who+' '+pt(r)).sort())===J(['heroine_01 D24.station','heroine_04 D06.cafe','kexin D13.drink','kexin D24.street'])&&R.filter(r=>pt(r)).every(r=>pt(r).slice(0,3)===r.loc));
  const H2=C.HAO2_1112, both=R.filter(r=>H2.some(h=>h.who===r.who&&h.loc===r.loc&&h.path===r.path)), okOld=both.every(r=>H2.find(h=>h.who===r.who&&h.loc===r.loc&&h.path===r.path).new===r.old);
  check('HAO2_1112（上一批）也改過的只有三格：子晴 D06.cafe、可昕 D13.drink、D24.street——old＝HAO2_1112 那一列的 new（兩輪都改過）',J(both.map(r=>r.who+' '+pt(r)).sort())===J(['heroine_04 D06.cafe','kexin D13.drink','kexin D24.street'])&&okOld,J(both.map(gp))); }

// 2、3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLD).length===33;
  const t849=show(SHA,SP+'AA_849_ps_today.json'), t846=show(SHA,SP+'AA_846_zq_hao_replies.json'), t847=show(SHA,SP+'AA_847_kx_hao_replies.json');
  if(t849&&t846&&t847){ const A=JSON.parse(t849), rows=A.rows, key=(who,loc,o,n)=>J([who,loc,o,n]);
    check('2. AA_849 一共 32 列：沛珊 31 列（沒有 point）＋最後一列以安 D24.station（option「坐一下。」）；file 都是 date_system/lines/Dxx.json；status 寫已套源稿',
      rows.length===32&&rows.filter(r=>r.who===PS&&r.point===undefined).length===31&&rows[31].who===AN&&rows[31].point==='D24.station'&&rows[31].option==='「坐一下。」'&&rows.every(r=>/^date_system\/lines\/D\d\d\.json$/.test(r.file))&&/已套源稿/.test(A._meta.status),A._meta.status);
    const want=rows.map(r=>key(r.who,r.file.slice(-8,-5),r.old,r.new)).sort(), have=R.filter(r=>r.doc==='AA_849').map(r=>key(r.who,r.loc,r.old,r.new)).sort();
    check('2. HAO3_1112 的 AA_849 那 32 格和稿一列對一格（who、地點、old、new 都一樣；沒有重複）',new Set(want).size===32&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
    if(haveSrc){ const an=R.find(r=>r.who===AN), ch=get(SRC.D24.lines[AN],an.path.replace(/\/reply\/0\/text$/,''));
      check('2. 以安那一列的 option＝源稿那個選項的 t（那一格真的是「坐一下。」的回話）',!!ch&&ch.t===rows[31].option,J(ch)); }
    const T={AA_846:JSON.parse(t846).rows,AA_847:JSON.parse(t847).rows}, three=R.filter(r=>r.doc!=='AA_849');
    const bad=three.filter(r=>{ const x=T[r.doc].filter(q=>q.who===r.who&&q.point===pt(r)&&q.new===r.new); if(x.length!==1) return true; if(!haveSrc) return false; const ch=get(SRC[r.loc].lines[r.who],r.path.replace(/\/reply\/0\/text$/,'')); return !(ch&&ch.t===x[0].option); });
    check('2. 子晴 D06.cafe、可昕 D13.drink、D24.street：AA_846／AA_847 那個互動點剛好一列的 new＝這一格的新字、option＝源稿那個選項的 t（稿那一列的 old 還是更早的「好」開頭那一句）',three.length===3&&bad.length===0,J(bad));
  } else console.log('（跳過第 2 項：讀不到 '+SHA+' 的 AA_846／AA_847／AA_849，企劃線沒 fetch）');
  if(haveSrc){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 35 格不同、old／new 都照表（語彤、學姊、芷若 0 格、fx 0 格、選項的字 0 格）',diff.length===35&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原（拿掉 fx，各輪續改＋這 35 格）＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==r.new).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 35 格＝稿的新字，一字不差',bad.length===0,J(bad.slice(0,4)));
  const E=require('./ellipsis694.js'), g=R.filter(r=>E.strip(r.new)!==r.new);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0,J(g.map(r=>r.new)));
  check('4. 那 35 格都是她自己說的（who＝那個人）',R.every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===r.who; })); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */) diff.push(p);
    const want=R.map(gp).sort();
    { const D8=C.D158_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!D8.includes(p)) diff.push(p); check('5. 之後 D158 重匯（f6aa917593，AA_860）可昕 45 格、沛珊 4 格一共 49 格也換了字（date_src_sha.js D158_1112；逐格在 tests/d158_dates_1112_unit.js）——這裡先拿掉再比',C.D158_1112.length===49&&D8.length===49,J(D8.length)); }   /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===134,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 35 格不同（fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 35 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old),J(R.filter(r=>a[gp(r)]!==r.old).slice(0,3).map(r=>[gp(r),a[gp(r)],r.old])));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const b=leaves(NOW.loc,'',{}), cnt={}; for(const p of Object.keys(b)) if(typeof b[p]==='string') cnt[b[p]]=(cnt[b[p]]||0)+1;
  const left=[...new Set(R.map(r=>r.old))].filter(o=>cnt[o]).map(o=>[o,cnt[o]]);
  /* 同一句別的格子還有的（不是這一批的格子）——數目釘住，多了＝有格子沒換到。上一次（tests/hao2_dates_1112_unit.js 第 6 項）「好。」12 處，這一次以安 D24.station 那一格換掉＝11 處 */
  const WANT={'好。':11};
  check('6. 35 句舊字都不在那一格了；整份裡還有同一句的只有 '+J(WANT)+'（別的格子，不是這一批的）',R.every(r=>get(NOW,gp(r))!==r.old)&&J(left.sort())===J(Object.entries(WANT).sort()),J(left)); }

// 7
{ const d3=read('src/date3d.js'), sp=read('src/data/she_pays.js'), a5=read('src/aa524_3d.js');
  const hit=(t,o)=>t.includes("'"+o+"'")||t.includes('"'+o+'"');
  const left=R.filter(r=>hit(d3,r.old)||(r.old!=='好。'&&hit(a5,r.old))).map(r=>r.loc+' '+r.old)   /* aa524_3d.js 的 '好。' 是私訊的回覆（z3 goR），不是約會的句子 */, SPD=vm.runInNewContext(sp+';SHE_PAYS_DATA'), keys=J([SPD.pays,SPD.split]), left2=R.filter(r=>keys.includes(J(r.old))).map(r=>r.who+' '+r.loc+' '+r.old);
  check('7. src/date3d.js、src/aa524_3d.js 照整句認句子的表裡沒有留著這 35 句的舊字',left.length===0,J(left));
  check('7. src/data/she_pays.js（S.SHE_PAYS、S.SPLIT）裡沒有留著這 35 句的舊字、也沒有這 35 句的新字（這一批沒有她請客的格）',left2.length===0&&R.every(r=>!keys.includes(J(r.new))),J(left2));
  const bad=[];
  for(const part of ['pays','split']) for(const who of Object.keys(SPD[part]||{})) for(const pid of Object.keys(SPD[part][who])) for(const t of SPD[part][who][pid]){
    const H=get(NOW,'/loc/'+pid.slice(0,3)+'/lines/'+who+'/hotspots/'+pid), n=Object.values(leaves(H||{},'',{})).filter(v=>v===t).length; if(n!==1) bad.push([part,who,pid,t,n]); }
  check('7. she_pays.js 的每一句（她請、平分）都還在遊戲裡那個互動點底下剛好一處',bad.length===0,J(bad));
  const rw=(SPD.cells812||[]).filter(c=>c.was), tool=read('tools/date/import_she_pays.py');
  check('7. REWORD 照舊是空的、she_pays.js 的 cells812 沒有 was；來源寫 AA_812@'+SHA,/^REWORD = \{\}$/m.test(tool)&&rw.length===0&&SPD.src.endsWith('AA_812_date_pays_promises.json@'+SHA),J(rw));
  const a812=show(SHA,SP+'AA_812_date_pays_promises.json'), o812=show(PREV,SP+'AA_812_date_pays_promises.json'), osp=show(BASE,'src/data/she_pays.js');
  if(a812&&o812){ const A=JSON.parse(a812), B=JSON.parse(o812), flat=X=>Object.keys(X).flatMap(w=>Object.keys(X[w]).flatMap(p=>X[w][p].map(t=>J([w,p,t])))).sort();
    const c8=(SPD.cells812||[]), cp8=c8.filter(c=>c.kind==='pays').map(c=>J([c.who,c.pid,c.text])).sort(), cs8=c8.filter(c=>c.kind==='split').map(c=>J([c.who,c.pid,c.text])).sort();
    check('7. she_pays.js 和稿 AA_812@'+SHA+' 一字不差：cells812 的她請 '+cp8.length+' 句＝SHE_PAYS_add、平分 '+cs8.length+' 句＝SPLIT',J(cp8)===J(flat(A.SHE_PAYS_add))&&J(cs8)===J(flat(A.SPLIT))&&J(flat(SPD.split))===J(cs8));
    check('7. AA_812 '+SHA+' 和 '+PREV+' 比：SHE_PAYS_add／SPLIT 沒動；path_rows 只少子晴 D06.cafe 那一列（2 列 → 1 列，剩語彤 D10.boat remember）',
      J(A.SHE_PAYS_add)===J(B.SHE_PAYS_add)&&J(A.SPLIT)===J(B.SPLIT)&&B.path_rows.length===2&&A.path_rows.length===1&&B.path_rows[0].path==="loc.D06.lines.heroine_04.hotspots['D06.cafe'].first.choice[1].reply[0]"&&J(A.path_rows[0])===J(B.path_rows[1])&&A.path_rows[0].path==="loc.D10.lines.heroine_03.hotspots['D10.boat'].remember.lines[0]"&&typeof A._meta.aa_c_1112==='string'&&A._meta.aa_c_1112.includes('D06.cafe'),J(A.path_rows.map(r=>r.path)));
  } else console.log('（跳過第 7 項的對稿：讀不到 '+SHA+'／'+PREV+' 的 AA_812）');
  if(osp){ const strip=t=>t.split('@'+PREV).join('@'+SHA); check('7. src/data/she_pays.js 和重匯以前（'+BASE+'）比：只換了來源寫的 AA_812 的 SHA',strip(osp)===sp&&osp!==sp); } else console.log('（跳過：讀不到 '+BASE+' 的 src/data/she_pays.js）');
  /* 拿選項的字當 key 的：S.PICK_FLAG（date3d.js）三筆、aa524_3d.js rem 兩筆——這一批沒動選項的字，選項都還在；REMEMBER_IF、rem 指到的互動點都還有 remember */
  const PF=[['D06','heroine_04','D06.cafe','「我請妳。」'],['D15','heroine_04','D15.store','「布丁不行。」'],['D05','classmate_peishan','D05.cafe','「我請妳。」'],['D04','heroine_02','D04.snack','「下次換我請。」'],['D10','heroine_03','D10.boat','「我請。」']];
  const pfBad=PF.filter(([l,w,p,t])=>!((d3+a5).includes("pid:'"+p+"'")&&(d3+a5).includes("'"+t+"'")&&(get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/first/choice')||[]).some(c=>c.t===t)&&get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/remember')));
  check('7. 拿選項的字當 key 的五筆（PICK_FLAG 子晴 D06.cafe、D15.store、沛珊 D05.cafe；aa524 rem 芷若 D04.snack、語彤 D10.boat）：選項的字都還在、那個互動點都還有 remember',pfBad.length===0,J(pfBad)); }

// 8
{ const tool=read('tools/date/import_date_lines.py'), cur=get(NOW,'/loc/D06/lines/heroine_04/hotspots/D06.cafe/first/choice/1/reply/0/text');
  /* 舊期望（tests/hao2_dates_1112_unit.js 第 8 項，d7d818f8a8 那一輪）：SUPER812 列著子晴 D06.cafe 那一格、遊戲那一格＝「下次我請你吃滷味。」。AA 在 3cb2939d0 把 path_rows 那一列刪掉、源稿改成「下次我請。」 */
  check('8. import_date_lines.py 的 SUPER812 拿掉了（SUPER812 = {}）、path_rows 認一列；子晴 D06.cafe 第一次選「我請妳。」的回話＝「下次我請。」（源稿的字，不是 path_rows 換的）',
    /^SUPER812 = \{\}$/m.test(tool)&&/len\(R812\) != 1 or/.test(tool)&&!tool.includes("SUPER812 = {\"loc.D06")&&cur==='下次我請。',cur);
  const zq=get(NOW,'/loc/D06/lines/heroine_04/hotspots/D06.cafe/remember/lines');
  check('8. 子晴 D06.cafe 再訪句照舊（AA_812 改稿紀錄那一格）：「這家我來過兩次了。這次我請，你不要算。」',zq&&zq.length===1&&zq[0].text==='這家我來過兩次了。這次我請，你不要算。',J(zq));
  const y9=get(NOW,'/loc/D10/lines/heroine_03/hotspots/D10.boat/remember/lines');
  check('8. path_rows 剩的那一列（語彤 D10.boat remember）照舊在：「上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。」',y9&&y9.length===1&&y9[0].text==='上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。',J(y9)); }

// 9
{ const ps=R.filter(r=>r.who===PS), a=ps.filter(r=>/^今天/.test(r.new));
  check('9. 沛珊 31 句：舊字都是「今天」開頭、新字沒有「今天」開頭的',ps.length===31&&ps.every(r=>/^今天/.test(r.old))&&a.length===0,J(a.map(r=>r.new))); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
