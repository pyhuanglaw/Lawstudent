# 總圖 B1 第二版（**11-02 已交件**：二進位改放 `assets/models/env/second_ai/library_b1.*`，說明 `docs/art-rebuild/second_ai/test_shots/library_b1_1102/README.md`；這個資料夾只是交件前的備份）

- **這是半成品的備份，不是交件**：遊戲現在用的 B1 還是 `assets/models/env/second_ai/library_b1.glb`（10-23 第一版）＋開發分支的 `src/data/library_b1_layout.js`。這個資料夾的檔案還沒在遊戲裡驗收，不要整合。
- 依據：使用者 11-02 08:58 的 B1 平面圖（「尤其B1自習室」）、10-17 給的兩張 24 小時自習室照片（企劃線 `docs/story_planning/art_reference/photo_ref/ntu_lib_b1_room_a.jpg`、`ntu_lib_b1_room_b.jpg`）；10:0x「B1自習室我記得給我你照片 ?」（UA-LAWWW2-1102-07）。
- 產生方式：`/opt/blenv/bin/python tools/blender/env_second/library_b1.py -- --out-dir <資料夾> [--js <repo>]`（`--js` 寫 `src/data/library_b1_layout.js`）。
- 內容：24 小時自習室 A 區（大開間：低的白色方格天花板＋長條燈、白色方柱、淺灰石材地板、蜂蜜色木長桌＋矮隔板、木椅暗紅椅墊、綠燈罩檯燈）、B 區、大廳＋中庭玻璃、會議廳（關著）、討論室 1／2、影印中心、服務台、自助借還書機。
- 數字：座位 115（navcheck 沒有走不到的座位）；三角形 29,204（畫出來 64,204）；GLB 2.7 MB（椅子 101 張、檯燈 101 盞用 instancing，原本每張各畫一份 5.3 MB）。
- 中庭（11-02 11:2x）：第一版的植栽是圓角方塊（遊戲截圖像積木）→ 葉片卡的庭園樹（樹冠在 2.8～3.9 m，從門廳玻璃看得到）、灌木、蕨類、牆上的藤蔓、步石（`court_garden`）。
- 還沒做：遊戲內截圖驗收、`tests/` 裡和 B1 有關的單元測試、交件說明、改前改後比較。
