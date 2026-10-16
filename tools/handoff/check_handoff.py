#!/usr/bin/env python3
"""交接自動對帳（D82；規則：docs/AI_SESSION_HANDOFF.md 第 4、5 節）。

只讀不寫任務：這支工具**不改、不取消、不刪任何任務**，只列出異常。
唯一會寫檔的是 `snapshot` 指令（在 docs/handoff/snapshots/ 新增一個快照檔）。

  python3 tools/handoff/check_handoff.py check   [--role LAWWW] [--snapshot 檔] [--ref origin/<規則來源分支>] [--no-git]
  python3 tools/handoff/check_handoff.py snapshot --role LAWWW --account B [--kind handoff|checkpoint]
  python3 tools/handoff/check_handoff.py queue   [--owner LAWWW] [-n 15]

check 的七項（使用者 2026-10-16 指示）＋兩項補充：
  1 上次快照的任務 ID 現在都還在（任務不得消失）
  2 每項任務都有負責人、狀態、下一步（ID 不重複）
  3 狀態是八種合法值之一
  4 「已驗收」有驗收證據
  5 「取消／被取代」有原因和替代 ID（沒有替代＝replacedBy "NONE"＋authorizedBy）；「暫停」有原因和恢復條件
  6 新交付都登記了：deliveries.json 的每一筆對得到任務；交付分支從 scannedThrough 以後符合關鍵字的 commit 都登記或標「不是交付」
  7 未 ACK、待整合、待測試的交付不算完成（連到的任務不能是「已驗收」）
  8 首次出現時間欄位齊全（D81）
  9 閱讀版 docs/HANDOFF_GAP_MATRIX.md 提到的 ID 在 tasks.json 都有（區間如 V5-F1～F27 會展開）

結束碼：0＝七項都檢查了、沒有異常；1＝有異常、或有一項沒辦法檢查（不虛報正常）；
        2＝找不到上次快照或快照壞掉 → REMEDIAL_FULL_AUDIT（要補做一次全面盤點，見總入口第 4 節）。
"""
import argparse, hashlib, json, os, re, subprocess, sys
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TASKS = 'docs/handoff/tasks.json'
DELIV = 'docs/handoff/deliveries.json'
SNAPDIR = 'docs/handoff/snapshots'
MATRIX = 'docs/HANDOFF_GAP_MATRIX.md'
CLOSED = ('已驗收', '取消／被取代')
WAITING = ('等待其他AI／素材', '暫停')
OWNERS = ('LAWWW', 'LAWWW2', 'AA', 'BB', 'USER')
ID_RE = re.compile(r'^[A-Z][A-Z0-9]*-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$')
TERM_RE = re.compile(r'^(Y[0-4]S[12]|META)$')
MD_ID = re.compile(r'(?<![A-Za-z0-9_])((?:BUG|TEST|ART|WIP|V[0-6]|DATE|D14|SYS|SCN|DONE|X)-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)(?:[～~]([A-Za-z]*)(\d+))?')
SNAP_KEYS = ('version', 'taken', 'role', 'account', 'open', 'status')


def canon(i):
    """V5-F01 和 V5-F1 當成同一個 ID（閱讀版習慣不補零）。"""
    return re.sub(r'(?<=[A-Za-z-])0+(?=\d)', '', i)


class Src:
    """讀檔：預設讀工作目錄；--ref 時用 git show 讀那個分支（其他職位不用切分支就能對帳）。"""
    def __init__(self, root, ref=None):
        self.root, self.ref = root, ref

    def read(self, path):
        if self.ref:
            r = subprocess.run(['git', '-C', self.root, 'show', f'{self.ref}:{path}'], capture_output=True)
            if r.returncode:
                raise FileNotFoundError(path)
            return r.stdout.decode('utf-8')
        with open(os.path.join(self.root, path), encoding='utf-8') as f:
            return f.read()

    def listdir(self, path):
        if self.ref:
            r = subprocess.run(['git', '-C', self.root, 'ls-tree', '--name-only', f'{self.ref}:{path}'], capture_output=True)
            return [] if r.returncode else r.stdout.decode().split()
        p = os.path.join(self.root, path)
        return sorted(os.listdir(p)) if os.path.isdir(p) else []


