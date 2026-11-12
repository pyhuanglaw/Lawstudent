// 新店打工第一批（AA_828，企劃線 be3b9c9e4；任務 SHOP-JOBS-1112，USER_WANTS X356：使用者 11-12「不是還要可以打工嗎」）：山嵐書店、南洋戲院——不需要瀏覽器（D131）。
// src/data/shop_jobs_aa828.js（tools/story/import_shop_jobs_aa828.py 產生）＋src/jobs3d.js（JOBS：shanlan、cinema）＋src/nanyang_sys3d.js、src/aa614_3d.js、src/invites3d.js、src/bgnight3d.js、src/shopnpc3d.js
//   0  載得到；白名單；匯入工具 --check；資料的每一句都在稿上（一字不差；讀不到稿＝只跳過那一項）；index.html 的順序
//   1  什麼時候起：山嵐＝大一上第 4 週、南洋＝大一下；經濟系那一年沒有；告示的按鈕「看告示」
//   2  山嵐的應徵：告示 →「問店員。」「再想想。」→ 店長（來過 3 次以上／不到）→ 班表（週三 18:00～22:00、週日 14:00～18:00）→ 從下週一起；「再想想。」那一句
//   3  山嵐的一班：三段（新手／熟練）、小選擇、最後一句（晚班／假日班各自輪流）、784、晚班下班直接在店門口外面
//   4  南洋的應徵、班表（週五 18:00～22:00、週六 13:00～17:00）、一班、最後一句輪流
//   5  一週最多兩班（和其他打工合計）；出門提醒帶到那一間店；辭職照現有那一句
//   6  員工票：滿 3 班才有、不用錢、一週一次、不能帶人；看完多一句、兩部都記看過（和買票一樣）；約會照買票
//   7  週五晚場那一天的桌遊夜：只有「這次不行。」、明軒照舊回、不排出遊；先答應了的取消；沒排班的那一天照舊
//   8  Alison 上班遇到他改說一句（一次）
//   9  舊存檔（沒有這兩份工作、沒有 G.jobs）照常讀；存檔 JSON 來回不壞
//   10 AA_828 第 4 節（AA 回七問，企劃線 b84e779563；2026-11-12）：南洋也從下週開始；辭職以後隔一個學期可以再應徵；寒暑假不排班、開學自動恢復、沒有放假私訊；
//      便利商店週五夜班也蓋到桌遊夜；拿員工票售票員多一句；山嵐上班遇到宋知寧（有／沒有 SHOP_ZN_MET 兩種、一次、只到大二下）
//   11 AA_828 第 5 節（AA 回第二輪，企劃線 d8afcca6ed；2026-11-12）：宋知寧的班＝週日 14～18（週三晚班她不在）；有 SHOP_ZN_MET 分「傳過第 5 則／還沒傳」兩種；桌遊夜有班祐廷自動回、明軒照舊回；
//      全部打工辭職後隔一個學期可以再應徵、熟練度保留；（越好吃上班時同學來吃飯在 tests/shop_jobs_aa829_1112_unit.js 第 10 節）
//      舊期望（b84e779563）：宋知寧「祐廷的班她都在」（暫定）、認識過只有一種、桌遊夜沒空沒有多的訊息、只有山嵐和南洋可以再應徵、再應徵熟練度從 0 算——都照第 5 節改了（各項註明）。
//   12 AA_828 第 6、7 節（企劃線 1d6055568c；2026-11-12）：宋知寧第 5 則以後才在山嵐（認識過的）／大一下起（沒認識過的）、「還沒傳第 5 則」那一版作廢（第 3、10 節各項註明）；員工票班數保留（第 10 節）；
//      家教停了以後隔一個學期明軒再問一次（第 12 節）。她搬到山嵐、舊存檔補發第 5 則在 tests/shop_enc_zn_shanlan_1112_unit.js、tests/shop_enc_zn_stand_1112_unit.js；可昕、學姊在 tests/shop_jobs_aa829_1112_unit.js 第 10 節。
//   舊期望（be3b9c9e4）：南洋當週開始；桌遊夜沒空時玩家只有「這次不行。」可以回、明軒回一句；拿員工票沒有字；第一班沒有宋知寧——都照第 4 節改了（各項註明）。
// 修改前（開發分支 5852b69ebd）：沒有 src/data/shop_jobs_aa828.js、JOBS 沒有 shanlan／cinema——FAIL。用法：node tests/shop_jobs_aa828_1112_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, MX='classmate_mingxuan', J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/data/she_pays.js','src/date3d.js',
  'src/data/termend_lines.js','src/data/termend_opts.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
const toasts=[]; GM.toast=t=>{ toasts.push(t); }; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd), key=d=>CALENDAR.dateOf(d).key;
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(key(d),h,zone||'dorm',flags); toasts.length=0; return G; };
const said=t=>H.said.some(s=>s.t===t), saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w), L=()=>H.lines();
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
const ZONE={shanlan:'xs_shanlan',cinema:'xs_nanyang'};
const shift=async(k,d,picks)=>{ const h0=JOBS.hrs(k,d)[0]; at(d,h0-0.1,ZONE[k]); H.said=[]; H.opts=[]; H.entered=[]; H.picks=(picks||[]).slice(); toasts.length=0; const m0=H.G.money; await JOBS.runShift(GM,k); return H.G.money-m0; };
const msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th);
const answer=(tag,i)=>{ const m=(H.G.msgs||[]).find(x=>x.tag===tag&&x.ask); if(!m) return false; return PHONE.answer(H.G,m.ask.id,i)!=null; };
const tick=()=>{ for(let i=0;i<3;i++){ STORY.phoneRules(GM); PHONE.tick(H.G); } };
const noGift=O=>O.filter(t=>!/買禮物/.test(t));   /* 售票口的買禮物（GIFT-HOLIDAY-1110）那一項看日子有沒有：不在這裡比 */
const DOC='docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md', SHA='3e9cd7d9d4'/* 舊期望 1e539b8eb9：第 1～8 節一樣，多第 9 節（第六輪）*/, NEW8='新來的？二樓我比較熟，找不到可以問我。';   /* NEW8＝稿上還在（第 4、6 節）、第 8 節說不演的那一句：只用來對稿，遊戲的資料沒有。舊：1d6055568c（第 1～7 節一樣；多第 8 節）、d8afcca6ed（第 1～5 節一樣；多第 6、7 節）、b84e779563（第 1～4 節一樣；多第 5 節）、be3b9c9e4（第 1～3 節一樣；多第 4 節）*/
const D8=typeof SHOP_JOBS_AA828!=='undefined'?SHOP_JOBS_AA828:null, has=typeof JOBS!=='undefined'&&!!D8&&JOBS.KEYS.includes('shanlan')&&JOBS.KEYS.includes('cinema');

