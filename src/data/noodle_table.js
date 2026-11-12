/* ===== 桌遊團的長桌閒聊（NOODLE-TEAM-WHY-1027；使用者 2026-10-27「桌遊團存在的必要到底是?」）=====
   句子：AA_486 第 1-4 節（大一八則，企劃線 cd824bf41）、AA_487（大二到大四各六則，企劃線 b830dd5eb）；AA-C 定稿（D109），照抄、不改字。旁白照這個事件系統的寫法，不加括號（AA_685 B5 以後一律加括號，見下面）。
   規則在 story3d.js 的 S.ndlTalk*（AA_486 1-4）：麵店日（上課週的週二、週四）17:00～21:00 走進阿鳳麵店、這一天沒有別的麵店事件要演；一天一則，照順序，用完從頭輪；
     只有在桌遊團群組的玩家才有；只演玩家認識的人（STORY.knows）——那一則有不認識的人就跳下一則；在場的人熟悉 +1（SOCIAL 的 classmate，一天一次）。
   一年一組：Y1＝大一（Y1S1 第 3 週起、Y1S2），Y2、Y3、Y4＝大二到大四（AA_487：每一年一組，照順序輪；那一則的條件不符合就跳下一則）。
   一則：who＝這一則在場、說話或旁白點名的人（全部要認識；熟悉 +1 給他們。沒有點名的人＝長桌上認識的桌遊團）；
     know＝要認識、但不在場的人（以安在日本那兩則）；if＝條件（story3d.js S.ndlTalkIf：zheYu＝阿哲和 Alison 交往以後〔true〕／以前〔false〕；
     ytShift＝語彤在顧店；term＝學期；from＝這一天起；anJapan＝以安在日本）；dialogue＝事件引擎的句子（if／unless 照事件引擎的條件）。 */
/* AA_675 1-2（AA_661 第 42 列，企劃線 920791094，AA-C 定 D109）：阿哲的麵店日拿掉，長桌閒聊搬到隔週五的桌遊夜（src/bgnight3d.js S.talk：玩家有去的那一次，散場以前照原本的順序演一則；
   在場＝那一晚在桌遊夜的人）。日常失速也是長桌，「長桌」照用；句子裡有燒臘店的東西（滷蛋、碗、筷子、阿姨端菜、紅紙的新菜、吃燒臘）換不了的那幾則標 bgn:false、跳過（記在 tasks.json，AA 下一批補）。
   燒臘店裡的那一套（story3d.js S.ndlTalkTick）關掉（S.NDL_TALK_BGN）。 */
/* AA_684 第 11 項（企劃線 0382b8a34，AA-C 定 D109）：換不了的 10 則（原本標 bgn:false：大一第 2、6、8 則，大二第 1、4 則，大三第 2、6 則，大四第 4、5、6 則）都刪
   （燒臘店才有的事，硬搬會怪）；Alison 要在場、桌遊夜永遠演不到的 3 則（大二第 5 則、大三第 1、3 則：她週五晚上在戲院上班，桌遊夜只有大一下第 14 週趕到的那一次）也刪。
   補四則桌遊夜版（句子照 AA_684 第 11 項的表，逐字；旁白照稿有括號，和桌遊夜的旁白一樣）：大一（放在刪掉的大一那幾則的位子＝第 2 則）、大二（取代大二第 1 則）、
   大三上（補空缺：term Y3S1）、大四（取代大四第 4 則「畢業以後還要來」，照原本那一則的 Y4S2）。在場照桌遊夜現有的判斷（bgnight3d.js S.talkPick：who 全部在場才演）。
   「老闆」＝日常失速的老闆（不是人物表裡的人，對話框只寫名字）。 */
/* AA_685 B5（企劃線 c96613e51，AA-C 定 D109）：每一則每個存檔只演一次，那一學期的用完就不演（src/bgnight3d.js S.talkPick／S.talk：記在 G.flags.ndlTalkOnce，key＝id；
   heard3d.js 加的那幾則照原本的 once）；舊的旁白也加上括號（旁白一律用（），和 AA_684 補的四則一樣）。id 只給存檔記用，不是句子。 */
