# CHARACTER_ART_SPEC — 正式 2D 立繪／背景／CG 製作規格

給外部 image generation pipeline（或美術）用。所有人物皆為虛構；不要模仿任何特定現役藝術家風格，建立本作統一的美術語言。

## 0. 整體美術方向

- Contemporary Japanese visual-novel / romance ADV inspired；青年漫畫 × 女性向 ADV × 現代校園劇之間。
- 大學生／成年人，**自然人體比例（7–7.5 頭身）**、成熟但年輕、乾淨線稿、細緻頭髮、**自然眼睛比例**（不是巨大眼睛）、柔和但有層次的上色、現代服裝。
- 不要：幼兒風、Q 版、chibi、極端萌系、日本高中制服、粉紅愛心 UI 感。
- 世界是**台北**：夏季短袖、薄外套、帆布袋、後背包、雨傘、安全帽、手搖飲料杯、筆電、平板、講義、便利商店用品。避免所有人看起來像日本高中生。
- 統一：同一光源方向（左上柔光）、同一線稿粗細、同一膚色處理，讓五位主角站在同一畫面不違和。

## 1. 圖片規格

- 立繪：PNG 或 WebP，**透明背景**，全身或膝上（bust 也可，但同一角色所有表情要同一取景），建議 **1200×2000 px（3:5）**，人物頂到頭頂留 4% 空白，底部到膝或腳。
- 同一角色所有 outfit×expression 圖：**頭部位置與大小一致**（切換表情時不能跳動）。
- 背景：WebP，**1920×1080**（橫向）＋ 同場景 **1080×1920**（直向裁切版可選）。
- Event CG：WebP，1920×1080。
- 檔名小寫英文與底線；不含空白。

## 2. 命名與資料夾

```
assets/portraits/<character_id>/<outfit>/<expression>.webp
assets/backgrounds/<bg_id>.webp
assets/cg/<character_id>/<cg_id>.webp
```
`character_id`、`outfit`、`expression` 必須與 `PORTRAITS`（src/data/characters.js 自動生成）與事件資料一致。圖片放進正確路徑即生效，不需改程式。

## 3. 表情集

- Tier 3（五位女主角）：neutral, smile, laugh, surprised, embarrassed, annoyed, sad, serious, tired, thinking（每套服裝各 10 張；可先只做 campus 套，其餘 fallback 到 campus）
- Tier 2（熟同學、室友、學長姊、重要研究生／教授）：neutral, smile, annoyed, surprised, sad, thinking（campus 一套）
- Tier 1（不熟同學、通識同學）：neutral, smile

## 4. 服裝集（Tier 3）

- `campus`：平日上課（每人不同，見 bible）
- `casual`：週末／約會／出遊
- `formal`：面試、實習、口試、正式場合（白襯衫＋深色西裝褲或套裝）

## 4.5 目前的正式 master（2026-09-27）

使用者提供的五人合圖（`assets/portraits_source_sheet.png`，1198×1313）已用 `tools/cut_portraits.py` 切成五張透明背景 `campus/neutral.webp`。之後的表情差分請以這五張為 identity 基準（同一張臉、同一構圖、同一頭部位置）。缺的項目見 `docs/MISSING_EXTERNAL_ART.md`。

## 4.6 NPC PORTRAIT COVERAGE（誰需要什麼）

| Tier | 誰 | 需要 | 沒有時 |
|---|---|---|---|
| 0 AMBIENT | 路人、騎士 | 無 | 不進 ADV |
| 1 MINOR TALKING | pool_1–20、npc_fangyt、npc_huangxh | 1 張 bust neutral（可共用身體模板，臉／髮／配色依人變） | compact 對話 |
| 2 RECURRING | kai、zhe、yu、五位熟同學、npc_ta_chen；教授 neutral/speaking/serious | neutral, smile, serious, annoyed／surprised | compact 對話 |
| 3 CORE | 五位女主角 | 完整 set（10 表情 × campus/casual/formal） | 只用 neutral（目前） |

程式面：`ADV.hasProductionPortrait(id)`、`ADV.portraitQuality(id)`（production / temporary / missing）；`ADV.resolve()` 只把 manifest（`src/data/portrait_manifest.js`，build 自動掃描）裡存在的檔案放進 fallback 鏈。沒有檔案 → compact 模式：模糊 3D 背景＋姓名＋對話框，**玩家版本永不顯示 placeholder 標籤**；`?dev` 才顯示 `MISSING_PORTRAIT id · outfit · expression`。

## 5. 五位女主角 Character Bible

