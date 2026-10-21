# 黑畫面盤點（tools/story/black_bg_audit.js 自動產生）

> 產生：2026-10-21T12:23Z；範圍：全部的 STORY_EVENTS＋重考期在家。玩家看到深色底（沒有圖）的段落 111 段、共 676 句。
> 依「背景代號」分組：同一個代號補一張圖，就補好那一組的全部段落。電話（「電話」場景）深色底可能是故意的，BB 和使用者決定要不要補。

## 1. 要補的圖（依影響句數排）

| 背景代號 | 原因 | 地點 | 用到的事件 | 句數 |
|---|---|---|---|---|
| `phone_street_night` | 沒有圖（image:null） | 電話 | ev_y0_fight、ev_y0_kh_call、ev_y0_kh_madeup、ev_y0_e36、ev_kexin_kh_missed_call、ev_kexin_call_helper、ev_kexin_call_helper2、ev_kexin_kn_call_y3、ev_kexin_k18_call、ev_yu_alone_call、ev_kexin_k20_call、ev_fangyt_tickets、ev_kexin_intern_result、ev_kexin_lunar_eve_y4_call | 119 |
| `dark` | 背景代號不存在 | 小鎮的市場、新體育館・球場、高雄・港邊的山上、博雅教學館、地方法院、萬才館二樓、政大山下・咖啡店、高雄・左營站、考場、宜蘭・民宿、台南車站、萬才館大廳、兩點半 Café（打烊以後）、亞利桑那、峽谷、鳳凰城的機場、會所・自習室 | ev_spring_y2_noodle、ev_final_game_y3、ev_kexin_qixi_y2、ev_kexin_lecture_ntu、ev_crimpro_court_visit、ev_push_interview、ev_kexin_xmas_y4、ev_kexin_trip_winter_y4、ev_grad_exam、ev_spring_y4、ev_peishan_open_class、ev_last_game_y4、ev_concert_y4、ev_zhiruo_back_cafe、ev_us_canyon、ev_sis_canyon、ev_sis_plan_us、ev_long_bbq | 115 |
| `undefined` | 換場景但沒有給背景（沒有 bg） | 公館・巷子裡的簡餐店、溫學姊的房間、資工系館・走廊、高雄・客運站附近的早餐店、公館、新體育館、霖澤館一樓、國際學生辦公室、宿舍・共用廚房、河邊、宿舍門口、海邊、便利商店、桃園機場・入境大廳 | ev_sis_fam_dinner、ev_sis_c2_room、ev_zq_ask_kai、ev_y0_kh_bus、ev_sis_results_dinner、ev_zhe_game_y2、ev_y2_xmas、ev_jp_suitcase、ev_jp_office、ev_jp_kitchen、ev_jp_goldenweek、ev_jp_repair_river、ev_jp_tanabata、ev_jp_tanabata_repair、ev_jp_sea、ev_jp_lastnight、ev_jp_lastnight_alone、ev_jp_return_hall | 109 |
| `dark` | 事件底色 dark、還沒換背景 | （事件開頭） | ev_va09_lunch、ev_yt_nye_call_y1、ev_y0_e21o、ev_y0_e26、ev_y0_rp、ev_y0_e36r、ev_kx_nye_video_y2、ev_kx_nye_video_y3、ev_kx_nye_video_y4、ev_an_sis_meet_lawlib、ev_yt_nye_call_y4、ev_zr_nye_video_y3、ev_zr_nye_video_y4、ev_yt_nye_call_y2、ev_kexin_qixi_y2、ev_typhoon_y3_family | 83 |
| `cram_counter` | 沒有圖（image:null） | 以前的補習班 | ev_y0_e27b | 24 |
| `us_lake` | 背景代號不存在 | 湖邊 | ev_us3_lake、ev_usl_lake1、ev_usl_lake_solo | 24 |
| `us_chapel_steps` | 背景代號不存在 | 小教堂前的台階 | ev_us_first_snow、ev_us_snow_repair | 21 |
| `car` | 沒有圖（image:null） | 車上 | ev_kexin_trip_spring_y1、ev_kexin_trip_spring_y2、ev_kexin_trip_spring_y4 | 19 |
| `jp_riverbank` | 背景代號不存在 | 大學城的河堤 | ev_liheng_japan、ev_an_sakura_riverbank | 16 |
| `cafe_closed` | 背景代號不存在 | 兩點半 Café（店休） | ev_zhiruo_twelve_slips | 14 |
| `us_club_study` | 背景代號不存在 | 會所自習室 | ev_usl_long3 | 14 |
| `mrt_night` | 沒有圖（image:null） | 電話 | ev_y0_e30 | 12 |
| `us_club_lounge` | 背景代號不存在 | 會所・交誼廳、會所 | ev_us_club_dinner、ev_usl_thanks_long | 12 |
| `trip_sea` | 沒有圖（image:null） | 海邊、高雄・海邊 | ev_kexin_trip_spring_y1、ev_kexin_trip_winter_y4 | 11 |
| `seaside_town` | 沒有圖（image:null） | 春假・海邊的小鎮 | ev_noodle_trip_spring_y1 | 9 |
| `boardgame_gg` | 沒有圖（image:null） | 公館・桌遊店 | ev_y0_gather | 9 |
| `us_club_lawn` | 背景代號不存在 | 會所 | ev_usl_bbq | 9 |
| `jp_dorm_lobby` | 背景代號不存在 | 宿舍大廳 | ev_an_town_notice_repair | 8 |
| `trip_oldtown` | 沒有圖（image:null） | 老街 | ev_kexin_trip_spring_y1、ev_kexin_trip_spring_y2、ev_kexin_trip_spring_y4 | 7 |
| `gongguan_cake` | 背景代號不存在 | 公館 | ev_kexin_birthday_y3 | 7 |
| `jp_town_hall` | 背景代號不存在 | 町公所門口 | ev_an_town_notice | 7 |
| `us_shared_kitchen` | 背景代號不存在 | C 棟 208 | ev_usl_thanks | 7 |
| `false` | 換場景但沒有給背景（bg:false） | 舊金山 | ev_sf_photo17、ev_sf_photo19、ev_sf_photo21 | 6 |
| `kh_pier2` | 沒有圖（image:null） | 高雄・駁二、大港橋 | ev_y0_kh3 | 5 |
| `kh_xinjuejiang` | 沒有圖（image:null） | 高雄・新崛江 | ev_y0_kh3 | 3 |
| `kh_sizihwan` | 沒有圖（image:null） | 高雄・西子灣 | ev_y0_kh3 | 3 |
| `cafe_window` | 背景代號不存在 | 兩點半 Café・窗邊 | ev_an_notebook | 2 |
| `cg_sf_bridge_fog_heroine05` | CG 沒登記 | CG | ev_sf2 | 1 |

