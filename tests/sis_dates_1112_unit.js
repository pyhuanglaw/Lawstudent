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
const NOWT=read('src/data/date_lines.js'), NOW=DL(NOWT), R=C.SIS_1112, ADD=C.SIS_1112_ADD;
const ADDP=ADD.flatMap(a=>Object.keys(leaves(a.set,'',{})).map(p=>[a.loc,a.path+'/'+a.index+p,get(a.set,p)]));   /* 多的那一套攤開成格子：[地點, path, 值] */

// 1
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files;
  const bad=LOCS.filter(k=>{ const e=allow.filter(x=>x.path===SP+'date_system/lines/'+k+'.json'); return !(e.length===1&&e[0].sha===C.ALLOW_SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===PREV)); });
  check('1. 白名單 D01～D33 都是 '+C.ALLOW_SHA+'、approved、有 approvedBy；'+PREV+' 在 history',C.ALLOW_SHA==='a573a50dca'&&PREV==='b22e4d1277'&&bad.length===0,J(bad));
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
    const diff=[]; for(const k of LOCS){ const a=leaves(OLD[k],'',{}), b=leaves(SRC[k],'',{}); for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]) diff.push([k,p,a[p],b[p]]); }
    const want=[...R.map(r=>J([r.loc,'/lines/'+SIS+'/'+r.path,r.old,r.new])),...ADDP.map(([k,p,v])=>J([k,'/lines/'+SIS+'/'+p,undefined,v]))].sort(), have=diff.map(x=>J(x)).sort();
    check('3. 源稿 '+C.ALLOW_SHA+' 和上一版 '+PREV+' 逐格比（含 fx）：只有學姊 78 格不同、old／new 都照稿，加上 D01 交往到達多的一套（'+ADDP.length+' 格）；別人 0 格',diff.length===78+ADDP.length&&ADDP.length===3&&J(want)===J(have),J(have.filter(x=>!want.includes(x)).slice(0,3)));
    check('3. 源稿拿掉 fx、用 src248 還原（可昕 72、以安 59、學姊 78 格＋多的一套）＝上一版拿掉 fx、還原同樣那幾格',LOCS.every(k=>J(C.src248(k,SRC[k]))===J(C.src248(k,OLD[k]))),J(LOCS.filter(k=>J(C.src248(k,SRC[k]))!==J(C.src248(k,OLD[k])))));
  } else console.log('（跳過第 3 項：讀不到源稿，企劃線沒 fetch）'); }

// 4
{ const bad=R.filter(r=>get(NOW.loc[r.loc].lines[SIS],r.path)!==(r.game||r.new)).map(r=>r.loc+' '+r.path+'：稿「'+r.new+'」遊戲「'+get(NOW.loc[r.loc].lines[SIS],r.path)+'」');
  check('4. 遊戲那 78 格＝稿的新字',bad.length===0,J(bad.slice(0,4)));
  const g=R.filter(r=>r.game);
  check('4. 和稿不一樣的格子：0（沒有被 AA_694 規則改到的句子）',g.length===0&&R.every(r=>require('./ellipsis694.js').strip(r.new)===r.new)&&ADD.every(a=>require('./ellipsis694.js').strip(a.set.lines[0].text)===a.set.lines[0].text),J(g.map(r=>[r.new,r.game])));
  const d=get(NOW.loc.D01.lines[SIS],'arrive/dating');
  check('4. D01 交往到達現在兩套（都是 tier any、各一句）：第一套＝AA_837 改的字、第二套＝稿加的那一句',Array.isArray(d)&&d.length===2&&J(d[1])===J(ADD[0].set)&&d[0].tier==='any'&&d[0].lines.length===1&&d[0].lines[0].text==='（她把手伸過來）走吧。',J(d)); }

// 5
{ const wt=show(BASE,'src/data/date_lines.js');
  if(wt){ const a=leaves(DL(wt),'',{}), b=leaves(NOW,'',{}); const diff=[]; for(const p of new Set([...Object.keys(a),...Object.keys(b)])) if(a[p]!==b[p]&&p!=='/source') diff.push(p);
    const want=[...R.map(r=>'/loc/'+r.loc+'/lines/'+SIS+'/'+r.path),...ADDP.map(([k,p])=>'/loc/'+k+'/lines/'+SIS+'/'+p)].sort();
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
