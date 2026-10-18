# -*- coding: utf-8 -*-
"""AA_162 第 7、8 節的資料檔：AA 六位「一起走一段」、重訪旁白、followUp、柏翰的小支線。
格式和 bb_walk_v1.json（BB_147）相同（AA_160 第 6 節）：
  一起走一段：{who, spot, act, friend:[…], dating:[…], cond?}；離開那一句另放 leave。
  重訪：{who, spot, normal, afterBreakup}
  支線：{id, who, spot, steps:[{step, cond, lines, mem}]}
  followUp：{mem, who, where, line, lineIf?}——第一次在那個地方遇到，下一次正常聊天說一次；劇情事件不讀（AA_160 R7）。
act 用 spots_v1.json／spots_v2.json／spots_v3.json 的 'walk'（散步）或 points 的 id。
阿哲、小語、柏翰、芯慈只有朋友線：dating 是空的。
用法：python3 build_aa_walk.py  →  aa_walk_v1.json；加 --check 只檢查。
台詞以本檔為準；AA_162 的表格是給人看的。"""
import json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
SPOTS = []
for f in ('spots_v1.json', 'spots_v2.json', 'spots_v3.json'):   # 第三批 AA_271
    SPOTS += json.load(open(os.path.join(HERE, f), encoding='utf-8'))['spots']
ACTS = {s['id']: {'walk'} | {p['id'] for p in s['points']} for s in SPOTS}
WHO = {'heroine_01', 'heroine_03', 'zhe', 'yu', 'classmate_bohan', 'classmate_xinci'}
ROMANCE = {'heroine_01', 'heroine_03'}
BAN = {'heroine_03': ['兩個人'],   # 語彤 D13 心願的意象（AA_162 第 7 節）
       'heroine_01': ['理由：']}   # 以安說出口的「理由：」歸零（AA_188；AA_209 第 1 節第 2 點），三批都適用

def w(who, spot, act, friend, dating=None, cond=None):
    e = {'who': who, 'spot': spot, 'act': act, 'friend': friend, 'dating': dating or []}
    if cond: e['cond'] = cond
    return e

Y3UP = ['Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']

