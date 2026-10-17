/* 假期活動（VAC；AA_199 第 3 節活動卡、7-2／7-4／7-5；任務 HOLIDAY-SYS／VAC-C08-12）——資料表。流程在 src/vac3d.js。
   **台詞照 AA 定稿照抄，這裡不改字、不自己寫**：大一暑假 AA_241（企劃線 claude/magical-albattani-bk7b4n）。
   每一張活動卡：
     id、title、cat（類別）、season（summer／winter）、
     year：只有某一年（例：C05 阿凱那一團＝Y1，之後是 C13 出國旅遊）；沒寫＝每個同季的假期都開（AA_199 7-5 第 1 點），日期用 days（月-日）照那一年換；
     days：起訖（'MM-DD'）、wd（每週固定的星期，0＝日）、slot（am／pm／eve／day／night）、place（{kind:'taipei'|'domestic'|'abroad', name}）、
     cost（{payer:'family'|'self'|'none'}）、free（期間能不能自由操作：yes／partial／no）、
     signup：怎麼報名（phone＝手機邀約、ask 的選項；until＝最後報名日 'MM-DD'）、
     keys：關鍵事件 [{day:'MM-DD', h, place, bg, lines:[…], choice}]（其他日子寫進日誌）、
     trip：連續好幾天人不在（整段當一趟出遊：出發 → 中間的關鍵事件 → 回來）、
     miss：沒參加的那一則（時間、誰、訊息）。
   行的寫法同 termend_lines.js：字串＝說話的人；{narr:'（…）'}＝旁白；{who, text}＝別人說；choice＝[{t, say:[行…], set:{旗標}, rel:{id:{…}}}]。 */
