# 唐睿（econ_tangrui） 3D v8：臉分開＋待機臉帶笑（BB_201 第 0 節第 1、2 項；LAWWW2-C 2026-10-17 13:5x UTC；等 BB-C 驗收，D59）

- 這一版只改臉（BB_201 優先順序第 1 項）：三個人裡眼睛最大最圓、短臉、下巴短、細弧眉、嘴寬；待機臉烘 Fcl_MTH_Fun 0.75＋Fcl_EYE_Joy 0.22＋Fcl_BRW_Fun 0.4（帶笑）。
- 做法：
  - 臉型參數 `tools/blender/char_second/tangrui_face.py`；
  - 待機臉用 `vrm_finish2.py` 的 `VRM_REST`，把表情的一部分烘進基本形。
- 三個人並排（上：臉正面，下：全身；左到右韋綸、唐睿、家豪）：
  ![](../econ_faces_round2.webp)
- 遊戲渲染器：
  ![](look_sheet.webp)
- 上一版：
  ![](v6_look_sheet.webp)
- 還沒改（BB_201 第 2～6 項，下一步）：
  - 韋綸：短袖連帽風衣、安全帽；
  - 唐睿：polo 領、便利貼；
  - 家豪：薄背心；
  - 上衣像連帽衫（照沛珊第十版的領口做法）；
  - 頭髮、身材、鞋。

---

# 唐睿（econ_tangrui） 3D v6（LAWWW2-C，2026-10-17；等 BB-C 驗收，D59）
- VRM：`assets/models/char/second_ai/bl_econ_tangrui.vrm`；頭髮沒有 MatCap。
- 穿搭：藍色上衣、淺色長褲、後背包；波浪捲髮第六版。
- 截圖：
  - `look_*.webp`：遊戲渲染器 test_charlook，待機、走路、坐下；
  - `blender_*.webp`：Blender 預覽。
- 已知問題：捲髮沒有做出來（使用者 10-17：不要花時間處理捲髮）；眼角那一小片是睫毛的幾何。
- 新遊戲從經濟系那一年開場（LIFE-LINE 第 7 組），經濟系人物提前交件。
