#!/usr/bin/env python3
"""AA_828：新店打工第一批——山嵐書店、南洋戲院的應徵與班表（任務 SHOP-JOBS-1112；USER_WANTS X356）。
企劃 docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md（企劃線）→ src/data/shop_jobs_aa828.js（SHOP_JOBS_AA828）：
  jobs.shanlan／jobs.cinema：notice（告示的字）、askOpt／laterOpt（看告示以後的兩個選項）、boss（說話的人）、gender、ask（開口那一句）、
    visitN／many／few（山嵐：來過幾次以上的兩句）、later（「再想想。」的回話）、sched（班表：週幾、幾點到幾點、班的名字、是不是做到打烊）、pay（一班的薪水）、
    segs（三段工作：新手／熟練／兩個小選擇和各自的下一句）、end（最後一句旁白：{週幾:[輪流]} 或 {all:[輪流]}）；
  jobs.cinema 另外有 ticket（after＝滿幾班、opt＝選項的字、line＝看完多的一句、take＝拿員工票那一下多的一句 [說話的人, 字]——第 4 節第 6 點）、alison（同學上班遇到他改說的那一句）。
  jobs.shanlan 另外有 co（第 4 節第 7 點：上班遇到宋知寧——who、seg＝哪一段後面、flag＝看哪一個旗標、met／new＝有／沒有那個旗標的那幾句 [說話的人或 null＝旁白, 字]、until＝她到哪一個學期）。
第 4 節「回 LAWWW 七問」其他幾點是規則（給實作看的），不進資料。
第 5 節「回 LAWWW 第二輪」（d8afcca6ed）：
  jobs.shanlan.co （第 1、2 點被第 6 節取代，見下）；
  最上層 bgnBusy（第 4 點：桌遊夜那一晚有班——me＝祐廷自動回的那一句、who／re＝誰照舊回哪一句）、reapply（第 5 點：all＝全部打工比照隔一個學期可以再應徵、keepSkill＝熟練度保留）、
  yueMeal（第 6 點：越好吃上班時同學來吃飯——narr 旁白、ask 對方的通用句、me 祐廷回的、done＝{m,f}「（你幫他／她點了餐。）」照對方性別、own＝{名字:自己的那一句}）。
  第 3、7 點是規則／沒有程式的事，不進資料。
第 6 節「宋知寧換到山嵐這條線」（1d6055568c；取代第 5 節第 1、2 點）：
  jobs.shanlan.co 的 msgN（第幾則訊息以後她才在山嵐）、at（她在山嵐的時間：[{wd,t0,t1}…] 週六、週日）、wd／t0／t1（祐廷上班遇到她的那一班＝週日）、newFrom（完全沒認識過她的＝她從哪一個學期起就在山嵐）；
  「還沒傳第 5 則」那一版（metEarly）作廢，不再匯。第 4 點（舊存檔補發第 5 則）是規則（src/shopenc3d.js）。
第 7 節「五個小問題」：bgnBusy.dm（第 1 點：私訊約也自動回同一句）、yueMeal.dating（第 2 點：who 交往中才排進越好吃的哪一餐 slot、一學期最多 termMax 次）、
  yueMeal.own 多學姊那一句（第 3 點；其他女主角用通用句）、reapply.tutor（第 4 點：家教也比照）、jobs.cinema.ticket.keep（第 5 點：再應徵不用重新滿班數）。
第 8 節「第四輪合併後五問」（1e539b8eb9；和第 6 節第 3 點衝突的以第 8 節為準）：
  第 1、2 點：沒認識過宋知寧的玩家她不出現在山嵐、「新來的？…」那一版不演——jobs.shanlan.co 不再有 new、newFrom（稿上第 4 節第 7 點、第 6 節第 3 點的字還在，照舊對一次，只是不匯）；
  第 5 點：家教回「不了」以後不再問——reapply.tutorAskOnce＝true、reapply.tutorNo＝那個回答的字（流程 src/jobs3d.js S.tutorReAsk）。第 3、4 點是「照現在的做法」，不進資料。
第 9 節「第五輪四問」（3e9cd7d9d4）：
  第 1 點：學姊來越好吃不走晚餐名單的亂數——yueMeal.sis＝{who（要有自己的那一句）、met＝認識她看的旗標、inTaiwan、slot、termMax＝每學期幾次、datingMax＝交往中一學期幾次、gapWeeks＝第二次隔幾週}（流程 src/shoplife3d.js S.yueDatePlan）；
  第 2 點：家教回「不了」以後下一個學期開學起，那一則家教的對話底下多一個回覆選項——reapply.tutorBack＝{opt＝選項的字、re＝對方回的那一句}；
  第 3 點：那一則沒回、過期也算問過，一樣用第 2 點的選項——reapply.tutorBack.expired＝true（流程 src/jobs3d.js S.tutorBack／tutorReAsked）。第 4 點是「可以」，不進資料。
規則的字（第 3 節「給 LAWWW」、每一節的說明）是給實作看的，不進遊戲（流程在 src/jobs3d.js）。台詞一字不改；有名字說的話拿掉外面那一對「」（對話框已經寫了是誰說的）；
選項、旁白照稿。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_shop_jobs_aa828.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md'
OUT = 'src/data/shop_jobs_aa828.js'
WD = {'週一': 1, '週二': 2, '週三': 3, '週四': 4, '週五': 5, '週六': 6, '週日': 7}
GENDER = {'女': 'f', '男': 'm'}
SECTIONS = (('shanlan', '## 1. 山嵐書店'), ('cinema', '## 2. 南洋戲院'))


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def need(m, w):
    if not m:
        raise SystemExit(f'{w}：稿上找不到（格式變了？）')
    return m


def fx(s):
    return IG.read_fix(s.strip())


def hm(s):
    h, m = s.split(':')
    return int(h) + int(m) / 60


def section(md, head):
    i = md.find(head)
    if i < 0:
        raise SystemExit(f'找不到「{head}」那一節')
    j = md.find('\n## ', i + 1)
    return md[i:j if j > 0 else len(md)]


def rot(body, label, w):
    """「- <label>（輪流）：（…）／（…）」→ [句…]"""
    m = need(re.search(r'^- ' + re.escape(label) + r'（輪流）：(.+)$', body, re.M), w)
    L = [fx(t) for t in m.group(1).split('／')]
    if len(L) < 2 or any(not re.fullmatch(r'（.+）', t) for t in L):
        raise SystemExit(f'{w}：要是兩句以上的旁白（…）／（…）')
    return L


def build_job(key, body):
    w = key
    job = {}
    job['notice'] = fx(need(re.search(r'告示：「(.+?)」\s*$', body, re.M), w + '.告示').group(1))
    m = need(re.search(r'看告示 → 選(「.+?」)→ (\S+?)（(女|男)）：「(.+?)」→ (.*?)選班表。選(「.+?」)→ (\S+?)：「(.+?)」\s*$', body, re.M), w + '.應徵')
    if m.group(2) != m.group(7):
        raise SystemExit(f'{w}.應徵：前後說話的人不一樣（{m.group(2)}／{m.group(7)}）')
    job['askOpt'], job['boss'], job['gender'] = fx(m.group(1)), fx(m.group(2)), GENDER[m.group(3)]
    job['ask'] = fx(m.group(4))
    mid = m.group(5).strip()
    if mid:
        v = need(re.fullmatch(r'來過\S+? (\d+) 次以上：「(.+?)」／不到 \1 次：「(.+?)」→', mid), w + '.應徵（來過幾次）')
        job['visitN'], job['many'], job['few'] = int(v.group(1)), fx(v.group(2)), fx(v.group(3))
    job['laterOpt'], job['later'] = fx(m.group(6)), fx(m.group(8))
    sched = []
    for s in re.finditer(r'^  - (週[一二三四五六日]) (\d\d:\d\d)～(\d\d:\d\d)（(.+?)）\s*$', body, re.M):
        nm = s.group(4).split('，')
        sched.append({'wd': WD[s.group(1)], 't0': hm(s.group(2)), 't1': hm(s.group(3)), 'name': fx(nm[0]), 'close': any('打烊' in x for x in nm[1:])})
    if len(sched) != 2:
        raise SystemExit(f'{w}.班表：要兩班（現在 {len(sched)}）')
    job['sched'] = sched
    job['pay'] = int(need(re.search(r'\*\*薪水\*\*：四小時 (\d+) 元', body), w + '.薪水').group(1))
    segs = []
    for r in re.finditer(r'^\| (?!段 \||---)(.+?) \| (（.+?）) \| (（.+?）) \| (.+?) \|\s*$', body, re.M):
        ch = re.findall(r'(「[^→]+?」)→(（.+?）)(?=／「|$)', r.group(4).strip())
        if len(ch) != 2:
            raise SystemExit(f'{w}.三段工作「{r.group(1)}」：要兩個小選擇（現在 {len(ch)}）')
        segs.append({'name': fx(r.group(1)), 'nov': fx(r.group(2)), 'exp': fx(r.group(3)), 'ch': [[fx(a), fx(b)] for a, b in ch]})
    if len(segs) != 3:
        raise SystemExit(f'{w}.三段工作：要三段（現在 {len(segs)}）')
    job['segs'] = segs
    if re.search(r'^- 最後一句旁白（輪流）：', body, re.M):
        job['end'] = {'all': rot(body, '最後一句旁白', w + '.最後一句')}
    else:
        job['end'] = {str(s['wd']): rot(body, s['name'] + '最後一句旁白', f'{w}.{s["name"]}最後一句') for s in sched}
    return job


def build(md):
    jobs = {k: build_job(k, section(md, h)) for k, h in SECTIONS}
    c = section(md, SECTIONS[1][1])
    t = need(re.search(r'打工滿 (\d+) 班以後，買票的畫面多一個選項「(.+?)」.*看完的旁白多一句：(（.+?）)\s*$', c, re.M), 'cinema.免費的電影')
    jobs['cinema']['ticket'] = {'after': int(t.group(1)), 'opt': fx(t.group(2)), 'line': fx(t.group(3))}
    a = need(re.search(r'那位同學上班遇到他，改說：「(.+?)」（一次）', c), 'cinema.同學改說')
    jobs['cinema']['alison'] = fx(a.group(1))
    q = section(md, '## 4. 回 LAWWW')
    k = need(re.search(r'^6\. .*拿員工票多一句：(\S+?)：「(.+?)」\s*$', q, re.M), '第 4 節第 6 點（拿員工票多一句）')
    jobs['cinema']['ticket']['take'] = [fx(k.group(1)), fx(k.group(2))]
    z = need(re.search(r'^7\. 上班時遇到認識的人：(\S+?)在山嵐二樓打工——祐廷第一次在山嵐上班、她也在的那一班，(\S+?)那一段後面多一句（一次）：'
                       r'有 ([A-Z_]+)（[^）]*）→ (.+?)／沒有 \3 → (.+?)她的學期只到(大[一二三四][上下])，之後不出。', q, re.M), '第 4 節第 7 點（宋知寧）')
    who, seg = fx(z.group(1)), fx(z.group(2))
    if seg not in [g['name'] for g in jobs['shanlan']['segs']]:
        raise SystemExit(f'第 4 節第 7 點：山嵐的三段工作沒有「{seg}」那一段')

    def said(t, w, bare=False):
        """「<誰>：「…」（…）「…」」→ [[誰, 字] 或 [None, （旁白）]…]；有對不上的字＝停。bare＝前面沒有寫「<誰>：」（接在上一版後面寫的）"""
        t = t.strip()
        if not bare:
            if not t.startswith(who + '：'):
                raise SystemExit(f'{w}：要是「{who}：「…」」開頭')
            t = t[len(who) + 1:]
        parts = re.findall(r'「[^「」]+」|（[^（）]+）', t)
        if not parts or ''.join(parts) != t:
            raise SystemExit(f'{w}：有「」和（）以外的字（{t}）')
        return [[who, fx(x[1:-1])] if x[0] == '「' else [None, fx(x)] for x in parts]
    co = jobs['shanlan']['co'] = {'who': who, 'seg': seg, 'flag': z.group(3), 'met': said(z.group(4), '第 7 點（認識過）'), 'new': said(z.group(5), '第 7 點（不認識）'), 'until': z.group(6)}
    # ---- 第 5 節「回 LAWWW 第二輪」----
    q5 = section(md, '## 5. 回 LAWWW')
    # 第 5 節第 1、2 點被第 6 節取代（「以這一節為準」）：她的班、祐廷上班遇到她的兩版都讀第 6 節；「還沒傳第 5 則」那一版作廢，不匯。
    q6 = section(md, '## 6. 宋知寧換到山嵐這條線')
    a1 = need(re.search(r'^1\. \*\*第 (\d+) 則訊息發了以後，她(週[一二三四五六日]) (\d\d:\d\d)～(\d\d:\d\d) 搬到山嵐\*\*', q6, re.M), '第 6 節第 1 點（週六搬到山嵐）')
    a2 = need(re.search(r'^2\. \*\*第 (\d+) 則以後她(週[一二三四五六日]) (\d\d:\d\d)～(\d\d:\d\d) 也在山嵐\*\*.*祐廷上班遇到她的那一句只在他的(週[一二三四五六日])班（一次）。\s*$', q6, re.M), '第 6 節第 2 點（週日多一班）')
    a3 = need(re.search(r'^3\. \*\*第 (\d+) 則以前她不在山嵐\*\*，.*作廢。祐廷上班遇到她只有兩版：傳過第 \1 則＝「(.+?)」＋「(.+?)……」；完全沒認識過她（沒有 ([A-Z_]+)）＝她從(大[一二三四][上下])起就在山嵐（(週[一二三四五六日])、(週[一二三四五六日])），出「(.+?)」\s*$', q6, re.M), '第 6 節第 3 點（兩版）')
    need(re.search(r'^4\. \*\*舊存檔\*\*：已經跳過第 ' + a1.group(1) + r' 則、收到第 \d+ 則的，修好以後補發第 ' + a1.group(1) + r' 則（[^）]*），補發以後才搬。\s*$', q6, re.M), '第 6 節第 4 點（舊存檔補發）')
    u6 = need(re.search(r'^- 她只到(大[一二三四][上下])，照舊。\s*$', q6, re.M), '第 6 節（她只到哪一個學期）')
    if not (a1.group(1) == a2.group(1) == a3.group(1)) or a3.group(4) != co['flag'] or u6.group(1) != co['until']:
        raise SystemExit('第 6 節：第幾則、旗標或學期前後不一樣')
    said_met = [x[1] for x in co['met'] if x[0]]
    if fx(a3.group(2)) != said_met[0] or not said_met[-1].startswith(fx(a3.group(3))) or [fx(a3.group(8))] != [x[1] for x in co['new']]:
        raise SystemExit('第 6 節第 3 點：兩版的句子和第 4 節第 7 點不一樣')
    at = [{'wd': WD[m.group(2)], 't0': hm(m.group(3)), 't1': hm(m.group(4))} for m in (a1, a2)]
    if sorted(q['wd'] for q in at) != sorted([WD[a3.group(6)], WD[a3.group(7)]]) or a2.group(5) != a2.group(2):
        raise SystemExit('第 6 節：第 1、2 點的星期和第 3 點、祐廷的班不一樣')
    sun = at[1]
    if not any(q['wd'] == sun['wd'] and q['t0'] == sun['t0'] and q['t1'] == sun['t1'] for q in jobs['shanlan']['sched']):
        raise SystemExit('第 6 節第 2 點：山嵐的班表沒有那一班')
    co['msgN'], co['at'] = int(a1.group(1)), at
    # ---- 第 8 節「第四輪合併後五問」第 1、2 點：沒認識過她的＝不出現在山嵐，「新來的？」那一版不演（取代第 6 節第 3 點的後半）----
    q8 = section(md, '## 8. 回 LAWWW')
    h1 = need(re.search(r'^1\. \*\*沒認識過(\S+?)的玩家，她不出現在山嵐。\*\*.*第 6 節第 3 點「完全沒認識過她＝她從(大[一二三四][上下])起就在山嵐，出『(.+?)…』」\*\*作廢\*\*', q8, re.M), '第 8 節第 1 點（沒認識過她不出現在山嵐）')
    h2 = need(re.search(r'^2\. 所以「(.+?)」那一版不演，([A-Z_]+) 不用動。祐廷上班遇到她只剩一版：傳過第 (\d+) 則的「(.+?)」那一組。\s*$', q8, re.M), '第 8 節第 2 點（只剩一版）')
    new1 = co['new'][0][1]
    if fx(h1.group(1)) != who or h1.group(2) != a3.group(5) or not new1.startswith(fx(h1.group(3))) or fx(h1.group(3)) != fx(h2.group(1)) \
            or h2.group(2) != co['flag'] or int(h2.group(3)) != co['msgN'] or fx(h2.group(4)) != said_met[0]:
        raise SystemExit('第 8 節第 1、2 點：人、學期、旗標、第幾則或句子和第 4、6 節不一樣')
    del co['new']
    co['wd'], co['t0'], co['t1'] = sun['wd'], sun['t0'], sun['t1']
    c4 = need(re.search(r'^4\. 桌遊夜：系統自動當沒空時，群組裡祐廷自動回一句「(.+?)」，(\S+?)照舊回「(.+?)」——玩家不用操作。\s*$', q5, re.M), '第 5 節第 4 點（桌遊夜自動回）')
    extra = {'bgnBusy': {'me': fx(c4.group(1)), 'who': fx(c4.group(2)), 're': fx(c4.group(3))}}
    need(re.search(r'^5\. 辭職後再應徵：\*\*全部打工比照\*\*（[^）]*都隔一個學期可以再應徵）；熟練度\*\*保留\*\*', q5, re.M), '第 5 節第 5 點（再應徵）')
    extra['reapply'] = {'all': True, 'keepSkill': True}
    m6 = need(re.search(r'^6\. 越好吃上班時同學來吃飯，.*?改這一組通用的（每人一次）：(（[^（）]+）)對方：「(.+?)」→ 祐廷：「(.+?)」→(（[^（）]+）)「他」照對方性別換成他／她。\*\*照每個人各記一次\*\*'
                         r'（同一個人第二次來只出旁白「(（[^（）]+）)」，不再問）。兩個人有自己的句子（[^）]*）：(\S+?)：「(.+?)」／(\S+?)：「(.+?)」；其他人共用「(.+?)」。', q5, re.M), '第 5 節第 6 點（越好吃上班版）')
    done = fx(m6.group(4))
    if m6.group(5) != m6.group(4) or m6.group(10) != m6.group(2) or done.count('他') != 1:
        raise SystemExit('第 5 節第 6 點：前後寫的句子不一樣，或「他」不是剛好一個')
    extra['yueMeal'] = {'narr': fx(m6.group(1)), 'ask': fx(m6.group(2)), 'me': fx(m6.group(3)), 'done': {'m': done, 'f': done.replace('他', '她')},
                        'own': {fx(m6.group(6)): fx(m6.group(7)), fx(m6.group(8)): fx(m6.group(9))}}
    # ---- 第 7 節「回 LAWWW 上一輪五個小問題」----
    q7 = section(md, '## 7. 回 LAWWW')
    NUM = {'一': 1, '兩': 2, '二': 2, '三': 3}
    b1 = need(re.search(r'^1\. 私訊約的桌遊夜撞到班：一樣自動回「(.+?)」\s*$', q7, re.M), '第 7 節第 1 點（私訊約）')
    if fx(b1.group(1)) != extra['bgnBusy']['me']:
        raise SystemExit('第 7 節第 1 點：自動回的那一句和第 5 節第 4 點不一樣')
    extra['bgnBusy']['dm'] = True
    b2 = need(re.search(r'^2\. (\S+?)那句（越好吃上班版）演得到：\*\*交往中\*\*才把\1排進越好吃(晚餐|午餐)的名單（[^）]*），一學期最多(\S)次；沒交往不排。\s*$', q7, re.M), '第 7 節第 2 點（可昕交往中才排）')
    if fx(b2.group(1)) not in extra['yueMeal']['own'] or b2.group(3) not in NUM:
        raise SystemExit('第 7 節第 2 點：那個人沒有自己的句子，或次數看不懂')
    extra['yueMeal']['dating'] = {'who': fx(b2.group(1)), 'slot': {'晚餐': 'dinner', '午餐': 'lunch'}[b2.group(2)], 'termMax': NUM[b2.group(3)]}
    b3 = need(re.search(r'^3\. 女主角來吃飯也說通用句「(.+?)」；(\S+?)例外，她說：「(.+?)」', q7, re.M), '第 7 節第 3 點（女主角、學姊）')
    if fx(b3.group(1)) != extra['yueMeal']['ask']:
        raise SystemExit('第 7 節第 3 點：通用句和第 5 節第 6 點不一樣')
    extra['yueMeal']['own'][fx(b3.group(2))] = fx(b3.group(3))
    need(re.search(r'^4\. 舊打工全部比照再應徵（六間店＋補習班、事務所、家教），隔一個學期。\s*$', q7, re.M), '第 7 節第 4 點（舊打工再應徵）')
    extra['reapply']['tutor'] = True
    b5 = need(re.search(r'^5\. 南洋員工票：再應徵以後不用重新滿 (\d+) 班（做過的保留）。\s*$', q7, re.M), '第 7 節第 5 點（員工票）')
    if int(b5.group(1)) != jobs['cinema']['ticket']['after']:
        raise SystemExit('第 7 節第 5 點：班數和第 2 節不一樣')
    jobs['cinema']['ticket']['keep'] = True
    # ---- 第 8 節第 5 點：家教回「不了」以後不再問 ----
    h5 = need(re.search(r'^5\. 家教：回「(.+?)」以後\*\*不再問\*\*（只問一次）。', q8, re.M), '第 8 節第 5 點（家教只問一次）')
    extra['reapply']['tutorAskOnce'], extra['reapply']['tutorNo'] = True, fx(h5.group(1))
    # ---- 第 9 節「第五輪四問」----
    q9 = section(md, '## 9. 回 LAWWW')
    CN = {'一': 1, '兩': 2, '二': 2, '三': 3, '四': 4}
    s1 = need(re.search(r'^1\. \*\*(\S+?)來越好吃「(.+?)」不走(晚餐|午餐)名單的亂數，另定\*\*：認識她（([a-z_0-9]+)）、她人在臺灣的學期、祐廷在越好吃有蓋到\3的班——每學期第(\S)次符合的那一天演(\S)次；'
                        r'交往中一學期(\S)次（第二次隔至少(\S)週）。', q9, re.M), '第 9 節第 1 點（學姊來越好吃）')
    sis = fx(s1.group(1))
    if extra['yueMeal']['own'].get(sis) != fx(s1.group(2)) or s1.group(5) != '一' or any(s1.group(i) not in CN for i in (6, 7, 8)):
        raise SystemExit('第 9 節第 1 點：那一句和第 7 節第 3 點不一樣，或次數看不懂')
    extra['yueMeal']['sis'] = {'who': sis, 'met': s1.group(4), 'inTaiwan': True, 'slot': {'晚餐': 'dinner', '午餐': 'lunch'}[s1.group(3)],
                               'termMax': CN[s1.group(6)], 'datingMax': CN[s1.group(7)], 'gapWeeks': CN[s1.group(8)]}
    s2 = need(re.search(r'^2\. \*\*家教回「(.+?)」以後怎麼再接\*\*：下一個學期開學起，手機「訊息」那一則家教的對話底下多一個回覆選項「(.+?)」；對方回：「(.+?)」之後照原本答應的流程。\s*$', q9, re.M), '第 9 節第 2 點（家教再接）')
    if fx(s2.group(1)) != extra['reapply']['tutorNo']:
        raise SystemExit('第 9 節第 2 點：那個回答的字和第 8 節第 5 點不一樣')
    extra['reapply']['tutorBack'] = {'opt': fx(s2.group(2)), 're': fx(s2.group(3))}
    need(re.search(r'^3\. 家教那一則沒回、過期：也算問過，不再問；一樣用第 2 點的回覆選項自己回去找。\s*$', q9, re.M), '第 9 節第 3 點（沒回、過期）')
    extra['reapply']['tutorBack']['expired'] = True
    need(re.search(r'^4\. 上班時來吃飯的人真的走進店裡坐下；沒位子或她有更優先的事就整段不演、不算次數：可以。\s*$', q9, re.M), '第 9 節第 4 點（帶不進來不演）')
    return jobs, extra


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    jobs, extra = build(git('show', f'{sha}:{PATH}'))
    data = dict({'src': f'{PATH}@{sha}', 'jobs': jobs}, **extra)
    js = ('/* 自動產生：tools/story/import_shop_jobs_aa828.py（' + data['src'] + '）。不要手改，改企劃 AA_828 再重新匯入。\n'
          '   新店打工第一批：山嵐書店（shanlan）、南洋戲院（cinema）的告示、應徵、班表、三段工作、最後一句、員工票、上班遇到宋知寧；桌遊夜有班自動回的那一句、再應徵的規則、越好吃上班時同學來吃飯——src/jobs3d.js、src/bgnight3d.js 讀；逐句對稿 tests/shop_jobs_aa828_1112_unit.js */\n'
          "'use strict';\nconst SHOP_JOBS_AA828=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)


if __name__ == '__main__':
    main()
