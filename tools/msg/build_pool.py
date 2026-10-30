#!/usr/bin/env python3
# Builds msg_pool.json from AA_202 section 6 and BB_178 sections 0-8b (first version 8a08c312 / 64aaaa82; 67f74502: AA-C 2026-10-17 回問／問句改句; b61e4f55: 同內容，和 MSG-2 用同一個版本).
# ZHE_ASK = AA_202 6-4 表下「回問」（67f74502）.
# Every Chinese string below is copied verbatim from the source docs; verify_pool.py checks that.
import json, os, copy

OUT = os.environ.get('MSG_POOL_OUT') or os.path.join(os.path.dirname(os.path.abspath(__file__)), 'out')

AA_L = {'chat': '在幹嘛', 'course': '問課', 'share_cat': '分享（貓）', 'share_food': '分享（吃的）',
        'share_notes': '分享（講義）', 'night': '晚安'}
BB_L = {'chat': '在幹嘛', 'course': '問課', 'share_cat': '分享 貓', 'share_food': '分享 吃的',
        'share_notes': '分享 講義', 'night': '晚安'}


def O(t, r, cond=None, **kw):
    d = {'t': t, 'r': list(r)}
    if cond:
        d['cond'] = cond
    d.update(kw)
    return d


def ASK(*opts):
    return {'opts': list(opts)}


class P:
    def __init__(self, cid, name, base, labels):
        self.cid, self.name, self.base, self.labels = cid, name, base, labels
        self.replies, self.rules = [], {}

    def add(self, topic, tier, msgs, tags=(), variant=None, ask=None, src=None, **extra):
        if src is None:
            src = f"{self.base} {self.labels[topic]}" + (f" {variant}" if variant and extra.get('tierMin') else '')
        e = {'topic': topic, 'tier': tier, 'variant': variant, 'msgs': list(msgs), 'tags': list(tags),
             'ask': ask, 'src': src}
        e.update(extra)
        self.replies.append(e)
        return e

    def sit(self, topic, msgs, variant, tags=(), tier='A', src=None, **extra):
        """situation-version line (情況版): doc gives no tier -> tier = lowest tier, tierMin=True"""
        return self.add(topic, tier, msgs, tags, variant=variant, src=src, tierMin=True, **extra)

    def copy(self, topic, frm, to, copyNote, add_msgs=None):
        srcs = [e for e in self.replies if e['topic'] == topic and e['tier'] == frm and not e.get('tierMin')]
        assert srcs, (self.cid, topic, frm)
        for s in srcs:
            e = copy.deepcopy(s)
            e['tier'] = to
            e['copiedFrom'] = frm
            e['copyNote'] = copyNote
            if add_msgs:
                e['msgs'] += add_msgs
            self.replies.append(e)

    def out(self):
        return {'name': self.name, 'rules': self.rules, 'replies': self.replies}


people = []

AA_OPEN = '第一次能用：拿到這個人的聯絡方式以後。每個人拿到的時間不同，照現有的「交換聯絡方式」條件（`BB_172`、`AA_134`）'
AA_L_TEXT = 'L＝曖昧、交往（只有以安、語彤；~~她們的戀愛窗口在大三、大四以後~~ 2026-10-17 AA-C，AA_215／AA_216 R8：交往中（任何學期），或第 5 階以上而且兩人都單身；大一就可能用到）'

# ───────────────────────── AA_202 6-2 以安 ─────────────────────────
p = P('heroine_01', '沈以安', 'AA_202 6-2', AA_L)
p.rules = {
    'replyFree': [1, 10],
    'noReplyText': '22:30 以後不回，隔天 7 點多回「昨天睡了。早。」（玩家傳的是晚安，就只回這一句）',
    'openText': AA_OPEN,
    'habitText': '短、快；貼圖只有一張兔子「收到」',
    'wakeLine': ['昨天睡了。早。'],
    'lTierText': AA_L_TEXT,
    'otherText': ['22:30 以後傳：隔天早上「昨天睡了。早。」再接一般版（晚安不接，見 3-1 第 4 點）。',
                  '以安：快、短、只有一張兔子「收到」貼圖；'],
}
p.add('chat', 'A', ['在總圖。'])
p.add('chat', 'A', ['剛下課，要去吃飯。'], ['學期中、平日課後'])
p.add('chat', 'A', ['整理筆記。'])
p.add('chat', 'R', ['總圖二樓，旁邊有位子。'])
p.add('chat', 'R', ['在想報告要怎麼分工。'], ['學期中'])
p.add('chat', 'R', ['剛跑完步，在等洗澡。'], ['傍晚、晚上'])
p.add('chat', 'L', ['在宿舍，剛洗好頭。', '你呢？'], ['晚上'],
      ask=ASK(O('在宿舍', ['嗯。']), O('在外面', ['早點回去。']), O('在想妳', ['我在看書，你不要讓我分心。'])))
p.add('course', 'A', ['我有抄到。', '（照片：一頁筆記，字很整齊）'])
p.add('course', 'A', ['我也還沒寫，寫完傳你。你先自己想一下。'])
p.add('course', 'R', ['（照片：兩頁筆記）', '第二頁右下角那段我也不確定，我標起來了。'])
p.copy('course', 'R', 'L', '同 R')
p.add('share_cat', 'A', ['（兔子「收到」）'])
p.add('share_cat', 'R', ['哪裡的貓？'], ask=ASK(O('溫州街', ['好。']), O('宿舍旁邊', ['好。'])))
p.add('share_cat', 'L', ['下次一起去看。'], ['祐廷在臺灣'])   # AA_531 8-3（企劃線 41ec9a6ac）：「在臺灣才成立的話」，祐廷在國外（美國、日本）用下一行
p.add('share_cat', 'L', ['回來以後一起去看。'], ['祐廷在國外'], src='AA_531 8-3 在國外的版本')
p.add('share_food', 'A', ['看起來很好吃。'])
p.add('share_food', 'R', ['那家我手帳有寫。'])
p.copy('share_food', 'R', 'L', '同 R')
p.add('share_notes', 'A', ['謝謝。'])
p.add('share_notes', 'R', ['你字比我想的整齊。'])
p.copy('share_notes', 'R', 'L', '同 R')
p.add('night', 'R', ['晚安。', '（兔子「收到」）'])
p.add('night', 'L', ['嗯。晚安。'])
p.add('night', 'L', ['你也早點睡，不要又滑手機。'])
p.sit('chat', ['在念民總。你也是吧。'], '考試週', ['大一上'], src='AA_202 6-2 情況版',
      note='大一上；其他學期換成那學期的科目，LAWWW-B 照課表填')
p.sit('chat', ['在台中。', '在自己房間，比宿舍安靜。'], '放假在台中', src='AA_202 6-2 情況版', variantNote='`AA_197` 1-4')
p.sit('chat', ['回台中了。在整理筆記。'], '放假在台中', src='AA_202 6-2 情況版', variantNote='`AA_197` 1-4')
people.append(p)

# ───────────────────────── AA_202 6-3 語彤 ─────────────────────────
p = P('heroine_03', '陳語彤', 'AA_202 6-3', AA_L)
p.rules = {
    'replyFree': [10, 60],
    'noReplyText': '週二、週四麵店時間，20:30 以後才回',
    'openText': AA_OPEN + '；「問課」不出現，她是社會系',
    'habitText': '常傳沒有字的照片；沒有貼圖；「問課」不出現，她是社會系',
    'wakeLine': [],
    'lTierText': 'L（~~大四~~ 同上：交往中，或第 5 階以上而且單身；任何學期，2026-10-17 AA-C）',
    'otherText': ['語彤：沒有貼圖；'],
}
p.add('chat', 'A', ['在店裡。'], ['店裡的時間'])
p.add('chat', 'A', ['在三樓。'], note='總圖三樓，她固定的位子')
p.add('chat', 'A', ['（照片：麵店今天的小菜）'], ['店裡的時間'])
p.add('chat', 'R', ['（照片：總圖三樓的窗外）'],
      addIf={'tag': '下雨天', 'msgs': ['下雨了。'], 'text': '下雨天加一則「下雨了。」'})
p.add('chat', 'R', ['剛收完店。'], ['收店後'])
p.add('chat', 'R', ['陪我媽看電視。'], ['晚上、在家'])
p.add('chat', 'L', ['在店裡。阿姨問你怎麼沒來。'], ['店裡的時間', '祐廷在臺灣'])   # AA_531 3-3（企劃線 475f55fe6；8-2 41ec9a6ac：「店裡的時間」＝她的作息在麵店顧店，src/msg3d.js S.atShop）：祐廷在國外不用這一句（「怎麼沒來」在臺灣才成立）；美國版在下一行
p.add('chat', 'L', ['在店裡。阿姨問你美國有沒有麵。'], ['店裡的時間', '美國路線'], src='AA_531 3-3 在國外的版本')
p.add('share_cat', 'A', ['（照片：另一隻貓，在麵店門口）'])
p.copy('share_cat', 'A', 'R', '同 A，加「這隻每天都來。」', add_msgs=['這隻每天都來。'])
p.copy('share_cat', 'R', 'L', '同 R')
p.add('share_food', 'A', ['這家我沒吃過。'])
p.add('share_food', 'R', ['下次帶我去。'])
p.copy('share_food', 'R', 'L', '同 R')
p.add('share_notes', 'A', ['法律系的講義字好多。'])
p.copy('share_notes', 'A', 'R', '同 A')
p.copy('share_notes', 'A', 'L', '同 A')
p.add('night', 'R', ['晚安。'])
p.add('night', 'L', ['晚安。', '（照片：她那時候看著的東西：店裡關燈的招牌、房間窗外）'])
p.sit('chat', ['店裡。放假人比較少。'], '放假中', src='AA_202 6-3 情況版')
p.sit('chat', ['在醫院。沒事，只是陪她。'], '媽媽住院的那一學期', src='AA_202 6-3 情況版', variantNote='`AA_11`')
people.append(p)

