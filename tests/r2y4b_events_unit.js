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
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
