"""BB 台詞對照（測試，不是審稿）：讀 dlg_hook.js 記下的 jsonl（遊戲裡實際出現的台詞），對照 AA_188 第 2-6、2-7 節、BAN、BRANDS。
用法：python3 line_check.py <log.jsonl> [<log2.jsonl> ...]
輸出：違反的句子（日期、事件 id、說話的人、原句、規則），以及每人每學期的口頭禪計數。"""
import json, re, sys, collections

BAN = ['大家都只問', '謝謝你沒有', '不要跟別人講', '不要跟別人說', '你不要講出去', '你先不要跟別人說', '你不用那個表情', '你是第一個']
# 00_人物口氣表 0-3：全體共用的招、中國用語、作廢的設定
TRICK = [('「……騙你的」', r'騙你的'), ('「我是說」', r'我是說'), ('「我記住了」收尾', r'我記住了。?$'), ('「我們家很 X」', r'我們家很'),
         ('「這是我的規則」', r'這是我的規則'), ('「○○也是一種回答」', r'也是一種回答')]
CN = ['社死', '情緒價值', '搭子', '內卷', '視頻', '質量']
VOID = [('法服週三讀書會', r'週三.{0,6}讀書會'), ('模擬法庭', r'模擬法庭'), ('承恩', r'承恩'), ('重訪日', r'重訪日'), ('念了一年經濟', r'念了一年經濟'), ('明軒拿獎學金', r'獎學金.{0,8}德國')]
BRANDS = ['麥當勞', '摩斯', '星巴克', '7-11', '7-ELEVEN', '統一超商', '全家便利', '萊爾富', '肯德基', '必勝客', '誠品', '光點', '三創', '路易莎', '50嵐', '五十嵐',
          '迷客夏', '鼎泰豐', '春水堂', '85度C', '好樂迪', '錢櫃', 'UNIQLO', 'IKEA', '家樂福', '全聯', '寶可夢', '皮卡丘', '任天堂', 'Switch', 'PS5', 'iPhone',
          'Instagram', 'Google', 'YouTube', '臉書', 'Facebook', 'Netflix', '迪士尼', '吉卜力', 'Uber', 'Gogoro', '樂高', '哆啦A夢', 'Hello Kitty']
# 2-7 AI 味句型：每人每學期最多一句，只放重要事件
AI = [('我原本以為／但現在', r'原本以為.*(但|可是).*(現在|才)'), ('以前覺得／現在覺得', r'以前覺得.*現在'), ('最近才明白', r'最近才(明白|知道|發現)'),
      ('後來才發現', r'後來才發現'), ('因為你，我開始', r'因為你.{0,3}我開始'), ('一個人很好，但', r'一個人(很好|也很好).*(但|可是)'),
      ('原來重要的不是', r'重要的不是.*而是'), ('這是我第一次', r'這是我第一次|我第一次覺得'), ('不是X，是Y 格言', r'^[^？?]{0,14}不是[^，。]{1,12}，(是|而是)[^，。]{1,14}。$')]
# 2-6 口頭禪上限（每人每學期）：(說話的人包含的字, 名稱, 正則, 上限)
# 00_人物口氣表 0-4（統一上限；每人每學期，除非另註）
HABIT = [('以安', '說出口的「理由：」', r'理由：', 0), ('子晴', '「欸不是」「這不是問句」合計', r'欸不是|這(不)?是(問句|直述句)', 2),
         ('學姊', '說出口的條列', r'(一件事|兩件事|三件事|第一，|一、)', 1), ('書瑀', '說出口的條列', r'(一件事|兩件事|三件事|第一，|一、)', 1),
         ('沛珊', '「我可以問一個奇怪的問題嗎」（全遊戲兩次：迎新 P0、大四上心意邀約）', r'我可以問一個奇怪的問題', 1), ('可昕', '「假設」開頭', r'^假設', 2),
         ('柏翰', '計時、精確數字', r'[一二三四五六七八九十]+(小時|分鐘)[一二三四五六七八九十]+分', 2), ('芯慈', '計畫表、顏色筆、做表', r'(計畫表|顏色筆|做表)', 1),
         ('明軒', '「你什麼都沒看到」', r'你什麼都沒看到', 1), ('韋綸', '「走啦」（全年 4）', r'走啦', 4), ('阿勳', '「零」／「機率」', r'機率', 1), ('品妤', '報價錢（全年 3）', r'[0-9一二三四五六七八九十百]+塊|[0-9]+ ?元', 3)]


