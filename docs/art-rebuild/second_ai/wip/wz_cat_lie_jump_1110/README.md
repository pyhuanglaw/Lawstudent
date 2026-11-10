# X186 橘貓：有骨架的趴姿、跳上／跳下圓椅接進遊戲（WZ-CAT-FLOAT-RUB-1103 的尾巴）— LAWWW2 帳號 A，2026-11-10

- 狀態：`READY_FOR_REVIEW`（程式），交 LAWWW 整合。以開發分支 437a9fe4d 為底。
- 遊戲畫面請 CC 錄（D131）：
  - 溫州街小公園 06:58～07:05 貓從圓椅跳下來；
  - 17:30～18:40 走回圓椅跳上去趴下；
  - 晚上趴著甩尾巴。

## 為什麼
- USER_WANTS X186 寫「趴著、跳上跳下還沒接」，tasks.json WZ-CAT-FLOAT-RUB-1103 的 next 寫「LAWWW2 補 cat_rub／cat_lie_idle／cat_jump」。
- 盤點（`user_wants_lawww2_audit_1110.md`）時查到：**動畫 11-03 已經做好**（LAWWW2 `f22ef5dcd`，wz_cat.glb 有 cat_lie_idle、cat_jump_down、cat_jump_up、cat_rub、cat_rub_r）。整合（`2aaa7d22b`）時只接了 cat_rub／cat_rub_r，其他三段 GLB 裡有、程式沒播。
- 這一包只改程式，不改模型。

## 改了什麼（`src/wzcat3d.js`）
GLB 有這幾個片段才走新的路；沒有（舊 GLB）一律照舊。
- **趴著**（有 cat_lie_idle）：
  - 睡的時候用走路那一隻（有骨架）放到趴的位置、播 cat_lie_idle：呼吸、甩尾尖、頭抖；
  - 不再換成沒有骨架的 CAT_lie＋整隻縮放的「呼吸」。
  - 圓椅、石桌底下都一樣；「摸摸」的互動點照舊。
- **早上從圓椅跳下來**（有 cat_jump_down）：
  - 在座面上轉向外（0.6 秒）→ 播 cat_jump_down（0.8 秒）→ 落在前方 0.35 m 的地上（片段的位移）→ 走到圓椅前 → 照原本的行程；
  - 跳的時候不把高度壓回地面、不被玩家推開。
- **傍晚跳上圓椅**（有 cat_jump_up）：
  - 走回圓椅前以後，再走到座面前 0.30 m → 轉向座面 → 播 cat_jump_up（往前 0.30、往上 0.45＝座面高）→ 落在趴的位置 → 接 cat_lie_idle、慢慢轉到趴的方向。
  - 石桌底下（下雨）照舊直接趴。
- **hold('lie')**（劇情要貓趴在圓椅上）：
  - 一樣用有骨架的趴姿；
  - release 時搬回 hold 前的位置，因為趴的是同一隻貓，不是另外一個模型。
- 數字的依據：
  - 座面頂 0.45（wzCatSpot 的 y 0.453）＝片段上下 0.45；
  - 落地點 (26.006, 0, 22.759)、跳上去的起點 (26.006, 22.709)，都在座面外緣 22.568 外面。

## 測試
- 新測試 `tests/wz_cat_lie_jump_unit.js`：真的溫州街區域，用 wz_cat_float_rub_unit 那個假 GLB，加上三個片段。
  - ① 晚上：走路那一隻趴在座面上（高度 0.453）、播 cat_lie_idle，沒有靜態 CAT_lie；
  - ② 早上：jturn → jdown（cat_jump_down、高度留在座面）→ 落在前方 0.35 m 的地上 → 走到圓椅前；
  - ③ 傍晚：prejump（座面前 0.30 m）→ jupturn → jup（cat_jump_up）→ 落在趴的位置、cat_lie_idle、轉到趴的方向；
  - ④ 白天 hold／release。
- 結果：**開發分支 437a9fe4d：FAILED 4**；套上 patch：**ALL PASS**。
- 舊 GLB（沒有三段）照舊：`wz_cat_float_rub_unit`、`wz_cat_unit`、`wz_cat_walk_unit`、`aa493_cat_lines_unit` 都 ALL PASS，沒改。
- 回歸：讀到 wzcat3d、WZCAT、wzpark3d、wz_cat、溫州街區域的 42 支，全部通過，見 `regression.log`。

## 沒驗證
- 瀏覽器畫面：
  - 跳的片段在真的骨架上看起來順不順；
  - 落地那一格換位置有沒有閃一下（片段結束時 body 骨頭位移和搬的距離一樣，理論上不會）；
  - 趴姿（獅身像）和原本 CAT_lie 的蜷法不一樣，BB 判。

## 整合
`git apply wz_cat_lie_jump_1110.patch`。內容：src/wzcat3d.js、新測試。
