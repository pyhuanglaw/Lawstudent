// 她記得你說過的（AA712-CITE-LATER-1108；AA_712 cite_later → src/data/heroine_arcs.js 每一拍的 cite）——不需要瀏覽器（D131）。
// AA-B 11-08 03:00：cite 的 27 句沒有地方讀；規則（AA_712 _meta「輪換句、訊息、偶遇用；每句用一次」最簡單的版本）：
//   ① 輪換句（ARCS.rotPick）：她那一拍你選的答案（BEATS[id].ans[ansId]）記了、過了 5 天以上＝下一次一起做事、輪到中途那一句的時候先說 cite（一次活動最多一句）
//   ② 每句只用一次（BEATS[id].citeUsed[ansId]）；同一個答案兩句＝先第一句，下一次輪到再第二句
//   ③ 那一拍關掉、late、沒演＝沒有 ans＝沒有 cite；舊存檔照新規則（有 ans 就可能出現）
//   ④ 訊息、偶遇：這一版不做
// 檢查：0 資料（27 句、每個 key 都是那一拍某個選項的 ansId）；1 選了 → 5 天以後一起念書（總圖）／吃飯：中途她說那一句；2 不到 5 天不說；3 只說一次；
//       4 兩句的先第一句、下一次第二句；5 沒有 ans 不說；6 一次活動最多一句（中途只有一則）；7 when 的日子也是 cite 先；舊存檔（ans 沒記日子）照說
// 修改前 1～7 FAIL（rotPick 不讀 cite）。用法：node tests/arc_cite_unit.js
const H=require('./pg_harness.js');
const {check,GM,E}=H; const J=JSON.stringify;
const fs=require('fs'), path=require('path'), vm=require('vm');
const loadG=(f,names)=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let s=fs.readFileSync(p,'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); return true; };
loadG('src/data/study_scenes.js',['STUDY_SCENES']); loadG('src/data/activity_scenes.js',['ACTIVITY_SCENES']); loadG('src/studyn3d.js',['STUDYN']);
loadG('src/data/heroine_arcs.js',['HEROINE_ARCS']); const ok1=loadG('src/data/arc_rot.js',['ARC_ROT']), ok2=loadG('src/arcs3d.js',['ARCS']);
const stageOf={}; const DS=DATE.stageNum; DATE.stageNum=id=>stageOf[id]!=null?stageOf[id]:DS(id);
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone); G.invites=[]; G.stats=G.stats||{}; E.zone={seats:[],spawn:{x:0,z:0,yaw:0},roomAt:()=>null}; E.npcs=[]; E.player.seat=null; E.player.busy=false; E.player.lv=0; INV._now=()=>Date.now()+1e9; return G; };
const npc=id=>{ const n={id,charId:id,obj:{position:{x:1,y:0,z:0},rotation:{y:0}},beh:'idle',pose:'idle',lv:0}; GM.npc[id]=n; E.npcs.push(n); return n; };
const said=()=>H.said.map(s=>s.t);
const AN='heroine_01', ZR='heroine_02';
const P=id=>HEROINE_ARCS.people[id];
const citeOf=(id,mem)=>{ for(const b of P(id).beats) if(b.cite&&b.cite[mem]) return {b,L:b.cite[mem]}; return null; };
const answer=(G,id,mem,day)=>{ const r=ARCS.rec(G,id); r.ans[mem]={opt:0,day}; return r; };
(async()=>{
  check('0. 載入（HEROINE_ARCS、ARC_ROT、ARCS.citePick）',ok1&&ok2&&!!ARCS.citePick);
  if(!ok2||!ARCS.citePick){ H.done(); return; }
  /* 0 資料 */
  { let n=0; const bad=[]; for(const [id,p] of Object.entries(HEROINE_ARCS.people)) for(const b of p.beats||[]) if(b.cite) for(const [k,L] of Object.entries(b.cite)){ n+=L.length; if(!(b.opts||[]).some(o=>o.ansId===k)||!L.every(t=>typeof t==='string'&&t.trim())) bad.push(id+':'+b.n+':'+k); }
    check('0. cite 一共 27 句；每個 key 都是那一拍某個選項的 ansId（tools/story/import_arcs.py 從 AA_712 cite_later 匯入，不改字）',n===27&&!bad.length,J({n,bad})); }
  const C1=citeOf(AN,'PL_RETAKE_NIGHT');
  /* 1 選了 → 5 天以後：rotPick 先給 cite */
  { const G=fresh('2025-10-21',14,'cafe'); answer(G,AN,'PL_RETAKE_NIGHT',G.day-5); const p=ARCS.rotPick(G,AN,{});
    check('1. 以安第 1 拍選「重考那年，我半夜騎車去河堤吹風。」、5 天以後：中途那一句先說「你說的那個河堤，晚上是不是很暗？我只是想知道。」',!!p&&p.cite==='PL_RETAKE_NIGHT'&&J(p.lines)===J(['你說的那個河堤，晚上是不是很暗？我只是想知道。'])&&J(p.lines)===J([C1.L[0]]),J(p)); }
  /* 2 不到 5 天 */
  { const G=fresh('2025-10-21',14,'cafe'); answer(G,AN,'PL_RETAKE_NIGHT',G.day-4); const p=ARCS.rotPick(G,AN,{});
    check('2. 4 天：不說（照原本的輪換句）',!!p&&!p.cite&&p.rot!=null,J(p)); }
  /* 3 只說一次 */
  { const G=fresh('2025-10-21',14,'cafe'); answer(G,AN,'PL_RETAKE_NIGHT',G.day-10); const p=ARCS.rotPick(G,AN,{}); ARCS.rotDone(G,AN,p); G.day+=7; const q=ARCS.rotPick(G,AN,{});
    check('3. 說過一次（citeUsed）：之後不再說',!!p&&p.cite==='PL_RETAKE_NIGHT'&&ARCS.rec(G,AN).citeUsed.PL_RETAKE_NIGHT===1&&!!q&&!q.cite,J({p,q,u:ARCS.rec(G,AN).citeUsed})); }
  /* 4 兩句：先第一句，下一次第二句（現在 AA_712 每個答案都只有一句：測試用兩句的資料，測完還原）*/
  { const save=C1.b.cite.PL_RETAKE_NIGHT; C1.b.cite.PL_RETAKE_NIGHT=['第一句。','第二句。'];
    try{ const G=fresh('2025-10-21',14,'cafe'); answer(G,AN,'PL_RETAKE_NIGHT',G.day-6); const a=ARCS.rotPick(G,AN,{}); ARCS.rotDone(G,AN,a); G.day+=1; const b=ARCS.rotPick(G,AN,{}); ARCS.rotDone(G,AN,b); G.day+=1; const c=ARCS.rotPick(G,AN,{});
      check('4. 同一個答案兩句：第一次「第一句。」、下一次輪到「第二句。」、再下一次沒有',!!a&&J(a.lines)===J(['第一句。'])&&!!b&&J(b.lines)===J(['第二句。'])&&!!c&&!c.cite,J({a,b,c})); }
    finally{ C1.b.cite.PL_RETAKE_NIGHT=save; } }
  /* 5 沒有 ans */
  { const G=fresh('2025-10-21',14,'cafe'); const r=ARCS.rec(G,AN); r.missed=[1]; r.k=2; const p=ARCS.rotPick(G,AN,{});
    check('5. 那一拍沒演（missed、沒有 ans）：沒有 cite',!!p&&!p.cite,J(p));
    const G2=fresh('2025-10-21',14,'cafe'); answer(G2,AN,'PL_RULE',G2.day-30); const p2=ARCS.rotPick(G2,AN,{}); check('5. 選了沒有 cite 的那個答案（PL_RULE）：沒有',!!p2&&!p2.cite,J(p2)); }
  /* 6 一次活動最多一句：遊戲流程（吃飯、念書），中途只有那一句 */
  for(const [kind,place,zone,h] of [['eat','noodle','noodle',18],['study','library','library_hall',15]]){ const id=AN, w={name:'沈以安',charId:id}; const G=fresh('2025-10-21',h,zone); stageOf[id]=3; H.FRIEND(id);
    const AXk=STUDYN.act(kind); const N=AXk.size(id); const ar=AXk.of(G,id); ar.k=N+1; ar.n=N; const br=ARCS.rec(G,id); br.last=G.day;   /* 活動的第 N 場都演完了；故事線今天演過 */
    answer(G,id,'PL_RETAKE_NIGHT',G.day-7); answer(G,id,'PL_NOW',G.day-7);
    H.said=[]; H.picks=[0]; const iv=INV.accept(G,id,place,G.day,h,{by:'player'}); const n=npc(id); await INV.meet(GM,iv,n,{}); const got=said();
    const cites=[citeOf(id,'PL_RETAKE_NIGHT').L[0],citeOf(id,'PL_NOW').L[0]].filter(t=>got.includes(t));
    check('6. 一起'+(kind==='eat'?'吃飯（麵店）':'念書（總圖）')+'、輪到中途那一句：她說記得的那一句、只說一句（兩個答案都夠久也只說第一個）；記 citeUsed',cites.length===1&&cites[0]===citeOf(id,'PL_RETAKE_NIGHT').L[0]&&ARCS.rec(G,id).citeUsed.PL_RETAKE_NIGHT===1&&!ARCS.rec(G,id).citeUsed.PL_NOW,J({cites,got}));
    G.day+=1; G.hour=h; const r2=ARCS.rec(G,id); r2.last=G.day; H.said=[]; H.picks=[0]; const iv2=INV.accept(G,id,place,G.day,h,{by:'player'}); await INV.meet(GM,iv2,n,{}); const got2=said();
    check('6. 下一次（'+kind+'）：輪到第二個答案那一句（「你今天也是本來應該在讀書嗎？」）',got2.includes(citeOf(id,'PL_NOW').L[0])&&!got2.includes(citeOf(id,'PL_RETAKE_NIGHT').L[0]),J(got2)); }
  /* 7 when 的日子也是 cite 先；舊存檔（ans 沒記日子）照說；別人的答案不給她 */
  { const T=CALENDAR.TERMS.find(t=>t.id==='Y1S1'); const d0=STORY.dayOfKey(T.start)+15*7+2; const G=fresh('2025-09-16',14,'cafe'); G.day=d0; const w=ARCS.rotPick(G,AN,{}); answer(G,AN,'PL_RETAKE_NIGHT',d0-20); const p=ARCS.rotPick(G,AN,{});
    check('7. 期末週（when）：cite 比期末那句先',!!w&&w.tier===2&&!!p&&p.cite==='PL_RETAKE_NIGHT',J({w,p})); }
  { const G=fresh('2025-10-21',14,'cafe'); ARCS.rec(G,AN).ans.PL_NOW=true; const p=ARCS.rotPick(G,AN,{}); check('7. 舊存檔（ans 沒記日子）：照說',!!p&&p.cite==='PL_NOW',J(p)); }
  { const G=fresh('2025-10-21',14,'cafe'); answer(G,AN,'PL_RETAKE_NIGHT',G.day-9); const p=ARCS.rotPick(G,ZR,{}); check('7. 以安的答案，芷若不會說',!!p&&!p.cite,J(p)); }
  { const G=fresh('2025-10-21',14,'cafe'); delete G.flags.BEATS; let err=null, p=null; try{ p=ARCS.rotPick(G,AN,{}); }catch(e){ err=e; } check('7. 舊存檔沒有 BEATS：不丟例外',!err&&!!p&&!p.cite,String(err)); }
  H.done();
})().catch(e=>{ console.error(e); console.log('FAILED (exception)'); process.exit(1); });
