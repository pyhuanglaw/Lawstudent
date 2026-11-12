#!/usr/bin/env python3
"""規則包同步（D157／HV-37，使用者 2026-11-12 對 CC-C：「我有一種感覺是每次換帳號，我就要重新說一次，到底有沒有寫進去每個帳號每個角色都會看到規則」）。

為什麼要有這支：工作階段啟動時自動載入的是「自己分支根目錄」的 CLAUDE.md 和 .claude/settings.json，不是 RULE_SOURCE 的。
2026-11-12 查到 AA、BB、LAWWW2、CC 四條分支的 CLAUDE.md 都是舊版、而且完全沒有 hook（使用者要求提醒、等的時候不閒著都沒在跑）。

規則包＝CLAUDE.md、docs/rules/、.claude/settings.json 的 hooks、tools/handoff/（hook 和 check_handoff 本身）、docs/handoff/FACTS.md。

用法：
  python3 tools/handoff/rules_sync.py --check          和 origin/<RULE_SOURCE> 比；一樣＝結束碼 0，不一樣＝1 並列出哪些檔
  python3 tools/handoff/rules_sync.py --apply          把規則包換成 RULE_SOURCE 的版本（只動規則包，不合併程式）；之後自己 commit＋push
  python3 tools/handoff/rules_sync.py --hook           給 UserPromptSubmit hook 用：舊了就印一段提醒（JSON），不舊不印；最多每 10 分鐘 fetch 一次，而且只抓 RULE_SOURCE 那一條分支（12 秒逾時）
RULE_SOURCE 自己那條分支跑＝永遠一樣。找不到 RULE_SOURCE（duty find 失敗）＝結束碼 2。"""
import json, os, re, subprocess, sys, time

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip() or os.getcwd()
PACK = ['CLAUDE.md', 'docs/rules', 'tools/handoff', 'docs/handoff/FACTS.md']   # .claude/settings.json 另外處理（只換 hooks）
STAMP = os.path.join(ROOT, '.git', 'rules_sync_fetch')


def git(*a, check=False):
    r = subprocess.run(['git', '-C', ROOT] + list(a), capture_output=True, text=True)
    if check and r.returncode:
        raise SystemExit(f'git {" ".join(a)} 失敗：{r.stderr.strip()[:300]}')
    return r


FETCH_TIMEOUT = 12


def rule_source(fetch, full=False):
    """值班 LAWWW 的開發分支。先看遠端各分支的 duty.json，取 seq 最大的那一份的 ruleSource.branch（和 duty find 同一個意思，但不依賴本機的 check_handoff 版本）。"""
    if fetch:
        # 只 fetch RULE_SOURCE 那一條（AA-C 11-12：fetch 全部 claude/* 要兩分多鐘，cc-local 很大，hook 會逾時）。
        # 先用本機已有的遠端參照找出 RULE_SOURCE，再抓那一條；換帳號、RULE_SOURCE 換分支時，接班第 1 步的全量 fetch 會帶進來。
        rs0 = rule_source(False)
        if rs0:
            try:
                subprocess.run(['git', '-C', ROOT, 'fetch', '-q', 'origin', f'+refs/heads/{rs0}:refs/remotes/origin/{rs0}'], capture_output=True, timeout=FETCH_TIMEOUT)
            except subprocess.TimeoutExpired:
                pass
        elif full:
            git('fetch', '-q', 'origin', '+refs/heads/claude/*:refs/remotes/origin/claude/*')
        try:
            open(STAMP, 'w').write(str(time.time()))
        except OSError:
            pass
    best = None
    for ref in git('for-each-ref', '--format=%(refname:short)', 'refs/remotes/origin/claude').stdout.split():
        r = git('show', f'{ref}:docs/handoff/duty.json')
        if r.returncode:
            continue
        try:
            d = json.loads(r.stdout)
        except ValueError:
            continue
        seq, br = d.get('seq') or 0, (d.get('ruleSource') or {}).get('branch')
        if br and (best is None or seq > best[0]):
            best = (seq, br)
    return best[1] if best else None


