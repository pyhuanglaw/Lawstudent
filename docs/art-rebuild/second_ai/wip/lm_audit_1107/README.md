# 哪些走得進去的區域還沒有光照貼圖（LAWWW2-B 2026-11-07 14:5x）

**怎麼查的**：
- 用 Node 載入開發 `e9d8c668f` 的 index.html 全部程式，把 83 個區域都建一次。
- 讀 `ASSETS.manifest`，看 `zone_assets.js` 每個區域實際載的正式模型是哪個檔，再看那個 GLB 有沒有 `extras.lightmap`。
- 共 130 筆，有光照貼圖的 35 筆。
- 加上今天交的五間（`3957b071e` 已整合）、205、臥室 C（`90db8d49e`），戶外不算。

**最重要的發現：有幾間我以前烘過，後來換成 AA、BB 的新模型，新模型沒有光照貼圖。**

| 區域 | 以前烘的（現在沒在用） | 現在用的 |
|---|---|---|
| 便利商店 cvs | `cvs_interior.glb`（有） | `bb_support/cvs_interior.glb`（沒有） |
| 麵店 noodle | 舊的麵店（有） | `bb_support/shaola_interior.glb`（燒臘，沒有） |
| 書店 bookstore | 舊的書店（有） | `aa_support/yejian.glb`（沒有） |
| 溫州街 SUNNY SIDE、阿德影印、一盞 | `wz_*_interior.glb`（11-01 #140 烘的） | `aa_support/sunnyside.glb`、`bb_support/ade.glb`、`aa_support/yizhan.glb`（沒有） |

## 還沒有光照貼圖的室內

| 優先 | 區域 | 模型（誰做的） | 大小 | 燈的網格 |
|---|---|---|---|---|
| 1 | linze_5f 霖澤 5F（學姊的研究室） | `linze_5f.glb`（LAWWW2） | 2.7 MB | `linze_5f_tubes`、`LAB_tubes`、`LAB_SIS_LAMP` |
| 1 | cvs 便利商店 | `bb_support/cvs_interior.glb`（BB） | 5.1 MB | 沒有命名的燈 |
| 1 | noodle 燒臘店 | `bb_support/shaola_interior.glb`（BB） | 3.7 MB | `sl_tube` |
| 1 | bookstore 書店 | `aa_support/yejian.glb`（AA） | 2.5 MB | `yej_bulb` |
| 1 | 溫州街 7 間：brunch、print、teahouse、teishoku、lin、offbeat、mokuyobi | `aa_support/`、`bb_support/`（AA、BB、CC） | 1.0～3.7 MB | `sns_bulb`、`kmc_bulb`… |
| 2 | library_b1、library_carrels、library_stacks 總圖 B1／研究小間／書庫 | LAWWW2 | 1.9～2.7 MB | `*_tubes` |
| 2 | 公館 4 間：afar、aoki、daybreak、bikeshop | `aa_support/`、`bb_support/` | 2.8～3.2 MB | |
| 2 | 新生南路 8 區：dabu、dakou 1F／2F、haopai、nanyang、nanyang_hall、shanlan、tongxian、xsports | `bb_support/`、`aa_support/` | 1.6～5.2 MB | |
| 3 | 118 巷 9 間店 | `l118_*.glb`（LAWWW2） | 0.5～1.5 MB | |
| 3 | 機場出境／入境、美國超市、日本宿舍 jp_room | LAWWW2 | 0.5～7.4 MB | |

**要 LAWWW-B 決定的**：
1. **在 AA、BB、CC 做的模型（`aa_support/`、`bb_support/`）上烘焙**，我的建議是直接改原檔：
   - 烘焙只加第二套 UV、`extras.lightmap`、拆開共用材質，不動幾何、配置、節點名字；
   - 原作者之後重新匯出，光照貼圖會不見，要再跑一次烘焙腳本；腳本記下原檔的 hash，對不上就提醒。
   - 另一個做法：另存一份、改配置的 glb 路徑。要動原作者的配置檔，比較亂。
2. **順序**：我照上面的「優先」排，1 是玩家最常進的。

**5F 要多一張「熄燈」貼圖＋一小段程式**：
- 研究室的燈有三種狀態：全開／只開學姊的檯燈／全關（`LZUP.labLights`）。
- 只烘燈全開的那一張的話，劇情關燈時畫面還是亮的。
- 照宿舍的做法（`roomDarkMap`、`z.lightsOff(k)`）多烘一張全關的。
- `linze_upper3d.js` 的 `apply5` 在不是全開的時候叫 `z.lightsOff(1)`，附 patch。