WALK = [
    # 以安 D06（週日 10:00～13:00；Y3S2 不在；朋友以上；不選空畫框）；walk、D06.cafe、leave 照 AA_209 附錄 A 口語改稿（遊戲 2473d167 起用的版本）
    w('heroine_01', 'D06', 'D06.gallery', ['這一張，我看了三分鐘還不懂。……好，我承認不懂。這是新的經驗。'], ['你站我旁邊看就好。不用解釋。我也不解釋。']),
    w('heroine_01', 'D06', 'walk', ['十二點半以前還有四十分鐘，樓上那區也可以看。'], ['坐一下。表上沒有寫，可是可以。']),
    w('heroine_01', 'D06', 'D06.cafe', ['這裡的拿鐵比 Café 貴四十塊。'], ['你的那杯，我喝一口。……好，我的比較好喝。']),
    # 語彤 D12（單週週日 15:00～18:00；朋友以上）
    w('heroine_03', 'D12', 'walk', ['……走慢一點。我要拍。'], ['你走前面。……你的背影，可以拍嗎。']),
    w('heroine_03', 'D12', 'D12.tea', ['老闆的手，我拍過。……他不知道。'], ['這包，帶回去給阿姨。你付一半。']),
    w('heroine_03', 'D12', 'D12.pier', ['這裡的人，都在等船。可是沒有船。'], ['……坐下。不用說話。']),
    # 語彤 D13（心願完成以後，雙週週日 16:00～18:00）
    w('heroine_03', 'D13', 'walk', ['上次來，沒有注意到這些攤子。'], ['這次換我帶路。']),
    w('heroine_03', 'D13', 'D13.rail', ['觀音山……今天比較近。'], ['你看山，我看你看山。']),
    w('heroine_03', 'D13', 'D13.bench', ['坐這裡。不拍照。'], ['……今天的照片，一張都不拍。']),
    # 阿哲 D04（週六 19:00～22:00）；walk 照 AA_209 附錄 A 改稿。開頭是「欸」：有 ZHE_CALLS_GE 的玩家，遊戲換成「哥，」（AA_209 第 8 節第 6 點，encounter3d.js 的 zheGe）
    w('zhe', 'D04', 'walk', ['欸你看，那個人在噴火。這個要申請嗎？我們好像有教過……算了我忘了。']),
    w('zhe', 'D04', 'D04.redhouse', ['這棟我小時候來過。我爸說這是古蹟，不能爬。我就沒爬。……我很乖吧。']),
    w('zhe', 'D04', 'D04.snack', ['站著吃比較好吃。為什麼？我也不知道。很好吃就對了。']),
    # 小語 D04（週六 17:00～20:00）
    w('yu', 'D04', 'walk', ['欸那家店在打折！對了你要不要買一件？……好啦我知道你不要。']),
    w('yu', 'D04', 'D04.redhouse', ['這裡以前是市場耶。我上次在一個展覽看到的。……還是我記錯了？']),
    w('yu', 'D04', 'D04.snack', ['好燙好燙。欸你不要笑，我舌頭很敏感。']),
    # 柏翰 D06（週日 10:00～12:00，大三起；朋友以上）
    w('classmate_bohan', 'D06', 'D06.gallery', ['這一區有十二件。我每一件看兩分鐘，剛好。'], cond={'terms': Y3UP}),
    w('classmate_bohan', 'D06', 'walk', ['……坐在草上，第一次。我以前覺得會弄髒褲子。'], cond={'terms': Y3UP}),
    w('classmate_bohan', 'D06', 'D06.cafe', ['一杯一百五。我算過，等於三份影印的考古題。……我不印考古題了。'], cond={'terms': Y3UP}),
    # 第二批（AA_162 8-3）
    # 阿哲 D25（大二起下學期第 14～15 週週六 14:00～18:00）；下雨時浪邊灰掉（spots_v2）
    w('zhe', 'D25', 'D25.shore', ['哥你站那裡，浪來了就跳。……跳得太早了。']),
    w('zhe', 'D25', 'D25.cafe', ['我要冰的。剛剛喝了太多海水。']),
    # 柏翰 D09（大四上第 12 週週六 15:00～19:00）
    w('classmate_bohan', 'D09', 'D09.tea', ['這壺茶兩百五。……算了，今天不算錢。'], cond={'terms': ['Y4S1']}),
    w('classmate_bohan', 'D09', 'D09.gondola', ['坐纜車要二十幾分鐘。以前我一定會帶單字卡。'], cond={'terms': ['Y4S1']}),
    # 第三批（AA_271；AA-C 2026-10-17）。出現的條件在 AA_271 第 1 節的偶遇表；這裡只寫一起走一段
    # 以安 D26（她回台中的日子，週六 14:00～17:00；朋友以上）
    w('heroine_01', 'D26', 'D26.village', ['這間的檸檬飲料，我高中下課常常來買。'], ['你喝喝看。我高中都點這一杯。']),
    w('heroine_01', 'D26', 'walk', ['從這裡走到美術館大概十五分鐘。走慢一點也來得及。'], ['走這邊，樹比較多，比較不會曬。']),
    w('heroine_01', 'D26', 'D26.museum', ['國美館不用門票。我國中來這裡寫生，畫得很爛。'], ['這個展我還沒看過。剛好一起看。']),
    # 語彤 D14（心願完成以後，寒暑假的週日 15:00～19:00；朋友以上；雨天沒有）
    w('heroine_03', 'D14', 'D14.ferry', ['坐後面。前面浪會打上來，相機會濕。'], ['你坐裡面。我想坐靠水那邊。']),
    w('heroine_03', 'D14', 'D14.sunset', ['要拍的話就是現在。再幾分鐘就沒了。'], ['你站過去一點。好，不要動。']),
    w('heroine_03', 'D14', 'walk', ['這邊的人都在釣魚。我站了十分鐘，沒看到誰釣到。'], ['走慢一點。前面有一塊木板是鬆的。']),
    # 柏翰 D11（大一下～大二下，每學期第 6、7 週週日 10:00～16:00；朋友以上，他出來吃午飯）
    w('classmate_bohan', 'D11', 'walk', ['這條溪的水是熱的。我上次來，還以為哪裡失火。']),
    w('classmate_bohan', 'D11', 'D11.valley', ['告示說不能碰。我本來想試試看有多燙，還好沒有。']),
    w('classmate_bohan', 'D11', 'D11.museum', ['這裡以前是公共浴場。說明我看完了，你要自己看還是我講？']),
    # 小語 D01（大三起，每學期第 3、6、11、14 週週日 13:00～17:00；不限關係）
    w('yu', 'D01', 'D01.market', ['欸這攤可以試吃！對了你吃辣嗎？這片好像有辣。']),
    w('yu', 'D01', 'D01.wall', ['你幫我拍一張。不要拍到腳，我今天鞋子很醜。']),
    w('yu', 'D01', 'walk', ['那根煙囪以前是在燒什麼？酒廠嗎？等一下我查。']),
    # 阿哲 D29（他在高雄的寒暑假，週六 14:00～17:30；不限關係）
    w('zhe', 'D29', 'walk', ['那艘船我高中騎車上學每天都看到。應該不是同一艘啦。']),
    w('zhe', 'D29', 'D29.sculpture', ['這個我小時候以為是外星人的船。現在看還是很像。']),
    w('zhe', 'D29', 'D29.rail', ['這條鐵道以前有火車喔，我阿公說的。他說的我都沒查過。']),
]

