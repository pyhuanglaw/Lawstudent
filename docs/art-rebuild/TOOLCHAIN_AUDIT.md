# 3D 美術工具鏈逐項實測（2026-10-10）

使用者 2026-10-10 要求「3D 美術製作流程全面升級／全免費、自動化、免額外設定」，並要求逐項實測盤點。
下面每一項都是 2026-10-10 05:10–05:30（UTC）在這個雲端環境（Claude Code on the web 容器，Ubuntu 24.04、Python 3.13.16、Node 22、4 核、15 GB、沒有 GPU）實際執行的結果。決策見 `docs/PROJECT_DECISIONS.md` D33。

| # | 項目 | 狀態 | 實際測試 → 結果 | 限制原因 | 替代方案 | 影響美術 | 需要使用者操作 |
|---|---|---|---|---|---|---|---|
| 1 | Claude Code Plugin／外掛市集 | 使用者回報介面的 `/plugin` 不能用；沒有測安裝 | `claude plugin --help` 有輸出（CLI 2.1.296 有這個子指令）；依使用者指示沒有用它安裝 | 介面指令不可用；斜線指令不是 AI 能自己輸入的工具 | 專案 Skill（#2） | 沒有影響 | 不需要 |
| 2 | 專案 `.claude/skills/` 載入機制 | 已實測成功 | 複製後立刻用 Skill 工具呼叫 → `Unknown skill: blender-web-3d`；幾分鐘後工作階段的 Skill 清單出現它；再呼叫 → `Launching skill: blender-web-3d`，SKILL.md 全文載入 | 第一次呼叫時清單還沒更新（兩次之間檔案沒有改過）；清單重新掃描的內部時機無法確認 | — | 沒有影響 | 不需要 |
| 3 | blender-web-3d-skill | 已實測成功（檔案存在、SKILL.md 可讀、能正式呼叫） | `git clone https://github.com/czlonkowski/blender-web-3d-skill`（`858762f`，MIT）→ `plugins/blender-web-3d/skills/blender-web-3d` 複製到 `.claude/skills/blender-web-3d`（附 LICENSE）→ 正式呼叫成功 | 它的腳本預設呼叫 `blender` 執行檔；它的 Vite 檢視器範本用不到 | 用 bpy 模組執行同樣的腳本；遊戲沿用自己的 Three.js | 沒有影響 | 不需要 |
| 4 | Blender MCP | **這個環境不能用**（不是「能用但不採用」） | clone `Blanceone/blender-mcp`（`c69b901`）：`addon.py` 第 393 行在 `bpy.app.background` 為真時拒絕啟動（"commands would never execute"）；本環境的 bpy 實測 `bpy.app.background = True`；它執行指令依賴的 `bpy.app.timers` 實測 3 秒沒有觸發。PyPI 的 `blender-mcp` 2.0.0 下載得到 | 需要有畫面的 Blender；雲端沒有螢幕，`download.blender.org` 被擋，拿不到完整 Blender 程式 | 直接寫 bpy 腳本（MCP 做的事本來就是把 Python 送進 Blender） | 沒有影響（少的是「看著 Blender 視窗即時操作」） | 不需要 |
| 5 | Blender 5.2.2／Python `bpy` | 已實測成功 | `python3 -m venv /opt/blenv && /opt/blenv/bin/pip install bpy==5.2.2`（402 MB wheel）→ `import bpy` → `5.2.2 LTS`、Python 3.13.16 | 沒有 Blender 執行檔（blender.org 被擋）；容器重開要重裝（約 2–3 分鐘） | bpy 就是完整的 Blender 核心 | 沒有影響 | 不需要 |
| 6 | Blender 算圖（Cycles／EEVEE） | 都已實測成功 | Cycles：CPU 480×270、16 samples 出圖。EEVEE：原本缺 `libEGL.so.1` 而 Aborted；`apt-get install libegl1 libegl-mesa0 libgl1-mesa-dri libgbm1`（免費）後出圖（簡單場景 58 秒，大部分是 shader 編譯） | 沒有 GPU，只能 CPU／軟體算圖 | 檢查圖用低解析度 Cycles | 有替代但受限（只影響檢查圖速度，不影響遊戲畫面） | 不需要 |
| 7 | GLB／glTF 匯出 | 已實測成功 | `bpy.ops.export_scene.gltf(... export_format='GLB')`：smoke.glb 2.7 KB；`export_image_format='WEBP'`：brick_wall.glb 55 KB | — | — | 沒有影響 | 不需要 |
| 8 | Three.js GLTFLoader 載入 | 測試頁成功；**正式遊戲場景尚未驗證** | 用遊戲自己的 `lib/three.jsm.bundle.js`（`new THREE_JSM.GLTFLoader.GLTFLoader()`）載入兩個 Blender GLB：smoke（2 個 mesh）、brick_wall（512² WebP 顏色貼圖＋法線貼圖），畫面正確、沒有錯誤 | 放進遊戲後的座標、朝向、碰撞、導航、光影、夜間窗光、手機效能還沒驗 | 霖澤館是第一個正式驗證 | — | 不需要 |
| 9 | Playwright／Chromium 遊戲截圖 | 已實測成功 | `tests/deploy_check.py` 載入 11 個區域、`cine_multi.py` 固定鏡頭截圖（整個專案一直在用） | SwiftShader 軟體算圖每秒 1–4 格，不是手機 GPU | 畫面效果可以驗證 | 有替代但受限（效能數字不代表手機） | 需要：發布後在手機實際玩，確認流暢度 |
| 10 | Poly Haven | 網路無法連線 | `curl https://api.polyhaven.com/`、`dl.polyhaven.org`、`polyhaven.com` → 代理拒絕（curl exit 56，CONNECT 403） | 環境的網路政策（Poly Haven 本身免費 CC0、不用帳號） | #12 環境光圖＋#13 自製材質 | 有替代但受限（少了現成的真實掃描材質） | 不需要；可選：環境設定的允許網域加 `polyhaven.com`、`dl.polyhaven.org`、`api.polyhaven.com` |
| 11 | ambientCG | 網路無法連線 | `curl https://ambientcg.com/` → exit 56 | 同上（免費 CC0、不用帳號） | 同上 | 同上 | 不需要；可選：允許 `ambientcg.com` |
| 12 | Poly Haven 的 GitHub 鏡像 | 已實測成功（只限 HDRI） | `raw.githubusercontent.com/pmndrs/drei-assets/master/hdri/potsdamer_platz_1k.hdr` 1.54 MB、`venice_sunset_1k.hdr` 1.40 MB 下載成功 | 只有十幾張 1k HDRI，沒有牆面材質 | 牆面用 #13 | 有替代但受限 | 不需要 |
| 13 | Blender 程序化 PBR 材質＋貼圖烘焙 | 已實測成功 | Brick Texture＋Bump → Cycles 烘焙 512² 顏色（1.1 秒）、法線（1.2 秒）→ 匯出 GLB → Three.js 正確顯示 | 真實感靠調材質，不如掃描材質天生真實 | 照照片顏色調、加髒污與變化 | 有替代但受限（取決於調材質） | 不需要 |
| 14 | 免費／開源 3D 模型素材庫 | 部分可用 | 被擋：Sketchfab（`sketchfab.com`、`api.sketchfab.com`）、`kenney.nl`、`quaternius.com`、`opengameart.org`（都 exit 56）。可用（`git ls-remote` 成功）：`pmndrs/market-assets`（CC0，已在用）、`KhronosGroup/glTF-Sample-Assets`（逐檔看授權）、`KenneyNL/Starter-Kit-City-Builder`（CC0）；npm 的 `@gltf-transform/cli` 4.5.1 可安裝 | 網站被擋；Sketchfab 下載另外需要帳號 | 臺灣特有道具（機車、號誌、招牌）自己在 Blender 做 | 有替代但受限（工作量變大） | 不需要 |
| 15 | Mixamo | 網路無法連線＋需要 Adobe 帳號 | `curl https://www.mixamo.com/` → exit 56 | 被擋；需要登入（免費但要帳號） | 這階段不動人物動畫 | 這次（建築）沒有影響 | 不需要 |
| 16 | Meshy／Tripo／Rodin | 網路無法連線＋需要帳號／API Key（免費方案有點數額度）→ 依使用者「全免費、免設定」要求未採用 | `meshy.ai`、`api.meshy.ai`、`www.tripo3d.ai`、`api.tripo3d.ai`、`hyper3d.ai` → 全部 exit 56 | 被擋＋帳號／點數 | 照照片與地圖用 Blender 腳本建模 | 沒有影響（建築要照真實尺寸，AI 生成不適合） | 不需要 |

