# 第二個 AI 的貼圖來源（Poly Haven，CC0）

- `lib2.fetch(<id>)` 從 Poly Haven API 下載 1k JPG（顏色 diff、法線 nor_gl、粗糙度 rough），**存進 repo 前縮成 512 px**（遊戲用的 GLB 貼圖最大 512 px，原檔 1k 用不到；repo 小很多）。檔名照舊（`*_1k.jpg`），重新下載時同名覆蓋即可。
- 授權與作者記在 `LICENSES.md` 的「第二個 AI」小節。
- `gen/`：本作程式產生的葉片貼圖（`gen_leaves.py`）。
