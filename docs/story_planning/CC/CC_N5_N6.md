# CC N5（法服不能刷）／N6（舊存檔相容）——測試報告

- 日期：2026-11-02；對象：開發分支 head `0c3d9e7a5`（CC 唯讀工作樹 wt_mk）
- 方式：只用 Node（沒開瀏覽器、Playwright、http.server、tests/*.py）；沒改遊戲程式；沒 commit。
- **判定歸 BB**；下面只是 CC 的初步判斷。
- 腳本：`docs/story_planning/test_tools/cc/n5_fafu_farm.js`、`n6_save_compat.js`，共用載入器 `n56_loadall.js`（三支要放在同一個資料夾）。
- 載入方式：照 `index.html` 的順序載入 `src/` 的 294 支 script，其中 277 支載入成功。`game3d.js` 是抽出函式另外跑的。載不進 Node 的 17 支全是 3D 繪圖模組：character3d、engine3d、townkit3d、zones3d、building3d、wancai3d、library3d、dorm3d、lawlib3d、soclib3d、gym3d、teach3d、l118_shops3d、linze_upper3d、rooms_glb3d、us3d、bike3d。
- 法服相關的包裝都有載入，模擬時都在：`pool_more3d.js`（值班前的旁白）、`y2b3d.js`（2027-05-22 阿姨諮詢）。

```
node docs/story_planning/test_tools/cc/n5_fafu_farm.js <repo 根目錄或工作樹>
node docs/story_planning/test_tools/cc/n6_save_compat.js <repo 根目錄或工作樹>   # 需要 git（git show a4f2760、dfd2618）
```

## N5 法律服務社：能不能刷

### 讀程式碼
- 會改到數值的地方只有三處：`story3d.js` 的 `S.fafuShift`（735 行）和 `S.fafuWatch`（782 行），以及 `y2b3d.js` 的 `auntConsult`（131 行）。
- 這三處都只寫旗標：
  - `LAWCLUB_SAT_LAST`：記錄哪一天去過，同一天不重複計算。
  - `LAWCLUB_SAT_VISITS`：去過幾個週六。
  - `FAFU_SHIFT_N`：大二起做了幾次紀錄。
  - 台詞輪替用的計數：`FAFU_ROT`、`fafuPoolUsed`、`fafuWUsed`、`FAFU_W`。
- 三處都沒有呼叫 `GM.rel`、`SOCIAL.adjust`、`SOCIAL.activity`、`GM.money`，沒有改 `G.stats`，也沒有呼叫 `STUDY.*`、`LEGAL.*`。
- 程式註解也寫明這個設計：「不扣時段次數、不加關係數字」（story3d.js:677）。
- 讀這兩個數字的地方：
  - `LAWCLUB_SAT_VISITS`：
    - careerLean 的 A 分數，每次 +1（story3d.js:3952）。只用在劇情分支，不顯示在畫面上。
    - 大一第 5 次旁觀那句話（≥5）。
    - 書桌上的物品（>0）。
    - 打工撞期的提示（>0）。
    - 阿凱的選項（≥1）。
    - 子晴的選項（>0）。
    - 畢業後回顧的次數（postgrad3d.js:435，只是顯示次數）。
  - `FAFU_SHIFT_N`：只被讀成「大於 0」或「等於 1」。
- 會開放的日子：`S.fafuDuty` 規定單週的週六、第 3 週起、考試週和國定假日停，所以每學期 5～6 次。
- `S.fafuShiftable` 會擋掉三種情況：同一天第二次（`LAWCLUB_SAT_LAST!==G.day`）、12:00 以後、不是社員。
- 一次性的相關事件只會演一次：SQ02 法服初談、pool3d 的「去看法服」邀約、wzlines 的陪阿德／林太太、y2b 的阿姨諮詢。

### 模擬一：四年每個值班週六都去
設定：社員；大一旁觀，大二起做紀錄，每次都選「再待到十二點」。

| 學期 | 值班週六數 | 這學期去成 | 累計 VISITS | 累計 SHIFT_N | careerLean.A | 關係 fam/trust/comf 總和（起點 31/19/0） | 記憶數 | G.stats | G.study 卡數 | 金錢 | G.rel |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Y1S1 | 5 | 5 | 5 | 0 | 5 | 31/19/0 | 3 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y1S2 | 6 | 6 | 11 | 0 | 11 | 31/19/0 | 3 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y2S1 | 5 | 5 | 16 | 5 | 16 | 31/19/0 | 3 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y2S2 | 6 | 6 | 22 | 11 | 22 | 31/19/0 | 5 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y3S1 | 6 | 6 | 28 | 17 | 28 | 31/19/0 | 5 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y3S2 | 6 | 6 | 34 | 23 | 34 | 31/19/0 | 5 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y4S1 | 6 | 6 | 40 | 29 | 40 | 31/19/0 | 5 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |
| Y4S2 | 5 | 5 | 45 | 34 | 45 | 31/19/0 | 5 | {"steps":0,"classes":0,"study":0} | 0 | 20000 | {"an":6,"zhe":12,"sis":2,"kai":8,"yu":3} |

GM.rel 呼叫 0 次、GM.money 呼叫 0 次、SOCIAL.activity 0 次、SOCIAL.adjust 0 次；時間推進合計 105.50 小時

模擬起點只設了三個人的「初遇」，所以 fam/trust/comf 總和很小（31/19/0）。這個總和四年都沒有變。

記憶數在大二下從 3 變成 5，是 2027-05-22 阿姨諮詢那個一次性事件記下的兩筆記憶：`IMPORTANT_CONVERSATION`／`RENT_CONSULTATION`（y2b3d.js:157、160）。這是事件內容，不是每次值班都會有的獎勵。

### 模擬二：同一天重複、讀檔重來
| 情境 | 結果 | VISITS | SHIFT_N | 其他 |
|---|---|---|---|---|
| 社員（大二下）做紀錄後「先走」→ 同一天再按「坐到圓桌」、再按「在旁邊看」 | true / false / false | 0→1→1 | 0→1→1 | 10.00 |
| 同一天換時間（11:54）再看 fafuShiftable | false |  |  |  |
| 大一旁觀：同一天連按「在旁邊看」10 次（每次 +30 分鐘，到 12:00 停） | 6 次演出 | 0→1 | 0→0 | 12.00；關係 31/19/0→31/19/0；stats {"steps":0,"classes":0,"study":0} |
| 讀檔重來：值班前的存檔讀回來、再做一次（5 輪） | 每輪都演 | 1,1,1,1,1 | 每輪 1 | （讀檔＝回到值班前，數字不累積） |
| 值班後的自動存檔讀回來（同一天 10:00）再按 | false | 1 | 1 | LAWCLUB_SAT_LAST 存在存檔裡 |
| 非值班週六（雙週）/考試週/國慶日：fafuShiftable | false / false / false |  |  |  |


### 每種數值的增加量和上限

| 數值 | 每次值班 | 同一天第 2 次以後 | 每學期上限 | 四年上限 | 讀檔重來 |
|---|---|---|---|---|---|
| SOCIAL 關係 fam/trust/comf | 0 | 0 | 0 | 0 | — |
| 舊版 G.rel | 0 | 0 | 0 | 0 | — |
| G.stats（study/classes…） | 0 | 0 | 0 | 0 | — |
| G.study 觀念卡（STUDY） | 0（不寫） | 0 | 0 | 0 | — |
| LEGAL 題庫狀態 | 0 | 0 | 0 | 0 | — |
| 金錢 | 0 | 0 | 0 | 0 | — |
| 記憶（SOCIAL.mem） | 0（只有 5/22 阿姨諮詢一次 +2） | 0 | — | 一次 +2 | 回到讀檔前 |
| LAWCLUB_SAT_VISITS（careerLean A） | +1 | 0（有同一天保護） | 5～6 | **45**（Y1S1 5、Y1S2 6、Y2S1 5、Y2S2 6、Y3S1 6、Y3S2 6、Y4S1 6、Y4S2 5） | 回到讀檔前，不累積 |
| FAFU_SHIFT_N | +1（大二起） | 0；但見下面第 2 點 | 5～6 | 34（模擬的數字） | 同上 |
| 時間 | 做紀錄＋1h（再待＝到 12:00）；旁觀每次 +0.5h | 旁觀可以一直按到 12:00 | — | — | — |

### CC 初判
1. **沒有可以無限刷的做法。** 所有遊戲數值（關係、能力、觀念卡、題庫、金錢）都是 0 增加。唯一會一直累積的是 `LAWCLUB_SAT_VISITS`，它最多就是值班週六的天數（45），而且只用在 careerLean 分支和文字顯示。同一天重複按、換時間再按、讀值班後的自動存檔再按，都被 `LAWCLUB_SAT_LAST` 擋住。讀值班前的存檔重來，只是回到原來的數字。
2. **小瑕疵（P3，沒有實際影響）。** wzlines3d.js:93 的陪阿德／林太太事件，對 `FAFU_SHIFT_N` 沒有同一天保護（`LAWCLUB_SAT_VISITS` 有）。同一個週六先做紀錄、再演陪同事件，`FAFU_SHIFT_N` 會加 2。不過這個數字只被讀成 `>0`／`===1`，而且陪同事件總共只有三次。這一點是讀程式碼看出來的，沒有模擬到。
3. **旁觀同一天可以重複播。** 大一或非社員可以在同一天一直按「在旁邊看」，每次 +30 分鐘，到 12:00 為止。數字只算一次，但台詞池（fafuPoolUsed）會連續往前輪，玩家可能一次就把旁白池看完。是不是要改歸 BB 判斷；數值上沒有問題。
4. 柏翰的「連續三次沒去」提醒，以及「先不排我」（FAFU_OFF）的每學期設定，`tests/v3_fafu_duty_unit.js` 第 7 節已經涵蓋，這次沒有重測。

## N6 舊存檔相容

### 用了哪些存檔
- repo 裡沒有可以直接讀的舊存檔 `.json`。`tests/` 下面的 json 只有兩份，都是使用者本人的存檔：`tests/repro_1020/user_save_day9.json` 和 `tests/repro_1018/user_save_bowl_day-368.json`。
  - **照協調者指示，這兩份都沒有開、沒有用。**
  - BB 提到的那份「第 9 天存檔」：CC 容器的 repo 裡其實有同名檔（765ac675 commit 進來的）。照指示沒有讀，交給 BB 在自己那邊跑。報告裡沒有寫任何使用者存檔的內容。
- 改用以下幾類舊存檔：
  1. `tests/save_compat_v95.py` 裡的 v9.5 狀態（slot1、slot2、slot3、湖邊），底子是 git 上 v9.5 `a4f2760` 的 `defaults()`。
  2. v9.4.2 `dfd2618` 的 `defaults()`。
  3. v1 格式（v7 時代：沒有 social、events、legal、cg）。
  4. 人工做的「D118 之前的大一下中期」存檔：有 courses.attend，但沒有 roll、rollSince、G.study。
  5. 人工做的「BUG-Y4S2-NOFINAL 之前的延畢誤判」存檔兩份：maritime 應該救回、enforcement 應該照舊延畢。
  6. 兩份壞檔：未知地點、v99。
- 執行方式：
  - `game3d.js` 整支載不進 Node（需要 DOM 和 three.js），所以從原始碼原樣抽出 `SAVE_VER`、`defaults`、`validate`、`migrate`、`MEET_EVENTS`、`relabelFirstMet`、`firstMetMigrate`。localStorage 換成記憶體。
  - 照 `applySave` 的順序跑：validate → migrate → firstMetMigrate → SOCIAL/EVENTS/LEGAL.bind。
  - 接著叫讀檔後才會補的預設：`STUDY.rec`、`CLS.rec`、`CLS.rollWeeks`。
  - 最後再跑一次 `migrate`，看結果是否一樣（冪等）。
  - Z3.ZONES 用原始碼裡登記的 41 個區域名稱代替。

### 結果
| 舊存檔 | validate | migrate 例外 | 新欄位缺預設 | weekday | G.study | courses.rollSince | courses.roll | FD 欄位 | migrate 冪等 | console.warn |
|---|---|---|---|---|---|---|---|---|---|---|
| v9.5 新遊戲（第 1 天晚上） | OK | 無 | 無 | 3→3（對） | 沒有→補上 v1/bf1（u 0 張） | 1（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| v9.5 slot1 第 3 天上午校園 | OK | 無 | 無 | 5→5（對） | 沒有→補上 v1/bf1（u 0 張） | 3（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| v9.5 slot2 第 9 天公館 | OK | 無 | 無 | 4→4（對） | 沒有→補上 v1/bf1（u 0 張） | 9（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| v9.5 slot3 第 23 天 Café | OK | 無 | 無 | 4→4（對） | 沒有→補上 v1/bf1（u 0 張） | 23（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| v9.5 lake 第 5 天湖邊（星期記錯 0） | OK | 無 | 無 | 0→0（對） | 沒有→補上 v1/bf1（u 0 張） | 5（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| v9.4.2 新遊戲 | OK | 無 | 無 | 3→3（對） | 沒有→補上 v1/bf1（u 0 張） | 1（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| v1（v7 時代格式：沒有 social/events/legal/cg） | OK | 無 | 無 | 3→4（對） | 沒有→補上 v1/bf1（u 0 張） | 2（＝讀檔那天） | Y1S1：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| 人工：D118 之前的大一下中期（courses 沒有 roll/rollSince、沒有 G.study） | OK | 無 | 無 | 3→3（對） | 沒有→補上 v1/bf1（u 0 張） | 197（＝讀檔那天） | Y1S2：看出席的課 5 門，roll 5 筆 | （無，新遊戲預設也沒有） | 否：pool undefined→{"secret":{}} | 無 |
| 人工：BUG-Y4S2-NOFINAL 之前的延畢誤判 maritime（大四下考五題的課：應該救回） | OK | 無 | 無 | 3→3（對） | 沒有→補上 v1/bf1（u 0 張） | 1373（＝讀檔那天） | 學期外：看出席的課 0 門，roll 0 筆 | FAIL_DELAY_COURSES=[] FD_RESCUE_NOFINAL=["maritime"] | 否：pool undefined→{"secret":{}} | 無 |
| 人工：BUG-Y4S2-NOFINAL 之前的延畢誤判 enforcement（不是大四下的課：應該照舊延畢） | OK | 無 | 無 | 3→3（對） | 沒有→補上 v1/bf1（u 0 張） | 1373（＝讀檔那天） | 學期外：看出席的課 0 門，roll 0 筆 | FAIL_DELAY=true FAIL_DELAY_COURSES=["enforcement"] | 否：pool undefined→{"secret":{}} | 無 |
| 壞檔：未知地點（validate 應該擋） | 擋下：未知的地點：no_such_zone | — | — | — | — | — | — | — | — | — |
| 壞檔：較新版本 v99（validate 應該擋） | 擋下：存檔來自較新的版本（v99），本版無法讀取 | — | — | — | — | — | — | — | — | — |
### CC 初判
- **沒有例外，也沒有 console.warn。** 新版 `defaults()` 的每一個欄位都有補上（pos、social、events、legal 本來就是讀檔後才建）。
- **星期重算正確。** v1 那份的第 2 天原本記 3，重算成 4。
- **STUDY（G.study）**：每一份都由 `STUDY.rec` 補成 `{v:1,u:{},miss:[],bf:1}`。舊存檔沒有上課紀錄可以回推，所以 u 是 0 張。
- **courses.roll（點名）**：
  - `CLS.rec` 補上 `rollSince＝讀檔那一天`。照 classes3d.js:539 的設計，舊學期出席 ≥3 照舊及格，不會突然被當。
  - `rollWeeks` 把這學期看出席的 5 門課都抽好、存進 `G.courses.roll`。
  - 「學期外」那兩份（2029-06-20）不抽，這是正確的。
- **FD（延畢誤判）**：
  - maritime（大四下考五題的課）救回：`FAIL_DELAY_COURSES=[]`、`FD_RESCUE_NOFINAL=["maritime"]`，FAIL_DELAY 拿掉。
  - enforcement（不是大四下的課）照舊延畢。
  - 兩份都冪等，跑第二次 `FD.migrate` 不會再改。
- **migrate 不完全冪等，但沒有影響。** 第一次讀檔時 `s.social` 還是 null（`SOCIAL.bind` 在 migrate 之後才建），所以 `POOL.migrate` 不補 `pool`。第二次讀檔才補一個空的 `pool:{secret:{}}`，裡面沒有任何選項值。CC 判為無害（P3）。
- **validate 正常。** 未知地點、比較新的版本都擋下，錯誤訊息正確。
- **沒有驗證的部分：**
  - 讀檔後進到區域、走路、`STORY.tick`、手機補發訊息、HUD：需要瀏覽器，這次照指示不開。
  - 真實的舊玩家存檔：使用者第 9 天那份由 BB 跑。
  - v7 實際寫出來的存檔：這次用格式模擬，不是 v7 真的寫出來的檔。
