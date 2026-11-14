# BB_458　CANON-NO-ECON-1112：瀏覽器驗收清單（給 CC 排，給 BB 判）【下一版必須】

- BB-C 2026-11-13 12:5x（UTC）。版本：開發分支 `ab67344ac6`（第五批＋AA_919 4-2）以後，AA_925～949 陸續進的用 LAWWW 給的最新 head。
- 每一支都要：D158 字表掃描（探針內建，0 段才算過）＋截圖；沒截圖＝沒驗。8c7ed86560 那一輪（A1／SIDE／FULL PASS）是第四批以前，不算。

## A. 開局（新遊戲、`localStorage.clear()`）
| # | 名稱 | 做法 | 要看到 |
|---|---|---|---|
| A1 | 第一堂見面 | 8/29 起逐日到 9/28 | 9/1 第一堂必修（憲法）可昕先開口（AA_856）、交換聯絡；KX_MET=class |
| B1 | 第一堂沒去 | 9/1 不去，**關掉一鍵去上課／autoClass**；下一堂有去的必修 | 演「坐下以後老師還沒來」版（KX_MEET_LATER）；9/1 當天沒有她的見面 |
| B2 | 走廊保底 | 讀檔到 9/29 以後、KX_MET 無、第一次走進法律系館A 一樓 | `ev_kx_meet_hall` 演、她先叫你 |
| FULL | 大一上整學期 | 8/29～12/21 | 每天 walkFallbacks 0、沒有例外；D158 0 段 |

## B. 第四批三號（LAWWW 列的）
| # | 場景 | 讀檔／條件 | 要看到 |
|---|---|---|---|
| 1 | AA_876 慢慢分開 D1／D1c／D2／D3／D4 | 交往中、出遊隔天進系館；D1c 走廊她講同學 | 每拍字照 AA_876；D3 有「我看完這一頁就聽」那個選項（BB_419 1-3） |
| 2 | 女宿長椅 D5、21:00 電話、第 61 天午餐 | 學期末最後一天；分開後下學期開學起算 60 天 | D5 只在學期末；第 61 天後門湯餃「同班，躲很累」 |
| 3 | 週年＋後門湯餃（走路） | 交往滿一年那天 | AA_879 第一年卡片三選項、發票／耳環；湯餃店走路去 |
| 4 | 春假女宿接人 | 大二、大四春假 | 「最後一個春假。開車，去哪都好。」（AA_920 ⑥） |
| 5 | 國考讀書會當面那幾晚 | 大四 | 當面、不是只有手機（D103） |
| 6 | 長頸鹿鑰匙圈 | 大一下開學第一週走廊 | AA_920 ④ 整場、兩個選項、`GIRAFFE_KEYCHAIN` |
| 7 | 可昕動態與回覆 | 各學期 | 沒有外校、山上、排表的字（canon_scan 前提警告層 0） |

## C. 第四批四號
| # | 場景 | 要看到 |
|---|---|---|
| 8 | 淡水偶遇 | 室友旁白不上畫面；「淡水那天，我室友回去一直問你是誰。」 |
| 9 | 芷若／沛珊約會收尾 | AA_917／918 定稿字，沒有「你約／你挑／你帶路」 |
| 10 | 子晴到場句、以安 beat 6／8 | 照 AA 定稿 |
| 11 | 可昕深夜訊息 | 沒有外校前提 |
| 12 | 邀約：法圖 sit／bye、羽球 | 法圖她直接答應「我常坐的那一排，靠窗。」（AA_940）；羽球「新體育館？」 |
| 13 | 大一導師三個選項、書店那句 | 照 AA 定稿 |
| 14 | 可昕朋友層偶遇 | 朋友以上遇得到、打招呼 kx_b 第一句、不一起走；只是認識遇不到（2d65882387） |

## D. 第五批＋AA_919
| # | 場景 | 要看到 |
|---|---|---|
| 15 | 6/2 畢業典禮拍照 | 交往中：旁白「（她從拍照的人群裡走過來，學士帽還戴著。）」；有長頸鹿鑰匙圈（key）版最後「同一天畢業。拍一張。」；沒有（noKey）版照 AA_875；**不出 cg_two_graduations**；6/9 那一組不出現 |
| 16 | 國考口試第一題 | 委員「你為什麼念法律？」、祐廷不提以前的系 |
| 17 | 大三聖誕當面 | 12/24 21:00「明天晚上九點，系館。」→ 12/25 系館場景 |

- 判定寫回 BB_399 末節＋BB_00；FAIL 交 LAWWW（程式）／AA（字）。

