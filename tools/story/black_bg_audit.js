// 黑畫面盤點（使用者 2026-10-18 14:2x：「桌遊也沒畫面 類似的事情幫我檢查哪些都黑畫面 等下一個帳號 BB 叫我補充」）
// 讀 src/data/events.js（STORY_EVENTS）、src/data/retake_home.js、src/outings3d.js 的 S.BG、src/adv3d.js 的 CG_REGISTRY，
// 列出 2D 對話演出時會是深色底（沒有圖）的段落：事件的 background:'dark' 而且第一句前沒有換背景、{scene, bg} 的 bg 沒有圖或檔案不在、CG 檔不在。
// 用法：node tools/story/black_bg_audit.js [--md 輸出檔] [--stage econ]
const fs=require('fs'), path=require('path'), vm=require('vm'); const ROOT=path.resolve(__dirname,'../..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){},createElement:()=>({style:{},classList:{add(){},remove(){}}})}; global.location={search:''};
const load=(f,names)=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>names.includes(n)?'globalThis.'+n+'=':m); try{ vm.runInThisContext(src,{filename:f}); }catch(e){ console.error('載入失敗',f,e.message); } };
for(const f of ['src/data/calendar.js','src/data/characters.js']) load(f,['CALENDAR','CHARACTERS']);
load('src/outings3d.js',['OUT']); load('src/data/events.js',['STORY_EVENTS','SMALLTALK']);
if(fs.existsSync(path.join(ROOT,'src/data/retake_home.js'))) load('src/data/retake_home.js',['RETAKE_HOME']);
const adv=fs.readFileSync(path.join(ROOT,'src/adv3d.js'),'utf8'); const CG={}; for(const m of adv.matchAll(/(\w+):\{file:'([^']+)'/g)) CG[m[1]]=m[2];
const BG=(typeof OUT!=='undefined'&&OUT.BG)||{}; const exists=f=>!!f&&fs.existsSync(path.join(ROOT,f));
const args=process.argv.slice(2); const md=args.includes('--md')?args[args.indexOf('--md')+1]:null; const stage=args.includes('--stage')?args[args.indexOf('--stage')+1]:null;
const rows=[], wrong=[]; const bgNote=k=>{ const b=BG[k]; if(!b) return '背景代號不存在'; if(!b.image) return '沒有圖（image:null）'; if(!exists(b.image)) return '檔案不在：'+b.image; return null; };
const text=l=>(l&&l.text?String(l.text):'').replace(/\s+/g,' ').slice(0,36);
function scan(id,title,stg,when,bg0,dlg){ let cur=bg0==='dark'?{why:'事件底色 dark、還沒換背景',label:'（事件開頭）',key:'dark'}:null, n=0, first=null; const flush=()=>{ if(cur&&n) rows.push({id,title,stage:stg,when,scene:cur.label,key:cur.key,why:cur.why,lines:n,first}); n=0; first=null; };
  for(const l of dlg||[]){ if(!l||typeof l!=='object') continue;
    if(l.scene!==undefined){ flush(); const k=l.bg; if(k===false||k==null){ cur=bg0==='dark'?{why:'換場景但沒有給背景（'+(k===false?'bg:false':'沒有 bg')+'）',label:l.scene,key:String(k)}:null; } else { const w=bgNote(k); cur=w?{why:w,label:l.scene||BG[k]&&BG[k].label||k,key:k}:null; } continue; }
    if(l.cg){ const f=CG[l.cg]; if(!f||!exists(f)) rows.push({id,title,stage:stg,when,scene:'CG',key:l.cg,why:f?'CG 檔案不在：'+f:'CG 沒登記',lines:1,first:''}); continue; }
    if(l.text&&cur){ n++; if(!first) first=text(l); } }
  flush(); }
for(const e of (typeof STORY_EVENTS!=='undefined'?STORY_EVENTS:[])){ if(e.retired) continue; if(stage&&(e.stage||'law')!==stage) continue;
  const when=[e.term&&e.term.join('/'),e.weeks&&('第'+e.weeks.join(',')+'週'),e.trigger].filter(Boolean).join(' ');
  let d=e.dialogue; if(typeof d==='function'){ try{ d=d({flags:{},events:{done:{}},rel:{},day:0,hour:12}); }catch(_){ d=null; } }
  if(Array.isArray(d)){ scan(e.id,e.title||'',e.stage||'law',when,e.background||'blur',d);
    const f=d.find(l=>l&&typeof l==='object'&&(l.text||l.scene!==undefined)); if(e.trigger==='outing'&&(e.background||'blur')!=='dark'&&!(f&&f.scene!==undefined)) wrong.push({id:e.id,title:e.title||'',stage:e.stage||'law',bg:e.background||'blur',first:text(f)}); } }
if(typeof RETAKE_HOME!=='undefined'&&(!stage||stage==='econ')){ for(const e of [].concat(RETAKE_HOME.long||[],RETAKE_HOME.short||[])){ if(!e) continue; const d=[{scene:e.place||'',bg:e.bg===false?false:(e.bg||'home_living')}].concat((e.lines||[]).map(x=>Array.isArray(x)?{speaker:x[0],text:x[1]}:x)); scan('RH:'+e.id,e.title||e.id,'econ',e.date||e.kind||'',e.bg===false?'dark':'blur',d); } }
const byKey={}; for(const r of rows){ const k=r.key+'｜'+r.why; (byKey[k]=byKey[k]||[]).push(r); }
const out=[]; out.push('# 黑畫面盤點（tools/story/black_bg_audit.js 自動產生）','',`> 產生：${new Date().toISOString().slice(0,16)}Z；範圍：${stage||'全部'}的 STORY_EVENTS＋重考期在家。玩家看到深色底（沒有圖）的段落 ${rows.length} 段、共 ${rows.reduce((a,r)=>a+r.lines,0)} 句。`,'> 依「背景代號」分組：同一個代號補一張圖，就補好那一組的全部段落。電話（「電話」場景）深色底可能是故意的，BB 和使用者決定要不要補。','');
const groups=Object.entries(byKey).sort((a,b)=>b[1].reduce((s,r)=>s+r.lines,0)-a[1].reduce((s,r)=>s+r.lines,0));
out.push('## 1. 要補的圖（依影響句數排）','','| 背景代號 | 原因 | 地點 | 用到的事件 | 句數 |','|---|---|---|---|---|');
for(const [k,rs] of groups){ const [key,why]=k.split('｜'); const labels=[...new Set(rs.map(r=>r.scene))].join('、'); out.push(`| \`${key}\` | ${why} | ${labels} | ${[...new Set(rs.map(r=>r.id))].join('、')} | ${rs.reduce((s,r)=>s+r.lines,0)} |`); }
out.push('','## 2. 每一段（事件、什麼時候、第一句）','','| 事件 | 標題 | 路線 | 什麼時候 | 場景 | 背景代號 | 原因 | 句數 | 第一句 |','|---|---|---|---|---|---|---|---|---|');
for(const r of rows) out.push(`| ${r.id} | ${r.title} | ${r.stage} | ${r.when} | ${r.scene} | \`${r.key}\` | ${r.why} | ${r.lines} | ${r.first||''} |`);
out.push('','## 3. 不是黑畫面、但地點不對（出遊事件開頭用 3D 模糊底：看到的是玩家出發的地方）','','| 事件 | 標題 | 路線 | 底色 | 第一句 |','|---|---|---|---|---|');
for(const r of wrong) out.push(`| ${r.id} | ${r.title} | ${r.stage} | ${r.bg} | ${r.first||''} |`);
out.push('','## 4. 使用者實玩回報（工具抓不到：有背景圖，但不是那個地方）','','| 回報 | 事件 | 現在的背景 | 要補的圖 |','|---|---|---|---|',
  '| 2026-10-18 14:2x「桌遊也沒畫面」 | ev_y0_gather（10/15 經濟系的聚會：桌遊 19:00～22:00 → 夜市） | `gongguan`（公館街景）整段共用 | 公館的桌遊店室內（六個人一桌、桌上有牌）；之後夜市那段要不要另一張，問使用者 |',
  '| 2026-10-18 14:1x「烤肉沒接到cg」 | ev_y0_e08（9/21 中秋系烤） | `riverside`＋沒有 CG | CG-ECON-BBQ-1018（提示詞已給使用者） |');
const s=out.join('\n')+'\n'; if(md){ fs.writeFileSync(path.join(ROOT,md),s); console.log('寫入',md,rows.length,'段'); } else console.log(s);
