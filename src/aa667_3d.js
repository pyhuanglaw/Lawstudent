/* ===== AA_667 交換路線第二批：同時交往、沒有一起出國的另一位——祐廷出發前、出發當天、回國當天（企劃線 claude/cool-heisenberg-o8kuqx 090981ebe，AA-C 2026-11-04；
   第 7 節「接線時補的」1905ae629，AA-B 2026-11-07；任務 AA667-VAC-GAP2-1104；第①級，AA 定稿 D109；D99 第二、三項）。第一批是 AA_660（src/aa660_3d.js），這一份照它的做法 =====
   台詞照稿第 2、3 節一字不改（S.L；[說的人, 句子]，旁白 null）；接線照第 5 節：路線＝STORY.routeAbroadRoute（臺灣路線、還沒定都不出現）、
   她和祐廷交往中（dating）、不是一起出國的那一位（日本＝以安、美國＝學姊）、每一場只演一次。第 4 節（AA_660 G1-1 起飛時間）已經在 aa660_3d.js，不重做。
   時間：稿上寫的都是臺灣時間；人在國外＝遊戲時鐘是當地時間（S.loc，同 aa660_3d.js）。美國路線 8/2 起飛（exchange3d.js TAKEOFF_H 09:30）以後、落地（當地 16:30）以前發的：
     落地以後才收到，時間照當地時間、不早於起飛（S.air）。日本路線 3/25 出發前（09:50 沛珊）照臺灣時間。
   日本路線（3/25 出發、8/5 回來）：
     2-1 子晴：3/23 22:30「你在宿舍嗎」三則＋「下去。」→ 男一舍門口（2D 深色，S.EVENTS ev_aa667_jp_zq_bye；ZQ_JP_BYE）；沒回、或回了沒下去＝23:30 兩則。
          住家裡（S.dorm 不成立：遊戲裡日本路線 2/20 就退宿，jp3d.js JP.movedOut）＝第 7 節 7-1 那一版（企劃線 1905ae629）：「你在家嗎」三則 → 家附近的便利商店門口
            （ev_aa667_jp_zq_bye_home；同一個出遊 id、同一個 ZQ_JP_BYE），「剛從系館出來。順路。」換成「坐捷運過來的。……不是順路。」、其他照 2-1；沒下去＝23:30「袋子寄在便利商店櫃台了…」兩則。
          2-4 沛珊 3/24 那通的第一句：住家裡＝「你回家了嗎？」（7-2；住宿舍照原本「你回宿舍了嗎？」）。
          3/25 22:40 兩則；8/5 22:10 三則（Q6 兩版）＋「好。」＝8/6 14:00 溫州街的公園（Q6）／22:00 公館宵夜，「明天要睡。」她回一句；
          那天她的一般邀約（heroine_asks3d.js「明天羽球 這次我要贏一球」）8/5 不傳（HASK.SEND_BLOCK）、8/6 以後照常。
     2-2 語彤：3/18～3/24 答應她的「……今天秀琴姨煮很多。」那一次（ytjob3d.js 第一次去她家 ev_yt_home_first）＝這一版：晚餐那句旁白（秀琴姨收完碗就走了）不演，
          最後接稿上那一段（S.ytHomeTail：秀琴姨的滷肉做法、護照；YT_JP_BYE）；「……還沒找到。」＝當晚 22:00 你（自動）「找到了。」／語彤「嗯。」。
          3/25 臺灣 17:10 兩則；日本那幾個月：有 YT_JP_BYE＝4/19 以後第一個摘要日加一句（JP.SCH：挽回中 5/3、交往中 6/28；「第一次自己煮飯」遊戲裡沒有那一天）；
          已經去過她家的（YT_HOME_SEEN）＝7-3 那一小場：那一週平日 17:00 照傳「……今天秀琴姨煮很多。你要不要來吃。」（ytjob3d.js 去過的不再傳，這裡傳），「好。」＝18:30 她家
            （ev_aa667_jp_yt_bye：秀琴姨煮了一整桌、「她說你要出國，要吃飽。」→ 接 2-2 從「秀琴姨從廚房拿了一張紙出來」到最後；YT_JP_BYE）；「今天不行。」＝下一個平日再問。
          8/7 20:00 三則＋7-4 那一句「我明天在臺北。後天回淡水。」＋「好。」＝8/8 18:30 去她家：還沒去過＝ev_yt_home_first、開頭（秀琴姨打完招呼以後）加秀琴姨那一問（S.ytHomeHead）；
            去過了＝ev_aa667_yt_back（只有那一問）。8/8 那天她在臺北（AA_675 暑假平日在淡水的例外：STORY.VAC_STAY，傳了 8/7 那串才算）；ytjob3d.js 第一次去她家那則 8/8 不另外傳（S.ytHomeSkip）。
     2-3 芷若：3/21 21:00 兩則 → 3/22 22:00 2:30 AM 打烊後（ZR_JP_BYE；有 ZR_CARDS_SENT 兩版）；3/25 臺灣 22:07 兩則；
          日本那幾個月：有 ZR_JP_BYE＝4/19 以後第一個摘要日加明信片那一句、記 ZR_JP_CARD；8/5 22:07（ZR_JP_CARD 兩版）。
     2-4 沛珊：3/24 23:00 她打來（電話；PS_JP_BYE）；3/25 09:50 兩則（有 PS_JP_BYE）；8/5 23:00 兩則＋「回來了。」她回兩句。
     2-5 學姊（日本路線、11/18 以後才交往的）：8/2 臺灣 09:00 三則（當地 10:00）、8/5 22:00 兩則。
     2-6 可昕：8/5 21:00 兩則 → 22:00 視訊；沒接＝22:30「好喔。明天再打。」、隔天 22:00 同一場（只演一次）。
   美國路線（8/2 出發、12/23 回來）：
     3-1 以安：8/1 20:00「八點半，視訊。」→ 20:30 視訊（她那邊 22:30 以後不回＝臺灣 21:30 以前接；AN_US_BYE）；8/2 臺灣 10:20 兩則；12/23 06:00 一則；
          12/23 她的聖誕邀約前面多一句（fest3d.js FEST.ASK_PRE）；12/24 總圖門口那一場（她約的那一場）開頭加三句（FEST.HEAD；有去送機 AN_SENDOFF＝went／沒去兩版）。
     3-2 子晴：7/29 21:00 兩則＋「好。」＝7/30 22:00 公館宵夜、「明天不行。」＝「那禮拜一」7/31 22:00（ZQ_US_BYE）；
          8/2 臺灣 22:30 三則，取代那天的「今天又改了三個 bug」（cracktalk3d.js CRACKTALK.ZQ2_SKIP）；12/23 聖誕邀約前面兩則。
     3-3 語彤：7/21 21:00 兩則 → 7/22 17:00 一盞茶屋前院（YT_US_BYE；「七號才下來。」照 7-4 改）；8/7 臺灣 20:00 五則（當地早上 8 點）；12/23 17:10 兩則（她的聖誕邀約是 21:00）。
     3-4 芷若：8/1 20:30 兩則 → 21:30 捷運出口（家附近那一站；稿「地點 LAWWW 照家的設定填」，家的設定沒有站名＝「家附近的捷運站出口」；ZR_US_BYE）；
          沒去＝22:07「好。那到了跟我說。」；8/2 臺灣 22:07 兩則；12/23 兩則（排在她英國那一週的訊息 07:00 前面）。
     3-5 沛珊：8/1 23:00 她打來（電話；PS_US_BYE）；8/2 06:10 兩則（有 PS_US_BYE）；12/23 聖誕邀約前面兩則。
   第 5 節「同一晚兩場撞在一起」（S.SLOTS／S.slot；規則照第 7 節 7-5 改，企劃線 1905ae629）：出發前那幾場（日本 3/22 芷若、3/23 子晴、3/24 沛珊；美國 7/22 語彤、7/30 子晴、8/1 以安、8/1 芷若、8/1 沛珊）
     時間被綁住的那一位不動（pin：芷若 8/1 才從台中回臺北）；同一天其他的往前一天（連同前面那則訊息、同一個時間），那一天也有了就再往前。
     都沒有被綁住＝時間早的照演（原本的規則）。要往前的不只一位：時間晚的先往前（7-5 的例子：同時和以安、芷若、沛珊交往＝芷若 8/1、沛珊 7/31、以安 7/30）。
     往前剛好一天的那一場，講「明天」的句子照 7-5 換（S.moved1）：芷若「你明天就走了吧」→「你後天就走了吧」、沛珊「你明天幾點出門？」→「你後天幾點出門？」。
     前面那則訊息傳出去就定下那一天（G.flags.AA667_SLOT；舊存檔照舊讀）。語彤 3/18～3/24 那一頓（玩家自己答應的日子）、7/31 子晴「明天不行」改的那一場不算。
   第 5 節 H6、H7、沛珊那句：src/data/termend_lines.js（子晴 Y4S1 期末飯美國路線版）、src/ytjob3d.js（S.homePhone 看語彤的 presence）、src/data/fest_events.js（沛珊聖誕台南）。
   舊存檔：訊息只補到那個時間的隔天；出遊、視訊、電話只在還來得及的時候排；旗標沒有＝沒演過。
   存檔：旗標 ZQ_JP_BYE、YT_JP_BYE、ZR_JP_BYE、ZR_JP_CARD、PS_JP_BYE、AN_US_BYE、ZQ_US_BYE、YT_US_BYE、ZR_US_BYE、PS_US_BYE（演到最後那一天）、
     AA667_SLOT（{路線_人:那一天}）、AA667_JPSUM（{yt|zr:摘要日那一天}）、AA667_YT_PASS（護照還沒找到那一天）、AA667_YT_BACK（8/8 那一頓）、AA667_YT_GO（7-3 去過的那一小場答應的那一天）；
     訊息照 PHONE 的 tag（aa667_*）；出遊 G.outings 的 aa667_*。第 7 節沒有新的存檔格式：舊存檔（d17abb340 那一版存的）照讀，已經定下的日子（AA667_SLOT）不重算。
   測試：node tests/aa667_vacgap2_unit.js */
