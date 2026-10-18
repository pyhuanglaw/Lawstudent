"""三帳號任意輪值的交接模擬（D92／HV-10，使用者 2026-10-16 21:35 第十二節）。
只用臨時目錄：建一個假的 origin（bare repo），每個帳號、每個職位各自 clone、各自分支；不碰正式的值班紀錄、不叫醒任何工作階段、不發布。
每個情境都照正式程序走：交班（snapshot → duty handoff → LAWWW duty sync → LAWWW snapshot＋duty handoff）→ 接班（duty find 找 RULE_SOURCE → 合併 → duty plan →
check → duty register（四職位）→ LAWWW duty sync → duty verify），再檢查上一班的成果（任務、各職位的工作）都在、值班狀態對。
情境：A→B、A→C、B→A、B→C、C→A、C→B、A→B→C→A、A→C→B→A、長期休班才回來、上一班沒有正式交班、某職位交班資料缺漏、未整合的 WIP、
交付送達沒 ACK、規則來源不一致／登記鏈分岔、值班登記和 commit 時間衝突、同職位兩個帳號同時寫入、交班快照不存在或壞掉。
用法：python3 tests/handoff_duty_sim.py   （每項 PASS／FAIL；全部通過結束碼 0）"""
import json, os, shutil, subprocess, sys, tempfile

REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
ROLES = ('LAWWW', 'LAWWW2', 'AA', 'BB')
results = []


def run(cwd, *a, ok=True):
    r = subprocess.run(list(a), cwd=cwd, capture_output=True, text=True, env={**os.environ, 'PYTHONDONTWRITEBYTECODE': '1'})
    if ok and r.returncode:
        raise RuntimeError(f'{" ".join(a)} 失敗（{r.returncode}）：{r.stdout[-400:]}{r.stderr[-400:]}')
    return r.returncode, (r.stdout or '') + (r.stderr or '')


def git(cwd, *a, ok=True):
    return run(cwd, 'git', *a, ok=ok)


def check(name, cond, info=''):
    results.append((name, bool(cond), info))
    print(('PASS ' if cond else 'FAIL ') + name + ('　' + info if info and not cond else ''))


def branch(role, acc):
    return f'{role.lower()}-{acc}'


def session(role, acc):
    return f'session_{acc}{role}'


