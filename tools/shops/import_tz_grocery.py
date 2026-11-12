#!/usr/bin/env python3
"""TINGZHOU-SHOPS5-1110：汀州路的雜貨店（東南大聯商行 tz_dongnan）的店內文字，
從 AA 的稿（一間一份 JSON）匯進 src/data/tz_grocery_lines.js（TZ_GROCERY_LINES）。流程在 src/gg3shops3d.js（S.addGroceries、S.groceryShelf、S.groceryPay），這支只搬字。

和 tools/shops/import_tz_meals.py 同一個做法（小館那一支的稿有座位、「吃」的句子；雜貨店沒有座位、是「到貨架拿、到櫃檯結帳」，所以另外一支）：
來源照 docs/handoff/story_import_allow.json 的 sha（import_guard 擋）、字一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）、
稿的結構和這支認得的不一樣（多了不認得的欄位、少了欄位、型別不對）＝停下來，不會默默丟掉。

**加一間店**：AA 交一份同樣格式的 JSON → 白名單加一筆 → 下面 SCRIPTS 加一列 → 跑這支 → src/data/places.js 加名字、營業時間、颱風假；src/gg3shops3d.js 的 S.CLERK_I 加店員的路人模型。

稿的格式（AA_823）：
  shop {id, name, hours, note}　staff {who, greet[], closed_line, closed_outside, no_money, not_open?}
  items {<id>: {name, price, where（哪一個互動點的貨架）, line（那一樣的一句說明）}}
  looks {<貨架的 kind>: {button, t}、<結帳的 kind>: {button, ask, after[], empty, cancel（「就這些嗎？」選「不用了」的旁白）, after_<x>?, after_<x>_when?}}
  pick（最上層；從貨架拿起一樣東西的旁白，每拿一樣說一次；沒有品名的空格）
資料檔的格式（照 TZ_MEAL_LINES 的寫法，src/gg3shops3d.js 直接讀）：
  name、who、layout、hours（稿的字串；真的檢查的時間在 places.js）、door＝[[說話的人, 字]…]（稿的 greet：一天第一次進門說一句）、
  close（closed_line）、sign（closed_outside）、notOpen（not_open；稿有才有）、look {貨架的 kind: [字]}、labels {kind: 按鈕的字}、
  grocery {point（結帳的 kind）、ask、after[]、afterIf {ids[], line}（稿的 after_<x>：這一次買的東西裡有 ids 其中一樣才說，取代 after；ids 寫在 SCRIPTS 的 after_if，
           而且每一個 id 都要出現在稿的 after_<x>_when 那一句說明裡，不然停下來）、empty（手上沒有東西去結帳）、cancel（不用了）、pick（拿起一樣）、short（no_money）、
           goods [{id, n, p, at（貨架的 kind）, line}]（順序照稿）}

測試：node tests/tz_dongnan_aa823_1112_unit.js（逐字對稿）。
用法：python3 tools/shops/import_tz_grocery.py [--check]（--check：只比對，資料檔和稿匯出來的不一樣＝結束碼 1）"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

OUT = 'src/data/tz_grocery_lines.js'
SCRIPTS = [
    {'zone': 'tz_dongnan', 'layout': 'dongnan', 'path': 'docs/story_planning/AA_823_tz_dongnan.json', 'sha': '3d0ab9944',
     'counter': 'tz_dongnan_counter',   # looks 裡哪一個是結帳（其他的都是貨架）
     'after_if': {'spicy': ['tz_dn_noodle', 'tz_dn_noodle5', 'tz_dn_sauce']}},   # 稿的 after_spicy_when：「買的東西裡有泡麵（tz_dn_noodle、tz_dn_noodle5）或辣醬（tz_dn_sauce）才出，取代 after」
]
CHANGED = []


def die(m):
    raise SystemExit('import_tz_grocery：' + m)


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
        die(f"讀不到 {spec['sha']}:{spec['path']}（淺層複本：git fetch origin claude/magical-albattani-bk7b4n 或企劃線）")
    keys(doc, ['shop', 'staff', 'items', 'looks', 'pick'], W, opt=['_meta'])
    shop = keys(doc['shop'], ['id', 'name', 'hours'], W + ' shop', opt=['note'])
    if shop['id'] != W:
        die(f"{W}：稿的 shop.id 是 {shop['id']}")
    if not re.match(r'^\d{1,2}:\d{2}～\d{1,2}:\d{2}$', shop['hours']):
        die(f"{W} shop.hours：要是「10:00～21:30」這樣（{shop['hours']}）；一天兩段、公休日先改這支工具")
    staff = keys(doc['staff'], ['who', 'greet', 'closed_line', 'closed_outside', 'no_money'], W + ' staff', opt=['not_open'])
    who = fix(staff['who'], W + ' staff.who')
    looks = doc['looks']
    if not isinstance(looks, dict) or spec['counter'] not in looks:
        die(f"{W} looks：要有結帳的 {spec['counter']}")
    look, labels = {}, {}
    for kind, v in looks.items():
        if kind == spec['counter']:
            continue
        keys(v, ['button', 't'], f'{W} looks.{kind}')
        look[kind] = [narr(v['t'], f'{W} looks.{kind}.t')]
        labels[kind] = fix(v['button'], f'{W} looks.{kind}.button')
    C = looks[spec['counter']]
    ifs = spec.get('after_if') or {}
    if len(ifs) > 1:
        die(W + ' after_if：只認得一個')
    opt = [f'after_{x}' for x in ifs] + [f'after_{x}_when' for x in ifs]
    keys(C, ['button', 'ask', 'after', 'empty', 'cancel'] + opt, f"{W} looks.{spec['counter']}")
    labels[spec['counter']] = fix(C['button'], W + ' 結帳 button')
    items = doc['items']
    if not isinstance(items, dict) or not items:
        die(W + ' items：要有東西')
    goods = []
    for iid, it in items.items():
        keys(it, ['name', 'price', 'where', 'line'], f'{W} items.{iid}')
        if not isinstance(it['price'], int) or isinstance(it['price'], bool) or it['price'] <= 0:
            die(f'{W} items.{iid}.price：要是正整數')
        if it['where'] not in look:
            die(f"{W} items.{iid}.where：{it['where']} 不是 looks 裡的貨架")
        goods.append({'id': iid, 'n': fix(it['name'], f'{W} items.{iid}.name'), 'p': it['price'], 'at': it['where'], 'line': fix(it['line'], f'{W} items.{iid}.line')})
    if len({g['n'] for g in goods}) != len(goods):
        die(W + ' items：名字重複')
    after_if = None
    for x, ids in ifs.items():
        when = C[f'after_{x}_when']
        bad = [i for i in ids if i not in items or not re.search(r'(?<![A-Za-z0-9_])' + re.escape(i) + r'(?![A-Za-z0-9_])', when)]
        more = [i for i in re.findall(r'[a-z][a-z0-9_]*_[a-z0-9_]+', when) if i in items and i not in ids]
        if bad or more or '取代 after' not in when:
            die(f'{W} after_{x}_when：和 SCRIPTS 的 after_if 對不起來（少 {bad}、多 {more}）：{when}')
        after_if = {'ids': ids, 'line': fix(C[f'after_{x}'], f'{W} after_{x}')}
    out = {'name': fix(shop['name'], W + ' shop.name'), 'who': who, 'layout': spec['layout'], 'hours': shop['hours'],
           'door': [[who, t] for t in strs(staff['greet'], W + ' staff.greet')],
           'close': fix(staff['closed_line'], W + ' staff.closed_line'), 'sign': narr(staff['closed_outside'], W + ' staff.closed_outside'),
           'look': look, 'labels': labels,
           'grocery': {'point': spec['counter'], 'ask': fix(C['ask'], W + ' 結帳 ask'), 'after': strs(C['after'], W + ' 結帳 after'), 'afterIf': after_if,
                       'empty': narr(C['empty'], W + ' 結帳 empty'), 'cancel': narr(C['cancel'], W + ' 結帳 cancel'), 'pick': narr(doc['pick'], W + ' pick'), 'short': narr(staff['no_money'], W + ' staff.no_money'), 'goods': goods}}
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
    head = ('/* ===== 汀州路雜貨店的店內文字（TINGZHOU-SHOPS5-1110）——自動產生，不要手改 =====\n'
            f'   來源：AA 的稿 {src}（AA 定稿 D109；白名單 docs/handoff/story_import_allow.json）。\n'
            '   產生：python3 tools/shops/import_tz_grocery.py（字一字照稿；door＝[說話的人, 字]；格式說明在那支工具開頭）。\n'
            '   流程在 src/gg3shops3d.js（S.addGroceries、S.groceryShelf、S.groceryPay；買的東西記在 G.flags.GG3_OWN、選單「物品」看得到）；測試 node tests/tz_dongnan_aa823_1112_unit.js（逐字對稿）。 */\n')
    body = 'const TZ_GROCERY_LINES={\n' + ',\n'.join(f'  {json.dumps(k)}:{json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in data.items()) + '\n};\n'
    body += 'TZ_GROCERY_LINES._src=' + json.dumps({s['zone']: {'sha': s['sha'], 'doc': s['path']} for s in SCRIPTS}, ensure_ascii=False, separators=(',', ':')) + ';\n'
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
            print(f'{OUT} 和稿匯出來的不一樣（重新跑 python3 tools/shops/import_tz_grocery.py）')
            sys.exit(1)
        print(f'{OUT} 和稿一致')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'寫入 {OUT}（{len(data)} 間）')


if __name__ == '__main__':
    main()
