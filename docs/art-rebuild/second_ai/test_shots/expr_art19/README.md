# ART-19 九格表情疊到對話立繪（2026-10-16）｜LAWWW2-B

表情圖來源：BB-B 驗收（D59）過的九格。
- 子晴、學姊：`d69dd5f6`；
- 沛珊、可昕：`ad98f813`；
- 以安、語彤：`488af276`。

腳本：`tools/portraits/overlay_expressions.py --id <id>`，設定在 `CFG`。

| 人物 | 狀態 | 檔案 |
|---|---|---|
| 學姊 heroine_05 | **BB-B 通過**，已寫進 `assets/portraits/heroine_05/campus/`：底圖換成約會圖姿勢①（`neutral.webp`）＋ 7 格 smile、laugh、surprised、annoyed、sad、serious、tired。embarrassed、thinking 不用，遊戲自動用 neutral | 試疊紀錄 `../expr_heroine04_05/` |
| 沛珊 classmate_peishan | **BB-B 通過**（03:19），已複製進 `assets/portraits/classmate_peishan/campus/`：現在的對話立繪，整個頭換掉，9 格 | `classmate_peishan/<表情>.webp`、`classmate_peishan_heads.png`、`classmate_peishan_full.png` |
| 可昕 kexin | **BB-B 通過**（03:19），已複製進 `assets/portraits/kexin/campus/`：9 格（小事：左側髮尾肩膀高度的去背邊緣有一點鋸齒，之後順手柔） | `kexin/<表情>.webp`、`kexin_heads.png`、`kexin_full.png` |
| 子晴 heroine_04 | **暫停**（BB-B 決定）：等使用者生成正面全身高解析度圖，再一次切底圖＋疊頭；立繪先不換 | `../expr_heroine04_05/` |
| 語彤 heroine_03 | **暫停**（BB-B 決定）：身體偏糊，等使用者生成正面全身（BB 第 24 組） | `heroine_03_heads.png`、`heroine_03_full.png`（只是參考，沒有輸出單張） |
| 以安 heroine_01 | **暫停**（BB-B 決定，第 23 組和子晴一起生）。疊不起來：現在的對話立繪頭轉向她的左邊，約會圖姿勢①的頭轉向另一邊，都不是正面；九格表情是正面。要正面全身的新圖 | — |

子晴、以安、語彤的對話立繪在新圖來之前維持現在這張，不疊表情。

## 這一輪修的去背問題（腳本）

- **頭髮外面一圈灰**：AI 圖在頭髮外圍畫了一圈比灰底還亮的光暈。
  - 改法：「又亮又沒有顏色、而且和外面連在一起」的那一片全部當背景。
  - 眼白被睫毛、皮膚包著，不會被拿掉。
- **灰底不均勻**：去背、去邊改用附近的背景色（模糊的背景圖），不再只用一個背景色。
- **眼白在紅底上變紅**：眼白和灰底顏色接近，原本被挖掉。
  - 改法：四周是亮色（皮膚）的小洞補回去；四周是頭髮的空隙不補。

## 第二批（2026-10-16 04:5x）：子晴、以安、語彤＋第 28 組兩個頭

- **新的正面全身底圖**（BB-B D59 通過）：
  - 子晴、以安：`e69036b8`；語彤：`3c983b8b`。
  - 取代原本從 768 標準圖切的、偏糊的那一版。
  - 去背用 alpha matting，灰底外圍的淡描邊一起去掉；子晴的米白上衣不調色。
- **九格都疊了**：`assets/portraits/heroine_0{4,1,3}/campus/` 的 neutral＋9 張。
  - 子晴、以安只換臉（眉毛到下巴），頭髮留底圖的。原因：整個頭換掉的話，短髮外緣在脖子旁邊會留一團灰，以安臉頰旁的瀏海也看得出接縫。
  - 語彤整個頭換掉，下巴以下淡出；試過很自然。
- **第 28 組**（`894d6670`）：先縮到和九格一格相同的頭寬，再疊。
  - 學姊 `embarrassed`：只換臉，補上之前缺的那格；
  - 芷若 `thinking`：不帶手的版本，整個頭換掉，換掉托下巴的那格（原本就沒放）。
- **對照**：
  - `batch2_heads.webp`：三人的 neutral＋9 張，深色、紅底交替；
  - `batch2_full.webp`：全身，含第 28 組兩張。
- **狀態**：已寫進 `assets`，**等 BB-B 驗收疊好的成品**（底圖已經 ART_APPROVED）。
