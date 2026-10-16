# -*- coding: utf-8 -*-
"""BB 五位的心願約會事件（BB_128 第 3 節 3-1～3-5）→ wish_<id>.json，格式照 AA-B 的 README（learn／invite／arrive／hotspots／likes／closing）。
作者：BB-B 2026-10-16（AA_140 G33）。原稿 wish_bb.py（照 BB_128 一字不改，只拆成資料）。
用法：python3 -I build_wish_bb.py → wish_heroine_02.json、wish_heroine_04.json、wish_heroine_05.json、wish_classmate_peishan.json、wish_kexin.json
檢查：
1. BB_128 3-1～3-5 原文的每一句台詞（「…」、> 名字：…、> （旁白））都在輸出裡（只允許拆句）。
2. 每句 40 字以內、選項 20 字以內（和 build_wish_aa.py 一樣）。
3. 互動點、喜好和地點檔 lines/<LOC>.json 一致；她在地點檔的 first 是 {"wishEvent":"wish/wish_<id>.json…"}。
4. 沒有真實店名、品牌（D77，清單和 lines/build_lines.py 共用）。"""
import json, os, re, sys, importlib.util
HERE = os.path.dirname(os.path.abspath(__file__))
SP = os.path.abspath(os.path.join(HERE, '..', '..'))
def load(path, name):
    spec = importlib.util.spec_from_file_location(name, path); m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
src = load(os.path.join(HERE, 'wish_bb.py'), 'wish_bb')
_argv = sys.argv; sys.argv = [sys.argv[0]]
BRANDS = load(os.path.join(SP, 'date_system', 'lines', 'build_lines.py'), 'build_lines').BRANDS
sys.argv = _argv
NAMES = {'heroine_02': '芷若', 'heroine_04': '子晴', 'heroine_05': '溫學姊', 'classmate_peishan': '沛珊', 'kexin': '可昕'}
SEC = {'heroine_02': '3-1', 'heroine_04': '3-2', 'heroine_05': '3-3', 'classmate_peishan': '3-4', 'kexin': '3-5'}
TERM = {'Y1S1': '大一上', 'Y1S2': '大一下', 'Y2S1': '大二上', 'Y2S2': '大二下', 'Y3S1': '大三上', 'Y3S2': '大三下', 'Y4S1': '大四上', 'Y4S2': '大四下'}
EVN = {'ev_zhiruo_third_row': 'Z11b 倒數第三排以後（ev_zhiruo_third_row，還沒實作，id 由 LAWWW-B 定）',
       'ev_sis_empty_flask': 'W4 空的保溫瓶以後（ev_sis_empty_flask）',
       'ev_peishan_syllogism': 'P2b 溫州街的三段論以後（ev_peishan_syllogism）',
       'ev_kexin_trip_spring_y1': 'K8 春假旅行以後（ev_kexin_trip_spring_y1）',
       'ev_kexin_k18': 'K18 以後（ev_kexin_k18）'}
FLG = {'ATTENDED_SHOW': 'Q12 發表會以後（ATTENDED_SHOW）', 'SIS_HEALED': '分手、SIS_HEALED 以後',
       'SIS_BEEN_US': '她去過美國以後（暫名 SIS_BEEN_US）', 'EX_kexin': '和她分開過、重新追她（EX_kexin）',
       'KX_TRIP_DEFERRED_DONE': 'K8 延到暑假那一趟走完以後（暫名 KX_TRIP_DEFERRED_DONE）'}

def cs(c):
    """條件 → 說明字串（AA 格式的 if 是字串；旗標、事件 id 寫在括號裡給 LAWWW-B）。"""
    if not c: return 'all'
    out = []
    for k, v in c.items():
        if k == 'dateStage':
            lo, hi = v.get('min'), v.get('max')
            out.append(f'第 {lo} 階' if lo == hi else (f'第 {lo} 階以上' if lo else f'第 {hi} 階以下'))
        elif k == 'datingHer': out.append('交往中' if v else '單身（不是她的男友）')
        elif k == 'events': out += [EVN.get(e, e) for e in v]
        elif k == 'flags': out += [FLG.get(f, f) for f in v]
        elif k == 'memory': out += ['Z5 兩個人看過《東京物語》（記憶 WATCHED_FILM）' if m['tag'] == 'WATCHED_FILM' else m['tag'] for m in v]
        elif k == 'flagIs': out += ['K8 選了海邊（KX_TRIP_Y1S2=sea）' if kk == 'KX_TRIP_Y1S2' else f'{kk}={vv}' for kk, vv in v.items()]
        elif k == 'term': out.append('、'.join(TERM[t] for t in v))
        elif k == 'termFrom': out.append(TERM[v] + '以後')
        elif k == 'any': out.append('或'.join(cs(x) for x in v))
        elif k == 'unless': out.append('還沒有：' + cs(v))
        else: out.append(f'{k}={v}')
    return '，'.join(out)

