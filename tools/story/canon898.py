"""CANON-NO-ECON-1112 第四批（AA_898，企劃線 6e54cfd62／7fbab93ec：canon_scan 的字表裡有一個兩個字的詞剛好是「前」接「傳」）：
玩家看得到的七句把「傳」換成「發」（意思不變）。產生檔（msg_pool.js、msg2_pool.js）的產生器寫完以後照這張表再換一次（整句相同才換），
手寫檔已經直接改了；測試用 tests/canon898_1112.js（同一張表）。舊字不寫成字面（「前」「傳」分開寫再接），這個檔本身不會被 canon_scan 掃到。"""
_Q = '前' + '傳'
_q = '以' + _Q
# (遊戲檔, 舊, 新)
PAIRS = [
    ('src/data/msg_pool.js', '白天睡到下午一點，一點' + _q + '的，一點才回。', '白天睡到下午一點，一點以前發的，一點才回。'),
    ('src/data/msg_pool.js', '延到隔天／一點' + _q + '的：', '延到隔天／一點以前發的：'),
    ('src/data/msg2_pool.js', '沒有標點；一點' + _q + '的一點才回，先接「剛醒」', '沒有標點；一點以前發的一點才回，先接「剛醒」'),
    ('src/data/invites.js', '我爸之' + _Q + '訊息問我『籃球的三分線是畫在哪裡』。', '我爸之前發訊息問我『籃球的三分線是畫在哪裡』。'),
    ('src/data/multirel_lines.js', '……你去見她那天，出門' + _Q + '一句給我就好。', '……你去見她那天，出門前發一句給我就好。'),
    ('src/data/r2y4b_events.js', '班次，回去' + _Q + '給你。', '班次，回去前發給你。'),
    ('src/data/movie_plots.js', '她在登機' + _Q + '一張照片', '她在登機前發來一張照片'),
]


def patch_text(path, text):
    """path＝遊戲檔名（src/data/…）；照表把舊句換成新句（找不到就不動）"""
    for f, old, new in PAIRS:
        if f == path and old in text:
            text = text.replace(old, new)
    return text


# 閒聊階梯（AA 087c105f13：ladder_aa_y1s2.json、ladder_aa_y4s2.json 語彤兩句的回覆）：源稿把「來之…一下」那一段換成「要來跟我說一聲」。
# ladder_aa_y4s2 那一句另外有 AA_630 L-260 的改寫（長桌→吧檯最旁邊的位子，接結局 4）——AA_630 的表對的是舊句：
# 套 AA_630 的時候，源稿已經是 AA 新句的，照同一段換回舊句比對，套完再把同一段換成 AA 的新說法（兩份 AA 定稿疊在一起，不另外寫字）。
LADDER_CLAUSE = ('來之' + _Q + '一下', '要來跟我說一聲')


def ladder_back(t):
    return t.replace(LADDER_CLAUSE[1], LADDER_CLAUSE[0]) if isinstance(t, str) else t


def ladder_fwd(t):
    return t.replace(LADDER_CLAUSE[0], LADDER_CLAUSE[1]) if isinstance(t, str) else t