LEAVE = [
    {'who': 'heroine_01', 'spot': 'D06', 'friend': '我要去 Café 了，下午有排東西。', 'dating': '下午我在 Café。你要來的話，坐我對面。'},
    {'who': 'heroine_03', 'spot': 'D12', 'friend': '我回去了。照片，之後傳你。', 'dating': '到了傳訊息。……照片也傳。'},
    {'who': 'heroine_03', 'spot': 'D13', 'friend': '我搭下一班。你慢慢看。', 'dating': '一起回去。……捷運很長。'},
    {'who': 'zhe', 'spot': 'D04', 'friend': '系籃的在叫我了。哥，下週練球，你來。不來我就一直傳訊息。', 'dating': ''},
    {'who': 'yu', 'spot': 'D04', 'friend': '學姊在等我了！我們下次再一起逛。真的，這次是真的。', 'dating': ''},
    {'who': 'classmate_bohan', 'spot': 'D06', 'friend': '十二點我要回總圖。……今天的兩個小時，不算浪費。', 'dating': ''},
    {'who': 'zhe', 'spot': 'D25', 'friend': '系籃的要去吃海鮮了。你要一起嗎？不要的話，下週練球見。', 'dating': ''},
    {'who': 'classmate_bohan', 'spot': 'D09', 'friend': '我搭下一班下山。明天又要開始念了。今天謝謝你。', 'dating': ''},
    # 第三批（AA_271）
    {'who': 'heroine_01', 'spot': 'D26', 'friend': '我媽傳訊息了，我要回去。你回臺北的車幾點？', 'dating': '五點了，我要回家吃飯。到臺北傳訊息給我。'},
    {'who': 'heroine_03', 'spot': 'D14', 'friend': '我搭這班回去。我媽在等我吃飯。', 'dating': '我媽在等吃飯。你陪我到捷運站就好。'},
    {'who': 'classmate_bohan', 'spot': 'D11', 'friend': '我要回去了，還有一份考古題。下禮拜考完再說。', 'dating': ''},
    {'who': 'yu', 'spot': 'D01', 'friend': '我要回板橋了，晚上家裡有親戚來。第六個章你看到要跟我說喔！', 'dating': ''},
    {'who': 'zhe', 'spot': 'D29', 'friend': '我同學要去打球了。你回台北的高鐵幾點？不要錯過喔。', 'dating': ''},
]

