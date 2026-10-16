# 約會人物圖去背 v1（BB_128 2-3、BB_132 §1c；BB-B 2026-10-16 01:58Z 規格）｜LAWWW2-B

**狀態**：READY_FOR_ART_REVIEW（角色美術由 BB-B 驗收，D59）。

## 來源與輸出

- 來源：企劃線 `docs/story_planning/date_system/art/*_date_*.webp`，八張，使用者生成、BB 驗收過。
  - 不重畫、不換臉，原解析度不縮放。
  - 語彤用企劃線補過胸口小字的版本。
- 輸出：`assets/date/<character_id>/<pose>.webp`（透明 webp）＋`assets/date/anchors.json`。
- 腳本：`tools/portraits/cut_date_figures.py --src <原圖資料夾>`。

## 規格（照 BB-B）

- 姿勢代號：
  - 女主角：H1 站姿、H3 扶欄杆（或回頭背影）、H4 坐姿；
  - 祐廷：Y1、Y2、Y3。
- 留邊：頭頂留 4%、左右留 2%，腳底（坐姿是最低點）貼齊下緣。
- 頭像四張：head_neutral／head_smile／head_thinking／head_embarrassed，另外切，不貼回身體。
- `anchors.json` 的欄位（像素，以該張圖左上為原點）：
  - 每張都有：w、hpx、footX、footY（腳底中心）、h（頭頂到腳底）、crop（原圖的裁切範圍）。
  - H3／Y2 加 handY。沛珊、可昕的 H3 是回頭的背影：`rail:false`，**不給 handY**。
  - H4／Y3 加 seatY。

## seatY 的來源

自動估計會錯：子晴量到膝蓋、祐廷量到肩膀。所以改用**目視校正**。
- 目視值寫在 `seatY`，誤差約 ±20 px；
- 自動估計留在 `seatY_auto`；
- 請 BB-B 依各地點的 `*_coords.json` 再核。

| | 沛珊 | 以安 | 芷若 | 語彤 | 子晴 | 學姊 | 可昕 | 祐廷 |
|---|---|---|---|---|---|---|---|---|
| seatY | 540 | 565 | 565 | 395 | 520 | 480 | 515 | 535 |

## 去背做法

- **身體**：rembg u2net，加這幾步：
  - 邊緣接近背景色的拿掉；
  - 只留最大的一塊；
  - 半透明的邊去掉背景色。
- **頭像**：isnet-anime＋alpha matting。
  - u2net 會把頭髮、臉當背景：可昕 head_embarrassed 第一次切出來幾乎整張半透明。
  - 上面 55% 裡，「又亮又沒顏色、和外面連在一起」的光暈當背景。下面不做，因為白襯衫、淺色毛衣會被吃掉。

## 對照

- `d13_overlay_heroine01.webp`：疊在 D13 淡水底圖，照 `D13_coords.json` 的 C0～C4，再加八個人並排比身高。
  - 縮放照 BB_128：縮放 1.0 時身高(cm)×3.4 px；同一個人的各姿勢用他 H1（祐廷 Y1）的比例。
  - 線的意思：綠圈＝腳底點、黃線＝handY、藍線＝seatY、紅線＝地平線、藍色橫線＝對話框上緣。
- `heads_final.webp`：頭像在紅底、深色底上。
- `contact_all_v1.webp`：第一輪全部姿勢＋錨點。這一版之後頭像重切過、seatY 校正過。

## 已知的缺點

- 頭像：
  - 沛珊、以安的 neutral、smile 在脖子高度還有一點淺色毛邊（紅底上看得到）；
  - 學姊 head_thinking 的手旁邊有一小塊紅邊。
- D13 C3（長椅）：照 coords 的站位，兩人的座位線比長椅座面高 10～30 px，兩個人也疊在一起，要調 coords 的 x 或 gapByStage。
- D13 C1：照 coords，她站在長椅的互動框上。

## v1.1（2026-10-16，BB-B 驗收 3aeef829 要修的 8 張）

- **修了這幾張**：
  - 沛珊 H1、H3（頭髮外圍、脖子後面的灰白原底）；
  - 沛珊 head_neutral、head_smile（脖子兩側）；
  - 以安 head_neutral、head_smile（左邊脖子）；
  - 學姊 head_thinking（手的右邊）；
  - 順手：以安 H1、H3 頭髮邊緣的毛邊。
- **做法**：`cut_date_figures.py` 的 `FIX`，只對這幾張、只在指定的高度範圍做。
  1. 和背景色只差 12 以內的中性灰：直接當原底。
  2. 接近背景色的中性灰：連到外面、或四周是頭髮（暗），也當原底。
  3. 洞邊 2 px 重算半透明。
  - 學姊 thinking 不做第 1 步：她白襯衫的陰影和灰底一樣，會被挖洞。只做右半邊。
- **錨點**：以安的 h 用頭頂量，高馬尾不算。H1 980→**963**；H3 948→932、H4 838→823，同比例。原值留在 `h_auto`。
  - 這 9 張的 footY／hpx 也小改了 2～5 px：清掉的碎屑影響了外框。
- **對照**：
  - `fix_8_v2.webp`：修好的 9 張，深色底、紅底各一張；
  - `d13_overlay_heroine01_v2.webp`：照 BB-B `29d6b676` 的新 D13_coords 重疊。C1 站在攤車右端前；C3 是 bodies:false，只用頭像。

## v1.2（BB-B v1.1 驗收：7 張通過，學姊 head_thinking 還要修）

- **原因**：BB-B 看的 `fix_8_v2.webp`，是我把學姊 thinking 改成不挖襯衫之前產生的對照圖，所以它看到了襯衫上的洞。
  - v1.1 寫進 assets 的那張其實沒有大洞，但襯衫下緣還有一小塊半透明，約 60 px。
- **改法**：`FIX` 加 `solid_below=0.6`。
  - 襯衫內部（高度 60% 以下、離外緣 6 px 以上）的 alpha 一律補回 255；
  - 顏色用原圖的襯衫顏色，不再去背。
- 對照：`fix_h5_thinking_v12.webp`（深色底、紅底）。
