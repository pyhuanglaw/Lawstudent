// X324 可昕續改（使用者：「繼續改，從可昕開始」）：約會台詞 72 格照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 定稿（BB_375／BB_377 第二意見採納），企劃線 07d50af2f7：
//   AA_819_kx_triple_short.json 約會 26 列（三連短句）、AA_822_kx_remember_last.json 46 列（remember 開頭的「上次」；D19 期中考→期末考）——AA 直接改源稿 date_system/lines/Dxx.json 可昕那一格。
// 檢查：
// 2026-11-12 再改（AA-C 06:57「回 LAWWW」，企劃線 74e0421b8）：D23 海堤那一句 AA 改成「好，我來計時……算了，今天不計了。」（停頓放句子中間）——源稿只動這一格，白名單 33 筆改讀 74e0421b8、重匯；
//   遊戲那一格＝稿（不再被 AA_694 拿掉「……」）。D08 火車那一句 AA 說照工具拿掉就好（沒有要留的）。AA_819_kx_triple_short.json 那一列還是 07d50af2f7 的寫法（KX_1112 的 was）。
//   舊期望：ALLOW_SHA 07d50af2f7、和稿不一樣的有兩格（D08、D23）。
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（74e0421b8）、approved；上一版 C.KX_1112_PREV（52c3ee258）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 KX_1112（72 格）和 AA_819（約會 26 列）＋AA_822（46 列）一列對一格（地點、old、new 都一樣）
//   3. 源稿 07d50af2f7 和上一版 52c3ee258 逐格比（33 個檔、每個人、每一格、含 fx）：只有可昕這 72 格不同、old／new 都照稿；別人 0 格
//   4. 遊戲（src/data/date_lines.js）那 72 格＝稿的新字；其中兩格稿的新句在「？」「。」後面有「……」，匯入工具照 AA_694 的規則拿掉了（KX_1112 的 game；已回報 AA）
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 72 格不同（別人的格子、fx、不分地點的短句、交通偏好零差異）
//   6. 舊字不在遊戲檔裡了
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5 項跳過並印出來。用法：node tests/kx_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', KX='kexin', BASE='d6e6a6f215', KS=C.KX_1112_FIX_SHA;   /* 2026-11-12（AA_832 以安第一批，白名單換 b84e779563、同一天 AA_834 再換 6d503411c1）：這一支的「源稿」固定讀可昕續改後續那一版 KS＝74e0421b8（之後 ALLOW_SHA 只多以安 59 格，見第 5 項）。舊寫法：源稿都讀 C.ALLOW_SHA */   /* BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.KX_1112;