## 11-13 16:2x　LAWWW 觸發表（開發分支 d999d036d8 `docs/handoff/BB458_TRIGGERS.md`）後 BB 定的
- **#9 改驗**：沛珊收尾＝AA_913、芷若再訪同一地點＝AA_904（第四批四號）；AA_917 的可昕＋子晴那幾句併進 #10、#11 一起看。判定標準不變：照定稿字、沒有「你約／你挑／你帶路」那種排表口氣。
- **#12 改驗**：法圖只驗她直接答應「我常坐的那一排，靠窗。」（AA_940）；「坐下說一句、走時道別」（sit／bye）驗**總圖**那一套（第一次那句「總圖晚上人好少」）。法圖不補做 sit／bye——不擋 D99 兩個優先項目，要的話另外開任務給 AA 寫字（P3）。羽球「新體育館？」照驗。
- **#17 大三聖誕當面版**：LAWWW 已接進遊戲（AA_878 #38＋AA_920 ①，12/25 21:00 法律系館・討論桌；祐廷在國外那年照舊視訊）——兩個版本都驗。
- **#4 大二春假**：她說「七點四十，校門口。」但出遊地點是「女生宿舍樓下」（group3d.js 66 行）——LAWWW 已問 AA 以哪個為準；AA 定了以後照新的驗，CC 先拍現在的樣子當基準。
- **16:3x #4 定了**：AA-C 定地點對、字錯——可昕那句改成「嗯。七點四十，宿舍樓下。」（開發分支 4af46fd8f6），玩家那句「好。今年也開。」不動。CC 拍 #4 用 4af46fd8f6 以後，要看到「宿舍樓下」、出遊地點女宿樓下、兩者一致。
- **17:5x LAWWW**：#12 約念書第一次坐下那句改成 AA 新字「（小聲）我一章大概四十分鐘。讀完一章你才可以跟我講話。」（開發分支 27001bdc02；原本「總圖晚上人好少」約在法圖或白天對不上）——#12 改看這句。#9 沛珊收尾稿號 AA_913 是對照表寫錯、遊戲沒問題。CANON458 那批用 27001bdc02 以後；FULL（d21c）照跑完，台詞差別只有 #12 這句。releasegate 只差 CANON-NO-ECON-1112（FULL、B2_r3、BB_458 由 BB 判）。

## 11-13 18:3x　BB 靜態預查（開發分支 183acbf800，瀏覽器以前先對字）
- **#7、#11（可昕動態、深夜訊息沒有外校前提）**：canon_scan `--paths src` 禁字 0、前提警告 0 → 字這一層 PASS；瀏覽器只看動態／訊息真的會出現。
- **#16 國考口試**：postgrad_lines.js 230 委員「你為什麼念法律？」→ 祐廷「我那時候覺得，很多規定都在管一群人。我比較想知道，一個人選錯了以後怎麼辦。」——沒提以前的系 → 字 PASS。
- **#4 春假**：group3d.js 66「嗯。七點四十，宿舍樓下。」＋玩家「好。今年也開。」——照 AA 16:3x 定稿 → 字 PASS。
- **#12 法圖**：invites.js 225 acc.lawlib「好。我常坐的那一排，靠窗。」→ 字 PASS。
- **#17 大三聖誕當面版——前後矛盾，交 AA（P2，劇情一致性 §11-1）**：12/24 21:00 是**可昕自己**傳「明天晚上九點，系館。」（玩家只回「好。」）；但有去年卡片（KX_XMAS3_CARD，「明年聖誕，換你決定去哪」）的存檔，12/25 開場旁白是「（去年的卡片說，今年換你決定去哪。你決定的地方是系館。）」＋她「……你選這裡？」——地點是她定的，演出來卻是玩家選的。AA 二選一：①有卡片時 12/24 那則改成讓玩家選地點（例如她問、玩家回系館）②有卡片時開場三列改寫（例如她記得卡片、自己先說「今年本來輪你決定。……我先占了，系館。」）。字由 AA 寫。另外「明天吃完飯，陪我去系館。」那版（期末的飯也在 12/25）要在瀏覽器看飯的時間和 21:00 系館接不接得上。
- **18:5x 預查（開發分支 5b7c5ce124）**：#1 kxdrift3d.js、#8 encounters.js「淡水那天，我室友回去一直問你是誰。」、#12 invites.js「新體育館？」、#15 postgrad_lines.js 21「（她從拍照的人群裡走過來，學士帽還戴著。）」都在。
  - **#6 前提（存檔要對）**：ev_kx_souvenir（events.js 2749）只在**大一上期末選「臺北。」（KX_Y1S1_END＝'taipei'）**的存檔演；大一下第 1 週（可延到第 2 週）走進法律系館A或校園；設 KX_SOUVENIR＋GIRAFFE_KEYCHAIN，不分交往。沒選臺北看不到≠FAIL。
  - **#15**：partnerBeat（postgrad3d.js 415）交往中才演，有鑰匙圈＝key 版（「它還在。脖子還是很短。」「同一天畢業。拍一張。」）、沒有＝noKey 版；兩版都拍。程式裡沒有 cg_two_graduations ✔。
  - **#2**（kxdrift3d.js 20～25、189～208）：D5 只在學期末——自己最後一科考完她當面說（任何地方）→ 隔天 19:00 女宿樓下「明天晚上七點，我宿舍樓下。」；20:00 沒到＝21:00 電話；電話也沒接＝隔天 12:00 文字版。第 61 天＝分開後**下一學期開學**起算，第一次 8:00～13:00 進法律系館A她當面約後門湯餃（只一次）。和清單一致；CC 讀檔要讓「最後一科」落在那學期期末。
  - **#3**（events.js 1757～1793）：禮物三選項＝一副耳環／後門那家的酸辣湯餃（外帶）／發票（只有第一年）；地點 shop＝「學校後門・湯餃店」。和清單一致；發票那項要拍第一年和第二年各一次（第二年不該出）。
  - **#14**（encounter3d.js 32、121）：FRIEND 以上＝friend、以下＝acq（遇不到）；kexin 一起走只在交往中。和清單一致。
  - **#9、#10 子晴到場句**：字由 Node 鎖住——`tests/date_src_sha.js` KX921_1112（AA_917／918）、ZQ909_1112（AA_909）換字表；Node 綠＝字對，瀏覽器只看真的演得出來（date3d.js S.closeLine／S.arriveLine）。
  - **#10 以安 beat 6**（heroine_arcs.js 303）：「Alison 說你國中就決定要念法律。」——和 BB458_TRIGGERS 一致，沒有舊序章前提。
  - **#13**（events.js 2408 ev_y2_welcome）：「為什麼念法律？」三個選項各寫成 if／unless 一對（互補）＝畫面上剛好三個、玩家以前選過的排第一；舊序章那個已拿掉 ✔。
  - **#5**：律師讀書小組 r2y4b3d.js 667～745；可昕的週六那場背景已改「法律系館・自習室」（BLACKBG_460 那批驗）。
  - **BB_458 17 項靜態預查完成**：只有 #17（大三聖誕卡片版地點誰決定）有問題，已交 AA；其他照清單拍。
