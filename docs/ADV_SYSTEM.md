# ADV SYSTEM（3D × 2D Visual Novel Hybrid）

程式：`src/adv3d.js`（`ADV`＝ADVSceneManager＋PortraitRegistry 解析）、`src/events3d.js`（事件執行器）、`src/game3d.js`（`GM.say / GM.choose / sceneBegin / sceneEnd` 共用對話框與選項）。

## 流程

```
3D EXPLORATION → 觸發（auto / interact / enter 或劇本呼叫）
→ GM.sceneBegin()（鎖玩家、藏 HUD）→ ADV.begin({background, right, left, cg})
→ 背景：freeze（3D 畫面停止）| blur（backdrop-filter 模糊＋壓暗）| {image}（2D 背景圖；不存在自動退回 blur）
→ 每一行：ADV.speaker(charId, expression) → 立繪切換（crossfade 120ms）、非說話者變暗；GM.say() 打字機對話框；旁白無名牌
→ 選項：GM.choose()（排在主要立繪的另一側，不遮臉）
→ 後果：flags / memory / relationship / knowledge / professor / grad
→ ADV.end() → GM.sceneEnd() → 回到 3D，NPC 繼續日程
```

三種背景皆已實作。ADV 期間 3D 仍在渲染（freeze 模式可看到人物）。

## 畫面元素

- `#adv`（z-index 5，位於 3D canvas 之上、UI 之下）：`#advBg`、`#advL`／`#advR` 立繪槽、`#advTop`（紀錄／略過對話）、`#advHist`（對話歷史）。
- 對話框 `#dlg`、名牌 `#dlgName`、選項 `#choices` 由既有 UI 提供（z-index 6）。
- 手機：橫向立繪高 88%、寬 42%；直向立繪寬 70%、高 62%，選項全寬。safe-area 由 `env()` 處理。
- tap to continue ✔、choice ✔、text reveal ✔（速度可設定）、skip ✔（略過對話＝立即顯示整段）、history ✔、auto ✘（未做）。

## Portrait Registry（`PORTRAITS`，由 `src/data/characters.js` 依 visual_tier 自動生成）

```js
PORTRAITS['heroine_03'] = { characterId, displayName, tier:3, defaultOutfit:'campus', defaultPortrait:'assets/portraits/heroine_03/campus/neutral.webp',
  outfits:{ campus:{neutral:'assets/portraits/heroine_03/campus/neutral.webp', smile:…, laugh, surprised, embarrassed, annoyed, sad, serious, tired, thinking}, casual:{…}, formal:{…} }, silhouette:'f' }
```
Tier 3：outfits campus/casual/formal × 10 表情；Tier 2：campus × 6（neutral, smile, annoyed, surprised, sad, thinking）；Tier 1：campus × 2（neutral, smile）；Tier 0：無立繪。

解析與 fallback（`ADV.resolve`）：requested expression → 同 outfit neutral → defaultPortrait → PLACEHOLDER_2D_PORTRAIT（名稱＋輪廓＋`character_id · outfit · expression` 標籤）。載入失敗記錄 warning，不會 crash。

載入：lazy（第一次顯示時才載入該表情）；`ADV.preload(charIds)` 在事件開始前預載 neutral；失敗的 URL 記在 `ADV.missing` 不重試。目前所有圖片皆不存在（尚未提供），全部走 placeholder。

## 對話行與表情

事件對話行：`{speaker, text, expression, outfit, position}`（見 STORY_EVENT_SCHEMA.md）。劇本程式碼路徑（story3d.js 的舊劇情）用 `GM.say(npc, text, {expr})`，`expr`（P3 表情：normal/smile/laugh/surprise/worried/shy）會同時對應到 3D 表情與 ADV 表情（neutral/smile/laugh/surprised/sad/embarrassed）。

## Event CG

`CG_REGISTRY[cg_id] = {file, title}`（`src/adv3d.js` 末尾）。事件 `cg_id` 或 consequences.cg 呼叫 `ADV.cg(id)`：圖片載入成功才切換為全畫面 CG 並寫入 `G.cg.unlocked`；不存在則維持一般 ADV。CG Gallery UI 未做，解鎖狀態已存檔。

## 玩家角色

第一人稱 VN 慣例：玩家沒有立繪，透過選項說話；`speaker:'player'` 的行顯示玩家名字的名牌。架構保留 `PORTRAITS.player`（未定義；定義後即可用 ADV.show('left','player')）。

## 與 3D 的身份一致

同一 `character_id` 連結 3D 模型（`CHARACTERS[id].char3d`）、立繪（`PORTRAITS[id]`）、日程、關係、記憶、事件、存檔。替換 `char3d.model` 或立繪檔案不影響 gameplay 狀態。


## 2026-09-27 更新：compact 模式與 production 判定

- `PORTRAIT_FILES`（`src/data/portrait_manifest.js`，由 `tools/gen_portrait_manifest.py` 掃 `assets/portraits/` 產生，`build.py` 自動執行）記錄實際存在的立繪。
- `ADV.hasProductionPortrait(charId)` / `ADV.portraitQuality(charId)` → 'production' | 'temporary' | 'missing'。
- `render()`：有檔案 → 立繪模式（全身圖，直向：頭在上、對話框壓住腿；橫向：132% 放大成膝上取景）。沒有 → 該 slot 不顯示，`#adv` 加 `compact`（無任何 silhouette）；`ADV.devMode`（URL 含 `?dev`／`?mdbg`）才在右上顯示 `MISSING_PORTRAIT` 標籤。
- 兩人場景一人有圖一人沒圖：有圖的照常顯示，沒圖的只出現在對話框的名字。
