/* ===== 節日總規格：三個情人節、生日、聖誕（＋子晴的跨年），七位女主角（AA_416，企劃線 4f4da5ad；AA-B 2026-10-23 定稿，D109；D14-T11／USER_WANTS D38）=====
   台詞照 AA_416 第 3～9 節一字不改（FEST_DATA）。規則、邀約、出遊、視訊、禮物、好感在 src/fest3d.js。
   - 每一格：s6＝「第 6 階」那一欄（生日、聖誕是第 5 階以上、還沒交往）、dt＝「交往中」（沒寫＝照 s6）、vid＝「視訊」（years／route 是那一格寫的年份、路線；call＝電話）。
     台詞是事件的行（speaker／text、旁白 speaker:null、選項 choice），用 EVENTS.runLines 演。稿裡沒有括號的動作描寫（芷若聖誕、子晴跨年、可昕七夕、沛珊白色情人節）
     演成旁白、加上（），字照稿。
   - 以安、語彤的 2/14 是 AA_414 那幾場（src/an_yt_hol3d.js；第 6 階也演，第 3 節的換字在那裡）；語彤的中秋也是 AA_414。
   - 學姊的禮物照 BB_122 3-7（企劃線 5788b1cb）單身以後那一欄，花那一句照 AA_416 第 7 節改；芷若 2029 白色情人節的明信片照 BB_124 第 1 節（企劃線 96847346）。
   - CG（第 1-9 節）：CG_REGISTRY 有登錄才放。芷若聖誕 cg_one_cup_heroine02（第 6 階以上）、沛珊白色情人節 cg_last_page_peishan（醉月湖那一版；台南運河那一版不放，BB-B 18:09）、
     子晴跨年 cg_savefile_heroine04（交往中）、可昕七夕改成高雄的山上＝新的一張 cg_our_car_kh_kexin（還沒畫；舊的政大後山 cg_our_car_kexin 不用，BB-B 18:09）。
   測試：node tests/aa416_fest_unit.js */
