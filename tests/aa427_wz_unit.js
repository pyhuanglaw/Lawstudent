// 溫州街補字（AA_427，企劃線 4d66231ab）——不需要瀏覽器。src/wzlines3d.js、src/data/wz_events.js、src/wzpark3d.js（象棋）、src/game3d.js（群組的「約」按鈕讀 PHONE.GROUP_ACTS）
//   1  茶席：學姊（有／沒有 SIS_TEAHOUSE 兩句）、芷若、子晴、沛珊、可昕各一句；學姊在美國、芷若在英國、沛珊 2026-12-16 以後選項不出現
//   2  WZ-P3 颱風後的早上：颱風假隔天 08:00～11:00 進公園；三個選項（幫忙＝1 小時、WZ_P3_HELPED、貓那一句）；下雨延到第一個沒下雨的早上（三天內）；茶屋打工＝不演、同一個颱風只演一個；一學年一次；幫過就不再演
//   3  讓你一隻馬：WZ_P3_HELPED 以後開局四種輪流；讓馬那一盤贏的機率 +20%（最多 70%）、結果句換一組（大四起「律師」）；前四盤的順序不變
//   4  大家的早午餐：週四、週五 19:00～23:00 群組裡的「約」；四個人照順序回（能來／不能來）；成立＝排出門提醒到半熟、10:00 那一場（開場兩句、結尾一句、熟悉 +1）；
//      四個都不能＝最後一個人「那下週」；祐廷在早午餐店打工（多一則／那天有班＝阿哲兩則＋上班時一句旁白）；「哥」看 ZHE_CALLS_GE；阿哲第 6 週週四 21:00 揪（+1／這週不行）
// 修改前（開發分支 HEAD）：沒有這些——FAIL。用法：node tests/aa427_wz_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.SISY23={preTalk:async()=>false};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(WZS|EAT|EAT_LINES|JOBS|WZ_JOBS_DATA|WZ_SHOPS_LAYOUT|WZ_PARK_LAYOUT|PARK|WZ_EVENTS|WZL|Y2B_EVENTS)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ for(const f of ['src/data/wz_park_layout.js','src/wzpark3d.js','src/data/wz_shops_layout.js','src/data/eat_lines.js','src/eat3d.js','src/wzshops3d.js','src/data/y2b_events.js','src/data/wz_jobs.js','src/jobs3d.js','src/data/wz_events.js','src/wzlines3d.js']) load(f); }catch(e){ ok=false; err=String(e&&e.stack||e).split('\n').slice(0,3).join(' / '); }
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
const toasts=[]; GM.toast=t=>{ toasts.push(t); };
GM.money=d=>{ H.G.money=(H.G.money|0)+d; };
const fresh=(k,h,zone,flags)=>{ const G=H.fresh(k,h,zone||'wenzhou',flags); toasts.length=0; return G; };
const DK=k=>STORY.dayOfKey(k), key=d=>CALENDAR.dateOf(d).key, TD=(t,w,wd)=>STORY.termDayIn(t,w,wd);
const at=(d,h,zone)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; if(zone) H.G.zone=zone; };
const said=t=>H.said.some(s=>s.t===t);
const saidBy=(w,t)=>H.said.some(s=>s.t===t&&s.who===w);
const L=()=>H.lines();
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const inPark=()=>{ const n=WZ_PARK_LAYOUT.interact.find(q=>q.kind==='notice'); H.E.player.obj.position.x=n.x; H.E.player.obj.position.z=n.z; H.G.zone='wenzhou'; };
const tickUntil=async()=>{ const r=WZL.tick(GM); for(let i=0;i<20&&WZL.playing;i++) await new Promise(r=>setTimeout(r,0)); return r; };
const hire=(k,days)=>{ const J0=JOBS.rec(H.G); J0[k]={since:H.G.day-30,from:(H.G.day-30)*24,day:days,shifts:5,skill:3,missedRun:0,quit:null,gone:null,missPend:false,missN:0,worked:[],chk:H.G.day-1,wk:{},brk:{},ot:{}}; return J0[k]; };
const msgs=th=>{ PHONE.tick(H.G); return (H.G.msgs||[]).filter(m=>!th||m.th===th).map(m=>(m.from&&m.from!=='player'?m.from+'：':(m.from==='player'?'我：':''))+m.text); };
const TH='g:noodle_team';

