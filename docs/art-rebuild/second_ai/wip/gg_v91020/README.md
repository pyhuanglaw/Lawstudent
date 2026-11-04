# PERF-GG-DC-1104：v9.10.20 被擋住的公館兩支測試（LAWWW 11-04 03:08，P1）

CC 在使用者電腦跑 `c7fde4f3e`：
- `tests/gongguan_layout_nav.py`、`tests/gongguan_glb_integration.py` 都 exit 1；
- log 在 claude/cc-local 的 `docs/story_planning/CC/local_out/GG_ext_nav`、`GG_ext_glb`。

## 交件
- 模型和腳本在我的分支：
  - 模型：`assets/models/env/second_ai/gongguan_shops.glb`／`.json`／`.props.json`；
  - 腳本：`tools/blender/env_second/wz_street.py`、`wz_shopkit.py`。
- `gg_v91020_code_tests.patch` 接開發分支 `555b9e0cb`，改三個檔：
  - `src/zones3d.js`：GG_PROP_BLOCKS 一格；
  - `tests/gongguan_layout_nav.py`；
  - `tests/gongguan_glb_integration.py`。

## 1. 騎樓 z 20.5 在 x 51.25～52.75 站不住（真的導航問題）
- 原因：轉角唱片（G12）門口的盆栽離店面 0.75 m，阻擋 [52.08,21.26,0.82,0.68] 加上 0.25 的邊，吃到騎樓的走線。
- 改法：盆栽移到店面前 0.35 m（和其他店一樣），x 往西挪 0.4，在木箱旁邊。GLB 和 GG_PROP_BLOCKS 一起改，新的一格是 [51.69,21.67,0.82,0.68]。
- 驗證（Node，照遊戲的 propBlocks，0.25 的邊）：
  - z 20.5、x −67→77 每 0.25 m：舊的位置站不住 `[51.25…52.75]`，正好重現 CC 的 FAIL；新的位置全部站得住。
  - street_props_nav_unit ALL PASS。
- 其他店門口的雜物沒有凸到 20.5。

## 2. 「離開書店 (−42, 18)」
- 書店門搬到 x −36.4 以後，出店的地方是 (−38.8, 20.2)（SHOP_IN.bookstore.out）。測試改成這個點。
- 也加了青木茶室的出口 (−54.05, 18)。
- spawn_exit_unit 驗過兩個點都站得住、不在出口範圍內。

## 3. 效能：street_west draw call 236 ＞ ?nobldg 172 × 1.3
- **先說清楚**：正式模型這邊沒有變多。
  - 10-22 同一支測試在 PC 量的是 street_west 233～238、arcade 236～239（`test_shots/gg_shadow_cap_1022/README.md`），當時是 PASS。
  - 這次 236、239，幾乎一樣。
  - 變的是分母：?nobldg 變少了（172、182）。
- BB 判定不放寬，所以從正式模型減。三個做法，都只在 `--set gongguan`：
  1. instancing 原型每個材質一次 draw call，原本 6 個原型 12 次。
     - 小的四個（冷氣 83、遮雨棚 176、鐵窗 114、暗窗 245）和店裡的盆栽（22）改成各自一份網格，合進同材質的大網格。
     - 照舊不投影：材質換成同參數、不投影的 cafe_vc_wz_*，或物件名加 NOSHADOW_。原本 instancing 就不投影，畫面的影子不變。
     - 最大的騎樓欄杆（397 個）照舊 instancing。
  2. 陰影那一輪：這些不投影（物件名 NOSHADOW_，遊戲的 wzCastsShadow 本來就認）：
     - 店面的小燈、燈管；
     - 新店面的店內景深卡（xs_fronts）、亮窗玻璃；
     - 新店面的灰泥牆、騎樓梁上的招牌。
  3. 青木茶室的灰泥 #efe8da 和日和的 #f0eee8 合成一個材質（看不出差別）。
- 估計（`dc_estimate.js`：GLB 在四個鏡頭的視錐裡有幾個網格、加上陰影 ±22 m 內會投影的；只算這個 GLB，其他場景不變，所以差值就是總數的差值）：

| 鏡頭 | 修改前 | 修改後 | 少了 | 換算 PC 的數字（236／239／218／159 減掉） | 上限（?nobldg ×1.3） |
|---|---|---|---|---|---|
| street_west | 61 | 46 | −15 | 約 221 | 223.6 |
| arcade | 65 | 50 | −15 | 約 224 | 236.6 |
| from_gate | 67 | 52 | −15 | 約 203 | 240.5 |
| lane | 46 | 31 | −15 | 約 144 | 167.7 |

- street_west 只比上限少 2～3 次。這是估計值，**要 PC 實測**才算數。如果還是超過，下一步是騎樓欄杆（397 個，三個材質）也合進去，再少 2 次，但檔案會再大約 1 MB。
- 代價：
  - 三角形一樣（畫出來的 118,630）；
  - **GLB 7.4 MB → 10.0 MB**：合進去的零件不再共用網格。
  - 陰影不變（合進去的都不投影）。
- 原因說明：舊的 ?nobldg 為什麼變少，我沒有查（套件不是我的）。

## 4. 期望值停在第一批（只改測試）
- `gongguan_layout_nav.py`：
  - 店名：阿鳳麵店→公館燒臘、舊路書房→頁間書屋；茶行「買一杯飲料」→「進入青木茶室」（門 x −54.05）。
  - 書店門 x −41.6→−36.4。
  - 「離開麵店」→「離開公館燒臘」。
  - 出口點見第 2 項。
- `gongguan_glb_integration.py`：
  - 招牌：八間新店（G01、G02、G03、G05、G06、G07、G12、G14）的招牌改成參考圖裁的（wz_xs_fronts），不在 wz_signs。
    - DESIGNED 扣掉這八間；VDESIGNED 拿掉 G02、G06。
    - 需要的三角形變成 2×(8＋2×4＋2×8＋5＋1)＝76，正好是 CC 量到的 76。
  - 光暈 114→122（GLB 的 GLOW_ 節點 122 個）。
  - 機車：騎樓前 A0～A13（10-23 起就有），台數 60→122。
    - A 組的 LOD 有第三層，是空的，40 m 外不畫（zones3d.js 公館區塊）。levelsOK 接受這一種。
  - 互動點：正式模型多一個「坐在騎樓的板凳」（zones3d.js `seats=ggGLB?[板凳]:[]`，照設計），比較時扣掉。
  - 沒有標記的群組：改成比「看得到的群組數」。
    - ?nobldg 也拿掉 prop.street，套件的路燈、腳踏車群組合併以後是空的，所以群組總數本來就不同。
    - CC 的數字 49−37＝50−38＝12，看得到的一樣多。
    - Node 也量到 ?nobldg 多兩個沒名字的群組（8、9 個子物件），就是套件的路燈和腳踏車。
- 兩支測試都只在 PC 跑得了（D131），我這裡只確認了 Python 語法。

## Node 測試（開發分支 555b9e0cb＋這份）
- 都 ALL PASS：street_props_nav、spawn_exit、singleside_streets、zone_prewarm、bike_shop_park、gg_interiors_1104、shop_rename_1104、bike_unit、nav_buildings。
