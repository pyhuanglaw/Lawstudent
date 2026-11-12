# CANON-NO-ECON-1112 第一批（Batch A）盤點表：經濟系那一年／休學重考在家，整塊拿掉

- 使用者 2026-11-12 原話：「刪掉經濟系的所有人 刪掉重考這個劇情　刪掉政大的東西 杜可昕這個人物既然已經做好 就放在台大法律但他不是我女朋友」。選擇題：可昕＝開局不是女朋友、之後可以追；舊存檔＝「我沒有要留的舊存檔」（不做遷移）。
- 起點：`claude/adoring-meitner-mqzst8` @ 762104842a。已經做的（d6f4070fb6）：標題只留「從法律系開始」、`loadFrom` 不讀 `stage==='econ'` 的存檔。
- AA 的清單：企劃線 `docs/story_planning/AA_855_canon_no_econ_grep.json`（src 2,465 行、179 檔）、`AA_854_…受影響的稿.md`。AA：econ_people、econ、nccu 可以整場拿掉；retake、gf 等 AA 換字。
- **這一批只拿掉「只有經濟系那一年（`G.stage==='econ'`，2024-09-01～2025-08-29）才會跑到」的程式和資料**；法律系時期還會出現的（C 類）、重考／女朋友的字（D 類）不動，只列清單。
- 這一批沒有寫、沒有改任何玩家看得到的字；只有拿掉。

## 做法

1. 沒有任何入口能把 `G.stage` 設成 `'econ'`（新遊戲只有法律系；econ 存檔不讀），所以下面這些條件永遠是 false：`STORY.isEcon(G)`、`G.stage==='econ'`、`typeof ECONFF!=='undefined'`（檔刪掉以後）、`typeof RETAKE_HOME／MSG_KX_Y0!=='undefined'`。
2. 用語法樹（Node 內建的 acorn；工具放在 scratchpad `cne_fold.js`，不進 repo）把這些條件當 false，照 JS 語意把走不到的分支、整個 `if`、`stage:'econ'` 的事件物件拿掉；**其他字元一個都不動**（不重排、不改寫留下來的程式）。
3. 連帶變成沒有人呼叫的函式（`newGameEcon`、`econCampPrologue`、`y0Tick`、`toLaw`、`retakeWake`…）手動拿掉，再把它們的呼叫點照同一個方法收掉，一輪一輪做到沒有殘留。
4. 測試：整支只測經濟系那一年的刪掉；只有幾項有關的，刪那幾項並註明「CANON-NO-ECON-1112：經濟系那一年拿掉」。不放寬任何判定。

## A 類：整個檔只給經濟系那一年／重考在家用（刪檔）

| 檔 | 讀過以後的判斷 | 這一批 |
|---|---|---|
| `src/econff3d.js`（326 行） | 經濟系在學「事件接事件」＋休學在家第二階段（D102、AA_292、AA_355）；只在 `stage econ` 開 | 刪 |
| `src/data/retake_home.js` | AA_297 重考期在家的日常（2025-02-15～07-09）；只有 econff3d.js、home3d.js 的重考在家用 | 刪 |
| `src/data/msg_kx_y0.js` | AA_301／AA_368 經濟系那一年主動傳訊息給可昕的回覆（2024-10-17～2025-08-29） | 刪 |
| `tools/story/import_retake_home.py`、`tools/msg/import_msg_kx_y0.py` | 上面兩個資料檔的匯入工具 | 刪 |

讀過、**不屬於這一批**的候選：

