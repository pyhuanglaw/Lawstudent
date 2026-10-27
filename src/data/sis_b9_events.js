/* ===== 學姊第九批：大三下學期中兩場、大四上她在美國時朋友的遠距（AA_395，企劃線 e81a1afe1；任務 SIS-B9-L-1023）的台詞與事件 =====
   台詞照稿一字不改（D100、D109；不數件數 AA_398）。接線在 src/sis_b9_3d.js（1-1、1-2、1-3、2-2）和 src/r2y4b3d.js（2-1 短視訊、2-3 大峽谷條件）。 */
'use strict';
const SISB9_LINES={
  umbrella:'傘帶了。',   /* 1-1 撐過傘的：出發前一晚 */
  /* 1-3 她在美國（臺灣週一 09:00，排在那一格的後面） */
  bookLaw:['（照片：那本刑訴，翻開在某一頁，旁邊一杯咖啡）','今天問號很多。看了一頁我大一寫的。……我那時候比現在敢問。'],
  bookNovel:['（照片：小說，最後一頁）','看完了。結局我高中就猜到了。……還是看完了。'],
  bookSent:['（照片：拆開的包裹，書上面放著一張你寫的紙條）','到了。……紙條比書先看。'],
  bookNotSent:['書的事不用了。這邊的圖書館有。'],
  bookRemind:'要寄給學姊的書',
  /* 2-1 短視訊沒接 */
  shortMissed:'你在忙。下次。',
  /* 2-2 楓葉書籤：玩家傳的、她的回覆 */
  maple:[{t:'書籤收到了。',r:'十天。比我想的快。',k:'got'},{t:'妳那邊冷了嗎？',r:'早上有霜了。我買了一件很厚的外套。……很醜。',k:'cold'}] };

