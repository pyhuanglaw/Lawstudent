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
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；上一版 '+C.KX_1112_PREV+' 在 history',C.ALLOW_SHA==='6d503411c1'&&KS==='74e0421b8'&&C.KX_1112_SHA==='07d50af2f7'&&C.KX_1112_PREV==='52c3ee258'&&bad.length===0&&LOCS.every(k=>{ const h=allow.find(x=>x.path===SP+'date_system/lines/'+k+'.json').history||[]; return h.some(x=>x.sha===C.KX_1112_SHA)&&h.some(x=>x.sha===KS); }),J(bad));   /* 2026-11-12 再換 b84e779563（AA_832）：74e0421b8 也要在 history。舊期望：C.ALLOW_SHA==='74e0421b8'；同一天再換 6d503411c1（AA_834），舊期望 'b84e779563' */
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
{ const bad=R.filter(r=>get(NOW.loc[r.loc].lines[KX],r.path)!==(r.game||r.new)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW.loc[r.loc].lines[KX],r.path)+'」');
  check('4. 遊戲那 72 格＝稿的新字（兩格照 AA_694 拿掉「？」「。」後面的「……」）',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game);
  check('4. 和稿不一樣的只有一格（D08 火車的回話；AA 11-12：照工具拿掉），差的只是那一個「……」',g.length===1&&g[0].loc==='D08'&&g.every(r=>r.new.replace('……','')===r.game&&r.new.split('……').length===2),J(g.map(r=>[r.new,r.game])));
  const w=R.filter(r=>r.was), v=w[0]&&get(NOW.loc[w[0].loc].lines[KX],w[0].path);
  check('4. D23 海堤（74e0421b8 AA 再改）：遊戲「好，我來計時……算了，今天不計了。」＝稿，一字不差（中間的「……」留著）',w.length===1&&w[0].loc==='D23'&&v==='好，我來計時……算了，今天不計了。'&&v===w[0].new&&!NOWT.includes('好，我來計時。算了，今天不計了。')&&!NOWT.includes(w[0].was),J(v));
  const s23=show(KS,SP+'date_system/lines/D23.json'), p23=show(C.KX_1112_SHA,SP+'date_system/lines/D23.json');
  if(s23&&p23){ const a=leaves(JSON.parse(p23),'',{}), b=leaves(JSON.parse(s23),'',{}), df=[...new Set([...Object.keys(a),...Object.keys(b)])].filter(p=>a[p]!==b[p]);
    check('4. 源稿 '+KS+' 和 '+C.KX_1112_SHA+' 比：D23 只有這一格不同（was → new）；其他 32 個檔一字不差',J(df)===J(['/lines/'+KX+'/'+w[0].path])&&a[df[0]]===w[0].was&&b[df[0]]===w[0].new&&LOCS.filter(k=>k!=='D23').every(k=>show(KS,SP+'date_system/lines/'+k+'.json')===show(C.KX_1112_SHA,SP+'date_system/lines/'+k+'.json')),J(df)); }
  else console.log('（跳過：讀不到 '+KS+'／'+C.KX_1112_SHA+' 的 D23.json）'); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const AN=C.AN_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_01/'+r.path); { const all=diff.slice(); diff.length=0; for(const p of all) if(!AN.includes(p)) diff.push(p); check('5. 之後 AA_832（b84e779563）、AA_834（6d503411c1）以安那 59 格也換了字（date_src_sha.js AN_1112；逐格在 tests/an_dates_1112_unit.js）——這裡先拿掉再比',AN.length===59&&AN.every(p=>all.includes(p)),J(AN.filter(p=>!all.includes(p)))); }   /* 2026-11-12：舊期望是整份只差可昕 72 格 */
    const want=R.map(r=>'/loc/'+r.loc+'/lines/'+KX+'/'+r.path).sort();
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 72 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 72 格重匯以前＝稿的 old',R.every(r=>a['/loc/'+r.loc+'/lines/'+KX+'/'+r.path]===r.old));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const left=R.filter(r=>NOWT.includes(J(r.old))&&!(r.game||r.new).includes(r.old)).map(r=>r.old);
  check('6. 72 句舊字都不在 date_lines.js 裡了',left.length===0,J(left.slice(0,4))); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
