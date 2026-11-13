#!/usr/bin/env python3
"""AA_755_peishan_feed_misc.json（PEISHAN-VOICE-1110，使用者 X327 沛珊重寫第三份之二：動態牆八則、其他檔零散的句子、節日整段）——給各匯入工具疊稿用。

這份稿的 other 是「逐則 old→new」：哪個遊戲檔（file）、在哪裡（at）、舊的（old）、新的（new）。工具產生的資料檔不能手改，所以每支匯入工具在寫檔以前呼叫這裡：
    import ps755; n = ps755.apply(data, 'arc_rot.js', ROOT)        # data 裡 classmate_peishan 底下、整組相同的才換；回傳換了幾處
- 白名單（docs/handoff/story_import_allow.json）上有這份稿、approved、而且是 SHA 那一版才讀（**只認這一版**；AA 再改稿＝先改這裡的 SHA 和白名單）；白名單沒有＝不換（回 0）。
- old 在 classmate_peishan 底下要剛好對到一處；對不到、或對到兩處以上就停下來（不猜、不硬換）。已經是 new（上游的稿自己改好了）＝跳過。
- 手寫的資料檔（invites.js、fest_events.js、feed_*.js）直接改檔，逐字比對在 tests/peishan_feed_misc_1111_unit.js。
用到的工具：tools/msg/to_js.py（msg_pool.js）、tools/invite/build_replies.py（invite_replies.js）、tools/story/import_activity_scenes.py、tools/story/import_arc_rot.py、tools/gift/import_gift_holiday.py。"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

PATH = 'docs/story_planning/AA_755_peishan_feed_misc.json'
SHA = '24bd0e59e9'
PS = 'classmate_peishan'
_CACHE = {}
# 上游的稿把沛珊那一塊整個重寫了＝這份稿在那個遊戲檔的列不再疊（old、new 都不在新稿裡）。逐字比對改看上游的稿。
SUPERSEDED = {'activity_scenes.js': 'AA_708_activity_scenes.json@d30416e6b（2026-11-11 X324 A 區：沛珊整塊重寫，AA 交付訊息 07:20）'}


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
        raise SystemExit(f'{PATH}@{sha}：沛珊的稿只認 {SHA}（要換版本先改 tools/story/ps755.py 的 SHA）')
    raw = subprocess.check_output(['git', '-C', root, 'show', f'{sha}:{PATH}']).decode('utf-8')
    d = json.loads(IG.read_fix(raw))
    d['_sha'] = sha
    _CACHE[root] = d
    return d


def rows(d, file):
    """other 裡這個遊戲檔的列：[(at, old, new)]（old／new 照稿：字串陣列或單一字串）"""
    return [(r['at'], r['old'], r['new']) for r in (d or {}).get('other', []) if r.get('file') == file]


def sentence_map(d, file):
    """一句對一句的那幾列 → {舊句: 新句}（invite_replies.js 這種一列一句的表用）"""
    out = {}
    for at, old, new in rows(d, file):
        if isinstance(old, list) and isinstance(new, list) and len(old) == 1 and len(new) == 1:
            out[old[0]] = new[0]
    return out


def _subtrees(o, out):
    if isinstance(o, dict):
        for k, v in o.items():
            if k == PS:
                out.append(v)
            else:
                _subtrees(v, out)
    elif isinstance(o, list):
        for v in o:
            _subtrees(v, out)
    return out


def _find(o, target, hits):
    """target 是陣列＝找內容整組相同的陣列；是字串＝找值等於它的那一格。hits：[(容器, key)]"""
    it = o.items() if isinstance(o, dict) else (enumerate(o) if isinstance(o, list) else [])
    for k, v in list(it):
        if v == target and type(v) is type(target):
            hits.append((o, k))
        elif isinstance(v, (dict, list)):
            _find(v, target, hits)
    return hits


def apply(data, file, root, allow=None, only=None):
    """data（匯入工具組好的資料）裡 classmate_peishan 底下：稿上 file 的每一列 old → new。回傳換了幾處。only＝只換 at 裡有這段字的列（同一個遊戲檔分兩支工具產生時用）"""
    if file in SUPERSEDED:
        return 0
    d = load(root, allow)
    if not d:
        return 0
    trees = _subtrees(data, [])
    n = 0
    for at, old, new in rows(d, file):
        if only and only not in at:
            continue
        hits = [h for t in trees for h in _find(t, old, [])]
        if new is None:   # 24bd0e59e9 起：new 是 null＝那一格拿掉（只拿陣列裡的一格；已經沒有＝跳過）
            hits = [(c, k) for c, k in hits if isinstance(c, list)]
            if not hits:
                continue
            if len(hits) != 1:
                raise SystemExit(f'AA_755 {file}（{at}）：要拿掉的 old 在 {PS} 底下有 {len(hits)} 格：{json.dumps(old, ensure_ascii=False)[:80]}')
            c, k = hits[0]
            del c[k]
            n += 1
            continue
        if len(hits) != 1:
            if not hits and sum(len(_find(t, new, [])) for t in trees) == 1:
                continue   # 上游的稿自己改好了
            raise SystemExit(f'AA_755 {file}（{at}）：old 在 {PS} 底下對到 {len(hits)} 處（要剛好 1 處）：{json.dumps(old, ensure_ascii=False)[:80]}')
        c, k = hits[0]
        c[k] = list(new) if isinstance(new, list) else new
        n += 1
    return n


def remove(data, text, root, allow=None):
    """classmate_peishan 底下、陣列裡等於 text 的那一格拿掉（剛好一格；已經沒有＝跳過）。回傳拿掉幾格"""
    if not load(root, allow):
        return 0
    hits = [h for t in _subtrees(data, []) for h in _find(t, text, [])]
    hits = [(c, k) for c, k in hits if isinstance(c, list)]
    if not hits:
        return 0
    if len(hits) != 1:
        raise SystemExit(f'AA_755：要拿掉的「{text[:30]}…」在 {PS} 底下有 {len(hits)} 格')
    c, k = hits[0]
    del c[k]
    return 1


def tag(root, allow=None):
    """來源說明用：'AA_755_peishan_feed_misc.json@sha'；沒有＝''"""
    d = load(root, allow)
    return f'{PATH}@{d["_sha"]}' if d else ''
