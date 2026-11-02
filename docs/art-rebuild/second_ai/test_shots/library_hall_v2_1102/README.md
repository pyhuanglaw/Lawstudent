# 總圖大廳第二版：一樓中庭台階書牆、展演廳、多元共享區、數位媒體區；二樓書架、討論室、展示區（LIB-INTERIOR-1102 的 1F／2F；LAWWW2〔帳號 A〕2026-11-02）

- **起因（使用者直接對 LAWWW2 說）**：
  - 08:58「舊有的空間配置 能用的就沿用 按造實際配置安排」，附 B1／1F／2F 平面圖和鳥瞰圖；
  - 09:01 一樓兩張照片：中庭的木頭台階書牆＋夾層、半圓形展演廳；
  - 紀錄：`docs/handoff/user_asks_LAWWW2.json` UA-LAWWW2-1102-04、-05。
- **LAWWW 11:14 ACK 做法**：
  - version 1 留著當備用；
  - 舊存檔站在舊位置的要能 unstick；
  - 出生點、劇情站位要對，reachability_all 一起跑。
- **3F**：使用者沒有給 3F 平面圖（企劃線 photo_ref 也沒有），3F 閱覽區（`library` 區域）照舊不動。
- **狀態**：`READY_FOR_ART_REVIEW`。
  - 場景美術由 BB 驗收（D120）。
  - 截圖是 Playwright＋SwiftShader（電腦 1280×720），不是實機。

## 一、怎麼套（給 LAWWW）

1. **二進位**（從我的分支 `claude/second-ai-env-art` 拿，路徑照抄）：
   - `assets/models/env/second_ai/library_hall_v2.glb`（有光照貼圖用的第二套 UV、`extras.lightmap`）；
   - `assets/models/env/second_ai/library_hall_v2_lm_day.webp`、`library_hall_v2_lm_night.webp`；
   - `tools/blender/env_second/lightbake/library_hall_v2_lm.json`（烘焙的紀錄，遊戲不讀）。
   - manifest 的 key `bldg.library_hall_v2` 由 `src/library_hall_v2.js` 自己登記，`src/assets3d.js` 不用改。
2. **patch**：`docs/art-rebuild/second_ai/patches/library_hall_v2_1102.patch`。
   - `b1b249873`、`int/next1102` 的 `3e6855649` 都 `git apply --check` 乾淨。
   - 動到的檔：
     - `src/library_hall_v2.js`（新）：第二版的區域。
     - `src/data/library_layout.js`：version 2。由 `tools/blender/env_second/library_hall_v2_layout.py` 從第一版產生，不要手改。
     - `src/library3d.js`：layout 是 version 2、而且 `LBV2` 有載入，才改走第二版；另外把 `buildFurniture`、`viewOf`、`outsideTex` 給第二版共用。
     - `index.html`：多載 `src/library_hall_v2.js`。
     - `src/story3d.js`：上下樓的路人，東翼那一點 (8,−5) → (8,−3.4)。原本那點在第二版的西文書架上。
     - tests（62 支）：
       - 載入檔案清單有列 `src/library3d.js` 的 60 支，加上 `src/library_hall_v2.js`；
       - `library_hall_cam_core_unit`、`library_hall_lightmap_unit`、`nav_buildings_unit`、`flow_library_floors`、`flow_library_scene` 改成認得第二版；
       - 新增 `library_hall_v2_oldsave_unit`。
3. **要退回第一版**：把 `src/data/library_layout.js` 換回 base 的版本（version 1）就好。
   - `library_hall_v2.js` 可以留著；layout 是 version 1 時不會用到它，`src/library3d.js` 照舊建第一版。
   - 二進位 `library_hall.glb`（第一版）沒有動。

## 二、照片、平面圖對照

（交件時補。）

## 三、改前改後（同一個鏡頭；左＝第一版，右＝第二版）

（交件時補。）

## 四、做了什麼

- **配置**：
  - 寫在 `src/data/library_layout.js` 的 version 2，由 `tools/blender/env_second/library_hall_v2_layout.py` 從第一版產生，不要手改。
  - 遊戲 `src/library_hall_v2.js`、Blender `tools/blender/env_second/library_hall_v2.py` 讀同一份。
  - layout 是 version 1 或 `library_hall_v2.js` 沒載入時，`src/library3d.js` 照舊建第一版（備用）。
- **一樓**：
  - 中庭：第一版的實心核心＋帝國式大樓梯 → 蜂蜜色木頭的「台階書牆」（照片 1）。
    - 中間是走的樓梯：28 階，一階 17.9 cm，兩層共用；
    - 兩側是坐的大階梯：一階 42 cm，走不上去，每一階的立面是書架；
    - 上面是方格天花板，每格一片燈。
    - 從閘門到台階是深灰地毯走道，兩旁是亮燈的木頭展示櫃。
  - 展演廳（照片 2）：
    - 北牆中間開口，進去是半圓、挑高兩層的大廳；
    - 一圈高窗、深灰石材牆裙、淺色木地板；
    - 弧形展示櫃、弧形軌道燈、兩張矮長椅。
  - 多元共享區（西北）：四張四人桌、矮隔屏、閱報架。
  - 數位媒體區（東北）：三排電腦桌、辦公椅、視聽資料架。
  - 樓層簡介：立牌在入口閘門後面，面朝門口；第一版是掛在核心書架上。
  - 指標：展演廳、多元共享區、數位媒體區。
  - 盆栽：大葉盆栽，葉片卡。
- **二樓**（11-02 二樓平面圖）：
  - 西半邊：「人社中日韓文圖書」三排雙面書架（平面圖黃色）；靠西牆照舊是閱覽長桌。
    - 小安「總圖的下午」的那一張在 z 3.0，座位 (−10.175, 2.2)、(−10.175, 3.8)，和第一版一樣。
  - 東半邊：「人社西文圖書」兩排雙面書架（藍色）。多媒體中心照舊在東北，門的位置不變。
  - 北牆：討論室 225、226 的門（關著，要預約）；台階上來兩邊的牆上是展示區的展板。
  - 地板：人字拼木地板（第一版、2D 背景 `ntu_library_2f` 都是）。
  - 長桌：綠色銀行燈，和 B1 自習室同一款，instancing。
  - 柱子：一直到屋頂，二樓也擋導航。東北那一根在多媒體中心的牆線上，只擋它自己那一格，不然東側走道會被擠到 0.7 m。

## 五、導航、舊存檔

（交件時補：nav_buildings_unit、library_hall_v2_oldsave_unit 的數字。）

## 六、測試

（交件時補。）

## 七、還沒做的、限制

- 3F 照舊（沒有平面圖）。
- 沒跑手機實機。
