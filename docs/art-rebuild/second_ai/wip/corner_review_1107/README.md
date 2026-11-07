# 轉角唱片（公館 G12，CC v1c）MODEL_READY 驗收：第一輪（LAWWW2-B 2026-11-07）

**依據**：AA_650（CC 做轉角唱片室內；MODEL_READY 由 LAWWW2 收，功能和 ART_APPROVED 由 BB 判）；LAWWW-B 14:48「轉角唱片也還沒進遊戲，盤點時一起看它卡在哪」。

**驗的檔**（`claude/cc-testing` `4fc38d513`，CC 帳號 A 11-04）：
- `assets/models/env/second_ai/bb_support/corner.glb`（3.79 MB）、`corner.json`
- `src/data/corner_layout.js`
- 腳本 `tools/blender/env_second/bb_support/corner_interior.py`、`corner_tex.py`、`corner_render.py`
- 說明 `docs/story_planning/CC/CC_47_轉角唱片室內.md`

**結論（第二輪，15:2x）：MODEL_READY。**
- 第一輪找到的「音響、唱盤會浮在空中」由 LAWWW2-B 改好了。LAWWW-B 15:00「改，照 (a)」；CC〔帳號 A〕休班，D75。
- 其他項目照下面，有的要 LAWWW 接區域時補，有的要 CC 在遊戲裡看。
- 光照烘焙等區域接好再做；ART_APPROVED 由 BB 判。

## 第二輪：改了什麼（CORNER-IN-1107）

**腳本**：`tools/blender/env_second/bb_support/corner_interior.py`。檔案開頭註明了是誰改的、為什麼。照放的地方分原型：

| 原型 | 改成 |
|---|---|
| 擴大機、收音機、卡座 | `side='right'`（只放在鐵架上） |
| 喇叭 | `SPK`＝右（鐵架 10＋試聽吧台 1）、`SPK_L`＝左（音響櫃 1） |
| 唱盤 | `TT`＝右（鐵架 3）、`TT_L`＝左（音響櫃 1）、`TT_B`＝後（展示龕 1） |

- 幾何、位置、材質、貼圖都沒動。
- 網格名字變成 `WALL_<面>_…`；`fix_instanced_names` 補 `extras.dir`，遊戲照那面牆淡出。
- 只放一台的（左邊唱盤、喇叭，後面唱盤）不是 instancing，照材質併進那面牆的網格。
- 原本單獨的 `WALL_back_curtain_*`、`WALL_left_leftwall_deco_vcm` 也一起併進那面牆的網格；遊戲程式、配置都沒有用到這兩個名字。

**怎麼確認只改了這些**：
- 先用同一個 `lib2.py`（LAWWW2 分支的；cc-testing 那一份太舊、沒有 `Mesh.rbox`）**不改腳本**重產一次。
- 和 CC 的 corner.glb 逐節點比：三角形、材質、instance 數、牆的方向、位置、貼圖全部一樣。
- 再改腳本重產。

**數字**：

| | CC v1c | 改後 |
|---|---|---|
| 三角形（含 instancing） | 55,004 | 55,004 |
| 材質 | 11 | 11 |
| 節點 | 63 | 65（多了左、後兩台唱盤的玻璃蓋） |
| GLB | 3.79 MB | 3.87 MB（三台不是 instancing 了，幾何多一份） |

**新測試 `tests/corner_glb_unit.js`**（`corner_in_1107.patch`，和 LICENSES 那一行一起）：

| | 結果 |
|---|---|
| 沒有 GLB | FAIL 1 |
| CC v1c 原檔 | FAIL 3：靠牆、放在家具上的 76 個 instance 不跟著淡出 |
| 改後 | **ALL PASS**：64 個都在那面牆底下 |

76 和 64 不一樣：原檔一個 instancing 節點裡，有的 instance 靠牆、有的不靠牆，一起算。

檢查四件事：
- ① 三角形、材質、只有玻璃雙面；
- ② 四面牆的節點和 dir；
- ③ 靠牆 0.6 m 內、離地 0.3 m 以上的 instance 都在那面牆的 WALL_ 節點底下；
- ④ 配置的店門照外觀 G12。

## 第一輪（15:0x）

**當時的結論：還不能標 MODEL_READY。** 有一項一定要改（右牆的音響會浮在空中），其他都可以接，或要在遊戲裡看。

## 一定要改

**1. 右牆淡出時，鐵架上的音響、唱盤會浮在空中。**
- 右牆的鐵架（`WALL_right_cr_vc_metal`，x 2.71～3.89、z −5.2～5.5、高到 3.3 m）掛在 `WALL_right` 底下。鏡頭在右邊時，它跟著右牆淡出。
- 架子上的東西是 GPU instancing，節點掛在根節點 `corner_interior` 底下，不會跟著淡出：

  | 東西 | 架上的幾個 |
  |---|---|
  | 擴大機 `cr_amp_0` | 4 |
  | 卡座 `cr_deck_0` | 2 |
  | 收音機 `cr_receiver_0` | 3 |
  | 喇叭 `cr_speaker_0` | 12 個裡的 11 個 |
  | 唱盤 `cr_turntable_0` | 5 個裡的 3 個 |

  它們都在 x 3.54～3.71、高 0.6／1.08／1.53／1.97 m 的層板上。
