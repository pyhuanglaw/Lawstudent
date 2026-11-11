// 正式發行打包規則（REL-PACKAGING-1111，USER_WANTS X340；規格 docs/RELEASE_PACKAGING.md）。
// 只跑依賴檢查（tools/release/deps.py，只讀檔、不複製任何東西），釘住：開發檔不進包、遊戲要的檔都在包裡、巢狀目錄的模型不漏、
// 「搜尋不到引用」的素材留在包裡不排除、網頁包和 Windows 包只差 .nojekyll。
// 用法：node tests/release_pack_unit.js      （需要 python3、git；GitHub Actions 的 ubuntu-latest 都有）
'use strict';
const fs=require('fs'), os=require('os'), path=require('path'), cp=require('child_process');
const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(name,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+name+(info?'  '+info:'')); if(!ok) fails++; };
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'relpack_'));
const run=target=>{ const out=path.join(tmp,target+'.json'); const r=cp.spawnSync('python3',[path.join(ROOT,'tools/release/deps.py'),'--root',ROOT,'--target',target,'--json',out],{encoding:'utf8',maxBuffer:64<<20}); return {code:r.status,stdout:r.stdout||'',stderr:r.stderr||'',res:fs.existsSync(out)?JSON.parse(fs.readFileSync(out,'utf8')):null}; };
const W=run('web'), S=run('win-stage');
try{ fs.rmSync(tmp,{recursive:true,force:true}); }catch(e){}
if(!W.res||!S.res){ console.log('FAIL deps.py 沒有跑出結果：'+(W.stderr||S.stderr).slice(0,400)); process.exit(1); }
const R=W.res, D=R.decisions, inc=f=>!!(D[f]&&D[f].include), files=Object.keys(D), included=files.filter(inc);
const sample=a=>a.slice(0,6).join('、')+(a.length>6?'…（共 '+a.length+'）':'');

check('1. 依賴檢查結束碼 0（沒有缺檔、沒有規則打架、沒有還沒決定的頂層檔）',W.code===0&&S.code===0,(W.stdout.split('\n').filter(l=>/缺：|執行期表/.test(l)).join(' ｜ ')).slice(0,300));
check('2. 執行期表讀到了（Node 載入全部 script：ASSETS.manifest、立繪表、CG 表）',R.runtime.ok&&R.runtime.manifest>100,'manifest '+R.runtime.manifest+' 筆；'+(R.runtime.errors||[]).slice(0,2).join('；'));
check('3. 需要但不存在的檔（會 404）：0',R.missing.length===0,sample(R.missing.map(m=>m.path+'←'+(m.from[0]||''))));

