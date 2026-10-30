// 事件包第 2 輪之三（後半）：大四下、畢業後篇、尾聲（AA_327 2-Y4-31～61，AA-C 定稿 e284d601；src/data/r2y4b_events.js、src/r2y4b3d.js）——不需要瀏覽器。
// 照 AA_327 每一件的「給 BB 的驗收情境」逐件檢查（台詞只查有沒有出現、出現在哪一段；不改字）。45、49 已在 AA_319（postgrad3d.js），這裡只確認還在；
// 42、51 的一部分、53、60 在 AA_319／AA_331 那一批（postgrad3d.js）已經有，這裡查 AA_327 的驗收點。
// 修改前：沒有 src/r2y4b3d.js、src/data/r2y4b_events.js（第 0 項 FAIL，其他全部跟著 FAIL）。用法：node tests/r2y4b_events_unit.js
// AA_519（NPC-STORY2-1028，企劃線 d75cd0228）改的期待值：A2 門口那張紙照第 1 節、第 8 節第 4 點改「出國，休息七天。——阿鳳」（原本「老闆出國，休息七天」：不再用老闆娘／老闆叫阿姨）；
//   L1「二十三週年那一張。」照 1-5 讀 y34b3d.js 設的 ANNIV23（'there'），原本的 ANNIVERSARY_23 沒有人設＝這個選項永遠到不了——另外檢查只有 ANNIVERSARY_23、ANNIV23 remote（美國路線）都沒有這個選項
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(NOODLE_CLOSED|R2Y4B|R2Y4B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM,E}=H;
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };   // 地點字幕（{scene}、GM.caption）
const memos=[]; GM.memo=t=>{ memos.push(t); };
let paid=[]; GM.money=(n,why)=>{ paid.push([n,why]); if(H.G) H.G.money=(H.G.money|0)+n; };
global.CG_REGISTRY={};   // adv3d.js 沒有載入：CG 都還沒登錄（hasCG 守門＝不放）
const cgAt=[]; { const oc=ADV.cg; ADV.cg=function(id){ cgAt.push([id,H.said.length]); return oc.call(this,id); }; }   // CG 放在第幾句之後
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
    const cz=cgAt.filter(c=>c[0]==='cg_azalea_fourth_heroine01').pop();
    check('Z2 交往中：「麻煩你。……兩個人。」；CG-18 在拍下去的那一刻（手帳那一行之前）；手帳那一行是旁白、她不唸', has('麻煩你。……兩個人。')&&H.cgs.includes('cg_azalea_fourth_heroine01')&&!!cz&&cz[1]===iOf('麻煩你。……兩個人。')+1&&cz[1]<=iOf(pen)&&has(pen)&&H.said.find(s=>s.t===pen).who===null&&!has('第四張。')&&H.G.flags.AZALEA_Y4==='two');
    delete global.CG_REGISTRY.cg_azalea_fourth_heroine01;
    H.said=[]; H.cgs=[]; await (async()=>{ fresh('2029-03-08',12.5,'campus'); ACQ('heroine_01'); date('heroine_01'); await run('ev_azalea_y4'); })();
    check('2-Y4-31 CG 沒登錄＝不放（hasCG 守門）', !H.cgs.length&&has('麻煩你。……兩個人。')); }
  { fresh('2029-03-08',12.5,'campus'); H.rel('heroine_01',2,0,0); H.FAMILIAR('yu'); grp(); E.player.obj.position.x=-20; E.player.obj.position.z=8;
    const ok=EVENTS.check(ev('ev_azalea_y4')); await run('ev_azalea_y4');   /* 開演前先定版本：EVENTS.run 一開始的 SOCIAL.meet 會把熟悉度補到 5 */
    check('2-Y4-31 還不熟：Alison 拍「笑一個嘛！」「不要。」；AZALEA_Y4 yu；12:40 群組照片「📷（同一叢杜鵑，同一個位置。以安一個人。第四張。）」（AA_345 G5）', ok&&has('（她請 Alison 拍。）')&&has('笑一個嘛！')&&has('不要。')&&!has('（把手機遞給你）第四張。')&&H.G.flags.AZALEA_Y4==='yu'&&(at('2029-03-08',12.7),PHONE.tick(H.G),th('g:noodle_team').includes('📷（同一叢杜鵑，同一個位置。以安一個人。第四張。）')), JSON.stringify(th('g:noodle_team'))); }
  { fresh('2029-03-08',12.5,'campus'); H.FRIEND('heroine_01'); H.G.flags.EX_heroine_01=true; H.FAMILIAR('yu'); E.player.obj.position.x=-20; E.player.obj.position.z=8; EVENTS.check(ev('ev_azalea_y4')); await run('ev_azalea_y4');
    check('2-Y4-31 和她分開過：也是 Alison 拍；分開過的沒有 12:10 私訊', has('笑一個嘛！')&&H.G.flags.AZALEA_Y4==='yu'&&(()=>{ fresh('2029-03-08',12,'dorm'); H.FRIEND('heroine_01'); H.G.flags.EX_heroine_01=true; contact('heroine_01'); at('2029-03-08',12.2); phone(); return !th('p:heroine_01').length; })()); }
  { fresh('2029-03-08',12,'dorm'); ACQ('heroine_01'); grp(); at('2029-03-08',13); phone();
    check('2-Y4-31 沒到：12:55 以後 AZALEA_Y4 missed、12:40 群組一張照片（說明照 AA_345 G5）', H.G.flags.AZALEA_Y4==='missed'&&th('g:noodle_team').includes('📷（同一叢杜鵑，同一個位置。以安一個人。第四張。）'), JSON.stringify(th('g:noodle_team'))); }
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
    check('2-Y4-33 作息：每週四 20:00～22:00、總圖 B1；3/1（第 2 週）起，國定假日、期末考週（AA_342 C4 以後是第 15 週 5/31）不開，6/7 起畢業後篇照開、到 7/5（7/12 是 AA_319 的最後衝刺）', A.t0===20&&A.t1===22&&ds[0]==='2029-03-01'&&!ds.includes('2029-02-22')&&!ds.includes('2029-05-31')&&ds.includes('2029-05-24')&&ds.includes('2029-06-07')&&ds.includes('2029-06-14')&&ds[ds.length-1]==='2029-07-05'&&!ds.includes('2029-07-12')&&ds.every(k=>CALENDAR.dateOf(D(k)).wd%7===4)&&ds.every(k=>!CALENDAR.holiday(D(k))), ds.join(' '));
    fresh('2029-03-01',19.9,'library_hall',{Y4_PATH:'bar'}); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('classmate_bohan');
    check('2-Y4-33 Y4_PATH bar 才有（研究所、交換延畢沒有；5/10 才報名的 BAR_REG 從那一週起有）', !A.skip(H.G)&&A.skip(Object.assign({},H.G,{flags:{Y4_PATH:'grad'}}))&&A.skip(Object.assign({},H.G,{flags:{Y4_PATH:'bar',EXCHANGE_ROUTE:'JP'}}))&&!A.skip(Object.assign({},H.G,{flags:{Y4_PATH:'grad',BAR_REG:true}})));
    const e1=CLS.clubEvent(H.G,A);
    check('2-Y4-33 第一次去：clubEvent 是 ev_bar_study_first', !!e1&&e1.id==='ev_bar_study_first');
    await run('ev_bar_study_first',[0]);
    check('B1 3/1 第一次：「誰遲到誰買飲料。」；柏翰「國考還是要考。」；「好。」→ Alison、阿哲；BAR_STUDY_N 1', has('每週四。八點到十點。誰遲到誰買飲料。')&&has('我研究所上了，國考還是要考。一起念吧。')&&has('那今天誰買飲料？')&&has('……我。我剛剛遲到。')&&H.G.flags.BAR_STUDY_N===1);
    at('2029-03-08',20); const e2=CLS.clubEvent(H.G,A); await run('ev_bar_study_week');
    check('2-Y4-33 之後每次一句（輪流）：第二次是阿哲「我第二週就只看一堂函授。我在培養感覺。」', !!e2&&e2.id==='ev_bar_study_week'&&H.said.length===1&&has('我第二週就只看一堂函授。我在培養感覺。'));
    await run('ev_bar_study_week'); check('2-Y4-33 第三次：Alison 的那一句', H.said.length===1&&has('民訴那本我借你。我畫的重點是紫色的，不要問為什麼。'));
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
    check('2-Y4-35 可昕那邊沒選：「好。那畢業旅行再說。」＋她和予樂在讀書會的照片「📷（讀書會的長桌。予樂比 YA，可昕低頭在寫講義，沒有看鏡頭。）」（AA_345 G5）', th('p:kexin').includes('好。那畢業旅行再說。')&&th('p:kexin').includes('📷（讀書會的長桌。予樂比 YA，可昕低頭在寫講義，沒有看鏡頭。）'), JSON.stringify(th('p:kexin'))); }
  { fresh('2029-04-02',19,'dorm',{SPRING_Y4:'noodle'}); TEAM(); at('2029-04-02',20.5);
    check('2-Y4-35 4/2 晚上：旁白「你回家把車開出來。」', S.springCarDue(H.G)&&(H.said=[],await S.springCar(GM),has('（你回家把車開出來。）'))&&!S.springCarDue(H.G));
    OUT.plan(H.G,{id:'y4_spring',ev:'ev_spring_y4',day:D('2029-04-03'),h:8,place:'台大校門口',title:'t',travelH:1/6}); at('2029-04-03',7.9); await goOut('y4_spring',[0]);
    check('S1 麵店團：行程表「最後一次」（旁白，不唸）；阿哲、Alison；「妳講了四個。」；「大一中秋，火一直熄。」→「那是你顧的。」；回程「謝謝你開車。」', has('（以安坐副駕，腿上是行程表第四版。理由欄只寫了四個字：「最後一次」。）')&&has('（後座）司機，我要聽歌。')&&has('不要放他的歌。')&&has('妳講了四個。')&&has('那是你顧的。')&&has('（小聲）……謝謝你開車。')&&!has('明天早上空了一格。……你排。')&&caps.includes('宜蘭・民宿'));
    fresh('2029-04-03',7.9,'dorm',{SPRING_Y4:'noodle'}); TEAM(); date('heroine_01'); OUT.plan(H.G,{id:'y4_spring',ev:'ev_spring_y4',day:D('2029-04-03'),h:8,place:'台大校門口',title:'t',travelH:1/6}); await goOut('y4_spring',[1]);
    check('2-Y4-35 和以安交往中：睡前「明天早上空了一格。……你排。」；「第一次去麵店。」→「你點了招牌乾麵。大家都是。」', has('明天早上空了一格。……你排。')&&has('你點了招牌乾麵。大家都是。')); }
  { fresh('2029-03-25',20,'dorm'); TEAM(); H.FRIEND('heroine_03'); date('heroine_03'); at('2029-03-25',20.5); phone(); H.picks=['留在宿舍']; await S.springPrompt(GM); at('2029-04-03',21.6); phone(); PHONE.tick(H.G);
    check('2-Y4-35 和語彤交往中：4/3 傍晚「看到群組了。……店裡今天很空。」；留在宿舍＝21:30 火車站的照片', th('p:heroine_03').includes('看到群組了。……店裡今天很空。')&&H.G.flags.SPRING_Y4==='dorm'&&th('g:noodle_team').includes('📷（火車站的月台。他們改搭火車。）')); }
  { fresh('2029-04-03',7.6,'dorm',{KX_TRIP:{Y1S2:'stars',Y2S2:'sea'}}); date('kexin'); OUT.plan(H.G,{id:'y4_spring_kx',ev:'ev_kexin_trip_spring_y4',day:D('2029-04-03'),h:7+40/60,place:'政大校門口',title:'t',travelH:40/60});
    await goOut('y4_spring_kx',['山上看星星']);
    check('2-Y4-35 和可昕開車（照 1C-01）：沒去過的才列、「山上看星星」一定在（AA_336 C7）；去過星星＝「今天看得到。……上次那顆，真的是星星。」；記 KX_TRIP.Y4S2；沒有假設題', JSON.stringify(H.opts[0])===JSON.stringify(['別的城市的老街','山上看星星'])&&has('今天看得到。……上次那顆，真的是星星。')&&H.G.flags.KX_TRIP.Y4S2==='stars');
    { const ga='（回程她沒有睡。過了收費站，她把音樂關小。）', i=iOf(ga);
      check('G3 車上開場、回程是大四版（AA_345 G3）：「沒有行程表。音樂我管，方向你管。」「……目的地也你管。我只是想坐在車上。」→ 目的地 → 回程「（回程她沒有睡。過了收費站，她把音樂關小。）」（旁白）「……畢業以後，還是要開。」；沒有大一、大二的句子', H.said[0]&&H.said[0].t==='沒有行程表。音樂我管，方向你管。'&&H.said[1]&&H.said[1].t==='……目的地也你管。我只是想坐在車上。'&&i>iOf('今天看得到。……上次那顆，真的是星星。')&&H.said[i].who===null&&H.said[i+1]&&H.said[i+1].t==='……畢業以後，還是要開。'&&H.said[i+1].who!==null&&!H.said.some(s=>/規則|誰都不能管對方的|我要陪你開車|我真的不睡|她睡著了|她又睡著了/.test(s.t)), JSON.stringify(H.said.map(s=>s.t))); }
    fresh('2029-04-03',7.6,'dorm',{KX_TRIP:{Y1S2:'stars',Y2S2:'sea',Y4WIN:'oldtown'}}); date('kexin'); OUT.plan(H.G,{id:'y4_spring_kx',ev:'ev_kexin_trip_spring_y4',day:D('2029-04-03'),h:7+40/60,place:'政大校門口',title:'t',travelH:40/60});
    await goOut('y4_spring_kx',[0]);
    check('2-Y4-35 三個都去過＝迷路到的地方；KX_TRIP.Y4S2 lost（AA_350 N3：開場、回程也用大四版「沒有行程表。音樂我管，方向你管。」…「（回程她沒有睡。過了收費站，她把音樂關小。）」「……畢業以後，還是要開。」，中間迷路那一段照用；沒有大一、大二版的「這次我不出行程表」「行程表我回去再補」）', H.said[0]&&H.said[0].t==='沒有行程表。音樂我管，方向你管。'&&has('……目的地也你管。我只是想坐在車上。')&&has('（販賣機吃了你的硬幣。）')&&iOf('（回程她沒有睡。過了收費站，她把音樂關小。）')>iOf('（販賣機吃了你的硬幣。）')&&has('……畢業以後，還是要開。')&&!H.said.some(s=>/這次我不出行程表|我會忍住不看|行程表我回去再補|記在行程表上/.test(s.t))&&has('……十塊。回去再記。')&&H.G.flags.KX_TRIP.Y4S2==='lost', JSON.stringify(H.said.map(s=>s.t))); }
  /* ===== 2-Y4-36 沛珊 P6 公開課 ===== */
  const PSB=()=>{ H.FAMILIAR('classmate_peishan'); H.G.flags.PS_BACK_FIRST=D('2028-08-10'); contact('classmate_peishan'); };
  { fresh('2029-04-12',20,'dorm'); PSB(); at('2029-04-12',21); phone();
    check('2-Y4-36 4/12 21:00 重新聯絡上、FAMILIAR：她私訊兩則（週六下午我上公開課…／在台南喔…）', JSON.stringify(th('p:classmate_peishan'))===JSON.stringify(['週六下午我上公開課，書店那天請假了。家長會來。……你也可以來，坐最後面。','在台南喔。很遠，不來也沒關係。']));
    answer('y4_ps_open',0); phone(); const q=OUT.get(H.G,'y4_ps_open');
    check('2-Y4-36「我去。」→ 出遊 4/14 14:00 台南（高鐵）', !!q&&q.day===D('2029-04-14')&&q.h===14&&/高鐵/.test(q.travel));
    global.CG_REGISTRY.cg_whiteboard_why_peishan={file:'x.webp',title:'t'}; at('2029-04-14',11.8); await goOut('y4_ps_open',[1]); delete global.CG_REGISTRY.cg_whiteboard_why_peishan;
    const last='……我們家的榜單還貼著。旁邊多貼了一張。';
    check('P1 去了：台南車站的旁白、媽媽四句、BCG-05 在媽媽最後一句之後、「你真的來了！！」、送到高鐵站「謝謝你來看我上課！」（AA_447 1-2：和去台南找她的送行分開）；票錢照扣；PS_OPEN_CLASS went', has('（台南車站。你照她傳的地址，搭公車到課輔班。她已經在上課了。）')&&has('（小聲）你是她大學的同學？')&&has('她說她要去當老師。我本來不懂。')&&has('可是她站在前面的樣子，跟她高中講法律的時候不一樣。')&&has(last)&&H.cgs.includes('cg_whiteboard_why_peishan')&&has('你真的來了！！')&&has('……我知道。我一進教室就看到了。')&&has('（下課以後，她把老師的外套脫掉，陪你坐車到高鐵站。）')&&has('謝謝你來看我上課！到臺北傳給我喔。')&&!has('謝謝你跑這麼遠！到臺北傳給我喔。')&&H.G.flags.PS_OPEN_CLASS==='went'&&paid.some(p=>p[0]<0&&p[1]==='交通')&&caps.includes('台南・課輔班'));
    at('2029-04-14',21.2); phone(); check('2-Y4-36 去了的：當晚沒有「媽媽來了」那一則', !th('p:classmate_peishan').some(t=>/媽媽來了/.test(t))); }
  { fresh('2029-04-14',11.8,'dorm'); PSB(); date('classmate_peishan'); OUT.plan(H.G,{id:'y4_ps_open',ev:'ev_peishan_open_class',day:D('2029-04-14'),h:14,place:'台南',title:'t',travelH:2}); await goOut('y4_ps_open',[0]);
    check('2-Y4-36 交往中：送站那一句換「你坐最後一排，我一直看到你。……害我講錯一題。」（AA_447 1-2）；「沒有。」→「你騙人。……好，我當你沒看到。」；CG 沒登錄＝不放', has('你坐最後一排，我一直看到你。……害我講錯一題。')&&!has('下次待久一點。末班車太早了。')&&!has('謝謝你來看我上課！到臺北傳給我喔。')&&has('你騙人。……好，我當你沒看到。')&&!H.cgs.length); }
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
    check('2-Y4-37（回一張麵的照片）→ 你傳的是照片「📷（別家的乾麵，旁邊一顆滷蛋）」（AA_345 G5），接她「你在吃別家的麵？我要跟阿姨講。」；YT_AUNT_PHOTO', (()=>{ const T=th('p:heroine_03'), i=T.indexOf('📷（別家的乾麵，旁邊一顆滷蛋）'); return i>0&&T[i+1]==='你在吃別家的麵？我要跟阿姨講。'; })()&&H.G.flags.YT_AUNT_PHOTO==='noodle', JSON.stringify(th('p:heroine_03')));
    at('2029-04-20',12); H.said=[]; const r=await NOODLE_CLOSED.door(GM);
    check('A2 4/20 去麵店：門口「出國，休息七天。——阿鳳」（AA_519 第 1 節、8-4；不再寫「老闆出國」）、進不去（4/26 照常開）', r===true&&H.said.some(s=>s.t==='（麵店門口貼著一張紙：「出國，休息七天。——阿鳳」）')&&!H.said.some(s=>/老闆/.test(s.t))&&(at('2029-04-26',12),!(await NOODLE_CLOSED.door(GM))), JSON.stringify(H.said.map(s=>s.t))); }
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
    check('2-Y4-39 5/11 21:00 阿哲在群組揪三則；排兩個出遊 5/12 10:00、19:00', JSON.stringify(th('g:noodle_team').slice(-3))===JSON.stringify(['明天早上十點 最後一場','晚上 Alison 成發','兩個都給我來'])&&!!q1&&q1.h===10&&q1.day===D('2029-05-12')&&!!q2&&q2.h===19);
    at('2029-05-12',9.8); await goOut('y4_last_game',[2]);
    check('G1 系籃：「（新體育館。阿哲在場邊綁鞋帶，綁了三次。）」；拍手／記分／送水三選一；送水「後勤部長，最後一次。」；明軒「……這次我不先走。」；阿哲「四年。……好，吃午餐。」；BALL_Y4 went', has('（新體育館。阿哲在場邊綁鞋帶，綁了三次。）')&&JSON.stringify(H.opts[0])===JSON.stringify(['拍手','記分','送水'])&&has('（中場你把一箱水搬到場邊。阿哲喝了一口：「後勤部長，最後一次。」）')&&has('最後一場。')&&has('……這次我不先走。')&&has('（坐在場邊，把護膝拿下來）四年。……好，吃午餐。')&&H.G.flags.BALL_Y4==='went');
    at('2029-05-12',18.8); await goOut('y4_concert');
    check('G1 成發：Alison「最後一首！……」；子晴評審（有 CLAPPED）「原來坐這裡是這種感覺。你以前都這麼大聲喔？」；阿凱「我還是沒入社。」；CONCERT_Y4 went', has('（Alison 拿著流程表跑來跑去。）')&&has('最後一首！最後一首！誰把麥克風拿走了！')&&has('原來坐這裡是這種感覺。你以前都這麼大聲喔？')&&has('我還是沒入社。')&&H.G.flags.CONCERT_Y4==='went'); }
  { fresh('2029-05-11',20,'dorm'); H.FAMILIAR('zhe'); H.FAMILIAR('yu'); H.FAMILIAR('classmate_mingxuan'); grp(); at('2029-05-11',21); phone(); at('2029-05-12',22);
    for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('G2 都沒去：12:30 明軒「系籃最後一場打完了。這次我待到最後 😂」、21:30 群組照片（舞台上的 Alison）；BALL_Y4、CONCERT_Y4 missed', th('g:noodle_team').includes('系籃最後一場打完了。這次我待到最後 😂')&&th('g:noodle_team').includes('📷（舞台上，Alison 拿著麥克風，對著台下比了一個讚。）')&&H.G.flags.BALL_Y4==='missed'&&H.G.flags.CONCERT_Y4==='missed'); }
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
    fresh('2029-05-28',15,'classroom'); memos.length=0; await S.journal(GM,it);
    const C=COURSES.list.find(c=>c&&c.id==='legal_research'), itW=k=>(CLS.dayItems(H.G,D(k))||[]).find(x=>x.c.id==='legal_research'), b6=CLS.content(itW('2029-03-26')), b7=CLS.content(itW('2029-04-02')), b10=CLS.content(itW('2029-04-23'));
    check('J2 沒交過：「法律專題研究的報告交了。」；AA_342 C1：大四下第 6、7 週都是一般的週（courses.js 的 specials 只剩 w10；syllabus 沒有那兩週；課堂沒有「法院旁聽」「旁聽之後」），第 10 週照舊回顧大一', memos.includes('法律專題研究的報告交了。')&&!!C&&JSON.stringify((C.specials||[]).map(s=>s.w))==='[10]'&&!SYLLABUS.courses.legal_research.some(w=>w.w===6||w.w===7)&&!/旁聽/.test(b6.board.join('')+b6.line)&&!/旁聽/.test(b7.board.join('')+b7.line)&&b10.board[0]==='回顧：大一的第一堂', JSON.stringify([b6.board,b7.board,b10.board[0]])); }
  { fresh('2029-05-28',8,'dorm'); const lr=(CLS.dayItems(H.G,D('2029-05-28'))||[]).find(x=>x.c.id==='legal_research'), MT=COURSES.list.find(c=>c.id==='maritime'), LR=COURSES.list.find(c=>c.id==='legal_research'), t15=CALENDAR.termOf(D('2029-05-28'));
    check('J3 AA_342 C4：大四下 15 週，第 15 週是期末考週、6/4 起不算學期；沒有考試的法律專題研究 5/28 照常上最後一堂（exam null，日誌才會寫）；海商法（有考試）不受影響', !!t15&&t15.week===15&&t15.exam==='final'&&!!lr&&lr.exam===null&&CLS.noExam(LR)===true&&CLS.noExam(MT)===false&&CLS.isExamCourse(MT)===true&&CALENDAR.termOf(D('2029-06-04'))===null, JSON.stringify([t15,lr?lr.exam:'NONE'])); }
  /* ===== 2-Y4-42 學姊的生日（已在 AA_319 1A-14＝postgrad3d.js；這裡查 AA_327 的驗收點）===== */
  { fresh('2029-06-02',20.5,'dorm'); H.FRIEND('heroine_05'); H.said=[]; H.picks=[0]; await PG.bdayScene(GM,'outing');
    check('S1 朋友：「祐廷也來了。」；沒有「學弟也來了」；沒有條列；SIS_BDAY_Y4 there', has('祐廷也來了。')&&!H.said.some(s=>/學弟也來了/.test(s.t))&&!H.said.some(s=>/^(一|二|三)，/.test(s.t))&&H.G.flags.SIS_BDAY_Y4==='there');
    fresh('2029-06-02',20.5,'dorm'); H.FRIEND('heroine_05'); date('heroine_05'); H.said=[]; H.picks=[0]; await PG.bdayScene(GM,'outing');
    check('S2 交往中：Kevin 先走「我們先走了！學弟，蛋糕交給你。」；「……不說。這次不排。」；SIS_BDAY_Y4 lover', has('我們先走了！學弟，蛋糕交給你。')&&has('……不說。這次不排。')&&H.G.flags.SIS_BDAY_Y4==='lover'&&!H.opts.flat().includes('（送禮物）')); }
  /* AA_345 G9 42：友情版的「送禮物」＝四選一（BB_122 3-7「單身以後」那一欄；四個都合適＝多一句「……你怎麼知道。」）；沒有「今天先不改了」券；不扣錢；只算一次（信任 +3、她的戀愛 +2）*/
  { fresh('2029-06-02',20.5,'dorm'); H.FRIEND('heroine_05'); const r0=Object.assign({},SOCIAL.rel('heroine_05')), m0=H.G.money; H.said=[]; H.opts=[]; H.picks=[2,3]; await PG.bdayScene(GM,'outing'); const r1=SOCIAL.rel('heroine_05'), i=iOf('我第一次收到不是畢業典禮的花。');
    check('G9-42 友情版三個選項（「生日快樂。」「口試也過了，雙喜。」「（送禮物）」）→ 四選一：一盒綠色螢光筆／一本空白筆記本／期末考前的蜂蜜檸檬／一束花（沒有「今天先不改了」券）', JSON.stringify(H.opts[0])===JSON.stringify(['「生日快樂。」','「口試也過了，雙喜。」','（送禮物）'])&&JSON.stringify(H.opts[1])===JSON.stringify(['一盒綠色螢光筆','一本空白筆記本','期末考前的蜂蜜檸檬','一束花'])&&!H.opts.flat().some(t=>/今天先不改了/.test(t)), JSON.stringify(H.opts));
    check('G9-42 送花：「我第一次收到不是畢業典禮的花。」→「……你怎麼知道。」（她說的）；沒有「生日快樂」那兩句；SIS_BDAY_GIFT_Y4 flowers、SIS_BDAY_Y4 there；信任 +3、她的戀愛 +2；不扣錢', i>=0&&H.said[i].who!==null&&H.said[i+1]&&H.said[i+1].t==='……你怎麼知道。'&&H.said[i+1].who!==null&&!has('今天你畢業，我生日。都沒排，結果還不錯。')&&H.G.flags.SIS_BDAY_GIFT_Y4==='flowers'&&H.G.flags.SIS_BDAY_Y4==='there'&&r1.trust-r0.trust===3&&(r1.npcRom|0)-(r0.npcRom|0)===2&&H.G.money===m0&&!paid.length, JSON.stringify({said:H.said.map(s=>s.t).slice(-3),dt:r1.trust-r0.trust,dr:(r1.npcRom|0)-(r0.npcRom|0)}));
    const t1=SOCIAL.rel('heroine_05').trust; H.said=[]; H.opts=[]; H.picks=[0]; await PG.bdayScene(GM,'outing');
    check('G9-42 這一年的生日禮物只算一次：再演一次沒有「（送禮物）」、信任不再加', !H.opts[0].includes('（送禮物）')&&SOCIAL.rel('heroine_05').trust===t1, JSON.stringify(H.opts[0]));
    fresh('2029-06-02',20.5,'dorm'); H.FRIEND('heroine_05'); H.said=[]; H.picks=[2,0]; await PG.bdayScene(GM,'outing'); const j=iOf('實用。……謝謝。這週就會用完。');
    check('G9-42 送螢光筆：「實用。……謝謝。這週就會用完。」→「……你怎麼知道。」；SIS_BDAY_GIFT_Y4 highlighter', j>=0&&H.said[j+1]&&H.said[j+1].t==='……你怎麼知道。'&&H.G.flags.SIS_BDAY_GIFT_Y4==='highlighter'); }
  /* ===== 2-Y4-43 期末最後一頓 ===== */
  { fresh('2029-06-22',16,'dorm',{GRADUATED:D('2029-06-02')}); TEAM(); at('2029-06-22',17); pg();
    const q=OUT.get(H.G,'y4_last_meal');
    check('2-Y4-43 17:00 阿哲「今天 期末最後一頓」「七點 麵店」；出遊 6/22 19:00', JSON.stringify(th('g:noodle_team').slice(-2))===JSON.stringify(['今天 期末最後一頓','七點 麵店'])&&!!q&&q.h===19&&q.day===D('2029-06-22'));
    H.G.flags.ANNIV23='there'; at('2029-06-22',18.8); await goOut('y4_last_meal',[1]);   /* AA_519 1-5：讀 y34b3d.js 設的 ANNIV23（原本 ANNIVERSARY_23 沒有人設）*/
    check('L1 去了：牆上的照片；阿姨「照片我貼起來了。你們自己找，找不到的下次帶一張來。」；「二十三週年那一張。」（有 ANNIV23 there，AA_519 1-5）；Alison「這是最後一頓了。」阿哲「這不是最後一頓。下週二還是麵店。」；LAST_MEAL_Y4 went', has('（麵店的牆上貼滿了照片。四年來，大家在長桌拍的。）')&&has('照片我貼起來了。你們自己找，找不到的下次帶一張來。')&&H.opts[0].length===3&&has('（長桌坐滿，你被擠在角落，只照到半張臉。）')&&has('這是最後一頓了。')&&has('這不是最後一頓。下週二還是麵店。')&&H.G.flags.LAST_MEAL_Y4==='went'); }
  { const O=[]; for(const f of [{ANNIVERSARY_23:true},{ANNIV23:'remote'},{}]){ fresh('2029-06-22',16,'dorm',Object.assign({GRADUATED:D('2029-06-02')},f)); TEAM(); at('2029-06-22',17); pg(); at('2029-06-22',18.8); await goOut('y4_last_meal',[0]); O.push((H.opts[0]||[]).slice()); }
    check('L1 AA_519 1-5：只有舊的 ANNIVERSARY_23、ANNIV23 remote（美國路線，不在照片裡）、都沒有＝沒有「二十三週年那一張。」（兩個選項）', O.every(o=>o.length===2&&!o.some(t=>/二十三週年/.test(t))), JSON.stringify(O)); }
  { fresh('2029-06-22',16,'dorm',{GRADUATED:D('2029-06-02')}); TEAM(); at('2029-06-22',17); pg(); at('2029-06-22',21.6);
    for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('L2 沒去：21:30 群組照片「（牆上貼滿了照片。阿姨說，找不到自己的，下次帶一張來。）」', th('g:noodle_team').includes('📷（牆上貼滿了照片。阿姨說，找不到自己的，下次帶一張來。）')&&H.G.flags.LAST_MEAL_Y4==='missed'); }
  /* ===== 2-Y4-44 可昕 K26 ===== */
  const GD={GRADUATED:D('2029-06-02')};
  { fresh('2029-07-05',20,'dorm',Object.assign({NCCU_FOOD_N:3},GD)); date('kexin'); at('2029-07-05',21); pg();
    const q=OUT.get(H.G,'y4_kx_k26');
    check('2-Y4-44 7/5 21:00「禮拜六下午，我把行程表空出來了。」「三點，老地方。」（AA_366 第 4 節 A7）；出遊 7/7 15:00', JSON.stringify(th('p:kexin').slice(-2))===JSON.stringify(['禮拜六下午，我把行程表空出來了。','三點，老地方。'])&&!!q&&q.day===D('2029-07-07')&&q.h===15);
    at('2029-07-07',14.2); await goOut('y4_kx_k26');
    check('K1 去了（「我們的店」三次以上）：老闆「畢業了喔？」；「下個月考試。今天不讀書。……考試的事，明天再說。」；KX_K26 went', has('（老闆端上兩個人的點法，只說：「畢業了喔？」）')&&has('下個月考試。今天不讀書。……考試的事，明天再說。')&&!has('畢業了。這裡也算我們的店。')&&H.G.flags.KX_K26==='went'); }
  { fresh('2029-07-07',14.2,'dorm',GD,'JP'); date('kexin'); const L=DATE.log(H.G,'kexin'); L.byLoc={D25:3,D04:1}; L.count=4; S.k26Plan(H.G); const q=OUT.get(H.G,'y4_kx_k26'); await goOut('y4_kx_k26');
    check('K2 交換延畢、不常去山下那家：老地方＝約會紀錄裡次數最多的（外澳）；「畢業了。這裡也算我們的店。」「你還差一個學期。……那今天先慶祝我的。」（AA_382 第 1 節第 3 項）', !!q&&/外澳/.test(q.place)&&has('畢業了。這裡也算我們的店。')&&has('你還差一個學期。……那今天先慶祝我的。')&&!has('下個月考試。今天不讀書。……考試的事，明天再說。')); }
  { fresh('2029-07-05',20,'dorm',GD); date('kexin'); at('2029-07-05',21); pg(); at('2029-07-07',16.5); for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); PHONE.tick(H.G);
    check('2-Y4-44 沒去：「三點，老地方。你沒來。」「……我自己吃了兩份。」（AA_366 第 4 節 A7；AA_356 1-4：不留欠債，沒有「你欠我一次」）；KX_K26 missed', JSON.stringify(th('p:kexin').slice(-2))===JSON.stringify(['三點，老地方。你沒來。','……我自己吃了兩份。'])&&!th('p:kexin').some(t=>/你欠我一次/.test(t))&&H.G.flags.KX_K26==='missed', JSON.stringify(th('p:kexin').slice(-3))); }
  { fresh('2029-07-07',14.2,'dorm',GD,'JP'); date('kexin'); H.G.flags.KX_GRAD='mine'; const L=DATE.log(H.G,'kexin'); L.byLoc={D25:3,D04:1}; L.count=4; S.k26Plan(H.G); await goOut('y4_kx_k26');
    const i0=iOf('畢業了。這裡也算我們的店。'), i1=iOf('（她把手機交給隔壁桌的人：「不好意思，幫我們拍一張。」）');
    check('AA_356 1-3：她的典禮沒去（KX_GRAD mine）＝7/7 第一句之後補合照兩行（旁白＋「典禮那天欠的合照。」）；記 KX_GRAD_PHOTO k26', i0>=0&&i1===i0+1&&H.said[i1].who===null&&H.said[i1+1]&&H.said[i1+1].t==='典禮那天欠的合照。'&&H.G.flags.KX_GRAD_PHOTO==='k26', JSON.stringify(H.said.map(x=>x.t).slice(0,5)));
    fresh('2029-07-07',14.2,'dorm',GD,'JP'); date('kexin'); H.G.flags.KX_GRAD='went'; const L2=DATE.log(H.G,'kexin'); L2.byLoc={D25:3,D04:1}; L2.count=4; S.k26Plan(H.G); await goOut('y4_kx_k26');
    check('AA_356 1-3：有去她的典禮＝沒有合照那兩行', !has('典禮那天欠的合照。')&&!H.G.flags.KX_GRAD_PHOTO); }
  /* ===== 2-Y4-45 七月最後衝刺（已在 AA_319 1A-16）===== */
  check('2-Y4-45 已在 AA_319：7/12 20:00 總圖 B1 最後衝刺（postgrad3d.js 的 b1）還在；國考讀書會的作息不排 7/12', !!PG.byId('b1')&&PG.byId('b1').at(H.G)===D('2029-07-12')*24+20&&!ACTIVITIES.list.find(a=>a.id==='act_bar_study').dates.includes('2029-07-12'));
  /* ===== 2-Y4-46 七月最後一次的心意邀約 ===== */
  const heartOk=id=>{ const r=SOCIAL.rel(id); r.npcRom=60; const L=DATE.log(H.G,id); L.count=4; L.wish=true; TERMEND.rec(H.G).think[id]='Y4S2'; };
  { fresh('2029-07-13',20,'dorm',Object.assign({BAR_REG:true},GD)); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg();
    check('J1 畢業傍晚對以安選「讓我想想」：7/13 21:00「明天晚上有空嗎。」「六點半，同一家。……手帳我帶著。」', JSON.stringify(th('p:heroine_01').slice(-2))===JSON.stringify(['明天晚上有空嗎。','六點半，同一家。……手帳我帶著。']));
    answer('y4_july',0); phone(); const q=OUT.get(H.G,'y4_july'); at('2029-07-14',0.1); phone();
    check('2-Y4-46「好。」→ 7/14 18:30 公館巷子裡她知道的小店；7/14 00:00 重新判斷照樣成立', !!q&&q.h===18.5&&q.day===D('2029-07-14')&&q.state==='planned'&&!H.G.flags.JULY_CANCEL);
    at('2029-07-14',9.5); const early=dueHas('r2y4b_july_day'); at('2029-07-14',10); const due=dueHas('r2y4b_july_day'); H.said=[]; { const st=PG.byId('r2y4b_july_day'); if(st) await PG.runStep(GM,st); }
    check('G9-46 7/14 白天（10:00）旁白「（白天照樣在總圖。離一試還有二十一天。）」（AA_345 G9；有那天晚上的邀約、報了國考）', !early&&due&&H.said.length===1&&H.said[0].t==='（白天照樣在總圖。離一試還有二十一天。）'&&H.said[0].who===null, JSON.stringify(H.said));
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
  { fresh('2029-07-13',20,'dorm',GD); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg(); answer('y4_july',0); phone(); at('2029-07-14',10); const a=dueHas('r2y4b_july_day');
    fresh('2029-07-13',20,'dorm',Object.assign({BAR_REG:true},GD)); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg(); at('2029-07-14',10); const b=dueHas('r2y4b_july_day');
    fresh('2029-07-13',20,'dorm',Object.assign({BAR_REG:true},GD)); at('2029-07-14',10); const c=dueHas('r2y4b_july_day');
    check('G9-46 沒報國考、邀約沒回（沒有那一場）、沒有邀約的：7/14 白天沒有那一句', !a&&!b&&!c, JSON.stringify([a,b,c])); }
  { fresh('2029-07-13',20,'dorm',GD); H.FRIEND('heroine_01'); heartOk('heroine_01'); at('2029-07-13',21); pg(); answer('y4_july',0); phone(); at('2029-07-14',9.5); const early=dueHas('r2y4b_july_day_nobar'); at('2029-07-14',10); const due=dueHas('r2y4b_july_day_nobar'); H.said=[]; { const st=PG.byId('r2y4b_july_day_nobar'); if(st) await PG.runStep(GM,st); }
    check('AA_350 N2：沒報國考、有 7/14 那一場的：10:00「（白天沒有排什麼事。畢業以後的第一個七月，一天變得很長。）」（09:30 還沒有）', !early&&due&&H.said.some(x=>x.t==='（白天沒有排什麼事。畢業以後的第一個七月，一天變得很長。）'), JSON.stringify([early,due,H.said.slice(0,3)])); }
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
    check('2-Y4-48 9/1 21:00 群組五則（明天早上的飛機。…Alison：我們去！！）；FAMILIAR 以上有「我也去。」', JSON.stringify(L)===JSON.stringify(['明天早上的飛機。','不用送。……真的不用。','幾點','七點。我說不用。','我們去！！'])&&(()=>{ const m=PHONE.byAsk(H.G,'y5_mx_depart'); return !!m&&m.ask.opts[0].t==='我也去。'; })());
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
    check('C2 交往中：「八月走。一年。」（她看著你，等你說話。）→「我去紐約找妳。」→「好。機票你自己訂，行程我排。」', has('確定。寫信的時候手有一點抖。')&&!has('抖的是手，不是我。')&&has('八月走。一年。')&&has('（她看著你，等你說話。）')&&has('好。機票你自己訂，行程我排。'));
    OUT.plan(H.G,{id:'y6_an_ny',ev:'ev_an_ny_sendoff',day:D('2030-08-11'),h:10,place:'桃園機場',title:'t',travelH:1}); at('2030-08-11',8.9); await goOut('y6_an_ny',[1]);
    check('C2 8/11 交往版：先跟大家說完「你們不用全部都來的。」才轉過來；「紐約比臺北慢十二個小時。……」「……你不用預約。」；（抱她一下）', iOf('（看了一下手錶）你們不用全部都來的。')>=0&&iOf('紐約比臺北慢十二個小時。……我算過了，你早上起床，我剛好要睡。')>iOf('（看了一下手錶）你們不用全部都來的。')&&has('每天一句就好。')&&has('……你不用預約。')&&has('（她很快地回抱了一下，轉身走進去。走到一半回頭，揮了一下手。）')); }
  { fresh('2030-03-28',18.4,'dorm',GD); ANF(); date('heroine_01'); H.G.flags.AN_SENDOFF='went'; H.G.flags.AN_JP_TRIP_ASK='go'; OUT.plan(H.G,{id:'y6_an_col',ev:'ev_an_columbia',day:D('2030-03-28'),h:19,place:'阿鳳麵店',title:'t',travelH:0.5}); await goOut('y6_an_col',[1,1]);
    check('AA_447 1-3 答應過日本七夕（AN_JP_TRIP_ASK go）：「好。跟上次一樣，機票你自己訂，行程我排。」，沒有原句', has('好。跟上次一樣，機票你自己訂，行程我排。')&&!has('好。機票你自己訂，行程我排。'));
    OUT.plan(H.G,{id:'y6_an_ny',ev:'ev_an_ny_sendoff',day:D('2030-08-11'),h:10,place:'桃園機場',title:'t',travelH:1}); at('2030-08-11',8.9); await goOut('y6_an_ny',[1]);
    check('AA_447 1-1 送過她去日本（AN_SENDOFF went）交往版：前三句換「兩年多前送她去日本，也是這個門口」「……我上次也說過。」「上次你也知道我們會來。」，沒有照抄的三句；後面照常', has('（桃園機場，出境的門口。兩年多前送她去日本，也是這個門口。）')&&has('（看了一下手錶）……我上次也說過。你們不用全部都來的。')&&has('上次你也知道我們會來。')&&!has('（桃園機場，出境的門口。麵店團站成一排。）')&&!has('（看了一下手錶）你們不用全部都來的。')&&!has('要。')&&has('紐約比臺北慢十二個小時。……我算過了，你早上起床，我剛好要睡。')); }
  { fresh('2030-08-10',20,'dorm',GD); ANF(); H.G.flags.AN_SENDOFF='together'; at('2030-08-10',21); pg(); answer('y6_an_ny',0); phone(); at('2030-08-11',8.9); await goOut('y6_an_ny',[0]);
    check('AA_447 1-1 日本路線一起出發（AN_SENDOFF together）朋友版：換句的三句；「回來的時候，我會在事務所。」照常', has('（桃園機場，出境的門口。兩年多前送她去日本，也是這個門口。）')&&has('上次你也知道我們會來。')&&!has('（看了一下手錶）你們不用全部都來的。')&&has('（轉向你）回來的時候，我會在事務所。你來找我，要預約。')); }
  { fresh('2030-08-10',20,'dorm',GD); ANF(); H.G.flags.AN_SENDOFF='missed'; at('2030-08-10',21); pg(); answer('y6_an_ny',0); phone(); at('2030-08-11',8.9); await goOut('y6_an_ny',[0]);
    check('AA_447 1-1 2028 沒去送機（missed）：照原本三句', has('（桃園機場，出境的門口。麵店團站成一排。）')&&has('（看了一下手錶）你們不用全部都來的。')&&!has('上次你也知道我們會來。')); }
  { fresh('2030-03-27',20,'dorm',GD); ANF(); at('2030-03-27',21); pg(); answer('y6_an_col',1); at('2030-03-28',22); pg();
    check('G6-50 3/27 選「那天不行。」：以安回「好。……那我寫在群組。」（AA_345 G6）；3/28 22:00 群組「哥大上了。八月去紐約。」照常；沒有排麵店', (()=>{ const T=th('p:heroine_01'), i=T.indexOf('那天不行。'); return i>=0&&T[i+1]==='好。……那我寫在群組。'; })()&&th('g:noodle_team').includes('哥大上了。八月去紐約。')&&!OUT.get(H.G,'y6_an_col'), JSON.stringify(th('p:heroine_01'))); }
  { const ML=SOCIAL.MEMORY_LABEL; check('G7 人物面板名稱定稿（AA_345 第 4 節）：AN_GRAD_PASS「她研究所放榜那晚，在麵店」、AN_COLUMBIA「她說哥大上了，八月要去紐約」', ML.AN_GRAD_PASS==='她研究所放榜那晚，在麵店'&&ML.AN_COLUMBIA==='她說哥大上了，八月要去紐約', JSON.stringify([ML.AN_GRAD_PASS,ML.AN_COLUMBIA])); }
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
    check('Y1 9/8「（明年八月，再一次。）」三選一（補習班／在家／跟阿哲，阿哲 FAMILIAR 以上）；阿哲「好 總圖 B1，週四照舊」「……這次我們兩個」；RETAKE_STYLE zhe', has('（明年八月，再一次。）')&&H.opts[0].length===3&&H.G.flags.RETAKE_STYLE==='zhe'&&th('p:zhe').includes('好 總圖 B1，週四照舊')&&th('p:zhe').includes('……這次我們兩個'));
    const N=[['r2y4b_rt_1020','（朋友們去考二試的那兩天，你在自習室讀民法。）'],['r2y4b_rt_1214','（群組很熱鬧。你把手機蓋起來，讀完那一章才打開。）'],['r2y4b_rt_0109','（你接了一個國中生的家教，週三晚上。）'],['r2y4b_rt_0308','（杜鵑又開了。你從椰林大道旁邊走過去，沒有停。）']];
    let okN=true; for(const [id,t] of N){ H.said=[]; await H.run(id); if(!has(t)) okN=false; }
    check('2-Y4-51 摘要日（一個月一句）：10/20、12/14、2030-01（週三）、2030-03 杜鵑', okN&&CALENDAR.dateOf(D('2030-01-09')).wd%7===3);
    at('2030-05-09',21); H.said=[]; await H.run('r2y4b_rt_reg');
    check('2-Y4-51 2030-05-09（四）21:00（系統）「國考報名，這週五截止。」→（你按了報名。）', has('國考報名，這週五截止。')&&has('（你按了報名。）')&&th('sys').includes('國考報名，這週五截止。')&&H.G.flags.BAR_REG===true); }
  { fresh('2029-09-07',15,'dorm',Object.assign({},GD,RT)); H.FRIEND('heroine_05'); at('2029-09-07',15.4); pg();
    check('2-Y4-51 9/7 15:20 學姊（FRIEND 以上）「明年。……讀書計畫你先排，我幫你看。」（AA_319 那一批的 postgrad 已接）', th('p:heroine_05').includes('明年。……讀書計畫你先排，我幫你看。')); }
  { fresh('2030-08-02',21,'dorm',Object.assign({},GD,RT)); H.FRIEND('heroine_05'); date('kexin'); at('2030-08-02',22); pg();
    const N=PG.noteItems(H.G,2030).map(x=>x.text);
    check('2-Y4-51 2030-08-02 學姊的便條（「你比去年多念了一年。」）＋可昕 22:00「明天你考。」「……早點睡。我十點不打給你。」', JSON.stringify(N)===JSON.stringify(['（照片：一張手寫的便條）','（便條：「你比去年多念了一年。」）'])&&JSON.stringify(th('p:kexin').slice(-2))===JSON.stringify(['明天你考。','……早點睡。我十點不打給你。'])); }
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
  /* ===== 2-Y4-53 尾聲：每人一句的條件細分（已在 AA_319 1A-20＝postgrad3d.js 的表；這裡查 AA_327 的驗收點）===== */
  const LAWYER29={BAR_REG:true,BAR_SIT_2029:true,BAR_SCORE_2029:14,BAR_STAGE_2029:'lawyer',BAR_YEAR:2029};
  const epiRun=async(flags,setup,route)=>{ const G=fresh('2034-06-03',18,'dorm',Object.assign({},GD,flags),route); PG.rec(G).done.grad=1; G.flags.FIRST_DAY_SEEN=true; PG.rec(G).done.first=1; if(setup) setup(G);
    H.said=[]; H.cards=[]; H.cgs=[]; GM.running=true; await H.run('epi'); return G; };
  { await epiRun(LAWYER29,()=>{ H.FAMILIAR('classmate_mingxuan'); H.FRIEND('heroine_01'); H.G.flags.EX_heroine_01=true; });
    check('E1 律師、2029 錄取、明軒 FAMILIAR：「你放榜那天，我在德國。早上八點，在去上課的電車上看到的。」', has('你放榜那天，我在德國。早上八點，在去上課的電車上看到的。'));
    check('E4 和以安分開過：她在店的另一頭「好久不見。」「我先走了，合約週一要交。」，不再接；E3 沒有「司法官」的句子', has('好久不見。')&&has('我先走了，合約週一要交。')&&!has(POSTGRAD_LINES.EPI.an.friend)&&!H.said.some(s=>s.who&&/司法官/.test(s.t))); }
  { await epiRun(LAWYER29,()=>{ date('kexin'); });
    check('E2 和可昕交往（A）、律師：沒有「你不要讓我」、沒有假設題', !H.said.some(s=>/你不要讓我|假設/.test(s.t))&&H.said.some(s=>s.who===SOCIAL.displayName('kexin'))); }
  { const src=fs.readFileSync(path.join(H.ROOT,'src/postgrad3d.js'),'utf8'); await epiRun({BAR_YEAR:2031},()=>{ H.FAMILIAR('npc_fangyt'); },'JP');
    check('2-Y4-53 方奕廷「那一年你在考試。……我知道。」照 AA_327 定稿表與 AA_331 第 1 節 b：只看台灣路線 BAR_YEAR===2030（交換路線 2031 劃掉了，這一批沒有加回去）', /if\(!S\.delayed\(G\)&&F\.BAR_YEAR===2030\) t=Fy\.y2030;/.test(src)&&!has('那一年你在考試。……我知道。')); }
  /* ===== 2-Y4-54 多段感情 ===== */
  { fresh('2029-05-21',21,'campus'); H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); at('2029-05-21',22);
    check('2-Y4-54 A 5/21 22:00：兩位以上、至少一位還不知道＝到期；要在宿舍房間（在校園＝等）', S.multiPreDue(H.G)&&!dueHas('r2y4b_multi_pre')&&(H.G.zone='dorm',dueHas('r2y4b_multi_pre')));
    H.said=[]; H.opts=[]; H.picks=[2]; await H.run('r2y4b_multi_pre');
    check('U1 5/21「（典禮那天，她們都會來。）」三選一；「先不想。」＝MULTI_PRE later、不演被發現', has('（典禮那天，她們都會來。）')&&JSON.stringify(H.opts[0])===JSON.stringify(['「先跟她們說清楚。」','「選一個人。」','「先不想。」'])&&H.G.flags.MULTI_PRE==='later'&&H.G.flags.dating_heroine_01&&H.G.flags.dating_heroine_04);
    fresh('2029-06-02',12,'campus'); H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); H.FAMILIAR('classmate_mingxuan'); await H.run('grad');
    const iZ=iOf(POSTGRAD_LINES.PARTNER.heroine_04[0][1]), iK=iOf(POSTGRAD_LINES.OTHERS.kai[0][1]), iA=H.said.findIndex(s=>s.who===SOCIAL.displayName('heroine_01'));
    check('U1 典禮兩段伴侶戲分開演：第一位（以安）在大合照之後，第二位（子晴）在 ⑥ 其他人之前；沒有被發現', iA>=0&&iZ>iA&&iK>iZ&&!H.said.some(s=>/被發現|你還有別人/.test(s.t))); }
  { fresh('2029-05-21',22,'dorm'); H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); H.picks=[0]; await H.run('r2y4b_multi_pre');
    const L=H.G.flags.MULTI_TELL29; at('2029-05-22',21);
    check('2-Y4-54「先跟她們說清楚。」＝當週一位一場（每天晚上 21:00 一位）', H.G.flags.MULTI_PRE==='tell'&&!!L&&JSON.stringify(L.list)==='["heroine_01","heroine_04"]'&&dueHas('r2y4b_tell29_0')&&!dueHas('r2y4b_tell29_1'));
    H.said=[]; caps.length=0; await H.run('r2y4b_tell29_0'); const R1=ROM.get(H.G,'heroine_01');
    check('U3 以安（萬才館研討室外的走廊）：「……多久了？」＋旁白「（你回答以後，她點了一下頭，沒有再問。）」「我要想一下。這個禮拜先不要約。」（AA_350 R0b；AA_482 第 4 節：當場不決定）→ 還在交往（不退回朋友）、記成祐廷先坦白（YT_CONFESSED、她知道子晴；冷靜期在 MREL，這支測試沒有載）；不是前任', has('……多久了？')&&has('（你回答以後，她點了一下頭，沒有再問。）')&&!has('……謝謝你說實話。')&&has('我要想一下。這個禮拜先不要約。')&&!has('我們先當朋友。')&&caps.includes('萬才館研討室外的走廊')&&H.G.flags.dating_heroine_01===true&&R1.status==='dating'&&H.G.flags.YT_CONFESSED.heroine_01.heroine_04===H.G.day&&ROM.knowsOf(H.G,'heroine_01','heroine_04')&&!H.G.flags.EX_heroine_01);
    at('2029-05-23',21); H.said=[]; await H.run('r2y4b_tell29_1');
    check('U3 子晴：「……你是來跟我說，你還有別人。」「……我還以為你要問社課的事。」「我要想一下啦。想完我會找你。」（AA_350 R0b；AA_482 第 4 節）；沒有「存檔」；還在交往', has('……你是來跟我說，你還有別人。')&&has('……我還以為你要問社課的事。')&&!has('謝謝你自己來講。')&&has('我要想一下啦。想完我會找你。')&&!H.said.some(s=>/存檔/.test(s.t))&&H.G.flags.dating_heroine_04===true);
    { const T=S.TELL, str=x=>JSON.stringify(x); check('U3 AA_350 R0b：七位都沒有「謝謝你（自己）說／講」；語彤「蒜頭剝完了。」、芷若「……嗯。」、學姊「……口試前一週。」（2030 換「……你特地在樓下等我，就是要講這個。」、口試那兩句一起換掉）、沛珊「……所以你現在是兩邊都要？」（AA_483 第 2-3 節）、可昕「……我要想。」（AA_482 第 4 節）', Object.values(T).every(c=>!c.lines.some(x=>typeof x==='string'&&/謝謝你(自己)?(來)?(說|講)/.test(x))&&!/謝謝你自己/.test(c.first30||''))&&T.heroine_03.lines.includes('蒜頭剝完了。')&&T.heroine_02.lines[0]==='……嗯。'&&T.heroine_05.lines[0]==='……口試前一週。'&&T.heroine_05.first30==='……你特地在樓下等我，就是要講這個。'&&T.heroine_05.first30n===2&&T.classmate_peishan.lines[1]==='……所以你現在是兩邊都要？'&&T.kexin.lines.includes('……我要想。'), str(T.heroine_05)); }
    const T=S.TELL; check('U3 C 表：學姊沒有「一件事」、可昕沒有「假設」、可昕的火氣是旁白「（她把筷子放下。）」；學姊重新開始 3 週', !T.heroine_05.lines.some(x=>typeof x==='string'&&/一件事/.test(x))&&!T.kexin.lines.some(x=>typeof x==='string'&&/假設/.test(x))&&T.kexin.lines.some(x=>x&&x.narr==='（她把筷子放下。）')&&(()=>{ fresh('2029-05-29',21,'dorm'); date('heroine_05'); S.toFriend(H.G,'heroine_05'); return ROM.get(H.G,'heroine_05').restartDay===H.G.day+21; })()); }
  { fresh('2029-05-21',22,'dorm'); H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); H.picks=[1,0]; await H.run('r2y4b_multi_pre');
    const q=OUT.get(H.G,'apart29_heroine_04_0');   /* AA_346：選的當下不分開，隔天起一位一場分開的談話，談完才分開（細節在 tests/aa346_apart_unit.js）*/
    check('2-Y4-54「選一個人。」→ 選誰誰就是畢業時的伴侶；其他人照 AA_346 隔天起一位一場分開的談話（子晴 5/22 21:00 吉他社辦外面的樓梯），談話以前照舊交往中', H.G.flags.MULTI_PRE==='pick:heroine_01'&&H.G.flags.dating_heroine_01===true&&H.G.flags.dating_heroine_04===true&&!H.G.flags.EX_heroine_04&&!!q&&q.day===D('2029-05-22')&&q.h===21&&q.place==='吉他社辦外面的樓梯');
    at('2029-05-22',20.7); await goOut('apart29_heroine_04_0',[0]);
    check('2-Y4-54「選一個人。」談完：子晴分開（前任；ROMANCE_HISTORY how apart_choice）、選的那一位照舊交往', !H.G.flags.dating_heroine_04&&H.G.flags.EX_heroine_04===true&&H.G.flags.dating_heroine_01===true&&ROM.rec(H.G).some(h=>h.id==='heroine_04'&&h.how==='apart_choice')); }
  { fresh('2030-05-25',21,'dorm',GD); H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); at('2030-05-25',22);
    check('2-Y4-54 B 2030-05-25 22:00：還同時有兩位以上＝到期', dueHas('r2y4b_multi_y5'));
    H.said=[]; H.opts=[]; H.picks=[2]; await H.run('r2y4b_multi_y5');
    check('2-Y4-54 B「（畢業快一年了。手機裡，兩個對話框都停在「晚安」。）」；「（不選）」＝EPI_SEAT_EMPTY、不演被發現、兩段都還在', has('（畢業快一年了。手機裡，兩個對話框都停在「晚安」。）')&&JSON.stringify(H.opts[0])===JSON.stringify(['「選一個人。」','「跟她們說實話。」','（不選）'])&&H.G.flags.EPI_SEAT_EMPTY===true&&H.G.flags.dating_heroine_01&&H.G.flags.dating_heroine_04); }
  { const G=await epiRun({EPI_SEAT_EMPTY:true},()=>{ H.FRIEND('heroine_01'); H.FRIEND('heroine_04'); date('heroine_01'); date('heroine_04'); H.FAMILIAR('zhe'); });
    const seat='（你旁邊的位子一直空著。沒有人問。）';
    check('U2 不選：尾聲祐廷旁邊空著（「沒有人問。」接在 CG-10 之後）；CG-10 只有共通圖（沒有伴侶、也沒有阿凱的圖層）；她們照朋友版那一句；桌上沒有伴侶那一樣', has(seat)&&H.cgs.includes('cg_reunion_window_table')&&!H.cgs.some(c=>/_layer|_kai|_heroine/.test(c))&&has(POSTGRAD_LINES.EPI.an.friend)&&!has(POSTGRAD_LINES.EPI.an.partner[0])&&(G.flags.EPI_ITEMS||[]).length===1);
    await epiRun({},()=>{ H.FRIEND('heroine_01'); date('heroine_01'); });
    check('2-Y4-54 一般的玩家（沒有 EPI_SEAT_EMPTY）：照舊伴侶在旁邊、沒有空座位那一句', !has(seat)&&has(POSTGRAD_LINES.EPI.an.partner[0])&&H.cgs.includes('cg_reunion_window_table_heroine01')); }
  /* ===== 2-Y4-55 美國路線：何俊朗的訊息 ===== */
  { await epiRun({MET_LONG:true},null,'US');
    const a='（你把長桌的合照傳給一個人。過了一下，手機亮了。）', b='看到你們的合照了。下次來香港，我帶你去吃。', iE=iOf(POSTGRAD_LINES.EPI.end), iItem=iOf(POSTGRAD_LINES.EPI.itemNarr.replace('{item}',H.G.flags.EPI_ITEMS[0]));
    check('H1 美國路線、有 MET_LONG：尾聲最後畫面之前一則訊息（⑥ 桌上的東西之後、⑦ 之前）；說話的人是「何俊朗（手機）」', has(a)&&has(b)&&iItem>=0&&iOf(a)>iItem&&iOf(b)>iOf(a)&&iE>iOf(b)&&H.said[iOf(b)].who==='何俊朗（手機）');
    await epiRun({MET_LONG:true},null,'TW'); const tw=!has(a); await epiRun({},null,'US');
    check('H2 台灣路線（或沒有 MET_LONG）：沒有', tw&&!has(a)); }
  /* ===== 2-Y4-56 美國路線、和學姊交往中：秋假大峽谷 ===== */
  { fresh('2028-09-27',20,'dorm',{},'US'); H.FRIEND('heroine_05'); date('heroine_05'); at('2028-09-27',21); phone();
    const q=OUT.get(H.G,'y4_us_canyon');
    check('GC1 9/27 21:00 三則（十月有一個禮拜的秋假…／機票我看好了…／……你坐副駕，負責放音樂。）；兩個選項都會去：行事曆 10/7 06:00（一定會去）', JSON.stringify(th('p:heroine_05'))===JSON.stringify(['十月有一個禮拜的秋假。我想開車去大峽谷。','機票我看好了，飛到鳳凰城，在那邊租車。','……你坐副駕，負責放音樂。'])&&!!q&&q.day===D('2028-10-07')&&q.h===6&&q.must===true&&(answer('y4_us_canyon',1),th('p:heroine_05').includes('所以才要你放音樂。')));
    const r0=SOCIAL.rel('heroine_05'), rom0=r0.rom|0, nr0=r0.npcRom|0, c0=DATE.log(H.G,'heroine_05').count|0;
    at('2028-10-07',5.9); await goOut('y4_us_canyon',[0]);
    check('GC1 10/7「路線我排好了。上車。」；五個摘要日（10/10 是「她回頭把手伸給你」）；10/13「第四章，我本來想在這裡寫完。」；不是告白；10/14「里程表多了一千兩百哩」', has('（她靠在租來的車旁邊，手上拿著一張列印的地圖。）')&&has('路線我排好了。上車。')&&has('（沙漠裡的加油站，她買了兩瓶很大的水。）')&&has('（她在步道上走得比你快。走到一半，她回頭把手伸給你。）')&&has('（汽車旅館的電視只有三台。她轉到氣象台，看了很久。）')&&has('第四章，我本來想在這裡寫完。')&&has('嗯。今天不寫。')&&has('（車還回去的時候，里程表多了一千兩百哩。）')&&!H.said.some(s=>/我喜歡/.test(s.t)));
    const r1=SOCIAL.rel('heroine_05');
    check('2-Y4-56 US_CANYON；算 2 次正式約會；她和祐廷的戀愛各 +2；GC3 沒有說出口的條列', H.G.flags.US_CANYON===true&&(DATE.log(H.G,'heroine_05').count|0)===c0+2&&(r1.rom|0)===rom0+2&&(r1.npcRom|0)===nr0+2&&!H.said.some(s=>/^(一|二|三)，|三件事/.test(s.t))); }
  /* AA_516 第 1 節 1-11（企劃線 a9b87c588）：兩個摘要日 10/7、10/8 改 10/9、10/10（美國的秋假 10/9～10/13，us_life3d.js S.CAL.fall）；字不改 */
  { fresh('2028-10-07',8,'dorm',{MET_LONG:true},'US'); H.FRIEND('heroine_05'); H.G.flags.EX_heroine_05=true; at('2028-10-07',9.1); const old7=S.usFallDue(H.G); at('2028-10-08',9.1); const old8=S.usFallDue(H.G); at('2028-10-09',9.1);
    check('GC2 挽回中：秋假兩個摘要日（AA_516 1-11：10/9 起；10/7、10/8 沒有）', S.usFallDue(H.G)===1&&old7==null&&old8==null);
    H.said=[]; await S.usFall(GM,1); at('2028-10-10',9.1); await S.usFall(GM,S.usFallDue(H.G));
    check('GC2 「秋假。社區的停車場空了一半。」「何俊朗去了芝加哥找朋友。你把三門課的閱讀都讀完了。」（沒有 MET_LONG＝只有後半）；沒有邀約', has('秋假。社區的停車場空了一半。')&&has('何俊朗去了芝加哥找朋友。你把三門課的閱讀都讀完了。')&&!S.usFallDue(H.G)&&!th('p:heroine_05').length);
    fresh('2028-10-10',9.1,'dorm',{US_FALL_1:1},'US'); H.FRIEND('heroine_05'); H.G.flags.EX_heroine_05=true; H.said=[]; await S.usFall(GM,2);
    check('GC2 沒有 MET_LONG：「你把三門課的閱讀都讀完了。」', has('你把三門課的閱讀都讀完了。')&&!has('何俊朗去了芝加哥找朋友。你把三門課的閱讀都讀完了。')); }
  { fresh('2028-09-27',20,'dorm',{},'TW'); H.FRIEND('heroine_05'); date('heroine_05'); at('2028-09-27',21); phone();
    check('2-Y4-56 不是美國路線：沒有（台灣、日本路線見 2-Y4-57）', !OUT.get(H.G,'y4_us_canyon')&&!th('p:heroine_05').includes('機票我看好了，飛到鳳凰城，在那邊租車。')); }
  /* ===== 2-Y4-57 台灣、日本路線：學姊在美國——訊息、視訊、秋假大峽谷（告白）===== */
  { fresh('2028-08-03',6,'dorm',{},'TW'); H.FAMILIAR('heroine_05'); at('2028-08-03',7); phone(); const arr=th('p:heroine_05').slice();
    at('2028-08-07',9); phone();
    check('2-Y4-57 T1（第 4 階以下）：8/3 不另外傳「到了。」（AA_378 S1 更正 5cd35678：8/3 09:00 家族群組已經有 US0）；臺灣週一 09:00 第一則「我買了一罐太大的花生醬。」；SIS_ABROAD_TIER 1', JSON.stringify(arr)==='[]'&&JSON.stringify(th('p:heroine_05'))===JSON.stringify(['（照片：超市的花生醬貨架）','我買了一罐太大的花生醬。'])&&H.G.flags.SIS_ABROAD_TIER===1);
    at('2028-08-14',9); phone(); const n1=th('p:heroine_05').length; at('2028-08-21',9); phone();
    check('2-Y4-57 T1 兩週一則、照順序（第二則「這邊的圖書館整晚開著。……以後我十二點就走。」）', n1===2&&th('p:heroine_05').includes('這邊的圖書館整晚開著。……以後我十二點就走。')); }
  { fresh('2028-08-06',20,'dorm',{},'TW'); H.rel('heroine_05',60,45,40); at('2028-08-07',9); phone(); const m=PHONE.byAsk(H.G,'y4_sa_t2_0');
    check('2-Y4-57 T2（第 4～5 階）：兩週一則（AA_378 S1），會問你的事、要有回覆按鈕（「還好，不算太滿。」／「很滿。」）；她不再回', th('p:heroine_05').includes('論文的第三章寫完了，第四章在寫。這邊的指導教授回信很快，比我想的快。')&&th('p:heroine_05').includes('你大四上的課排得怎樣？')&&!!m&&m.ask.opts.map(o=>o.t).join('|')==='還好，不算太滿。|很滿。'&&(answer('y4_sa_t2_0',0),th('p:heroine_05').slice(-1)[0]==='還好，不算太滿。')); }
  { fresh('2028-08-05',20,'dorm',{},'TW'); H.rel('heroine_05',60,45,40); SOCIAL.rel('heroine_05').npcRom=35; at('2028-08-06',8); phone(); const q=OUT.get(H.G,'y4_sa_v_0');
    check('SA1 T3（第 5 階以上）：每週視訊（出遊「接起來」）；臺灣週日 10:00、「和學姊視訊（她那邊週六晚上）」（AA_378 S2）', !!q&&q.place==='視訊'&&q.verb==='接起來'&&H.G.flags.SIS_ABROAD_TIER===3&&q.day===D('2028-08-06')&&q.h===10&&q.title==='和學姊視訊（她那邊週六晚上）');
    const nr=SOCIAL.rel('heroine_05').npcRom|0; at('2028-08-06',10); await goOut('y4_sa_v_0');
    check('SA1 第一組：「（畫面裡她的背後是一面白牆，桌上一杯咖啡。）」「你那邊是早上吧。……我這邊剛寫完報告。」「好，我去睡了。你去吃早餐。」；她的戀愛 +1', has('（畫面裡她的背後是一面白牆，桌上一杯咖啡。）')&&has('你那邊是早上吧。……我這邊剛寫完報告。')&&has('好，我去睡了。你去吃早餐。')&&!has('好，我去睡了。你去上課。')&&(SOCIAL.rel('heroine_05').npcRom|0)===nr+1);
    at('2028-08-13',8); phone(); at('2028-08-13',10); await goOut('y4_sa_v_1'); const g2=has('（畫面裡是她的計畫本）這一格寫的是你的考試。……你考完要跟我說。'); at('2028-08-20',8); phone(); at('2028-08-20',10); await goOut('y4_sa_v_2');
    check('SA1 三組各一次：第二組計畫本、第三組「……我這邊剛下雨。」「好。下禮拜同一個時間。」', g2&&has('你那邊是早上吧。……我這邊剛下雨。')&&has('好。下禮拜同一個時間。'));
    at('2028-08-27',8); phone(); at('2028-08-27',10); await goOut('y4_sa_v_3');
    check('SA1 三組用完：第四次只有旁白「（視訊。她那邊是週六晚上。這個禮拜的事，你們講了半個小時。）」，不重播台詞（AA_378 S1 第 6 點）', has('（視訊。她那邊是週六晚上。這個禮拜的事，你們講了半個小時。）')&&!has('你那邊是早上吧。……我這邊剛寫完報告。')&&!has('（畫面裡是她的計畫本）這一格寫的是你的考試。……你考完要跟我說。')&&H.said.length===1); }
  const SAok=()=>{ H.rel('heroine_05',65,50,45); const r=SOCIAL.rel('heroine_05'); r.npcRom=60; r.rom=35; DATE.log(H.G,'heroine_05').count=2;
    const R=S.saRec(H.G); for(const k of [5,6]){ OUT.rec(H.G).push({id:'y4_sa_v_'+k,ev:'ev_sis_video',day:D('2028-09-10')+(k-5)*7,h:10,state:'done',sa:{k,set:k%3}}); R.log.push({k,kind:'video',tag:'y4_sa_v_'+k}); } R.tier=3; R.k=6; R.i3=2; };
  { fresh('2028-09-24',7,'dorm',{},'TW'); SAok(); at('2028-09-24',8); phone(); const q=OUT.get(H.G,'y4_sa_v_7'); at('2028-09-24',10);
    check('2-Y4-57 9/30 以前最後一次視訊（AA_378 S2 改週日以後＝9/24）、條件都到（第 6 階、出國前 2 次正式約會、回覆率 ≥ 0.5、正在 T3）＝她約', !!q&&S.sisInviteDue(H.G));
    await goOut('y4_sa_v_7',['我去']);
    check('SA2「十月有一個禮拜的秋假。我想開車去大峽谷。」「……一個人開太遠。你要不要來？」→「我去。」→「好。我去機場接你。」→ 行事曆 10/7（桃園機場，機票家裡出）', has('十月有一個禮拜的秋假。我想開車去大峽谷。')&&has('……一個人開太遠。你要不要來？')&&has('好。我去機場接你。')&&H.G.flags.SIS_CANYON_ASK==='go'&&!!OUT.get(H.G,'y4_sis_canyon')&&OUT.get(H.G,'y4_sis_canyon').day===D('2028-10-07'));
    at('2028-10-07',5.9); H.G.money=100; await goOut('y4_sis_canyon',[1]);
    check('SA2 10/7 到鳳凰城「路線我排好了。你坐副駕，負責放音樂。」；SA4 10/10「她停下來等你」不牽手；日落不說話 →「那我先說。」→ 交往、CALLED_SHUYU；10/14「十二月二十三號，晚上八點落地。你來接我。」；不扣錢', has('路線我排好了。你坐副駕，負責放音樂。')&&has('（她在步道上走得比你快。走到一半，她停下來等你。）')&&!has('（她在步道上走得比你快。走到一半，她回頭把手伸給你。）')&&has('那我先說。')&&has('我喜歡你。……我想了很久，要不要在這裡說。')&&has('你要說好，還是要我再說一次。')&&H.G.flags.dating_heroine_05===true&&H.G.flags.CALLED_SHUYU===true&&H.G.flags.SIS_CANYON==='confess'&&has('十二月二十三號，晚上八點落地。你來接我。')&&!paid.length);
    check('BG-DARK-70 鳳凰城的機場用 us_airport（不是黑底）', (()=>{ const e=R2Y4B_EVENTS.find(x=>x.id==='ev_sis_canyon'); const l=e.dialogue.find(x=>x.scene==='鳳凰城的機場'); return !!l&&l.bg==='us_airport'&&!!OUT.BG.us_airport; })());
    check('2-Y4-57 這一趟算 2 次正式約會、也算她的心願地點；回到臺北是 10/15 晚上', (DATE.log(H.G,'heroine_05').count|0)===4&&DATE.log(H.G,'heroine_05').wish===true&&H.G.day>=D('2028-10-15')); }
  { fresh('2028-10-07',6,'dorm',{SIS_CANYON_ASK:'go'},'TW'); SAok(); OUT.plan(H.G,{id:'y4_sis_canyon',ev:'ev_sis_canyon',day:D('2028-10-07'),h:7,place:'桃園機場',title:'t',travelH:1}); await goOut('y4_sis_canyon',[0]);
    check('2-Y4-57「學姊，我喜歡妳。」→「……我以為我要先說。」「好。」→ 交往', has('……我以為我要先說。')&&has('好。')&&H.G.flags.dating_heroine_05===true); }
  { fresh('2028-09-24',7,'dorm',{},'TW'); H.rel('heroine_05',60,45,40); SOCIAL.rel('heroine_05').npcRom=35; at('2028-09-24',8); phone(); at('2028-10-11',9.1); phone(); PHONE.tick(H.G);
    check('SA3 條件沒到：她那邊 10/10 晚上（臺灣 10/11 早上）「（照片：峽谷的邊緣…）」「秋假和同學來大峽谷。風很大。」「……你以後有機會，一定要來一次。」（兩個回覆）；SIS_CANYON photo', th('p:heroine_05').includes('（照片：峽谷的邊緣，四個交換生背對鏡頭站成一排）')&&th('p:heroine_05').includes('秋假和同學來大峽谷。風很大。')&&th('p:heroine_05').includes('……你以後有機會，一定要來一次。')&&H.G.flags.SIS_CANYON==='photo'&&(answer('y4_sa_canyon_photo',0),th('p:heroine_05').includes('嗯。照片拍不出來。'))); }
  { fresh('2028-08-06',20,'dorm',{},'TW'); H.FRIEND('heroine_05'); H.G.flags.EX_heroine_05=true; at('2028-08-07',9); phone(); const ex=!th('p:heroine_05').length;
    fresh('2028-08-06',20,'dorm',{},'TW'); H.rel('heroine_05',2,0,0); at('2028-08-07',9); phone(); const low=!th('p:heroine_05').length;
    fresh('2028-08-06',20,'dorm',{},'US'); H.FAMILIAR('heroine_05'); at('2028-08-07',9); phone();
    check('2-Y4-57 前任、不到 ACQUAINTANCE：沒有訊息池；SA5 美國路線：沒有這一件', ex&&low&&!th('p:heroine_05').some(t=>t==='到了。')); }
  /* ===== 2-Y4-58 律師讀書小組 ===== */
  { fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'},'TW'); date('kexin'); H.FRIEND('heroine_03'); ROM.learn(H.G,'heroine_03','kexin','test'); at('2029-02-23',8); phone();
    const q=OUT.get(H.G,'y4_bar_group_start');
    check('BG1 台灣路線、選國考、和可昕交往、和語彤 FRIEND、兩人都知道：2/23 21:30 三個人（麵店打烊以後）；BAR_STUDY_GROUP [kexin, yutong]', H.G.flags.BAR_GROUP_KIND==='three'&&JSON.stringify(H.G.flags.BAR_STUDY_GROUP)==='["kexin","yutong"]'&&!!q&&q.h===21.5&&/麵店/.test(q.place));
    at('2029-02-23',21.2); await goOut('y4_bar_group_start');
    check('BG1 成立：長桌上可昕寫的表；「每週一、三、五晚上，週六整天。……有意見現在說。」；語彤「週二我在店裡。…」；「……好。那表上多一格。」', has('（開學第一個週五晚上，麵店打烊以後。長桌上多了一張手寫的表，可昕寫的。）')&&has('每週一、三、五晚上，週六整天。……有意見現在說。')&&has('週二我在店裡。你們在這裡讀，我順便考你們。')&&has('……好。那表上多一格。'));
    at('2029-02-26',21.5); H.G.zone='noodle'; const due=EVENTS.check(ev('ev_bar_group_night')); await run('ev_bar_group_night');
    check('2-Y4-58 作息：週一 21:00～23:00 走到麵店就是讀書，一晚一句（可昕「刑總那題，你先講結論，再講理由。講完我再問。」）；BAR_GROUP_N', due&&H.said.length===1&&has('刑總那題，你先講結論，再講理由。講完我再問。')&&H.G.flags.BAR_GROUP_N===1&&!EVENTS.check(ev('ev_bar_group_night')));
    at('2029-02-27',21.5); const tue=!EVENTS.check(ev('ev_bar_group_night')); at('2029-02-28',21.5); const hol=!EVENTS.check(ev('ev_bar_group_night')); at('2029-03-02',21.5); await run('ev_bar_group_night');
    const TX=['ev_bar_group_night','ev_bar_group_video','ev_bar_group_start'].flatMap(id=>ev(id).dialogue.filter(l=>l.text).map(l=>l.text));
    check('2-Y4-58 週二不排（週四是國考讀書會）、國定假日不排（2/28）；下一次（週五）輪到語彤「押租金那個，你講給我聽。不要講條號。」；BG3 沒有條號、沒有假設題、沒有比誰對', tue&&hol&&has('押租金那個，你講給我聽。不要講條號。')&&H.G.flags.BAR_GROUP_N===2&&!TX.some(t=>/第\s*[0-9一二三四五六七八九十百]+\s*條|假設|你覺得我會錯/.test(t)));
    at('2029-06-21',12); phone(); const q3=OUT.get(H.G,'y4_bar_three'); at('2029-06-23',18.8); await goOut('y4_bar_three');
    check('BG1 6/23 19:00 三個人的長桌：「（長桌上攤著三疊考古題。語彤在收碗，可昕在算時間。）」「還有四十二天。」「先吃，麵要糊了。」', !!q3&&q3.h===19&&has('（長桌上攤著三疊考古題。語彤在收碗，可昕在算時間。）')&&has('還有四十二天。')&&has('先吃，麵要糊了。')); }
  { fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'},'TW'); H.FRIEND('heroine_03'); at('2029-02-23',8); phone(); at('2029-02-23',21.2); await goOut('y4_bar_group_start');
    check('BG2 只有語彤：「我今年不考。……可是你考的那幾科，我也要修。」「所以你讀的時候，我也在旁邊讀我的。」', H.G.flags.BAR_GROUP_KIND==='yutong'&&has('我今年不考。……可是你考的那幾科，我也要修。')&&has('所以你讀的時候，我也在旁邊讀我的。'));
    at('2029-02-26',21.5); H.G.zone='noodle'; await run('ev_bar_group_night');
    check('2-Y4-58 只有語彤的第一次：「（十點，麵店拉下一半的鐵門。…）」「我今年不考。……可是我可以考你。」「買賣不破租賃那一條。你講給我聽，講到我聽得懂。」', has('（十點，麵店拉下一半的鐵門。語彤把兩碗麵推到長桌另一頭，她自己那一份不在桌上。）')&&has('我今年不考。……可是我可以考你。')&&has('買賣不破租賃那一條。你講給我聽，講到我聽得懂。'));
    at('2029-03-03',11); H.G.zone='library_hall'; check('2-Y4-58 只有語彤：週六在總圖', EVENTS.check(ev('ev_bar_group_night'))&&S.session(H.G,H.G.day).mode==='library');
    at('2029-06-23',18); phone(); check('2-Y4-58 只有一個人的玩家：沒有 6/23 那一場', !OUT.get(H.G,'y4_bar_three')); }
  { fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar',KX_VDAY:{4:'video'}},'TW'); date('kexin'); at('2029-02-23',8); phone(); const q=OUT.get(H.G,'y4_bar_group_start'); at('2029-02-23',21.4); await goOut('y4_bar_group_start');
    check('2-Y4-58 只有可昕：21:30 視訊「情人節那張表，我把八月以前都排完了。」「你那一欄不喜歡的地方圈起來，我改。」', !!q&&q.place==='視訊'&&has('情人節那張表，我把八月以前都排完了。')&&has('你那一欄不喜歡的地方圈起來，我改。'));
    phone(); const v=OUT.rec(H.G).find(x=>/^y4_bar_vid_/.test(x.id)&&x.state==='planned');
    check('2-Y4-58 只有可昕：之後的讀書是視訊（週一、三、五），一次只排下一場；週六在政大', !!v&&v.day===D('2029-02-26')&&v.place==='視訊'&&S.session(H.G,D('2029-03-03')).mode==='nccu');
    fresh('2029-02-23',21.4,'dorm',{Y4_PATH:'bar',BAR_GROUP_KIND:'kexin',BAR_STUDY_GROUP:['kexin'],BAR_GROUP_START:'kexin'},'TW'); date('kexin'); OUT.plan(H.G,{id:'y4_bar_group_start',ev:'ev_bar_group_start',day:D('2029-02-23'),h:21.5,place:'視訊',title:'t',travelH:0}); await goOut('y4_bar_group_start');
    check('2-Y4-58 沒有 2/14 那張表：第一句換成「我排了一張表，到八月，一天三科。」', has('我排了一張表，到八月，一天三科。')&&!has('情人節那張表，我把八月以前都排完了。')); }
  /* AA_345 G6 58：兩個人互不知情、分開讀：成立那晚走可昕的視訊；語彤「只有語彤的第一次」放在她的第一個週五晚上 3/2 21:00，週六白天（總圖）不演 */
  { const FIRST='（十點，麵店拉下一半的鐵門。語彤把兩碗麵推到長桌另一頭，她自己那一份不在桌上。）';
    fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'},'TW'); date('kexin'); H.FRIEND('heroine_03'); at('2029-02-23',8); phone(); const q=OUT.get(H.G,'y4_bar_group_start');
    check('G6-58 分開讀（兩人互不知情）：成立那晚是可昕的視訊', H.G.flags.BAR_GROUP_KIND==='split'&&!!q&&q.place==='視訊');
    at('2029-03-02',21.5); H.G.zone='noodle'; const due=EVENTS.check(ev('ev_bar_group_night')); await run('ev_bar_group_night');
    check('G6-58 3/2（五）21:00 麵店：語彤「只有語彤的第一次」那三句', due&&H.said[0]&&H.said[0].t===FIRST&&has('我今年不考。……可是我可以考你。')&&has('買賣不破租賃那一條。你講給我聽，講到我聽得懂。')&&H.G.flags.BAR_GROUP_YT_FIRST===D('2029-03-02'), JSON.stringify(H.said.map(s=>s.t)));
    fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'},'TW'); date('kexin'); H.FRIEND('heroine_03'); at('2029-02-23',8); phone();
    at('2029-03-03',11); H.G.zone='library_hall'; const due2=EVENTS.check(ev('ev_bar_group_night')); await run('ev_bar_group_night');
    check('G6-58 3/2 沒去、3/3（六）白天在總圖：不演「第一次」那一段（換一般的那一句），第一次留著', due2&&!has(FIRST)&&!has('我今年不考。……可是我可以考你。')&&has('押租金那個，你講給我聽。不要講條號。')&&!H.G.flags.BAR_GROUP_YT_FIRST, JSON.stringify(H.said.map(s=>s.t)));
    fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'},'TW'); H.FRIEND('heroine_03'); at('2029-02-23',8); phone(); at('2029-03-03',11); H.G.zone='library_hall'; await run('ev_bar_group_night');
    check('G6-58／AA_350 N1 只有語彤、第一次去就是週六白天的總圖：演白天版（第一句旁白換成「（星期六下午，總圖的長桌。……）」，後兩句一樣），記 BAR_GROUP_YT_FIRST', H.G.flags.BAR_GROUP_KIND==='yutong'&&!has(FIRST)&&has('（星期六下午，總圖的長桌。語彤把自己的書收進包包，桌上只剩你的。）')&&has('我今年不考。……可是我可以考你。')&&has('買賣不破租賃那一條。你講給我聽，講到我聽得懂。')&&!!H.G.flags.BAR_GROUP_YT_FIRST, JSON.stringify(H.said.map(s=>s.t))); }
  { fresh('2029-02-22',23,'dorm',{Y4_PATH:'bar'},'JP'); date('kexin'); H.FRIEND('heroine_03'); at('2029-02-23',8); phone();
    check('2-Y4-58 日本、美國路線：2029 不考，沒有這一件', !OUT.get(H.G,'y4_bar_group_start')&&!H.G.flags.BAR_STUDY_GROUP); }
  /* ===== 2-Y4-59 可昕 K27 ===== */
  { fresh('2030-10-01',20,'dorm',Object.assign({KX_SHELF:true},GD)); date('kexin'); at('2030-10-01',21.5); pg();
    check('SH1 K25 去了、到 2030 還在交往：2030-10-01 21:30「（照片：政大讀書會的書架，最右邊那一格放了一本筆記）」「讀書會書架最右邊那一格，我放了第一次開庭的筆記。」（不用回）', JSON.stringify(th('p:kexin').slice(-2))===JSON.stringify(['（照片：政大讀書會的書架，最右邊那一格放了一本筆記）','讀書會書架最右邊那一格，我放了第一次開庭的筆記。'])&&!(H.G.msgs||[]).some(m=>m.th==='p:kexin'&&m.ask));
    fresh('2030-10-01',20,'dorm',GD); date('kexin'); at('2030-10-01',21.5); pg(); const noShelf=!th('p:kexin').length; fresh('2030-10-01',20,'dorm',Object.assign({KX_SHELF:true},GD)); at('2030-10-01',21.5); pg();
    check('2-Y4-59 沒有 KX_SHELF、或沒有在交往：沒有；尾聲她仍然只有一句（K27 不放尾聲）', noShelf&&!th('p:kexin').length&&!JSON.stringify(POSTGRAD_LINES.EPI.kx||{}).includes('第一次開庭的筆記')); }
  /* ===== 2-Y4-60 學姊：律師錄取那天的一句（AA_319 那一批的 postgrad 已接）===== */
  { fresh('2029-12-14',15,'dorm',Object.assign({},GD,LAWYER29)); H.FRIEND('heroine_05'); at('2029-12-14',15.4); pg();
    check('SR1 2029 律師錄取、學姊 FRIEND：15:20「恭喜。」「……那張讀書計畫，可以收起來了。」', JSON.stringify(th('p:heroine_05').slice(-2))===JSON.stringify(['恭喜。','……那張讀書計畫，可以收起來了。']));
    fresh('2030-12-13',15,'dorm',Object.assign({},GD,RT,{BAR_YEAR:2030})); H.FRIEND('heroine_05'); at('2030-12-13',15.4); pg();
    check('2-Y4-60 第二年才上（2-Y4-51）：「恭喜。」「……這次可以停一下了。」', JSON.stringify(th('p:heroine_05').slice(-2))===JSON.stringify(['恭喜。','……這次可以停一下了。'])); }
  /* ===== 2-Y4-61 沛珊：大四下的學期末（台南）===== */
  { fresh('2029-06-08',14,'dorm',GD); H.FRIEND('classmate_peishan'); heartOk('classmate_peishan'); delete TERMEND.rec(H.G).think.classmate_peishan; contact('classmate_peishan'); at('2029-06-08',15); phone();
    check('2-Y4-61 放榜後還沒重新聯絡上（沒交往）：不約（AA_282 第 2 節：她不先找人；PS-TAINAN-AA282）', !th('p:classmate_peishan').some(t=>/^期末考完了！/.test(t)));
    fresh('2029-06-08',14,'dorm',Object.assign({},GD,{PS_BACK_FIRST:D('2027-08-12')})); H.FRIEND('classmate_peishan'); heartOk('classmate_peishan'); delete TERMEND.rec(H.G).think.classmate_peishan; contact('classmate_peishan'); at('2029-06-08',15); phone();   /* 放榜後重新聯絡上的（AA_282 第 2 節）*/
    const inv=TERMEND.heart('classmate_peishan','Y4S2').invite;
    check('2-Y4-61 6/8（五）15:00 她傳 AA_254 第 6 節一般版的邀約（「期末考完了！……」）', th('p:classmate_peishan').includes(typeof inv==='function'?inv(H.G):inv)&&/^期末考完了！/.test(th('p:classmate_peishan').slice(-1)[0]));
    answer('y4_ps_te',0); phone(); const q=OUT.get(H.G,'y4_ps_te');
    check('2-Y4-61「好。」→ 18:30 台南・她學校附近的簡餐（高鐵、末班車回臺北）；不排 6/9（可昕的畢業典禮）', !!q&&q.day===D('2029-06-08')&&q.h===18.5&&/台南/.test(q.place)&&/最後一班高鐵/.test(q.back));
    at('2029-06-08',16.4); await goOut('y4_ps_te',[3,1]);
    check('PS1 台南的期末飯（地點字幕台南）→ 走回她租的地方 → 先不說 → 她說 →「讓我想想。」＝7/14 的那一位；票錢照扣', caps.includes('台南・她學校附近的簡餐')&&caps.includes('台南・往她租的地方')&&has(TERMEND.heart('classmate_peishan','Y4S2').she[0])&&TERMEND.rec(H.G).think.classmate_peishan==='Y4S2'&&S.julyWho(H.G)==='classmate_peishan'&&paid.some(p=>p[0]<0)&&!caps.some(c=>/系館附近|舊路書房|新生南路/.test(c||''))); }
  { fresh('2029-06-08',14,'dorm',GD); H.FRIEND('classmate_peishan'); date('classmate_peishan'); date('kexin'); at('2029-06-08',15); phone(); const gfInv=TERMEND.gf('classmate_peishan','Y4S2').invite;
    check('PS2 同時和沛珊、可昕交往：6/8 是沛珊（女朋友的約會：「期末考完了！今天吃飯，我想吃熱的。」）、6/9 是可昕的典禮，不撞', th('p:classmate_peishan').includes(gfInv)&&(answer('y4_ps_te',0),phone(),OUT.get(H.G,'y4_ps_te').day===D('2029-06-08'))&&POSTGRAD_LINES.KX&&PG.MSGS.some(m=>m.tag&&/kx/.test(m.tag)));
    at('2029-06-08',16.4); await goOut('y4_ps_te');
    check('PS2 女朋友的約會：飯桌一句（「這學期有幾次我想打給你，後來沒打。怕你在讀書。」），沒有回家路上的告白', has('這學期有幾次我想打給你，後來沒打。怕你在讀書。')&&H.G.flags.PS_TE_Y4S2&&H.G.flags.PS_TE_Y4S2.kind==='gf'&&!caps.includes('台南・往她租的地方')); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
