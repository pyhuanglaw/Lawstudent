// 可昕講到末班車的幾句只在晚上（KX-MOVIE-BYE-1107；AA_708 e0e92919e 的 day）——不需要瀏覽器（D131）。
// 起因：BB_255 CC 試玩：可昕看電影第 1 場的散場句「末班車還有。好險。」下午 14:00 那一場也會說。
// 檢查：0 匯入一致（activity_scenes.js 照 e0e92919e、有 day）；1 電影第 1 場 14:00＝「出來天還這麼亮。」「我搭下一班就好，不用趕。」、20:00＝「末班車還有。好險。」
//       2 電影第 3 場、咖啡第 3 場（seat）、書店第 3 場白天換 day 那一格、晚上照原本；3 沒有 day 的場次白天晚上一樣。修改前 FAIL。用法：node tests/kx_movie_day_unit.js
const H=require('./pg_harness.js'); const {check}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/data/activity_scenes.js',['ACTIVITY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
const K=ACTIVITY_SCENES.kinds, sc=(kind,k)=>K[kind].people.kexin.scenes[String(k)];
check('0. activity_scenes.js 照 AA_708 白名單版本（256bcdc42 起含 e0e92919e 的 day）、有 day',/@(e0e92919e|256bcdc42|d30416e6b|6dbfe10d7e|8d3bec48be)/.test(ACTIVITY_SCENES.src||'')&&!!(sc('movie',1)||{}).day,ACTIVITY_SCENES.src);
const at=h=>{ const G=H.fresh('2025-10-25',h,'campus'); return G; };
const r=(kind,k,h,f)=>STUDYN.resolve(at(h),sc(kind,k),{k,kind})[f];
/* 2026-11-11（X324 A 區，AA_708@d30416e6b）：可昕電影第 1 場散場句 AA 改了——白天第二句「我搭下一班就好，不用趕。」→「早知道就不用一直看時間。」、晚上「末班車還有。好險。」→「我中間看了一次手機。習慣而已，片子沒有問題。」（不再提搭車）；白天晚上還是不同句（day 照舊有用）。舊期望是那兩句舊字 */
check('1. 電影第 1 場：14:00 散場＝白天那兩句；20:00＝晚上那一句（白天晚上不同句）',J(r('movie',1,14,'bye'))===J(['出來天還這麼亮。','早知道就不用一直看時間。'])&&J(r('movie',1,20,'bye'))===J(['我中間看了一次手機。習慣而已，片子沒有問題。']),J([r('movie',1,14,'bye'),r('movie',1,20,'bye')]));
/* 2026-11-13 76f8 rc2（D158-KX-SAMESCHOOL，AA_987 rows；tests/d158_rc2_rows.json）：咖啡第 3 場坐下白天「我今天不趕車。」→「我今天報告寫完了。」、晚上「我今天不趕車。末班車才走。」→「我今天報告寫完了。可以坐久一點。」（晚上照資料比、白天晚上還是不同句）；舊期望是白天那句舊字 */
check('2. 電影第 3 場白天「出來天還亮著。」、咖啡第 3 場白天坐下「我今天報告寫完了。」、書店第 3 場白天「時間還早。我們再看一本。」；晚上都照原本',
  J(r('movie',3,15,'bye'))===J(['天還沒黑。'/* RC2-PORT-DEV-1114：AA_959 第 515 列（原「出來天還亮著。」）*/,'……我還不想回宿舍。'])/* （CANON-NO-ECON-1112 第四批：照 AA_894 換字）*/&&J(r('cafe',3,15,'seat'))===J(['我今天報告寫完了。'])&&J(r('cafe',3,19,'seat'))===J(['我今天報告寫完了。可以坐久一點。'])&&J(r('bookstore',3,15,'bye'))===J(['時間還早。我們再看一本。'])
  &&J(r('movie',3,19,'bye'))===J(sc('movie',3).bye)&&J(r('cafe',3,19,'seat'))===J(sc('cafe',3).seat)&&J(r('bookstore',3,19,'bye'))===J(sc('bookstore',3).bye));
check('3. 沒有 day 的場次（電影第 2 場）白天晚上一樣；resolve 的結果不帶 day',J(r('movie',2,14,'bye'))===J(r('movie',2,20,'bye'))&&!('day' in STUDYN.resolve(at(14),sc('movie',1),{k:1,kind:'movie'})));
H.done();
