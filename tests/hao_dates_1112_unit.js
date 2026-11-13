// DLG-FULL-REVIEW-1110／X324 約會選項回話「好」開頭那個模板（AA_842～AA_845）：四個人 259 格，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 10:02 定稿（BB_389～392 聽過），企劃線 41f77eab53：
//   AA_842_sis_hao_replies.json 學姊（heroine_05）80 列、AA_843_yt_hao_replies.json 語彤（heroine_03）48 列、
//   AA_844_ps_hao_replies.json 沛珊（classmate_peishan）43 列、AA_845_zr_hao_replies.json 芷若（heroine_02）88 列——AA 直接改源稿 date_system/lines/Dxx.json（32 個檔），
//   只動這四個人第一次選項的回話（hotspots.<互動點>.first.choice[i].reply[0].text）。子晴 AA_846 還沒套進源稿，不在這裡。
//   白名單 33 筆改讀 41f77eab53（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有 STALE，
//   學姊跳過的列 86→95：AA_598 逐句表第 19、33、44、46、55 列（原句是「好。…」開頭、那一格這次重寫了；換 4→1、已經是新句 29→27、跳過 60→65），
//   AA_694 第 3 節第 162、195、196、238 列（學姊的句子，新稿重寫了）；別人跳過的列和上次一樣。
//   照整句認句子的表跟著換：tools/date/import_she_pays.py 的 REWORD（語彤 D12.pier 她請、學姊 D22.fish 平分兩句）→ src/data/she_pays.js。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（41f77eab53）、approved；C.HAO_1112_PREV（a573a50dca）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 HAO_1112（259 格）和 AA_842～AA_845 的列一列對一格（檔、who、互動點、old、new 都一樣）；每份的列數 80／48／43／88、who 都對；稿的 option＝源稿那個選項的 t
//   3. 源稿 41f77eab53 和上一版 a573a50dca 逐格比（33 個檔、每個人、每一格、含 fx）：剛好這 259 格不同、old／new 都照稿；都在這四個人底下、都是 hotspots/*/first/choice/n/reply/0/text；別人 0 格
//   4. 遊戲（src/data/date_lines.js）那 259 格＝稿的新字，一字不差（沒有被 AA_694 規則改到的格子）
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 259 格不同（別人的格子、fx、不分地點的短句、交通偏好零差異）；那 259 格重匯以前＝稿的 old
//   6. 舊字不在那一格了（同一句別的格子還有的另外列：別人、沒改的格子）
//   7. src/date3d.js、src/data/she_pays.js 照「整句一字不差」認句子的表（S.SHE_PAYS、S.SPLIT 等）裡沒有留著這 259 句的舊字（留著＝那個效果不會再觸發）；
//      she_pays.js 的每一句都還在遊戲裡那個互動點底下剛好一處；REWORD 的三句＝這一批的 old→new
//   8. 新字沒有「幾件事／第三件／一，二，三，」這種數件數的說法（tests/sis_no_three_unit.js 的同一條規則；只查學姊的 80 句，那條規則是學姊的）
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/hao_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='c0a12c42e3', PREV=C.HAO_1112_PREV, HSHA=C.HAO2_1112_PREV;   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：白名單再換 d7d818f8a8——這一支的「源稿、稿」固定讀這一批的那一版 HSHA＝41f77eab53（之後 AA 再改的 238 格見 HAO2_1112、第 4、5 項）。舊寫法：都讀 C.ALLOW_SHA */   /* BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
const DOCS={AA_842:['AA_842_sis_hao_replies.json','heroine_05',80],AA_843:['AA_843_yt_hao_replies.json','heroine_03',48],AA_844:['AA_844_ps_hao_replies.json','classmate_peishan',43],AA_845:['AA_845_zr_hao_replies.json','heroine_02',88]};
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.HAO_1112, RE_PATH=/^hotspots\/(D\d\d\.\w+)\/first\/choice\/(\d+)\/reply\/0\/text$/;
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；'+PREV+' 在 history',C.ALLOW_SHA==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&C.PS914_1112_PREV==='f561545f38'&&C.PS913_1112_PREV==='6221c8e80f'&&C.ZQ909_1112_PREV==='417c5cb9ce'&&C.ZR904_1112_PREV==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV==='3cb2939d0'&&C.HAO3_1112_PREV==='d7d818f8a8'&&HSHA==='41f77eab53'&&PREV==='a573a50dca'&&bad.length===0&&LOCS.every(k=>(allow.find(x=>x.path===SP+'date_system/lines/'+k+'.json').history||[]).some(h=>h.sha===HSHA)),J(bad));   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：白名單再換 d7d818f8a8（子晴 81、可昕 83 格選項回話、語彤 66 格再訪句、學姊 5／芷若 2／沛珊 1 格再改，共 238 格）；41f77eab53＝C.HAO2_1112_PREV。舊期望：C.ALLOW_SHA==='41f77eab53' */   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：白名單再換 3cb2939d0（沛珊「今天」開頭 31 格、以安 D24.station 1 格、子晴 D06.cafe 1 格、可昕 D13.drink／D24.street 2 格，共 35 格）；d7d818f8a8＝C.HAO3_1112_PREV。舊期望：C.ALLOW_SHA==='d7d818f8a8' */   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：白名單再換 417c5cb9ce（只動芷若 remember 58 格，逐格在 tests/zr904_dates_1112_unit.js）；5afc5c0e3＝C.ZR904_1112_PREV。舊期望：C.ALLOW_SHA==='5afc5c0e3' */   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f，date_src_sha.js ZQ909_1112）：白名單再換 6221c8e80f（只動子晴 8 格）；417c5cb9ce＝C.ZQ909_1112_PREV。舊期望：C.ALLOW_SHA==='417c5cb9ce' */   /* 2026-11-12（沛珊收尾 AA_913@f561545f38，date_src_sha.js PS913_1112）：白名單再換 f561545f38（只動沛珊 42 格）；6221c8e80f＝C.PS913_1112_PREV。舊期望：C.ALLOW_SHA==='6221c8e80f' */   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b，date_src_sha.js PS914_1112）：白名單再換 dce2f8c08b（只動沛珊 53 格）；f561545f38＝C.PS914_1112_PREV。舊期望：C.ALLOW_SHA==='f561545f38' */
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身（不用讀稿）
{ const n={}; for(const r of R) n[r.doc]=(n[r.doc]||0)+1;
  check('HAO_1112 一共 259 格：AA_842 學姊 80、AA_843 語彤 48、AA_844 沛珊 43、AA_845 芷若 88；每一列的 who＝那一份的人；沒有同一格',R.length===259&&Object.keys(DOCS).every(d=>n[d]===DOCS[d][2])&&R.every(r=>DOCS[r.doc]&&DOCS[r.doc][1]===r.who)&&new Set(R.map(gp)).size===259,J(n));
  check('HAO_1112 每一格都是 hotspots/<互動點>/first/choice/n/reply/0/text，互動點開頭＝地點；old≠new',R.every(r=>{ const m=RE_PATH.exec(r.path); return m&&m[1].slice(0,3)===r.loc&&r.old!==r.new&&r.old&&r.new; }),J(R.filter(r=>!RE_PATH.test(r.path)).slice(0,3))); }

