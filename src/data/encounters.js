/* 自由出行的偶遇第一批（DL-07）：AA_160 第 5 節（5-6 統整）＋ BB_144 第 1～4 節（BB 五位）＋ AA_162 第 1～4 節（AA 六位）；企劃線 claude/cool-heisenberg-o8kuqx（1a708adc 一帶）。
   台詞照抄，不在這裡改內容；{name}＝玩家的名字。第一批只有「打招呼」「不打擾」（前任：「點頭」「走過去」「打招呼」）；一起走一段、重訪、支線是第三批（DL-08）。
   每一列：
     who 人物、spot 景點、why 旁白（她在做什麼）、days 星期、from～to 時段、terms 哪幾個學期（null＝全部；交換、休學、出國的學期不寫）、weeks 'odd'/'even'（學期的單週／雙週）、
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
      lines:{dating:['你也來看這部？……那我們兩個是不是要假裝不認識予樂。']},ex:{kx_b:['……嗨。','假設今天沒遇到。……好，那就當沒遇到。'],kx_bNarr:'（她笑了一下，跟予樂走了。）'},src:'BB_144 1、2、3-6'},
    {who:'zhe',spot:'D04',why:'他和系籃的人蹲在一家排隊的店門口。',days:[6],from:19,to:22,terms:null,stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D04_ZHE',away:'在西門町',
      lines:{acq:['欸，你也在這！','我們系籃的在等位子，等四十分鐘了，你說扯不扯？……很扯。'],friend:['哥！來得好，幫我們排一下，我去買飲料。','……開玩笑的啦。要不要一起吃？吃完再走。']},src:'AA_162 1、2-4'},
    {who:'yu',spot:'D04',why:'她在一家二手衣店裡，兩手各拿一件外套。',days:[6],from:17,to:20,terms:null,stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:'ENC_D04_YU',away:'在西門町',
      lines:{acq:['欸！{name}？你也來逛？','對了，我在幫學姊挑外套，你覺得哪件——好啦，你一定說都一樣。'],friend:['欸你來評評理，這兩件明明不一樣，她們說一樣。','……好啦我知道，是一樣。我只是想要有人跟我說不一樣。']},src:'AA_162 1、2-4'},
    {who:'classmate_xinci',spot:'D04',why:'她在一家賣偶像周邊的小店門口排隊。',days:[6],from:20,to:23,terms:null,stageMin:'ACQUAINTANCE',busy:'short',join:false,memo:'ENC_D04_XC',away:'在西門町',
      lines:{acq:['……{name}？','我在排一張小卡。這是一件很重要的事。'],friend:['要件：排隊、等、拿到。','我現在卡在第二個要件。……不要笑。']},src:'AA_162 1、2-4'},
    // ---- D06 臺北市立美術館 ----
    {who:'heroine_05',spot:'D06',why:'她站在一幅畫前面，手上拿著展覽的說明。',days:[0],from:13,to:16,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y4S1','Y4S2'],stageMin:'ACQUAINTANCE',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D06_SIS',away:'在美術館',
      lines:{acq:['學弟。……你也看展？','我排了兩個小時。還剩四十分鐘。'],friend:['一件事。這一區的說明牌，我每一塊都讀完了。','……你不用。看你想看的就好。'],dating:['你來了。……我沒有約你。','重點是，我剛好在想，如果你在就好了。']},
      ex:{apart_talk:['學弟。……一件事。我先走了。']},src:'BB_144 1、3-3'},
    {who:'classmate_peishan',spot:'D06',why:'她在兒童區，看小孩畫畫。',days:[0],from:9.5,to:12,terms:['Y3S1','Y3S2','Y4S1','Y4S2'],stageMin:'FAMILIAR',flags:['WISH_DONE_classmate_peishan'],busy:'no',join:true,memo:null,away:'在美術館',
      lines:{all:['你看那個小孩，畫了一隻綠色的狗。……我好喜歡。']},src:'BB_144 1、3-6（心願事件以後）'},
    {who:'heroine_01',spot:'D06',why:'她站在一張城市地圖的作品前面，手上拿著小筆記本。',days:[0],from:10,to:13,terms:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y4S1','Y4S2'],stageMin:'ACQUAINTANCE',busy:{acq:'short',friend:'no'},join:'friend',memo:'ENC_D06_AN',away:'在美術館',
      lines:{acq:['……你也來？','我十二點半要走。下午有排。'],friend:['這一區我看完了。旁邊那一區，你要一起看嗎？不用勉強。','我有一張表，十二點半要走。……表是我自己排的，可以改十分鐘。'],dating:['你怎麼知道我在這裡？……你不知道。好，那是巧合。','巧合我接受。十二點半以前都是你的。']},
      ex:{apart_life:['嗨。這一區很好，你慢慢看。'],apart_lifeNarr:'（她先走了。）',apart_drift:['……{name}。','我十二點半要走。']},src:'AA_162 1、2-1、3'},
    {who:'classmate_bohan',spot:'D06',why:'他坐在展廳的長椅上，手上沒有書。',days:[0],from:10,to:12,terms:['Y3S1','Y3S2','Y4S1','Y4S2'],stageMin:'FAMILIAR',busy:'no',join:'friend',memo:'ENC_D06_BH',away:'在美術館',
      lines:{acq:['……{name}。','我在休息。這裡沒有人會問我考幾分。'],friend:['我以前覺得來這種地方很浪費時間。','現在覺得，浪費兩個小時，第三個小時讀得比較快。']},src:'AA_162 1、2-4'},
    // ---- D12 大稻埕碼頭與迪化街 ----
    {who:'heroine_04',spot:'D12',why:'她坐在碼頭邊，膝上開著筆電。',days:[0],from:16,to:19,terms:null,weeks:'odd',stageMin:'ACQUAINTANCE',busy:'no',join:true,memo:'ENC_D12_ZQ',away:'在大稻埕',
      lines:{acq:['欸不是，你也來這裡？','我在測一個關卡。河邊比較好想。這不是邀請。'],friend:['你來得剛好。幫我玩一次。','……你死在第三關。很好，代表那裡太難了。'],dating:['欸不是……你跟蹤我？','好啦，我很高興。這是直述句。']},
      ex:{apart_drift:['欸不是……好久不見。我要回去改 bug 了。']},src:'BB_144 1、3-2'},
    {who:'classmate_peishan',spot:'D12',why:'她在一間舊書店門口翻繪本。',days:[6],from:15,to:18,terms:['Y1S1','Y1S2','Y2S1'],stageMin:'ACQUAINTANCE',busy:'short',join:true,memo:'ENC_D12_PS',away:'在迪化街找舊書',
      lines:{acq:['啊，嗨！……我在找一本舊的繪本。','找到了我就回去。你也逛逛。'],friend:['你來得正好。幫我看這兩本，哪一本小孩會喜歡？','……你選的那本字比較少。對，就是這本。'],dating:['……你怎麼知道我在這裡？','不知道也來了？那我們一起找。書單有七本。']},src:'BB_144 1、3-4'},
    {who:'heroine_03',spot:'D12',why:'她拿著相機，蹲在一間南北貨行的騎樓下。',days:[0],from:15,to:18,terms:null,weeks:'odd',stageMin:'ACQUAINTANCE',busy:{y12:'no',y3:'short'},join:'friend',memo:'ENC_D12_YT',away:'在大稻埕拍照',
      lines:{acq:['……你？','我在拍手。老闆娘的手。不要問。'],friend:['（她把鏡頭蓋遞給你）「拿一下。」','這條街，每一間店都有一個不肯退休的人。'],dating:['……你跟來的？','沒有？那你運氣很好。我剛好拍完。']},
      ex:{apart_life:['……嗨。'],apart_lifeNarr:'（她舉起相機，示意她在忙。）',apart_driftNarr:'（她看到你，把相機收起來，走進騎樓另一邊。）'},src:'AA_162 1、2-2、3'},
    // ---- D13 淡水金色水岸 ----
    {who:'kexin',spot:'D13',why:'她和予樂、邵鈞坐在河邊等夕陽。',days:[0],from:16.5,to:19,terms:null,stageMin:null,kexin:true,busy:'short',join:'dating',memo:'ENC_D13_KX',memoIf:'dating',
      lines:{dating:['假設今天我們剛好在淡水遇到——','好，不用假設了。予樂，我先走，他來了。'],datingAfter:{who:'予樂',text:'我們什麼都沒看到。邵鈞，走。'}},
      ex:{kx_b:['……嗨。','假設今天沒遇到。……好，那就當沒遇到。'],kx_bNarr:'（她笑了一下，跟予樂走了。）',kx_c:['好久不見。……夕陽還是一樣。','我們要回去了。你慢慢看。']},src:'BB_144 1、2、3-5'},
    {who:'heroine_03',spot:'D13',why:'她一個人坐在河邊，這次沒有拍照。',days:[0],from:16,to:18,terms:null,weeks:'even',stageMin:'FRIEND',flags:['WISH_DONE_heroine_03'],noEx:true,busy:'no',join:true,memo:null,away:'在淡水',
      lines:{friend:['……又是你。','上次是兩個人。這次是一個人。也很好。'],dating:['你也來了。','那就又是兩個人了。']},src:'AA_162 1、2-3（心願以後；前任不出現在 D13）'}
  ],
  /* 第一次在這裡打招呼以後，她（他）下一次正常聊天時說一次（AA_162 第 4 節、BB_144 第 4 節；R7：劇情事件不讀 ENC_）。
     place：只在那個區域說（芷若在 Café）；phone：改成手機小事（語彤傳照片、可昕不在台大）。 */
  school:{
    ENC_D04_ZR:{who:'heroine_02',place:['cafe'],lines:['上次在西門町，你看完是什麼表情？……我從後面看到了。']},
    ENC_D12_ZQ:{who:'heroine_04',lines:['欸不是，上次大稻埕那個第三關，我改簡單了。因為你。']},
    ENC_D06_SIS:{who:'heroine_05',lines:['上次在美術館。……一件事。你在那幅畫前面站很久。']},
    ENC_D12_PS:{who:'classmate_peishan',lines:['上次你選的那本繪本，課輔班的小孩很喜歡。'],linesIfNot:{memory:'SAW_HER_TEACH',lines:['上次那本繪本，我送給鄰居的小孩了。']}},
    ENC_D13_KX:{who:'kexin',phone:['上次淡水那個假設題，我還沒說完。下次說。']},
    ENC_D06_AN:{who:'heroine_01',lines:['上次在美術館。……你後來有看完那一區嗎？']},
    ENC_D12_YT:{who:'heroine_03',phone:['📷（迪化街的騎樓下，一雙正在包貨的手）','上次那張。']},
    ENC_D04_ZHE:{who:'zhe',lines:['哥，上次西門那家，下次麵店團一起去。']},
    ENC_D04_YU:{who:'yu',lines:['欸，上次那件外套，學姊最後買了另一件。……對，第三件。']},
    ENC_D06_BH:{who:'classmate_bohan',lines:['上次在美術館的事，不要跟阿哲說。']},
    ENC_D04_XC:{who:'classmate_xinci',lines:['上次那張小卡，我拿到了。……謝謝你沒笑。']}
  },
  /* 人物頁「記得的事」的字 */
  labels:{ENC_D04_ZR:'在西門町的電影院門口遇到她',ENC_D12_ZQ:'在大稻埕碼頭遇到她',ENC_D06_SIS:'在美術館遇到學姊',ENC_D12_PS:'在迪化街的舊書店門口遇到她',ENC_D13_KX:'在淡水遇到她',
    ENC_D06_AN:'在美術館遇到她',ENC_D12_YT:'在迪化街遇到她',ENC_D04_ZHE:'在西門町遇到他',ENC_D04_YU:'在西門町遇到她',ENC_D06_BH:'在美術館遇到他',ENC_D04_XC:'在西門町遇到她'}
};
