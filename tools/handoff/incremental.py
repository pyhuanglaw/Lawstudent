#!/usr/bin/env python3
"""增量交接（使用者 2026-10-17 P0「交接制度效能改善」）：四職位已核對水位線、結構化分類、交付當下登記、永久 WIP 索引。

檔案（都在 docs/handoff/）：
  watermarks.json   四職位各一條「已核對到哪個 commit」：{roles: {職位: {branch, sha（完整）, at, by, scanned, open: [ID…], history: […]}}}
                    只有 incr --advance 在「全部分類、沒有異常、分類結果已 commit＋push」時才前進；舊的寫進 history。
  outbox_<職位>.json 各職位在**自己的分支**上，交付或留 WIP 的當下登記（LAWWW 用 incr 讀；不靠 commit 訊息猜）：
                    {role, entries: [{task, branch, sha, files: [...], state, remaining, next, noDirectIntegrate, receiver, ack}]}
  wip.json          永久 WIP 索引（LAWWW 維護）：{items: [{id, role, task, branch, sha, files, state, next, noDirectIntegrate, closedBy?}]}
  deliveries.json   照舊；ignored 的新項目要有 kind（列舉）：not_delivery（reason）／covered（coveredBy＝存在的交付或任務 ID）／
                    wip（task）／handoff_record（交班、接班登記本身）。**不再用自由文字判斷「已涵蓋」「非交付」**。
水位線之前的舊 commit 不重掃；之後的每一個非合併 commit 都要有分類（不靠關鍵字）。
水位線不是分支的祖先（歷史改寫、分岔）、SHA 不存在、職位沒有水位線、記錄的未結項目不見 → 異常（fail closed）。"""
import json, os, re, subprocess, time

STATES = ['WIP', '已交付', '已整合', '已測試', '已驗收']
STATE_ALIAS = {'DELIVERED': '已交付', 'INTEGRATED': '已整合', 'TESTED': '已測試', 'ACCEPTED': '已驗收'}
CLOSED_WIP = {'已整合', '已測試', '已驗收', '取消'}
KINDS = {'not_delivery', 'covered', 'wip', 'handoff_record'}
ACKS = ['未派', 'SENT', 'DELIVERED', 'ACK', 'ACTIONED', '自領']
OUTBOX_KEYS = ('task', 'branch', 'sha', 'files', 'state', 'next', 'receiver', 'ack')
ROLES = ['LAWWW', 'LAWWW2', 'AA', 'BB']
WM = 'docs/handoff/watermarks.json'
WIP = 'docs/handoff/wip.json'
OUTBOX = 'docs/handoff/outbox_{role}.json'

# ---------- 「全部待辦」段落（取代 todo_section 的自由文字比對） ----------
_HEAD = re.compile(r'^(#+)\s+.*全部待辦')          # markdown 標題：「## 全部待辦」「## 📋 LAWWW2 全部待辦（…）」「#### B. 未完成任務：BB 全部待辦」
_BUL = re.compile(r'^(\s*)[-*]\s+(?:\*\*|【)?\s*全部待辦(?:\*\*|】)?\s*(?:[（(][^）)]*[）)])?\s*[:：]?\s*$')   # 「- **全部待辦**（D93）：」整行就是標題
ID_RE = re.compile(r'(?<![A-Za-z0-9_./-])[A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)+')
OFF = re.compile(r'【表外】')


def todo_check(text):
    """回傳 (起始行號或 None, 段落各行, 問題列表)。只認錨定的標題：含「全部待辦」的 markdown 標題（# 開頭）、或整行只有「全部待辦」的條列。
    正文提到「全部待辦」不算；找不到、0 項、一個 ID 都沒有（也沒標【表外】）都算問題——不能假通過。"""
    lines = text.splitlines()
    mention = any('全部待辦' in l for l in lines)
    for i, l in enumerate(lines):
        h, b = _HEAD.match(l), _BUL.match(l)
        if not h and not b:
            continue
        out = []
        for l2 in lines[i + 1:]:
            h2 = re.match(r'^(#+)\s', l2)
            if h and h2 and len(h2.group(1)) <= len(h.group(1)):
                break
            if b:
                if h2:
                    break
                m = re.match(r'^(\s*)[-*]\s', l2)
                if m and len(m.group(1)) <= len(b.group(1)):
                    break
            out.append(l2)
        rows = [x for x in out if x.strip() and not re.match(r'^\s*\|[\s|:-]*$', x)]
        probs = []
        if not rows:
            probs.append(f'第 {i + 1} 行的「全部待辦」段落是空的（0 項）')
        elif not any(ID_RE.search(x) or OFF.search(x) for x in rows):
            probs.append(f'第 {i + 1} 行的「全部待辦」段落有 {len(rows)} 行，但一個任務 ID 都沒有、也沒標【表外】')
        return i + 1, out, probs
    if mention:
        return None, [], ['只有正文提到「全部待辦」，沒有「## 全部待辦」標題或整行的「- 全部待辦：」條列（不能當成段落）']
    return None, [], ['沒有「全部待辦」一節']


