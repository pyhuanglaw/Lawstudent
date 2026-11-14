#!/usr/bin/env python3
"""通用的「整句相同才換」覆蓋層（X324 D 區，LAWWW 2026-11-11 定）：AA 的稿＝files[{who, file, rows[{at, old, new, note[, topic, tier]}]}]，at＝那個遊戲檔資料底下的路徑。
**白名單（docs/handoff/story_import_allow.json）一檔一筆、帶 "overlay": true＝匯**——加一筆就用，不用改工具：
    AA_783_invite_replies.json（invite_replies＋invites）、AA_784_invites.json（invites）、AA_785_msg_pools.json（msg_pool、msg2_pool）……
每個遊戲檔各有一支工具呼叫這裡，只拿 file 欄是自己的那幾列：
    invite_replies → tools/invite/build_replies.py 最後一步（產生檔，照 <列 id>.lines[i] 換）
    invites        → tools/invite/apply_overlay.py（手寫的 src/data/invites.js：改原始碼那一個字串，at 當驗證）
    msg_pool／msg2_pool → tools/msg/to_js.py、to_js2.py 最後一步（產生檔，照 people.<id>.replies[i]…換）
驗證（和 tools/ladder/import_ladder.py 的 AA781 同一套）：白名單一檔一筆、approved、讀那一版；最上層只認 _meta、files；一列只認 at、old、new、note（msg 另外 topic、tier）；
old ≠ new、都是字串；讀稿換名（read_fix）以後字不能變（稿要寫遊戲現在的字）；at 那一格要剛好等於 old，對不到就停（不猜）；同一個檔同一個 at 不能兩列。"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROW_KEYS = {'at', 'old', 'new', 'note', 'topic', 'tier'}


def docs(root, allow=None):
    """白名單上 overlay:true、approved 的稿（照白名單的順序）：[(path, sha, doc)]"""
    allow = allow or IG.load(root)
    out, seen = [], set()
    for e in allow.get('files', []):
        if not e.get('overlay'):
            continue
        p = e.get('path')
        if p in seen:
            raise SystemExit(f'{p}：白名單有兩筆 overlay（一檔一筆）')
        seen.add(p)
        if e.get('status') != 'approved':
            raise SystemExit(f'{p}@{e.get("sha")}：overlay 的稿白名單狀態是 {e.get("status")}，不是 approved')
        ok, why = IG.allowed(p, e.get('sha'), allow)
        if not ok:
            raise SystemExit('拒絕匯入：' + why)
        raw = subprocess.check_output(['git', '-C', root, 'show', f'{e["sha"]}:{p}']).decode('utf-8')
        d = json.loads(raw)
        if json.dumps(d, ensure_ascii=False) != json.dumps(json.loads(IG.read_fix(raw)), ensure_ascii=False):
            raise SystemExit(f'{p}@{e["sha"]}：讀稿換名（read_fix）以後字變了——稿要寫遊戲現在的字，請 AA 改稿')
        check_doc(d, f'{p}@{e["sha"]}')
        out.append((p, e['sha'], d))
    return out


def check_doc(d, tag):
    if not isinstance(d, dict) or set(d) - {'_meta', 'files'} or not isinstance(d.get('files'), list):
        raise SystemExit(f'{tag}：最上層只認 _meta、files（陣列）')
    for i, f in enumerate(d['files']):
        if not isinstance(f, dict) or set(f) - {'who', 'file', 'rows', 'note'} or not isinstance(f.get('rows'), list) or not isinstance(f.get('file'), str) or not isinstance(f.get('who'), str):
            raise SystemExit(f'{tag} files[{i}]：只認 who、file、rows（note）')
        for j, r in enumerate(f['rows']):
            w = f'{tag} files[{i}]（{f["who"]} {f["file"]}）rows[{j}]'
            if not isinstance(r, dict) or set(r) - ROW_KEYS:
                raise SystemExit(f'{w}：只認 {sorted(ROW_KEYS)}')
            if not all(isinstance(r.get(k), str) and r[k] for k in ('at', 'old', 'new')) or r['old'] == r['new']:
                raise SystemExit(f'{w}：at、old、new 要是字串、old ≠ new')


def rows(root, file, allow=None):
    """這個遊戲檔的列：[{who, at, old, new, note, topic?, tier?, src}]（src＝稿@sha）；同一個 at 兩列＝停"""
    out, seen = [], {}
    for p, sha, d in docs(root, allow):
        for f in d['files']:
            if f['file'] != file:
                continue
            for r in f['rows']:
                x = dict(r, who=f['who'], src=f'{p}@{sha}')
                if r['at'] in seen:
                    raise SystemExit(f'{file} {r["at"]}：{seen[r["at"]]} 和 {x["src"]} 都有這一格（同一格只能一列）')
                seen[r['at']] = x['src']
                out.append(x)
    return out


def sources(root, file, allow=None):
    """有這個遊戲檔的列的稿：['path@sha', …]（寫進產生檔的來源說明）"""
    return [f'{p}@{sha}' for p, sha, d in docs(root, allow) if any(f['file'] == file for f in d['files'])]


def parse(at):
    """people.heroine_01.walk.any[2].l[0] → ['people', 'heroine_01', 'walk', 'any', 2, 'l', 0]"""
    toks, i = [], 0
    for m in re.finditer(r'\.?([A-Za-z_$][\w$]*)|\[(\d+)\]|\[("(?:[^"\\]|\\.)*")\]', at):
        if m.start() != i:
            raise SystemExit(f'看不懂的路徑：{at}')
        i = m.end()
        toks.append(m.group(1) if m.group(1) is not None else (int(m.group(2)) if m.group(2) is not None else json.loads(m.group(3))))
    if i != len(at) or not toks:
        raise SystemExit(f'看不懂的路徑：{at}')
    return toks


def get(o, toks):
    for k in toks:
        if isinstance(k, int):
            if not isinstance(o, list) or k >= len(o):
                return None
        elif not isinstance(o, dict) or k not in o:
            return None
        o = o[k]
    return o


def put(o, toks, v):
    for k in toks[:-1]:
        o = o[k]
    o[toks[-1]] = v
