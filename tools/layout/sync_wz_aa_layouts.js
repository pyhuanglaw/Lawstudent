// 把 AA 的溫州街新室內配置（src/data/komichi_layout.js、sunnyside_layout.js、yizhan_layout.js）照抄進 src/data/wz_shops_layout.js 對應的那一筆
// （WZ-SHOPS1-1104／WZ-YIZHAN-1104；AA 的檔頭寫「這份是 WZ_SHOPS_LAYOUT.<店> 的新版（格式一樣，LAWWW 換掉那一筆就好）」）。
// 為什麼照抄、不在執行時換：遊戲、crowd3d、jobs3d、story3d 和 28 支測試都直接讀 WZ_SHOPS_LAYOUT；照抄以後大家讀到的是同一份，不會「遊戲是新的、測試還在測舊的」。
// AA 改了配置檔以後重跑一次；tests/wz_interiors_aa659_unit.js 第 A0 項檢查兩邊一樣（深度比較）。
// 用法：node tools/layout/sync_wz_aa_layouts.js [--check]
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const MAP=[['teishoku','src/data/komichi_layout.js','KOMICHI_LAYOUT'],['brunch','src/data/sunnyside_layout.js','SUNNYSIDE_LAYOUT'],['teahouse','src/data/yizhan_layout.js','YIZHAN_LAYOUT']];
// 從 i（一個 '{'）找到對應的 '}'：跳過字串、註解
function matchBrace(s,i){ let d=0; for(let k=i;k<s.length;k++){ const c=s[k];
  if(c==='/'&&s[k+1]==='*'){ k=s.indexOf('*/',k+2)+1; continue; } if(c==='/'&&s[k+1]==='/'){ k=s.indexOf('\n',k); continue; }
  if(c==="'"||c==='"'||c==='`'){ for(k++;k<s.length&&s[k]!==c;k++) if(s[k]==='\\') k++; continue; }
  if(c==='{') d++; else if(c==='}'){ d--; if(!d) return k; } } throw new Error('括號沒有配對'); }
function aaBody(rel,name){ const s=fs.readFileSync(path.join(ROOT,rel),'utf8'), m=new RegExp('const '+name+'\\s*=\\s*\\{').exec(s); if(!m) throw new Error(rel+'：找不到 const '+name);
  const a=m.index+m[0].length-1, b=matchBrace(s,a); return s.slice(a,b+1); }
function main(){ const check=process.argv.includes('--check'); const F=path.join(ROOT,'src/data/wz_shops_layout.js'); let s=fs.readFileSync(F,'utf8'); const orig=s;
  for(const [key,rel,name] of MAP){ const body=aaBody(rel,name).split('\n').map((l,i)=>i?'  '+l:l).join('\n');   /* 縮排多兩格（這裡是物件的一個屬性）*/
    const m=new RegExp('\\n  '+key+': \\{').exec(s); if(!m) throw new Error('wz_shops_layout.js：找不到 '+key);
    const a=m.index+m[0].length-1, b=matchBrace(s,a);
    const tag='  /* '+key+'：照抄 '+rel+'（tools/layout/sync_wz_aa_layouts.js；不要手改這一筆，改 AA 的檔再重跑）*/\n';
    const head=s.slice(0,m.index+1), pre=head.endsWith(tag)?head:head+tag;
    s=pre+'  '+key+': '+body+s.slice(b+1); }
  if(check){ if(s!==orig){ console.log('FAIL wz_shops_layout.js 和 AA 的配置不一樣：node tools/layout/sync_wz_aa_layouts.js'); process.exit(1); } console.log('OK 一樣'); return; }
  if(s!==orig){ fs.writeFileSync(F,s); console.log('寫入 src/data/wz_shops_layout.js（'+MAP.map(x=>x[0]).join('、')+'）'); } else console.log('沒有變'); }
main();
