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
const C=require('./date_src_sha.js'), SP='docs/story_planning/', BASE='c0a12c42e3', PREV=C.HAO_1112_PREV;   /* BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
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
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；'+PREV+' 在 history',C.ALLOW_SHA==='41f77eab53'&&PREV==='a573a50dca'&&bad.length===0,J(bad));
  check('1. date_lines.js 的來源寫著 33 個地點 @'+C.ALLOW_SHA,LOCS.every(k=>NOW.source.includes(k+'.json@'+C.ALLOW_SHA))); }

// 表本身（不用讀稿）
{ const n={}; for(const r of R) n[r.doc]=(n[r.doc]||0)+1;
  check('HAO_1112 一共 259 格：AA_842 學姊 80、AA_843 語彤 48、AA_844 沛珊 43、AA_845 芷若 88；每一列的 who＝那一份的人；沒有同一格',R.length===259&&Object.keys(DOCS).every(d=>n[d]===DOCS[d][2])&&R.every(r=>DOCS[r.doc]&&DOCS[r.doc][1]===r.who)&&new Set(R.map(gp)).size===259,J(n));
  check('HAO_1112 每一格都是 hotspots/<互動點>/first/choice/n/reply/0/text，互動點開頭＝地點；old≠new',R.every(r=>{ const m=RE_PATH.exec(r.path); return m&&m[1].slice(0,3)===r.loc&&r.old!==r.new&&r.old&&r.new; }),J(R.filter(r=>!RE_PATH.test(r.path)).slice(0,3))); }

// 2、3
{ const SRC={}, OLD={}; for(const k of LOCS){ const t=show(C.ALLOW_SHA,SP+'date_system/lines/'+k+'.json'), u=show(PREV,SP+'date_system/lines/'+k+'.json'); if(t) SRC[k]=JSON.parse(t); if(u) OLD[k]=JSON.parse(u); }
  const haveSrc=Object.keys(SRC).length===33&&Object.keys(OLD).length===33;
  const T={}; for(const d of Object.keys(DOCS)){ const t=show(C.ALLOW_SHA,SP+DOCS[d][0]); if(t) T[d]=JSON.parse(t).rows; }
  if(Object.keys(T).length===4){
    const key=(doc,loc,pt,o,n)=>J([doc,loc,pt,o,n]);
    const want=Object.keys(T).flatMap(d=>T[d].map(r=>key(d,r.file.slice(-8,-5),r.point,r.old,r.new))).sort(), have=R.map(r=>key(r.doc,r.loc,RE_PATH.exec(r.path)[1],r.old,r.new)).sort();
    check('2. 稿的列數：AA_842 80、AA_843 48、AA_844 43、AA_845 88；每一列的 who 是那一份的人、file 是 date_system/lines/Dxx.json、互動點開頭＝地點',Object.keys(DOCS).every(d=>T[d].length===DOCS[d][2]&&T[d].every(r=>r.who===DOCS[d][1]&&/^date_system\/lines\/D\d\d\.json$/.test(r.file)&&r.point.slice(0,3)===r.file.slice(-8,-5))),J(Object.keys(T).map(d=>T[d].length)));
    check('2. HAO_1112（'+R.length+' 格）和稿一列對一格（哪一份、地點、互動點、old、new 都一樣；沒有重複）',new Set(want).size===259&&J(want)===J(have),J(want.filter(x=>!have.includes(x)).slice(0,3)));
    if(haveSrc){ const all=Object.keys(T).flatMap(d=>T[d].map(r=>[d,r]));
      const bad=all.filter(([d,r])=>{ const k=r.file.slice(-8,-5), x=R.filter(q=>q.doc===d&&q.loc===k&&RE_PATH.exec(q.path)[1]===r.point&&q.old===r.old&&q.new===r.new); if(x.length!==1) return true; const ch=get(SRC[k].lines[r.who],x[0].path.replace(/\/reply\/0\/text$/,'')); return !(ch&&ch.t===r.option); });
      check('2. 稿每一列的 option＝源稿那個選項的 t（那一格真的是那個選項的回話）',bad.length===0,J(bad.slice(0,3))); }
  } else console.log('（跳過第 2 項：讀不到 '+C.ALLOW_SHA+' 的 AA_842～AA_845，企劃線沒 fetch）');
  if(haveSrc){
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=R.map(r=>J([r.loc,'/lines/'+r.who+'/'+r.path,r.old,r.new])).sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+C.ALLOW_SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：剛好 259 格不同、old／new 都照稿',diff.length===259&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 不同的格子都在這四個人底下、都是 hotspots/*/first/choice/n/reply/0/text（別人 0 格、fx 0 格、選項的字 0 格）',diff.every(([k,p])=>{ const m=/^\/lines\/([^/]+)\/(.+)$/.exec(p); return m&&C.HAO_WHO.includes(m[1])&&RE_PATH.test(m[2]); }),J(diff.filter(([k,p])=>!/\/first\/choice\/\d+\/reply\/0\/text$/.test(p)).slice(0,3)));
    check('3. 源稿用 src248 還原（拿掉 fx，可昕 72、以安 59、學姊 78 格＋多的一套、這 259 格）＝上一版同樣還原',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW,gp(r))!==r.new).map(r=>r.loc+' '+r.who+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW,gp(r))+'」');
  check('4. 遊戲那 259 格＝稿的新字，一字不差',bad.length===0,J(bad.slice(0,4)));
  const E=require('./ellipsis694.js'), g=R.filter(r=>r.game||E.strip(r.new)!==r.new);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0,J(g.map(r=>[r.new,r.game])));
  check('4. 那 259 格都是她自己說的（reply[0].who＝那個人）、那個選項的回話只有這一句的照舊',R.every(r=>{ const x=get(NOW,gp(r).replace(/\/text$/,'')); return x&&x.who===r.who; })); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=R.map(gp).sort();
    check('5. 遊戲整份（'+Object.keys(b).length+' 格）和重匯以前（'+BASE+'）逐格比：只有這 259 格不同（別人、fx、短句、交通偏好零差異）',Object.keys(b).length>30000&&J(diff.sort())===J(want),J(diff.filter(p=>!want.includes(p)).slice(0,4)));
    check('5. 那 259 格重匯以前＝稿的 old',R.every(r=>a[gp(r)]===r.old),J(R.filter(r=>a[gp(r)]!==r.old).slice(0,3).map(r=>[gp(r),a[gp(r)],r.old])));
    check('5. un812 把現在的遊戲檔還原以後＝重匯以前的遊戲檔 un812（別支測試「和重匯以前比」用的還原是對的）',J(C.un812(NOW).loc)===J(C.un812(DL(wt)).loc));
  } else console.log('（跳過第 5 項：讀不到 '+BASE+' 的 src/data/date_lines.js）'); }