| 檔 | 是什麼 | 歸類 |
|---|---|---|
| `src/econfr3d.js`、`src/data/econfr_lines.js` | AA_521 經濟系的朋友在**法律系那三年**（校園日常、「走啦」群組、何俊朗、日文班） | C |
| `src/econsl3d.js`、`src/data/econfr_soclib.js` | AA_536 經濟系同學在社科院圖書館（**法律系時期**遇得到） | C |
| `src/kx_khh3d.js` | AA_401 可昕學期末約會「寒假來高雄」（法律系，交往中） | D（gf） |
| `src/kxdrift3d.js` | AA_351 可昕慢慢分手（法律系大二～大四，交往中） | D（gf）＋C（木柵） |
| `src/kxod3d.js` | AA_354 可昕「我們的日子」大二～大四 | D（gf）＋C（政大小吃街） |
| `src/kx_moot3_3d.js`、`src/data/kx_moot3_lines.js` | AA_514 可昕最後一場模擬法庭（大三上，在政大） | C（木柵／政大） |
| `src/data/camp_y1.js` | 法律系 8/22 宿營（新局會跑）；裡面「重考生」的字是 D | 留；D |

## B 類：共用檔裡一整段只在 `stage==='econ'` 才跑的（拿掉那一段）

| 檔 | 拿掉什麼 |
|---|---|
| `src/story3d.js` | `S.isEcon`、`S.y0Day1`、`S.newGameEcon`、`S.econCampPrologue`、宿舍第一晚 `y0FirstNight`／`y0Morning`／`S.y0Tick`、經濟系 → 法律系的銜接 `S.toLaw`／`S.toLawDue`／`S.Y0_SUMMER`、`S.campCallDue`（經濟系的宿營電話）、`PHONE_RULES` 裡每一段 `if(S.isEcon(G))`（E02～E37、群組 `econ_class`、社團群組、休學、重考、放榜…）、每日訊息表的 Y0 那一組、`S.retakeOn`／`retakeWake`／`cramNight`／`rArrived`、`S.p2bDue`、`S.e05*`、`S.e08StopAt`、`S.homeHold`、`S.t2Due`、`S.y0FinalEnd`、`S.dpTerm` 的經濟系分支、`S.lifeLineMigrate`／`zoulaMigrate` 的 econ 分支 |
| `src/data/events.js` | `stage:'econ'` 的事件（`ev_y0_*`、宿營經濟系版、P2／P2b、E01～E37、R、L、T 系列） |
| `src/data/vacfill_events.js`、`src/vacfill3d.js` | AA_440 第 1 節「經濟系那年暑假」那幾件、包住 `ECONFF.tick2` 的那一段 |
| `src/home3d.js` | 休學在家、重考在家的選單和快轉（`ECONFF.*`、`RETAKE_HOME`、`y0Jump`、`Y0_FIXED`）|
| `src/classes3d.js` | 經濟系課表專用：E03／P1／E04 課堂劇情、`S.PE_Y0`、`c.y0leave`（休學後不排課）、`ECONFF.on` 的判斷 |
| `src/data/courses.js` | Y0S1／Y0S2 的課（`econ_principles_y0`、`acct_y0`、`calc_y0s1`…、`law_intro`）|
| `src/game3d.js` | `btnNewEcon` 的 onclick、`isEcon` 相關判斷、migrate 裡 econ 專用的 |
| `src/msg3d.js`、`src/phone3d.js`、`src/outings3d.js`、`src/events3d.js`、`src/zones3d.js`、`src/whois3d.js`、`src/crowd3d.js`、`src/dorm3d.js`、`src/encounter3d.js`、`src/examlib3d.js`、`src/gg3shops3d.js`、`src/heroine_asks3d.js`、`src/l118_lunch3d.js`、`src/limao3d.js`、`src/psresults3d.js`、`src/shopenc3d.js`、`src/shoplife3d.js`、`src/shopnpc3d.js`、`src/social3d.js`、`src/b1story3d.js` | 各自的 `isEcon`／`stage==='econ'`／`ECONFF` 分支 |
| `index.html` | `econff3d.js`、`retake_home.js`、`msg_kx_y0.js` 的 script 標籤、`btnNewEcon` |

（實際拿掉的行數、函式清單在最下面「做完的結果」。）

## C 類：法律系時期還會出現的經濟系人物／木柵／政大（這一批不動；清單在最下面，做完以後照 AA_855 的關鍵字重新數）

## D 類：重考、休學、女朋友的字（等 AA 換字；清單在最下面）

## 做完的結果（動手以後填）

（待填）
