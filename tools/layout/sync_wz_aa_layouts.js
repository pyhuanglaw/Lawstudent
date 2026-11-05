// 把 AA 的溫州街新室內配置（src/data/komichi_layout.js、sunnyside_layout.js、yizhan_layout.js）照抄進 src/data/wz_shops_layout.js 對應的那一筆
// （WZ-SHOPS1-1104／WZ-YIZHAN-1104；AA 的檔頭寫「這份是 WZ_SHOPS_LAYOUT.<店> 的新版（格式一樣，LAWWW 換掉那一筆就好）」）。
// 為什麼照抄、不在執行時換：遊戲、crowd3d、jobs3d、story3d 和 28 支測試都直接讀 WZ_SHOPS_LAYOUT；照抄以後大家讀到的是同一份，不會「遊戲是新的、測試還在測舊的」。
// AA 改了配置檔以後重跑一次；tests/wz_interiors_aa659_unit.js 第 A0 項檢查兩邊一樣（深度比較）。
// 用法：node tools/layout/sync_wz_aa_layouts.js [--check]
const fs=require('fs'), path=require('path');
const ROOT=path.resolve(__dirname,'../..');
const MAP=[['teishoku','src/data/komichi_layout.js','KOMICHI_LAYOUT'],['brunch','src/data/sunnyside_layout.js','SUNNYSIDE_LAYOUT'],['teahouse','src/data/yizhan_layout.js','YIZHAN_LAYOUT'],
  /* 阿德影印 v1c（CC〔帳號 A〕5977272dc、BB 代驗 MODEL_READY BB_257）：src/data/ade_layout.js 是 {version, print:{…}}——抄 print 那一筆、前面補 version（外層的）；
     搬到轉角的 moved（ART-WZ6，AA_420）CC 的檔沒有：保留 wz_shops_layout.js 現在那一筆的 moved（LAWWW 決定照舊）*/
  ['print','src/data/ade_layout.js','ADE_LAYOUT','print',['moved']]];
// 從 i（一個 '{'）找到對應的 '}'：跳過字串、註解
function matchBrace(s,i){ let d=0; for(let k=i;k<s.length;k++){ const c=s[k];
  if(c==='/'&&s[k+1]==='*'){ k=s.indexOf('*/',k+2)+1; continue; } if(c==='/'&&s[k+1]==='/'){ k=s.indexOf('\n',k); continue; }
  if(c==="'"||c==='"'||c==='`'){ for(k++;k<s.length&&s[k]!==c;k++) if(s[k]==='\\') k++; continue; }
  if(c==='{') d++; else if(c==='}'){ d--; if(!d) return k; } } throw new Error('括號沒有配對'); }
function aaBody(rel,name){ const s=fs.readFileSync(path.join(ROOT,rel),'utf8'), m=new RegExp('const '+name+'\\s*=\\s*\\{').exec(s); if(!m) throw new Error(rel+'：找不到 const '+name);
  const a=m.index+m[0].length-1, b=matchBrace(s,a); return s.slice(a,b+1); }
// 物件文字 body 裡、縮排 ind 的屬性 prop: {…}（整行到配對的 }，含後面的逗號）
function propText(body,prop,ind){ const m=new RegExp('\\n'+ind+prop+': \\{').exec(body); if(!m) return null; const a=m.index+m[0].length-1, b=matchBrace(body,a); let e=b+1; if(body[e]===',') e++; return {start:m.index+1,end:e,text:body.slice(m.index+1,e)}; }
function main(){ const check=process.argv.includes('--check'); const F=path.join(ROOT,'src/data/wz_shops_layout.js'); let s=fs.readFileSync(F,'utf8'); const orig=s;
  for(const [key,rel,name,sub,keep] of MAP){ let raw=aaBody(rel,name);
    if(sub){ const ver=/^\{\s*version:\s*(\d+)/.exec(raw), P=propText(raw,sub,'  '); if(!P) throw new Error(rel+'：找不到 '+sub);
      const t=P.text.replace(/,$/,''), a0=t.indexOf('{'); raw=t.slice(a0).split('\n').map((l,i)=>i?l.replace(/^  /,''):l).join('\n');   /* 去掉一層縮排 */
      if(ver) raw=raw.replace(/^\{\n/,'{\n  version: '+ver[1]+',   /* '+rel+' 外層的 version（sync 工具補的）*/\n'); }
    let body=raw.split('\n').map((l,i)=>i?'  '+l:l).join('\n');   /* 縮排多兩格（這裡是物件的一個屬性）*/
    const m=new RegExp('\\n  '+key+': \\{').exec(s); if(!m) throw new Error('wz_shops_layout.js：找不到 '+key);
    const a=m.index+m[0].length-1, b=matchBrace(s,a);
    for(const k of (keep||[])){ const old=propText(s.slice(m.index,b+1),k,'    '); if(!old||propText(body,k,'    ')) continue; const at=body.lastIndexOf('\n  }'); body=body.slice(0,at)+(/,\s*$/.test(body.slice(0,at))?'':',')+'\n    /* '+k+'：保留 wz_shops_layout.js 原本的（'+rel+' 沒有這一筆；sync 工具）*/\n'+old.text.replace(/,$/,'')+body.slice(at); }
    const tag='  /* '+key+'：照抄 '+rel+'（tools/layout/sync_wz_aa_layouts.js；不要手改這一筆，改 AA 的檔再重跑）*/\n';
    const head=s.slice(0,m.index+1), pre=head.endsWith(tag)?head:head+tag;
    s=pre+'  '+key+': '+body+s.slice(b+1); }
  if(check){ if(s!==orig){ console.log('FAIL wz_shops_layout.js 和 AA 的配置不一樣：node tools/layout/sync_wz_aa_layouts.js'); process.exit(1); } console.log('OK 一樣'); return; }
  if(s!==orig){ fs.writeFileSync(F,s); console.log('寫入 src/data/wz_shops_layout.js（'+MAP.map(x=>x[0]).join('、')+'）'); } else console.log('沒有變'); }
main();
