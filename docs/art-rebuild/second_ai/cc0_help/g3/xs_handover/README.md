# 新生運動廣場 xinsheng_sports：交給 LAWWW2-C 接手（第③群 11-14 01:1x）

做到哪：建模腳本改好、用腳本重建的原檔烘過一次（23:28，足球是洩氣的舊球 → 已改腳本、還沒重烘）。沒有交過 patch。
- 腳本：`tools/blender/env_second/bb_support/xinsheng_sports_interior.py`（252bc3765a）＋共用 `cc0_kit.py`。
  - 衣服（tee／jersey／jacket／shorts／jsample 原型）＝ambientCG Fabric036 × 頂點色（vc_tex）；水壺＝Plastic006 × 顏色；球鞋＝Leather037 × 顏色；獎盃＝Metal009 × 顏色。
  - 球架最上層後排＝Poly Haven `football`（`part=1`＝充飽的那顆；`part=0` 是洩氣的；原貼圖是土黃舊皮球 → `recolor=('#2e2e30','#f4f2ec')` 白色新球）。
  - 重建：純色零件 19%、50,026 面（原 48,824）；沒有別的事後處理（用重建原檔跑過 xsports_unit 等店的測試）。
- `tests/xs_lm_unit.js`：xinsheng_sports instancing 56 → 57（足球）。
- LICENSES 列（我的草稿）：Poly Haven `football`（球架最上層後排的足球，一顆約 540 面）；ambientCG `Fabric036`（衣服）、`Plastic006`（水壺）、`Leather037`（球鞋）、`Metal009`（獎盃）。
- 烘焙：`IN=<重建原檔> bash tools/blender/env_second/lightbake/bake_xs.sh xsports`（約 11 分；glb_fix_instnames 對得上）。
- 截圖鏡頭：`cams.json`（門口參考圖鏡頭、球架、從裡面朝門口、晚上…；其中 shoes、trophy 兩個鏡頭不好：shoes 在樓梯裡面）、`cams_closeup.json`（球架最上層足球、衣架、水壺架、左牆球鞋牆）。
- 老實說：除了足球，畫面變化很小（衣服、水壺、鞋、獎盃只多了材質組細紋，形狀沒動）。
