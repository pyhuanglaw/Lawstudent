#!/usr/bin/env python3
"""交接自動對帳（D82；規則：CLAUDE.md §4；LAWWW 的做法 docs/rules/ROLE_LAWWW.md 第 3、4 節）。

只讀不寫任務：這支工具**不改、不取消、不刪任何任務**，只列出異常。
唯一會寫檔的是 `snapshot` 指令（在 docs/handoff/snapshots/ 新增一個快照檔）。

  python3 tools/handoff/check_handoff.py check   [--role LAWWW] [--snapshot 檔] [--ref origin/<規則來源分支>] [--no-git]
  python3 tools/handoff/check_handoff.py snapshot --role LAWWW --account <A|B|C> [--kind handoff|checkpoint]
  python3 tools/handoff/check_handoff.py duty verify|plan|register|handoff …   值班狀態（D92／HV-10，tools/handoff/duty_state.py）
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
 D84（2026-10-16，平行開發的派工）再加兩項：
 10 跨 AI 任務（負責人 LAWWW2／AA／BB／CC、未結）有 xai：接收者、分支、規格來源、交付標準、ACK 狀態
 11 meta.pipeline 設的職位（LAWWW2）：可以做的任務不少於 minReady（派工不足）；它的交付沒有停在 SENT／DELIVERED（沒 ACK）
 ASK-USER-LIST-1104（2026-11-04）再加一項：
 12 等使用者的任務：狀態待開工／暫停／等待、恢復條件或下一步寫「使用者說繼續、回來問、選擇題、等使用者給圖…」的，要有 waitUser {ask, how}（不是在等就寫 notWaitUser 原因）；
    這一班（duty.json 的 LAWWW since 以後）每一項都要在 waitUser.log 記一筆 {at, by, result: 問了／沒問, why}——沒記＝異常，不得宣稱交接完整（askuser 子指令列清單）

增量掃描的順序：先 check → 把列出的 commit 登記進 deliveries 或放進 ignored → 再 check 到 OK → 最後才把 scannedThrough 移到各分支現在的 commit。
先移 scannedThrough 再 check，什麼都掃不到（2026-10-16 犯過一次）。

結束碼：0＝十二項都檢查了、沒有異常；1＝有異常、或有一項沒辦法檢查（不虛報正常）；
        2＝找不到上次快照或快照壞掉 → REMEDIAL_FULL_AUDIT（要補做一次全面盤點，見 CLAUDE.md §4 第 7 步）。
"""
import argparse, hashlib, json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import duty_state   # 值班狀態（D92／HV-10）
import incremental as INC   # 增量交接：水位線、結構化分類、outbox、WIP 索引（使用者 2026-10-17 P0）
from datetime import datetime, timezone

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
TASKS = 'docs/handoff/tasks.json'
DELIV = 'docs/handoff/deliveries.json'
SNAPDIR = 'docs/handoff/snapshots'
MATRIX = 'docs/HANDOFF_GAP_MATRIX.md'
CLOSED = ('已驗收', '取消／被取代')
WAITING = ('等待其他AI／素材', '暫停')
OWNERS = ('LAWWW', 'LAWWW2', 'AA', 'BB', 'CC', 'USER')   # CC：BB 的測試執行助手（D119／HV-22，使用者 2026-11-02 03:5x）
ID_RE = re.compile(r'^[A-Z][A-Z0-9]*-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$')
TERM_RE = re.compile(r'^(Y[0-4]S[12]|META)$')
MD_ID = re.compile(r'(?<![A-Za-z0-9_-])((?:BUG|TEST|ART|WIP|V[0-6]|DATE|D14|SYS|SCN|DONE|X)-[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*)(?:[～~]([A-Za-z]*)(\d+))?')
SNAP_KEYS = ('version', 'taken', 'role', 'account', 'open', 'status')
XAI_OWNERS = ('LAWWW2', 'AA', 'BB', 'CC')
XAI_KEYS = ('receiver', 'branch', 'spec', 'acceptance', 'ack')
XAI_ACK = ['未派', 'SENT', 'DELIVERED', 'ACK', 'ACTIONED', '自領']


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


WAIT_ST = ('待開工', '暫停', '等待其他AI／素材')
WAIT_PAT = re.compile(r'(使用者|user)[^｜。；]{0,12}(說|回來|決定|選|給|同意|確認|看過|問|批准|回覆|點頭)|問使用者|等使用者|選擇題問|使用者.{0,4}(以後|之後)再')


def wait_user_items(tasks):
    """第 12 項：回傳（有 waitUser 的任務、看起來在等使用者但還沒分類的 (任務, 片段)）。只看待開工／暫停／等待；進行中的照常推進，不算卡在使用者。"""
    marked, unk = [], []
    for t in tasks:
        if t.get('status') not in WAIT_ST:
            continue
        if t.get('waitUser'):
            marked.append(t)
            continue
        if t.get('notWaitUser') or t.get('waitUserDone'):   # waitUserDone＝使用者已經回答了（log 搬過去留紀錄）；之後又要等使用者就重新寫 waitUser
            continue
        seg = ' '.join([t.get('resumeWhen') or '', t.get('pausedReason') or '', (t.get('next') or '').split('｜')[0]])
        m = WAIT_PAT.search(seg)
        if m:
            unk.append((t, seg[max(0, m.start() - 20):m.end() + 20].strip()))
    return marked, unk


def duty_since(src):
    """這一班從什麼時候開始：duty.json 的 LAWWW since（值班 LAWWW 接班登記的時間）。"""
    try:
        d = json.loads(src.read(duty_state.DUTY))
    except Exception:
        return None
    return ((d.get('roles') or {}).get('LAWWW') or {}).get('since')


def wait_user_this_shift(t, since):
    """這一班的紀錄（at 不早於 since）；since 不明＝全部都算。"""
    wu = t.get('waitUser') if isinstance(t.get('waitUser'), dict) else {}
    log = [e for e in (wu.get('log') or []) if isinstance(e, dict)]
    st = duty_state._ts(since) if since else None
    return [e for e in log if not st or (duty_state._ts(e.get('at')) and duty_state._ts(e.get('at')) >= st)]


