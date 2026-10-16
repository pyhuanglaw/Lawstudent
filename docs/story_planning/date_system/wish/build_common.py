# -*- coding: utf-8 -*-
"""不分地點的句子 DATE_LINES_COMMON（BB_128 3-6 的表，BB 五位）→ common_bb.json。作者：BB-B 2026-10-16（AA_140 G33）。
直接讀 BB_128 的表格，一字不改：每格「…」／「…」＝好幾套（擇一，輪流）；同一套裡連著的「…」「…」＝依序說的兩句。
欄位照 BB_128 2-9：depart 出發（她的訊息）、enough 差不多了、cancel 取消（玩家「今天不去了」）、flaked 放鴿子（30 天內第二次，FLAKED）、leaveEarly 一個都沒做就走、noPair 合照還不行。"""
import json, os, re, sys
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..'))
bb = open(os.path.join(SP, 'BB_128_校外單獨約會_心願地點與淡水示範規格.md'), encoding='utf-8').read()
part = bb[bb.index('**不分地點的句子**'):]
part = part[:part.index('\n\n- 取消不扣分')]
IDS = {'芷若': 'heroine_02', '子晴': 'heroine_04', '學姊': 'heroine_05', '沛珊': 'classmate_peishan', '可昕': 'kexin'}
KEYS = ['depart', 'enough', 'cancel', 'flaked', 'leaveEarly', 'noPair']
out = {'_comment': 'DATE_LINES_COMMON（BB_128 2-9、3-6）：BB 五位。每個 key 是好幾套，擇一、輪流（排除最近用過的）。一行 {who,text}。以安、語彤由 AA-B 另做。',
       'rules': {'cancel': '取消不扣分', 'flaked': '放鴿子照 AA_128 4-3（自在 -2，只扣一次）；只說一次，她不追問；之後的邀約回覆照 BB_123'},
       'lines': {}}
err = []
for row in part.split('\n'):
    m = re.match(r'^\| (芷若|子晴|學姊|沛珊|可昕) \|(.*)\|$', row)
    if not m: continue
    who = IDS[m.group(1)]
    cells = [c.strip() for c in m.group(2).split('|')]
    if len(cells) != 6: err.append(f'{who} 欄數 {len(cells)}'); continue
    d = {}
    for k, c in zip(KEYS, cells):
        if c.startswith('（') and who == 'kexin' and k == 'noPair':
            q = re.findall(r'「([^「」]+)」', c)
            d[k] = [{'if': {'flags': ['EX_kexin']}, 'note': '交往中一定可以合照；分開以後才說這句', 'lines': [{'who': who, 'text': t} for t in q]}]
            continue
        sets = [s for s in re.split(r'(?<=」)／(?=「)', c)]
        d[k] = [{'lines': [{'who': who, 'text': t} for t in re.findall(r'「([^「」]+)」', s)]} for s in sets]
        joined = ''.join('「' + l['text'] + '」' for s in d[k] for l in s['lines'])
        if joined.replace('／', '') != c.replace('／', ''): err.append(f'{who} {k} 轉換後和原文不同：{c}')
    out['lines'][who] = d
want = {'depart': 3, 'enough': 2, 'cancel': 2, 'flaked': 1, 'leaveEarly': 1, 'noPair': 1}
for who in IDS.values():
    if who not in out['lines']: err.append(f'缺 {who}'); continue
    for k, n in want.items():
        if len(out['lines'][who][k]) != n: err.append(f'{who} {k} 應該 {n} 套，有 {len(out["lines"][who][k])}')
if err: sys.exit('\n'.join(err))
json.dump(out, open(os.path.join(HERE, 'common_bb.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('common_bb.json ok：五位 × 六種')
