# 已經有的東西（接班必讀；D148，2026-11-10）

> 用途：**開口問使用者「要不要裝／有沒有給過／要不要重做」以前，先查這一份和 repo。** 這裡只寫「已經裝好、已經給過、已經做過、放在哪」，一行一件、寫日期和出處；不寫規則、不寫待辦（規則在 CLAUDE.md 和職位頁，待辦在 tasks.json）。
> 誰寫：每個職位發現「這件事下一班會需要知道在哪」就把一行交給值班 LAWWW（或自己職位頁有對應段落的同時也給一行）；LAWWW 當天加。過時的那一行直接刪（X330）。
> 起因（使用者 2026-11-10）：「今天發現了很多什麼已經做過，結果忘記了交班，或你不知道什麼分支還在他的那邊」——VRM 工具早就在用卻去問她要不要裝、她的電腦早就能跑 Blender 卻在雲端硬算、溫州街五間早就有參考圖卻又給她提示詞、子代理做好的溫州街快速前往沒合進開發分支。

## 1. 使用者的電腦、工具
- 使用者的 Windows 電腦（RX 6600M）一直開著測試佇列 runner（`claude/cc-testing` 的 `tools/cc_local/`；入口 `run_forever.ps1`，桌面有捷徑）；瀏覽器測試都排這裡（D131）。細節：ROLE_CC、ROLE_BB。
- **那台電腦已經裝好 Blender 5.2**，runner 有 kind `blender`（只用 CPU，使用者 11-03 選的；她 11-03 說「其他 AI 的 Blender 也可以給我的電腦做」）。慢的 Blender 工作排這裡：ROLE_LAWWW2 1.0。（11-10 CC 排了 BLENDER_PING 確認現在還能跑，結果見 CC_00。）
- 雲端容器的 Blender／VRM 工具：`bash tools/blender/setup_env.sh` 一次裝好（bpy 5.2.2、EGL、VRM Add-on、VRoid CC0 樣本）；LICENSES.md 有登記的工具不用再問她（D144）。
- GitHub Actions：`node-unit-auto`（全部 Node 單元測試）、`browser-sweep`（電腦不能用時的功能類瀏覽器測試，D139）。

## 2. 使用者給過的參考圖、規格書放在哪
- 使用者規格書原文（一字不改）：`docs/handoff/user_specs/`（開發分支）——公館六間店 `GG_SHOPS3_1110.md`、花序 `FLOWER_NOTES_1110.md`＋`flower_notes_ref/`（外觀、一樓、二樓三張圖）、夜市十一攤 `NIGHT_MARKET_1110.md`、禮貌生財 `LIMAO_SHENGCAI_1110.md`。
- 店面參考圖（BB 檢查過的）：企劃線 `docs/story_planning/ref_images/shops/`（含溫州街第二批五張外觀：溫州書屋、帝大紅茶、阿忠鮮果、常在洗衣、夏日冰菓室）。
- LAWWW2 分支 `docs/art-rebuild/second_ai/ref/`：`tingzhou_1110/`（使用者的汀州路美術指令原文、`concept/` 七張概念圖）、`gg_shops6_1110/`（公館／汀州路六間店外觀參考圖）。第三方地圖、照片不進 repo，只留分析。
- 電影海報 72 張：企劃線 `docs/story_planning/bg_approved/posters/`（BB 通過的），遊戲裡 `assets/posters/`（`tools/movie/sync_posters.py` 同步）。
- 使用者在對話裡傳的圖：從工作階段紀錄取原檔（`tools/handoff/chat_images.py`），不請她重傳（D122）。

## 3. 哪些店已經照參考圖做好（不要再跟她要圖）
- 公館：燒臘、青木茶室、頁間書屋、日和便利店、洋洋鹹酥雞、慢輪單車、afar、轉角唱片、Daybreak（9 間，在遊戲裡）。安泰藥局、汀州鮮果、榮恩典文具社有 11-10 的外觀參考圖，LAWWW2 待做。
- 溫州街：除了日和便利店 A5（使用者 11-10 選「維持現在」），全部照參考圖做好在遊戲裡（含木曜日、日常失速）。
- 新生南路：山嵐書店、同弦樂器、南洋戲院、大口漢堡、好拍、大步、新生運動廣場（在遊戲裡）。
- 汀州路：五間（越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）照概念圖、泰米村食／洗樂洗衣坊／印得好照外觀參考圖（開發分支）。

