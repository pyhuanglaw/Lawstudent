// 總圖借書（AA_399 3-2＋AA_407，企劃線 e81aa74c；任務 LIB-LOAN-1023）——不需要瀏覽器。
//   0  逐字對稿（書名、知道的那一句、館員、書桌旁白、還書以後的一句、通知）
//   1  四本「知道」：L1 周教授大一上民總第 4 週課堂（CLS.IN_CLASS）；L2 公法讀書會第一次散會；L3 學姊「找判決」最後一句；L4 Z3-L2 那天 21:00 芷若私訊
//   2  服務台：沒知道的書＝照舊只是看；知道＝借；一次最多兩本；借期四週
//   3  到期前三天 09:00 通知；逾期以後第一次到服務台館員一句（只一次）；不扣錢
//   4  還書：L1 館員一句；L2 下一次讀書會以安一句；L3 下一次在 Café 學姊一句＋兩個選項（一次）；L4 那天 21:00 芷若私訊，她在英國不傳
//   5  房間書桌多一本（看＝旁白）；舊存檔沒有 G.loans＝沒借過、沒有通知
// 修改前（開發分支 0ae8138e4）：沒有 src/loans3d.js（全部 FAIL）。用法：node tests/aa407_loans_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
L3('src/data/sis_b8_events.js');
const ok=L3('src/loans3d.js');
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,2).join(' / ')); } };
const X=()=>typeof LOANS!=='undefined'?LOANS:null;
const tick=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const at=(d,h)=>{ H.G.day=d; H.G.hour=h; };
(async()=>{
let doc=''; try{ doc=cp.execSync('git show e81aa74c:"docs/story_planning/AA_407_總圖借書_第一批書單.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
await sec(0,()=>{ const src=fs.readFileSync(path.join(H.ROOT,'src/loans3d.js'),'utf8'), all=[];
  for(const m of src.matchAll(/text:'([^']+)'/g)) all.push(m[1]); for(const m of src.matchAll(/zrDm\('([^']+)'\)/g)) all.push(m[1]); for(const m of src.matchAll(/(?:title|look|ed):'([^']+)'/g)) all.push(m[1]); all.push(X().L1_LINE,X().L3_LINE);
  const notIn=[...new Set(all)].filter(t=>doc.indexOf(t.replace(/^「|」$/g,''))<0&&!/^公法讀書會$/.test(t));
  check('0. 載入 src/loans3d.js；書名、台詞、旁白都在稿裡（一字不差）',ok&&!!doc&&!notIn.length,J(notIn));
  check('0. 通知「總圖：《書名》三天後到期。」照稿',ok&&doc.includes('總圖：《書名》三天後到期。')&&/'總圖：'\+S\.name\(l\.book\)\+'三天後到期。'/.test(src)); });
/* ---- 1 ---- */
await sec(1,async()=>{ const d4=STORY.termDay('Y1S1',4,4); H.fresh(keyOf(d4),14,'classroom',{}); H.said=[];
  check('1. CLS.IN_CLASS 掛了借書（L1）',CLS.IN_CLASS.some(f=>/inClass/.test(String(f))));
  const r=await X().inClass(GM,{c:{id:'civ_general'},week:4},{name:'周教授'},{});
  check('1. L1：大一上民總第 4 週課堂，周教授「這週的案例不用買書。總圖有一本《民法案例演習：總則篇》，看第二章就好。」→ 知道 L1',r&&H.has(X().L1_LINE)&&X().known(H.G,'L1'),J(H.said));
  H.fresh(keyOf(STORY.termDay('Y1S1',5,4)),14,'classroom',{}); check('1. L1：第 5 週＝沒有',!(await X().inClass(GM,{c:{id:'civ_general'},week:5},{name:'周教授'},{}))&&!X().known(H.G,'L1'));
  H.fresh(keyOf(d4),14,'classroom',{}); check('1. L1：別的課＝沒有',!(await X().inClass(GM,{c:{id:'crimpro'},week:4},null,{})));
  const e2=STORY_EVENTS.find(e=>e.id==='ev_loan_l2_know'), w10=STORY.termDay('Y1S1',10,4); H.fresh(keyOf(w10),21.5,'wancai',{}); H.G.events.done.ev_public_law_group=1; H.G.events.last.ev_public_law_group=w10;
  const a=EVENTS.check(e2); H.G.events.last.ev_public_law_group=w10-7; const b=EVENTS.check(e2);
  check('1. L2：公法讀書會第一次那天散會（afterActivity public_law_group）以安一句＝知道 L2；不是第一次那天＝沒有',!!e2&&e2.afterActivity==='public_law_group'&&a&&!b&&e2.dialogue.some(l=>l.set&&l.set.LOAN_KNOW_L2));
  const e3=STORY_EVENTS.find(e=>e.id==='ev_sis_db_taught'); const n=e3?e3.dialogue.length:0;
  check('1. L3：學姊「找判決」最後多「總圖有一本《判決怎麼讀》。借舊版，新版把第三章刪了。」＋知道 L3',!!e3&&e3.dialogue[n-2].text===X().L3_LINE&&e3.dialogue[n-2].speaker==='heroine_05'&&e3.dialogue[n-1].set.LOAN_KNOW_L3===true);
  const dz=D('2026-10-20'); H.fresh(keyOf(dz),15,'cafe',{}); SOCIAL.remember('heroine_02','ZR3_SUBTITLE',''); H.G.contacts=Object.assign(H.G.contacts||{},{heroine_02:dz-30});
  at(dz,20.9); tick(); const m0=H.msgs('p:heroine_02').filter(t=>/十四個字/.test(t)).length; at(dz,21.05); tick();
  check('1. L4：Z3-L2 那天 21:00 芷若私訊「總圖有一本講字幕的書。《一行十四個字》。」「……我大一借了三次。」→ 知道 L4；21:00 以前沒有',!m0&&H.msgs('p:heroine_02').includes('總圖有一本講字幕的書。《一行十四個字》。')&&H.msgs('p:heroine_02').includes('……我大一借了三次。')&&X().known(H.G,'L4'),J(H.msgs('p:heroine_02')));
  H.fresh(keyOf(dz),15,'cafe',{}); SOCIAL.remember('heroine_02','ZR3_SUBTITLE',''); H.G.contacts={}; at(dz,21.05); tick(); check('1. L4：沒有她的聯絡方式＝沒有',!X().known(H.G,'L4')); });
/* ---- 2～5 ---- */
await sec(2,async()=>{ const d0=STORY.termDay('Y1S1',4,1); H.fresh(keyOf(d0),10,'library_hall',{});
  check('2. 什麼書都不知道：服務台照舊只是「看」（不接手）',!(await X().interact({label:'服務台'},GM)));
  H.G.flags.LOAN_KNOW_L1=d0; H.G.flags.LOAN_KNOW_L2=d0; H.G.flags.LOAN_KNOW_L3=d0; H.opts=[]; H.picks=['借《民法案例演習']; await X().interact({label:'服務台'},GM);
  check('2. 知道三本：服務台「借《民法案例演習：總則篇》」「借《憲法解釋的故事》」「借《判決怎麼讀》（舊版）」＋離開；借了 L1',J(H.opts[0])===J(['借《民法案例演習：總則篇》','借《憲法解釋的故事》','借《判決怎麼讀》（舊版）','（離開）'])&&H.G.loans.length===1&&H.G.loans[0].book==='L1',J(H.opts));
  H.picks=['借《憲法']; await X().interact({label:'服務台'},GM); H.opts=[]; H.picks=['借《判決']; await X().interact({label:'服務台'},GM);
  check('2. 一次最多兩本：第三本借不了',H.G.loans.length===2&&!X().out(H.G,'L3')&&H.opts[0].includes('還《民法案例演習：總則篇》'),J(H.G.loans));
  check('2. 別的區域的「服務台」不接手',!(await (async()=>{ H.G.zone='library'; const r=await X().interact({label:'服務台'},GM); H.G.zone='library_hall'; return r; })()));
  /* 3：通知、逾期 */
  const due=X().due(H.G.loans[0]); at(due-3,8.9); tick(); const n0=H.msgs('sys').filter(t=>/三天後到期/.test(t)).length; at(due-3,9.05); tick();
  check('3. 到期前三天 09:00 手機：「總圖：《民法案例演習：總則篇》三天後到期。」（借期四週）；09:00 以前沒有',due===d0+28&&!n0&&H.msgs('sys').includes('總圖：《民法案例演習：總則篇》三天後到期。')&&H.msgs('sys').includes('總圖：《憲法解釋的故事》三天後到期。'),J(H.msgs('sys').slice(-3)));
  at(due+2,10); const money=H.G.money; H.said=[]; H.picks=['（離開）']; await X().interact({label:'服務台'},GM); const s1=H.said.filter(s=>s.t==='這本逾期了喔。還了就好。').length; H.said=[]; H.picks=['（離開）']; await X().interact({label:'服務台'},GM);
  check('3. 逾期以後第一次到服務台：館員「這本逾期了喔。還了就好。」；第二次沒有；不扣錢（服務台不動錢）',s1===1&&!H.has('這本逾期了喔。還了就好。')&&H.G.money===money,J({s1,said:H.said,m:[money,H.G.money],loans:H.G.loans,day:H.G.day}));
  /* 5：房間 */
  const L=[]; X().room(H.G,L); check('5. 房間書桌多兩本：看＝那一句旁白',J(L)===J([['借來的《民法案例演習：總則篇》','（第二章的案例，旁邊有前一個人用鉛筆畫的箭頭。）'],['借來的《憲法解釋的故事》','（第六章的書頁被折過一個角。不是你折的。）']]));
  /* 4：還書 */
  H.said=[]; H.picks=['還《民法']; await X().interact({label:'服務台'},GM);
  check('4. 還 L1：館員「這本這學期很多人借。下一個已經在等了。」；G.loans 少一本、記還書那天',H.has('這本這學期很多人借。下一個已經在等了。')&&H.G.loans.length===1&&X().returned(H.G,'L1')===due+2);
  H.picks=['還《憲法']; await X().interact({label:'服務台'},GM); const e2b=STORY_EVENTS.find(e=>e.id==='ev_loan_l2_back'); const today=EVENTS.check(e2b); at(due+9,21.5); H.G.zone='wancai';
  check('4. 還 L2：下一次讀書會（afterActivity）以安「讀完了？……第六章那個案子，我想下次講。」；還書那天沒有',!!e2b&&!today&&EVENTS.check(e2b)&&e2b.dialogue[0].text==='讀完了？……第六章那個案子，我想下次講。');
  H.G.zone='library_hall'; H.picks=['借《判決']; await X().interact({label:'服務台'},GM); H.picks=['還《判決']; await X().interact({label:'服務台'},GM); const r3=H.G.day;
  H.G.zone='cafe'; H.said=[]; const p0=await X().preTalk(GM); at(r3+1,15); H.said=[]; H.picks=[1]; const p1=await X().preTalk(GM); const s3=H.said.map(s=>s.t); H.said=[]; const p2=await X().preTalk(GM);
  check('4. 還 L3：下一次在 Café 找學姊說話先「第三章讀了嗎。」→「還沒。」「那你借太早了。」；還書那天、第二次都沒有',!p0&&p1&&J(s3)===J(['第三章讀了嗎。','那你借太早了。'])&&!p2,J(s3));
  check('4. 學姊 preTalk 鏈接上（SISY23 有的話）',typeof SISY23==='undefined'||!!SISY23.preTalk._loans); });
await sec('4b',async()=>{ const d=D('2026-11-02'); H.fresh(keyOf(d),10,'library_hall',{LOAN_KNOW_L4:d}); H.G.contacts={heroine_02:d-60}; H.picks=['借《一行']; await X().interact({label:'服務台'},GM); at(d+5,10); H.picks=['還《一行']; await X().interact({label:'服務台'},GM);
  at(d+5,21.05); tick(); check('4. 還 L4：那天 21:00 芷若「你真的借了。……第八章是我最喜歡的。」',H.msgs('p:heroine_02').includes('你真的借了。……第八章是我最喜歡的。'));
  const u=D('2027-10-04'); H.fresh(keyOf(u),10,'library_hall',{LOAN_KNOW_L4:u}); H.G.contacts={heroine_02:u-400}; H.picks=['借《一行']; await X().interact({label:'服務台'},GM); H.picks=['還《一行']; await X().interact({label:'服務台'},GM); at(u,21.05); tick();
  check('4. 她在英國（2027-09～2028-02）還 L4：不傳',!H.msgs('p:heroine_02').includes('你真的借了。……第八章是我最喜歡的。')); });
await sec(5,()=>{ const d=D('2026-12-01'); H.fresh(keyOf(d),9.5,'dorm',{}); delete H.G.loans; tick(); const L=[]; X().room(H.G,L);
  check('5. 舊存檔沒有 G.loans：沒借過、沒有到期通知、房間沒有書',!H.msgs('sys').some(t=>/到期/.test(t))&&!L.length&&Array.isArray(H.G.loans)&&!H.G.loans.length); });
H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