// 6
{ const b=leaves(NOW.loc,'',{}), cnt={}; for(const p of Object.keys(b)) if(typeof b[p]==='string') cnt[b[p]]=(cnt[b[p]]||0)+1;
  const left=[...new Set(R.map(r=>r.old))].filter(o=>cnt[o]).map(o=>[o,cnt[o]]);
  /* 同一句別的格子還有的（不是這一批的格子：AA 留著沒改的、別人的）：「好。」14 處、另外四句各 1 處——數目釘住，多了＝有格子沒換到 */
  const WANT={'好。':14,'好。下次我請。':1,'好。你走前面。':1,'好。你不要走太快。':1,'好。謝謝。':1};
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
  check('7. she_pays.js 跟著換字的三句（cells812 有 was）：語彤 D12.pier 她請一句、學姊 D22.fish 平分兩句；was→text＝這一批那一格的 old→new',rw.length===3&&J(rw.map(c=>[c.kind,c.who,c.pid]).sort())===J(RW.sort())&&rw.every(c=>R.some(r=>gp(r)===c.at&&r.old===c.was&&r.new===c.text)&&SPD[c.kind][c.who][c.pid].includes(c.text)),J(rw)); }

// 8
{ const RE=/[一兩二三四]件事|第三件|第三格|第三點|^[一二三]，/;   /* ＝tests/sis_no_three_unit.js 的 RE */
  const t=read('tests/sis_no_three_unit.js');
  const hit=R.filter(r=>r.who==='heroine_05').map(r=>r.new).filter(s=>RE.test(s));
  check('8. 學姊 80 句新字沒有數件數的說法（和 tests/sis_no_three_unit.js 同一條規則）',t.includes('const RE='+String(RE)+';')&&hit.length===0,J(hit)); }

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