## 4. 使用者已經決定、容易被再問一次的
- 麵店團（noodle_team）11-03 已改名桌遊團（X182）；程式內部代號照舊叫 noodle_team，寫文件、回使用者一律說桌遊團。（11-12 使用者：「麵店團不是已經改成桌遊團了嗎」——全 repo 舊名已清，`python3 tools/handoff/ndl_purge.py --list` 看留下來的是哪幾行）
- 新的店、店名一律她給（D147）；發布由 LAWWW 決定（D85，11-10 再確認），但花序、汀州路、夜市、禮貌生財那幾份規格書寫了「發布前先問」的照規格書。
- 選擇題要她看的稿寫在本文或選項說明（X329）；生圖提示詞格式照 ROLE_BB（D97）。
- 沛珊：有趣、聰明、會接梗；家裡是台中的小型連鎖餐廳（X327）。上師＝退休的刑法教授、全部免費（X326／X332，付費那句待她最後確認）。

## 5. 各職位自己交來的（2026-11-10 22:4x；過時的那一行直接刪）

### BB（企劃線 `claude/story-planning`）
- 判定紀錄全部在 `docs/story_planning/BB_255_v9.10.20驗收.md`（PASS／FAIL／ART_APPROVED，照日期往下加）。
- 通過的 2D 背景、CG：`docs/story_planning/bg_approved/`（README 逐張紀錄）；電影海報 72 張 `bg_approved/posters/`（都在遊戲裡，X314）。
- 跟使用者要圖的提示詞：`BB_132`（第 119～127 組＝海報、公館六間）、`BB_221`（深色底場景）、`BB_176`（公館招牌）；格式 D97。
- 使用者給過的參考圖：企劃線 `docs/story_planning/ref_images/`（shops／wz_cafes／model_renders）。官方建築照片不上 GitHub。
- 檢查表：BB_308～311、BB_313（電影）、BB_310（告白）、BB_314（期末飯）、BB_312（花序驗收計畫）、BB_315（夜市＋禮貌生財）、BB_316（AA_750 意見）、BB_307（公館六間指令原文）。

### AA（企劃線）
- 現行設定只看：`00_現行設定總表.md`、`00_人物口氣表.md`、`00_台詞寫作規則.md`、`voice_canon/<id>.md`、`docs/WORLD_NAMING.md`。
- 交了還沒匯入：AA_748 芷若告白（2cb84d6df，可匯）；AA_749 朋友版期末飯 Y1S1／Y1S2／Y2S1（20145308e、9665a9075，可匯）、Y2S2（53e872a89，BB 還沒看）；Y3S1 以後還沒寫。
- **不匯**：AA_749 gf 版的沛珊整段、AA_745 fallback 的沛珊 18 句（等 X327 重寫；AA 在等使用者回「沛珊樣稿口氣對不對」）。
- AA_750 禮貌生財上師提案最新版 871b331c9（BB 看過，等使用者授權）。AA_747 攤名、AA_744 第 0、1 節店名作廢（X328）。
- 使用者選過的：沛珊告白＝帶一點開玩笑的眼神直接說「我真的很喜歡你」；芷若告白＝寫在杯子上（六句定稿）；可昕高中打排球；上師＝退休的著名刑法教授、不缺錢、喜歡找法律系學生聊天。
- 工具：`docs/story_planning/tools_aa/line_lint.py <檔>`；稽核結果 `audit_1110/`；改稿順序 AA_746。

