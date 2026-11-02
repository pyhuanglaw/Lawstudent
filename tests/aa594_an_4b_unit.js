// AA_594 以安改稿④b（不分年級的系統事件）：企劃線 4162d22e1 的表逐列核對（AA594-AN-4B-1102）——不需要瀏覽器。
//   1  稿讀得到；白名單有這一份（sha 4162d22e1、approved、task AA594-AN-4B-1102）
//   2  手抄檔與程式（multirel、cracktalk、cracktalk3d、fest、aa187、heroine_asks、termend、date3d、feed_dates、vac_activities、wz_events、heard_lines）：
//      「改成」是位置欄那個檔的字串常數、原句的字串常數不在；使1～使8 採新版（第 10 節）、使2 只換 multirel_lines.js:416 那一處；
//      第 33 列（v6ex_lines.js 前任那一句）先不改（交 AA_600，衝突時以 AA_600 為準）
//   3  date_wish.js（產生檔）：第 2-13 節 16 列＋第 368 列記憶名稱，tools/date/import_wish.py 疊 AA_594 重匯；以安那一場裡原句不在
//   4  date_lines.js（產生檔）：第 2-14 節 314 列，位置欄的路徑那一格＝改成（BB_240 補回的 20 列＝原句）；tools/date/import_date_lines.py 疊 AA_594 重匯
// 修改前（73b3cd9d4 的 src、白名單放進這支測試實際跑，AA594_ROOT）：FAIL 11、PASS 3；修改後 ALL PASS（14 項）。
// 用法：node tests/aa594_an_4b_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process');
const GITDIR=path.join(__dirname,'..'), ROOT=path.resolve(process.env.AA594_ROOT||GITDIR);
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok||info===undefined?'':'　'+info)); if(!ok) fails++; };
const J=JSON.stringify, R=p=>fs.readFileSync(path.join(ROOT,p),'utf8');
const SHA='4162d22e1', SPEC='docs/story_planning/AA_594_以安改稿_4b_不分年級系統事件.md';
const DOC=(()=>{ try{ return cp.execSync('git show '+SHA+':"'+SPEC+'"',{cwd:GITDIR,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } })();
const SRC={}; (function walk(d){ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)&&!/chars3d/.test(f)) SRC[p]=R(p); } })('src');
const stripC=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/^\s*\/\/.*$/mg,'');
const CODE={}; for(const p in SRC) CODE[p]=stripC(SRC[p]);
const lit=t=>/^「.*」$/.test(t)?["'"+t+"'",'"'+t+'"']:["'"+t+"'",'"'+t+'"'];
const inLit=(code,t)=>lit(t).some(x=>code.includes(x));
const fileOf=where=>{ const m=where.match(/^`?([\w.]+\.js)/); if(!m) return null; return Object.keys(SRC).find(p=>p.endsWith('/'+m[1]))||null; };
const rows=[]; for(const line of DOC.split('\n')){ const m=line.match(/^\|\s*([0-9]+|使[0-9]+)\s*\|(.*)\|\s*$/); if(!m) continue; const c=m[2].split('|').map(x=>x.trim()); if(c.length<5) continue; rows.push({n:m[1],where:c[0],who:c[1],old:c[2],nw:c[3],why:c[4]}); }
const isGen=r=>/^date_(lines|wish)\.js/.test(r.where);
// ---------- 1 ----------
check('1. 讀得到稿（AA_594 @'+SHA+'：第 9、10 節）',DOC.length>100000&&/本批全部可以交 LAWWW 整合/.test(DOC)&&/使1～使8/.test(DOC),String(DOC.length));
{ const A=JSON.parse(R('docs/handoff/story_import_allow.json')).files.filter(e=>e.path===SPEC);
  check('1. 白名單有 AA_594（sha '+SHA+'、approved、AA594-AN-4B-1102）',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&A[0].task==='AA594-AN-4B-1102',J(A)); }
check('1. 表：數字列 368、使1～使8',rows.filter(r=>/^\d+$/.test(r.n)).length===368&&rows.filter(r=>/^使/.test(r.n)).length===8,rows.length);
// ---------- 2 手抄檔與程式 ----------
const HAND=rows.filter(r=>!isGen(r)&&r.old!==r.nw&&r.n!=='33');
{ const bad=[]; for(const r of HAND){ const f=fileOf(r.where), nw=r.nw.replace(/^「(.*)」$/,'$1'), old=r.old.replace(/^「(.*)」$/,'$1');
    const has=t=>inLit(CODE[f],t)||inLit(CODE[f],'「'+t+'」');
    if(!f||!has(nw)) bad.push('#'+r.n+' 改成不在 '+f+'：'+r.nw);
    if(f&&has(old)) bad.push('#'+r.n+' 原句還在 '+f+'：'+r.old); }
  check('2. 手抄檔與程式 '+HAND.length+' 列（含使1～使8）：改成是位置欄那個檔的字串常數、原句不在',HAND.length===43&&!bad.length,J({n:HAND.length,bad})); }
check('2. 使2 只換 multirel_lines.js:416 那一處：opt「我想再跟妳試一次。」',/heroine_01:\{ opt:'「我想再跟妳試一次。」'/.test(CODE['src/data/multirel_lines.js'])&&!/'「我想再寫一次理由欄。」'/.test(CODE['src/data/multirel_lines.js']));
check('2. 第 3 列兩處（an_cafe、an_jp）都是「有一件事，要當面說。」、沒有「理由：」',(CODE['src/data/cracktalk_lines.js'].match(/'有一件事，要當面說。'/g)||[]).length===2&&!/理由：有一件事/.test(CODE['src/data/cracktalk_lines.js']));
check('2. 第 33 列（v6ex_lines.js 前任「理由我懂。不用解釋。」）先不改：交 AA_600',inLit(CODE['src/data/v6ex_lines.js'],'理由我懂。不用解釋。'));
// ---------- 3 date_wish ----------
{ global.window=global; let W=null; try{ eval(R('src/data/date_wish.js').replace(/const DATE_WISH=/,'W=')); }catch(e){}
  const E=W&&W.events&&W.events.heroine_01, s=J(E||{});
  const WR=rows.filter(r=>/^date_wish/.test(r.where)&&r.old!==r.nw);
  const bad=WR.filter(r=>!s.includes(J(r.nw).slice(1,-1))||s.includes(J(r.old).slice(1,-1))).map(r=>'#'+r.n);
  check('3. date_wish.js 以安 D07：第 2-13 節 '+WR.length+' 列（含第 368 列記憶名稱）改成在、原句不在',WR.length===16&&!!E&&!bad.length,J(bad));
  check('3. 第 45、49 列（兩處都換）：一般版、大一版都換',!!E&&(s.match(/今天才想到，要有人願意聽，大家才講得完。/g)||[]).length===2&&(s.match(/她拿出筆記本，寫了一行，沒有給你看。/g)||[]).length===2);
  check('3. 記憶 AN_REASON_HIDDEN 的名稱「她的手帳有一行沒給你看」（id 不變）',!!E&&/"memory": \{"tag": "AN_REASON_HIDDEN", "text": "她的手帳有一行沒給你看"\}/.test(R('src/data/date_wish.js')));
  check('3. source 寫明疊了 AA_594；import_wish.py 有 1e 那一段（白名單 AA_594_、16 列、處數對不上就停）',R('src/data/date_wish.js').includes('AA_594@'+SHA+'（以安 D07 心願 16 列）')&&/A594 = G\.approved_files\(ALLOW, SP \+ 'AA_594_'\)/.test(fs.readFileSync(path.join(GITDIR,'tools/date/import_wish.py'),'utf8'))); }
// ---------- 4 date_lines ----------
{ const s=R('src/data/date_lines.js'); let D=null; try{ D=JSON.parse(s.slice(s.indexOf('const DATE_LINES=')+17,s.lastIndexOf(';'))); }catch(e){}
  const LR=rows.filter(r=>/^date_lines/.test(r.where)), bad=[];
  const get=p=>{ const toks=p.match(/\['[^']*'\]|\[\d+\]|[^.[\]]+/g); let cur={lines:D.lines,loc:D.loc}; for(let i=0;i<toks.length;i++){ let t=toks[i], k=t.startsWith("['")?t.slice(2,-2):t.startsWith('[')?+t.slice(1,-1):t;
      if(cur&&typeof cur==='object'&&!(k in cur)&&i+1<toks.length&&!toks[i+1].startsWith('[')&&(k+'.'+toks[i+1]) in cur){ k=k+'.'+toks[i+1]; i++; } if(cur==null) return undefined; cur=cur[k]; } return cur; };
  if(D) for(const r of LR){ const pm=r.where.match(/`([^`]+)`/); const v=pm?get(pm[1]):undefined, t=typeof v==='string'?v:(v&&v.text);
    if(!(t===r.nw||('（'+t+'）'===r.nw))) bad.push('#'+r.n+' '+(pm&&pm[1])+'＝'+t); }
  check('4. date_lines.js：第 2-14 節 '+LR.length+' 列，位置欄的路徑那一格＝改成（'+LR.filter(r=>r.old===r.nw).length+' 列 BB_240 補回原句）',!!D&&LR.length===314&&!bad.length,J(bad.slice(0,5)));
  check('4. source 寫明 AA_594；import_date_lines.py 疊 AA_594（白名單 AA_594_、路徑對不上就停）',!!D&&/AA_594_以安改稿_4b_不分年級系統事件\.md@4162d22e1/.test(D.source)&&/A594 = G\.approved_files\(ALLOW, SP \+ 'AA_594_'\)/.test(fs.readFileSync(path.join(GITDIR,'tools/date/import_date_lines.py'),'utf8')));
  check('4. date_lines.js 以安的台詞裡沒有「理由」「手帳」（表上改的都換了；舊句只剩她以外的人）',!!D&&!/理由|手帳/.test(J(D.lines.heroine_01))); }
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
