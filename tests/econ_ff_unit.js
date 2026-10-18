// 經濟系在學期間事件接事件（D102；AA_292 企劃 98c0bfa1；src/econff3d.js）——不需要瀏覽器。
// 檢查：① 9/2 E01 早上以後才開、10/19 退宿以後關；?nofastecon 關掉 ② 下一個事件照 AA_292 的順序（E02 → 會計第一堂 → 第一次經原 → 社團博覽會…），
//   做完的跳過、E05 在 9/19 接 P2 演過就不再排 9/20 ③ 跳過的課自動算出席（R.done、attend、不發翹課訊息），考試不算 ④ 跳的途中收到要回的訊息就停（'msg'）
//   ⑤ 跳過兩天以上才有一句旁白、同一句不重複、落在對的期間 ⑥ 深夜的步驟（10/15 24:30 凌晨兩點的微積分）時間還算 10/15
// 用法：node tests/econ_ff_unit.js
const fs=require('fs'), vm=require('vm'), path=require('path'); const ROOT=path.resolve(__dirname,'..');
global.window=global; global.self=global; global.document={getElementById:()=>null,addEventListener(){}}; global.location={search:''};
const load=f=>{ let src=fs.readFileSync(path.join(ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(CALENDAR|COURSES|CLS|CHARACTERS|ECONFF)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/data/calendar.js','src/data/characters.js','src/data/courses.js','src/classes3d.js','src/econff3d.js']) load(f);
let fails=0; const check=(n,ok,i)=>{ console.log((ok?'PASS ':'FAIL ')+n+(i?'　'+i:'')); if(!ok) fails++; };
const dayOf=k=>{ for(let d=-600; d<400; d++){ const t=CALENDAR.dateOf(d); if(t&&t.key===k) return d; } return null; };
global.STORY={dayOfKey:dayOf}; global.STORY_EVENTS=[]; global.EVENTS={running:null};
let pend=0; global.PHONE={pending:()=>Array(pend).fill(0),tick(){}};
const mkG=(k,h,f)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:Object.assign({E01_MORNING:true},f||{}),events:{done:{}}});
{ check('① 9/2 08:00（E01 早上以後）開',ECONFF.on(mkG('2024-09-02',8)));
  check('① E01 早上還沒演：不開',!ECONFF.on(mkG('2024-09-02',8,{E01_MORNING:false})));
  check('① 法律系：不開',!ECONFF.on(Object.assign(mkG('2024-09-02',8),{stage:'law'})));
  const g=mkG('2024-10-17',23); g.events.done.ev_y0_e30_note=1; check('① 10/17 便利貼演完：還開（下一步 10/19 退宿）',ECONFF.on(g)); const g2=mkG('2024-10-19',18,{Y0_MOVED_OUT:true}); check('① 10/19 退宿以後：第一階段關（換第二階段，tests/econ_ff2_unit.js）',!ECONFF.on(g2));
  global.location={search:'?nofastecon'}; check('① ?nofastecon：關',!ECONFF.on(mkG('2024-09-02',8))); global.location={search:''}; }
{ const G=mkG('2024-09-02',8); const ids=[]; for(let i=0;i<6;i++){ const s=ECONFF.next(G); if(!s) break; ids.push(s.ev||s.cls); ECONFF.rec(G).done[s.n]=1; }
  check('② 順序：E02 → 會計第一堂 → 第一次經原 → 社團博覽會 → P2 → E05',JSON.stringify(ids)===JSON.stringify(['ev_y0_e02','acct_y0','econ_principles_y0','ev_y0_e07','ev_y0_p2','ev_y0_e05']),JSON.stringify(ids));
  const G2=mkG('2024-09-19',16,{}); for(const s of ECONFF.STEPS) if(s.n<9) ECONFF.rec(G2).done[s.n]=1; G2.events.done.ev_y0_e05=1; const s9=ECONFF.next(G2);
  check('② E05 在 9/19 接 P2 演過：9/20 那一個跳過，下一個是 9/21 系烤',s9&&s9.ev==='ev_y0_e08',s9&&s9.ev);
  const s5=ECONFF.STEPS.find(s=>s.n===5), t5=ECONFF.tOf(G,s5), it=ECONFF.clsItem(G,dayOf('2024-09-05'),'acct_y0');
  check('② 會計第一堂的時間＝那堂課開始前 5 分鐘（9/5 13:15）',!!it&&Math.abs(t5-(dayOf('2024-09-05')*24+it.t0-1/12))<1e-6,it&&it.t0); }
{ const G=mkG('2024-09-02',12.3); const n=ECONFF.attendBetween(G,dayOf('2024-09-05')*24+13); const R=CLS.rec(G);
  const keys=Object.keys(R.done); check('③ 9/2 下午～9/5 13:00 的課自動算出席、不發翹課訊息',n>=3&&keys.every(k=>R.note['skip_'+k]===1)&&Object.values(R.attend).every(v=>v>=1),n+' 堂 '+JSON.stringify(Object.keys(R.attend)));
  check('③ 9/5 13:20 的會計（還沒到）不算',!keys.some(k=>/acct_y0/.test(k)&&k.startsWith(String(dayOf('2024-09-05'))+':')),JSON.stringify(keys.filter(k=>/acct/.test(k)))); }
{ const G=mkG('2024-09-02',13); pend=0; let calls=0; global.STORY.phoneRules=()=>{ calls++; if(G.hour>=22.4) pend=1; };
  const r=ECONFF.jumpTo({G,E:null},dayOf('2024-09-05'),13.25); check('④ 跳的途中收到要回的訊息：停在那一刻（9/2 23:00 左右）',r==='msg'&&G.day===dayOf('2024-09-02')&&G.hour>=22.4&&G.hour<=23.01,r+' '+G.day+' '+G.hour);
  pend=0; global.STORY.phoneRules=()=>{}; const r2=ECONFF.jumpTo({G,E:null},dayOf('2024-09-05'),13.25); check('④ 沒有要回的：跳到 9/5 13:15',r2==='ok'&&G.day===dayOf('2024-09-05')&&Math.abs(G.hour-13.25)<1e-6&&G.weekday===CALENDAR.dateOf(G.day).wd,r2+' '+G.hour); }
{ const G=mkG('2024-09-09',11); const a=ECONFF.lineFor(G,dayOf('2024-09-09'),dayOf('2024-09-18')); check('⑤ 9/9 → 9/18：「三棟樓之間的路……」',/三棟樓之間的路/.test(a||''),a);
  check('⑤ 只隔一天：沒有',ECONFF.lineFor(G,dayOf('2024-09-18'),dayOf('2024-09-19'))===null);
  ECONFF.rec(G).lines.push(a); const b=ECONFF.lineFor(G,dayOf('2024-09-09'),dayOf('2024-09-18')); check('⑤ 用過的不重複（同一段改用備用句）',b!==a&&!!b,b); }
{ const G=mkG('2024-10-15',22.6); const r=ECONFF.jumpTo({G,E:null},dayOf('2024-10-15'),24.5); check('⑥ 10/15 24:30：日子還是 10/15、時間 24.5（凌晨兩點的微積分的條件）',r==='ok'&&G.day===dayOf('2024-10-15')&&Math.abs(G.hour-24.5)<1e-6,G.day+' '+G.hour);
  const r2=ECONFF.jumpTo({G,E:null},dayOf('2024-10-16'),19); check('⑥ 接著跳到 10/16 19:00',r2==='ok'&&G.day===dayOf('2024-10-16')&&Math.abs(G.hour-19)<1e-6,G.day+' '+G.hour); }
// ⑦ 睡覺、快轉＝到下一個事件（2026-10-18 使用者：「我每天睡覺到休學，還可以跟可昕告白，中間我們根本沒遇到」）
(async()=>{ const G=mkG('2024-09-02',22); G.flags.ECONFF={done:{4:1,5:1},lines:[]}; let adv=0; const save=ECONFF.advance; ECONFF.advance=async()=>{ adv++; };
  const r=await ECONFF.sleepJump({G,E:null}); check('⑦ 事件模式：睡覺改成跳到下一個事件（advance 一次）',r===true&&adv===1,adv);
  ECONFF.busy=true; const r2=await ECONFF.sleepJump({G,E:null}); check('⑦ 正在跳：不重複跳、也不照原本睡到隔天',r2===true&&adv===1); ECONFF.busy=false;
  const L=Object.assign(mkG('2024-09-02',22),{stage:'law'}); check('⑦ 法律系：照原本睡覺',(await ECONFF.sleepJump({G:L,E:null}))===false);
  const D=mkG('2024-10-19',20,{Y0_MOVED_OUT:true}); check('⑦ 退宿以後（第一階段結束）：照原本睡覺（在家那一輪由 homeStep 接）',(await ECONFF.sleepJump({G:D,E:null}))===false);
  ECONFF.advance=save;
  const src=['src/story3d.js','src/home3d.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n');
  check('⑦ 宿舍的床（sleepNow）、家裡睡覺（HOME.sleep）、快轉（ffMenu）都先問 ECONFF.sleepJump',(src.match(/ECONFF\.sleepJump\(GM\)/g)||[]).length>=3);
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0); })();
