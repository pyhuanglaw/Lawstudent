"""BB-B 10-24 23:4x：AA_450（LAWWW-B 23:19，開發分支 24c94df06）在美國逐日劇本裡看的六件——讀 zrlast_probe TRX_* 存下來的 JSON（log＝台詞／提示框，msgs＝手機訊息），不重新玩。
第 6 件（雪那天「（不問了）」→ 12/24 期末飯多三句）劇本跑到 12/23 就停，看不到，另外由 zrlast_probe R30 SNOWQ_* 演；這裡只看 12/2 選了什麼、12/3 有沒有「回去再跟你說」。
台詞照 tests/aa450_us_unit.js、AA_450 的字。
用法：python3 aa450_trx_check.py <標籤>=<TRX_*.json> [<標籤>=<TRX_*.json> ...]"""
import sys, json

MOM = [('2028-08-06', '吃飯了沒。'), ('2028-08-13', '你姊問你那邊缺什麼，她要寄過去。我說不用。'), ('2028-08-20', '巷口那家早餐店換老闆了。蛋餅變小了。'), ('2028-08-27', '吃飯了沒。'),
       ('2028-09-03', '家裡的冷氣修好了。師傅說還可以用五年。'), ('2028-09-10', '你爸問你上課聽不聽得懂。我說聽得懂。……聽得懂吧。'), ('2028-09-17', '吃飯了沒。'), ('2028-09-24', '你房間我進去開窗了。其他沒動。'),
       ('2028-10-01', '禮拜二中秋。你姊會回來。月餅我留一個給你，放冷凍。'), ('2028-10-08', '吃飯了沒。'), ('2028-10-15', '天氣預報說你那邊變冷了。外套夠不夠。'), ('2028-10-22', '你姊寄了一本她編的書回家，說是給你的。我放你桌上。'),
       ('2028-10-29', '吃飯了沒。'), ('2028-11-05', '你那邊今天換時間了吧。我算了一下，現在差十三個小時。'), ('2028-11-12', '吃飯了沒。'), ('2028-11-19', '你爸說他看了地圖，那邊離芝加哥很近。'),
       ('2028-11-26', '你爸說他過年回來。機票買好了。'), ('2028-12-03', '吃飯了沒。'), ('2028-12-10', '你回來那天，我去機場接你。早上五點多對吧。'), ('2028-12-17', '棉被曬過了。')]
ORIENT = '（八月十五日，迎新週第二天：學生證、健康保險、選課確認。每一個櫃台前面都是隊伍。）'
CLUB = ['明天晚上七點，會所。學期最後一頓。', '每個人帶一道菜。泡麵也算。']


