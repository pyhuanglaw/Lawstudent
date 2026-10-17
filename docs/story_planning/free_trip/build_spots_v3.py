# AA_161 第 5 節：自由出行第三批（AA-C 2026-10-17）。
# 執行：python3 build_spots_v3.py → spots_v3.json；--check 只檢查不寫檔；--md 印出 AA_161 第 5 節「台詞全文」用的 Markdown。
# 範圍：date_system/date_locations.json 的 32 處，扣掉第一批（D04、D06、D12、D13）、第二批（D09、D18、D20、D24、D25），共 23 處。
#   收 18 處（SPOTS）；不收 5 處（NOT_INCLUDED，都是只有開車到得了，AA_160 第 4 節沒有寫一個人開車出行的規則 → 待決）。
# 互動點 id 和約會系統相同（date_system/lines/Dxx.json 的 points、date_system/art/Dxx_coords.json），座標重用。
# 交通、車資、門票、休館照 date_locations.json；有開車選項的地點只用大眾運輸那一個（AA_160 4-1：出發只有公館站）。
# 互動點的時間、花費照 date_system/point_specs.json（AA_148）的 min、cost；一個人去的差別寫在 costNote。
# 文字只有祐廷一個人（旁白用「你」）；不新增有名字的人物；店名照 D77 不寫；口語照 AA_188、AA_193（具體、平實，不寫金句、擬人、感悟）。
# 規則沿用 spots_v1.json 的 rules（第一次／第二次／第三次以後、散步池、夕陽、下雨、拍照、錢）；第三批多的欄位寫在 RULES_V3。
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DS = os.path.join(HERE, '..', 'date_system')

EXAM = '考試週不能去（外縣市，太遠；和第二批 D24、D25 同一條）'