- **19:3x #17 AA-C 定稿（選 ②）**：有 KX_XMAS3_CARD 的開場三列換成——旁白「（去年的卡片說，今年換你決定去哪。可是地點是她昨天先講的。）」／可昕「我知道今年輪你。……我先占了。」／可昕（teasing）「你要抗議，我聽。抗議完坐下。」；接「聖誕快樂。我報告還差兩頁。」照舊。手機 face 版第二則改「我報告還沒寫完。」（視訊版、選項不動）。BB 看過：前後一致了（地點是她定的、她也知道今年輪玩家），口氣符合人物口氣表。**CC 拍 #17 要等 LAWWW 接好的新 SHA**，有卡片／沒卡片兩版都拍。
- **03:2x 發布候選 76f8b639f0 第一批（CC 初判、BB 判）**：
  - **#2 D5／D5 電話／第 61 天湯餃（CANON458_D5）：PASS**——ALL PASS，D5_FACE、D5_CALL、D6_SOUP 的 D158 都 0。
  - **#1 D1c（CANON458_D1C）：PASS**——ALL PASS，種子 44；沒抽到的 10/5～10/12 沒有亂跳別的分開戲，10/5 是 ev_kx_s1_heard。
  - **#6 長頸鹿鑰匙圈（CANON458_GIRAFFE）**：B 版 PASS（ev_kx_souvenir 演了、GIRAFFE_KEYCHAIN 設了、D158 0）；A 版 TEST_BUG（讀檔進宿舍那一刻阿凱 ev_kai_back_y1s2_later 剛好開演，探針沒等演完就開手機）→ GIRAFFE_r2 只跑 A。
- **03:3x 76f8 第二批**：
  - **#17 大三聖誕（CANON458_XMAS）：PASS**——XMAS_PREV（有卡片）開場「（去年的卡片說，今年換你決定去哪。可是地點是她昨天先講的。）」「我知道今年輪你。……我先占了。」；MET_A／B 沒有這句、直接「聖誕快樂。我報告還差兩頁。」；ABROAD 排成視訊；四版 12/25 21:00 都排上、D158 0。
  - **#11 可昕深夜訊息（CANON458_NIGHT）：PASS**——大二上第 6 週 10/14、10/15 兩晚，D158 0、沒有 JS 例外。
  - **#12 法圖（CANON458_INV_LAWLIB）：TEST_BUG**——探針 PICKS 找「法律學院」，選單字是「去法圖一起念書」，對不到就點了第一個（2:30 AM）→約成咖啡店。改 PICKS 用「法圖」重跑；要看到她答「好。我常坐的那一排，靠窗。」、坐下那句「（小聲）我一章大概四十分鐘。……」。