const SISB9_EVENTS=(function(){
  const ID='heroine_05', X=()=>typeof SISB9!=='undefined'?SISB9:null, R=()=>typeof R2Y4B!=='undefined'?R2Y4B:null;
  const dt={custom:G=>!!X()&&X().dating(G)}, SIS=t=>({speaker:ID,text:t}), N=t=>({speaker:null,text:t}), ME=t=>({speaker:'player',text:t});
  const rel=o=>({consequences:{rel:{[ID]:o}}});
  return [
    /* ---------- 1-1：大三下第 10～11 週，下雨的平日 16:50～17:20，總圖門口 ---------- */
    { id:'ev_sis_y3s2_rain', title:'雨天，總圖門口', participants:[ID], location:'any', trigger:'manual', once:true, background:'blur',
      dialogue:[ {scene:'總圖・門口',bg:'ntu_library_rain'},
        {if:dt,speaker:null,text:'（她看到你，沒有說話，直接走到你的傘下面。）'},
        N('（雨下得很大。她站在屋簷下，看著手機上的天氣。）'),
        SIS('……計畫本上有寫「帶傘」。'),
        SIS('寫在下禮拜那一頁。'),
        {choice:[{text:'「一起撐吧。」',goto:'share'},{text:'「我去便利商店買一把。」',goto:'buy'}]},
        {label:'share'},
        {unless:dt,speaker:null,text:'（傘不大。她走在靠馬路那一邊，你把傘往她那邊偏。）'},{if:dt,speaker:null,text:'（傘不大。她勾著你的手臂。）'},
        SIS('你肩膀濕了。'),
        SIS('……我最近都在翻八月以後的頁。簽證、租房子、選課。'),
        SIS('今天這一頁，反而沒看。'),
        {choice:[{text:'「今天那頁寫什麼？」',goto:'sa'},{text:'（不說話，走慢一點）',goto:'sb'}]},
        {label:'sa'},N('（她在屋簷下停了一下，翻開。）'),SIS('十七點，回家。'),SIS('……寫得很清楚。是我沒看。'),{goto:'se'},
        {label:'sb'},N('（你們走到捷運站，誰都沒有說話。她把濕掉的那一角袖子捲起來。）'),
        {label:'se'},N('（公館捷運站。她把傘還給你。）'),SIS('謝謝。……下次我會看今天。'),
        Object.assign({set:{SIS_Y3S2_RAIN:'share'}},rel({fam:2,comf:2})),{end:true},
        {label:'buy'},SIS('……好。錢我給你。'),N('（你買回來，她把傘撐開，看了一下傘骨。）'),SIS('下次換我帶兩把。'),
        N('（你們各撐一把，走到公館捷運站。）'),
        SIS('八月以後，那邊也會下雨吧。'),
        SIS('……我會記得帶。'),
        Object.assign({set:{SIS_Y3S2_RAIN:'buy'}},rel({fam:2,comf:1})) ] },
    /* ---------- 1-2：大三下第 13～14 週的週四 19:30～21:30，兩點半 Café（說話前接演）---------- */
    { id:'ev_sis_which_book', title:'帶哪一本', participants:[ID], location:'cafe', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（她的桌上沒有筆電。只有兩本書，並排放著。）'),
        N('（一本是很舊的刑事訴訟法，書背用膠帶補過。一本是小說，書籤夾在快一半的地方。）'),
        SIS('行李只放得下一本。'),
        SIS('你幫我選。'),
        {choice:[{text:'「刑訴。」',goto:'law'},{text:'「小說。」',goto:'nov'},{text:'「兩本都帶。我幫妳寄一本。」',if:{custom:G=>!!X()&&X().canMail(G)},goto:'both'}]},
        {label:'law'},SIS('……這是我大一的課本。'),SIS('每一頁都是我那時候的字。很醜。'),N('（她翻開一頁給你看。邊邊寫滿了問號。）'),SIS('好。帶這本。到了那邊，問號多的時候可以看。'),{set:{SIS_BOOK:'law'}},{goto:'end'},
        {label:'nov'},SIS('這本我高中就開始看。一直沒看完。'),SIS('……每次都說等考完。'),SIS('好。帶這本。在那邊看完。'),{set:{SIS_BOOK:'novel'}},{goto:'end'},
        {label:'both'},SIS('寄到美國很貴。'),SIS('……你真的會寄？'),{set:{SIS_BOOK:'both'}},
        {label:'end'},N('（十點，她把兩本書收進包包。）'),
        {if:{custom:G=>!!X()&&X().dating(G)&&G.flags.SIS_BOOK!=='both'},speaker:ID,text:'另外一本，放你那邊。……回來跟你拿。'},
        {unless:{custom:G=>!!X()&&X().dating(G)&&G.flags.SIS_BOOK!=='both'},speaker:ID,text:'另外一本，回來再看。'},
        rel({fam:1,comf:2}) ] },
    /* ---------- 1-3 both：8/14～8/20 公館郵局寄書（30 分、郵資 900 元）---------- */
    { id:'ev_sis_book_mail', title:'寄書', participants:[], location:'any', trigger:'outing', once:true, background:'dark', hours:0.5,
      dialogue:[ {scene:'公館・郵局',bg:'gongguan'},{set:{SIS_BOOK_SENT:true}} ],
      afterOuting:(G,GM)=>{ if(GM&&GM.money) GM.money(-900,'郵資'); } },
    /* ---------- 2-1 T2 的短視訊（奇數週臺灣週日 10:00，十分鐘）：三組照順序各一次，用完只有旁白 ---------- */
    { id:'ev_sis_video_short', title:'視訊（十分鐘）', participants:[ID], location:'any', trigger:'outing', background:'dark', hours:0.2,
      dialogue:[ {scene:'視訊',bg:'video'},
        {if:{custom:G=>!!R()&&R().sisShortSet(G)===1},goto:'s2'},{if:{custom:G=>!!R()&&R().sisShortSet(G)===2},goto:'s3'},{if:{custom:G=>!!R()&&R().sisShortSet(G)>=3},goto:'sn'},
        N('（她背後是一排洗衣機，有一台在轉。）'),SIS('洗衣機還有十二分鐘。'),SIS('……剛好。'),
        {choice:[{text:'「十二分鐘要聊什麼？」',goto:'s1a'},{text:'「妳那邊幾點？」',goto:'s1b'}]},
        {label:'s1a'},SIS('聊到它停。'),N('（你們聊了這禮拜吃什麼。她吃了五天三明治。）'),{goto:'s1e'},
        {label:'s1b'},SIS('晚上十點。一天裡最空的時候。'),
        {label:'s1e'},N('（洗衣機嗶了三聲。）'),SIS('好了。……下次也挑洗衣服的時候。'),rel({fam:1,comf:1}),{end:true},
        {label:'s2'},N('（畫面一直在晃。她在走路，背後是很少的路燈。）'),SIS('剛從圖書館出來。這條路燈很少。'),SIS('陪我走到門口。'),
        {choice:[{text:'「好。妳走慢一點。」',goto:'s2a'},{text:'「下次早一點回去。」',goto:'s2b'}]},
        {label:'s2a'},SIS('我走很快的時候，是因為冷。'),{goto:'s2e'},
        {label:'s2b'},SIS('……你在管我。'),SIS('好。下次早一點。'),
        {label:'s2e'},N('（她刷了門禁卡。門關上的聲音。）'),SIS('到了。謝謝。'),rel({fam:1,comf:1}),{end:true},
        {label:'s3'},N('（她在圖書館的研究小間裡，對著鏡頭比了一下嘴巴，然後拿起手機打字。）'),SIS('（打字）這邊不能講話。'),SIS('（打字）第四章寫到一半。你講，我聽。'),
        {choice:[{text:'「（說這禮拜的課）」',goto:'s3a'},{text:'「（小聲）那我也不講。」',goto:'s3b'}]},
        {label:'s3a'},N('（你講了十分鐘。她一直在點頭，中間打了一行：「這個老師我知道。」）'),{goto:'s3e'},
        {label:'s3b'},N('（你們看著對方，十分鐘沒有人說話。她中間笑了一次。）'),
        {label:'s3e'},SIS('（打字）十分鐘到了。……謝謝你沒掛。'),rel({fam:1,comf:1}),{end:true},
        {label:'sn'},N('（視訊。十分鐘，她那邊在洗衣服。）') ],
      outingMissed:(G,GM,q)=>{ if(typeof PHONE!=='undefined') PHONE.at(G,q.day,q.h+1/3,[{th:'p:'+ID,from:ID,text:SISB9_LINES.shortMissed}],'y4_sa_smiss_'+((q.sa&&q.sa.k)|0)); } },
    /* ---------- 2-2：10/26（四）18:00 以後第一次回到自己的房間：楓葉書籤 ---------- */
    { id:'ev_sis_maple', title:'楓葉書籤', participants:[], location:'dorm', trigger:'manual', once:true, background:'blur',
      dialogue:[ N('（門口的信箱裡有一個信封，寄件地址是英文的。）'),
        N('（信封裡沒有信。只有一片壓乾的楓葉，護貝過，剪成書籤的形狀。）'),
        {unless:{custom:G=>!!X()&&X().mapleClose(G)},speaker:null,text:'（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——溫書瑀」）'},
        {if:{custom:G=>!!X()&&X().mapleClose(G)},speaker:null,text:'（背面一行小字：「這邊的葉子紅了。寄到的時候，應該掉光了。——書瑀」）'},
        Object.assign({set:{SIS_MAPLE:true}},rel({fam:1})) ] } ];
})();
for(const e of SISB9_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