REVISIT = [  # AA_162 7-7；第二批六句 AA-B 2026-10-16 補
    {'who': 'heroine_01', 'spot': 'D06', 'normal': '你想起上次她說的那張表。十二點半，她真的準時走了。', 'afterBreakup': '你經過那張城市地圖。你沒有停下來。'},
    {'who': 'heroine_03', 'spot': 'D12', 'normal': '騎樓下的那位老闆娘還在包貨。你想起，她的手被拍過。', 'afterBreakup': '你沒有往那間南北貨行看。'},
    {'who': 'heroine_03', 'spot': 'D13', 'normal': '長椅空著。你坐了一下。', 'afterBreakup': ''},
    {'who': 'zhe', 'spot': 'D04', 'normal': '那家排隊的店，今天也排了四十分鐘。你想起阿哲說：很扯。', 'afterBreakup': ''},
    {'who': 'yu', 'spot': 'D04', 'normal': '二手衣店的櫥窗換了。那兩件一樣的外套不見了。', 'afterBreakup': ''},
    {'who': 'classmate_bohan', 'spot': 'D06', 'normal': '長椅上沒有人。你想起柏翰說，第三個小時讀得比較快。', 'afterBreakup': ''},
    {'who': 'heroine_01', 'spot': 'D09', 'normal': '茶館最裡面那一桌空著。你想起桌上那張時間表，每一格都填滿了。', 'afterBreakup': '你沒有往茶館最裡面那一桌看。'},
    {'who': 'heroine_03', 'spot': 'D18', 'normal': '擦香爐的阿嬤還在。今天沒有人訪問她，她一樣擦得很慢。', 'afterBreakup': '你經過那間廟，沒有進去。'},
    {'who': 'zhe', 'spot': 'D25', 'normal': '浪還是一樣大。你想起阿哲被打倒，站起來大笑的樣子。', 'afterBreakup': ''},
    {'who': 'yu', 'spot': 'D20', 'normal': '老街口今天沒有人在點名。你想起小語數到二十四。', 'afterBreakup': ''},
    {'who': 'classmate_bohan', 'spot': 'D09', 'normal': '纜車站外面的長椅空著。你想起柏翰那天沒帶書，一個人坐在這裡。', 'afterBreakup': ''},
    {'who': 'classmate_xinci', 'spot': 'D18', 'normal': '茶樓的窗邊坐著另一對人，也拿著手機在比對什麼。', 'afterBreakup': ''},
    # 第三批（AA_271）
    {'who': 'heroine_01', 'spot': 'D26', 'normal': '審計新村那間小店門口的階梯，今天坐著別人。', 'afterBreakup': '你沒有往審計新村那排小店走。'},
    {'who': 'heroine_03', 'spot': 'D14', 'normal': '渡輪站的長椅上沒有人。下一班船還要二十分鐘。', 'afterBreakup': ''},
    {'who': 'classmate_bohan', 'spot': 'D11', 'normal': '圖書館靠窗的位子坐著一個高中生，桌上也攤著考古題。', 'afterBreakup': ''},
    {'who': 'yu', 'spot': 'D01', 'normal': '展場出口的蓋章台前面排著幾個小孩。你想起小語在找第六個章。', 'afterBreakup': ''},
    {'who': 'classmate_xinci', 'spot': 'D02', 'normal': '展覽的出口換了一檔新的。門口沒有人在對收據。', 'afterBreakup': ''},
    {'who': 'zhe', 'spot': 'D29', 'normal': '港邊的台階空著。你想起阿哲他們三個在分一包鹹酥雞。', 'afterBreakup': ''},
]

SIDE = [  # AA_162 第 5 節
    {'id': 'side_bh_third_hour', 'who': 'classmate_bohan', 'spot': 'D06', 'steps': [
        {'step': 1, 'cond': '大三起第一次在 D06 遇到他', 'lines': [], 'mem': None, 'note': '偶遇照 AA_162 第 1 節'},
        {'step': 2, 'cond': '不同週，第二次', 'lines': ['……又是你。我開始覺得這裡是我們的總圖。'], 'mem': None},
        {'step': 3, 'cond': '不同週，第三次（朋友以上）', 'lines': ['你都看哪一區？……帶我去。我想知道別人怎麼看。'],
         'choices': [{'t': '「看不懂的那一區。」', 'r': '……好。看不懂的那一區。'}, {'t': '「有窗戶的那一區。」', 'r': '……窗戶。好。'}],
         'then': 'D06.gallery（算一起走一段）', 'mem': 'ENC_D06_BH3',
         'after': {'where': '總圖的閒聊', 'line': '我現在一週去一次。阿哲還以為我在總圖。'}},
    ], 'note': '只寫 ENC_ 計數和那句閒聊，不碰 AA_40 柏翰的事件（AA_160 R7）'},
]