def load_snapshot(src, role, path=None):
    """回傳 (快照, 錯誤)。錯誤不是 None 就是 REMEDIAL_FULL_AUDIT。"""
    if path:
        name = path
    else:
        cands = []
        for n in src.listdir(SNAPDIR):
            if not n.endswith('.json'):
                continue
            try:
                s = json.loads(src.read(f'{SNAPDIR}/{n}'))
            except Exception:
                cands.append(('', n, None))   # 壞掉的檔也要算進去：最新那份壞掉不能默默跳過
                continue
            if s.get('role') == role:
                cands.append((s.get('taken', ''), n, s))
        if not cands:
            return None, f'找不到職位 {role} 的快照（{SNAPDIR}/）'
        cands.sort(key=lambda c: (c[0], c[1]))
        name = f'{SNAPDIR}/{cands[-1][1]}'
        bad = [c[1] for c in cands if c[2] is None]
        if bad and cands[-1][2] is None:
            return None, f'最新的快照壞掉：{bad[-1]}'
    try:
        s = json.loads(src.read(name) if not os.path.isabs(name) else open(name, encoding='utf-8').read())
    except FileNotFoundError:
        return None, f'快照不存在：{name}'
    except Exception as e:
        return None, f'快照讀不了（JSON 壞掉）：{name}：{e}'
    miss = [k for k in SNAP_KEYS if k not in s]
    if miss or not isinstance(s.get('open'), list) or not isinstance(s.get('status'), dict):
        return None, f'快照缺欄位或格式不對：{name}：{miss or "open／status 型別"}'
    s['_file'] = name
    return s, None


def git_lines(root, *args):
    r = subprocess.run(['git', '-C', root, *args], capture_output=True)
    if r.returncode:
        return None
    return r.stdout.decode('utf-8', 'replace').splitlines()


