# FLOWER-NOTES-ART-1110 花序 Flower Notes（公館 G11）第 1 版・A：室內（D141 第 1／3 版；LAWWW2 帳號 A 2026-11-10）

依據：使用者規格 dev `docs/handoff/user_specs/FLOWER_NOTES_1110.md`（X325）第五、六節；參考圖 `flower_notes_ref/interior_1f.png`、`interior_2f.png`（二樓只參考室內）。
patch：`flower_notes_v1a.patch`（base＝dev `8372e7086`；在 dev `9d28235df` 上 `git apply --check` 乾淨、套上以後 `flower_notes_unit`、`tingzhou_unit` ALL PASS；套完請重跑 `node tools/gen_zone_assets.js`）。

## 這一件有什麼
| 檔案 | 內容 |
|---|---|
| `src/data/flower_notes_layout.js` | 配置（遊戲、Blender 共用）：10×14 m；前半挑高、後半上面是二樓教室（樓板 3.9 m）；樓梯沿東牆一跑往北爬 |
| `src/flower_notes3d.js` | 區域 `flower_notes`：兩層導航、樓梯、備用模型、互動點；公館 G11 門口「進入花序」（包住 gongguan 的 build，不改 zones3d.js）；自己登記 `bldg.flower_notes_interior` |
| `tools/blender/env_second/flower_notes_interior.py` → `flower_notes_interior.glb` | 一樓：中央橢圓展示台（木格柵、石材檯面、櫻花枝、花束）、左牆永生花層架＋展示座、鮮花花束花台、後牆冷藏花櫃、東牆包裝收銀長櫃檯＋包裝紙層架、樓梯（玻璃欄板、香檳金扶手）；二樓：示範長桌、黑板、花器層架、玻璃櫃、三張四人學員桌＋布面木椅、長條吊燈、軌道燈；正面一樓櫥窗＋玻璃門、二樓整排玻璃＋白紗簾 |
| `tests/flower_notes_unit.js` | 21 項：公館門口、兩層導航、上下樓（走路、跑步＋低幀率）、十二個座位、每個互動點、家具站不進去、樓板給鏡頭 |
| `index.html`、`src/data/zone_assets.js`、`LICENSES.md` | 載入、區域資產、授權 |

## 和參考圖不一樣、我自己決定的（請使用者／BB 看）
1. **二樓的窗在哪一面**：一樓參考圖是「前面挑高、後面看得到二樓玻璃欄杆」，二樓參考圖是「教室旁邊就是整面落地窗」，兩張合不起來。我照一樓圖：挑高在臨街那一半，教室在後半；教室朝街那一面是玻璃欄杆，隔著挑高看正面二樓的整排玻璃和白紗簾。
2. **外觀保留公館的騎樓線**（下一件 B 才做）：一樓玻璃退 3 m，二樓和招牌帶在立面線，不改公館導航。參考圖是沒有騎樓的平立面。

## 還沒做／先將就的
1. **花的造型是簡化的**（一團團小球＋葉子＋包裝紙）。參考圖的花細很多；下一版要換成更像花的做法。
2. **窗外的景**：先用公館現成的街景照片（慢輪單車門前、一樓高度）。使用者要的「公館這一段、從二樓高度看出去」要另外拍遊戲畫面。
3. 沒有光照貼圖（只有一盞點光）；洞石牆是白色灰泥貼圖調色，不是真的洞石紋。
4. 字體只有黑體（雲端沒有襯線體），參考圖的招牌是細襯線字。
5. 各區的「看」只有位置（`zone.fnLooks`），句子等 AA；買花互動點 kind `gg_flower` 在收銀櫃檯前，LAWWW 接；店員位置 `zone.fnClerk`。
6. **B 件還沒做**：公館 G11 外觀（重建 gongguan_shops.glb）、拿掉舊花攤 gg_flower_stall（阻擋、互動點、模型載入、zone_assets、測試）。這一件套了以後 G11 門口就進得去，但外觀還是舊的、花攤也還在。

## 驗證
- `node tests/flower_notes_unit.js` ALL PASS（沒有這一件時第 0 項就失敗）。
- 全部 Node 測試：交件時跑到 395／1237，沒過的兩項 `aa581_midterm_lines_unit`、`bookstore_exit_unit` 和汀州路第 2 版時一樣（dev 那個版本的電影資料、build 產物，不是這一件）；跑完的完整結果補在 `regression.log`。
- 畫面只有 Blender 預覽（`preview_1f.jpg`、`preview_2f.jpg`；不是遊戲截圖，D131；預覽的光是我另外打的，偏亮）。
- 模型 3.7 MB、11 萬三角形（花佔大部分）。
