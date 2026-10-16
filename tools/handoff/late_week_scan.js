// 16 週制影響清單的程式部分（AA-B 2026-10-16 7b2d057f 第 6 點）：找出所有「第 15 週以後」的條件，寫成 docs/handoff/LATE_WEEK_CONDITIONS.md。
// 現在每學期 18 週（期中第 8～9 週、期末第 17～18 週；src/data/calendar.js）。改成 16 週（第 16 週期末、寒假 12/22 起）時，第 15～18 週的東西要逐一檢查。
// 只讀檔案、不改遊戲。用法：node tools/handoff/late_week_scan.js（在 repo 根目錄）
const fs=require('fs'), path=require('path'), vm=require('vm');
const ROOT=path.resolve(__dirname,'../..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''}; global.navigator={userAgent:'node'};
const load=f=>{ const src=fs.readFileSync(path.join(ROOT,f),'utf8').replace(/^const (\w+)\s*=/mg,'global.$1='); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/syllabus.js']) { try{ load(f); }catch(e){ console.error('載入失敗',f,e.message); } }
let NEEDED=null; try{ load('src/data/needed_msgs.js'); NEEDED=global.NEEDED_MSGS||null; }catch(e){}
const DAY=86400000, dayOf=k=>{ const [y,m,d]=k.split('-').map(Number); return Math.round((Date.UTC(y,m-1,d)-Date.UTC(2025,8,17))/DAY)+1; };
const LAW=id=>/^Y[1-4]S[12]$/.test(id);
const out=[]; const P=s=>out.push(s);
const ev=[]; { const seen=new Set(); for(const e of (global.STORY_EVENTS||[]).concat(global.STORY_EVENTS_V11||[])) if(e&&!seen.has(e.id)){ seen.add(e.id); ev.push(e); } }
P('# 第 15 週以後的條件（16 週制影響清單：程式部分）');
P('');
P('> 自動產生：`node tools/handoff/late_week_scan.js`（'+new Date().toISOString().slice(0,16).replace('T',' ')+' UTC）。給 AA-B 的八學期影響清單引用（AA_195 2-1）。');
P('> 現況：每學期 18 週，期中第 8～9 週、期末第 17～18 週（`calendar.js` 的 `termOf`）。真實臺大 16 週：114-1 期末考 12/15～19、寒假 12/22 起（AA_195 1-2）。');
P('> 只列法律系的學期（Y1S1～Y4S2）；經濟系那一年（Y0）不在這次的範圍。');
P('');
// 1. 事件：weeks／minWeek
const evW=[]; for(const e of ev){ const ws=(e.weeks||[]).filter(w=>w>=15); const terms=(e.term||[]).filter(LAW); const termOk=!e.term||terms.length; if(termOk&&(ws.length||(e.minWeek>=15))) evW.push(e); }
P('## 1. 事件用週次判斷（`events.js` 的 weeks／minWeek ≥ 15）：'+evW.length+' 件');
P(''); P('| 事件 | 標題 | 學期 | 週次 |'); P('|---|---|---|---|');
for(const e of evW) P('| `'+e.id+'` | '+(e.title||'')+' | '+(e.term||['（全部）']).join('、')+' | '+(e.weeks?e.weeks.join('、'):'')+(e.minWeek?' minWeek '+e.minWeek:'')+' |');
P('');
// 2. 事件裡寫死的日期落在第 15～18 週
const evD=[]; for(const e of ev){ const s=JSON.stringify(e,(k,v)=>typeof v==='function'?String(v):v)||''; const ks=[...new Set(s.match(/20\d\d-\d\d-\d\d/g)||[])]; for(const k of ks){ const t=CALENDAR.termOf(dayOf(k)); if(t&&LAW(t.id)&&t.week>=15) evD.push([e.id,e.title||'',k,t.id,t.week]); } }
P('## 2. 事件裡寫死的日期，落在第 15～18 週：'+evD.length+' 筆');
P('改 16 週以後，第 17、18 週的日子變成寒暑假（原本的期末週）。'); P('');
P('| 事件 | 標題 | 日期 | 學期 | 現在第幾週 |'); P('|---|---|---|---|---|');
for(const r of evD) P('| `'+r[0]+'` | '+r[1]+' | '+r[2]+' | '+r[3]+' | '+r[4]+(r[4]>=17?'（16 週制是假期）':'')+' |');
P('');
// 3. 活動
const acts=((global.ACTIVITIES&&ACTIVITIES.list)||(global.ACTIVITIES&&ACTIVITIES.all)||[]); const actL=[];
const A0=global.ACTIVITIES||{}; const arr=Array.isArray(A0)?A0:(A0.list||A0.items||Object.values(A0).find(v=>Array.isArray(v)&&v.length&&v[0]&&v[0].id)||[]);
for(const a of arr){ const ws=(a.weeks||[]).filter(w=>w>=15); if(ws.length&&(!a.term||a.term.some(LAW))) actL.push(a); }
P('## 3. 活動（`activities.js` 的 weeks ≥ 15）：'+actL.length+' 個'); P(''); P('| 活動 | 學期 | 週次 |'); P('|---|---|---|');
for(const a of actL) P('| `'+a.id+'` '+(a.title||'')+' | '+(a.term||['（全部）']).join('、')+' | '+a.weeks.join('、')+' |');
P('');
// 4. 階梯聊天
const lad=[]; const LD=(global.LADDER&&LADDER.characters)||{};
for(const cid in LD){ for(const st of (LD[cid].steps||[])){ const s=JSON.stringify(st); const ws=[]; for(const m of s.matchAll(/"weeks?"\s*:\s*(\[[^\]]*\]|\d+)/g)){ const v=JSON.parse(m[1]); const a=Array.isArray(v)?v:[v]; const hi=Math.max(...a); if(hi>=15) ws.push(Array.isArray(v)&&v.length===2?v[0]+'～'+v[1]:a.join('、')); } if(ws.length) lad.push([cid,st.id,[...new Set(ws)].join('；'),[...new Set((s.match(/Y\dS\d/g)||[]))].join('、')]); } }
P('## 4. 階梯聊天（`ladder.js`，BB 的）裡 week ≥ 15 的步驟：'+lad.length+' 個'); P(''); P('| 人物 | 步驟 | 學期 | 週次 |'); P('|---|---|---|---|');
for(const r of lad) P('| '+r[0]+' | `'+r[1]+'` | '+r[3]+' | '+r[2]+' |');
P('');
// 5. 課綱
const syl=[]; const SC=(global.SYLLABUS&&SYLLABUS.courses)||{};
for(const cid in SC){ if(/_y0/.test(cid)) continue; const ws=(SC[cid]||[]).map(w=>w.w).filter(w=>w>=15); if(ws.length) syl.push([cid,ws.join('、'),(SC[cid]||[]).length]); }
P('## 5. 課綱（`syllabus.js`，BB 的）有第 15～18 週內容的課：'+syl.length+' 門'); P('每門課現在排到第 18 週；改 16 週要把第 15～18 週合併或刪掉（期末考週照 calendar）。'); P(''); P('| 課 | 有內容的晚週 | 總週數 |'); P('|---|---|---|');
for(const r of syl) P('| `'+r[0]+'` | '+r[1]+' | '+r[2]+' |');
P('');
// 6. 程式裡的 S.termDay（學期, 週 ≥ 15, 星期）和寫死的週次比較
const files=fs.readdirSync(path.join(ROOT,'src')).filter(f=>f.endsWith('.js')).map(f=>'src/'+f).concat(fs.readdirSync(path.join(ROOT,'src/data')).filter(f=>f.endsWith('.js')).map(f=>'src/data/'+f));
const td=[], cmp=[];
for(const f of files){ if(/chars3d|syllabus|ladder|exam_bank|legal_qbank|portrait_manifest/.test(f)) continue; const lines=fs.readFileSync(path.join(ROOT,f),'utf8').split('\n');
  lines.forEach((ln,i)=>{ for(const m of ln.matchAll(/termDay\(\s*'(Y\dS\d)'\s*,\s*(\d+)/g)) if(+m[2]>=15&&LAW(m[1])) td.push([f,i+1,m[1],m[2]]);
    for(const m of ln.matchAll(/week\s*(<=|>=|===|==|<|>|!==)\s*(1[5-8])\b/g)) cmp.push([f,i+1,m[0]]); }); }
{ const lit=[]; for(const f of files){ if(/chars3d|syllabus|ladder|exam_bank|legal_qbank|portrait_manifest|calendar/.test(f)) continue; fs.readFileSync(path.join(ROOT,f),'utf8').split('\n').forEach((ln,i)=>{ for(const m of ln.matchAll(/'(20\d\d-\d\d-\d\d)'/g)){ const t=CALENDAR.termOf(dayOf(m[1])); if(t&&LAW(t.id)&&t.week>=15) lit.push([f,i+1,m[1],t.id,t.week]); } }); }
  P('## 5b. 程式和資料裡寫死的日期（\'YYYY-MM-DD\'），落在第 15～18 週：'+lit.length+' 處'); P(''); P('| 檔案:行 | 日期 | 學期 | 現在第幾週 |'); P('|---|---|---|---|');
  for(const r of lit) P('| `'+r[0]+':'+r[1]+'` | '+r[2]+' | '+r[3]+' | '+r[4]+(r[4]>=17?'（16 週制是假期）':'')+' |'); P(''); }
P('## 6. 程式裡用第 15～18 週換算日期（`termDay(學期, 週, 星期)`）：'+td.length+' 處'); P(''); P('| 檔案:行 | 學期 | 週 |'); P('|---|---|---|');
for(const r of td) P('| `'+r[0]+':'+r[1]+'` | '+r[2]+' | '+r[3]+' |');
P('');
P('## 7. 程式裡寫死的週次比較（week ≥／≤／＝ 15～18）：'+cmp.length+' 處'); P(''); P('| 檔案:行 | 寫法 |'); P('|---|---|');
for(const r of cmp) P('| `'+r[0]+':'+r[1]+'` | `'+r[2]+'` |');
P('');
P('## 8. 日曆本身（`src/data/calendar.js`）');
P('- `TERMS` 每學期 `weeks:18`；`termOf` 的期中寫死第 8～9 週、期末 `week>=17`。改 16 週：weeks 改 16、期末改第 16 週（期中留第 8～9 週，AA_195 第 3 節）。');
P('- 存檔存絕對天數；學期、週次每次重算（遷移風險見 AA-B 對話 2026-10-16 21:05 LAWWW-B 的回答）。');
fs.mkdirSync(path.join(ROOT,'docs/handoff'),{recursive:true});
fs.writeFileSync(path.join(ROOT,'docs/handoff/LATE_WEEK_CONDITIONS.md'),out.join('\n')+'\n');
console.log('寫好 docs/handoff/LATE_WEEK_CONDITIONS.md：事件週次 '+evW.length+'、事件日期 '+evD.length+'、活動 '+actL.length+'、階梯 '+lad.length+'、課綱 '+syl.length+'、termDay '+td.length+'、寫死比較 '+cmp.length);