# ---------- 分類 ----------
def classify_problems(e, dids, tids):
    """deliveries.json 的 ignored 一筆：kind 一定要是列舉值，每種要有可以驗證的欄位。回傳問題列表（空＝合格）。"""
    sha = e.get('sha', '?')
    k = e.get('kind')
    if not k:
        return [f'{sha}：沒有 kind（只有自由文字「{str(e.get("why", ""))[:40]}」不算分類；改成 {"／".join(sorted(KINDS))}）']
    if k not in KINDS:
        return [f'{sha}：kind「{k}」不是 {"／".join(sorted(KINDS))} 之一']
    if k == 'covered':
        c = e.get('coveredBy')
        if not c or c not in dids and c not in tids:
            return [f'{sha}：kind=covered，coveredBy「{c}」不是存在的交付 ID 或任務 ID']
    if k == 'wip' and e.get('task') not in tids:
        return [f'{sha}：kind=wip，任務「{e.get("task")}」不在總表']
    if k in ('not_delivery', 'handoff_record') and not str(e.get('reason', '')).strip():
        return [f'{sha}：kind={k} 要寫 reason']
    return []


def norm_state(s):
    return STATE_ALIAS.get(s, s)


def _task_ok(task, tids):
    """outbox 的 task：整個是任務 ID；或開頭是任務 ID、後面接空白或括號的說明（例「BADMINTON-CLIP-1027 第二版」「PARK-ENTRY-B-1027（B08）」）。
    只看開頭那一段是不是總表的 ID，不做「包含」的判斷（D94）。"""
    if task in tids:
        return True
    m = re.match(r'[A-Za-z0-9][A-Za-z0-9_.-]*', task or '')
    return bool(m) and m.group(0) in tids and task[m.end()] in ' （(　'


def delivered_tasks(dv, tids):
    """交付登記（LAWWW 已經對到總表任務的）：commit 前 7 碼 → 任務。一筆交付寫好幾個任務的（「、」分隔），每一個都要在總表。"""
    out = {}
    for d in (dv or {}).get('deliveries', []):
        ts = [x for x in re.split(r'[、,\s]+', str(d.get('task') or '')) if x]
        if not ts or any(x not in tids for x in ts):
            continue
        for s in re.split(r'[／/、,\s]+', str(d.get('sha', ''))):
            if len(s) >= 7:
                out[s[:7]] = d.get('id')
    return out


def outbox_problems(ob, tasks, dv=None):
    tids = {t['id'] for t in tasks.get('tasks', [])} | {a for t in tasks.get('tasks', []) for a in t.get('aliases') or []}
    dlt = delivered_tasks(dv, tids)
    out = []
    if not isinstance(ob, dict) or not isinstance(ob.get('entries'), list):
        return ['outbox 格式不對（要有 entries 陣列）']
    for n, e in enumerate(ob['entries'], 1):
        tag = f'outbox {ob.get("role", "?")} 第 {n} 筆（{e.get("sha", "?")}）'
        for k in OUTBOX_KEYS:
            if k == 'files':
                if not isinstance(e.get('files'), list) or not e['files']:
                    out.append(f'{tag}：缺 files（具體檔案路徑）')
            elif not e.get(k):
                out.append(f'{tag}：缺 {k}')
        if not isinstance(e.get('noDirectIntegrate'), bool):
            out.append(f'{tag}：noDirectIntegrate 要是 true／false')
        st = norm_state(e.get('state'))
        if e.get('state') and st not in STATES:
            out.append(f'{tag}：state「{e.get("state")}」不是 {"／".join(STATES)} 之一')
        if st == 'WIP' and not e.get('remaining'):
            out.append(f'{tag}：WIP 要寫 remaining（還沒做完的）')
        if e.get('ack') and e['ack'] not in ACKS:
            out.append(f'{tag}：ack「{e["ack"]}」不是 {"／".join(ACKS)} 之一')
        if e.get('task') and not _task_ok(e['task'], tids) and str(e.get('sha', ''))[:7] not in dlt:
            out.append(f'{tag}：任務 {e["task"]} 不在總表（同一個 commit 也沒有對到總表任務的交付登記）')
    return out


