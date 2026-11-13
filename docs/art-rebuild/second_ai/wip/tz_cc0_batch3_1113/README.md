# 印得好 P2、越好吃 P2、安泰藥局 CC0 v1、東南大聯 v2.2（SHOP-REALISM-1112；LAWWW2-C 2026-11-13）

## 印得好 P2（BB_379）
- **封面樣品原本是薄薄的純色板** → 改成 6 mm 厚的封面板，正面貼自畫封面，共五款：
  - 精裝論文（燙金框、校徽、燙金假字）
  - 牛皮紙線圈（白標籤）
  - 紅色相片框
  - 深灰斜條紋
  - 米色小花
- **天花板雲斑** → 灰泥 vary 0.04→0.015。
- 65,108 面（v2 已經是這個量級，這次只多封面幾十面）。

## 越好吃 P2（BB：燈籠近看有稜角、天花板雲斑）
- 燈籠絲布從 16 邊改成 20 邊，加平滑法線（材質名 silk_* 的網格才平滑，其他不變）；流蘇 9 條改成 7 條。
- 天花板 vary 0.015→0.008。
- 落地盆栽減面再多一點。
- 59,734 面（中型店上限 6 萬）。

## 安泰藥局 CC0 v1（gg_antai_interior；參考圖 int_antai）
- **自畫藥局包裝貼圖集**（不寫字、不像任何牌子，D77），四列：
  - 藥盒：白底、色帶、膠囊或藥丸圖
  - 口罩盒：口罩圖
  - OK 繃、藥膏小盒
  - 瓶子標籤
- 貨架上每一盒的正面都印刷。雙面貨架兩邊都看得到，所以兩面都印；藥瓶前後也都印標籤。
- 乳液瓶有一半加了壓頭。
- **材質組**：
  - 白色貨架、櫃台、藥品櫃 → Plastic006 白
  - 深綠踢腳 → Plastic006 綠
  - 不鏽鋼 → Metal009
  - 相框 → 木頭
- **Poly Haven 模型**：
  - 血壓計桌前的圓凳 → metal_stool_02（黑鐵座面、不鏽鋼腳）
  - 門口盆栽 → potted_plant_01
  - 櫃台上的綠蘿 → potted_plant_02（參考圖有）
- **光照烘焙**：`bake_tz_shops.sh antai`，新的 case：
  - 八組日光燈，兩側各補一盞光
  - 模型名稱照遊戲用的 gg_antai_interior
- 50,196 面。

## 東南大聯 v2.2（BB：零食袋正面斜看都還是方盒）
照 BB 的建議改：
- **零食袋改成枕頭形**：正面印刷的那一面中間鼓起來（2×3 格往外推）、背面也鼓，上下各一條 1.2 cm 的壓邊封口；厚度 4.2 cm。
- **有的歪倒靠著**：貨架上每一包往後斜 0～0.22 弧度（大約 0～13 度），不再一排站得筆直。
- **門口加一架鐵網籃**（概念圖門口那種）：取代原本左前角那一疊藍色塑膠籃。四層斜的鐵絲籃，袋子平躺在斜的籃底上，左右轉一點、疊兩三包。
- 吊掛的零食條也改成枕頭形的袋子。
- 印刷面那個網格合併頂點、加平滑法線，鼓起來的地方才有明暗。
- 79,158 面（大店上限 8 萬；杯麵雙層的機率 0.1、吊條 3～5 串）。
- 沒有新的素材：袋子、鐵網籃都是程式做的，鐵絲用已經登記的 Metal009。

## 檔案、測試
- 模型：
  - `tz_dongnan_interior`、`tz_yindehao_interior`、`tz_yuehaochi_interior`、`gg_antai_interior`
  - 每一間都有 .glb、.json、_lm_day.webp、_lm_night.webp，加上 lightbake/…_lm.json
  - 安泰的光照貼圖三個檔是新增的
- 程式：
  - `tools/blender/env_second/tz_shops_interior.py`：四間的 CC0 改法
  - `tools/blender/env_second/lightbake/bake_tz_shops.sh`：新增 antai case
- `LICENSES.md`：安泰的 Poly Haven 模型三列（metal_stool_02、potted_plant_01、potted_plant_02），材質三列（Plastic006、Metal009、Plaster001）。
- `tests/shop_cc0_baseline.json`：拿掉 gg_antai_interior（三項已經同時成立，只減不加）。
- 測試在開發分支 83039da726 上套用以後跑的：
  - shop_cc0_unit：四間都 PASS
  - tz_*、gg_*、shop_* 各支：全部通過
  - place_gate_unit 只剩「狀態表過期」，要 LAWWW 跑 `--write`
- 並排圖：
  - cmp_dongnan_v22.jpg
  - cmp_antai_v1.jpg
  - cmp_yuehaochi_p2.jpg
  - close_antai_yindehao.jpg（安泰、印得好近看）
- 套用：`git apply --binary tz_cc0_batch3.patch`（底＝83039da726）。
