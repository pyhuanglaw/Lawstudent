# SIS-STATIONERY-1110：山嵐書店文具區（WIP，交班時保存）

狀態：`WORK_IN_PROGRESS`（**還沒交件**，沒給 LAWWW-B 整合）。LAWWW2-B，2026-11-10。

## LAWWW-B 的要求（11-10 00:51，P2）

- 看「看文具」互動點 (4.5, 6.5) 那一帶夠不夠像文具區：
  - 貨架或桌面平台；
  - 筆、筆記本、便條、紙膠帶分區擺；
  - 原創、無品牌的文具牌（D77）。
- 互動點的位置、名字不動。
- 品項清單 AA 在寫，寫好會轉過來，到時再照品項調擺設。

## 判斷：現在的不夠

- 舊版預覽圖：`before_wide.webp`、`before_close.webp`。
- 東牆架子上大多是一疊疊白色方塊。
- 兩張大桌子上的東西零星。
- 沒有便條紙，也沒有分區。
- 「文具選物」吊牌掛在 3 m 高，玩家的鏡頭看不到。
- 盆栽浮在背板頂上。

## 新版（第二輪）

做法：
- 兩張桌子、層板、背板、最上面一層明信片都是 AA 原本的，保留。
- 桌面和架上的小東西拿掉，換成分區擺的新文具。

分區：
- 靠門那張桌（z 7.4）＝筆：
  - 六格木筆盤（黑、藍、紅、綠、粉彩、鉛筆）；
  - 北邊一排插著筆的試寫架；
  - 三個筆筒、鉛筆盒、色鉛筆鐵盒、試寫本；
  - 分區牌「筆」。
- 裡面那張桌（z 5.6）＝紙膠帶：
  - 兩階展示台（立著、看得到中間的洞）、格子木盤、禮盒組、試貼板；
  - 分區牌「紙膠帶」。
- 東牆分三段，用木隔板隔開，分區牌夾在 1.6 m 層板前緣，在人眼的高度：
  - 北段：紙膠帶（立著兩排、木棍上掛一排、平放疊柱）；
  - 中段：筆記本（封面朝外斜靠＋平放庫存）；
  - 南段：便條紙（便利貼方塊、便條本、索引貼、牛皮紙盒）。
- 架子頂上加一片頂板，盆栽不再浮著。牆上加一塊「文具選物 STATIONERY」木牌（2.1～2.46 m）。
- 字全部原創、沒有品牌：`shl_stat_label.png`（`label_atlas.py`）。

預覽圖：`after_wide.webp`、`after_penA.webp`（第一輪）、`v2_*.webp`（第二輪）。這些是 Blender Cycles，不是遊戲截圖。
- **v2 三張交班前剛算好、還沒看過**。
- 第二輪改了三處：筆盤盤底內縮（修黑邊）、試寫架、分區牌改掛在 1.6 m 層板前緣。

## 做法（不用重烘光照）

- 山嵐的光照只烘在地板、天花板、牆面；家具、商品本來就用即時光（`bake_xs.sh` 的 --nolm）。
- `glb_strip_merge.py` 直接在已烘過的 `shanlan.glb` 上作業：
  - 拿掉文具區範圍內「整塊落在範圍裡」的小東西；
  - 新文具照材質名字接回原本的 `shl_vc`／`shl_vc_gloss`／`shl_oak_rt` 網格，不多 draw call；
  - 字另外一個材質 `shl_stat_label`，多 1 個 draw call。
- 地板、牆、天花板的第二套 UV、光照貼圖都不動。
- 數字：三角形拿掉約 14.1k、加約 24.4k，淨多約 10k；GLB 從 5.83 變成約 6.43 MB。

## 腳本（7bbb957fb 已 push）

`tools/blender/env_second/shanlan_stationery/`：`stationery_add.py`、`glb_strip_merge.py`、`label_atlas.py`。

```bash
python3 tools/blender/env_second/shanlan_stationery/label_atlas.py /tmp/shl_stat_label.png
/opt/blenv/bin/python tools/blender/env_second/shanlan_stationery/stationery_add.py -- --root <開發分支 checkout> --out /tmp/add.glb
python3 tools/blender/env_second/shanlan_stationery/glb_strip_merge.py <開發分支>/assets/models/env/second_ai/aa_support/shanlan.glb /tmp/add.glb /tmp/shanlan_new.glb --label /tmp/shl_stat_label.png
```

合併後的 GLB **沒有存進 repo**：照上面三行重產。

## 下一班要做的

1. 看 `v2_*.webp`。筆盤黑邊消失了沒、試寫架、分區牌位置對不對。
2. 要測但還沒測的：`tests/shanlan_unit.js`、`tests/shanlan_act_unit.js`、`tests/xs9_haopai_shanlan_check.py`、光照相關檢查。
3. 交 LAWWW-B：`shanlan.glb` 換新版，不用改程式。附預覽和數字，請 CC 拍、BB 判。
4. AA 的品項清單到了，照品項調 `stationery_add.py`。
5. AA 以後如果重新匯出 `shanlan.glb`，要依序重跑兩件事：先 `bake_xs.sh shanlan`，再跑上面三行。
