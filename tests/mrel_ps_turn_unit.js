// 多線交往第三批施工（不需要瀏覽器）：src/multirel3d.js、src/data/multirel_lines.js、src/hometown3d.js、src/data/events.js（考完的晚餐那一行）
//   1 沛珊和宥辰的三次互動（AA_228 3-4；AA_425 第 1 節刪「別給阿哲聽。」）：大一下麵店長桌（ev_midterm_supper_y1s2）、大二上第 8 週麵店團群組＋宥辰私下傳的那一句、大三去台南找她
//   2 《換我講一件事》（AA_228 3-4 原文；AA_422 7-3）：去台南找她的那一次；那學期沒去＝第 12 週以後她打電話；PS_CONFESSED；第四個選項 → 3-3（交往那一版、還沒交往「我也喜歡另一個女生。」那一版）
//   3 台南那幾年：祐廷先坦白在去找她的那一次、視訊裡（AA_425 第 1 節）；挽回在去找她的那一次，那學期沒去才打電話（AA_423 6-1）
//   4 麵店團說溜嘴的群聚：K12（ev_kexin_two_circles）、二十三週年（ev_noodle_23rd）、大二／大四中秋
//   5 BB194-YTFLAGS（BB_194 §24 @1769c7ce）：劇本照實的那一句記 YT_HONEST；學姊「說我也喜歡妳。」、以安「還有誰？」（照實說）＝honest；可昕「沒有，那是誤會。」＝claimEnded（比事實＝YT_LIED.kexin[Y]）
//   6 接受同時交往照 ROM.PARAMS.acceptsOpen（AA_423 第 0 節；現在都是 false）；YT_INTENT、AN_TALKED／SIS_TALKED／KX_TALKED
//   7 舊存檔
// 修改前（開發分支 dd96391c2）：沒有 MREL.ycSupper、MREL.hvMeet、MULTIREL_LINES.PS_TURN——FAIL。用法：node tests/mrel_ps_turn_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const {check,GM}=H, J=JSON.stringify;
global.ZRUK={W_FROM:'2028-09-01',playW:async()=>'orig'};
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(MREL|MULTIREL_LINES|HV|HOMETOWN_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
let ok=true, err=''; try{ load('src/data/hometown_lines.js'); load('src/hometown3d.js'); load('src/data/multirel_lines.js'); load('src/multirel3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const X=()=>typeof MREL!=='undefined'?MREL:null, Lm=()=>MULTIREL_LINES;
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };
const A1='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin', YC='classmate_youchen';
const setD=(d,h)=>{ H.G.day=d; H.G.hour=h; H.G.weekday=CALENDAR.dateOf(d).wd%7; };
const setT=(key,h)=>setD(STORY.dayOfKey(key),h);
const T=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };
const clr=()=>{ H.said=[]; H.opts=[]; };
const fresh=(key,h,zone,fl)=>{ H.fresh(key,h,zone||'campus',Object.assign({},fl||{})); if(X()) X()._gm=GM; return H.G; };
const msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th);
const play=async a=>{ if(a) await X().play(GM,a); return a; };
const tainanDay=wk=>STORY.termDay('Y3S1',wk,3);   /* 大三上第 wk 週週三：她在台南 */
const TURN=['欸，我跟你講一件事喔。','什麼？','我最近跟一個人走得蠻近的。','誰？','宥辰。我們班那個。','走得近是多近？','就……我覺得他蠻可愛的。','妳直接跟我講喔？','不然我要偷偷來喔？','我還沒跟他怎樣啦。','只是覺得應該跟你說。'];
const OPT3=['「……謝謝妳跟我講。」','「我不太開心。」','「那妳想怎樣？」'], OPT4=OPT3.concat(['「那我也跟妳講一件事。」']);
const ycAll=(n3)=>{ H.G.flags.PS_YC={n1:1,n2:2,n3}; };
const datePS=()=>{ H.CLOSE(PS); ROM.start(H.G,PS); };

