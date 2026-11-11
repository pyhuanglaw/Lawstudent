#!/usr/bin/env python3
"""AA_763_peishan_misc3.json（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫：零散檔案第三批）——給匯入工具疊稿用。

這份稿是「逐列 old→new」：files[]＝{file（遊戲檔）, rows[{where?, old, new, count?}]}。工具產生的資料檔不能手改，所以匯入工具在寫檔以前呼叫這裡：
    import ps763; n = ps763.apply_ladder(out, ROOT)          # tools/ladder/import_ladder.py：招呼 when 七句（只換字 t，條件不動）＋bikeSeat 的 onFirst／offFirst
    import ps763; n = ps763.apply_msgs(people_ps, ROOT)      # tools/msg/to_js2.py：msg2_pool.js 沛珊的兩句
- 白名單（docs/handoff/story_import_allow.json）上有這份稿、approved、而且是 SHA 那一版才讀（**只認這一版**；AA 再改稿＝先改這裡的 SHA 和白名單）；白名單沒有＝不換（回 0）。
- old 要剛好對到一處（稿有 count 就照 count）；對不到、或對到的處數不對就停下來（不猜、不硬換）。已經是 new（上游的稿自己改好了）＝跳過。
- 手寫的檔（feed_y4s1.js、date3d.js、bbpack_events.js、grades3d.js、story3d.js、aa614_3d.js、rel_lines.js）直接改檔，逐字比對在 tests/peishan_misc3_1111_unit.js。"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

PATH = 'docs/story_planning/AA_763_peishan_misc3.json'
SHA = '62460ea75'
PS = 'classmate_peishan'
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
        raise SystemExit(f'{PATH}@{sha}：沛珊的稿只認 {SHA}（要換版本先改 tools/story/ps763.py 的 SHA）')
    raw = subprocess.check_output(['git', '-C', root, 'show', f'{sha}:{PATH}']).decode('utf-8')
    d = json.loads(IG.read_fix(raw))
    d['_sha'] = sha
    _CACHE[root] = d
    return d


def rows(d, file):
    """這個遊戲檔的列（file 欄以這個路徑開頭的那一筆；ladder.js 那一筆的 file 後面有括號說明）"""
    out = []
    for f in (d or {}).get('files', []):
        if str(f.get('file', '')).startswith(file):
            out += f.get('rows', [])
    return out


def apply_ladder(out, root, allow=None):
    """out＝import_ladder.py 組好的 LADDER 資料。招呼 when：byTerm.<學期>.classmate_peishan.greet.when 裡 t 整句等於 old 的那一則換成 new（條件 time／weekday／week／location／note 不動）；
    bikeSeat.classmate_peishan.onFirst／offFirst 整句相同才換。回傳換了幾列"""
    d = load(root, allow)
    if not d:
        return 0
    R = rows(d, 'src/data/ladder.js')
    if len(R) != 9:
        raise SystemExit(f'AA_763@{d["_sha"]}：ladder.js 應該是 9 列（招呼 7＋坐後座 2），讀到 {len(R)} 列')
    n = 0
    for r in R:
        w = r.get('where', '')
        m = re.match(r'byTerm\.(Y\dS\d)\.' + PS + r'\.greet\.when', w)
        if m:
            when = (((out.get('byTerm') or {}).get(m.group(1)) or {}).get(PS) or {}).get('greet', {}).get('when') or []
            hit = [q for q in when if q.get('t') == r['old']]
            if not hit and sum(1 for q in when if q.get('t') == r['new']) == 1:
                continue   # 上游的稿自己改好了
            if len(hit) != 1:
                raise SystemExit(f'AA_763 ladder.js（{w}）：old 在那一學期沛珊的招呼 when 裡對到 {len(hit)} 則（要剛好 1 則）：{r["old"]}')
            hit[0]['t'] = r['new']; n += 1
            continue
        m = re.match(r'bikeSeat\.' + PS + r'\.(onFirst|offFirst)$', w)
        if m:
            b = (out.get('bikeSeat') or {}).get(PS) or {}
            if b.get(m.group(1)) == r['new']:
                continue
            if b.get(m.group(1)) != r['old']:
                raise SystemExit(f'AA_763 ladder.js（{w}）：現在是「{b.get(m.group(1))}」，不是原句「{r["old"]}」')
            b[m.group(1)] = r['new']; n += 1
            continue
        raise SystemExit(f'AA_763 ladder.js：不認得的位置 {w}')
    return n


def apply_msgs(person, root, allow=None, file='src/data/msg2_pool.js'):
    """person＝msg2_pool 的 people.classmate_peishan。replies[].msgs 裡整句等於 old 的那一格換成 new（稿的 count＝全部回覆裡出現幾格）；換過的那一則多一格 ps763＝新稿的來源。回傳換了幾格"""
    d = load(root, allow)
    if not d:
        return 0
    n = 0
    for r in rows(d, file):
        want = int(r.get('count', 1))
        hit = [(e, i) for e in person.get('replies', []) for i, t in enumerate(e.get('msgs') or []) if t == r['old']]
        if not hit and sum(1 for e in person.get('replies', []) for t in (e.get('msgs') or []) if t == r['new']) == want:
            continue
        if len(hit) != want:
            raise SystemExit(f'AA_763 {file}：old 在 {PS} 的回覆裡對到 {len(hit)} 格（要剛好 {want} 格）：{r["old"]}')
        for e, i in hit:
            e['msgs'][i] = r['new']; e['ps763'] = tag(root, allow); n += 1
    return n


def tag(root, allow=None):
    """來源說明用：'AA_763_peishan_misc3.json@sha'；沒有＝''"""
    d = load(root, allow)
    return f'{os.path.basename(PATH)}@{d["_sha"]}' if d else ''
