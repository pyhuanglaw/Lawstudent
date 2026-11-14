#!/usr/bin/env python3
"""接班一個指令、印一頁（D165／HANDOFF-RULE-GAPS-1114，使用者 2026-11-14：「你們所有人都還不能確定已經完成接班，結果已經用了10%的每週使用額度
這個接班規則到底有什麼問題？為什麼大家都很像不知道接下來要幹嘛」）。

起因：十四步、七八支檢查的輸出幾乎都是每一班原封不動的舊帳（check 三百項、duty verify 的舊帳號分支），真正要知道的「上一班交代我做什麼」
散在各職位交接檔、沒有一步把它印出來；四個職位聽到「現在接班」都只合併＋登記就開工。

用法（使用者說「現在接班」「我回來了…」就跑這一支；先 git fetch origin）：
  python3 tools/handoff/takeover.py --account B --role LAWWW2            印一頁（不改任何東西）
  python3 tools/handoff/takeover.py --account B --role LAWWW2 --apply    另外：規則包換成 RULE_SOURCE 的版本（rules_sync --apply）
印的一頁：
  1 規則來源、上一任是誰（duty.json）、有沒有正式交班
  2 上一任這個職位交接檔裡「下一班第一件事」的原文（照它做；每一條的做法、驗收標準在它寫的檔和任務的 note）＋「C｜正在做的」原文（做到一半的）
    ——使用者 2026-11-14：「接班最重要的就是你們要知道上一個帳號什麼東西做到一半，然後你們接下來要做什麼」
  3 使用者交代、歸這個職位、還沒做完的（userwork）
  4 你離開期間新增的規則（RULE_SOURCE 的 CLAUDE.md、自己的職位頁裡，你分支上那一版沒有的 D 編號，各一行）——只讀這幾條和自己的職位頁
  5 接下來：合併上一任的分支、duty register、回使用者「接班確認」（把第 2、3 節逐條寫接了沒）、照第 2 節第一條開工
不印的：check／duty verify／loose 的舊帳（值班 LAWWW 另外處理；其他職位不用逐項寫）。"""
import argparse, json, os, re, subprocess, sys

ROOT = subprocess.run(['git', 'rev-parse', '--show-toplevel'], capture_output=True, text=True).stdout.strip() or os.getcwd()
HERE = os.path.dirname(os.path.abspath(__file__))
FILES = {'LAWWW': 'docs/HANDOFF_GAP_MATRIX.md', 'LAWWW2': 'docs/art-rebuild/second_ai/HANDOFF.md', 'AA': 'docs/story_planning/AA_交接紀錄.md',
         'BB': 'docs/story_planning/BB_00_協作規範與交接紀錄.md', 'CC': 'docs/story_planning/CC/CC_00_交接紀錄.md'}
FIRST = re.compile(r'下一班第一件事|下一班第一步|下一班先做')


def git(*a):
    r = subprocess.run(['git', '-C', ROOT] + list(a), capture_output=True, text=True)
    return r.stdout if r.returncode == 0 else ''


def first_items(text, limit=28):
    """交接檔裡第一個「下一班第一件事」那一段：從那一行到下一個同級標題／分隔線，最多 limit 行"""
    L = text.split('\n')
    for i, l in enumerate(L):
        if not FIRST.search(l):
            continue
        out = [l.rstrip()[:400]]
        head = l.lstrip().startswith('#')
        for m in L[i + 1:]:
            s = m.strip()
            if len(out) >= limit or s.startswith('---') or (s.startswith('#') and head) or (s.startswith('**') and '｜' in s[:8] and not FIRST.search(s) and not head):
                break
            if s:
                out.append(m.rstrip()[:400])
        return out
    return []


DOING = re.compile(r'C｜正在做|C 正在做|正在做的|做到一半')


DONE = re.compile(r'A｜本班成果|A 本班成果|本班成果')


