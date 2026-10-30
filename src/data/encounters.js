/* 自由出行的偶遇第一批（DL-07）：AA_160 第 5 節（5-6 統整）＋ BB_144 第 1～4 節（BB 五位）＋ AA_162 第 1～4 節（AA 六位）；企劃線 claude/cool-heisenberg-o8kuqx（1a708adc 一帶）。
   台詞照抄，不在這裡改內容；{name}＝玩家的名字。第一批只有「打招呼」「不打擾」（前任：「點頭」「走過去」「打招呼」）；一起走一段、重訪、支線是第三批（DL-08）。
   每一列：
     who 人物、spot 景點、why 旁白（她在做什麼）、days 星期、from～to 時段、terms 哪幾個學期（null＝全部；交換、休學、出國的學期不寫）、weeks 'odd'/'even'（學期的單週／雙週）或陣列（第幾週）、
     dates 日期區間（含頭尾）、vacation 只在寒暑假（AA_271）、
     stageMin 最少要多熟、flags 還要哪些劇情旗標（只讀不寫）、busy（第三批用；'yes' 才會不能聊）、join（第三批）、memo 第一次在這裡打招呼留的記憶（ENC_ 開頭）、
     away 作息上掛的字（characters.js 也有同一筆，朋友頁的位置照它）、lines 認識／朋友以上／交往中的兩句、ex 前任的反應（照分開的方式）。
   可昕不在台大的作息表：只看這一列的時間（BB_144 第 1 節）。 */
