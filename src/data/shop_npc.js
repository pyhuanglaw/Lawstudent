/* ===== 新店面裡遇得到有名字的人（AA_705 第一批：大一上＋第二批：大一下～大四下、可昕；SHOP-NAMED-NPC-1105，USER_WANTS X251）=====
   使用者 11-05 08:4x（對 LAWWW-C）：「現在店面新增很多 裡面要遇的到NPC喔 可攻略不可攻略的都要」；AA-C 定（D109）。
   企劃：AA_705 @ ebea3a2b0（企劃線 claude/magical-albattani-bk7b4n）；Alison 那一列的「聽一句」照 AA_615 第 4 節 @ ebea3a2b0（遇到她、送爆米花）。
   台詞一字照抄（D137；tests/shop_npc_unit.js 從企劃線 git show 逐字比對）。系統在 src/shopnpc3d.js（SHOPNPC）。
   每一列：
     id、shop（稿上的店名）、who（人物 id）、zone（遊戲區域）、days（0＝週日…6＝週六）、from／to（小時）、
     weeks：'even'＝雙數週；陣列＝只有那幾週；沒寫＝第 2 週起（S.WEEK_MIN）；dateFrom：那一天起（Alison 第 4 週起，和她原本的打工作息同一天）；
     noExam：考試那兩週不在（柏翰）；act：稿上的 act（read／eat／sit／work／wander／買弦）；
     pose：'stand'＝站在 at（[x, z, yaw, 樓層]，配置檔裡那一面牆、那個櫃台前面）；'seat'＝坐 seat（[x, z, 樓層]：配置檔的座位，有人坐或留給約好的兩個人就挑旁邊最近的）；
           'floor'＝坐在地上（山嵐二樓法律區的 floorSit，跪坐那一套）；
     place：稿上「在哪」那一格（測試對稿用）；hear：聽一句（{who:人物 id 或 null＝旁白, t:句子}）；
     hearBy：'guitar'＝子晴的偶遇照 AA_619 第 1 節（src/guitar3d.js，已有，不重寫）；'alison'＝AA_615 第 4 節（下面 alison）；
     moved：稿上寫的和實際排的不一樣（芷若：AA_705「給 LAWWW」那一段的規則）。
   座位、站的位置照各店的配置檔（src/data/*_layout.js）；稿上的位置配置裡沒有一模一樣的點＝取最近的真的座位（見每一列的註解）。
   第二批（AA_705 最後一節「第二批」@ 44af68368，AA-C 11-05 09:0x）：
     terms：這一列在哪幾個學期（沒寫＝大一上～大四下 SHOPNPC.TERMS；第一批每一列「延到大一下～大四下，同一間、同一時段」；子晴同弦照 AA_619 只有大一上）；
     聽一句只在大一上（SHOPNPC.HEAR_TERMS；每人一次），大一下起照樣在那裡、照一般的「和他說話」；
     hearLater：{from:學期, hear}＝那一學期起換一句（學姊山嵐：大二起她已經考上研究所＝判決評釋那一句；新的一句，只出一次）；
     hearAny：這一列的聽一句不限大一上，只出一次（可昕：大一下起才排；柏翰考試週：AA_621）；
     examOnly：只有考試那兩週（柏翰大口：考試那兩週照 AA_621 第 2 節 02:30～05:00）；
     notDating／noPlanDay：和她交往中、那一天跟你有約（邀約、校外約會、出遊）＝這一列不出（可昕，AA_705 第二批第 2 節；4f71f7719 起交往中也出＝SHOPNPC.KX_DATING_OFF=false）；src：這一列的稿（沒寫＝AA_705）；
     hearDating：和她交往中的那一句（可昕，AA_705 補 4f71f7719）；examOnly:'final'＝只有期末考週；to>24＝跨午夜（芯慈週日 22:00～01:00）。*/
