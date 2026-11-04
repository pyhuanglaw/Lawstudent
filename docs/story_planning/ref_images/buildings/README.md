# 建築參考照片總表（NTU-REF-AUDIT-1104，USER_WANTS X223）

> **施工中（WIP）**：這一份還在寫，最後一版會補齊每一棟的照片清單、和遊戲可能不一樣的事實、找不到官方照片的建築。

- 使用者 2026-11-04 14:15：「*.ntu.edu.tw 加入了 這個就是我的大學的網站裡有任何建筑物請你都去查它裡面一定會有圖片介紹你要好好檢查你現在圖片裡的游戲裡」
- 照片的著作權屬原網站；**只當建模參考，不放進遊戲、不當貼圖**。這個 repo 是公開的，所以學校網站的照片**不放進 repo**，只記原圖網址（每棟資料夾的 `list.json`），要看圖的人用 `tools/ref/fetch_ref_images.py <資料夾>` 抓到本機。
- 遊戲裡的校名、館名照 `docs/WORLD_NAMING.md`（真實名稱只用在這份查證紀錄）。

## 遊戲裡有真實原型的建築（盤點中）

| 真實名稱 | 遊戲名稱 | 內部 id | 遊戲裡 |
|---|---|---|---|
| 總圖書館 | 總圖書館 | library（外觀 `bldg.campus_library`；室內 library_hall、library、library_b1、library_carrels、library_stacks） | 外觀＋可以進去 |
| 霖澤館 | 法律系館A | linze（外觀 `bldg.linze_exterior`；室內 linze、classroom、linze_<樓層>） | 外觀＋可以進去 |
| 萬才館 | 法律系館B | wancai（外觀 `bldg.wancai_exterior`；室內 wancai、lawlib） | 外觀＋可以進去 |
| 社會科學院＋辜振甫先生紀念圖書館 | 社會科學院＋社科院圖書館 | soc／soclib（`bldg.campus_socsci`、`bldg.soclib_interior`） | 外觀＋圖書館一樓可以進去 |
| 普通教學館 | 普通教學館 | putong | 外觀＋可以進去 |
| 博雅教學館 | 博思教學館 | boya | 外觀＋可以進去 |
| 共同教學館 | 共同教學館 | gongtong | 外觀＋可以進去 |
| 行政大樓 | 行政大樓 | admin | 外觀 |
| 文學院 | 文學院 | arts | 外觀 |
| 校史館 | 校史館 | hist | 外觀 |
| 農業陳列館（洞洞館） | 農業陳列館（圓窗館） | pavilion | 外觀 |
| 傅鐘 | 晨思鐘 | bell | 外觀 |
| 校門 | 校門 | gate | 外觀 |
| 男一舍 | 男一舍 | male1／dorm_hall | 外觀＋可以進去 |
| 大一女舍 | 大一女舍 A、B | freshman | 外觀 |
| 綜合體育館（新體育館） | 綜合體育館 | gym | 室內 |
| 醉月湖 | 映月湖 | lake | 戶外 |