- **03:5x 76f8 第三批**：
  - **B2_r5（CANON_NEWGAME_B2_r5）：PASS（P0）**——69 項 ALL PASS；9/4～9/25 民總都翹；9/29 照玩家從校園走「進入法律系館A」（沒用捷徑）；07:55 走廊「欸，你是我們班的吧。你都坐很後面。」「我杜可昕。班上的人我差不多都認得了，就差你。手機，加一下。」→ met＝true、how＝hall、聯絡人有她。P3：那一刻按 data-ptab="places" 開出來是訊息列表（places 分頁 76f8 有；可能剛好有訊息進來自動跳訊息頁），發布後查。
  - **#15 畢業典禮＋#16 口試（CANON458_PG）：PASS**——有鑰匙圈「它還在。脖子還是很短。」「同一天畢業。拍一張。」、沒有 cg_two_graduations；口試「你為什麼念法律？」→「……我比較想知道，一個人選錯了以後怎麼辦。」；D158 0。
  - **#13 大二迎新小隊輔（CANON458_WELCOME）：PASS**——「為什麼念法律？」三個短版（翻民法／幫身邊的人／還在找怎麼說）都在、D158 0。
  - **#3 週年（CANON458_ANNIV）：PASS**——第一年 5/20 18:30 學校後門・湯餃店、走路；第一年可以選發票（K7_GIFT＝ticket）；D158 0。**第二年不出發票這輪沒驗**（ANNIV_C 也是第一年）——程式有擋，發布後補拍，不擋。
  - **#7 動態（CANON458_FEED）、#4 春假（CANON458_SPRING）：PASS**——春假「嗯。七點四十，宿舍樓下。」「好。今年也開。」、大四「最後一個春假」；D158 0。
  - #11 NIGHT、#17 XMAS 前一批已 PASS。
  - **TEST_BUG 三支（手機約到了、走不到店門）**：INV_BADM（體育館出口範圍）、AN_BEAT6（燒臘門口互動鍵空）、AN_BEAT8（按「進入公館燒臘」還在公館）——r2 用手機快速前往。**AN_BEAT8 那天 2027-10-13（三）12:10 公館燒臘照營業時間（AA_831：11:00～23:00、無公休）是開的**：如果走到門口按「進入」進不去，就是 GAME P1（玩家進不了店），不是打烊；r2 兩種都留（走到門口按門＋快速前往）。
- **04:0x 76f8 第四批**：
  - **#6 長頸鹿 A 版（GIRAFFE_r2）：PASS**——ev_kx_souvenir 演了、GIRAFFE_KEYCHAIN 設了、D158 0（A、B 兩版都過＝#6 PASS）。
  - **#5 國考讀書會當面（CANON458_BAR）：PASS**——大四下第 1 週排「律師讀書小組（大口漢堡）」，在 3D 大口漢堡二樓（xs_dakou）當面演（不是只有手機，D103）；D158 0。
  - **#1 慢慢分開（CANON458_DRIFT）：PASS**——D1～D4 都 D158 0（D1c 前一批已過）。
  - **#12 羽球（INV_BADM_r2）：PASS**——快速前往到新體育館，她 (0, 19.2) 站著等（羽球場沒有座位＝站著等是對的，探針期望「先坐著」是寫錯）。
  - **AN_BEAT8**：改判 TEST_BUG——2027-10-13 是設計好的颱風假（calendar.js TYPHOON、AA_326 2-Y3-09），所有店不開；手機邀約那天也不會約成（invites3d.js 139 resched closed）。BB 03:5x 說「燒臘那天開著、可能 GAME P1」撤回。r2／_door 改 2027-10-20。
  - **約人幾支卡住的真正原因（TEST_BUG）**：撥時間到約定前 3 分鐘遊戲自己跳「直接過去／自己走過去」選單，探針沒選＝一直 busy。CC 已修 invite_phone。INV_LAWLIB r3（travel:lawlib）、AN_BEAT6 r3、BOOKSTORE r2（PICKS 出去玩＞頁間、REL 65）排在 76f8 那組。
- **04:2x 76f8 第五批**：REL76_p0 PASS。
  - #12 法圖 INV_LAWLIB_r3：快速前往成功、她在 T7 南側 waitSeat (4.9, 6.65)；探針 1.8 m 內找不到空的玩家座位、沒坐下＝「我一章大概四十分鐘」那句沒驗到。先判 TEST_BUG（T7 寬 2 m，另一側／隔壁座位約 1.6～2 m、剛好在邊緣或被 NPC 坐走）→ r4 半徑 3 m；3 m 內還是沒有空位＝GAME P1（約來念書卻坐不到她旁邊）。
  - AN_BEAT6／8：探針只等 8 秒、「直接過去／自己走過去」選單在 toast 之後才跳＝TEST_BUG，改等 25 秒；_door 那兩支走到一半時間跳到隔天＝整段沒驗到，重跑。BEAT8 用 2027-10-20。
  - BOOKSTORE：頁間書屋要「自己走進去過一次」才會出現在約人選單（invites.js show:V('bookstore')）＝r1 存檔沒去過書店＝TEST_BUG；r3 墊 VISITED＝bookstore、PICKS 看電影＞頁間＞今天。這個「去過才約得到」是設計。
- **04:5x 76f8 第六批**：
  - **#12 法圖：PASS**——INV_LAWLIB_r3／r4 她答應「好。我常坐的那一排，靠窗。」都拍到。3 m 內沒有玩家座位＝照 16:2x 的定案（法圖不做 sit／bye），**不是 GAME P1**——BB 04:2x 說「3 m 內沒有＝P1」撤回。坐下那句「（小聲）我一章大概四十分鐘。讀完一章你才可以跟我講話。」改到**總圖**驗：CANON458_INV_LIB @76f8（P0）。
  - **REL76_save_v7（常規回歸）：可能擋發布**——76f8 按「繼續（自動存檔）」讀進來是新的一份（祐廷 day 1 17:55 v2），不是 v7 那份（day -369 21:00）；V25（v9.10.25）同一項 PASS。對照組 REL76_save_v7_ctl（f312）排最前面；**f312 PASS＋76f8 FAIL＝回退＝NO-GO**，已請 LAWWW 查 9.10.25→76f8 之間「繼續」選存檔／讀存檔（SAVE-LZ、readSave、key）。
  - REL76_skybridge PASS、REL76_p0 PASS。
  - BOOKSTORE_r3：墊 visited 以後「看電影、逛書店」那一類還是沒出現——invites3d.js 884 照 show(G)＋neverAt 過濾、可昕交往中另有 kxPlaceOk；已請 LAWWW 告訴 CC 出現條件，先不重跑。
  - 約人四支（AN_BEAT6／8）：選單沒等到＝手機面板開著遊戲暫停（TEST_BUG），CC 改先收面板、門口那兩份改從燒臘門口附近起點，重排。ENC、DATE 逾時（前面的 case 都過）→拆成五行各 45 分鐘。