const ENCOUNTERS={
  /* 前任的分開方式（ROMANCE_HISTORY 的 how）→ 用哪一句；沒有寫到的組合用 BB_144 第 2 節「抓包退回朋友」那一句旁白（點頭不說話），不另外編台詞 */
  NOD:'（她看了你一眼，點了一下頭，走了。）',
  rows:[
    // ---- D04 西門町 ----
    {who:'heroine_02',spot:'D04',why:'她一個人來看電影。',days:[6],from:18,to:22,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S2'],stageMin:'ACQUAINTANCE',busy:{until:19.5,then:'no',before:'short'},join:'friend',memo:'ENC_D04_ZR',away:'在西門町看電影',
      lines:{acq:['你也來看電影？……我常常一個人來。','我看的是那部老片。你大概不會喜歡。'],friend:['你今天看哪一部？……那部的結尾很好，不要先查。','我坐倒數第三排。你要是也進來，坐前面一點。'],dating:['……你怎麼在這裡？我剛好多一個小時。','那我們一起看。你坐我旁邊，不要坐前面。']},
      ex:{apart_life:['……嗨。這部片很好。你可以去看。']},src:'BB_144 1、3-1'},
    {who:'heroine_04',spot:'D04',why:'她在大型電玩店的節奏遊戲機前面。',days:[6],from:18,to:21,terms:null,stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:null,away:'在西門町打電動',
      lines:{all:['欸不是，你看到我打歪的那一首了吧。……忘掉。']},ex:{apart_drift:['欸不是……好久不見。我要回去改 bug 了。']},src:'BB_144 1、3-6'},
    {who:'kexin',spot:'D04',why:'她和予樂在電影院門口排隊。',days:[6],from:18.5,to:21,terms:null,stageMin:null,kexin:true,busy:'short',join:'dating',memo:null,
      lines:{dating:['你也來看這部？……那我們兩個是不是要假裝不認識予樂。']},ex:{kx_b:['……嗨。','……今天就當沒遇到，好不好。'],kx_bNarr:'（她笑了一下，跟予樂走了。）'},src:'BB_144 1、2、3-6'},
    {who:'zhe',spot:'D04',why:'他和系籃的人蹲在一家排隊的店門口。',days:[6],from:19,to:22,terms:null,stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D04_ZHE',away:'在西門町',
      lines:{acq:['欸，你也在這！','我們系籃的在等位子，等四十分鐘了，你說扯不扯？……很扯。'],friend:['哥！來得好，幫我們排一下，我去買飲料。','……排完一起吃？吃完再走。']},src:'AA_162 1、2-4'},
    {who:'yu',spot:'D04',why:'她在一家二手衣店裡，兩手各拿一件外套。',days:[6],from:17,to:20,terms:null,stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:'ENC_D04_YU',away:'在西門町',
      lines:{acq:['欸！{name}？你也來逛？','對了，我在幫社團學姊挑外套，你覺得哪件——你一定說都一樣。'],friend:['欸你來評評理，這兩件明明不一樣，她們說一樣。','……對，是一樣。我只是想要有人跟我說不一樣。']},src:'AA_162 1、2-4'},
    {who:'classmate_xinci',spot:'D04',why:'她在一家賣偶像周邊的小店門口排隊。',days:[6],from:20,to:23,terms:null,stageMin:'ACQUAINTANCE',busy:'short',join:false,memo:'ENC_D04_XC',away:'在西門町',
      lines:{acq:['……{name}？','我在排一張小卡。這是一件很重要的事。'],friend:['我在排一張小卡，排四十分鐘了。','前面還有十幾個人，你不要笑喔。']},src:'AA_162 1、2-4'},   /* friend：AA_209 附錄A §2 */
    // ---- D06 臺北市立美術館 ----（沛珊大三起的美術館那一列拿掉：AA_282 第 5 節第 1 點，她在台南、不來臺北；D20 烏來、D08 大三下／大四下同，AA_342 C2）
    {who:'heroine_05',spot:'D06',why:'她站在一幅畫前面，手上拿著展覽的說明。',days:[0],from:13,to:16,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S2'],stageMin:'ACQUAINTANCE',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D06_SIS',away:'在美術館',
      lines:{acq:['學弟。……你也看展？','我排了兩個小時。還剩四十分鐘。'],friend:['這一區的說明牌，我每一塊都讀完了。','……你不用。看你想看的就好。'],dating:['你來了。……我沒有約你。','我剛剛還在想，你在就好了。']},
      ex:{apart_talk:['學弟。……我先走了。']},src:'BB_144 1、3-3'},
    {who:'heroine_01',spot:'D06',why:'她站在一張城市地圖的作品前面，手上拿著小筆記本。',days:[0],from:10,to:13,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y4S1','Y4S2'],stageMin:'ACQUAINTANCE',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D06_AN',away:'在美術館',
      lines:{acq:['……你也來？','我十二點半要走。下午有排。'],friend:['這一區我看完了。旁邊那一區，你要一起看嗎？不用勉強。','我有一張表，十二點半要走。……表是我自己排的，可以改十分鐘。'],dating:['你怎麼知道我在這裡？……你不知道。好，那是巧合。','巧合我接受。十二點半以前都是你的。']},
      ex:{apart_life:['嗨。這一區很好，你慢慢看。'],apart_lifeNarr:'（她先走了。）',apart_drift:['……{name}。','我十二點半要走。']},src:'AA_162 1、2-1、3'},
    {who:'classmate_bohan',spot:'D06',why:'他坐在展廳的長椅上，手上沒有書。',days:[0],from:10,to:12,terms:['Y3S1','Y3S2','Y4S1','Y4S2'],stageMin:'FAMILIAR',busy:'no',join:'friend',memo:'ENC_D06_BH',away:'在美術館',
      lines:{acq:['……{name}。','我在休息。這裡沒有人會問我考幾分。'],friend:['我每個月來一次。','坐兩個小時，回去讀得比較快。']},src:'AA_162 1、2-4'},
    // ---- D12 大稻埕碼頭與迪化街 ----
    {who:'heroine_04',spot:'D12',why:'她坐在碼頭邊，膝上開著筆電。',days:[0],from:16,to:19,terms:null,weeks:'odd',stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D12_ZQ',away:'在大稻埕',
      lines:{acq:['你也來這裡？','我在寫東西。河邊比較好想。'],friend:['你來得剛好。幫我玩一次。','……你死在第三關。很好，代表那裡太難了。'],dating:['欸不是……你跟蹤我？','好啦，我很高興。']},
      ex:{apart_drift:['欸不是……好久不見。我要回去改 bug 了。']},src:'BB_144 1、3-2'},
    {who:'classmate_peishan',spot:'D12',why:'她在一間舊書店門口翻繪本。',days:[6],from:15,to:18,terms:['Y1S1','Y1S2','Y2S1'],weeks:'even'/* AA_372 第 6 節第 8 題：大一上到大二上只排雙數週的週六（單數週她回台中；作息 characters.js 同）*/,stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:'ENC_D12_PS',away:'在迪化街找舊書',
      lines:{acq:['啊，嗨！……我在找一本舊的繪本。','找到了我就回去。你也逛逛。'],friend:['你來得正好。幫我看這兩本，哪一本小孩會喜歡？','……你選的那本字比較少。對，就是這本。'],dating:['……你怎麼知道我在這裡？','不知道也來了？那我們一起找。書單有七本。']},src:'BB_144 1、3-4'},
    {who:'heroine_03',spot:'D12',why:'她拿著相機，蹲在一間南北貨行的騎樓下。',days:[0],from:15,to:18,terms:null,weeks:'odd',stageMin:'ACQUAINTANCE',busy:{y12:'no',y3:'short'},join:'friend',memo:'ENC_D12_YT',away:'在大稻埕拍照',
      lines:{acq:['……你？','我在拍老闆娘包貨的手，課堂作業。'],friend:['（她把鏡頭蓋遞給你）「拿一下。」','這條街好多店都是阿公阿嬤在顧。'],/* AA_209 附錄A §2 */dating:['……你跟來的？','沒有？那你運氣很好。我剛好拍完。']},
      ex:{apart_life:['……嗨。'],apart_lifeNarr:'（她舉起相機，示意她在忙。）',apart_driftNarr:'（她看到你，把相機收起來，走進騎樓另一邊。）'},src:'AA_162 1、2-2、3'},
    // ---- D13 淡水金色水岸 ----
    {who:'kexin',spot:'D13',why:'她和予樂、邵鈞坐在河邊等夕陽。',days:[0],from:16.5,to:19,terms:null,stageMin:null,kexin:true,busy:'short',join:'dating',memo:'ENC_D13_KX',memoIf:'dating',
      lines:{dating:['你怎麼也在淡水？','……好，不用解釋了。予樂，我先走，他來了。'],datingAfter:{who:'予樂',text:'我們什麼都沒看到。邵鈞，走。'}},
      ex:{kx_b:['……嗨。','……今天就當沒遇到，好不好。'],kx_bNarr:'（她笑了一下，跟予樂走了。）',kx_c:['好久不見。……夕陽還是一樣。','我們要回去了。你慢慢看。']},src:'BB_144 1、2、3-5'},
    {who:'heroine_03',spot:'D13',why:'她一個人坐在河邊，這次沒有拍照。',days:[0],from:16,to:18,terms:null,weeks:'even',stageMin:'FRIEND',flags:['WISH_DONE_heroine_03'],noEx:true,busy:'no',join:true,memo:null,away:'在淡水',
      lines:{friend:['……又是你。','上次是兩個人。這次是一個人。也很好。'],dating:['你也來了。','那就又是兩個人了。']},src:'AA_162 1、2-3（心願以後；前任不出現在 D13）'},
    /* ---- 第三批景點（spots_v3）的 AA 六位：AA_271 第 1 節（AA-C 01e9d706，2026-10-17）。避開 BB_213 的時段；外縣市只放住在那裡的人。
       dates＝日期區間（含頭尾）；vacation＝寒暑假；weeks 寫陣列＝學期的第幾週。 */
    // ---- D26 臺中（以安回台中的日子：AA_197 1-4、AA_244、AA_199 7-5；大三寒假留臺北、大三暑假在日本＝沒有）----
    {who:'heroine_01',spot:'D26',why:'她坐在審計新村一間小店門口的階梯上，手上拿著一張寫滿字的購物清單。',days:[6],from:14,to:17,terms:null,dates:[['2025-09-27','2025-09-27'],['2025-11-22','2025-11-22'],['2026-01-20','2026-02-20'],['2026-07-25','2026-08-08'],['2027-02-01','2027-02-20'],['2027-07-24','2027-08-07'],['2029-02-09','2029-02-17']]/* AA_372 第 6 節第 8 題：加大一上第 4、8、12 週的週六（她回台中的週末）；AA_383 第 2 節（企劃線 98516b51）：第 8 週 10/25 是期中考週、約不成也就碰不到，拿掉，只留 9/27、11/22 */,stageMin:'ACQUAINTANCE',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D26_AN',away:'在台中',
      lines:{acq:['{name}？你怎麼在臺中。','我在幫我媽買東西。清單還有四樣，我先走了。'],friend:['你來臺中，怎麼沒先講？','我媽要的東西還沒買完。你要一起的話，走這邊。'],dating:['你來了也不跟我說。','我五點前要回家吃飯。在那之前，你跟著我。']},
      ex:{apart_life:['嗨。這邊的店都不錯，你慢慢逛。'],apart_lifeNarr:'（她先走了。）',apart_drift:['……{name}。','我在幫我媽買東西。']},src:'AA_271 1、1-1、1-2'},
    // ---- D14 淡水漁人碼頭（語彤：心願 D13 以後，寒暑假的週日；雨天沒有；前任不出現）----
    {who:'heroine_03',spot:'D14',why:'她坐在渡輪站的長椅上，手上拿著一張回淡水的船票。',days:[0],from:15,to:19,terms:null,vacation:true,stageMin:'FRIEND',flags:['WISH_DONE_heroine_03'],noEx:true,busy:'no',join:true,memo:'ENC_D14_YT',away:'在漁人碼頭',
      lines:{friend:['你也來這邊？','我在等船。下一班還有二十分鐘。'],dating:['你怎麼也在這。','船還要二十分鐘。你要不要一起坐回淡水。']},src:'AA_271 1、1-1'},
    // ---- D11 新北投（柏翰：大一下～大二下，每學期第 6、7 週週日；大三起週日上午在 D06）----
    {who:'classmate_bohan',spot:'D11',why:'他坐在北投圖書館靠窗的位子，桌上攤著一疊考古題，旁邊放著一個便當。',days:[0],from:10,to:16,terms:['Y1S2','Y2S1','Y2S2'],weeks:[6,7],stageMin:'FAMILIAR',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D11_BH',away:'在北投讀書',
      lines:{acq:['{name}？','總圖這兩週都搶不到位子，我就來這裡。我還有兩題，先不聊。'],friend:['你也是來讀書的？看起來不是。','我要去吃飯了。你要一起的話，我知道哪裡有椅子。']},src:'AA_271 1、1-1'},
    // ---- D01 華山（Alison：大三起，第 3、6、11、14 週週日；避開子晴的第 5、12 週）----
    {who:'yu',spot:'D01',why:'她一個人站在展場出口的蓋章台前面，在小冊子上蓋章。',days:[0],from:13,to:17,terms:['Y3S1','Y3S2','Y4S1','Y4S2'],weeks:[3,6,11,14],stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D01_YU',away:'在華山看展',
      lines:{acq:['欸！{name}？你也來看展？','我在蓋章。這個展有六個章，我只找到五個。'],friend:['欸你來得剛好，你有看到第六個章在哪嗎？','我繞兩圈了。……可能根本沒有第六個。']},src:'AA_271 1、1-1'},
    // ---- D02 松菸（芯慈：第 4、12 週週日；芷若是週六）----
    {who:'classmate_xinci',spot:'D02',why:'她在一間特展的出口，手上拎著一個紙袋，正在對收據。',days:[0],from:13,to:17,terms:null,weeks:[4,12],stageMin:'ACQUAINTANCE',busy:'short',join:false,memo:'ENC_D02_XC',away:'在松菸看展',
      lines:{acq:['{name}？你也來松菸。','我來看一個設計展。周邊買太多了，在對收據。'],friend:['你來得剛好，幫我看一下這張收據是不是算錯。',{narr:'（你看了一下。沒算錯。）'},'……是我買太多。']}   /* AA_313 5-6：原本旁白和祐廷那句都在她的台詞裡（會顯示成芯慈說）；{narr} 是旁白（encounter3d.js）*/,src:'AA_271 1、1-1'},
    // ---- D29 高雄駁二（阿哲回高雄的日子：寒假 1/2～2/19、暑假 7/1～8/20，除夕到初三在家不排；大一寒假到大四寒假。除夕照 calendar.js 的 LUNAR）----
    //      AA_350 S7（2026-10-21）：大二～大四寒假改成「回高雄的隔天～回臺北的前一天」：2027-01-06～02-19、2028-01-05～02-19、2029-01-04～02-16（除夕～初三照舊不排）；characters.js 阿哲作息的 D29 那一筆同一組日子
    {who:'zhe',spot:'D29',why:'他和兩個高中同學坐在港邊的台階上，三個人在分一包鹹酥雞。',days:[6],from:14,to:17.5,terms:null,dates:[['2026-01-02','2026-02-15'],['2026-07-01','2026-08-20'],['2027-01-06','2027-02-04'],['2027-02-09','2027-02-19'],['2027-07-01','2027-08-20'],['2028-01-05','2028-01-24'],['2028-01-29','2028-02-19'],['2028-07-01','2028-08-20'],['2029-01-04','2029-02-11'],['2029-02-16','2029-02-16']],stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D29_ZHE',away:'在高雄',
      lines:{acq:['欸？你怎麼在高雄！','我同學說駁二沒什麼好逛。你看，台北的人都跑來了。'],friend:['哥！你來高雄怎麼沒跟我說？','吃一塊。這家我們高中吃到大，台北吃不到。']},src:'AA_271 1、1-1'},
    /* ---- 第三批景點的 BB 五位：BB_213 第 1、2 節（BB-C；AA-C 核對通過 b0c20f70，2026-10-17）。一人一處；心願地點、外縣市不放；週次避開 AA 六位。 ---- */
    {who:'heroine_04',spot:'D01',why:'她在週末市集的一攤前面，手上拿著一個像素的鑰匙圈。',days:[0],from:15,to:18,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'],weeks:[4,10],stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:'ENC_D01_ZQ',away:'在華山逛市集',
      lines:{acq:['……你也來華山。','我在看這個鑰匙圈。點陣的，跟我畫的很像。'],friend:['你看這個。一隻像素貓，十六乘十六。','老闆說是自己點的。我想問他用什麼軟體，又不敢問。'],dating:['你怎麼也在這裡？','剛好。幫我挑一個，我挑不下去。']},
      ex:{apart_drift:['好久不見。我逛完了，先走。']},src:'BB_213 1、2'},
    {who:'heroine_02',spot:'D02',why:'她坐在書店門口的長椅上，手上一本電影書，旁邊放著一張票根。',days:[6],from:13,to:17,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S2'],weeks:[3,11],stageMin:'ACQUAINTANCE',busy:'short',join:'friend',memo:'ENC_D02_ZR',away:'在松菸看電影',
      lines:{acq:['你也來松菸？','我剛看完早場。在等下一場。'],friend:['早場的人很少。我一個人坐一整排。','下一場四點。你要不要也看？不看也沒關係。'],dating:['你怎麼在這裡？','下一場還有一個小時。陪我坐一下就好。']},
      ex:{apart_life:['嗨。這裡的書店很好，你慢慢逛。']},src:'BB_213 1、2'},
    {who:'heroine_05',spot:'D11',why:'她坐在北投圖書館的木頭陽台上，桌上攤著一本書和計畫本。',days:[6],from:10,to:15,termFrom:{Y3S1:13},terms:['Y2S1','Y2S2','Y3S1','Y3S2','Y4S2'],weeks:[6],stageMin:'ACQUAINTANCE',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D11_SIS',away:'在北投圖書館',
      lines:{acq:['學弟。你也來北投？','我每個月來這裡讀一次書。這裡比法圖安靜。'],friend:['這裡的位子要早點來，我九點就到了。','你要坐的話，我旁邊還有一個。'],dating:['你怎麼也在北投？','我還要讀一個小時。讀完一起去泡腳。']},
      ex:{apart_talk:['學弟。我讀完這一章就走。']},src:'BB_213 1、2（大四上在美國，BB_204 4c）'},
    {who:'classmate_peishan',spot:'D08',why:'她在企鵝館門口，數著一排戴黃帽子的小孩。',days:[6],from:9,to:13,terms:['Y1S2'],weeks:[9],stageMin:'ACQUAINTANCE',busy:'short',join:true,exAsAcq:true,memo:'ENC_D08_PS',away:'帶課輔班去動物園',
      lines:{acq:['{name}！我們課輔班來校外教學。','他們一直問企鵝會不會冷。我也不知道。'],friend:['你可以幫我數一下嗎？應該是十二個。','我數了三次，每次都不一樣。'],dating:['你怎麼也在動物園？','那你今天幫我帶後面那半排。']},
      extra:{if:'WZ_PS_KIDS',name:'綁馬尾的小女生',text:'法律系的哥哥！你也來動物園嗎？'},src:'BB_213 1、2（下雨課輔班不出遊：D08 是戶外，照規則沒有偶遇；沒有前任版＝照認識那兩句、不一起走）'},
    {who:'kexin',spot:'D10',why:'她和予樂坐在河邊的台階上，一人一根烤玉米。',days:[0],from:16,to:19,terms:null,weeks:[10],stageMin:null,kexin:true,rainOk:true,busy:'short',join:'dating',memo:'ENC_D10_KX',memoIf:'dating',
      lines:{dating:['我們讀完書下山，予樂說想吃玉米。','你要的話，我分你一半。']},
      ex:{kx_b:['嗨。我們在吃玉米。'],kx_bNarr:'（她笑了一下，跟予樂走了。）',kx_c:['好久不見。這裡傍晚人比較少。','我們要回去了。']},src:'BB_213 1、2（雨天台階有遮，照常）'},
    /* ---- 第二批景點（spots_v2：D09 貓空、D18 九份、D20 烏來、D24 礁溪、D25 外澳）：AA_162 第 8 節（AA 六位）＋BB_150 第 1～5 節（BB 五位），
       企劃線 aca122d2（AA-C 照 AA_188 口語審、BB-C 口氣審 b13052e5；週次：以安 D09 第 10 週、阿哲 D25 第 14、15 週——第 16 週是期末考週）。
       第二批的地方遠，每一列都是「某一學期的某一個週末」一次。 ---- */
    {who:'heroine_01',spot:'D09',why:'她和公法讀書會的人坐在茶館最裡面那一桌，桌上攤著一張時間表。',days:[6],termDays:{Y4S1:[0]},from:15,to:19,terms:['Y2S1','Y2S2','Y3S1','Y4S1'],weeks:[10],stageMin:'FAMILIAR',busy:'short',join:false,memo:null,away:'和讀書會在貓空',
      lines:{acq:['你也來貓空？我們讀書會在這裡聚會。','讀書會在山上的茶館，一個月一次。'],friend:['{name}？Alison 剛剛說，下一個走進來的人要請大家喝茶。','她說的，不是我。……你要坐這邊嗎？'],dating:['你怎麼在這？我沒跟你說我今天上山。','我們讀到七點。……你不用等，先下山。']},src:'AA_162 8、8-1、8-5'},
    {who:'heroine_03',spot:'D18',why:'她跟在一位老師後面，在訪問一位擦香爐的阿嬤。',days:[6],from:10,to:17,terms:['Y3S1','Y3S2'],weeks:[12],stageMin:'ACQUAINTANCE',busy:'yes',busyLine:'（她看到你，點了一下頭，繼續聽阿嬤說話。）',join:false,memo:'ENC_D18_YT',away:'在九份做田野',lines:{},src:'AA_162 8、8-1（她在工作，只點頭；之後在學校說一句）'},
    {who:'zhe',spot:'D25',why:'他和系籃的人在浪裡，被一個浪打倒，站起來大笑。',days:[6],from:14,to:18,terms:['Y2S2','Y3S2','Y4S2'],weeks:[14,15],termWeeks:{Y2S2:[15]}/* AA_375 第 4 項：大二下 5/29（六）14:00 系籃在新體育館比賽，外澳只在第 15 週 6/5；作息 characters.js 一起改 */,stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D25_ZHE',away:'和系籃在外澳',
      lines:{acq:['欸！你也來外澳？下來啊！','水很冷！……超冷。下來就知道。'],friend:['哥！我們差一個人推板子。你來！','你不會衝浪？我也不會啊，我們都在被浪打。快下來！']},src:'AA_162 8、8-1、8-5'},
    {who:'yu',spot:'D20',why:'她在老街口數人頭，手上拿著社團的點名單。',days:[6],from:10,to:16,terms:['Y1S1','Y1S2','Y2S1','Y2S2'],weeks:[6],termWeeks:{Y1S2:[8]}/* AA_373 #5（企劃線 a48fe1b7）：大一下第 6 週週六 4/4 她在麵店團的春假旅行，烏來改第 8 週週六 4/18（期中考完那個週六）；作息 characters.js 一起改 */,stageMin:'ACQUAINTANCE',busy:'short',join:false,memo:null,away:'和社團在烏來',
      lines:{all:['欸{name}？你也來烏來？對了我在點名，二十三、二十四……','好啦我先忙，你自己玩！不要掉到溪裡！']},src:'AA_162 8、8-1'},
    {who:'classmate_bohan',spot:'D09',why:'他一個人坐在纜車站外面的長椅上，手上沒有書，也沒有手機。',days:[6],from:15,to:19,terms:['Y4S1'],weeks:[12],stageMin:'FAMILIAR',busy:'no',join:true,memo:'ENC_D09_BH',away:'在貓空',
      lines:{acq:['{name}。','我今天沒帶書出門。……有點不習慣。'],friend:['結果出來了。我不說是什麼結果。','今天就是不想念書，上來坐一下。你要坐嗎？']},src:'AA_162 8、8-1、8-5（大四推甄結果出來的那個週末）'},
    {who:'classmate_xinci',spot:'D18',why:'她和高中同學在一間茶樓的窗邊，兩個人在對一份旅遊的帳。',days:[0],from:14,to:20,terms:['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],weeks:[10],stageMin:'ACQUAINTANCE',busy:'short',join:false,memo:'ENC_D18_XC',away:'在九份',
      lines:{all:['{name}？我們在找一部劇的拍攝地點。','要同一個角度，連光都要一樣。我們已經找兩個小時了。']},src:'AA_162 8、8-1、8-5'},
    {who:'kexin',spot:'D09',why:'她和予樂、邵鈞坐在茶館的窗邊，三個人盯著一壺茶。',days:[0],from:15,to:19,terms:null,weeks:[7],stageMin:null,kexin:true,busy:'short',join:'dating',memo:'ENC_D09_KX',memoIf:'dating',
      lines:{dating:['我們在等茶涼。予樂說三分鐘，邵鈞說兩分四十秒。','你來當裁判。你說，誰對？']},
      ex:{kx_b:['嗨。我們在喝茶。','這座山是木柵大學的後院。你知道的。'],kx_c:['好久不見。這裡的茶，還是一樣苦。','我們要下山了。你慢慢走。']},src:'BB_150 1、2-1（予樂讓位：enc_walk intro）'},
    {who:'heroine_04',spot:'D18',why:'她坐在石階上，平板上畫著九份的燈籠。',days:[0],from:16,to:20,terms:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2'],weeks:[13],stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:'ENC_D18_ZQ',away:'在九份',
      lines:{acq:['你怎麼也在九份。','我在畫燈籠。……畫好玩的。'],friend:['你來得剛好。站到那個燈籠下面，我要比一下大小。','好。燈籠比我想的還小。'],dating:['欸不是……你怎麼知道我在這？','好啦，我畫累了。陪我去吃芋圓。']},src:'BB_150 1、2-2'},
    {who:'heroine_05',spot:'D24',why:'她和爸媽坐在泡腳池邊，褲管捲到膝蓋。',days:[0],from:10,to:17,terms:['Y3S1','Y3S2','Y4S2'],weeks:[3],stageMin:'ACQUAINTANCE',busy:'short',join:'friend',memo:'ENC_D24_SIS',away:'和家人在礁溪',
      lines:{acq:['學弟。我陪爸媽來泡腳。（溫爸爸點了一下頭。）','今天不用我排。爸媽排好了。'],friend:['你也來礁溪？我爸問你是誰，我說是學弟。','他說那就坐下來一起泡。你要嗎？'],dating:['你怎麼在這裡？','我爸媽在那邊。今天我是女兒。（她看了你一眼，回去坐好。）']},src:'BB_150 1、2-3（交往中不一起泡：同行台詞 cond notDating）'},
    {who:'heroine_02',spot:'D25',why:'她坐在堤防上，手上一台底片相機，等著一道浪。',days:[6],from:14,to:18.5,terms:['Y1S1','Y2S1','Y3S2'],weeks:[4],stageMin:'ACQUAINTANCE',busy:'short',join:'friend',memo:'ENC_D25_ZR',away:'在外澳拍照',
      lines:{acq:['你也來看海？','我在拍照。底片的，一卷只有三十六張。'],friend:['別動。你站在那裡，風就小了。','這一張我想拍很久了。浪剛好要碎掉的那一秒。'],dating:['你怎麼會在這裡？','我還剩最後一張。拍你好了。']},src:'BB_150 1、2-5'}
  ],
  /* 第一次在這裡打招呼以後，她（他）下一次正常聊天時說一次（AA_162 第 4 節、BB_144 第 4 節；R7：劇情事件不讀 ENC_）。
     place：只在那個區域說（芷若在 Café）；phone：改成手機小事（語彤傳照片、可昕不在台大）。 */
  school:{
    ENC_D04_ZR:{who:'heroine_02',place:['cafe'],lines:['上次在西門町，那部你後來有去看嗎？']},
    ENC_D12_ZQ:{who:'heroine_04',lines:['大稻埕那天我在改的那關，後來改簡單了。']},
    ENC_D06_SIS:{who:'heroine_05',lines:['上次在美術館遇到你。那個展下個月就撤了。']},
    ENC_D12_PS:{who:'classmate_peishan',lines:['上次那本繪本，課輔班的小孩很喜歡。'],linesIfNot:{memory:'SAW_HER_TEACH',lines:['上次那本繪本，我送給鄰居的小孩了。']}},
    ENC_D13_KX:{who:'kexin',phone:['淡水那天，邵鈞回去一直問你是誰。']},
    ENC_D06_AN:{who:'heroine_01',lines:['上次在美術館。……你後來有看完那一區嗎？']},
    ENC_D12_YT:{who:'heroine_03',phone:['📷（迪化街的騎樓下，一雙正在包貨的手）','上次那張。']},
    ENC_D04_ZHE:{who:'zhe',lines:['哥，上次西門那家，下次叫大家一起去。']},
    ENC_D04_YU:{who:'yu',lines:['欸，上次那件外套，社團學姊最後買了另一件。……對，第三件。']},
    ENC_D06_BH:{who:'classmate_bohan',lines:['美術館那張長椅，我下個月還會去坐。']},   /* AA_313 5-5 的暫代句（AA-C 10-18 改稿找不到；AA_389 第 3 點：拿掉「阿哲問的話，就說我在總圖」的祕密感）*/
    ENC_D04_XC:{who:'classmate_xinci',lines:['上次那張小卡我有排到。']},   /* AA_209 附錄A §2 */
    /* 第三批（AA_271 1-3 的 followUp；aa_walk_v1.json 0b478a53）*/
    ENC_D26_AN:{who:'heroine_01',lines:['上次在臺中，我媽那張清單最後還是漏買一樣。我又跑了一趟。']},
    ENC_D14_YT:{who:'heroine_03',lines:['漁人碼頭那天，你後來搭幾點的車？我那班好擠。']},
    ENC_D11_BH:{who:'classmate_bohan',lines:['北投那間圖書館，期中前你要去的話跟我講。我早上會先到。']},
    ENC_D01_YU:{who:'yu',lines:['欸，華山那個第六個章！在廁所旁邊。我又跑去一次。']},
    ENC_D02_XC:{who:'classmate_xinci',lines:['松菸那個特展下禮拜就撤了。我又去了一次，這次只買一樣。']},
    ENC_D29_ZHE:{who:'zhe',lines:['上次在駁二，我同學說你很好聊。下次回高雄再約。']},
    /* BB_213 第三批（bb_walk_v1.json batch:3 的 followUp；b0c20f70）*/
    ENC_D01_ZQ:{who:'heroine_04',lines:['華山市集那個像素鑰匙圈，我後來畫進遊戲裡了。']},
    ENC_D02_ZR:{who:'heroine_02',place:['cafe'],lines:['松菸那天四點那場，我後來看了。你要我講給你聽嗎？']},
    ENC_D11_SIS:{who:'heroine_05',lines:['北投那天你走得很早。下次可以待到中午。']},
    ENC_D08_PS:{who:'classmate_peishan',lines:['動物園那天，小孩回去一直問我你是誰。']},
    ENC_D10_KX:{who:'kexin',phone:['碧潭那天予樂說，你吃玉米的樣子很認真。']},
    /* 第二批（aa_walk_v1／bb_walk_v1 followUp @aca122d2）*/
    ENC_D18_YT:{who:'heroine_03',lines:['九份那天，你在旁邊站好久。阿嬤後來問我你是誰。']},
    ENC_D25_ZHE:{who:'zhe',lines:['哥，上次外澳那個浪，我回去背痛三天。下次還要去。']},
    ENC_D09_BH:{who:'classmate_bohan',lines:['貓空那天回來，我腿痠了兩天。……下次找不用爬的地方。']},   /* AA_389 第 3 點（企劃線 345234b3）：兩句合成一句、拿掉祕密感（AA_193 第 3 組），不分 ENC_D06_BH */
    ENC_D18_XC:{who:'classmate_xinci',lines:['我們後來找到那個角度了。光差一點，不過還是拍了。']},
    ENC_D09_KX:{who:'kexin',phone:['貓空那天，兩分四十秒是對的。邵鈞到現在還在講。']},
    ENC_D18_ZQ:{who:'heroine_04',lines:['九份那些燈籠，我做成一關了。下次給你玩。']},
    ENC_D24_SIS:{who:'heroine_05',lines:['礁溪那天以後，我媽問了你好幾次。我跟她說你很好。']},
    ENC_D20_PS:{who:'classmate_peishan',lines:['烏來那天回去，有個小孩寫作文寫到你。']},
    ENC_D25_ZR:{who:'heroine_02',place:['cafe'],lines:['外澳那卷底片洗出來了。有一張你在角落，我拿給你。']},
    ENC_D04_ZR:{who:'heroine_02',place:['cafe'],lines:['上次那部片。……結局我猜錯了。']}   /* AA_524 Z11：西門偶遇「今天的片，下次在 Café 說。」（enc_walk.js）——照 ENC_D02_ZR 的做法，下一次在 Café 說 */
  },
  /* 人物頁「記得的事」的字 */
  labels:{ENC_D04_ZR:'在西門町的電影院門口遇到她',ENC_D12_ZQ:'在大稻埕碼頭遇到她',ENC_D06_SIS:'在美術館遇到學姊',ENC_D12_PS:'在迪化街的舊書店門口遇到她',ENC_D13_KX:'在淡水遇到她',
    ENC_D06_AN:'在美術館遇到她',ENC_D12_YT:'在迪化街遇到她',ENC_D04_ZHE:'在西門町遇到他',ENC_D04_YU:'在西門町遇到她',ENC_D06_BH:'在美術館遇到他',ENC_D04_XC:'在西門町遇到她',
    ENC_D26_AN:'在臺中遇到她',ENC_D14_YT:'在漁人碼頭遇到她',ENC_D11_BH:'在北投的圖書館遇到他',ENC_D01_YU:'在華山遇到她',ENC_D02_XC:'在松菸遇到她',ENC_D29_ZHE:'在高雄駁二遇到他',
    ENC_D01_ZQ:'在華山的市集遇到她',ENC_D02_ZR:'在松菸的書店門口遇到她',ENC_D11_SIS:'在北投圖書館遇到學姊',ENC_D08_PS:'在動物園遇到她',ENC_D10_KX:'在碧潭遇到她',
    ENC_D18_YT:'在九份遇到她',ENC_D25_ZHE:'在外澳遇到他',ENC_D09_BH:'在貓空遇到他',ENC_D18_XC:'在九份遇到她',ENC_D09_KX:'在貓空遇到她',ENC_D18_ZQ:'在九份遇到她',ENC_D24_SIS:'在礁溪遇到學姊和她爸媽',ENC_D20_PS:'在烏來遇到她',ENC_D25_ZR:'在外澳遇到她'}
};
