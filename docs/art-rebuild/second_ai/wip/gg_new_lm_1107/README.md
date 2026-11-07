# 公館三間店：光照烘焙＋窗外的景（洋洋鹹酥雞、轉角唱片、日和便利店）（LAWWW2-B 2026-11-07）

**派工**：
- LAWWW-B 14:51：AA／BB 新做的店（lm_audit_1107 第一級）**直接在原檔上烘**。
  - 只加第二套 UV、`extras.lightmap`、拆開共用的材質；不動幾何、節點、座標、配置。
  - 記原檔 sha256，交件列「動了誰做的哪個檔」。
- LAWWW-B 15:35：插隊烘，順序洋洋 → 轉角唱片 → 便利商店。
  - 「兩間的 GLB 都沒有窗外的景（view card），從店裡看玻璃外面是空的，烘的時候順便看要不要補一張（照 afar 的做法）。CC 拍、BB 判。」
- BB-B 16:04（判開發分支 `e66781d1f` 的轉角唱片）：
  - P2：天花板切掉時，樑、燈盒、招牌從上面擋住畫面；
  - P3：鏡頭在東側時，右牆整組一起淡出，只剩黃金葛架沒跟著。

**狀態**：READY_FOR_ART_REVIEW（場景：BB／使用者判）。瀏覽器沒跑（D131），遊戲內畫面要 CC 拍。

（三間的數字、測試結果寫在下面各節；烘完補齊。）

## 動了誰做的哪個檔

| 檔案 | 原作者 | 原檔 sha256 | 動了什麼 |
|---|---|---|---|
| `bb_support/cvs_interior.glb` | BB（帳號 A） | `cb5efc95…` | 加第二套 UV、`extras.lightmap`、拆開共用材質（`bake_room.py`）；幾何、節點不動 |
| `bb_support/yangyang_interior.glb` | BB（帳號 A），`e5e9351e0` | `1e030a66…` | 同上；另外**加一個節點**：窗景卡 `WALL_front_VIEW_yy_window_view`（LAWWW-B 15:35） |
| `bb_support/corner.glb` | CC（帳號 A）v1c，`cc-testing 4fc38d513` | 開發分支 `fe406b44…`（＝我 38f4021e1 改過的） | ① 改 `corner_interior.py` 重產（BB-B 16:04 P2／P3）② 烘光照 ③ 加窗景卡 `WALL_front_VIEW_cr_window_view` |
| `tools/blender/env_second/bb_support/corner_interior.py` | CC | — | 第二次改（CORNER-CEIL／FADE-1107），檔頭寫了誰改、為什麼 |

原作者以後重新匯出，光照貼圖、窗景卡會不見，要再跑一次 `bake_gg_new.sh <店>`（窗景卡在裡面一起加）。