'use strict';
const AA667=(function(){
  const S={};
  if(typeof STORY==='undefined') return S;
  const DK=k=>STORY.dayOfKey?STORY.dayOfKey(k):null, T=(d,h)=>d*24+h, NOW=G=>T(G.day,+G.hour||0);
  const law=G=>!!G&&(G.stage||'law')==='law';
  const R=G=>STORY.routeAbroadRoute?STORY.routeAbroadRoute(G):null;
  const P_=()=>typeof PHONE!=='undefined'?PHONE:null;
  const sent=(G,tag)=>{ const P=P_(); return !!(P&&P.sent(G,tag)); };
  const dating=(G,id)=>{ const F=(G&&G.flags)||{}, Rm=F.romance||{}; return F['dating_'+id]===true||!!(Rm[id]&&Rm[id].status==='dating'); };
  const tz=(G,d)=>STORY.tzOffset?(+STORY.tzOffset(G,d)||0):0;
  const outGet=(G,id)=>typeof OUT!=='undefined'&&OUT.get?OUT.get(G,id):null;
  const plan=(G,o)=>typeof OUT!=='undefined'&&OUT.plan&&!OUT.get(G,o.id)?OUT.plan(G,o):false;
  S.loc=(G,d,h)=>{ const t=T(d,h)+tz(G,d), dd=Math.floor(t/24+1e-9); return {day:dd,h:t-dd*24}; };   /* 臺灣時間 → 遊戲時鐘（人在國外＝當地時間；同 aa660_3d.js）*/
  /* 2026-11-11（使用者 X327 沛珊重寫）：沛珊出發前的電話（jps、ups）九句照 AA_759_peishan_misc2.json@987845b7c 換（家裡是連鎖餐廳、早上起不來：定三個鬧鐘、傳鬧鐘截圖）；條件、旗標、選項的字不動。逐字對稿：tests/peishan_dates_1111_unit.js */
  const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin', XQ='秀琴姨', SU='蘇姨';
  const dm=(id,t)=>({th:'p:'+id,from:id,text:t}), me=(id,t)=>({th:'p:'+id,from:'player',who:null,text:t});
  const N=t=>[null,t];
  /* 子晴做遊戲的事你知道（Q6）：同 termend_lines.js 的 Q6（AA_260 (b-1) 第 12 項：2027-10-06 以後一律算知道）*/
  S.q6=G=>!!(G&&G.events&&G.events.done&&G.events.done.ev_ziqing_secret_game)||(d=>d!=null&&G.day>=d)(DK('2027-10-06'));

  /* ---------------- 台詞（AA_667 第 2、3 節，一字不改）---------------- */
  const Q=t=>[ZQ,t], Y=t=>[YT,t], Z=t=>[ZR,t], P=t=>[PS,t], A=t=>[AN,t], K=t=>[KX,t], W=t=>[SIS,t], X=t=>[XQ,t];
  S.L={
    /* 2-1 子晴（日本）*/
    jzq:{dm:['你在宿舍嗎','下來','五分鐘'],go:'下去。',scene:'男一舍門口',
      s1:[N('（她站在宿舍門口，手上拎著一個便利商店的袋子。）'),Q('剛從系館出來。順路。'),N('（袋子裡是兩罐可樂和一包你常吃的那種洋芋片。她拿走一罐。）'),Q('日本的那種我查了，都比較小包。這包你帶去。')],
      opts:[{t:'「行李箱塞不下吧。」',say:[Q('塞得下。衣服少帶一件。')]},{t:'「謝啦。」',say:[Q('嗯。')]}],
      s2:[N('（她把可樂喝掉一半，看著門口的燈。）'),Q('你走了以後，總圖二樓靠窗那個插座就是我的了。')],
      q6:Q('五個月。我會把那個東西做完。回來你先玩。'),noQ6:Q('五個月喔。'),end:Q('走了。到了傳訊息。'),
      miss:['袋子掛在你們宿舍的信箱上','洋芋片'],
      dep:['到了沒','宿舍床旁邊有沒有插座'],
      back:['回來了齁','明天下午我沒班'],backQ6:'東西做完了 你要不要來玩',backNo:'宵夜 明天',backOpts:['好。','明天要睡。'],backNoRep:'好喔 那下禮拜',
      park:[N('（她把筆電轉過來給你。畫面上是一個還沒有名字的關卡。）'),Q('五個月做的。你玩，我不講話。'),N('（你卡在第三關。她一直看著畫面，最後還是伸手過來按了一個鍵。）'),Q('……那邊要先跳。我等一下改提示。')],
      night:[N('（她點了兩碗，把一碗推到你前面。）'),Q('日本的東西你吃了五個月。今天吃這個。')],
      /* 7-1 住家裡的那一版（企劃線 1905ae629）：訊息、地點字幕、換的那一句、沒下去的兩則；其他照上面 */
      home:{dm:['你在家嗎','我在你家附近那間便利商店','五分鐘'],scene:'家附近的便利商店門口',swap:['剛從系館出來。順路。','坐捷運過來的。……不是順路。'],open:[N('（她站在宿舍門口，手上拎著一個便利商店的袋子。）'),N('（她站在便利商店門口，手上拎著一個袋子。）')],miss:['袋子寄在便利商店櫃台了 你明天去拿','洋芋片']}},
    /* 2-2 語彤（日本）*/
    jyt:{bye:[N('（吃完飯，秀琴姨從廚房拿了一張紙出來，上面寫了滿滿的字。）'),X('滷肉的做法。肉那邊買得到，醬油你帶一瓶去。'),X('不要放太多糖。'),
        N('（語彤送你下樓。在樓梯轉角，她突然停下來。）'),Y('……欸，你護照放哪裡？')],
      opts:[{t:'「行李箱。」',say:[Y('拿出來。放外套內袋。')]},{t:'「……還沒找到。」',say:[Y('今天回去就找。找到跟我說。')],pass:true}],
      pass:{me:'找到了。',her:'嗯。'},
      bye2:[Y('禮拜四的照片，我照樣傳。'),Y('你那邊是十點。不用回，去睡覺。')],
      dep:['📷（茶屋的櫃台。蘇姨在擦茶壺。）','蘇姨問你到了沒。'],
      sum:'（你照秀琴姨那張紙滷了一鍋肉。醬油不一樣，顏色淡了一點。）',
      seen:[N('（秀琴姨今天煮了一整桌，比平常多兩道。）'),Y('她說你要出國，要吃飽。')],   /* 7-3 已經去過她家的：這兩句以後接 bye（「秀琴姨從廚房拿了一張紙出來」）到最後 */
      back:['回來了。','山上收不到訊號。剛剛才看到群組。','……秀琴姨明天煮。你要不要來吃。','我明天在臺北。後天回淡水。'],backGo:'好。',   /* 最後一則：7-4（8/8 例外在臺北）*/
      head:X('在那邊有自己煮嗎？'),headOpts:[{t:'「照妳那張紙滷過。」',bye:true,say:[X('醬油不一樣吧。')]},{t:'「都吃便利商店。」',say:[X('難怪瘦了。')]}]},
    /* 2-3 芷若（日本）*/
    jzr:{dm:['禮拜三我上到十點。','打烊以後你來。'],
      s1:[N('（椅子都倒扣在桌上了。她只留吧檯那一盞燈。）'),Z('坐。最後一杯，不用錢。'),N('（她一邊沖一邊講她查到的：電車卡要先買、宿舍洗衣機要排隊、超市晚上八點以後便當會打折。）'),
        Z('我在倫敦第一個禮拜，每天都想吃滷肉飯。你也會。先講好，不准笑我。'),N('（講到一半，她停下來，拿著濾杯看了很久。）')],
      cards:[Z('我寄給你的那些明信片，你還留著嗎？')],cardOpts:[{t:'「在抽屜裡。」',say:[Z('……好。')]},{t:'「留著啊。」',say:[Z('……好。')]}],cards2:Z('這次換你寄。一張就好。寄店裡。'),
      noCards:Z('到了寄一張明信片給我。寄店裡。'),
      dep:['今天下午有人點熱拿鐵，不加糖。','我差點寫你的名字。'],
      sum:'（你在宿舍旁邊的郵局買了一張明信片。收件人寫了她的名字，地址寫店裡，又在旁邊加了「吧檯」兩個字。）',
      back:'落地了嗎。',backCard:'你寄的那張，老闆貼在吧檯後面了。我沒叫他貼。',backNo:'下禮拜找一天。我想聽日本的事。'},
    /* 2-4 沛珊（日本）*/
    jps:{call:[P('你回宿舍了嗎？行李收好了沒？')],swapHome:['你回宿舍了嗎？','你回家了嗎？'],   /* 7-2：住家裡換這一段 */opts1:[{t:'「還差一點。」',say:[P('那你收。我在電話這邊陪你。')]},{t:'「收好了。」',say:[P('好快。那你陪我講一下話，我今天沒人可以鬧。')]}],
      mid:[P('你有帶厚外套嗎？我查了，三月底那邊晚上只有幾度。')],
      opts2:[{t:'「妳最近還好嗎？」',say:[P('還好啦。課輔班的小朋友很可愛。'),N('（停了一下）'),{shift:['JP','ps'],line:P('……你明天十點的飛機對不對。')}]},{t:'「帶了。」',say:[P('真的？你不要騙我。')]}],
      end:P('十點我應該還在睡。……我定鬧鐘。'),
      dep:['我起來了！','一路平安。到了跟我說～'],
      back:['回來了嗎？','我這禮拜都在店裡幫忙，站到腳快斷了。可是想先問你。'],backGo:'回來了。',backRep:['好。那我去睡了。','你還沒來過我們家的店。下次，我叫我爸留靠窗那桌。']},
    /* 2-5 學姊（日本路線、11/18 以後才交往的）*/
    jsis:{fly:['我要登機了。','你五號回去，我已經在那邊了。','我們輪流出國，還蠻有效率的。'],back:['落地了沒。','我這邊剛起床。樓下的咖啡機壞了，排了很久。']},
    /* 2-6 可昕（日本路線 8/5）*/
    jkx:{dm:['回來了？','十點視訊。'],
      v1:[N('（視訊接通。她在高雄家的房間，頭髮還是濕的。）'),K('轉一圈。我看你瘦了沒。')],
      opts:[{t:'「（轉一圈）」',say:[K('瘦了。日本的東西不合你胃口喔。')]},{t:'「不要。」',say:[K('轉。'),N('（你轉了一圈。）'),K('瘦了。')]}],
      v2:[K('才差一個小時的時差，不准跟我說你很累。'),K('去睡。')],
      miss:'好喔。明天再打。'},
    /* 3-1 以安（美國）*/
    uan:{dm:'八點半，視訊。',
      v1:[N('（視訊接通。她坐在宿舍的書桌前，後面的月曆上，八月五號用紅筆圈起來。）'),{shift:['US','an'],line:A('明天幾點的飛機？')}],   /* 7-5（0ba033578）：往前移了就換「後天」「大後天」 */
      opts:[{t:'「九點半。」',say:[A('我那時候在上最後一堂研討課。十一點十分下課。')]},{t:'「早上。」',say:[A('幾點？'),N('（你說九點半。）'),A('我那時候在上課。十一點十分下課。')]}],
      v2:[A('我五號回去。你二號走。'),N('（她拿筆在月曆上的圈旁邊點了一下，沒有寫字。）'),A('我原本排好了，回去隔天就去找你。'),A('……那就十二月。')],
      fly:['下課了。你應該在天上。','落地傳一則就好。'],land:'落地了嗎。',xmasPre:['睡醒了嗎。'],
      head:N('（她比約好的時間早到，站在總圖門口的柱子旁邊。看到你，她先看了一下手錶。）'),headAir:A('上一次見面是三月二十五號，在機場。'),headNoodle:A('上一次見面是三月二十四號，在麵店。'),head2:A('……你頭髮長了。')},
    /* 3-2 子晴（美國）*/
    uzq:{dm:['明天宵夜','我加班到九點半'],opts:['好。','明天不行。'],noRep:'那禮拜一',
      s1:[N('（她比約好的晚到十分鐘，筆電包還背在身上。）'),Q('先點。我餓死了。'),N('（她點了兩份，一份推給你。）'),Q('美國的宵夜我查了，很多店九點就關。你自己想辦法。')],
      sOpts:[{t:'「那我帶泡麵。」',say:[Q('帶兩箱。行李不夠我幫你塞。')]},{t:'「我會自己煮。」',say:[Q('你會？'),N('（她看了你一眼。）'),Q('……好喔。煮了拍給我看。')]}],
      q6:Q('我手上那個案子，年底要給老闆看。你回來剛好先玩。'),noQ6:Q('……五個月喔。'),
      s2:[N('（吃完，她把兩個碗疊起來拿去回收，走回來的時候沒有再坐下。）'),Q('走了。明天還要上班。'),Q('到了傳訊息。不用每天。……我也很忙。')],
      fly:['你現在在哪','舊金山？','我今天又改了三個 bug 跟你報告一下'],xmasPre:['回來了齁','時差先調']},
    /* 3-3 語彤（美國）*/
    uyt:{dm:['明天我五點下班。','你來店裡。'],
      s1:[N('（最後一桌客人走了。蘇姨端了一壺茶出來，放在前院的長凳上。）'),[SU,'你們坐。我進去收。'],N('（語彤倒了兩杯。你們坐著喝，誰都沒有先開口。）'),Y('我二十四號去宜蘭，跟老師做田野。'),Y('那邊在山裡，收不到訊號。七號才下來。')],
      opts:[{t:'「那我二號出發那天……」',say:[Y('我收不到。'),N('（她看著杯子。）'),Y('……所以今天叫你來。')]},{t:'「好，我知道了。」',say:[Y('……你二號走。我知道。')]}],
      s2:[Y('下山那天，我會一次傳很多。你看到再回。'),N('（蘇姨在裡面喊她。她站起來，順手把你的杯子也收走。）')],
      down:['📷（山路，霧很大。）','📷（雜貨店的老闆娘坐在門口剝竹筍。）','📷（她的筆記本，寫滿了字。）','下山了。','你那邊是早上吧。有吃早餐嗎。'],
      back:['下班了。','你回來了嗎。']},
    /* 3-4 芷若（美國）*/
    uzr:{dm:['我剛回臺北。','你明天就走了吧。捷運出口，十分鐘就好。'],scene:'家附近的捷運站出口',
      s1:[N('（她從手扶梯上來，背著一個很大的帆布包，看起來是直接從車站過來的。）'),Z('你先走，我晚一個月。我們兩個怎麼都在收行李。'),Z('英國跟美國差五個小時。我那邊下午，你那邊早上。還算好約。'),
        N('（她從帆布包裡拿出一盒太陽餅，塞給你。）'),Z('我媽叫我帶回來的。我多買了一盒。'),Z('好，十分鐘了。'),N('（她轉身走下手扶梯，走到一半又回頭揮了一下。）')],
      miss:'好。那到了跟我說。',fly:['起飛了吧。','我今天開始收行李。收了一雙襪子。'],back:['你回到臺灣了。','換我在國外。'],
      later:['你明天就走了吧','你後天就走了吧']},   /* 7-5：往前一天的那一場換這一段 */
    /* 3-5 沛珊（美國）*/
    ups:{ask:P('你明天幾點出門？'),later:['你明天幾點出門？','你後天幾點出門？'],   /* 7-5：往前一天的那一場換這一句 */six:{t:'「六點。」',say:[P('六點？那時候我一定還在睡。'),P('我定鬧鐘。三個。')]},
      how:{t:'「妳最近好嗎？」',say:[P('還好啦。'),N('（電話那頭有碗盤的聲音。）'),P('我媽在叫我。你早點睡。')]},
      dep:['📷（鬧鐘的截圖：05:30、05:40、05:50。）','我真的起來了。一路平安～'],xmasPre:['你回來了！！','時差會很累，先睡。']} };

  /* ---------------- 日子 ---------------- */
  S.K={jpYtFrom:'2028-03-18',jpYtTo:'2028-03-23',jpDep:'2028-03-25',jpRet:'2028-08-05',jpYtBack:'2028-08-07',sisFly:'2028-08-02',usDep:'2028-08-02',usYtDown:'2028-08-07',usRet:'2028-12-23'};
  const D=k=>DK(S.K[k]);
  const JPR=G=>law(G)&&R(G)==='JP', USR=G=>law(G)&&R(G)==='US';
  /* 「住宿舍」（2-1 子晴的條件）：沒退宿、沒住家裡 */
  S.dorm=G=>!(typeof JP!=='undefined'&&JP.movedOut&&JP.movedOut(G))&&!(typeof HOME!=='undefined'&&((HOME.movedOut&&HOME.movedOut(G))||(HOME.livesHome&&HOME.livesHome(G))));
  /* 美國路線 8/2 起飛以後才傳的（臺灣時間）：當地時間、不早於起飛那一刻 */
  S.TAKEOFF=()=>typeof EXCH!=='undefined'&&EXCH.TAKEOFF_H!=null?EXCH.TAKEOFF_H:9.5;
  S.air=(G,d,h)=>{ const w=S.loc(G,d,h), t0=T(D('usDep'),S.TAKEOFF()+0.1); let t=T(w.day,w.h); if(t<t0) t=t0; const dd=Math.floor(t/24+1e-9); return {day:dd,h:t-dd*24}; };
  const due=(G,w)=>NOW(G)>=T(w.day,w.h)&&G.day<=w.day+1;   /* 到了那個時間、舊存檔只補到隔天 */

  /* ---------------- 第 5 節：同一晚兩場撞在一起 ---------------- */
  /* pin：時間被綁住、不往前（7-5：芷若 8/1 才從台中回臺北，捷運出口那一場不能更早）。子晴 3/23 住宿舍、住家裡兩版都算（7-1）*/
  S.SLOTS={ JP:[{k:'zr',who:ZR,d:'2028-03-22',h:22},{k:'zq',who:ZQ,d:'2028-03-23',h:22.5},{k:'ps',who:PS,d:'2028-03-24',h:23}],
    US:[{k:'yt',who:YT,d:'2028-07-22',h:17},{k:'zq',who:ZQ,d:'2028-07-30',h:22},{k:'an',who:AN,d:'2028-08-01',h:20.5},{k:'zr',who:ZR,d:'2028-08-01',h:21.5,pin:true},{k:'ps',who:PS,d:'2028-08-01',h:23}] };
  /* 那一場排在哪一天：①已經定下的（訊息傳出去了，AA667_SLOT）②被綁住的照原本 ③原本那一天還空著＝照原本（同一天都沒被綁住＝時間早的先）④其他的往前一天、再撞再往前（時間晚的先往前）*/
  S.slots=function(G,r){ const P=(G.flags&&G.flags.AA667_SLOT)||{}, L=S.SLOTS[r]||[], at={}, used=new Set(), on=s=>s.on?s.on(G):dating(G,s.who);
    for(const s of L){ const v=P[r+'_'+s.k]; if(typeof v==='number'){ at[s.k]=v; used.add(v); } }
    const rest=L.filter(s=>at[s.k]==null&&DK(s.d)!=null), live=[];
    for(const s of rest){ if(on(s)) live.push(s); else at[s.k]=DK(s.d); }   /* 沒交往的：照原本（不佔那一天）*/
    for(const s of live) if(s.pin){ const d=DK(s.d); at[s.k]=d; used.add(d); }
    const mv=[]; for(const s of live.filter(s=>!s.pin).sort((a,b)=>DK(a.d)-DK(b.d)||a.h-b.h)){ const d=DK(s.d); if(used.has(d)) mv.push(s); else { at[s.k]=d; used.add(d); } }
    for(const s of mv.sort((a,b)=>DK(b.d)-DK(a.d)||b.h-a.h)){ const d0=DK(s.d); let d=d0-1; while(used.has(d)&&d>d0-7) d--; at[s.k]=d; used.add(d); }
    return at; };
  S.slot=(G,r,k)=>{ const v=S.slots(G,r)[k]; return v!=null?v:null; };
  /* 往前剛好一天（7-5「只在被移到前一天的那一場換」）*/
  S.moved1=(G,r,k)=>{ const s=(S.SLOTS[r]||[]).find(x=>x.k===k), d0=s?DK(s.d):null, d=S.slot(G,r,k); return d0!=null&&d!=null&&d===d0-1; };
  S.movedN=(G,r,k)=>{ const s=(S.SLOTS[r]||[]).find(x=>x.k===k), d0=s?DK(s.d):null, d=S.slot(G,r,k); return d0!=null&&d!=null&&d<d0?d0-d:0; };   /* 往前移了幾天 */
  S.dayWord=n=>n>=2?'大後天':'後天';   /* 講出發「明天」的句子：往前一天＝後天、兩天以上＝大後天（AA-B 11-07 18:47，企劃線 0ba033578 7-5）*/
  const later=(t,sw,n)=>{ n=n===true?1:(+n||0); return n>0?String(t).split(sw[0]).join(sw[0].split('明天').join(S.dayWord(n))):t; };
  /* 一句講出發「明天」的台詞：照那一場往前移幾天換字（劇情裡用 when 分三版）*/
  const shiftLine=(r,k,sp,t)=>({when:G=>S.movedN(G,r,k)>=2,then:[[sp,String(t).split('明天').join('大後天')]],else:[{when:G=>S.movedN(G,r,k)===1,then:[[sp,String(t).split('明天').join('後天')]],else:[[sp,t]]}]});   /* 「明天」→「後天」那一段（字照 7-5）*/
  S.pin=(G,r,k,d)=>{ const F=G.flags, P=F.AA667_SLOT&&typeof F.AA667_SLOT==='object'?F.AA667_SLOT:(F.AA667_SLOT={}); if(typeof P[r+'_'+k]!=='number') P[r+'_'+k]=d; };

  /* ---------------- 出遊、視訊、電話 ---------------- */
  S.OUTS={
    jzq:{id:'aa667_jp_zq_bye',ev:'ev_aa667_jp_zq_bye',late:0.25,place:'男一舍門口',verb:'下去',title:'子晴在宿舍樓下',travel:'',travelH:0,silent:true},
    jzqHome:{id:'aa667_jp_zq_bye',ev:'ev_aa667_jp_zq_bye_home',late:0.25,place:'家附近的便利商店門口',verb:'下去',title:'子晴在便利商店門口',travel:'走過去約 5 分鐘',travelH:1/12,homeTravel:'走過去約 5 分鐘',silent:true},   /* 7-1 住家裡：同一個出遊 id（只會有一場）*/
    jzr:{id:'aa667_jp_zr_bye',ev:'ev_aa667_jp_zr_bye',h:22,late:0.5,place:'2:30 AM 打烊後',title:'2:30 AM 打烊後',travel:'走過去約 15 分鐘',travelH:0.25},
    jps:{id:'aa667_jp_ps_call',ev:'ev_aa667_jp_ps_call',h:23,late:0.5,place:'電話',verb:'接起來',no:'先不接',title:'沛珊打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',silent:true},
    jzqPark:{id:'aa667_jp_zq_park',ev:'ev_aa667_jp_zq_park',h:14,late:0.5,place:'溫州街的公園',title:'溫州街的公園',travel:'走路約 15 分鐘',travelH:0.25},
    jzqNight:{id:'aa667_jp_zq_night',ev:'ev_aa667_jp_zq_night',h:22,late:0.5,place:'公館宵夜',title:'公館宵夜',travel:'走路約 15 分鐘',travelH:0.25},
    jyt:{id:'aa667_jp_yt_home',h:18.5,late:0.5,place:'新生南路・她家',title:'去語彤家吃飯',travel:'走過去約 10 分鐘',travelH:1/6},
    jytSeen:{id:'aa667_jp_yt_bye',ev:'ev_aa667_jp_yt_bye',h:18.5,late:0.5,place:'新生南路・她家',title:'去語彤家吃飯',travel:'走過去約 10 分鐘',travelH:1/6,alarm:true},   /* 7-3 已經去過她家的（同 ytjob3d.js homePlan）*/
    jkx:{id:'aa667_jp_kx_video',ev:'ev_aa667_jp_kx_video',h:22,late:0.5,place:'視訊',verb:'接起來',no:'先不接',title:'可昕打視訊來',call:true,travel:'',travelH:0,back:'視訊結束。'},
    jkx2:{id:'aa667_jp_kx_video2',ev:'ev_aa667_jp_kx_video',h:22,late:0.5,place:'視訊',verb:'接起來',no:'先不接',title:'可昕打視訊來',call:true,travel:'',travelH:0,back:'視訊結束。'},
    uan:{id:'aa667_us_an_video',ev:'ev_aa667_us_an_video',h:20.5,late:1,place:'視訊',verb:'接起來',no:'先不接',title:'以安打視訊來',call:true,travel:'',travelH:0,back:'視訊結束。'},   /* late 1：她那邊 22:30（臺灣 21:30）以後不回 */
    uzq:{id:'aa667_us_zq_night',ev:'ev_aa667_us_zq_night',h:22,late:0.5,place:'公館宵夜',title:'公館宵夜',travel:'走路約 15 分鐘',travelH:0.25},
    uyt:{id:'aa667_us_yt_tea',ev:'ev_aa667_us_yt_tea',h:17,late:0.5,place:'一盞茶屋前院',title:'一盞茶屋',travel:'走路約 15 分鐘',travelH:0.25},
    uzr:{id:'aa667_us_zr_mrt',ev:'ev_aa667_us_zr_mrt',h:21.5,late:0.25,place:'捷運站出口',title:'家附近的捷運站出口',travel:'走過去約 10 分鐘',travelH:1/6},
    ups:{id:'aa667_us_ps_call',ev:'ev_aa667_us_ps_call',h:23,late:0.5,place:'電話',verb:'接起來',no:'先不接',title:'沛珊打電話來',call:true,travel:'',travelH:0,back:'電話掛了。',silent:true} };
  const planAt=(G,k,day,h)=>plan(G,Object.assign({},S.OUTS[k],{day},h!=null?{h}:{}));

  /* ---------------- 手機（STORY.PHONE_RULES）---------------- */
  S.phone=function(G){ const P=P_(); if(!P||!law(G)) return; const F=G.flags||(G.flags={});
    if(JPR(G)) S.phoneJP(G,P,F); if(USR(G)) S.phoneUS(G,P,F); };

  /* 3/23 22:30 子晴的「你在家嗎」（2-1／7-1）：回覆只開到 23:00——在家先睡了＝22:30 被手機叫醒（HOME.WAKE；BB-B 11-07 19:4x：住家裡最常見的是人在家，選睡覺會直接睡到隔天、整場收不到）。條件照下面 S.phoneJP 那一條 */
  S.zqWakeAt=function(G){ if(!JPR(G)||!dating(G,ZQ)) return null; const F=G.flags||{}, dep=D('jpDep'); if(F.JP_DEPARTED!=null||dep==null||G.day>dep) return null;
    const d=S.slot(G,'JP','zq'); if(d==null||G.day!==d||sent(G,'aa667_jp_zq_bye_dm')) return null; return G.hour<22.5?22.5:null; };
  if(typeof HOME!=='undefined'&&Array.isArray(HOME.WAKE)) HOME.WAKE.push(G=>S.zqWakeAt(G));
  S.phoneJP=function(G,P,F){ const L=S.L, now=NOW(G), dep=D('jpDep'), out=F.JP_DEPARTED!=null, r=D('jpRet'), ret=typeof F.JP_RETURNED==='number'&&!F.JP_RETURN_LATE&&r!=null&&F.JP_RETURNED>=r&&F.JP_RETURNED<=r+1?F.JP_RETURNED:null;
    const before=!out&&dep!=null&&G.day<=dep;
    /* 2-1 子晴：出發前（住宿舍＝男一舍門口；住家裡＝7-1 家附近的便利商店門口）*/
    if(dating(G,ZQ)){ const X=L.jzq;
      { const d=S.slot(G,'JP','zq'), tag='aa667_jp_zq_bye_dm', Q=S.OUTS.jzq, Hm=S.dorm(G)?null:X.home;
        if(d!=null&&before&&due(G,{day:d,h:22.5})&&now<T(d,23)&&!sent(G,tag)){ S.pin(G,'JP','zq',d); const M=(Hm?Hm.dm:X.dm).map(t=>dm(ZQ,t)); M[M.length-1].ask={id:tag,until:T(d,23),opts:[{t:X.go}]}; P.at(G,d,22.5,M,tag); }
        const m=P.byAsk?P.byAsk(G,tag):null;
        if(d!=null&&m&&m.ans===0&&!outGet(G,Q.id)&&now<T(d,23.25)) planAt(G,Hm?'jzqHome':'jzq',d,Math.max(22.5+5/60,G.day===d?+G.hour||0:0));
        if(d!=null&&sent(G,tag)&&F.ZQ_JP_BYE==null&&now>=T(d,23.5)&&G.day<=d+1&&!sent(G,'aa667_jp_zq_bag')&&!(typeof OUT!=='undefined'&&OUT.isRunning&&OUT.isRunning(Q.id))){
          const q=outGet(G,Q.id); if(!q||q.state!=='done') P.at(G,d,23.5,(Hm?Hm.miss:X.miss).map(t=>dm(ZQ,t)),'aa667_jp_zq_bag'); } }   /* 沒回、或回了沒下去（不扣關係）*/
      /* 3/25 22:40（臺灣）*/
      if(out&&dep!=null){ const w=S.loc(G,dep,22+40/60); if(due(G,w)&&!sent(G,'aa667_jp_zq_dep')) P.at(G,w.day,w.h,X.dep.map(t=>dm(ZQ,t)),'aa667_jp_zq_dep'); }
      /* 8/5 22:10 回來那天 */
      if(ret!=null){ const tag='aa667_jp_zq_back'; if(due(G,{day:ret,h:22+10/60})&&!sent(G,tag)){ const q6=S.q6(G), M=X.back.concat([q6?X.backQ6:X.backNo]).map(t=>dm(ZQ,t));
          M[M.length-1].ask={id:tag,until:T(ret+1,q6?13:21),opts:[{t:X.backOpts[0],aa667:q6?'park':'night'},{t:X.backOpts[1],say:[{from:ZQ,text:X.backNoRep}]}]}; P.at(G,ret,22+10/60,M,tag); }
        const m=P.byAsk?P.byAsk(G,tag):null; if(m&&m.ans===0){ const o=m.ask.opts[0], k=o.aa667==='park'?'jzqPark':'jzqNight', h=S.OUTS[k].h; if(!outGet(G,S.OUTS[k].id)&&now<T(ret+1,h)+0.5) planAt(G,k,ret+1); } } }
    /* 2-2 語彤 */
    if(dating(G,YT)){ const X=L.jyt;
      { const d=F.AA667_YT_PASS; if(typeof d==='number'&&G.day<=d+1&&now>=T(d,22)&&!sent(G,'aa667_jp_yt_pass')) P.at(G,d,22,[me(YT,X.pass.me),dm(YT,X.pass.her)],'aa667_jp_yt_pass'); }   /* 「……還沒找到。」的那一晚 */
      /* 7-3 已經去過她家的：那一週平日 17:00 照傳（同 ytjob3d.js homePhone 的時間、選項）→「好。」＝當天 18:30 那一小場 */
      if(F.YT_HOME_SEEN&&F.YT_JP_BYE==null&&S.ytJp(G)){ const Q=S.OUTS.jytSeen, wd=typeof CALENDAR!=='undefined'?CALENDAR.dateOf(G.day).wd%7:0, h=((+G.hour||0)%24+24)%24, tag='aa667_jp_yt_inv_'+G.day;
        const pr=STORY.presence?STORY.presence(YT,G):null, inv=typeof YTJOB!=='undefined'&&YTJOB.HOME_INV?YTJOB.HOME_INV[0]:'……今天秀琴姨煮很多。你要不要來吃。';
        if(wd>=1&&wd<=5&&h>=17&&h<18.5&&!(pr&&pr.here===false)&&!outGet(G,Q.id)&&!sent(G,tag)) P.at(G,G.day,17,[Object.assign(dm(YT,inv),{ask:{id:tag,until:T(G.day,18.5),opts:[{t:'好。',set:{AA667_YT_GO:G.day}},{t:'今天不行。'}]}})],tag);
        if(F.AA667_YT_GO===G.day&&!outGet(G,Q.id)&&now<T(G.day,Q.h+Q.late)) planAt(G,'jytSeen',G.day); }
      if(out&&dep!=null){ const w=S.loc(G,dep,17+10/60); if(due(G,w)&&!sent(G,'aa667_jp_yt_dep')) P.at(G,w.day,w.h,X.dep.map(t=>dm(YT,t)),'aa667_jp_yt_dep'); }   /* 3/25 17:10（她 13:00～17:00 上班）*/
      { const d=D('jpYtBack'), tag='aa667_jp_yt_back'; if(d!=null&&F.JP_RETURNED!=null&&!F.JP_RETURN_LATE&&due(G,{day:d,h:20})&&!sent(G,tag)){ const M=X.back.map(t=>dm(YT,t)); M[M.length-1].ask={id:tag,until:T(d+1,18.5),opts:[{t:X.backGo,set:{AA667_YT_BACK:d+1}}]}; P.at(G,d,20,M,tag); }
        if(d!=null&&F.AA667_YT_BACK===d+1&&!outGet(G,S.OUTS.jyt.id)&&now<T(d+1,19)) plan(G,Object.assign({},S.OUTS.jyt,{day:d+1,ev:F.YT_HOME_SEEN?'ev_aa667_yt_back':'ev_yt_home_first'})); } }   /* 去過她家了＝只有秀琴姨那一問那一場；還沒去過＝第一次去她家（開頭加那一問）*/
    /* 2-3 芷若 */
    if(dating(G,ZR)){ const X=L.jzr;
      { const d=S.slot(G,'JP','zr'), tag='aa667_jp_zr_bye_dm'; if(d!=null&&before&&due(G,{day:d-1,h:21})&&now<T(d,22.5)&&!sent(G,tag)){ S.pin(G,'JP','zr',d); P.at(G,d-1,21,X.dm.map(t=>dm(ZR,t)),tag); }
        if(d!=null&&sent(G,tag)&&!out&&!outGet(G,S.OUTS.jzr.id)&&now<T(d,22.5)) planAt(G,'jzr',d); }
      if(out&&dep!=null){ const w=S.loc(G,dep,22+7/60); if(due(G,w)&&!sent(G,'aa667_jp_zr_dep')) P.at(G,w.day,w.h,X.dep.map(t=>dm(ZR,t)),'aa667_jp_zr_dep'); }
      if(ret!=null&&due(G,{day:ret,h:22+7/60})&&!sent(G,'aa667_jp_zr_back')) P.at(G,ret,22+7/60,[X.back,F.ZR_JP_CARD!=null?X.backCard:X.backNo].map(t=>dm(ZR,t)),'aa667_jp_zr_back'); }
    /* 2-4 沛珊 */
    if(dating(G,PS)){ const X=L.jps;
      { const d=S.slot(G,'JP','ps'); if(d!=null&&before&&!outGet(G,S.OUTS.jps.id)&&now>=T(d,21)&&now<T(d,23.5)){ S.pin(G,'JP','ps',d); planAt(G,'jps',d); } }   /* 那天晚上先排好（23:00 她打來）*/
      if(F.PS_JP_BYE!=null&&dep!=null&&due(G,{day:dep,h:9+50/60})&&!sent(G,'aa667_jp_ps_dep')) P.at(G,dep,9+50/60,X.dep.map(t=>dm(PS,t)),'aa667_jp_ps_dep');   /* 出發前（臺灣時間）*/
      if(ret!=null){ const tag='aa667_jp_ps_back'; if(due(G,{day:ret,h:23})&&!sent(G,tag)){ const M=X.back.map(t=>dm(PS,t)); M[M.length-1].ask={id:tag,until:T(ret+1,12),opts:[{t:X.backGo,say:X.backRep.map(t=>({from:PS,text:t}))}]}; P.at(G,ret,23,M,tag); } } }
    /* 2-5 學姊 */
    if(dating(G,SIS)){ const X=L.jsis;
      { const d=D('sisFly'); if(d!=null&&out&&F.JP_RETURNED==null){ const w=S.loc(G,d,9); if(due(G,w)&&!sent(G,'aa667_jp_sis_fly')) P.at(G,w.day,w.h,X.fly.map(t=>dm(SIS,t)),'aa667_jp_sis_fly'); } }   /* 臺灣 09:00＝當地 10:00 */
      if(ret!=null&&due(G,{day:ret,h:22})&&!sent(G,'aa667_jp_sis_back')) P.at(G,ret,22,X.back.map(t=>dm(SIS,t)),'aa667_jp_sis_back'); }
    /* 2-6 可昕 */
    if(dating(G,KX)&&ret!=null){ const X=L.jkx, tag='aa667_jp_kx_dm'; if(due(G,{day:ret,h:21})&&now<T(ret,22.5)&&!sent(G,tag)) P.at(G,ret,21,X.dm.map(t=>dm(KX,t)),tag);
      if(sent(G,tag)&&!outGet(G,S.OUTS.jkx.id)&&now<T(ret,22.5)) planAt(G,'jkx',ret); } };

  S.phoneUS=function(G,P,F){ const L=S.L, now=NOW(G), dep=D('usDep'), out=!!F.US_DEPARTED, arr=!!F.US_ARRIVED, rd=D('usRet'), ret=F.US_RETURNED!=null&&rd!=null&&G.day<=rd+1?rd:null;
    const before=!out&&dep!=null&&G.day<=dep;
    /* 3-1 以安 */
    if(dating(G,AN)){ const X=L.uan;
      { const d=S.slot(G,'US','an'), tag='aa667_us_an_dm', Q=S.OUTS.uan; if(d!=null&&before&&due(G,{day:d,h:20})&&now<T(d,Q.h+Q.late)&&!sent(G,tag)){ S.pin(G,'US','an',d); P.at(G,d,20,[dm(AN,X.dm)],tag); }
        if(d!=null&&sent(G,tag)&&!out&&!outGet(G,Q.id)&&now<T(d,Q.h+Q.late)) planAt(G,'uan',d); }
      if(arr&&dep!=null){ const w=S.air(G,dep,10+20/60); if(due(G,w)&&!sent(G,'aa667_us_an_fly')) P.at(G,w.day,w.h,X.fly.map(t=>dm(AN,t)),'aa667_us_an_fly'); }   /* 她下課（臺灣 10:20，祐廷在飛機上）*/
      if(ret!=null&&due(G,{day:ret,h:6})&&!sent(G,'aa667_us_an_land')) P.at(G,ret,6,[dm(AN,X.land)],'aa667_us_an_land'); }   /* 05:40 落地 */
    /* 3-2 子晴 */
    if(dating(G,ZQ)){ const X=L.uzq;
      { const d=S.slot(G,'US','zq'), tag='aa667_us_zq_dm'; if(d!=null&&before&&due(G,{day:d-1,h:21})&&now<T(d,22)&&!sent(G,tag)){ S.pin(G,'US','zq',d); const M=X.dm.map(t=>dm(ZQ,t));
          M[M.length-1].ask={id:tag,until:T(d,21),opts:[{t:X.opts[0]},{t:X.opts[1],say:[{from:ZQ,text:X.noRep}]}]}; P.at(G,d-1,21,M,tag); }
        const m=P.byAsk?P.byAsk(G,tag):null, Q=S.OUTS.uzq;
        if(d!=null&&m&&m.ans!=null&&!out&&!outGet(G,Q.id)){ const day=m.ans===0?d:d+1; if(now<T(day,Q.h+Q.late)) planAt(G,'uzq',day); } }   /* 「明天不行。」＝隔天（禮拜一）同一個時間 */
      if(arr&&dep!=null){ const w=S.air(G,dep,22.5); if(due(G,w)&&!sent(G,'aa667_us_zq_fly')) P.at(G,w.day,w.h,X.fly.map(t=>dm(ZQ,t)),'aa667_us_zq_fly'); } }
    /* 3-3 語彤 */
    if(dating(G,YT)){ const X=L.uyt;
      { const d=S.slot(G,'US','yt'), tag='aa667_us_yt_dm', Q=S.OUTS.uyt; if(d!=null&&before&&due(G,{day:d-1,h:21})&&now<T(d,Q.h+Q.late)&&!sent(G,tag)){ S.pin(G,'US','yt',d); P.at(G,d-1,21,X.dm.map(t=>dm(YT,t)),tag); }
        if(d!=null&&sent(G,tag)&&!out&&!outGet(G,Q.id)&&now<T(d,Q.h+Q.late)) planAt(G,'uyt',d); }
      { const d=D('usYtDown'); if(d!=null&&arr&&F.US_RETURNED==null){ const w=S.loc(G,d,20); if(due(G,w)&&!sent(G,'aa667_us_yt_down')) P.at(G,w.day,w.h,X.down.map(t=>dm(YT,t)),'aa667_us_yt_down'); } }   /* 說了「一次傳很多」，這天一定要傳 */
      if(ret!=null&&due(G,{day:ret,h:17+10/60})&&!sent(G,'aa667_us_yt_back')) P.at(G,ret,17+10/60,X.back.map(t=>dm(YT,t)),'aa667_us_yt_back'); }
    /* 3-4 芷若 */
    if(dating(G,ZR)){ const X=L.uzr;
      { const d=S.slot(G,'US','zr'), tag='aa667_us_zr_dm', Q=S.OUTS.uzr; if(d!=null&&before&&due(G,{day:d,h:20.5})&&now<T(d,Q.h+Q.late)&&!sent(G,tag)){ S.pin(G,'US','zr',d); const mv=S.movedN(G,'US','zr'); P.at(G,d,20.5,X.dm.map(t=>dm(ZR,later(t,X.later,mv))),tag); }   /* 7-5：往前一天＝「你後天就走了吧」（芷若被綁住、照理不會往前；舊存檔定在前一天的照換）*/
        if(d!=null&&sent(G,tag)&&!out&&!outGet(G,Q.id)&&now<T(d,Q.h+Q.late)) planAt(G,'uzr',d);
        const q=outGet(G,Q.id), gone=!q||q.state==='missed'||(q.state==='planned'&&now>T(q.day,q.h)+(q.late!=null?q.late:0.75)); if(d!=null&&sent(G,tag)&&F.ZR_US_BYE==null&&gone&&now>=T(d,22+7/60)&&G.day<=d+1&&!sent(G,'aa667_us_zr_miss')) P.at(G,d,22+7/60,[dm(ZR,X.miss)],'aa667_us_zr_miss'); }   /* 沒去（不扣關係）*/
      if(arr&&dep!=null){ const w=S.air(G,dep,22+7/60); if(due(G,w)&&!sent(G,'aa667_us_zr_fly')) P.at(G,w.day,w.h,X.fly.map(t=>dm(ZR,t)),'aa667_us_zr_fly'); }
      if(ret!=null&&due(G,{day:ret,h:6.98})&&!sent(G,'aa667_us_zr_back')) P.at(G,ret,6.98,X.back.map(t=>dm(ZR,t)),'aa667_us_zr_back'); }   /* 她英國那一週的訊息（msg3d.js ukDaily，07:00）前面 */
    /* 3-5 沛珊 */
    if(dating(G,PS)){ const X=L.ups;
      { const d=S.slot(G,'US','ps'); if(d!=null&&before&&!outGet(G,S.OUTS.ups.id)&&now>=T(d,21)&&now<T(d,23.5)){ S.pin(G,'US','ps',d); planAt(G,'ups',d); } }
      if(F.PS_US_BYE!=null&&dep!=null&&due(G,{day:dep,h:6+10/60})&&!sent(G,'aa667_us_ps_dep')) P.at(G,dep,6+10/60,X.dep.map(t=>dm(PS,t)),'aa667_us_ps_dep'); } };   /* 出發前（臺灣時間）*/

  /* ---------------- 12/23 她的聖誕邀約前面多的那幾則（fest3d.js FEST.ASK_PRE）、12/24 以安那一場的開頭（FEST.HEAD）---------------- */
  S.xmasPre=function(G,f){ if(!f||f.k!=='xmas'||f.y!==2028||!USR(G)||!G.flags||G.flags.US_RETURNED==null||!dating(G,f.id)) return null;
    const X={[AN]:S.L.uan.xmasPre,[ZQ]:S.L.uzq.xmasPre,[PS]:S.L.ups.xmasPre}[f.id]; return X?X.slice():null; };
  S.anHead=function(G,c){ if(!c||c.id!==AN||c.k!=='xmas'||c.y!==2028||c.mode==='video'||c.scene!=='總圖門口'||!USR(G)||!dating(G,AN)) return null; const X=S.L.uan;
    const air=G.flags.AN_SENDOFF==='went'||!!(G.events&&G.events.done&&G.events.done.ev_an_sendoff);   /* 3/25 有去送機（y34b3d.js ev_an_sendoff）*/
    return [X.head,air?X.headAir:X.headNoodle,X.head2].map(([w,t])=>({speaker:w,text:t})); };

  /* ---------------- 事件（2D；台詞照稿）---------------- */
  let LB=0;
  /* [說的人, 句子]、{when, then, else}、{choice:[{t, say, set}]}、{set}、{call} → EVENTS 的行 */
  S.comp=function comp(items,cond){ const out=[], wrap=l=>{ if(cond) l.if={custom:cond}; return l; };
    for(const it of items){ if(!it) continue;
      if(Array.isArray(it)){ out.push(wrap({speaker:it[0],text:it[1]})); continue; }
      if(it.when){ const w=it.when, c1=cond?(G=>cond(G)&&w(G)):w, c2=cond?(G=>cond(G)&&!w(G)):(G=>!w(G)); out.push(...comp(it.then||[],c1)); if(it.else) out.push(...comp(it.else,c2)); continue; }
      if(it.choice){ const id='aa667c'+(++LB), end=id+'_e'; out.push(wrap({choice:it.choice.map((o,k)=>Object.assign({text:o.t,goto:id+'_'+k},o.set?{set:o.set}:{},o.if?{if:{custom:o.if}}:{}))}),{goto:end});
        it.choice.forEach((o,k)=>{ out.push({label:id+'_'+k}); out.push(...comp(o.say||[],null)); out.push({goto:end}); }); out.push({label:end}); continue; }
      if(it.shift&&it.line){ out.push(...comp([shiftLine(it.shift[0],it.shift[1],it.line[0],it.line[1])],cond)); continue; }   /* 講出發「明天」的句子（7-5）*/
      if(it.set){ out.push(wrap({set:it.set})); continue; }
      if(it.call){ out.push(wrap({call:it.call})); continue; } }
    return out; };
  const ev=(id,title,parts,sc,body,o)=>Object.assign({id,title,participants:parts,location:'any',trigger:'outing',once:true,background:'dark',hours:1,
    dialogue:[Object.assign({},sc)].concat(S.comp(body))},o||{});   /* sc＝第一行的地點字幕與背景（電話不給背景：人在家＝家裡的背景，events3d.js）*/
  const mark=k=>G=>{ if(G.flags[k]==null) G.flags[k]=G.day; };
  const L=S.L;
  /* 7-1 住家裡那一場：照 2-1，「剛從系館出來。順路。」換成 home.swap[1] */
  const zqHomeS1=()=>L.jzq.s1.map(([w,t])=>w===ZQ&&t===L.jzq.home.swap[0]?[ZQ,L.jzq.home.swap[1]]:(w==null&&t===L.jzq.home.open[0][1]?[null,L.jzq.home.open[1][1]]:[w,t]));   /* 7-1：開頭旁白也換（AA-B 11-07 18:47，企劃線 0ba033578）*/
  const zqBody=s1=>[...s1,{choice:L.jzq.opts},...L.jzq.s2,{when:G=>S.q6(G),then:[L.jzq.q6],else:[L.jzq.noQ6]},L.jzq.end];
  /* 7-2 沛珊 3/24：住家裡「你回宿舍了嗎？」→「你回家了嗎？」*/
  const psHomeCall=()=>L.jps.call.map(([w,t])=>[w,String(t).split(L.jps.swapHome[0]).join(L.jps.swapHome[1])]);
  /* 7-5 沛珊 8/1：往前一天的那一場「你明天幾點出門？」→「你後天幾點出門？」（兩個地方都換）*/
  const psAsk=()=>shiftLine('US','ps',PS,L.ups.ask[1]);
  /* 2-2 從「秀琴姨從廚房拿了一張紙出來」到最後（7-3 那一小場；第一次去她家那一版走 S.ytHomeTail）*/
  const ytBye=()=>[...L.jyt.bye,{choice:L.jyt.opts.map(o=>o.pass?Object.assign({},o,{say:o.say.concat([{call:G=>{ G.flags.AA667_YT_PASS=G.day; }}])}):o)},...L.jyt.bye2];
  S.EVENTS=[
    ev('ev_aa667_jp_zq_bye','子晴在宿舍樓下',[ZQ],{scene:L.jzq.scene,bg:'dark'},zqBody(L.jzq.s1),{hours:0.5,after:mark('ZQ_JP_BYE')}),
    ev('ev_aa667_jp_zq_bye_home','子晴在便利商店門口',[ZQ],{scene:L.jzq.home.scene,bg:'dark'},zqBody(zqHomeS1()),{hours:0.5,after:mark('ZQ_JP_BYE')}),
    ev('ev_aa667_jp_zr_bye','打烊以後',[ZR],{scene:'2:30 AM・打烊後',bg:'cafe_night'},[...L.jzr.s1,{when:G=>Array.isArray(G.flags.ZR_CARDS_SENT)&&G.flags.ZR_CARDS_SENT.length>0,then:[...L.jzr.cards,{choice:L.jzr.cardOpts},L.jzr.cards2],else:[L.jzr.noCards]}],{after:mark('ZR_JP_BYE')}),
    ev('ev_aa667_jp_ps_call','沛珊打電話來',[],{scene:'電話'},[{when:G=>S.dorm(G),then:L.jps.call,else:psHomeCall()},{choice:L.jps.opts1},...L.jps.mid,{choice:L.jps.opts2},L.jps.end],{hours:0.5,after:mark('PS_JP_BYE')}),
    ev('ev_aa667_jp_zq_park','溫州街的公園',[ZQ],{scene:'溫州街的公園',bg:'wenzhou_park'},L.jzq.park,{hours:2}),
    ev('ev_aa667_jp_zq_night','公館宵夜',[ZQ],{scene:'公館宵夜',bg:'gongguan_luwei'},L.jzq.night,{hours:1}),
    ev('ev_aa667_jp_kx_video','可昕的視訊',[KX],{scene:'視訊',bg:'video'},[...L.jkx.v1,{choice:L.jkx.opts},...L.jkx.v2],{hours:0.5,outingMissed:(G,GM,q)=>S.kxMissed(G,q)}),
    ev('ev_aa667_jp_yt_bye','去語彤家吃飯',[YT],{scene:'新生南路・她家',bg:'yt_home'},[...L.jyt.seen,...ytBye()],{hours:2,after:mark('YT_JP_BYE')}),   /* 7-3 已經去過她家的 */
    ev('ev_aa667_yt_back','去語彤家吃飯',[YT],{scene:'新生南路・她家',bg:'yt_home'},[L.jyt.head,{choice:L.jyt.headOpts.map(o=>Object.assign({},o,o.bye?{if:G=>G.flags.YT_JP_BYE!=null}:{}))}],{hours:2}),
    ev('ev_aa667_us_an_video','以安的視訊',[AN],{scene:'視訊',bg:'video'},[...L.uan.v1,{choice:L.uan.opts},...L.uan.v2],{hours:0.5,after:mark('AN_US_BYE')}),
    ev('ev_aa667_us_zq_night','公館宵夜',[ZQ],{scene:'公館宵夜',bg:'gongguan_luwei'},[...L.uzq.s1,{choice:L.uzq.sOpts},{when:G=>S.q6(G),then:[L.uzq.q6],else:[L.uzq.noQ6]},...L.uzq.s2],{hours:1,after:mark('ZQ_US_BYE')}),
    ev('ev_aa667_us_yt_tea','一盞茶屋',[YT],{scene:'一盞茶屋・前院',bg:'wenzhou_teahouse'},[...L.uyt.s1,{choice:L.uyt.opts},...L.uyt.s2],{hours:1,after:mark('YT_US_BYE')}),
    ev('ev_aa667_us_zr_mrt','捷運站出口',[ZR],{scene:L.uzr.scene,bg:'dark'},L.uzr.s1,{hours:0.25,after:mark('ZR_US_BYE')}),
    ev('ev_aa667_us_ps_call','沛珊打電話來',[],{scene:'電話'},[psAsk(),{choice:[L.ups.six,{t:L.ups.how.t,say:L.ups.how.say.concat([psAsk(),{choice:[L.ups.six]}])}]}],{hours:0.5,after:mark('PS_US_BYE')}) ];   /* 「妳最近好嗎？」之後也接「你明天幾點出門？」那一段（稿 3-5）*/
  /* 可昕沒接：22:30「好喔。明天再打。」、隔天 22:00 同一場（只演一次）*/
  S.kxMissed=function(G,q){ if(!q||q.id!==S.OUTS.jkx.id||typeof PHONE==='undefined') return; PHONE.at(G,q.day,22.5,[dm(KX,L.jkx.miss)],'aa667_jp_kx_miss'); planAt(G,'jkx2',q.day+1); };

  /* ---------------- 2-2 語彤家那一頓（ytjob3d.js HOME_EV 叫的兩個地方）---------------- */
  S.ytJp=G=>JPR(G)&&dating(G,YT)&&G.flags.JP_DEPARTED==null&&(a=>a!=null&&G.day>=a)(D('jpYtFrom'))&&(b=>b!=null&&G.day<=b)(D('jpYtTo'));   /* 日本路線出發前那一週答應的那一次 */
  S.ytBackOn=G=>JPR(G)&&G.flags.AA667_YT_BACK===G.day;   /* 8/8 那一頓 */
  const run=async(GM,lines,id)=>{ if(typeof EVENTS!=='undefined'&&EVENTS.runLines) await EVENTS.runLines(lines,{id,participants:[YT]}); };
  S.ytHomeHead=async function(GM){ const G=GM.G; if(!S.ytBackOn(G)) return false; await run(GM,S.comp([L.jyt.head,{choice:L.jyt.headOpts.map(o=>Object.assign({},o,o.bye?{if:G2=>G2.flags.YT_JP_BYE!=null}:{}))}]),'aa667_yt_head'); return true; };
  S.ytHomeTail=async function(GM){ const G=GM.G; if(!S.ytJp(G)||G.flags.YT_JP_BYE!=null) return false;
    await run(GM,S.comp([...L.jyt.bye,{choice:L.jyt.opts.map(o=>Object.assign({},o,o.pass?{set:{AA667_YT_PASS:G.day}}:{}))},...L.jyt.bye2]),'aa667_yt_jp');
    G.flags.YT_JP_BYE=G.day; return true; };

  /* ---------------- 日本那幾個月的摘要日（JP.SCH）：4/19 以後第一個摘要日（挽回中 5/3 g4_s 後面、交往中 6/28 g7_s 後面）---------------- */
  const rep=G=>!dating(G,AN);
  const sumDone=(G,k)=>!!(G.flags.AA667_JPSUM&&G.flags.AA667_JPSUM[k]!=null);
  const sumSay=(G,k,line,flag)=>{ const F=G.flags, M=F.AA667_JPSUM&&typeof F.AA667_JPSUM==='object'?F.AA667_JPSUM:(F.AA667_JPSUM={}); if(M[k]==null) M[k]=G.day; if(flag&&F[flag]==null) F[flag]=G.day; return line; };
  S.SCH=[ {k:'aa667_yt_0503',d:'2028-05-03',h:18.5,w:'jp',if:G=>rep(G)&&G.flags.YT_JP_BYE!=null&&!sumDone(G,'yt'),sum:G=>sumSay(G,'yt',L.jyt.sum)},
    {k:'aa667_zr_0503',d:'2028-05-03',h:18.5,w:'jp',if:G=>rep(G)&&G.flags.ZR_JP_BYE!=null&&!sumDone(G,'zr'),sum:G=>sumSay(G,'zr',L.jzr.sum,'ZR_JP_CARD')},
    {k:'aa667_yt_0628',d:'2028-06-28',h:18.5,w:'jp',if:G=>G.flags.YT_JP_BYE!=null&&!sumDone(G,'yt'),sum:G=>sumSay(G,'yt',L.jyt.sum)},
    {k:'aa667_zr_0628',d:'2028-06-28',h:18.5,w:'jp',if:G=>G.flags.ZR_JP_BYE!=null&&!sumDone(G,'zr'),sum:G=>sumSay(G,'zr',L.jzr.sum,'ZR_JP_CARD')} ];   /* 芷若：說了要寄，一定要寄到（記 ZR_JP_CARD）*/

  /* ---------------- 別的系統要問的 ---------------- */
  S.zqAskBlock=(G,id,day0)=>id===ZQ&&JPR(G)&&dating(G,ZQ)&&day0===(typeof G.flags.JP_RETURNED==='number'?G.flags.JP_RETURNED:D('jpRet'));   /* 2-1：回來那天她的一般邀約延到隔天以後（heroine_asks3d.js）*/
  S.zq2Skip=(G,d)=>USR(G)&&dating(G,ZQ)&&d===D('usDep');   /* 3-2：8/2 那天的「今天又改了三個 bug」由 8/2 22:30 那三則取代（cracktalk3d.js）*/
  /* 7-4：日本路線 8/7 那串傳了（「我明天在臺北。後天回淡水。」）＝8/8 她在臺北（AA_675 暑假平日在淡水的例外；story3d.js STORY.VAC_STAY）*/
  S.ytTaipei=(G,id)=>id===YT&&!!G&&!!G.flags&&(d=>d!=null&&G.day===d+1)(D('jpYtBack'))&&JPR(G)&&sent(G,'aa667_jp_yt_back');   /* presence 常常被叫：先看日子 */
  /* 8/8 那天 ytjob3d.js 第一次去她家那則（17:00「……今天秀琴姨煮很多。」）不另外傳：8/7 那串已經約了 8/8（答應的那一頓照 S.OUTS.jyt）*/
  S.ytHomeSkip=G=>S.ytTaipei(G,YT);

  /* ---------------- 登記 ---------------- */
  if(Array.isArray(STORY.PHONE_RULES)) STORY.PHONE_RULES.push(G=>S.phone(G));
  if(typeof STORY_EVENTS!=='undefined') for(const e of S.EVENTS) if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e);
  if(typeof JP!=='undefined'&&Array.isArray(JP.SCH)) for(const s of S.SCH) if(!JP.SCH.some(q=>q.k===s.k)) JP.SCH.push(s);
  if(typeof FEST!=='undefined'){ if(Array.isArray(FEST.ASK_PRE)) FEST.ASK_PRE.push((G,f)=>S.xmasPre(G,f)); if(Array.isArray(FEST.HEAD)) FEST.HEAD.push((G,c)=>S.anHead(G,c)); }
  if(typeof HASK!=='undefined'&&Array.isArray(HASK.SEND_BLOCK)) HASK.SEND_BLOCK.push((G,id,day0)=>S.zqAskBlock(G,id,day0));
  if(typeof CRACKTALK!=='undefined'&&Array.isArray(CRACKTALK.ZQ2_SKIP)) CRACKTALK.ZQ2_SKIP.push((G,d)=>S.zq2Skip(G,d));
  if(Array.isArray(STORY.VAC_STAY)) STORY.VAC_STAY.push((G,id)=>S.ytTaipei(G,id));
  return S;
})();
