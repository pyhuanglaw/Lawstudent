# CC #18 國考一試排除 Y4MAR_（c2d0c24bc）

受測 c2d0c24bc；修改前對照 bd0a32c19。Node（tests/pg_harness.js；PG.draw／PG.pool）。指令：`WT=<資料夾> node docs/story_planning/test_tools/cc/n18_bar_nomar.js`

```
抽了 50 份；各前綴出現次數 {"Q":184,"CRIM":91,"Y4LSO":29,"CIV":90,"BBAI":83,"Y4IP":27,"ADM":45,"CIVS":75,"Y":78,"SEC":100,"AI":95,"Y4TAX":29,"DISC":30,"LENG":44}
PASS 1. 2029～2033 × 10 個 examSeed：每份 20 題、不重複、沒有 Y4MAR_　[]
PASS 2. 其他三科（Y4IP／Y4LSO／Y4TAX）照舊會出現　{"Y4IP":27,"Y4LSO":29,"Y4TAX":29}
PASS 3. 抽題池（PG.pool()）沒有 Y4MAR_；PG.pool(true) 有
PASS 4. 舊存檔已抽好的 20 題（含 3 題 Y4MAR_）照舊、不重抽，題目物件拿得到　{"ids":["Y4MAR_01","Y4MAR_02","Y4MAR_03","ADM20_01"],"n":20}
PASS 5. 同一年再抽一次＝同一份
ALL PASS
```

修改前 bd0a32c19：FAILED 2（第 1 項：50 份裡有 Y4MAR_，例 seed1 2029 Y4MAR_06；第 3 項）；4、5 兩版都 PASS。

CC 初判：#18 一試排除海商法 PASS（修改前 FAIL／修改後 PASS）。補考開場（AA_578 §6）的瀏覽器部分在 cc-local 02_mk12new（head），初判會註明那一輪的 sha。
