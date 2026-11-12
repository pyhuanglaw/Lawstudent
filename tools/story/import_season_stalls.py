#!/usr/bin/env python3
"""SEASON3-LINES-1111（季節攤販六攤能看、能買；季節落地布置五項能看）：把 AA 的稿匯進 src/data/season_stalls.js（SEASON_STALLS）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_793_season3_stalls.json
- stalls.<key>：格式同夜市稿 AA_752（name、look、closed、greet、items[{id, name, price, buy[]}]、hours）；
  另外認得 noVendor（沒有攤販：greet 可以是空的）、note（紀錄）。
- looks.<id>：季節落地布置「看」的一句；looksFruit.<水果>：當季水果那一箱的一句。

**名字、品名、價錢、台詞一字照稿**（只過 import_guard.read_fix 的換名；換到了會印出來）。讀字、讀鐘點的函式用夜市那一支的（import_night_market.py）。
這支工具另外算一樣給程式用的（從稿上的字讀出來，不是另外定的）：
- open＝{from, to}（鐘點，從 hours 最後面的「15:00～22:00」讀；前面的日期照 src/data/season_deco.js 的規則，這裡不讀）
稿上有工具不認得的欄位、hours 寫法換了＝停下來（先改這支工具和 src/season_stalls3d.js），不會默默丟掉。

哪一攤、哪一項對到 src/data/season_deco.js 的哪個位置、怎麼演：src/season_stalls3d.js。測試 tests/season3_lines_1112_unit.js。

用法：python3 tools/story/import_season_stalls.py [--check]"""
import json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG
import import_night_market as NMI

PATH = 'docs/story_planning/AA_793_season3_stalls.json'
OUT = 'src/data/season_stalls.js'
STALL_KEYS = {'name', 'look', 'closed', 'greet', 'items', 'hours', 'noVendor', 'note'}
FRUITS = ['loquat', 'mango', 'pomelo', 'ponkan', 'strawberry']   # src/season_stalls3d.js 的 FRUIT 認得的


def die(m):
    raise SystemExit('import_season_stalls：' + m)


def stall(key, e):
    where = f'stalls.{key}'
    if not re.fullmatch(r'sea_[a-z_]+', key):
        die(f'{where}：key 不對')
    if set(e) - STALL_KEYS:
        die(f'{where}：不認得的欄位 {sorted(set(e) - STALL_KEYS)}')
    r = {'name': NMI.txt(e.get('name'), where + '.name')}
    if 'noVendor' in e:
        if e['noVendor'] is not True:
            die(f'{where}.noVendor：只認得 true')
        r['noVendor'] = True
    r['look'] = NMI.txts(e.get('look'), where + '.look')
    r['closed'] = NMI.txt(e.get('closed'), where + '.closed')
    if e.get('greet') == [] and r.get('noVendor'):
        r['greet'] = []
    else:
        r['greet'] = NMI.txts(e.get('greet'), where + '.greet')
    items, ids = [], set()
    if not isinstance(e.get('items'), list) or not e['items']:
        die(f'{where}.items：至少一樣')
    for i, it in enumerate(e['items']):
        w = f'{where}.items[{i}]'
        if set(it) != {'id', 'name', 'price', 'buy'}:
            die(f'{w}：欄位要剛好是 id、name、price、buy（{sorted(it)}）')
        if not re.fullmatch(r'sea_[a-z_]+', str(it['id'])) or it['id'] in ids:
            die(f'{w}：id 不對或重複（{it["id"]}）')
        ids.add(it['id'])
        if not isinstance(it['price'], int) or isinstance(it['price'], bool) or it['price'] <= 0:
            die(f'{w}：price 要是正整數')
        items.append({'id': it['id'], 'name': NMI.txt(it['name'], w + '.name'), 'price': it['price'], 'buy': NMI.txts(it['buy'], w + '.buy')})
    r['items'] = items
    r['hours'] = NMI.txt(e.get('hours'), where + '.hours')
    m = re.fullmatch(r'.+ (\d{1,2}:\d{2}～\d{1,2}:\d{2})', e['hours'])
    if not m:
        die(f'{where}.hours：不認得的營業時間（{e["hours"]}）')
    r['open'] = NMI.span(m.group(1), where + '.hours')
    if 'note' in e:
        r['note'] = NMI.txt(e['note'], where + '.note')
    return r


def build(d):
    if set(d) != {'_meta', 'stalls', 'looks', 'looksFruit'}:
        die(f'最上層的欄位改了（{sorted(d)}）')
    S = {k: stall(k, d['stalls'][k]) for k in d['stalls']}
    if not S:
        die('stalls 是空的')
    # 2026-11-12（AA_793@58c5c2c1bb）：looks.<id> 可以是「照季節各一句」的物件（花序門口的花：spring／may／summer／autumn／winter；note 是給人看的說明，不匯）
    def look(v, w):
        if isinstance(v, dict):
            o = {k: NMI.txt(v[k], f'{w}.{k}') for k in v if k != 'note'}
            if 'spring' not in o: die(f'{w}：照季節的物件要有 spring（沒有對到的季節用它）')
            return o
        return NMI.txt(v, w)
    L = {k: look(d['looks'][k], f'looks.{k}') for k in d['looks']}
    if sorted(d['looksFruit']) != sorted(FRUITS):
        die(f'looksFruit 要剛好是 {FRUITS}（{sorted(d["looksFruit"])}）；水果換了先改這支工具和 src/season_stalls3d.js 的 FRUIT')
    F = {k: NMI.txt(d['looksFruit'][k], f'looksFruit.{k}') for k in d['looksFruit']}
    if 'sea_fruit' not in L:
        die('有 looksFruit 卻沒有 looks.sea_fruit')
    return {'stalls': S, 'looks': L, 'looksFruit': F}


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
    data.update(build(json.loads(NMI.git('show', f'{sha}:{PATH}'))))
    js = ('/* 自動產生：tools/story/import_season_stalls.py（' + data['src'] + '）。不要手改，改企劃稿再重新匯入。\n'
          '   季節攤販六攤的看、買＋季節落地布置的看（SEASON3-LINES-1111）：名字、品名、價錢、台詞一字照 AA_793；open 是從稿上的 hours 讀出來的。\n'
          '   對到 src/data/season_deco.js 的哪一攤、哪一項、怎麼演：src/season_stalls3d.js */\n'
          "'use strict';\nconst SEASON_STALLS=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    n = sum(len(v['items']) for v in data['stalls'].values())
    print('寫入', OUT, f'攤 {len(data["stalls"])}、品項 {n}、看 {len(data["looks"])}、水果 {len(data["looksFruit"])}；{why}')
    for c in NMI.CHANGED:
        print('  換名（import_guard.read_fix）', c)


if __name__ == '__main__':
    main()