(async()=>{
check('0. 四個檔都載得到',ok&&!!X()&&!!X().ycSupper&&!!X().hvMeet&&!!(Lm()&&Lm().PS_TURN)&&!!HV,err);
if(!X()||!X().hvMeet){ H.done(); return; }

/* ---------------- 1. 宥辰的三次互動 ---------------- */
await sec(1,async()=>{
  const ev=STORY_EVENTS.find(e=>e.id==='ev_midterm_supper_y1s2');
  fresh('2026-04-15',19,'noodle'); H.FRIEND(PS); H.FRIEND(YC); H.FRIEND('zhe');
  await EVENTS.run(ev);
  const i=H.said.findIndex(s=>s.t==='法條背那麼快的人，記得住別人說過的話嗎？');
  check('1. 第一次（大一下麵店長桌＝考完的晚餐最後）：沛珊「法條背那麼快的人，記得住別人說過的話嗎？」宥辰「記得。可是我會假裝不記得。」',i>=0&&H.said[i+1]&&H.said[i+1].t==='記得。可是我會假裝不記得。'&&H.said[i].who==='郭沛珊'&&H.said[i+1].who==='賴宥辰'&&H.G.flags.PS_YC.n1===H.G.day,J(H.lines().slice(-4)));
  fresh('2026-04-15',19,'noodle'); H.FRIEND(PS); await EVENTS.run(ev);
  check('1. 不認識宥辰＝不演（只有認識的人說話）',!H.has('記得。可是我會假裝不記得。')&&!(H.G.flags.PS_YC||{}).n1);

  const d=STORY.termDay('Y2S1',8,3);
  fresh('2026-10-01',12); setD(d,23.3); PHONE.join(H.G,'noodle_team','麵店團'); H.FRIEND(PS); H.FRIEND(YC);
  X().ycPhone(H.G); PHONE.tick(H.G);
  const g=msgs('g:noodle_team').filter(m=>m.text==='有沒有人知道一首聽了會想讀書的歌');
  check('1. 第二次：大二上第 8 週週三 23:10 麵店團群組沛珊「有沒有人知道一首聽了會想讀書的歌」（沒有句號）',g.length===1&&g[0].from===PS,J(msgs('g:noodle_team')));
  const a=X().dueAuto(H.G); check('1. 23:15 以後切過去（宥辰私下傳她的）',a&&a.k==='yc_cut'&&a.cap==='沛珊的手機');
  clr(); await play(a);
  check('1. （宥辰私下傳她一份歌單。）「六點那首是我自己混的。」（AA_425：沒有「別給阿哲聽。」）＝PS_YC.n2',J(T())===J(['（宥辰私下傳她一份歌單。）','六點那首是我自己混的。'])&&H.said[1].who==='賴宥辰（手機）'&&H.G.flags.PS_YC.n2===d&&!msgs('p:'+YC).length,J(H.lines()));
  check('1. 宥辰那一句不進祐廷的手機',!msgs().some(m=>m.text==='六點那首是我自己混的。'));
  fresh('2026-10-01',12); setD(d,23.3); H.FRIEND(PS); H.FRIEND(YC); X().ycPhone(H.G); PHONE.tick(H.G);
  check('1. 不在麵店團群組＝沒有這一次',!msgs().some(m=>m.text==='有沒有人知道一首聽了會想讀書的歌')&&!X().ycCutDue(H.G));
  fresh('2026-10-01',12); setD(d,23.3); PHONE.join(H.G,'noodle_team','麵店團'); H.FRIEND(PS); X().ycPhone(H.G); PHONE.tick(H.G);
  check('1. 不認識宥辰：群組那句有，沒有切過去',msgs('g:noodle_team').some(m=>m.text==='有沒有人知道一首聽了會想讀書的歌')&&!X().ycCutDue(H.G));
  setD(d+1,22.5); X().ycPhone(H.G); check('1. 隔天 22:00 以後：群組那句在了，也算發生過（n2）',H.G.flags.PS_YC.n2===d);

  fresh('2027-08-20',12,'campus',{PS_RECONNECT:true}); setD(tainanDay(5),10); H.FRIEND(PS); H.FRIEND(YC);
  const q={id:'hv_t',hv:{id:PS,key:'classmate_peishan@台南',keep:false},ev:'ev_hv_ps_tn'};
  check('1. 大三上她在台南（presence city）',X().inTainan(H.G)&&HV.key(H.G,PS)==='classmate_peishan@台南');
  clr(); await HV.play(GM,q);
  check('1. 第三次：去台南找她那一天（地方那一段演完以後）她提「宥辰上禮拜來我們學校聽演講，坐在最後一排睡覺。……他醒來問的問題是全場最好的。」（沒交往也有）',H.has('宥辰上禮拜來我們學校聽演講，坐在最後一排睡覺。……他醒來問的問題是全場最好的。')&&H.G.flags.PS_YC.n3===H.G.day,J(T().slice(0,12)));
  clr(); await HV.play(GM,Object.assign({},q,{id:'hv_t2'}));
  check('1. 第三次只一次',!H.has('宥辰上禮拜來我們學校聽演講，坐在最後一排睡覺。……他醒來問的問題是全場最好的。'));
  fresh('2027-08-20',12,'campus',{PS_RECONNECT:true}); setD(STORY.termDay('Y2S1',5,3),10);
  check('1. 大二上（她還在臺北）不演第三次',!X().yc3Due(H.G)||!X().inTainan(H.G));
});

/* ---------------- 2. 《換我講一件事》 ---------------- */
await sec(2,async()=>{
  const q={id:'hv_t',hv:{id:PS,key:'classmate_peishan@台南',keep:false},ev:'ev_hv_ps_tn'};
  fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); H.FRIEND(YC); ycAll(H.G.day-10);
  check('2. 交往中、三次都有、第三次之後 7 天以上＝要演',X().psTurnDue(H.G));
  clr(); const r=await X().hvMeet(GM,PS,q,'first');
  check('2. 去台南找她的那一次：AA_228 3-4 原文十一句',r==='turn'&&seq(TURN),J(T()));
  check('2. 祐廷沒有別人＝三個選項（沒有「那我也跟妳講一件事。」）',J(H.opts[0])===J(OPT3),J(H.opts));
  check('2. 「……謝謝妳跟我講。」→「嗯。」「你可以不開心。我沒有要你說沒關係。」＝PS_CONFESSED',seq(['嗯。','你可以不開心。我沒有要你說沒關係。'])&&H.G.flags.PS_CONFESSED===H.G.day);
  clr(); await X().hvMeet(GM,PS,q,'first'); check('2. 只一次',!H.has('欸，我跟你講一件事喔。'));
  for(const [k,want] of [[1,['我知道。','我講出來也不是很開心。','……可是不講我會更不舒服。']],[2,['我還不知道。所以才跟你講。']]]){
    fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); ycAll(H.G.day-10); clr(); H.picks=[k]; await X().hvMeet(GM,PS,q,'first');
    check('2. 「'+OPT3[k].slice(1,-1)+'」→「'+want.join('」「')+'」',seq(want)); }
  fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); H.G.flags.PS_YC={n1:1,n2:2};
  check('2. 第三次還沒有＝不演',!X().psTurnDue(H.G));
  fresh('2027-08-20',12); setD(tainanDay(6),10); H.CLOSE(PS); ycAll(H.G.day-10);
  check('2. 沒有和她交往＝不演（三次只是日常）',!X().psTurnDue(H.G));

  /* 第四個：祐廷也在交往（以安，沛珊不知道）→ 3-3 交往那一版 */
  fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); H.CLOSE(A1); ROM.start(H.G,A1); ycAll(H.G.day-10);
  clr(); H.picks=[3]; await X().hvMeet(GM,PS,q,'first');
  check('2. 祐廷也在交往＝四個選項',J(H.opts[0])===J(OPT4),J(H.opts));
  check('2. 「那我也跟妳講一件事。」→ 3-3：「幹嘛，換你了喔？」「我跟另一個女生也在一起。」……「我那時候都跟你講了欸。」',seq(['幹嘛，換你了喔？','我跟另一個女生也在一起。','……喔。','多久了？','你又沒問。','可是你至少可以跟我講吧。','我那時候都跟你講了欸。'])&&!H.has('幹嘛，那麼嚴肅。'),J(T()));
  check('2. 坦白：ROM 她知道以安、YT_CONFESSED、進冷靜期（3-6 三天後）',ROM.knowsOf(H.G,PS,A1)&&!!H.G.flags.YT_CONFESSED[PS][A1]&&X().st(H.G,PS)&&X().st(H.G,PS).talkAt===H.G.day+3);
  /* 第四個：還沒交往、祐廷讓以安知道他在追她 → 3-3 原文那一版 */
  fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); ycAll(H.G.day-10); X().rec(H.G).liked[A1]=H.G.day-30;
  clr(); H.picks=[3]; await X().hvMeet(GM,PS,q,'first');
  check('2. 祐廷也喜歡別人（還沒交往）＝四個選項',J(H.opts[0])===J(OPT4));
  check('2. → 3-3 原文：「幹嘛，換你了喔？」「我也喜歡另一個女生。」「誰啊？」「以安。」「喔。」「那她知道你有女朋友嗎？」「不知道。」「嗯。」「我覺得我們要聊一下欸。」',seq(['幹嘛，換你了喔？','我也喜歡另一個女生。','誰啊？','以安。','喔。','那她知道你有女朋友嗎？','不知道。','嗯。','我覺得我們要聊一下欸。']),J(T()));
  check('2. 還沒交往那一版：記 like、不進冷靜期',!!X().rec(H.G).like[PS][A1]&&!X().st(H.G,PS));
  fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); ycAll(H.G.day-10); X().rec(H.G).liked[A1]=1; ROM.learn(H.G,A1,PS,'test');
  clr(); H.picks=[3]; await X().hvMeet(GM,PS,q,'first'); check('2. {知道／不知道} 讀以安知不知道沛珊：知道。',seq(['那她知道你有女朋友嗎？','知道。']));

  /* 那學期沒去：第 12 週以後她打電話 */
  fresh('2027-08-20',12); setD(tainanDay(13),21.6); datePS(); ycAll(H.G.day-10);
  let a=X().dueAuto(H.G); check('2. 第 13 週、接下來 7 天沒約去台南、21:30 以後＝她打電話',a&&a.k==='ps_turn_phone'&&a.bg==='phone_street_night'&&a.cap==='電話');
  clr(); await play(a); check('2. 電話裡一句一句演（同樣的十一句）＝PS_CONFESSED',seq(TURN)&&H.G.flags.PS_CONFESSED===H.G.day);
  fresh('2027-08-20',12); setD(tainanDay(6),21.6); datePS(); ycAll(H.G.day-10);
  a=X().dueAuto(H.G); check('2. 第 6 週＝先不打（等去台南）',!a||a.k!=='ps_turn_phone');
  fresh('2027-08-20',12); setD(tainanDay(13),21.6); datePS(); ycAll(H.G.day-10); OUT.plan(H.G,{id:'hv_x',ev:'ev_hv_ps_tn',day:H.G.day+3,h:10.5,hv:{id:PS,key:'classmate_peishan@台南'}});
  a=X().dueAuto(H.G); check('2. 三天後約好去台南＝不打電話',!a||a.k!=='ps_turn_phone');
  fresh('2027-08-20',12); setD(tainanDay(6),21.6); datePS(); ycAll(H.G.day-10); clr();
  await X().hvMeet(GM,PS,null,'video'); check('2. 視訊裡不演《換我講一件事》（AA：去台南那次或電話）',!H.has('欸，我跟你講一件事喔。'));
  /* HV.play 整趟 */
  fresh('2027-08-20',12); setD(tainanDay(6),10); datePS(); ycAll(H.G.day-10); clr(); await HV.play(GM,q);
  check('2. 整趟去台南（hometown3d.js）：接人、地方之後演，之後照常送上車',seq(TURN)&&H.G.flags.PS_CONFESSED===H.G.day&&(H.G.flags.HV_N||{})['classmate_peishan@台南']===1);
});

