"""校外約會預約系統的句子與交通偏好（DATE-S6；AA_128 4-1、4-3）→ src/data/date_lines.js。
**只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本**（不從分支最新讀）。句子一字不改，只從表格拆出來：
  - BB_128 3-7（BB 五位）、AA_127 第 8 節（以安、語彤）：答應、答應（和她交往中）、改時間、同一行程改到第三次、改交通；
  - BB_128 3-6「不分地點的句子」：取消、放鴿子兩欄（BB 五位）；AA_127 1-7、2-7：取消、30 天內第二次取消兩列（以安、語彤）；
  - date_prefs_bb.json＋date_prefs_aa.json 合併（why 欄不進遊戲）；
  - 各地點的台詞 date_system/lines/Dxx.json（白名單逐檔列的才讀；BB_128 2-9 的格式，原樣放進 DATE_LINES.loc；寫成旁白的開發說明改成註記，NOTE_NARR）；BB 五位 3-6 的出發、差不多了、一個都沒做就走、合照還不行。
格子裡「／」分開的是輪流用的幾句；同一句裡有好幾個「」＝連發幾則訊息（例：「好。」「我跟阿姨說那天不顧店。」）。「」以外的說明不進遊戲。
  - 疊在上面的改句：AA_373 6-1「`date_lines.js`」那一列（可昕不跟祐廷比輸贏，使用者 10-18）——「現在」欄的第 n 句換成「AA 定」欄的第 n 句；
    AA_359 5-2 的表（D26～D32 只能在第二天說、或時間不對的幾句，AA 改字）、5-3 的表（離開那一句在第二天白天說：天色、「下次早上來」的七句）和子晴那一句——那個地點、那個人的「現在」換成「改成」（引號裡的字；括號裡的說明不進遊戲）。
    AA_525（說了沒發生（二），白名單上的 commit）1-6、2-4：子晴、沛珊約會裡「下次我請／下次換我」的第一次回覆改成不欠——那個地點、那個人整句相同才換（FIX525）；
    D06、D15 子晴、D05 沛珊的 remember 誰聽得到、選了哪一個要記的旗標是條件式的：src/date3d.js 的 DATE.REMEMBER_IF、DATE.PICK_FLAG。
    5-3 的兩個到達句另一版（沛珊住臺南的 D28、D31＋D32 同一趟可昕到清境）是條件式的：src/date3d.js 的 DATE.ARRIVE_VAR。
    兩種都只換一字不差的 text（e75d1cce 起 6-1 兩欄都是整句，原本「……」開頭只換後面那一段的做法拿掉）；找不到的印出來、不換。每次都從白名單的原檔重算，重跑結果一樣。
用法：python3 tools/date/import_date_lines.py [--check 企劃線ref]"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
SP = 'docs/story_planning/'
FILES = {'bb': SP + 'BB_128_校外單獨約會_心願地點與淡水示範規格.md', 'aa': SP + 'AA_127_以安語彤_心願約會與邀約變化.md',
         'pbb': SP + 'date_system/date_prefs_bb.json', 'paa': SP + 'date_system/date_prefs_aa.json',
         'fix373': SP + 'AA_373_法律系大一下_時間人在哪與作廢設定_修正稿.md',   # 6-1 date_lines.js 那一列（AA373-Y1S2-FIX-1021）
         'fix359': SP + 'AA_359_兩天一夜的約會_住宿那一段.md'}   # 5-2 D26～D32 時間不對的九句、5-3 離開句七句＋子晴一句（DATE-OVERNIGHT-1021）
APPROVED = G.approved_files(ALLOW, SP)
for p in FILES.values():
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
if '--check' in sys.argv:
    ref = sys.argv[sys.argv.index('--check') + 1]
    for p in FILES.values():
        same = subprocess.run(['git', '-C', ROOT, 'diff', '--quiet', APPROVED[p], ref, '--', p]).returncode == 0
        print(('一樣：' if same else f'分支上的版本和白名單（{APPROVED[p]}）不同、不會匯入：') + p)
    sys.exit(0)
show = lambda p: G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
NAME = {'芷若': 'heroine_02', '子晴': 'heroine_04', '學姊': 'heroine_05', '沛珊': 'classmate_peishan', '可昕': 'kexin', '以安': 'heroine_01', '語彤': 'heroine_03'}


def section(md, head):
    """從 head 那一行到下一個同級以上的標題"""
    i = md.index(head); lv = len(head) - len(head.lstrip('#'))
    m = re.search(r'\n#{1,%d} ' % lv, md[i + len(head):])
    return md[i:i + len(head) + (m.start() if m else len(md))]


def rows(sec):
    out = []
    for ln in sec.splitlines():
        if not ln.startswith('|') or set(ln.replace('|', '').strip()) <= set('-: '):
            continue
        out.append([c.strip() for c in ln.strip().strip('|').split('|')])
    return out


def alts(cell):
    """「／」分開的幾句（只在「」外面的／分）；每一句＝裡面所有「」的內容（一個以上＝連發）"""
    parts, depth, cur = [], 0, ''
    for ch in cell:
        if ch == '「': depth += 1
        elif ch == '」': depth -= 1
        if ch == '／' and depth == 0:
            parts.append(cur); cur = ''
        else:
            cur += ch
    parts.append(cur)
    res = []
    for p in parts:
        q = re.findall(r'「((?:[^「」]|「[^「」]*」)*)」', p)
        if q:
            res.append(q if len(q) > 1 else q[0])
    return res


L = {}
KEYS = ['accept', 'acceptDating', 'move', 'move3', 'transport']
for src, head in [('bb', '### 3-7. '), ('aa', '## 8. 預約系統的句子')]:
    md = show(FILES[src]); sec = section(md, next(l for l in md.splitlines() if l.startswith(head)))
    for r in rows(sec)[1:]:
        who = NAME.get(r[0])
        if not who:
            continue
        for k, c in zip(KEYS, r[1:6]):
            L.setdefault(who, {})[k] = alts(c)
# BB 五位：3-6 不分地點的句子，取消（第 4 欄）、放鴿子（第 5 欄）
md = show(FILES['bb']); sec = section(md, next(l for l in md.splitlines() if l.startswith('### 3-6. ')))
for r in rows(sec):
    who = NAME.get(r[0])
    if who and len(r) >= 7:
        L.setdefault(who, {})['cancel'] = alts(r[3]); L[who]['flaked'] = alts(r[4])
        for k, c in (('depart', r[1]), ('enough', r[2]), ('leaveEarly', r[5]), ('noPair', r[6])):   # 出發訊息、差不多了、一個都沒做就走、合照還不行（BB 五位；以安、語彤還沒有＝不說）
            a = alts(c)
            if a: L[who][k] = a
# 以安、語彤：1-7、2-7 的取消、30 天內第二次取消
md = show(FILES['aa'])
for head, who in [('### 1-7. ', 'heroine_01'), ('### 2-7. ', 'heroine_03')]:
    sec = section(md, next(l for l in md.splitlines() if l.startswith(head)))
    for r in rows(sec):
        if r[0].startswith('取消'): L.setdefault(who, {})['cancel'] = alts(r[1])
        elif r[0].startswith('30 天內第二次取消'): L.setdefault(who, {})['flaked'] = alts(r[1])
prefs = {}
for k in ('pbb', 'paa'):
    for who, m in json.loads(show(FILES[k])).items():
        if who.startswith('_'):
            continue
        prefs[who] = {loc: {'transport': v['transport']} for loc, v in m.items()}
# 各地點的台詞（lines/Dxx.json；白名單逐檔列的才讀）：互動點名稱、她喜不喜歡、不太喜歡時的一句、抵達／互動點／收尾的句子
LOC = {}
for p in sorted(APPROVED):
    m = re.match(r'docs/story_planning/date_system/lines/(D\d\d)\.json$', p)
    if not m:
        continue
    ok, why = G.allowed(p, APPROVED[p], ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d = json.loads(show(p)); LOC[m.group(1)] = {k: d[k] for k in ('points', 'likes', 'dislikeLine', 'lines') if k in d}
    FILES['loc_' + m.group(1)] = p
# AA_373 6-1「date_lines.js」那一列：疊在地點台詞上的改句（現在 → AA 定，一句對一句）
md = show(FILES['fix373']); head = next((l for l in md.splitlines() if l.startswith('### 6-1. ')), None)
if not head:
    sys.exit('拆不出來：' + FILES['fix373'] + '@' + APPROVED[FILES['fix373']] + ' 沒有 6-1 節')
FIX = []
for r in rows(section(md, head)):
    if len(r) >= 3 and 'date_lines.js' in r[0]:
        old, new = re.findall(r'「([^「」]*)」', r[1]), re.findall(r'「([^「」]*)」', r[2])
        if len(old) != len(new) or not old:
            sys.exit('拆不出來（6-1 date_lines.js 那一列「現在」和「AA 定」句數不同）：' + json.dumps([old, new], ensure_ascii=False))
        FIX += list(zip(old, new))
if not FIX:
    sys.exit('拆不出來：AA_373 6-1 沒有 date_lines.js 那一列')


def texts(x):
    """地點台詞裡每一個 {text} 的物件（who／narr 都算；選項的 t 不算）"""
    if isinstance(x, dict):
        if isinstance(x.get('text'), str):
            yield x
        for v in x.values():
            yield from texts(v)
    elif isinstance(x, list):
        for v in x:
            yield from texts(v)


FIXED = []
for old, new in FIX:
    hit = [o for o in texts(LOC) if o['text'] == old]
    for o in hit:
        o['text'] = new
    FIXED.append((old, new, len(hit)))
    if not hit:
        print('AA_373 6-1：找不到「' + old + '」，沒換')
# AA_359 5-2：D26～D32 時間不對的句子；5-3（fb5156ab）：離開那一句在第二天白天說，有天色、「下次早上來」的七句（| 地點 | 誰、哪一句 | 現在 | 改成 |）——只在那個地點、那個人的台詞裡換。
# 格子裡括號外的說明（例：（下一句「這是我高中最喜歡的一件事。」不改））不算：先拿掉引號外面的全形括號那一段，再取引號裡的字
md = show(FILES['fix359'])
def outside_paren(cell):
    out, depth, q = [], 0, 0
    for ch in cell:
        if ch == '「': q += 1
        elif ch == '」': q = max(0, q - 1)
        if q == 0 and ch == '（': depth += 1; continue
        if q == 0 and ch == '）' and depth: depth -= 1; continue
        if depth == 0: out.append(ch)
    return ''.join(out)
FIXED359 = []
def fix_table(tag, want):
    head = next((l for l in md.splitlines() if l.startswith('### ' + tag + '. ')), None)
    if not head:
        sys.exit('拆不出來：' + FILES['fix359'] + '@' + APPROVED[FILES['fix359']] + ' 沒有 ' + tag + ' 節')
    n0 = len(FIXED359)
    for r in rows(section(md, head)):
        if len(r) < 4 or not re.match(r'D\d\d$', r[0]):
            continue
        who = next((v for k, v in NAME.items() if r[1].startswith(k)), None)
        old, new = re.findall(r'「([^「」]*)」', outside_paren(r[2])), re.findall(r'「([^「」]*)」', outside_paren(r[3]))
        if not who or len(old) != 1 or len(new) != 1:
            sys.exit('拆不出來（' + tag + ' 那一列）：' + json.dumps(r, ensure_ascii=False))
        hit = [o for o in texts(((LOC.get(r[0]) or {}).get('lines') or {}).get(who)) if o['text'] == old[0]]
        for o in hit:
            o['text'] = new[0]
        FIXED359.append((tag + ' ' + r[0], who, old[0], new[0], len(hit)))
        if not hit:
            print('AA_359 ' + tag + '：' + r[0] + ' ' + who + ' 找不到「' + old[0] + '」，沒換')
    if len(FIXED359) - n0 != want:
        sys.exit('拆不出來：AA_359 ' + tag + ' 應該是 ' + str(want) + ' 句，拆出 ' + str(len(FIXED359) - n0) + ' 句')
    return section(md, head)
fix_table('5-2', 9)
sec53 = fix_table('5-3', 7)
# 5-3 條列裡「不分版本都改」的那一句（子晴 D32 一般的到達句）
m = re.search(r'子晴一般：「([^「」]*)」→ 不分版本都改「([^「」]*)」', sec53)
if not m:
    sys.exit('拆不出來：AA_359 5-3 子晴那一句')
hit = [o for o in texts(((LOC.get('D32') or {}).get('lines') or {}).get('heroine_04')) if o['text'] == m.group(1)]
for o in hit:
    o['text'] = m.group(2)
FIXED359.append(('5-3 D32', 'heroine_04', m.group(1), m.group(2), len(hit)))
if not hit:
    print('AA_359 5-3：D32 heroine_04 找不到「' + m.group(1) + '」，沒換')
# AA_525（HEROINE-LIFE-1028；AA-C 10-28 6081f725f 定稿）1-6 子晴 D10、D12、D13、D30、D31，2-4 沛珊 D08、D15、D18：第一次的回覆改成不欠（「下次我請」「下次換我」）。
# 只在那個地點、那個人的台詞裡換一字不差的 text；每一句先確認稿裡有「改成」那一句。白名單沒有 AA_525＝不換
A525 = G.approved_files(ALLOW, SP + 'AA_525_')
FIXED525 = []
if A525:
    P525, S525 = next(iter(A525.items()))
    ok, why = G.allowed(P525, S525, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    md525 = G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S525}:{P525}'], text=True))
    FIX525 = [('1-6', 'D10', 'heroine_04', '……謝謝。宵夜我請。', '……謝謝。', 'D10「……謝謝。宵夜我請。」→「……謝謝。」'),
              ('1-6', 'D12', 'heroine_04', '謝謝，下次換我。', '謝謝。', 'D12「謝謝，下次換我。」→「謝謝。」'),
              ('1-6', 'D13', 'heroine_04', '好，下次我請。', '好啦。謝謝。', 'D13「好，下次我請。」→「好啦。謝謝。」'),
              ('1-6', 'D30', 'heroine_04', '好。下次換我。', '好。謝謝。', 'D30「好。下次換我。」→「好。謝謝。」'),
              ('1-6', 'D31', 'heroine_04', '好！下次我請。', '好！謝謝！', 'D31「好！下次我請。」→「好！謝謝！」'),
              ('2-4 P-6', 'D15', 'classmate_peishan', '……下次我請你吃早餐。我家的。', '……我家的早餐比這個好吃！', 'D15「……下次我請你吃早餐。我家的。」→「……我家的早餐比這個好吃！」'),
              ('2-4 P-6', 'D08', 'classmate_peishan', '……謝謝。下次換你。', '謝謝！', 'D08、D18「下次換我」→「謝謝！」'),   # 稿寫「下次換我」；D08 遊園列車那一句其實是「……謝謝。下次換你。」（「我讓妳。」的回覆），同一列一起換
              ('2-4 P-6', 'D18', 'classmate_peishan', '……謝謝。下次換我。', '謝謝！', 'D08、D18「下次換我」→「謝謝！」')]
    for item, loc, who, old, new, quote in FIX525:
        if quote not in md525:
            sys.exit(f'AA_525@{S525} 裡找不到 {item} 的「改成」：{quote}')
        hit = [o for o in texts(((LOC.get(loc) or {}).get('lines') or {}).get(who)) if o['text'] in (old, new)]
        if not hit:
            sys.exit(f'AA_525 {item}：{loc} {who} 找不到「{old}」（也不是「{new}」）')
        for o in hit:
            o['text'] = new
        FIXED525.append((item + ' ' + loc, who, old, new, len(hit)))
    FILES['fix525'] = P525
# 地點檔裡寫成旁白、其實是給開發看的條件或伏筆說明：改成 who:'note'（遊戲不顯示）。整句相同才改，其他旁白不動（DATE-C3：淡水示範的反應，
# 遊戲裡原本會演出「（第 6 階以上）」——D13 以安、學姊的合照那一句前面；「（第 3 節她的心願的伏筆）」——D13 可昕欄杆第一次的選項②）
NOTE_NARR = {'第 6 階以上', '第 3 節她的心願的伏筆'}
noted = [o for o in texts(LOC) if o.get('who') == 'narr' and o['text'] in NOTE_NARR]
for o in noted:
    o['who'] = 'note'
print('旁白改成註記（不顯示）：', len(noted), '行')
bad = [(w, k) for w in NAME.values() for k in KEYS + ['cancel', 'flaked'] if not (L.get(w) or {}).get(k)]
if bad:
    sys.exit('拆不出來（表格格式變了？）：' + json.dumps(bad, ensure_ascii=False))
out = {'source': '白名單 ' + '＋'.join(f'{os.path.basename(p)}@{APPROVED[p]}' for p in FILES.values()), 'lines': L, 'prefs': prefs, 'loc': LOC}
dst = os.path.join(ROOT, 'src', 'data', 'date_lines.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 校外約會預約系統的句子與交通偏好（DATE-S6；AA_128 4-1、4-3；BB_128 3-6、3-7、AA_127 1-7、2-7、第 8 節、date_prefs_*.json）。'
             '產生器：tools/date/import_date_lines.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst DATE_LINES=" + json.dumps(out, ensure_ascii=False) + ';\n')
print('wrote', dst, {w: {k: len(v) for k, v in m.items()} for w, m in L.items()}, '偏好', {w: len(m) for w, m in prefs.items()}, '地點', sorted(LOC))
print('AA_373 6-1 改句：' + '；'.join(f'「{o}」→「{n}」{c} 處' for o, n, c in FIXED))
print('AA_359 5-2、5-3 改句：' + '；'.join(f'{l} {w}「{o}」→「{n}」{c} 處' for l, w, o, n, c in FIXED359))
print('AA_525 1-6、2-4 改句：' + '；'.join(f'{l} {w}「{o}」→「{n}」{c} 處' for l, w, o, n, c in FIXED525))
