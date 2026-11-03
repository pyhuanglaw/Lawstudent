# 南洋戲院（AA_615 第 3 節）——BB 協助建模（2026-11-03，使用者「lawww2在忙 你和bb cc協助建模」）
- **狀態**：大廳 v2＝`READY_FOR_REVIEW`（照 SCENE_RULES 第 10 節；還沒整合進遊戲、沒有遊戲內截圖；LAWWW2 確認前不算完成）。影廳還沒做（等 LAWWW2 回 3D 還是 2D）。
- 腳本：`tools/blender/env_second/bb_support/nanyang_interior.py`（在 `claude/second-ai-env-art` 的工作樹跑：`/opt/blenv/bin/python tools/blender/env_second/bb_support/nanyang_interior.py`；用 LAWWW2 的 lib2、bg_cinema.poster_tex、貼圖）。
- 配置：`src/data/nanyang_layout.js`（格式照 wz_shops_layout.js；大廳 16×12×4.5 m、店門 +z、blocks、seats 4、interact 5；exit、enterAt 留空）。
- GLB：`assets/models/env/second_ai/bb_support/nanyang_lobby.glb`——`glb_specs.json`：2.85 MB、25,264 三角形、材質 12、draw call 約 18、貼圖 10 張（505 KB、WebP）＝都在預算內（6 萬／12／6 MB）；金屬度 ≤ 0.45；沒有深色木地板（磨石子地、淺色木腰板）。
- 渲染（Blender Cycles，不是遊戲畫面）：`lobby_v2_4views.jpg`（大門、爆米花櫃檯、影廳門＋海報牆、售票口）、`lobby_v2_halldoor.jpg`（影廳門近看）。
- 材質來源：Poly Haven CC0（terrazzo_tiles、painted_plaster_wall、wood_table_001、granite_tile_03）；其他是程式畫的（場次板、價目燈箱、廳號、爆米花圖、虛構海報＝LAWWW2 bg_cinema.py 的畫法）。沒有真實店名、商標、真實電影（D77）。
- 已知缺點：左牆「觀影須知」貼圖合併以後變白（atlas_small）；立牌背面是鏡像圖、側面看得到支架；售票口玻璃偏灰；磨石子遠看像水泥；腰板木紋偏花。