(async()=>{
check('0. 載得到',ok&&typeof WZL!=='undefined'&&!!ev('ev_wz_p3')&&typeof WZL.grpbAsk==='function'&&!!PARK.KNIGHT,err);

await sec(1,async()=>{ const P=INVITE_DATA.places.find(p=>p.id==='teahouse_ceremony'), Tsun=STORY.dayOfKey('2026-11-15');   /* 2026-11-15＝第三個週日 */
  const meet=async(id,day,flags)=>{ fresh(key(day-1),15,'dorm',Object.assign({WZ_TEA_SEAT:true},flags||{})); H.FRIEND(id); at(day,14,'wz_teahouse'); const iv=INV.accept(H.G,id,'teahouse_ceremony',day,14,{by:'player'}); iv.state='going'; H.said=[]; await INV.meet(GM,iv,null); return H.said; };
  const S5=await meet('heroine_05',Tsun); check('1. 學姊（沒有 SIS_TEAHOUSE）：（她喝了一口，停了一下。）「……好喝。我以為會苦。」',said('（她喝了一口，停了一下。）')&&said('……好喝。我以為會苦。')&&!said('水沒有滾。……我看得出來了。'),J(L()));
  await meet('heroine_05',Tsun,{SIS_TEAHOUSE:true}); check('1. 學姊（有 SIS_TEAHOUSE）：（她看著蘇姨倒水，喝了一口。）「水沒有滾。……我看得出來了。」',said('（她看著蘇姨倒水，喝了一口。）')&&said('水沒有滾。……我看得出來了。')&&!said('……好喝。我以為會苦。'),J(L()));
  await meet('heroine_02',Tsun); const i=H.said.findIndex(s=>s.t==='杯子好小喔。……蘇姨，可以再一杯嗎？'); check('1. 芷若：先說「杯子好小喔……」、再旁白（雙手接過去）',i>=0&&H.said[i].who!=null&&H.said[i+1]&&H.said[i+1].t==='（蘇姨倒第二杯的時候，她雙手接過去。）'&&H.said[i+1].who==null,J(L()));
  await meet('heroine_04',Tsun); check('1. 子晴：「我先說，我坐不住。」（二十分鐘過去……）',said('我先說，我坐不住。')&&said('（二十分鐘過去，她一次都沒有拿出手機。）'));
  await meet('classmate_peishan',Tsun); check('1. 沛珊：「蘇姨，這枝花是院子裡剪的嗎？」（……在找是哪一棵。）',said('蘇姨，這枝花是院子裡剪的嗎？')&&said('（蘇姨點頭。沛珊轉頭看了院子很久，在找是哪一棵。）'));
  await meet('kexin',Tsun); check('1. 可昕（備用）：（她坐下來……）「……好。我不動了。」',said('（她坐下來，又站起來，把裙子拉好再坐。）')&&said('……好。我不動了。'));
  check('1. 每個人只有那一句（蘇姨那一句之後）',(()=>{ const k=H.said.findIndex(s=>s.t==='茶席不說話也可以。說話也可以。'); return k>=0&&H.said.slice(k+1).filter(s=>!/^「/.test(s.t)&&s.who==null).length===1; })(),J(L()));
  fresh('2026-11-14',15,'dorm',{WZ_TEA_SEAT:true}); check('1. 沛珊 2026-12-16 以前：選項有',P.show(H.G,'classmate_peishan')===true);
  at(DK('2026-12-17'),15); check('1. 沛珊 2026-12-17 起：選項不出現（約不了）',P.show(H.G,'classmate_peishan')===false&&INV.decide(H.G,'classmate_peishan','teahouse_ceremony',DK('2027-01-17'),14).res!=='accept');
  at(DK('2027-10-16'),15); check('1. 芷若大三上（英國）：選項不出現；學姊照常',P.show(H.G,'heroine_02')===false&&P.show(H.G,'heroine_05')===true);
  at(DK('2028-10-14'),15); check('1. 學姊大四上（美國）：選項不出現',P.show(H.G,'heroine_05')===false);
  at(DK('2028-03-18'),15); check('1. 芷若大三下（回來了）：選項有',P.show(H.G,'heroine_02')===true); });

await sec(2,async()=>{ const ty=DK('2026-10-19'), d1=ty+1;
  fresh(key(d1),9); inPark(); check('2. 颱風假隔天 09:00 在公園：要演',WZL.p3Due(H.G));
  H.picks=['「好，我來。」']; H.said=[]; const h0=H.G.hour; await tickUntil();
  check('2. 開場兩句旁白、阿伯「年輕人，有空嗎？那根太重，我們三個抬不動。」',said('（颱風過了。公園的地上都是斷掉的樹枝，鞦韆的鐵鍊上掛著一大片葉子。涼亭的石桌倒了一張石凳。）')&&said('（下象棋的三個阿伯今天沒有下棋。一個拿竹掃把，一個拿鋸子，一個在講電話叫里長。）')&&saidBy('阿伯','年輕人，有空嗎？那根太重，我們三個抬不動。'),J(L()));
  check('2. 「好，我來。」→ 抬樹枝、「腰不要彎。用腳。」→ 清完（「你下棋很爛。搬樹枝很好。」「下次讓你一隻馬。」）',said('（你和阿伯一人一頭，把那根樹枝抬到路邊。比你想的重。）')&&said('腰不要彎。用腳。')&&said('（十點多，地上清得差不多了。石凳扶回去，棋盤擦乾，擺回石桌上。）')&&said('你下棋很爛。搬樹枝很好。')&&said('下次讓你一隻馬。'));
  check('2. 貓那一句（還沒取名＝那隻貓）',said('（那隻貓從溜滑梯底下走出來，在乾的那一塊地上坐下。）'),J(L()));
  check('2. 幫了忙：WZ_P3_HELPED、1 小時',H.G.flags.WZ_P3_HELPED===d1&&Math.abs(H.G.hour-h0-1)<1e-6,H.G.hour-h0+'');
  at(d1+1,9); check('2. 幫過就不再演（之後的颱風也不演）',!WZL.p3Due(H.G)&&(()=>{ at(DK('2027-10-14'),9); return !WZL.p3Due(H.G); })());
  fresh(key(d1),9.5,'wenzhou',{}); H.G.daily={park:{catName:'所長'}}; inPark(); H.picks=['「我去借推車。」']; H.said=[]; await tickUntil();
  check('2. 「我去借推車。」→ 推車四趟、「你從哪裡借到的？……好，下次也找你。」、貓那一句用名字',said('（你去里辦公處借了一台推車，來回四趟。）')&&said('你從哪裡借到的？……好，下次也找你。')&&said('（所長從溜滑梯底下走出來，在乾的那一塊地上坐下。）')&&!!H.G.flags.WZ_P3_HELPED);
  fresh(key(d1),9,'wenzhou',{}); inPark(); H.picks=['「我還有事。」']; H.said=[]; await tickUntil();
  check('2. 「我還有事。」→「好，去忙。」＋旁白；不記、不花時間、沒有清完那段',said('好，去忙。')&&said('（他自己又試了一次，沒有抬起來。旁邊的阿伯過去幫他。）')&&!H.G.flags.WZ_P3_HELPED&&H.G.hour===9&&!said('下次讓你一隻馬。'));
  at(d1+1,9); check('2. 同一個颱風只演一次；WZ-T3 也不給這個颱風',!WZL.p3Due(H.G)&&WZL.typhoonPend(H.G)===null);
  at(DK('2027-10-14'),9); check('2. 沒幫：下一個颱風（下一學年）還有',WZL.p3Due(H.G));
  fresh(key(d1),9,'wenzhou',{}); H.G.weather='rain'; WZL.p3Watch(H.G); check('2. 那天早上下雨：不演',!WZL.p3Due(H.G));
  at(d1+1,9); H.G.weather='clear'; WZL.p3Watch(H.G); check('2. 延到第一個沒下雨的早上（隔兩天）',WZL.p3Due(H.G));
  fresh(key(d1),8.5,'dorm',{}); WZL.p3Watch(H.G); at(d1+1,9,'wenzhou'); WZL.p3Watch(H.G); check('2. 隔天早上沒下雨但沒去公園：之後不演',!WZL.p3Due(H.G));
  fresh(key(ty+4),9,'wenzhou',{}); check('2. 三天以後：不演',!WZL.p3Due(H.G));
  fresh(key(d1),11.2,'wenzhou',{}); check('2. 11:00 以後：不演',!WZL.p3Due(H.G));
  fresh(key(d1),9,'wenzhou',{}); hire('tea',[6]); check('2. 茶屋打工的玩家：改成 WZ-T3（不演 P3）',!WZL.p3Due(H.G)); });

await sec(3,async()=>{ const rnd=Math.random; const play=async(o)=>{ const P=PARK.rec(H.G); Object.assign(P,o.P||{}); H.said=[]; H.G.hour=9;   /* 下象棋 08:00～11:00：每一盤從 9:00 開始 */ if(o.x!=null) Math.random=()=>o.x; try{ return await PARK.interact(GM,{park:'chess'}); } finally { Math.random=rnd; } };
  fresh('2027-03-13',9,'wenzhou',{WZ_P3_HELPED:100}); let r=await play({P:{chessOpen:3,chessN:9},x:0.64});
  check('3. 第四種開局：（阿伯把自己的一隻馬拿起來……）「說好的。讓你一隻馬。」',said('（阿伯把自己的一隻馬拿起來，放回盒子裡。）')&&saidBy('阿伯','說好的。讓你一隻馬。'),J(L()));
  check('3. 讓馬：第 10 盤贏的機率 45%＋20%（0.64＝贏）、「……下一盤不讓了。」',r==='win'&&said('……下一盤不讓了。'),r+' '+J(L()));
  r=await play({P:{chessOpen:4,chessN:9},x:0.64}); check('3. 下一盤（不讓）：同樣 0.64＝輸（贏 45%、和到 60%）',r==='lose'&&!said('說好的。讓你一隻馬。')&&said('年輕人，紅的給你。'),r+' '+J(L()));
  r=await play({P:{chessOpen:7,chessN:30},x:0.69}); check('3. 最多 70%（0.69＝贏）',r==='win');
  r=await play({P:{chessOpen:11,chessN:30},x:0.72}); check('3. 70%～85% 和：「讓一隻馬，和了。……其實是你贏。」',r==='draw'&&said('讓一隻馬，和了。……其實是你贏。'));
  r=await play({P:{chessOpen:15,chessN:30},x:0.9}); check('3. 輸：「讓你一隻馬還輸。……沒關係，下次讓兩隻。」',r==='lose'&&said('讓你一隻馬還輸。……沒關係，下次讓兩隻。'));
  r=await play({P:{chessOpen:3,chessN:0}}); check('3. 前四盤順序不變（第 1 盤＝輸，讓馬也一樣）',r==='lose'&&said('說好的。讓你一隻馬。'));
  fresh('2028-10-14',9,'wenzhou',{WZ_P3_HELPED:100}); r=await play({P:{chessOpen:3,chessN:30},x:0.9}); check('3. 大四：「律師，讓你一隻馬還輸。」',said('律師，讓你一隻馬還輸。'));
  r=await play({P:{chessOpen:7,chessN:30},x:0.72}); check('3. 大四和：「和。律師，讓你一隻馬，你還是要和解。」',said('和。律師，讓你一隻馬，你還是要和解。'));
  r=await play({P:{chessOpen:11,chessN:30},x:0.1}); check('3. 大四贏：「律師，下一盤不讓了。」',said('律師，下一盤不讓了。'));
  fresh('2027-03-13',9,'wenzhou',{}); r=await play({P:{chessOpen:3,chessN:9},x:0.64}); check('3. 沒幫過：開局照舊三種（第 4 次＝「年輕人，紅的給你。」）、沒有讓馬',said('年輕人，紅的給你。')&&!said('說好的。讓你一隻馬。')); });

await sec(4,async()=>{ const busy0=INV.busyAt, reach0=STORY.reachable; INV.busyAt=()=>null;
  try{
  const setup=(k,h,flags)=>{ fresh(k,h,'dorm',Object.assign({NOODLE_SAW_APRON:true},flags||{})); PHONE.join(H.G,'noodle_team','麵店團'); for(const id of ['zhe','yu','classmate_bohan','classmate_xinci']) H.rel(id,30,10,10); H.G.flags.MET_ZHE=true; };
  const thu=TD('Y2S1',4,4), sat=thu+2; const A=PHONE.GROUP_ACTS.find(a=>a.id==='wz_grpb');
  setup(key(thu),20); check('4. 群組裡的「約」：週四 20:00、有 NOODLE_SAW_APRON＝看得到',!!A&&A.th===TH&&A.label==='約'&&A.show(H.G));
  at(thu,18.5); check('4. 18:30 還沒',!A.show(H.G)); at(thu-1,20); check('4. 週三沒有',!A.show(H.G)); at(thu,20); H.G.flags.NOODLE_SAW_APRON=false; check('4. 沒有 NOODLE_SAW_APRON 沒有',!A.show(H.G));
  setup(key(thu),20); H.picks=['週六 10:00']; await A.run(GM); at(thu,20.5); const M=msgs(TH);
  check('4. 祐廷「週末要不要吃早午餐」',M.includes('我：週末要不要吃早午餐'),J(M));
  check('4. 四個人照順序：阿哲「好啊」、Alison 兩則、柏翰「週六十點。我先去占位子。」、芯慈',J(M.slice(1))===J(['zhe：好啊','yu：十點可以！！','yu：九點以前的我不算人','classmate_bohan：週六十點。我先去占位子。','classmate_xinci：好。我會晚十分鐘，先幫我點。']),J(M));
  const q=OUT.get(H.G,'wz_grpb_'+sat); check('4. 成立：出門提醒那週六 10:00、帶到半熟',!!q&&q.h===10&&q.goto&&q.goto.zone==='wz_brunch'&&q.title==='大家的早午餐',J(q));
  check('4. 那一週不能再約',!A.show(H.G));
  at(sat,10,'wz_brunch'); H.said=[]; const m0={}; for(const id of ['zhe','yu','classmate_bohan','classmate_xinci']) m0[id]=SOCIAL.rel(id).fam; await tickUntil();
  check('4. 那一場：（四人桌，加一張椅子。）、Alison「欸，這裡的蛋好好吃。為什麼我們都在吃麵？」、阿哲「下次換晚餐。」、（他說的晚餐，還是麵店。）',J(H.said.map(s=>s.t))===J(['（四人桌，加一張椅子。）','欸，這裡的蛋好好吃。為什麼我們都在吃麵？','下次換晚餐。','（他說的晚餐，還是麵店。）']),J(L()));
  check('4. 時間到 11:30、四個人熟悉 +1、上午的時段佔掉',Math.abs(H.G.hour-11.5)<1e-6&&['zhe','yu','classmate_bohan','classmate_xinci'].every(id=>SOCIAL.rel(id).fam===m0[id]+1)&&CLS.slotRec(H.G).used.am>0,J(H.G.slots));
  /* 柏翰：法服值班的週六（大二起） */
  const thu7=TD('Y2S1',7,4); setup(key(thu7),20); H.picks=['週六 10:00']; await A.run(GM); at(thu7,20.5); const M7=msgs(TH);
  check('4. 法服值班的週六：柏翰「這週不行。法服有值班。」（不算能來）',M7.includes('classmate_bohan：這週不行。法服有值班。')&&!H.G.flags.WZ_GRPB.who.includes('classmate_bohan'),J(M7));
  setup(key(thu7),20); H.picks=['週日 10:00']; await A.run(GM); at(thu7,20.5); check('4. 約週日：柏翰照樣能來',msgs(TH).includes('classmate_bohan：週六十點。我先去占位子。')&&OUT.get(H.G,'wz_grpb_'+(thu7+3))!=null);
  /* 四個都不能 */
  STORY.reachable=()=>false; setup(key(thu),20); H.picks=['週六 10:00']; await A.run(GM); at(thu,20.5); const M0=msgs(TH); STORY.reachable=reach0;
  check('4. 四個都不能：阿哲「這週回高雄」「下次」、芯慈那一則＋「那下週」；Alison、柏翰不回；不排',J(M0.slice(1))===J(['zhe：這週回高雄','zhe：下次','classmate_xinci：這週家裡有事。下次我要去。','classmate_xinci：那下週'])&&!OUT.get(H.G,'wz_grpb_'+sat)&&!H.G.flags.WZ_GRPB,J(M0));
  /* Alison 週六不行、週日可以 */
  STORY.reachable=(id,G)=>!(id==='yu'&&CALENDAR.dateOf(G.day).wd===6); setup(key(thu),20); H.picks=['週六 10:00']; await A.run(GM); at(thu,20.5); const MA=msgs(TH); STORY.reachable=reach0;
  check('4. Alison 週六不行、週日可以：「週六有事」「週日可以嗎」',MA.includes('yu：週六有事')&&MA.includes('yu：週日可以嗎')&&!H.G.flags.WZ_GRPB.who.includes('yu'),J(MA));
  /* 在早午餐店打工（那天沒有班）：阿哲多一則；「哥」 */
  setup(key(thu),20); hire('brunch',[7]); H.picks=['週六 10:00']; await A.run(GM); at(thu,20.5); check('4. 在早午餐店打工：阿哲多一則（沒有 ZHE_CALLS_GE＝沒有「哥」）',msgs(TH).includes('zhe：你店裡那家？有員工價嗎'));
  setup(key(thu),20,{ZHE_CALLS_GE:true}); hire('brunch',[7]); H.picks=['週六 10:00']; await A.run(GM); at(thu,20.5); check('4. ZHE_CALLS_GE：「哥你店裡那家？有員工價嗎」',msgs(TH).includes('zhe：哥你店裡那家？有員工價嗎'));
  /* 那天有早午餐的班 */
  setup(key(thu),20,{ZHE_CALLS_GE:true}); hire('brunch',[6]); H.picks=['週六 10:00']; await A.run(GM); at(thu,20.5); const MS=msgs(TH);
  check('4. 那天有班：阿哲「哥你那天不是要上班」「那我們去你那家，你上菜」、照樣成立、不排出門提醒',MS.includes('zhe：哥你那天不是要上班')&&MS.includes('zhe：那我們去你那家，你上菜')&&!MS.includes('zhe：好啊')&&H.G.flags.WZ_GRPB.shift===true&&!OUT.get(H.G,'wz_grpb_'+sat),J(MS));
  at(sat,9); const f0=SOCIAL.rel('yu').fam; const sl=JOBS.SHIFT_LINES.map(f=>f(H.G,'brunch',6,'mid')).filter(Boolean).flat();
  check('4. 上班的時候：旁白「（他們坐四人桌，加一張椅子。這次沒有人算過。）」、熟悉 +1、只一次',sl.some(x=>x[1]==='（他們坐四人桌，加一張椅子。這次沒有人算過。）')&&SOCIAL.rel('yu').fam===f0+1&&!JOBS.SHIFT_LINES.map(f=>f(H.G,'brunch',6,'mid')).filter(Boolean).flat().some(x=>x[1]==='（他們坐四人桌，加一張椅子。這次沒有人算過。）'),J(sl));
  /* 4-2 阿哲揪 */
  const z6=TD('Y2S1',6,4); setup(key(z6),21.2); WZL.phone(H.G); const MZ=msgs(TH); const mz=(H.G.msgs||[]).find(m=>m.ask&&/^grpb_zhe_/.test(m.ask.id));
  check('4. 阿哲第 6 週週四 21:00：「週六早午餐有人嗎」；選項「+1」「這週不行」',MZ.includes('zhe：週六早午餐有人嗎')&&!!mz&&J(mz.ask.opts.map(o=>o.t))===J(['+1','這週不行']),J(MZ));
  PHONE.answer(H.G,mz.ask.id,0); at(z6,21.3); WZL.phone(H.G); at(z6,21.6); const MZ2=msgs(TH);
  check('4. +1：其他三個人照表回、成立（排週六 10:00）',MZ2.includes('yu：十點可以！！')&&MZ2.includes('classmate_xinci：好。我會晚十分鐘，先幫我點。')&&!!OUT.get(H.G,'wz_grpb_'+(z6+2))&&H.G.flags.WZ_GRPB.who.includes('zhe'),J(MZ2));
  at(TD('Y2S1',11,4),21.2); const n0=msgs(TH).length; WZL.phone(H.G); check('4. 一學期一次：第 11 週不再揪',msgs(TH).length===n0);
  setup(key(z6),21.2); WZL.phone(H.G); msgs(); const mz2=(H.G.msgs||[]).find(m=>m.ask&&/^grpb_zhe_/.test(m.ask.id)); PHONE.answer(H.G,mz2.ask.id,1); at(z6,21.3); WZL.phone(H.G); at(z6,21.5);
  check('4. 這週不行：阿哲「好喔」、不排',msgs(TH).includes('zhe：好喔')&&!OUT.get(H.G,'wz_grpb_'+(z6+2)));
  setup(key(z6),21.2,{WZ_GRPB_T:{Y2S1:z6-10}}); WZL.phone(H.G); check('4. 那學期吃過了：第 6 週不揪',!msgs(TH).some(t=>/週六早午餐有人嗎/.test(t)));
  at(TD('Y2S1',11,4),21.2); WZL.phone(H.G); check('4. 吃過的學期：第 11 週也不揪（一學期一次＝這學期已經有了）',!msgs(TH).some(t=>/週六早午餐有人嗎/.test(t)));
  setup(key(TD('Y2S1',11,4)),21.2); WZL.phone(H.G); check('4. 第 6 週沒揪到（那週吃過／舊存檔）：第 11 週揪',msgs(TH).includes('zhe：週六早午餐有人嗎'));
  check('4. 沒有 PHONE.GROUP_ACTS 以外的按鈕來源：game3d.js 讀 PHONE.GROUP_ACTS',/PHONE\.GROUP_ACTS/.test(fs.readFileSync(path.join(H.ROOT,'src/game3d.js'),'utf8')));
  } finally { INV.busyAt=busy0; STORY.reachable=reach0; }
  fresh(key(TD('Y2S1',4,6)),10); check('4. 真的作息：大二上一般的週六 10:00 阿哲能來',WZL.grpbCan(H.G,'zhe',TD('Y2S1',4,6))==='can'); });

H.done();
})();
