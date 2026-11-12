# 宿舍 203 祐廷書桌：「看東西」選單上的東西都看得到（DORM-DESK-ITEMS-3D-1103）——交件（READY_FOR_REVIEW）

- **起因**：使用者 11-03 附 203 書桌截圖：「不應該還有這些選項? 不然也是在書桌上?? 書桌牆面可以貼東西? 擺書」（USER_WANTS X191，LAWWW 派工）。
- **做法**：選單 `STORY.roomItemList(G)` 的標籤換成 key——`STORY.roomItemKeys(G)`（story3d.js，新增）；3D 照 key 開關（zones3d.js `loadDeskItems`，照 `loadWzItems` 的做法）。選單和 3D 永遠是同一份條件，不另外寫一套。
- **模型**：`tools/blender/env_second/dorm_desk_items.py` → `assets/models/env/second_ai/dorm_desk_items.glb`（420 三角形、2 材質、115 KB；印刷品本作 PIL 畫的，貼圖集 2048×1024，沒有店名、商標、真實片名）。

| key（選單標籤） | 房間裡的樣子 | 什麼時候 |
|---|---|---|
| civil（書架上的舊《民法》） | 書架上那本咖啡色的書背燙金「民法」 | 大一 203 |
| econ（經濟學原理） | 白底紅帶那本書背「經濟學原理　第八版」 | 大一 203 |
| notebook（寫滿的筆記本） | 書桌左前那本攤開的筆記本寫滿：左頁藍筆歪字、右頁黑筆工整＋螢光筆（一半是你的字、一半是她的） | 大一 203 |
| ferris（摩天輪的票根（夾在桌墊下）） | 透明桌墊＋右前角壓著的摩天輪票根 | 大一 203（大二起照舊用 dorm_y2_items 軟木板上那張） |
| phone（手機相簿的一張照片） | 書桌右前面朝上的手機，螢幕是河堤邊的腳踏車 | 每一年 |
| highlighters（桌上的三色螢光筆） | 黃、粉紅、藍三支（綠的那支 ITEM_green 在旁邊） | XMAS_HL3 |
| board＋kai_sheet（阿凱的泡麵評鑑表） | 層架右側和衣櫃中間那條牆的小軟木板，釘著評鑑表（六種口味、星星） | 大一 203、阿凱同房 |
| film1／film3（電影票根／三張連號的票根） | 同一條牆、紙膠帶貼著 | 大一 203 |
| trip_sea／oldtown／stars（旅行的照片） | 同一條牆的白邊相片（照 KX_TRIP.Y1S2） | 大一 203 |
| anniv（她的週年卡片） | 立在層架頂上 | 大一 203、KX_ANNIV 去了 |
| jacket（舊序章的系外套） | 照舊 dorm_room4 的 JACKET_（這次不動） | ECON_JACKET |

- **位置**：每一件都避開 dorm_room4（Y203／Y312／Y507／Y409_YUTING）、dorm_y1～y3_items、dorm_wz_items、法服社傳單（書桌前那面牆整面 0.42×0.6，所以軟木板不放那裡）；溫州街讀書會白板照片（y 1.15～1.26）那一段也空出來。
- **patch**：`dorm_desk_items_1103.patch`（接在開發分支 `0f16f98a3`，`git apply --check` 過）：assets3d.js 一行 manifest、story3d.js 的 `S.roomItemKeys`、zones3d.js 的 `loadDeskItems`（宿舍區域非舊序章才載）、新測試 `tests/dorm_desk_items_unit.js`。GLB、json 從本分支拿。
- **測試（雲端）**：`dorm_desk_items_unit` 14 項 ALL PASS（旗標開關：螢光筆、旅行照片三種、週年卡片去了／沒去、一張／三張票根、系外套、阿凱同房；全開的存檔每一個有 3D 的選單標籤都有 key、每一個 key 都有節點）；宿舍相關 Node 單元測試 ALL PASS。瀏覽器 flow 測試沒跑（只加看得到的東西，不擋導航、不改座位）。實機沒測。
- **截圖**：`before_after_desk.jpg`（左改前、右改後：書桌全景、書架、桌面、書架近）、`after_strip_shelf_close.jpg`（評鑑表軟木板、層架頂的卡片）。
- **還沒做／已知**：大二以後的房間，書背、筆記本的字照 yuting_y 的擺法沒有做（那幾年書的位置不同）；其他房間（412 舊序章）不動。
