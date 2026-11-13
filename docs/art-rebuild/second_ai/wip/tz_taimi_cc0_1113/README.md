# 泰米村食 CC0 版（SHOP-REALISM-1112；LAWWW2-C 2026-11-13）— 已交付，等 LAWWW-C 整合、BB 判
基準：開發分支 0029a82618（OPEN-ONLY-1113 整合後）。整包：`git apply --3way taimi_cc0_full.patch`（含二進位）；只看文字：`taimi_cc0_text.patch`。
對照圖：`cmp_taimi_v1.jpg`（參考圖／舊版／新版，同鏡頭遊戲內畫面：進門 13:00、19:30、櫃台、長椅、街上 13:00／19:30）。

## 玩家會看到的不同
- 椅子 17 張換成 Poly Haven 掃描的梯背木椅（顏色貼圖改深色木頭、保留木紋磨損）＋皮坐墊；長卡座是 ambientCG 皮面、一段一段有接縫，靠枕是鼓起來的織布印花。
- 九盞藤編吊燈、牆上藤編圓盤、層板上的藤籃（ambientCG Wicker010A）；層板上 Poly Haven 蕨類、地上兩盆 Poly Haven 盆栽。
- 廚房上方條紋布篷（自畫圖案×ambientCG 布紋）、後面隔間紅格紋布簾（ambientCG Fabric054）、不鏽鋼（Metal009）、天花板灰泥（Plaster001）。牆照 BB 11-10 規則：乾淨平塗。
- 光影：Cycles 烘成光照貼圖（白天、晚上各一張，uv1），遊戲 attachRoomGLB 自己接（不用改程式）；不烘進顏色貼圖（走得進去的店，日夜要換光）。
- 從街上看進去（shopInsideReal）也乘同一張光照貼圖：外面看、裡面看一樣（§12 第 1 點）。
- 牆上兩張照片原本顯示成菜單碎片（線上版就錯：圖集 512 放不下、UV 變負繞回去）→ 圖集放不下時改 1024，照片對了。

## 檔案
- `tools/blender/env_second/tz_shops_interior.py`：CC0 = SHOP in ('taimi',)；acg()／printed()／ph_obj()／ph_put()（共用給之後五間）。其他店不變。
- `tools/blender/env_second/lightbake/bake_tz_shops.sh`（新）：建模→烘焙→WebP；之後五間加 case。
- `src/zones3d.js`：shopInsideReal 讀 GLB extras.lightmap，MeshBasic 加 lightMap（有 uv1 的零件），白天／晚上照 lmMixAt 換；營業不再乘 LIT、打烊照舊 0.07。
- `LICENSES.md` 九列（Poly Haven 3、ambientCG 6）；`tests/shop_cc0_baseline.json`（--write，泰米拿掉）；`docs/handoff/SHOP_STANDARD_STATUS.md`（place_gate --write）。
- `tests/shop_cc0_unit.js`：**油漆牆（材質 …_wall）不算純色比例**——BB 11-10 規定牆平塗（tz_shops_unit 第 8 項），不是道具；道具照舊算。請 LAWWW-C／BB 看要不要收。

## 測試（wt 在 0029a82618＋本包）
tz_shops_unit、shop_cc0（泰米 OK，純色 17%，零件 30）、tz_shops_notrap_1111、shop_real_inside_1112、tz_shop_views_1112、shop_window3d_1112、tingzhou_unit：ALL PASS；place_gate_unit：ALL PASS（已知未過 26 項不變；泰米「從店外看進去是立體的」照舊 KNOWN-FAIL 等第二層）。
雲端瀏覽器（SwiftShader）同鏡頭 13 張，沒有 pageerror。

## 數字、還沒做的
- GLB 1.07 MB → 約 4.0 MB（貼圖 512：Poly Haven 顏色＋法線、ambientCG 顏色＋法線）＋光照貼圖兩張約 270 KB；畫的三角形約 3.5 萬。手機效能還沒量（請 CC 排）。
- 光照貼圖 1024：椅子碎面多，地板、牆分到的像素偏少——近看地上的光斑較糊；要更清楚可以改 2048 或把椅子的份量調低（下一版）。
- 從街上看進去的光照貼圖：貼圖載入前那一下沒有預先上傳（一兩幀）。
- 菜單板、照片仍是參考圖裁的；收銀、醬料瓶、蘭花還是小的頂點色零件。
