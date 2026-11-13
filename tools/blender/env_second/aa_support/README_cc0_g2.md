# 店面 CC0 化：第②群（幫手 g2，SHOP-CC0-HELP-1113，2026-11-13）

七間：青木（aoki）、Daybreak、頁間（yejian）、山嵐（shanlan）——aa_kit 那一族；慢輪單車（bike）、轉角唱片（corner）、日和便利店（cvs）——bb_support 的 Part＋CMesh 那一族。
做法、驗收標準：`docs/art-rebuild/second_ai/research/SHOP_CC0_HOWTO.md`。

## 共用檔改了什麼（舊的呼叫結果不變）

### `aa_kit.py`：`Shop.route({色碼: 材質 key})`
- 設了以後，`Xf.rbox／cyl／lathe` 的 `col=` 是表上顏色的零件，改放進 `sh.M[key]` 的累積網格（同一層樓 `lvl`、同一面牆 `sh.w(side, …)` 的組，淡出、分樓層照舊）；表上沒有的顏色照舊頂點色。
- 另加 `AAKIT_TALLY=1`（環境變數，開發用）：印出每個顏色用了幾個三角形，找值得換材質組的顏色。
- **沒呼叫 `route` 的腳本輸出不變**：`ROUTE` 預設空表，`_rt()` 第一行就原樣回傳；`TALLY` 預設 `None` 不做事。
  驗證（2026-11-13）：沒改的 `afar_interior.py` 用舊版 aa_kit（story-planning）和新版各建一次——三角形 48,378 ＝ 48,378、GLB 3,291,440 bytes ＝ 3,291,440、GLB 的 JSON（節點、網格、材質、accessor）完全相同；
  二進位差 3,939 bytes，同一版 aa_kit 連建兩次也差 3,433 bytes（Blender 匯出本來就不是逐位元固定），所以不是改動造成的。

### `cc0_kit.py`：`Kit.vc_tex(name, aid, …)`（只新增，原本的函式沒動）
- 「頂點色 × ambientCG 材質組」：材質組的顏色貼圖校成近白色（`target='#f2f2f2'`、`vary`），乘上頂點色——每個零件原本的顏色照舊，加上 CC0 的紋路和法線。glTF＝`baseColorTexture`＋`COLOR_0`（three.js 兩個相乘；試匯出確認過兩個都有）。網格要有 UV（`Mesh.finish(uv=True)` 的盒狀 UV）。
- 給 bike、corner、cvs：零件幾千個、顏色幾十種，一色一個材質會太多 draw call。lane118、us_market 沒用到它，輸出不變。

## 各店
| 店 | 腳本 | 手法 | Poly Haven | ambientCG |
|---|---|---|---|---|
| 青木 | `aoki_interior.py` | route＋植物／瓷瓶／熱水壺／茶具換掃描 | potted_plant_02、potted_plant_04、ceramic_vase_03、vintage_electric_kettle、tea_set_01 | Wood049、Wood066、Fabric030、Cardboard004、Paper001、Marble012、Plastic006、Metal009 |
| Daybreak | `daybreak_interior.py` | route＋植物、收銀機換掃描；窗框 L.flat → 材質組 | potted_plant_02、potted_plant_04、CashRegister_01 | Plastic006、Wood049、Fabric030、Marble012、Metal009、Plaster001 |
| 頁間 | `yejian_interior.py` | route＋植物、收銀機換掃描 | potted_plant_02、potted_plant_04、CashRegister_01 | Wood049、Fabric030、Metal009、Plastic006、Marble012 |
| 山嵐 | `shanlan_interior.py`（＋v2～v4_fill） | route＋植物換掃描；天花板 L.flat → Plaster001；雜誌牆紙堆不倒角（少 7 千面） | potted_plant_02、potted_plant_04 | Plaster001、Paper001、Metal009、Plastic006、Marble012、Wood066、Fabric030、Cardboard004 |
| 慢輪單車 | `bb_support/bike_interior.py` | vc／vcm → vc_tex；收銀機換掃描 | CashRegister_01 | Plastic006、Metal009 |
| 轉角唱片 | `bb_support/corner_interior.py` | vc／vcm → vc_tex；右前大盆栽換掃描 | potted_plant_02 | Plastic006、Metal009 |
| 日和便利店 | `bb_support/cvs_interior.py` | vc／vm → vc_tex（牆照舊平塗 `cvs_wall`）；貨架頂上紙箱換掃描 | cardboard_box_01 | Plastic006、Metal009 |

互動點、座位、導航、店員位置都沒動（只換材質和道具外觀）。Poly Haven 模型的物件叫 `S_ph_*`，烘焙不烘（bake 腳本的 NOLM 照這個名字排除）。
