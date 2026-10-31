# 美國法學院圖書館（us_lawlib）室內光照烘焙（INTERIOR-AAA-REVIEW-1028 美國那一批；LAWWW2-B 2026-10-31）

- **起因**：INTERIOR-AAA-REVIEW-1028 第 5 節 P1（光照）。美國室內第二間（公寓 → 法學院圖書館 → 亞洲超市）。
- **狀態**：`READY_FOR_ART_REVIEW`。建築、場景只有使用者能標 `ART_APPROVED`。
  - 截圖是 Playwright＋SwiftShader（電腦 1280×720），不是實機。
  - 讀檔放位置、藏玩家和 NPC 是 [捷徑]。
- 模型沒有改（重匯的白模和部署中的一模一樣：三角形數、材質、2,231,712 bytes），只多光照 UV 和 `extras.lightmap`。
  - 烘焙後疊在一起的反面拿掉，四面牆、護牆板、樓梯斜樑留的是朝室內那一面（第二節）。

## 一、怎麼套（給 LAWWW-B）

1. **換二進位**（從我的分支 `claude/funny-albattani-iawshm` 拿）：
   - `assets/models/env/second_ai/us_lawlib.glb`；
   - 新的 `us_lawlib_lm_day.webp`、`us_lawlib_lm_night.webp`。
   - `us_lawlib.json` 不用換。
2. **不用改程式**：us3d.js 的 us_lawlib 區域走 `Z3.attachRoomGLB`，看到 GLB 的 `extras.lightmap` 就接。
   - 天窗、彩色玻璃照舊由 us3d.js 的 `skyTint` 照時段調（GLB 裡沒有 `dayEmit`，不會被 roomLightmap 再調一次）。
   - 二樓開放時要藏的紅絨繩、黃銅柱、小立牌照舊在（`us_lawlib_2f.layout.json` 的 `glb_hide`）；烘焙時當作不存在（影子不烘進地板）。
3. **patch**：`docs/art-rebuild/second_ai/patches/us_interiors_lm_1031.patch`（只有測試；三間一包，見公寓 README）。
   - 新 `tests/us_lawlib_lm_unit.js`：**開發分支原樣 FAIL 3，改後 ALL PASS**。
4. **工具**（只在我的分支）：`bake_us.sh lawlib`、`bake_room.py`（留哪一面的判斷、`--knee`）、鏡頭 `shots/us_rooms_lm_shots.py`、烘焙紀錄 `us_lawlib_lm.json`。

（以下第二節以後，截圖、效能補上後完成）
