#!/usr/bin/env python3
"""EAT-EFFECT-1020（最後一項：宵夜滷味攤的點餐；USER_WANTS X67）：把 AA 的滷味攤稿匯進 src/data/luwei_stall.js（LUWEI_STALL）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_841_luwei_stall.json
- menu：[[夾法, 價錢]…]（四種）
- spice：ask（老闆問的一句）、options（三種辣度）、note（熟客句照辣度換、回話）
- lines：greet、take、wait、done、no_money、not_open、closed、typhoon
- half_price：when（幾點到幾點、半價以後各是多少）、line（接在 greet 後面的一句）、why
- _meta：name（招牌寫什麼）、who（誰顧攤）、hours（每天幾點到幾點、颱風天）；after、rules 照抄（紀錄）
- lawww_1112（AA-C 11-12 回 LAWWW 合併後的五問，企劃線 44ed07c50、33e952215 更正 d）：b_after（吃完的旁白：第一次現有那句、之後輪流兩句）、c、d（熟客句誰說、回話誰說）、e（白天不放按鈕不擺攤；not_open 只留給 17:00～18:00）

**夾法、價錢、台詞一字照稿**（只過 import_guard.read_fix 的換名；這份稿目前一個字都不會被換，換到了會印出來）。
這支工具另外算幾樣給程式用的（從稿上的字讀出來，不是另外定的）：
- sign＝招牌上的字（_meta.name 第一個「」裡的字）
- open＝{from, to}（鐘點，從 _meta.hours「每天 18:00～24:00」讀）；typhoonOff（_meta.hours 有「颱風天不出攤」）
- half＝{from, to, prices[]}（從 half_price.when「22:00～24:00 全部半價（四捨五入到 5 元：30／45／60／25）」讀；prices 和「原價的一半四捨五入到 5 元」對過，不一樣＝停）
- spice.regular＝{辣度: 熟客句}、spice.reply（從 spice.note 的「」讀：「不要辣＝…「一樣不要辣？」」「小辣＝「一樣小辣？」」…「回話都是現有的「好。一樣。」」）
- afterNext＝[兩句]（lawww_1112.b_after「之後輪流兩句——」後面的「」；第一次照舊是 eat_lines.js 現有那句，不在這裡）
- spice.regularBy＝'keeper'、spice.replyBy＝'keeper'（lawww_1112.d，企劃線 33e952215 更正：「熟客句「…」和「…」都是老闆說的」，引的兩句要和上面讀到的一樣；44ed07c50 那一版寫「祐廷回的」，AA 更正了）
- prep＝{from, to}（lawww_1112.e「not_open 那句只留給 17:00～18:00 攤子在擺、還沒開賣的時候」；to 要等於開賣時間）、dayButton＝False（e「白天人行道上不放按鈕、也不擺攤」）
稿上有工具不認得的欄位、寫法換了＝停下來（先改這支工具和 src/luwei3d.js），不會默默丟掉。

怎麼演：src/luwei3d.js。測試 tests/luwei_stall_unit.js。

用法：python3 tools/story/import_luwei_stall.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_841_luwei_stall.json'
OUT = 'src/data/luwei_stall.js'
LINE_KEYS = ['greet', 'take', 'wait', 'done', 'no_money', 'not_open', 'closed', 'typhoon']
CHANGED = []


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_luwei_stall：' + m)


def txt(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def clock(s, where):
    m = re.fullmatch(r'(\d{1,2}):(\d{2})', s)
    if not m or int(m.group(1)) > 24 or int(m.group(2)) > 59:
        die(f'{where}：不認得的時間（{s}）')
    return round(int(m.group(1)) + int(m.group(2)) / 60, 4)


def span(a, b, where):
    a, b = clock(a, where), clock(b, where)
    if b <= a:
        die(f'{where}：結束比開始早；跨午夜的寫法這支工具還不認得')
    return {'from': a, 'to': b}


def half5(p):
    """原價的一半，四捨五入到 5 元（22.5 → 25）"""
    return int((p / 2) / 5 + 0.5) * 5


def build(d):
    if set(d) != {'_meta', 'menu', 'spice', 'lines', 'after', 'rules', 'half_price', 'lawww_1112'}:
        die(f'最上層的欄位改了（{sorted(d)}）')
    M = d['_meta']
    if set(M) != {'doc', 'by', 'checked', 'name', 'who', 'hours', 'status'}:
        die(f'_meta 的欄位改了（{sorted(M)}）')
    m = re.search(r'「([^「」]+)」', M['name'])
    if not m:
        die('_meta.name：找不到招牌上的字（「」）')
    sign = txt(m.group(1), '_meta.name')
    who = txt(M['who'], '_meta.who')
    m = re.match(r'每天 (\d{1,2}:\d{2})～(\d{1,2}:\d{2})；', M['hours'])
    if not m:
        die(f'_meta.hours：不認得的營業時間（{M["hours"]}）')
    op = span(m.group(1), m.group(2), '_meta.hours')
    typhoon_off = '颱風天不出攤' in M['hours']
    # 夾法
    menu = []
    if not isinstance(d['menu'], list) or not d['menu']:
        die('menu：至少一種')
    for i, it in enumerate(d['menu']):
        if not isinstance(it, list) or len(it) != 2 or not isinstance(it[1], int) or isinstance(it[1], bool) or it[1] <= 0:
            die(f'menu[{i}]：要是 [夾法, 正整數價錢]')
        menu.append({'name': txt(it[0], f'menu[{i}]'), 'price': it[1]})
    if len({x['name'] for x in menu}) != len(menu):
        die('menu：夾法重複')
    # 半價
    H = d['half_price']
    if set(H) != {'when', 'line', 'why'}:
        die(f'half_price 的欄位改了（{sorted(H)}）')
    m = re.fullmatch(r'(\d{1,2}:\d{2})～(\d{1,2}:\d{2}) 全部半價（四捨五入到 5 元：([\d／]+)）', H['when'])
    if not m:
        die(f'half_price.when：不認得的寫法（{H["when"]}）')
    hs = span(m.group(1), m.group(2), 'half_price.when')
    hp = [int(x) for x in m.group(3).split('／')]
    if hp != [half5(x['price']) for x in menu]:
        die(f'half_price.when 的價錢 {hp} 和「原價的一半四捨五入到 5 元」{[half5(x["price"]) for x in menu]} 不一樣：問 AA')
    if hs['from'] < op['from'] or hs['to'] > op['to']:
        die('half_price.when：半價的時間不在營業時間裡')
    for x, p in zip(menu, hp):
        x['half'] = p
    # 辣度
    S = d['spice']
    if set(S) != {'ask', 'options', 'note'}:
        die(f'spice 的欄位改了（{sorted(S)}）')
    if not isinstance(S['options'], list) or len(S['options']) < 2:
        die('spice.options：至少兩種')
    opts = [txt(x, f'spice.options[{i}]') for i, x in enumerate(S['options'])]
    reg = {}
    for o in opts:
        m = re.search(re.escape(o) + r'＝[^「；。]*「([^「」]+)」', S['note'])
        if not m:
            die(f'spice.note：找不到「{o}」的熟客句')
        reg[o] = txt(m.group(1), f'spice.note（{o}）')
    m = re.search(r'回話都是[^「。]*「([^「」]+)」', S['note'])
    if not m:
        die('spice.note：找不到回話')
    reply = txt(m.group(1), 'spice.note（回話）')
    if '記住上一次選的' not in S['note']:
        die('spice.note：原本寫「記住上一次選的」，寫法換了，先改這支工具')
    # 台詞
    L = d['lines']
    if set(L) != set(LINE_KEYS):
        die(f'lines 的欄位改了（{sorted(L)}）')
    lines = {k: txt(L[k], 'lines.' + k) for k in LINE_KEYS}
    if not isinstance(d['rules'], list):
        die('rules 要是陣列')
    # AA 回 LAWWW 的五問（lawww_1112）
    W = d['lawww_1112']
    if set(W) != {'b_after', 'c', 'd', 'e'}:
        die(f'lawww_1112 的欄位改了（{sorted(W)}）')
    m = re.fullmatch(r'吃完的旁白：第一次用現有那句（[^（）]*）；之後輪流兩句——「([^「」]+)」「([^「」]+)」', W['b_after'])
    if not m:
        die(f'lawww_1112.b_after：不認得的寫法（{W["b_after"]}）')
    after_next = [txt(m.group(1), 'lawww_1112.b_after[0]'), txt(m.group(2), 'lawww_1112.b_after[1]')]
    m = re.search(r'熟客句「([^「」]+)」和「([^「」]+)」都是老闆說的', W['d'])   # 33e952215 AA 更正：兩句都是老闆說的（44ed07c50 寫「是祐廷回的」，AA 自己說錯了）
    if not m:
        die(f'lawww_1112.d：找不到「熟客句「…」和「…」都是老闆說的」（{W["d"]}）')
    if m.group(1) not in reg.values() or m.group(2) != reply:
        die(f'lawww_1112.d 引的兩句（{m.group(1)}／{m.group(2)}）和 spice.note 的熟客句、回話對不上')
    if '白天人行道上不放按鈕、也不擺攤' not in W['e']:
        die(f'lawww_1112.e：原本寫「白天人行道上不放按鈕、也不擺攤」，寫法換了，先改這支工具（{W["e"]}）')
    m = re.search(r'not_open 那句只留給 (\d{1,2}:\d{2})～(\d{1,2}:\d{2}) 攤子在擺、還沒開賣的時候', W['e'])
    if not m:
        die(f'lawww_1112.e：找不到 not_open 留給幾點到幾點（{W["e"]}）')
    prep = span(m.group(1), m.group(2), 'lawww_1112.e')
    if prep['to'] != op['from']:
        die(f'lawww_1112.e：攤子在擺的那一段（到 {prep["to"]}）沒有接到開賣時間（{op["from"]}）')
    return {'sign': sign, 'who': who, 'hours': M['hours'], 'open': op, 'prep': prep, 'dayButton': False, 'typhoonOff': typhoon_off,
            'menu': menu,
            'half': {'from': hs['from'], 'to': hs['to'], 'line': txt(H['line'], 'half_price.line'), 'when': H['when'], 'why': H['why']},
            'spice': {'ask': txt(S['ask'], 'spice.ask'), 'options': opts, 'regular': reg, 'regularBy': 'keeper', 'reply': reply, 'replyBy': 'keeper', 'note': S['note']},
            'lines': lines, 'after': d['after'], 'afterNext': after_next, 'rules': d['rules'], 'lawww_1112': W, 'status': M['status']}


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        die(f'{PATH}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        die(why)
    data = {'src': f'{PATH}@{sha}'}
    data.update(build(json.loads(git('show', f'{sha}:{PATH}'))))
    js = ('/* 自動產生：tools/story/import_luwei_stall.py（' + data['src'] + '）。不要手改，改企劃稿再重新匯入。\n'
          '   公館宵夜滷味攤的點餐（EAT-EFFECT-1020，使用者 X67）：夾法、價錢、台詞一字照 AA_841；sign、open、prep、dayButton、typhoonOff、half（幾點到幾點、半價）、spice.regular／reply／regularBy／replyBy、afterNext 是從稿上的字讀出來的。\n'
          '   怎麼演：src/luwei3d.js */\n'
          "'use strict';\nconst LUWEI_STALL=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, f'夾法 {len(data["menu"])}、辣度 {len(data["spice"]["options"])}、台詞 {len(data["lines"])}＋半價 1；'
          f'吃完輪流的旁白 {len(data["afterNext"])}；擺攤 {data["prep"]["from"]}～{data["prep"]["to"]}、營業 {data["open"]["from"]}～{data["open"]["to"]}、半價 {data["half"]["from"]}～{data["half"]["to"]}；{why}')
    for c in CHANGED:
        print('  換名（import_guard.read_fix）', c)


if __name__ == '__main__':
    main()
