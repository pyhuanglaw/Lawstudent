# WINVIEW-AUDIT-1105 收尾：公館第三批（安泰藥局 G04、汀州鮮果 G08、榮恩典文具社 G13）窗外照片原位拍（LAWWW2-C 2026-11-14）

## 原本
- 這三間的視差窗借同一條街別間在遊戲裡拍的照片（`view: cvs／noodle／bookstore`），位置差幾十公尺（例如安泰窗外看到捷運出口，實際在它西邊很遠、看不到）。
- 借照片的原因（tz_shops3d.js 註解）：Blender 拍不到遊戲程式畫的校門、圍牆、行道樹。GG-STREET-TREES（`wip/gg_street_trees_1114/`）以後這些都拍得到了。

## 改了什麼
- 照片：`assets/models/env/views/gg_{antai,xianguo,rongendian}_{day,night}.webp`（1024×512，不鏡像）。
  鏡頭＝各店玻璃中心 (x, 1.6, 18.7) 朝北、水平 90°（和汀州路十一間同一套，`wip/shop_views_1112/render.sh`），x＝−18.6／19.6／64.1；
  場景＝公館正式模型＋`--gg-street`＋校門 `campus_gate.glb`＋捷運出口放回遊戲位置＋照遊戲 103 棵樹（`trees_gg.json`）＋遊戲 122 台機車。晚上 `--lamp-k 4 --exposure -0.7`（和汀州路同）。
- `src/data/tz_shops_layout.js`：三間拿掉 `"view"`（照片改用區域名 gg_*）。
- `src/tz_shops3d.js`：註解改成現況。
- `tools/blender/env_second/wz_window_view.py`：`--gg-street` 的人行道加地磚紋（Brick 節點；尺寸照遊戲 `W3.stoneTex`×repeat[40,4]＝錯縫長條磚 1.875 × 0.656 m、淡棕細縫；底色調暖 #e8d2ac）。原本是一整片純色，窗外看是灰的。之後用 `--gg-street` 拍的都會有地磚。
- `docs/art-rebuild/second_ai/wip/shop_views_1112/render.sh`：公館三間的拍法改成上面這套（加校門、樹、捷運出口位置）；`wip/gg_street_trees_1114/trees_gg.json` 一起帶進開發分支（render.sh 會用到）。

## 先將就的
- 14:00 南側整排店面的影子罩住人行道，窗外地面比遊戲裡暗（遊戲的影子比較淡）。不為這個改整套光照，BB 判。
- 人行道上的路燈、車阻沒放（遊戲裡有幾支）；天空單一淺藍（BB P3，四間窗景同一項）。

## 交件（11-14 01:0x UTC）
- **請套 `winview_gg3.patch`**（底 0c49bcf64e；`git apply --check` 在最新開發分支 42100c21e1 上也乾淨；11 檔＝6 張 webp＋tz_shops_layout.js＋tz_shops3d.js＋wz_window_view.py＋render.sh＋trees_gg.json）。
- 六張縮圖：`gg3_views.jpg`（白天／晚上）。安泰：校門在中線偏右、遠處椰林大道；汀州鮮果：窗前是遊戲裡 (22, 11.5) 花台上那棵樹；榮恩典：左前方 x 58 的人行道樹、右邊天橋。人行道有地磚紋。
- 測試（在 0c49bcf64e 上）：tz_shop_views_1112（每間有自己的 1024×512 日夜照片、視差窗位置、viewDepth）、shop_viewpanes／viewpanes2、gg_views_1105／1107、wz_views、place_gate 等全部 ALL PASS。
- 還沒做：瀏覽器沒跑（D131）。請 CC 進三間往窗外拍 14:00、20:00，BB 判。
