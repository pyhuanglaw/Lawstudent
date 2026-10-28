// AA_379 第 2 節（企劃線 30ab5142；任務 AA379-SIS-Y2Y3-1021）：學姊大二到大三的空窗補八場——不需要瀏覽器。
// 使用者 10-21 22:5x（經 AA）：「為什麼都只寫可昕　學姊才是真正的女主角!!!!!!」
// 檢查：0 讀稿（台詞逐字在稿裡）、index.html 接線、talkSis／talkCharacter 呼叫 SISY23.preTalk
//   1 2-1 9/21 21:00 私訊→「好。」排 9/22 12:20 研究室、演出、交往中多一段；回「明天中午有課。」→「好。我自己搬兩趟。」、18:00 照片「搬完了。」
//   2 2-2 11/17→11/18 19:00 法圖討論室；問「妳為什麼選這個題目？」記 asked；交往中「你坐第一排」在「好。我回去改。」之前；沒來 22:00「講完了。牆沒有意見。」
//   3 2-3 大二下第 5～10 週在 Café／法圖晚上第一次找她說話＝接在前面演（asked 的多一句、交往中最後一句）、記憶 SIS_TOPIC；第 4 週、熟悉不到朋友不演；第 11 週週三 21:00 台階
//   4 2-4 6/2 Kevin 群組；2026 Café、2027 法圖找她說話＝生日那場（2026／2027 各一句、三個選項）；交往中前一天約、法圖旁邊那家
//   5 2-5 10/15→10/16 09:00 法扶（朋友以上）；交往中資料夾那一句；沒來 12:30 那則　6 2-6 11/1～11/9 第一次說話＝接在前面演；一般、交往中；都沒遇到 11/11→11/12 12:20 台階
//   7 2-7 3/15 21:30 電話（朋友以上）：一般、交往中美國路線「我們同一班」、其他路線「你要來送我」　8 熟悉以下、前任：八場都不出現
// 修改前（開發分支 e8c4ce7a）：沒有 SISY23（第 0 項起全部 FAIL）。用法：node tests/aa379_sis_y2y3_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
const ok1=load('src/data/sis_y2y3_events.js'), ok2=load('src/sis_y2y3_3d.js');
let doc=''; try{ doc=cp.execSync('git show 5ef4e291:"docs/story_planning/AA_379_學姊當主要女主角_補強_第一批.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }   /* 白名單上的 AA_379 是 5ef4e291：d037c668 加 2-6 更正（指到 AA_386 第 2 節：聽過她提美國的，那一句換成兩句），前面各節沒動 */
const inDoc=t=>doc.indexOf(t)>=0;
let doc392=''; try{ doc392=cp.execSync('git show e81a1afe1:"docs/story_planning/AA_392_學姊第六批_說了沒發生與每週視訊.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc392=''; }   /* AA_392 第 5 節的第二次訪談也放在這兩個檔（同一套私訊約出遊）*/
let doc509=''; try{ doc509=cp.execSync('git show 28f981438:"docs/story_planning/AA_509_女主角自己的生活_大四上與寒假.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc509=''; }   /* AA_509 0-2 第 4 點（白名單 28f981438）：論文「第三章」那一句改「第四章」（她上飛機前看完第三章）*/
const CH4='八月走，十二月回來。論文的第四章，要在那邊寫。', CH4_SRC='「八月走，十二月回來。論文的第三章，要在那邊寫。」改「……論文的第四章，要在那邊寫。」';
const J=JSON.stringify, ID='heroine_05', X=()=>typeof SISY23!=='undefined'?SISY23:null;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const setup=(key,h,zone,lv,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); if(lv) H[lv](ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-30; return G; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); PHONE.tick(H.G); };
const at=(key,h)=>{ const G=H.G; G.day=H.D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const dms=()=>H.msgs('p:'+ID);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };
const dateSis=()=>{ H.G.flags['dating_'+ID]=true; ROM.get(H.G,ID).status='dating'; };
(async()=>{
  /* ---- 0 ---- */
  check('0. 讀稿（企劃線 5ef4e291 AA_379：30ab5142 的第 2 節沒動，多了 2-9、第 3 節、2-6 更正）',doc.length>5000&&inDoc('## 2. 第二批：大二到大三的空窗'));
  check('0. 新檔載得到：SISY23、SISY23_EVENTS（八場 12 筆：說話前接演的兩段、台階兩版、生日四筆；3-2 公館 1 筆＝13；AA_392 第 5 節第二次訪談＝14）',ok1&&ok2&&!!X()&&Array.isArray(SISY23_EVENTS)&&SISY23_EVENTS.length===14,J({ok1,ok2,n:typeof SISY23_EVENTS!=='undefined'&&SISY23_EVENTS.length}));
  if(!X()){ H.done(); return; }
  const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8'), st=fs.readFileSync(path.join(H.ROOT,'src/story3d.js'),'utf8');
  check('0. index.html 接在 y3fill3d.js 後面；talkSis、talkCharacter 都先問 SISY23.preTalk',/y3fill3d\.js[^\n]*\n<script src="src\/data\/sis_y2y3_events\.js[^\n]*\n<script src="src\/sis_y2y3_3d\.js/.test(html)&&(st.match(/SISY23\.preTalk\) await SISY23\.preTalk\(GM\)/g)||[]).length===2);
  const LATER=['（她撕了一張便條，寫完貼在桌燈上：「中午十二點二十以後，我在這裡。」）','今天溫學姊生日🎂🎂 去年一個蛋糕，今年兩個。'];   /* 第二句：2027 那一則 Kevin 的生日貼文（AA_461 第 2 節，tests/aa461_y2s2_unit.js 對稿）*/   /* 後來的稿改過的：AA_392 第 4 節乙（研究室走不到，便條寫總圖三樓）→ AA_399 1-2（10-23 研究室 5F 開了）回到甲案原句 */
  const allTxt=J(SISY23_LINES)+J(SISY23_EVENTS), quoted=[...allTxt.matchAll(/text":"([^"]+)"/g)].map(m=>m[1]).concat(Object.values(SISY23_LINES).flat().filter(x=>typeof x==='string'));
  /* 2026-10-28 AA_512 第 2 節第 4 點（企劃線 c444f0757）：ev_sis_predepart 加的那一段（帶 aa512 的行、選項）對 AA_512 的稿（tests/aa512_sis_b13_unit.js），這裡不算 */
  const AA512T=new Set(); for(const e of SISY23_EVENTS) for(const l of (e.dialogue||[])){ if(l&&l.aa512&&l.text) AA512T.add(l.text); if(l&&l.choice) for(const c of l.choice) if(c&&c.aa512) AA512T.add(c.text); }
  const notIn=quoted.filter(t=>!AA512T.has(t)&&!inDoc(t.replace('{name}','{name}'))&&!['法圖・討論室','法圖外面的台階','總圖門口的台階','法圖旁邊的簡餐','電話','霖澤館・研究室','法扶・臺北的辦公室','便利商店門口的桌子','公館・騎樓'].includes(t)&&!LATER.includes(t)&&!(doc392&&doc392.indexOf(t)>=0)&&!['社區活動中心・小房間','社區活動中心門口'].includes(t)&&!(t===CH4&&doc509.indexOf(CH4_SRC)>=0));
  check('0. 每一句台詞都在稿裡（一字不差；地點字幕除外）',!notIn.length,J(notIn));
  /* ---- 1 2-1 研究室 ---- */
  { setup('2026-09-21',20,'dorm','FAMILIAR'); rules(); const a=dms().length; at('2026-09-21',21.05); rules(); const m=PHONE.byAsk(H.G,'sisy23_lab_ask');
    check('1. 9/21（一）21:00 私訊兩則；回覆「好。」「明天中午有課。」（20:00 還沒有）',a===0&&J(dms())===J(['明天中午有空嗎。','研究室分到位子了。書有兩箱，電梯在修。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天中午有課。']),J([a,dms()]));
    PHONE.answer(H.G,'sisy23_lab_ask',0); rules(); const q=OUT.get(H.G,'sisy23_lab');
    check('1. 「好。」＝9/22 12:20 霖澤館・研究室（出遊）',!!q&&q.day===H.D('2026-09-22')&&Math.abs(q.h-(12+20/60))<1e-6&&q.ev==='ev_sis_lab_desk',J(q));
    let L=await play('ev_sis_lab_desk',[1]);
    check('1. 研究室：八張桌子、靠門的位子、照顏色排書；「（幫她把最重的那一排推進去）」→「……謝謝。你比電梯可靠。」；SIS_LAB_DESK went',L[0]==='（研究室有八張桌子。她的在門邊，門一開就撞到椅背。）'&&L.includes('……也好。誰來了我都知道。')&&L.includes('……謝謝。你比電梯可靠。')&&!L.includes('……你的。')&&H.G.flags.SIS_LAB_DESK==='went',J(L));
    at('2026-09-22',18.1); rules(); check('1. 去了：18:00 沒有「搬完了。」',!dms().includes('搬完了。')); }
  { setup('2026-09-21',20,'dorm','FAMILIAR'); dateSis(); at('2026-09-21',21.05); rules(); PHONE.answer(H.G,'sisy23_lab_ask',0); const L=await play('ev_sis_lab_desk',[0]);
    check('1. 交往中：最後多一段便條「中午十二點二十以後，我在這裡。」（AA_399 1-2 甲案）「……你的。」',L.includes('（她撕了一張便條，寫完貼在桌燈上：「中午十二點二十以後，我在這裡。」）')&&L[L.length-1]==='……你的。'&&L.includes('照顏色好找。照作者，我會一直想要不要調整。'),J(L)); }
  { setup('2026-09-21',20,'dorm','FAMILIAR'); at('2026-09-21',21.05); rules(); PHONE.answer(H.G,'sisy23_lab_ask',1); rules(); const a=dms().slice(-1)[0];
    at('2026-09-22',18.05); rules();
    check('1. 「明天中午有課。」→「好。我自己搬兩趟。」、沒有出遊；9/22 18:00「📷（排好的書架）」「搬完了。」、SIS_LAB_DESK missed',a==='好。我自己搬兩趟。'&&!OUT.get(H.G,'sisy23_lab')&&J(dms().slice(-2))===J(['📷（排好的書架）','搬完了。'])&&H.G.flags.SIS_LAB_DESK==='missed',J(dms())); }
  /* ---- 2 2-2 seminar ---- */
  { setup('2026-11-17',20,'dorm','FAMILIAR'); at('2026-11-17',21.05); rules(); const m=PHONE.byAsk(H.G,'sisy23_sem_ask');
    check('2. 11/17（二）21:00 私訊兩則、回覆「好。」「明天晚上不行。」',J(dms())===J(['明天晚上七點，法圖的討論室。','我要練一次 seminar 的報告。需要一個不是法研所的人聽。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天晚上不行。']),J(dms()));
    PHONE.answer(H.G,'sisy23_sem_ask',0); rules(); const q=OUT.get(H.G,'sisy23_sem'); check('2. 11/18（三）19:00 法圖・討論室',!!q&&q.day===H.D('2026-11-18')&&q.h===19);
    const L=await play('ev_sis_seminar_y2',[2]);
    check('2. 問「妳為什麼選這個題目？」：「……這是最後才要問的問題。你先問了。」「下次再回答你。我還沒想好怎麼講。」→「好。我回去改。……你先回宿舍，很晚了。」；asked',L.includes('……這是最後才要問的問題。你先問了。')&&L.includes('下次再回答你。我還沒想好怎麼講。')&&L[L.length-1]==='好。我回去改。……你先回宿舍，很晚了。'&&H.G.flags.SIS_SEMINAR_Y2==='asked',J(L)); }
  { setup('2026-11-17',20,'dorm','FAMILIAR'); dateSis(); at('2026-11-17',21.05); rules(); PHONE.answer(H.G,'sisy23_sem_ask',0); const L=await play('ev_sis_seminar_y2',[0]);
    const i=L.indexOf('你坐第一排，我比較不會看錯地方。'), j=L.indexOf('好。我回去改。……你先回宿舍，很晚了。');
    check('2. 交往中：「你坐第一排，我比較不會看錯地方。」在「好。我回去改。」之前；「中間那段，數字太多了。」→劃掉一整段；went',i>=0&&j===i+1&&L.includes('（在講稿上劃掉一整段）……我也覺得。只是捨不得。')&&H.G.flags.SIS_SEMINAR_Y2==='went',J(L)); }
  { setup('2026-11-17',20,'dorm','FAMILIAR'); at('2026-11-17',21.05); rules(); PHONE.answer(H.G,'sisy23_sem_ask',1); rules(); const a=dms().slice(-1)[0]; at('2026-11-18',22.05); rules();
    check('2. 「明天晚上不行。」→「好。那我對著牆講。」；11/18 22:00「講完了。牆沒有意見。」、missed',a==='好。那我對著牆講。'&&dms().slice(-1)[0]==='講完了。牆沒有意見。'&&H.G.flags.SIS_SEMINAR_Y2==='missed',J(dms())); }
  /* ---- 3 2-3 想寫的東西 ---- */
  const tdy=(term,w,wd)=>STORY.termDayIn(term,w,wd), key=d=>{ const x=CALENDAR.dateOf(d); return x.y+'-'+String(x.m).padStart(2,'0')+'-'+String(x.d).padStart(2,'0'); };
  { const d6=tdy('Y2S2',6,1), d4=tdy('Y2S2',4,1);
    setup(key(d4),20,'cafe','FRIEND'); const a=X().preTalkEv(H.G);
    setup(key(d6),20,'cafe','FAMILIAR'); const b=X().preTalkEv(H.G);
    setup(key(d6),15,'cafe','FRIEND'); const c=X().preTalkEv(H.G);
    setup(key(d6),20,'cafe','FRIEND',{SIS_SEMINAR_Y2:'asked'}); const e=X().preTalkEv(H.G); H.said=[]; H.picks=[1]; await X().preTalk(GM); const L=H.said.map(s=>s.t); const f=X().preTalkEv(H.G);
    check('3. 大二下第 6 週週一 20:00 在 Café（朋友以上）：接在前面演；第 4 週、熟悉不到朋友、白天都不演',a===null&&b===null&&c===null&&e==='ev_sis_topic',J({a,b,c,e}));
    check('3. 「我想寫的東西，找到了。」…「債務清理案件的法律扶助。」；問過為什麼的多「你上次問我為什麼。……我想好怎麼講了。」；「那個阿姨後來呢？」→「……我不知道。那天以後，就沒再見過她。」；記憶 SIS_TOPIC、演過一次就不再',L[0]==='我想寫的東西，找到了。'&&L.includes('你上次問我為什麼。……我想好怎麼講了。')&&L.includes('我想知道『很久』是多久。……還有為什麼要那麼久。')&&L.includes('……我不知道。那天以後，就沒再見過她。')&&!L.includes('我爸媽還不知道。……他們會問，寫這個以後要做什麼。')&&SOCIAL.has(ID,'SIS_TOPIC')&&f===null,J(L)); }
  { const d6=tdy('Y2S2',6,3); setup(key(d6),19.5,'lawlib','FRIEND'); dateSis(); H.said=[]; H.picks=[0]; await X().preTalk(GM); const L=H.said.map(s=>s.t);
    check('3. 交往中（法圖週三晚上）：沒問過的沒有那一句；最後「我爸媽還不知道。……」',!L.includes('你上次問我為什麼。……我想好怎麼講了。')&&L.includes('還沒。所以要寫兩年。')&&L[L.length-1]==='我爸媽還不知道。……他們會問，寫這個以後要做什麼。',J(L)); }
  { const d11=tdy('Y2S2',11,3); setup(key(d11),10,'dorm','FRIEND'); rules(); const a=!!OUT.get(H.G,'sisy23_topic'); at(key(d11),21.02); rules(); const q=OUT.get(H.G,'sisy23_topic');
    check('3. 第 5～10 週都沒遇到：第 11 週週三 21:00「法圖外面的台階。等你十分鐘。」→ 21:10 台階的出遊（訊息到了才排）',!a&&dms().slice(-1)[0]==='法圖外面的台階。等你十分鐘。'&&!!q&&q.ev==='ev_sis_topic_steps'&&Math.abs(q.h-(21+1/6))<1e-6,J(q));
    const L=await play('ev_sis_topic_steps',[0]); check('3. 台階那一版同一段（記憶 SIS_TOPIC）',L[0]==='我想寫的東西，找到了。'&&SOCIAL.has(ID,'SIS_TOPIC')); }
  /* ---- 4 2-4 生日 ---- */
  { setup('2026-06-02',9,'dorm','FAMILIAR'); PHONE.join(H.G,'family_law','法律系直屬家族'); rules(); at('2026-06-02',12.2); rules();
    check('4. 6/2 12:10 家族群組 Kevin「今天溫學姊生日🎂」',H.msgs('g:family_law').includes('今天溫學姊生日🎂'),J(H.msgs('g:family_law')));
    at('2026-06-02',19.5); H.G.zone='cafe'; const due=X().bdayTalkDue(H.G,'y1'), ck=EVENTS.check(ev('ev_sis_bday_y1')); const L=await play('ev_sis_bday_y1',[1]);
    check('4. 2026 晚上在 Café 找她說話：蛋糕、「群組那則看到了吧。Kevin 每年都發。」「下禮拜畢業。……」；茶葉→「妳保溫瓶的味道。」→「……好。」；SIS_BDAY_Y1 tea',due&&ck&&L[0]==='（她在讀書。保溫瓶旁邊多了一小盒蛋糕，還沒拆。）'&&L.includes('下禮拜畢業。……之後還是在這裡讀書，只是換一張學生證。')&&L.includes('妳保溫瓶的味道。')&&L.includes('（她收進包包）')&&H.G.flags.SIS_BDAY_Y1==='tea',J(L)); }
  { setup('2027-06-02',19.5,'lawlib','FAMILIAR',{SIS_LAB_DESK:'went'}); const due=X().bdayTalkDue(H.G,'y2'), wrong=(H.G.zone='cafe',X().bdayTalkDue(H.G,'y2')); H.G.zone='lawlib'; const L=await play('ev_sis_bday_y2',[0]);
    check('4. 2027（週三法圖）：研究室去過的「碩一過完一年了。……我換了一個坐墊。」；「生日快樂。」→「謝謝。……蛋糕分你一半，我吃不完。」；在 Café 不算',due&&!wrong&&L.includes('碩一過完一年了。研究室那張靠門的椅子，我換了一個坐墊。')&&L.includes('謝謝。……蛋糕分你一半，我吃不完。')&&H.G.flags.SIS_BDAY_Y2==='there',J(L)); }
  { setup('2027-06-01',18,'dorm','FAMILIAR'); dateSis(); rules(); at('2027-06-01',21.05); rules(); const m=dms().slice(-2); rules(); const q=OUT.get(H.G,'sisy23_bday_y2');
    check('4. 交往中：前一天 21:00「明天我生日。」「晚上七點，法圖旁邊那家。我訂了。」→ 6/2 19:00 的出遊；說話的那一場不演',J(m)===J(['明天我生日。','晚上七點，法圖旁邊那家。我訂了。'])&&!!q&&q.day===H.D('2027-06-02')&&q.h===19&&(at('2027-06-02',19.5),H.G.zone='lawlib',!X().bdayTalkDue(H.G,'y2')),J({m,q}));
    const L=await play('ev_sis_bday_date_y2',[0]);
    check('4. 交往中那場：「我自己訂的。……」、「生日快樂。」→「謝謝。……你今天穿得比平常好看。」、最後「（回去的路上，她走得比平常慢。）」',L[0]==='我自己訂的。我知道你會想訂，可是你會訂錯家。'&&L.includes('謝謝。……你今天穿得比平常好看。')&&L[L.length-1]==='（回去的路上，她走得比平常慢。）'&&!L.includes('碩一過完一年了。研究室那張靠門的椅子，我換了一個坐墊。'),J(L)); }
  { setup('2026-06-02',19.5,'cafe','FAMILIAR'); at('2026-06-03',9); rules(); check('4. 沒找她：隔天記 missed、沒有台詞',H.G.flags.SIS_BDAY_Y1==='missed'&&!dms().length); }
  /* ---- 5 2-5 訪談 ---- */
  { setup('2027-10-15',20,'dorm','FAMILIAR'); at('2027-10-15',21.05); rules(); const a=dms().length;
    setup('2027-10-15',20,'dorm','FRIEND'); at('2027-10-15',21.05); rules(); const m=PHONE.byAsk(H.G,'sisy23_iv_ask');
    check('5. 10/15（五）21:00 私訊兩則（朋友以上；熟悉的沒有）',a===0&&J(dms())===J(['明天早上九點，我要去訪談一位法扶的律師。','需要一個人幫我做筆記。你打字比我快。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天早上不行。']),J(dms()));
    PHONE.answer(H.G,'sisy23_iv_ask',0); rules(); const q=OUT.get(H.G,'sisy23_iv'); dateSis(); const L=await play('ev_sis_interview',[0]);
    check('5. 10/16 09:00 法扶（捷運）：「你多寫了一句：『他講到這裡，停了很久。』」；「在想一個當事人。他沒說是誰。」「……我也沒問。」；交往中資料夾「祐廷記的」；記憶 SIS_INTERVIEW',!!q&&q.h===9&&q.day===H.D('2027-10-16')&&L.includes('你多寫了一句：『他講到這裡，停了很久。』')&&L.includes('……我也沒問。')&&L.includes('（她把你的筆記存進雲端，資料夾的名字是「祐廷記的」。）')&&SOCIAL.has(ID,'SIS_INTERVIEW')&&H.G.flags.SIS_INTERVIEW==='went',J(L)); }
  { setup('2027-10-15',20,'dorm','FRIEND'); at('2027-10-15',21.05); rules(); PHONE.answer(H.G,'sisy23_iv_ask',1); rules(); const a=dms().slice(-1)[0]; at('2027-10-16',12.6); rules();
    check('5. 「明天早上不行。」→「好。我錄音。」；12:30「訪談完了。錄音有雜音，我自己聽了兩遍。」',a==='好。我錄音。'&&dms().slice(-1)[0]==='訪談完了。錄音有雜音，我自己聽了兩遍。'&&H.G.flags.SIS_INTERVIEW==='missed'); }
  /* ---- 6 2-6 明年夏天 ---- */
  { setup('2027-11-03',19.5,'lawlib','FAMILIAR'); const e=X().preTalkEv(H.G); H.said=[]; H.picks=[0]; await X().preTalk(GM); const L=H.said.map(s=>s.t);
    check('6. 11/3（三）晚上在法圖第一次找她說話：「明年夏天，我想去美國待一個學期。研究交換。」…「計畫本上寫了很久。今天才決定要跟人說。」；「去啊。」→「嗯。」（她把計畫本闔上）「……你說得好簡單。」；SIS_US_TOLD here',e==='ev_sis_us_told'&&L[0]==='明年夏天，我想去美國待一個學期。研究交換。'&&L.includes('計畫本上寫了很久。今天才決定要跟人說。')&&J(L.slice(-3))===J(['嗯。','（她把計畫本闔上）','……你說得好簡單。'])&&H.G.flags.SIS_US_TOLD==='here'&&SOCIAL.has(ID,'SIS_US_TOLD'),J(L)); }
  { setup('2027-11-04',20,'cafe','FAMILIAR'); dateSis(); H.said=[]; H.picks=[1]; await X().preTalk(GM); const L=H.said.map(s=>s.t);
    check('6. 交往中：「你們系的交換名單，美國那間我查過了。……」「你如果去，我們同一班飛機。」；「（握住她的手）」→「（她沒有說話。手翻過來，握回去。）」；沒有「計畫本上寫了很久」',L.includes('你如果去，我們同一班飛機。')&&L[L.length-1]==='（她沒有說話。手翻過來，握回去。）'&&!L.includes('計畫本上寫了很久。今天才決定要跟人說。'),J(L)); }
  { setup('2027-11-10',20,'cafe','FAMILIAR'); const a=X().preTalkEv(H.G); setup('2027-11-11',10,'dorm','FAMILIAR'); rules(); at('2027-11-11',21.05); rules(); const q=OUT.get(H.G,'sisy23_us');
    check('6. 11/10 以後不再當面演；11/11 21:00「明天中午，總圖門口的台階。」→ 11/12 12:20 台階',a===null&&dms().slice(-1)[0]==='明天中午，總圖門口的台階。'&&!!q&&q.day===H.D('2027-11-12')&&Math.abs(q.h-(12+20/60))<1e-6,J(q));
    const L=await play('ev_sis_us_told_steps',[1]); check('6. 台階那一版：同一段（「那妳會回來吧？」→「十二月。……我不會改。」）；SIS_US_TOLD steps',L.includes('十二月。回程的日子，計畫本上寫好了。我不會改。')&&H.G.flags.SIS_US_TOLD==='steps'); }
  /* ---- 7 2-7 結果 ---- */
  { setup('2028-03-15',10,'dorm','FAMILIAR'); rules(); const a=OUT.get(H.G,'sisy23_result');
    setup('2028-03-15',10,'dorm','FRIEND'); rules(); const q=OUT.get(H.G,'sisy23_result');
    check('7. 3/15（三）21:30 她打電話來（朋友以上；那一天一開始就排好；熟悉的沒有）',!a&&!!q&&q.h===21.5&&q.place==='電話'&&q.call===true&&q.verb==='接起來',J(q));
    const L=await play('ev_sis_us_result',[0]);
    check('7. 一般：「……上了。」「信是下午來的。……才打給你。」「八月二號的飛機。……」；「恭喜。」→「嗯。……我以為我會比較高興。……」；SIS_US_RESULT call',J(L.slice(0,3))===J(['……上了。','信是下午來的。我看了好幾遍，確定沒有看錯，才打給你。','八月二號的飛機。……還沒訂，先把日子想好。'])&&L.includes('嗯。……我以為我會比較高興。現在只想到，要在那邊待四個多月。')&&H.G.flags.SIS_US_RESULT==='call',J(L)); }
  { setup('2028-03-15',21.5,'dorm','FRIEND',{EXCHANGE_ROUTE:'US'}); dateSis(); const a=await play('ev_sis_us_result',[1]);
    setup('2028-03-15',21.5,'dorm','FRIEND',{EXCHANGE_ROUTE:'JP'}); dateSis(); const b=await play('ev_sis_us_result',[0]);
    check('7. 交往中：美國路線「八月二號。我們同一班。」、「我現在過去。」→「很晚了。……明天中午，研究室。」；其他路線「八月二號。……你要來送我。」、「恭喜。」→「……你先不要掛。……」',a.includes('八月二號。我們同一班。')&&a.includes('很晚了。……明天中午，研究室。')&&!a.includes('信是下午來的。我看了好幾遍，確定沒有看錯，才打給你。')&&b.includes('八月二號。……你要來送我。')&&b.includes('嗯。……你先不要掛。我想再聽一下你那邊的聲音。'),J({a,b})); }
  /* ---- 8 熟悉以下、前任 ---- */
  { const res=[];
    setup('2026-09-21',21.05,'dorm','FAMILIAR',{met_sis:false}); rules(); res.push(dms().length===0);
    setup('2026-09-21',21.05,'dorm',null); H.rel(ID,10,0,0); rules(); res.push(dms().length===0);
    setup('2026-09-21',21.05,'dorm','FAMILIAR',{EX_heroine_05:true}); rules(); res.push(dms().length===0);
    setup('2027-11-03',19.5,'lawlib','FAMILIAR',{EX_heroine_05:true}); res.push(X().preTalkEv(H.G)===null);
    setup('2028-03-15',10,'dorm','FRIEND',{EX_heroine_05:true}); rules(); res.push(!OUT.get(H.G,'sisy23_result'));
    check('8. 不認識、熟悉以下、前任：私訊、說話前那一段、電話都沒有',res.every(x=>x),J(res)); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