def check(args):
    src = Src(args.root, args.ref)
    out, info, skipped = [], [], []
    A = lambda n, msg: out.append((n, msg))
    try:
        data = json.loads(src.read(TASKS))
    except Exception as e:
        print(f'[致命] {TASKS} 讀不了：{e}')
        print('結果：REMEDIAL_FULL_AUDIT（任務索引壞掉，照 CLAUDE.md §4 第 7 步補做全面盤點）')
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
        print('結果：REMEDIAL_FULL_AUDIT——上次交班的狀態對不起來，這次接班要補做一次全面盤點（CLAUDE.md §4 第 7 步），不能當作正常。')
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
            for tid in re.split(r'[、,，\s]+', d.get('task') or ''):
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
        if not args.no_git:   # 各職位 outbox 登記過的 commit 也算已登記（D94：交付當下在自己分支登記）
            try:
                known.update(INC.outbox_shas(args.root, json.loads(src.read(duty_state.DUTY))))
            except FileNotFoundError:
                pass
        pat = re.compile(dv.get('pattern') or '交付')
        flagged = set()
        if args.no_git:
            skipped.append('6（交付分支掃描）：--no-git')
        else:
            try:
                _duty = json.loads(src.read(duty_state.DUTY))
            except FileNotFoundError:
                _duty = {}
            _ob, _role_of = {}, {}
            for _r, _x in (_duty.get('roles') or {}).items():
                _b = (_x or {}).get('branch')
                if not _b:
                    continue
                _role_of['origin/' + _b] = _r
                _rc = subprocess.run(['git', 'show', f'origin/{_b}:{INC.OUTBOX.format(role=_r)}'], cwd=args.root, capture_output=True, text=True)
                if _rc.returncode == 0:
                    try:
                        _ob[_r] = json.loads(_rc.stdout)
                    except Exception:
                        pass
            path_ok = lambda br, sha: bool(INC.any_owner(INC.commit_files(args.root, sha), _role_of.get(br, 'LAWWW'), _ob))
            try:   # 現在職位的分支有水位線＝incr 逐筆核對（水位線以後每個 commit 都要結構化分類，D94；只改文件的由交班全部待辦涵蓋，D135）
                _wm = json.loads(src.read(INC.WM)).get('roles') or {}
            except (FileNotFoundError, ValueError):
                _wm = {}
            for br, base in (dv.get('scannedThrough') or {}).items():
                _r = _role_of.get(br)
                if _r and (_wm.get(_r) or {}).get('sha'):   # 2026-11-04：關鍵字掃描和 incr 重複報同一批 commit（帳號 C 快轉 1827 個 commit 後 24 項誤報）
                    info.append(f'{br}：{_r} 有水位線，交付登記交給 incr 逐筆核對（D94、D135；不用關鍵字重複報）')
                    continue
                lines = git_lines(args.root, 'log', '--no-merges', '--format=%h %s', f'{base}..{br}')
                if lines is None:
                    skipped.append(f'6（{br} 從 {base} 以後）：git 找不到這個分支或 commit（先 git fetch）')
                    continue
                hits = [l for l in lines if pat.search(l.split(' ', 1)[1] if ' ' in l else '') and l[:7] not in known and l[:7] not in flagged and not INC.only_registry(args.root, l.split(' ', 1)[0]) and not path_ok(br, l.split(' ', 1)[0])]   # 只改登記檔、outbox 登記的檔案或職位自己的交接檔：照路徑算已登記
                flagged.update(l[:7] for l in hits)   # 企劃線互相合併，同一個 commit 會出現在兩條分支：只報一次
                for l in reversed(hits):
                    A(6, f'{br}：{l[:110]}——符合交付關鍵字但沒登記（登記進 deliveries 或放進 ignored）')
                info.append(f'{br}：{base} 以後 {len(lines)} 個 commit，符合關鍵字未登記 {len(hits)} 個')

    # 10 跨 AI 任務的欄位（D84 第 3 條）：負責人是 LAWWW2／AA／BB／CC 的未結任務要有 xai＝{receiver, branch, spec, acceptance, ack}
    acks = (data.get('meta') or {}).get('xaiAck') or XAI_ACK
    for t in tasks:
        if t.get('status') in CLOSED or t.get('owner') not in XAI_OWNERS:
            continue
        x = t.get('xai')
        if not isinstance(x, dict):
            A(10, f'{t.get("id")}：跨 AI 任務（負責人 {t.get("owner")}）沒有 xai 欄位（接收者、分支、規格來源、交付標準、ACK 狀態）')
            continue
        miss = [k for k in XAI_KEYS if not x.get(k)]
        if miss:
            A(10, f'{t.get("id")}：xai 缺 {"、".join(miss)}')
        if x.get('ack') and x['ack'] not in acks:
            A(10, f'{t.get("id")}：xai.ack「{x["ack"]}」不是 {"／".join(acks)} 之一')

    # 11 平行開發的流水線（D84 第 4、6 條）：meta.pipeline 設的職位，可以做的（待開工、進行中）不能少於 minReady；那個職位的交付不能停在 SENT／DELIVERED（沒有 ACK）
    pipe = (data.get('meta') or {}).get('pipeline') or {}
    if not pipe:
        info.append('11：tasks.json 沒有 meta.pipeline（不檢查派工不足）')
    for role, cfg in pipe.items():
        ready = [t for t in tasks if t.get('owner') == role and t.get('status') in ('待開工', '進行中')]
        need = (cfg or {}).get('minReady', 3)
        if len(ready) < need:
            A(11, f'{role}：可以做的任務只有 {len(ready)} 項（少於 {need}）＝派工不足；照 D84 第 1 條盤點下一個階段的美術，補任務')
        info.append(f'{role}：可以做的 {len(ready)} 項（下限 {need}）')
        if dv:
            for x in dv.get('deliveries') or []:
                if str(x.get('from', '')).split('-')[0] == role and x.get('msg') in ('SENT', 'DELIVERED'):
                    A(11, f'{x.get("id")}（{role}，{x.get("sha")}）：交付停在 {x.get("msg")}，還沒 ACK——讀完回 ACK、寫怎麼排（D84 第 6 條）')

    # 12 等使用者的任務（ASK-USER-LIST-1104，AA-C 11-04 13:18；使用者 13:2x 問「做到一半的東西，為什麼之後的帳號沒有收到還沒做完的訊息」：
    #    VAC-GAP-ROUTES 暫停的恢復條件是「使用者說繼續」，帳號 A 記了醒來要問、沒問就交班，check_orphans 看起來「暫停、有恢復條件」＝正常）
    since = duty_since(src)
    marked, unk = wait_user_items(tasks)
    for t, snip in unk:
        A(12, f'{t.get("id")}（{t.get("owner")}，{t.get("status")}）看起來在等使用者（「{snip}」），但沒寫 waitUser——在等就寫 waitUser {{ask: 要問什麼, how: 選擇題／請使用者生圖／iPhone 實測…}}；不是就寫 notWaitUser（原因）')
    for t in marked:
        wu = t['waitUser'] if isinstance(t['waitUser'], dict) else {}
        cur = wait_user_this_shift(t, since)
        if not cur:
            A(12, f'{t.get("id")}（{t.get("owner")}）等使用者：{wu.get("ask") or "（waitUser 沒寫要問什麼）"}——這一班（LAWWW {since or "接班時間不明"} 起）還沒問、也沒寫為什麼不問：waitUser.log 加一筆 {{at, by, result: 問了／沒問, why}}')
        elif any(e.get('result') not in ('問了', '沒問') or (e.get('result') == '沒問' and not e.get('why')) for e in cur):
            A(12, f'{t.get("id")}：waitUser.log 這一班的紀錄格式不對（result 只能是 問了／沒問；沒問要寫 why）')
    info.append(f'12：等使用者的任務 {len(marked)} 項、還沒分類 {len(unk)} 項（清單：python3 tools/handoff/check_handoff.py askuser；接班確認逐項寫問了／沒問、交班的「下一班第一步」要列）')

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

    # 分支定期唯讀稽核（BRANCH-AUDIT-1028，使用者 2026-10-28 01:4x）：只提醒、不算異常；超過 24 小時沒做就寫出來
    try:
        import branch_audit
        d, msg = branch_audit.due(args.root)
        info.append(('該做分支唯讀稽核了（python3 tools/handoff/branch_audit.py --write，結果 commit＋push）：' if d else '分支唯讀稽核：') + msg)
    except Exception as e:
        info.append(f'分支唯讀稽核：讀不到紀錄（{e}）')

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
    print('結果：OK（十二項都檢查了，沒有異常）')
    return 0