(async()=>{
await sec(0,async()=>{
  check('0. 載得到：SHOP_JOBS_AA828；JOBS 有 shanlan、cinema；區域 xs_shanlan、xs_nanyang',has&&JOBS.ZONE_KEY.xs_shanlan==='shanlan'&&JOBS.ZONE_KEY.xs_nanyang==='cinema',J(typeof JOBS!=='undefined'?JOBS.KEYS:null));
  const a=ORDER.indexOf('src/data/wz_jobs.js'), b=ORDER.indexOf('src/data/shop_jobs_aa828.js'), c=ORDER.indexOf('src/jobs3d.js');
  check('0. index.html：shop_jobs_aa828.js 在 jobs3d.js 之前（jobs3d.js 載入時就要讀得到；wz_jobs.js、jobs3d.js 照舊相鄰，tests/aa420_jobs_unit.js）',b>=0&&c>b&&c===a+1,J([a,b,c]));
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===DOC);
  check('0. 白名單：AA_828@'+SHA+' approved（一筆）',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy,J(e));
  check('0. 資料寫明來源那一版',!!D8&&D8.src===DOC+'@'+SHA,D8&&D8.src);
  let ck=''; try{ ck=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_shop_jobs_aa828.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(err){ ck='ERR '+String(err.stderr||err.message||err).slice(0,300); }
  if(/讀不到|fatal|invalid object|CalledProcessError/i.test(ck)) console.log('（跳過：匯入工具讀不到 '+SHA+'，企劃線沒 fetch）'); else check('0. tools/story/import_shop_jobs_aa828.py --check：資料和稿一致',/^OK/.test(ck),ck);
  let doc=null; try{ doc=cp.execFileSync('git',['-C',H.ROOT,'show',SHA+':'+DOC],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ doc=null; }
  if(!doc||!D8){ console.log('（跳過：讀不到稿 '+SHA+'，逐句對稿這一項沒有跑）'); return; }
  /* 每一句都要在稿上：有名字說的話＝稿上的「…」；旁白、選項、告示＝原樣 */
  const miss=[]; let n=0; const inDoc=(t,q)=>{ n++; if(!doc.includes(q?'「'+t+'」':t)) miss.push(t); };
  for(const k of ['shanlan','cinema']){ const A=D8.jobs[k];
    inDoc(A.notice,true); inDoc(A.askOpt); inDoc(A.laterOpt); inDoc(A.ask,true); inDoc(A.later,true); if(A.many){ inDoc(A.many,true); inDoc(A.few,true); }
    for(const g of A.segs){ inDoc('| '+g.name+' | '+g.nov+' | '+g.exp+' | '); for(const c of g.ch) inDoc(c[0]+'→'+c[1]); }
    for(const w in A.end) for(const t of A.end[w]) inDoc(t);
    if(!doc.includes('四小時 '+A.pay+' 元')) miss.push('薪水 '+A.pay); }
  inDoc(D8.jobs.cinema.ticket.opt,true); inDoc(D8.jobs.cinema.ticket.line); inDoc(D8.jobs.cinema.alison,true);
  { const T=D8.jobs.cinema.ticket.take, C=D8.jobs.shanlan.co;   /* 第 4 節第 6、7 點 */
    inDoc('拿員工票多一句：'+T[0]+'：「'+T[1]+'」');
    inDoc('有 '+C.flag+'（在別的地方認識過她）→ '+C.who+'：'+C.met.map(x=>x[0]?'「'+x[1]+'」':x[1]).join('')+'／沒有 '+C.flag+' → '+C.who+'：「'+NEW8+'」她的學期只到'+C.until+'，之後不出。');
    inDoc(C.seg+'那一段後面多一句（一次）');
    check('0. 第 4 節第 6 點：售票員「員工票。站最後面，不要擋到走道。」',J(T)===J(['售票員','員工票。站最後面，不要擋到走道。']),J(T));
    check('0. 第 4 節第 7 點：宋知寧——認識過三句（中間一句旁白）；不認識的那一句不匯（第 8 節第 2 點「那一版不演」——舊期望 1d6055568c：new 一句「新來的？…」）；上架那一段後面；看 SHOP_ZN_MET；到大二下',C.who==='宋知寧'&&C.seg==='上架'&&C.flag==='SHOP_ZN_MET'&&C.until==='大二下'&&J(C.met)===J([['宋知寧','……又是你。'],[null,'（她抱著一疊書，看了你的名牌一眼。）'],['宋知寧','我上次說的另一家，就是這裡。二樓的書我比較熟，找不到就問我。']])&&C.new===undefined,J(C)); }
  { const C=D8.jobs.shanlan.co, B=D8.bgnBusy||{}, Y=D8.yueMeal||{done:{},own:{}}, tx=L=>(L||[]).map(x=>x[0]?'「'+x[1]+'」':x[1]).join('');   /* 第 5 節第 1、2、4、5、6 點 */
    /* 第 5 節第 1、2 點被第 6 節取代（1d6055568c）：她的班、兩版讀第 6 節；「還沒傳第 5 則」那一版作廢、資料不再有 metEarly */
    inDoc('**第 '+C.msgN+' 則訊息發了以後，她週六 14:00～17:00 搬到山嵐**'); inDoc('**第 '+C.msgN+' 則以後她週日 14:00～18:00 也在山嵐**');
    inDoc('完全沒認識過她（沒有 '+C.flag+'）＝她從大一下起就在山嵐（週六、週日），出「'+NEW8+'」');   /* 稿上第 6 節第 3 點的字還在；第 8 節第 1 點作廢＝資料不再有 new／newFrom */ inDoc('補發第 '+C.msgN+' 則');
    /* 第 7 節五個小問題 */
    inDoc('私訊約的桌遊夜撞到班：一樣自動回「'+B.me+'」'); inDoc('**交往中**才把'+((Y.dating||{}).who)+'排進越好吃晚餐的名單'); inDoc('一學期最多兩次');
    inDoc('學姊例外，她說：「'+Y.own['學姊']+'」'); inDoc('舊打工全部比照再應徵（六間店＋補習班、事務所、家教）'); inDoc('再應徵以後不用重新滿 '+D8.jobs.cinema.ticket.after+' 班（做過的保留）');
    inDoc('群組裡祐廷自動回一句「'+B.me+'」，'+B.who+'照舊回「'+B.re+'」');
    inDoc('**全部打工比照**'); inDoc('熟練度**保留**');
    inDoc('改這一組通用的（每人一次）：'+Y.narr+'對方：「'+Y.ask+'」→ 祐廷：「'+Y.me+'」→'+Y.done.m+'「他」照對方性別換成他／她。');
    inDoc('只出旁白「'+Y.done.m+'」，不再問'); inDoc('阿哲：「'+Y.own['阿哲']+'」／可昕：「'+Y.own['可昕']+'」；其他人共用「'+Y.ask+'」');
    check('0. 第 6 節：第 5 則以後她在山嵐＝週六 14～17、週日 14～18；祐廷遇到她的那一班＝週日；沒認識過她的＝不出現在山嵐（資料沒有 new／newFrom——舊期望 1d6055568c：newFrom 大一下、new 一句；AA_828 第 8 節第 1、2 點作廢）；「還沒傳第 5 則」那一版作廢（資料沒有 metEarly——舊期望 d8afcca6ed：有三句）',C.wd===7&&C.t0===14&&C.t1===18&&C.msgN===5&&J(C.at)===J([{wd:6,t0:14,t1:17},{wd:7,t0:14,t1:18}])&&C.newFrom===undefined&&C.new===undefined&&C.metEarly===undefined&&!fs.readFileSync(path.join(H.ROOT,'src/data/shop_jobs_aa828.js'),'utf8').includes('metEarly'),J(C));
    check('0. 第 7 節：私訊約也自動回（bgnBusy.dm）、可昕交往中才排進越好吃晚餐一學期最多兩次（yueMeal.dating）、學姊「你在這裡。幾點下班？」、家教也比照再應徵（reapply.tutor）、員工票班數保留（ticket.keep）',D8.bgnBusy.dm===true&&J(D8.yueMeal.dating)===J({who:'可昕',slot:'dinner',termMax:2})&&D8.yueMeal.own['學姊']==='你在這裡。幾點下班？'&&D8.reapply.tutor===true&&D8.jobs.cinema.ticket.keep===true,J([D8.bgnBusy,D8.yueMeal,D8.reapply,D8.jobs.cinema.ticket]));
    check('0. 第 5 節第 4、5 點：桌遊夜「這次不行，我有班。」／明軒「好，兩個禮拜後還有。」（和 BGN 原本那一句一樣）；再應徵全部比照、熟練度保留；家教回「不了」以後不再問（第 8 節第 5 點：tutorAskOnce、tutorNo——舊期望 1d6055568c：reapply 只有 all、keepSkill、tutor）；第 9 節第 2、3 點多 tutorBack（舊期望 1e539b8eb9：沒有 tutorBack——稿多了第 9 節）',J(D8.bgnBusy)===J({me:'這次不行，我有班。',who:'明軒',re:'好，兩個禮拜後還有。',dm:true})&&D8.bgnBusy.re===BGN.LINES.no&&J(D8.reapply)===J({all:true,keepSkill:true,tutor:true,tutorAskOnce:true,tutorNo:'不了',tutorBack:{opt:'我現在可以接家教了。',re:'好，剛好還有一個學生。時間我傳給你。',expired:true}}),J([D8.bgnBusy,D8.reapply]));
    check('0. 第 5 節第 6 點：越好吃上班版——旁白、「你在這裡打工喔？」、祐廷「對。要吃什麼？」、「（你幫他／她點了餐。）」；阿哲、可昕各一句；第 9 節第 1 點多 sis（舊期望 1e539b8eb9：沒有 sis——稿多了第 9 節）',J(D8.yueMeal)===J({narr:'（門口的鈴響了。進來的人看到你穿著圍裙，停了一下。）',ask:'你在這裡打工喔？',me:'對。要吃什麼？',done:{m:'（你幫他點了餐。）',f:'（你幫她點了餐。）'},own:{'阿哲':'欸！你在這裡打工？那我可以多加肉嗎？','可昕':'你在這裡打工？……排幾點到幾點？','學姊':'你在這裡。幾點下班？'},dating:{who:'可昕',slot:'dinner',termMax:2},sis:{who:'學姊',met:'met_sis',inTaiwan:true,slot:'dinner',termMax:1,datingMax:2,gapWeeks:3}}),J(D8.yueMeal)); }
  check('0. 逐句對稿：'+n+' 句都在 AA_828@'+SHA+' 上（一字不差）',n===58&&miss.length===0,n+' '+J(miss));   /* 舊：50（第 5 節第 1、2 點兩處換成第 6 節四處、多第 7 節六處）、42（多第 5 節八處）、39（多第 4 節三處）*/
  /* 反過來：稿上兩節的旁白（…）和「…」選項，遊戲資料都有（沒有漏句）*/
  const body=doc.slice(doc.indexOf('## 1. 山嵐書店'),doc.indexOf('## 3. 給 LAWWW')), all=J(D8.jobs), lost=[];
  for(const row of body.split('\n').filter(l=>/^\| /.test(l)&&!/^\| (段|---)/.test(l))) for(const m of row.matchAll(/（[^（）]+?。）|「[^「」]+?。」/g)) if(!all.includes(J(m[0]).slice(1,-1))) lost.push(m[0]);
  for(const l of body.split('\n').filter(l=>/最後一句旁白（輪流）/.test(l))) for(const m of l.split('：').slice(1).join('：').split('／')) if(!all.includes(m.trim())) lost.push(m);
  check('0. 稿上的三段工作表、最後一句旁白沒有漏句',lost.length===0,J(lost)); });
if(!has){ console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0); }
const S8=D8.jobs.shanlan, C8=D8.jobs.cinema;

await sec(1,async()=>{ const w3=TD('Y1S1',3,5), w4=TD('Y1S1',4,1);
  fresh(w3,15,'xs_shanlan'); H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_shanlan');
  check('1. 山嵐：大一上第 3 週還沒有告示（按鈕藏起來）',!!it&&it.hidden===true&&!JOBS.eligible(H.G,'shanlan'));
  at(w4,15); check('1. 山嵐：大一上第 4 週週一起有；按鈕「看告示」、在一樓',it.hidden===false&&it.label==='看告示'&&it.lv===0&&JOBS.eligible(H.G,'shanlan'),it.label);
  const y1s2=CALENDAR.termDays('Y1S2').from; fresh(y1s2-1,15,'xs_nanyang'); H.E.interactables=[]; const it2=JOBS.addDesk(GM,'xs_nanyang');
  check('1. 南洋：大一上（寒假最後一天）沒有',!!it2&&it2.hidden===true);
  at(TD('Y1S1',10,3),15); check('1. 南洋：大一上第 10 週沒有（山嵐那時候有）',it2.hidden===true&&JOBS.eligible(H.G,'shanlan')&&!JOBS.eligible(H.G,'cinema'));
  at(y1s2,15); check('1. 南洋：大一下第一天起有；按鈕「看告示」',it2.hidden===false&&it2.label==='看告示');
  H.G.stage='econ'; check('1. 經濟系那一年：兩間都沒有',it2.hidden===true&&!JOBS.eligible(H.G,'shanlan')); H.G.stage='law';
  check('1. 告示的位置不在別的按鈕上：山嵐離「結帳」(3.85, 2.4)、南洋離「買票」(−2.6, −2.8) 都超過 1.5 m',Math.hypot(it.x-3.85,it.z-2.4)>1.5&&Math.hypot(it2.x+2.6,it2.z+2.8)>1.5,J([it.x,it.z,it2.x,it2.z])); });

await sec(2,async()=>{ const d0=TD('Y1S1',5,2); fresh(d0,15,'xs_shanlan'); H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_shanlan');
  H.picks=['「再想想。」']; await STORY.interact(it,GM);
  check('2. 看告示：告示的字、兩個選項「問店員。」「再想想。」',H.said[0].who===null&&H.said[0].t===S8.notice&&S8.notice==='徵門市工讀　晚班、假日班　喜歡書的優先，不喜歡也可以'&&J(H.opts[0])===J(['「問店員。」','「再想想。」']),J(L())+J(H.opts));
  check('2. 「再想想。」＝店長「好，告示會貼到找到人為止。」；沒有應徵、告示還在',saidBy('店長','好，告示會貼到找到人為止。')&&!JOBS.job(H.G,'shanlan')&&it.hidden===false&&H.said.length===2,J(L()));
  H.said=[]; H.opts=[]; H.picks=['「問店員。」','週三']; await STORY.interact(it,GM);
  check('2. 「問店員。」→ 店長「你常來嗎？」→ 沒來過 3 次「沒關係，上班以後就會常來了。下禮拜可以開始嗎？」',J(L())===J([S8.notice,'店長：你常來嗎？','店長：沒關係，上班以後就會常來了。下禮拜可以開始嗎？']),J(L()));
  const j=JOBS.job(H.G,'shanlan'), mon=d0-(CALENDAR.dateOf(d0).wd-1)+7;
  check('2. 班表：週三、週日、兩天、先不要；選週三＝toast「班表：山嵐書店　週三 18:00～22:00」',J(H.opts[1])===J(['週三','週日','週三和週日','先不要'])&&!!j&&J(j.day)===J([3])&&toasts.includes('班表：山嵐書店　週三 18:00～22:00'),J(H.opts)+J(toasts));
  check('2. 下禮拜開始：這週三不上、下週三上',!!j&&j.since===mon&&!JOBS.scheduled(H.G,'shanlan',d0+1)&&JOBS.scheduled(H.G,'shanlan',mon+2),J(j&&j.since)+' '+mon);
  check('2. 應徵以後按鈕換成「找店長」',it.label==='找店長'&&it.hidden===false,it.label);
  fresh(d0,15,'dorm'); JOBS.tick(GM); for(let i=0;i<3;i++){ at(d0,15,'xinsheng'); JOBS.tick(GM); at(d0,15,'xs_shanlan'); JOBS.tick(GM); }
  check('2. 走進山嵐書店三次＝記三次（G.jobs._meta.n.shanlan）',JOBS.rec(H.G)._meta.n.shanlan===3,J(JOBS.rec(H.G)._meta.n));
  H.E.interactables=[]; const it3=JOBS.addDesk(GM,'xs_shanlan'); H.said=[]; H.opts=[]; H.picks=['「問店員。」','週三和週日']; await STORY.interact(it3,GM);
  check('2. 來過 3 次以上：店長「我有印象，你都坐二樓。下禮拜可以開始嗎？」；選兩天',saidBy('店長','我有印象，你都坐二樓。下禮拜可以開始嗎？')&&!said(S8.few)&&J(JOBS.job(H.G,'shanlan').day)===J([3,7])&&toasts.includes('班表：山嵐書店　週三 18:00～22:00、週日 14:00～18:00'),J(L())+J(toasts));
  fresh(d0,15,'xs_shanlan'); H.E.interactables=[]; const it4=JOBS.addDesk(GM,'xs_shanlan'); H.picks=['「問店員。」','先不要']; await STORY.interact(it4,GM);
  check('2. 問了、班表選「先不要」＝沒有應徵、告示還在',!JOBS.job(H.G,'shanlan')&&it4.label==='看告示'); });

await sec(3,async()=>{ const wed=TD('Y1S1',6,3), sun=TD('Y1S1',6,7); fresh(wed,17,'dorm'); hire('shanlan',[3,7]);
  check('3. 班表的時間：週三 18～22、週日 14～18',J(JOBS.hrs('shanlan',wed))===J([18,22])&&J(JOBS.hrs('shanlan',sun))===J([14,18]));
  let pay=await shift('shanlan',wed,['「先上新書平台。」','「問要不要袋子。」','「把坐地板的人身邊的書收回去。」']);
  check('3. 第一班（新手，週三晚班）：三段各一句旁白＋選了的那一句，照順序；宋知寧不在週三晚班＝沒有她那一句（AA_828 第 5 節第 1 點——舊期望 b84e779563：這一班上架後面有她一句）；沒認識過她的＝她不出現在山嵐（第 8 節第 1 點——舊期望 1d6055568c：大一下的週日起在）',J(L())===J([S8.segs[0].nov,S8.segs[0].ch[0][1],S8.segs[1].nov,S8.segs[1].ch[0][1],S8.segs[2].nov,S8.segs[2].ch[0][1],S8.end['3'][0]])&&JOBS.rec(H.G)._meta.znCo==null&&!JOBS.znCoOn(H.G,wed)&&!JOBS.znCoOn(H.G,sun)&&!JOBS.znCoOn(H.G,TD('Y1S2',3,7))&&!JOBS.znCoOn(H.G,TD('Y1S2',3,3)),J(L()));
  check('3. 小選擇的字照稿（每段兩個）',J(H.opts)===J(S8.segs.map(g=>g.ch.map(c=>c[0])))&&J(H.opts[0])===J(['「先上新書平台。」','「先上二樓法律區。」']),J(H.opts));
  check('3. 晚班最後一句「（十點。店長把燈關掉一半，你把推車推回倉庫。）」；784 元、toast「山嵐書店 薪水 784 元」；22:00 下班',said('（十點。店長把燈關掉一半，你把推車推回倉庫。）')&&pay===784&&toasts.includes('山嵐書店 薪水 784 元')&&Math.abs(H.G.hour-22)<1e-6,pay+' '+H.G.hour+J(toasts));
  check('3. 晚班做到打烊：下班直接在店門口外面（新生南路）；沒有 AA_700「我們今天要打烊了。」',J(H.entered)===J(['xinsheng'])&&H.G.zone==='xinsheng'&&!said('我們今天要打烊了。')&&(typeof XSCLOSE==='undefined'||XSCLOSE.staffToday(H.G,'xs_shanlan')),J(H.entered));
  check('3. 晚上的時段算一件；記一班、熟練 +1',CLS.slotRec(H.G).used.ev>0&&JOBS.job(H.G,'shanlan').shifts===1&&JOBS.job(H.G,'shanlan').skill===1&&JOBS.worked(H.G,'shanlan',wed));
  pay=await shift('shanlan',sun,['「先上二樓法律區。」','「先刷條碼。」','「把亂放的書歸位。」']);
  check('3. 大一上的週日班：她還不在山嵐＝沒有那一句、也不記（AA_828 第 6 節第 3 點——舊期望 d8afcca6ed：這一班就有「新來的？」）',JOBS.rec(H.G)._meta.znCo==null&&J(L().slice(0,3))===J([S8.segs[0].nov,S8.segs[0].ch[1][1],S8.segs[1].nov])&&H.said.length===7&&!H.said.some(s=>s.who==='宋知寧'||s.who==='知寧'),J(L()));
  check('3. 假日班：另一個選擇的三句；最後一句「（六點，換班的人來了。你的手上都是書的灰。）」；784；人還在店裡（沒打烊）',said(S8.segs[0].ch[1][1])&&said(S8.segs[1].ch[1][1])&&said(S8.segs[2].ch[1][1])&&said('（六點，換班的人來了。你的手上都是書的灰。）')&&!said(S8.end['3'][1])&&pay===784&&H.entered.length===0&&Math.abs(H.G.hour-18)<1e-6,J(L())+J(H.entered));
  await shift('shanlan',wed+7); check('3. 第二個晚班：最後一句輪到「（十點。最後一個坐地板的人站起來，把書放回架上，放對了。）」',said('（十點。最後一個坐地板的人站起來，把書放回架上，放對了。）')&&!said(S8.end['3'][0]));
  await shift('shanlan',sun+7); check('3. 大一上第二個週日班一樣沒有她',!H.said.some(s=>s.who==='宋知寧'||s.who==='知寧')&&H.said.length===7,J(L()));
  check('3. 第二個假日班：「（六點。你下班以後又在一樓多站了十分鐘，把剛剛上架的那本翻完。）」',said('（六點。你下班以後又在一樓多站了十分鐘，把剛剛上架的那本翻完。）'));
  check('3. 四班以後還是新手那一句（熟練 0～4）',said(S8.segs[0].nov)&&JOBS.job(H.G,'shanlan').skill===4);
  await shift('shanlan',wed+14); check('3. 第三個晚班：最後一句輪回第一句；這一班還是新手（上班時熟練 4）',said(S8.end['3'][0])&&said(S8.segs[2].nov));
  await shift('shanlan',sun+14); check('3. 熟練 5 以上：三段都換「熟練」那一句',J(L().filter((t,i)=>i%2===0).slice(0,3))===J(S8.segs.map(g=>g.exp))&&!S8.segs.some(g=>said(g.nov))&&said('（書套你十秒包一本，摺角是直的。）'),J(L())); });

await sec(4,async()=>{ const d0=TD('Y1S2',2,2); fresh(d0,15,'xs_nanyang'); H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_nanyang');
  H.picks=['「再想想。」']; await STORY.interact(it,GM);
  check('4. 看告示：告示的字、「問售票口。」「再想想。」；「再想想。」＝經理「好。想來再來，我們一直缺人。」',J(L())===J(['徵工讀　假日、週五晚上　驗票、清場、賣爆米花　可以看免費的電影（站著看）','經理：好。想來再來，我們一直缺人。'])&&J(H.opts[0])===J(['「問售票口。」','「再想想。」'])&&!JOBS.job(H.G,'cinema'),J(L())+J(H.opts));
  H.said=[]; H.opts=[]; H.picks=['「問售票口。」','週五和週六']; await STORY.interact(it,GM);
  check('4. 「問售票口。」→ 經理「假日能來嗎？考試週可以請假，先講就好。」→ 班表（週五、週六、兩天、先不要）',J(L())===J([C8.notice,'經理：假日能來嗎？考試週可以請假，先講就好。'])&&J(H.opts[1])===J(['週五','週六','週五和週六','先不要'])&&J(JOBS.job(H.G,'cinema').day)===J([5,6])&&toasts.includes('班表：南洋戲院　週五 18:00～22:00、週六 13:00～17:00'),J(L())+J(H.opts)+J(toasts));
  const fri=TD('Y1S2',2,5), sat=fri+1, mon4=d0-(CALENDAR.dateOf(d0).wd-1)+7; check('4. 和山嵐一樣下週開始（AA_828 第 4 節第 3 點；舊期望：當週的週五就上）：這週五、週六不上，下週五、週六上',JOBS.job(H.G,'cinema').since===mon4&&!JOBS.scheduled(H.G,'cinema',fri)&&!JOBS.scheduled(H.G,'cinema',sat)&&JOBS.scheduled(H.G,'cinema',fri+7)&&JOBS.scheduled(H.G,'cinema',sat+7)&&J(JOBS.hrs('cinema',fri))===J([18,22])&&J(JOBS.hrs('cinema',sat))===J([13,17]),J([JOBS.job(H.G,'cinema').since,mon4]));
  let pay=await shift('cinema',fri,['「說『左邊樓梯上去』。」','「問要不要加大。」','「先撿大的垃圾。」']);
  check('4. 週五晚場（新手）：三段＋選了的那一句＋最後一句第一句',J(L())===J([C8.segs[0].nov,'（客人往右邊走了。你又說了一次。）',C8.segs[1].nov,'（客人說要。你多鏟了一下，他說謝謝。）',C8.segs[2].nov,'（一個飲料杯還有半杯，你拿得很平。）','（下一場開演了。你站在最後一排的走道，看了十分鐘才想起來要下班。）']),J(L()));
  check('4. 784、toast「南洋戲院 薪水 784 元」；22:00 下班、人還在大廳（戲院開到 24:00）',pay===784&&toasts.includes('南洋戲院 薪水 784 元')&&Math.abs(H.G.hour-22)<1e-6&&H.entered.length===0&&H.G.zone==='xs_nanyang',pay+J(toasts)+J(H.entered));
  pay=await shift('cinema',sat,['「用手比方向。」','「先補紙桶。」','「先開燈檢查。」']);
  check('4. 週六午場：另一個選擇的三句；最後一句輪到第二句（兩個班一起輪）',said('（客人看了你的手，走對了。）')&&said('（紙桶一落一落的，拆開的時候彈了出來。）')&&said('（燈一亮，最前排還有一個人在睡。你等他自己醒。）')&&said('（你把制服背心掛回去。身上的奶油味，到家都還聞得到。）')&&pay===784&&Math.abs(H.G.hour-17)<1e-6,J(L()));
  JOBS.job(H.G,'cinema').skill=5; await shift('cinema',fri+7);
  check('4. 熟練 5 以上：三段都換「熟練」那一句',C8.segs.every(g=>said(g.exp)&&!said(g.nov))&&said('（你鏟三下剛好一桶，不多不少。）'),J(L())); });

await sec(5,async()=>{ const d0=TD('Y1S2',3,1); fresh(d0,15,'xs_nanyang'); hire('cvs',[2]); hire('shanlan',[3]);
  H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_nanyang'); H.picks=['「問售票口。」']; await STORY.interact(it,GM);
  check('5. 已經有兩班（便利商店＋山嵐）：南洋不能再排（toast「一週最多兩班（所有打工加起來）」）',!JOBS.job(H.G,'cinema')&&toasts.includes('一週最多兩班（所有打工加起來）')&&JOBS.cap(H.G,'cinema')===0,J(toasts));
  fresh(d0,15,'xs_nanyang'); hire('shanlan',[3]); H.E.interactables=[]; const it2=JOBS.addDesk(GM,'xs_nanyang'); H.opts=[]; H.picks=['「問售票口。」','週六']; await STORY.interact(it2,GM);
  check('5. 已經有一班：只能再選一天（沒有「兩天」那一項）',J(H.opts[1])===J(['週五','週六','先不要'])&&J(JOBS.job(H.G,'cinema').day)===J([6]),J(H.opts));
  { const jc=JOBS.job(H.G,'cinema'); jc.since=d0; jc.from=d0*24; }   /* 下面測出門提醒：應徵是下週開始（第 4 節第 3 點），這裡把開始日放回這一週 */
  const wed=TD('Y1S2',3,3); at(wed,17.6,'dorm'); JOBS.plan(H.G); const q=OUT.get(H.G,'job_shanlan_'+wed), E0=SHANLAN_LAYOUT.enterAt;
  check('5. 出門提醒：山嵐書店的班（18:00～22:00）、「這週請假」、帶到山嵐書店的店門內',!!q&&q.h===18&&q.title==='山嵐書店的班（18:00～22:00）'&&q.no==='這週請假'&&q.place==='新生南路・山嵐書店'&&q.goto.zone==='xs_shanlan'&&q.goto.x===E0.x&&q.goto.z===E0.z,J(q));
  const sat=TD('Y1S2',3,6); at(sat,12.6,'dorm'); JOBS.plan(H.G); const q2=OUT.get(H.G,'job_cinema_'+sat), E1=NANYANG_LAYOUT.lobby.enterAt;
  check('5. 出門提醒：南洋戲院的班（13:00～17:00）、帶到大廳',!!q2&&q2.h===13&&q2.title==='南洋戲院的班（13:00～17:00）'&&q2.goto.zone==='xs_nanyang'&&q2.goto.x===E1.x&&q2.goto.z===E1.z,J(q2));
  at(sat,12.9,'xs_nanyang'); check('5. 班的時間到、人在大廳＝可以開班（按鈕「開始上班」）',JOBS.shiftNow(H.G,'cinema')&&it2.label==='開始上班');
  at(sat+1,15,'xs_nanyang'); H.said=[]; H.opts=[]; H.picks=['（辭職）']; await STORY.interact(it2,GM);
  check('5. 找經理 →（算了）／（辭職）；辭職＝經理「有空回來看看」（現有的那一句）',it2.label==='找經理'||JOBS.job(H.G,'cinema').gone==='quit', it2.label);
  check('5. 辭職：記下來、說話的人是經理',saidBy('經理','有空回來看看')&&JOBS.job(H.G,'cinema').gone==='quit'&&J(H.opts[0])===J(['（算了）','（辭職）']),J(L())+J(H.opts)); });

await sec(6,async()=>{ const tue=TD('Y1S2',5,2); const G=fresh(tue,15,'xs_nanyang'); const j=hire('cinema',[5,6],{shifts:2,skill:2});
  check('6. 做了 2 班：沒有員工票',!JOBS.staffTicketOk(G)&&NYS.staffOpt(G)===null);
  H.opts=[]; H.picks=['不用了']; await NYS.buy(GM); check('6. 2 班：買票的選單照舊（買票　150 元／不用了）',J(noGift(H.opts[0]))===J(['買票　150 元','不用了']),J(H.opts));
  j.shifts=3; H.opts=[]; H.picks=['不用了']; await NYS.buy(GM);
  check('6. 滿 3 班：選單多「拿員工票（站著看）」（排在買票下面）',J(noGift(H.opts[0]))===J(['買票　150 元','拿員工票（站著看）','不用了'])&&C8.ticket.opt==='拿員工票（站著看）'&&C8.ticket.after===3,J(H.opts));
  G.flags.companion='heroine_02'; check('6. 不能帶人：旁邊有同行的人＝沒有這一項',!JOBS.staffTicketOk(G)&&NYS.staffOpt(G)===null); G.flags.companion=null;
  const m0=G.money; H.picks=['拿員工票']; H.said=[]; const r=await NYS.buy(GM);
  check('6. 拿員工票：不用錢、今天有票、記 NY_TICKET_STAFF、這一週拿過了；售票員一句「員工票。站最後面，不要擋到走道。」（AA_828 第 4 節第 6 點；舊期望：沒有字）',r==='staff'&&G.money===m0&&NYS.hasTicket(G)&&G.flags.NY_TICKET_STAFF===tue&&JOBS.staffTicketToday(G)&&!JOBS.staffTicketOk(G)&&J(L())===J(['售票員：員工票。站最後面，不要擋到走道。']),J([r,G.money,m0,G.flags.NY_TICKET_STAFF])+J(L()));
  check('6. 約會照買票：員工票不算買過（NYS.paidTicket 假；INV.buyTicket 照扣 150）',!NYS.paidTicket(G)&&(()=>{ const g2=JSON.parse(J(G)); const got=INV.buyTicket(null,g2,{zone:'xs_nanyang'}); return got===150&&g2.money===m0-150&&g2.flags.NY_TICKET===tue&&g2.flags.NY_TICKET_STAFF==null; })());
  at(tue,15.5,'xs_nanyang_hall'); H.said=[]; H.opts=[]; const ok=await STORY.onSeat(GM,{kind:'cinema',row:9}); const T=H.said.map(s=>s.t), SL=MOVIES.soloLines(G), bill=MOVIES.billAt(G).bill;
  check('6. 1 廳照平常那一場演（一個人看的三句＋兩部的那一幕），最後多一句「（你站在最後面看完整部。腳有一點痠。）」',T[0]===SL[0]&&T.includes(SL[2])&&T[T.length-1]==='（你站在最後面看完整部。腳有一點痠。）'&&H.said[T.length-1].who===null&&H.opts.length===0,J([ok,H.opts.length,T]));
  check('6. 和買票一樣記「看過這部」（G.flags.MOVIE_SEEN.me：這一段的兩部）',bill.length===2&&bill.every(b=>MOVIES.seenWith(G,'me',b.id))&&G.flags.NY_WATCHED===tue,J(G.flags.MOVIE_SEEN));
  /* 對照：買票的人看同一場＝記的一樣、沒有多那一句 */
  const G2=fresh(tue,15.5,'xs_nanyang_hall'); G2.flags.NY_TICKET=tue; H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:3});
  check('6. 對照（買票看）：記的看過一樣、沒有站著看那一句',J(G2.flags.MOVIE_SEEN)===J(G.flags.MOVIE_SEEN)&&!said(C8.ticket.line),J(G2.flags.MOVIE_SEEN));
  H.G=G; at(tue+3,15,'xs_nanyang'); check('6. 同一週（週五）不能再拿',!JOBS.staffTicketOk(G)&&NYS.staffOpt(G)===null);
  at(tue+6,15,'xs_nanyang'); check('6. 下週一又可以拿（一週一次）',JOBS.staffTicketOk(G)&&!NYS.hasTicket(G));
  H.picks=['買票']; H.said=[]; const r2=await NYS.buy(GM); check('6. 有員工票那一項的時候照樣可以買票（扣 150、不算員工票；買票照舊沒有台詞）',H.said.length===0&&r2==='bought'&&G.money===m0-150&&NYS.paidTicket(G)&&!JOBS.staffTicketToday(G)&&JOBS.staffTicketOk(G)===true,J([r2,G.money]));
  j.gone='quit'; at(tue+13,15); check('6. 辭職以後沒有員工票',!JOBS.staffTicketOk(G)); });

