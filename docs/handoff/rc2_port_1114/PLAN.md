# RC2-PORT-DEV-1114 計畫（2026-11-14 00:3x，LAWWW-C；發布 v9.10.26 以後才動開發分支）

來源：origin/claude/rc2-76f8-wip bcc99693a7（76f8b639f0 之上 54 檔，+636/−112）。76f8 是開發分支的祖先 → 用 `git merge`（不 rebase）。

## merge-tree 試算（HEAD ccbd520b61）：5 個衝突
| 檔 | 種類 | 處理 |
|---|---|---|
| tools/ladder/import_ladder.py | 兩邊各加一個寫檔前的掛勾：dev＝aa959.layer、rc2＝canon_b5_rows.fix | 兩個都留；順序見下 |
| tools/story/import_activity_scenes.py | 同上 | 同上 |
| tools/story/import_msg_replies.py | 同上 | 同上 |
| src/data/date_lines.js | 產生檔 | 不手改：合完重跑 tools/date/import_date_lines.py |
| src/data/ladder.js | 產生檔 | 不手改：合完重跑 tools/ladder/import_ladder.py |
其他 49 檔自動合併（含 story_import_allow.json、events.js、invites.js、y2r2_3d.js、termend_opts.js、msg_replies.js、20 多支測試）。

## 掛勾順序（要先查清楚）
- AA_959 最新表（683+ 列）已經含 D158／AA_987／AA_1012／AA_1015 的列。B5（canon_b5_rows）先換掉整句以後，AA959 對同一句的列可能對不到 → AA959 的 stale 檢查會報錯。
- 已查（00:3x）：AA_959 最新表 716 列（企劃線 14f10bfc8a）；B5 48 列裡 28 列的 old 也在 AA959 表、new 完全一樣（diff 0）；20 列只有 B5 有（aa720、aa811_lines、decide_rules、gift_holiday、gift_lines、heroine_arcs、solo_before、sport_invite_lines）。
- B5.fix 對「old 0 次、new 已經在」直接略過（冪等）→ **順序定為 AA959.layer 先、B5.fix 後**：重複的 28 列 AA959 換掉、B5 略過；B5 獨有的 20 列照換。B5 不用刪列。
- 三個 importer 的衝突解法：activity_scenes／msg_replies＝`js = _AA959.layer(js, ...)` 下一行 `js = _B5.fix(OUT, js)`；ladder＝寫檔用 AA959 layer，寫完再跑 rc2 的 post-write B5.fix（兩段都留）。date_lines 照同一個順序核對。
- 測試修正的底：claude/aa959-v505-wip fb54bfb668（子代理改過的測試）；date_src_sha.js 的 unRc2D158 / rc2Layer 要和 AA959 layer 同時存在。

## 步驟
1. 發布 v9.10.26 完成、開發分支乾淨。
2. 把 AA_959 最新表帶進開發分支（aa959.py 的表來源 SHA 更新）。
3. `git merge origin/claude/rc2-76f8-wip`；三個 importer 兩個掛勾都留；產生檔重跑 importer。
4. 白名單 AA_749_termend_kx_v2 → b45c888f94（rc2 已改，自動合併帶進來；核對）。
5. canon_scan src 0、canon897、kexin_sameschool、d158_rc2_rows、date_src_sha、aa959 相關測試全過；GHA node-unit-auto。
6. tasks：RC2-PORT-DEV-1114 → 已整合待測試；SHA 給 BB。

## 00:30 補記
- AA-C 逐句對過 rc2d 的 AA_1015：三處全對，AA_1015 GO。
- AA 多找到一句：y2r2 第 121 行高雄夜市旁白，新字已寫進 AA_959（doc AA_1015），排下一版，不出 rc2e。AA_959 表現在 736 列；AA_1020 第二批還在等 BB。→ 移植時用 AA 最後給的總列數那一版。

