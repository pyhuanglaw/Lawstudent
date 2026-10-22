// 可昕交往中「祐廷在國外」那兩則（MSG_POOL 可昕 L 層 chat，BB_178 第 5 節；tags 美國路線／日本路線，variantNote「只在她那邊 23:30 以後」）——不需要瀏覽器。
//   AA_384 子代理 10-22 回報：msg3d.js 的 S.tok 認不得「美國路線」「日本路線」、S.sitOk 認不得「祐廷在國外」＝這兩則永遠選不到（朋友層 kxdrift3d.js 自己接了，交往中沒有）。
//   1 美國路線、人在美國、當地 11:36（她那邊 23:36）傳「在幹嘛」：她回「我這邊要睡了。」「你那邊應該才剛開始。」
//   2 日本路線、人在日本、當地 00:36（她那邊 23:36）：「我這邊十二點了。」「你那邊一點了，快去睡。」，當天回（不是隔天早上）
//   3 對照：美國當地 02:00（她那邊下午）、在臺灣 23:40、美國路線還沒出發 23:40、日本路線的人在美國那一則不用；交往前（R 層）也不用
//   4 S.tok：「美國路線」只在美國路線、人在美國；「日本路線」同理
// 修改前（開發分支 ddeb53a0）：第 1、2 項 FAIL。用法：node tests/msg_kx_abroad_unit.js
'use strict';
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check}=H;
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|PG_DATES|PGDATE|KXOD|KXDRIFT|MSG|MSG_POOL|MSG2_POOL|HV|HOMETOWN_LINES|JP|US_LIFE)$/;
const load=f=>{ if(!fs.existsSync(path.join(H.ROOT,f))) return false; let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); return true; };
global.CG_REGISTRY={};
/* index.html 的順序（同 tests/aa384_kx_friend_unit.js）＋時差：jp3d.js、us_life3d.js 包住 MSG.replyAt（臺灣的朋友照臺灣時間回） */
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/hometown_lines.js','src/hometown3d.js','src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/kxod3d.js','src/kxdrift3d.js']) load(f);
for(const f of ['src/jp3d.js','src/us_life3d.js']){ try{ load(f); }catch(e){ console.log('  （載入 '+f+' 失敗：'+(e&&e.message)+'）'); } }
const T=(d,h)=>d*24+h, D=k=>STORY.dayOfKey(k), wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const setT=(G,d,h)=>{ G.day=d; G.hour=h; G.weekday=wdOf(d); };
const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b), J=x=>JSON.stringify(x);
const fresh=(k,h,more)=>{ const G=H.fresh(k,h,'dorm',Object.assign({dating_kexin:true,KX_OUR_DAY:{day:'sat',mode:'mid'},EXCHANGE_ROUTE:'TW'},more||{})); ROM.rec(G); return G; };
const msgs=G=>(G.msgs||[]).filter(m=>m.th==='p:kexin');
/* 傳一則，時間走到她回的那一刻：回傳 {r, her:[她回的泡泡]}（同 aa384 那支）*/
const send=(G,d,h,topic)=>{ setT(G,d,h); MSG.rec(G).sent={}; const before=new Set(G.msgs||[]); const r=MSG.send(G,'kexin',topic);
  if(r&&r.at){ const t=T(r.at.day,r.at.h)+0.01, dd=Math.floor(t/24+1e-9); setT(G,dd,t-dd*24); PHONE.tick(G); }
  return {r,her:msgs(G).filter(m=>!before.has(m)&&m.from==='kexin').map(m=>m.text)}; };
