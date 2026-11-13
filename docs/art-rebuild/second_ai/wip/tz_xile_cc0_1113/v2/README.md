# 洗樂洗衣坊 CC0 v2（SHOP-REALISM-1112；LAWWW2-C 2026-11-13）

**改什麼**（BB_379 洗樂 v1「部分」那兩點）：
1. 洗衣機、烘衣機的滾筒門原本整面黑色圓盤 → 現在是：不鏽鋼門框 → 黑色橡膠密封圈 → 看得到裡面的**不鏽鋼內筒**（三圈網孔、三片擋板）→ 外面一片微凸的玻璃（Metal009 不鏽鋼材質組＋玻璃材質）。
2. 補一張**從店裡朝門口**的鏡頭（cmp_xile_v2.jpg 右下）。

**沒改**：海報、洗衣精瓶（BB 說 P2，之後跟其他店一起做）；版面、互動點、導航、座位都沒動。

**檔案**：`xile_v2.patch`（底＝開發分支 `ebac31a76e`，只有洗樂六個檔：GLB、json、白天／晚上光照貼圖、`lightbake/tz_xile_interior_lm.json`、`tz_shops_interior.py` 滾筒那一段；`git apply --cached --check` 過）。`SHOP_STANDARD_STATUS.md` 不在 patch 裡，請 `place_gate_unit.js --write` 重產。

**測試**（在 dev＋v2 上）：tz_shops_unit、shop_cc0_unit（純色 24%，基準不用改）、place_gate 等 7 支 ALL PASS。

**大小**：GLB 1.8 MB → 2.8 MB（網孔、玻璃）；光照貼圖兩張共 0.3 MB。手機效能還沒量（和泰米一起請 CC 量）。

**遊戲內截圖**：13:00、`fast_shots.py`、藏 NPC 與玩家；左上兩列 v1／v2 同鏡頭。
