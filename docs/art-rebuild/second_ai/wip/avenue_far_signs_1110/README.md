# AVENUE-FAR-SIGNS-1110：椰影大道遠景都是補習班（X285）

- 使用者 11-10 02:0x 對 LAWWW-B 說：「椰林大道遠景怎麼都是文理補習班」。截圖：`docs/handoff/user_shots/1110_avenue_far_cram.webp`（開發分支）。
- 狀態：`READY_FOR_REVIEW`。LAWWW2 帳號 A，11-10。

## 原因
- 校門外的遠景（`campus_gongguan_bd.glb`）和公館區域的遠景（`gongguan_far.glb`）上的大看板，貼圖都來自 `gg_textures.py` 的 `BILLBOARDS`（8 張）。
- 8 張裡有兩張補習班：粉紅的「明日文理補習班」、「公職補習」。
- `gg_backdrop.py` 每一棟樓用 `rr.randrange(8)` 挑，第 0 格（明日文理）被挑到的次數特別多。所以校門外整排都是粉紅的補習班。

## 改法
- `gg_textures.py`：
  - 「明日文理補習班」換成「穗豐銀行」，「公職補習」換成「老灶熱炒」。店名都是原創，不用諧音（D77）。
  - 直立燈箱的「補習」換成「咖啡」。
  - 補習類只留「晴川美語」一家，另外還有「遠帆留學」代辦。
- `gg_backdrop.py` 新增 `_bb()`：
  - 照舊呼叫一次 `randrange(8)`，所以其他亂數、樓的長相、窗、冷氣都不變。
  - 但不用那個亂數的結果，改照固定順序 0,3,6,1,4,7,2,5 輪流掛。相鄰的樓一定不同，8 棟裡每張各一次。
  - 第一版只做「相鄰不重複」，結果「穗豐銀行」在同一個畫面還是出現三次，所以改成輪流。
- 重匯兩顆 GLB。三角形、網格都和原本一樣（15,194／16,336），只有招牌貼圖 `gg_bd_signs.png` 換了。

## 測試
- 新測試 `tests/avenue_far_signs_unit.js`，不需要瀏覽器：
  - 開發分支版本：FAILED 4（還有補習、教育類太多、直接用亂數、沒有輪流）。
  - 改後：ALL PASS。
- 沒有其他測試讀這兩顆 GLB（grep 過）。

## 對照
- `far_signs_before_after.jpg`：Blender 渲染，不是遊戲截圖。上排是從校門往西看，下排是斜看整排；左邊改前、右邊改後。
- 遊戲裡要請 CC 照使用者截圖的位置拍：椰影大道往校門方向、晚上 18:4x。

## 接法
換這幾個檔就好，程式不用改：

| 檔案 | sha256 前 16 碼 |
|---|---|
| assets/models/env/second_ai/campus_gongguan_bd.glb | 2f0fc28b69500494 |
| assets/models/env/second_ai/campus_gongguan_bd.json | 52d0fcb18b295ac1 |
| assets/models/env/second_ai/gongguan_far.glb | cafcee9ffbd4b62e |
| assets/models/env/second_ai/gongguan_far.json | f3f19b743dac2033 |
| tests/avenue_far_signs_unit.js（新） | 987966265e62c6cd |

腳本 `tools/blender/env_second/gg_textures.py`、`gg_backdrop.py`，以及招牌貼圖 `textures/gen/gg_bd_signs.png`，都在 LAWWW2 的分支上。

## 還差的
- 招牌的小字只用肉眼在渲染圖看過，遊戲裡的距離要看 CC 的截圖。