class World:
    def __init__(self, first):
        self.tmp = tempfile.mkdtemp(prefix='duty_sim_')
        self.origin = os.path.join(self.tmp, 'origin.git')
        git(self.tmp, 'init', '-q', '--bare', '-b', 'main', self.origin)
        seed = os.path.join(self.tmp, 'seed')
        git(self.tmp, 'clone', '-q', self.origin, seed)
        self._cfg(seed)
        for f in ('tools/handoff/check_handoff.py', 'tools/handoff/duty_state.py', 'tools/handoff/incremental.py'):
            os.makedirs(os.path.join(seed, os.path.dirname(f)), exist_ok=True)
            shutil.copy(os.path.join(REPO, f), os.path.join(seed, f))
        os.makedirs(os.path.join(seed, 'docs/handoff/snapshots'), exist_ok=True)
        open(os.path.join(seed, 'docs/handoff/snapshots/.keep'), 'w').close()
        self.wjson(seed, 'docs/handoff/tasks.json', {'version': 1, 'statuses': ['待開工', '進行中', '等待其他AI／素材', '已實作待整合', '已整合待測試', '已驗收', '暫停', '取消／被取代'],
                                                    'meta': {}, 'tasks': [self.task('T-SEED')]})
        self.wjson(seed, 'docs/handoff/deliveries.json', {'version': 1, 'scannedThrough': {}, 'deliveries': [], 'ignored': []})
        self.wtext(seed, 'docs/HANDOFF_GAP_MATRIX.md', '# 測試用\n')
        self.wtext(seed, '.gitignore', '__pycache__/\n')
        self.wtext(seed, 'docs/AI_SESSION_HANDOFF.md', '# 測試用\n## 1. 值班表\n現在：（沒有人）\n')
        git(seed, 'add', '-A'); git(seed, 'commit', '-qm', 'seed'); git(seed, 'push', '-q', 'origin', 'main')
        self.clones = {}
        self.init(first)

    def _cfg(self, d):
        git(d, 'config', 'user.email', 'sim@example.com'); git(d, 'config', 'user.name', 'sim')

    @staticmethod
    def task(i, status='進行中'):
        return {'id': i, 'title': i, 'owner': 'LAWWW', 'status': status, 'next': '下一步', 'priority': 'P2',
                'first': {'term': 'META', 'week': 1, 'earliest': '—', 'mainline': False, 'blocks': False, 'prereq': False, 'parallel': True, 'confirmed': True}}

    @staticmethod
    def wjson(d, p, o):
        os.makedirs(os.path.dirname(os.path.join(d, p)), exist_ok=True)
        with open(os.path.join(d, p), 'w', encoding='utf-8') as f:
            json.dump(o, f, ensure_ascii=False, indent=1); f.write('\n')

    @staticmethod
    def rjson(d, p):
        with open(os.path.join(d, p), encoding='utf-8') as f:
            return json.load(f)

    @staticmethod
    def wtext(d, p, t):
        os.makedirs(os.path.dirname(os.path.join(d, p)), exist_ok=True)
        with open(os.path.join(d, p), 'w', encoding='utf-8') as f:
            f.write(t)

    def clone(self, role, acc):
        """每個帳號的每個職位一個工作目錄（模擬各自的工作階段）；分支存在就接著用（休班回來），沒有就從 main 開。"""
        k = (role, acc)
        d = self.clones.get(k)
        b = branch(role, acc)
        if not d:
            d = os.path.join(self.tmp, f'{acc}_{role}')
            git(self.tmp, 'clone', '-q', self.origin, d); self._cfg(d)
            self.clones[k] = d
        git(d, 'fetch', '-q', 'origin')
        rc, _ = git(d, 'rev-parse', '--verify', '--quiet', f'origin/{b}', ok=False)
        cur = git(d, 'branch', '--show-current')[1].strip()
        if cur != b:
            if rc == 0:
                git(d, 'checkout', '-q', '-B', b, f'origin/{b}')
            else:
                git(d, 'checkout', '-q', '-b', b, 'origin/main')
        elif rc == 0:
            git(d, 'merge', '-q', '--no-edit', f'origin/{b}')
        return d

    def tool(self, d, *a):
        return run(d, sys.executable, 'tools/handoff/check_handoff.py', '--root', d, *a, ok=False)

    def push(self, d, msg):
        git(d, 'add', '-A'); git(d, 'commit', '-qm', msg, ok=False); git(d, 'push', '-q', 'origin', 'HEAD')

    def set_roster(self, d, acc):
        self.wtext(d, 'docs/AI_SESSION_HANDOFF.md', f'# 測試用\n## 1. 值班表\n現在：**{acc} 值班中**\n' if acc else '# 測試用\n## 1. 值班表\n現在：（換班中）\n')

    def init(self, acc):
        """第一個值班帳號：建立 duty.json（等同正式制度的 init-HV-10）。"""
        d = self.clone('LAWWW', acc)
        heads = {}
        for r in ROLES:
            rd = self.clone(r, acc)
            self.wjson(rd, f'docs/handoff/duty_{r}.json', {'role': r, 'account': acc, 'session': session(r, acc), 'branch': branch(r, acc), 'state': 'on'})
            self.wtext(rd, f'work/{r}.txt', f'{acc}:init\n')
            self.push(rd, f'{r} init')
            heads[r] = git(rd, 'rev-parse', '--short=8', 'HEAD')[1].strip()
        d = self.clone('LAWWW', acc)
        duty = {'version': 1, 'ruleVersion': 'HV-10', 'ruleSource': {'branch': branch('LAWWW', acc), 'sha': heads['LAWWW']}, 'accounts': ['A', 'B', 'C'],
                'onDuty': acc, 'previous': None, 'accountState': {a: ('on' if a == acc else 'unused') for a in 'ABC'},
                'roles': {r: {'account': acc, 'session': session(r, acc), 'branch': branch(r, acc), 'sha': heads[r], 'state': 'on'} for r in ROLES},
                'history': [], 'pending': None, 'anomalies': [], 'seq': 1, 'chain': [{'seq': 1, 'at': 't0', 'account': acc, 'role': 'LAWWW', 'event': 'init'}]}
        self.wjson(d, 'docs/handoff/duty.json', duty)
        self.set_roster(d, acc)
        self.push(d, 'duty init')
        rc, out = self.tool(d, 'snapshot', '--role', 'LAWWW', '--account', acc, '--kind', 'checkpoint')
        self.push(d, 'checkpoint')

    def work(self, acc, label, roles=ROLES):
        """值班帳號做事：LAWWW 加一個任務（看接班後還在不在）；每個職位在自己的工作檔加一行。"""
        for r in roles:
            d = self.clone(r, acc)
            if r == 'LAWWW':
                t = self.rjson(d, 'docs/handoff/tasks.json'); t['tasks'].append(self.task(f'T-{label}')); self.wjson(d, 'docs/handoff/tasks.json', t)
            p = os.path.join(d, f'work/{r}.txt')
            with open(p, 'a', encoding='utf-8') as f:
                f.write(f'{acc}:{label}\n')
            self.push(d, f'{r} {label}')

    def handoff(self, acc, skip=()):
        lw = self.clone('LAWWW', acc)
        rs = branch('LAWWW', acc)
        for r in ROLES[1:]:
            if r in skip:
                continue
            d = self.clone(r, acc)
            rc, out = self.tool(d, 'snapshot', '--role', r, '--account', acc)
            fn = out.split('snapshots/')[1].split('（')[0].strip()
            rc, out = self.tool(d, 'duty', 'handoff', '--account', acc, '--role', r, '--snapshot', fn, '--ref', f'origin/{rs}')
            assert rc == 0, out
            self.push(d, f'{r} handoff')
        lw = self.clone('LAWWW', acc)
        rc, out = self.tool(lw, 'duty', 'sync'); assert rc == 0, out
        rc, out = self.tool(lw, 'snapshot', '--role', 'LAWWW', '--account', acc)
        fn = out.split('snapshots/')[1].split('（')[0].strip()
        rc, out = self.tool(lw, 'duty', 'handoff', '--account', acc, '--role', 'LAWWW', '--snapshot', fn); assert rc == 0, out
        self.set_roster(lw, None)
        self.push(lw, 'LAWWW handoff')

    def takeover(self, acc, user_ok=False, expect_rs=None, roles=ROLES):
        """接班：duty find → 合併 RULE_SOURCE → plan → check → register → 各職位合併上一任的分支並登記 → sync → verify。回傳 dict。"""
        lw = self.clone('LAWWW', acc)
        rc, out = self.tool(lw, 'duty', 'find')
        rs = out.split('RULE_SOURCE：')[1].split('（')[0].strip() if rc == 0 else None
        res = {'find_rc': rc, 'rs': rs, 'find_out': out}
        if expect_rs is not None and rs != expect_rs:
            return res
        if rs and rs != branch('LAWWW', acc):
            git(lw, 'merge', '-q', '--no-edit', f'origin/{rs}')
        d0 = self.rjson(lw, 'docs/handoff/duty.json')
        rc, res['plan'] = self.tool(lw, 'duty', 'plan', '--account', acc)
        res['check_rc'], res['check_out'] = self.tool(lw, 'check', '--role', 'LAWWW')
        a = ['duty', 'register', '--account', acc, '--role', 'LAWWW', '--session', session('LAWWW', acc), '--branch', branch('LAWWW', acc)]
        res['reg_rc'], res['reg_out'] = self.tool(lw, *(a + (['--user-ok'] if user_ok else [])))
        if res['reg_rc']:
            return res
        self.set_roster(lw, acc)
        self.push(lw, 'LAWWW register')
        res['role_rc'] = {}
        for r in ROLES[1:]:
            if r not in roles:
                continue
            d = self.clone(r, acc)
            prevb = (d0['roles'].get(r) or {}).get('branch')
            if prevb and prevb != branch(r, acc):
                git(d, 'merge', '-q', '--no-edit', '-X', 'theirs', f'origin/{prevb}')   # 接上一任的成果（不 rebase、不 force push）
            a = ['duty', 'register', '--account', acc, '--role', r, '--session', session(r, acc), '--branch', branch(r, acc), '--ref', f'origin/{branch("LAWWW", acc)}']
            rc, out = self.tool(d, *(a + (['--user-ok'] if user_ok else [])))
            res['role_rc'][r] = rc
            if rc == 0:
                self.push(d, f'{r} register')
        lw = self.clone('LAWWW', acc)
        rc, out = self.tool(lw, 'duty', 'sync'); res['sync'] = out
        self.push(lw, 'sync')
        res['verify_rc'], res['verify_out'] = self.tool(lw, 'duty', 'verify')
        res['duty'] = self.rjson(lw, 'docs/handoff/duty.json')
        res['tasks'] = [t['id'] for t in self.rjson(lw, 'docs/handoff/tasks.json')['tasks']]
        res['work'] = {r: open(os.path.join(self.clone(r, acc), f'work/{r}.txt'), encoding='utf-8').read() for r in ROLES}
        return res

    def done(self):
        shutil.rmtree(self.tmp, ignore_errors=True)


