# MOKU-2F-WINDOW-1114：木曜日二樓的窗從街上看不出是店

狀態：`WORK_IN_PROGRESS`（做法定了、窗後面要貼的圖算好了；街景模型還沒重產）。LAWWW2-B，2026-11-14。

## 問題（BB-B，P3；證據 claude/cc-local `GATE2_MOKUYOBI_r5` 的 lookup 兩張圖）

從溫州街抬頭看木曜日（B4 二樓）：白天只有深色反光，晚上整片均勻暖黃，和隔壁住家一樣，看不出是店。

## 原因

`tools/blender/env_second/wz_shopkit.py` 的 `mok_window()`：玻璃後 0.9 m 是一整面純色的暖光面（`room_lit`）加三組紗簾。沒有任何店內的東西。

## 做法

- 玻璃後面那一面改貼「從臨街窗外往店裡看到的真的店內」：用木曜日走進去的那一顆室內模型（`assets/models/env/second_ai/aa_support/mokuyobi.glb`）算一張圖——吊燈、胡桃木書櫃、吧台、盆栽、桌椅（店面標準 §12 第 1 點：店外看到的要和走進去的一樣）。
- 圖：`mok_2f_room.jpg`（1024×512；原始算圖 `room_from_street_side.webp`）。
  重算：`/opt/blenv/bin/python tools/blender/env_second/glb_preview.py -- assets/models/env/second_ai/aa_support/mokuyobi.glb <輸出> 'in:0:1.6:9.6:0:1.35:0:58:WALL_front|WALL_S|mok_window_view' 1400 0.36 eevee`（要用 LAWWW2 分支上支援 eevee 的 `glb_preview.py`；開發分支那一份只有 Workbench），再縮成 1024×512、亮度 ×0.92。
- 紗簾只留兩端（中間那一組拿掉，不擋店內）。
- 白天也要看得到一點店內：這一面自發光（和新生南路二樓窗後面同一種做法），打烊時跟著店的燈暗下來。

## 還沒做的

1. 先把開發分支的 `wenzhou_street.glb` 原樣重產一次，確認重產出來和現在的檔一樣（三角形數、大小）——背景在跑。
2. 改 `mok_window()`、把圖放進 `tools/blender/env_second/textures/gen/`、重產 `wenzhou_street.glb`。
3. 跑溫州街相關的 Node 測試（`wz_slim_unit`、`singleside_streets_unit`、`place_gate_unit`、光暈和打烊那幾支）。
4. Blender 預覽：從街上抬頭看 B4 二樓，白天、晚上各一張；交 LAWWW-B；遊戲內排 CC 用 GATE2_MOKUYOBI 的 lookup 鏡頭重拍，BB 判。
