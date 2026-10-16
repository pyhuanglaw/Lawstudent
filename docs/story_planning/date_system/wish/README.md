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
- 芷若 D05、子晴 D03、學姊 D15、沛珊 D06、可昕 D25：BB-B 照同一個格式轉（`BB_128` 第 3 節）。