def one(lab, path):
    J = json.load(open(path)); L = J.get('log', []); M = J.get('msgs', []); out = []
    rep = lab.startswith('alone')   # 挽回中：學姊不在身邊的那幾句（亞洲超市、湖邊、約芝加哥私訊）不適用；8/15 摘要演在快轉跳完的第一站
    def r(n, st, why): out.append((n, st, why))
    lt = lambda s: [x for x in L if s in str(x.get('t', ''))]
    mt = lambda s: [m for m in M if s in str(m.get('text', ''))]
    end = J.get('at', {})
    met = any(m.get('from') == 'npc_long' for m in M) or any('何俊朗' in str(x.get('n', '')) for x in L)
    r('前置', 'INFO', '劇本最後停在 %s %.2f；見過何俊朗＝%s' % (end.get('d'), end.get('h') or 0, met))
    # 1. 10/4 會所自習室的行程：10/3 起才排、才提示
    T = [x for x in L if x.get('n') == 'TOAST' and '排進行程' in str(x.get('t')) and '10/4' in str(x.get('t'))]
    if not T: r('1. 10/4 行程', 'PASS' if not met else 'CHECK', '沒有出現「排進行程：10/4」' + ('（沒見過何俊朗，本來就不排）' if not met else '（見過何俊朗卻沒有排：要看 10/4 那天有沒有演）'))
    else:
        d0 = min(x['d'] for x in T); r('1. 10/4 行程', 'PASS' if d0 >= '2028-10-03' else 'FAIL', '第一次提示 %s %.2f：%s' % (d0, T[0]['h'], T[0]['t'][:60]))
    # 2. 8/15 迎新週第二天：收起 8/18 手機再快轉，先演（不是 8/21 才演）；舊旁白「銀行帳戶、手機門號」不能出現
    O = lt(ORIENT); old = lt('學生證、銀行帳戶、手機門號')
    if not O: r('2. 8/15 迎新週第二天', 'FAIL', '沒有演（找不到新旁白）' + ('；舊旁白還在 %s' % old[0]['d'] if old else ''))
    else:
        lim = '2028-08-19' if rep else '2028-08-18'
        r('2. 8/15 迎新週第二天', 'PASS' if ('2028-08-15' <= O[0]['d'] <= lim and not old) else 'FAIL', '演在 %s %.2f%s' % (O[0]['d'], O[0]['h'], '；舊旁白還在' if old else ''))
    # 3. 媽媽每週日照日期、每則一次
    mm = [m for m in M if m.get('th') == 'p:mom']; bad = []
    for k, t in MOM:
        if k > (end.get('d') or '9999'): continue
        got = [m for m in mm if m.get('key') == k]
        if len(got) != 1 or got[0].get('text') != t: bad.append('%s 應該「%s」，實際 %s' % (k, t, [g.get('text') for g in got]))
    extra = [m for m in mm if m.get('key') and m.get('key') >= '2028-08-02' and m.get('key') not in dict(MOM)]
    r('3. 媽媽週日訊息', 'PASS' if not bad and not extra else 'FAIL', '%d 則（8/2 以後）；%s%s' % (len([m for m in mm if (m.get('key') or '') >= '2028-08-02']), '；'.join(bad[:4]) or '每一個星期天都對', ('；多出 %s' % [(m['key'], m['text']) for m in extra[:3]]) if extra else ''))
    # 4. 交換生群組 12/13：何俊朗（見過）／國際學生會（沒見過）
    C = [m for m in M if m.get('th') == 'g:us_exchange' and m.get('text') in CLUB]
    if not C: r('4. 群組 12/13 寄件人', 'CHECK', '沒有收到 12/13 那兩則')
    else:
        want = '何俊朗' if met else '國際學生會'; who = sorted(set(m.get('name') for m in C))
        r('4. 群組 12/13 寄件人', 'PASS' if who == [want] and len(C) == 2 else 'FAIL', '%s（%s %s）；應該 %s' % (who, C[0].get('key'), C[0].get('h'), want))
    sis_g = [m for m in M if m.get('th') == 'g:us_exchange' and m.get('from') == 'heroine_05' and (m.get('key') or '') >= '2028-08-02']
    r('4b. 學姊在交換生群組發的', 'INFO', '%d 則：%s' % (len(sis_g), [(m.get('key'), m.get('text')[:24]) for m in sis_g[:6]]))
    # 5. 換句
    def has(n, s, want=True, where=lt):
        f = where(s); ok = bool(f) == want; r(n, 'PASS' if ok else ('FAIL' if want is False or f is not None else 'FAIL'), ('有 %s' % f[0].get('d', f[0].get('key')) if f else '沒有') + '「%s」' % s[:30])
    if not rep: has('5a. 亞洲超市新句', '……我在研究室常吃這一種。'); has('5b. 湖邊新句', '台灣這時候，大家在吃早餐了。')
    has('5a. 亞洲超市舊句不在', '這是鄉愁', False); has('5b. 湖邊舊句不在', '天快亮了', False)
    ch = [m for m in M if m.get('th') == 'p:heroine_05' and (m.get('key') or '') in ('2028-11-11', '2028-11-12')] + [m for m in M if m.get('th') == 'g:us_exchange' and (m.get('key') or '') in ('2028-11-11', '2028-11-12')]
    went = bool(lt('芝加哥')) and not ch
    r('5c. 芝加哥', 'INFO', '11/11、11/12 的訊息：%s' % [(m.get('key'), m.get('name'), m.get('text')) for m in ch])
    if ch:
        r('5c. 芝加哥沒去：「下次一起」最多一次', 'PASS' if len([m for m in ch if '下次一起' in m['text']]) <= 1 else 'FAIL', str([m['text'] for m in ch if '下次一起' in m['text']]))
        r('5c. 第一張「密西根湖，浪很大」、沒有「湖邊的風」', 'PASS' if any('密西根湖，浪很大' in m['text'] for m in ch) and not any('湖邊的風' in m['text'] for m in ch) else 'FAIL', '')
    has('5d. 約芝加哥「……到了再看。」', '……到了再看。', met, where=mt) if (met and not rep) else r('5d. 約芝加哥', 'INFO', '挽回中或沒見過何俊朗：這一句不出現')
    has('5d. 「我們去驗證」不在', '我們去驗證', False, where=mt)
    lm = [m for m in M if m.get('th') == 'p:heroine_05' and m.get('key') == '2028-11-23']
    r('5e. 感恩節湖邊（11/23 她的私訊）', 'INFO', str([m.get('text') for m in lm]))
    if lm: r('5e. 沒去版：「氣象說錯了，沒有下雪。」、沒有「下雪了。拍給你」', 'PASS' if any('氣象說錯了' in m['text'] for m in lm) and not any('下雪了。拍給你' in m['text'] for m in lm) else 'FAIL', '')
    has('5f. 何俊朗 10/4「就不是誰都」不在', '就不是誰都，也不是誰也了', False)
    pt = lt('秋假前的聚餐')
    if pt: r('5f. 10/6 聚餐旁白開頭「星期五晚上，」', 'PASS' if any('星期五晚上，' in x['t'] for x in pt) else 'FAIL', '%s %.2f' % (pt[0]['d'], pt[0]['h']))
    # 6. 雪那天
    sn = [x for x in L if x.get('d') == '2028-12-02' and str(x.get('t', '')).startswith('CHOICE')]
    q = mt('其實不太好。回去再跟你說。')
    r('6. 12/2 雪那天的選擇／12/3 私訊', 'INFO', '12/2 選項紀錄：%s；12/3「回去再跟你說」：%s（12/24 期末飯另外跑 R30）' % ([x['t'][:40] for x in sn][:3], [(m.get('key'), m.get('h')) for m in q]))
    if rep:
        for n, t in [('A452 1-3. 9/13 退回的報告第一句（鍋子）', '（你去 C 棟還上個禮拜跟她室友借的鍋子。'), ('A452 1-6. 10/4 回公寓「誰都」「誰也」', '（回到公寓，你在筆記本最後一頁寫了「誰都」和「誰也」。'),
                     ('A452 1-5. 12/23 機場「（出口，媽媽在揮手。）」', '（出口，媽媽在揮手。）'), ('A452 1-7. 返台字卡「舊金山轉機」', '舊金山轉機')]:
            f = lt(t); r(n, 'PASS' if f else 'CHECK', ('%s %.2f' % (f[0]['d'], f[0]['h'])) if f else '沒有（要看那一場有沒有演）')
        lk = lt('（湖邊。何俊朗和其他人走在前面。') + lt('（湖邊。大家走在前面。')
        r('A452 1-4. 11/23 湖邊「分手那天」前一句', 'PASS' if lk else 'CHECK', ('%s：%s' % (lk[0]['d'], lk[0]['t'][:24])) if lk else '沒有（湖邊那一場沒有演？）')
        g = [m for m in M if m.get('th') == 'g:us_exchange' and m.get('key') == '2028-12-02']
        r('A452 1-2. 12/2 18:00 何俊朗群組兩則', 'PASS' if [m['text'] for m in g if m.get('from') == 'npc_long'][:2] == ['今晚會積雪。', '上次那種落地就化了。這次會積起來。'] else 'FAIL', str([(m.get('name'), m['text']) for m in g]))
        sc = [x for x in L if x.get('d') == '2028-12-02' and '初雪' in str(x.get('t'))]; sn = lt('（下雪了。學姊坐在小教堂前面的台階上')
        r('A452 1-1. 12/2 初雪：排行程、「出發：初雪」、有演', 'PASS' if (sc and sn) else 'FAIL', '%s｜演了：%s' % ([x['t'][:40] for x in sc][:3], bool(sn)))
    return out


def main():
    allbad = 0
    for a in sys.argv[1:]:
        lab, p = a.split('=', 1); print('== %s（%s）' % (lab, p))
        for n, st, why in one(lab, p):
            print('[%s] %s：%s' % (st, n, why)); allbad += st == 'FAIL'
    print('FAIL %d 項' % allbad)


main()
