"""觀念卡（D118-B2-1102；docs/handoff/D118_PLAN.md 第 2 節第一點、第 4 節 D118-B2）→ src/data/study_units.js。
來源（都是遊戲裡現有的資料，一字不改、只挑欄位）：
  src/data/exam_bank.js：EXAM_BANK.courseMap 裡 exam==='mc5'（考五題）的法律課，每個有考題的 (課, scopeWeek) 一張卡；qids＝那一週的題號
  src/data/syllabus.js：那一週的黑板第一行當標題；那一週的課堂提問（ask.qid，沒有就用討論課的 obs.disc.qid）當 askQid
  src/data/legal_qbank.js：刑訴使用者題庫 Q001–Q084 照 section（章）分卡；同一章裡同一個 tag（觀念）有 5 題以上的自己一張，其他併成那一章的一張（約 10 張）
plain（白話）、example（例子）、cue（考試時的一行提醒）先留空，等 AA 的觀念卡稿用劇情匯入白名單（story_import_allow.json）匯入；
空的時候遊戲照 fallback 顯示（黑板三行＋教授那一句＋題目的考點／解析，src/study3d.js 的 STUDY.view）。
用法：python3 tools/study/build_units.py（重新產生；題庫或課表重新匯入以後要再跑一次）"""
import json, os, re, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, 'src', 'data', 'study_units.js')
QBANK_MIN = 5   # 刑訴題庫：同一章、同一個 tag 有幾題以上才自己一張卡


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
                  'plain': '', 'example': '', 'cue': '', 'qids': e['qids'], 'askQid': ask})
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
                           'plain': '', 'example': '', 'cue': '', 'qids': g, 'askQid': None, 'src': 'qbank'})

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

head = ('/* 觀念卡（D118-B2-1102；docs/handoff/D118_PLAN.md 第 2 節第一點）。產生器：tools/study/build_units.py（不要手改）。\n'
        '   每門考五題的法律課（EXAM_BANK.courseMap exam:mc5）每個有考題的週一張卡＋刑訴使用者題庫（QBANK）照章分卡。\n'
        '   title＝那一週的黑板第一行；qids＝那一週的題號；askQid＝那一週的課堂提問。plain／example／cue 等 AA 的稿（空的時候遊戲照 fallback 顯示）。\n'
        f'   來源：exam_bank {EB.get("source", "")}；syllabus {SY.get("source", "")[:60]}…；QBANK {len(QB)} 題。共 {len(units)} 張週卡＋{len(qunits)} 張刑訴題庫卡。 */\n')
body = 'const STUDY_UNITS={"v":1,"units":[\n' + ',\n'.join(json.dumps(u, ensure_ascii=False, separators=(',', ':')) for u in allu) + '\n]};\n'
open(OUT, 'w', encoding='utf-8').write(head + body)
print(f'{os.path.relpath(OUT, ROOT)}：{len(units)} 張週卡（{len(mc5)} 門課）＋{len(qunits)} 張刑訴題庫卡；題目 {len(seen)} 題；沒有黑板的週 {len(missing_board)}')
if missing_board:
    print('  沒有黑板第一行（標題用課名＋週次）：' + ', '.join(missing_board))
