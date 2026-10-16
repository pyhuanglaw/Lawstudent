# 心願約會事件（`AA_128` 第 6 節；`AA_140` G33）

每位女主角一個 `wish_<人物 id>.json`，第一次和她**單獨**去她的心願地點時播。之後再去，照 `lines/<地點>.json` 的一般反應。

## 規則（七處都一樣）

- `lines/<地點>.json` 裡，心願本人的 `first` 一律是 `{"wishEvent": "<這裡的檔名或規格出處>"}`。
- 程式看到 `wishEvent`，就改播這裡的事件。
  - 已經這樣做的：D03、D05、D06、D07、D15、D25。
  - D13 由 BB-B 的轉換程式補標記。

## 格式

| 欄位 | 內容 |
|---|---|
| `learn` | 聊天裡得知（記 `wishKnown`）。`cond.stageMin`＝第幾階以上。`versions[]` 依時間點選一版：`lines`、`choice`、`after`（選完以後接的句子）。`extraIf[]`＝條件成立時多一句 |
| `invite` | 她主動約。`cond` 列條件、不約的時候（`notWhen`）、傳訊時間、每學期次數、被拒絕後隔幾週。另有 `msg`、`accept`、`decline`，以及 `playerInvite`（玩家主動約她：`known`／`unknown` 或其他版本） |
| `arrive` | 抵達。`lines`＋`byRel`（`stage5`、`stage6_single`、`dating`） |
| `hotspots` | 每個互動點：`lines`、`choice[{t,reply}]`、`extraIf`、`set` |
| `likes` | 她對每個互動點的偏好（結算用，`AA_128` 5-3） |
| `closing` | 心願場景，第一次一定播。`lines`、`choice`、`byTime`（依時間點換句或加句）、`byRel`、`set`（旗標、記憶）、`album`（Life Album 存什麼）、`settle`（結算） |

- 每一行是 `{who, text}`：
  - `who` 是人物 id＝她說。
  - `narr`＝旁白，用第二人稱「你」。
  - `note`＝給開發的註記，不顯示。
- 限制：每句 40 字以內，選項 20 字以內（`build_wish_aa.py` 會擋）。
- 時間、花費照 `point_specs.json`。

## 進度

- `wish_heroine_01.json`：以安，D07「規則之外的人」（`AA_127` 第 1 節；AA-B 2026-10-16）。
- `wish_heroine_03.json`：語彤，D13「這次只有兩個人」（`AA_127` 第 2 節；AA-B 2026-10-16）。
- `wish_heroine_02.json`（芷若 D05「這次留兩張票」）、`wish_heroine_04.json`（子晴 D03「最後一關換你」）、`wish_heroine_05.json`（學姊 D15「今晚沒有第三件事」）、`wish_classmate_peishan.json`（沛珊 D06「沒有標準答案的一天」）、`wish_kexin.json`（可昕 D25「如果今天沒有行程表」）：BB-B 2026-10-16，`BB_128` 3-1～3-5。
  - 原稿 `wish_bb.py`（照 BB_128 一字不改，只拆成資料）→ `python3 -I build_wish_bb.py`。
  - 檢查：逐句比對 BB_128 原文（少一句就失敗，只允許拆句）、40／20 字、互動點與喜好和 `lines/<地點>.json` 一致、`first` 指到這裡、D77 品牌。
  - 旁白不加括號（和以安、語彤一致）；BB_128 的旁白原本有括號，拿掉不算改字。
- D13 語彤的 `first` 標記已補（`lines/md_to_json_D13.py`）；同時補上她第二次以後的抵達、收尾（BB_128 5-1 寫「照 AA_127 2-6」，之前沒轉到）。

## BB 五位多用的欄位（AA 的格式裡沒有的，補充說明）

| 位置 | 欄位 | 意思 |
|---|---|---|
| `learn.cond`、`invite.cond` | `after` | 前置（事件、旗標，括號裡是 id）；`note` 是補充 |
| `invite` | `msgIf[]` | 條件成立時換掉整段 `msg`（沛珊大二下重考中） |
| `invite.playerInvite` | `if`、`retake` | 學姊：`SIS_HEALED` 以後玩家約才會答應；沛珊重考中只答應 D06 |
| `arrive` | `extraIf[]`、`admission` | 時間點的多一句（子晴大四）；有門票，抵達時扣（沛珊北美館） |
| `fixed` | — | 芷若的看電影（固定活動，不算互動點） |
| `hotspots.*.choice[]` | `if` | 不成立就不出現這個選項（例：K8 去過海邊才有「海浪說『回來』」） |
| | `replyIf[]` | 條件成立時**換掉** `reply`（取第一個成立的） |
| | `extraIf[]` | 條件成立時在 `reply` 後面**多說** |
| | `cost`、`extra` | 選了才另外扣的錢（明信片 30、茶葉蛋 15、請她那杯 150） |
| `closing` | `after` | 選完以後一定說的句子（子晴） |
| `closing.byTime` | `insertAfter{原句:[行]}`、`replace{原句:[行]}`、`[行]` | 在那一句後面插入；換掉那一句；直接多說 |
| `closing.byRel` | `dating_afterQ12`、`ex` | 子晴交往中 Q12 以後；可昕分開以後重新追她（可昕的預設是 `dating`） |
| `closing` | `memoryText` | 記憶的說明（`set` 裡的 `memory:` 那一個） |

- 條件字串裡的 id：`WATCHED_FILM`（芷若記憶，Z5 兩個人看）、`ev_zhiruo_third_row`（Z11b，**還沒實作，id 由 LAWWW-B 定**）、`ATTENDED_SHOW`（子晴 Q12）、`SIS_HEALED`、`ev_sis_empty_flask`（W4）、`SIS_BEEN_US`（**暫名**）、`ev_peishan_syllogism`（P2b）、`ev_kexin_trip_spring_y1`（K8）、`KX_TRIP_DEFERRED_DONE`（**暫名**）、`KX_TRIP_Y1S2=sea`、`ev_kexin_k18`（K18）、`EX_kexin`。暫名的請 LAWWW-B 換成實際旗標、告訴 BB-B。
- 「第 N 階」＝`AA_126` 4-1 的 1～6 階；「交往中」＝`dating_<id>`。

## 不分地點的句子（`DATE_LINES_COMMON`）

- `common_bb.json`：BB 五位 × 出發、差不多了、取消、放鴿子、一個都沒做就走、合照還不行（`BB_128` 2-9、3-6）。`python3 -I build_common.py` 直接讀 BB_128 的表，一字不改。
- `lines[角色][key]`＝好幾套，擇一、輪流。可昕的 `noPair` 只在 `EX_kexin`（分開以後）才說，交往中一定可以合照。
- 以安、語彤的由 AA-B 做。
