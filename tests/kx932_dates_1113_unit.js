// CANON-NO-ECON-1112 收尾：約會源稿 6dbfe10d7e → e622a59148（AA_932 §1 可昕「山上／我們學校／我們那邊」外校前提句；BB_455 照用）——不需要瀏覽器（D131）。
//   白名單 33 筆改讀 e622a59148（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；逐格表在 tests/date_src_sha.js 的 KX932_1112（上一版 KX932_1112_PREV）。
//   1. 白名單 D01～D33 都是 e622a59148、approved、approvedBy 有 AA_932；6dbfe10d7e 在 history
//   2. 表 5 格，全部可昕、AA_932；稿 AA_932 §1 約會源稿那張表的新字都在表上
//   3. 源稿 e622a59148 和上一版 6dbfe10d7e 逐格比：剛好這 5 格不同；src248 還原以後兩版一樣
//   4. 遊戲那 5 格＝稿的新字（沒有句中「……」）；舊字都不在遊戲檔了
//   5. 遊戲整份和重匯以前的開發分支（BASE）逐格比：只有這 5 格不同；un812 還原以後兩版一樣
'use strict';
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='dd63a41a10', R=C.KX932_1112;   /* BASE＝重匯以前的開發分支 */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOW=M959.unmapDeep(DL(read('src/data/date_lines.js')),'date_lines.js');
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path;

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&(e[0].approvedBy||'').includes('AA_932')&&(e[0].history||[]).some(h=>h.sha===C.KX932_1112_PREV)&&(e[0].history||[]).some(h=>h.sha===C.KX938_1113_PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有 AA_932；'+C.KX932_1112_PREV+' 在 history（之後 AA_938 再換一版，KX938_1113）',C.ALLOW_SHA==='b4dcd9bf9a'&&C.KX944_1113_PREV==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&C.KX932_1112_PREV==='6dbfe10d7e'&&bad.length===0,J(bad));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ check('2. 表 5 格、全部可昕、AA_932；沒有同一格；old≠new',R.length===5&&R.every(r=>r.who==='kexin'&&r.doc==='AA_932'&&r.old&&r.new&&r.old!==r.new)&&new Set(R.map(gp)).size===5);
  const t=show(C.ALLOW_SHA,SP+'AA_932_可昕外校前提_山上下山_補.md');
  if(t){ const sec=t.slice(t.indexOf('**約會源稿**'),t.indexOf('## 2.'));
    check('2. AA_932 §1 約會源稿那張表的新字都在表上（選項的「」照稿）',R.every(r=>sec.includes(r.new.replace(/^「|」$/g,''))),J(R.filter(r=>!sec.includes(r.new.replace(/^「|」$/g,''))).map(r=>r.new)));
  } else console.log('（跳過第 2 項後半：讀不到 AA_932，企劃線沒 fetch）'); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.KX938_1113_PREV,SP+'date_system/lines/'+k+'.json'), u=show(C.KX932_1112_PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&!p.startsWith('/_meta')) diff.push(J([k,p,a[p],b[p]])); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new]));
    check('3. 源稿 '+C.KX938_1113_PREV+'（這一輪的版本；之後 AA_938 再改可昕 5 格＝KX938_1113，逐格在 tests/kx938_dates_1113_unit.js）和上一版 '+C.KX932_1112_PREV+' 逐格比：剛好 5 格不同、old／new 都照表',diff.length===5&&J(diff.sort())===J(want.sort()),J(diff.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==r.new).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 5 格＝稿的新字，一字不差（都沒有句中「……」）',bad.length===0&&R.every(r=>!r.new.includes('……')),J(bad));
  const txt=read('src/data/date_lines.js');
  check('4. 舊字都不在遊戲檔了',R.every(r=>!txt.includes(J(r.old))),J(R.filter(r=>txt.includes(J(r.old))).map(r=>r.old))); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=R.map(gp).sort();
    { const K7=C.KX938_1113.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a7=diff.slice(); diff.length=0; for(const p of a7) if(!K7.includes(p)) diff.push(p); check('5. 之後收尾批（4539b2ebaf，AA_938 可昕記帳口氣）5 格也換了字（date_src_sha.js KX938_1113；逐格在 tests/kx938_dates_1113_unit.js）——這裡先拿掉再比（'+K7.length+' 格）',K7.length<=5,J(K7)); }
    { const K8=C.KX944_1113.filter(r=>!r.align).map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a8=diff.slice(); diff.length=0; for(const p of a8) if(!K8.includes(p)) diff.push(p); check('5. 之後收尾批（b4dcd9bf9a，AA_944 沛珊「今天」開頭 31 格＋AA_945 可昕再訪 23 格）也換了字（date_src_sha.js KX944_1113；AA_946 對齊的 12 格遊戲沒變；逐格在 tests/kx944_dates_1113_unit.js）——這裡先拿掉再比（'+K8.length+' 格）',K8.length<=54,J(K8)); }
    C.rc2Layer(diff,a,b,check,want);   /* 2026-11-13 76f8 rc2（D158-KX-SAMESCHOOL，BB_467／AA_987）：可昕外校前提 5 格（date_src_sha.js RC2_1113；新舊字在 tests/d158_rc2_rows.json）也換了字——這裡先拿掉再比（同時驗 5 格都是新字、舊字整份 0 格）；舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 5 格不同',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 5 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6 同一份 AA_932 §1：AA_717 可昕輪換句（tools/story/import_arc_rot.py 照白名單 e622a59148 重匯 → src/data/arc_rot.js）
{ const ROT=read('src/data/arc_rot.js'), allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===SP+'AA_717_rot_life.json');
  check('6. 白名單 AA_717 一筆、sha e622a59148、033b5150a 在 history；arc_rot.js 的來源寫 @e622a59148',allow.length===1&&allow[0].sha==='e622a59148'&&allow[0].history.some(h=>h.sha==='033b5150a')&&ROT.includes('AA_717_rot_life.json@e622a59148'));
  const NEW=['期末週，總圖的位子要搶。','我七點就去排了。','颱風天，學校停課。','新學期，系館的教室又換了。','我每次都走錯樓層。','今天回宿舍的路上，有一隻狗一直跟著我走。','……我差點帶牠回去。','宿舍好冷。','我室友說，冬天會更冷。','我想買一台新筆電。','暑假在臺北的事務所打雜。','我幫忙寫的書狀，最後只被改了兩個地方。'];
  const OLD=['期末週，我們的圖書館位子要搶。','我搭第一班公車上山。','颱風天，山上的公車停駛。','新學期，我們系的教室又換了。','在山上，換來換去都要爬。','今天下山的時候，有一隻狗一直跟著公車跑。','……我差點下車。','山上的宿舍好冷。','我在存錢買新筆電。','暑假在高雄的事務所實習。','我寫的書狀，最後只被改了兩個地方。'];
  check('6. arc_rot.js 可昕那幾則＝AA_932 §1 的新字（狗那兩句照 BB_455）',NEW.every(s=>ROT.includes(J(s))),J(NEW.filter(s=>!ROT.includes(J(s)))));
  check('6. 舊字都不在 arc_rot.js 了',OLD.every(s=>!ROT.includes(J(s))),J(OLD.filter(s=>ROT.includes(J(s)))));
  check('6. 企劃原稿這一版的代號（舊序章、外校、她室友）沒有進遊戲：照 tools/story/canon897_fix.json 換成 AA_897 的字',!/舊序章|外校|她室友/.test(ROT)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
