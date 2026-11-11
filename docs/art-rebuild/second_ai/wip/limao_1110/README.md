# LIMAO-SHOP-1110 禮貌生財 第 1 版（LAWWW2 帳號 A，2026-11-11）

狀態：**READY_FOR_REVIEW（已交付 LAWWW）**。Blender 預覽不是遊戲截圖（D131）。

- patch：**`limao_v1_plus_bb255.patch`（一個檔：禮貌生財＋BB_255 三項修正，27 個檔）**；基底 dev `57181feb2`（夜市已在開發分支），`git apply --3way` 乾淨。BB_255 那三項的說明在 `../bb255_fix_1111/README.md`。
- 全部 Node 測試 1242 支（`regression_full.log`，在 57181feb2＋這一包上跑）：log 裡有四支 FAILED，都查過——①`tingzhou_walkers_1110_unit` 第 3 項是我的錯（禮貌生財的門用了 `tzShop`，店門數變成 30），**已修**（改成 `tzLimaoDoor`），修完和汀州路／店內／機車有關的測試全部重跑 ALL PASS；②`aa401_kx_khh`、`termend_friend_1110`、`termend_opts_1110` 三支在**沒有套 patch 的開發分支上也一樣失敗**：測試要讀企劃線的 commit `1cf434dee`，我的容器沒有抓那個分支；`git fetch origin claude/story-planning` 以後三支 ALL PASS，和這一包無關。
- 依據：規格 dev `docs/handoff/user_specs/LIMAO_SHENGCAI_1110.md`（X332）；使用者 11-10 23:1x 對 LAWWW 選「開始做，聊天免費」、位置照我的提案；使用者 11-11 給的外觀圖 `../../ref/night_market_1110/concept/shop_limao_shengcai_exterior.webp`。室內沒有圖，照規格文字＋外觀圖從門看進去的樣子。
- 預覽：`preview/blender_exterior_front.webp`（騎樓裡看店面）、`blender_table_open_closed.webp`（算命桌營業／收攤）、`blender_interior_workbench.webp`（室內形狀；這個預覽不顯示頂點色）、`blender_interior_cycles.webp`（室內顏色；隔牆、掛畫、玻璃櫃在這張是黑的——是 Cycles 對單面化以後重疊的正反面的假影，模型的顏色和法線查過是對的，遊戲裡不會）。

## 做了什麼
| 項目 | 內容 |
|---|---|
| 位置 | 巷 A 後段南側靠公館那一端（x 25.5～31）：原本那一棟 `TA_S` 縮短到 x 19～25.5，這一段另外一棟 `TA_LIMAO`（四層老公寓、米灰小方磚），**一樓退 3 m 成騎樓、兩根騎樓柱**（規格：傳統騎樓柱、騎樓下的算命桌） |
| 店面 | 左邊深色木框格子窗（後面是店內的景）、右邊開著的深色木框門；招牌「禮貌生財」深紅棕木板古銅金書法字——**直接從使用者的圖拉正裁**（沒有另外找字型）；兩盆植物 |
| 算命桌 | 在騎樓下、窗前：深色木桌＋暗紅絨布桌布、黃銅桌燈、木籤筒、茶杯、筆記本、羅盤、命盤、空白小木牌、兩張深色木椅（上師靠窗、客人靠巷子）、一盆高的植物。**沒有布幔**（外觀圖沒有；之前和使用者說過不放）。節點 `LIMAO_TABLE_open`／`LIMAO_TABLE_closed`（桌上的東西收掉、蓋紅灰帆布、椅子收到窗下）／`LIMAO_SHOPLIGHT`（紙燈籠），在攤位那一顆 `tingzhou_stalls.glb` 裡 |
| 通道 | 桌子在騎樓東半，門在西半；門前通道 ≥ 1.5 m（測試量）。巷子本身不佔 |
| 時間 | 配置 `limao.from／to`＝19:00～23:30（提案）；`TZ3.limaoOpen(h)`；關著的時候門的互動點變成「看」 |
| 室內 `tz_limao` | 4.6 × 10 m。前半命理館：西牆整面深色木書櫃（命理書、線裝書、櫃頂籤筒）、東牆玻璃門木櫃（茶具、小擺設）、圓茶桌＋三張木椅＋茶壺茶杯、兩盞紙燈籠、隔牆上的山水掛畫、東牆書法掛軸、兩盆植物、灰米色地磚。一道到天花板的隔牆＋一扇普通的深色木門 |
| 書房（鎖著） | 後半 4.6 × 3.8 m：西牆、北牆整面深色木書櫃（刑法、德文書、舊法典的色調）、老式木書桌（綠罩檯燈、手稿和舊講義、攤開的書、鋼筆、眼鏡、便條紙）、木椅、舊地毯、東牆矮櫃（舊講義、裝信的木盒、小獎座）、學術合照和兩張獎狀、地上的書堆。模型節點 `STUDY_*`（平常不顯示）、`STUDY_DOOR_*`（關著的門）、`STUDY_LID_*`（從上面看是深色的屋頂，擋住剖面視角） |

