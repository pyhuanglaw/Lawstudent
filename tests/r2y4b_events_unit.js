// 事件包第 2 輪之三（後半）：大四下、畢業後篇、尾聲（AA_327 2-Y4-31～61，AA-C 定稿 e284d601；src/data/r2y4b_events.js、src/r2y4b3d.js）——不需要瀏覽器。
// 照 AA_327 每一件的「給 BB 的驗收情境」逐件檢查（台詞只查有沒有出現、出現在哪一段；不改字）。45、49 已在 AA_319（postgrad3d.js），這裡只確認還在；
// 42、51 的一部分、53、60 在 AA_319／AA_331 那一批（postgrad3d.js）已經有，這裡查 AA_327 的驗收點。
// 修改前：沒有 src/r2y4b3d.js、src/data/r2y4b_events.js（第 0 項 FAIL，其他全部跟著 FAIL）。用法：node tests/r2y4b_events_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };   // 地點字幕（{scene}、GM.caption）
const memos=[]; GM.memo=t=>{ memos.push(t); };
let paid=[]; GM.money=(n,why)=>{ paid.push([n,why]); if(H.G) H.G.money=(H.G.money|0)+n; };
global.CG_REGISTRY={};   // adv3d.js 沒有載入：CG 都還沒登錄（hasCG 守門＝不放）
load('src/noodle_closed3d.js');
const hasFiles=fs.existsSync(path.join(H.ROOT,'src/r2y4b3d.js'))&&fs.existsSync(path.join(H.ROOT,'src/data/r2y4b_events.js'));
if(hasFiles){ load('src/data/r2y4b_events.js'); load('src/r2y4b3d.js'); }
const idx=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
check('0. 載入、事件登記、掛勾登記（PHONE_RULES、TICKS、ACTIVITIES、CLS.IN_CLASS、PG.MSGS／STEPS／stops、尾聲掛勾）、index.html 有載入（在 postgrad3d.js、noodle_closed3d.js 後面）',
  hasFiles&&typeof R2Y4B!=='undefined'&&Array.isArray(R2Y4B_EVENTS)&&R2Y4B_EVENTS.every(e=>STORY_EVENTS.includes(e))&&STORY.PHONE_RULES.length>0&&STORY.TICKS.length>0&&ACTIVITIES.list.some(a=>a.id==='act_bar_study')&&CLS.IN_CLASS.length>0
  &&PG.MSGS.some(m=>m.tag==='y4_last_meal')&&PG.STEPS.some(s=>s.id==='r2y4b_multi_pre')&&PG.stops.length>0&&PG.EPI_AFTER_CG.length>0&&PG.EPI_AFTER_ITEMS.length>0
  &&/src\/data\/r2y4b_events\.js/.test(idx)&&idx.indexOf('src/r2y4b3d.js')>idx.indexOf('src/postgrad3d.js')&&idx.indexOf('src/r2y4b3d.js')>idx.indexOf('src/noodle_closed3d.js')&&idx.indexOf('src/r2y4b3d.js')>idx.indexOf('src/data/r2y4b_events.js'));