def snapshot(args):
    ref = getattr(args, 'ref', None)
    if not ref and not os.path.exists(os.path.join(args.root, TASKS)):   # LAWWW2／AA／BB／CC 的分支沒有總表：自動從 RULE_SOURCE 讀（BB-C 10-18：原本要從 LAWWW 分支借檔案、用完刪掉）
        code, b = duty_state.find(args, quiet=True)
        if code or not b:
            print('找不到 RULE_SOURCE（先 git fetch --all；或加 --ref origin/<規則來源分支>）')
            return 2
        ref = 'origin/' + b
        print(f'總表從 {ref} 讀（這條分支沒有 {TASKS}）')
    src = Src(args.root, ref)
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
    for key, path in (('wip', INC.WIP), ('watermarks', INC.WM)):   # 下一班用來比對：WIP 不能無故消失、水位線不能倒退
        try:
            j = json.loads(src.read(path))
            s[key] = [{'id': x['id'], 'task': x.get('task'), 'state': x.get('state')} for x in j.get('items', [])] if key == 'wip' else {r: (w or {}).get('sha') for r, w in (j.get('roles') or {}).items()}
        except FileNotFoundError:
            pass
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


# D93／HV-11：逐職位核對。各職位交接檔裡「全部待辦」那一節，每一項都要在 tasks.json 找得到。
ROLE_FILES = {   # duty.json 的 progressFile 寫錯或不存在時的備用（CLAUDE.md §4 的交接檔表）
    'LAWWW2': ['docs/art-rebuild/second_ai/HANDOFF.md'],
    'AA': ['docs/story_planning/AA_交接紀錄.md'],
    'BB': ['docs/story_planning/BB_00_協作規範與交接紀錄.md', 'docs/story_planning/BB_00_交接紀錄.md'],
    'CC': ['docs/story_planning/CC/CC_00_交接紀錄.md'],   # CC 在 claude/cc-testing；BB 定期併進企劃線（D119）
}
ANY_ID = re.compile(r'(?<![A-Za-z0-9_./-])([A-Z][A-Z0-9]*(?:-[A-Za-z0-9]+)+)(?:[～~]([A-Za-z]*)(\d+))?')
NOT_ID = re.compile(r'^(LAWWW2?|AA|BB|CC)-[ABCD]$|^UTF-|^ISO-')   # 工作階段名稱（CC-B、LAWWW-D…）不是任務 ID
OFF_MARK = re.compile(r'【表外】|（無 ?ID）|\(無 ?ID\)')
OFF_PARENT = re.compile(r'總表(上)?(沒有|沒列|未列)|表外')


def todo_section_legacy(text):
    """（舊版，留給回歸測試對照；2026-10-17 帳號 B 交班時的假通過）正文提到「全部待辦」的條列也被當成段落開頭，可能讀到 0 行。"""
    lines = text.splitlines()
    for i, l in enumerate(lines):
        if '全部待辦' not in l:
            continue
        h = re.match(r'^(#+)\s', l)
        b = re.match(r'^(\s*)[-*]\s', l)
        if not h and not b:
            continue
        out = []
        for l2 in lines[i + 1:]:
            h2 = re.match(r'^(#+)\s', l2)
            if h and h2 and len(h2.group(1)) <= len(h.group(1)):
                break
            if b and (h2 or (re.match(r'^(\s*)[-*]\s', l2) and len(re.match(r'^(\s*)', l2).group(1)) <= len(b.group(1)))):
                break
            out.append(l2)
        return i + 1, out
    return None, []


def todo_section(text):
    """找「全部待辦」那一節：只認錨定的標題（incremental.todo_check）。回傳 (起始行號或 None, 行列表)。"""
    start, sec, _ = INC.todo_check(text)
    return start, sec


def section_ids(line):
    ids = []
    for m in ANY_ID.finditer(line):
        i = m.group(1)
        if NOT_ID.search(i):
            continue
        ids.append(i)
        if m.group(3):   # 區間：HOL-NYE-Y2～Y4、VAC-B1～B3
            head = re.match(r'^(.*?)(\d+)$', i)
            if head and head.group(1).endswith(m.group(2) or '') and 0 < int(m.group(3)) - int(head.group(2)) < 30:
                ids += [(f'{head.group(1)}{n}', i) for n in range(int(head.group(2)) + 1, int(m.group(3)) + 1)]
    return ids


