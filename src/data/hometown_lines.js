/* 寒暑假去她的縣市（AA_276 第 1-1、4、5 節，AA-C 13c583c9 定稿；使用者 23:4x「寒暑假只能去高雄找他才會見到面」、23:5x「除非玩家有跟他交往」）。
   台詞一字不改（{name}＝玩家的名字）；邏輯在 src/hometown3d.js。bg＝2D 背景的 id（BB 向使用者要圖，還沒有＝深色底，OUT.bg）。
   pick＝第一次的車站接人；pickAgain＝第二次以後的接人（AA_276 第 7 節第 1 點，9e875a10：不重複第一次那兩句）；fare＝高鐵來回票價（第 7 節第 2 點）；first＝第一次；again＝再去，三選一輪流；send＝傍晚送上車（交往中 dating、不是 other）；keep＝沛珊重考消失期、交往中（5-5，不用 first／again）。 */
const HOMETOWN_LINES={
  kexin:{ city:'高雄', travel:'高鐵約一個半小時', travelH:1.5, fare:2980, ask:'我去高雄找妳？',
    yes:'真的？……那我去車站接你。來之前先跟我說幾點的車。', yesDating:'你要來？……好。幾點的車，我去接你。',
    pick:{bg:'kh_station',lines:[{narr:'（左營站。出口外面的太陽比臺北大。她站在柱子旁邊，戴著帽子。）'},'你真的來了。','我騎車載你。安全帽是我媽的，有點小。']},
    pickAgain:{bg:'kh_station',lines:[{narr:'（左營站。出口外面的太陽比臺北大。她站在柱子旁邊，戴著帽子。）'},'這次換這頂安全帽了。……上車。']},
    first:{scene:'高雄・港邊',bg:'kh_harbor',lines:[{narr:'（你們坐在港邊的長椅上，看船慢慢進來。她買了兩支冰。）'},'這裡我國中常來。那時候覺得臺北好遠。','現在也是。高鐵一個半小時，還是很遠。']},
    again:[
      {key:'night',scene:'高雄・她家附近的夜市',bg:'kh_night_market',lines:['這攤我從小吃到大。……你吃得完再說。']},
      {key:'rain',scene:'高雄・便利商店',bg:'kh_store',lines:[{narr:'（雨下了整個下午，你們在便利商店坐到傍晚。）'},'高雄很少下雨。你一來就下。']},
      {key:'river',scene:'高雄・愛河邊',bg:'kh_river',lines:['晚上來比較好看。可是你要趕車。'],dating:['……下次住一晚啦。']} ],
    send:{narr:'（傍晚，她騎車送你回車站。）',dating:['開學我就上去了。……到時候換你來接我。',{narr:'（她站在閘門外面，等你走到看不見。）'}],other:['路上小心。到了傳一下。']} },
  classmate_peishan:{ city:'台中', travel:'高鐵約一小時', travelH:1, fare:1400, ask:'我去台中找妳？',
    yes:'好啊！！我帶你去吃我家附近那間。……你不能嫌遠喔。', yesDating:'真的嗎！！那我去車站等你。我會提早到。', yesKeep:'好。……一個下午就好，我晚上還要念。',
    pick:{bg:'tc_station',lines:[{narr:'（台中車站。她在出口揮手，揮得很大。）'},'{name}！這裡這裡！','先說好，我家附近那間要排隊。排隊的時候我可以問你問題嗎？']},
    pickAgain:{bg:'tc_station',lines:[{narr:'（台中車站。她在出口揮手，揮得很大。）'},'{name}！這邊！……你這次沒有迷路耶。']},
    first:{scene:'台中・她家附近的小吃店',bg:'tc_eatery',lines:['我小時候每個禮拜六都來。老闆還認得我。','你覺得台中跟臺北哪裡不一樣？'],
      opts:[{t:'比較熱。',say:['對！而且路比較寬！']},{t:'人比較少。',say:['那是你沒在假日來。']},{t:'妳在這裡比較常笑。',dating:true,say:['……你不要突然講這種話啦。']}]},
    again:[
      {key:'park',scene:'台中・公園',bg:'tc_park',lines:['我小時候在這裡學騎腳踏車。我爸在後面扶，扶到一半就偷偷放手。']},
      {key:'books',scene:'台中・書店',bg:'tc_bookstore',lines:['這間比舊路書房大很多。可是我比較喜歡舊路書房。']},
      {key:'rain',scene:'台中・咖啡店',bg:'tc_cafe',lines:[{narr:'（下雨了，你們在咖啡店坐了一整個下午。）'},'本來要帶你去公園的。……那我們來猜隔壁那桌在聊什麼。']} ],
    send:{narr:'（傍晚，她送你到車站。）',dating:['下次換你來台南。……我帶你走。'],other:['謝謝你來！到臺北傳給我喔。']},
    keep:{pick:{bg:'tc_station',lines:[{narr:'（台中車站。她手上還拿著一支螢光筆，好像是出門時忘了放下。）'},'我只能出來三個小時。']},
      place:{scene:'台中・她家附近的公園',bg:'tc_park',lines:[{narr:'（你們沿著公園走了兩圈。她講了很多今天念的東西，講到一半自己笑了。）'},'……可是我很高興你來。']},
      send:[{narr:'（她送你到車站。）'},'回去的路上不要傳訊息給我，我會想回。'],
      /* 消失期玩家傳訊息她回什麼（AA_276 第 6-1 節，4fbabbee；只有交往中＝L）：23:00 以後才回、輪流；問課不開；謝謝、生日、還好嗎、新年照 AA_257 的 L（msg3d.js）*/
      replies:{chat:['在念地理。','剛吃完飯，要繼續了。','在寫考古題，第三回。'],share_cat:['好可愛。……我先念書。'],share_food:['看起來好好吃。考完你帶我去。'],share_notes:['你們的講義還是好多字。'],night:['晚安。我再念一小時。','嗯，晚安。']}} },
  /* 沛珊大三、大四的學期中在台南（AA_328 3-09，AA-C 5ae6a133；第一次＝AA_321 1B-11／AA_282 3-1 原文，第二次以後的接人＝3-09 第 2 節新寫，裁定 9）。
     presence 的 city（或 home）是 '台南' 的時候用（hometown3d.js 的 S.key；presence 已改台南，AA_282 第 5 節第 1、3 點）。yes／yesDating 照台中那一組；沒有 keep（消失期已經過了）。
     skipDays＝BB_165 5-1、5-2、P6 公開課那三天（本身就是那一場）；extra＝沒交往、去過台南的玩家，2027-12-10 以後下一次去時當面看孩子的作業（AA_328 3-19 裁定 25）。
     背景 tn_*：台南車站、她的學校、二手書店、老街、運河邊都還沒有圖（AA_282 第 5 節第 6 點）＝深色底＋地點字幕 */
  'classmate_peishan@台南':{ city:'台南', travel:'高鐵約一小時四十分鐘', travelH:1.75, fare:2700, ask:'我去台南找妳？', ev:'ev_hv_ps_tn',   /* ev：出遊事件（回程的高鐵一小時四十五分，events.js）*/
    yes:'好啊！！我帶你去吃我家附近那間。……你不能嫌遠喔。', yesDating:'真的嗎！！那我去車站等你。我會提早到。',
    skipDays:['2027-11-19','2028-11-17','2029-04-14'], visitsFlag:'PS_TAINAN_VISITS', lastFlag:'PS_AGAIN_LAST',
    pick:{bg:'tn_station',lines:[{narr:'（台南車站。她站在出口，兩手各拿一杯飲料。）'},'{name}！這杯你的。這邊的紅茶很甜喔，你先喝一口。']},
    pickAgain:{bg:'tn_station',lines:[{narr:'（台南車站。她在出口揮手。）'},'{name}！你又來了！','今天我已經想好要去哪裡了。']},
    first:{scene:'台南・她的學校',bg:'tn_school',lines:['這是我們學校。很小吧？走一圈十分鐘。','欸，你覺得我有沒有哪裡不一樣？'],
      opts:[{t:'曬黑了。',say:['對！這裡的太陽跟台中不一樣。']},{t:'頭髮剪短了？',say:['上個月剪的。我室友到現在都還沒發現。']}]},
    again:[
      {key:'books',scene:'台南・她打工的二手書店',bg:'tn_bookstore',lines:['這一區是我排的。你看得出來照什麼排的嗎？','……照書背的顏色。老闆說隨便我。']},
      {key:'food',scene:'台南・老街',bg:'tn_oldstreet',lines:['我室友說這攤一定要吃。……其實我也是第一次來。']},
      {key:'canal',scene:'台南・運河邊',bg:'tn_canal',lines:['欸，那艘船是不是一直停在那裡？','它在等什麼啊？']} ],
    send:{narr:'（傍晚，她陪你坐車到高鐵站。）',dating:['下次待久一點。末班車太早了。'],other:['謝謝你跑這麼遠！到臺北傳給我喔。']},
    extra:G=>{ const F=G.flags||{}, d=typeof STORY!=='undefined'&&STORY.dayOfKey?STORY.dayOfKey('2027-12-10'):null; if(F.PS_KID_SHOWN||F.dating_classmate_peishan===true||!((F.PS_TAINAN_VISITS|0)>=1)||d==null||G.day<d) return [];
      F.PS_KID_SHOWN=true; return [{narr:'（一張孩子的作業，最上面寫著：老師我長大要當法官）'},'我回他：那你要先學會寫字。']; } }
};
