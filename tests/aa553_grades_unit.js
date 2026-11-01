// AA_553 成績出來以後：BB 人物的反應（企劃線 AUDIT-AA-FOLLOWUP 第 5 項；src/grades3d.js）——不需要瀏覽器。台詞逐字照稿（從企劃線 git show 讀稿比對幾句關鍵）。
//   1 級別：高／中／低、法律課被當、出席被當；進步；成績出來以後的期間（公布日～下學期第 3 週）
//   2 當面：學姊（說／不說、進步多一句）、芷若（只在 Café；常在 Café 看到他）、沛珊（只有大一；「全部。」記 PS_STUDY）、明軒（低＝筆記 MX_NOTES）、方奕廷；每學期一次、不熟不演
//   3 書卷獎一句：同一次見面成績先、書卷獎下一次
//   4 手機：子晴、阿凱（公布日 21:00；朋友以上；被當的版本）；可昕其他學期被當 21:30
//   5 第 3 節：沛珊週三總圖二樓（SCHED_X）、明軒的筆記、阿凱的泡麵（房間物件）
//   6 第 4 節：可昕一起打開成績照級別換句（被當不再說「都過了」）；大四上多「沒有最滿意的。」
// 修改前（開發分支 441e13082）：沒有 src/grades3d.js——全部 FAIL。用法：node tests/aa553_grades_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H, J=JSON.stringify;
const loadErr=[];
const L3=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f+'：沒有這個檔'); return; } try{ const src=fs.readFileSync(p,'utf8').replace(/^const (HONOR|GRADES)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); }catch(e){ loadErr.push(f+'：'+e); } };
for(const f of ['src/honor3d.js','src/grades3d.js']) L3(f);
GM.toast=()=>{}; GM.caption=()=>{};
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
let doc=''; try{ doc=cp.execSync('git show origin/claude/cool-heisenberg-o8kuqx:"docs/story_planning/AA_553_成績出來以後_BB人物的反應_照現行設定重寫.md"',{cwd:H.ROOT,encoding:'utf8',stdio:['ignore','pipe','ignore']}); }catch(e){ doc=''; }
const inDoc=t=>!doc||doc.includes(t);   /* 讀不到企劃線（沒 fetch）就只比對程式 */
const ok=typeof GRADES!=='undefined';
check('0. src/grades3d.js 載得到、掛上 PRE_TALK／PHONE_RULES／ROOM_EXTRA／SCHED_X',ok&&!loadErr.length&&STORY.PRE_TALK.includes(GRADES.preTalk)&&Array.isArray(STORY.SCHED_X)&&STORY.SCHED_X.includes(GRADES.sched),J(loadErr));
if(!ok){ H.done(); }
const setScore=(G,t,n,att)=>{ const R=CLS.rec(G); R.exam=R.exam||{}; for(const c of CLS.termCourses(G,t)){ if(CLS.isExamCourse(c)) R.exam[t+':'+c.id+':final']={status:'done',correct:typeof n==='function'?n(c):n}; if(CLS.attCourse(c)) R.attend[c.id]=att==null?3:att; } };
const said=()=>H.said.map(s=>s.t);
const talk=async(id,picks)=>{ H.said=[]; H.picks=[].concat(picks||[]); await GRADES.preTalk(GM,{name:id},id); return said(); };
(async()=>{
  /* 1 */
  { const G=H.fresh('2026-01-05',9,'dorm',{}); setScore(G,'Y1S1',5); const a=GRADES.lv(G,'Y1S1'); setScore(G,'Y1S1',3); const b=GRADES.lv(G,'Y1S1'); setScore(G,'Y1S1',2); const c=GRADES.lv(G,'Y1S1');
    let first=true; setScore(G,'Y1S1',cc=>{ if(first){ first=false; return 0; } return 5; }); const d=GRADES.lv(G,'Y1S1'); setScore(G,'Y1S1',5,0); const e=GRADES.lv(G,'Y1S1');
    check('1. 級別：平均 5＝高、3＝中、2＝低、有一科 0 題＝法律課被當、出席不到三堂＝出席被當',J([a,b,c,d,e])===J(['high','mid','low','fail_law',CLS.termCourses(G,'Y1S1').some(c=>CLS.attCourse(c))?'fail_att':'high']),J([a,b,c,d,e]));
    setScore(G,'Y1S1',3); setScore(G,'Y1S2',4); check('1. 進步：上學期 3、這學期 4＝進步',GRADES.improved(G,'Y1S2')===true&&GRADES.improved(G,'Y1S1')===false);
    const g1=CALENDAR.gradeDay('Y1S1'), r2=CALENDAR.termDays('Y1S2'), W=d=>{ G.day=d; return GRADES.windowTerm(G); };
    check('1. 期間：大一上公布日（'+keyOf(g1)+'）～大一下第 3 週＝Y1S1；第 4 週起沒有；公布日前一天沒有',W(g1)==='Y1S1'&&W(r2.from+20)==='Y1S1'&&W(r2.from+21)===null&&W(g1-1)===null,J([W(g1),W(r2.from+20),W(r2.from+21),W(g1-1)])); }
  /* 2 學姊 */
  { const G=H.fresh('2026-01-06',15,'library',{}); setScore(G,'Y1S1',5); H.FAMILIAR('heroine_05');
    const L=await talk('heroine_05',[0]); check('2-1. 學姊（高、說「很好。」）：「成績出來了。三個字以內。」→「好。」「下學期，我出難一點的題目給你。」；記 TOLD_SCORE',J(L)===J(['成績出來了。三個字以內。','好。','下學期，我出難一點的題目給你。'])&&SOCIAL.has('heroine_05','TOLD_SCORE')&&J(H.opts[0].slice(0,2))===J(['很好。','不說。'])&&inDoc('下學期，我出難一點的題目給你。'),J([L,H.opts]));
    const L2=await talk('heroine_05',[0]); check('2-1. 同一學期第二次說話：不再演',L2.length===0,J(L2));
    /* 下學期：中、進步、說過 */
    setScore(G,'Y1S1',3); setScore(G,'Y1S2',4); G.day=CALENDAR.gradeDay('Y1S2'); const L3x=await talk('heroine_05',[0]);
    check('2-1. 大一下（4 題＝高、比上學期 3 題進步、上學期說過）：最後多「比上學期好。我看得出來。」',L3x[L3x.length-1]==='比上學期好。我看得出來。',J(L3x));
    const G2=H.fresh('2026-01-06',15,'library',{}); setScore(G2,'Y1S1',2); H.FAMILIAR('heroine_05'); const L4=await talk('heroine_05',[1]);
    check('2-1. 選「不說。」：「好。不說也是一種答案。」、沒有 TOLD_SCORE',L4[1]==='好。不說也是一種答案。'&&!SOCIAL.has('heroine_05','TOLD_SCORE'),J(L4));
    const G3=H.fresh('2026-01-06',15,'library',{}); setScore(G3,'Y1S1',5); H.rel('heroine_05',10,0,0); const L5=await talk('heroine_05',[0]); check('2-1. 只是認識（不到有點熟）：不演',L5.length===0,J(L5)); }
  /* 2 芷若 */
  { const G=H.fresh('2026-01-06',15,'campus',{}); setScore(G,'Y1S1',3); H.FAMILIAR('heroine_02');
    const a=await talk('heroine_02'); G.zone='cafe'; const b=await talk('heroine_02');
    check('2-2. 芷若：不在 Café 不演；在 Café「成績出來了吧。……今天這杯我請。」「不是因為你考得好，是因為你看起來很需要。」',a.length===0&&J(b)===J(['成績出來了吧。……今天這杯我請。','不是因為你考得好，是因為你看起來很需要。']),J([a,b]));
    const G2=H.fresh('2026-01-06',15,'cafe',{GR_STUDY:{Y1S1:{cafe:5}}}); setScore(G2,'Y1S1',3); H.FAMILIAR('heroine_02'); const c=await talk('heroine_02');
    check('2-2. 這學期在 Café 讀書 5 次以上：「成績出來了吧。今天這杯我請。」「這學期你坐那個位子，坐了好多個晚上。」',J(c)===J(['成績出來了吧。今天這杯我請。','這學期你坐那個位子，坐了好多個晚上。']),J(c));
    const G3=H.fresh('2026-01-06',15,'cafe',{}); setScore(G3,'Y1S1',0); H.FAMILIAR('heroine_02'); const d=await talk('heroine_02'); check('2-2. 被當：「……今天這杯我請。不是安慰，是剛好。」',J(d)===J(['……今天這杯我請。不是安慰，是剛好。']),J(d)); }
  /* 2 沛珊 */
  { const G=H.fresh('2026-01-06',15,'campus',{}); setScore(G,'Y1S1',4); H.FAMILIAR('classmate_peishan'); const a=await talk('classmate_peishan',[2]);
    check('2-4. 沛珊：「哪一題，你最想再寫一次？」→「全部。」→（她笑了。）「好。那下學期一起念。」、記 PS_STUDY',J(a)===J(['哪一題，你最想再寫一次？','（她笑了。）','好。那下學期一起念。'])&&G.flags.PS_STUDY==='Y1S1',J([a,G.flags.PS_STUDY]));
    const G2=H.fresh('2026-01-06',15,'campus',{}); setScore(G2,'Y1S1',4); H.FAMILIAR('classmate_peishan'); const b=await talk('classmate_peishan',[1]);
    check('2-4. 「都寫完了。」→「……那很好。我每一題都想重寫。」（D116：不羨慕）',b[1]==='……那很好。我每一題都想重寫。'&&inDoc('……那很好。我每一題都想重寫。'),J(b));
    const G3=H.fresh('2027-01-11',15,'campus',{}); setScore(G3,'Y2S1',4); H.FAMILIAR('classmate_peishan'); G3.day=CALENDAR.gradeDay('Y2S1'); const c=await talk('classmate_peishan',[0]);
    check('2-4. 大二上（她離開法律系）不演',c.length===0,J(c)); }
  /* 2 明軒、方奕廷 */
  { const G=H.fresh('2026-01-06',15,'campus',{}); setScore(G,'Y1S1',2); H.FAMILIAR('classmate_mingxuan'); const a=await talk('classmate_mingxuan',[0]);
    check('2-6. 明軒（低、說）：「考得怎樣？哈哈，我隨便念念。」→「筆記借你。我隨便寫的。」（筆記的字很整齊，一點都不隨便。）、記 MX_NOTES',J(a)===J(['考得怎樣？哈哈，我隨便念念。','筆記借你。我隨便寫的。','（筆記的字很整齊，一點都不隨便。）'])&&G.flags.MX_NOTES==='Y1S1'&&H.opts[0][0]==='不太好。',J([a,H.opts]));
    const G2=H.fresh('2026-01-06',15,'campus',{}); setScore(G2,'Y1S1',3); H.FAMILIAR('classmate_mingxuan'); SOCIAL.remember('classmate_mingxuan','SAW_HIM_STUDY',''); const b=await talk('classmate_mingxuan',[2]);
    check('2-6. 看過他念書（SAW_HIM_STUDY）多一個「你隨便念念？」→「……哈哈。下一題。」',H.opts[0].length===3&&b[1]==='……哈哈。下一題。',J([b,H.opts]));
    const G3=H.fresh('2026-01-06',15,'campus',{}); setScore(G3,'Y1S1',5); H.FAMILIAR('npc_fangyt'); const c=await talk('npc_fangyt');
    check('2-7. 方奕廷（高）：「我們系的期末在山上考。認樹。」「你這學期都在室內。……週末去走走。不用帶書。」',J(c)===J(['我們系的期末在山上考。認樹。','你這學期都在室內。……週末去走走。不用帶書。']),J(c)); }
  /* 3 書卷獎一句 */
  { const G=H.fresh('2026-02-23',15,'library',{}); setScore(G,'Y1S1',5); H.FAMILIAR('heroine_05'); G.flags.HONOR_LAST='Y1S1'; G.flags.HONOR_Y1S1=true;
    const a=await talk('heroine_05',[0]); const b=await talk('heroine_05'); const c=await talk('heroine_05');
    check('3. 學姊：同一次見面成績先演、書卷獎下一次（「系上的公告我看到了。……恭喜。」「這頓你請。」），再下一次都沒有',a[0]==='成績出來了。三個字以內。'&&J(b)===J(['系上的公告我看到了。……恭喜。','這頓你請。'])&&c.length===0,J([a,b,c])); }
  /* 4 手機 */
  { const G=H.fresh('2026-01-05',20,'dorm',{}); setScore(G,'Y1S1',5); H.FRIEND('heroine_04'); H.FRIEND('kai'); INV.addContact(G,'heroine_04'); INV.addContact(G,'kai'); G.day=CALENDAR.gradeDay('Y1S1');
    G.hour=20.9; GRADES.phone(G); PHONE.tick(G); const before=H.msgs('p:heroine_04').length; G.hour=21.1; GRADES.phone(G); PHONE.tick(G);
    check('4. 子晴 21:00（不加句號）：「欸不是」「成績出來了」「你的不用說」「我的必修很好 其他過了」；21:00 以前沒有',before===0&&J(H.msgs('p:heroine_04'))===J(['欸不是','成績出來了','你的不用說','我的必修很好 其他過了']),J(H.msgs('p:heroine_04')));
    check('4. 阿凱（大一）：「所以我的成績出來了」「程設 很好」「微積分 過了」「其他 不要問」',J(H.msgs('p:kai'))===J(['所以我的成績出來了','程設 很好','微積分 過了','其他 不要問']),J(H.msgs('p:kai')));
    const G2=H.fresh('2027-01-11',20,'dorm',{}); setScore(G2,'Y2S1',cc=>0); H.FRIEND('kai'); H.FRIEND('kexin'); INV.addContact(G2,'kai'); INV.addContact(G2,'kexin'); G2.day=CALENDAR.gradeDay('Y2S1'); G2.hour=21.6; GRADES.phone(G2); PHONE.tick(G2);
    check('4. 大二上法律課被當：阿凱「所以我的成績出來了」「必修 很好」「選修 過了」「所以你也被當了」「歡迎加入重修」；可昕 21:30「被當？……好。下學期重修那一科，我每週出一題給你。」',J(H.msgs('p:kai'))===J(['所以我的成績出來了','必修 很好','選修 過了','所以你也被當了','歡迎加入重修'])&&J(H.msgs('p:kexin'))===J(['被當？……好。下學期重修那一科，我每週出一題給你。']),J([H.msgs('p:kai'),H.msgs('p:kexin')]));
    const G3=H.fresh('2026-01-05',20,'dorm',{}); setScore(G3,'Y1S1',5); H.FAMILIAR('heroine_04'); INV.addContact(G3,'heroine_04'); G3.day=CALENDAR.gradeDay('Y1S1'); G3.hour=21.5; GRADES.phone(G3); PHONE.tick(G3);
    check('4. 子晴只到有點熟：不傳',H.msgs('p:heroine_04').length===0); }
  /* 5 第 3 節 */
  { const G=H.fresh('2026-02-23',20,'dorm',{PS_STUDY:'Y1S1'}); INV.addContact(G,'classmate_peishan'); const r=CALENDAR.termDays('Y1S2'); G.day=r.from; G.hour=21.2; GRADES.phone(G); PHONE.tick(G);
    const m=(G.msgs||[]).find(x=>x.th==='p:classmate_peishan');
    check('5. 沛珊 PS_STUDY：下學期第 1 週週一 21:00「這學期，週三晚上總圖二樓。……要來嗎？」（選項「好。」記 PS_STUDY_ON）',!!m&&m.text==='這學期，週三晚上總圖二樓。……要來嗎？',J(H.msgs('p:classmate_peishan')));
    G.flags.PS_STUDY_ON='Y1S2'; let wed=r.from; while(CALENDAR.dateOf(wed).wd%7!==3) wed++; G.day=wed; G.weekday=3; G.hour=19.5; const e=GRADES.sched(CHARACTERS.classmate_peishan,G); G.hour=21.2; const e2=GRADES.sched(CHARACTERS.classmate_peishan,G);
    check('5. 那學期週三 19:00～21:00 沛珊在總圖二樓（library_hall、read）；21:00 以後照原本作息',!!e&&e.zone==='library_hall'&&e.act==='read'&&!e2,J([e,e2]));
    { G.zone='library_hall'; G.hour=19.5; H.FAMILIAR('classmate_peishan'); G.flags.GR_classmate_peishan_Y1S1=G.day-30;   /* 成績那段演過了（不然這一次先演成績）*/ const a1=await talk('classmate_peishan'); const a2=await talk('classmate_peishan'); G.zone='campus'; const a3=await talk('classmate_peishan'); G.flags.GR_PS_SAT=null;
      check('5. 週三 19:00～21:00 在總圖二樓走到她旁邊說話：「（你在她旁邊坐下。她把一半的桌面讓出來，什麼都沒說。）」、記 STUDIED_TOGETHER；同一天一次；不在總圖沒有（AA-B 11-01）',J(a1)===J(['（你在她旁邊坐下。她把一半的桌面讓出來，什麼都沒說。）'])&&SOCIAL.has('classmate_peishan','STUDIED_TOGETHER')&&a2.length===0&&a3.length===0,J([a1,a2,a3])); }
    G.flags.MX_NOTES='Y1S1'; const Lr=[]; GRADES.room(G,Lr); check('5. MX_NOTES 的下學期：房間多「明軒的筆記」',Lr.some(x=>x[0]==='明軒的筆記'&&x[1]==='明軒的筆記。字很整齊，一點都不隨便。'),J(Lr));
    const w16=CALENDAR.termDays('Y1S1').from+15*7, G2=H.fresh(keyOf(w16),9,'dorm',{}); H.FRIEND('kai'); const T=CALENDAR.termOf(G2.day); const L2=[]; GRADES.room(G2,L2);
    check('5. 大一上期末考週（第 16 週）：桌上的泡麵「考試週限定」',T&&T.week===16&&L2.some(x=>x[0]==='桌上的泡麵'&&/考試週限定/.test(x[1])),J([T,L2])); }
  /* 6 第 4 節 */
  { const ev=STORY_EVENTS.find(e=>e.id==='ev_kexin_grades_open');
    const run=async n=>{ const G=H.fresh('2026-01-05',21,'dorm',{}); setScore(G,'Y1S1',n); H.said=[]; await EVENTS.runLines(ev.dialogue,{id:'t',participants:['kexin']}); return said().filter(t=>t!=='三、二、一——'); };
    const hi=await run(5), mid=await run(3), lo=await run(2), f=await run(0);
    check('6. 可昕一起打開（大一上）：高「……你偷念。」「好，這次才是真的放假。」「你請。」；中照舊；低「……都過了。」「下學期我們一起念。我排時間。」；被當「……有一科沒過。」「好。下學期那一科，我陪你念。」（不再說都過了）',
      J(hi)===J(['……你偷念。','好，這次才是真的放假。','你請。'])&&J(mid)===J(['……都過了。好，這次才是真的放假。'])&&J(lo)===J(['……都過了。','下學期我們一起念。我排時間。'])&&J(f)===J(['……有一科沒過。','好。下學期那一科，我陪你念。']),J({hi,mid,lo,f}));
    const src=fs.readFileSync(path.join(H.ROOT,'src/r2y4a3d.js'),'utf8'); check('6. 大四上「各說一科最滿意的」多「沒有最滿意的。」→「那說一科最不滿意的。我陪你。」',/沒有最滿意的。[\s\S]{0,200}那說一科最不滿意的。我陪你。/.test(src)); }
  /* 7 吧檯班的芷若（BB-B 11-01：點餐那條路沒有走 PRE_TALK）：成績那段照演，演完照常點餐；不在期間＝直接點餐 */
  { if(STORY._bindGM) STORY._bindGM(GM); const bar=async(key,setup)=>{ const G=H.fresh(key,15,'cafe',{}); setScore(G,'Y1S1',3); H.FAMILIAR('heroine_02'); if(setup) setup(G); H.said=[]; H.picks=[];
      await STORY.talkCharacter('heroine_02',{name:'林芷若',charId:'heroine_02',staff:'cafe',obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}).catch(e=>{ H.said.push({t:'ERR '+e}); }); return [G,said()]; };
    const [G,a]=await bar('2026-01-06'); const zr=await (async()=>{ const G0=H.fresh('2026-01-06',15,'cafe',{}); setScore(G0,'Y1S1',3); H.FAMILIAR('heroine_02'); return talk('heroine_02'); })();
    const [,b]=await bar('2026-01-06',G=>{ G.flags.GR_heroine_02_Y1S1=G.day-1; });
    const BAR='歡迎光臨——喔，法律系的？要喝什麼，慢慢看。', zs=zr.filter(t=>t!=='杯子放著就好，慢慢來。');   /* 店員事件是 onInteract 非同步演的：上一次的後半句會晚一點才進 H.said */
    check('7. 吧檯班的芷若（作息帶「兩點半的店員」事件）：成績公布期間跟她說話＝先演 2-2 那段（和一般說話同一段）、再演店員那段，記 GR_heroine_02_Y1S1；已經演過＝只有店員那段',zs.length>0&&J(a.slice(0,zs.length))===J(zs)&&a.indexOf(BAR)>zs.length-1&&G.flags.GR_heroine_02_Y1S1===G.day&&b[0]===BAR&&!b.some(t=>zs.includes(t))&&!a.concat(b).some(t=>/^ERR/.test(t)),J({a,b,zs}));
    { const G4=H.fresh('2026-01-06',15,'cafe',{}); setScore(G4,'Y1S1',3); H.FAMILIAR('heroine_02'); const ev=STORY_EVENTS.find(e=>e.id==='ev_cafe_barista_zhiruo'); const ck=EVENTS.check; EVENTS.check=e=>e===ev?false:ck(e); H.said=[];
      try{ await STORY.talkCharacter('heroine_02',{name:'林芷若',charId:'heroine_02',staff:'cafe',obj:{position:{x:0,y:0,z:0},rotation:{y:0}}}).catch(e=>{ H.said.push({t:'ERR '+e}); }); } finally { EVENTS.check=ck; }
      const e=said().filter(t=>t!=='杯子放著就好，慢慢來。'); check('7. 店員事件冷卻中（同一天第二次）＝直接點餐那條路：成績那段一樣先演',J(e.slice(0,zs.length))===J(zs)&&G4.flags.GR_heroine_02_Y1S1===G4.day&&!e.some(t=>/^ERR/.test(t)),J(e)); }
    const [G2,c]=await bar('2026-04-20'); check('7. 不在成績期間（大一下第 8 週）：不演、不記',G2.flags.GR_heroine_02_Y1S2==null&&!c.some(t=>zr.includes(t)),J(c)); }
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