await sec(7,async()=>{ const fri=TD('Y1S1',10,5);   /* 大一上第 10 週週五＝桌遊夜（AA_618）；戲院的班用存檔直接放（測試規則本身）*/
  fresh(fri,11.9,'dorm'); H.FAMILIAR(MX); hire('cinema',[5]); at(fri,12.1); tick();
  check('7. 那一天是桌遊夜、週五晚場有班＝沒空',BGN.isNight(fri)&&JOBS.due(H.G,'cinema',fri)&&JOBS.bgnBusy(H.G,fri)&&BGN.busy(H.G,fri));
  const P=msgs('p:'+MX).map(m=>m.text), A=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('7. 明軒照樣約（那兩句照舊）；不用玩家回＝沒有可以回的選項（AA_828 第 4 節第 1 點；舊期望：只有「這次不行。」可以回、回了明軒說「好，兩個禮拜後還有。」）',J(P.slice(0,2))===J(BGN.LINES.first)&&!A&&!(H.G.msgs||[]).some(m=>m.ask&&/^bgn_inv_/.test(m.tag||'')),J(P)+J(A&&A.ask.opts.map(o=>o.t)));
  { const M=msgs('p:'+MX); check('7. 祐廷自動回「這次不行，我有班。」、明軒照舊回「好，兩個禮拜後還有。」（AA_828 第 5 節第 4 點；舊期望 b84e779563：沒有多的訊息）',M.length===4&&M[2].from==='player'&&M[2].text==='這次不行，我有班。'&&M[3].from===MX&&M[3].text===BGN.LINES.no,J(M.map(m=>m.from+':'+m.text))); }
  at(fri,19); tick();
  check('7. 系統自動當沒空：沒有排桌遊夜的出遊、之後沒有再多訊息（那四則）',J(msgs('p:'+MX).map(m=>m.text))===J(BGN.LINES.first.concat([D8.bgnBusy.me,D8.bgnBusy.re]))&&!OUT.get(H.G,'bgn_'+fri)&&H.G.flags.BGN_GO!==fri,J(msgs('p:'+MX).map(m=>m.text)));
  at(fri,17.6); JOBS.plan(H.G); check('7. 那天晚上只有戲院的班的出門提醒',!!OUT.get(H.G,'job_cinema_'+fri)&&!OUT.get(H.G,'bgn_'+fri));
  /* 在群組：群組的回覆照舊 */
  const d8=TD('Y1S1',12,5); fresh(d8,12.1,'dorm',{noodleTableDay:fri,BGN_JOIN:'night',BGN_INV_N:1}); for(const id of [MX,'zhe','yu','classmate_bohan','classmate_xinci']) H.FAMILIAR(id); PHONE.join(H.G,'noodle_team','桌遊團'); hire('cinema',[5,6]); tick();
  const Gm=msgs('g:noodle_team').filter(m=>/^bgn_inv_/.test(m.tag||'')), A8=Gm.find(m=>m.ask);
  check('7. 在群組：明軒那一句、大家的回覆照舊（Alison「我在戲院啦……幫我留一局。」）；玩家不用回（沒有選項）',Gm[0].from===MX&&Gm[0].text===BGN.LINES.group[1]&&Gm.some(m=>m.from==='yu'&&m.text==='我在戲院啦……幫我留一局。')&&!A8,J(Gm.map(m=>m.from+':'+m.text)));
  check('7. 在群組：大家回完以後，祐廷自動回、明軒照舊回（最後兩則）',Gm.length>=4&&Gm[Gm.length-2].from==='player'&&Gm[Gm.length-2].text==='這次不行，我有班。'&&Gm[Gm.length-1].from===MX&&Gm[Gm.length-1].text==='好，兩個禮拜後還有。'&&Gm.filter(m=>m.from==='player').length===1,J(Gm.map(m=>m.from+':'+m.text)));
  /* 先答應了、後來才排到班 */
  fresh(fri,12.1,'dorm'); H.FAMILIAR(MX); tick(); const A2=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('7. 沒有戲院的班：照舊「好。」／「這次不行。」',J(A2.ask.opts.map(o=>o.t))===J(['好。','這次不行。']));
  answer(A2.tag,0); tick(); const q=OUT.get(H.G,'bgn_'+fri); check('7. 答應了＝排了桌遊夜',!!q&&q.state==='planned');
  hire('cinema',[5]); at(fri,14); tick(); check('7. 之後才排到今天的晚場＝桌遊夜那一筆取消（不要兩個都演）',OUT.get(H.G,'bgn_'+fri).state==='cancelled'&&H.G.flags.BGN_GO!==fri,J(OUT.get(H.G,'bgn_'+fri)));
  /* 只排週六午場、山嵐的班：不影響 */
  fresh(fri,12.1,'dorm'); H.FAMILIAR(MX); hire('cinema',[6]); hire('shanlan',[3]); tick(); const A3=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('7. 只有週六午場（或山嵐的班）：桌遊夜照舊可以答應（祐廷沒有自動回）',!JOBS.bgnBusy(H.G,fri)&&!(H.G.msgs||[]).some(m=>m.from==='player'&&m.text===D8.bgnBusy.me)&&J(A3.ask.opts.map(o=>o.t))===J(['好。','這次不行。']));
  fresh(fri,12.1,'dorm'); hire('cinema',[5],{gone:'quit'}); check('7. 辭職了：不算沒空',!JOBS.bgnBusy(H.G,fri)); });

