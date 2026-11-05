# V20R 雲端備援（CC-C 11-04 17:26～17:53 UTC；BB-C 16:40；**SwiftShader 無頭 ≠ GPU ≠ iPhone**）

- 遊戲：d3828452abe2d10f1b7bb3b47d8313482f83b2d3；一次一支（`v20r_cloud_backup.sh`；開跑、結束都記負載：summary.txt）
- 電腦那邊 mini、class、joy 已經 PASS（23:4x 台灣），這裡不重跑；day12 太慢沒跑；social_smoke、SITAMB 要 GPU，等電腦

| 項目 | 結果 | 秒數 |
|---|---|---|
| V20R_reach（tests/reachability_all.py ?turbo） | ALL PASS（29 區、1227 個互動點） | 294 |
| V20R_zone（zone_transitions ?turbo） | ALL PASS | 114 |
| V20R_p0（p0_movement） | ALL PASS | 187 |
| V20R_v7（save_compat_v7，舊版 385e194） | **FAILED 1**：48 個抽樣位置裡 1 個 | 286 |
| V20R_touch（touch_flow_wenzhou ?turbo） | ALL PASS | 182 |
| V20R_linze（flow_linze_floors） | ALL PASS | 553 |

## v7 那一項
- 失敗的一點：公館 v7 位置 (7.25, 36.75)（現在是建築／牆）→ 新版讀檔移到 (−8.75, 20.75)，**站不住**（E.canStand 半徑 0.3 m＝false），走得動。
- 重現（`v7pt.py`，固定那一點讀檔）：
  - **d3828：站不住**。
  - **線上 main b0c3032af（v9.10.19.1）：同一個落點站得住**。所以是 main → d3828 之間的改動。
- 導航格（`v7pt3.py`，x −12～−5、z 19～23，每格 0.25 m，見 `v7_gongguan_point.txt`）：
  - d3828 在 x −10～−8.5、z 21～21.5 多了一塊阻擋（1.5×0.5 m，貼著店面），落點南邊 0.3 m 的格子被擋住。
  - main 在這一帶的阻擋位置不一樣：x −10～−9、z 19～19.5，以及 x −7～−5.5、z 21～21.5。
  - 看起來是公館某間店門口的東西換了位置（附近 3 m 內沒有互動點）。
- 這支測試每次隨機抽點（tests/ 不固定亂數），電腦那一輪不一定抽得到這一點。
- 初判（判定歸 BB）：舊存檔重新定位時，只挑「導航格是空的」那一格，沒有照站得住的半徑挑。新的阻擋讓這一點變成站不住＝GAME_BUG（輕微，走得動）。是不是擋發布由 BB 判。