# ───────────────────────── AA_202 6-4 阿哲 ─────────────────────────
p = P('zhe', '阿哲', 'AA_202 6-4', AA_L)
p.rules = {
    'replyFree': [1, 3],
    'noReplyText': '練球時不回',
    'openText': AA_OPEN,
    'habitText': '極快；「走啦」「+1」、語音、食物照片；叫你「哥」要有 `ZHE_CALLS_GE`，沒有的版本把「哥」拿掉',
    'wakeLine': [],
    'otherText': ['阿哲：「走啦」「+1」、語音、食物照片；'],
}
p.add('chat', 'A', ['練球'])
ZHE_ASK = ASK(O('好 我過去', ['快點 我快吃完了']), O('我吃過了', ['好啦 下次']))
p.add('chat', 'A', ['吃飯 你要來嗎'], ask=ZHE_ASK)
p.add('chat', 'A', ['（語音訊息，背景很吵）在麵店啦！'])
p.add('chat', 'R', ['在麵店 哥要來嗎'], ask=ZHE_ASK)
p.add('chat', 'R', ['打球 缺一個'])
p.add('chat', 'R', ['躺'])
p.add('course', 'A', ['我也沒抄到', '問 Alison 她都有抄'], ['認識 Alison 才有'])
p.add('course', 'R', ['哥你問錯人了', '我那堂在睡'])
p.add('share_cat', 'A', ['可愛'])
p.add('share_cat', 'R', ['這隻我看過！溫州街那隻吧'])
p.add('share_food', 'A', ['這家我知道！！下次揪'])
p.copy('share_food', 'A', 'R', '同 A，加「（照片：他自己正在吃的東西）」', add_msgs=['（照片：他自己正在吃的東西）'])
p.add('share_notes', 'A', ['好認真'])
p.add('share_notes', 'R', ['哥好認真'])
p.add('night', 'R', ['晚安哥'])
p.add('night', 'R', ['（語音訊息：晚安啦）'])
p.sit('chat', ['在念書', '要被當了'], '考試週', src='AA_202 6-4 情況版')
p.sit('chat', ['在高雄 熱死', '（照片：一桌家裡的菜）'], '放假在高雄', src='AA_202 6-4 情況版')
for e in p.replies:
    if any('哥' in m for m in e['msgs']):
        e['geFlag'] = 'ZHE_CALLS_GE'
people.append(p)

# ───────────────────────── AA_202 6-5 Alison ─────────────────────────
p = P('yu', 'Alison', 'AA_202 6-5', AA_L)
p.rules = {
    'replyFree': [1, 5],
    'noReplyText': '社課中',
    'openText': AA_OPEN,
    'habitText': '一句拆好幾則、「欸欸欸」、表情符號多',
    'wakeLine': [],
    'otherText': ['有空時｜1～5 分鐘，常常一次傳好幾則', 'Alison：一句拆很多則、很多表情符號；'],
}
p.add('chat', 'A', ['在社辦～', '你呢'], ['學期中'],
      ask=ASK(O('總圖', ['好喔～']), O('宿舍', ['好喔～']), O('外面', ['好喔～'])))
p.add('chat', 'R', ['欸欸欸', '我剛剛在路上看到一隻狗穿雨衣', '超可愛'], ['下雨天'])
p.add('chat', 'R', ['在等社課開始', '好無聊'], ['學期中、社課那天'])
p.add('course', 'A', ['我有抄！', '等我', '（照片：筆記，旁邊畫了很多星星）'])
p.add('course', 'R', ['欸那題我也卡住', '卡超久😭'])
p.add('share_cat', 'A', ['啊啊啊好可愛', '在哪裡'], ask=ASK(O('溫州街', ['我也要摸😭']), O('學校', ['我也要摸😭'])))
p.copy('share_cat', 'A', 'R', '同 A')
p.add('share_food', 'A', ['看起來好好吃😭'])
p.add('share_food', 'R', ['我也要', '下次揪我'])
p.add('share_notes', 'A', ['欸你也有這張'])
p.copy('share_notes', 'A', 'R', '同 A')
p.add('night', 'R', ['晚安～🌙'])
p.add('night', 'R', ['欸你要睡了喔', '好啦晚安'])
p.sit('chat', ['在家耍廢🛋️'], '放假在板橋', src='AA_202 6-5 情況版')
p.sit('chat', ['在營隊', '小朋友好吵', '我好累'], '7 月營隊期間', src='AA_202 6-5 情況版', variantNote='`AA_197` 1-4')
people.append(p)

# ───────────────────────── AA_202 6-6 柏翰 ─────────────────────────
p = P('classmate_bohan', '許柏翰', 'AA_202 6-6', AA_L)
p.rules = {
    'replyFree': [5, 30],
    'noReplyText': '不用管，凌晨一點還在線上',
    'openText': AA_OPEN,
    'habitText': '數字多、不用貼圖、凌晨一點還在線上',
    'wakeLine': [],
    'otherText': ['柏翰：數字多、不用貼圖；'],
}
p.add('chat', 'A', ['念書。'])
p.add('chat', 'A', ['四樓。'])
p.add('chat', 'R', ['總圖，還剩兩章。'])
p.add('chat', 'R', ['剛念完一章，休息五分鐘。'])
p.add('course', 'A', ['考古題資料夾裡有，第二個檔案。'], ['有他的考古題資料夾才有'])
p.add('course', 'A', ['我還沒寫到那裡。'])
p.add('course', 'R', ['第三章第二節。', '（檔案）'], note='章節照那門課實際的填')
p.add('share_cat', 'A', ['貓。'])
p.copy('share_cat', 'A', 'R', '同 A')
p.add('share_food', 'A', ['這種一碗大概一百二。'])
p.copy('share_food', 'A', 'R', '同 A，加「學餐的兩倍。」', add_msgs=['學餐的兩倍。'])
p.add('share_notes', 'A', ['第七週的。'], note='週數照講義實際的填')
p.copy('share_notes', 'A', 'R', '同 A')
p.add('night', 'R', ['晚安。'])
p.add('night', 'R', ['你先睡。我還有一章。'])
p.sit('chat', ['期末前還有九天。'], '考試週', src='AA_202 6-6 情況版', note='天數照日曆算')
p.sit('chat', ['在新竹。週四會上去總圖。'], '放假在新竹', src='AA_202 6-6 情況版')
p.sit('chat', ['還沒睡，在整理考古題。'], '深夜', src='AA_202 6-6 情況版')
people.append(p)

# ───────────────────────── AA_202 6-7 芯慈 ─────────────────────────
p = P('classmate_xinci', '吳芯慈', 'AA_202 6-7', AA_L)
p.rules = {
    'replyFree': [10, 30],
    'noReplyText': '00:30 以後反而秒回（在追劇）',
    'openText': AA_OPEN,
    'habitText': '句子完整、客氣；00:30 以後變很多話',
    'wakeLine': [],
    'otherText': ['芯慈：追劇和經濟學；'],
}
p.add('chat', 'A', ['在家，剛吃完飯。'], ['晚上'])
p.add('chat', 'A', ['在排下禮拜的讀書計畫。'], ['學期中'])
p.add('chat', 'R', ['在追劇，這集好扯。'])
p.add('chat', 'R', ['在算經濟學的作業。'], ['學期中'])
p.add('course', 'A', ['我有，等一下拍給你。'])
p.add('course', 'R', ['我有做成表格。', '（照片：一張表格）'])
p.add('share_cat', 'A', ['好可愛，在哪裡拍的？'],
      ask=ASK(O('溫州街', ['我記一下，經過的時候找找看。']), O('學校', ['我記一下，經過的時候找找看。'])))
p.copy('share_cat', 'A', 'R', '同 A')
p.add('share_food', 'A', ['這家我一直想去，好吃嗎？'],
      ask=ASK(O('好吃', ['那我排一天去。']), O('普通', ['好，那我先不去。'])))
p.copy('share_food', 'A', 'R', '同 A')
p.add('share_notes', 'A', ['謝謝，我剛好缺這張。'])
p.copy('share_notes', 'A', 'R', '同 A')
p.add('night', 'R', ['晚安，我再看一集就睡。'])
p.add('night', 'R', ['好，晚安。'])
p.sit('chat', ['你也還沒睡？', '我在看那部，第八集太扯了', '你一定要看'], '00:30 以後傳的', src='AA_202 6-7 情況版')
p.sit('chat', ['在家，我媽叫我去買東西。'], '放假在永和', src='AA_202 6-7 情況版')
people.append(p)


# ═════════════════════════ BB_178 ═════════════════════════
def bb_open(open_cell, close_cell):
    return '什麼時候開：' + open_cell + '\n什麼時候不開，或只回事務：' + close_cell


