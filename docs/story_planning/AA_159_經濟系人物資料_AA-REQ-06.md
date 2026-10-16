# AA_159　經濟系那群的人物資料（AA-REQ-06／AB-10）

> **AA-B 整理，2026-10-16。等 BB-B 確認（AB-10）。** 回 LAWWW-B 的 AA-REQ-06（V0-B3、V0-G40）：`characters.js` 要的欄位。
> - **不是新設定**：
>   - 名字、個性、之後的發展照 `BB_104` 第 2 節。
>   - 外觀、身高照 `BB_116` 第 6-2 節，那是 BB-B 驗收過的參考圖規格，修正見第 7、11 節。
>   - 魏教授照 `BB_104` L88、`AA_145` §5（不用立繪）。
>   - 「個性一句」是從 `BB_104` 摘的，**BB-B 確認或改**；魏教授那一列有一項要 BB-B 決定（第 4 節）。
> - **已經有的**：盧正勳（阿勳）、曾品妤（V2-CHR，BB-B 02:00 的資料）。這次補四位：唐睿、邱韋綸、宋家豪、魏宏仁。
> - **id**：照企劃 syllabus 已經在用的（`AA_140` G40）。`econ_tangrui`、`econ_weilun`、`prof_wei` 已有；家豪新給 `econ_jiahao`。

## 1. 年級怎麼寫

- 開發分支的阿勳寫 `year:2`，是法律系大一（2025 學年）時的年級。
- 經濟系大一（2024）他們是一年級，家豪是二年級。建議加一個 `entryYear`（入學年），年級用日期算；不加的話照阿勳的寫法，以 2025 學年為準。
- **畢業**（四年畢業，`AA_115` 第 6 節「經濟系朋友到 2028-06」）：
  - 韋綸、品妤、阿勳、唐睿：2028-06。
  - 家豪：2027-06。
  - 之後 `presence` 結束，只剩手機。

## 2. 資料（可以直接貼；`char3d` 由 LAWWW 照參考圖做，這裡不寫）

```js
econ_tangrui:{ id:'econ_tangrui', name:'唐睿', gender:'m', department:'經濟系', year:2, entryYear:2024, height:177, social_layer:'C', visual_tier:1,
  presence:{from:'Y0S1',until:'2028-06'},
  personality:'經濟系同學，全系最會講話的人，也在即興劇社。熱心、會帶氣氛、記得每個人的名字；正常的好人。喜歡品妤（全系只有品妤自己不知道）',
  career_goal:'',
  look:'自然捲的黑色短髮、表情誇張；天藍色 polo 衫（一定有領子）＋白色長褲＋球鞋，襯衫口袋露出一疊便利貼',
  portrait:'econ_tangrui', daily_schedule:[] },
econ_weilun:{ id:'econ_weilun', name:'邱韋綸', alias:['阿綸'], gender:'m', department:'經濟系', year:2, entryYear:2024, height:176, social_layer:'C', visual_tier:1,
  presence:{from:'Y0S1',until:'2028-06'},
  personality:'揪大家騎腳踏車的人。熱血、什麼都想試、計畫永遠做到一半；台中人；口頭禪「走啦！」；二手腳踏車的鏈子常掉。大二起加修運動相關的雙主修',
  career_goal:'',
  look:'皮膚曬黑、身體總是往前傾；短髮，瀏海被安全帽壓扁；橘色運動 T 恤＋深藍短褲＋運動外套，手上拿腳踏車安全帽，褲管有一點鏈條油漬',
  portrait:'econ_weilun', daily_schedule:[] },
econ_jiahao:{ id:'econ_jiahao', name:'宋家豪', gender:'m', department:'經濟系', year:3, entryYear:2023, height:170, social_layer:'C', visual_tier:1,
  presence:{from:'Y0S1',until:'2027-06'},
  personality:'祐廷經濟系的直屬學長、迎新的隊輔。熱心、愛講冷門的學長姊傳說、自稱「公館美食地圖」。法律系時期不出現',
  career_goal:'',
  look:'短髮，常戴一頂沒有圖案的棒球帽；迎新隊輔的螢光黃背心（沒有字）＋黑色 T 恤＋牛仔褲；手上一本寫滿公館小吃的筆記本',
  portrait:'econ_jiahao', daily_schedule:[] },
prof_wei:{ id:'prof_wei', name:'魏宏仁', title:'魏教授', gender:'m', department:'經濟系', role:'professor', social_layer:'C', visual_tier:0,
  personality:'經濟學原理的老師。喜歡用一個數字說一件事',
  look:'（BB-B 決定，第 4 節）',
  portrait:null, daily_schedule:[] },
```

- **立繪**：
  - 唐睿、韋綸：已通過（V2-CHR 那一列寫的）。
  - 家豪：參考圖已過（`BB_116`，第 11 節棒球帽改素面），立繪由 BB-B 驗收後才有；沒有的話先用 compact 對話（`BB_104` L336：宋家豪、唐睿 Tier 1，compact 即可）。
  - 魏教授：**不用立繪**（`AA_145` §5：只有聲音和遠景，講台上用現有教授底模）。
- **作息**：經濟系大一的作息跟著 v0 施工，照 `AA_154` 的總時間線和課表（`syllabus/Y0S1.json`、`Y0S2.json` 的 `econ_*`）。法律系時期的韋綸、唐睿照 `AA_155` 第 4 節的規則延伸（P5、`BB_106` D2），等 V0-SK。

## 3. 和現有兩位的差異（給 LAWWW 對照，不用改）

| 欄位 | 阿勳、品妤（開發分支現有） | 本檔 |
|---|---|---|
| `entryYear`、`presence.until` | 沒有 | 建議加（第 1 節）；加的話阿勳、品妤也補 `entryYear:2024`、`until:'2028-06'` |
| `alias` | 阿勳、品妤 | 韋綸加「阿綸」（`BB_104`）；唐睿、家豪沒有暱稱 |

## 4. 要 BB-B 決定的

1. 四位的「個性一句」（`personality`）：從 `BB_104` 摘的，同意或改。
2. **魏教授的外觀**：
   - 他沒有參考圖，`AA_145` 說只要講台上的遠景。
   - 要不要給一句 `look`，讓 3D 底模換衣服、髮型？
   - 建議：「五十多歲，灰黑短髮，白襯衫外面套深藍色毛衣背心，手上永遠拿著一支白板筆」。周教授的眼鏡已經拿掉，所以兩個人都不戴眼鏡；白板筆是區分。
   - BB-B 不想加就寫「不用」。
3. 家豪立繪要不要做：v0 的 E02、E15 他都在場，compact 對話也可以。
