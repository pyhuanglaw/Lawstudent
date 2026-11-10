# NTU-REF-1110 ③-2：共同教學館改成紅磚舊館＋米色粉刷翼樓（X223／D136）— LAWWW2 帳號 A，2026-11-10

- 狀態：`MODEL_READY`，交 LAWWW 整合；BB 判（第 1 版）。以開發分支 74da28ca9 為底。
- 遊戲截圖、同角度疊圖請 CC 拍（`--mode campus`）。
- 對照圖 `gongtong_before_after.jpg`：左舊右新，上面是北面（椰林大道那一側），下面是南面。Blender 渲染。

## 依據
- 使用者 11-04 14:03 給的照片（`docs/story_planning/ref_images/buildings/common_teaching_1104/README.md`）：
  - 紅磚舊館：上層一排高的拱窗、爬牆的常春藤；
  - 圍著中庭的翼樓：米色（淺黃）粉刷，也是拱窗。
- 校園地圖景點「共同三松」寫「共同教室的紅磚與拱窗」。
- 原本的外觀是依文字做的：整棟土黃十三溝面磚。

## 改了什麼（`tools/blender/env_second/campus_gongtong.py`）
- 東半部（三、四樓那一段＝舊館）的牆和豎貼帶：紅磚（red_brick，和行政大樓、望月台同一張）。
- 西翼（兩層）：米色粉刷（painted_plaster_wall，#d8c799）。
- 做法：照面的中心位置換材質（世界 x ≥ 2−XJ 算東半部；兩段交界那面牆算舊館）。gt_wall 拆成 gt_brick、gt_wing_plaster。
- 不照抄：拱窗的形狀、開間、洗石子收邊照舊是自己的設計；常春藤、中庭的松樹和木平台這一版沒做。
- 已知：豎貼帶是整面一條的長面，跨過交界的那幾條照舊是紅磚，所以翼樓的樓板位置看得到紅磚帶。看起來像磚砌的腰帶，留著。
- 材質多一個（8 → 9），網格多一個；三角形不變（28,627）；佔地、導航不動。

## 測試
- 新測試 `tests/ntu_ref_gongtong_unit.js`：
  - ① 沒有 gt_wall，分成 gt_brick 和 gt_wing_plaster；
  - ② 紅磚在東半部、米色粉刷在西翼，各有 150 m² 以上。
- **開發分支 74da28ca9：FAILED 2**；套上 patch：**ALL PASS**。
- 回歸：讀到共同、校園、attachWenzhouModel 的測試共 82 支（含新測試），全過，見 `regression.log`。

## 整合
`git apply --binary ntu_ref_gongtong_1110.patch`。內容：campus_gongtong.glb／json、campus_gongtong.py、新測試。
