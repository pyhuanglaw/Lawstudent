# 日常失速：店長（貓）趴在椅子上、社團佈告欄不閃了（OFFBEAT-CAT-BOARD-1105，LAWWW2-C 2026-11-05）

使用者 06:5x 兩件：

- 「沒看到貓」：`offbeat_sys3d.js` 有「看看店長／摸摸店長」，台詞是「一隻虎斑貓趴在空椅子上睡覺」。但模型裡沒有貓（配置的 `cat_chair` 寫「3D 的貓這一版沒做，只留位置」）。
- 「首都帝大學生社團&活動那塊牌子一直閃」：東牆佈告欄的標題牌和軟木板面在同一個平面。
  - 標題牌：`WALL_right_dof_print`，x 5.470。軟木板：`WALL_right_dof_wood`，x 5.470。
  - 最裡面兩張傳單和板面只差 0.4、0.8 mm；另外有兩張傳單互相只差 0.4 mm。

## 改了什麼（`src/zones3d.js`，接上正式模型以後的 `offbeatAttach`；模型檔沒改）

1. **店長**：用溫州街那隻貓的模型（`bldg.wz_cat`，J13）的趴姿 `CAT_lie`，趴在長桌東端那張空椅子的坐墊上（配置 `cat_chair` (2.45, 0.15)）。
   - 坐墊頂面在模型裡量是 0.523 m。趴姿的爪子在原點下面一點，所以照模型的底抬上去。
   - 會呼吸（`WZCAT.breathe`）。溫州街的區域 update 才會呼叫 `WZCAT.update`，所以這一區自己接。
   - 不是公園那一隻：不照公園的貓長胖、戴牌子、變老（`wzCatModel` 不給 G）。被收養、颱風天都照舊在店裡。
2. **佈告欄**：每一張印刷品（標題、44 張傳單、便利貼，共 58 片）照原本的前後順序重排。
   - 最少在板面前 4 mm；疊在別張上面的，再往前 1.5 mm（原本一層 1.2 mm）。
   - 改的是複本，不動快取裡的模型。

## 測試（Node，不用瀏覽器）

`node tests/offbeat_cat_board_unit.js`：ALL PASS（8 項）。載入真的 `daily_offbeat.glb`、`wz_cat.glb`，建出 `wz_offbeat` 區域。

- ① 有貓、在空椅子上（離椅子中心 0.015 m）、身體的底 0.526 m（坐墊 0.523）；椅背、桌子不穿過貓（104 條線打到 0）。
- ② 「看看店長／摸摸店長」的互動點離貓 0.51 m；貓會呼吸。
- ③ 從店裡往佈告欄打：印刷品和板面（或兩張印刷品）前後差 < 1.1 mm 的點 0 個；標題牌在板面前 4.0 mm。
- 修改前（開發分支 `2dd9d1bd9`）：FAIL 5。沒有貓；佈告欄 344 點近乎同一平面、標題牌 0.0 mm。
- 一起跑、ALL PASS：`wz_offbeat_unit`、`offbeat_aa618_unit`、`aa653_shops_unit`、`mokuyobi_unit`、`wz_shops_unit`、`wz_shops_cam_unit`、`wz_shops_lm_unit`、`wz_interiors_aa659_unit`、`seat_reach_unit`、`wz_cat_unit`、`wz_cat_walk_unit`、`wz_cat_float_rub_unit`、`aa493_cat_lines_unit`、`wz_park_people_unit`。
- 瀏覽器沒跑（D131）。**沒有截圖**，請 CC 拍：長桌東端的貓、東牆佈告欄。

## 先將就的

1. 貓是公園那隻的模型，橘色虎斑。台詞寫「虎斑貓」，橘虎斑也算，但和公園的貓長得一樣。要不一樣的毛色得在 Blender 另做一個材質（AA／BB 判）。
2. 只趴著呼吸、不會走：店長整天睡在那張椅子上（台詞也是這樣）。
3. 佈告欄是在程式裡把傳單往前挪，不是改模型。AA 重出 `daily_offbeat.glb` 的時候，Blender 腳本裡的傳單前後也要照這個排；這一段照名字（`WALL_right_dof_print`）找，名字改了就不會動。

## 接法

`git apply docs/art-rebuild/second_ai/wip/offbeat_cat_board_1105/offbeat_cat_board_1105.patch`（在 `2dd9d1bd9` 上做的）：`src/zones3d.js`，加新測試。
