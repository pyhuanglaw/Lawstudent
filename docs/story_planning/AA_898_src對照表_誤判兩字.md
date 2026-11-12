# AA_898　src 對照表（丙）補一份：「前」「傳」相連的誤判（CANON-NO-ECON-1112）

- AA-C 2026-11-12 18:5x。對象：開發分支 `claude/adoring-meitner-mqzst8` @ `dcdf882ba`。
- canon_scan 的字表裡有一個兩個字的詞，剛好是「前」接「傳」。下面這些句子講的是「之前・傳訊息」「回去前・傳給你」，和舊序章無關，可是清完以後 canon_scan 會擋 push，所以改字。意思不變，不用送 BB（只換一個動詞）。
- 「原句」欄用描述；「前・傳」中間的點是為了這份文件本身不被掃到，src 裡沒有點。

## 1. 玩家看得到的字（AA 定）
| 檔 | 行 | 原句（描述） | 新 |
|---|---|---|---|
| `src/data/invites.js` | 187 | 明軒：我爸之前用手機問我三分線畫在哪 | 「我爸之前發訊息問我『籃球的三分線是畫在哪裡』。」 |
| `src/data/ladder.js` | 3 | 「我會來。」的回覆 | 重匯 ladder 就好：源稿 `ladder_aa_y1s2.json` 已經是「好啊，要來跟我說一聲，我幫你留位子。」 |
| `src/data/multirel_lines.js` | 306 | 「你去見她那天，出門以前・傳一句給我」 | 「……你去見她那天，出門前發一句給我就好。」 |
| `src/data/r2y4b_events.js` | 477 | heroine_05「班次，回去以前・傳給你」 | 「班次，回去前發給你。」 |
| `src/data/msg_pool.js` | 362 | 阿凱 replyText「一點以前・傳的，一點才回」 | 「回覆時間：凌晨兩點到四點最活躍；白天睡到下午一點，一點以前發的，一點才回。」 |
| `src/data/msg2_pool.js` | 167 | 同上 style 欄 | 「沒有標點；一點以前發的一點才回，先接「剛醒」」 |
| `src/data/movie_plots.js` | 2898 | when 欄「她在登機以前・傳一張照片」 | 「她在登機前發來一張照片」（AA_897 第 1 節已列） |

## 2. 註解（LAWWW 改；不是台詞）
`src/aa667_3d.js` 5、`src/data/feed_y1s1.js` 93、`src/msg3d.js` 34、`src/r2y4a3d.js` 334／370（跟著第 1 節 r2y4b 那句改）、`src/y2r2_3d.js` 669；另外 `src/data/econfr_soclib.js` 11、`src/econsl3d.js` 11、`src/game3d.js` 946、`src/data/msg_pool.js` 340 是舊序章本身的註解（整支拿掉或照甲處理）。
