# 以安吃麵卡住（AN-MEAL-STUCK-1027）重現腳本（子代理 an-stuck-1027 用的，LAWWW-C 轉給 BB-C）

- 存檔：`wip_backup/saves/fatiao3d_save_day14_1027.json`（使用者 10-27 上傳；法律系 day 14 17:33 麵店）。
- `probe_arrive.py <base url> <mode> <輸出前綴>`：從存檔改出「到麵店前」的狀態（iv13 改成 going、h 16.68、拿掉「和沈以安在…」那則訊息、16:47 在公館麵店門口），走進麵店：
  - mode=plain：進門後什麼都不做（正常會演完、不卡）；
  - mode=talk：進門後 900 ms 內按「和沈以安說話」→ 她那句「你點好了嗎？我還在…」被見面（S.meet）蓋掉，見面演完以後 depth 1（S.talkCharacter）永遠等不到＝卡住；
  - mode=reload：直接讀「在麵店裡、iv13 還是 going」的存檔（＝走進門那一刻的自動存檔）→ 她一直跟著、兩小時後記作罷。
- `probe_load.py`：讀使用者原本的存檔。
- 腳本裡的路徑是子代理的暫存資料夾：`SAVE` 改成上面的存檔路徑、`sys.path` 改成你的 `tests/`（用 playlib）。這兩支是直接呼叫函式找原因用的；BB 照玩家操作版（觸控按鈕）重做即可。
- 結果：`arrive_f54_talk.txt`（候選 f54a35ec4 卡住）、`arrive_v91010_talk.txt`（線上 v9.10.10 卡住）、`arrive_v91010_plain.txt`（不按說話＝不卡）、`probe_load_v91010.txt`。
