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
const DOC='docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md', SHA='be3b9c9e4';
const D8=typeof SHOP_JOBS_AA828!=='undefined'?SHOP_JOBS_AA828:null, has=typeof JOBS!=='undefined'&&!!D8&&JOBS.KEYS.includes('shanlan')&&JOBS.KEYS.includes('cinema');

(async()=>{
await sec(0,async()=>{
  check('0. 載得到：SHOP_JOBS_AA828；JOBS 有 shanlan、cinema；區域 xs_shanlan、xs_nanyang',has&&JOBS.ZONE_KEY.xs_shanlan==='shanlan'&&JOBS.ZONE_KEY.xs_nanyang==='cinema',J(typeof JOBS!=='undefined'?JOBS.KEYS:null));
  const a=ORDER.indexOf('src/data/wz_jobs.js'), b=ORDER.indexOf('src/data/shop_jobs_aa828.js'), c=ORDER.indexOf('src/jobs3d.js');
  check('0. index.html：shop_jobs_aa828.js 在 wz_jobs.js 之後、jobs3d.js 之前',a>=0&&b>a&&c>b,J([a,b,c]));
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
  check('0. 逐句對稿：'+n+' 句都在 AA_828@'+SHA+' 上（一字不差）',n===39&&miss.length===0,n+' '+J(miss));
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
  check('3. 第一班（新手）：三段各一句旁白＋選了的那一句，照順序',J(L())===J([S8.segs[0].nov,S8.segs[0].ch[0][1],S8.segs[1].nov,S8.segs[1].ch[0][1],S8.segs[2].nov,S8.segs[2].ch[0][1],S8.end['3'][0]]),J(L()));
  check('3. 小選擇的字照稿（每段兩個）',J(H.opts)===J(S8.segs.map(g=>g.ch.map(c=>c[0])))&&J(H.opts[0])===J(['「先上新書平台。」','「先上二樓法律區。」']),J(H.opts));
  check('3. 晚班最後一句「（十點。店長把燈關掉一半，你把推車推回倉庫。）」；784 元、toast「山嵐書店 薪水 784 元」；22:00 下班',said('（十點。店長把燈關掉一半，你把推車推回倉庫。）')&&pay===784&&toasts.includes('山嵐書店 薪水 784 元')&&Math.abs(H.G.hour-22)<1e-6,pay+' '+H.G.hour+J(toasts));
  check('3. 晚班做到打烊：下班直接在店門口外面（新生南路）；沒有 AA_700「我們今天要打烊了。」',J(H.entered)===J(['xinsheng'])&&H.G.zone==='xinsheng'&&!said('我們今天要打烊了。')&&(typeof XSCLOSE==='undefined'||XSCLOSE.staffToday(H.G,'xs_shanlan')),J(H.entered));
  check('3. 晚上的時段算一件；記一班、熟練 +1',CLS.slotRec(H.G).used.ev>0&&JOBS.job(H.G,'shanlan').shifts===1&&JOBS.job(H.G,'shanlan').skill===1&&JOBS.worked(H.G,'shanlan',wed));
  pay=await shift('shanlan',sun,['「先上二樓法律區。」','「先刷條碼。」','「把亂放的書歸位。」']);
  check('3. 假日班：另一個選擇的三句；最後一句「（六點，換班的人來了。你的手上都是書的灰。）」；784；人還在店裡（沒打烊）',said(S8.segs[0].ch[1][1])&&said(S8.segs[1].ch[1][1])&&said(S8.segs[2].ch[1][1])&&said('（六點，換班的人來了。你的手上都是書的灰。）')&&!said(S8.end['3'][1])&&pay===784&&H.entered.length===0&&Math.abs(H.G.hour-18)<1e-6,J(L())+J(H.entered));
  await shift('shanlan',wed+7); check('3. 第二個晚班：最後一句輪到「（十點。最後一個坐地板的人站起來，把書放回架上，放對了。）」',said('（十點。最後一個坐地板的人站起來，把書放回架上，放對了。）')&&!said(S8.end['3'][0]));
  await shift('shanlan',sun+7); check('3. 第二個假日班：「（六點。你下班以後又在一樓多站了十分鐘，把剛剛上架的那本翻完。）」',said('（六點。你下班以後又在一樓多站了十分鐘，把剛剛上架的那本翻完。）'));
  check('3. 四班以後還是新手那一句（熟練 0～4）',said(S8.segs[0].nov)&&JOBS.job(H.G,'shanlan').skill===4);
  await shift('shanlan',wed+14); check('3. 第三個晚班：最後一句輪回第一句；這一班還是新手（上班時熟練 4）',said(S8.end['3'][0])&&said(S8.segs[2].nov));
  await shift('shanlan',sun+14); check('3. 熟練 5 以上：三段都換「熟練」那一句',J(L().filter((t,i)=>i%2===0).slice(0,3))===J(S8.segs.map(g=>g.exp))&&!S8.segs.some(g=>said(g.nov))&&said('（書套你十秒包一本，摺角是直的。）'),J(L())); });

await sec(4,async()=>{ const d0=TD('Y1S2',2,2); fresh(d0,15,'xs_nanyang'); H.E.interactables=[]; const it=JOBS.addDesk(GM,'xs_nanyang');
  H.picks=['「再想想。」']; await STORY.interact(it,GM);
  check('4. 看告示：告示的字、「問售票口。」「再想想。」；「再想想。」＝經理「好。想來再來，我們一直缺人。」',J(L())===J(['徵工讀　假日、週五晚上　驗票、清場、賣爆米花　可以看免費的電影（站著看）','經理：好。想來再來，我們一直缺人。'])&&J(H.opts[0])===J(['「問售票口。」','「再想想。」'])&&!JOBS.job(H.G,'cinema'),J(L())+J(H.opts));
  H.said=[]; H.opts=[]; H.picks=['「問售票口。」','週五和週六']; await STORY.interact(it,GM);
  check('4. 「問售票口。」→ 經理「假日能來嗎？考試週可以請假，先講就好。」→ 班表（週五、週六、兩天、先不要）',J(L())===J([C8.notice,'經理：假日能來嗎？考試週可以請假，先講就好。'])&&J(H.opts[1])===J(['週五','週六','週五和週六','先不要'])&&J(JOBS.job(H.G,'cinema').day)===J([5,6])&&toasts.includes('班表：南洋戲院　週五 18:00～22:00、週六 13:00～17:00'),J(L())+J(H.opts)+J(toasts));
  const fri=TD('Y1S2',2,5), sat=fri+1; check('4. 這一週的週五就上（照現有的打工：當週開始）',JOBS.scheduled(H.G,'cinema',fri)&&J(JOBS.hrs('cinema',fri))===J([18,22])&&J(JOBS.hrs('cinema',sat))===J([13,17]));
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
  check('6. 拿員工票：不用錢、今天有票、記 NY_TICKET_STAFF、這一週拿過了；沒有多的字',r==='staff'&&G.money===m0&&NYS.hasTicket(G)&&G.flags.NY_TICKET_STAFF===tue&&JOBS.staffTicketToday(G)&&!JOBS.staffTicketOk(G)&&H.said.length===0,J([r,G.money,m0,G.flags.NY_TICKET_STAFF]));
  check('6. 約會照買票：員工票不算買過（NYS.paidTicket 假；INV.buyTicket 照扣 150）',!NYS.paidTicket(G)&&(()=>{ const g2=JSON.parse(J(G)); const got=INV.buyTicket(null,g2,{zone:'xs_nanyang'}); return got===150&&g2.money===m0-150&&g2.flags.NY_TICKET===tue&&g2.flags.NY_TICKET_STAFF==null; })());
  at(tue,15.5,'xs_nanyang_hall'); H.said=[]; H.opts=[]; const ok=await STORY.onSeat(GM,{kind:'cinema',row:9}); const T=H.said.map(s=>s.t), SL=MOVIES.soloLines(G), bill=MOVIES.billAt(G).bill;
  check('6. 1 廳照平常那一場演（一個人看的三句＋兩部的那一幕），最後多一句「（你站在最後面看完整部。腳有一點痠。）」',T[0]===SL[0]&&T.includes(SL[2])&&T[T.length-1]==='（你站在最後面看完整部。腳有一點痠。）'&&H.said[T.length-1].who===null&&H.opts.length===0,J([ok,H.opts.length,T]));
  check('6. 和買票一樣記「看過這部」（G.flags.MOVIE_SEEN.me：這一段的兩部）',bill.length===2&&bill.every(b=>MOVIES.seenWith(G,'me',b.id))&&G.flags.NY_WATCHED===tue,J(G.flags.MOVIE_SEEN));
  /* 對照：買票的人看同一場＝記的一樣、沒有多那一句 */
  const G2=fresh(tue,15.5,'xs_nanyang_hall'); G2.flags.NY_TICKET=tue; H.said=[]; await STORY.onSeat(GM,{kind:'cinema',row:3});
  check('6. 對照（買票看）：記的看過一樣、沒有站著看那一句',J(G2.flags.MOVIE_SEEN)===J(G.flags.MOVIE_SEEN)&&!said(C8.ticket.line),J(G2.flags.MOVIE_SEEN));
  H.G=G; at(tue+3,15,'xs_nanyang'); check('6. 同一週（週五）不能再拿',!JOBS.staffTicketOk(G)&&NYS.staffOpt(G)===null);
  at(tue+6,15,'xs_nanyang'); check('6. 下週一又可以拿（一週一次）',JOBS.staffTicketOk(G)&&!NYS.hasTicket(G));
  H.picks=['買票']; const r2=await NYS.buy(GM); check('6. 有員工票那一項的時候照樣可以買票（扣 150、不算員工票）',r2==='bought'&&G.money===m0-150&&NYS.paidTicket(G)&&!JOBS.staffTicketToday(G)&&JOBS.staffTicketOk(G)===true,J([r2,G.money]));
  j.gone='quit'; at(tue+13,15); check('6. 辭職以後沒有員工票',!JOBS.staffTicketOk(G)); });

await sec(7,async()=>{ const fri=TD('Y1S1',10,5);   /* 大一上第 10 週週五＝桌遊夜（AA_618）；戲院的班用存檔直接放（測試規則本身）*/
  fresh(fri,11.9,'dorm'); H.FAMILIAR(MX); hire('cinema',[5]); at(fri,12.1); tick();
  check('7. 那一天是桌遊夜、週五晚場有班＝沒空',BGN.isNight(fri)&&JOBS.due(H.G,'cinema',fri)&&JOBS.bgnBusy(H.G,fri)&&BGN.busy(H.G,fri));
  const P=msgs('p:'+MX).map(m=>m.text), A=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('7. 明軒照樣約（那兩句照舊）；只有「這次不行。」可以回',J(P)===J(BGN.LINES.first)&&!!A&&J(A.ask.opts.map(o=>o.t))===J(['這次不行。']),J(P)+J(A&&A.ask.opts.map(o=>o.t)));
  answer(A.tag,0); tick();
  check('7. 回了＝明軒照舊「好，兩個禮拜後還有。」；沒有排桌遊夜的出遊',msgs('p:'+MX).some(m=>m.text==='好，兩個禮拜後還有。'&&m.from===MX)&&!OUT.get(H.G,'bgn_'+fri)&&H.G.flags.BGN_GO!==fri);
  at(fri,17.6); JOBS.plan(H.G); check('7. 那天晚上只有戲院的班的出門提醒',!!OUT.get(H.G,'job_cinema_'+fri)&&!OUT.get(H.G,'bgn_'+fri));
  /* 在群組：群組的回覆照舊 */
  const d8=TD('Y1S1',12,5); fresh(d8,12.1,'dorm',{noodleTableDay:fri,BGN_JOIN:'night',BGN_INV_N:1}); for(const id of [MX,'zhe','yu','classmate_bohan','classmate_xinci']) H.FAMILIAR(id); PHONE.join(H.G,'noodle_team','桌遊團'); hire('cinema',[5,6]); tick();
  const Gm=msgs('g:noodle_team').filter(m=>/^bgn_inv_/.test(m.tag||'')), A8=Gm.find(m=>m.ask);
  check('7. 在群組：明軒那一句、大家的回覆照舊（Alison「我在戲院啦……幫我留一局。」）；玩家只有「這次不行。」',Gm[0].from===MX&&Gm[0].text===BGN.LINES.group[1]&&Gm.some(m=>m.from==='yu'&&m.text==='我在戲院啦……幫我留一局。')&&!!A8&&J(A8.ask.opts.map(o=>o.t))===J(['這次不行。']),J(Gm.map(m=>m.from+':'+m.text)));
  /* 先答應了、後來才排到班 */
  fresh(fri,12.1,'dorm'); H.FAMILIAR(MX); tick(); const A2=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('7. 沒有戲院的班：照舊「好。」／「這次不行。」',J(A2.ask.opts.map(o=>o.t))===J(['好。','這次不行。']));
  answer(A2.tag,0); tick(); const q=OUT.get(H.G,'bgn_'+fri); check('7. 答應了＝排了桌遊夜',!!q&&q.state==='planned');
  hire('cinema',[5]); at(fri,14); tick(); check('7. 之後才排到今天的晚場＝桌遊夜那一筆取消（不要兩個都演）',OUT.get(H.G,'bgn_'+fri).state==='cancelled'&&H.G.flags.BGN_GO!==fri,J(OUT.get(H.G,'bgn_'+fri)));
  /* 只排週六午場、山嵐的班：不影響 */
  fresh(fri,12.1,'dorm'); H.FAMILIAR(MX); hire('cinema',[6]); hire('shanlan',[3]); tick(); const A3=(H.G.msgs||[]).find(m=>m.th==='p:'+MX&&m.ask);
  check('7. 只有週六午場（或山嵐的班）：桌遊夜照舊可以答應',!JOBS.bgnBusy(H.G,fri)&&J(A3.ask.opts.map(o=>o.t))===J(['好。','這次不行。']));
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

console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0);
})();