/* ---------------- 3. 台南那幾年：坦白、挽回 ---------------- */
await sec(3,async()=>{
  const q={id:'hv_t',hv:{id:PS,key:'classmate_peishan@台南',keep:false},ev:'ev_hv_ps_tn'};
  fresh('2027-08-20',12); setD(tainanDay(4),10); datePS(); H.CLOSE(A1); ROM.start(H.G,A1);
  clr(); H.picks=[1]; await X().hvMeet(GM,PS,q,'first');
  check('3. 去台南那一次：祐廷也在交往＝「那我也跟妳講一件事。」／（不說）',J(H.opts[0])===J(['「那我也跟妳講一件事。」','（不說）'])&&!X().st(H.G,PS));
  clr(); H.picks=[0]; await X().hvMeet(GM,PS,q,'first');
  check('3. 選了＝3-3（3-4 沒發生過＝「幹嘛，那麼嚴肅。」）',seq(['幹嘛，那麼嚴肅。','我跟另一個女生也在一起。'])&&!!X().st(H.G,PS));
  const st=X().st(H.G,PS);
  setD(H.G.day+3,21.5); check('3. 三天後、第 4 週：電話先不打（等去台南的那一次）',!X().FLOW.classmate_peishan.tick(H.G,st));
  clr(); const r=await X().hvMeet(GM,PS,q,'first');
  check('3. 下一次去台南：《我們講清楚好不好》在那裡演',r==='flow'&&seq(['所以你現在還想跟她在一起？','如果我也跟別人在一起，你可以嗎？']));
  fresh('2027-08-20',12); setD(tainanDay(13),10); datePS(); H.CLOSE(A1); ROM.start(H.G,A1); clr(); H.picks=[0]; await X().hvMeet(GM,PS,q,'first');
  setD(H.G.day+3,21.5); const a=X().FLOW.classmate_peishan.tick(H.G,X().st(H.G,PS));
  check('3. 第 13 週以後沒約去台南＝電話',a&&a.k==='ps_phone');
  fresh('2027-08-20',12); setD(tainanDay(4),21.5); datePS(); H.CLOSE(A1); ROM.start(H.G,A1); clr(); H.picks=[0]; H.G.flags.PS_VIDEO=null;
  await HV.video(GM,PS); check('3. 視訊（交往中）：也可以坦白',H.opts.some(o=>J(o)===J(['「那我也跟妳講一件事。」','（不說）']))&&H.has('幹嘛，那麼嚴肅。'));
  fresh('2026-10-14',12,'linze'); datePS(); H.CLOSE(A1); ROM.start(H.G,A1);
  check('3. 她在臺北：和她說話的選項照舊',STORY.TALK_OPTS.some(f=>f(H.G,PS).some(o=>o.t==='「那我也跟妳講一件事。」')));
  fresh('2026-10-14',12,'linze'); datePS(); X().rec(H.G).liked[ZQ]=H.G.day;
  check('3. 她在臺北、祐廷喜歡子晴（還沒交往）：選項也有（3-3 原文那一版）',X().confessAny(H.G,PS)===ZQ&&STORY.TALK_OPTS.some(f=>f(H.G,PS).some(o=>o.t==='「那我也跟妳講一件事。」')));
  fresh('2026-10-14',12,'linze'); datePS();
  check('3. 祐廷沒有別人＝沒有那個選項',!X().confessAny(H.G,PS));
});