'use strict';
const FEST_DATA=(function(){
  const AN='heroine_01', ZR='heroine_02', YT='heroine_03', ZQ='heroine_04', SIS='heroine_05', PS='classmate_peishan', KX='kexin';
  const S_=id=>t=>({speaker:id,text:t}), N=t=>({speaker:null,text:t});
  const A=S_(AN), Z=S_(ZR), Y=S_(YT), Q=S_(ZQ), W=S_(SIS), P=S_(PS), K=S_(KX);
  const yr=G=>typeof CALENDAR!=='undefined'&&CALENDAR.dateOf?CALENDAR.dateOf(G.day).y:null;
  const route=G=>typeof STORY!=='undefined'&&STORY.route?STORY.route(G):null;
  const hasCG=id=>typeof CG_REGISTRY!=='undefined'&&!!CG_REGISTRY[id];
  const F=(G,k)=>(G&&G.flags||{})[k];
  const cg=(id,extra)=>({if:{custom:G=>hasCG(id)&&(!extra||extra(G))},cg:id});
  const inY=(...ys)=>({custom:G=>ys.includes(yr(G))});
  const tainan=G=>yr(G)>=2028;   /* 沛珊 2027-08 放榜以後在台南：白色情人節 2028、2029 在運河邊 */
  /* 以安 2/14 那一年她送過東西（AA_414 1-1 太陽餅、1-2 御守、2029 補救那一場的紙袋）*/
  const anGave=G=>{ const y=yr(G); return (y===2026&&F(G,'AN_VDAY_Y1')==='went')||(y===2027&&F(G,'AN_VDAY_Y2')==='went')||(y===2029&&F(G,'AN_VDAY_Y4B')==='went'); };
  const NAMES={vday:'情人節',white:'白色情人節',qixi:'七夕',bday:'生日',xmas:'聖誕節',nye:'跨年'};
  const P_={
    /* ---------------- 第 3 節 以安 ---------------- */
    [AN]:{
      fest:{
        vday:{aa414:true},   /* AA_414 1-1～1-4（第 6 階也演）*/
        white:{years:[2026,2027,2029],   /* 2028 是 ev_an_white_day */
          s6:[ {if:{custom:anGave},speaker:AN,text:'白色情人節。日本是收到東西的人要回禮。'},{if:{custom:anGave},speaker:AN,text:'……所以今天是你。我查過了。'},
            {if:{custom:anGave},choice:[{text:'（給她一盒手工餅乾）',goto:'w_a'},{text:'「我忘了。」',goto:'w_b'}]},
            {unless:{custom:anGave},goto:'w_n'},
            {label:'w_a'},A('……你自己做的？'),A('焦的那一塊我吃。'),{goto:'w_end'},
            {label:'w_b'},A('我知道你會忘，所以先說了。'),A('下次不准忘。'),{goto:'w_end'},
            {label:'w_n'},A('白色情人節。……我們都沒送東西。'),A('那今天就是出來走走。'),
            {label:'w_end'} ]},
        qixi:{s6:[A('七夕的故事，我一直覺得規定很怪。一年只能見一次，是誰定的。'),A('……我們不要照那個規定。')],
          dt:[A('今天你決定去哪裡。我只負責準時。'),{if:{custom:G=>yr(G)===2028&&route(G)==='JP'},speaker:AN,text:'七月在日本過過一次。今天是台灣的。'}],
          vid:{years:[2027],call:true,lines:[A('七夕。我記得。'),A('明天我就在京都了。……那邊的七夕，是七月過的。')]},homeYears:{2027:'台中'}},   /* 2027 她在台中，隔天去京都：21:00 電話（characters.js 的回台中到 8/7，稿寫那天在台中）*/
        bday:{years:[2026,2027,2028,2029],noonOnly:[2027],   /* 2027 中秋，晚上麵店團幫她過：只排中午場 */
          s6:[A('生日？……我沒有寫進手帳。'),A('寫了會期待。')],
          dt:[{unless:inY(2027),speaker:AN,text:'今天的行程是你排的？……好。今天我不挑錯。'},{if:inY(2027),speaker:AN,text:'晚上大家要幫我過。……中午這一頓，只有你知道。'}],
          vid:{years:[2028],route:'US',lines:[A('你那邊是早上吧。我這邊快睡了。'),A('……生日還剩三個小時。你剛好趕上。')]}},   /* 臺灣 21:00＝美國 09:00 */
        xmas:{s6:[A('聖誕節。……我手帳上這一天本來是空的。'),A('現在不是了。')],
          dt:[N('（她遞過來一張卡片）'),A('字很少。回去再看。'),N('（卡片上只有一行：「明年也一起過。——以安」）')]} },
      ask:{lines:['明天是情人節。','晚上六點半，總圖門口。……你不要排別的。'],no:['好。那我讀書。'],h:18.5,place:'總圖門口',bg:'library_gate_night',
        by:{vday:['明天是情人節。','晚上六點半，總圖門口。……你不要排別的。'],white:['明天是白色情人節。','晚上六點半，總圖門口。手帳上這一格，我先寫了。'],qixi:['明天是七夕。','晚上六點半，總圖門口。農曆的日子，我查了兩次。'],
          xmas:['明天是聖誕節。','晚上六點半，總圖門口。……穿暖一點。']}},   /* AA_460 4-2（企劃線 b9362f474）：照節日換整組（原本只換第一句的節日名、第二句每次一樣）。生日那一列當作沒有（AA_460 第 9 節，企劃線 cb5caad65）：fest3d.js 的她約（herAsks）只跑情人節、白色情人節、七夕、聖誕（S.HER_K），生日不是她約 */
      gifts:[ {id:'pen',name:'一支好寫的鋼筆',price:800,ok:true,lines:[A('……我的筆快沒水了。你怎麼知道。')],cond:G=>F(G,'AN_VDAY_GIFT')!=='pen'},   /* 2028 情人節送過的不列 */
        {id:'planner',name:'一本空白的手帳',price:250,ok:true,lines:[A('明年的。……我會從第一頁開始寫。')]},
        {id:'commerce',name:'一本商事法的書',price:450,ok:true,lines:[A('這本我在圖書館借了三次。……現在不用還了。')]},
        {id:'flowers',name:'一束花',price:300,ok:false,lines:[A('……謝謝。'),N('（她拿著花，不知道要放哪裡。）'),A('宿舍沒有花瓶。')]} ],
      none:[A('你人來了就好。')],
      home:{city:'台中',bg:'tc_park'} },
    /* ---------------- 第 4 節 林芷若 ---------------- */
    [ZR]:{
      fest:{
        vday:{s6:[Z('你開車來台中？……我家的店今天沒開。'),Z('我帶你去看一部老電影。')],   /* 2026～2028 寒假在台中，祐廷開車去 */
          dt:[Z('我媽問我今天為什麼穿這件。……我說，有人要來。')],
          vid:{years:[2029],lines:[Z('這裡下午一點。外面在下雨。'),Z('……倫敦的情人節也在下雨。')]}},   /* 倫敦 13:00＝臺灣 21:00 */
        white:{s6:[Z('白色情人節要回禮。……我回你一杯不在菜單上的。')],dt:[Z('今天的拉花，我練了一個月。……不要拍。')],
          card:{years:[2029]}},   /* 2029（她在英國）：明信片＋當晚 21:00 私訊（src/fest3d.js S.card）*/
        qixi:{s6:[Z('七夕我們店有一款特調。很甜。我不喝，可是想做給你。')],
          dt:[{if:inY(2028),speaker:ZR,text:'下個月我就走了。今天的特調還沒取名。'},{if:inY(2028),speaker:ZR,text:'……你取。'},
            {unless:inY(2028),speaker:ZR,text:'七夕我們店有一款特調。很甜。我不喝，可是想做給你。'}]},   /* 交往中那一格只寫了 2028（她九月出發）；其他年份照第 6 階 */
        bday:{years:[2025,2026],s6:[Z('你怎麼知道？……我沒有跟店裡的人說。'),Z('生日我都一個人看一部電影。今年兩個人。')],abroadDedicated:true},   /* 英國：ev_zhiruo_bday_video */
        xmas:{years:[2025,2026],venue:'cafe',abroadDedicated:true,   /* 英國：ev_zhiruo_xmas_video */
          s5:[Z('聖誕夜我有班。……打烊以後，你可以來。'),N('（打烊後，她做了兩杯，一杯給自己。）')],
          s6:[N('（打烊後只剩吧檯的燈，她做了一杯拉花是聖誕樹的拿鐵。）'),cg('cg_one_cup_heroine02'),Z('今年只做一杯。'),Z('……給你的。')]} },   /* CG：第 6 階以上（單身也可以）*/
      ask:{lines:['明天我跟店長請假了。','晚上七點，Café 門口。……今天我是客人。'],by:{vday:['明天情人節。我跟店長請假了。','晚上七點，Café 門口。……今天我是客人。'],white:['明天三月十四。我跟店長請假了。','晚上七點，Café 門口。這次我想坐在吧檯外面。'],qixi:['明天七夕。我跟店長請假了。','晚上七點，Café 門口。我想吃別人煮的東西。'],bday:['明天我生日。店長叫我不要來上班。','晚上七點，Café 門口。'],xmas:['明天聖誕節。店長說我可以早走。','晚上七點，Café 門口。……今天我是客人。']},no:['好。那我去上班。'],h:19,place:'Café 門口',bg:'dark'},
      gifts:[ {id:'filmbook',name:'一本絕版的電影書',price:900,ok:true,lines:[Z('你在哪裡找到的？……我找了兩年。')]},
        {id:'poster',name:'一張老電影的海報',price:400,ok:true,set:{ZR_POSTER:true},lines:[Z('這部我看過四次。……第五次要跟你看。')]},   /* AA_524 Z8：記 ZR_POSTER（她主動約的 D04 西門老片開頭讀，src/aa524_3d.js）*/
        {id:'mug',name:'一個新的馬克杯',price:350,ok:true,lines:[Z('店裡的杯子都是客人的。這個是我的。')]},
        {id:'beans',name:'一包咖啡豆',price:450,ok:false,lines:[Z('送咖啡師咖啡豆，很像送醫生 OK 繃。'),N('（她笑了）'),Z('……我會喝的。')]} ],
      none:[Z('沒關係。我請你喝一杯，就當你送我了。')],
      home:{city:'台中',bg:'tc_cafe'},
      card:{lines:[Z('這裡沒有白色情人節。所以我畫了一杯。'),Z('拉花是我練了一個月的那個。……畫得比較好。不要拍。')],narr:'（收到一張明信片，畫了一杯拿鐵。）',dm:['明信片到了嗎？……拍了也沒關係。']} },
    /* ---------------- 第 5 節 陳語彤 ---------------- */
    [YT]:{
      fest:{
        vday:{aa414:true},   /* AA_414 2-1～2-4（第 6 階也演，不改字）*/
        white:{s6:[Y('回禮。……我不知道要送什麼。'),N('（她把一個保鮮盒推過來，裡面是兩顆滷蛋。）')],
          dt:[{unless:inY(2028),speaker:YT,text:'……我做了滷蛋。阿姨教的。第一次做。'},{if:inY(2028),speaker:YT,text:'今天我在店裡。你來，我留一顆。'}],
          venueBy:{dt:{2028:'noodle'}},   /* 2028（週二）她顧店 */
          noonDm:['（照片：麵店今天的小菜）','這碗是你的。']},   /* 第 6 階：中午 12:00 她先傳 */
        qixi:{s6:[Y('七夕……麵店照常開。'),Y('……可是我晚上沒班。')],dt:[Y('我跟阿姨請假了。'),N('（她說完就低頭看菜單。）')]},
        bday:{venue:'noodle',s6:[Y('……你怎麼知道。'),Y('阿姨說的？……嗯。'),Y('今天麵店。你來就好。')],dt:[Y('今天阿姨煮了豬腳麵線。……多一碗。你的。')],
          vid:{years:[2028],route:'JP',lines:[Y('麵店今天好吵。阿姨在後面煮麵線。'),Y('……你那邊幾點？')]}},   /* 臺灣 21:00＝日本 22:00 */
        xmas:{venueBy:{s6:'noodle'},s6:[Y('聖誕節麵店照常。……打烊以後，你要不要來剝蒜頭。')],
          dt:[Y('今天打烊早。阿姨說，聖誕節要給年輕人。'),{if:inY(2025,2026,2028),speaker:YT,text:'交換禮物我抽到一條圍巾。……我換給你了。阿哲不知道。'}]} },   /* 有麵店團交換禮物的年份多一句 */
      ask:{lines:['明天晚上有空嗎','麵店門口 六點半'],by:{vday:['明天情人節 晚上有空嗎','麵店門口 六點半'],white:['明天三月十四 有空嗎','麵店門口 六點半 今天我不顧店'],qixi:['明天七夕 晚上有空嗎','麵店門口 六點半'],bday:['明天我生日','麵店門口 六點半 不要帶東西'],xmas:['明天聖誕節 店裡早關','麵店門口 六點半']},no:['嗯。'],h:18.5,place:'麵店門口',bg:'noodle_table'},
      gifts:[ {id:'hairtie',name:'一條髮圈',price:120,ok:true,lines:[Y('……舊的那條鬆了。你有看到。')]},
        {id:'umbrella',name:'一把新的傘',price:350,ok:true,lines:[Y('……我有傘。'),Y('……可是這把我會用。')]},
        {id:'shoes',name:'一雙顧店穿的布鞋',price:500,ok:true,lines:[Y('店裡的地板很滑。……你怎麼知道。')]},
        {id:'perfume',name:'一瓶香水',price:1500,ok:false,lines:[Y('……太貴了。我不能收。'),Y('……我收一半。'),N('（她真的把盒子裡的試用瓶留下，正瓶推回來給你。）')]} ],
      none:[Y('嗯。你來店裡吃麵就好。')] },
    /* ---------------- 第 6 節 高子晴 ---------------- */
    [ZQ]:{
      fest:{
        vday:{s6:[Q('情人節？……你是認真的？'),Q('好。我請你吃巧克力。超商的。')],
          dt:[Q('我做了一個情人節的小關卡。最後一關有一句話。'),Q('……玩。'),N('（插座貓走到終點，畫面跳出一行字：「下次換你做一關給我。」）')]},
        white:{s6:[Q('白色情人節要回禮。我回你一首歌。……很短。')],dt:[Q('這首歌我寫了三個月。第一句很爛，你不要笑。')]},
        qixi:{s6:[Q('牛郎織女一年見一次。我覺得他們效率很差。')],dt:[Q('我們不要一年見一次。'),N('（她說完就低頭滑手機，耳朵很紅。）')]},
        bday:{s6:[Q('生日？我不過生日。……好啦，過一點點。'),Q('二月十號。十在二進位是二。……很二進位。')],dt:[Q('今天我生日。……你說要送什麼？')]},
        xmas:{s6:[Q('聖誕節？我送你一個測試版。不要問是什麼。')],dt:[Q('今年的測試版有兩個玩家。……你猜另一個是誰。')]},
        nye:{years:[2025,2026,2027,2028],s6:[Q('跨年？好。我帶筆電。不要問為什麼。')],   /* 第 6 階：約她跨年時她說的（src/fest3d.js S.nyeAsk）*/
          dt:[N('（她打開筆電：插座貓走到最後一關，最後一關是煙火。）'),cg('cg_savefile_heroine04'),N('（十二點，真的煙火和螢幕上的一起亮。）'),Q('新年快樂。……這一關我做了一個月。')]} },   /* 交往中：接在頂樓的團體跨年後面（OUT.AFTER）*/
      ask:{lines:['明天下午一點','溫州街的公園 我起得來'],by:{vday:['明天情人節','下午一點 溫州街的公園 我起得來'],white:['明天三月十四','下午一點 公園 這次我早到'],qixi:['明天七夕','下午一點 公園 我設了三個鬧鐘'],bday:['明天我生日','下午一點 公園 不要買蛋糕'],xmas:['明天聖誕節','下午一點 公園 測試版我帶去']},no:['好 那我睡覺'],h:13,place:'溫州街的公園',bg:'dark'},
      gifts:[ {id:'keycap',name:'插座貓圖案的鍵帽',price:300,ok:true,lines:[Q('……你在哪裡找到的。這隻是盜版的貓。可是好可愛。')]},
        {id:'picks',name:'一組吉他彈片',price:150,ok:true,lines:[Q('我上一片斷了。……三片我會省著用。')]},
        {id:'report',name:'測試報告',price:0,ok:true,lines:[Q('三十二個 bug？'),Q('……這是我收過最好的禮物。')],cond:G=>F(G,'ZQ_TB_PLAYED')!=null},   /* 玩過她的測試版（AA_400）才有 */
        {id:'codebook',name:'一本程式設計的書',price:600,ok:false,lines:[Q('我比這本書會寫。'),Q('……封面很好看。我放桌上。')]} ],
      none:[Q('沒差。我本來就不過生日。')], noneBy:{xmas:[Q('沒差。測試版先欠著。')]} },
    /* ---------------- 第 7 節 溫書瑀（學姊）---------------- */
    [SIS]:{
      fest:{
        vday:{s6:[{if:inY(2026),speaker:SIS,text:'筆試考完了。……今天我什麼都沒排。'},{unless:inY(2026),speaker:SIS,text:'情人節。……我今年沒排別的事。'}],
          dedicated:{dt:[2027,2028,2029]}},   /* sis_b4_3d.js S.HOL、S.CALL */
        white:{s6:[W('回禮。'),N('（一張便條，上面寫：「謝謝你。」）')],dt:[W('回禮。'),N('（一張便條，背面也有字。）'),W('背面，回去再看。'),Object.assign({unless:inY(2029)},N('（背面寫著：「明年也要。」）')),
          Object.assign({if:inY(2029),aa523:true},N('（背面寫著：「上班以後也要。」）'))]},   /* AA_523 6-14（企劃線 0d7b5388b）：交往中每年同一張便條——2029 年那一張多「上班以後也要。」（2026～2028 照舊；交往中、那一年有演到的每年都演，S.YEARS.white 2026～2029）*/
        qixi:{s6:[W('一年見一次，很辛苦吧。'),W('我以前覺得，排好的話，一年一次也可以。')],drive:'D15',dedicated:{dt:[2026,2027,2028]}},   /* 開車上陽明山（她的心願地點 D15）；交往中 AA_388 */
        bday:{years:[2028],   /* 2026、2027：ev_sis_bday_*；2029：畢業後篇 ev_pg_sis_bday */
          s6:[W('生日？期末考前。我從來沒有好好過過。'),W('……今年讓你排。我不看時間。')],
          dt:[W('生日？期末考前。我從來沒有好好過過。'),W('……今年讓你排。我不看時間。'),W('……我把計畫本那一天塗掉了。')],
          vid:{years:[2028],route:'JP',lines:[W('研究室沒有蛋糕。……我買了一個布丁。'),W('你看，蠟燭插不進去。')]}},   /* 臺灣 21:00＝日本 22:00 */
        xmas:{s6:[W('聖誕節。今天家族沒有聚餐。'),W('……所以只有我們兩個。')],dedicated:{dt:[2026,2027,2028]}} },   /* 交往中 sis_b4_3d.js、2028 期末約會 */
      ask:{lines:['明天晚上七點。法圖門口。'],by:{vday:['明天是二月十四。','晚上七點，法圖門口。'],white:['明天是三月十四。','晚上七點，法圖門口。'],qixi:['明天七夕。','晚上七點，法圖門口。'],bday:['明天我生日。','晚上七點，法圖門口。'],xmas:['明天聖誕節。','晚上七點，法圖門口。']},no:['好。那我寫論文。'],h:19,place:'法圖門口',bg:'ntu_linze'},
      gifts:[ {id:'highlighter',name:'一盒綠色螢光筆',price:120,ok:true,lines:[W('實用。……謝謝。這週就會用完。')]},   /* BB_122 3-7（單身以後那一欄）；價錢 AA_416 第 11 節第 6 點（2af5f4899）*/
        {id:'notebook',name:'一本空白筆記本',price:250,ok:true,lines:[W('我有很多本了。……這本我留著，不排東西。')]},
        {id:'honey',name:'期末考前的蜂蜜檸檬',price:80,ok:true,lines:[W('這個時候送這個。你很懂。')]},
        {id:'coupon',name:'手寫的「今天先不改了」券',price:0,ok:true,lines:[W('我用了。昨天。')],cond:G=>typeof STORY!=='undefined'&&STORY.sisW8?STORY.sisW8(G):false},   /* W8 以後才有 */
        {id:'flowers',name:'一束花',price:500,ok:true,lines:[W('花喔。……我要去找一個瓶子。')]} ],   /* AA_416 第 11 節第 6 點：原本「我第一次收到不是畢業典禮的花。」（「這是我第一次」句型）換這一句 */
      none:[W('沒關係。……你來了，今天就不算沒過。')] },
    /* ---------------- 第 8 節 郭沛珊 ---------------- */
    [PS]:{
      fest:{
        vday:{s6:[P('情人節？我在台中。早餐店情人節也開。'),P('你要來吃蛋餅嗎？')],dt:[P('我爸在蛋餅上畫了愛心。他不知道是給誰的。'),P('……現在知道了。')],
          vid:{years:[2027],call:true,dtOnly:true,her:true,lines:[P('情人節。我在讀書。'),P('……可是我想聽你的聲音。五分鐘就好。')]}},   /* 消失期、交往中：21:00 電話 */
        white:{years:[2026,2028,2029],   /* 2027 消失期不演 */
          s6:[{if:{custom:tainan},speaker:PS,text:'這裡沒有映月湖。……運河也可以。'},N('（她拿出一本筆記本。）'),P('這一年我問你的問題，我自己的答案都寫在這裡。'),
            cg('cg_last_page_peishan',G=>!tainan(G)&&!F(G,'PS_WHITE_CG')),{if:{custom:G=>!tainan(G)&&hasCG('cg_last_page_peishan')},set:{PS_WHITE_CG:true}},
            P('最後一頁是空的。……那一題，你來回答。')],
          dt:[cg('cg_last_page_peishan',G=>!tainan(G)&&!F(G,'PS_WHITE_CG')),{if:{custom:G=>!tainan(G)&&hasCG('cg_last_page_peishan')},set:{PS_WHITE_CG:true}},
            P('最後一頁我寫了：『明年也一起問嗎？』'),P('……你可以用一個字回答。')],
          fixed:{2026:{place:'映月湖邊',bg:'dark',h:19}}},   /* 2026 醉月湖邊（晚上）；2028、2029 台南的運河邊（tn_canal，不放 CG）*/
        qixi:{s6:[P('七夕的故事有一個問題：為什麼是喜鵲？')],dt:[P('我查到了。……不告訴你。明年再問我。')]},
        bday:{s6:[P('你怎麼知道？……我只在讀書會說過一次。'),P('我們家的生日蛋糕是蛋餅疊起來的，三層。我爸的發明。')],dt:[P('我爸說今年要做兩份蛋餅蛋糕。……他沒問為什麼，可是他知道。')],
          vid:{years:[2027],call:true,dtOnly:true,lines:[P('今天生日。我還是在讀書。'),P('……你打來，就算過了。')]}},   /* 消失期、交往中：電話（你打來）*/
        xmas:{s6:[P('聖誕老人存在嗎？……我想聽你的論證。')],dt:[P('課輔班的小孩做了卡片。有一張寫你的名字。')]} },
      ask:{lines:['明天是情人節！！','晚上六點半，溫州街口，可以嗎？'],homeLines:['明天你要下來嗎？……不用勉強。'],no:['好！那下次。'],h:18.5,place:'溫州街口',bg:'wenzhou_tutoring',   /* AA_460 4-3（沛珊在臺北的 by）當作沒有（AA_460 第 9 節，企劃線 cb5caad65）：她約的每個節日不是在台中老家、台南（homeBy），就是 2026 白色情人節的固定行程或重考消失期，手機用不到那張表 */
        homeBy:{vday:{台中:['明天情人節。……你要下來台中嗎？不用勉強。']},white:{台南:['明天三月十四！你下來的話，我去車站接你。……不用勉強。']},qixi:{台中:['明天七夕。台中的夜市很熱鬧，你要下來嗎？……不用勉強。']},
          xmas:{台南:['明天聖誕節。台南的街上也有燈。你要下來嗎？……不用勉強。']}}},   /* 她回家（home）的時候照節日、照她在哪個城市換（AA_457 第 3 節，企劃線 3be31d3c8；3-1 節①更正 d809cdd21：她家在台中、大三起在台南讀書——情人節、七夕在台中，三月十四、聖誕在台南；「做十六歲」、生日那句拿掉）；fest3d.js herLines。沒寫的照舊 homeLines */
      gifts:[ {id:'philo',name:'一本入門的哲學書',price:350,ok:true,lines:[P('我在旁聽的那門課，老師推薦過這本。……你記得。')]},
        {id:'stickers',name:'一盒給課輔班小孩的貼紙',price:100,ok:true,lines:[P('這個我要拿去課輔班。……第一張留給我。')]},
        {id:'pen',name:'一支好寫的筆',price:200,ok:true,lines:[P('我的問題都是用筆想的。……這支我會寫很多問題。')]},
        {id:'choco',name:'一盒很貴的巧克力',price:800,ok:false,lines:[P('……這個太貴了。我會捨不得吃。')]} ],
      none:[P('沒關係啦！你來我就很高興了。')],
      home:{city:'台中',bg:'tc_eatery'}, homeBy:{台南:'tn_oldstreet'}, fixedBg:{white:{台南:'tn_canal'}},
      blackout:['2026-12-17','2027-08-06'] },   /* 消失期：只有表上寫的電話 */
    /* ---------------- 第 9 節 杜可昕（只有交往中）---------------- */
    [KX]:{ datingOnly:true,
      fest:{
        vday:{dedicated:{dt:[2026,2027,2028,2029]}},
        white:{dt:[K('白色情人節。我記得你上個月送什麼。'),K('……這是回禮。拆開以前不准猜。')]},
        qixi:{dedicated:{dt:[2027]},   /* 2027 ev_kexin_qixi_y2（＋視訊）*/
          dt:[N('（晚上，山上的停車處，看得到港口的燈。）'),K('牛郎織女如果有車，就不用等一年了。'),cg('cg_our_car_kh_kexin'),K('……我們有車。')],   /* CG 改高雄的山上（新的一張，還沒畫）*/
          tripH:19.5,tripBg:'kh_sizihwan',homeYears:{2029:'高雄'},   /* 稿：2026、2028、2029 開車去高雄（2029 畢業後的暑假照稿在高雄）*/
          vid:{lines:[K('七夕。……你不來，我就自己看港口。')]}},   /* 不想開車的：21:00 視訊 */
        bday:{dedicated:{dt:[2026,2027,2028,2029]}},
        xmas:{years:[2025],dedicated:{dt:[2026,2027,2028]},dt:[K('聖誕節。……我從山上下來了。你要請客。')],taipei:[2025]} },   /* 2025：她從政大下來（寒假的高雄還沒開始那一版）*/
      ask:{lines:['明天晚上六點半 公館','你敢遲到試試看'],by:{vday:['明天情人節 晚上六點半 公館','你敢遲到試試看'],white:['明天三月十四 晚上六點半 公館','回禮我準備好了'],qixi:['明天七夕 晚上六點半 公館','我訂位了'],bday:['明天我生日 晚上六點半 公館','你敢忘記試試看'],xmas:['明天聖誕節 晚上六點半 公館','這次我先到']},no:['好。……你記得你欠我一次。'],h:18.5,place:'公館',bg:'gongguan'},
      home:{city:'高雄',bg:'kh_sizihwan'} } };
  return {NAMES,PEOPLE:P_,
    QIXI:{2026:'2026-08-19',2027:'2027-08-08',2028:'2028-08-26',2029:'2029-08-16'},
    BDAY:{[AN]:'09-15',[ZR]:'09-28',[YT]:'07-09',[ZQ]:'02-10',[SIS]:'06-02',[PS]:'03-15',[KX]:'04-24'},
    /* 第 6 階以上 1-3：三個情人節＝第 6 階或交往中；生日、聖誕（子晴的跨年同）＝第 5 階以上 */
    MIN:{vday:6,white:6,qixi:6,bday:5,xmas:5,nye:5},
    /* 好感 1-7（不受每天上限）*/
    REL:{loveS6:{fam:4,comf:5,npcRom:6},loveDt:{fam:3,comf:6,npcRom:5},day:{fam:4,comf:4,npcRom:4},video:{fam:2,comf:3,npcRom:3},giftOk:{npcRom:2,trust:3},giftNo:{trust:3}},
    /* 老家開車（date3d.js 的地點表：開車單程＋從宿舍先回家取車 30 分；油錢＋過路費＝開車的來回）*/
    CITY:{台中:'D26',台南:'D28',高雄:'D29'} };
})();
/* 每個人一個出遊事件（OUT 的 trigger 'outing'）：台詞照 src/fest3d.js 排好的那一場（beforeOuting 記下這一趟，call 那一行演）*/
const FEST_EVENTS=['heroine_01','heroine_02','heroine_03','heroine_04','heroine_05','classmate_peishan','kexin'].map(id=>{
  const X=()=>typeof FEST!=='undefined'?FEST:null;
  return { id:'ev_fest_'+id, participants:[id], location:'any', trigger:'outing', background:'dark',
    get title(){ const x=X(), q=x&&x._q; return q&&q.fest?x.name(q.fest.k):'節日'; },
    get hours(){ const x=X(), q=x&&x._q; return q&&q.fest&&q.fest.after!=null?q.fest.after:2; },
    dialogue:[{call:(G,GM)=>{ const x=X(); return x?x.playOut(GM):null; }}],
    beforeOuting:(G,GM,q)=>{ const x=X(); if(x) x.before(G,GM,q); },
    outingMissed:(G,GM,q)=>{ const x=X(); if(x) x.missed(G,q); } }; });
for(const e of FEST_EVENTS){ if(!STORY_EVENTS.some(x=>x.id===e.id)) STORY_EVENTS.push(e); }
