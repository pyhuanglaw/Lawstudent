#!/usr/bin/env python3
"""歷史待辦全面複核（HISTORY-AUDIT-1031，使用者 10-31 19:5x）——每次從 GitHub 現況重算，不是一次性的表。

用法：
  python3 tools/handoff/history_audit.py            # 重算，寫 docs/handoff/history_audit/ledger.json、REPORT.md
  python3 tools/handoff/history_audit.py --print    # 只印摘要，不寫檔
  python3 tools/handoff/history_audit.py --id X     # 印一項的完整證據
  python3 tools/handoff/history_audit.py --bb-batches  # 重產 BB 補驗批次表 bb_batches.md（總表裡所有「已整合待測試」，照 BB 10-27 十二段流程分組）

讀：docs/handoff/audit_1021/out_*.jsonl（10/21 稽核原始結果）、tasks.json、deliveries.json、
    origin/main 與目前 HEAD 的 src/、tests/（找得到哪些事件 ID、函式、檔案）、
    BB 三個分支的 BB_218_瀏覽器實測紀錄.md（實際操作的證據）、
    四個職位的 judgments_<職位>.jsonl（人工判定，以 at 最新那一行為準）。
七類（README.md）：1 正式版已驗收、2 已實作未驗收、3 已驗收未發布、4 部分、5 未開工、6 等素材或決定、7 確認取消。
自動判定只是起點：沒有人工判定的，ledger 裡 auto=true，報告分開列。
"""
import json, os, re, subprocess, sys, collections

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
OUT = os.path.join(ROOT, 'docs', 'handoff', 'history_audit')
AUDIT = os.path.join(ROOT, 'docs', 'handoff', 'audit_1021')
MAIN = 'origin/main'
BB_BRANCHES = ['origin/claude/elegant-brown-fcos7n', 'origin/claude/wonderful-mayer-7fm9g6', 'origin/claude/story-planning']
BB_FILES = ['docs/story_planning/BB_218_瀏覽器實測紀錄.md']
ROLE_BRANCH = {'LAWWW': None, 'AA': 'origin/claude/cool-heisenberg-o8kuqx', 'BB': 'origin/claude/elegant-brown-fcos7n', 'LAWWW2': 'origin/claude/funny-albattani-iawshm'}
TIER_NAME = {1: '正式版已完成且實際驗收', 2: '已實作但尚未實際驗收', 3: '已驗收但尚未發布', 4: '部分完成', 5: '完全未開工', 6: '等待素材或使用者決定', 7: '經確認取消或被取代'}
PASS_RE = re.compile(r'PASS|通過|✅|ＯＫ|\bOK\b|正常|沒問題|看到了|有出現|GO\b')
FAIL_RE = re.compile(r'FAIL|NO-GO|沒出現|不見|卡住|錯誤|bug|BUG')


def git(*a, check=True):
    r = subprocess.run(['git', '-C', ROOT, '-c', 'core.quotepath=false'] + list(a), capture_output=True)
    if check and r.returncode:
        return None
    return r.stdout.decode('utf-8', 'replace')


def ref_ok(ref):
    return subprocess.run(['git', '-C', ROOT, 'rev-parse', '--verify', '-q', ref + '^{commit}'], capture_output=True).returncode == 0


def load_tree_text(ref, prefixes=('src/', 'tests/', 'index.html', 'tools/')):
    """一次讀出 ref 底下的 src、tests 全部文字（cat-file --batch）：回傳 (路徑集合, 大字串)。"""
    names = git('ls-tree', '-r', '--name-only', ref) or ''
    paths = [p for p in names.splitlines() if p.startswith(prefixes) and p.endswith(('.js', '.py', '.html', '.json'))]
    src_paths = [p for p in paths if p.startswith(('src/', 'index.html'))]
    proc = subprocess.run(['git', '-C', ROOT, 'cat-file', '--batch'], input=''.join(f'{ref}:{p}\n' for p in src_paths).encode(), capture_output=True)
    blob = proc.stdout.decode('utf-8', 'replace')
    return set(names.splitlines()), blob


def jl(path):
    out = []
    if not os.path.exists(path):
        return out
    for line in open(path, encoding='utf-8'):
        line = line.strip()
        if line:
            try:
                out.append(json.loads(line))
            except Exception:
                pass
    return out