/* ---------------- 4. 說溜嘴的群聚 ---------------- */
await sec(4,async()=>{
  const S=X().SLIP_EVENTS; check('4. K12、二十三週年、大二／大四中秋都在名單',!!S.ev_kexin_two_circles&&!!S.ev_noodle_23rd&&!!S.ev_y2_midautumn&&!!S.ev_y4_midautumn);
  fresh('2028-12-14',19,'noodle',{dating_kexin:true,KX_MET_NOODLE_TEAM:true}); H.CLOSE(A1); ROM.start(H.G,A1); ROM.learn(H.G,'zhe',A1,'test');
  const ev={id:'ev_noodle_23rd',participants:['heroine_03']};
  check('4. 二十三週年、可昕認識麵店團、阿哲知道以安＝阿哲說溜嘴',J(X().slipFor(H.G,ev))===J({y:A1,who:'zhe'}));
  clr(); await X().afterEvent(GM,ev); check('4. 演完：「{name}最近很忙吧，又要顧妳又要顧以安。」＝可昕知道以安',H.has('祐廷最近很忙吧，又要顧妳又要顧以安。')&&ROM.knowsOf(H.G,KX,A1));
  H.G.flags.KX_MET_NOODLE_TEAM=false; X().rec(H.G).once={}; ROM.relRec(H.G)[KX]={};
  check('4. 可昕沒見過麵店團＝她不在場、不說溜嘴',!X().slipFor(H.G,ev));
});