def doing_items(text, limit=10, pat=None):
    """交接檔最新一次交班的「C｜正在做的」（做到一半的東西）：第一個符合的那一行＋後面的條列"""
    L = text.split('\n')
    for i, l in enumerate(L):
        if not (pat or DOING).search(l) or FIRST.search(l):
            continue
        out = [l.strip()[:400]]
        for m in L[i + 1:]:
            s = m.strip()
            if len(out) >= limit or not s or s.startswith('#') or s.startswith('---') or (s.startswith('**') and '｜' in s[:8]) or (s.startswith('- **') and '｜' not in s[:6] and re.match(r'- \*\*[A-G] ', s)):
                break
            out.append(m.rstrip()[:400])
        return out
    return []


def big_changes(text, since):
    """docs/handoff/BIG_CHANGES.md 裡日期 > since（YYYY-MM-DD）的每一行（D166）"""
    out = []
    for l in text.split('\n'):
        m = re.match(r'- (\d{4}-\d{2}-\d{2})｜', l)
        if m and m.group(1) > since:
            out.append(l[:420])
    return out


def new_rules(old_texts, new_texts):
    """new 有、old 沒有的 D 編號，各取第一次出現的那一行（截短）"""
    have = set(re.findall(r'\bD(\d{2,3})\b', '\n'.join(old_texts)))
    best = {}
    for t in new_texts:
        for line in t.split('\n'):
            s = line.strip(); head = s.startswith('#') or s.startswith('>')   # 標題列只是索引：有內文的那一行優先
            for n in re.findall(r'\bD(\d{2,3})\b', line):
                if n in have or int(n) < 100:
                    continue
                if n not in best or (best[n][0] and not head):
                    best[n] = (head, re.sub(r'\s+', ' ', s)[:170])
    return sorted((int(n), v[1]) for n, v in best.items())


def page(account, role, src=None, show=git, userwork=None, since=None):
    """回傳 (lines, info)。src＝RULE_SOURCE 的 duty.json（dict）；show(ref:path)→文字；測試可以換掉"""
    out = []
    rs = (src.get('ruleSource') or {}).get('branch') or ''
    r = (src.get('roles') or {}).get(role) or {}
    prev_acc, prev_br, state = r.get('account'), r.get('branch'), r.get('state')
    out.append(f'【接班一頁｜{role}（帳號 {account}）】')
    out.append(f'1. 規則來源：origin/{rs}（seq {src.get("seq")}）｜上一任：帳號 {prev_acc}、分支 {prev_br}、狀態 {state}'
               + ('' if state == 'handed-off' or prev_acc == account else '　⚠ 上一任沒有正式交班：停下來問使用者，使用者明說要你接才加 --user-ok'))
    text = show('show', f'origin/{prev_br}:{FILES[role]}') if prev_br else ''
    items = first_items(text)
    out.append(f'2. 上一任交代的「下一班第一件事」（原文；origin/{prev_br}:{FILES[role]}）——照這個順序做，接班確認裡逐條寫接了沒：')
    out += ['   ' + l for l in items] or ['   ⚠ 交接檔裡找不到「下一班第一件事」：讀那份交接檔的「B｜全部未完成」，並告訴值班 LAWWW']
    dg = doing_items(text)
    out.append('   上一任做到一半的（交接檔「C｜正在做的」原文；先確認這些有沒有保存、要不要接著做）：')
    out += ['   ' + l for l in dg] or ['   ⚠ 交接檔沒有「正在做的」一段：看上一任最後幾個 commit（git log -5 origin/' + str(prev_br) + '），並告訴值班 LAWWW']
    dn = doing_items(text, 14, DONE)
    n = (git('rev-list', '--count', f'HEAD..origin/{prev_br}') or '?').strip() if prev_br and show is git else '?'
    out.append(f'   上一任這一班改了什麼（交接檔「A｜本班成果」原文；你的分支落後它 {n} 個 commit）——刪掉、改掉、取代的大改動要在這裡寫得出來；'
               '對使用者說「沒有、還沒做、還在」以前先看這一段和 docs/RELEASES.md：')
    out += ['   ' + l for l in dn] or [f'   ⚠ 交接檔沒有「本班成果」一段：看 git log --stat HEAD..origin/{prev_br} 和 docs/RELEASES.md，並告訴值班 LAWWW']
    since = since or (git('log', '-1', '--format=%cs', 'HEAD').strip() if show is git else '') or '0000-00-00'
    bc = big_changes(show('show', f'origin/{rs}:docs/handoff/BIG_CHANGES.md'), since)
    out.append(f'   遊戲的大改動（docs/handoff/BIG_CHANGES.md；你上次工作 {since} 以後新增 {len(bc)} 件——隔了好幾班也都在這裡；每一件都讀，'
               '「不要再做什麼」照做；整份看 git show origin/' + rs + ':docs/handoff/BIG_CHANGES.md）：')
    out += ['   ' + l for l in bc] or ['   （沒有新增的）']
    uw = userwork(role) if userwork else []
    out.append(f'3. 使用者交代、歸 {role}、還沒做完的（userwork；{len(uw)} 項，排在接別人的交付之前）：')
    out += ['   ' + l[:200] for l in uw[:20]] or ['   （沒有）']
    old = [show('show', 'HEAD:CLAUDE.md'), show('show', f'HEAD:docs/rules/ROLE_{role}.md')]
    new = [show('show', f'origin/{rs}:CLAUDE.md'), show('show', f'origin/{rs}:docs/rules/ROLE_{role}.md')]
    nr = new_rules(old, new)
    out.append(f'4. 你離開期間新增的規則（{len(nr)} 條；只要讀這幾條＋docs/rules/ROLE_{role}.md 做事要用的章節）：')
    out += [f'   D{n}：{line}' for n, line in nr] or ['   （沒有新的）']
    out.append('5. 接下來：①合併上一任的分支（不 rebase、不 force push）②python3 tools/handoff/check_handoff.py duty register --account '
               f'{account} --role {role} --session <自己的 session> --branch <自己的分支>' + ('' if role == 'LAWWW' else f' --ref origin/{rs}')
               + ' → commit＋push ③回使用者「接班確認」：第 2、3 節逐條一行 ④通知值班 LAWWW（LAWWW 跑 duty sync）⑤照第 2 節第一條開工。'
               + ('' if role != 'LAWWW' else '舊帳（check、duty verify、roles、loose）值班 LAWWW 分批清，不擋開工。'))
    return out, {'prev': prev_acc, 'branch': prev_br, 'items': len(items), 'rules': [n for n, _ in nr]}