## 給 LAWWW 接的
- 街上：`zone.tzLimao＝{open, masterAway, table, door, nodes}`；`zone.tzLimaoOff＝true` 今天不開；`zone.tzLimaoAway＝true` 店開著上師不在（桌子照舊是營業的樣子，只有 `masterAway` 變 true，NPC 你不放）。
- 上師坐的位置：配置 `limao.table.seatMaster`（29.35, 4.6，面向巷子）；客人：`seatGuest`；桌前的互動點（免費算命、聊天）：`limao.table.at`（28.3, 3.3，r 1.0）——**這個互動點我沒有放**，句子和選單是 AA／你的。
- 門：`zone.tzLimao.door`（標記 `tzLimaoDoor:true`；不用 `tzShop`，那是配置 shops 裡的店）的互動點，開著＝「進禮貌生財」→ `tz_limao`；關著＝「看禮貌生財」＋一句暫定的「門關著，裡面沒有開燈。」（AA 可以改）。
- 室內：`zone.shopClerk`（茶桌旁的椅子，上師在店裡的時候）、三個座位 `limao_t1`、看書櫃／玻璃櫃／掛畫 `tz_limao_books／_cabinet／_scroll`、書房的門 `tz_limao_study_door`。
- **書房解鎖**：`TZS3.studyOpen(L)` 預設回傳 false——請改成看存檔旗標（配置 `study.flag＝'LIMAO_STUDY_OPEN'`，名字可以換）；或事件裡直接 `zone.setStudy(true)`。解鎖以後多三個互動點 `tz_limao_study_books／_desk／_photo` 和書桌的座位 `limao_desk`。
- `tests/tingzhou_unit.js` 第 7 項（樓房數）改成「店數＋4」（多一棟 TA_LIMAO）。

## 已知的缺點（第 1 版）
- 上師的 3D 人物還沒做（下一件；人物圖 dev `docs/handoff/user_specs/limao_ref/shangshi_character.png`）。
- 窗後面、門裡面是外觀圖裁的平面景（景深卡 0.8 m），不是真的看進室內；和室內實際的擺設大致像、不完全一樣。
- 開著的門扇沒有做（只有門洞）；招牌上的鵝頸燈只有一顆發光的小球。
- 室內的書是一格一格的色塊（沒有書名）；掛畫、合照是色塊；植物是簡單的葉片。沒有烘焙光照。
- 汀州路的鏡頭碰撞（樓房的方盒）沒有為騎樓挖洞：在騎樓裡鏡頭可能比較貼近，要看遊戲。
- 巷 A 靠公館那一端看出去的樣子（圖上是「巷口轉角、旁邊小巷通往夜市」）只做到「巷子裡靠公館端的一樓店面」。