def check(args):
    src = Src(args.root, args.ref)
    out, info, skipped = [], [], []
    A = lambda n, msg: out.append((n, msg))
    try:
        data = json.loads(src.read(TASKS))
    except Exception as e:
        print(f'[致命] {TASKS} 讀不了：{e}')
        print('結果：REMEDIAL_FULL_AUDIT（任務索引壞掉，照總入口第 4 節補做全面盤點）')
        return 2
    statuses = data.get('statuses') or []
    tasks = data.get('tasks') or []
    byid = {}
    for t in tasks:
        i = t.get('id', '')
        if i in byid:
            A(2, f'{i}：ID 重複')
        byid[i] = t
    canon_ids = {canon(i) for i in byid}

    # 1 上次快照的任務都還在
    snap, err = load_snapshot(src, args.role, args.snapshot)
    if err:
        print(f'[快照] {err}')
        print('結果：REMEDIAL_FULL_AUDIT——上次交班的狀態對不起來，這次接班要補做一次全面盤點（總入口第 4 節），不能當作正常。')
        snap_missing = True
    else:
        snap_missing = False
        prev = set(snap['status']) | set(snap['open'])
        for i in sorted(prev):
            if i not in byid:
                A(1, f'{i}：上次快照（{os.path.basename(snap["_file"])}）有、現在不見了')
        changed = [(i, snap['status'].get(i), byid[i]['status']) for i in sorted(prev & set(byid))
                   if snap['status'].get(i) in statuses and snap['status'].get(i) != byid[i]['status']]   # 重建的快照狀態是「未記錄」，不算改變
        new = sorted(set(byid) - prev)
        info.append(f'快照 {os.path.basename(snap["_file"])}（{snap["account"]}／{snap["role"]}，{snap["taken"]}{"，重建" if snap.get("reconstructed") else ""}）：'
                    f'之後改狀態 {len(changed)} 項、新增 {len(new)} 項')
        for i, a, b in changed[:40]:
            info.append(f'  {i}：{a} → {b}')
        if len(changed) > 40:
            info.append(f'  ……另外 {len(changed) - 40} 項')

    for t in tasks:   # 逐筆看（ID 重複時，前一筆的問題不會被後一筆蓋掉）
        i, st = t.get('id', ''), t.get('status')
        # 2 負責人、狀態、下一步
        if not ID_RE.match(i or ''):
            A(2, f'{i!r}：ID 格式不對')
        for k in ('owner', 'status', 'next', 'title'):
            if not str(t.get(k) or '').strip():
                A(2, f'{i}：缺 {k}')
        if t.get('owner') and t['owner'] not in OWNERS:
            A(2, f'{i}：負責人「{t["owner"]}」不是 {"、".join(OWNERS)}')
        # 3 合法狀態
        if st and st not in statuses:
            A(3, f'{i}：狀態「{st}」不是八種合法值')
        # 4 已驗收有證據
        if st == '已驗收' and not str(t.get('evidence') or '').strip():
            A(4, f'{i}：已驗收但沒有 evidence（驗收證據：測試、截圖、使用者確認、SHA）')
        # 5 取消／暫停
        if st == '取消／被取代':
            if not str(t.get('reason') or '').strip():
                A(5, f'{i}：取消但沒有 reason')
            rb = t.get('replacedBy')
            if not rb:
                A(5, f'{i}：取消但沒有 replacedBy（沒有替代就寫 "NONE"＋authorizedBy）')
            elif rb == 'NONE':
                if not t.get('authorizedBy'):
                    A(5, f'{i}：replacedBy NONE 但沒寫誰同意取消（authorizedBy）')
            else:
                for r in re.split(r'[、,，\s]+', rb):
                    if r and r not in byid:
                        A(5, f'{i}：replacedBy {r} 不在任務表')
        if st == '暫停':
            if not t.get('pausedReason'):
                A(5, f'{i}：暫停但沒有 pausedReason')
            if not t.get('resumeWhen'):
                A(5, f'{i}：暫停但沒有 resumeWhen（恢復條件）')
        # 8 首次出現時間（D81）
        if st not in CLOSED:
            f = t.get('first')
            if not isinstance(f, dict):
                A(8, f'{i}：缺 first（首次出現時間）')
            else:
                if not TERM_RE.match(str(f.get('term'))):
                    A(8, f'{i}：first.term「{f.get("term")}」不是 Y0S1～Y4S2／META')
                if not str(f.get('earliest') or '').strip():
                    A(8, f'{i}：缺 first.earliest')
                for k in ('mainline', 'blocks', 'prereq', 'parallel', 'confirmed'):
                    if not isinstance(f.get(k), bool):
                        A(8, f'{i}：first.{k} 要是 true／false')

    # 6、7 交付
    try:
        dv = json.loads(src.read(DELIV))
    except FileNotFoundError:
        dv = None
        A(6, f'{DELIV} 不存在：沒辦法確認新交付有沒有登記')
    except Exception as e:
        dv = None
        A(6, f'{DELIV} 讀不了：{e}')
    if dv is not None:
        known = set()
        for t in tasks:
            for s in t.get('sha') or []:
                known.add(s[:7])
        for d in dv.get('deliveries', []):
            did = d.get('id', '?')
            for k in ('from', 'sha', 'task', 'msg', 'integration'):
                if not d.get(k):
                    A(6, f'交付 {did}：缺 {k}')
            for s in re.split(r'[／/、,\s]+', d.get('sha', '')):
                if s:
                    known.add(s[:7])
            for tid in re.split(r'[、,，\s]+', d.get('task', '')):
                if tid and tid not in byid:
                    A(6, f'交付 {did}：任務 {tid} 不在任務表（交付沒有登記到任務）')
                elif tid and byid[tid]['status'] == '已驗收':
                    # 7 未 ACK／待整合／待測試不算完成
                    if d.get('msg') not in ('ACK', 'ACTIONED'):
                        A(7, f'交付 {did}（{d.get("msg")}）還沒 ACK，任務 {tid} 卻是已驗收')
                    if d.get('integration') not in ('已驗收', '不整合', '參考用'):
                        A(7, f'交付 {did}（{d.get("integration")}）還沒整合或還沒測，任務 {tid} 卻是已驗收')
        for g in dv.get('ignored', []):
            known.add(str(g.get('sha', ''))[:7])
        pat = re.compile(dv.get('pattern') or '交付')
        flagged = set()
        if args.no_git:
            skipped.append('6（交付分支掃描）：--no-git')
        else:
            for br, base in (dv.get('scannedThrough') or {}).items():
                lines = git_lines(args.root, 'log', '--no-merges', '--format=%h %s', f'{base}..{br}')
                if lines is None:
                    skipped.append(f'6（{br} 從 {base} 以後）：git 找不到這個分支或 commit（先 git fetch）')
                    continue
                hits = [l for l in lines if pat.search(l.split(' ', 1)[1] if ' ' in l else '') and l[:7] not in known and l[:7] not in flagged]
                flagged.update(l[:7] for l in hits)   # 企劃線互相合併，同一個 commit 會出現在兩條分支：只報一次
                for l in reversed(hits):
                    A(6, f'{br}：{l[:110]}——符合交付關鍵字但沒登記（登記進 deliveries 或放進 ignored）')
                info.append(f'{br}：{base} 以後 {len(lines)} 個 commit，符合關鍵字未登記 {len(hits)} 個')

    # 9 閱讀版的 ID
    try:
        md = src.read(MATRIX)
        mids = set()
        for m in MD_ID.finditer(md):
            if md[m.end():m.end() + 2] == '-*' or md[m.end():m.end() + 1] == '*':   # V4-R-*：一整組，至少要有一個
                if not any(c.startswith(canon(m.group(1)) + '-') for c in canon_ids):
                    A(9, f'{m.group(1)}-*：{MATRIX} 提到這一組、tasks.json 一個都沒有')
                continue
            mids.add(m.group(1))
            if m.group(3):   # 區間：V5-F1～F27、DATE-L01～L32、SYS-02～04
                head = re.match(r'^(.*?)(\d+)$', m.group(1))
                if head:
                    pre, a, b = head.group(1), int(head.group(2)), int(m.group(3))
                    if pre.endswith(m.group(2) or '') and 0 < b - a < 100:
                        w = len(head.group(2))
                        for n in range(a, b + 1):
                            mids.add(f'{pre}{n:0{w}d}')
        for i in sorted(mids):
            if canon(i) not in canon_ids:
                A(9, f'{i}：{MATRIX} 提到、tasks.json 沒有（沒登記的任務）')
    except FileNotFoundError:
        A(9, f'{MATRIX} 不存在')

    # 報告
    open_ = [t for t in tasks if t.get('status') not in CLOSED]
    cnt = {}
    for t in tasks:
        cnt[t.get('status')] = cnt.get(t.get('status'), 0) + 1
    print(f'任務 {len(tasks)} 項（未結 {len(open_)}）：' + '、'.join(f'{k} {v}' for k, v in cnt.items()))
    print('「完成」只算「已驗收」：' + str(cnt.get('已驗收', 0)) + ' 項；已實作待整合、已整合待測試、等待中的都不算完成')
    for l in info:
        print('[資訊] ' + l)
    for s in skipped:
        print('[沒有檢查] ' + s)
    for n, msg in out:
        print(f'[異常 {n}] {msg}')
    if snap_missing:
        return 2
    if out or skipped:
        print(f'結果：異常 {len(out)} 項、沒檢查 {len(skipped)} 項（工具不會自動改任務；請逐項處理後再跑一次）')
        return 1
    print('結果：OK（九項都檢查了，沒有異常）')
    return 0