- **05:0x（台灣）76f8 第七批九支（cc-local 20:40～20:55 UTC）：全部不是遊戲壞掉**
  - **REL76_save_v7／v95／start1：TEST_SETUP，save_v7「可能擋發布」撤回。**
    - 三支的舊版都排成 f312（v9.10.25）。f312 開新遊戲就在舊序章那年（stage econ、day -369／-379）。
    - 76f8 照使用者 11-12「我沒有要留的舊存檔」故意不讀這種存檔（index 讀檔先 toast「請開新遊戲」），所以「繼續」讀到 day 1 17:55 宿舍＝照設計。
    - 重排 r2，用正確舊版：v7 385e194、v9.5 a4f2760、v9.9.1 6d5c3279。start1 的「舊序章 8/30 轉進法律系」兩項照設計 FAIL。
    - 另加 **REL76_save_live**：f312 用 ?start0 開局寫法律系存檔→76f8 讀＝現在線上玩家的情況，P0。
  - **REL76_ladder：還沒定，P0 對照。**
    - flow_ladder_y1s2 六個時段都找不到「有下一層階梯的人」，ladder.js Y1S2 七人兩版都有。
    - REL76_ladder_ctl 在 f312 跑：f312 找得到＝回退＝NO-GO。
  - **AN_BEAT6_r5／BEAT8_r4／BEAT6_door_r3：TEST_SETUP。**
    - 第 6、8 拍要第 4 階（need:4＝熟悉 ≥60、信任 ≥45、自在 ≥40）；探針只加了熟悉 65，所以演一般台詞「下次考試前一起讀吧。我先跟你約好。」＝照規則。
    - 到燒臘就自動和她坐下開演（pSeat、state done），「旁邊有空位」那項不適用。
    - r6／r5 加信任、自在，並且記到店的對話紀錄。
  - **CANON458_INV_LIB：TEST_BUG。**
    - 探針按通用互動鍵，按到蔡宗霖初見「和常在圖書館的男生說話」，沒坐下。
    - r2 先把他設成見過，再按位子的「坐下（用電腦）」。
    - P3 問 LAWWW：約會中初見事件要不要讓位。
  - **INV_LAWLIB_r4：** #12 已 PASS（答應那句），這支多跑的坐下項不算。
  - **REL76_libtour：探針漏抓。** 七站只輪詢到 [1,3,6]，N19 也這樣 FAIL 過、V18 PASS；r2 改讀對話紀錄。
  - **05:1x save 驗法定案**（LAWWW-C 確認 game3d.js:551 loadFrom：econ 存檔不讀、跳「這個存檔停在已經拿掉的舊章節，讀不了。請開新遊戲。」）：
    - 法律系舊存檔：v7／v9.5／v9.9.1 r2＋REL76_save_live 驗照讀。
    - 舊序章存檔：REL76_save_econ（取代 save_v7_ctl）驗三項——跳那一句、fatiao3d_auto 沒被蓋掉或刪掉、欄位 econ 一樣跳。
    - BOOKSTORE：可昕交往中「看電影、逛書店」整類消失＝kxPlaceOk 舊規則，LAWWW 開任務交 AA，不是 76f8 回退；CANON458_BOOKSTORE_r4 用沒交往的存檔驗。
  - **05:2x CC 重排 ACTIONED**（cc-testing e58cd06e19，queue 2305～2328）：save_v7／v95／start1 r2（正確舊版）、REL76_save_live（f312 ?start0&turbo、stage≠econ 才跑）、REL76_ladder_ctl（f312）＋ladder_diag（76f8 印 GAME.npc／ladData／ladNext）、AN_BEAT6_r6／BEAT8_r5（信任 50、自在 45，MutationObserver 記每一句）、INV_LIB_r2（蔡宗霖設見過、對準位子的「坐下」鍵）、libtour_r2（收 #caption）；BB 補 REL76_save_econ（三項）。電腦在跑 ENC 45 分鐘那一項，跑完接這組。