def L(who, xs):
    out = []
    for x in xs:
        if x.startswith('＊'):
            t = x[1:]
            if t.startswith('（') and t.endswith('）'): t = t[1:-1]   # 旁白不加括號（和 AA 的寫法一致）
            out.append({'who': 'narr', 'text': t})
        elif x.startswith('※'): out.append({'who': 'note', 'text': x[1:]})
        else: out.append({'who': who, 'text': x})
    return out

def split40(lines):
    """超過 40 字的旁白在句號後拆開（只拆，不改字）。"""
    out = []
    for l in lines:
        t = l['text']
        if l['who'] != 'note' and len(t) > 40:
            parts = [p for p in re.split(r'(?<=。)', t) if p]
            buf = ''
            for p in parts:
                if len(buf + p) > 40 and buf: out.append({'who': l['who'], 'text': buf}); buf = p
                else: buf += p
            if buf: out.append({'who': l['who'], 'text': buf})
        else: out.append(l)
    return out

def choice(who, c):
    o = {'t': c['t'], 'reply': split40(L(who, c['reply']))}
    if 'if' in c: o['if'] = cs(c['if'])
    if c.get('note'): o['note'] = c['note']
    for k in ('cost', 'extra'):
        if k in c: o[k] = c[k]
    for k in ('replyIf', 'extraIf'):
        if k in c:
            o[k] = []
            for r in c[k]:
                cond = r.get('if') or {kk: r[kk] for kk in ('term', 'termFrom') if kk in r}
                o[k].append({'if': cs(cond) + (f'（{r["note"]}）' if r.get('note') else ''), 'reply': L(who, r['reply'])})
    return o

def rel_key(who, c):
    if c.get('flags') == ['EX_kexin']: return 'ex'
    if c.get('datingHer') is True: return 'dating_afterQ12' if c.get('flags') == ['ATTENDED_SHOW'] else 'dating'
    if c.get('datingHer') is False: return 'stage6_single'
    return 'dating' if who == 'kexin' else 'stage5'   # 可昕一開始就是女友：預設是交往中

