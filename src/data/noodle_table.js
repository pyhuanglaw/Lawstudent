/* ===== 麵店團的長桌閒聊（NOODLE-TEAM-WHY-1027；使用者 2026-10-27「麵店團存在的必要到底是?」）=====
   句子：AA_486 第 1-4 節（大一八則，企劃線 cd824bf41）、AA_487（大二到大四各六則，企劃線 b830dd5eb）；AA-C 定稿（D109），照抄、不改字。旁白照這個事件系統的寫法，不加括號。
   規則在 story3d.js 的 S.ndlTalk*（AA_486 1-4）：麵店日（上課週的週二、週四）17:00～21:00 走進阿鳳麵店、這一天沒有別的麵店事件要演；一天一則，照順序，用完從頭輪；
     只有在麵店團群組的玩家才有；只演玩家認識的人（STORY.knows）——那一則有不認識的人就跳下一則；在場的人熟悉 +1（SOCIAL 的 classmate，一天一次）。
   一年一組：Y1＝大一（Y1S1 第 3 週起、Y1S2），Y2、Y3、Y4＝大二到大四（AA_487：每一年一組，照順序輪；那一則的條件不符合就跳下一則）。
   一則：who＝這一則在場、說話或旁白點名的人（全部要認識；熟悉 +1 給他們。沒有點名的人＝長桌上認識的麵店團）；
     know＝要認識、但不在場的人（以安在日本那兩則）；if＝條件（story3d.js S.ndlTalkIf：zheYu＝阿哲和 Alison 交往以後〔true〕／以前〔false〕；
     ytShift＝語彤在顧店；term＝學期；from＝這一天起；anJapan＝以安在日本）；dialogue＝事件引擎的句子（if／unless 照事件引擎的條件）。 */
