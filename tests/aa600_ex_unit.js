// AA_600 分手後不主動聯絡（企劃線 031414cad；任務 AA600-EX-NO-CONTACT-1102）＋AA_591 整合九件（AA 2026-11-02 21:25，企劃線 43d27cd80）——不需要瀏覽器。
//   使用者 11-02：以安「分手，不會主動聯絡」；學姊「如果分手他不太會理我，就算主動找他，也要很多次才回」「不會先說」；挽回選「祐廷先開口」。
//   S 系統層 S1～S11　A 以安 A1～A24　B 學姊 B1～B33　R 挽回改稿（第 3 節）　N AA_591 九件
//   每一處都有「前任收不到／不演」的檢查；能跑的直接跑程式（V6EX、STORY、INV、HASK、TERMEND、FEED、MSG、SISB4、事件台詞），
//   排在各學期的私訊（一則一個日子、要一大串前置的）檢查那一段條件真的擋了前任（ROM.exOf／V6EX.noContact 在那一行的條件裡）。
// 修改前（int/m591 4d84930c4）：沒有 ROM.exOf、V6EX.noContact——S、A、B 大多 FAIL。用法：node tests/aa600_ex_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const load=f=>{ try{ let s=fs.readFileSync(path.join(H.ROOT,f),'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,(m,n)=>'globalThis.'+n+'='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e&&e.message||e).slice(0,120)); } };
global.Z3={ZONES:{}};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/needed_msgs.js','src/data/v6ex_lines.js','src/v6ex3d.js','src/data/heroine_asks.js','src/heroine_asks3d.js',
  'src/data/sis_b4_events.js','src/sis_b4_3d.js','src/data/sis_b10_events.js','src/sis_b10_3d.js','src/data/sis_b16_events.js','src/data/feed_y1s1.js','src/data/feed_y1s2.js','src/feed3d.js',
  'src/data/jp_events.js','src/data/r2y4a_events.js','src/data/us_blank_lines.js','src/data/bbpack_events.js','src/data/y3fill_events.js']) if(fs.existsSync(path.join(H.ROOT,f))) load(f);
const RAW=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const AN='heroine_01', SIS='heroine_05', ZR='heroine_02';
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const at=(k,h)=>{ const G=H.G; G.day=typeof k==='number'?k:D(k); G.hour=h; G.weekday=wdOf(G.day); };
const fresh=(key,h,zone)=>{ const G=H.fresh(key,h,zone||'dorm'); G.outings=[]; G.acts=G.acts||{att:{}}; G.contacts=G.contacts||{}; for(const id of [AN,SIS,ZR]){ SOCIAL.remember(id,'FIRST_MET',''); G.contacts[id]=G.day; } G.flags.met_sis=true; G.flags.met_an=true; G.flags.SIS_CONTACTED=true; return G; };
const date=id=>{ H.CLOSE(id); return ROM.start(H.G,id); };
const breakup=id=>{ date(id); return ROM.end(H.G,id,'apart_talk'); };
const said=()=>H.said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const evText=id=>J((ev(id)||{}).dialogue||null);
/* 跑一段事件的台詞（EVENTS.runLines）：回傳說了哪些字 */
const play=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); const e=ev(id); if(!e) return null; await EVENTS.runLines(e.dialogue,e); return said(); };
/* 某一個函式（或物件的一行）的原始碼：用來確認排在各學期的私訊條件裡有擋前任 */
const body=(f,start,len)=>{ const s=RAW(f), i=s.indexOf(start); return i<0?'':s.slice(i,i+(len||900)); };
const EXG=/ROM\.exOf|V6EX\.noContact|exAny|exS\(G\)|exSis\(G\)|exAn\b/;
const guards=(f,start,len)=>EXG.test(body(f,start,len));

