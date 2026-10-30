// AA_342（企劃線 f2de8d1cd，白名單 f2de8d1c）臺灣路線補空白：第 2-1 節大二上、第 3-2 節大三下、第 4 節大四（src/data/twfill_events.js、src/twfill3d.js）。不需要瀏覽器。
//   0 讀稿、每一句都在 AA_342  1 大二上（9/28、10/8 群組、服務學習 10/7、11/18、12/10 麵店）
//   2 大三下（4/12 摘要日、母親節、5/18 群組、5/26 摘要日、5/27 阿凱、5/28 粽子；日本路線人在日本不出）
//   3 大四上（9/28、10/27、10/31 群組、11/1 讀書會群組、11/3 摘要日、11/17 柏翰、12/7 最後一次讀書會、12/8 摘要日；美國路線不出）
//   4 大四下（3/1 麵店、4/11 海商法期中考、4/13 群組、學士服拍照、畢業紀念冊、5/17 群組、5/24 麵店、5/25 阿凱）
// 修改前（開發分支 deec4d03e）：沒有這兩個檔、沒有這些句子——FAIL。用法：node tests/aa342_twfill_unit.js
require('./alison.js');
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path'), cp=require('child_process');
const {check,GM}=H;
const load=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)) return false; let src=fs.readFileSync(p,'utf8'); src=src.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(src,{filename:f}); return true; };
let err=''; try{ load('src/data/twfill_events.js'); load('src/twfill3d.js'); }catch(e){ err=String(e); }
const git=(sha,f)=>{ try{ return cp.execSync('git show '+sha+':"docs/story_planning/'+f+'"',{cwd:H.ROOT,encoding:'utf8',maxBuffer:1<<26}); }catch(e){ return ''; } };
const DOC=git('f2de8d1cd','AA_342_臺灣路線六學期_每一週能做什麼_覆蓋盤點與補空白.md');
const J=JSON.stringify, ev=id=>STORY_EVENTS.find(e=>e.id===id), X=()=>typeof TWFILL!=='undefined'?TWFILL:null, L=()=>TWFILL_LINES;
const NG='g:noodle_team', BH='classmate_bohan', XC='classmate_xinci', AN='heroine_01';
const setT=(k,h)=>{ const G=H.G, d=typeof k==='number'?k:H.D(k); G.day=d; G.hour=h; const w=CALENDAR.dateOf(d).wd; G.weekday=w===7?0:w; };
const fresh=(k,h,zone,flags,o)=>{ o=o||{}; const G=H.fresh('2026-09-01',h,zone||'dorm',flags||{}); setT(k,h); G.outings=[]; G.contacts=G.contacts||{};
  for(const id of (o.know||[])) H.FAMILIAR(id); for(const g of (o.groups||['noodle_team'])) PHONE.join(G,g,g); X().reset(); return G; };
const rules=()=>{ X().phone(H.G); PHONE.tick(H.G); };
const msgs=th=>(H.G.msgs||[]).filter(m=>m.th===th);
const grp=(th,tag)=>msgs(th).filter(m=>m.tag===tag).map(m=>m.from+':'+m.text);
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const run=async(id,picks)=>{ H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); return H.said.map(s=>s.t); };
const sumAt=(k,h)=>{ setT(k,h); H.cards=[]; X().reset(); X().tick(GM); return H.cards.map(c=>c[1]); };
const ents=(G,k,h)=>{ setT(k,h); G.zone='noodle'; return EVENTS.check; };