FOLLOWUP = [  # AA_162 第 4 節、8-2
    {'mem': 'ENC_D06_AN', 'who': 'heroine_01', 'where': '一般聊天', 'line': '上次在美術館。……你後來有看完那一區嗎？'},
    {'mem': 'ENC_D12_YT', 'who': 'heroine_03', 'where': '手機（照片）', 'line': '📷（迪化街的騎樓下，一雙正在包貨的手）上次那張。'},
    {'mem': 'ENC_D04_ZHE', 'who': 'zhe', 'where': '一般聊天', 'line': '哥，上次西門那家，下次麵店團一起去。', 'note': '只是一句話，不產生麵店團的約定或事件'},
    {'mem': 'ENC_D04_YU', 'who': 'yu', 'where': '一般聊天', 'line': '欸，上次那件外套，學姊最後買了另一件。……對，第三件。'},
    {'mem': 'ENC_D06_BH', 'who': 'classmate_bohan', 'where': '一般聊天', 'line': '上次在美術館的事，不要跟阿哲說。'},
    {'mem': 'ENC_D04_XC', 'who': 'classmate_xinci', 'where': '一般聊天', 'line': '上次那張小卡我有排到。', 'note': 'AA_209 附錄 A（芯慈 encounters D04）口語改稿'},
    {'mem': 'ENC_D18_YT', 'who': 'heroine_03', 'where': '一般聊天', 'line': '九份那天，你在旁邊站好久。阿嬤後來問我你是誰。'},
    {'mem': 'ENC_D25_ZHE', 'who': 'zhe', 'where': '一般聊天', 'line': '哥，上次外澳那個浪，我回去背痛三天。下次還要去。'},
    {'mem': 'ENC_D09_BH', 'who': 'classmate_bohan', 'where': '一般聊天', 'line': '貓空那天的事，不要跟阿哲說。……你知道我是什麼意思。',
     'lineIf': {'cond': '有 ENC_D06_BH（美術館那句已經說過）', 'line': '貓空那天的事……這次可以跟阿哲說。推甄完了，我不怕他笑。'}},
    {'mem': 'ENC_D18_XC', 'who': 'classmate_xinci', 'where': '一般聊天', 'line': '我們後來找到那個角度了。光差一點，不過還是拍了。'},
    # 第三批（AA_271 1-3）
    {'mem': 'ENC_D26_AN', 'who': 'heroine_01', 'where': '一般聊天', 'line': '上次在臺中，我媽那張清單最後還是漏買一樣。我又跑了一趟。'},
    {'mem': 'ENC_D14_YT', 'who': 'heroine_03', 'where': '一般聊天', 'line': '漁人碼頭那天，你後來搭幾點的車？我那班好擠。'},
    {'mem': 'ENC_D11_BH', 'who': 'classmate_bohan', 'where': '一般聊天', 'line': '北投那間圖書館，期中前你要去的話跟我講。我早上會先到。'},
    {'mem': 'ENC_D01_YU', 'who': 'yu', 'where': '一般聊天', 'line': '欸，華山那個第六個章！在廁所旁邊。我又跑去一次。'},
    {'mem': 'ENC_D02_XC', 'who': 'classmate_xinci', 'where': '一般聊天', 'line': '松菸那個特展下禮拜就撤了。我又去了一次，這次只買一樣。'},
    {'mem': 'ENC_D29_ZHE', 'who': 'zhe', 'where': '一般聊天', 'line': '上次在駁二，我同學說你很好聊。下次回高雄再約。'},
]

RULES = {
    'values': '一起走一段照 AA_124 1-2「一起去 Café 坐坐」（熟悉 +3、信任 +1、自在 +2），受每天上限；同一個人一天一次；不加戀愛，不算約會（AA_160 第 6 節）',
    'join': {'heroine_01': '朋友以上；D06 不選 D06.frame（她一個人想事情的地方）', 'heroine_03': '朋友以上；D13 要心願完成以後',
             'zhe': '不限關係（偶遇本身要「認識」以上）', 'yu': '不限關係；只在 D04（D20 是社團點名，不一起走）',
             'classmate_bohan': 'D06 朋友以上；D09 有點熟以上', 'classmate_xinci': '不一起走（join:false）',
             'batch3': '第三批（AA_271）：以安 D26 朋友以上；語彤 D14 朋友以上、心願完成以後；柏翰 D11 朋友以上；小語 D01、阿哲 D29 不限關係；芯慈 D02 不一起走'},
    'ex': '前任不一起走；重訪用 afterBreakup（只有以安、語彤）',
    'revisit': '這次沒有遇到他／她才說；一個地方說一次，要再遇到、留下新紀錄才會再說',
    'rain': 'D04、D06 照用；D12、D13 雨天沒有偶遇；D25 下雨時 D25.shore 灰掉；D09 下雨纜車停駛（去不了）；第三批：D14 雨天沒有偶遇，D01、D02、D11、D26、D29 照用（灰掉的戶外項目不選）',
    'once': '同一件事一趟只說一次',
}

