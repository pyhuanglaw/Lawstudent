// 日本篇的空白日（AA_435 第 1～5 節、第 7 節 @0bb6e2fe6；src/jp_blank3d.js、src/data/jp_blank_lines.js、src/jp3d.js 的河邊那一句）——不需要瀏覽器。
//   1 開學以前 3/29～4/9（百元商店、腳踏車、超市、選課、分級考兩版、花見、明天開學）　2 週末（交往中八場、挽回中三場、河邊那一句、摘要池）
//   3 期末週　4 最後一週（送別會兩版、打掃、郵局、最後一次去學校）　5 挽回中 5/5、7/17　6 立衡沒遇過＝隔壁房間的交換生　7 記憶的面板名稱、舊存檔
// 修改前（開發分支 866fafb3e）：沒有 src/jp_blank3d.js、src/data/jp_blank_lines.js——FAIL。用法：node tests/aa435_jp_blank_unit.js
const H=require('./pg_harness.js');
const fs=require('fs'), vm=require('vm'), path=require('path');
const load=f=>{ let src=fs.readFileSync(path.join(H.ROOT,f),'utf8'); src=src.replace(/^const (\w+)\s*=/mg,(m,n)=>/^(EXCH|Y34B|MSG|MSG_POOL|MSG2_POOL|GROUP|GROUP_EVENTS|R2Y3A|R2Y3A_EVENTS|R2Y3B|R2Y3B_EVENTS|HOLFF|JP|JP_EVENTS|JPB|JP_BLANK_LINES)$/.test(n)?'globalThis.'+n+'=':m); vm.runInThisContext(src,{filename:f}); };
const {check,GM}=H, J=JSON.stringify;
GM.caption=()=>{}; GM.toast=()=>{};
for(const f of ['src/holff3d.js','src/exchange3d.js','src/data/msg_pool.js','src/data/msg2_pool.js','src/msg3d.js','src/data/group_events.js','src/group3d.js','src/y34b3d.js','src/data/r2y3a_events.js','src/r2y3a3d.js','src/data/r2y3b_events.js','src/r2y3b3d.js','src/data/jp_events.js','src/jp3d.js']) load(f);
let ok=true, err=''; try{ load('src/data/jp_blank_lines.js'); load('src/jp_blank3d.js'); }catch(e){ ok=false; err=String(e&&e.stack||e); }
const D=k=>STORY.dayOfKey(k), T=(d,h)=>d*24+h, A1='heroine_01';
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const fresh=(key,h,zone,flags)=>{ const G=H.fresh(key,h,zone,Object.assign({EXCHANGE_ROUTE:'JP',EXCH_RULE:1},flags||{})); G.acts={att:{}}; G.outings=[]; G.visited={}; H.at(key,h); G.zone=zone||'dorm'; GM.npc={}; HOME.rec(G); return G; };
const at=(key,h)=>H.at(key,h);
const inJapan=(key,h,dating,flags)=>{ const G=fresh(key,h,'jp_hub',Object.assign({X1_JP:D('2028-02-20'),JP_DEPARTED:D('2028-03-25'),AN_SENDOFF:'together'},flags||{})); H.FAMILIAR(A1); H.date(A1); if(dating===false) ROM.end(G,A1,'test'); PHONE.join(G,'jp_exchange','交換生群組'); return G; };
const phone=()=>{ STORY.phoneRules(GM); PHONE.tick(H.G); };
const T_=()=>H.said.map(s=>s.t);
const seq=arr=>{ const t=T_(); let i=0; for(const a of arr){ const k=t.indexOf(a,i); if(k<0) return false; i=k+1; } return true; };
const clr=()=>{ H.said=[]; H.opts=[]; };
const run=async(id,picks)=>{ clr(); H.picks=picks||[]; await EVENTS.run(ev(id)); };
const stop=async()=>{ const st=JP.dueStop(H.G,'jp'); clr(); if(st) await JP.playStop(GM,st,'jp'); return st; };
const msgs=th=>(H.G.msgs||[]).filter(m=>!th||m.th===th);
const lastMsg=th=>{ const L=msgs(th); return L[L.length-1]||null; };
const metLH=()=>{ H.G.events=H.G.events||{}; H.G.events.done=H.G.events.done||{}; H.G.events.done.ev_liheng_japan=1; };
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,4).join(' / ')); } };

