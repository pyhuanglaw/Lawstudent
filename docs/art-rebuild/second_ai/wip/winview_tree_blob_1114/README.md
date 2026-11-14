# afar、日和（Daybreak）窗外的樹像綠球（WINVIEW-TREE-BLOB-1114，BB_379 586ee99e59，P3）——LAWWW2-C 11-14

- **原因**：窗景是 `wz_window_view.py --trees trees_gg.json` 照遊戲樹位種的。圍牆後面那排矮樟樹（h 5.8～7.7 m）原本整棵照高度等比縮小（樟樹範本 h0 12 m，縮到 0.5 倍左右），結果樹冠縮成小圓球，樹幹細得像竹籤。
- **改法**：工具加了 `--tree-min-w W`，只有打開這個參數才生效，其他窗景照舊。
  - 矮的樟樹、榕樹高度照 h，橫向至少 W 倍（每棵乘 0.92～1.08 錯開），所以樹冠攤開、樹幹變粗。
  - 每三棵換一棵榕樹範本。
  - 椰子樹不動。
- **重拍**：afar、Daybreak 的白天和晚上共 4 張，用 `--tree-min-w 0.8`。鏡頭、樹位、機車、校門、捷運出口和 11-14 第三份（gg_street_trees_1114/run.sh）一樣。轉檔照舊：左右鏡像，存 webp q80。腳本是 `run_afar_day.sh`、`run_rest.sh`。
- **patch**：`tree_blob_on_b327c42df1.patch`，底＝開發分支 b327c42df1。內容是 4 張 webp 加上 `wz_window_view.py`。
- **對照**：`tree_blob_cmp.jpg`，左＝開發分支現在的，右＝新版；由上到下是 afar 白天、afar 晚上、Daybreak 白天、Daybreak 晚上，已轉回人眼看出去的方向。
- **測試**：afar_view、gg_views_1105／1107、shop_viewpanes ×2、daybreak_seat 系列、mok_view、offbeat_rightview 等 12 支 ALL PASS。
- **沒做**：青木、頁間的窗景也是同一批樹，BB 沒點名。要的話，用同一個參數重拍 4 張。
