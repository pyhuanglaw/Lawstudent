# -*- coding: utf-8 -*-
"""以安、語彤的心願事件（AA_127 第 1、2 節）：wish_aa.py → wish_aa.json＋檢查。AA-B 2026-10-16（AA_140 G33）。檢查照 BB-B 的 build_wish.py：
1. AA_127 1-1～1-5、2-1～2-5 原文的每一句台詞都在 JSON 裡（一字不改）。
2. 每一行 ≤60 字；選項 ≤3。
3. 互動點、喜好和 date_system/lines/<LOC>.json 一致；她在地點檔的 first 指到這個事件。
4. 沒有真實店名、品牌（D77）。
用法：python3 -I build_wish_aa.py"""
import json, os, re, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..'))
def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
src = load(os.path.join(HERE, 'wish_aa.py'), 'wish_aa')
sys.argv = [sys.argv[0]]
BRANDS = load(os.path.join(SP, 'date_system', 'lines', 'build_lines.py'), 'build_lines').BRANDS
NAMES = {'heroine_01': '以安', 'heroine_03': '語彤'}
SEC = {'heroine_01': ('## 1. ', '### 1-6'), 'heroine_03': ('## 2. ', '### 2-6')}
def line(who, s):
    if s.startswith('＊'): return {'who': 'narr', 'text': s[1:]}
    if s.startswith('※'): return {'who': 'note', 'text': s[1:]}
    return {'who': who, 'text': s}
LINE_KEYS = {'lines', 'reply', 'accept', 'decline', 'known', 'unknown', 'after'}
def conv(o, who):
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            if k in LINE_KEYS and isinstance(v, list) and all(isinstance(x, str) for x in v): out[k] = [line(who, x) for x in v]
            elif k == 'replace' and isinstance(v, dict): out[k] = {kk: [line(who, x) for x in vv] for kk, vv in v.items()}
            else: out[k] = conv(v, who)
        return out
    if isinstance(o, list): return [conv(x, who) for x in o]
    return o
err = []
out = {'_comment': '以安、語彤的心願事件（AA_127 第 1、2 節）。原稿 wish_aa.py，欄位說明 README.md（和 wish_bb.json 同一個格式；AA 另外用到的 key 寫在 README 最後）。', 'events': {}}
for who in src.ORDER:
    ev = dict(src.W[who]); ev['char'] = who; out['events'][who] = conv(ev, who)
aa127 = open(os.path.join(SP, 'AA_127_以安語彤_心願約會與邀約變化.md'), encoding='utf-8').read()
def norm(t): return re.sub(r'[\s　]', '', t)
for who in src.ORDER:
    a, b = SEC[who]; i = aa127.index(a); sec = aa127[i:aa127.index(b, i)]
    js = norm(json.dumps(out['events'][who], ensure_ascii=False))
    quotes = set()
    for m in re.finditer(r'^> ' + NAMES[who] + r'：(.+)$', sec, re.M): quotes.add(m.group(1))
    for m in re.finditer(r'^> （(.+)）$', sec, re.M): quotes.add(m.group(1))
    for m in re.finditer(r'「([^「」]+)」', sec): quotes.add(m.group(1))
    for q in quotes:
        if q in ('她喜歡的', '普通'): continue   # 偏好的說明，不是台詞
        q = re.sub(r'【[^】]*】', '', q)       # 【需查證】是給開發的註記
        q2 = norm(q.replace('『', '「').replace('』', '」'))
        for p in [p for p in re.split(r'[（）]', q2) if p]:
            p3 = p.replace('「', '『').replace('」', '』')
            if p not in js and p3 not in js:
                err.append(f'{who} 原文沒有轉進去：{q}'); break
def walk(o, path):
    if isinstance(o, dict):
        if isinstance(o.get('text'), str) and o.get('who') != 'note' and len(o['text']) > 60: err.append(f'{path} 太長：{o["text"]}')
        if 'choices' in o and len(o['choices']) > 3: err.append(f'{path} 選項超過 3')
        for k, v in o.items(): walk(v, path + '.' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, f'{path}[{i}]')
walk(out, 'wish')
for who in src.ORDER:
    ev = out['events'][who]; loc = ev['loc']
    lj = json.load(open(os.path.join(SP, 'date_system', 'lines', loc + '.json'), encoding='utf-8'))
    if set(lj['points']) != set(ev['hotspots']): err.append(f'{who} 互動點和 {loc}.json 不一樣')
    L = lj['lines'][who]
    firsts = [L['arrive'].get('first', {}), L['closing'].get('first', {})] + [h.get('first', {}) for h in L['hotspots'].values()]
    for f in firsts:
        if (f or {}).get('wishEvent') != ev['id']: err.append(f'{who} {loc}.json 的 first 沒有指到 {ev["id"]}：{f}')
    for p, h in ev['hotspots'].items():
        want = lj['likes'][who].get(p)
        if want and h.get('like') != want: err.append(f'{who} {p} 喜好和 {loc}.json 不一樣：{h.get("like")} vs {want}')
def texts(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('text', 't') and isinstance(v, str): yield v
            else: yield from texts(v)
    elif isinstance(o, list):
        for v in o: yield from texts(v)
alltext = '\n'.join(texts(out['events']))
for b in BRANDS:
    if b in alltext: err.append(f'台詞有真實店名或品牌（D77）：{b}')
if err: sys.exit('\n'.join(err))
json.dump(out, open(os.path.join(HERE, 'wish_aa.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('wish_aa.json ok：兩個心願事件，%d 行' % len(re.findall(r'"text"', json.dumps(out, ensure_ascii=False))))
