#!/usr/bin/env python3
"""US-MARKETS-BUY-1112（SHOP-STANDARD-BACKFILL-1112：草原超市 us_market、竹葉亞洲超市 us_asian_market 的「買得到／錢不夠／字」）：
把 AA 的稿匯進 src/data/us_markets_buy.js（US_MARKETS_BUY）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_850_us_markets_buy.json
- 每一間：name、shelves（貨架 id → [[品名, 美金, 種類]]；種類 eat／own／gift）、lines（店員的話、旁白）。
- 竹葉亞洲超市 notes 裡「給的時候她說：「……」」那一句（多帶一顆月餅給學姊）→ lines.mooncake_give。
- 匯進來：goods＝[{id, n, usd, p, kind, at}]（順序照稿）；p＝實際扣的錢＝美金 × RATE（稿 _meta.money：一美金算 32 元，四捨五入到整數）。
- 品名、句子一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）。
- 東西的 id 稿上沒有，照品名對（IDS；存檔 G.flags.GG3_OWN、GIFTH.bag 記的是 id，所以不能照順序編號）。
  稿多了一樣這裡沒有的、少了一樣、貨架 id 不認得、欄位不認得＝停下來（先改這支工具和 src/us_markets3d.js），不會默默丟掉。

演出：src/us_markets3d.js。測試 tests/us_markets_buy_unit.js。
用法：python3 tools/story/import_us_markets.py [--check]"""
import json, os, re, subprocess, sys
from decimal import Decimal, ROUND_HALF_UP

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_850_us_markets_buy.json'
OUT = 'src/data/us_markets_buy.js'
RATE = 32
KINDS = ('eat', 'own', 'gift')
# 貨架 id＝區域的互動點（src/us3d.js 的 usMarket；「看」的字 src/data/us_life_events.js aa287）
SHELVES = {
    'us_market': ('service', 'checkout', 'self_checkout', 'produce', 'dairy', 'deli', 'frozen', 'carts', 'aisle_cereal', 'aisle_snacks', 'aisle_drinks',
                  'aisle_canned', 'aisle_pasta', 'aisle_baking', 'aisle_household', 'aisle_personal'),
    'us_asian_market': ('asia_noodles', 'asia_sauce', 'asia_snacks', 'asia_dry', 'asia_rice', 'asia_produce', 'asia_frozen', 'asia_drinks', 'asia_checkout'),
}
LINES = {
    'us_market': ('deli_number', 'deli_staff', 'checkout_greet', 'checkout_bag', 'checkout_done', 'self_checkout', 'self_checkout_help', 'no_money', 'cart_empty', 'tp_roommate'),
    'us_asian_market': ('greet', 'greet_regular', 'checkout_done', 'satay_last', 'satay_gone', 'mooncake', 'no_money', 'closed_sunday'),
}
IDS = {
    'us_market': {
        '蘋果（一袋）': 'usm_apple', '香蕉（一串）': 'usm_banana', '牛奶（一加侖）': 'usm_milk', '蛋（十八顆）': 'usm_eggs',
        '烤雞（半隻）': 'usm_chicken', '火雞胸（一小塊，十一月才有）': 'usm_turkey', '冷凍披薩': 'usm_pizza', '冰淇淋（一桶）': 'usm_icecream',
        '早餐穀片（家庭號）': 'usm_cereal', '洋芋片（大包）': 'usm_chips', '義大利麵＋紅醬': 'usm_pasta', '吐司': 'usm_toast',
        '衛生紙（二十四捲）': 'usm_tp', '明信片和郵票（寄回臺灣）': 'usm_postcard',
    },
    'us_asian_market': {
        '臺灣的泡麵（五包）': 'usa_noodle5', '醬油': 'usa_soy', '沙茶醬（最後一罐）': 'usa_satay', '小饅頭餅乾': 'usa_mantou', '鳳梨酥（一盒）': 'usa_pineapple',
        '臺灣烏龍茶': 'usa_oolong', '乾香菇': 'usa_shiitake', '米（五磅的小袋）': 'usa_rice', '青江菜': 'usa_bokchoy', '豆腐': 'usa_tofu',
        '水餃（五十顆）': 'usa_dumpling', '鋁箔包奶茶': 'usa_milktea', '冬瓜茶': 'usa_wintermelon', '月餅（一顆，九月中到中秋）': 'usa_mooncake',
    },
}
CHANGED = []


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_us_markets：' + m)


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


