// AA312 剩下的：學期末的飯（termend3d.js、termend_lines.js）＋邀約（invites3d.js、invites.js）＋多線交往的 L2 婉拒＋以安主動約——不需要瀏覽器。
//   1 NOPE 照學期換（AA_260 (b-1) 第 5、6、11 項，AA_262 (b) 第 4 條）：芷若、子晴大三下、子晴大四上；其他人、其他學期照原本的字串
//   2 朋友邀約的婉拒照學期換（AA_260 (b-1) 第 14 項）：學姊大三下「好。我出發前再找你。」
//   3 玩家接了別人以後的自動婉拒照 S.heart 的 over（學姊大三下「好。那出發前再約。」）
//   4 美國路線大四上（AA_262 (b) 第 8 條）：12/23 回國，邀約從 12/24 起（S.backDay，AA_378 #12 已經做了；這裡驗證）
//   5 學姊（AA_259 (b) 第 3 點）：大三起的 walk.library、rule library 改 resched 17:00；溫州街照 AA_415（BB_172 S18 被取代）
//   6 沛珊消失期（AA_255 (b-1) 第 20 條）：沒有回覆、沒有她的句子（大二下那一段不會播，留給 AA_415 的產生器核對）
//   7 多線交往 L2 婉拒（AA_227 6-6／AA_423 4-1）：子晴、芷若一起分手以後，校園邀約不說理由、兩句輪流
//   8 以安主動約（AA_227 3-1，台詞照 AA_425 第 0 節）：週二 21:00、這週四讀書會散了以後去阿鳳；一學期一次。讀書會散了以後約她吃飯的回覆（AA_434 第 3 節）
// 修改前（開發分支 dd96391c2）：1～3、5～8 FAIL。用法：node tests/aa312_rest_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
const RD=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const D=k=>STORY.dayOfKey(k), keyOf=d=>CALENDAR.dateOf(d).key;
const LX=()=>TERMEND_LINES;
const phoneRun=(d0,d1,hs)=>{ for(let d=d0;d<=d1;d++) for(const h of hs){ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; TERMEND.phone(GM); PHONE.tick(H.G); } };
const plan=(term,P)=>{ const w=TERMEND.windowOf(term); H.G.termend=H.G.termend||{think:{}}; H.G.termend[term]={plan:Object.assign({back:w.from,heart:[],friend:[],fallback:null,gf:[],nope:{},kx:false},P)}; return w; };