if(H.fails){ H.done(); }
const S=R2Y4B, D=k=>STORY.dayOfKey(k);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const fresh=(key,h,zone,flags,route)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; E.player.obj.position.x=0; E.player.obj.position.z=0; caps.length=0; memos.length=0; paid=[]; return G; };
const at=(key,h)=>{ H.at(key,h); };
const phone=()=>{ S.phone(H.G,GM); PHONE.tick(H.G); };
const pg=()=>{ PG.rules(GM); PHONE.tick(H.G); };
const has=t=>H.said.some(s=>s.t===t);
const iOf=t=>H.said.findIndex(s=>s.t===t);
const th=t=>(H.G.msgs||[]).filter(m=>m.th===t).map(m=>m.text);
const sent=tag=>PHONE.sent(H.G,tag);
const answer=(askId,k)=>PHONE.answer(H.G,askId,k);
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.cgs=[]; H.cards=[]; caps.length=0; H.picks=picks||[]; await EVENTS.run(ev(id)); };
const goOut=async(id,picks)=>{ const q=OUT.get(H.G,id); H.said=[]; H.opts=[]; H.cgs=[]; H.cards=[]; caps.length=0; H.picks=picks||[]; if(!q) return false; await OUT.go(GM,q); return true; };
const grp=()=>PHONE.join(H.G,'noodle_team','麵店團');
const contact=(...ids)=>{ for(const id of ids) INV.addContact(H.G,id); };
const ACQ=id=>H.rel(id,8,0,0);
const dueHas=id=>{ const now=H.G.day*24+H.G.hour; return PG.pending(H.G).some(p=>p.s.id===id&&p.t<=now+1e-6&&(!p.s.ready||p.s.ready(H.G))); };   /* PG.due 只回最早的那一件（AA_319 的放榜那幾件可能也在等）*/
const date=id=>H.date(id);
(async()=>{
  /* ===== 2-Y4-31 杜鵑花第四張 ===== */
  { fresh('2029-03-08',11,'dorm'); ACQ('heroine_01'); H.FAMILIAR('yu'); contact('heroine_01'); grp(); at('2029-03-08',12+10/60); phone();
    check('2-Y4-31 12:10 有點熟以上：以安私訊「杜鵑開了」「十二點半 老位置」', JSON.stringify(th('p:heroine_01'))===JSON.stringify(['杜鵑開了','十二點半 老位置']), JSON.stringify(th('p:heroine_01')));
    at('2029-03-08',12.5); H.G.zone='campus'; E.player.obj.position.x=-20; E.player.obj.position.z=8;
    check('2-Y4-31 12:25～12:55 走到椰林大道的杜鵑＝演（不在大道上＝不演）', S.azaleaDue(H.G,GM)&&(()=>{ E.player.obj.position.z=40; const r=S.azaleaDue(H.G,GM); E.player.obj.position.z=8; return !r; })());
    H.picks=[0]; await run('ev_azalea_y4',[0]);
    check('Z1 朋友：「第四張。」；四張排在一起；選項三個；AZALEA_Y4 shot', has('（把手機遞給你）第四張。')&&has('（她把四張照片排在一起給你看。同一棵樹，同一個位置。）')&&has('一樣才對。')&&H.opts[0].length===3&&H.G.flags.AZALEA_Y4==='shot'&&!has('麻煩你。……兩個人。')); }
  { fresh('2029-03-08',12.5,'campus'); ACQ('heroine_01'); date('heroine_01'); H.FAMILIAR('yu'); global.CG_REGISTRY.cg_azalea_fourth_heroine01={file:'x.webp',title:'t'}; await run('ev_azalea_y4');
    const pen='（她翻開手帳，在這一張照片的旁邊寫了一行字：「這一張要有兩個人。」）';
    check('Z2 交往中：「麻煩你。……兩個人。」；CG-18 在拍下去的那一刻（手帳那一行之前）；手帳那一行是旁白、她不唸', has('麻煩你。……兩個人。')&&H.cgs.includes('cg_azalea_fourth_heroine01')&&has(pen)&&H.said.find(s=>s.t===pen).who===null&&!has('第四張。')&&H.G.flags.AZALEA_Y4==='two');
    delete global.CG_REGISTRY.cg_azalea_fourth_heroine01;
    H.said=[]; H.cgs=[]; await (async()=>{ fresh('2029-03-08',12.5,'campus'); ACQ('heroine_01'); date('heroine_01'); await run('ev_azalea_y4'); })();
    check('2-Y4-31 CG 沒登錄＝不放（hasCG 守門）', !H.cgs.length&&has('麻煩你。……兩個人。')); }
  { fresh('2029-03-08',12.5,'campus'); H.rel('heroine_01',2,0,0); H.FAMILIAR('yu'); grp(); E.player.obj.position.x=-20; E.player.obj.position.z=8;
    const ok=EVENTS.check(ev('ev_azalea_y4')); await run('ev_azalea_y4');   /* 開演前先定版本：EVENTS.run 一開始的 SOCIAL.meet 會把熟悉度補到 5 */
    check('2-Y4-31 還不熟：小語拍「笑一個嘛！」「不要。」；AZALEA_Y4 yu；12:40 群組照片', ok&&has('（她請小語拍。）')&&has('笑一個嘛！')&&has('不要。')&&!has('（把手機遞給你）第四張。')&&H.G.flags.AZALEA_Y4==='yu'&&(at('2029-03-08',12.7),PHONE.tick(H.G),th('g:noodle_team').some(t=>/^📷/.test(t)))); }
  { fresh('2029-03-08',12.5,'campus'); H.FRIEND('heroine_01'); H.G.flags.EX_heroine_01=true; H.FAMILIAR('yu'); E.player.obj.position.x=-20; E.player.obj.position.z=8; EVENTS.check(ev('ev_azalea_y4')); await run('ev_azalea_y4');
    check('2-Y4-31 和她分開過：也是小語拍；分開過的沒有 12:10 私訊', has('笑一個嘛！')&&H.G.flags.AZALEA_Y4==='yu'&&(()=>{ fresh('2029-03-08',12,'dorm'); H.FRIEND('heroine_01'); H.G.flags.EX_heroine_01=true; contact('heroine_01'); at('2029-03-08',12.2); phone(); return !th('p:heroine_01').length; })()); }
  { fresh('2029-03-08',12,'dorm'); ACQ('heroine_01'); grp(); at('2029-03-08',13); phone();
    check('2-Y4-31 沒到：12:55 以後 AZALEA_Y4 missed、12:40 群組一張照片', H.G.flags.AZALEA_Y4==='missed'&&th('g:noodle_team').some(t=>/^📷/.test(t))); }
  /* ===== 2-Y4-32 明軒 M4 ===== */
  { fresh('2029-03-08',19,'noodle'); H.FAMILIAR('classmate_mingxuan'); H.FAMILIAR('zhe'); SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY','');
    check('2-Y4-32 3/8 19:00 在麵店＝演', EVENTS.check(ev('ev_mingxuan_saved'))&&!!ev('ev_mingxuan_saved').spawn);
    await run('ev_mingxuan_saved');
    check('M1 在麵店、有 SAW_HIM_STUDY：「我存夠了！」；阿哲「……我恨你。」；耳語「你有看到一點點。」；沒有「獎學金」；MX_SAVED there', has('（衝進來，手機舉得很高）我存夠了！')&&has('……我恨你。')&&has('你有看到一點點。')&&!H.said.some(s=>/獎學金/.test(s.t))&&H.G.flags.MX_SAVED==='there'); }
  { fresh('2029-03-08',19,'noodle'); H.FAMILIAR('classmate_mingxuan'); await run('ev_mingxuan_saved');
    check('2-Y4-32 沒有 SAW_HIM_STUDY／SAW_HIM_TRY：沒有耳語', has('德國，一年。九月走。……錢是我自己存的。')&&has('（喘氣）家教三年、暑假打工兩次。都沒跟你們說。')&&!has('你有看到一點點。')); }
  { fresh('2029-03-08',18,'dorm'); H.FAMILIAR('classmate_mingxuan'); grp(); at('2029-03-08',21); phone();
    check('M2 不在麵店：21:00 群組「我存夠了！德國！九月走！」；MX_SAVED heard', th('g:noodle_team').includes('我存夠了！德國！九月走！')&&H.G.flags.MX_SAVED==='heard'); }
  /* ===== 2-Y4-33 國考讀書會 ===== */
  { const A=ACTIVITIES.list.find(a=>a.id==='act_bar_study'), ds=A.dates;
    check('2-Y4-33 作息：每週四 20:00～22:00、總圖 B1；3/1（第 2 週）起，國定假日、第 16 週不開，暑假到 7/5（7/12 是 AA_319 的最後衝刺）', A.t0===20&&A.t1===22&&ds[0]==='2029-03-01'&&!ds.includes('2029-02-22')&&!ds.includes('2029-06-07')&&ds.includes('2029-06-14')&&ds[ds.length-1]==='2029-07-05'&&!ds.includes('2029-07-12')&&ds.every(k=>CALENDAR.dateOf(D(k)).wd%7===4)&&ds.every(k=>!CALENDAR.holiday(D(k))), ds.join(' '));
    fresh('2029-03-01',19.9,'library_hall',{Y4_PATH:'bar'}); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('classmate_bohan');
    check('2-Y4-33 Y4_PATH bar 才有（研究所、交換延畢沒有；5/10 才報名的 BAR_REG 從那一週起有）', !A.skip(H.G)&&A.skip(Object.assign({},H.G,{flags:{Y4_PATH:'grad'}}))&&A.skip(Object.assign({},H.G,{flags:{Y4_PATH:'bar',EXCHANGE_ROUTE:'JP'}}))&&!A.skip(Object.assign({},H.G,{flags:{Y4_PATH:'grad',BAR_REG:true}})));
    const e1=CLS.clubEvent(H.G,A);
    check('2-Y4-33 第一次去：clubEvent 是 ev_bar_study_first', !!e1&&e1.id==='ev_bar_study_first');
    await run('ev_bar_study_first',[0]);
    check('B1 3/1 第一次：「誰遲到誰買飲料。」；柏翰「國考還是要考。」；「好。」→ 小語、阿哲；BAR_STUDY_N 1', has('每週四。八點到十點。誰遲到誰買飲料。')&&has('我研究所上了，國考還是要考。一起念吧。')&&has('那今天誰買飲料？')&&has('……我。我剛剛遲到。')&&H.G.flags.BAR_STUDY_N===1);
    at('2029-03-08',20); const e2=CLS.clubEvent(H.G,A); await run('ev_bar_study_week');
    check('2-Y4-33 之後每次一句（輪流）：第二次是阿哲「我第二週就只看一堂函授。我在培養感覺。」', !!e2&&e2.id==='ev_bar_study_week'&&H.said.length===1&&has('我第二週就只看一堂函授。我在培養感覺。'));
    await run('ev_bar_study_week'); check('2-Y4-33 第三次：小語的那一句', H.said.length===1&&has('民訴那本我借你。我畫的重點是紫色的，不要問為什麼。'));
    at('2029-05-24',20); const e3=CLS.clubEvent(H.G,A); await run('ev_bar_study_w14',[1]);
    check('2-Y4-33 第 14 週 5/24「國考的人」：「還有七十二天。」「不要倒數。」；（繼續寫題目）→ 十點阿哲先站起來；BAR_STUDY_W14', !!e3&&e3.id==='ev_bar_study_w14'&&has('還有七十二天。')&&has('不要倒數。')&&has('（十點，阿哲先站起來：「走了。明天還要上課。」）')&&H.G.flags.BAR_STUDY_W14===true); }
  { fresh('2029-03-08',18.8,'noodle',{Y4_PATH:'bar'}); H.FAMILIAR('classmate_mingxuan');
    check('B2 3/8：19:00 麵店 M4、20:00 讀書會，兩個都去得了（M4 18:45～20:30、讀書會 3/8 有開）', S.mxSavedDue(H.G)&&ACTIVITIES.list.find(a=>a.id==='act_bar_study').dates.includes('2029-03-08')); }
  /* ===== 2-Y4-34 研究所放榜 ===== */
  { fresh('2029-03-22',14,'dorm',{GRAD_EXAM_2029:true,Y4_PATH:'grad',Y4_PUSH:'fail',R2Y4B_LIB:Array.from({length:30},(_,i)=>D('2028-09-10')+i*3)}); H.FRIEND('heroine_01'); H.FRIEND('yu'); H.FRIEND('zhe'); grp(); contact('heroine_01');
    at('2029-03-22',15); phone();
    check('2-Y4-34 15:00 學校信箱（總圖 2028-09-04～2029-02-02 ≥ 24 天＝上）：「研究所放榜：法律學研究所，錄取。」；GRAD_EXAM_RESULT pass、GRAD_ADMIT exam', th('sys').includes('研究所放榜：法律學研究所，錄取。')&&H.G.flags.GRAD_EXAM_RESULT==='pass'&&H.G.flags.GRAD_ADMIT==='exam');
    at('2029-03-22',19); H.G.zone='noodle'; H.G.flags.AN_FAREWELL='went';
    check('2-Y4-34 19:00 麵店（18:45～19:15、FRIEND 以上）＝演', EVENTS.check(ev('ev_an_grad_pass')));
    await run('ev_an_grad_pass',[0,0]);
    check('R1 去麵店、和以安朋友：「商法組放榜。上了。」當面；「敬以安。……又一次。」', has('商法組放榜。上了。')&&has('八月還有司法官。一樣，先考上。')&&has('恭喜！！')&&has('（舉起塑膠杯）敬以安。……又一次。'));
    check('R2 祐廷也上了：「你的呢？」→「上了。」→「……那九月，同一棟。」；記憶 AN_GRAD_PASS', has('（轉向你）你的呢？')&&has('……那九月，同一棟。')&&SOCIAL.has('heroine_01','AN_GRAD_PASS'));
    at('2029-03-22',22); phone(); check('2-Y4-34 去了麵店的：22:00 沒有群組那一則', !sent('y4_an_pass_grp')); }
  { fresh('2029-03-22',14,'dorm',{GRAD_EXAM_2029:true,Y4_PATH:'grad'}); H.FRIEND('heroine_01'); H.FRIEND('zhe'); grp(); contact('heroine_01');
    at('2029-03-22',19); H.G.zone='noodle';
    check('2-Y4-34 15:00 以前跳過去也照樣先算結果（總圖不到 24 天＝沒上）', EVENTS.check(ev('ev_an_grad_pass'))&&H.G.flags.GRAD_EXAM_RESULT==='fail');
    await run('ev_an_grad_pass',[1]);
    check('R3 祐廷沒上：「（她看了你一眼，沒有問。）」；散的時候「二月那張考卷，第二節很難。」「我也寫到鐘響。」；沒有餞行＝阿哲只說「敬以安。」', has('（她看了你一眼，沒有問。）')&&!has('（轉向你）你的呢？')&&has('先考。')&&has('二月那張考卷，第二節很難。')&&has('我也寫到鐘響。')&&has('（舉起塑膠杯）敬以安。')&&!has('（舉起塑膠杯）敬以安。……又一次。'));
    at('2029-03-22',21.5); H.G.zone='dorm'; check('R3 21:00 以後在宿舍房間：二選一到期', EVENTS.check(ev('ev_grad_result')));
    await run('ev_grad_result',[0]);
    check('R3 二選一：「（書桌上，二月那份考古題還攤著。）」「明年再考。」→ GRAD_RETRY；「不考了。」也在選項裡', has('（書桌上，二月那份考古題還攤著。）')&&JSON.stringify(H.opts[0])===JSON.stringify(['「明年再考。」','「不考了。」'])&&H.G.flags.GRAD_RETRY===true&&!EVENTS.check(ev('ev_grad_result'))); }
  { fresh('2029-03-22',17.9,'dorm'); H.FRIEND('heroine_01'); date('heroine_01');
    check('2-Y4-34 和以安交往中：17:50 她打來', S.anCallDue(H.G)); H.said=[]; await S.anCall(GM);
    check('2-Y4-34 電話：「……上了。」「晚上麵店，我自己跟大家說。」', has('……上了。')&&has('晚上麵店，我自己跟大家說。')&&!S.anCallDue(H.G)); }
  { fresh('2029-03-22',20,'dorm'); H.FRIEND('heroine_01'); H.FAMILIAR('zhe'); grp(); contact('heroine_01'); at('2029-03-22',22); phone(); at('2029-03-22',22.1); phone();
    check('R4 沒去麵店：22:00 群組「商法組放榜。上了。」＋FRIEND 以上私訊「八月還有司法官。一樣，先考上。」', th('g:noodle_team').includes('商法組放榜。上了。')&&th('p:heroine_01').includes('八月還有司法官。一樣，先考上。')); }
  { fresh('2029-03-22',20,'dorm'); H.FAMILIAR('heroine_01'); grp(); contact('heroine_01'); at('2029-03-22',22); phone();
    check('2-Y4-34 和以安不到 FRIEND：只有群組', th('g:noodle_team').includes('商法組放榜。上了。')&&!th('p:heroine_01').length&&(()=>{ at('2029-03-22',19); H.G.zone='noodle'; return !EVENTS.check(ev('ev_an_grad_pass')); })()); }
  /* ===== 2-Y4-35 春假（最後一次）＋可昕三選一 ===== */
  const TEAM=()=>{ for(const id of ['heroine_01','zhe','yu','classmate_bohan']) H.FAMILIAR(id); grp(); };
  { fresh('2029-03-25',20,'dorm'); TEAM(); date('kexin'); at('2029-03-25',20.5); phone();
    check('2-Y4-35 3/25 20:30 群組：以安「春假要不要出去 兩天一夜」「行程我排好了 4/1 前跟我說」；可昕的還沒到＝先不問', JSON.stringify(th('g:noodle_team').slice(-2))===JSON.stringify(['春假要不要出去 兩天一夜','行程我排好了 4/1 前跟我說'])&&!S.springPending(H.G));
    at('2029-03-25',21); phone();
    check('2-Y4-35 21:00 交往中的可昕「最後一個春假。……這次不排行程表。」；兩則都到了才問三選一', th('p:kexin').includes('最後一個春假。……這次不排行程表。')&&S.springPending(H.G));
    H.opts=[]; H.picks=[0]; await S.springPrompt(GM);
    const q=OUT.get(H.G,'y4_spring');
    check('2-Y4-35 三選一：麵店團／和可昕開車／留在宿舍（＋晚一點再決定）；選麵店團＝4/3 08:00 校門出發', H.opts[0].length===4&&/麵店團/.test(H.opts[0][0])&&/可昕/.test(H.opts[0][1])&&/宿舍/.test(H.opts[0][2])&&H.G.flags.SPRING_Y4==='noodle'&&!!q&&q.day===D('2029-04-03')&&q.h===8);
    at('2029-04-03',21.6); PHONE.tick(H.G);
    check('2-Y4-35 可昕那邊沒選：「好。那畢業旅行再說。」＋她和予樂在讀書會的照片', th('p:kexin').includes('好。那畢業旅行再說。')&&th('p:kexin').some(t=>/^📷/.test(t)&&/予樂/.test(t))); }
  { fresh('2029-04-02',19,'dorm',{SPRING_Y4:'noodle'}); TEAM(); at('2029-04-02',20.5);
    check('2-Y4-35 4/2 晚上：旁白「你回家把車開出來。」', S.springCarDue(H.G)&&(H.said=[],await S.springCar(GM),has('（你回家把車開出來。）'))&&!S.springCarDue(H.G));
    OUT.plan(H.G,{id:'y4_spring',ev:'ev_spring_y4',day:D('2029-04-03'),h:8,place:'台大校門口',title:'t',travelH:1/6}); at('2029-04-03',7.9); await goOut('y4_spring',[0]);
    check('S1 麵店團：行程表「最後一次」（旁白，不唸）；阿哲、小語；「妳講了四個。」；「大一中秋，火一直熄。」→「那是你顧的。」；回程「謝謝你開車。」', has('（以安坐副駕，腿上是行程表第四版。理由欄只寫了四個字：「最後一次」。）')&&has('（後座）司機，我要聽歌。')&&has('不要放他的歌。')&&has('妳講了四個。')&&has('那是你顧的。')&&has('（小聲）……謝謝你開車。')&&!has('明天早上空了一格。……你排。')&&caps.includes('宜蘭・民宿'));
    fresh('2029-04-03',7.9,'dorm',{SPRING_Y4:'noodle'}); TEAM(); date('heroine_01'); OUT.plan(H.G,{id:'y4_spring',ev:'ev_spring_y4',day:D('2029-04-03'),h:8,place:'台大校門口',title:'t',travelH:1/6}); await goOut('y4_spring',[1]);
    check('2-Y4-35 和以安交往中：睡前「明天早上空了一格。……你排。」；「第一次去麵店。」→「你點了招牌乾麵。大家都是。」', has('明天早上空了一格。……你排。')&&has('你點了招牌乾麵。大家都是。')); }
  { fresh('2029-03-25',20,'dorm'); TEAM(); H.FRIEND('heroine_03'); date('heroine_03'); at('2029-03-25',20.5); phone(); H.picks=['留在宿舍']; await S.springPrompt(GM); at('2029-04-03',21.6); phone(); PHONE.tick(H.G);
    check('2-Y4-35 和語彤交往中：4/3 傍晚「看到群組了。……店裡今天很空。」；留在宿舍＝21:30 火車站的照片', th('p:heroine_03').includes('看到群組了。……店裡今天很空。')&&H.G.flags.SPRING_Y4==='dorm'&&th('g:noodle_team').includes('📷（火車站的月台。他們改搭火車。）')); }
  { fresh('2029-04-03',7.6,'dorm',{KX_TRIP:{Y1S2:'stars',Y2S2:'sea'}}); date('kexin'); OUT.plan(H.G,{id:'y4_spring_kx',ev:'ev_kexin_trip_spring_y4',day:D('2029-04-03'),h:7+40/60,place:'政大校門口',title:'t',travelH:40/60});
    await goOut('y4_spring_kx',['山上看星星']);
    check('2-Y4-35 和可昕開車（照 1C-01）：沒去過的才列、「山上看星星」一定在（AA_336 C7）；去過星星＝「今天看得到。……上次那顆，真的是星星。」；記 KX_TRIP.Y4S2；沒有假設題', JSON.stringify(H.opts[0])===JSON.stringify(['別的城市的老街','山上看星星'])&&has('今天看得到。……上次那顆，真的是星星。')&&H.G.flags.KX_TRIP.Y4S2==='stars'&&has('規則。我管音樂，你管方向。')&&has('我不睡。我要陪你開車。'));
    fresh('2029-04-03',7.6,'dorm',{KX_TRIP:{Y1S2:'stars',Y2S2:'sea',Y4WIN:'oldtown'}}); date('kexin'); OUT.plan(H.G,{id:'y4_spring_kx',ev:'ev_kexin_trip_spring_y4',day:D('2029-04-03'),h:7+40/60,place:'政大校門口',title:'t',travelH:40/60});
    await goOut('y4_spring_kx',[0]);
    check('2-Y4-35 三個都去過＝迷路到的地方（「這次我不出行程表。你帶路，不要看地圖。」）；KX_TRIP.Y4S2 lost', has('這次我不出行程表。你帶路，不要看地圖。')&&has('（販賣機吃了你的硬幣。）')&&H.G.flags.KX_TRIP.Y4S2==='lost'); }
  /* ===== 2-Y4-36 沛珊 P6 公開課 ===== */
  const PSB=()=>{ H.FAMILIAR('classmate_peishan'); H.G.flags.PS_BACK_FIRST=D('2028-08-10'); contact('classmate_peishan'); };
  { fresh('2029-04-12',20,'dorm'); PSB(); at('2029-04-12',21); phone();
    check('2-Y4-36 4/12 21:00 重新聯絡上、FAMILIAR：她私訊兩則（週六下午我上公開課…／在台南喔…）', JSON.stringify(th('p:classmate_peishan'))===JSON.stringify(['週六下午我上公開課，書店那天請假了。家長會來。……你也可以來，坐最後面。','在台南喔。很遠，不來也沒關係。']));
    answer('y4_ps_open',0); phone(); const q=OUT.get(H.G,'y4_ps_open');
    check('2-Y4-36「我去。」→ 出遊 4/14 14:00 台南（高鐵）', !!q&&q.day===D('2029-04-14')&&q.h===14&&/高鐵/.test(q.travel));
    global.CG_REGISTRY.cg_whiteboard_why_peishan={file:'x.webp',title:'t'}; at('2029-04-14',11.8); await goOut('y4_ps_open',[1]); delete global.CG_REGISTRY.cg_whiteboard_why_peishan;
    const last='……我們家的榜單還貼著。旁邊多貼了一張。';
    check('P1 去了：台南車站的旁白、媽媽四句、BCG-05 在媽媽最後一句之後、「你真的來了！！」、送到高鐵站「謝謝你跑這麼遠！」；票錢照扣；PS_OPEN_CLASS went', has('（台南車站。你照她傳的地址，搭公車到課輔班。她已經在上課了。）')&&has('（小聲）你是她大學的同學？')&&has('她說她要去當老師。我本來不懂。')&&has('可是她站在前面的樣子，跟她高中講法律的時候不一樣。')&&has(last)&&H.cgs.includes('cg_whiteboard_why_peishan')&&has('你真的來了！！')&&has('……我知道。我一進教室就看到了。')&&has('（傍晚，她陪你坐車到高鐵站。）')&&has('謝謝你跑這麼遠！到臺北傳給我喔。')&&H.G.flags.PS_OPEN_CLASS==='went'&&paid.some(p=>p[0]<0&&p[1]==='交通')&&caps.includes('台南・課輔班'));
    at('2029-04-14',21.2); phone(); check('2-Y4-36 去了的：當晚沒有「媽媽來了」那一則', !th('p:classmate_peishan').some(t=>/媽媽來了/.test(t))); }
  { fresh('2029-04-14',11.8,'dorm'); PSB(); date('classmate_peishan'); OUT.plan(H.G,{id:'y4_ps_open',ev:'ev_peishan_open_class',day:D('2029-04-14'),h:14,place:'台南',title:'t',travelH:2}); await goOut('y4_ps_open',[0]);
    check('2-Y4-36 交往中：送站那一句換「下次待久一點。末班車太早了。」；「沒有。」→「你騙人。……好，我當你沒看到。」；CG 沒登錄＝不放', has('下次待久一點。末班車太早了。')&&!has('謝謝你跑這麼遠！到臺北傳給我喔。')&&has('你騙人。……好，我當你沒看到。')&&!H.cgs.length); }
  { fresh('2029-04-12',20,'dorm'); PSB(); at('2029-04-12',21); phone(); answer('y4_ps_open',1); at('2029-04-14',21); phone(); PHONE.tick(H.G);
    check('P2 沒去（「那天不行。」→「好～那我拍照給你看。」）：當晚「媽媽來了。她坐最後一排。……」；沒有 CG；PS_OPEN_CLASS missed', th('p:classmate_peishan').includes('好～那我拍照給你看。')&&th('p:classmate_peishan').includes('媽媽來了。她坐最後一排。……就是我叫你坐的那個位子。')&&H.G.flags.PS_OPEN_CLASS==='missed'&&!OUT.get(H.G,'y4_ps_open')); }
  { fresh('2029-04-12',20,'dorm'); H.FAMILIAR('classmate_peishan'); contact('classmate_peishan'); at('2029-04-12',21); phone();
    check('P3 沒重新聯絡上：沒有這一件', !th('p:classmate_peishan').length); }
  /* ===== 2-Y4-37 語彤 16b 阿姨的照片 ===== */
  const PH='（照片：阿姨在日本一座寺廟前比 YA，背後是跟團的旗子）';
  { fresh('2029-04-19',17,'dorm'); H.FAMILIAR('heroine_03'); contact('heroine_03'); grp(); at('2029-04-19',18); phone();
    const m=(H.G.msgs||[]).find(x=>x.th==='p:heroine_03'&&x.text===PH);
    check('A1 朋友：4/19 18:00 一張照片、沒有字；三選一', JSON.stringify(th('p:heroine_03'))===JSON.stringify([PH])&&!!m&&m.ask&&m.ask.opts.length===3);
    answer('y4_yt_aunt',1);
    check('2-Y4-37（回一張麵的照片）→ 你傳的是照片，她「你在吃別家的麵？我要跟阿姨講。」；YT_AUNT_PHOTO', th('p:heroine_03').includes('你在吃別家的麵？我要跟阿姨講。')&&th('p:heroine_03').some(t=>/^📷/.test(t))&&H.G.flags.YT_AUNT_PHOTO==='noodle');
    at('2029-04-20',12); H.said=[]; const r=await NOODLE_CLOSED.door(GM);
    check('A2 4/20 去麵店：門口「老闆出國，休息七天」、進不去（4/26 照常開）', r===true&&H.said.some(s=>/老闆出國，休息七天/.test(s.t))&&(at('2029-04-26',12),!(await NOODLE_CLOSED.door(GM)))); }
  { fresh('2029-04-19',17,'dorm'); H.FAMILIAR('heroine_03'); contact('heroine_03'); grp(); date('kexin'); ROM.learn(H.G,'heroine_03','kexin','test'); at('2029-04-19',18); phone();
    check('2-Y4-37 她知道祐廷和別人交往：照片發在麵店團群組，多「阿姨第一次出國」「店休一個禮拜」', JSON.stringify(th('g:noodle_team').slice(-3))===JSON.stringify([PH,'阿姨第一次出國','店休一個禮拜'])&&!th('p:heroine_03').length); }
  /* ===== 2-Y4-38 可昕：生日「今年不要慶祝」===== */
  { fresh('2029-04-23',20,'dorm',{KX_STUDY_PLAN:true}); date('kexin'); at('2029-04-23',21); phone();
    check('2-Y4-38 4/23 21:00「明天我生日。今年不要慶祝，我們都在準備考試。」（回「好。」）', th('p:kexin').includes('明天我生日。今年不要慶祝，我們都在準備考試。')&&(answer('y4_kx_bday',0),th('p:kexin').includes('好。')));
    at('2029-04-24',10); check('2-Y4-38 4/24 當天問怎麼做', S.kxBdayDue(H.G));
    H.opts=[]; H.picks=[2]; await S.kxBdayPrompt(GM); const q=OUT.get(H.G,'y4_kx_bday');
    check('2-Y4-38 四個做法：傳一句／寫在讀書計畫表（有 KX_STUDY_PLAN）／開車上山送湯餃／晚一點；選開車＝出遊（政大宿舍樓下）', H.opts[0].length===4&&/讀書計畫表/.test(H.opts[0][1])&&!!q&&q.day===D('2029-04-24'));
    at('2029-04-24',20.4); await goOut('y4_kx_bday');
    check('K1 開車送湯餃：「……你開上山就為了這個？」「湯還是熱的。」；KX_BDAY[4] visit', has('……你開上山就為了這個？')&&has('湯還是熱的。')&&H.G.flags.KX_BDAY[4]==='visit'); }
  { fresh('2029-04-24',10,'dorm'); date('kexin'); H.G.msgs=[]; PHONE.at(H.G,D('2029-04-23'),21,[{th:'p:kexin',from:'kexin',text:'x'}],'y4_kx_bday'); PHONE.tick(H.G); H.opts=[]; H.picks=[0]; await S.kxBdayPrompt(GM); at('2029-04-24',10.5); PHONE.tick(H.G);
    check('2-Y4-38 沒有 KX_STUDY_PLAN：沒有寫在表上那一個；傳一句「生日快樂。」→「收到。……謝謝你照做。」；quiet', H.opts[0].length===3&&th('p:kexin').includes('生日快樂。')&&th('p:kexin').includes('收到。……謝謝你照做。')&&H.G.flags.KX_BDAY[4]==='quiet'); }
  { fresh('2029-04-24',10,'dorm',{KX_STUDY_PLAN:true}); date('kexin'); PHONE.at(H.G,D('2029-04-23'),21,[{th:'p:kexin',from:'kexin',text:'x'}],'y4_kx_bday'); PHONE.tick(H.G); H.picks=[1]; await S.kxBdayPrompt(GM); at('2029-04-24',10.5); PHONE.tick(H.G);
    check('2-Y4-38 寫在讀書計畫表：「我說不要慶祝。」「……這不算慶祝。這算註解。」；note', th('p:kexin').includes('我說不要慶祝。')&&th('p:kexin').includes('……這不算慶祝。這算註解。')&&H.G.flags.KX_BDAY[4]==='note'); }
  { fresh('2029-04-23',20,'dorm'); date('kexin'); at('2029-04-23',21); phone(); at('2029-04-25',21); phone(); PHONE.tick(H.G);
    check('K2 什麼都沒做：隔天「昨天我生日。我知道我說不要慶祝。」「可是我還是等了一天。」；none', th('p:kexin').includes('昨天我生日。我知道我說不要慶祝。')&&th('p:kexin').includes('可是我還是等了一天。')&&H.G.flags.KX_BDAY[4]==='none'); }
  /* ===== 2-Y4-39 系籃最後一場＋吉他社成發 ===== */
  { fresh('2029-05-11',20,'dorm'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('classmate_mingxuan'); H.FRIEND('heroine_04'); SOCIAL.remember('heroine_04','CLAPPED',''); grp(); at('2029-05-11',21); phone();
    const q1=OUT.get(H.G,'y4_last_game'), q2=OUT.get(H.G,'y4_concert');
    check('2-Y4-39 5/11 21:00 阿哲在群組揪三則；排兩個出遊 5/12 10:00、19:00', JSON.stringify(th('g:noodle_team').slice(-3))===JSON.stringify(['明天早上十點 最後一場','晚上小語成發','兩個都給我來'])&&!!q1&&q1.h===10&&q1.day===D('2029-05-12')&&!!q2&&q2.h===19);
    at('2029-05-12',9.8); await goOut('y4_last_game',[2]);
    check('G1 系籃：「（新體育館。阿哲在場邊綁鞋帶，綁了三次。）」；拍手／記分／送水三選一；送水「後勤部長，最後一次。」；明軒「……這次我不先走。」；阿哲「四年。……好，吃午餐。」；BALL_Y4 went', has('（新體育館。阿哲在場邊綁鞋帶，綁了三次。）')&&JSON.stringify(H.opts[0])===JSON.stringify(['拍手','記分','送水'])&&has('（中場你把一箱水搬到場邊。阿哲喝了一口：「後勤部長，最後一次。」）')&&has('最後一場。')&&has('……這次我不先走。')&&has('（坐在場邊，把護膝拿下來）四年。……好，吃午餐。')&&H.G.flags.BALL_Y4==='went');
    at('2029-05-12',18.8); await goOut('y4_concert');
    check('G1 成發：小語「最後一首！……」；子晴評審（有 CLAPPED）「原來坐這裡是這種感覺。你以前都這麼大聲喔？」；阿凱「我還是沒入社。」；CONCERT_Y4 went', has('（小語拿著流程表跑來跑去。）')&&has('最後一首！最後一首！誰把麥克風拿走了！')&&has('原來坐這裡是這種感覺。你以前都這麼大聲喔？')&&has('我還是沒入社。')&&H.G.flags.CONCERT_Y4==='went'); }
  { fresh('2029-05-11',20,'dorm'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('classmate_mingxuan'); grp(); at('2029-05-11',21); phone(); at('2029-05-12',22);
    for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('G2 都沒去：12:30 明軒「系籃最後一場打完了。這次我待到最後 😂」、21:30 群組照片（舞台上的小語）；BALL_Y4、CONCERT_Y4 missed', th('g:noodle_team').includes('系籃最後一場打完了。這次我待到最後 😂')&&th('g:noodle_team').includes('📷（舞台上，小語拿著麥克風，對著台下比了一個讚。）')&&H.G.flags.BALL_Y4==='missed'&&H.G.flags.CONCERT_Y4==='missed'); }
  /* ===== 2-Y4-40 可昕 K25 讀書會的最後一晚 ===== */
  { fresh('2029-05-16',17,'dorm',{Y4_PATH:'bar',BAR_STUDY_GROUP:['kexin']}); date('kexin'); at('2029-05-16',18); phone();
    check('2-Y4-40 5/16 18:00「今天是讀書會的最後一晚。你要來，還是視訊？」（按鈕：開車送宵夜／視訊）', th('p:kexin').includes('今天是讀書會的最後一晚。你要來，還是視訊？')&&(()=>{ const m=PHONE.byAsk(H.G,'y4_kx_k25'); return !!m&&m.ask.opts.map(o=>o.t).join('|')==='我開車送宵夜過去。|視訊。'; })());
    answer('y4_kx_k25',0); phone(); at('2029-05-16',20.3); await goOut('y4_kx_k25');
    check('L1 開車送宵夜：予樂「司機升級成外送員。」；書架「這一格空著。還不知道要放什麼。」；沒有比數；回程（在讀書小組）「……我們兩個照表。」；KX_SHELF、KX_K25 drive', has('司機升級成外送員。')&&has('（散場前，她帶你看讀書會的書架。最右邊空了一格。）')&&has('這一格空著。還不知道要放什麼。')&&!H.said.some(s=>/比數|領先|請最後一次宵夜|我們沒有比過/.test(s.t))&&has('明天開始，讀書會的人各自讀。……我們兩個照表。')&&H.G.flags.KX_SHELF===true&&H.G.flags.KX_K25==='drive'&&caps.includes('河濱')); }
  { fresh('2029-05-16',17,'dorm'); date('kexin'); at('2029-05-16',18); phone(); answer('y4_kx_k25',1); phone(); at('2029-05-16',20.9); await goOut('y4_kx_k25');
    check('2-Y4-40 視訊：「（邵鈞對著鏡頭點頭致意。）」；書架；沒有回程那一句', has('（邵鈞對著鏡頭點頭致意。）')&&has('這一格空著。還不知道要放什麼。')&&!has('明天開始，各自讀。')&&H.G.flags.KX_K25==='video'); }
  { fresh('2029-05-16',17,'dorm'); date('kexin'); at('2029-05-16',18); phone(); at('2029-05-16',22); phone(); PHONE.tick(H.G);
    check('2-Y4-40 沒去：「（照片：書架）」「讀書會的書架，最右邊空了一格。還不知道要放什麼。」；KX_SHELF、KX_K25 missed', th('p:kexin').includes('（照片：書架）')&&th('p:kexin').includes('讀書會的書架，最右邊空了一格。還不知道要放什麼。')&&H.G.flags.KX_SHELF===true&&H.G.flags.KX_K25==='missed'); }
  /* ===== 2-Y4-41 法律專題研究：期末的日誌一句 ===== */
  { fresh('2029-05-28',15,'classroom',{CRIMPRO_HW:'done'}); memos.length=0; const it={c:{id:'legal_research'},exam:null};
    const r1=await S.journal(GM,it);
    check('J1 大三交過旁聽作業：5/28（第 15 週）那堂上完，日誌「法律專題研究的報告交了。你寫的是大三那次旁聽之後一直想的事。」；只寫一次', r1===true&&memos.includes('法律專題研究的報告交了。你寫的是大三那次旁聽之後一直想的事。')&&(await S.journal(GM,it))===false);
    fresh('2029-05-28',15,'classroom'); memos.length=0; await S.journal(GM,it); const lr=COURSES.list?null:null;
    const C=(COURSES.Y4S2||[]).concat(COURSES.list||[]).concat(Object.values(COURSES).filter(Array.isArray).flat()).find(c=>c&&c.id==='legal_research');
    check('J2 沒交過：「法律專題研究的報告交了。」；大四下第 6 週沒有法院旁聽（courses.js 的 specials 拿掉 w6）', memos.includes('法律專題研究的報告交了。')&&!!C&&!(C.specials||[]).some(s=>s.w===6)&&(C.specials||[]).some(s=>s.w===7)); }
  /* ===== 2-Y4-42 學姊的生日（已在 AA_319 1A-14＝postgrad3d.js；這裡查 AA_327 的驗收點）===== */
  { fresh('2029-06-02',20.5,'dorm'); H.FRIEND('heroine_05'); H.said=[]; H.picks=[0]; await PG.bdayScene(GM,'outing');
    check('S1 朋友：「祐廷也來了。」；沒有「學弟也來了」；沒有條列；SIS_BDAY_Y4 there', has('祐廷也來了。')&&!H.said.some(s=>/學弟也來了/.test(s.t))&&!H.said.some(s=>/^(一|二|三)，/.test(s.t))&&H.G.flags.SIS_BDAY_Y4==='there');
    fresh('2029-06-02',20.5,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); H.said=[]; H.picks=[0]; await PG.bdayScene(GM,'outing');
    check('S2 交往中：Kevin 先走「我們先走了！學弟，蛋糕交給你。」；「……不說。這次不排。」；SIS_BDAY_Y4 lover', has('我們先走了！學弟，蛋糕交給你。')&&has('……不說。這次不排。')&&H.G.flags.SIS_BDAY_Y4==='lover'); }
  /* ===== 2-Y4-43 期末最後一頓 ===== */
  { fresh('2029-06-22',16,'dorm',{GRADUATED:D('2029-06-02')}); TEAM(); at('2029-06-22',17); pg();
    const q=OUT.get(H.G,'y4_last_meal');
    check('2-Y4-43 17:00 阿哲「今天 期末最後一頓」「七點 麵店」；出遊 6/22 19:00', JSON.stringify(th('g:noodle_team').slice(-2))===JSON.stringify(['今天 期末最後一頓','七點 麵店'])&&!!q&&q.h===19&&q.day===D('2029-06-22'));
    H.G.flags.ANNIVERSARY_23=true; at('2029-06-22',18.8); await goOut('y4_last_meal',[1]);
    check('L1 去了：牆上的照片；阿姨「照片我貼起來了。你們自己找，找不到的下次帶一張來。」；「二十三週年那一張。」（有 ANNIVERSARY_23）；小語「這是最後一頓了。」阿哲「這不是最後一頓。下週二還是麵店。」；LAST_MEAL_Y4 went', has('（麵店的牆上貼滿了照片。四年來，大家在長桌拍的。）')&&has('照片我貼起來了。你們自己找，找不到的下次帶一張來。')&&H.opts[0].length===3&&has('（長桌坐滿，你被擠在角落，只照到半張臉。）')&&has('這是最後一頓了。')&&has('這不是最後一頓。下週二還是麵店。')&&H.G.flags.LAST_MEAL_Y4==='went'); }
  { fresh('2029-06-22',16,'dorm',{GRADUATED:D('2029-06-02')}); TEAM(); at('2029-06-22',17); pg(); at('2029-06-22',21.6);
    for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('L2 沒去：21:30 群組照片「（牆上貼滿了照片。阿姨說，找不到自己的，下次帶一張來。）」', th('g:noodle_team').includes('📷（牆上貼滿了照片。阿姨說，找不到自己的，下次帶一張來。）')&&H.G.flags.LAST_MEAL_Y4==='missed'); }
  /* ===== 2-Y4-44 可昕 K26 ===== */
  const GD={GRADUATED:D('2029-06-02')};
  { fresh('2029-07-05',20,'dorm',Object.assign({NCCU_FOOD_N:3},GD)); date('kexin'); at('2029-07-05',21); pg();
    const q=OUT.get(H.G,'y4_kx_k26');
    check('2-Y4-44 7/5 21:00「畢業了。我們的日子，重新排一天。」「週六下午三點，老地方。」；出遊 7/7 15:00', JSON.stringify(th('p:kexin').slice(-2))===JSON.stringify(['畢業了。我們的日子，重新排一天。','週六下午三點，老地方。'])&&!!q&&q.day===D('2029-07-07')&&q.h===15);
    at('2029-07-07',14.2); await goOut('y4_kx_k26');
    check('K1 去了（「我們的店」三次以上）：老闆「畢業了喔？」；「下個月考試。今天不讀書。……考試的事，明天再說。」；KX_K26 went', has('（老闆端上兩個人的點法，只說：「畢業了喔？」）')&&has('下個月考試。今天不讀書。……考試的事，明天再說。')&&!has('畢業了。這裡也算我們的店。')&&H.G.flags.KX_K26==='went'); }
  { fresh('2029-07-07',14.2,'dorm',GD,'JP'); date('kexin'); const L=DATE.log(H.G,'kexin'); L.byLoc={D25:3,D04:1}; L.count=4; S.k26Plan(H.G); const q=OUT.get(H.G,'y4_kx_k26'); await goOut('y4_kx_k26');
    check('K2 交換延畢、不常去山下那家：老地方＝約會紀錄裡次數最多的（外澳）；「畢業了。這裡也算我們的店。」「你還差一門實習。……那今天先慶祝我的。」', !!q&&/外澳/.test(q.place)&&has('畢業了。這裡也算我們的店。')&&has('你還差一門實習。……那今天先慶祝我的。')&&!has('下個月考試。今天不讀書。……考試的事，明天再說。')); }
  { fresh('2029-07-05',20,'dorm',GD); date('kexin'); at('2029-07-05',21); pg(); at('2029-07-07',16.5); for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('2-Y4-44 沒去：「重新排的第一天。你欠我一次。」；KX_K26 missed', th('p:kexin').includes('重新排的第一天。你欠我一次。')&&H.G.flags.KX_K26==='missed'); }
  /* ===== 2-Y4-45 七月最後衝刺（已在 AA_319 1A-16）===== */
  check('2-Y4-45 已在 AA_319：7/12 20:00 總圖 B1 最後衝刺（postgrad3d.js 的 b1）還在；國考讀書會的作息不排 7/12', !!PG.byId('b1')&&PG.byId('b1').at(H.G)===D('2029-07-12')*24+20&&!ACTIVITIES.list.find(a=>a.id==='act_bar_study').dates.includes('2029-07-12'));
  /* ===== 2-Y4-46 七月最後一次的心意邀約 ===== */
  const heartOk=id=>{ const r=SOCIAL.rel(id); r.npcRom=60; const L=DATE.log(H.G,id); L.count=4; L.wish=true; TERMEND.rec(H.G).think[id]='Y4S2'; };
  { fresh('2029-07-13',20,'dorm',Object.assign({BAR_REG:true},GD)); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg();
    check('J1 畢業傍晚對以安選「讓我想想」：7/13 21:00「明天晚上有空嗎。」「六點半，同一家。……手帳我帶著。」', JSON.stringify(th('p:heroine_01').slice(-2))===JSON.stringify(['明天晚上有空嗎。','六點半，同一家。……手帳我帶著。']));
    answer('y4_july',0); phone(); const q=OUT.get(H.G,'y4_july'); at('2029-07-14',0.1); phone();
    check('2-Y4-46「好。」→ 7/14 18:30 公館巷子裡她知道的小店；7/14 00:00 重新判斷照樣成立', !!q&&q.h===18.5&&q.day===D('2029-07-14')&&q.state==='planned'&&!H.G.flags.JULY_CANCEL);
    at('2029-07-14',18.3); await goOut('y4_july',['先不說','我們還是朋友']);
    check('J1 先不說 →「（她把手帳翻到最後一頁…寫滿了。）」「我寫完了。這次我不等下一次。」「你回答。」；回家路上是杜鵑那棵樹；沒有 CG、沒有「讓我想想」；四個選項', has('（她把手帳翻到最後一頁，推到你面前。那一行字的下面，寫滿了。）')&&has('我寫完了。這次我不等下一次。')&&has('你回答。')&&has('四張照片都在這棵樹前面拍的。今天沒有花，我還是想停一下。')&&!H.cgs.length&&H.opts[0].length===4&&!H.opts.flat().some(t=>/讓我想想/.test(t)));
    check('2-Y4-46「我們還是朋友。」＝「好。……八月四號，你考試加油。」；記 HEART_FRIEND／HEART_LAST', has('好。……八月四號，你考試加油。')&&H.G.flags.HEART_FRIEND_heroine_01===true&&H.G.flags.HEART_LAST_heroine_01===true&&!H.G.flags.dating_heroine_01); }
  { fresh('2029-07-14',18.3,'dorm',GD); H.FRIEND('heroine_01'); heartOk('heroine_01'); OUT.plan(H.G,{id:'y4_july',ev:'ev_heart_july',day:D('2029-07-14'),h:18.5,place:'x',title:'t',travelH:0.25,july:{id:'heroine_01'}}); await goOut('y4_july',[0]);
    check('2-Y4-46 說出來（第二次、七月那一版）：「……嗯。這次換你先說了。」「好。我們在一起。」→ 交往', has('……嗯。這次換你先說了。')&&has('好。我們在一起。')&&H.G.flags.dating_heroine_01===true);
    fresh('2029-07-14',18.3,'dorm',GD); H.FRIEND('heroine_01'); heartOk('heroine_01'); OUT.plan(H.G,{id:'y4_july',ev:'ev_heart_july',day:D('2029-07-14'),h:18.5,place:'x',title:'t',travelH:0.25,july:{id:'heroine_01'}}); await goOut('y4_july',[3,1]);
    check('2-Y4-46 沒報國考（BAR_REG 不是 true）：「好。……九月見。」', has('好。……九月見。')&&!has('好。……八月四號，你考試加油。')); }
  { fresh('2029-07-13',20,'dorm',GD); H.FRIEND('classmate_peishan'); heartOk('classmate_peishan'); at('2029-07-13',21); pg();
    check('J2 對沛珊說過讓我想想：「明天晚上有空嗎？」「我在台中。……六點半，我家附近那間簡餐。你來的話，我去車站接你。」', JSON.stringify(th('p:classmate_peishan').slice(-2))===JSON.stringify(['明天晚上有空嗎？','我在台中。……六點半，我家附近那間簡餐。你來的話，我去車站接你。']));
    answer('y4_july',0); phone(); const q=OUT.get(H.G,'y4_july'); at('2029-07-14',17.2); await goOut('y4_july',[3,1]);
    check('J2 地點在台中（高鐵、票錢照扣）、末班高鐵；「好。……那我以後還可以問你別的問題嗎？」', !!q&&/台中/.test(q.place)&&/高鐵/.test(q.travel)&&/最後一班高鐵/.test(q.back)&&caps.includes('台中・她家附近的簡餐')&&paid.some(p=>p[0]===-1400)&&has('好。……那我以後還可以問你別的問題嗎？')); }
  { fresh('2029-07-13',20,'dorm',GD); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg(); answer('y4_july',0); phone();
    date('kexin'); ROM.learn(H.G,'heroine_01','kexin','test'); at('2029-07-14',0.1); phone(); const q=OUT.get(H.G,'y4_july');
    check('J3 畢業後和別人交往了（她知道）：7/14 00:00 重判不成立＝沒有這一場；不記 HEART_FRIEND／HEART_LAST', H.G.flags.JULY_CANCEL===true&&q&&q.state!=='planned'&&!H.G.flags.HEART_FRIEND_heroine_01&&!H.G.flags.HEART_LAST_heroine_01); }
  { fresh('2029-07-13',20,'dorm',GD); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg(); at('2029-07-14',18.6); phone();
    check('2-Y4-46 沒回：她回「好。」，這一場不補；只記 HEART_LAST', th('p:heroine_01').slice(-1)[0]==='好。'&&H.G.flags.HEART_LAST_heroine_01===true&&!H.G.flags.HEART_FRIEND_heroine_01&&!OUT.get(H.G,'y4_july')); }
  /* ===== 2-Y4-47 芷若回國 ===== */
  { fresh('2029-08-25',20,'dorm',GD); H.FRIEND('heroine_02'); date('heroine_02'); at('2029-08-25',21); pg(); phone();
    const q=OUT.get(H.G,'y5_zr_cup');
    check('2-Y4-47 畢業時和她交往中：8/25「到了。先回台中一個禮拜。」「下週六打烊以後，來店裡。」；9/1 22:00 出遊；ZR_BACK', JSON.stringify(th('p:heroine_02').slice(-2))===JSON.stringify(['到了。先回台中一個禮拜。','下週六打烊以後，來店裡。'])&&!!q&&q.day===D('2029-09-01')&&q.h===22&&H.G.flags.ZR_BACK!=null);
    at('2029-09-01',21.6); await goOut('y5_zr_cup');
    check('R1 9/1 22:00 杯子「熱拿鐵・不加糖」「一年。」；「我回來了。」；沒有選項；ZR_CUP_Y5 there', has('（她做了一杯熱拿鐵，不加糖。杯子上用麥克筆寫著：「熱拿鐵・不加糖」。下面一行小字：「一年。」）')&&has('我回來了。')&&!H.opts.length&&H.G.flags.ZR_CUP_Y5==='there');
    check('2-Y4-47 延後的回答（PROPOSAL）沒有做', !STORY_EVENTS.some(e=>(e.dialogue||[]).some(l=>l.text&&/你那天點對了/.test(l.text)))); }
  { fresh('2029-08-25',20,'dorm',GD); H.FRIEND('heroine_02'); date('heroine_02'); at('2029-08-25',21); pg(); at('2029-09-01',23.1); for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('2-Y4-47 沒到：23:00「杯子我先收著。」；ZR_CUP_Y5 later', th('p:heroine_02').includes('杯子我先收著。')&&H.G.flags.ZR_CUP_Y5==='later');
    at('2029-09-03',15); H.G.zone='cafe'; const ok=EVENTS.check(ev('ev_zhiruo_cup_later')); await run('ev_zhiruo_cup_later');
    check('2-Y4-47 之後第一次去 Café：「（她照樣把那個杯子拿出來。）」', ok&&has('（她照樣把那個杯子拿出來。）')); }
  { fresh('2029-09-02',15,'cafe',GD); H.FRIEND('heroine_02'); H.G.flags.EX_heroine_02=true;
    check('R2 分開過：9/1～9/7 第一次進 Café，BB_119 第 4 節「好久不見。……老樣子？」（9/8 以後不演）', EVENTS.check(ev('ev_zhiruo_back_ex'))&&(await run('ev_zhiruo_back_ex'),has('好久不見。……老樣子？'))&&(()=>{ fresh('2029-09-08',15,'cafe',GD); H.FRIEND('heroine_02'); H.G.flags.EX_heroine_02=true; return !EVENTS.check(ev('ev_zhiruo_back_ex')); })()); }
  { fresh('2029-08-20',12,'dorm',GD); H.FRIEND('heroine_02'); const p1=STORY.presence('heroine_02',H.G); at('2029-08-28',12); const p2=STORY.presence('heroine_02',H.G); at('2029-09-01',12); const p3=STORY.presence('heroine_02',H.G);
    check('2-Y4-47 presence：6/3～8/24 在英國、8/25～8/31 回台中、9/1 起在臺北', p1.here===false&&p1.kind==='abroad'&&p2.here===false&&p2.kind==='home'&&p3.here!==false, JSON.stringify([p1,p2,p3])); }
  /* ===== 2-Y4-48 明軒出發去德國 ===== */
  { fresh('2029-09-01',20,'dorm',GD); H.FAMILIAR('classmate_mingxuan'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); grp(); at('2029-09-01',21); pg();
    const L=th('g:noodle_team').slice(-5);
    check('2-Y4-48 9/1 21:00 群組五則（明天早上的飛機。…小語：我們去！！）；FAMILIAR 以上有「我也去。」', JSON.stringify(L)===JSON.stringify(['明天早上的飛機。','不用送。……真的不用。','幾點','七點。我說不用。','我們去！！'])&&(()=>{ const m=PHONE.byAsk(H.G,'y5_mx_depart'); return !!m&&m.ask.opts[0].t==='我也去。'; })());
    answer('y5_mx_depart',0); phone(); const q=OUT.get(H.G,'y5_mx_depart'); at('2029-09-02',5.8); await goOut('y5_mx_depart',[1]);
    check('D1 去了：「我說不用來。」；阿哲的滷味；「錢夠嗎？」→「……我算過了。CP 值很高的一年。」；沒有「獎學金」；MX_DEPART airport', !!q&&q.h===7&&has('我說不用來。')&&has('（把一袋東西塞給他）滷味。上飛機前吃完。')&&has('德國香腸！！回來要帶！！')&&has('……我算過了。CP 值很高的一年。')&&!H.said.some(s=>/獎學金/.test(s.t))&&H.G.flags.MX_DEPART==='airport');
    at('2029-09-02',8.8); pg(); check('2-Y4-48 去了的：08:40 沒有照片', !th('g:noodle_team').includes('出發了。一年。八月見。')); }
  { fresh('2029-09-01',20,'dorm',GD); H.FAMILIAR('classmate_mingxuan'); H.FAMILIAR('zhe'); grp(); at('2029-09-01',21); pg(); at('2029-09-02',8.7); pg();
    check('D2 沒去：08:40「（照片：機場的落地窗，一架飛機）」「出發了。一年。八月見。」阿哲「帶香腸回來」；MX_DEPART msg', JSON.stringify(th('g:noodle_team').slice(-3))===JSON.stringify(['（照片：機場的落地窗，一架飛機）','出發了。一年。八月見。','帶香腸回來'])&&H.G.flags.MX_DEPART==='msg');
    at('2029-09-03',12); const p1=STORY.presence('classmate_mingxuan',H.G); at('2030-07-31',12); const p2=STORY.presence('classmate_mingxuan',H.G); at('2030-08-01',12); const p3=STORY.presence('classmate_mingxuan',H.G);
    check('2-Y4-48 presence：2029-09-02～2030-07-31 在德國', p1.here===false&&p1.kind==='abroad'&&p2.here===false&&p3.here!==false); }
  /* ===== 2-Y4-49 以安：二試放榜、三試放榜（已在 AA_319 1A-18）===== */
  check('2-Y4-49 已在 AA_319：以安的兩通電話（「二試過了。一月面試。」「司法官上了。」）還在 postgrad_lines.js', POSTGRAD_LINES.AN.call1[0]==='二試過了。一月面試。'&&POSTGRAD_LINES.AN.call2[0]==='司法官上了。'&&PG.MSGS.some(m=>m.tag==='pg_an_group'));
  /* ===== 2-Y4-50 以安：哥大＋紐約送機 ===== */
  const ANF=()=>{ H.FRIEND('heroine_01'); contact('heroine_01'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); grp(); };
  { fresh('2030-03-27',20,'dorm',GD); ANF(); at('2030-03-27',21); pg();
    check('2-Y4-50 3/27 21:00 私訊「明天晚上七點，麵店。」「有事想說。」（去／不去）', JSON.stringify(th('p:heroine_01').slice(-2))===JSON.stringify(['明天晚上七點，麵店。','有事想說。'])&&!!PHONE.byAsk(H.G,'y6_an_col'));
    answer('y6_an_col',0); phone(); const q=OUT.get(H.G,'y6_an_col'); at('2030-03-28',18.4); await goOut('y6_an_col',[0]);
    check('C1 朋友：3/28 麵店當面「哥大上了。我要去。」＋她的三句、兩個選項；朋友沒有「八月走。一年。」；記憶 AN_COLUMBIA', !!q&&q.h===19&&has('（麵店。長桌的人還沒到，她坐在角落那張兩人桌。）')&&has('哥大上了。我要去。')&&has('司法官學院，我寫信說不去報到。研究所辦休學。')&&has('我媽聽了一個小時。最後她說：你講得比我想的清楚。')&&has('都考上，是要知道我做得到。……可是我想做的是公司、證券那些案子。法官很少遇到。')&&!has('八月走。一年。')&&SOCIAL.has('heroine_01','AN_COLUMBIA'));
    at('2030-03-28',22.1); pg(); check('2-Y4-50 當面說過的：22:00 沒有群組那一則', !th('g:noodle_team').includes('哥大上了。八月去紐約。'));
    at('2030-08-10',21); pg(); answer('y6_an_ny',0); phone(); at('2030-08-11',8.9); await goOut('y6_an_ny',[0]);
    check('C1 8/10 21:00 阿哲「明天以安的飛機」「早上十點 桃園 要去的舉手」；8/11 朋友版「你們不用全部都來的。」「回來的時候，我會在事務所。你來找我，要預約。」；AN_NY_SENDOFF went', th('g:noodle_team').includes('明天以安的飛機')&&th('g:noodle_team').includes('早上十點 桃園 要去的舉手')&&has('（看了一下手錶）你們不用全部都來的。')&&has('（轉向你）回來的時候，我會在事務所。你來找我，要預約。')&&has('……嗯。')&&!has('……你不用預約。')&&H.G.flags.AN_NY_SENDOFF==='went'); }
  { fresh('2030-03-28',18.4,'dorm',GD); ANF(); date('heroine_01'); OUT.plan(H.G,{id:'y6_an_col',ev:'ev_an_columbia',day:D('2030-03-28'),h:19,place:'阿鳳麵店',title:'t',travelH:0.5}); await goOut('y6_an_col',[1,1]);
    check('C2 交往中：「八月走。一年。」（她看著你，等你說話。）→「我去紐約找妳。」→「好。機票你自己訂，行程我排。」', has('確定。寫信的時候手有一點抖。抖的是手，不是我。')&&has('八月走。一年。')&&has('（她看著你，等你說話。）')&&has('好。機票你自己訂，行程我排。'));
    OUT.plan(H.G,{id:'y6_an_ny',ev:'ev_an_ny_sendoff',day:D('2030-08-11'),h:10,place:'桃園機場',title:'t',travelH:1}); at('2030-08-11',8.9); await goOut('y6_an_ny',[1]);
    check('C2 8/11 交往版：先跟大家說完「你們不用全部都來的。」才轉過來；「紐約比臺北慢十二個小時。……」「……你不用預約。」；（抱她一下）', iOf('（看了一下手錶）你們不用全部都來的。')>=0&&iOf('紐約比臺北慢十二個小時。……我算過了，你早上起床，我剛好要睡。')>iOf('（看了一下手錶）你們不用全部都來的。')&&has('每天一句就好。')&&has('……你不用預約。')&&has('（她很快地回抱了一下，轉身走進去。走到一半回頭，揮了一下手。）')); }
  { fresh('2030-03-28',20,'dorm',GD); H.FAMILIAR('heroine_01'); H.FAMILIAR('zhe'); grp(); at('2030-03-28',22); pg(); at('2030-08-10',21); pg(); at('2030-08-11',11.7); pg();
    check('2-Y4-50 不到 FRIEND：3/28 22:00 群組「哥大上了。八月去紐約。」；8/10 群組沒有「我去。」；8/11 只有群組的登機證照片', th('g:noodle_team').includes('哥大上了。八月去紐約。')&&!PHONE.byAsk(H.G,'y6_an_ny')&&th('g:noodle_team').includes('（照片：登機證）')&&!th('p:heroine_01').length&&H.G.flags.AN_NY_SENDOFF==='missed'); }
  { fresh('2030-08-10',20,'dorm',GD); ANF(); at('2030-08-10',21); pg(); at('2030-08-11',11.7); pg();
    check('2-Y4-50 FRIEND 以上、沒去：11:40 以安（照片：登機證）「要登機了」「到了再傳」', JSON.stringify(th('p:heroine_01').slice(-3))===JSON.stringify(['（照片：登機證）','要登機了','到了再傳']));
    at('2030-09-01',12); const p=STORY.presence('heroine_01',H.G); check('2-Y4-50 以安 presence：2030-08-11 起在紐約（到 2031 夏天）', p.here===false&&p.kind==='abroad'); }
  /* ===== 2-Y4-51 一試不到 12 題：2030 重考的那一年 ===== */
  const RT={BAR_REG:true,BAR_SIT_2029:true,BAR_STAGE_2029:'none'};
  { fresh('2029-09-08',20,'dorm',Object.assign({},GD,RT)); H.FAMILIAR('zhe'); at('2029-09-08',21);
    check('2-Y4-51 9/8 21:00：重考那一年的選擇到期（只有台灣路線、2029 一試沒過）', dueHas('r2y4b_retake_plan')&&S.retaker(H.G)&&!S.retaker(Object.assign({},H.G,{flags:Object.assign({},H.G.flags,{EXCHANGE_ROUTE:'JP'})})));
    H.said=[]; H.opts=[]; H.picks=['跟阿哲一起讀']; await H.run('r2y4b_retake_plan'); at('2029-09-08',21.1); PHONE.tick(H.G);
    check('Y1 9/8「（明年八月，再一次。）」三選一（補習班／在家／跟阿哲，阿哲 FAMILIAR 以上）；阿哲「好。總圖 B1，週四照舊。」「……這次我們兩個。」；RETAKE_STYLE zhe', has('（明年八月，再一次。）')&&H.opts[0].length===3&&H.G.flags.RETAKE_STYLE==='zhe'&&th('p:zhe').includes('好。總圖 B1，週四照舊。')&&th('p:zhe').includes('……這次我們兩個。'));
    const N=[['r2y4b_rt_1020','（朋友們去考二試的那兩天，你在自習室讀民法。）'],['r2y4b_rt_1214','（群組很熱鬧。你把手機蓋起來，讀完那一章才打開。）'],['r2y4b_rt_0109','（你接了一個國中生的家教，週三晚上。）'],['r2y4b_rt_0308','（杜鵑又開了。你從椰林大道旁邊走過去，沒有停。）']];
    let okN=true; for(const [id,t] of N){ H.said=[]; await H.run(id); if(!has(t)) okN=false; }
    check('2-Y4-51 摘要日（一個月一句）：10/20、12/14、2030-01（週三）、2030-03 杜鵑', okN&&CALENDAR.dateOf(D('2030-01-09')).wd%7===3);
    at('2030-05-09',21); H.said=[]; await H.run('r2y4b_rt_reg');
    check('2-Y4-51 2030-05-09（四）21:00（系統）「國考報名，這週五截止。」→（你按了報名。）', has('國考報名，這週五截止。')&&has('（你按了報名。）')&&th('sys').includes('國考報名，這週五截止。')&&H.G.flags.BAR_REG===true); }
  { fresh('2029-09-07',15,'dorm',Object.assign({},GD,RT)); H.FRIEND('heroine_05'); at('2029-09-07',15.4); pg();
    check('2-Y4-51 9/7 15:20 學姊（FRIEND 以上）「明年。……讀書計畫我幫你排。」（AA_319 那一批的 postgrad 已接）', th('p:heroine_05').includes('明年。……讀書計畫我幫你排。')); }
  { fresh('2030-08-02',21,'dorm',Object.assign({},GD,RT)); H.FRIEND('heroine_05'); date('kexin'); at('2030-08-02',22); pg();
    const N=PG.noteItems(H.G,2030).map(x=>x.text);
    check('2-Y4-51 2030-08-02 學姊的便條（「你比去年多念了一年。」）＋可昕 22:00「明天你考。」「……早點睡。我十點不打給你。」', JSON.stringify(N)===JSON.stringify(['（照片：一張手寫的便條）','（便條：「早點睡。」「你比去年多念了一年。」）'])&&JSON.stringify(th('p:kexin').slice(-2))===JSON.stringify(['明天你考。','……早點睡。我十點不打給你。'])); }
  /* ===== 2-Y4-52 交換延畢 Y5S1 ===== */
  { fresh('2029-09-03',8,'dorm',Object.assign({Y4_PATH:'grad'},GD),'JP'); H.FAMILIAR('classmate_mingxuan'); at('2029-09-03',9);
    check('2-Y4-52 9/3 開學那天：這學期怎麼過（只有日本、美國路線）', dueHas('r2y4b_y5_plan'));
    H.said=[]; H.opts=[]; H.picks=[0]; await H.run('r2y4b_y5_plan');
    check('2-Y4-52「（這學期，只有週二要去實習。其他的日子——）」三選一；「去總圖讀書。」→ Y5_DAYS study', has('（這學期，只有週二要去實習。其他的日子——）')&&JSON.stringify(H.opts[0])===JSON.stringify(['「去總圖讀書。」','「接家教，存一點錢。」','「在家準備國考。」'])&&H.G.flags.Y5_DAYS==='study');
    const IT=[['r2y4b_y5_intern1','2029-09-11',['（卷宗有三公分厚。你影印了兩個小時。）','影完了？好。現在讀第一頁。']],['r2y4b_y5_intern2','2029-10-16',['（一位阿伯在走廊的塑膠椅上坐了一個早上。）','我不急。我只是想問，要等多久。','我去問。','（四十分鐘。他說：好，知道就好。）']],['r2y4b_y5_intern3','2029-11-20',['（當事人講到一半，你想插話。）','（小聲）先聽他說完。','（他講了很久。你記了兩頁，律師只圈了最後三行。）']]];
    let okI=true; for(const [id,k,L] of IT){ at(k,10); if(!dueHas(id)) okI=false; H.said=[]; await H.run(id); if(!L.every(has)) okI=false; if(H.said.some(s=>/以安|小安/.test(s.who||''))) okI=false; }
    check('X1 三件實習（9/11、10/16、11/20 週二 10:00）：AA_181 X7 原句；律師、阿伯不具名；沒有以安；Y5_INTERN [1,2,3]', okI&&JSON.stringify(H.G.flags.Y5_INTERN)==='[1,2,3]');
    at('2029-10-15',21); pg(); check('2-Y4-52 10 月明軒（FAMILIAR 以上）：「（照片：宿舍窗外的樹都黃了）」「這裡十月就要穿大衣了。」', JSON.stringify(th('p:classmate_mingxuan'))===JSON.stringify(['（照片：宿舍窗外的樹都黃了）','這裡十月就要穿大衣了。']));
    at('2030-01-21',10); H.said=[]; await H.run('r2y4b_y5_cert'); at('2030-01-21',12.1); PHONE.tick(H.G);
    check('X3 證書那天：10:00（系統）「畢業證書已可領取。」；助教「你們交換回來的，今天第三個了。」；媽媽「照片傳給我。我要傳給你爸。」；沒有以安的群組；CERT_DAY', th('sys').includes('畢業證書已可領取。')&&has('（系辦的助教把證書遞給你。）')&&has('你們交換回來的，今天第三個了。')&&th('p:mom').includes('照片傳給我。我要傳給你爸。')&&!th('g:noodle_team').length&&H.G.flags.CERT_DAY===D('2030-01-21'));
    at('2030-02-16',9); H.said=[]; await H.run('r2y4b_grad_exam_2030'); at('2030-03-15',15); H.said=[]; await H.run('r2y4b_grad_result_2030');
    check('X2 2030-02-16 筆試（黑幕兩節、字卡「考場」、沒有以安）→ 3/15 放榜：Y5S1 選了去總圖（一週 4 天）＝上；GRAD_ADMIT exam', H.G.flags.GRAD_EXAM_2030===true&&H.G.flags.GRAD_EXAM_RESULT==='pass'&&H.G.flags.GRAD_ADMIT==='exam'&&th('sys').includes('研究所放榜：法律學研究所，錄取。')); }
  { fresh('2030-02-16',8,'dorm',Object.assign({Y4_PATH:'grad',Y5_DAYS:'work'},GD),'US'); at('2030-02-16',9); H.said=[]; H.cards=[];
    check('2-Y4-52 2030 筆試只給交換延畢、選②、還沒上的', S.gradExam2030Due(H.G)&&dueHas('r2y4b_grad_exam_2030'));
    await H.run('r2y4b_grad_exam_2030');
    check('2-Y4-52 筆試：字卡「考場」、旁白「（兩節。第二節最後一題，你寫到鐘響。）」', H.cards.some(c=>c[0]==='考場')&&has('（兩節。第二節最後一題，你寫到鐘響。）'));
    at('2030-03-15',15); await H.run('r2y4b_grad_result_2030'); at('2030-03-15',21);
    check('2-Y4-52 選了家教、總圖天數不到 24＝沒上；21:00 二選一到期', H.G.flags.GRAD_EXAM_RESULT==='fail'&&dueHas('r2y4b_grad_retry_2030'));
    H.said=[]; H.picks=[0]; await H.run('r2y4b_grad_retry_2030'); at('2031-02-15',9); await H.run('r2y4b_grad_exam_2031');
    check('2-Y4-52「明年再考。」→ 2031-02-15 再考，上了', H.G.flags.GRAD_RETRY2===true&&H.G.flags.GRAD_EXAM_2031===true&&H.G.flags.GRAD_EXAM_RESULT==='pass'&&H.G.flags.GRAD_ADMIT==='exam'); }
  { fresh('2029-09-03',8,'dorm',Object.assign({Y4_PATH:'grad'},GD)); at('2029-09-03',9);
    check('2-Y4-52 台灣路線沒有 Y5S1 那幾件', !PG.pending(H.G).some(p=>/^r2y4b_y5_/.test(p.s.id))); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
