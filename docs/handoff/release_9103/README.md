# v9.10.3 發布前：搖桿問題調查（LAWWW-C 2026-10-21 14:5x UTC 交班時，調查到一半，**不是結論**）

使用者 14:5x「現在正式交班……不要再繼續調查搖桿問題、執行測試或嘗試發布 v9.10.3」→ 停在這裡。任務：BUG-SMOKE-JOY-1021（擋 RELEASE-9103）。

## 1. 失敗的是哪一項
`tests/smoke_release.py` 第 1 段「新遊戲：搖桿走得動」：舊開局（`?start0`＋`?turbo`）宿舍開場演完、收手機以後，搖桿往前推（0,−40）4 次×1.5 秒，要走超過 0.5 m。
| 候選 | 結果 | 紀錄 |
|---|---|---|
| f72a2a21（v9.10.3 第一版） | 0.33 m（推 4 次） | logs/rc3_smoke_release_v2.log |
| bcbd4b65（第一版＋手機修正） | 0.33 m（推 4 次） | logs/rc4_smoke_release.log |

## 2. 已經排除的原因（有數據）
1. **手機一直自己打開（BUG-PHONE-REOPEN-1021）**：這是真的 bug，開發分支 4c90c913 已修（`tests/phone_auto_unit.js` 改之前 FAIL 2）；但**不是搖桿走不動的原因**——bcbd4b65 推搖桿時手機是關的、遊戲沒暫停，照樣只走 0.36 m（logs/rc4_fps_new.log）。
2. **幀率太低／CPU 被搶**：之前懷疑子代理同時跑 node 測試搶 CPU（4 核，SwiftShader 的 GPU 行程一支就吃約 250%；遊戲每格最多 0.1 秒、turbo 0.3 秒）。14:51 在**沒有別的工作**時重量：bcbd4b65 待機 **4.2 fps**，推搖桿那段過了 **6 格**＝約 1.8 秒遊戲時間，沒被擋的話應該走 2 m 以上，實際 **0.36 m**。幀率不是主因。
3. probe_phone_reopen（logs/rc4_probe_old.log、rc4_probe_new.log）：開場演完 12 秒內手機自己打開 1 次（兩版一樣），收起來以後沒有再開。

## 3. 目前證據指向：前方被擋住（還沒查是什麼）
- 開場演完：出生點 (0, 2.4)、鏡頭 yaw −2.74（鏡頭在玩家 −z 那一側，往前推＝往 +z）。
- `E.simWalk` 往鏡頭前方 1 m（目標 (0.39, 3.32)）：`stuck`，停在 **(0.07, 2.77)**；找路說走得到（路徑經過 (−0.2, 2.9)）但實際移動被擋＝導航格和碰撞可能不一致，或是門口、牆。
- **v9.10.2（main 9335763d）同一個出生點、同一個鏡頭角度，前方一樣卡在 (0.07, 2.77)**（logs/rc4_fps_old.log）→ 不是 v9.10.3 才有的障礙。那一次 probe 收手機三次還開著，推搖桿 0 格，沒量到移動。
- 還不知道：v9.10.2 發布時 smoke_release 是怎麼過的（當時的腳本、開場結束的鏡頭角度）；(0.07, 2.77) 那裡是什麼。

## 4. 這個資料夾
- `probe_fps.py`：開場演完 → 收手機 → 量 5 秒幾格 → simWalk 前方 1 m → 推搖桿 4×1.5 秒（走多遠、過幾格）。用法 `python3 probe_fps.py URL 標籤`（URL 不要加 ?turbo，腳本自己加）。
- `probe_phone_reopen.py`：開場演完後 12 秒內手機自己打開幾次、搖桿走多遠。
- `run_rc4.sh`、`run_rc4b.sh`：這次排測試的腳本（路徑寫的是 LAWWW-C 暫存區，下一班要改 `S=`、`W=`）。
- `phonefix_4c90c913.patch`：bcbd4b65＝f72a2a21 套這個 patch（src/story3d.js 一行＋tests/phone_auto_unit.js）。
- `logs/`：rc3（f72a2a21）、rc4（bcbd4b65）的 summary 與各支 log。

## 5. 候選版本
- **f72a2a21**：v9.10.3 第一版。**不發布**（手機 bug）。
- **bcbd4b65**：f72a2a21＋手機修正。**只在 LAWWW-C 暫存區，沒推上 GitHub**；重做：
  `git worktree add --detach <dir> f72a2a21 && cd <dir> && git apply docs/handoff/release_9103/phonefix_4c90c913.patch`（patch 從開發分支拿）`&& git add src/story3d.js tests/phone_auto_unit.js && git commit -m "v9.10.3 候選第二版"`。
- 回退目標：v9.10.2（main `9335763d`）。
- 開發分支在 f72a2a21 以後又合了很多（AA_360、AA_357 大五上、AA_362、AA-C 交班兩句、右上角日期、經濟系手機小事隔 3 天）——**都還沒做發布前測試**；建議 v9.10.3 維持 bcbd4b65（只多一個手機修正），其他放下一版。

## 6. 下一班怎麼做（乾淨環境比較）
1. 機器上**一次只跑一支瀏覽器測試**，同時不跑 node 測試、不開子代理（D96：SwiftShader 一次一支）。
2. 查 (0.07, 2.77) 是什麼：在 bcbd4b65 開場演完以後，console 看 `GAME.E.nav`（那一格擋不擋）、`GAME.E.colliders`、宿舍 203 的門口／牆／紙箱（36c07603 的紙箱、膠帶）；截圖。
3. 對照 v9.10.2：用 `git show 9335763d:tests/smoke_release.py` 那一版對 9335763d 跑，看那時怎麼過；probe 的收手機改用 smoke 的 `close_auto_phone`。
4. 判斷：v9.10.2 也撞到同一個地方＝smoke 推的方向的問題 → 改 smoke「新遊戲」那段四個方向都試（讀檔那段已經這樣），不是遊戲 bug；只有 v9.10.3 撞到＝找出哪個物件的碰撞、修好、加單元測試（出生點四個方向都走得動）。
5. 再對候選跑剩下的三支：flow_v0_start（開發分支新版，AA_300 短版）、touch_flow_wenzhou（9/27 週六版）、flow_exam_terms（收手機版）。全過 → snapshot→PR→merge→RELEASES.md、CANDIDATE_9103.md→驗 Pages。
