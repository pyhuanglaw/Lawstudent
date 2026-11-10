# SIGN-RECTIFY-1110 之前照參考圖做的店面：斜的招牌重新拉正（LAWWW2 帳號 A，2026-11-10）

使用者 11-10 20:0x：「之前…依照我的參考圖深層的店面他的參考圖是招牌是斜的結果遊戲裡也是寫的你幫我檢查…招牌如果是斜的看起來不合理的你就幫我重新製作招牌，依照我的參考圖把招牌截出來就是像你現在這樣做成正的」（UA-LAWWW2-1110-07）。

狀態：**公館五塊交件（第 1 包，待整合）**；新生南路、溫州街的貼圖集已經換好，GLB 還沒換（第 2、3 包）。遊戲截圖還沒有（CC，D131）。

## 第 1 包：公館（LAWWW 20:00：三顆 GLB 分開交、公館先）
- `gg_signs_rectify.patch`（底：開發分支 70047bb79，`git apply --check` 乾淨）：`assets/models/env/second_ai/gongguan_shops.glb`（只換嵌入的 `gg_fronts_atlas` 那一張圖；9,889,432 → 9,989,912 bytes）、`gongguan_shops.json` 的 bytes、新工具 `tools/blender/env_second/glb_replace_image.py`。
- 做法：`embed_tool.py` 從 GLB 取出原本嵌入的圖集當底，只把五塊招牌（青木茶室、頁間書屋、慢輪單車、afar、轉角唱片）拉正後貼回原本那一格，其他格子一個像素都不動；`glb_replace_image.py` 換回 GLB。
- 驗證：nodes／meshes／materials／accessors／textures 的 JSON 完全相同；除了那一張圖以外，所有 bufferView 的內容 md5 相同（幾何、UV、導航相關的都沒動）。
- `gg_glb_before_after.jpg`：GLB 上五塊招牌的前後（Workbench 預覽、不打光；每間上下兩塊＝騎樓梁靠街那一面、店面上方）。
- 回歸（打 patch 後）：gg_glow_shoplit、gg_shoplit_reentry、prop_restand、street_props_nav、zq_arcade_seat、singleside_streets、zone_prefetch、gg_interiors_1104、gg_shops2_1104 ——9 支 ALL PASS。
- 沒有新的測試：這是換圖，數得出來的只有「其他內容不變」（上面的 md5 比對）；招牌正不正要看圖（BB 判）。

## 第 2 包：新生南路；第 3 包：溫州街（11-10 20:2x）
- `xs_signs_rectify.patch`：`xinsheng_street.glb` 只換 `xs_fronts_atlas`（山嵐書店、同弦樂器、大口漢堡、南洋戲院四格）；2,070,708 → 2,130,724 bytes。
- `wz_signs_rectify.patch`：`wenzhou_street.glb` 只換 `wz_fronts_atlas`（SUNNY SIDE、小路、2:30 AM 三格）；10,279,468 → 10,312,288 bytes。
- 三個 patch 互相獨立；`glb_replace_image.py` 在第 1 包（公館）的 patch 裡。底都是開發分支 70047bb79。
- 驗證同第 1 包：其他 bufferView md5 相同、nodes／meshes／materials／accessors 相同。回歸 14 支 ALL PASS（offbeat_storefront、singleside_streets、lampshade_flip、street_props_nav、wz_slim、wz_vc_pack、wz_copy_shop、xs_door_labels、xinsheng、cafe230_nobldg_nav、xs_planters、xs_farview、zone_prewarm、zone_prefetch）。
- **沒有在 GLB 上看過這兩包的招牌**（公館那包有 `gg_glb_before_after.jpg`；這兩包只有圖集的前後 `before_after.jpg`）：要 CC 的遊戲截圖。
- **這兩包換了不一定看得到的**（查 GLB 的圖才發現）：
  - 2:30 AM 的招牌在它自己的模型 `cafe230.glb`（貼圖 `a23_print`），不在 `wenzhou_street.glb`；`wz_fronts_atlas` 的那一格可能沒有在用。
  - 日常失速的招牌在 `offbeat_storefront.glb`（`offbeat_storefront_bake`，烘焙貼圖），這次沒有換。
  - SUNNY SIDE、小路在 `wz_signs_atlas` 也各有一格（sign_atlas.py），遊戲實際用哪一格要看截圖。
  - → 這四塊（2:30 AM、日常失速、SUNNY SIDE、小路）等 CC 截圖確認哪一張圖在用，再換那一張。