def jl_ref(ref, path):
    t = git('show', f'{ref}:{path}')
    out = []
    for line in (t or '').splitlines():
        line = line.strip()
        if line:
            try:
                out.append(json.loads(line))
            except Exception:
                pass
    return out


EV_RE = re.compile(r'\bev_[a-z0-9_]+')
PATH_RE = re.compile(r'\b(?:src|tests|assets|tools)/[\w/\-.一-鿿]+\.(?:js|py|glb|webp|png|json|vrm)')
CAMEL_RE = re.compile(r'\b(?:[A-Z]{1,6}\.)?[a-z][a-z0-9]+[A-Z][A-Za-z0-9]{2,}\b')
SHA_RE = re.compile(r'\b[0-9a-f]{7,40}\b')
NOISE = {'innerHTML', 'localStorage', 'getElementById', 'addEventListener', 'querySelector', 'setTimeout', 'toFixed', 'forEach', 'indexOf', 'toString', 'readFileSync', 'padStart', 'requestAnimationFrame', 'userData', 'matrixWorld', 'updateWorldMatrix'}


def tokens(text):
    evs = set(EV_RE.findall(text))
    paths = set(p.rstrip('.') for p in PATH_RE.findall(text))
    camel = set(c.split('.')[-1] for c in CAMEL_RE.findall(text)) - NOISE
    shas = set(s for s in SHA_RE.findall(text) if re.search(r'[a-f]', s) and re.search(r'\d', s))
    return evs, paths, camel, shas


class Repo:
    def __init__(self):
        self.head_paths, self.head_src = load_tree_text('HEAD')
        self.main_paths, self.main_src = load_tree_text(MAIN)
        self.main_commits = set((git('rev-list', MAIN) or '').split())
        self.head_commits = set((git('rev-list', 'HEAD') or '').split())
        self._sha = {}
        self.bb = []   # (label, lines, 每一行所在那一節的標題)
        seen_files = set()
        for b in BB_BRANCHES:
            if not ref_ok(b):
                continue
            names = (git('ls-tree', '-r', '--name-only', b) or '').splitlines()
            files = list(BB_FILES) + [n for n in names if n.startswith('docs/story_planning/test_shots/') and n.endswith('.log')]
            for f in files:
                t = git('show', f'{b}:{f}')
                if not t:
                    continue
                key = (f, len(t))
                if f != BB_FILES[0] and key in seen_files:
                    continue
                seen_files.add(key)
                lines = t.splitlines(); heads = []; h = ''
                for ln in lines:
                    if ln.startswith('#'):
                        h = ln
                    heads.append(h)
                self.bb.append((b.replace('origin/claude/', '') + ':' + f.replace('docs/story_planning/', ''), lines, heads))
        # BB_218 三個分支內容重疊：同一個 sig 只算一次（bb_hits 用 seen 去重）；最大的先看
        self.bb.sort(key=lambda x: -len(x[1]))
        # BB-C 10-27「已整合待測試」885 項盤點（BB_INTEGRATED_TRIAGE_1027＋triage1027/*.tsv）：A＝BB_218 有合併後的 PASS、B＝跑某一段流程可以涵蓋、C＝要單獨測、D＝不是 BB 能驗的
        self.triage, self.triage_partial = {}, set()
        for b in BB_BRANCHES:
            if not ref_ok(b):
                continue
            names = (git('ls-tree', '-r', '--name-only', b) or '').splitlines()
            tsvs = [n for n in names if n.startswith('docs/story_planning/qa/triage1027/') and n.endswith('.tsv')]
            if not tsvs:
                continue
            for n in tsvs:
                for ln in (git('show', f'{b}:{n}') or '').splitlines():
                    c = ln.split('\t')
                    if len(c) >= 2 and c[0] and c[0] not in self.triage:
                        self.triage[c[0]] = {'cat': c[1], 'flow': c[2] if len(c) > 2 else '', 'basis': c[3] if len(c) > 3 else '', 'src': b.replace('origin/claude/', '') + ':' + n.replace('docs/story_planning/', '')}
            md = git('show', f'{b}:docs/story_planning/qa/BB_INTEGRATED_TRIAGE_1027.md') or ''
            for ln in md.splitlines():
                if 'A-部分' in ln:
                    self.triage_partial |= set(re.findall(r'\b[A-Z][A-Z0-9]*(?:-[A-Z0-9]+)+\b', ln))
            break

    def sha_in(self, s, commits):
        k = (s, id(commits))
        if k not in self._sha:
            self._sha[k] = any(c.startswith(s) for c in commits) if len(s) < 40 else s in commits
        return self._sha[k]

    def presence(self, text):
        """回傳 {'head':[…], 'main':[…], 'missing_head':[…]}：程式找得到的識別字。"""
        evs, paths, camel, shas = tokens(text)
        idents = [('ev', e) for e in evs] + [('fn', c) for c in camel]
        head, main, miss = [], [], []
        for kind, t in idents:
            ih = t in self.head_src
            im = t in self.main_src
            if ih:
                head.append(t)
                if im:
                    main.append(t)
            elif kind == 'ev':
                miss.append(t)
        for p in paths:
            if p.startswith(('src/', 'tests/', 'assets/', 'tools/')):
                if p in self.head_paths:
                    head.append(p)
                    if p in self.main_paths:
                        main.append(p)
                else:
                    miss.append(p)
        sh_head = [s for s in shas if self.sha_in(s, self.head_commits)]
        sh_main = [s for s in sh_head if self.sha_in(s, self.main_commits)]
        return {'head': sorted(set(head)), 'main': sorted(set(main)), 'missing_head': sorted(set(miss)), 'sha_head': sorted(sh_head), 'sha_main': sorted(sh_main)}

    def bb_hits(self, keys, limit=4):
        """BB 實測紀錄裡提到 keys（任務 ID、事件 ID、企劃子項編號）的地方。
        pass＝同一行或所在那一節的標題寫 PASS／FIXED／通過／GO（同一行有 FAIL 要在 PASS 前面＝修改前 FAIL、修改後 PASS）；
        not_tested＝同一行寫 NOT TESTED／沒測；fail＝同一行 FAIL；其他＝mention（只是提到，不算驗收）。"""
        hits = []
        seen = set()
        keys = [k for k in keys if k and len(k) >= 5]
        if not keys:
            return hits
        pat = re.compile('(?<![A-Za-z0-9_-])(?:' + '|'.join(re.escape(k) for k in sorted(keys, key=len, reverse=True)) + ')(?![A-Za-z0-9_])')
        for label, lines, heads in self.bb:
            for i, line in enumerate(lines):
                m = pat.search(line)
                if not m:
                    continue
                kind = classify_line(line, heads[i])
                sig = (m.group(0), line.strip()[:80])
                if sig in seen:
                    continue
                seen.add(sig)
                hits.append({'at': f'{label}:{i + 1}', 'key': m.group(0), 'kind': kind, 'line': line.strip()[:160]})
        hits.sort(key=lambda h: {'pass': 0, 'fail': 1, 'not_tested': 2, 'mention': 3}[h['kind']])
        return hits[:limit] if limit else hits


