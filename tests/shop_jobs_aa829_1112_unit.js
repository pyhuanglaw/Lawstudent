// 新店打工第二批（AA_829，企劃線 ea5e8f5ae；任務 SHOP-JOBS-1112，USER_WANTS X356）：花序 Flower Notes、越好吃小館、大口漢堡——不需要瀏覽器（D131）。
// src/data/shop_jobs_aa829.js（tools/story/import_shop_jobs_aa829.py 產生）＋src/jobs3d.js（JOBS：flower、yue、dakou；S.busyWith、S.early）＋src/xs_close3d.js、src/flower_notes_sys3d.js、src/gg3shops3d.js
//   0  載得到；白名單；匯入工具 --check；資料的每一句都在稿上（一字不差；讀不到稿＝只跳過那一項）；稿上的句子沒有漏；index.html 的順序
//   1  什麼時候起：花序＝上過一次花藝課以後；越好吃、大口漢堡＝大一下；經濟系那一年沒有；按鈕的字照稿（看小卡／看告示／看立牌）；位置不壓在別的按鈕上
//   2  三間的應徵：告示的字 → 兩個選項 → 說話的人和那一句 → 班表；「再想想。」那一句
//   3  花序的一班（週六 09:00～13:00、週日 13:00～17:00；784）；越好吃的一班（17:30～21:00；686）；熟練換句；最後一句輪流
//   4  大口漢堡：三選二（先挑一天、再加一天）；晚班 784、大夜班 880；晚班兩天輪同一組最後一句、大夜班另一組；大夜班下班照便利商店夜班（回去睡到 10:00）；隔天早上的班自動請假
//   5  班表衝突：和已經排的班時間重疊的那一班灰掉（越好吃週四／大口漢堡週四；第一批山嵐週三／阿德影印週三；家教；大夜班過午夜）；選了灰的＝再選一次；不重疊的不灰
//   6  越好吃 17:30 開始：下午第二堂課（到 17:20）那一天照樣可以選；一週最多兩班和其他打工合計
//   7  花序週六 09:00（10:00 開店）：有班的人店門進得去、不會被請出去；沒有班的人照舊；越好吃做到 21:00 打烊＝不說打烊那一句
//   8  出門提醒帶到那一間店；辭職照現有那一句
//   9  舊存檔（沒有這三份工作、沒有 G.jobs、沒有 G.flags.FC）照常讀；存檔 JSON 來回不壞
// 修改前（開發分支 5f03f455e2）：沒有 src/data/shop_jobs_aa829.js、JOBS 沒有 flower／yue／dakou、沒有 JOBS.busyWith——FAIL。用法：node tests/shop_jobs_aa829_1112_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
global.Z3=global.Z3||{ZONES:{}}; global.CG_REGISTRY=global.CG_REGISTRY||{};
const PG_FILES=new Set(['src/data/calendar.js','src/data/places.js','src/data/characters.js','src/data/rel_lines.js','src/data/courses.js','src/data/activities.js','src/data/events.js','src/data/ladder.js','src/data/home_lines.js',
  'src/social3d.js','src/events3d.js','src/data/l118_redo772.js','src/data/invites.js','src/invites3d.js','src/phone3d.js','src/outings3d.js','src/home3d.js','src/romance3d.js','src/data/date_locations.js','src/data/date_lines.js','src/data/confess_lines.js','src/data/she_pays.js','src/date3d.js',
  'src/data/termend_lines.js','src/data/termend_opts.js','src/termend3d.js','src/data/vac_activities.js','src/vac3d.js','src/story3d.js','src/data/syllabus.js','src/data/exam_bank.js','src/data/legal_qbank.js','src/classes3d.js','src/data/postgrad_lines.js','src/postgrad3d.js']);
const SKIP=new Set(['src/character3d.js','src/engine3d.js','src/townkit3d.js','src/zones3d.js','src/bike3d.js','src/adv3d.js']);
const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
const ORDER=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]).filter(f=>f.startsWith('src/'));
for(const f of ORDER.filter(f=>!PG_FILES.has(f)&&!SKIP.has(f))){ try{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){} }
const toasts=[]; GM.toast=t=>{ toasts.push(t); }; GM.caption=()=>{}; GM.studySession=async()=>{}; GM.spawnNPC=()=>null; GM.spawnCharacter=()=>null; GM.phoneBadge=()=>{}; GM.quickGo=async()=>{}; GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
/* 選單哪幾項是灰的（pg_harness 的 choose 只記字）*/
const dims=[]; { const c0=GM.choose; GM.choose=async o=>{ dims.push(o.filter(q=>q.dim).map(q=>q.t)); return c0(o); }; }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd), key=d=>CALENDAR.dateOf(d).key;
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(key(d),h,zone||'dorm',flags); toasts.length=0; dims.length=0; return G; };
const said=t=>H.said.some(s=>s.t===t), saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w), L=()=>H.lines();
const hire=(k,days,o)=>{ const J0=JOBS.rec(H.G); J0[k]=Object.assign({since:H.G.day-1,from:(H.G.day-1)*24,day:days,shifts:0,skill:0,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}},o||{}); return J0[k]; };
const ZONE={flower:'flower_notes',yue:'tz_yuehaochi',dakou:'xs_dakou',shanlan:'xs_shanlan'};
const sleeps=[]; if(typeof STORY!=='undefined') STORY.sleepNow=async(gm,h)=>{ sleeps.push(h); H.G.day+=1; H.G.hour=h; };   /* 大夜班下班（S.nightSleep）：只記有沒有叫、睡到幾點 */
const shift=async(k,d,picks)=>{ const h0=JOBS.hrs(k,d)[0]; at(d,h0-0.1,ZONE[k]); H.said=[]; H.opts=[]; H.entered=[]; H.picks=(picks||[]).slice(); toasts.length=0; sleeps.length=0; const m0=H.G.money; await JOBS.runShift(GM,k); return H.G.money-m0; };
const desk=z=>{ H.E.interactables=[]; return JOBS.addDesk(GM,z); };
const ask=async(it,picks)=>{ H.said=[]; H.opts=[]; dims.length=0; toasts.length=0; H.picks=picks.slice(); await STORY.interact(it,GM); };
const DOC='docs/story_planning/AA_829_新店打工_花序_越好吃_大口漢堡.md', SHA='34f35eb15a';   /* 舊：ea5e8f5ae（第 1～4 節一樣；多第 5 節「回 LAWWW-C」）*/
const D9=typeof SHOP_JOBS_AA829!=='undefined'?SHOP_JOBS_AA829:null, has=typeof JOBS!=='undefined'&&!!D9&&['flower','yue','dakou'].every(k=>JOBS.KEYS.includes(k))&&typeof JOBS.busyWith==='function';

