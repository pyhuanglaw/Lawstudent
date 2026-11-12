# 季節攤販擋住出店的落點（MOONCAKE-EXIT-1112；BB-C／CC 11-12 03:53 GAME_BUG，D108；LAWWW2-C）

- BB：開發分支 `be1e5d725` 的 reachability_all gongguan 第一次 FAIL——中秋前兩週白天（10～21 點），從日和便利店「離開」到公館的落點 (−29.4, 18) 站不住。
- 原因（CC 查的，我核對了資料）：季節攤販 MOONCAKE（中秋禮盒臨時桌）的導航擋格 x −32～−29.5、z 17.5～19.5，離落點 0.1 m；人物半徑 0.45。
- 我另外找到同一類的第二個：YAM（烤地瓜攤）的擋格 x −64～−62 正好蓋住公館燒臘出來的落點 (−63, 18)。

## 改了什麼（`mooncake_exit_v1.patch`；在開發分支 `2841eef02` 上 `--check` 通過；含 GLB，`git apply --binary`）
- `src/data/season_deco.js`：
  - MOONCAKE 整攤往西 2.2 m（擋格 x −34.2～−31.7；攤販、客人站的位置、腳印一起移）；離便利店落點 2.3 m。
  - YAM 整攤往東 2.6 m（擋格 x −61.4～−59.4）；離燒臘落點 1.6 m。
- `assets/models/env/second_ai/season_gongguan.glb`、`.json`：兩攤的節點（`SEASON_MOONCAKE_on`、`SEASON_YAM_on`）平移同樣的距離；json 的腳印跟著改。
  - **沒有重跑 Blender**（重建要整條公館街的貼圖，這個容器缺）：用新工具 `tools/blender/env_second/glb_move_node.py`（在我的分支）只改 GLB 的 JSON 區塊、給節點加平移，網格不動。之後照資料重建會得到一樣的位置。
- 新測試 `tests/season_exit_clear_1112_unit.js`：各區的季節擋格離「從別的區域進到這一區的落點」至少 0.75 m。修改前 FAIL（先抓到 MOONCAKE，修了以後抓到 YAM），修改後 ALL PASS。

## 驗證（Node）
- `season_exit_clear_1112_unit`、`season_deco_nav_unit`、`season_deco_unit` ALL PASS；讀到季節布置、夜市的其他 `*_unit.js` 都 ALL PASS。
- 全部 Node 測試沒有另外跑；瀏覽器沒跑（D131）。請 CC 重跑 reach gongguan＋中秋前兩週白天從便利店走出來、冬天從公館燒臘走出來。

## 先將就的
1. 兩攤的新位置沒有在遊戲畫面看過（會不會擋到招牌、和旁邊的機車重疊）。
2. 其他區域（溫州街、汀州路）的季節擋格這支測試也查了，沒有碰到落點；但夜市攤（另一套資料）沒有查。