# ───────────────────────── BB_178 1 芷若 ─────────────────────────
p = P('heroine_02', '林芷若', 'BB_178 1', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：\n大一～大二：上班時間不回（一、三、五 11～15；平日 19～22），下班後一次回（常常是 22:07）。\n祐廷交往中：改在下午回（15:10 她下午的班結束以後）；15:10 以後傳的，隔天 15:10 回（`BB_70` 1-2）。\n大二下第 17 週以後她不在 Café 上班（Z9），沒有上班時間；「店裡」的句子只到大二。',
    'openText': bb_open('拿到她的私人聊天以後（Café 第五次以後，或群組裡祐廷回過她一次，`BB_70` 1-1）',
                        '她在英國的兩段照交情（2026-10-17 BB-C，`AA_276` 第 2 節，取代原本的「不開，只寄明信片」）：認識、有點熟不開，只看得到她的社群發文；朋友以上開，回得多快、有沒有約好的視訊照 1-E。兩段是大三上交換（2027-09-03 出發～2028-02 中回台，`AA_212` A-11）、大四在英國念研究所（2028-09～2029-08-25）。明信片照寄；生日、情人節、聖誕、跨年約好的視訊照 `BB_124` 第 1 節'),
    'habitText': '手機習慣（2026-10-16 22:5x 定，`BB_70` 1-2、`AA_188` 那一列統一）：訊息短，標點完整、句號多；常常是一張照片加一兩句。很少貼圖，偶爾一張「貓戴眼鏡」。很少先說自己的事。很熟以後（R、L），下班後偶爾連發兩三則店裡的小事；當面那種一句接一句的快，是面對熟客的樣子，不是手機上的。',
    'wakeLine': ['昨天太晚看到了。'],
    'otherText': ['芷若：只有大一（她重修經濟學原理，和祐廷同一組），只回經原的事。'],
    'sectionText': {'course': '問課（只有大一的經濟學原理）',
                    'night': '晚安（`CLOSE_FRIEND` 以上；曖昧、交往。祐廷和別人交往中不開）'},
}
p.add('chat', 'A', ['在看書。', '（照片：一本翻開的小說）'])
p.add('chat', 'A', ['在溫州街晃。'], ['週末、在臺北'])
p.add('chat', 'A', ['在寫外文系的報告。'], ['學期中'])
p.add('chat', 'A', ['剛下班。', '（照片：收好的吧檯）'], ['大一～大二，下班後回的那次'])
p.add('chat', 'R', ['剛下班，腳好痠。', '你呢？'], ['大一～大二，下班後回的那次'],
      ask=ASK(O('在宿舍。', ['好好喔，我也想躺著。']), O('在念書。', ['那你念。我不吵你。'])))
p.add('chat', 'R', ['剛看完《東京物語》。', '第二次看，這次哭得比較早。'])
p.add('chat', 'R', ['在想新來的那支豆子要怎麼跟客人介紹。', '它聞起來像葡萄乾，喝起來不像。'], ['大一～大二'])
p.add('chat', 'L', ['剛下班。', '剛剛有個客人點了一杯熱美式，喝完又點一杯冰的。', '我問他為什麼，他說想比較。'],
      ['大一～大二，下班後回的那次'])
p.add('chat', 'L', ['（照片：一杯拉花）', '這是今天最好看的一杯。'],
      ['大一～大二（帶感情的那一句：她拍了好看的拉花從不傳給別人，`BB_70` 1-2）'], affection=True)
