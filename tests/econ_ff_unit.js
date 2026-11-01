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
let pend=0; const PAT=[]; global.PHONE={pending:()=>Array(pend).fill(0),tick(){},at:(G,d,h,items,tag)=>{ if(PAT.some(x=>x.tag===tag)) return false; PAT.push({d,h,items,tag}); return true; }};
const mkG=(k,h,f)=>({stage:'econ',day:dayOf(k),hour:h,weekday:CALENDAR.dateOf(dayOf(k)).wd,flags:Object.assign({E01_MORNING:true,ECON_FULL:true},f||{}),events:{done:{}}});
{ check('① 9/2 08:00（E01 早上以後）開',ECONFF.on(mkG('2024-09-02',8)));
  check('① E01 早上還沒演：不開',!ECONFF.on(mkG('2024-09-02',8,{E01_MORNING:false})));
  check('① 法律系：不開',!ECONFF.on(Object.assign(mkG('2024-09-02',8),{stage:'law'})));
  const g=mkG('2024-10-17',23); g.events.done.ev_y0_e30_note=1; check('① 10/17 便利貼演完：還開（下一步 10/19 退宿）',ECONFF.on(g)); const g2=mkG('2024-10-19',18,{Y0_MOVED_OUT:true}); check('① 10/19 退宿以後：第一階段關（換第二階段，tests/econ_ff2_unit.js）',!ECONFF.on(g2));
  global.location={search:'?nofastecon'}; check('① ?nofastecon：關',!ECONFF.on(mkG('2024-09-02',8))); global.location={search:''}; }
{ const G=mkG('2024-09-02',8,{ECON_FULL:false}); const ids=[]; for(let i=0;i<20;i++){ const s=ECONFF.next(G); if(!s) break; ids.push(s.ev); ECONFF.rec(G).done[s.n]=1; }
  check('AA_300 第 1 節＋AA_305：經濟系開學到退宿只停（保齡球、要我載妳嗎、系烤、長頸鹿拉花、聚會、辦休學、車上、10/29 小松、10/31 搬出宿舍；10/17 便利貼拿掉）',JSON.stringify(ids)===JSON.stringify(['ev_y0_e14','ev_y0_e05','ev_y0_e08','ev_y0_l5a','ev_y0_gather','ev_y0_e30','ev_y0_e26','ev_y0_xiaofu','ev_y0_a3']),JSON.stringify(ids));
  check('AA_303：交往前三則手機訊息 T1、T3、T6 也拿掉（不排手機）',!PAT.some(x=>/kt\d/.test(x.tag)),JSON.stringify(PAT.map(x=>x.tag)));
  check('AA_300 第 7 節：不在 29 場的邀約私訊不傳（聖誕、豆花、劇社、R2／R5／R6 沒去那則）；ECON_FULL 照傳',ECONFF.cutMsg(G,'y0_e20_ask')&&ECONFF.cutMsg(G,'y0_c1_ask')&&ECONFF.cutMsg(G,'y0_e18a_ask')&&ECONFF.cutMsg(G,'y0_r6_miss')&&!ECONFF.cutMsg(G,'y0_e12_ask')&&!ECONFF.cutMsg(mkG('2024-09-02',8),'y0_e20_ask'));
  check('AA_300：其他經濟系事件不演（EVENTS.check 擋：社團博覽會、泡麵之夜、去總圖念書）；29 場的照演；ECON_FULL（舊流程測試）不擋',ECONFF.cut(G,{id:'ev_y0_e07',stage:'econ'})&&ECONFF.cut(G,{id:'ev_y0_t0a',stage:'econ'})&&ECONFF.cut(G,{id:'ev_y0_e10',stage:'econ'})&&!ECONFF.cut(G,{id:'ev_y0_e05',stage:'econ'})&&!ECONFF.cut(mkG('2024-09-02',8),{id:'ev_y0_e07',stage:'econ'})&&!ECONFF.cut(Object.assign(mkG('2024-09-02',8,{ECON_FULL:false}),{stage:'law'}),{id:'ev_y0_e07',stage:'econ'}));
  const g=mkG('2024-09-14',8,{ECON_FULL:false}); g.flags.ECONFF={done:{},lines:[]};
  check('AA_300 第 4 節：日期卡一句照跳過的日子（9/2 → 9/13：開學第一週那句；同一句不重複；隔一天不出）',ECONFF.cardLine(g,dayOf('2024-09-02')-1,dayOf('2024-09-13'))==='（開學第一週。新生座談、第一堂經原、第一堂會計。阿勳每一堂都坐你旁邊，品妤每一堂都坐可昕旁邊。）'&&ECONFF.cardLine(g,dayOf('2024-09-02')-1,dayOf('2024-09-13'))===null&&ECONFF.cardLine(g,dayOf('2024-09-20'),dayOf('2024-09-21'))===null);
  check('AA_303 第 3 節＋AA_305（10/18～10/28、11/1～11/5 兩句取代 10/20～11/05）＋AA_308 第 1、2、6 節：日期卡 29 句（AA_368 H1、H2 各拆成兩張；AA_348 第 3 節：範圍對齊停點、加四句；AA_308 第 5 節 6/9～6/23 拆三句、6/25～6/27「她已經不笑了」拿掉）；11/22～12/12 是她第一次來家裡吃飯（補習班 12/13 演出來，不再提；AA_348 B3：原本 11/07 起，在 11/21 那一跳就出現）；12/20～12/30 期末考完、寒假開始（BB218-P3 ①：原本 12/14 起）；1/1～1/7、1/9～1/27 夾著 1/8 公館吃麵；2/3～2/11 國文零分；AA_529 6-5：4/25～6/7 拆成 4/25～5/18、5/19～6/7 兩張（29 句）',ECONFF.CARDS.length===29&&ECONFF.CARDS.some(([a,b,t])=>a==='2024-10-18'&&b==='2024-10-28'&&/照樣陪可昕去上課/.test(t))&&ECONFF.CARDS.some(([a,b,t])=>a==='2024-11-01'&&b==='2024-11-05')&&ECONFF.CARDS.some(([a,b,t])=>a==='2024-11-22'&&b==='2024-12-12'&&t==='（十二月，她第一次來你家吃飯，媽媽煮了一桌。）')&&ECONFF.CARDS.some(([a,b,t])=>a==='2024-12-20'&&b==='2024-12-30'&&/十二月二十日，期末考考完了/.test(t))&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-01-01'&&b==='2025-01-07')&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-01-09'&&b==='2025-01-27'&&/她回高雄了/.test(t))&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-02-03'&&/國文，零分/.test(t))); }
{ // AA_348 第 3 節、第 5 節第 2 項、B1（LAWWW-C 2026-10-21）
  const g=mkG('2024-11-07',8,{ECON_FULL:false}); g.flags.ECONFF={done:{},lines:[]};
  check('AA_348 B3：11/7 → 11/21 那一跳是「十一月。你沒有課表了」那句，不是十二月的事；11/21 → 12/13 才是「她第一次來你家吃飯」',ECONFF.cardLine(g,dayOf('2024-11-07'),dayOf('2024-11-21'))==='（十一月。你沒有課表了，可是她有。星期三五點二十，她體育課下課，你都在門口等。）'&&ECONFF.cardLine(g,dayOf('2024-11-21'),dayOf('2024-12-13'))==='（十二月，她第一次來你家吃飯，媽媽煮了一桌。）');
  const g2=mkG('2025-02-21',8,{ECON_FULL:false}); g2.flags.ECONFF={done:{},lines:[]};
  check('AA_348：2/21 → 3/10「下樓。十分鐘。」；4/2 → 4/23「倒數撕到一百」（AA_368 H2：原本 3/12 → 4/23 就出，現在 4/3 起）；2/15 → 2/21 照舊是書桌那句',ECONFF.cardLine(g2,dayOf('2025-02-21'),dayOf('2025-03-10'))==='（晚上九點讀不下去的時候，她會說：「下樓。十分鐘。」兩個人走到便利商店，看一下外面的燈，再回來。）'&&ECONFF.cardLine(g2,dayOf('2025-04-02'),dayOf('2025-04-23'))==='（四月二日，牆上的倒數撕到一百。那個禮拜，媽媽燉了雞湯。她那碗多一隻雞腿。）'&&/一半是她的書/.test(ECONFF.cardLine(g2,dayOf('2025-02-15'),dayOf('2025-02-21'))||''));
  const lines=p=>{ const x=mkG('2025-07-14',8,Object.assign({ECON_FULL:false},p==null?{}:{E35_PLAN:p})); x.flags.ECONFF={done:{},lines:[]}; return ECONFF.cardLine(x,dayOf('2025-07-14'),dayOf('2025-07-24')); };
  check('AA_348 第 5 節第 2 項：7/14 → 7/24 照 E35_PLAN 三種（海邊西瓜、小店兩份一樣、下雨睡到三點）；沒有約定不出',/西瓜/.test(lines('sea')||'')&&/兩份一樣/.test(lines('shop')||'')&&/睡到下午三點/.test(lines('sleep')||'')&&lines(null)===null);
  { const cl=(a,b,f)=>{ const x=mkG(a,8,Object.assign({ECON_FULL:false},f||{})); x.flags.ECONFF={done:{},lines:[]}; return ECONFF.cardLine(x,dayOf(a),dayOf(b))||''; };
    check('BB218-P3 ①：日期卡不早於它講的那一天——12/13 → 12/19 不講「十二月二十日，期末考考完了」、12/19 → 12/21 才講；7/14 → 7/18 不講 7/19（六）的約定、7/18 → 7/20 才講',!/十二月二十日/.test(cl('2024-12-13','2024-12-19'))&&/十二月二十日/.test(cl('2024-12-19','2024-12-21'))&&!/星期六/.test(cl('2025-07-14','2025-07-18',{E35_PLAN:'sea'}))&&/西瓜/.test(cl('2025-07-18','2025-07-20',{E35_PLAN:'sea'})),JSON.stringify([cl('2024-12-13','2024-12-19'),cl('2025-07-14','2025-07-18',{E35_PLAN:'sea'})])); }
  check('AA_348 B1：CUT_MSG 有 y0_r3_miss、y0_r7_ask、y0_r7_miss（30 分鐘版不傳 5/23 保齡球邀約）；ECON_FULL 照舊傳',['y0_r3_miss','y0_r7_ask','y0_r7_miss'].every(k=>ECONFF.cutMsg(mkG('2025-05-23',8,{ECON_FULL:false}),k))&&!ECONFF.cutMsg(mkG('2025-05-23',8,{ECON_FULL:true}),'y0_r7_ask')); }
{ // AA_368 H1、H2（企劃線 e55fda50，LAWWW 2026-10-21）：日期卡「知道太早」——颱風假是 9/30，四月二日是 4/2；停點在那之前的跳躍不能先講
  const TY='（颱風假那天，你和阿勳在宿舍泡了一整晚的泡麵。之後，小松的午餐常常是同一桌。）', GR='（系烤以後，經濟系的群組每天都有人講話。阿勳每一則都回，品妤每一則都已讀。）';
  const A2='（四月二日，牆上的倒數撕到一百。那個禮拜，媽媽燉了雞湯。她那碗多一隻雞腿。）', MR='（三月。她開始把每天讀完的範圍寫在一張紙上，貼在倒數日曆旁邊。）';
  const fresh=k=>{ const x=mkG(k,8,{ECON_FULL:false}); x.flags.ECONFF={done:{},lines:[]}; return x; };
  const g1=fresh('2024-09-24'), l1=ECONFF.cardLine(g1,dayOf('2024-09-21'),dayOf('2024-09-24'));
  check('AA_368 H1：9/21 → 9/24（颱風假 9/30 以前）不講颱風假，是「系烤以後，經濟系的群組……」',l1===GR,l1);
  const l1b=ECONFF.cardLine(g1,dayOf('2024-09-30'),dayOf('2024-10-12'));
  check('AA_368 H1：9/30 → 10/12 才是颱風假那句（10/1～10/11）',l1b===TY,l1b);
  const g1c=fresh('2024-09-30'), l1c=ECONFF.cardLine(g1c,dayOf('2024-09-21'),dayOf('2024-09-30'));
  check('AA_368 H1：9/21 → 9/30（颱風假當天停）也不講颱風假',l1c===GR,l1c);
  check('AA_368 H1：颱風假那句從 10/1 起、新句 9/22～9/29；颱風假是 9/30（calendar.js）',ECONFF.CARDS.some(([a,b,t])=>a==='2024-10-01'&&b==='2024-10-11'&&t===TY)&&ECONFF.CARDS.some(([a,b,t])=>a==='2024-09-22'&&b==='2024-09-29'&&t===GR)&&CALENDAR.typhoon(dayOf('2024-09-30'))&&!ECONFF.CARDS.some(([a,b,t])=>t===TY&&a<'2024-10-01'));
  const g2=fresh('2025-03-16'), l2=ECONFF.cardLine(g2,dayOf('2025-03-10'),dayOf('2025-03-16'));
  check('AA_368 H2：3/10 → 3/16 不講四月二日，是「三月。她開始把每天讀完的範圍……」',l2===MR,l2);
  const l2b=ECONFF.cardLine(g2,dayOf('2025-04-02'),dayOf('2025-04-12'));
  check('AA_368 H2：4/2 → 4/12 才是「四月二日，牆上的倒數撕到一百」',l2b===A2,l2b);
  check('AA_368 H2：四月二日那句 4/3～4/22、三月那句 3/10～4/2',ECONFF.CARDS.some(([a,b,t])=>a==='2025-04-03'&&b==='2025-04-22'&&t===A2)&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-03-10'&&b==='2025-04-02'&&t===MR)); }
{ // AA_308 第 5 節（CRAM-LEAVE-LAUGH-1018）、USER_WANTS X59
  check('CRAM-LEAVE-LAUGH：30 分鐘版衝刺班演 RH-C2（6/12）、RH-C3（6/17）、RH-C4（6/24）；6/9～6/23 日期卡拆三句；「後來去請假，她已經不笑了」那句拿掉（使用者 10-18）',['RH-C2','RH-C3','RH-C4'].every(k=>ECONFF.RH_PLAY.includes(k))&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-06-09'&&b==='2025-06-11'&&/中午、晚上訂便當/.test(t))&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-06-13'&&b==='2025-06-16'&&/再隔天，傍晚又想回家了/.test(t))&&ECONFF.CARDS.some(([a,b,t])=>a==='2025-06-18'&&b==='2025-06-23'&&/又早走了三次/.test(t))&&!ECONFF.CARDS.some(([a,b,t])=>typeof t==='string'&&/已經不笑了/.test(t))&&!ECONFF.stepCut(mkG('2025-06-12',8,{ECON_FULL:false}),{rh:'RH-C2'})&&!ECONFF.stepCut(mkG('2025-06-17',8,{ECON_FULL:false}),{rh:'RH-C3'})); }
{ const G=mkG('2024-09-02',8); const ids=[]; for(let i=0;i<6;i++){ const s=ECONFF.next(G); if(!s) break; ids.push(s.ev||s.cls); ECONFF.rec(G).done[s.n]=1; }
  check('② 順序：E02 → 會計第一堂 → 第一次經原 → 保齡球（9/13，AA_293 4-1）→ 社團博覽會 → P2',JSON.stringify(ids)===JSON.stringify(['ev_y0_e02','acct_y0','econ_principles_y0','ev_y0_e14','ev_y0_e07','ev_y0_p2']),JSON.stringify(ids));
  const G2=mkG('2024-09-19',16,{}); for(const s of ECONFF.STEPS) if(s.n<9) ECONFF.rec(G2).done[s.n]=1; G2.events.done.ev_y0_e05=1; const s9=ECONFF.next(G2);
  check('② E05 在 9/19 接 P2 演過：9/20 那一個跳過，下一個是 9/21 系烤',s9&&s9.ev==='ev_y0_e08',s9&&s9.ev);
  const s5=ECONFF.STEPS.find(s=>s.n===5), t5=ECONFF.tOf(G,s5), it=ECONFF.clsItem(G,dayOf('2024-09-05'),'acct_y0');
  check('② 會計第一堂的時間＝那堂課開始前 5 分鐘（9/5 13:15）',!!it&&Math.abs(t5-(dayOf('2024-09-05')*24+it.t0-1/12))<1e-6,it&&it.t0); }
{ const G=mkG('2024-09-02',12.3); const n=ECONFF.attendBetween(G,dayOf('2024-09-05')*24+13); const R=CLS.rec(G);
  const keys=Object.keys(R.done); check('③ 9/2 下午～9/5 13:00 的課自動算出席、不發翹課訊息',n>=3&&keys.every(k=>R.note['skip_'+k]===1)&&Object.values(R.attend).every(v=>v>=1),n+' 堂 '+JSON.stringify(Object.keys(R.attend)));
  check('③ 9/5 13:20 的會計（還沒到）不算',!keys.some(k=>/acct_y0/.test(k)&&k.startsWith(String(dayOf('2024-09-05'))+':')),JSON.stringify(keys.filter(k=>/acct/.test(k)))); }
{ // 真正的呼叫順序（S.advance）：先 jumpTo 跳過去、再 attendBetween——要從跳之前那一天算起（v9.10.3 發布前 flow_v0_start 查到：9/2→9/13 只記到 9/12 一堂會計）
  const G=mkG('2024-09-02',12.3); const d0=G.day; pend=0; global.STORY.phoneRules=()=>{}; ECONFF.jumpTo({G,E:null},dayOf('2024-09-13'),19);
  ECONFF.attendBetween(G,G.day*24+G.hour,d0); const keys=Object.keys(CLS.rec(G).done);
  const days=[...new Set(keys.map(k=>+k.split(':')[0]))];
  check('③ 跳完再算（傳跳之前的那一天）：9/2～9/13 經原、會計都記到、不只最後一天',keys.some(k=>/:acct_y0:/.test(k))&&keys.some(k=>/:econ_principles_y0:/.test(k))&&days.length>=5,days.length+' 天 '+JSON.stringify(keys.slice(0,6)));
  const src=fs.readFileSync(path.join(ROOT,'src/econff3d.js'),'utf8'); check('③ S.advance 呼叫 attendBetween 時傳跳之前的那一天（d0）',/S\.attendBetween\(G,G\.day\*24\+G\.hour,d0\)/.test(src)); }
{ const G=mkG('2024-09-02',13); pend=0; let calls=0; global.STORY.phoneRules=()=>{ calls++; if(G.hour>=22.4) pend=1; };
  const r=ECONFF.jumpTo({G,E:null},dayOf('2024-09-05'),13.25); check('④ 跳的途中收到要回的訊息：停在那一刻（9/2 23:00 左右）',r==='msg'&&G.day===dayOf('2024-09-02')&&G.hour>=22.4&&G.hour<=23.01,r+' '+G.day+' '+G.hour);
  pend=0; global.STORY.phoneRules=()=>{}; const r2=ECONFF.jumpTo({G,E:null},dayOf('2024-09-05'),13.25); check('④ 沒有要回的：跳到 9/5 13:15',r2==='ok'&&G.day===dayOf('2024-09-05')&&Math.abs(G.hour-13.25)<1e-6&&G.weekday===CALENDAR.dateOf(G.day).wd,r2+' '+G.hour); }
{ const G=mkG('2024-09-09',11); const a=ECONFF.lineFor(G,dayOf('2024-09-09'),dayOf('2024-09-18')); check('⑤ 9/9 → 9/18：「三棟樓之間的路……」',/三棟樓之間的路/.test(a||''),a);
  check('⑤ 只隔一天：沒有',ECONFF.lineFor(G,dayOf('2024-09-18'),dayOf('2024-09-19'))===null);
  ECONFF.rec(G).lines.push(a); const b=ECONFF.lineFor(G,dayOf('2024-09-09'),dayOf('2024-09-18')); check('⑤ 用過的不重複（同一段改用備用句）',b!==a&&!!b,b); }
// BUG-ECON-OCT-ALLOWANCE-1021（BB 10-21 17:50）：住宿舍的月份跳日子也照月匯——9/30 跳到 10/2，10/1 匯一次（家裡匯錢的規則照 STORY.monthlyFunds，這裡用同樣的「換月才匯」）；修改前 jumpTo 沒叫，10/1 那筆一直沒匯
{ const G=mkG('2024-09-30',21,{allowanceMonth:9}); G.money=1000; let toast=null; const S0=global.STORY.monthlyFunds, P0=global.STORY.phoneRules; global.STORY.phoneRules=()=>{}; pend=0;
  global.STORY.monthlyFunds=g=>{ const m=CALENDAR.dateOf(g.day).m; if(g.flags.allowanceMonth===m) return null; g.flags.allowanceMonth=m; return {amount:30000,text:'家裡匯來這個月的生活費：30,000 元'}; };
  const GM={G,E:null,money(n){ G.money+=n; },toast(t){ toast=t; }}; const r=ECONFF.jumpTo(GM,dayOf('2024-10-02'),8);
  check('BUG-ECON-OCT-ALLOWANCE：9/30 跳到 10/2，10/1 照月匯一次（+30,000）、跳完提示一次',r==='ok'&&G.money===31000&&G.flags.allowanceMonth===10&&toast==='家裡匯來這個月的生活費：30,000 元',r+' money='+G.money+' toast='+toast);
  global.STORY.monthlyFunds=S0; global.STORY.phoneRules=P0; }
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
  // ⑧ 跳日期的黑幕、日期卡期間玩家鎖住（BUG-BOWL-STUCK-1018 懷疑的方向：原本這段玩家沒有標 busy），跳完一定放開；中途收到訊息停下來也放開
  { let depth=0, nB=0, nE=0; const seen=[]; const GM={G:mkG('2024-09-09',20),E:null,sceneBegin(){ depth++; nB++; },sceneEnd(){ depth--; nE++; },fade:async on=>{ seen.push('fade'+(on?1:0)+':'+depth); },titleCard:async()=>{ seen.push('card:'+depth); },autosave(){}};
    GM.G.flags.ECONFF={done:{4:1,5:1,6:1},lines:[]}; pend=0; await ECONFF.advance(GM);
    check('⑧ 跳到 9/13 保齡球：黑幕、日期卡期間鎖住（depth 1），跳完放開（depth 0、開關次數相同）',depth===0&&nB===1&&nE===1&&seen.includes('fade1:1')&&seen.includes('card:1')&&seen.includes('fade0:1'),JSON.stringify(seen)+' depth='+depth);
    const G2=mkG('2024-09-09',20); G2.flags.ECONFF={done:{4:1,5:1,6:1},lines:[]}; depth=0; nB=0; nE=0; let opened=0; global.STORY.phoneRules=()=>{ if(G2.hour>=21) pend=1; };
    await ECONFF.advance(Object.assign({},GM,{G:G2,phoneThread:()=>{ opened++; return new Promise(()=>{}); }}));
    check('⑧ 跳的途中收到要回的訊息：打開手機、放開鎖（depth 0）',depth===0&&nB===1&&nE===1&&opened===1,'depth='+depth+' opened='+opened); pend=0; global.STORY.phoneRules=()=>{};
    { const G3=mkG('2024-09-09',20); G3.flags.ECONFF={done:{4:1,5:1,6:1},lines:[]}; const seq=[]; global.STORY.phoneRules=()=>{ if(G3.day>=dayOf('2024-09-11')) pend=1; };
      await ECONFF.advance(Object.assign({},GM,{G:G3,titleCard:async(a,b)=>{ seq.push('card:'+b); },phoneThread:()=>{ seq.push('phone'); return new Promise(()=>{}); }}));
      check('⑧ AA_348 B2：跳到隔天以後才收到訊息停下來：先出日期卡（含那一句）再打開手機（原本直接開手機，看不到今天幾號）',seq.length===2&&/^card:（/.test(seq[0])&&seq[1]==='phone',JSON.stringify(seq)); pend=0; global.STORY.phoneRules=()=>{}; } }
  console.log(fails?'FAILED: '+fails:'ALL PASS'); process.exit(fails?1:0); })();
