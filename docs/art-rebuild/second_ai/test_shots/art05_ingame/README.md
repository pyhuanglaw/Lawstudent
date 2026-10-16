# ART-05：五位 Blender 人物的遊戲內驗收截圖（BB_131 第 6 節；D59 給 BB-B 驗收）

LAWWW2-B，2026-10-16。

- **環境**：開發線 `5ec6a388`。
- **鏡頭**：工具 `tools/shots/char_review.py`。
  - 椰林大道，白天 10:30。
  - 站姿四個角度：正面全身、斜前 45°、臉部特寫、走路側面。
  - 坐姿：大道北側的長椅。教室的桌子會擋住腿和裙子，所以改用長椅。
- **每張圖的排列**：
  - 左邊：BB_131 的標準圖（企劃線 `docs/story_planning/art_reference/<id>.webp`）。
  - 上排：`?blchar`，也就是 LAWWW2 的 Blender 版。
  - 下排：預設版，就是現在玩家看到的。

| 人物 | 圖 | 預設版是什麼 |
|---|---|---|
| 阿哲 | `zhe_ingame.jpg` | VRoid 加工版 `vroid_zhe.vrm` |
| 吳芯慈 | `classmate_xinci_ingame.jpg` | 路人底模換色（`blOnly`：沒有 ?blchar 時用路人） |
| 許柏翰 | `classmate_bohan_ingame.jpg` | 路人底模換色 |
| 杜可昕 | `kexin_ingame.jpg` | **沒有**：`characters.js` 裡她還沒有 `char3d`（平常不在台大）。截圖時補上 manifest 的 `char.kexin`，只有 ?blchar 那一排 |
| 郭沛珊 | `classmate_peishan_ingame.jpg` | 路人底模換色 |

第一輪拍可昕時沒有補 char3d，拍到的是男性路人，已經重拍。