# HV-18（使用者 2026-10-18 13:5x：「規則交接規則都寫這麼清楚了，為什麼他們還會有需要你補的任務？」→ 選「三個都做」）：
# 每個職位一個固定格式的使用者要求檔（docs/handoff/user_asks_<職位>.json），一則要求一筆；這裡逐筆對到 USER_WANTS 的列或 tasks.json 的任務。
ASK_ROLES = ['LAWWW', 'LAWWW2', 'AA', 'BB', 'CC']   # CC（D119）：user_asks_CC.json 在 CC 自己的分支 claude/cc-testing
ASK_FILE = 'docs/handoff/user_asks_{}.json'
ASK_KINDS = ['原話', '選擇題答案', '轉述', 'AI解讀']   # AI解讀＝AI 自己擴大或推論的，不是使用者的話：要 confirmed:true（問過使用者）才算數
ASK_STATUS = ['還沒做', '進行中', '做好了沒進遊戲', '在開發分支', '在遊戲裡', '暫停', '已取消', '規則（永久）', '已完成']
WANT_ROW = re.compile(r'^\| ([A-Z]\d+[a-z]?)(?: ★)? \| ')   # 列號可以帶一個小寫尾碼（例：D35a；10-27 AA-C 的 UA-AA-1027-49 對不到）


def wants_rows(text):
    """USER_WANTS.md 的列 ID → 狀態（第 1 節的狀態在第 3 格；第 3 節多一格「什麼時候說」，狀態在第 4 格；同一個 ID 以第 1 節為準）"""
    rows, sec = {}, 0
    for l in text.splitlines():
        m = re.match(r'^## (\d+)\.', l)
        if m:
            sec = int(m.group(1))
        m = WANT_ROW.match(l)
        if not m or m.group(1) in rows:
            continue
        cells = l.strip().strip('|').split(' | ')
        i = 3 if sec == 3 else 2
        rows[m.group(1)] = cells[i].strip() if len(cells) > i else ''
    return rows


def ask_check(role, data, rows, have):
    """一個職位的使用者要求檔 → 異常清單（每一項都是可以照做的一句話）"""
    bad = []
    items = data.get('asks') if isinstance(data, dict) else None
    if not isinstance(items, list):
        return [f'{role}：使用者要求檔沒有 asks 陣列']
    seen = set()
    for a in items:
        aid = a.get('id') or '（沒有 id）'
        if aid in seen:
            bad.append(f'{role} {aid}：id 重複')
        seen.add(aid)
        for k in ('id', 'at', 'quote', 'kind', 'status'):
            if not a.get(k):
                bad.append(f'{role} {aid}：缺 {k}')
        if a.get('kind') and a['kind'] not in ASK_KINDS:
            bad.append(f'{role} {aid}：kind「{a["kind"]}」不是 {ASK_KINDS}')
        if a.get('kind') == 'AI解讀' and not a.get('confirmed'):
            dg = a.get('delegatedBy')   # 使用者授權這個職位自己決定（例：D109「以後你劇情自己決定」UA-AA-1021-43）：紀錄照留、不必再問
            src = next((b for b in items if b.get('id') == dg), None) if dg else None
            dropped = a.get('status') == '已取消' and bool((a.get('cancelReason') or '').strip())   # 已經不照這個解讀做（寫明原因）＝沒有照沒確認的解讀行動的風險
            if not dropped and not (src and src.get('kind') in ('原話', '選擇題答案') and src.get('status') == '規則（永久）'):
                bad.append(f'{role} {aid}：AI 自己的解讀還沒問使用者（confirmed 不是 true）：{a.get("quote", "")[:40]}'
                           + (f'（delegatedBy {dg} 不是這個職位檔裡、status 規則（永久）的使用者原話或選擇題答案）' if dg else ''))
        st = a.get('status') or ''
        if st and st not in ASK_STATUS:
            bad.append(f'{role} {aid}：status「{st}」不是 {ASK_STATUS}')
        w, t = a.get('wants'), a.get('task')
        if not w and not t:
            bad.append(f'{role} {aid}：沒有對到 USER_WANTS 的列（wants）也沒有對到任務（task）：{a.get("quote", "")[:40]}')
        if w and w not in rows:
            bad.append(f'{role} {aid}：wants「{w}」在 USER_WANTS.md 找不到')
        if t and canon(t) not in have:
            bad.append(f'{role} {aid}：task「{t}」在 tasks.json 找不到')
        if w in rows and st and st not in ('已完成',):
            rs = re.sub(r'（.*?）|\(.*?\)', '', rows[w]).strip()
            core = re.sub(r'（.*?）|\(.*?\)', '', st).strip()
            if rs and core and not (rs.startswith(core) or core.startswith(rs)):
                bad.append(f'{role} {aid}：狀態和 USER_WANTS {w} 不一樣（要求檔「{st}」／總表「{rows[w][:20]}」）——兩邊改成一樣')
    return bad


def asks(args):
    """HV-18：讀各職位（ASK_ROLES）的使用者要求檔（職位分支上的優先；職位還沒建、就用 RULE_SOURCE 上的種子），逐筆對到 USER_WANTS／tasks.json。只讀不寫。"""
    src = Src(args.root, args.ref)
    data = json.loads(src.read(TASKS))
    have = {canon(i) for t in data['tasks'] for i in [t['id']] + (t.get('aliases') or [])}
    rows = wants_rows(src.read('docs/handoff/USER_WANTS.md'))
    duty = json.loads(src.read(duty_state.DUTY))
    bad, n = [], 0
    for role in args.role or ASK_ROLES:
        path = ASK_FILE.format(role)
        text = where = None
        br = ((duty.get('roles') or {}).get(role) or {}).get('branch')
        if role != 'LAWWW' and br:
            r = subprocess.run(['git', '-C', args.root, 'show', f'origin/{br}:{path}'], capture_output=True)
            if not r.returncode:
                text, where = r.stdout.decode('utf-8'), f'origin/{br}'
        if text is None:
            try:
                text, where = src.read(path), (args.ref or '工作目錄') + '（RULE_SOURCE 上的種子）' if role != 'LAWWW' else (args.ref or '工作目錄')
            except FileNotFoundError:
                bad.append(f'{role}：沒有 {path}（職位分支 {br or "?"} 和 RULE_SOURCE 都沒有）')
                continue
        try:
            d = json.loads(text)
        except ValueError as e:
            bad.append(f'{role}：{path} 不是合法的 JSON（{e}）')
            continue
        k = len(d.get('asks') or [])
        n += k
        print(f'[資訊] {role}：{where} {k} 筆')
        bad += ask_check(role, d, rows, have)
    for b in bad:
        print(f'[異常] {b}')
    print(f'結果：{"OK" if not bad else f"異常 {len(bad)} 項"}（{n} 筆使用者要求、USER_WANTS {len(rows)} 列）')
    return 1 if bad else 0