// 1
const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
{ const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===C.KX_1112_PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；上一版 '+C.KX_1112_PREV+' 在 history',C.ALLOW_SHA==='5afc5c0e3'&&C.KXNL_1112_PREV==='f6aa917593'&&C.D158_1112_PREV==='3cb2939d0'&&C.HAO3_1112_PREV==='d7d818f8a8'&&C.HAO2_1112_PREV==='41f77eab53'&&C.HAO_1112_PREV==='a573a50dca'&&C.SIS_1112_PREV==='b22e4d1277'&&KS==='74e0421b8'&&C.KX_1112_SHA==='07d50af2f7'&&C.KX_1112_PREV==='52c3ee258'&&bad.length===0&&LOCS.every(k=>{ const h=allow.find(x=>x.path===SP+'date_system/lines/'+k+'.json').history||[]; return h.some(x=>x.sha===C.KX_1112_SHA)&&h.some(x=>x.sha===KS); }),J(bad));   /* 2026-11-12 再換 b84e779563（AA_832）：74e0421b8 也要在 history。舊期望：C.ALLOW_SHA==='74e0421b8'；同一天再換 6d503411c1（AA_834），舊期望 'b84e779563' */   /* 2026-11-12（X324 學姊續改 AA_837＋AA_838@a573a50dca）：白名單再換 a573a50dca（只動學姊）。舊期望：C.ALLOW_SHA==='b22e4d1277' */   /* 2026-11-12（X324「好」開頭回話 AA_842～845@41f77eab53）：白名單再換 41f77eab53（只動學姊、語彤、沛珊、芷若第一次選項的回話 259 格，見 date_src_sha.js HAO_1112）；a573a50dca＝C.HAO_1112_PREV。舊期望：C.ALLOW_SHA==='a573a50dca' */   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：白名單再換 d7d818f8a8（子晴 81、可昕 83 格選項回話、語彤 66 格再訪句、學姊 5／芷若 2／沛珊 1 格再改，共 238 格）；41f77eab53＝C.HAO2_1112_PREV。舊期望：C.ALLOW_SHA==='41f77eab53' */   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：白名單再換 3cb2939d0（沛珊「今天」開頭 31 格、以安 D24.station 1 格、子晴 D06.cafe 1 格、可昕 D13.drink／D24.street 2 格，共 35 格）；d7d818f8a8＝C.HAO3_1112_PREV。舊期望：C.ALLOW_SHA==='d7d818f8a8' */   /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：白名單再換 f6aa917593（可昕 45 格、沛珊 4 格重寫，逐格在 tests/d158_dates_1112_unit.js）；3cb2939d0＝C.D158_1112_PREV。舊期望：C.ALLOW_SHA==='3cb2939d0' */   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：白名單再換 5afc5c0e3（只動可昕 137 格，逐格在 tests/kxnl_dates_1112_unit.js）；f6aa917593＝C.KXNL_1112_PREV。舊期望：C.ALLOW_SHA==='f6aa917593' */
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ const a=show(KS,SP+'AA_819_kx_triple_short.json'), b=show(KS,SP+'AA_822_kx_remember_last.json');
  if(a&&b){ const ra=JSON.parse(a).rows.filter(r=>/^date_system\/lines\/D\d\d\.json$/.test(r.src)), rb=JSON.parse(b).rows;
    const key=(doc,loc,o,n)=>J([doc,loc,o,n]), want=[...ra.map(r=>key('AA_819',r.src.slice(-8,-5),r.old,r.new)),...rb.map(r=>key('AA_822',r.src.slice(-8,-5),r.old,r.new))].sort(), have=R.map(r=>key(r.doc,r.loc,r.old,r.was||r.new)).sort();   /* was：AA_819 的表上還是 07d50af2f7 的寫法（D23 海堤，74e0421b8 只改了源稿）*/
    check('2. AA_819 約會 26 列＋AA_822 46 列都是可昕的（who＝kexin）；AA_822 都在 remember 那一格',ra.length===26&&rb.length===46&&[...ra,...rb].every(r=>r.who===KX)&&rb.every(r=>r.where==='remember')&&R.filter(r=>r.doc==='AA_822').every(r=>/\/remember\//.test('/'+r.path)),J([ra.length,rb.length]));
    check('2. KX_1112（'+R.length+' 格）和稿一列對一格（地點、old、new 都一樣；沒有重複）',R.length===72&&new Set(have).size===72&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
  } else console.log('（跳過第 2 項：讀不到 '+KS+' 的 AA_819／AA_822，企劃線沒 fetch）'); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(KS,SP+'date_system/lines/'+k+'.json'), u=show(C.KX_1112_PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+KX+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+KS+' 和上一版 '+C.KX_1112_PREV+' 逐格比（含 fx）：只有可昕 72 格不同，old／new 都照稿；別人 0 格',diff.length===72&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：72 格裡 7 格第一次選項的回話這一版又改了（AA_847 拿掉開頭的「好」）——那幾格現在認 HAO2_1112 的 new（上一版的字要＝這裡的 new）。舊期望：72 格都＝這一輪的 new（或 game） */
  const later0=r=>{ let v=(r.game||r.new); const h=C.HAO2_1112.find(x=>x.who===KX&&x.loc===r.loc&&x.path===r.path); if(h&&h.old===v) v=h.new; const h3=C.HAO3_1112.find(x=>x.who===KX&&x.loc===r.loc&&x.path===r.path); if(h3&&h3.old===v) v=h3.new; return v; };   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：七格裡 D24.street 那一格這一版又改了（AA_847「這次讓你請。我吃兩個，你不要後悔。」）——那一格現在認 HAO3_1112 的 new。舊寫法：只看 HAO2_1112（D24.street＝「這次讓你請，下一攤換我來。」） */
  check('4. 72 格裡之後又改過的只有七格（D08.train、D16.drive、D24.footbath、D24.street、D27.shop、D27.rail、D28.circle 第一次選項的回話，AA_847）',J(R.filter(r=>later0(r)!==(r.game||r.new)).map(r=>r.path.split('/')[1]))===J(['D08.train','D16.drive','D24.footbath','D24.street','D27.shop','D27.rail','D28.circle']),J(R.filter(r=>later0(r)!==(r.game||r.new)).map(r=>r.path)));
  /* 2026-11-12（D158 約會台詞重匯 AA_860@f6aa917593，date_src_sha.js D158_1112）：72 格裡四格這一版 AA 又改了（提到外校室友的句子重寫）——那幾格現在認 D158_1112 的 new（上一版的字的 sha16 要＝那一列的 oh；D158 舊字不寫在這裡）。舊期望：只看 HAO2_1112、HAO3_1112（later0） */
  const later1=r=>{ const v=later0(r), d8=C.D158_1112.find(x=>x.who===KX&&x.loc===r.loc&&x.path===r.path); return d8&&C.sha16(v)===d8.oh?d8.new:v; };
  check('4. 72 格裡 D158 重匯又改過的只有四格（D15.car 再訪、D16.beach 再訪、D21.street、D32.meadow 再訪；AA_860）',J(R.filter(r=>later1(r)!==later0(r)).map(r=>r.path.split('/')[1]))===J(['D15.car','D16.beach','D21.street','D32.meadow']),J(R.filter(r=>later1(r)!==later0(r)).map(r=>r.path)));
  /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：72 格裡 9 格這一版 AA 又改了（不靠記帳；其中 D24.footbath、D27.rail、D28.circle 三格 AA_847 也改過）——那幾格現在認 KXNL_1112 的 new。舊期望：只看 HAO2_1112、HAO3_1112、D158_1112（later1） */
  const later=r=>{ const v=later1(r), k=C.KXNL_1112.find(x=>x.loc===r.loc&&x.path===r.path); return k&&k.old===v?k.new:v; }, LTK=R.filter(r=>later(r)!==later1(r));
  check('4. 72 格裡可昕不靠記帳那一次又改過的 '+LTK.length+' 格（KXNL_1112）',J(LTK.map(r=>r.path.split('/')[1]+'/'+r.path.split('/')[2]))===J(['D03.window/first','D03.window/remember','D05.shop/remember','D06.gallery/remember','D23.seawall/first','D24.footbath/first','D27.rail/first','D28.circle/first','D32.stall/normal']),J(LTK.map(r=>r.path.split('/')[1]+'/'+r.path.split('/')[2])));
  const bad=R.filter(r=>get(NOW.loc[r.loc].lines[KX],r.path)!==later(r)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW.loc[r.loc].lines[KX],r.path)+'」');
  check('4. 遊戲那 72 格＝稿的新字（兩格照 AA_694 拿掉「？」「。」後面的「……」；七格＝AA_847 再改的字、四格＝AA_860 再改的字、九格＝AA_869～871 再改的字）',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game);
  check('4. 和稿不一樣的只有一格（D08 火車的回話；AA 11-12：照工具拿掉），差的只是那一個「……」',g.length===1&&g[0].loc==='D08'&&g.every(r=>r.new.replace('……','')===r.game&&r.new.split('……').length===2),J(g.map(r=>[r.new,r.game])));
  const w=R.filter(r=>r.was), v=w[0]&&get(NOW.loc[w[0].loc].lines[KX],w[0].path);
  /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：D23 海堤那一格 AA_871 又改了（不再說計時）。舊期望：遊戲那一格＝「好，我來計時……算了，今天不計了。」＝KX_1112 那一列的 new */
  check('4. D23 海堤（74e0421b8 AA 再改成「好，我來計時……算了，今天不計了。」；5afc5c0e3 AA_871 再改）：遊戲那一格＝KXNL_1112 那一列的 new「好。它下去以前，手機收起來。」、那一列的 old＝74e0421b8 的字',w.length===1&&w[0].loc==='D23'&&w[0].new==='好，我來計時……算了，今天不計了。'&&v==='好。它下去以前，手機收起來。'&&C.KXNL_1112.some(k=>k.loc==='D23'&&k.path===w[0].path&&k.old===w[0].new&&k.new===v)&&!NOWT.includes('好，我來計時。算了，今天不計了。')&&!NOWT.includes(w[0].was),J(v));
  const s23=show(KS,SP+'date_system/lines/D23.json'), p23=show(C.KX_1112_SHA,SP+'date_system/lines/D23.json');
  if(s23&&p23){ const a=leaves(JSON.parse(p23),'',{}), b=leaves(JSON.parse(s23),'',{}), df=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(p=>a[p]!==b[p]);
    check('4. 源稿 '+KS+' 和 '+C.KX_1112_SHA+' 比：D23 只有這一格不同（was → new）；其他 32 個檔一字不差',J(df)===J(['/lines/'+KX+'/'+w[0].path])&&a[df[0]]===w[0].was&&b[df[0]]===w[0].new&&LOCS.filter(k=>k!=='D23').every(k=>show(KS,SP+'date_system/lines/'+k+'.json')===show(C.KX_1112_SHA,SP+'date_system/lines/'+k+'.json')),J(df)); }
  else console.log('（跳過：讀不到 '+KS+'／'+C.KX_1112_SHA+' 的 D23.json）'); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */) diff.push(p);
    const AN=C.AN_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_01/'+r.path); { const all=diff.slice(); diff.length=0; for(const p of all) if(!AN.includes(p)) diff.push(p); check('5. 之後 AA_832（b84e779563）、AA_834（6d503411c1）以安那 59 格也換了字（date_src_sha.js AN_1112；逐格在 tests/an_dates_1112_unit.js）——這裡先拿掉再比',AN.length===59&&AN.every(p=>all.includes(p)),J(AN.filter(p=>!all.includes(p)))); }   /* 2026-11-12：舊期望是整份只差可昕 72 格 */
    const SISP=[...C.SIS_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_05/'+r.path),...C.SIS_1112_ADD.flatMap(x=>['/tier','/lines/0/who','/lines/0/text'].map(q=>'/loc/'+x.loc+'/lines/heroine_05/'+x.path+'/'+x.index+q))]; { const all=diff.slice(); diff.length=0; for(const p of all) if(!SISP.includes(p)) diff.push(p); check('5. 之後 AA_837＋AA_838（a573a50dca）學姊那 78 格也換了字、D01 交往到達多一套 3 格（date_src_sha.js SIS_1112、SIS_1112_ADD；逐格在 tests/sis_dates_1112_unit.js）——這裡先拿掉再比',SISP.length===81&&SISP.every(p=>all.includes(p)),J(SISP.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324 學姊續改）：舊期望是拿掉以前就只差這一輪的格子 */
    { const HAOP=C.HAO_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!SISP.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!HAOP.includes(p)) diff.push(p); check('5. 之後 AA_842～845（41f77eab53）學姊、語彤、沛珊、芷若第一次選項的回話 259 格也換了字（date_src_sha.js HAO_1112；逐格在 tests/hao_dates_1112_unit.js；其中學姊 D22.maple 那一格 SIS_1112 也有，上面拿過了）——這裡先拿掉再比',HAOP.length===258&&HAOP.every(p=>all.includes(p)),J(HAOP.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324「好」開頭回話）：舊期望是拿掉學姊那 81 格以後就只差這一輪的格子 */
    { const X=new Set([...C.HAO_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path),...C.SIS_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_05/'+r.path),...C.KX_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path)]), H2=C.HAO2_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>!X.has(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H2.includes(p)) diff.push(p); check('5. 之後第三次重匯（d7d818f8a8）子晴、可昕第一次選項的回話、語彤再訪句和 late 8 格一共 238 格也換了字（date_src_sha.js HAO2_1112；逐格在 tests/hao2_dates_1112_unit.js；其中 7 格 HAO_1112 也有、學姊 D20.trolley 那一格 SIS_1112 也有，上面拿過了；可昕 7 格這一輪的 72 格裡也有、留在這一輪）——這裡先拿掉再比',H2.length===223&&H2.every(p=>all.includes(p)),J(H2.filter(p=>!all.includes(p)))); }   /* 2026-11-12（X324 第三次重匯 AA_846～848@d7d818f8a8，date_src_sha.js HAO2_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    const want=R.map(r=>'/loc/'+r.loc+'/lines/'+KX+'/'+r.path).sort();
    { const H3=C.HAO3_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!H3.includes(p)) diff.push(p); check('5. 之後第四次重匯（3cb2939d0）沛珊「今天」開頭 31 格、以安 D24.station、子晴 D06.cafe、可昕 D13.drink／D24.street 一共 35 格也換了字（date_src_sha.js HAO3_1112；逐格在 tests/hao3_dates_1112_unit.js；其中子晴、可昕那三格 HAO2_1112 也有，上面拿過了或留在這一輪）——這裡先拿掉再比',C.HAO3_1112.length===35&&H3.length===32,J(H3.length)); }   /* 2026-11-12（X324 第四次重匯 3cb2939d0，date_src_sha.js HAO3_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const D8=C.D158_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!D8.includes(p)) diff.push(p); check('5. 之後 D158 重匯（f6aa917593，AA_860）可昕 45 格、沛珊 4 格一共 49 格也換了字（date_src_sha.js D158_1112；逐格在 tests/d158_dates_1112_unit.js；其中可昕四格這一輪也改過、留在這一輪）——這裡先拿掉再比',C.D158_1112.length===49&&D8.length===45,J(D8.length)); }   /* 2026-11-12（D158 約會台詞重匯 f6aa917593，date_src_sha.js D158_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const KN=C.KXNL_1112.map(r=>'/loc/'+r.loc+'/lines/kexin/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!KN.includes(p)) diff.push(p); check('5. 之後可昕不靠記帳那一次重匯（5afc5c0e3，AA_869～871）137 格也換了字（date_src_sha.js KXNL_1112；逐格在 tests/kxnl_dates_1112_unit.js；其中這一輪也改過的那幾格留在這一輪）——這裡先拿掉再比',C.KXNL_1112.length===137&&KN.length===112,J(KN.length)); }   /* 2026-11-12（可昕不靠記帳 AA_869～871@5afc5c0e3，date_src_sha.js KXNL_1112）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 72 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 72 格重匯以前＝稿的 old',R.every(r=>a['/loc/'+r.loc+'/lines/'+KX+'/'+r.path]===r.old));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const left=R.filter(r=>NOWT.includes(J(r.old))&&!(r.game||r.new).includes(r.old)).map(r=>r.old);
  check('6. 72 句舊字都不在 date_lines.js 裡了',left.length===0,J(left.slice(0,4))); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
