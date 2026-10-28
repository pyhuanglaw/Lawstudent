// AA_379 第 2-9、3 節＋AA_377 第 7 節（企劃線 d037c668；AA 2026-10-22 02:39～02:54 定稿；任務 AA379-SIS-Y2Y3-1021、AA377-Y3S2-FIX-1021）——不需要瀏覽器。
//   1 八場的出遊都有 alarm：跳過時間停在出發前 10 分鐘（BB 03:01 讀碼提醒；修改前 FAIL）
//   2 2-9：分手過的玩家 6/2 照收 Kevin 在家族群組那則；晚上那場不演
//   3 3-1：學姊 2026-02-04～02-13 平日 14:00～17:00 在兩點半 Café（「在看小說」）；2/1～2/3、2/14～2/22 在家
//   4 3-2：出國前最後一個週六——臺灣路線、熟悉以上 7/28 21:00 私訊 → 7/29 15:00 公館；選項兩種、交往中多兩句、結尾照 SIS_RIDE_ASK；不行＝「好。我自己去。」、18:00「買好了。」；日本、美國路線不演
//   5 3-4：口試那天（M9）2-5 訪談去過：沒交往「致謝裡有你。」「那一句『他講到這裡，停了很久』，我用在第四章了。」；交往中「第四章那一句，是你記的。」；沒去過都沒有；研究助理那句拿掉
//   6 AA_377 第 7 節：芷若大三下交往中的期末約會「禮拜四十點，等我下班。」（週四 22:00）
// 台詞從企劃檔讀（git show d037c668）逐句對。用法：node tests/aa379_sec3_unit.js
require('./alison.js');   /* AA_380：企劃線的舊稿還寫「小語」，讀稿的時候照匯入工具換成 Alison */
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/exchange3d.js','src/y34b3d.js','src/sis_grad3d.js','src/data/sis_y2y3_events.js','src/sis_y2y3_3d.js']) load(f);
let doc=''; try{ doc=cp.execSync('git show d037c668:"docs/story_planning/AA_379_學姊當主要女主角_補強_第一批.md"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){ doc=''; }
let doc377=''; { try{ const f=cp.execSync('git -c core.quotepath=false ls-tree -r --name-only d037c668 docs/story_planning',{cwd:H.ROOT,encoding:'utf8'}).split('\n').find(x=>/AA_377_/.test(x)); if(f) doc377=cp.execSync('git show d037c668:"'+f+'"',{cwd:H.ROOT,encoding:'utf8'}); }catch(e){} }
const inDoc=t=>doc.indexOf(t)>=0;
const J=JSON.stringify, ID='heroine_05', X=()=>typeof SISY23!=='undefined'?SISY23:null;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const setup=(key,h,zone,lv,flags)=>{ const G=H.fresh(key,h,zone||'dorm',Object.assign({met_sis:true,SIS_W1:true},flags||{})); if(lv) H[lv](ID); G.contacts=G.contacts||{}; G.contacts[ID]=G.day-30; return G; };
const rules=()=>{ const x=X(); if(x) x.phone(H.G); PHONE.tick(H.G); };
const at=(key,h)=>{ const G=H.G; G.day=H.D(key); G.hour=h; const w=CALENDAR.dateOf(G.day).wd; G.weekday=w===7?0:w; };
const dms=()=>H.msgs('p:'+ID);
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };
const dateSis=()=>{ H.G.flags['dating_'+ID]=true; ROM.get(H.G,ID).status='dating'; };
(async()=>{
  check('0. 讀得到稿（企劃線 d037c668 的 AA_379、AA_377）',!!doc&&!!doc377);
  /* ---- 1 alarm ---- */
  { setup('2026-09-21',20,'dorm','FAMILIAR'); at('2026-09-21',21.05); rules(); PHONE.answer(H.G,'sisy23_lab_ask',0); rules(); const q=OUT.get(H.G,'sisy23_lab');
    at('2026-09-22',10); const st=CLS.skipStops(GM,13);
    check('1. 研究室（9/22 12:20）的出遊有 alarm：10:00 跳過時間停在 12:00（出發 12:10 前 10 分鐘）',!!q&&q.alarm===true&&st.some(x=>Math.abs(x.h-12)<0.01&&/研究室/.test(x.why)),J(st));
    setup('2028-03-15',10,'dorm','FRIEND'); rules(); const r=OUT.get(H.G,'sisy23_result'); const st2=CLS.skipStops(GM,23);
    check('1. 放榜電話（3/15 21:30）也有 alarm：跳過時間停在 21:20',!!r&&r.alarm===true&&st2.some(x=>Math.abs(x.h-(21.5-1/6))<0.01),J(st2)); }
  /* ---- 2 2-9 分手過照收 Kevin ---- */
  { setup('2026-06-02',9,'dorm','FAMILIAR',{EX_heroine_05:true}); PHONE.join(H.G,'family_law','法律系直屬家族'); rules(); at('2026-06-02',12.2); rules();
    const got=H.msgs('g:family_law').includes('今天溫學姊生日🎂'); at('2026-06-02',19.5); H.G.zone='cafe';
    check('2. 分手過：6/2 12:10 家族群組照收「今天溫學姊生日🎂」（2-9）；晚上在 Café 那場不演',inDoc('「今天溫學姊生日🎂」照發')&&got&&!X().bdayTalkDue(H.G,'y1'),J({got})); }
  /* ---- 3 3-1 大一寒假作息 ---- */
  { const where=(k,h)=>{ const G=H.fresh(k,h,'campus',{met_sis:true}); const e=STORY.schedEnt(CHARACTERS[ID],G); const w=STORY.whereNow?STORY.whereNow(ID,G):null; return {e,w}; };
    const a=where('2026-02-05',15), b=where('2026-02-05',10), c=where('2026-02-02',15), d=where('2026-02-16',15), e=where('2026-02-07',15), f=where('2026-02-13',16.5);
    check('3. 2/5（四）15:00、2/13（五）16:30：兩點半 Café、act 標籤「在看小說」',inDoc('作息標籤「在看小說」')&&!!a.e&&a.e.zone==='cafe'&&a.e.label==='在看小說'&&!!f.e&&f.e.zone==='cafe',J({a:a.e,f:f.e}));
    check('3. 2/5 10:00、2/2 筆試、2/16 除夕、2/7（六）下午：在家',[b,c,d,e].every(x=>!!x.e&&x.e.away==='在家'),J([b,c,d,e].map(x=>x.e&&(x.e.away||x.e.zone)))); }
  /* ---- 4 3-2 出國前最後一個週六 ---- */
  { const L=SISY23_LINES;
    check('4. 私訊、選項、沒來的照片都在稿裡',['明天下午有空嗎。','我要去買行李箱的鎖。……順便走一走。','明天下午不行。','好。我自己去。','買好了。'].every(t=>inDoc('「'+t+'」'))&&J(L.preAsk)===J(['明天下午有空嗎。','我要去買行李箱的鎖。……順便走一走。'])&&J(L.preMissed)===J(['📷（一個普通的行李箱鎖）','買好了。']));
    const lines=(ev('ev_sis_predepart')||{dialogue:[]}).dialogue.filter(n=>n.text&&!n.aa512).map(n=>n.text);   /* 2026-10-28 AA_512 第 2 節第 4 點（企劃線 c444f0757）加的那一段（SIS_US_CELEB，帶 aa512）對 AA_512 的稿：tests/aa512_sis_b13_unit.js */
    check('4. 公館那場每一句都在稿裡',lines.length>=10&&lines.every(t=>inDoc(t)),J(lines.filter(t=>!inDoc(t))));
    setup('2028-07-28',20,'dorm','FAMILIAR'); rules(); at('2028-07-28',21.05); rules(); const m=PHONE.byAsk(H.G,'sisy23_pre_ask');
    check('4. 臺灣路線、熟悉：7/28（五）21:00 私訊兩則、選項「好。」「明天下午不行。」',J(dms())===J(L.preAsk)&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['好。','明天下午不行。']),J(dms()));
    PHONE.answer(H.G,'sisy23_pre_ask',0); rules(); const q=OUT.get(H.G,'sisy23_pre');
    check('4. 「好。」→ 7/29（六）15:00 公館的出遊（走路 15 分鐘、有 alarm）',!!q&&q.day===H.D('2028-07-29')&&q.h===15&&q.place==='公館'&&q.travelH===0.25&&q.alarm===true,J(q));
    let s=await play('ev_sis_predepart',[0]);
    check('4. 選「四個多月很快。」、沒按「我送妳」：騎樓、兩句傘、「嗯。……計畫本排到十二月了……」、「群組那則，是寫給大家的。」＋旁白；記 went',s[0]==='（騎樓下。她挑鎖挑了很久，最後買了最普通的那一個。）'&&s.includes('嗯。……計畫本排到十二月了，排完就覺得很快。')&&s.includes('群組那則，是寫給大家的。')&&s[s.length-1]==='（她看了你一眼，沒有再說。）'&&!s.includes('時差你不要算，我來算。')&&H.G.flags.SIS_PREDEPART==='went',J(s));
    setup('2028-07-29',15,'gongguan','FAMILIAR',{SIS_RIDE_ASK:'yes'}); dateSis(); s=await play('ev_sis_predepart',[1]);
    check('4. 交往中、按過「我送妳。我有車。」、選「會想回來嗎？」：「會想 Café 的熱水。……」→ 視訊、時差兩句 →「你說要載我。……早上八點，我家樓下。不要遲到。」',s.includes('會想 Café 的熱水。……那邊的飲水機要按很久。')&&s.indexOf('四個多月。……視訊我排好了，每個禮拜一次。')>s.indexOf('會想 Café 的熱水。……那邊的飲水機要按很久。')&&s.includes('時差你不要算，我來算。')&&s[s.length-1]==='你說要載我。……早上八點，我家樓下。不要遲到。'&&!s.includes('群組那則，是寫給大家的。'),J(s));
    setup('2028-07-28',20,'dorm','FAMILIAR'); rules(); at('2028-07-28',21.05); rules(); PHONE.answer(H.G,'sisy23_pre_ask',1); rules(); const a=dms().slice(-1)[0]; at('2028-07-29',18.1); rules();
    check('4. 「明天下午不行。」→「好。我自己去。」、沒有出遊；7/29 18:00「📷（一個普通的行李箱鎖）」「買好了。」、SIS_PREDEPART missed',a==='好。我自己去。'&&!OUT.get(H.G,'sisy23_pre')&&J(dms().slice(-2))===J(L.preMissed)&&H.G.flags.SIS_PREDEPART==='missed',J(dms()));
    const res=[]; for(const r of ['JP','US']){ setup('2028-07-28',20,'dorm','FAMILIAR',{EXCHANGE_ROUTE:r}); rules(); at('2028-07-28',21.05); rules(); res.push(!PHONE.byAsk(H.G,'sisy23_pre_ask')); }
    setup('2028-07-28',20,'dorm','FAMILIAR',{EX_heroine_05:true}); rules(); at('2028-07-28',21.05); rules(); res.push(!PHONE.byAsk(H.G,'sisy23_pre_ask'));
    check('4. 日本路線、美國路線、分手過：沒有這一場',res.every(x=>x),J(res)); }
  /* ---- 5 3-4 口試那天 ---- */
  { const e=ev('ev_sis_defense'); const txt=e?e.dialogue.filter(n=>n.text).map(n=>n.text):[];
    check('5. 研究助理那句拿掉（稿 3-4：研究助理不恢復）、三句都在稿裡',!!e&&!txt.includes('致謝裡有你。寫的是研究助理。')&&['致謝裡有你。','那一句『他講到這裡，停了很久』，我用在第四章了。','第四章那一句，是你記的。'].every(t=>inDoc('「'+t+'」')&&txt.includes(t)));
    setup('2029-05-29',14,'linze','FRIEND',{SIS_INTERVIEW:'went'}); let s=await play('ev_sis_defense');
    const i=s.indexOf('……好。我請大家喝飲料。販賣機的。');
    check('5. 沒交往、訪談去過：接在「……好。我請大家喝飲料。販賣機的。」後面兩句',i>=0&&s[i+1]==='致謝裡有你。'&&s[i+2]==='那一句『他講到這裡，停了很久』，我用在第四章了。'&&!s.includes('第四章那一句，是你記的。'),J(s));
    setup('2029-05-29',14,'linze','FRIEND',{SIS_INTERVIEW:'went'}); dateSis(); s=await play('ev_sis_defense'); const j=s.indexOf('你坐這裡就好。');
    check('5. 交往中、訪談去過：接在「你坐這裡就好。」後面「第四章那一句，是你記的。」',j>=0&&s[j+1]==='第四章那一句，是你記的。'&&!s.includes('致謝裡有你。'),J(s));
    setup('2029-05-29',14,'linze','FRIEND',{SIS_INTERVIEW:'missed'}); s=await play('ev_sis_defense');
    check('5. 訪談沒去：這幾句都不出',!s.includes('致謝裡有你。')&&!s.includes('第四章那一句，是你記的。')&&s.includes('……好。我請大家喝飲料。販賣機的。'),J(s)); }
  /* ---- 6 AA_377 第 7 節 ---- */
  { const g=TERMEND.gf('heroine_02','Y3S2'), g2=TERMEND.gf('heroine_02','Y2S1');
    check('6. 芷若大三下交往中的期末約會：「禮拜四十點，等我下班。」週四 22:00（稿 AA_377 第 7 節）；飯桌那句照留；別的學期照舊（大二上的邀約句 AA_456 1-5 換成「禮拜五十點。最後一個客人走了，我傳給你。」）',/禮拜四十點，等我下班。/.test(doc377)&&!!g&&g.invite==='禮拜四十點，等我下班。'&&g.wd===4&&g.h===22&&TERMEND_LINES.GF.heroine_02.tableByTerm.Y3S2[1]==='……六月的週五，你先全部給我。'&&!!g2&&g2.invite==='禮拜五十點。最後一個客人走了，我傳給你。',J({g,g2})); }
  H.done(); })().catch(e=>{ console.log('FAIL 例外',e&&e.stack); process.exit(1); });
