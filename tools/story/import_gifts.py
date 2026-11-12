#!/usr/bin/env python3
"""送早餐、飲料（GIFT-FLIRT-1107；使用者 11-07「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」）。
企劃 AA_710（docs/story_planning/AA_710_gifts.json，七位女主角）＋AA_728（docs/story_planning/AA_728_gifts_friends.json，朋友六位）
→ src/data/gift_lines.js（GIFT_LINES）。播放 src/gift3d.js。
- 兩份來源都一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix；有名字說的那一句外面不加「」（TEXT-QUOTE-UNIFY-1108），稿裡有就停下來。
- 品項（fav.item、opinion[].item）要對得到 src/gift3d.js 賣的品項（從 S.ITEMS 讀：名字＋再選一次加的字，例「熱可可（加一份濃縮）」「美式咖啡（冰的）」），對不到就停下來。
  名字後面寫「（便利商店）」＝只算在便利商店買的（2:30 AM 買的不算）。
AA_710 第二版（74aa33345／be775af69，AA-B 05:39、06:02）的欄位：
- yes：每格 pool（兩三組輪流；lines＝pool 第一組，相容第一版）、need（dating 那一格可以沒有）、dating:true（交往中優先）、rel。
- no：兩三組輪流（第一版是一組字串，照樣讀成一組）。
- fav（她最喜歡的；第一次送對記 REMEMBERED_HER）、opinion（她有意見的那一樣）、ctx（again／exam／night／winterCold／summerHot）。
AA_728（955ea3a03，AA-B 11-08 08:24）：
- _meta.itemOnly.list：AA_710 只配某一樣的那幾組（下面 ONLY_ITEM；where 是人寫的位置，對不到、那一組沒提到那一樣就停下來）→ 那幾組加 only（＋hour）。
- _meta.itemOnly.kexinSugar：「青茶（有加糖）」＝青茶只要不是無糖都算 → 那一筆 opinion 加 ns（算數的品項，遊戲裡的微糖）。
- _meta.notes「breakfast＝飯糰、三明治」（6528d7681 起；豆漿、米漿算飲料，照 AA_710 原本的分法）：和 S.ITEMS 的早餐對不上就停下來。
  sec：稿寫在另一種那一格的那一樣，記在她的 sec（對她算那一種）；現在沒有，留著。六位都要有 breakfast（notes 沒有「沒寫 breakfast 的人照 drink」）。
- people：朋友六位（drink.yes／breakfast.yes 輪流、no 一天第二次送同一種）；rel 照 notes「yes 每次 fam+1、comf+1（一天最多算一次）」→ GIFT_LINES.friends。
- 學姊送到第 3 次起「學弟」換成 {name}、子晴「冰你一下」不配熱的：AA_728 沒列，照舊在下面 BOUND（沒對到稿裡的句子就停下來）。
STALE-SOURCES-1112（AA_710 86619c1195，X350「所有飲料店賣的飲料都可以買一份帶走送人」；AA_728 bb3bdad7df）：
- opinion 的品名也可以是「某一間可以買來送人的店菜單上的飲料」（檸檬綠茶、珍珠奶茶、冬瓜茶…；不在 S.ITEMS）：菜單不抄，問 tools/story/gift_shop_menus.js
  （載入各店的資料檔和點餐程式，問 GIFT.menu——和遊戲賣的同一份）。有店讀不到菜單、有檔載不進來＝停下來，不默默放行。
  品名兩邊都對不到的：整份看完，一次列出來再停（交給 AA；不硬匯、不改品名）。
- 「<店名>的茶（任何一樣）」＝在那間店買的任何一樣飲料 → {item, shopAny:店名}（gift3d.js 照 G.carry 記的店名比）。店名要是可以買來送人的店（G.carry 記的名字）；
  下面 SHOP_PENDING 列的是「遊戲裡有這間店、但現在還不能買來送人」的：照匯、印出來提醒（那一格現在送不到），不在表上的店名＝停下來。
- AA_728 people 裡寫 unused 的人（_meta.status：使用者 11-08「送飲料只需要給可攻略的對象」，台詞留在稿當紀錄、不匯入）跳過；有人寫 unused 而 _meta.status 沒有那一句＝停下來。
用法：python3 tools/story/import_gifts.py [--ref <AA_710 commit>] [--ref2 <AA_728 commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_710_gifts.json'
PATH2 = 'docs/story_planning/AA_728_gifts_friends.json'
OUT = 'src/data/gift_lines.js'
GIFT_JS = 'src/gift3d.js'
CHARS_JS = 'src/data/characters.js'
CATS = ('drink', 'breakfast')
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')
CTX = {'drink': ('again', 'exam', 'winterCold', 'summerHot'), 'breakfast': ('again', 'exam', 'night')}   # 晚上＝送早餐；冬冰夏熱＝飲料
SHOP_Q = {'便利商店': '便利商店'}          # 名字後面的（店名）→ gift3d.js 的店名 key（story3d.js counter）
MENUS_JS = 'tools/story/gift_shop_menus.js'
SHOP_ANY = re.compile(r'^(.+)的茶（任何一樣）$')   # 「<店名>的茶（任何一樣）」
PAREN = re.compile(r'^(.*)（([^（）]+)）$')
# 遊戲裡有這間店、但現在不能「買一份帶走送人」的（稿的店名 → 為什麼）。這幾間的 shopAny 照匯（那一格現在送不到，印出來提醒）；
#   哪一天 gift3d.js 的 S.SHOPS 加了這間（記在 G.carry 的 name 要用稿的店名），這裡那一列就可以拿掉。
SHOP_PENDING = {
    '一盞茶屋': '點餐 key「溫州街・一盞」（src/wzshops3d.js S.TEA）：內用的一壺茶（260 元起），沒有外帶的菜單；盤點表 docs/handoff/GIFT_DRINK_SHOPS_AUDIT_1112.md 第 2 節列為不放，AA_710 _meta（X350）寫「一盞…也開」——等 LAWWW、AA 定外帶賣什麼',
}
LATE = 99                                 # hour 的上限（G.hour 過了午夜是 24 以上）

# AA_728 _meta.itemOnly.list 的 item（人寫的字）→ 遊戲的品項：n＝就是這幾樣、base＝這幾個名字的每一種（冰的、熱的…）；
#   kw＝那一組要提到的字（where 寫的是格子：格子裡提到它的那幾組才算；where 寫「句子」那一格的不用）；hour＝幾點以後。
#   清單上出現這裡沒有的寫法 → 停下來（AA 改了清單，要重看）。
ONLY_ITEM = {
    '三明治': {'n': ['三明治'], 'kw': '三明治'},
    '飯糰': {'n': ['飯糰'], 'kw': '飯糰'},
    '美式咖啡（冰）': {'n': ['美式咖啡（冰的）'], 'kw': '美式'},
    '咖啡類（美式、拿鐵），21:00 以後': {'base': ['美式咖啡', '拿鐵'], 'hour': 21},
}


# AA_728 沒列、照舊綁在句子上的：(人物, 種類, 句子裡的字, 條件)。
#   only＝只在送這幾樣的時候：條件不對就跳過那一組（同一格還有別組就用別組；整格都不行＝往下一順位）。
#   swap＝[原本的字, 換成, 送她第幾次起]：學姊（notes「學姊第 1～2 次叫「學弟」，之後 {name}」）——送到第 3 次起那一句的「學弟」換成 {name}，其他字不動。
def BOUND(items):
    cold = sorted(n for n, it in items.items() if it['t'] == 'cold')
    return [
        ('heroine_04', 'drink', '冰你一下', {'only': cold}),
        ('heroine_05', 'drink', '學弟', {'swap': ['學弟', '{name}', 2]}),
        ('heroine_05', 'breakfast', '學弟', {'swap': ['學弟', '{name}', 2]}),
    ]


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def game_items():
    """src/gift3d.js 的 S.ITEMS → {完整品項名: {cat, alt, base, t（cold／hot／None）}}。名字＝n＋再選一次加的字（opt 的第二格）；冷熱＝temp（opt 的第四格蓋過去）。"""
    src = open(os.path.join(ROOT, GIFT_JS), encoding='utf-8').read()
    m = re.search(r'S\.ITEMS=\[(.*?)\];', src, re.S)
    if not m:
        raise SystemExit(f'{GIFT_JS}：找不到 S.ITEMS')
    out = {}
    for o in re.findall(r'\{n:[^{}]*\}', m.group(1)):
        n = re.search(r"n:'([^']+)'", o).group(1)
        cat = re.search(r"cat:'(\w+)'", o).group(1)
        alt = re.search(r"alt:'(\w+)'", o)
        t0 = re.search(r"temp:'(\w+)'", o.split('opt:')[0])
        opts = re.findall(r"\['[^']*','([^']*)'(?:,\d+)?(?:,'(\w+)')?\]", o.split('opt:')[1]) if 'opt:' in o else [('', '')]
        for suf, t in opts:
            out[n + suf] = {'cat': cat, 'alt': alt.group(1) if alt else None, 'base': n, 't': t or (t0.group(1) if t0 else None)}
    if len(out) < 10:
        raise SystemExit(f'{GIFT_JS}：S.ITEMS 只讀到 {len(out)} 樣')
    # AA_772（118 巷九間店改版，L118-SHOPS-REDO-1111）把品項「紅茶拿鐵」換成「鮮奶茶」：遊戲的品項（src/gift3d.js S.ITEMS）已經是新名字，源稿 AA_710／AA_728 還是舊名字——
    # 核對品項的時候把那一樣先叫回舊名字（組好的文字最後由 l118_fix772.layer_js 換成新名字）。放在這裡：匯入、--check、測試用的每一條路都走得到
    import l118_fix772 as _f772
    _d772 = _f772.load(ROOT)
    for _n, _f, _old, _new, _note in (_f772.rows(_d772) if _d772 else []):
        if _f == OUT and _new in out and _old not in out: out[_old] = out.pop(_new)
    return out


def shop_menus():
    """可以買來送人的店 → {G.carry 記的店名: [菜單上的飲料…]}（node tools/story/gift_shop_menus.js）。讀不到的店、載不進來的檔＝停下來。"""
    try:
        raw = subprocess.check_output(['node', os.path.join(ROOT, MENUS_JS)], cwd=ROOT, stderr=subprocess.PIPE).decode('utf-8')
        d = json.loads(raw.strip().splitlines()[-1])
    except Exception as e:   # noqa
        raise SystemExit(f'{MENUS_JS}：跑不起來（{str(e)[:200]}）——各店的菜單讀不到，不能核對品名')
    if d.get('loadErr') or d.get('unreadable'):
        raise SystemExit(f'{MENUS_JS}：有店的菜單讀不到，不能核對品名（不放行）：載不進來的檔 {d.get("loadErr")}；菜單是空的店 {d.get("unreadable")}')
    if len(d.get('shops') or {}) < 15:
        raise SystemExit(f'{MENUS_JS}：只讀到 {len(d.get("shops") or {})} 間店')
    return d['shops']


def char_ids():
    src = open(os.path.join(ROOT, CHARS_JS), encoding='utf-8').read()
    ids = set(re.findall(r"^\s*(\w+):\{ id:'(\w+)'", src, re.M))
    return {a for a, b in ids if a == b}


def sugar_rule(meta2, items):
    """AA_728 _meta.itemOnly.kexinSugar：「X（有加糖）」＝X 只要不是無糖都算 → {'X（有加糖）': [遊戲裡 X 不是無糖的每一種]}"""
    s = ((meta2.get('itemOnly') or {}).get('kexinSugar')) or ''
    m = re.search(r'「([^「」（）]+)（有加糖）」＝\1只要不是無糖都算', s)
    if not m:
        raise SystemExit(f'{PATH2} _meta.itemOnly.kexinSugar：讀不懂「{s}」（要寫「X（有加糖）」＝X只要不是無糖都算；稿改了要重看 import_gifts.py sugar_rule）')
    base = m.group(1)
    every = [n for n, it in items.items() if it['base'] == base]
    ns = [n for n in every if not n.endswith('（無糖）')]
    if not ns or len(ns) == len(every):
        raise SystemExit(f'kexinSugar：遊戲的「{base}」要有無糖和不是無糖的（S.ITEMS：{every}）')
    return {base + '（有加糖）': ns}


def item(v, cat, items, where, sugar, menus=None, miss=None, pend=None):
    """稿的品項字 → {item（稿的寫法）, n（遊戲品項名）, ns?（算數的每一樣）, shop?, sec?（這一樣本來是另一種，稿寫在這一格）}
    menus（各店菜單）有給的時候：S.ITEMS 沒有、但某一間店的菜單上有的飲料 → {item, n}；「<店名>的茶（任何一樣）」→ {item, shopAny}。
    miss 有給＝對不到的不當場停，記進 miss（整份看完一次列）；回傳 None。"""
    if not isinstance(v, str) or not v:
        raise SystemExit(f'{where}.item：要寫品項名')
    q0 = PAREN.match(v)
    known = v in sugar or v in items or bool(q0 and q0.group(2) in SHOP_Q and q0.group(1) in items)   # 原本就認得的寫法：照舊走下面
    if menus is not None and not known:
        m = SHOP_ANY.match(v)
        if m:
            shop = m.group(1)
            if cat != 'drink':
                raise SystemExit(f'{where}.item「{v}」：整間店的寫法只能寫在 drink')
            if shop not in menus:
                if shop not in SHOP_PENDING:
                    msg = f'{where}.item「{v}」：沒有「{shop}」這間可以買來送人的店（{"、".join(menus)}）'
                    if miss is None:
                        raise SystemExit(msg)
                    miss.append(msg)
                    return None
                if pend is not None:
                    pend.append(f'{where}.item「{v}」：{shop} 現在不能買來送人，這一格送不到——{SHOP_PENDING[shop]}')
            return {'item': v, 'shopAny': shop}
        at = [s for s, ns in menus.items() if v in ns]
        if at:
            if cat != 'drink':
                raise SystemExit(f'{where}.item「{v}」：{"、".join(at)}菜單上的飲料，不能寫在 {cat}')
            return {'item': v, 'n': v}
        msg = f'{where}.item「{v}」：遊戲沒有這個品項（src/gift3d.js S.ITEMS：{"、".join(items)}；可以買來送人的 {len(menus)} 間店菜單上也沒有）'
        if miss is None:
            raise SystemExit(msg)
        miss.append(msg)
        return None
    ns = sugar.get(v)
    n, shop = (ns[0] if ns else v), None
    q = re.match(r'^(.*)（([^（）]+)）$', n)
    if n not in items and q and q.group(2) in SHOP_Q:
        n, shop = q.group(1), SHOP_Q[q.group(2)]
    if n not in items:
        raise SystemExit(f'{where}.item「{v}」：遊戲沒有這個品項（src/gift3d.js S.ITEMS：{"、".join(items)}）')
    for x in (ns or [n]):
        if items[x]['cat'] != cat and items[x]['alt'] != cat:
            raise SystemExit(f'{where}.item「{v}」：{x} 是 {items[x]["cat"]}，不是 {cat}')
    e = {'item': v, 'n': n}
    if ns:
        e['ns'] = list(ns)
    if shop:
        e['shop'] = shop
    if items[n]['cat'] != cat:
        e['sec'] = cat
    return e


def lines(v, where):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{where}：要是非空字串的陣列')
    out = [IG.read_fix(t) for t in v]
    for t in out:
        if t.startswith('「') and t.endswith('」'):
            raise SystemExit(f'{where}「{t}」：有名字說的不在外面加「」（TEXT-QUOTE-UNIFY-1108）')
    return out


def groups(v, where):
    """兩三組輪流：[[句子…], [句子…]]；第一版的一組字串 [句子…] 照樣讀成一組。"""
    if isinstance(v, list) and v and all(isinstance(t, str) for t in v):
        v = [v]
    if not isinstance(v, list) or not v:
        raise SystemExit(f'{where}：要是一組以上的句子')
    return [{'lines': lines(g, f'{where}[{i}]')} for i, g in enumerate(v)]


def rel(v, where):
    v = v or {}
    bad = [k for k in v if k not in REL]
    if bad:
        raise SystemExit(f'{where}：rel 不認得的欄位 {bad}')
    return {k: int(x) for k, x in v.items()}


def cell(y, w):
    pool = groups(y.get('pool') or y.get('lines'), f'{w}.pool')
    if y.get('lines') is not None and lines(y['lines'], f'{w}.lines') != pool[0]['lines']:
        raise SystemExit(f'{w}：lines 要等於 pool 第一組（相容舊版）')
    e = {'need': int(y.get('need', 1)), 'pool': pool, 'lines': pool[0]['lines'], 'rel': rel(y.get('rel'), w)}
    if y.get('dating'):
        e['dating'] = True
    return e


def all_groups(P):
    out = []
    for c in CATS:
        E = P.get(c)
        if not E:
            continue
        for y in E['yes']:
            out += y['pool']
        out += E['no']
        for o in E.get('opinion', []):
            out += o['pool']
        for k in E.get('ctx', {}):
            out += E['ctx'][k]
    return out


def put(g, cond, where):
    for k, x in cond.items():
        if k in g and g[k] != x:
            raise SystemExit(f'{where}：「{g["lines"][0]}」那一組已經有 {k}={g[k]}，又要設成 {x}')
        g[k] = x


def item_only(meta2, people, src_cells, items):
    """AA_728 _meta.itemOnly.list → 那幾組加 only（＋hour）。回傳 [(人物, where, 幾組)]（印出來核對）。"""
    io = meta2.get('itemOnly')
    if not isinstance(io, dict) or not isinstance(io.get('list'), list) or not io['list']:
        raise SystemExit(f'{PATH2} _meta.itemOnly.list：沒有清單')
    done = []
    for i, e in enumerate(io['list']):
        who, where, what = e.get('who'), e.get('where'), e.get('item')
        w = f'{PATH2} _meta.itemOnly.list[{i}]（{who}「{where}」「{what}」）'
        if who not in people:
            raise SystemExit(f'{w}：AA_710 沒有 {who}')
        spec = ONLY_ITEM.get(what)
        if not spec:
            raise SystemExit(f'{w}：item 的寫法 tools/story/import_gifts.py ONLY_ITEM 沒有（清單改了，要重看）')
        only = list(spec.get('n') or [])
        for b in spec.get('base') or []:
            vs = [n for n, it in items.items() if it['base'] == b]
            if not vs:
                raise SystemExit(f'{w}：遊戲沒有「{b}」')
            only += vs
        bad = [n for n in only if n not in items]
        if bad or not only:
            raise SystemExit(f'{w}：遊戲沒有 {bad}')
        cond = {'only': only}
        if spec.get('hour') is not None:
            cond['hour'] = [spec['hour'], LATE]
        P = people[who]
        m = re.fullmatch(r'「(.+)」那一格', where or '')
        if m:   # 寫句子的：整份找有這一句的那一組（只能一組）
            s = IG.read_fix(m.group(1))
            hit = [g for g in all_groups(P) if s in g['lines']]
            if len(hit) != 1:
                raise SystemExit(f'{w}：AA_710 {who} 有這一句的組有 {len(hit)} 組（要剛好 1 組；稿改了要重看）')
            put(hit[0], cond, w)
            done.append((who, where, 1))
            continue
        if not spec.get('kw'):
            raise SystemExit(f'{w}：寫格子的要有 kw（那一組要提到的字）')
        n = 0
        for part in re.split(r'[、,，]', where or ''):
            mm = re.fullmatch(r'(drink|breakfast)\.(?:yes\[(\d+)\]|ctx\.(\w+))', part.strip())
            if not mm:
                raise SystemExit(f'{w}：讀不懂位置「{part}」（要寫 drink／breakfast.yes[第幾格] 或 .ctx.情境）')
            c = mm.group(1)
            if c not in P:
                raise SystemExit(f'{w}：{who} 沒有 {c}')
            if mm.group(2) is not None:
                k = int(mm.group(2))
                if k >= len(src_cells[who][c]):
                    raise SystemExit(f'{w}：{who}.{c}.yes 只有 {len(src_cells[who][c])} 格')
                gs = src_cells[who][c][k]['pool']
            else:
                gs = P[c].get('ctx', {}).get(mm.group(3))
                if not gs:
                    raise SystemExit(f'{w}：{who}.{c} 沒有 ctx.{mm.group(3)}')
            hit = [g for g in gs if any(spec['kw'] in t for t in g['lines'])]
            if not hit:
                raise SystemExit(f'{w}：{who}.{part} 沒有提到「{spec["kw"]}」的那一組（稿改了要重看）')
            for g in hit:
                put(g, cond, w)
            n += len(hit)
        done.append((who, where, n))
    return done


def build(src, sha, items, meta2, menus=None, pend=None):
    sugar = sugar_rule(meta2, items)
    miss = [] if menus is not None else None
    people, src_cells = {}, {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        P, SC, sec = {}, {}, {}
        for c in CATS:
            if c not in v:
                continue
            s, w = v[c], f'{hid}.{c}'
            yes = [cell(y, f'{w}.yes[{i}]') for i, y in enumerate(s.get('yes') or [])]
            SC[c] = list(yes)   # 稿的順序（itemOnly 的 yes[第幾格] 照這個數）
            norm = sorted([y for y in yes if not y.get('dating')], key=lambda y: y['need'])
            yes = norm + [y for y in yes if y.get('dating')]   # 階段那幾格照 need 排，交往中那一格放最後（gift3d.js 交往中先挑它）
            if not norm or norm[0]['need'] > 1:
                raise SystemExit(f'{w}.yes：至少要有一格 need 1（不是 dating）')
            e = {'yes': yes, 'no': groups(s.get('no'), f'{w}.no')}
            named = []
            if s.get('fav'):
                f = s['fav']
                e['fav'] = dict(item(f.get('item'), c, items, f'{w}.fav', sugar), lines=lines(f.get('lines'), f'{w}.fav'), rel=rel(f.get('rel'), f'{w}.fav'))
                named.append(e['fav'])
            if s.get('opinion'):
                op = []
                for i, o in enumerate(s['opinion']):
                    ww = f'{w}.opinion[{i}]'
                    it = item(o.get('item'), c, items, ww, sugar, menus, miss, pend)
                    if it is None:
                        continue
                    op.append(dict(it, pool=groups(o.get('pool') or o.get('lines'), ww), rel=rel(o.get('rel'), ww)))
                e['opinion'] = op
                named += op
            for x in named:   # 本來是另一種、稿寫在這一格的（以安的豆漿、沛珊的米漿寫在飲料）：對她算這一種
                if x.pop('sec', None):
                    for n in x.get('ns') or [x['n']]:
                        if sec.get(n, c) != c:
                            raise SystemExit(f'{hid}：{n} 同時寫在 {sec[n]} 和 {c}')
                        sec[n] = c
            if s.get('ctx'):
                bad = [k for k in s['ctx'] if k not in CTX[c]]
                if bad:
                    raise SystemExit(f'{w}.ctx：{c} 不認得 {bad}（{c} 只有 {"、".join(CTX[c])}）')
                e['ctx'] = {k: groups(s['ctx'][k], f'{w}.ctx.{k}') for k in CTX[c] if k in s['ctx']}
            P[c] = e
        if not P:
            raise SystemExit(f'{hid}：沒有 drink／breakfast')
        for c in CATS:   # 同一格同一樣寫兩次＝後面那一筆永遠輪不到
            seen = [(x.get('n'), x.get('shop'), x.get('shopAny')) for x in P.get(c, {}).get('opinion', [])]
            dup = sorted({str(k) for k in seen if seen.count(k) > 1})
            if dup:
                raise SystemExit(f'{hid}.{c}.opinion：同一樣寫了兩次 {dup}')
        for n, c in sec.items():
            nat = items[n]['cat']
            if any(x.get('n') == n or n in (x.get('ns') or []) for x in ([P.get(nat, {}).get('fav')] + P.get(nat, {}).get('opinion', [])) if x):
                raise SystemExit(f'{hid}：{n} 同時寫在 {c} 和 {nat}')
        if sec:
            P['sec'] = dict(sorted(sec.items()))
        people[hid] = P
        src_cells[hid] = SC
    if miss:
        raise SystemExit(f'{PATH}@{sha}：有 {len(miss)} 個品名對不到遊戲賣的東西（交給 AA；不硬匯、不改品名）：\n  ' + '\n  '.join(miss))
    only_done = item_only(meta2, people, src_cells, items)
    # AA_728 沒列的（學姊「學弟」、子晴「冰你一下」）：加條件；稿裡找不到那句就停下來（稿改了，要重看 BOUND）
    for hid, c, word, cond in BOUND(items):
        E = people.get(hid, {})
        gs = all_groups({c: E[c]}) if c in E else []
        hit = [g for g in gs if any(word in t for t in g['lines'])]
        if not hit:
            raise SystemExit(f'BOUND：{hid}.{c} 找不到「{word}」那一句（稿改了：重看 tools/story/import_gifts.py BOUND）')
        for g in hit:
            if 'only' in cond:
                bad = [n for n in cond['only'] if n not in items]
                if bad:
                    raise SystemExit(f'BOUND：{hid}.{c}「{word}」only 有遊戲沒有的品項 {bad}')
            put(g, cond, f'BOUND {hid}.{c}「{word}」')
    return {'src': f'{PATH}@{sha}', 'people': people}, only_done


def build_friends(src, sha, items, skipped=None):
    """AA_728 people → {src, rel, people:{id:{drink:{pool}, breakfast?:{pool}, no:[組]}}}"""
    meta = src.get('_meta')
    if not isinstance(meta, dict):
        raise SystemExit(f'{PATH2}：沒有 _meta')
    notes = '\n'.join(meta.get('notes') or [])
    m = re.search(r'yes 每次 fam\+(\d+)、comf\+(\d+)（一天最多算一次）', notes)
    if not m or 'no 不加不扣' not in notes or '朋友沒有 npcRom' not in notes:
        raise SystemExit(f'{PATH2} _meta.notes：讀不到「rel：yes 每次 fam+1、comf+1（一天最多算一次）；no 不加不扣。朋友沒有 npcRom。」（稿改了要重看 build_friends）')
    R = {'fam': int(m.group(1)), 'comf': int(m.group(2))}
    m = re.search(r'breakfast＝([^；。]+)', notes)
    if not m:
        raise SystemExit(f'{PATH2} _meta.notes：讀不到「breakfast＝…」')
    FALLBACK = '沒寫 breakfast 的人照 drink' in notes   # 6528d7681 起六位都有 breakfast，這一句拿掉了：沒寫的就停下來
    bf = set(m.group(1).split('、'))
    game_bf = {it['base'] for it in items.values() if it['cat'] == 'breakfast'}
    if bf != game_bf:
        raise SystemExit(f'{PATH2}「breakfast＝{m.group(1)}」和 src/gift3d.js S.ITEMS 的早餐（{"、".join(sorted(game_bf))}）不一樣')
    ids = char_ids()
    people = src.get('people')
    if not isinstance(people, dict) or not people:
        raise SystemExit(f'{PATH2}：沒有 people')
    out = {}
    unused = [pid for pid, v in people.items() if isinstance(v, dict) and 'unused' in v]
    if unused and not re.search(r'不用[^；。]*（台詞留在這份當紀錄，不匯入）', meta.get('status') or ''):
        raise SystemExit(f'{PATH2}：{unused} 寫了 unused，但 _meta.status 沒有「…不用（台詞留在這份當紀錄，不匯入）」（稿改了要重看 build_friends）')
    for pid, v in people.items():
        w = f'{PATH2} people.{pid}'
        if pid in unused:   # 使用者 11-08「送飲料只需要給可攻略的對象」：台詞留在稿當紀錄，不匯入
            if pid not in ids:
                raise SystemExit(f'{w}：{CHARS_JS} 沒有這個人')
            if skipped is not None:
                skipped.append(pid)
            continue
        if pid not in ids:
            raise SystemExit(f'{w}：{CHARS_JS} 沒有這個人')
        bad = [k for k in v if k not in CATS + ('no',)]
        if bad:
            raise SystemExit(f'{w}：不認得的欄位 {bad}')
        P = {}
        for c in CATS:
            if c not in v:
                continue
            bad = [k for k in v[c] if k != 'yes']
            if bad:
                raise SystemExit(f'{w}.{c}：朋友只有 yes（不認得 {bad}）')
            P[c] = {'pool': groups(v[c].get('yes'), f'{w}.{c}.yes')}
        if 'drink' not in P:
            raise SystemExit(f'{w}：沒有 drink')
        if 'breakfast' not in P and not FALLBACK:
            raise SystemExit(f'{w}：沒有 breakfast（notes 沒寫「沒寫 breakfast 的人照 drink」）')
        P['no'] = groups(v.get('no'), f'{w}.no')
        out[pid] = P
    if not out:
        raise SystemExit(f'{PATH2}：people 每一位都是 unused，沒有人可以匯')
    return {'src': f'{PATH2}@{sha}', 'rel': R, 'people': out}


def src_sha(allow, path, ref):
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{path}：不在匯入白名單')
    sha = ref or hits[-1]['sha']
    ok, why = IG.allowed(path, sha, allow)
    if not ok:
        raise SystemExit(why)
    return sha, why


def main():
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else None
    ref2 = sys.argv[sys.argv.index('--ref2') + 1] if '--ref2' in sys.argv else None
    allow = IG.load(ROOT)
    sha, why = src_sha(allow, PATH, ref)
    sha2, why2 = src_sha(allow, PATH2, ref2)
    items = game_items()
    s2 = json.loads(git('show', f'{sha2}:{PATH2}'))
    menus, pend, skipped = shop_menus(), [], []
    data, only_done = build(json.loads(git('show', f'{sha}:{PATH}')), sha, items, s2.get('_meta') or {}, menus, pend)
    data['friends'] = build_friends(s2, sha2, items, skipped)
    # AA_766（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫；白名單上的 commit）：沛珊最愛的米漿第二句（原本講她家早餐店）照稿換——AA_710 的源稿沒改，組好資料以後疊（tools/story/ps766.py；白名單沒有＝不疊）
    import ps766
    n766 = ps766.apply_gift(data, ROOT, allow); t766 = ps766.tag(ROOT, allow)
    js = ('/* 自動產生：tools/story/import_gifts.py（' + data['src'] + '、' + data['friends']['src'] + '）。不要手改，改企劃 AA_710／AA_728 再重新匯入。\n'
          + (f'   沛珊最愛的米漿第二句照 {t766}（X327；tools/story/ps766.py 疊的）。\n' if t766 else '') +
          '   送早餐、飲料（GIFT-FLIRT-1107；播放 src/gift3d.js）：people＝七位女主角（AA_710）、friends＝朋友（AA_728；稿寫 unused 的不匯入）*/\n'
          "'use strict';\nconst GIFT_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    import l118_fix772   # 2026-11-11（L118-SHOPS-REDO-1111，使用者 X338：118 巷九間店改版）：AA_772 給這個檔的幾列 old→new 疊在組好的文字上（tools/story/l118_fix772.py；白名單沒有那份稿＝不疊）
    js = l118_fix772.layer_js(OUT, js, ROOT, allow)
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]}、{data["friends"]["src"]} 不一樣：重新匯入')
        print('OK', why, why2)
        for t in pend:
            print(' [提醒] ' + t)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, why2)
    print(' 女主角：', {k: sorted(v) for k, v in data['people'].items()})
    print(' itemOnly：', only_done)
    print(' 朋友：', {k: sorted(v) for k, v in data['friends']['people'].items()})
    print(' 朋友（稿寫 unused，不匯入）：', skipped)
    ops = [(h, o) for h, P in data['people'].items() for o in P.get('drink', {}).get('opinion', [])]
    print(' 照各店菜單對到的品名：', [(h, o['item'], [s for s, ns in menus.items() if o['n'] in ns]) for h, o in ops if not o.get('shopAny') and o.get('n') not in items])
    print(' 照店（任何一樣）：', [(h, o['item'], o['shopAny']) for h, o in ops if o.get('shopAny')])
    for t in pend:
        print(' [提醒] ' + t)


if __name__ == '__main__':
    main()
