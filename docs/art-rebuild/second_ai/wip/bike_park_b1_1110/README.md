# BIKE-PARK-B1-1110：總圖 B1 中庭出口附近的停車架

狀態：**已交付**（patch）。LAWWW2 帳號 A，2026-11-10。

- **原因**：GHA 全套（9d4c54c16）只剩 `tests/bike_park_1104_unit.js` ① FAIL。從總圖 B1 中庭出來（library_b1 → campus 落點 (98, −32.8)），最近的合法停車處在 28.5 m 外，門檻是 12 m。
- **改法**（`src/zones3d.js` 的 `BIKE_RACKS.campus` 加一座，patch `bike_park_b1_f3b47894b.patch`，在開發分支 f3b47894b 上做的）：
  - 位置 (89.5, −35)、ry π/2：下沉中庭西邊、樓梯口南邊的空地，架子沿 z。
  - 離 B1 出口 8.8 m。架子放在地面那一層，因為腳踏車不會牽下樓梯。
  - 先用 Node 量過那一帶的導航格：x 88.5～90.5、z −37～−33 是空的；東邊是中庭的欄杆、西邊是另一個東西。
  - 不壓到出入口：B1 的門 (98, −31.9) 離 8.6 m；「看樓梯下面」只是看，不是出入口。
- **測試**：
  - `bike_park_1104_unit`：開發分支 ① **FAIL**（28.5 m），加 patch **ALL PASS**。
  - 讀到停車架、腳踏車的 67 支 `*_unit.js`（完整清單，沒有截斷）加上 lib_b1_court、b1court_glass_cam、nav_buildings：65 支 ALL PASS。
  - `aa653_shops_unit`、`gg_interiors_1104_unit` 各 FAILED 1，**開發分支原樣也一樣**：story3d.js 的 shop:'tea' 清葉茶行外帶那一段，不是這個 patch 造成的。詳見 `regression_f3b47894b.txt`。
- **沒有測過**：瀏覽器畫面（D131）。架子是 W3.bikeRack，和校園其他架子同一款。
