// 校外約會的源稿（企劃線 claude/story-planning）現在白名單認哪一版——約會的逐字對稿測試只認這一處。
// AA 因為審稿再給新 SHA 時：
//   1. python3 tools/date/bump_lines_sha.py <新 SHA> --by '…' --why '…' --rec an   （白名單 D01～D33 的 33 筆；AA_773～AA_780 換版就改白名單那幾筆的 sha）
//   2. 改下面的常數
//   3. python3 tools/date/import_date_lines.py；python3 tools/date/import_wish.py
//   4. node tests/an_dates_1111_unit.js（和 zq／zr／yt／kx／sis／peishan_dates_1111、date_overnight、date_wish、date_lines_* 這幾支）
// 工具（import_date_lines.py）裡的 *_PREV 是各輪「重寫以前的那一版」，不用跟著換。
module.exports={
  ALLOW_SHA:'07d50af2f7',      // date_system/lines/D01～D33.json：白名單現在的版本（2026-11-12 AA-C 交 X324 可昕續改：AA_819 三連短句 26 句＋AA_822 remember 開頭的「上次」46 句，只動可昕 72 格，見 KX_1112；上一版 52c3ee258＝KX_1112_PREV）
  KX_1112_PREV:'52c3ee258',    // 可昕續改以前的那一版（2026-11-11 19:03 AA 交 X324 選項效果：1,765 個選項加 fx；把 fx 拿掉和 248c8e390 一字不差）
  FX_PREV:'248c8e390',         // 加 fx 以前的那一版（2026-11-11 以安重寫 bd1ce5be0 匯入以後，AA 照 LAWWW 的匯入回報再改以安 14 格，見 AN_FIX14；別人的格子和 bd1ce5be0 一樣）
  ZR_PREV:'f9c1a2b80',         // 芷若重寫以前的那一版（＝可昕重寫的那一版）
  ZR_SHA:'a29a8aba0',          // 芷若重寫的那一版（＝子晴重寫以前的那一版；之後只多芷若 D10 一句，見 ALSO_ZQ）
  ZR_COMMON_SHA:'e8a33995c',   // AA_773_zr_date_common.json（芷若不分地點的短句）
  ZR_WISH_SHA:'841c1810e',     // AA_774_zr_wish.json（芷若 D05 心願事件）
  ZQ_PREV:'a29a8aba0',         // 子晴重寫以前的那一版（＝芷若重寫的那一版）
  ZQ_COMMON_SHA:'02078efc0',   // AA_775_zq_date_common.json（子晴不分地點的短句 9 列：date_lines.js 五列、date3d.js 四列）
  ZQ_WISH_SHA:'26e72fd51',     // AA_776_zq_wish.json（子晴 D03 心願事件 30 列）
  ZQ_SHA:'02078efc0',          // 子晴重寫的那一版（＝以安重寫以前的那一版；之後子晴再改 31 格，見 ALSO_AN）
  ZQ_BASE:'f247bc77f',         // 子晴重寫匯入以前的開發分支（src/data/date_lines.js、date_wish.js、date3d.js 拿來比「別人零差異」；這個不用跟著換）
  /* 2026-11-11 a29a8aba0 那一版除了芷若的格子，另外改的四句（AA 回 LAWWW 的五題；路徑是 Dxx.json 裡的位置、old＝上一版 f9c1a2b80 的字）*/
  ALSO:[
    {loc:'D15',who:'heroine_03',path:'lines/hotspots/D15.rail/normal/2/lines/0/text',old:'期中考在那一片裡面。從這裡看，小小的。',new:'要交的報告都在那一片裡面。從這裡看，小小的。'},
    {loc:'D09',who:'kexin',path:'lines/arrive/normal/0/lines/0/text',old:'這座山我比你熟。走錯路的話是你帶錯，不是我。',new:'這座山我來過。跟著我走，走錯了算我的。'},
    {loc:'D17',who:'kexin',path:'lines/hotspots/D17.queen/remember/lines/0/text',old:'上次拍的那張，女王頭比你上鏡。我還是留著。',new:'上次拍的那張，你眼睛閉著。我還是留著。'},
    {loc:'D33',who:'kexin',path:'lines/hotspots/D33.lobby/remember/lines/0/text',old:'上次那部，我後來查了影評。影評跟我一樣，你輸了。',new:'上次那部，我後來查了影評。影評跟我想的一樣，我安心了。'}],
  /* 2026-11-11 02078efc0 那一版除了子晴的格子，另外改的一句（芷若 D10 小吃攤第一次、選「下次我做給妳。」的回覆；old＝上一版 a29a8aba0 的字）*/
  ALSO_ZQ:[
    {loc:'D10',who:'heroine_02',path:'lines/hotspots/D10.snack/first/choice/1/reply/0/text',old:'真的？我記下來了，我記性很好喔。',new:'你會做什麼？泡麵不算。心意我先收下。'}],
  AN_PREV:'02078efc0',         // 以安重寫以前的那一版（＝子晴重寫的那一版）
  AN_COMMON_SHA:'1f88da7cc',   // AA_777_an_date_common.json（以安不分地點的短句 9 列：date_lines.js 四列、date3d.js 五列）
  AN_WISH_SHA:'1f88da7cc',     // AA_778_an_wish.json（以安 D07 心願事件 16 列）
  AN_BASE:'6112a6b5a',         // 以安重寫匯入以前的開發分支（src/data/date_lines.js、date_wish.js、date3d.js 拿來比「別人零差異」；這個不用跟著換）
  AN_D3_SHA:'117a38189',       // AA_777 進 src/date3d.js 的那個 commit（tests/an_dates_1111_unit.js 比「date3d.js 的字串只差那五列」固定比這一版；之後 date3d.js 再加字串不用換）
  /* 2026-11-11 bd1ce5be0 那一版除了以安的格子，另外改的 31 格——都是子晴的（AA 交稿的清單：改稿紀錄 date_rewrite/zq_Dxx.json 的 _meta.fix_vs_an／fix_lawww_1111／fix_bb340c；
     和以安撞的句子、LAWWW 匯入後回報的沒有兌現場合的約定／D116、BB_340 複核 D26 騎車的說法）。n＝date_rewrite.py list heroine_04 Dxx 的格號；path 是 Dxx.json 裡 lines.heroine_04 底下的位置；old＝上一版 02078efc0 的字 */
  ALSO_AN:[
    {loc:'D03',n:8,path:'lines/hotspots/D03.demo/normal/0/lines/0/text',old:'那台試玩機不見了，他們做完了吧，好羨慕。',new:'那台試玩機不見了，他們做完了吧。我也想快點做完。'},
    {loc:'D05',n:29,path:'lines/hotspots/D05.garden/normal/0/lines/0/text',old:'樹下的長椅剛好坐兩個人，設計得很好。',new:'樹下的長椅有人刻了名字，刻得很深。'},
    {loc:'D10',n:5,path:'lines/arrive/normal/2/lines/0/text',old:'你連我的水都帶了？我沒準備你的，先欠著。',new:'你連我的水都帶了？謝謝。我沒有想到要帶你的。'},
    {loc:'D12',n:31,path:'lines/hotspots/D12.tea/normal/1/lines/0/text',old:'茶罐上的字好好看，是手寫的。',new:'茶罐上的字好好看，我看不懂是哪一種茶。'},
    {loc:'D12',n:41,path:'lines/hotspots/D12.pier/normal/0/lines/0/text',old:'河上有人在划獨木舟，好帥。',new:'碼頭邊有人在餵鴿子，鴿子比人多。'},
    {loc:'D14',n:11,path:'lines/closing/dating/0/lines/0/text',old:'下次早一點來，我會努力起床。',new:'這裡的夕陽我想再看一次。跟你。'},
    {loc:'D16',n:29,path:'lines/hotspots/D16.beach/normal/0/lines/0/text',old:'有人在衝浪，他等了五個浪才站起來一次。',new:'有人在衝浪，摔下來的時候板子飛得比人遠。'},
    {loc:'D17',n:2,path:'lines/arrive/first/lines/1/text',old:'每一塊石頭都長得不一樣，沒有一塊是偷懶的。',new:'石頭的顏色是一層一層的，像沒切好的蛋糕。'},
    {loc:'D19',n:8,path:'lines/closing/first/lines/1/text',old:'下次早一點出門，我盡量。',new:'剩下的一半，下次。我盡量不喊累。'},
    {loc:'D19',n:40,path:'lines/hotspots/D19.shrine/normal/0/lines/0/text',old:'柱子只剩下柱子，還是站得很直。',new:'柱子上有人放了一顆橘子，不知道是給誰的。'},
    {loc:'D21',n:52,path:'lines/hotspots/D21.bridge/normal/1/lines/0/text',old:'從這裡看得到廟的屋頂，好多人。',new:'橋上的石板有的新有的舊，顏色不一樣。'},
    {loc:'D22',n:30,path:'lines/hotspots/D22.maple/normal/1/lines/0/text',old:'步道好安靜，只有我的喘氣聲，好丟臉。',new:'走到一半我就在喘了，好丟臉。'},
    {loc:'D23',n:11,path:'lines/closing/dating/0/lines/0/text',old:'下次早一點來，我想看市場剛開的時候，我會起床。',new:'下次我要把每一攤都看過一遍。你負責提袋子。'},
    {loc:'D25',n:2,path:'lines/arrive/first/lines/1/text',old:'沙是黑的欸，我以為沙都是黃的。',new:'浪的聲音好大，講話要靠近一點。'},
    {loc:'D25',n:51,path:'lines/hotspots/D25.station/normal/0/lines/0/text',old:'這個站的椅子是面對海的，設計的人很懂。',new:'這個站只有一個站員，他在澆花。'},
    {loc:'D26',n:2,path:'lines/arrive/first/lines/1/text',old:'這裡的路比臺北寬，天空也比較大，我以前都沒發現。',new:'這裡的天空比臺北大，我以前都沒發現。'},
    {loc:'D26',n:7,path:'lines/closing/first/lines/0/text',old:'臺中用走的好累，這裡的人都騎車。',new:'臺中用走的好累，我以前沒走過這麼遠。'},
    {loc:'D26',n:11,path:'lines/closing/dating/0/lines/0/text',old:'下次來，我帶你去吃我小時候那家，在巷子裡，沒有招牌。',new:'臺中還有很多我沒帶你去的地方。我先留著。'},
    {loc:'D26',n:12,path:'lines/hotspots/D26.path/first/lines/0/text',old:'（草悟道）我以前補習下課都走這條。',new:'（草悟道）我以前都騎腳踏車經過，沒有停下來過。'},
    {loc:'D26',n:20,path:'lines/hotspots/D26.path/normal/2/lines/0/text',old:'這條路我一個人走過很多次。兩個人走，路變短了。',new:'這條路我以前都是一個人騎過去。兩個人用走的，路變長了，可是比較好。'},
    {loc:'D26',n:21,path:'lines/hotspots/D26.path/remember/lines/0/text',old:'這條路我這次想走到底，以前都只走到補習班那個路口。',new:'這條路我這次想走到底，以前都是騎車，三分鐘就沒了。'},
    {loc:'D26',n:22,path:'lines/hotspots/D26.path/dating/0/lines/0/text',old:'（她偷偷牽住你的手）這裡可能會遇到我認識的人。算了。',new:'（她偷偷牽住你的手）在臺中牽手，感覺很怪。好的那種怪。'},
    {loc:'D26',n:30,path:'lines/hotspots/D26.museum/normal/1/lines/0/text',old:'外面的雕塑我小時候爬過，被警衛吹哨子。',new:'外面的草地，我國中校外教學在這裡吃過便當。'},
    {loc:'D26',n:54,path:'lines/hotspots/D26.plaza/remember/lines/0/text',old:'我們坐過的那個角落還空著，沒人要，剛好。',new:'角落那塊草被坐平了。應該不只我們坐過。'},
    {loc:'D27',n:1,path:'lines/arrive/first/lines/0/text',old:'嘉義。空氣裡有木頭的味道。',new:'嘉義。我對這裡的印象只有雞肉飯，今天要更新。'},
    {loc:'D27',n:10,path:'lines/closing/normal/1/lines/0/text',old:'我身上都是檜木的味道，洗掉好可惜。',new:'雞肉飯我要再吃一碗才走，這是原則。'},
    {loc:'D28',n:9,path:'lines/closing/normal/0/lines/0/text',old:'我拍了一些影片，剪好再給你看，沒剪好不行。',new:'我拍了一些影片。剪不剪得出來，看我的心情。'},
    {loc:'D28',n:43,path:'lines/hotspots/D28.alley/remember/lines/0/text',old:'在這裡拍的那些門，我真的畫進遊戲了，藍色那扇用了兩次。',new:'在這裡拍的那些門，我真的畫進遊戲了，最舊的那扇用了兩次。'},
    {loc:'D29',n:1,path:'lines/arrive/first/lines/0/text',old:'高雄的路好寬，機車好多。',new:'高雄。港口就在城市裡面，船比房子高。'},
    {loc:'D29',n:52,path:'lines/hotspots/D29.rail/normal/1/lines/0/text',old:'輕軌經過的時候會叮叮兩聲，很客氣。',new:'有人把腳踏車停在鐵軌上拍照，輕軌來了才搬。'},
    {loc:'D30',n:3,path:'lines/arrive/normal/0/lines/0/text',old:'山就在後面，海就在前面，中間只有一條路。',new:'這裡的浪是直接拍在石頭上的，沒有沙。'}],
  AN_SHA:'bd1ce5be0',          // 以安重寫的那一版（＝AA 後續改 14 格以前的那一版；同一版帶子晴再改的 31 格，見 ALSO_AN）
  AN_FOLLOW_SHA:'248c8e390',   // AA_780_an_date_followup.json（不分地點的短句 9 列：date_lines.js 五列——以安 flaked 兩則、子晴／語彤／芷若 flaked 各一列；date3d.js 四列——S.EXTRA_LINES.heroine_01；_meta.she_pays＝S.SHE_PAYS）
  AN_BASE2:'7266e7a29',        // AA 後續改稿匯入以前的開發分支（src/data/date_lines.js、date3d.js 拿來比「只差這 14 格＋AA_780 九列」；這個不用跟著換）
  AN780_D3_SHA:'cd8f64806',    // AA_780 四列＋S.SHE_PAYS 進 src/date3d.js 的那個 commit（tests/an_dates_1111_unit.js 第 9 節比「date3d.js 的字串只差這幾個」固定比這一版；之後 date3d.js 再加字串不用換）
  /* 2026-11-11 248c8e390（以安匯入以後 AA 的後續改稿；AA_780 的 _meta）：源稿只動以安 14 格（改稿紀錄 date_rewrite/an_Dxx.json 的 _meta.fix_lawww_an_1111；沒人記的承諾、綁第一次選項的再訪句）。
     n＝date_rewrite.py list heroine_01 Dxx 的格號；path 是 Dxx.json 裡 lines.heroine_01 底下的位置；old＝上一版 bd1ce5be0 的字 */
  AN_FIX14:[
    {loc:'D05',n:21,path:'lines/hotspots/D05.cafe/remember/lines/0/text',old:'那三個論點我回去又想了，加了第四個，寫在手帳裡。',new:'在這裡看完的那部，我回去又想了很久，寫了半頁。'},
    {loc:'D05',n:43,path:'lines/hotspots/D05.shop/remember/lines/0/text',old:'講法庭戲的那本書，我後來讀完了。想去旁聽一次真的。',new:'這裡有一本講法庭戲的書，我後來讀完了。想去旁聽一次真的。'},
    {loc:'D07',n:34,path:'lines/hotspots/D07.wall/normal/0/lines/0/text',old:'你讀過的那個名字，我回去查了。',new:'牆上的名字，我回去查了其中一個。'},
    {loc:'D07',n:43,path:'lines/hotspots/D07.wall/remember/lines/0/text',old:'抄在筆記本最後一頁的那個名字，我又找到他了。',new:'我查過的那個名字，我又找到他了。在這一排。'},
    {loc:'D09',n:9,path:'lines/closing/normal/0/lines/0/text',old:'照片我要整理一下。挑好的再傳給你。',new:'照片我要整理一下。拍歪的那幾張，我也會留著。'},
    {loc:'D10',n:41,path:'lines/hotspots/D10.walk/normal/1/lines/0/text',old:'步道好平，下次騎腳踏車來。',new:'步道好平。騎腳踏車的人看起來很輕鬆。'},
    {loc:'D12',n:21,path:'lines/hotspots/D12.street/remember/lines/0/text',old:'屋頂那隻石雕的動物，我回去查了。是獅子，我猜錯了。',new:'屋頂那隻石雕的動物，我回去查了，是獅子。'},
    {loc:'D18',n:49,path:'lines/hotspots/D18.shop/first/choice/1/reply/0/text',old:'謝謝，我會寫第一頁給你看。',new:'謝謝。第一頁我會寫得很慢。'},
    {loc:'D18',n:53,path:'lines/hotspots/D18.shop/remember/lines/0/text',old:'在這裡買的那本筆記本，我寫到第二十頁了。',new:'這間店的筆記本，紙很好寫。我有一本寫到第二十頁了。'},
    {loc:'D23',n:11,path:'lines/closing/dating/0/lines/0/text',old:'你剝蝦很快。下次教我。',new:'你剝蝦很快。我看了還是學不會。'},
    {loc:'D26',n:31,path:'lines/hotspots/D26.museum/normal/2/lines/0/text',old:'下一檔展覽，我想再來。帶你。',new:'下一檔展覽的海報已經貼出來了。我看了很久。'},
    {loc:'D28',n:11,path:'lines/closing/dating/0/lines/0/text',old:'下次換你帶我去一個我沒去過的地方。',new:'你有沒有一個地方，是我沒去過的？我想聽你講。'},
    {loc:'D29',n:10,path:'lines/closing/normal/1/lines/0/text',old:'下次換我排行程，我會排得很鬆。',new:'這次的行程是我排過最鬆的。我有進步。'},
    {loc:'D31',n:11,path:'lines/closing/dating/0/lines/0/text',old:'（她打了一則訊息，打了又刪，最後收起手機）沒事。等一下當面講。',new:'（她打了一則訊息，打了又刪，最後收起手機）沒事。我只是想說，今天很好。'}],
  /* 2026-11-11 AA_780_an_date_followup.json@248c8e390：不分地點的短句（DATE_LINES.lines）裡以安以外的三列——四個人「30 天內第二次當天取消」那一句改成當下的反應（前一次她只回了「好。怎麼了？」，沒有人等過）。
     path＝稿上的 path；p＝遊戲檔 leaves 的路徑；old＝那個人自己那一輪（was）匯進來的字。各人的逐字對稿測試（zq／zr／yt）那一格改認 new；「和重匯以前比」的測試用下面的 un780 還原再比 */
  FLAKED_780:[
    {who:'heroine_04',path:'lines.heroine_04.flaked[0]',p:'/lines/heroine_04/flaked/0',old:'那天我設了鬧鐘，還真的起來了，結果你沒來。這種事一次就好。',new:'又取消。我鬧鐘都設好了。這種事不要有第三次。',was:'AA_775'},
    {who:'heroine_03',path:'lines.heroine_03.flaked[0][0]',p:'/lines/heroine_03/flaked/0/0',old:'那天我等了一下。',new:'嗯。第二次了。',was:'AA_767'},
    {who:'heroine_02',path:'lines.heroine_02.flaked[0][1]',p:'/lines/heroine_02/flaked/0/1',old:'我那天把一杯熱可可等到涼掉。下次，你請我一杯熱的。',new:'今天我連要穿哪一件都想好了。沒關係，衣服不會跑。',was:'AA_773'}],
  /* 2026-11-11 AA_812_date_pays_promises.json@f1fab0ec6（懸著的「下次我請」七格）：改稿紀錄 date_rewrite/ 五份（rec；AA 只改了紀錄、源稿 Dxx.json 沒有重新 apply，白名單 33 筆還是 248c8e390）
     ＋稿的 path_rows 兩列（沒有 rec）——tools/date/import_date_lines.py 寫檔前最後一步（apply812）疊上去。n＝date_rewrite.py list 的格號；path＝Dxx.json 裡她底下的位置（同 ALSO 的寫法）；
     p＝遊戲檔 leaves 的路徑；old＝源稿 248c8e390（＝重匯以前）的字。各支「和源稿一字不差」「和重匯以前比」的測試用下面的 un812 還原再比（只有那一格現在剛好是 new 才還原），
     那七格現在＝new 各支另外驗（cell812）；逐格、她請客／平分在 tests/date_she_pays_812_1111_unit.js */
  AA812_SHA:'f1fab0ec6',
  CELLS_812:[
    {who:'heroine_05',loc:'D06',n:45,rec:'sis_D06',path:'lines/hotspots/D06.cafe/remember/lines/0/text',p:'/loc/D06/lines/heroine_05/hotspots/D06.cafe/remember/lines/0/text',old:'上次你請的。這次我請。',new:'這次我請。你坐著就好。'},
    {who:'heroine_04',loc:'D06',n:45,rec:'zq_D06',path:'lines/hotspots/D06.cafe/remember/lines/0/text',p:'/loc/D06/lines/heroine_04/hotspots/D06.cafe/remember/lines/0/text',old:'我說過要請你吃滷味，等一下去，我知道一間。',new:'這家我來過兩次了。這次我請，你不要算。'},
    {who:'classmate_peishan',loc:'D15',n:43,rec:'peishan_D15',path:'lines/hotspots/D15.store/remember/lines/0/text',p:'/loc/D15/lines/classmate_peishan/hotspots/D15.store/remember/lines/0/text',old:'上次說宵夜算我的，我記得喔，今天兌現。',new:'今天宵夜算我的。上次就想請了。'},
    {who:'classmate_peishan',loc:'D21',n:20,rec:'peishan_D21',path:'lines/hotspots/D21.street/normal/2/lines/0/text',p:'/loc/D21/lines/classmate_peishan/hotspots/D21.street/normal/2/lines/0/text',old:'你要吃什麼？我請你，上次是你請的。',new:'你要吃什麼？這攤我請。'},
    {who:'kexin',loc:'D15',n:10,rec:'kx_D15',path:'lines/closing/normal/1/lines/0/text',p:'/loc/D15/lines/kexin/closing/normal/1/lines/0/text',old:'宵夜下次我請。我已經挑好了。',new:'宵夜我請。我已經挑好了，在山下。'},
    {who:'heroine_04',loc:'D06',n:41,path:'lines/hotspots/D06.cafe/first/choice/1/reply/0/text',p:'/loc/D06/lines/heroine_04/hotspots/D06.cafe/first/choice/1/reply/0/text',old:'好。下次我請你吃滷味。',new:'好。下次我請。'},
    {who:'heroine_03',loc:'D10',n:32,path:'lines/hotspots/D10.boat/remember/lines/0/text',p:'/loc/D10/lines/heroine_03/hotspots/D10.boat/remember/lines/0/text',old:'上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。',new:'上次坐完，我跟我媽說了。她說「有穿救生衣嗎」。這次船票我請。'}],
  /* 2026-11-12 07d50af2f7（X324 可昕續改，AA-C 定稿；BB_375／BB_377 第二意見採納）：源稿只動可昕 72 格——AA_819_kx_triple_short.json 的約會 26 列（三連短句）、AA_822_kx_remember_last.json 46 列（remember 開頭的「上次」；D19 期中考→期末考）。
     path 是 Dxx.json 裡 lines.kexin 底下的位置（遊戲檔＝/loc/Dxx/lines/kexin/＋path）；old＝上一版 52c3ee258 的字、new＝稿的字。
     game（只有兩格）＝遊戲裡的字：稿的新句在「？」「。」後面有「……」，匯入工具寫檔前照 AA_694 的規則（tools/date/ellipsis694.py，使用者 11-05「整批改」）拿掉了——和稿差這兩個刪節號，已回報 AA。
     各支「和源稿一字不差」「和重匯以前比」的測試：遊戲用 un812 還原（只有那一格現在剛好是新字才還原）、源稿用 src248 還原；這 72 格本身在 tests/kx_dates_1112_unit.js 逐格驗 */
  KX_1112:[
    {loc:'D01',doc:'AA_822',path:'hotspots/D01.expo/remember/lines/0/text',old:'上次那個展換掉了。我們那條規則還在，我有在記。',new:'展換掉了。我們那條規則還在，我有在記。'},
    {loc:'D01',doc:'AA_822',path:'hotspots/D01.market/remember/lines/0/text',old:'上次那隻耳環，我戴去上課。老師看了兩次，很成功。',new:'耳環我戴去上課了。老師看了兩次，很成功。'},
    {loc:'D01',doc:'AA_822',path:'hotspots/D01.wall/remember/lines/0/text',old:'上次那張背影，我設成桌布了。同學問是誰，我說路人。',new:'那張背影，我設成桌布了。同學問是誰，我說路人。'},
    {loc:'D02',doc:'AA_822',path:'hotspots/D02.pond/remember/lines/0/text',old:'上次那隻烏龜爬到另一邊了，牠有進步。',new:'烏龜爬到另一邊了，牠有進步。'},
    {loc:'D03',doc:'AA_822',path:'hotspots/D03.demo/remember/lines/0/text',old:'上次那個遊戲，我回去查了攻略。很不浪漫。',new:'那個遊戲，我回去查了攻略。很不浪漫。'},
    {loc:'D03',doc:'AA_819',path:'hotspots/D03.arcade/normal/2/lines/0/text',old:'這首好難。再一次。我不走。',new:'這首好難。再來一次，沒過我不走。'},
    {loc:'D03',doc:'AA_819',path:'hotspots/D03.gacha/first/choice/1/reply/0/text',old:'不行。最多三次。第三次轉到了。',new:'（她轉了三次，第三次出來的是長頸鹿）不行，我只轉三次。你看，第三次就轉到了。'},
    {loc:'D03',doc:'AA_822',path:'hotspots/D03.gacha/remember/lines/0/text',old:'上次那隻長頸鹿，脖子被我壓歪了。我有道歉。',new:'長頸鹿的脖子被我壓歪了。我有道歉。'},
    {loc:'D03',doc:'AA_819',path:'hotspots/D03.window/first/choice/1/reply/0/text',old:'好。最後一筆。記完就不記。',new:'好，這是最後一筆，記完今天就不記了。'},
    {loc:'D03',doc:'AA_822',path:'hotspots/D03.window/remember/lines/0/text',old:'上次那筆三百二，我記在「很值得」那一欄。',new:'那筆三百二，我記在「很值得」那一欄。'},
    {loc:'D04',doc:'AA_822',path:'hotspots/D04.snack/remember/lines/0/text',old:'上次那家冰換口味了，我們試新的。',new:'冰店換口味了，我們試新的。'},
    {loc:'D05',doc:'AA_822',path:'hotspots/D05.garden/remember/lines/0/text',old:'上次那張長椅空著，我們運氣變好了。',new:'長椅今天空著，我們運氣變好了。'},
    {loc:'D05',doc:'AA_819',path:'hotspots/D05.shop/first/choice/0/reply/0/text',old:'好。是你叫我買的。不好看你負責。',new:'好，是你叫我買的喔，不好看你要負責。'},
    {loc:'D05',doc:'AA_822',path:'hotspots/D05.shop/remember/lines/0/text',old:'上次那本講經濟的電影書讀完了，結論很普通。',new:'那本講經濟的電影書讀完了，結論很普通。'},
    {loc:'D06',doc:'AA_822',path:'hotspots/D06.gallery/remember/lines/0/text',old:'上次那幅畫的價錢，我回去查了。不告訴你。',new:'那幅畫的價錢，我回去查了。不告訴你。'},
    {loc:'D07',doc:'AA_822',path:'hotspots/D07.cell/remember/lines/0/text',old:'上次那扇門，我記得編號。不說出來。',new:'那扇門，我記得編號。不說出來。'},
    {loc:'D07',doc:'AA_822',path:'hotspots/D07.wall/remember/lines/0/text',old:'上次那封「不要為我擔心」的信，我回去讀了全文。',new:'那封「不要為我擔心」的信，我回去讀了全文。'},
    {loc:'D07',doc:'AA_822',path:'hotspots/D07.path/remember/lines/0/text',old:'上次那個沒有回答的問題，我自己想了答案。不會。',new:'那個沒有回答的問題，我自己想了答案。不會。'},
    {loc:'D08',doc:'AA_822',path:'hotspots/D08.panda/remember/lines/0/text',old:'上次那個外交官在吃竹子，牠加班了。',new:'外交官在吃竹子，牠加班了。'},
    {loc:'D08',doc:'AA_822',path:'hotspots/D08.penguin/remember/lines/0/text',old:'上次那隻站最高的被擠下來了。',new:'站最高的那隻被擠下來了。'},
    {loc:'D08',doc:'AA_822',path:'hotspots/D08.giraffe/remember/lines/0/text',old:'上次那隻小長頸鹿長高了，我拍了對比照。',new:'小長頸鹿長高了，我拍了對比照。'},
    {loc:'D08',doc:'AA_819',path:'hotspots/D08.train/first/choice/0/reply/0/text',old:'什麼意思。好，我懂了。很肉麻。',new:'什麼意思？……好，我懂了，你很肉麻欸。',game:'什麼意思？好，我懂了，你很肉麻欸。'},
    {loc:'D08',doc:'AA_819',path:'hotspots/D08.train/first/choice/1/reply/0/text',old:'好。可是要再排隊。算了，一圈。',new:'好。可是要再排一次隊欸。算了，一圈就一圈。'},
    {loc:'D08',doc:'AA_822',path:'hotspots/D08.train/remember/lines/0/text',old:'上次那個一直揮手的小孩沒來。',new:'一直揮手的那個小孩沒來。'},
    {loc:'D09',doc:'AA_822',path:'hotspots/D09.view/remember/lines/0/text',old:'上次那盞一直閃的燈修好了。',new:'一直閃的那盞燈修好了。'},
    {loc:'D09',doc:'AA_822',path:'hotspots/D09.path/remember/lines/0/text',old:'上次那隻貓又在，牠認得我了。',new:'貓又在。牠認得我了。'},
    {loc:'D10',doc:'AA_822',path:'hotspots/D10.snack/remember/lines/0/text',old:'上次那攤換了一個口味，我們試試新的。',new:'這攤換了一個口味，我們試試新的。'},
    {loc:'D11',doc:'AA_822',path:'hotspots/D11.museum/remember/lines/0/text',old:'上次那個「平等」的筆記，我真的寫進去了。',new:'那個「平等」的筆記，我真的寫進去了。'},
    {loc:'D11',doc:'AA_819',path:'hotspots/D11.footbath/first/choice/1/reply/0/text',old:'好。好，可以了。好舒服。',new:'好。好，這樣可以了，比我想的舒服。'},
    {loc:'D12',doc:'AA_822',path:'hotspots/D12.street/remember/lines/0/text',old:'上次那個竹籃，我拿來放保養品。很合理。',new:'竹籃我拿來放保養品了。很合理。'},
    {loc:'D14',doc:'AA_822',path:'hotspots/D14.boardwalk/remember/lines/0/text',old:'上次那隻長頸鹿換成小船了，配合場地。',new:'長頸鹿換成小船了，配合場地。'},
    {loc:'D15',doc:'AA_822',path:'hotspots/D15.car/remember/lines/0/text',old:'上次那首歌，予樂問我好不好用。我說很好用。',new:'那首歌，予樂問我好不好用。我說很好用。'},
    {loc:'D15',doc:'AA_819',path:'hotspots/D15.sky/normal/0/lines/0/text',old:'我數到四顆。你呢？不准亂報。',new:'我數到四顆，你呢？不准為了贏我亂報。'},
    {loc:'D16',doc:'AA_819',path:'hotspots/D16.drive/first/choice/1/reply/0/text',old:'好。第三首。專心聽。',new:'好，第三首，這首你給我專心聽。'},
    {loc:'D16',doc:'AA_822',path:'hotspots/D16.beach/remember/lines/0/text',old:'上次那個貝殼，予樂放在她桌上了。',new:'貝殼予樂放在她桌上了。'},
    {loc:'D16',doc:'AA_819',path:'hotspots/D16.lighthouse/normal/2/lines/0/text',old:'幫我拍一張。不行，重拍。我頭髮在飛。',new:'幫我拍一張。不行，重拍，我頭髮整個在飛。'},
    {loc:'D17',doc:'AA_819',path:'hotspots/D17.queen/dating/0/lines/0/text',old:'合照。女王頭要入鏡。你蹲低一點。',new:'來合照。女王頭要入鏡，所以你蹲低一點。'},
    {loc:'D17',doc:'AA_822',path:'hotspots/D17.mushroom/remember/lines/0/text',old:'上次那顆像我的石頭，我找不到了。你說我看錯，我沒有。',new:'那顆像我的石頭，我找不到了。你說我看錯，我沒有。'},
    {loc:'D18',doc:'AA_819',path:'hotspots/D18.teahouse/normal/0/lines/0/text',old:'茶好香。我喝不出差別。可是好香。',new:'茶好香。老實說我喝不出哪裡不一樣，可是真的好香。'},
    {loc:'D18',doc:'AA_822',path:'hotspots/D18.teahouse/remember/lines/0/text',old:'上次那個位子被別人訂走了。這個也可以，我不高興一下就好。',new:'那個位子被別人訂走了。這個也可以，我不高興一下就好。'},
    {loc:'D18',doc:'AA_822',path:'hotspots/D18.shop/remember/lines/0/text',old:'上次那隻章魚，我掛在包包上。同學問我為什麼，我說沒有為什麼。',new:'章魚我掛在包包上。同學問我為什麼，我說沒有為什麼。'},
    {loc:'D19',doc:'AA_819',path:'arrive/normal/1/lines/0/text',old:'我帶了暈車藥。山路很彎。幫你帶的。',new:'山路很彎，所以我帶了暈車藥，幫你帶的。'},
    {loc:'D19',doc:'AA_822',path:'hotspots/D19.museum/remember/lines/0/text',old:'上次的好運我拿去考期中考了，有用。',new:'上次的好運我拿去考期末考了，有用。'},
    {loc:'D19',doc:'AA_822',path:'hotspots/D19.houses/remember/lines/0/text',old:'上次那隻貓換了一個地方睡。',new:'貓換了一個地方睡。'},
    {loc:'D21',doc:'AA_819',path:'hotspots/D21.street/normal/0/lines/0/text',old:'牛角麵包。我買兩個。一個給予樂。一個給你。',new:'牛角麵包我買兩個，一個帶回去給予樂，一個給你。'},
    {loc:'D21',doc:'AA_822',path:'hotspots/D21.dye/remember/lines/0/text',old:'上次那兩條，你那條我拿走了。你又沒在用。',new:'那兩條，你那條我拿走了。你又沒在用。'},
    {loc:'D22',doc:'AA_819',path:'hotspots/D22.dam/normal/2/lines/0/text',old:'外套幫我拿。不是，幫我穿。我手在拿手機。',new:'外套幫我拿一下。不是啦，是幫我穿上，我手在拿手機。'},
    {loc:'D22',doc:'AA_822',path:'hotspots/D22.maple/remember/lines/0/text',old:'上次那個問題我查到了。算了，你也不想知道。',new:'那個問題我查到了。算了，你也不想知道。'},
    {loc:'D22',doc:'AA_822',path:'hotspots/D22.fish/remember/lines/0/text',old:'上次那碗湯，我回去想了三天。',new:'那碗湯，我回去想了三天。'},
    {loc:'D23',doc:'AA_819',path:'hotspots/D23.seawall/first/choice/1/reply/0/text',old:'好。我計時。不計了。',new:'好，我來計時。……算了，今天不計了。',game:'好，我來計時。算了，今天不計了。'},
    {loc:'D23',doc:'AA_819',path:'hotspots/D23.seawall/normal/1/lines/0/text',old:'天上有飛機。好多人要出國。我們不用。',new:'天上有飛機，好多人要出國。我們今天不用去那麼遠。'},
    {loc:'D24',doc:'AA_819',path:'hotspots/D24.footbath/first/choice/1/reply/0/text',old:'好。二十分鐘。我設了計時。',new:'好，就泡二十分鐘，我設好計時了。'},
    {loc:'D24',doc:'AA_819',path:'hotspots/D24.footbath/normal/2/lines/0/text',old:'毛巾給我。你沒帶？好，用我的。',new:'毛巾給我。你沒帶？好啦，先用我這條。'},
    {loc:'D24',doc:'AA_819',path:'hotspots/D24.street/first/choice/1/reply/0/text',old:'好。被請一次。下一攤我來。',new:'好，這次讓你請，下一攤換我來。'},
    {loc:'D24',doc:'AA_822',path:'hotspots/D24.station/remember/lines/0/text',old:'上次那個鐘還是快一分鐘。',new:'鐘還是快一分鐘。'},
    {loc:'D25',doc:'AA_822',path:'hotspots/D25.cafe/remember/lines/0/text',old:'上次那張明信片，我寄給自己了。昨天收到。',new:'那張明信片，我寄給自己了。昨天收到。'},
    {loc:'D25',doc:'AA_822',path:'hotspots/D25.surf/remember/lines/0/text',old:'上次那個跌五次的人，站得很穩了。',new:'那個跌五次的人，站得很穩了。'},
    {loc:'D26',doc:'AA_822',path:'hotspots/D26.museum/remember/lines/0/text',old:'上次那堆椅子的作品，換掉了。有點可惜。',new:'椅子堆成的那件作品換掉了。有點可惜。'},
    {loc:'D26',doc:'AA_822',path:'hotspots/D26.plaza/remember/lines/0/text',old:'上次那個賣風箏的阿伯也在。',new:'賣風箏的阿伯也在。'},
    {loc:'D27',doc:'AA_819',path:'hotspots/D27.shop/first/choice/0/reply/0/text',old:'好。小的。合理。',new:'好，買小的就好，這樣合理。'},
    {loc:'D27',doc:'AA_819',path:'hotspots/D27.rail/first/choice/0/reply/0/text',old:'好。不上課。坐車廂。',new:'好，今天不上課，我們去坐車廂。'},
    {loc:'D27',doc:'AA_822',path:'hotspots/D27.rail/remember/lines/0/text',old:'上次那節車廂有人在裡面拍照，我們等一下。',new:'車廂有人在裡面拍照，我們等一下。'},
    {loc:'D28',doc:'AA_819',path:'arrive/first/lines/0/text',old:'臺南。兩天一夜。行程表三頁。',new:'臺南，兩天一夜，我的行程表排了三頁。'},
    {loc:'D28',doc:'AA_822',path:'hotspots/D28.museum/remember/lines/0/text',old:'上次那區講翻譯的，我回去想了很久。法條也是這樣。',new:'那區講翻譯的，我回去想了很久。法條也是這樣。'},
    {loc:'D28',doc:'AA_819',path:'hotspots/D28.museum/dating/0/lines/0/text',old:'（她在展間的長椅上拍拍旁邊）坐。看完這區再走。這是指令。',new:'（她在展間的長椅上拍拍旁邊）坐。看完這一區再走，這是指令。'},
    {loc:'D28',doc:'AA_819',path:'hotspots/D28.circle/first/choice/0/reply/0/text',old:'好。不分析。坐樹下。',new:'好，今天不分析，去樹下坐著就好。'},
    {loc:'D29',doc:'AA_822',path:'hotspots/D29.harbor/remember/lines/0/text',old:'上次那台起重機還在同一個位置。它這幾個月都在幹嘛。',new:'起重機還在同一個位置。它這幾個月都在幹嘛。'},
    {loc:'D30',doc:'AA_822',path:'hotspots/D30.pebble/remember/lines/0/text',old:'上次那顆最圓的，我找不到了。',new:'那顆最圓的，我找不到了。'},
    {loc:'D32',doc:'AA_822',path:'hotspots/D32.meadow/remember/lines/0/text',old:'上次那隻叫予樂的羊，還是很吵。',new:'叫予樂的那隻羊，還是很吵。'},
    {loc:'D32',doc:'AA_819',path:'hotspots/D32.stall/normal/1/lines/0/text',old:'熱湯很好喝。我在算熱量。好，不算。',new:'熱湯很好喝。我剛剛在算熱量……好啦，今天不算。'},
    {loc:'D32',doc:'AA_822',path:'hotspots/D32.stall/remember/lines/0/text',old:'上次那顆高麗菜，我們宿舍吃了一個禮拜的泡麵加菜。',new:'那顆高麗菜，我們宿舍吃了一個禮拜的泡麵加菜。'},
    {loc:'D33',doc:'AA_822',path:'hotspots/D33.food/remember/lines/0/text',old:'上次那家換菜單了，我們吃新的。',new:'這家換菜單了，我們吃新的。'},
  ],
};
/* 「和重匯以前比」用：回傳一份複本，把 AA_780 換的那三格（FLAKED_780）還原成各人自己那一輪的字。x＝整份 DATE_LINES（或 strip 過、少了幾個人的）；只有那一格現在剛好是 AA_780 的 new 才還原（不是＝不動，照舊會紅）；
   重匯以前的那一份（那一格還是 old）丟進來不會變 */
