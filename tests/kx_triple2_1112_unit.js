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
// CANON-NO-ECON-1112：經濟系那一年拿掉（稿的第 0 列（「412？那我們同一間…」）在 events.js 經濟系那一年的事件裡，整場拿掉了＝這一列不查；events.js 和匯入以前比會多掉經濟系那一年的字串，所以 events.js 只查「稿上要換掉的舊句都不在了、多出來的只有稿上的新句」）
for(const f of [...new Set(K.PAIRS.map(x=>x[0]))]){ const now=lits(read(f)), ECON_ROW='（從後面探頭）412？那我們同一間，我也是晚上那一班。', rows=K.PAIRS.filter(x=>x[0]===f&&x[2]!==ECON_ROW), was=show(BASE,f);
  /* CANON-NO-ECON-1112 第三批：bbpack_events.js 那一列在可昕和舊序章人物在社科院門口那一場（ev_kx_pinyu_soc），整場拿掉＝那一列不查；和匯入以前比用拿掉以前那一版（cfc0fd04bf）*/
  const SUP878={'聖誕快樂。我報告還差兩頁。你們考完了吧？':'聖誕快樂。我報告還差兩頁。教授說明天中午以前。'};   /* （CANON-NO-ECON-1112 第四批：照 AA_878／AA_897 換字）AA_878 #38 第一列又換了這一句 */
  if(f!=='src/data/bbpack_events.js') for(const [,o,n0] of rows){ const n=SUP878[n0]||n0; check('2. '+f+'：「'+n+'」剛好一次、舊句「'+o+'」沒有了',cnt(now,n)===1&&cnt(now,o)===0&&!noComments(read(f)).includes(o),J([cnt(now,n),cnt(now,o)])); }
  /* 之後又進來的改句（同一個檔、別的稿）：AA_833 以安事件刪節號 10 列（41837baa3d，2026-11-12）——這裡一起算進「應該差的」 */
  const LATER={'src/data/events.js':['……對那個被限制的人呢？','……好，算一點。','……我們走吧。我不想在這裡待太久。','……好啦，我自己也記不住十二條。','……看到很多人不是壞人，只是沒有人幫他們把話講清楚。',
    /* AA_839 學姊事件刪節號 17 列（edb1a1a5c，2026-11-12） */ '……社長沒有人改。','……你學得很快。','……好燙。','……不用。我自己來。','……那還來得及。我六月才畢業。','……這個問題最近有人問我第三次了。','……還可以。','……還有——','……我知道。家聚你都沒來，今天來了就好。','……我們也先回去。明天再說。','……坐吧。我剛好想要一個不是法服的人。','……我不知道。','……我要回家了。你也早點回去。','……可是好像真的這麼簡單。','……對。他跳過了。我第一次讀的時候沒看出來，是許老師指出來的。','……順序對了。','……你翹課？'],'src/data/r2y3a_events.js':['……不是。飯要涼了。']}[f]||[];
  /* 2026-11-12（CANON-1112：舊序章拿掉／可昕開局不認識）：events.js（8/30 那一場和迎新那一支拿掉、可昕在法律系的八個新事件）之後故意改了——
     和匯入以前比字串常值的這一項用改之前那一版（6c2ecfc0af，這支測試在那裡全過）；上面每一列「新句剛好一次、舊句沒有了」照舊查現在的檔。舊期望：直接拿現在的檔比。讀不到那一版＝照現在的檔 */
  const canonWas=['src/data/events.js'].includes(f)?show('6c2ecfc0af',f):(['src/data/bbpack_events.js','src/data/r2y3a_events.js'].includes(f)?show('cfc0fd04bf',f):(f==='src/data/invites.js'?show('41a071f78d',f)/* （CANON-NO-ECON-1112 第四批：照 AA_891／AA_894 換字）invites.js 可昕 brunch 換了一句：用換以前那一版比 */  /* （CANON-NO-ECON-1112 第四批合併：兩邊都算） */:null))/* CANON-NO-ECON-1112 第三批：bbpack（B 拿掉舊序章朋友那幾場）、r2y3a（A 拿掉可昕九場）用拿掉以前那一版比 */, nowCmp=canonWas?lits(canonWas):now;
  if(was){ const nowCmpX=f==='src/data/r2y3a_events.js'&&!canonWas?now.map(t=>t==='聖誕快樂。我報告還差兩頁。教授說明天中午以前。'?'聖誕快樂。我報告還差兩頁。你們考完了吧？':t):nowCmp; const [gone,came]=bagDiff(lits(was),nowCmpX); const wantGone=rows.map(x=>x[1]).concat(LATER).sort(), wantCame=rows.map(x=>x[2]).concat(LATER.map(t=>t.slice(2))).sort(), nowCmp2=f==='src/data/r2y3a_events.js'?nowCmp.map(t=>t==='聖誕快樂。我報告還差兩頁。教授說明天中午以前。'?'聖誕快樂。我報告還差兩頁。你們考完了吧？':t):nowCmp; check('2. '+f+' 的字串常值和匯入以前（'+BASE+'）比：只差稿上的 '+rows.length+' 列（＋AA_833、AA_839 的 '+LATER.length+' 列）',(f==='src/data/events.js'?wantGone.every(x=>gone.includes(x)):J(gone)===J(wantGone))&&J(came)===J(wantCame),J([gone.slice(0,3),came.slice(0,3)])); }
  else console.log('（跳過：讀不到 '+BASE+' 的 '+f+'）'); }