def roles(args):
    """逐職位核對（D93）：讀各職位分支上的交接檔「全部待辦」，列出總表沒有的 ID、標【表外】還沒對到任務的項目。只讀不寫。"""
    src = Src(args.root, args.ref)
    data = json.loads(src.read(TASKS))
    have = {canon(i) for t in data['tasks'] for i in [t['id']] + (t.get('aliases') or [])}   # aliases：其他職位用的別名（例：AA 寫 MSG-L1＝SYS-PHONE-CHAT）
    meta = data.get('meta', {})
    ignore = {canon(k) for k in (meta.get('reconcileIgnore') or {})}   # 結尾 -* ＝整組前綴（例：VA-* 是 HOL-VA 的子項編號）
    ign = lambda i: canon(i) in ignore or any(k.endswith('-*') and canon(i).startswith(k[:-1]) for k in ignore)
    offlist = meta.get('offList') or []   # [{role, match, task}]：表外那一行含 match 就算已經補成 task
    duty = json.loads(src.read(duty_state.DUTY))
    bad, report = [], []
    for role in args.role or ['LAWWW2', 'AA', 'BB', 'CC']:
        r = (duty.get('roles') or {}).get(role) or {}
        pf = re.sub(r'（.*?）$', '', r.get('progressFile') or '')
        branches = [b for b in [r.get('branch'), (duty.get('roles') or {}).get('AA', {}).get('branch')] if b]
        text = where = None
        for br in dict.fromkeys(branches):
            for f in dict.fromkeys([pf] + ROLE_FILES.get(role, [])):
                if not f:
                    continue
                try:
                    text = subprocess.run(['git', 'show', f'origin/{br}:{f}'], cwd=args.root, capture_output=True, text=True, check=True).stdout
                    where = f'origin/{br}:{f}'
                    break
                except subprocess.CalledProcessError:
                    pass
            if text:
                break
        if not text:
            bad.append(f'{role}：交接檔讀不到（試過 {branches} × {[pf] + ROLE_FILES.get(role, [])}；先 git fetch）')
            continue
        start, sec, probs = INC.todo_check(text)
        for pr in probs:   # 找不到段落、0 項、沒有任何 ID：都是異常，不能假通過（2026-10-17 事故）
            bad.append(f'{role}：{where}：{pr}（CLAUDE.md §4 交班 B 類）')
        if start is None:
            continue
        sha = subprocess.run(['git', 'rev-parse', '--short', f'origin/{where.split(":")[0][7:]}'], cwd=args.root, capture_output=True, text=True).stdout.strip()
        ids, missing, off = set(), [], []
        parents = []   # 條列的上層（縮排, 文字）
        for k, l in enumerate(sec):
            ind = len(re.match(r'^(\s*)', l).group(1))
            while parents and parents[-1][0] >= ind:
                parents.pop()
            found = []
            for x in section_ids(l):   # 區間成員 (ID, 區間開頭)：開頭在總表就算有
                if isinstance(x, tuple):
                    if canon(x[1]) not in have:
                        found.append(x[0])
                else:
                    found.append(x)
            for n, i in enumerate(found):   # 簡寫：SCN-US-2D／US-CG、SCN-V4-02／V4-03 → 補上同一行前面那個 ID 的字首
                if canon(i) not in have:
                    for j in found[:n]:
                        parts = j.split('-')
                        full = next((f'{"-".join(parts[:k])}-{i}' for k in range(1, len(parts)) if canon(f'{"-".join(parts[:k])}-{i}') in have), None)
                        if full:
                            found[n] = full
                            break
            ids.update(found)
            known = [i for i in found if canon(i) in have]
            mapped = [o['task'] for o in offlist if o.get('role') == role and o.get('match') and o['match'] in l]
            row = re.match(r'^\s*([-*]|\d+\.|\|)', l) and not re.match(r'^\s*\|[\s|:-]*$', l)
            up = parents[-1][1] if parents else ''   # 只看直接上層：【表外】項目底下的細項算在那一項裡
            if row and (OFF_MARK.search(l) or (not found and OFF_PARENT.search(up) and not OFF_MARK.search(up))):
                if mapped:
                    for t in mapped:
                        if canon(t) not in have:
                            missing.append(f'{t}（offList 對到、總表沒有）')
                else:
                    off.append(f'第 {start + k + 1} 行：{l.strip()[:90]}')
            if re.match(r'^\s*([-*]|\d+\.)\s', l):
                parents.append((ind, l))
        for i in sorted(ids):
            if canon(i) not in have and not ign(i):
                missing.append(i)
        report.append(f'{role}：{where} @ {sha}，全部待辦 {len(sec)} 行、提到 {len(ids)} 個 ID')
        for i in missing:
            bad.append(f'{role}：{i} 在交接檔、總表沒有')
        for o in off:
            bad.append(f'{role}：表外（還沒補成任務）{o}')
    for l in report:
        print('[資訊] ' + l)
    for n, m in enumerate(bad, 1):
        print(f'[異常 {n}] {m}')
    if bad:
        print(f'結果：異常 {len(bad)} 項——補進 tasks.json（表外的補完在 meta.offList 記 role／match／task），'
              '或把不是任務的 ID 寫進 meta.reconcileIgnore（附原因）；沒處理完不能宣稱交接完整（D93）')
        return 1
    print('結果：OK（每個職位的全部待辦都在總表裡）')
    return 0