// 2、3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(HSHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLD).length===33;
  const T={}; for(const d of Object.keys(DOCS)){ const t=show(HSHA,SP+DOCS[d][0]); if(t) T[d]=JSON.parse(t).rows; }
  if(Object.keys(T).length===4){
    const key=(doc,loc,pt,o,n)=>J([doc,loc,pt,o,n]);
    const want=Object.keys(T).flatMap(d=>T[d].map(r=>key(d,r.file.slice(-8,-5),r.point,r.old,r.new))).sort(), have=R.map(r=>key(r.doc,r.loc,RE_PATH.exec(r.path)[1],r.old,r.new)).sort();
    check('2. 稿的列數：AA_842 80、AA_843 48、AA_844 43、AA_845 88；每一列的 who 是那一份的人、file 是 date_system/lines/Dxx.json、互動點開頭＝地點',Object.keys(DOCS).every(d=>T[d].length===DOCS[d][2]&&T[d].every(r=>r.who===DOCS[d][1]&&/^date_system\/lines\/D\d\d\.json$/.test(r.file)&&r.point.slice(0,3)===r.file.slice(-8,-5))),J(Object.keys(T).map(d=>T[d].length)));
    check('2. HAO_1112（'+R.length+' 格）和稿一列對一格（哪一份、地點、互動點、old、new 都一樣；沒有重複）',new Set(want).size===259&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
    if(haveSrc){ const all=Object.keys(T).flatMap(d=>T[d].map(r=>[d,r]));
      const bad=all.filter(([d,r])=>{ const k=r.file.slice(-8,-5), x=R.filter(q=>q.doc===d&&q.loc===k&&RE_PATH.exec(q.path)[1]===r.point&&q.old===r.old&&q.new===r.new); if(x.length!==1) return true; const ch=get(SRC[k].lines[r.who],x[0].path.replace(/\/reply\/0\/text$/,'')); return !(ch&&ch.t===r.option); });
      check('2. 稿每一列的 option＝源稿那個選項的 t（那一格真的是那個選項的回話）',bad.length===0,J(bad.slice(0,3))); }
  } else console.log('（跳過第 2 項：讀不到 '+HSHA+' 的 AA_842～AA_845，企劃線沒 fetch）');
  if(haveSrc){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+HSHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 259 格不同、old／new 都照稿',diff.length===259&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 不同的格子都在這四個人底下、都是 hotspots/*/first/choice/n/reply/0/text（別人 0 格、fx 0 格、選項的字 0 格）',diff.every(([k,p])=>{ const m=/^\/lines\/([^/]+)\/(.+)$/.exec(p); return m&&C.HAO_WHO.includes(m[1])&&RE_PATH.test(m[2]); }),J(diff.filter(([k,p])=>!/\/first\/choice\/\d+\/reply\/0\/text$/.test(p)).slice(0,3)));
    check('3. 源稿用 src248 還原（拿掉 fx，可昕 72、以安 59、學姊 78 格＋多的一套、這 259 格）＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：259 格裡 7 格這一版 AA 再改了（付錢／承諾對不上，稿的 _meta.late_fix）——那幾格現在認 HAO2_1112 的 new（上一版的字要＝這裡的 new）。舊期望：259 格都＝這一輪的 new */
  const later=r=>{ const h=C.HAO2_1112.find(x=>x.who===r.who&&x.loc===r.loc&&x.path===r.path); return h&&h.old===r.new?h.new:r.new; }, LT=R.filter(r=>later(r)!==r.new);
  check('4. 259 格裡之後又改過的只有七格（學姊 D04.redhouse、D06.cafe、D25.cafe、D30.stall，沛珊 D05.cafe，芷若 D04.snack、D10.bridge；HAO2_1112 的 late）',J(LT.map(r=>r.who+' '+RE_PATH.exec(r.path)[1]).sort())===J(['classmate_peishan D05.cafe','heroine_02 D04.snack','heroine_02 D10.bridge','heroine_05 D04.redhouse','heroine_05 D06.cafe','heroine_05 D25.cafe','heroine_05 D30.stall']),J(LT.map(r=>r.who+' '+r.path)));
  const bad=R.filter(r=>get(NOW,gp(r))!==later(r)).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 259 格＝稿的新字，一字不差（那七格＝AA 再改的字）',bad.length===0,J(bad.slice(0,4)));
  const E=require('./ellipsis694.js'), g=R.filter(r=>r.game||E.strip(r.new)!==r.new);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0,J(g.map(r=>[r.new,r.game])));
  check('4. 那 259 格都是她自己說的（reply[0].who＝那個人）、那個選項的回話只有這一句的照舊',R.every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===r.who; })); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */&&!require('./date_src_sha.js').SHORT921_1112.some(r=>r.p===p)/* （CANON-NO-ECON-1112 第五批：照 AA_921 §3-1 換字）可昕不分地點的短句七格 */) diff.push(p);
    const want=R.map(gp).sort();
    { const X=new Set([...want]), H2=C.HAO2_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!X.has(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H2.includes(p)) diff.push(p); check('5. 之後第三次重匯（d7d818f8a8）子晴、可昕第一次選項的回話、語彤再訪句和 late 8 格一共 238 格也換了字（date_src_sha.js HAO2_1112；逐格在 tests/hao2_dates_1112_unit.js；其中 7 格這一輪的 259 格裡也有、留在這一輪）——這裡先拿掉再比',H2.length===231&&H2.every(p=>all.includes(p)),J(H2.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const H3=C.HAO3_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H3.includes(p)) diff.push(p); check('5. 之後第四次重匯（3cb2939d0）沛珊「今天」開頭 31 格、以安 D24.station、子晴 D06.cafe、可昕 D13.drink／D24.street 一共 35 格也換了字（date_src_sha.js HAO3_1112；逐格在 tests/hao3_dates_1112_unit.js；其中子晴、可昕那三格 HAO2_1112 也有，上面拿過了或留在這一輪）——這裡先拿掉再比',C.HAO3_1112.length===35&&H3.length===32,J(H3.length)); }   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const D8=C.D158_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!D8.includes(p)) diff.push(p); check('5. 之後 D158 重匯（f6aa917593，AA_860）可昕 45 格、沛珊 4 格一共 49 格也換了字（date_src_sha.js D158_1112；逐格在 tests/d158_dates_1112_unit.js）——這裡先拿掉再比',C.D158_1112.length===49&&D8.length===49,J(D8.length)); }   /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===118,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const ZN=C.ZR904_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_02/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!ZN.includes(p)) diff.push(p); check('5. 之後芷若再去一次那一次重匯（417c5cb9ce，AA_904）58 格也換了字（date_src_sha.js ZR904_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZR904_1112.length===58&&ZN.length===58,J(ZN.length)); }   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const QN=C.ZQ909_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_04/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!QN.includes(p)) diff.push(p); check('5. 之後子晴到達句那一次重匯（6221c8e80f，AA_909）8 格也換了字（date_src_sha.js ZQ909_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZQ909_1112.length===8&&QN.length===8,J(QN.length)); }   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const SN=C.PS913_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!SN.includes(p)) diff.push(p); check('5. 之後沛珊收尾那一次重匯（f561545f38，AA_913）42 格也換了字（date_src_sha.js PS913_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS913_1112.length===42&&SN.length===42,J(SN.length)); }   /* 2026-11-12（沛珊收尾 AA_913@f561545f38）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const S4=C.PS914_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!S4.includes(p)) diff.push(p); check('5. 之後沛珊再訪那一次重匯（dce2f8c08b，AA_914）53 格也換了字（date_src_sha.js PS914_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS914_1112.length===53&&(S4.length===53||S4.length===52)/* D21.street 那一格 D158_1112 也改過：前面那一層已經拿掉、或是這一輪的 want 就算 52 */,J(S4.length)); }   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K5=C.KX921_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+(r.gpath||r.path)).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!K5.includes(p)) diff.push(p); check('5. 之後第五批（6dbfe10d7e，AA_917／918 收尾、AA_921 可昕清句、AA_923 D09）118 格也換了字（date_src_sha.js KX921_1112）——這裡先拿掉再比',C.KX921_1112.length===118&&K5.length===117/* 可昕 D02 收尾那一格 D158_1112 也改過，前面那一層已經拿掉 */,J(K5.length)); }   /* 2026-11-12（CANON-NO-ECON-1112 第五批 6dbfe10d7e）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 259 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 259 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old),J(R.filter(r=>a[gp(r)]!==r.old).slice(0,3).map(r=>[gp(r),a[gp(r)],r.old])));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const b=leaves(NOW.loc,'',{}), cnt={}; for(const p of Object.keys(b)) if(typeof b[p]==='string') cnt[b[p]]=(cnt[b[p]]||0)+1;
  const left=[...new Set(R.map(r=>r.old))].filter(o=>cnt[o]).map(o=>[o,cnt[o]]);
  /* 同一句別的格子還有的（不是這一批的格子：AA 留著沒改的、別人的）：「好。」14 處、另外四句各 1 處——數目釘住，多了＝有格子沒換到 */
  /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：子晴、可昕的「好。」「好。下次我請。」「好。謝謝。」那幾格這一版也改了。舊期望：{'好。':14,'好。下次我請。':1,'好。你走前面。':1,'好。你不要走太快。':1,'好。謝謝。':1} */
  /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：以安 D24.station 第一次選「坐一下。」只回「好。」的那一格這一版改了（AA_849 最後一列）。舊期望：'好。':12 */
  const WANT={'好。':11,'好。你走前面。':1,'好。你不要走太快。':1};
  check('6. 259 句舊字都不在那一格了；整份裡還有同一句的只有 '+J(WANT)+'（別的格子，不是這一批的）',R.every(r=>get(NOW,gp(r))!==r.old)&&J(left.sort())===J(Object.entries(WANT).sort()),J(left)); }

