# TINGZHOU-AREA-1110 汀州路商圈（X321）——WIP 存檔（LAWWW2 帳號 A，2026-11-10 19:1x）

狀態：**WORK_IN_PROGRESS／CHECKPOINT_SAVED**（只是備份，不能整合）。還沒有任何一張 3D 畫面看過。

## 依據（都在 `docs/art-rebuild/second_ai/ref/tingzhou_1110/`）
- `USER_INSTRUCTION_1110.md`：使用者的方向與 3D 美術製作指令（原文）。
- `concept/`：使用者自己生成的五間店面概念圖＋街景＋總覽（**主要美術參考**）；README 有原文、拆圖。
- `REF_ANALYSIS.md`：之前四張真實街景照片、三張地圖各參考什麼（第三方，不進 repo）。
- 配置提案 `../../proposals/tingzhou_area_1110.md`（LAWWW 18:42 同意：G10 改巷口、泰米村食正對巷口）。

## 這個資料夾
- `tingzhou_wip_v1.patch`（底：開發分支 70047bb79）：
  - `src/data/tingzhou_layout.js` v3：
    - 汀州路三段 80 m、路寬 10 m、兩側騎樓 3.2 m、巷 A（往公館）。
    - 29 間店，寬 2.5～12 m、3～7 層、era／front 各不同。
    - 三間照規格：泰米村食、洗樂洗衣坊、印得好。
    - 五間照概念圖：溫特寶邸、汀州聯通、東南大聯商行、客居雲南、越好吃小館，在西側 z 3～32（泰米村食南邊，照街景圖的順序）。
    - 其他是暫名（緬甸、印尼、馬來西亞、海南雞飯、人文咖啡、運動用品…），等 AA 取名。水源市場在東側南端。
  - `tools/blender/env_second/wz_street.py` 加 `--set tingzhou`（公館騎樓店面那一套組件，每間照 era／front 換門、地磚、燈、雜物；直立招牌長度 2.6～5.8 m 不一；樓上住戶招牌）。**第一次建得出 GLB**（7.7 萬三角形、6.9 MB），但那一版還沒有五間概念圖的店面，也還沒看過畫面。
  - `tools/blender/env_second/tz_fronts_tex.py`：從概念圖把五間的招牌、店內、門、照片菜單透視拉正 → `tz_fronts_atlas.jpg`／`.json`；`wz_shopkit.py` 加 tingzhou 圖集；五間用 `gg_front`（TZ_XS）。第一張有店面的預覽：`blender_v1_wente_dusk.png`（溫特寶邸）。
  - `tools/blender/env_second/tingzhou_preview.py`：Blender 預覽（招牌字、路面標線、機車、路燈、白天／傍晚／夜間）。**第一次算圖 20 分鐘沒算完**（雲端是軟體算圖），要改輕（機車少、解析度低）。
- `signs_from_concept.jpg`：五塊橫招牌拉正的結果（字和正式店名一致）。
- `tz_fronts_atlas.jpg`、`.json`：五間的店面貼圖集。

## 建置環境（雲端新容器）
- `bash tools/blender/setup_env.sh`。
- `tools/blender/env_second/textures/gen/` 要用我分支的（開發分支少 211 個檔）：`git checkout origin/claude/second-ai-env-art -- tools/blender/env_second/textures/gen`。
- Poly Haven 貼圖缺的用 `lib2.fetch(<id>)`（這次抓了 floor_tiles_06、concrete_floor_painted 等）。

## 還沒做（照順序）
1. 五間概念圖的店面做進模型：
   - 招牌貼圖接上（`tz_signs_atlas`）。
   - 每間照概念圖：雨棚顏色、門窗框、門口的東西、照片菜單。
   - 樓上：小方磚、鐵窗。
2. 預覽改輕 → 出圖 → 和概念圖 `street_dusk_five_shops.webp` 同角度比對（RULES_2D_TO_3D）。
3. 遊戲區域 `src/tingzhou3d.js`（導航、巷 A、回公館）＋公館 G10 改巷口＋Node 測試。
4. 泰米村食、洗樂、印得好的外觀照 GG_SHOPS3_1110.md；室內（AA_743）。
5. 夜市攤（晚上）、水源市場門口。
6. 交件給 LAWWW（最多 3 版）；遊戲同角度截圖要 CC 拍（D131）。