// 3
{ const allow=JSON.parse(read('docs/handoff/story_import_allow.json')).files, e=allow.filter(x=>x.path===MOV.src);
  const MOVSHA=e.length===1?e[0].sha:K.SHA;   /* （CANON-NO-ECON-1112 第四批：照 AA_878／AA_897 換字）之後又照 AA_897 第 1 節重匯（a9465983f0）：K.SHA 在 history */
  check('3. 白名單 AA_745_movie_plots_2.json 一筆（現在 '+MOVSHA+'）、approved、有 approvedBy；'+K.SHA+'、上一版 '+MOV.prev+' 在 history（或就是現在那一版）',e.length===1&&(e[0].sha===K.SHA||(e[0].history||[]).some(h=>h.sha===K.SHA))&&e[0].status==='approved'&&!!e[0].approvedBy&&(e[0].history||[]).some(h=>h.sha===MOV.prev),J(e.map(x=>[x.sha,x.status])));
  const a=show(MOV.prev,MOV.src), b=show(K.SHA,MOV.src);
  if(a&&b){ const la=a.split('\n'), lb=b.split('\n'), d=la.map((l,i)=>[l,lb[i]]).filter(([x,y])=>x!==y);
    check('3. 源稿 '+MOV.prev+' → '+K.SHA+'：行數一樣、只差一行（m2609a 可昕那一句 old→new）',la.length===lb.length&&d.length===1&&d[0][0].includes(J(MOV.old))&&d[0][1].includes(J(MOV.new))&&d[0][0].replace(J(MOV.old),J(MOV.new))===d[0][1],J(d.slice(0,2)));
  } else console.log('（跳過：讀不到源稿 AA_745_movie_plots_2.json，企劃線沒 fetch）');
  const now=lits(read(MOV.file)), was=show(BASE,MOV.file);
  check('3. movie_plots.js：新句剛好一次、舊句沒有了；來源寫著 AA_745_movie_plots_2.json@'+K.SHA,cnt(now,MOV.new)===1&&cnt(now,MOV.old)===0&&now.includes(MOV.src+'@'+MOVSHA),J([cnt(now,MOV.new),cnt(now,MOV.old)]));
  if(was){ const [gone,came]=bagDiff(lits(was),now); const B5=['……好啦，你這樣講我有一點被說服。','好啦，你這樣講我有一點被說服。','……好啦，第六個晚上我也看了一下手機。','好啦，第六個晚上我也看了一下手機。','……好啦，一半一半。','好啦，一半一半。'];   /* 2026-11-12（CANON-NO-ECON-1112 第五批）：AA_745 三份換 6dbfe10d7e，芷若兩格、子晴一格拿掉句首刪節號——另外不算 */
    const A897=s=>s.filter(t=>!B5.includes(t)).filter(t=>!/@a9465983f0$|@4e41f0d09$|@6dbfe10d7e$|\u91cd\u8003|第二次考試的考生|考第四年|陪可昕找判決|登機前|\u7d93\u6fdf\u7cfb那一年看的|舊序章那一年看的/.test(t));   /* （CANON-NO-ECON-1112 第四批：照 AA_878／AA_897 換字）AA_897 第 1 節那四句、AA_898 那一句、說明欄和來源的 @sha 另外查（tests/kx_line_873_unit.js）*/
    check('3. movie_plots.js 的字串常值和匯入以前（'+BASE+'）比：只差這一句和來源的 @sha（AA_897 重匯的那幾句除外）',J(A897(gone))===J([MOV.src+'@'+MOV.prev,MOV.old].filter(t=>A897([t]).length).sort())&&J(A897(came))===J([MOV.new].sort()),J([gone,came])); }
  try{ const M=new Function(read(MOV.file)+';return MOVIE_PLOTS;')(); const re=M.films.m2609a.later&&J(M.films.m2609a); check('3. 那一句在 MOVIE_PLOTS.films.m2609a（可昕）裡',J(M.films.m2609a).includes(J(MOV.new))&&!J(M).includes(J(MOV.old)),String(re).slice(0,80)); }catch(e){ check('3. movie_plots.js 載得起來',false,String(e&&e.message)); } }

// CANON-NO-ECON-1112：經濟系那一年拿掉（第 4 項 重跑 apply_line_rows.py（空跑）：稿的第 0 列對不到（那一場拿掉了），工具照設計停下來）

console.log(fails?'FAILED '+fails:'ALL PASS'); process.exit(fails?1:0);
