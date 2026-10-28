// BB 事件包第二輪：B9 明軒／采蓁（BB_137 2-3）、AA_426 第 5 節以安那句、日文班三個人進 CHARACTERS（BB_105 3-1）、syllabus 日文下第 10 週拿掉 AA-C 刪的那句、
// BB_154 S-3 阿凱網拍鍵盤（BB154-KAI-KB）、BB_171 大一跨年 Kevin 的煙火照片（V1-BB171）。不需要瀏覽器。
// 修改前（開發分支 dd96391c2）：B9 沒有明軒、采蓁；CHARACTERS 沒有 jp_*；syllabus 還有「所以學語言，是在學看人。」；沒有 ev_kai_keyboard；沒有 Kevin 跨年照片——全部 FAIL。
// 用法：node tests/bbpack_r2_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let err=''; try{ load('src/data/bbpack_events.js'); load('src/bbpack3d.js'); }catch(e){ err=String(e); }
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const B137=git('a047e5feb','BB_137_AB05台詞_日文班博雅女舍十五件.md'), B154=git('968473469','BB_154_AB27_大一下缺口_學姊傳書_阿凱鍵盤.md'), B70=git('7fca0df50','BB_70_日常與邀約_芷若_子晴_溫學姊_配角.md'), B105=git('3954f9b62','BB_105_四個地點的跨學年故事.md');
const J=JSON.stringify, ev=id=>STORY_EVENTS.find(e=>e.id===id), X=()=>typeof BBPACK!=='undefined'?BBPACK:null;
const TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const setDay=(d,h)=>{ const G=H.G; G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(d,h,zone,flags,know)=>{ const G=H.fresh('2026-01-01',h,zone||'campus',flags||{}); setDay(d,h); G.outings=[]; for(const id of (know||[])) H.FAMILIAR(id); EVENTS.zoneChanged(); return G; };
const said=()=>H.said.map(s=>s.t), who=()=>H.said.map(s=>(s.who||'')+'：'+s.t);
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return said(); };
const msgs=th=>H.msgs(th);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };

