# NOODLE-NAME-PURGE-1112：cc-testing 複本沒換的 17 行（CC-C 11-12）

規則：src/、tests/（遊戲程式）不動；其他檔只留兩種行——①使用者的話（同一行有「使用者」或「原話」，而且舊名在「」引號裡）②舊名轉換／舊存檔／遷移的紀錄（NDL_OLD、OLD_NAMES、S.RENAME、舊名、舊存檔、遷移、migrate、轉換、改名前）。BB 看過哪幾行其實可以換，說一聲就換。

- docs/handoff/history_audit/judgments_AA.jsonl:70　{"id": "AA_486#1-1~1-3", "src": "plan", "tier": 7, "evidence": "src/story3d.js:1057 NDL_OLD_RULE 把「以後週二週四 麵店長桌」「有空就來 沒空不用講」換掉；:2060 改用 AA_542 2-2 的 S.
- docs/handoff/history_audit/judgments_AA.jsonl:133　{"id": "AA_542", "src": "plan", "tier": 3, "evidence": "src/data/events.js:674 阿哲「晚上吃麵？公館那家，阿鳳。」（1-1 第一次併桌）；src/story3d.js:1053「法一吃飯」每學年改名（2-1）、:1057 
- docs/handoff/history_audit/wip/aa_450_550.jsonl:42　{"id": "AA_486#1-1~1-3", "src": "plan", "tier": 7, "evidence": "src/story3d.js:1057 NDL_OLD_RULE 把「以後週二週四 麵店長桌」「有空就來 沒空不用講」換掉；:2060 改用 AA_542 2-2 的 S.
- docs/handoff/history_audit/wip/aa_450_550.jsonl:105　{"id": "AA_542", "src": "plan", "tier": 3, "evidence": "src/data/events.js:674 阿哲「晚上吃麵？公館那家，阿鳳。」（1-1 第一次併桌）；src/story3d.js:1053「法一吃飯」每學年改名（2-1）、:1057 
- docs/handoff/outbox_AA.json:3607　"note": "回 LAWWW-C 02:14：①AA_494 你判斷的九點全部照你的做法；②AA_496 第 9 節：舊存檔回填 BH4_DONE（events.done 有 ev_bohan_third_floor）、XC5_RECONCILE（ev_xinci_an_answers 或 _f
- docs/story_planning/AA_323_事件包_第三批之六_1B18到1B25.md:322　- 見過〈舊名〉（`KX_MET_NOODLE_TEAM`；`AA_11` 寫的 `KX_MET_GANG` 是舊名）：她在，和〈舊名〉坐在一起。
- docs/story_planning/AA_486_回LAWWW_麵店團在故事裡做什麼_長桌閒聊_語彤中秋烤肉一句.md:4　> - 使用者原話（UA-LAWWW-1027-20、-21）：「〈舊名〉存在的必要到底是?」「為什麼中秋烤肉會有語彤是法律系還是?」
- docs/story_planning/AA_542_麵店團縮小成背景_改稿規格.md:6　- 原話：「我認真覺得〈舊名〉很突兀 沒有前因後果 甚至沒有必要 他留在遊戲裡面的必要是什麼啊？誰決定他出現了？他的成員有誰能幹嘛？」
- docs/story_planning/AA_交接紀錄.md:222　- 使用者直接問 AA「〈舊名〉…必要是什麼？誰決定他出現了？」（UA-AA-1030-56）。AA 當場回答：是 AA 自己提的（`AA_13`、`AA_40`），跟著 v1 交接包進遊戲；10-27 AA-C 自己決定保留＝錯。
- docs/story_planning/AA_交接紀錄.md:395　- 「〈舊名〉存在的必要」：不拿掉，給使用者的說明在 1-1。補兩件：建群組時阿哲說清楚；麵店日的長桌閒聊（大一八則）。
- docs/story_planning/BB_191_多線戀愛知情機制_女生聊天發現_語彤雙主修.md:462　- `AA_128` 4-5 L262–267（`KEXIN_KNOWN` 的出處：「K3 起〈舊名〉都知道」「以安、語彤、沛珊都知道」「舊存檔當作已經公開」）→ 照 9-1～9-4。
- docs/story_planning/BB_218_瀏覽器實測紀錄.md:5112　- E2：舊存檔（【前置】加一個舊版「〈舊名〉」群組＋舊的兩則規矩）讀進來。
- docs/story_planning/BB_218_瀏覽器實測紀錄.md:5203　- FAIL 舊存檔 2025-10-01 還是「〈舊名〉」＋舊規矩＝**還沒確定**：
- docs/story_planning/_generated/taichung_1018.patch:67　-const LADDER={"source": "白名單 25e89f6e（7 檔）＋408398d7（8 檔）＋84bbef37（1 檔）＋a816234a（1 檔）＋f6269502（1 檔）", "characters": {"heroine_01": {"steps": [{"id": "
- docs/story_planning/_generated/taichung_1018.patch:68　+const LADDER={"source": "白名單 25e89f6e（7 檔）＋408398d7（5 檔）＋741e94f1（3 檔）＋84bbef37（1 檔）＋a816234a（1 檔）＋f6269502（1 檔）", "characters": {"heroine_01": {"ste
- docs/story_planning/test_tools/next91015_probe.py:14　下一個麵店日 10/2（四）18:00 再走進去：長桌閒聊開口的人都真的坐在店裡；10/7（二）20:40 走進去：〈舊名〉都走了（作息 20:30），不演閒聊（使用者 04:3x「出現〈舊名〉的人對話 但根本沒有在遊戲內出現」）。
- docs/story_planning/test_tools/shrink_probe.py:7　E2 舊存檔（【前置】使用者存檔加一個舊版的「〈舊名〉」群組＋舊的兩則規矩）讀進來：名字換成當學年的、規矩換新句；大二下讀進來＝「法二吃飯」、不補發改名