(async()=>{
check('0. 兩個檔載得到；事件登記；JP.SCH 多了這一包的列；記憶的面板名稱；PHONE_RULES',ok&&typeof JPB!=='undefined'&&!!JPB.SCH&&JP_BLANK_LINES.EV.every(id=>!!ev(id))
  &&JP.SCH.some(s=>s.k==='jpb_1_5')&&JP.SCH.some(s=>/^jpb_pool_/.test(s.k))&&SOCIAL.MEMORY_LABEL.AN_JP_LIGHT==='她房間的燈，是你換的'&&SOCIAL.MEMORY_LABEL.AN_JP_FIREWORK==='在河堤看了她在日本的第一場煙火',err);
if(!ok||typeof JPB==='undefined'||!JPB.SCH){ H.done(); return; }

/* ---------------- 1. 開學以前 ---------------- */
await sec(1,async()=>{
  inJapan('2028-03-28',21.6); phone();
  const m=lastMsg('p:'+A1); check('1-1 交往中：3/28 21:30「明天去車站那邊的百元商店。我要買衣架。」回「好。」／「我想睡。」',!!m&&m.text==='明天去車站那邊的百元商店。我要買衣架。'&&J(m.ask.opts.map(o=>o.t))===J(['好。','我想睡。']));
  PHONE.answer(H.G,'jpb_yen',0); phone(); const q=OUT.get(H.G,'jpb_yen'); check('1-1「好。」＝3/29 11:00 出遊',!!q&&q.day===D('2028-03-29')&&q.h===11&&q.ev==='ev_jpb_100yen');
  await run('ev_jpb_100yen',[0]);
  check('1-1 原文：（車站旁邊的百元商店。…）「衣架、垃圾袋、拖鞋。……你的呢？」→「我沒有寫清單。」→「我知道。」（她把籃子裡的一份衣架拿出來，放進你的籃子。）',J(T_())===J(['（車站旁邊的百元商店。她拿了一個籃子，照手帳上的清單一樣一樣放進去。）','衣架、垃圾袋、拖鞋。……你的呢？','我知道。','（她把籃子裡的一份衣架拿出來，放進你的籃子。）']),J(T_()));
  inJapan('2028-03-28',21.6); phone(); PHONE.answer(H.G,'jpb_yen',1); phone();
  check('1-1「我想睡。」＝她回「好。我買兩份。」、不排出遊',lastMsg('p:'+A1).text==='好。我買兩份。'&&!OUT.get(H.G,'jpb_yen'));
  inJapan('2028-03-29',11.1,false); let st=await stop();
  check('1-1 挽回中：11:00 一個人（一鍵）',!!st&&st.k==='jpb_1_1r'&&J(T_())===J(['（車站旁邊的百元商店。你買了衣架和拖鞋。結帳的時候才想起來，沒有買垃圾袋。）']));
  inJapan('2028-03-31',12.2); phone(); check('1-2 交往中：12:00 以安私訊（沒有選項）',lastMsg('p:'+A1).text==='宿舍旁邊有一間二手腳踏車店。我要買一台。你要嗎？'&&!lastMsg('p:'+A1).ask);
  at('2028-03-31',15.1); st=await stop();
  check('1-2 15:00：（店裡一排舊的腳踏車…）「這一台的煞車比較緊。」「……我騎騎看。」（她在店門口騎了一圈…）→「我買旁邊那台。」→「好。顏色一樣，不要騎錯。」',st&&st.k==='jpb_1_2'&&seq(['（店裡一排舊的腳踏車，每一台都掛著手寫的價錢。老闆在後面修輪胎。）','這一台的煞車比較緊。','……我騎騎看。','（她在店門口騎了一圈，回來的時候頭髮被風吹亂了。她沒有整理。）','好。顏色一樣，不要騎錯。']));
  inJapan('2028-03-31',12.2,false); phone(); check('1-2 挽回中、沒遇過立衡：沒有他的私訊',!msgs('p:jp_liheng').length);
  at('2028-03-31',15.1); await stop(); check('1-2 挽回中、沒遇過立衡：隔壁房間的交換生（沒有名字）',J(T_())===J(['（宿舍旁邊的二手腳踏車店。隔壁房間的交換生也在挑。你們各買了一台，一起騎回宿舍，路上沒說什麼話。）']));
  inJapan('2028-03-31',12.2,false); metLH(); phone(); at('2028-03-31',15.1); await stop();
  check('1-2 挽回中、4/2 遇過立衡：12:00「腳踏車要買嗎 我知道一間二手的」→（立衡幫你挑了一台。他蹲下來看鏈條，看了很久。）「這台可以。……騎到八月沒問題。」',
    msgs('p:jp_liheng').some(m=>m.text==='腳踏車要買嗎 我知道一間二手的')&&J(T_())===J(['（立衡幫你挑了一台。他蹲下來看鏈條，看了很久。）','這台可以。……騎到八月沒問題。'])&&H.said[1].who==='立衡');
  inJapan('2028-04-01',15.6); phone(); PHONE.answer(H.G,'jpb_market',1); phone();
  const mk=msgs('p:'+A1).map(m=>m.text); check('1-3「我查給妳。」＝祐廷回「晚上九點。」、她回「好。謝謝。」，不演',mk.includes('晚上九點。')&&mk[mk.length-1]==='好。謝謝。'&&!OUT.get(H.G,'jpb_market'));
  inJapan('2028-04-01',15.6); phone(); PHONE.answer(H.G,'jpb_market',0); phone(); check('1-3「我陪妳去。」＝17:00 出遊',OUT.get(H.G,'jpb_market').h===17);
  await run('ev_jpb_market',[0]); check('1-3 原文＋「今天也等？」→「好。我們去旁邊坐一下。」（你們在超市門口的長椅坐到六點。）',seq(['（小鎮的超市。生魚片在六點以後貼了半價的貼紙。）','……原來要等到六點。','下週六，六點以後再來。','好。我們去旁邊坐一下。','（你們在超市門口的長椅坐到六點。）']));
  inJapan('2028-04-01',18.6,false); await stop(); check('1-3 挽回中 4/1 摘要',J(T_())===J(['（第一個週六。你騎腳踏車繞了大學城一圈，花了四十分鐘。）']));
  inJapan('2028-04-04',20.1); st=await stop(); check('1-4 交往中 4/4 20:00 選課（宿舍的書桌）',st&&st.k==='jpb_1_4'&&seq(['（宿舍的書桌。她把兩張課表並排放好。）','比較行政法，我們一起修。','日本法入門，你修。我修地方自治。……兩門撞堂。','你對地方自治沒興趣。不要為了跟我。']));
  inJapan('2028-04-04',18.6,false); await stop(); check('1-4 挽回中摘要',J(T_())===J(['（選課系統開了。你一個人排了三次課表。）']));
  inJapan('2028-04-05',10.1); await stop(); check('1-5 分級考（交往中）',J(T_())===J(['（日本語的分級考。聽力那一段，廣播講得比課本快很多。）','（下午公告：你分到中級。）','（以安也是中級。她在公告前面看了一下，說：「同一班。」）']));
  inJapan('2028-04-05',10.1,false); await stop(); check('1-5 分級考（挽回中）',J(T_())===J(['（日本語的分級考。聽力那一段，廣播講得比課本快很多。）','（下午公告：你分到中級。）','（以安的名字在同一張公告上。中級。）']));
  inJapan('2028-04-07',21.2,false); phone(); const g=lastMsg('g:jp_exchange');
  check('1-6 挽回中：交換生群組 4/7 21:00「明天中午 河堤 花見 自己帶吃的」（說話框「交換生」）、回「+1」',!!g&&g.text==='明天中午 河堤 花見 自己帶吃的'&&PHONE.who(g)==='交換生'&&J(g.ask.opts.map(o=>o.t))===J(['+1']));
  PHONE.answer(H.G,'jpb_g_hanami',0); phone(); check('1-6「+1」＝4/8 13:00 出遊',OUT.get(H.G,'jpb_hanami').h===13);
  metLH(); await run('ev_jpb_hanami',[0]);
  check('1-6 花見：（河堤上一排櫻花…）（以安坐在另一張布上…）遇過立衡「……你們同一個學校來的？」→「嗯。」→「喔。」（他沒有再問。）；JP_HANAMI_GROUP、不加 REPAIR',
    seq(['（河堤上一排櫻花，交換生鋪了三張藍色的塑膠布。有人帶了吉他。）','（以安坐在另一張布上，和兩個韓國來的交換生講話。她看到你，點了一下頭。）','……你們同一個學校來的？','喔。','（他沒有再問。）'])&&H.G.flags.JP_HANAMI_GROUP===true&&!((H.G.flags.REPAIR||{}).heroine_01));
  inJapan('2028-04-08',18.6,false); await stop(); check('1-6 不回群組＝摘要（宿舍窗外的櫻花被風吹進來一片。）',J(T_())===J(['（宿舍窗外的櫻花被風吹進來一片。）']));
  inJapan('2028-04-08',18.6); const st8=JP.dueStop(H.G,'jp'); check('1-6 交往中 4/8 沒有那一句（櫻花照舊）',!st8||st8.k!=='jpb_1_6r');
  inJapan('2028-04-09',21.1); phone(); PHONE.answer(H.G,'jpb_first',1); phone(); const fm=msgs('p:'+A1).map(m=>m.text);
  check('1-7 交往中 4/9 21:00「明天開學。」「你第一堂幾點？」→「還沒看。」→「九點。日本語。」「……我幫你看了。」',fm.includes('明天開學。')&&fm.includes('你第一堂幾點？')&&fm.slice(-2).join('|')==='九點。日本語。|……我幫你看了。');
});

/* ---------------- 2. 週末 ---------------- */
await sec(2,async()=>{
  inJapan('2028-04-14',21.2); phone(); const m=lastMsg('p:'+A1);
  check('2-1 a 前一天 21:00「明天早上有早市。……我想買草莓。」回「好。」／「這週不行。」',m&&m.text==='明天早上有早市。……我想買草莓。'&&J(m.ask.opts.map(o=>o.t))===J(['好。','這週不行。']));
  PHONE.answer(H.G,'jpb_w_market',0); phone(); check('2-1 a「好。」＝4/15 09:00 出遊',OUT.get(H.G,'jpb_w_market').day===D('2028-04-15')&&OUT.get(H.G,'jpb_w_market').h===9);
  await run('ev_jpb_w_market',[1]); check('2-1 a 原文＋「妳很喜歡草莓？」→「我媽喜歡。……我拍給她看。」（她拍了一張照片，傳出去。）',seq(['（早市的攤子沿著小路排開。草莓一盒一盒疊得很高。）','臺灣的草莓，三月就沒有了。','……這裡四月才最好吃。','我媽喜歡。……我拍給她看。','（她拍了一張照片，傳出去。）']));
  inJapan('2028-04-14',21.2); phone(); PHONE.answer(H.G,'jpb_w_market',1); phone(); check('2-1「這週不行。」＝她回「好。」',lastMsg('p:'+A1).text==='好。'&&!OUT.get(H.G,'jpb_w_market'));
  at('2028-04-15',18.6); let st=await stop(); check('2-1「這週不行。」那天換成 2-4 的摘要一句（交往中第一句）',st&&/^jpb_pool_/.test(st.k)&&J(T_())===J(['（週六早上，宿舍很安靜。你睡到九點，被隔壁的吸塵器吵醒。）']));
  inJapan('2028-06-10',21.2); phone(); check('2-1 e 字裡寫「一整天」：前一天不傳',!msgs('p:'+A1).some(x=>x.text==='房間的燈閃了一整天。我買了燈管，可是我搆不到。'));
  at('2028-06-11',14.1); phone(); check('2-1 e 當天 14:00 傳',msgs('p:'+A1).some(x=>x.text==='房間的燈閃了一整天。我買了燈管，可是我搆不到。'));
  PHONE.answer(H.G,'jpb_w_light',0); phone(); check('2-1 e 16:00 出遊',OUT.get(H.G,'jpb_w_light').h===16);
  await run('ev_jpb_w_light',[0]);
  check('2-1 e 原文：（她租的房間在二樓。…）「椅子在這裡。……我扶著。」→「我站上去。」→（燈管換好…）「……原來這麼亮。」＝記憶 AN_JP_LIGHT',seq(['（她租的房間在二樓。門口放著一雙拖鞋、一袋新的燈管。）','椅子在這裡。……我扶著。','（燈管換好，房間一下子亮了。她看了天花板一下。）','……原來這麼亮。'])&&SOCIAL.has(A1,'AN_JP_LIGHT'));
  inJapan('2028-07-22',19.5); await run('ev_jpb_w_fire',[0]);
  check('2-1 h 沒和她去過淡水：「……臺灣的煙火，我只在電視上看過。」→「這次看煙火。」→「嗯。」（她的手碰到你的手，沒有移開。）＝記憶 AN_JP_FIREWORK',seq(['（河堤上的人很多。第一發煙火上去的時候，旁邊的小孩叫了一聲。）','……臺灣的煙火，我只在電視上看過。','嗯。','（她的手碰到你的手，沒有移開。）'])&&SOCIAL.has(A1,'AN_JP_FIREWORK')&&!H.has('……淡水那一次，我們在看夕陽。'));
  DATE.log(H.G,A1).byLoc.D13=1; await run('ev_jpb_w_fire',[1]); check('2-1 h 去過淡水（D13）：「……淡水那一次，我們在看夕陽。」；（不說話）→（煙火放了二十分鐘。…）',seq(['……淡水那一次，我們在看夕陽。','（煙火放了二十分鐘。最後一發的時候，她轉頭看你，好像要說什麼，又沒有說。）']));
  inJapan('2028-07-22',17.6); phone(); check('2-1 h 當天 17:30 傳「今天河堤有煙火。……人會很多。」',msgs('p:'+A1).some(x=>x.text==='今天河堤有煙火。……人會很多。'));
  /* 2-2 挽回中 */
  inJapan('2028-05-13',11.1,false); metLH(); phone(); at('2028-05-13',14.1); st=await stop();
  check('2-2 5/13 遇過立衡：11:00「下午去二手店嗎 我要買電風扇」→ 14:00（二手店的電器區。…）「這台比較安靜。……晚上寫論文，吵的會睡著。」',msgs('p:jp_liheng').some(x=>x.text==='下午去二手店嗎 我要買電風扇')&&st.k==='jpb_2_2a'&&J(T_())===J(['（二手店的電器區。立衡把每一台電風扇都打開，聽它的聲音。）','這台比較安靜。……晚上寫論文，吵的會睡著。']));
  inJapan('2028-05-13',14.1,false); await stop(); check('2-2 5/13 沒遇過立衡：一個人買電風扇',J(T_())===J(['（宿舍的布告欄貼了二手店的傳單。你一個人去，買了一台電風扇，騎腳踏車載回來的時候，綁了三次。）']));
  inJapan('2028-06-17',13.1,false); await stop(); check('2-2 6/17 投幣洗衣店',J(T_())===J(['（梅雨。宿舍的投幣洗衣店排了五個人，都是交換生。有人在放手機的歌。）','（輪到你的時候，雨停了一下。）']));
  inJapan('2028-07-21',21.1,false); phone(); check('2-2 7/22 煙火：群組 7/21 21:00「明天河堤煙火 七點半 橋下集合」',lastMsg('g:jp_exchange').text==='明天河堤煙火 七點半 橋下集合');
  PHONE.answer(H.G,'jpb_g_fire',0); phone(); check('2-2「+1」＝7/22 19:30 出遊',OUT.get(H.G,'jpb_r_fire').h===19.5);
  await run('ev_jpb_r_fire'); check('2-2 煙火（她也在，不加台詞）',J(T_())===J(['（河堤上的人很多。交換生擠在橋下。以安站在最旁邊，手上拿著一罐飲料。）','（第一發煙火上去的時候，她抬頭看。你也抬頭看。）']));
  /* 2-3 河邊 */
  inJapan('2028-05-06',14); const R0=[JPB.riverLine(H.G),JPB.riverLine(H.G)];
  check('2-3 交往中週末下午（她在河邊）：照順序、不重複',J(R0)===J(['（她在讀書。你坐下來的時候，她把書往你那邊移了一點。）','（風很大。她用一顆石頭壓著書頁。）']));
  for(let i=0;i<6;i++) JPB.riverLine(H.G); check('2-3 八句用完以後只有第一句',JPB.riverLine(H.G)==='（她在讀書。你坐下來的時候，她把書往你那邊移了一點。）');
  inJapan('2028-04-16',14); check('2-3 那個週末有 2-1 的場景（4/15 早市）＝不出',JPB.riverLine(H.G)===null);
  inJapan('2028-05-08',14); check('2-3 平日不出',JPB.riverLine(H.G)===null);
  inJapan('2028-05-06',14,false); check('2-3 挽回中不出',JPB.riverLine(H.G)===null);
  inJapan('2028-05-06',14); clr(); await JP.visit(GM,'river'); check('2-3 據點的「河邊」：她在＝那一句（30 分鐘）',H.has('（她在讀書。你坐下來的時候，她把書往你那邊移了一點。）')&&Math.abs(H.G.hour-14.5)<1e-6);
  /* 2-4 摘要池 */
  inJapan('2028-06-03',18.6); st=await stop(); check('2-4 沒有任何一件的週末日：18:30 一句（交往中第一句）',st&&/^jpb_pool_/.test(st.k)&&J(T_())===J(['（週六早上，宿舍很安靜。你睡到九點，被隔壁的吸塵器吵醒。）']));
  at('2028-06-04',18.6); await stop(); check('2-4 下一天換下一句',J(T_())===J(['（你騎腳踏車去了隔壁的鎮。回來的時候迷路了一次。）']));
  inJapan('2028-06-03',18.6); H.G.events.last={ev_x:H.G.day}; check('2-4 今天演過事件＝不出',!JP.dueStop(H.G,'jp'));
  inJapan('2028-06-03',18.6); OUT.plan(H.G,{id:'x',ev:'ev_jpb_r_sea',day:H.G.day,h:21,title:'x'}); check('2-4 今天晚一點有排定的出遊＝不出',!JP.dueStop(H.G,'jp'));
  inJapan('2028-06-03',18.6,false); await stop(); check('2-4 挽回中用自己那一組（第一句）',J(T_())===J(['（週六早上，宿舍很安靜。你睡到九點，被隔壁的吸塵器吵醒。）']));
  at('2028-06-04',18.6); await stop(); at('2028-06-10',18.6); await stop(); check('2-4 挽回中第三句（和交往中不同）',J(T_())===J(['（你在共用廚房煮了一包泡麵。煮完才發現沒有買蛋。）']));
  inJapan('2028-06-07',18.6); check('2-4 平日不出',!JP.dueStop(H.G,'jp')||!/^jpb_pool_/.test(JP.dueStop(H.G,'jp').k));
});

/* ---------------- 3、4、5 ---------------- */
await sec(3,async()=>{
  inJapan('2028-07-25',20.1); let st=await stop();
  check('3 交往中 7/25 20:00：「「協議」。」祐廷「きょうぎ。」「……對。下一個。」→「換我考妳。」→「好。」（她一題都沒錯。）',st&&st.k==='jpb_3_1'&&seq(['（宿舍的共用廚房，長桌上攤滿了講義。她在考你日文的單字。）','「協議」。','きょうぎ。','……對。下一個。','好。','（她一題都沒錯。）'])&&H.said.find(s=>s.t==='きょうぎ。').who==='祐廷');
  inJapan('2028-07-27',23.1); await stop(); check('3 交往中 7/27 摘要',J(T_())===J(['（明天最後一科。十一點，她傳：「早點睡。」）']));
  inJapan('2028-07-25',22.1,false); await stop(); check('3 挽回中 7/25',J(T_())===J(['（期末週。你在宿舍的共用廚房讀到十二點。長桌另一頭，有一個交換生睡著了。）']));
  inJapan('2028-04-07',18.6,false); await stop(); check('AA_437 第 7 節第 3 點：挽回中 4/7 摘要',J(T_())===J(['（選課確定了。你的課表上，週四空了一整天。）']));
  inJapan('2028-03-29',12.1); H.G.flags.JPB_YEN='no'; await stop(); check('AA_437 第 7 節第 3 點：交往中 3/29 回「我想睡。」的摘要',J(T_())===J(['（你睡到中午。醒來的時候，宿舍的走廊很安靜。）']));
  inJapan('2028-07-27',22.1,false); await stop(); check('3 挽回中 7/27',J(T_())===J(['（明天最後一科。你把比較行政法的報告印出來，讀了一遍，改了一個字。）']));
});
await sec(4,async()=>{
  inJapan('2028-07-27',21.1); phone(); check('4-1 群組 7/27 21:00「週六 六點 宿舍大廳 送別會 每個人帶一樣家鄉的東西」（兩版都有）',lastMsg('g:jp_exchange').text==='週六 六點 宿舍大廳 送別會 每個人帶一樣家鄉的東西');
  PHONE.answer(H.G,'jpb_g_party',0); phone(); check('4-1「+1」＝7/29 18:00 出遊',OUT.get(H.G,'jpb_party').h===18);
  await run('ev_jpb_farewell',[1]); check('4-1 交往中：（以安站在你旁邊。）「你帶這個來的時候，說要送人。」「……結果放到現在。」→「妳帶了什麼？」→「茶葉。我媽塞進行李箱的。」',seq(['（宿舍大廳。長桌上擺滿了不同國家的零食。有人帶了一整盒月餅，大家都說季節不對。）','（輪到你。你拿出一包從臺灣帶來、一直沒吃的鳳梨酥。）','（以安站在你旁邊。）','你帶這個來的時候，說要送人。','……結果放到現在。','茶葉。我媽塞進行李箱的。']));
  inJapan('2028-07-29',18,false); metLH(); await run('ev_jpb_farewell',[0]);
  check('4-1 挽回中：（以安在長桌的另一頭。她帶的是一罐茶葉。）遇過立衡、4/2 沒說要寄照片「研究所的人沒有送別會。……我下學期還在。」→「下學期加油。」→「……嗯。你也是。」（AA_437 第 7 節第 2 點）',seq(['（以安在長桌的另一頭。她帶的是一罐茶葉。）','研究所的人沒有送別會。……我下學期還在。','……嗯。你也是。'])&&!H.has('……好。')&&!H.has('（以安站在你旁邊。）'));
  inJapan('2028-07-29',18,false); metLH(); H.G.flags.LIHENG_TOLD='wish'; await run('ev_jpb_farewell',[0]);
  check('4-1 4/2 說過「去了要寄照片」（LIHENG_TOLD:wish）：→「我會寄照片。」→「……好。」',seq(['研究所的人沒有送別會。……我下學期還在。','……好。'])&&!H.has('……嗯。你也是。'));
  inJapan('2028-07-29',20.1); await stop(); check('4-1 不去＝摘要',J(T_())===J(['（大廳傳來很多人的笑聲。你在房間收行李，收到一半停下來聽。）']));
  inJapan('2028-07-29',22.6); phone(); PHONE.answer(H.G,'jpb_clean',0); phone(); check('4-2 交往中 7/29 22:30 私訊「明天下午打掃房間。房東週一來點交。」→「我去幫忙。」＝7/30 14:00',OUT.get(H.G,'jpb_clean').h===14);
  await run('ev_jpb_clean',[1]); check('4-2 6/11 沒演過：整段換（AA_437 第 7 節第 1 點）',seq(['（她的房間已經收得差不多了。地上只剩兩個紙箱。天花板的燈閃了一下。）','這盞燈，我一直沒換。','……留給下一個人換。','好。','（她坐在紙箱上，看了房間一圈。）'])&&!H.has('燈管要留給下一個人。'));
  H.G.events.done.ev_jpb_w_light=1; await run('ev_jpb_clean',[0]); check('4-2 6/11 演過：「……你換的那一支。」',seq(['燈管要留給下一個人。','……你換的那一支。','（你擦窗戶的時候，她在後面掃地。窗外是那排晒衣竿。）']));
  inJapan('2028-07-29',22.6); phone(); PHONE.answer(H.G,'jpb_clean',1); phone(); check('4-2「好，加油。」＝她回「嗯。」',lastMsg('p:'+A1).text==='嗯。'&&!OUT.get(H.G,'jpb_clean'));
  inJapan('2028-07-30',18.6,false); await stop(); check('4-2 挽回中 7/30 摘要',J(T_())===J(['（你把房間的東西裝進兩個箱子。書比來的時候多了四本。）']));
  inJapan('2028-07-31',11.1); await stop(); check('4-3 郵局（交往中多一句）',J(T_())===J(['（郵局的櫃台。海運要兩個月才到。你在單子上寫臺北的地址，寫得比平常慢。）','（以安排在你後面。她的箱子比你的小，貼了三張「易碎」。）']));
  inJapan('2028-07-31',11.1,false); await stop(); check('4-3 郵局（挽回中沒有多的）',J(T_())===J(['（郵局的櫃台。海運要兩個月才到。你在單子上寫臺北的地址，寫得比平常慢。）']));
  inJapan('2028-08-02',10.1); await stop(); check('4-4 最後一次去學校（交往中多一段）',J(T_())===J(['（退宿的手續。職員用很慢的日文說了一句話，這次你全部聽懂了。）','（出來以後，她說要再去一次圖書館。你們在她常坐的位子坐了半個小時，什麼都沒讀。）']));
  inJapan('2028-08-02',10.1,false); await stop(); check('4-4（挽回中）',J(T_())===J(['（退宿的手續。職員用很慢的日文說了一句話，這次你全部聽懂了。）']));
});
await sec(5,async()=>{
  inJapan('2028-05-05',18.6,false); await stop(); check('5 挽回中 5/5 摘要',J(T_())===J(['（黃金週最後一天。宿舍旁邊的人家掛了鯉魚旗，風一吹，三條魚一起動。）']));
  inJapan('2028-07-16',21.1,false); phone(); check('5 7/16 21:00 群組「明天海邊 電車一小時 誰要去」',lastMsg('g:jp_exchange').text==='明天海邊 電車一小時 誰要去');
  PHONE.answer(H.G,'jpb_g_sea',0); phone(); at('2028-07-17',9.1); await stop(); check('5「+1」＝7/17 一鍵：（交換生坐滿了一節車廂。…）',J(T_())===J(['（交換生坐滿了一節車廂。海很藍，水很冷。你在沙灘上坐了一下午，曬紅了手臂。）']));
  inJapan('2028-07-17',18.6,false); await stop(); check('5 不回＝摘要（海之日。…）',J(T_())===J(['（海之日。宿舍裡的人都出去了。走廊很安靜。）']));
  inJapan('2028-07-16',21.1); phone(); check('5 交往中不收這一則（海之日照舊是 G8）',!msgs('g:jp_exchange').some(m=>m.text==='明天海邊 電車一小時 誰要去'));
});
await sec(7,async()=>{
  inJapan('2028-06-03',12); delete H.G.jpb; check('7 舊存檔：G.jpb 沒有＝空的開始',J(JPB.rec(H.G).pool)==='{}');
  check('7 河邊句：jp3d.js 的 S.visit 叫 JPB.riverLine',/JPB\.riverLine/.test(fs.readFileSync(path.join(H.ROOT,'src/jp3d.js'),'utf8')));
});
H.done();
})();
