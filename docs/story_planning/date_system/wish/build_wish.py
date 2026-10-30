# -*- coding: utf-8 -*-
"""心願事件（BB_128 第 3 節）：wish_bb.py → wish_bb.json＋檢查。作者：BB-B 2026-10-16（AA_140 G33）。
用法：python3 build_wish.py
檢查：
1. BB_128 3-1～3-5 原文裡的每一句台詞（「…」、> 名字：…、> （旁白））都在 JSON 裡（一字不改；只允許拆成好幾行）。
2. 每一行 ≤60 字；每個互動點、收尾的選項 ≤3。
3. 互動點和地點檔 date_system/lines/<LOC>.json 一致（四個 id 相同），她在地點檔的 first 指到這個心願事件。
4. 台詞沒有真實店名、品牌（D77；清單和 build_lines.py 共用）。"""
import json, os, re, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..'))
def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
src = load(os.path.join(HERE, 'wish_bb.py'), 'wish_bb')
sys.argv = [sys.argv[0]]
lines_mod = load(os.path.join(SP, 'date_system', 'lines', 'build_lines.py'), 'build_lines')
BRANDS = lines_mod.BRANDS
NAMES = {'heroine_02': '芷若', 'heroine_04': '子晴', 'heroine_05': '溫學姊', 'classmate_peishan': '沛珊', 'kexin': '可昕'}
SEC = {'heroine_02': '3-1', 'heroine_04': '3-2', 'heroine_05': '3-3', 'classmate_peishan': '3-4', 'kexin': '3-5'}

def line(who, s):
    if s.startswith('＊'): return {'who': 'narr', 'text': s[1:]}
    if s.startswith('※'): return {'who': 'note', 'text': s[1:]}
    return {'who': who, 'text': s}

LINE_KEYS = {'lines', 'reply', 'accept', 'decline', 'known', 'unknown'}
def conv(o, who):
    if isinstance(o, dict):
        out = {}
        for k, v in o.items():
            if k in LINE_KEYS and isinstance(v, list) and all(isinstance(x, str) for x in v):
                out[k] = [line(who, x) for x in v]
            else:
                out[k] = conv(v, who)
        return out
    if isinstance(o, list): return [conv(x, who) for x in o]
    return o

err = []
out = {'_comment': 'BB 五位的心願事件（BB_128 第 3 節）。原稿 wish_bb.py，欄位說明 README.md。第 5 階＝AA_126 4-1 的階段（1～6）；datingHer＝她就是祐廷的女友。',
       'events': {}}
for who in src.ORDER:
    ev = dict(src.W[who]); ev['char'] = who
    out['events'][who] = conv(ev, who)

# 1. 原文的每一句都在
bb128 = open(os.path.join(SP, 'BB_128_校外單獨約會_心願地點與淡水示範規格.md'), encoding='utf-8').read()
def section(sec):
    a = bb128.index('### ' + sec + '. ')
    b = bb128.index('\n### ', a + 5)
    return bb128[a:b]
def norm(t): return re.sub(r'[\s　]', '', t)
for who in src.ORDER:
    sec = section(SEC[who])
    sec = sec.split('**底圖（給 AI 的描述')[0]   # 底圖描述不是台詞
    sec = sec.split('**再去 D')[0]               # 再去的台詞在地點檔
    sec = re.sub(r'^\*\*她的心願\*\*.*$', '', sec, flags=re.M)   # 心願說明（寫在 wish 欄位的摘要），不是台詞
    sec = re.sub(r'^  - 大三下 K18.*$', '', sec, flags=re.M)   # K18、大四下春假的回聲在 BB_98 9-13、BB_99 9-15（已改）
    sec = re.sub(r'^> \*\*（2026-10-21 AA-C，`AA_349` K3.*$', '', sec, flags=re.M)   # 沛珊大三起的台南版在 src/data/hometown_lines.js（AA_349 K3），不在 wish_bb（2026-10-23 AA-B）
    js = norm(json.dumps(out['events'][who], ensure_ascii=False))
    quotes = set()
    for m in re.finditer(r'^> ' + re.escape(NAMES[who]) + r'：(.+)$', sec, re.M): quotes.add(m.group(1))
    for m in re.finditer(r'^> （(.+)）$', sec, re.M): quotes.add(m.group(1))
    for m in re.finditer(r'「([^「」]+)」', sec): quotes.add(m.group(1))
    for q in quotes:
        q2 = norm(q.replace('『', '「').replace('』', '」'))
        parts = [p for p in re.split(r'[（）]', q2) if p]
        for p in parts:
            p3 = p.replace('「', '『').replace('」', '』')
            if p not in js and p3 not in js and norm(p) not in js:
                err.append(f'{who} 原文沒有轉進去：{q}')
                break

# 2. 長度、選項數
def walk(o, path):
    if isinstance(o, dict):
        if 'text' in o and isinstance(o['text'], str) and o.get('who') != 'note' and len(o['text']) > 60: err.append(f'{path} 太長：{o["text"]}')
        if 'choices' in o and len(o['choices']) > 3: err.append(f'{path} 選項超過 3')
        for k, v in o.items(): walk(v, path + '.' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, f'{path}[{i}]')
walk(out, 'wish')

# 3. 和地點檔一致
for who in src.ORDER:
    ev = out['events'][who]; loc = ev['loc']
    lj = json.load(open(os.path.join(SP, 'date_system', 'lines', loc + '.json'), encoding='utf-8'))
    if set(lj['points']) != set(ev['hotspots']): err.append(f'{who} 互動點和 {loc}.json 不一樣：{sorted(lj["points"])} vs {sorted(ev["hotspots"])}')
    L = lj['lines'][who]
    firsts = [L['arrive']['first'], L['closing']['first']] + [h['first'] for h in L['hotspots'].values()]
    for f in firsts:
        if f.get('wishEvent') != ev['id']: err.append(f'{who} {loc}.json 的 first 沒有指到 {ev["id"]}：{f}')
    for p, h in ev['hotspots'].items():
        want = lj['likes'][who].get(p)
        if want and h.get('like') != want: err.append(f'{who} {p} 喜好和 {loc}.json 不一樣：{h.get("like")} vs {want}')

# 4. 品牌
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
json.dump(out, open(os.path.join(HERE, 'wish_bb.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
n = len(re.findall(r'"text"', json.dumps(out, ensure_ascii=False)))
print(f'wish_bb.json ok：五個心願事件，{n} 行')
