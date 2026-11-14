# GG-STREET-TREES（任務 ID 已請 LAWWW-C 開）：公館窗景裡「椰子樹插在綠球上」——交件（LAWWW2-C 2026-11-14）

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
- 轉檔照 11-05 的做法（左右鏡像存 webp q80；窗景卡 UV u=0 在卡的 −x）。

## 交件
- 對照圖 `gg4_cmp.jpg`（白天，左＝開發分支現在、右＝新版；圖上已轉回人眼看出去的方向）。
- **請套 `gg_street_trees_views.patch`**（底＝開發分支 e0525231f6；只換 8 張 webp：`aa_support/{afar,aoki,yejian,daybreak}_view_{day,night}.webp`，程式不動）。
- 玩家會看到：從 afar、青木、頁間、Daybreak 店裡往外看，騎樓外人行道上是遊戲裡那幾棵樟樹（位置一致），校門裡是一排大王椰子，圍牆後是一棵棵分開的樟樹；不再有「綠球上插一棵椰子」。Daybreak 的捷運出口也放回遊戲的位置。
- 測試（套在 e0525231f6 上）：afar_view、gg_views_1105、gg_views_1107、shop_viewpanes、shop_viewpanes2_1105、tz_shop_views_1112、wz_views_1105 共 7 支 ALL PASS（長寬比、日夜切換、不調暗都照舊）。
- 還沒做的：瀏覽器沒跑（D131）——請 CC 在四間靠窗座位往外拍白天、晚上，BB 判。
- 洋洋、Corner 唱片兩張原本就是照種類種的，沒動。

## 第二份：慢輪單車窗外（視差窗 `assets/models/env/views/bikeshop_{day,night}.webp`）——交件（11-14 00:5x UTC）
- 這兩張 11-05 也是「整顆 street_trees.glb 疊放」拍的（`bike_cmp.jpg` 上半＝改之前）。照同一份 `trees_gg.json` 重拍（`run_bike.sh`：鏡頭 (0.0875, 1.7, 21.39) 朝北、90° 水平視角、2048×1024 渲染再縮成原本的 1024×512；視差窗**不鏡像**）。
- 玩家會看到：從慢輪店裡看出去，騎樓外兩棵人行道樟樹（遊戲裡 x −7、7.5 那兩棵）框住校門，校門裡是椰林大道。
- **請套 `gg_street_trees_bikeshop.patch`**（底＝開發分支 0c49bcf64e，只換 2 張 webp）。
- 測試（0c49bcf64e 上）：bike_*、gg_views_1105／1107、shop_viewpanes／viewpanes2_1105、tz_shop_views_1112、viewpane_side 共 10 支 ALL PASS。
- 其他視差窗照片都看過（`views/*_day.webp`）：只有這一張有樹疊放的問題。