READ_RE = re.compile(r'讀碼|台詞對照|文字層對照|單元測試|node tests|Node ')
NT_RE = re.compile(r'NOT TESTED|沒測|未測|還沒測|NOT_TESTED|待測')
PASS_LINE = re.compile(r'PASS|FIXED|通過|＝GO|：GO|\*\*GO\*\*|可以發布')
FAIL_LINE = re.compile(r'FAIL|NO-GO|NOT FIXED')


def classify_line(line, head):
    if NT_RE.search(line):
        return 'not_tested'
    if READ_RE.search(line) and not re.search(r'瀏覽器|probe|qa_play|flow_', line):
        return 'mention'   # 讀碼、台詞對照、node 單元＝不是實際操作
    mp, mf = PASS_LINE.search(line), FAIL_LINE.search(line)
    if mp and (not mf or line.rfind('PASS') > line.rfind('FAIL')):
        return 'pass'
    if mf:
        return 'fail'
    return 'mention'   # 只認同一行：所在那一節的標題寫 PASS 不算（10-31 抽查兩項誤判：標題的 PASS 是讀碼對台詞、或別的情境）


def load_judgments():
    J = collections.defaultdict(list)
    for role, br in ROLE_BRANCH.items():
        fn = f'docs/handoff/history_audit/judgments_{role}.jsonl'
        rows = jl(os.path.join(ROOT, fn))
        if br and ref_ok(br):
            rows += jl_ref(br, fn)
        for r in rows:
            if r.get('id'):
                r.setdefault('by', role)
                J[r['id']].append(r)
    for k in J:
        J[k].sort(key=lambda r: r.get('at', ''))
    return J


