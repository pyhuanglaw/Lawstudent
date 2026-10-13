/* 邀約的資料（D54 ⑥「訊息、朋友、邀約」；使用者 2026-10-11 的七點，原文在企劃分支 AA_70 第 0 節）：
   1 手機可以聊天、看課表、地圖、筆記；2 認識的朋友才有聯絡方式；3 當面或用手機約去 Café、總圖、公館吃飯、溫州街散步；
   4 NPC 答不答應看日程、關係、個性、既有約定；5 答應後可以一起走過去；6 NPC 也會約、拒絕可以提改天；7 日常不一定推進戀愛或好感。
   一般規則在 src/invites3d.js。每個人的個性（AA_70、BB_70 的「被邀約時」「主動邀約」「一起走路時聊什麼」）是劇情內容，
   **使用者批准後才填 people**；沒填的人照一般規則，結果用旁白寫（不替人物編台詞）。 */
const INVITE_DATA={
  /* 可以約去的地方（使用者指定的四個）。minStage：關係至少要到哪一階（SOCIAL.STAGES）——
     有理由的（念書、寫報告、喝咖啡）剛認識就可以；吃飯要熟一點；散步這種「沒有理由的」要是朋友（使用者第 4 點的「關係」；AA_70 1-3 的方向）。
     stay：一起待多久（小時）；memory：留下的小記憶（SOCIAL 的記憶標籤）；rainTo：下雨時改去哪裡 */
  places:[
    {id:'cafe',    zone:'cafe',         name:'兩點半 Café',  verb:'去兩點半 Café 坐坐',   kind:'reason', minStage:'ACQUAINTANCE', stay:1,    memory:'CAFE_AFTERNOON',  sitAct:'read'},
    {id:'library', zone:'library_hall', name:'總圖',         verb:'去總圖一起念書',       kind:'reason', minStage:'ACQUAINTANCE', stay:1.5,  memory:'STUDIED_TOGETHER', sitAct:'read'},
    {id:'noodle',  zone:'noodle',       name:'阿鳳麵店',     verb:'去公館吃飯（阿鳳麵店）', kind:'meal',   minStage:'FAMILIAR',     stay:0.75, memory:'SHARED_MEAL',     sitAct:'eat'},
    {id:'wenzhou', zone:'wenzhou',      name:'溫州街',       verb:'去溫州街散步',         kind:'walk',   minStage:'FRIEND',       stay:0.75, memory:'WALKED_TOGETHER', sitAct:'wait', rainTo:'cafe'}
  ],
  /* 開場就有聯絡方式的：阿哲（現有設定：已經熟）、阿凱（室友）。其他人要在劇情裡拿到（事件的後果 contact:'人物 id'，內容由 AA、BB 寫） */
  contacts0:['zhe','kai'],
  /* 這些作息的時候不能赴約（會說「改天」，附一個具體的時間）*/
  busyActs:['class','barista','help','club','ta'],
  /* 可以約的人：人物的分類（CHARACTERS 的 social_layer）——法律系熟同學 A、其他系 C、五位主角 D、學長姐 F；不熟的同學 B、教授 E 不行 */
  layers:['A','C','D','F'],
  /* 約的時間：今天這幾個時間（已經過去的不列）、明天這幾個時間 */
  times:[12+10/60,15.5,17.5,19,21],
  people:{}
};
