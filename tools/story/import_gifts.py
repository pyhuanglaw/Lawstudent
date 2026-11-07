#!/usr/bin/env python3
"""送早餐、飲料（GIFT-FLIRT-1107；使用者 11-07「買飲料 早餐 給別人」「也沒辦法送早餐飲料?」）。
企劃 AA_710（docs/story_planning/AA_710_gifts.json，企劃線）→ src/data/gift_lines.js（GIFT_LINES）。播放 src/gift3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix。
- 品項（fav.item、opinion[].item）要對得到 src/gift3d.js 賣的品項（從 S.ITEMS 讀：名字＋再選一次加的字，例「熱可可（加一份濃縮）」「美式咖啡（冰的）」），對不到就停下來。
  名字後面寫「（便利商店）」＝只算在便利商店買的（2:30 AM 買的不算）；「青茶（有加糖）」＝青茶選微糖（遊戲裡的名字就是「青茶」，LAWWW-B 11-07）。
第二版（AA_710 74aa33345，AA-B 05:39）的欄位：
- yes：每格 pool（兩三組輪流；lines＝pool 第一組，相容第一版）、need（dating 那一格可以沒有）、dating:true（交往中優先）、rel。
- no：兩三組輪流（第一版是一組字串，照樣讀成一組）。
- fav（她最喜歡的；第一次送對記 REMEMBERED_HER）、opinion（她有意見的那一樣）、ctx（again／exam／night／winterCold／summerHot）。
- 有幾句講到特定的品項、時間、稱呼（例：子晴「又是冰美式」），只在對得上的時候播：見下面 BOUND（沒對到稿裡的句子就停下來，代表稿改了要重看）。
用法：python3 tools/story/import_gifts.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_710_gifts.json'
OUT = 'src/data/gift_lines.js'
GIFT_JS = 'src/gift3d.js'
CATS = ('drink', 'breakfast')
REL = ('fam', 'trust', 'comf', 'npcRom', 'rom')
CTX = {'drink': ('again', 'exam', 'winterCold', 'summerHot'), 'breakfast': ('again', 'exam', 'night')}   # 晚上＝送早餐；冬冰夏熱＝飲料
SHOP_Q = {'便利商店': '便利商店'}          # 名字後面的（店名）→ gift3d.js 的店名 key（story3d.js counter）
ALIAS = {'青茶（有加糖）': '青茶'}         # 稿的寫法 → 遊戲的品項名（LAWWW-B 11-07：「有加糖的青茶」＝青茶選微糖）

# 講到特定品項／時間／稱呼的句子：(人物, 種類, 句子裡的字, 條件)。
#   only＝只在送這幾樣的時候、hour＝[幾點, 幾點)：條件不對就跳過那一組（同一格還有別組就用別組；整格都不行＝往下一順位）。
#   swap＝[原本的字, 換成, 送她第幾次起]：學姊（notes「學姊第 1～2 次叫「學弟」，之後 {name}」）——送到第 3 次起那一句的「學弟」換成 {name}，其他字不動。
def BOUND(items):
    cold = sorted(n for n, it in items.items() if it['t'] == 'cold')
    sugar_free = ['無糖綠茶', '無糖綠茶（去冰）', '青茶（無糖）', '美式咖啡', '美式咖啡（冰的）']
    return [
        ('heroine_01', 'breakfast', '三明治分成兩半', {'only': ['三明治']}),
        ('heroine_01', 'breakfast', '現在是晚上九點', {'hour': [21, 22]}),
        ('heroine_03', 'breakfast', '這個飯糰', {'only': ['飯糰']}),
        ('heroine_03', 'drink', '記得我不加糖', {'only': sugar_free}),
        ('heroine_04', 'breakfast', '把飯糰吃完', {'only': ['飯糰']}),
        ('heroine_04', 'drink', '冰你一下', {'only': cold}),
        ('heroine_04', 'drink', '冰美式', {'only': ['美式咖啡（冰的）']}),
        ('heroine_05', 'drink', '學弟', {'swap': ['學弟', '{name}', 2]}),
        ('heroine_05', 'breakfast', '學弟', {'swap': ['學弟', '{name}', 2]}),
    ]


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def game_items():
    """src/gift3d.js 的 S.ITEMS → {完整品項名: {cat, t（cold／hot／None）}}。名字＝n＋再選一次加的字（opt 的第二格）；冷熱＝temp（opt 的第四格蓋過去）。"""
    src = open(os.path.join(ROOT, GIFT_JS), encoding='utf-8').read()
    m = re.search(r'S\.ITEMS=\[(.*?)\];', src, re.S)
    if not m:
        raise SystemExit(f'{GIFT_JS}：找不到 S.ITEMS')
    out = {}
    for o in re.findall(r'\{n:[^{}]*\}', m.group(1)):
        n = re.search(r"n:'([^']+)'", o).group(1)
        cat = re.search(r"cat:'(\w+)'", o).group(1)
        t0 = re.search(r"temp:'(\w+)'", o.split('opt:')[0])
        opts = re.findall(r"\['[^']*','([^']*)'(?:,\d+)?(?:,'(\w+)')?\]", o.split('opt:')[1]) if 'opt:' in o else [('', '')]
        for suf, t in opts:
            out[n + suf] = {'cat': cat, 't': t or (t0.group(1) if t0 else None)}
    if len(out) < 10:
        raise SystemExit(f'{GIFT_JS}：S.ITEMS 只讀到 {len(out)} 樣')
    return out


def item(v, cat, items, where):
    """稿的品項字 → {item（稿的寫法）, n（遊戲品項名）, shop?}"""
    if not isinstance(v, str) or not v:
        raise SystemExit(f'{where}.item：要寫品項名')
    n, shop = ALIAS.get(v, v), None
    q = re.match(r'^(.*)（([^（）]+)）$', n)
    if n not in items and q and q.group(2) in SHOP_Q:
        n, shop = q.group(1), SHOP_Q[q.group(2)]
    if n not in items:
        raise SystemExit(f'{where}.item「{v}」：遊戲沒有這個品項（src/gift3d.js S.ITEMS：{"、".join(items)}）')
    if items[n]['cat'] != cat:
        raise SystemExit(f'{where}.item「{v}」：是 {items[n]["cat"]}，不是 {cat}')
    e = {'item': v, 'n': n}
    if shop:
        e['shop'] = shop
    return e


def lines(v, where):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{where}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


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


def build(src, sha, items):
    people = {}
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        P = {}
        for c in CATS:
            if c not in v:
                continue
            s, w = v[c], f'{hid}.{c}'
            yes = [cell(y, f'{w}.yes[{i}]') for i, y in enumerate(s.get('yes') or [])]
            norm = sorted([y for y in yes if not y.get('dating')], key=lambda y: y['need'])
            yes = norm + [y for y in yes if y.get('dating')]   # 階段那幾格照 need 排，交往中那一格放最後（gift3d.js 交往中先挑它）
            if not norm or norm[0]['need'] > 1:
                raise SystemExit(f'{w}.yes：至少要有一格 need 1（不是 dating）')
            e = {'yes': yes, 'no': groups(s.get('no'), f'{w}.no')}
            if s.get('fav'):
                f = s['fav']
                e['fav'] = dict(item(f.get('item'), c, items, f'{w}.fav'), lines=lines(f.get('lines'), f'{w}.fav'), rel=rel(f.get('rel'), f'{w}.fav'))
            if s.get('opinion'):
                op = []
                for i, o in enumerate(s['opinion']):
                    ww = f'{w}.opinion[{i}]'
                    op.append(dict(item(o.get('item'), c, items, ww), pool=groups(o.get('pool') or o.get('lines'), ww), rel=rel(o.get('rel'), ww)))
                e['opinion'] = op
            if s.get('ctx'):
                bad = [k for k in s['ctx'] if k not in CTX[c]]
                if bad:
                    raise SystemExit(f'{w}.ctx：{c} 不認得 {bad}（{c} 只有 {"、".join(CTX[c])}）')
                e['ctx'] = {k: groups(s['ctx'][k], f'{w}.ctx.{k}') for k in CTX[c] if k in s['ctx']}
            P[c] = e
        if not P:
            raise SystemExit(f'{hid}：沒有 drink／breakfast')
        people[hid] = P
    # 講到特定品項／時間／稱呼的句子：加條件；稿裡找不到那句就停下來（稿改了，要重看 BOUND）
    for hid, c, word, cond in BOUND(items):
        E = people.get(hid, {}).get(c)
        gs = []
        if E:
            for y in E['yes']:
                gs += y['pool']
            gs += E['no']
            for o in E.get('opinion', []):
                gs += o['pool']
            for k in E.get('ctx', {}):
                gs += E['ctx'][k]
        hit = [g for g in gs if any(word in t for t in g['lines'])]
        if not hit:
            raise SystemExit(f'BOUND：{hid}.{c} 找不到「{word}」那一句（稿改了：重看 tools/story/import_gifts.py BOUND）')
        for g in hit:
            for k, x in cond.items():
                if k == 'only':
                    bad = [n for n in x if n not in items]
                    if bad:
                        raise SystemExit(f'BOUND：{hid}.{c}「{word}」only 有遊戲沒有的品項 {bad}')
                g[k] = x
    return {'src': f'{PATH}@{sha}', 'people': people}


def main():
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else None
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = ref or hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = build(json.loads(git('show', f'{sha}:{PATH}')), sha, game_items())
    js = ('/* 自動產生：tools/story/import_gifts.py（' + data['src'] + '）。不要手改，改企劃 AA_710 再重新匯入。\n'
          '   送早餐、飲料（GIFT-FLIRT-1107；播放 src/gift3d.js）*/\n'
          "'use strict';\nconst GIFT_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: sorted(v) for k, v in data['people'].items()})


if __name__ == '__main__':
    main()
