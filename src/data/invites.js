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
  /* 開場就有聯絡方式的（AA_124 1-7 第 3 點，2026-10-14）：阿哲（現有設定：已經熟）、阿凱（室友）、可昕（經濟系那一年就在一起）、學姊（直屬：開學前的家族群組，BB_70 3-1）。
     其他人在劇情裡拿到（事件的後果 contact:'人物 id'，內容由 AA、BB 寫）；錯過了，到「有點熟」以後聊天多一個「交換聯絡方式」（下面的 exchange，story3d.js talkCharacter） */
  contacts0:['zhe','kai','kexin','heroine_05'],
  /* 約不了的原因（AA_125 第 1 節的表＋AA_124 1-7 第 4 點，AA 決定）：手機「朋友」、約人時選地點的說明。{pr}＝她／他；不寫數字 */
  why:{
    stranger:'你們只打過招呼。先在學校多聊幾次。',
    meal:'再熟一點，才約得出去吃飯。',
    walk:'散步要等你們變成朋友。',
    abroad:'{pr}這學期在國外。',
    graduated:'{pr}已經畢業了。',
    away:'這學期不在學校',
    booked:'你們已經約好了：{when}，{place}。',
    partner:'兩個人單獨出去不太好。找大家一起吧。',
    noContact:'還沒有{pr}的聯絡方式。再熟一點，可以當面問{pr}。',
    noContactAsk:'還沒有{pr}的聯絡方式。可以當面問{pr}。'
  },
  /* 兩個人單獨的邀約（BB_70 0-2：散步、吃飯）：任一方有伴侶時不約，改成一群人（AA_125 第 1 節）。Café、總圖是「有理由的」，照常 */
  soloKinds:['meal','walk'],
  /* 保底的「交換聯絡方式」（AA_124 1-7）：對方的回應，每人一句（AA 的五位；BB 的人物 BB 寫，還沒有的用旁白，不替人物編台詞）*/
  exchange:{
    heroine_01:[{say:'「好。……我傳給你的第一則會是筆記。不要回貼圖。」'}],
    heroine_03:[{say:'「嗯。」'},{narr:'（她把手機推過來，畫面已經停在加好友那一頁。）'}],
    yu:[{say:'「欸你還不在我的群組裡？我拉你。三個。」'}],
    classmate_bohan:[{say:'「好。我只傳考古題。……還有時間表。」'}],
    classmate_xinci:[{say:'「好。我會傳讀書計畫表，你不用每一張都回。」'}],
    /* BB 的人物（BB_120 1-7b，第②級）：每一句都是她／他在手機上的習慣 */
    heroine_02:[{say:'「好。……上班時間我不回。下班一次回完。」'}],
    heroine_04:[{say:'「欸不是，你還沒有我的？好。我傳東西不解釋。」'}],
    classmate_peishan:[{say:'「好。我睡前常常想到問題。……你可以不回。」'}],
    classmate_mingxuan:[{say:'「好啊。二四六晚上我在家教，九點以後回。哈哈」'}],
    npc_fangyt:[{say:'「好。上山的時候沒有訊號，下山會一次回。」'}],
    classmate_youchen:[{say:'「好啊。週五我會丟一首歌，聽不聽隨你。」'}],
    npc_huangxh:[{say:'「好。我找受試者的時候，可以先問你嗎？」'}],
    npc_ta_chen:[{say:'「好。……有問題先問自己一次，再問我。」'}]
  },
  /* 這些作息的時候不能赴約（會說「改天」，附一個具體的時間）*/
  busyActs:['class','barista','help','club','ta'],
  /* 可以約的人：人物的分類（CHARACTERS 的 social_layer）——法律系熟同學 A、其他系 C、五位主角 D、學長姐 F；不熟的同學 B、教授 E 不行 */
  layers:['A','C','D','F'],
  /* 約的時間：今天這幾個時間（已經過去的不列）、明天這幾個時間 */
  times:[12+10/60,15.5,17.5,19,21],
  people:{}
};
