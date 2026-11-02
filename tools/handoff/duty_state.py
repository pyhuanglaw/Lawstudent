#!/usr/bin/env python3
"""值班狀態（D92／HV-10，使用者 2026-10-16 21:35「A／B／C 三帳號任意輪值」）。由 check_handoff.py 的 `duty` 指令呼叫，也可以單獨用。

唯一權威：RULE_SOURCE 分支上的 docs/handoff/duty.json（只有值班中的 LAWWW 寫；接班、交班時更新）。
各職位在**自己的分支**另有一份登記 docs/handoff/duty_<職位>.json（自己寫，不碰別人的分支）；verify 會兩邊對。
帳號只是輪值身分；職位永遠四個（LAWWW、LAWWW2、AA、BB）。接班看「最近一次正式的值班與交班紀錄」，**不照 A→B→C 的順序猜、不看 commit 時間判定值班權**。

  duty verify  [--ref origin/<RULE_SOURCE>] [--no-git]     對帳：只讀，列出異常（結束碼 0 正常／1 有異常／2 duty.json 不存在或壞掉＝不能猜，回報使用者）
  duty plan    --account C [--role LAWWW] [--ref …]        接班清單：上一任是誰、四職位的分支與 SHA、快照、待整合（只讀）
  duty register --account C --role LAWWW --session <id> --branch <分支> [--user-ok]   接班登記（寫工作目錄的 duty.json／duty_<職位>.json）
  duty handoff --account B --role LAWWW [--snapshot <檔名>]  交班登記（寫工作目錄；快照先用 check_handoff.py snapshot 做好）
  duty find                                               找 RULE_SOURCE：掃所有遠端分支的 duty.json，照「登記鏈」（seq＋chain）選最新的那一份；
                                                          兩份互相不包含（分岔）＝不能自己決定，結束碼 1，回報使用者。不看 commit 時間。
  duty sync                                               （值班 LAWWW）把其他三職位在各自分支的 duty_<職位>.json 收進 duty.json

各職位怎麼寫：LAWWW 的 register／handoff 同時寫 duty.json（RULE_SOURCE）和 duty_LAWWW.json；LAWWW2、AA、BB 只寫自己分支的 duty_<職位>.json，
值班 LAWWW 用 sync 收（多個分支同時改 duty.json 會打架，所以只有一個人寫）。

register 的安全規則：
  - 這個職位上一任還沒正式交班（state 不是 handed-off），而且上一任是另一個帳號 → 拒絕，除非加 --user-ok（使用者在對話裡明確說「我回來了／現在由這個帳號接班」）；
    加了也會記一筆異常 no-handoff（上一班來不及交班：以遠端最後 push 的狀態為準）。
  - 不覆寫別的帳號的分支、不改任務；只更新值班狀態。
"""
import json, os, re, subprocess, sys
from datetime import datetime, timezone

DUTY = 'docs/handoff/duty.json'
ROLE_FILE = 'docs/handoff/duty_{role}.json'
SNAPDIR = 'docs/handoff/snapshots'
ROSTER_DOC = 'docs/AI_SESSION_HANDOFF.md'
ROLES = ('LAWWW', 'LAWWW2', 'AA', 'BB')
ACCOUNTS = ('A', 'B', 'C', 'D')   # 使用者 2026-10-18：可能開第四個帳號（D），四個帳號任意方向輪值
SUFFIX = {'A': '', 'B': '-B', 'C': '-C', 'D': '-D'}   # 工作階段名稱：LAWWW、LAWWW-B、LAWWW-C、LAWWW-D
ROLE_STATES = ('on', 'handed-off', 'unknown')
ACCOUNT_STATES = ('on', 'off', 'unused')


def now():
    return datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%MZ')


def _ts(s):
    """時間字串 → 可以比大小的 tuple：'2026-10-27'、'2026-10-27T16:46Z'、'…T16:46:30Z'、手寫的 '16:4x'（x 當 0）都吃；看不懂回 None"""
    m = re.match(r'(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{1,2}):(\d{2})(?::(\d{2}))?)?', str(s or '').replace('x', '0'))
    return tuple(int(g) if g else 0 for g in m.groups()) if m else None


def session_name(role, account):
    return role + SUFFIX.get(account, '-' + account)


def account_of(name):
    """「LAWWW2-B」→ B；沒有後綴＝A（舊紀錄的慣例）；未知的回傳 None。"""
    s = str(name or '')
    for a in ('C', 'B'):
        if s.endswith('-' + a):
            return a
    base = s.split('-')[0]
    return 'A' if base in ROLES and s == base else None


def git(root, *args):
    r = subprocess.run(['git', '-C', root, *args], capture_output=True)
    return (r.returncode, r.stdout.decode('utf-8', 'replace').strip())