SPOTS = [
 # ───────── 臺北市、新北：捷運直達 ─────────
 dict(id='D01', name='華山1914文創園區', area='臺北市', bg='d01_base_afternoon', open=[11, 18], closedWd=[], weather='mixed',
      transit=dict(legs=[dict(mode='mrt', text='捷運到忠孝新生站（古亭轉中和新蘆線）', minutes=25)], minutes=25, fareRound=60),
      rules=['週末市集只有週六、週日：平日灰掉，寫「市集只有週末」', '下雨：大草地灰掉；展覽、市集（帳篷下）照常'],
      arrive=['忠孝新生站走過來，過一個路口就到。紅磚的老倉庫一排一排，旁邊是高架道路。',
              '華山。你記得展覽在倉庫那一排，草地在後面。',
              '華山。從捷運站走過來，五分鐘。'],
      walk=dict(point=None, label='在園區裡繞一繞', minutes=30, cost=0, times=2, lines=[
              '倉庫和倉庫中間的走道，牆上爬滿藤。有人坐在台階上吃冰淇淋。',
              '後面有一根很高的老煙囪。你在下面抬頭看了一下，脖子有點痠。',
              '有一間倉庫在佈展，門口堆著木箱，工作人員推著推車進進出出。你從旁邊繞過去。'],
              rain='下雨了。大家都擠到倉庫的屋簷下，走道上只剩撐傘的人。'),
      points=[
        dict(id='D01.expo', label='看一個展', minutes=30, cost=250, kind='fixed', lines=[
              '這一檔是插畫展，一間一間的白牆。你在一張畫前面站最久，畫的是一碗湯麵。',
              '換了一檔，是家具設計的展。你看了一圈椅子和燈，就出來了。']),
        dict(id='D01.market', label='逛週末市集', minutes=20, cost=0, days=[6, 0], lines=[
              '白帳篷一攤一攤：手工皂、銀飾、自己烤的餅乾。老闆問你要不要試吃，你吃了一片，沒有買。',
              '上次那攤餅乾今天沒有來，換成一攤賣舊相機的。你拿起一台，很重，又放回去。']),
        dict(id='D01.lawn', label='在大草地坐一下', minutes=20, cost=0, outdoor=True, lines=[
              '你在草地邊坐下。有一家人在放風箏，風箏一直掉下來，小孩一直跑去撿。',
              '同一片草地。今天沒有風，大家都只是坐著。']),
        dict(id='D01.wall', label='在紅磚牆前拍一張', minutes=15, cost=0, photo=True, lines=[
              '紅磚牆前面很多人在排隊拍照。你排了一下，請後面的人幫你拍了一張。',
              '紅磚牆前面今天人比較少。你拍了一張，不用排隊。']),
      ],
      leave='走回忠孝新生站。高架道路下面的車很多，你等了兩次紅燈。'),

 dict(id='D02', name='松山文創園區', area='臺北市', bg='d02_base_overcast', bgRain='d02_base_rain', open=[10, 18], closedWd=[], weather='mixed',
      transit=dict(legs=[dict(mode='mrt', text='捷運到國父紀念館站（西門轉板南線）', minutes=30)], minutes=30, fareRound=60),
      rules=['下雨：底圖換雨後版 d02_base_rain（BB_132 第 6 組：兩張都收）；巴洛克花園灰掉，長廊、書店照常'],
      arrive=['國父紀念館站走過來十分鐘。圍牆裡面是一整排老廠房，比外面的馬路安靜很多。',
              '松菸。你記得生態池在左邊，書店在最裡面。',
              '松菸。你從同一個門進來。'],
      walk=dict(point='D02.pond', label='繞生態池走一圈', minutes=30, cost=0, times=2, lines=[
              '生態池邊有幾隻白鷺鷥。一個阿伯拿著很長的鏡頭，在等牠們飛起來。',
              '池子旁邊的步道鋪著木板，踩上去有一點聲音。有人在長椅上睡午覺。',
              '水面上有落葉。一隻烏龜浮上來，過了一下又沉下去。'],
              rain='雨下在池面上。步道上沒什麼人，木板濕了，你走得比較慢。'),
      points=[
        dict(id='D02.corridor', label='走製菸工廠的長廊', minutes=20, cost=0, lines=[
              '長廊很長，一邊是一格一格的窗。有幾間在辦展，你只在門口看了一下。',
              '同一條長廊。今天有一間在辦學生的畢業展，你進去繞了一圈。']),
        dict(id='D02.garden', label='巴洛克花園', minutes=15, cost=0, outdoor=True, lines=[
              '花園中間有一個噴水池，樹籬修得很整齊。你繞了一圈，出來的時候有點分不清楚剛剛從哪邊進來。',
              '噴水池今天沒有開。你在旁邊的石椅坐了一下。']),
        dict(id='D02.books', label='在園區的書店翻書', minutes=30, cost=0, lines=[
              '書店很大。你在法律那一櫃前面站了一下，又走到旅遊書那邊。翻了半小時，什麼也沒買。',
              '上次那本書還在架上。你從第三章開始看。']),
      ],
      leave='回程在西門換車。月台上的人很多，你等了兩班才擠上去。'),

 dict(id='D03', name='參創生活園區', area='臺北市', bg='d03_base_afternoon', open=[11, 18], closedWd=[], weather='indoor', wishOf='heroine_04',
      transit=dict(legs=[dict(mode='mrt', text='捷運到忠孝新生站（古亭轉中和新蘆線）', minutes=25)], minutes=25, fareRound=60),
      rules=['子晴的心願地點：自己去不會完成、也不會解鎖她的心願（AA_160 4-4）'],
      arrive=['忠孝新生站出來，走一段就到。整棟大樓都在賣電腦、手機和遊戲。',
              '參創。你直接搭電扶梯上樓。',
              '參創。一樓的音樂還是開得很大聲。'],
      walk=dict(point=None, label='在各層樓逛一圈', minutes=30, cost=0, times=2, lines=[
              '一層在賣手機殼，一層在賣鍵盤和耳機。店員在試喇叭，整層都是同一首歌。',
              '有一櫃在賣舊的遊戲機，盒子都還在。你看了一下價錢，比你想的貴很多。',
              '電扶梯旁邊有人對著手機拍開箱，講話很快。你從鏡頭後面繞過去。']),
      points=[
        dict(id='D03.demo', label='獨立遊戲試玩區', minutes=30, cost=0, lines=[
              '試玩區有六台電腦。你玩了一款在小島上送信的遊戲，玩到第二關，後面有人在等，你就讓開了。',
              '上次那款換成另一款。你卡在同一個地方好幾次，旁邊的人指了一下，你才過去。']),
        dict(id='D03.arcade', label='舊機台的音樂遊戲', minutes=20, cost=60, lines=[
              '舊機台的音樂遊戲，一首三十塊。你玩了兩首，第二首手跟不上，分數很難看。',
              '你又投了六十塊。這次第二首過了。']),
        dict(id='D03.gacha', label='扭蛋機', minutes=15, cost=100, lines=[
              '一整排扭蛋機。你投了一百塊，扭到一隻很小的塑膠水獺。',
              '旁邊的小孩一直扭不到想要的。你扭了一次，是一個小鑰匙圈。']),
        dict(id='D03.window', label='樓上靠窗的休息區', minutes=20, cost=60, lines=[
              '樓上有一排靠窗的位子。你買了一杯飲料坐著，窗外是天橋和路口。',
              '同一排位子。你坐在最邊邊那一張，看樓下的人等紅燈。']),
      ],
      leave='走出大樓，耳朵還有一點嗡嗡的。你走回忠孝新生站。'),

 dict(id='D05', name='光典臺北', area='臺北市', bg='d05_base_dusk', open=[15, 21], closedWd=[], weather='indoor', wishOf='heroine_02',
      transit=dict(legs=[dict(mode='mrt', text='捷運到中山站（中正紀念堂轉淡水信義線）', minutes=20)], minutes=20, fareRound=50),
      rules=['芷若的心願地點：自己去不會完成、也不會解鎖她的心願（AA_160 4-4）',
             '看電影是固定段落，沒有互動點（date_locations 的 fixed；和約會一樣不算互動點），選單上的一項'],
      fixed=dict(label='看一場電影', minutes=120, cost=260, lines=[
              '今天放的是一部修復過的老片，有幾段畫面還是有刮痕。廳不大，坐了一半。',
              '這次是一部紀錄片，拍一個小鎮的郵差。你看到一半有點睏，後半段又醒了。',
              '你挑了一部沒聽過的片。旁邊的人看完還坐著，等字幕跑完才走。']),
      arrive=['中山站走過來，路邊的樹都很高。一棟白色的老洋房，一樓是咖啡館，側門通到放映廳。',
              '老洋房。你記得售票口在側門。',
              '老洋房。你先去看今天幾點有片。'],
      walk=dict(point=None, label='沿著路邊的樹走一段', minutes=30, cost=0, times=2, lines=[
              '這一段的人行道很寬，兩邊的樹很高。有人牽著狗，狗每一棵樹都要停一下。',
              '巷子裡有很多小店，賣杯子的、賣衣服的、賣舊書的。你一間一間看過去，沒有進去。',
              '路口有一間老麵包店，門口的玻璃櫃已經空了一半。'],
              rain='下雨了。你沿著騎樓走，騎樓斷掉的地方就小跑步過去。'),
      points=[
        dict(id='D05.garden', label='院子的大樹下', minutes=20, cost=0, lines=[
              '院子裡有一棵很大的樹，樹下有木頭長椅。你坐了一下，看進出放映廳的人。',
              '同一張長椅。旁邊坐著一個在看劇本的人，一直拿筆在畫線。']),
        dict(id='D05.cafe', label='一樓的咖啡館', minutes=30, cost=130, lines=[
              '一樓的咖啡館，窗很大。你點了一杯拿鐵，隔壁桌在討論剛看完的片，講到結局吵了起來。',
              '同一個窗邊。你這次點了熱的，坐了半小時。']),
        dict(id='D05.shop', label='電影書店', minutes=20, cost=0, lines=[
              '小小的書店，一整面牆都是電影的書和海報。你翻了一本導演的訪談，站著看了十幾頁。',
              '那本訪談賣掉了。你翻了另一本，是同一個導演的劇本。']),
        dict(id='D05.board', label='看下個月的片單', minutes=15, cost=0, lines=[
              '牆上貼著下個月的片單。有兩部你想看，可是都在平日下午。',
              '片單換了。你用手機拍下來，想說回去對一下課表。']),
      ],
      leave='走回中山站，你經過好幾間剛剛沒進去的小店。'),

 dict(id='D07', name='國家人權博物館景美紀念園區', area='新北市', bg='d07_base_afternoon', open=[10, 17], closedWd=[1], weather='mixed', wishOf='heroine_01',
      transit=dict(legs=[dict(mode='mrt', text='捷運到大坪林站', minutes=10), dict(mode='walk', text='走到園區', minutes=10)], minutes=20, fareRound=50),
      rules=['週一休館：灰掉，寫「今天休館」',
             '以安的心願地點：自己去不會完成、也不會解鎖她的心願（AA_160 4-4）',
             '紀念園區：旁白不開玩笑；歷史只寫看得到的東西，不寫具體案件、人名、數字（D07.py 的基調）；名字的牆不引用任何文字'],
      arrive=['大坪林站走過來十分鐘。門口很安靜，圍牆裡的樹很大。',
              '景美的紀念園區。你在門口的說明牌前面停了一下才進去。',
              '紀念園區。今天來的人不多。'],
      walk=dict(point='D07.path', label='在園區的小路走', minutes=30, cost=0, times=2, lines=[
              '小路兩邊是大樹，有幾張長椅。一位志工在掃落葉，跟你點了一下頭。',
              '園區後面看得到河和橋。橋上的車很多，聲音傳到這裡已經很小。',
              '一群學生跟著導覽的人走過去，大家講話都很小聲。'],
              rain='下雨了。小路上沒有人，你沿著有屋簷的那一邊走。'),
      points=[
        dict(id='D07.court', label='法庭', minutes=30, cost=0, lines=[
              '法庭的門開著。審判席和被告席都還在，旁聽席只有幾排木頭長椅。你在最後一排坐了一下。',
              '你又坐在旁聽席最後一排。牆上的說明，這次你從頭讀到尾。']),
        dict(id='D07.cell', label='看守所的走廊', minutes=30, cost=0, lines=[
              '走廊很窄，一排一樣的門，窗開得很高。你走到底，再走回來，沒有幾步。',
              '走廊今天有一扇門開著。你在門口看了一下，沒有進去。']),
        dict(id='D07.wall', label='名字的牆', minutes=30, cost=0, lines=[
              '一整面牆都是名字，字很小。你從左邊開始看，看完一排，在牆前面站了很久。',
              '同一面牆。旁邊有一位老先生在找一個名字，找到以後用手指著，看了很久。']),
      ],
      leave='走回大坪林站。捷運上很多放學的高中生。'),

 dict(id='D08', name='臺北市立動物園', area='臺北市', bg='d08_base_morning', open=[9, 13], closedWd=[], weather='outdoor', admission=60,
      transit=dict(legs=[dict(mode='mrt', text='捷運到動物園站', minutes=35)], minutes=35, fareRound=60),
      rules=['門票 60，抵達時扣（AA_148：館內的互動點不再收錢）',
             '底圖是上午：只開到 13:00（AA_160 4-8 配合底圖）；之後補了下午的底圖再放寬',
             '下雨：長頸鹿區、遊園列車灰掉；貓熊館、企鵝館在室內，照常'],
      arrive=['動物園站，文湖線的終點。門口有很多推嬰兒車的家長，還有排隊的小學生。',
              '動物園。你買了票，直接往貓熊館走。',
              '動物園。你記得哪一條路是上坡。'],
      walk=dict(point=None, label='沿著園區的步道走', minutes=30, cost=0, times=2, lines=[
              '步道很長，兩邊都是樹。一台清潔車慢慢開過去，幾個小孩跟在後面跑。',
              '你走到無尾熊館外面，排隊的人太多，你直接走過去。',
              '路邊的指標寫著還有八百公尺。你算了一下，決定走到下一個休息區就好。'],
              rain='下雨了。步道上的人一下子少了一半，大家都往室內館跑。'),
      points=[
        dict(id='D08.panda', label='貓熊館', minutes=20, cost=0, lines=[
              '貓熊館前面排了一段隊。輪到你的時候，貓熊背對著大家在睡覺，你只看到一團黑白的背。',
              '這次貓熊醒著，坐在地上吃竹子。你站在玻璃前面看了五分鐘。']),
        dict(id='D08.penguin', label='企鵝館', minutes=20, cost=0, lines=[
              '企鵝館很冷。企鵝在岩石上站成一排，偶爾有一隻跳進水裡。',
              '你在企鵝館待到手有點冰。今天有一隻一直在玻璃前面游來游去。']),
        dict(id='D08.giraffe', label='長頸鹿與非洲動物區', minutes=20, cost=0, outdoor=True, lines=[
              '長頸鹿在草原的另一頭吃樹葉，離得很遠。旁邊的小孩一直問牠的脖子有多長。',
              '這次長頸鹿走到圍欄附近。你才看清楚牠的眼睛很大。']),
        dict(id='D08.train', label='坐遊園列車', minutes=15, cost=10, outdoor=True, lines=[
              '遊園列車十塊錢。你坐在最後一節，旁邊是一位帶孫子的阿嬤，孫子一路都在數動物。',
              '你又坐了一次列車。這次坐在第一節，看得到司機的背。']),
      ],
      leave='回程的捷運有一段在高架上，窗外都是山。'),

 dict(id='D10', name='碧潭', area='新北市', bg='d10_base_dusk', open=[15, 20], closedWd=[], weather='outdoor',
      transit=dict(legs=[dict(mode='mrt', text='捷運到新店站', minutes=20)], minutes=20, fareRound=50),
      rules=['下雨：天鵝船灰掉；吊橋、小吃攤照常'],
      arrive=['新店站，終點站。出站走幾步就是河，白色的吊橋就在前面。',
              '碧潭。你記得吊橋從哪一邊上去。',
              '碧潭。出站，過馬路，就是河。'],
      walk=dict(point='D10.walk', label='沿著河岸步道走', minutes=30, cost=0, times=2, lines=[
              '河岸步道很長。有人在慢跑，有人坐在台階上看河。',
              '對岸是一面很陡的山壁，上面長滿樹。有幾個人在河邊釣魚。',
              '步道邊有一排攤子在烤玉米，走了好一段都還聞得到。'],
              rain='下雨了。河面變成灰色，步道上只剩你和一個穿雨衣在跑步的人。'),
      points=[
        dict(id='D10.bridge', label='走碧潭吊橋', minutes=15, cost=0, lines=[
              '吊橋走起來會晃。中間有人停下來拍照，後面的人只能等。你走到對岸，又走回來。',
              '吊橋今天人比較少。你走到中間停了一下，往下看河。']),
        dict(id='D10.boat', label='踩天鵝船', minutes=30, cost=400, outdoor=True,
             costNote='一艘的錢。約會是兩人分（point_specs 200），一個人去就是整艘', lines=[
              '租船的阿姨問你幾個人，你說一個。她說一艘一樣是四百，給了你一件救生衣。你踩了半小時，腿很痠。',
              '你又租了一艘。這次你往橋下踩，那邊有影子，比較涼。']),
        dict(id='D10.snack', label='河邊的小吃攤', minutes=20, cost=60, lines=[
              '河邊的小吃攤，你買了一支烤玉米，邊走邊吃，手上都是醬。',
              '同一攤。你這次買了一碗豆花，坐在攤子旁邊的塑膠椅上吃。']),
      ],
      leave='回程從新店站上車，車上都有位子。你一路坐回公館。'),

 dict(id='D11', name='新北投溫泉區', area='臺北市', bg='d11_base_afternoon', open=[10, 17], closedWd=[], weather='mixed',
      transit=dict(legs=[dict(mode='mrt', text='捷運到北投站（中正紀念堂轉淡水信義線）', minutes=45), dict(mode='mrt', text='轉新北投支線', minutes=5)], minutes=50, fareRound=80),
      rules=['溫泉博物館週一休館：那一項灰掉，寫「今天休館」；其他照常',
             '不演泡湯，只有泡腳（D11.py 的分寸）'],
      arrive=['北投站換支線，只坐一站。一出新北投站，空氣裡就有一點硫磺的味道。',
              '新北投。你記得沿著公園往上走。',
              '新北投。出站以後，你直接往公園走。'],
      walk=dict(point=None, label='沿著北投公園走', minutes=30, cost=0, times=2, lines=[
              '公園裡有一條溫泉水流過的小溪，冒著白煙。一群觀光客在溪邊拍照。',
              '路邊的老旅館一間接一間，門口的牌子寫著泡湯的價錢。你走過去。',
              '有幾位阿公在亭子裡下棋，旁邊圍了三個人在看，沒有人說話。'],
              rain='下雨了。白煙和雨混在一起，整個公園霧霧的。'),
      points=[
        dict(id='D11.museum', label='溫泉博物館', minutes=30, cost=0, closedWd=[1], lines=[
              '溫泉博物館是一棟紅磚和木造的老房子。二樓是很大的榻榻米房間，要脫鞋才能進去。你坐了一下。',
              '一樓有一個很大的老浴池，現在沒有水，池底的磁磚還在。你在旁邊看了一下說明。']),
        dict(id='D11.valley', label='地熱谷', minutes=15, cost=0, lines=[
              '地熱谷整片都在冒煙，水是淡綠色的。欄杆上貼著告示，水很燙，不能碰。',
              '你又站在欄杆旁邊。今天的煙比較大，對面的人都看不太清楚。']),
        dict(id='D11.library', label='北投圖書館', minutes=30, cost=0, lines=[
              '圖書館是木頭蓋的，窗很大。你找了一個位子坐下來，看了半本雜誌。',
              '同一間圖書館。你這次帶了課本，讀了兩頁，就去翻架上的雜誌。']),
        dict(id='D11.footbath', label='溫泉旅館的泡腳池', minutes=30, cost=100, lines=[
              '旅館門口有一個泡腳池，一百塊。水很燙，你先放一隻腳，過了一下才放另一隻。',
              '這次你在泡腳池泡了二十分鐘，起來的時候腳是紅的。']),
      ],
      leave='回程在北投站換車。你的褲管還有一點硫磺的味道。'),

 dict(id='D14', name='淡水漁人碼頭', area='新北市', bg='d14_base_sunset', open=[15, 20], closedWd=[], weather='outdoor',
      transit=dict(legs=[dict(mode='mrt', text='捷運到淡水站（中正紀念堂轉淡水信義線）', minutes=55), dict(mode='bus', text='公車到漁人碼頭', minutes=15)], minutes=70, fareRound=120),
      rules=['下雨：渡輪、海風與夕陽灰掉；情人橋、木棧道照常（木棧道換雨天那一句）',
             '和 D13 淡水金色水岸同一趟：AA_160 第 4 節沒有寫自由出行一趟去兩個地方，第三批不做（待決）'],
      arrive=['淡水站轉公車，沿著河邊開了十幾分鐘。下車就是碼頭，風很大。',
              '漁人碼頭。你記得公車在哪裡下車。',
              '漁人碼頭。風還是一樣大。'],
      walk=dict(point='D14.boardwalk', label='沿著木棧道走', minutes=30, cost=0, times=2, lines=[
              '木棧道沿著河口，一邊停著小船。木板縫裡看得到下面的水。',
              '有人在棧道上擺了一整排釣竿，人坐在旁邊的小椅子上滑手機。',
              '一隻海鷗停在欄杆上。你走近，牠就飛到下一根。'],
              rain='下雨了。棧道很滑，你走在有欄杆的那一邊。'),
      points=[
        dict(id='D14.bridge', label='走情人橋', minutes=15, cost=0, lines=[
              '白色的橋，名字叫情人橋。橋上很多人一對一對在拍照。你走到中間，看了一下河口就下來了。',
              '你又走了一次情人橋。這次走到對面才回頭，看得到整個碼頭。']),
        dict(id='D14.ferry', label='坐渡輪到淡水再回來', minutes=30, cost=60, outdoor=True, lines=[
              '渡輪開得不快，引擎很吵。你坐在船尾，看碼頭慢慢變小。',
              '這次你坐在渡輪的船頭，風把頭髮吹得亂七八糟。']),
        dict(id='D14.sunset', label='海風與夕陽', minutes=30, cost=0, outdoor=True, sunset=True, lines=[
              '太陽落進海裡以前，碼頭上很多人拿起手機。你找了一段沒有人的欄杆靠著。',
              '今天雲比較多，太陽還沒落到海裡就看不到了。']),
      ],
      leave='回程先坐公車到淡水站。淡水是起點站，你一上車就有位子。'),

 # ───────── 新北：客運、公車 ─────────
 dict(id='D17', name='野柳地質公園', area='新北市', bg='d17_base_morning', open=[9, 13], closedWd=[], weather='outdoor', admission=120,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='coach', text='國道客運往金山', minutes=75)], minutes=90, fareRound=200),
      rules=['門票 120，抵達時扣',
             '底圖是上午：只開到 13:00',
             '下雨：海蝕平台灰掉；女王頭、蕈狀岩照常，步道換雨天那一句',
             '岩石不能碰、不能爬（園區規定；D17.py 照這個寫）'],
      arrive=['客運在野柳下車，再走一段路，就聞得到海的味道。',
              '野柳。你記得買了票，先往女王頭那邊走。',
              '野柳。下車以後，你直接走到入口買票。'],
      walk=dict(point='D17.trail', label='走海邊步道', minutes=30, cost=0, times=2, lines=[
              '步道沿著海岬往上爬，越走風越大。回頭看，整片岩石都在下面。',
              '步道盡頭有一座燈塔，再過去就沒有路了。你在最高的地方站了一下。',
              '步道上有一群阿伯走得很快，你被超過了兩次。'],
              rain='下雨了。步道上的石階很滑，你走到一半就回頭了。'),
      points=[
        dict(id='D17.queen', label='排隊看女王頭', minutes=20, cost=0, lines=[
              '女王頭前面排了很長的隊，只能在欄杆外面看。脖子那一段很細，旁邊的說明牌寫著它每年都在變細。',
              '女王頭前面還是在排隊。前面的人一直在拍照，你等了十分鐘才走到欄杆前面。']),
        dict(id='D17.mushroom', label='蕈狀岩區', minutes=20, cost=0, lines=[
              '一大片長得像香菇的石頭，大小都不一樣。廣播一直在提醒大家不要爬上去。',
              '你這次找到一顆比較小的，頂端圓圓的，下面很細。']),
        dict(id='D17.platform', label='海蝕平台', minutes=20, cost=0, outdoor=True, lines=[
              '平台上有很多小圓洞，裡面積著海水，有小螃蟹爬進爬出。靠海的地方畫了紅線，不能過去。',
              '你又走到紅線前面。今天的浪打得比較高，你往後退了兩步。']),
      ],
      leave='回程的客運開上高速公路，你一路睡到台北車站。'),

 dict(id='D19', name='金瓜石', area='新北市', bg='d19_base_morning', open=[9.5, 13], closedWd=[], weather='mixed', admission=80,
      transit=dict(legs=[dict(mode='mrt', text='捷運到忠孝復興站（中正紀念堂、東門轉車）', minutes=20), dict(mode='coach', text='客運往金瓜石（經過九份）', minutes=80)], minutes=100, fareRound=220),
      rules=['門票 80（黃金博物館園區），抵達時扣',
             '黃金博物館每月第一個週一休館：那一項灰掉，寫「今天休館」；其他照常',
             '底圖是上午（霧剛散）：只開到 13:00',
             '下雨：神社遺址（石階）、遠眺陰陽海灰掉；博物館照常，散步換雨天那一句',
             '和 D18 九份同一趟：第三批不做（同 D14）'],
      arrive=['客運過了九份還繼續往上開。在金瓜石下車，四周都是山，往下看得到海。',
              '金瓜石。你記得博物館在坡的上面。',
              '金瓜石。下車的人比九份少很多。'],
      walk=dict(point='D19.houses', label='在日式宿舍群之間走', minutes=30, cost=0, times=2, lines=[
              '黑瓦的木造平房一棟一棟排在坡上，木頭走廊擦得很亮。',
              '巷子很窄，石階一段一段往上。一隻貓睡在階梯中間，大家都從旁邊繞過去。',
              '有一間平房開放參觀，要脫鞋。你在榻榻米上坐了一下，外面是院子。'],
              rain='下雨了。石階和屋瓦都是濕的，你沿著屋簷走。'),
      points=[
        dict(id='D19.museum', label='黃金博物館', minutes=30, cost=0, closedMon1=True, lines=[
              '博物館裡有一塊很大的金磚，放在玻璃櫃裡，旁邊開了兩個洞可以伸手進去摸。你摸了一下，冰冰的。',
              '你又摸了一次金磚。旁邊的小孩一直問媽媽可不可以帶回家。']),
        dict(id='D19.shrine', label='爬到山上的神社遺址', minutes=40, cost=0, outdoor=True, lines=[
              '石階很陡，你爬到一半休息了兩次。上面只剩幾根石柱和石燈籠，往下看得到整片海。',
              '你又爬了一次。今天霧比較大，上面看不太到海。']),
        dict(id='D19.view', label='遠眺陰陽海', minutes=15, cost=0, outdoor=True, lines=[
              '觀景台往下看，海一半是黃色、一半是藍色。說明牌寫著是礦物的關係。',
              '今天的海，黃色那一半比上次少一點。']),
      ],
      leave='回程的客運沿著山路轉下去。你抓著扶手，一路都沒有睡。'),

 dict(id='D21', name='三峽老街', area='新北市', bg='d21_base_afternoon', open=[10, 17], closedWd=[], weather='mixed',
      transit=dict(legs=[dict(mode='mrt', text='捷運到永寧站（西門轉板南線）', minutes=40), dict(mode='bus', text='公車往三峽', minutes=30)], minutes=70, fareRound=120),
      rules=['下雨：拱橋灰掉；老街（騎樓）、祖師廟、藍染照常',
             '廟：尊重，不拿信仰開玩笑、不寫求籤；「修了幾十年」用「聽說」（D21.py 的分寸）'],
      arrive=['公車在三峽下車，走過一座拱橋，就是老街。整排紅磚的房子，騎樓是一個一個拱門。',
              '三峽。你記得老街在橋的那一邊。',
              '三峽。下了公車，你直接往橋那邊走。'],
      walk=dict(point=None, label='在老街和附近的巷子走', minutes=30, cost=0, times=2, lines=[
              '老街的房子正面都有雕花，每一間不太一樣。你一邊走一邊抬頭看。',
              '巷子裡有一間老店在賣木頭陀螺和竹蜻蜓。老闆坐在門口，手上在削一根竹子。',
              '一間店剛把一盤麵包放上架，門口馬上圍了五六個人。'],
              rain='下雨了。騎樓剛好擋得住雨，整條街的人都走在拱門下面。'),
      points=[
        dict(id='D21.street', label='老街的牛角麵包', minutes=30, cost=60, lines=[
              '好幾間店在賣牛角形狀的麵包。你挑了一間人比較少的，買了一個原味的，外面很脆，裡面有一點甜。',
              '同一間。你這次買了巧克力的，比原味的甜很多。']),
        dict(id='D21.temple', label='祖師廟', minutes=20, cost=0, lines=[
              '廟裡的柱子和屋頂都是雕刻，龍和花鳥刻得很細。來拜拜的人很多，你站在旁邊，沒有擋到人。',
              '你又來看了一次雕刻。聽說這間廟修了幾十年，到現在都還在修。']),
        dict(id='D21.dye', label='藍染體驗', minutes=40, cost=300, kind='fixed', lines=[
              '藍染的工作室。老師教你用橡皮筋把一條方巾綁起來，再泡進染缸。打開的時候，花紋和你想的不一樣。',
              '你又染了一條。這次綁得比較緊，白色的地方比較多。']),
        dict(id='D21.bridge', label='三峽拱橋', minutes=15, cost=0, outdoor=True, lines=[
              '紅磚的拱橋，橋下是溪。有人坐在溪邊的石頭上，腳泡在水裡。',
              '你又走到橋中間。溪水比上次混一點。']),
      ],
      leave='回程先坐公車到永寧站。公車很擠，你站了一路。'),

 # ───────── 外縣市：一日來回（4-2 算得過；約會系統 D28～D31 是兩天一夜，AA 確認，見 AA_161 5-2）─────────
 dict(id='D26', name='臺中草悟道與國立臺灣美術館', area='臺中市', bg='d26_base_golden', open=[14, 19], closedWd=[], weather='mixed', noExamWeek=True,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='hsr', text='高鐵到臺中站', minutes=60), dict(mode='bus', text='公車到草悟道', minutes=15)], minutes=90, fareRound=1600),
      rules=[EXAM, '美術館週一休館、每天 17:00 關門：那一項灰掉，寫「今天休館」「美術館關門了」；草悟道、小店照常',
             '下雨：市民廣場灰掉'],
      arrive=['高鐵一個小時就到臺中。轉公車進市區，下車的地方是一條很長的綠園道。',
              '臺中。你記得公車在哪一站下。',
              '臺中。出了高鐵站，你直接去等公車。'],
      walk=dict(point='D26.path', label='走草悟道', minutes=30, cost=0, times=2, lines=[
              '草悟道很寬，中間是草地和樹，兩邊是店。有人在草地上鋪野餐墊。',
              '一個街頭藝人在吹泡泡，泡泡飄到路中間，小孩在後面追。',
              '步道旁邊有一排賣手作的攤子。你在一攤賣木頭湯匙的前面站了一下。'],
              rain='下雨了。草地上的人都不見了，你沿著樹下走。'),
      points=[
        dict(id='D26.museum', label='國立臺灣美術館', minutes=40, cost=0, kind='fixed', closedWd=[1], until=17, lines=[
              '美術館外面的草地上有很多雕塑，其中一顆很大的金屬球，照得到你自己。館裡不用錢，你看了一個版畫的展。',
              '你又來看展。這次是攝影展，拍的都是海邊的漁村。']),
        dict(id='D26.village', label='審計新村的小店', minutes=30, cost=100, lines=[
              '審計新村是一排老宿舍，改成很多小店。你買了一杯檸檬飲料，在門口的階梯坐著喝。',
              '審計新村換了幾間店。你這次買了一張手寫的明信片。']),
        dict(id='D26.plaza', label='市民廣場', minutes=20, cost=0, outdoor=True, lines=[
              '市民廣場是一大片草地，天上有三只風箏。你坐在邊邊看了一會。',
              '同一片草地。今天沒有風箏，有兩個人在練習跳繩。']),
      ],
      leave='回程的高鐵人很多，你的位子在走道邊。'),

 dict(id='D27', name='嘉義檜意森活村', area='嘉義市', bg='d27_base_morning', open=[9, 13], closedWd=[], weather='mixed', noExamWeek=True,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='hsr', text='高鐵到嘉義站', minutes=75), dict(mode='bus', text='公車進市區', minutes=20)], minutes=110, fareRound=2200),
      rules=[EXAM, '底圖是上午：只開到 13:00；最晚 10:10 從公館出發（4-2：到了至少待 1 小時）',
             '下雨：散步換雨天那一句；其他照常（木屋有很深的屋簷）'],
      arrive=['嘉義的高鐵站在市區外面，轉公車又坐了二十分鐘。下車走一段，是一整片木頭的老宿舍。',
              '嘉義。下了公車，你知道要往哪邊走。',
              '嘉義。一下車，就聞得到木頭的味道。'],
      walk=dict(point='D27.rail', label='沿著舊鐵道走', minutes=30, cost=0, times=2, lines=[
              '舊鐵道旁邊停著一節紅色的老車廂，門關著。你從車窗往裡面看，座位是木頭的。',
              '鐵軌之間長了草。一位阿伯騎著腳踏車，從鐵道旁邊的小路過去。',
              '你沿著鐵軌走了一段。有幾根枕木換成新的，顏色比較淺。'],
              rain='下雨了。木屋的屋簷很深，你沿著屋簷走。'),
      points=[
        dict(id='D27.veranda', label='坐在木屋的長走廊', minutes=30, cost=0, lines=[
              '木屋外面有一條長長的走廊，可以坐。你脫了鞋，坐在走廊邊，腳懸在外面。',
              '同一條走廊。你這次坐到最裡面，比較安靜。']),
        dict(id='D27.shop', label='檜木小店', minutes=20, cost=0, lines=[
              '小店在賣檜木做的東西：筷子、杯墊、一小塊一小塊的木頭。你拿起一塊聞了一下，味道很重。',
              '你又拿起一塊聞了一下。店員說放在衣櫃裡，可以香很久。']),
        dict(id='D27.tree', label='院子的老樹', minutes=15, cost=0, lines=[
              '院子中間有一棵很大的老樹，樹下鋪著碎石。你在樹蔭下站了一下。',
              '同一棵樹。今天樹下有人在寫生，你從後面看了一眼，就走開了。']),
      ],
      leave='回程的高鐵很安靜。你一坐下就睡著，醒來已經到板橋。'),

 dict(id='D28', name='臺南國立臺灣文學館與安平', area='臺南市', bg='d28a_base_day', bases=dict(a='d28a_base_day', b='d28b_base_sunset'),
      open=[10, 19], closedWd=[], weather='mixed', noExamWeek=True,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='hsr', text='高鐵到臺南站', minutes=100), dict(mode='bus', text='公車進市區', minutes=20)], minutes=135, fareRound=2800),
      move=dict(fromBase='a', toBase='b', mode='bus', label='坐公車去安平', minutes=20, cost=0, lines=[
              '公車開了二十分鐘。下車的地方，巷子變得很窄，牆是紅磚的。',
              '你又坐了一次往安平的公車。這次你知道在哪一站下。']),
      rules=[EXAM,
             '兩張底圖（D28_coords.json 的 base）：a＝文學館和圓環（白天），b＝安平老巷和海堤（夕陽）。抵達時在 a；16:00 以後才抵達，直接在 b（交通卡多一段「公車到安平」，時間照 move 加）',
             '「坐公車去安平」（move）：a 換到 b，只能去一次、不回 a；車資含在來回車資裡。回程從哪一張出發都一樣是 135 分',
             '文學館週一休館、每天 17:00 關門：那一項灰掉',
             '下雨：海堤的夕陽灰掉；老巷照常'],
      arrive=['臺南的高鐵站在市區外面，轉公車進城。下車的圓環旁邊是一棟有圓頂的老建築，就是文學館。',
              '臺南。你記得文學館在圓環旁邊。',
              '臺南。下了公車，你先去圓環。'],
      walk=dict(point='D28.circle', base='a', label='在圓環附近走', minutes=30, cost=0, times=2, lines=[
              '圓環附近的騎樓下，有人在賣豆花，有人在修機車。',
              '圓環的綠地有幾張木頭長椅，坐著幾個在等公車的人。',
              '一條小巷子裡有一間很小的廟，香爐前面擺著一盤水果。'],
              rain='下雨了。你在圓環邊的騎樓下面走，一間店接著一間店。'),
      points=[
        dict(id='D28.museum', base='a', label='文學館的大廳', minutes=30, cost=0, closedWd=[1], until=17, lines=[
              '文學館的大廳很高，上面是圓頂。地上的磁磚很舊，走起來有聲音。你看了一個關於老雜誌的展。',
              '大廳的角落有一排手寫的稿子，字很小。你一張一張看過去。']),
        dict(id='D28.alley', base='b', label='安平老巷的小吃', minutes=30, cost=60, lines=[
              '安平的巷子很窄，紅磚牆上爬滿藤。你買了一條蝦捲，站在巷口吃，很燙。',
              '你又走進那條巷子，買了一碗魚丸湯，坐在老榕樹下吃。']),
        dict(id='D28.sunset', base='b', label='海堤的夕陽', minutes=30, cost=0, outdoor=True, sunset=True, lines=[
              '海堤的欄杆被曬得很熱。太陽慢慢落到港口的起重機後面，海面一片金色。',
              '你站在上次那一段欄杆。旁邊有一個人在釣魚。']),
      ],
      leave='回程的高鐵上，你把今天拍的照片看了一遍。'),

 dict(id='D29', name='高雄駁二藝術特區', area='高雄市', bg='d29_base_afternoon', open=[11, 17.5], closedWd=[], weather='mixed', noExamWeek=True,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='hsr', text='高鐵到左營站', minutes=90), dict(mode='mrt', text='轉高雄捷運到鹽埕埔站', minutes=20)], minutes=125, fareRound=3000),
      rules=[EXAM, '下雨：舊鐵道的草地、戶外雕塑灰掉；展間照常，步道換雨天那一句'],
      arrive=['左營下了高鐵，轉高雄的捷運到鹽埕埔站。走出去，一整排紅磚的大倉庫就在港邊。',
              '高雄。你記得在鹽埕埔站下車。',
              '駁二。倉庫的鐵門今天全開著。'],
      walk=dict(point='D29.harbor', label='走港邊的步道', minutes=30, cost=0, times=2, lines=[
              '港邊的步道很寬，有人騎腳踏車，有人坐在長椅上看船。',
              '對面停著一艘貨輪，岸邊的起重機很高，一直沒有動。',
              '一艘小渡輪從對岸開過來，船上的人都站在船頭。'],
              rain='下雨了。你沿著倉庫的屋簷走，雨打在鐵皮屋頂上，很大聲。'),
      points=[
        dict(id='D29.warehouse', label='倉庫改的展間', minutes=30, cost=0, lines=[
              '倉庫裡面很高，牆刷成白色，掛著幾幅很大的抽象畫。冷氣開得很強。',
              '換了一檔，是學生的作品展，很多是用回收的東西做的。']),
        dict(id='D29.sculpture', label='巨大的戶外雕塑', minutes=15, cost=0, outdoor=True, lines=[
              '草地上有一個很大的雕塑，斜斜的鐵板和一顆金屬球。幾個小孩在旁邊繞圈圈。',
              '你又繞了雕塑一圈。從另一邊看，它像一艘翻過來的船。']),
        dict(id='D29.rail', label='舊鐵道的草地', minutes=20, cost=0, outdoor=True, lines=[
              '兩條舊鐵軌穿過草地，已經沒有火車了。你沿著其中一條走，走得歪歪的。',
              '同一片草地。有一家人坐在鐵軌上野餐。']),
      ],
      leave='回程在左營上高鐵。車廂裡很多人在吃便當，你也有點餓了。'),

 dict(id='D30', name='花蓮七星潭', area='花蓮縣', bg='d30_base_dusk', open=[15.5, 19.5], closedWd=[], weather='outdoor', noExamWeek=True,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='rail', text='火車到花蓮站', minutes=100), dict(mode='bus', text='公車到七星潭', minutes=15)], minutes=130, fareRound=900),
      rules=[EXAM, '最晚 19:30 要離開：回花蓮站的公車和回台北的火車班次少，回到公館約 21:40',
             '看第一顆星（afterSunset）：日落後 10 分到日落後 60 分才能選（底圖右上的那一顆星；BB_132 第 36 組）',
             '下雨：浪邊、自行車道、看星星灰掉；小攤照常，散步換雨天那一句'],
      arrive=['火車過了宜蘭以後，窗外一邊是山，一邊是海。到花蓮站轉公車，下車的地方是一整片灰白色的石頭海灘。',
              '七星潭。你記得公車站在哪裡。',
              '七星潭。下了公車，你先走到海邊。'],
      walk=dict(point=None, label='沿著海邊的路走', minutes=30, cost=0, times=2, lines=[
              '海邊的路很長，一邊是海，一邊是山。山很高，山腳下就是海。',
              '海岸公路上的車不多，偶爾有一台遊覽車開過去。',
              '有幾個人坐在石頭上，什麼都沒做，就是看海。你也坐了一下。'],
              rain='下雨了。海變成灰色，你走到小攤的雨棚下面。'),
      points=[
        dict(id='D30.pebble', label='礫石海灘的浪邊', minutes=30, cost=0, outdoor=True, lines=[
              '海灘上都是圓圓的石頭，沒有沙。浪退回去的時候，石頭被拖著滾，聲音嘩啦嘩啦。',
              '你又走到浪邊。今天浪比較大，你站得離水遠一點。']),
        dict(id='D30.bike', label='租腳踏車騎海岸自行車道', minutes=40, cost=100, outdoor=True, lines=[
              '你租了一台腳踏車，沿著海邊的車道騎。去的時候逆風，騎回來輕鬆很多。',
              '這次你騎得比較遠，到一座小橋才回頭。']),
        dict(id='D30.stars', label='看第一顆星', minutes=20, cost=0, outdoor=True, afterSunset=True,
             costNote='約會是兩天一夜的晚上（point_specs 40 分）；一個人當天來回，只看天黑以前的第一顆星，20 分', lines=[
              '天從橘色變成深藍。你在欄杆邊等，等到天上出現第一顆星。',
              '你又在同一個地方等。今天雲比較多，等得比較久。']),
        dict(id='D30.stall', label='海邊的小攤', minutes=20, cost=60, lines=[
              '海邊有一個木頭小攤，亮著一盞燈。你買了一份炸花枝丸，坐在旁邊的木頭椅子上吃。',
              '同一個小攤。你這次點了一杯冬瓜茶。']),
      ],
      leave='回台北的火車上，大部分的人都在睡。你醒來的時候，窗外已經是宜蘭的平原。'),

 dict(id='D31', name='南投日月潭', area='南投縣', bg='d31_base_morning', open=[9, 13], closedWd=[], weather='outdoor', noExamWeek=True,
      transit=dict(legs=[dict(mode='mrt', text='捷運到台北車站', minutes=15), dict(mode='hsr', text='高鐵到臺中站', minutes=60), dict(mode='coach', text='客運往日月潭', minutes=75)], minutes=150, fareRound=1800),
      rules=[EXAM, '底圖是早上：只開到 13:00；最晚 09:30 從公館出發（4-2：到了至少待 1 小時）。沒有課的日子 07:30 醒來（S.bedOptions），07:30 出發 10:00 到',
             '下雨：遊湖船、纜車灰掉；茶葉蛋攤照常，步道換雨天那一句',
             '和 D32 清境同一趟：第三批不做（D32 要開車，見不收的表）'],
      arrive=['客運從臺中開了一個多小時，越開越往山裡。下車的地方就是湖，湖面上還有一點霧。',
              '日月潭。你記得碼頭在步道的那一頭。',
              '日月潭。下了客運，你先走到湖邊。'],
      walk=dict(point='D31.trail', label='走湖邊步道', minutes=30, cost=0, times=2, lines=[
              '湖邊的木棧道貼著水面。早上的人不多，有人在步道上跑步。',
              '湖的四周都是山，一層一層，越遠的顏色越淡。',
              '步道邊有一棵樹往湖面斜過去，幾個人在樹下輪流拍照。'],
              rain='下雨了。湖面和山都變成灰色，你在有屋頂的那一段棧道等了一下。'),
      points=[
        dict(id='D31.pier', label='坐遊湖船', minutes=40, cost=300, outdoor=True, lines=[
              '遊湖船繞湖一圈，停了兩個碼頭。你坐在窗邊，廣播在介紹湖邊的山。',
              '你又坐了一次船。這次坐在外面的甲板，衣服被水花噴濕了一點。']),
        dict(id='D31.ropeway', label='坐山上的纜車', minutes=40, cost=300, outdoor=True, lines=[
              '纜車從湖邊往山上爬，往下看，整個湖都在腳下。車廂裡只有你一個人。',
              '這次纜車上和一家四口同一個車廂，小孩一直貼著窗戶。']),
        dict(id='D31.egg', label='湖邊的茶葉蛋', minutes=15, cost=10, lines=[
              '路邊的攤子有一口大鍋在煮茶葉蛋，很遠就聞得到。你買了一顆，剝殼的時候燙到手。',
              '同一攤。你這次買了兩顆，一顆留著在客運上吃。']),
      ],
      leave='回程的客運在山路上轉了很多彎，你有一點暈車。'),
]