def direction(a, b):
    w = World(a)
    try:
        w.work(a, f'{a}1')
        w.handoff(a)
        r = w.takeover(b, expect_rs=branch('LAWWW', a))
        ok = (r['find_rc'] == 0 and r['rs'] == branch('LAWWW', a) and r.get('check_rc') == 0 and r.get('reg_rc') == 0
              and r.get('verify_rc') == 0 and r['duty']['onDuty'] == b and r['duty']['previous'] == a
              and all(r['duty']['roles'][x]['account'] == b for x in ROLES) and f'T-{a}1' in r['tasks']
              and all(f'{a}:{a}1' in r['work'][x] for x in ROLES) and f'上一任以 duty.json 為準：{a}' in r.get('plan', ''))
        check(f'{a} → {b}：找到 RULE_SOURCE＝{a} 的 LAWWW 分支、check／verify OK、四職位改登記 {b}、上一任 {a}、{a} 的任務和四職位的成果都在',
              ok, json.dumps({k: r.get(k) for k in ('find_rc', 'rs', 'check_rc', 'reg_rc', 'verify_rc')}, ensure_ascii=False) + (r.get('verify_out') or '')[-300:])
    finally:
        w.done()


def chain(seq, label):
    w = World(seq[0])
    try:
        for i, (a, b) in enumerate(zip(seq, seq[1:])):
            w.work(a, f'{a}{i}')
            w.handoff(a)
            r = w.takeover(b, expect_rs=branch('LAWWW', a))
            if r.get('verify_rc') != 0 or r['rs'] != branch('LAWWW', a):
                check(label, False, f'第 {i + 1} 棒 {a}→{b}：' + json.dumps({k: r.get(k) for k in ('find_rc', 'rs', 'verify_rc')}) + (r.get('verify_out') or r.get('find_out') or '')[-300:])
                return
        last = seq[-1]
        want = [f'T-{a}{i}' for i, a in enumerate(seq[:-1])]
        ok = all(t in r['tasks'] for t in want) and all(f'{a}:{a}{i}' in r['work'][x] for i, a in enumerate(seq[:-1]) for x in ROLES) and r['duty']['previous'] == seq[-2]
        check(label + f'：最後的 {last} 接到 {seq[-2]} 的最新成果（{len(want)} 班的任務、四職位的工作都在）、上一任＝{seq[-2]}（不是自己上次交出去的那一班）', ok,
              json.dumps({'tasks': r['tasks'], 'prev': r['duty']['previous']}, ensure_ascii=False))
    finally:
        w.done()