module.exports.un780=x=>{ const y=JSON.parse(JSON.stringify(x)); for(const r of module.exports.FLAKED_780){ const k=r.p.split('/').slice(1); let o=y; for(const t of k.slice(0,-1)) o=o==null?o:o[t]; const last=k[k.length-1]; if(o&&o[last]===r.new) o[last]=r.old; } return y; };
/* FLAKED_780 那一格的字（r.p 照 leaves 的路徑走；整份 DATE_LINES 丟進來）：各支測試另外驗「現在＝new、重匯以前＝old」，un780 才不會把別的差異藏起來 */
module.exports.cell780=(x,r)=>{ let o=x; for(const t of r.p.split('/').slice(1)) o=o==null?o:o[t]; return o; };
/* 各人自己那一輪的逐字對稿：稿上那一列（path、new）如果是 AA_780 之後又換掉的那一格（FLAKED_780 的 path 一樣、old＝那一列的 new），現在認 AA_780 的 new；別的列照舊認那一列的 new */
module.exports.want780=r=>{ const x=module.exports.FLAKED_780.find(y=>y.path===r.path&&y.old===r.new); return x?x.new:r.new; };
/* AA_812 那七格（CELLS_812）：回傳一份複本，把現在剛好是 new 的格還原成 old（源稿 248c8e390、重匯以前的字）。x＝整份 DATE_LINES（r.p 照 leaves 的路徑走）；不是 new＝不動（照舊會紅）*/
/* 2026-11-11 起（AA 52c3ee258，X324 選項效果）：源稿和遊戲的選項多了 fx（友情／愛情）。「和源稿一字不差」「和重匯以前比」只比字：
   noFx 回傳拿掉所有 fx 的複本；un812 也一起拿掉（un812＝回到 248c8e390 那一層）。fx 本身和源稿逐格比在 tests/date_fx_x324_1111_unit.js
   2026-11-12 起（AA 07d50af2f7，X324 可昕續改 KX_1112）：un812 也把可昕那 72 格還原成 52c3ee258 的字（只有那一格現在剛好是新字才還原）；
   src248(k,json)＝源稿 Dxx.json（ALLOW_SHA 那一版）拿掉 fx、可昕那 72 格還原＝回到 248c8e390 的字（別人那幾輪「和源稿／上一版逐格比」用；舊寫法 noFx(JSON.parse(t))） */
