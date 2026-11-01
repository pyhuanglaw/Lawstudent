// X58（使用者 2026-10-18 15:4x：「跳過途中收到訊息就跳出來、按了繼續跳；不要跳完才說「收到 N 則」」；USER_WANTS X58、任務 X58-REST-1027）——不需要瀏覽器。
// 經濟系那一年（home3d.js y0Jump、econff3d.js jumpTo）10-18 就改好了（tests/v0_home_ff_unit.js 3b）；這支查剩下的三種跳過：
//   A. 法律系的寒暑假（home3d.js HOME.breakJump）：宿舍的床、家裡的「快轉」；放假住家裡「睡覺」經過要停的時間（出遊前）
//   B. 日本那一學期（jp3d.js JP.jump）：據點的「快轉」、「睡覺」
//   C. 出國、營隊、上班那幾天（vac3d.js VAC.jump）：關鍵事件中間跳過的日子（含整趟出國旅遊 C13）
// 每一種都查：途中收到不用回的訊息＝停在收到的那一刻、打開手機的對話列表（「收起來」寫「跳過」）；關掉（跳過）以後接著跳到原本的時間；
// 每一次停都是真的有新訊息；跳完不再跳「收到 N 則」的提示。要回的訊息、事件、原本的停點照舊（tests/holiday_ff_unit.js、law_break_unit.js、jp_semester_unit.js、vac_*_unit.js）。
// 修改前（7dacc9463）：A、B、C 都 FAIL（一路跳到底、只在最後跳「手機｜跳過的日子收到 N 則訊息」／「手機｜這幾天收到 N 則訊息」；不用回的不停、不打開手機）。
// 用法：node tests/x58_skip_msg_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);   /* 照 index.html 的順序 */
const {check,GM,E}=H;
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, now=()=>T(H.G.day,H.G.hour);
const lbl=t=>{ const d=Math.floor(t/24+1e-9), x=CALENDAR.dateOf(d), m=Math.round((t-d*24)*60); return x.m+'/'+x.d+' '+String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); };
/* 手機：每一次打開記下時間、這一次之前新收到幾則別人傳的；ADV（2D）那一刻開著沒有、VAC.away */
let calls=[], toasts=[], seenN=0;
const othersN=()=>(H.G.msgs||[]).filter(m=>m&&m.from!=='player').length;
GM.phoneThread=async(th,o)=>{ const n=othersN(); calls.push({t:now(),skip:!!(o&&o.skip),fresh:n-seenN,adv:!!ADV.active,away:typeof VAC!=='undefined'&&!!VAC.away}); seenN=n; };
GM.toast=t=>{ toasts.push(String(t)); };
ADV.begin=function(o){ this.active=true; this.bgMode=o&&o.background; H.bgs.push(this.bgMode); };
const reset=()=>{ calls=[]; toasts=[]; seenN=othersN(); H.cards=[]; };
const noCount=()=>!toasts.some(t=>/收到 \d+ 則/.test(t));
const at=(t,list)=>list.some(c=>Math.abs(c.t-t)<1e-6);
const msg=(day,h,text,tag)=>PHONE.at(H.G,day,h,[{th:'p:zhe',from:'zhe',text}],tag);
const atHome=()=>{ const Hm=HOME.rec(H.G); Hm.at=true; Hm.day=H.G.day; const B=HOME.lawBreak(H.G); Hm.lbreak=B.key; Hm.brk=B.key; Hm.bskip={key:B.key,n:0,last:-1}; };
const freshJP=(key,h)=>{ const G=H.fresh(key,h,'jp_hub',{EXCHANGE_ROUTE:'JP',EXCH_RULE:1,X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'}); G.acts={att:{}}; G.outings=[]; G.visited={}; H.at(key,h); G.zone='jp_hub'; GM.npc={}; HOME.rec(G); H.FAMILIAR('heroine_01'); H.date('heroine_01'); return G; };
(async()=>{
  check('0. 載入：HOME.breakJump、JP.jump、VAC.jump',typeof HOME.breakJump==='function'&&typeof JP!=='undefined'&&typeof JP.jump==='function'&&typeof VAC.jump==='function');

  /* ===================== A. 法律系的寒暑假 ===================== */
  // A1 宿舍的床「過三天」：1/8 20:00 一則不用回的
  { H.fresh('2026-01-07',10,'dorm'); reset(); msg(D('2026-01-08'),20,'測試：不用回的一則','x58_a1'); H.picks=['過三天']; await HOME.ffMenu(GM,'dorm');
    check('A1. 寒假宿舍的床「過三天」：1/8 20:00 收到不用回的訊息＝停在那一刻、打開手機的對話列表（「跳過」）',at(T(D('2026-01-08'),20),calls)&&calls.every(c=>c.skip),JSON.stringify(calls.map(c=>[lbl(c.t),c.skip])));
    check('A1. 按「跳過」以後接著跳：照樣到 1/10 08:30；每一次停都有新訊息；沒有「收到 N 則」',now()===T(D('2026-01-10'),8.5)&&calls.every(c=>c.fresh>0)&&noCount(),lbl(now())+' '+JSON.stringify(toasts));
    check('A1. 停下來那一刻有日期卡（1/8（四）20:00 宿舍）',H.cards.some(c=>c[0]==='1/8（四）20:00'&&c[1]==='宿舍'),JSON.stringify(H.cards)); }
  // A2 一路按跳過：三天裡三則（不同時間）
  { H.fresh('2026-01-07',10,'dorm'); reset(); const W=[[D('2026-01-07'),15],[D('2026-01-08'),20],[D('2026-01-09'),12]]; W.forEach(([d,h],i)=>msg(d,h,'測試：第 '+(i+1)+' 則','x58_a2_'+i)); H.picks=['過三天']; await HOME.ffMenu(GM,'dorm');
    const ts=calls.map(c=>c.t);
    check('A2. 一路按「跳過」：三則各停一次（照時間順序），最後到原本的 1/10 08:30',W.every(([d,h])=>at(T(d,h),calls))&&ts.every((t,i)=>i===0||t>ts[i-1])&&now()===T(D('2026-01-10'),8.5)&&noCount(),JSON.stringify(ts.map(lbl))); }
  // A3 要回的照樣停（回歸）、跳之前就在的問句不再停
  { H.fresh('2026-01-07',10,'dorm'); reset(); PHONE.post(H.G,{th:'p:zhe',from:'zhe',text:'測試：跳之前就在的問句',ask:{id:'x58_old',opts:[{t:'好'}]}}); seenN=othersN();
    PHONE.at(H.G,D('2026-01-08'),9,[{th:'p:zhe',from:'zhe',text:'測試：要回的',ask:{id:'x58_ask',opts:[{t:'好'}]}}],'x58_a3'); H.picks=['過三天']; await HOME.ffMenu(GM,'dorm');
    const cs=calls.filter(c=>c.t!==T(D('2026-01-08'),20)&&c.t!==T(D('2026-01-08'),22));   /* AA_532 第 4 節：留宿舍的寒假週四（1/8）20:00 家人群組、22:00 爸爸「？」也停，那兩次不算 */
    check('A3. 要回的訊息照舊停在收到的那一刻（1/8 09:00）；跳之前就在的問句不另外停；之後接著跳到 1/10 08:30',cs.length===1&&cs[0].t===T(D('2026-01-08'),9)&&now()===T(D('2026-01-10'),8.5),JSON.stringify(calls.map(c=>lbl(c.t)))); }
  // A4 放假住家裡「睡覺」：明天 07:30 的出遊（從家裡出發，06:45 要停）——半夜 23:00 一則
  { H.fresh('2026-01-12',22,'dorm'); atHome(); reset(); const d=H.G.day; OUT.plan(H.G,{id:'x58_out',ev:'ev_vac_key',day:d+1,h:7.5,late:0.5,place:'臺北車站',title:'測試的出遊',travel:'捷運約 20 分鐘',travelH:1/3,silent:true});
    msg(d,23,'測試：半夜的訊息','x58_a4'); const nx=HOME.breakNext(H.G); let menus=0, t2=null;
    const ch=GM.choose; GM.choose=async o=>{ menus++; const L=o.map(q=>q.t||q.text); if(menus===1) return L.indexOf('睡覺'); if(t2==null) t2=now(); return L.indexOf('回宿舍住'); };
    try{ await HOME.loop(GM); } finally{ GM.choose=ch; }
    check('A4. 前提：睡覺會經過要停的時間（明天 06:45，出遊出發前）',nx===T(d+1,6.75),lbl(nx));
    check('A4. 睡著的途中 23:00 收到訊息＝停下來打開手機（「跳過」）；按了接著睡到 06:45（出遊前），醒來的選單在 06:45；沒有「收到 N 則」',at(T(d,23),calls)&&calls.every(c=>c.skip&&c.fresh>0)&&t2===T(d+1,6.75)&&noCount(),JSON.stringify([calls.map(c=>lbl(c.t)),t2!=null?lbl(t2):null,toasts])); }

  /* ===================== B. 日本那一學期 ===================== */
  // B1 據點的「快轉」過三天：4/25 20:00 一則
  { freshJP('2028-04-24',10); reset(); const ff=JP.ffOpts(H.G,'jp'), to=ff[1].to, nx=JP.nextStop(H.G,now(),'jp');
    msg(D('2028-04-25'),20,'測試：日本的不用回','x58_b1'); await JP.ff(GM,to,'jp');
    check('B1. 前提：過三天之間沒有別的停點',ff[1].t==='過三天'&&(nx==null||nx>=to),JSON.stringify([ff[1].t,lbl(to),nx!=null?lbl(nx):null]));
    check('B1. 日本的據點快轉：4/25 20:00 停下來打開手機（「跳過」）；接著跳到原本的 '+lbl(to)+'；每一次停都有新訊息；沒有「收到 N 則」',at(T(D('2028-04-25'),20),calls)&&calls.every(c=>c.skip&&c.fresh>0)&&now()===to&&noCount(),JSON.stringify([calls.map(c=>lbl(c.t)),lbl(now()),toasts])); }
  // B2 據點的「睡覺」：23:00 一則
  { freshJP('2028-04-25',22); reset(); const G=H.G, nd=G.day+1; let to=T(nd,JP.wakeH(G,nd)); const lw=STORY.lawWakeAt?STORY.lawWakeAt(G):null; if(lw!=null&&T(G.day,lw)>now()) to=Math.min(to,T(G.day,lw));
    msg(G.day,23,'測試：日本的半夜','x58_b2'); await JP.sleep(GM);
    check('B2. 日本的據點睡覺：23:00 收到訊息停下來打開手機（「跳過」）；接著睡到醒來的 '+lbl(to)+'；沒有「收到 N 則」',at(T(D('2028-04-25'),23),calls)&&calls.every(c=>c.skip&&c.fresh>0)&&now()===to&&noCount(),JSON.stringify([calls.map(c=>lbl(c.t)),lbl(now()),toasts])); }

  /* ===================== C. 出國、營隊、上班那幾天（VAC.jump）===================== */
  // C1 出國途中：7/15 21:00 一則；跳到 7/17 14:00 首爾
  { H.fresh('2026-07-14',9,'dorm'); reset(); ADV.begin({background:{image:'assets/bg/intl_seoul_dinner.webp'}}); msg(D('2026-07-15'),21,'測試：出國途中','x58_c1');
    await VAC.jump(GM,T(D('2026-07-17'),14),'首爾'); const c=calls.find(x=>x.t===T(D('2026-07-15'),21));
    check('C1. 出國途中跳過：7/15 21:00 停下來打開手機（「跳過」），接著跳到 7/17 14:00；每一次停都有新訊息；沒有「這幾天收到 N 則」',!!c&&calls.every(x=>x.skip&&x.fresh>0)&&now()===T(D('2026-07-17'),14)&&noCount(),JSON.stringify([calls.map(x=>lbl(x.t)),lbl(now()),toasts]));
    check('C1. 停下來的日期卡寫時間＋地點（7/15（三）21:00 首爾）；最後一張照舊（7/17（五） 首爾）',H.cards.some(x=>x[0]==='7/15（三）21:00'&&x[1]==='首爾')&&JSON.stringify(H.cards[H.cards.length-1])===JSON.stringify(['7/17（五）','首爾']),JSON.stringify(H.cards));
    check('C1. 手機打開的時候 2D 收起來、3D 也藏著（VAC.away）；關掉以後回到原本的 2D 背景',!!c&&!c.adv&&c.away&&!VAC.away&&ADV.active&&ADV.bgMode&&ADV.bgMode.image==='assets/bg/intl_seoul_dinner.webp',JSON.stringify([c,VAC.away,ADV.active,ADV.bgMode])); }
  // C2 同一天下班（o.quiet，C16、C17）：停的時候不出日期卡
  { H.fresh('2027-07-05',9.5,'dorm'); reset(); msg(D('2027-07-05'),14,'測試：上班的時候','x58_c2'); await VAC.jump(GM,T(D('2027-07-05'),18),'法律扶助基金會',{quiet:true});
    check('C2. 同一天下班的跳過（quiet，09:30 起每小時看一次手機）：14:00 那一則在 14:30 停下來打開手機，不出日期卡；到 18:00',calls.some(x=>x.t>=T(D('2027-07-05'),14)&&x.t<T(D('2027-07-05'),15))&&H.cards.length===0&&now()===T(D('2027-07-05'),18),JSON.stringify([calls.map(x=>lbl(x.t)),H.cards])); }
  // C3 整趟出國旅遊（C13 自己排、5 天）：每天一則，全部一路按「跳過」走完
  { H.fresh('2026-07-01',10,'dorm'); H.picks=['韓國','自己去','5 天',0]; await VAC.plan13(GM); const r=VAC.rec(H.G).t13[0], q=OUT.get(H.G,'vac_t13_1');
    reset(); for(let d=r.from;d<=r.to;d++) msg(d,21,'測試：第 '+(d-r.from+1)+' 天','x58_c3_'+d); H.G.day=r.from; H.G.weekday=CALENDAR.dateOf(r.from).wd%7; H.G.hour=8; await VAC.outing(GM,q);
    const want=[]; for(let d=r.from;d<r.to;d++) want.push(T(d,21));
    check('C3. 出國旅遊 5 天：中間每天 21:00 那一則都停下來打開手機（最後一天 18:00 就回來了）；整趟走完（done、BACK_FROM_T13）；沒有「這幾天收到 N 則」',!!r&&want.every(t=>at(t,calls))&&calls.every(x=>x.skip&&x.fresh>0)&&r.done===true&&H.G.flags.BACK_FROM_T13===r.to&&now()===T(r.to,18)&&noCount(),JSON.stringify([calls.map(x=>lbl(x.t)),lbl(now()),toasts])); }

  /* ===================== 原始碼：三處的「收到 N 則」都拿掉 ===================== */
  { const src=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
    check('D. home3d.js、jp3d.js、vac3d.js 沒有跳完才說「收到 N 則」的提示',!/GM\.toast\('手機｜跳過的日子收到 '/.test(src('src/home3d.js'))&&!/GM\.toast\('手機｜跳過的日子收到 '/.test(src('src/jp3d.js'))&&!/GM\.toast\('手機｜這幾天收到 '/.test(src('src/vac3d.js'))); }
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
