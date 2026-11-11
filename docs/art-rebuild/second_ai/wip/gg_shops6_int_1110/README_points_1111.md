# GG-SHOPS3 資料補五項（LAWWW 11-11 12:07 決定②；LAWWW2 帳號 A）

狀態：**WORK_IN_PROGRESS**（全部 Node 測試在跑）。發版後整合。

依據：`AA_743_對照_1111.md`（六間室內和 AA_743 的對照）最後「只加資料、模型不用改」那一組；LAWWW 12:07：做，kind 不改，要改模型的先不做（P3 GG-SHOPS3-ART-V2），騎樓的東西照現在。

## 改了什麼（沒有改模型）

| 店 | 加了什麼 | 位置 | 對應 AA_743 |
|---|---|---|---|
| 安泰藥局 `gg_antai` | 互動點 `cabinet`「看藥品櫃」kind `gg_antai_cabinet` | (1.5, −2.35) r 0.6：櫃台前右邊，看得到後牆整面藥品櫃 | `cabinet` |
| 汀州鮮果 `gg_xianguo` | 互動點 `boxes`「看紙箱」kind `gg_fruit_boxes` | (−0.8, −0.05) r 0.6：中間那一疊紙箱（extraStacks 第一堆）前面 | `boxes` |
| 洗樂洗衣坊 `tz_xile` | 互動點 `guide`「看使用說明」kind `tz_xile_guide`；三張塑膠椅的字「坐著等」 | (−1.3, 3.4) r 0.55：左牆門口那一面的使用說明海報（四格圖示）前面；座位走近點的「坐下」改字 | `guide`、座位 label |
| 印得好 `tz_yindehao` | 座位 `pc1`、`pc2`「用電腦」（客用電腦桌的兩張圓凳） | 坐 (−0.13, −4.03)、(0.53, −4.03) 面向電腦；走近點 (−0.13, −3.45)、(0.5, −3.35)（凳子和紙箱堆之間 0.53 那一點站不住，往左 3 cm、往前 10 cm） | `pc` 座位 |
| 榮恩典文具社 `gg_rongendian` | 互動點 `easel`「看畫架」kind `gg_rong_easel` | (2.25, 3.15) r 0.6：右前方兩個木畫架前面 | `window`（AA 的櫥窗畫架；現在的模型沒有櫥窗畫架，用店裡的畫架） |

- `src/data/tz_shops_layout.js`：上面這些（純 JSON，Blender 腳本照舊讀得到；模型不用重匯——點和座位不畫東西）。
- `src/tz_shops3d.js`：座位的字讀配置的 `label`（沒寫照舊「坐下」），一行。
- 台詞：新的點照舊只有一句暫時的「（店名）」，AA_742 的句子 LAWWW 接。

## 測試

- 新 `tests/gg_shops3_points_1111_unit.js`：五間的新點、座位都在、字對；站在新的點上按鈕（`E.nearestInteractable`）是它、站在座位走近點按鈕是那張座位；原本的點站在自己位置上照舊是它（沒被搶走）。修改前 FAIL。
- `tests/tz_shops_unit.js`（每一個座位、互動點走得到；家具裡站不住；店員在櫃台後面…）、`tests/tz_shops_notrap_1111_unit.js`（站得到的地方都走得回門口）：全過。
- 全部 Node 測試：在跑。
