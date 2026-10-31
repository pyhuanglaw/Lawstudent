# 美國竹葉亞洲超市（us_asian_market）室內光照烘焙＋天花板方向（INTERIOR-AAA-REVIEW-1028 美國那一批；LAWWW2-B 2026-10-31）

- **起因**：INTERIOR-AAA-REVIEW-1028 第 5 節 P1（光照）。美國室內第三間（公寓 → 法學院圖書館 → 亞洲超市）。
- **狀態**：`READY_FOR_ART_REVIEW`。建築、場景只有使用者能標 `ART_APPROVED`。
  - 截圖是 Playwright＋SwiftShader（電腦 1280×720），不是實機。
  - 讀檔放位置、藏玩家和 NPC 是 [捷徑]。

## 一、怎麼套（給 LAWWW-B）

1. **換二進位**（從我的分支 `claude/funny-albattani-iawshm` 拿）：
   - `assets/models/env/second_ai/us_asian_market.glb`；
   - 新的 `us_asian_market_lm_day.webp`、`us_asian_market_lm_night.webp`。
   - `us_asian_market.json` 不用換。
2. **不用改程式**：us3d.js 的 us_asian_market 區域走 `Z3.attachRoomGLB`，看到 GLB 的 `extras.lightmap` 就接。
   - 鏡頭比天花板高時藏的天花板、輕鋼架、燈盤（`usam_ceiling`、`usam_grid`、`GLOW_usam_troffers`）照舊在；門外的景（`usam_view`）照舊由 `viewTint` 照時段調。
3. **patch**：`docs/art-rebuild/second_ai/patches/us_interiors_lm_1031.patch`（只有測試；三間一包）。
   - 新 `tests/us_asian_market_lm_unit.js`：開發分支原樣 FAIL 2，改後 ALL PASS。
   - `tests/singleside_us_unit.js` 第 2 項：有光照貼圖的開口零件（亞洲超市的層架、公寓的窗簾）改到 2b「烘過、沒有反面」（和 singleside_gym_unit 的 2b 同一個做法）。開發分支原樣、改後都 ALL PASS。
4. **工具**（只在我的分支）：`bake_us.sh market`、`bake_room.py`、鏡頭 `shots/us_rooms_lm_shots.py`、烘焙紀錄 `us_asian_market_lm.json`、`us_asian_market.py`（天花板方向）。

（第二節以後：定案版的數值、截圖、效能補上後完成）
