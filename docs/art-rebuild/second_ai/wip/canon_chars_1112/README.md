# CANON 模型清理 ②：五個舊序章人物的 3D 模型、立繪、建模腳本（LAWWW2-C 2026-11-12）

LAWWW-C 18:34 交辦的第 ② 項（D158）。基準：開發分支 `claude/adoring-meitner-mqzst8` @ 6e3fdd3c89（含 ①＋③ 已整合）。

## 套法
在開發分支 repo 根目錄：
```
python3 docs/art-rebuild/second_ai/wip/canon_chars_1112/apply_canon_chars.py --dry   # 先看要動哪些
python3 docs/art-rebuild/second_ai/wip/canon_chars_1112/apply_canon_chars.py
```
不用 patch 的原因：被改的那幾行（LICENSES.md 的列）有舊序章的代號，patch 的「−」行會把舊內容整行帶進來；腳本只比對英文識別字，本身用 `canon_scan` 字表掃是 0。每一步找不到預期的數量就報錯、什麼都不寫。

## 會做什麼
**刪 31 個檔（git rm）**
- 舊序章人物甲～戊的 VRM 五個（`assets/models/char/second_ai/bl_econ_*.vrm`）
- 他們的對話立繪五張（`assets/portraits/econ_*/campus/neutral.webp`）
- 建模腳本 12 支（`tools/blender/char_second/` 裡三個人各 4 支；另外兩個人沒有專屬腳本）
- `tests/v0_econ_chars_unit.js`（只測這五個模型）
- `docs/art-rebuild/ingame_review/2026-10-17_econ_peishan/` 整包 8 個檔（舊序章人物的遊戲內檢查截圖；裡面另有 3 張沛珊的舊截圖，是 10-17 的檢查紀錄，沛珊現在的模型不受影響）

**改 4 個檔＋重產 1 個**
| 檔 | 改什麼 |
|---|---|
| `src/assets3d.js` | manifest 拿掉 `char.econ_*` 五行 |
| `src/character3d.js` | `C.SIT_FIT` 拿掉五格、`C.MODEL_PROPS` 拿掉三格（安全帽、美食地圖筆記本、保溫瓶） |
| `tools/anim/sit_fit.json` | 拿掉五格（坐姿量測的來源表） |
| `LICENSES.md` | 拿掉只講這五個人模型或立繪的 6 列 |
| `src/data/portrait_manifest.js` | 用 `tools/gen_portrait_manifest.py` 照實際存在的立繪重產（少五格） |

## 不動的
- 舊序章的教授的 VRM、眼鏡：`src/data/courses.js`、`characters.js` 還在用。
- 配件 GLB（安全帽、美食地圖筆記本、工程計算機、黑色保溫瓶）：`props3d.js` 還有登記，是一般物品，留著。LICENSES 那兩列的說明文字提到舊序章人物，要不要改說法交 LAWWW 的 `canon_clean.py`。
- 宿營兩張 2D 背景、宿營 CG：等 AA／LAWWW 定（清單 `wip/canon_cleanup_1112/README.md` 第八節）。
- 測試裡寫著這五個 id 的劇情測試（aa440、aa459、exam_lib_crowd、invites_quote_b5、ladder_aa781）和 `tests/fixtures`、`tests/repro_*`、`wip_backup` 的舊存檔：是劇情／存檔的事，歸 LAWWW；`docs/handoff/user_shots/` 的使用者截圖也不是我的。

## 測試
（見下方「結果」）
