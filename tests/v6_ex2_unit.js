// 多段感情 v6 前任版（第二批，V6-A3、A6、S4）：要動別的檔案的那幾件——不需要瀏覽器。
//   台詞逐字對企劃（企劃線 claude/cool-heisenberg-o8kuqx @ d805bceee）：AA_123 4-3、4-3b、5-3；AA_182 第 2 節；AA_11 事件 17／AA_319 1A-13 ⑤（友情版、和別人交往中那兩句）。
//   G 畢業典禮（postgrad3d.js）：以安新 21、語彤事件 17 的前任＝友情版（修改前前任直接不演）
//   S 以安新 9（syllabus.js 的 exAfter，tools/syllabus/import_syllabus.py 從 AA_123 匯入；src/v6ex3d.js 的 ev_an_ex_admin 下課後演）
//   N 以安新 8（ev_plg_rules_after 週六補讀，她看到你那一句）
//   H 週末在臺北的家（home3d.js 的 HOME.MENU_OPTS）：七天內多一個「收拾」　P 手機筆記（V6EX.note、V6EX.PHONE_ACT）
//   X AA_434（企劃線 434e6d6d7）：可昕分開後第一次見面、Alison 的貼圖、芯慈留位子、之後一個學期她先傳的少一半＋不主動約
//   T 手機「今天」頁的按鈕（game3d.js 讀 PHONE.TODAY_ACTS）：分開以後一週內「手機筆記寫一行」（AA_182「手機裡，隨時可以」）
// 修改前（開發分支 HEAD 9a285f768）：G1、G2、S、N、H、P 失敗。用法：node tests/v6_ex2_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const EXPORT=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES|Y34B|V6EX|V6EX_LINES|NEEDED_MSGS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.Z3={ZONES:{}};
const loadErr=[]; for(const f of ['src/data/needed_msgs.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js','src/y34b3d.js','src/data/v6ex_lines.js','src/v6ex3d.js']){ try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const V=()=>typeof V6EX!=='undefined'&&V6EX&&V6EX.menu?V6EX:null;
const AN='heroine_01', YT='heroine_03', ZQ='heroine_04', KX='kexin';
const D=k=>STORY.dayOfKey(k), wdOf=d=>CALENDAR.dateOf(d).wd%7;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const said=()=>H.said.map(s=>s.t);
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const clear=p=>{ H.said=[]; H.opts=[]; H.bgs=[]; H.cgs=[]; H.picks=(p||[]).slice(); };
const ex=id=>{ H.G.flags['EX_'+id]=true; H.G.flags['dating_'+id]=false; };

(async()=>{
check('0. 檔案載得到',!loadErr.length&&!!V(),loadErr.join('；'));

/* ======================= G 畢業典禮 ======================= */
const grad=async(setup)=>{ const G=H.fresh('2029-06-02',8,'dorm'); ['zhe','yu','classmate_bohan','classmate_xinci'].forEach(H.FAMILIAR); setup(G);
  await STORY.gradFamily(GM); clear(); await H.run('grad'); return G; };
await sec('G',async()=>{
  await grad(()=>{ H.FRIEND(AN); ex(AN); });
  check('G1. 和以安分開過（FRIEND）：新 21 友情版——媽媽、CG-9、「謝謝你們這四年陪她吵架。」（修改前前任不演）',H.has('（以安的媽媽站在晨思鐘旁邊。）')&&H.has('這是我媽。她是法官。')&&H.cgs.includes('cg_graduation_mother_heroine01')&&H.has('（對大家，很平常）謝謝你們這四年陪她吵架。'),J(said().slice(0,8)));
  check('G1. 沒有「媽，這是祐廷。」那一段、沒有選項',!said().some(t=>/^媽，這是/.test(t))&&!H.has('我知道。妳說過很多次。')&&!H.opts.some(o=>o.includes('「伯母好。」')));
  await grad(()=>{ ex(AN); });
  check('G1. 前任、還不到 FRIEND：不演（和朋友一樣的門檻）',!H.has('（以安的媽媽站在晨思鐘旁邊。）'));
  await grad(()=>{ H.FRIEND(YT); ex(YT); });
  check('G2. 和語彤分開過（FRIEND）：事件 17 友情版「恭喜。……我還要一年，今天先穿一次學士服。」、沒有 CG-21、沒有斜對面那句',H.has('（語彤穿著學士服，手上拿著一把深藍色的長柄傘。外面在飄雨。）')&&H.has('阿姨說今天不開店。她要來拍照。')&&H.has('恭喜。……我還要一年，今天先穿一次學士服。')&&!H.cgs.includes('cg_one_umbrella_heroine03')&&!H.has('恭喜。……四年，我們都在總圖三樓。你都坐我斜對面。'),J(said()));
  await grad(()=>{ H.FRIEND(YT); ex(YT); H.CLOSE(ZQ); ROM.start(H.G,ZQ); });
  check('G2. 前任、現在和別人交往中：「恭喜。我證書還要再等一年。」',H.has('恭喜。我證書還要再等一年。')&&!H.has('恭喜。……我還要一年，今天先穿一次學士服。'));
});

/* ======================= S 以安新 9 ======================= */
await sec('S',async()=>{
  const w12=(SYLLABUS.courses.admin_law||[]).find(w=>w.w===12)||{};
  check('S1. syllabus.js：行政法第 12 週（新 9 的課堂）多 exAfter「剛剛那個，是課堂上的。」（以安）；來源寫 AA_123@d805bceee',J(w12.exAfter)===J([{who:AN,text:'剛剛那個，是課堂上的。'}])&&(w12.react||[]).some(r=>r.text==='……你這樣講，我要改我的答案。')&&/AA_123@d805bceee/.test(SYLLABUS.source),J([w12.exAfter,SYLLABUS.source]));
  const e=ev('ev_an_ex_admin');
  check('S2. ev_an_ex_admin：行政法下課後（afterClass admin_law、大二上第 12 週、一次）',!!e&&e.afterClass==='admin_law'&&J(e.term)===J(['Y2S1'])&&J(e.weeks)===J([12])&&e.once===true);
  let d=null; for(let x=D('2026-09-01');x<D('2027-02-01');x++){ const t=CALENDAR.termOf(x); if(t&&t.id==='Y2S1'&&t.week===12&&wdOf(x)===1){ d=x; break; } }
  const it={c:(COURSES.list||COURSES.courses||[]).find?((COURSES.list||COURSES.courses||[]).find(c=>c.id==='admin_law')||{id:'admin_law'}):{id:'admin_law'},exam:null};
  const run=async(setup)=>{ H.fresh('2026-12-07',11,'classroom'); H.G.day=d; H.G.hour=11.5; H.G.weekday=wdOf(d); H.FRIEND(AN); setup(); clear(); const r=await CLS.afterClassEvent(GM,it); return r; };
  let r=await run(()=>ex(AN));
  check('S3. 和以安分開過：下課後「剛剛那個，是課堂上的。」（以安）',r===true&&J(H.said.map(s=>s.t))===J(['剛剛那個，是課堂上的。'])&&H.said[0].who===SOCIAL.displayName(AN),J(H.said));
  r=await run(()=>{}); check('S4. 沒分開過：沒有',!r&&!H.has('剛剛那個，是課堂上的。'));
  r=await run(()=>{ H.CLOSE(AN); ROM.start(H.G,AN); }); check('S5. 交往中：沒有',!r&&!H.has('剛剛那個，是課堂上的。'));
  H.fresh('2026-12-07',11,'classroom'); H.G.day=d+7; H.G.hour=11.5; H.G.weekday=wdOf(d+7); H.FRIEND(AN); ex(AN); clear(); r=await CLS.afterClassEvent(GM,it);
  check('S6. 第 13 週：沒有',!r&&!H.has('剛剛那個，是課堂上的。'));
});

/* ======================= N 以安新 8 ======================= */
await sec('N',async()=>{
  const e=ev('ev_plg_rules_after'), dl=e.dialogue, i=dl.findIndex(l=>l&&l.text==='……你也來了。坐原來的位子。'), c=dl.findIndex(l=>l&&l.cg==='cg_plg_rules');
  check('N1. ev_plg_rules_after：「……你也來了。坐原來的位子。」（以安）在 CG-2 那一拍前面',i>=0&&c===i+1&&dl[i].speaker===AN&&e.v6exPatched===true,J([i,c]));
  H.fresh('2026-10-17',14,'wancai'); H.FRIEND(AN); ex(AN); clear(); await EVENTS.run(e);
  const s=said(); check('N2. 前任：她看到你那一句，接著「……好。開始。每人十分鐘。」照常',s.indexOf('……你也來了。坐原來的位子。')>=0&&s.indexOf('……你也來了。坐原來的位子。')<s.indexOf('（回頭看長桌，白板上三行字）……好。開始。每人十分鐘。')&&H.cgs.includes('cg_plg_rules'),J(s));
  H.fresh('2026-10-17',14,'wancai'); H.FRIEND(AN); clear(); await EVENTS.run(e);
  check('N3. 沒分開過：沒有那一句',!H.has('……你也來了。坐原來的位子。')&&H.has('人回來了。八個人。'));
});

/* ======================= H 週末在家 ======================= */
await sec('H',async()=>{
  check('H0. HOME.MENU_OPTS 有 V6EX.homeOpt',Array.isArray(HOME.MENU_OPTS)&&HOME.MENU_OPTS.includes(V().homeOpt));
  const SAT=D('2026-10-17');   /* 大二上第 6 週週六 */
  const home=(flags)=>{ const G=H.fresh('2026-10-17',14,'dorm',{ROOM_Y2:D('2026-09-06')}); G.day=SAT; G.hour=14; G.weekday=wdOf(SAT); for(const id of [AN]) H.FRIEND(id); HOME.rec(G).at=true; HOME.rec(G).eat={day:SAT}; return G; };
  home(); H.CLOSE(ZQ); ROM.start(H.G,ZQ); ROM.end(H.G,ZQ,'apart_talk'); V().rec(H.G).entry=null; clear(['收拾','算了','回宿舍']); await HOME.loop(GM);
  check('H1. 週末在家、七天內：選單多一個「收拾」；選了出四個選項（和阿哲不熟＝沒有那一項）；「算了」＝還沒收拾',(H.opts[0]||[]).includes('收拾')&&J(H.opts[1])===J(['還東西、收紙箱','手機筆記寫一行','把插座貓貼紙撕下來','算了'])&&H.G.flags.CLEANUP_DONE===false,J(H.opts.slice(0,3)));
  check('H1. 回到週末選單（「收拾」還在），再選「回宿舍」',(H.opts[2]||[]).includes('收拾')&&(H.opts[2]||[]).includes('回宿舍'),J(H.opts[2]));
  home(); H.FAMILIAR('zhe'); H.CLOSE(ZQ); ROM.start(H.G,ZQ); ROM.end(H.G,ZQ,'apart_talk'); V().rec(H.G).entry=null; const n0=H.msgs('p:zhe').length; clear(['收拾','和阿哲',1,'回宿舍']); await HOME.loop(GM);
  check('H2. 週末在家選阿哲＝打電話（不傳「頂樓？」）、同一段話、收拾過；選單不再有「收拾」',H.msgs('p:zhe').length===n0&&H.has('要吃什麼？我請。……不想講也可以。')&&H.G.flags.CLEANUP_ZHE===1&&H.G.flags.CLEANUP_DONE===true&&!(H.opts[H.opts.length-1]||[]).includes('收拾'),J(H.opts));
  home(); clear(['回宿舍']); await HOME.loop(GM);
  check('H3. 沒分開過：週末選單沒有「收拾」',!(H.opts[0]||[]).includes('收拾')&&(H.opts[0]||[]).includes('回宿舍'),J(H.opts[0]));
});

/* ======================= P 手機筆記 ======================= */
await sec('P',async()=>{
  H.fresh('2026-10-14',20,'dorm'); H.CLOSE(AN); ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk');
  const A=V().PHONE_ACT; check('P1. PHONE_ACT：「手機筆記寫一行」、七天內才顯示',!!A&&A.label==='手機筆記寫一行'&&A.show(H.G)===true);
  clear([2]); await A.run(GM);
  check('P2. 選「下次我會先說。」：記 CLEANUP_NOTE、收拾過、之後不顯示',J(H.opts[0])===J(['「謝謝妳。」','「是我們都沒錯。」','「下次我會先說。」'])&&H.G.flags.CLEANUP_NOTE==='「下次我會先說。」'&&H.G.flags.CLEANUP_DONE===true&&A.show(H.G)===false);
});

/* ======================= X AA_434 ======================= */
const pre=async id=>{ clear(); await V().preTalk(GM,{name:id},id); return H.said.map(x=>(x.who?'她：':'旁白：')+x.t); };
await sec('X',async()=>{
  /* 可昕 */
  H.fresh('2027-10-14',20,'campus'); H.CLOSE(KX); ROM.start(H.G,KX); ROM.end(H.G,KX,'drift'); H.G.flags.KX_ENDED='drift';
  check('X1. 可昕（慢慢分開）第一次當面：「嗨。」（她停了一下，把耳機拿下來。）「……你也來這裡喔。」、只一次',J(await pre(KX))===J(['她：嗨。','旁白：（她停了一下，把耳機拿下來。）','她：……你也來這裡喔。'])&&!(await pre(KX)).length);
  H.fresh('2027-10-14',20,'campus'); H.CLOSE(KX); ROM.start(H.G,KX); ROM.end(H.G,KX,'drift'); H.G.flags.KX_ENDED='drift'; global.KXDRIFT={frOn:()=>true};
  const fr=await pre(KX); delete global.KXDRIFT; check('X1. D6 那頓午餐（AA_351）已經當面見過＝照它，不說',!fr.length);
  H.fresh('2027-10-14',20,'campus'); H.CLOSE(KX); ROM.start(H.G,KX); ROM.end(H.G,KX,'mrel');
  check('X1. 被發現（不是走向 B、C）：不說',!(await pre(KX)).length);
  /* Alison 的貼圖 */
  const STK='（貼圖：一隻熊拍另一隻熊的肩膀）';
  const yuSet=(h,friend,knows)=>{ H.fresh('2026-10-14',h,'dorm'); if(friend) H.FRIEND('yu'); else H.FAMILIAR('yu'); INV.addContact(H.G,'yu'); H.CLOSE(AN); ROM.start(H.G,AN); if(knows) ROM.learn(H.G,'yu',AN,'test'); ROM.end(H.G,AN,'apart_talk'); };
  const rules=(k,h)=>{ H.G.day=typeof k==='number'?k:D(k); H.G.hour=h; H.G.weekday=wdOf(H.G.day); STORY.phoneRules(GM); PHONE.tick(H.G); return H.msgs('p:yu').filter(t=>t===STK).length; };
  yuSet(20,true,true); const a1=rules('2026-10-14',21.9), a2=rules('2026-10-14',22.1), a3=rules('2026-10-15',23);
  check('X2. Alison（朋友、她知道）：分開那天 22:00 一張貼圖、沒有文字、只一次',a1===0&&a2===1&&a3===1&&H.msgs('p:yu').every(t=>t===STK||!/熊/.test(t)),J(H.msgs('p:yu')));
  yuSet(23,true,true); const b1=rules('2026-10-14',23.5), b2=rules('2026-10-15',22.05);
  check('X2. 22:00 以後才分開：隔天 22:00',b1===0&&b2===1);
  yuSet(20,false,true); check('X2. 和她不到朋友：不傳',rules('2026-10-14',22.5)===0);
  yuSet(20,true,false); check('X2. 她不知道那一段：不傳',rules('2026-10-14',22.5)===0);
  /* 芯慈留位子 */
  const SEAT=['（研討室。你常坐的那個位子上，放著芯慈的筆袋。）','（你走過去的時候，她把筆袋拿走，放回自己桌上。沒有說話。）'], thu=D('2026-10-15');
  const plg=()=>{ H.G.acts.att['public_law_group@'+H.G.day]={end:'full'}; return CLS.clubEvent(H.G,{id:'public_law_group'}); };
  const seatSet=(who,xc)=>{ H.fresh('2026-10-08',20,'wancai'); H.G.acts={att:{}}; H.G.events.done.ev_public_law_group=1; if(xc) H.FAMILIAR('classmate_xinci'); H.CLOSE(who); ROM.start(H.G,who); ROM.end(H.G,who,'apart_talk'); H.G.day=thu; H.G.hour=20; H.G.weekday=wdOf(thu); H.G.zone='wancai'; };
  seatSet(ZQ,true); let e=plg(); clear(); if(e) await EVENTS.run(e);
  check('X3. 和子晴分開、和芯慈有點熟：分開以後第一次讀書會兩句旁白（沒有以安那一句）',e&&e.id==='ev_an_ex_plg'&&J(said())===J(SEAT),J([e&&e.id,said()]));
  H.G.day=thu+7; H.G.weekday=wdOf(thu+7); e=plg(); check('X3. 下一次讀書會不再演',!e||e.id!=='ev_an_ex_plg');
  seatSet(AN,true); e=plg(); clear(); if(e) await EVENTS.run(e);
  check('X3. 和以安分開：先芯慈的筆袋、再以安「規則沒有改。……你也不用換位子。」',J(said())===J(SEAT.concat(['規則沒有改。……你也不用換位子。'])),J(said()));
  seatSet(ZQ,false); e=plg(); check('X3. 和芯慈不到有點熟：沒有',!e||e.id!=='ev_an_ex_plg');
  seatSet(ZQ,true); H.G.acts.att['public_law_group@'+(thu-7)]={end:'full'}; H.G.events.done.ev_public_law_group=1; ROM.get(H.G,ZQ); { const R=H.G.flags.V6EX; R.seat[0].day=thu-9; } e=plg();
  check('X3. 分開以後已經去過一次讀書會（那次沒演）：之後不補',!e||e.id!=='ev_an_ex_plg');
  /* 之後一個學期 */
  const y2s2=(()=>{ for(let x=D('2027-01-01');x<D('2027-04-01');x++){ const t=CALENDAR.termOf(x); if(t&&t.id==='Y2S2'&&t.week===1) return x; } return null; })();
  check('X4. 期間：大二上分開（10/14）、寒假分開（1/20）都到大二下第 1 週',V().coolUntil(D('2026-10-14'))===y2s2&&V().coolUntil(D('2027-01-20'))===y2s2&&y2s2!=null,J([V().coolUntil(D('2026-10-14')),y2s2]));
  H.fresh('2026-10-14',20,'dorm'); H.CLOSE(ZQ); ROM.start(H.G,ZQ); ROM.end(H.G,ZQ,'apart_talk');
  check('X4. 分開那天起算、交往中不算；第 1 週那天恢復',V().cool(H.G,ZQ)&&!V().cool(Object.assign({},H.G,{day:y2s2}),ZQ)&&V().cool(Object.assign({},H.G,{day:y2s2-1}),ZQ));
  const q0=PHONE.rec(H.G).q.length, I=t=>[{th:'p:'+ZQ,from:ZQ,text:t}];
  const r1=PHONE.at(H.G,H.G.day+1,21,I('一'),'dp_zq_f1_0_0'), r2=PHONE.at(H.G,H.G.day+8,21,I('二'),'dp_zq_f1_1_0'), r3=PHONE.at(H.G,H.G.day+15,21,I('三'),'dp_zq_f1_2_0');
  const qd=PHONE.rec(H.G).q.slice(q0).map(q=>q.items[0].text);
  check('X4. 手機小事（dp_）：她傳的第 1、3 則送、第 2 則跳過',J(qd)===J(['一','三'])&&r2===false,J(qd));
  const g0=PHONE.rec(H.G).q.length; PHONE.at(H.G,H.G.day+2,21,[{th:'g:guitar',from:ZQ,text:'群組'}],'dp_ziqing_five_0_0'); PHONE.at(H.G,H.G.day+3,21,I('劇情'),'zq_story_x');
  check('X4. 群組、不是手機小事的私訊：照常',PHONE.rec(H.G).q.length===g0+2);
  { const need=(pre)=>{ H.fresh('2027-05-01',20,'dorm'); H.CLOSE(ZQ); ROM.start(H.G,ZQ); ROM.end(H.G,ZQ,'apart_talk'); H.FAMILIAR(ZQ); if(pre) pre(); return STORY.neededPick(H.G,D('2027-05-16')).map(e=>e.id); };
    const n1=need(), n2=need(()=>{ H.G.flags.V6EX.cool[ZQ].n.need=1; }), n2b=STORY.neededPick(H.G,D('2027-05-16')).map(e=>e.id), n3=need(()=>{ delete H.G.flags.V6EX.cool; });
    check('X4. 主線 4 這週的訊息（STORY.neededPick，子晴「我爸下週要來台北」5/16）：她輪到的第 1 次送、第 2 次拿掉；同一週再問一樣；沒有冷卻照常',n1.includes('zq_dad')&&!n2.includes('zq_dad')&&J(n2b)===J(n2)&&n3.includes('zq_dad'),J([n1,n2,n3])); }
  H.fresh('2026-10-13',21.5,'dorm'); H.CLOSE(AN); ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk');
  check('X4. 以安週二約讀書會完吃飯（INV.anAsk）：這段期間不約',INV._v6exAsk===true&&INV.anAsk(H.G)===false&&!(H.G.invites||[]).some(iv=>iv.who===AN&&iv.by==='npc'));
  check('X4. 可昕不管（照 AA_351）',!V().COOL_IDS.includes(KX));
  /* 寒暑假活動她私訊約（vac3d.js 的 signup kind dm）：這段期間不傳；報名的公告欄照樣在 */
  const c03=ok=>{ H.fresh('2026-06-01',10,'dorm'); H.G.stage='law'; H.FRIEND(AN); INV.addContact(H.G,AN); if(!ok){ H.CLOSE(AN); ROM.start(H.G,AN); ROM.end(H.G,AN,'apart_talk'); H.FRIEND(AN); } H.G.day=D('2026-06-20'); H.G.hour=21.1; H.G.weekday=wdOf(H.G.day); STORY.phoneRules(GM); PHONE.tick(H.G); return H.msgs('p:'+AN).includes('我暑假要上日語課，公館那間，週二四晚上'); };
  check('X4. 寒暑假活動以安私訊約（C03 日語課 6/20 21:00）：平常傳；6/1 和她分開＝這段期間不傳（vac3d.js 讀 V6EX.cool）',c03(true)&&!c03(false));
});

/* ======================= T 手機「今天」頁的按鈕 ======================= */
await sec('T',async()=>{
  const src=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
  const fm=/  function todayActsHTML\(\)\{[^\n]*\n/.exec(src), hm=/    body\.querySelectorAll\('\[data-tact\]'\)[^\n]*\n/.exec(src);
  check('T0. game3d.js：「今天」頁接 todayActsHTML()、按鈕 data-tact 的處理',!!fm&&!!hm&&/invTodayHTML\(\)\+todayActsHTML\(\)\+CLS\.todayHTML\(G\)/.test(src));
  if(!fm||!hm) return;
  const escH=t=>String(t).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'})[c]);
  H.fresh('2026-10-14',20,'dorm'); H.CLOSE(AN); ROM.start(H.G,AN);
  const ctx={PHONE,G:H.G,escH}; vm.runInNewContext(fm[0]+';this.f=todayActsHTML;',ctx); const html=()=>ctx.f();
  check('T1. 沒分開：「今天」頁沒有按鈕',html()==='');
  ROM.end(H.G,AN,'apart_talk'); const i=PHONE.TODAY_ACTS.indexOf(V().PHONE_ACT);
  check('T2. 分開以後一週內：「手機筆記寫一行」按鈕（data-tact）',i>=0&&html().includes('data-tact="'+i+'"')&&html().includes('>手機筆記寫一行</button>'),html());
  /* 按下去：收手機 → sceneBegin → run → sceneEnd → 存檔 → 打開「今天」*/
  const calls=[], btn={dataset:{tact:String(i)}}; const hctx={PHONE,G:H.G,E:{player:{busy:false}},GM,body:{querySelectorAll:()=>[btn]},closePhone:()=>calls.push('close'),sceneBegin:()=>calls.push('begin'),sceneEnd:()=>calls.push('end'),autosave:()=>calls.push('save'),openPhone:t=>calls.push('open:'+t)};
  vm.runInNewContext(hm[0],hctx); clear([1]); await btn.onclick();
  check('T3. 按下去：收起手機、三句選一（照原文）、記 CLEANUP_NOTE、收拾過、存檔、回到「今天」',J(calls)===J(['close','begin','end','save','open:today'])&&J(H.opts[0])===J(['「謝謝妳。」','「是我們都沒錯。」','「下次我會先說。」'])&&H.G.flags.CLEANUP_NOTE==='「是我們都沒錯。」'&&H.G.flags.CLEANUP_DONE===true,J([calls,H.opts]));
  check('T4. 收拾過以後：按鈕不見',html()==='');
  calls.length=0; await btn.onclick(); check('T4. 舊的按鈕再按：不做事',calls.length===0);
});

H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); console.log('FAILED'); process.exit(1); });