const VAC_DATA=(function(){
  const Y=G=>G&&G.flags||{};
  const A={
    /* VAC-C02 法律生活營隊輔（系學會高中生營隊，虛構名稱）：AA_241 第 1 節。每年 7/1～7/5（大二起可以當小隊長，台詞下一批）*/
    C02:{ id:'C02', title:'法律生活營隊輔', cat:'社團志工', season:'summer', days:['07-01','07-05'], slot:'night', place:{kind:'taipei',name:'校內'}, cost:{payer:'none'}, free:'partial',
      signup:{kind:'group', th:'g:law_class', term:'S2', week:12, wd:1, h:21, until:{term:'S2',week:13,wd:0}, flag:'CAMP_Y1_STAFF',
        msgs:[{from:'sysclub',name:'系學會',text:'【法律生活營 隊輔招募】7/1～7/5，高中生營隊，五天四夜，在校內。籌備會第 13～15 週週三晚上。有興趣的填表單。'},{from:'classmate_xinci',text:'我報了'},{from:'classmate_xinci',text:'有人要一起嗎'},{from:'classmate_peishan',text:'我也報了'}],
        yes:{t:'我也報。',say:[{from:'classmate_xinci',text:'好，我記下來'}]} },
      prep:{ term:'S2', week:14, wd:3, h:19, place:'萬才館研討室', bg:'classroom_small', who:'classmate_xinci',
        lines:[{narr:'（研討室的白板上貼了一張流程表。五天，每一格一個顏色。）'},{who:'classmate_xinci',text:'綠色是課程，橘色是活動，灰色是吃飯和睡覺。'},{who:'classmate_peishan',text:'紅色呢？'},{who:'classmate_xinci',text:'可能會出事的時間。'},{who:'classmate_peishan',text:'……為什麼有這麼多紅色。'},{who:'classmate_xinci',text:'因為是高中生。'}],
        choice:[{t:'「我負責哪一格？」',say:[{who:'classmate_xinci',text:'第二天下午，案例討論。你帶一組。'}]},
                {t:'「紅色那幾格我可以幫忙。」',say:[{who:'classmate_xinci',text:'好。'},{narr:'（她把你的名字寫進紅色那一格。）'},{who:'classmate_xinci',text:'寫上去了，不能改。'}],rel:{classmate_xinci:{trust:2}}}] },
      trip:{ start:{day:'07-01',h:8.5}, end:{day:'07-05',h:17}, placeName:'營隊（校內）', home:'dorm' },
      keys:[
        {day:'07-01',h:9,title:'第一天：報到',bg:'camp_school',lines:[{narr:'（報到處排了一整排高中生。有人拖著行李箱，有人只背一個書包。）'},{who:'classmate_peishan',text:'那個女生從進來到現在都沒講話。'},{who:'classmate_peishan',text:'……我去跟她說一下哪裡可以充電。'},{narr:'（她走過去，蹲在那個女生的行李箱旁邊。）'}]},
        {day:'07-03',h:20,title:'晚會',bg:'camp_school',lines:[{narr:'（小隊表演完，學員圍在操場邊吃點心。你那一組的一個男生走過來。）'},{who:'npc_camper',name:'學員',text:'學長，法律系很難嗎？'}],
          choice:[{t:'「很難，可是很好玩。」',say:[{who:'npc_camper',name:'學員',text:'好玩在哪？'},{narr:'（你想了一下。）'},{who:'npc_camper',name:'學員',text:'學長你想太久了。'},{narr:'（他笑著跑回去。）'}]},
                  {t:'「我也還在想。」',say:[{who:'npc_camper',name:'學員',text:'……學長你大一喔？'},{who:'player',text:'對。'},{who:'npc_camper',name:'學員',text:'那我比較不怕了。'}]}]},
        {day:'07-05',h:15,title:'最後一天',bg:'camp_school',lines:[{narr:'（學員寫卡片給隊輔。你那一疊最上面那張寫著：「謝謝學長第二天下午沒有放棄我們這組。」）'},{who:'classmate_xinci',text:'（把流程表從白板上撕下來，摺好）紅色的那幾格，最後都沒出事。'},{who:'classmate_xinci',text:'下次可以少塗一點。'},
          {who:'classmate_peishan',text:G=>Y(G).PS_ODD_Q_Y1S2?'欸，問你一件事。':'我可以問一個奇怪的問題嗎？'},{who:'classmate_peishan',text:'你覺得他們五天以後，會記得什麼？'}],   /* 沛珊「我可以問一個奇怪的問題嗎」大一下的額度用過＝「欸，問你一件事。」（AA_188 2-6）*/
          choice:[{t:'「記得認識了誰。」',say:[{who:'classmate_peishan',text:'……嗯。我也是這樣覺得。'}],set:{PS_CAMP_REMEMBER:true}},
                  {t:'「記得案例討論那組吵贏了。」',say:[{who:'classmate_peishan',text:'（笑）那一組真的很想贏。'}]}]} ],
      miss:{day:'07-05',h:21,who:'classmate_xinci',min:'ACQUAINTANCE',msgs:['營隊結束了','📷（操場上一排高中生和隊輔，比著不同的手勢）','少一個人排班。下次來喔']} },
    /* VAC-C03 日語課（以安也在上）：AA_241 第 2 節。7/7～7/23 週二、四 19:00～21:00，公館的語言中心（虛構）；三個關鍵事件，其他堂寫進日誌 */
    C03:{ id:'C03', title:'日語課（暑期密集班）', cat:'學習考試', season:'summer', days:['07-07','07-23'], wd:[2,4], slot:'eve', place:{kind:'taipei',name:'公館的語言中心'}, cost:{payer:'family'}, free:'yes',
      signup:{kind:'dm', who:'heroine_01', min:'FAMILIAR', day:'06-20', h:21, until:'06-26', flag:'VAC_C03',
        msgs:['我暑假要上日語課，公館那間，週二四晚上','三個禮拜，在我回台中以前上完','你如果也想學，報名到這個禮拜五'], yes:{t:'我也報。',say:[]}, board:true },   /* 不熟的玩家：公館語言中心的公告欄（行事曆）照樣報得到 */
      keys:[
        {day:'07-07',h:19,title:'第一堂',bg:'classroom_small',lines:[{narr:'（教室很小，十二個位子。以安坐在第一排正中間，筆記本已經畫好格子。）'},{who:'heroine_01',text:'你也來了。'},{who:'heroine_01',text:'老師說第一堂要自我介紹，用日文。'}],
          choice:[{t:'「我只會說名字。」',say:[{who:'heroine_01',text:'我也只會說名字跟學校。……還有『請多指教』。'}]},{t:'「妳準備好了？」',say:[{who:'heroine_01',text:'寫在筆記本上了。……不要看。'}]}]},
        {day:'07-16',h:19,title:'小考',bg:'classroom_small',lines:[{who:'heroine_01',text:'九十二。片假名寫錯一個。'},{who:'heroine_01',text:'ツ跟シ。我每次都分不清楚。'}],
          choice:[{t:'「那兩個真的很像。」',say:[{who:'heroine_01',text:'很像不是理由。'},{narr:'（她在筆記本上把兩個字各寫了十遍。）'}]},{t:'「我錯了五個。」',say:[{who:'heroine_01',text:'……那下課一起練。十分鐘。'}],rel:{heroine_01:{fam:2}}}]},
        {day:'07-23',h:19,title:'最後一堂',bg:'classroom_small',lines:[{who:'heroine_01',text:'下禮拜我回台中，8 號回來。'},{who:'heroine_01',text:'日文我會繼續背。'}],
          choice:[{t:'「好，我也背。」',say:[{who:'heroine_01',text:'說好了。'}]},{t:'「回來要考我嗎？」',say:[{who:'heroine_01',text:'考第三課的單字。你上次沒背完。'}]}]} ] },
    /* VAC-C05 日本五天（阿凱那一團）：AA_241 第 3 節。只有大一暑假（之後是 C13 出國旅遊）；機票家裡出、當地自己出 */
    C05:{ id:'C05', title:'日本五天（阿凱那一團）', cat:'海外交流', season:'summer', year:'Y1', days:['08-24','08-28'], slot:'night', place:{kind:'abroad',name:'日本',tz:1}, cost:{payer:'family',local:'self'}, free:'partial',
      signup:{kind:'dm', who:'kai', day:'07-15', h:21, until:'07-19', flag:'VAC_C05',
        msgs:['8/24 要不要去日本','我跟兩個同學 去秋葉原','機票我看過了 現在買還好'],
        yes:{t:'去。',say:[{from:'kai',text:'好 我拉你進群'}],family:'機票多少？我轉給你。'},
        later:{t:'我問一下家裡。',say:[{from:'kai',text:'好 這禮拜內跟我說'}]},
        no:{t:'這次不行。',say:[{from:'kai',text:'OK 我帶伴手禮'}]} },
      trip:{ start:{day:'08-24',h:6}, end:{day:'08-28',h:18}, placeName:'日本', travel:'機場', home:'auto' },
      keys:[
        {day:'08-24',h:6,title:'出發',bg:null,lines:[{narr:'（早上六點的機場。阿凱的背包比行李箱還大。）'},{who:'kai',text:'裡面是空的。回來會滿。'}]},
        {day:'08-25',h:14,title:'秋葉原',bg:'jp_street_night',lines:[{narr:'（二手遊戲店的樓梯很窄。一層一層往上，每一層賣的東西都比下面那層舊。）'},{who:'kai',text:'（在玻璃櫃前面停下來）這台。'},{who:'kai',text:'我國小的時候想要。我媽說考第一名才買。'},{who:'kai',text:'我沒考第一名。'}],
          choice:[{t:'「現在買給自己。」',say:[{who:'kai',text:'……對。'},{narr:'（他把店員叫過來。）'}]},{t:'「多少錢？」',say:[{who:'kai',text:'（看了一下標籤）……我再想一下。走到下一層再決定。'},{narr:'（走到下一層，他又走回來了。）'}]}],
          after:[{narr:'（之後他的背包裡多了一個盒子。）'}]},
        {day:'08-26',h:12,title:'中間一天',bg:null,lines:[{narr:'（便利商店的飯糰有二十幾種。阿凱每一種都拍了照。）'},{who:'kai',text:'回去給我室友看。'},{who:'kai',text:'……喔，你就是我室友。'}]},
        {day:'08-27',h:20,title:'最後一晚',bg:'jp_street_night',lines:[{who:'kai',text:'下次換你排行程。我排的都是店。'}],
          choice:[{t:'「好，我排。」',say:[{who:'kai',text:'不要排博物館。'}]},{t:'「下次叫阿哲一起。」',say:[{who:'kai',text:'他會一直問哪裡可以吃。……好啊。'}]}]} ],
      back:{day:'08-28',group:[{from:'zhe',text:'伴手禮咧'}]},
      miss:{day:'08-28',h:21,who:'kai',msgs:['📷（秋葉原的街，招牌一層一層疊上去）','買到了']} } };
  /* 大一暑假的訊息（AA_241 第 4、6、7 節）：VA-05 小語的營隊、VA-02 返鄉回臺北、VA-11 交往中的反應 */
  const MSGS=[
    {tag:'va05_1',day:'2026-07-06',h:21.5,th:'g:noodle_team',ms:[{from:'yu',text:'📷（山上的營地，一排帳篷）'},{from:'yu',text:'隊輔第一天 我已經沒聲音了'}]},
    {tag:'va05_2',day:'2026-07-10',h:22,th:'g:noodle_team',ms:[{from:'yu',text:'📷（白板上小朋友畫的老虎，歪歪的）'},{from:'yu',text:'這是我'},{from:'zhe',text:'很像'}]},
    {tag:'va05_3',day:'2026-07-14',h:23+10/60,th:'g:noodle_team',ms:[{from:'yu',text:'晚會我被叫上去跳舞'},{from:'yu',text:'沒有影片 不要找'}]},
    {tag:'va05_4',day:'2026-07-18',h:20,th:'g:noodle_team',ms:[{from:'yu',text:'回來了'},{from:'yu',text:'明天要睡十二個小時'}]},
    {tag:'va02_1',day:'2026-06-27',h:20,th:'g:noodle_team',ms:[{from:'classmate_bohan',text:'我回新竹了。週四在總圖四樓。'}]},
    {tag:'va02_2',day:'2026-06-30',h:22,th:'g:noodle_team',ms:[{from:'zhe',text:'明天回高雄'},{from:'zhe',text:'麵店團不能斷喔'}]},
    {tag:'va02_3',day:'2026-07-25',h:15,th:'p:heroine_01',min:['heroine_01','FAMILIAR'],ms:[{from:'heroine_01',text:'📷（高鐵窗外的田）'},{from:'heroine_01',text:'回台中了。8 號回去。'}]},
    {tag:'va02_4',day:'2026-08-08',h:21,th:'p:heroine_01',min:['heroine_01','FAMILIAR'],ms:[{from:'heroine_01',text:'回臺北了。台中好熱。'}]},
    {tag:'va02_5',day:'2026-08-21',h:19,th:'g:noodle_team',ms:[{from:'zhe',text:'我回來了'},{from:'zhe',text:'誰要吃麵'}]},
    /* VA-11 交往中的反應（以安、語彤；她也講自己在做什麼，不吃醋）*/
    {tag:'va11_camp_an',day:'2026-07-03',h:22.5,th:'p:heroine_01',dating:'heroine_01',vac:'C02',ms:[{from:'heroine_01',text:'營隊第三天了。你有睡覺嗎？'},{from:'heroine_01',text:'……我是問真的。'}]},
    {tag:'va11_camp_yt',day:'2026-07-03',h:22.5,th:'p:heroine_03',dating:'heroine_03',vac:'C02',ms:[{from:'heroine_03',text:'營隊結束來店裡'},{from:'heroine_03',text:'阿姨問你去哪了'}]},
    {tag:'va11_jp_an',day:'2026-08-24',h:8,th:'p:heroine_01',dating:'heroine_01',vac:'C05',ms:[{from:'heroine_01',text:'到了傳一張照片。一張就好。'}]},
    {tag:'va11_jp_yt',day:'2026-08-24',h:8,th:'p:heroine_03',dating:'heroine_03',vac:'C05',ms:[{from:'heroine_03',text:'不用買伴手禮'},{from:'heroine_03',text:'……好啦 買一個小的'}]},
    {tag:'va11_jpb_yt',day:'2026-08-28',h:21,th:'p:heroine_03',dating:'heroine_03',vac:'C05',ms:[{from:'heroine_03',text:'回來了嗎'},{from:'heroine_03',text:'明天店裡有開'}]},
    {tag:'va11_video_an',day:'2026-07-30',h:21.5,th:'p:heroine_01',dating:'heroine_01',ms:[{from:'heroine_01',text:'我媽在後面。……她說嗨。'},{from:'heroine_01',text:'她問你吃飽了沒。我說你一定吃了。'}]},
    {tag:'va11_exam_yt',day:'2026-06-19',h:12,th:'p:heroine_03',dating:'heroine_03',ms:[{from:'heroine_03',text:'考完了'},{from:'heroine_03',text:'憲法最後一題我寫不完'},{from:'heroine_03',text:'……不要問我分數 7/3 才知道'}]},
    {tag:'va11_idle_an',day:'2026-07-31',h:21,th:'p:heroine_01',dating:'heroine_01',idle:true,ms:[{from:'heroine_01',text:'你這個暑假在做什麼？'},{from:'heroine_01',text:'我不是在檢查。我在想要不要排一天一起去哪裡。'}]},
    {tag:'va11_idle_yt',day:'2026-07-31',h:21,th:'p:heroine_03',dating:'heroine_03',idle:true,ms:[{from:'heroine_03',text:'你暑假是不是很閒'},{from:'heroine_03',text:'那明天下午陪我去進貨'}]} ];
  return {A,MSGS,src:'AA_241（企劃線 c524b61e 以前的版本；第 1～7 節）'};
})();
