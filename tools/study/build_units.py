"""觀念卡（D118-B2-1102；docs/handoff/D118_PLAN.md 第 2 節第一點、第 4 節 D118-B2）→ src/data/study_units.js。
來源（都是遊戲裡現有的資料，一字不改、只挑欄位）：
  src/data/exam_bank.js：EXAM_BANK.courseMap 裡 exam==='mc5'（考五題）的法律課，每個有考題的 (課, scopeWeek) 一張卡；qids＝那一週的題號
  src/data/syllabus.js：那一週的黑板第一行當標題；那一週的課堂提問（ask.qid，沒有就用討論課的 obs.disc.qid）當 askQid
  src/data/legal_qbank.js：刑訴使用者題庫 Q001–Q084 照 section（章）分卡；同一章裡同一個 tag（觀念）有 5 題以上的自己一張，其他併成那一章的一張（約 10 張）
plain（白話）、example（例子）、cue（考試時的一行提醒）、basis（條文依據）：AA 的觀念卡稿（企劃線 docs/story_planning/study/cards_<學期>.json，
以卡 id 為 key），**只讀劇情匯入白名單（docs/handoff/story_import_allow.json）列出、status approved 的那一版**（git show <sha>:<path>，
不從分支最新、也不從工作目錄讀；D94 第 5 點）；一字不改（照樣過 import_guard.read_fix）。CARD_FILES 沒列的學期照舊空著，
空的時候遊戲照 fallback 顯示（黑板三行＋教授那一句＋題目的考點／解析，src/study3d.js 的 STUDY.view）。
刑訴題庫卡（crimpro_q1…）的標題：AA 的 crimpro_titles.json（同樣走白名單）。
對不上的（稿裡的卡 id 遊戲沒有、學期不同、那一學期那幾門課有卡但稿裡沒有、標題檔的 id 不是題庫卡）都印出來，不默默丟掉。
用法：python3 tools/study/build_units.py（重新產生；題庫、課表重新匯入或白名單換版本以後要再跑一次）"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'data', 'study_units.js')
QBANK_MIN = 5   # 刑訴題庫：同一章、同一個 tag 有幾題以上才自己一張卡
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as GD

# AA 的觀念卡稿（一學期一個檔）。要加學期：AA 交「定稿＋commit」→ 值班 LAWWW 把那一版加進白名單 → 在這裡加一行
CARD_FILES = [('docs/story_planning/study/cards_y1s1.json', 'Y1S1'),
              ('docs/story_planning/study/cards_y1s2.json', 'Y1S2'),
              ('docs/story_planning/study/cards_y2s1.json', 'Y2S1'),
              ('docs/story_planning/study/cards_y2s2.json', 'Y2S2'),
              ('docs/story_planning/study/cards_y3s1.json', 'Y3S1')]
TITLES_FILE = 'docs/story_planning/study/crimpro_titles.json'
CARD_FIELDS = ('plain', 'example', 'cue')
# basis 裡不是條文出處、AA 說匯入時拿掉的（AA 11:31 交大二下：法學英文那一項是給審稿看的）
BASIS_DROP = {'法學英文用語（英美法，無我國條文）'}
ALLOW = GD.load(ROOT)
APPROVED = GD.approved_files(ALLOW, 'docs/story_planning/')


def read_allowed(path):
    """白名單上 approved 的那一版（git show <sha>:<path>）；不在名單、版本不明 → 拒絕匯入。回傳 (JSON, sha)。"""
    sha = APPROVED.get(path, '')
    ok, why = GD.allowed(path, sha, ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    try:
        raw = subprocess.check_output(['git', '-C', ROOT, 'show', f'{sha}:{path}'], text=True, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError as e:
        sys.exit(f'讀不到 {path}@{sha}（先 git fetch origin claude/story-planning）：{e.stderr.strip()}')
    return json.loads(GD.read_fix(raw)), sha


def read_js_value(rel, name):
    """讀 `const NAME=<JSON>;` 的 JSON 部分（產生器輸出的資料檔都是這個格式）"""
    s = open(os.path.join(ROOT, rel), encoding='utf-8').read()
    m = re.search(r'^const ' + name + r'\s*=\s*', s, re.M)
    if not m:
        sys.exit(rel + '：找不到 const ' + name)
    val, _ = json.JSONDecoder().raw_decode(s, m.end())
    return val


EB = read_js_value('src/data/exam_bank.js', 'EXAM_BANK')
SY = read_js_value('src/data/syllabus.js', 'SYLLABUS')
QB = read_js_value('src/data/legal_qbank.js', 'QBANK')
cmap = EB['courseMap']
mc5 = {cid for cid, v in cmap.items() if v.get('exam') == 'mc5'}
TERMS = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2']
tord = lambda t: TERMS.index(t) if t in TERMS else 99

# 每門 mc5 課、每一週的題號（題庫原本的順序）
weeks = {}
for q in EB['questions']:
    cid = q['course']
    if cid not in mc5:
        continue
    if q.get('scopeWeek') is None:
        sys.exit('題目沒有 scopeWeek：' + q['id'])
    k = (cid, int(q['scopeWeek']))
    weeks.setdefault(k, {'term': q.get('term') or cmap[cid]['term'], 'qids': []})['qids'].append(q['id'])

units = []
missing_board = []
for (cid, w), e in weeks.items():
    sy = next((x for x in SY['courses'].get(cid, []) if x.get('w') == w), None)
    board = (sy or {}).get('board') or []
    title = board[0] if board and board[0] else ''
    if not title:
        missing_board.append(f'{cid}|{w}')
        title = cmap[cid]['name'] + '：第 ' + str(w) + ' 週'
    ask = None
    if sy and isinstance(sy.get('ask'), dict) and sy['ask'].get('qid'):
        ask = sy['ask']['qid']
    elif sy and isinstance(sy.get('obs'), dict) and isinstance(sy['obs'].get('disc'), dict) and sy['obs']['disc'].get('qid'):
        ask = sy['obs']['disc']['qid']
    units.append({'id': f'{cid}_w{w}', 'course': cid, 'term': e['term'], 'week': w, 'title': title,
                  'plain': '', 'example': '', 'cue': '', 'basis': [], 'qids': e['qids'], 'askQid': ask})
units.sort(key=lambda u: (tord(u['term']), u['course'], u['week']))

# 刑訴使用者題庫（QBANK）：照章、照 tag 分卡
qunits = []
if 'crimpro' in mc5:
    secs = []
    for q in QB:
        if q.get('complete') is False:
            continue
        if q['section'] not in secs:
            secs.append(q['section'])
    NUM = '一二三四五六七八九十'
    n = 0
    for sec in secs:
        qs = [q for q in QB if q['section'] == sec and q.get('complete') is not False]
        tags = []
        for q in qs:
            if q.get('tag') not in tags:
                tags.append(q.get('tag'))
        groups = [[q['id'] for q in qs if q.get('tag') == t] for t in tags]
        big = [g for g in groups if len(g) >= QBANK_MIN]
        rest = [i for g in groups if len(g) < QBANK_MIN for i in g]
        if rest:
            big.append([q['id'] for q in qs if q['id'] in set(rest)])
        for j, g in enumerate(big):
            n += 1
            qunits.append({'id': f'crimpro_q{n}', 'course': 'crimpro', 'term': cmap['crimpro']['term'], 'week': None,
                           'title': '刑事訴訟法・' + sec + ('（' + NUM[j] + '）' if len(big) > 1 else ''),
                           'plain': '', 'example': '', 'cue': '', 'basis': [], 'qids': g, 'askQid': None, 'src': 'qbank'})

allu = units + qunits
# 檢查：每一題 mc5 題目、每一題 QBANK 都恰好在一張卡
seen = {}
for u in allu:
    for qid in u['qids']:
        if qid in seen:
            sys.exit('題號在兩張卡：' + qid + ' ' + seen[qid] + ' ' + u['id'])
        seen[qid] = u['id']
lost = [q['id'] for q in EB['questions'] if q['course'] in mc5 and q['id'] not in seen]
if lost:
    sys.exit('沒有卡的題目：' + ', '.join(lost))

# AA 的觀念卡稿（白名單那一版）→ plain／example／cue／basis
byid = {u['id']: u for u in allu}
problems = []   # 對不上的（印出來，不默默丟掉）
imported = {}   # 學期 → 匯入幾張
sources = []
for path, term in CARD_FILES:
    cards, sha = read_allowed(path)
    sources.append(f'{os.path.basename(path)}@{sha}')
    got = 0
    for cid, c in cards.items():
        if cid.startswith('_'):
            continue
        u = byid.get(cid)
        if not u:
            problems.append(f'{os.path.basename(path)}：卡 {cid} 遊戲裡沒有這張（沒匯入）')
            continue
        if u['term'] != term:
            problems.append(f'{os.path.basename(path)}：卡 {cid} 是 {u["term"]} 的卡，不是 {term}（照樣匯入）')
        if not isinstance(c, dict):
            problems.append(f'{os.path.basename(path)}：卡 {cid} 不是物件（沒匯入）')
            continue
        for k in CARD_FIELDS:
            v = c.get(k)
            if not isinstance(v, str) or not v.strip():
                problems.append(f'{os.path.basename(path)}：卡 {cid} 沒有 {k}')
                v = ''
            u[k] = v
        b = c.get('basis')
        u['basis'] = [x for x in b if isinstance(x, str) and x and x not in BASIS_DROP] if isinstance(b, list) else []
        got += 1
    imported[term] = imported.get(term, 0) + got
    # 那一學期、稿裡有寫到的那幾門課，遊戲有卡但稿裡沒有的
    courses = {byid[k]['course'] for k in cards if k in byid}
    for u in allu:
        if u['term'] == term and u['course'] in courses and u['id'] not in cards:
            problems.append(f'{os.path.basename(path)}：{term} {u["course"]} 的卡 {u["id"]} 稿裡沒有（照舊空著）')
    other = sorted({u['course'] for u in allu if u['term'] == term and u['course'] not in courses})
    if other:
        print(f'  {term} 稿裡沒有的課（照舊空著）：' + '、'.join(other))

titles, tsha = read_allowed(TITLES_FILE)
sources.append(f'{os.path.basename(TITLES_FILE)}@{tsha}')
nt = 0
for cid, t in titles.items():
    if cid.startswith('_'):
        continue
    u = byid.get(cid)
    if not u or u.get('src') != 'qbank':
        problems.append(f'{os.path.basename(TITLES_FILE)}：{cid} 不是刑訴題庫卡（沒套用）')
        continue
    if not isinstance(t, str) or not t.strip():
        problems.append(f'{os.path.basename(TITLES_FILE)}：{cid} 標題是空的（沒套用）')
        continue
    u['title'] = t
    nt += 1
for u in qunits:
    if u['id'] not in titles:
        problems.append(f'{os.path.basename(TITLES_FILE)}：刑訴題庫卡 {u["id"]} 沒有正式標題（照舊用「{u["title"]}」）')

head = ('/* 觀念卡（D118-B2-1102；docs/handoff/D118_PLAN.md 第 2 節第一點）。產生器：tools/study/build_units.py（不要手改）。\n'
        '   每門考五題的法律課（EXAM_BANK.courseMap exam:mc5）每個有考題的週一張卡＋刑訴使用者題庫（QBANK）照章分卡。\n'
        '   title＝那一週的黑板第一行（刑訴題庫卡＝AA 的正式標題）；qids＝那一週的題號；askQid＝那一週的課堂提問。\n'
        '   plain／example／cue／basis＝AA 的觀念卡稿（劇情匯入白名單那一版；還沒交定稿的學期空著，遊戲照 fallback 顯示）。\n'
        f'   來源：exam_bank {EB.get("source", "")}；syllabus {SY.get("source", "")[:60]}…；QBANK {len(QB)} 題；觀念卡 {"、".join(sources)}。'
        f'共 {len(units)} 張週卡＋{len(qunits)} 張刑訴題庫卡。 */\n')
body = 'const STUDY_UNITS={"v":1,"units":[\n' + ',\n'.join(json.dumps(u, ensure_ascii=False, separators=(',', ':')) for u in allu) + '\n]};\n'
open(OUT, 'w', encoding='utf-8').write(head + body)
print(f'{os.path.relpath(OUT, ROOT)}：{len(units)} 張週卡（{len(mc5)} 門課）＋{len(qunits)} 張刑訴題庫卡；題目 {len(seen)} 題；沒有黑板的週 {len(missing_board)}')
if missing_board:
    print('  沒有黑板第一行（標題用課名＋週次）：' + ', '.join(missing_board))
print('  觀念卡匯入：' + '、'.join(f'{t} {n} 張' for t, n in imported.items()) + f'；刑訴題庫卡正式標題 {nt} 張（來源 {"、".join(sources)}）')
for p in problems:
    print('  對不上：' + p)
# 太長的卡（plain＋example 字數，每學期前 5 張；不拆卡，給 LAWWW 決定要不要請 AA 縮）
for path, term in CARD_FILES:
    longest = sorted((u for u in allu if u['term'] == term and u['plain']), key=lambda u: -len(u['plain'] + u['example']))[:5]
    print(f'  {term} 最長的卡：' + '、'.join(f'{u["id"]} {len(u["plain"] + u["example"])} 字' for u in longest))