def wip_problems(w, tasks, root=None):
    tids = {t['id'] for t in tasks.get('tasks', [])}
    out, seen = [], set()
    for x in w.get('items', []):
        i = x.get('id', '?')
        if i in seen:
            out.append(f'WIP {i}：ID 重複')
        seen.add(i)
        for k in ('role', 'task', 'branch', 'sha', 'files', 'state', 'next'):
            if not x.get(k):
                out.append(f'WIP {i}：缺 {k}')
        if not isinstance(x.get('noDirectIntegrate'), bool):
            out.append(f'WIP {i}：noDirectIntegrate 要是 true／false')
        if x.get('task') and x['task'] not in tids:
            out.append(f'WIP {i}：任務 {x["task"]} 不在總表')
        st = norm_state(x.get('state'))
        if st not in STATES and st != '取消':
            out.append(f'WIP {i}：state「{x.get("state")}」不合法')
        if st in CLOSED_WIP and not x.get('closedBy'):
            out.append(f'WIP {i}：{st} 要寫 closedBy（commit 或交付 ID）')
        if root and x.get('sha'):
            for s in re.split(r'[、,\s]+', x['sha']):
                if s and _git(root, 'cat-file', '-e', s + '^{commit}')[0] != 0:
                    out.append(f'WIP {i}：commit {s} 找不到（先 fetch；被改寫的話要追查）')
            s0 = re.split(r'[、,\s]+', x['sha'])[0]
            for f in x.get('files') or []:   # 檔案要能在那個 commit 找到（定位得到才算找得回來）
                if not f.endswith('/') and _git(root, 'cat-file', '-e', f'{s0}:{f}')[0] != 0:
                    out.append(f'WIP {i}：{f} 在 {s0} 找不到')
    return out


def wip_diff(prev, cur):
    """上一班的 WIP 每一項都要還在（可以改狀態，結案要有 closedBy）；不能無故消失。"""
    now = {x['id']: x for x in cur.get('items', [])}
    out = []
    for x in prev.get('items', []):
        y = now.get(x['id'])
        if not y:
            out.append(f'WIP {x["id"]}（{x.get("task")}）上一班還在、現在不見了：恢復，或改狀態並寫 closedBy')
        elif norm_state(y.get('state')) in CLOSED_WIP and not y.get('closedBy'):
            out.append(f'WIP {x["id"]}：改成 {y.get("state")} 但沒有 closedBy')
    return out


# ---------- git ----------
GIT_CALLS = 0


def _git(root, *a):
    global GIT_CALLS
    GIT_CALLS += 1
    p = subprocess.run(['git', *a], cwd=root, capture_output=True, text=True)
    return p.returncode, p.stdout.strip()


def _ref(branch, remote):
    return f'origin/{branch}' if remote and not branch.startswith('origin/') else branch


REGISTRY = re.compile(r'^docs/handoff/(outbox_[A-Z0-9]+\.json|duty_[A-Z0-9]+\.json|user_asks_[A-Z0-9]+\.json|snapshots/.+\.json)$')   # user_asks：HV-18 各職位的使用者要求檔（INCR-CLEANUP-1021 加）


def only_registry(root, sha):
    rc, files = _git(root, '-c', 'core.quotepath=off', 'diff-tree', '--no-commit-id', '--name-only', '-r', sha)
    fs = [f for f in files.splitlines() if f]
    return rc == 0 and bool(fs) and all(REGISTRY.match(f) for f in fs)


PROGRESS_FILES = {   # 各職位自己的交接檔（進度紀錄）：只改這些的 commit＝進度紀錄，照路徑分類
    'LAWWW2': ['docs/art-rebuild/second_ai/HANDOFF.md'],
    'AA': ['docs/story_planning/AA_交接紀錄.md'],
    'BB': ['docs/story_planning/BB_00_協作規範與交接紀錄.md'],
}