const NOODLE_TABLE={
  Y1:[
    {id:'nt_y1_menu',who:['zhe','classmate_bohan'],dialogue:[{speaker:null,text:'（長桌已經坐了一半。阿哲把菜單推給你，雖然大家都只點那幾樣。）'},{speaker:'zhe',text:'民總的作業誰寫完了？'},{speaker:'classmate_bohan',text:'寫完了。……不給抄。'}]},
    /* AA_684 第 11 項：大一的桌遊夜版（取代刪掉的大一第 2、6、8 則的位子，一則）；芯慈的便利貼＝大一那一次的口頭禪 */
    {id:'nt_y1_sticky',who:['classmate_xinci','zhe'],dialogue:[{speaker:null,text:'（芯慈在每個人的杯子上貼了一張便利貼，寫上名字。）'},{speaker:'classmate_xinci',text:'上次有人喝錯。'},{speaker:'zhe',text:'……是我。'}]},
    {id:'nt_y1_range',who:['classmate_bohan'],dialogue:[{speaker:'classmate_bohan',text:'期末考範圍我整理成一張表了。'},{speaker:null,text:'（他把表放在桌子中間。三個人同時拿出手機拍。）'}]},
    {id:'nt_y1_nap',who:['classmate_xinci'],dialogue:[{speaker:null,text:'（芯慈一坐下就趴在桌上。）'},{speaker:'classmate_xinci',text:'昨天讀書讀到兩點。……飯來了再叫我。'}]},
    /* 第 5 則：沒有 ZHE_CALLS_GE＝「欸，」那一句；玩家不一定加入系籃，只寫記事本，不排活動 */
    {id:'nt_y1_bball',who:['zhe'],dialogue:[{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'哥，下禮拜系籃練球，你來不來？'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'欸，下禮拜系籃練球，你來不來？'},{speaker:null,text:'（你還沒回答，他已經在記事本上寫了你的名字。）'}]},
    {id:'nt_y1_const',who:['zhe','yu'],dialogue:[{speaker:null,text:'（憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。）'},{speaker:'yu',text:'「這位同學，你的看法呢？」'},{speaker:'zhe',text:'我的看法是我想吃叉燒。'}]} ],   /* 有 Alison 的這一則：只有她 23:00 從戲院趕到的那一晚（bgnight3d.js S.yuLate，大一下第 14 週）輪得到 */
  Y2:[
    /* AA_684 第 11 項：大二的桌遊夜版（取代大二第 1 則「阿哲的滷蛋少了半顆」）*/
    {id:'nt_y2_boss',who:['zhe'],dialogue:[{speaker:null,text:'（老闆來收杯子，順手把冷氣調小了一點。）'},{speaker:'zhe',text:'老闆，再一局就走。'},{speaker:'老闆',text:'你上次也這樣說。'}]},
    {id:'nt_y2_deposit',who:['classmate_bohan','zhe'],dialogue:[{speaker:'classmate_bohan',text:'法服這禮拜三個個案，兩個是房東不還押金。'},{speaker:'zhe',text:'那你可以開一門課了。'}]},
    /* 第 3 則：演過 ev_xinci_double（雙主修）＝3；沒有＝3b（取代第 3 則）*/
    {id:'nt_y2_bus',who:['classmate_xinci'],dialogue:[{if:{events:['ev_xinci_double']},speaker:'classmate_xinci',text:'財金系的同學問我，法律系是不是每天都在背。……我說也有不背的時候。'},{unless:{events:['ev_xinci_double']},speaker:'classmate_xinci',text:'公車今天塞了二十分鐘。我以為趕不上了。'}]} ],   /* AA_679 第 7 列：第 6 則「語彤在櫃台後面寫作業」拿掉；AA_684 第 11 項：第 4 則「考試前的燒臘店」（換不了）、第 5 則「報告分組」（Alison 要在場）刪 */
  Y3:[
    /* AA_684 第 11 項：大三上的桌遊夜版（補空缺：原本大三上沒有一則演得到）；明軒的 CP 值＝大三上那一次的口頭禪 */
    {id:'nt_y3_cp',who:['classmate_mingxuan','zhe'],if:{term:['Y3S1']},dialogue:[{speaker:null,text:'（明軒把新的盒子翻過來，看背面的人數。）'},{speaker:'classmate_mingxuan',text:'這款四個人剛好。CP 值最高。'},{speaker:'zhe',text:'你每一款都這樣說。'}]},
    {id:'nt_y3_letter',who:['classmate_bohan'],if:{term:['Y3S2']},dialogue:[{speaker:'classmate_bohan',text:'推甄要兩封推薦信。我想好要找誰了，還沒想好怎麼開口。'}]},
    /* 第 5、6 則：Y3S2、3/25 以後（以安在日本）*/
    {id:'nt_y3_an',who:['classmate_xinci'],know:['heroine_01'],if:{term:['Y3S2'],anJapan:true},dialogue:[{speaker:'classmate_xinci',text:'以安不在，作業的問題都跑來問我。……我答得出來。'}]} ],   /* AA_684 第 11 項：第 1 則「他暑假要去事務所實習」、第 3 則「司法官的補習班」（Alison 要在場）、第 2 則「阿姨把電視轉到新聞」、第 6 則「阿姨還是多拿了一副筷子」（換不了）刪 */
  Y4:[
    {id:'nt_y4_last',who:['zhe'],if:{term:['Y4S1']},dialogue:[{speaker:'zhe',text:'最後一年了。……不要那個表情，還有一整年。'}]},
    {id:'nt_y4_move',who:['classmate_xinci'],dialogue:[{speaker:'classmate_xinci',text:'我在想畢業以後要不要搬出來住。……我還沒跟我媽說。'}]},
    {id:'nt_y4_study',who:['classmate_bohan'],if:{from:'2029-03-01'},dialogue:[{speaker:'classmate_bohan',text:'國考讀書會的表，我貼在群組了。不想讀的，也可以只來吃飯。'}]},
    /* AA_684 第 11 項：大四的桌遊夜版（取代第 4 則 Alison「畢業以後還是要來吃燒臘」；學期照那一則的 Y4S2）；芯慈的行事曆＝大四那一次的口頭禪 */
    {id:'nt_y4_monthly',who:['zhe','classmate_xinci'],if:{term:['Y4S2']},dialogue:[{speaker:'zhe',text:'畢業以後也要揪。一個月一次就好。'},{speaker:'classmate_xinci',text:'我排進行事曆。每個月第一個禮拜五。'}]} ] };   /* 第 5 則「牆上的紅紙」、第 6 則「阿哲把大家的碗疊起來」（換不了）刪 */
if(typeof window!=='undefined') window.NOODLE_TABLE=NOODLE_TABLE;
