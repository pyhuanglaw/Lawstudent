// MOONCAKE-EXIT-1112（BB-C／CC 11-12：reachability_all gongguan FAIL——中秋前兩週白天，從日和便利店「離開」到公館的落點 (−29.4, 18) 站不住；
//   季節攤販 MOONCAKE 的導航擋格 x −32～−29.5 離落點只有 0.1 m，人物半徑 0.45）。LAWWW2-C 2026-11-12。
// 檢查（不用瀏覽器、不用引擎）：各區的季節擋格（src/data/season_deco.js 的 blocks）離「從別的區域進到這一區的落點」（src/*.js、src/data/*.js 裡 to:'<區>',spawn:{x,z}）至少 0.75 m。
// 修改前（MOONCAKE 在 x −32～−29.5）：FAIL；往西挪 2.2 m 以後 ALL PASS。用法：node tests/season_exit_clear_1112_unit.js
const fs=require('fs'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
let fails=0; const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(info?'　'+info:'')); if(!ok) fails++; };
const sd=fs.readFileSync(path.join(ROOT,'src/data/season_deco.js'),'utf8'); const J=JSON.parse(sd.slice(sd.indexOf('{',sd.indexOf('=')),sd.lastIndexOf('}')+1));
const zones=J.zones||J; const files=[]; for(const d of ['src','src/data']) for(const f of fs.readdirSync(path.join(ROOT,d))) if(/\.js$/.test(f)) files.push(path.join(ROOT,d,f));
const spawns={}; const re=/to:\s*'(\w+)'\s*,\s*spawn:\s*\{\s*x:\s*(-?[\d.]+)\s*,\s*z:\s*(-?[\d.]+)/g;
for(const f of files){ const t=fs.readFileSync(f,'utf8'); let m; while((m=re.exec(t))) (spawns[m[1]]=spawns[m[1]]||[]).push([+m[2],+m[3],path.basename(f)]); }
let nb=0, np=0; const bad=[];
for(const zn of Object.keys(zones)){ const B=zones[zn]&&zones[zn].blocks; if(!B) continue; const P=spawns[zn]||[]; np+=P.length;
  for(const code of Object.keys(B)) for(const r of B[code]){ nb++; for(const p of P){ const dx=Math.max(r[0]-p[0],0,p[0]-r[1]), dz=Math.max(r[2]-p[1],0,p[1]-r[3]), d=Math.hypot(dx,dz); if(d<0.75) bad.push([zn,code,r,p,+d.toFixed(2)]); } } }
check('1. 讀得到季節擋格和各區的落點',nb>=5&&np>=5,'擋格 '+nb+'、落點 '+np+'（公館 '+(spawns.gongguan||[]).length+'）');
check('2. 便利店出來的落點 (−29.4, 18) 在清單裡',(spawns.gongguan||[]).some(p=>Math.abs(p[0]+29.4)<0.01&&Math.abs(p[1]-18)<0.01));
check('3. 每一塊季節擋格離每一個落點至少 0.75 m（人物半徑 0.45＋0.3）',bad.length===0,JSON.stringify(bad).slice(0,300));
console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0);
