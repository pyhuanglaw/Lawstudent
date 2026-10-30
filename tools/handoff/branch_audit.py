#!/usr/bin/env python3
"""定期唯讀稽核 GitHub 分支（BRANCH-AUDIT-1028；D88 的分支盤點改成工具）。

使用者 2026-10-28 01:4x：「定期做一次唯讀稽核，再由開發 AI 整理：保留目前四個崗位正在使用的分支、
保留尚未整合完成的 WIP 分支、將確認已完成、完全併入主線的舊分支列入清理候選。」

**只讀**：只跑 git fetch --prune（更新本機的遠端追蹤分支）和比對；不刪、不推、不改任何分支。
--write 只寫兩個本機檔：docs/handoff/branch_audit.json（這次的結果）、
docs/handoff/BRANCH_INVENTORY.md 的「定期唯讀稽核」一節。commit＋push 由值班 LAWWW 做。

分類（一條分支只會落在一類，照下面的順序判斷）：
  保留｜主線          origin/main
  保留｜崗位在用      duty.json 裡 state on 的四個職位的分支（含 RULE_SOURCE）
  保留｜WIP 沒整合完  wip.json 裡還沒結（不是 已整合／已測試／已驗收／已取消）的項目寫的分支
  清理候選            已完成、完全併入 main：①整條分支是 origin/main 的祖先，或②分支上每個 commit 的內容（patch-id）main 都有，
                      或③分出去以後改過的每個檔案，現在 main 的版本一字不差（挑著合、壓成一個 commit 合的也算）
  保留｜main 沒有的內容  其他：列出 main 沒有的 commit 數、這些內容在不在開發線／某個崗位的分支（給開發 AI 判斷）

用法：
  python3 tools/handoff/branch_audit.py              稽核、印出結果（先 git fetch --prune origin）
  python3 tools/handoff/branch_audit.py --no-fetch   不 fetch（測試、沒有網路）
  python3 tools/handoff/branch_audit.py --write      另外寫 branch_audit.json、BRANCH_INVENTORY.md 的那一節
  python3 tools/handoff/branch_audit.py --due        上次稽核超過 24 小時就印「該做了」、結束碼 1（check 也會提醒）
結束碼：0＝稽核完成（有沒有清理候選都是 0）；1＝--due 該做了；2＝讀不到 git、duty.json，或 clone 是淺層的（歷史不完整：不給清單，先 git fetch --unshallow）
"""
import argparse, datetime, json, os, re, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
DUTY = 'docs/handoff/duty.json'
WIP = 'docs/handoff/wip.json'
INV = 'docs/handoff/BRANCH_INVENTORY.md'
STATE = 'docs/handoff/branch_audit.json'
MAIN = 'origin/main'
CLOSED = {'已整合', '已測試', '已驗收', '已取消'}
BEGIN, END = '<!-- BRANCH-AUDIT:BEGIN（tools/handoff/branch_audit.py --write 產生，不要手改）-->', '<!-- BRANCH-AUDIT:END -->'
DUE_HOURS = 24


def git(root, *args, check=True):
    r = subprocess.run(['git', '-C', root] + list(args), capture_output=True, text=True)
    if check and r.returncode != 0:
        raise RuntimeError(f'git {" ".join(args)}：{r.stderr.strip()[:300]}')
    return r.stdout


def is_ancestor(root, a, b):
    return subprocess.run(['git', '-C', root, 'merge-base', '--is-ancestor', a, b], capture_output=True).returncode == 0


def remote_branches(root):
    out = git(root, 'for-each-ref', '--format=%(refname:short)\t%(objectname)\t%(committerdate:iso-strict)', 'refs/remotes/origin')
    res = []
    for ln in out.splitlines():
        name, sha, date = ln.split('\t')
        if name in ('origin/HEAD', 'origin'):
            continue
        res.append({'ref': name, 'branch': name[len('origin/'):], 'sha': sha, 'date': date})
    return res


def load_json(root, rel):
    with open(os.path.join(root, rel), encoding='utf8') as f:
        return json.load(f)


def owners(duty):
    """分支 → 誰（現在在用的職位、交班過的帳號職位）"""
    on, past = {}, {}
    rs = (duty.get('ruleSource') or {}).get('branch')
    for role, r in (duty.get('roles') or {}).items():
        if r.get('branch') and r.get('state') == 'on':
            on.setdefault(r['branch'], []).append(f'{role}-{r.get("account", "?")}')
    if rs:
        on.setdefault(rs, [])
        if 'RULE_SOURCE' not in on[rs]:
            on[rs].append('RULE_SOURCE')
    for h in duty.get('history') or []:
        for role, r in (h.get('roles') or {}).items():
            b = r.get('branch')
            if b:
                tag = f'{role}-{h.get("account", "?")}'
                if tag not in past.setdefault(b, []):
                    past[b].append(tag)
    return on, past