const US=['我這邊要睡了。','你那邊應該才剛開始。'], JPL=['我這邊十二點了。','你那邊一點了，快去睡。'];
const ab=((MSG_POOL.people.kexin||{}).replies||[]).filter(e=>e.topic==='chat'&&e.variant==='祐廷在國外');
check('0. MSG_POOL 可昕 L 層「祐廷在國外」兩則（美國路線、日本路線各一）',ab.length===2&&ab.some(e=>eq(e.msgs,US)&&(e.tags||[]).includes('美國路線'))&&ab.some(e=>eq(e.msgs,JPL)&&(e.tags||[]).includes('日本路線')),J(ab.map(e=>[e.tier,e.tags,e.msgs])));
const tier=G=>MSG.tier?MSG.tier(G,'kexin'):'?';
/* 1 */
{ const G=fresh('2028-09-01',12,{EXCHANGE_ROUTE:'US'}); const s=send(G,D('2028-10-12'),11.6,'chat');
  const z=STORY.tzOffset?STORY.tzOffset(G,D('2028-10-12')):null, tw=s.r&&s.r.at?(((s.r.at.h-(z||0))%24)+24)%24:null;
  check('1. 美國路線、人在美國、當地 11:36（她那邊 23:36）：「我這邊要睡了。」「你那邊應該才剛開始。」',tier(G)==='L'&&eq(s.her,US),J({tier:tier(G),her:s.her,at:s.r&&s.r.at,z,tw})); }
/* 2 */
{ const G=fresh('2028-03-01',12,{EXCHANGE_ROUTE:'JP'}); G.flags.JP_DEPARTED=D('2028-03-25');   /* [前置] 出發了（jp3d.js 的時差換算看 JP_DEPARTED）*/ const s=send(G,D('2028-04-10'),0.6,'chat');
  check('2. 日本路線、人在日本、當地 00:36（她那邊 23:36）：「我這邊十二點了。」「你那邊一點了，快去睡。」，當天回',eq(s.her,JPL)&&!!s.r&&!s.r.at.late&&s.r.at.day===D('2028-04-10'),J({her:s.her,at:s.r&&s.r.at})); }
/* 3 */
{ const L=[];
  { const G=fresh('2028-09-01',12,{EXCHANGE_ROUTE:'US'}); const s=send(G,D('2028-10-13'),2,'chat'); L.push(['美國當地 02:00',s.her]); }
  { const G=fresh('2028-09-01',12,{EXCHANGE_ROUTE:'TW'}); const s=send(G,D('2028-10-12'),23.67,'chat'); L.push(['在臺灣 23:40',s.her]); }
  { const G=fresh('2028-06-01',12,{EXCHANGE_ROUTE:'US'}); const s=send(G,D('2028-07-20'),23.67,'chat'); L.push(['美國路線還沒出發 23:40',s.her]); }
  { const G=fresh('2028-09-01',12,{EXCHANGE_ROUTE:'US'}); const s=send(G,D('2028-10-12'),11.6,'chat'); L.push(['人在美國：不用日本那一則',s.her]); }
  const bad=L.filter(([n,h])=>n==='人在美國：不用日本那一則'?eq(h,JPL):(eq(h,US)||eq(h,JPL)));
  check('3. 對照：美國當地 02:00、在臺灣 23:40、還沒出發 23:40 都不用那兩則；人在美國不用日本那一則',!bad.length&&L.every(([n,h])=>h.length>0),J(L)); }
/* 4 */
{ const G=fresh('2028-09-01',12,{EXCHANGE_ROUTE:'US'}); setT(G,D('2028-10-12'),12); const a=[MSG.tok(G,'kexin','美國路線'),MSG.tok(G,'kexin','日本路線')];
  setT(G,D('2028-07-20'),12); const b=MSG.tok(G,'kexin','美國路線');
  const GJ=fresh('2028-03-01',12,{EXCHANGE_ROUTE:'JP'}); GJ.flags.JP_DEPARTED=D('2028-03-25'); setT(GJ,D('2028-04-10'),12); const c=[MSG.tok(GJ,'kexin','日本路線'),MSG.tok(GJ,'kexin','美國路線')];
  check('4. tok「美國路線」：美國路線、人在美國＝true；還沒出發＝false；「日本路線」同理',eq(a,[true,false])&&b===false&&eq(c,[true,false]),J({a,b,c})); }
console.log(H.fails?('FAILED '+H.fails):'ALL PASS'); process.exit(H.fails?1:0);