### heroine_01 沈以安（小安）— 法律系一年級，19 歲，166 cm，處女座
- AGE APPEARANCE：19–20，青春但沉穩。
- FACE：鵝蛋略窄，下巴清楚；EYES：細長、眼尾微上、眼神有神；眉毛清晰略平。
- HAIR：深棕色**長髮綁馬尾**（固定），自然髮際線，額前與側邊少量碎髮，馬尾長度到肩胛下。
- BODY：166 cm（正式），纖細但不瘦弱，肩線平。MAIN CHARACTER READABILITY：漂亮但自然的臉、有辨識度的眼型、高馬尾＋自然碎髮、米杏／深藍、安靜認真稍有距離感；第一眼就不是 ambient NPC，但仍是可信的大一學生。
- CLOTHING（campus）：米杏色針織上衣＋深藍寬褲＋深棕樂福鞋；帆布托特包；簡單手錶。casual：白 T＋牛仔褲＋帆布鞋＋薄襯衫外套。formal：白襯衫＋黑西裝褲。
- PALETTE：米杏／深藍／深棕；點綴白。
- POSTURE：站得直，手常抱著書或講義；思考時會用筆敲下巴。
- DEFAULT EXPRESSION：neutral 偏認真，smile 是嘴角先動、眼睛慢一拍。
- DISTINCTIVE：馬尾、俐落眉、托特包。

### heroine_02 林芷若 — 外國語文學系二年級，20 歲，161 cm，天秤座
- AGE：20，成熟一點，像已經在打工。
- FACE：圓潤柔和；EYES：圓、笑起來會瞇成線；笑起來有酒窩。
- HAIR：黑色及肩微捲，常撥到一側耳後；看書時戴細框眼鏡（`thinking`/`serious` 可戴眼鏡）。
- BODY：161 cm（正式），身形柔和。
- CLOTHING（campus）：亞麻襯衫（米白）＋深咖啡寬褲＋帆布鞋；銀色小耳環；電影票根夾在筆記本。barista 變體（campus 套可加圍裙版：`campus_apron` 選配）。casual：碎花連身裙＋薄針織外套。formal：淺灰套裝。
- PALETTE：米白／亞麻／咖啡；點綴銀。
- POSTURE：放鬆、常一手插口袋、講話時手勢多。
- DEFAULT EXPRESSION：smile（social face）；neutral 反而少見，用在她獨處時。
- DISTINCTIVE：酒窩、細框眼鏡、銀耳環。

### heroine_03 陳語彤 — 社會系一年級，19 歲，159 cm，巨蟹座
- AGE：19，看起來比實際安靜、早熟。
- FACE：小臉、下巴尖；EYES：黑、直視、眨眼慢；眉毛淡。
- HAIR：黑色齊肩直髮、髮尾內彎，不綁；手腕上總有一條髮圈。
- BODY：159 cm（正式），瘦，肩窄。低調但要有辨識度；不能畫成陰沉或病弱。
- CLOTHING（campus）：深色素 T（墨綠或炭灰）＋直筒牛仔褲＋白帆布鞋＋黑色後背包；雨傘常掛在包上。casual：連帽外套＋短褲。formal：黑襯衫＋黑褲（她沒有套裝）。
- PALETTE：炭灰／墨綠／黑；點綴白鞋。
- POSTURE：雙手常握著背包肩帶；站著時重心偏一腳。
- DEFAULT EXPRESSION：neutral（幾乎面無表情），smile 很短、很淡；`sad`/`tired` 是她重要的表情。
- DISTINCTIVE：手腕髮圈、內彎髮尾、雨傘。

### heroine_04 高子晴 — 資訊工程學系二年級，20 歲，169 cm，水瓶座
- AGE：20，精力旺盛。
- FACE：臉型偏長、顴骨清楚；EYES：大而直接，笑起來全開；眉毛粗而有型。
- HAIR：深棕短髮（耳下），瀏海隨手撥，髮尾外翹。
- BODY：169 cm（正式），高、手長腳長，微微駝背（久坐寫程式）。中性俐落、動態感最強；不要刻板化成宅女。
- CLOTHING（campus）：oversize 灰藍連帽外套＋黑短褲＋白球鞋（黃底）；背吉他袋；耳機掛脖子；手機殼貼滿貼紙。casual：樂團 T＋工裝褲。formal：她會穿得很不習慣：黑襯衫塞進西裝褲、球鞋。
- PALETTE：灰藍／黑／白；點綴黃。
- POSTURE：站姿隨性、常一腳踩在牆上；講話手舞足蹈。
- DEFAULT EXPRESSION：laugh／smile；`annoyed`（被問「為什麼不比賽」時）與 `serious` 反差重要。
- DISTINCTIVE：短髮外翹、吉他袋、耳機、貼紙手機殼。