(async()=>{
check('0. 檔案都載得到',!loadErr.length,J(loadErr));
check('0. ROM.exOf、V6EX.noContact、V6EX.sisExMsg／sisExInvite／sisExTalk 都在',typeof ROM.exOf==='function'&&typeof V6EX!=='undefined'&&typeof V6EX.noContact==='function'&&typeof V6EX.sisExMsg==='function'&&typeof V6EX.sisExInvite==='function'&&typeof V6EX.sisExTalk==='function');

/* ======================= S 系統層 ======================= */
await sec('S1',async()=>{ const G=fresh('2027-03-10',20);
  check('S1. 交往中：以安、學姊都不是 noContact',(date(AN),date(SIS),!V6EX.noContact(G,AN)&&!V6EX.noContact(G,SIS)));
  ROM.end(G,AN,'apart_talk'); ROM.end(G,SIS,'apart_talk');
  check('S1. 分手當天起：以安、學姊 noContact（ROM.exOf）',V6EX.noContact(G,AN)&&V6EX.noContact(G,SIS)&&ROM.exOf(G,AN)&&ROM.exOf(G,SIS));
  at(D('2027-03-10')+400,20);
  check('S1. 一年以後（冷卻期早就過了）照樣 noContact——不是「下學期恢復」',V6EX.noContact(G,AN)&&V6EX.noContact(G,SIS)&&!V6EX.cool(G,AN));
  check('S1. coolSkip：以安、學姊前任一律跳過（每一次都 true）',[1,2,3,4].every(i=>V6EX.coolSkip(G,AN,'dp','x'+i)===true)&&V6EX.coolSkip(G,SIS,'need','y')===true);
  { const ok=PHONE.at(G,G.day,21,[{th:'p:'+AN,from:AN,text:'測試'}],'dp_test_1_1'), ok2=PHONE.at(G,G.day,21,[{th:'p:'+SIS,from:SIS,text:'測試'}],'dp_test2_1_1');
    check('S1. 手機小事（dp_）她傳的：前任不送（以安、學姊）',ok===false&&ok2===false); }
  date(AN); check('S1. 重新交往＝不擋',!V6EX.noContact(G,AN));
  /* 其他五位照 AA_434 4-3（一學期）：芷若前任不是 noContact */
  breakup(ZR); check('S1. 芷若前任不在 AA_600 範圍（照一學期的冷卻）',!V6EX.noContact(G,ZR));
  /* paused、friend_after_catch 也算分手後 */
  const G2=fresh('2027-03-10',20); date(AN); G2.flags.dating_heroine_01=false; ROM.get(G2,AN).status='paused';
  check('S1. status paused（等你說清楚）也算分手後',ROM.exOf(G2,AN)&&V6EX.noContact(G2,AN));
  ROM.get(G2,AN).status='friend_after_catch'; check('S1. friend_after_catch 也算',V6EX.noContact(G2,AN)); });

await sec('S2',async()=>{ const G=fresh('2026-09-13',20); H.FRIEND(AN); H.FRIEND(SIS);
  const d=D('2026-09-13'); const L0=STORY.neededPick(G,d).map(e=>e.id);
  const G1=fresh('2026-09-13',20); H.FRIEND(AN); breakup(AN); H.FRIEND(AN); const L1=STORY.neededPick(G1,d).map(e=>e.id);
  check('S2. 主線 4 週日訊息：沒分手的有以安 an_lib，前任沒有（每一週都不送）',L0.includes('an_lib')&&!L1.some(x=>/^an_/.test(x)),J({L0,L1}));
  G1.needed={batches:[{d:d-7,ids:[['an_lib',AN]],ans:[],closedAt:null,said:{}}],missLast:{},shown:{}};
  at(d+1,15); check('S2. 「沒回的那一句」前任不演（neededMissLine＝null）',STORY.neededMissLine(G1,AN)==null);
  check('S2. 學姊 sis_list：neededAt／neededPick 都走 noContact（程式裡有擋）',guards('src/story3d.js','S.neededAt=function',1400)&&/noContact\(G,id\)\) return null/.test(body('src/story3d.js','S.neededMissLine=function',400))); });

await sec('S3',async()=>{ const G=fresh('2026-03-10',21); H.CLOSE(AN); breakup(AN); H.CLOSE(AN); at('2027-03-09',21);   /* 分手一年以後（冷卻期早就過了）*/
  check('S3. INV.anAsk：前任不約（false）',INV.anAsk(G)===false&&/INV\.anAsk=function\(G\)\{ if\(G&&G\.flags&&\(S\.cool\(G,AN\)\|\|S\.noContact\(G,AN\)\)\) return false;/.test(RAW('src/v6ex3d.js')));
  { const G0=fresh('2027-03-09',21); H.CLOSE(AN); const iv=INV.offer(G0,AN,'noodle',G0.day+2,21.5,'禮拜四讀書會完要不要去吃飯？我想吃巷子那家。'); check('S3. 對照：沒分手的以安，她那一方的邀約發得出去',!!iv,J(iv&&iv.state)); }
  H.G=G; SOCIAL.bind(G);
  check('S3. 她那一方的邀約（INV.offer）前任不發（冷卻期過了也一樣）',INV.offer(G,AN,'noodle',G.day+2,21.5,'禮拜四讀書會完要不要去吃飯？我想吃巷子那家。')==null);
  const n0=(G.invites||[]).length; check('S3. 沒有留下邀約',(G.invites||[]).filter(iv=>iv.who===AN).length===0,String(n0)); });

await sec('S4',async()=>{ const G=fresh('2027-10-05',12); date(AN); date(SIS); ROM.end(G,AN,'apart_talk'); ROM.end(G,SIS,'apart_talk'); H.CLOSE(AN); H.CLOSE(SIS);
  at(D('2027-10-05')+300,12);
  check('S4. 她們主動約（HASK.block）：以安、學姊前任＝ex（冷卻期過了、學姊 rebuild 以後也一樣）',HASK.block(G,AN,G.day)==='ex'&&HASK.block(G,SIS,G.day)==='ex',J([HASK.block(G,AN,G.day),HASK.block(G,SIS,G.day)]));
  G.flags.SIS_REBUILD=G.day; check('S4. 學姊演過 4-1（SIS_REBUILD）也照樣擋',HASK.block(G,SIS,G.day)==='ex'); });

await sec('S5',async()=>{ const G=fresh('2027-01-20',12); H.CLOSE(AN); breakup(AN); H.CLOSE(AN); at(D('2027-01-20')+200,12);
  const w={id:'Y2S2'}; check('S5. 學期末心意邀約（heartWhy）：前任以安不發、也不傳 NOPE（false）；條件裡先問 V6EX.noContact',TERMEND.heartWhy(G,AN,w)===false&&/S\.heartWhy=function[\s\S]{0,500}V6EX\.noContact\(G,id\)\) return false;/.test(RAW('src/termend3d.js')));
  check('S5. 朋友的期末邀約（friendOk）也不發',TERMEND.friendOk(G,AN,w)===false); });

await sec('S6',async()=>{ check('S6. 寒暑假私訊揪人（signup kind dm，C03 日語課）：條件有 V6EX.noContact（前任只看行事曆 board）',/s\.kind==='dm'[^\n]*V6EX\.noContact\(G,s\.who\)/.test(RAW('src/vac3d.js'))&&VAC_ACTIVITIES_C03board()); });
function VAC_ACTIVITIES_C03board(){ const s=RAW('src/data/vac_activities.js'); return /C03:[\s\S]{0,1200}board:true/.test(s); }

await sec('S7',async()=>{ check('S7. 祐廷出國時朋友的訊息（TRIP_MSG.friend）：前任以安、學姊 continue',/for\(const id in M\.friend\)\{[^\n]*V6EX\.noContact\(G,id\)\) continue;/.test(RAW('src/vac3d.js'))); });

await sec('S8',async()=>{ const G=fresh('2027-11-10',13); H.CLOSE(SIS); breakup(SIS); H.CLOSE(SIS);
  const tp=()=>{ const T=MSG.topics(G,SIS).map(q=>q.k).filter(k=>k!=='bday'); return T[0]; };
  const q=()=>PHONE.rec(G).q.filter(x=>x.items.some(it=>it.th==='p:'+SIS)).map(x=>x.items.map(it=>it.text).join('｜'));
  const k=tp(); const out=[];
  for(let i=0;i<4;i++){ at(D('2027-11-10')+i,13); const r=MSG.send(G,SIS,k); out.push(r&&r.ok?(r.exRead?'read':(r.exShort||'reply')):'x:'+(r&&r.why)); }
  check('S8. 前任的學姊回訊息：第 1、2 則已讀不回、第 3 則回最短一句、回完歸零（第 4 則又是已讀）',J(out.slice(0,4))===J(['read','read',V6EX.sisExShort(k),'read']),J({k,out}));
  check('S8. 已讀那兩則在手機上是旁白「（她已讀了。）」，第 3 則是她的「嗯。／好。／謝謝。」其中一句',q().filter(t=>t==='（她已讀了。）').length===3&&q().some(t=>['嗯。','好。','謝謝。'].includes(t)),J(q()));
  { const G2=fresh('2027-11-10',13); H.CLOSE(SIS); date(SIS); at(D('2027-11-10'),13); const r=MSG.send(G2,SIS,MSG.topics(G2,SIS).map(q=>q.k)[0]); check('S8. 交往中照常回（沒有 exRead）',!!r&&r.ok&&!r.exRead&&!r.exShort,J(r)); } });

await sec('S9',async()=>{ const G=fresh('2027-11-10',13); H.CLOSE(SIS); breakup(SIS);
  const r=[V6EX.sisExInvite(G),V6EX.sisExInvite(G),V6EX.sisExInvite(G),V6EX.sisExInvite(G)];
  check('S9. 前任的學姊被約：第 1、2 次已讀不回、第 3 次「最近忙。」、之後又從頭算',J(r)===J(['read','read','busy','read'])&&V6EX.SIS_EX_BUSY==='最近忙。',J(r));
  check('S9. 約人（INV.flow）裡學姊前任走 sisExInvite、不答應（return null）',/id==='heroine_05'&&typeof V6EX!=='undefined'&&V6EX\.sisExInvite&&V6EX\.noContact\(G,id\)\)\{[^\n]*\n[^\n]*return null; \}/.test(RAW('src/invites3d.js'))); });