def wip_branches(wip):
    """還沒結的 WIP 寫的分支名（只取「分支名」那一段：『x（wip_backup/…）』取 x）→ [WIP id]"""
    res = {}
    for it in (wip.get('items') or []):
        st = it.get('state') or it.get('status') or ''
        if st in CLOSED:
            continue
        b = (it.get('branch') or '').split('（')[0].split(' ')[0].strip()
        if b:
            res.setdefault(b, []).append(it.get('id', '?'))
    return res


def content_in_main(root, ref):
    """分支的內容是不是都已經在 main：回傳 (判斷, main 沒有的 commit 數, 說明)"""
    ahead = int(git(root, 'rev-list', '--count', f'{MAIN}..{ref}').strip() or 0)
    if ahead == 0:
        return True, 0, '整條分支是 main 的祖先'
    left = git(root, 'log', '--cherry-pick', '--right-only', '--no-merges', '--format=%h', f'{MAIN}...{ref}').split()
    if not left:
        return True, ahead, f'main 沒有的 {ahead} 個 commit 都是合併 commit 或內容（patch-id）main 都有'
    base = git(root, 'merge-base', MAIN, ref).strip()
    changed = [p for p in git(root, 'diff', '--name-only', '--no-renames', base, ref).splitlines() if p]
    diff = [p for p in changed if blob(root, ref, p) != blob(root, MAIN, p)]
    if changed and not diff:
        return True, ahead, f'分出去以後改的 {len(changed)} 個檔案，main 現在一字不差（挑著合或壓成一個 commit 合的）'
    return False, ahead, f'main 沒有的 commit {len(left)} 個（內容比對）；分出去以後改的檔案有 {len(diff)} 個和 main 不一樣'


def blob(root, ref, path):
    r = subprocess.run(['git', '-C', root, 'rev-parse', '--verify', '-q', f'{ref}:{path}'], capture_output=True, text=True)
    return r.stdout.strip() if r.returncode == 0 else None


def audit(root, fetch=True):
    if fetch:
        git(root, 'fetch', '--prune', '-q', 'origin')
    if git(root, 'rev-parse', '--is-shallow-repository').strip() == 'true':   # 淺層 clone：祖先、內容比對都會錯（舊分支會被當成 main 沒有），不給清單
        raise RuntimeError('這個 clone 是淺層的（只有部分歷史），判斷「有沒有完全併入 main」不可靠；先跑 git fetch --unshallow origin 再稽核')
    duty = load_json(root, DUTY)
    try:
        wip = load_json(root, WIP)
    except FileNotFoundError:
        wip = {}
    on, past = owners(duty)
    wipb = wip_branches(wip)
    rs = (duty.get('ruleSource') or {}).get('branch')
    keep_refs = {f'origin/{b}' for b in on}   # 崗位在用的分支：其他分支的內容在不在這些分支裡（資訊）
    rows = []
    for b in remote_branches(root):
        name, ref = b['branch'], b['ref']
        who = on.get(name) or []
        r = dict(b, who='、'.join(who) if who else '、'.join(f'{x}（交班過）' for x in past.get(name, [])) or '—')
        if ref == MAIN:
            r.update(kind='保留｜主線', why='GitHub Pages 正式版', ahead=0)
        elif name in on:
            r.update(kind='保留｜崗位在用', why='duty.json：' + '、'.join(who), ahead=int(git(root, 'rev-list', '--count', f'{MAIN}..{ref}').strip() or 0))
        elif name in wipb:
            r.update(kind='保留｜WIP 沒整合完', why='wip.json：' + '、'.join(wipb[name]), ahead=int(git(root, 'rev-list', '--count', f'{MAIN}..{ref}').strip() or 0))
        else:
            ok, ahead, why = content_in_main(root, ref)
            r.update(ahead=ahead, why=why)
            if ok:
                r['kind'] = '清理候選'
                r['restore'] = f'git push origin {b["sha"][:12]}:refs/heads/{name}'
            else:
                r['kind'] = '保留｜main 沒有的內容'
                inside = [k[len('origin/'):] for k in sorted(keep_refs) if is_ancestor(root, ref, k)]
                r['inside'] = inside
                if inside:
                    r['why'] += '；整條分支已經在 ' + '、'.join(inside) + ' 裡（還沒發布到 main）'
        rows.append(r)
    order = ['保留｜主線', '保留｜崗位在用', '保留｜WIP 沒整合完', '保留｜main 沒有的內容', '清理候選']
    rows.sort(key=lambda r: (order.index(r['kind']), r['branch']))
    at = datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%MZ')
    return {'at': at, 'main': git(root, 'rev-parse', '--short=9', MAIN).strip(), 'ruleSource': rs,
            'counts': {k: sum(1 for r in rows if r['kind'] == k) for k in order}, 'branches': rows}


