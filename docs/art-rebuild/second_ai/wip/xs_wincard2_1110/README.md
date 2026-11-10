# XS-WINCARD 第二批（新生南路：山蘭、X-Sports、南洋）— LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`（交 LAWWW 整合；遊戲截圖請 CC 在 PC 拍，D131）。

## 做了什麼
第一批（XS-WINCARD-1105）只有新生南路北段的店。這一批把**山蘭（一樓、二樓）、X-Sports（一樓、二樓）、南洋（一樓）**的正面玻璃也換成視差窗景（`Z3.shopViewPane`），從店裡往外看是新生南路對面的景色，不再是一片黑玻璃。

- 照片：Blender（Cycles）在遊戲的新生南路場景裡，站在每片玻璃的位置往外拍（鏡頭 18 mm＝90°、2:1）；白天、晚上各一張 → `assets/models/env/views/xs_*_{day,night}.webp`（1024×512，共 10 張，約 380 KB）。渲染腳本 `render.sh`。
- 程式：`src/shanlan3d.js`、`src/xsports3d.js`、`src/nanyang3d.js` 各加 `PANES`（並 export），正式模型接上後呼叫 `Z3.shopViewPane`。二樓那幾片的高度照二樓窗台。
- 統一館（tongxian）跳過：店在二樓、正面沒有玻璃，只有後窗。

照片總覽：`views_xs2_sheet.jpg`（左白天、右晚上）。二樓的山蘭窗外剛好是行道樹的樹冠，是正確的位置，不是錯誤。

## 測試
- 新測試 `tests/xs_wincard2_1110_unit.js`：
  - ① 片數、照片名字、照片檔在；
  - ②③ 每片在玻璃外面、面向店裡、中心＝照片拍的位置（±0.15 m）；
  - ④ 在 `z.wins`／`z.winParts`、換時段不出錯、照片設進材質、21:00 正面沒有顯示的夜景卡。
  - **開發分支 6e00d9103：FAILED 12**；套上這個 patch：**ALL PASS**。
- 回歸（新生南路相關、讀到這三間店的全部 31 項，沒有截斷）：全部通過，見 `regression.log`。
- 沒測：瀏覽器遊戲畫面（D131：請 CC 在 PC 拍店裡往外看的截圖，白天、21:00 各一張）。

## 整合
`git apply --binary xs_wincard2_1110.patch`（已確認可以套在開發分支 6e00d9103 上）。內容：3 個 src、1 個測試、10 張 webp。