class Src:
    def __init__(self, root, ref=None):
        self.root, self.ref = root, ref

    def read(self, path, ref=None):
        ref = ref if ref is not None else self.ref
        if ref:
            rc, out = git(self.root, 'show', f'{ref}:{path}')
            if rc:
                raise FileNotFoundError(f'{ref}:{path}')
            return out
        with open(os.path.join(self.root, path), encoding='utf-8') as f:
            return f.read()


def load(src, ref=None):
    """回傳 (duty, 錯誤)。"""
    try:
        d = json.loads(src.read(DUTY, ref))
    except FileNotFoundError:
        return None, f'{DUTY} 不存在'
    except Exception as e:
        return None, f'{DUTY} 壞掉：{e}'
    miss = [k for k in ('version', 'ruleVersion', 'ruleSource', 'onDuty', 'accountState', 'roles', 'history') if k not in d]
    if miss:
        return None, f'{DUTY} 缺欄位：{miss}'
    return d, None


def ref_exists(root, ref):
    return git(root, 'rev-parse', '--verify', '--quiet', ref)[0] == 0


def is_ancestor(root, a, b):
    return git(root, 'merge-base', '--is-ancestor', a, b)[0] == 0


def remote_ref(branch, use_origin=True):
    return f'origin/{branch}' if use_origin else branch


