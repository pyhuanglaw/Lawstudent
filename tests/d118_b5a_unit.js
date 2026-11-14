// D118-B5a 法服改純劇情（機制部分；docs/handoff/D118_PLAN.md 第 4 節 B5a、第 1 節 ④-1～④-7、第 8 節第 6 點、第 9 節第 5 點）——不需要瀏覽器。
//   使用者 11-02：「法律服務社就是純劇情，不要變成需要玩家反覆完成的例行任務」。
//   (a) 大二社員一整學期都不去：沒有值班的出發選單（只剩 AA_604 固定場次那一天的一次性選單）、沒有柏翰「你還來嗎」私訊、關係值不變
//   (b) 只看過公告（萬才館公告欄／椰林招生攤位）＝LAWCLUB_NOTICE，不是社員：大二 fafuMember=false、不進法服群組、沒有固定場次；學姊的記憶讀 LAWCLUB_NOTICE
//   (c) 舊存檔（v9.10 結構：只看過公告的 lawclub、FAFU_TRK、FAFU_OFF、FAFU_ROT、排好的 fafu_ 出發選單、溫州街線 silent 選單）讀進來不報錯、
//       不補跳過期／值班的出發選單、不再有柏翰私訊；FAFU_TRK／FAFU_OFF／FAFU_ROT 留著；溫州街線、固定場次那天的選單照留；game3d.js migrate 有叫、defaults 有 FAFU_PURE、FAFU_STORY_SEEN
//   (d) 5/22 語彤阿姨：社員、認識語彤＝那天早上單獨一次出發選單（字照原本的值班出發選單），去得了、阿姨那一場照常演；不是社員、不認識語彤、演過＝沒有；
//       前一晚 5/21 20:00 柏翰在法服群組一則（AA_691 第 1 點，企劃線 607939eb8；d5～d7，修改前（6a1592a26）沒有這一則＝d5、d6、d6b FAIL）
//   (e) LAWCLUB_SAT_FIVE（AA_638 ④-7）：大一第二次旁觀就說，旗標名照舊（開發分支 90b5cf014 已經改好；這裡是回歸）
//   (f) 阿凱鍵盤、(g) 子晴合約、(h) 早午餐的班那一句：「加入或去過」（原本只看去過的次數）
//   (i) careerLean：法服只算固定場次 FAFU_STORY_SEEN（週六去過的次數不算；新遊戲 defaults、舊存檔遷移都補 0）
//   (j) 日本路線大三下：沒有法服的出發選單、沒有柏翰訊息（④-3）
//   (k) 舊存檔只看過公告、已經在法服群組裡：之後的群組訊息（大一校慶、柏翰的值班表）不收（第 8 節第 6 點）
//   (l) SQ02、ZJW 原本借值班選單帶過去的：SQ02 自己的出遊照常（STORY.fafuSat）；ZJW 的值班表那一句＝社員固定場次那天到萬才館就在條件內
// 修改前（開發分支 530a72ff4）：FAILED 19——a1～a3、b1、b3～b5、c1、c3、c4、c 這一節例外（沒有 STORY.fafuMigrate）、d4、f1、g1、h1、i 例外、j1、k 例外、l2；
//   修改前就過的是回歸：0、b2（舊程式看公告就設 lawclub，學姊的記憶照樣有那一句）、b6、c2、d1～d3（舊的值班選單 5/22 也排）、e1（90b5cf014 已改）、l1。
// 修改後 ALL PASS。用法：node tests/d118_b5a_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const loadErr=[];
const L=f=>{ const p=path.join(H.ROOT,f); if(!fs.existsSync(p)){ loadErr.push(f); return; } try{ let s=fs.readFileSync(p,'utf8'); s=s.replace(/^const ([A-Z][A-Z0-9_]*)\s*=/mg,'globalThis.$1='); vm.runInThisContext(s,{filename:f}); }catch(e){ loadErr.push(f+'：'+String(e).slice(0,160)); } };
global.CG_REGISTRY=global.CG_REGISTRY||{};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/exchange3d.js','src/data/y2b_events.js','src/y2b3d.js','src/y34b3d.js',
  'src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/wz_jobs.js','src/jobs3d.js','src/aa555_3d.js','src/data/bbpack_events.js','src/bbpack3d.js']) L(f);
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDay(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const fresh=(d,h,zone,flags)=>{ const G=H.fresh(keyOf(d),h,zone||'dorm',Object.assign({EXCHANGE_ROUTE:'TW',EXCH_RULE:1},flags||{})); G.outings=[]; G.acts={att:{}}; at(d,h,zone||'dorm'); GM.npc={}; return G; };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const fafuPlans=()=>(H.G.outings||[]).filter(q=>/^fafu_-?\d+$/.test(q.id)).map(q=>q.id);
const bohanAsk=()=>(H.G.msgs||[]).filter(m=>/^fafu_bohan_/.test(m.tag||'')||m.text==='這學期的班表要排了。你還來嗎？');
const MEM={CLUB_lawclub_study:true,lawclub:true,SIS_CLUB_EXPO:true};
const relOf=id=>J(SOCIAL.rel(id));
/* 一個學期每天走過：07:00、08:40（出發選單會跳的時間）、12:30、21:00；誰都不去（出發選單照時間過期） */
const walkTerm=(tid,fn,from)=>{ const r=CALENDAR.termDays(tid); for(let d=from!=null?from:r.from;d<=r.to;d++) for(const h of [7,8.67,12.5,21]){ if(d===from&&h<H.G.hour) continue; at(d,h); rules(); OUT.expire(H.G); if(fn) fn(d,h); } };   /* from：從存檔那一天往後走（不倒回去）*/
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
(async()=>{
  check('0. 程式都載得到（y2b、y34b、jobs、aa555、bbpack）',!loadErr.length,loadErr.join(' | '));
  const S1=D('2026-10-24');   /* AA_604 第 1 場（大二上第 7 週六）*/
  // ---------- (a) ----------
  await sec('a',async()=>{ fresh(TD('Y2S1',1,1),7,'dorm',MEM); H.FRIEND('classmate_bohan'); PHONE.join(H.G,'lawclub_study','法服'); const r0=relOf('classmate_bohan');
    const dutySat=[]; walkTerm('Y2S1',(d,h)=>{ if(h===7&&STORY.fafuDuty({day:d,flags:H.G.flags,stage:'law'})) dutySat.push(d); });
    const ids=fafuPlans();
    check('a1. 大二上一整學期都不去：值班的週六（'+dutySat.length+' 個）沒有出發選單，只有 AA_604 第 1 場（10/24）那一次',dutySat.length>=4&&J(ids)===J(['fafu_'+S1]),J(ids));
    check('a2. 沒有柏翰「這學期的班表要排了。你還來嗎？」（fafu_bohan_）',!bohanAsk().length,J(bohanAsk().map(m=>m.tag)));
    check('a3. 柏翰的關係值沒有變、沒有記 FAFU_TRK／FAFU_OFF',relOf('classmate_bohan')===r0&&H.G.flags.FAFU_TRK==null&&H.G.flags.FAFU_OFF==null,J([H.G.flags.FAFU_TRK,H.G.flags.FAFU_OFF])); });
  // ---------- (b) ----------
  await sec('b',async()=>{ fresh(D('2025-09-10'),15,'wancai',{}); H.said=[]; await STORY.interact({notice:'lawclub'},GM);
    check('b1. 看公告：公告那一句照舊；記 LAWCLUB_NOTICE、不設 lawclub（不算加入）',H.said.some(x=>/^【法律服務社 招募新社員】/.test(x.t))&&H.G.flags.LAWCLUB_NOTICE===true&&!H.G.flags.lawclub,J(H.G.flags.lawclub));
    check('b2. 學姊的記憶讀 LAWCLUB_NOTICE（「知道你看過法服的招募公告」）',STORY.people.sis.memory(H.G)==='知道你看過法服的招募公告');
    rules(); check('b3. 只看過公告：不進法服群組',!PHONE.inGroup(H.G,'lawclub_study'));
    at(D('2026-10-20'),10); check('b4. 大二：fafuMember＝false、STORY.fafuJoined＝false',STORY.fafuMember(H.G)===false&&!(STORY.fafuJoined&&STORY.fafuJoined(H.G)));
    at(S1-1,21); rules(); at(S1,8.67); rules(); check('b5. 不是社員：AA_604 第 1 場沒有提醒、沒有出發選單',!fafuPlans().length&&!(H.G.msgs||[]).some(m=>m.th==='g:lawclub_study'),J(fafuPlans()));
    fresh(D('2025-09-06'),11,'campus',{}); H.FAMILIAR('heroine_05'); H.G.flags.SIS_W1=true; H.G.flags.met_sis=true; H.said=[]; await EVENTS.run(STORY_EVENTS.find(e=>e.id==='ev_sis_club_expo')); rules();
    at(D('2026-10-20'),10); check('b6. 社博寫報名表（SIS_CLUB_EXPO）＝真的加入：進群組、大二是社員',PHONE.inGroup(H.G,'lawclub_study')&&STORY.fafuMember(H.G)===true); });
  // ---------- (c) ----------
  await sec('c',async()=>{ const sat=TD('Y2S1',11,6), past=TD('Y2S1',3,6), wz=TD('Y2S1',13,6);
    const GO=d=>({id:'fafu_'+d,day:d,h:9,place:'法律系館B一樓',title:'法服值班（法律系館B一樓 9:00）',travel:'走過去約 10 分鐘',travelH:0.25,no:'這週請假',goto:{zone:'wancai',x:0,z:5,yaw:Math.PI},state:'planned',ask:null});
    const old=(flags)=>{ const G=fresh(sat,8,'dorm',Object.assign({LAWCLUB_SAT_VISITS:9,LAWCLUB_SAT_LAST:past,FAFU_TRK:{last:sat-1,miss:2},FAFU_OFF:'Y2S2',FAFU_ROT:{open:2,cs:2,stay:1,yt:0,bh:1,bk:0,lg:0},WZ_LINE_I:{k:'ins2',day:wz,tries:0}},flags));
      delete G.flags.FAFU_PURE; delete G.flags.FAFU_STORY_SEEN; H.FRIEND('classmate_bohan'); PHONE.join(G,'lawclub_study','法服');
      G.outings=[Object.assign(GO(past),{state:'missed'}),GO(sat),Object.assign(GO(wz),{title:'法服值班（今天陪林太太）',no:'這次不去',silent:true}),GO(S1+70),{id:'sq02_fafu_400',ev:'ev_sq02_fafu',day:sat+14,h:9.5,state:'planned'}]; return G; };
    /* c-1 社員（CLUB_lawclub_study）的舊存檔：週六 08:00 讀進來，那天的值班選單還在排 */
    let G=old({CLUB_lawclub_study:true,lawclub:true}); const keep=J({TRK:G.flags.FAFU_TRK,OFF:G.flags.FAFU_OFF,ROT:G.flags.FAFU_ROT});
    let threw=''; try{ STORY.fafuMigrate(G); }catch(e){ threw=String(e); }
    const st=id=>((G.outings||[]).find(q=>q.id===id)||{}).state;
    check('c1. 讀進來不報錯；那天（非固定場次）的值班選單 cancelled；溫州街線的 silent 選單、SQ02 照留；FAFU_PURE、FAFU_STORY_SEEN＝0',!threw&&st('fafu_'+sat)==='cancelled'&&st('fafu_'+wz)==='planned'&&st('sq02_fafu_400')==='planned'&&G.flags.FAFU_PURE===1&&G.flags.FAFU_STORY_SEEN===0,threw+J(G.outings.map(q=>q.id+':'+q.state)));
    check('c2. FAFU_TRK、FAFU_OFF、FAFU_ROT 留著（不刪、不改）；LAWCLUB_SAT_VISITS 照舊',J({TRK:G.flags.FAFU_TRK,OFF:G.flags.FAFU_OFF,ROT:G.flags.FAFU_ROT})===keep&&G.flags.LAWCLUB_SAT_VISITS===9);
    at(sat,8.67); rules(); const due=OUT.due(G); check('c3. 08:40 沒有跳值班的出發選單（不補跳）',!due||!/^fafu_/.test(due.id),J(due&&due.id));
    const before=fafuPlans(); walkTerm('Y2S1',null,sat); const added=fafuPlans().filter(id=>!before.includes(id));
    check('c4. 之後到學期末（還有 '+[TD('Y2S1',13,6),TD('Y2S1',15,6)].length+' 個值班週六）：沒有柏翰私訊（FAFU_TRK 原本 miss 2、不再讀）、沒有新的值班出發選單',!bohanAsk().length&&!added.length,J({added,bohan:bohanAsk().map(m=>m.tag)}));
    /* c-2 只看過公告的舊存檔（lawclub、沒有 CLUB_lawclub_study／SIS_CLUB_EXPO／FAFU_SHIFT_N），已經在群組裡 */
    G=old({lawclub:true}); STORY.fafuMigrate(G);
    check('c5. 只看過公告：lawclub 改成 LAWCLUB_NOTICE、不是社員；群組留著（沒有退出的功能）；值班選單 cancelled',G.flags.lawclub===false&&G.flags.LAWCLUB_NOTICE===true&&!STORY.fafuMember(G)&&PHONE.inGroup(G,'lawclub_study')&&st('fafu_'+sat)==='cancelled');
    G=old({lawclub:true,FAFU_SHIFT_N:3}); STORY.fafuMigrate(G); check('c6. 公告進來但大二起值過班（FAFU_SHIFT_N）＝照舊算社員（D118_PLAN 第 8 節第 6 點）',G.flags.lawclub===true&&!G.flags.LAWCLUB_NOTICE&&STORY.fafuMember(G));
    G=fresh(S1,8,'dorm',MEM); delete G.flags.FAFU_PURE; G.outings=[GO(S1)]; STORY.fafuMigrate(G); check('c7. 固定場次那天（10/24）早上讀進來：那天的選單照留（就是那一場的出發選單）',st('fafu_'+S1)==='planned');
    const g3=fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8');
    check('c8. game3d.js：migrate 叫 STORY.fafuMigrate；新遊戲 defaults 有 FAFU_PURE:1、FAFU_STORY_SEEN:0',/function migrate\(s\)[\s\S]*STORY\.fafuMigrate\(s\)[\s\S]*s\.v=SAVE_VER; return s; \}/.test(g3)&&/flags:\{dating_kexin:false,[^}]*FAFU_PURE:1[^}]*FAFU_STORY_SEEN:0[^}]*\}/.test(g3));   /* CANON-1112：舊序章拿掉／可昕開局不認識：defaults 的 dating_kexin 改 false（原本這個正則寫 true）*/
    G=fresh(sat,8,'dorm',{}); G.flags.FAFU_PURE=1; G.flags.lawclub=true; STORY.fafuMigrate(G); check('c9. 遷移只做一次（FAFU_PURE 以後不再動）',G.flags.lawclub===true); });
  // ---------- (d) ----------
  await sec('d',async()=>{ const d=D('2027-05-22'); fresh(d,7,'dorm',MEM); H.FRIEND('heroine_03'); H.FRIEND('classmate_bohan'); rules(); const q=OUT.get(H.G,'fafu_'+d);
    check('d1. 5/22 社員、認識語彤：早上一次出發選單「法服值班（法律系館B一樓 9:00）」（出發／這週請假），到萬才館一樓',!!q&&q.title==='法服值班（法律系館B一樓 9:00）'&&q.no==='這週請假'&&q.goto&&q.goto.zone==='wancai'&&q.h===9,J(q));
    at(d,8.6); const dq=OUT.due(H.G); H.picks=['出發']; if(dq) await OUT.prompt(GM,dq);
    check('d2. 選「出發」：到萬才館（9:00）、阿姨那一場到期',!!dq&&dq.id==='fafu_'+d&&H.G.zone==='wancai'&&H.G.hour>=9&&Y2B.auntDue(H.G),J([dq&&dq.id,H.G.zone,H.G.hour]));
    H.said=[]; H.picks=[0]; await STORY.fafuShift(GM);
    check('d3. 坐到圓桌＝語彤阿姨那一場（AA_625 第 9 節）照常演；記 RENT_CONSULTATION',H.said.some(x=>x.t==='（法律系館B的諮詢室。門開了，進來的是秀琴姨，後面跟著語彤。）')&&SOCIAL.has('heroine_03','RENT_CONSULTATION'),J(H.lines().slice(0,3)));
    fresh(d,7,'dorm',{}); H.FRIEND('heroine_03'); rules(); const n1=OUT.get(H.G,'fafu_'+d);
    fresh(d,7,'dorm',MEM); rules(); const n2=OUT.get(H.G,'fafu_'+d);
    fresh(d,7,'dorm',MEM); H.FRIEND('heroine_03'); H.G.events.done.ev_yt_aunt_consult=1; rules(); const n3=OUT.get(H.G,'fafu_'+d);
    check('d4. 不是社員、不認識語彤、阿姨那一場演過＝那天沒有出發選單（不是值班循環）',!n1&&!n2&&!n3,J([!!n1,!!n2,!!n3]));
    /* AA_691 第 1 點（企劃線 607939eb8）：2027-05-21（五）20:00 柏翰在法服群組一則；只在 5/22 那一場會演的時候傳（Y2B.auntDue 同一組條件），不提語彤 */
    const EVE='週六九點有一件租約的諮詢。預約的阿姨說，會有人陪她來。', eve=()=>(H.G.msgs||[]).filter(m=>m.th==='g:lawclub_study'&&m.text===EVE);
    const mem=(fl,yt)=>{ fresh(d-1,19,'dorm',fl); if(yt) H.FRIEND('heroine_03'); H.FRIEND('classmate_bohan'); PHONE.join(H.G,'lawclub_study','法服'); };
    mem(MEM,true); at(d-1,19.9); rules(); const pre=eve().length; at(d-1,20); rules(); const a=eve();
    check('d5. 5/21（五）20:00 法服群組柏翰「週六九點有一件租約的諮詢。預約的阿姨說，會有人陪她來。」（社員、認識語彤＝那一場會演；不提語彤）；20:00 以前沒有',pre===0&&a.length===1&&a[0].from==='classmate_bohan'&&a[0].day===d-1&&a[0].h===20&&!/語彤/.test(a[0].text),J(a.map(m=>[m.day,m.h,m.from])));
    at(d,8); rules(); const a2=eve().length; at(d,8.6); const dq2=OUT.due(H.G);
    check('d6. 只一則（隔天早上不再傳）；早上的出發選單照舊',a2===1&&!!dq2&&dq2.id==='fafu_'+d,J([a2,dq2&&dq2.id]));
    mem(MEM,true); at(d,7.5); rules(); const late=eve();
    check('d6b. 5/21 晚上睡過了（隔天早上才跑到）：照 5/21 20:00 補進群組',late.length===1&&late[0].day===d-1&&Math.abs(late[0].h-20)<0.02,J(late.map(m=>[m.day,m.h])));
    mem(MEM,false); at(d-1,20.1); rules(); const b1=eve().length;
    mem({},true); at(d-1,20.1); rules(); const b2=eve().length;
    mem(MEM,true); H.G.events.done.ev_yt_aunt_consult=1; at(d-1,20.1); rules(); const b3=eve().length;
    check('d7. 不認識語彤、不是社員（只在群組裡）、阿姨那一場演過＝不傳',!b1&&!b2&&!b3,J([b1,b2,b3])); });
  // ---------- (e) ----------
  await sec('e',async()=>{ const s3=TD('Y1S1',3,6), s5=TD('Y1S1',5,6); fresh(s3,9.5,'wancai',{}); await STORY.fafuWatch(GM); at(s5,9.5,'wancai'); H.said=[]; await STORY.fafuWatch(GM);
    check('e1. 大一第二次來旁觀：社長「你又來了。明年可以報名當志工，來坐圓桌。」，旗標 LAWCLUB_SAT_FIVE（AA_638 ④-7）',H.said.some(x=>x.t==='你又來了。明年可以報名當志工，來坐圓桌。')&&H.G.flags.LAWCLUB_SAT_FIVE===true,J(H.lines())); });
  // ---------- (f) ----------
  await sec('f',async()=>{ const ev=STORY_EVENTS.find(e=>e.id==='ev_kai_keyboard'); const run=async flags=>{ fresh(TD('Y1S2',7,3),22.5,'dorm',flags); H.said=[]; H.picks=[0]; await EVENTS.run(ev); return H.said.map(x=>x.t); };
    let Ls=await run({SIS_CLUB_EXPO:true,CLUB_lawclub_study:true,lawclub:true}); const a=Ls[Ls.length-1]==='週六法服。'&&H.G.flags.KAI_KB_ASK==='fafu';
    Ls=await run({LAWCLUB_SAT_VISITS:1}); const b=Ls[Ls.length-1]==='週六法服。';
    Ls=await run({}); const c=Ls[Ls.length-1]==='我問學長。'&&H.G.flags.KAI_KB_ASK==='kevin';
    check('f1. 阿凱鍵盤「那問誰」：加入法服（社博報名、還沒去過週六）或去過一次＝「週六法服。」；都沒有＝「我問學長。」',a&&b&&c,J([a,b,c])); });
  // ---------- (g) ----------
  await sec('g',async()=>{ const opt=flags=>{ fresh(D('2028-10-11'),21,'dorm',flags); H.FRIEND('heroine_04'); Y34B.phone(H.G); PHONE.tick(H.G); const m=(H.G.msgs||[]).find(x=>x.ask&&x.ask.id==='y4_q14'); return !!m&&m.ask.opts.some(o=>o.t==='介紹法服的指導律師給妳。'); };
    const a=opt({CLUB_lawclub_study:true,lawclub:true}), b=opt({LAWCLUB_SAT_VISITS:2}), c=opt({});
    check('g1. 子晴的合約：加入法服或去過＝多「介紹法服的指導律師給妳。」；都沒有＝沒有',a&&b&&!c,J([a,b,c])); });
  // ---------- (h) ----------
  await sec('h',async()=>{ const line=flags=>{ fresh(D('2026-03-07'),9,'wz_brunch',flags); return JOBS.clashLine(H.G,'brunch',[6]); };
    const a=line({SIS_CLUB_EXPO:true,CLUB_lawclub_study:true,lawclub:true}), b=line({LAWCLUB_SAT_VISITS:2}), c=line({});
    check('h1. 早午餐選週六：加入法服或去過＝小米姐「週六上午你不是有法服？要去的那週，前一天跟我說。」；都沒有＝沒有',!!a&&a[1]==='週六上午你不是有法服？要去的那週，前一天跟我說。'&&!!b&&!c,J([a,b,c])); });
  // ---------- (i) ----------
  await sec('i',async()=>{ const G=fresh(D('2028-10-01'),15,'campus',{}); delete G.flags.FAFU_PURE; delete G.flags.FAFU_STORY_SEEN; Object.assign(G.flags,{CLUB_lawclub_study:true,lawclub:true,LAWCLUB_SAT_VISITS:9}); G.stats.study=0; G.vac={reg:{}}; G.courses={grades:{}};
    STORY.fafuMigrate(G); const a=STORY.careerLean(G).A; G.flags.LAWCLUB_SAT_VISITS=40; const b=STORY.careerLean(G).A; G.flags.FAFU_STORY_SEEN=3; const c=STORY.careerLean(G).A;
    check('i1. 舊存檔遷移以後：法服只算固定場次——週六去過 9 次、40 次都只有「加入法服 +2」；看過 3 場＝+3',a===2&&b===2&&c===5,J([a,b,c]));
    const F2=fresh(D('2028-10-01'),15,'campus',{FAFU_PURE:1,FAFU_STORY_SEEN:0,LAWCLUB_SAT_VISITS:6}); F2.stats.study=0; F2.vac={reg:{}}; F2.courses={grades:{}};
    check('i2. 新遊戲（defaults 有 FAFU_STORY_SEEN:0）：大一旁觀 6 次不加分',STORY.careerLean(F2).A===0&&typeof STORY.fafuMigrate==='function',J(STORY.careerLean(F2))); });
  // ---------- (j) ----------
  await sec('j',async()=>{ fresh(TD('Y3S2',1,1),7,'dorm',Object.assign({},MEM,{EXCHANGE_ROUTE:'JP'})); H.FRIEND('classmate_bohan'); PHONE.join(H.G,'lawclub_study','法服'); walkTerm('Y3S2');
    check('j1. 日本路線大三下：沒有法服的出發選單、沒有柏翰訊息（④-3）',!fafuPlans().length&&!bohanAsk().length,J(fafuPlans())); });
  // ---------- (k) ----------
  await sec('k',async()=>{ const fs1=TD('Y1S1',11,6); const G=fresh(fs1-1,20,'dorm',{lawclub:true}); delete G.flags.FAFU_PURE; PHONE.join(G,'lawclub_study','法服'); STORY.fafuMigrate(G); at(fs1-1,21.2); rules();
    check('k1. 舊存檔只看過公告、在群組裡：大一校慶前一天法服群組那一則不收',!(H.G.msgs||[]).some(m=>m.th==='g:lawclub_study'&&/明天校慶/.test(m.text)),J(H.msgs('g:lawclub_study')));
    const dp=AA555.DP.find(x=>x.id==='a118_y2s1_bh_duty'); at(TD('Y2S1',6,2),21); const nonMem=dp.ok(H.G); H.G.flags.CLUB_lawclub_study=true; const mem=dp.ok(H.G);
    check('k2. 柏翰「本週值班表」（AA_555）：只給社員（只看過公告、在群組裡的不收）',!nonMem&&mem,J([nonMem,mem])); });
  // ---------- (l) ----------
  await sec('l',async()=>{ const d0=TD('Y2S1',6,2), s=STORY.fafuSat(d0); check('l1. SQ02（sideq3d.js S.planFafu）、ZJW 邀旁觀（pool3d.js S.planWatch）用的 STORY.fafuSat 照舊：下一個值班週六＝10/24',!!s&&s.day===S1,J(s));
    fresh(S1-1,19,'dorm',MEM); PHONE.join(H.G,'lawclub_study','法服'); at(S1-1,20.5); rules(); at(S1,8.6); const q=OUT.due(H.G); H.picks=['出發']; if(q) await OUT.prompt(GM,q);
    check('l2. 社員固定場次那天出發＝9:00 在萬才館、值班的週六（ZJW「值班表上，她的名字排在你下面那一週」pool3d.js dutyListDue 的條件：wancai、fafuDuty、fafuMember、9～12）',H.G.zone==='wancai'&&STORY.fafuDuty(H.G)&&STORY.fafuMember(H.G)&&H.G.hour>=9&&H.G.hour<12,J([H.G.zone,H.G.hour])); });
  H.done();
})().catch(e=>{ console.log('FAIL 例外',e&&e.stack||e); process.exit(1); });
