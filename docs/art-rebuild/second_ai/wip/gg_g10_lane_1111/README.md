# GG-G10-LANE-MOUTH-1111 公館 G10 改成真的巷口 第 1 版（LAWWW2 帳號 A，2026-11-11）

狀態：**READY_FOR_REVIEW（已交付 LAWWW）**。預覽是 Blender，不是遊戲截圖（D131）。
- 依據：使用者 11-11 01:1x 選擇題選「改成真的巷口」（UA-LAWWW2-1111-06；題目和三個選項的原文在那一筆）。取代 X335 裡 G10 的鐵捲門；G09 照舊鐵捲門。
- patch：`gg_g10_lane_v1.patch`（9 個檔；基底 dev `4a0a2d69b`）。預覽：`blender_g10_lane.jpg`（左：從馬路正對 G10；右：站在騎樓裡斜著看）。

## 做了什麼
| 檔案 | 內容 |
|---|---|
| `tools/blender/env_second/wz_street.py` | 公館 `GG_XS['G10']` 從 `shut` 改 `lane`（通道寬 4.6 m、深 13 m＝穿過整棟）；樓房一樓的牆體在通道範圍打開（原本是一整塊實心，通道會被擋在 1.3 m 的地方）、牆腳護牆也讓開；G10 騎樓中間那根柱子拿掉（例外清單加 10） |
| `tools/blender/env_second/wz_shopkit.py` | `gg_front` 的 `lane`：通道口兩邊的牆（牆腳石材、電表箱、排水管）、通道的兩面側牆、樓板底、地面、通道口上面的樑和一塊綠色巷名牌的底板（**沒有字**：巷名沒有人定過，不自己取）、裡面牆上的管線和三盞壁燈（晚上亮） |
| `assets/models/env/second_ai/gongguan_shops.glb`（7.43 MB、6.69 萬面）＋`.json`、三張磁磚貼圖 | 重建 |
| `src/zones3d.js` | **只改一個數字**：騎樓柱子的例外清單 `[4,5,7,8,11,12,13,14]` 加 10（G10 中間的柱子拿掉，導航、鏡頭碰撞跟著少一根）。LAWWW 的檔，上次 r2 也是這樣改 |
| `tests/tingzhou_unit.js` | 第 13 節三項（新）：設定是巷口、柱子清單兩邊一致、「往汀州路」的互動點在通道口正前方站得住 |

沒動：`GG_PROP_BLOCKS`（28 對 28）、「往汀州路（巷子）」互動點的位置（37.1, 21，在通道口正前方）、導航（人不走進通道，按了就切到汀州路區域）、G09。

## 給 LAWWW
- 套件備用（`zones3d.js` shops 第 10 項 `shut:true`）還是鐵捲門——只有正式模型載入前和載入失敗時看得到；要不要也改成巷口請你決定。
- 如果要讓人真的走進通道一段再切區域：通道在公館座標 x 34.8～39.4、z 22～35，地面 y 0.04；我可以配合把互動點往裡移、導航打開。

## 已知的缺點
- 通道另一頭是開的，看出去是公館區域樓房後面的東西（天空或背景）——**遊戲裡實際看到什麼要 CC 拍**；如果是一片空的，下一版在通道底加一張「汀州路那一頭」的景（從汀州路區域拍的畫面）。
- 巷名牌沒有字。通道裡沒有停機車、盆栽這些雜物（怕擋住視線，先不放）。
- 通道的地面用的是騎樓石材磚，不是柏油。

## 測試
- 全部 `tests/*_unit.js` 1249 支（基底 dev 4a0a2d69b＋這一包；`regression_full.log`）。log 裡四支 FAILED（peishan_termend_1110、te_shefirst_1110、termend_friend_1110、termend_opts_1110）都是「fatal: invalid object name 'bd1a6fda3'」——測試要讀企劃線的 commit，我的容器當時還沒抓到；**沒套 patch 的開發分支上一樣失敗**，`git fetch origin claude/story-planning` 以後四支 ALL PASS，和這一包無關。其他沒有失敗。
- 這一包動到的檔在更新的開發分支（50887dae6）上沒有再變，patch 直接套得上。
- 相關：tingzhou（第 13 節新三項）、street_props_nav、zq_arcade_seat、gg_glow_shoplit、gg_shoplit_reentry、gg_shops3_names、flower_notes、tz_shops ALL PASS。
- 沒有遊戲截圖：請 CC 拍公館 G10 巷口（白天、晚上；從馬路正對、站在騎樓裡往通道裡看——**通道另一頭看到什麼**）。
