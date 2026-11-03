# CC_35 交班期間（11-03 06:5x～09:0x 台灣）PC 跑完的結果

全部來自 claude/cc-local（使用者電腦，Windows＋RX 6600M，headed）。判定歸 BB，以下是 CC 初判。🟡＝用捷徑做前置的探針；G 系列是 LAWWW 的 tests。

## 62d98bfa5（上一個發布候選）
| 項目 | 結果 | CC 初判 |
|---|---|---|
| X_P1_d124 | FAIL：bar_pool 四科（maritime、labor_social、tax_law）還在題池裡；take、skip PASS | BUG-BAR-POOL-PREFIX，c89a5f9be 已修（f47d4849a）→ Y_P1 驗 |
| X_P2_bar_a（judge2033、trainee） | ALL PASS | PASS |
| X_P2_bar_b（missed1） | ALL PASS | PASS |
| X_P2_epi（玩家存檔的人際推到尾聲） | ALL PASS | PASS：「不認識的女生」是前置的問題，確認了 |
| X_P3_ladder（5f238fc9d） | ALL PASS | PASS：LAWWW 修過的測試在 PC 通過 |
| X_G4v2 | ALL PASS | PASS |
| X_P5w | FAIL：PC 量目標時已經 18:56（自己上完課、考完試了） | 探針時序問題（PC 太快）；子代理在修 |
| X_G6b_v95 | FAIL：「新版存檔：有 courses…」（ef63 也一樣） | 原因待查；子代理在查 |
| 前面已報：X_G5_term、G6a、G6c、G3、P5_ui PASS；X_A1 FAIL（打字中略過，c89a 已修 0d4cf65c3）；X_G5b FAIL（待查） | | |

## 修改前的對照（探針抓得到修改前後的差別）
| 項目 | 結果 |
|---|---|
| X_P1pre（a3d80d47a，D124 修改前） | FAIL：沒有選修組、electives 沒有、排了補考……（符合預期） |
| A1pre（03b2721af）／A1_advskip（b1b）／A1_adv_ef63 | 都 FAIL。符合預期：b1b、ef63 還沒修好 window.GAME |
| A2pre（3c6207b60） | FAIL（符合預期） |
| A3pre（dc36b401e） | a FAIL（符合預期）；b、c 是探針在舊版 playlib 找不到 close_panels → 修探針 |

## A 系列（b1b／ef63）
- A3_late15（b1b）、A3_l15_ef63：ALL PASS。
- **A2_dorm（b1b）、A2_dorm_ef63：PC FAIL**（econ 退宿以後，列表裡還有「宿舍」），但雲端 b1b 是 ALL PASS → 先當成探針時序的問題（PC 太快、退宿旗標還沒生效就打開手機），子代理在查。

## 美術補證據 ART_*（b1b，headed＋顯示卡）—— BB 看圖判定
- ART_cop、ART_lband、ART_night、ART_uskit：4 項都 ALL PASS（工具面：該拍的都拍到了、區域和時間都對）。
- 截圖和 diff_*.json：claude/cc-local `docs/story_planning/CC/local_out/ART_*/out/`。

## Blender 烘焙 BK1（LAWWW2 BAKE-PC-1102；已交給 LAWWW2）
| | 裝置 | bake 秒數 | day／night／dark 平均亮度 |
|---|---|---|---|
| BK1_cpu | CPU | 51.2 | 0.06225／0.06903／0.00474 |
| BK1_hip | HIP：AMD Radeon RX 6600M | 196.1 | 0.06227／0.06909／0.00474 |
- 兩種裝置的亮度幾乎一樣；但 HIP 比 CPU 慢將近 4 倍（可能是第一次要編譯 kernel，或者場景太小）。判定交給 LAWWW2 用 compare_bakes.py 做。

## 各區 fps（b1b，844×390 橫向，畫質 medium）
| 區域 | headless 白天／晚上／雨天 平均 fps | headed 白天／晚上／雨天 平均 fps | 最差 1% low |
|---|---|---|---|
| 校園 | 31.7／43.8／30.0 | 37.4／45.2／34.6 | 11（白天） |
| 溫州街 | 33.4／35.6／34.3 | 40.4／41.4／39.2 | **7.1（白天，最差一幀 350 ms）** |
| 公館 | 55.0／58.3／54.2 | 54.0／62.3／64.7 | 19 |
| 總圖大廳 | 41.5／54.5／41.8 | 50.6／68.1／54.8 | 8.6（headless 白天） |
| 萬才館 | 58.1／58.4／59.1 | 68.2／73.6／70.2 | 13.9（headed 白天，最差一幀 370 ms） |
| 霖澤館 | 50.0／57.9／51.3 | 54.1／69.9／62.0 | 12.7 |
- 平均 fps 最低的是校園和溫州街的白天（30～40）。1% low 最差的是溫州街白天，會卡頓。這些都是桌機顯示卡的數字，不是手機。

## 其他舊項目（b1b）
- R1、R2、R3、R9 的 x2／x3 重跑：PASS。
- R4_x3 FAIL：第二天 13:05「目標是進霖澤館上課」，但人已經在 classroom（PC 太快，劇情自動往前走了）。R4 之前就知道有 PC 時序的問題（UX-DAY2-AUTOPULL）。
- R5_x2 FAIL：home_sleep_day（BUG-MAKEUP-HOME-SLEEP-WARN，b1b 本來就有，已知）＋skipnoon_seat 前置。
- R8_rr2 FAIL：nodup（補考和期末題目重複，KNOWN）。

## runner
- 08:32 出現 rf_round 1（runner a98287fbd6＝39fdb65b9）：run_forever 被重新啟動過，啟動時清掉了殘留的瀏覽器。原因不明（可能是重開機或 Ctrl+C），請 BB 問使用者。
- 00_gpu、01_p0speed 這兩項的 SHA 寫的是 head，開發分支每動一次就會重跑（每次 2～3 分鐘）。
- N1 lf2（ef63，runner 6cbec96f29）：FAILED 22，和 lf 那一次同一批。詳細錯誤顯示大多是「讀企劃稿 0 句、行尾帶 \r」→ f1eb06684 給子程序的 git 加 autocrlf=false。Y_N1（c89a5f9be）會用新版 runner 重跑。