### CC（`claude/cc-testing`；結果在 `claude/cc-local`）
- 使用者電腦（機器名 MSI）的測試 runner：桌面捷徑「啟動測試迴圈」→ `Documents\Lawstudent_cclocal\tools\cc_local\run_forever.ps1`（不要搬、不要改名）；並行數 `tools/cc_local/config.txt` 的 PARALLEL。
- 佇列 `tools/cc_local/queue.txt`：`ID | 40 碼 SHA | kind | script | url | 分鐘 | ENV`；kind＝probe／game／node／blender／webkit。runner 會自己換新版，使用者不用重開（只有改 run_forever.ps1 才要）。
- 結果 `docs/story_planning/CC/local_out/<ID>/`（run.log、meta.json、out/）。**cc-local 很大，雲端不要整支 fetch**，用 GitHub 工具讀單一檔。
- Blender 工作：一律 CPU、獨佔跑；ENV 寫 `SCRIPT_FROM=lawww2`、`XARGS=--out {out}`；說明 `tools/cc_local/README.md` 第 151～155 行。
- 探針：CC 的在 `docs/story_planning/test_tools/cc/`，BB 的在 `docs/story_planning/test_tools/`；排之前跑 `tools/cc_local/probe_lint.py`。
- 存檔樣本：`test_tools/cc/fixtures/user_saves_1107/fatiao3d_save_day46.json`（使用者 day46）、`fixtures/heavy_save_m5.json`、開發分支 `tests/fixtures/user_save_day54_1110.json`。使用者原始存檔不 commit。

### LAWWW2（`claude/second-ai-env-art`）
- **交件都是 patch，不是直接改開發分支**：`docs/art-rebuild/second_ai/wip/<任務>/`（README＋.patch＋預覽＋regression log）；登記 `docs/handoff/outbox_LAWWW2.json`。11-10 的：`tingzhou_1110/`、`flower_notes_1110/`、`gg_shops6_int_1110/`（六間室內三個 patch，依序套 v1 → v1b → v1c）、`sign_rectify_1110/`。
- 規劃文件 `docs/art-rebuild/second_ai/proposals/`：`night_market_1110.md`（夜市十一攤；6c 節＝禮貌生財的位置和室內；都還沒授權實作）、`life_details_seasonal_1110.md`（季節布置 20 項，使用者說全做，還沒動手）、`tingzhou_area_1110.md`。
- 使用者給 LAWWW2 的參考圖：`docs/art-rebuild/second_ai/ref/tingzhou_1110/concept/`（汀州路七張）、`ref/gg_shops6_1110/{concept,interior}/`（公館六間外觀、室內）。第三方地圖、街景照片不進 repo。
- Blender 腳本 `tools/blender/env_second/`：`wz_street.py -- --set <區>`（**一定要有 `--`，沒有會蓋掉溫州街的 GLB**）、`wz_shopkit.py`、`tz_stalls.py`、`tz_shops_interior.py --shop <店>`、`flower_notes_interior.py`；貼圖 Poly Haven CC0 在 `textures/<pid>/`、自己產的 `textures/gen/`。重建公館店面街的三步在 `docs/art-rebuild/second_ai/HANDOFF.md` 最上面。
- 雲端容器算預覽圖很慢（沒有顯示卡：整條街一張 10～13 分鐘）；建模、匯出不慢。正式預覽排使用者電腦（ROLE_LAWWW2 1.0）。
- 公館 G08 騎樓的紅凳子 `sk_stool_r_G08` 是子晴的劇情座位，重建店面街不能拿掉（`zq_arcade_seat_unit`）；雜物變了要重算 `src/zones3d.js` 的 GG_PROP_BLOCKS（`street_props_nav_unit`）。