await sec(8,async()=>{ const fri=TD('Y1S2',5,5); const G=fresh(fri,22.2,'xs_nanyang'); H.rel('yu',20,5,5);
  check('8. 沒在戲院打工：照舊（第一次＝送爆米花那一段）',SHOPNPC.alisonCo(G)===null&&SHOPNPC.alisonPick(G)==='first');
  hire('cinema',[5]); check('8. 自己也在這裡打工：這一次改說那一句',SHOPNPC.alisonPick(G)==='co'&&J(SHOPNPC.alisonLines(G,'co'))===J([{speaker:'yu',text:'欸，你也來這裡打工喔？那爆米花我就不請你了，你自己會鏟。'}]),J(SHOPNPC.alisonLines(G,'co')));
  H.said=[]; H.opts=[]; await SHOPNPC.alison(GM);
  check('8. 演出來：只有這一句（Alison 說）、沒有選項、沒有拿到爆米花',H.said.length===1&&H.said[0].t===C8.alison&&H.said[0].who!==null&&H.opts.length===0&&!SHOPNPC.popcorn(G),J(L()));
  check('8. 只說一次：記 G.jobs.cinema.aliCo；之後照「之後再遇到」那幾句（不再送爆米花）',JOBS.job(G,'cinema').aliCo===fri&&SHOPNPC.alisonCo(G)===null&&SHOPNPC.alisonPick(G)!=='co'&&SHOPNPC.alisonPick(G)!=='first',J(SHOPNPC.alisonPick(G))); });