def incr_run(root, ref=None, remote=True, src=None):
    """增量核對（使用者 2026-10-17 P0）：各職位水位線以後的新 commit 逐一要有結構化分類；outbox 與 WIP 索引的欄位；WIP 不能比上一份快照少。
    回傳 (結果 dict, 異常列表, 資訊列表)。只讀。"""
    src = src or Src(root, ref)
    probs, info = [], []
    try:
        wm = json.loads(src.read(INC.WM))
    except FileNotFoundError:
        return None, [f'{INC.WM} 不存在：還沒建立各職位水位線'], info
    tasks = json.loads(src.read(TASKS))
    dv = json.loads(src.read(DELIV))
    duty = json.loads(src.read(duty_state.DUTY))
    try:
        wip = json.loads(src.read(INC.WIP))
    except FileNotFoundError:
        wip = None
        probs.append(f'{INC.WIP} 不存在：沒有永久 WIP 索引')
    wm['_wip'] = wip or {}
    outboxes = {}
    for role in INC.ROLES:
        br = ((duty.get('roles') or {}).get(role) or {}).get('branch')
        if not br:
            continue
        if role == 'LAWWW':
            try:
                outboxes[role] = json.loads(src.read(INC.OUTBOX.format(role=role)))
            except FileNotFoundError:
                pass
            continue
        rc = subprocess.run(['git', 'show', f'origin/{br}:{INC.OUTBOX.format(role=role)}'], cwd=root, capture_output=True, text=True)
        if rc.returncode == 0:
            try:
                outboxes[role] = json.loads(rc.stdout)
            except Exception as e:
                probs.append(f'{role}：origin/{br}:{INC.OUTBOX.format(role=role)} 壞掉：{e}')
        else:
            info.append(f'{role}：分支 {br} 還沒有 {INC.OUTBOX.format(role=role)}（交付當下登記）；水位線以後的 commit 照樣逐一要分類')
    res = INC.scan(root, wm, dv, tasks, duty, remote=remote, outboxes=outboxes)
    for role, r in res.items():
        probs += r['problems']
        for s_, subj in r['unclassified']:
            probs.append(f'{role}：{r["branch"]} 的 {s_}「{subj}」沒有分類（登記進 outbox／deliveries，或 ignored 加 kind）')
        info.append(f'{role}：{r["branch"]} 水位線 {str((wm["roles"].get(role) or {}).get("sha", ""))[:8]} 以後 {r["new"]} 個 commit，扣掉別的職位已核對的要看 {r["scanned"]} 個（已分類 {r["classified"]}（其中沒改到遊戲、由交班全部待辦涵蓋 {r.get("docsOnly", 0)}，D135）、未分類 {len(r["unclassified"])}）')
    if wip is not None:
        probs += INC.wip_problems(wip, tasks, root)
        snaps = sorted(f for f in src.listdir(SNAPDIR) if f.endswith('.json'))
        prev = None
        for f in reversed(snaps):
            try:
                j = json.loads(src.read(f'{SNAPDIR}/{f}'))
            except Exception:
                continue
            if 'wip' in j:
                prev = (f, j)
                break
        if prev:
            probs += [f'{x}（比對快照 {prev[0]}）' for x in INC.wip_diff({'items': prev[1]['wip']}, wip)]
            for r, s_ in (prev[1].get('watermarks') or {}).items():
                cur = (wm['roles'].get(r) or {}).get('sha')
                if s_ and cur and s_ != cur and subprocess.run(['git', 'merge-base', '--is-ancestor', s_, cur], cwd=root).returncode != 0:
                    probs.append(f'{r}：水位線從快照的 {s_[:8]} 變成 {cur[:8]}，但新的不是舊的後代（倒退或改寫）')
        else:
            info.append('還沒有含 WIP 的快照（下一次交班的快照開始比對 WIP 有沒有消失）')
    return (wm, res, outboxes, tasks), probs, info


def incr(args):
    import time
    t0 = time.time()
    INC.GIT_CALLS = 0
    src = Src(args.root, args.ref)
    state, probs, info = incr_run(args.root, args.ref, src=src)
    for l in info:
        print('[資訊] ' + l)
    for n, m in enumerate(probs, 1):
        print(f'[異常 {n}] {m}')
    if state:
        wm, res, outboxes, tasks = state
        tot = sum(r['scanned'] for r in res.values())
        print(f'[成本] 這次逐一核對 {tot} 個 commit，git 呼叫 {INC.GIT_CALLS} 次，{time.time() - t0:.1f} 秒')
    if args.advance:
        if args.ref:
            print('--advance 要在值班 LAWWW 的分支上跑（不加 --ref）')
            return 1
        wm, res, outboxes, tasks = state
        wip = wm.pop('_wip', {})
        changed = False
        for role in (INC.ROLES if 'all' in args.advance else args.advance):
            open_ids = sorted(x['id'] for x in wip.get('items', []) if x.get('role') == role and INC.norm_state(x.get('state')) not in INC.CLOSED_WIP)
            ok, msg = INC.advance(args.root, wm, res, role, args.by or 'LAWWW', remote=True, open_ids=open_ids)
            print(('[前進] ' if ok else '[不前進] ') + msg)
            changed |= ok
        if changed:
            with open(os.path.join(args.root, INC.WM), 'w', encoding='utf-8') as f:
                json.dump(wm, f, ensure_ascii=False, indent=1)
                f.write('\n')
            print(f'寫了 {INC.WM}：commit＋push、核對遠端 SHA 才算前進完成')
    if probs:
        print(f'結果：異常 {len(probs)} 項——水位線不前進；只對異常的範圍深入追查（不重掃全部歷史）')
        return 1
    print('結果：OK（每個職位水位線以後的 commit 都有分類；WIP 沒有無故消失）')
    return 0


def askuser(args):
    """ASK-USER-LIST-1104：列出等使用者的任務（接班確認、交班「下一班第一步」用）；有沒分類或這一班沒處理的＝結束碼 1。"""
    src = Src(args.root, args.ref)
    tasks = json.loads(src.read(TASKS)).get('tasks') or []
    since = duty_since(src)
    marked, unk = wait_user_items(tasks)
    bad = len(unk)
    print(f'等使用者的任務 {len(marked)} 項（這一班：LAWWW {since or "接班時間不明"} 起）——接班確認逐項寫「問了／沒問、原因」；交班寫進「下一班第一步」：')
    for t in sorted(marked, key=lambda x: (str(x.get('priority') or 'P9'), x.get('id'))):
        wu = t['waitUser'] if isinstance(t['waitUser'], dict) else {}
        cur = wait_user_this_shift(t, since)
        log = [e for e in (wu.get('log') or []) if isinstance(e, dict)]
        last = log[-1] if log else None
        mark = '這一班已處理' if cur else '這一班還沒處理'
        bad += 0 if cur else 1
        print(f'- [{mark}] {t.get("id")}（{t.get("owner")}，{t.get("priority") or "-"}，{t.get("status")}）：{wu.get("ask") or "（沒寫要問什麼）"}｜怎麼問：{wu.get("how") or "-"}'
              + (f'｜上次：{last.get("at")} {last.get("by") or ""} {last.get("result")}{"（" + last.get("why") + "）" if last.get("why") else ""}' if last else '｜還沒問過'))
    for t, snip in unk:
        print(f'- [還沒分類] {t.get("id")}（{t.get("owner")}，{t.get("status")}）：「{snip}」——寫 waitUser 或 notWaitUser')
    print('結果：OK' if not bad else f'結果：{bad} 項要處理')
    return 1 if bad else 0