# 不收的（第三批）：全部是只有開車到得了。AA_160 第 4 節只寫了「從公館站出發」（4-1），沒有一個人開車出行的規則 → 待決，不自己發明。
NOT_INCLUDED = [
  dict(id='D15', name='陽明山夜景', why='只有開車（needsCar）；AA_160 第 4 節沒有一個人開車自由出行的規則 → 待決。另外是學姊的心願地點（自己去不解鎖）、晚上的地點（d15_base_night）'),
  dict(id='D16', name='北海岸兜風（白沙灣、富貴角）', why='只有開車（needsCar）→ 待決。互動點 D16.drive「沿海公路（車上）」本身就是開車'),
  dict(id='D22', name='石門水庫', why='只有開車（needsCar）→ 待決'),
  dict(id='D23', name='桃園竹圍漁港', why='只有開車（needsCar）→ 待決'),
  dict(id='D32', name='南投清境農場', why='只有開車（needsCar，單程 210 分）→ 待決；約會系統也只有兩天一夜。若之後定了開車規則，還要再算 4-2（取車 30 分＋210 分；D32.cloud 雲海是清晨＝兩天一夜的第二天，一個人當天來回看不到）'),
]

SUNSET_NOTE = '日落時刻沿用 spots_v1.json 的 rules.sunsetTable（臺北）；臺南、花蓮差十幾分鐘，遊戲不分'

