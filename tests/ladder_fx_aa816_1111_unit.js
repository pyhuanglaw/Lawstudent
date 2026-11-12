// 閒聊階梯選項的效果（友情／愛情）照 AA_816 進遊戲（X324 最後一塊；AA 11-11 21:02 交，企劃線 7732e123e）——不需要瀏覽器（D131）。
// 使用者 11-10 20:0x（對 AA）：「每次約會都要有選擇性的對話選項，依據選項內容增加友情或者愛情」；AA_746 第 2 節；機制在 tests/dlg_fx_mech_1110_unit.js 第 4 節。
// AA_816 格式（LAWWW 20:59 定）：{學期:{人:{層 id:{選項字:{fr,love}}}}}；tools/ladder/import_ladder.py 疊在最後（AA_781 之後），對不到＝停。
// 檢查：
//   1. 白名單有 AA_816_ladder_fx.json@7732e123e（approved）；ladder.js 的來源寫著 AA_816@7732e123e（選項 fx 694 個）
//   2. 稿裡每一格（694 個）都在遊戲同一個選項上、值一樣
//   3. 重匯（import_ladder.py --out）＝現在的 ladder.js；不疊 AA_816（--no-aa816）＝現在的拿掉那 694 個 fx（台詞、rel、別的 fx 一字不差）
//   4. 六位（以安、芷若、語彤、子晴、學姊、可昕）每一個選項都有 fx；fx 只有 fr／love 整數
// 稿讀 git show；讀不到（淺層複本）＝第 2 項跳過。用法：node tests/ladder_fx_aa816_1111_unit.js
const fs=require('fs'), path=require('path'), cp=require('child_process'), os=require('os');
const ROOT=path.join(__dirname,'..'); let fail=0; const J=JSON.stringify;
const check=(n,ok,info)=>{ console.log((ok?'PASS ':'FAIL ')+n+(ok?'':'　'+(info||''))); if(!ok) fail++; };
const P='docs/story_planning/AA_816_ladder_fx.json', SHA='7732e123e';
const LD=t=>JSON.parse(t.slice(t.indexOf('{'),t.indexOf(';\nLADDER.byTerm')));
const NOW=LD(fs.readFileSync(path.join(ROOT,'src/data/ladder.js'),'utf8'));
const terms=D=>Object.assign({},D.byTerm,{Y1S1:D.characters});
const layer=(D,t,w,sid)=>{ const X=(terms(D)[t]||{})[w]; return X?[].concat(X.steps||[],X.dating||[]).filter(s=>s.id===sid):[]; };
// 1
const A=JSON.parse(fs.readFileSync(path.join(ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.filter(x=>x.path===P);
check('1. 白名單 AA_816@'+SHA+' 一筆、approved',A.length===1&&A[0].sha===SHA&&A[0].status==='approved'&&!!A[0].approvedBy,J(A));
check('1. ladder.js 的來源寫著 AA_816@'+SHA+'（選項 fx 542 個；可昕 152 個不疊：CANON-NO-ECON-1112 第三批：這一項拿掉）',NOW.source.includes('AA_816@'+SHA+'（選項 fx 542 個）'),NOW.source.slice(-200));
// 2
let src=null; try{ src=JSON.parse(cp.execFileSync('git',['-C',ROOT,'show',SHA+':'+P],{encoding:'utf8',stdio:['ignore','pipe','ignore']})); }catch(e){ src=null; }
if(src){ let n=0; const bad=[];
  for(const [t,Pp] of Object.entries(src)){ if(t[0]==='_') continue; for(const [w,L] of Object.entries(Pp)){ if(w[0]==='_'||w==='kexin') continue; for(const [sid,O] of Object.entries(L)){ if(sid[0]==='_') continue; const ls=layer(NOW,t,w,sid);
    for(const [txt,fx] of Object.entries(O)){ if(txt[0]==='_') continue; n++; const c=ls.length===1?(ls[0].choices||[]).filter(c=>c.t===txt):[]; if(c.length!==1||J(c[0].fx)!==J(fx)) bad.push(t+'/'+w+'/'+sid+'/'+txt+'：'+J(c.map(x=>x.fx))); } } } }
  check('2. 稿裡 '+n+' 格（694，可昕 152 格不疊：CANON-NO-ECON-1112 第三批：這一項拿掉）每一格都在遊戲同一個選項上、值一樣',n===542&&!bad.length,J(bad.slice(0,5))); }
else console.log('（跳過第 2 項：讀不到 '+SHA+':'+P+'，企劃線沒 fetch）');
// 3
const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'aa816-')), o1=path.join(tmp,'a.js'), o2=path.join(tmp,'b.js');
let r1=null, r2=null; try{ cp.execFileSync('python3',[path.join(ROOT,'tools/ladder/import_ladder.py'),'--out',o1],{cwd:ROOT,stdio:'ignore'}); r1=fs.readFileSync(o1,'utf8'); }catch(e){}
try{ cp.execFileSync('python3',[path.join(ROOT,'tools/ladder/import_ladder.py'),'--out',o2,'--no-aa816'],{cwd:ROOT,stdio:'ignore'}); r2=LD(fs.readFileSync(o2,'utf8')); }catch(e){}
if(r1==null&&r2==null) console.log('（跳過第 3 項：重匯讀不到白名單上的 commit，企劃線沒 fetch）');
else{
  check('3. 重匯（import_ladder.py --out）＝現在的 ladder.js',r1===fs.readFileSync(path.join(ROOT,'src/data/ladder.js'),'utf8'));
  /* 不疊 AA_816＝現在的拿掉 AA_816 那幾格的 fx */
  const strip=JSON.parse(J(NOW)); if(src) for(const [t,Pp] of Object.entries(src)){ if(t[0]==='_') continue; for(const [w,L] of Object.entries(Pp)){ if(w[0]==='_'||w==='kexin') continue; for(const [sid,O] of Object.entries(L)){ if(sid[0]==='_') continue; for(const s of layer(strip,t,w,sid)) for(const c of s.choices||[]) if(Object.prototype.hasOwnProperty.call(O,c.t)) delete c.fx; } } }
  const nosrc=x=>{ const y=JSON.parse(J(x)); delete y.source; return J(y); };
  check('3. 不疊 AA_816＝現在的拿掉那 694 個 fx（台詞、rel、別的 fx 一字不差）',!!src&&!!r2&&nosrc(r2)===nosrc(strip)); }
// 4
const SIX=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05'];   /* 可昕：AA_861～868 新稿沒有 fx（CANON-NO-ECON-1112 第三批：這一項拿掉）*/ const noFx=[], badFx=[];
for(const [t,C] of Object.entries(terms(NOW))) for(const w of SIX){ const X=C[w]; if(!X||!X.steps) continue; for(const s of [].concat(X.steps,X.dating||[])) for(const c of s.choices||[]){ if(!c.fx) noFx.push(t+'/'+w+'/'+s.id+'/'+c.t); else if(!Object.entries(c.fx).every(([k,v])=>(k==='fr'||k==='love')&&Number.isInteger(v))) badFx.push(t+'/'+w+'/'+s.id); } }
check('4. 五位每一個閒聊選項都有 fx（可昕新稿沒有 fx）',!noFx.length,J(noFx.slice(0,5)));
check('4. fx 只有 fr／love 整數',!badFx.length,J(badFx.slice(0,5)));
console.log(fail?('有 '+fail+' 項失敗'):'ALL PASS'); process.exit(fail?1:0);