def table(res):
    L = [f'**稽核時間**：{res["at"]}（`tools/handoff/branch_audit.py`，只讀）；main＝`{res["main"]}`；共 {len(res["branches"])} 條遠端分支：'
         + '、'.join(f'{k} {v}' for k, v in res['counts'].items() if v),
         '',
         '| 分類 | 分支 | 最後 commit | 誰的（duty.json） | main 沒有的 commit | 判斷 |',
         '|---|---|---|---|---|---|']
    for r in res['branches']:
        why = r['why'] + (f'。還原：`{r["restore"]}`' if r.get('restore') else '')
        L.append(f'| {r["kind"]} | `{r["branch"]}` | `{r["sha"][:9]}`（{r["date"][:10]}） | {r["who"]} | {r.get("ahead", 0)} | {why} |')
    L.append('')
    L.append('清理候選＝「已完成、內容全部在 main」；**刪不刪由開發 AI（值班 LAWWW）整理時決定**，刪之前在下面「整理紀錄」記 SHA（雲端工作階段刪不了別的分支：只標記，不反覆重試，D85 第 8 點）。'
             '「保留｜main 沒有的內容」的分支不能刪：裡面有 main 沒有的東西（企劃線的文件本來就不進 main）。')
    return '\n'.join(L)


def write(root, res):
    with open(os.path.join(root, STATE), 'w', encoding='utf8') as f:
        json.dump(res, f, ensure_ascii=False, indent=1)
        f.write('\n')
    p = os.path.join(root, INV)
    with open(p, encoding='utf8') as f:
        s = f.read()
    block = f'{BEGIN}\n## 定期唯讀稽核（最新一次；BRANCH-AUDIT-1028）\n\n{table(res)}\n{END}'
    if BEGIN in s and END in s:
        s = s[:s.index(BEGIN)] + block + s[s.index(END) + len(END):]
    else:
        i = s.find('\n| 分支 |')
        s = (s[:i] + '\n' + block + '\n' + s[i:]) if i >= 0 else s.rstrip('\n') + '\n\n' + block + '\n'
    with open(p, 'w', encoding='utf8') as f:
        f.write(s)


def due(root, hours=DUE_HOURS, now=None):
    """上次稽核是什麼時候、該不該做了：(該做了嗎, 說明)"""
    try:
        at = load_json(root, STATE).get('at')
    except (FileNotFoundError, ValueError):
        return True, '還沒有稽核紀錄（docs/handoff/branch_audit.json）'
    try:
        t = datetime.datetime.strptime(at, '%Y-%m-%dT%H:%MZ').replace(tzinfo=datetime.timezone.utc)
    except (TypeError, ValueError):
        return True, f'稽核紀錄的時間讀不懂：{at!r}'
    now = now or datetime.datetime.now(datetime.timezone.utc)
    h = (now - t).total_seconds() / 3600
    return h > hours, f'上次 {at}（{h:.0f} 小時前）'


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--root', default=ROOT)
    ap.add_argument('--no-fetch', action='store_true')
    ap.add_argument('--write', action='store_true')
    ap.add_argument('--due', action='store_true')
    a = ap.parse_args(argv)
    if a.due:
        d, msg = due(a.root)
        print(('該做分支唯讀稽核了：' if d else '分支唯讀稽核：') + msg + ('（python3 tools/handoff/branch_audit.py --write）' if d else ''))
        return 1 if d else 0
    try:
        res = audit(a.root, fetch=not a.no_fetch)
    except (RuntimeError, FileNotFoundError, ValueError) as e:
        print(f'稽核失敗：{e}')
        return 2
    print(table(res))
    if a.write:
        write(a.root, res)
        print(f'\n已寫入 {STATE}、{INV}（commit＋push 由值班 LAWWW 做）')
    return 0


if __name__ == '__main__':
    sys.exit(main())