RULES_V3 = dict(
  _comment='第三批多的欄位（AA-C 2026-10-17）。沒寫到的照 spots_v1.json 的 rules。',
  transit='每一處都用 legs（第二批的格式）：每一段一行、一個圖示；mode：mrt 捷運、bus 公車、coach 客運、rail 火車、hsr 高鐵、walk 步行（D07 出站以後走 10 分）。minutes＝各段加總＝date_locations 的單程；fareRound＝date_locations 大眾運輸那一個的 fare（有開車選項的，自由出行只用大眾運輸）。',
  admission='spot.admission：門票（date_locations 的 admission：D08 60、D17 120、D19 80），抵達時扣一次，館內的互動點不再收錢（AA_148 第 1 節）。出發前的「錢不夠」要算車資＋門票。',
  fixed="spot.fixed：不在互動點上的固定段落（D05 看電影，沒有熱點）；選單上寫時間和票價，lines 照第幾次來用。point 的 kind:'fixed' 照第一批。",
  pointHours='point.until：這一項自己的關門時間（時）；point.closedWd：這一項自己的休館日（0＝週日、1＝週一）；point.closedMon1：每月第一個週一休。灰掉寫「今天休館」「○○關門了」。spot.closedWd 是整個地點休（D07 週一）。',
  days='point.days：只在這幾天有（D01 市集 [6,0]＝週六、週日）；其他天灰掉寫「市集只有週末」。',
  afterSunset='point.afterSunset：日落後 10 分到日落後 60 分才能選（D30 看第一顆星）；之前寫「天還沒黑」，之後寫「已經全黑了」。',
  bgRain='spot.bgRain：下雨時換的底圖（D02 雨後版）。',
  bases='spot.bases＋point.base＋walk.base＋spot.move：D28 有兩張底圖（文學館白天 a、安平夕陽 b，座標在 D28_coords.json 各自的 base）。move 是選單上的一項，做了就換底圖，只能 a → b 一次；細節見 D28 的 rules。',
  noExamWeek='spot.noExamWeek：考試週（期中練習週、期末考週）灰掉，寫「考試週」（第二批 D24、D25 同一條；外縣市都加）。',
  wishOf='spot.wishOf：心願地點（D03 子晴、D05 芷若、D07 以安）。自己去不完成、不解鎖心願（AA_160 4-4）；只記 G.places.free。',
  costNote='point.costNote：一個人去和約會（point_specs.json）不一樣的地方。',
  feasibility='出發選單的「現在去，到了就關了」「太晚了，回不來」照 AA_160 4-2：到達時間 ≤ open[1] − 1 小時，而且 open[1] ＋ 單程 ≤ 24:00（本檔每一處都成立，--check 會算）。外縣市的最晚出發時間寫在 AA_161 5-2。',
  sunsetNote=SUNSET_NOTE,
  encounter='第三批的地點還沒有偶遇表：散步後照 AA_160 第 5 節檢查，表是空的就不會遇到人（5-1、5-6 的規則不變）。偶遇表、「你來過一次」（solo_before）、心願事件的 freeVisited，見 AA_161 5-5 的後續。',
)

