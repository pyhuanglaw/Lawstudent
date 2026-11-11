// 驗證打包輸出（REL-PACKAGING-1111）：對 dist/<target> 起一個本機靜態伺服器，用 Node（不是瀏覽器）逐檔請求。
// 用法：node tools/release/verify_dist.js dist/web [--json out.json] [--serve 埠號]
//   1) manifest.json 的每個檔：GET 要 200、大小與 sha256 要和 manifest 一樣。
//   2) required（遊戲會請求的路徑：index.html 的 script／link、程式裡的完整路徑、執行期表、GLB 裡指到的）：每個都要 200。
//   3) index.html 再讀一次：每個 <script src>、<link href>（本機的）都要 200。
//   4) 不該在包裡的（docs、tests、tools、.git、*.blend…）：包裡不能有；請求要 404。
//   5) 目錄裡不能有 manifest 沒列的檔。
// --serve：驗完不結束，留著伺服器（給瀏覽器冒煙測試用）。
// 這只證明「檔案都在、請求得到、內容沒壞」；不代表模型在瀏覽器裡解析、顯示正確（那要瀏覽器驗收，歸 BB／CC）。
// 結束碼：0 全部通過；1 有問題；2 用法或執行錯誤。
'use strict';
const fs=require('fs'), path=require('path'), http=require('http'), crypto=require('crypto');
const args=process.argv.slice(2); const dir=args.find((a,i)=>!a.startsWith('--')&&!['--json','--serve'].includes(args[i-1]));
const opt=n=>{ const i=args.indexOf(n); return i>=0?args[i+1]:null; };
if(!dir||!fs.existsSync(path.join(dir,'manifest.json'))){ console.error('用法：node tools/release/verify_dist.js <dist/target>（裡面要有 manifest.json）'); process.exit(2); }
const ROOT=path.resolve(dir), man=JSON.parse(fs.readFileSync(path.join(ROOT,'manifest.json'),'utf8'));
const TYPES={html:'text/html; charset=utf-8',js:'text/javascript; charset=utf-8',json:'application/json',webp:'image/webp',png:'image/png',jpg:'image/jpeg',glb:'model/gltf-binary',vrm:'model/gltf-binary',md:'text/markdown; charset=utf-8',css:'text/css'};
const server=http.createServer((req,res)=>{ let p; try{ p=decodeURIComponent(req.url.split('?')[0]); }catch(e){ res.writeHead(400); res.end(); return; }
  if(p.endsWith('/')) p+='index.html'; const f=path.join(ROOT,p); if(!f.startsWith(ROOT+path.sep)){ res.writeHead(403); res.end(); return; }
  fs.stat(f,(e,st)=>{ if(e||!st.isFile()){ res.writeHead(404); res.end('not found'); return; } res.writeHead(200,{'Content-Type':TYPES[path.extname(f).slice(1).toLowerCase()]||'application/octet-stream','Content-Length':st.size}); fs.createReadStream(f).pipe(res); }); });
