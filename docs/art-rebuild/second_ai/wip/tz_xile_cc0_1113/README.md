# 泰米 v3（BB_379 相框）＋ 洗樂洗衣坊 CC0 版（SHOP-REALISM-1112；LAWWW2-C 2026-11-13）— 已交付
**套法**：開發分支 68143cd4ca（已有泰米 v1＋v2）上 `git apply --3way taimi_v3_xile_cc0.patch`（含 GLB／光照貼圖二進位；用暫存 index 在 68143cd4ca 試套過，乾淨）。
`docs/handoff/SHOP_STANDARD_STATUS.md` 不在 patch 裡（上游重產過會衝突）：套完跑 `node tests/place_gate_unit.js --write`。

## 泰米 v3（BB 相框 FAIL＋P3）——對照圖 cmp_taimi_v3.jpg
- 相框四幅改直放，畫心換成四張不同的泰式主題圖：參考圖右牆的葉子版畫、辣椒版畫，菜單板上的綠咖哩、泰式奶茶（參考圖裁、校正透視，放進照片圖集；框照舊 Poly Haven fancy_picture_frame_01）。
- 垂吊盆栽左牆多掛三盆（左牆一整排四盆）。
- 腳本：ph_put 加 roll（相框橫的改直的）。

## 洗樂洗衣坊 v1（CC0）——對照圖 cmp_xile_v1.jpg
- 洗衣機、烘衣機、兌幣機機身、滾筒門圈（倒角環＋凹進去的深色玻璃＋門把）、層架、水槽、椅子鋼樑、鋁窗框：ambientCG Metal009（不鏽鋼）；控制面板、底座：黑鐵。
- 洗衣精販賣機、洗衣籃、日光燈具、冷氣：ambientCG Plastic006（白）；候位椅座殼、藍色洗衣籃：Plastic006（淺藍；座面前緣下彎、靠背後仰）。
- 層板植物：Poly Haven fern_02 三盆；天花板灰泥（白）。牆照舊乾淨平塗。
- 光：六支日光燈面光源＋補光，烘白天／晚上光照貼圖（bake_tz_shops.sh 加 xile）。
- 修：CC0 的窗框原本一律深色木頭（泰米），鋁框的店（洗樂）改不鏽鋼。

## 測試（0eb8ce091a＋v2＋本包，等同 68143cd4ca＋本包的店面部分）
tz_shops、shop_cc0（泰米 OK 純色 12%；洗樂 OK 純色 24%，基準表拿掉洗樂）、notrap、shop_real_inside、tz_shop_views、shop_window3d、tingzhou、place_gate：ALL PASS。雲端瀏覽器 6＋6＋4 張沒有 pageerror。

## 還沒做的
- 洗樂：烘衣機滾筒裡面是深色玻璃（參考圖看得到不鏽鋼內筒）；使用說明海報、販賣機裡的瓶子還是頂點色小零件。
- 手機效能：泰米 GLB 4.8→約 5 MB、洗樂 0.7→1.8 MB，請 CC 量。
