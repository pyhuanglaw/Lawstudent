// AA_360（STORY-AUDIT-1017，AA-C ff6f5923）：使用者 2026-10-17 回 BB_190 BB-LOGIC-13／14／16／18（記在 BB_194 第 17、19、20 節），照 AA_360 第 6 節改回使用者定的方向——不需要瀏覽器。
//   第 1 組（13）子晴 Q12「她自己決定」：S.zqGame 一律《九點以後》（不看祐廷 Q10 的選擇、不看 PLAYTESTED）；Q10 三個選項都有爸爸那一幕；日本路線的電話一律《九點以後》（AA_341 J-S18 作廢）；
//        尾聲：舊存檔演過《找插座的貓》（ZQ_Q12 'cat'）照舊，其他（含沒看過 Q12 的）＝《九點以後》。
//   第 2 組（14）學姊考試前後：1/26 不再私訊、不排 20:00 出遊、寒假快轉不為她停；1/24～1/27 晚上（20:00 以後）在總圖、離開總圖的時候演（SIS_STUDY、一次）；
//        開頭兩行新旁白＋「學弟。你怎麼在這裡。」、選項 c「我陪妳走到捷運站。」；舊存檔已經收到 1/26 私訊的照舊演一次（舊的字）；2/2、2/3 前置 SIS_STUDY||SIS_PREEXAM_NIGHT；計畫本第一頁她自己寫。
//   第 3 組（15）沛珊尾聲 mirror 換句；子晴 Q15 前置不要 TOLD_HER_CHANGE；芷若 Z7 家裡那版三句（BB_167 E1）、記憶備註。
//   第 4 組（16）子晴 Q4 只有第 8 週；錯過的玩家第 9～11 週第一次和她說話，開頭多一句（CONTEST_HEARD，一次）。
//   第 5 組（17、18）confess_lines.js 沛珊那一段的過時註解。
// 台詞照 AA_360 逐字比對。修改前（開發分支 04f65f59）：FAIL 22 項。用法：node tests/aa360_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const NM=/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|MSG_KX_Y0|NEEDED_MSGS|HOMETOWN_LINES|SISG|R2Y3B|R2Y3B_EVENTS)$/;
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>NM.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
global.CG_REGISTRY=global.CG_REGISTRY||{};
for(const f of ['src/data/msg_pool.js','src/data/msg2_pool.js','src/data/msg_kx_y0.js','src/data/needed_msgs.js','src/data/hometown_lines.js','src/msg3d.js','src/exchange3d.js','src/y34b3d.js','src/sis_grad3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js']) load(f);
const {check,GM,E}=H;
const DK=k=>STORY.dayOfKey(k), Tm=(d,h)=>d*24+h;
const wdOf=d=>{ const w=CALENDAR.dateOf(d).wd; return w===7?0:w; };
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const txts=()=>H.said.map(s=>s.t);
const has=t=>H.said.some(s=>s.t===t);
const sec=async(name,f)=>{ try{ await f(); }catch(e){ check(name+'（執行出錯）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' | ')); } };
/* 共用：日期用字串（第 1、3 組）或第幾天（第 2、4 組）開新局 */
const freshK=(key,h,zone,flags,route)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:route||'TW',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; G.contacts={}; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; E.player.obj.position.x=0; E.player.obj.position.z=0; return G; };
const freshD=(day,h,zone,flags)=>freshK(CALENDAR.dateOf(day).key,h,zone,flags);
const setT=(day,h)=>{ H.G.day=day; H.G.hour=h; H.G.weekday=wdOf(day); };
const tick=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const span=(t0,t1,st)=>{ st=st||0.05; for(let t=t0;t<=t1+1e-9;t+=st){ const d=Math.floor(t/24); setT(d,+(t-d*24).toFixed(4)); tick(); } };

(async()=>{
  /* ===================== 第 1 組（13）子晴 Q12 一律《九點以後》===================== */
  await sec('13',async()=>{
    const Y=Y34B, phone=()=>{ Y.phone(H.G); PHONE.tick(H.G); };
    { const r=[]; for(const q10 of ['nameless','cat','both','self',undefined]) for(const pt of [true,false]){ freshK('2028-05-19',20,'dorm',q10?{ZQ_Q10:q10}:{}); H.FAMILIAR('heroine_04'); if(pt) SOCIAL.remember('heroine_04','PLAYTESTED',''); r.push([q10||'-',pt,Y.zqGame(H.G)]); }
      check('13-1. S.zqGame 不看祐廷 Q10 的選擇、不看 PLAYTESTED：一律《九點以後》（nine）', r.every(x=>x[2]==='nine'), JSON.stringify(r.filter(x=>x[2]!=='nine'))); }
    for(const q10 of ['nameless','cat','both']){ freshK('2028-05-19',20,'dorm',{ZQ_Q10:q10}); H.FAMILIAR('heroine_04'); H.at('2028-05-19',21); phone(); H.at('2028-05-20',13.8);
      const q=OUT.get(H.G,'y3_zq_q12'); H.said=[]; H.opts=[]; H.cgs=[]; H.picks=[]; if(q) await OUT.go(GM,q);
      check('13-2. Q10 選 '+q10+'（沒有 PLAYTESTED）：Q12 是《九點以後》、「謝謝：爸爸」、爸爸那一幕（BCG-03）；沒有貓那一版；ZQ_Q12 nine', !!q&&has('（一個小孩每天晚上等一個人回家，一起打一場。最後一關，那個人回來了，但小孩已經長大了，換她陪那個人打。）')&&has('謝謝：爸爸')&&has('（轉過來）最後一關，我打過了。')&&H.cgs.includes('cg_final_stage_heroine04')&&!has('（她爸爸也來了，在試玩機前玩貓，卡在第三關。）')&&!has('（全場笑。她在最後一張投影片說：「我還有另一個。還沒做完。」）')&&H.G.flags.ZQ_Q12==='nine', JSON.stringify(txts().slice(0,3))); }
    { freshK('2028-05-20',21,'dorm',{ZQ_Q10:'cat'},'JP'); H.FAMILIAR('heroine_04'); H.at('2028-05-20',22); H.said=[]; await Y.zqCall(GM);
      check('13-3. 日本路線的電話（AA_341 J-S18 作廢）：選「交貓。貓很好。」的也是《九點以後》那一句「他打了五次……」、沒有「下一個做完，你來測。」；ZQ_Q12 nine', has('他打了五次。第五次過了。……我在後面笑到不行。')&&!has('下一個做完，你來測。')&&H.G.flags.ZQ_Q12==='nine', JSON.stringify(txts())); }
    { const epi=fl=>{ freshK('2029-07-01',20,'cafe',fl); return JSON.stringify(PG.epiLine(H.G,'heroine_04')); };
      const n0=epi({}), n1=epi({ZQ_Q12:'nine'}), c=epi({ZQ_Q12:'cat'});
      check('13-4. 尾聲：沒有看過 Q12（沒有 ZQ_Q12）也是《九點以後》那一句；舊存檔演過《找插座的貓》（ZQ_Q12 cat）照舊、不改', n0===JSON.stringify([['heroine_04','《九點以後》賣了三萬套。我爸買了兩套。一套給自己，一套給醫院的值班室。']])&&n1===n0&&c===JSON.stringify([['heroine_04','《找插座的貓》賣了三萬套。我爸買了兩套。'],['heroine_04','……沒有名字的那個，今年冬天上架。']]), n0+' / '+c);
      freshK('2029-07-01',20,'cafe',{}); const x=JSON.stringify(PG.exLines(H.G,'heroine_04'));
      check('13-4. 前任那一句後面接的也是《九點以後》（沒有 ZQ_Q12）', x.includes('《九點以後》賣了三萬套')&&!x.includes('《找插座的貓》賣了三萬套'), x); }
  });

  /* ===================== 第 2 組（14）學姊考試前後 ===================== */
  const SID='heroine_05';
  const FRI5=()=>{ const r=SOCIAL.rel(SID); r.fam=45; r.trust=30; r.comf=20; SOCIAL.remember(SID,'FIRST_MET',''); };
  const her=()=>(H.G.msgs||[]).filter(m=>m.th==='p:'+SID&&m.from===SID);
  const d21=DK('2026-01-21'), d23=DK('2026-01-23'), d24=DK('2026-01-24'), d25=DK('2026-01-25'), d26=DK('2026-01-26'), d27=DK('2026-01-27'), d28=DK('2026-01-28'), d31=DK('2026-01-31'), d2=DK('2026-02-02'), d3=DK('2026-02-03'), d4=DK('2026-02-04');
  const OLD_MSG=()=>PHONE.at(H.G,d26,18,[{th:'p:'+SID,from:SID,text:'今天總圖讀到閉館。位子幫你留了'}],'sisg_low_msg');   /* 舊版本的程式在 1/26 18:00 傳的那一則（舊存檔裡有）*/
  /* 在總圖（zone）待到 h、然後走出總圖（到 out）：SISG.tick 在總圖裡、走出去以後各跑一次 */
  const lowPlay=async(day,h,flags,pick,zone,out)=>{ freshD(day,h,zone||'library_hall',Object.assign({SIS_W1:true,SIS_STUDY:true},flags||{})); FRI5(); const r0=Object.assign({},SOCIAL.rel(SID)); H.said=[]; H.opts=[]; H.cgs=[]; H.picks=[pick||0];
    const a=SISG.tick(GM); if(a) await SISG._p; const inLib=H.said.length; H.G.zone=out||'campus'; const b=SISG.tick(GM); if(b) await SISG._p; return {a,b,inLib,L:txts(),O:H.opts[0],r0,r1:Object.assign({},SOCIAL.rel(SID))}; };
  const HEAD=['（總圖門口的台階。兩個人剛收好東西先走了，走在後面的男生回頭看了一下。）','（她還坐在台階上，計畫本攤在膝蓋上，一頁一頁往回翻。）','學弟。你怎麼在這裡。','我在看我的計畫本。大一到現在的。','每一週都排滿了。我剛剛在找有沒有哪一週是空的。','……沒有。','（她把計畫本闔上。）','下禮拜就考試了。我有一點怕。'];
  await sec('14-1',async()=>{
    freshD(d26,17,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI5(); span(Tm(d26,17.9),Tm(d26,21));
    check('14-1. 1/26 不再由她約：18:00 沒有私訊「今天總圖讀到閉館。位子幫你留了」、沒有排 20:00 的出遊', !her().length&&!PHONE.sent(H.G,'sisg_low_msg')&&!OUT.get(H.G,'sisg_low_night'), JSON.stringify(her().map(m=>m.text)));
    freshD(d21,10,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI5(); const st=SISG.stops(H.G,Tm(d21,10))||[]; freshD(d26,17.6,'dorm',{SIS_W1:true,SIS_STUDY:true}); const w=STORY.lawWakeAt(H.G);
    check('14-1. 寒假快轉不為她停：1/24～1/27 沒有她的停點；1/26 宿舍睡著不會 18:00 醒來', !st.some(t=>t>=Tm(d24,0)&&t<Tm(d28,0))&&w!==18, JSON.stringify(st)+' wake='+w);
    freshD(d21,10,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI5(); PHONE.join(H.G,'family_law','法律系直屬家族'); H.picks=['到下一個有事的日子']; await HOME.ffMenu(GM,'dorm');
    check('14-1. 從 1/21 快轉「到下一個有事的日子」：不停在 1/24～1/27，直接到 1/31 21:00（Kevin 的集氣群組）', Tm(H.G.day,H.G.hour)===Tm(d31,21), [H.G.day-d21,H.G.hour].join());
  });
  await sec('14-2',async()=>{
    const r=await lowPlay(d25,20.5,{},2);
    check('14-2. 1/25 20:30 在總圖（還在裡面不演）、走出總圖：演「筆試前一週的晚上」', !r.a&&r.inLib===0&&r.b===true&&r.L.length>0, JSON.stringify([r.a,r.inLib,r.b]));
    check('14-2. 台詞：兩行新旁白 → BCG-42 →「學弟。你怎麼在這裡。」→ 後面照舊；選項 c「我陪妳走到捷運站。」→「……好。走到那裡就好。」→ 最後一句照舊', JSON.stringify(r.L)===JSON.stringify(HEAD.concat(['……好。走到那裡就好。','好了，我回去了。明天還是八點到。']))&&H.cgs.includes('cg_planner_four_years_heroine05')&&JSON.stringify(r.O)===JSON.stringify(['「我陪妳坐一下。」','「妳準備得很夠了。」','「我陪妳走到捷運站。」']), JSON.stringify([r.L,r.O]));
    { H.G.zone='library_hall'; SISG.tick(GM); H.G.zone='campus'; const again=SISG.tick(GM);
      check('14-2. 記 SIS_PREEXAM_NIGHT；信任 +3、自在 +2（照舊）；只演一次', H.G.flags.SIS_PREEXAM_NIGHT===true&&r.r1.trust-r.r0.trust===3&&r.r1.comf-r.r0.comf===2&&!again, JSON.stringify([r.r0,r.r1])); }
    const a=await lowPlay(d26,21,{},0), b=await lowPlay(d27,20.1,{},1);
    check('14-2. 選項 a、b 照舊；1/26、1/27 也會', a.b&&b.b&&a.L.slice(-3).join('/')==='好。不用講話。/（你們坐到圖書館熄燈。）/好了，我回去了。明天還是八點到。'&&b.L.slice(-2).join('/')==='大家都這樣說。……可是謝謝。/好了，我回去了。明天還是八點到。', JSON.stringify([a.L.slice(-3),b.L.slice(-2)]));
    const w={d24:(await lowPlay(d24,20.5)).b, d23:(await lowPlay(d23,20.5)).b, d28:(await lowPlay(d28,20.5)).b, early:(await lowPlay(d25,19.9)).b, noStudy:(await lowPlay(d25,20.5,{SIS_STUDY:false})).b};
    check('14-2. 只在 1/24～1/27、20:00 以後、一起念過書（SIS_STUDY）：1/24 會；1/23、1/28、19:54、沒一起念過書都不演', w.d24&&!w.d23&&!w.d28&&!w.early&&!w.noStudy, JSON.stringify(w));
    { freshD(d27,23.5,'library_hall',{SIS_W1:true,SIS_STUDY:true}); FRI5(); SISG.tick(GM); H.G.hour=24.3; H.G.zone='campus'; H.said=[]; H.picks=[0]; const x=SISG.tick(GM); if(x) await SISG._p;
      check('14-2. 1/27 晚上待到過了午夜才離開（同一晚）：照樣演', x===true&&has('學弟。你怎麼在這裡。')); }
    { freshD(d26,20.2,'library',{SIS_W1:true,SIS_STUDY:true}); FRI5(); H.said=[]; H.picks=[0]; STORY.onStudy(GM,1); H.G.zone='dorm'; const x=SISG.tick(GM); if(x) await SISG._p;
      check('14-2. 在總圖 3F 閱覽區讀書、讀完 20:12 用手機「地點」回宿舍（也是離開總圖）：演', x===true&&has('學弟。你怎麼在這裡。')); }
  });
  await sec('14-3',async()=>{
    freshD(d26,17,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI5(); OLD_MSG(); OUT.plan(H.G,{id:'sisg_low_night',ev:'ev_sis_low_night',day:d26,h:20,late:0.75,place:'總圖',title:'總圖門口的台階',travel:'走過去約 10 分鐘',travelH:1/6,alarm:true,back:'離開總圖。'});
    span(Tm(d26,17.9),Tm(d26,18.1)); setT(d26,19.7); const q=OUT.get(H.G,'sisg_low_night'); H.said=[]; H.opts=[]; H.picks=[2]; if(q) await OUT.go(GM,q);
    check('14-3. 舊存檔：已經收到 1/26 那則私訊、排好 20:00 的＝照舊演一次（舊的開頭「學弟。你來了。」、舊的選項 c「要不要吃點熱的？」）', !!q&&q.state==='done'&&has('（她坐在台階上，計畫本攤在膝蓋上，一頁一頁往回翻。）')&&has('學弟。你來了。')&&!has('學弟。你怎麼在這裡。')&&!has('（總圖門口的台階。兩個人剛收好東西先走了，走在後面的男生回頭看了一下。）')&&JSON.stringify(H.opts[0])===JSON.stringify(['「我陪妳坐一下。」','「妳準備得很夠了。」','「要不要吃點熱的？」'])&&has('現在？……好。熱的。')&&H.G.flags.SIS_PREEXAM_NIGHT===true, JSON.stringify(txts()));
    freshD(d27,20.5,'library_hall',{SIS_W1:true,SIS_STUDY:true}); FRI5(); OLD_MSG(); PHONE.tick(H.G); SISG.tick(GM); H.G.zone='campus'; const x=SISG.tick(GM); if(x) await SISG._p;
    check('14-3. 舊存檔收到 1/26 私訊、那晚沒去的：之後晚上路過總圖不再補演（照舊）', !x&&!H.G.events.done.ev_sis_low_night);
  });
  await sec('14-4',async()=>{
    freshD(d2,17,'dorm',{SIS_W1:true,SIS_STUDY:true}); FRI5(); span(Tm(d2,17.4),Tm(d2,17.6)); const m=her();
    check('14-4. 2/2 17:30「考完了」：沒有那一晚（SIS_PREEXAM_NIGHT）、一起念過書（SIS_STUDY）也收到', m.length===2&&m[0].text==='考完了'&&m[1].text==='我想吃一碗很燙的東西，然後睡十二個小時', JSON.stringify(m.map(x=>x.text)));
    freshD(d3,20,'dorm',{SIS_STUDY:true}); FRI5(); span(Tm(d3,20.9),Tm(d3,21.1)); const m3=(H.G.msgs||[]).filter(x=>x.tag==='sisg_planner_ask');
    check('14-4. 2/3 21:00 買計畫本的邀約：只有 SIS_STUDY 也收到', m3.length===2&&m3[0].text==='我想去買一本新的計畫本'&&m3[1].text==='你要一起來嗎？不來也沒關係', JSON.stringify(m3.map(x=>x.text)));
    freshD(d2,17,'dorm',{SIS_W1:true}); FRI5(); span(Tm(d2,17.4),Tm(d3,21.2),0.1);
    check('14-4. 沒一起念過書、也沒有那一晚：2/2、2/3 都沒有她的私訊（照舊）', !her().length, JSON.stringify(her().map(x=>x.text)));
    freshD(d21,10,'dorm',{SIS_STUDY:true}); FRI5(); const st=SISG.stops(H.G,Tm(d21,10))||[]; freshD(d3,19,'dorm',{SIS_STUDY:true}); const w2=STORY.lawWakeAt(H.G);
    check('14-4. 只有 SIS_STUDY：快轉停 2/2 17:30、2/3 21:00；2/3 宿舍睡著 21:00 會醒來', st.includes(Tm(d2,17.5))&&st.includes(Tm(d3,21))&&w2===21, JSON.stringify(st)+' wake='+w2);
  });
  await sec('14-5',async()=>{
    const P=ev('ev_sis_new_planner'); const play=async k=>{ freshD(d4,14,'gongguan',{SIS_STUDY:true}); FRI5(); const r0=Object.assign({},SOCIAL.rel(SID)); H.said=[]; H.opts=[]; H.picks=[k]; await EVENTS.run(P); return {L:txts(),O:H.opts[0],r0,r1:Object.assign({},SOCIAL.rel(SID))}; };
    const a=await play(0), b=await play(1), c=await play(2); const head=['這本。週末那一欄是空白的，沒有格子。','我想要一本可以留白的。','（結帳以後，她站在店門口，翻開第一頁寫了一行，寫完拿給你看。）','（第一頁只有一行：「二月四日　買計畫本。」）'];
    check('14-5. 計畫本第一頁她自己寫：前兩句照舊 → 兩行新旁白 → 三個反應（不再「她把筆遞給你」「第一頁寫什麼？」）', JSON.stringify(a.L.slice(0,4))===JSON.stringify(head)&&JSON.stringify(a.O)===JSON.stringify(['「第一件就做完了。」','「後面都空著？」','「下一行寫『睡午覺』。」'])&&!a.L.includes('第一頁寫什麼？')&&!a.L.includes('（結帳以後，她把筆遞給你。）'), JSON.stringify([a.L,a.O]));
    check('14-5. 「第一件就做完了。」→（她笑出來。）「對。第一件做完了。」；「後面都空著？」→「嗯。慢慢寫。」；「下一行寫『睡午覺』。」→「……好。這個我真的需要。」', JSON.stringify(a.L.slice(4))===JSON.stringify(['（她笑出來。）','對。第一件做完了。'])&&JSON.stringify(b.L.slice(4))===JSON.stringify(['嗯。慢慢寫。'])&&JSON.stringify(c.L.slice(4))===JSON.stringify(['……好。這個我真的需要。']), JSON.stringify([a.L.slice(4),b.L.slice(4),c.L.slice(4)]));
    check('14-5. 數值、旗標照舊：SIS_NEW_PLANNER；信任 +3、自在 +3、戀愛 +2', H.G.flags.SIS_NEW_PLANNER===true&&c.r1.trust-c.r0.trust===3&&c.r1.comf-c.r0.comf===3&&(c.r1.rom||0)-(c.r0.rom||0)===2, JSON.stringify([c.r0,c.r1]));
  });

  /* ===================== 第 3 組（15）她的專業核心不是跟祐廷學的（第②級）===================== */
  await sec('15',async()=>{
    { freshK('2029-07-01',20,'cafe',{}); SOCIAL.remember('classmate_peishan','MIRROR_PEISHAN',''); const L=PG.epiLine(H.G,'classmate_peishan');
      check('15-1. 沛珊尾聲（有 MIRROR_PEISHAN）：「我跟學生講重考的事，講的是我自己那一年。……你那時候也說過你重考過。」', JSON.stringify(L)===JSON.stringify([['classmate_peishan','我跟學生講重考的事，講的是我自己那一年。……你那時候也說過你重考過。']]), JSON.stringify(L));
      check('15-1. 「你教我的那句，我現在教給我的學生」不在 postgrad_lines.js', !fs.readFileSync(path.join(H.ROOT,'src/data/postgrad_lines.js'),'utf8').includes('你教我的那句')); }
    { const q=(fl,mem)=>{ freshK('2028-06-08',20,'dorm',Object.assign({ZQ_DAD_HEARD:true,ATTENDED_SHOW:true},fl||{}),fl&&fl.EXCHANGE_ROUTE); for(const t of mem) SOCIAL.remember('heroine_04',t,''); return R2Y3B.q15Ready(H.G); };
      const r={noTold:q({},['CLAPPED','PLAYTESTED']),told:q({},['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE']),noClap:q({},['PLAYTESTED','TOLD_HER_CHANGE']),noDad:q({ZQ_DAD_HEARD:false},['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE']),noShow:q({ATTENDED_SHOW:false},['CLAPPED','PLAYTESTED']),jp:q({EXCHANGE_ROUTE:'JP'},['CLAPPED','PLAYTESTED','TOLD_HER_CHANGE'])};
      check('15-2. 子晴 Q15 前置：TOLD_HER_CHANGE 不是必要（沒有也走專屬版）；CLAPPED、ZQ_DAD_HEARD、ATTENDED_SHOW、不是日本路線照舊', r.noTold&&r.told&&!r.noClap&&!r.noDad&&!r.noShow&&!r.jp, JSON.stringify(r)); }
    { const Z7=ev('ev_zhiruo_applied'), d=DK('2026-12-10'); freshD(d+1,15,'cafe',{Z4_PICK:'family'}); SOCIAL.remember('heroine_02','FIRST_MET',''); SOCIAL.rel('heroine_02').fam=25; H.G.events.done.ev_zhiruo_secret=1; SOCIAL.remember('heroine_02','SHARED_SECRET','');
      H.said=[]; H.opts=[]; H.picks=[2]; await EVENTS.run(Z7); const L=txts(), i=L.indexOf('你那時候說家裡比較重要。'), mem=SOCIAL.memories('heroine_02').filter(m=>m.tag==='IMPORTANT_CONVERSATION').map(m=>m.note);
      check('15-3. 芷若 Z7 家裡那版（BB_167 E1）：「你那時候說家裡比較重要。」「我後來算了一下。她十點打來，英國那邊是下午兩、三點。」「我那個時間沒課。……接得到。」→「今天的咖啡我請。」', i>=0&&JSON.stringify(L.slice(i))===JSON.stringify(['你那時候說家裡比較重要。','我後來算了一下。她十點打來，英國那邊是下午兩、三點。','我那個時間沒課。……接得到。','今天的咖啡我請。'])&&!!H.opts[0]&&H.opts[0][2]==='「妳那時候說的家裡……」', JSON.stringify(L));
      check('15-3. 記憶的備註：「她交了交換申請：她算過時差，媽媽十點打來接得到」', mem.includes('她交了交換申請：她算過時差，媽媽十點打來接得到')&&!mem.some(n=>/家也跟著我去/.test(n)), JSON.stringify(mem)); }
  });

  /* ===================== 第 4 組（16）子晴 Q4 比賽那天 ===================== */
  await sec('16',async()=>{
    const wk=(w,wd)=>STORY.termDay('Y1S2',w,wd), Q4=ev('ev_ziqing_contest_day'), LINE='上禮拜六那個比賽，我沒去。……我在公館喝咖啡。';
    { const at=w=>{ freshD(wk(w,6),15.5,'gongguan',{}); SOCIAL.meet('heroine_04','campus'); SOCIAL.remember('heroine_04','ARGUED_ABOUT_CAREER','x'); return EVENTS.check(Q4); };
      const r={w8:at(8),w9:at(9)};
      check('16-1. 子晴 Q4 只有第 8 週的週六；第 9 週「我上週六也坐在這裡」那一版拿掉', r.w8&&!r.w9&&JSON.stringify(Q4.weeks)==='[8]'&&!/我上週六也坐在這裡/.test(JSON.stringify(Q4.dialogue)), JSON.stringify(r)); }
    STORY._bindGM(GM);
    const talk=async(w,wd,mems)=>{ freshD(wk(w,wd),12.2,'gongguan',{}); SOCIAL.meet('heroine_04','campus'); SOCIAL.rel('heroine_04').fam=25; for(const t of mems) SOCIAL.remember('heroine_04',t,'x');
      const n={obj:{position:{x:1,y:0,z:0},rotation:{y:0}},lv:0,charId:'heroine_04',pose:'idle'}; GM.npc.heroine_04=n; H.said=[]; H.opts=[]; H.picks=['就這樣','就這樣','就這樣']; await STORY.talkCharacter('heroine_04',n); return txts(); };
    const a=await talk(9,1,['ARGUED_ABOUT_CAREER']); const flag=H.G.flags.CONTEST_HEARD; H.said=[]; H.picks=['就這樣','就這樣','就這樣']; await STORY.talkCharacter('heroine_04',GM.npc.heroine_04); const a2=txts();
    check('16-2. 錯過比賽（問過比賽、沒有 CONTEST_DAY）：第 9 週第一次和她說話，開頭多一句「上禮拜六那個比賽，我沒去。……我在公館喝咖啡。」、記 CONTEST_HEARD；第二次不再說', a[0]===LINE&&!!flag&&!a2.includes(LINE), JSON.stringify([a.slice(0,2),a2.slice(0,2),flag]));
    const r={w11:(await talk(11,3,['ARGUED_ABOUT_CAREER']))[0]===LINE, w12:(await talk(12,1,['ARGUED_ABOUT_CAREER'])).includes(LINE), w8:(await talk(8,3,['ARGUED_ABOUT_CAREER'])).includes(LINE), went:(await talk(9,1,['ARGUED_ABOUT_CAREER','CONTEST_DAY'])).includes(LINE), noAsk:(await talk(9,1,[])).includes(LINE)};
    check('16-2. 第 11 週也會；第 12 週、第 8 週（比賽還沒到）、去過比賽那天（CONTEST_DAY）、沒問過比賽都沒有', r.w11&&!r.w12&&!r.w8&&!r.went&&!r.noAsk, JSON.stringify(r));
  });

  /* ===================== 第 5 組（17、18）殘句 ===================== */
  await sec('17',async()=>{
    const src=fs.readFileSync(path.join(H.ROOT,'src/data/confess_lines.js'),'utf8');
    check('17／18. confess_lines.js 沛珊那一段的註解不再寫「改用已定案的特別場面」（使用者 10-17：重考期間她直接消失，BB_194 §19；BB_119 1b 作廢）', !src.includes('改用已定案的特別場面')&&src.includes('BB_194'));
  });
  H.done();
})().catch(e=>{ console.error(e); process.exit(1); });
