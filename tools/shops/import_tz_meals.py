#!/usr/bin/env python3
"""TINGZHOU-SHOPS5-1110：汀州路的小館（越好吃小館 tz_yuehaochi、客居雲南 tz_keju）的店內文字，
從 AA 的稿（一間一份 JSON）匯進 src/data/tz_meal_lines.js（TZ_MEAL_LINES）。流程在 src/gg3shops3d.js（和泰米村食同一套），這支只搬字。

和 tools/shops/import_gg3_shops.py 同一個做法：來源照 docs/handoff/story_import_allow.json 的 sha（import_guard 擋）、字一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）、
稿的結構和這支認得的不一樣（多了不認得的欄位、少了欄位、型別不對）＝停下來，不會默默丟掉。

**加一間店**：AA 交一份同樣格式的 JSON → 白名單加一筆 → 下面 SCRIPTS 加一列（zone、layout＝src/data/tz_shops_layout.js 的 id、path、sha）→ 跑這支 →
src/data/places.js 加名字、營業時間、颱風假（和 tz_taimi 一樣）。流程不用改。

稿的格式（AA_821）：
  shop {id, name, hours, note}　staff {who, greet[], closed_line, closed_outside, no_money, not_open?}
  items {<id>: {name, price, eat[]}}　order {id, button, ask, after[], after_<x>_only?, after_no_<x>?, after_<x>?}　looks {<kind>: {button, t}}　seat {sit}
客居雲南（AA_825）寫稿的時候互動點還沒出來（稿 _meta：「點位出來再對 id」）：order 沒有 id、looks 的 key 是 menu／wall／table。對到配置的 kind 寫在 SCRIPTS 那一列：
  order_kind＝點餐的 kind；look_map＝{稿的 key: 配置的 kind 或 None}（None＝配置沒有這個點，這一句不接；匯入時印出來，回報給 AA、LAWWW2）。稿的每一個 key 都要在 look_map 裡，kind 要真的在配置檔裡。
資料檔的格式（照 GG3_LINES 的寫法，src/gg3shops3d.js 直接讀）：
  name、who、layout、hours（稿的字串；真的檢查的時間在 places.js）、door＝[[說話的人, 字]…]（稿的 greet：一天第一次進門說一句，和泰米村食的「進門」一樣）、
  close（closed_line：打烊時人還在店裡）、sign（closed_outside：打烊以後到門口）、notOpen（not_open：開門以前到門口；稿有才有）、look {kind: [字]}、labels {kind: 按鈕的字}、seat {sit}、
  meal {point（點餐的 kind）、ask、menu [{id, n, p, eat[]}]、after[]、afterOnly {id, line}（只點那一樣時說的；稿的 after_<x>_only＝id 結尾是 _<x> 的那一樣）、
        afterNo {ids[], line}（稿的 after_no_<x>：沒有點 id 裡有 _<x> 那一段的菜時說的；after[] 只在有點的時候說）、
        afterHas {ids[], line}（稿的 after_<x>，客居雲南的 after_guoqiao：有點 id 裡有 _<x> 那一段的菜時說的，取代 after[]）、
        eatFirst [[id…]…]（SCRIPTS 的 eat_first：一次點好幾樣只演一樣的「吃」，照這幾組的順序挑第一樣；每一樣菜剛好在一組）、short（no_money）}

測試：node tests/tz_yuehaochi_aa821_1112_unit.js、node tests/tz_keju_aa825_1112_unit.js（逐字對稿）。
用法：python3 tools/shops/import_tz_meals.py [--check]（--check：只比對，資料檔和稿匯出來的不一樣＝結束碼 1）"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

OUT = 'src/data/tz_meal_lines.js'
# 一間一列
SCRIPTS = [
    {'zone': 'tz_yuehaochi', 'layout': 'yuehaochi', 'path': 'docs/story_planning/AA_821_tz_yuehaochi.json', 'sha': '7917d4289',
     'eat_first': ['pho', 'roll', 'banhmi', 'coffee']},   # 一次點好幾樣只演一樣的「吃」：照這個順序挑（AA_821 _meta.lawww_1112 ②：河粉 > 春捲 > 法國麵包 > 咖啡；字＝菜的 id 裡的那一段）
    {'zone': 'tz_keju', 'layout': 'keju', 'path': 'docs/story_planning/AA_825_tz_keju.json', 'sha': '90fb5fa77',
     'eat_first': ['guoqiao', 'migan', 'wandou', 'bao', 'muer', 'tea'],   # AA_825 _meta：「一次點多樣只播一樣的 eat（順序照 items 由上到下）」
     'order_kind': 'tz_keju_order',   # 稿的 order 沒有 id：配置（src/data/tz_shops_layout.js keju.points）的點餐點
     'look_map': {'menu': 'tz_keju_menu', 'wall': 'tz_keju_batik', 'table': None}},   # 稿的 looks → 配置的 kind：wall（紮染布、雪山照片）＝「看牆上的扎染布」那一點；table（桌上的辣油、醋、酸菜）配置沒有點＝不接
]
SKIPPED = []
LAYOUT = 'src/data/tz_shops_layout.js'
_layout_text = None


def layout_kinds(layout):
    """配置檔裡那一間店的互動點 kind（只讀字，不執行）。"""
    global _layout_text
    if _layout_text is None:
        _layout_text = open(os.path.join(ROOT, LAYOUT), encoding='utf-8').read()
    m = re.search(r'^  "%s": \{.*$' % re.escape(layout), _layout_text, re.M)
    if not m:
        die(f'{LAYOUT} 找不到 {layout}')
    return re.findall(r'"kind": "([a-z0-9_]+)"', m.group(0))
CHANGED = []


def die(m):
    raise SystemExit('import_tz_meals：' + m)


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def fix(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{x!r}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def keys(o, need, where, opt=()):
    """o 要是物件、欄位剛好是 need（opt 可以有可以沒有）；多的、少的都停下來。"""
    if not isinstance(o, dict):
        die(f'{where}：要是物件')
    miss = [k for k in need if k not in o]
    more = [k for k in o if k not in need and k not in opt]
    if miss or more:
        die(f'{where}：少了 {miss}、不認得 {more}（稿改了：先改這支工具和 src/gg3shops3d.js）')
    return o


def strs(a, where, n=1):
    if not isinstance(a, list) or len(a) < n:
        die(f'{where}：要是至少 {n} 句的清單')
    return [fix(x, f'{where}[{i}]') for i, x in enumerate(a)]


def narr(x, where):
    t = fix(x, where)
    if not (t.startswith('（') and t.endswith('）')):
        die(f'{where}：旁白要用（）包起來：{t}')
    return t


def one(spec):
    W = spec['zone']
    ok, why = IG.allowed(spec['path'], spec['sha'], IG.load(ROOT))
    if not ok:
        die(why)
    try:
        doc = json.loads(git('show', f"{spec['sha']}:{spec['path']}"))
    except subprocess.CalledProcessError:
        die(f"讀不到 {spec['sha']}:{spec['path']}（淺層複本：git fetch origin claude/story-planning）")
    keys(doc, ['shop', 'staff', 'items', 'order', 'looks', 'seat'], W, opt=['_meta'])
    shop = keys(doc['shop'], ['id', 'name', 'hours'], W + ' shop', opt=['note'])
    if shop['id'] != W:
        die(f"{W}：稿的 shop.id 是 {shop['id']}")
    if not re.match(r'^\d{1,2}:\d{2}～\d{1,2}:\d{2}$', shop['hours']):
        die(f"{W} shop.hours：要是「11:00～21:00」這樣（{shop['hours']}）；一天兩段、公休日先改這支工具")
    staff = keys(doc['staff'], ['who', 'greet', 'closed_line', 'closed_outside', 'no_money'], W + ' staff', opt=['not_open'])
    who = fix(staff['who'], W + ' staff.who')
    items = doc['items']
    if not isinstance(items, dict) or not items:
        die(W + ' items：要有菜')
    menu = []
    for iid, it in items.items():
        keys(it, ['name', 'price', 'eat'], f'{W} items.{iid}')
        if not isinstance(it['price'], int) or isinstance(it['price'], bool) or it['price'] <= 0:
            die(f'{W} items.{iid}.price：要是正整數')
        menu.append({'id': iid, 'n': fix(it['name'], f'{W} items.{iid}.name'), 'p': it['price'], 'eat': [narr(x, f'{W} items.{iid}.eat') for x in strs(it['eat'], f'{W} items.{iid}.eat')]})
    order = doc['order']
    only_keys = [k for k in order if re.match(r'^after_[a-z0-9]+_only$', k)] if isinstance(order, dict) else []
    no_keys = [k for k in order if re.match(r'^after_no_[a-z0-9]+$', k)] if isinstance(order, dict) else []
    has_keys = [k for k in order if re.match(r'^after_[a-z0-9]+$', k) and k not in no_keys] if isinstance(order, dict) else []
    okind = spec.get('order_kind')
    keys(order, (['button', 'ask', 'after'] if okind else ['id', 'button', 'ask', 'after']), W + ' order', opt=only_keys + no_keys + has_keys)
    if not okind:
        okind = order['id']
    kinds = layout_kinds(spec['layout'])
    if okind not in kinds:
        die(f'{W} 點餐的 kind {okind} 不在配置裡（{kinds}）')
    if len(has_keys) > 1:
        die(W + ' order：after_<x> 只認得一個')
    if len(no_keys) > 1:
        die(W + ' order：after_no_<x> 只認得一個')
    seg = lambda x: [m['id'] for m in menu if x in m['id'].split('_')]   # id 裡有 _<x> 那一段的菜
    after_no = None
    for k in no_keys:
        hit = seg(k[len('after_no_'):])
        if not hit:
            die(f'{W} order.{k}：對不到 id 裡有那一段的菜')
        after_no = {'ids': hit, 'line': fix(order[k], f'{W} order.{k}')}
    after_has = None
    for k in has_keys:
        hit = seg(k[len('after_'):])
        if not hit:
            die(f'{W} order.{k}：對不到 id 裡有那一段的菜')
        after_has = {'ids': hit, 'line': fix(order[k], f'{W} order.{k}')}
    eat_first = None
    if spec.get('eat_first'):
        eat_first = [seg(x) for x in spec['eat_first']]
        flat = [i for g in eat_first for i in g]
        if any(not g for g in eat_first) or sorted(flat) != sorted(m['id'] for m in menu):
            die(f'{W} eat_first：每一樣菜要剛好在一組（{eat_first}）；稿加了菜、改了 id 先改 SCRIPTS')
    if len(only_keys) > 1:
        die(W + ' order：after_<x>_only 只認得一個')
    after_only = None
    for k in only_keys:
        x = re.match(r'^after_([a-z0-9]+)_only$', k).group(1)
        hit = [m['id'] for m in menu if m['id'].endswith('_' + x)]
        if len(hit) != 1:
            die(f'{W} order.{k}：對不到（或不只一樣）id 結尾是 _{x} 的菜')
        after_only = {'id': hit[0], 'line': fix(order[k], f'{W} order.{k}')}
    looks = doc['looks']
    if not isinstance(looks, dict):
        die(W + ' looks：要是物件')
    look, labels = {}, {okind: fix(order['button'], W + ' order.button')}
    lmap = spec.get('look_map')
    for kind, v in looks.items():
        keys(v, ['button', 't'], f'{W} looks.{kind}')
        if lmap is not None:
            if kind not in lmap:
                die(f'{W} looks.{kind}：SCRIPTS 的 look_map 沒有這個 key（稿加了「看」：先對配置的點）')
            if lmap[kind] is None:
                SKIPPED.append(f'{W} looks.{kind}（{v["button"]}）：配置沒有這個點，這一句不接')
                continue
            kind = lmap[kind]
        if kind not in kinds:
            die(f'{W} looks：kind {kind} 不在配置裡（{kinds}）')
        if kind in labels:
            die(f'{W} looks.{kind}：和點餐的 kind 重複')
        look[kind] = [narr(v['t'], f'{W} looks.{kind}.t')]
        labels[kind] = fix(v['button'], f'{W} looks.{kind}.button')
    seat = keys(doc['seat'], ['sit'], W + ' seat')
    out = {'name': fix(shop['name'], W + ' shop.name'), 'who': who, 'layout': spec['layout'], 'hours': shop['hours'],
            'door': [[who, t] for t in strs(staff['greet'], W + ' staff.greet')],
            'close': fix(staff['closed_line'], W + ' staff.closed_line'), 'sign': narr(staff['closed_outside'], W + ' staff.closed_outside'),
            'look': look, 'labels': labels, 'seat': {'sit': narr(seat['sit'], W + ' seat.sit')},
            'meal': {'point': okind, 'ask': fix(order['ask'], W + ' order.ask'), 'menu': menu, 'after': strs(order['after'], W + ' order.after'),
                     'afterOnly': after_only, 'afterNo': after_no, 'afterHas': after_has, 'eatFirst': eat_first, 'short': fix(staff['no_money'], W + ' staff.no_money')}}
    if 'not_open' in staff:
        out['notOpen'] = narr(staff['not_open'], W + ' staff.not_open')
    return out


def build():
    out = {}
    for spec in SCRIPTS:
        if spec['zone'] in out:
            die(f"SCRIPTS：{spec['zone']} 重複")
        out[spec['zone']] = one(spec)
    return out


def render(data):
    src = '、'.join(f"{s['sha']} 的 {s['path']}" for s in SCRIPTS)
    head = ('/* ===== 汀州路小館的店內文字（TINGZHOU-SHOPS5-1110）——自動產生，不要手改 =====\n'
            f'   來源：企劃線 {src}（AA 定稿 D109；白名單 docs/handoff/story_import_allow.json）。\n'
            '   產生：python3 tools/shops/import_tz_meals.py（字一字照稿；door＝[說話的人, 字]；格式說明在那支工具開頭）。\n'
            '   流程在 src/gg3shops3d.js（和泰米村食同一套）；測試 node tests/tz_yuehaochi_aa821_1112_unit.js、node tests/tz_keju_aa825_1112_unit.js（逐字對稿）。 */\n')
    body = 'const TZ_MEAL_LINES={\n' + ',\n'.join(f'  {json.dumps(k)}:{json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in data.items()) + '\n};\n'
    body += 'TZ_MEAL_LINES._src=' + json.dumps({s['zone']: {'sha': s['sha'], 'doc': s['path']} for s in SCRIPTS}, ensure_ascii=False, separators=(',', ':')) + ';\n'
    return head + "'use strict';\n" + body


def main():
    data = build()
    text = render(data)
    path = os.path.join(ROOT, OUT)
    for c in CHANGED:
        print('換名：' + c)
    for c in SKIPPED:
        print('不接：' + c)
    if '--check' in sys.argv:
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        if old != text:
            print(f'{OUT} 和稿匯出來的不一樣（重新跑 python3 tools/shops/import_tz_meals.py）')
            sys.exit(1)
        print(f'{OUT} 和稿一致')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'寫入 {OUT}（{len(data)} 間）')


if __name__ == '__main__':
    main()
