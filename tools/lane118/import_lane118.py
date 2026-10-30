#!/usr/bin/env python3
"""118 巷的店家、點餐台詞、常客、阿哲週一揪人（AA_280）→ src/data/lane118_shops.js。
只從劇情匯入白名單上的版本讀（tools/story/import_guard.py；docs/handoff/story_import_allow.json），不讀分支上的最新檔。
字串照抄 AA_280 表格與引言（只拿掉 markdown 的 **、反引號）；營業時間、星期、學期拆成程式用的欄位。
用法：python3 tools/lane118/import_lane118.py [--check]（--check：只比對，不寫檔；和現有的 lane118_shops.js 不同就結束碼 1）"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

PATH = 'docs/story_planning/AA_280_118巷_店家菜單與午餐.md'
OUT = os.path.join(ROOT, 'src', 'data', 'lane118_shops.js')
WD = {'日': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6}


def src():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits: sys.exit(PATH + '：不在匯入白名單')
    sha = hits[-1]['sha']; ok, why = IG.allowed(PATH, sha, allow)
    if not ok: sys.exit(why)
    return sha, IG.read_fix(subprocess.check_output(['git', 'show', f'{sha}:{PATH}'], cwd=ROOT).decode('utf-8'))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）


def clean(s): return s.replace('**', '').replace('`', '').strip()


def rows(text, head):
    """第一欄表頭等於 head 的第一個 markdown 表格的資料列（每列切成欄）"""
    lines = text.split('\n'); out = []; on = False
    for ln in lines:
        if ln.startswith('|') and not on and clean(ln.split('|')[1]) == head: on = True; continue
        if on:
            if not ln.startswith('|'): break
            if re.match(r'^\|\s*-', ln): continue
            out.append([clean(c) for c in ln.strip().strip('|').split('|')])
    if not out: sys.exit('找不到表格：' + head)
    return out


def days(s):
    """「一、三」「一～四」「一～五」「三」→ [1,3]…"""
    out = []
    for part in s.split('、'):
        m = re.match(r'^([日一二三四五六])～([日一二三四五六])$', part)
        if m: out += list(range(WD[m.group(1)], WD[m.group(2)] + 1))
        elif part in WD: out.append(WD[part])
        else: sys.exit('看不懂星期：' + s)
    return out


def hm(s):
    h, m = s.split(':'); return round(int(h) + int(m) / 60, 4)


def hours(s):
    """「11:00～14:00、17:00～20:00；週日休」→ {open:[[11,14],[17,20]], closed:[0]}"""
    a, _, b = s.partition('；')
    op = [[hm(x), hm(y)] for x, y in re.findall(r'(\d{1,2}:\d{2})～(\d{1,2}:\d{2})', a)]
    closed = [] if '每天' in b else [WD[c] for c in re.findall(r'週([日一二三四五六])', b)]
    if not op: sys.exit('看不懂營業時間：' + s)
    return {'open': op, 'closed': closed, 'text': s}


def say(cell):
    """「阿姨：「自己夾……」」→ {who:'阿姨', text:'自己夾……'}；「「內用嗎？……」」→ {who:null, text:…}；旁白（…）照抄"""
    m = re.match(r'^(?:(.+?)：)?「(.+)」$', cell)
    if m: return {'who': m.group(1), 'text': m.group(2)}
    return {'who': None, 'text': cell}


def term_from(s):
    """「Y1S1 第 2 週」「Y1S1 第 2 週（到 2026-12-16）」「Y2S1 第 1 週（開始修法律系的課）」「Y1S1 第 2 週～Y1S2」「Y2S1 起（研究所）」"""
    m = re.match(r'^(Y\dS\d)(?:\s*第\s*(\d+)\s*週)?', s)
    if not m: sys.exit('看不懂學期：' + s)
    d = {'term': m.group(1), 'week': int(m.group(2)) if m.group(2) else 1}
    t = re.search(r'～(Y\dS\d)', s); u = re.search(r'到\s*(\d{4}-\d{2}-\d{2})', s)
    if t: d['untilTerm'] = t.group(1)
    if u: d['until'] = u.group(1)
    return d


def quotes(block):
    """「> 阿哲：欸 我找到了」這種引言 → [[說話的人, 句子]]"""
    return [[m.group(1), m.group(2)] for m in re.finditer(r'^\s*>\s*(.+?)：(.+?)\s*$', block, re.M)]


def build():
    sha, t = src()
    NAME2ID = {'阿哲': 'zhe', 'Alison': 'yu'}
    shops = []
    for r in rows(t, '店 id'):
        if len(r) < 5: continue
        menu = []
        for it in r[4].split('／'):
            m = re.match(r'^(.+?)\s*(\d+)$', it.strip())
            if not m: sys.exit('看不懂菜單：' + it)
            menu.append([m.group(1).strip(), int(m.group(2))])
        shops.append({'id': r[0], 'name': r[1], 'type': r[2], 'hours': hours(r[3]), 'menu': menu})
    greet = {r[0]: {'greet': say(r[1]), 'done': r[2]} for r in rows(t, '店') if len(r) >= 3 and r[0] in {s['id'] for s in shops}}
    for s in shops:
        if s['id'] not in greet: sys.exit('第 2 節缺 ' + s['id'])
        s.update(greet[s['id']])
    closed = re.search(r'沒開的時間走到店門口：「(.+?)」', t); order = re.search(r'點菜（全部共用）：「(.+?)」', clean(t)); group = re.search(r'店員招呼換成「(.+?)」', t)
    regs = []
    for r in rows(t, '人物 id'):
        if len(r) < 6: continue
        rid = re.sub(r'（.*?）', '', r[0]).strip(); tm = re.findall(r'(\d{1,2}:\d{2})', r[3])
        e = {'id': rid, 'shop': r[1], 'days': days(r[2]), 'from': hm(tm[0]), 'to': hm(tm[1]), 'line': say(r[5])['text']}
        e.update(term_from(r[4])); regs.append(e)
    s4 = t[t.index('## 4.'):t.index('## 5.')]
    first = [[NAME2ID.get(a, a), b] for a, b in quotes(s4[:s4.index('- 選項')])]
    opts = re.search(r'選項：「(.+?)」→ 阿哲「(.+?)」.*?／「(.+?)」→ 阿哲「(.+?)」', s4)
    rot = re.search(r'順序輪：([a-z0-9]+(?:\s*→\s*[a-z0-9]+)+)', s4)
    weekly = re.findall(r'^\s*- 「(.+?)」(?:（去 ([a-z0-9]+) 那週）)?\s*$', s4, re.M)
    pair = re.search(r'Alison 那句換成「(.+?)」', s4)
    if not (closed and order and group and first and opts and rot and len(weekly) == 4 and pair): sys.exit('第 2、4 節有欄位找不到')
    rotation = [x.strip() for x in rot.group(1).split('→')]
    wl = {}
    for line, sid in weekly: wl[sid or rotation[0]] = line
    return sha, {'src': PATH + '@' + sha, 'closedLine': closed.group(1), 'orderLine': order.group(1), 'groupGreet': group.group(1), 'shops': shops, 'regulars': regs,
                 'lunch': {'first': first, 'yes': opts.group(1), 'yesReply': opts.group(2), 'no': opts.group(3), 'noReply': opts.group(4), 'rotation': rotation, 'weekly': wl, 'pairedYu': pair.group(1)}}


def main():
    sha, d = build()
    js = ('/* 118 巷的店家、點餐台詞、常客、阿哲週一揪人。自動產生，不要手改：python3 tools/lane118/import_lane118.py\n'
          '   來源：' + d['src'] + '（劇情匯入白名單）。字串照抄 AA_280。*/\n'
          'const LANE118_SHOPS=' + json.dumps(d, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=LANE118_SHOPS;\n")
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        print('一致' if cur == js else '不一致'); sys.exit(0 if cur == js else 1)
    open(OUT, 'w', encoding='utf-8').write(js); print('寫好', OUT, len(d['shops']), '間店', len(d['regulars']), '列常客')


main()