def verify(args, d=None, out=None):
    """只讀。回傳結束碼。異常寫進 out（list）。"""
    src = Src(args.root, getattr(args, 'ref', None))
    own = out is None
    out = [] if out is None else out
    info = []
    A = lambda n, msg: out.append((n, msg))
    if d is None:
        d, err = load(src)
        if err:
            print(f'[致命] {err}')
            print('結果：不能判斷誰在值班——不要猜、不要用 commit 時間決定；照總入口第 4 節第 2 步回報使用者，由使用者指定。')
            return 2
    st = d.get('accountState') or {}
    on = [a for a, v in st.items() if v == 'on']
    # 1 帳號狀態
    for a in ACCOUNTS:
        if a not in st:
            A(1, f'帳號 {a} 沒有狀態（accountState）')
        elif st[a] not in ACCOUNT_STATES:
            A(1, f'帳號 {a} 的狀態「{st[a]}」不合法（{"／".join(ACCOUNT_STATES)}）')
    if len(on) > 1:
        A(1, f'同時有兩個以上帳號值班：{on}——不能自己判斷，回報使用者')
    if d.get('onDuty') and d['onDuty'] not in on:
        A(1, f'onDuty＝{d["onDuty"]}，但它的 accountState 不是 on')
    if not d.get('onDuty') and on:
        A(1, f'onDuty 空著，但 accountState 有 on：{on}')
    if d.get('onDuty') and d.get('previous') == d.get('onDuty'):
        lh0 = d.get('lastHandoff') or {}
        if lh0.get('from') == d['onDuty'] and lh0.get('kind') == 'handoff':
            # 同一個帳號正式交班以後，中間沒有別的帳號值班，又回來接班（例：2026-10-13 A→A、2026-10-18 C→C）
            info.append(f'帳號 {d["onDuty"]} 正式交班（{lh0.get("at")}）以後又回來值班，中間沒有別的帳號：上一任就是自己')
        else:
            A(1, 'previous 和 onDuty 是同一個帳號（上一任應該是前一個值班的帳號）')
    # 2 四個職位
    roles = d.get('roles') or {}
    for r in ROLES:
        x = roles.get(r)
        if not x:
            A(2, f'職位 {r} 沒有值班紀錄')
            continue
        if x.get('account') not in ACCOUNTS:
            A(2, f'{r}：帳號「{x.get("account")}」不合法')
        if x.get('state') not in ROLE_STATES:
            A(2, f'{r}：狀態「{x.get("state")}」不合法')
        if x.get('state') == 'on' and d.get('onDuty') and x.get('account') != d['onDuty']:
            A(2, f'{r}：還在 {x.get("account")} 帳號手上（state on），但值班的是 {d["onDuty"]}＝接班沒完成或上一班沒交班')
        if x.get('state') == 'handed-off' and d.get('onDuty') and x.get('account') == d['onDuty']:
            A(2, f'{r}：值班帳號自己的職位標成已交班（{x.get("handedOffAt")}）——要嘛換班中，要嘛紀錄錯')
        if x.get('session') and x.get('account') in ACCOUNTS and not str(x['session']).startswith('session_'):
            A(2, f'{r}：session 不是工作階段 ID（{x["session"]}）')
    # 3 RULE_SOURCE
    rs = d.get('ruleSource') or {}
    lw = roles.get('LAWWW') or {}
    if rs.get('branch') != lw.get('branch'):
        A(3, f'RULE_SOURCE 分支 {rs.get("branch")} 和值班 LAWWW 的分支 {lw.get("branch")} 不一樣（RULE_SOURCE＝值班 LAWWW 的開發分支）')
    # 4 分支與 SHA（git）
    if not getattr(args, 'no_git', False):
        for r in ROLES:
            x = roles.get(r) or {}
            b, sha = x.get('branch'), x.get('sha')
            if not b:
                A(4, f'{r}：沒有分支')
                continue
            ref = remote_ref(b, not getattr(args, 'local', False))
            if not ref_exists(args.root, ref):
                A(4, f'{r}：分支 {ref} 不存在（被刪了、還沒 push、或 fetch 不完整）')
                continue
            if sha:
                if not ref_exists(args.root, sha + '^{commit}'):
                    A(4, f'{r}：記錄的 SHA {sha} 在這個 checkout 找不到（fetch 不完整，或被 force push 蓋掉）')
                elif not is_ancestor(args.root, sha, ref):
                    A(4, f'{r}：記錄的 SHA {sha} 不在 {ref} 的歷史上——分支被改寫過？不能當作正常')
                else:
                    rc, n = git(args.root, 'rev-list', '--count', f'{sha}..{ref}')
                    info.append(f'{r}（{session_name(r, x.get("account"))}）：{ref} 在記錄的 {sha} 之後又有 {n} 個 commit')
            # 5 職位自己的登記（在自己的分支）
            try:
                own_reg = json.loads(src.read(ROLE_FILE.format(role=r), ref))
                if own_reg.get('account') != x.get('account') or (x.get('session') and own_reg.get('session') != x.get('session')):
                    A(5, f'{r}：自己分支上的登記（帳號 {own_reg.get("account")}、{own_reg.get("session")}）和 duty.json（帳號 {x.get("account")}、{x.get("session")}）對不起來')
            except FileNotFoundError:
                info.append(f'{r}：{ref} 上還沒有 {ROLE_FILE.format(role=r)}（舊制度的職位，接班時補登記）')
            except Exception as e:
                A(5, f'{r}：{ROLE_FILE.format(role=r)} 壞掉：{e}')
        # 6 同職位兩個帳號疑似同時寫入：別的帳號用過的這個職位的分支，在本任接班以後還有新 commit
        for r in ROLES:
            x = roles.get(r) or {}
            since = x.get('sinceSha')
            latest = {}   # 同一條分支只看最後一次交班（帳號休班又回來、再交班的，以後一次為準）
            for h in d.get('history') or []:
                hb = ((h.get('roles') or {}).get(r) or {}).get('branch')
                if hb:
                    latest[hb] = h
            for hb, h in latest.items():
                if h.get('account') == x.get('account') or hb == x.get('branch'):
                    continue
                href = remote_ref(hb, not getattr(args, 'local', False))
                last = ((h.get('roles') or {}).get(r) or {}).get('sha')
                if last and ref_exists(args.root, href) and ref_exists(args.root, last + '^{commit}'):
                    rc, n = git(args.root, 'rev-list', '--count', f'{last}..{href}')
                    rc2, files = git(args.root, 'diff', '--name-only', last, href)
                    real = [f for f in files.splitlines() if f and not (f.startswith('docs/handoff/') or f == ROSTER_DOC)]   # 交班本身的紀錄（duty_*.json、快照、值班表）不算繼續寫
                    # 接班的 LAWWW 查核過、記在 anomalies（kind post-handoff-writes、reviewedThrough＝查到的那個 commit）：分支停在那裡就只列資訊；之後又有新 commit 照樣報異常（fail closed）
                    rv = [a for a in d.get('anomalies') or [] if a.get('kind') == 'post-handoff-writes' and a.get('role') == r and a.get('branch') == hb and a.get('resolved') and a.get('reviewedThrough')]
                    rc3, tip = git(args.root, 'rev-parse', href)
                    if rv and rc3 == 0 and any(tip.strip().startswith(a['reviewedThrough']) for a in rv):
                        info.append(f'{r}：帳號 {h.get("account")} 的分支 {hb} 交班（{last}）以後的 {n} 個 commit 已查核（{rv[-1]["reviewedThrough"]}，見 anomalies）')
                        continue
                    if rc == 0 and n.isdigit() and int(n) > 0 and real:
                        A(6, f'{r}：帳號 {h.get("account")} 的分支 {hb} 在它交班（{last}）以後還有 {n} 個 commit——疑似兩個帳號同時寫同一個職位；查清楚以前不要合併、不要覆寫，回報使用者')
    # 11 職位登記的 WIP 分支：還沒整合進自己的分支＝未整合（不能當作完成，也不能刪）
    if not getattr(args, 'no_git', False):
        for r in ROLES:
            x = roles.get(r) or {}
            for w in x.get('wip') or []:
                wref, bref = remote_ref(w, not getattr(args, 'local', False)), remote_ref(x.get('branch') or '', not getattr(args, 'local', False))
                if not ref_exists(args.root, wref):
                    A(11, f'{r}：登記的 WIP 分支 {w} 不存在（被刪了？成果可能遺失）')
                elif ref_exists(args.root, bref) and not is_ancestor(args.root, wref, bref):
                    rc, n = git(args.root, 'rev-list', '--count', f'{bref}..{wref}')
                    A(11, f'{r}：WIP 分支 {w} 還有 {n} 個 commit 沒整合進 {x.get("branch")}——接班要先整合或登記，不能刪')
    # 7 上一次交班的快照
    lh = d.get('lastHandoff') or {}
    if d.get('previous') and not lh:
        A(7, f'有上一任（{d["previous"]}），但沒有 lastHandoff 紀錄')
    for r, ent in (lh.get('snapshots') or {}).items():
        fn, sref = (ent.get('file'), ent.get('ref')) if isinstance(ent, dict) else (ent, None)
        try:
            s = json.loads(src.read(f'{SNAPDIR}/{fn}', sref or src.ref))
            for k in ('version', 'taken', 'role', 'account', 'open', 'status'):
                if k not in s:
                    raise ValueError(f'缺 {k}')
            if s.get('account') != lh.get('from'):
                A(7, f'{r}：交班快照 {fn} 的帳號是 {s.get("account")}，不是上一任 {lh.get("from")}')
        except FileNotFoundError:
            A(7, f'{r}：上一次交班的快照 {fn} 找不到——照總入口第 4 節做 REMEDIAL_FULL_AUDIT')
        except Exception as e:
            A(7, f'{r}：上一次交班的快照 {fn} 壞掉（{e}）——REMEDIAL_FULL_AUDIT')
    if lh.get('kind') == 'emergency':
        info.append(f'上一次交接是緊急接班（上一任 {lh.get("from")} 沒有正式交班）：以遠端最後 push 的狀態為準，交接缺漏要補查')
    # 8 換班中
    if d.get('pending'):
        A(8, f'換班還沒完成：{json.dumps(d["pending"], ensure_ascii=False)}')
    # 9 總入口的值班表要和 duty.json 一致
    try:
        doc = src.read(ROSTER_DOC)
        if d.get('onDuty') and f'{d["onDuty"]} 值班中' not in doc:
            A(9, f'{ROSTER_DOC} 第 1 節的值班表沒寫「{d["onDuty"]} 值班中」（以 duty.json 為準，文件要跟上）')
        for a in on:
            pass
    except FileNotFoundError:
        A(9, f'{ROSTER_DOC} 不存在')
    for a in d.get('anomalies') or []:
        if not a.get('resolved'):
            A(10, f'未結的異常：{a.get("kind")}｜{a.get("note", "")}')
    if own:
        print(f'值班：{d.get("onDuty") or "（沒有人，換班中）"}；上一任：{d.get("previous") or "—"}；規則 {d.get("ruleVersion")}＠{rs.get("branch")} {rs.get("sha", "")}')
        print('帳號：' + '、'.join(f'{a} {st.get(a, "?")}' for a in ACCOUNTS))
        for r in ROLES:
            x = roles.get(r) or {}
            print(f'  {r:<6} {session_name(r, x.get("account")) if x.get("account") else "?":<9} {x.get("state", "?"):<10} {x.get("branch", "?")} {x.get("sha", "")}')
        for l in info:
            print('[資訊] ' + l)
        for n, msg in out:
            print(f'[異常 {n}] {msg}')
        if out:
            print(f'結果：異常 {len(out)} 項——來源不一致時不要猜哪一班最新，查證不了就回報使用者')
            return 1
        print('結果：OK（值班狀態一致）')
    return 1 if out else 0


