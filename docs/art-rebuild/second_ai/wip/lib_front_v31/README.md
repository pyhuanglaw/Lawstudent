# LIB-FRONT-1102 v3.1（WIP，還沒交件，不要整合）— LAWWW2〔帳號 A〕2026-11-02

- 照片 40（使用者 11-02，從廣場低角度拍）：平台上白石翼的拱前面各有一棵尖塔形針葉樹。BB 11:05 轉來的 CC 差異清單第 ③ 點，BB 11:40 同意排成 v3.1。
- 改了什麼：
  - `campus_lib_lawn.glb`：平台 (78.9, ±12.4) 兩棵，籬笆同一個形狀拉高 1.6 倍，約 5.4 m，樹下一圈土。
  - `src/zones3d.js`：`nav.blockCircle(78.9, ±12.4, 0.75)`，要放在 LIB-FRONT 那段 `freeRect` 之後。
  - `tests/lib_front_unit.js`：多一項（樹擋住、兩邊照樣走得過去）；平台取樣點 z ±12 改成 ±9。
- patch：
  - `lib_front_1102_v3d.patch`：完整版，基準 ba125d6f3、b1b249873；
  - `lib_front_1102_v31_incr.patch`：已經套了 v3c 的話只套這個。
- 還沒做：瀏覽器測試（campus_layout_nav、reachability_all）、遊戲內截圖。
