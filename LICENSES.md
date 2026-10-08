# 第三方素材與授權

| 項目 | 來源 | 授權 | 使用方式 |
|---|---|---|---|
| three.js r187dev | https://github.com/mrdoob/three.js （git clone，2026-09） | MIT | `lib/three.bundle.js`：core＋modules 打包成 classic script；`lib/three.jsm.bundle.js`：GLTFLoader、SkeletonUtils、BufferGeometryUtils |
| Draco decoder（`draco_decoder_gltf.js`） | https://github.com/google/draco | Apache-2.0 | 只在離線工具 `tools/undraco.js` 用來把 Draco 壓縮的 glTF 解成未壓縮 GLB；遊戲執行期不載入 |
| palm-detailed-long, tree-big（Kenney） | market.pmnd.rs（github.com/pmndrs/market-assets，creator: kenney） | CC0 | `assets/models/env/palm-detailed-long.glb`（椰林大道棕櫚）、`tree-big.glb`（校園針葉樹） |
| low-poly-tree, bench, cup, cup-saucer, glass, bottle, plate（Sara Vieira 等） | market.pmnd.rs（github.com/pmndrs/market-assets） | CC0 | `assets/models/env/*.glb`：校園闊葉樹、長椅、咖啡廳／圖書館小道具 |
| bowl-broth, rice-ball, soda-can, sandwich, pizza-box, chopstick, bag, bag-flat | market.pmnd.rs（github.com/pmndrs/market-assets） | CC0 | 麵店、便利商店、教室、宿舍小道具 |
| readyplayer.me.glb（Ready Player Me 範例 avatar） | three.js examples/models/gltf | Ready Player Me 範例模型（three.js 倉庫內附）；**僅原型測試用** | `assets/models/char/rpm_sample.glb`：v8 以前的 TEMP_PLAYER_DEV_MODEL；**v9 起不再載入**（正式模型載入失敗時退回程序化人物，並在 `?dev` 顯示錯誤） |
| Xbot.glb 的 Mixamo 動畫（idle/walk/run/agree/headShake） | three.js examples/models/gltf/Xbot.glb（Mixamo） | Adobe Mixamo 條款：可用於專案，不可單獨再散布動畫檔 | `assets/models/char/mixamo_clips.glb`：已移除網格，只保留骨架與動畫；執行期重定向到主角骨架 |
| Michelle.glb, Soldier.glb, Xbot.glb, readyplayer.me.glb（完整） | three.js examples（Michelle／Soldier／Xbot 為 Mixamo 角色） | 各檔說明；Mixamo 檔案依 Adobe 條款不可單獨再散布 | **只在 `test_glb.html` / `test_rpm.html` 實驗用；未打包進遊戲。** 依使用者要求「全部放上 GitHub」而放在 `assets/models/`；正式發佈前應移除或改用可再散布的檔案 |
| @pixiv/three-vrm（three-vrm、three-vrm-core、materials-mtoon、springbone、node-constraint、materials-v0compat、hdr-emissive-multiplier） | https://github.com/pixiv/three-vrm （git clone，2026-09；以 esbuild 從 TypeScript 原始碼打包） | MIT | `lib/three-vrm.bundle.js`：classic script（global `THREE_VRM`），只含 WebGL 版（不含 WebGPU/TSL 的 MToonNodeMaterial） |
| Seed-san.vrm（VirtualCast, Inc.） | vrm-c/vrm-specification `samples/Seed-san/`（git clone，2026-09） | VRM Public License 1.0（avatarPermission everyone、commercialUsage corporation、allowRedistribution true、modification allowModificationRedistribution、**creditNotation: required**） | `assets/models/char/vrm_player.vrm`：v8 以前的玩家（祐廷）3D 模型；**v9 起遊戲不再載入**（改用 VRoid CC0 改作的 `vroid_yuting.vrm`），檔案仍保留在 repo，所以署名仍需保留。本專案修改：機械手臂／背包／配件 mesh 隱藏（`hide`）、服裝貼圖改成墨綠 T-shirt＋炭灰長褲（`tools/recolor_player_vrm.py`）、貼圖縮小。**必須標示：「Seed-san by VirtualCast, Inc.」**（已寫在遊戲說明頁） |
| 五位女主角 2D 立繪（`assets/portraits/*/campus/neutral.webp`、`assets/portraits_source_sheet.png`） | 使用者提供（2026-09-27 合圖） | 使用者自有素材 | `tools/cut_portraits.py` 去背切圖；ADV 立繪 |
| VRM1_Constraint_Twist_Sample.vrm（(c) 2022 pixiv Inc.） | three-vrm 倉庫 `packages/three-vrm/examples/models/` | VRM Public License 1.0（meta：avatarPermission everyone、commercialUsage corporation、allowRedistribution true、modification allowModificationRedistribution、creditNotation unnecessary） | `assets/models/char/vrm_sample.vrm`：v8 以前小安（heroine_01）的 3D 模型，**v9 起不再載入**；貼圖已縮小（2048→≤1024、移除縮圖，10.5 MB→4.9 MB），其餘未改。正式版應換成自製或授權的 VRM |
| **VRoid Studio β 版 CC0 樣本模型**：HairSample_Male、HairSample_Female、Sakurada Fumiriya（桜田史利矢）、Sendagaya Shibu（千駄ヶ谷渋）、Sendagaya Shino（千駄ヶ谷篠）、Victoria Rubin（© pixiv Inc. / VRoid Project，已放棄著作權） | VRoid 官方說明「VRoid Studio 的樣本模型是否有使用條件」：β 版樣本為 **CC0**（AvatarSample_A／B／C 另有條件，**未使用**）。取得管道：github.com/madjin/vrm-samples `vroid/beta/`（commit e16eb18）。每個檔案內嵌的 VRM meta 皆為 `licenseName: CC0`、allowedUserName Everyone、commercialUssageName Allow（已用 `tools/vroid_build.py` 讀取確認） | CC0 1.0（不需署名；仍在此註明來源） | `assets/models/char/vroid_*.vrm`：**v9 起的正式 3D 人物**——祐廷（玩家）、沈以安、阿哲、陳語彤，以及 4 個路人底模（npc_f1/f2、npc_m1/m2）。全部由 `tools/vroid_build.py` 修改：衣物在模型之間移植並依骨架重新綁定（例：女性角色穿上 HairSample_Male 的長褲）、刪除被衣物蓋住的皮膚三角形、HairSample_Female 拿掉貓耳並把雙馬尾改成單一高馬尾、貼圖換色、眼型 blendshape 微調、只保留用到的表情、合併同材質 primitive、縮貼圖。原始 VRM 不放進 repo（見 `tools/fetch_vroid_src.sh`） |
| Noto Sans TC / Noto Serif TC | Google Fonts | SIL OFL 1.1 | `<link>` 載入；離線退回系統字型 |

未使用（評估後排除）：Kenney 人物（方塊風格）、market bike（27 萬三角形）、bed/mug/headphones（過重）。
遊戲內其餘貼圖、建築（含 v9 溫州街 `src/townkit3d.js` 的公寓、店面、日式宿舍、電線桿、機車、行道樹）、程序化人物、聲音皆為程式即時產生。所有人物、店名、事件皆為虛構；「台大／公館／溫州街」僅作空間氣質與地標語彙參考。

其他：`legacy/` 的早期 2D 版本與美術測試全部為本專案自製程式（SVG／Canvas），未使用外部素材。`docs/history/specs/` 為使用者撰寫的需求文件，`docs/history/user_feedback_images/` 為使用者提供的實機截圖。
