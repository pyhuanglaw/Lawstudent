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
ACTS = {s['id']: {'walk'} | {p['id'] for p in s['points']} for s in SPOTS}
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
    w('heroine_02', 'D04', 'D04.snack', ['看完電影要吃熱的。這是我自己訂的規定。'], ['站著吃剛好。……你吃得比我快，等我。'], cond={'from': 19.5}),
    # 子晴 D04（大型電玩店，週六 18～21）
    w('heroine_04', 'D04', 'walk', ['欸不是，你走好快。我剛打完，手還在抖。'], ['左手給你。右手是我的命，要留著打歌。']),
    w('heroine_04', 'D04', 'D04.redhouse', ['這種老房子做成遊戲很好看。……地圖很難畫。'], ['這個角度我記起來了。下一個關卡用。']),
    w('heroine_04', 'D04', 'D04.snack', ['好燙。欸不是，你為什麼可以直接吃。'], ['你幫我吹一下。……不是撒嬌，是真的燙。']),
    # 子晴 D12（單週週日 16～19）
    w('heroine_04', 'D12', 'walk', ['每一間都很像，可是都不一樣。做場景的人會哭。'], ['你走前面。我想看你走在這條街上。……參考用。']),
    w('heroine_04', 'D12', 'D12.tea', ['我不懂茶。……可是這個罐子的顏色我要記起來。'], ['你先喝，跟我說苦不苦。我再決定要不要喝。']),
    w('heroine_04', 'D12', 'D12.pier', ['這邊的風剛好。程式碼想不出來的時候，就來吹。'], ['你坐這邊。我的筆電借你擋風。']),
    w('heroine_04', 'D12', 'D12.sunset', ['這個光，我調了三天都調不出來。'], ['不要說話。……我在記這個顏色。']),
    # 學姊 D06（週日 13～16；朋友以上；有伴侶時只陪一件事）
    w('heroine_05', 'D06', 'walk', ['我排的時間還有四十分鐘。走一圈剛好。'], ['今天的計畫只有一行：來美術館。剩下的，跟你走。']),
    w('heroine_05', 'D06', 'D06.gallery', ['一件事。這一間的燈很暗，畫要站近一點看。'], ['你看你的。看完來找我，我在最後一間。']),
    w('heroine_05', 'D06', 'D06.frame', ['站進去。……不，我不拍。我只是想看看。'], ['換我站。……你看到什麼？不用說，我知道。']),
    w('heroine_05', 'D06', 'D06.cafe', ['美術館的咖啡比較貴。我把它算進門票了。'], ['這杯算我的。不在計畫裡。是我想。']),
    # 沛珊 D12（大一、大二上的週六 15～18）
    w('classmate_peishan', 'D12', 'walk', ['這條街好像繪本的插圖。一頁一頁翻過去。'], ['你幫我拿書。……我想空出一隻手。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    w('classmate_peishan', 'D12', 'D12.tea', ['這個味道，好像下雨前的舊書店。'], ['你喝一口，告訴我是什麼味道。我想寫下來。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    w('classmate_peishan', 'D12', 'D12.pier', ['我小時候以為，河對面就是另一個國家。'], ['我讀一頁給你聽。……只讀一頁，風太大了。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    w('classmate_peishan', 'D12', 'D12.sunset', ['今天的天空，可以畫成封面。'], ['你不要看我。看夕陽。……好，可以看一下。'], cond={'terms': ['Y1S1', 'Y1S2', 'Y2S1']}),
    # 沛珊 D06（大三起的週日 09:30～12；心願事件以後；不選空畫框）
    w('classmate_peishan', 'D06', 'walk', ['小孩子在草地上都用跑的。大人都忘了。'], ['你跑一下。……開玩笑的。不過我想看。'], cond={'terms': ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']}),
    w('classmate_peishan', 'D06', 'D06.gallery', ['小孩看畫，先看最大的顏色。我在學他們。'], ['我們今天只看三幅。看慢一點。'], cond={'terms': ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']}),
    w('classmate_peishan', 'D06', 'D06.cafe', ['十一點半以前，我得去書店顧童書區。'], ['你下午來書店嗎？……不來也沒關係，我挑一本書等你。'], cond={'terms': ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']}),
    # 可昕 D13（週日 16:30～19；只在交往中）
    w('kexin', 'D13', 'walk', [], ['假設我們一直走，走到出海口，要走多久？……你算，我聽。']),
    w('kexin', 'D13', 'D13.drink', [], ['一杯就好，兩根吸管。……我是說，比較省。']),
    w('kexin', 'D13', 'D13.rail', [], ['予樂說我們很吵。我們明明都沒講話。']),
    w('kexin', 'D13', 'D13.bench', [], ['這張長椅看夕陽的效用最大。……我查過了。']),
    w('kexin', 'D13', 'D13.photo', [], ['太陽下去的速度，每次都比我想的快。']),
    # 可昕 D04（週六 18:30～21，和予樂；只在交往中）
    w('kexin', 'D04', 'walk', [], ['予樂說她不想當電燈泡。她剛剛真的用了這個詞。']),
    w('kexin', 'D04', 'D04.lobby', [], ['你選。我選的話，會選最便宜的那一場。']),
    w('kexin', 'D04', 'D04.redhouse', [], ['這棟比政大所有的樓都老。……我猜的，沒查。']),
    w('kexin', 'D04', 'D04.snack', [], ['你吃一口我的。……經濟學說這叫交換。']),
]

LEAVE = [
    {'who': 'heroine_02', 'spot': 'D04', 'friend': '我搭車回去了。今天的片，下次在 Café 說。', 'dating': '到家傳訊息給我。……我也會傳。'},
    {'who': 'heroine_04', 'spot': 'D04', 'friend': '我回去了。今天的分數，我截圖了。', 'dating': '下次你來打一首。我讓你。……騙你的。'},
    {'who': 'heroine_04', 'spot': 'D12', 'friend': '我回去改關卡了。今天的光，我帶走了。', 'dating': '你先走。我看你走到那個轉角。'},
    {'who': 'heroine_05', 'spot': 'D06', 'friend': '我四點要回去讀書。……今天，謝謝。', 'dating': '下次你排行程。我照你的走。'},
    {'who': 'classmate_peishan', 'spot': 'D12', 'friend': '我要去搭車了。今天買的繪本，下次借你。', 'dating': '今天買的書，第一本我先讀給你聽。……下次。'},
    {'who': 'classmate_peishan', 'spot': 'D06', 'friend': '我去書店了。你慢慢看。', 'dating': '下午見。……我是說，如果你來的話。'},
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

RULES = {
    'values': '一起走一段照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；同一個人一天一次；不加戀愛，不算約會（AA-B 2026-10-16）',
    'join': {'heroine_02': '朋友以上，19:30 以後', 'heroine_04': '不限關係', 'heroine_05': '朋友以上；有伴侶時只陪一件事',
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
        if not e['dating']: errs.append(f'{e["who"]} {e["act"]} 沒有 dating')
        for t in e['friend'] + e['dating']: L(t, f'{e["who"]}/{e["act"]}')
    for e in LEAVE + REVISIT:
        for k in ('friend', 'dating', 'normal', 'afterBreakup'):
            if e.get(k): L(e[k], f'{e["who"]}/{e["spot"]}/{k}')
    for s in SIDE:
        for st in s['steps']:
            for t in st['lines']: L(t, f'{s["id"]}#{st["step"]}')
    if 'D06.frame' in {e['act'] for e in WALK if e['who'] == 'classmate_peishan'}: errs.append('沛珊不選 D06.frame')
    return errs

if __name__ == '__main__':
    errs = check()
    for e in errs: print('ERR', e)
    if errs: sys.exit(1)
    out = {'source': 'BB_147（AB-18），BB-B 2026-10-16；AA_160 第 6 節', 'status': 'PROPOSAL（AA-B 已定五條規則與欄位，等 AA-B 統一轉 LAWWW-B）',
           'rules': RULES, 'walk': WALK, 'leave': LEAVE, 'intro': INTRO, 'revisit': REVISIT, 'side': SIDE}
    if '--check' not in sys.argv:
        with open(os.path.join(HERE, 'bb_walk_v1.json'), 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
    print('ok', {'walk': len(WALK), 'leave': len(LEAVE), 'revisit': len(REVISIT), 'side': len(SIDE)})
