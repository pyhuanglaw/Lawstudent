#!/usr/bin/env python3
"""GG-SHOPS3-STORY-1110／GG-SHOPS3-SYS-1110：公館三間（安泰藥局、汀州鮮果、榮恩典文具社）＋汀州路三間（洗樂洗衣坊、印得好、泰米村食）的店內台詞，
從 AA 的稿匯進 src/data/gg3_shops_lines.js（GG3_LINES）。遊戲的流程在 src/gg3shops3d.js，這支只搬字。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha，import_guard 擋）：
- docs/story_planning/AA_742_公館六間店_設定與台詞.md（六間店的設定、商品價錢、進門、說話、情境、看、打烊）
- docs/story_planning/AA_813_公館六間店_對照LAWWW2的決定.md（以這份為準：kind 對照、第 2 節新加／改寫的「看」、不接的句子、換說話的人）

**台詞一字照稿**：每一句都是稿裡的原字（只過 import_guard.read_fix 的換名；被換到會印出來）。
說話的人另外放（[說話的人, 字]；旁白＝[null, 整句含括號]）；有說話的人的那一句拿掉外面的「」（全遊戲的寫法：對話框不加「」）。
AA_813 的規則照這裡做：
- 要改模型的東西（汀州鮮果吊秤、收音機；洗樂布告欄、補貨的老闆娘；泰米調味料架；榮恩典祝福卡、女兒週末）的句子不接；
  騎樓的 sale、rack 不接；汀州鮮果「老闆娘 17～20 點」那一句改成老闆說、印得好「老闆」說的那一句改成店員說（字不動，只換說話的人：
  稿上這兩句是旁白裡夾一句話，接進來＝那一句話，說話的人換掉；旁白裡描述老闆娘、老闆的字不接）。
- 第 2 節的「看」：照 kind 放進那一間的 look（榮恩典 window＝配置的畫架點 gg_rong_easel；泰米 kitchen 用 AA_813 的句子取代 AA_742 的「出餐窗口」）。
稿的結構和這支工具認得的不一樣（節不見了、句數不對、不認得的情況）＝停下來（先改這支工具和 src/gg3shops3d.js），不會默默丟掉。

測試：node tests/gg_shops3_story_1111_unit.js（第 1 節逐句對稿：資料檔裡每一句都原封不動在 AA_742 或 AA_813 那一版裡）。
用法：python3 tools/shops/import_gg3_shops.py [--check]（--check：只比對，資料檔和稿匯出來的不一樣＝結束碼 1）"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

SHA = '90fb5fa77'   # 2026-11-12 SHOP-LIFE-AA826-1112：泰米午休作廢（AA e24b6cec7；AA_826 lawww_answers 第 7 點）；舊 8f6650289（11-11 AA 回七格）、75f5de658
P742 = 'docs/story_planning/AA_742_公館六間店_設定與台詞.md'
P813 = 'docs/story_planning/AA_813_公館六間店_對照LAWWW2的決定.md'
OUT = 'src/data/gg3_shops_lines.js'
WHO = ('藥師', '老闆娘', '老闆', '店員')
CHANGED = []
# 約去吃：稿上的稱呼 → 人物 id（src/data/characters.js 的 nickname；一般＝沒有自己句子的人）
PEOPLE = {'一般': None, '以安': 'heroine_01', '芷若': 'heroine_02', '語彤': 'heroine_03', '子晴': 'heroine_04', '學姊': 'heroine_05',
          '沛珊': 'classmate_peishan', '可昕': 'kexin'}


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_gg3_shops：' + m)


def fix(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{x!r}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def read(path):
    ok, why = IG.allowed(path, SHA, IG.load(ROOT))
    if not ok:
        die(why)
    return git('show', f'{SHA}:{path}')


# ---------- markdown ----------
def split(lines, mark):
    """照標題（mark＝'## ' 或 '### '）切成 [(標題, [行…])]；標題前面的行放在 ''。"""
    out, cur, buf = [], '', []
    for ln in lines:
        if ln.startswith(mark):
            out.append((cur, buf))
            cur, buf = ln[len(mark):].strip(), []
        else:
            buf.append(ln)
    out.append((cur, buf))
    return out


def sec(secs, prefix, where):
    hits = [b for t, b in secs if t.startswith(prefix)]
    if len(hits) != 1:
        die(f'{where}：找不到（或不只一個）「{prefix}」那一節')
    return hits[0]


# 稿裡句子後面的編輯註記（8f6650289 起：「（AA_700；11-11 改）」「（11-11 改：開放式廚房，AA_813）」）：不是台詞，拿掉。只拿行尾、而且裡面寫「改」＋日期或「AA_」的那一對括號
NOTE = re.compile(r'\s*（(?:AA_\d+；)?\d{1,2}-\d{1,2} 改(?:[：:][^（）]*)?）$')


def unnote(t):
    return NOTE.sub('', t)


def bullets(lines):
    """[(第一層的字, [第二層的字…])]"""
    out = []
    for ln in lines:
        if ln.startswith('- '):
            out.append([unnote(ln[2:].strip()), []])
        elif ln.startswith('  - '):
            if not out:
                die('第二層的項目前面沒有第一層：' + ln)
            out[-1][1].append(unnote(ln[4:].strip()))
    return out


def table(lines):
    rows = [ln for ln in lines if ln.startswith('|')]
    if len(rows) < 2:
        return []
    out = []
    for ln in rows[2:]:
        out.append([c.strip() for c in ln.strip().strip('|').split('|')])
    return out


def last_paren(s, where):
    """字串最後一段完整的（…）（可以有巢狀的括號）。"""
    if not s.endswith('）'):
        die(f'{where}：最後不是（…）：{s}')
    d = 0
    for i in range(len(s) - 1, -1, -1):
        c = s[i]
        if c == '）':
            d += 1
        elif c == '（':
            d -= 1
            if d == 0:
                return s[i:]
    die(f'{where}：括號不成對：{s}')


def first_paren(s, where):
    """字串開頭的那一段完整的（…）和後面剩下的字。"""
    if not s.startswith('（'):
        die(f'{where}：開頭不是（：{s}')
    d = 0
    for i, c in enumerate(s):
        if c == '（':
            d += 1
        elif c == '）':
            d -= 1
            if d == 0:
                return s[:i + 1], s[i + 1:]
    die(f'{where}：括號不成對：{s}')


def narr(s, where):
    """整句旁白（…）＝[null, 字]。"""
    p, rest = first_paren(s, where)
    if rest:
        die(f'{where}：旁白後面還有字（{rest}）')
    return [None, fix(p, where)]


def said(s, where, tail=False):
    """「說話的人：「字」」或「說話的人：字」→ [說話的人, 字]；tail＝後面可以有一段（…）（回傳 (句, 後面那段)）。"""
    m = re.match(r'^(' + '|'.join(WHO) + r')：「(.+?)」(（.*）)?$', s)
    if m:
        if m.group(3) and not tail:
            die(f'{where}：句子後面還有（…）：{s}')
        r = [m.group(1), fix(m.group(2), where)]
        return (r, m.group(3)) if tail else r
    m = re.match(r'^(' + '|'.join(WHO) + r')：([^「」]+)$', s)
    if m:
        r = [m.group(1), fix(m.group(2), where)]
        return (r, None) if tail else r
    die(f'{where}：認不得說話的人（{s}）')


def line(s, where):
    return narr(s, where) if s.startswith('（') else said(s, where)


def quoted(s, where):
    """表格裡只有「字」（說話的人在表頭）。"""
    m = re.match(r'^「(.+)」$', s)
    if not m:
        die(f'{where}：要是「字」：{s}')
    return fix(m.group(1), where)


def kind_of(s):
    m = re.search(r'（`([a-z_]+)`）', s)
    return m.group(1) if m else None


def after_colon(s, where):
    i = s.find('：')
    if i < 0:
        die(f'{where}：沒有冒號：{s}')
    return s[i + 1:].strip()


def price(s, where):
    m = re.match(r'^(\d+)$', s)
    if not m:
        die(f'{where}：價錢要是數字：{s}')
    return int(m.group(1))


def want(n, a, where):
    if len(a) != n:
        die(f'{where}：稿上應該是 {n} 項，現在 {len(a)} 項（稿改了：先改這支工具）')
    return a


# ---------- 各間 ----------
def antai(S):
    W = 'G04 安泰藥局'
    goods = []
    for r in want(8, table(sec(S, '商品', W)), W + ' 商品'):
        goods.append({'n': fix(r[0], W), 'p': price(r[1], W), 'look': narr(r[2], W + ' 商品')[1]})
    door = [line(b[0], W + ' 進門') for b in want(3, bullets(sec(S, '進門', W)), W + ' 進門')]
    talk = {'normal': [], 'night': [], 'exam': [], 'cold': [], 'again': []}
    KEY = {'平常': 'normal', '晚上 21:00 以後': 'night', '期中、期末考週': 'exam', '十一月到二月（感冒季）': 'cold', '第二次以後來': 'again'}
    for r in want(7, table(sec(S, '跟藥師說話', W)), W + ' 跟藥師說話'):
        if r[0] not in KEY:
            die(f'{W} 跟藥師說話：不認得的情況「{r[0]}」')
        talk[KEY[r[0]]].append(quoted(r[1], W))
    look, bp = {}, None
    for b, ch in bullets(sec(S, '看店裡的東西', W)):
        k = kind_of(b)
        if k == 'sale':
            continue   # AA_813 第 4 點：騎樓特價鐵架不做，句子不接
        t = narr(after_colon(b, W), W + ' 看 ' + str(k))[1]
        if k == 'bp':
            if len(ch) != 1 or not ch[0].startswith('按「量血壓」'):
                die(W + ' 血壓計：要有一項「按「量血壓」」')
            bp = {'look': t, 'opt': '量血壓', 'done': narr(after_colon(ch[0], W), W + ' 量血壓')[1]}
        elif k == 'cabinet':
            look['gg_antai_cabinet'] = [t]
        else:
            die(f'{W} 看：不認得的 kind {k}')
    if not bp or 'gg_antai_cabinet' not in look:
        die(W + ' 看：少了血壓計或藥品櫃')
    close, sign = closing(S, W, {'打烊': 'close', '關門時到門口': 'sign'})
    return {'name': '安泰藥局', 'who': '藥師', 'goods': goods, 'door': door, 'talk': talk, 'bp': bp, 'look': look, 'close': close['close'], 'sign': sign['sign']}


def closing(S, W, keys, title='打烊', struck=(), unused=()):
    """打烊、關門那一節：{打烊: 說話的字}、{關門的情況: 旁白}。
    struck＝稿上劃掉（~~…~~）而且寫了「取消」的那幾項：不接；沒有劃掉＝停下來。unused＝稿上還留著、但遊戲已經用不到的那幾項（寫原因在呼叫的地方）：不接。"""
    c, s = {}, {}
    seen_struck = set()
    for b, _ in bullets(sec(S, title, W)):
        i = b.find('：')
        k = b[:i]
        m = re.match(r'^~~(.+)~~$', k)
        if m and m.group(1) in struck:
            if '取消' not in b[i + 1:]:
                die(f'{W} {title}：「{k}」劃掉了卻沒有寫取消')
            seen_struck.add(m.group(1))
            continue
        if k in unused:
            continue
        if k not in keys:
            die(f'{W} {title}：不認得「{k}」')
        v = b[i + 1:].strip()
        if keys[k].startswith('close'):
            c[keys[k]] = said(v, W + ' ' + k)[1]
        else:
            p, rest = first_paren(v, W + ' ' + k)
            if rest and not re.match(r'^（[^（）]*）$', rest):   # 後面是給 LAWWW 的備註（例：（不是期末週也一樣貼著））
                die(f'{W} {k}：旁白後面不認得的字（{rest}）')
            s[keys[k]] = fix(p, W + ' ' + k)
    if set(c) | set(s) != set(keys.values()):
        die(f'{W} {title}：少了 {set(keys.values()) - set(c) - set(s)}')
    if seen_struck != set(struck):
        die(f'{W} {title}：{set(struck) - seen_struck} 應該是劃掉的（稿又改了：先改這支工具和 src/gg3shops3d.js）')
    return c, s


def xianguo(S):
    W = 'G08 汀州鮮果'
    goods = []
    for r in want(8, table(sec(S, '商品', W)), W + ' 商品'):
        n, look = fix(r[0], W), narr(r[2], W + ' 商品')[1]
        if '／' in r[1]:
            ps = [price(x, W) for x in r[1].split('／')]
            m = re.match(r'^(.+)（(.+)）$', n)
            if not m or len(m.group(2).split('／')) != len(ps):
                die(f'{W} 商品：「{n}」的價錢有兩種，名字要寫（小／大）')
            goods.append({'n': n, 'p': ps, 'sizes': m.group(2).split('／'), 'look': look})
        else:
            goods.append({'n': n, 'p': price(r[1], W), 'look': look})
    cut = None
    for b, _ in bullets(sec(S, '商品', W)):
        m = re.match(r'^(.+)可以選「(切好)」（不加錢，時間 \+(\d+) 分鐘）。$', b)
        if m:
            names = m.group(1).split('、')
            items = [g['n'] for g in goods if any(g['n'].startswith(x) for x in names)]
            if len(items) != len(names):
                die(f'{W} 切好：{names} 對不到商品')
            cut = {'items': items, 'opt': m.group(2), 'min': int(m.group(3))}
    if not cut:
        die(W + ' 商品：少了「切好」那一項')
    door = []
    for b in want(3, bullets(sec(S, '進門', W)), W + ' 進門'):
        if '收音機' in b[0]:
            continue   # AA_813 第 3 點：收音機要改模型＝這一句不接
        door.append(line(b[0], W + ' 進門'))
    buy = bullets(sec(S, '買', W))
    ask = after = short = None
    for b, ch in buy:
        if b.startswith('老闆：「要什麼？」'):
            ask = quoted(re.match(r'^老闆：(「.+?」)', b).group(1), W)
        elif b.startswith('買完'):
            after = []
            for c in want(3, ch, W + ' 買完'):
                if c.startswith('（'):
                    after.append(narr(c, W + ' 買完') + [None])
                else:
                    r, tail = said(c, W + ' 買完', tail=True)
                    if tail and '5 結尾' in tail:
                        r.append('five')   # 只在總額是 5 結尾時說，算少 5 元（AA_742：LAWWW 選穩的＝只在 5 結尾時說、少算 5 元）
                    elif tail:
                        die(f'{W} 買完：不認得的備註 {tail}')
                    else:
                        r.append(None)
                    after.append(r)
        elif b.startswith('錢不夠：'):
            short = said(after_colon(b, W), W + ' 錢不夠')[1]
    if not (ask and after and short):
        die(W + ' 買：少了要什麼／買完／錢不夠')
    sit = {}
    for r in want(4, table(sec(S, '情境', W)), W + ' 情境'):
        k, v = r[0], r[1]
        if k == '晚上 20:00 以後':
            x, tail = said(v, W + ' 情境', tail=True)
            m = re.match(r'^（這一段香蕉 (\d+)）$', tail or '')
            if not m:
                die(W + ' 20:00 以後：要寫香蕉幾元')
            sit['late'] = {'line': x, 'banana': int(m.group(1)), 'from': 20}
        elif k == '期末考週':
            sit['final'] = {'line': said(v, W + ' 情境')}
        elif k == '買水果禮盒':
            x, tail = said(v, W + ' 情境', tail=True)
            sit['gift'] = {'line': x, 'narr': [None, fix(tail, W)] if tail else None}
        elif k == '傍晚 17:00～20:00':
            # AA_813：汀州鮮果只有一位老闆，老闆娘那一句改成老闆說（字不動）＝旁白裡她說的那一句話，說話的人換成老闆
            m = re.search(r'「([^「」]+)」）$', v)
            if not m or '老闆娘' not in v:
                die(W + ' 傍晚：認不得老闆娘那一句')
            sit['dusk'] = {'line': ['老闆', fix(m.group(1), W)], 'from': 17, 'to': 20}
        else:
            die(f'{W} 情境：不認得「{k}」')
    look = {}
    for b, _ in bullets(sec(S, '看', W)):
        k = kind_of(b)
        if k in ('scale', 'radio'):
            continue   # AA_813 第 3 點：吊秤、收音機要改模型＝不接
        if k != 'boxes':
            die(f'{W} 看：不認得的 kind {k}')
        look['gg_fruit_boxes'] = [narr(after_colon(b, W), W + ' 看紙箱')[1]]
    close, sign = closing(S, W, {'打烊': 'close', '關門時到門口': 'sign'})
    return {'name': '汀州鮮果', 'who': '老闆', 'goods': goods, 'cut': cut, 'door': door, 'ask': ask, 'after': after, 'short': short, 'sit': sit,
            'look': look, 'close': close['close'], 'sign': sign['sign']}


def xile(S):
    W = 'G09 洗樂洗衣坊'
    wash = change = soap = None
    for b, ch in bullets(sec(S, '使用', W)):
        k = kind_of(b)
        if k == 'wash':
            want(3, ch, W + ' 洗衣機')
            opts = re.findall(r'「([^「」]+)」', ch[0])
            if len(opts) != 3:
                die(W + ' 洗衣機：選項要三個')
            menu = []
            for o in opts[:2]:
                m = re.match(r'^.+（(\d+) 分鐘，(\d+) 元）$', o)
                if not m:
                    die(f'{W} 洗衣機：「{o}」要寫分鐘和元')
                menu.append({'t': fix(o, W), 'min': int(m.group(1)), 'p': int(m.group(2))})
            ways = re.findall(r'「([^「」]+)」＝', ch[1])   # 選項＝後面接「＝」的那兩個（「等的時候」「回來的時候」是節名）
            if ways != ['在這裡等', '先去別的地方']:
                die(W + ' 洗衣機：選完以後要是「在這裡等」「先去別的地方」')
            if not ch[2].startswith('一天最多洗一次'):
                die(W + ' 洗衣機：要寫一天最多洗一次')
            wash = {'menu': menu, 'no': fix(opts[2], W), 'stay': ways[0], 'go': ways[1], 'perDay': 1}
        elif k == 'change':
            change = {'name': fix(b[:b.index('（`')], W), 'narr': narr(after_colon(b, W), W + ' 換零錢')[1]}
        elif k == 'soap':
            name = fix(b[:b.index('（`')], W)
            rest = after_colon(b, W)
            m = re.match(r"^(.+?)（買了只有旁白：(.+)）$", rest)
            if not m:
                die(W + ' 洗衣精：認不得')
            items = []
            for x in m.group(1).split('、'):
                mm = re.match(r'^(.+) (\d+) 元$', x)
                if not mm:
                    die(f'{W} 洗衣精：「{x}」要寫幾元')
                items.append({'n': fix(mm.group(1), W), 'p': int(mm.group(2))})
            nb = {}
            if '＝（' in m.group(2):   # 8f6650289（AA 11-11 16:18 d）：「洗衣精＝（…）；柔軟精＝（…）」一樣東西一句
                for part in m.group(2).split('；'):
                    mm = re.match(r'^(.+?)＝(（.+）)$', part.strip())
                    if not mm:
                        die(f'{W} 洗衣精：「{part}」要寫「東西＝（旁白）」')
                    nb[fix(mm.group(1), W)] = fix(mm.group(2), W)
                if set(nb) != {it['n'] for it in items}:
                    die(f'{W} 洗衣精：旁白對不上東西 {sorted(nb)} / {[it["n"] for it in items]}')
                soap = {'name': name, 'items': items, 'narr': nb[items[0]['n']], 'narrBy': nb}
            else:
                if not re.match(r'^（.+）$', m.group(2)):
                    die(W + ' 洗衣精：旁白要用括號')
                soap = {'name': name, 'items': items, 'narr': fix(m.group(2), W)}
        else:
            die(f'{W} 使用：不認得的 kind {k}')
    if not (wash and change and soap):
        die(W + ' 使用：少了洗衣機、換零錢或洗衣精')
    door = [line(b[0], W + ' 進門') for b in want(3, bullets(sec(S, '進門', W)), W + ' 進門')]
    wait = []
    for b in want(8, bullets(sec(S, '等的時候', W)), W + ' 等的時候'):
        if '布告欄' in b[0]:
            continue   # AA_813 第 3 點：布告欄要改模型＝不接
        wait.append(narr(b[0], W + ' 等的時候')[1])
    back = [narr(b[0], W + ' 回來的時候')[1] for b in want(2, bullets(sec(S, '回來的時候', W)), W + ' 回來的時候')]
    look = {}
    KIND = {'guide': 'tz_xile_guide', 'table': 'tz_xile_fold'}
    for b, _ in bullets(sec(S, '看', W)):
        k = kind_of(b)
        if k == 'board':
            continue   # AA_813 第 3 點：布告欄不接
        if k not in KIND:
            die(f'{W} 看：不認得的 kind {k}')
        look[KIND[k]] = [narr(after_colon(b, W), W + ' 看 ' + k)[1]]
    cl = want(1, bullets(sec(S, '關門', W)), W + ' 關門')[0][0]
    if '照一律關' not in cl:
        die(W + ' 關門：要寫颱風一律關的那一句')
    typhoon = fix(last_paren(cl, W + ' 關門'), W)
    return {'name': '洗樂洗衣坊', 'who': None, 'wash': wash, 'change': change, 'soap': soap, 'door': door, 'wait': wait, 'back': back, 'look': look, 'typhoon': typhoon}


def yindehao(S):
    W = 'G10 印得好'
    prices = [{'n': fix(r[0], W), 'p': r[1]} for r in want(9, table(sec(S, '價目', W)), W + ' 價目')]
    menu = []
    for b, _ in want(4, [x for x in bullets(sec(S, '玩家能做的', W)) if x[0].startswith('「')], W + ' 選單'):   # 最後一項「沒有對應的作業系統也沒關係」是說明
        m = re.match(r'^「([^「」]+)」(（(.+?)才有）)?：(.+?)，時間 \+(\d+) 分鐘', b)
        if not m:
            die(f'{W} 選單：認不得「{b}」')
        label, when, body, mins = fix(m.group(1), W), m.group(3), m.group(4), int(m.group(5))
        item = {'t': label, 'min': mins}
        if when == '期末考週和前一週':
            item['when'] = 'finals'
        elif when == '大四起':
            item['when'] = 'y4'
        elif when:
            die(f'{W} 選單：不認得的條件 {when}')
        mm = re.search(r'＝(\d+) 元$', body)
        if mm:
            item['p'] = int(mm.group(1))
        else:   # 印履歷／備審資料：履歷 30 元、備審 200 元＝價目表的那兩項
            subs = re.findall(r'(履歷|備審) (\d+) 元', body)
            if len(subs) != 2:
                die(f'{W} 選單：「{label}」要寫履歷、備審幾元')
            item['sub'] = []
            for k, p in subs:
                hit = [q for q in prices if q['n'].startswith(k) or q['n'].startswith('研究所' + k)]
                if len(hit) != 1 or str(hit[0]['p']) != p:
                    die(f'{W} 選單：{k} {p} 元對不到價目表')
                item['sub'].append({'k': k, 'n': hit[0]['n'], 'p': int(p)})
        menu.append(item)
    door = [line(b[0], W + ' 進門') for b in want(3, bullets(sec(S, '進門', W)), W + ' 進門')]
    after = bind = shen = short = None
    for b, ch in bullets(sec(S, '櫃台', W)):
        if b.startswith('點完'):
            after = [line(c, W + ' 點完') for c in want(3, ch, W + ' 點完')]
        elif b.startswith('裝訂期末報告時'):
            bind = [line(c, W + ' 裝訂') for c in want(2, ch, W + ' 裝訂')]
        elif b.startswith('印備審資料時'):
            want(2, ch, W + ' 備審')
            x = [line(ch[0], W + ' 備審')]
            # AA_813：印得好只有店員一位，「老闆」說的那一句改成店員說（字不動）＝旁白裡老闆說的那一句話，說話的人換成店員
            m = re.search(r'「([^「」]+)」）$', ch[1])
            if not m or '老闆' not in ch[1]:
                die(W + ' 備審：認不得老闆那一句')
            x.append(['店員', fix(m.group(1), W)])
            shen = x
        elif b.startswith('錢不夠：'):
            short = said(after_colon(b, W), W + ' 錢不夠')[1]
    if not (after and bind and shen and short):
        die(W + ' 櫃台：少了點完／裝訂／備審／錢不夠')
    look = {}
    KIND = {'samples': 'tz_yin_samples', 'price': 'tz_yin_price', 'pc': 'tz_yin_pc'}
    for b, _ in bullets(sec(S, '看', W)):
        k = kind_of(b)
        if k == 'rack':
            continue   # AA_813 第 4 點：騎樓樣本架不做，不接
        if k not in KIND:
            die(f'{W} 看：不認得的 kind {k}')
        look[KIND[k]] = [narr(after_colon(b, W), W + ' 看 ' + k)[1]]
    close, sign = closing(S, W, {'打烊': 'close', '關門時到門口': 'sign', '週日到門口': 'off'})
    return {'name': '印得好', 'who': '店員', 'prices': prices, 'menu': menu, 'door': door, 'after': after, 'bind': bind, 'shen': shen, 'short': short,
            'look': look, 'close': close['close'], 'sign': sign['sign'], 'off': sign['off']}


def taimi(S):
    W = 'G11 泰米村食'
    menu = []
    for r in want(7, table(sec(S, '菜單', W)), W + ' 菜單'):
        n = fix(r[0], W)
        m = re.match(r'^(\d+)(（午間 (\d+):00～(\d+):00 特價 (\d+)）)?$', r[1])
        if not m:
            die(f'{W} 菜單：「{r[1]}」認不得')
        it = {'n': n, 'p': int(m.group(1)), 'desc': fix(r[2], W)}
        if m.group(2):
            it['lunch'] = {'from': int(m.group(3)), 'to': int(m.group(4)), 'p': int(m.group(5))}
        menu.append(it)
    spicy = short = None
    for b, ch in bullets(sec(S, '菜單', W)):
        if b.startswith('**辣度**'):
            m = re.search(r'老闆娘：「(辣度？)」→(.+)。$', b)
            if not m:
                die(W + ' 辣度：認不得')
            opts = re.findall(r'「([^「」]+)」', m.group(2))
            want(2, ch, W + ' 辣度')
            mm = re.match(r'^選「(.+?)」時老闆娘多一句：「(.+)」$', ch[0])
            if not mm or mm.group(1) not in opts:
                die(W + ' 辣度：認不得「正常」多的那一句')
            m2 = re.match(r'^(.+)預設不辣，就不問。$', ch[1])
            if not m2:
                die(W + ' 辣度：要寫哪幾道不問')
            no = []
            for x in m2.group(1).split('、'):
                hit = [q['n'] for q in menu if x in q['n']]
                if len(hit) != 1:
                    die(f'{W} 辣度：「{x}」對不到菜')
                no.append(hit[0])
            spicy = {'ask': fix(m.group(1), W), 'opts': [fix(o, W) for o in opts], 'more': {'opt': mm.group(1), 'line': fix(mm.group(2), W)}, 'skip': no}
        elif b.startswith('錢不夠：'):
            x, tail = said(after_colon(b, W), W + ' 錢不夠', tail=True)
            if not tail or '不是中午的時候' not in tail:
                die(W + ' 錢不夠：要寫只有不是中午的時候說')
            short = {'line': x[1], 'notLunch': True}
    if not (spicy and short):
        die(W + ' 菜單：少了辣度或錢不夠')
    door = [line(b[0], W + ' 進門') for b in want(3, bullets(sec(S, '進門', W)), W + ' 進門')]
    ask = after = None
    for b, ch in bullets(sec(S, '點餐', W)):
        if b.startswith('老闆娘：「要吃什麼？」'):
            ask = quoted(re.match(r'^老闆娘：(「.+?」)', b).group(1), W)
        elif b.startswith('點完'):
            after = [line(c, W + ' 點完') for c in want(3, ch, W + ' 點完')]
    if not (ask and after):
        die(W + ' 點餐：少了要吃什麼／點完')
    eat = [narr(b[0], W + ' 吃')[1] for b in want(4, bullets(sec(S, '吃', W)), W + ' 吃')]
    look = {}
    KIND = {'menu': 'tz_taimi_menu', 'photo': 'tz_taimi_photo'}
    for b, _ in bullets(sec(S, '看', W)):
        k = kind_of(b)
        if k == 'condiments':
            continue   # AA_813 第 3 點：調味料架要改模型＝不接
        if k == 'kitchen':
            continue   # AA_813 第 2 節：現在是開放式廚房，用 AA_813 的句子（下面 aa813()）
        if k not in KIND:
            die(f'{W} 看：不認得的 kind {k}')
        look[KIND[k]] = [narr(after_colon(b, W), W + ' 看 ' + k)[1]]
    seat = {}
    SK = {'兩人桌': 'two', '四人桌': 'four'}
    for b, _ in want(2, bullets(sec(S, '坐下', W)), W + ' 坐下'):
        k = b[:b.find('：')]
        if k not in SK:
            die(f'{W} 坐下：不認得「{k}」')
        seat[SK[k]] = narr(after_colon(b, W), W + ' 坐下')[1]
    # 90fb5fa77（AA e24b6cec7，X349）：午休取消——「午休（14:00）」那一句稿上劃掉了；「14:00～17:00 到門口」的木牌稿上還留著，但店下午不關了（places.js 11:00～21:00 一段），永遠輪不到＝不接（回報 AA）
    close, sign = closing(S, W, {'打烊（21:00）': 'close', '21:00 以後到門口': 'sign', '週一到門口': 'off'}, title='打烊、休息、關門', struck=('午休（14:00）',), unused=('14:00～17:00 到門口',))
    acc, acc0 = {}, None
    for r in want(8, table(sec(S, '約去吃', W)), W + ' 約去吃'):
        if r[0] not in PEOPLE:
            die(f'{W} 約去吃：不認得的人「{r[0]}」')
        m = re.match(r'^「(.+?)」(（.*）)?$', r[1])
        if not m:
            die(f'{W} 約去吃：{r[0]} 認不得')
        t = fix(m.group(1), W)
        if PEOPLE[r[0]] is None:
            acc0 = t
        else:
            acc[PEOPLE[r[0]]] = t
    m = re.search(r'；午餐 (\d+):(\d+)～(\d+):(\d+)、晚餐 (\d+):(\d+)～(\d+):(\d+)）', '（' + [t for t, _ in S if t.startswith('約去吃')][0].split('（', 1)[1])
    if not m:
        die(W + ' 約去吃：標題要寫午餐、晚餐的時間')
    g = [int(x) for x in m.groups()]
    windows = [[g[0] + g[1] / 60, g[2] + g[3] / 60], [g[4] + g[5] / 60, g[6] + g[7] / 60]]
    seatOpen = [narr(b[0], W + ' 開場句')[1] for b in want(2, bullets(sec(S, '和她坐下以後的開場句', W)), W + ' 開場句')]
    return {'name': '泰米村食', 'who': '老闆娘', 'menu': menu, 'spicy': spicy, 'short': short, 'door': door, 'ask': ask, 'after': after, 'eat': eat, 'look': look,
            'seat': seat, 'close': close['close'], 'sign': sign['sign'], 'off': sign['off'],
            'invite': {'acc0': acc0, 'acc': acc, 'windows': windows, 'seatOpen': seatOpen}}


def rong(S):
    W = 'G13 榮恩典文具社'
    goods = []
    for r in want(17, table(sec(S, '商品', W)), W + ' 商品'):
        cat = fix(r[0], W)
        for sep in ('／', '、'):
            if sep in r[2]:
                ns, ps = r[1].split(sep), r[2].split(sep)
                break
        else:
            ns, ps = [r[1]], [r[2]]
        if len(ns) != len(ps):
            die(f'{W} 商品：「{r[1]}」和價錢「{r[2]}」對不起來')
        for n, p in zip(ns, ps):
            goods.append({'cat': cat, 'n': fix(n.strip(), W), 'p': price(p.strip(), W)})
    cart = None
    for b, _ in bullets(sec(S, '商品', W)):
        if kind_of(b) == 'cart':
            m = re.match(r'^(.+?)（`cart`）：(.+?) (\d+)。$', b)
            if not m:
                die(W + ' 推車：認不得')
            cart = {'name': fix(m.group(1), W), 'n': fix(m.group(2), W), 'p': int(m.group(3))}
    if not cart:
        die(W + ' 商品：少了特價推車')
    door = [line(b[0], W + ' 進門') for b in want(3, bullets(sec(S, '進門', W)), W + ' 進門')]
    after = short = None
    for b, ch in bullets(sec(S, '買', W)):
        if b.startswith('買完'):
            after = [line(c, W + ' 買完') for c in want(3, ch, W + ' 買完')]
        elif b.startswith('錢不夠：'):
            x, tail = said(after_colon(b, W), W + ' 錢不夠', tail=True)
            m = re.search(r'選「(.+?)」', tail or '')
            if not m:
                die(W + ' 錢不夠：要寫玩家選的那一項')
            short = {'line': x[1], 'opt': fix(m.group(1), W)}
    if not (after and short):
        die(W + ' 買：少了買完／錢不夠')
    sit = {}
    for r in want(5, table(sec(S, '情境', W)), W + ' 情境'):
        k, v = r[0], r[1]
        if k == '學期第 1～2 週':
            sit['early'] = {'line': narr(v, W + ' 情境'), 'weeks': [1, 2]}
        elif k == '期中、期末考前一週':
            sit['preExam'] = {'line': said(v, W + ' 情境')}
        elif k == '十二月':
            sit['dec'] = {'line': narr(v, W + ' 情境'), 'month': 12}
        elif k.startswith('週末'):
            continue   # AA_813：榮恩典「女兒週末」那條情境不接
        elif k == '買卡片或包裝紙':
            m = re.match(r'^老闆：「(.+?)」→「(.+?)」＝(（.+）)時間 \+(\d+) 分鐘$', v)
            if not m:
                die(W + ' 包裝：認不得')
            items = [g['n'] for g in goods if g['n'] in ('卡片',) or g['n'].startswith('包裝紙')]
            if len(items) != 2:
                die(W + ' 包裝：卡片、包裝紙對不到商品')
            sit['wrap'] = {'line': ['老闆', fix(m.group(1), W)], 'opt': fix(m.group(2), W), 'narr': fix(m.group(3), W), 'min': int(m.group(4)), 'items': items}
        else:
            die(f'{W} 情境：不認得「{k}」')
    look = {}
    for b, ch in bullets(sec(S, '看', W)):
        k = kind_of(b)
        if k in ('window',):
            continue   # AA_813 第 2 節：櫥窗改看畫架（gg_rong_easel），用 AA_813 的句子
        if k in ('card',):
            continue   # AA_813 第 3 點：祝福卡要改模型＝不接
        if k == 'abacus':
            continue   # 算盤：配置沒有這個互動點（AA_813 也沒有列），先不接
        if k != 'art':
            die(f'{W} 看：不認得的 kind {k}')
        look['gg_rong_art'] = [narr(after_colon(b, W), W + ' 看畫材')[1]]
    close, sign = closing(S, W, {'打烊': 'close', '關門時到門口': 'sign', '週日到門口': 'off'})
    return {'name': '榮恩典文具社', 'who': '老闆', 'goods': goods, 'cart': cart, 'door': door, 'after': after, 'short': short, 'sit': sit, 'look': look,
            'close': close['close'], 'sign': sign['sign'], 'off': sign['off']}


def aa813(md, out):
    """第 2 節：改寫、新加的「看」（kind → 那一間的 look）。"""
    secs = split(md.splitlines(), '## ')
    rows = table(sec(secs, '2.', 'AA_813'))
    SHOP = {'榮恩典': 'gg_rongendian', '汀州鮮果': 'gg_xianguo', '洗樂': 'tz_xile', '印得好': 'tz_yindehao', '泰米': 'tz_taimi'}
    n = 0
    for r in want(8, rows, 'AA_813 第 2 節'):
        z = SHOP.get(r[0])
        if not z:
            die(f'AA_813 第 2 節：不認得的店「{r[0]}」')
        m = re.match(r'^`([a-z_]+)`', r[1])
        if not m:
            die(f'AA_813 第 2 節：kind 認不得（{r[1]}）')
        k = m.group(1)
        if k == 'window':
            k = 'gg_rong_easel'   # 「window（改看畫架；放在右前方的 easels）」＝配置的畫架點
        t = narr(r[2], 'AA_813 ' + k)[1]
        out[z]['look'][k] = [t]
        n += 1
    return n


def build():
    md = read(P742)
    md813 = read(P813)
    shops = {t: b for t, b in split(md.splitlines(), '## ')}
    def S(prefix):
        hits = [b for t, b in shops.items() if t.startswith(prefix)]
        if len(hits) != 1:
            die(f'AA_742：找不到「{prefix}」那一節')
        return split(hits[0], '### ')
    out = {'gg_antai': antai(S('G04 安泰藥局')), 'gg_xianguo': xianguo(S('G08 汀州鮮果')), 'tz_xile': xile(S('G09 洗樂洗衣坊')),
           'tz_yindehao': yindehao(S('G10 印得好')), 'tz_taimi': taimi(S('G11 泰米村食')), 'gg_rongendian': rong(S('G13 榮恩典文具社'))}
    aa813(md813, out)
    return out


def render(data):
    head = ('/* ===== 公館三間＋汀州路三間店的店內台詞（GG-SHOPS3-STORY-1110）——自動產生，不要手改 =====\n'
            f'   來源：企劃線 {SHA} 的 {P742}、{P813}（AA 定稿 D109；白名單 docs/handoff/story_import_allow.json）。\n'
            '   產生：python3 tools/shops/import_gg3_shops.py（字一字照稿；說話的人＝[說話的人, 字]、旁白＝[null, 字]；AA_813 不接的句子不在這裡）。\n'
            '   流程在 src/gg3shops3d.js；測試 node tests/gg_shops3_story_1111_unit.js（逐句對稿）。 */\n')
    body = 'const GG3_LINES={\n' + ',\n'.join(f'  {json.dumps(k)}:{json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in data.items()) + '\n};\n'
    body += f'GG3_LINES._src={{sha:{json.dumps(SHA)},docs:{json.dumps([P742, P813], ensure_ascii=False)}}};\n'
    return head + "'use strict';\n" + body


def main():
    data = build()
    text = render(data)
    path = os.path.join(ROOT, OUT)
    for c in CHANGED:
        print('換名：' + c)
    if '--check' in sys.argv:
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        if old != text:
            print(f'{OUT} 和稿匯出來的不一樣（重新跑 python3 tools/shops/import_gg3_shops.py）')
            sys.exit(1)
        print(f'{OUT} 和稿一致')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    n = sum(len(json.dumps(v, ensure_ascii=False)) for v in data.values())
    print(f'寫入 {OUT}（六間；{n} 字元）')


if __name__ == '__main__':
    main()
