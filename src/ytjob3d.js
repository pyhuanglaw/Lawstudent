/* ===== 語彤：只有在一盞茶屋打工當同事才會認識（AA_610，STORY-JOB-COWORKER-ROMANCE-1103；AA_624 照舊）=====
   使用者 11-03：「我希望有至少一個除了法律系女主角的可攻略對象，是只能透過打工當同事認識」→「語彤」；「兩人在溫州街同一家店打工」「認識了才有」。
   - YT_MET_JOB：在一盞茶屋上第一班、遇到她（她週六、日 13:00～17:00 都在）＝這一班的開頭（接在蘇姨「水不要滾太久。滾久了，水就老了。」之後）演 AA_610 第 2 節，
     收店那兩句在三段工作之後（JOBS.SHIFT_EV）；演完記 YT_MET_JOB、SOCIAL.meet heroine_03（where tea）、熟悉 +2。
   - 認識以前，她的入口全部關著（每一個入口的擋法見 tests/aa610_ytjob_unit.js 的清單）：
     ①事件：participants 有 heroine_03 的不演（events3d.js X.check）；②作息：不在遊戲裡（story3d.js schedEnt）；③認不認識（STORY.knows）＝不認識：
       閒聊階梯、邀約、別人轉述（heard、圈子）、期末飯、偶遇、出遊、動態、人物頁都看這個；④記憶、見面（SOCIAL.remember／meet）不記；
     ⑤手機：她傳的、她的私訊串、群組裡她說的那一句都不送（PHONE.at／post；一則都不剩＝記成傳過，認識以後不補舊的）。
   - 舊存檔：已經認識她（FIRST_MET、met_heroine_03、熟悉度不是陌生人）＝讀檔記 YT_MET_JOB（照舊，GM.migrate 叫 YTJOB.migrate）。
   - 她從來不在燒臘店（AA_624；schedEnt 擋 zone noodle）。原本麵店的作息（週二、四顧店、大二起週六備料、2029 暑假週四）拿掉，改週六、日 13～17 在一盞茶屋（characters.js）。
   一起上班時的小對話（AA_610 第 3 節）、AA_624 的新事件：AA_625 的台詞來了再做，這裡還沒做。測試：node tests/aa610_ytjob_unit.js */
