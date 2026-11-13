// X324／UA-AA-1112-15 可昕約會稿不靠記帳、愛算（AA_869／AA_870／AA_871 三批）：137 格，照 AA 的稿進遊戲——不需要瀏覽器（D131）。
// AA-C 2026-11-12 15:05 定稿（BB_413～415 聽過），企劃線 5afc5c0e3：
//   AA_869_kx_dates_no_ledger_b1.json 51 列、AA_870_…_b2.json 37 列、AA_871_…_b3.json 49 列＝137 列，都是可昕（kexin）：她的句子 110 格＋第一次選項的字 27 格，23 個地點
//   （D01、02、03、05、06、08、09、10、15、17、19、20、21、22、23、24、26、27、28、29、30、31、32）。
//   白名單 33 筆改讀 5afc5c0e3（tools/date/bump_lines_sha.py）、tools/date/import_date_lines.py 重匯；匯入工具沒有 STALE，各人跳過的列數和上一次一樣。
//   AA_812、date_rewrite/ 這一版沒動：白名單 AA_812 那一筆留在 3cb2939d0，src/data/she_pays.js、src/data/date_wish.js 重匯以後一個字都沒變。
// 檢查：
//   1. 白名單 D01～D33 都是 C.ALLOW_SHA（5afc5c0e3）、approved；C.KXNL_1112_PREV（f6aa917593）在 history；date_lines.js 的來源寫著 @ALLOW_SHA
//   2. tests/date_src_sha.js 的 KXNL_1112（137 格）和三份稿的 137 列一列對一格（doc、row、old、new、地點）
//   3. 源稿 5afc5c0e3 和上一版 f6aa917593 逐格比（33 個檔、每個人、每一格、含 fx）：剛好這 137 格不同
//   4. 遊戲（src/data/date_lines.js）那 137 格＝稿的新字，一字不差
//   5. 遊戲整份和重匯以前（開發分支 BASE）逐格比：只有這 137 格不同；那 137 格重匯以前＝稿的 old
//   6. 舊字不在那一格了
//   7. src/date3d.js、src/aa524_3d.js、src/data/she_pays.js 沒有留著舊字（選項的字當 key 的也沒有）；she_pays.js 每一句都還在、和重匯以前一模一樣；AA_812 兩版一樣
//   8. 換了字的 27 個選項：源稿兩版那個選項只差 t 和（有改的）回話，fx、選項數沒動
// 稿讀 git show；讀不到（淺層複本）＝第 2、3、5、7、8 項的那幾條跳過並印出來。用法：node tests/kxnl_dates_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process'), vm=require('vm');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify;
const C=require('./date_src_sha.js'), SP='docs/story_planning/', SHA='5afc5c0e3', BASE='4bf9b126a2', PREV=C.KXNL_1112_PREV;   /* SHA＝這一批的那一版（以後白名單再換版也還是比這一版）；BASE＝匯入以前的那一筆（這條線上 D158 那一次重匯以後；src/data/date_lines.js 和 08b6027ca0 一樣） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const git=a=>{ try{ return cp.execFileSync('git',['-C',ROOT,...a],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const show=(sha,f)=>git(['show',sha+':'+f]);
const DL=t=>JSON.parse(t.slice(t.indexOf('const DATE_LINES=')+17,t.lastIndexOf(';')));
const leaves=(o,p,out)=>{ if(o&&typeof o==='object'){ for(const k of Object.keys(o)) leaves(o[k],p+'/'+k,out); } else out[p]=o; return out; };
const get=(o,p)=>{ for(const k of p.split('/').filter(Boolean)) o=o==null?o:o[k]; return o; };
const LOCS=Array.from({length:33},(_,i)=>'D'+String(i+1).padStart(2,'0'));
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.KXNL_1112, KX='kexin';
const RE_T=/^hotspots\/(D\d\d\.\w+)\/first\/choice\/(\d+)\/t$/;
const gp=r=>'/loc/'+r.loc+'/lines/'+KX+'/'+r.path;
const DOCS={AA_869:'AA_869_kx_dates_no_ledger_b1.json',AA_870:'AA_870_kx_dates_no_ledger_b2.json',AA_871:'AA_871_kx_dates_no_ledger_b3.json'};
const WANT_LOCS=['D01','D02','D03','D05','D06','D08','D09','D10','D15','D17','D19','D20','D21','D22','D23','D24','D26','D27','D28','D29','D30','D31','D32'];

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&e[0].approvedBy.includes('AA_869～871 定稿（BB_413～415 聽過）5afc5c0e3')&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、approvedBy 有「AA_869～871 定稿（BB_413～415 聽過）5afc5c0e3」；'+PREV+' 在 history',C.ALLOW_SHA==='6dbfe10d7e'&&C.KX921_1112_PREV==='dce2f8c08b'&&C.PS914_1112_PREV==='f561545f38'&&C.PS913_1112_PREV==='6221c8e80f'&&C.ZQ909_1112_PREV==='417c5cb9ce'&&C.ZR904_1112_PREV===SHA&&PREV==='f6aa917593'&&bad.length===0,J(bad));   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce，date_src_sha.js ZR904_1112）：白名單再換 417c5cb9ce（只動芷若 remember 58 格，逐格在 tests/zr904_dates_1112_unit.js）；5afc5c0e3＝C.ZR904_1112_PREV。舊期望：C.ALLOW_SHA===SHA */   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f，date_src_sha.js ZQ909_1112）：白名單再換 6221c8e80f（只動子晴 8 格）；417c5cb9ce＝C.ZQ909_1112_PREV。舊期望：C.ALLOW_SHA==='417c5cb9ce' */   /* 2026-11-12（沛珊收尾 AA_913@f561545f38，date_src_sha.js PS913_1112）：白名單再換 f561545f38（只動沛珊 42 格）；6221c8e80f＝C.PS913_1112_PREV。舊期望：C.ALLOW_SHA==='6221c8e80f' */   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b，date_src_sha.js PS914_1112）：白名單再換 dce2f8c08b（只動沛珊 53 格）；f561545f38＝C.PS914_1112_PREV。舊期望：C.ALLOW_SHA==='f561545f38' */
  const e=allow.filter(x=>x.path===SP+'AA_812_date_pays_promises.json');
  check('1. 白名單 AA_812 那一筆留在 3cb2939d0（這一版 AA_812 沒改）、approved',e.length===1&&e[0].sha==='3cb2939d0'&&e[0].status==='approved',J(e.map(x=>x.sha)));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身（不用讀稿）
{ const nT=R.filter(r=>RE_T.test(r.path)).length, nX=R.filter(r=>/\/text$/.test(r.path)).length, byDoc={}; for(const r of R) byDoc[r.doc]=(byDoc[r.doc]||0)+1;
  check('KXNL_1112 一共 137 格：可昕的句子 110 格＋第一次選項的字 27 格；三份稿 51／37／49 列；沒有同一格、old≠new、沒有 who／was／game；23 個地點',
    R.length===137&&nX===110&&nT===27&&byDoc.AA_869===51&&byDoc.AA_870===37&&byDoc.AA_871===49&&new Set(R.map(gp)).size===137&&new Set(R.map(r=>r.doc+'#'+r.row)).size===137
    &&R.every(r=>r.old&&r.new&&r.old!==r.new&&r.who===undefined&&!r.was&&!r.game)&&J([...new Set(R.map(r=>r.loc))].sort())===J(WANT_LOCS),J([nX,nT,byDoc]));
  check('KXNL_1112 互動點底下的格子，互動點開頭＝地點',R.every(r=>!/^hotspots\//.test(r.path)||r.path.split('/')[1].slice(0,3)===r.loc));
  const chain=(tab,who)=>R.filter(r=>C[tab].some(h=>(h.who||KX)===KX&&h.loc===r.loc&&h.path===r.path)).map(r=>{ const h=C[tab].find(x=>(x.who||KX)===KX&&x.loc===r.loc&&x.path===r.path); return [gp(r),tab==='D158_1112'?h.new===r.old:true]; });
  const d8=chain('D158_1112'), h2=chain('HAO2_1112'), kx=chain('KX_1112');
  check('前幾輪也改過的格子接得起來：D158_1112 三格（三個選項的字，那一列的 new＝這裡的 old）、HAO2_1112 16 格（那一列的 new＝這裡的 old）、KX_1112 9 格',
    d8.length===3&&d8.every(x=>x[1])&&h2.length===16&&R.filter(r=>C.HAO2_1112.some(h=>h.who===KX&&h.loc===r.loc&&h.path===r.path&&h.new===r.old)).length===16&&kx.length===9,J([d8.length,h2.length,kx.length])); }

// 2、3、8
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLD).length===33;
  const A={}; for(const d of Object.keys(DOCS)){ const t=show(SHA,SP+DOCS[d]); if(t) A[d]=JSON.parse(t); }
  if(Object.keys(A).length===3){
    check('2. 三份稿都是定稿、已套源稿：AA_869（BB_413）51 列、AA_870（BB_414）37 列、AA_871（BB_415）49 列；每列 file、old、new（有的多一欄 why）',
      A.AA_869.rows.length===51&&A.AA_870.rows.length===37&&A.AA_871.rows.length===49&&Object.keys(A).every((d,i)=>/^定稿/.test(A[d]._meta.status)&&A[d]._meta.status.includes('BB_41'+(3+i))&&/已套/.test(A[d]._meta.applied)&&A[d].rows.every(r=>['file','new','old'].every(k=>typeof r[k]==='string'&&r[k])&&Object.keys(r).every(k=>['file','new','old','why'].includes(k)))),J(Object.keys(A).map(d=>A[d]._meta.status)));
    const bad=R.filter(r=>{ const x=A[r.doc]&&A[r.doc].rows[r.row]; return !(x&&x.file===r.loc&&x.new===r.new&&(x.old===r.old||(RE_T.test(r.path)&&x.old.indexOf(r.old+'（')===0))); });
    const noted=R.filter(r=>A[r.doc].rows[r.row].old!==r.old);
    check('2. KXNL_1112 的 137 格和稿一列對一格（doc、row、地點、old、new 都一樣）；稿的 old 多寫說明「（…選項一）」的只有四列選項（D02.pond、D06.gallery、D22.fish、D29.warehouse）',bad.length===0&&J(noted.map(r=>RE_T.exec(r.path)[1]))===J(['D02.pond','D06.gallery','D22.fish','D29.warehouse']),J(bad.map(r=>r.doc+'#'+r.row)));
  } else console.log('（跳過第 2 項：讀不到 '+SHA+' 的 AA_869／870／871，企劃線沒 fetch）');
  if(haveSrc){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+KX+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 137 格不同、old／new 都照表（別人 0 格、fx 0 格）',diff.length===137&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿用 src248 還原（拿掉 fx，各輪續改＋這 137 格）＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
    const ch=R.filter(r=>RE_T.test(r.path)).map(r=>[r,get(OLD[r.loc].lines[KX],r.path.replace(/\/t$/,'')),get(SRC[r.loc].lines[KX],r.path.replace(/\/t$/,''))]);
    const strip=c=>J(Object.assign({},c,{t:0,reply:(c.reply||[]).map(x=>Object.assign({},x,{text:0}))}));
    check('8. 換了字的 27 個選項：源稿兩版那個選項只差 t 和回話的字（fx、回話的句數、說話的人、其他欄都一樣）；每個互動點的選項數沒變',ch.length===27&&ch.every(([r,a,b])=>a&&b&&a.t===r.old&&b.t===r.new&&strip(a)===strip(b))
      &&ch.every(([r])=>get(OLD[r.loc].lines[KX],r.path.replace(/\/\d+\/t$/,'')).length===get(SRC[r.loc].lines[KX],r.path.replace(/\/\d+\/t$/,'')).length),J(ch.filter(([r,a,b])=>!(a&&b&&strip(a)===strip(b))).map(x=>gp(x[0]))));
  } else console.log('（跳過第 3、8 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==r.new).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 137 格＝稿的新字，一字不差',bad.length===0,J(bad.slice(0,4)));
  const E=require('./ellipsis694.js'), g=R.filter(r=>E.strip(r.new)!==r.new);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0,J(g.map(r=>r.new)));
  check('4. 那 110 句都是她自己說的（who＝kexin）；27 個選項的字都是「…」包著',R.filter(r=>!RE_T.test(r.path)).every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===KX; })&&R.filter(r=>RE_T.test(r.path)).every(r=>/^「.+」$/.test(r.new))); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source'&&p!=='/lines/kexin/cancel/1'/* （CANON-NO-ECON-1112 第四批：照 AA_899 換字）可昕取消約會第二句 */) diff.push(p);
    const want=R.map(gp).sort();
    { const ZN=C.ZR904_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_02/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!ZN.includes(p)) diff.push(p); check('5. 之後芷若再去一次那一次重匯（417c5cb9ce，AA_904）58 格也換了字（date_src_sha.js ZR904_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZR904_1112.length===58&&ZN.length===58,J(ZN.length)); }   /* 2026-11-12（芷若再去一次 AA_904@417c5cb9ce）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const QN=C.ZQ909_1112.map(r=>'/loc/'+r.loc+'/lines/heroine_04/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!QN.includes(p)) diff.push(p); check('5. 之後子晴到達句那一次重匯（6221c8e80f，AA_909）8 格也換了字（date_src_sha.js ZQ909_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.ZQ909_1112.length===8&&QN.length===8,J(QN.length)); }   /* 2026-11-12（子晴到達句 AA_909@6221c8e80f）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const SN=C.PS913_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!SN.includes(p)) diff.push(p); check('5. 之後沛珊收尾那一次重匯（f561545f38，AA_913）42 格也換了字（date_src_sha.js PS913_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS913_1112.length===42&&SN.length===42,J(SN.length)); }   /* 2026-11-12（沛珊收尾 AA_913@f561545f38）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const S4=C.PS914_1112.map(r=>'/loc/'+r.loc+'/lines/classmate_peishan/'+r.path).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!S4.includes(p)) diff.push(p); check('5. 之後沛珊再訪那一次重匯（dce2f8c08b，AA_914）53 格也換了字（date_src_sha.js PS914_1112；逐格在 tests/zr904_dates_1112_unit.js）——這裡先拿掉再比',C.PS914_1112.length===53&&(S4.length===53||S4.length===52)/* D21.street 那一格 D158_1112 也改過：前面那一層已經拿掉、或是這一輪的 want 就算 52 */,J(S4.length)); }   /* 2026-11-12（沛珊再訪 AA_914@dce2f8c08b）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    { const K5=C.KX921_1112.map(r=>'/loc/'+r.loc+'/lines/'+r.who+'/'+(r.gpath||r.path)).filter(p=>diff.includes(p)&&!want.includes(p)), all=diff.slice(); diff.length=0; for(const p of all) if(!K5.includes(p)) diff.push(p); check('5. 之後第五批（6dbfe10d7e，AA_917／918 收尾、AA_921 可昕清句、AA_923 D09）118 格也換了字（date_src_sha.js KX921_1112）——這裡先拿掉再比',C.KX921_1112.length===118&&K5.length===118,J(K5.length)); }   /* 2026-11-12（CANON-NO-ECON-1112 第五批 6dbfe10d7e）：舊期望是拿掉上面那幾層以後就只差這一輪的格子 */
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 137 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 137 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old),J(R.filter(r=>a[gp(r)]!==r.old).slice(0,3).map(gp)));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
    const osp=show(BASE,'src/data/she_pays.js'), ow=show(BASE,'src/data/date_wish.js');
    check('7. src/data/she_pays.js、src/data/date_wish.js 和重匯以前（'+BASE+'）一模一樣',osp===read('src/data/she_pays.js')&&ow===read('src/data/date_wish.js'));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const bad=R.filter(r=>get(NOW,gp(r))===r.old);
  check('6. 137 句舊字都不在那一格了',bad.length===0,J(bad.map(gp).slice(0,4)));
  const b=leaves(NOW.loc,'',{}), kxLeft=Object.keys(b).filter(p=>p.indexOf('/lines/'+KX+'/')>0&&typeof b[p]==='string'&&R.some(r=>r.old.length>=8&&r.old===b[p]));
  check('6. 可昕的格子裡沒有別的地方還留著這一批的舊句（八個字以上的整句）',kxLeft.length===0,J(kxLeft.slice(0,4))); }