await sec('S10',async()=>{ const G=fresh('2027-11-10',13); H.CLOSE(SIS); breakup(SIS); G.zone='linze';
  const out=[]; for(let i=0;i<3;i++){ H.said=[]; const ok=await V6EX.sisExTalk(GM,{name:'學姊'}); out.push([ok,said().join('')]); }
  check('S10. 前任當面找她：這學期前兩次只點頭（旁白）、第三次「嗯。」，不閒聊（回傳 true＝說話到此為止）',J(out)===J([[true,'（她抬頭看了你一眼，點了一下頭。）'],[true,'（她抬頭看了你一眼，點了一下頭。）'],[true,'嗯。']]),J(out));
  at(D('2028-03-01'),13); H.said=[]; await V6EX.sisExTalk(GM,{name:'學姊'}); check('S10. 下一個學期又從點頭開始',said().join('')==='（她抬頭看了你一眼，點了一下頭。）',J(said()));
  { const G2=fresh('2027-11-10',13); H.CLOSE(SIS); date(SIS); H.said=[]; const ok=await V6EX.sisExTalk(GM,{name:'學姊'}); check('S10. 交往中不擋（false）',ok===false&&!said().length); }
  check('S10. talkSis、talkCharacter（照作息的她）都先問 V6EX.sisExTalk',/V6EX\.sisExTalk&&await V6EX\.sisExTalk\(GM,n\)/.test(RAW('src/story3d.js'))&&/id==='heroine_05'&&!first&&typeof V6EX!=='undefined'&&V6EX\.sisExTalk&&await V6EX\.sisExTalk\(GM,who\)/.test(RAW('src/story3d.js'))); });