p.add('chat', 'L', ['在床上。', '店長把音樂放錯了，放了一整天的聖誕歌。'], ['大一～大二'])
p.add('chat', 'L', ['在剪片。', '（照片：剪輯軟體的時間軸）'])
p.sit('chat', ['在寫報告。外文系考試週也是交報告。', '還剩兩千字。'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['報告寫到第三頁。', '我要寫到第五頁才睡。'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['（照片：一台很舊的影印機）', '在顧店。這台比我還老。'], '放假、在台中',
      variantNote='寒假 1/26～2/18、暑假 7/1～8/25，`BB_171`；兩則輪流')
p.sit('chat', ['有學生來印講義，印了一整個下午。', '我在旁邊幫忙裝訂。'], '放假、在台中',
      variantNote='寒假 1/26～2/18、暑假 7/1～8/25，`BB_171`；兩則輪流')
p.sit('chat', ['剛洗完澡。下班回來都這個時間。'], '深夜', ['大一～大二'], variantNote='兩則輪流')
p.sit('chat', ['睡不著，在看一部很長的電影。', '還剩一個小時。'], '深夜', variantNote='兩則輪流')
p.add('course', 'A', ['我有抄，可是我的筆記很亂。', '（筆記的照片）', '看得懂再說。'])
p.add('course', 'A', ['這章我第一次修的時候就沒去了。', '所以這次有認真抄。', '（筆記的照片）'],
      ['閒聊 Z-L3 以後（她在 Z-L3 才說第一次修的事）'])
p.add('course', 'A', ['要交什麼我看一下。', '（課程網站的截圖）'])
p.add('course', 'R', ['分組那份，影片我剪到一半了。', '你負責的那段好了嗎？'], ['經原分組以後（兩人同一組，`BB_95`、`BB_130`）'],
      ask=ASK(O('好了。', ['傳給我，我剪進去。']), O('還沒。', ['好。那我先剪別人的。'])))
p.add('course', 'R', ['老師上次畫的那張圖，我抄在筆記最後一頁。', '（照片）'])
p.add('share_cat', 'A', ['牠在瞇眼睛。'])
p.add('share_food', 'A', ['這個醬看起來很下飯。'])
p.add('share_notes', 'A', ['上面那個圖我看懂了。下面的我放棄。'])
p.add('share_cat', 'R', ['牠的眼神好像我們店長。'], ['大一～大二'])
p.add('share_cat', 'R', ['你拍得比我好。我拍貓都糊掉。'])
p.add('share_food', 'R', ['他們的湯是免費的，可以續。', '我每次都續兩碗。'])
p.add('share_notes', 'R', ['（貓戴眼鏡的貼圖）', '我看不懂，可是排版很好看。'])
p.add('share_cat', 'L', ['你拍貓的時候都會蹲下來對不對。'])
p.add('share_food', 'L', ['你一個人吃喔。', '（貓戴眼鏡的貼圖）'])
p.add('share_notes', 'L', ['你在念書喔。那我不吵你。'])
p.add('night', 'R', ['剛下班。晚安。'], ['大一～大二，平日 22:00 下班後'])
p.add('night', 'R', ['晚安。明天是早班，我也要睡了。'], ['大一～大二，隔天是一、三、五'])
p.add('night', 'R', ['晚安。我也差不多了。'])
p.add('night', 'L', ['晚安。', '（貓戴眼鏡的貼圖）'])
p.add('night', 'L', ['晚安。我先睡了，眼睛已經閉一半了。'])
# ── BB_178 1-E 在英國：照交情聯絡（bb6baddf；AA-C 266210fe 核對定稿，任務 VAC-ZR-UK-1017）──
# 情況版 variant「在英國」（src/msg3d.js：她在英國的時候只用這一組，不用 Café 的句子）。層：朋友＝R（tierMin：好朋友、交往中也用）；
# 好朋友、曖昧（第 5 階以上，兩人都單身）＝L（tierMin：交往中也用）；交往中才有的＝L＋標籤「交往中」。
# 原文的標籤「大三上 9～10 月」拆成兩個條件；「12 月；大四 5 月」是兩種時候都可以，拆成兩則（同一句，時間不重疊）。
UK = '在英國'
p.sit('chat', ['在學校的放映室。今天排了三部。'], UK, tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('chat', ['在宿舍。窗外那棵樹的葉子掉光了。'], UK, ['11～2 月'], tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('chat', ['下午四點天就黑了。', '我還沒習慣。'], UK, ['11～1 月'], tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('chat', ['在超市。這邊的米很貴。'], UK, tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('chat', ['這邊的課都要討論。我還不太敢講話。'], UK, ['大三上', '9～10 月'], tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('chat', ['在寫報告。英文寫比中文慢三倍。'], UK, ['12 月'], tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('chat', ['在寫報告。英文寫比中文慢三倍。'], UK, ['大四', '5 月'], tier='R', src='BB_178 1-E 朋友 在幹嘛')
p.sit('share_cat', ['這邊的貓都不給摸。'], UK, tier='R', src='BB_178 1-E 朋友 分享')
p.sit('share_food', ['好想吃。這邊的湯都很淡。'], UK, tier='R', src='BB_178 1-E 朋友 分享')
p.sit('share_notes', ['你還在念這個喔。'], UK, tier='R', src='BB_178 1-E 朋友 分享')
p.sit('chat', ['剛從圖書館出來。', '（照片：圖書館前的路燈）', '你那邊很晚了吧。'], UK, tier='L', src='BB_178 1-E 好朋友、曖昧 在幹嘛')
p.sit('chat', ['今天的片我看不懂。', '明天再看一次。'], UK, tier='L', src='BB_178 1-E 好朋友、曖昧 在幹嘛')
p.sit('chat', ['（照片：一杯很淡的咖啡）', '學校的。我想念店裡的豆子。'], UK, tier='L', src='BB_178 1-E 好朋友、曖昧 在幹嘛')
p.sit('chat', ['在洗衣房等衣服。', '這邊的烘衣機要投硬幣，我每次都少一個。'], UK, tier='L', src='BB_178 1-E 好朋友、曖昧 在幹嘛')
p.sit('night', ['這邊才下午。', '你先睡。晚安。'], UK, tier='L', src='BB_178 1-E 好朋友、曖昧 晚安')
p.sit('night', ['晚安。我還有一堂課。'], UK, tier='L', src='BB_178 1-E 好朋友、曖昧 晚安')
p.sit('chat', ['在上課前的走廊。', '你那邊晚上了吧。吃了嗎？'], UK, ['交往中'], tier='L', src='BB_178 1-E 交往中 在幹嘛',
      ask=ASK(O('吃了。', ['吃什麼？']), O('還沒。', ['去吃。我等你。'])))
p.sit('chat', ['剛從放映室出來。眼睛好痠。'], UK, ['交往中'], tier='L', src='BB_178 1-E 交往中 在幹嘛')
p.sit('night', ['晚安。我晚一點也要睡，還有一份報告。'], UK, ['交往中'], tier='L', src='BB_178 1-E 交往中 晚安')
# 交往中每天一則（英國 23:00 她睡前＝台灣 07:00，夏令 06:00；輪流，用完從頭；第 8 則一個月最多一次）：src/msg3d.js MSG.ukDaily 照順序發
for i, m in enumerate([['今天看了兩部片。一部很好，一部我睡著了。'], ['（照片：宿舍窗外的路燈）', '要睡了。你那邊早安。'],
                       ['今天下雨。我沒帶傘，走回來的。'], ['同學問我台灣的咖啡。我講了很久。'], ['今天的課講一個日本的老導演。他的鏡頭幾乎都不動。'],
                       ['（照片：一張還沒寫的明信片）', '這張明天寄。'], ['好累。晚安。'], ['今天沒什麼事。只是想跟你說晚安。'],
                       ['學校的咖啡今天比較好喝。換了一個人煮。'], ['（照片：筆記本上寫滿的片名）', '這週的。']]):
    p.sit('daily', m, UK, ['交往中'] + (['一個月最多一次'] if i == 7 else []), tier='L', src='BB_178 1-E 交往中 每天一則 ' + str(i + 1),
          **({'affection': True} if i == 7 else {}))
people.append(p)

# ───────────────────────── BB_178 2 子晴 ─────────────────────────
p = P('heroine_04', '高子晴', 'BB_178 2', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：22～24 點最活躍；早上不回，下午兩點才醒。大四她在工作室上班（`BB_163` 第 2 節）：平日白天不回，下班以後回。',
    'openText': '什麼時候開：加了好友以後就開（PHONE-UNIFY-1030）；講到她遊戲的兩則 Q6 以後才出。',   # AA_538 4-1（b9d816288）取代 BB_178 的「Q6 以後」
    'habitText': '手機習慣：一句拆好幾則；不解釋，直接丟截圖、一個問號；插座貓貼圖（她自己畫的那隻）。',
    'wakeLine': ['早', '剛看到'],
    'otherText': ['開放：Q6 以後（0-1）。', '延到隔天：「早」／「剛看到」。',
                  '子晴、可昕、阿凱、方奕廷：沒有這個話題。（0-7 問課）'],
    'sectionText': {'night': '晚安（`CLOSE_FRIEND` 以上；曖昧、交往。祐廷和別人交往中不開）'},
}
p.add('chat', 'A', ['在寫東西', '（截圖：一大片紅色的錯誤訊息）'])
p.add('chat', 'A', ['在系館', '冷氣好冷'], ['學期中，大一～大三'])
p.add('chat', 'A', ['寫作業', '資工的', '你不會想知道'], ['學期中，大一～大三'])
p.add('chat', 'R', ['在寫東西', '卡住了', '你會寫程式嗎'],
      ask=ASK(O('不會。', ['沒關係', '我也快不會了']), O('一點點。', ['那幫我看這行', '（截圖）'])))
p.add('chat', 'R', ['在公館', '滷味', '（照片）'])
p.add('chat', 'R', ['在沙發上', '什麼都不想做'])
p.add('chat', 'L', ['在想要不要找你', '你就傳了'], ['只在立即回覆（她在線上、馬上回的那次）；帶感情的那一句'],
      affection=True, immediateOnly=True)
p.add('chat', 'L', ['在修 bug', '修好一個', '多出兩個'])
p.add('chat', 'L', ['在便利商店', '布丁買一送一', '（照片：兩個布丁）'])
AM = '大一～大三，14:00 以前；兩則輪流，之後接一般版，不接「你就傳了」'
p.sit('chat', ['早', '剛看到'], '上午傳的', variantNote=AM, thenGeneral=True)
p.sit('chat', ['剛起床', '（插座貓的貼圖）'], '上午傳的', variantNote=AM, thenGeneral=True)
p.sit('chat', ['在念', '好想睡'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['考完這科就自由了', '還有三科'], '考試週', variantNote='兩則輪流')
HOL = '她在臺北家裡，`BB_171`；兩則輪流，過年那幾天加第三則'
p.sit('chat', ['在家', '放假就是寫一整天'], '放假中', variantNote=HOL)
p.sit('chat', ['（截圖：她的遊戲新的一關）', '還沒做完'], '放假中', variantNote=HOL)
p.sit('chat', ['我爸回來了', '我躲在房間寫'], '放假中', ['過年那幾天，R 以上'], tier='R', variantNote=HOL)
p.sit('chat', ['在寫', '十二點以後最順'], '深夜', variantNote='兩則輪流')
p.sit('chat', ['剛 build 好', '（截圖）', '沒有紅字'], '深夜', variantNote='兩則輪流')
p.sit('chat', ['在工作室', '下班了還不想走'], '大四', variantNote='工作室；兩則輪流')
p.sit('chat', ['下班了', '在捷運上睡著坐過一站'], '大四', variantNote='工作室；兩則輪流')
# 芷若在英國（bb6baddf 第 2 節；R 以上，祐廷認識芷若；一段期間只播一次——src/msg3d.js）。三種照子晴×芷若的 ZZ 狀態（src/zrzq3d.js 的 MSG.tok）：
# 「兩人是朋友」＝沒有 ZZ 的舊存檔（備援）；好朋友＝friends、feelings_emerging、mutual_interest、held（AA_385 第 9 節選③，企劃線 028dc128）〔每月第一個週日以後那一週〕；
# 交往中＝dating（ZZ-MSGPOOL-LINE-1022）〔週日 22:30 以後〕
p.sit('chat', ['芷若發了一張下雨的照片', '她那邊好像每天都在下雨'], '芷若在英國', ['兩人是朋友'], tier='R',
      variantNote='R 以上，祐廷認識芷若；一段期間只播一次', src='BB_178 2 在幹嘛 芷若在英國')
p.sit('chat', ['芷若這個月打來了', '她說那邊的貓不給摸'], '芷若在英國', ['兩人是好朋友', '每月第一個週日以後那一週'], tier='R',
      variantNote='R 以上，祐廷認識芷若；一段期間只播一次', src='BB_178 2 在幹嘛 芷若在英國')
p.sit('chat', ['剛跟芷若視訊完', '她那邊才下午'], '芷若在英國', ['兩人交往中', '週日 22:30 以後'], tier='R',
      variantNote='R 以上，祐廷認識芷若；一段期間只播一次', src='BB_178 2 在幹嘛 芷若在英國')
p.add('share_cat', 'A', ['（插座貓的貼圖）'])
p.add('share_food', 'A', ['那個看起來很辣'])
p.add('share_notes', 'A', ['我看三行就睏了'])
# AA_538 4-2（b9d816288）：子晴分享的 A 層各補兩則（PHONE-UNIFY-1030；「看起來很油」「我要」同一回合）
p.add('share_cat', 'A', ['哪裡拍的'], src='AA_538 4-2')
p.add('share_cat', 'A', ['牠尾巴好短'], src='AA_538 4-2')
p.add('share_food', 'A', ['這間在哪'], src='AA_538 4-2')
p.add('share_food', 'A', ['看起來很油', '我要'], src='AA_538 4-2')
p.add('share_notes', 'A', ['字好小'], src='AA_538 4-2')
p.add('share_notes', 'A', ['你們的筆記都長這樣喔'], src='AA_538 4-2')
p.add('share_cat', 'R', ['牠在看你', '牠要你的飯'])
p.add('share_food', 'R', ['這個要加辣', '不加辣不能吃'])
p.add('share_notes', 'R', ['拍給我幹嘛', '好啦我看了', '看不懂'])
p.add('share_cat', 'L', ['你比較像牠'])
p.add('share_food', 'L', ['留一口給我'])
p.add('share_notes', 'L', ['你在念書', '那我也來寫', '（截圖：她打開的程式）'])
p.add('night', 'R', ['晚安', '我還要寫一下'])
p.add('night', 'R', ['睡吧', '我寫完這段就睡'])
p.add('night', 'L', ['晚安', '我再寫一個小時就睡', '真的'])
p.add('night', 'L', ['晚安', '（插座貓的貼圖）'])
people.append(p)

# ───────────────────────── BB_178 3 學姊 ─────────────────────────
p = P('heroine_05', '溫書瑀', 'BB_178 3', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：很準時：12:10（午餐）、17:05（收東西離開）、22:30（睡前）。22:30 以後不回，隔天 12:10 回。在美國時照美國時間（布魯明頓，美東；`AA_213` 第 2 節）。',
    'openText': bb_open('家族群組開學前就有；私訊在有點熟（`FAMILIAR`）、交換聯絡方式以後（`AA_124` 1-7）',
                        '她沒有伴侶（`BB_122` ★節，2026-10-17）。閒聊版＝雙方都單身、`FRIEND` 以上（`BB_70` 3-1）。祐廷交往中而且她知道（`AA_202` 第 4 節）＝事務版；其他條件不成立也是事務版（第 3 節）。美國路線（祐廷也在布魯明頓，`AA_213` 第 2 節）：照時差寫的句子不用，其他照常'),
    'habitText': '手機習慣：句號；不用貼圖（W8 以後某一天才第一次傳企鵝貼圖，`BB_70` 3-2，那一則照原設計，不放進回覆池）；寫的東西可以條列，這裡幾乎不用。',
    'wakeLine': ['抱歉，昨天十點半就睡了。'],
    'otherText': ['開放：0-1。她沒有伴侶（`BB_122` ★節）。閒聊版＝雙方都單身、`FRIEND` 以上；祐廷交往中而且她知道（`AA_202` 第 4 節）、或不到 `FRIEND`，用事務版。年級照 `AA_218` 第 1 節：祐廷大一＝她法四，大二＝碩一，大三＝碩二，大四＝碩三。',
                  '住家裡（`BB_171`）。祐廷大一（她法四）她在總圖三樓；大二起（碩一）在研究室或法學院圖書館。',
                  '學姊（學長姐，她在美國時不給）（0-7 問課）'],
    'sectionText': {'事務版': '事務版（閒聊條件不成立時：A 層、不到 `FRIEND`、祐廷交往中而且她知道）',
                    'chat_閒聊版': '閒聊版：在幹嘛（雙方都單身、`FRIEND` 以上）',
                    'course': '問課（她不在美國時；事務版、閒聊版都一樣）',
                    'share_閒聊版': '分享（閒聊版）',
                    'night': '晚安（閒聊版；`CLOSE_FRIEND` 以上；曖昧、交往）',
                    'night_事務版': '晚安｜不開'},
}
SW = '事務版'
XL = '閒聊版'
ASK_TW = ASK(O('沒事。', ['好。']), O('想問課。', [], cond='接到問課（問課開的時候才有這個選項）', goto='course'))
ASK_US = ASK(O('沒事。', ['好。']), O('想問妳那邊好不好。', ['很好。很冷。'], cond='在美國時換成'))
p.add('chat', 'A', ['總圖三樓。有事嗎？'], ['祐廷大一（她法四）'], variant=SW, version=SW, ask=copy.deepcopy(ASK_TW),
      src='BB_178 3 事務版 在幹嘛')
p.add('chat', 'A', ['在研究室。有事嗎？'], ['祐廷大二起（她碩一），在臺灣'], variant=SW, version=SW,
      ask=copy.deepcopy(ASK_TW), src='BB_178 3 事務版 在幹嘛')
p.add('chat', 'A', ['在這邊的圖書館。有事嗎？'], ['在美國'], variant=SW, version=SW, ask=ASK_US,
      src='BB_178 3 事務版 在幹嘛')
# AA_370 第 6 節第 3 題（9eaf4e98）：祐廷也在布魯明頓時上面那則不用（L6），補這一句；沒有後面的追問
p.add('chat', 'A', ['在圖書館。有事嗎？'], ['祐廷也在美國'], variant=SW, version=SW,
      src='AA_370 6-3 事務版 在幹嘛（祐廷也在布魯明頓）')
p.add('share_cat', 'A', ['看到了。'], variant=SW, version=SW, src='BB_178 3 事務版 分享')
p.add('share_food', 'A', ['吃完記得喝水。'], variant=SW, version=SW, src='BB_178 3 事務版 分享')
p.add('share_notes', 'A', ['哪裡看不懂再問。'], variant=SW, version=SW, src='BB_178 3 事務版 分享')
p.add('chat', 'R', ['在研究室。大家都去吃飯了。'], ['祐廷大二起，在臺灣'], variant=XL, version=XL, src='BB_178 3 閒聊版 在幹嘛')
p.add('chat', 'R', ['剛收東西，要去捷運站。'], ['在臺灣，17:05 那次回覆'], variant=XL, version=XL, src='BB_178 3 閒聊版 在幹嘛')
p.add('chat', 'R', ['在讀判決。第三份了，眼睛有點酸。'], variant=XL, version=XL, src='BB_178 3 閒聊版 在幹嘛')
p.add('chat', 'L', ['在法圖。這裡比研究室安靜。'], ['在臺灣'], variant=XL, version=XL, src='BB_178 3 閒聊版 在幹嘛')
p.add('chat', 'L', ['在改論文的第二章。', '第四版了。'], ['大四'], variant=XL, version=XL, src='BB_178 3 閒聊版 在幹嘛')
p.add('chat', 'L', ['在研究室。', '茶泡了兩杯，才發現只有我一個人。'], ['祐廷大二起，在臺灣；帶感情的那一句'],
      variant=XL, version=XL, affection=True, src='BB_178 3 閒聊版 在幹嘛')
p.sit('chat', ['在讀。考完再說。'], '考試週', version='事務版、閒聊版都用', variantNote='事務版、閒聊版都用；兩則輪流',
      src='BB_178 3 閒聊版 在幹嘛 考試週')
p.sit('chat', ['考試週。有急事再傳。'], '考試週', version='事務版、閒聊版都用', variantNote='事務版、閒聊版都用；兩則輪流',
      src='BB_178 3 閒聊版 在幹嘛 考試週')
US = '2028-08-02 出發到 12-23 回台，每條路線都一樣，`BB_204` 4c；照人在哪裡判斷，不照學期；照她那邊回覆的時間挑'
p.sit('chat', ['剛吃完午餐。這邊的三明治很大。'], '在美國', ['12:10'], tier='R', version=XL, variantNote=US,
      src='BB_178 3 閒聊版 在幹嘛 在美國')
p.sit('chat', ['從圖書館出來了。天已經黑了。'], '在美國', ['17:05', '12 月'], tier='R', version=XL, variantNote=US,
      note='月份照 `AA_213` 改，句子沒動，請 AA 看', src='BB_178 3 閒聊版 在幹嘛 在美國')
p.sit('chat', ['從圖書館出來了。這邊風好大。'], '在美國', ['17:05', '8～11 月'], tier='R', version=XL, variantNote=US,
      note='月份照 `AA_213` 改，句子沒動，請 AA 看', src='BB_178 3 閒聊版 在幹嘛 在美國')
p.sit('chat', ['要睡了。'], '在美國', ['22:30'], tier='R', version=XL, variantNote=US, note='同上',
      addIf={'tag': '11～12 月才有第二則', 'msgs': ['這邊的暖氣很乾。']}, src='BB_178 3 閒聊版 在幹嘛 在美國')
BOTH = '事務版、閒聊版都一樣'
p.add('course', 'A', ['題目拍給我。', '先找條文，再對要件。你先寫，寫完再拍給我。'], version=BOTH)
p.add('course', 'A', ['這段我以前也沒抄到。去問老師，有人問他會很高興。'], version=BOTH)
p.add('course', 'R', ['要交什麼，看課程網站最上面那則公告。', '你看了沒？'], version=BOTH,
      ask=ASK(O('看了。', ['好。']), O('還沒。', ['現在去看。'])))
p.add('course', 'R', ['這題我們以前也吵過。你先寫你的，我看完再說我的想法。'], version=BOTH)
p.sit('course', ['考試週不教新的。範圍有問題可以問。'], '考試週', version=BOTH)
p.add('share_cat', 'R', ['牠在曬太陽。我也想曬。'], variant=XL, version=XL, src='BB_178 3 分享（閒聊版） 貓')
p.add('share_food', 'R', ['點他們的湯。那個比主餐好。'], variant=XL, version=XL, src='BB_178 3 分享（閒聊版） 吃的')
p.add('share_notes', 'R', ['第二頁那段，下面那行比較重要。'], variant=XL, version=XL, src='BB_178 3 分享（閒聊版） 講義')
p.add('share_cat', 'L', ['好可愛。存起來了。'], variant=XL, version=XL, src='BB_178 3 分享（閒聊版） 貓')
p.add('share_food', 'L', ['你有好好吃飯，很好。'], variant=XL, version=XL, src='BB_178 3 分享（閒聊版） 吃的')
p.add('share_notes', 'L', ['這份我留著。我以前的筆記可以跟它對著看。'], variant=XL, version=XL, src='BB_178 3 分享（閒聊版） 講義')
p.add('night', 'R', ['晚安。我也要睡了。'], variant=XL, version=XL)
p.add('night', 'R', ['晚安。明天記得吃早餐。'], variant=XL, version=XL)
p.add('night', 'L', ['晚安。', '手機我放遠一點了。'], variant=XL, version=XL)
p.add('night', 'L', ['晚安。我把燈關了。'], variant=XL, version=XL)
p.add('night', 'R', ['中午了，我在吃三明治。', '你睡吧。'], ['在美國，不是美國路線（台灣的晚上是她那邊的早上，她 12:10 才回）'],
      variant='在美國', version=XL, tierMin=True, tierCell='—', src='BB_178 3 晚安')
# AA_393 第 4 節（企劃線 SIS-B7-1023，AA-B 2026-10-23）：祐廷在日本（日本路線 3/25～8/5）——這個標籤優先（AA_202 3-1 第 2 點）；每一格只出一次（msg3d.js 記 once），之後回到一般句。
# 朋友以上＝沒交往（R 起，tierMin：好朋友也用）；交往中＝L。分享（照片）：朋友那句講吃的，只放 share_food；交往中那句三種分享都用（同一句只出一次）。
JP = '祐廷在日本'
for t in ['總圖。你那邊比我晚一個小時睡，記得。', '研究室。今天寫了三頁，刪了一頁。']:
    p.sit('chat', [t], JP, ['沒交往'], tier='R', version=XL, src='AA_393 4 在幹嘛 祐廷在日本')
p.sit('chat', ['研究室。……你那邊吃晚餐了嗎。'], JP, ['交往中'], tier='L', version=XL, src='AA_393 4 在幹嘛 祐廷在日本（交往中）')
p.sit('share_food', ['日本的便利商店比較好吃嗎。不用回答，我會想去。'], JP, ['沒交往'], tier='R', version=XL, src='AA_393 4 分享 祐廷在日本')
for tp in ['share_cat', 'share_food', 'share_notes']:
    p.sit(tp, ['拍得不錯。下次拍你自己。'], JP, ['交往中'], tier='L', version=XL, src='AA_393 4 分享 祐廷在日本（交往中）')
p.sit('night', ['晚安。你那邊已經過十二點了，快睡。'], JP, ['沒交往'], tier='R', version=XL, src='AA_393 4 晚安 祐廷在日本')
p.sit('night', ['晚安。你那邊比較早天亮，窗簾記得拉。'], JP, ['交往中'], tier='L', version=XL, src='AA_393 4 晚安 祐廷在日本（交往中）')
people.append(p)

# ───────────────────────── BB_178 4 沛珊 ─────────────────────────
p = P('classmate_peishan', '郭沛珊', 'BB_178 4', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '重考消失期（P4 交接讀書會 2026-12-17〔大二上第 15 週〕之後，到 2027-08-06 放榜那天，`BB_194` §19；2026-10-17 BB-C：P4 從大二下第 1 週搬過來）：按鈕照開，訊息只顯示「已送達」、不顯示已讀，她不回；放榜那天她自己先傳（`BB_119` 1b-3）',
    'openText': bb_open('交換聯絡方式以後（迎新宿營 `BB_177` 3-2，或第 6 週 P2）',
                        '一直開；問課只到大二上。重考消失期（P4 交接讀書會 2026-12-17〔大二上第 15 週〕之後，到 2027-08-06 放榜那天，`BB_194` §19；2026-10-17 BB-C：P4 從大二下第 1 週搬過來）：按鈕照開，訊息只顯示「已送達」、不顯示已讀，她不回；放榜那天她自己先傳（`BB_119` 1b-3）'),
    'habitText': '手機習慣：不熟的時候小心、客氣，句子短，很少驚嘆號；熟了以後訊息變長、段落分明，常傳一張書頁的照片，劃了一行線；23:00 以後最常傳。大三起（課輔班以後）訊息變快樂，常有小孩說的好笑的話。',
    'wakeLine': [],
    'otherText': ['開放：0-1。',
                  '她在哪裡：大一上週五傍晚搭客運回台中；大二下在台中家裡重考；大三起在別的學校（教育相關科系）、課輔班、書店打工，進不去總圖（`BB_163`）。讀書會只到大二上。',
                  '沛珊（同班，大一上～大二上）（0-7 問課）'],
    'sectionText': {'course': '問課（同班；大一上～大二上，大二下她不常去上課，大三起在別的學校）',
                    'night': '晚安（`CLOSE_FRIEND` 以上；曖昧、交往。祐廷和別人交往中不開）'},
}
p.add('chat', 'A', ['在畫行事曆，把下禮拜的事寫進去。'])
p.add('chat', 'A', ['坐到總圖靠窗的位子了。'], ['大一～大二上'])
p.add('chat', 'A', ['剛洗完澡，準備念書。'], ['晚上'])
p.add('chat', 'A', ['在宿舍。室友在講電話，我在等她講完。'], ['大一～大二上'])
p.add('chat', 'R', ['在想讀書會的題目，想了一個晚上，還是覺得兩邊都有道理。', '你在幹嘛？'], ['大一～大二上，晚上'],
      ask=ASK(O('也在念書。', ['好，那我們各念各的。']), O('在發呆。', ['發呆很好啊，我也想。'])))
p.add('chat', 'R', ['在幫我媽想早餐店的新菜單。', '她說要年輕人會點的。我想了三個，都被她打槍。'])
p.add('chat', 'R', ['在搭客運，過林口了。'], ['大一上，週五傍晚以後'])
p.add('chat', 'L', ['在念書。念到一半想問你一件事，結果忘了是什麼。'])
p.add('chat', 'L', ['在床上。剛把今天的事寫在本子上。', '有一半是你。'], ['帶感情的那一句（她什麼都抄，`BB_70` 6-1）'], affection=True)
p.add('chat', 'L', ['在改課輔班的作業。', '有個小朋友把『法官』寫成『法館』。'], ['大三起'])
p.sit('chat', ['在總圖。整層都是人，連樓梯都有人坐。'], '考試週', ['大一～大二上'], variantNote='兩則輪流')
p.sit('chat', ['在宿舍念。總圖沒位子了。'], '考試週', ['大一～大二上'], variantNote='兩則輪流')
p.sit('chat', ['在改作業。我們學校考試的時間跟你們不一樣。'], '考試週', ['大三起'])
TY = '寒假 12/20～2/19，`BB_171`；三則輪流'
p.sit('chat', ['在早餐店。五點就起來了。'], '放假、在台中', variantNote=TY)
p.sit('chat', ['（照片：一整盤煎好的蛋）', '這一盤是我煎的。'], '放假、在台中', variantNote=TY)
p.sit('chat', ['店裡收了。下午在補眠。'], '放假、在台中', variantNote=TY)
p.sit('chat', ['在念書。', '（照片：桌上一疊書，旁邊一杯豆漿）'], '大二下在家重考', variantNote='兩則輪流')
p.sit('chat', ['在店裡幫忙一下，等一下回去念。'], '大二下在家重考', variantNote='兩則輪流')
p.sit('chat', ['剛從課輔班出來。有個小朋友問我，法官是不是都很兇。'], '大三起、課輔班那天', variantNote='週二～四 19:00 以後；兩則輪流')
p.sit('chat', ['剛下課輔班。有人把便當打翻，我們一起擦了二十分鐘。'], '大三起、課輔班那天', variantNote='週二～四 19:00 以後；兩則輪流')
p.sit('chat', ['在書店。沒什麼人，我在整理童書區。'], '大三起、書店那天', variantNote='週六、週日下午')
p.sit('chat', ['睡前想到一個問題。', '算了，太晚了，下次再問你。'], '深夜', variantNote='兩則輪流')
p.sit('chat', ['在把上課抄的整理到另一本。'], '深夜', ['大一～大二上'], variantNote='兩則輪流')
p.add('course', 'A', ['有，我拍給你。', '（筆記的照片）', '後面那段我也沒有很懂。'])
p.add('course', 'A', ['下禮拜要交的我寫在行事曆上，我看一下。', '（截圖）'])
p.add('course', 'A', ['這題我還沒想通。我先去看老師的投影片，看完跟你說。'])
p.add('course', 'R', ['有抄到，不過老師講故事那段我抄最多，我覺得那段比較重要。', '（筆記的照片）'])
p.add('course', 'R', ['這題我寫了兩種答案，不知道哪個對。', '你寫完我們交換看？'],
      ask=ASK(O('好。', ['好，那我先寫完。']), O('我還沒寫。', ['那你寫完再跟我說。'])))
p.add('course', 'R', ['我抄到了。旁邊有我自己寫的問題，你不用管。', '（筆記的照片）'])
p.sit('course', ['我整理了一份重點，傳給你。', '（檔案）', '有錯的話跟我說。'], '考試週')
p.add('share_cat', 'A', ['牠的腳是白色的，好像穿襪子。'])
p.add('share_food', 'A', ['我家早餐店也有賣類似的。'])
p.add('share_notes', 'A', ['你也劃這行。我也劃了。'], ['大一～大二上'])
p.add('share_cat', 'R', ['牠坐得好端正，像在上課。'])
p.add('share_food', 'R', ['你吃這個喔。要吃青菜啦。'])
p.add('share_notes', 'R', ['這頁老師講好快，我只抄到一半。'])
p.add('share_cat', 'L', ['牠跟你好像，都在發呆。'])
p.add('share_food', 'L', ['下次換我帶你去吃早餐。我家的。'], ['祐廷在臺灣'])   # AA_531 8-3（企劃線 41ec9a6ac）：祐廷在國外（美國、日本）用下一行
p.add('share_food', 'L', ['你回來，換我帶你去吃早餐。我家的。'], ['祐廷在國外'], src='AA_531 8-3 在國外的版本')
p.add('share_notes', 'L', ['你在念書喔？我也在。', '（照片：她桌上的書和一杯豆漿）'])
p.add('night', 'R', ['晚安。我也要關燈了。'])
p.add('night', 'R', ['晚安。', '（照片：收好的包包）'])
p.add('night', 'L', ['晚安。', '我把鬧鐘調好了。'])
p.add('night', 'L', ['晚安。手機要充電喔。'])
people.append(p)

# ───────────────────────── BB_178 5 可昕 ─────────────────────────
p = P('kexin', '杜可昕', 'BB_178 5', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': None,
    'openText': bb_open('只有 L 層：法律系開場預設和祐廷交往中',
                        '分開以後不開（走向 B 她不出現，走向 C 只有生日那一句，`BB_107`、`AA_112`）。經濟系前傳不在這份；前傳要用這個功能時告訴 BB，另寫'),
    'habitText': '手機習慣：短；累了傳長頸鹿貼圖；人在政大，常提「坡」「山下」。熟了講很普通的小事：吃什麼、報告好煩、予樂又怎樣（`AA_188`）。可昕沒有假設題（使用者 10-18）。',
    'wakeLine': [],
    'otherText': ['開放：只有 L 層；分開了就不開（0-1）。',
                  '祐廷在國外：她每晚的訊息、通話照遠距線（`BB_107`）另外跑；玩家主動傳的照這裡，時差照 `AA_144` 5-2。',
                  '子晴、可昕、阿凱、方奕廷：沒有這個話題。（0-7 問課）'],
    'sectionText': {'night': '晚安（交往中）'},
}
p.add('chat', 'L', ['在爬坡。', '快到了。'])
p.add('chat', 'L', ['在圖書館。', '予樂在旁邊睡著了。'], ['學期中'])
p.add('chat', 'L', ['在宿舍。予樂在講她的報告，講了四十分鐘。'], ['學期中'])
p.add('chat', 'L', ['在等公車。', '你呢？'],
      ask=ASK(O('在念書。', ['好。我也要開始念了。']), O('在宿舍。', ['我也快到了。'])))
p.add('chat', 'L', ['予樂問我在跟誰傳訊息。', '我說不告訴她。'], ['學期中；帶感情的那一句'], affection=True)
p.sit('chat', ['在念。不要吵我。', '……十分鐘後可以吵。'], '考試週', tier='L', variantNote='兩則輪流')
p.sit('chat', ['在念。', '（長頸鹿貼圖）'], '考試週', tier='L', variantNote='兩則輪流')
KH = '她家不寫在哪裡，`BB_104`；寒假 1/2～2/19、暑假兩週；兩則輪流'
p.sit('chat', ['在家。', '（照片：窗外一條很普通的街）', '這裡什麼都沒有，很好念書。'], '放假、在家', tier='L', variantNote=KH)
p.sit('chat', ['在家。', '（長頸鹿貼圖）'], '放假、在家', tier='L', variantNote=KH)
p.sit('chat', ['在寫報告。', '寫到第三頁了。'], '深夜', tier='L', variantNote='兩則輪流')
p.sit('chat', ['睡不著。', '在滑山下那家店的菜單。'], '深夜', tier='L', variantNote='兩則輪流')
p.sit('chat', ['我這邊要睡了。', '你那邊應該才剛開始。'], '祐廷在國外', ['美國路線'], tier='L', variantNote='只在她那邊 23:30 以後')
p.sit('chat', ['我這邊十二點了。', '你那邊一點了，快去睡。'], '祐廷在國外', ['日本路線'], tier='L', variantNote='只在她那邊 23:30 以後')
p.add('share_cat', 'L', ['（長頸鹿貼圖）', '政大的貓比較胖。'], ['學期中'])
p.add('share_cat', 'L', ['（長頸鹿貼圖）', '我家巷口的貓比政大的還胖。'], ['在老家'])   # AA-C 2026-10-18（AA_276：寒暑假她在高雄）
p.add('share_food', 'L', ['下次你來政大，我帶你吃這邊的。'], ['學期中'])
p.add('share_food', 'L', ['高雄的你沒吃過。你來我再帶你去。'], ['在老家'])
p.add('share_notes', 'L', ['我們的講義也這樣。', '法律系都一樣。'])
p.add('night', 'L', ['晚安。', '（長頸鹿貼圖）'])
p.add('night', 'L', ['晚安。予樂已經在打呼了。'], ['學期中'])
people.append(p)

# ───────────────────────── BB_178 6 阿凱 ─────────────────────────
p = P('kai', '阿凱', 'BB_178 6', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：凌晨兩點到四點最活躍；白天睡到下午一點，一點以前傳的，一點才回。',
    'openText': bb_open('開場就有（室友）', '一直開'),
    'habitText': '手機習慣：沒有標點，偶爾「所以」開頭；遊戲連結。不是戀愛對象，沒有 L。',
    'wakeLine': ['剛醒'],
    'otherText': ['延到隔天／一點以前傳的：「剛醒」，再接一般版（玩家傳的是晚安就只回「剛醒」）。',
                  '大一是室友；大二起分開住（`BB_97` K3）。',
                  '子晴、可昕、阿凱、方奕廷：沒有這個話題。（0-7 問課）'],
    'sectionText': {'night': '晚安（`CLOSE_FRIEND` 以上）'},
}
p.add('chat', 'A', ['打遊戲'])
p.add('chat', 'A', ['寫作業 好難'], ['學期中'])
p.add('chat', 'A', ['在網拍上看鍵盤'])
p.add('chat', 'R', ['在跑程式 跑十分鐘了還沒好'], ['學期中'])
p.add('chat', 'R', ['在等宵夜 你要不要'], ['深夜'],
      ask=ASK(O('要。', ['好 我幫你買 錢再給我']), O('不用。', ['好 那我吃兩份'])))
p.add('chat', 'R', ['所以你要不要上線 缺一個'], ask=ASK(O('好。', ['上']), O('不要。', ['好 下次'])))
p.sit('chat', ['在念 真的在念', '（照片：打開的課本，旁邊有遊戲手把）'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['考完這科我要睡一整天'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['在店裡顧櫃台 修了三台還有兩台'], '寒假留宿舍、公館電腦行打工', variantNote='`BB_171`；兩則輪流')
p.sit('chat', ['在店裡 有個阿伯拿二十年前的電腦來修'], '寒假留宿舍、公館電腦行打工', variantNote='`BB_171`；兩則輪流')
p.sit('chat', ['在宜蘭 我媽一直餵我'], '過年回宜蘭', variantNote='2/13～2/20；兩則輪流')
p.sit('chat', ['在宜蘭 網路好慢'], '過年回宜蘭', variantNote='2/13～2/20；兩則輪流')
p.sit('chat', ['醒著 剛吃完宵夜'], '深夜', variantNote='兩則輪流')
p.sit('chat', ['在打排位 等等再說'], '深夜', variantNote='兩則輪流')
p.sit('chat', ['在新宿舍 室友很安靜 有點不習慣'], '大二上剛分開住', variantNote='這一段期間只播一次')
p.add('share_cat', 'A', ['（一個貓咪遊戲的連結）'])
p.add('share_food', 'A', ['看起來可以'])
p.add('share_notes', 'A', ['看不懂 但看起來很難'])
p.add('share_cat', 'R', ['牠比你可愛'])
p.add('share_food', 'R', ['我也要 幫我帶'])
p.add('share_notes', 'R', ['所以這個要背喔', '辛苦了'])
p.add('night', 'R', ['晚安 我才剛要開始'])
p.add('night', 'R', ['晚安', '（遊戲連結）', '醒來看'])
people.append(p)

# ───────────────────────── BB_178 7 明軒 ─────────────────────────
p = P('classmate_mingxuan', '江明軒', 'BB_178 7', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：二、四、六 19～21 家教不回，21:05 一次回。',
    'openText': bb_open('交換聯絡方式以後（`BB_172`）', '一直開'),
    'habitText': '手機習慣：表情符號、玩笑；「哈哈」只在訊息，大概三句一次（不是每句的格式）。從來不在訊息裡講累。不是戀愛對象，沒有 L。',
    'wakeLine': ['昨天睡死 哈哈'],
    'otherText': ['他不讓人看到他念書（M1 才揭露，`BB_40`）：講到自己在念書的句子都要 `SAW_HIM_STUDY`；沒有的玩家照他的掩飾說法。',
                  '明軒（同班）（0-7 問課）'],
    'sectionText': {'course': '問課（同班）', 'night': '晚安（`CLOSE_FRIEND` 以上）'},
}
p.add('chat', 'A', ['在打球 哈哈'])
p.add('chat', 'A', ['剛下課 要去家教'], ['學期中，週二、週四下午'])
p.add('chat', 'A', ['在圖書館 假裝很認真 😎'])
p.add('chat', 'R', ['在公車上 讀一點書 🚌', '你呢'], ['`SAW_HIM_STUDY`'],
      ask=ASK(O('在念書。', ['一起加油 💪']), O('在打電動。', ['好羨慕'])))
p.add('chat', 'R', ['在公車上 🚌', '看窗外'], ['沒有 `SAW_HIM_STUDY`'])
p.add('chat', 'R', ['在比兩家便當', '一家多一顆滷蛋 哈哈'])
p.add('chat', 'R', ['在宿舍 洗衣服 等它轉完'])
p.sit('chat', ['剛家教完 你說什麼'], '家教日 21:05', thenGeneral=True)
p.sit('chat', ['在念 念完三章了 😎'], '考試週', ['有 `SAW_HIM_STUDY`'])
p.sit('chat', ['在公車上念 公車比較安靜'], '考試週', ['有 `SAW_HIM_STUDY`'])
p.sit('chat', ['考試週 在打球紓壓 哈哈'], '考試週', ['沒有 `SAW_HIM_STUDY`'], tagSourceText='沒有')
p.sit('chat', ['在圖書館 睡覺 😴'], '考試週', ['沒有 `SAW_HIM_STUDY`'], tagSourceText='沒有')
p.sit('chat', ['在學生家 他在寫考卷 我在等'], '寒假留臺北家教',
      ['白天的寒假班：學生寫題目時他會看手機；晚上二四六的家教照樣不回'], variantNote='`BB_171`；兩則輪流')
p.sit('chat', ['寒假也在家教 多接一個寒假班'], '寒假留臺北家教', variantNote='`BB_171`；兩則輪流')
p.sit('chat', ['在彰化 機車行好多人', '（照片：一排等修的機車）'], '過年回彰化', variantNote='2/13～2/19；8 月中一週；兩則輪流')
p.sit('chat', ['在彰化 我弟在念書 我不敢吵他'], '過年回彰化', variantNote='2/13～2/19；8 月中一週；兩則輪流')
p.sit('chat', ['在改學生的考卷 😵'], '深夜', variantNote='兩則輪流')
p.sit('chat', ['睡不著 在看籃球精華'], '深夜', variantNote='兩則輪流')
p.add('course', 'A', ['（筆記的照片）', '拍歪了 將就一下'])
p.add('course', 'A', ['這題我想了一下 想不出來 哈哈'])
p.add('course', 'A', ['要交什麼我也忘了', '群組有寫 你看一下'])
p.add('course', 'R', ['有 我拍給你', '（筆記的照片）', '老師講太快 後面沒抄完'])
p.add('course', 'R', ['下禮拜要交的那份 我還沒開始 😇'],
      ask=ASK(O('我也還沒。', ['那我們都完了']), O('我寫完了。', ['好厲害 借我看架構就好'])))
p.sit('course', ['考試週不要問我 我也在崩潰 哈哈'], '考試週')
p.add('share_cat', 'A', ['哈哈 這隻好胖 🐱'])
p.add('share_food', 'A', ['看起來不錯 😋'])
p.add('share_notes', 'A', ['這張我還沒看 😇'])
p.add('share_cat', 'R', ['牠在看鏡頭 好專業'])
p.add('share_food', 'R', ['多少 🤔'], ask=ASK(O('一百。', ['可以']), O('兩百。', ['下次我帶你去便宜的'])))
p.add('share_notes', 'R', ['借我拍', '我那張被我壓到泡麵'])
p.add('night', 'R', ['晚安 😴'])
p.add('night', 'R', ['晚安 好夢 哈哈'])
people.append(p)

# ───────────────────────── BB_178 8 方奕廷 ─────────────────────────
p = P('npc_fangyt', '方奕廷', 'BB_178 8', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：上山時沒有訊號，下山後一次回好幾則。',
    'openText': bb_open('交換聯絡方式以後（`BB_172`）', '一直開；祐廷大四他在嘉義工作，用大四版'),
    'habitText': '手機習慣：很有禮貌，句號；會附植物照片和名字，最後一句很短的真話。每個話題最多一句講植物，其他就是一般大學生。「學弟好」只在不熟的時候用一次。不是戀愛對象，沒有 L。',
    'wakeLine': [],
    'otherText': ['他的學年：祐廷大一時他森林系大二，住隔壁房；祐廷大三上他在山上做畢業專題；祐廷大四他在嘉義的工作站上班（`BB_40`、`BB_171`）。下面的一般版用在祐廷大一～大三，大四用大四版。',
                  '有空｜1～10 分鐘（照個性：以安、阿哲快；語彤、方奕廷慢）（AA_202 第 2 節）',
                  '子晴、可昕、阿凱、方奕廷：沒有這個話題。（0-7 問課）'],
    'sectionText': {'night': '晚安（`CLOSE_FRIEND` 以上）'},
}
p.add('chat', 'A', ['學弟好。剛從系館出來。'], ['學期中'])
p.add('chat', 'A', ['在宿舍，剛洗完衣服。'])
p.add('chat', 'A', ['在吃飯。'])
p.add('chat', 'R', ['在溫室澆水。有一株蘭花開了。', '（照片）'], ['學期中'])
p.add('chat', 'R', ['在系館念書。'], ['學期中'],
      ask=ASK(O('我也在念書。', ['那我們都念。']), O('在休息。', ['我也想休息。'])))
p.add('chat', 'R', ['在宿舍。你們那間在打電動，我這邊聽得到。'], ['祐廷大一（他住隔壁）'])
MT = '他的行程：大三上畢業專題的出隊日、暑假 7 月調查兩週、過年初一大雪山，`BB_171`；下山才回，兩則輪流'
p.sit('chat', ['下山了，剛看到。', '（照片）', '（照片）', '這是山上的苔。'], '在山上', variantNote=MT)
p.sit('chat', ['剛下山。三天沒洗頭。'], '在山上', variantNote=MT)
p.sit('chat', ['在實驗林整理樣本。', '這裡訊號一格，可能會斷。'], '在實驗林', variantNote='出隊日、有一格訊號的地方')
p.sit('chat', ['要早起上山，我先睡了。'], '出隊前一晚', note='晚安也用這句')
p.sit('chat', ['在念書。考完要去爬山。'], '考試週')
p.sit('chat', ['回家了。陽台我種了三盆，都澆了。'], '放假、在台中', variantNote='寒假 1/24～2/18；兩則輪流')
p.sit('chat', ['回家了。跟高中同學去爬大坑。'], '放假、在台中', variantNote='寒假 1/24～2/18；兩則輪流')
p.sit('chat', ['在整理拍的照片。', '還有很多張。'], '深夜')
p.sit('chat', ['在工作站。今天在苗圃。'], '大四（嘉義工作站）', variantNote='三則輪流')
p.sit('chat', ['剛下班。嘉義的雞肉飯真的比較好吃。'], '大四（嘉義工作站）', variantNote='三則輪流')
p.sit('chat', ['在宿舍。這邊晚上很安靜。'], '大四（嘉義工作站）', variantNote='三則輪流')
p.add('share_cat', 'A', ['牠後面那叢是七里香。'])
p.add('share_food', 'A', ['看起來很燙。'])
p.add('share_notes', 'A', ['（照片：他的講義，一整頁手繪的葉子）', '交換一下。'])
p.add('share_cat', 'R', ['牠睡得好熟。'])
p.add('share_food', 'R', ['旁邊有一棵很老的榕樹，你下次經過看一下。'])
p.add('share_notes', 'R', ['這頁看起來很難。', '考完要不要去爬山？'],
      ask=ASK(O('好。', ['那我排一條簡單的。']), O('再說。', ['好。'])))
p.add('night', 'R', ['晚安。'])
p.add('night', 'R', ['晚安。宿舍走廊的燈剛關，我也要睡了。'], ['大一～大三'])
p.add('night', 'R', ['要早起上山，我先睡了。'], ['隔天是出隊日'])
people.append(p)

# ───────────────────────── BB_178 8b Kevin ─────────────────────────
p = P('kevin', 'Kevin', 'BB_178 8b', BB_L)
p.rules = {
    'replyFree': None,
    'noReplyText': '回覆時間：回得快（幾分鐘內）；上課中下課才回。',
    'openText': bb_open('開場就有（家族群組，同家族的大二學長；直屬只有學姊）',
                        '一直開；祐廷大四他已經畢業：不用「系學會」「上課」的句子，問課不開'),
    'habitText': '手機習慣：話多、熱絡、愛張羅；句尾的「啦」「欸」「齁」「喔」混著用，不是每句都加；常叫人傳到家族群組。比祐廷大一屆，系學會。住家裡（`BB_171`）。不是戀愛對象，沒有 L。',
    'wakeLine': [],
    'otherText': ['他的學年：祐廷大一～大三他大二～大四；祐廷大四他已經畢業，「系學會」「上課」的句子不用，問課不開。',
                  'Kevin（學長，祐廷大一～大三）（0-7 問課）'],
    'sectionText': {'course': '問課（學長；祐廷大一～大三）', 'night': '晚安（`CLOSE_FRIEND` 以上）'},
}
p.add('chat', 'A', ['在滑家族群組，你們這屆好安靜'])
p.add('chat', 'A', ['在系學會開會，好無聊'], ['學期中，祐廷大一～大三'])
p.add('chat', 'A', ['在幫系上搬東西啦'], ['學期中，祐廷大一～大三'])
p.add('chat', 'A', ['在捷運上，要回家了'], ['晚上'])
p.add('chat', 'R', ['在幫家族排聚餐的時間，大家都不回齁'])
p.add('chat', 'R', ['在家，等等要出門買宵夜'], ['晚上'])
p.add('chat', 'R', ['在公館買東西，你有要什麼嗎？'],
      ask=ASK(O('不用。', ['好喔']), O('幫我買飲料。', ['你自己來拿啦，我又不是外送'])))
p.sit('chat', ['在念啦，這科很要命'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['考完再說，我現在連家族群組都沒空看'], '考試週', variantNote='兩則輪流')
p.sit('chat', ['在家，放假就是睡到中午'], '放假', variantNote='兩則輪流')
p.sit('chat', ['在補習班當助教，國中生好吵'], '放假', ['暑假'], variantNote='兩則輪流')
p.sit('chat', ['在日本！', '（照片）'], '大一寒假在日本', variantNote='1/24～1/31，`BB_171`；兩則輪流')
p.sit('chat', ['這邊好冷，照片我等等傳群組'], '大一寒假在日本', variantNote='1/24～1/31，`BB_171`；兩則輪流')
p.sit('chat', ['還沒睡，在弄系學會的海報'], '深夜', ['學期中，祐廷大一～大三'], variantNote='兩則輪流')
p.sit('chat', ['在看球賽重播'], '深夜', variantNote='兩則輪流')
p.add('course', 'A', ['我去年的筆記還在，我找一下', '（照片）', '字有點醜，將就'])
p.add('course', 'A', ['這題我去年也卡很久，你去問學姊，她比較會教'])
p.add('course', 'A', ['要交什麼我不知道欸，我們那年老師不一樣'])
p.add('course', 'R', ['這題考古題有出過！我找給你', '（照片）'])
p.add('course', 'R', ['我去年這科差點被當，問我不太準', '好啦我看一下'])
p.add('share_cat', 'A', ['這隻好親人喔'])
p.add('share_food', 'A', ['我大一常吃這個！'])
p.add('share_notes', 'A', ['這份講義我去年也有，老師都沒改欸'])
p.add('share_cat', 'R', ['拍得很好欸，傳到家族群組啦'])
p.add('share_food', 'R', ['內行喔，你也知道這間'])
p.add('share_notes', 'R', ['劃這麼多，你比我大一認真多了'])
p.add('night', 'R', ['晚安啦'])
p.add('night', 'R', ['晚安喔，睡飽一點'])
people.append(p)

# ───────────────────────── assemble ─────────────────────────
TOPIC_ORDER = ['chat', 'course', 'share_cat', 'share_food', 'share_notes', 'share', 'night', 'daily']
TIER_ORDER = {'A': 0, 'R': 1, 'L': 2}
data = {'source': {'AA_202': 'b61e4f55', 'BB_178': 'bb6baddf', 'AA_370': '9eaf4e98', 'AA_393': 'e81a1afe1', 'AA_531': 'a28201f61', 'AA_538': 'b9d816288'}, 'people': {}, 'tagsSeen': []}
seen = []


def note_tag(s):
    if s and s not in seen:
        seen.append(s)


FILM = [('《東京物語》', '《進城的那一週》'), ('《晚春》', '《父親的午後》')]   # AA_313 6-2（AA-C 定）：真實片名改虛構；tests/msg_chat_unit.js 第 F 項比對前也照這張表換


FIX = [('在改論文的第二章。', '在改論文的第四章。'),   # AA_509 0-2 第 1 點（企劃線 691a26400，AA-C 定）：學姊大四上回覆池「第二章」改「第四章」（AA_262 附錄 B C13：大四上第三章寫完、第四章在寫）；tests/msg_chat_unit.js 第 F 項比對前也照這張表換
       ('在追劇，這集好扯。', '在讀書。等我一章。'),   # AA_497 第 8 節第 3 點（企劃線 60fc3b9a3，AA-C 定）：芯慈追劇減量
       ('一家多一顆滷蛋 哈哈', '一家多送一碗湯 哈哈')]   # AA_497 第 8 節第 4 點：明軒的滷蛋只留 M1、M2、德文那三處


def film(t):
    for a, b in FILM + FIX:
        t = t.replace(a, b)
    return t


for p in people:
    for e in p.replies:
        e['msgs'] = [film(t) for t in e['msgs']]
        if e.get('ask'):
            for o in e['ask']['opts']:
                o['t'] = film(o['t'])
                o['r'] = [film(t) for t in o['r']]
for p in people:
    # stable order: regular pool first (by topic, tier), then situation versions, keeping source order inside
    reg = [e for e in p.replies if not e.get('tierMin')]
    sit = [e for e in p.replies if e.get('tierMin')]
    reg.sort(key=lambda e: (TOPIC_ORDER.index(e['topic']), TIER_ORDER[e['tier']]))
    p.replies = reg + sit
    for e in p.replies:
        assert e['topic'] in TOPIC_ORDER and e['tier'] in TIER_ORDER
        for t in e['tags']:
            note_tag(t)
        note_tag(e.get('variant'))
        note_tag(e.get('variantNote'))
        note_tag(e.get('version'))
        if e.get('addIf'):
            note_tag(e['addIf']['tag'])
        if e.get('ask'):
            for o in e['ask']['opts']:
                note_tag(o.get('cond'))
    data['people'][p.cid] = p.out()
data['tagsSeen'] = seen

os.makedirs(OUT, exist_ok=True)
with open(os.path.join(OUT, 'msg_pool.json'), 'w', encoding='utf-8') as f:
    json.dump(data, f, ensure_ascii=False, indent=1)
    f.write('\n')
for p in people:
    print(p.cid, len(p.replies))
print('total', sum(len(p.replies) for p in people))