def twd(usd):
    return int((Decimal(str(usd)) * RATE).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def shop(z, e):
    keys(e, z, ('name', 'shelves', 'lines'), ('notes',))
    keys(e['lines'], z + '.lines', LINES[z])
    if not isinstance(e['shelves'], dict):
        die(z + '.shelves：要是物件')
    goods, seen = [], set()
    for at, rows in e['shelves'].items():
        if at not in SHELVES[z]:
            die(f'{z}.shelves.{at}：區域沒有這個互動點（{"、".join(SHELVES[z])}）')
        if not isinstance(rows, list) or not rows:
            die(f'{z}.shelves.{at}：要是陣列、至少一樣')
        for i, r in enumerate(rows):
            w = f'{z}.shelves.{at}[{i}]'
            if not isinstance(r, list) or len(r) != 3:
                die(w + '：要是 [品名, 美金, 種類]')
            n, usd, kind = txt(r[0], w), r[1], r[2]
            if not isinstance(usd, (int, float)) or isinstance(usd, bool) or not usd > 0:
                die(w + '：美金要是正的數字')
            if kind not in KINDS:
                die(f'{w}：種類要是 {"／".join(KINDS)}（拿到 {kind}）')
            if n not in IDS[z]:
                die(f'{w}：「{n}」這支工具的 IDS 沒有（稿加了新的東西或改了品名：先在 IDS 加一個 id、看 src/us_markets3d.js 要不要接）')
            if n in seen:
                die(f'{w}：「{n}」重複')
            seen.add(n)
            goods.append({'id': IDS[z][n], 'n': n, 'usd': usd, 'p': twd(usd), 'kind': kind, 'at': at})
    gone = set(IDS[z]) - seen
    if gone:
        die(f'{z}：稿少了 {sorted(gone)}（買過的存檔還記著它的 id：先問 AA，再改 IDS）')
    lines = {k: txt(e['lines'][k], f'{z}.lines.{k}') for k in LINES[z]}
    if z == 'us_asian_market':   # 多帶一顆月餅給學姊的那一句寫在 notes 裡（「給的時候她說：「……」」）：照引號裡的字拿，找不到＝停下來
        hit = [m for n in e.get('notes', []) for m in re.findall(r'給的時候她說：「([^」]+)」', n)]
        if len(hit) != 1:
            die(f'{z}.notes：找不到「給的時候她說：「……」」那一句（找到 {len(hit)} 句）')
        lines['mooncake_give'] = txt(hit[0], z + '.notes（月餅給學姊）')
    return {'name': txt(e['name'], z + '.name'), 'goods': goods, 'lines': lines}


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
    keys(A, '稿', ('_meta', 'us_market', 'us_asian_market'))
    if '32' not in A['_meta'].get('money', ''):
        die('稿 _meta.money 沒有寫一美金算 32 元（匯率改了：先改這支工具的 RATE）')
    data = {'src': f'{PATH}@{sha}', 'rate': RATE, 'shops': {z: shop(z, A[z]) for z in ('us_market', 'us_asian_market')}}
    out = ('/* 自動產生：tools/story/import_us_markets.py（' + data['src'] + '）。不要手改，改企劃 AA_850 再重新匯入。\n'
           '   美國兩間超市買東西（US-MARKETS-BUY-1112；演出 src/us_markets3d.js）：goods＝貨架上的東西（n 品名、usd 標價、p 實際扣的錢＝usd × rate 四捨五入、\n'
           '   kind eat 帶回去吃掉／own 進「物品」／gift 可以送人、at 哪一個互動點）；lines＝店員的話和旁白。字一字照稿。*/\n\'use strict\';\nconst US_MARKETS_BUY='
           + json.dumps(data, ensure_ascii=False, indent=1) + ';\nif(typeof module!==\'undefined\') module.exports=US_MARKETS_BUY;\n')
    p = os.path.join(ROOT, OUT)
    for c in CHANGED:
        print('換名：' + c)
    n = {z: len(data['shops'][z]['goods']) for z in data['shops']}
    if '--check' in sys.argv:
        same = os.path.exists(p) and open(p, encoding='utf-8').read() == out
        print(('OK ' + why) if same else ('不一致：' + OUT))
        sys.exit(0 if same else 1)
    open(p, 'w', encoding='utf-8').write(out)
    print('寫入', OUT, why, '｜', '、'.join(f'{z} {n[z]} 樣' for z in n))


main()