// 開發檔不進包
const banned=[/^\.git(\/|$)/,/^\.github\//,/^\.claude\//,/^docs\//,/^tests\//,/^tools\//,/^wip_backup\//,/^build\//,/^dist\//,/^assets\/blender\//,/\.blend1?$/,/\.(glb|vrm|gltf)\.json$/,/^CLAUDE\.md$/,/^README\.md$/,/^build\.py$/,/^test_charlook\.html$/,/^\.gitignore$/,/^\.env/];
const leaked=included.filter(f=>banned.some(re=>re.test(f)));
check('4. 開發檔不在包裡（.git、.github、.claude、docs、tests、tools、wip_backup、*.blend、Base64 JSON、build.py、CLAUDE.md…）',leaked.length===0,sample(leaked));
check('5. docs/handoff（交班資料）、測試報告一個都沒收',!included.some(f=>f.startsWith('docs/')),'');
const und=files.filter(f=>D[f].rule==='X9-UNDECIDED');
check('6. 沒有「還沒決定收不收」的頂層檔（新增頂層檔要在 tools/release/deps.py 加規則）',und.length===0,sample(und));

// 遊戲要的都在
const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8');
const refs=[...html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g),...html.matchAll(/<link\b[^>]*\shref="([^"]+)"/g)].map(m=>m[1]).filter(u=>!/^(https?:)?\/\//.test(u)&&!u.startsWith('data:')).map(u=>u.split('?')[0]);
check('7. index.html 引用的每個檔都在包裡（'+refs.length+' 個）',refs.length>300&&refs.every(inc),sample(refs.filter(f=>!inc(f))));
check('8. index.html 本身、LICENSES.md（授權標示）在包裡',inc('index.html')&&inc('LICENSES.md')&&S.res.decisions['LICENSES.md'].include);
const stat=Object.keys(R.static), rt=Object.keys(R.runtime.paths), glb=Object.keys(R.glbRefs);
check('9. 程式裡寫了完整路徑的資產都在包裡（'+stat.length+' 個）',stat.length>500&&stat.every(inc),sample(stat.filter(f=>!inc(f))));
check('10. 執行期表（ASSETS.manifest、立繪、CG…）的路徑都在包裡（'+rt.length+' 個）',rt.length>300&&rt.every(inc),sample(rt.filter(f=>!inc(f))));
check('11. 模型檔裡面指到的檔（光照貼圖 extras.lightmap）都在包裡（'+glb.length+' 個）',glb.length>0&&glb.every(inc),sample(glb.filter(f=>!inc(f))));
check('12. GLB／VRM 都讀得到 JSON 區塊（沒有壞檔）',(R.glbUnreadable||[]).length===0,sample(R.glbUnreadable||[]));

// 巢狀目錄：assets/models/env/second_ai/ 與子目錄
const sa=files.filter(f=>f.startsWith('assets/models/env/second_ai/')), saGlb=sa.filter(f=>f.endsWith('.glb'));
const manSA=rt.filter(f=>f.startsWith('assets/models/env/second_ai/')&&f.endsWith('.glb'));
check('13. second_ai 被 manifest 用到的 GLB 都在包裡（manifest '+manSA.length+' 個）',manSA.length>100&&manSA.every(inc),sample(manSA.filter(f=>!inc(f))));
check('14. second_ai（含 aa_support、bb_support）磁碟上的 GLB 全部在包裡（'+saGlb.length+' 個）',saGlb.length>100&&saGlb.every(inc),sample(saGlb.filter(f=>!inc(f))));
for(const sub of ['assets/models/env/second_ai/aa_support/','assets/models/env/second_ai/bb_support/','assets/models/char/second_ai/lod/','assets/models/env/views/']){ const fs2=files.filter(f=>f.startsWith(sub)); check('15. 巢狀目錄 '+sub+' 的檔全部在包裡（'+fs2.length+' 個）',fs2.length>0&&fs2.every(inc),sample(fs2.filter(f=>!inc(f)))); }

// 不因為搜尋不到引用就排除素材
const assetExcluded=files.filter(f=>f.startsWith('assets/')&&!inc(f));
const okExcluded=f=>f.startsWith('assets/blender/')||/\.blend1?$/.test(f)||/\.(glb|vrm|gltf)\.json$/.test(f);
check('16. assets/ 底下被排除的只有 Blender 原檔和 Base64 JSON（沒有任何模型、圖因為「沒人引用」被排除）',assetExcluded.every(okExcluded),sample(assetExcluded.filter(f=>!okExcluded(f))));
const media=files.filter(f=>f.startsWith('assets/')&&/\.(glb|vrm|webp|png|jpe?g)$/i.test(f)&&!f.startsWith('assets/blender/'));
check('17. assets/ 的 GLB、VRM、WebP、PNG、JPG 全部在包裡（'+media.length+' 個）',media.length>1000&&media.every(inc),sample(media.filter(f=>!inc(f))));
const unsure=files.filter(f=>D[f].rule==='R7-KEEP-UNSURE');
check('18. 「無法判定」的檔有列出來、而且都留在包裡（'+unsure.length+' 個）',unsure.every(inc),'');