### heroine_05 溫書瑀（溫學姊）— 法律系三年級，21 歲，172 cm（固定），雙子座
- AGE：21，看起來像已經在上班。
- FACE：輪廓清楚、額頭寬；EYES：銳利、上揚，疲倦時泛紅（`tired` 表情要看得出來）。
- HAIR：深棕低馬尾，一絲不苟；讀書時會把筆插在髮圈上。
- BODY：172 cm（固定），挺拔。成熟但仍然只有 21 歲，不要畫成 30 歲上班族；判決節錄／保溫瓶／識別證是 CONTEXTUAL PROPS，不要永久掛在身上。
- CLOTHING（campus）：白襯衫＋卡其長褲＋樂福鞋；隨身判決節錄（A4 夾）、保溫瓶、法服名牌識別證掛脖子。casual：深藍條紋上衣＋長裙。formal：黑套裝（她的 formal 最自然）。
- PALETTE：白／卡其／深棕；點綴法服綠（識別證）。
- POSTURE：站姿標準、手常抱著資料夾；講話速度快、手指會點資料。
- DEFAULT EXPRESSION：serious；`smile` 少而珍貴；`tired` 是她故事線的關鍵表情。
- DISTINCTIVE：低馬尾、識別證、判決節錄夾、保溫瓶。

## 6. Tier 2 人物摘要（campus 一套、6 表情）

- zhe 阿哲（張哲維）：175 cm，運動型，短髮微捲，黃色系籃 T＋牛仔褲＋藍球鞋，後背包，總是笑。
- yu 小語（李語晴）：163 cm，深棕波浪中長髮，白 T＋酒紅短裙＋帆布鞋，肩背小包，社團徽章很多。
- kai 阿凱（王凱翔）：172 cm，黑短髮、黑框眼鏡，灰藍連帽 T＋深牛仔褲，黑背包，眼下有黑眼圈。
- classmate_bohan 許柏翰：172 cm，黑短髮整齊、方框眼鏡，淺藍襯衫扣到頂＋深灰西裝褲，黑背包。
- classmate_xinci 吳芯慈：160 cm，黑長直髮，淡紫開襟針織＋深灰及膝裙＋樂福鞋，米色托特包，筆袋很大。
- classmate_mingxuan 江明軒：178 cm，運動型，深色短髮，墨綠 T＋黑牛仔褲，肩背包，球鞋。
- classmate_youchen 賴宥辰：175 cm，栗色微長髮蓋眉，黑襯衫敞開內搭酒紅、黑褲、黃底球鞋，戴戒指。
- classmate_peishan 郭沛珊：163 cm，黑低馬尾、圓框眼鏡，酒紅 T＋深藍長裙＋黑帆布鞋，米色托特包，手上一本哲學書。
- npc_ta_chen 陳助教：176 cm，25 歲，黑微長髮、無框眼鏡，深灰開襟外套＋深褲，肩背包，永遠有點累。
- prof_zhou 周教授：60 歲上下，灰髮、金框眼鏡，淺灰襯衫＋深色西裝褲，嚴肅。
- prof_lin 林教授：50 歲上下，灰黑鮑伯短髮、細框眼鏡，米白襯衫＋深藍長褲，溫和。

## 7. 背景圖需求（bg_id）

law_classroom_day / law_classroom_evening / library_day / library_night / cafe_day / cafe_evening / cafe_rain / dorm_night / campus_sunset / campus_rain / royal_palm_road_day（椰林大道） / gate_night（校門） / noodle_shop_night / gongguan_night / wenzhou_alley_dusk。
目前事件用 `background:'blur'|'freeze'` 直接以 3D 當背景；提供圖片後在事件把 background 改為 `{image:'assets/backgrounds/<bg_id>.webp'}`。

## 8. Event CG 需求（第一批）

- cg_library_rain_heroine03：雨天總圖門口屋簷下，語彤看雨，玩家在她旁邊（第一人稱視角或背影）。
- cg_cafe_dusk_heroine01：兩點半 Café 窗邊雙人桌，黃昏橘光，小安看向窗外。
- 之後：告白／分手／放榜／畢業等（見需求清單），普通對話不用 CG。

## 9. Portrait registry 格式

見 `src/data/characters.js` 末尾：`PORTRAITS[id] = {characterId, displayName, tier, defaultOutfit, defaultPortrait, outfits:{outfit:{expression:path}}, silhouette}`。新增人物時只要在 `CHARACTERS` 加 `portrait:id` 與 `visual_tier`，registry 自動生成路徑。

## 10. 驗收清單

- 同角色所有表情：頭部位置／大小一致、透明背景乾淨無白邊。
- 五人並排：身高差正確（語彤最矮 158、子晴最高 170）。
- 沒有高中制服、沒有巨大眼睛、沒有 Q 版。
- 台北大學生穿搭（可加：手搖杯、雨傘、安全帽作為 casual 配件）。