## 時間順序

- 網路政策（只允許 GitHub、PyPI、npm、Ubuntu apt 等，其他網站被擋）**從一開始就存在**：在使用者提出美術工具要求之前，這個工作階段查 OpenStreetMap、維基百科、github.io 就已經被擋；CLAUDE.md 在 v7 時就記錄「沙盒對外網路通常只允許 GitHub」。
- 沒有 GPU、拿不到 Blender 執行檔：環境本來如此。
- 新指令之後**增加**的能力：bpy、Mesa（EEVEE）、專案 Skill。
- 新指令之後才發現的：Skill 清單更新有時間差（自行恢復）、EEVEE 缺 EGL（已補裝）。沒有任何一項限制是新指令造成的。

## 結論

1. **真正能用的組合**：Blender 5.2.2（bpy、無介面）照照片與地圖寫腳本建模 → 程序化材質烘焙成 PBR 貼圖 → Cycles／EEVEE 檢查圖 → GLB（WebP 貼圖）→ 遊戲現有 Three.js GLTFLoader → Playwright 遊戲內截圖與照片比較；環境光用 Poly Haven CC0 HDRI 的 GitHub 鏡像。全部免費，不需要使用者操作。
2. **確實不能用、損失什麼**：Poly Haven／ambientCG 的掃描材質（改自製）、Sketchfab／Kenney 官網等模型庫（改自己建，比較花時間）、Blender MCP（只少了即時看視窗，功能沒有損失）、GPU 算圖（只損失速度）。Mixamo、Meshy、Tripo、Rodin 被擋又要帳號，這次也用不到。
3. **尚未測試或沒有必要（不是不能用）**：外掛市集安裝（依使用者指示沒測）、gltf-transform 壓縮（npm 可裝，還沒用）、Skill 的 Vite 檢視器範本（遊戲已有 Three.js）、meshopt／KTX2 壓縮（GLTFLoader 有對應程式碼，但解碼器有沒有打包進 `lib/` 還沒確認，先用 WebP 貼圖）。

## 在新容器重建工具鏈

```bash
python3 -m venv /opt/blenv && /opt/blenv/bin/pip install bpy==5.2.2      # Blender 5.2.2（約 2–3 分鐘）
apt-get update && apt-get install -y libegl1 libegl-mesa0 libgl1-mesa-dri libgbm1   # 只有要用 EEVEE 時才需要；Cycles 不需要
/opt/blenv/bin/python tools/blender/<script>.py -- <args>                 # 跑建模腳本（不是 blender --background）
```
