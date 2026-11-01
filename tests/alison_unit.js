// AA_380（企劃線 eb0ccfec；任務 AA380-RENAME-ALISON-1021；使用者 2026-10-21 23:2x「改成Alison」）：「小語」改名 Alison——不需要瀏覽器。
//   1 遊戲會載入的檔（index.html 載入的 src/**/*.js）一處「小語」都沒有；src/data 也沒有
//   2 人物資料：yu 的 name＝Alison、全名 fullname 照舊李語晴、id 照舊 yu（存檔不受影響）
//   3 寫法：Alison 和中文字之間半形空格、挨標點不空（四個 AA_380 第 1 節的例子；Node 和匯入工具 Python 兩套結果一樣）
//   3b 遊戲裡的 SOCIAL.alison（舊存檔裡已經存下的舊名，顯示時換）和匯入工具同一套結果
//   4 匯入工具讀稿的地方都換（每一支 tools/*/import_*.py 讀 git show 的地方都包 alison）
// 修改前：第 1、2 項 FAIL。用法：node tests/alison_unit.js
'use strict';
const fs=require('fs'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..'); let fails=0;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const {alison}=require('./alison.js');
/* 1 */
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const srcs=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(s=>s.startsWith('src/'));
const all=new Set(srcs); const walk=d=>{ for(const f of fs.readdirSync(path.join(ROOT,d))){ const p=d+'/'+f; if(fs.statSync(path.join(ROOT,p)).isDirectory()) walk(p); else if(/\.js$/.test(f)) all.add(p); } }; walk('src');
const hits=[...all].filter(f=>fs.existsSync(path.join(ROOT,f))&&fs.readFileSync(path.join(ROOT,f),'utf8').includes('小語'));
check('1. index.html 和 src/ 的 '+all.size+' 個 js 都沒有「小語」',!html.includes('小語')&&!hits.length,JSON.stringify(hits));
/* 2 */
const c=fs.readFileSync(path.join(ROOT,'src/data/characters.js'),'utf8'); const yu=(c.match(/\byu:\{ id:'yu'[^\n]*/)||[''])[0];
check('2. yu：name Alison、fullname 李語晴、id yu',/name:'Alison'/.test(yu)&&/fullname:'李語晴'/.test(yu),yu.slice(0,120));
/* 3 */
const ex=[['小語說我背叛憲法。','Alison 說我背叛憲法。'],['和小語','和 Alison'],['（小語進門。）','（Alison 進門。）'],['小語，','Alison，'],['跟小語去','跟 Alison 去'],["'小語'","'Alison'"],['認識 小語','認識 Alison']];
const py=JSON.parse(cp.execFileSync('python3',['-c','import sys,json; sys.path.insert(0,"tools/story"); from import_guard import alison; print(json.dumps([alison(x) for x in json.load(sys.stdin)]))'],{cwd:ROOT,input:JSON.stringify(ex.map(x=>x[0])),encoding:'utf8'}));
check('3. 寫法照 AA_380 第 1 節（Node、Python 一樣）',ex.every(([a,b],i)=>alison(a)===b&&py[i]===b),JSON.stringify({node:ex.map(([a])=>alison(a)),py}));
/* 3b 遊戲裡的 SOCIAL.alison（舊存檔已經存下的字，顯示時換；人物備註 noteShown 用）和匯入工具同一套結果 */
{ let ga=null; try{ global.window=global; const vm=require('vm'); vm.runInThisContext(fs.readFileSync(path.join(ROOT,'src/social3d.js'),'utf8').replace(/^const SOCIAL\s*=/m,'globalThis.SOCIAL='),{filename:'social3d.js'}); ga=SOCIAL.alison; }catch(e){ ga=null; }
  check('3b. 遊戲的 SOCIAL.alison（舊存檔的字顯示時換）和上面一樣；沒有舊名的字原樣回傳',!!ga&&ex.every(([a,b])=>ga(a)===b)&&ga('Alison 說')==='Alison 說'&&ga('')===''&&ga(null)===null,JSON.stringify(ga?ex.map(([a])=>ga(a)):'沒有 SOCIAL.alison')); }
/* 4 */
const tools=fs.readdirSync(path.join(ROOT,'tools')).flatMap(d=>{ const p=path.join(ROOT,'tools',d); return fs.statSync(p).isDirectory()?fs.readdirSync(p).filter(f=>/^import_.*\.py$/.test(f)).map(f=>'tools/'+d+'/'+f):[]; });
const bad=tools.filter(f=>{ const s=fs.readFileSync(path.join(ROOT,f),'utf8'); return s.split('\n').some(l=>/'show'/.test(l)&&/check_output|subprocess\.run/.test(l)&&!/alison\(|read_fix\(/.test(l)); });   /* WORLD-RENAME-1030：讀稿改走 import_guard.read_fix（＝alison＋world 換校名），read_fix 一定先 alison */
const rf=/def read_fix\(s\):[\s\S]*?return (ndl542\()?world\(alison\(s\)\)/.test(fs.readFileSync(path.join(ROOT,'tools/story/import_guard.py'),'utf8'));
check('4. 匯入工具（'+tools.length+' 支）讀 git show 的地方都先換 Alison（alison 或 read_fix）',tools.length>=10&&!bad.length&&rf,JSON.stringify(bad)+(rf?'':' read_fix 沒有先 alison'));
console.log(fails?('FAILED '+fails):'ALL PASS'); process.exit(fails?1:0);