def term(d):
    y, m = int(d[:4]), int(d[5:7])
    return '%d上' % y if m >= 8 else ('%d上' % (y - 1) if m == 1 else '%d下' % (y - 1))


def law_year(d):   # 法律系大幾（2025-08 起大一）；經濟系那一年回 0
    y, m = int(d[:4]), int(d[5:7]); sy = y if m >= 8 else y - 1
    return sy - 2024


def main(paths):
    rows, seen = [], set()
    for p in paths:
        for ln in open(p, encoding='utf-8'):
            try: r = json.loads(ln)
            except Exception: continue
            k = (r.get('d'), r.get('who'), r.get('t'))
            if k in seen: continue
            seen.add(k); rows.append(r)
    out = []; cnt = collections.Counter(); ai_cnt = collections.Counter(); lead = collections.Counter(); tot = collections.Counter()
    for r in rows:
        who, t, d = r.get('who') or '', r.get('t') or '', r.get('d') or '0000-00-00'
        if who == '(選項)' or not t: continue
        tm = term(d); tag = '%s %s %s「%s」' % (d, r.get('ev') or '-', who or '旁白', t)
        tot[who or '旁白'] += 1
        if who and t.startswith('……'): lead[who] += 1
        for b in BAN:
            if b in t: out.append(('禁用字樣「%s」' % b, tag))
        for b in BRANDS:
            if b in t: out.append(('品牌「%s」（D77）' % b, tag))
        for b in CN:
            if b in t: out.append(('中國用語「%s」（口氣表 0-3）' % b, tag))
        for name, rx in VOID:
            if re.search(rx, t): out.append(('作廢的設定：%s（口氣表 0-3）' % name, tag))
        if who and who != '旁白' and len(t) > 48 and d >= '2026-02': out.append(('一句超過 48 字（%d 字；大一下起）' % len(t), tag))
        if who:
            for name, rx in TRICK:
                if re.search(rx, t): out.append(('全體共用的招 %s（口氣表 0-3）' % name, tag))
        if not who: continue
        for name, rx in AI:
            if re.search(rx, t):
                ai_cnt[(who, tm)] += 1
                out.append(('2-7 AI 句型「%s」（%s 這學期第 %d 句；日常、手機、好感升級不用）' % (name, who, ai_cnt[(who, tm)]), tag))
        for nm, name, rx, cap in HABIT:
            if nm in who and re.search(rx, t):
                cnt[(who, name, tm)] += 1
                if cnt[(who, name, tm)] > cap: out.append(('2-6 %s 超過上限 %d（這學期第 %d 次）' % (name, cap, cnt[(who, name, tm)]), tag))
        if '沛珊' in who and re.search(r'休學|重考|睡不好', t) and d < '2026-12-17':   # D100e（AA_281）：消失前什麼都不說；交往中的例外要另外確認
            out.append(('D100e 沛珊在 2026-12-17 以前提休學／重考（只有交往中的玩家可以聽到，要確認這次是不是交往中）', tag))
        if ('學姊' in who or '書瑀' in who) and '重點是' in t:
            ly = law_year(d); cnt[(who, '重點是', tm)] += 1
            if ly >= 3: out.append(('2-6 學姊大三起不說「重點是」', tag))
            elif cnt[(who, '重點是', tm)] > 1: out.append(('2-6 學姊「重點是」一學期最多 1', tag))
    print('台詞總數（去重後，不含選項）：%d' % sum(tot.values()))
    print('\n== 違反（%d）==' % len(out))
    for rule, tag in out: print('- %s｜%s' % (rule, tag))
    print('\n== 「……」開頭（AA_188：只在真的停頓時用，不是配額；這裡只列數字供參考）==')
    for w, n in lead.most_common(): print('  %s：%d／%d' % (w, n, tot[w]))


if __name__ == '__main__':
    main(sys.argv[1:])
