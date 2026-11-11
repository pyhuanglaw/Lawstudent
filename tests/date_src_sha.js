// 校外約會的源稿（企劃線 claude/story-planning）現在白名單認哪一版——約會的逐字對稿測試只認這一處。
// AA 因為審稿再給新 SHA 時：
//   1. python3 tools/date/bump_lines_sha.py <新 SHA> --by '…' --why '…' --rec an   （白名單 D01～D33 的 33 筆；AA_773～AA_778 換版就改白名單那幾筆的 sha）
//   2. 改下面的常數
//   3. python3 tools/date/import_date_lines.py；python3 tools/date/import_wish.py
//   4. node tests/an_dates_1111_unit.js（和 zq／zr／yt／kx／sis／peishan_dates_1111、date_overnight、date_wish、date_lines_* 這幾支）
// 工具（import_date_lines.py）裡的 *_PREV 是各輪「重寫以前的那一版」，不用跟著換。
module.exports={
  ALLOW_SHA:'bd1ce5be0',       // date_system/lines/D01～D33.json：白名單現在的版本（2026-11-11 以安重寫；同一版帶子晴再改的 31 格，見 ALSO_AN）
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
};