def run_userwork(role):
    r = subprocess.run([sys.executable, os.path.join(HERE, 'check_handoff.py'), 'userwork', '--owner', role], capture_output=True, text=True, cwd=ROOT)
    return [l.strip() for l in r.stdout.split('\n') if l.strip().startswith('- ') and '這一班動過' not in l]


def main(argv=None):
    ap = argparse.ArgumentParser(description='接班一個指令、印一頁（D165）')
    ap.add_argument('--account', required=True, choices=list('ABCD')); ap.add_argument('--role', required=True, choices=list(FILES))
    ap.add_argument('--since', help='大改動從哪一天以後開始列（YYYY-MM-DD；預設＝自己分支最後一個 commit 的日期）')
    ap.add_argument('--apply', action='store_true', help='印完以後把規則包換成 RULE_SOURCE 的版本')
    a = ap.parse_args(argv)
    f = subprocess.run([sys.executable, os.path.join(HERE, 'check_handoff.py'), 'duty', 'find'], capture_output=True, text=True, cwd=ROOT)
    m = re.search(r'RULE_SOURCE：(\S+?)（', f.stdout)
    if f.returncode or not m:
        print(f.stdout[-600:] + '\n找不到唯一的 RULE_SOURCE：停下來回報使用者，不自己挑。'); return 1
    src = json.loads(git('show', f'origin/{m.group(1)}:docs/handoff/duty.json') or '{}')
    lines, _ = page(a.account, a.role, src, userwork=run_userwork, since=a.since)   # 先印（第 4 節要比換規則以前的版本）
    print('\n'.join(lines))
    if a.apply:
        r = subprocess.run([sys.executable, os.path.join(HERE, 'rules_sync.py'), '--apply'], capture_output=True, text=True, cwd=ROOT)
        print('—— 規則包：' + (r.stdout.strip().split('\n')[-1][:200] if r.stdout.strip() else r.stderr.strip()[:200]))
    return 0


if __name__ == '__main__':
    sys.exit(main())