OPEN_WANT = ('還沒做', '進行中', '做好了沒進遊戲')


def userwork(args):
    """USERWORK-1110（使用者 11-10 17:1x：「交班的規則到底出了什麼問題會讓你需要我問你才會知道」）：
    使用者交代、還沒做完（USER_WANTS 狀態還沒做／進行中／做好了沒進遊戲）、總表上歸這個職位的事，逐項列出這一班有沒有動過
    （這一班＝duty.json LAWWW since 起，commit 訊息提到列號或任務 ID 才算）。原本「進行中」沒有任何檢查會報（check_orphans 只看暫停、等待、待整合；
    asks 只對狀態一不一樣；queue 有四百多項「已整合待測試」把它們壓在後面），上一班留下的使用者要求整班沒人動也看不出來。
    接班第 9 步、每批工作結束、交班存快照前跑；有「這一班還沒動」＝結束碼 1：接班確認逐項寫下一步和什麼時候做，不能只寫 OK。"""
    src = Src(args.root, args.ref)
    tasks = {t.get('id'): t for t in (json.loads(src.read(TASKS)).get('tasks') or [])}
    text = src.read('docs/handoff/USER_WANTS.md')
    status = wants_rows(text)
    since = duty_since(src)
    r = subprocess.run(['git', '-C', args.root, 'log', args.ref or 'HEAD', '--format=%s%n%b'] + ([f'--since={since}'] if since else ['-200']), capture_output=True)
    log = r.stdout.decode('utf-8', 'replace') if not r.returncode else ''
    role = args.owner
    out = []
    for l in text.splitlines():
        m = WANT_ROW.match(l)
        if not m:
            continue
        wid = m.group(1)
        st = status.get(wid, '')
        if not st.startswith(OPEN_WANT):
            continue
        tids = [t for t in re.findall(r'[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+', l) if t in tasks]
        owners = {tasks[t].get('owner') for t in tids}
        if role not in owners and not (not tids and role in l.split(' | ')[-2:][0]):
            continue
        mine = [t for t in tids if tasks[t].get('owner') == role] or tids
        touched = (re.search(r'(?<![A-Z0-9])' + re.escape(wid) + r'(?![0-9])', log) is not None) or any(t in log for t in mine)
        out.append((touched, wid, st, mine))
    nb = lastnote(src, tasks, log) if role == 'LAWWW' else 0
    if not out:
        print(f'使用者交代、還沒做完、歸 {role} 的：0 項。' + ('結果：OK' if not nb else f'結果：上一班交代的 {nb} 項這一班還沒動'))
        return 1 if nb else 0
    bad = [o for o in out if not o[0]]
    print(f'使用者交代、還沒做完、歸 {role} 的 {len(out)} 項（這一班：LAWWW {since or "接班時間不明"} 起；commit 提到列號或任務 ID＝這一班動過）：')
    for touched, wid, st, mine in sorted(out, key=lambda o: (o[0], o[1])):
        print(f'- [{"這一班動過" if touched else "這一班還沒動"}] {wid}（{st[:40]}）→ {", ".join(f"{t}:{tasks[t].get(chr(115)+chr(116)+chr(97)+chr(116)+chr(117)+chr(115))}" for t in mine) or "（沒有任務 ID）"}')
    print('結果：OK' if not (bad or nb) else f'結果：{len(bad)} 項使用者要求、{nb} 項上一班交代的這一班還沒動——接班確認逐項寫下一步和什麼時候做；使用者的要求、上一班交代的排在接別人的交付之前')
    return 1 if (bad or nb) else 0


def lastnote(src, tasks, log):
    """上一班 LAWWW 交班快照（HANDOFF_GAP_MATRIX 第 11 節最上面那一則）：印「下一班第一件事」和 B｜全部未完成 每一條；
    這一班 commit 沒提到它的任務 ID（或那一條沒有任務 ID）＝還沒動（D145：帳號 B 交班寫了 AA_342 svc 兩句、256bcdc42 匯入，都沒有任務 ID，帳號 A 整班沒做）。"""
    try:
        text = src.read('docs/HANDOFF_GAP_MATRIX.md')
    except Exception:
        return 0
    i = text.find('## 11. 交班快照歷史')
    if i < 0:
        return 0
    j = text.find('\n### ', i)
    k = text.find('\n### ', j + 5)
    sec = text[j:k if k > 0 else len(text)]
    head = sec.strip().splitlines()[0] if sec.strip() else ''
    first = next((l for l in sec.splitlines() if '下一班第一件事' in l), '')
    print(f'\n上一班的交班（{head.lstrip("# ")[:80]}）：')
    if first:
        print('  下一班第一件事：' + re.sub(r'\*\*', '', first).split('：', 1)[-1][:300])
    b = sec.find('**B｜')
    if b < 0:
        return 0
    e = sec.find('\n- **C｜', b)
    blk = sec[b:e if e > 0 else len(sec)]
    items = []
    for l in blk.splitlines()[1:]:
        l = l.strip()
        if not l.startswith('- '):
            continue
        for part in re.split(r'[；;]', l[2:]):
            part = part.strip()
            if len(part) < 4:
                continue
            ids = [t for t in re.findall(r'[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+', part) if t in tasks]
            shas = re.findall(r'\b[0-9a-f]{9}\b', part)
            done = any(t in log for t in ids) or any(sh in log for sh in shas)
            items.append((done, part, ids))
    nb = 0
    for done, part, ids in items:
        if not done:
            nb += 1
        tag = '這一班動過' if done else ('這一班還沒動' if ids else '這一班還沒動｜沒有任務 ID（表外：先建任務）')
        print(f'  - [{tag}] {part[:160]}')
    return nb


def releasegate(args):
    """D146（使用者 11-10 17:4x：「一鍵前往一定要在下個版本，你沒做好前就不要發佈」「曖昧要分期 某個程度可以約對方出去校外玩 也一定要在下個版本」）：
    USER_WANTS 列有【下一版必須】的，連到的任務都要「已驗收」（BB 在瀏覽器判 PASS）才可以發布；有一項沒有＝結束碼 1，不准發布。發布前必跑。"""
    src = Src(args.root, args.ref)
    tasks = {t.get('id'): t for t in (json.loads(src.read(TASKS)).get('tasks') or [])}
    text = src.read('docs/handoff/USER_WANTS.md')
    bad, n = [], 0
    for l in text.splitlines():
        m = WANT_ROW.match(l)
        if not m or '【下一版必須】' not in l:
            continue
        n += 1
        tids = [t for t in re.findall(r'[A-Z][A-Z0-9]+(?:-[A-Z0-9]+)+', l) if t in tasks]
        st = {t: tasks[t].get('status') for t in tids}
        ok = bool(tids) and all(v in ('已驗收',) for v in st.values())
        print(f'- [{"可以" if ok else "還不行"}] {m.group(1)} → ' + (', '.join(f'{t}:{v}' for t, v in st.items()) or '（沒有任務 ID）'))
        if not ok:
            bad.append(m.group(1))
    print(f'【下一版必須】{n} 項；' + ('結果：OK，可以發布' if not bad else f'結果：{len(bad)} 項還沒驗收（{", ".join(bad)}）——不准發布'))
    return 1 if bad else 0