def diff_files(rs):
    out = []
    for p in PACK:
        r = git('diff', '--name-only', f'origin/{rs}', '--', p)
        out += [x for x in r.stdout.split('\n') if x]
        # 本機沒有、RULE_SOURCE 有的檔 git diff 也會列（當成刪除）；本機多出來的不管
    hk_rs = git('show', f'origin/{rs}:.claude/settings.json')
    try:
        want = json.loads(hk_rs.stdout).get('hooks') if not hk_rs.returncode else None
    except ValueError:
        want = None
    try:
        have = json.load(open(os.path.join(ROOT, '.claude', 'settings.json'))).get('hooks')
    except (OSError, ValueError):
        have = None
    if want is not None and want != have:
        out.append('.claude/settings.json（hooks）')
    return out


def main():
    mode = next((a for a in sys.argv[1:] if a in ('--check', '--apply', '--hook')), '--check')
    if mode == '--hook':
        try:
            old = time.time() - float(open(STAMP).read()) > 600
        except (OSError, ValueError):
            old = True
        try:
            rs = rule_source(old)
            cur = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.strip()
            if not rs or cur == rs:
                return 0
            df = diff_files(rs)
        except Exception:
            return 0
        if df:
            print(json.dumps({'hookSpecificOutput': {'hookEventName': 'UserPromptSubmit', 'additionalContext':
                f'（自動提醒 D157）你這條分支的規則包比 RULE_SOURCE（origin/{rs}）舊，{len(df)} 個檔不一樣（{"、".join(df[:6])}{"…" if len(df) > 6 else ""}）。'
                '工作階段啟動時載入的 CLAUDE.md 是舊的——先回使用者，然後這個回合就跑 python3 tools/handoff/rules_sync.py --apply、commit＋push，'
                f'再讀 git show origin/{rs}:CLAUDE.md 和自己職位頁裡新的條文（docs/AI_SESSION_HANDOFF.md 第 13 節最新幾個 HV）。'}}, ensure_ascii=False))
        return 0
    rs = rule_source(True, full=True)
    if not rs:
        print('找不到 RULE_SOURCE（遠端沒有任何 duty.json）——回報使用者')
        return 2
    cur = git('rev-parse', '--abbrev-ref', 'HEAD').stdout.strip()
    if cur == rs:
        print(f'這條分支就是 RULE_SOURCE（{rs}）')
        return 0
    df = diff_files(rs)
    if mode == '--check':
        if not df:
            print(f'規則包和 RULE_SOURCE origin/{rs} 一樣')
            return 0
        print(f'[異常] 規則包比 RULE_SOURCE origin/{rs} 舊，{len(df)} 個檔不一樣：')
        for x in df[:40]:
            print('  ' + x)
        print('→ python3 tools/handoff/rules_sync.py --apply，然後 commit＋push')
        return 1
    # --apply
    for p in PACK:
        if git('cat-file', '-e', f'origin/{rs}:{p}').returncode == 0:
            git('checkout', f'origin/{rs}', '--', p, check=True)
    hk = git('show', f'origin/{rs}:.claude/settings.json')
    if not hk.returncode:
        want = json.loads(hk.stdout)
        sp = os.path.join(ROOT, '.claude', 'settings.json')
        try:
            have = json.load(open(sp))
        except (OSError, ValueError):
            have = {}
        have['hooks'] = want.get('hooks', {})   # 只換 hooks，這條分支自己的其他設定留著
        os.makedirs(os.path.dirname(sp), exist_ok=True)
        json.dump(have, open(sp, 'w'), ensure_ascii=False, indent=2)
        open(sp, 'a').write('\n')
        git('add', '.claude/settings.json')
    print(f'規則包已換成 origin/{rs} 的版本（{len(df)} 個檔）。接著：git commit -m "規則包同步 RULE_SOURCE {rs}" 再 push；hook 要重開工作階段才生效（/hooks 只有終端機版 Claude Code 能用，網頁／App 版不能）。')
    return 0


if __name__ == '__main__':
    sys.exit(main())
