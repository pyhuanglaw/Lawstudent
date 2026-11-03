# 宿舍 203 書桌小物 第二版（DORM-DESK-ITEMS-3D-1103，BB 11-03 14:03 退回四點）——READY_FOR_ART_REVIEW

GLB／json／腳本在 `claude/second-ai-env-art`：`assets/models/env/second_ai/dorm_desk_items.glb`（524 三角形、2 材質、約 135 KB）、`dorm_desk_items.json`、`tools/blender/env_second/dorm_desk_items.py`、圖集 `tools/blender/env_second/textures/gen/dorm_desk_print.png`。
程式 patch：`dorm_desk_items_v2_1103.patch`（接在開發分支 **81f195b1a**，`git apply --check` 過）：`src/story3d.js`（`S.roomItemKeyOf`、`S.roomItemFocus`、roomItems 選了那一項就轉鏡頭）＋`tests/dorm_desk_items_unit.js`（多 6 項）。

| BB 的點 | 改了什麼 | 圖 |
|---|---|---|
| 1. 筆記本認不出來（紅色方塊像空盒子） | 紅色方塊其實是書桌左端的「六法」（dorm_room4，不動）；筆記本原本只是書桌右端一張 0.16 m 的白紙。改成攤開的 B5 筆記本（0.30×0.22 m）：深藍封面四周露出、兩疊書頁看得到厚度、中間裝訂縫、右頁擱一支筆；左頁你的字（藍筆、粗、歪、箭頭）、右頁她的字（黑筆、工整、螢光筆底、紅筆圈重點） | `menu_03_notebook.jpg`、`after_notebook_close.jpg`、`v1_v2_same_camera.jpg` 第 1、2 列 |
| 2. 評鑑表標題被圖釘蓋住、軟木板被層架擋住 | 圖釘改釘上面兩個角；軟木板整塊搬到層架頂（1.42 m）上面、床板（約 1.70 m）下面——y 1.445～1.69（原本 1.285～1.555，下半截在層架旁邊）。z 照舊在層架和衣櫃中間（往衣櫃那邊已經貼到衣櫃了） | `menu_07_kai_sheet.jpg`、`after_board_from_desk.jpg`、`v1_v2_same_camera.jpg` 第 3 列 |
| 3. 最後一張全灰 | 拿掉；這次每一張都重拍檢查過 | — |
| 4. 選單每一項附遊戲畫面 | 走真的選單（按「看看房間裡的東西」→ 點每一項），旁白出現時截圖。**原本選了以後鏡頭不動**（跟在玩家背後、朝門口，書桌在畫面左邊邊緣，東西幾乎看不到）——所以加了：選了那一項鏡頭轉去看那件東西（`E.cinematic`，約 2 秒轉過去），旁白講完回到原本的鏡頭。鏡頭位置寫在 GLB 每一件的 extras（eye／look），離東西 0.4～0.9 m | `menu_00_menu.jpg`～`menu_09_trip_sea.jpg` |

- 選單截圖用的存檔：大一 203、14:00、XMAS_HL3、KX_TRIP.Y1S2=sea、KX_ANNIV went（電影票根要另外的旗標，這次沒拍；鏡頭資料一樣有，`film1`／`film3` 正對牆）。
- 「她的週年卡片」選了以後會接著問「翻後面幾頁／不看了」（rom1016），所以「旅行的照片」是另外開一次選單拍的。
- 測試（81f195b1a＋patch＋新 GLB）：`dorm_desk_items_unit` 20 項 ALL PASS（新：每一件都有鏡頭、鏡頭離東西 1 m 以內、鏡頭不在床板裡、roomItemFocus 轉換座標、沒顯示的不轉、系外套不轉）；`bb120_fixed_unit`、`aa387_zr_last_unit`、`dorm_y2_items_unit`、`rom1016_unit` ALL PASS。瀏覽器：Playwright＋SwiftShader（桌機 960×540），不是手機實機；console 沒有錯誤。
- 還沒做／已知：鏡頭轉過去的時候會穿過上舖的梯子或床欄一下（`E.cinematic` 是直線內插，沒有避開東西）；大二以後的房間不動。
