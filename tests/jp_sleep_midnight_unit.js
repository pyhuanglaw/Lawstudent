// BUG-JP-SLEEP-MIDNIGHT-1022（BB 10-22 03:16 讀碼）——不需要瀏覽器。
//   1 日本路線快轉過半夜（setTime 換日、G.hour 0.x）以後才睡：醒來是同一天（原本 G.day+1＝多睡一整天）；沒換日的 24.x 照舊；lateNight 記醒來那一天
//   2 哲 4 日本版（臺灣 23:00＝當地 0:00）講一個半小時＝到當地 1:30：G.hour 0.x、24.x 都一樣（原本 24.x 只過 15 分鐘）
// 修改前（開發分支 b28b9b4f）：1 的換日那兩項、2 的 24.x 那一項 FAIL。用法：node tests/jp_sleep_midnight_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
let toasts=[]; GM.toast=t=>{ toasts.push(t); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js']) load(f);   /* 照 index.html 的順序（jp3d.js 在 r2y3b3d.js 之後）*/
const hasFiles=fs.existsSync(path.join(H.ROOT,'src/jp3d.js'))&&fs.existsSync(path.join(H.ROOT,'src/data/jp_events.js'));
if(hasFiles){ load('src/data/jp_events.js'); load('src/jp3d.js'); }
const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const S=JP, D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const fresh=(key,h,zone,route,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'JP',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; G.visited={}; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; toasts=[]; caps.length=0; HOME.rec(G); return G; };
const at=(key,h)=>H.at(key,h);
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const has=t=>H.said.some(s=>s.t===t);
const idx=t=>H.said.findIndex(s=>s.t===t);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const run=async id=>{ H.said=[]; H.opts=[]; H.cgs=[]; await EVENTS.run(ev(id)); };
const date=id=>H.date(id);
const repairMode=()=>{ date('heroine_01'); ROM.end(H.G,'heroine_01','test'); };   /* 日本路線的挽回中：交往過、出發前分開（AA_253 第 5 節）*/
const inJapan=(key,h,flags,dating)=>{ const G=fresh(key,h,'jp_hub','JP',Object.assign({X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'},flags||{})); H.FAMILIAR('heroine_01'); if(dating!==false) date('heroine_01'); else repairMode(); return G; };
(async()=>{
  // ---- 1. 睡覺 ----
  { const G=inJapan('2028-04-09',23); at('2028-04-10',0.5); const d0=G.day; await S.sleep(GM);
    check('1. 快轉過半夜（4/10 00:30，已經換日）才睡：醒在 4/10 08:00（第一堂前一小時），不是 4/11',G.day===D('2028-04-10')&&Math.abs(G.hour-8)<1e-6&&d0===D('2028-04-10'),G.day+' '+G.hour); }
  { const G=inJapan('2028-04-14',23); at('2028-04-15',0.5); await S.sleep(GM);
    check('1. 週末也一樣（那天沒有課、沒有停點）：4/15（六）00:30 才睡＝醒在 4/15 08:30，不是 4/16',G.day===D('2028-04-15')&&Math.abs(G.hour-8.5)<1e-6,CALENDAR.dateOf(G.day).key+' '+G.hour); }
  { const G=inJapan('2028-04-09',23); at('2028-04-09',24.5); await S.sleep(GM);
    check('1. 沒換日（4/9 24:30）照舊：醒在 4/10 08:00',G.day===D('2028-04-10')&&Math.abs(G.hour-8)<1e-6,G.day+' '+G.hour); }
  { const G=inJapan('2028-04-09',23); at('2028-04-10',1.5); await S.sleep(GM); const a=(G.daily||{}).lateNight;
    const G2=inJapan('2028-04-09',23); at('2028-04-09',25.5); await S.sleep(GM); const b=(G2.daily||{}).lateNight;
    check('1. 01:00 以後才睡（明軒那句）：lateNight 記醒來那一天 4/10（換日的 01:30、沒換日的 25:30 都一樣）',a===D('2028-04-10')&&b===D('2028-04-10'),JSON.stringify([a,b])); }
  { const G=inJapan('2028-04-09',22); await S.sleep(GM);
    check('1. 晚上 22:00 睡：照舊隔天 4/10 08:00、沒有 lateNight',G.day===D('2028-04-10')&&Math.abs(G.hour-8)<1e-6&&!(G.daily&&G.daily.lateNight),G.day+' '+G.hour); }
  // ---- 2. 哲 4 日本版 ----
  { const e=STORY_EVENTS.find(x=>(x.dialogue||[]).some(l=>typeof l.advance==='function'&&/jpNow/.test(String(l.advance)))), adv=e&&(e.dialogue||[]).find(l=>typeof l.advance==='function'&&/jpNow/.test(String(l.advance))).advance;
    const g=(h,jp)=>adv({hour:h,flags:{ZHE4_REPLY:jp?'jp':'down'}});
    check('2. 哲 4 日本版講一個半小時＝到當地 1:30：G.hour 0（換日）＋1.5、24（沒換日）＋1.5；臺灣版 23:00 照舊到 0:30（＋1.5）',!!adv&&Math.abs(g(0,true)-1.5)<1e-6&&Math.abs(g(24,true)-1.5)<1e-6&&Math.abs(g(23,false)-1.5)<1e-6,e?e.id+' '+JSON.stringify([g(0,true),g(24,true),g(23,false)]):'找不到事件'); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外 '+(e&&e.stack||e)); process.exit(1); });
