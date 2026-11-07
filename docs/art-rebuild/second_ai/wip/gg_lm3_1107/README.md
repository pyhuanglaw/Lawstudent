# 光照第一級第三批：溫州街 AA 五間＋阿德影印（LAWWW2-B 2026-11-07；lm_audit_1107 第一級）

接在第二批（公館燒臘、頁間書屋，交件 `09bbfefe2`；LAWWW-B 已整合 `f7444d194`）後面。照 LAWWW-B 11-07 14:51：**在原檔上烘**，只加第二套 UV、`extras.lightmap`（在 scene 的 extras）、拆開共用的材質，不動幾何、節點、座標、配置。節點數、名字烘前烘後一樣（腳本逐一比過）。

**林家乾麵沒有烘**（BB 的 `assets/models/env/second_ai/bb_support/lin_interior.glb`，沒動）：模型沒有天花板燈具，只有兩片暖色小燈板和收銀台招牌；照這些燈烘，晚上會比現在的即時光暗。要烘得先請 BB 補燈具，不然照舊即時光。

## 動了誰做的哪個檔
| 區域 | 檔案 | 誰做的 | 原檔 sha256（烘焙紀錄也有） | 大小 |
|---|---|---|---|---|
| SUNNY SIDE | `assets/models/env/second_ai/aa_support/sunnyside.glb` | **AA**（v1e，企劃線 86688bd91；開發 dc21c5949 取進） | `d94d70d09acb49586625f750bbcc6b925b1d8c64efeb77d7e082822a3c47e8a4` | 2,295,120 → 2,408,496 B |
| 小路 | `assets/models/env/second_ai/aa_support/komichi.glb` | **AA**（v4，同上） | `0bf1488b17908710308a3ea1406167490f1a68849bfcf652beaeb5e788733716` | 2,441,056 → 2,511,888 B |
| 木曜日 | `assets/models/env/second_ai/aa_support/mokuyobi.glb` | **AA**（子代理，`tools/blender/env_second/aa_support/mokuyobi_interior.py`；開發 aa8cb5beb 取進） | `24f7d6406f2a496cd2956f8ec8997e1259ef9f11d58db907f1537bbe6434fe72` | 3,835,064 → 4,008,412 B |
| 一盞 | `assets/models/env/second_ai/aa_support/yizhan.glb` | **AA**（v1e，同 SUNNY SIDE） | （烘焙中） | 1,095,532 → ？ |
| 日常失速 | `assets/models/env/second_ai/aa_support/daily_offbeat.glb` | **AA**（開發 42467c2dc 取進） | （排隊） | 3,187,260 → ？ |
| 阿德影印 | `assets/models/env/second_ai/bb_support/ade.glb` | **CC**（v1c `5977272dc`；開發 cfd402363 取進） | `e4d554c959a0ef123f51f00d194e05a6e6120d5ac765f9cd2a9d6304f2945be6` | 1,704,624 → ？ |

原作者以後重新匯出，光照貼圖會不見，要再跑 `bash tools/blender/env_second/lightbake/bake_gg_new.sh aa_sunnyside`（`aa_komichi`、`aa_mokuyobi`、`aa_yizhan`、`aa_offbeat`、`bb_ade`）。
`tools/blender/env_second/offbeat_storefront.py`（日常失速從街上看的店內）、`xs_front_tex.py` 讀 `daily_offbeat.glb`／`sunnyside.glb` 渲染店面圖：重跑時讀到的是烘過的檔，多一套 UV、多一個 `_rt` 材質，畫面不受影響（那兩支不用光照貼圖）。

## 新檔（都在我的分支 `claude/funny-albattani-iawshm`）
- `assets/models/env/second_ai/aa_support/{sunnyside,komichi,mokuyobi,yizhan,daily_offbeat}_lm_{day,night}.webp`、`assets/models/env/second_ai/bb_support/ade_lm_{day,night}.webp`
- 烘焙紀錄 `tools/blender/env_second/lightbake/{sunnyside,komichi,mokuyobi,yizhan,daily_offbeat,ade}_lm.json`
- 腳本：`bake_gg_new.sh` 加六段；新的 `glow_points.py`（GLB 裡的 `GLOW_*` 燈位標記 → `bake_room.py --points`，不需要 Blender）
- 測試 patch `gg_lm3_1107_tests.patch`（對開發 `4172db1e0`；開發後來到 `7959c3ff3`，這支測試沒被改過，照樣套得上）