def task_tier(t, audit_verdict):
    """總表的狀態 → 起始的 tier（還要再看 main、BB）。"""
    st = t.get('status', '')
    if st == '取消／被取代':
        auth = (t.get('authorizedBy') or '') + (t.get('reason') or '')
        return 7 if re.search(r'使用者|D\d{2,3}|UA-|user', auth) else 4, ('取消依據：' + auth[:120]) if auth else '取消但沒寫使用者依據'
    if st in ('等待其他AI／素材',):
        return 6, '總表：等待其他AI／素材'
    if st == '暫停':
        why = (t.get('pausedReason') or t.get('next') or '')[:160]
        return (6 if re.search(r'使用者|素材|圖|ART_APPROVED', why) else 5), '暫停：' + why
    if st == '待開工':
        return (4 if audit_verdict == 'partial' else 5), '總表：待開工'
    if st == '進行中':
        return 4, '總表：進行中'
    if st in ('已實作待整合',):
        return 2, '總表：已實作待整合（還沒進開發分支或還沒查證）'
    if st in ('已整合待測試', '已驗收'):
        return 2, '總表：' + st
    return 5, '總表狀態不明：' + st


def judge(rec, T, D_by_task, repo):
    rid = rec['id']
    t = T.get(rid)
    texts = [rec.get('evidence', ''), rec.get('next', ''), rec.get('note', '')]
    if t:
        texts += [t.get('title', ''), t.get('next', ''), t.get('evidence', '') or '']
    dls = D_by_task.get(rid, [])
    texts += [d.get('what', '') + ' ' + d.get('note', '') for d in dls]
    blob = '\n'.join(texts)
    pres = repo.presence(blob)
    codes = set(re.findall(r'(?<![A-Za-z0-9])(?:\d[A-Z]-\d{2}|\d-Y\d-\d{1,2}|[A-Z]{2,}\d{2,}-[A-Z0-9-]+)(?![A-Za-z0-9])', (t or {}).get('title', '') + ' ' + rec.get('evidence', '')))
    keys = [rid] + [x for x in pres['head'] if x.startswith('ev_')] + [d['id'] for d in dls] + sorted(codes)
    hits = repo.bb_hits(keys)
    tri = repo.triage.get(rid)
    if tri and tri['cat'] == 'A':
        hits.insert(0, {'at': tri['src'], 'key': rid, 'kind': 'pass', 'line': 'BB 10-27 盤點 A：' + tri['basis'][:120]})
    tev = (t or {}).get('evidence') or ''
    if t and t.get('status') == '已驗收' and re.search(r'L\d{2,5}', tev) and re.search(r'PASS|FIXED', tev) and re.search(r'BB', tev):
        hits.insert(0, {'at': 'tasks.json evidence', 'key': rid, 'kind': 'pass', 'line': tev[:120]})
    bbpass = [h for h in hits if h['kind'] == 'pass']
    bbfail = [h for h in hits if h['kind'] == 'fail']
    ev_head = [x for x in pres['head'] if x.startswith('ev_') or '/' in x or not x.startswith('ev_')]
    if pres['head']:
        main = 'yes' if len(pres['main']) == len(pres['head']) else ('partial' if pres['main'] else 'no')
    elif pres['sha_head']:
        main = 'yes' if len(pres['sha_main']) == len(pres['sha_head']) else ('partial' if pres['sha_main'] else 'no')
    else:
        main = 'unknown'
    status = t.get('status') if t else None
    reasons = []
    if t:
        tier, why = task_tier(t, rec.get('verdict'))
        reasons.append(why)
    else:
        tier = {'done': 2, 'partial': 4, 'not_done': 5, 'obsolete': 7, 'needs_aa': 6, 'needs_user': 6, 'needs_art': 6}.get(rec.get('verdict'), 5)
        reasons.append('總表沒有這個 ID，照 10/21 判定')
    if tier == 2:
        if bbpass and main == 'yes':
            tier = 1
            reasons.append('main 有、BB 實測紀錄有 PASS')
        elif bbpass:
            tier = 3
            reasons.append('BB 實測紀錄有 PASS、main ' + main)
        else:
            reasons.append('沒有找到 BB 實際操作紀錄' + ('（有 FAIL 字樣，要看）' if bbfail else ''))
    if rid in repo.triage_partial and tier in (1, 3):
        tier = 4
        reasons.append('BB 10-27 盤點改成「A-部分」：已演的部分 PASS、剩下的沒跑完')
    if tri and tier == 2:
        reasons.append({'B': 'BB 盤點 B：跑流程 ' + tri['flow'] + ' 可以涵蓋', 'C': 'BB 盤點 C：要單獨測', 'D': 'BB 盤點 D（不是 BB 能驗）：' + tri['basis'][:80]}.get(tri['cat'], ''))
    gap = (not pres['head'] and not pres['sha_head']) and tier in (1, 2, 3)
    if pres['missing_head'] and not pres['head']:
        gap = True
        reasons.append('10/21 的證據在目前開發分支找不到：' + '、'.join(pres['missing_head'][:4]))
    return {
        'id': rid, 'src': rec['_src'], 'audit_verdict': rec.get('verdict'), 'audit_severity': rec.get('severity'),
        'title': (t or {}).get('title', rec.get('note', ''))[:160], 'task_status': status, 'owner': (t or {}).get('owner', rec.get('owner')),
        'priority': (t or {}).get('priority', rec.get('severity')),
        'tier': tier, 'auto': True, 'main': main, 'head_ids': pres['head'][:8], 'main_ids': pres['main'][:8], 'missing_ids': pres['missing_head'][:6],
        'bb': [h['at'] + '（' + h['kind'] + '）' for h in hits], 'bb_pass': len(bbpass), 'evidence_gap': gap, 'why': '；'.join(reasons),
        'bb_triage': (tri['cat'] + (tri['flow'] or '')) if tri else None,
        'audit_evidence': rec.get('evidence', '')[:300], 'audit_next': rec.get('next', '')[:300],
    }