def check():
    errs = []
    def L(t, where, who=None):
        if len(t) > 40: errs.append(f'{where}：{len(t)} 字＞40：{t}')
        for b in BAN.get(who, []):
            if b in t: errs.append(f'{where}：禁用「{b}」：{t}')
    for e in WALK:
        if e['who'] not in WHO: errs.append(f'who {e["who"]}')
        if e['act'] not in ACTS.get(e['spot'], set()): errs.append(f'{e["who"]} {e["spot"]} act {e["act"]} 不在 spots')
        if not e['friend']: errs.append(f'{e["who"]} {e["act"]} 沒有 friend')
        if (e['who'] in ROMANCE) != bool(e['dating']): errs.append(f'{e["who"]} {e["act"]} dating 不對')
        for t in e['friend'] + e['dating']: L(t, f'{e["who"]}/{e["spot"]}/{e["act"]}', e['who'])
    if any(e['who'] == 'classmate_xinci' for e in WALK): errs.append('芯慈不一起走')
    if any(e['who'] == 'heroine_01' and e['act'] == 'D06.frame' for e in WALK): errs.append('以安不選 D06.frame')
    walked = {(e['who'], e['spot']) for e in WALK}
    for e in LEAVE:
        if (e['who'], e['spot']) not in walked: errs.append(f'leave 沒有對應的 walk：{e["who"]} {e["spot"]}')
    for e in LEAVE + REVISIT:
        if e['spot'] not in ACTS: errs.append(f'spot {e["spot"]}')
        for k in ('friend', 'dating', 'normal', 'afterBreakup'):
            if e.get(k): L(e[k], f'{e["who"]}/{e["spot"]}/{k}', e['who'])
        if e.get('afterBreakup') and e['who'] not in ROMANCE: errs.append(f'{e["who"]} 不會有 afterBreakup')
    for e in FOLLOWUP:
        if not e['mem'].startswith('ENC_'): errs.append(f'mem {e["mem"]}')
        L(e['line'], f"{e['who']}/{e['mem'][4:7]}/followUp", e['who'])
        if e.get('lineIf'): L(e['lineIf']['line'], e['mem'] + '/if', e['who'])
    for s in SIDE:
        for st in s['steps']:
            for t in st['lines']: L(t, f'{s["id"]}#{st["step"]}', s['who'])
            if st.get('after'): L(st['after']['line'], f'{s["id"]}#{st["step"]}/after', s['who'])
    return errs

if __name__ == '__main__':
    errs = check()
    for e in errs: print('ERR', e)
    if errs: sys.exit(1)
    out = {'source': 'AA_162 第 4、5、7、8 節，AA-B 2026-10-16；第三批 AA_271，AA-C 2026-10-17；AA_160 第 6 節', 'status': 'READY_FOR_INTEGRATION（第②級日常內容，AA-B 定；和 bb_walk_v1.json 同格式，給 DL-07、DL-08）',
           'rules': RULES, 'walk': WALK, 'leave': LEAVE, 'intro': [], 'revisit': REVISIT, 'side': SIDE, 'followUp': FOLLOWUP}
    if '--check' not in sys.argv:
        with open(os.path.join(HERE, 'aa_walk_v1.json'), 'w', encoding='utf-8') as f:
            json.dump(out, f, ensure_ascii=False, indent=1)
    print('ok', {'walk': len(WALK), 'leave': len(LEAVE), 'revisit': len(REVISIT), 'side': len(SIDE), 'followUp': len(FOLLOWUP)})
