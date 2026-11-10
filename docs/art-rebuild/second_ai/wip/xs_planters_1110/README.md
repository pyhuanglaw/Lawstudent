# XS-PLANTERS-1110：新生南路人行道花台（X246）— LAWWW2 帳號 A，2026-11-10

狀態：`MODEL_READY`，交 LAWWW 整合。遊戲截圖請 CC 拍（D131）。

## 為什麼做
- 使用者 11-05 要「新生南路側門改成我的照片的樣子」（USER_WANTS X246：人行道花台、紅磚、廣場…）。照片有著作權疑慮，沒進 repo。
- 已經有的、這次沒做的，差距表見 outbox：
  - 紅磚人行道和側門內的廣場遊戲裡已經有。
  - 正式門柱、圍牆、磚紋先不做（LAWWW 11-10）。
- 花台是照片裡明顯有、遊戲完全沒有的。LAWWW 11-10 12:38 同意先做這一項（D141）。

## 玩家會看到什麼
- 沿新生南路校園那一側的圍牆內側，有一段一段的花崗石矮花台：高 0.45 m、寬 1.7 m，離牆 5 cm。裡面是修剪成圓頂的杜鵑花籬，平常只有葉子，3 月開花（和溫州公園同一套季節切換）。
- 一共 16 段，每段 7 m，段與段之間留 1.2 m，人可以從縫走到牆邊。側門洞前後各留 1 m，進出側門不受影響。
- 椰子、樟樹、候車亭不動。人行道中間（x 12）照舊可以走。

## 做法
- `tools/blender/env_second/xs_planters.py` → `assets/models/env/second_ai/xs_planters.glb`，12,072 個三角形：
  - 花崗石框用 Poly Haven granite_tile_03；土是純色；
  - 杜鵑做法同 wz_park.py：不透明葉子貼圖的實心圓頂長條，外面再鋪一層葉片卡；
  - SEASON_AZALEA_on／off 兩套，遊戲只顯示其中一套。
- 花台的範圍寫進 GLB 的 `extras.planters`。
- `src/xinsheng3d.js`：
  - 載入 `bldg.xs_planters`，照 extras.planters 擋導航；
  - 呼叫 `Z3.wzParkSeason` 切季節；
  - 葉片卡設 alphaTest 0.5、雙面；花崗石和花籬本體投影。
  - 載入失敗就沒有花台，導航照舊。
- **要重新產生 GLB**：腳本讀開發分支的 `src/data/xinsheng_layout.js`（`--layout` 可以指定別的路徑）。杜鵑貼圖 `textures/gen/azalea_*.png` 在 LAWWW2 的分支上，開發分支沒有這兩張。

## 測試
新測試 `tests/xs_planters_unit.js`：在 Node 建出新生南路區域、接上真的 GLB，檢查四項：
1. 有 16 段、都靠牆、避開側門；
2. 導航有擋住花台，人行道中間照舊走得到；
3. 原本的路都還走得通：巷口、七間店、側門、候車亭、兩條斑馬線、人行道從北到南；
4. 不是 3 月時只有葉子。

- **開發分支 327f64bfe：FAILED 3**（1、2、4）；套上 patch：**ALL PASS**。
- 新生南路回歸 54 支（含兩支新測試）全過，見 `regression.log`。
- 沒驗證：遊戲畫面、手機效能（多 4 個網格、1.2 萬個三角形，只在新生南路）。Blender 預覽 `blender_preview_*.jpg` 是兩套季節疊在一起的畫面，遊戲裡只會出現一套。

## 整合
`git apply --binary xs_planters_1110.patch`。**先套 XS-DOOR-LABELS-1110**，這包是在它之後做的，同一個檔案 xinsheng3d.js。
