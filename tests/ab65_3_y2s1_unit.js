// AB65-3-Y2S1-L 第②部分：大二上的事件、手機、群戲照 AA_211（AA-B 2026-10-17；第 2、2-1、3、4 節＋附錄 A／B 第 2 節的非階梯列、
//   附錄 A 第 6 節、附錄 B 第 5 節：BB_167 SC3／SC4／SC5、BB_181 九項）——不需要瀏覽器。基準＝AA_211 讀的開發分支 3d4d1969。
//   只換「3d4d1969 的原句現在還在、而且只出現一次」的列；後來的改稿（AA_313、AA_358、AA_360、AA_374、AA_375…）已經換掉的列不動，第 9 節檢查現在的句子照留。
//   1 群戲三場（第 3 節）  2 社團博覽會  3 系籃、在一起、期末最後一頓、問答攤（路過）  4 以安家教、讀書會規則、芯慈第二名、柏翰考古題小組
//   5 颱風兩場、週日宵夜  6 沛珊我要重考、SC3 #14／#15  7 story3d 手機  8 needed_msgs、characters.js 註解  9 被取代的列（現在的句子照留）
// 修改前（開發分支 2a672d9a8）：新句都不在、舊句都在——FAIL。用法：node tests/ab65_3_y2s1_unit.js
// AA_428 §2（企劃線 1b33efe8e，AA 回子代理問的九點）：第 1、2、4～8 點改句（開學第一頓旁白、中秋以安刪掉、期中柏翰、攤位「下週六」、芯慈 c、zq_game、FAFU_BH[0]、週日宵夜的訊息與收尾），
//   第 3、9 點與第 2、8 點的「照現行」列在第 9 節。修改前（開發分支 f85417a0e）這些新斷言 FAIL。
// AA_519 5-4（企劃線 d75cd0228，2026-10-28 NPC-STORY2-1028）：週日宵夜第一則的第二句「我這棟樓下的滷味比較好吃」改「宿舍旁邊那攤滷味比較好吃」（後半「 老闆會多給豆干」、不打標點照舊）——第 5 項照新字查、舊字不在
// AA_519 第 9 節第 1 點（企劃線 169130daf）：大二颱風夜同一場其他的泡麵一起換成一袋滷味——第 5 項的期待值「下雨又怎樣 滷味我都買了」、遞毛巾「先擦頭啦，滷味又不會跑。」（照稿）、
//   最後旁白「各分到一些」（原本「各分到一包」；稿「其他泡麵照同樣的意思改」，子代理改）。檢查照留，只換字
const H=require('./pg_harness.js');
const fs=require('fs'), path=require('path');
const {check}=H, J=JSON.stringify;
const ev=id=>STORY_EVENTS.find(e=>e.id===id);
const texts=e=>(e&&e.dialogue||[]).filter(l=>l&&l.text!==undefined).map(l=>l.text);
const RD=f=>fs.readFileSync(path.join(H.ROOT,f),'utf8');
const SRC=RD('src/data/events.js'), ST=RD('src/story3d.js'), CH=RD('src/data/characters.js');
const sec=async(n,f)=>{ try{ await f(); }catch(e){ check(n+'. 丟出例外（這一節中斷）',false,String(e&&e.stack||e).split('\n').slice(0,3).join(' / ')); } };
if(typeof NEEDED_MSGS==='undefined') require('vm').runInThisContext(RD('src/data/needed_msgs.js').replace(/^const NEEDED_MSGS\s*=/m,'globalThis.NEEDED_MSGS='),{filename:'src/data/needed_msgs.js'});   /* pg_harness 沒載 needed_msgs.js */
const NM=id=>NEEDED_MSGS.list.find(e=>e.id===id);
/* 認識全部的人（群戲「只有認識的人說話」的條件用 STORY.knows）；know＝null 全部認識，陣列＝只認識這些（阿哲永遠認識）*/
const run=async(id,picks,know,flags)=>{ const k0=STORY.knows; STORY.knows=(x)=>know?(x==='zhe'||know.includes(x)):true;
  try{ if(flags) Object.assign(H.G.flags,flags); H.said=[]; H.opts=[]; H.picks=(picks||[]).slice(); await EVENTS.run(ev(id)); } finally { STORY.knows=k0; } return H.said.map(s=>s.t); };
const none=(L,re)=>!L.some(t=>re.test(t));

