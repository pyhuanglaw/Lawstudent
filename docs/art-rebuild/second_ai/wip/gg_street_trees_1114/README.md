# GG-STREET-TREES（任務 ID 已請 LAWWW-C 開）：公館窗景裡「椰子樹插在綠球上」——WIP（LAWWW2-C 2026-11-14）

## 原因
- 公館四間店的窗景照片（afar、青木、頁間、Daybreak；`aa_support/{afar,aoki,yejian,daybreak}_view_{day,night}.webp`）是 11-05 用 `wz_window_view.py` 拍的。
  當時把**整顆 `street_trees.glb`**（四種樹範本：樟樹 a／b、榕樹、大王椰子，疊在原點）用 `--place` 放在 z −56 的 8 個點 → 每個點都是椰子樹＋樟樹疊在一起，從店裡看像「綠球上插一棵椰子」。位置也不是遊戲的位置。
- 工具 11-07 已經加了 `--trees`（照種類一棵一棵種，XS-WINCARD-1105），但公館這四張一直沒重拍。Daybreak 那張更早（第一包），捷運出口還放在模型原點（遊戲是 (−36.6, 0, 11)、轉 90°）。
- 洋洋、Corner 唱片（幫手後來拍的）沒有這個問題。
- 改之前：`before_views.jpg`（開發分支上所有 `*_view_day.webp`）。

## 做法
- `ggtrees.js`：Node 建公館區域，包住 `TK.tree`／`TK.royalPalm` 記下每棵樹的種類、高度；建完讀世界座標（合併掉的那幾組用自己的座標，那幾組都放在原點）→ `trees_gg.json`（103 棵：大王椰子 36、樟樹 67）。
  用法：`node ggtrees.js <開發分支工作目錄> <輸出.json>`。
- `run.sh`：照 11-05 第四包（m5）的鏡頭、捷運出口位置重拍四間日／夜，只把 8 顆疊放的 street_trees 換成 `--trees trees_gg.json`。機車位置和遊戲一致（122 台，和 11-05 相同）。
- 渲染中；完成後：轉 webp、並排圖、`gg_views_1105_unit`／`afar_view_unit` 等測試、patch。