(async()=>{
  check('0. 讀稿（企劃線 AA_342 @f2de8d1cd，白名單 f2de8d1c；企劃線上沒有更新的版本）',DOC.indexOf('### 2-1. 大二上')>=0&&DOC.indexOf('### 4-2. 大四下')>=0);
  check('0. 檔案載得到：TWFILL、TWFILL_EVENTS 進了 STORY_EVENTS',!!X()&&!err&&TWFILL_EVENTS.every(e=>STORY_EVENTS.includes(e)),err);
  if(!X()){ H.done(); return; }
  await sec('0',async()=>{
    const all=[]; const walk=v=>{ if(typeof v==='string') all.push(v); else if(Array.isArray(v)) v.forEach(walk); };
    for(const k in L()) walk(L()[k]);
    const ids=/^(classmate_xinci|classmate_bohan|zhe|yu|sister|heroine_01|auntie|thursday|notyet)$/;
    const bad=all.filter(t=>!ids.test(t)&&DOC.indexOf(t)<0&&DOC.indexOf(t.replace(/^「|」$/g,''))<0);
    check('0. TWFILL_LINES 的每一句都在 AA_342（人物 id、記錄的代號除外）',bad.length===0,bad.join('｜'));
    const src=fs.readFileSync(path.join(H.ROOT,'src/data/twfill_events.js'),'utf8');
    check('0. 沒有「小語」（改名 Alison，AA_380）',src.indexOf('小語')<0);
  });

  /* ===== 1 大二上 ===== */
  await sec('1',async()=>{
    let G=fresh('2026-09-28',20.9); rules(); check('1. 9/28 21:00 以前沒有',!grp(NG,'tw_y2_teachers').length);
    setT('2026-09-28',21.05); rules();
    check('1. 9/28（一）教師節 21:00 麵店團：芯慈「今天教師節。我傳訊息給高中的導師。」「她回我：妳是誰。」、阿哲「哈哈哈哈」',J(grp(NG,'tw_y2_teachers'))===J([XC+':今天教師節。我傳訊息給高中的導師。',XC+':她回我：妳是誰。','zhe:哈哈哈哈']),J(grp(NG,'tw_y2_teachers')));
    G=fresh('2026-10-08',21.05); rules(); check('1. 10/8（四）21:00 連假前一晚：阿哲「連假 去哪」、Alison「睡覺」、柏翰「圖書館。」',J(grp(NG,'tw_y2_long_weekend'))===J(['zhe:連假 去哪','yu:睡覺',BH+':圖書館。']),J(grp(NG,'tw_y2_long_weekend')));
    G=fresh('2026-10-11',21.05); rules(); check('1. 晚兩天以上才讀到的不補（同 y3fill3d.js）',!grp(NG,'tw_y2_long_weekend').length);
    G=fresh('2026-10-08',21.05,'dorm',{},{groups:[]}); rules(); check('1. 不在麵店團群組：沒有',!msgs(NG).length);
    const svc=async(k,flags)=>{ const G=fresh(k,15.3,'campus',flags||{}); const it=CLS.dayItems(G).find(i=>i.c.id==='service_2'); H.said=[]; await CLS.attend(GM,it,{door:true}); return {L:H.said.map(s=>s.t),G}; };
    let r=await svc('2026-10-07');
    check('1. 10/7（三）服務學習（二）那一堂換旁白：「（服務學習的第二次。…陪一位阿公下象棋。他贏了三盤。）」；記 Y2_SVC_CHESS；課程的 serviceLines 換回去',J(r.L)===J([L().svc1007])&&r.G.flags.Y2_SVC_CHESS===r.G.day&&CLS.byId('service_2').serviceLines===undefined,J(r.L));
    r=await svc('2026-11-18',{Y2_SVC_CHESS:H.D('2026-10-07')}); check('1. 11/18（三）接 10/7：「（服務學習快結束了。阿公終於輸了一盤。…其實是他讓的。）」',J(r.L)===J([L().svc1118]),J(r.L));
    r=await svc('2026-11-18'); check('1. 11/18 沒看過 10/7 那一堂：照一般的句子（阿公沒見過）',r.L.length===1&&r.L[0]!==L().svc1118&&!/阿公/.test(r.L[0]),J(r.L));
    r=await svc('2026-10-14'); check('1. 其他週照一般的句子',r.L.length===1&&!/阿公/.test(r.L[0]),J(r.L));
    const N=ev('ev_y2s1_noodle_1210');
    G=fresh('2026-12-10',18,'noodle'); EVENTS.zoneChanged&&EVENTS.zoneChanged(); const a=EVENTS.check(N); setT('2026-12-03',18); const b=EVENTS.check(N); G=fresh('2026-12-10',18,'noodle',{},{groups:[]}); const c=EVENTS.check(N);
    check('1. 12/10（四）進麵店（麵店團的時段）：「（期末前的週四。阿姨在每一碗裡多加了一顆蛋，說是考試加持。）」；12/3 不演、不在麵店團不演；只演一次',a&&!b&&!c&&N.once&&J(N.dialogue.map(l=>l.text))===J([L().noodle1210]));
  });

  /* ===== 2 大三下 ===== */
  await sec('2',async()=>{
    let G=fresh('2028-04-12',18.6); check('2. 4/12（三）摘要日：「（大三下的期中考。你在考卷背面算了一下：再三個學期就畢業了。）」（18:30 以後、日期卡）',J(sumAt('2028-04-12',18.6))===J([L().sum0412]));
    check('2. 摘要日只出一次',sumAt('2028-04-12',19).length===0);
    G=fresh('2028-04-12',18.6,'dorm',{EXCHANGE_ROUTE:'JP'}); check('2. 日本路線（4/12 人在日本）：沒有',STORY.abroad(G)&&sumAt('2028-04-12',18.6).length===0);
    G=fresh('2028-05-10',21.05,'dorm',{},{groups:['home']}); rules(); const m=msgs('g:home').filter(x=>x.tag==='tw_y3_mom_day_ask');
    check('2. 5/10（三）21:00 家人群組：姊姊「禮拜天母親節 你回不回來吃」＋「回。」「這週不行。」',m.length===1&&m[0].from==='sister'&&m[0].name==='姊姊'&&m[0].text===L().momAsk&&J(m[0].ask.opts.map(o=>o.t))===J(['回。','這週不行。']),J(m));
    PHONE.answer(G,'tw_y3_mom_day_ask',0); rules(); const q=OUT.get(G,'tw_y3_mom_day');
    check('2. 「回。」＝5/14（日）18:00 臺北的家（出遊）',G.flags.Y3_MOM_DAY==='go'&&!!q&&q.day===H.D('2028-05-14')&&q.h===18&&q.ev==='ev_y3_mothers_day',J(q));
    let Lm=await run('ev_y3_mothers_day'); check('2. 5/14 臺北的家：「（媽媽煮了一桌。姊姊買了蛋糕，上面寫的「媽媽辛苦了」，字是歪的。）」、媽媽「……你爸在視訊裡也說了一次。」',J(Lm)===J([L().momDay,L().momLine])&&H.G.flags.Y3_MOM_DAY==='went'&&H.said[1].who==='媽媽',J(H.said));
    G=fresh('2028-05-10',21.05,'dorm',{},{groups:['home']}); rules(); PHONE.answer(G,'tw_y3_mom_day_ask',1); rules();
    check('2. 「這週不行。」＝姊姊「好 我跟媽說」、沒有出遊',msgs('g:home').some(x=>x.from==='sister'&&x.text==='好 我跟媽說')&&!OUT.get(G,'tw_y3_mom_day')&&G.flags.Y3_MOM_DAY==='no');
    G=fresh('2028-05-18',21.05); rules(); check('2. 5/18（四）21:00：阿哲「暑假誰留台北」、Alison「我」、柏翰「新竹。」、芯慈「永和。永和算台北。」',J(grp(NG,'tw_y3_summer'))===J(['zhe:暑假誰留台北','yu:我',BH+':新竹。',XC+':永和。永和算台北。']),J(grp(NG,'tw_y3_summer')));
    G=fresh('2028-05-26',18.6); check('2. 5/26（五）摘要日：「（大三最後一個月。宿舍走廊有人開始收紙箱。）」',J(sumAt('2028-05-26',18.6))===J([L().sum0526]));
    for(const [k,t,r] of [[0,'還沒想。','我也是'],[1,'要。','那我們暑假又在同一棟了']]){ G=fresh('2028-05-27',22.05,'dorm',{},{know:['kai']}); rules(); const km=msgs('p:kai');
      const ok0=km.length===1&&km[0].text==='暑假宿舍你要續住嗎'&&J(km[0].ask.opts.map(o=>o.t))===J(['還沒想。','要。']); PHONE.answer(G,'tw_y3_kai_dorm',k);
      check('2. 5/27（六）22:00 阿凱「暑假宿舍你要續住嗎」→「'+t+'」→「'+r+'」',ok0&&J(msgs('p:kai').slice(-2).map(x=>x.text))===J([t,r]),J(msgs('p:kai').map(x=>x.text))); }
    G=fresh('2028-05-28',11.9); rules(); check('2. 端午 12:00 以前沒有',!msgs('p:mom').length);
    setT('2028-05-28',12.05); rules(); check('2. 5/28（日）端午 12:00 媽媽私訊「粽子寄去宿舍了。十顆。分給室友。」',J(msgs('p:mom').map(x=>x.text))===J([L().zongzi]));
    G=fresh('2028-05-28',12.05,'dorm',{EXCHANGE_ROUTE:'JP'},{groups:['noodle_team','home'],know:['kai']}); rules(); setT('2028-05-18',21.05); rules(); setT('2028-05-10',21.05); rules();
    check('2. 日本路線（人在日本）：母親節、群組、粽子都沒有',!msgs('p:mom').length&&!msgs(NG).length&&!msgs('g:home').some(x=>x.tag==='tw_y3_mom_day_ask'));
  });

  /* ===== 3 大四上 ===== */
  await sec('3',async()=>{
    let G=fresh('2028-09-28',21.05); rules(); check('3. 9/28（四）教師節 21:00：Alison「教師節。我傳訊息給大一的導師。」「她說她記得我。……然後把我的名字打錯了。」',J(grp(NG,'tw_y4_teachers'))===J(['yu:教師節。我傳訊息給大一的導師。','yu:她說她記得我。……然後把我的名字打錯了。']),J(grp(NG,'tw_y4_teachers')));
    G=fresh('2028-10-27',21.05); rules(); check('3. 10/27（五）21:00：阿哲「大四的期中考 為什麼還是期中考」、Alison「因為你還沒畢業」',J(grp(NG,'tw_y4_mid_1027'))===J(['zhe:大四的期中考 為什麼還是期中考','yu:因為你還沒畢業']));
    G=fresh('2028-10-31',22.05); rules(); check('3. 10/31（二）22:00：Alison「（照片：公館的路口，有人扮成一本六法全書）」「拍到了」',J(grp(NG,'tw_y4_mid_1031'))===J(['yu:（照片：公館的路口，有人扮成一本六法全書）','yu:拍到了']));
    G=fresh('2028-11-01',21.05,'dorm',{CLUB_public_law_group:true},{groups:['noodle_team','public_law']}); rules();
    check('3. 11/1（三）21:00 讀書會群組（參加讀書會的）：以安「下週四恢復。題目是第十一章。」',J(grp('g:public_law','tw_y4_plg_1101'))===J([AN+':下週四恢復。題目是第十一章。']));
    G=fresh('2028-11-01',21.05,'dorm',{},{groups:['noodle_team','public_law']}); rules(); check('3. 11/1 沒參加讀書會：沒有',!msgs('g:public_law').length);
    G=fresh('2028-11-03',18.6); check('3. 11/3（五）摘要日：「（期中考完。你數了一下大四上剩下的課：六週。）」',J(sumAt('2028-11-03',18.6))===J([L().sum1103]));
    G=fresh('2028-11-17',21.05,'dorm',{},{know:[BH]}); rules(); check('3. 11/17（五）21:00 柏翰（有點熟以上）「推甄下禮拜四放榜。」「……這幾天我都在整理書櫃。」；傳了＝有聯絡方式',J(msgs('p:'+BH).map(x=>x.text))===J(L().bohan1117)&&G.contacts[BH]!=null);
    G=fresh('2028-11-17',21.05); H.rel(BH,10,0,0); rules(); check('3. 11/17 和柏翰只是認識：沒有',!msgs('p:'+BH).length);
    const A=ACTIVITIES.list.find(a=>a.id==='public_law_group');
    G=fresh('2028-12-07',20,'wancai',{CLUB_public_law_group:true,PLG_HANDOVER:'there'}); const ce=CLS.clubEvent(G,A); let Lp=await run('ev_y4_plg_last');
    check('3. 12/7（四）最後一次讀書會（有 PLG_HANDOVER）：「（大四上最後一次讀書會。學弟把白板擦得很乾淨，只留最上面那一行沒擦：說理由。）」',!!ce&&ce.id==='ev_y4_plg_last'&&J(Lp)===J([L().plgLast]),ce&&ce.id);
    G=fresh('2028-12-07',20,'wancai',{CLUB_public_law_group:true}); const ce2=CLS.clubEvent(G,A); check('3. 12/7 沒有 PLG_HANDOVER：不演這一句',!ce2||ce2.id!=='ev_y4_plg_last');
    G=fresh('2028-12-08',18.6); check('3. 12/8（五）摘要日（沒參加讀書會的）：「（十二月。總圖前面的聖誕樹立起來了。）」',J(sumAt('2028-12-08',18.6))===J([L().sum1208]));
    G=fresh('2028-12-08',18.6,'dorm',{CLUB_public_law_group:true}); check('3. 12/8 參加讀書會的：沒有（12/7 有讀書會）',sumAt('2028-12-08',18.6).length===0);
    G=fresh('2028-10-27',21.05,'dorm',{EXCHANGE_ROUTE:'US'},{know:[BH]}); rules(); setT('2028-11-17',21.05); rules(); const s=sumAt('2028-11-03',18.6);
    check('3. 美國路線（大四上人在美國）：群組、柏翰、摘要日都沒有',STORY.abroad(G)&&!msgs(NG).length&&!msgs('p:'+BH).length&&!s.length);
  });

  /* ===== 4 大四下 ===== */
  await sec('4',async()=>{
    const N=ev('ev_y4s2_thu_noodle_first'); let G=fresh('2029-03-01',18,'noodle'); const a=EVENTS.check(N); setT('2029-02-22',18); const b=EVENTS.check(N); setT('2029-03-15',18); const c=EVENTS.check(N);
    check('4. 3/1（四）起這學期第一次週四進麵店：「（最後一學期的第一個週四。長桌坐滿了，阿姨多拿了兩張椅子。）」（第 2～3 週；2/22 第一週、3/15 第 4 週不演）',a&&!b&&!c&&N.once&&N.dialogue[0].text===L().noodle0301);
    G=fresh('2029-04-11',9,'linze'); const it=CLS.dayItems(G).find(i=>i.c.id==='maritime'); H.said=[]; H.picks=[0,0,0,0,0,0]; await CLS.attend(GM,it,{forced:true});
    check('4. 4/11（三）海商法期中考：考卷前一句「（海商法的期中考。題目裡的那艘船，沉在一個你沒聽過的海峽。）」',!!it&&it.exam==='mid'&&H.said[0].t===L().maritime0411&&/考卷發下來/.test(H.said[1].t),J(H.said.slice(0,2)));
    check('4. 別的考試沒有這一句',!X().examLine(G,Object.assign({},it,{exam:'final'}))&&!X().examLine(Object.assign({},G,{day:G.day+1}),it));
    G=fresh('2029-04-13',22.05); rules(); check('4. 4/13（五）22:00：Alison「最後一次期中考」「考完了」、阿哲「最後一次」',J(grp(NG,'tw_y4s2_last_mid'))===J(['yu:最後一次期中考','yu:考完了','zhe:最後一次']));
    G=fresh('2029-04-26',21.05,'dorm',{},{know:[BH]}); rules(); const g=msgs(NG).filter(m=>m.tag==='tw_y4s2_grad_ask');
    check('4. 4/26（四）21:00 阿哲「禮拜六十點 椰影大道 學士服拍照」「衣服我先租了 錢之後給」＋「去。」',J(g.map(m=>m.text))===J(['禮拜六十點 椰影大道 學士服拍照','衣服我先租了 錢之後給'])&&J(g[1].ask.opts.map(o=>o.t))===J(['去。']));
    PHONE.answer(G,'tw_y4s2_grad_ask',0); rules(); const q=OUT.get(G,'tw_y4_grad_photo');
    check('4. 「去。」＝4/28（六）10:00 椰影大道（出遊）',!!q&&q.day===H.D('2029-04-28')&&q.h===10&&q.ev==='ev_y4_grad_photo',J(q));
    let Lg=await run('ev_y4_grad_photo'); setT('2029-04-28',12.6); rules();
    check('4. 4/28 椰影大道：「（學士服是租的，袖子太長。Alison 拍了兩百張，說只會留三張。）」、阿哲「（把學士帽丟上去，沒接到）……再一次。」、柏翰「學士帽要等典禮那天才丟。」；去了＝12:30 沒有照片',
      J(Lg)===J([L().gradNarr,L().gradZhe,L().gradBohan])&&H.G.flags.Y4_GRAD_PHOTO==='went'&&!msgs(NG).some(m=>m.tag==='tw_y4s2_grad_miss'),J(Lg));
    G=fresh('2029-04-26',21.05); rules(); setT('2029-04-28',12.4); rules(); const before=msgs(NG).some(m=>m.tag==='tw_y4s2_grad_miss'); setT('2029-04-28',12.6); rules();
    check('4. 沒去（沒回）：4/28 12:30 Alison「（照片：椰影大道，一排人穿著學士服，中間空了一個位子）」「你的位子我們留了」',!before&&J(grp(NG,'tw_y4s2_grad_miss'))===J(['yu:（照片：椰影大道，一排人穿著學士服，中間空了一個位子）','yu:你的位子我們留了'])&&G.flags.Y4_GRAD_PHOTO==='missed');
    for(const [k,t,flag,reply] of [[0,'謝謝麵店的阿姨。','auntie',null],[1,'謝謝那幾年的週四。','thursday',null],[2,'還沒想好。','notyet','我幫你寫：還沒想好。']]){
      G=fresh('2029-05-04',21.05); rules(); const y=msgs(NG).filter(m=>m.tag==='tw_y4s2_yearbook'); const opts=y.length?y[0].ask.opts.map(o=>o.t):[]; PHONE.answer(G,'tw_y4s2_yearbook',k); const last=msgs(NG).slice(-1)[0];
      check('4. 5/4（五）21:00 柏翰「畢業紀念冊的一句話，今天截止。」三選一：「'+t+'」＝YEARBOOK_LINE '+flag+(reply?'、柏翰「'+reply+'」':''),y.length===1&&y[0].from===BH&&y[0].text===L().yearbook&&J(opts)===J(['謝謝麵店的阿姨。','謝謝那幾年的週四。','還沒想好。'])&&G.flags.YEARBOOK_LINE===flag&&(reply?last.from===BH&&last.text===reply:last.text===t),J([opts,last])); }
    G=fresh('2029-05-04',21.05); rules(); setT('2029-05-05',0.5); check('4. 畢業紀念冊：當天截止（5/5 就不能回）',!PHONE.answer(G,'tw_y4s2_yearbook',0));
    G=fresh('2029-05-17',21.05); rules(); check('4. 5/17（四）21:00：Alison「畢業典禮的位子按學號排」、阿哲「我跟 Alison 只差一號」、Alison「差兩號」',J(grp(NG,'tw_y4s2_seats'))===J(['yu:畢業典禮的位子按學號排','zhe:我跟 Alison 只差一號','yu:差兩號']));
    const N2=ev('ev_y4s2_noodle_0524'); G=fresh('2029-05-24',18,'noodle'); const d1=EVENTS.check(N2); setT('2029-05-17',18); const d2=EVENTS.check(N2);
    check('4. 5/24（四）進麵店：「（阿姨在牆上貼了一張空白的紙，說畢業那天給大家簽名。）」；別的週四不演',d1&&!d2&&N2.dialogue[0].text===L().noodle0524);
    G=fresh('2029-05-25',22.05,'dorm',{},{know:['kai']}); rules(); check('4. 5/25（五）22:00 阿凱「你什麼時候搬」「你的床位我要先借給我的鍵盤」',J(msgs('p:kai').map(x=>x.text))===J(['你什麼時候搬','你的床位我要先借給我的鍵盤']));
  });
  H.done();
})();