(async()=>{
await sec(1,async()=>{
  /* 3-1 開學第一頓 */
  H.fresh('2026-09-17',19,'noodle'); let L=await run('ev_y2_first_meal',['行政法妳選']);
  check('1. 3-1 開學第一頓（都認識、選「行政法妳選哪一班？」）：開頭旁白「（暑假以後第一次，長桌又併起來了。）」（AA_428 §2 第 1 點：scene 後面、阿哲第一句前面）、阿哲兩句、以安「我把大家的課表排在一起了，週四晚上大家都沒課。」、語彤「（端麵過來）阿姨說開學，每碗多一顆滷蛋。」→ 以安「許老師那班，聽說他很愛點人。」；Alison「學長的樣子是大碗嗎？」刪掉',
    J(L)===J(['（暑假以後第一次，長桌又併起來了。）','大二了，要有學長的樣子。','（三秒後）阿姨，大碗。','我把大家的課表排在一起了，週四晚上大家都沒課。','（端麵過來）阿姨說開學，每碗多一顆滷蛋。','許老師那班，聽說他很愛點人。'])&&J(H.opts[0])===J(['「行政法妳選哪一班？」','「先吃。」']),J([L,H.opts]));
  H.fresh('2026-09-17',19,'noodle'); L=await run('ev_y2_first_meal',['先吃'],[]);
  check('1. 3-1 只認識阿哲、選「先吃。」：開頭旁白（AA_428 §2 第 1 點）、旁白「（阿哲已經開始吃了。）」（原本阿哲「這才是學長的樣子。」）',J(L)===J(['（暑假以後第一次，長桌又併起來了。）','大二了，要有學長的樣子。','（三秒後）阿姨，大碗。','（阿哲已經開始吃了。）']),J(L));
  check('1. 3-1 舊句都不在：「學長的樣子是大碗嗎？」「（翻開手帳）這學期的課表…」「……今天的滷蛋…」「這學期要一起修行政法嗎？」「已經寫在表上了。」「這才是學長的樣子。」',
    !/學長的樣子是大碗嗎|翻開手帳）這學期的課表|今天的滷蛋，阿姨說多一顆|這學期要一起修行政法嗎|已經寫在表上了|這才是學長的樣子/.test(SRC));
  /* 3-2 中秋 */
  H.fresh('2026-09-25',18,'campus'); L=await run('ev_y2_midautumn',['便利商店']);
  check('1. 3-2 中秋（都認識、買夾子）：柏翰「那輪流，一人夾十分鐘。」、旁白「（Alison 已經拿筷子在翻肉了。）」、芯慈「左邊火比較大，肉先放左邊。」、旁白「（語彤從袋子裡拿出一罐阿姨的醬。）」、「（回來時，…）」阿哲「你回來了喔，第一輪吃完了。」；以安「我贊成。這樣公平。」刪掉（AA_428 §2 第 2 點：照 AA_211 3-2「以安這場不說話」）',
    J(L)===J(['夾子呢？','……兩個架子，一支夾子。','那輪流，一人夾十分鐘。','（Alison 已經拿筷子在翻肉了。）','左邊火比較大，肉先放左邊。','（語彤從袋子裡拿出一罐阿姨的醬。）','（回來時，大家已經用筷子烤完第一輪。）','你回來了喔，第一輪吃完了。'])&&H.G.flags.MA_Y2_TONGS==='buy',J(L));
  H.fresh('2026-09-25',18,'campus'); L=await run('ev_y2_midautumn',['用筷子'],['yu']);
  check('1. 3-2 只認識阿哲、Alison＋「用筷子就好。」：旁白 Alison 翻肉、Alison「對嘛。」',J(L)===J(['夾子呢？','……兩個架子，一支夾子。','（Alison 已經拿筷子在翻肉了。）','對嘛。']),J(L));
  check('1. 3-2 舊句都不在：「那排班。」「我先違規。」「左邊的火比較旺」「不用烤肉醬」「第二輪的英雄」；以安「我贊成。這樣公平。」（AA_428 §2 第 2 點）',!/那排班。一人夾十分鐘|我先違規|左邊的火比較旺|不用烤肉醬|第二輪的英雄/.test(SRC)&&!SRC.includes("text:'我贊成。這樣公平。'"));
  /* 3-3 期中走出教室 */
  H.fresh('2026-11-03',12.3,'classroom'); L=await run('ev_midterm_walkout_y2',[]);
  check('1. 3-3 期中走出教室（都認識）：阿哲「第三題我寫了一整面，寫完才發現是第二題的答案。」、芯慈那句刪掉、旁白「（說完，她自己翻開課本查了一題。）」；柏翰換成 AA_211 3-3「第四題時間不夠，我最後一段沒寫。」（AA_428 §2 第 2 點）；以安照現行（「理由：」拿掉）',
    J(L)===J(['第三題我寫了一整面，寫完才發現是第二題的答案。','第四題時間不夠，我最後一段沒寫。','考完的題目，不要對答案。改不了。','（說完，她自己翻開課本查了一題。）']),J(L));
  check('1. 3-3 舊句都不在：「第三題，我寫了一整面。……」「還沒考完的人在旁邊，小聲一點。」「（她自己在手帳上偷偷對了一題）」；柏翰「大家都考幾分？……不對，…」（AA_428 §2 第 2 點）',!/第三題，我寫了一整面|還沒考完的人在旁邊|在手帳上偷偷對了一題/.test(SRC)&&!SRC.includes("text:'大家都考幾分？……不對，大家覺得考得怎樣？'")); });

await sec(2,async()=>{
  const expo=async(club,picks,know,flags)=>{ H.fresh('2026-09-16',13,'campus',Object.assign(club?{['CLUB_'+club]:true}:{},flags||{})); return run('ev_y2_club_expo',picks,know); };
  let L=await expo('lawclub_study',[0,'先聽他']);
  check('2. 法服攤位：祐廷的選項改「有人來問問題，我們先聽他把事情講完，再找條文。」（AA_192 第 5 點、AA_193 第 5 節）',J(H.opts[1])===J(['「幫人看法律問題。」','「有人來問問題，我們先聽他把事情講完，再找條文。」']),J(H.opts));
  check('2. 法服攤位選第二項：「……這句，是學姊的。」刪掉（原本語彤、AA_358 換柏翰；AA_193 第 5 節正式拿掉的回聲）；柏翰「……順序對了。」是 AA_374 第 6 項，照留',L.includes('……順序對了。')&&none(L,/是學姊的/)&&!SRC.includes("text:'……這句，是學姊的。'"),J(L));
  L=await expo('club_guitar',[0]);
  check('2. 吉他社：子晴「可以啊，我們社一半的人進來都不會。」「先填表，第一次社課教 C 和弦。」（BB_167 SC3 #21；「欸不是…新手村」拿掉）',L.includes('可以啊，我們社一半的人進來都不會。')&&L.includes('先填表，第一次社課教 C 和弦。')&&none(L,/新手村|欸不是/),J(L));
  L=await expo('club_debate',[0]);
  check('2. 辯論社：祐廷「還好，我進去以前也很怕上台。」；社長「……這句我們寫在傳單上。」刪掉',L.includes('還好，我進去以前也很怕上台。')&&none(L,/寫在傳單上|講是後面的事/),J(L));
  L=await expo('club_hiking',[0]);
  check('2. 登山社：祐廷「會啊，我第一次爬完腿痠三天。」',L.includes('會啊，我第一次爬完腿痠三天。')&&none(L,/下山的時候，你會想再去一次/),J(L));
  L=await expo('dept_basketball',[0]);
  check('2. 系籃：阿哲「不用每天啦，週五晚上練一次。」→ 新生「那我可以先去看看嗎？」→ 阿哲「可以啊，球場在映月湖旁邊。」（祐廷「……我們很常練。」、阿哲「輸的時候才練」拿掉）',
    L.indexOf('不用每天啦，週五晚上練一次。')>=0&&L.indexOf('那我可以先去看看嗎？')===L.indexOf('不用每天啦，週五晚上練一次。')+1&&L.indexOf('可以啊，球場在映月湖旁邊。')===L.indexOf('那我可以先去看看嗎？')+1&&none(L,/很常練|輸的時候才練/),J(L));
  L=await expo(null,[],['classmate_bohan']);
  check('2. 都沒加入、認識柏翰：柏翰「法服的傳單，週六有值班。」…「……那你幫我拿給大一的。」（祐廷大二沒有學弟；原本語彤、AA_358 換柏翰，旁白照現在）',
    J(L)===J(['去年，你站在這一排攤位前面填表。','（你只是走過。法服的攤位後面，柏翰在發傳單。）','法服的傳單，週六有值班。','（他遞一張給你，又想起來，你不是新生。）','……那你幫我拿給大一的。']),J(L)); });

await sec(3,async()=>{
  const zg=texts(ev('ev_zhe_game_y2'));
  check('3. 系籃（大二）：旁白「（以安坐在觀眾席第一排。）」、阿哲「有沒有看到！」、以安「（在觀眾席喊）十七號四犯了！」；規則手冊、「你也有聽到」不在',zg.includes('（以安坐在觀眾席第一排。）')&&zg.includes('有沒有看到！')&&zg.includes('（在觀眾席喊）十七號四犯了！')&&!zg.some(t=>/規則手冊|你也有聽到/.test(t)),J(zg));
  H.fresh('2026-12-19',14,'campus'); let L=await run('ev_zhe_game_y2',['記分']);
  check('3. 系籃選「記分」：以安在觀眾席喊「（在觀眾席喊）十七號四犯了！」',L.includes('（以安坐在觀眾席第一排。）')&&L.includes('（在觀眾席喊）十七號四犯了！'),J(L));
  const yt=texts(ev('ev_yu_together'));
  /* 2026-10-28 改：AA_497 3-2 在「他說『沒事啦，就在一起啊』」前面多了三句照 YU2_PICK 的條件句（tests/aa497_supporting_unit.js 3-2），這裡的 texts 不看條件，改用前後相鄰判斷 */
  const yi=yt.indexOf('反正就這樣。以後在麵店吃完，他說要陪我走去捷運站。');
  check('3. 在一起：Alison「反正就這樣。以後在麵店吃完，他說要陪我走去捷運站。」接旁白「（阿哲端著兩碗麵走過來，她馬上坐正。）」',yi>0&&/^（看了一眼正在跟阿姨點菜的阿哲）/.test(yt[yi-1])&&yt[yi+1]==='（阿哲端著兩碗麵走過來，她馬上坐正。）'&&!yt.some(t=>/我都有人一起回家了/.test(t)),J(yt));
  const lm=texts(ev('ev_term_last_meal_y2s1'));
  check('3. 期末最後一頓：語彤「今天阿姨叫我坐下來吃。」',lm.includes('今天阿姨叫我坐下來吃。')&&!lm.some(t=>/不用端/.test(t)),J(lm));
  const fp=texts(ev('ev_fair_booth_y2_pass'));
  check('3. 問答攤（路過）：「阿嬤，這三件要分開問，我先記下來。」（原本語彤，現在顧攤的是柏翰；AA_428 §2 第 3 點：維持柏翰）',fp.includes('阿嬤，這三件要分開問，我先記下來。')&&!fp.some(t=>/……三件。答案不一樣/.test(t)),J(fp));
  const fb=texts(ev('ev_fair_booth_y2'));
  check('3. 問答攤「隔週週六早上……」改「下週六」（AA_428 §2 第 4 點：11/14 第 10 週，下一次值班 11/21）：加入法服的祐廷「下週六早上，值班的學長姊會在B館一樓。」、路過的柏翰「下週六早上，B館一樓，有學長姊值班。」',
    fb.includes('下週六早上，值班的學長姊會在B館一樓。')&&fp.includes('下週六早上，B館一樓，有學長姊值班。')&&!fb.concat(fp).some(t=>/隔週週六早上/.test(t)),J([fb,fp])); });

await sec(4,async()=>{
  H.fresh('2026-12-01',18,'noodle'); let L=await run('ev_an_tutor_family_1',['先陪他們看']);
  check('4. 以安家教學生的家（認識語彤、選「先陪他們看駁回的理由」）：語彤「通常先找社工吧，我們課上是這樣講的。」、手帳那句旁白刪掉；以安後面「（她拿出手機記下來。）」',
    L.includes('通常先找社工吧，我們課上是這樣講的。')&&L.includes('（她拿出手機記下來。）')&&none(L,/手帳|理由欄|然後才是你們/)&&H.G.flags.AN10_PICK==='reason',J(L));
  const pr=texts(ev('ev_plg_rules'));
  check('4. 讀書會規則選項 b：以安「……好啦，我自己也記不住十二條。」',pr.includes('……好啦，我自己也記不住十二條。')&&!pr.some(t=>/理由欄寫太多了/.test(t)),J(pr));
  H.fresh('2026-11-24',0.4,'cvs'); L=await run('ev_xinci_second',['劇在演什麼']);
  check('4. 芯慈第二名：「（把手機轉靜音）這部很重要，真的。」「每天就這半小時，沒有人會問我考幾分。」；選「這部劇在演什麼？」→「十二點四十了，我要回去了，明天早八。」',
    L.includes('（把手機轉靜音）這部很重要，真的。')&&L.includes('每天就這半小時，沒有人會問我考幾分。')&&L.includes('十二點四十了，我要回去了，明天早八。')&&none(L,/很鎮定|唯一不用跟別人比|比了十八個小時/),J(L));
  H.fresh('2026-11-24',0.4,'cvs'); L=await run('ev_xinci_second',['第二名也很厲害']);
  check('4. 芯慈選「第二名也很厲害。」（AA_428 §2 第 5 點）：旁白「她把咖啡蓋子蓋好。」→「……我知道啦。」→旁白「（她拿起咖啡，揮了一下手就走了。）」；第一句「我知道。」、「……好啦，我知道。」拿掉',
    J(L.slice(-3))===J(['她把咖啡蓋子蓋好。','……我知道啦。','（她拿起咖啡，揮了一下手就走了。）'])&&!L.includes('我知道。')&&none(L,/好啦，我知道|第二名是用來跟第一名比的/),J(L));
  H.fresh('2026-10-20',19,'library',{BOHAN_SCORE:'higher'}); L=await run('ev_bohan_exam_group',['不了']);
  check('4. 柏翰考古題小組：「以安說不要。她說她週四有讀書會。」；選「不了。」→「好。想來再跟我說。」（AA_546 1-3：「（他把你的名字劃掉。）」拿掉），沒有「……沈以安也說不了。」',
    L.includes('以安說不要。她說她週四有讀書會。')&&L.includes('好。想來再跟我說。')&&none(L,/沈以安|約好的|劃掉/),J(L));
  H.fresh('2026-10-24',16,'library'); L=await run('ev_bohan_group_session',[]);
  check('4. 考古題小組第一次：旁白「（四個人，一張考古題。柏翰按下手機的計時器。）」（附錄 A 第 3 節第 7 點）',J(L)===J(['（四個人，一張考古題。柏翰按下手機的計時器。）'])&&H.G.flags.BOHAN_GROUP_N===1,J(L));
  L=await run('ev_bohan_group_session',[]); check('4. 考古題小組第二次：沒有旁白',L.length===0,J(L));
  L=await run('ev_bohan_group_session',[]);
  check('4. 原本「你第一次在意一個數字。」那一格（BOHAN_GROUP_N＝2）：AA_546 1-3「（寫完，柏翰把每個人的寫法抄在白板上。同一題有四種寫法，都說得通。）」；沒有分數、名字',J(L)===J(['（寫完，柏翰把每個人的寫法抄在白板上。同一題有四種寫法，都說得通。）'])&&!SRC.includes("text:'你第一次在意一個數字。'} ],")&&!SRC.includes('先找的是自己的名字'),J(L)); });

await sec(5,async()=>{
  const tx=texts(ev('ev_y2_typhoon_xu'));
  check('5. 颱風（許教授）：柏翰「教授點名了，我說你可能在睡覺。」、「他也穿襯衫。」；「（私訊柏翰）」照用',tx.includes('教授點名了，我說你可能在睡覺。')&&tx.includes('他也穿襯衫。')&&!tx.some(t=>/我說你在颱風裡|自願的襯衫/.test(t)),J(tx));
  const tk=(ev('ev_y2_typhoon_kai').dialogue||[]).filter(l=>l.phone||l.phoneMe).map(l=>(l.phone?'kai/'+l.phone:'me')+':'+l.text);
  check('5. 颱風（阿凱）手機（BB_167 SC4 #12＋附錄 B P10；AA_519 第 9 節第 1 點滷味）：「我要過去」「外面在下雨」「下雨又怎樣 滷味我都買了」「就當這週的宵夜提早」「今天是週一」「所以咧 颱風天誰管星期幾」',
    J(tk.slice(0,6))===J(['kai/kai:我要過去','me:外面在下雨','kai/kai:下雨又怎樣 滷味我都買了','kai/kai:就當這週的宵夜提早','me:今天是週一','kai/kai:所以咧 颱風天誰管星期幾']),J(tk));
  check('5. 颱風（阿凱）拍照傳方奕廷（P9）：「他真的出門了？」「颱風天欸」',J(tk.slice(-2))===J(['kai/npc_fangyt:他真的出門了？','kai/npc_fangyt:颱風天欸']),J(tk));
  H.fresh('2026-10-19',21.5,'dorm',{ROOM_Y2:1}); let L=await run('ev_y2_typhoon_kai',['遞毛巾']);
  check('5. 颱風（阿凱）遞毛巾：「先擦頭啦，滷味又不會跑。」（AA_519 第 9 節第 1 點），最後旁白「（阿哲和柏翰也各分到一些。學弟說他不吃辣。）」（AA_211 第 2 節【室友】；第 9 節第 1 點子代理改）',L.includes('先擦頭啦，滷味又不會跑。')&&L[L.length-1]==='（阿哲和柏翰也各分到一些。學弟說他不吃辣。）',J(L));
  H.fresh('2026-10-19',21.5,'dorm',{ROOM_Y2:1}); L=await run('ev_y2_typhoon_kai',['傳訊息就好']);
  check('5. 颱風（阿凱）「你可以傳訊息就好。」→「傳訊息你又不會下來。」',L.includes('傳訊息你又不會下來。')&&none(L,/訊息不能吃|先擦泡麵/),J(L));
  check('5. 颱風（阿凱）舊句都不在',!/宵夜不分颱風|颱風天沒有星期幾|先不要擦我|訊息不能吃|他比颱風還堅持/.test(SRC));
  H.fresh('2026-09-20',23,'dorm'); L=await run('ev_kai_sunday_supper',['今天的滷味好吃嗎']);
  check('5. 週日宵夜第一次：「你大一每次都點這三樣，對吧？」（E8）；選「今天的滷味好吃嗎？」→「普通啦。」＋旁白「（他又從你籃子夾走一塊豆干）」（SC4 #13）',
    L.includes('你大一每次都點這三樣，對吧？')&&L.includes('普通啦。')&&L[L.indexOf('普通啦。')+1]==='（他又從你籃子夾走一塊豆干）'&&none(L,/我記得。$|你來比較好吃|這句不要記/),J(L));
  check('5. 週日宵夜第一次的收尾：「下週日一樣喔。」（AA_428 §2 第 8 點：照 SC4 #13；原本 AA_335 T3「下週日，同一時間。我先去排。」）',L[L.length-1]==='下週日一樣喔。'&&!SRC.includes("text:'下週日，同一時間。我先去排。'"),J(L));
  check('5. 週日宵夜的手機（AA_428 §2 第 8 點：SC4 #13，阿凱的訊息不打標點）：第一則「宵夜」「宿舍旁邊那攤滷味比較好吃 老闆會多給豆干」（AA_519 5-4：原本「我這棟樓下的」）、之後每週「宵夜」',
    ST.includes("first?[A('宵夜'),Object.assign(A('宿舍旁邊那攤滷味比較好吃 老闆會多給豆干'),{ask})]:[Object.assign(A('宵夜'),{ask})]")&&!ST.includes("A('我這棟樓下的滷味比較好吃")&&!ST.includes("A('宵夜？'),Object.assign")&&!ST.includes('老闆會多給豆干。'));
  const lines=[]; for(let n=1;n<=3;n++){ H.fresh('2026-09-27',23,'dorm',{KAI_SUP_N:n}); const x=await run('ev_kai_sunday_supper',[]); lines.push(x[1]); }
  check('5. 週日宵夜輪替：「新室友說我話很多。……真的很多嗎？」（SC4 #13）、「這週你們考什麼？……算了，先吃。」（E7）',lines.includes('新室友說我話很多。……真的很多嗎？')&&lines.includes('這週你們考什麼？……算了，先吃。')&&!/那你沒聽過我大一的室友|你們法律系今天念了什麼/.test(SRC),J(lines)); });

await sec(6,async()=>{
  const pd=texts(ev('ev_peishan_decision'));
  check('6. 沛珊我要重考：沒有 NOT_FOR_ME 的開頭「我想了很久，到底要不要繼續念法律。」（E5）；「學姊那時候說她還在想。……我好像想好了。」、#b「……我會說我想當老師。她應該會再問三次。」（SC4 #23）',
    pd.includes('我想了很久，到底要不要繼續念法律。')&&pd.includes('學姊那時候說她還在想。……我好像想好了。')&&pd.includes('……我會說我想當老師。她應該會再問三次。')&&!pd.some(t=>/框外面的人|我想完了|這次我答得出來/.test(t)),J(pd));
  const z7=texts(ev('ev_zhiruo_applied')), q6=texts(ev('ev_ziqing_secret_game')), q7=texts(ev('ev_ziqing_lab_letter'));
  check('6. SC3 #15 芷若 Z7 選「不會。」：單身「……你說的喔。」、有伴侶「……嗯。謝謝。」（兩版都接「今天的咖啡我請。」）',z7.includes('……你說的喔。')&&z7.includes('……嗯。謝謝。')&&z7.includes('今天的咖啡我請。')&&!z7.some(t=>/我會當真|先不要怕/.test(t)),J(z7));
  check('6. SC3 #15 子晴 Q6 better：單身「……真的？那第二關做好，你再幫我玩。」（AA_525 1-2 改句，原「……真的？那你下禮拜再來，幫我玩第二關。」）、交往中「好，那我把它做完。做完你再玩一次。」',q6.includes('……真的？那第二關做好，你再幫我玩。')&&q6.includes('好，那我把它做完。做完你再玩一次。')&&!q6.some(t=>/我會當真|我會真的把它做完/.test(t)),J(q6));
  check('6. SC3 #14 子晴 Q7 選項 a：「可是不進去的話，我要怎麼回？他是我爸的同學欸。」',q7.includes('可是不進去的話，我要怎麼回？他是我爸的同學欸。')&&!q7.some(t=>/那我很蠢/.test(t)),J(q7)); });

await sec(7,()=>{
  check('7. FAFU_BH：第一句「班表排好了。你下次跟雅筑學姊同一桌。」（AA_428 §2 第 7 點；雅筑學姊在 S.FAFU_OPEN）、第二句「垃圾袋用完了，下次值班誰順便買？」（和 bh_handover 的回覆不重複）',
    J(STORY.FAFU_BH)===J(['班表排好了。你下次跟雅筑學姊同一桌。','垃圾袋用完了，下次值班誰順便買？'])&&STORY.FAFU_OPEN.some(x=>x[0]==='雅筑學姊'),J(STORY.FAFU_BH));
  check('7. plg_torn 以安：「週六下午補讀，規則剩三條。」',ST.includes("N('heroine_01','週六下午補讀，規則剩三條。')")&&!ST.includes('剩下的那一半是對的'));
  check('7. y2_zr_order（P8）：芷若兩則「今天有個常客點了熱美式。」「他上禮拜都點拿鐵。我差點問他怎麼了。」',ST.includes("seq('heroine_02',['今天有個常客點了熱美式。','他上禮拜都點拿鐵。我差點問他怎麼了。'])")&&!ST.includes('今天第三個客人點錯'));
  check('7. y2_kx_hand（P7）：可昕「你記得喔。尾巴我還留著。」',ST.includes("text:'你記得喔。尾巴我還留著。'")&&!ST.includes('你記得。很好。尾巴還在等。')); });

await sec(8,()=>{
  const r=id=>J(NM(id).resp), m=id=>J(NM(id).msg);
  check('8. 以安 an_lib「好，我四點過去，幫我留個位子。」、an_admin「好，我先看這兩段。」',r('an_lib')===J(['好，我四點過去，幫我留個位子。'])&&r('an_admin')===J(['好，我先看這兩段。']),r('an_lib')+r('an_admin'));
  check('8. 語彤 yt_auntie「好，我跟她說。」',r('yt_auntie')===J(['好，我跟她說。']),r('yt_auntie'));
  check('8. 芷若 zr_beans：w[14,15]（P6：16 週制第 16 週的週四是 12/31，已經放寒假）、訊息「店裡進了新的豆子」「比較酸一點 你想喝喝看嗎」、回覆「好 週四我上班」「來的時候跟我說 我幫你留一杯」（SC5 #27）',
    J(NM('zr_beans').w)===J([14,15])&&m('zr_beans')===J(['店裡進了新的豆子','比較酸一點 你想喝喝看嗎'])&&r('zr_beans')===J(['好 週四我上班','來的時候跟我說 我幫你留一杯']),m('zr_beans')+r('zr_beans'));
  { const e=NM('zq_game'), v=e.vars[0];
    check('8. 子晴 zq_game 試玩過的（AA_428 §2 第 6 點：拿掉「這不是問句」）：「你現在有空嗎」「幫我測一下遊戲」；resp「傳了」「第三關不要跳 我就是要看那邊」、miss 照現行',
      m('zq_game')===J(['你現在有空嗎','幫我測一下遊戲'])&&r('zq_game')===J(['傳了','第三關不要跳 我就是要看那邊'])&&J(e.miss)===J(['測遊戲那則你沒回。','……第三關我自己測了。我自己都卡住。']),m('zq_game')+r('zq_game'));
    check('8. 子晴 zq_game 沒試玩過的整則換（AA_428 §2 第 6 點）：msg「幫我看一個東西」「現在」「……你有空吧」、resp「傳了」「第三張不要跳過 我就是要問那張」、miss「那則你沒回」「……算了 我自己看」',
      J(v.msg)===J(['幫我看一個東西','現在','……你有空吧'])&&J(v.resp)===J(['傳了','第三張不要跳過 我就是要問那張'])&&J(v.miss)===J(['那則你沒回','……算了 我自己看']),J(v));
    H.fresh('2026-09-13',21,'dorm'); const G=H.G, v0=STORY.neededVar(G,e), miss0=STORY.neededMissFor(G,e,'heroine_04');
    SOCIAL.remember('heroine_04','PLAYTESTED','test'); const v1=STORY.neededVar(G,e), miss1=STORY.neededMissFor(G,e,'heroine_04');
    check('8. zq_game 程式：沒試玩過＝換的那一版（訊息、回應、沒回的那一句都換）；試玩過＝主版（STORY.neededVar／neededMissFor）',
      v0===v&&J(miss0)===J(['那則你沒回','……算了 我自己看'])&&!v1.msg&&J(miss1)===J(['測遊戲那則你沒回。','……第三關我自己測了。我自己都卡住。']),J([miss0,miss1])); }
  check('8. SC5 #3：zq_dad「你又不認識他」「好啦 謝啦」、zq_song「可以欸」「先用這個」、ps_q「謝謝！不要太難喔 上次大家寫超久」、fy_quiet「你也在那喔」「好啊 那我去」、kx_example「這個好」「答案我自己查」、kx_yule「好 就這個」',
    r('zq_dad')===J(['你又不認識他','好啦 謝啦'])&&r('zq_song')===J(['可以欸','先用這個'])&&r('ps_q')===J(['謝謝！不要太難喔 上次大家寫超久'])&&r('fy_quiet')===J(['你也在那喔','好啊 那我去'])&&r('kx_example')===J(['這個好','答案我自己查'])&&r('kx_yule')===J(['好 就這個']));
  check('8. SC5 #3：ps_plan 訊息第二則「你會覺得我瘋了嗎」',m('ps_plan')===J(['重考的讀書計畫，我排到明年七月。','你會覺得我瘋了嗎']),m('ps_plan'));
  check('8. SC5 #22：mx_toefl「哈哈 好 我試試看」、zq_name「哈哈哈好爛」「先當暫定的」',r('mx_toefl')===J(['哈哈 好 我試試看'])&&r('zq_name')===J(['哈哈哈好爛','先當暫定的']),r('mx_toefl')+r('zq_name'));
  check('8. SC5 #23：fy_plant「那就好」「黃金葛很難養死 葉子黃了再跟我說」、fy_sign「好 那我走另一條」「多一個小時而已」',r('fy_plant')===J(['那就好','黃金葛很難養死 葉子黃了再跟我說'])&&r('fy_sign')===J(['好 那我走另一條','多一個小時而已']),r('fy_plant')+r('fy_sign'));
  check('8. characters.js Alison partner 的註解：保底第 15 週＝12/14 那週（程式 fromWeek 15）',CH.includes('保底：大二上第 15 週＝12/14 那週')&&!CH.includes('保底：大二上第 13 週')&&CHARACTERS.yu.partner.fromWeek&&CHARACTERS.yu.partner.fromWeek.week===15,J(CHARACTERS.yu.partner.fromWeek)); });

await sec(9,()=>{
  /* 被後來的改稿換掉的列：3d4d1969 的原句已經不在＝不動，現在的句子照留（列給 AA）*/
  const has=t=>SRC.includes(t);
  check('9. 3-3 以安「考完的題目，不要對答案。改不了。」照現行（AA_428 §2 第 2 點）；柏翰改了＝第 1 節',has("text:'考完的題目，不要對答案。改不了。'")&&has("text:'（說完，她自己翻開課本查了一題。）'"));
  check('9. 3-1 阿哲「（三秒後）阿姨，大碗。」（AA_313 5-3）照留',has("text:'（三秒後）阿姨，大碗。'"));
  check('9. 博覽會：柏翰「……順序對了。」（AA_374 第 6 項）、阿哲「哥，你站這裡。…」「欸，你站這裡。…」（AA_374 第 7 項）、Alison「欸{name}你負責發傳單！…」（AA_313 5-4）照留',
    has("text:'……順序對了。'")&&has("text:'哥，你站這裡。身高夠，看起來很會打。'")&&has("text:'欸，你站這裡。身高夠，看起來很會打。'")&&has("text:'欸{name}你負責發傳單！對了你會彈哪首？……三個和弦也行啦。'"));
  check('9. 系籃明軒（AA_374 第 16 項、AA_313 5-7）：「（接住水）謝啦。」「這瓶 CP 值最高。……免費的。」「（擦汗）我上場六分鐘，摸到球三次。……賺很大。」照留（BB_181 #3 不換）',
    has("text:'（接住水）謝啦。'")&&has("text:'這瓶 CP 值最高。……免費的。'")&&has("text:'（擦汗）我上場六分鐘，摸到球三次。……賺很大。'"));
  check('9. 聖誕以安（AA_313 4-3）「跟我用的同一款。你不用寫得很整齊。」照留（AA_428 §2 第 8 點「用 AA_416」：AA_416 只有單獨約會的以安聖誕，團體交換這一句沒寫）',has("text:'跟我用的同一款。你不用寫得很整齊。'"));
  check('9. 沛珊 #a「嗯。考試這件事不難。」「難的是回家，跟我爸媽講。」照現行（AA_428 §2 第 8 點：現行版有後來的來源 AA_313 6-4）',has("text:'嗯。考試這件事不難。'")&&has("text:'難的是回家，跟我爸媽講。'")&&!SRC.includes("text:'嗯。考試我不怕。'"));
  check('9. 週日宵夜輪替「今天我多夾了一顆貢丸。」照留（AA_428 §2 第 8 點只改第一則、每週那則、收尾＝第 5 節）',has("'今天我多夾了一顆貢丸。'"));
  check('9. 最後一頓「（以安在手帳上寫：「大二上：完成」。）」照現行（AA_428 §2 第 9 點）；博覽會「……這句，是學姊的。」確認刪掉（第 3 點）',has("text:'（以安在手帳上寫：「大二上：完成」。）'")&&!SRC.includes('這句，是學姊的'));
  check('9. 語彤 ev_yutong_midterm_week（AA_374 第 9 項：只在大一下、和 ev_yutong_thanks 互斥）「你那週來過麵店，阿姨跟你講了吧。」照留',has("text:'你那週來過麵店，阿姨跟你講了吧。'")&&J(ev('ev_yutong_midterm_week').term)===J(['Y1S2']));
  check('9. 芯慈：ev_xinci_second 週次 [12..15]（AA_374 第 10 項）照留；xc_contract 在大二下（AA_313 5-6），回覆照留',J(ev('ev_xinci_second').weeks)===J([12,13,14,15])&&NM('xc_contract').term==='Y2S2');
  check('9. needed：yt_floor（AA 後來改「三樓」「阿姨以為我在家讀。」）、yu_overtime（「……你講話好像法服的學長。好，我叫她去。」）、yt_fafu（AA_255）照留',
    J(NM('yt_floor').resp)===J(['好。……阿姨以為我在家讀。'])&&J(NM('yu_overtime').resp)===J(['……你講話好像法服的學長。好，我叫她去。'])&&J(NM('yt_fafu').resp)===J(['……我習慣坐最後一排。你坐過來。']));
  check('9. 不在遊戲裡的路線不動：FAFU_YT（語彤不在法服，STORY.YT_FAFU 固定 no）、退休的 ev_y2_yt_duty、ev_sis_collapse',STORY.FAFU_YT[0]==='……阿伯又來了。他每次都帶橘子。'&&STORY.YT_FAFU==='no'&&!!ev('ev_y2_yt_duty').retired&&!!ev('ev_sis_collapse').retired); });

H.done();
})();