- **05:2x（21:2x UTC）CANON458_ENC_ACQ、ENC_FRIEND：ALL PASS**（76f8；各 24 分鐘）——只是認識三週都沒遇到她；朋友那一組照設計；D158 字表 0、沒有 JS 例外。剩 ENC_DATING。電腦接著跑 P0 組（save／ladder／BEAT／INV_LIB／libtour）。
- **05:3x（21:27 UTC）REL76_save_v7_r2：ALL PASS**（正確舊版 v7 385e194）——v7 的自動存檔（法律系第 1 天 21:13 宿舍）76f8 按「繼續」名字、天數、時間、地點、金錢、旗標、關係都一樣；標題停 8 秒沒被改寫；48 個位置都讀得進、站得住、走得動；沒有 JS 例外。**save_v7 這一項正式 PASS**（11-13 那次 FAIL＝排錯舊版）。
- **05:3x（21:32～21:33 UTC）save 三支**：
  - **REL76_save_econ：ALL PASS**——舊序章存檔按繼續、讀欄位 1 都跳「這個存檔停在已經拿掉的舊章節，讀不了。請開新遊戲。」，G 不換，fatiao3d_auto、欄位 1 一字不改。
  - **REL76_save_start1_r2（v9.9.1）：PASS**——大一上七個存檔＋第 1 天晚上都照讀、不重播主線、睡一晚正常；只有「舊序章系所 8/30 轉進法律系」兩項 FAIL＝照設計（使用者 11-12 不留舊序章存檔）。
  - **REL76_save_live（f312 ?start0 法律系存檔→76f8）：核心 PASS，待對照**——繼續讀回自動存檔（名字、天數、地點、金錢一樣）；欄位 1～3 日期地點金錢對、站得住、課表紀錄新、湖邊移位、重新整理、沒有 JS 例外。FAIL：v9.5 專用三項（不算）、欄位 1／2 same()（flags 或 rel 某鍵）、阿哲熟悉度沒補（f312 存檔已經 _relSync）、手機課表讀到訊息分頁。加 **REL76_save_live_ctl（f312→f312）** 定：一樣 FAIL＝探針期望；只有 76f8 FAIL＝回退＝NO-GO。
- **05:4x REL76_save_v95_r2（a4f2760→76f8）：讀檔 PASS**——FAIL 6 項只有欄位 1～3 的「手機課表週數」「手機今天」：讀檔後有待回覆、手機自己開在訊息分頁（既有行為，df70106 記過），探針沒切到課表分頁＝TEST_BUG；其他全過。v95_r3、save_live_r2、save_live_ctl 都改成先切 #phoneTabs 課表再讀字，並印 same() 不一樣的鍵。**CANON458_ENC_DATING：ALL PASS**（ENC 三支全過）。
- **05:4x LAWWW 查讀檔路徑（f312 dc3d33941c vs 76f8）**：rel 兩版一樣（defaults、migrate、_relSync 都沒改）＝阿哲熟悉度「沒補」是探針期望。flags：76f8 拿掉 lifeLineMigrate／zoulaMigrate／askFixUntil／「沒有 dating_kexin 補 true」（CANON 一起拿），新增語彤房東次數轉換（ev_yutong_landlord>3 才動）。所以 f312 讀自己會改 flags、76f8 不會＝same() 拿存檔原文比讀檔後的差異。等 save_live_ctl／live_r2 印出的不一樣鍵定案；只有 76f8 不一樣的鍵交 LAWWW。
- **05:4x 兩支定案**：
  - **REL76_ladder：不擋發布（TEST_SETUP）**——對照 REL76_ladder_ctl（f312）同一項一樣 FAIL：大一下第 5 週那六個時段，campus／library_hall／dorm 的人 ladData＝null、linze 沒人、cafe 只有上班中的芷若（staff，ladNext null）＝這支探針的時段本來就找不到合格的人，不是 76f8 回退。探針要換時段（LAWWW 用 Node 查到以安 A2-L1、芷若 Z2-L1、語彤 Y2-L1、學姊 S2-L1、沛珊 P2-L1 有下一層），發布後改。
  - **CANON458_AN_BEAT6_r6：PASS（#10 以安第 6 拍）**——熟悉 71、信任 50、自在 46（第 4 階）到燒臘，對話紀錄有「Alison 說你國中就決定要念法律。」；「旁邊有空位」那項是探針只看最後一筆 pSeat（整場已演完、回宿舍）＝TEST_BUG，不重跑。BEAT8_r5 以那一句為準。