const NOODLE_TABLE={
  Y1:[
    {who:['zhe','classmate_bohan'],dialogue:[{speaker:null,text:'長桌已經坐了一半。阿哲把菜單推給你，雖然大家都只點那幾樣。'},{speaker:'zhe',text:'民總的作業誰寫完了？'},{speaker:'classmate_bohan',text:'寫完了。……不給抄。'}]},
    {who:['yu','zhe'],dialogue:[{speaker:null,text:'Alison 把滷蛋切成四份，分給整桌。'},{speaker:'yu',text:'阿姨今天心情很好！！滷蛋多一顆！'},{speaker:'zhe',text:'那是因為我昨天幫她搬瓦斯。'}]},
    {who:['classmate_bohan'],dialogue:[{speaker:'classmate_bohan',text:'期中考範圍我整理成一張表了。'},{speaker:null,text:'他把表放在桌子中間。三個人同時拿出手機拍。'}]},
    {who:['classmate_xinci'],dialogue:[{speaker:null,text:'芯慈一坐下就趴在桌上。'},{speaker:'classmate_xinci',text:'昨天讀書讀到兩點。……麵來了再叫我。'}]},
    /* 第 5 則：沒有 ZHE_CALLS_GE＝「欸，」那一句；玩家不一定加入系籃，只寫記事本，不排活動 */
    {who:['zhe'],dialogue:[{if:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'哥，下禮拜系籃練球，你來不來？'},{unless:{flags:['ZHE_CALLS_GE']},speaker:'zhe',text:'欸，下禮拜系籃練球，你來不來？'},{speaker:null,text:'你還沒回答，他已經在記事本上寫了你的名字。'}]},
    {who:['heroine_03','zhe'],if:{ytShift:true},dialogue:[{speaker:null,text:'語彤從櫃台後面走過來，放下一盤燙青菜。'},{speaker:'heroine_03',text:'阿姨說你們都不吃菜。這盤不用錢。'},{speaker:'zhe',text:'阿姨萬歲。'}]},
    {who:['zhe','yu'],dialogue:[{speaker:null,text:'憲法課老師今天點了阿哲兩次。整桌都在學那個語氣。'},{speaker:'yu',text:'「這位同學，你的看法呢？」'},{speaker:'zhe',text:'我的看法是我想吃麵。'}]},
    /* 第 8 則：阿哲和 Alison 的鋪陳（大一上也可以先出現：只是開玩笑，不算徵兆、不記旗標）；兩人交往以後不用 */
    {who:['zhe','yu'],if:{zheYu:false},dialogue:[{speaker:null,text:'吃到一半停電了三秒。燈亮的時候，阿哲的筷子停在 Alison 的碗上面。'},{speaker:'yu',text:'……你在幹嘛。'},{speaker:'zhe',text:'我在保護它。'}]} ],
  Y2:[
    {who:['yu','zhe'],if:{zheYu:true},dialogue:[{speaker:null,text:'阿哲和 Alison 坐在同一邊。阿哲的滷蛋少了半顆。'},{speaker:'yu',text:'我幫你吃一半，比較健康。'},{speaker:'zhe',text:'……謝謝喔。'}]},
    {who:['classmate_bohan','zhe'],dialogue:[{speaker:'classmate_bohan',text:'法服這禮拜三個個案，兩個是房東不還押金。'},{speaker:'zhe',text:'那你可以開一門課了。'}]},
    /* 第 3 則：演過 ev_xinci_double（雙主修）＝3；沒有＝3b（取代第 3 則）*/
    {who:['classmate_xinci'],dialogue:[{if:{events:['ev_xinci_double']},speaker:'classmate_xinci',text:'經濟系的同學問我，法律系是不是每天都在背。……我說也有不背的時候。'},{unless:{events:['ev_xinci_double']},speaker:'classmate_xinci',text:'公車今天塞了二十分鐘。我以為趕不上了。'}]},
    {who:['zhe'],if:{weeks:[6,7,14,15]}/* AA_491 第 7 點：只在考試前（期中第 6～7 週、期末第 14～15 週）輪到 */,dialogue:[{speaker:null,text:'考試前的麵店，長桌比平常安靜。每個人的碗旁邊都有一本書。'},{speaker:'zhe',text:'吃飯的時候不准讀。……好啦，讀到麵來。'}]},
    {who:['yu','classmate_bohan'],dialogue:[{speaker:'yu',text:'欸，下禮拜的報告分組，你們不要又全部丟給柏翰。'},{speaker:'classmate_bohan',text:'我已經習慣了。'},{speaker:'yu',text:'就是因為你習慣了。'}]},
    {who:['heroine_03'],if:{ytShift:true},dialogue:[{speaker:null,text:'語彤在櫃台後面寫作業，社會系的書攤了一桌。阿姨叫她，她頭也沒抬就站起來。'}]} ],
  Y3:[
    {who:['yu','zhe'],if:{zheYu:true},dialogue:[{speaker:'yu',text:'他暑假要去事務所實習。他自己不講，我先講。'},{speaker:'zhe',text:'……沒事啦。吃麵。'}]},
    {who:['zhe'],dialogue:[{speaker:null,text:'阿姨把電視轉到新聞。整桌在吵剛剛那則報導，吵到麵都涼了。'},{speaker:'zhe',text:'好了，下課了。'}]},
    {who:['yu'],dialogue:[{speaker:'yu',text:'對了，司法官的補習班，我上禮拜去聽了試聽課。……我還在想。'}]},
    {who:['classmate_bohan'],if:{term:['Y3S2']},dialogue:[{speaker:'classmate_bohan',text:'推甄要兩封推薦信。我想好要找誰了，還沒想好怎麼開口。'}]},
    /* 第 5、6 則：Y3S2、3/25 以後（以安在日本）*/
    {who:['classmate_xinci'],know:['heroine_01'],if:{term:['Y3S2'],anJapan:true},dialogue:[{speaker:'classmate_xinci',text:'以安不在，作業的問題都跑來問我。……我答得出來。'}]},
    {who:[],know:['heroine_01'],if:{term:['Y3S2'],anJapan:true},dialogue:[{speaker:null,text:'長桌少了一個人。阿姨還是多拿了一副筷子。'}]} ],
  Y4:[
    {who:['zhe'],if:{term:['Y4S1']},dialogue:[{speaker:'zhe',text:'最後一年了。……不要那個表情，還有一整年。'}]},
    {who:['classmate_xinci'],dialogue:[{speaker:'classmate_xinci',text:'我在想畢業以後要不要搬出來住。……我還沒跟我媽說。'}]},
    {who:['classmate_bohan'],if:{from:'2029-03-01'},dialogue:[{speaker:'classmate_bohan',text:'國考讀書會的表，我貼在群組了。不想讀的，也可以只來吃麵。'}]},
    {who:['yu'],if:{term:['Y4S2']},dialogue:[{speaker:'yu',text:'欸，畢業以後還是要來吃麵。誰先不來，誰請客。'}]},
    {who:[],dialogue:[{speaker:null,text:'牆上的紅紙又多了兩張，寫的是新菜。阿姨說價錢沒變。'}]},
    {who:['zhe'],dialogue:[{speaker:null,text:'阿哲把大家的碗疊起來，拿去櫃台。四年了，他每次都這樣，沒有人叫過他。'}]} ] };
if(typeof window!=='undefined') window.NOODLE_TABLE=NOODLE_TABLE;
