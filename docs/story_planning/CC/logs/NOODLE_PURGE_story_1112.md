# NOODLE-NAME-PURGE-1112：企劃線（claude/story-planning）test_tools 還有「麵店團」的 39 個檔（CC-C 11-12 08:5x；CC 不推企劃線，交給企劃線的負責人照做）

cc-testing 上同一批檔已經換好（d6230ff822＋這一筆）。對過：35 個檔＝企劃線那份把「麵店團」換「桌遊團」以後和 cc-testing 一模一樣（含 3 支 CC 的探針，cc-testing 那份比較新），直接拿 cc-testing 的：

```bash
git fetch origin claude/cc-testing
git checkout origin/claude/cc-testing -- \
  docs/story_planning/test_tools/aa356_probe.py \
  docs/story_planning/test_tools/aa360_probe.py \
  docs/story_planning/test_tools/aa369_probe.py \
  docs/story_planning/test_tools/aa374_probe.py \
  docs/story_planning/test_tools/aa375_probe.py \
  docs/story_planning/test_tools/aa376_probe.py \
  docs/story_planning/test_tools/aa377_probe.py \
  docs/story_planning/test_tools/aa381_probe.py \
  docs/story_planning/test_tools/baseline_1102/edges.js \
  docs/story_planning/test_tools/baseline_1102/routes.js \
  docs/story_planning/test_tools/cbe0429_probe.py \
  docs/story_planning/test_tools/cc/b6b8/p3_routes.js \
  docs/story_planning/test_tools/cc/b6b8/p6_dist.js \
  docs/story_planning/test_tools/cc/b6b8/sim_head.js \
  docs/story_planning/test_tools/cc/b6b8/sim_lib.js \
  docs/story_planning/test_tools/cc/cc_car_probe.py \
  docs/story_planning/test_tools/cc/cc_d118b1_probe.py \
  docs/story_planning/test_tools/cc/cc_next1102_ui_probe.py \
  docs/story_planning/test_tools/cc/n4_career_endings.js \
  docs/story_planning/test_tools/cc/n4b_bar_late_years.js \
  docs/story_planning/test_tools/d885_probe.py \
  docs/story_planning/test_tools/evsem_probe.py \
  docs/story_planning/test_tools/fair_probe.py \
  docs/story_planning/test_tools/groupnotice_probe.py \
  docs/story_planning/test_tools/holff_probe.py \
  docs/story_planning/test_tools/jp_sweep.js \
  docs/story_planning/test_tools/lane_probe.py \
  docs/story_planning/test_tools/psbh_probe.py \
  docs/story_planning/test_tools/us_life_probe.py \
  docs/story_planning/test_tools/us_sweep61.js \
  docs/story_planning/test_tools/vac_probe.py \
  docs/story_planning/test_tools/vac_sweep.js \
  docs/story_planning/test_tools/y1b_probe.py \
  docs/story_planning/test_tools/y5_probe.py \
  docs/story_planning/test_tools/zrlast_probe.py
```

其餘 4 個（不要整個拿 cc-testing 的）：
- baseline_1102/routes2.js、routes3.js：企劃線那份多一行 BB 11-02 的註解 → 在企劃線原地換：
```bash
sed -i "s/麵店團/桌遊團/g" docs/story_planning/test_tools/baseline_1102/routes2.js docs/story_planning/test_tools/baseline_1102/routes3.js
```
- next91015_probe.py 第 14 行：「麵店團都走了」換「桌遊團都走了」；同一行使用者原話引號裡的「出現麵店團的人對話」留著（規則①）。
- shrink_probe.py 第 7 行：「舊版的「麵店團」群組」＝舊存檔轉換用的字串，留著（規則②）。

規則（同 NOODLE_PURGE_kept_1112.md）：只留①使用者原話引號裡的 ②舊名轉換／舊存檔的字串；src/、tests/ 不動。
