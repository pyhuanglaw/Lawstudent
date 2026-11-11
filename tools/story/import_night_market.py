#!/usr/bin/env python3
"""NIGHT-MARKET-1110（使用者 X326：夜市十攤能看、能買）：把 AA 的夜市稿匯進 src/data/night_market.js（NIGHT_MARKET）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_752_night_market.json
- stalls.s01～s10：name（店名，使用者定的）、look（營業中按「看」的旁白）、closed（收攤後）、greet（老闆隨機一句）、
  items[{id, name, price, buy[]}]、hours；s10 另有 lookSummer／lookWinter、greetSummer／greetWinter。
- background.b12～b14：sign、look、closed（只有看，不能買）。
- hoursNote、seasonNote 照抄（紀錄）。

**店名、品名、價錢、台詞一字照稿**（只過 import_guard.read_fix 的換名；這份稿目前一個字都不會被換，換到了會印出來）。
這支工具另外算兩樣給程式用的（從稿上的字讀出來，不是另外定的）：
- open＝{from, to}（鐘點，從 hours「17:00～24:00」讀；s10「夏天 14:00～23:00；其他月份 17:00～23:00」→ open＋openSummer）
- season＝{summer:[月…], winter:[月…]}（從 seasonNote「夏天＝5～9 月」「冬天＝11～2 月」讀）
稿上有工具不認得的欄位、hours 寫法換了＝停下來（先改這支工具和 src/night_market3d.js），不會默默丟掉。

哪一攤對到配置（src/data/tingzhou_layout.js）的哪個 kind、怎麼演：src/night_market3d.js。測試 tests/night_market_unit.js。

用法：python3 tools/story/import_night_market.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_752_night_market.json'
OUT = 'src/data/night_market.js'
STALL_KEYS = {'name', 'look', 'closed', 'greet', 'items', 'hours', 'lookSummer', 'lookWinter', 'greetSummer', 'greetWinter'}
CHANGED = []


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_night_market：' + m)


def txt(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def txts(a, where):
    if not isinstance(a, list) or not a:
        die(f'{where}：要是陣列、至少一句')
    return [txt(x, f'{where}[{i}]') for i, x in enumerate(a)]


def clock(s, where):
    m = re.fullmatch(r'(\d{1,2}):(\d{2})', s)
    if not m or int(m.group(1)) > 24 or int(m.group(2)) > 59:
        die(f'{where}：不認得的時間（{s}）')
    return round(int(m.group(1)) + int(m.group(2)) / 60, 4)


def span(s, where):
    m = re.fullmatch(r'(\d{1,2}:\d{2})～(\d{1,2}:\d{2})', s.strip())
    if not m:
        die(f'{where}：不認得的營業時間（{s}）')
    a, b = clock(m.group(1), where), clock(m.group(2), where)
    if b <= a:
        die(f'{where}：收攤比開攤早（{s}）；跨午夜的寫法這支工具還不認得')
    return {'from': a, 'to': b}


def hours(s, where):
    """→ (open, openSummer 或 None)。認得：「A～B」「A～B（備註）」「夏天 A～B；其他月份 C～D」"""
    if not isinstance(s, str):
        die(f'{where}：hours 要是字')
    m = re.fullmatch(r'夏天 ([\d:～]+)；其他月份 ([\d:～]+)', s)
    if m:
        return span(m.group(2), where), span(m.group(1), where)
    return span(re.sub(r'（[^（）]*）$', '', s), where), None


def months(note, word, where):
    m = re.search(word + r'＝(\d{1,2})～(\d{1,2}) 月', note or '')
    if not m:
        die(f'{where}：seasonNote 找不到「{word}＝幾～幾 月」，先改這支工具')
    a, b = int(m.group(1)), int(m.group(2))
    out, k = [], a
    while True:
        out.append(k)
        if k == b:
            return out
        k = k % 12 + 1
        if len(out) > 12:
            die(f'{where}：月份讀不出來')


def stall(key, e):
    where = f'stalls.{key}'
    if set(e) - STALL_KEYS:
        die(f'{where}：不認得的欄位 {sorted(set(e) - STALL_KEYS)}')
    r = {'name': txt(e.get('name'), where + '.name'), 'look': txts(e.get('look'), where + '.look')}
    for k in ('lookSummer', 'lookWinter'):
        if k in e:
            r[k] = txt(e[k], f'{where}.{k}')
    r['closed'] = txt(e.get('closed'), where + '.closed')
    r['greet'] = txts(e.get('greet'), where + '.greet')
    for k in ('greetSummer', 'greetWinter'):
        if k in e:
            r[k] = txts(e[k], f'{where}.{k}')
    items, ids = [], set()
    if not isinstance(e.get('items'), list) or not e['items']:
        die(f'{where}.items：至少一樣')
    for i, it in enumerate(e['items']):
        w = f'{where}.items[{i}]'
        if set(it) != {'id', 'name', 'price', 'buy'}:
            die(f'{w}：欄位要剛好是 id、name、price、buy（{sorted(it)}）')
        if not re.fullmatch(r'nm\d\d_[a-z_]+', str(it['id'])) or it['id'] in ids:
            die(f'{w}：id 不對或重複（{it["id"]}）')
        ids.add(it['id'])
        if not isinstance(it['price'], int) or isinstance(it['price'], bool) or it['price'] <= 0:
            die(f'{w}：price 要是正整數')
        items.append({'id': it['id'], 'name': txt(it['name'], w + '.name'), 'price': it['price'], 'buy': txts(it['buy'], w + '.buy')})
    r['items'] = items
    r['hours'] = txt(e.get('hours'), where + '.hours')
    op, summer = hours(e['hours'], where + '.hours')
    r['open'] = op
    if summer:
        r['openSummer'] = summer
    return r


def build(d):
    if set(d) != {'_meta', 'stalls', 'background', 'hoursNote', 'seasonNote'}:
        die(f'最上層的欄位改了（{sorted(d)}）')
    S = {k: stall(k, d['stalls'][k]) for k in sorted(d['stalls'])}
    if list(S) != ['s%02d' % i for i in range(1, 11)]:
        die(f'stalls 要剛好是 s01～s10（{list(S)}）')
    B = {}
    for k in sorted(d['background']):
        e, w = d['background'][k], f'background.{k}'
        if set(e) != {'sign', 'look', 'closed'}:
            die(f'{w}：欄位要剛好是 sign、look、closed')
        B[k] = {'sign': txt(e['sign'], w + '.sign'), 'look': txt(e['look'], w + '.look'), 'closed': txt(e['closed'], w + '.closed')}
    if list(B) != ['b12', 'b13', 'b14']:
        die(f'background 要剛好是 b12～b14（{list(B)}）')
    note = d['seasonNote']
    return {'stalls': S, 'background': B,
            'season': {'summer': months(note, '夏天', 'seasonNote'), 'winter': months(note, '冬天', 'seasonNote')},
            'hoursNote': d['hoursNote'], 'seasonNote': note}


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
    js = ('/* 自動產生：tools/story/import_night_market.py（' + data['src'] + '）。不要手改，改企劃稿再重新匯入。\n'
          '   夜市十攤＋背景三攤的看、買（NIGHT-MARKET-1110，使用者 X326）：店名、品名、價錢、台詞一字照 AA_752；open／openSummer、season 是從稿上的 hours、seasonNote 讀出來的。\n'
          '   對到配置的哪一攤、怎麼演：src/night_market3d.js */\n'
          "'use strict';\nconst NIGHT_MARKET=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和來源不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    n = sum(len(v['items']) for v in data['stalls'].values())
    print('寫入', OUT, f'十攤 {len(data["stalls"])}、品項 {n}、背景攤 {len(data["background"])}；{why}')
    for c in CHANGED:
        print('  換名（import_guard.read_fix）', c)


if __name__ == '__main__':
    main()