- **05:5x REL76_save_live：PASS（照 05:3x 定的規則）**——對照 REL76_save_live_ctl（f312→f312）沒過的是同一批：v9.5 專用三項、欄位 1／2 same() 唯一不同的鍵是 flags.deptHear（讀檔後遊戲照常累計「別系聊天聽過幾次」）、阿哲熟悉度 fam=12 兩版一樣、手機課表讀到訊息分頁（ctl 開跑時 phonefix 還沒上）。rel 全部一樣。＝探針期望，不是回退。live_r2（含 phonefix、印鍵）回來再確認 76f8 沒有多出別的鍵；有多出來的才交 LAWWW。
- REL76_ladder_diag（76f8）名單和 f312 幾乎一樣（76f8 多一個 campus 17.6 的可昕，ladNext 也是 null）＝TEST_SETUP 確定。
- **06:0x 第八批（21:46～21:51 UTC）**：
  - **CANON458_AN_BEAT8_r5：ALL PASS**——第 4 階（2027-10-20）到燒臘，對話紀錄有「我媽說，研究所考哪一組，我自己決定。」。#10 以安 beat 6／8 兩拍都驗到。
  - **REL76_hometown：ALL PASS**——去高雄找可昕（高鐵 2980）、去台中找沛珊（1400）都演完回臺北；錢不夠變灰寫原因；沒有 undefined／{name}。
  - **REL76_libtour_r2：ALL PASS**——七站依序都出現（改讀 #caption）、跟館員到三樓、full／partial 都對＝上次是探針漏抓。
  - **CANON458_INV_LIB_r2：還沒驗到，TEST_BUG→r3**——蔡宗霖已設見過、探針挪到位子按「坐下（用電腦）」＝只出一般的「坐一下，看看四周」選單、邀約沒開演。看 invites3d.js：S.seatFirst 只挑沒有 label 的桌邊位子，總圖的位子全部有 label（「坐下（用電腦）」），所以她沒有 waitSeat、照註解「找不到位子……就照舊直接見面」＝這裡要**走到她面前按「和杜可昕說話」**開演（INV.meetable），不是坐下。r3 改成走到她旁邊按和她說話，要看到「（小聲）我一章大概四十分鐘。讀完一章你才可以跟我講話。」。P3 給 LAWWW：總圖因為座位都有 label，「坐到她旁邊」那一套永遠不會用到，要不要讓總圖的長桌位子也能當 waitSeat，LAWWW 決定。
- **06:1x CANON458_INV_LIB_r3：FAIL_SETUP（探針認錯人）**——探針取樣的「她」(3.6,-1.41) 坐著讀書，走過去互動鍵是「和蔡宗霖說話」、紀錄寫「離她 12.82 m」＝那個位置多半是 pool_2 蔡宗霖，可昕在 12.8 m 外。r4：用 INV.npcOf／charId==='kexin' 取位置、同時印 kexin 和 pool_2；kexin 不在 library_hall＝GAME 疑點（答應了卻不在）。
- **06:2x save 收尾**：REL76_save_live_r2（f312→76f8）不一樣的鍵只有 flags.deptHear，和 ctl 完全一樣＝**save_live 正式 PASS**；REL76_save_v95_r3 除手機 6 項外全 PASS（阿哲 fam=19 照補＝v9.5 存檔才需要同步）。手機「課表／今天」三支（live_r2、ctl_r2、v95_r3）都讀到空字串、截圖手機沒開——**f312 的 ctl 一樣**＝不是 76f8 回退，不擋發布。原因待 v95_r4 診斷（CC 推測 titleIdle；但 game3d.js 538 applySave 有重設 titleIdle，BB 看比較像探針按 #btnPhone 的時機）；如果確定是「從標題讀檔以後手機打不開」，是既有 P1，交 LAWWW。
- **06:3x CANON458_INV_LIB_r4：還沒驗到，原因找到（照設計帶路）**——她一開始坐 (3.6,-1.41)、旁邊讀書的是 pool_2 (2.8,-1.41)；玩家一走近，她起身走去二樓（lv 1）。看 invites3d.js 652～699：約總圖念書＝她帶你去二樓相鄰兩個空位（iv.lead ph go→wait），你坐到 lead.me 才開演（S.seatMeet），不是「和她說話」也不是隨便坐。r4 探針用平面小步追、上不了 lv1、時間跳到 18:01、邀約被收成 done 但一句沒演。r5：每秒讀 iv.lead，ph＝wait 時用遊戲導航（帶 lv）上二樓坐 lead.me；玩家真的上不了二樓＝GAME 疑點。
- 另一個要注意的（等 r5 結果再定）：r4 裡邀約最後是「done、沒有任何台詞」——如果玩家跟丟了，邀約就這樣無聲結束，玩家會不知道發生什麼事；r5 若照設計走完沒問題，再請 LAWWW 看「跟丟以後」的處理（P2）。
- **06:3x 手機 6 項原因確定＝TEST_BUG**——REL76_save_v95_r4 診斷：按 #btnPhone 那一刻最上層是 `fade.on`（index.html 64：opacity 1、pointer-events auto＝讀檔換區域的黑幕還沒退，攔住點擊），稍後截圖已是校園＝黑幕有退、沒卡住。探針按太早，不是遊戲問題、不是 titleIdle。改成等 #fade 退且 elementFromPoint 是按鈕再按；發布後重跑，不擋 GO。save 五支定案：全部 PASS。
- **06:4x REL76_car：流程 PASS、A 傾向前置 TEST_SETUP**——47 項 PASS：國考放榜（律師二試錄取）、第一份工作、尾聲、回到標題、沒卡住、沒有 debug 字、沒有 JS 例外。FAIL 3 項只在 A 傾向 case 的「前置」（careerLean 全 0、top 預設 B＝探針的 A 捷徑沒生效）；STORY.careerLean 在 f312 和 76f8 一字不差＝不是回退。30 分鐘逾時、car04_20 沒跑到。REL76_car_r2（car01_A＋car04_20、修 A 捷徑）排在 touch 後面，不擋 GO。
- **06:5x REL76_touch（touch_flow_wenzhou）：ALL PASS**（76f8，166 s）。REL76_car_r2 排在後面（A 捷徑改設 CLUB_lawclub_study＋vac.reg C16／C09，不成立＝FAIL_SETUP）。
- **07:0x CANON458_INV_LIB_r5＋發現：76f8 判 NO-GO（X364）**
  - r5：照設計帶路（lead go→wait→sit，二樓長桌坐下）、邀約 done＝流程 PASS。台詞是「每次來都覺得好大。你走前面。」「（小聲）二樓靠窗那排比較安靜。」＋seated；AA 那句 first.sit 沒出現——invites3d.js 388、397：有 STUDYN 第 N 場（SN）就不走 libFirst，可昕在 study_scenes.js 有自己的第 1 場，所以 first.sit 永遠不會出現（P3：AA 新字用不到，請 AA／LAWWW 決定要不要搬進 STUDYN 第 1 場）。
  - **查第 1 場時發現外校前提還在（玩家看得到）**：study_scenes.js kexin 1867「你們的總圖好大。」、1881 選項「妳們的圖書館多大？」、2109「你們的總圖還是好大。」；invite_place_lines.js 62／65／66／665「我又不是你們學校的」「換了臨時證」「你們學校的證件好醜」「你們這邊的牛肉麵」。canon_scan 抓不到（沒有校名），但這就是 X364／D158「可昕＝首都帝大法律系同屆」要清的東西。invite_place 4 句 AA 已改在 AA_959 總表（D158-KX-SAMESCHOOL），study_scenes 3 句請 AA 補。
  - **判定：這 7 句換掉以前 NO-GO**；建議 rc2＝76f8＋這 7 列（純資料），驗 GHA 綠＋canon_scan 0＋CC 跑可昕第一次一起念書確認新字。其他已過的回歸不重跑。