const get=(port,p)=>new Promise(resolve=>{ const h=crypto.createHash('sha256'); let n=0; http.get({host:'127.0.0.1',port,path:'/'+p.split('/').map(encodeURIComponent).join('/')},r=>{ r.on('data',d=>{ n+=d.length; h.update(d); }); r.on('end',()=>resolve({status:r.statusCode,size:n,sha:h.digest('hex')})); }).on('error',e=>resolve({status:0,size:0,sha:'',err:String(e.message)})); });
async function pool(items,n,fn){ let i=0; const out=new Array(items.length); await Promise.all(Array.from({length:n},async()=>{ while(i<items.length){ const k=i++; out[k]=await fn(items[k]); } })); return out; }
(async()=>{
  await new Promise(r=>server.listen(Number(opt('--serve'))||0,'127.0.0.1',r)); const port=server.address().port;
  const fails=[]; const t0=Date.now();
  // 1) 每個檔
  const r1=await pool(man.files,8,async x=>{ const r=await get(port,x.path); if(r.status!==200) fails.push('檔 '+x.path+'：HTTP '+r.status); else if(r.size!==x.size) fails.push('檔 '+x.path+'：大小 '+r.size+'≠'+x.size); else if(x.sha256&&r.sha!==x.sha256) fails.push('檔 '+x.path+'：sha256 不一樣'); return r; });
  const bytes=r1.reduce((a,r)=>a+r.size,0);
  // 2) 遊戲會請求的路徑
  const inMan=new Set(man.files.map(x=>x.path)); let reqOK=0;
  for(const p of man.required||[]){ if(!inMan.has(p)){ fails.push('required '+p+'：不在包裡'); continue; } reqOK++; }
  // 3) index.html 的引用
  const html=fs.readFileSync(path.join(ROOT,'index.html'),'utf8'); const refs=[...html.matchAll(/<script\b[^>]*\ssrc="([^"]+)"/g),...html.matchAll(/<link\b[^>]*\shref="([^"]+)"/g)].map(m=>m[1]).filter(u=>!/^(https?:)?\/\//.test(u)&&!u.startsWith('data:'));
  const r3=await pool(refs,8,async u=>{ const r=await get(port,u.split('?')[0]); if(r.status!==200) fails.push('index.html 引用 '+u+'：HTTP '+r.status); return r; });
  const vers=new Set(refs.map(u=>(u.split('?v=')[1]||''))); if(vers.size>1) fails.push('index.html 的 ?v= 不只一種：'+[...vers].join('、'));
  if(man.version&&!vers.has(man.version)) fails.push('index.html 的 ?v=（'+[...vers].join('、')+'）和 manifest 的版本 '+man.version+' 不一樣');
  // 4) 不該在包裡的
  const banned=[/^\.git(\/|$)/,/^\.github\//,/^\.claude\//,/^docs\//,/^tests\//,/^tools\//,/^wip_backup\//,/^build\//,/^assets\/blender\//,/\.blend1?$/,/\.(glb|vrm|gltf)\.json$/,/^CLAUDE\.md$/,/^build\.py$/];
  const disk=[]; (function walk(d){ for(const n of fs.readdirSync(d,{withFileTypes:true})){ const f=path.join(d,n.name); if(n.isDirectory()) walk(f); else disk.push(path.relative(ROOT,f).split(path.sep).join('/')); } })(ROOT);
  for(const f of disk){ if(banned.some(re=>re.test(f))) fails.push('不該在包裡：'+f); if(f!=='manifest.json'&&!inMan.has(f)) fails.push('manifest 沒列的檔：'+f); }
  for(const p of ['docs/RELEASES.md','tests/deploy_check.py','tools/release/pack.py','CLAUDE.md','.git/HEAD','build.py','assets/blender/yuting_work_v1.blend']){ const r=await get(port,p); if(r.status!==404) fails.push('應該 404：'+p+'（HTTP '+r.status+'）'); }
  const sum={dir:ROOT,target:man.target,version:man.version,commit:man.commit,files:man.files.length,bytesFetched:bytes,required:(man.required||[]).length,requiredOK:reqOK,indexRefs:refs.length,indexRefsOK:r3.filter(r=>r.status===200).length,onDisk:disk.length,fails,seconds:Math.round((Date.now()-t0)/100)/10};
  if(opt('--json')) fs.writeFileSync(opt('--json'),JSON.stringify(sum,null,1));
  console.log('驗證 '+ROOT+'（'+man.target+' v'+man.version+' '+String(man.commit).slice(0,9)+'）');
  console.log('  檔案 '+man.files.length+' 個逐一 GET、比對大小與 sha256：共 '+(bytes/1e6).toFixed(2)+' MB');
  console.log('  遊戲會請求的路徑 '+sum.required+' 個，在包裡 '+reqOK+' 個；index.html 引用 '+refs.length+' 個，200 的 '+sum.indexRefsOK+' 個');
  console.log('  不該在包裡的：7 個抽樣路徑都要 404；目錄裡 '+disk.length+' 個檔（含 manifest.json）');
  for(const f of fails.slice(0,40)) console.log('  FAIL '+f);
  console.log(fails.length?('FAIL：'+fails.length+' 項（'+sum.seconds+' 秒）'):('ALL PASS（'+sum.seconds+' 秒）'));
  if(opt('--serve')){ console.log('伺服器留著：http://127.0.0.1:'+port+'/（Ctrl-C 結束）'); return; }
  server.close(); process.exit(fails.length?1:0);
})().catch(e=>{ console.error('執行錯誤：'+(e&&e.stack||e)); process.exit(2); });
