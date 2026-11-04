# Daybreak 室內（公館 G14，取代「早午餐」；AA 2026-11-04 v1，READY_FOR_REVIEW）
- 使用者 11-04 02:0x 新店名、02:2x 參考圖。分工 AA_650 §6：室內 AA、MODEL_READY LAWWW2、功能 BB（CC 跑）、ART_APPROVED BB。
- 參考圖：`docs/story_planning/ref_images/shops/gongguan_daybreak_int.webp`（室內）、`gongguan_daybreak_ext.webp`（外觀，LAWWW2）。
- 門窗照 LAWWW2 外觀（DOORS.md，ccc8996a9）：店寬 9.0；大窗 x −3.31～1.48（窗台 0.76、窗頂 2.53）；門 x 1.6～2.73（高 2.43）；側窗 x 2.73～3.07。
- 配置：`src/data/daybreak_layout.js`（新區域 `daybreak`；9 × 8 × 3.7 m；24 席：窗邊兩人桌 6、中間四人桌 8、最裡面長桌 6、卡座兩桌 4）。腳本 `daybreak_interior.py`；貼圖 `aa_int_tex.py dbk`（dbk_print.png）；地板 `yej_terrazzo.png`；窗景 `mok_view.png`。
- 匯出：`/opt/blenv/bin/python tools/blender/env_second/aa_support/daybreak_interior.py -- --out assets/models/env/second_ai/aa_support/daybreak.glb`（要用 origin/claude/second-ai-env-art 的 lib2.py、cafe_layout.py、plants.py）。

## 規格（glb_specs.py）
- 三角形 **48,084**（≤ 6 萬）、材質 **11**、GLB 3.33 MB。最花三角形的是吧台後面的綠磁磚（15 cm 方磚一塊一塊做）。

## 拆圖清單（參考圖 → 模型）
| 參考圖 | 模型 |
|---|---|
| 左邊臨街大窗、窗上垂吊黃金葛 | `front` 窗（照外觀）、三盆垂吊黃金葛 |
| 窗邊兩人桌、直條椅背的淺木椅、早午餐盤、咖啡、水杯、花 | 兩人桌 ×3、chair(spindle)、setting()（餐巾、刀叉、水杯、盤子、蛋捲＋沙拉） |
| 中間淺木四人桌、米白／灰綠坐墊 | 四人桌 ×2、chair() |
| 後面一張長桌 | 長桌（六人） |
| 牆上三張早午餐插畫 | 西牆三張（吐司煎蛋、日出山景、鬆餅） |
| 沿後牆的長吧台：淺木直紋、淺色石材檯面、檯面下燈條、咖啡機、磨豆機、外帶杯、甜點櫃、收銀機、Pick Up 牌 | `counter` 4 m＋各設備 |
| 綠磁磚牆、兩層木層板（碗、杯、罐子、小盆栽）、不鏽鋼抽油煙機 | `tile_wall` 15 cm 方磚、層板兩層×兩段、抽油煙機 |
| 黑板（Brunch／Plates／Sandwiches／Salads／Drinks／Sweets） | `menu_board` |
| 右邊綠色卡座（直條紋靠背、黃色抱枕）、灰綠桌腳小桌 | `banquette`、`pedestal` 桌 ×2 |
| 牆上「Daybreak BRUNCH & COFFEE」＋太陽＋黃色山丘 | `mural`（貼圖 (0,0) 4×2，底色＝牆） |
| 白天花板、梁、嵌燈、冷氣、軌道燈、木編吊燈 | 梁 6、嵌燈 15、冷氣、軌道燈 6、木色半球吊燈 7 |
| 門口的草編腳踏墊、大盆栽 | `mat`、落地植物 3 |

## 鏡頭對參考圖（§12-2）
- `[["refcam",[4.3,1.5,2.2],[-4.5,1.0,-0.9],18]]`：站在東端門邊往西看。
- 渲染：`--res 800x450 --samples 16 --sun 30,-25 --sunE 14 --sunC 1.0,0.92,0.78 --lamp 25 --lampC 1.0,0.85,0.65 --world 0.2 --exposure 0.4 --gobo -5,5,-0.5,4.0,6.2`

## ref_match（§12-4）：ALL PASS
- 亮度 0.600／0.562、對比 0.526／0.553、冷暖 +0.255／+0.216、色票 ΔE 6.5、九宮格 0.056。
- 圖：`docs/story_planning/ref_images/model_renders/daybreak_v1_refcam{.png,_cmp.jpg,_report.json}`。

## 醜點清單
1. 卡座和牆上的 Daybreak 字在鏡頭右邊被切掉一半（參考圖整個看得到）：店深只有 8 m，鏡頭再往右轉，窗就出畫面了。
2. 窗框是淺橡木，外觀和參考圖是灰綠色（多一種窗框材質會超過我想留的餘裕；LAWWW2 要的話我改）。
3. 吧台和層板上的東西比參考圖少；抽油煙機比較簡單。
4. 窗外是畫的樹（木曜日那張窗景）。
5. 樹影是渲染時的 gobo，遊戲裡沒有。

## 和參考圖不同的地方（§12-5）
- **配合外觀**：門在東段、側窗在門東邊（參考室內圖看不到門）。
- **遊戲需要**：吧台後面 0.5 m 是店員（block 擋住）；中間走道 ≥ 1.2 m；點餐在吧台東段 (−0.9, −2.1)。
- **拿掉品牌**：沒有。

## v1b（LAWWW2 11-04 02:34 退回的六點，小修）
1. **卡座和 Daybreak 字整個進鏡頭**：兩個都做了。
   - 鏡頭往右轉，新鏡頭 `[["refcam",[4.3,1.5,2.4],[-4.5,1.0,-2.9],18]]`，窗只剩左邊一條。
   - 卡座、小桌、牆上的字往西（畫面中間）移 0.25 m。黑板移到吧台東端上方（along −0.75），綠磁磚縮到 x −1.2。
2. **遠處的牆**：西牆加了兩層開放層板（z −1.3～3.4；罐子、杯子、6 盆小植物），兩邊各垂一串黃金葛；三張插畫移到層板上面（2.75 m）。
3. **吧台和層板**：
   - 咖啡機加大、換成亮面，冒蒸汽的頭也加大。
   - 甜點櫃加高到 0.48 m，加木框，裡面三層 15 個麵包。
   - 層板的東西變密（間距 0.17 → 0.11 m）。
   - 抽油煙機換成不鏽鋼，加了邊框。
4. **天花板**：加兩條黑色軌道燈，各 7 盞（z 2.9、−1.0）。嵌燈、冷氣、白梁照舊。
5. **黃金葛**：葉子改小（0.085 m）、條數變多、往下垂 1.1 m，花盆改小。
6. **窗框**：改成灰綠色（新材質 `frame_sage` #8a9e8a），和外觀一致。
- **省三角形**：綠磁磚、吧台直紋改成不倒角，省下約 1.3 萬，磁磚數量沒有增加。
- 規格：**48,434** 三角形、材質 **12**、3.01 MB。
- **ref_match ALL PASS**：亮度 0.600／0.541、對比 0.526／0.509、冷暖 +0.255／+0.220、ΔE 6.8、九宮格 0.065。圖 `model_renders/daybreak_v1b_refcam{.png,_cmp.jpg,_report.json}`。