(async()=>{
await sec(0,async()=>{
  check('0. 載得到：SHOP_JOBS_AA829；JOBS 有 flower、yue、dakou（第一批 shanlan、cinema 還在）；區域 flower_notes、tz_yuehaochi、xs_dakou',has&&JOBS.KEYS.includes('shanlan')&&JOBS.KEYS.includes('cinema')&&JOBS.ZONE_KEY.flower_notes==='flower'&&JOBS.ZONE_KEY.tz_yuehaochi==='yue'&&JOBS.ZONE_KEY.xs_dakou==='dakou',J(typeof JOBS!=='undefined'?JOBS.KEYS:null));
  const a=ORDER.indexOf('src/data/wz_jobs.js'), b=ORDER.indexOf('src/data/shop_jobs_aa829.js'), c=ORDER.indexOf('src/jobs3d.js');
  check('0. index.html：shop_jobs_aa829.js 在 jobs3d.js 之前（wz_jobs.js、jobs3d.js 照舊相鄰）',b>=0&&c>b&&c===a+1,J([a,b,c]));
  const allow=JSON.parse(fs.readFileSync(path.join(H.ROOT,'docs/handoff/story_import_allow.json'),'utf8')), e=allow.files.filter(x=>x.path===DOC);
  check('0. 白名單：AA_829@'+SHA+' approved（一筆）',e.length===1&&e[0].status==='approved'&&e[0].sha===SHA&&!!e[0].approvedBy,J(e));
  check('0. 資料寫明來源那一版',!!D9&&D9.src===DOC+'@'+SHA,D9&&D9.src);
  let ck=''; try{ ck=cp.execFileSync('python3',[path.join(H.ROOT,'tools/story/import_shop_jobs_aa829.py'),'--check'],{encoding:'utf8',stdio:['ignore','pipe','pipe']}); }catch(err){ ck='ERR '+String(err.stderr||err.message||err).slice(0,300); }
  if(/讀不到|fatal|invalid object|CalledProcessError/i.test(ck)) console.log('（跳過：匯入工具讀不到 '+SHA+'，企劃線沒 fetch）'); else check('0. tools/story/import_shop_jobs_aa829.py --check：資料和稿一致',/^OK/.test(ck),ck);
  let doc=null; try{ doc=cp.execFileSync('git',['-C',H.ROOT,'show',SHA+':'+DOC],{encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(err){ doc=null; }
  if(!doc||!D9){ console.log('（跳過：讀不到稿 '+SHA+'，逐句對稿這一項沒有跑）'); return; }
  /* 每一句都要在稿上：有名字說的話、告示＝稿上的「…」；旁白、選項、按鈕＝原樣 */
  const miss=[]; let n=0; const inDoc=(t,q)=>{ n++; if(!doc.includes(q?'「'+t+'」':t)) miss.push(t); };
  for(const k of ['flower','yue','dakou']){ const A=D9.jobs[k];
    inDoc(A.look+' → 選'+A.askOpt+'→ '+A.boss+'：「'+A.ask+'」→ 選班表。選'+A.laterOpt+'→ '+A.boss+'：「'+A.later+'」'); inDoc(A.notice,true);
    for(const g of A.segs){ inDoc('| '+g.name+' | '+g.nov+' | '+g.exp+' | '); for(const c of g.ch) inDoc(c[0]+'→'+c[1]); }
    for(const w in A.end) for(const t of A.end[w]) inDoc(t);
    if(!new RegExp('小時 '+A.pay+' 元').test(doc)) miss.push('薪水 '+A.pay); }
  inDoc(D9.jobs.yue.mealExtra); if(!doc.includes('大夜班 880 元')) miss.push('大夜班 880');
  inDoc('選到灰掉的班：出一句旁白「'+D9.busyLine+'」再回選單。'); inDoc('越好吃「'+D9.jobs.yue.mealExtra+'」插在「'+D9.jobs.yue.mealAfter+'」那一段後面。');   /* 第 5 節第 1、7 點 */
  check('0. 第 5 節：灰掉的班那一句「（這個時段你已經有班了。）」；越好吃那一句插在「點餐」後面；值班經理男、花藝師和老闆娘女',D9.busyLine==='（這個時段你已經有班了。）'&&D9.jobs.yue.mealAfter==='點餐'&&D9.jobs.yue.segs[0].name==='點餐'&&doc.includes('3. 值班經理男；花藝師、老闆娘女。')&&D9.jobs.dakou.gender==='m'&&D9.jobs.flower.gender==='f'&&D9.jobs.yue.gender==='f'&&(typeof PORTRAIT_ONLY==='undefined'||(PORTRAIT_ONLY.dakou_boss.gender==='m'&&PORTRAIT_ONLY.flower_boss.gender==='f'&&PORTRAIT_ONLY.yue_boss.gender==='f')),J([D9.busyLine,D9.jobs.yue.mealAfter,D9.jobs.dakou.gender]));
  check('0. 逐句對稿：'+n+' 句都在 AA_829@'+SHA+' 上（一字不差）',n===46&&miss.length===0,n+' '+J(miss));   /* 舊：44（多第 5 節兩處）*/
  /* 反過來：稿上三節的三段工作表、最後一句旁白，遊戲資料都有（沒有漏句）*/
  const body=doc.slice(doc.indexOf('## 1. 花序'),doc.indexOf('## 4. 給 LAWWW')), all=J(D9.jobs), lost=[];
  for(const row of body.split('\n').filter(l=>/^\| /.test(l)&&!/^\| (段|---)/.test(l))) for(const m of row.matchAll(/（[^（）]+?。）|「[^「」]+?。」/g)) if(!all.includes(J(m[0]).slice(1,-1))) lost.push(m[0]);
  for(const l of body.split('\n').filter(l=>/最後一句旁白（輪流）/.test(l))) for(const m of l.split('：').slice(1).join('：').split('／')) if(!all.includes(m.trim())) lost.push(m);
  check('0. 稿上的三段工作表、最後一句旁白沒有漏句',lost.length===0,J(lost));
  check('0. 班表照稿：花序 週六 09:00～13:00、週日 13:00～17:00；越好吃 週二、週四 17:30～21:00；大口漢堡 週一、週四 18:00～22:00、週六 22:00～隔天 02:00',
    J(D9.jobs.flower.sched.map(q=>[q.wd,q.t0,q.t1]))===J([[6,9,13],[7,13,17]])&&J(D9.jobs.yue.sched.map(q=>[q.wd,q.t0,q.t1]))===J([[2,17.5,21],[4,17.5,21]])&&J(D9.jobs.dakou.sched.map(q=>[q.wd,q.t0,q.t1,q.pay||0]))===J([[1,18,22,0],[4,18,22,0],[6,22,26,880]]),J(D9.jobs.dakou.sched));
  check('0. 薪水照稿：花序 784、越好吃 686、大口漢堡 784（大夜班 880）',D9.jobs.flower.pay===784&&D9.jobs.yue.pay===686&&D9.jobs.dakou.pay===784); });
if(!has){ console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0); }
const F9=D9.jobs.flower, Y9=D9.jobs.yue, K9=D9.jobs.dakou;

await sec(1,async()=>{ const d1=TD('Y1S1',5,2); fresh(d1,15,'flower_notes'); const it=desk('flower_notes');
  check('1. 花序：沒上過花藝課＝沒有小卡（按鈕藏起來）',!!it&&it.hidden===true&&!JOBS.eligible(H.G,'flower'));
  H.G.flags.FC={n:{},gave:{},after:{},cnt:0}; check('1. 花序：有 G.flags.FC、可是還沒上過＝沒有',it.hidden===true);
  H.G.flags.FC.cnt=1; H.G.flags.FC.last=d1-3; check('1. 花序：上過一次（自己上）＝有；按鈕「看小卡」、在二樓',it.hidden===false&&it.label==='看小卡'&&it.lv===1&&F9.look==='看小卡',it.label+' '+it.lv);
  H.G.flags.FC={n:{},gave:{},after:{},cnt:0,last:d1-3}; check('1. 花序：只一起上過（有 last、cnt 0）＝也算上過',it.hidden===false);
  H.G.stage='econ'; check('1. 經濟系那一年：沒有',it.hidden===true); H.G.stage='law';
  const y1s2=CALENDAR.termDays('Y1S2').from;
  for(const [k,z,lab] of [['yue','tz_yuehaochi','看告示'],['dakou','xs_dakou','看立牌']]){ fresh(y1s2-1,15,z); const b=desk(z);
    check('1. '+k+'：大一上（寒假最後一天）沒有',!!b&&b.hidden===true&&!JOBS.eligible(H.G,k));
    at(TD('Y1S1',10,3),15); check('1. '+k+'：大一上第 10 週沒有',b.hidden===true);
    at(y1s2,15); check('1. '+k+'：大一下第一天起有；按鈕「'+lab+'」、在一樓',b.hidden===false&&b.label===lab&&b.lv===0,b.label);
    H.G.stage='econ'; check('1. '+k+'：經濟系那一年沒有',b.hidden===true); H.G.stage='law'; }
  /* 位置：不壓在那一間店原本的按鈕上（最近的原本按鈕比告示自己的半徑遠）*/
  const far=(b,P)=>P.every(p=>Math.hypot(b.x-p[0],b.z-p[1])>=Math.max(b.radius,0.8));
  const f=desk('flower_notes'), FL=FLOWER_NOTES_LAYOUT;
  check('1. 花序的小卡：示範長桌旁邊（離桌子 1 m 以內）、不在桌子裡、離報名（FCLASS.AT）、看示範桌、看黑板、座位都夠遠',(()=>{ const T=FL.items1.find(q=>q.kind==='demo_table'), x0=T.x-T.w/2, x1=T.x+T.w/2, z0=T.z-T.d/2, z1=T.z+T.d/2, inT=f.x>x0&&f.x<x1&&f.z>z0&&f.z<z1, dx=Math.max(x0-f.x,0,f.x-x1), dz=Math.max(z0-f.z,0,f.z-z1);
    return !inT&&Math.hypot(dx,dz)<=1.0&&far(f,[[FCLASS.AT.x,FCLASS.AT.z]].concat(FL.looks.filter(q=>q.lv===1).map(q=>[q.x,q.z]),FL.seats1.map(q=>[q.x,q.z]))); })(),J([f.x,f.z,f.radius]));
  const y=desk('tz_yuehaochi'), YL=TZ_SHOPS_LAYOUT.yuehaochi;
  check('1. 越好吃的告示：櫃檯旁邊（離櫃檯 1 m 以內）、在房間裡、離點餐、看廚房、香草檯夠遠',(()=>{ const C=YL.counter, dx=Math.max(C.x0-y.x,0,y.x-C.x1), dz=Math.max(C.z0-y.z,0,y.z-C.z1); return Math.hypot(dx,dz)<=1.0&&Math.abs(y.x)<YL.w/2&&Math.abs(y.z)<YL.d/2&&far(y,YL.points.map(q=>[q.x,q.z])); })(),J([y.x,y.z,y.radius]));
  const k=desk('xs_dakou'), KL=DAKOU_LAYOUT.shop.floor1;
  check('1. 大口漢堡的立牌：一樓櫃檯旁邊（離櫃檯 1 m 以內）、不在阻擋裡、離點餐、取餐、自助點餐、回收餐盤、座位夠遠',(()=>{ const C=KL.counter, dx=Math.max(C.x0-k.x,0,k.x-C.x1), dz=Math.max(C.z0-k.z,0,k.z-C.z1), blocked=KL.blocks.some(b=>Math.abs(k.x-b[0])<b[2]/2&&Math.abs(k.z-b[1])<b[3]/2);
    return Math.hypot(dx,dz)<=1.0&&!blocked&&far(k,KL.interact.filter(q=>q.kind!=='clerk').map(q=>[q.x,q.z]).concat(KL.seats.map(q=>[q.x,q.z]))); })(),J([k.x,k.z,k.radius])); });

await sec(2,async()=>{ const d0=TD('Y1S2',3,2);
  fresh(d0,15,'flower_notes',{FC:{n:{},gave:{},after:{},cnt:1,last:d0-9}}); let it=desk('flower_notes'); await ask(it,['「再想想。」']);
  check('2. 花序 看小卡：小卡的字、兩個選項「問花藝師。」「再想想。」',H.said[0].who===null&&H.said[0].t==='徵週末花藝助手　會拔葉子就可以'&&J(H.opts[0])===J(['「問花藝師。」','「再想想。」']),J(L())+J(H.opts));
  check('2. 花序「再想想。」＝花藝師「好，小卡我先不收。」；沒有應徵、小卡還在',saidBy('花藝師','好，小卡我先不收。')&&H.said.length===2&&!JOBS.job(H.G,'flower')&&it.hidden===false,J(L()));
  await ask(it,['「問花藝師。」','週六和週日']);
  check('2. 花序「問花藝師。」→ 花藝師「你上過課，知道花要怎麼拿。週末早上進貨最忙，能來嗎？」→ 班表（週六、週日、兩天、先不要）',J(L())===J([F9.notice,'花藝師：你上過課，知道花要怎麼拿。週末早上進貨最忙，能來嗎？'])&&J(H.opts[1])===J(['週六','週日','週六和週日','先不要'])&&J(JOBS.job(H.G,'flower').day)===J([6,7])&&toasts.includes('班表：花序　週六 09:00～13:00、週日 13:00～17:00'),J(L())+J(H.opts)+J(toasts));
  check('2. 花序：應徵以後按鈕換成「找花藝師」；這一週的週六就上',it.label==='找花藝師'&&JOBS.scheduled(H.G,'flower',TD('Y1S2',3,6)),it.label);
  fresh(d0,15,'tz_yuehaochi'); it=desk('tz_yuehaochi'); await ask(it,['「再想想。」']);
  check('2. 越好吃 看告示：「徵晚班外場　會端湯、不怕燙」、「問老闆娘。」「再想想。」→ 老闆娘「好。想來再跟我講。」',J(L())===J(['徵晚班外場　會端湯、不怕燙','老闆娘：好。想來再跟我講。'])&&J(H.opts[0])===J(['「問老闆娘。」','「再想想。」'])&&!JOBS.job(H.G,'yue'),J(L())+J(H.opts));
  await ask(it,['「問老闆娘。」','週四']);
  check('2. 越好吃「問老闆娘。」→ 老闆娘「你端過湯嗎？沒關係，第一天我教你。晚上最忙，能來嗎？」→ 班表（週二、週四、兩天、先不要）；toast 17:30～21:00',J(L())===J([Y9.notice,'老闆娘：你端過湯嗎？沒關係，第一天我教你。晚上最忙，能來嗎？'])&&J(H.opts[1])===J(['週二','週四','週二和週四','先不要'])&&J(JOBS.job(H.G,'yue').day)===J([4])&&toasts.includes('班表：越好吃小館　週四 17:30～21:00'),J(L())+J(H.opts)+J(toasts));
  fresh(d0,15,'xs_dakou'); it=desk('xs_dakou'); await ask(it,['「再想想。」']);
  check('2. 大口漢堡 看立牌：「徵櫃台、內場夥伴　早班、晚班、大夜班都缺」、「問店員。」「再想想。」→ 值班經理「好，立牌會一直放著。」',J(L())===J(['徵櫃台、內場夥伴　早班、晚班、大夜班都缺','值班經理：好，立牌會一直放著。'])&&J(H.opts[0])===J(['「問店員。」','「再想想。」'])&&!JOBS.job(H.G,'dakou'),J(L())+J(H.opts));
  await ask(it,['「問店員。」','先不要']);
  check('2. 大口漢堡「問店員。」→ 值班經理「學生嗎？考試週可以排少一點。你想排哪個時段？」；班表選「先不要」＝沒有應徵、立牌還在',J(L())===J([K9.notice,'值班經理：學生嗎？考試週可以排少一點。你想排哪個時段？'])&&!JOBS.job(H.G,'dakou')&&it.label==='看立牌',J(L())); });

await sec(3,async()=>{ const sat=TD('Y1S2',4,6), sun=sat+1; fresh(sat,8,'dorm'); hire('flower',[6,7]);
  check('3. 花序的時間：週六 9～13、週日 13～17',J(JOBS.hrs('flower',sat))===J([9,13])&&J(JOBS.hrs('flower',sun))===J([13,17]));
  let pay=await shift('flower',sat,['「先處理玫瑰。」','「問客人要不要寫小卡。」','「把落葉掃起來。」']);
  check('3. 花序第一班（新手）：三段各一句旁白＋選了的那一句＋最後一句第一句，照順序',J(L())===J([F9.segs[0].nov,'（刺要一根一根刮掉。你的手套破了一個洞。）',F9.segs[1].nov,'（客人想了很久，寫了兩個字，又塗掉重寫。）',F9.segs[2].nov,'（掃把一動，又掉了幾片。你決定等一下再掃一次。）','（下班的時候，花藝師把一枝賣相不好的玫瑰給你。花瓣邊邊有一點黑，還是很香。）']),J(L()));
  check('3. 花序小選擇的字照稿（每段兩個）',J(H.opts)===J(F9.segs.map(g=>g.ch.map(c=>c[0])))&&J(H.opts[0])===J(['「先處理玫瑰。」','「先換水。」']),J(H.opts));
  check('3. 花序：784 元、toast「花序 薪水 784 元」；13:00 下班、人還在店裡；那一枝玫瑰不進包包／物品',pay===784&&toasts.includes('花序 薪水 784 元')&&Math.abs(H.G.hour-13)<1e-6&&H.entered.length===0&&!(H.G.flags.GIFTH&&H.G.flags.GIFTH.bag&&H.G.flags.GIFTH.bag.length)&&!H.G.flags.GG3_OWN,pay+' '+H.G.hour+J(toasts));
  pay=await shift('flower',sun,['「先換水。」','「先包再說。」','「補花台上的花束。」']);
  check('3. 花序週日：另一個選擇的三句；最後一句輪到第二句（兩個班一起輪）',said('（十二個桶子，一個一個提。換完地上都是水。）')&&said('（包好了客人才說要換顏色。你拆開重包。）')&&said('（最貴的那一束賣掉了。你把第二貴的往前挪。）')&&said('（你的手指又是綠的。這次洗了兩次才洗掉。）')&&pay===784&&Math.abs(H.G.hour-17)<1e-6,J(L()));
  JOBS.job(H.G,'flower').skill=5; await shift('flower',sat+7);
  check('3. 花序熟練 5 以上：三段都換「熟練」那一句；最後一句輪回第一句',F9.segs.every(g=>said(g.exp)&&!said(g.nov))&&said('（霧面紙對折、抓皺、緞帶繞兩圈。你綁的結是正的。）')&&said(F9.end.all[0]),J(L()));
  const tue=TD('Y1S2',4,2); fresh(tue,16,'dorm'); hire('yue',[2,4]);
  pay=await shift('yue',tue,['「再跟客人確認一次。」','「喊『小心燙』。」','「先補豆芽和九層塔。」']);
  check('3. 越好吃第一班（新手）：三段＋選了的那一句＋最後一句第一句',J(L())===J([Y9.segs[0].nov,'（客人說對。旁邊那桌已經在舉手了。）',Y9.segs[1].nov,'（客人把手機往旁邊移了一下。）',Y9.segs[2].nov,'（豆芽一下就空了。你從冰箱又抱出一大盆。）','（九點。老闆娘端了一碗河粉給你，肉比賣的多。）']),J(L()));
  check('3. 越好吃：686 元、toast「越好吃小館 薪水 686 元」；21:00 下班；那一碗河粉不算一餐（沒有記吃過）',pay===686&&toasts.includes('越好吃小館 薪水 686 元')&&Math.abs(H.G.hour-21)<1e-6&&!(H.G.eat&&H.G.eat.n&&Object.keys(H.G.eat.n).length),pay+' '+H.G.hour+J(toasts));
  check('3. 越好吃：晚上的時段算一件；記一班、熟練 +1',CLS.slotRec(H.G).used.ev>0&&JOBS.job(H.G,'yue').shifts===1&&JOBS.job(H.G,'yue').skill===1);
  pay=await shift('yue',tue+2,['「直接報給廚房。」','「從客人右邊放下去。」','「先擦桌子。」']);
  check('3. 越好吃週四：另一個選擇的三句；最後一句輪到「（九點。你身上都是湯的味道，手指有檸檬味。）」',said('（老闆在裡面應了一聲。你聽不出來他有沒有聽清楚。）')&&said('（碗放下去的時候，客人說了謝謝。）')&&said('（門口有人在等位子。你擦得比平常快。）')&&said('（九點。你身上都是湯的味道，手指有檸檬味。）')&&pay===686,J(L())); });

await sec(4,async()=>{ const d0=TD('Y1S2',3,2); fresh(d0,15,'xs_dakou'); let it=desk('xs_dakou'); await ask(it,['「問店員。」','週一','再加一天：週六']);
  check('4. 大口漢堡三選二：先挑一天（週一、週四、週六、先不要）→ 再加一天（另外兩天）／就這一天',J(H.opts[1])===J(['週一','週四','週六','先不要'])&&J(H.opts[2])===J(['再加一天：週四','再加一天：週六','就週一一天'])&&J(JOBS.job(H.G,'dakou').day)===J([1,6]),J(H.opts));
  check('4. toast「班表：大口漢堡　週一 18:00～22:00、週六 22:00～02:00」；沒有灰的',toasts.includes('班表：大口漢堡　週一 18:00～22:00、週六 22:00～02:00')&&dims.every(x=>x.length===0),J(toasts)+J(dims));
  fresh(d0,15,'xs_dakou'); it=desk('xs_dakou'); await ask(it,['「問店員。」','週四','就週四一天']);
  check('4. 只選一天也可以（一週最多兩班）',J(JOBS.job(H.G,'dakou').day)===J([4]));
  fresh(d0,15,'xs_dakou'); hire('brunch',[6]); it=desk('xs_dakou'); await ask(it,['「問店員。」','週四']);
  check('4. 已經有一班別的打工：只能選一天（沒有「再加一天」）',H.opts.length===2&&J(JOBS.job(H.G,'dakou').day)===J([4]),J(H.opts));
  const mon=TD('Y1S2',5,1), thu=mon+3, sat=mon+5; fresh(mon,17,'dorm'); hire('dakou',[1,4]);
  let pay=await shift('dakou',mon,['「問內用還是外帶。」','「先炸薯條。」','「收托盤。」']);
  check('4. 晚班（新手）：三段＋選了的那一句＋晚班最後一句第一句；784、toast「大口漢堡 薪水 784 元」；22:00 下班、沒有回去睡',J(L())===J([K9.segs[0].nov,'（客人說內用，又說等一下，改外帶。）',K9.segs[1].nov,'（鹽要撒三下，手要甩。你甩到自己的制服上。）',K9.segs[2].nov,'（一疊托盤比你想的重。你分兩次拿下去。）','（十點，換班。你把帽子拿下來，頭髮上有一圈壓痕。）'])&&pay===784&&toasts.includes('大口漢堡 薪水 784 元')&&Math.abs(H.G.hour-22)<1e-6&&sleeps.length===0&&H.entered.length===0,J(L())+pay+J(toasts));
  pay=await shift('dakou',thu,['「先報金額。」','「先包漢堡。」','「擦桌子。」']);
  check('4. 週四晚班：另一個選擇的三句；最後一句輪到第二句（週一、週四同一組）',said('（客人低頭找零錢，後面的人往前站了一步。）')&&said('（包裝紙要對角折。你包的那一顆，醬從旁邊擠出來了。）')&&said('（有一桌留了一張便條紙，寫了半行公式。你沒有丟。）')&&said('（十點。你身上的油味，走到門外風一吹還在。）')&&!said(K9.end['1'][0])&&pay===784,J(L()));
  JOBS.job(H.G,'dakou').day=[1,6]; const d6=H.G.day;
  pay=await shift('dakou',sat);
  check('4. 大夜班：880 元、toast「大口漢堡 薪水 880 元」；最後一句是大夜班那一組的第一句（不是晚班的）',pay===880&&toasts.includes('大口漢堡 薪水 880 元')&&!toasts.includes('大口漢堡 薪水 784 元')&&said('（兩點。二樓還有三個人在讀書。你下班的時候，他們頭都沒有抬。）')&&!K9.end['1'].some(said),pay+J(toasts)+J(L()));
  check('4. 大夜班下班：照便利商店夜班（回去睡到隔天 10:00；記 JOB_NIGHT）',J(sleeps)===J([10])&&H.G.flags.JOB_NIGHT===sat,J(sleeps)+' '+H.G.flags.JOB_NIGHT);
  await shift('dakou',sat+7); check('4. 第二個大夜班：最後一句輪到「（兩點，換班的人來了。外面的路是空的，只有這一間的招牌還亮著。）」',said('（兩點，換班的人來了。外面的路是空的，只有這一間的招牌還亮著。）'));
  await shift('dakou',mon+14); check('4. 第三個晚班：最後一句輪回第一句（大夜班的不影響晚班那一組）',said(K9.end['1'][0]),J(L()));
  const e=JOBS.job(H.G,'dakou').endN; check('4. 存檔：輪到第幾句記在 G.jobs.dakou.endN（晚班一組、大夜班一組）',J(e)===J({'1':3,'6':2}),J(e));
  JOBS.job(H.G,'dakou').skill=5; await shift('dakou',mon+21); check('4. 熟練 5 以上：三段都換「熟練」那一句',K9.segs.every(g=>said(g.exp)&&!said(g.nov))&&said('（計時器響之前，你的手已經在籃子的把手上。）'),J(L()));
  /* 大夜班的隔天早上：別的打工 10:00 以前的班自動請假 */
  const sun=TD('Y1S2',8,7); fresh(sun-1,12,'dorm'); hire('dakou',[6],{since:sun-30}); hire('brunch',[7],{since:sun-30});
  check('4. 週六大夜班的隔天：早午餐週日 07:30 的班自動請假（night）；下午的班不受影響',JOBS.scheduled(H.G,'dakou',sun-1)&&JOBS.excused(H.G,'brunch',sun)==='night'&&!JOBS.due(H.G,'brunch',sun));
  hire('flower',[7],{since:sun-30}); check('4. 花序週日 13:00 的班照常',JOBS.due(H.G,'flower',sun)); });

await sec(5,async()=>{ const d0=TD('Y1S2',3,2);
  fresh(d0,15,'xs_dakou'); hire('yue',[4]); let it=desk('xs_dakou'); await ask(it,['「問店員。」','週四','週一']);
  check('5. 已經排了越好吃週四（17:30～21:00）：大口漢堡的週四（18:00～22:00）灰掉；選了灰的＝一句旁白「（這個時段你已經有班了。）」再回選單（AA_829 第 5 節第 1 點；舊期望：沒有多的字）',JOBS.busyWith(H.G,'dakou',4)==='yue'&&J(dims[1])===J(['週四'])&&J(dims[2])===J(['週四'])&&J(H.opts[1])===J(H.opts[2])&&J(JOBS.job(H.G,'dakou').day)===J([1])&&H.said.length===3&&H.said[2].who===null&&H.said[2].t==='（這個時段你已經有班了。）'&&!toasts.some(t=>!/^班表：/.test(t)),J(dims)+J(H.opts)+J(toasts));
  check('5. 週一、週六不灰',!JOBS.busyWith(H.G,'dakou',1)&&!JOBS.busyWith(H.G,'dakou',6));
  fresh(d0,15,'tz_yuehaochi'); hire('dakou',[4]); it=desk('tz_yuehaochi'); await ask(it,['「問老闆娘。」','週二']);
  check('5. 反過來（先排大口漢堡週四）：越好吃的週四灰掉（已經有一班＝本來就沒有「兩天」那一項）；週二可以',J(dims[1])===J(['週四'])&&J(H.opts[1])===J(['週二','週四','先不要'])&&J(JOBS.job(H.G,'yue').day)===J([2]),J(dims));
  /* 第一批也一樣：山嵐週三 18:00～22:00 和阿德影印週三 18:00～22:00 */
  fresh(d0,15,'xs_shanlan'); hire('copy',[3]); it=desk('xs_shanlan'); await ask(it,['「問店員。」','週日']);
  check('5. 第一批：已經排了阿德影印週三 → 山嵐書店的週三灰掉（只有一班的名額，沒有兩天那一項）；週日可以',JOBS.busyWith(H.G,'shanlan',3)==='copy'&&J(dims[1])===J(['週三'])&&J(JOBS.job(H.G,'shanlan').day)===J([7]),J(dims)+J(H.opts));
  fresh(d0,15,'wz_print'); hire('shanlan',[3]); JOBS.rec(H.G)._meta.asked.copy=d0; H.picks=['週三','週二']; dims.length=0; const got=await JOBS.pickDays(GM,'copy');
  check('5. 反過來：已經排了山嵐週三 → 阿德影印的週三灰掉',J(dims[0])===J(['週三'])&&J(got)===J([2]),J(dims)+J(got));
  /* 家教（週二或週四 19:00～21:00）也算已經排的班 */
  fresh(d0,15,'tz_yuehaochi',{JOB_TUTOR:true,TUTOR_WD:2,tutorFromDay:d0-10}); const tu=JOBS.tutorOn(H.G);
  check('5. 有家教（週二 19:00～21:00）：越好吃的週二灰掉、週四不灰',tu&&JOBS.busyWith(H.G,'yue',2)==='tutor'&&!JOBS.busyWith(H.G,'yue',4),String(tu));
  /* 過了午夜的班：便利商店週五 22:00～02:00 不撞週六早上；大口漢堡週六大夜班不撞便利商店週五夜班 */
  /* 2026-11-12（AA_829 第 5 節第 6 點）：大夜班隔天 10:00 以前的班選班的時候就灰掉。舊期望：便利商店週五夜班和花序週六 09:00 不灰（當天才自動請假）*/
  fresh(d0,15,'xs_dakou'); hire('cvs',[5]); check('5. 便利商店週五夜班（到週六 02:00）：大口漢堡週六 22:00 不灰；花序週六 09:00（隔天 10:00 以前）灰掉、週日 13:00 不灰',!JOBS.busyWith(H.G,'dakou',6)&&JOBS.busyWith(H.G,'flower',6)==='cvs'&&!JOBS.busyWith(H.G,'flower',7));
  H.G.flags.FC={n:{},gave:{},after:{},cnt:1,last:d0-3}; at(d0,15,'flower_notes'); it=desk('flower_notes'); await ask(it,['「問花藝師。」','週六','週日']);
  check('5. 選班的時候就灰掉：花序的週六灰、選了＝那一句旁白再回選單；改選週日',dims.some(x=>x.includes('週六'))&&said('（這個時段你已經有班了。）')&&J(JOBS.job(H.G,'flower').day)===J([7]),J(dims)+J(L()));
  fresh(d0,15,'xs_dakou'); hire('dakou',[6]); check('5. 大口漢堡週六大夜班：早午餐週日 07:30 灰掉；花序週日 13:00、越好吃週二不灰',JOBS.busyWith(H.G,'brunch',7)==='dakou'&&!JOBS.busyWith(H.G,'flower',7)&&!JOBS.busyWith(H.G,'yue',2)&&!JOBS.busyWith(H.G,'brunch',6));
  fresh(d0,15,'xs_dakou'); hire('brunch',[7]); it=desk('xs_dakou'); await ask(it,['「問店員。」','週六','週一']);
  check('5. 反過來（先有早午餐週日 07:30）：大口漢堡的週六大夜班灰掉；選了＝那一句旁白；可以只選一班（週一；第 5 節第 2 點）',JOBS.busyWith(H.G,'dakou',6)==='brunch'&&dims[1].includes('週六')&&said('（這個時段你已經有班了。）')&&J(JOBS.job(H.G,'dakou').day)===J([1]),J(dims)+J(JOBS.job(H.G,'dakou')&&JOBS.job(H.G,'dakou').day));
  fresh(d0,15,'xs_dakou'); hire('cafe',[6]); check('5. 兩點半 Café 週六下午和花序週六 09:00～13:00 照實際的時間比',JOBS.busyWith(H.G,'flower',6)===(JOBS.hrsWd('cafe',6)[0]<13?'cafe':null));
  fresh(d0,15,'xs_dakou'); hire('yue',[4],{gone:'quit'}); check('5. 辭掉的工作不算',!JOBS.busyWith(H.G,'dakou',4)); });

await sec(6,async()=>{ const d0=TD('Y1S2',3,2); fresh(d0,15,'tz_yuehaochi');
  const t0=CLS.termCourses, was=COURSES.blocks.pm2; CLS.termCourses=()=>[{id:'x',slots:[{wd:2,block:'pm2'}]}];
  try{ check('6. 週二下午第二堂有課（到 17:20）：越好吃週二 17:30 的班照樣可以選（照實際的時間比）',!!was&&was.t1<17.5&&!JOBS.classOn(H.G,'yue',2));
    check('6. 對照：同一堂課，照時段比的店（山嵐不受影響；下午的茶屋那一類照舊算撞）',JOBS.classOn(H.G,'yue',2)===false&&JOBS.classOn(H.G,'shanlan',3)===false);
    COURSES.blocks.zz={t0:18.5,t1:20.5}; CLS.termCourses=()=>[{id:'y',slots:[{wd:4,block:'zz'}]}];
    check('6. 週四晚上有課（18:30～20:30）：越好吃週四、大口漢堡週四不列',JOBS.classOn(H.G,'yue',4)&&JOBS.classOn(H.G,'dakou',4)&&!JOBS.classOn(H.G,'dakou',1));
    const it=desk('tz_yuehaochi'); await ask(it,['「問老闆娘。」','週二']); check('6. 班表只列週二',J(H.opts[1])===J(['週二','先不要']),J(H.opts));
  } finally { CLS.termCourses=t0; delete COURSES.blocks.zz; }
  fresh(d0,15,'tz_yuehaochi'); hire('cvs',[2]); hire('shanlan',[3]); const it2=desk('tz_yuehaochi'); await ask(it2,['「問老闆娘。」']);
  check('6. 已經有兩班（和其他打工合計）：不能再排（現有的 toast）',!JOBS.job(H.G,'yue')&&toasts.includes('一週最多兩班（所有打工加起來）')&&JOBS.cap(H.G,'yue')===0,J(toasts)); });

await sec(7,async()=>{ const sat=TD('Y1S2',6,6); const G=fresh(sat,8.75,'gongguan',{FC:{n:{},gave:{},after:{},cnt:1,last:sat-20}}); hire('flower',[6],{since:sat-20});
  check('7. 花序週六 08:45（還沒開店）：有班的人＝JOBS.early；店沒開（FNS.open 假）',FNS.open(G)===false&&JOBS.early(G,'flower_notes')===true&&JOBS.due(G,'flower',sat));
  let doorSaid=0; const d0=FNS.door; FNS.door=async()=>{ doorSaid++; return true; };
  try{ await STORY.interact({fnDoor:true,label:'進入花序'},GM); check('7. 有班：店門不演「還沒開」那一段（照平常的門進去）',doorSaid===0);
    JOBS.job(G,'flower').day=[7]; await STORY.interact({fnDoor:true,label:'進入花序'},GM); check('7. 今天沒有班：店門照舊演沒開那一段',doorSaid===1&&!JOBS.early(G,'flower_notes'));
  } finally { FNS.door=d0; }
  JOBS.job(G,'flower').day=[6]; at(sat,8.9,'flower_notes'); H.entered=[]; H.said=[]; H.E.player.busy=false; const r=XSCLOSE.tick(GM); await new Promise(z=>setTimeout(z,5));
  check('7. 有班的人 08:54 在店裡：不會被請出去',r===false&&H.entered.length===0&&H.G.zone==='flower_notes',J([r,H.entered]));
  check('7. 班的時間到＝可以開班（按鈕「開始上班」）',(()=>{ const it=desk('flower_notes'); return JOBS.shiftNow(G,'flower')&&it.label==='開始上班'; })());
  JOBS.job(G,'flower').day=[7]; at(sat,8.9,'flower_notes'); H.entered=[]; const r2=XSCLOSE.tick(GM); await new Promise(z=>setTimeout(z,5));
  check('7. 對照：今天沒有班的人 08:54 在店裡＝照舊請出去',r2===true&&H.entered.length===1,J([r2,H.entered]));
  at(sat,13.5,'flower_notes'); JOBS.job(G,'flower').day=[6]; check('7. 下班以後不算（JOBS.early 假；店開著本來就不請）',!JOBS.early(G,'flower_notes'));
  /* 越好吃做到 21:00 打烊 */
  const tue=TD('Y1S2',6,2); fresh(tue,16,'dorm'); hire('yue',[2]); await shift('yue',tue);
  check('7. 越好吃下班（21:00 打烊）：那天在這間店打工＝不說打烊那一句（GG3.gen 假；XSCLOSE.staffToday）',XSCLOSE.staffToday(H.G,'tz_yuehaochi')&&GG3.gen(GM,'tz_yuehaochi')===false);
  fresh(tue,21.1,'tz_yuehaochi'); check('7. 對照：客人 21:06 還在店裡＝照舊說打烊那一句',GG3.gen(GM,'tz_yuehaochi')===true); });

await sec(8,async()=>{ const sat=TD('Y1S2',6,6), tue=sat+3, mon=sat+2; fresh(sat,8.6,'dorm'); hire('flower',[6],{since:sat-20}); hire('yue',[2],{since:sat-20});
  JOBS.plan(H.G); const q=OUT.get(H.G,'job_flower_'+sat), S0=FLOWER_NOTES_LAYOUT.spawn;
  check('8. 出門提醒：花序的班（09:00～13:00）、「這週請假」、帶到花序的店門內',!!q&&q.h===9&&q.title==='花序的班（09:00～13:00）'&&q.no==='這週請假'&&q.goto.zone==='flower_notes'&&q.goto.x===S0.x&&q.goto.z===S0.z,J(q));
  at(tue,17.1,'dorm'); JOBS.plan(H.G); const q2=OUT.get(H.G,'job_yue_'+tue), S1=TZ_SHOPS_LAYOUT.yuehaochi.spawn;
  check('8. 出門提醒：越好吃小館的班（17:30～21:00）、帶到店門內',!!q2&&q2.h===17.5&&q2.title==='越好吃小館的班（17:30～21:00）'&&q2.goto.zone==='tz_yuehaochi'&&q2.goto.x===S1.x&&q2.goto.z===S1.z,J(q2));
  fresh(mon,17.6,'dorm'); hire('dakou',[1,6],{since:mon-20}); JOBS.plan(H.G); const q3=OUT.get(H.G,'job_dakou_'+mon);
  check('8. 出門提醒：大口漢堡的班（18:00～22:00）、帶到一樓店門內',!!q3&&q3.h===18&&q3.title==='大口漢堡的班（18:00～22:00）'&&q3.goto.zone==='xs_dakou'&&q3.goto.x===DK3.ENTER.x&&q3.goto.z===DK3.ENTER.z,J(q3));
  at(mon+5,21.6,'dorm'); JOBS.plan(H.G); const q4=OUT.get(H.G,'job_dakou_'+(mon+5)); check('8. 大夜班的出門提醒：大口漢堡的班（22:00～02:00）',!!q4&&q4.h===22&&q4.title==='大口漢堡的班（22:00～02:00）',J(q4));
  at(mon+1,15,'xs_dakou'); const it=desk('xs_dakou'); await ask(it,['（辭職）']);
  check('8. 找值班經理 →（算了）／（辭職）；辭職＝值班經理「有空回來看看」（現有的那一句）',saidBy('值班經理','有空回來看看')&&JOBS.job(H.G,'dakou').gone==='quit'&&J(H.opts[0])===J(['（算了）','（辭職）']),J(L())+J(H.opts)); });

await sec(9,async()=>{ const d=TD('Y2S1',3,6); const G=fresh(d,8.9,'flower_notes');
  delete G.jobs; delete G.flags.FC; let err=''; try{ JOBS.track(G); JOBS.plan(G); JOBS.phone(G); JOBS.tick(GM); XSCLOSE.tick(GM); await new Promise(z=>setTimeout(z,5)); }catch(e){ err=String(e&&e.stack||e).split('\n').slice(0,2).join(' / '); }
  check('9. 舊存檔沒有 G.jobs、沒有 G.flags.FC：每一格、手機、出門提醒都不丟例外',err==='',err);
  check('9. 舊存檔：沒有這三份工作、花序沒有小卡、不算有班（JOBS.early 假）、沒有班表衝突',['flower','yue','dakou'].every(k=>JOBS.job(G,k)===null&&JOBS.at(G,k)===null)&&!JOBS.eligible(G,'flower')&&!JOBS.early(G,'flower_notes')&&!JOBS.busyWith(G,'dakou',4)&&G.flags.FC===undefined);
  at(d,15,'xs_dakou'); G.jobs={brunch:{since:d-30,from:(d-30)*24,day:[6],shifts:4,skill:4,worked:[],chk:d-1},_meta:{n:{brunch:5},asked:{}}}; err=''; try{ JOBS.track(G); JOBS.plan(G); JOBS.phone(G); JOBS.tick(GM); }catch(e){ err=String(e); }
  check('9. 舊存檔只有早午餐的班：照常（早午餐還在、新的三份沒有）',err===''&&JOBS.active(G,'brunch')&&!JOBS.job(G,'dakou')&&JOBS.used(G)===1,err);
  const it=desk('xs_dakou'); await ask(it,['「問店員。」','週一']); await shift('dakou',d+2);
  const g2=JSON.parse(J(G)); check('9. 新的欄位存檔 JSON 來回不壞（G.jobs.dakou：endN、班數；沒有新的最上層欄位）',J(g2.jobs)===J(G.jobs)&&g2.jobs.dakou.shifts===1&&g2.jobs.dakou.endN['1']===1&&!('shopJobs' in g2),J(g2.jobs.dakou)); });

await sec(10,async()=>{
  /* 第 5 節第 4 點：大夜班下班回祐廷現在住的地方睡到 10:00（旁白不寫地點）；便利商店夜班比照 */
  const sat=TD('Y1S2',6,6); fresh(sat,21,'dorm'); hire('dakou',[6]); await shift('dakou',sat);
  check('10. 住宿舍：大夜班下班回宿舍、睡到 10:00；沒有寫地點的旁白（最後一句是大夜班那一句）',JOBS.liveAt(H.G)==='dorm'&&J(H.entered)===J(['dorm'])&&J(sleeps)===J([10])&&H.said[H.said.length-1].t===K9.end['6'][0]&&!H.said.some(s=>/宿舍|套房|回到/.test(s.t)),J(H.entered)+J(sleeps));
  const h0={suite:HOME.suite,pg:HOME.pgHome,go:HOME.go,at:HOME.at}; try{
    fresh(sat,21,'dorm'); hire('dakou',[6]); HOME.suite=()=>true; await shift('dakou',sat);
    check('10. 住公館的套房：不走回宿舍，直接睡到 10:00（醒來在哪裡照 STORY.sleepNow：套房＝公館）',JOBS.liveAt(H.G)==='suite'&&!H.entered.includes('dorm')&&J(sleeps)===J([10]),J(H.entered)+J(sleeps));
    HOME.suite=h0.suite; const fri=TD('Y1S2',6,5); fresh(fri,21,'cvs'); hire('cvs',[5]); HOME.suite=()=>true; H.entered=[]; sleeps.length=0; await JOBS.nightSleep(GM,fri);
    check('10. 便利商店夜班比照（同一支 JOBS.nightSleep）',!H.entered.includes('dorm')&&J(sleeps)===J([10])&&H.G.flags.JOB_NIGHT===fri);
    HOME.suite=h0.suite; let went=0; HOME.pgHome=()=>true; HOME.at=()=>false; HOME.go=async()=>{ went++; }; fresh(fri,26,'xs_dakou'); H.entered=[]; sleeps.length=0; await JOBS.nightSleep(GM,fri);
    check('10. 住家裡：回家（家裡的那一套接手），不進宿舍',JOBS.liveAt(H.G)==='home'&&went===1&&!H.entered.includes('dorm')&&sleeps.length===0,J([went,H.entered,sleeps]));
  } finally { HOME.suite=h0.suite; HOME.pgHome=h0.pg; HOME.go=h0.go; HOME.at=h0.at; }
  /* 越好吃上班時同學來吃飯——點餐那一段後面。AA_828 第 5 節第 6 點（企劃線 d8afcca6ed）：不用 meal_hello，改 SHOP_JOBS_AA828.yueMeal 那一組；照人各記一次（第二次只有旁白）；阿哲、可昕各自一句；「他／她」照對方性別。
     舊期望（AA_829 第 5 節第 7 點，34f35eb15a）：照平常的 meal_hello 一句＋「（你幫他點了餐。）」、同一個人第二次來什麼都沒有——照 AA_828 第 5 節改了。 */
  const Y8=typeof SHOP_JOBS_AA828!=='undefined'&&SHOP_JOBS_AA828?SHOP_JOBS_AA828.yueMeal:null;
  if(!Y8||typeof JOBS.yueMealRun!=='function'){ check('10. 有 SHOP_JOBS_AA828.yueMeal、JOBS.yueMealRun',false); }
  else { const MXI='classmate_mingxuan', XC='classmate_xinci', mh0=JOBS.mealHere, ML=(typeof SHOP_MEET_LINES!=='undefined'&&SHOP_MEET_LINES.mealHello[MXI]||{base:[]}).base; const tue=TD('Y1S2',4,2); fresh(tue,16,'dorm'); hire('yue',[2,4]); let here=[MXI]; let askedAt=[];
    const nm=id=>SOCIAL.displayName(id), P3=['「再跟客人確認一次。」','「喊『小心燙』。」','「先補豆芽和九層塔。」'];
    try{ JOBS.mealHere=(G,id)=>{ askedAt.push([G.zone,G.hour]); return here.includes(id)?'dinner':null; };
      check('10. 會來的人：meal_hello 那一群＋有自己句子的阿哲、可昕',JOBS.yueMealIds().includes(MXI)&&JOBS.yueMealIds().includes('zhe')&&JOBS.yueMealIds().includes('kexin')&&CHARACTERS.zhe.name==='阿哲'&&CHARACTERS.kexin.nickname==='可昕'&&JOBS.yueOwn(CHARACTERS[MXI])===null,J(JOBS.yueMealIds()));
      await shift('yue',tue,P3); const T=H.said.map(s=>[s.who,s.t]);
      check('10. 越好吃：點餐那一段後面＝旁白（門口的鈴……）→ 他「你在這裡打工喔？」→ 祐廷「對。要吃什麼？」→「（你幫他點了餐。）」，然後才是端湯；不說 meal_hello',J(T.slice(0,7))===J([[null,Y9.segs[0].nov],[null,'（客人說對。旁邊那桌已經在舉手了。）'],[null,'（門口的鈴響了。進來的人看到你穿著圍裙，停了一下。）'],[nm(MXI),'你在這裡打工喔？'],[H.G.name,'對。要吃什麼？'],[null,'（你幫他點了餐。）'],[null,Y9.segs[1].nov]])&&T.length===11&&!ML.some(t=>said(t)),J(T.slice(0,7)));
      check('10. 問的時候人在店裡、是點餐的時候（17:30）；記 G.jobs.yue.mealHi、他那一餐算打過招呼（不動 meal_hello 輪到第幾句）',askedAt.length>0&&askedAt.every(a=>a[0]==='tz_yuehaochi'&&Math.abs(a[1]-17.5)<1e-6)&&J(JOBS.job(H.G,'yue').mealHi)===J([MXI])&&J(H.G.flags.SHOP_MEAL_HI[MXI])===J([tue,'dinner',0]),J(askedAt.slice(0,2))+J(JOBS.job(H.G,'yue').mealHi)+J(H.G.flags.SHOP_MEAL_HI));
      await shift('yue',tue+2,['「直接報給廚房。」']); check('10. 同一個人第二次來＝只出旁白「（你幫他點了餐。）」，不再問（舊期望：什麼都沒有）',H.said.length===8&&H.said[2].who===null&&H.said[2].t==='（你幫他點了餐。）'&&!said('你在這裡打工喔？')&&!said(Y8.narr)&&!said(Y8.me),J(L()));
      here=['zhe']; await shift('yue',tue+7,P3); check('10. 阿哲第一次來：他自己的那一句「欸！你在這裡打工？那我可以多加肉嗎？」（不說通用的）',saidBy(nm('zhe'),'欸！你在這裡打工？那我可以多加肉嗎？')&&!said('你在這裡打工喔？')&&said(Y8.narr)&&saidBy(H.G.name,'對。要吃什麼？')&&said('（你幫他點了餐。）')&&J(JOBS.job(H.G,'yue').mealHi)===J([MXI,'zhe']),J(L()));
      here=['kexin',XC]; await shift('yue',tue+9,P3); const T3=H.said.map(s=>[s.who,s.t]);
      check('10. 可昕第一次來：「你在這裡打工？……排幾點到幾點？」；女生＝「（你幫她點了餐。）」；芯慈（女生、沒有自己的句子）＝通用句＋「她」',saidBy(nm('kexin'),'你在這裡打工？……排幾點到幾點？')&&saidBy(nm(XC),'你在這裡打工喔？')&&H.said.filter(s=>s.t==='（你幫她點了餐。）'&&s.who===null).length===2&&!said('（你幫他點了餐。）')&&H.said.filter(s=>s.t===Y8.narr).length===2&&JOBS.job(H.G,'yue').mealHi.length===4,J(T3.slice(2,10)));
      here=['kexin']; await shift('yue',tue+14); check('10. 可昕第二次來＝只有「（你幫她點了餐。）」',H.said.length===8&&H.said[2].t==='（你幫她點了餐。）'&&!said('你在這裡打工？……排幾點到幾點？'),J(L()));
      here=[]; fresh(tue,16,'dorm'); hire('yue',[2,4]); await shift('yue',tue); check('10. 沒有同學來：照原本的七句',H.said.length===7&&!said('（你幫他點了餐。）')&&!said(Y8.narr));
      here=[MXI]; fresh(tue,16,'dorm'); hire('yue',[2],{mealHi:[MXI]}); await shift('yue',tue); check('10. 舊存檔（舊規則下他已經來過、記在 mealHi）：只出旁白、不壞',H.said.length===8&&H.said[2].t==='（你幫他點了餐。）');
      here=[MXI]; fresh(tue,16,'dorm'); hire('flower',[6,7]); await shift('flower',TD('Y1S2',4,7)); check('10. 別間店（花序）不會有這一段',H.said.length===7&&!said('（你幫他點了餐。）')&&!said(Y8.narr));
    } finally { JOBS.mealHere=mh0; }
    fresh(tue,17.5,'tz_yuehaochi'); check('10. JOBS.mealHere（沒有換掉的）：沒有排進這間店吃飯的人＝null、不丟例外',JOBS.mealHere(H.G,MXI)===null||typeof JOBS.mealHere(H.G,MXI)==='string'); }
  const g2=JSON.parse(J(H.G)); check('10. 存檔 JSON 來回不壞',J(g2.jobs)===J(H.G.jobs)); });

console.log(H.fails?'FAILED '+H.fails:'ALL PASS'); process.exit(H.fails?1:0);
})();