/* ---------------- 5. BB194-YTFLAGS ---------------- */
await sec(5,async()=>{
  const runL=async(x,y,lines,picks)=>{ H.picks=picks||[]; const c=X().ctx(H.G,x,y); await X().run(GM,x,lines,c); return c; };
  fresh('2026-10-14',12); H.CLOSE(ZQ); H.G.flags.dating_kexin=true; await runL(ZQ,KX,Lm().ASK.heroine_04,[1]);
  check('5. 子晴「欸，你不是有女朋友？」「有啊。」（劇本照實）＝YT_HONEST；選「沒有啦。」＝也記 YT_DODGED',H.G.flags.YT_HONEST[ZQ]===true&&H.G.flags.YT_DODGED[ZQ]===true);
  check('5. 期末飯知情門檻：子晴閃避過＝不發（KNOWS_OK）',!TERMEND.KNOWS_OK.heroine_04(H.G));
  fresh('2026-10-14',12); H.G.flags.dating_kexin=true; await runL(ZR,KX,Lm().ASK.heroine_02,[1]);
  check('5. 芷若「等一下，你不是有女朋友嗎？」「嗯。」＝YT_HONEST',H.G.flags.YT_HONEST[ZR]===true&&!(H.G.flags.YT_DODGED||{})[ZR]);
  fresh('2026-10-14',12); H.G.flags.dating_kexin=true; await runL(YT,KX,Lm().KNOW.heroine_03.say,[]);
  check('5. 語彤知情版心意邀約「……可是你有女朋友吧。」「嗯。」＝YT_HONEST',H.G.flags.YT_HONEST[YT]===true);
  fresh('2026-10-14',12); H.G.flags.dating_kexin=true; H.picks=[1]; const c5=X().ctx(H.G,SIS,KX); const o=Lm().KNOW.heroine_05.opts[1];
  await X().run(GM,SIS,o.then,c5); X().applyPick(H.G,c5,o.sub[1]);
  check('5. 學姊「我會跟她說。」→「說我也喜歡妳。」＝YT_HONEST（BB_194 §24）',H.G.flags.YT_HONEST[SIS]===true);
  fresh('2026-10-14',12); H.G.flags.dating_kexin=true; H.CLOSE(A1); ROM.start(H.G,A1); const c6=X().ctx(H.G,A1,KX,{first:'子晴'}); await X().run(GM,A1,Lm().DISC.heroine_01.more,c6);
  check('5. 以安「還有誰？」（照實說）＝YT_HONEST',H.G.flags.YT_HONEST[A1]===true);
  fresh('2026-10-14',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); const c7=X().ctx(H.G,KX,A1); H.picks=[4]; await X().run(GM,KX,Lm().DISC.kexin.base,c7);
  check('5. 可昕「沒有，那是誤會。」＝claimEnded 比事實：以安還在交往＝YT_LIED.kexin.heroine_01、這一場記說謊',H.G.flags.YT_LIED[KX][A1]===true&&c7.lied===true&&!(H.G.flags.YT_HONEST||{})[KX]);
  check('5. 只有選了才記：其他選項不記說謊',(()=>{ fresh('2026-10-14',12,'campus',{dating_kexin:true}); H.CLOSE(A1); ROM.start(H.G,A1); return true; })());
  const c8=X().ctx(H.G,KX,A1); H.picks=[0]; await X().run(GM,KX,Lm().DISC.kexin.base,c8); check('5. 「是我的錯。我沒有跟妳講。」＝不記說謊',!((H.G.flags.YT_LIED||{})[KX]||{})[A1]&&!c8.lied);
});