# ───────── 檢查 ─────────
NAMES = ['以安', '小安', '語彤', '芷若', '子晴', '學姊', '書瑀', '沛珊', '可昕', '阿哲', '小語', '柏翰', '芯慈', '阿凱', '明軒', '奕廷', '所長', '祐廷']
BRANDS = ['7-11', '全家', '星巴克', '麥當勞', '悠遊卡', '國光', '誠品', '金牛角', '三創', '光點', '統一', '摩斯', '肯德基', '台灣大哥大', '中華電信']
WARN_WORDS = ['原來', '才發現', '才明白', '第一次覺得', '好像在', '我想', '人生', '回憶', '時間好像', '這就是', '蟬', '楓紅', '櫻花', '夏天', '冬天', '春天', '秋天']


def all_text(s):
    t = list(s['arrive']) + list(s['walk']['lines']) + [s['walk'].get('rain', ''), s['leave']]
    for p in s['points']: t += p['lines']
    if s.get('fixed'): t += s['fixed']['lines']
    if s.get('move'): t += s['move']['lines']
    return [x for x in t if x]


def check():
    locs = {l['id']: l for l in json.load(open(os.path.join(DS, 'date_locations.json'), encoding='utf-8'))['locations']}
    specs = json.load(open(os.path.join(DS, 'point_specs.json'), encoding='utf-8'))['points']
    done = set()
    for f in ('spots_v1.json', 'spots_v2.json'):
        for s in json.load(open(os.path.join(HERE, f), encoding='utf-8'))['spots']: done.add(s['id'])
    errs, warns, feas = [], [], []
    ids = [s['id'] for s in SPOTS] + [n['id'] for n in NOT_INCLUDED]
    want = sorted(set(locs) - done)
    if sorted(ids) != want: errs.append('範圍不對：%s vs %s' % (sorted(ids), want))
    if len(set(ids)) != len(ids): errs.append('重複的 id')
    for n in NOT_INCLUDED:
        if not locs[n['id']]['needsCar']: errs.append('%s 不是 needsCar，不收要另外說理由' % n['id'])
    for s in SPOTS:
        L, sid = locs[s['id']], s['id']
        if L['needsCar']: errs.append('%s needsCar 卻收了' % sid)
        pub = [t for t in L['transport'] if t['mode'] != 'car']
        if len(pub) != 1: errs.append('%s 大眾運輸不是一個' % sid); continue
        T = s['transit']
        if sum(l['minutes'] for l in T['legs']) != T['minutes'] or T['minutes'] != pub[0]['minutes']: errs.append('%s 交通分鐘和 date_locations 不同' % sid)
        if T['fareRound'] != pub[0]['fare']: errs.append('%s 車資和 date_locations 不同' % sid)
        if s.get('admission', 0) != L['admission']: errs.append('%s 門票和 date_locations 不同' % sid)
        if (L['closed'] == 'mon') != (s['closedWd'] == [1]): errs.append('%s 整個地點的休館日不對' % sid)
        pts = [p for p in s['points']]
        if L['closed'] == 'mon_museum' and not any(p.get('closedWd') == [1] for p in pts): errs.append('%s 館內週一休沒標' % sid)
        if L['closed'] == 'mon1_museum' and not any(p.get('closedMon1') for p in pts): errs.append('%s 每月第一個週一休沒標' % sid)
        if (L['wishOf'] or None) != s.get('wishOf'): errs.append('%s wishOf 不對' % sid)
        if L['weather'] != s['weather']: errs.append('%s weather 不對' % sid)
        dl = json.load(open(os.path.join(DS, 'lines', sid + '.json'), encoding='utf-8'))['points']
        co = json.load(open(os.path.join(DS, 'art', sid + '_coords.json'), encoding='utf-8'))
        hs = {h['id']: h for h in co['hotspots']}
        used = [p['id'] for p in pts] + ([s['walk']['point']] if s['walk']['point'] else [])
        if sorted(used) != sorted(dl): errs.append('%s 互動點和約會系統不同：%s vs %s' % (sid, sorted(used), sorted(dl)))
        if set(dl) != set(hs): errs.append('%s Dxx.json 和 coords 不同' % sid)
        bgs = [s['bg']] + list((s.get('bases') or {}).values()) + ([s['bgRain']] if s.get('bgRain') else [])
        for b in bgs:
            if not os.path.exists(os.path.join(DS, 'art', b + '.webp')): errs.append('%s 底圖不存在 %s' % (sid, b))
        if s.get('bases'):
            inv = {v + '.webp': k for k, v in s['bases'].items()}
            if set(inv) != set(co['bases'].values()): errs.append('%s bases 和 coords 不同' % sid)
            for p in pts + [dict(id=s['walk']['point'], base=s['walk'].get('base'))]:
                if hs[p['id']].get('base') != p.get('base'): errs.append('%s %s 的 base 和 coords 不同' % (sid, p['id']))
        for p in pts:
            sp = specs[p['id']]
            if p['minutes'] != sp['min'] and not p.get('costNote'): warns.append('%s 時間和 point_specs 不同（%s vs %s）' % (p['id'], p['minutes'], sp['min']))
            if p['cost'] != sp['cost'] and not p.get('costNote'): warns.append('%s 花費和 point_specs 不同（%s vs %s）' % (p['id'], p['cost'], sp['cost']))
            if len(p['lines']) < 2: errs.append('%s 台詞少於兩句' % p['id'])
        if len(s['arrive']) != 3: errs.append('%s arrive 要三句' % sid)
        if len(s['walk']['lines']) < 3: errs.append('%s 散步池少於三句' % sid)
        if s['weather'] != 'indoor' and not s['walk'].get('rain'): errs.append('%s 不是室內，散步要有 rain 那一句' % sid)
        for x in all_text(s):
            for w in NAMES:
                if w in x: errs.append('%s 出現人物名字「%s」：%s' % (sid, w, x))
            for w in BRANDS:
                if w in x: errs.append('%s 出現品牌「%s」：%s' % (sid, w, x))
            for w in WARN_WORDS:
                if w in x: warns.append('%s 留意「%s」：%s' % (sid, w, x))
            if x.count('……') > 0: warns.append('%s 有省略號：%s' % (sid, x))
        # AA_160 4-2：最早 07:30 出發（沒有課的日子 S.bedOptions 07:30 醒），到了至少待 1 小時，回到公館 ≤ 24:00
        m = T['minutes'] / 60
        o0, o1 = s['open']
        arr_lo, arr_hi = max(o0, 7.5 + m), o1 - 1
        back = o1 + m
        ok = arr_lo <= arr_hi and back <= 24
        if not ok: errs.append('%s 4-2 不成立' % sid)
        feas.append((sid, s['name'], T['minutes'], arr_lo - m, arr_hi - m, back))
    return errs, warns, feas


