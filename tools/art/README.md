# tools/art：美術驗收與生成的輔助工具（D138，2026-11-04）

來源：BB-C 的雲端試跑（企劃線 `docs/story_planning/BB_259_圖轉3D_疊圖驗收_頭髮診斷.md`，`claude/wonderful-mayer-7fm9g6` 3e6f5040a 的 `docs/story_planning/test_tools/bb/img2_3d/`）；LAWWW2-C 11-04 15:1x 同意 R1、R2。規則在 CLAUDE.md MANDATORY 第 2 點、`docs/art-rebuild/ART_DIRECTION.md` 第 12 節。

## same_angle_check.py：同角度疊圖驗收（R1）

- 什麼時候用：有使用者參考圖的場景，交件前。沒有參考圖、畫面裡沒有直線（純植物、人物）、只看顏色（那個用 ref_match）時不用。
- 安裝：`pip install numpy pillow opencv-python-headless scikit-image`（約 400 MB，不放進 repo）。
- 用法：`python3 tools/art/same_angle_check.py <參考圖> <遊戲截圖> <輸出前綴> --fov <截圖的垂直 FOV> [--crop/--crop2 x0,y0,x1,y1] [--mask x0,y0,x1,y1 ...]`
- 量：消失點（鏡頭要左轉、往下幾度）、左右兩半的垂直線傾斜（兩邊都接近 0、消失點卻偏高＝參考圖用了移軸，改 `camera.setViewOffset`／Blender `shift_y`，不壓低俯角）、6×4 格裡參考圖東西多 1.8 倍以上的格子（紅框）。
- 暫定門檻（只用 6 組圖校過）：消失點差 ≤2%、垂直線傾斜差 ≤1.5°、長寬比 ±3%、紅框 ≤3／24。
- 交件附：`<前綴>_overlay.jpg`、`<前綴>_structure.json`、鏡頭設定。截圖一定要用遊戲畫面，Blender 渲染只能預看。
- D136 校園建築：分數不是越高越好，獨特的造型和細節一比一重疊的地方要標出來、改成自己的設計。
- 工具認不出兩張圖是不是同一間店（兩張 AI 參考圖的鏡頭可能幾乎一樣），這要靠拆圖清單。

## triposr/：中遠景的有機小雜物（R2）

- 只用在玩家走不到 3 m 內、Poly Haven 和 `tools/blender/plants.py` 都做不出來的盆栽、袋子、布、雜貨堆。近景、桌上的、要坐／互動／碰撞的、建築、家具主體、人物、頭髮、有品牌的（D77）、被遮住一半以上的都不准用。第三方照片不能當輸入。
- TripoSR 本體不放進 repo：`git clone https://github.com/VAST-AI-Research/TripoSR`，checkout `triposr_commit.txt` 的 commit，套 `triposr_cpu_skimage.patch`（沒有 torchmcubes 時改用 scikit-image）；權重從 Hugging Face `stabilityai/TripoSR` 下載並核對 sha256。PyTorch CPU 版直接從 `download.pytorch.org/whl/cpu/<檔名>` 下載（索引頁會轉到被擋的網域）。
- 步驟：
  1. 輸入只放一個物件，短邊 ≥300 px，自己做透明遮罩（rembg 會誤刪）；補了哪裡要寫清楚。
  2. `python3 tools/art/triposr/tsr_run.py <TripoSR 原始碼資料夾> <權重資料夾> <in_rgba.png> <out_dir> [--mc 256] [--threads 4]`（4 核 CPU 約 1 分鐘）。
  3. `blender -b -P tools/art/triposr/cleanup_tsr.py -- <mesh.glb> <輸出前綴> --height <公尺> [--lod0 8000] [--lod1 2000] [--rot x,y,z]`：法線、碎塊、平滑、轉向、真實高度、原點在底部、頂點色接進材質、兩個減面版本。
  4. 顏色調回參考圖取的色碼。
  5. 預算：中景 ≤8,000 面、遠景 ≤2,000 面、每個 GLB ≤300 KB，重複出現的用 instancing。
  6. `LICENSES.md` 寫 TripoSR（MIT）、commit、權重 sha256、輸入圖來源。
  7. 驗收：`blender -b -P tools/art/triposr/render_glb.py -- <in.glb> <輸出前綴> --az 0,45,90,180 [--clay]` 出正面、45° 和參考圖並排；加一張遊戲內實際距離的截圖，近看穿幫就退回改手做；照 MANDATORY 第 8 點列出缺點。
- 輸出只有頂點色、沒有 UV；葉子會像厚黏土塊、顏色偏淡（BB_259 C 節），所以只能放遠。
