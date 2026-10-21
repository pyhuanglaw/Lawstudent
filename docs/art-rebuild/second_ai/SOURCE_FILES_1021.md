# 原始檔清單（清查 A4）：LAWWW2 分支有、開發分支沒有或比較舊

LAWWW2-C，2026-10-21。
- 比較的兩邊：我的分支 `claude/focused-cray-c9uwvw`、開發分支 `382236a5`。
- 判斷「比較新」的方法：對方的 blob 出現在我這邊這個檔案的歷史裡。
- 「開發分支比較新」的不列，例如 `lane118_shops.py`、312／409／507 窗景：**不要用我的分支蓋回去**。
- **這些檔案都不影響遊戲執行**（遊戲只讀 GLB、配置 JS）。
- 進開發分支的好處：以後重匯、修改找得到原始腳本（D88、LICENSES 寫的來源路徑才對得上）。
- 請 LAWWW-C 一次挑，用 `git checkout claude/focused-cray-c9uwvw -- <檔案>`。

## A. 建議拿：開發分支已經整合的 GLB、背景的原始腳本與配置（54 個）
- 包括：
  - 美國篇（`us_*`）、機場（`airport_*`）、萬才館研討室 A（`wancai_seminar.py`）；
  - 體育館典禮背景用的 `vrm_crowd.py`；
  - 程序貼圖（`shopkit_tex.py`、`shops_tex.py`、`sign_atlas.py`、`park_tex.py`、`cvs_goods.py`）；
  - 算圖背景（`bg_car.py`、`bg_kh.py`、`bg_trip_mountain.py`、`bg_playground.py`、`bg_video_far.py`、`bg_paint.py`）；
  - 「我的比較新」的腳本（Café、男一舍 5 層、霖澤館 3F／4F、宿舍、超商、機車、溫州街道具…）。
- 「我的比較新」的腳本，開發分支裡的 GLB 和我的分支相同，所以 GLB 就是新腳本匯出的，腳本照理該一起進。抽查過：
  - Café 內外、大一女舍、男一舍、超商、宿舍、溫州街道具、機車、霖澤館 3F／4F。