## 2. 每一段（事件、什麼時候、第一句）

| 事件 | 標題 | 路線 | 什麼時候 | 場景 | 背景代號 | 原因 | 句數 | 第一句 |
|---|---|---|---|---|---|---|---|---|
| ev_sis_fam_dinner | 家聚 | law | outing | 公館・巷子裡的簡餐店 | `undefined` | 換場景但沒有給背景（沒有 bg） | 12 | （長桌坐了七八個人，大一到大四都有。） |
| ev_sis_c2_room | 筆記本 | law | auto | 溫學姊的房間 | `undefined` | 換場景但沒有給背景（沒有 bg） | 3 | （家裡要搬家。她的房間地上好幾個紙箱，一半已經封起來。） |
| ev_zq_ask_kai | 你室友有女朋友嗎 | law | sleep | 資工系館・走廊 | `undefined` | 換場景但沒有給背景（沒有 bg） | 3 | 欸，你室友……有女朋友嗎？ |
| ev_va09_lunch | 事務所樓下的午餐 | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 5 | （事務所那棟大樓的一樓，自助餐。芯慈的識別證反過來別在衣服上。） |
| ev_yt_nye_call_y1 | 語彤的電話 | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 6 | （零點過一分，手機響了。是語彤。） |
| ev_kexin_trip_spring_y1 | 春假：開車旅行 | law | outing | 車上 | `car` | 沒有圖（image:null） | 3 | 規則。我管音樂，你管方向。 |
| ev_kexin_trip_spring_y1 | 春假：開車旅行 | law | outing | 海邊 | `trip_sea` | 沒有圖（image:null） | 6 | 水好冰。你要不要下來？ |
| ev_kexin_trip_spring_y1 | 春假：開車旅行 | law | outing | 老街 | `trip_oldtown` | 沒有圖（image:null） | 5 | 你想先吃哪一家？ |
| ev_kexin_trip_spring_y1 | 春假：開車旅行 | law | outing | 車上 | `car` | 沒有圖（image:null） | 2 | 我不睡。我要陪你開車。 |
| ev_noodle_trip_spring_y1 | 春假・小旅行 | law | outing | 春假・海邊的小鎮 | `seaside_town` | 沒有圖（image:null） | 9 | 火車上，四個位子怎麼坐，討論了一整站。最後阿哲說： |
| ev_y0_fight | 電話 | econ | auto | 電話 | `phone_street_night` | 沒有圖（image:null） | 7 | 我明天早上九點有小考。你剛剛傳了三則貓的影片。 |
| ev_y0_e21o | 除夕的電話 | econ | auto | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 6 | （電話。很吵。） |
| ev_y0_e26 | 車上 | econ | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 1 | （你拿了車鑰匙出門。） |
| ev_y0_kh3 | 高雄三天兩夜 | econ | econff | 高雄・新崛江 | `kh_xinjuejiang` | 沒有圖（image:null） | 3 | （大年初三。你開了四個多小時的車到高雄。她在家樓下等你，一上車就說：「先 |
| ev_y0_kh3 | 高雄三天兩夜 | econ | econff | 高雄・駁二、大港橋 | `kh_pier2` | 沒有圖（image:null） | 5 | （駁二。舊倉庫改的展場，一間一間逛過去。） |
| ev_y0_kh3 | 高雄三天兩夜 | econ | econff | 高雄・西子灣 | `kh_sizihwan` | 沒有圖（image:null） | 3 | （傍晚，西子灣。你們坐在堤防上等夕陽。） |
| ev_y0_e27b | 一起去問補習班 | econ | outing | 以前的補習班 | `cram_counter` | 沒有圖（image:null） | 24 | （同一個櫃台。上次那個工作人員認得你。） |
| ev_y0_e30 | 辦休學的那天 | econ | Y0S1 auto | 電話 | `mrt_night` | 沒有圖（image:null） | 12 | （捷運上。你撥給她。響了兩聲。） |
| ev_y0_rp | 和可昕出門 | econ | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 1 | {flag:RP_TXT} |
| ev_y0_kh_bus | 成績公布 | econ | auto | 高雄・客運站附近的早餐店 | `undefined` | 換場景但沒有給背景（沒有 bg） | 16 | （早餐店。她點了兩份蛋餅，說今天要慶祝，先吃再說。） |
| ev_y0_kh_call | 電話 | econ | auto | 電話 | `phone_street_night` | 沒有圖（image:null） | 9 | （電話接通。她那邊很安靜。） |
| ev_y0_kh_madeup | 電話 | econ | auto | 電話 | `phone_street_night` | 沒有圖（image:null） | 6 | （十點半。手機響了。是她。） |
| ev_y0_e36r | 八月放榜 | econ | auto | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 3 | （八月十三日，早上十點。榜單公布了。） |
| ev_y0_e36 | 放榜的電話 | econ | auto | 電話 | `phone_street_night` | 沒有圖（image:null） | 22 | 這半年，你幾乎每天都在念書。 |
| ev_y0_gather | 經濟系的聚會 | econ | outing | 公館・桌遊店 | `boardgame_gg` | 沒有圖（image:null） | 9 | （六個人擠進一家桌遊店。一個人一小時五十元。） |
| ev_sis_results_dinner | 學姊上榜聚餐 | law | outing | 公館 | `undefined` | 換場景但沒有給背景（沒有 bg） | 3 | 一，謝謝大家。二，這次的題目，是我自己選的。三…… |
| ev_zhe_game_y2 | 系籃比賽（大二） | law | outing | 新體育館 | `undefined` | 換場景但沒有給背景（沒有 bg） | 14 | （系籃比賽。阿哲、明軒上場。） |
| ev_y2_xmas | 聖誕交換禮物（大二） | law | outing | 霖澤館一樓 | `undefined` | 換場景但沒有給背景（沒有 bg） | 10 | （阿哲和小語一起來。） |
| ev_kx_nye_video_y2 | 可昕的視訊（大二跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 4 | （十一點五十九分，手機響了。可昕打視訊來。） |
| ev_kx_nye_video_y3 | 可昕的視訊（大三跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 4 | （十一點五十九分，可昕打視訊來。） |
| ev_kx_nye_video_y4 | 可昕的視訊（大四跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 4 | （十一點五十九分，可昕打視訊來。） |
| ev_an_sis_meet_lawlib | 法學院圖書館，週三晚上 | law | sleep | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 16 | （週三晚上的法學院圖書館。長桌只剩一個位子，以安坐下，對面的人在看一本很 |
| ev_yt_nye_call_y4 | 語彤的電話（大四跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 5 | 新年快樂。 |
| ev_zr_nye_video_y3 | 芷若的視訊（大三跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 7 | 你那邊已經是早上了。 |
| ev_zr_nye_video_y4 | 芷若的視訊（大四跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 6 | 臺灣的年你跨完了。換我。 |
| ev_yt_nye_call_y2 | 語彤的電話（大二跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 7 | （零點過一分，手機響了。是語彤。） |
| ev_spring_y2_noodle | 春假・市場和海邊 | law | outing | 小鎮的市場 | `dark` | 背景代號不存在 | 6 | （市場在小鎮車站的後面。早上九點，攤販已經在收第一輪了。） |
| ev_kexin_trip_spring_y2 | 春假：開車旅行（大二） | law | outing | 車上 | `car` | 沒有圖（image:null） | 2 | 規則照去年。我管音樂，你管方向。 |
| ev_kexin_trip_spring_y2 | 春假：開車旅行（大二） | law | outing | 老街 | `trip_oldtown` | 沒有圖（image:null） | 1 | 第三家了。我們只是來看看的。 |
| ev_kexin_trip_spring_y2 | 春假：開車旅行（大二） | law | outing | 車上 | `car` | 沒有圖（image:null） | 4 | 今年我真的不睡。 |
| ev_kexin_trip_spring_y2 | 春假：開車旅行（大二） | law | outing | 車上 | `car` | 沒有圖（image:null） | 1 | 行程表我回去再補。寫『迷路』，一行就好。 |
| ev_final_game_y3 | 系籃冠軍賽 | law | outing | 新體育館・球場 | `dark` | 背景代號不存在 | 11 | （新體育館一樓的球場。看台坐滿了。） |
| ev_jp_suitcase | 行李箱 | law | outing | 公館 | `undefined` | 換場景但沒有給背景（沒有 bg） | 4 | （行李箱的店。她把每一個都推了一圈，聽輪子的聲音。） |
| ev_jp_office | 國際學生辦公室 | law | manual | 國際學生辦公室 | `undefined` | 換場景但沒有給背景（沒有 bg） | 3 | （國際學生辦公室。你們排在一列交換生的最後面。輪到你的時候，職員用很慢的 |
| ev_jp_kitchen | 共用廚房 | law | manual | 宿舍・共用廚房 | `undefined` | 換場景但沒有給背景（沒有 bg） | 8 | （宿舍的共用廚房。她把一袋菜放在流理台上，綁起頭髮。） |
| ev_jp_goldenweek | 黃金週 | law | manual | 河邊 | `undefined` | 換場景但沒有給背景（沒有 bg） | 4 | （河邊的草地上坐滿了野餐的人。你們找到一棵樹的影子，她拿出一本書。） |
| ev_jp_repair_river | 河邊 | law | manual | 河邊 | `undefined` | 換場景但沒有給背景（沒有 bg） | 4 | 那時候我很生氣，生氣到不想聽你講。 |
| ev_jp_tanabata | 七夕 | law | manual | 宿舍門口 | `undefined` | 換場景但沒有給背景（沒有 bg） | 6 | （宿舍門口立了一枝竹子，掛滿了短冊。） |
| ev_jp_tanabata_repair | 七夕 | law | manual | 宿舍門口 | `undefined` | 換場景但沒有給背景（沒有 bg） | 4 | （宿舍門口的竹子上掛滿了短冊。以安拿著一張，寫了很久。） |
| ev_jp_sea | 海之日 | law | manual | 海邊 | `undefined` | 換場景但沒有給背景（沒有 bg） | 3 | （你們搭了一個小時的電車。她在海邊脫了鞋，走到水剛好淹過腳踝的地方。） |
| ev_jp_lastnight | 最後一個晚上 | law | manual | 便利商店 | `undefined` | 換場景但沒有給背景（沒有 bg） | 6 | （宿舍附近的便利商店。和第一個晚上同一間。） |
| ev_jp_lastnight_alone | 最後一個晚上 | law | manual | 便利商店 | `undefined` | 換場景但沒有給背景（沒有 bg） | 1 | （最後一個晚上。你一個人去了便利商店。冷藏櫃的燈，和第一個晚上一樣亮。） |
| ev_jp_return_hall | 入境大廳 | law | manual | 桃園機場・入境大廳 | `undefined` | 換場景但沒有給背景（沒有 bg） | 5 | （自動門一打開，臺灣的熱氣撲過來。） |
| ev_kexin_qixi_y2 | 七夕 | law | manual | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 2 | （下午四點，一台舊舊的家用車停在旅館門口。她沒有下車，按了一下喇叭。） |
| ev_kexin_qixi_y2 | 七夕 | law | manual | 高雄・港邊的山上 | `dark` | 背景代號不存在 | 7 | （天黑以後，整個港口的燈都亮了。船慢慢開進來。） |
| ev_kexin_kh_missed_call | 電話 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 5 | （電話。她那邊很吵，是車站的廣播。） |
| ev_kexin_lecture_ntu | 她來台大聽講座 | law | outing | 博雅教學館 | `dark` | 背景代號不存在 | 7 | （博雅的大教室。講座的題目是「平台、新創與新的規則」。可昕坐第三排，筆記 |
| ev_typhoon_y3_family | 照常的讀書會 | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 6 | （七點整，線上讀書室只有兩格。兩格的鏡頭都關著。） |
| ev_kexin_call_helper | 電話 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 9 | （電話。她那邊很安靜，像是在宿舍的走廊。） |
| ev_kexin_call_helper2 | 電話 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 8 | （電話。） |
| ev_crimpro_court_visit | 旁聽作業 | law | outing | 地方法院 | `dark` | 背景代號不存在 | 11 | （法院的走廊很長，椅子上坐滿了等開庭的人。有一個阿姨一直在看手上的通知單 |
| ev_kexin_kn_call_y3 | 電話 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 3 | （電話。她那邊的電視開得很大聲。） |
| ev_kexin_k18_call | 可昕 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 5 | （電話。她那邊有車子經過的聲音。） |
| ev_yu_alone_call | 小語 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 13 | 欸，我在練習。今天早上一個人吃早餐。 |
| ev_liheng_japan | 在日本遇到立衡 | law | outing | 大學城的河堤 | `jp_riverbank` | 背景代號不存在 | 10 | （河堤上一排櫻花，樹下鋪著藍色的塑膠布。有人叫了你的名字。） |
| ev_an_sakura_riverbank | 春天的河堤 | law | outing | 大學城的河堤 | `jp_riverbank` | 背景代號不存在 | 6 | （河堤的石階上，櫻花一直在掉。以安坐著讀書，旁邊放著字典和一個保溫杯。） |
| ev_kexin_birthday_y3 | 她的生日（大三） | law | outing | 公館 | `gongguan_cake` | 背景代號不存在 | 7 | （她把一片蛋糕舉到鏡頭前。） |
| ev_an_town_notice | 町公所的一張通知 | law | outing | 町公所門口 | `jp_town_hall` | 背景代號不存在 | 7 | 你看這張。寫的是『請協力』。沒有罰則。 |
| ev_an_town_notice_repair | 町公所的一張通知 | law | outing | 宿舍大廳 | `jp_dorm_lobby` | 背景代號不存在 | 8 | ……你看得懂這個字嗎？ |
| ev_kexin_k20_call | 可昕 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 9 | （電話。她那邊很安靜。） |
| ev_fangyt_tickets | 方奕廷 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 10 | （電話。他那邊有風的聲音，像是在陽台。） |
| ev_an_notebook | 理由欄 | law | outing | 兩點半 Café・窗邊 | `cafe_window` | 背景代號不存在 | 2 | （從包包拿出一本日本的手帳）給你。 |
| ev_zhiruo_twelve_slips | 十二張點單 | law | outing | 兩點半 Café（店休） | `cafe_closed` | 背景代號不存在 | 14 | （開門）你敲了四下。……算了，進來。 |
| ev_us3_lake | 感恩節的湖邊 | law | outing | 湖邊 | `us_lake` | 背景代號不存在 | 13 | 上次在芝加哥，我把行程表摺起來了。這次乾脆不寫。 |
| ev_us_first_snow | 初雪 | law | outing | 小教堂前的台階 | `us_chapel_steps` | 背景代號不存在 | 16 | （你還是去了。雪下得很小，她坐在台階最上面一階。） |
| ev_us_snow_repair | 初雪 | law | outing | 小教堂前的台階 | `us_chapel_steps` | 背景代號不存在 | 5 | （下雪了。學姊坐在小教堂前面的台階上，沒有撐傘。） |
| ev_us_club_dinner | 會所晚餐 | law | outing | 會所・交誼廳 | `us_club_lounge` | 背景代號不存在 | 10 | （會所的交誼廳，兩張長桌併在一起。每個人帶來的菜擺成一排，有一半是泡麵做 |
| ev_sf2 | 霧裡的大橋 | law | manual | CG | `cg_sf_bridge_fog_heroine05` | CG 沒登記 | 1 |  |
| ev_sf_photo17 | 舊金山 | law | manual | 舊金山 | `false` | 換場景但沒有給背景（bg:false） | 2 | 📷（旅館窗外的坡道和叮噹車的電纜） |
| ev_sf_photo19 | 舊金山 | law | manual | 舊金山 | `false` | 換場景但沒有給背景（bg:false） | 2 | 📷（碼頭邊的一碗蛤蜊湯（麵包碗）） |
| ev_sf_photo21 | 舊金山 | law | manual | 舊金山 | `false` | 換場景但沒有給背景（bg:false） | 2 | 📷（郵筒前，她手上一張明信片（字看不到）） |
| ev_push_interview | 推甄面試 | law | manual | 萬才館二樓 | `dark` | 背景代號不存在 | 1 | （十五分鐘。最後一題是：你為什麼想研究這個？） |
| ev_kexin_intern_result | 放榜那一天 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 10 | 結果出來了吧。你先說。 |
| ev_kexin_xmas_y4 | 聖誕，讀到打烊 | law | outing | 政大山下・咖啡店 | `dark` | 背景代號不存在 | 2 | 你的時差還沒調回來吧。……那今天讀到打烊，剛好。 |
| ev_kexin_trip_winter_y4 | 最後一個寒假的旅行 | law | outing | 高雄・左營站 | `dark` | 背景代號不存在 | 2 | （她靠在一台舊舊的家用車旁邊。） |
| ev_kexin_trip_winter_y4 | 最後一個寒假的旅行 | law | outing | 高雄・海邊 | `trip_sea` | 沒有圖（image:null） | 5 | 到了。今天你說要做什麼，就做什麼。 |
| ev_kexin_trip_winter_y4 | 最後一個寒假的旅行 | law | outing | 高雄・左營站 | `dark` | 背景代號不存在 | 1 | 回去讀書。……二月十四號，視訊。 |
| ev_kexin_lunar_eve_y4_call | 除夕的電話 | law | outing | 電話 | `phone_street_night` | 沒有圖（image:null） | 3 | （鞭炮聲。） |
| ev_grad_exam | 研究所筆試 | law | manual | 考場 | `dark` | 背景代號不存在 | 1 | （兩節。第二節最後一題，你寫到鐘響。） |
| ev_spring_y4 | 春假・宜蘭 | law | outing | 宜蘭・民宿 | `dark` | 背景代號不存在 | 7 | （民宿的老闆送了一大盤水果。大家坐在榻榻米上，有人說要講大一的事。） |
| ev_kexin_trip_spring_y4 | 春假：開車旅行（大四） | law | outing | 車上 | `car` | 沒有圖（image:null） | 2 | 沒有行程表。音樂我管，方向你管。 |
| ev_kexin_trip_spring_y4 | 春假：開車旅行（大四） | law | outing | 老街 | `trip_oldtown` | 沒有圖（image:null） | 1 | 第三家了。我們只是來看看的。 |
| ev_kexin_trip_spring_y4 | 春假：開車旅行（大四） | law | outing | 車上 | `car` | 沒有圖（image:null） | 4 | （回程她沒有睡。過了收費站，她把音樂關小。） |
| ev_kexin_trip_spring_y4 | 春假：開車旅行（大四） | law | outing | 車上 | `car` | 沒有圖（image:null） | 1 | 行程表我回去再補。寫『迷路』，一行就好。 |
| ev_peishan_open_class | 公開課 | law | outing | 台南車站 | `dark` | 背景代號不存在 | 1 | （台南車站。你照她傳的地址，搭公車到課輔班。她已經在上課了。） |
| ev_last_game_y4 | 系籃最後一場 | law | outing | 新體育館・球場 | `dark` | 背景代號不存在 | 7 | （新體育館。阿哲在場邊綁鞋帶，綁了三次。） |
| ev_concert_y4 | 吉他社成發 | law | outing | 萬才館大廳 | `dark` | 背景代號不存在 | 5 | （小語拿著流程表跑來跑去。） |
| ev_zhiruo_back_cafe | 一年 | law | outing | 兩點半 Café（打烊以後） | `dark` | 背景代號不存在 | 2 | （她做了一杯熱拿鐵，不加糖。杯子上用麥克筆寫著：「熱拿鐵・不加糖」。下面 |
| ev_us_canyon | 秋假：大峽谷 | law | outing | 亞利桑那 | `dark` | 背景代號不存在 | 5 | （她靠在租來的車旁邊，手上拿著一張列印的地圖。） |
| ev_us_canyon | 秋假：大峽谷 | law | outing | 峽谷 | `dark` | 背景代號不存在 | 8 | （太陽慢慢沉到峽谷另一邊。風很大，她把外套拉鍊拉到最上面。） |
| ev_sis_canyon | 秋假：大峽谷 | law | outing | 亞利桑那 | `dark` | 背景代號不存在 | 5 | （她靠在租來的車旁邊，手上拿著一張列印的地圖。） |
| ev_sis_canyon | 秋假：大峽谷 | law | outing | 峽谷 | `dark` | 背景代號不存在 | 6 | （太陽慢慢沉到峽谷另一邊。風很大，她把外套拉鍊拉到最上面。） |
| ev_sis_canyon | 秋假：大峽谷 | law | outing | 鳳凰城的機場 | `dark` | 背景代號不存在 | 1 | 十二月二十三號，晚上八點落地。你來接我。 |
| ev_sis_plan_us | 讀書計畫 | law | outing | 會所・自習室 | `dark` | 背景代號不存在 | 5 | （會所的自習室。她把你的讀書計畫從頭看到尾。） |
| ev_long_bbq | 會所自習室 | law | outing | 會所・自習室 | `dark` | 背景代號不存在 | 14 | （公布欄貼著一張單子：週五晚上，國際學生會的秋假前聚餐。） |
| ev_usl_lake1 | 湖邊 | law | outing | 湖邊 | `us_lake` | 背景代號不存在 | 10 | （湖邊有人在遛狗。太陽還很高，八點多才會下山。） |
| ev_usl_lake_solo | 湖邊 | law | manual | 湖邊 | `us_lake` | 背景代號不存在 | 1 | （湖邊有人在遛狗。太陽還很高。你一個人走了一圈。） |
| ev_usl_long3 | 會所自習室 | law | outing | 會所自習室 | `us_club_study` | 背景代號不存在 | 14 | （公布欄貼著一張單子：週五晚上，國際學生會的秋假前聚餐。） |
| ev_usl_bbq | 勞動節 | law | manual | 會所 | `us_club_lawn` | 背景代號不存在 | 9 | （會所後面的草地，兩台烤肉架。美國人排隊拿漢堡，每個人都說了一次「Hap |
| ev_usl_thanks | 感恩節的晚餐 | law | outing | C 棟 208 | `us_shared_kitchen` | 背景代號不存在 | 7 | （C 棟 208 的廚房只開了一盞燈。她用帶來的小鍋子煮了一鍋湯，旁邊是 |
| ev_usl_thanks_long | 感恩節 | law | outing | 會所 | `us_club_lounge` | 背景代號不存在 | 2 | （會所的自動販賣機只剩熱可可。何俊朗按了兩次，一杯推給你。） |

## 3. 不是黑畫面、但地點不對（出遊事件開頭用 3D 模糊底：看到的是玩家出發的地方）

| 事件 | 標題 | 路線 | 底色 | 第一句 |
|---|---|---|---|---|
| ev_zhe_court_y2 | 籃球場 | law | ntu_court_night | （籃球場，一個人投籃）教授說，期末再沒過，我就要重修。 |

## 4. 使用者實玩回報（工具抓不到：有背景圖，但不是那個地方）

| 回報 | 事件 | 現在的背景 | 要補的圖 |
|---|---|---|---|
| 2026-10-18 14:2x「桌遊也沒畫面」 | ev_y0_gather（10/15 經濟系的聚會：桌遊 19:00～22:00 → 夜市） | `gongguan`（公館街景）整段共用 | 公館的桌遊店室內（六個人一桌、桌上有牌）；之後夜市那段要不要另一張，問使用者 |
| 2026-10-18 14:1x「烤肉沒接到cg」 | ev_y0_e08（9/21 中秋系烤） | `riverside`＋沒有 CG | CG-ECON-BBQ-1018（提示詞已給使用者） |
