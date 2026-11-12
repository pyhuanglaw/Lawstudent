// X324 可昕續改第五批（使用者：「繼續改，從可昕開始」）：AA_827_kx_triple_short_2.json（其他檔的三連短句，AA-C 2026-11-12 定稿、BB-C 第二意見；企劃線 07d50af2f7）——不需要瀏覽器（D131）。
// 稿八列 {file, line, old, new}：手寫檔七列用 tools/story/apply_line_rows.py 套（events.js、invites.js 兩列、r2y3a_events.js 兩列、r2y4a_events.js、bbpack_events.js）；
// movie_plots.js 那一列是產生檔——AA 改了源稿 AA_745_movie_plots_2.json，白名單換版、tools/movie/import_movie_plots.py 重匯。
// 檢查：
//   1. tests/kx_rewrite_1112.js 的 PAIRS（別支測試共用）和稿的手寫檔七列一列對一列
//   2. 每一列：那個檔的字串常值裡新句剛好一次、舊句沒有了；和匯入以前（BASE）比，那個檔的字串常值只差稿上的列
//   3. 電影那一列：白名單 AA_745_movie_plots_2.json@07d50af2f7（4e41f0d09 在 history）；源稿兩版只差這一句；movie_plots.js 新句一次、舊句沒有；和 BASE 比字串常值只差這一句（和來源的 @sha）
//   4. 重跑 apply_line_rows.py（空跑）：七列都印「已經換過」、結束碼 0（重跑不會壞）
// 稿讀 git show；讀不到（淺層複本）＝第 1、3 項比稿的部分跳過並印出來。用法：node tests/kx_triple2_1112_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.join(__dirname,'..'), J=JSON.stringify, K=require('./kx_rewrite_1112.js'), BASE='d6e6a6f215';   /* BASE＝匯入以前的開發分支（claude/adoring-meitner-mqzst8） */
let fails=0; const check=(n,ok,d)=>{ if(ok) console.log('PASS '+n); else { fails++; console.log('FAIL '+n+(d!==undefined?'　'+d:'')); } };
const read=f=>fs.readFileSync(path.join(ROOT,f),'utf8');
const show=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',ROOT,'show',sha+':'+f],{encoding:'utf8',maxBuffer:64<<20,stdio:['ignore','pipe','ignore']}); }catch(e){ return null; } };
const noComments=s=>s.replace(/\/\*[\s\S]*?\*\//g,'').replace(/(^|[^:'"])\/\/[^\n]*/g,'$1');
const lits=s=>[...noComments(s).matchAll(/'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"/g)].map(m=>m[1]!==undefined?m[1]:m[2]);
const cnt=(a,x)=>a.filter(y=>y===x).length;
const bag=a=>{ const m=new Map(); for(const x of a) m.set(x,(m.get(x)||0)+1); return m; };
const bagDiff=(a,b)=>{ const A=bag(a), B=bag(b), gone=[], came=[]; for(const [k,v] of A) for(let i=0;i<v-(B.get(k)||0);i++) gone.push(k); for(const [k,v] of B) for(let i=0;i<v-(A.get(k)||0);i++) came.push(k); return [gone.sort(),came.sort()]; };

const raw=show(K.SHA,K.DOC), D=raw?JSON.parse(raw):null;
const MOV={file:'src/data/movie_plots.js',old:'好。你哪天有空。帶電腦。',new:'好，你哪天有空？記得帶電腦。',src:'docs/story_planning/AA_745_movie_plots_2.json',prev:'4e41f0d09'};

// 1
if(D){ const hand=D.rows.filter(r=>!r.generated), gen=D.rows.filter(r=>r.generated);
  check('1. 稿 8 列：手寫檔 7 列＋產生檔 1 列（movie_plots.js）',D.rows.length===8&&hand.length===7&&gen.length===1&&gen[0].file===MOV.file&&gen[0].old===MOV.old&&gen[0].new===MOV.new,J([D.rows.length,hand.length]));
  check('1. kx_rewrite_1112.js 的 PAIRS 和稿的手寫檔七列一列對一列（檔、old、new）',J(hand.map(r=>[r.file,r.old,r.new]))===J(K.PAIRS));
} else console.log('（跳過第 1 項：讀不到 '+K.SHA+' 的 AA_827，企劃線沒 fetch）');

// 2
for(const f of [...new Set(K.PAIRS.map(x=>x[0]))]){ const now=lits(read(f)), rows=K.PAIRS.filter(x=>x[0]===f), was=show(BASE,f);
  for(const [,o,n] of rows) check('2. '+f+'：「'+n+'」剛好一次、舊句「'+o+'」沒有了',cnt(now,n)===1&&cnt(now,o)===0&&!noComments(read(f)).includes(o),J([cnt(now,n),cnt(now,o)]));
  /* 之後又進來的改句（同一個檔、別的稿）：AA_833 以安事件刪節號 10 列（41837baa3d，2026-11-12）——這裡一起算進「應該差的」 */
  const LATER={'src/data/events.js':['……對那個被限制的人呢？','……好，算一點。','……我們走吧。我不想在這裡待太久。','……好啦，我自己也記不住十二條。','……看到很多人不是壞人，只是沒有人幫他們把話講清楚。'],'src/data/r2y3a_events.js':['……不是。飯要涼了。']}[f]||[];
  if(was){ const [gone,came]=bagDiff(lits(was),now); const wantGone=rows.map(x=>x[1]).concat(LATER).sort(), wantCame=rows.map(x=>x[2]).concat(LATER.map(t=>t.slice(2))).sort(); check('2. '+f+' 的字串常值和匯入以前（'+BASE+'）比：只差稿上的 '+rows.length+' 列（＋AA_833 的 '+LATER.length+' 列）',J(gone)===J(wantGone)&&J(came)===J(wantCame),J([gone.slice(0,3),came.slice(0,3)])); }
  else console.log('（跳過：讀不到 '+BASE+' 的 '+f+'）'); }

// 3
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===MOV.src);
  check('3. 白名單 AA_745_movie_plots_2.json@'+K.SHA+' 一筆、approved、有 approvedBy；上一版 '+MOV.prev+' 在 history',e.length===1&&e[0].sha===K.SHA&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===MOV.prev),J(e.map(x=>[x.sha,x.status])));
  const a=show(MOV.prev,MOV.src), b=show(K.SHA,MOV.src);
  if(a&&b){ const la=a.split('\n'), lb=b.split('\n'), d=la.map((l,i)=>[l,lb[i]]).filter(([x,y])=>x!==y);
    check('3. 源稿 '+MOV.prev+' → '+K.SHA+'：行數一樣、只差一行（m2609a 可昕那一句 old→new）',la.length===lb.length&&d.length===1&&d[0][0].includes(J(MOV.old))&&d[0][1].includes(J(MOV.new))&&d[0][0].replace(J(MOV.old),J(MOV.new))===d[0][1],J(d.slice(0,2)));
  } else console.log('（跳過：讀不到源稿 AA_745_movie_plots_2.json，企劃線沒 fetch）');
  const now=lits(read(MOV.file)), was=show(BASE,MOV.file);
  check('3. movie_plots.js：新句剛好一次、舊句沒有了；來源寫著 AA_745_movie_plots_2.json@'+K.SHA,cnt(now,MOV.new)===1&&cnt(now,MOV.old)===0&&now.includes(MOV.src+'@'+K.SHA),J([cnt(now,MOV.new),cnt(now,MOV.old)]));
  if(was){ const [gone,came]=bagDiff(lits(was),now); check('3. movie_plots.js 的字串常值和匯入以前（'+BASE+'）比：只差這一句和來源的 @sha',J(gone)===J([MOV.src+'@'+MOV.prev,MOV.old].sort())&&J(came)===J([MOV.src+'@'+K.SHA,MOV.new].sort()),J([gone,came])); }
  try{ const M=new Function(read(MOV.file)+';return MOVIE_PLOTS;')(); const re=M.films.m2609a.later&&J(M.films.m2609a); check('3. 那一句在 MOVIE_PLOTS.films.m2609a（可昕）裡',J(M.films.m2609a).includes(J(MOV.new))&&!J(M).includes(J(MOV.old)),String(re).slice(0,80)); }catch(e){ check('3. movie_plots.js 載得起來',false,String(e&&e.message)); } }

// 4
if(D){ const r=cp.spawnSync('python3',[path.join(ROOT,'tools/story/apply_line_rows.py'),K.DOC+'@'+K.SHA,'--skip-generated'],{encoding:'utf8',timeout:120000}), out=(r.stdout||'')+(r.stderr||'');
  check('4. 重跑 apply_line_rows.py（空跑、--skip-generated）：結束碼 0、七列都「已經換過」、產生檔那一列跳過',r.status===0&&(out.match(/已經換過：/g)||[]).length===7&&/已經換過 7 列/.test(out)&&/跳過自動產生的檔 1 列/.test(out),out.slice(-300));
} else console.log('（跳過第 4 項：讀不到稿）');

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