(async()=>{
  check('0. 讀稿（企劃線 BB_137 @a047e5feb、BB_154 @968473469、BB_70 @7fca0df50、BB_105 @3954f9b62）',B137.length>2000&&B154.indexOf('## 2. S-3')>=0&&B70.indexOf('## 8b.')>=0&&B105.length>2000);
  check('0. 新檔載得到',!!X()&&!err,err);
  if(!X()){ H.done(); return; }

  /* ===== 1 B9（events.js ev_exchange_expo_y2）===== */
  await sec('1',async()=>{
    const ex=TD('Y2S2',4,4); const E=ev('ev_exchange_expo_y2');
    const play=async(pick,know,flags,jp)=>{ fresh(ex,12.4,'boya',flags,know); if(jp) CLS.rec(H.G).attend.japanese_2=3; H.said=[]; H.opts=[]; H.picks=[pick]; await EVENTS.run(E); return who(); };
    let L=await play(0,['classmate_mingxuan','heroine_01'],{JP_MET:true},true);
    check('1. B9 認識明軒：進場兩句（明軒在門口）在以安那句前面（BB_137 2-3）',/：我想去。……交換要先存錢，我算過了。$/.test(L[0])&&/：要再多教兩個家教學生。$/.test(L[1])&&L[2]==='：（以安坐在第一排。）',J(L.slice(0,3)));
    check('1. B9 坐日本區、修過日文、日文班認識：采蓁兩句',L.includes('采蓁：欸，日文課的！你也想去日本？')&&L.includes('采蓁：獸醫系走不開。……可是看看也好。'),J(L));
    L=await play(0,['classmate_mingxuan'],{},false); check('1. B9 沒修日文：日本區沒有采蓁（「以安已經坐在第一排」那句不放：開頭已經有）',!L.some(t=>/采蓁/.test(t))&&!L.some(t=>/以安已經坐在第一排/.test(t)),J(L));
    L=await play(1,['classmate_mingxuan'],{}); check('1. B9 美國區：明軒「我坐這裡，不代表付得起。」',L.some(t=>/明軒：美國區。……我坐這裡，不代表付得起。$/.test(t)),J(L));
    L=await play(2,['classmate_mingxuan'],{}); check('1. B9 台灣區：明軒「聽聽不用錢。」',L.some(t=>/明軒：你只是來聽聽？……我也是。聽聽不用錢。$/.test(t)),J(L));
    L=await play(2,[],{}); check('1. B9 誰都不認識：照舊沒有台詞（選區、EXPO_COUNTRY 照舊）',L.length===0&&H.G.flags.EXPO_COUNTRY==='台灣',J(L));
    const T=E.dialogue.filter(l=>l.text&&/明軒|采蓁|classmate_mingxuan/.test(String(l.speaker))).map(l=>l.text);
    check('1. B9 明軒、采蓁的六句都在 BB_137 2-3',T.length===6&&T.every(t=>B137.indexOf(t)>=0),J(T.filter(t=>B137.indexOf(t)<0)));
  });

  /* ===== 1b AA_426 第 5 節（企劃線 967b4273a）：大二群戲（ev_moot_3）以安那句拿掉「理由：」===== */
  { const A426=git('967b4273a','AA_426_心願事件改稿_子晴學姊可昕與四個提醒.md'), T=ev('ev_moot_3').dialogue.filter(l=>l.speaker==='heroine_01').map(l=>l.text);
    check('1b. AA_426 第 5 節：以安「這樣兩個人都不用讓。」（原本「理由：兩個人都不用讓。」）',A426.indexOf('| 理由：兩個人都不用讓。 | 這樣兩個人都不用讓。 |')>=0&&T.includes('這樣兩個人都不用讓。')&&!T.includes('理由：兩個人都不用讓。'),J(T)); }
  /* ===== 2 日文班三個人 ===== */
  await sec('2',async()=>{
    const s10=(SYLLABUS.courses.japanese_2||[]).find(w=>w.w===10);
    check('2. syllabus 日文（下）第 10 週：拿掉采蓁「所以學語言，是在學看人。」（AA-C 審 BB_105 G6），立衡那句照舊',!!s10&&!s10.react.some(r=>/是在學看人/.test(r.text))&&s10.react.some(r=>r.who==='jp_liheng'&&r.text==='……那考試怎麼考？'),J(s10&&s10.react));
    const C=CHARACTERS;
    check('2. CHARACTERS：jp_caizhen 葛采蓁（女、獸醫系）、jp_liheng 鄒立衡（男、機械系）、jp_yuheng 汪宇恆（男、電機系），稱呼是采蓁、立衡、宇恆；沒有立繪',!!C.jp_caizhen&&C.jp_caizhen.name==='葛采蓁'&&C.jp_caizhen.gender==='f'&&C.jp_caizhen.department==='獸醫系'&&!!C.jp_liheng&&C.jp_liheng.name==='鄒立衡'&&C.jp_liheng.gender==='m'&&C.jp_liheng.department==='機械系'&&!!C.jp_yuheng&&C.jp_yuheng.name==='汪宇恆'&&C.jp_yuheng.department==='電機系'&&J(['jp_caizhen','jp_liheng','jp_yuheng'].map(id=>C[id].alias[0]))===J(['采蓁','立衡','宇恆'])&&['jp_caizhen','jp_liheng','jp_yuheng'].every(id=>C[id].portrait===null));
    check('2. 一句話照 BB_105 3-1',B105.indexOf('| **葛采蓁** | 生農學院・獸醫系（獸醫三；獸醫系念五年） | '+C.jp_caizhen.personality)>=0&&B105.indexOf(C.jp_liheng.personality)>=0&&B105.indexOf(C.jp_yuheng.personality)>=0);
    const pr=(id,d)=>STORY.presence(id,{day:d,flags:{}}).here;
    check('2. presence：大二上以前不在、大二在；立衡大三起在日本念研究所',!pr('jp_caizhen',TD('Y1S2',3,1))&&pr('jp_caizhen',TD('Y2S1',3,1))&&pr('jp_yuheng',TD('Y2S2',3,1))&&pr('jp_liheng',TD('Y2S2',3,1))&&!pr('jp_liheng',TD('Y3S1',3,1))&&STORY.presence('jp_liheng',{day:TD('Y3S1',3,1),flags:{}}).away==='在日本念研究所');
    const G=fresh(TD('Y2S1',3,1),13.6,'gongtong'); const ent=id=>STORY.schedEnt(CHARACTERS[id],G);
    check('2. 作息：大二上週一 13:30 三個人都在共同教學館 102 上課',['jp_caizhen','jp_liheng','jp_yuheng'].every(id=>{ const e=ent(id); return e&&e.zone==='gongtong'&&e.room==='102'&&e.act==='class'; }),J(ent('jp_caizhen')));
    setDay(TD('Y2S1',3,2),13.6); check('2. 週二同一時間不在共同教學館',['jp_caizhen','jp_liheng','jp_yuheng'].every(id=>{ const e=ent(id); return !e||e.zone!=='gongtong'; }));
    const G1=fresh(TD('Y2S1',1,1),13.3,'gongtong'); H.said=[]; H.picks=[0]; await X().inClass.g1(GM,{c:CLS.byId('japanese_1'),week:1,exam:null,term:'Y2S1',day:G1.day,key:'k'},null,{});
    check('2. G1 以後三個人都算認識（FIRST_MET，關係面板看得到）',['jp_caizhen','jp_liheng','jp_yuheng'].every(id=>SOCIAL.has(id,'FIRST_MET')));
    const G2=fresh(TD('Y2S1',3,1),13.2,'gongtong',{JP_MET:true}); const it=CLS.dayItems(G2,G2.day).find(x=>x.c.id==='japanese_1'); H.said=[]; H.picks=[0,0,0]; await CLS.attend(GM,it,{inScene:true});
    check('2. 課表的反應句現在出得來（日文上第 3 週宇恆「コンピューター。這個我會。」）',said().some(t=>/コンピューター。這個我會。/.test(t)),J(said()));
    const G3=fresh(TD('Y2S1',2,1),15.2,'gongtong',{JP_MET:true}); const r0=SOCIAL.rel('jp_caizhen').fam|0; const roll=X().roll; X().roll=()=>0; H.said=[]; H.picks=[0]; await CLS.afterClassEvent(GM,{c:CLS.byId('japanese_1'),week:2,exam:null,term:'Y2S1',day:G3.day,key:'k2'}); X().roll=roll;
    check('2. G2 熟悉度記進關係（采蓁 fam +1）',(SOCIAL.rel('jp_caizhen').fam|0)===r0+1);
  });

  /* ===== 3 BB_154 S-3 阿凱網拍鍵盤 ===== */
  await sec('3',async()=>{
    const d6=TD('Y1S2',6,2);
    let G=fresh(d6,22.2,'dorm',{}); PHONE.join(G,'family_law','法律系直屬家族');
    check('3. 大一下第 6～7 週、週一到週四 22:00～24:00 在宿舍房間',EVENTS.check(ev('ev_kai_keyboard'))&&(()=>{ G.hour=21.5; const a=!EVENTS.check(ev('ev_kai_keyboard')); setDay(TD('Y1S2',8,2),22.2); const b=!EVENTS.check(ev('ev_kai_keyboard')); setDay(TD('Y1S2',6,5),22.2); const c=!EVENTS.check(ev('ev_kai_keyboard')); setDay(d6,22.2); return a&&b&&c; })());
    let L=await run('ev_kai_keyboard',[0]); const O=H.opts[0];
    check('3. 鍵盤聲停了、阿凱那句（照他打字的樣子）、手機筆記四行（BB_154 2-2）',L[0]==='阿凱的鍵盤聲停了。他把椅子轉過來。'&&L[2]==='所以 網拍買的鍵盤少一顆鍵 賣家說不退 可以告嗎'&&L.slice(4,8).join('｜')==='誰：阿凱｜向誰：賣家｜依據什麼：（還不知道。民總的課本？）｜請求什麼：',J(L));
    check('3. 沒有 U_SALE＝只有老實的那個選項；一起翻二十分鐘；沒去過法服＝「我問學長。」',J(O)===J(['「我也還不會。我們一起查。」'])&&L.includes('好 一起翻')&&L.includes('……好像有關，但我說不出來。')&&L[L.length-1]==='我問學長。'&&G.flags.KAI_KB_ASK==='kevin',J(L));
    G.hour=23.05; X().phone(G); PHONE.tick(G);
    check('3. 問學長：23:00 家族群組 Kevin 三句（BB_70 8b）、阿凱私訊、記 KAI_KEYBOARD',J(msgs('g:family_law').slice(-3))===J(['先截圖賣場頁面和你們的對話。','少一顆鍵算不算『跟說好的不一樣』，要看當初怎麼說。','還不確定就週六早上去法服問。'])&&msgs('p:kai').includes('你們法律系的人原來要查這麼久')&&SOCIAL.has('kai','KAI_KEYBOARD'),J(msgs('g:family_law')));
    check('3. KAI_KEYBOARD 有中文名稱（人物頁）',!!(SOCIAL.MEMORY_LABEL&&SOCIAL.MEMORY_LABEL.KAI_KEYBOARD));
    G=fresh(TD('Y1S2',7,3),22.5,'dorm',{U_SALE:true,LAWCLUB_SAT_VISITS:2}); L=await run('ev_kai_keyboard',['東西跟說的不一樣']);
    check('3. 有 U_SALE：多一個選項＝阿凱「少付一顆鍵的錢」；去過法服＝「週六法服。」',H.opts[0].length===2&&L.includes('少付一點也可以喔 那我要少付一顆鍵的錢')&&L.includes('……可是要怎麼跟賣家講，我說不清楚。')&&L[L.length-1]==='週六法服。'&&G.flags.KAI_KB_ASK==='fafu',J(L));
    setDay(TD('Y1S2',7,6),9.5); G.zone='wancai';
    check('3. 第 7 週週六 9:00～12:00 走進萬才館',EVENTS.check(ev('ev_kai_keyboard_fafu')));
    L=await run('ev_kai_keyboard_fafu');
    check('3. 法服：三件事（BB_154 2-3 的字；說話的人換成社長）、「……三分鐘。」、手機筆記那一行；記 KAI_KEYBOARD',L.includes('二，賣家如果是店家，網購收到七天內，可以直接退。')&&L.includes('……三分鐘。')&&L[L.length-1]==='下次我要自己講得出來。'&&H.said.find(s=>s.t==='三件事。').who==='法服的社長'&&SOCIAL.has('kai','KAI_KEYBOARD'),J(who()));   /* 標籤寫全名「法服的社長」（AA_496 第 9 節第 6 點，2026-10-28；原本「社長」）*/
    G=fresh(TD('Y1S2',7,1),22.5,'dorm',{LAWCLUB_SAT_VISITS:1}); await run('ev_kai_keyboard',[0]); setDay(TD('Y1S2',7,6),12.6); X().phone(G); PHONE.tick(G);
    check('3. 選了週六法服沒去：12:30 阿凱私訊兩句、也記 KAI_KEYBOARD',J(msgs('p:kai'))===J(['你沒來 我自己去了 社長講了三分鐘','你們法律系的人原來要查這麼久'])&&SOCIAL.has('kai','KAI_KEYBOARD'),J(msgs('p:kai')));
    G=fresh(TD('Y1S2',8,1),22.5,'dorm',{}); X().phone(G); check('3. 錯過（第 7 週週四以前沒在房間）：不發生、不記 KAI_KEYBOARD',!EVENTS.check(ev('ev_kai_keyboard'))&&!SOCIAL.has('kai','KAI_KEYBOARD'));
    const bad=[]; for(const id of ['ev_kai_keyboard','ev_kai_keyboard_fafu']) for(const l of ev(id).dialogue){ const ts=[l.text].concat((l.choice||[]).map(c=>c.text)).filter(t=>typeof t==='string'); for(const t of ts){ const n=t.replace(/^「|」$/g,''); if(B154.indexOf(t)<0&&B154.indexOf(n)<0&&!['我問學長。','阿凱抱著鍵盤坐下。社長看了一眼少掉的那一顆。','請求什麼：'].includes(t)) bad.push(t); } }
    check('3. 每一句都在 BB_154（改的三處：「我問學長。」、旁白的學姊→社長、手機筆記「請求什麼：」）',bad.length===0,bad.join('｜'));
  });

  /* ===== 4 BB_171 大一跨年 Kevin ===== */
  await sec('4',async()=>{
    const ny=STORY.dayOfKey('2026-01-01'); const G=fresh(ny-1,23.9,'campus',{}); PHONE.join(G,'family_law','法律系直屬家族'); X().phone(G); PHONE.tick(G);
    check('4. 12/31 23:54 還沒有',!msgs('g:family_law').some(t=>/煙火/.test(t)));
    G.hour=24.02; X().phone(G); PHONE.tick(G); const M=msgs('g:family_law');
    check('4. 00:00 家族群組 Kevin：信義區的煙火照片（不點名大樓）＋新年快樂；學姊的第一張貼圖沒有（AA_218 刪）',M.includes('📷（信義區的煙火）')&&M.includes('新年快樂')&&!M.some(t=>/101|貼圖/.test(t)),J(M));
    const G2=fresh(ny,0.5,'campus',{}); X().phone(G2); PHONE.tick(G2); check('4. 不在家族群組的不收',!msgs('g:family_law').length);
  });
  H.done();
})();