FLOW_ORDER = ['②', '②＋大一上', '③', '④', '①', '⑩Y1S1', '⑩Y1S2', '⑩Y2S1', '⑩Y2S2', '⑩Y3S1', '⑩Y3S2', '⑩Y4S1', '⑩Y4S2', '⑧', '⑦', '⑨', '⑪', '⑫', '⑤', '⑥']
FLOW_NAME = {'①': '新遊戲「從法律系開始」→ 宿營 → 8/29 搬宿舍 → 主線第 1、2 天 → 大一上第 1～3 週', '②': '新遊戲「從經濟系前傳開始」一路玩到 8/29 搬進法律系', '②＋大一上': '② 的存檔接著玩法律系大一上第 1～7 週（經濟系回聲）',
             '③': '寒暑假（大一～大四每個寒暑假，含除夕、成績單、假期活動、搬房間）', '④': '美國交換整學期（交往中／挽回中／單身）', '⑤': '日本路線整學期', '⑥': '畢業以後（大五延畢／國考／PG／尾聲）',
             '⑦': '某位女主角戀愛線：認識 → 熟悉 → 約會 → 告白 → 交往後', '⑧': '一個學期的上課＋期中期末考', '⑨': '約會地點逐處（D01～D32）', '⑪': '街區與店家巡迴', '⑫': '場景與座位巡檢（四方向鏡頭、座位、樓梯、晝夜、直向）'}
TERM_FLOW = {'Y0S1': '②', 'Y0S2': '②', 'Y1S1': '⑩Y1S1', 'Y1S2': '⑩Y1S2', 'Y2S1': '⑩Y2S1', 'Y2S2': '⑩Y2S2', 'Y3S1': '⑩Y3S1', 'Y3S2': '⑩Y3S2', 'Y4S1': '⑩Y4S1', 'Y4S2': '⑩Y4S2'}


