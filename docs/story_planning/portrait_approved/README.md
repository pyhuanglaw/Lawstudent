# portrait_approved：使用者生成、BB 檢查通過的 2D 立繪表情（原檔，灰底，還沒去背）

| 檔案 | 人物／服裝／表情 | 用在 | 檢查（BB-C） |
|---|---|---|---|
| `kexin_campus_teasing_source.png` | 可昕 `kexin`／campus／`teasing` | 事件裡 `kexin` `expression:'teasing'` 54 次（經濟系起） | 2026-10-18 第二版通過（第一版和 smile 幾乎一樣、退回）。同一個人、同一套衣服；縮成 600 寬後，人物外框和現有 neutral／smile 差 1 px 以內（切表情不會跳）。表情：眼睛半瞇、斜斜往旁邊看、嘴角上揚，和 smile 分得開。灰底 971×1619，**要去背後存 `assets/portraits/kexin/campus/teasing.webp`（600×1000）**。 |
| `mingxuan_campus_smile_source.png`、`mingxuan_campus_laugh_source.png`、`mingxuan_campus_embarrassed_source.png` | 明軒 `classmate_mingxuan`／campus／`smile`、`laugh`、`embarrassed` | 事件裡 smile 14、laugh 7、embarrassed 2 | 2026-10-18 通過。使用者給的是一張三格並排（另一張單獨的 smile 是截圖，邊緣被裁，不用）。BB 把三格切開、等比縮放並對齊到現有 neutral 的人物外框（600×1000，上緣 43 px、高 935 px，差 3 px 以內）。同一個人、同一套衣服；三個表情分得開：淡淡的微笑／瞇眼笑出來／臉紅、眼神看旁邊。灰底，**要去背後存 `assets/portraits/classmate_mingxuan/campus/<表情>.webp`**。 |