def snapshot(args):
    src = Src(args.root)
    data = json.loads(src.read(TASKS))
    raw = src.read(TASKS).encode('utf-8')
    tasks = data['tasks']
    head = (git_lines(args.root, 'rev-parse', '--short=8', 'HEAD') or ['?'])[0]
    branch = (git_lines(args.root, 'branch', '--show-current') or ['?'])[0]
    now = datetime.now(timezone.utc).strftime('%Y-%m-%dT%H%MZ')
    s = {'version': 1, 'taken': now, 'account': args.account, 'role': args.role, 'kind': args.kind,
         'branch': branch, 'head': head, 'reconstructed': False,
         'tasksSha256': hashlib.sha256(raw).hexdigest(),
         'open': sorted(t['id'] for t in tasks if t['status'] not in CLOSED),
         'status': {t['id']: t['status'] for t in tasks}}
    os.makedirs(os.path.join(args.root, SNAPDIR), exist_ok=True)
    p = os.path.join(args.root, SNAPDIR, f'{now}_{args.account}_{args.role}.json')
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(s, f, ensure_ascii=False, indent=0)
        f.write('\n')
    print(f'快照：{os.path.relpath(p, args.root)}（未結 {len(s["open"])} 項；HEAD {head}，快照本身要 commit＋push 才算交班）')
    return 0


