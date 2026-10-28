// AA_513（AA-C 2026-10-28，企劃線 a2e4bf196；HEROINE-LIFE-1028，使用者 2026-10-28 01:2x「可攻略女主角 感覺都沒有自己的生活」，USER_WANTS X122★）——不需要瀏覽器。
//   第 1 節：阿凱說子晴的四句（AA_505、AA_507、AA_508、AA_509 各 4-4，原本是閒聊、那幾段時間 3D 裡沒有他）改成他的私訊——
//     1-1、1-2、1-4：src/data/heard_lines.js phone＋src/heard3d.js（COND.kaiZq）；1-3：src/y34b3d.js S.zqKaiPhone 兩組照片後面（S.KAI_ROW、S.kaiRowFix）。
//   第 2 節：以安和媽媽在公館窗邊的路過字幕——src/data/heard_lines.js pass＋src/heard3d.js S.pass（STORY.TICKS；店門口 S.GG_DOORS）。
//   0  對稿（git show a2e4bf196，兩個方向，一字不差）、白名單、heard_lines.js 開頭「沒做」改「改私訊，AA_513 第 1 節」、隔天的私訊（an_mom、an_mom2）照舊不看有沒有看到
//   1  1-1、1-2、1-4：那一天 23:20 送到 p:kai（三則、阿凱、不用回），23:20 以前沒有；不認識子晴／沒有阿凱的聯絡方式／經濟系不送；晚三天以上不補；
//      美國路線人在美國照當地時間（1-4：臺灣 23:20＝當地 10:20）；接在 STORY.PHONE_RULES
//   2  1-3：5/20 16:30「不了。」的照片、回了「去。」卻沒到的三則，照片後面多「所以我坐第一排」「她叫我不要坐第一排」；有到場的（去了、或回「不了。」卻從子晴那邊去了）沒有；
//      日本路線沒有（當晚電話＋製作名單那一則不加）；舊存檔 ZQ_Q12 cat 的照片照舊是貓（S.kaiPhotoFix 不受影響）；佇列裡舊版本排好、沒有這兩則的補上一次
//   3  窗邊字幕：大一上第 10 週週五 19:00 走到公館店門口出一次（GM.caption('',句子,6000)）、同一學期第二次不出、5 m 外不出（兩間店中間、人行道）、
//      時段外（17:59、21:00）不出、別天不出、不認識以安不出、不在公館不出、對話進行中／劇情中不出、經濟系不出；大一下兩版的選法（大一上看過＝第二句，沒看過＝第一句）；
//      AN_MOM_SEEN（學期 → 那一天；舊存檔沒有、不是物件都從那時起）；接在 STORY.TICKS、回傳 false；圈子的字幕（HCIRCLE._capBusy）在出就等、出這一句的時候圈子也等
//   4  店門口的清單（heard3d.js S.GG_DOORS）和 src/zones3d.js 公館店面街（shops、FZ、x 起點、前 8 間的 1.2 m、ix、互動點 z）重算一致；麵店、輪轉單車的互動點、y34b3d.js NOODLE_DOOR 對得上
// 修改前（開發分支 44e8ff8b7：src/data/heard_lines.js、src/heard3d.js、src/y34b3d.js、docs/handoff/story_import_allow.json 換回 44e8ff8b7 實際跑過）：FAILED 19——
//   第 0 段 5 項（遊戲裡沒有 AA_513、兩個方向 0 句、HEARD_LINES.src、白名單、「沒做」還寫先空著）、第 1 段 7 項（三組私訊、條件、晚三天、PHONE_RULES、美國路線）、
//   第 2 段 5 項（「不了。」、「去。」卻沒到、從子晴那邊到場、舊存檔貓、舊版本排好的）、第 3、4 段各 1 項（沒有 HEARD.pass、HEARD.GG_DOORS 就停）；
//   當時就過的 5 項是現狀的保護（載得到、稿四塊、隔天的私訊、去了沒有照片、日本路線）。修改後 ALL PASS（34 項）。
//   第 3 段「那兩個週五以安的作息」：只把 src/data/characters.js 換回改之前（大一下沒有「和媽媽吃晚餐」）實際跑 FAIL 1（大一下 19:00、20:45 在校園 wander），改完 PASS。用法：node tests/aa513_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const SHA='a2e4bf196', SPEC='docs/story_planning/AA_513_女主角生活稿對照_阿凱四句改私訊_以安窗邊旁白.md';
const show=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<24}); }catch(e){ return ''; } };
const DOC=show(SHA,SPEC);
const loadG=(f,names)=>{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); for(const n of names) s=s.replace(new RegExp('^const '+n+'\\s*=','m'),'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); };
const errs=[]; const nT0=STORY.TICKS.length; let nT1=nT0;
for(const [f,n] of [['src/data/heard_lines.js',['HEARD_LINES']],['src/heard3d.js',['HEARD']],['src/y34b3d.js',['Y34B']]]){
  try{ loadG(f,n); }catch(e){ errs.push(f+'：'+(e&&e.message||e)); } if(f==='src/heard3d.js') nT1=STORY.TICKS.length; }
const HL=()=>typeof HEARD_LINES!=='undefined'?HEARD_LINES:{talk:[],kai203:[],noodle:{},phone:[]};
const HAS=()=>typeof HEARD!=='undefined';
const sec=async(name,fn)=>{ try{ await fn(); }catch(e){ check(name+'（例外）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' | ').slice(0,240)); } };
const DK=k=>PG.DK(k);
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=wdOf(d); };
const fresh=(d,h,flags,zone)=>{ const G=H.fresh(CALENDAR.dateOf(d).key,h,zone||'dorm',flags); if(!G.contacts) G.contacts={}; if(!Array.isArray(G.outings)) G.outings=[]; return G; };
const meet=(...ids)=>{ for(const id of ids) H.rel(id,45,30,10); };
const key=d=>CALENDAR.dateOf(d).key;

/* ---------- 稿：第 1 節四塊（標題寫哪一份的 4-4、哪一天、星期、幾點；「> 阿凱：…」那幾行）、第 2 節兩句 ---------- */
const K513={}; { let cur=null; for(const l of DOC.split('\n')){ let m; if((m=/^### (1-\d)\s+[^（]*（`(AA_5\d\d)` 4-4）：(\d{4}-\d\d-\d\d)（(.)）(\d\d:\d\d)?/.exec(l))){ cur=K513[m[1]]={ref:m[2],date:m[3],wd:m[4],hm:m[5]||null,lines:[]}; continue; }
  if(/^(### |## |---)/.test(l)){ cur=null; continue; } let q; if(cur&&(q=/^> 阿凱：(.+)$/.exec(l))) cur.lines.push(q[1].trim()); } }
const PASS={}; { let on=false, term=null; for(const l of DOC.split('\n')){ if(/^## 2\./.test(l)){ on=true; continue; } if(/^(## |---)/.test(l)){ on=false; continue; } if(!on) continue; let m;
  if((m=/^\s*- 大一(上|下)：\s*$/.exec(l))){ term=m[1]; continue; } if(term&&(m=/^\s*> (（.+）)\s*$/.exec(l))){ PASS[term]=m[1]; term=null; } } }
const QUOTES=DOC.split('\n').map(l=>{ let m; if((m=/^\s*> 阿凱：(.+)$/.exec(l))) return m[1].trim(); if((m=/^\s*> (（.+）)\s*$/.exec(l))) return m[1]; return null; }).filter(Boolean);
const PH={'1-1':'h513_kai_lab','1-2':'h513_kai_blanket','1-4':'h513_kai_cat'};
const ROW=()=>typeof Y34B!=='undefined'&&Array.isArray(Y34B.KAI_ROW)?Y34B.KAI_ROW:[];
const passE=()=>(HL().pass||[]).find(e=>e.id==='h513_an_mom')||null;

(async()=>{
/* ---------- 0 對稿、白名單、「沒做」、隔天的私訊 ---------- */
await sec('0',async()=>{
  check('0. 載得到（heard_lines.js、heard3d.js、y34b3d.js）；稿 a2e4bf196 讀得到',!errs.length&&HAS()&&typeof Y34B!=='undefined'&&DOC.length>1000,J(errs));
  const dk=Object.keys(K513).map(k=>[k,K513[k].ref,K513[k].date,K513[k].wd,K513[k].hm,K513[k].lines.length]);
  const wdOk=Object.values(K513).every(b=>'日一二三四五六日'[CALENDAR.dateOf(DK(b.date)).wd]===b.wd);
  check('0. 稿第 1 節四塊：1-1 AA_505 2026-11-27（五）23:20 三則、1-2 AA_507 2027-10-27（三）23:20 三則、1-3 AA_508 2028-05-20（六）兩則、1-4 AA_509 2028-12-15（五）23:20 三則；星期對得上；第 2 節大一上、大一下兩句',
    J(dk)===J([['1-1','AA_505','2026-11-27','五','23:20',3],['1-2','AA_507','2027-10-27','三','23:20',3],['1-3','AA_508','2028-05-20','六',null,2],['1-4','AA_509','2028-12-15','五','23:20',3]])&&wdOk&&!!PASS['上']&&!!PASS['下'],J({dk,PASS}));
  /* 遊戲 → 稿 */
  const bad=[];
  for(const id of ['1-1','1-2','1-4']){ const b=K513[id], e=HL().phone.find(x=>x.id===PH[id]);
    if(!b||!e||e.src!=='AA_513 '+id||e.at!==b.date+' '+b.hm||e.th!=='p:kai'||e.cond!=='kaiZq'||J(e.items)!==J(b.lines.map(s=>['kai','阿凱',s]))||e.items.some(it=>it.length!==3)) bad.push(id); }
  if(!K513['1-3']||J(ROW())!==J(K513['1-3'].lines)) bad.push('1-3');
  const pe=passE(); if(!pe||J(pe.t)!==J([PASS['上'],PASS['下']])||pe.src!=='AA_513 2'||pe.flag!=='AN_MOM_SEEN'||pe.about!=='heroine_01'||J(pe.terms)!==J(['Y1S1','Y1S2'])||pe.at!=='W10五'||pe.from!==18||pe.until!==21||pe.zone!=='gongguan'||pe.r!==5) bad.push('2');
  check('0. 遊戲裡的 AA_513 一字不差：1-1、1-2、1-4（heard_lines.js phone：那一天 23:20、p:kai、阿凱、條件 kaiZq）、1-3（y34b3d.js S.KAI_ROW）、第 2 節兩句（heard_lines.js pass：Y1S1、Y1S2 第 10 週週五 18～21 點、公館、5 m、認識以安、AN_MOM_SEEN）',!bad.length,J(bad));
  /* 稿 → 遊戲：稿上每一句引號裡的台詞、旁白（> 阿凱：…、> （…））都在遊戲裡；遊戲裡標 AA_513 的每一句都在稿裡 */
  const game=[]; for(const e of HL().phone) if(/^AA_513/.test(e.src||'')) for(const it of e.items) game.push(it[2]); for(const t of ROW()) game.push(t); for(const e of (HL().pass||[])) if(/^AA_513/.test(e.src||'')) for(const t of e.t) game.push(t);
  const miss=QUOTES.filter(t=>!game.includes(t)), extra=game.filter(t=>!QUOTES.includes(t));
  check('0. 兩個方向：稿上 '+QUOTES.length+' 句（阿凱 11、旁白 2）都在遊戲裡、遊戲裡 '+game.length+' 句都在稿裡',QUOTES.length===13&&game.length===13&&!miss.length&&!extra.length,J({miss,extra}));
  check('0. HEARD_LINES.src 記 AA_513＝a2e4bf196',HL().src&&HL().src.AA_513===SHA,J(HL().src&&HL().src.AA_513));
  let A=null; try{ A=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')); }catch(e){}
  const w=A&&A.files.filter(f=>f.path===SPEC);
  check('0. 劇情匯入白名單：AA_513 @ a2e4bf196、approved、approvedBy AA-C 定稿（D109；HEROINE-LIFE-1028，USER_WANTS X122★）、task HEROINE-LIFE-1028（只有一筆）',
    !!w&&w.length===1&&w[0].sha===SHA&&w[0].status==='approved'&&w[0].approvedBy==='AA-C 定稿（D109；HEROINE-LIFE-1028，USER_WANTS X122★）'&&w[0].task==='HEROINE-LIFE-1028'&&!!w[0].note,J(w));
  const hs=fs.readFileSync(path.join(H.ROOT,'src/data/heard_lines.js'),'utf8'), head=hs.slice(0,hs.indexOf('const HEARD_LINES'));
  check('0. heard_lines.js 開頭「沒做」：阿凱那四句（AA_505、AA_507、AA_508、AA_509 4-4）改「改私訊，AA_513 第 1 節」，不再寫「先空著」',
    head.includes('AA_505 4-4、AA_507 4-4、AA_508 4-4、AA_509 4-4 那四句：改私訊，AA_513 第 1 節')&&!head.includes('先空著'));
  const f1=fs.readFileSync(path.join(H.ROOT,'src/data/feed_y1s1.js'),'utf8'), f2=fs.readFileSync(path.join(H.ROOT,'src/data/feed_y1s2.js'),'utf8');
  check('0. 隔天的私訊照舊、不管有沒有看到：大一上 an_mom（W10六 10:12）、大一下 an_mom2（W10六 10:05）都在，沒有讀 AN_MOM_SEEN',
    f1.includes("{id:'an_mom',who:'heroine_01',t:'W10六 10:12'")&&f2.includes("{id:'an_mom2',who:'heroine_01',t:'W10六 10:05'")&&!/AN_MOM_SEEN/.test(f1+f2)); });

/* ---------- 1 阿凱的私訊 1-1、1-2、1-4 ---------- */
await sec('1',async()=>{ if(!HAS()){ check('1. HEARD',false,'沒有 HEARD'); return; }
  const run=(d,h)=>{ at(d,h); HEARD.phone(H.G); PHONE.tick(H.G); };
  const msgs=id=>(H.G.msgs||[]).filter(m=>m.tag==='heard_'+id);
  const T0=id=>{ const b=K513[id]; if(!b||!b.hm) return null; const [hh,mm]=b.hm.split(':'); return {d:DK(b.date),h:+hh+(+mm)/60,b}; };
  for(const id of ['1-1','1-2','1-4']){ const t=T0(id); if(!t){ check('1. '+id,false,'稿沒有這一塊'); continue; }
    fresh(t.d,t.h-0.5,{}); meet('heroine_04'); run(t.d,t.h-0.02); const n0=msgs(PH[id]).length; run(t.d,t.h+0.02); const L=msgs(PH[id]);
    check('1. '+id+'（'+t.b.ref+' 4-4）：'+t.b.date+' '+t.b.hm+' 送到阿凱的私訊（p:kai、阿凱）三則「'+t.b.lines.join('／')+'」；'+t.b.hm+' 以前沒有；不用回',
      n0===0&&J(L.map(m=>[m.th,m.from,m.name,m.text]))===J(t.b.lines.map(s=>['p:kai','kai','阿凱',s]))&&L.every(m=>m.day===t.d&&Math.abs(m.h-t.h)<0.05&&!m.ask)&&PHONE.title(H.G,'p:kai')!=='p:kai',J(L.map(m=>[m.day,m.h,m.text]))); }
  const t=T0('1-1');
  if(t){ /* 條件 */
    fresh(t.d,t.h-0.5,{}); run(t.d,t.h+0.02); const a=msgs(PH['1-1']).length, ar=HEARD.rec(H.G).ph[PH['1-1']];
    const c0=INVITE_DATA.contacts0; INVITE_DATA.contacts0=c0.filter(x=>x!=='kai');   /* 開場就有阿凱（INVITE_DATA.contacts0）；這裡暫時拿掉，驗「手機裡沒有阿凱」*/
    let b=0, br=null; try{ fresh(t.d,t.h-0.5,{}); meet('heroine_04'); run(t.d,t.h+0.02); b=msgs(PH['1-1']).length; br=HEARD.rec(H.G).ph[PH['1-1']]; } finally { INVITE_DATA.contacts0=c0; }
    fresh(t.d,t.h-0.5,{}); meet('heroine_04'); H.G.stage='econ'; run(t.d,t.h+0.02); const c=msgs(PH['1-1']).length, cr=HEARD.rec(H.G).ph[PH['1-1']];
    check('1. 不認識子晴（x:kaiZq）、手機裡沒有阿凱（x:kaiZq）、經濟系（不算、不記）：都不送',a===0&&ar==='x:kaiZq'&&b===0&&br==='x:kaiZq'&&c===0&&cr==null,J({ar,br,cr}));
    fresh(t.d+4,12,{}); meet('heroine_04'); run(t.d+4,12); check('1. 晚三天以上（存檔停在以前、跳過去）：不補（x:late）',!msgs(PH['1-1']).length&&HEARD.rec(H.G).ph[PH['1-1']]==='x:late',J(HEARD.rec(H.G).ph[PH['1-1']]));
    fresh(t.d,t.h-0.5,{}); meet('heroine_04'); at(t.d,t.h+0.02); STORY.phoneRules(GM); PHONE.tick(H.G); check('1. 接在 STORY.PHONE_RULES（每次手機規則都跑）',msgs(PH['1-1']).length===3); }
  const u=T0('1-4');
  if(u){ fresh(u.d,9,{EXCHANGE_ROUTE:'US'}); meet('heroine_04'); const tz=STORY.tzOffset(H.G,u.d); run(u.d,10.3); const u0=msgs(PH['1-4']).length; run(u.d,10.36); const L=msgs(PH['1-4']);
    check('1. 1-4 美國路線人在美國（12/23 以前）：臺灣 12/15 23:20＝當地 10:20 收到（10:18 還沒有、10:21 有三則）',tz===-13&&u0===0&&L.length===3&&L.every(m=>m.day===u.d&&Math.abs(m.h-(10+20/60))<0.05),J({tz,u0,L:L.map(m=>[key(m.day),m.h])})); } });

/* ---------- 2 1-3：5/20 發表會那兩組照片後面 ---------- */
await sec('2',async()=>{ if(typeof Y34B==='undefined'||!Y34B.zqKaiPhone){ check('2. Y34B',false,'沒有 Y34B'); return; }
  const CAT='📷（投影幕上一隻在找插座的貓）', NINE='📷（投影幕上，一個小孩坐在玄關，腿上放著兩支搖桿。標題：《九點以後》）', R2=K513['1-3']?K513['1-3'].lines:['?','?'];
  const yfresh=(k,h,flags,route)=>{ const G=H.fresh(k,h,'dorm',Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(k,h); G.zone='dorm'; GM.npc={}; return G; };
  const yphone=()=>{ Y34B.phone(H.G); PHONE.tick(H.G); };
  const thK=()=>(H.G.msgs||[]).filter(m=>m.th==='p:kai').map(m=>m.text);
  const setup=(ans,flags,route)=>{ yfresh('2028-05-18',21,flags,route); H.FAMILIAR('kai'); H.rel('heroine_04',10,0,0); yphone(); if(ans!=null) PHONE.answer(H.G,'y3_zq_kai',ans); yphone(); };
  /* 「不了。」*/
  setup(1); H.at('2028-05-20',16.4); yphone(); const b0=thK(); H.at('2028-05-20',16.5); yphone(); const L1=thK(), m1=(H.G.msgs||[]).filter(m=>m.th==='p:kai').slice(-3);
  check('2. 「不了。」→ 5/20 16:30 阿凱的照片，後面「'+R2.join('」「')+'」（同一個時間）；16:30 以前沒有',J(L1.slice(-3))===J([NINE].concat(R2))&&!b0.some(t=>R2.includes(t))&&m1.every(m=>m.day===DK('2028-05-20')&&Math.abs(m.h-16.5)<0.05&&m.from==='kai'),J(L1));
  /* 回了「去。」卻沒到 */
  setup(0); H.at('2028-05-20',15); OUT.tick(GM); yphone(); H.at('2028-05-20',16.5); yphone(); const L2=thK();
  check('2. 回了「去。」卻沒到：16:30「你說要來的。」「……我幫你拍了。」＋照片＋那兩則',J(L2.slice(-5))===J(['你說要來的。','……我幫你拍了。',NINE].concat(R2)),J(L2));
  /* 有到場的：回了「去。」而且去了（真的演發表會）*/
  setup(0); H.at('2028-05-20',13.6); { const q=OUT.get(H.G,'y3_zq_q12_kai'); H.said=[]; H.picks=[]; if(q) await OUT.go(GM,q); } const came=H.G.flags.ZQ_Q12_SEEN; H.at('2028-05-20',16.6); yphone(); const L3=thK();
  check('2. 回了「去。」而且去了（ZQ_Q12_SEEN came）：16:30 沒有照片、沒有那兩則',came==='came'&&!L3.some(t=>R2.includes(t)||t===NINE),J({came,L3}));
  /* 有到場的：回「不了。」、後來從子晴那邊去了——照片那一組早就排好，到場了那兩則拿掉 */
  setup(1); H.at('2028-05-20',16); yphone(); const qd=PHONE.rec(H.G).q.find(q=>q.tag==='y3_zq_kai_photo'), had=!!qd&&qd.items.some(it=>it.text===R2[0]); H.G.flags.ZQ_Q12_SEEN='came'; H.at('2028-05-20',16.5); yphone(); const L4=thK();
  check('2. 回「不了。」卻從子晴那邊到場了（[前置] ZQ_Q12_SEEN came）：排好的那一組送出前拿掉那兩則（照片照舊）',had&&L4.slice(-1)[0]===NINE&&!L4.some(t=>R2.includes(t)),J({had,L4}));
  /* 日本路線 */
  setup(null,{},'JP'); const j0=thK().length; yfresh('2028-05-20',21,{ZQ_Q12_SEEN:'online'},'JP'); H.FAMILIAR('kai'); H.FAMILIAR('heroine_04'); H.at('2028-05-20',22.1); yphone(); const L5=thK();
  check('2. 日本路線：沒有阿凱 5/18 那則（不排 16:30）；當晚電話以後的製作名單那一則後面不加',j0===0&&L5.includes('子晴的製作名單。')&&!L5.some(t=>R2.includes(t)),J({j0,L5}));
  /* 舊存檔 ZQ_Q12 cat：照片照舊是貓 */
  setup(1,{ZQ_Q12:'cat'}); H.at('2028-05-20',16.5); yphone(); const L6=thK();
  check('2. 舊存檔演過貓那一版（ZQ_Q12 cat）：照片照舊是貓（S.kaiPhotoFix 不受影響），後面一樣兩則',J(L6.slice(-3))===J([CAT].concat(R2)),J(L6));
  /* 佇列裡舊版本排好、沒有這兩則的：補上一次（跑很多次手機規則也只一次）；貓換成《九點以後》照舊 */
  setup(1); const Q=PHONE.rec(H.G).q; Q.splice(0,Q.length,...Q.filter(q=>q.tag!=='y3_zq_kai_photo')); PHONE.at(H.G,DK('2028-05-20'),16.5,[{th:'p:kai',from:'kai',text:CAT}],'y3_zq_kai_photo');
  for(const h of [12,15,18]){ H.at('2028-05-19',h); yphone(); } const q7=PHONE.rec(H.G).q.find(q=>q.tag==='y3_zq_kai_photo'); H.at('2028-05-20',16.5); yphone(); const L7=thK();
  check('2. 舊版本排好的那一組（只有照片）：送出前補上那兩則，只補一次；照片換成《九點以後》（AA_363 R1 照舊）',!!q7&&q7.items.length===3&&J(L7.slice(-3))===J([NINE].concat(R2))&&L7.filter(t=>t===R2[0]).length===1&&!L7.includes(CAT),J({q7:q7&&q7.items.map(i=>i.text),L7})); });

/* ---------- 3 窗邊字幕 ---------- */
await sec('3',async()=>{ if(!HAS()||!HEARD.pass){ check('3. 窗邊字幕',false,'沒有 HEARD.pass'); return; }
  const caps=[], timers=[]; const cap0=GM.caption; GM.caption=(w,t,ms)=>{ caps.push([w,t,ms]); }; HEARD.later=(fn,ms)=>{ timers.push([fn,ms]); };
  const pe=passE(), A=pe?pe.t[0]:'?', B=pe?pe.t[1]:'?';
  const W10F=t=>CALENDAR.termDays(t).from+9*7+4;   /* 第 10 週週五 */
  const stand=(x,z)=>{ E.player.obj.position.x=x; E.player.obj.position.z=z; };
  const wf=(term,h,flags,know)=>{ fresh(W10F(term),h,flags,'gongguan'); if(know!==false) meet('heroine_01'); caps.length=0; timers.length=0; E.player.busy=false; GM.D.active=false; stand(-63,21); };
  const tick=()=>{ const f=STORY.TICKS[nT0]; return nT1===nT0+1&&typeof f==='function'?f(GM,0.5):null; };
  const seen=()=>H.G.flags.AN_MOM_SEEN;
  const d1=W10F('Y1S1'), d2=W10F('Y1S2');
  check('3. 大一上第 10 週週五＝2025-11-07、大一下＝2026-05-01（星期五）',key(d1)==='2025-11-07'&&key(d2)==='2026-05-01'&&CALENDAR.dateOf(d1).wd===5&&CALENDAR.dateOf(d2).wd===5);
  /* 那段時間以安不在 3D 裡（字幕說她在店裡）：characters.js「和媽媽吃晚餐」那一筆（以安新 4）大一下也是——原本大一下 18:00～20:30 她在校園 wander */
  const whereAn=(d,h)=>{ fresh(d,h,{},'gongguan'); const e=STORY.schedEnt(CHARACTERS.heroine_01,H.G); return e?[e.zone,e.act,e.away||null]:null; };
  const wa=[whereAn(d1,19),whereAn(d2,19),whereAn(d2,20.75),whereAn(d2+7,19),whereAn(d2-7,19)];
  check('3. 那兩個週五 18:00～21:30 以安的作息是「和媽媽吃晚餐」（不在 3D 裡；大一下原本在校園 wander）；大一下第 11、9 週週五照舊在校園',
    J(wa)===J([[null,'out','和媽媽吃晚餐'],[null,'out','和媽媽吃晚餐'],[null,'out','和媽媽吃晚餐'],['campus','wander',null],['campus','wander',null]]),J(wa));
  wf('Y1S1',19); const r1=tick(); const c1=caps.slice(), s1=J(seen());
  stand(9.9,21); const r2=tick(); const c2=caps.length;
  check('3. 大一上第 10 週週五 19:00 走到公館店門口（麵店 −63,21）：畫面下方字幕一次（GM.caption 旁白、6 秒）、記 AN_MOM_SEEN {Y1S1:那一天}；接在 STORY.TICKS、回傳 false（不擋後面的）',
    nT1===nT0+1&&r1===false&&J(c1)===J([['',A,6000]])&&s1===J({Y1S1:d1})&&HEARD.PASS_MS===6000,J({nT0,nT1,r1,c1,s1}));
  check('3. 同一學期再走到別間店門口（咖啡・輕食 9.9,21）：不再出',r2===false&&c2===1,J({c2}));
  /* 店門口 5 m */
  const near=(x,z)=>{ wf('Y1S1',19); stand(x,z); HEARD.pass(GM); return caps.length; };
  const n=[near(-63,16.1),near(-63,15.9),near(-35.5,21),near(0,8),near(73.1,25.9),near(-0.3,21)];
  check('3. 5 m 內才出：麵店門口往人行道 4.9 m 有、5.1 m 沒有；兩間店中間（−35.5，離最近的門口 6.1 m）沒有；人行道（0,8）沒有；最東一間 4.9 m 有；輪轉單車門口有',J(n)===J([1,0,0,0,1,1]),J(n));
  /* 時段、別天 */
  const when=(d,h)=>{ fresh(d,h,{},'gongguan'); meet('heroine_01'); caps.length=0; stand(-63,21); HEARD.pass(GM); return caps.length; };
  const tm=[when(d1,17.99),when(d1,18),when(d1,20.99),when(d1,21),when(d1-1,19),when(d1+7,19),when(d1-7,19),when(d1+1,19)];
  check('3. 時段：18:00～21:00（17:59 沒有、18:00 有、20:59 有、21:00 沒有）；別天（第 10 週週四、第 11 週週五、第 9 週週五、週六）沒有',J(tm)===J([0,1,1,0,0,0,0,0]),J(tm));
  /* 條件 */
  const ks=[]; const kn=()=>{ ks.push(seen()==null); return caps.length; };
  wf('Y1S1',19,{},false); HEARD.pass(GM); const k0=kn();
  wf('Y1S1',19); H.G.zone='noodle'; HEARD.pass(GM); const k1=kn();
  wf('Y1S1',19); GM.D.active=true; tick(); const k2=kn(); GM.D.active=false;
  wf('Y1S1',19); E.player.busy=true; tick(); const k3=kn(); E.player.busy=false;
  wf('Y1S1',19); H.G.stage='econ'; HEARD.pass(GM); const k4=kn();
  wf('Y1S1',19); HEARD.pass(GM); const k5=caps.length;
  check('3. 不認識以安、人在麵店裡（不在公館）、對話進行中、劇情中（player.busy）、經濟系：都不出、也不記（AN_MOM_SEEN 沒有）；條件都對＝出',k0===0&&k1===0&&k2===0&&k3===0&&k4===0&&k5===1&&ks.every(Boolean),J({k:[k0,k1,k2,k3,k4,k5],ks}));
  /* 大一下兩版 */
  wf('Y1S2',19,{AN_MOM_SEEN:{Y1S1:d1}}); HEARD.pass(GM); const b1=caps.slice(), sb=J(seen()); HEARD.pass(GM); const b1n=caps.length;
  wf('Y1S2',19); HEARD.pass(GM); const b2=caps.slice(), sa=J(seen());
  check('3. 大一下第 10 週週五：大一上看過＝第二句「'+B.slice(0,16)+'……」；沒看過＝大一上那句；記 {Y1S2:那一天}；同一學期第二次不出',
    J(b1)===J([['',B,6000]])&&sb===J({Y1S1:d1,Y1S2:d2})&&b1n===1&&J(b2)===J([['',A,6000]])&&sa===J({Y1S2:d2}),J({b1,b2,sb,sa}));
  wf('Y1S1',19,{AN_MOM_SEEN:true}); HEARD.pass(GM); const o1=caps.slice(), so=J(seen());
  check('3. 舊存檔（沒有 AN_MOM_SEEN、或不是物件）：從那時起（出大一上那句、記成物件）',J(o1)===J([['',A,6000]])&&so===J({Y1S1:d1}),J({o1,so}));
  /* 和圈子的字幕不互相蓋掉 */
  const HC={tick(){},_capBusy:true}; globalThis.HCIRCLE=HC;
  try{ wf('Y1S1',19); HEARD.pass(GM); const h0=caps.length, hs0=seen()==null; HC._capBusy=false; HEARD.pass(GM); const h1=caps.length, busy=HC._capBusy, tm1=timers.map(x=>x[1]); for(const [fn] of timers) fn(); const after=HC._capBusy;
    check('3. 圈子的字幕（HCIRCLE._capBusy）正在出：先不出、也不記；出完了才出；出這一句的那 6 秒圈子等（_capBusy＝true，時間到放開）',h0===0&&hs0&&h1===1&&busy===true&&J(tm1)===J([6000])&&after===false,J({h0,hs0,h1,busy,tm1,after})); }
  finally{ delete globalThis.HCIRCLE; GM.caption=cap0; } });

/* ---------- 4 店門口的清單 vs zones3d.js ---------- */
await sec('4',async()=>{ if(!HAS()||!HEARD.GG_DOORS){ check('4. 店門口',false,'沒有 HEARD.GG_DOORS'); return; }
  const zs=fs.readFileSync(path.join(H.ROOT,'src/zones3d.js'),'utf8'), i0=zs.indexOf('const shops=['), seg=i0<0?'':zs.slice(i0,i0+12000);
  const shops=(()=>{ const m=/const shops=(\[[\s\S]*?\]);/.exec(seg); return m?vm.runInNewContext(m[1]):null; })();
  const FZ=+((/const FZ=(\d+(?:\.\d+)?), GH=/.exec(seg)||[])[1]), x0=+((/let x=(-?\d+(?:\.\d+)?); shops\.forEach/.exec(seg)||[])[1]);
  const gm=/X1=x\+s\.w\+\(i<(\d+)&&!last\?([\d.]+):0\)/.exec(seg), ixOk=/const ix=x\+s\.w\/2;/.test(seg), dz=+((/E\.interactables\.push\(\{x:ix,z:FZ\+(\d+(?:\.\d+)?)/.exec(seg)||[])[1]);
  const doors=[]; if(shops&&gm){ let x=x0; shops.forEach((s,i)=>{ const last=i===shops.length-1; doors.push(+(x+s.w/2).toFixed(3)); x=x+s.w+(i<+gm[1]&&!last?+gm[2]:0); }); }
  const D=HEARD.GG_DOORS, mine=D.x.map(v=>+v.toFixed(3));
  check('4. heard3d.js S.GG_DOORS＝zones3d.js 公館店面街重算（shops '+(shops?shops.length:0)+' 間、x 從 '+x0+' 起、前 '+(gm?gm[1]:'?')+' 間多 '+(gm?gm[2]:'?')+' m、門口 ix＝x0＋w/2、z＝FZ＋'+dz+'＝'+(FZ+dz)+'）',
    !!shops&&shops.length===15&&ixOk&&J(mine)===J(doors)&&D.z===FZ+dz&&FZ===19&&dz===2,J({doors,mine,FZ,dz,z:D.z}));
  const sx=+((/const sx=(-?[\d.]+);/.exec(zs)||[])[1]), bk=+((/\{x:sx-([\d.]+),z:FZ\+2,radius:2\.2,label:'找車行老闆'/.exec(zs)||[])[1]);
  const ib=shops?shops.findIndex(s=>s.type==='bike'):-1, inn=shops?shops.findIndex(s=>s.type==='noodle'):-1;
  const y34=fs.readFileSync(path.join(H.ROOT,'src/y34b3d.js'),'utf8'), nd=/const NOODLE_DOOR=\{x:(-?[\d.]+),z:(\d+)\}/.exec(y34);
  check('4. 對得上：輪轉單車「找車行老闆」互動點（sx−0.6＝'+(sx-bk)+'）、麵店（'+(inn>=0?doors[inn]:'?')+'）＝y34b3d.js NOODLE_DOOR',ib>=0&&Math.abs(doors[ib]-(sx-bk))<1e-9&&inn===0&&!!nd&&+nd[1]===doors[0]&&+nd[2]===D.z,J({bike:[doors[ib],sx-bk],nd:nd&&nd.slice(1)})); });

H.done();
})();