## 00:33 AA_959 定版
- 企劃線 6bc12e2fc9，766 列（716 → +1 AA_1015 §6 高雄夜市旁白 +49 AA_1020「不要笑」四批，含 AA_1018 采潔那列的更正）；pendingBB 已清空（BB_465）。RC2-PORT-DEV-1114 用這一版。
- 另外要重新匯入的來源：AA_749_termend_kx_v2.json（rc2d 已有，合併會帶進來）、date_system/lines/D13.json（AA_1017 子晴長椅選項）。
- 子晴「我自己錄的 很爛不要笑」：story3d.js、msg_replies.js 兩邊各一列都在表裡（aa959.py 的 LINKED 沒有 story3d.js）→ 移植時確認 aa959 layer 會處理 src/story3d.js（--apply-hand？）。
- 查過：aa959.py 的 HAND（--apply-hand 會改的手寫檔）沒有 story3d.js，LINKED 也沒有 → 移植時在 HAND 加 'story3d.js'（y2r2_3d.js 這種 src/ 下的檔已經在 HAND 裡，同一套路徑找得到），再跑 --apply-hand；用 aa959 的覆蓋檢查（每列都要有落點）確認 766 列全部有換到。

## 11-14 10:1x 第一次試做（LAWWW-C，已退回，開發分支沒變）
- git merge origin/claude/rc2-76f8-wip：5 衝突如計畫；三個 importer 照「AA959.layer 先、B5.fix 後」解完、py_compile 過。
- AA_959 換 784 列（企劃線 53b7a59c2d）＋SRC_SHA＋HAND 加 story3d.js、holff3d.js ＝> --apply-hand 後 --check 還有 616 筆沒套到，分在 61 個檔（下表：筆數 檔名）。很多檔不在 HAND、也不在已知 importer 輸出裡（syllabus.js、pool_story.js、enc_walk.js、kxdrift3d.js、sup497_lines.js…）→ 要逐檔判斷：有 importer 的重跑 importer，手寫的加進 HAND。之後再修釘舊字的測試（上次 505 列子代理花數小時）。
- 使用者 11-14 說本週用量只剩約 10%：沒有做完，merge 退回（git reset --hard 回 15be72634e），留給下一個帳號從這裡接。

```
    353 date_lines.js
     32 syllabus.js
     26 ladder.js
     16 invite_replies.js
     12 pool_story.js
     10 solo_before.js
      9 gift_holiday.js
      8 enc_walk.js
      8 activity_scenes.js
      6 sup497_lines.js
      6 study_scenes.js
      6 pool_story_b3.js
      6 msg_replies.js
      6 kxdrift3d.js
      6 an_yt_hol_events.js
      5 date3d.js
      4 y2b_events.js
      4 shop_npc.js
      4 rel_lines.js
      4 l118_lunch.js
      4 dorm203_lines.js
      4 adv3d.js
      2 zrzq_events.js
      2 wz_jobs.js
      2 vacgap_lines.js
      2 vacfill_events.js
      2 vac3d.js
      2 tz_invite_supper.js
      2 sport_invite_lines.js
      2 sis_y2y3_events.js
      2 sis_qixi_events.js
      2 sis_b9_events.js
      2 sis_b4_events.js
      2 sis_b13_events.js
      2 sis_b10_events.js
      2 shift_treat.js
      2 r2y4b3d.js
      2 r2y4a3d.js
      2 pool_story_b4.js
      2 pool_story_b2.js
      2 kx_khh3d.js
      2 jpprep_events.js
      2 jp3d.js
      2 invite_place_lines.js
      2 hometown_lines.js
      2 heroine_asks.js
      2 greet_classday.js
      2 flower_class.js
      2 feed_y3s2.js
      2 feed_y1s1.js
      2 family_xmas3d.js
      2 encounters.js
      2 date_wish.js
      2 cracktalk_lines.js
      2 camp_y1.js
      2 arc_rot.js
      2 arc_invites.js
      2 aa720.js
      2 aa667_3d.js
      2 aa519_lines.js
      1 events.js
```

## 11-14 10:1x AA 已把 61 個檔分好
AA 交接紀錄最上面那一節（企劃線 a3d996bfd4）：20 個有匯入工具（每個寫了工具路徑和來源稿：date_lines、syllabus、ladder、invite_replies、solo_before、gift_holiday、activity_scenes、study_scenes、msg_replies、l118_lunch…）＝重跑 importer；41 個手寫（pool_story、enc_walk、kxdrift3d、sup497_lines…）＝加進 aa959.py HAND。注意：date_lines（353 筆）、ladder、syllabus、invite_replies 的來源在企劃線——重跑前確認 importer 最後一步有套 AA959.layer（沒有就先加掛勾）。
