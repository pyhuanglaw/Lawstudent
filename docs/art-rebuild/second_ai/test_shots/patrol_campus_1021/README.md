# 巡場景第 1 區：校園（WIP，2026-10-21 14:xx，LAWWW2-C）

- 開發分支 `96af1e54`；Playwright 手機模擬（橫向 844×390）、SwiftShader。**不是 iPhone 實機**。
- 紀錄與優先順序：`../../ART_DIRECTOR_PATROL.md` 第 1 節。
- 工具（放在這裡，下一班直接用）：
  - `patrol_campus.py`：玩家跟隨鏡頭，21 個位置 × 三個時段。用法：`python3 patrol_campus.py 工作樹 URL 輸出資料夾 [時段,...] [位置名,...]`。
  - `closeup.py`：電影鏡頭近看（只用來查原因，不是玩家鏡頭）。
  - `banyan_probe.py`：榕樹氣根的「一次只改一樣」探針（最後一版還沒跑：使用者 14:3x 要先保存）。

## 截圖（9/25 週四；[捷徑] 讀檔、直接放玩家位置）
- 白天 15:00：`day_a.webp`（男一舍、共同、椰林大道、傅鐘）、`day_b.webp`（文學院、校史館、博雅、醉月湖、霖澤館、法學院廣場、萬才館、舊社科院位置）、`day_soc.webp`（社科院五個位置）。
- 黃昏 17:42：`dusk_a.webp`、`dusk_b.webp`。
- 夜晚 20:00：`night_a.webp`、`night_b.webp`（**拍了，還沒逐張看**）。

## 榕樹氣根是黑線：查到哪裡
- 貼圖沒問題：GLB 裡 `tree_leaves` 的氣根格子是淺灰（RGB 約 130,123,115）。
- 一次只改一樣（舊社科院位置那棵，15:00）：

| 改了什麼 | 結果 |
|---|---|
| 葉色調暗（instanceColor 0.74）改成 1 | 一樣黑 |
| 樹葉不接收陰影（只改 receiveShadow） | 一樣黑（這一項可能沒有重新編譯 shader，不能當結論） |
| 氣根頂點法線改成朝上 0.97 | 一樣黑 |
| 換成不受光的 MeshBasicMaterial（同一張貼圖） | **淺灰、細**（`banyan_basic_vs_lit.webp` 中） |
| 換成一般 MeshStandardMaterial（拿掉樹葉的自訂 shader） | 還是很暗 |
| 自發光 0x303030 | 變成深灰（`banyan_emissive.webp` 右） |

- 場景燈光：半球光 0.8（天 #dfe9f5、地 #c0b29a）、太陽 2.0、補光 0.35；沒有環境貼圖。照理氣根應該是中灰，實際只拿到約 1/10 的光。
- 下一步：新材質＋`receiveShadow=false` 一起換（確定重新編譯）、MeshLambert 比對，確認是不是陰影；是的話氣根要拆成不接收陰影的網格，或在 `street_trees.py` 調。
- ⚠️ `street_trees.glb` 是溫州街、公館、校園共用的：改它會影響溫州街（使用者 10-17 暫停）。修之前先問 LAWWW-C。