def build(who):
    w = src.W[who]
    o = {'id': w['id'], 'heroine': who, 'loc': w['loc'], 'title': w['title'], 'source': w['source'],
         '_note': w['wish'] + (' ' + w['rule'] if w.get('rule') else '') + f' 第一次和她單獨來 {w["loc"]}＝這個事件（不管哪一年）；之後再來用 lines/{w["loc"]}.json。'}
    m = w['mention']
    cond = {}
    if 'dateStage' in m['if']: cond['stageMin'] = m['if']['dateStage']['min']
    rest = {k: v for k, v in m['if'].items() if k != 'dateStage'}
    if rest: cond['after'] = cs(rest)
    cond['where'] = m['where'] + '，一次'
    if m.get('abroadBlock'): cond['notWhen'] = ['她在國外']
    if m.get('context'): cond['context'] = m['context']
    if m.get('note'): cond['note'] = m['note']
    o['learn'] = {'cond': cond, 'set': 'wishKnown', 'versions': [{'if': 'all', 'lines': L(who, m['lines']), 'choice': [choice(who, c) for c in m['choices']]}]}
    h = w['herInvite']
    cond = {}
    if 'dateStage' in h['if']: cond['stageMin'] = h['if']['dateStage']['min']
    rest = {k: v for k, v in h['if'].items() if k != 'dateStage'}
    if rest: cond['after'] = cs(rest)
    notWhen = ['考試週']
    if h.get('abroadBlock'): notWhen.insert(0, '她在國外')
    if h.get('noBreaks'): notWhen.append('寒暑假')
    cond['notWhen'] = notWhen
    if h.get('message'): cond['msgTime'] = '週' + '或週'.join('日一二三四五六'[d] for d in h['message']['weekday']) + f' {int(h["message"]["time"][0])}:{int(round(h["message"]["time"][0] % 1 * 60)):02d} 以後'
    cond['date'] = '週' + '或週'.join('日一二三四五六'[d] for d in h['dateWeekday']) + f' {int(h["dateTime"])}:{int(round(h["dateTime"] % 1 * 60)):02d}'
    cond['perTerm'] = 1; cond['cooldownWeeks'] = 4; cond['rule'] = h['rule']
    if h.get('note'): cond['note'] = h['note']
    inv = {'cond': cond, 'msg': L(who, h['lines'])}
    if h.get('linesIf'): inv['msgIf'] = [{'if': cs({k: r[k] for k in ('term',) if k in r}) + f'（{r["note"]}）', 'msg': L(who, r['lines'])} for r in h['linesIf']]
    acc = L(who, h['accept'])
    if h.get('transportLine'): acc += [{'who': 'note', 'text': '交通她選火車'}, {'who': who, 'text': h['transportLine']}]
    inv['accept'] = acc + [{'who': 'note', 'text': '建立行程 by:her、wish:true'}]
    inv['decline'] = L(who, h['decline']) + [{'who': 'note', 'text': '不扣分、不鎖線；至少隔 4 週才可能再問'}]
    p = w['playerInvite']
    pi = {'known': L(who, p['known']), 'unknown': L(who, p['unknown']) + [{'who': 'note', 'text': '這一次也算完成心願'}]}
    if p.get('if'): pi['if'] = cs(p['if'])
    if p.get('retakeTerm'): pi['retake'] = {'if': TERM[p['retakeTerm']['term']] + '（重考中）', 'lines': L(who, [p['retakeTerm']['line']]), 'note': p['retakeTerm']['note']}
    inv['playerInvite'] = pi
    o['invite'] = inv
    a = w['arrive']
    ar = {'lines': [{'who': 'narr', 'text': a['narr'] + ('' if a['narr'].endswith('。') else '。')}] + L(who, a['lines']), 'byRel': {}}
    for e in a.get('extraIf', []):
        c = e['if']
        if 'datingHer' in c: ar['byRel'][rel_key(who, c)] = L(who, e['lines'])
        else: ar.setdefault('extraIf', []).append({'if': cs(c) + (f'（{e["note"]}）' if e.get('note') else ''), 'lines': L(who, e['lines'])})
    if not ar['byRel']: del ar['byRel']
    if a.get('admission'): ar['admission'] = True
    o['arrive'] = ar
    if w.get('fixed'):
        f = w['fixed']; o['fixed'] = {'id': f['id'], 'name': f['name'], 'minutes': f['minutes'], 'note': f['note'], 'lines': L(who, f['lines'])}
    o['hotspots'] = {}; o['likes'] = {}
    for pid, hs in w['hotspots'].items():
        o['hotspots'][pid] = {'name': hs['name'], 'lines': split40(L(who, hs['lines'])), 'choice': [choice(who, c) for c in hs['choices']]}
        o['likes'][pid] = hs['like']
    c = w['closing']
    cl = {'scene': c['title'] + '（心願場景，第一次一定播）', 'lines': split40(L(who, c['lines'])), 'choice': [choice(who, x) for x in c['choices']]}
    by_time = {}
    for t in c.get('timeline', []):
        anchor = cl['lines'][t['insertAfter']]['text']
        by_time[cs(t['if']) + f'（{t["code"]}）'] = {'insertAfter': {anchor: L(who, t['lines'])}, 'note': t['note']}
    base = None
    for e in c.get('after', []):
        if 'unless' in e['if']: base = e
    if base: cl['after'] = L(who, base['lines'])
    for e in c.get('after', []):
        if e is base: continue
        label = cs(e['if']) + (f'（{e.get("note") or e.get("code")}）' if (e.get('note') or e.get('code')) else '')
        if base and '換成' in e.get('note', ''):
            new = L(who, e['lines'])
            by_time[label] = {'replace': {b['text']: [n] for b, n in zip(L(who, base['lines']), new)}}
        else:
            by_time[label] = L(who, e['lines'])
    if by_time: cl['byTime'] = by_time
    cl['byRel'] = {}
    for e in c['ending']:
        k = rel_key(who, e['if'])
        cl['byRel'][k] = L(who, e['lines']) + ([{'who': 'note', 'text': e['note']}] if e.get('note') and k not in ('stage5',) else [])
    r = w['record']
    cl['set'] = [r['flag'], 'memory:' + r['memory']['tag']]
    cl['memoryText'] = r['memory']['text']
    cl['album'] = r['album']
    cl['settle'] = 'AA_128 5-3（正式校外約會＋第一次心願加成）'
    o['closing'] = cl
    o['repeat'] = w['repeat']
    return o

