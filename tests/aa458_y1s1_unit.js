// AA_458 法律系大一上讀一遍（企劃線 b01e32018，AA-B 2026-10-25 10:1x；任務 TERM-READ-Y1S1-1025）——不需要瀏覽器。台詞逐字對 AA_458（從企劃線 git show 讀稿、解析表格）。
//   0 讀稿（1-2 長輩圖四張、1-3 兩張表、1-4、1-5、第 2 節、3-1～3-4、4-1、4-2 都讀得到）；HOME.GROUP_WK／ELDER／GROUP_DINNER／FAM_DAYS、BBPACK.D5_LINES 照稿一字不差
//   1 媽媽的週四群組：新開局（主線第一天 9/3）大一上逐週＝1-4 的表（9/4、9/11、9/18 三句不同；中秋那週、期中考試週、期末那週＝冬至）；舊開局（9/17）9/18「東西缺什麼」、平常從 11/13 起；
//     一學期一字不差的只剩「這週回來吃飯嗎」「回來的話先講 我多煮」各兩次；每一句自己的回覆（1-3 的表，「會回去」「這週不回」各跑一輪）；
//     大一上沒有的種類（母親節、天氣熱、端午、爸爸寄茶葉／大閘蟹／又寄點心）照日曆排到的週四；兩小時沒回爸爸「？」照舊；
//     1-5 回了「會回去」、那個週末回家吃晚餐＝「（晚餐。媽媽煮了一桌。）」後面多一句旁白（同一個週末只一次；這週不回、連假、平常不加）；
//     舊存檔（已經用舊的句子收過、沒有 ask.k、沒有 G.home.grp）：不加旁白、不重發、不補發以前的週四
//   2 沛珊的講義（BBPACK D5）：第 1 次原句，照第幾次輪五種說法，第 5 種以後從第 2 句再輪；選項、她的回覆照舊；舊存檔照手機裡收過的則數接
//   3 家族群組換字：3-1「下週五」、3-2 沒去聚餐一則改兩則（考古題資料夾的照片＋「跟我拿」）、3-3「期末考完，12/22」、3-4 學姊 10/14 兩句補句號
//   4 中秋當天（10/6 18:00 媽媽兩則、21:00 爸爸）、颱風假前一晚（10/12 20:45 媽媽、21:00 爸爸；calendar.js 每一個法律系的颱風假）：家人群組、不用回；
//     那時候人在家裡、住家裡、人在國外的差別；睡著的照原本的時間補，過了那一段不補
//   7 第 7 節①（企劃線 ae13fa69e）：中秋照每一年換（2025 原句、2026 芋頭、2027 烤肉、2028 最後一個＋爸爸「這張最清楚」）；日子照日曆；舊存檔那一年已經收過的不重發
// 修改前（開發分支 b5e07ddab）：0～4 每一節至少一項 FAIL；第 7 節：c7d701caf 上 FAIL。用法：node tests/aa458_y1s1_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return false; } try{ let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; }catch(e){ loadErr.push(f+'：'+e.message); return false; } };
for(const f of ['src/data/bbpack_events.js','src/bbpack3d.js','src/family_xmas3d.js','src/sis_grad3d.js']) L3(f);   /* 照 bbpack_unit.js、aa406_family_xmas_unit.js、sis_grad_unit.js 載的檔 */
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; G.weekday=wdOf(d); };
const NEW={LAW_START_DAY:STORY.LAW_D0,MAIN_D1:STORY.MAIN_D1_NEW};   /* 新開局（AA_195：主線第一天 9/3）；沒有＝舊開局（9/17）*/
const fresh=(k,h,flags,zone)=>{ const G=H.fresh(typeof k==='number'?keyOf(k):k,h,zone||'dorm',Object.assign({introDone:true,afternoonDone:true,classDone:true,metAn:true,MET_ZHE:true},flags||{})); G.outings=[]; G.acts={att:{}}; G.contacts=G.contacts||{}; PHONE.rec(G); return G; };
const hr=()=>{ HOME.phoneRules(GM); PHONE.tick(H.G); };
const askOf=d=>(H.G.msgs||[]).find(m=>m.ask&&m.ask.id==='home_ask_'+d)||null;
const famMsgs=()=>(H.G.msgs||[]).filter(m=>m.th==='g:home');
const byTag=tag=>(H.G.msgs||[]).filter(m=>m.tag===tag);
const onT=(h,s0)=>h>=s0-1e-6&&h<s0+0.25;   /* 準時跑規則的時候 PHONE.tick 照「現在」送（排定時間後 15 分鐘內）；睡過了才補在原本的時間（另外驗）*/