def plan(args):
    src = Src(args.root, getattr(args, 'ref', None))
    d, err = load(src)
    if err:
        print(f'[致命] {err}——不能自己判斷上一任，回報使用者')
        return 2
    me = args.account
    prev = d.get('onDuty') if d.get('onDuty') and d['onDuty'] != me else (d.get('previous') if d.get('previous') != me else (d.get('lastHandoff') or {}).get('from'))
    print(f'接班清單（帳號 {me}）——上一任以 duty.json 為準：{prev or "（沒有紀錄）"}；現在值班：{d.get("onDuty") or "沒有人"}')
    if d.get('onDuty') and d['onDuty'] != me:
        print(f'  ⚠ 帳號 {d["onDuty"]} 還登記在值班：要嘛它正式交班（duty handoff），要嘛使用者明確要你接（register --user-ok，會記 no-handoff）')
    for r in ROLES if not args.role else (args.role,):
        x = (d.get('roles') or {}).get(r) or {}
        print(f'  {r}：上一任 {session_name(r, x.get("account")) if x.get("account") else "?"}（{x.get("state")}），分支 {x.get("branch")}，最後確認 {x.get("sha")}；'
              f'你的工作階段叫 {session_name(r, me)}')
    lh = d.get('lastHandoff') or {}
    if lh:
        print(f'  上一次交班：{lh.get("from")} {lh.get("at")}（{lh.get("kind", "handoff")}），快照：{json.dumps(lh.get("snapshots") or {}, ensure_ascii=False)}')
    print('步驟（總入口第 4 節，14 步）：fetch → RULE_SOURCE（duty.json 的 ruleSource）→ 讀規則與第 13 節 → 上一任（上面）→ 四職位交接檔（六類）→ '
          'check_handoff.py check（任務、交付、快照）→ duty verify → 找未整合／未測／WIP（BRANCH_INVENTORY、deliveries）→ 確認任務都在 → '
          '確認輪到自己寫入 → 合併（不 rebase、不 force push）→ duty register＋commit＋push → 接班確認 → 接續已批准的工作')
    return 0