def path_owner(files, role, outbox):
    """一個 commit 改的檔案，是不是全部落在這個職位 outbox 登記過的檔案（或資料夾，結尾 /）、或它自己的交接檔裡。
    是＝回傳說明（歸到哪個任務）；否＝None。照路徑判斷，不看 commit 訊息。"""
    fs = [f for f in files if f]
    if not fs:
        return None
    own = PROGRESS_FILES.get(role, [])
    entries = (outbox or {}).get('entries', [])
    hit = set()
    for f in fs:
        if f in own or REGISTRY.match(f):
            hit.add('進度紀錄')
            continue
        m = [e for e in entries if any(f == x or (x.endswith('/') and f.startswith(x)) for x in e.get('files') or [])]
        if not m:
            return None
        hit.add(m[-1].get('task'))
    return 'outbox 路徑：' + '、'.join(sorted(h for h in hit if h))


def any_owner(files, role, outboxes):
    """先看這個分支的職位，再看其他職位（例：AA 的 commit 合併進 BB 分支，照 AA 的 outbox 分類）。"""
    for r in [role] + [x for x in ROLES if x != role]:
        o = path_owner(files, r, (outboxes or {}).get(r))
        if o:
            return o
    return None


def commit_files(root, sha):
    rc, out = _git(root, '-c', 'core.quotepath=off', 'diff-tree', '--no-commit-id', '--name-only', '-r', sha)   # 中文檔名不要轉成 \345… 跳脫（2026-10-17：不加這個，中文檔名永遠比對不到）
    return out.splitlines() if rc == 0 else []


def outbox_shas(root, duty, remote=True, read_local=None):
    """各職位分支上的 outbox 登記過的 commit（前 7 碼 → 說明）。check 第 6 項也用它，交付登記在 outbox 就不用再進 deliveries。"""
    out = {}
    for role, x in ((duty or {}).get('roles') or {}).items():
        br = (x or {}).get('branch')
        if not br:
            continue
        rc, txt = _git(root, 'show', f'{_ref(br, remote)}:{OUTBOX.format(role=role)}')
        if rc:
            continue
        try:
            for e in json.loads(txt).get('entries', []):
                if len(str(e.get('sha', ''))) >= 7:
                    out[str(e['sha'])[:7]] = f'outbox {role} {norm_state(e.get("state"))} {e.get("task")}'
        except Exception:
            pass
    return out


