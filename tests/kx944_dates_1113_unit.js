// CANON-NO-ECON-1112 收尾：約會源稿 4539b2ebaf → b4dcd9bf9a（AA_944 §1 沛珊「今天」開頭 31 句＋AA_945 可昕再訪「上次」開頭、記次數、D09 外校前提 23 句；BB 照用；
//   AA_946 §1 把源稿 12 格對齊成遊戲早就在用的字）——不需要瀏覽器（D131）。
//   白名單 33 筆改讀 b4dcd9bf9a（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；逐格表在 tests/date_src_sha.js 的 KX944_1113（上一版 KX944_1113_PREV）。
//   1. 白名單 D01～D33 都是 b4dcd9bf9a、approved、approvedBy 有 AA_944、AA_945、AA_946；4539b2ebaf 在 history
//   2. 表 66 格：沛珊 AA_944 31 格、可昕 AA_945 23 格、AA_946 對齊 12 格（align）；AA_944 §1、AA_945 表上的新字都在表上
//   3. 源稿 b4dcd9bf9a 和上一版 4539b2ebaf 逐格比：剛好這 66 格不同；src248 還原以後兩版一樣
//   4. 遊戲那 54 格＝稿的新字（D26 可昕句中「……」照 AA_694 拿掉＝game）；舊字都不在遊戲檔了；align 12 格遊戲＝稿的新字（本來就是）
//   5. 遊戲整份和重匯以前的開發分支（BASE）逐格比：只有這 54 格不同；un812 還原以後兩版一樣；語彤 D14 收尾「天快暗了。夕陽，我想留到河邊看。」照在
'use strict';
const M959=require('./aa959_map.js');   /* AA_959（DLG-FULL-REVIEW-1110）：遊戲的 date_lines 先照覆寫表換回舊字再比（AA_959 本身逐列驗在 tests/aa959_overlay_unit.js）*/
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='12b9649687', R=C.KX944_1113;   /* BASE＝重匯以前的開發分支 */
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
const G=R.filter(r=>!r.align), AL=R.filter(r=>r.align);

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&['AA_944','AA_945','AA_946'].every(d=>(e[0].approvedBy||'').includes(d))&&(e[0].history||[]).some(h=>h.sha===C.KX944_1113_PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有 AA_944、AA_945、AA_946；'+C.KX944_1113_PREV+' 在 history',C.ALLOW_SHA==='b4dcd9bf9a'&&C.KX944_1113_PREV==='4539b2ebaf'&&bad.length===0,J(bad));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ const n=(who,doc,al)=>R.filter(r=>r.who===who&&r.doc===doc&&!!r.align===al).length;
  check('2. 表 66 格：沛珊 AA_944 31、可昕 AA_945 23、AA_946 對齊 12；沒有同一格；old≠new',R.length===66&&n('classmate_peishan','AA_944',false)===31&&n('kexin','AA_945',false)===23&&AL.length===12&&AL.every(r=>r.doc==='AA_946')&&R.every(r=>r.old&&r.new&&r.old!==r.new)&&new Set(R.map(gp)).size===66);
  const t4=show(C.ALLOW_SHA,SP+'AA_944_沛珊今天開頭砍半.md'), t5=show(C.ALLOW_SHA,SP+'AA_945_可昕約會再訪_上次_記次數.md');
  if(t4&&t5){ const s4=t4.slice(t4.indexOf('## 1. 約會'),t4.indexOf('## 2.'));
    const cells=sec=>sec.split('\n').filter(l=>/^\| D\d\d /.test(l)).map(l=>l.split('|')[3].trim().split('（')[0].replace(/^…|…$/g,''));   /* 表的「新」欄；稿用「…」截短的只比留下來的那一段 */
    const c4=cells(s4), c5=cells(t5);
    const miss=G.filter(r=>!(r.doc==='AA_944'?c4:c5).some(c=>c&&r.new.includes(c))).map(r=>r.loc+' '+r.new);
    check('2. AA_944 §1（31 列）、AA_945（23 列）那張表的新字都在表上',c4.length===31&&c5.length===23&&miss.length===0,J([c4.length,c5.length,miss]));
  } else console.log('（跳過第 2 項後半：讀不到 AA_944／AA_945，企劃線沒 fetch）'); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.ALLOW_SHA,SP+'date_system/lines/'+k+'.json'), u=show(C.KX944_1113_PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&!p.startsWith('/_meta')) diff.push(J([k,p,a[p],b[p]])); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new]));
    check('3. 源稿 '+C.ALLOW_SHA+' 和上一版 '+C.KX944_1113_PREV+' 逐格比：剛好 66 格不同、old／new 都照表',diff.length===66&&J(diff.sort())===J(want.sort()),J(diff.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==(r.game||r.new)).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 66 格＝稿的新字（D26 可昕句中「……」照 AA_694 拿掉）',bad.length===0&&R.filter(r=>r.game).map(r=>r.loc+' '+r.who).join()==='D26 kexin'&&R.every(r=>!r.game||r.game===r.new.replace(/……/g,'')),J(bad));
  const txt=read('src/data/date_lines.js');
  check('4. 那 54 格的舊字都不在遊戲檔了',G.every(r=>!txt.includes(J(r.old))),J(G.filter(r=>txt.includes(J(r.old))).map(r=>r.old)));
  check('4. D09 纜車那一句（外校前提）不在遊戲檔了',!txt.includes(R.find(r=>r.loc==='D09'&&r.who==='kexin').old)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=G.map(gp).sort();
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 54 格不同（AA_946 對齊的 12 格、別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 54 格重匯以前＝稿的 old',G.every(r=>a[gp(r)]===r.old));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
    const D14=(t)=>(t.match(/天快暗了。夕陽，我想留到河邊看。/g)||[]).length;
    check('5. 語彤 D14 收尾「天快暗了。夕陽，我想留到河邊看。」重匯以後照在（處數和重匯以前一樣）',D14(read('src/data/date_lines.js'))===D14(wt)&&D14(wt)>0,D14(read('src/data/date_lines.js'))+'／'+D14(wt));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
