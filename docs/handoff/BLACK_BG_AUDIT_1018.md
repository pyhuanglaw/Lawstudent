# 黑畫面盤點（tools/story/black_bg_audit.js 自動產生）

> 產生：2026-10-18T14:36Z；範圍：全部的 STORY_EVENTS＋重考期在家。玩家看到深色底（沒有圖）的段落 31 段、共 218 句。
> 依「背景代號」分組：同一個代號補一張圖，就補好那一組的全部段落。電話（「電話」場景）深色底可能是故意的，BB 和使用者決定要不要補。

## 1. 要補的圖（依影響句數排）

| 背景代號 | 原因 | 地點 | 用到的事件 | 句數 |
|---|---|---|---|---|
| `dark` | 事件底色 dark、還沒換背景 | （事件開頭） | ev_va09_lunch、ev_yt_nye_call_y1、ev_y0_e21o、ev_y0_e26、ev_y0_rp、ev_y0_e36r、ev_kx_nye_video_y2、ev_kx_nye_video_y3、ev_kx_nye_video_y4、ev_yt_nye_call_y4、ev_zr_nye_video_y3、ev_zr_nye_video_y4、ev_yt_nye_call_y2 | 59 |
| `undefined` | 換場景但沒有給背景（沒有 bg） | 公館・巷子裡的簡餐店、溫學姊的房間、資工系館・走廊、公館、新體育館、霖澤館一樓 | ev_sis_fam_dinner、ev_sis_c2_room、ev_zq_ask_kai、ev_sis_results_dinner、ev_zhe_game_y2、ev_y2_xmas | 45 |
| `phone_street_night` | 檔案不在：assets/bg/phone_street_night.webp | 電話 | ev_y0_fight、ev_y0_kh_call、ev_y0_kh_madeup、ev_y0_e36 | 44 |
| `cram_counter` | 檔案不在：assets/bg/cram_counter.webp | 以前的補習班 | ev_y0_e27b | 24 |
| `mrt_night` | 檔案不在：assets/bg/mrt_night.webp | 電話 | ev_y0_e30 | 12 |
| `seaside_town` | 沒有圖（image:null） | 春假・海邊的小鎮 | ev_noodle_trip_spring_y1 | 9 |
| `boardgame_gg` | 檔案不在：assets/bg/boardgame_gg.webp | 公館・桌遊店 | ev_y0_gather | 9 |
| `trip_sea` | 沒有圖（image:null） | 海邊 | ev_kexin_trip_spring_y1 | 6 |
| `car` | 沒有圖（image:null） | 車上 | ev_kexin_trip_spring_y1 | 5 |
| `trip_oldtown` | 沒有圖（image:null） | 老街 | ev_kexin_trip_spring_y1 | 5 |

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
| ev_y0_fight | 電話 | econ | auto | 電話 | `phone_street_night` | 檔案不在：assets/bg/phone_street_night.webp | 7 | 我明天早上九點有小考。你剛剛傳了三則貓的影片。 |
| ev_y0_e21o | 除夕的電話 | econ | auto | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 6 | （電話。很吵。） |
| ev_y0_e26 | 車上 | econ | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 1 | （你到家，拿了家裡的車鑰匙。） |
| ev_y0_e27b | 一起去問補習班 | econ | outing | 以前的補習班 | `cram_counter` | 檔案不在：assets/bg/cram_counter.webp | 24 | （同一個櫃台。上次那個工作人員認得你。） |
| ev_y0_e30 | 辦休學的那天 | econ | Y0S1 auto | 電話 | `mrt_night` | 檔案不在：assets/bg/mrt_night.webp | 12 | （捷運上。你撥給她。響了兩聲。） |
| ev_y0_rp | 和可昕出門 | econ | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 1 | {flag:RP_TXT} |
| ev_y0_kh_call | 電話 | econ | auto | 電話 | `phone_street_night` | 檔案不在：assets/bg/phone_street_night.webp | 9 | （電話接通。她那邊很安靜。） |
| ev_y0_kh_madeup | 電話 | econ | auto | 電話 | `phone_street_night` | 檔案不在：assets/bg/phone_street_night.webp | 6 | （十點半。手機響了。是她。） |
| ev_y0_e36r | 八月放榜 | econ | auto | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 3 | （八月十三日，早上十點。榜單公布了。） |
| ev_y0_e36 | 放榜的電話 | econ | auto | 電話 | `phone_street_night` | 檔案不在：assets/bg/phone_street_night.webp | 22 | 這半年，你幾乎每天都在念書。 |
| ev_y0_gather | 經濟系的聚會 | econ | outing | 公館・桌遊店 | `boardgame_gg` | 檔案不在：assets/bg/boardgame_gg.webp | 9 | （六個人擠進一家桌遊店。一個人一小時五十元。） |
| ev_sis_results_dinner | 學姊上榜聚餐 | law | outing | 公館 | `undefined` | 換場景但沒有給背景（沒有 bg） | 3 | 一，謝謝大家。二，這次的題目，是我自己選的。三…… |
| ev_zhe_game_y2 | 系籃比賽（大二） | law | outing | 新體育館 | `undefined` | 換場景但沒有給背景（沒有 bg） | 14 | （系籃比賽。阿哲、明軒上場。） |
| ev_y2_xmas | 聖誕交換禮物（大二） | law | outing | 霖澤館一樓 | `undefined` | 換場景但沒有給背景（沒有 bg） | 10 | （阿哲和小語一起來。） |
| ev_kx_nye_video_y2 | 可昕的視訊（大二跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 4 | （十一點五十九分，手機響了。可昕打視訊來。） |
| ev_kx_nye_video_y3 | 可昕的視訊（大三跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 4 | （十一點五十九分，可昕打視訊來。） |
| ev_kx_nye_video_y4 | 可昕的視訊（大四跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 4 | （十一點五十九分，可昕打視訊來。） |
| ev_yt_nye_call_y4 | 語彤的電話（大四跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 5 | 新年快樂。 |
| ev_zr_nye_video_y3 | 芷若的視訊（大三跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 7 | 你那邊已經是早上了。 |
| ev_zr_nye_video_y4 | 芷若的視訊（大四跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 6 | 臺灣的年你跨完了。換我。 |
| ev_yt_nye_call_y2 | 語彤的電話（大二跨年） | law | outing | （事件開頭） | `dark` | 事件底色 dark、還沒換背景 | 7 | （零點過一分，手機響了。是語彤。） |

## 3. 不是黑畫面、但地點不對（出遊事件開頭用 3D 模糊底：看到的是玩家出發的地方）

| 事件 | 標題 | 路線 | 底色 | 第一句 |
|---|---|---|---|---|
| ev_zhe_court_y2 | 籃球場 | law | ntu_court_night | （籃球場，一個人投籃）教授說，期末再沒過，我就要重修。 |

## 4. 使用者實玩回報（工具抓不到：有背景圖，但不是那個地方）

| 回報 | 事件 | 現在的背景 | 要補的圖 |
|---|---|---|---|
| 2026-10-18 14:2x「桌遊也沒畫面」 | ev_y0_gather（10/15 經濟系的聚會：桌遊 19:00～22:00 → 夜市） | `gongguan`（公館街景）整段共用 | 公館的桌遊店室內（六個人一桌、桌上有牌）；之後夜市那段要不要另一張，問使用者 |
| 2026-10-18 14:1x「烤肉沒接到cg」 | ev_y0_e08（9/21 中秋系烤） | `riverside`＋沒有 CG | CG-ECON-BBQ-1018（提示詞已給使用者） |