(async()=>{
await sec(1,()=>{
  const t=(k,id,term)=>TERMEND.nopeText(LX(),k,id,term);
  check('1. 芷若 knows：大三下「期末我排了很多班。……出國以前再說。」、其他學期照舊「期末我排了很多班。開學見。」',t('knows','heroine_02','Y3S2')==='期末我排了很多班。……出國以前再說。'&&t('knows','heroine_02','Y2S1')==='期末我排了很多班。開學見。');
  check('1. 芷若 low：大三下「最近不太想出門。……出國以前再約。」、其他學期照舊',t('low','heroine_02','Y3S2')==='最近不太想出門。……出國以前再約。'&&t('low','heroine_02','Y1S2')==='最近不太想出門。……開學見。');
  check('1. 子晴 knows：大三下「畢業了 我先回家住一陣子」、大四上「這陣子工作室在趕 下次」、其他學期「考完了 我回家了」',t('knows','heroine_04','Y3S2')==='畢業了 我先回家住一陣子'&&t('knows','heroine_04','Y4S1')==='這陣子工作室在趕 下次'&&t('knows','heroine_04','Y2S2')==='考完了 我回家了');
  check('1. 字串的那幾句不變（以安 knows、子晴 low、partner）',t('knows','heroine_01','Y3S2')==='考完了。這次我不約你了。……你知道為什麼。'&&t('low','heroine_04','Y3S2')==='我最近不太想說話 下次'&&t('partner','heroine_02','Y3S2')==='期末我有約了。……下次來店裡，我請你一杯。');
  H.fresh('2028-06-01',9,'campus'); const w=plan('Y3S2',{nope:{heroine_02:'knows',heroine_04:'knows'}}); phoneRun(w.to,w.to,[20.2]);
  check('1. 時段最後一天 20:00 手機：芷若、子晴照大三下的句子',H.msgs('p:heroine_02').includes('期末我排了很多班。……出國以前再說。')&&H.msgs('p:heroine_04').includes('畢業了 我先回家住一陣子'),J([H.msgs('p:heroine_02'),H.msgs('p:heroine_04')])); });

await sec(2,()=>{
  const f=LX().FRIEND.heroine_05;
  check('2. 學姊朋友邀約的婉拒：大三下「好。我出發前再找你。」、其他學期「好。開學見。」',TERMEND.friendNo(f,'Y3S2')==='好。我出發前再找你。'&&TERMEND.friendNo(f,'Y2S2')==='好。開學見。'&&TERMEND.friendNo(LX().FRIEND.npc_fangyt,'Y2S2')==='好。山上收不到訊號，下山再找你。'&&TERMEND.friendNo(LX().FRIEND.npc_fangyt,'Y2S1')==='好。開學見。');
  H.fresh('2028-06-01',9,'campus'); SOCIAL.remember('heroine_05','FIRST_MET',''); const w=plan('Y3S2',{friend:['heroine_05']}); phoneRun(w.from,w.from,[20.6]);
  const m=(H.G.msgs||[]).find(x=>x.th==='p:heroine_05'&&x.ask), no=m&&m.ask.opts[1];
  check('2. 大三下學姊約期末飯，回「那天有約了。」她說「好。我出發前再找你。」',!!no&&J(no.say.map(s=>s.text))===J(['好。我出發前再找你。']),J(m&&m.ask)); });

await sec(3,()=>{
  H.fresh('2028-06-01',9,'campus'); SOCIAL.remember('heroine_05','FIRST_MET',''); SOCIAL.remember('zhe','FIRST_MET','');
  const w=plan('Y3S2',{heart:['heroine_05'],friend:['zhe']}); phoneRun(w.from,w.from,[20.7]);
  TERMEND.playerPicked(H.G,{who:'zhe',te:{term:'Y3S2',kind:'friend'}}); PHONE.tick(H.G);
  const sis=H.msgs('p:heroine_05');
  check('3. 玩家約了阿哲以後，學姊（心意的邀約）自動回的婉拒照大三下 over「好。那出發前再約。」',sis.includes('好。那出發前再約。')&&!sis.includes('好。那開學法圖見。'),J(sis));
  H.fresh('2027-12-28',9,'campus'); SOCIAL.remember('heroine_05','FIRST_MET',''); SOCIAL.remember('zhe','FIRST_MET','');
  const w1=plan('Y3S1',{heart:['heroine_05'],friend:['zhe']}); phoneRun(w1.from,w1.from,[20.7]); TERMEND.playerPicked(H.G,{who:'zhe',te:{term:'Y3S1',kind:'friend'}}); PHONE.tick(H.G);
  check('3. 其他學期照舊「好。那開學法圖見。」',H.msgs('p:heroine_05').includes('好。那開學法圖見。'),J(H.msgs('p:heroine_05'))); });

await sec(4,()=>{
  H.fresh('2028-12-18',9,'campus',{EXCHANGE_ROUTE:'US'}); const w=TERMEND.windowOf('Y4S1');
  check('4. 美國路線大四上：12/21～12/23 在國外，回來的隔天 12/24 起才發（S.backDay；S.FROM 只擋學姊的部分已經包在裡面）',STORY.abroad(Object.assign({},H.G,{day:D('2028-12-22')}))&&TERMEND.backDay(H.G,w)===D('2028-12-24'),J([w.from,TERMEND.backDay(H.G,w),D('2028-12-24')]));
  SOCIAL.remember('zhe','FIRST_MET',''); const w2=plan('Y4S1',{back:TERMEND.backDay(H.G,w),friend:['zhe']}); phoneRun(w2.from,D('2028-12-24'),[20.6,21]);
  const z=(H.G.msgs||[]).filter(x=>x.th==='p:zhe');
  check('4. 朋友的邀約在 12/24 才傳',z.length>0&&z.every(x=>x.day>=D('2028-12-24')),J(z.map(x=>[x.day,x.text]))); });

await sec(5,()=>{
  const ask=(key,h,pid,wk)=>{ H.fresh(key,h,'campus'); H.FRIEND('heroine_05'); const G=H.G; const P=INV.place(pid); return INV.personal(G,'heroine_05',P,G.day,h,{res:'accept'}); };
  const wp=key=>{ H.fresh(key,10,'campus'); H.G.flags.walkChatN={}; const e=INV.walkPick(H.G,'heroine_05','library'); return e&&e.lines; };
  check('5. 學姊一起走去總圖：大三起「萬才館的電梯還是很慢。」「我現在比較常去法圖。總圖的位子，給你們搶。」',J(wp('2027-10-13'))===J(['「B館的電梯還是很慢。」','「我現在比較常去法圖。總圖的位子，給你們搶。」']),J(wp('2027-10-13')));
  check('5. 大二以前照原本三句',J(wp('2026-10-14'))===J(['「B館的電梯很慢，走樓梯比較快。」','「總圖三樓靠窗的位子，九點以前就要去搶。」','「……我大一的時候，這些都沒人告訴我。」']),J(wp('2026-10-14')));
  const r3=ask('2027-10-13',10,'library'), r1=ask('2026-10-14',10,'library');
  check('5. 大三起平日約總圖：resched「我在法圖。五點以後過去找你。」，改到 17:00 以後；大二以前照舊「我就在總圖。三樓。」（here）',r3.res==='resched'&&J(r3.lines)===J(['「我在法圖。五點以後過去找你。」'])&&!!r3.alt&&r3.alt.h>=17&&r1.res==='here'&&J(r1.lines)===J(['「我就在總圖。三樓。不要講話，傳訊息。」']),J([r3,r1]));
  const s=ask('2026-10-14',10,'wenzhou');
  check('5. 筆試以後平日白天約溫州街散步：照 AA_415 sis29（現有 rule）「五點以後。……散步，我試試看。」——BB_172 S18「五點以後可以嗎？」被較新的 AA_415 取代，不換',s.res==='resched'&&J(s.lines)===J(['「五點以後。……散步，我試試看。」']),J(s)); });

await sec(6,()=>{
  for(const [k,pid] of [['2027-03-13','brunch'],['2027-03-10','teahouse'],['2027-05-15','library']]){ H.fresh(k,9,'campus'); H.FRIEND('classmate_peishan'); const G=H.G, P=INV.place(pid), r=INV.personal(G,'classmate_peishan',P,G.day+1,14,INV.decide(G,'classmate_peishan',pid,G.day+1,14));
    check('6. 沛珊消失期（'+k+' '+pid+'）：沒有回覆，沒有她的句子',r.res==='decline'&&r.why==='away'&&!r.lines&&/^郭沛珊沒有回覆。$|沒有回覆。$/.test(INV.reply(G,'classmate_peishan',pid,r)),J(r)); }
  const S=RD('src/data/invites.js');
  check('6. 「我在念書。……考完再去。」那一句刪了；大二下那一段（AA_415 ps30 還指著，build_replies.py 核對）留著，消失期不會播',!S.includes('我在念書。……考完再去')&&S.includes('平日我在家念')); });

await sec(7,()=>{
  const load=f=>{ let src=RD(f); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MREL|MULTIREL_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
  if(typeof MREL==='undefined'){ load('src/data/multirel_lines.js'); load('src/multirel3d.js'); }
  H.fresh('2027-11-10',9,'campus',{ZQ_ZR_ENDED_DAY:STORY.dayOfKey('2027-11-08')}); H.FRIEND('heroine_04'); H.FRIEND('heroine_02'); const G=H.G;
  const go=(id,pid)=>{ const P=INV.place(pid); return INV.personal(G,id,P,G.day+1,15.5,INV.decide(G,id,pid,G.day+1,15.5)); };
  const a=go('heroine_04','cafe'), b=go('heroine_04','noodle'), c=go('heroine_04','cafe');
  H.fresh('2028-03-15',9,'campus',{ZQ_ZR_ENDED_DAY:STORY.dayOfKey('2028-03-10')}); H.FRIEND('heroine_02'); const G2=H.G;   /* 芷若在臺北的學期（大三上她在英國） */
  const go2=(id,pid)=>{ const P=INV.place(pid); return INV.personal(G2,id,P,G2.day+1,15.5,INV.decide(G2,id,pid,G2.day+1,15.5)); };
  const z=go2('heroine_02','library'), z2=go2('heroine_02','cafe');
  check('7. 子晴、芷若一起分手以後（還不能重新開始）：子晴 L2 婉拒「這禮拜不行。」「……下次吧。」輪流、不說理由',MREL.zzRefusing(G,'heroine_04')&&a.res==='decline'&&a.why==='mrel'&&J(a.lines)===J(['「這禮拜不行。」'])&&J(b.lines)===J(['「……下次吧。」'])&&J(c.lines)===J(['「這禮拜不行。」']),J([a,b,c]));
  check('7. 芷若 L2 婉拒「我這週班排滿了。」「……不了，謝謝。」輪流',z.why==='mrel'&&J(z.lines)===J(['「我這週班排滿了。」'])&&J(z2.lines)===J(['「……不了，謝謝。」']),J([z,z2]));
  const y=go2('heroine_01','cafe'); check('7. 別人不受影響',y.why!=='mrel',J(y));
  H.fresh('2027-11-10',9,'campus'); H.FRIEND('heroine_04'); const n=INV.decide(H.G,'heroine_04','cafe',H.G.day+1,15.5); check('7. 沒有一起分手＝照一般',n.why!=='mrel',J(n)); });

await sec(8,()=>{
  const tue=STORY.termDay('Y1S2',3,2); H.fresh(keyOf(tue),20.5,'dorm'); H.FRIEND('heroine_01'); const G=H.G; G.acts={att:{['public_law_group@'+(tue-5)]:{end:'full'}}};
  const before=INV.anAsk(G); G.hour=21.1; const ok=INV.anAsk(G); const iv=(G.invites||[]).find(x=>x.by==='npc'&&x.who==='heroine_01'), m=(G.msgs||[]).find(x=>x.iv===(iv&&iv.id));
  check('8. 以安：週二 21:00 以前不約；21:00 以後約這週四 21:30 阿鳳，訊息「禮拜四讀書會完要不要去吃飯？我想吃巷子那家。」（AA_425 第 0 節）',!before&&ok&&!!iv&&iv.day===tue+2&&Math.abs(iv.h-21.5)<1e-6&&iv.place==='noodle'&&!!m&&m.text==='禮拜四讀書會完要不要去吃飯？我想吃巷子那家。',J([before,ok,iv,m]));
  G.day=tue+7; G.weekday=2; G.hour=21.1; check('8. 一學期一次',!INV.anAsk(G));
  H.fresh(keyOf(tue),21.1,'dorm'); H.FRIEND('heroine_01'); check('8. 沒去過讀書會＝不約',!INV.anAsk(H.G));
  H.fresh(keyOf(tue),21.1,'dorm'); H.FAMILIAR('heroine_01'); H.G.acts={att:{['public_law_group@'+(tue-5)]:{end:'full'}}}; check('8. 第 3 階以前不約',!INV.anAsk(H.G));
  /* AA_227 3-1 讀書會後吃飯的回覆（AA_434 第 3 節：讀書會 21:30 才結束，不寫鐘點）*/
  const thu=tue+2, W='「好。可是吃完我就回去。報告還沒寫完。」', rep=(d,h,pid)=>{ H.fresh(keyOf(d),h,'campus'); H.FRIEND('heroine_01'); return INV.personal(H.G,'heroine_01',INV.place(pid||'noodle'),d,h,{res:'accept'}); };
  const r1=rep(thu,21.6), r2=rep(thu,19), r3=rep(STORY.termDay('Y1S2',8,4),21.6), r4=rep(thu,21.6,'cafe');
  check('8. 週四讀書會散了（21:36）約以安去阿鳳：「好。可是吃完我就回去。報告還沒寫完。」（AA_434 第 3 節，沒有「九點」）',r1.res==='accept'&&JSON.stringify(r1.lines)===JSON.stringify([W]),JSON.stringify(r1));
  check('8. 讀書會以前（19:00）、沒有讀書會的週四（大一下第 8 週）、約 Café（不是吃飯）都不是這一句',![r2,r3,r4].some(r=>JSON.stringify(r.lines||[])===JSON.stringify([W]))&&!RD('src/data/invites.js').includes('我九點要回去寫報告'),JSON.stringify([r2.lines,r3.lines,r4.lines])); });

H.done();
})();