await sec(9,async()=>{ const d=TD('Y2S1',3,5); const G=fresh(d,12.1,'xs_nanyang'); H.FAMILIAR(MX);
  delete G.jobs; let err=''; try{ JOBS.track(G); JOBS.plan(G); JOBS.phone(G); JOBS.tick(GM); tick(); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  check('9. 舊存檔沒有 G.jobs：每一格、手機、出門提醒都不丟例外',err==='',err);
  check('9. 舊存檔：沒有這兩份工作、沒有員工票、桌遊夜不算沒空、Alison 照舊',JOBS.job(G,'shanlan')===null&&JOBS.job(G,'cinema')===null&&JOBS.at(G,'shanlan')===null&&!JOBS.staffTicketOk(G)&&JOBS.staffTicketLine(G)===null&&!JOBS.bgnBusy(G,d)&&SHOPNPC.alisonCo(G)===null&&NYS.staffOpt(G)===null);
  G.jobs={brunch:{since:d-30,from:(d-30)*24,day:[6],shifts:4,skill:4,worked:[],chk:d-1},_meta:{n:{brunch:5},asked:{}}}; err=''; try{ JOBS.track(G); JOBS.plan(G); JOBS.phone(G); JOBS.tick(GM); }catch(e){ err=String(e); }
  check('9. 舊存檔只有早午餐的班：照常（早午餐還在、新的兩份沒有、山嵐的次數從 0 算）',err===''&&JOBS.active(G,'brunch')&&!JOBS.job(G,'shanlan')&&(JOBS.rec(G)._meta.n.shanlan|0)===0&&JOBS.used(G)===1,err);
  H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_nanyang'); H.picks=['「問售票口。」','週六']; await STORY.interact(it,GM); await shift('cinema',d+1);
  const g2=JSON.parse(J(G)); check('9. 新的欄位存檔 JSON 來回不壞（G.jobs.cinema：endN、班數；沒有新的最上層欄位）',J(g2.jobs)===J(G.jobs)&&g2.jobs.cinema.shifts===1&&g2.jobs.cinema.endN.all===1&&!('shopJobs' in g2),J(g2.jobs.cinema)); });

await sec(10,async()=>{
  /* 第 2 點：便利商店週五夜班（22:00～02:00）也蓋到桌遊夜（20:00～23:30）；所有打工的班都一樣 */
  const fri=TD('Y1S1',10,5); fresh(fri,11.9,'dorm'); H.FAMILIAR(MX); hire('cvs',[5]); at(fri,12.1); tick();
  const A=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('10. 便利商店週五夜班的那一天是桌遊夜＝沒空：明軒照樣約、沒有可以回的選項、不排出遊',BGN.isNight(fri)&&JOBS.due(H.G,'cvs',fri)&&JOBS.bgnBusy(H.G,fri)&&BGN.busy(H.G,fri)&&J(msgs('p:'+MX).map(m=>m.text))===J(BGN.LINES.first.concat(['這次不行，我有班。','好，兩個禮拜後還有。']))&&!A&&!OUT.get(H.G,'bgn_'+fri),J(msgs('p:'+MX).map(m=>m.text)));
  fresh(fri,12.1,'dorm'); hire('cvs',[5],{gone:'quit'}); hire('copy',[4]); check('10. 辭掉的、別天的班不算',!JOBS.bgnBusy(H.G,fri));
  /* 第 5 點：辭職以後隔一個學期可以再應徵 */
  const q0=TD('Y1S2',5,2), y2=CALENDAR.termDays('Y2S1').from; fresh(q0,15,'xs_nanyang'); const j0=hire('cinema',[5,6],{shifts:4,skill:4,endN:{all:3},aliCo:q0-7,gone:'quit',quit:q0});
  H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_nanyang');
  check('10. 辭職的那個學期：告示看不到、不能再應徵',it.hidden===true&&!JOBS.canReapply(H.G,'cinema')&&JOBS.reapplyDay(H.G,j0)===y2,J([it.hidden,JOBS.reapplyDay(H.G,j0),y2]));
  at(y2-1,15); check('10. 暑假最後一天還看不到',it.hidden===true&&!JOBS.canReapply(H.G,'cinema'));
  at(y2,15); check('10. 下一個學期開學那一天起告示又看得到（按鈕「看告示」）',it.hidden===false&&it.label==='看告示'&&JOBS.canReapply(H.G,'cinema'),it.label);
  H.said=[]; H.opts=[]; H.picks=['「再想想。」']; await STORY.interact(it,GM);
  check('10. 再看告示、「再想想。」＝照應徵那一套（經理那一句）；還是辭職的狀態、告示還在',saidBy('經理','好。想來再來，我們一直缺人。')&&JOBS.job(H.G,'cinema').gone==='quit'&&it.hidden===false,J(L()));
  H.said=[]; H.opts=[]; H.picks=['「問售票口。」','週六']; await STORY.interact(it,GM); const j1=JOBS.job(H.G,'cinema');
  check('10. 再應徵：照原本那幾句、選班表；新的一份（班數從 0 算、沒有辭職的記號、下週開始）；按鈕換成「找經理」',J(L())===J([C8.notice,'經理：假日能來嗎？考試週可以請假，先講就好。'])&&JOBS.active(H.G,'cinema')&&j1.shifts===0&&j1.gone===null&&J(j1.day)===J([6])&&j1.re===1&&j1.since===y2-(CALENDAR.dateOf(y2).wd-1)+7&&it.label==='找經理',J(j1)+J(L()));
  check('10. 再應徵：只說一次的 Alison 那一句不重來、最後一句照舊輪；員工票不用重新滿 3 班（AA_828 第 7 節第 5 點：以前做過的 '+(j1.shiftsPrev|0)+' 班保留在 shiftsPrev——舊期望 d8afcca6ed：要重新滿 3 班）',j1.aliCo===q0-7&&J(j1.endN)===J({all:3})&&JOBS.alisonCo(H.G)===null&&j1.shiftsPrev>=3&&JOBS.staffTicketOk(H.G),J(j1));
  { const sv=j1.shiftsPrev; j1.shiftsPrev=2; const a=JOBS.staffTicketOk(H.G); j1.shifts=1; const b=JOBS.staffTicketOk(H.G); j1.shifts=0; delete j1.shiftsPrev; const c=JOBS.staffTicketOk(H.G); j1.shiftsPrev=sv;
    check('10. 員工票：以前 2 班＋再應徵以後 1 班＝3 班就有；以前不到 3 班、舊存檔沒有 shiftsPrev＝照班數算（還沒有）',!a&&b&&!c,J([a,b,c])); }
  check('10. 再應徵：熟練度保留（4；AA_828 第 5 節第 5 點——舊期望 b84e779563：從 0 算）',j1.skill===4&&JOBS.at(H.G,'cinema').lv===4,J(j1));
  { await shift('cinema',j1.since+5); check('10. 再應徵以後的第一班：熟練度接著加（4→5）、班數 1',JOBS.job(H.G,'cinema').skill===5&&JOBS.job(H.G,'cinema').shifts===1,J(JOBS.job(H.G,'cinema'))); }
  fresh(y2,15,'xs_nanyang'); hire('cinema',[5],{gone:'grad',quit:q0}); H.E.interactables=[]; const itg=JOBS.addDesk(GM,'xs_nanyang'); check('10. 不是辭職（畢業的最後一班）＝不會再出現',itg.hidden===true&&!JOBS.canReapply(H.G,'cinema'));
  fresh(y2,15,'xs_nanyang'); hire('cinema',[5],{gone:'quit',quit:q0,pendLeave:true}); check('10. 私訊辭職、還沒走進店裡演離開的那一段：先不算可以再應徵',!JOBS.canReapply(H.G,'cinema'));
  fresh(y2,15,'xs_shanlan'); hire('shanlan',[3],{gone:'quit',quit:q0}); H.E.interactables=[]; const its=JOBS.addDesk(GM,'xs_shanlan'); check('10. 山嵐書店也一樣',its.hidden===false&&its.label==='看告示');
  /* 第 5 節第 5 點：全部打工比照（舊的那幾間、花序越好吃大口漢堡、補習班事務所）；舊期望 b84e779563：只有山嵐、南洋 */
  for(const [k,z] of [['brunch','wz_brunch'],['copy','wz_print'],['tea','wz_teahouse'],['cafe','cafe'],['books','bookstore'],['cvs','cvs'],['flower','flower_notes'],['yue','tz_yuehaochi'],['dakou','xs_dakou']]){
    fresh(q0,15,z,{FC:{cnt:1}}); const jq=hire(k,[JOBS.KEYS.includes(k)?WZ_JOBS_DATA.shops[k].days[0]:1],{shifts:6,skill:6,gone:'quit',quit:q0,xev:{done:['x'],at:5}}); H.E.interactables=[]; const b=JOBS.addDesk(GM,z);
    const h0=b&&b.hidden===true&&!JOBS.canReapply(H.G,k); at(y2,15); const h1=b&&b.hidden===false&&JOBS.canReapply(H.G,k);
    check('10. '+k+'：辭職的那個學期看不到、下一個學期開學起又可以應徵',!!h0&&!!h1,J([b&&b.hidden,JOBS.canReapply(H.G,k),b&&b.label])); }
  { fresh(q0,15,'wz_brunch'); hire('brunch',[6],{shifts:6,skill:6,missN:2,gone:'quit',quit:q0}); at(y2,15); H.E.interactables=[]; const b=JOBS.addDesk(GM,'wz_brunch'); H.said=[]; H.opts=[]; H.picks=[H.G&&'週六']; await STORY.interact(b,GM); const jb=JOBS.job(H.G,'brunch');
    check('10. 早午餐再應徵（直接選班表）：新的一份、熟練度 6 保留、班數從 0 算、re 1',!!jb&&jb.gone===null&&jb.skill===6&&jb.shifts===0&&jb.re===1&&jb.missN===2&&jb.day.length>=1,J(jb)+J(H.opts));
    const sd=(()=>{ for(let d=jb.since;d<jb.since+14;d++) if(JOBS.due(H.G,'brunch',d)) return d; return null; })(); if(sd!=null){ const F1=WZ_JOBS_DATA.first.brunch, f1=(F1||[]).find(x=>Array.isArray(x)); await shift('brunch',sd);
      check('10. 早午餐再應徵的第一班：第一班那一段（WZ-B1）不重演；熟練 7',JOBS.job(H.G,'brunch').skill===7&&JOBS.job(H.G,'brunch').shifts===1&&(!f1||!said(f1[1])),J(L().slice(0,3))); } else check('10. 早午餐再應徵：找得到下一班',false); }
  { const y3=CALENDAR.termDays('Y3S1').from, y3b=CALENDAR.termDays('Y3S2').from; fresh(y3+20,15,'linze'); hire('office',[2],{shifts:3,skill:3,gone:'quit',quit:y3+20}); JOBS.rec(H.G)._meta.ap2={office:{st:'done',day:y3}};
    const a=JOBS.board2(H.G).includes('office'); at(y3b,15); const b=JOBS.board2(H.G).includes('office'); H.G.jobs.office.gone='grad';
    check('10. 事務所：辭職的那個學期公布欄沒有、下一個學期又貼出來；不是辭職的不貼',!a&&b&&!JOBS.board2(H.G).includes('office'),J([a,b])); }
  { fresh(y2,15,'xs_nanyang'); const jo=hire('cinema',[6],{shifts:0,skill:0,re:1}); check('10. 舊規則下已經再應徵過的存檔（熟練度已經從 0 算）：照現在的數字走、不壞',JOBS.at(H.G,'cinema').lv===0&&jo.re===1&&!JOBS.canReapply(H.G,'cinema')); }
  /* 第 4 點：寒暑假兩間都不排班、開學那一週自動恢復；沒有放假的私訊 */
  const R1=CALENDAR.termDays('Y1S1'), R2=CALENDAR.termDays('Y1S2'), w0=R1.to+1; fresh(w0,12.5,'dorm'); hire('shanlan',[3,7],{since:R1.from+30,shifts:5,skill:5}); hire('cinema',[5,6],{since:R1.from+30,shifts:5,skill:5});
  const n0=(H.G.msgs||[]).length; tick(); let vac=[]; for(let d=w0;d<R2.from;d++) for(const k of ['shanlan','cinema']) if(JOBS.scheduled(H.G,k,d)) vac.push(k+d);
  check('10. 寒假：兩間都不排班；沒有店長／經理的放假私訊（沒有專屬句）',!CALENDAR.termOf(w0)&&vac.length===0&&!(H.G.msgs||[]).some(m=>m.from==='shanlan_boss'||m.from==='cinema_boss'),J(vac.slice(0,4))+((H.G.msgs||[]).length-n0));
  const wk1=[0,1,2,3,4,5,6].map(i=>R2.from+i); check('10. 開學那一週自動恢復（照原本的班表，不用再應徵）',wk1.filter(d=>JOBS.scheduled(H.G,'shanlan',d)).length===2&&wk1.filter(d=>JOBS.scheduled(H.G,'cinema',d)).length===2&&JOBS.active(H.G,'shanlan')&&JOBS.active(H.G,'cinema'));
  /* 第 7 點：宋知寧 */
  /* 第 5 節第 1、2 點：她的班＝週日；有 SHOP_ZN_MET 分兩種（傳過第 5 則＝第 4 節那一版；還沒傳＝不說「我上次說的另一家」）*/
  const wed=TD('Y1S2',6,7); fresh(wed,13,'dorm',{SHOP_ZN_MET:true,SHOP_ZN_BK:{c0:wed-60,sent:[0,1,2,3,4],terms:{},last:wed-20,moved:wed-20}}); hire('shanlan',[3,7]);
  check('10. 她傳過第 5 則（SHOP_ZN_BK.sent 有第 5 則）',JOBS.znMsgSent(H.G)&&!JOBS.znCoOn(H.G,wed-4)&&JOBS.znCoOn(H.G,wed));
  await shift('shanlan',wed,['「先上二樓法律區。」','「問要不要袋子。」','「把亂放的書歸位。」']); const T=H.said.map(s=>[s.who,s.t]);
  check('10. 認識過她（SHOP_ZN_MET）、她傳過第 5 則：上架那一段後面三句——她「……又是你。」、旁白、她「我上次說的另一家，就是這裡。二樓的書我比較熟，找不到就問我。」（名字照遊戲原本顯示的「知寧」）',J(T.slice(2,5))===J([['知寧','……又是你。'],[null,'（她抱著一疊書，看了你的名牌一眼。）'],['知寧','我上次說的另一家，就是這裡。二樓的書我比較熟，找不到就問我。']])&&T[1][1]===S8.segs[0].ch[1][1]&&T[5][1]===S8.segs[1].nov&&!said('新來的？二樓我比較熟，找不到可以問我。'),J(T.slice(0,6)));
  await shift('shanlan',wed+7); check('10. 只有一次：下一個週日班沒有',!said('……又是你。')&&!said('新來的？二樓我比較熟，找不到可以問我。')&&H.said.length===7);
  JOBS.job(H.G,'shanlan').gone='quit'; JOBS.job(H.G,'shanlan').quit=wed+5; at(y2,15,'xs_shanlan'); H.E.interactables=[]; const it9=JOBS.addDesk(GM,'xs_shanlan'); H.picks=['「問店員。」','週三']; await STORY.interact(it9,GM);
  await shift('shanlan',TD('Y2S1',3,3)); check('10. 辭職再應徵以後也不再說（記在 G.jobs._meta）',JOBS.active(H.G,'shanlan')&&!said('……又是你。')&&JOBS.rec(H.G)._meta.znCo===wed);
  /* 第 6 節第 3 點（1d6055568c）：第 5 則以前她不在山嵐＝認識過但還沒傳的不演（舊期望 d8afcca6ed：演「還沒傳」的那一版三句——作廢）；傳了以後的第一個週日班才演 */
  for(const [nm,fl] of [['還沒有 SHOP_ZN_BK（舊存檔）',{SHOP_ZN_MET:true}],['傳到第 4 則',{SHOP_ZN_MET:true,SHOP_ZN_BK:{c0:wed-60,sent:[0,1,2,3],terms:{},last:wed-20}}],['舊存檔跳過第 5 則、收到第 6 則',{SHOP_ZN_MET:true,SHOP_ZN_BK:{c0:wed-60,sent:[0,1,2,3,5],terms:{},last:wed-20}}]]){ fresh(wed,13,'dorm',fl); hire('shanlan',[7]);
    await shift('shanlan',wed,['「先上二樓法律區。」','「問要不要袋子。」','「把亂放的書歸位。」']); const T2=H.said.map(s=>[s.who,s.t]);
    check('10. 認識過她、還沒傳第 5 則（'+nm+'）：她還不在山嵐＝沒有那一句、不記（AA_828 第 6 節第 3 點）',!JOBS.znMsgSent(H.G)&&!JOBS.znCoOn(H.G,wed)&&H.said.length===7&&!H.said.some(s=>s.who==='宋知寧'||s.who==='知寧'||/又是你|新來的/.test(s.t))&&JOBS.rec(H.G)._meta.znCo==null,J(T2.slice(0,6)));
    const B=H.G.flags.SHOP_ZN_BK||(H.G.flags.SHOP_ZN_BK={sent:[],terms:{}}); B.sent.push(4); B.moved=wed+3;   /* 之後她傳了第 5 則 */
    check('10. …之後傳了第 5 則（'+nm+'）：發的那一天以前（含）還不在、之後的週日班在',JOBS.znMsgSent(H.G)&&!JOBS.znMsgSent(H.G,wed+3)&&JOBS.znCoDue(H.G,wed+7)&&!JOBS.znCoDue(H.G,wed+6));
    await shift('shanlan',wed+7,['「先上二樓法律區。」','「問要不要袋子。」','「把亂放的書歸位。」']); const T3=H.said.map(s=>[s.who,s.t]);
    check('10. …那一個週日班：「……又是你。」、旁白、「我上次說的另一家，就是這裡。…」（'+nm+'）',J(T3.slice(2,5))===J([['知寧','……又是你。'],[null,'（她抱著一疊書，看了你的名牌一眼。）'],['知寧','我上次說的另一家，就是這裡。二樓的書我比較熟，找不到就問我。']])&&JOBS.rec(H.G)._meta.znCo===wed+7,J(T3.slice(0,6))); }
  fresh(wed-4,17,'dorm',{SHOP_ZN_MET:true,SHOP_ZN_BK:{c0:wed-60,sent:[0,1,2,3,4],terms:{},last:wed-20,moved:wed-20}}); hire('shanlan',[3]); await shift('shanlan',wed-4); check('10. 只排週三晚班：她不在＝沒有那一句、也不記（等第一次週日班）',H.said.length===7&&JOBS.rec(H.G)._meta.znCo==null&&!JOBS.znCoDue(H.G,wed-4)&&JOBS.znCoDue(H.G,wed),J(L()));
  { fresh(wed,13,'dorm'); hire('shanlan',[7]); await shift('shanlan',wed,['「先上二樓法律區。」','「問要不要袋子。」','「把亂放的書歸位。」']);
    check('10. 完全沒認識過她、大一下的週日班：她不出現在山嵐＝沒有那一句、不記、SHOP_ZN_MET 不動（AA_828 第 8 節第 1、2 點——舊期望 1d6055568c：上架那一段後面她一句「新來的？…」、記 znCo）',JOBS.rec(H.G)._meta.znCo==null&&J(L().slice(0,3))===J([S8.segs[0].nov,S8.segs[0].ch[1][1],S8.segs[1].nov])&&H.said.length===7&&!H.said.some(s=>s.who==='宋知寧'||/新來的/.test(s.t))&&H.G.flags.SHOP_ZN_MET==null&&!JOBS.znCoOn(H.G,TD('Y1S1',8,7))&&!JOBS.znCoOn(H.G,TD('Y1S2',1,7)),J(L()));
    await shift('shanlan',wed+7); check('10. …下一個週日班也沒有',H.said.length===7&&!H.said.some(s=>s.who==='宋知寧')); }
  const last=TD('Y2S2',10,7); fresh(last,13,'dorm',{SHOP_ZN_MET:true,SHOP_ZN_BK:{c0:last-60,sent:[0,1,2,3,4],terms:{},last:last-20,moved:last-20}}); hire('shanlan',[7]); check('10. 她到大二下：（認識過、傳過第 5 則的）大二下的週日班還會遇到（週三不會）——設定多了認識過她：沒認識過的現在不演（第 8 節）',JOBS.znCoDue(H.G,last)&&!JOBS.znCoDue(H.G,last-4)&&!JOBS.znCoOn(H.G,CALENDAR.termDays('Y2S2').to+7));
  const y3=TD('Y3S1',2,7); fresh(y3,13,'dorm'); hire('shanlan',[7]); await shift('shanlan',y3);
  check('10. 大三上以後第一次在山嵐上班：她不出（沒有那一句、也不記）',!JOBS.znCoOn(H.G,y3)&&H.said.length===7&&!H.said.some(s=>s.who==='宋知寧'||s.who==='知寧')&&JOBS.rec(H.G)._meta.znCo==null,J(L()));
  const g2=JSON.parse(J(H.G)); check('10. 存檔 JSON 來回不壞',J(g2.jobs)===J(H.G.jobs)); });

/* 12 AA_828 第 7 節第 4 點（企劃線 1d6055568c）：舊打工全部比照再應徵——家教（JOB_TUTOR，沒有告示）＝停了以後的下一個學期開學，明軒照開學那一則再問一次（原本的字，沒有新句子）。
      第 1 點（私訊約的桌遊夜撞到班也自動回）在第 7 節原本就驗了（還沒進群組的那一次）；這裡只對資料 bgnBusy.dm。*/
await sec(12,async()=>{ const U=WZ_JOBS_DATA.tutor, stop=TD('Y1S2',8,3), s1=CALENDAR.termDays('Y2S1').from, s2=CALENDAR.termDays('Y2S2').from, TH='p:'+MX;
  const base=()=>({JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:TD('Y1S2',3,1),TUTOR_N:4,TUTOR_STOP:stop,TUTOR_MISS_RUN:3,TUTOR_ASK3_SENT:true});
  const run=()=>{ JOBS.tutorPhone(H.G); PHONE.tick(H.G); }, asks=re=>(H.G.msgs||[]).filter(m=>m.ask&&re.test(m.ask.id));
  check('12. 資料：reapply.tutor、bgnBusy.dm；問的那一句是原本開學問的「家長問你這學期還來嗎」「來」「不了」',D8.reapply.tutor===true&&D8.bgnBusy.dm===true&&U.termAsk==='家長問你這學期還來嗎'&&J(U.termOpts)===J(['來','不了']));
  fresh(stop+1,13,'dorm',base()); run(); check('12. 停的那個學期：不問、照舊停著',asks(/^tutor_re_/).length===0&&JOBS.at(H.G,'tutor')===null);
  at(s1-1,13); run(); check('12. 暑假最後一天：還不問',asks(/^tutor_re_/).length===0);
  at(s1,13); run(); run(); const m=asks(/^tutor_re_/);
  check('12. 下一個學期開學那一天：明軒再問一次「家長問你這學期還來嗎」（來／不了）；同一個學期只問一次；不是原本開學那一則（那一則停了就不問）',m.length===1&&m[0].ask.id==='tutor_re_Y2S1'&&m[0].text===U.termAsk&&m[0].from===MX&&m[0].th===TH&&J(m[0].ask.opts.map(o=>o.t))===J(U.termOpts)&&asks(/^tutor_term_/).length===0&&JOBS.at(H.G,'tutor')===null,J(m.map(x=>[x.ask.id,x.text])));
  PHONE.answer(H.G,'tutor_re_Y2S1',0); run(); run(); const F=H.G.flags;
  check('12. 回「來」：又有家教（TUTOR_STOP 清掉、這個學期記 go、再接一次 TUTOR_RE 1）；堂數照舊留著（4）；沒去的次數歸零；不會馬上又被當成停',F.TUTOR_STOP==null&&F.TUTOR_TERM_Y2S1==='go'&&F.TUTOR_RE===1&&F.TUTOR_RE_ANS==null&&F.TUTOR_N===4&&(F.TUTOR_MISS_RUN|0)===0&&!!JOBS.at(H.G,'tutor')&&JOBS.at(H.G,'tutor').lv===4&&JOBS.tutorOn(H.G,s1+1),J([F.TUTOR_STOP,F.TUTOR_TERM_Y2S1,F.TUTOR_RE,F.TUTOR_N]));
  check('12. 回「來」：這個學期照排（有一堂排進行程）',OUT.rec(H.G).some(q=>/^tutor_/.test(q.id)&&q.state==='planned'&&CALENDAR.termOf(q.day)&&CALENDAR.termOf(q.day).id==='Y2S1'),J(OUT.rec(H.G).filter(q=>/^tutor_/.test(q.id)).map(q=>[q.day,q.state])));
  at(s2,13); run(); check('12. 再接以後的下一個學期：照原本開學那一則問（tutor_term_Y2S2），不是再應徵那一則',asks(/^tutor_term_Y2S2$/).length===1&&asks(/^tutor_re_Y2S2$/).length===0);
  fresh(s1,13,'dorm',base()); run(); PHONE.answer(H.G,'tutor_re_Y2S1',1); run();
  check('12. 回「不了」：明軒原本那一句、照舊停著（TUTOR_STOP 不動）',(H.G.msgs||[]).some(x=>x.th===TH&&x.text===U.stopReply)&&H.G.flags.TUTOR_STOP===stop&&H.G.flags.TUTOR_RE==null&&JOBS.at(H.G,'tutor')===null);
  at(s2,13); run(); check('12. …回過「不了」以後不再問（AA_828 第 8 節第 5 點；舊期望 1d6055568c：再下一個學期開學再問一次）',asks(/^tutor_re_Y2S2$/).length===0&&H.G.flags.TUTOR_RE_NO===s1);
  fresh(s2,13,'dorm',Object.assign(base(),{TUTOR_TERM_Y2S1:'stop',TUTOR_STOP:s1})); run(); run();
  check('12. 開學回「不了」停的（TUTOR_TERM_Y2S1 stop）：之後不再問（AA_828 第 8 節第 5 點；舊期望 1d6055568c：隔一個學期再問一次）',asks(/^tutor_re_/).length===0&&H.G.flags.TUTOR_TERM_Y2S1==='stop'&&H.G.flags.TUTOR_STOP===s1&&JOBS.at(H.G,'tutor')===null);
  H.G.flags.TUTOR_RE_ANS='go'; run(); run();   /* 舊存檔：新規則以前已經收到再問的那一則、現在才回「來」*/
  check('12. 舊存檔（新規則以前已經收到再問的那一則）回「來」：照舊再接——舊的那一筆改記 stopped，不會又被當成停',H.G.flags.TUTOR_TERM_Y2S1==='stopped'&&H.G.flags.TUTOR_TERM_Y2S2==='go'&&H.G.flags.TUTOR_STOP==null&&!!JOBS.at(H.G,'tutor'),J([H.G.flags.TUTOR_TERM_Y2S1,H.G.flags.TUTOR_TERM_Y2S2,H.G.flags.TUTOR_STOP]));
  fresh(s1,13,'dorm',Object.assign(base(),{TUTOR_STOP:s1+3})); at(s1+10,13); run(); check('12. 這個學期才停的：這個學期不問',asks(/^tutor_re_/).length===0);
  fresh(s1+20,15,'dorm',base()); run(); check('12. 舊存檔（上學期停的、現在學期中）：讀檔那一天補問',asks(/^tutor_re_Y2S1$/).length===1);
  fresh(s1,13,'dorm',Object.assign(base(),{TUTOR_DONE:stop})); run(); const a1=asks(/^tutor_re_/).length;
  fresh(s1,13,'dorm',{}); run(); const a2=asks(/^tutor_re_/).length;
  { const y3=CALENDAR.termDays('Y3S1').from; fresh(y3,13,'dorm',base()); run(); const a3=asks(/^tutor_re_/).length;
    check('12. 會考後結束的、沒做過家教的、大三以後：不問',a1===0&&a2===0&&a3===0,J([a1,a2,a3])); }
  const g2=JSON.parse(J(H.G)); check('12. 存檔 JSON 來回不壞',J(g2.flags)===J(H.G.flags)); });

console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0);
})();
