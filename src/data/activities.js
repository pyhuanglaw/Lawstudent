/* 活動與演講（D55；設計：docs/campus/PUBLIC_BUILDINGS_DESIGN.md 第 5 節）。
   **內容由 AA、BB 提供**（使用者 2026-10-13：「尚未確認的演講故事」不能先做）——遊戲裡先是空的清單；系統用 tests/activities_unit.js 的測試資料驗證。
   一筆活動：
     { id, title, kind:'lecture'|'club'|'exam'|…, zone, room, term:[學期代號…], weeks:[第幾週…] 或 dates:['2025-10-21',…], weekday:1–5（週一＝1）,
       t0, t1（小時，例如 18.5＝18:30）, poster:{ daysBefore, text }, crowd:{ n }, story:false }
   story:true（牽涉人物劇情）的活動要使用者批准才放。
   用到的地方：公告欄（看公告：今天、這幾天的活動）、手機「今天」、條件事件的 activity／attended／missed 條件（src/events3d.js）、大教室的人流（坐到指定人數）、
   坐下時的「聽演講」（src/game3d.js 的 seatMenu → classes3d.js 的 attendActivity，記下到場）。 */
const ACTIVITIES={
  /* AA_110 第 6-3 節的活動清單（AA 暫定，全部 story:false；2026-10-13）＋6-8 節（AA 回答 LAWWW 的四個問題，【暫定】）：吉他社、法服讀書會、社團博覽會、系籃。
     desc＝AA 表上的「內容」（手機、公告欄上的說明）。spot：沒有座位的活動在這一點集合（classes3d.js 的 addActSpots）；once：去一次就好（任何一場聽過，其他場不再列）。
     door：在不能進去的房間門口參加（萬才館的多功能教室、研討室 A：classes3d.js 的 roomDoor，2D 畫面）；weekdays：一週好幾天（吉他社週一、三）；verb：參加的說法（系籃「去練球」）。
     rain：下雨的備案 {zone, roomName, spot, hint, narr}（系籃下雨改到新體育館一樓走廊，BBALL-RAIN-1030）——照那天 t0 的天氣一次定整場（ACTIVITIES.rainy），下雨場的集合點在 rain.spot、原本的集合點只剩 hint、旁白固定用 narr[rain.narr]。
     narr：社課的旁白（6-8 (d)，台詞【虛構】）——同一學期每句最多一次、照順序，用完以後只顯示「社課結束了。」；不提有名字的人物。narrAt:'start'＝在快轉前播（法服：旁白＋題庫兩三題）。
     人物事件（6-8 (a)）：同一場社課只播一個——吉他社：還沒認識子晴的第一次社課自動播 ev_ziqing_club 的初遇；法服：第一次播 ev_studygroup_wed 整段，之後旁白＋題庫（classes3d.js 的 clubEvent）。
     clubs：博覽會的五個社團（選了就加入：CLUB_<id>）；clubName：攤位上的社團名稱。 */
  list:[
    {id:'lib_tour_y1s1',title:'總圖新生導覽',kind:'tour',zone:'library_hall',roomName:'總圖大廳',spot:{x:-3.0,z:2.8,lv:0,label:'新生導覽集合點'},dates:['2025-09-19','2025-09-23','2025-09-25','2025-09-26'],datesW1:['2025-09-08','2025-09-10','2025-09-12','2025-09-16'],t0:15.5,t1:16+20/60,once:true,
     desc:'館員帶看閱覽室、借還書、自習座位。去一次就好。',story:false},
    {id:'lawlib_intro_y1s1',title:'法律資料怎麼查',kind:'lecture',zone:'lawlib',room:'discA',roomName:'法律學院圖書館 討論室 A',dates:['2025-09-24','2025-10-01'],t0:15.5,t1:16.5,once:true,
     desc:'法規要查最新版、判決怎麼找、指定參考書放哪裡（只講方法）。',story:false},
    {id:'club_debate',title:'辯論社社課',clubName:'辯論社',kind:'club',zone:'boya',room:'201',roomName:'博思 201',term:['Y1S1'],weeks:[5,6,7,10,11,12,13,14,15],weekday:2,t0:19,t1:21,crowd:{n:8},
     desc:'正反方練習、計時；題目用生活題（例：「大學該不該點名」）。',story:false,
     narr:['（正反方練習、計時。今天的題目：大學該不該點名。）','（今天的題目：外送該不該進校園。三分鐘申論，一分鐘質詢。）','（今天的題目：考試該不該開書。學長示範怎麼在一分鐘內反駁。）',
           '（今天練即席：抽紙條上台。你抽到「早八應該取消」。）','（今天的題目：社課該不該點名。台下笑了半分鐘才開始計時。）','（今天的題目：圖書館該不該二十四小時開放。正方贏了，大家都說反方比較好笑。）']},
    {id:'club_hiking',title:'登山社行前會',clubName:'登山社',kind:'club',zone:'putong',room:'201',roomName:'普通 201',term:['Y1S1'],weeks:[5,6,7,10,11,12,13,14,15],weekday:4,t0:19.5,t1:21,crowd:{n:8},
     desc:'裝備、天氣、路線。出隊是週末的另一個活動，之後再排。',story:false,
     narr:['（今天講裝備：三層穿法、頭燈、雨衣。學長把一個背包裡的東西全倒在桌上。）','（今天看天氣圖：鋒面、午後雷陣雨、什麼時候該撤退。）','（今天講路線：等高線怎麼看，哪裡是陡上。）',
           '（今天練打結。看起來很簡單，你綁錯了兩次。）','（下一次出隊的名單貼出來了。社長說：報名前，先問問自己的腳。）']},
    /* 6-8：吉他社（萬才館一樓多功能教室；企劃寫萬才館旁的社辦，遊戲還沒有社辦）、法服讀書會（萬才館二樓研討室 A）——門口參加。週三晚上兩個只能選一個：走到哪一間的門口就是哪一個 */
    {id:'club_guitar',title:'吉他社社課',clubName:'吉他社',kind:'club',zone:'wancai',room:'multi',door:true,roomName:'法律系館B 多功能教室',term:['Y1S1','Y1S2','Y2S1','Y2S2'],weeks:[5,6,7,10,11,12,13,14,15],termWeeks:{Y2S1:[3,4,5,6,7,10,11,12,13,14,15]},weekdays:[1,3],t0:19,t1:21,
     desc:'練和弦、輪流彈一首。',story:false,
     narr:['（今天練 C、G、Am 三個和弦。換和弦的時候，整間教室都慢了半拍。）','（今天輪流彈一首。你彈錯了第二小節，大家笑得比你大聲。）','（有人帶了洋芋片。練習的時間，比吃東西的時間短一點。）',
           '（今天練刷法：下、下、上、上、下、上。你的右手比左手聽話。）','（學長示範一首老歌。大家安靜聽完，然後各自練回自己的和弦。）','（手指上的紅痕沒那麼痛了。你多撐了兩首歌。）']},
    /* 大一下也有（交接包 v2：第 4 週讀書會結束後的沛珊和柏翰、第 14 週和成發同一晚、第 15 週「最後幾次」）；大一下的週次原文沒寫，先排第 2～7、10～16 週（期中、期末沒有；已問 AA）*/
    /* 2026-10-17 停用（使用者 AA_218 17-4：法服沒有讀書會也沒有社課；AA_236 A1、BB_191 §7）：skip＝不再開；id 留著——博覽會選單的「法服」＝報名（ev_sis_club_expo）、舊存檔的出席紀錄 lawclub_study@<天> 照讀 */
    {id:'lawclub_study',title:'法服讀書會',clubName:'法服（法律服務社）',whenText:'隔週週六上午，法律系館B一樓（法律服務）'/* AA_372 第 1 項（企劃線 da456892）：博覽會選單的小字、填表後那句——原本拿停用的週三讀書會時間「每週三 19:00–21:00，萬才館 研討室 A（第 5 週起）」*/,kind:'club',skip:()=>true,zone:'wancai',room:'seminarA',door:true,roomName:'法律系館B 研討室 A',term:['Y1S1','Y1S2','Y2S1','Y2S2'],weeks:[5,6,7,10,11,12,13,14,15],termWeeks:{Y1S2:[2,3,4,5,6,7,10,11,12,13,14,15],Y2S1:[1,2,3,4,5,6,7,10,11,12,13,14,15],Y2S2:[1,2,3,4,5,6,7,10,11,12,13,14,15]},weekday:3,t0:19,t1:21,
     desc:'刑訴題庫每次兩三題（讀書會的方式：先聽爭點怎麼吵）。',story:false,narrAt:'start',
     narr:['（白板上寫著今天的兩個爭點。大家先安靜讀五分鐘。）','（今天的題目是學長姊從題庫裡挑的。一年級坐後面，先聽。）','（研討室的冷氣很強。有人把外套借給隔壁，然後開始吵第一題。）',
           '（今天來的人比上週少兩個。題目反而讀得比較深。）','（結束前，每個人把今天的爭點用一句話寫在白板上。）']},
    /* 6-8 (b)：社團博覽會——椰林大道上的公告欄（zones3d.js，傅鐘廣場東側、法服招生攤位旁邊）；LAWWW2 的攤位做好以後原地換掉，位置不變 */
    /* CLUBFAIR-REAL-1027（AA_485 第 3-2 節，AA-C 定稿；使用者 10-27「社團博覽會要參考實際的吧」）：照實際的臺大社團聯展——開學第一週的週六，一天，10:00～16:00（2025 年是 9/6）。
       datesOld：還沒有「開學改 9/1」的舊局（9/17 才開始，9/6 已經過了）照舊 9/30、10/1，舊存檔不會一個社博都沒有。攤位、舞台、喊話、提示在 src/clubfair3d.js、src/data/club_fair.js */
    {id:'club_expo_y1s1',title:'社團博覽會',kind:'fair',zone:'campus',roomName:'椰影大道',spot:{x:-20.8,z:2.9,lv:0,label:'社團博覽會',r:1.3},   /* spot＝服務台的帳篷前（LAWWW2 36 頂的 info，CLUBFAIR-REAL-1027；原本傅鐘旁 (-13.5,13.6)）*/
     dates:['2025-09-06'],datesOld:['2025-09-30','2025-10-01'],t0:10,t1:16,poster:{daysBefore:5},
     clubs:['club_guitar','lawclub_study','club_debate','club_hiking','dept_basketball'],
     desc:'一百多個社團擺攤，中午有舞台表演。能加入的有五個：法服、吉他社、辯論社、登山社、系籃。走到攤位前面就能填表。'   /* AA_491 第 2 點：玩家畫面不要出現「＝」 */,story:false},   /* 第一句照 AA_485 3-5 公告欄；「可以參加的社團到底是什麼」（使用者 10-27）：寫出能加入的五個 */
    /* 交接包 v1 A11（AA_71 2-1、BB_95 3-3）：法律系迎新——開學前（8/31 上午，AA_310；使用者 2026-10-20「迎新在9/27不合理阿 應該在開學前」）；有宿營的局不辦（大一的迎新就是 8/22～24 宿營）。傅鐘前集合（和社團博覽會同一點，日期不同）；
       參加＝演 ev_welcome_y1s1（自我介紹、大地遊戲和沛珊同一組），演完快轉到結束。event：參加時演的事件（classes3d.js 的 attendActivity）；去一次就好 */
    {id:'welcome_y1s1',title:'法律系迎新',kind:'event',zone:'campus',roomName:'晨思鐘前',spot:{x:-13.5,z:13.6,lv:0,label:'迎新集合點',r:1.3},dates:['2025-08-31'],t0:9.5,t1:12,once:true,event:'ev_welcome_y1s1',skip:G=>!!(G.flags&&G.flags.CAMP_Y1),   /* 開學前宿營演過的局（新遊戲、AA_205 6-13 第 6 項）不辦；只留給沒有宿營的局（開發起點直接跳 8/29）防呆——下午 14:00 是開學典禮（S.ceremonyY1），中間有午餐時間 */
     desc:'開學典禮前的上午，系學會在晨思鐘前辦的新生迎新：自我介紹、分組玩大地遊戲。學長姊帶隊。',story:true},
    /* 6-8 (c)：系籃——2026-10-14 搬到球場（LAWWW2 9428f9f，醉月湖東側；zones3d.js 的 bballCourt）：活動點在場邊兩張長椅中間、面向場內；id 不變（原本先放在體育館門口）*/
    /* 公法讀書會（交接包 v2 C14 以安新 7 後半）：每週四 20:00～21:30，萬才館研討室 A；第一次＝ev_public_law_group。
       2026-10-17 改到大一上第 10 週開始（AA_218 17-4 使用者批准；BB_191 §8-1、8-6）：大一上 10～16 週；大一下 2～7、10、12～16 週（第 11 週週四以安在博雅 B4 講座，停一次）；大二下加第 1 週（沛珊交接 P4，§8-7）*/
    {id:'public_law_group',title:'公法讀書會',clubName:'公法讀書會',kind:'club',zone:'wancai',room:'seminarA',door:true,roomName:'法律系館B 研討室 A',term:['Y1S1','Y1S2','Y2S1','Y2S2','Y3S1','Y3S2','Y4S1'],weeks:[10,11,12,13,14,15],termWeeks:{Y1S2:[2,3,4,5,6,7,10,12,13,14,15],Y2S1:[2,3,4,5,6,7,10,11,12,13,14,15],Y2S2:[2,3,4,5,6,7,10,11,12,13,14,15],Y3S1:[1,2,3,4,5,6,7,10,11,12,13,14,15],Y3S2:[1,2,3,4,5,6,7,10,11,12,13,14,15],Y4S1:[1,2,3,4,5,6,7,10,11,12,13,14]},weekday:4,   /* 第 13 週 11/30 以安交棒（AA_327 2-Y4-08，src/r2y4a3d.js；AA_262 第 4 節第 6 點建議開到第 13 週，AA_327「11/30 交棒以後由學弟帶」、AA_323 1B-20 第 15 週停一次＝第 14 週照開）*/   /* 大三上也開（AA_259 第 4 節第 2 點：A5-L4、A5-L6、週四招呼講的事要看得到）；大三下整學期（第 1～15 週、期中週停；AA_377 第 3 項 AA 定：以安 3/25 走了以後 Alison 排題目——原本只開第 1～5 週，AA_260 第 4 節第 4 點）；大四上照大三上（學弟帶；AA_323 1B-19 10/19 散會、1B-20 第 15 週「這週四停一次」）*/t0:20,t1:21.5,
     desc:'以安和 Alison 發起的讀書會。每人十分鐘。',story:true},
    /* 大一的系籃比賽（交接包 v2 C16；AA_71 2-11「大一的系籃比賽（v2 C16，第 14 週）」）：AA 只寫第 14 週，日子、時間是 LAWWW 定的（週六 14～16，和練球同一個球場；已告訴 AA）；去看＝演 ev_zhe_game_y1 */
    /* 法服學期檢討會（BB_96 2-6 學姊 W5；交接包 v2）：大一下第 17 週週三 19:00–21:00，萬才館研討室 A（門口參加）；群戲用旁白，會後接 W5（afterActivity）*/
    /* 2026-10-17 停用（W5 已刪，BB_122 ★-6；BB_191 §7-1 #2）*/
    {id:'lawclub_review_y1s2',title:'法服學期檢討會',clubName:'法服',kind:'club',skip:()=>true,zone:'wancai',room:'seminarA',door:true,roomName:'法律系館B 研討室 A',term:['Y1S2'],weeks:[15],weekday:3,t0:19,t1:21,once:true,
      desc:'法服這學期的檢討會。',story:true},
    /* 吉他社成發（BB_96 4-4 子晴 Q5、AA_13 G3；交接包 v2）：大一下第 14 週週三 19:00–21:00，萬才館大廳的小舞台；和法服讀書會同一晚，走進哪一個就是哪一個 */
    {id:'guitar_show_y1s2',title:'吉他社成發',kind:'event',zone:'wancai',roomName:'法律系館B大廳',spot:{x:0,z:4.6,lv:0,label:'吉他社成發'},verb:'去看',term:['Y1S2'],weeks:[14],weekday:3,t0:19,t1:21,once:true,event:'ev_ziqing_show',
      desc:'吉他社的期末成發。',story:true},
    {id:'guitar_show_y2s2',title:'吉他社成發',kind:'event',zone:'wancai',roomName:'法律系館B大廳',spot:{x:0,z:4.6,lv:0,label:'吉他社成發'},verb:'去看',term:['Y2S2'],weeks:[14],weekday:5,t0:19,t1:21,once:true,event:'ev_ziqing_show2',   /* 子晴 Q9 第二次成發（AA_325 2-Y2-19：5/28 週五）*/
      desc:'吉他社的期末成發。',story:true},
    /* 博雅午後講座第 1 場（BB_105 4-1b、4-5；AA_115 可玩切片；交接包 v2 C13）：法律系大一下第 11 週週四 19:00～20:30，博雅 101。講者虛構；只講方向（比例原則），不給法律結論。
       id 用 'B4'：AA_115 的 attended:B4／missed:B4、BB 課表的回想（syllabus recall activity:'B4'）都用這個名字。選「聽演講」＝ev_b4_lecture；散場＝ev_b4_after；小桌子＝ev_b5_table（src/data/events.js）*/
    {id:'B4',title:'政府可以為了大家，限制一個人嗎？',kind:'lecture',zone:'boya',room:'101',roomName:'博思 101',term:['Y1S2'],weeks:[11],weekday:4,t0:19,t1:20.5,once:true,crowd:{n:30},poster:{daysBefore:7},event:'ev_b4_lecture',
      desc:'博思午後講座（每月一到兩場）。這一場的主題是法律。',story:true},
    /* 交換學生甄選說明會（主線 8 的固定節點、可以錯過；AA_177 4-2、AA_143 2-3、BB_105 B9）：大二下第 4 週週四 3/18 12:20～13:10，國際事務處辦、在博雅大教室（101）。
       坐下選「聽說明會」＝ev_exchange_expo_y2（選坐哪一區，記 EXPO_COUNTRY）；3/15 09:00 學校信箱、以安的群組那一句、沒去的 20:00 簡報照片在 story3d.js */
    {id:'EXPO_Y2',title:'交換學生甄選說明會',verb:'聽說明會',kind:'lecture',zone:'boya',room:'101',roomName:'博思 101',term:['Y2S2'],weeks:[4],weekday:4,t0:12+20/60,t1:13+10/60,once:true,crowd:{n:30},event:'ev_exchange_expo_y2',
      desc:'國際事務處辦的交換學生甄選說明會。',story:true},
    /* 2026-10-17 使用者刪除模擬法庭（AA_252）：下面三場 skip 停用。原說明：模擬法庭的小組討論（V3-D16；AA_177 4-7、AA_143 3-3）：模 2 3/11、模 3 4/1、模 4 4/15，都是週四 19:00，萬才館研討室（B：研討室 A 週四 20:00 是公法讀書會）。
       門口參加＝ev_moot_2／3／4（2D）。邀約是前一晚 21:00 以安在小組群組（story3d.js）；沒去＝那一場的準備分 +0（AA_143 3-2，不另外懲罰）*/
    {id:'moot_2',skip:()=>true,title:'模擬法庭・找資料',verb:'參加',kind:'event',zone:'wancai',room:'seminarB',door:true,roomName:'法律系館B 研討室 B',term:['Y2S2'],weeks:[3],weekday:4,t0:19,t1:21,once:true,event:'ev_moot_2',desc:'模擬法庭・賣家組的討論。',story:true},
    {id:'moot_3',skip:()=>true,title:'模擬法庭・寫書狀',verb:'參加',kind:'event',zone:'wancai',room:'seminarB',door:true,roomName:'法律系館B 研討室 B',term:['Y2S2'],weeks:[6],weekday:4,t0:19,t1:21,once:true,event:'ev_moot_3',desc:'模擬法庭・賣家組的討論。',story:true},
    {id:'moot_4',skip:()=>true,title:'模擬法庭・演練',verb:'參加',kind:'event',zone:'wancai',room:'seminarB',door:true,roomName:'法律系館B 研討室 B',term:['Y2S2'],weeks:[8],weekday:4,t0:19,t1:21,once:true,event:'ev_moot_4',desc:'學姊當法官的演練。',story:true},
    {id:'dept_ball_game_y1s2',title:'系籃比賽',kind:'event',zone:'campus',roomName:'籃球場（映月湖東側）',spot:{x:3.3,z:-112.7,lv:0,label:'系籃比賽'},verb:'去看',term:['Y1S2'],weeks:[14],weekday:6,t0:14,t1:16,once:true,event:'ev_zhe_game_y1',
     desc:'系上的系籃比賽，阿哲上場。觀眾可以拍手、記分或送水。',story:true},
    /* rain：下雨的週五改到新體育館一樓走廊（BBALL-RAIN-1030，AA 劇情總監 10-30 05:40 定案；回使用者 X142「系籃練球時間到 根本球場空的」的後續）——
       照遊戲那天 17:30 的天氣一次定整場（ACTIVITIES.rainy；雨停不算）。下雨場：球場沒有人、路人也不打球（crowd3d.js S.bballSpot），球場的集合點只剩 hint（系統字，AA 原句）；
       阿哲、明軒 17:30～19:00 在體育館大廳靠球場那一面的走道（characters.js 下雨那一筆）；參加點在那裡（classes3d.js addActSpots），旁白固定用 narr 第 4 句（narr:3＝走廊練運球那句）。
       roomName：手機「活動」那一場寫哪裡（game3d.js eventsHTML）。spot 在大廳西段（西邊開口和中間閘門之間、公告欄前面）*/
    {id:'dept_basketball',title:'系籃練球',clubName:'系籃（系學會）',kind:'club',zone:'campus',roomName:'籃球場（映月湖東側）',spot:{x:3.3,z:-112.7,lv:0,label:'系籃練球'},verb:'去練球',term:['Y1S1'],weeks:[5,6,7,10,11,12,13,14,15],weekday:5,t0:17.5,t1:19,
     rain:{zone:'gym',roomName:'新體育館一樓走廊',spot:{x:-5.1,z:13.8,lv:0,label:'系籃練球'},hint:'下雨，系籃今天在新體育館走廊練體能。',narr:3},
     desc:'投籃、分隊打半場；也可以在場邊記分、送水。',story:false,
     narr:['（投籃練習，每人二十球。進幾球沒有人在算——除了學長。）','（分隊打半場。你在場邊記分，記錯一次，被兩隊同時糾正。）','（今天練防守腳步。十分鐘後，大家的腿都在發抖。）',
           '（今天在體育館走廊練運球。球聲在走廊裡很大聲。）','（練完，大家坐在場邊喝水。有人說民總的作業還沒寫，全場安靜了一下。）']}
  ],
  /* once 的活動：任何一場聽過（或中途離開）就算去過了 */
  onceDone(G,a){ if(!(a&&a.once)) return false; const A=(G&&G.acts&&G.acts.att)||{}, p=a.id+'@';
    for(const k in A){ if(!k.startsWith(p)||!A[k]) continue; if(A[k].end==='in'&&k===p+G.day) continue; return true; } return false; },   /* 今天這一場「正坐在裡面」（end:'in'）不算去過：開始以後才進去坐下，actTrack 先記 in，選單還要有「聽演講」（BUG-ACT-ONCE-LATE-1024，BB-B 10-24：EXPO_Y2 12:26 坐下沒有選項）*/
  /* 這個區域今天有集合點的活動 */
  spotsIn(G,zone){ return ACTIVITIES.list.filter(a=>a.spot&&a.zone===zone&&ACTIVITIES.on(a,G.day,G)); },
  /* 下雨的備案（a.rain：系籃練球下雨的週五改到新體育館一樓走廊，BBALL-RAIN-1030）：今天這一場是不是下雨場。
     照那天開始時間（t0＝17:30）的天氣一次定整場：t0 以後第一次問的時候記下 G.weather（rain、typhoon＝下雨），之後整場照記的——中途雨停、中途下雨都不改。
     t0 以前還沒定：先照現在的天氣回答（集合點、手機寫哪裡），不記；lock＝現在就定（開始前 15 分鐘起就能參加：參加的那一刻照當下的天氣定，classes3d.js attendActivity）。
     存檔：G.acts.wx[活動 id]＝{day, rain}（只留最近一場）。舊存檔沒有＝第一次問的時候照當下的天氣記。今天沒有這一場、沒有 rain 的活動＝false */
  rainy(a,G,lock){ if(typeof a==='string') a=ACTIVITIES.list.find(q=>q.id===a); if(!a||!a.rain||!G||!ACTIVITIES.on(a,G.day,G)) return false;
    const r=G.acts&&G.acts.wx&&G.acts.wx[a.id]; if(r&&r.day===G.day) return !!r.rain;
    const now=G.weather==='rain'||G.weather==='typhoon'; if(!(G.hour>=a.t0)&&!lock) return now;
    const A=ACTIVITIES.rec(G); if(!A.wx||typeof A.wx!=='object') A.wx={}; A.wx[a.id]={day:G.day,rain:now}; return now; },
  /* 每一格（classes3d.js 的 tick）：t0 一到就定——玩家不在球場、也不在體育館，也照 17:30 的天氣記（之後才走過去，看到的是 17:30 定的那一場）*/
  rainLock(G){ if(!G) return; for(const a of ACTIVITIES.list) if(a.rain&&G.hour>=a.t0) ACTIVITIES.rainy(a,G); },
  /* 今天這一場在哪裡：下雨場換成 a.rain 的區域、地點名稱、集合點 */
  placeOf(a,G){ return a&&a.rain&&ACTIVITIES.rainy(a,G)?{zone:a.rain.zone,roomName:a.rain.roomName,spot:a.rain.spot}:{zone:a&&a.zone,roomName:a&&a.roomName,spot:a&&a.spot}; },
  /* 現在可以參加（開始前 15 分鐘起、過了一半以前；今天這一場聽過的、once 已經去過的不列）*/
  canJoin(G,a){ const h=G.hour%24; return !!a&&ACTIVITIES.on(a,G.day,G)&&h>=a.t0-0.25&&h<(a.t0+a.t1)/2&&!ACTIVITIES.attended(G,a.id,G.day)&&!ACTIVITIES.onceDone(G,a); },
  /* 第 day 天有沒有這個活動（學期、週次或日期、星期都對得上）*/
  on(a,day,G){ if(typeof CALENDAR==='undefined') return false; if(a.skip&&a.skip(G||{flags:{}})) return false; const d=CALENDAR.dateOf(day);   /* skip：這一局不辦（例：有宿營的局不排舊的 9/27 迎新，CAMP-L1）；沒給 G 的呼叫也照 skip 判斷（法服讀書會停用＝()=>true）*/
    const w1=G&&typeof STORY!=='undefined'&&STORY.week1Start?!!STORY.week1Start(G):null; const ds=a.datesW1&&w1?a.datesW1:(a.datesOld&&w1===false?a.datesOld:a.dates);   /* datesW1：開學改 9/1 的局（START-WEEK 選 1）用另一組日期；舊局照 dates（AA_195 4-7 A12）。datesOld：反過來——dates 是新局的、舊局照 datesOld（社團博覽會，CLUBFAIR-REAL-1027）*/
    if(ds) return ds.includes(d.key);
    if(CALENDAR.holiday(day)&&!a.holidays) return false;   /* 照學期、週次、星期排的活動：放假那天不辦（2026-10-13 審查；真的要在假日辦的寫 holidays:true 或用 dates）*/
    if(a.weekday&&d.wd!==a.weekday) return false; if(a.weekdays&&!a.weekdays.includes(d.wd)) return false; const t=CALENDAR.termOf(day); if(a.term&&(!t||!a.term.includes(t.id))) return false; const wks=(a.termWeeks&&t&&a.termWeeks[t.id])||a.weeks; if(wks&&(!t||!wks.includes(t.week))) return false; return !!(a.term||a.weeks||a.weekday||a.weekdays); },   /* termWeeks：不同學期的週次不一樣（法服讀書會大一下第 2 週起）*/
  /* 活動的時段（AA_110 第 5 節）：'before'（今天還沒開始）／'during'（進行中）／'justEnded'（結束後 20 分鐘內：「散場後的走廊」）／'after'（更晚）；今天沒有這個活動＝null */
  phaseOf(G,id){ const a=ACTIVITIES.list.find(q=>q.id===id); if(!a||!ACTIVITIES.on(a,G.day,G)) return null; const h=G.hour%24; return h<a.t0?'before':(h<a.t1?'during':(h<a.t1+1/3?'justEnded':'after')); },
  /* 現在進行中（before：開始前幾小時也算，給人流用）；justEnded：**只算結束後 20 分鐘內**（2026-10-13 ChatGPT 審查：原本從開始一直算到結束後 20 分鐘，演講進行中也會觸發「散場後」的事件）*/
  active(G,opt){ opt=opt||{}; const h=G.hour%24; return ACTIVITIES.list.filter(a=>ACTIVITIES.on(a,G.day,G)&&(opt.justEnded?(h>=a.t1&&h<a.t1+1/3):(h>=a.t0-(opt.before||0)&&h<a.t1))); },
  isActive(G,id,opt){ return ACTIVITIES.active(G,opt).some(a=>a.id===id); },
  /* 公告欄、手機：今天起 n 天內的活動（照海報貼出的天數）*/
  upcoming(G,n){ const out=[]; for(let k=0;k<(n||7);k++){ for(const a of ACTIVITIES.list){ if(!ACTIVITIES.on(a,G.day+k,G)||ACTIVITIES.onceDone(G,a)) continue; const pd=(a.poster&&a.poster.daysBefore!=null)?a.poster.daysBefore:3; if(k>pd) continue; if(k===0&&G.hour%24>=a.t1) continue; out.push({a,k}); } } return out; },
  hhmm(h){ const m=Math.round(h*60); return String(Math.floor(m/60)%24).padStart(2,'0')+':'+String(m%60).padStart(2,'0'); },
  /* 到場紀錄（AA_107 第 10-1 節第 5 項：沒去演講，就不能觸發聽完才合理的後續）：G.acts.att['活動id@第幾天']={h:坐下來聽的時間}。
     玩家坐在活動的那一間、選「聽演講」才算到場（src/classes3d.js 的 attendActivity）；只是路過、站在門口不算。
     條件事件用 prereq.attended（聽過任何一場）／notAttended（一場都沒聽過）／missed（最近結束的那一場沒去）——src/events3d.js。舊存檔沒有 G.acts：第一次用到時補上。 */
  rec(G){ if(!G.acts||typeof G.acts!=='object') G.acts={}; if(!G.acts.att||typeof G.acts.att!=='object') G.acts.att={}; return G.acts; },
  /* 出席三態（AA_110 5-2，要能存檔）：紀錄 {h:坐下的時間, end:'full'|'left'|'in', lh:離開的時間}——
     full＝聽完（選「聽演講」，或坐下以後一直待在那一間到結束）；left＝中途離開（坐下了、結束前走出那一間或快速前往別處）＝partial；
     in＝現在坐在那一間、還沒結束（查詢時算 partial）。舊存檔只有 {h}（以前只有「聽演講」才記）＝full。沒有紀錄＝沒去（missed，照 lastEnded 算）*/
  stateOf(G,id,day){ const A=(G.acts&&G.acts.att)||{}; const st=r=>!r?null:((r.end||'full')==='full'?'full':'partial');
    if(day!=null) return st(A[id+'@'+day]); const p=id+'@'; let best=null; for(const k in A) if(k.startsWith(p)){ const s=st(A[k]); if(s==='full') return 'full'; if(s) best=s; } return best; },
  attended(G,id,day){ return ACTIVITIES.stateOf(G,id,day)==='full'; },   /* attended 只算聽完 */
  attendedAny(G,id,day){ return !!ACTIVITIES.stateOf(G,id,day); },      /* 聽完或中途離開 */
  /* 選「聽演講」（classes3d.js 的 attendActivity：坐著快轉到結束）＝聽完。這一場已經中途離開過的，回來再聽照樣是中途離開（AA_110 5-2：結束前走出那一間就是 partial）*/
  markAttended(G,a){ const A=ACTIVITIES.rec(G).att, k=a.id+'@'+G.day, r=A[k]; if(r&&r.end==='left') return; A[k]={h:r&&r.h!=null?r.h:+(G.hour%24).toFixed(2),end:'full'}; },
  /* 出席怎麼算（AA_110 5-2）——src/game3d.js 的 actTrack 告訴這裡：玩家在哪一區、哪一間、有沒有坐著（自由行動時每幾格、坐下的時候、每次時間跳動的前後各一次）：
     ・開始記（in）：活動進行中、過一半以前，坐在那一間（和「聽演講」同一個時窗；過半才進去不算）。
       hPrev＝從那時起一直是這個狀態（座位上「坐一下」「讀書」跳過的時間）：開始前就坐下、一路坐到結束以後＝聽完。
     ・聽完（full）：結束的時候還在那一間（坐著、站著都算）。
     ・中途離開（left）：結束前離開那一間（走出去；快速前往用 leave，在時間跳動以前）。
     ・從別處跳過活動時段、只是路過、站在門口：不記＝沒去。
     時間用 G.hour（過了午夜是 24 以上：不會和隔天早上的活動搞混）*/
  track(G,zone,room,seated,hPrev){ if(!ACTIVITIES.list.length) return; const h=G.hour; let A=null;
    for(const a of ACTIVITIES.list){ if(!a.zone||!a.room) continue; const k=a.id+'@'+G.day, r=G.acts&&G.acts.att&&G.acts.att[k];
      if(r?r.end!=='in':!(seated&&h>=a.t0&&zone===a.zone&&room===a.room)) continue; if(!ACTIVITIES.on(a,G.day,G)) continue; const inRoom=zone===a.zone&&room===a.room;
      if(!r){ const s=Math.max(hPrev!=null?Math.min(hPrev,h):h,a.t0); if(s<(a.t0+a.t1)/2){ A=A||ACTIVITIES.rec(G).att; A[k]={h:+s.toFixed(2),end:h>=a.t1?'full':'in'}; } continue; }
      if(!inRoom){ r.end='left'; r.lh=+Math.min(h,a.t1).toFixed(2); } else if(h>=a.t1) r.end='full'; } },
  /* 快速前往（被帶到別的地方）：今天還在聽的那一場＝中途離開。在時間跳動以前呼叫（src/game3d.js 的 quickGo）*/
  leave(G){ const A=G.acts&&G.acts.att; if(!A) return; const sfx='@'+G.day; for(const k in A){ const r=A[k]; if(r&&r.end==='in'&&k.endsWith(sfx)){ r.end='left'; r.lh=+(G.hour%24).toFixed(2); } } },
  /* 最近一次聽完（any：聽完或中途離開）是第幾天；沒有就 null。條件 attendedWithin（「隔天的版本」：持久紀錄，不靠散場 20 分鐘的時窗）*/
  lastAttendedDay(G,id,any){ const A=(G.acts&&G.acts.att)||{}, p=id+'@'; let best=null; for(const k in A){ if(!k.startsWith(p)) continue; const r=A[k]; if(!r) continue; const full=(r.end||'full')==='full'; if(!full&&!any) continue; const d=+k.slice(p.length); if(best===null||d>best) best=d; } return best; },
  /* 最近一場已經結束的是第幾天（今天的已經結束也算）；還沒辦過就 null。往回找到第 1 天（四年約 1500 天；每個活動記住上一次的答案）*/
  lastEnded(G,id){ const a=ACTIVITIES.list.find(q=>q.id===id); if(!a) return null; const h=G.hour%24, k=G.day+'|'+(h>=a.t1?1:0); if(a._last&&a._last.k===k) return a._last.v;
    let v=null; for(let d=G.day; d>=-420; d--){ if(d===G.day&&h<a.t1) continue; if(ACTIVITIES.on(a,d,G)){ v=d; break; } }   /* 第 1 天以前也找（開學改 9/1、經濟系那一年）*/ a._last={k,v}; return v; },
  missed(G,id){ const d=ACTIVITIES.lastEnded(G,id); return d!=null&&!ACTIVITIES.attendedAny(G,id,d); },   /* 中途離開不算沒去 */
  /* 坐在這一間的位子上，現在可以聽的活動：開始前 15 分鐘起、過了一半以前（之後進去不算聽過）；今天這一場已經聽過的不再列 */
  atSeat(G,zone,room){ if(!room) return null; return ACTIVITIES.list.find(a=>a.zone===zone&&a.room===room&&ACTIVITIES.canJoin(G,a))||null; },
  /* 公告欄的文字（沒有活動時寫清楚「目前沒有」，不留空）*/
  posterText(G,zone){ const up=ACTIVITIES.upcoming(G,7).filter(q=>!zone||q.a.zone===zone); if(!up.length) return '目前沒有公告的演講或活動。';
    const W=['日','一','二','三','四','五','六']; return up.map(({a,k})=>{ const d=CALENDAR.dateOf(G.day+k); return (k===0?'今天':k===1?'明天':d.m+'/'+d.d+'（'+W[d.wd%7]+'）')+' '+ACTIVITIES.hhmm(a.t0)+'–'+ACTIVITIES.hhmm(a.t1)+'　'+a.title+(a.roomName?'（'+a.roomName+'）':''); }).join('；'); }
};