| 狀況 | 檔案 | 我的 blob | 開發分支 blob |
|---|---|---|---|
| 開發分支沒有 | `assets/models/env/second_ai/airport_t2.layout.json` | `ac0ab1cd` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_asian_market.layout.json` | `99553429` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_community.layout.json` | `ec085e7d` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_market.layout.json` | `235341f5` | — |
| 開發分支沒有 | `tools/blender/env_second/airport_layout_gen.py` | `1c9efd8d` | — |
| 開發分支沒有 | `tools/blender/env_second/airport_t2.py` | `34c94ebc` | — |
| 開發分支沒有 | `tools/blender/env_second/airport_tex.py` | `a18da34a` | — |
| 開發分支沒有 | `tools/blender/env_second/bg_car.py` | `637f90af` | — |
| 我的比較新 | `tools/blender/env_second/bg_gym_ceremony.py` | `4c501cec` | `373f7f03` |
| 開發分支沒有 | `tools/blender/env_second/bg_kh.py` | `fb95fc01` | — |
| 開發分支沒有 | `tools/blender/env_second/bg_paint.py` | `51c28beb` | — |
| 開發分支沒有 | `tools/blender/env_second/bg_playground.py` | `0d9d3c5d` | — |
| 開發分支沒有 | `tools/blender/env_second/bg_trip_mountain.py` | `13532527` | — |
| 開發分支沒有 | `tools/blender/env_second/bg_video_far.py` | `0d463b3d` | — |
| 我的比較新 | `tools/blender/env_second/bike_ride.py` | `6967a9e3` | `a9374646` |
| 我的比較新 | `tools/blender/env_second/cafe_exterior.py` | `af632a82` | `9b0a4d0a` |
| 我的比較新 | `tools/blender/env_second/cafe_layout.py` | `c2e6533d` | `7edc62d9` |
| 我的比較新 | `tools/blender/env_second/campus_freshman.py` | `9ffabd3c` | `cc21626e` |
| 我的比較新 | `tools/blender/env_second/campus_male1.py` | `68c4eb0e` | `57f9d26c` |
| 開發分支沒有 | `tools/blender/env_second/cvs_goods.py` | `a8e5b948` | — |
| 我的比較新 | `tools/blender/env_second/cvs_interior.py` | `5d452f98` | `50dcb245` |
| 我的比較新 | `tools/blender/env_second/dorm_interior.py` | `a70e1244` | `40deac82` |
| 開發分支沒有 | `tools/blender/env_second/gen_us_layouts.py` | `b19ea66c` | — |
| 我的比較新 | `tools/blender/env_second/linze_upper.py` | `80e096df` | `3b4269fc` |
| 開發分支沒有 | `tools/blender/env_second/park_tex.py` | `7f0ee13b` | — |
| 我的比較新 | `tools/blender/env_second/render_cycles.py` | `facec1e6` | `882d8c3e` |
| 我的比較新 | `tools/blender/env_second/scooter.py` | `bc688eda` | `924f125f` |
| 開發分支沒有 | `tools/blender/env_second/shopkit_tex.py` | `ce29895d` | — |
| 開發分支沒有 | `tools/blender/env_second/shops_tex.py` | `54369240` | — |
| 開發分支沒有 | `tools/blender/env_second/sign_atlas.py` | `cc334d53` | — |
| 開發分支沒有 | `tools/blender/env_second/us_apartment.py` | `f52829ab` | — |
| 開發分支沒有 | `tools/blender/env_second/us_asian_market.py` | `e0862239` | — |
| 開發分支沒有 | `tools/blender/env_second/us_asian_market_layout_gen.py` | `c3057490` | — |
| 開發分支沒有 | `tools/blender/env_second/us_asian_market_tex.py` | `6bc74a7f` | — |
| 開發分支沒有 | `tools/blender/env_second/us_campus.py` | `9eccd648` | — |
| 開發分支沒有 | `tools/blender/env_second/us_campus_kit.py` | `9eaee351` | — |
| 開發分支沒有 | `tools/blender/env_second/us_campus_layout_gen.py` | `8a951214` | — |
| 開發分支沒有 | `tools/blender/env_second/us_cars.py` | `d12fbd6d` | — |
| 開發分支沒有 | `tools/blender/env_second/us_community.py` | `d531fc7d` | — |
| 開發分支沒有 | `tools/blender/env_second/us_community_layout_gen.py` | `4be162c0` | — |
| 開發分支沒有 | `tools/blender/env_second/us_law_kit.py` | `9e0e451f` | — |
| 開發分支沒有 | `tools/blender/env_second/us_lawlib.py` | `5c25effe` | — |
| 開發分支沒有 | `tools/blender/env_second/us_lawlib_layout_gen.py` | `74924bbf` | — |
| 開發分支沒有 | `tools/blender/env_second/us_lawlib_tex.py` | `244ef27c` | — |
| 開發分支沒有 | `tools/blender/env_second/us_market.py` | `c04e26ac` | — |
| 開發分支沒有 | `tools/blender/env_second/us_market_layout_gen.py` | `c8c41807` | — |
| 開發分支沒有 | `tools/blender/env_second/us_market_tex.py` | `f4d64ec7` | — |
| 開發分支沒有 | `tools/blender/env_second/us_oldcampus_kit.py` | `2418a521` | — |
| 開發分支沒有 | `tools/blender/env_second/us_season.py` | `bcecf610` | — |
| 開發分支沒有 | `tools/blender/env_second/us_season_tex.py` | `343a1a21` | — |
| 開發分支沒有 | `tools/blender/env_second/vrm_crowd.py` | `7c0621a9` | — |
| 開發分支沒有 | `tools/blender/env_second/wancai_seminar.py` | `dc12699b` | — |
| 我的比較新 | `tools/blender/env_second/wz_props.py` | `7d6afa18` | `baca7e23` |
| 我的比較新 | `tools/blender/env_second/wz_road_tex.py` | `459e7136` | `006fd1c7` |

## B. 這次交件（體育館光暈＋疊面，09324bda）：和換 GLB 一起拿
| 狀況 | 檔案 | 我的 blob | 開發分支 blob |
|---|---|---|---|
| 我的比較新 | `tools/blender/env_second/gym_b1.py` | `70c1a722` | `ff03e459` |
| 我的比較新 | `tools/blender/env_second/gym_interior.py` | `00f226b0` | `6dc0d22f` |
| 我的比較新 | `tools/blender/env_second/gym_tex.py` | `ac0053cb` | `49487a11` |

## C. 不要拿
- 日本宿舍 3D：暫停，使用者 10-18 決定全 2D。
- 社科院 1F 室內 `socbldg_*`、美國街道 `us_street`：沒有整合。
- 法院、戲院、咖哩店第五版：2D 歸 BB。
- 草稿、研究、角色審查、測試紀錄：留在我的分支就好。

| 狀況 | 檔案 | 我的 blob | 開發分支 blob |
|---|---|---|---|
| 開發分支沒有 | `assets/models/env/second_ai/court_props.json` | `ffc5b35c` | — |
| 開發分支沒有 | `assets/models/env/second_ai/jp_room.json` | `d54f509b` | — |
| 開發分支沒有 | `assets/models/env/second_ai/jp_room.layout.json` | `20777d5f` | — |
| 開發分支沒有 | `assets/models/env/second_ai/socsci_bldg1f.json` | `ca5721eb` | — |
| 開發分支沒有 | `assets/models/env/second_ai/socsci_bldg1f.layout.json` | `d20124d1` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_street.json` | `e1d4e248` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_street.layout.json` | `ae1ef766` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/jiahao/README.md` | `e165a4d2` | — |
| 我的比較新 | `docs/art-rebuild/second_ai/char_review/npc_crowd/README.md` | `795c5694` | `2985c798` |
| 我的比較新 | `docs/art-rebuild/second_ai/char_review/peishan/README.md` | `0ff591a2` | `a04744bb` |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/pinyu/README.md` | `329eafe4` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/prof_wei/README.md` | `ca0ecf46` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/tangrui/README.md` | `6a0573d4` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/weilun/README.md` | `2caa8fcc` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/xun/README.md` | `ea73d35b` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/char_review/yu/README.md` | `f8a5b0b8` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/d88/audit.py` | `b0624948` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/d88/lines.py` | `4b34cc7d` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/drafts/bg_adv_shot.py` | `62c62ac1` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/drafts/c13_night_shots.py` | `a8defdb9` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/drafts/npc_crowd_shot.py` | `34c51de2` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/drafts/phone_diag.py` | `ef9b6fbe` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/research/nccu_campus_path.md` | `48f1165d` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/research/nccu_library.md` | `4c25761e` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/research/nccu_real_shops.md` | `661320bb` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/research/us_apartment_photos.md` | `15aece08` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/research/us_campus_street.md` | `9e93e443` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/research/vehicles_research.md` | `a670a22a` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/lawww2_results_v97.md` | `d9cf4488` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/v96_rc13_ba435d5/README.md` | `6c6eae80` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/v97_636688f/README.md` | `bd04740b` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/v97_rc14_fd46e14/README.md` | `575ec77a` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/v97_rc16_52f288e/README.md` | `e897580d` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/v97_rc19_313d620/README.md` | `176caf40` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/test_logs/v97_rc3_8ac75f6/README.md` | `0e2e86df` | — |
| 我的比較新 | `tools/blender/env_second/bg_cinema.py` | `1806a40c` | `50c49c4e` |
| 開發分支沒有 | `tools/blender/env_second/bg_court.py` | `b6e352c3` | — |
| 開發分支沒有 | `tools/blender/env_second/bg_courthouse.py` | `4e91c7ad` | — |
| 我的比較新 | `tools/blender/env_second/bg_curry.py` | `16969491` | `a2fae34f` |
| 開發分支沒有 | `tools/blender/env_second/court_props.py` | `dbef11ae` | — |
| 開發分支沒有 | `tools/blender/env_second/gen_jp_layouts.py` | `a6be489a` | — |
| 開發分支沒有 | `tools/blender/env_second/jp_dorm.py` | `241fabfd` | — |
| 開發分支沒有 | `tools/blender/env_second/jp_view.py` | `7bc72ce8` | — |
| 開發分支沒有 | `tools/blender/env_second/socbldg_interior.py` | `0a47cd44` | — |
| 開發分支沒有 | `tools/blender/env_second/socbldg_layout_gen.py` | `bfb8b103` | — |
| 開發分支沒有 | `tools/blender/env_second/us_street.py` | `2df66ac0` | — |
| 開發分支沒有 | `tools/blender/env_second/us_street_layout_gen.py` | `fc7954bb` | — |
| 開發分支沒有 | `tools/blender/env_second/us_street_tex.py` | `7d66ee81` | — |

## D. 文件（建議拿 `ART_SOP.md`、`SCENE_RULES.md`、`ART_DIRECTOR_PATROL.md`、`BACKLOG_SWEEP_1021.md`；其他看需要）
| 狀況 | 檔案 | 我的 blob | 開發分支 blob |
|---|---|---|---|
| 開發分支沒有 | `docs/art-rebuild/second_ai/ART_DIRECTOR_PATROL.md` | `5466e931` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/ART_SOP.md` | `94435cb9` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/ASSET_AUDIT_2026-10-16.md` | `72eb6fd5` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/BACKLOG_SWEEP_1021.md` | `0d2c1076` | — |
| 我的比較新 | `docs/art-rebuild/second_ai/BG_TRACKER.md` | `cd5337ad` | `09fc4864` |
| 開發分支沒有 | `docs/art-rebuild/second_ai/BRANCH_CLEANUP_D88.md` | `208147de` | — |
| 我的比較新 | `docs/art-rebuild/second_ai/HANDOFF.md` | `b2533d11` | `86dac2d8` |
| 開發分支沒有 | `docs/art-rebuild/second_ai/LINZE_WANCAI_FLOORS_PLAN.md` | `1d48561a` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/SCENE_RULES.md` | `35cdb138` | — |
| 開發分支沒有 | `docs/art-rebuild/second_ai/US_EXCHANGE_PLAN.md` | `4ec4b07f` | — |
| 我的比較新 | `docs/art-rebuild/second_ai/WORK_RULES.md` | `7ed6d94b` | `529118f7` |
| 開發分支沒有 | `docs/art-rebuild/second_ai/sop_demo/README.md` | `cee619c6` | — |

## E. 其他（GLB 的統計 `.json`、支援素材的清單；可以不拿）
| 狀況 | 檔案 | 我的 blob | 開發分支 blob |
|---|---|---|---|
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/park2_props.json` | `8d5ccf1e` | — |
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/soy_props.json` | `48001a9f` | — |
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/us_bath_props.json` | `3824cf71` | — |
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/us_kitchen_props.json` | `4cb32f3a` | — |
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/us_living_props.json` | `7a92f652` | — |
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/wz6_items.json` | `59af903a` | — |
| 開發分支沒有 | `assets/models/env/second_ai/aa_support/wz7_street_props.json` | `e9723d07` | — |
| 開發分支沒有 | `assets/models/env/second_ai/airport_arr.json` | `ee93cada` | — |
| 開發分支沒有 | `assets/models/env/second_ai/airport_dep.json` | `f7e05311` | — |
| 開發分支沒有 | `assets/models/env/second_ai/bb_support/gym_b1_entry.json` | `b05adee6` | — |
| 開發分支沒有 | `assets/models/env/second_ai/bb_support/gym_b1_props.json` | `f917bb97` | — |
| 開發分支沒有 | `assets/models/env/second_ai/bb_support/park3_props.json` | `bd81f43f` | — |
| 開發分支沒有 | `assets/models/env/second_ai/bb_support/scooter_shop_props.json` | `3b4b998f` | — |
| 開發分支沒有 | `assets/models/env/second_ai/bb_support/tutor_props.json` | `4a0a4cf3` | — |
| 開發分支沒有 | `assets/models/env/second_ai/bb_support/us_bedroom_props.json` | `ac11a2b0` | — |
| 我的比較新 | `assets/models/env/second_ai/gym_b1.json` | `66842dcf` | `0035d84e` |
| 我的比較新 | `assets/models/env/second_ai/gym_interior.json` | `ab8f4144` | `71b598af` |
| 開發分支沒有 | `assets/models/env/second_ai/us_asian_market.json` | `c5959d8f` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_campus.json` | `7b44bdf7` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_cars.json` | `4433fa99` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_community.json` | `cf0779ca` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_lawlib.json` | `456f0344` | — |
| 開發分支沒有 | `assets/models/env/second_ai/us_market.json` | `dc320551` | — |
| 我的比較新 | `tools/blender/env_second/aa_support/README.md` | `c0fde7a0` | `545a1bf3` |
| 開發分支沒有 | `tools/blender/env_second/aa_support/cat_views_eyes.json` | `772f0c15` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/park2_game_shots.json` | `f96bf14d` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/park2_props.py` | `b0e3b776` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/park2_views.json` | `a8f0ba81` | — |
| 我的比較新 | `tools/blender/env_second/aa_support/render_wz6.py` | `c6dd8e31` | `3659a8d8` |
| 開發分支沒有 | `tools/blender/env_second/aa_support/soy_props.py` | `8a1f8119` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/soy_views.json` | `b2016f26` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/us1_views.json` | `f5a675b7` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/us2_views.json` | `79a8a4bf` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/us4_views.json` | `d79f61e7` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/us_bath_props.py` | `18803ecb` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/us_kitchen_props.py` | `dbad780e` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/us_living_props.py` | `6ebbd951` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/wz6_items.py` | `9a184524` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/wz6_views.json` | `693844d9` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/wz7_street_props.py` | `8eca5052` | — |
| 開發分支沒有 | `tools/blender/env_second/aa_support/wz7_views.json` | `b6feb135` | — |
| 我的比較新 | `tools/blender/env_second/aa_support/wz_cat.py` | `0476eb93` | `aab5efa4` |
| 我的比較新 | `tools/blender/env_second/bb_support/README.md` | `35a8b65b` | `9f83544b` |
| 開發分支沒有 | `tools/blender/env_second/bb_support/gym_b1_entry.py` | `53f84668` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/gym_b1_props.py` | `58876aaa` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/gym_entry_views.json` | `dd0a29da` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/gym_views.json` | `10bd00e3` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/park3_props.py` | `a49c59d8` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/park3_views.json` | `c63fc80c` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/render_dusk.py` | `efd50fc5` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/scooter_shop_props.py` | `e5d98cd2` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/scooter_shop_views.json` | `09e71faa` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/tutor_props.py` | `7ee7cfda` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/tutor_views.json` | `dcd6f77b` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/us3_views.json` | `6f7f5410` | — |
| 開發分支沒有 | `tools/blender/env_second/bb_support/us_bedroom_props.py` | `f969b39d` | — |
| 開發分支沒有 | `tools/blender/env_second/shots/bike_shop_door_check.py` | `266c6119` | — |
| 我的比較新 | `tools/blender/env_second/shots/fast_shots.py` | `ce65e081` | `338c6ce3` |
| 開發分支沒有 | `tools/blender/env_second/shots/glbstat.py` | `3ece2eac` | — |
| 開發分支沒有 | `tools/blender/env_second/shots/park_plan.py` | `9d6ac181` | — |
| 開發分支沒有 | `tools/blender/env_second/shots/polish0_before.json` | `86cf0a1a` | — |
| 開發分支沒有 | `tools/blender/env_second/shots/polish_tonemap.json` | `bd02eb1f` | — |
| 我的比較新 | `tools/blender/env_second/shots/pothos_dorm_shots.py` | `6daa8e30` | `b9430c3e` |
| 開發分支沒有 | `tools/blender/env_second/shots/wz_perf.py` | `adc1b5a4` | — |
| 開發分支沒有 | `tools/blender/env_second/textures/gen/gg_signs_atlas.json` | `132c3c3e` | — |
| 開發分支沒有 | `tools/blender/env_second/textures/gen/l118_road.json` | `c4069730` | — |
| 開發分支沒有 | `tools/blender/env_second/textures/gen/wz_road_atlas.json` | `f2edac25` | — |
| 開發分支沒有 | `tools/blender/env_second/textures/gen/wz_signs_atlas.json` | `be89ca90` | — |
