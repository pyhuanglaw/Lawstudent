# v1.5 — 2D canvas 美術測試（2026-09-27 07:10–07:21）

對應需求：`docs/history/specs/06`（直接操控的校園、2D 手繪感 Q 版美術）。

- `a_art.js`：色票、程序化角色（四方向、站／走／坐／讀）、對話頭像（表情）、貓。
- `a2_bust.js`：半身頭像測試。
- `test_art.html`、`test_bust.html`：測試頁；`art1.png`、`bust1.png` 是輸出截圖。
- `shot.py`：Playwright 截圖；`webgl_test.py`、`pw_test.png`：確認沙盒裡 WebGL 能不能跑（之後改用 three.js 做 3D）。

這條路線很快被放棄：先改成 3D，之後 spec 10 明確淘汰 Q 版。