module.exports.noFx=x=>JSON.parse(JSON.stringify(x,(k,v)=>k==='fx'?undefined:v));
module.exports.un812=x=>{ const y=module.exports.noFx(x); for(const r of module.exports.KX_1112){ let o=y; const k=['loc',r.loc,'lines','kexin',...r.path.split('/')]; for(const t of k.slice(0,-1)) o=o==null?o:o[t]; const last=k[k.length-1]; if(o&&o[last]===(r.game||r.new)) o[last]=r.old; } for(const r of module.exports.CELLS_812){ const k=r.p.split('/').slice(1); let o=y; for(const t of k.slice(0,-1)) o=o==null?o:o[t]; const last=k[k.length-1]; if(o&&o[last]===r.new) o[last]=r.old; } return y; };
module.exports.cell812=(x,r)=>{ let o=x; for(const t of r.p.split('/').slice(1)) o=o==null?o:o[t]; return o; };
module.exports.src248=(loc,x)=>{ const y=module.exports.noFx(x); for(const r of module.exports.KX_1112){ if(r.loc!==loc) continue; let o=y; const k=['lines','kexin',...r.path.split('/')]; for(const t of k.slice(0,-1)) o=o==null?o:o[t]; const last=k[k.length-1]; if(o&&o[last]===r.new) o[last]=r.old; } return y; };
