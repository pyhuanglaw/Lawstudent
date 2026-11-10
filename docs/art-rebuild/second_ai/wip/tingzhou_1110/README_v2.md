# TINGZHOU-AREA-1110 汀州路商圈 第 2 版（D141 第 2／3 版；LAWWW2 帳號 A 2026-11-10）

patch：`tingzhou_v2.patch`（base＝dev `6c55e63e3`，第 1 版 7a625da3c 已經在裡面）。取代同資料夾的 `tingzhou_v2_WIP.patch`。

## 這一版照誰的話改
| 來源 | 要求 | 這一版 |
|---|---|---|
| 使用者 11-10 20:4x（經 LAWWW）「混合」 | 五間照概念圖沒有騎樓、直接臨人行道；其他老公寓保留騎樓，立面有進有出 | 五間整棟退到店面線（x −8.2），門前是露天人行道、沒有柱子；橫招牌改成窗上方的大招牌（概念圖裁的）、直立燈箱、雨棚、照片菜單、門燈。配置 `arcade:false`，`TZ3.pillars` 跳過；測試第 8 項 |
| 使用者 11-10 21:1x「六家店外觀參考圖」 | 洗樂洗衣坊、印得好、泰米村食照圖 | 三間的招牌、窗內景、門、菜色照片都從參考圖拉正裁（`tz_fronts_tex.py`，圖在 `ref/gg_shops6_1110/concept/`）；保留騎樓（圖上就有）。洗樂騎樓的木長椅有；**印得好門外的裝訂樣本架、泰米的黑板立牌和藤籃盆栽還沒做成模型**（景深卡裡看得到） |
| 使用者 11-10 夜市六點 | 攤位是照時間出現、營業、收攤的模組；種類不一樣；不擋店門；不是整條封閉的夜市 | `tz_stalls.py` → `tingzhou_stalls.glb`：十四種（十種能買：割包、胡椒餅、紅豆餅、地瓜球、蔥油餅、臭豆腐、烤玉米、雞蛋糕、甘蔗汁、粉圓冰／燒仙草；四種背景：套圈圈、手機殼、襪子、算命），各有 `STALL_<種類>_open`／`_closed`。位置在配置 `stalls.list`：巷 A 七攤兩側交錯（中間留 ≥ 2 m）、水源市場前路邊四攤、其他三攤在路邊機車格。17:00～24:00 營業，其他時間是蓋帆布的樣子。測試第 9 項 |
| BB 第 1 版判定第 2 點 | 街上是空的 | 兩側機車格一排機車（公館那一套十二款，`Z3.attachWzScooters`）；巷口、斑馬線、攤位的位置不停。路人請 LAWWW 接 crowd |
| BB 第 3 點 | 五間的招牌太小 | 見第一列 |
| BB 第 4 點 | 沒名字的店晚上白亮 | 店內亮度 0.85 → 0.5～0.66（老店最暗）。**沒有在遊戲裡看過效果** |
| BB 第 5 點 | 巷 A 口兩邊灰牆；「商店」直立招牌太大 | 洗樂、印得好朝巷子的側牆開窗；水源市場的直立招牌改短（2.6 m）。**不確定 BB 說的是不是這一塊招牌** |
| 自己加 | 樓上太乾淨 | 曬衣、盆栽變多；三棟裡一棟二樓有整面的住戶招牌（字是種類：家教班、桌遊、美髮…，暫定） |

## 給 LAWWW
- `src/zones3d.js` 只多匯出一個名字 `attachWzScooters`（沒有改行為）。
- 攤位：`zone.tzStalls`（每一攤 id、kind、x、z、yaw、open／closed 物件）、`zone.tzStallsOn`、`zone.tzStallsClosed=true` 強制收攤（颱風、大雨）、`TZ3.stallsOpen(h)`。看、買的互動點還沒有（TINGZHOU-NIGHTMARKET-1110）；攤名、價錢在 `tingzhou_stalls.json` 的 `kinds`（照 AA_744 第 2 節）。
- 攤位、機車的導航阻擋不隨時間變（收攤也在原地）。

## 還沒做（第 3 版或另外的任務）
1. 泰米村食室內（AA_743）；洗樂、印得好室內。
2. 沒有名字的 21 間店面（等使用者定店名；店面新增由使用者決定）。
3. 遠景樓房、路兩頭；公館那一頭 G10 的巷口模型。
4. 地面還是套件（柏油、騎樓地坪）；五間門前的人行道沒有專用鋪面。
5. 攤位沒有攤主（人物由 LAWWW 的 crowd）；沒有冒煙、蒸氣。
6. 汽車、公車站牌。

## 驗證
- `node tests/tingzhou_unit.js`：ALL PASS（第 8、9 項是這一版新加的；在第 1 版上跑會失敗）。
- 全部 Node 測試：見 `regression_v2.log`。
- 畫面：只有 Blender 預覽（`tingzhou_preview.py`，不是遊戲截圖，D131）。遊戲截圖請 CC 同機位重拍。

## 回歸（regression_v2.log，1235 項 Node 測試）
沒過三項，都不是這一版改的檔案造成的：`aa581_midterm_lines_unit`、`sis_no_three_unit`（都指到 dev 的 `src/data/movie_plots.js` 的句子）、`bookstore_exit_unit`（找不到 `bookstore_interior.glb.json`，build 產物）。請 LAWWW 確認 dev 上本來就是這樣。

## 圖（Blender 預覽，不是遊戲截圖）
- `blender_v2_taimi_front_dusk.jpg`：泰米村食正面（對 `ref/gg_shops6_1110/concept/shop_taimi.webp`）。
- `blender_v2_five_noarcade_dusk_early.jpg`：五間沒有騎樓（這一張是加機車、攤位、三間以前算的）。
- `crops_three_from_ref.jpg`：三間從參考圖拉正裁的招牌、窗內景、門、菜色照片。
- 洗樂＋印得好、巷 A 攤位、水源市場前攤位的預覽算得很慢，補上以後另外 commit。攤位的顏色還沒在有顏色的畫面裡看過（只看過形狀）。