/* ---- 讀稿（企劃線 b01e32018）---- */
let doc=''; try{ doc=cp.execSync('git show b01e32018:"docs/story_planning/AA_458_法律系大一上讀一遍_媽媽週四群組_沛珊講義_家族群組的日子.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
const part=(a,b)=>{ const i=doc.indexOf(a); if(i<0) return ''; const j=b?doc.indexOf(b,i+1):-1; return doc.slice(i,j<0?doc.length:j); };
const rows=t=>t.split('\n').filter(l=>/^\|/.test(l.trim())&&!/^\|\s*-/.test(l.trim())).map(l=>l.trim().replace(/^\||\|$/g,'').split('|').map(c=>c.trim()));
const orig=s=>s.replace(/（原句）$/,'').trim();
const quotes=t=>{ const out=[]; let tm=null; for(const l of t.split('\n')){ const m=l.match(/\*\*(\d\d):(\d\d)\*\*/); if(m) tm=+m[1]+(+m[2])/60; const q=l.trim().match(/^> (\S+?)：(.+)$/); if(q) out.push({who:q[1],t:q[2],h:tm}); } return out; };
const ELD=part('### 1-2','### 1-3').split('\n').map(l=>l.trim()).filter(l=>/^- （長輩圖：/.test(l)).map(l=>l.replace(/^- /,''));
const KMAP={'第一週（那個週六是 1～7 號）':'first_sis','第一週（其他）':'first','中秋':'moon','冬至':'dz','母親節':'mom','端午':'dragon','連假①':'lj0','連假②':'lj1','連假③':'lj2','考試週':'exam','天氣（涼）':'cool','天氣（熱）':'hot','①':'p1','③':'p3','長輩圖（②④）':'old'};
const T13={}; for(const r of rows(part('### 1-3','**爸爸寄東西**'))) if(KMAP[r[0]]) T13[KMAP[r[0]]]=[r[0]==='長輩圖（②④）'?null:r[1],r[2].split('＋'),r[3].split('＋')];
const DMAP={'大一上':'dad_snack','大一下':'dad_tea','大二上':'dad_crab','大二下':'dad_snack2'};
for(const r of rows(part('**爸爸寄東西**','### 1-4'))) if(DMAP[r[0]]) T13[DMAP[r[0]]]=[orig(r[1]),r[2].split('＋'),r[3].split('＋')];
/* AA_459 第 1 節（企劃線 c0972cd32）：連假②換字「這次連假 回來住幾天」、期末多一種（下學期 fin2；上學期 fin1 照 AA_459 第 8 節刪掉）——對稿在 tests/aa459_y1s2_unit.js；這裡照 AA_459 改期待 */
T13.lj1[0]='這次連假 回來住幾天'; const NEW459=['fin2'];
const T14=rows(part('### 1-4','- 舊開局')).filter(r=>/^\d{1,2}\/\d{1,2}$/.test(r[0])).map(r=>{ const [m,d]=r[0].split('/').map(Number); return {d:D('2025-'+String(m).padStart(2,'0')+'-'+String(d).padStart(2,'0')),kind:r[1],t:r[2]==='放三天 回來住兩晚'?T13.lj1[0]:r[2]}; });
const DIN_MAP={'中秋':['moon'],'冬至':['dz'],'端午':['dragon'],'母親節':['mom'],'爸爸寄東西：點心':['dad_snack','dad_snack2'],'爸爸寄東西：茶葉':['dad_tea'],'爸爸寄東西：大閘蟹':['dad_crab']};
const T15={}; for(const r of rows(part('### 1-5','## 2.'))) for(const k of (DIN_MAP[r[0]]||[])) T15[k]=r[1];
const D5=[]; for(const r of rows(part('## 2.','## 3.'))) if(/^[1-5]$/.test(r[0])) D5[+r[0]-1]=orig(r[1]);
const Q31=quotes(part('### 3-1','### 3-2')), Q32=quotes(part('### 3-2','### 3-3')), Q33=quotes(part('### 3-3','### 3-4')), Q41=quotes(part('### 4-1','### 4-2')), Q42=quotes(part('### 4-2','## 5.'));
const S34=[...part('### 3-4','## 4.').matchAll(/「(你晚上如果也要讀書[^」]+|不要講話就好[^」]+)」/g)].map(m=>m[1]);
const OLD_D5='講義我先印了，放在女舍一樓的櫃子，誰要拿？';
let doc7=''; try{ doc7=cp.execSync('git show ae13fa69e:"docs/story_planning/AA_458_法律系大一上讀一遍_媽媽週四群組_沛珊講義_家族群組的日子.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc7=''; }   /* 第 7 節：中秋照每一年換 */
const P7=(()=>{ const i=doc7.indexOf('## 7.'); return i<0?'':doc7.slice(i); })();
const MOON_KEYS=((P7.match(/日子照日曆（([^）]+)）/)||[])[1]||'').split('、').filter(Boolean);
const T7=rows(P7).filter(r=>/^20\d\d$/.test(r[0])).map(r=>({y:+r[0],mom:orig(r[1]).split('／').map(t=>'媽媽：'+t),dad:orig(r[2]).split('／').map(t=>'爸爸：'+t)}));

(async()=>{
/* ---- 0 讀稿、資料照稿 ---- */
await sec(0,()=>{
  check('0. 讀得到稿、檔都載得到（BBPACK、FAMXMAS、SISG）',!!doc&&!loadErr.length&&typeof BBPACK!=='undefined'&&typeof FAMXMAS!=='undefined'&&typeof SISG!=='undefined',J(loadErr));
  check('0. 稿裡的表都讀得到（長輩圖 4、1-3 十五種＋爸爸四學期、1-4 十六週、1-5 七種、第 2 節五句、3-1～3-4、4-1 三則、4-2 兩則）',ELD.length===4&&Object.keys(T13).length===19&&T14.length===16&&T14.every(r=>r.d!=null&&wdOf(r.d)===4)&&Object.keys(T15).length===8&&D5.length===5&&D5[0]===OLD_D5&&Q31.length===1&&Q32.length===2&&Q33.length===1&&S34.length===2&&Q41.length===3&&Q42.length===2,
    J({ELD:ELD.length,T13:Object.keys(T13),T14:T14.length,T15:Object.keys(T15),D5:D5.length,Q:[Q31.length,Q32.length,Q33.length,S34.length,Q41.length,Q42.length]}));
  const W=HOME.GROUP_WK||{}, bad=Object.keys(T13).filter(k=>J(W[k])!==J(T13[k]));
  check('0. HOME.GROUP_WK 照 1-3 的兩張表（媽媽那句、回「會回去」、回「這週不回」；「好＋（愛心貼圖）」＝兩則；長輩圖那句照 ELDER 輪；連假②、fin2 照 AA_459）',!bad.length&&Object.keys(W).filter(k=>!NEW459.includes(k)).length===Object.keys(T13).length,J(bad.map(k=>[k,W[k],T13[k]])));
  check('0. HOME.ELDER＝1-2 的四張長輩圖（照稿的順序）',J(HOME.ELDER)===J(ELD),J(HOME.ELDER));
  check('0. HOME.GROUP_DINNER＝1-5 的表（點心兩學期同一句；其他種類沒有）',J(Object.keys(HOME.GROUP_DINNER||{}).sort())===J(Object.keys(T15).sort())&&Object.keys(T15).every(k=>HOME.GROUP_DINNER[k]===T15[k]),J(HOME.GROUP_DINNER));
  check('0. BBPACK.D5_LINES＝第 2 節的五句（第 1 句＝原句）',J(BBPACK.D5_LINES)===J(D5),J(BBPACK.D5_LINES));
  const F=HOME.FAM_DAYS||{}, tx=a=>(a||[]).map(([w,t])=>(w==='dad'?'爸爸':'媽媽')+'：'+t);
  check('0. HOME.FAM_DAYS＝4-1、4-2 的字（媽媽／爸爸）',J(tx(F.moon).concat(tx(F.moonDad)))===J(Q41.map(q=>q.who+'：'+q.t))&&J(tx(F.ty).concat(tx(F.tyDad)))===J(Q42.map(q=>q.who+'：'+q.t)),J(F));
});

/* ---- 1 媽媽的週四群組 ---- */
const sim=(d0,d1,ans)=>{ const out=[]; for(let d=d0;d<=d1;d++){ if(wdOf(d)!==4) continue; at(d,20.05); hr(); const m=askOf(d); const e={d,key:keyOf(d),t:m?m.text:null,k:m&&m.ask.k};
    if(m&&ans){ const a=ans(e,out.length); const r=PHONE.answer(H.G,m.ask.id,a); e.a=a; e.r=r?r.out.filter(x=>x.from==='mom').map(x=>x.text):null; }
    at(d,23.5); hr(); out.push(e); } return out; };
const S1=D('2025-09-01'), S2=D('2025-12-21');
await sec(1,()=>{
  fresh(S1,8,NEW); const s=sim(S1,S2).filter(e=>e.t);
  check('1. 新開局：大一上逐週＝1-4 的表（第一個週四 9/4，十六週、句子一字不差）',J(s.map(e=>[e.key,e.t]))===J(T14.map(r=>[keyOf(r.d),r.t])),J(s.map(e=>[e.key.slice(5),e.t])));
  const f3=s.slice(0,3).map(e=>e.t);
  check('1. 9/4、9/11、9/18 三句都不一樣（原本連三週「這週回來吃飯嗎」）：「'+f3.join('」「')+'」',f3.length===3&&new Set(f3).size===3&&s[0].key==='2025-09-04');
  const g=k=>s.find(e=>e.key===k)||{};
  check('1. 中秋那週（10/2，中秋 10/6）：「'+T13.moon[0]+'」',g('2025-10-02').t===T13.moon[0]&&g('2025-10-02').k==='moon');
  check('1. 期中考試週（10/30，第 9 週）：「'+T13.exam[0]+'」；10/23 第 8 週是光復節連假（連假在考試週前面）',g('2025-10-30').t===T13.exam[0]&&g('2025-10-23').t===T13.lj2[0]&&CALENDAR.termOf(D('2025-10-23')).exam==='mid');
  check('1. 期末那週（12/18，第 16 週）：冬至（12/21）優先「'+T13.dz[0]+'」',g('2025-12-18').t===T13.dz[0]&&CALENDAR.termOf(D('2025-12-18')).exam==='final'&&CALENDAR.fest(D('2025-12-21'))==='冬至');
  check('1. 爸爸寄東西＝第 7 週週四（10/16）、天氣涼＝11 月第一個週四（11/6）、運動會停課（11/21 週五）不算連假（11/20 平常）',g('2025-10-16').k==='dad_snack'&&CALENDAR.termOf(D('2025-10-16')).week===7&&g('2025-11-06').k==='cool'&&g('2025-11-20').t===ELD[1]);
  const cnt={}; for(const e of s) cnt[e.t]=(cnt[e.t]||0)+1; const dup=Object.keys(cnt).filter(t=>cnt[t]>1).sort();
  check('1. 一學期裡一字不差的只剩「這週回來吃飯嗎」兩次、「回來的話先講 我多煮」兩次',J(dup)===J([T13.p1[0],T13.p3[0]].sort())&&dup.every(t=>cnt[t]===2),J(cnt));
  const C=HOME.rec(H.G).grp||{}; check('1. 存檔 G.home.grp：平常 7 次、長輩圖 3 張',C.p===7&&C.e===3,J(C));
  /* 舊開局（第一個週四 9/18）*/
  fresh(S1,8,{}); const o=sim(S1,S2).filter(e=>e.t), P=[T13.p1[0],ELD[0],T13.p3[0],ELD[1],T13.p1[0]];
  const want=[['2025-09-18',T13.first[0]]].concat(T14.filter(r=>keyOf(r.d)>='2025-09-25'&&keyOf(r.d)<='2025-11-06').map(r=>[keyOf(r.d),r.t]),[['2025-11-13',P[0]],['2025-11-20',P[1]],['2025-11-27',P[2]],['2025-12-04',P[3]],['2025-12-11',P[4]],['2025-12-18',T13.dz[0]]]);
  check('1. 舊開局：9/18 第一週（其他）「'+T13.first[0]+'」（9/20 不是 1～7 號）；9/25～11/6 同 1-4；平常從 11/13 開始（①→②→③→④→①）',J(o.map(e=>[e.key,e.t]))===J(want),J(o.map(e=>[e.key.slice(5),e.t])));
  /* 每一句自己的回覆：「會回去」「這週不回」各一輪 */
  const bad=[]; for(const flip of [0,1]){ fresh(S1,8,NEW); const r=sim(S1,S2,(e,i)=>(i+flip)%2); for(const e of r){ if(!e.t) continue; const want=T13[e.k]&&T13[e.k][e.a===0?1:2]; if(J(e.r)!==J(want)) bad.push([e.key,e.k,e.a,e.r,want]); }
    fresh(S1,8,{}); const r2=sim(D('2025-09-18'),D('2025-09-18'),()=>flip); if(J(r2[0].r)!==J(T13.first[flip?2:1])) bad.push(['first',flip,r2[0].r]); }
  check('1. 每一句都有自己的回覆（1-3 的表；大一上十二種＋第一週（其他），「會回去」「這週不回」都對）',!bad.length,J(bad));
  /* 大一上沒有的種類：照日曆排到的週四 */
  const OTH=[['mom','2026-05-07'],['hot','2026-05-14'],['dad_tea','2026-04-09'],['dad_crab','2026-11-12'],['dad_snack2','2027-04-08'],['dragon','2027-06-03']], bad2=[];
  for(const [k,key] of OTH) for(const a of [0,1]){ const d=D(key); fresh(d,20.05); hr(); const m=askOf(d); const r=m?PHONE.answer(H.G,m.ask.id,a):null; const got={t:m&&m.text,k:m&&m.ask.k,r:r?r.out.filter(x=>x.from==='mom').map(x=>x.text):null};
    if(got.t!==T13[k][0]||got.k!==k||J(got.r)!==J(T13[k][a?2:1])) bad2.push([key,k,a,got]); }
  check('1. 母親節（5/10 前的週四 5/7）、天氣熱（5 月第一個週四被母親節佔走→5/14）、端午（2027-06-09 前的週四 6/3）、爸爸寄茶葉（大一下第 7 週 4/9）、大閘蟹（大二上第 7 週被佔走→11/12；AA_459 1-2 期中只用一次，11/5 空出來給天氣涼，原本 11/19）、又寄點心（大二下 4/8）：句子、回覆照稿',!bad2.length,J(bad2));
  check('1. 大三以後爸爸寄的照茶葉 → 大閘蟹 → 點心輪、大閘蟹只在秋天（大三上茶葉、大三下輪到大閘蟹＝跳過換點心）',HOME.dadKey('Y3S1')==='dad_tea'&&HOME.dadKey('Y3S2')==='dad_snack2'&&!['Y1S2','Y2S2','Y3S2','Y4S2'].some(t=>HOME.dadKey(t)==='dad_crab'),J(['Y3S1','Y3S2','Y4S1','Y4S2'].map(HOME.dadKey)));
  /* 爸爸「？」照舊、STORY.phoneRules 接得到 */
  { const d=D('2025-09-04'); fresh(d,20.05,NEW); STORY.phoneRules(GM); PHONE.tick(H.G); const m=askOf(d); at(d,22.1); STORY.phoneRules(GM); PHONE.tick(H.G);
    check('1. STORY.phoneRules 接到：新開局 9/4 20:00「'+T14[0].t+'」、選項「會回去／這週不回」；兩小時沒回，爸爸「？」（照舊）',!!m&&m.text===T14[0].t&&onT(m.h,20)&&J(m.ask.opts.map(o=>o.t))===J(['會回去','這週不回'])&&byTag('home_ask_'+d+'_dad').some(x=>x.from==='dad'&&x.text==='？'),J(m&&[m.text,m.ask.opts.map(o=>o.t)])); }
});
/* ---- 1-5 晚餐旁白 ---- */
const dinner=async d=>{ at(d,19); const R=HOME.rec(H.G); R.at=true; R.eat=null; H.said=[]; H.picks=[]; await HOME.dinner(GM); R.at=false; return H.said.map(x=>x.t); };
const isHead=t=>/^（晚餐。媽媽煮了一桌/.test(t);
await sec('1-5',async()=>{
  fresh(S1,8,NEW); sim(S1,D('2025-10-02'),e=>(e.k==='lj0'||e.k==='moon')?0:1);
  const L0=await dinner(D('2025-09-26')), L1=await dinner(D('2025-10-03')), L2=await dinner(D('2025-10-04'));
  check('1-5. 中秋那週回「會回去」、10/3 回家吃晚餐：「（晚餐。媽媽煮了一桌。）」後面「'+T15.moon+'」',isHead(L1[0])&&L1[1]===T15.moon,J(L1.slice(0,3)));
  check('1-5. 同一個週末第二頓（10/4）不再加；連假（9/25 回了「會回去」）不加',isHead(L2[0])&&!Object.values(T15).includes(L2[1])&&isHead(L0[0])&&!Object.values(T15).includes(L0[1]),J([L0.slice(0,2),L2.slice(0,2)]));
  sim(D('2025-10-03'),D('2025-10-16'),e=>e.k==='dad_snack'?0:1); const L3_=await dinner(D('2025-10-18'));
  check('1-5. 爸爸寄東西（10/16 點心）回「會回去」、10/18 晚餐：「'+T15.dad_snack+'」',L3_[1]===T15.dad_snack,J(L3_.slice(0,2)));
  sim(D('2025-10-17'),D('2025-12-18'),()=>1); const L4=await dinner(D('2025-12-19'));
  check('1-5. 回「這週不回」（冬至那週）卻回家：不加',isHead(L4[0])&&!Object.values(T15).includes(L4[1]),J(L4.slice(0,2)));
  fresh(S1,8,NEW); sim(S1,D('2025-12-18'),e=>e.k==='dz'?0:1); const L5=await dinner(D('2025-12-20'));
  check('1-5. 冬至那週回「會回去」、12/20 晚餐：「'+T15.dz+'」',L5[1]===T15.dz,J(L5.slice(0,2)));
  const one=async(key,k,dn)=>{ const d=D(key); fresh(d,20.05); hr(); PHONE.answer(H.G,'home_ask_'+d,0); const L=await dinner(D(dn)); return L[1]===T15[k]; };
  check('1-5. 母親節（5/9）、爸爸寄茶葉（4/11）、大閘蟹（11/14，AA_459 1-2）、端午（6/5）回「會回去」那個週末的晚餐：各自那一句',await one('2026-05-07','mom','2026-05-09')&&await one('2026-04-09','dad_tea','2026-04-11')&&await one('2026-11-12','dad_crab','2026-11-14')&&await one('2027-06-03','dragon','2027-06-05'));
  /* 舊存檔：那個週四已經用舊的句子收過（ask 沒有 k）＝不加、不重發 */
  { const d=D('2025-10-02'); fresh(d,19,NEW); H.G.msgs.push({day:d,h:20,who:null,text:'這週回來吃飯嗎',th:'g:home',from:'mom',name:'媽媽',tag:'home_ask_'+d,ask:{id:'home_ask_'+d,until:d*24+22,opts:[{t:'會回去'},{t:'這週不回'}]},ans:0}); at(d,20.5); hr(); const L=await dinner(d+1);
    check('1-5. 舊存檔（中秋那週四已經收過舊的「這週回來吃飯嗎」、回了會回去）：不重發、晚餐不加旁白',byTag('home_ask_'+d).length===1&&isHead(L[0])&&!Object.values(T15).includes(L[1]),J([byTag('home_ask_'+d).map(m=>m.text),L.slice(0,2)])); }
  { const d0=D('2025-11-12'); fresh(d0,9,NEW); H.G.home={at:false,used:{},ate:{}}; for(const k of ['2025-10-16','2025-10-23','2025-10-30','2025-11-06']){ const d=D(k); H.G.msgs.push({day:d,h:20,text:'（長輩圖：週末愉快 天天開心）',th:'g:home',from:'mom',tag:'home_ask_'+d,ask:{id:'home_ask_'+d,until:d*24+22,opts:[]},ans:1}); }
    const n0=famMsgs().filter(m=>m.ask).length, r=sim(d0,S2).filter(e=>e.t), n1=famMsgs().filter(m=>m.ask).length;
    check('1. 舊存檔（11/12 讀檔，沒有 G.home.grp、以前收過舊的句子）：不補發以前的週四；之後照新的排（11/13 平常①「'+T13.p1[0]+'」、12/18 冬至）',n1-n0===6&&r.length===6&&r[0].key==='2025-11-13'&&r[0].t===T13.p1[0]&&r[5].t===T13.dz[0]&&HOME.rec(H.G).grp.p===5,J(r.map(e=>[e.key.slice(5),e.t]))); }
});

/* ---- 2 沛珊的講義 ---- */
const PS='classmate_peishan';
const d5=()=>(H.G.msgs||[]).filter(m=>/^bb_d5_\d+$/.test(m.tag||'')&&m.from===PS);
await sec(2,()=>{
  const W=D('2025-11-05'); fresh(W,20.05,{},'campus'); H.FAMILIAR(PS); PHONE.join(H.G,'public_law','公法讀書會'); const got=[], bad=[];
  for(let d=W;d<D('2026-12-17');d++){ if(wdOf(d)!==3) continue; at(d,20.05); BBPACK.phone(H.G); PHONE.tick(H.G); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='bb_d5_'+d); if(!m) continue;
    const r=PHONE.answer(H.G,m.ask.id,1); got.push({k:keyOf(d),t:m.text,n:H.G.flags.D5_ASK_N}); if(J(m.ask.opts.map(o=>o.t))!==J(['我去拿。','請別人幫我拿。'])||!r||J(r.out.filter(x=>x.from===PS).map(x=>x.text))!==J(['好，明天直接給你。'])) bad.push(keyOf(d)); }
  const rot=got.map((g,i)=>D5[i<5?i:1+(i-1)%4]);
  check('2. 大一上第一次（11/5）原句「'+OLD_D5+'」、第二次（12/3）「'+D5[1]+'」',got.length>=2&&got[0].k==='2025-11-05'&&got[0].t===D5[0]&&got[1].k==='2025-12-03'&&got[1].t===D5[1],J(got.slice(0,2)));
  check('2. 照第幾次輪：1～5 照表，用到第 5 句以後從第 2 句再輪（收到 '+got.length+' 次，到 12/17 沛珊休學以前）',got.length>=6&&J(got.map(g=>g.t))===J(rot),J(got.map(g=>[g.k,D5.indexOf(g.t)+1])));
  check('2. 選項「我去拿。／請別人幫我拿。」、她回的「好，明天直接給你。」每次都照舊；tag 照舊 bb_d5_<日>；第幾次記 D5_ASK_N（D5_N 是去拿了幾次，另外一個）',!bad.length&&got.every((g,i)=>g.n===i+1),J(bad));
  /* 舊存檔：已經用原句收過一次（沒有 D5_ASK_N）→ 下一次第 2 句；沒收過→第 1 句 */
  const W2=D('2025-12-03'); fresh(W2,20.05,{D5_LAST:D('2025-11-05')},'campus'); H.FAMILIAR(PS); PHONE.join(H.G,'public_law','公法讀書會'); H.G.msgs.push({day:D('2025-11-05'),h:20,text:OLD_D5,th:'g:public_law',from:PS,tag:'bb_d5_'+D('2025-11-05'),ask:{id:'bb_d5_'+D('2025-11-05'),until:0,opts:[]},ans:1});
  BBPACK.phone(H.G); PHONE.tick(H.G); const m2=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='bb_d5_'+W2);
  fresh(W2,20.05,{},'campus'); H.FAMILIAR(PS); PHONE.join(H.G,'public_law','公法讀書會'); BBPACK.phone(H.G); PHONE.tick(H.G); const m3=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='bb_d5_'+W2);
  check('2. 舊存檔（11/5 已經收過原句、沒有 D5_ASK_N）：12/3 接第 2 句；沒收過的舊存檔＝第 1 句',!!m2&&m2.text===D5[1]&&!!m3&&m3.text===D5[0],J([m2&&m2.text,m3&&m3.text]));
});

/* ---- 3 家族群組換字 ---- */
await sec(3,()=>{
  const fri=STORY.termDay('Y1S1',14,5), grp=()=>PHONE.join(H.G,'family_law','法律系直屬家族'), T=()=>PHONE.thread(H.G,'g:family_law').map(m=>(m.name||m.from)+'：'+m.text);
  fresh(fri-7,21,{},'campus'); grp(); STORY.phoneRules(GM); PHONE.tick(H.G);
  check('3-1. 前一週的週五（11/28）20:30 Kevin：「'+Q31[0].t+'」（原本「週五」）＋學姊「收到。」',J(T())===J(['Kevin：'+Q31[0].t,'溫學姊：收到。'])&&keyOf(fri-7)==='2025-11-28'&&byTag('fam_dinner_invite').every(m=>Math.abs(m.h-20.5)<0.02),J(T()));
  fresh(fri,19.2,{},'campus'); grp(); STORY.phoneRules(GM); at(fri,22.6); STORY.phoneRules(GM); PHONE.tick(H.G); const ns=byTag('fam_dinner_noshow');
  check('3-2. 沒去聚餐：22:00 Kevin 兩則「'+Q32.map(q=>q.t).join('」「')+'」（原本一則「📷 學姊整理的，沒來的人自己拿。」）；tag 照舊',J(ns.map(m=>(m.name||m.from)+'：'+m.text))===J(Q32.map(q=>q.who+'：'+q.t))&&ns.every(m=>Math.floor(m.h)===22)&&!T().some(t=>/自己拿/.test(t)),J(T()));
  fresh(fri,19.2,{},'campus'); grp(); H.G.msgs.push({day:fri,h:22,text:'📷 學姊整理的，沒來的人自己拿。',th:'g:family_law',from:'kevin',name:'Kevin',tag:'fam_dinner_noshow'}); at(fri,22.6); STORY.phoneRules(GM); PHONE.tick(H.G);
  check('3-2. 舊存檔已經收過舊的那一則：不重發',byTag('fam_dinner_noshow').length===1);
  fresh('2025-12-15',20,{met_sis:true}); H.FAMILIAR('heroine_05'); grp(); at(D('2025-12-15'),21.05); FAMXMAS.phone(H.G); PHONE.tick(H.G);
  check('3-3. 12/15 21:00 家族群組 Kevin：「'+Q33[0].t+'」（原本「期末考完那天」）',T()[0]==='Kevin：'+Q33[0].t&&!T().some(t=>/考完那天/.test(t)),J(T()));
  const tue=STORY.termDay('Y1S1',7,2); fresh(tue,21.6,{SIS_W1:true}); H.FRIEND('heroine_05'); SISG.unlockRule(H.G,tue*24+21.6); PHONE.tick(H.G); const sm=byTag('sisg_study_invite').filter(m=>m.from==='heroine_05');
  check('3-4. 學姊 10/14 21:30 兩句尾巴各補一個「。」',keyOf(tue)==='2025-10-14'&&J(sm.map(m=>m.text))===J(S34.map(t=>t+'。')),J(sm.map(m=>m.text)));
});

/* ---- 4 中秋當天、颱風假前一晚 ---- */
const famNew=(from)=>famMsgs().filter(m=>!m.ask&&(m.from==='mom'||m.from==='dad')&&/^home_(moon|ty)/.test(m.tag||'')).map(m=>({w:m.from==='dad'?'爸爸':'媽媽',t:m.text,h:m.h,day:m.day,tag:m.tag}));
const qs=Q=>Q.map(q=>({w:q.who,t:q.t}));
await sec(4,()=>{
  const M=D('2025-10-06'); fresh(M,17,NEW); PHONE.join(H.G,'home','家人'); at(M,17.9); hr(); const a0=famNew().length; at(M,18.05); hr(); const a1=famNew(); at(M,21.05); hr(); const a2=famNew();
  check('4-1. 中秋（10/6）18:00 媽媽「'+Q41[0].t+'」「'+Q41[1].t+'」、21:00 爸爸「'+Q41[2].t+'」；家人群組、不用回',CALENDAR.fest(M)==='中秋'&&a0===0&&J(a1.map(x=>({w:x.w,t:x.t})))===J(qs(Q41.slice(0,2)))&&a1.every(x=>x.day===M&&Math.floor(x.h)===18)&&J(a2.map(x=>({w:x.w,t:x.t})))===J(qs(Q41))&&onT(a2[2].h,21)&&a1.every(x=>onT(x.h,18))&&Q41[0].h===18&&Q41[2].h===21&&!famMsgs().some(m=>/^home_moon/.test(m.tag||'')&&m.ask),J(a2));
  check('4-1. tag：home_moon_<日>、home_moon_dad_<日>',byTag('home_moon_'+M).length===2&&byTag('home_moon_dad_'+M).length===1);
  fresh(M,17,NEW); PHONE.join(H.G,'home','家人'); HOME.rec(H.G).at=true; at(M,18.05); hr(); HOME.rec(H.G).at=false; at(M,19.5); hr(); at(M,21.05); hr();
  check('4-1. 18:00 人在家裡（回家過連假）：媽媽那兩則不傳（之後回宿舍也不補）；21:00 爸爸照傳',J(famNew().map(x=>x.w+'：'+x.t))===J([Q41[2].who+'：'+Q41[2].t]),J(famNew()));
  const lh=HOME.livesHome; HOME.livesHome=()=>true; fresh(M,17,NEW); PHONE.join(H.G,'home','家人'); at(M,18.05); hr(); at(M,21.05); hr(); const lv=famNew(); HOME.livesHome=lh;
  check('4-1. 住家裡：18:00 不傳、21:00 爸爸也傳',J(lv.map(x=>x.w))===J(['爸爸']),J(lv));
  fresh(M,17,NEW); PHONE.join(H.G,'home','家人'); at(M+1,8.5); hr();
  check('4-1. 睡過了（10/7 早上才跑規則）：照原本的時間補在 10/6 18:00、21:00',J(famNew().map(x=>[x.day,Math.round(x.h*100)/100]))===J([[M,18],[M,18.01],[M,21]]),J(famNew()));
  fresh(M+2,9,NEW); PHONE.join(H.G,'home','家人'); hr(); fresh(D('2025-10-20'),9,NEW); PHONE.join(H.G,'home','家人'); hr();
  check('4. 過了那一段（10/8 以後才讀檔的舊存檔）不補',!famNew().length);
  const ab=STORY.abroad; STORY.abroad=()=>true; fresh(M,21.05,NEW); PHONE.join(H.G,'home','家人'); hr(); const abN=famNew().length; STORY.abroad=ab;
  fresh(M,21.05,NEW); hr(); const noGrp=famNew().length;
  check('4. 人在國外、不在家人群組：都不傳',abN===0&&noGrp===0,J([abN,noGrp]));
  /* 颱風假前一晚 */
  const ty=D('2025-10-13'), E=ty-1; fresh(E,20,NEW); PHONE.join(H.G,'home','家人'); at(E,20.7); hr(); const t0=famNew().length; at(E,20.8); hr(); const t1=famNew(); at(E,21.05); hr(); const t2=famNew();
  check('4-2. 颱風假（10/13，calendar.js TYPHOON）前一晚 10/12 20:45 媽媽「'+Q42[0].t+'」、21:00 爸爸「'+Q42[1].t+'」；不用回',CALENDAR.typhoon(ty)&&t0===0&&J(t1.map(x=>({w:x.w,t:x.t})))===J(qs(Q42.slice(0,1)))&&onT(t1[0].h,20.75)&&J(t2.map(x=>({w:x.w,t:x.t})))===J(qs(Q42))&&onT(t2[1].h,21)&&Q42[0].h===20.75&&Q42[1].h===21&&byTag('home_ty_'+E).length===1&&byTag('home_ty_dad_'+E).length===1,J(t2));
  fresh(E,20,NEW); PHONE.join(H.G,'home','家人'); HOME.rec(H.G).at=true; at(E,21.05); hr(); const th=famNew(); HOME.livesHome=()=>true; fresh(E,20,NEW); PHONE.join(H.G,'home','家人'); at(E,21.05); hr(); const tl=famNew(); HOME.livesHome=lh;
  check('4-2. 那時候在家、住家裡：媽媽不傳（媽媽就在旁邊），爸爸照傳',J(th.map(x=>x.w))===J(['爸爸'])&&J(tl.map(x=>x.w))===J(['爸爸']),J([th,tl]));
  const all=['2026-10-19','2027-10-13','2028-09-18'].map(k=>{ const t=D(k); fresh(t-1,20,{}); PHONE.join(H.G,'home','家人'); at(t,9); hr(); return famNew().map(x=>[keyOf(x.day),x.w,Math.round(x.h*100)/100]); });
  check('4-2. 每一個法律系的颱風假（大二 2026-10-19、大三 2027-10-13、大四 2028-09-18）前一晚都傳（睡過了隔天補在原本的時間）',all.every((L,i)=>J(L)===J([[keyOf(D(['2026-10-19','2027-10-13','2028-09-18'][i])-1),'媽媽',20.75],[keyOf(D(['2026-10-19','2027-10-13','2028-09-18'][i])-1),'爸爸',21]])),J(all));
  fresh(E,21.6,NEW); PHONE.join(H.G,'home','家人'); PHONE.join(H.G,'noodle_team','麵店團'); PHONE.rec(H.G).groups.noodle_team.day=E-10; STORY.phoneRules(GM); PHONE.tick(H.G);
  check('4-2. 大一上這一晚的新聞、張教授的信、麵店團「四十二頁」照舊',byTag('ty1_news').length===1&&byTag('ty1_mail').length===1&&byTag('ty1_g1').some(m=>m.text==='四十二頁。颱風比較仁慈。')&&byTag('home_ty_'+E).length===1);
  fresh(D('2026-09-25'),21.05,{}); PHONE.join(H.G,'home','家人'); hr();
  const y2=famNew().length; fresh(D('2029-09-22'),21.05,{}); PHONE.join(H.G,'home','家人'); hr(); const pg=famNew().length;
  check('4-1. 在學的每年中秋都照這個（大二 2026-09-25 也有；子代理判斷：稿 4-1 的「住家裡」條件大一以後才用得到）；畢業以後（2029-09-22）不發',y2===3&&pg===0,J([y2,pg]));
});
/* ---- 7 中秋照每一年換（第 7 節①）---- */
await sec(7,()=>{
  check('7. 讀得到第 7 節：四年（2025～2028）媽媽兩則、爸爸一則（2028 兩則）；日子 '+MOON_KEYS.join('、'),T7.length===4&&J(T7.map(r=>r.y))===J([2025,2026,2027,2028])&&T7.every(r=>r.mom.length===2&&r.dad.length===(r.y===2028?2:1))&&MOON_KEYS.length===4&&MOON_KEYS.every((k,i)=>CALENDAR.fest(D(k))==='中秋'&&CALENDAR.dateOf(D(k)).y===T7[i].y),J({T7,MOON_KEYS}));
  check('7. 2025 那一列＝4-1 的原句（HOME.FAM_DAYS 不動）',J(T7[0].mom.concat(T7[0].dad))===J(Q41.map(q=>q.who+'：'+q.t)));
  const got=MOON_KEYS.map(k=>{ const M=D(k); fresh(M,17,{}); PHONE.join(H.G,'home','家人'); at(M,18.05); hr(); const a=famNew().map(x=>x.w+'：'+x.t); at(M,21.05); hr(); return {a,b:famNew().map(x=>x.w+'：'+x.t),d:famNew().filter(x=>x.w==='爸爸').map(x=>[x.day===M,Math.round(x.h*100)/100])}; });
  const bad=got.map((g,i)=>J(g.a)===J(T7[i].mom)&&J(g.b)===J(T7[i].mom.concat(T7[i].dad))&&g.d.every(x=>x[0]&&x[1]>=21&&x[1]<21.3)?null:[MOON_KEYS[i],g]).filter(Boolean);
  check('7. 每一年的中秋（'+MOON_KEYS.join('、')+'）：18:00 媽媽兩則、21:00 爸爸照那一年的表（2026「'+T7[1].mom[1].slice(3)+'」、2027「'+T7[2].mom[1].slice(3)+'」、2028 爸爸多「'+T7[3].dad[1].slice(3)+'」）',!bad.length,J(bad));
  const all=[].concat(...got.map(g=>g.b)), dup=all.filter((t,i)=>all.indexOf(t)!==i);
  check('7. 四年沒有一則一字不差',!dup.length,J(dup));
  { const M=D(MOON_KEYS[1]); fresh(M,17,{}); PHONE.join(H.G,'home','家人'); H.G.msgs.push({day:M,h:18,th:'g:home',from:'mom',name:'媽媽',text:T7[0].mom[0].slice(3),tag:'home_moon_'+M}); at(M,21.05); hr();
    check('7. 舊存檔（2026 已經用舊的照片收過媽媽那則）：媽媽不重發，爸爸照 2026 的表',byTag('home_moon_'+M).length===1&&J(byTag('home_moon_dad_'+M).map(m=>'爸爸：'+m.text))===J(T7[1].dad),J(famNew())); }
});
H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