## 第 3 包第二版：溫州街補齊（11-10 20:3x；LAWWW 20:09：補齊再一次交）
- `wz_signs_rectify.patch` 換成第二版：`wenzhou_street.glb` 換兩張圖——`wz_fronts_atlas`（SUNNY SIDE、小路、2:30 AM 三格，同第一版）＋ **`wz_signs_atlas`（溫州書屋、夏日冰菓室、帝大紅茶、SUNNY SIDE、小路五格）**；10,279,468 → 10,415,748 bytes。SUNNY SIDE、小路兩張圖裡的那一格都換了，遊戲用哪一張都是正的。
- `wz_signs_atlas_after.jpg`：換完的整張圖集。第二批三塊的四個角：溫州書屋 [(544,304),(1516,90),(1516,256),(544,410)]、夏日冰菓室 [(410,118),(964,244),(956,336),(400,258)]、帝大紅茶 [(230,176),(994,326),(990,402),(224,326)]（參考圖 `wip/wz_second_1104/ref/`）。
- 回歸 10 支 ALL PASS（offbeat_storefront、singleside_streets、lampshade_flip、street_props_nav、wz_copy_shop、wz_slim、wz_vc_pack、cafe230_nobldg_nav、zone_prewarm、zone_prefetch）；其他 bufferView 不動（工具只動那一張圖）。
- **2:30 AM**：查了 `cafe230.glb` 的 `a23_print`——它自己的招牌是程式畫的、本來就是正的，**不用改**。
- **日常失速**：`offbeat_storefront.glb` 是整間烘焙（招牌烘在光照貼圖裡，認不出哪一塊），不能直接換圖；要用拉正的 `offbeat_sign` 重烘。等 CC 的遊戲截圖看它在遊戲裡斜不斜再做（還要先修右上角補色的直條紋）。**這一塊還沒做。**

## 盤點（看圖集的每一塊招牌）
- 原因：`xs_front_tex.py` 本來就會把參考圖上的四邊形拉正，但之前量的四個角不準（有的直接用長方形、有的把屋簷、燈、隔壁的招牌一起框進去），所以拉完還是斜的。
- 斜的、這次重做（13 塊）：
  - 公館 `gg_fronts_atlas`：青木茶室、頁間書屋、慢輪單車、afar、轉角唱片。
  - 新生南路 `xs_fronts_atlas`：山嵐書店、同弦樂器、大口漢堡（原本左邊還框到隔壁的小招牌）、南洋戲院（原本連燈箱的側面、底面一起框）。
  - 溫州街 `wz_fronts_atlas`：日常失速、SUNNY SIDE、小路、2:30 AM。
- 正的、不動：洋洋鹹酥雞、日和便利店、Daybreak、大步球鞋、好拍運動、新生運動廣場（橫、直）、大口漢堡直立、林家乾麵、阿德影印輸出。
- **還沒做**：`wz_signs_atlas`（sign_atlas.py）裡的溫州書屋、夏日冰菓室、帝大紅茶也是斜的（第二批；參考圖在 `wip/wz_second_1104/ref/`）。

## 做法
- `zoom_tool.py`：把參考圖的招牌那一塊放大、畫每 50 px 的格線和座標，對著板子的四個角量。
- `rect_tool.py`：四個角透視拉正；板子被參考圖的邊切掉的地方（日常失速的右上角）用同一欄旁邊的底色補。
- 每一塊拉正後貼回圖集原本的那一格（格子的位置、大小、UV 都不變 → GLB 的幾何和 UV 不用動，只要換圖）。
- `xs_front_tex.py` 的 Q／QW／QG 表裡十三塊招牌的四個角一起改了（之後重跑也是正的）。
- `before_after.jpg`：左＝原本、右＝這次（十三塊）。

## 還沒做
1. 把新的三張圖集放進 `gongguan_shops.glb`、`xinsheng_street.glb`、`wenzhou_street.glb`（GLB 裡是嵌入的 WebP：換圖或重建）。
2. 第二批三塊（溫州書屋、夏日冰菓室、帝大紅茶）。
3. 拉正以後板子的長寬比和原本那一格不完全一樣（例：慢輪單車原本框到 808×150，拉正後的板子約 805×120）：字會稍微被拉高，要在 GLB 裡看過，太明顯就調 3D 招牌板的高度。
4. 日常失速右上角補的底色有直條紋，要再修。
5. 交件給 LAWWW；遊戲截圖 CC 拍（D131）。
