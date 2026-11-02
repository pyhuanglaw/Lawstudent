# CC｜cc-local 02_mk12new 判讀（cc_makeup_probe.py，遊戲 c2d0c24bc）

- 來源：`origin/claude/cc-local:docs/story_planning/CC/local_out/02_mk12new/`（run.log、transcript_*.json、out/*.png）。使用者的 Windows 電腦（MSI，GPU）跑的，`?turbo`，CASES=study3h,skipnoon_seat,skipnoon_phone,homerest,old_delayed,home,mkbg，共 1559 秒，exit 1。
- err.log 只有每個 case 結束時的 `page close／BROWSER DISCONNECTED`（每個 case 開一個新瀏覽器，正常），沒有 JS 例外。每個 case 的「沒有 JS 例外」都 PASS。
- 判讀方式：只讀 run.log、transcript、截圖與 c2d0c24bc 的 `src/home3d.js`、`src/faildelay3d.js`、`src/postgrad3d.js`；**沒有重跑**。

## 結論

**6 個 FAIL 全部是探針問題（同一個原因），不是「考完家裡的選單沒回來」或「被帶到公館」的遊戲 bug。** 已修探針（見最後一節）。另外從這次的紀錄看到 **1 個遊戲面的疑點**（在家「睡覺」的「會錯過補考」警告和實際結果相反），交 BB 判斷要不要開 bug。

### 共同原因：家裡選單的比對寫成 `== '睡覺'`／`== '存檔'`

- `bbplay.ts()` 的選項文字是按鈕的 `textContent`，家裡選單的按鈕是「標題＋hint」兩行（截圖 `out/40_homerest_home_opt_menu_land.png`：「睡覺／隔天早上在家醒來」「存檔／存到存檔欄位」），所以抓到的字是 `睡覺隔天早上在家醒來`、`存檔存到存檔欄位`（run.log 第 61、147、163、178、188、205 行都看得到）。
- `home_menu()`、`home_run_until_menu()`、`mkbg_drive()` 用 `o['t'] == '睡覺'` 認家裡的選單 → 永遠認不到。
- 認不到就當成「別的選單」交給 `Driver.handle(s, ('照樣','先起床'))`；`pick_opt` 跳過「出發：」「存檔」「考前總複習」，選第一個剩下的＝**「睡覺」**，接著「會錯過：10:00 補考」的確認選「照樣」。
- 於是探針自己一直按「睡覺」：補考那一場被睡覺帶出來（照樣考 5 題）→ 11:00 家裡選單又按「睡覺」→ 6/28 退宿（`MOVED_OUT`，台灣路線搬去公館套房，transcript_home_go：「宿舍期滿」「你租的套房在公館」→ `enter gongguan`）→ 畢業後篇 PG 每次睡覺跳到下一件事（8/4 國考在公館、9/3…）。最後狀態 `zone gongguan（捷運公館站入口）`、day 1381／1418／1478 都是這樣來的，是**設計上的退宿與畢業後篇**，不是 bug。
- 90 秒的 `home_menu` 逾時 → 回 `None` → 「家裡的選單出來了」／「前置成立」FAIL。

### 每一個 FAIL

| case | 失敗的檢查 | 證據 | 判定 | 說明 |
|---|---|---|---|---|
| homerest | 前置成立（家裡選單有「出發：補考（法律系館A）」）＝null | run.log 61：10:31 選單第一個就是「出發：補考（法律系館A）…」，探針選了「睡覺…（first）」；62「照樣」；63–67 補考 5 題；68 11:00 家裡選單又選「睡覺」；69–70 8/4 國考在公館；截圖 40/41 家裡選單正常 | **探針** | 前置其實成立。原本要測的「在家休息一下」的 R1 預告完全沒測到 |
| home_go | 家裡的選單出來了 | run.log 147：08:32 選單有「出發：補考…」，探針選「睡覺」；148「照樣」；149 09:30 選單又出來（又選睡覺）；151–155 補考 5 題；156 11:00 家裡選單出來（又選睡覺）；158 最後 gongguan day 1381 | **探針** | 考完家裡選單**有**回來（156 行，11:00，沒有「出發：補考」）。「按了出發＝演補考」「考完回到家」那幾項都沒測到 |
| home_sleep | 家裡的選單出來了 | 163：6/25 21:01 選單出來（選睡覺）；164 6/26 09:30 選單；165 照樣；171 11:00 選單；173 最後 gongguan day 1381 | **探針** | 同上 |
| home_late | 家裡的選單出來了 | 178：11:15 選單（正確地沒有「出發：補考」）；179–180 一直睡；181 9/3 公館；183 day 1478 | **探針** | 11:15 沒有「出發：補考」這件事其實看得到是對的（178 行），只是沒被記成 PASS |
| home_rest | 家裡的選單出來了 | 188–197 同 home_go 的路線；199 最後 day 1418、busy | **探針** | 「在家休息一下」一次都沒按到 |
| mkbg_home | 前置成立（家裡選單有「出發：補考」）＝null | 205–214 同 home_go；215 FAIL | **探針** | 補考背景的檢查（在家考要換成 linze_201、考完回家裡背景）完全沒測到 |

注意：c2d0c24bc 的 `G.home={at:true,day}` 前置寫法**仍然成立**——讀檔後背景是 `home_dining_day.webp`、選單是家裡的選單（含 `FD.homeMakeupOpt` 的「出發：補考」），不是前置的問題。run.log 裡 `zone dorm` 是因為在家是 2D ADV 疊在原本的 zone 上，正常。

### PASS 摘要（這次沒動到的部分）

| case | 結果 |
|---|---|
| study3h | 全部 PASS（座位／書桌總複習選單、補考開場、答對 5 題補考過、passAll） |
| skipnoon_seat | 全部 PASS（座位跳時間停在補考） |
| skipnoon_phone | 全部 PASS（手機「等到中午」停在 09:30 那一場，演了補考，`mk.status pass`，成績「及格（補考）」） |
| old_delayed | 全部 PASS（舊延畢存檔讀進來改成補考 pending、冪等、教務處通知、之後考過） |
| mkbg_campus | 全部 PASS（字幕「法律系館A」、開場／5 題／結算背景都是 linze_201、考完 ADV 收掉回 3D） |
| mkbg_library | 全部 PASS（同上，座位起點） |

（mkbg_campus／library 最後在 gongguan 也是探針考完後繼續等、PG 跳到退宿以後，屬正常。）

## 遊戲面的疑點（交 BB 判斷；不是這 6 個 FAIL 的原因）

**在家選「睡覺」時說「會錯過：10:00 補考」，選「照樣」以後卻照樣去考了。**（暫名 BUG 候選 `MAKEUP-HOME-SLEEP-WARN`）

- transcript_home_go：08:54 家裡選單 →「睡覺」→ 旁白「會錯過：10:00 補考：海商法與海洋法。」→「照樣」→ 字卡 6/26 09:30 → **家裡選單又出來**（沒考）→ 再「睡覺」→ 同樣的「會錯過」→「照樣」→ `step start fd_makeup 9.5` → 字幕「法律系館A」→ 五題、補考過。
- transcript_homerest：10:31（已經過了 10:00 開考）→「睡覺」→「會錯過」→「照樣」→ 同一刻（10:51，沒有 40 分鐘車程）直接開考、照樣 5 題、「十一點收」。
- 程式：`faildelay3d.js` 181 行的註解寫「在家睡覺照舊由 PG.sleepJump 跳到 09:30 那一場」（設計上睡覺＝去考）；但 ③ `HOME.wouldMiss` 把補考列進睡覺的「會錯過」（同檔 188 行），所以警告跟結果相反。
- 不一致的地方：①警告說會錯過、結果沒錯過；②第一次睡覺只停在 09:30 回家裡選單、第二次睡覺才考（玩家要回答兩次「照樣」）；③過了 10:00 在家睡覺，馬上開考、沒有車程、整份 5 題。
- 要 BB 決定的：在家「睡覺」在補考當天到底是「去考」（那就不要列「會錯過」）還是「睡過頭＝缺考」（那就不能演補考）。探針的 home_sleep 目前照 181 行註解期待「從 6/25 21:00 睡覺 → 直接跳到 09:30 那一場」；照這次紀錄（164 行），遊戲是停在 09:30 的家裡選單、不會自己開考，修好的探針重跑時 **home_sleep 的「直接跳到 09:30 那一場」預期會 FAIL——那會是真的遊戲行為，不是探針問題**，請一起看。

## 探針修改（`docs/story_planning/test_tools/cc/cc_makeup_probe.py`，只動 home 相關，`ast.parse` 通過）

1. 新增 `is_home_ch(ch)`：用 `startswith('睡覺')`、`startswith('存檔')` 認家裡選單（標題＋hint 都吃得下）。
2. `home_menu()`、`home_run_until_menu()`、`mkbg_drive()` 的 home 判斷改用 `is_home_ch`。
3. `home_menu()` 多一層保險：人在家（`HOME.at(GAME.G)`）而且選單有「出發：」開頭的選項＝當成家裡選單回傳，不交給 Driver 亂選（避免再發生「認不到 → 自動選睡覺 → 照樣」一路睡走）。
4. 其他（FAIL_ROUTE／MK_COURSE 參數、Driver、各 case 的檢查）沒有動。

另外：`cc_delay14_probe.py` 183 行也是同樣的 `o['t'] == '睡覺'` 寫法（目前那個檔有別人的未提交改動，這次沒碰），用到家裡選單的 case 會有同樣的問題。

## 建議重跑

`CASES=homerest,home,mkbg MKBG_SUBS=home`（約 10 分鐘）。預期：home_go／home_late／home_rest／homerest／mkbg_home 的前置會成立、真正測到補考那幾項；home_sleep 的「直接跳到 09:30 那一場」看上面「遊戲面的疑點」。