'use strict';
const YTJOB=(function(){
  const S={}, YT='heroine_03';
  S.met=G=>!!(G&&G.flags&&G.flags.YT_MET_JOB);
  /* 舊存檔：已經認識的照舊 */
  S.wasMet=function(s){ if(!s) return false; const F=s.flags||{}; if(F.YT_MET_JOB||F.met_heroine_03) return true;
    const M=s.social&&s.social.mem&&s.social.mem[YT]; if(Array.isArray(M)&&M.some(m=>m&&m.tag==='FIRST_MET')) return true;
    const R=s.social&&s.social.rel&&s.social.rel[YT]; if(R&&((R.fam|0)>=5||(R.trust|0)>0)) return true;   /* 熟悉度不是陌生人（SOCIAL.friendLevel：fam 5 以上＝ACQUAINTANCE）*/
    if(F.dating_heroine_03||F.EX_heroine_03) return true; return false; };
  /* YT_JOB_V：這一版以後的新遊戲（game3d.js defaults）＝不用看（認識她一定是在茶屋記的）；舊存檔看一次就記上 */
  S.migrate=function(s){ if(!s||!s.flags||typeof s.flags!=='object') return false; const F=s.flags; if(F.YT_JOB_V) return false; F.YT_JOB_V=1; if(F.YT_MET_JOB||!S.wasMet(s)) return false; F.YT_MET_JOB=true; return true; };
  /* 第一班（AA_610 第 2 節；台詞一字照稿）*/
  S.A=[ [null,'（水屋裡，一個綁馬尾的女生正在一個一個擦茶杯。）'], ['蘇姨','語彤，他今天第一天。妳帶他。'], [YT,'……嗯。'], [YT,'客人坐下先給水，不要先問點什麼。他們會自己看。'],
    {choice:[{t:'「好。」',say:[[null,'（她點了一下頭，回去擦杯子。）']]},{t:'「妳在這裡做多久了？」',say:[[YT,'高三暑假開始。']]}]} ];
  S.B=[ [null,'（一個下午下來，她跟你講的話不超過十句。）'], [null,'（收店的時候，她倒了一杯剩下的烏龍茶，放在你旁邊。）'], [YT,'第一天都這樣。下週就順了。'] ];
  S._pend=null;
  S.firstShift=async function(GM,ctx){ const G=GM.G; if(S.met(G)||typeof JOBS==='undefined'||!JOBS.play) return false; await JOBS.play(GM,S.A.slice(0,2));
    G.flags.YT_MET_JOB=true; if(typeof SOCIAL!=='undefined') SOCIAL.meet(YT,'tea');   /* 蘇姨叫了她的名字＝從這裡起對話框寫「語彤」（不然寫「不認識的女生」）；YT_MET_JOB 同時記 */
    await JOBS.play(GM,S.A.slice(2)); S._pend=G.day; return true; };
  S.closeShift=async function(GM,k){ const G=GM.G; if(k!=='tea'||S._pend!==G.day) return false; S._pend=null; await JOBS.play(GM,S.B);
    if(typeof SOCIAL!=='undefined'){ const r=SOCIAL.rel(YT); r.fam=(r.fam|0)+2; } return true; };
  /* ===== AA_625（語彤新版事件台詞，企劃線 9ba14498e；AA 定稿 D109，一字照稿）在茶屋的班上演的幾場 =====
     - TEA_SHIFTS：和她一起上過的班（AA_630 第 1 節的暫名＝這個旗標；認識以後每一班茶屋的班 +1，第一班也算）；JOB_TEA：祐廷在一盞打工（JOBS.at(G,'tea')，S.sync 每一班同步）。
     - 貓（第三個班打烊，YT_CATS、YT_FAMILY_HEARD）；3' 第一次領薪水（大一上第 8 週週日以後第一個班打烊，YT_FIRST_PAY）；茶屋平常的班（一班最多一句，輪流）；
       4 她今天沒來（大一下第 9 週週日的班，她請假）＋10' 媽媽發現（大一下第 9 週週六的班 15:30；不在場的下一班蘇姨轉述；第 10 週以後第一個班打烊她說；YT_PARENTS_KNOW）。 */
  const wdOf=d=>typeof CALENDAR!=='undefined'?CALENDAR.dateOf(d).wd:0, termW=d=>typeof CALENDAR!=='undefined'?CALENDAR.termOf(d):null;
  const at=(G,term,week,wd)=>{ const t=termW(G.day); return !!t&&t.id===term&&t.week===week&&(wd==null||wdOf(G.day)===wd); };
  const afterW=(G,term,week)=>{ const t=termW(G.day); if(!t) return false; const ord=['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2']; const a=ord.indexOf(t.id), b=ord.indexOf(term); return a>b||(a===b&&t.week>=week); };
  const ch=async(GM,opts)=>{ const k=await GM.choose(opts.map(o=>({t:o.t}))); const o=opts[k]||opts[0]; if(o.say) await JOBS.play(GM,o.say); if(o.fn) await o.fn(); return k; };
  S.sync=G=>{ if(!G||!G.flags) return; const j=typeof JOBS!=='undefined'&&JOBS.at?JOBS.at(G,'tea'):null; G.flags.JOB_TEA=!!j; };
  S.CATS={ ask:[[YT,'……嗯。你下班有事嗎？'],[YT,'要不要一起去找公園的貓？大安森林公園那邊，晚上會有好幾隻出來。']], no:[[YT,'嗯。下次。']],
    a:[[null,'（公園的長椅旁邊，一隻橘貓從草叢裡走出來，在語彤腳邊坐下。）'],[YT,'牠每天都在這裡。我叫牠「橘子」。……很普通的名字。'],[null,'（她蹲下來，摸了摸貓的頭。）'],[YT,'我很想養一隻。'],['player','那就養啊。'],[YT,'我一個人住。白天上課、週末打工，牠會常常自己待在家。'],[YT,'……那樣不好。']],
    b:[[YT,'嗯。我是新北人，家在淡水。'],[YT,'我爸媽離婚了。上大學以前，我跟我媽住。'],[YT,'淡水到學校太遠，我媽就在學校附近買了房子給我住。'],[YT,'晚上有一個阿姨會來煮飯。秀琴姨。……她煮的比茶屋的點心好吃。蘇姨的點心是買的。'],
      [null,'（橘子吃完你們帶來的小魚乾，走回草叢裡。）'],[null,'（你沒有再問。你們坐著看橘子走遠，坐到十點。）'],[YT,'……謝謝你陪我找貓。']] };
  S.cats=async function(GM){ const G=GM.G, F=G.flags; if(F.YT_CATS||F.YT_CATS_NO) return false; await JOBS.play(GM,S.CATS.ask);
    const k=await ch(GM,[{t:'「好啊。」'},{t:'「今天不行。」',say:S.CATS.no}]); if(k===1){ F.YT_CATS_NO=true; return true; }   /* 不記；之後的班不再問（第一次去她家可以補聽到）*/
    await JOBS.play(GM,S.CATS.a); await ch(GM,[{t:'「妳一個人住喔？」'}].concat(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(YT,'SHARED_UMBRELLA')?[{t:'「妳家不是在新生南路嗎？」'}]:[])); await JOBS.play(GM,S.CATS.b);
    F.YT_CATS=true; F.YT_FAMILY_HEARD=true; if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(YT,'YT_CATS',''); if(GM.advance&&G.hour<22) GM.advance(22-G.hour); return true; };
  S.PAY={ a:[[null,'（打烊。蘇姨把兩個薪水袋放在吧檯上，一個寫你的名字，一個寫「語彤」。）'],['蘇姨','這個月的。辛苦了。'],[null,'（你拆開數了一下。語彤沒有拆，把袋子翻過來又翻回去。）'],['蘇姨','語彤每次都這樣。拿了也不拆。'],[YT,'……嗯。我第一次拿到自己賺的錢，是去年暑假。那一包我也沒拆。']],
    opts:[{t:'「那就留著。」',say:[[YT,'嗯。放在抽屜裡。']]},{t:'「請我喝一杯？」',say:[[YT,'好。不過是我請你，不是用這個。'],[null,'（她從錢包拿錢，薪水袋放回背包。）']]},{t:'「為什麼不拆？」',say:[[YT,'拆了就會花掉。……花掉就不知道它長什麼樣子了。']]}] };
  S.firstPay=async function(GM){ const G=GM.G; if(G.flags.YT_FIRST_PAY) return false; await JOBS.play(GM,S.PAY.a); await ch(GM,S.PAY.opts); G.flags.YT_FIRST_PAY=true; return true; };
  /* 茶屋平常的班：蘇姨、語彤輪流，一班最多一句（「這間店第七年了」大一；之後每年加一年，大四上十週年）*/
  S.SHIFT_LINES=[[['蘇姨','水溫不要太高，烏龍會苦。']],[['蘇姨','語彤第一天來，把整壺茶倒在自己身上。你比她好。'],[YT,'……那壺很燙。']],[['蘇姨','這間店第七年了。']],[[YT,'客人坐下先給水。他們會自己看菜單。']],[[YT,'常來的那位阿伯每次都點一樣的。你不用問。']]];
  const YEARN=['','七','八','九','十'];
  S.shiftLine=function(G){ const F=G.flags, i=(F.YT_SHIFT_LINE|0)%S.SHIFT_LINES.length; F.YT_SHIFT_LINE=(F.YT_SHIFT_LINE|0)+1; const t=termW(G.day), y=t?(+String(t.id).charAt(1)||1):1;
    return S.SHIFT_LINES[i].map(x=>x[1]==='這間店第七年了。'&&y>1?[x[0],'這間店第'+YEARN[Math.min(4,y)]+'年了。']:x); };   /* 第七年那一句照學年改字（稿：之後每年加一年）*/
  /* 4 她今天沒來／10' 媽媽發現 */
  S.MOM={ ab:[[null,'（吧檯後面只有蘇姨。）'],['蘇姨','語彤今天請假。她說家裡有事。'],['蘇姨','這孩子很少請假的。']],
    here:[[null,'（門口的風鈴響了。一位穿著套裝的女士站在門口，沒有進來。）'],[null,'（語彤端著茶盤轉身，看到她，停住了。）'],[YT,'……媽。'],[null,'（語彤的媽媽看了店裡一圈，又看了女兒手上的茶盤。）'],['語彤的媽媽','我在外面等妳下班。'],[null,'（她走出去，站在對面的騎樓下。一直等到五點。）']],
    told:[['蘇姨','上禮拜她媽媽來了，站在門口等她下班。……兩個人走的時候都沒講話。']],
    back:[[YT,'……嗯。上禮拜那個是我媽。她臨時來找我，樓下警衛跟她說我在這裡。'],[YT,'她說，我讓妳來台北是念書的，不是端茶的。'],[YT,'她說，妳要不要再考一次牙醫。'],[YT,'我說，這是我自己選的。'],[YT,'她說隨便我。……她沒有說隨便我，可是我就當她說了。']],
    opts:[{t:'「那妳還要做嗎？」',say:[[YT,'要。我才做一年。']]},{t:'「妳想考牙醫嗎？」',say:[[YT,'不想。……我想知道別人怎麼過日子。']]},{t:'（不說話，幫她把杯子收完。）',say:[[null,'（你們收完杯子。她說：「謝謝。」）']]}],
    fam:[[YT,'我媽在淡水開牙醫診所。……我一個人住學校對面，是她買的房子。']] };
  /* AA_625 第 6 節「房東來過了」在茶屋聽她說（YT-REWRITE-1103）：大一下第 10 週以後、她回來上班那一班（10'）之後的下一個週末班打烊；記 RENT_RUMOR，ev_yutong_landlord 記成演過（舊的麵店版退場，接它的訊息、邀約照舊讀「演過」）。
     「在她家當面」那一版要 YT_HOME_SEEN（交往以後才去得到她家），大一下幾乎不會有——還沒做，列給 AA／LAWWW */
  S.RENT=[[YT,'……嗯。昨天秀琴姨煮完飯，沒有馬上走。'],[YT,'她說她的房東要把房子賣了。她住了十四年。'],[YT,'賣了她要住哪裡。……她問我，我也不知道。'],['player','我上課有聽過，房子賣了租約不一定就沒了。我再查。'],[YT,'嗯。你查到再跟我說。']];
  S.rentOpen=G=>afterW(G,'Y1S2',10)&&!afterW(G,'Y2S2',6);   /* AA 11-03 回 LAWWW：事件 6 兩版都在大二下第 5 週結束前（事件 8 在第 6 週）；過了還沒聽過＝沒有事件 6 */
  S.rentDue=G=>{ const F=G.flags; return S.rentOpen(G)&&!!F.YT_MOM_BACK&&F.YT_MOM_BACK!==G.day&&!(G.events&&G.events.done&&G.events.done.ev_yutong_landlord)&&!(typeof SOCIAL!=='undefined'&&SOCIAL.has&&SOCIAL.has(YT,'RENT_RUMOR')); };
  S.rent=async function(GM){ const G=GM.G; await JOBS.play(GM,S.RENT); if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(YT,'RENT_RUMOR','秀琴姨的房東要把房子賣了'); (G.events.done=G.events.done||{}).ev_yutong_landlord=G.day; return true; };
  /* AA_625 第 11 節「想幫秀琴姨」（開頭照 AA_643 第 1 節：蘇姨先走了）：大二下第 15 週以後的週末班打烊、要 RENT_CONSULTATION；取代 y2r2_3d.js 的 ev_yt_help_dishes（AA_643 第 7 節），演完記 YT_HELP_OFFERED。
     選①吵架（記 YT_FIGHT）→ 兩週後的週末班她道歉（記 APOLOGIZED）；②不吵、不記 APOLOGIZED；③她笑了一下 */
  S.HELP={ open:[[null,'（打烊。蘇姨先走了。語彤在數今天的零錢，數到一半停下來。）'],[YT,'我想幫秀琴姨付新房子的押金。萬一到期真的要搬。'],[YT,'我跟她說了，她不收。']],
    a:[[YT,'那她要什麼？'],[null,'（她的聲音第一次變大）'],[YT,'我有的就只有錢。']], a2:{t:'「她要的是可以不用搬。」',say:[[YT,'……我知道。'],[null,'（她把零錢收好，先走了。）']]},
    b:[[YT,'什麼方法？'],['player','陪她準備續約。'],[YT,'……嗯。這個她會收。']],
    c:[[YT,'好意她也不收。'],[null,'（她笑了一下）'],[YT,'她跟我媽很像。……不對，一點都不像。']],
    sorry:[[YT,'上次……你說得對。她要的是可以不用搬。我不應該拿錢去堵。']] };
  const ytHas=t=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(YT,t), ytMem=(t,n)=>{ if(typeof SOCIAL!=='undefined'&&SOCIAL.remember) SOCIAL.remember(YT,t,n); };
  S.helpDue=G=>afterW(G,'Y2S2',15)&&!G.flags.YT_EV11B&&ytHas('RENT_CONSULTATION');
  S.help=async function(GM){ const G=GM.G, F=G.flags; F.YT_EV11B=G.day; F.YT_HELP_OFFERED=true; await JOBS.play(GM,S.HELP.open);
    const k=await GM.choose([{t:'「我覺得她要的不是錢。」'},{t:'「那就換一個她會收的方法。」'},{t:'「妳是好意。」'}]);
    if(k===0){ await JOBS.play(GM,S.HELP.a); await ch(GM,[S.HELP.a2]); ytMem('YT_FIGHT','想幫秀琴姨付押金那天'); F.YT_FIGHT_DAY=G.day; }
    else if(k===1) await JOBS.play(GM,S.HELP.b); else await JOBS.play(GM,S.HELP.c); return true; };
  const fieldAway=G=>{ const a=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2027-07-19'):null, b=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2027-07-31'):null; return a!=null&&b!=null&&G.day>=a&&G.day<=b; };   /* 台東田野那兩週（AA_549 2-7）*/
  S.sorryDue=G=>{ const d=G.flags.YT_FIGHT_DAY; return typeof d==='number'&&G.day>=d+14&&!G.flags.YT_EV11B_SORRY&&!fieldAway(G); };   /* AA_643 第 9-3 節：落在 7/19～7/31 就順延到她回來後的第一個班 */
  S.sorry=async function(GM){ const G=GM.G; G.flags.YT_EV11B_SORRY=G.day; await JOBS.play(GM,S.HELP.sorry); ytMem('APOLOGIZED','她說「上次……你說得對。」'); return true; };
  S.momDay=G=>at(G,'Y1S2',9,6); S.absentDay=G=>at(G,'Y1S2',9,7);   /* 第 9 週週六媽媽來（她在班上）、週日她請假 */
  S.absent=G=>!!G&&typeof CALENDAR!=='undefined'&&S.absentDay(G);   /* story3d.js schedEnt：那一天她不在茶屋 */
  S.momKnown=G=>{ const F=G.flags; if(!F.YT_PARENTS_KNOW&&F.YT_MET_JOB&&afterW(G,'Y1S2',9)&&!S.momDay(G)) F.YT_PARENTS_KNOW=true; };   /* 第 9 週週六過了＝她媽媽已經知道（玩家沒去上班也一樣）*/
  /* 一班的中間（第二段工作之後）：10' 在場版；收店（SHIFT_EV）：其他 */
  S.midShift=async function(GM,k){ const G=GM.G, F=G.flags; if(k!=='tea'||!S.met(G)) return false;
    if(S.momDay(G)&&!F.YT_MOM_SEEN){ F.YT_MOM_SEEN=true; F.YT_MOM_HERE=true; await JOBS.play(GM,S.MOM.here); return true; }
    if(S.absentDay(G)&&!F.YT_ABSENT_SEEN){ F.YT_ABSENT_SEEN=true; await JOBS.play(GM,S.MOM.ab); return true; }
    if(afterW(G,'Y1S2',10)&&!F.YT_MOM_HERE&&!F.YT_MOM_TOLD&&!F.YT_MOM_BACK){ F.YT_MOM_TOLD=true; await JOBS.play(GM,S.MOM.told); return true; }
    if(!S.absentDay(G)) await JOBS.play(GM,S.shiftLine(G)); return false; };
  S.closeExtra=async function(GM,k){ const G=GM.G, F=G.flags; if(k!=='tea'||!S.met(G)||S.absentDay(G)) return false; S.sync(G); S.momKnown(G);
    F.TEA_SHIFTS=(+F.TEA_SHIFTS||0)+1;
    if(afterW(G,'Y1S2',10)&&!F.YT_MOM_BACK){ F.YT_MOM_BACK=G.day; await JOBS.play(GM,S.MOM.back); await ch(GM,S.MOM.opts); if(!F.YT_FAMILY_HEARD){ await JOBS.play(GM,S.MOM.fam); F.YT_FAMILY_HEARD=true; } F.YT_PARENTS_KNOW=true; return true; }
    if(S.rentDue(G)) return S.rent(GM);   /* AA_625 第 6 節 */
    if(S.essayDue(G)) return S.essay(GM);   /* AA_643 第 10 節（15b 當面）*/
    if(S.sorryDue(G)) return S.sorry(GM);   /* AA_625 第 11 節：兩週後的週末班 */
    if(S.helpDue(G)) return S.help(GM);   /* AA_625 第 11 節 */
    if(!F.YT_FIRST_PAY&&afterW(G,'Y1S1',8)&&(!at(G,'Y1S1',8)||wdOf(G.day)===7)) return S.firstPay(GM);   /* 第 8 週週日（或之後第一個班）打烊 */
    if(F.TEA_SHIFTS===3) return S.cats(GM);   /* 祐廷第三次上班（和她一起的第三個班）打烊 */
    return false; };
  /* ===== AA_625「第一次去她家」（交往以後才有；YT-REWRITE-1103）＋事件 6「在她家當面」版（AA_643 第 5 節：要 YT_HOME_SEEN、那天傍晚在她家）=====
     觸發：和她交往以後的第一個平日（週一～五）傍晚 17:00 她私訊「……今天秀琴姨煮很多。你要不要來吃。」→「好。」＝當天 18:30 去她家（2D：新生南路，沒有 3D 的家＝dark＋字幕）；
     「今天不行。」＝不說話，下一個平日再問一次。演完記 YT_HOME_SEEN。17:00 傳、18:30 到是 LAWWW 子代理定的時間（AA_625 只寫「平日傍晚」，交 AA 確認）*/
  const romR=(G,id)=>((G&&G.flags&&G.flags.romance)||{})[id]||null;
  const datingYT=G=>{ const F=(G&&G.flags)||{}, R=romR(G,YT); return F['dating_'+YT]===true||!!(R&&R.status==='dating'); };
  const ytHas2=t=>typeof SOCIAL!=='undefined'&&!!SOCIAL.has&&SOCIAL.has(YT,t);
  S.HOME_INV=['……今天秀琴姨煮很多。你要不要來吃。'];
  S.homeRentDue=G=>S.rentOpen(G)&&!(G.events&&G.events.done&&G.events.done.ev_yutong_landlord)&&!ytHas2('RENT_RUMOR');   /* 事件 6 還沒在茶屋聽過 */
  S.homePhone=function(G){ const F=G.flags; if(!F||F.YT_HOME_SEEN||!datingYT(G)||typeof PHONE==='undefined'||typeof OUT==='undefined') return;
    const R=romR(G,YT), since=R&&typeof R.sinceDay==='number'?R.sinceDay:null, wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:0, h=((+G.hour||0)%24+24)%24;
    if(since!=null&&G.day<=since) return; if(wd<1||wd>5||h<17||h>=18.5) return;   /* 交往以後的平日傍晚（開始那一天不算）*/
    { const p=typeof STORY!=='undefined'&&STORY.presence?STORY.presence(YT,G):null; if(p&&p.here===false) return; }   /* AA_667 H7：她不在臺北（宜蘭田野收不到訊號、寒暑假平日回淡水）不約你去她家吃飯 */
    if(typeof AA667!=='undefined'&&AA667.ytHomeSkip&&AA667.ytHomeSkip(G)) return;   /* AA_667 7-4：日本路線 8/8（她在臺北的例外）＝8/7 那串已經約了這一天，這則不另外傳 */
    const tag='yt_home_'+G.day; if(PHONE.sent(G,tag)||OUT.get(G,'yt_home_first')) return; if(F.YT_HOME_ASK===G.day) return; F.YT_HOME_ASK=G.day;
    PHONE.at(G,G.day,17,[{th:'p:'+YT,from:YT,text:S.HOME_INV[0],ask:{id:tag,until:G.day*24+18.5,opts:[{t:'好。',set:{YT_HOME_GO:G.day}},{t:'今天不行。'}]}}],tag); };
  S.homePlan=function(G){ const F=G.flags; if(!F||F.YT_HOME_SEEN||F.YT_HOME_GO!==G.day||typeof OUT==='undefined'||OUT.get(G,'yt_home_first')) return;
    OUT.plan(G,{id:'yt_home_first',ev:'ev_yt_home_first',day:G.day,h:18.5,late:0.5,place:'新生南路・她家',title:'去語彤家吃飯',travel:'走過去約 10 分鐘',travelH:1/6,alarm:true}); };
  S.HOME_EV={ id:'ev_yt_home_first', title:'第一次去她家', participants:[YT], location:'any', trigger:'outing', once:true, background:'dark', hours:2,
    prereq:{custom:G=>!G.flags.YT_HOME_SEEN},
    dialogue:[ {scene:'新生南路・她家',bg:'dark'},
      {speaker:null,text:'（新生南路、學校對面的大樓。電梯到七樓。）'},
      {speaker:null,text:'（兩房一廳。客廳很大，只有一張長桌、一張沙發。另一間房間的門開著，裡面堆滿書和紙箱。廚房裡，一個阿姨在盛湯。）'},
      {speaker:'秀琴姨',text:'你就是祐廷喔？坐、坐。'},
      {speaker:YT,text:'……嗯。這是秀琴姨。'},
      {speaker:'秀琴姨',text:'她都不帶人回來。……我多煮一碗飯。'},
      {speaker:YT,text:'秀琴姨。'},
      {call:async(G,GM)=>{ if(typeof AA667!=='undefined'&&AA667.ytHomeHead) await AA667.ytHomeHead(GM); }},   /* AA_667 2-2：日本路線 8/7 約的 8/8 那一頓＝秀琴姨那一問（src/aa667_3d.js）*/
      /* 事件 6「在她家當面」（AA_625 第 6 節；AA_643 第 5 節保留）：大一下第 10 週以後、還沒在茶屋聽她說過 */
      {if:{custom:G=>S.homeRentDue(G)},goto:'rent'},
      {unless:{custom:G=>typeof AA667!=='undefined'&&!!AA667.ytJp&&AA667.ytJp(G)},speaker:null,text:'（晚餐。秀琴姨煮了三菜一湯，收完碗就走了。）'},{goto:'opt'},   /* AA_667 2-2：日本路線出發前那一週＝秀琴姨吃完飯還在（最後拿滷肉的做法出來），這一句不演 */
      {label:'rent'},
      {speaker:null,text:'（秀琴姨把最後一盤菜端上桌，在餐桌旁邊坐下來，沒有拿包包。）'},
      {speaker:'秀琴姨',text:'房東說要把房子賣了。我住了十四年。賣了我要住哪裡。'},
      {speaker:null,text:'（語彤沒說話。她幫秀琴姨盛了一碗湯。）'},
      {speaker:YT,text:'秀琴姨，妳先吃。'},
      {mem:[{npc:YT,tag:'RENT_RUMOR',note:'秀琴姨在她家說房東要把房子賣了'}]},{set:{YT_RENT_AT_HOME:true}},
      {label:'opt'},
      {choice:[{text:'「妳一個人住這麼大？」',goto:'a'},{text:'「秀琴姨煮得很好吃。」',goto:'b'}]},
      {label:'a'},{speaker:YT,text:'我媽買的。……我只是想知道一個人過日子是什麼感覺。'},{goto:'e'},
      {label:'b'},{speaker:YT,text:'嗯。比茶屋的點心好吃。……蘇姨聽到會難過。'},
      {label:'e'},{call:async(G,GM)=>{ if(typeof AA667!=='undefined'&&AA667.ytHomeTail) await AA667.ytHomeTail(GM); }},   /* AA_667 2-2：日本路線出發前那一週答應的那一次＝最後接稿上那一段（滷肉的做法、護照；YT_JP_BYE）*/
      {set:{YT_HOME_SEEN:true}} ],
    after:G=>{ G.flags.YT_HOME_SEEN=true; if(G.flags.YT_RENT_AT_HOME&&G.events&&G.events.done) G.events.done.ev_yutong_landlord=G.day; } };
  S.homeInstall=function(){ if(typeof STORY_EVENTS!=='undefined'&&!STORY_EVENTS.some(e=>e&&e.id===S.HOME_EV.id)) STORY_EVENTS.push(S.HOME_EV);
    if(typeof STORY!=='undefined'&&Array.isArray(STORY.PHONE_RULES)&&!S._homeRule){ S._homeRule=true; STORY.PHONE_RULES.push(G=>{ try{ S.homePhone(G); S.homePlan(G); }catch(e){ console.warn('YTJOB home',e); } }); } };
  /* ===== AA_643 第 10 節：15b〈溫州街的時間〉當面的一句——系刊出刊（2028-10-16）以後她第一次的茶屋班，打烊收杯子時講、只講一次（讀過＝期刊架那一場的 YT_ESSAY）===== */
  S.ESSAY_READ=[[YT,'你看過了喔。……蘇姨也看了。她說寫得太短。']]; S.ESSAY_NEW=[[YT,'這期系刊，第三頁那篇是我寫的。……不用現在看。']];
  S.essayDue=G=>{ const d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2028-10-16'):null; return d!=null&&G.day>=d&&!G.flags.YT_ESSAY_SHIFT; };
  S.essay=async function(GM){ const G=GM.G; G.flags.YT_ESSAY_SHIFT=G.day; await JOBS.play(GM,G.flags.YT_ESSAY?S.ESSAY_READ:S.ESSAY_NEW); return true; };
  /* 手機：認識以前她的訊息都不送 */
  const ytItem=it=>!!it&&(it.from===YT||it.th==='p:'+YT);
  S.gatePhone=function(){ if(typeof PHONE==='undefined'||PHONE._ytjob) return; PHONE._ytjob=true; const at0=PHONE.at, post0=PHONE.post;
    PHONE.at=function(G,day,h,items,tag){ if(!S.met(G)&&Array.isArray(items)&&items.some(ytItem)){ const rest=items.filter(it=>!ytItem(it));
        if(!rest.length){ if(tag&&!PHONE.sent(G,tag)){ const P=PHONE.rec(G); (P.cut=P.cut||[]).push(tag); } return false; }
        /* 群組裡回覆選項（ask）掛在她那一則（例：VA10 麵店團揪香港，最後一則是語彤）：她那則拿掉、ask 跟著不見＝群組沒得回（CC 11-11 20:48 AA_814 H23b）。
           同一個對話串裡還有別人的話：ask 移到留下來的最後一則（系統字、旁白不算）；她自己的私訊串（沒有別人）照舊整則不送 */
        const lost=items.find(it=>ytItem(it)&&it.ask);
        if(lost&&!rest.some(it=>it&&it.ask)){ for(let i=rest.length-1;i>=0;i--){ const it=rest[i]; if(it&&it.th===lost.th&&it.th!=='sys'&&!it.narr&&it.from&&it.from!=='player'){ rest[i]=Object.assign({},it,{ask:lost.ask}); break; } } }
        items=rest; }
      return at0.call(this,G,day,h,items,tag); };
    PHONE.post=function(G,m){ if(!S.met(G)&&ytItem(m)) return null; return post0.apply(this,arguments); }; };
  S.install=function(){ S.gatePhone(); S.homeInstall(); if(typeof JOBS!=='undefined'&&Array.isArray(JOBS.SHIFT_EV)&&!JOBS._ytjob){ JOBS._ytjob=true; JOBS.SHIFT_EV.unshift(async(GM,k)=>{ if(!(await S.closeShift(GM,k))) await S.closeExtra(GM,k); else { S.sync(GM.G); GM.G.flags.TEA_SHIFTS=(+GM.G.flags.TEA_SHIFTS||0)+1; } }); }
    if(typeof JOBS!=='undefined'&&Array.isArray(JOBS.MID_EV)&&!JOBS._ytjobMid){ JOBS._ytjobMid=true; JOBS.MID_EV.push(async(GM,k)=>{ await S.midShift(GM,k); }); } };
  S.install();
  return S;
})();
if(typeof window!=='undefined') window.YTJOB=YTJOB;
