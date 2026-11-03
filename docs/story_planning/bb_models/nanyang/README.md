# 南洋戲院（AA_615 第 3 節）——BB 協助建模（2026-11-03，使用者「lawww2在忙 你和bb cc協助建模」）
- **v4（11-03 11:3x，LAWWW2 11:12 同意 9×14×4.5 m）＝`READY_FOR_REVIEW`**：`lobby_v4_ref_vs_5views.jpg`（左上是參考圖；其他是 Blender Cycles 渲染，不是遊戲畫面）。glb_specs：4.1 MB、46,584 三角形、材質 12、draw call 20、貼圖 11 張（497 KB WebP）。改了：①照參考圖改窄長大廳（入口在中間、售票亭背牆在左前、櫃檯沿左牆、後牆兩組門＋大招牌、右牆海報＋長椅）；②配置加 `lights`（14 盞：吊燈 4、壁燈 2、鵝頸燈 2、海報投射 4、櫃檯燈帶、飲料櫃燈），給 LAWWW2 烘光影；③**飲料櫃變綠的 bug 修好**——原因是倒角（bevel）會釋放面、之後新加的瓶子佔進前面的位置，`list(faces)[n:]` 上色就塗到別的面；改成用集合比對新面。還差的：溫暖的金黃燈光要靠烘焙（現在是白光）；飲料櫃裡的瓶子隔著玻璃又靠近燈、顏色太淡；櫃檯上的雜物（爆米花桶、吸管）和參考圖比還少；海報是插畫風、參考圖是人物寫實風；開著的門後影廳卡片偏暗。
- **v3（11-03 11:2x，照使用者參考圖 `ref_images/shops/nanyang_lobby.webp`）＝`READY_FOR_REVIEW`**：`lobby_v3_ref_vs_4views.jpg`（左上是參考圖）。glb_specs：4.4 MB、50,088 三角形、材質 12、draw call 20。和參考圖還差的：①參考圖是窄長的大廳（約 7～8 m 寬），16×12 放進去太空——建議 LAWWW2 改 9×14 左右再排；②溫暖的金黃燈光要靠烘焙；③櫃檯上的雜物、彩色飲料櫃、人物插畫海報密度不夠；④飲料櫃一側被塗成綠色（頂點色 bug）；⑤開著的門後影廳卡片太暗。售票口在外觀那一面（LAWWW2），大廳只有售票亭背牆。
- （以下是 v2 的紀錄）**狀態**：大廳 v2＝`READY_FOR_REVIEW`（照 SCENE_RULES 第 10 節；還沒整合進遊戲、沒有遊戲內截圖；LAWWW2 確認前不算完成）。影廳還沒做（等 LAWWW2 回 3D 還是 2D）。
- 腳本：`tools/blender/env_second/bb_support/nanyang_interior.py`（在 `claude/second-ai-env-art` 的工作樹跑：`/opt/blenv/bin/python tools/blender/env_second/bb_support/nanyang_interior.py`；用 LAWWW2 的 lib2、bg_cinema.poster_tex、貼圖）。
- 配置：`src/data/nanyang_layout.js`（格式照 wz_shops_layout.js；大廳 16×12×4.5 m、店門 +z、blocks、seats 4、interact 5；exit、enterAt 留空）。
- GLB：`assets/models/env/second_ai/bb_support/nanyang_lobby.glb`——`glb_specs.json`：2.85 MB、25,264 三角形、材質 12、draw call 約 18、貼圖 10 張（505 KB、WebP）＝都在預算內（6 萬／12／6 MB）；金屬度 ≤ 0.45；沒有深色木地板（磨石子地、淺色木腰板）。
- 渲染（Blender Cycles，不是遊戲畫面）：`lobby_v2_4views.jpg`（大門、爆米花櫃檯、影廳門＋海報牆、售票口）、`lobby_v2_halldoor.jpg`（影廳門近看）。
- 材質來源：Poly Haven CC0（terrazzo_tiles、painted_plaster_wall、wood_table_001、granite_tile_03）；其他是程式畫的（場次板、價目燈箱、廳號、爆米花圖、虛構海報＝LAWWW2 bg_cinema.py 的畫法）。沒有真實店名、商標、真實電影（D77）。
- 已知缺點：左牆「觀影須知」貼圖合併以後變白（atlas_small）；立牌背面是鏡像圖、側面看得到支架；售票口玻璃偏灰；磨石子遠看像水泥；腰板木紋偏花。
