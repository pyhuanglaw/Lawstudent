# TRELLIS.2 線上試用版：用使用者的參考圖試（LAWWW2-C 2026-11-05）

- 起因：
  - 使用者選「可以上傳試」，同意把幾張參考圖上傳到 TRELLIS.2 的線上試用版（OPEN_SRC_2D3D_1104.md 第 5 節）。
  - LAWWW-C 05:39 排進佇列第 4：挑 2～3 張參考圖試，結果寫 README，結果好才考慮用。
- **CANCELLED（使用者 11-05 06:4x）：「這不用做 我電腦也跑不了」——不再試 TRELLIS.2，也不要 HF token。**
- **結果：BLOCKED（沒有產生 3D 模型）**。卡在 Hugging Face 的免費 GPU 額度（ZeroGPU），沒有登入的人額度是 0。

## 做了什麼

| 步驟 | 結果 |
|---|---|
| 連到 Hugging Face（`huggingface.co`、`*.hf.space`） | 通（這個雲端環境允許 Hugging Face） |
| 官方試用頁 `microsoft/TRELLIS.2`（Gradio 6.1） | API 讀得到：去背 → 產生 3D → 匯出 GLB |
| 上傳 `wz_yizhan_ext.webp`（一盞外觀，使用者 11-03 生成的參考圖），跑去背 | 成功（在對方伺服器上） |
| 產生 3D（`/image_to_3d`） | **失敗**：`You have exceeded your ZeroGPU runs limit. Authenticate with a Hugging Face token for more quota` |
| 改用社群版 `trellis-community/TRELLIS`（TRELLIS 第一代） | 去背成功；產生 3D 失敗：`You have exceeded your ZeroGPU quota (120s requested vs. 0s left)` |

- 上傳到外部的只有這一張（`wz_yizhan_ext.webp`），兩個試用頁各一次。另外兩張（`dabu_ext.webp`、`tongxian_int.webp`）因為前一步已經失敗，沒有上傳。
- 用的工具：`gradio_client` 2.7.2，pip 裝在 scratchpad，沒有進 repo。

## 要繼續試的話（使用者決定）

1. **給一個 Hugging Face 的唯讀 token**：
   - 加在雲端環境的設定裡：工作階段標題列的雲端環境選單 → Edit → Network secrets（舊版 App 叫 API credentials）。
   - 變數名稱 `HF_TOKEN`，新的工作階段才讀得到。
   - **不要貼在對話裡**。
   - 免費帳號每天有幾分鐘的 GPU 額度，大約夠試 3～5 張。
2. **或在使用者自己的電腦跑**：要 NVIDIA 顯示卡（TRELLIS.2 官方要 24 GB 顯存）。CC 可以先查 PC 有沒有。
3. **我的預估不變**（OPEN_SRC_2D3D_1104.md 第 2 節）：
   - 這種「圖 → 3D」的模型適合單一小物件（盆栽、招牌燈箱、機車）。
   - 整間店面、室內的直線、招牌字會糊、會融掉，不能取代現在 Blender 照參考圖建模的做法。
   - 有 token 以後，建議改試從參考圖裁出來的小物件。例如：一盞門口的石燈籠、2:30 AM 門口的盆栽、同弦牆上的一把吉他。