def _chain(d, account, role, event):
    d['seq'] = int(d.get('seq') or 0) + 1
    d.setdefault('chain', []).append({'seq': d['seq'], 'at': now(), 'account': account, 'role': role, 'event': event})


def _write(root, path, obj):
    p = os.path.join(root, path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        json.dump(obj, f, ensure_ascii=False, indent=1)
        f.write('\n')


def register(args):
    src = Src(args.root)
    ref, err = _role_ref(args)
    if err:
        print(f'[致命] {err}——沒有值班狀態不能登記；回報使用者')
        return 2
    d, err = load(src, ref)
    if err:
        print(f'[致命] {err}——沒有值班狀態不能登記；回報使用者')
        return 2
    me, r = args.account, args.role
    roles = d.setdefault('roles', {})
    x = roles.get(r) or {}
    head = git(args.root, 'rev-parse', '--short=8', 'HEAD')[1] or '?'
    if x.get('account') == me and x.get('state') == 'on' and x.get('session') == args.session:
        rp = os.path.join(args.root, ROLE_FILE.format(role=r))
        if os.path.exists(rp) and not getattr(args, 'wip', None):
            print(f'{r} 已經是帳號 {me}（{args.session}）在值班，不用再登記')
            return 0
        # 補登記：duty.json 已經是你，但自己分支上還沒有 duty_<職位>.json（舊制度接班的職位），或要更新 WIP 清單
        reg = {'role': r, 'account': me, 'session': args.session, 'branch': args.branch, 'since': x.get('since') or now(), 'state': 'on',
               'sinceSha': x.get('sinceSha') or x.get('sha') or head, 'userOk': False}
        if getattr(args, 'wip', None):
            reg['wip'] = args.wip
        _write(args.root, ROLE_FILE.format(role=r), reg)
        if r == 'LAWWW' and getattr(args, 'wip', None):
            x['wip'] = args.wip
            _write(args.root, DUTY, d)
        print(f'補登記：{r} 已經是帳號 {me}（{args.session}）在值班；寫了自己的 {ROLE_FILE.format(role=r)}' + ('（含 WIP：' + '、'.join(args.wip) + '）' if getattr(args, 'wip', None) else '') + '——commit＋push 以後，值班 LAWWW 跑 duty sync')
        return 0
    prev_acc = x.get('account')
    no_handoff = prev_acc and prev_acc != me and x.get('state') != 'handed-off'
    if no_handoff and not args.user_ok:
        print(f'[拒絕] {r} 的上一任（帳號 {prev_acc}，{x.get("session")}）還沒正式交班（state {x.get("state")}）。'
              f'不能自己接——要嘛等它交班，要嘛使用者在對話裡明確要你接，再加 --user-ok（會記一筆 no-handoff）。')
        return 1
    if prev_acc and prev_acc != me:
        h = {'account': prev_acc, 'role': r, 'roles': {r: {k: x.get(k) for k in ('session', 'branch', 'sha', 'since', 'handedOffAt', 'state')}}, 'until': now()}
        d.setdefault('history', []).append(h)
    if no_handoff:
        d.setdefault('anomalies', []).append({'kind': 'no-handoff', 'role': r, 'from': prev_acc, 'to': me, 'at': now(),
                                              'note': f'{r} 上一任 {prev_acc} 沒有正式交班，使用者指示接班；以遠端最後 push 的狀態為準', 'resolved': False})
    roles[r] = {'account': me, 'session': args.session, 'branch': args.branch, 'sha': head, 'sinceSha': head, 'since': now(), 'state': 'on', **({'wip': args.wip} if getattr(args, 'wip', None) else {}),
                'prev': {'account': prev_acc, 'session': x.get('session'), 'branch': x.get('branch'), 'sha': x.get('sha')} if prev_acc else None}
    if r == 'LAWWW':
        st = d.setdefault('accountState', {})
        old = d.get('onDuty')
        if old and old != me:
            d['previous'] = old
            st[old] = 'off'
        elif not old and (d.get('lastHandoff') or {}).get('from') and d['lastHandoff']['from'] != me:
            d['previous'] = d['lastHandoff']['from']
        d['onDuty'] = me
        st[me] = 'on'
        for a in ACCOUNTS:
            st.setdefault(a, 'unused')
        d['ruleSource'] = {'branch': args.branch, 'sha': head, 'updated': now()}
        if d.get('pending'):
            d['pending'] = None
    reg = {'role': r, 'account': me, 'session': args.session, 'branch': args.branch, 'since': now(), 'state': 'on', 'sinceSha': head, 'userOk': bool(no_handoff)}
    if getattr(args, 'wip', None):
        reg['wip'] = args.wip
    _write(args.root, ROLE_FILE.format(role=r), reg)
    if r != 'LAWWW':
        print(f'登記：{session_name(r, me)}（帳號 {me}）接 {r}，分支 {args.branch} @ {head}——只寫了自己的 {ROLE_FILE.format(role=r)}；commit＋push 以後，值班 LAWWW 跑 duty sync 收進 duty.json')
        return 0
    _chain(d, me, r, 'register' + ('-user-ok' if no_handoff else ''))
    _write(args.root, DUTY, d)
    print(f'登記：{session_name(r, me)}（帳號 {me}）接 {r}，分支 {args.branch} @ {head}' + (f'（上一任 {prev_acc}{"，沒有正式交班＝已記異常" if no_handoff else ""}）' if prev_acc and prev_acc != me else ''))
    print(f'寫了 {DUTY}、{ROLE_FILE.format(role=r)}——commit＋push 才算登記完成；LAWWW 以外的職位，duty.json 的變更交給值班 LAWWW 併進 RULE_SOURCE')
    return 0


def _role_ref(args):
    """LAWWW 以外的職位在自己的分支（企劃線、美術分支）上沒有 duty.json：沒給 --ref 就自己找 RULE_SOURCE 讀（同 check_handoff.py snapshot；TOOL-DUTY-HANDOFF-BRANCH-1022，BB 10-22 15:08 交班跑不起來）。
    回傳 (ref, 錯誤)；LAWWW、或本機有 duty.json＝照舊讀本機。"""
    ref = getattr(args, 'ref', None)
    if ref or args.role == 'LAWWW' or os.path.exists(os.path.join(args.root, DUTY)):
        return ref, None
    code, b = find(args, quiet=True)
    if code or not b:
        return None, f'這條分支沒有 {DUTY}，也找不到 RULE_SOURCE（先 git fetch --all；或加 --ref origin/<規則來源分支>）'
    print(f'值班狀態從 origin/{b} 讀（這條分支沒有 {DUTY}）')
    return 'origin/' + b, None


def handoff(args):
    src = Src(args.root)
    ref, err = _role_ref(args)
    if err:
        print(f'[致命] {err}')
        return 2
    d, err = load(src, ref)
    if err:
        print(f'[致命] {err}')
        return 2
    me, r = args.account, args.role
    x = (d.get('roles') or {}).get(r) or {}
    if x.get('account') != me or x.get('state') != 'on':
        print(f'[拒絕] {r} 現在登記的是帳號 {x.get("account")}（{x.get("state")}），不是帳號 {me} 在值班——不能替別人交班')
        return 1
    head = git(args.root, 'rev-parse', '--short=8', 'HEAD')[1] or '?'
    x.update({'state': 'handed-off', 'handedOffAt': now(), 'sha': head})
    if args.snapshot:
        x['handoffSnapshot'] = args.snapshot
    lh = d.get('lastHandoff') or {}
    if lh.get('from') != me or lh.get('closed'):
        lh = {'from': me, 'at': now(), 'kind': 'handoff', 'snapshots': {}}
    if args.snapshot:
        lh.setdefault('snapshots', {})[r] = args.snapshot
    d['lastHandoff'] = lh
    if r == 'LAWWW':
        d['previous'] = me
        d['onDuty'] = None
        d.setdefault('accountState', {})[me] = 'off'
        lh['closed'] = True
        d['pending'] = None
    else:
        d['pending'] = {'from': me, 'rolesHandedOff': sorted(k for k, v in (d.get('roles') or {}).items() if v.get('state') == 'handed-off')}
    reg = {'role': r, 'account': me, 'session': x.get('session'), 'branch': x.get('branch'), 'state': 'handed-off', 'handedOffAt': x['handedOffAt'], 'sha': head, 'snapshot': args.snapshot}
    _write(args.root, ROLE_FILE.format(role=r), reg)
    if r != 'LAWWW':
        print(f'交班：{session_name(r, me)} 交出 {r} @ {head}——寫了自己的 {ROLE_FILE.format(role=r)}；commit＋push，值班 LAWWW 交班前跑 duty sync')
        return 0
    _chain(d, me, r, 'handoff')
    _write(args.root, DUTY, d)
    print(f'交班：{session_name(r, me)}（帳號 {me}）交出 {r} @ {head}' + (f'，快照 {args.snapshot}' if args.snapshot else '（沒有指定快照——先跑 check_handoff.py snapshot）'))
    return 0


def remote_branches(root):
    rc, out = git(root, 'for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/')
    return [l for l in out.splitlines() if l and not l.endswith('/HEAD')] if rc == 0 else []


def find(args, quiet=False):
    """掃所有遠端分支的 duty.json，照登記鏈選 RULE_SOURCE。回傳 (結束碼, 分支)。"""
    src = Src(args.root)
    cands = []
    for ref in remote_branches(args.root):
        try:
            d = json.loads(src.read(DUTY, ref))
        except Exception:
            continue
        b = ref[len('origin/'):] if ref.startswith('origin/') else ref
        if (d.get('ruleSource') or {}).get('branch') != b:
            continue   # 別的分支合併進來的副本，不是它自己的值班狀態
        cands.append((b, d))
    if not cands:
        if not quiet:
            print('[致命] 遠端沒有任何分支有自己的 duty.json——不能判斷 RULE_SOURCE，回報使用者')
        return 2, None
    def key(c):
        return [(e.get('seq'), e.get('account'), e.get('role'), e.get('event')) for e in (c[1].get('chain') or [])]
    def contains(big, small):
        ks, kb = key(small), key(big)
        return len(ks) <= len(kb) and kb[:len(ks)] == ks
    tops = [c for c in cands if not any(o is not c and contains(o, c) and len(key(o)) > len(key(c)) for o in cands)]
    if len(tops) > 1:
        # 完全一樣的鏈（同一份狀態合併到多個分支）只要 ruleSource 指向自己的那份——上面已經篩過；剩下多份＝分岔
        if not quiet:
            print('[異常] 兩份以上的值班狀態互相不包含（登記鏈分岔）——不能自己決定哪一班最新，回報使用者：')
            for b, d in tops:
                print(f'  {b}：值班 {d.get("onDuty")}，seq {d.get("seq")}，最後 {json.dumps((d.get("chain") or [{}])[-1], ensure_ascii=False)}')
        return 1, None
    b, d = tops[0]
    if not quiet:
        print(f'RULE_SOURCE：{b}（值班 {d.get("onDuty") or "沒有人"}、上一任 {d.get("previous") or "—"}、規則 {d.get("ruleVersion")}、seq {d.get("seq")}）')
    return 0, b


def sync(args):
    src = Src(args.root)
    d, err = load(src)
    if err:
        print(f'[致命] {err}')
        return 2
    changed = []
    for r in ROLES:
        if r == 'LAWWW':
            continue
        found = []
        for ref in remote_branches(args.root):
            try:
                reg = json.loads(src.read(ROLE_FILE.format(role=r), ref))
            except Exception:
                continue
            if reg.get('branch') and ref != f'origin/{reg["branch"]}':
                continue
            found.append((ref, reg))
        cur = (d.get('roles') or {}).get(r) or {}
        mine = [f for f in found if f[1].get('account') == (d.get('onDuty') or cur.get('account'))]
        if len(mine) > 1:
            print(f'[異常] {r}：值班帳號有兩份登記 {[f[0] for f in mine]}——不收，回報使用者')
            continue
        if not mine:
            continue
        ref, reg = mine[0]
        # 擋舊登記（HV-20；兩次事故：10-23 本機的遠端分支沒 fetch、讀到上一次交班的檔；10-27 職位分支上留著 10-20 的 state on）
        # ① 本機的遠端分支要和 GitHub 一樣新：不一樣就先 fetch 那一條再讀；查不到遠端就不收
        br = ref.split('origin/', 1)[1] if ref.startswith('origin/') else ref
        rc_r, rem = git(args.root, 'ls-remote', 'origin', 'refs/heads/' + br)
        rsha = rem.split()[0] if rc_r == 0 and rem.strip() else None
        if not rsha:
            print(f'[略過] {r}：查不到遠端分支 {br}（ls-remote 失敗）——不收，連得上 GitHub 再 sync')
            continue
        if rsha != git(args.root, 'rev-parse', ref)[1]:
            git(args.root, 'fetch', '-q', 'origin', f'+refs/heads/{br}:refs/remotes/{ref}')
            try:
                reg = json.loads(src.read(ROLE_FILE.format(role=r), ref))
            except Exception:
                print(f'[略過] {r}：{ref} fetch 以後讀不到 {ROLE_FILE.format(role=r)}——不收')
                continue
            if reg.get('account') != mine[0][1].get('account'):
                print(f'[略過] {r}：{ref} fetch 以後帳號變了——不收，重新 sync')
                continue
        # ② 只收比 duty.json 現在這一筆新的登記：職位交班沒用 duty handoff 改自己的 duty_<職位>.json 時，檔案會一直寫 state on，下次那個帳號回來就被當成新登記
        rt, ct = _ts(reg.get('since')), _ts(cur.get('since'))
        if rt and ct and rt < ct:
            print(f'[略過] {r}：{ref} 的登記（帳號 {reg.get("account")}，since {reg.get("since")}）比 duty.json 現在的（帳號 {cur.get("account")}，since {cur.get("since")}）舊——是上一次值班留下的檔，等它重新 duty register')
            continue
        tip = git(args.root, 'rev-parse', '--short=8', ref)[1]
        new = {'account': reg['account'], 'session': reg.get('session'), 'branch': reg.get('branch'), 'sha': reg.get('sha') or tip,
               'sinceSha': reg.get('sinceSha'), 'since': reg.get('since'), 'state': reg.get('state', 'on')}
        if reg.get('handedOffAt'):
            new['handedOffAt'] = reg['handedOffAt']
        if reg.get('snapshot'):
            new['handoffSnapshot'] = reg['snapshot']
        if reg.get('wip') is not None:
            new['wip'] = reg['wip']
        if cur.get('account') and cur.get('account') != new['account']:
            d.setdefault('history', []).append({'account': cur['account'], 'role': r, 'roles': {r: {k: cur.get(k) for k in ('session', 'branch', 'sha', 'state', 'handedOffAt')}}, 'until': now()})
            if cur.get('state') != 'handed-off' and not reg.get('userOk'):
                d.setdefault('anomalies', []).append({'kind': 'no-handoff', 'role': r, 'from': cur['account'], 'to': new['account'], 'at': now(), 'note': f'{r} 上一任沒有正式交班', 'resolved': False})
        if {k: cur.get(k) for k in new} != new:
            d.setdefault('roles', {})[r] = {**cur, **new}
            changed.append(r)
            if new['state'] == 'handed-off' and new['account'] == d.get('onDuty'):
                lh = d.get('lastHandoff') or {}
                if lh.get('from') != new['account'] or lh.get('closed'):
                    lh = {'from': new['account'], 'at': now(), 'kind': 'handoff', 'snapshots': {}}
                if reg.get('snapshot'):
                    lh.setdefault('snapshots', {})[r] = {'file': reg['snapshot'], 'ref': ref}
                d['lastHandoff'] = lh
                d['pending'] = {'from': new['account'], 'rolesHandedOff': sorted(k for k, v in (d.get('roles') or {}).items() if v.get('state') == 'handed-off' and v.get('account') == new['account'])}
    if changed:
        _chain(d, d.get('onDuty') or '-', ','.join(changed), 'sync')
        _write(args.root, DUTY, d)
    print('sync：' + ('更新 ' + '、'.join(changed) if changed else '沒有變更'))
    return 0


def add_parser(sub):
    p = sub.add_parser('duty', help='值班狀態（D92／HV-10）')
    ds = p.add_subparsers(dest='dcmd', required=True)
    v = ds.add_parser('verify')
    v.add_argument('--ref')
    v.add_argument('--no-git', action='store_true')
    v.add_argument('--local', action='store_true', help='分支用本機名稱（測試用），不加 origin/')
    pl = ds.add_parser('plan')
    pl.add_argument('--account', required=True, choices=ACCOUNTS)
    pl.add_argument('--role', choices=ROLES)
    pl.add_argument('--ref')
    rg = ds.add_parser('register')
    rg.add_argument('--account', required=True, choices=ACCOUNTS)
    rg.add_argument('--role', required=True, choices=ROLES)
    rg.add_argument('--session', required=True)
    rg.add_argument('--branch', required=True)
    rg.add_argument('--user-ok', action='store_true')
    rg.add_argument('--wip', action='append', help='這個職位還沒整合的 WIP 分支（可以多個）')
    ho = ds.add_parser('handoff')
    ho.add_argument('--account', required=True, choices=ACCOUNTS)
    ho.add_argument('--role', required=True, choices=ROLES)
    ho.add_argument('--snapshot')
    ho.add_argument('--ref', help='LAWWW 以外的職位：從 RULE_SOURCE 讀 duty.json 檢查（例：origin/<RULE_SOURCE>）')
    rg.add_argument('--ref', help='LAWWW 以外的職位：從 RULE_SOURCE 讀 duty.json 檢查上一任')
    ds.add_parser('find')
    ds.add_parser('sync')
    return p


def run(args):
    if args.dcmd == 'find':
        return find(args)[0]
    return {'verify': verify, 'plan': plan, 'register': register, 'handoff': handoff, 'sync': sync}[args.dcmd](args)