def hm(h):
    return '%02d:%02d' % (int(h), round((h - int(h)) * 60))


def md():
    out = []
    W = {0: '週日', 1: '週一', 6: '週六'}
    for s in SPOTS:
        T = s['transit']
        out.append('#### %s %s' % (s['id'], s['name']))
        out.append('')
        legs = ' → '.join('%s（%d 分）' % (l['text'], l['minutes']) for l in T['legs'])
        out.append('- 交通：%s；來回 %d 元%s。開放 %s～%s%s。底圖 `%s`%s。' % (
            legs, T['fareRound'], '；門票 %d（抵達時扣）' % s['admission'] if s.get('admission') else '',
            hm(s['open'][0]), hm(s['open'][1]), '，週一休館' if s['closedWd'] == [1] else '',
            s['bg'] if not s.get('bases') else s['bases']['a'] + '`／`' + s['bases']['b'],
            '（下雨 `%s`）' % s['bgRain'] if s.get('bgRain') else ''))
        for r in s.get('rules', []): out.append('- %s' % r)
        out.append('- 抵達：①%s ②%s ③%s' % tuple(s['arrive']))
        w = s['walk']
        out.append('- 散步「%s」（%s，30 分，一趟兩次）：' % (w['label'], '`%s`' % w['point'] if w['point'] else '沒有熱點'))
        for x in w['lines']: out.append('  - %s' % x)
        if w.get('rain'): out.append('  - 下雨：%s' % w['rain'])
        if s.get('fixed'):
            f = s['fixed']
            out.append('- 「%s」（固定段落，%d 分、%d 元）：' % (f['label'], f['minutes'], f['cost']))
            for i, x in enumerate(f['lines']): out.append('  - %s：%s' % (['第一次', '第二次', '第三次以後'][i], x))
        for p in s['points']:
            tags = []
            if p.get('base'): tags.append('底圖 %s' % p['base'])
            if p.get('outdoor'): tags.append('戶外')
            if p.get('sunset'): tags.append('夕陽')
            if p.get('afterSunset'): tags.append('日落後')
            if p.get('photo'): tags.append('拍照')
            if p.get('kind') == 'fixed': tags.append('固定')
            if p.get('days'): tags.append('只有' + '、'.join(W[d] for d in p['days']))
            if p.get('closedWd'): tags.append('週一休')
            if p.get('closedMon1'): tags.append('每月第一個週一休')
            if p.get('until'): tags.append('%s 關門' % hm(p['until']))
            out.append('- 「%s」`%s`（%d 分、%d 元%s）：' % (p['label'], p['id'], p['minutes'], p['cost'], '；' + '、'.join(tags) if tags else ''))
            if p.get('costNote'): out.append('  - （%s）' % p['costNote'])
            for i, x in enumerate(p['lines']): out.append('  - %s：%s' % (['第一次', '第二次以後'][i], x))
        if s.get('move'):
            mv = s['move']
            out.append('- 「%s」（%d 分；a → b）：' % (mv['label'], mv['minutes']))
            for i, x in enumerate(mv['lines']): out.append('  - %s：%s' % (['第一次', '第二次以後'][i], x))
        out.append('- 離開：%s' % s['leave'])
        out.append('')
    return '\n'.join(out)


if __name__ == '__main__':
    errs, warns, feas = check()
    if '--md' in sys.argv:
        print(md()); sys.exit(0)
    for f in feas:
        print('4-2 %s %-14s 單程 %3d 分　出發 %s～%s　最晚回到公館 %s' % (f[0], f[1], f[2], hm(f[3]), hm(f[4]), hm(f[5])))
    for w in warns: print('WARN', w)
    for e in errs: print('ERR ', e)
    if errs: sys.exit(1)
    if '--check' not in sys.argv:
        json.dump(dict(batch=3, inheritsRules='spots_v1.json', rulesV3=RULES_V3, spots=SPOTS, notIncluded=NOT_INCLUDED),
                  open(os.path.join(HERE, 'spots_v3.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print('ok', len(SPOTS), 'spots', sum(len(s['points']) for s in SPOTS), 'points；不收', len(NOT_INCLUDED))
