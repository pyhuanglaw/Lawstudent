// 多段感情 v6：裂縫計數 → 談話（V6-S5、A2、A5、B4；src/cracktalk3d.js、src/data/cracktalk_lines.js）——不需要瀏覽器。
//   台詞逐字對企劃（企劃線 claude/cool-heisenberg-o8kuqx @ d805bceee）：AA_123 4-2、5-2；AA_182 第 1 節；BB_119 2-1、2-3、2-4、第 2 節開頭、9-1。每一句直接寫在這裡比對（不從程式讀）。
//   0 接線　C 計數（每一段關係各自算、同一學期、換學期歸零、只在交往中加、一學期只談一次、舊存檔）
//   A 以安（讀書會散會後、沒去＝Café、讀書會不開的週、她在日本＝視訊、沒有誰對誰錯的一次、三種結果）
//   Y 語彤（裂縫①週四 12:10 留位子、談話在總圖三樓、延一週、不回答＝一週後麵店那句、你在國外＝視訊）
//   P 沛珊（視訊、「妳想好了嗎？」只一次、重考那年的最後一句、不回答只送第二句）
//   Z 芷若（每週視訊「早點睡」兩次＝+1、明信片連兩張沒回＝+1＋那一句、週六 17:00 視訊、修補「每週固定一個時間」八週六次、避不掉的＝我們再試一個月、寒假那個選項先不出）
//   Q 子晴（週六 19:00 河堤、19:30／20:00 的訊息、延一天、5/12 改週日、「我等，是因為我想等。」只一次、分開的最後一句、不回答的貼圖）
// 修改前（開發分支 090ca4dc2）：沒有 src/cracktalk3d.js——全部 FAIL。用法：node tests/v6_crack_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM,E}=H, J=JSON.stringify;
const EXPORT=/^(MSG|MSG_POOL|MSG2_POOL|ZRUK|EXCH|R2Y4A|R2Y4A_EVENTS|CRACKTALK|CRACKTALK_LINES)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>EXPORT.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.Z3={ZONES:{}};
const loadErr=[]; for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/zr_uk3d.js','src/exchange3d.js','src/data/r2y4a_events.js','src/r2y4a3d.js','src/data/cracktalk_lines.js','src/cracktalk3d.js']){ try{ load(f); }catch(e){ loadErr.push(f+'：'+e.message); } }
const C=()=>typeof CRACKTALK!=='undefined'?CRACKTALK:null;
const AN='heroine_01', YT='heroine_03', PS='classmate_peishan', ZR='heroine_02', ZQ='heroine_04';
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, wdOf=d=>CALENDAR.dateOf(d).wd%7, keyOf=d=>CALENDAR.dateOf(d).key;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const caps=[]; GM.caption=(a,b)=>{ caps.push(b); };
GM.studySession=async()=>{};
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone||'dorm',flags); G.outings=[]; G.acts=G.acts||{att:{}}; caps.length=0; E.player.busy=false; E.paused=false; for(const id of [AN,YT,PS,ZR,ZQ]){ SOCIAL.remember(id,'FIRST_MET',''); INV.addContact(G,id); } return G; };
const date=id=>{ H.CLOSE(id); return ROM.start(H.G,id); };
const at=(k,h)=>{ const G=H.G; G.day=typeof k==='number'?k:D(k); G.hour=h; G.weekday=wdOf(G.day); };
const rules=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const settle=async()=>{ for(let i=0;i<60&&C().isBusy();i++) await new Promise(r=>setTimeout(r,0)); };
const tick=async()=>{ const r=C().tick(GM); await settle(); return r; };
const pr=id=>C().pr(H.G,id);
const cnt=id=>C().count(H.G,id);
const crack=(id,n)=>ROM.crack(H.G,id,n);
const dm=id=>(H.G.msgs||[]).filter(m=>m.th==='p:'+id&&(m.from==='player'||/^ct_/.test(m.tag||''))).map(m=>(m.from||'')+':'+m.text);   /* 這個檔傳的（tag ct_…）和玩家的回覆；她平常每天的訊息不算 */
const said=()=>H.said.map(s=>s.t);
const outOf=id=>(H.G.outings||[]).filter(q=>q.ct&&q.ct.id===id);
const go=async(q,picks)=>{ H.said=[]; H.opts=[]; H.bgs=[]; H.picks=(picks||[]).slice(); at(q.day,q.h); await OUT.go(GM,q); };
const expire=()=>{ for(const q of OUT.expire(H.G)) OUT.onMissed(GM,q); };
const firstWd=(from,wd)=>{ let d=D(from); while(wdOf(d)!==wd) d++; return d; };
const NONE='（不回答）';