def anomalies():
    # 上一班來不及正式交班
    w = World('A')
    try:
        w.work('A', 'A1')
        r = w.takeover('B', expect_rs=branch('LAWWW', 'A'))
        refused = r.get('reg_rc') == 1 and '還沒正式交班' in r.get('reg_out', '')
        r2 = w.takeover('B', user_ok=True)
        an = [x for x in r2['duty'].get('anomalies') or [] if x['kind'] == 'no-handoff']
        check('上一班沒有正式交班：沒有使用者指示就拒絕接班；使用者明確要求（--user-ok）才接，並記 no-handoff 異常、verify 不報正常；成果照遠端最後 push 的狀態接上',
              refused and r2.get('reg_rc') == 0 and an and r2['verify_rc'] == 1 and 'T-A1' in r2['tasks'], json.dumps({'refused': refused, 'an': len(an), 'v': r2.get('verify_rc')}))
    finally:
        w.done()
    # 某職位交班資料缺漏（BB 沒交班）
    w = World('A')
    try:
        w.work('A', 'A1')
        w.handoff('A', skip=('BB',))
        r = w.takeover('B')
        check('某職位交班資料缺漏（BB 沒交班）：BB 的接班被擋（要使用者指示）、verify 報「BB 還在 A 手上」，不假裝正常',
              r.get('role_rc', {}).get('BB') == 1 and r['verify_rc'] == 1 and 'BB：還在 A 帳號手上' in r['verify_out'], r.get('verify_out', '')[-300:])
    finally:
        w.done()
    # 未整合的 WIP
    w = World('A')
    try:
        d = w.clone('LAWWW2', 'A')
        git(d, 'checkout', '-q', '-b', 'lawww2-A-wip')
        w.wtext(d, 'work/wip.txt', 'half done\n'); w.push(d, 'wip')
        git(d, 'checkout', '-q', 'lawww2-A')
        rc, out = w.tool(d, 'duty', 'register', '--account', 'A', '--role', 'LAWWW2', '--session', session('LAWWW2', 'A'), '--branch', 'lawww2-A', '--wip', 'lawww2-A-wip', '--ref', 'origin/lawww-A')
        reg = w.rjson(d, 'docs/handoff/duty_LAWWW2.json'); reg['wip'] = ['lawww2-A-wip']; w.wjson(d, 'docs/handoff/duty_LAWWW2.json', reg)
        w.push(d, 'register wip')
        lw = w.clone('LAWWW', 'A'); w.tool(lw, 'duty', 'sync'); w.push(lw, 'sync')
        rc, out = w.tool(lw, 'duty', 'verify')
        check('某職位有未整合的 WIP 分支：verify 列出「還有 N 個 commit 沒整合」（不能當完成、不能刪）', rc == 1 and 'WIP 分支 lawww2-A-wip 還有 1 個 commit 沒整合' in out, out[-300:])
    finally:
        w.done()
    # 交付送達沒 ACK（帳號 C 的交付）
    w = World('C')
    try:
        lw = w.clone('LAWWW', 'C')
        t = w.rjson(lw, 'docs/handoff/tasks.json'); t['meta']['pipeline'] = {'LAWWW2': {'minReady': 0}}; w.wjson(lw, 'docs/handoff/tasks.json', t)
        dv = w.rjson(lw, 'docs/handoff/deliveries.json')
        dv['deliveries'].append({'id': 'DL-1', 'date': '2026-10-17', 'from': 'LAWWW2-C', 'branch': 'lawww2-C', 'sha': 'abc', 'what': '模型', 'task': 'T-SEED', 'msg': 'DELIVERED', 'integration': '未整合'})
        w.wjson(lw, 'docs/handoff/deliveries.json', dv); w.push(lw, 'delivery')
        rc, out = w.tool(lw, 'check', '--no-git')
        check('交付送達沒 ACK（LAWWW2-C 的交付停在 DELIVERED）：check 報異常 11，不算完成', rc == 1 and 'DL-1（LAWWW2，abc）：交付停在 DELIVERED' in out, out[-300:])
    finally:
        w.done()
    # 規則來源不一致、登記鏈分岔
    w = World('A')
    try:
        w.work('A', 'A1'); w.handoff('A'); w.takeover('B')
        lw = w.clone('LAWWW', 'B')
        d = w.rjson(lw, 'docs/handoff/duty.json'); d['ruleSource']['branch'] = 'someone-else'; w.wjson(lw, 'docs/handoff/duty.json', d)
        rc, out = w.tool(lw, 'duty', 'verify')
        check('新舊規則來源不一致（ruleSource 不是值班 LAWWW 的分支）：verify 報異常 3', rc == 1 and 'RULE_SOURCE 分支 someone-else' in out, out[-200:])
        git(lw, 'checkout', '-q', '--', 'docs/handoff/duty.json')
        # 分岔：A 的舊 LAWWW 分支自己又寫了一筆登記（不包含 B 的鏈）
        la = w.clone('LAWWW', 'A')
        d = w.rjson(la, 'docs/handoff/duty.json'); d['seq'] += 1; d['chain'].append({'seq': d['seq'], 'at': 't9', 'account': 'A', 'role': 'LAWWW', 'event': 'register'}); d['onDuty'] = 'A'
        d['accountState']['A'] = 'on'; w.wjson(la, 'docs/handoff/duty.json', d); w.push(la, 'rogue duty')
        lw = w.clone('LAWWW', 'B')   # 先 fetch（接班程序第 1 步）
        rc, out = w.tool(lw, 'duty', 'find')
        check('兩份值班狀態的登記鏈分岔（A 的舊分支自己又登記）：duty find 不自己選、回報使用者（結束碼 1）', rc == 1 and '登記鏈分岔' in out, out[-300:])
    finally:
        w.done()
    # 值班登記和 commit 時間衝突、同職位兩個帳號同時寫入
    w = World('A')
    try:
        w.work('A', 'A1'); w.handoff('A'); w.takeover('B')
        la = w.clone('LAWWW', 'A')
        w.wtext(la, 'work/late.txt', 'A 交班以後又寫\n'); w.push(la, 'late commit by A')   # 時間比 B 的登記晚
        lb = w.clone('LAWWW', 'B')
        rc, out = w.tool(lb, 'duty', 'find')
        check('值班登記和 commit 時間衝突（A 交班以後的分支有更新的 commit）：duty find 照登記鏈還是選 B，不看 commit 時間',
              rc == 0 and 'RULE_SOURCE：lawww-B' in out, out[-200:])
        rc, out = w.tool(lb, 'duty', 'verify')
        check('同職位兩個帳號疑似同時寫入（A 交班後還 commit 到 LAWWW 分支）：verify 報異常 6、要求查清楚以前不合併不覆寫', rc == 1 and 'LAWWW：帳號 A 的分支 lawww-A 在它交班' in out, out[-300:])
        da = w.clone('AA', 'A'); w.wtext(da, 'work/AA.txt', 'A 的 AA 還在寫\n'); w.push(da, 'AA late')
        lb = w.clone('LAWWW', 'B')   # 先 fetch（接班程序第 1 步）
        rc, out = w.tool(lb, 'duty', 'verify')
        check('同職位兩個帳號同時寫入（AA）：verify 也抓得到', rc == 1 and 'AA：帳號 A 的分支 aa-A 在它交班' in out, out[-300:])
    finally:
        w.done()
    # 交班快照不存在或壞掉
    w = World('A')
    try:
        w.work('A', 'A1'); w.handoff('A'); w.takeover('B')
        lb = w.clone('LAWWW', 'B')
        d = w.rjson(lb, 'docs/handoff/duty.json')
        fn = d['lastHandoff']['snapshots']['LAWWW']; fn = fn['file'] if isinstance(fn, dict) else fn
        os.remove(os.path.join(lb, 'docs/handoff/snapshots', fn))
        rc, out = w.tool(lb, 'duty', 'verify')
        ok1 = rc == 1 and '找不到——照總入口第 4 節做 REMEDIAL_FULL_AUDIT' in out
        git(lb, 'checkout', '-q', '--', '.')
        w.wtext(lb, f'docs/handoff/snapshots/{fn}', '{壞掉')
        rc2, out2 = w.tool(lb, 'duty', 'verify')
        ok2 = rc2 == 1 and '壞掉' in out2
        for f in os.listdir(os.path.join(lb, 'docs/handoff/snapshots')):
            if f.endswith('_LAWWW.json') and f != fn:
                os.remove(os.path.join(lb, 'docs/handoff/snapshots', f))
        rc3, out3 = w.tool(lb, 'check', '--no-git')
        check('交班快照不存在／壞掉：verify 報 REMEDIAL_FULL_AUDIT；check 在最新快照壞掉時結束碼 2（不能報正常）', ok1 and ok2 and rc3 == 2, f'{rc} {rc2} {rc3} ' + out3[-200:])
    finally:
        w.done()


def main():
    for a, b in (('A', 'B'), ('A', 'C'), ('B', 'A'), ('B', 'C'), ('C', 'A'), ('C', 'B')):
        direction(a, b)
    chain(['A', 'B', 'C', 'A'], 'A → B → C → A')
    chain(['A', 'C', 'B', 'A'], 'A → C → B → A')
    chain(['A', 'B', 'C', 'B', 'C', 'A'], '帳號 A 連續休班多次（A→B→C→B→C）才回來')
    chain(['B', 'C', 'C'], '同一個帳號正式交班以後又回來（B → C，C 交班，中間沒人值班，C 回來）')
    anomalies()
    bad = [n for n, ok, _ in results if not ok]
    print(f'結果：{len(results) - len(bad)}／{len(results)} PASS' + (f'；FAIL：{bad}' if bad else ''))
    return 1 if bad else 0


if __name__ == '__main__':
    sys.exit(main())