await sec('S11',async()=>{ check('S11. y1s2_an_ac（大一下以安的手機小事）：ok 有 noContact',/id:'y1s2_an_ac'[^\n]*V6EX\.noContact\(G,'heroine_01'\)/.test(RAW('src/y1fill3d.js'))); });

/* ======================= A 以安 ======================= */
await sec('A',async()=>{ const G=fresh('2026-10-08',20); H.CLOSE(AN); breakup(AN); G.acts={att:{'public_law_group@1':1}};
  { const e=ev('ev_an_ex_plg'); let L=null; if(e){ H.said=[]; G.flags.V6EX_AN_PLG=false; await EVENTS.runLines(e.dialogue,e); L=said(); }
    check('A1. 讀書會分開後第一次：她不說「規則沒有改。……」，只有旁白「（她看了你一眼，點了一下頭，翻開講義。）」',!!L&&L.includes('（她看了你一眼，點了一下頭，翻開講義。）')&&!L.includes('規則沒有改。……你也不用換位子。'),J(L)); }
  check('A2. ev_an_ex_admin（行政法第 12 週下課她先開口）前任不演：事件沒有登錄',!ev('ev_an_ex_admin'));
  { const e=ev('ev_plg_rules_after'); check('A3. ev_plg_rules_after 沒有前任插句「……你也來了。坐原來的位子。」',!!e&&!J(e.dialogue).includes('……你也來了。坐原來的位子。')); }
  check('A4. 送機「……到了我傳到群組。」照留（群組；V6EX.patchSendoff 照插）',V6EX_LINES.EX.anSendoff==='……到了我傳到群組。'&&/\n  S\.patchSendoff\(\);/.test(RAW('src/v6ex3d.js')));
  { const G2=fresh('2027-11-16',21); H.FRIEND(AN); date(AN); G2.flags.dating_heroine_01=false; ROM.get(G2,AN).status='paused'; check('A5. an15On：paused 也擋（原本只擋 ex）',STORY.an15On(G2)===false);
    ROM.get(G2,AN).status='friend_after_catch'; check('A5. friend_after_catch 也擋',STORY.an15On(G2)===false); }
  check('A6. 麵店長桌最後「你不用為了這個說什麼。」刪（AN15_EX.close 只剩旁白）',J(STORY.AN15_EX.close)===J([[null,'（她把志願表收回去，看了你一眼。）']]),J(STORY.AN15_EX&&STORY.AN15_EX.close));
  check('A7. 登機證私訊 y3_an_sendoff_miss：前任不送',/if\(!exAny\(G,'heroine_01'\)\) at\(G,d25,11\+40\/60,L,'y3_an_sendoff_miss'\)/.test(RAW('src/y34b3d.js')));
  check('A8. ev_an_her_choice 走廊那場前任不演（an18Due 擋 exAny）；22:00 阿哲在麵店團：「以安說她要考首都帝大法研所 商法組」（不打句號）',/fam\('heroine_01'\)\|\|exAny\(G,'heroine_01'\)\) return false/.test(RAW('src/y34b3d.js'))&&RAW('src/y34b3d.js').includes("from:'zhe',text:'以安說她要考首都帝大法研所 商法組'"));
  check('A9. 杜鵑花「第三張。」私訊那一支擋前任（群組照留）',guards('src/r2y3b3d.js','S.azaleaPhone=function',600));
  { const G3=fresh('2028-08-10',19); H.FRIEND(AN); breakup(AN); const x=(typeof R2Y3B!=='undefined'&&R2Y3B.SUMMER_SCENES)?null:null; check('A10. 大三暑假 study 第 3 場：前任只有旁白「（隔天開始，她也來了，坐在最角落。你們沒有說話。）」',RAW('src/r2y3b3d.js').includes("ROM.exOf(G,'heroine_01')?{lines:[{narr:'（隔天開始，她也來了，坐在最角落。你們沒有說話。）'}]}")); }
  check('A13. 尾聲 Café 前任：前面加旁白「（她經過你們那桌。你先打了招呼。）」，她的句子照留',(()=>{ const L=PG.exLines?PG.exLines(H.G,AN,false):null; return !!L&&L[0]==='（她經過你們那桌。你先打了招呼。）'&&J(L).includes('好久不見。'); })());
  check('A14. 回台中、回臺北的訊息（HOME_MSGS 的 an／anS）：前任不送',/if\(\(m\.an\|\|m\.anS\)&&anEx\) continue;/.test(RAW('src/holff3d.js')));
  check('A15. 假期計畫那一則（aa532_an_plan_<學期>）：前任不送',guards('src/holff3d.js','S.anPlan=function',600));
  check('A16. 大一暑假 va02_3、va02_4：她的私訊前任不送',/m\.th\.startsWith\('p:'\)&&typeof V6EX!=='undefined'&&V6EX\.noContact&&V6EX\.noContact\(G,m\.th\.slice\(2\)\)\) continue;/.test(RAW('src/vac3d.js')));
  check('A17. 芯慈那則（xc_an_knows）前任不送',guards('src/xcrom3d.js','S.anKnows=function',300));
  check('A18. 帶媽媽來茶屋（ev_wz_t5）、wz_t5_msg、wz_t_hint：前任不送',/id:'ev_wz_t5'[^\n]*ROM\.exOf\(G,'heroine_01'\)/.test(RAW('src/wzlines3d.js'))&&/!PHONE\.sent\(G,'wz_t_hint'\)&&!\(typeof ROM/.test(RAW('src/wzlines3d.js'))&&/!PHONE\.sent\(G,'wz_t5_msg'\)&&!\(typeof ROM/.test(RAW('src/wzlines3d.js')));
  check('A19～A21. 麵店長桌對全桌講（家教學生、行政法院）照留',RAW('src/data/y2b_events.js').includes('我家教的學生，家裡申請的補助被駁回了。')&&RAW('src/data/r2y3a_events.js').includes('今天下午，我先去了一趟行政法院。'));
  { const G4=fresh('2027-10-07',21.6,'wancai'); G4.flags.PUBLIC_LAW_GROUP=true; H.CLOSE(AN); breakup(AN); const L=await play('ev_y3_plg_topic');
    check('A22. 「下週的題目，你帶。」前任改旁白「（她把下週的題目寫在白板上。）」，沒有選項、不記 Y3_PLG_TOPIC',!!L&&J(L)===J(['（她把下週的題目寫在白板上。）'])&&!H.opts.length&&G4.flags.Y3_PLG_TOPIC==null,J(L)); }
  { const G5=fresh('2026-05-06',20.6,'boya'); H.FAMILIAR(AN); breakup(AN); const e=ev('ev_b4_after'); check('A23. ev_b4_after（她先開口）前任不演：prereq 的 custom 擋',!!e&&e.prereq&&typeof e.prereq.custom==='function'&&e.prereq.custom(G5)===false); }
  check('A24. 情人節第 6 階那一支：前任不約',/stage6\(a\.who\)&&!\(\(a\.who==='heroine_01'\|\|a\.who==='heroine_05'\)&&exOf\(G,a\.who\)\)/.test(RAW('src/an_yt_hol3d.js'))); });

