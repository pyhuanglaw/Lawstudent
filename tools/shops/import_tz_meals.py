#!/usr/bin/env python3
"""TINGZHOU-SHOPS5-1110：汀州路的小館（越好吃小館 tz_yuehaochi；之後的客居雲南也走這一支）的店內文字，
從 AA 的稿（一間一份 JSON）匯進 src/data/tz_meal_lines.js（TZ_MEAL_LINES）。流程在 src/gg3shops3d.js（和泰米村食同一套），這支只搬字。

和 tools/shops/import_gg3_shops.py 同一個做法：來源照 docs/handoff/story_import_allow.json 的 sha（import_guard 擋）、字一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）、
稿的結構和這支認得的不一樣（多了不認得的欄位、少了欄位、型別不對）＝停下來，不會默默丟掉。

**加一間店**：AA 交一份同樣格式的 JSON → 白名單加一筆 → 下面 SCRIPTS 加一列（zone、layout＝src/data/tz_shops_layout.js 的 id、path、sha）→ 跑這支 →
src/data/places.js 加名字、營業時間、颱風假（和 tz_taimi 一樣）。流程不用改。

稿的格式（AA_821）：
  shop {id, name, hours, note}　staff {who, greet[], closed_line, closed_outside, no_money}
  items {<id>: {name, price, eat[]}}　order {id, button, ask, after[], after_<x>_only?}　looks {<kind>: {button, t}}　seat {sit}
資料檔的格式（照 GG3_LINES 的寫法，src/gg3shops3d.js 直接讀）：
  name、who、layout、hours（稿的字串；真的檢查的時間在 places.js）、door＝[[說話的人, 字]…]（稿的 greet：一天第一次進門說一句，和泰米村食的「進門」一樣）、
  close（closed_line：打烊時人還在店裡）、sign（closed_outside：打烊以後到門口）、look {kind: [字]}、labels {kind: 按鈕的字}、seat {sit}、
  meal {point（點餐的 kind）、ask、menu [{id, n, p, eat[]}]、after[]、afterOnly {id, line}（只點那一樣時說的；稿的 after_<x>_only＝id 結尾是 _<x> 的那一樣）、short（no_money）}

測試：node tests/tz_yuehaochi_aa821_1112_unit.js（逐字對稿）。
用法：python3 tools/shops/import_tz_meals.py [--check]（--check：只比對，資料檔和稿匯出來的不一樣＝結束碼 1）"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

OUT = 'src/data/tz_meal_lines.js'
# 一間一列。客居雲南（tz_keju）還沒有稿：AA 交了以後加一列就好
SCRIPTS = [
    {'zone': 'tz_yuehaochi', 'layout': 'yuehaochi', 'path': 'docs/story_planning/AA_821_tz_yuehaochi.json', 'sha': '65e38a5de'},
]
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
    staff = keys(doc['staff'], ['who', 'greet', 'closed_line', 'closed_outside', 'no_money'], W + ' staff')
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
    keys(order, ['id', 'button', 'ask', 'after'], W + ' order', opt=only_keys)
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
    look, labels = {}, {order['id']: fix(order['button'], W + ' order.button')}
    for kind, v in looks.items():
        keys(v, ['button', 't'], f'{W} looks.{kind}')
        if kind in labels:
            die(f'{W} looks.{kind}：和點餐的 kind 重複')
        look[kind] = [narr(v['t'], f'{W} looks.{kind}.t')]
        labels[kind] = fix(v['button'], f'{W} looks.{kind}.button')
    seat = keys(doc['seat'], ['sit'], W + ' seat')
    return {'name': fix(shop['name'], W + ' shop.name'), 'who': who, 'layout': spec['layout'], 'hours': shop['hours'],
            'door': [[who, t] for t in strs(staff['greet'], W + ' staff.greet')],
            'close': fix(staff['closed_line'], W + ' staff.closed_line'), 'sign': narr(staff['closed_outside'], W + ' staff.closed_outside'),
            'look': look, 'labels': labels, 'seat': {'sit': narr(seat['sit'], W + ' seat.sit')},
            'meal': {'point': order['id'], 'ask': fix(order['ask'], W + ' order.ask'), 'menu': menu, 'after': strs(order['after'], W + ' order.after'),
                     'afterOnly': after_only, 'short': fix(staff['no_money'], W + ' staff.no_money')}}


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
            '   流程在 src/gg3shops3d.js（和泰米村食同一套）；測試 node tests/tz_yuehaochi_aa821_1112_unit.js（逐字對稿）。 */\n')
    body = 'const TZ_MEAL_LINES={\n' + ',\n'.join(f'  {json.dumps(k)}:{json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in data.items()) + '\n};\n'
    body += 'TZ_MEAL_LINES._src=' + json.dumps({s['zone']: {'sha': s['sha'], 'doc': s['path']} for s in SCRIPTS}, ensure_ascii=False, separators=(',', ':')) + ';\n'
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
            print(f'{OUT} 和稿匯出來的不一樣（重新跑 python3 tools/shops/import_tz_meals.py）')
            sys.exit(1)
        print(f'{OUT} 和稿一致')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'寫入 {OUT}（{len(data)} 間）')


if __name__ == '__main__':
    main()