err = []
outs = {who: build(who) for who in src.ORDER}

# 1. 原文的每一句都在
bb128 = open(os.path.join(SP, 'BB_128_校外單獨約會_心願地點與淡水示範規格.md'), encoding='utf-8').read()
def texts(o):
    if isinstance(o, dict):
        for k, v in o.items():
            if k in ('text', 't') and isinstance(v, str): yield v
            elif k in ('replace', 'insertAfter') and isinstance(v, dict):
                for kk, vv in v.items(): yield from texts(vv)
            else: yield from texts(v)
    elif isinstance(o, list):
        for v in o: yield from texts(v)
def norm(t): return re.sub(r'[\s　「」『』（）]', '', t)
for who in src.ORDER:
    a = bb128.index('### ' + SEC[who] + '. '); b = bb128.index('\n### ', a + 5)
    sec = bb128[a:b].split('**底圖（給 AI 的描述')[0].split('**再去 D')[0]
    sec = re.sub(r'^\*\*她的心願\*\*.*$', '', sec, flags=re.M)        # 心願說明在 _note
    sec = re.sub(r'^  - 大三下 K18.*$', '', sec, flags=re.M)          # K18、大四下春假的回聲在 BB_98 9-13、BB_99 9-15（已改）
    allt = norm(''.join(texts(outs[who]))) + '|' + norm(json.dumps(outs[who], ensure_ascii=False))   # 台詞連起來（允許拆句）＋其他欄位（記憶說明、條件說明）
    quotes = set(re.findall(r'^> ' + re.escape(NAMES[who]) + r'：(.+)$', sec, re.M)) | set(re.findall(r'^> （(.+)）$', sec, re.M)) | set(re.findall(r'「([^「」]+)」', sec))
    for q in quotes:
        if norm(q) not in allt: err.append(f'{who} 原文沒有轉進去：{q}')

# 2. 句長
def walk(o, path):
    if isinstance(o, dict):
        if 'text' in o and isinstance(o['text'], str) and o.get('who') != 'note' and len(o['text']) > 40: err.append(f'{path}: 超過 40 字：{o["text"]}')
        if 't' in o and isinstance(o['t'], str) and len(o['t']) > 20: err.append(f'{path}: 選項超過 20 字：{o["t"]}')
        for k, v in o.items(): walk(v, path + '/' + k)
    elif isinstance(o, list):
        for i, v in enumerate(o): walk(v, f'{path}[{i}]')
for who, o in outs.items(): walk(o, who)

# 3. 和地點檔一致
for who, o in outs.items():
    lj = json.load(open(os.path.join(SP, 'date_system', 'lines', o['loc'] + '.json'), encoding='utf-8'))
    if set(lj['points']) != set(o['hotspots']): err.append(f'{who} 互動點和 {o["loc"]}.json 不一樣')
    Lw = lj['lines'][who]
    for f in [Lw['arrive']['first'], Lw['closing']['first']] + [h['first'] for h in Lw['hotspots'].values()]:
        if not str(f.get('wishEvent', '')).startswith(f'wish/{o["id"]}.json'): err.append(f'{who} {o["loc"]}.json 的 first 沒有指到 wish/{o["id"]}.json：{f}')
    for p, v in o['likes'].items():
        if lj['likes'][who].get(p) != v: err.append(f'{who} {p} 喜好和 {o["loc"]}.json 不一樣')

# 4. 品牌
allt = '\n'.join(t for o in outs.values() for t in texts(o))
for b in BRANDS:
    if b in allt: err.append(f'台詞有真實店名或品牌（D77）：{b}')

if err: sys.exit('\n'.join(err))
for who, o in outs.items():
    json.dump(o, open(os.path.join(HERE, o['id'] + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
n = sum(1 for o in outs.values() for _ in re.finditer('"text"', json.dumps(o, ensure_ascii=False)))
print('ok', ' '.join(o['id'] for o in outs.values()), f'（{n} 行）')