/* ======================= B 學姊 ======================= */
await sec('B',async()=>{
  { const G=fresh('2027-11-17',20); H.FRIEND(SIS); breakup(SIS); H.FRIEND(SIS); check('B1. 「我在法圖。九點四十五關門。」：sisFormOn 前任 false（22:30 手機版也跟著不傳）',STORY.sisFormOn(G)===false); }
  { const t=evText('ev_sis_ex_1'); check('B2. ev_sis_ex_1：她不說話，櫃台轉交「（法圖的櫃台叫住你：有人放了一個紙袋給你。裡面是你的東西。）」',!!t&&t.includes('（法圖的櫃台叫住你：有人放了一個紙袋給你。裡面是你的東西。）')&&!t.includes('你的東西。一直在我那裡。')&&!t.includes("\"speaker\":\"heroine_05\""),t&&t.slice(0,200)); }
  { const t=evText('ev_sis_ex_2'); check('B3. ev_sis_ex_2：「……回去小心。」刪、旁白「（十點，她經過吧檯，沒有停下來。）」；走過去打招呼那支照舊',!!t&&!t.includes('……回去小心。')&&t.includes('（十點，她經過吧檯，沒有停下來。）')&&t.includes('嗯。我在趕一章。')); }
  { const L=await play('ev_sis_ex_3'); check('B4／N3. ev_sis_ex_3：祐廷先問「最近好嗎？」、她「（點了一下頭）嗯。」；方向的兩句（從樓上下來、往下走）不在',J(L)===J(['最近好嗎？','（點了一下頭）嗯。'])&&!evText('ev_sis_ex_3').includes('樓上下來')&&!evText('ev_sis_ex_3').includes('往下走'),J(L)); }
  { const G=fresh('2028-08-01',21.5); H.FRIEND(SIS); at('2028-06-01',12); breakup(SIS); at('2028-08-01',21.5); SISB10.exLast(G); PHONE.tick(G);
    check('B5. 2028-08-01 私訊「明天走了。」「……你也保重。」不送',!(G.msgs||[]).some(m=>m.text==='明天走了。'||m.text==='……你也保重。')&&!PHONE.sent(G,'sisb10_ex_last')); }
  { const L=await play('ev_sis16_ex_door'); check('B6. ev_sis16_ex_door：只有旁白「（她在總圖門口看到你，點了一下頭，走進去了。）」',J(L)===J(['（她在總圖門口看到你，點了一下頭，走進去了。）']),J(L)); }
  { const G=fresh('2027-01-01',12); H.FRIEND(SIS); at('2027-01-01',12); breakup(SIS); H.FRIEND(SIS); at(D('2027-01-01')+60,15); G.zone='lawlib';
    const before=SISB4.rebuildDue(G); await V6EX.sisExTalk(GM,{name:'學姊'}); const one=SISB4.rebuildDue(G); V6EX.sisExInvite(G); const two=SISB4.rebuildDue(G);
    check('B7. ev_sis_three_conditions：分手後祐廷先找過她兩次（當面、約、傳訊息都算）才演——0 次、1 次不演，2 次以後演',before===false&&one===false&&two===true,J({before,one,two,tries:V6EX.sisExTries(G)}));
    H.said=[]; const ok=await V6EX.sisExTalk(GM,{name:'學姊'}); check('B7. 第三次在她讀書的地方：不點頭，交給 SISB4.preTalk 演 4-1（sisExTalk 回 false）',ok===false&&!said().length); }
  { const G=fresh('2028-06-02',12); H.FRIEND(SIS); at('2028-04-01',12); breakup(SIS); at('2028-06-02',12); const k='bday'; const r=MSG.topics(G,SIS).some(q=>q.k===k)?MSG.send(G,SIS,k):{ok:true,exRead:true,skip:true};
    check('B8. 2028/6/2 前任傳生日快樂＝已讀不回（不回「謝謝。」）',!!r&&r.ok&&r.exRead&&!PHONE.rec(G).q.some(x=>x.items.some(it=>it.from===SIS&&it.text==='謝謝。')),J(r)); }
  check('B9. 畢業「今天恭喜。」私訊（pg_sis_ex）刪',PG.EX_NO_CONTACT===true&&/tag:'pg_sis_ex'[^\n]*!S\.EX_NO_CONTACT/.test(RAW('src/postgrad3d.js')));
  check('B10. Kevin 那則選「傳一句生日快樂」：她不回（只有你的那一句）',/if\(!S\.EX_NO_CONTACT\) for\(const t of \(noon\?R\.slice\(0,1\):R\)\)/.test(RAW('src/postgrad3d.js')));
  { const L=PG.exLines(H.G,SIS,false); check('B11. 尾聲 Café 前任：「……你們看起來很好。」刪，只有旁白「（她經過你們那桌，點了一下頭。）」',J(L)===J(['（她經過你們那桌，點了一下頭。）']),J(L)); }
  check('B12. 美國出發「到了再說。」照留',RAW('src/y34b3d.js').includes('到了再說。'));
  check('B13. 每日照片私訊（SIS_PHOTO_TO_YOU）前任不私訊',/mine=!!F\.SIS_PHOTO_TO_YOU&&!exAny\(G,'heroine_05'\)/.test(RAW('src/y34b3d.js')));
  check('B14. y4_push_note 便條前任不送',/!PHONE\.sent\(G,'y4_push_note'\)&&!\(typeof ROM!=='undefined'&&!!ROM\.exOf&&ROM\.exOf\(G,'heroine_05'\)\)/.test(RAW('src/r2y4a3d.js')));
  check('B15. sisb14_exam（朋友版）前任不送',/!stageOk\('FRIEND'\)\|\|\(typeof ROM!=='undefined'&&!!ROM\.exOf/.test(RAW('src/sis_b14_3d.js')));
  check('B16～B18. r3_sis_plan_c、r3_sis_note_photo、ev_sis_exam_note（考場門口）前任不演',(RAW('src/r3_3d.js').match(/met\(G,SIS,'FRIEND'\)&&!exS\(G\)/g)||[]).length===3);
  check('B19～B21. sisb13_curry_dm、sisb13_thesis_ask、sisb13_notes_back 前任不送',/contact\(G\)&&!exAny\(G\)\) PHONE\.at\(/.test(RAW('src/sis_b13_3d.js'))&&/friendUp\(G\)&&!exAny\(G\)/.test(RAW('src/sis_b13_3d.js'))&&/F\.SIS_NOTES_DAY!=null&&contact\(G\)&&!exAny\(G\)/.test(RAW('src/sis_b13_3d.js')));
  check('B22. sisb15_study 私訊那一支前任不送',/stageOk\('FAMILIAR'\)\)&&contact\(G\)&&!\(typeof ROM/.test(RAW('src/sis_b15_3d.js')));
  check('B23. sis_books2 私訊前任不傳',guards('src/sisbooks2_3d.js','S.phone=function',700));
  check('B24～B26. vacfill 她先傳的（vf_y2_0728、vf_y3_0212、vf_y3w_0115）：S.gate 擋 noContact',guards('src/vacfill3d.js','S.gate=function',500));
  check('B27. sisb12_card_back 送出時再看前任',/sisb12_card_back[\s\S]{0,300}contact\(G\)&&!\(typeof ROM/.test(RAW('src/sis_b12_3d.js')));
  check('B28. ev_wz_t4（一個人來茶屋）前任不演',/id:'ev_wz_t4',due:G=>\{ if\(!sat\(G\)\|\|!S\.atLeast\('heroine_05','FAMILIAR'\)\|\|\(typeof ROM/.test(RAW('src/wzlines3d.js')));
  { const G=fresh('2027-09-24',17,'campus'); H.FRIEND(SIS); breakup(SIS); const L=await play('ev_b8_door');
    check('B29. ev_b8_door 前任：「你也來聽？」刪，旁白「（她看到你，點了一下頭。）」',!!L&&L.includes('（她看到你，點了一下頭。）')&&!L.includes('你也來聽？'),J(L));
    const G2=fresh('2027-09-24',17,'campus'); H.FRIEND(SIS); const L2=await play('ev_b8_door'); check('B29. 不是前任照舊',!!L2&&L2.includes('你也來聽？')&&!L2.includes('（她看到你，點了一下頭。）'),J(L2)); }
  { const L=await play('ev_usb_fb_study'); check('B33. 秋假自習室（挽回中）：她不先說「……你也沒有出去。」，只點頭',!!L&&!L.includes('……你也沒有出去。')&&L.includes('（她抬頭看了你一眼，點了一下頭。）'),J(L)); } });

/* ======================= R 挽回改稿（第 3 節） ======================= */
await sec('R',async()=>{
  { const G=fresh('2028-06-24',16); H.picks=[0]; const L=await play('ev_jp_repair_river',[0]);
    check('R1. 日本 6/24 河邊：祐廷先說「那時候的事，我想跟妳說。」→「……你說。」；「那時候我很生氣…」「……現在可以聽了。你說。」不在',!!L&&J(L.slice(0,3))===J(['（河邊。她一個人坐在堤防上。你走過去，在她旁邊坐下。）','那時候的事，我想跟妳說。','……你說。'])&&!J(L).includes('那時候我很生氣')&&G.flags.AN_REPAIR4==='sorry',J(L)); }
  { const G=fresh('2028-07-07',19); G.flags.REPAIR={heroine_01:3}; const L=await play('ev_jp_tanabata_repair');
    check('R2. 日本 7/7 七夕（REPAIR 夠了）：祐廷寫「再一次。」、她寫「好。」→「……不准賴。」＝again、AN_JP_RECONCILED；「你要看嗎？」「理由」不在',!!L&&L.includes('（你寫了一張，拿給她看。上面只有一行：「再一次。」）')&&L.includes('（她在自己那張上面寫了一個字，掛在你那張旁邊。上面寫著：「好。」）')&&L.includes('……不准賴。')&&!J(L).includes('你要看嗎？')&&!J(L).includes('理由')&&G.flags.AN_TANABATA_JP_REPAIR==='again'&&G.flags.AN_JP_RECONCILED===true,J(L));
    const G2=fresh('2028-07-07',19); G2.flags.REPAIR={heroine_01:1}; const L2=await play('ev_jp_tanabata_repair');
    check('R2. REPAIR 不夠：「（她看了很久，把短冊還給你。）」「掛上去吧。」＝hung',!!L2&&L2.includes('（她看了很久，把短冊還給你。）')&&L2.includes('掛上去吧。')&&!L2.includes('……不准賴。')&&G2.flags.AN_TANABATA_JP_REPAIR==='hung',J(L2)); }
  { const G=fresh('2028-09-13',19); const L=await play('ev_us2_repair',[0,0]);
    check('R3. 美國 C 棟廚房：她點頭、祐廷問「報告怎麼了？」她才說；「我陪妳吃完再走。」＝US2_STAYED、「……隨你。」；「你吃過了嗎？」不在',!!L&&L.includes('（她看了你一眼，點了一下頭，又回去看鍋子。吧台上放著一份報告，第一頁有教授的紅字。）')&&L.includes('……被退了。教授說：「妳的論點很清楚，但我讀不到妳。」')&&L.includes('……隨你。')&&!L.includes('你吃過了嗎？')&&G.flags.US2_STAYED===true&&G.flags.US2==='repair',J(L));
    const G2=fresh('2028-09-13',19); const L2=await play('ev_us2_repair',[1]); check('R3. 放好就走：「（你走的時候，她沒有回頭。）」、沒有 US2_STAYED',!!L2&&L2.includes('（你走的時候，她沒有回頭。）')&&!G2.flags.US2_STAYED,J(L2)); }
  { const G=fresh('2028-11-23',9); const L=await play('ev_us3_lake',[0]);
    check('R4. 感恩節湖邊（挽回中）：你放慢腳步走到她旁邊、祐廷先說「分手那天，我沒有解釋。」；她說的「分手那天，你沒有解釋。」不在',!!L&&L.some(t=>/你放慢腳步，走到她旁邊。她沒有看你。/.test(t))&&L.includes('分手那天，我沒有解釋。')&&L.includes('（她走了好幾步才開口。）')&&!L.includes('分手那天，你沒有解釋。'),J(L)); }
  { const G=fresh('2028-12-02',20); global.R2Y4A=global.R2Y4A||{repairOK:()=>true}; const keep=R2Y4A.repairOK; R2Y4A.repairOK=()=>true; const L=await play('ev_us_snow_repair',[0]); R2Y4A.repairOK=keep;
    check('R5. 初雪（REPAIR 夠了）：祐廷說「下雪了。」、選項「我們重新開始，好不好？」／「……我還想跟妳在一起。」、她「（看了你很久）……好。」＝restart；「你看。」「這次我先說。」不在',!!L&&L.includes('下雪了。')&&J(H.opts[0])===J(['「我們重新開始，好不好？」','「……我還想跟妳在一起。」'])&&L.includes('（看了你很久）……好。')&&!L.includes('你看。')&&!J(L).includes('這次我先說')&&G.flags.US_SNOW==='restart',J({L,o:H.opts})); } });

/* ======================= N AA_591 九件 ======================= */
await sec('N',async()=>{
  check('N1. sis_b4 情人節旁白「（她說完，一直在笑。）」',RAW('src/data/sis_b4_events.js').includes("N('（她說完，一直在笑。）')")&&!RAW('src/data/sis_b4_events.js').includes('可是一直在笑'));
  check('N2. 除夕 y29：照片只在開頭一次，最後只留「厲害吧。」',RAW('src/data/sis_b10_events.js').includes("{label:'e29'},SIS('厲害吧。')")&&(RAW('src/data/sis_b10_events.js').match(/一盤水餃/g)||[]).length===1);
  { const G=fresh('2028-03-01',20); G.flags.SIS_REBUILD=D('2028-01-01'); H.CLOSE(SIS); at('2027-12-01',12); date(SIS); at('2027-12-20',12); ROM.end(G,SIS,'apart_talk'); at('2028-03-01',20); date(SIS);
    const y=CONFESS_LINES.heroine_05.yes(G); check('N4. 重新開始的答應（restartYes）放回：「你做到了。」「……我也想好了。」「其他的，想了很久。……沒有了。」「這次，我選你。」',J(y)===J(['你做到了。','……我也想好了。','其他的，想了很久。……沒有了。','這次，我選你。']),J(y)); }
  check('N5. multirel 學姊 Byes「我還是喜歡你。這個我不想騙自己。」放回',/Byes:\[ '我想過了。','我還是喜歡你。這個我不想騙自己。','……你去見她那天，出門前傳一句給我就好。' \]/.test(RAW('src/data/multirel_lines.js')));
  { const h=TERMEND.heart(SIS,'Y2S2'), inv=x=>typeof x==='function'?x(H.G):x; check('N6. termend 學姊 yes2＝yes、invite2＝第一次的邀約（不提上次）',!!h&&J(h.yes2)===J(h.yes)&&inv(h.invite2)===inv(h.invite)&&!/上次|同一家/.test(inv(h.invite2)),J({y2:h&&h.yes2,i2:h&&inv(h.invite2)})); }
  check('N7. 大峽谷「十二月二十三號，晚上八點落地。你來接我。」照留',RAW('src/data/r2y4b_events.js').includes("text:'十二月二十三號，晚上八點落地。你來接我。'"));
  { const G=fresh('2028-03-01',20); H.CLOSE(SIS); date(SIS); G.name='祐廷'; const m=PHONE.post(G,{th:'p:'+SIS,from:SIS,text:'{name}，到了嗎。'}); ROM.end(G,SIS,'apart_talk');
    const m2=PHONE.post(G,{th:'p:'+SIS,from:SIS,text:'{name}。'});
    check('N8. 林{name}：交往中送出的訊息當下就存成「林祐廷」（ytFix），分手以後還是「林祐廷」；分手以後送的不加姓',m.text==='林祐廷，到了嗎。'&&m.ytFix===1&&m2.text==='{name}。'&&(G.msgs||[]).find(x=>x===m).text==='林祐廷，到了嗎。',J([m.text,m2.text])); }
  check('N9. 她爸爸：pg_dates「我媽問研究單位在做什麼」（她說：『所以是公務員？』）、礁溪「她和媽媽坐在泡腳池邊」、記憶「在礁溪遇到學姊和她媽媽」、重訪「上次學姊和她媽媽坐在這裡。」',
    RAW('src/data/pg_dates.js').includes('元旦回家，我媽問研究單位在做什麼。我講了二十分鐘。她說：『所以是公務員？』')&&!RAW('src/data/pg_dates.js').includes('我爸問研究單位')
    &&RAW('src/data/encounters.js').includes("why:'她和媽媽坐在泡腳池邊")&&RAW('src/data/encounters.js').includes("ENC_D24_SIS:'在礁溪遇到學姊和她媽媽'")&&RAW('src/data/enc_walk.js').includes('泡腳池。上次學姊和她媽媽坐在這裡。'));
  { let ok=false; try{ const doc=cp.execSync('git show 43d27cd80:"docs/story_planning/AA_591_學姊改稿_第四批_大三大四畢業後.md"',{cwd:H.ROOT,encoding:'utf8'}); ok=doc.includes('整合時的 AA 決定（回 LAWWW 11-02 21:25，九件）'); }catch(e){}
    check('N. 依據：企劃線 43d27cd80 AA_591 最後一節（九件）讀得到',ok,'git fetch origin claude/story-planning'); } });

/* 白名單 */
{ const A=JSON.parse(RAW('docs/handoff/story_import_allow.json')), F=A.files||A.allow||A; const L=Array.isArray(F)?F:(F.files||[]);
  const find=p=>L.find(x=>x&&x.path===p);
  const a600=find('docs/story_planning/AA_600_分手後不主動聯絡_全遊戲修正.md'), a591=find('docs/story_planning/AA_591_學姊改稿_第四批_大三大四畢業後.md');
  check('白名單：AA_600@031414cad（AA600-EX-NO-CONTACT-1102）、AA_591@43d27cd80',!!a600&&a600.sha==='031414cad'&&a600.task==='AA600-EX-NO-CONTACT-1102'&&a600.status==='approved'&&!!a591&&a591.sha==='43d27cd80',J({a600:a600&&a600.sha,a591:a591&&a591.sha})); }
H.done();
})();
