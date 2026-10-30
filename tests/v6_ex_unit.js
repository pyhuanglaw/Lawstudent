// 多段感情 v6：收拾的時刻（V6-S4）、EX_<id>_REASON（V6-S3）、前任版（V6-A3 以安、A6 語彤、B6 子晴／芷若／學姊）、麵店團（V6-A7）——不需要瀏覽器。
//   src/v6ex3d.js（V6EX）、src/data/v6ex_lines.js。台詞逐字對企劃（企劃線 claude/cool-heisenberg-o8kuqx @ d805bceee）：
//   AA_123 4-3、4-3b、5-3、第 6 節；AA_182 第 2、3 節；BB_119 第 4 節、9-4。每一句直接寫在這裡比對（不從程式讀）。
//   0 接線　R 分開的原因（EX_<id>_REASON）　S 收拾的時刻（第一個空檔的系統字、書桌的「收拾」、四個選項、在家一天問一次、第七天 22:00 自動補）
//   A 以安（讀書會分開後第一次、之後和別人交往說一次、送機多一句、新 20 改麵店長桌）　Y 語彤（之後和以安交往說一次）
//   B 子晴、芷若（Café）、學姊（法學院／研究助理）第一次見面　T 麵店團（開始交往、同一個朋友圈、柏翰的筆記）
// 修改前（開發分支 HEAD）：沒有 src/v6ex3d.js——全部 FAIL。用法：node tests/v6_ex_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const EXPORT=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|Y34B|V6EX|V6EX_LINES)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.Z3={ZONES:{}};
const loadErr=[]; for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/y34b3d.js','src/data/v6ex_lines.js','src/v6ex3d.js']){ try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const V=()=>typeof V6EX!=='undefined'&&V6EX&&V6EX.menu?V6EX:null;
const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', ZR='heroine_02', ZQ='heroine_04', SIS='heroine_05';
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=(t)=>{ toasts.push(t); };
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'dorm',flags); G.outings=[]; G.acts=G.acts||{att:{}}; toasts.length=0; E.player.busy=false; E.paused=false; E.interactables=[]; for(const id of [AN,YT,PS,ZR,ZQ,SIS]){ SOCIAL.remember(id,'FIRST_MET',''); INV.addContact(H.G,id); } return G; };
const date=id=>{ H.CLOSE(id); return ROM.start(H.G,id); };
const at=(k,h)=>{ const G=H.G; G.day=typeof k==='number'?k:D(k); G.hour=h; G.weekday=wdOf(G.day); };
const settle=async()=>{ for(let i=0;i<60&&V().isBusy();i++) await new Promise(r=>setTimeout(r,0)); await new Promise(r=>setTimeout(r,0)); };
const tick=async()=>{ const r=V().tick(GM); await settle(); return r; };
const said=()=>H.said.map(s=>s.t);
const clear=(picks)=>{ H.said=[]; H.opts=[]; H.bgs=[]; H.picks=(picks||[]).slice(); toasts.length=0; };
const desk=()=>{ E.interactables.push({x:1,z:-2,radius:1.0,label:'坐在書桌前',deskStudy:true,seat:{x:1,z:-2,yaw:0}}); };
const cleanIt=()=>E.interactables.find(it=>it.v6Clean);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const ENTRY='（這一週，你可以把這件事放好。）', AUTO='（你把那件事放好了。）';
const MENU=['還東西、收紙箱','和阿哲說一次話','手機筆記寫一行','算了'];
const ZHE_LINE='要吃什麼？我請。……不想講也可以。', ZHE_OPTS=['（講一點）','（只吃東西）','「謝謝」'];
const NOTES=['「謝謝妳。」','「是我們都沒錯。」','「下次我會先說。」'];
const PLG={id:'public_law_group'};
const pre=async id=>{ clear(); await V().preTalk(GM,{name:id},id); return said(); };
/* 分開：d 那天；之後第幾天 */
const breakup=(id,how,key)=>{ if(key) at(key,20); date(id); return ROM.end(H.G,id,how||'apart_talk'); };