(async()=>{
/* ======================= 0 接線 ======================= */
await sec(0,()=>{ const html=fs.readFileSync(path.join(H.ROOT,'index.html'),'utf8');
  check('0. 檔案載得到',!loadErr.length&&!!C()&&!!C().IDS,loadErr.join('；'));
  { const a=html.indexOf('src/data/cracktalk_lines.js'), b=html.indexOf('src/cracktalk3d.js'), z=html.indexOf('<script>GAME.boot();</script>');
    check('0. index.html：cracktalk_lines.js → cracktalk3d.js 接在一起、在清單最後面（romance3d、zr_uk3d、r2y4a3d、outings、phone 之後，GAME.boot 前面）',a>0&&b>a&&z>b&&/src\/data\/cracktalk_lines\.js\?v=[^"]+"><\/script>\n<script src="src\/cracktalk3d\.js/.test(html)&&['src/romance3d.js','src/zr_uk3d.js','src/r2y4a3d.js','src/outings3d.js','src/phone3d.js','src/story3d.js','src/multirel3d.js'].every(f=>{ const i=html.indexOf(f); return i>0&&i<a; })); }
  const ids=['ev_an_talk','ev_an_talk_plg','ev_an_talk_video','ev_an_talk_jp','ev_yt_talk','ev_yt_talk_video','ev_peishan_two_directions','ev_zhiruo_timezone_talk','ev_ziqing_direct_statement','ev_yt_drift_noodle'];
  check('0. 事件都在 STORY_EVENTS；ROM.crack 包了一層、明信片包了一層；學姊（2-2 作廢）、可昕（AA_351）不在這裡',!!C()&&ids.every(id=>STORY_EVENTS.some(e=>e.id===id))&&ROM._ctCrack&&R2Y4A._ctPc&&!C().IDS.includes('heroine_05')&&!C().IDS.includes('kexin'),ids.filter(id=>!STORY_EVENTS.some(e=>e.id===id)).join(' ')); });
if(!C()){ H.done(); return; }

/* ======================= C 計數 ======================= */
await sec('C',async()=>{
  fresh('2026-09-14',10,'dorm'); crack(AN,1);
  check('C1. 沒有交往：以安的裂縫不加',cnt(AN)===0&&!(+H.G.flags.AN_CRACK));
  date(AN); date(YT); crack(AN,1); crack(AN,1);
  check('C2. 交往中加兩次＝2，還沒排談話；語彤的不受影響（每一段各自算）',cnt(AN)===2&&cnt(YT)===0&&!pr(AN).plan&&H.G.flags.AN_CRACK_TERM==='Y2S1');
  crack(AN,1); check('C3. 同一學期加到 3＝排談話',cnt(AN)===3&&!!pr(AN).plan&&pr(AN).plan.term==='Y2S1',J(pr(AN).plan&&pr(AN).plan.att.map(a=>a.m)));
  fresh('2026-12-10',10,'dorm'); date(AN); crack(AN,1); crack(AN,1); at('2027-01-10',10); crack(AN,1);
  check('C4. 寒假（2027-01-10）算在前一個學期（大二上）：1＋1＋1＝3、排談話',C().termKey(H.G)==='Y2S1'&&cnt(AN)===3&&!!pr(AN).plan);
  fresh('2026-12-10',10,'dorm'); date(AN); crack(AN,1); crack(AN,1); at('2027-02-25',10); const c0=cnt(AN); crack(AN,1);
  check('C5. 換學期（大二下）：上學期的 2 不算（count 0），下一次加以前先歸零＝1、不排',c0===0&&cnt(AN)===1&&!pr(AN).plan&&H.G.flags.AN_CRACK_TERM==='Y2S2');
  crack(AN,-1); crack(AN,-1); check('C6. 別的系統的 −1：最低 0',cnt(AN)===0&&(+H.G.flags.AN_CRACK)===0);
  fresh('2026-10-05',10,'dorm'); date(AN); H.G.flags.AN_CRACK=3; rules();
  check('C7. 舊存檔：AN_CRACK 3、沒有 _TERM＝當作這學期，手機規則補排談話',!!pr(AN).plan);
  fresh('2026-10-05',10,'dorm'); date(AN); for(let i=0;i<3;i++) crack(AN,1); pr(AN).plan=null; pr(AN).talked.Y2S1=1; ROM.mend(H.G,AN); for(let i=0;i<3;i++) crack(AN,1);
  check('C8. 這學期談過了：再加到 3 也不排（同一學期只演一次）',cnt(AN)===3&&!pr(AN).plan);
  at('2027-03-01',10); for(let i=0;i<3;i++) crack(AN,1); check('C8. 下一個學期再到 3＝排',!!pr(AN).plan);
  fresh('2026-10-05',10,'dorm'); ROM.crack(H.G,'kexin',1); check('C9. 可昕（AA_351）照原本：沒包',(+H.G.flags.KX_CRACK)===1);
  fresh('2026-10-05',10,'dorm'); const G=H.G; delete G.flags.CRACKTALK; let err=null; try{ rules(); }catch(e){ err=e; } check('C10. 沒有 CRACKTALK 的舊存檔照跑',!err&&!!G.flags.CRACKTALK,String(err));
});

/* ======================= A 以安 ======================= */
const AN_BODY=['你最近都說『都可以』。','我不要『都可以』。我要理由。'];
const AN_O1=['（給一個真的理由）','「我想我們要的不一樣。」',NONE], AN_O2=['「我累了，但我不想放棄。」','「我怕說了妳會反駁。」','「我在想我自己要什麼。」'];
await sec('A',async()=>{
  const thu=D('2026-09-24');   /* 大二上第 3 週，有讀書會 */
  const setup=()=>{ fresh('2026-09-21',10,'dorm'); date(AN); for(let i=0;i<3;i++) crack(AN,1); return pr(AN).plan; };
  let p=setup(); check('A1. 學期中、到 3（週一）：下一個週四讀書會散會後，沒去＝隔天 16:00 Café',p&&p.mode==='meet'&&p.att[0].m==='plg'&&p.att[0].day===thu&&p.att[1].m==='zone'&&p.att[1].zone==='cafe'&&p.att[1].day===thu+1&&p.att[1].h===16,J(p&&p.att));
  /* 讀書會有去：散會後「你留一下。」→ 研討室 */
  for(const [picks,res] of [[[0,1],'mend'],[[1],'apart_talk'],[[2],'drift']]){ setup(); at(thu,21.6); H.G.zone='wancai'; H.G.acts.att['public_law_group@'+thu]={end:'full'}; H.said=[]; H.opts=[]; H.bgs=[]; H.picks=picks.slice(); await tick(); const s=said();
    const want=['你留一下。'].concat(AN_BODY, res==='mend'?['……這個理由我收下。','（她把兩個人的規則改成一條：「有事，要說理由。」）']:res==='apart_talk'?['（以安翻開手帳，在理由欄寫一行給你看：「分開。理由：我們都沒有錯。」）','這樣寫，可以嗎？']:[]);
    check('A2. 讀書會散會後（'+res+'）：台詞逐字、選項',J(s)===J(want)&&J(H.opts[0])===J(AN_O1)&&(res!=='mend'||J(H.opts[1])===J(AN_O2))&&caps.includes('萬才館研討室')&&H.bgs.some(b=>b&&b.image==='assets/bg/wancai_seminar.webp'),J({s,o:H.opts}));
    if(res==='mend') check('A3. 修補：計數歸零、還在交往、這學期不再排',cnt(AN)===0&&H.G.flags.dating_heroine_01===true&&pr(AN).talked.Y2S1===1&&!pr(AN).plan);
    if(res==='apart_talk') check('A3. 好好分開：EX、EX_REASON talk、歷史 apart_talk、CLEANUP_DONE false',H.G.flags.dating_heroine_01===false&&H.G.flags.EX_heroine_01===true&&H.G.flags.EX_heroine_01_REASON==='talk'&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===AN&&h.how==='apart_talk')&&H.G.flags.CLEANUP_DONE===false);
    if(res==='drift'){ const dd=pr(AN).drift; at(thu+14,20.9); rules(); const a=dm(AN).length; at(thu+14,21); rules();
      check('A3. 不回答：兩週後 21:00「我們先回到讀書會的同學。理由欄我先空著。」、慢慢淡（apart_drift、EX_REASON drift）',dd&&dd.day===thu+14&&a===0&&J(dm(AN))===J(['heroine_01:我們先回到讀書會的同學。理由欄我先空著。'])&&H.G.flags.dating_heroine_01===false&&H.G.flags.EX_heroine_01_REASON==='drift'&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===AN&&h.how==='apart_drift'),J(dm(AN))); } }
  /* 讀書會沒去：22:00 私訊 → 隔天 Café */
  setup(); at(thu,21.9); rules(); const a0=dm(AN).length; at(thu,22); rules();
  check('A4. 那晚沒去讀書會：22:00「明天下午四點，兩點半窗邊。」「理由：有一件事，要當面說。」',a0===0&&J(dm(AN))===J(['heroine_01:明天下午四點，兩點半窗邊。','heroine_01:理由：有一件事，要當面說。'])&&pr(AN).plan.i===1,J(dm(AN)));
  at(thu+1,16.5); rules(); check('A5. 隔天 16:30「我在窗邊。」',dm(AN).slice(-1)[0]==='heroine_01:我在窗邊。');
  at(thu+1,16.7); H.G.zone='cafe'; H.said=[]; H.picks=[0,0]; await tick(); check('A5. 16:40 走進 Café：談話（模糊的 3D），修補',J(said())===J(AN_BODY.concat(['……這個理由我收下。','（她把兩個人的規則改成一條：「有事，要說理由。」）']))&&cnt(AN)===0,J(said()));
  setup(); at(thu,22); rules(); at(thu+1,17.3); rules(); check('A6. Café 17:15 還沒到＝不回答（慢慢淡排兩週後）',!pr(AN).plan&&!!pr(AN).drift&&pr(AN).drift.day===thu+1+14);
  /* 讀書會不開的週（期中第 8 週）*/
  fresh('2026-10-26',10,'dorm'); date(AN); for(let i=0;i<3;i++) crack(AN,1); p=pr(AN).plan; const t8=D('2026-10-29');
  at(t8,20.9); rules(); const b0=dm(AN).length; at(t8,21); rules();
  check('A7. 讀書會不開的週：週四 21:00 私訊兩句 → 隔天 16:00 Café',p.att.length===1&&p.att[0].zone==='cafe'&&p.att[0].day===t8+1&&b0===0&&dm(AN).length===2,J(p.att));
  /* 她在日本、你不在：視訊；不回答＝修補（沒有誰對誰錯的一次，最多一次）*/
  fresh('2028-04-10',10,'dorm',{EXCHANGE_ROUTE:'TW'}); date(AN); for(let i=0;i<3;i++) crack(AN,1); p=pr(AN).plan;
  check('A8. 她在日本（2028-04）：視訊 21:00、20:00「今晚九點，視訊。我有一件事要說理由。」',p&&p.mode==='jp_video'&&p.att[0].video&&p.att[0].h===21&&p.att[0].invite.h===20&&p.att[1].day===p.att[0].day+1,J(p&&p.att));
  at(p.att[0].day,20); rules(); const q1=outOf(AN)[0];
  check('A8. 20:00 私訊、排視訊（接起來／先不接）',dm(AN).slice(-1)[0]==='heroine_01:今晚九點，視訊。我有一件事要說理由。'&&q1&&q1.place==='視訊'&&q1.verb==='接起來'&&q1.h===21);
  at(p.att[0].day,21.4); expire(); rules(); at(p.att[0].day+1,21.4); rules(); expire(); rules();
  check('A9. 兩天都沒接＝不回答；她在日本那一次＝修補（還在交往、歸零、不排慢慢淡）',!pr(AN).plan&&!pr(AN).drift&&pr(AN).jpUsed===true&&H.G.flags.dating_heroine_01===true&&cnt(AN)===0,J(pr(AN)));
  /* 視訊接起來 */
  fresh('2028-04-17',10,'dorm',{EXCHANGE_ROUTE:'TW'}); date(AN); for(let i=0;i<3;i++) crack(AN,1); p=pr(AN).plan; at(p.att[0].day,20.9); rules(); const q2=outOf(AN)[0]; await go(q2,[1]);
  check('A10. 視訊接起來：背景視訊、台詞逐字；選「我想我們要的不一樣。」＝分開',J(said())===J(AN_BODY.concat(['（以安翻開手帳，在理由欄寫一行給你看：「分開。理由：我們都沒有錯。」）','這樣寫，可以嗎？']))&&H.bgs.some(b=>b&&b.image==='assets/bg/video.webp')&&H.G.flags.dating_heroine_01===false,J(said()));
  /* 寒假：視訊 */
  fresh('2027-01-11',10,'dorm'); date(AN); for(let i=0;i<3;i++) crack(AN,1); p=pr(AN).plan; check('A11. 寒假（她回台中）：視訊',p&&p.mode==='video'&&p.att[0].video);
});

/* ======================= Y 語彤 ======================= */
const YT_BODY='我分給你的時間，你好像不太需要。……沒關係，我只是想問清楚。', YT_O=['「我需要。週四我都來。」','「我們好像都太忙了。」',NONE];
await sec('Y',async()=>{
  const t1=D('2028-09-14');
  const ytG=k=>{ fresh(k,10,'dorm',{YT_EV13:true}); date(YT); return H.G; };
  ytG('2028-09-14'); at(t1,12); rules(); const n0=dm(YT).length; at(t1,12+10/60); rules(); const m=PHONE.byAsk(H.G,'ct_yt_seat_2028-09-14');
  check('Y1. 交往中、她的週四是自己的：12:10「今天週四。總圖三樓，斜對面的位子我留了。」、回覆「今天不行」',n0===0&&J(dm(YT))===J(['heroine_03:今天週四。總圖三樓，斜對面的位子我留了。'])&&!!m&&J(m.ask.opts.map(o=>o.t))===J(['今天不行']),J(dm(YT)));
  at(t1,17.5); H.G.zone='library'; await tick(); H.G.zone='dorm'; at(t1,20); rules(); check('Y2. 17:30 去了總圖三樓：不加',cnt(YT)===0);
  ytG('2028-09-14'); at(t1,12.5); rules(); PHONE.answer(H.G,'ct_yt_seat_2028-09-14',0); at(t1,20.1); rules(); check('Y3. 回「今天不行」：沒去也不加（婉拒有說）',cnt(YT)===0);
  ytG('2028-09-14'); at(t1,12.5); rules(); at(t1,19.9); rules(); const c1=cnt(YT); at(t1,20); rules();
  check('Y4. 沒去、也沒回：20:00 加 1',c1===0&&cnt(YT)===1);
  ytG('2028-09-14'); H.G.flags.YT_EV13=false; at(D('2027-10-14'),12.5); rules(); check('Y5. 她的週四還是麵店（大三上 12/16 以前）：沒有這一則',!dm(YT).length);
  ytG('2028-09-14'); H.G.flags.dating_heroine_03=false; at(t1,12.5); rules(); check('Y5. 沒交往：沒有這一則',!dm(YT).length);
  /* 三個週四都沒去 → 第四個週四談話 */
  ytG('2028-09-14'); for(const d of [t1,t1+7,t1+14]){ at(d,12.5); rules(); at(d,20); rules(); }
  const p=pr(YT).plan, t4=t1+21;
  check('Y6. 三個週四都沒去＝3、排下一個週四 17:30～18:30 總圖三樓',cnt(YT)===3&&p&&p.att[0].zone==='library'&&p.att[0].day===t4&&p.att[0].h===17.5&&p.att[1].day===t4+7,J(p&&p.att));
  at(t4,12.5); rules(); check('Y7. 那天 12:10：談話的兩句「今天週四。我在三樓。」「……我想問你一件事。」（不是留位子那一則）',J(dm(YT).slice(-2))===J(['heroine_03:今天週四。我在三樓。','heroine_03:……我想問你一件事。'])&&!PHONE.byAsk(H.G,'ct_yt_seat_'+keyOf(t4)),J(dm(YT).slice(-3)));
  for(const [k,tail,res] of [[0,['好。那斜對面，我繼續留。'],'mend'],[1,['嗯。那我把這段時間，還給我自己。……謝謝你教我分時間。'],'apart'],[2,[],'drift']]){
    ytG('2028-09-14'); for(const d of [t1,t1+7,t1+14]){ at(d,12.5); rules(); at(d,20); rules(); } at(t4,17.6); H.G.zone='library'; H.said=[]; H.opts=[]; H.picks=[k]; await tick();
    check('Y8. 總圖三樓（'+res+'）：逐字、三個選項',J(said())===J([YT_BODY].concat(tail))&&J(H.opts[0])===J(YT_O),J({s:said(),o:H.opts}));
    if(res==='mend') check('Y9. 修補：歸零、繼續留位子（下個週四照樣傳）',cnt(YT)===0&&(at(t4+7,12.5),rules(),dm(YT).slice(-1)[0]==='heroine_03:今天週四。總圖三樓，斜對面的位子我留了。'));
    if(res==='apart') check('Y9. 好好分開：apart_talk',H.G.flags.dating_heroine_03===false&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===YT&&h.how==='apart_talk'));
    if(res==='drift'){ at(t4+7,12.5); rules(); const noSeat=!PHONE.byAsk(H.G,'ct_yt_seat_'+keyOf(t4+7)); at(t4+7,21); rules(); const ended=H.G.flags.dating_heroine_03===false;
      at(t4+9,18); H.G.zone='noodle'; H.said=[]; await tick();
      check('Y9. 不回答：她不再留位子；一週後分開（apart_drift），之後到麵店「加滷蛋。……這個不會變。」',noSeat&&ended&&J(said())===J(['加滷蛋。……這個不會變。'])&&H.G.flags.EX_heroine_03_REASON==='drift',J(said())); } }
  /* 沒到：20:00「沒關係。下週四。」→ 下週四；還是沒到＝不回答 */
  ytG('2028-09-14'); for(const d of [t1,t1+7,t1+14]){ at(d,12.5); rules(); at(d,20); rules(); } at(t4,12.5); rules(); at(t4,20.1); rules();
  check('Y10. 沒到：20:00「沒關係。下週四。」，延到下一個週四',dm(YT).slice(-1)[0]==='heroine_03:沒關係。下週四。'&&pr(YT).plan.i===1);
  at(t4+7,20.1); rules(); check('Y10. 下一個週四還是沒到＝不回答',!pr(YT).plan&&!!pr(YT).drift);
  /* 你在國外：視訊 */
  fresh('2028-10-02',10,'dorm',{YT_EV13:true,EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true}); date(YT); for(let i=0;i<3;i++) crack(YT,1); const pv=pr(YT).plan;
  check('Y11. 你在美國：視訊（臺灣 21:00＝當地早上）、20:00「今晚九點，可以視訊嗎。」',pv&&pv.mode==='video'&&pv.att[0].video&&J(pv.att[0].invite.msgs)===J(['今晚九點，可以視訊嗎。']),J(pv));
});

/* ======================= P 沛珊 ======================= */
const PS_BODY=['我們都在往前走，可是方向越來越不一樣。','……這次我不想等到吵架才說。'];
await sec('P',async()=>{
  const psG=(since)=>{ fresh('2027-10-04',10,'dorm'); date(PS); if(since) ROM.get(H.G,PS).sinceDay=D(since); for(let i=0;i<3;i++) crack(PS,1); return pr(PS).plan; };
  let p=psG(); check('P1. 視訊 21:00（她在台南）；20:00「今晚九點，可以視訊嗎？」「……有一件事，我想好好說。」；沒接 30 分鐘再打、隔天兩次',p&&p.mode==='video'&&p.att.length===4&&p.att[1].h===21.5&&p.att[2].day===p.att[0].day+1&&J(p.att[0].invite.msgs)===J(['今晚九點，可以視訊嗎？','……有一件事，我想好好說。']),J(p&&p.att));
  at(p.att[0].day,20.95); rules(); let q=outOf(PS)[0]; await go(q,[2,1]);
  check('P2. 「妳想好了嗎？」→「我想了一個月。我只是想聽你說。」→ 只剩兩個（＋不回答）；「我也有感覺。」＝生活差異（重考那年沒在交往：沒有最後那一句）',J(said())===J(PS_BODY.concat(['我想了一個月。我只是想聽你說。','嗯。……那我們好好說再見。']))&&J(H.opts[0])===J(['「每個月留一天給溫州街。」','「我也有感覺。」','「妳想好了嗎？」',NONE])&&J(H.opts[1])===J(['「每個月留一天給溫州街。」','「我也有感覺。」',NONE])&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===PS&&h.how==='apart_life'),J({s:said(),o:H.opts}));
  p=psG('2026-10-01'); at(p.att[0].day,20.95); rules(); q=outOf(PS)[0]; await go(q,[1]);
  check('P3. 重考那年（2026-12-17 起）已經在交往：分開時「謝謝你在我重考那年陪我。那一年，我不會忘。」',said().slice(-1)[0]==='謝謝你在我重考那年陪我。那一年，我不會忘。');
  p=psG(); at(p.att[0].day,20.95); rules(); q=outOf(PS)[0]; await go(q,[0]);
  check('P4. 「每個月留一天給溫州街。」→「好。我會記得你說過。」＝修補（之後要驗的溫州街邀約對不上現行設定：先當修補）',said().slice(-1)[0]==='好。我會記得你說過。'&&cnt(PS)===0&&H.G.flags.dating_classmate_peishan===true);
  p=psG(); for(const a of p.att){ at(a.day,a.h+0.4); rules(); expire(); rules(); } const dr=pr(PS).drift;
  at(dr.day,21); rules();
  check('P5. 四通都沒接＝不回答；兩週後只送第二句「我們先當朋友。……這樣你就不用回答了。」（視訊談的，沒有溫州街那句）',J(dm(PS).slice(-1))===J(['classmate_peishan:我們先當朋友。……這樣你就不用回答了。'])&&!dm(PS).some(t=>/溫州街那天/.test(t))&&H.G.flags.dating_classmate_peishan===false,J(dm(PS).slice(-3)));
});

/* ======================= Z 芷若 ======================= */
const ZR_BODY=['我在想，我們是不是都在等對方先說累。','……我先說好了。我有一點累。'];
await sec('Z',async()=>{
  /* 裂縫①：每週視訊「早點睡。」連兩次 */
  fresh('2028-10-02',10,'dorm'); date(ZR); ZRUK.sleepPick(H.G,true); ZRUK.sleepPick(H.G,true); check('Z1. 每週視訊「早點睡。」連兩次＝+1（zr_uk3d.js，這學期）',cnt(ZR)===1&&H.G.flags.ZR_CRACK_TERM==='Y4S1');
  const zrG=k=>{ fresh(k||'2028-10-09',10,'dorm'); date(ZR); for(let i=0;i<3;i++) crack(ZR,1); return pr(ZR).plan; };
  let p=zrG(); const sat=D('2028-10-14');
  check('Z2. 到 3（10/9 週一）：週六臺灣 17:00 視訊；週五 23:30「明天你那邊下午五點，可以視訊嗎？」「……有一件事，我想看著你說。」；17:05 一則；17:30、週日兩次',p&&p.att[0].day===sat&&p.att[0].h===17&&p.att[0].invite.day===sat-1&&p.att[0].invite.h===23.5&&J(p.att[0].invite.msgs)===J(['明天你那邊下午五點，可以視訊嗎？','……有一件事，我想看著你說。'])&&J(p.att[0].mid.msgs)===J(['我泡好茶了。……我等你半小時。'])&&p.att[1].h===17.5&&p.att[3].day===sat+1,J(p&&p.att));
  at(sat-1,23.5); rules(); at(sat,17+5/60); rules();
  check('Z3. 週五 23:30 兩句、週六 17:05「我泡好茶了。……我等你半小時。」',J(dm(ZR).slice(-3))===J(['heroine_02:明天你那邊下午五點，可以視訊嗎？','heroine_02:……有一件事，我想看著你說。','heroine_02:我泡好茶了。……我等你半小時。']),J(dm(ZR)));
  /* 修補「每週固定一個時間」（夏令／冬令兩句）*/
  for(const [k,line,win] of [['2028-10-09','好。我那邊早上十點，你那邊晚上五點。','夏令'],['2028-11-06','好。我那邊的早上九點，你那邊的晚上五點。','冬令']]){ p=zrG(k); at(p.att[0].day,16.9); rules(); const q=outOf(ZR)[0]; await go(q,[0]);
    check('Z4. 「每週固定一個時間。」（'+win+'）：「'+line+'」、ZR_WEEKLY_FIX（zr_uk3d.js 改 17:00）、寒假那個選項不出',J(said())===J(ZR_BODY.concat([line]))&&J(H.opts[0])===J(['「每週固定一個時間。」','「我好像撐不住遠距。」',NONE])&&H.G.flags.ZR_WEEKLY_FIX===true&&ZRUK.fixOn(H.G)&&cnt(ZR)===0&&!!pr(ZR).commit,J({s:said(),o:H.opts})); }
  /* 八週接六次 */
  const fill=(ans)=>{ const R=ZRUK.rec(H.G).w, s=pr(ZR).commit.since; ans.forEach((a,i)=>R.log.push({day:s+7*(i+1),ans:a,fix:true})); };
  p=zrG(); at(p.att[0].day,16.9); rules(); await go(outOf(ZR)[0],[0]); fill(['yes','missed','yes','yes','yes','yes','yes']); rules();
  check('Z5. 修補以後八週接六次：繼續（承諾結束）',!pr(ZR).commit&&H.G.flags.dating_heroine_02===true&&pr(ZR).kept===1);
  p=zrG(); at(p.att[0].day,16.9); rules(); await go(outOf(ZR)[0],[0]); fill(['yes','missed','missed','missed']); rules();
  check('Z6. 漏到三次：分開（apart_talk）、她私訊最後一句「回去以後，我還是在吧檯後面。你點什麼，我都記得。」',H.G.flags.dating_heroine_02===false&&dm(ZR).slice(-1)[0]==='heroine_02:回去以後，我還是在吧檯後面。你點什麼，我都記得。'&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===ZR&&h.how==='apart_talk'));
  p=zrG(); at(p.att[0].day,16.9); rules(); await go(outOf(ZR)[0],[1]);
  check('Z7. 「我好像撐不住遠距。」→「嗯。我也是。……我們好好說。」＋最後一句、生活差異',J(said())===J(ZR_BODY.concat(['嗯。我也是。……我們好好說。','回去以後，我還是在吧檯後面。你點什麼，我都記得。']))&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===ZR&&h.how==='apart_life'));
  /* 不回答：兩週後的信封 */
  p=zrG(); for(const a of p.att){ at(a.day,a.h+0.4); rules(); expire(); rules(); } const dr=pr(ZR).drift; at(dr.day,12); rules(); H.said=[]; await tick();
  check('Z8. 四通都沒接＝不回答：兩週後的信封（旁白＋小卡「我們先當朋友。片單我還是會寄。」）、慢慢淡',J(H.lines())===J(['（英國寄來一個信封。裡面一張明信片、一張只寫給你的小卡。）','小卡：「我們先當朋友。片單我還是會寄。」'])&&H.G.flags.dating_heroine_02===false&&H.G.flags.EX_heroine_02_REASON==='drift',J(H.lines()));
  /* 明信片連兩張沒回 → 下一張多一句、+1（避不掉的）；讓它到 3 的是這一件＝不回答改成「我們再試一個月。」 */
  fresh('2028-11-17',13,'dorm'); date(ZR); ROM.get(H.G,ZR).sinceDay=D('2028-09-01'); H.FRIEND(ZR); H.CLOSE(ZR); crack(ZR,1); crack(ZR,1);
  const cards=R2Y4A.pc2Cards(H.G), c3=cards.find(c=>c.key==='2028-11-17');
  const L3=R2Y4A.pc2Lines(H.G,c3), L3b=R2Y4A.pc2Lines(H.G,c3);
  check('Z9. 第二輪明信片：9 月、10 月兩張都沒回寄＝11 月那張最後一行「上一張你沒回。……沒關係，這張也不用。」、+1（再讀一次不再加）',L3[L3.length-1].q==='上一張你沒回。……沒關係，這張也不用。'&&L3b[L3b.length-1].q==='上一張你沒回。……沒關係，這張也不用。'&&cnt(ZR)===3&&pr(ZR).lastUnavoid===true&&!!pr(ZR).plan,J(L3.slice(-2)));
  const c4=cards.find(c=>c.key==='2028-12-15'); check('Z9. 下一張（12 月）不再加（要再連兩張才算）',!c4||!R2Y4A.pc2Lines(H.G,Object.assign({},c4,{i:c3.i+1})).some(l=>l.q==='上一張你沒回。……沒關係，這張也不用。'));
  p=pr(ZR).plan; for(const a of p.att){ at(a.day,a.h+0.4); rules(); expire(); rules(); } const d2=pr(ZR).drift; at(d2.day,12); rules();
  check('Z10. 避不掉的那一件讓計數到 3：不回答＝她傳「我們再試一個月。」、歸零、還在交往（一次）',d2&&d2.retry&&dm(ZR).slice(-1)[0]==='heroine_02:我們再試一個月。'&&H.G.flags.dating_heroine_02===true&&cnt(ZR)===0&&pr(ZR).unavoidUsed===true,J(dm(ZR).slice(-2)));
  fresh('2028-03-10',10,'dorm'); date(ZR); for(let i=0;i<3;i++) crack(ZR,1); check('Z11. 她不在英國（2028-03）：先等，不排',!pr(ZR).plan&&!!pr(ZR).wait);
  /* 「寒假我去英國找妳。」：1c-1 那一趟進遊戲以後、寒假以前才出；寒假結束（2/19）去過＝繼續，沒去＝分開 */
  STORY_EVENTS.push({id:'ev_zhiruo_uk_visit',title:'（測試用）',participants:[ZR],location:'any',trigger:'manual',dialogue:[]});
  p=zrG(); at(p.att[0].day,16.9); rules(); await go(outOf(ZR)[0],[0]);
  check('Z12. 1c-1 那一趟在遊戲裡、寒假以前：多「寒假我去英國找妳。」→「真的？……那我先排好要看的片。」',J(H.opts[0])===J(['「寒假我去英國找妳。」','「每週固定一個時間。」','「我好像撐不住遠距。」',NONE])&&said().slice(-1)[0]==='真的？……那我先排好要看的片。'&&pr(ZR).commit&&pr(ZR).commit.kind==='zr_trip',J(H.opts));
  at('2029-02-19',10); rules(); check('Z12. 寒假結束沒去：分開（apart_talk）＋最後一句私訊',H.G.flags.dating_heroine_02===false&&dm(ZR).slice(-1)[0]==='heroine_02:回去以後，我還是在吧檯後面。你點什麼，我都記得。');
  p=zrG('2029-02-26'); at(p.att[0].day,16.9); rules(); await go(outOf(ZR)[0],[0]);
  check('Z13. 大四下（寒假以後）才談：沒有「寒假我去英國找妳。」',!H.opts[0].includes('「寒假我去英國找妳。」')&&said().slice(-1)[0]!=='真的？……那我先排好要看的片。',J(H.opts));
  STORY_EVENTS.splice(STORY_EVENTS.findIndex(e=>e.id==='ev_zhiruo_uk_visit'),1);
});

