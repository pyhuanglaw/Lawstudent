// AA_118 第 5 節 L1～L3「有建築、沒有事件的地方」＋ AA_555 第 3 節改稿（任務 AA555-L123-SCENES-1101；src/campus_l123_3d.js）——不需要瀏覽器。
// D118（AA_578 第 3 節第 1 點，tools/story/d118_fix.json）：法律系第 8～9 週的考試不提——期望值跟著刪「期中」「考」
// 台詞逐字照稿：從企劃線 56c11668d git show 讀 AA_118、AA_555（tests/alison.js 讀稿時把舊名字換成 Alison），事件裡的每一句都要在稿裡（補的幾句另外列）。
//   0 接線：載得到、六個事件在 STORY_EVENTS、PHONE_RULES 掛上、index.html 接在 aa187_3d.js 後面、bbpack_events.js 以前（bbpack3d.js 到 GAME.boot 之間別的測試鎖住了，不能插隊）；這個檔沒有舊名字、沒有真實館名
//   1 L1 法律系館A的電梯：12:10～12:30、法律系館A一樓（第 0 層）、平日、不是假日、不是開場那兩天、經濟系不演；每學期最多兩次、至少隔 14 天、下一學期重算；宥辰的電梯那天讓它；
//     等電梯＝旁白＋阿哲那一段（認識阿哲才有）＋電梯專用三句（AA-B 11-01；每學年最多一句、照順序、用完＝保守旁白）；走樓梯＝柏翰，大三以後＋翰 4 之後換句；tick 真的挑到它
//   2 L2 校史館門口：大一上第 4 週週三 15:00～15:30 在校園；其他週、其他時間、不在校園、大四都不演；一次；不替兩個人記認識
//   3 L3 圓窗館前的合照：四個學年各一個版本（第 3 週週五）；12:00 系學會在班群約＋排進行程（出發帶到圓窗館前）；不在班群＝Alison 私訊；
//     16:00 前後在圓窗館前＝演；不在附近不演；演了行程收掉、18:00 沒有照片；沒去＝18:00 班群的照片（晚三天內補）；人在國外不排出發；經濟系不演
// 修改前（開發分支 220f617ba）：沒有 src/campus_l123_3d.js——第 0 項 FAIL，其餘不跑。用法：node tests/campus_l123_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
GM.toast=()=>{}; GM.caption=()=>{};
const loadErr=[];
const L3F=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return; } try{ const src=fs.readFileSync(p,'utf8').replace(/^const (AA555|CL123)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e); } };
for(const f of ['src/aa555_3d.js','src/campus_l123_3d.js']) L3F(f);
const SHA='56c11668d';
const show=p=>{ try{ return cp.execSync('git -c core.quotepath=false show "'+SHA+':'+p+'"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore'],maxBuffer:64*1024*1024}); }catch(e){ return ''; } };
const D118=show('docs/story_planning/AA_118_AA角色的日常_思考方式與同行聊天.md'), D555=show('docs/story_planning/AA_555_AA118同行聊天與手機小事_照現行設定改稿.md');
const SEC5=(()=>{ const a=D118.indexOf('### L1'), b=D118.indexOf('## 4.',a); return a>=0?D118.slice(a,b>a?b:undefined):''; })();
const SEC3=(()=>{ const a=D118.indexOf('## 3. 手機小事池'), b=D118.indexOf('## 5.',a); return a>=0?D118.slice(a,b>a?b:undefined):''; })();
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const said=()=>H.said.map(s=>s.t), who=()=>H.said.map(s=>s.who);
const ok=typeof CL123!=='undefined'&&!!CL123.EV_L1;
check('0. src/campus_l123_3d.js 載得到；六個事件在 STORY_EVENTS（ev_l1_elevator、ev_l2_hist_door、ev_l3_photo_1～4）；PHONE_RULES 掛上',ok&&!loadErr.length&&['ev_l1_elevator','ev_l2_hist_door','ev_l3_photo_1','ev_l3_photo_2','ev_l3_photo_3','ev_l3_photo_4'].every(id=>STORY_EVENTS.some(e=>e.id===id))&&!!STORY._cl123pr,J(loadErr));
if(!ok){ H.done(); }
const NG={LAW_START_DAY:D('2025-08-31'),MAIN_D1:D('2025-09-03')};   /* 新局（開學 9/1、主線第一天 9/3）*/
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({},NG,flags||{})); E.player.lv=0; E.player.obj.position.x=0; E.player.obj.position.z=0; return G; };
const runLines=async(ev,picks)=>{ H.said=[]; H.picks=[].concat(picks||[]); await EVENTS.runLines(ev.dialogue,ev); return said(); };
const ticked=()=>{ let got=null; const r0=EVENTS.run; EVENTS.run=async ev=>{ got=ev.id; }; try{ EVENTS.tick(0.5); } finally { EVENTS.run=r0; } return got; };   /* EVENTS.tick 真的挑到哪一個 auto 事件（不演）*/
(async()=>{
  /* ---------------- 0 接線、稿 ---------------- */
  { const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), sc=[...html.matchAll(/<script src="([^"?]+)/g)].map(m=>m[1]), i=sc.indexOf('src/campus_l123_3d.js');
    check('0. index.html：campus_l123_3d.js 在 aa187_3d.js 之後（合併 aa554_3d.js 以後中間隔一行）、緊接在 data/bbpack_events.js 前面（aa555_3d.js、story3d.js、outings3d.js、phone3d.js 都在它前面；GAME.boot() 以前）',
      i>0&&sc.indexOf('src/aa187_3d.js')>=0&&sc.indexOf('src/aa187_3d.js')<i&&sc[i+1]==='src/data/bbpack_events.js'&&['src/aa555_3d.js','src/story3d.js','src/outings3d.js','src/phone3d.js','src/events3d.js'].every(f=>sc.indexOf(f)>=0&&sc.indexOf(f)<i)&&html.indexOf('src/campus_l123_3d.js')<html.indexOf('GAME.boot()')&&/src\/campus_l123_3d\.js\?v=/.test(html),J(sc.slice(i-2,i+2)));
    const src=fs.readFileSync(path.join(H.ROOT,'src/campus_l123_3d.js'),'utf8');
    check('0. 這個檔沒有舊名字（Alison 改名，AA_380）、沒有真實校名館名（D115）',src.indexOf('小語')<0&&!/[臺台]灣大學|霖澤|萬才|洞洞館|傅鐘|椰林|醉月湖|小福|活大/.test(src));
    check('0. 讀得到稿（企劃線 '+SHA+'：AA_118 第 3、5 節、AA_555 第 3 節）',SEC5.length>300&&SEC3.length>1000&&/L1 法律系館A的電梯：照用/.test(D555)&&/L3 圓窗館前的合照/.test(D555),J([SEC5.length,SEC3.length,D555.length]));
    check('0. AA_555：L2 大一那段換 Alison、大四那段作廢；L3「全部換 Alison」（讀稿已換字）',/L2 校史館門口：大一那段「Alison 站在門口」換 Alison；大四承恩那段〔承〕已作廢/.test(D555)&&/Alison 站在門口：「欸，老照片上的椰子樹好矮。」/.test(SEC5));
    /* 每一句（旁白、台詞）都在稿的第 5 節：旁白去掉括號；單獨演的那一年句首的「她」換成 Alison、句尾的「：」換成「。」（稿的散文接下一句引號）*/
    const inSec=t=>{ const s=t.replace(/^（/,'').replace(/）$/,''); const sh=s.replace(/ ?Alison /,'她'), v=[s,sh,s.replace(/。$/,'：'),sh.replace(/。$/,'：')]; return v.some(x=>SEC5.includes(x)); };
    const texts=[]; for(const e of CL123.EVENTS) for(const l of e.dialogue) if(typeof l.text==='string') texts.push(l.text);
    const miss=texts.filter(t=>!inSec(t));
    check('0. 事件裡的每一句旁白、台詞都在 AA_118 第 5 節（'+texts.length+' 句，逐字；補的只有選項、八卦旁白、約的那一句、照片說明）',texts.length>=16&&!miss.length,J(miss));
    check('0. 補的字（要問 AA）只在這幾處：選項（等電梯）（走樓梯）、八卦旁白兩句、約的那一句、照片說明',J(CL123.EV_L1.dialogue.find(l=>l.choice).choice.map(c=>c.text))===J(['（等電梯）','（走樓梯）'])&&!SEC5.includes(CL123.GOSSIP_PRE.slice(1,-1))&&typeof CL123.INV==='string'&&CL123.PHOTO==='📷（圓窗館前的系學會合照）'); }

  /* ---------------- 1 L1 ---------------- */
  const L1=CL123.EV_L1, c1=()=>EVENTS.check(L1);
  { let G=fresh('2025-09-02',12+10/60,'linze'); const a=c1(); G.hour=12+5/60; const b=c1(); G.hour=12.5; const c=c1(); G.hour=12+29/60; const d=c1();
    check('1. 時間：大一上第 1 週週二 12:10 在法律系館A一樓＝演；12:05、12:30 不演；12:29 還演',a&&!b&&!c&&d,J([a,b,c,d]));
    G.hour=12.2; E.player.lv=1; const e=c1(); E.player.lv=0; G.zone='campus'; const f=c1(); G.zone='linze_3f'; const g=c1(); G.zone='linze';
    check('1. 地點：二樓迴廊（第 1 層）、校園、3F 都不演',!e&&!f&&!g,J([e,f,g]));
    G=fresh('2025-09-06',12.2,'linze'); const sat=c1(); G=fresh('2025-10-10',12.2,'linze'); const hol=c1(); G=fresh('2025-09-02',12.2,'linze'); G.stage='econ'; const econ=c1();
    check('1. 週六、假日（10/10 '+CALENDAR.holiday(D('2025-10-10'))+'）不演；經濟系那一年（stage econ）不演',!sat&&!hol&&!econ&&!!CALENDAR.holiday(D('2025-10-10')),J([sat,hol,econ]));
    G=fresh('2025-09-03',12.2,'linze'); const op1=c1(); G=fresh('2025-09-04',12.2,'linze'); const op2=c1(); G=fresh('2025-09-05',12.2,'linze'); const op3=c1();
    check('1. 開場那兩天（主線第 1、2 天）不演，第 3 天起演',!op1&&!op2&&op3,J([op1,op2,op3]));
    G=fresh('2025-09-02',12.2,'linze'); check('1. tick 真的挑到它（同一時間沒有別的 auto 事件先演）',ticked()==='ev_l1_elevator',String(ticked())); }
  { /* 次數與間隔 */
    let G=fresh('2025-09-02',12.2,'linze'); H.picks=[1]; await EVENTS.run(L1); const n1=CL123.l1Count(G);
    const at=(k)=>{ G.day=D(k); G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=12.2; return c1(); };
    const a=at('2025-09-15'), b=at('2025-09-16'); H.picks=[1]; await EVENTS.run(L1); const n2=CL123.l1Count(G); const c=at('2025-10-07'), d=at('2025-12-16');
    const t2=CALENDAR.termDays('Y1S2').from; G.day=t2+1; G.weekday=CALENDAR.dateOf(G.day).wd%7; G.hour=12.2; const e=c1();
    check('1. 每學期最多兩次、至少隔 14 天：演過一次（9/2）→ 13 天後不演、14 天後演；兩次以後同一學期不再演；大一下第一個上課日重算',n1===1&&!a&&b&&n2===2&&!c&&!d&&e&&J(G.flags.L1_ELEV.n)===J({Y1S1:2}),J([n1,a,b,n2,c,d,e,G.flags.L1_ELEV]));
    G=fresh('2027-03-02',12.2,'linze'); check('1. 大二下也演（每一學期）',c1());
    G=fresh('2025-09-02',12.2,'linze'); global.SUP497={elevDoneDue:()=>true}; const y1=c1(); delete global.SUP497; const y2=c1(); G.events.last.ev_yc_elev_done=G.day; const y3=c1();
    check('1. 宥辰的電梯（SUP497 ev_yc_elev_done 該演、或今天演過）那天讓它',!y1&&y2&&!y3,J([y1,y2,y3])); }
  { /* 等電梯（AA-B 11-01 回第 1 題：電梯專用三句，每一學年最多一句，照順序；用完＝保守旁白）*/
    const HEAD=['（中午下課，電梯門口擠滿人。）','（電梯來了，進去八個人，門關不上，「嗶——」。）'], ZHE=['（阿哲永遠是最後擠進去的那一個。）','我很瘦。','「嗶——」','……好，我走樓梯。'], G3=CL123.GOSSIP;
    check('1. 電梯專用三句（AA-B 11-01）',J(G3)===J(['「……對，我在電梯裡。收訊不好，我等一下打給你。」','「她說考申論，可是上次她也說考申論，結果全部選擇。」','「我早上沒吃，現在已經十二點了。這樣算早餐還是午餐？」']),J(G3));
    let G=fresh('2025-09-08',12.2,'linze',{MET_ZHE:true}); let L=await runLines(L1,[0]);
    check('1. 等電梯（認識阿哲、大一第一次）：旁白 → 阿哲「我很瘦。」「嗶——」「……好，我走樓梯。」→「（電梯裡，後面有人在講手機。）」第一句；選項（等電梯）（走樓梯）',
      J(L)===J(HEAD.concat(ZHE,[CL123.GOSSIP_PRE,G3[0]]))&&J(H.opts[0])===J(['（等電梯）','（走樓梯）']),J([L,H.opts[0]]));
    L=await runLines(L1,[0]); check('1. 同一學年第二次：保守旁白「（電梯裡很擠，大家都在滑手機。）」',L[L.length-1]===CL123.GOSSIP_NONE,J(L.slice(-2)));
    const R=G.flags.L1_ELEV; const yr=async k=>{ G.day=STORY.dayOfKey(k); G.weekday=CALENDAR.dateOf(G.day).wd%7; const x=await runLines(L1,[0]); return x.slice(-1)[0]; };
    const y2=await yr('2026-10-06'), y3=await yr('2027-10-05'), y4=await yr('2028-10-03');
    check('1. 大二第二句、大三第三句、大四三句用完＝保守旁白',y2===G3[1]&&y3===G3[2]&&y4===CL123.GOSSIP_NONE&&(R.g|0)===3,J([y2,y3,y4,R]));
    G=fresh('2025-09-02',12.2,'linze'); const kz=STORY.knows('zhe',G); L=await runLines(L1,[0]);
    check('1. 新局還不認識阿哲（9/4 他才自我介紹）：沒有阿哲那一段',!kz&&J(L)===J(HEAD.concat([CL123.GOSSIP_PRE,G3[0]])),J([kz,L])); }
  { /* 走樓梯 */
    let G=fresh('2025-09-08',12.2,'linze'); let L=await runLines(L1,[1]);
    check('1. 走樓梯：柏翰「走樓梯比電梯快四十秒。我算過。」',J(L)===J(['（中午下課，電梯門口擠滿人。）','走樓梯比電梯快四十秒。我算過。'])&&who()[1]==='許柏翰',J([L,who()]));
    G=fresh('2027-09-14',12.2,'linze',{BH4_DONE:true}); const a=(await runLines(L1,[1]))[1];
    G=fresh('2027-09-14',12.2,'linze'); const b=(await runLines(L1,[1]))[1];
    G=fresh('2027-03-09',12.2,'linze',{BH4_DONE:true}); const c=(await runLines(L1,[1]))[1];
    G=fresh('2028-09-12',12.2,'linze'); G.events.done.ev_bohan_third_floor=1; const d=(await runLines(L1,[1]))[1];
    check('1. 大三以後、翰 4 之後（BH4_DONE 或 ev_bohan_third_floor）：「走樓梯比電梯快四十秒。可是今天我想等。」；大三沒有翰 4、大二有翰 4 照原句',
      a==='走樓梯比電梯快四十秒。可是今天我想等。'&&b==='走樓梯比電梯快四十秒。我算過。'&&c==='走樓梯比電梯快四十秒。我算過。'&&d==='走樓梯比電梯快四十秒。可是今天我想等。',J([a,b,c,d]));
    { const G2=fresh('2025-09-08',12.2,'linze',{MET_ZHE:true}); const f0=Object.keys(G2.flags), m0=J(G2.social); await runLines(L1,[0]); const f1=Object.keys(G2.flags).filter(k=>!f0.includes(k));
      check('1. L1 沒有旗標、沒有後果：演完 G.flags 只多了 L1_ELEV（次數紀錄），關係、記憶沒動',J(f1)===J(['L1_ELEV'])&&J(G2.social)===m0,J(f1)); } }

  /* ---------------- 2 L2 ---------------- */
  const L2=CL123.EV_L2, c2=()=>EVENTS.check(L2);
  { let G=fresh('2025-09-24',15,'campus'); const a=c2(); G.hour=14+59/60; const b=c2(); G.hour=15.5; const c=c2(); G.hour=15.2; G.zone='linze'; const d=c2(); G.zone='classroom'; const e=c2(); G.zone='campus';
    check('2. 大一上第 4 週週三（9/24）15:00 在校園＝演；14:59、15:30、在法律系館A、在教室（上課）都不演',CALENDAR.termOf(G.day).week===4&&G.weekday===3&&a&&!b&&!c&&!d&&!e,J([a,b,c,d,e]));
    check('2. tick 真的挑到它',ticked()==='ev_l2_hist_door',String(ticked()));
    G=fresh('2025-09-17',15.2,'campus'); const w3=c2(); G=fresh('2025-10-01',15.2,'campus'); const w5=c2(); G=fresh('2028-09-06',15.2,'campus'); const y4=c2(); G=fresh('2025-09-24',15.2,'campus'); G.stage='econ'; const ec=c2();
    check('2. 第 3 週、第 5 週不演；大四上第 1 週不演（大四那段作廢）；經濟系不演',!w3&&!w5&&!y4&&!ec,J([w3,w5,y4,ec]));
    G=fresh('2025-09-24',15.2,'campus'); const metYu0=SOCIAL.has('yu','FIRST_MET'), metZhe0=SOCIAL.has('zhe','FIRST_MET'); H.said=[]; H.picks=[]; await EVENTS.run(L2); const L=said();
    check('2. 台詞：旁白「（系上的新生導覽走到校史館。看完出來，Alison 站在門口。）」Alison「欸，老照片上的椰子樹好矮。」阿哲「椰子樹也當過新生。」',J(L)===J(['（系上的新生導覽走到校史館。看完出來，Alison 站在門口。）','欸，老照片上的椰子樹好矮。','椰子樹也當過新生。'])&&J(who())===J([null,'Alison','阿哲']),J([L,who()]));
    check('2. 只演一次；不替 Alison、阿哲記「認識」（noMeet）',!c2()&&SOCIAL.has('yu','FIRST_MET')===metYu0&&SOCIAL.has('zhe','FIRST_MET')===metZhe0); }

  /* ---------------- 3 L3 ---------------- */
  const EV3=y=>CL123.EV_L3[y-1];
  const LINES3={1:['（系學會每年在圓窗館前拍一張合照。）','（Alison 站最後一排，跳起來才拍得到。）','欸再一張，我剛剛眨眼。'],2:['（系學會每年在圓窗館前拍一張合照。）','（Alison 站中間，負責喊「一、二、三」。）'],
    3:['（系學會每年在圓窗館前拍一張合照。）','（Alison 把系學會交出去了，站在攝影師旁邊，負責拿器材。）','我第一次在照片外面。……還不錯。'],4:['（系學會每年在圓窗館前拍一張合照。）','（學弟妹請 Alison 回來拍。她站最邊邊，笑得最開心。）']};
  const KEYS3={1:'2025-09-19',2:'2026-09-24',3:'2027-09-24',4:'2028-09-22'};   /* 大二：2026-09-25 是中秋，AA-B 11-01 改前一天 9/24（四）*/
  const rules=G=>{ STORY.phoneRules(GM); PHONE.tick(G); };
  const atPav=()=>{ E.player.obj.position.x=CL123.L3_AT.x; E.player.obj.position.z=CL123.L3_AT.z+1; };
  const here3=ev=>EVENTS.check(ev)&&Math.hypot(ev.near.x-E.player.obj.position.x,ev.near.z-E.player.obj.position.z)<=ev.near.r;
  for(const y of [1,2,3,4]){ const d=CL123.l3Day(y), ev=EV3(y), t=CALENDAR.termOf(d);
    check('3-'+y+'. 大'+'一二三四'[y-1]+'：那一天是 Y'+y+'S1 第 3 週週'+(y===2?'四':'五')+'（'+KEYS3[y]+'）',keyOf(d)===KEYS3[y]&&t.id==='Y'+y+'S1'&&t.week===3&&CALENDAR.dateOf(d).wd===(y===2?4:5),keyOf(d));
    let G=fresh(KEYS3[y],11.9,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); rules(G); const pre=H.msgs('g:law_class').includes(CL123.INV);
    G.hour=12; rules(G); const m=(G.msgs||[]).find(x=>x.th==='g:law_class'&&x.text===CL123.INV), q=OUT.get(G,'l123_l3_'+y);
    check('3-'+y+'. 12:00 系學會在班群約（11:59 還沒有）、排進行程：16:00、出發帶到圓窗館前（campus）',!pre&&!!m&&m.name==='系學會'&&!!q&&q.state==='planned'&&q.h===16&&q.goto&&q.goto.zone==='campus'&&Math.hypot(q.goto.x-CL123.L3_AT.x,q.goto.z-CL123.L3_AT.z)<CL123.L3_R,J([pre,m,q]));
    G.zone='campus'; G.hour=16; atPav(); const a=here3(ev); E.player.obj.position.x=0; E.player.obj.position.z=0; const b=here3(ev); atPav(); G.hour=15.75; const c=here3(ev); G.hour=16.5; const e=here3(ev); G.hour=16;
    const other=CL123.EV_L3.filter(x=>x!==ev).some(x=>here3(x));
    check('3-'+y+'. 16:00 在圓窗館前＝演；不在附近、15:45、16:30 不演；別的學年的版本不演',a&&!b&&!c&&!e&&!other,J([a,b,c,e,other]));
    if(y===1) check('3-1. tick 真的挑到它',ticked()==='ev_l3_photo_1',String(ticked()));
    H.said=[]; H.picks=[]; await EVENTS.run(ev); const L=said();
    check('3-'+y+'. 台詞照稿（Alison 的位置和那一年的話）',J(L)===J(LINES3[y])&&(LINES3[y].length<3||who()[2]==='Alison'),J([L,who()]));
    check('3-'+y+'. 演了：行程收掉（不再問出發）；18:00 沒有照片；只演一次',OUT.get(G,'l123_l3_'+y).state==='done'&&!EVENTS.check(ev)&&(G.hour=18.1,rules(G),!H.msgs('g:law_class').includes(CL123.PHOTO)),J(H.msgs('g:law_class')));
    /* 沒去 */
    G=fresh(KEYS3[y],12,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); rules(G); G.hour=17.9; rules(G); const p0=H.msgs('g:law_class').includes(CL123.PHOTO); G.hour=18; rules(G);
    const pm=(G.msgs||[]).find(x=>x.th==='g:law_class'&&x.text===CL123.PHOTO);
    check('3-'+y+'. 沒去：18:00 班群收到「📷（圓窗館前的系學會合照）」（17:59 還沒有）',!p0&&!!pm&&pm.name==='系學會',J(H.msgs('g:law_class'))); }
  { /* 補送、私訊、國外、經濟系 */
    const d=CL123.l3Day(1); let G=fresh(KEYS3[1],12,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); rules(G); G.day=d+2; G.hour=9; rules(G); const late=H.msgs('g:law_class').includes(CL123.PHOTO);
    G=fresh(KEYS3[1],12,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); G.day=d+4; G.hour=9; rules(G); const tooLate=H.msgs('g:law_class').length;
    check('3. 照片晚三天內補送（睡過頭）；第四天以後不補（約也不補）',late&&tooLate===0,J([late,tooLate]));
    /* 法律系的玩家其實一直在班群（story3d.js 第 1 天自動加入）：「不在班群」用假的 inGroup 模擬（只擋 law_class）*/
    const ig0=PHONE.inGroup; PHONE.inGroup=(G,g)=>g==='law_class'?false:ig0(G,g);
    try{
      G=fresh(KEYS3[1],12.5,'dorm'); G.contacts.yu=G.day-5; rules(G); const dm=H.msgs('p:yu').includes(CL123.INV), q=OUT.get(G,'l123_l3_1'); G.hour=18; rules(G); const dmp=H.msgs('p:yu').includes(CL123.PHOTO);
      check('3. 不在班群、有 Alison 的聯絡方式：Alison 私訊約（同一句）、排進行程；沒去 18:00 她私訊照片；班群沒有',dm&&!!q&&dmp&&!(G.msgs||[]).some(x=>x.th==='g:law_class'&&(x.text===CL123.INV||x.text===CL123.PHOTO)),J([H.msgs('p:yu'),q]));
      G=fresh(KEYS3[1],12.5,'dorm'); rules(G); G.hour=18; rules(G); check('3. 不在班群、沒有 Alison 的聯絡方式：沒有約、沒有行程、沒有照片',!(G.msgs||[]).some(x=>x.text===CL123.INV||x.text===CL123.PHOTO)&&!OUT.get(G,'l123_l3_1'),J(G.msgs));
    } finally { PHONE.inGroup=ig0; }
    G=fresh(KEYS3[1],9,'dorm'); G.contacts.yu=G.day-5; rules(G); const inG9=PHONE.inGroup(G,'law_class'); G.hour=12; rules(G);
    check('3. 實際上法律系的玩家早就在班群（story3d.js 自動加入；早上 9:00 已經在）：12:00 的約在班群、Alison 不另外私訊',inG9&&H.msgs('g:law_class').includes(CL123.INV)&&!H.msgs('p:yu').includes(CL123.INV),J([inG9,H.msgs('g:law_class'),H.msgs('p:yu')]));
    G=fresh(KEYS3[4],12.5,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); const ab0=STORY.abroad, tz0=STORY.tzOffset; STORY.abroad=()=>true; STORY.tzOffset=()=>-12;
    try{ rules(G); } finally { STORY.abroad=ab0; STORY.tzOffset=tz0; } const qa=OUT.get(G,'l123_l3_4'), ma=(G.msgs||[]).find(x=>x.text===CL123.INV);
    check('3. 人在國外（美國路線大四上）：班群照樣收到（當地時間）、不排出發',!!ma&&ma.h===0&&!qa,J([ma,qa]));
    G=fresh(KEYS3[1],12.5,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); G.stage='econ'; rules(G); G.hour=18; rules(G); G.zone='campus'; G.hour=16; atPav(); const ec=here3(EV3(1));
    check('3. 經濟系（stage econ）：不約、不演、沒有照片',!(G.msgs||[]).length&&!OUT.get(G,'l123_l3_1')&&!ec);
    /* 出發：帶到圓窗館前（15:55 到），到了就演 */
    G=fresh(KEYS3[1],12,'dorm'); PHONE.join(G,'law_class','法律系（全班）'); rules(G); G.hour=15.6; const due=OUT.due(G); H.entered=[];
    if(due) await OUT.go(GM,due); const arr=G.hour; E.player.obj.position.x=CL123.L3_GOTO.x; E.player.obj.position.z=CL123.L3_GOTO.z;
    check('3. 出發：15:36 跳出「出發」→ 帶到校園的圓窗館前、15:55 到，到了就演（在範圍、時間窗內）',!!due&&due.id==='l123_l3_1'&&J(H.entered)===J(['campus'])&&Math.abs(arr-(16-1/12))<1e-6&&here3(EV3(1)),J([due&&due.id,H.entered,arr])); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
