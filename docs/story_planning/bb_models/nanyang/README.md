# 南洋戲院（AA_615 第 3 節）——BB 協助建模（2026-11-03，使用者「lawww2在忙 你和bb cc協助建模」）
- **狀態**：大廳 v1＝`MODEL_READY`（還沒整合進遊戲、沒有遊戲內截圖）；影廳還沒做。
- 腳本：`tools/blender/env_second/bb_support/nanyang_lobby.py`（要在 LAWWW2 分支的工作樹跑：import `lib2`、`bg_cinema.poster_tex`、貼圖 `terrazzo_tiles` 等都在 `claude/second-ai-env-art`）。
- GLB：`assets/models/env/second_ai/nanyang_lobby.glb`（25,180 三角形、36 材質、2.9 MB）＋`nanyang_lobby_layout.json`（房間 14×10×4.2 m、門、互動點、導航阻擋）。
- 渲染：`lobby_v1_4views.jpg`（從大門、爆米花櫃檯、影廳門＋海報牆、售票口）、`lobby_v1b_door_posters.jpg`（立牌移位後）。Blender Cycles，不是遊戲畫面。
- 參考：台北老二輪戲院的常見樣子（不仿特定一家；D77 沒有真實店名、商標、真實電影海報；海報用 LAWWW2 bg_cinema.py 的虛構海報畫法）。
- 已知缺點（下一輪）：立牌從側面看得到支架、背面是鏡像圖；售票口玻璃偏灰；磨石子地遠看像水泥；大廳偏空，可以加等待的人（NPC 由遊戲放）。
- 整合（LAWWW2）：要新增 `nanyang_lobby` 區域（新生南路那一排店面，AA_615 第 1 節），照 layout.json 的 blocks、points；影廳另一個區域或 2D 背景。