def queue(args):
    """D81：玩家越早遇到越先做。P0 → 學期順序 → 週次 → 擋主線 → 主線 → 優先級。"""
    data = json.loads(Src(args.root, args.ref).read(TASKS))
    order = data.get('meta', {}).get('stageOrder') or []
    def stage(t):
        term = (t.get('first') or {}).get('term') or 'META'
        y = term[:2]
        for k, s in enumerate(order):
            if s == term or s == y or (s.startswith(y) and term.startswith(s)):
                return k
        return len(order)
    def key(t):
        f = t.get('first') or {}
        return (0 if t.get('priority') == 'P0' else 1, stage(t), f.get('week') or 99,
                0 if f.get('blocks') else 1, 0 if f.get('mainline') else 1, t.get('priority', 'P9'))
    ts = [t for t in data['tasks'] if t['status'] not in CLOSED and (not args.owner or t['owner'] == args.owner)]
    act = sorted([t for t in ts if t['status'] not in WAITING], key=key)
    wait = sorted([t for t in ts if t['status'] in WAITING], key=key)
    print(f'可以做的（{len(act)}，前 {args.n} 項）：')
    for t in act[:args.n]:
        f = t.get('first') or {}
        print(f'  {t["id"]:<12} {t["priority"]} {f.get("earliest", "")[:16]:<16} {t["status"]:<7} {t["title"][:46]}｜{t["next"][:50]}')
    print(f'等待中／暫停（{len(wait)}，前 {args.n} 項）：')
    for t in wait[:args.n]:
        why = t.get('pausedReason') or t['next']
        print(f'  {t["id"]:<12} {t["priority"]} {t["status"]:<9} {t["title"][:40]}｜{why[:56]}')
    return 0


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--root', default=ROOT)
    sub = ap.add_subparsers(dest='cmd', required=True)
    c = sub.add_parser('check')
    c.add_argument('--role', default='LAWWW')
    c.add_argument('--snapshot')
    c.add_argument('--ref', help='從這個 git ref 讀任務表（例：origin/claude/modest-rubin-2lyp7g）')
    c.add_argument('--no-git', action='store_true')
    s = sub.add_parser('snapshot')
    s.add_argument('--role', required=True, choices=['LAWWW', 'LAWWW2', 'AA', 'BB'])
    s.add_argument('--account', required=True, choices=['A', 'B'])
    s.add_argument('--kind', default='handoff', choices=['handoff', 'checkpoint'])
    q = sub.add_parser('queue')
    q.add_argument('--owner')
    q.add_argument('--ref')
    q.add_argument('-n', type=int, default=15)
    a = ap.parse_args(argv)
    return {'check': check, 'snapshot': snapshot, 'queue': queue}[a.cmd](a)


if __name__ == '__main__':
    sys.exit(main())