// 7
{ const d3=read('src/date3d.js'), sp=read('src/data/she_pays.js');
  const hit=(t,o)=>t.includes("'"+o+"'")||t.includes('"'+o+'"');
  /* date3d.js 註解裡「好。下次我請。」「好啊，那下次換我。」是寫在 PICK_FLAG 旁邊的說明（用「」不是引號）；前一句現在是子晴 D06.cafe 的回話（AA_812 path_rows），不是學姊那一格 */
  const left=R.filter(r=>hit(d3,r.old)).map(r=>r.loc+' '+r.old), SPD=vm.runInNewContext(sp+';SHE_PAYS_DATA'), keys=J([SPD.pays,SPD.split]), left2=R.filter(r=>keys.includes(J(r.old))).map(r=>r.who+' '+r.loc+' '+r.old);   /* 只看 pays、split（合進 S.SHE_PAYS／S.SPLIT 的）；cells812 的 was 欄留著舊字是紀錄 */
  check('7. src/date3d.js 照整句認句子的表裡沒有留著這 259 句的舊字',left.length===0,J(left));
  check('7. src/data/she_pays.js（S.SHE_PAYS、S.SPLIT）裡沒有留著這 259 句的舊字',left2.length===0,J(left2));
  const bad=[];
  for(const part of ['pays','split']) for(const who of Object.keys(SPD[part]||{})) for(const pid of Object.keys(SPD[part][who])) for(const t of SPD[part][who][pid]){
    const H=get(NOW,'/loc/'+pid.slice(0,3)+'/lines/'+who+'/hotspots/'+pid), n=Object.values(leaves(H||{},'',{})).filter(v=>v===t).length; if(n!==1) bad.push([part,who,pid,t,n]); }
  check('7. she_pays.js 的每一句（她請、平分）都還在遊戲裡那個互動點底下剛好一處',bad.length===0,J(bad));
  const RW=[['pays','heroine_03','D12.pier'],['split','heroine_05','D22.fish'],['split','heroine_05','D22.fish']], rw=(SPD.cells812||[]).filter(c=>c.was);
  /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：AA 在 d7d818f8a8 把 AA_812 同步成新字、import_she_pays.py 的 REWORD 清空——cells812 沒有 was 了；那三句現在直接照稿在名單裡。
     舊期望：rw.length===3（語彤 D12.pier 她請一句、學姊 D22.fish 平分兩句有 was；was→text＝這一批那一格的 old→new） */
  const c8=(SPD.cells812||[]);
  check('7. she_pays.js 當初跟著換字的三句（語彤 D12.pier 她請一句、學姊 D22.fish 平分兩句）：AA_812 已經同步新字、cells812 沒有 was；三句都還在名單、＝這一批那一格的 new',rw.length===0&&RW.length===3&&[['pays','heroine_03','D12.pier','盡頭有一個賣咖啡的貨櫃，我請你。'],['split','heroine_05','D22.fish','飯我請，飲料你請。'],['split','heroine_05','D22.fish','你堅持的話。']].every(([k,w,p,x])=>SPD[k][w][p].includes(x)&&c8.some(c=>c.kind===k&&c.who===w&&c.pid===p&&c.text===x&&R.some(r=>gp(r)===c.at&&r.new===x))),J(rw)); }

// 8
{ const RE=/[一兩二三四]件事|第三件|第三格|第三點|^[一二三]，/;   /* ＝tests/sis_no_three_unit.js 的 RE */
  const t=read('tests/sis_no_three_unit.js');
  const hit=R.filter(r=>r.who==='heroine_05').map(r=>r.new).filter(s=>RE.test(s));
  check('8. 學姊 80 句新字沒有數件數的說法（和 tests/sis_no_three_unit.js 同一條規則）',t.includes('const RE='+String(RE)+';')&&hit.length===0,J(hit)); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
