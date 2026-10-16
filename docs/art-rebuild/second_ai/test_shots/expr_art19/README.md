# ART-19 九格表情疊到對話立繪（2026-10-16）｜LAWWW2-B

表情圖來源：BB-B 驗收（D59）過的九格。
- 子晴、學姊：`d69dd5f6`；
- 沛珊、可昕：`ad98f813`；
- 以安、語彤：`488af276`。

腳本：`tools/portraits/overlay_expressions.py --id <id>`，設定在 `CFG`。

| 人物 | 狀態 | 檔案 |
|---|---|---|
| 學姊 heroine_05 | **BB-B 通過**，已寫進 `assets/portraits/heroine_05/campus/`：底圖換成約會圖姿勢①（`neutral.webp`）＋ 7 格 smile、laugh、surprised、annoyed、sad、serious、tired。embarrassed、thinking 不用，遊戲自動用 neutral | 試疊紀錄 `../expr_heroine04_05/` |
| 沛珊 classmate_peishan | **等 BB-B 驗收**：現在的對話立繪，整個頭換掉，9 格 | `classmate_peishan/<表情>.webp`、`classmate_peishan_heads.png`、`classmate_peishan_full.png` |
| 可昕 kexin | **等 BB-B 驗收**：同上，9 格 | `kexin/<表情>.webp`、`kexin_heads.png`、`kexin_full.png` |
| 子晴 heroine_04 | **暫停**（BB-B 決定）：等使用者生成正面全身高解析度圖，再一次切底圖＋疊頭；立繪先不換 | `../expr_heroine04_05/` |
| 語彤 heroine_03 | **對得上，但身體偏糊**（和子晴一樣，是 768 標準圖切的）；建議同子晴，等新的正面全身 | `heroine_03_heads.png`、`heroine_03_full.png`（只是參考，沒有輸出單張） |
| 以安 heroine_01 | **疊不起來**：現在的對話立繪頭轉向她的左邊，約會圖姿勢①的頭轉向另一邊，都不是正面；九格表情是正面。要正面全身的新圖 | — |

BB-B 驗收通過後，沛珊、可昕的單張直接複製到 `assets/portraits/<id>/campus/`。

## 這一輪修的去背問題（腳本）

- **頭髮外面一圈灰**：AI 圖在頭髮外圍畫了一圈比灰底還亮的光暈。
  - 改法：「又亮又沒有顏色、而且和外面連在一起」的那一片全部當背景。
  - 眼白被睫毛、皮膚包著，不會被拿掉。
- **灰底不均勻**：去背、去邊改用附近的背景色（模糊的背景圖），不再只用一個背景色。
- **眼白在紅底上變紅**：眼白和灰底顏色接近，原本被挖掉。
  - 改法：四周是亮色（皮膚）的小洞補回去；四周是頭髮的空隙不補。