**遊戲程式不用改**：六間都走 `Z3.attachRoomGLB`，GLB 有 `extras.lightmap` 就接。

## 怎麼烘的
AA 的店裡，燈位是 `GLOW_<種類>_<編號>` 空節點（extras 有 `glow` 顏色、`night`）。`glow_points.py` 照種類給瓦數（吊燈 9、壁燈 5、投射燈 6、檯燈 4、落地燈 6、紙燈 6、行燈 4、蠟燭 0.6、吧台燈條 3、軌道燈 6、平板燈 14 W），再乘一個每間店的倍數。
- **燈在燈罩裡面**：標記常常就在燈罩、紙燈、壁燈燈座「裡面」，光源放在那裡會被擋住（小路試烘晚上 0.08，滿地亮點）。`glow_points.py --below`：找標記附近（水平 0.3 m、上下 −0.35～+0.3 m）烘焙時沒藏起來的網格，把光源放到最低點再往下 3 cm（燈罩口、紙燈下面），最多 0.4 m；蠟燭不動。
- 烘的時候藏起來、照樣輸出：玻璃、窗景卡（`VIEW`）、燈泡、紙燈、吊燈燈罩（`_pend`）。
- 只烘地板、天花板、榻榻米、牆、牆上的木作／柱子；家具、書、小東西照舊即時光（島太多、貼圖解析度不夠）。
- 白天：太陽 方位 180°、仰角 35°，天空 1.0，開口那一面（店面、側窗）的日光 0.8；晚上天空 0.03。

| | 房間 | 開口 | 燈 | 倍數 | 拆開的材質 |
|---|---|---|---|---|---|
| SUNNY SIDE | 6.7 × 10.3 × 3.2 m | 南、東 | 14 盞（9.6～21.6 W） | ×2.4 | `sns_walnut`（牆上木作烘、家具 `sns_walnut_rt`） |
| 小路 | 8.3 × 8.3 × 2.9 m | 南 | 19 盞（2.7～40.5 W；紙燈罩得很密，倍數最大） | ×4.5 | `kmc_walnut` → `kmc_walnut_rt` |
| 木曜日 | 9.3 × 14.3 × 3.0 m | 南 | 26 盞（1.6～23.4 W） | ×2.6 | 沒有 |
| 一盞 | 8.7 × 11.3 × 2.6 m | 南 | （烘焙中） | ×6 | `yzn_post` → `yzn_post_rt` |
| 日常失速 | | 南、東 | | ×1.5 | |
| 阿德影印 | | 南 | 天花板平板燈 → 0.4 × 1.2 m 面光源，14 W | | |

倍數是先用 128 取樣試烘、量亮度，再照「目標／量到」^2.04 算的（編碼後亮度 ≈ 線性^0.49）。目標：晚上咖啡店、西式店 0.32 左右，日式店 0.25 左右。

光照貼圖亮度（WebP 編碼後、有用到的像素平均；512 取樣正式烘）：
| | 白天 | 晚上 | 過曝 |
|---|---|---|---|
| SUNNY SIDE | 0.39 | 0.31 | 0.1% |
| 小路 | 0.28 | 0.26 | 0% |
| 木曜日 | 0.30 | 0.30 | 0% |
| 一盞 | | | |
| 日常失速 | | | |
| 阿德影印 | | | |
| （參考）燒臘／書屋 | 0.44／0.36 | 0.46／0.29 | |

## 測試（Node，D131）
（跑完補）

## 還沒驗
1. **遊戲內**（CC 拍、BB 判）：六間白天、晚上，從店門往裡看、往窗外看。
2. 光照貼圖和即時光的家具接得順不順（家具、書櫃用即時光，牆和地用光照貼圖）。
3. GPU 顏色、手機效能（PC）。
