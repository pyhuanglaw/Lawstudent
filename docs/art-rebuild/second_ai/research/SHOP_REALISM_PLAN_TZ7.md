# SHOP-REALISM-1112 第二批：汀州路七間（＋公館三間）店內，方塊 → 掃描模型／材質組 對照表（LAWWW2-C 2026-11-12）

做法照溫特寶邸樣板（`tz_wente_interior.py`）：`cc0_fetch.ph_place` 放 Poly Haven 掃描模型；`mat_acg` 套 ambientCG 材質組；所有燈光一起用 Cycles 烘進一張貼圖。
這些店都在同一支腳本 `tools/blender/env_second/tz_shops_interior.py`（1311 行）。現在店內的東西都是 `ccyl`、`blob`、`box`、`goods`、`gondola` 拼的純色方塊和圓柱。

| 現在的方塊函式 | 換成 | 用在 |
|---|---|---|
| `chair()`（木椅：4 支圓柱＋1 塊板） | Poly Haven `dining_chair_02`、`WoodenChair_01`、`painted_wooden_chair_01`（每間挑一種） | 泰米、越好吃、客居 |
| `table_set()`（桌面＋1 支腳） | `round_wooden_table_01`／`round_wooden_table_02`／`WoodenTable_01`／`small_wooden_table_01` | 泰米、越好吃、客居 |
| 吧台圓凳 | `bar_chair_round_01`、`metal_stool_01～03` | 聯通（坐著等）、客居 |
| `pendant()`（圓錐燈罩） | `hanging_industrial_lamp`、`caged_hanging_light`、`modern_ceiling_lamp_01` | 每一間 |
| `fern()`、`blob()` 的盆栽 | `potted_plant_01`、`potted_plant_02`、`potted_plant_04`、`planter_box_01～03` | 泰米、客居、越好吃、門口 |
| `goods()`（一排彩色方塊＝商品） | 真的包裝：`long_life_food`、`russian_food_cans_01`、`plastic_bottle_gallon`、`cardboard_box_01`、`wine_bottles_01`、`jug_01`、`cleaner_tin_01`、`multi_cleaner_bottle`；包裝印刷面用 ambientCG／自製印刷貼圖（品牌名不寫、不像任何品牌，D77） | 東南大聯（BB 已 FAIL：彩色方塊）、印得好 |
| `gondola()`（純色貨架） | `steel_frame_shelves_01～03`、`worn_metal_rack`、`wooden_display_shelves_01` | 東南大聯、印得好、洗樂 |
| 櫃台（方塊） | 倒角＋木頭／石材材質組；收銀機 `CashRegister_01` | 每一間 |
| 餐具、碗盤 | `wooden_bowl_01/02`、`ceramic_pot`、`tea_set_01`、`jug_01` | 泰米、越好吃、客居 |
| 食物（展示） | `croissant`、`bananas`、`food_apple_01`、`food_lime_01`、`lemon` | 泰米、東南大聯 |
| 手機殼牆（薄彩色長方塊，BB 待判） | 自製：倒角圓角殼＋印花貼圖、掛勾；牆用 `peg board` 材質組 | 聯通 |
| 洗衣機（方塊＋圓） | 自製：倒角機身＋玻璃門（車削）＋金屬材質組；`plastic_crate` 洗衣籃 | 洗樂 |
| 地板、牆 | ambientCG：`Tiles`、`Terrazzo`、`Wood`、`Plaster`、`Concrete`（每間照參考圖挑） | 每一間 |

順序（LAWWW-C 定）：溫特寶邸樣板 → 汀州路 7（泰米、洗樂、印得好、聯通、東南大聯、客居、越好吃）→ 新生南路 6 → 公館 → 118 巷 9 → 溫州街。
腳本裡另外三間（antai、xianguo、rongendian）是公館的，跟著公館那一批做。
每一間交件附遊戲內同鏡頭和參考圖並排三組（進門全景、櫃台、近照），LAWWW-C 先看圖、BB 判。
