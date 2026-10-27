// AA_472 畢業以後讀一遍（臺灣路線八種存檔；企劃線 1ebcf530e；任務 PG-FIX-471-473-1027）——不需要瀏覽器。
//   1 學姊 9/7 15:20「明年。……讀書計畫你先排，我幫你看。」（原本「我幫你排」，和 2030 字卡「你自己排」打架；字卡不動）
//   2 2030 第二次考的便條一張只寫一句「（便條：「你比去年多念了一年。」）」
//   3 可昕交往第六年（2030-10-17）：地點照第五年（沒有邀約那一則）、地點之後一句（第五年選了「寫什麼？」的換一句）、禮物照第二～五年、卡片在祐廷手上那一段、沒去＝22:00 私訊
//   4 芷若 6/2 視訊兩句：AA_472 第 4 節的改字作廢（AA_476 A-1，企劃線 6ad997806：視訊在 10:30＝英國 03:30，改回原句「凌晨三點」、視訊不搬）
//   5 學姊交往中、2030 第二次考的考場那一句換成「同一家便利商店。……我坐去年那個位子。」（2029 照舊；去年她沒在便利商店等的照原句）
//   6 沛珊 2030-06「說好的，運河一圈。……」（AA_367 白名單改 1ebcf530、重新匯入 pg_dates.js）
// 每一節都逐字對稿（git 讀企劃線 1ebcf530e 的 AA_472、AA_367）。修改前（243db0938）的結果見檔尾。用法：node tests/aa472_pg_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
global.CG_REGISTRY=global.CG_REGISTRY||{};
const NAMES=/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS|Y5|FD|PG_DATES|PGDATE|ROM1016|ROM1016_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NAMES.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
for(const f of ['src/noodle_closed3d.js','src/data/r2y4b_events.js','src/r2y4b3d.js','src/y5s1_3d.js','src/data/pg_dates.js','src/pgdates3d.js','src/data/rom1016_events.js','src/rom1016_3d.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const git=(sha,f)=>{ try{ return cp.execFileSync('git',['-C',H.ROOT,'-c','core.quotepath=false','show',sha+':'+f],{encoding:'utf8'}); }catch(e){ return ''; } };
const DOC=git('1ebcf530e','docs/story_planning/AA_472_畢業以後讀一遍_臺灣路線八種存檔_讀書計畫誰排_可昕第六年.md');
const D367=git('1ebcf530e','docs/story_planning/AA_367_畢業以後的交往節奏_六位.md');
const D476=git('6ad997806','docs/story_planning/AA_476_回LAWWW_PGFIX九題_抓包CG_AA290白名單.md');   /* AA 回九題（AA-C 10-27）：第 4 節改回原句、第 3 節第六年前一週的邀約 */
const a476=n=>{ const a=D476.indexOf('\n'+n+'. **'), b=D476.indexOf('\n'+(n+1)+'. **',a+3); return a<0?'':D476.slice(a,b<0?D476.indexOf('\n## B',a):b); };
const sec=n=>{ const a=DOC.indexOf('\n## '+n+'.'), b=DOC.indexOf('\n## ',a+4); return a<0?'':DOC.slice(a,b<0?undefined:b); };
const D=H.D;
const tsec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const grad=(key,h,flags)=>{ const G=H.fresh(key,h==null?10:h,'dorm',Object.assign({GRADUATED:D('2029-06-02'),GRAD_DONE:true,MOVED_OUT:D('2029-06-28'),HOME_AFTER:'home',Y4_PATH:'other',PACKED_Y4:D('2029-06-01'),ROOM_Y2:true,ROOM_Y3:true,ROOM_Y4:true},flags||{}));
  G.acts={att:{}}; G.outings=[]; PG.rec(G).done.grad=1; for(const e of ['ev_grad_family','ev_grad_lunch','ev_grad_envelope','ev_y4_path','ev_move_out_y4']) G.events.done[e]=1; return G; };

(async()=>{
check('0. 讀得到企劃線 1ebcf530e 的 AA_472、AA_367',DOC.length>1000&&DOC.includes('## 3. 可昕的第六年')&&D367.includes('說好的，運河一圈。'));

/* ======================= 1. 學姊 9/7「讀書計畫你先排，我幫你看。」======================= */
await tsec(1,async()=>{ const NEW='明年。……讀書計畫你先排，我幫你看。';
  check('1. 稿：「學姊：'+NEW+'」；字卡「你自己排」不動',sec(1).includes('> 學姊：'+NEW)&&PG.CARDS_2030.some(r=>r[3]==='（考前三個禮拜。這次的讀書計畫表，你自己排。）'));
  const G=grad('2029-09-07',15.1,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.tick(); H.at('2029-09-07',15.4); H.tick();
  check('1. 2029 一試不到 12 題、學姊 FRIEND 以上：15:20 私訊「'+NEW+'」（不再是「我幫你排」）',J(H.msgs('p:heroine_05'))===J([NEW]),J(H.msgs('p:heroine_05'))); });

/* ======================= 2. 2030 第二次考的便條：一張一句 ======================= */
await tsec(2,async()=>{ const NOTE='（便條：「你比去年多念了一年。」）';
  check('2. 稿：「'+NOTE+'」',sec(2).includes('> '+NOTE));
  const G=grad('2030-08-02',20.6,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.tick(); H.at('2030-08-02',21.1); H.tick();
  check('2. 重考、學姊 FRIEND 以上（單身）：8/2 21:00 照片＋「'+NOTE+'」（沒有「早點睡。」）',J(H.msgs('p:heroine_05'))===J(['（照片：一張手寫的便條）',NOTE]),J(H.msgs('p:heroine_05')));
  const G2=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:5,BAR_STAGE_2029:'none',SIS_STORE_2029:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('2. 重考、和學姊交往中＝考場門口當面：旁白一句「'+NOTE+'」',H.has(NOTE)&&!H.said.some(x=>/早點睡。」「你比去年/.test(x.t)),J(H.lines().slice(0,3))); });

/* ======================= 3. 可昕的第六年（2030-10-17）======================= */
await tsec(3,async()=>{ const S3=sec(3);
  const OPEN='六年。……今年是你寫。', OPEN2='六年。……你想好要寫什麼了嗎？', MISS='卡片你留著。……明年一起給我。';
  const CARD=[[null,'（這一次，卡片在你的外套口袋裡。你把它推過去。）'],[null,'（她翻開第一頁，看了很久。從包包拿出一支紅筆。）'],['kexin','（圈了一個字）……這個字寫錯了。'],['kexin','留著。不要改。'],[null,'（她把卡片收進包包最裡面那一層。）']];
  check('3. 稿：地點之後兩種、卡片那一段五行、沒去的私訊',S3.includes('> 可昕：'+OPEN)&&S3.includes('> 可昕：'+OPEN2)&&S3.includes('> 可昕：'+MISS)&&CARD.every(x=>S3.includes('> '+(x[0]?'可昕：':'旁白：')+x[1])));
  check('3. 第六年的日子 2030-10-17（四）',STORY.KX_ANNIV_DAYS[6]==='2030-10-17'&&CALENDAR.dateOf(D('2030-10-17')).wd===4);
  const kx6=(key,h,fl)=>{ const G=grad(key,h,Object.assign({KX_ANNIV:{1:'wheel',2:'shop',3:'river',4:'shop',5:'river'},KX_ANNIV_PLACE_5:'river',K7_GIFT_5:'planner'},fl||{})); H.FRIEND('kexin'); H.date('kexin'); return G; };
  const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
  { const G=kx6('2030-10-10',20.9); rules(); const a=!!OUT.get(G,'kx_anniv6'); H.at('2030-10-10',21.05); rules(); const q=OUT.get(G,'kx_anniv6');
    check('3. 交往中、第五年有演到：10/10 21:00 起排第六年（地點照第五年＝河堤、18:30、同一個事件 year 6）；21:00 以前不排',!a&&!!q&&q.day===D('2030-10-17')&&q.h===18.5&&q.year===6&&q.ev==='ev_kexin_anniversary_yn'&&q.ap==='river'&&G.flags.KX_ANNIV_PLACE_6==='river',J(q));
    const an=(G.msgs||[]).concat(PHONE.rec(G).q).filter(m=>/^kx_anniv/.test(m.tag||''));
    check('3. 稿上沒有前一週的邀約：不傳（沒有週年的私訊）',!an.length,J(an)); }
  { const G=kx6('2030-10-10',21.05,{KX_ANNIV_PLACE_6:'wheel'}); rules(); const q=OUT.get(G,'kx_anniv6'); check('3. 有 KX_ANNIV_PLACE_6 的照它（摩天輪）',!!q&&q.ap==='wheel',J(q)); }
  for(const [why,fl] of [['第五年沒去（missed）',{KX_ANNIV:{5:'missed'}}],['沒有第五年',{KX_ANNIV:{4:'shop'}}]]){ const G=kx6('2030-10-10',21.05,fl); rules(); check('3. '+why+'：沒有第六年',!OUT.get(G,'kx_anniv6')&&!G.flags.KX_ANNIV_PLACE_6); }
  { const G=grad('2030-10-10',21.05,{KX_ANNIV:{5:'river'},KX_ANNIV_PLACE_5:'river'}); H.FRIEND('kexin'); rules(); check('3. 沒有在交往：沒有第六年',!OUT.get(G,'kx_anniv6')); }
  { const G=kx6('2030-10-10',21.05,{EXCHANGE_ROUTE:'JP'}); rules(); check('3. 交換延畢（日本路線）也一樣',!!OUT.get(G,'kx_anniv6')); }
  const play=async(fl,gift)=>{ const G=kx6('2030-10-10',21.05,fl); rules(); if(gift) G.flags.K7_GIFT_6=gift; const q=OUT.get(G,'kx_anniv6'); H.at('2030-10-17',18); H.said=[]; H.opts=[]; H.picks=[]; if(q) await OUT.go(GM,q); return {G,q,L:H.said.map(x=>[x.who===null?null:(x.who===SOCIAL.displayName('kexin')?'kexin':x.who),x.t]),O:H.opts.slice()}; };
  { const r=await play({}), T=r.L.map(x=>x[1]), i=T.indexOf(OPEN), g=T.indexOf('你人來了就好。'), c=T.indexOf(CARD[0][1]);
    check('3. 地點之後「'+OPEN+'」→ 禮物（沒準備＝「你人來了就好。」）→ 卡片那一段五行（照順序、說話的人照稿）',i>=0&&g>i&&c>g&&J(r.L.slice(c,c+5))===J(CARD),J(r.L));
    check('3. 卡片那一段：不出「（她把卡片推過來）」、不出第二～五年的卡片句、不出「後面幾頁，她說：『回去再看。』」、沒有選項',!T.includes('（她把卡片推過來）')&&!T.some(t=>/把卡片翻到第一頁/.test(t))&&!T.includes('後面幾頁，她說：『回去再看。』')&&!r.O.length&&T[T.length-1]===CARD[4][1],J([T.slice(-3),r.O]));
    check('3. 數值、旗標照第二～五年：KX_ANNIV {6:地點}、暫存旗標清掉',r.G.flags.KX_ANNIV[6]==='river'&&r.G.flags._kxAY==null&&r.G.flags.K7_GIFT_6==='none'); }
  { const r=await play({KX_ANNIV5_WHAT:true}), T=r.L.map(x=>x[1]); check('3. 第五年選了「寫什麼？」的：地點之後「'+OPEN2+'」',T.includes(OPEN2)&&!T.includes(OPEN),J(T.slice(0,3))); }
  { const r=await play({},'ticket'), T=r.L.map(x=>x[1]); check('3. 禮物照第二～五年那一組（票根：她的反應照現在）、接卡片那一段',T.includes('（她把票根翻到背面，看了那個日期很久。）')&&T.indexOf('（她把票根翻到背面，看了那個日期很久。）')<T.indexOf(CARD[0][1]),J(T)); }
  /* 第五年選了「寫什麼？」才記 KX_ANNIV5_WHAT（第六年地點之後那一句用）*/
  for(const [k,want] of [[1,true],[0,false],[2,false]]){ const G=grad('2029-10-17',18,{KX_ANNIV:{4:'shop'},KX_ANNIV_PLACE_5:'river'}); H.FRIEND('kexin'); H.date('kexin');
    OUT.plan(G,{id:'kx_anniv5',ev:'ev_kexin_anniversary_yn',day:D('2029-10-17'),h:18.5,year:5,ap:'river',place:'河堤',title:'週年：河堤',travel:'騎車約 15 分鐘',travelH:0.25}); H.said=[]; H.picks=[k]; await OUT.go(GM,OUT.get(G,'kx_anniv5'));
    check('3. 第五年選「'+['好。','寫什麼？','（把卡片收進外套口袋）'][k]+'」：KX_ANNIV5_WHAT '+want,!!G.flags.KX_ANNIV5_WHAT===want&&G.flags.KX_ANNIV[5]==='river'); }
  /* 沒去（過了時間）*/
  { const G=kx6('2030-10-10',21.05); rules(); const q=OUT.get(G,'kx_anniv6'); H.at('2030-10-17',19.6); for(const x of OUT.expire(G)) OUT.onMissed(GM,x); H.at('2030-10-17',22.05); PHONE.tick(G); H.at('2030-10-18',12.2); rules();
    const an=(G.msgs||[]).filter(m=>/^kx_anniv/.test(m.tag||'')).map(m=>m.text);
    check('3. 沒去：KX_ANNIV[6] missed；22:00 她私訊「'+MISS+'」（週年的私訊只有這一則）',q.state==='missed'&&G.flags.KX_ANNIV[6]==='missed'&&J(an)===J([MISS])&&(m=>!!m&&m.th==='p:kexin'&&m.day===D('2030-10-17')&&m.h>=22&&m.h<22.25)(G.msgs.find(m=>m.text===MISS)),J(an));
    check('3. 沒去：沒有 21:00 的電話（卡片我寫好了）、沒有隔天卡片的照片；之後當面也不給卡片（卡片在你手上）',!OUT.get(G,'kx_anniv_call6')&&!H.msgs('p:kexin').includes('週年快樂。下次你準備。')&&(typeof ROM1016==='undefined'||!ROM1016.cardDue||ROM1016.cardDue(G)!==6)); }
  /* 畢業後篇跳到下一件事：還沒排的時候也停在該問「出發」的時間（長跳每 6 小時看一次）*/
  { const G=kx6('2030-08-05',10,{FIRST_DAY_SEEN:true}); PG.rec(G).done.first=1; let from=null, i=0;
    for(;i<6&&!OUT.due(G);i++){ E.player.busy=false; from=G.day; if(!await PG.advance(GM)) break; }   /* 測試存檔的其他一次性訊息會先停一下，照樣跳 */
    const due=OUT.due(G);
    check('3. 8/5 跳到下一件事（60 天以上的長跳，每 6 小時看一次）：停在 10/17 該出發的時間（18:00，車程 15 分鐘），第六年已經排好、問「出發」；沒有這個停點會直接跳到 2034 尾聲',D('2030-10-17')-from>=60&&G.day===D('2030-10-17')&&Math.abs(G.hour-18)<1e-6&&!!due&&due.id==='kx_anniv6',J([from,G.day,G.hour,due&&due.id,i])); } });

/* ======================= 4. 芷若 6/2 視訊兩句：改回原句（AA_476 A-1）======================= */
await tsec(4,async()=>{ const V=['這裡凌晨三點。……學士服是不是借太大件？','再一個多小時這裡就天亮了。你們拍完我再睡。'], NO=['這裡早上五點。……學士服是不是借太大件？','天已經亮了。你們拍完我再睡。'];
  check('4. 稿：AA_476 A-1 改回原句（林芷若兩句）、AA_472 第 4 節作廢、視訊不搬到 12:00',V.every(t=>a476(1).includes('> 林芷若：'+t))&&/作廢/.test(a476(1))&&/不搬到 12:00/.test(a476(1)),a476(1).slice(0,80));
  const G=H.fresh('2029-06-01',22.4,'dorm'); H.FRIEND('heroine_02'); H.date('heroine_02'); H.at('2029-06-02',8); await STORY.gradFamily(GM);
  const said=H.said.filter(x=>x.who===SOCIAL.datingName('heroine_02')||x.who===SOCIAL.displayName('heroine_02')).map(x=>x.t), vi=H.said.findIndex(x=>x.t===V[0]), ce=H.said.findIndex(x=>x.t==='（撥穗。帽子上的穗從右邊換到左邊，只有一秒。）');
  check('4. 交往中、她在英國：家人那一段 10:30（撥穗以前）的視訊是原句兩句；「早上五點」那一版不出現',V.every(t=>said.includes(t))&&!NO.some(t=>H.has(t))&&said.indexOf(V[0])<said.indexOf(V[1])&&vi>=0&&vi<ce,J(said));
  H.said=[]; await H.run('grad'); check('4. 拍照那一段不再視訊一次（「我設了鬧鐘。」那一晚照舊）',!V.some(t=>H.has(t))&&POSTGRAD_LINES.PARTNER.heroine_02.eve==='我設了鬧鐘。'); });

/* ======================= 5. 學姊交往中，2030 第二次考的考場那一句 ======================= */
await tsec(5,async()=>{ const L29='我在對面的便利商店等。考完先傳訊息。', L30='同一家便利商店。……我坐去年那個位子。';
  check('5. 稿：2030「書瑀：'+L30+'」、2029 照舊',sec(5).includes('> 書瑀：'+L30)&&sec(5).includes('> 書瑀：'+L29));
  /* 2029 和學姊交往中、一試考了、沒過；2030 再考 */
  const G=grad('2029-08-04',8,{BAR_REG:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2029');
  check('5. 2029-08-04：「'+L29+'」照舊、記 SIS_STORE_2029',H.has(L29)&&!H.has(L30)&&G.flags.SIS_STORE_2029===true);
  G.flags.BAR_SCORE_2029=3; G.flags.BAR_STAGE_2029='none'; H.at('2030-08-03',8); H.said=[]; H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 2030-08-03（第二次考）：「'+L30+'」（說話的人是書瑀）',H.said.some(x=>x.t===L30&&x.who===SOCIAL.datingName('heroine_05'))&&!H.has(L29),J(H.lines().slice(0,4)));
  /* 舊存檔：2029 考過、沒有 SIS_STORE_2029，這一段交往從 2029-08-04 以前就開始 */
  const G2=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:3,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.date('heroine_05'); G2.flags.romance.heroine_05.sinceDay=D('2028-12-01'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 舊存檔（沒有 SIS_STORE_2029、2028 就在交往）：2030 也換句',H.has(L30)&&!H.has(L29));
  /* 2029 一試以後才交往的（去年她沒在便利商店等）：照原句 */
  const G3=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:3,BAR_STAGE_2029:'none'}); H.FRIEND('heroine_05'); H.date('heroine_05'); G3.flags.romance.heroine_05.sinceDay=D('2029-11-01'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 2029 一試以後才交往：2030 照原句「'+L29+'」',H.has(L29)&&!H.has(L30));
  const G4=grad('2030-08-03',8,{BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:3,BAR_STAGE_2029:'none',SIS_STORE_2029:false}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 2029 那天沒有說（SIS_STORE_2029 false）：照原句',H.has(L29)&&!H.has(L30));
  /* 交換延畢（2030 第一次考）：照原句 */
  const G5=grad('2030-08-03',8,{EXCHANGE_ROUTE:'JP',BAR_REG_2030:true}); H.FRIEND('heroine_05'); H.date('heroine_05'); H.picks=new Array(20).fill(0); await H.run('exam_2030');
  check('5. 交換延畢（第一次考）：照原句',H.has(L29)&&!H.has(L30)&&!G5.flags.SIS_STORE_2029); });

/* ======================= 6. 沛珊 2030-06：運河一圈 ======================= */
await tsec(6,async()=>{ const NEW='說好的，運河一圈。……下學期就大四了，我開始寫教檢的考古題。你以前也是這樣嗎？';
  check('6. 稿：AA_472「郭沛珊：'+NEW+'」、AA_367（1ebcf530e）2030-06 那一格（台南）',sec(6).includes('> 郭沛珊：'+NEW)&&D367.includes('| 2030-06 | 「'+NEW+'」（台南） |'));
  const row=(PG_DATES.six.classmate_peishan||[]).find(x=>x.ym==='2030-06'), ev=STORY_EVENTS.find(e=>e.id==='ev_pg_date_classmate_peishan_2030-06'), ln=ev&&ev.dialogue.find(l=>l.speaker==='classmate_peishan');
  check('6. pg_dates.js（重新匯入）與那一格的事件：2030-06 那一句、台南',!!row&&row.line===NEW&&row.note==='台南'&&!!ln&&ln.text===NEW,J([row,ln&&ln.text]));
  check('6. 2030-04 視訊那一句照舊（「下次你來，我們走一圈好不好？」）',((PG_DATES.six.classmate_peishan||[]).find(x=>x.ym==='2030-04')||{}).line==='運河那邊晚上很漂亮！下次你來，我們走一圈好不好？');
  check('6. 匯入來源：AA_367@1ebcf530（白名單同一版）',/AA_367.*@1ebcf530/.test(PG_DATES.source.AA_367)&&JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')).files.some(e=>e.path==='docs/story_planning/AA_367_畢業以後的交往節奏_六位.md'&&e.sha==='1ebcf530'&&e.status==='approved')); });

H.done();
})();
// 修改前（243db0938，開工檢查點＝開發分支 129540766＋AA_470）：FAILED 20（第 1 節 1、第 2 節 2、第 3 節 11（中途沒有第六年的出遊丟例外）、第 4 節 1、第 5 節 3、第 6 節 2）；改完 ALL PASS。
