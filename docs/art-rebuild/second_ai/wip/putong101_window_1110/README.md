# PUTONG101-WINDOW-1102：普通 101 北窗白天整片深藍黑

狀態：**已交付（MODEL_READY）**。改模型＋測試；窗景照片要 CC 在遊戲裡重拍（D131）。LAWWW2 帳號 A，2026-11-10。

## 原因（LAWWW2-B 10-31 已判斷：`test_shots/putong_winview_1031/`）
- 窗景沒有缺。普通北面教室的窗外，就是博思一樓南面的玻璃大廳。
- 那片玻璃往內退 0.6 m、上面有樓板，遊戲裡照不到光。
- 玻璃照 archkit 的顏色（頂點色，線性：上 0.26、下 0.06）幾乎是黑的，窗景照片 `putong_north_day.webp` 拍到的就是一整片深藍黑。真的玻璃白天會反射對面的白牆和天空。

## 改法（`tools/blender/env_second/campus_teach.py --set boya`，重匯 `campus_boya.glb`）
- 只有一樓南面這一片帷幕換成亮一點、偏灰藍的漸層：上 0.48／0.55／0.62、下 0.20／0.24／0.28（線性）。
  - 呼叫 `curtain()` 前暫時換 `archkit.GL_TOP／GL_BOT`，呼叫完換回來。
- 其他樓層、其他棟的 ck_glass 不動。三角形 8,630 不變。
- 晚上照舊：亮燈的窗是自發光貼圖右半，不受頂點色影響。
- 對照：`blender_before_after.jpg`（Blender 預覽，不是遊戲畫面）。預覽的打光比遊戲亮，差別看起來小；遊戲裡這片玻璃照不到光，下半部會亮約 3 倍。

## patch（`putong101_window_9d4c54c16.patch`，--binary，在開發分支 9d4c54c16 上做的）
- 內容：`campus_boya.glb`、`.json`、新測試 `tests/putong101_window_unit.js`。
- Blender 腳本在本分支 `tools/blender/env_second/campus_teach.py`。

## 測試
- `putong101_window_unit.js`（讀 GLB 的 by_glass 頂點色）：
  - 開發分支：1 **FAIL**（一樓南面最亮 0.26）。
  - 加 patch：**ALL PASS**（0.48；其他玻璃照舊 ≤ 0.26）。
- 回歸 `pt_reg.txt`：e05_putong、nav_teach、teach_east_drawcall、zone_prefetch 都 ALL PASS。

## 接下來（要別人做的）
1. LAWWW 套 patch。
2. CC 在電腦上跑 `python3 tools/blender/env_second/shots/teach_views.py <網址> putong_north`，重拍窗景照片 `assets/models/env/views/putong_north_{day,night}.webp`。
3. BB 判：普通 101 從後面往黑板看的同一個角度（BB-B n28 那張），白天北窗不再整片黑。
4. 從校園外面看博思一樓，玻璃也會變亮一點，請一起看。