/* ---------------- 6. acceptsOpen、YT_INTENT ---------------- */
await sec(6,async()=>{
  check('6. 遊戲裡現在七位 acceptsOpen 都是 false',Object.values(ROM.PARAMS.acceptsOpen).every(v=>v===false));
  fresh('2027-03-01',12); H.CLOSE(SIS); ROM.start(H.G,SIS); H.G.flags.dating_kexin=true; SOCIAL.rel(SIS).npcRom=90;
  const st=X().startStrain(H.G,SIS,KX,{ver:'base'}); st.phase='talked'; st.intent='both'; st.meets=2; st.lies0=0;
  const a=X().FLOW.heroine_05.meet(H.G,st,'talk'); clr(); await a.run(GM);
  check('6. 學姊：還想兩個都要、戀愛 90，但 acceptsOpen false＝「不接受」那一格（Bno＝BB_194 13-4 的 D：分開）',H.has('我沒辦法。我會一直在想你現在在哪裡。')&&!H.has('我還是喜歡你。這個我不想騙自己。')&&!H.G.flags.dating_heroine_05&&!((H.G.flags.OPEN_OK||{})[SIS]||{})[KX]);
  fresh('2027-03-01',12); datePS(); H.G.flags.dating_kexin=true; const s2=X().startStrain(H.G,PS,KX,{ver:'base'}); s2.phase='psA'; s2.aDay=H.G.day-8; s2.talkAt=H.G.day;
  const b=X().FLOW.classmate_peishan.meet(H.G,s2,'talk'); clr(); if(b) await b.run(GM);
  check('6. 沛珊「可以。我們可以慢慢談。」之後：acceptsOpen false＝不談界線、停在 C「上次那件事我還在想喔。」，沒有 PS_MUTUAL／OPEN_OK',s2.phase==='distant'&&H.has('上次那件事我還在想喔。')&&!H.has('我想了幾件事。')&&!H.G.flags.PS_MUTUAL&&!((H.G.flags.OPEN_OK||{})[PS]||{})[KX]);
  fresh('2027-03-01',12); H.CLOSE(SIS); ROM.start(H.G,SIS); H.G.flags.dating_kexin=true; const s3=X().startStrain(H.G,SIS,KX,{ver:'base'}); clr(); H.picks=[1]; await X().sisDinner(GM,s3);
  check('6. 書瑀的晚餐選「我還是想跟她在一起，也想跟妳。」＝YT_INTENT.heroine_05＝both、SIS_TALKED',H.G.flags.YT_INTENT[SIS]==='both'&&H.G.flags.SIS_TALKED===H.G.day);
});

/* ---------------- 7. 舊存檔 ---------------- */
await sec(7,async()=>{
  fresh('2027-10-13',12); H.G.flags={dating_classmate_peishan:true}; ROM.rec(H.G);
  check('7. 舊存檔：YT_INTENT＝{}、PS_YC 第一次讀才建、PS_CONFESSED 沒有＝3-3 開頭「幹嘛，那麼嚴肅。」',J(H.G.flags.YT_INTENT)==='{}'&&J(X().ycRec(H.G))==='{}'&&H.G.flags.PS_CONFESSED==null&&!X().psTurnDue(H.G));
});

H.done();
})();