const SHOP_NPC={
  src:{AA_705:'2c62cdf1e',AA_615:'ebea3a2b0',AA_621:'52e3d83a8'},   /* AA_705：2c62cdf1e（補 10:06：柏翰好拍改週六 14:00～14:30；阿哲「宵夜？大口漢堡」AA_621 第 3 節，src/zhedakou3d.js）← 15eb48dfa（第三批兩列換時段）← 4f71f7719（可昕交往中也出、AA_621 阿哲芯慈也做）← a0f562527（第三批）；補一節 f8bd25439（11-05 08:17：兩列換時段、遞一小杯補旁白；表格本身和 ebea3a2b0 一樣）→ 4e6755340（青木）→ 44af68368（第二批）；AA_621 第 2 節（柏翰考試週）*/
  rows:[
    /* ---------- 新生南路 ---------- */
    {id:'xs_shanlan_an',shop:'山嵐書店',who:'heroine_01',zone:'xs_shanlan',days:[6],from:19.5,to:20.5,   /* AA_705 補一節（f8bd25439）：原本週日 14:00～15:30 永遠撞到 2:30 AM 念書 → 週六 19:30～20:30 */
     act:'read',pose:'stand',at:[6.0,-0.75,Math.PI/2,0],
      place:'一樓雜誌牆前，站著翻（read）',hear:{who:null,t:'（以安在雜誌牆前面翻一本手帳特刊。翻到一半，拿出自己的手帳對了一下。）'}},   /* 雜誌牆（東牆 x 6.75）、互動點「看雜誌」(6.2, −1.85) 旁邊 1.1 m（導航格站得住的那一格），面向東 */
    {id:'xs_shanlan_sis',shop:'山嵐書店',who:'heroine_05',zone:'xs_shanlan',days:[6],from:10.5,to:12,weeks:'even',act:'read',pose:'floor',at:[6.2,-6,-Math.PI/2,1],
      place:'二樓法律區，坐地板看書（read）',hear:{who:null,t:'（二樓法律區的走道上，學姊靠著書架坐著，膝蓋上是一本研究所的考古題。她沒有抬頭。）'},sisWeek:true,
      hearLater:{from:'Y2S1',hear:{who:null,t:'（學姊靠著書架坐著，膝蓋上是一本很厚的判決評釋。她沒有抬頭。）'}}},   /* AA_705 第二批「例外」：大二起她已經考上＝那一列的旁白換這一句（大一下照第 2 點不出；大二起出一次）*/   /* 配置 floorSit 的法律區 (6.2, −6)；她坐著的時候那個「坐在法律區看書」按鈕藏起來。山嵐 11:00 開門＝11:00～12:00 */
    {id:'xs_nanyang_yu',shop:'南洋戲院',who:'yu',zone:'xs_nanyang',days:[5,6],from:18,to:23,dateFrom:'2025-09-26',act:'work',pose:'stand',clerk:true,at:[-4.1,-2.8,Math.PI/2,0],
      place:'大廳爆米花櫃檯（work）',hearBy:'alison'},   /* NY3.CLERK（配置 lobby.interact 的 clerk）；她原本的作息「在南洋戲院打工」（AA_661 第 30 列）＝人在這裡 */
    {id:'xs_dabu_zhe',shop:'大步球鞋',who:'zhe',zone:'xs_dabu',days:[6],from:15.5,to:16.5,act:'wander',pose:'stand',at:[-2.75,0.6,-Math.PI/2,0],
      place:'籃球鞋那面牆前（wander）',hear:{who:'zhe',t:'這雙上次沒有我的號碼。……今天還是沒有。'}},   /* 左牆籃球鞋那兩格（z −1.5～1.1）前面、「看看（籃球鞋）」(−2.75, −0.2) 旁邊；店小，站著不走動 */
    {id:'xs_haopai_mx',shop:'好拍運動',who:'classmate_mingxuan',zone:'xs_haopai',days:[4],from:19.5,to:20,act:'wander',pose:'stand',at:[-0.05,0.6,-Math.PI/2,0],
      place:'櫃台前（wander）',hear:{who:'classmate_mingxuan',t:'一筒四百五的那種比較耐打。算下來一顆比較便宜。'}},   /* 櫃台前（配置 npc.visitor (−0.1, 1.4) 就在「買東西」按鈕上，往門口挪 0.8 m）*/
    {id:'xs_xsports_xc',shop:'新生運動廣場',who:'classmate_xinci',zone:'xs_xsports',days:[0],from:16,to:16.5,act:'wander',pose:'stand',at:[1.45,2.5,-Math.PI/2,0],
      place:'一樓水壺那一排（wander）',hear:{who:'classmate_xinci',t:'這個水壺有刻度。我想知道我一天到底喝了多少。'}},   /* 水壺雙面架（items bottle_gondola (0.75, 2.5)）東側，面向架子 */
    {id:'xs_tongxian_zq',shop:'同弦樂器',who:'heroine_04',zone:'xs_tongxian',days:[6],from:15,to:16,weeks:[6,10,14],terms:['Y1S1'],act:'買弦',pose:'stand',at:[0.3,-0.1,Math.PI/2,0],   /* AA_705 第二批「例外」：照 AA_619，只有大一上第 6、10、14 週 */
      place:'櫃台前買弦',hearBy:'guitar'},   /* 「買東西（櫃台）」(0.25, 0.6) 旁邊，面向櫃台；偶遇演完（她拿了一包弦就走）那一天就不在了 */
    {id:'xs_dakou_bh',shop:'大口漢堡',who:'classmate_bohan',zone:'xs_dakou',days:[1,3],from:22+10/60,to:23,noExam:true,act:'read',pose:'seat',seat:[5.05,-5.1,1],
      place:'二樓靠牆有插座那排，讀書（read）',hear:{who:'classmate_bohan',t:'總圖十點關。這裡還可以再讀一個小時。'}},   /* 二樓東牆「坐下讀書（有插座）」那一排的中間 */
    /* AA_621 第 2 節「同學（考試那兩週）」（AA_705 補 4f71f7719：阿哲、芯慈「也做，照 AA_621 原稿」）：位子在二樓（「坐下讀書」那一層），和柏翰那張錯開 */
    {id:'xs_dakou_zhe_exam',src:'AA_621',shop:'大口漢堡',who:'zhe',zone:'xs_dakou',days:[0,1,2,3,4,5,6],from:0,to:2,examOnly:'final',terms:['Y1S1'],act:'read',pose:'seat',seat:[3.0,-0.4,1],hearAny:true,
      place:'大一上期末考週（他從宿舍下來買宵夜，順便坐下來讀）',hear:{who:'zhe',t:'我說好讀一小時。……第三份雞塊了。'}},   /* 00:00～02:00＝日曆上期末考週那幾天的 00:00～02:00（還沒睡的 G.hour 24～26 也算，S.calOk）；二樓樓梯口旁邊那張四人桌（tables4 (2.7, −1.0)）靠樓梯那一張 */
    {id:'xs_dakou_xc_exam',src:'AA_621',shop:'大口漢堡',who:'classmate_xinci',zone:'xs_dakou',days:[0],from:22,to:25,examOnly:true,act:'read',pose:'seat',seat:[5.05,-4.2,1],hearAny:true,
      place:'考試那兩週的週日',hear:{who:'classmate_xinci',t:'財金那份報告我在這裡寫完的。……第二份還沒。'}},   /* 週日 22:00～隔天 01:00（to 25＝跨午夜）；考試那兩週照柏翰那一列的讀法（term.exam：第 8、9、16 週）；二樓東牆有插座那排，柏翰那張（z −5.1）旁邊一張（她和柏翰的時段不重疊）*/
    {id:'xs_dakou_bh_exam',src:'AA_621',shop:'大口漢堡',who:'classmate_bohan',zone:'xs_dakou',days:[0,1,2,3,4,5,6],from:2.5,to:5,examOnly:true,act:'read',pose:'seat',seat:[5.05,-5.1,1],hearAny:true,
      place:'考試那兩週，兩點半關門後過來',hear:{who:'classmate_bohan',t:'兩點半關了。這裡不會趕人。'}},   /* AA_705 第二批「例外」：柏翰大口「考試那兩週照 AA_621」＝AA_621 第 2 節「柏翰：02:30～05:00（兩點半關門後過來…）」那一句；位子同上面那一列（二樓靠牆有插座那排）；聽一句不限大一上、只出一次 */
    /* ---------- 公館 ---------- */
    {id:'afar_yt',shop:'afar café',who:'heroine_03',zone:'afar',days:[2],from:15,to:17,act:'read',pose:'seat',seat:[-2.5,3.1,0],
      place:'窗邊，筆電寫報告（read）',hear:{who:null,t:'（語彤一個人坐窗邊，筆電旁邊那杯冰紅茶一口都沒喝。）'}},   /* 窗邊吧台（table 6）最西邊那一張 */
    {id:'daybreak_ps',shop:'Daybreak',who:'classmate_peishan',zone:'daybreak',days:[6],from:10.5,to:12,weeks:'even',act:'eat',pose:'seat',seat:[-3.05,3.45,0],
      place:'靠窗的兩人桌，吃早午餐（eat）',hear:{who:'classmate_peishan',t:'這家的鬆餅好大！……我一個人吃不完，可是我還是點了。'}},   /* 靠窗兩人桌（table 1）；留給約好的人那一組就換旁邊的靠窗兩人桌 */
    {id:'aoki_sis',shop:'青木茶室',who:'heroine_05',zone:'aoki',days:[0],from:16.5,to:18,weeks:'odd',   /* AA_705 補一節（f8bd25439→4e6755340）：原本週三下午永遠撞到總圖／法圖；週日 13:00～16:00 她在美術館 → 單數週週日 16:30～18:00（美術館回來以後；和山嵐雙數週週六錯開）*/
     act:'read',pose:'seat',seat:[-3.25,-2.15,0],
      place:'最裡面那張桌，看書（read）',hear:{who:null,t:'（學姊一個人坐在最裡面，茶壺旁邊攤著一疊影印的判決。）'}},   /* 離店門最遠的那張四人桌（table 5）靠牆那一張 */
    {id:'bikeshop_kai',shop:'慢輪單車',who:'kai',zone:'bikeshop',days:[0],from:15,to:16,act:'wander',pose:'stand',at:[1.5,4.3,Math.PI/2,0],
      place:'門口打氣、看車（wander）',hear:{who:'kai',t:'我只是來打氣。……順便看一下那台變速的。'}},   /* 店門（折門 x −0.5～1.6）進來右手邊，看門口那兩台車（小折）*/
    /* AA_705 第三批（企劃線 dd765aec6／a0f562527；使用者 11-05 09:2x「不要新的人物!!!」「原本的人物就好」「我沒有要求每天去都要遇到人」「但是要遇的到」）：只補 AA_620 第 3-4 節已經寫好的三位，句子照 AA_620 原句；之後不再加人、不加時段 */
    {id:'xs_dabu_kai',shop:'大步球鞋',who:'kai',zone:'xs_dabu',days:[0],from:16.5,to:17.25,act:'wander',   /* AA_705 補（15eb48dfa）：原本週六 18:40～19:20 永遠撞（宿舍書桌、週六打工）→ 週日 16:30～17:15（慢輪 15:00～16:00 打氣以後順路）*/pose:'stand',at:[-2.75,-2.4,-Math.PI/2,0],
      place:'跑鞋那一格（wander）',hearAny:true,hear:{who:'kai',t:'我要開始跑步了。……真的。'}},   /* 左牆跑鞋那一格（z −4.1～−1.5）前面；「看看」(−2.75, −3.4) 往北 1 m、阿哲那一列（籃球鞋 z 0.6）往南 3 m */
    {id:'xs_haopai_bh',shop:'好拍運動',who:'classmate_bohan',zone:'xs_haopai',days:[6],from:14,to:14.5,   /* AA_705 補（2c62cdf1e，回 LAWWW-C 10:06）：週四 17:15～17:45 也永遠撞總圖（學期中週一二四五 15:20～21:00 在總圖；週四 17:00 那一筆是暑假的）→ 週六 14:00～14:30（好拍週六 12:00～21:00 有開）；15eb48dfa 那一次：週二 20:00～20:30 → 週四 17:15～17:45 */terms:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],act:'sit',pose:'seat',seat:[-0.26,2.3,0],
      place:'櫃台前等穿線（sit 高腳凳）',hearAny:true,hear:{who:'classmate_bohan',t:'我高中打桌球。……念書念到受不了就去打一下。'}},   /* 大一下起；高腳凳＝配置 seats[0]「坐著等穿線」，他坐著的時候玩家的那一個按鈕照舊藏起來（有人坐）；hearAny：第一次遇到是大一下以後，聽一句照 AA_705 第三批「只一次」 */
    {id:'xs_xsports_yu',shop:'新生運動廣場',who:'yu',zone:'xs_xsports',days:[0],from:13,to:14,terms:['Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],act:'wander',pose:'stand',at:[-5.95,-1.85,-Math.PI/2,1],
      place:'二樓運動服那一排（wander）',hearAny:true,hear:{who:'yu',t:'我參加系上的排球。……我發球會發到隔壁場。'}},   /* 大二起；二樓左牆衣架（x −6.88～−6.40）前面、面向衣架；「看看（系隊球衣）」(−4.4, −2.9) 離 1.8 m */
    /* ---------- 溫州街 ---------- */
    {id:'wz_mokuyobi_zq',shop:'木曜日',who:'heroine_04',zone:'wz_mokuyobi',days:[0],from:20,to:21.5,act:'sit',pose:'seat',seat:[-3,-2.15,1],
      place:'角落那桌，戴耳機開筆電（sit）',hear:{who:null,t:'（子晴戴著耳機，在筆電上畫一張地圖。旁邊的拿鐵已經沒有泡了。）'}},   /* 西牆靠裡面那張兩人桌（table 4）*/
    {id:'wz_offbeat_zr',shop:'日常失速',who:'heroine_02',zone:'wz_offbeat',days:[0],from:14,to:16,act:'read',pose:'seat',seat:[4.55,-3.45,0],
      place:'靠窗那桌，看片單、寫筆記（read）',hear:{who:'heroine_02',t:'我休假的時候，會去別人的店喝咖啡。……看看別人怎麼拉花。'},
      moved:{days:[2],why:'AA_705「給 LAWWW」：週二不是她的休假（2:30 AM 週一到週五 19:00～22:00 都有班，週二下午在總圖多媒體中心 AA_399）＝改成她沒排班的那一天下午：週日 14:00～16:00（週六下午在溫州街走走、週日下午沒有作息）'}}   /* 東側靠窗那排（table 9）*/,
    /* ---------- 第二批：可昕（大一下起；AA_705 第二批第 2 節）---------- */
    {id:'bookstore_kx',shop:'頁間書屋',who:'kexin',zone:'bookstore',days:[6],from:14,to:15.5,weeks:'even',terms:['Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1','Y4S2'],act:'read',pose:'stand',at:[-4.75,-3.95,Math.PI,0],
      hearAny:true,notDating:true,noPlanDay:true,
      place:'法律書那一櫃前面，站著翻（read）',hear:{who:'kexin',t:'你也來這家？……我只是來看有沒有新出的考古題。'},
      hearDating:{who:'kexin',t:'你也來這家？……我來看考古題，不是來等你的。'}}   /* AA_705 補（4f71f7719）：交往中也出（SHOPNPC.KX_DATING_OFF=false；notDating 留著當開關）、只有那一天跟你有約才不出；交往中的那一句（沒交往照原句）*/   /* 北牆書牆西段（「看看法律書與文具」(−4.0, −3.9) 那一櫃）前面、按鈕西邊 0.75 m，面向書牆；路人站的位置 (−2.3, −4.0)、法律系同學找書的 (0.3, −3.95) 都錯開。
       「她在外校念書，週末才會在公館；和她交往中、或她那一天跟你有約，照約的走，這一列不出」：交往中（G.flags.dating_kexin）、那一天有約（邀約 G.invites、校外約會 G.trips、出遊）＝不出 */
  ],
  /* 照現在、不另外排的（AA_705 表上「照現在」「不另寫」那幾列；測試對稿用）*/
  asIs:[{shop:'公館燒臘',who:'zhe'},{shop:'頁間書屋',who:'classmate_mingxuan'},{shop:'一盞茶屋',who:'heroine_03'},{shop:'SUNNY SIDE',who:'classmate_xinci'},{shop:'SUNNY SIDE',who:'zhe'}],
  /* AA_615 第 4 節：遇到她、送爆米花（玩家自己去戲院、已經認識 Alison）*/
  alison:{
    first:[{speaker:null,text:'（爆米花櫃檯後面的人戴著戲院的帽子。抬頭，是 Alison。）'},{speaker:'yu',text:'欸！你怎麼來了？'},{speaker:'yu',text:'我禮拜五禮拜六都在這裡。……你看哪一場？'},
      {speaker:null,text:'（她把一桶爆米花推過來。）'},{speaker:'yu',text:'剛剛多做的，不用錢。小聲一點。'},
      {choice:[{text:'「謝啦。」',goto:'ny_thanks'},{text:'「這樣可以嗎？」',goto:'ny_ok'}]},
      {label:'ny_thanks'},{speaker:'yu',text:'好好看喔。第二部比較好看。'},{goto:'ny_end'},
      {label:'ny_ok'},{speaker:'yu',text:'多做的本來就要丟。拿去。'},
      {label:'ny_end'},{speaker:null,text:'（你拿到一桶爆米花。）'}],
    again:['今天焦糖口味。','十一點以後最安靜。我都在這裡寫作業。','你又來了。……一個人？'],
    againNarr:{0:'（她從櫃台下面遞出一小杯，是剛爆好的。）'},   /* AA-C 08:17：「今天焦糖口味。」稿上的（遞一小杯）補字，放在那一句前面 */   /* 之後再遇到（同一學期最多一次）：隨機一句（「今天焦糖口味。」稿上寫「（遞一小杯）」是動作，沒有旁白句，不另寫）*/
    sis:'我姊說她國中常來這間。……那時候還是一輪的。',   /* 有 KNOWS_SIS_ALISON 的時候偶爾一句（一學期最多一次）*/
    movieLine:'（爆米花吃到第二部就沒了。）' }   /* 看電影時旁白多一句：1 廳的「坐下看電影」（src/aa614_3d.js，AA615-ALISON-CINEMA-1103）讀 SHOPNPC.popcorn(G)＝今天拿到爆米花（G.flags.NY_POPCORN）*/,
  /* AA_705 補（2c62cdf1e，回 LAWWW-C 10:06 第 2 點）＝AA_621 第 3 節：阿哲「宵夜？大口漢堡」（每學期一次，第 11 週週五 22:30；系統 src/zhedakou3d.js）。字照稿（私訊不打句號，AA_477）*/
  zheDakou:{ msg:'宵夜？大口漢堡', yes:'好。', no:'今天不了。', noReply:'OK 下次', narr:'（阿哲已經點好了，托盤上兩份雞塊。）', zhe:'我先點了。你的我用猜的。' }
};
