// CANON-NO-ECON-1112 第五批：約會源稿 dce2f8c08b → 6dbfe10d7e（AA_917／AA_918 約會收尾「下次…」、AA_921 §1§4 可昕不排行程表不記帳、AA_923 D09「期中考前」→「考試前」；BB_443／BB_448 採用）——不需要瀏覽器（D131）。
//   白名單 33 筆改讀 6dbfe10d7e（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；逐格表在 tests/date_src_sha.js 的 KX921_1112（上一版 KX921_1112_PREV）。
//   1. 白名單 D01～D33 都是 6dbfe10d7e、approved；dce2f8c08b 在 history
//   2. 表 118 格（可昕 55、子晴 16、學姊 15、芷若 13、以安 11、語彤 8）；AA_917／AA_918 那幾格和稿一列對一格（row、地點、who、where、old、new）
//   3. 源稿 6dbfe10d7e 和上一版 dce2f8c08b 逐格比：剛好這 118 格不同；src248 還原以後兩版一樣
//   4. 遊戲那 118 格＝稿的新字（game＝照 AA_694 拿掉句中「……」：D01.wall、D06.frame 回話、D15 收尾、D28.alley 四格）；舊字都不在那一格了
//   5. 遊戲整份和重匯以前的開發分支（BASE）逐格比：只有這 118 格不同；un812 還原以後兩版一樣
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='68a3430ab1', R=C.KX921_1112;   /* BASE＝重匯以前的開發分支 */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOW=DL(read('src/data/date_lines.js'));
const gp=r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+(r.gpath||r.path);
const E=require('./ellipsis694.js');

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&(e[0].approvedBy||'').includes('AA_917')&&(e[0].history||[]).some(h=>h.sha===C.KX921_1112_PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有 AA_917；'+C.KX921_1112_PREV+' 在 history',C.ALLOW_SHA==='4539b2ebaf'&&C.KX938_1113_PREV==='e622a59148'&&C.KX932_1112_PREV==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&bad.length===0,J(bad));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 2
{ const cnt={}; for(const r of R) cnt[r.who]=(cnt[r.who]||0)+1;
  check('2. 表 118 格：可昕 55、子晴 16、學姊 15、芷若 13、以安 11、語彤 8；沒有同一格；old≠new',R.length===118&&J(cnt)===J({heroine_02:13,kexin:55,heroine_03:8,heroine_04:16,heroine_05:15,heroine_01:11})&&new Set(R.map(gp)).size===118&&R.every(r=>r.old&&r.new&&r.old!==r.new),J(cnt));
  const by={}; for(const r of R) by[r.doc]=(by[r.doc]||0)+1;
  check('2. 哪一份稿：AA_917 33、AA_918 47、AA_921 37、AA_923 1',J(by)===J({AA_918:47,AA_921:37,AA_917:33,AA_923:1}),J(by));
  for(const [doc,f,n] of [['AA_917','AA_917_closing_next_kx_zq.json',33],['AA_918','AA_918_closing_next_an_zr_yt_sis.json',47]]){
    const t=show(C.ALLOW_SHA,SP+f); if(!t){ console.log('（跳過第 2 項：讀不到 '+f+'，企劃線沒 fetch）'); continue; }
    const A=JSON.parse(t), mine=R.filter(r=>r.doc===doc);
    const bad=mine.filter(r=>{ const x=A.rows[r.row]; return !(x&&x.src==='date_system/lines/'+r.loc+'.json'&&x.who===r.who&&x.where===r.path&&x.old===r.old&&x.new===r.new); });
    check('2. '+doc+' 是定稿、'+n+' 列，和表一列對一格（row 0～'+(n-1)+' 各一次）',/^定稿/.test(A._meta.status)&&A.rows.length===n&&mine.length===n&&J(mine.map(r=>r.row).sort((a,b)=>a-b))===J([...Array(n).keys()])&&bad.length===0,J(bad.map(r=>r.row))); }
  check('2. AA_923 那一格是可昕 D09 小路「期中考前」→「考試前」',J(R.filter(r=>r.doc==='AA_923').map(r=>[r.loc,r.who,r.path,r.old.includes('期中考前'),r.new.includes('考試前')]))===J([['D09','kexin','hotspots/D09.path/first/lines/0/text',true,true]])); }

// 3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.KX932_1112_PREV,SP+'date_system/lines/'+k+'.json'), u=show(C.KX921_1112_PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  if(Object.keys(SRC).length===33&&Object.keys(OLD).length===33){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&!p.startsWith('/_meta')) diff.push(J([k,p,a[p],b[p]])); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new]));
    check('3. 源稿 '+C.KX932_1112_PREV+'（這一輪的版本；之後 AA_932 再改 5 格＝KX932_1112，逐格在 tests/kx932_dates_1113_unit.js）和上一版 '+C.KX921_1112_PREV+' 逐格比：剛好 118 格不同、old／new 都照表',diff.length===118&&J(diff.sort())===J(want.sort()),J(diff.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==(r.game||r.new)).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+(r.game||r.new)+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 118 格＝稿的新字，一字不差（game 那幾格照 AA_694）',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game||E.strip(r.new)!==r.new);
  check('4. 遊戲和稿不一樣的格子（game）都是 AA_694 拿掉句中「……」的結果：可昕 D01.wall、D06.frame 回話、D15 收尾、D28.alley',g.every(r=>r.game===E.strip(r.new))&&J(g.map(r=>r.loc))===J(['D01','D06','D15','D28']),J(g.map(r=>r.loc)));
  check('4. 那 118 句都是那個人自己說的（選項回話那幾格除外：回話也是她說的）',R.every(r=>{ const x=get(NOW,gp(r).replace(/\/(text|t)$/,'')); return x&&(/\/t$/.test(gp(r))?typeof x.t==='string':x.who===r.who); }));
  check('4. 舊字都不在那一格了',R.every(r=>get(NOW,gp(r))!==r.old)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&!require('./date_src_sha.js').SHORT921_1112.some(r=>r.p===p)/* （CANON-NO-ECON-1112 第五批：照 AA_921 §3-1 換字）可昕不分地點的短句七格 */) diff.push(p);
    const want=R.map(gp).sort();
    { const K6=C.KX932_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a6=diff.slice(); diff.length=0; for(const p of a6) if(!K6.includes(p)) diff.push(p); check('5. 之後收尾批（e622a59148，AA_932 可昕外校前提句）5 格也換了字（date_src_sha.js KX932_1112；逐格在 tests/kx932_dates_1113_unit.js）——這裡先拿掉再比',C.KX932_1112.length===5&&K6.length===5,J(K6.length)); }   /* 2026-11-13（CANON-NO-ECON-1112 收尾 e622a59148）：舊期望是重匯以前就只差這一輪的格子 */
    { const K7=C.KX938_1113.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), a7=diff.slice(); diff.length=0; for(const p of a7) if(!K7.includes(p)) diff.push(p); check('5. 之後收尾批（4539b2ebaf，AA_938 可昕記帳口氣）5 格也換了字（date_src_sha.js KX938_1113；逐格在 tests/kx938_dates_1113_unit.js）——這裡先拿掉再比（'+K7.length+' 格）',K7.length<=5,J(K7)); }
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 118 格不同',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 118 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old),J(R.filter(r=>a[gp(r)]!==r.old).slice(0,3).map(gp)));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6 AA_921 §3-1＋§4：可昕不分地點的短句七格（匯入工具 R921 照 path 換）、date3d.js S.MORNING.kexin（手改）
{ const S=C.SHORT921_1112.filter(r=>!r.aa), E2=require('./ellipsis694.js');   /* aa＝別份稿同一步換的（AA_915 芯慈那一格，下面另外驗） */
  check('6. 短句七格：遊戲那一格＝新字（move3、leaveEarly＝稿的字照 AA_694 拿掉「？」後面的「……」）',S.length===7&&S.every(r=>get(NOW,r.p)===r.new&&(!r.doc||E2.strip(r.doc)===r.new)),J(S.filter(r=>get(NOW,r.p)!==r.new).map(r=>r.p)));
  const src=read('tools/date/import_date_lines.py');
  check('6. 匯入工具 R921 七列和這張表一樣（old、稿的新字）',S.every(r=>src.includes("'old': '"+r.old+"'")&&src.includes(r.doc?"E694.strip('"+r.doc+"')":"'new': '"+r.new+"'")));
  const X5=C.SHORT921_1112.filter(r=>r.aa==='AA_915');
  check('6. AA_915 芯慈 D02 第一次收尾：「'+(X5[0]&&X5[0].new)+'」（舊的「下次你挑地方」不在了）',X5.length===1&&get(NOW,X5[0].p)===X5[0].new&&!read('src/data/date_lines.js').includes(X5[0].old)&&src.includes("'new': '"+X5[0].new+"'"));
  const code=read('src/date3d.js').replace(/\/\*[\s\S]*?\*\//g,'');
  check('6. date3d.js S.MORNING 可昕＝「'+C.MORNING921_1112.new+'」（AA_921 §3-1 原字）；舊句不在程式裡',code.includes("kexin:'"+C.MORNING921_1112.new+"'")&&!code.includes(C.MORNING921_1112.old)); }

console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
