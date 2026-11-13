# 美國兩間超市的窗景：白天／晚上兩張照片（SHOP-INTERIOR-VIEW-1112，LAWWW-C 子代理 2026-11-13）

店面標準 §12 第 2 點：有窗的店要有窗景，白天、晚上各一張，景是那條街。原本兩間只有一張圖、照時段調色（`viewTint`）；竹葉亞洲超市的天空是挖空的，室內沒有天空＝BB 看到「門那一面窗外一片灰」。

## 照片

| 店 | 窗景卡 | 白天 | 晚上 |
|---|---|---|---|
| 草原超市 `us_market` | `usm_outside_view`（店內座標 x −36～36、y −1.5～9.5、z 25；正面玻璃 z 16） | `assets/models/env/views/us_market_day.webp` | `assets/models/env/views/us_market_night.webp` |
| 竹葉亞洲超市 `us_asian_market` | `usam_view`（x −40～40、y −5.6～14.4、z 30；正面玻璃 z 6） | `assets/models/env/views/us_asian_market_day.webp` | `assets/models/env/views/us_asian_market_night.webp` |

都是 2048×512 webp（卡很寬：草原 6.5:1、竹葉 4:1，1024 寬太糊）。

並排圖（上：舊卡的原圖；下：舊的白天／晚上（照 viewTint 的顏色算）｜新的白天／晚上）：
- `us_market_views_cmp.jpg`
- `us_asian_market_views_cmp.jpg`

注意：並排圖是**貼圖本身**（草原超市已左右翻成玩家看到的方向），不是遊戲內截圖；遊戲裡從玻璃只看得到卡的一部分。遊戲內同鏡頭截圖請 CC 拍（D131）。

## 怎麼拍的

`tools/blender/env_second/wz_window_view.py` 加了幾個選項（沒有另寫一套）：
- `--us-street <layout>@x,y,z,ry`：超市街正式模型 `us_market_street.glb` 搬進店內座標；停著的車照配置 `cars`（`us_cars.glb`，和 `src/us3d.js` outdoorZone 同一個放法、顏色；等紅燈的車歸車流，不拍）；季節 `--us-season`（預設 summer，SEASON_GEO 只留那一季、SEASON_MATS 藏起來）；發光材質照遊戲（燈白天 0、晚上 1；店裡的燈白天 0.55）；晚上每顆 `GLOW_usms_lamp` 燈頭放往下照的聚光燈（瓦數照高度平方）；太陽跟著街轉。
- `--card x0,x1,y0,y1,z`：鏡頭在 `--eye`、朝 +z，畫面剛好框住整張窗景卡（離軸 shift）——從那個位置看出去，卡上每一點和真的街景對得上。
- `--flip-x`、`--final WxH`、輸出 `.webp`。

座標換算（`us_market_street.layout.json` 的 note）：草原超市店內 z＝街 z＋38、x 一樣；竹葉店內轉 180°：街 x＝−店內 x、街 z＝44−店內 z。

```
L=$PWD/assets/models/env/second_ai/us_market_street.layout.json
# 草原超市（白天；晚上加 --night）
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --glb none --us-street $L@0,0,38,0 --eye 0,2.4,8 --at 0,2.4,30 \
  --card -36,36,-1.5,9.5,25 --clip-start 11.1 --res 3200x489 --final 2048x512 --flip-x --samples 96 --hour 14 --us-lamp-k 28 --out $PWD/assets/models/env/views/us_market_day.webp
# 竹葉
/opt/blenv/bin/python tools/blender/env_second/wz_window_view.py -- --glb none --us-street $L@0,0,44,3.141592653589793 --eye 0,2.0,0 --at 0,2.0,30 \
  --card -40,40,-5.6,14.4,30 --clip-start 21 --res 2048x512 --samples 96 --hour 14 --us-lamp-k 28 --out $PWD/assets/models/env/views/us_asian_market_day.webp
```

- 草原超市的卡 u 往 +x 增加，從店裡往外（+z）看右手邊是 −x，所以要 `--flip-x`；竹葉的卡 u 往 −x，不用翻（兩張都從 GLB 的頂點、UV 讀出來確認過）。
- 近剪裁面：草原 `--clip-start 11.1`（剪到店內 z 19.1＝街 −18.9：把自己這一棟、門口的防風門斗剪掉，留雨遮外緣那一條）；竹葉 `--clip-start 21`（剪到店內 z 21：自己這一側的騎樓柱子、路燈、近的車道都剪掉——卡和玻璃之間是模型自己的 3D 地面，近的東西投到卡上會變成好幾倍大的柱子）。
- 鏡頭位置（眼睛）：草原 (0, 2.4, 8)，竹葉 (0, 2.0, 0)，大約是玩家走向門口時跟隨鏡頭的位置。換個位置看，卡沒有視差，近的東西會有一點對不上。

## 遊戲裡

`src/us3d.js` 的 `US_VIEW` 走 `Z3.wzViewSwap`（溫州街同一套）：晚上（hour < 6 或 ≥ 18.8）換夜版；照片載入失敗退回模型原本那張、照舊調暗；換了照片的卡不再 `viewTint`（夜版不調暗兩次）。

竹葉的 `alphaTest 0.5` 留著：新照片天空是拍進去的、alpha 全是 1＝全部通過；只有照片載入失敗退回原圖（天空透明）時才會挖空。

順手修的：竹葉載入正式模型後 `glass` 沒宣告（strict mode ReferenceError），後面藏天花板、燈、`applyTime` 都沒跑；玻璃材質名改成模型真的有的 `ck_glass`／`usam_door_glass`。

測試：`node tests/us_market_view_swap_unit.js`、`node tests/us_night_view_unit.js`、`node tests/place_gate_unit.js`（KNOWN-FAIL view 那兩列拿掉）。

## 還沒做／不確定

- 只拍夏天（交換 8/2 開始）；秋天、初冬、雪景窗外照樣是夏天的樹。要四季的話照 `usch_*` 的做法每季拍兩張、程式照 `usSeasonKey` 選。
- 黃昏（16:30～18:8）是白天那張、不調色；18.8 直接換夜版。
- 竹葉玻璃到卡之間（店內 z 6～30）是模型自己的 3D 地面（模型自己畫的停車格、馬路線，和超市街的馬路位置不完全一樣），這次沒動 GLB。
- 還沒有遊戲內截圖、還沒 iPhone 實機看過。