(async()=>{
/* ======================= 0 接線 ======================= */
await sec(0,()=>{
  check('0. 檔案載得到（v6ex_lines.js、v6ex3d.js）',!loadErr.length&&!!V(),loadErr.join('；'));
  if(!V()) return;
  const ids=['ev_v6_clean_zhe','ev_v6_clean_zhe_call','ev_v6_clean_home','ev_an_ex_plg'];
  check('0. 事件都在 STORY_EVENTS；包了 ROM.end、ROM.start、STORY.populate、STORY.cleanupTick、Y34B.an20Mode；送機那一句插進去了',ids.every(id=>!!ev(id))&&ROM._v6exEnd&&ROM._v6exStart&&STORY._v6exPopulate&&STORY._v6exCleanTick&&Y34B._v6exAn20&&ev('ev_an_sendoff').v6exPatched,ids.filter(id=>!ev(id)).join(' '));
  check('0. 沒有改 ROM.canStart：好好分開的也可以重新開始（AA_434 第 1 節：BB_119「不復合」作廢）',!ROM._v6exCan);
});
if(!V()){ H.done(); return; }

/* ======================= R 分開的原因 ======================= */
await sec('R',()=>{
  const cases=[['apart_talk','talk'],['apart_life','talk'],['apart_choice','talk'],['apart_drift','drift'],['drift','drift'],['two_hearts','caught'],['mrel','caught'],['zq_zr','caught'],[undefined,'talk']];
  const bad=[]; for(const [how,want] of cases){ fresh('2026-10-14',20); date(AN); ROM.end(H.G,AN,how); if(H.G.flags.EX_heroine_01!==true||H.G.flags.EX_heroine_01_REASON!==want) bad.push(how+'→'+H.G.flags.EX_heroine_01_REASON); }
  check('R1. ROM.end 的 how → EX_<id>_REASON（talk／drift／caught）；EX_<id> 照原本',!bad.length,bad.join(' '));
  fresh('2026-10-14',20); date(ZQ); H.G.flags.EX_heroine_04_REASON='drift'; ROM.end(H.G,ZQ,'apart_talk');
  check('R2. 已經有的原因不蓋掉',H.G.flags.EX_heroine_04_REASON==='drift');
  fresh('2026-10-14',20); date(YT); CRACKTALK.apart(H.G,YT,'apart_drift','drift');
  check('R3. 談話（cracktalk3d.js）自己記的照它的：drift',H.G.flags.EX_heroine_03_REASON==='drift');
  fresh('2026-10-14',20); ROM.end(H.G,AN,'apart_talk');
  check('R4. 沒有在交往（ROM.end 回 false）：不記原因、不記收拾',H.G.flags.EX_heroine_01_REASON==null&&!(H.G.flags.CLEANUP_WHO||[]).length);
});

/* ======================= S 收拾的時刻 ======================= */
await sec('S',async()=>{
  const d0=D('2026-10-14');
  fresh('2026-10-14',20); desk(); breakup(AN,'apart_talk');
  check('S1. 分開：七天內（CLEANUP_DONE false、cleanupDue＝＋7）',V().pending(H.G)&&H.G.flags.cleanupDue===d0+7);
  clear(); await tick(); check('S2. 第一個空檔：系統字一次',said().join('|')===ENTRY,J(said()));
  clear(); await tick(); check('S2. 再 tick：不重複',!said().includes(ENTRY));
  const it=cleanIt(); check('S3. 書桌旁多一個「收拾」（站在書桌旁邊、比坐下來優先一點）',!!it&&it.label==='收拾'&&Math.hypot(it.x-1,it.z+2)<0.6&&it.prio>0,J(it));
  /* 選項：和阿哲不到 FAMILIAR＝沒有那一項 */
  clear([3]); it.onInteract(); await settle();
  check('S4. 和阿哲不熟：還東西／手機筆記／算了；「算了」＝還沒收拾、「收拾」還在',J(H.opts[0])===J([MENU[0],MENU[2],MENU[3]])&&H.G.flags.CLEANUP_DONE===false&&!!cleanIt(),J(H.opts));
  H.FAMILIAR('zhe');
  clear([0]); cleanIt().onInteract(); await settle();
  check('S5. 和阿哲 FAMILIAR：四個選項照 AA_182；還東西＝在房間做完、收拾過、「收拾」拿掉',J(H.opts[0])===J(MENU)&&H.G.flags.CLEANUP_DONE===true&&H.G.flags.CLEANUP_HOW==='box'&&(H.G.flags.CLEANUP_BOX||[]).some(b=>b.id===AN)&&toasts.includes('收好了。')&&!cleanIt(),J([H.opts,toasts]));
  /* 手機筆記 */
  fresh('2026-10-14',20); desk(); breakup(YT,'apart_talk'); await tick(); clear([1,1]); cleanIt().onInteract(); await settle();
  check('S6. 手機筆記：三句選一（照原文）、記 CLEANUP_NOTE',J(H.opts[1])===J(NOTES)&&H.G.flags.CLEANUP_NOTE===NOTES[1]&&H.G.flags.CLEANUP_DONE===true&&toasts.includes('寫好了。'),J(H.opts));
  /* 阿哲：宿舍＝傳訊息、十分鐘後頂樓 */
  fresh('2026-10-14',20); desk(); H.FAMILIAR('zhe'); breakup(AN,'apart_talk'); await tick(); const h0=H.G.hour; clear([1,2]); cleanIt().onInteract(); await settle();
  check('S7. 阿哲（宿舍）：祐廷傳「頂樓？」、阿哲回「十分鐘。我帶飲料。」',J(H.msgs('p:zhe').slice(-2))===J(['頂樓？','十分鐘。我帶飲料。']),J(H.msgs('p:zhe')));
  check('S7. 十分鐘後宿舍頂樓（背景 dorm_roof）、阿哲那一句、三選一、收拾過',Math.abs(H.G.hour-h0-1/6)<1e-6&&H.bgs.some(b=>b&&b.image&&/dorm_roof/.test(b.image))&&said().includes(ZHE_LINE)&&J(H.opts[1])===J(ZHE_OPTS)&&H.G.flags.CLEANUP_ZHE===2&&H.G.flags.CLEANUP_DONE===true,J([H.G.hour-h0,H.bgs,said(),H.opts]));
  /* 第四個選項：她的物件（BB 的五位） */
  fresh('2026-10-14',20); desk(); breakup(PS,'apart_talk'); await tick(); clear(['教育概論',1]); cleanIt().onInteract(); await settle();
  check('S8. 沛珊：第四個選項「把教育概論還給她」、便條兩個選項、寄出去（BB_119 9-4）',H.opts[0].includes('把教育概論還給她')&&J(H.opts[1])===J(['便條留在書裡','便條收進抽屜'])&&said().includes('（你把她借你的教育概論從書架上拿下來。書裡夾著一張便條，只寫『加油』。）')&&said().includes('（你把書裝進紙袋，寫上她的名字。隔天寄出去。）')&&H.G.flags.CLEANUP_HER===PS&&H.G.flags.CLEANUP_HER_PICK==='便條收進抽屜'&&H.G.flags.CLEANUP_DONE===true,J([H.opts,said()]));
  const HER=[[SIS,'把保溫瓶洗乾淨','（你把她送的保溫瓶洗乾淨，擦乾，放回櫃子最上層。）'],[ZR,'把明信片收進盒子','（你把她寄來的明信片一張一張疊好，收進一個盒子。不是丟掉。）'],[ZQ,'把插座貓貼紙撕下來','（你把手機殼上的插座貓貼紙撕下來，貼進筆記本。不是丟掉。）'],['kexin','把畫了長頸鹿的停車單收好','（你下樓到車上，找到那張停車單。背面有她畫的長頸鹿。你把它夾進駕照套。）']];
  const bad=[]; for(const [id,btn,line] of HER){ fresh('2026-10-14',20); desk(); H.CLOSE(id); breakup(id,'apart_talk'); await tick(); clear([btn]); cleanIt().onInteract(); await settle(); if(!H.opts[0].includes(btn)||!said().includes(line)||H.G.flags.CLEANUP_HER!==id) bad.push(id+J([H.opts,said()])); }
  check('S9. 學姊、芷若、子晴、可昕：各自的物件、旁白照原文',!bad.length,bad.join(' '));
  fresh('2026-10-14',20); desk(); breakup(AN,'apart_talk'); await tick(); clear([3]); cleanIt().onInteract(); await settle();
  check('S10. 以安（AA 的人物）：沒有第四個選項',!H.opts[0].some(t=>/把/.test(t)),J(H.opts));
  /* 第七天 22:00 */
  fresh('2026-10-14',20); desk(); breakup(AN,'apart_talk'); await tick();
  at(d0+6,23); check('S11. 第 6 天 23:00：還可以收拾',V().pending(H.G));
  at(d0+7,21); clear(); const r21=STORY.cleanupTick(GM); await settle();
  check('S12. 第七天 21:00：還不補（等到 22:00）、「收拾」還在',!r21&&!said().includes(AUTO)&&H.G.flags.CLEANUP_DONE===false&&V().pending(H.G));
  at(d0+7,22); clear(); const r22=STORY.cleanupTick(GM); await settle();
  check('S13. 第七天 22:00：「（你把那件事放好了。）」、CLEANUP_DONE true',!!r22&&said().includes(AUTO)&&H.G.flags.CLEANUP_DONE===true&&!V().pending(H.G),J(said()));
  await tick(); check('S13. 補過以後「收拾」拿掉',!cleanIt());
  fresh('2026-10-14',20); H.G.flags.CLEANUP_DONE=false; delete H.G.flags.cleanupDue;
  check('S14. 舊存檔（CLEANUP_DONE false、沒有 cleanupDue）：沒有收拾選單（romance3d 當作已經過了一週）',!V().pending(H.G));
  /* 在家：一天問一次 */
  fresh('2026-10-17',10,'dorm'); H.FAMILIAR('zhe'); breakup(ZQ,'apart_talk'); V().rec(H.G).entry=null;
  check('S15. 在家（trigger home）：七天內、今天還沒問＝成立',EVENTS.check(ev('ev_v6_clean_home')));
  clear(['算了']); await EVENTS.run(ev('ev_v6_clean_home'));
  check('S15. 在家：先一句系統字、再選單（多了子晴的物件）；「算了」＝今天不再問',said()[0]===ENTRY&&J(H.opts[0])===J([MENU[0],MENU[1],MENU[2],'把插座貓貼紙撕下來',MENU[3]])&&!EVENTS.check(ev('ev_v6_clean_home'))&&H.G.flags.CLEANUP_DONE===false,J([said(),H.opts]));
  at(H.G.day+1,10); check('S16. 隔天又成立',EVENTS.check(ev('ev_v6_clean_home')));
  const nm=H.msgs('p:zhe').length; clear(['和阿哲',0]); await EVENTS.run(ev('ev_v6_clean_home'));
  check('S17. 在家選阿哲＝打電話（不傳「頂樓？」、同一段話）、收拾過',H.msgs('p:zhe').length===nm&&said().includes(ZHE_LINE)&&J(H.opts[1])===J(ZHE_OPTS)&&H.G.flags.CLEANUP_ZHE===0&&H.G.flags.CLEANUP_DONE===true&&!EVENTS.check(ev('ev_v6_clean_home')),J([said(),H.opts,H.msgs('p:zhe')]));
  fresh('2026-10-17',10,'dorm'); check('S18. 沒分開過：在家不問',!EVENTS.check(ev('ev_v6_clean_home')));
});

/* ======================= A 以安 ======================= */
await sec('A',async()=>{
  const thu=D('2026-10-15');   /* 大二上第 6 週週四 */
  const plg=()=>{ H.G.acts.att['public_law_group@'+H.G.day]={end:'full'}; return CLS.clubEvent(H.G,PLG); };
  fresh('2026-10-08',20,'wancai'); H.G.events.done.ev_public_law_group=1; breakup(AN,'apart_talk'); at(thu,20); H.G.zone='wancai';
  const e=plg(); check('A1. 分開後的讀書會：先演 ev_an_ex_plg',e&&e.id==='ev_an_ex_plg',e&&e.id);
  clear(); await EVENTS.run(ev('ev_an_ex_plg'));
  check('A1. 以安：「規則沒有改。……你也不用換位子。」',J(said())===J(['規則沒有改。……你也不用換位子。'])&&H.G.flags.V6EX_AN_PLG===true,J(said()));
  at(thu+7,20); const e2=plg(); check('A2. 下一次讀書會不再演',!e2||e2.id!=='ev_an_ex_plg');
  fresh('2026-10-08',20,'wancai'); at(thu,20); const e3=plg(); check('A3. 沒分開過：不演',!e3||e3.id!=='ev_an_ex_plg');
  fresh('2026-09-01',20,'wancai'); breakup(AN,'apart_talk'); at(thu,20); H.G.acts={att:{}}; const e4=plg(); check('A4. 第一次來讀書會（白板那一場還沒演）：不搶',!e4||e4.id!=='ev_an_ex_plg',e4&&e4.id);
  /* 之後和別人交往、她知道 */
  fresh('2026-10-14',20); breakup(AN,'apart_talk'); at(H.G.day+8,12); date(YT);
  check('A5. 和語彤交往、以安不知道：不說',!(await pre(AN)).length);
  ROM.learn(H.G,AN,YT,'test');
  check('A5. 以安知道：「理由我懂。不用解釋。」只說一次',J(await pre(AN))===J(['理由我懂。不用解釋。'])&&!(await pre(AN)).length);
  fresh('2026-10-14',20); date(YT); ROM.learn(H.G,AN,YT,'test'); at(H.G.day+3,20); breakup(AN,'apart_talk');
  check('A6. 語彤是分開以前就在交往的（多段同時）：不算「之後和別人交往」',!(await pre(AN)).length);
  /* 送機 */
  const so=ev('ev_an_sendoff').dialogue, i=so.findIndex(l=>l&&l.text==='……到了我傳到群組。'), j=so.findIndex(l=>l&&Array.isArray(l.choice)&&l.choice[0]&&l.choice[0].text==='「好。」');
  fresh('2027-03-25',10); breakup(AN,'apart_talk'); const exOK=i>=0&&EVENTS.cond(so[i].if);
  fresh('2027-03-25',10); const noEx=i>=0&&EVENTS.cond(so[i].if);
  check('A7. 新 16 送機：「……到了我傳到群組。」（AA_437 第 4 節改字，原本「……理由欄，我自己寫。」）在「好。」／揮手那個選項前面、只給前任',i>=0&&j===i+1&&so[i].speaker===AN&&exOK&&!noEx,J([i,j]));
  /* 新 20 */
  fresh('2029-05-03',10); H.FRIEND(AN); check('A8. 新 20：單身、沒交往過＝Café',Y34B.an20Mode(H.G)==='cafe');
  H.G.flags.EX_heroine_01=true; check('A8. 前任＝麵店長桌那一版',Y34B.an20Mode(H.G)==='noodle');
});

/* ======================= Y 語彤 ======================= */
await sec('Y',async()=>{
  fresh('2026-10-14',20); breakup(YT,'apart_talk'); at(H.G.day+8,12); date(ZQ); ROM.learn(H.G,YT,ZQ,'test');
  check('Y1. 之後和子晴交往：語彤那一句只給「和以安」',!(await pre(YT)).length);
  date(AN); ROM.learn(H.G,YT,AN,'test');
  check('Y2. 之後和以安交往、她知道：「嗯。……她會讓你說理由的。」只說一次',J(await pre(YT))===J(['嗯。……她會讓你說理由的。'])&&!(await pre(YT)).length);
});

/* ======================= B 子晴、芷若、學姊 ======================= */
await sec('B',async()=>{
  fresh('2026-10-14',20); breakup(ZQ,'apart_talk');
  check('B1. 子晴：分開後第一次說話「好久不見。你看起來有睡飽。」、只一次',J(await pre(ZQ))===J(['好久不見。你看起來有睡飽。'])&&!(await pre(ZQ)).length);
  fresh('2026-10-14',20,'campus'); breakup(ZR,'apart_talk'); H.G.zone='campus';
  check('B2. 芷若：不在 Café 不說',!(await pre(ZR)).length);
  H.G.zone='cafe'; check('B2. 芷若：在 Café 第一次「好久不見。……老樣子？」、只一次',J(await pre(ZR))===J(['好久不見。……老樣子？'])&&!(await pre(ZR)).length);
  fresh('2026-10-14',20,'gongguan'); breakup(SIS,'apart_talk'); H.G.zone='gongguan';
  check('B3. 學姊：不在法學院不說',!(await pre(SIS)).length);
  H.G.zone='linze_4f'; check('B3. 學姊：法學院第一次「{name}。……吃飯了嗎。」（AA_434 第 5 節：朋友以上叫名字）',J(await pre(SIS))===J([(H.G.name||'祐廷')+'。……吃飯了嗎。'])&&V6EX_LINES.EX.sisLaw==='{name}。……吃飯了嗎。');
  fresh('2026-10-14',20,'gongguan'); breakup(SIS,'apart_talk'); H.G.zone='gongguan'; H.G.flags.JOB_RA=true;
  check('B4. 研究助理還在做（JOB_RA）：「工作照舊。你不用勉強。」',J(await pre(SIS))===J(['工作照舊。你不用勉強。']));
  fresh('2026-10-14',20); date(ZQ); check('B5. 交往中：不說',!(await pre(ZQ)).length);
  fresh('2026-10-14',20); H.G.stage='econ'; H.G.flags.EX_heroine_04=true; check('B6. 經濟系那一年：不說',!(await pre(ZQ)).length);
});

/* ======================= T 麵店團 ======================= */
await sec('T',async()=>{
  const tue=D('2026-10-20');   /* 大二上第 7 週週二（麵店日）*/
  const team=()=>{ PHONE.join(H.G,'noodle_team','麵店團'); for(const id of ['zhe','yu']) SOCIAL.remember(id,'FIRST_MET',''); };
  fresh('2026-10-14',20); team(); date(AN); ROM.learn(H.G,'zhe',AN,'test'); ROM.learn(H.G,'yu',AN,'test'); ROM.learn(H.G,'classmate_bohan',AN,'test');
  at(tue,18); H.G.zone='noodle'; clear(); await tick();
  check('T1. 開始交往、他們知道：下一次麵店長桌，只有玩家認識的人說（柏翰沒見過＝不說）',J(H.said.map(s=>s.who+'：'+s.t))===J([SOCIAL.displayName('zhe')+'：請客。',SOCIAL.displayName('yu')+'：我早就知道了。']),J(H.said));
  clear(); await tick(); check('T1. 只演一次',!H.said.length);
  fresh('2026-10-14',20); team(); date(AN); at(tue,18); H.G.zone='noodle'; clear(); await tick();
  check('T2. 他們還不知道：不演',!H.said.length);
  fresh('2026-10-14',20); date(AN); ROM.learn(H.G,'zhe',AN,'test'); SOCIAL.remember('zhe','FIRST_MET',''); at(tue,18); H.G.zone='noodle'; clear(); await tick();
  check('T3. 不在麵店團（沒有群組）：不演',!H.said.length);
  fresh('2026-10-14',20); team(); date(AN); ROM.learn(H.G,'zhe',AN,'test'); at(tue+1,18); H.G.zone='noodle'; clear(); await tick();
  check('T4. 不是麵店日（週三）：不演',!H.said.length);
  fresh('2026-09-20',20); team(); date(YT); ROM.learn(H.G,'zhe',YT,'test'); ROM.end(H.G,YT,'apart_talk'); ROM.cleanup(H.G); date(AN); ROM.learn(H.G,'zhe',AN,'test');
  at(tue,18); H.G.zone='noodle'; clear(); await tick();
  check('T5. 和同一個朋友圈的另一個人開始（前任也是他們知道的）：阿哲「大家都是大人了。……麵還是一樣好吃。」',J(said())===J(['大家都是大人了。……麵還是一樣好吃。']),J(said()));
  /* 柏翰的筆記 */
  fresh('2026-10-16',20); SOCIAL.remember('classmate_bohan','FIRST_MET',''); INV.addContact(H.G,'classmate_bohan'); date(AN); ROM.learn(H.G,'classmate_bohan',AN,'test'); ROM.end(H.G,AN,'apart_talk');   /* 週五分開 */
  const NOTE='這兩堂的筆記。……你這幾天應該沒在聽。', mon=D('2026-10-19');   /* 10/19（一）是假日（calendar.js）；tue＝10/20（二）*/
  at(mon,13); STORY.phoneRules(GM); PHONE.tick(H.G); const m1=H.msgs('p:classmate_bohan').includes(NOTE);
  at(tue,12); STORY.phoneRules(GM); PHONE.tick(H.G); const m2=H.msgs('p:classmate_bohan').includes(NOTE);
  check('T6. 柏翰：週一放假、週二 12:10 以前不傳',CALENDAR.kind(mon)==='holiday'&&!m1&&!m2);
  at(tue,12.25); STORY.phoneRules(GM); PHONE.tick(H.G);
  check('T6. 下一個上課日（週二）12:10：「這兩堂的筆記。……你這幾天應該沒在聽。」、只一則',H.msgs('p:classmate_bohan').filter(t=>t===NOTE).length===1,J(H.msgs('p:classmate_bohan')));
  at(tue,15); STORY.phoneRules(GM); PHONE.tick(H.G); check('T6. 不重傳',H.msgs('p:classmate_bohan').filter(t=>t===NOTE).length===1);
  fresh('2026-10-16',20); SOCIAL.remember('classmate_bohan','FIRST_MET',''); INV.addContact(H.G,'classmate_bohan'); date(AN); ROM.end(H.G,AN,'apart_talk'); at(D('2026-10-19'),13); STORY.phoneRules(GM); PHONE.tick(H.G);
  check('T7. 柏翰不知道那段交往：不傳',!H.msgs('p:classmate_bohan').includes('這兩堂的筆記。……你這幾天應該沒在聽。'));
});

/* ======================= O 舊存檔 ======================= */
await sec('O',async()=>{
  fresh('2026-10-14',20); delete H.G.flags.V6EX; let err=null; try{ await tick(); STORY.phoneRules(GM); }catch(e){ err=e; }
  check('O1. 沒有 V6EX 的舊存檔照跑、不說話',!err&&!H.said.length&&!!H.G.flags.V6EX,String(err));
});

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); console.log('FAILED'); process.exit(1); });