def scan(root, wm, dv, tasks, duty, remote=True, outboxes=None, roles=None):
    """每個職位：水位線以後、別的職位水位線以前沒有的非合併 commit，逐一看有沒有分類。只讀。"""
    outboxes = outboxes or {}
    tids = {t['id'] for t in tasks.get('tasks', [])} | {a for t in tasks.get('tasks', []) for a in t.get('aliases') or []}
    dids = {d.get('id') for d in dv.get('deliveries', [])}
    shas = {}   # 前 7 碼 → 怎麼分類的
    for d in dv.get('deliveries', []):
        for s in re.split(r'[／/、,\s]+', str(d.get('sha', ''))):
            if len(s) >= 7:
                shas[s[:7]] = f'交付 {d.get("id")}'
    for t in tasks.get('tasks', []):
        for s in t.get('sha') or []:
            if len(str(s)) >= 7:
                shas[str(s)[:7]] = f'任務 {t["id"]}'
    bad_ignored = {}
    for e in dv.get('ignored', []):
        p = classify_problems(e, dids, tids)
        s = str(e.get('sha', ''))[:7]
        if p:
            bad_ignored[s] = p
        else:
            shas[s] = f'ignored {e.get("kind")}'
    ob_probs = {}
    for role, ob in outboxes.items():
        ob_probs[role] = outbox_problems(ob, tasks, dv)
        for e in ob.get('entries', []):
            if len(str(e.get('sha', ''))) >= 7:
                shas[str(e['sha'])[:7]] = f'outbox {role} {norm_state(e.get("state"))} {e.get("task")}'
    wroles = wm.get('roles') or {}
    open_ok = tids | dids | {x.get('id') for x in (wm.get('_wip') or {}).get('items', [])}
    res = {}
    for role in roles or ROLES:
        dr = ((duty or {}).get('roles') or {}).get(role) or {}
        w = wroles.get(role)
        r = {'branch': dr.get('branch') or (w or {}).get('branch'), 'new': 0, 'scanned': 0, 'unclassified': [], 'problems': list(ob_probs.get(role, [])), 'tip': None, 'classified': 0}
        res[role] = r
        if not w or not w.get('sha'):
            r['problems'].append(f'{role}：沒有水位線（watermarks.json）；先建立基準')
            continue
        if not r['branch']:
            r['problems'].append(f'{role}：duty.json 沒有這個職位的分支')
            continue
        ref = _ref(r['branch'], remote)
        rc, tip = _git(root, 'rev-parse', '--verify', '-q', ref + '^{commit}')
        if rc:
            r['problems'].append(f'{role}：分支 {ref} 找不到（先 git fetch）')
            continue
        r['tip'] = tip
        if _git(root, 'cat-file', '-e', w['sha'] + '^{commit}')[0]:
            r['problems'].append(f'{role}：水位線 {w["sha"][:10]} 這個 commit 不存在（被改寫或資料毀損）——要追查，不能前進')
            continue
        if _git(root, 'merge-base', '--is-ancestor', w['sha'], tip)[0]:
            r['problems'].append(f'{role}：水位線 {w["sha"][:10]} 不是 {ref} 的祖先（歷史改寫、分岔、或換了沒合併上一任的分支）——fail closed，範圍補核或回報使用者')
            continue
        excl = []
        for o, ow in wroles.items():
            if o != role and ow.get('sha') and _git(root, 'cat-file', '-e', ow['sha'] + '^{commit}')[0] == 0:
                excl.append('^' + ow['sha'])   # 別的職位已核對過的（企劃線互相合併）不重算
        rc, total = _git(root, 'rev-list', '--count', '--no-merges', f'{w["sha"]}..{tip}')
        rc, lines = _git(root, 'log', '--no-merges', '--format=%H %s', f'{w["sha"]}..{tip}', *excl)
        lst = [l for l in lines.splitlines() if l]
        r['new'] = int(total or 0)
        r['scanned'] = len(lst)
        if w.get('classify') is False:   # 值班 LAWWW 的整合分支：不逐筆分類（成果寫在 tasks.json），祖先與未結項目照查
            r['classified'] = len(lst)
            lst = []
        for l in lst:
            s, subj = l[:40], l[41:]
            if s[:7] in bad_ignored:
                r['problems'] += bad_ignored[s[:7]]
                r['unclassified'].append((s[:8], subj[:80]))
            elif s[:7] in shas:
                r['classified'] += 1
            elif only_registry(root, s):   # 只改登記檔（outbox、duty_*.json、快照）：照檔案路徑分類，不看訊息文字
                r['classified'] += 1
            elif any_owner(commit_files(root, s), role, outboxes):   # 只改 outbox 已登記的檔案或交接檔（企劃線互相合併：別的職位登記的檔案也算那個職位的）
                r['classified'] += 1
            else:
                r['unclassified'].append((s[:8], subj[:80]))
        for i in w.get('open') or []:
            if i not in open_ok:
                r['problems'].append(f'{role}：水位線記的未結項目 {i} 不在總表／交付／WIP 索引——查清楚（不能被水位線藏起來）')
    return res


def advance(root, wm, res, role, by, remote=True, dry=False, open_ids=None):
    """只有這個職位全部分類、沒有異常才前進；remote 時另外要求分類結果（docs/handoff/）已 commit 而且 push 了。"""
    r = res.get(role)
    if not r:
        return False, f'{role}：沒有掃描結果'
    if r['problems'] or r['unclassified']:
        return False, f'{role}：還有 {len(r["unclassified"])} 個未分類、{len(r["problems"])} 個異常——水位線不前進'
    if not r['tip']:
        return False, f'{role}：沒有分支最新 commit'
    if remote:
        rc, st = _git(root, 'status', '--porcelain', '--', 'docs/handoff/')
        if st:
            return False, 'docs/handoff/ 有沒 commit 的修改：分類結果要先 commit＋push 才能前進水位線'
        rc, head = _git(root, 'rev-parse', 'HEAD')
        rc2, br = _git(root, 'rev-parse', '--abbrev-ref', 'HEAD')
        rc3, up = _git(root, 'rev-parse', '--verify', '-q', f'origin/{br}')
        if rc3 or up != head:
            return False, f'本機 {br} 還沒 push（HEAD {head[:8]}、origin {up[:8] if up else "無"}）：先 push、核對遠端 SHA 再前進'
    if dry:
        return True, f'{role}：可以前進到 {r["tip"][:10]}（{r["scanned"]} 個 commit 都分類了）'
    w = wm['roles'][role]
    hist = w.setdefault('history', [])
    hist.append({k: w.get(k) for k in ('branch', 'sha', 'at', 'by', 'scanned')})
    w.update({'branch': r['branch'], 'sha': r['tip'], 'at': time.strftime('%Y-%m-%dT%H:%MZ', time.gmtime()), 'by': by, 'scanned': r['scanned']})
    if open_ids is not None:
        w['open'] = open_ids
    return True, f'{role}：水位線前進到 {r["tip"][:10]}'