- CC_47「還沒驗的事」第一條就是這個（「含 WALL_right_*_inst 的音響、唱盤跟著右牆淡出」），但匯出的 GLB 沒有做到。
- 其他已經進遊戲的公館店（afar、Daybreak、慢輪）的 instancing 節點也都不在牆底下；它們的牆上沒有架子放 instancing 的東西，所以沒問題。
- **不只右牆鐵架**（讀了 `corner_interior.py`）：
  - 原型 `Proto('speaker'／'amp'／'receiver'／'deck'／'turntable')` 都沒有 `side`，放在哪面牆的家具上都一樣；
  - 那些家具本身是 `Part(..., side=...)`，會淡出。
  - 所以下面這些也會浮：
    - 左牆音響櫃（`audio_cab`，side left）上的唱盤、喇叭各 1；
    - 後牆展示龕（`niche`）裡的唱盤 1；
    - 右牆試聽吧台（`listen_desk`，side right）上的喇叭 1。
  - 匯出的 `fix_instanced_names` 只在網格名字是 `WALL_<面>_` 開頭時補 `extras.dir`，原型不是，所以都沒補到。
- **改法**（二選一）：
  - (a) `corner_interior.py` 照放的地方分原型：
    - 擴大機、收音機、卡座只在右牆鐵架上，直接設 `side='right'`；
    - 喇叭分右（鐵架 11＋吧台 1）、左（音響櫃 1）；
    - 唱盤分右（鐵架 3）、左（音響櫃 1）、後（展示龕 1）。
    - 這樣網格名字是 `WALL_<面>_…`，`fix_instanced_names` 會補 `extras.dir`，就跟著那面牆淡出。
    - primitive 約 +12（多出來的左、後兩組唱盤、左邊喇叭）。
  - (b) GLB 後處理：把 x > 3.3 的 instance 從原本的 instancing 節點拆出來，搬到新節點 `WALL_right_gear` 底下。不用重跑 Blender，但以後 CC 重新匯出又會回來。
  - 我建議 (a)。CC（帳號 A）不在班的話，我可以照 (a) 改腳本重新匯出，由 LAWWW-B 決定。

## 可以接，但要注意

**2. 配置的格式**：
- `CORNER_LAYOUT` 外面多包了一層 `{version, corner:{…}}`；afar、Daybreak 是平的。
- `exit`、`enterAt` 是 null，要 LAWWW 接區域時補（照 afar）。
- 其他欄位和 afar 一樣，另外多了 `hours`、`windowKeep`、`camRef`、`lights`、`npc`。
- 店深：說明的 v1 那一節寫 10.5 m，配置是 `d: 11.5`，以配置為準。

**3. 門窗和外觀（LAWWW-B 14:56 要疊一次）**：
- 外觀（公館街的 G12）是 `wz_street.py` 的 `'G12'`：
  - 櫥窗兩張卡 x −3.39～−2.0、−2.0～0.69（0.64～2.81）；
  - 木門 x 0.84～2.42、頂 2.81、門扇高 2.47、左鉸鏈。
- 室內 `corner_layout.js`：
  - 門 x 1.63、寬 1.58（＝0.84～2.42）、門高 2.47、氣窗 2.81；
  - 櫥窗 x −3.39～0.69。
- 兩邊的本地 x 都是「從騎樓看過去左→右」（DOORS.md），所以**門、窗的位置一致**。
- **門扇不會重疊**：室內有一扇往裡開的門扇（`WALL_front_door_leaf_*`），外觀也有一扇（`ggcorner_door`）。可是進店是另一個區域，室內模型和公館街的模型不會同時載入；外觀看進去的是窗卡 `ggcorner_int`，不是真的室內。兩扇都留著。
- 還沒在遊戲裡從騎樓看、從店裡看門口，要 CC 拍。

**4. 發光材質**：
- CC_47 說夜間光暈是 `GLOW_spot_*`、`GLOW_pendant_*`。實際上投射燈、吊燈的節點叫 `cr_spot_0_emit_inst`、`cr_pendant_0_emit_inst`，材質是 `cr_emit`，沒有 `GLOW_` 開頭。
- afar（`afr_bulb`）、慢輪（`bk_emit`）也是這樣，所以不是問題，只是說明寫錯。
- 晚上亮不亮、打烊後暗不暗，要遊戲內看。

**5. 天花板**：
- `cr_concrete` 朝下的面 87.4 m²，房間 92 m²，單面朝下，符合規範。
- 但天花板下管線的頂面朝上（6.6 m²），軌道燈的鋁軌頂面也朝上（3.9 m²）。鏡頭高過天花板時（剖面視角），可能看得到幾條浮在上面的線。要遊戲內看。

**6. 數字**：

| 項目 | 數字 |
|---|---|
| 三角形 | 55,004（含 instancing，預算 60k）；不含 instancing 44,900 |
| primitive | 63 |
| 材質 | 11 個，只有玻璃 `cr_glass` 雙面、半透明；`cr_alpha`（葉子、海報）是 alphaTest |
| GPU instancing 節點 | 29 個 |
| 唱片 | 637 張 |

手機效能要 CC 量。

**7. LICENSES**：補了一行，在 `corner_in_1107.patch`，接在慢輪單車那一行後面。

## 接下來
1. ~~第 1 項改好，我再驗一次 → MODEL_READY。~~ 完成（第二輪）。
2. LAWWW-B 接區域：照 afar，補 exit、enterAt；`places.corner_records` 已經有每天 12–21。
3. AA 寫台詞：試聽、翻唱片、問店員；互動點的 label 現在是草稿。
4. CC 遊戲內拍照：第 3～6 項；BB 判畫面。
5. 我烘光照。
