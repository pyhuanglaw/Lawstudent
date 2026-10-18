# BB 測試小工具（台詞對照）

- `dlg_hook.js`：Playwright 的 init script。記下遊戲裡實際出現的每一句對話和選項（說話的人、全文、日期、時刻、區域、事件 id），用 `console.log('BBDLG …')` 送出。遊戲不讀這個檔。
- 接法（BB 本機，不提交到 LAWWW 的 tests/）：`tests/playlib.py` 的 `launch()` 裡，有環境變數 `BB_DLG_HOOK`、`BB_DLG_LOG` 時 `ctx.add_init_script(path=hook)`，並把 `BBDLG ` 開頭的 console 訊息寫進 log（jsonl）。
- `line_check.py`：讀 jsonl，對照 `AA_188` 2-6／2-7、`00_人物口氣表` 第 0 節（模板句、共用的招、中國用語、作廢設定、口頭禪上限、48 字）、品牌表（D77）。用法：`python3 line_check.py log.jsonl`。
- 這是**測試**（D100a）：抓到的句子回報 AA（事件 id、原句、哪一條），不是審稿。`00_人物口氣表` 第 5 節列的 10 處 AA 已知，不用報。