def loose(args):
    """LOOSE-1110（D148，使用者 2026-11-10：「發現了很多什麼已經做過，結果忘記了交班，或你不知道什麼分支還在他的那邊」）：
    做好了、卻沒進開發分支的東西——本機分支（含子代理 worktree 分支）、本機 worktree、沒 commit 的檔、沒 push 的 commit、
    狀態寫「進行中／待開工」而 next 提到子代理的任務。每批工作結束、交班存快照前、接班第 9 步都跑；結束碼 1＝有東西還沒收進來。"""
    import subprocess
    def git(*a):
        return subprocess.run(['git'] + list(a), cwd=str(ROOT), capture_output=True, text=True).stdout
    head = git('rev-parse', '--abbrev-ref', 'HEAD').strip()
    bad = []
    for ln in git('for-each-ref', '--format=%(refname:short)', 'refs/heads').split():
        if ln in (head, 'main'):
            continue
        n = git('rev-list', '--count', head + '..' + ln).strip() or '0'
        if n != '0':
            files = [f for f in git('diff', '--name-only', head + '...' + ln).split('\n') if f][:6]
            bad.append('本機分支 %s 有 %s 個 commit 不在 %s（%s…）——合併，或確認不要再刪' % (ln, n, head, '、'.join(files)))
        else:
            print('[資訊] 本機分支 %s 已經全部在 %s 裡，可以刪' % (ln, head))
    wts = [l for l in git('worktree', 'list').split('\n') if l.strip()]
    for l in wts[1:]:
        print('[資訊] worktree：' + l.strip())
    dirty = [l for l in git('status', '--porcelain').split('\n') if l.strip()]
    if dirty:
        bad.append('工作目錄有 %d 個沒 commit 的檔（%s…）' % (len(dirty), '、'.join(x[3:] for x in dirty[:5])))
    up = git('rev-parse', '--abbrev-ref', '--symbolic-full-name', '@{u}').strip()
    if up:
        n = git('rev-list', '--count', up + '..HEAD').strip()
        if n and n != '0':
            bad.append('有 %s 個 commit 還沒 push 到 %s' % (n, up))
    else:
        bad.append('目前分支沒有設定遠端（沒 push 過）')
    try:
        tasks = json.load(open(os.path.join(ROOT, 'docs/handoff/tasks.json'), encoding='utf-8'))['tasks']
    except Exception as e:
        tasks = []; bad.append('讀不到 tasks.json：%s' % e)
    for t in tasks:
        if t.get('status') in ('進行中', '待開工') and re.search(r'子代理(在做|實作|正在)', str(t.get('next') or '')):
            bad.append('任務 %s 寫「%s」、next 說子代理在做——子代理做完了嗎？成果合進來了嗎？（%s）' % (t['id'], t['status'], str(t.get('next'))[:60]))
    for b in bad:
        print('[異常] ' + b)
    print('結果：' + ('異常 %d 項——有做好的東西還沒收進開發分支，不得宣稱交接完整' % len(bad) if bad else 'OK（沒有散落在外面的成果）'))
    return 1 if bad else 0



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
    s.add_argument('--role', required=True, choices=list(duty_state.ROLES))
    s.add_argument('--account', required=True, choices=list(duty_state.ACCOUNTS))   # 帳號 A／B／C／D（D92；職位五個，D119 加 CC）
    s.add_argument('--kind', default='handoff', choices=['handoff', 'checkpoint'])
    s.add_argument('--ref', help='從這個 git ref 讀總表；不給而且這條分支沒有 tasks.json＝自動找 RULE_SOURCE')
    q = sub.add_parser('queue')
    q.add_argument('--owner')
    q.add_argument('--ref')
    q.add_argument('-n', type=int, default=15)
    r = sub.add_parser('roles')
    r.add_argument('--role', action='append', choices=[x for x in duty_state.ROLES if x != 'LAWWW'])
    r.add_argument('--ref')
    k = sub.add_parser('asks', help='HV-18：五個職位（LAWWW、LAWWW2、AA、BB、CC）的使用者要求檔逐筆對到 USER_WANTS／tasks.json')
    k.add_argument('--role', action='append', choices=ASK_ROLES)
    k.add_argument('--ref')
    u = sub.add_parser('askuser', help='ASK-USER-LIST-1104：等使用者的任務清單（接班確認逐項寫問了／沒問、交班寫進下一班第一步）')
    u.add_argument('--ref')
    w = sub.add_parser('userwork', help='USERWORK-1110：使用者交代、還沒做完、歸這個職位的事，這一班有沒有動過（接班確認逐項寫）')
    w.add_argument('--owner', default='LAWWW')
    w.add_argument('--ref')
    lo = sub.add_parser('loose', help='D148：做好了卻沒進開發分支的東西（本機分支、子代理 worktree、沒 commit、沒 push、任務寫子代理在做）')
    lo.add_argument('--ref')
    g = sub.add_parser('releasegate', help='D146：USER_WANTS【下一版必須】的任務都已驗收才可以發布')
    g.add_argument('--ref')
    i = sub.add_parser('incr', help='增量核對：各職位水位線以後的新 commit、outbox、WIP 索引')
    i.add_argument('--ref')
    i.add_argument('--advance', action='append', choices=INC.ROLES + ['all'], help='全部分類、沒有異常、已 push 才前進水位線')
    i.add_argument('--by', help='誰核對的（例：LAWWW-C）')
    duty_state.add_parser(sub)
    a = ap.parse_args(argv)
    return {'check': check, 'snapshot': snapshot, 'queue': queue, 'roles': roles, 'asks': asks, 'askuser': askuser, 'userwork': userwork, 'releasegate': releasegate, 'loose': loose, 'incr': incr, 'duty': duty_state.run}[a.cmd](a)


if __name__ == '__main__':
    sys.exit(main())