- （11-10 23:4x）禮貌生財「上師」的人物圖使用者給過了：開發分支 `docs/handoff/user_specs/limao_ref/shangshi_character.png`；店面外觀圖在 LAWWW2 分支 `ref/night_market_1110/concept/shop_limao_shengcai_exterior.webp`；夜市十攤圖同資料夾。不要再跟她要。
- （11-11 08:0x）在開發分支重產街景 GLB（`wz_street.py -- --set lane118` 等）要的 `tools/blender/env_second/textures/gen/` 兩百多張圖只在 LAWWW2 分支 `claude/second-ai-env-art`，開發分支沒有；另外要 Poly Haven 的 `floor_tiles_06`、`concrete_floor_painted`（`lib2.fetch` 會抓）。建之前從 LAWWW2 分支取出來（`git checkout origin/claude/second-ai-env-art -- tools/blender/env_second/textures/gen`），**不要 commit 進開發分支**。118 巷玻璃後的室內圖：`l118_peek_tex.py` → `wz_street.py -- --set lane118` → `node tools/gen_zone_assets.js`（室內 GLB 換了就要重跑）。
- （11-11 07:5x 使用者）各工作階段用 **Opus 5.5**（claude-opus-5-5），不用 Fable（USER_WANTS X342）。派子代理不要指定 `model: fable`。
- （11-11 12:4x）約會地點的台詞，遊戲讀的是企劃線 `docs/story_planning/date_system/lines/Dxx.json`（`tools/date/import_date_lines.py`，白名單逐檔）；`date_rewrite/` 只是改稿紀錄、沒有工具讀。AA 以後改約會字直接改 `date_system/lines/`。AA_812 那五格是 `import_date_lines.py` 的 apply812 層照 date_rewrite 的差換（held 預先合併分支 852bf5d85）。
- （11-11 12:5x）AA 的「她傳來的訊息」回覆選項（AA_709 → `src/data/msg_replies.js`）用**私訊原文逐字**對（`src/msgreply3d.js` S.find）。改任何私訊的字，要一起改 AA_709 那一格的 text，不然玩家收到那則就沒有回覆選項；`python3 tools/story/import_msg_replies.py --check` 會擋。
- （11-11 12:5x）AA 的逐行改稿 {file,line,old,new} 用 `tools/story/apply_line_rows.py <稿>@<sha> [--apply] [--skip-generated]` 套（held 預先合併分支）；檔頭寫「自動產生」的檔不套，要改源稿重匯。比舊稿的測試用 `tests/line_rows_expect.js`（toOld／fwd／fixFile／toOldS／fwdS／fwdDeep）。
- 店裡買的雜貨（不是禮物）記在 `G.flags.GG3_OWN={區域:{東西 id:份數}}`，選單「物品」分頁用 `GG3.ownHTML` 顯示（東南大聯商行 11-12 起；之後的雜貨、配件店照這個接，不要另開欄位）。
- **店面標準**在 `CLAUDE.md` §12（D155）：店員、客人、窗景、天花板、立體櫥窗、買東西、打烊、字……新增、修改、以前建好的店都要符合；驗收照 `docs/rules/ROLE_BB.md` 2.6 地點關卡；每間店的現況在 `docs/handoff/SHOP_STANDARD_STATUS.md`。
- （11-12 08:0x LAWWW-C）**雲端容器的磁碟只有幾 GB 可用**（`df` 的 Avail 看起來很小就是真的）：①`tools/handoff/branch_audit.py --write` 會一次 fetch 所有分支，這台裝不下——先看 `df -h /home/user`，不到 6 GB 就不要跑（交給下一個新容器）。②被中斷的 fetch 會在 `.git/objects/pack/` 留 `tmp_pack_*`（今天兩個共 4.4 GB）；`git count-objects -vH` 的 garbage 那一行看得到，確認沒有 fetch 在跑（`pgrep -af "git fetch"`）就可以刪。③子代理的 worktree 一個約 1.4 GB，同時最多開兩個；合併完當回合 `git worktree remove`。④scratchpad 裡幾週前的舊目錄可以刪。
- （11-12 08:0x LAWWW-C）**GitHub Actions 的 `node-unit-auto` 每次 push 會取消上一輪**（全套要跑好幾分鐘）：幾分鐘推一次＝全套永遠跑不完（11-12 下午連續 7 輪 cancelled，兩支紅的測試半小時沒人發現）。要拿全套結果：推完**等那一輪跑完**再推下一筆（`mcp__github__actions_list` list_workflow_runs 看 conclusion），小改動先存本機、併成一批推。
- （11-12 LAWWW-C）BB 第三層（看圖）判定放 `docs/handoff/place_gate_bb.json`（BB 在自己分支更新 → 告訴 LAWWW SHA → LAWWW 合進開發分支、跑 `node tests/place_gate_unit.js --write`）；`SHOP_STANDARD_STATUS.md` 第 7 欄讀它。
