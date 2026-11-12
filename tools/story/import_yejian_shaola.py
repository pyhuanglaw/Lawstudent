#!/usr/bin/env python3
"""GG-SHAOLA-FIX-1112、GG-YEJIAN-SHOP-1112（店面標準 §12 第 3、4 點：營業中有店員、買得到東西）：
把 AA 的稿匯進 src/data/yejian_shaola_buy.js（YEJIAN_SHAOLA_BUY）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_853_yejian_shaola_buy.json
- noodle（公館燒臘）：staff（who、greet、order_done、call、no_money、tab_pay、tab_refuse；no_money_note 是給程式的說明，不匯）、
  menu [[品名, 價錢]]（六樣）、addon [[品名, 價錢]]、menu_look、window_look、eat {品名: 吃的旁白}（menu 每一樣都要有）。
  notes「例湯單點…選單上例湯只在沒點飯的時候出現」→ soup＝那一樣的品名（要在 menu 裡）。
- bookstore（頁間書屋）：staff（who、greet、greet_regular、closed_line、not_open）、points {點名: {look?, buy [[品名, 價錢, 種類, 旁白?]], order?}}、no_money。
  點名 → 區域的互動點 kind（POINTS；位置在 src/data/yejian_layout.js 的 interact，配置還沒有的兩個點在 src/zones3d.js buildYejian）。
  種類 eat／own／gift；own、gift 的東西要有 id（IDS；存檔 G.flags.GG3_OWN、GIFTH.bag 記的是 id，照品名對，不照順序編號）。
  notes「greet_regular：在這裡買過三次以上。」→ regular＝3（從這一句的字讀）。
- lawww_1112（AA 回 LAWWW 的答案，2026-11-12；有字的才匯）：頁間第 6 點「紅茶 80 加回來，一共四樣」→ 咖啡吧多那一樣（稿的 buy 陣列還沒有的時候接在最後；樣數要對得上），
  第 8 點「新書、雜誌、明信片錢不夠共用一句：「…」」→ no_money2＝{at: 那幾個點的 kind, text: 那一句}（書牆照舊用 no_money）。其他點（說話的人用現有的名字、順序、價錢怎麼扣）是給程式的，不匯。
- 品名、價錢、句子一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）。說話的人＝staff.who 去掉括號裡的說明。
- 稿多了一樣這裡沒有的、少了一樣、點名不認得、欄位不認得＝停下來（先改這支工具和 src/shaola_order3d.js、src/yejian_buy3d.js），不會默默丟掉。

演出：src/shaola_order3d.js（燒臘）、src/yejian_buy3d.js（頁間）。測試 tests/shaola_order_1112_unit.js、tests/yejian_buy_1112_unit.js。
用法：python3 tools/story/import_yejian_shaola.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_853_yejian_shaola_buy.json'
OUT = 'src/data/yejian_shaola_buy.js'
KINDS = ('eat', 'own', 'gift')
NOODLE_STAFF = ('who', 'greet', 'order_done', 'call', 'no_money', 'tab_pay', 'tab_refuse')
BOOK_STAFF = ('who', 'greet', 'greet_regular', 'closed_line', 'not_open')
# 稿的點名 → 互動點的 kind（shelf_browse、new_books、cafe_order＝配置 yejian_layout.js interact 現有的；magazines、postcards＝這次新加的）
POINTS = {'書牆': 'shelf_browse', '新書推薦': 'new_books', '雜誌': 'magazines', '明信片': 'postcards', '咖啡吧': 'cafe_order'}
IDS = {'二手小說': 'yj_novel', '二手法律書（舊版）': 'yj_lawbook', '二手詩集': 'yj_poetry', '店員推薦的新書': 'yj_newbook', '過期雜誌': 'yj_magazine', '明信片': 'yj_postcard'}
NUM = {'一': 1, '二': 2, '兩': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9, '十': 10}
CHANGED = []


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_yejian_shaola：' + m)


def txt(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def keys(e, where, must, may=()):
    if not isinstance(e, dict):
        die(f'{where}：要是物件')
    miss, extra = set(must) - set(e), set(e) - set(must) - set(may)
    if miss or extra:
        die(f'{where}：欄位不對（少 {sorted(miss)}、不認得 {sorted(extra)}）')


def price(p, where):
    if not isinstance(p, int) or isinstance(p, bool) or p <= 0:
        die(f'{where}：價錢要是正的整數（拿到 {p!r}）')
    return p


def who(s, where):
    """說話的人：稿的 who 去掉括號裡的說明（「店員（咖啡吧後面一位；…）」→「店員」）"""
    w = re.sub(r'（[^）]*）', '', txt(s, where)).strip()
    if not w:
        die(f'{where}：去掉括號以後沒有字')
    return w


def rows2(rows, where):
    if not isinstance(rows, list) or not rows:
        die(f'{where}：要是陣列、至少一樣')
    out, seen = [], set()
    for i, r in enumerate(rows):
        w = f'{where}[{i}]'
        if not isinstance(r, list) or len(r) != 2:
            die(w + '：要是 [品名, 價錢]')
        n = txt(r[0], w)
        if n in seen:
            die(f'{w}：「{n}」重複')
        seen.add(n)
        out.append({'n': n, 'p': price(r[1], w)})
    return out


def noodle(e):
    z = 'noodle'
    keys(e, z, ('name', 'staff', 'menu', 'addon', 'menu_look', 'window_look', 'eat', 'notes'))
    keys(e['staff'], z + '.staff', NOODLE_STAFF, ('no_money_note',))
    staff = {k: (who(e['staff'][k], f'{z}.staff.who') if k == 'who' else txt(e['staff'][k], f'{z}.staff.{k}')) for k in NOODLE_STAFF}
    if staff['tab_pay'].count('{n}') != 1:
        die(z + '.staff.tab_pay：要剛好有一個 {n}（這次加上次的總數）')
    menu, addon = rows2(e['menu'], z + '.menu'), rows2(e['addon'], z + '.addon')
    names = [m['n'] for m in menu]
    if not isinstance(e['eat'], dict) or set(e['eat']) != set(names):
        die(f'{z}.eat：要和 menu 的品名一樣（menu {names}、eat {sorted(e["eat"]) if isinstance(e["eat"], dict) else e["eat"]}）')
    eat = {n: txt(e['eat'][n], f'{z}.eat.{n}') for n in names}
    # 例湯：notes「例湯單點 20；配飯一起點的第一碗不用錢…選單上例湯只在沒點飯的時候出現。」→ soup＝那一樣（不加滷蛋、不算飯）
    hit = [m for n in e['notes'] for m in re.findall(r'^(.+?)單點 (\d+)；配飯一起點的第一碗不用錢', n)]
    if len(hit) != 1 or hit[0][0] not in names or menu[names.index(hit[0][0])]['p'] != int(hit[0][1]):
        die(f'{z}.notes：找不到「○○單點 N；配飯一起點的第一碗不用錢」那一句，或和 menu 對不上（{hit}）')
    return {'name': txt(e['name'], z + '.name'), 'staff': staff, 'menu': menu, 'addon': addon, 'soup': hit[0][0],
            'menu_look': txt(e['menu_look'], z + '.menu_look'), 'window_look': txt(e['window_look'], z + '.window_look'), 'eat': eat}


def bookstore(e, ans=None):
    z = 'bookstore'
    ans = ans or {}
    keys(e, z, ('name', 'decide', 'staff', 'points', 'no_money', 'notes'))
    keys(e['staff'], z + '.staff', BOOK_STAFF)
    staff = {k: (who(e['staff'][k], f'{z}.staff.who') if k == 'who' else txt(e['staff'][k], f'{z}.staff.{k}')) for k in BOOK_STAFF}
    if not isinstance(e['points'], dict) or set(e['points']) != set(POINTS):
        die(f'{z}.points：點名要剛好是 {"、".join(POINTS)}（拿到 {"、".join(e["points"]) if isinstance(e["points"], dict) else e["points"]}）')
    points, seen = [], set()
    for label, p in e['points'].items():
        w = f'{z}.points.{label}'
        keys(p, w, ('buy',), ('look', 'order'))
        if not isinstance(p['buy'], list) or not p['buy']:
            die(w + '.buy：要是陣列、至少一樣')
        goods = []
        for i, r in enumerate(p['buy']):
            wr = f'{w}.buy[{i}]'
            if not isinstance(r, list) or len(r) not in (3, 4):
                die(wr + '：要是 [品名, 價錢, 種類] 或 [品名, 價錢, 種類, 旁白]')
            n, kind = txt(r[0], wr), r[2]
            if kind not in KINDS:
                die(f'{wr}：種類要是 {"／".join(KINDS)}（拿到 {kind}）')
            if (label, n) in seen:
                die(f'{wr}：「{n}」重複')
            seen.add((label, n))
            g = {'n': n, 'p': price(r[1], wr), 'kind': kind}
            if kind != 'eat':
                if n not in IDS:
                    die(f'{wr}：「{n}」這支工具的 IDS 沒有（稿加了新的東西或改了品名：先在 IDS 加一個 id）')
                g['id'] = IDS[n]
            if len(r) == 4:
                g['line'] = txt(r[3], wr + '（旁白）')
            goods.append(g)
        o = {'kind': POINTS[label], 'label': txt(label, w)}
        if 'look' in p:
            o['look'] = txt(p['look'], w + '.look')
        if 'order' in p:
            o['order'] = txt(p['order'], w + '.order')
        o['goods'] = goods
        points.append(o)
    # lawww_1112 頁間第 6 點：「紅茶 80 加回來，一共四樣。」——稿的 buy 陣列沒有的那一樣接在咖啡吧最後（eat）；樣數要和「一共○樣」一樣
    back = [(m.group(1), int(m.group(2)), m.group(3)) for v in ans.values() for m in re.finditer(r'[；。，]?([^；。，\s（）]+) (\d+) 加回來，一共([一二兩三四五六七八九十])樣', v)]
    if len(back) > 1:
        die(f'lawww_1112.頁間：「○○ N 加回來，一共○樣」找到 {len(back)} 句，只認一句')
    if back:
        n, pr, cnt = back[0]
        cafe = [q for q in points if q['kind'] == 'cafe_order'][0]
        n = txt(n, 'lawww_1112.頁間（加回來的那一樣）')
        old = [g for g in cafe['goods'] if g['n'] == n]
        if old and old[0]['p'] != pr:
            die(f'lawww_1112.頁間：「{n}」答案寫 {pr}、buy 陣列寫 {old[0]["p"]}，對不上')
        if not old:
            cafe['goods'].append({'n': n, 'p': price(pr, 'lawww_1112.頁間'), 'kind': 'eat'})
        if len(cafe['goods']) != NUM[cnt]:
            die(f'lawww_1112.頁間：答案寫咖啡吧一共 {NUM[cnt]} 樣，數到 {len(cafe["goods"])} 樣')
    # lawww_1112 頁間第 8 點：「新書、雜誌、明信片錢不夠共用一句：「…」」
    SHORT = {'書牆': 'shelf_browse', '新書': 'new_books', '新書推薦': 'new_books', '雜誌': 'magazines', '明信片': 'postcards'}
    nm2 = [(m.group(1), m.group(2)) for v in ans.values() for m in re.finditer(r'^(.+?)錢不夠共用一句：「(.+)」$', v)]
    if len(nm2) > 1:
        die(f'lawww_1112.頁間：「…錢不夠共用一句」找到 {len(nm2)} 句，只認一句')
    no_money2 = None
    if nm2:
        at = nm2[0][0].split('、')
        if any(a not in SHORT for a in at) or 'shelf_browse' in [SHORT.get(a) for a in at]:
            die(f'lawww_1112.頁間：錢不夠共用的點不認得（{at}；書牆有自己的 no_money）')
        no_money2 = {'at': [SHORT[a] for a in at], 'text': txt(nm2[0][1], 'lawww_1112.頁間（錢不夠共用的那一句）')}
    have = {g['n'] for p in points for g in p['goods'] if g['kind'] != 'eat'}
    if set(IDS) - have:
        die(f'{z}：稿少了 {sorted(set(IDS) - have)}（買過的存檔還記著它的 id：先問 AA，再改 IDS）')
    # 熟客：notes「greet_regular：在這裡買過三次以上。」
    hit = [m for n in e['notes'] for m in re.findall(r'^greet_regular：在這裡買過([一二兩三四五六七八九十])次以上', n)]
    if len(hit) != 1:
        die(f'{z}.notes：找不到「greet_regular：在這裡買過○次以上」那一句（找到 {len(hit)} 句）')
    out = {'name': txt(e['name'], z + '.name'), 'staff': staff, 'regular': NUM[hit[0]], 'points': points, 'no_money': txt(e['no_money'], z + '.no_money')}
    if no_money2:
        out['no_money2'] = no_money2
    return out


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow['files'] if e.get('path') == PATH and e.get('status') == 'approved']
    if len(hits) != 1:
        die(f'{PATH} 白名單要剛好一筆 approved')
    sha = hits[0]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        die(why)
    A = json.loads(git('show', f'{sha}:{PATH}'))
    keys(A, '稿', ('_meta', 'bookstore', 'noodle'), ('lawww_1112',))
    ANS = A.get('lawww_1112') or {}
    if not isinstance(ANS, dict) or set(ANS) - {'燒臘', '頁間'} or any(not isinstance(v, dict) or any(not isinstance(x, str) for x in v.values()) for v in ANS.values()):
        die('lawww_1112：要是 {燒臘: {編號: 一句}, 頁間: {編號: 一句}}')
    data = {'src': f'{PATH}@{sha}', 'noodle': noodle(A['noodle']), 'bookstore': bookstore(A['bookstore'], ANS.get('頁間'))}
    out = ('/* 自動產生：tools/story/import_yejian_shaola.py（' + data['src'] + '）。不要手改，改企劃 AA_853 再重新匯入。\n'
           '   公館燒臘點餐（GG-SHAOLA-FIX-1112；演出 src/shaola_order3d.js）：menu／addon＝品名、價錢；soup＝單點的湯（配飯的第一碗不用錢）；eat＝每一樣吃的旁白；staff＝阿姨的話（tab_pay 的 {n}＝這次加上次）。\n'
           '   頁間書屋買東西（GG-YEJIAN-SHOP-1112；演出 src/yejian_buy3d.js）：points＝每個互動點（kind）的「看」和賣的東西（kind eat 當場吃喝／own 進「物品」／gift 可以送人）；regular＝買過幾次起換熟客的招呼；no_money＝書牆錢不夠的那一句、no_money2＝其他點共用的那一句（at＝哪幾個點）。字一字照稿。*/\n'
           '\'use strict\';\nconst YEJIAN_SHAOLA_BUY=' + json.dumps(data, ensure_ascii=False, indent=1) + ';\nif(typeof module!==\'undefined\') module.exports=YEJIAN_SHAOLA_BUY;\n')
    p = os.path.join(ROOT, OUT)
    for c in CHANGED:
        print('換名：' + c)
    if '--check' in sys.argv:
        same = os.path.exists(p) and open(p, encoding='utf-8').read() == out
        print(('OK ' + why) if same else ('不一致：' + OUT))
        sys.exit(0 if same else 1)
    open(p, 'w', encoding='utf-8').write(out)
    print('寫入', OUT, why, '｜', f'燒臘 {len(data["noodle"]["menu"])} 樣＋加點 {len(data["noodle"]["addon"])} 樣、頁間 {sum(len(q["goods"]) for q in data["bookstore"]["points"])} 樣')


main()