// 7
{ const d3=read('src/date3d.js'), sp=read('src/data/she_pays.js'), a5=read('src/aa524_3d.js'), SPD=vm.runInNewContext(sp+';SHE_PAYS_DATA'), keys=J([SPD.pays,SPD.split]);
  const hit=(t,o)=>t.includes("'"+o+"'")||t.includes('"'+o+'"');
  const left=R.filter(r=>hit(d3,r.old)||hit(a5,r.old)).map(r=>r.loc+' '+r.old);
  check('7. src/date3d.js、src/aa524_3d.js 照整句認句子、拿選項的字當 key 的表裡沒有留著這 137 格的舊字',left.length===0,J(left));
  check('7. src/data/she_pays.js（她請、平分）裡沒有這 137 格的舊字、也沒有新字（可昕這一批改的不是她請客的那幾句）；來源照舊寫 AA_812@3cb2939d0',R.every(r=>!keys.includes(J(r.old))&&!keys.includes(J(r.new)))&&SPD.src.endsWith('AA_812_date_pays_promises.json@3cb2939d0'));
  const bad=[];
  for(const part of ['pays','split']) for(const who of Object.keys(SPD[part]||{})) for(const pid of Object.keys(SPD[part][who])) for(const t of SPD[part][who][pid]){
    const H=get(NOW,'/loc/'+pid.slice(0,3)+'/lines/'+who+'/hotspots/'+pid), n=Object.values(leaves(H||{},'',{})).filter(v=>v===t).length; if(n!==1) bad.push([part,who,pid,t,n]); }
  check('7. she_pays.js 的每一句（她請、平分）都還在遊戲裡那個互動點底下剛好一處',bad.length===0,J(bad));
  const d=git(['diff','--name-only',PREV,SHA,'--',SP+'AA_812_date_pays_promises.json',SP+'date_rewrite/']);
  if(d!==null) check('7. AA_812 和改稿紀錄 date_rewrite/ 在 '+SHA+' 和 '+PREV+' 逐檔一樣（所以白名單那幾筆不換版）',d.trim()==='',d);
  else console.log('（跳過第 7 項的對稿：讀不到 '+SHA+'／'+PREV+'）');
  const PF=[['D06','heroine_04','D06.cafe','「我請妳。」'],['D15','heroine_04','D15.store','「布丁不行。」'],['D05','classmate_peishan','D05.cafe','「我請妳。」'],['D04','heroine_02','D04.snack','「下次換我請。」'],['D10','heroine_03','D10.boat','「我請。」']];
  const pfBad=PF.filter(([l,w,p,t])=>!((d3+a5).includes("pid:'"+p+"'")&&(d3+a5).includes("'"+t+"'")&&(get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/first/choice')||[]).some(c=>c.t===t)&&get(NOW,'/loc/'+l+'/lines/'+w+'/hotspots/'+p+'/remember')));
  check('7. 拿選項的字當 key 的五筆（都不是可昕的）：選項的字都還在、那個互動點都還有 remember',pfBad.length===0&&PF.every(x=>x[1]!==KX),J(pfBad)); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