- **07:1x REL76_reach：PASS 114 項，1 項 P2 不擋**——29 區 1251 個互動點；只有溫州街「看門口的花」(44,20.8) r 1.2 內沒有站得住的位置＝玩家按不到（花序門口季節布置，season_deco.js 21／season_stalls3d.js 41，76f8 才有；a1efc3b6ab G2DF5_reach 已同樣 FAIL）。不卡人、只是看不到＝P2；資料修正（挪座標或 r→1.8）可順手放 rc2，LAWWW 決定。
- **07:1x 76f8 GO 狀態**：X364 外校字 → AA_987 全部改完、BB 照用，等 LAWWW 出 rc2（BB_467 驗法）；回歸還差 social、DATE_LAYER＋NODL、FULL_a／b（76f8 跑、rc2 照算）。
- **07:3x 第九批**：REL76_car_r2（car01_A A 傾向設成、car04_20）ALL PASS＝**car 正式 PASS**；**DATE_LAYER_NODL_76f8 ALL PASS**（?nodatelayer 回文字選單，BB_461 第 8 項）；REL76_reach＝P2（看門口的花，已記）；INV_LIB_r6＝證據（已記 BB_467）。還沒回：DATE_LAYER_76f8、REL76_social、FULL_a／b。
- **23:2x DATE_LAYER_76f8 判讀**：FAILED 5 → BB 判：D01／D12「沒有中斷」＝TEST_BUG（pg.reload 後 bbplay helper 沒重注入，`__BBF is not defined`，reload 前的圖層量測已跑完）；D28＝TEST_SETUP（兩天一夜要第 6 階或交往中，墊 DATING）；D05@20＝TEST_SETUP（300 秒只到 16:39，改捷徑撥到出發前 10 分）；**D05「出文字選單不是圖層」＝未判**（沒記選單內容；可能是合法的 fallback，也可能是遊戲問題）——r2 記選單內容＋狀態＋截圖再判。D33 等其他 PASS。r2 排在 FULL_a 前（cc-testing 30b8878c81）。**D05 判定前不給 GO**（rc2 只換字，r2 可在 76f8 跑、結果沿用到 rc2）。
- **23:3x D05 靜態預判（等 r2 證實）**：截圖 dl_D05_first.png＝光典臺北，看完片「（片子很安靜。……）」後出 4 點＋就這樣回去的文字選單，畫面正常、可以選（不是卡住）。資料：DATE_HOTSPOTS.bg.d05_base_dusk（loc D05，cafe／garden／shop／board 四點都有位置）、S.bgKey('D05')＝d05_base_dusk＝entry 有。DATELAYER.covers 要求 pts＋all「全部」有位置——懷疑 all 裡多了 **D05.movie**（date_wish.js 有、date_hotspots 沒有）→ 整個地點照設計退回文字選單；或 ADV.active 當下是 false。兩種都只是「沒顯示圖層、照舊文字選單」（設計的退路），**不卡、不壞存檔**＝最壞 P2（圖層少一個地點）。r2 記 ctx.pts／ctx.all 的 id 再定。
- 00:2x REL76_reach「看門口的花」P2 原因找到：season_stalls3d.js plainLook「沒有區域 id 就放行」→ 溫州街 (44,20.8) 房子裡也放了一顆；LAWWW 開發分支 fa9fb3634f 修（FN-LOOK-REACH-1114），不進 rc2d，發布後 CC 重跑 reachability_all（BB_466 #23）。BB 同意這樣分。