/* ======================= Q 子晴 ======================= */
const ZQ_BODY=['我有話要說。','我們最近一直在錯過。我不想變成你在等的人。'];
await sec('Q',async()=>{
  const zqG=k=>{ fresh(k||'2028-10-09',10,'dorm'); date(ZQ); for(let i=0;i<3;i++) crack(ZQ,1); return pr(ZQ).plan; };
  let p=zqG(); const sat=D('2028-10-14');
  check('Q1. 到 3：週六 19:00 河堤；週五 21:00「明天晚上七點，河堤。」「……你會來吧。這次是問句。」',p&&p.att[0].day===sat&&p.att[0].h===19&&J(p.att[0].invite.msgs)===J(['明天晚上七點，河堤。','……你會來吧。這次是問句。'])&&p.att[1].day===sat+1,J(p&&p.att));
  at(sat-1,21); rules(); const q=outOf(ZQ)[0]; check('Q2. 週五 21:00 私訊、行事曆排週六 19:00 河堤（走路 15 分鐘）',dm(ZQ).length===2&&q&&q.day===sat&&q.h===19&&q.place==='河堤');
  at(sat,19.5); rules(); check('Q3. 19:30「我在河堤」「等到八點」',J(dm(ZQ).slice(-2))===J(['heroine_04:我在河堤','heroine_04:等到八點']));
  at(sat,20.1); expire(); rules(); check('Q4. 沒到：20:00「明天。一樣七點。」→ 週日 19:00',dm(ZQ).slice(-1)[0]==='heroine_04:明天。一樣七點。'&&pr(ZQ).plan.i===1&&!!outOf(ZQ).find(x=>x.day===sat+1&&x.state==='planned'));
  at(sat+1,18.5); const q2=outOf(ZQ).find(x=>x.day===sat+1); await go(q2,[1,1]);
  check('Q5. 河堤：逐字；「我等，是因為我想等。」→「我知道。……可是我不想。」→ 回到另外兩個；「我們都太忙了。」＋最後一句、生活差異',J(said())===J(ZQ_BODY.concat(['我知道。……可是我不想。','嗯。……我們先不要了。','之後還是朋友。……我說真的。']))&&J(H.opts[0])===J(['「那妳來決定時間。」','「我等，是因為我想等。」','「我們都太忙了。」',NONE])&&J(H.opts[1])===J(['「那妳來決定時間。」','「我們都太忙了。」',NONE])&&H.bgs.some(b=>b&&b.image==='assets/bg/riverside.webp')&&H.G.flags.ROMANCE_HISTORY.some(h=>h.id===ZQ&&h.how==='apart_life'),J({s:said(),o:H.opts}));
  p=zqG(); at(sat,18.5); rules(); await go(outOf(ZQ)[0],[0]); check('Q6. 「那妳來決定時間。」→「……好。這次換我約你。」＝修補（她發的三次邀約遊戲裡沒有：先當修補）',said().slice(-1)[0]==='……好。這次換我約你。'&&cnt(ZQ)===0&&H.G.flags.dating_heroine_04===true);
  p=zqG(); for(const a of p.att){ at(a.day,a.h+1.1); rules(); expire(); rules(); } const dr=pr(ZQ).drift; at(dr.day,21); rules();
  check('Q7. 兩次都沒到＝不回答：一週後貼圖＋「我們先當朋友」',J(dm(ZQ).slice(-2))===J(['heroine_04:（貼圖：插座貓，一隻貓自己在充電）','heroine_04:我們先當朋友'])&&H.G.flags.dating_heroine_04===false,J(dm(ZQ).slice(-3)));
  p=zqG('2029-05-07'); check('Q8. 那個週六是 5/12（吉他社成發）：改週日 5/13，前一晚 5/12 21:00 私訊',p.att[0].day===D('2029-05-13')&&p.att[0].invite.day===D('2029-05-12'),J(p.att[0]));
  fresh('2028-10-09',10,'dorm',{EXCHANGE_ROUTE:'US',US_DEPARTED:true,US_ARRIVED:true}); date(ZQ); for(let i=0;i<3;i++) crack(ZQ,1); check('Q9. 你在美國：先等',!pr(ZQ).plan&&!!pr(ZQ).wait);
});

H.done();
})();