def bb_batches(repo, T):
    """總表所有「已整合待測試」照 BB 10-27 盤點的流程分組；10-27 以後才有的照 first.term 歸到那學期的巡迴（D99：經濟系 → 寒暑假 → 美國先）。"""
    groups = collections.defaultdict(list)
    for t in T.values():
        if t.get('status') != '已整合待測試':
            continue
        tri = repo.triage.get(t['id'])
        if tri and tri['cat'] == 'B' and tri['flow']:
            g = tri['flow']
        elif tri and tri['cat'] == 'C':
            g = 'C'
        elif tri and tri['cat'] == 'D':
            g = 'D'
        else:
            title = t.get('title', '') + ' ' + t.get('next', '')[:200]
            term = (t.get('first') or {}).get('term', '')
            if re.search(r'寒暑假|寒假|暑假|除夕|過年|VAC', t['id'] + title):
                g = '③'
            elif re.search(r'美國|US-|\bUS\b', t['id'] + title):
                g = '④'
            elif t.get('owner') == 'LAWWW2' or t['id'].startswith(('ART-', 'CAM-', 'PERF-', 'LM-', 'NAV-')):
                g = '⑫'
            else:
                g = TERM_FLOW.get(term, '新（沒有學期）')
            g = '新：' + g
        groups[g].append(t)
    order = []
    for f in FLOW_ORDER:
        order += [f, '新：' + f]
    order += ['C', '新：新（沒有學期）', 'D']
    out = ['# BB 補驗批次表（工具產生：`python3 tools/handoff/history_audit.py --bb-batches`，不要手改）', '',
           '- 來源：總表 `tasks.json` 裡所有「已整合待測試」。分組沿用 BB-C 10-27 的 `BB_INTEGRATED_TRIAGE_1027`（十二段流程）；10-27 以後才整合的標「新：」，照任務的學期、主題歸組。',
           '- 順序照 D99（經濟系 → 寒暑假 → 美國）再照玩家遇到的時間（D81）。一段流程玩一次，涵蓋那一組全部；組裡個別項目沒演到的，在 judgments_BB.jsonl 寫 tier 2＋原因。',
           '- 每批結果：BB 分支 `docs/handoff/history_audit/judgments_BB.jsonl`（一行一項；bb 欄寫 BB_218 行號＋截圖）。玩過 PASS → LAWWW 改總表「已驗收」。',
           '- C＝條件特殊要單獨測；D＝不是 BB 能驗（場景美術給使用者看、文件、工具、已退場）——D 由 LAWWW 另外處理，不排給 BB。', '']
    total = 0
    for g in order:
        rows = groups.get(g)
        if not rows:
            continue
        total += len(rows)
        base = g.replace('新：', '')
        name = ('學期劇情巡迴：讀檔到該學期第 1 週（主要人物朋友以上、群組都在、可昕交往中），每週照作息到 Café、總圖、麵店、法律系館、溫州街走一圈，手機要回的都回' if base.startswith('⑩') else '') or FLOW_NAME.get(base, {'C': '要單獨測（條件特殊）', 'D': '不是 BB 能驗的', '新（沒有學期）': '沒有學期資料的新項目'}.get(base, ''))
        pri = collections.Counter(r.get('priority') for r in rows)
        out += ['', f'## {g}　{name}（{len(rows)} 項；' + '、'.join(f'{k} {pri[k]}' for k in ('P0', 'P1', 'P2', 'P3') if pri[k]) + '）', '']
        for r in sorted(rows, key=lambda r: (r.get('priority') or 'P9', r['id'])):
            out.append(f"- `{r['id']}`（{r.get('priority') or '—'}、{r.get('owner')}）{r.get('title', '')[:90]}")
    out.insert(6, f'- 合計 {total} 項。')
    return '\n'.join(out) + '\n'