// 衍生路徑的規則還對得上程式
const a3=fs.readFileSync(path.join(ROOT,'src/assets3d.js'),'utf8');
check("19. 遠距離版本的路徑規則還在（src/assets3d.js 的 A.lodUrl：'/lod/$1.lod.glb'）",a3.includes("'/lod/$1.lod.glb'"));
check("20. Base64 JSON 只是 GLB 抓不到時的備援（src/assets3d.js：fetch(m.url+'.json')），repo 裡沒有這種檔",a3.includes("fetch(m.url+'.json')")&&!files.some(f=>/\.(glb|vrm)\.json$/.test(f)),sample(files.filter(f=>/\.(glb|vrm)\.json$/.test(f))));
const loaded=refs.filter(f=>f.endsWith('.js')); let dyn=[];
for(const f of loaded.concat(['index.html'])){ const t=fs.readFileSync(path.join(ROOT,f),'utf8'); if(f.startsWith('lib/')) continue; if(/createElement\(\s*['"]script['"]\s*\)|importScripts\s*\(|new\s+Worker\s*\(|[^.\w]import\s*\(/.test(t)) dyn.push(f); }
check('21. 遊戲沒有動態載入 script 的地方（所以 index.html 沒載入的 src 檔可以不收）',dyn.length===0,sample(dyn));
const unl=files.filter(f=>D[f].rule==='X5-UNLOADED');
check('22. 被當成「index.html 沒載入」排除的只有 src／lib 的 .js（'+unl.length+' 個）',unl.every(f=>/^(src|lib)\/.*\.js$/.test(f)),sample(unl));

// 兩個 target
const wi=new Set(included), si=new Set(Object.keys(S.res.decisions).filter(f=>S.res.decisions[f].include));
const onlyW=[...wi].filter(f=>!si.has(f)), onlyS=[...si].filter(f=>!wi.has(f));
check('23. 網頁包和 Windows 包同一套檔，只差 .nojekyll（GitHub Pages 設定檔只有網頁包要）',onlyS.length===0&&onlyW.join(',')==='.nojekyll','只在 web：'+onlyW.join('、')+'；只在 win-stage：'+onlyS.join('、'));
check('24. 對外網路的引用有列出來（離線版要處理；目前只有 Google Fonts）',Array.isArray(R.index.external)&&R.index.external.every(u=>/fonts\.googleapis\.com/.test(u)),R.index.external.join('、'));

// 字串掃描器自己的小測試（註解不算、樣板字串的前綴算動態）
const py="import sys,json; sys.path.insert(0,sys.argv[1]); import relcommon as rc; t=open(0,encoding='utf-8').read(); print(json.dumps([x[2] for x in rc.js_strings(t)]))";
const src="/* 'assets/in_comment.glb' */ const a='assets/a.glb'; // 'assets/line_comment.webp'\nconst re=/'[^']*'/g; const b=\"assets/b.vrm\"; const c=`assets/dyn/${id}.webp`; const d='it\\'s';";
const r2=cp.spawnSync('python3',['-c',py,path.join(ROOT,'tools/release')],{input:src,encoding:'utf8'}); let strs=[]; try{ strs=JSON.parse(r2.stdout); }catch(e){}
check('25. 字串掃描：註解裡的不算、正規表示式不誤判、樣板字串整段取出',strs.includes('assets/a.glb')&&strs.includes('assets/b.vrm')&&strs.includes('assets/dyn/${id}.webp')&&!strs.some(s=>/in_comment|line_comment/.test(s)),JSON.stringify(strs));

console.log('包：'+included.length+' 個檔 '+(R.summary.bytesIncluded/1e6).toFixed(2)+' MB；排除 '+R.summary.filesExcluded+' 個檔 '+(R.summary.bytesExcluded/1e6).toFixed(2)+' MB；無法判定（保留）'+unsure.length+' 個');
console.log(fails?('FAIL：'+fails+' 項'):'ALL PASS'); process.exit(fails?1:0);
