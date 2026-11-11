#!/usr/bin/env python3
"""AA_766_peishan_leftover2.json（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫：BB／CC 重掃開發分支 124fe40e5 還剩的兩筆早餐店／蛋餅）——26 列 old→new。

- 白名單（docs/handoff/story_import_allow.json）上有這份稿、approved、而且是 SHA 那一版才讀（**只認這一版**；AA 再改稿＝先改這裡的 SHA 和白名單）；白名單沒有＝不換。
- src/data/bbpack_events.js 25 列：D4c「沛珊的問題」（ev_d4c_question 女舍門口四題）的 D4CQ 陣列——手寫的檔，直接改檔：
      python3 tools/story/ps766.py --apply     （不加＝空跑，只印每一列在整個檔、在 D4CQ 那一段各出現幾次）
  每一列 old 在 D4CQ 那一段要剛好一處（整個檔別處也有的短句只換 D4CQ 這一處）；已經是 new＝跳過；對不到＝停下來。只換字：題數（4）、每題選項數（3）、流程不變（換完再數一次）。
- src/data/gift_lines.js 1 列（沛珊最愛的米漿第二句）：那個檔是 tools/story/import_gifts.py 產生的，匯入工具組好資料以後呼叫 apply_gift(data, ROOT)
  ——people.classmate_peishan 裡整句等於 old 的那一格要剛好一處，換成 new（已經是 new＝跳過）。
逐字比對在 tests/peishan_leftover2_1111_unit.js。"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

PATH = 'docs/story_planning/AA_766_peishan_leftover2.json'
SHA = '1e647bb05'
PS = 'classmate_peishan'
BBPACK = 'src/data/bbpack_events.js'
GIFT = 'src/data/gift_lines.js'
_CACHE = {}


def load(root, allow=None):
    """白名單上有才讀；沒有＝None"""
    if root in _CACHE:
        return _CACHE[root]
    allow = allow or IG.load(root)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        _CACHE[root] = None
        return None
    sha = hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    if not (str(sha).startswith(SHA) or SHA.startswith(str(sha))):
        raise SystemExit(f'{PATH}@{sha}：沛珊的稿只認 {SHA}（要換版本先改 tools/story/ps766.py 的 SHA）')
    raw = subprocess.check_output(['git', '-C', root, 'show', f'{sha}:{PATH}']).decode('utf-8')
    d = json.loads(raw)
    if json.loads(IG.read_fix(raw)) != d:
        raise SystemExit(f'{PATH}@{sha}：讀稿時照字換的那幾層（import_guard.read_fix）會改到這份稿的字，先問 AA')
    rows = d.get('rows') or []
    if len(rows) != 26 or sum(1 for r in rows if r.get('file') == BBPACK) != 25 or sum(1 for r in rows if r.get('file') == GIFT) != 1:
        raise SystemExit(f'{PATH}@{sha}：應該是 26 列（bbpack_events.js 25、gift_lines.js 1），讀到 {len(rows)} 列')
    d['_sha'] = sha
    _CACHE[root] = d
    return d


def tag(root, allow=None):
    d = load(root, allow)
    return f'{os.path.basename(PATH)}@{d["_sha"]}' if d else ''


def apply_gift(data, root, allow=None):
    """data＝import_gifts.py 組好的 GIFT_LINES。people.classmate_peishan 裡整句等於 old 的那一格（剛好一處）換成 new。回傳換了幾格"""
    d = load(root, allow)
    if not d:
        return 0
    n = 0
    for r in d['rows']:
        if r['file'] != GIFT:
            continue
        hit, done = [], [0]

        def walk(o):
            it = o.items() if isinstance(o, dict) else enumerate(o) if isinstance(o, list) else ()
            for k, v in it:
                if isinstance(v, str):
                    if v == r['old']: hit.append((o, k))
                    elif v == r['new']: done[0] += 1
                else:
                    walk(v)
        walk((data.get('people') or {}).get(PS) or {})
        if not hit and done[0] == 1:
            continue   # 上游的稿（AA_710）自己改好了
        if len(hit) != 1:
            raise SystemExit(f'AA_766 {GIFT}：old 在 people.{PS} 裡對到 {len(hit)} 格（要剛好 1 格）：{r["old"]}')
        hit[0][0][hit[0][1]] = r['new']; n += 1
    return n


def d4cq_span(s):
    i = s.index('  const D4CQ=['); j = s.index("  EV.push({ id:'ev_d4c_question'", i)
    return i, j


def shape(seg):
    """D4CQ 那一段的形狀：[題號, 選項數]（只換字，這個不能變）"""
    return [(int(m.group(1)), len(re.findall(r"\['「[^']*」','[^']*'\]", m.group(2)))) for m in re.finditer(r"\[(\d),'[^']*',\[((?:\['[^']*','[^']*'\],?)+)\]\]", seg)]


def apply_bbpack(root, write=False, allow=None):
    d = load(root, allow)
    if not d:
        print('白名單沒有 AA_766：不換'); return 0
    p = os.path.join(root, BBPACK); s = open(p, encoding='utf-8').read()
    i, j = d4cq_span(s); seg = s[i:j]; sh0 = shape(seg); n = 0
    if [x for x, _ in sh0] != [1, 2, 3, 4] or any(c != 3 for _, c in sh0):
        raise SystemExit(f'{BBPACK} 的 D4CQ 不是四題、每題三個選項：{sh0}')
    for r in d['rows']:
        if r['file'] != BBPACK:
            continue
        q = lambda t: "'" + t + "'"
        c_all, c_seg, c_new = s.count(r['old']), seg.count(q(r['old'])), seg.count(q(r['new']))
        print(f'  整個檔 {c_all} 處、D4CQ {c_seg} 處：{r["old"]} → {r["new"]}' + ('（已經是新句）' if not c_seg and c_new == 1 else ''))
        if not c_seg and c_new == 1:
            continue
        if c_seg != 1:
            raise SystemExit(f'AA_766 {BBPACK}：old 在 D4CQ 那一段對到 {c_seg} 處（要剛好 1 處）：{r["old"]}')
        if "'" in r['new'] or '\\' in r['new']:
            raise SystemExit(f'AA_766 {BBPACK}：新句有引號或反斜線，不能直接放進字串：{r["new"]}')
        seg = seg.replace(q(r['old']), q(r['new'])); n += 1
    if shape(seg) != sh0:
        raise SystemExit(f'AA_766 {BBPACK}：換完以後 D4CQ 的形狀變了（{sh0} → {shape(seg)}）')
    if write and n:
        open(p, 'w', encoding='utf-8').write(s[:i] + seg + s[j:])
    print(f'AA_766@{d["_sha"]}：{BBPACK} D4CQ 25 列，{"換了" if write else "要換"} {n} 列')
    return n


if __name__ == '__main__':
    ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    apply_bbpack(ROOT, '--apply' in sys.argv)
