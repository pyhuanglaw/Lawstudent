# 東南大聯商行 CC0 v2（SHOP-REALISM-1112；D159／D160／D161；LAWWW2-C 2026-11-13）

v1 我自己判不過（貨架一樣大小的彩色方塊排格子、櫃台上方一串串零食變成大色塊），這版重做貨架上的東西：
- **包裝印刷**：自己畫一張包裝貼圖集（泡麵袋：碗＋麵條＋配料；零食：洋芋片／蝦餅；乾貨：透明窗看得到米粉；盒裝：色塊＋圓圖；每種 8 款），每一包正面隨機貼一款——不寫字（假字是一條條色塊）、不像任何品牌（D77）。
- **不再整齊排格子**：同一種也高低不一、偶爾一格空的（賣掉了）、有一段往後推（前排被拿走）。
- **罐頭** → Poly Haven `russian_food_cans_01`（三罐一組、有標籤，大小角度略不同、一兩層疊）；**米袋** → Poly Haven `cement_bag`（上成米白、保留布紋皺摺）；收銀機、塑膠籃照 v1（Poly Haven）。
- **櫃台上方一串串零食**：一條塑膠夾條＋一包包 9×11 cm 小包（封口、白標籤、數量不一）。
- 天花板輕鋼架、玻璃上緣墨綠色帶進材質組；純色零件 20.8%。
- 互動點、座位、導航沒動（tz_dongnan_aa823、notrap 照過）。

**檔案**：`dongnan_v2.patch`（底＝開發分支 `556daa6486`，`git apply --cached --check` 過）：GLB、json、光照貼圖兩張、`lightbake/tz_dongnan_interior_lm.json`、`tz_shops_interior.py`、`LICENSES.md`、`tests/shop_cc0_baseline.json`。`SHOP_STANDARD_STATUS.md` 請 `--write`。
**測試**：tz_shops_unit、shop_cc0_unit（三項都過、基準表拿掉東南大聯）、notrap、shop_views、front_lit、tz_dongnan_aa823、shop_real_inside、tingzhou、tingzhou_places ALL PASS。
**截圖**：`cmp_dongnan_v2.jpg`（最上面概念圖）、`v2_dongnan_shelf_close.jpg`（貨架近看）。
**面數**：11.8 萬（v1 舊版 8.6 萬；大部分是原本的貨品頂點色 6.7 萬）——超過 HOWTO 寫的大店 8 萬，手機效能請 CC 量；要降我再把瓶子、杯麵的面數減一半。

**還沒改到的（我自己看到的）**：走道兩端的端架招牌還是黃底紅條的純色板；櫃台上方的零食串從斜看還是偏大。下一輪（或 BB 判 FAIL）一起改。
