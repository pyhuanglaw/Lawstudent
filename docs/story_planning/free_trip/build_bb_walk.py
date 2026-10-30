# -*- coding: utf-8 -*-
"""BB_147（AB-18）的資料檔：BB 五位「一起走一段」、重訪旁白、兩條小支線。
欄位照 AA-B 2026-10-16 定的格式（AA_160 第 6 節）：
  一起走一段：{who, spot, act, friend:[…], dating:[…]}；離開那一句另放 leave。
  重訪：{who, spot, normal, afterBreakup}
  支線：{id, who, spot, steps:[{step, cond, lines, mem}]}
act 用 free_trip/spots_v1.json 的 'walk'（散步）或 points 的 id（例如 D04.redhouse）。
用法：python3 build_bb_walk.py  →  bb_walk_v1.json；加 --check 只檢查。
台詞以本檔為準；BB_147 的表格是給人看的。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SPOTS = json.load(open(os.path.join(HERE, 'spots_v1.json'), encoding='utf-8'))['spots']
SPOTS += json.load(open(os.path.join(HERE, 'spots_v2.json'), encoding='utf-8'))['spots']  # 第二批（AB-23，BB_150）
SPOTS += json.load(open(os.path.join(HERE, 'spots_v3.json'), encoding='utf-8'))['spots']  # 第三批（BB_213）
ACTS = {s['id']: {'walk'} | {p['id'] for p in s['points']} | ({s['walk']['point']} if isinstance(s.get('walk'), dict) and s['walk'].get('point') else set()) for s in SPOTS}
WHO = {'heroine_02', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin'}
BAN = ['不要跟別人講', '不要跟別人說', '你是第一個', '我請你', '我可以問一個奇怪的問題嗎', '兩張票', '存檔', '脖子還是很短', '香菜', '剛好坐兩個人']

def w(who, spot, act, friend, dating, cond=None):
    e = {'who': who, 'spot': spot, 'act': act, 'friend': friend, 'dating': dating}
    if cond: e['cond'] = cond
    return e

WALK = [
    # 芷若 D04（散場以後 19:30 起；朋友以上）
    w('heroine_02', 'D04', 'walk', ['散場的人都走得比較慢。……大家還在電影裡。'], ['你走慢一點。我還在最後一幕。'], cond={'from': 19.5}),
    w('heroine_02', 'D04', 'D04.redhouse', ['紅磚在晚上比較好看。白天太用力了。'], ['你拍我做什麼。……拍樓。'], cond={'from': 19.5}),
    w('heroine_02', 'D04', 'D04.snack', ['看完電影要吃熱的。我每次都這樣。'], ['站著吃剛好。……你吃得比我快，等我。'], cond={'from': 19.5}),
    # 子晴 D04（大型電玩店，週六 18～21）
    w('heroine_04', 'D04', 'walk', ['你走好快。我剛打完，手還在抖。'], ['左手給你。右手是我的命，要留著打歌。']),
    w('heroine_04', 'D04', 'D04.redhouse', ['這種老房子畫起來很好看。……窗戶很難畫。'], ['這個角度我記起來了。回去畫。']),
    w('heroine_04', 'D04', 'D04.snack', ['好燙。欸不是，你為什麼可以直接吃。'], ['你幫我吹一下。……不是撒嬌，是真的燙。']),
    # 子晴 D12（單週週日 16～19）
    w('heroine_04', 'D12', 'walk', ['每一間都很像，可是都不一樣。做場景的人會哭。'], ['你走前面。我想看你走在這條街上。……參考用。']),
    w('heroine_04', 'D12', 'D12.tea', ['我不懂茶。……可是這個罐子的顏色我要記起來。'], ['你先喝，跟我說苦不苦。我再決定要不要喝。']),
    w('heroine_04', 'D12', 'D12.pier', ['這邊的風剛好。程式碼想不出來的時候，就來吹。'], ['你坐這邊。我的筆電借你擋風。']),
    w('heroine_04', 'D12', 'D12.sunset', ['這個光，我調了三天都調不出來。'], ['不要說話。……我在記這個顏色。']),
    # 學姊 D06（週日 13～16；朋友以上）
    w('heroine_05', 'D06', 'walk', ['我排的時間還有四十分鐘。走一圈剛好。'], ['今天的計畫只有一行：來美術館。剩下的，跟你走。']),
    w('heroine_05', 'D06', 'D06.gallery', ['這一間燈很暗，畫要站近一點看。'], ['你看你的。看完來找我，我在最後一間。']),
    w('heroine_05', 'D06', 'D06.frame', ['站進去。……不，我不拍。我只是想看看。'], ['換我站。……你看到什麼？不用說，我知道。']),
    w('heroine_05', 'D06', 'D06.cafe', ['美術館的咖啡比較貴。我把它算進門票了。'], ['這杯算我的。不在計畫裡。是我想。']),
    # 沛珊 D12（大一、大二上的週六 15～18）
    w('classmate_peishan', 'D12', 'walk', ['這條街好像繪本的插圖。一頁一頁翻過去。'], ['你幫我拿書。……我想空出一隻手。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    w('classmate_peishan', 'D12', 'D12.tea', ['這個味道，好像下雨前的舊書店。'], ['你喝一口，告訴我是什麼味道。我想寫下來。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    w('classmate_peishan', 'D12', 'D12.pier', ['我小時候以為，河對面就是另一個國家。'], ['我讀一頁給你聽。……只讀一頁，風太大了。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    w('classmate_peishan', 'D12', 'D12.sunset', ['今天的天空，可以畫成封面。'], ['你不要看我。看夕陽。……好，可以看一下。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    # 沛珊 D06（大三起的週日 09:30～12；心願事件以後；不選空畫框）
    w('classmate_peishan', 'D06', 'walk', ['小孩子在草地上都用跑的。大人都忘了。'], ['你跑一下給我看好不好！……我想看。'], cond={'terms': ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']}),
    w('classmate_peishan', 'D06', 'D06.gallery', ['小孩看畫，先看最大的顏色。我在學他們。'], ['我們今天只看三幅。看慢一點。'], cond={'terms': ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']}),
    w('classmate_peishan', 'D06', 'D06.cafe', ['十一點半以前，我得去書店顧童書區。'], ['你下午來書店嗎？……不來也沒關係，我挑一本書等你。'], cond={'terms': ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']}),
    # 可昕 D13（週日 16:30～19；只在交往中）
    w('kexin', 'D13', 'walk', [], ['假設我們一直走，走到出海口，要走多久？……你算，我聽。']),
    w('kexin', 'D13', 'D13.drink', [], ['一杯就好，兩根吸管。……你不要喝太大口。']),
    w('kexin', 'D13', 'D13.rail', [], ['予樂說我們很吵。我們明明都沒講話。']),
    w('kexin', 'D13', 'D13.bench', [], ['這張長椅看夕陽的效用最大。……我查過了。']),
    w('kexin', 'D13', 'D13.photo', [], ['太陽下去的速度，每次都比我想的快。']),
    # 可昕 D04（週六 18:30～21，和予樂；只在交往中）
    w('kexin', 'D04', 'walk', [], ['予樂說她不想當電燈泡。她剛剛真的用了這個詞。']),
    w('kexin', 'D04', 'D04.lobby', [], ['你選。我選的話，會選最便宜的那一場。']),
    w('kexin', 'D04', 'D04.redhouse', [], ['這棟比木柵大學所有的樓都老。……我猜的，沒查。']),
    w('kexin', 'D04', 'D04.snack', [], ['你吃一口我的。……經濟學說這叫交換。']),
]

LEAVE = [
    {'who': 'heroine_02', 'spot': 'D04', 'friend': '我搭車回去了。今天的片，下次在 Café 說。', 'dating': '到家傳訊息給我。……我也會傳。'},
    {'who': 'heroine_04', 'spot': 'D04', 'friend': '我回去了。今天的分數，我截圖了。', 'dating': '下次你來打一首。我不會讓你。'},
    {'who': 'heroine_04', 'spot': 'D12', 'friend': '我回去寫東西了。今天的光很好。', 'dating': '你先走。我看你走到那個轉角。'},
    {'who': 'heroine_05', 'spot': 'D06', 'friend': '我四點要回去讀書。……今天，謝謝。', 'dating': '下次你排行程。我照你的走。'},
    {'who': 'classmate_peishan', 'spot': 'D12', 'friend': '我要去搭車了。今天買的繪本，下次借你。', 'dating': '今天買的書，第一本我先讀給你聽。……下次。'},
    {'who': 'classmate_peishan', 'spot': 'D06', 'friend': '我去書店了。你慢慢看。', 'dating': '下午見。……如果你來的話。'},
    {'who': 'kexin', 'spot': 'D13', 'friend': '', 'dating': '我搭車回木柵了。送我到捷運站就好。……到月台也可以。'},
    {'who': 'kexin', 'spot': 'D04', 'friend': '', 'dating': '我回木柵了。今天的電影你最喜歡哪一幕？傳給我。'},
]

INTRO = [  # 一起走一段之前的一句（可昕 D04：予樂先走）
    {'who': 'kexin', 'spot': 'D04', 'speaker': 'yule', 'line': '我去買東西。……很久。'},
]

REVISIT = [
    {'who': 'heroine_02', 'spot': 'D04', 'normal': '電影院門口。上次芷若一個人站在這裡，看場次表。', 'afterBreakup': '電影院門口。上次在這裡遇到芷若。'},
    {'who': 'heroine_04', 'spot': 'D04', 'normal': '節奏遊戲機還在響。上次子晴在這台前面，打完才轉頭。', 'afterBreakup': '節奏遊戲機還在響。'},
    {'who': 'heroine_04', 'spot': 'D12', 'normal': '碼頭邊。上次子晴坐在這裡，膝上開著筆電。', 'afterBreakup': '碼頭邊。上次在這裡遇到子晴。'},
    {'who': 'heroine_05', 'spot': 'D06', 'normal': '上次學姊站在這幅畫前面，手上拿著展覽的說明。', 'afterBreakup': '這一區的說明牌，你一塊也沒有讀。'},
    {'who': 'classmate_peishan', 'spot': 'D12', 'normal': '舊書店門口。上次沛珊在這裡翻繪本。', 'afterBreakup': '舊書店門口。'},
    {'who': 'classmate_peishan', 'spot': 'D06', 'normal': '兒童區傳來笑聲。上次沛珊在這裡看小孩畫畫。', 'afterBreakup': '兒童區傳來笑聲。'},
    {'who': 'kexin', 'spot': 'D13', 'normal': '河邊。上次可昕和予樂、邵鈞坐在這裡等夕陽。', 'afterBreakup': '河邊的長椅。夕陽還是一樣。'},
    {'who': 'kexin', 'spot': 'D04', 'normal': '電影院門口。上次可昕和予樂在這裡排隊。', 'afterBreakup': '電影院門口。'},
]

SIDE = [
    {'id': 'side_zr_same_row', 'who': 'heroine_02', 'spot': 'D04', 'steps': [
        {'step': 1, 'cond': '第一次在 D04 遇到她（朋友以上）', 'lines': [], 'mem': None, 'note': '偶遇照 BB_144 3-1'},
        {'step': 2, 'cond': '不同週，第二次', 'lines': ['又遇到了。……我們看電影的時間好像一樣。'], 'mem': None},
        {'step': 3, 'cond': '不同週，第三次', 'lines': ['第三次了。我開始覺得，你是故意的。'],
         'choices': [{'t': '「是故意的。」', 'r': '嗯。'}, {'t': '「是剛好。」', 'r': '嗯。'}], 'mem': None},
        {'step': 4, 'cond': '不同週，第四次', 'lines': ['下次直接約。不要靠運氣。'], 'mem': 'ENC_D04_ZR3',
         'after': {'where': 'Café 的閒聊', 'line': '那部老片下週重映。……我只是告訴你。'}},
    ], 'note': '不開啟、不改變任何約會條件（AA_160 5-6 第 1 點）'},
    {'id': 'side_zq_pier_level', 'who': 'heroine_04', 'spot': 'D12', 'steps': [
        {'step': 1, 'cond': '第一次在 D12 遇到她', 'lines': [], 'mem': None, 'note': '偶遇照 BB_144 3-2'},
        {'step': 2, 'cond': '不同週，第二次，一起走一段選 D12.pier', 'lines': ['我改了第三關。你再死一次給我看。', '（旁白）你這次過了第三關，死在第四關。', '很好。第四關也太難了。'], 'mem': None},
        {'step': 3, 'cond': '不同週，第三次，一起走一段選 D12.pier', 'lines': ['我加了一關。河邊的。……還沒有名字。你先玩。', '（旁白）螢幕上是一條河，橋上的燈一盞一盞亮起來。'], 'mem': 'ENC_D12_ZQ3',
         'after': {'where': 'Q12 發表會的製作名單（純文字）', 'line': '碼頭關測試：{name}'}},
    ], 'note': 'R7 精確版：只有名單那一行純文字讀 ENC_D12_ZQ3，不改 Q12 的觸發、分支、結果'},
]

FOLLOWUP = [  # BB_144 第 4 節：第一次在那個地方遇到她，之後她下一次正常聊天時說一次（AA_160 5-3）；只放在一般聊天，劇情事件不讀（R7）
    {'mem': 'ENC_D04_ZR', 'who': 'heroine_02', 'where': 'Café 的閒聊', 'line': '上次在西門町，你看完是什麼表情？……我從後面看到了。'},
    {'mem': 'ENC_D12_ZQ', 'who': 'heroine_04', 'where': '一般聊天', 'line': '欸不是，上次大稻埕那個第三關，我改簡單了。因為你。'},
    {'mem': 'ENC_D06_SIS', 'who': 'heroine_05', 'where': '一般聊天', 'line': '上次在美術館。……你在那幅畫前面站很久。'},
    {'mem': 'ENC_D12_PS', 'who': 'classmate_peishan', 'where': '一般聊天', 'line': '上次你選的那本繪本，課輔班的小孩很喜歡。',
     'lineIf': {'cond': '大一、大二上（她還沒去課輔班）', 'line': '上次那本繪本，我送給鄰居的小孩了。'}},
    {'mem': 'ENC_D13_KX', 'who': 'kexin', 'where': '一般聊天（只有交往中）', 'line': '上次淡水那個假設題，我還沒說完。下次說。'},
    # BB_148 第 8b 節（溫州街，AB-21 的觸發）
    {'mem': 'SIS_SAW_BRUNCH', 'who': 'heroine_05', 'where': '一般聊天', 'line': '週六早上的蛋，還是三分四十秒？……我只是確認。', 'src': 'WZ-B4'},
    {'mem': 'SIS_TEAHOUSE', 'who': 'heroine_05', 'where': '一般聊天', 'line': '茶屋那壺水，我後來查了。八十五度。', 'src': 'WZ-T4（SIS_TEAHOUSE 是旗標，這一句用一次）'},
    {'mem': 'ENC_PARK_ZQ', 'who': 'heroine_04', 'where': '一般聊天', 'line': '昨天那個 bug，鞦韆解決了。……今天換你盪。', 'src': 'WZ-P5'},
    # 第二批（BB_150 第 4 節）
    {'mem': 'ENC_D09_KX', 'who': 'kexin', 'where': '一般聊天（只有交往中）', 'line': '貓空那天，兩分四十秒是對的。邵鈞到現在還在講。'},
    {'mem': 'ENC_D18_ZQ', 'who': 'heroine_04', 'where': '一般聊天', 'line': '九份那些燈籠，我做成一關了。下次給你玩。'},
    {'mem': 'ENC_D24_SIS', 'who': 'heroine_05', 'where': '一般聊天', 'line': '礁溪那天以後，我媽問了你好幾次。我跟她說你很好。'},
    {'mem': 'ENC_D20_PS', 'who': 'classmate_peishan', 'where': '一般聊天', 'line': '烏來那天回去，有個小孩寫作文寫到你。'},
    {'mem': 'ENC_D25_ZR', 'who': 'heroine_02', 'where': '一般聊天', 'line': '外澳那卷底片洗出來了。有一張你在角落，我拿給你。'},
]

# ── 第二批（AB-23，BB_150；spots_v2）──
def w2(who, spot, act, friend, dating, cond=None):
    e = w(who, spot, act, friend, dating, cond); e['batch'] = 2; return e

WALK += [
    w2('kexin', 'D09', 'D09.gondola', [], ['纜車往下比較晃。你坐那邊，我坐這邊。']),
    w2('kexin', 'D09', 'D09.tea', [], ['茶館老闆認得木柵大學的人。他問我今天怎麼沒帶書。']),
    w2('kexin', 'D09', 'D09.view', [], ['從這裡看得到木柵大學。那一棟，是我每天爬的樓梯。']),
    w2('heroine_04', 'D18', 'D18.snack', ['這個顏色我要記起來。……好，先吃。'], ['你那碗紫色的比較多。換。']),
    w2('heroine_04', 'D18', 'D18.teahouse', ['從窗戶看出去，燈籠一層一層。這叫視差。'], ['坐這裡。燈籠在你後面，我想畫下來。']),
    w2('heroine_04', 'D18', 'D18.shop', ['這個木頭陀螺……我小時候有一個。'], ['你買那個給我。我要放在螢幕旁邊。']),
    w2('heroine_05', 'D24', 'D24.footbath', [{'who': 'wen_mother', 't': '學弟，坐。水很燙，慢慢放。'}, '……他們很少叫人坐。你坐吧。'], [], cond={'stageMin': 'FRIEND', 'notDating': True}),
    w2('classmate_peishan', 'D20', 'D20.bridge', ['小孩子都想從橋上丟石頭。我一直在看誰手上拿著石頭。'], ['你牽那一排，我牽這一排。過橋不要放手。']),
    w2('classmate_peishan', 'D20', 'D20.trolley', ['台車很慢。小孩說像在坐時光機。'], ['你跟我坐同一台。小孩坐前面那台，我看得到。']),
    w2('classmate_peishan', 'D20', 'D20.falls', ['瀑布前面，每個小孩都安靜了。我第一次看到他們安靜。'], ['水聲好大。你剛剛說什麼？我沒聽到。']),
    w2('heroine_02', 'D25', 'D25.shore', ['浪到腳邊的時候不要跑。它會自己退回去。'], ['你的鞋子濕了。等一下在堤防上晒一下。']),
    w2('heroine_02', 'D25', 'D25.surf', ['衝浪的人一直在等浪。等很久，站起來一下。跟拍照一樣。'], ['那個人摔了好幾次。夏天我想來學。']),
    w2('heroine_02', 'D25', 'D25.cafe', ['海邊的咖啡比我們店裡貴。豆子是一樣的。'], ['這杯的拉花歪了。我們店裡不會出這種杯。']),
]
LEAVE += [
    {'batch': 2, 'who': 'kexin', 'spot': 'D09', 'friend': '', 'dating': '我走下山就到宿舍了。你要搭纜車的話，我陪你到站。'},
    {'batch': 2, 'who': 'heroine_04', 'spot': 'D18', 'friend': '我要搭客運了。燈籠畫了三十個，夠用了。', 'dating': '下山的客運很晃。你坐靠窗，我暈車的話跟我講話。'},
    {'batch': 2, 'who': 'heroine_05', 'spot': 'D24', 'friend': '我們要去吃飯了。下週學校見。', 'dating': '我們要去吃飯了。晚上傳訊息給你。'},
    {'batch': 2, 'who': 'classmate_peishan', 'spot': 'D20', 'friend': '我們要回去了。謝謝你。下次課輔班要不要來說一個故事？', 'dating': '回程的車上，我要把今天的事寫下來。寫好給你看。'},
    {'batch': 2, 'who': 'heroine_02', 'spot': 'D25', 'friend': '火車快來了。這卷底片洗出來，給你一張。', 'dating': '火車上我想睡一下。到了叫我。'},
]
INTRO += [
    {'batch': 2, 'who': 'kexin', 'spot': 'D09', 'speaker': 'yule', 'line': '邵鈞，我們去另一邊看夕陽。'},
]
REVISIT += [
    {'batch': 2, 'who': 'kexin', 'spot': 'D09', 'normal': '茶館的窗邊。上次可昕和予樂、邵鈞在這裡等茶涼。', 'afterBreakup': '茶館的窗邊，現在坐著別人。'},
    {'batch': 2, 'who': 'heroine_04', 'spot': 'D18', 'normal': '石階上。上次子晴坐在這裡畫燈籠。', 'afterBreakup': '石階上，燈籠一盞一盞亮了。'},
    {'batch': 2, 'who': 'heroine_05', 'spot': 'D24', 'normal': '泡腳池。上次學姊和她爸媽坐在這裡。', 'afterBreakup': '泡腳池。水還是一樣燙。'},
    {'batch': 2, 'who': 'classmate_peishan', 'spot': 'D20', 'normal': '老街口。上次沛珊在這裡幫小孩戴帽子。', 'afterBreakup': '老街口。'},
    {'batch': 2, 'who': 'heroine_02', 'spot': 'D25', 'normal': '堤防上。上次芷若坐在這裡拍浪。', 'afterBreakup': '堤防上。'},
]

# ── 第三批（BB_213；spots_v3）：子晴 D01、芷若 D02、學姊 D11、沛珊 D08、可昕 D10 ──
def w3(who, spot, act, friend, dating, cond=None):
    e = w(who, spot, act, friend, dating, cond); e['batch'] = 3; return e

WALK += [
    w3('heroine_04', 'D01', 'walk', ['市集的人都很會講自己的東西。我不行。'], ['你走裡面。外面一直有人推。']),
    w3('heroine_04', 'D01', 'D01.market', ['這攤的老闆是做獨立遊戲的。他說周邊比遊戲好賣。'], ['那隻貓的你買。我買狗的。']),
    w3('heroine_04', 'D01', 'D01.lawn', ['坐一下。我平常都坐在電腦前面，站太久腳會痠。'], ['草有點濕。坐我的外套上面。']),
    w3('heroine_02', 'D02', 'D02.books', ['這一區是電影書。我每次來都翻同一本，都沒買。'], ['這本你幫我拿著。結帳的時候我再決定。']),
    w3('heroine_02', 'D02', 'D02.corridor', ['這條長廊的光，拍起來會像老電影。'], ['你站那格窗下面。不要動，我記一下光。']),
    w3('heroine_02', 'D02', 'walk', ['那個阿伯每個禮拜都在。上次他也拍同一隻。'], ['慢慢走。下一場四點才開始。']),
    w3('heroine_05', 'D11', 'D11.library', ['這棟是木頭蓋的。屋頂有草，下雨的水會存起來用。'], ['這一頁讀完我就闔起來。你等我。']),
    w3('heroine_05', 'D11', 'D11.footbath', ['讀完書泡腳。每次都這樣排。'], ['水很燙。你慢慢放，不要逞強。']),
    w3('heroine_05', 'D11', 'D11.valley', ['地熱谷的水是酸的，不能碰。告示寫得很清楚。'], ['霧好大。你站近一點。']),
    w3('classmate_peishan', 'D08', 'D08.penguin', ['小孩貼在玻璃上不走。我也想貼，可是我是大人。'], ['你抱那個小的。他看不到。']),
    w3('classmate_peishan', 'D08', 'D08.train', ['列車上我坐最後面，才看得到全部的人。'], ['你坐前面那節，我坐後面。這樣就不會有人掉。']),
    w3('classmate_peishan', 'D08', 'walk', ['走到下一個休息區就好。他們的腳比較短。'], ['你走慢一點。最小的那個一直跟著你。']),
    w3('kexin', 'D10', 'D10.bridge', [], ['吊橋會晃。你不要故意晃。']),
    w3('kexin', 'D10', 'D10.boat', [], ['天鵝船要兩個人踩。予樂踩到一半就不踩了。']),
    w3('kexin', 'D10', 'D10.snack', [], ['這攤的玉米比剛剛那攤好吃。我今天吃過兩攤了。']),
]
LEAVE += [
    {'batch': 3, 'who': 'heroine_04', 'spot': 'D01', 'friend': '我要回去了。今天晚上要把那隻貓畫出來。', 'dating': '捷運站那邊人很多。你走前面，我跟著。'},
    {'batch': 3, 'who': 'heroine_02', 'spot': 'D02', 'friend': '我要進去了。下一場要開始了。', 'dating': '你先走。我看完傳訊息給你，跟你說好不好看。'},
    {'batch': 3, 'who': 'heroine_05', 'spot': 'D11', 'friend': '我要回去了。計畫本上還有兩件事。', 'dating': '支線只有一站。坐我旁邊。'},
    {'batch': 3, 'who': 'classmate_peishan', 'spot': 'D08', 'friend': '我們要回去吃午餐了。謝謝你幫忙數。', 'dating': '回去的捷運上他們一定會睡著。你可以一起搭嗎？'},
    {'batch': 3, 'who': 'kexin', 'spot': 'D10', 'friend': '', 'dating': '我回木柵大學了。到宿舍傳訊息給你。'},
]
INTRO += [
    {'batch': 3, 'who': 'kexin', 'spot': 'D10', 'speaker': 'yule', 'line': '我先回去了。可昕，玉米你自己吃完。'},
]
REVISIT += [
    {'batch': 3, 'who': 'heroine_04', 'spot': 'D01', 'normal': '市集那一攤。上次子晴在這裡拿著一個像素鑰匙圈。', 'afterBreakup': '市集那一攤，今天賣的是別的東西。'},
    {'batch': 3, 'who': 'heroine_02', 'spot': 'D02', 'normal': '書店門口的長椅。上次芷若坐在這裡，手上一本電影書。', 'afterBreakup': '書店門口的長椅，現在沒有人。'},
    {'batch': 3, 'who': 'heroine_05', 'spot': 'D11', 'normal': '圖書館的木頭陽台。上次學姊坐在這裡讀書。', 'afterBreakup': '圖書館的陽台，那個位子坐著別人。'},
    {'batch': 3, 'who': 'classmate_peishan', 'spot': 'D08', 'normal': '企鵝館門口。上次沛珊在這裡數小孩。', 'afterBreakup': '企鵝館門口，一群小孩貼在玻璃上。'},
    {'batch': 3, 'who': 'kexin', 'spot': 'D10', 'normal': '河邊的台階。上次可昕和予樂坐在這裡吃玉米。', 'afterBreakup': '河邊的台階，烤玉米的味道還在。'},
]
FOLLOWUP += [
    {'batch': 3, 'mem': 'ENC_D01_ZQ', 'who': 'heroine_04', 'where': '一般聊天', 'line': '華山那隻貓，我後來畫進去了。在第二關的角落。'},
    {'batch': 3, 'mem': 'ENC_D02_ZR', 'who': 'heroine_02', 'where': 'Café 的閒聊', 'line': '松菸那天四點那場，我後來看了。你要我講給你聽嗎？'},
    {'batch': 3, 'mem': 'ENC_D11_SIS', 'who': 'heroine_05', 'where': '一般聊天', 'line': '北投那天你走得很早。下次可以待到中午。'},
    {'batch': 3, 'mem': 'ENC_D08_PS', 'who': 'classmate_peishan', 'where': '一般聊天', 'line': '動物園那天，小孩回去一直問我你是誰。'},
    {'batch': 3, 'mem': 'ENC_D10_KX', 'who': 'kexin', 'where': '手機（只有交往中）', 'line': '碧潭那天予樂說，你吃玉米的樣子很認真。'},
]

RULES = {
    'values': '一起走一段照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；同一個人一天一次；不加戀愛，不算約會（AA-B 2026-10-16）',
    'join': {'heroine_02': '朋友以上，19:30 以後', 'heroine_04': '不限關係', 'heroine_05': '朋友以上',
             'classmate_peishan': '不限關係；D06 不選 D06.frame（心願事件的地方）', 'kexin': '只在交往中'},
    'ex': '前任不一起走；重訪用 afterBreakup',
    'revisit': '這次沒有遇到她才說；一個地方說一次，要再遇到她、留下新紀錄才會再說',
    'rain': 'D04、D06 的 walk 在雨天照用（改在騎樓下走）；D12、D13 雨天沒有偶遇',
    'once': '同一件事一趟只說一次',
}

def check():
    errs = []
    def L(t, where):
        if len(t) > 40: errs.append(f'{where}：{len(t)} 字＞40：{t}')
        for b in BAN:
            if b in t: errs.append(f'{where}：禁用「{b}」：{t}')
    for e in WALK:
        if e['who'] not in WHO: errs.append(f'who {e["who"]}')
        if e['act'] not in ACTS.get(e['spot'], set()): errs.append(f'{e["who"]} {e["spot"]} act {e["act"]} 不在 spots_v1')
        if e['who'] != 'kexin' and not e['friend']: errs.append(f'{e["who"]} {e["act"]} 沒有 friend')
        if not e['dating'] and not (e.get('cond') or {}).get('notDating'): errs.append(f'{e["who"]} {e["act"]} 沒有 dating')
        for t in e['friend'] + e['dating']: L(t['t'] if isinstance(t, dict) else t, f'{e["who"]}/{e["act"]}')
    for e in LEAVE + REVISIT:
        for k in ('friend', 'dating', 'normal', 'afterBreakup'):
            if e.get(k): L(e[k], f'{e["who"]}/{e["spot"]}/{k}')
    for e in FOLLOWUP:
        L(e['line'], e['mem'])
        if e.get('lineIf'): L(e['lineIf']['line'], e['mem']+'/if')
    for s in SIDE:
        for st in s['steps']:
            for t in st['lines']: L(t, f'{s["id"]}#{st["step"]}')
    if 'D06.frame' in {e['act'] for e in WALK if e['who'] == 'classmate_peishan'}: errs.append('沛珊不選 D06.frame')
    if any(e['who'] == 'kexin' and e['spot'] == 'D25' for e in WALK): errs.append('可昕不在 D25（她的心願地點）')
    return errs

if __name__ == '__main__':
    errs = check()
    for e in errs: print('ERR', e)
    if errs: sys.exit(1)
    out = {'source': 'BB_147（AB-18），BB-B 2026-10-16；AA_160 第 6 節', 'status': 'PROPOSAL（AA-B 已定五條規則與欄位，等 AA-B 統一轉 LAWWW-B）',
           'rules': RULES, 'walk': WALK, 'leave': LEAVE, 'intro': INTRO, 'revisit': REVISIT, 'side': SIDE, 'followUp': FOLLOWUP}
    if '--check' not in sys.argv:
        with open(os.path.join(HERE, 'bb_walk_v1.json'), 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
    print('ok', {'walk': len(WALK), 'leave': len(LEAVE), 'revisit': len(REVISIT), 'side': len(SIDE), 'followUp': len(FOLLOWUP)})