def main():
    args = sys.argv[1:]
    repo = Repo()
    T = {t['id']: t for t in json.load(open(os.path.join(ROOT, 'docs/handoff/tasks.json'), encoding='utf-8'))['tasks']}
    DL = json.load(open(os.path.join(ROOT, 'docs/handoff/deliveries.json'), encoding='utf-8'))['deliveries']
    D_by_task = collections.defaultdict(list)
    for d in DL:
        if d.get('task'):
            D_by_task[d['task']].append(d)
    recs = []
    for f, src in [('out_B1', 'audit_B'), ('out_B2', 'audit_B')]:
        for r in jl(os.path.join(AUDIT, f + '.jsonl')):
            r['_src'] = src
            recs.append(r)
    if '--bb-batches' in args:
        open(os.path.join(OUT, 'bb_batches.md'), 'w', encoding='utf-8').write(bb_batches(repo, T))
        print('寫了 bb_batches.md')
        return
    J = load_judgments()
    ledger = []
    for r in recs:
        row = judge(r, T, D_by_task, repo)
        if r['id'] in J:
            j = J[r['id']][-1]
            stale_no = j.get('tier') == 3 and j.get('main') == 'no'   # 「已驗收、還沒發布」的 main 是判定當時的狀態；發布以後改用工具現查的（v9.10.15 後 AA_542～548 一直停在 no）
            row.update({k: j[k] for k in ('tier', 'evidence', 'main', 'missing', 'basis', 'covered', 'need', 'task', 'owner', 'severity', 'next', 'evidence_gap') if k in j and not (k == 'main' and (j[k] in ('unknown', '', None) or stale_no))})
            if row.get('tier') == 3 and row.get('main') == 'yes':
                row['tier'] = 1   # 判定的人寫「已驗收、main 不知道」：工具查得到程式都在 main＝正式版已驗收（BB-B 11-01 第 1 批）
            row['auto'] = False
            row['judged_by'] = j.get('by')
            row['judged_at'] = j.get('at')
            row['judgment_history'] = len(J[r['id']])
        ledger.append(row)
    seen = {r['id'] for r in ledger}
    for k, rows in J.items():   # 各職位查到、10/21 稽核 B 段沒有的 ID（企劃、交付、美術資產、使用者需求）：照最新一行列進來
        if k in seen:
            continue
        j = rows[-1]
        t = j.get('tier')
        mn = j.get('main', 'unknown')
        if mn in ('unknown', '', None) or (t == 3 and mn == 'no'):   # 判定沒寫 main，或寫「已驗收、還沒發布」時的 no（發布後要重查）：用任務的標題、進度、證據裡的事件／檔案／函式查（同 audit_B 的做法）
            tk = T.get(k) or T.get(j.get('task') or '') or {}
            pres = repo.presence('\n'.join([tk.get('title', ''), tk.get('next', '')[:2000], tk.get('evidence', '') or '', str(j.get('evidence', ''))]))
            if pres['head']:
                mn = 'yes' if len(pres['main']) == len(pres['head']) else ('partial' if pres['main'] else 'no')
            elif pres['sha_head']:
                mn = 'yes' if len(pres['sha_main']) == len(pres['sha_head']) else ('partial' if pres['sha_main'] else 'no')
        if t == 3 and mn in ('unknown', '', None) and j.get('bb') and j.get('bb') != 'none':
            # BB 寫的是實玩紀錄（截圖、say.json），沒有程式識別字：看實玩用的版本（bb 欄的 commit）是不是都已經在 main
            shas = [x for x in tokens(str(j['bb']))[3] if repo.sha_in(x, repo.head_commits)]
            if shas and all(repo.sha_in(x, repo.main_commits) for x in shas):
                mn = 'yes'
        if t == 3 and mn == 'yes':
            t = 1
        ledger.append({'id': k, 'src': j.get('src', 'other'), 'audit_verdict': None, 'audit_severity': None, 'title': (T.get(k) or {}).get('title', j.get('note', '') or j.get('evidence', ''))[:160],
                       'task_status': (T.get(j.get('task')) or {}).get('status') if j.get('task') else None, 'owner': j.get('owner'), 'priority': j.get('severity'),
                       'tier': t if isinstance(t, int) else 5, 'auto': False, 'main': mn, 'bb': [j['bb']] if j.get('bb') and j.get('bb') != 'none' else [],
                       'bb_pass': 0, 'evidence_gap': bool(j.get('evidence_gap')), 'why': j.get('missing') or j.get('need') or j.get('basis') or j.get('next', ''), 'evidence': j.get('evidence', ''),
                       'task': j.get('task'), 'next': j.get('next'), 'judged_by': j.get('by'), 'judged_at': j.get('at'), 'judgment_history': len(rows)})
    if '--id' in args:
        k = args[args.index('--id') + 1]
        for row in ledger:
            if row['id'] == k:
                print(json.dumps(row, ensure_ascii=False, indent=1))
        return
    summary = summarize(ledger)
    print(summary['text'])
    if '--print' in args:
        return
    os.makedirs(OUT, exist_ok=True)
    meta = {'generated_by': 'tools/handoff/history_audit.py', 'head': (git('rev-parse', 'HEAD') or '').strip(), 'main': (git('rev-parse', MAIN) or '').strip(),
            'bb_records': [l for l, _, _ in repo.bb if 'BB_218' in l] + ['BB 分支 test_shots/*.log %d 個' % sum(1 for l, _, _ in repo.bb if l.endswith('.log'))], 'note': '工具產生，不要手改；人工判定寫 judgments_<職位>.jsonl'}
    json.dump({'meta': meta, 'rows': ledger}, open(os.path.join(OUT, 'ledger.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    open(os.path.join(OUT, 'REPORT.md'), 'w', encoding='utf-8').write(report(ledger, meta, summary))


def summarize(ledger):
    other = [r for r in ledger if r['src'] != 'audit_B']
    ledger = [r for r in ledger if r['src'] == 'audit_B']
    by = collections.Counter(r['tier'] for r in ledger)
    done = [r for r in ledger if r['audit_verdict'] == 'done']
    bd = collections.Counter(r['tier'] for r in done)
    lines = ['10/21 稽核 B 段 %d 項（重算）：' % len(ledger) + '、'.join(f'{k} {TIER_NAME[k]} {by[k]}' for k in sorted(by)),
             '其中原本 done 的 %d 項：' % len(done) + '、'.join(f'tier {k} {bd[k]}' for k in sorted(bd)),
             '原本 done、證據在開發分支找不到（要人工查）：%d' % sum(1 for r in done if r['evidence_gap']),
             '原本 done、main 狀態：' + str(dict(collections.Counter(r['main'] for r in done)))]
    if other:
        bo = collections.Counter(r['tier'] for r in other)
        lines.append('各職位另外查到的 %d 項（企劃、美術、交付；以各職位的人工判定為準）：' % len(other) + '、'.join(f'{k} {TIER_NAME[k]} {bo[k]}' for k in sorted(bo)))
    return {'by': by, 'done': bd, 'text': '\n'.join(lines)}


def report(ledger, meta, summary):
    out = ['# 歷史待辦複核報告（工具產生，不要手改）', '',
           f'- 產生：`tools/handoff/history_audit.py`；開發分支 HEAD `{meta["head"][:12]}`、main `{meta["main"][:12]}`',
           '- 七類定義與判定規則：同資料夾 README.md。auto＝工具自動判定（只看總表狀態、程式識別字在不在 main、BB 實測紀錄有沒有 PASS），還沒有人工看過；人工判定寫進 judgments_<職位>.jsonl 以後改成人工。',
           '- BB 實際操作證據來源：' + '、'.join(meta['bb_records']), '', '## 摘要', '']
    out += ['- ' + l for l in summary['text'].splitlines()]
    gap = [r for r in ledger if r['audit_verdict'] == 'done' and r['tier'] == 2]
    for src_v in ('done', 'partial', 'not_done', 'needs_aa', 'needs_user', 'obsolete'):
        rows = [r for r in ledger if r['audit_verdict'] == src_v]
        if not rows:
            continue
        out += ['', f'## 10/21 判 {src_v} 的 {len(rows)} 項', '', '| ID | 現在 | 總表狀態 | main | BB 實測 | 負責 | 依據／缺的 |', '|---|---|---|---|---|---|---|']
        for r in sorted(rows, key=lambda r: (r['tier'], r['id'])):
            bb = r['bb'][0] if r['bb'] else '—'
            tag = ('' if not r['auto'] else '（auto）') + ('⚠證據缺' if r['evidence_gap'] else '')
            why = r.get('missing') or r['why']
            out.append(f"| {r['id']} | {r['tier']} {TIER_NAME[r['tier']]}{tag} | {r['task_status'] or '—'} | {r['main']} | {bb} | {r['owner'] or '—'} | {why[:140].replace('|', '／')} |")
    other = [r for r in ledger if r['src'] != 'audit_B']
    if other:
        by_role = collections.defaultdict(list)
        for r in other:
            by_role[r.get('judged_by') or '?'].append(r)
        for role, rows in sorted(by_role.items()):
            out += ['', f'## {role} 另外查到的 {len(rows)} 項（不在 10/21 稽核 B 段）', '', '| ID | 現在 | main | 負責 | 證據 | 缺的／下一步 |', '|---|---|---|---|---|---|']
            for r in sorted(rows, key=lambda r: (r['tier'], r['id'])):
                if r['tier'] in (1, 2) and len(rows) > 60:
                    continue
                out.append(f"| {r['id']} | {r['tier']} {TIER_NAME.get(r['tier'], '?')} | {r['main']} | {r['owner'] or '—'} | {str(r.get('evidence', ''))[:90].replace('|', '／')} | {str(r['why'] or r.get('next') or '')[:120].replace('|', '／')} |")
            n12 = sum(1 for r in rows if r['tier'] in (1, 2))
            if len(rows) > 60 and n12:
                out.append(f'| （另有第 1、2 類 {n12} 項：見 ledger.json） | | | | | |')
    return '\n'.join(out) + '\n'


if __name__ == '__main__':
    main()
