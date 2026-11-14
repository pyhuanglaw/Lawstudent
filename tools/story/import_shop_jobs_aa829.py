#!/usr/bin/env python3
"""AA_829：新店打工第二批——花序 Flower Notes、越好吃小館、大口漢堡的應徵與班表（任務 SHOP-JOBS-1112；USER_WANTS X356）。
企劃 docs/story_planning/AA_829_新店打工_花序_越好吃_大口漢堡.md（企劃線）→ src/data/shop_jobs_aa829.js（SHOP_JOBS_AA829）；格式和第一批（import_shop_jobs_aa828.py）一樣，多的只有：
  jobs.flower／jobs.yue／jobs.dakou：look（告示那個按鈕的字：稿上「看小卡 →」「看告示 →」「看立牌 →」的那三個字）、notice、askOpt／laterOpt、boss、ask、later、
    sched（班表：wd、t0、t1（隔天 02:00＝26）、name（括號裡第一段是「○○班」才記，例：晚班、大夜班；其他是給實作看的說明）、close、pay（那一班的薪水和別班不一樣才有：大夜班 880））、
    pay（一班的薪水）、segs（三段工作）、end（最後一句旁白：{all:[輪流]} 或 {週幾:[輪流]}——同一個名字的班（大口漢堡週一、週四都是晚班）是同一組）；
  jobs.yue 另外有 mealExtra（上班那兩天同學來吃飯，後面多的一句旁白）、mealAfter（插在哪一段後面——第 5 節第 7 點）。
  gender（第 5 節第 3 點「值班經理男；花藝師、老闆娘女。」：每一間的 boss 是男是女）；最上層 busyLine（第 5 節第 1 點：選到灰掉的班那一句旁白）。
第 5 節「回 LAWWW」其他幾點是規則（給實作看的），不進資料。
規則的字（每一節的說明、第 4 節「給 LAWWW」）是給實作看的，不進遊戲（流程在 src/jobs3d.js）。台詞一字不改；有名字說的話拿掉外面那一對「」；選項、旁白照稿。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_shop_jobs_aa829.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_829_新店打工_花序_越好吃_大口漢堡.md'
OUT = 'src/data/shop_jobs_aa829.js'
WD = {'週一': 1, '週二': 2, '週三': 3, '週四': 4, '週五': 5, '週六': 6, '週日': 7}
SECTIONS = (('flower', '## 1. 花序 Flower Notes'), ('yue', '## 2. 越好吃小館'), ('dakou', '## 3. 大口漢堡'))
NSCHED = {'flower': 2, 'yue': 2, 'dakou': 3}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def need(m, w):
    if not m:
        raise SystemExit(f'{w}：稿上找不到（格式變了？）')
    return m


def fx(s):
    return IG.read_fix(s.strip())


def hm(s):
    h, m = s.split(':')
    return int(h) + int(m) / 60


def section(md, head):
    i = md.find(head)
    if i < 0:
        raise SystemExit(f'找不到「{head}」那一節')
    j = md.find('\n## ', i + 1)
    return md[i:j if j > 0 else len(md)]


def rot(body, label, w):
    """「- <label>（輪流）：（…）／（…）」→ [句…]"""
    m = need(re.search(r'^- ' + re.escape(label) + r'（輪流）：(.+)$', body, re.M), w)
    L = [fx(t) for t in m.group(1).split('／')]
    if len(L) < 2 or any(not re.fullmatch(r'（.+）', t) for t in L):
        raise SystemExit(f'{w}：要是兩句以上的旁白（…）／（…）')
    return L


def build_job(key, body):
    w = key
    job = {}
    ap = need(re.search(r'^- \*\*應徵\*\*：\n  - .+：「(.+?)」\s*\n  - (看\S+?) → 選(「.+?」)→ (\S+?)：「(.+?)」→ 選班表。選(「.+?」)→ (\S+?)：「(.+?)」\s*$', body, re.M), w + '.應徵')
    if ap.group(4) != ap.group(7):
        raise SystemExit(f'{w}.應徵：前後說話的人不一樣（{ap.group(4)}／{ap.group(7)}）')
    job['look'], job['notice'] = fx(ap.group(2)), fx(ap.group(1))
    job['askOpt'], job['boss'], job['ask'] = fx(ap.group(3)), fx(ap.group(4)), fx(ap.group(5))
    job['laterOpt'], job['later'] = fx(ap.group(6)), fx(ap.group(8))
    sched = []
    for s in re.finditer(r'^  - (週[一二三四五六日]) (\d\d:\d\d)～(隔天 )?(\d\d:\d\d)(?:（(.+?)）)?\s*$', body, re.M):
        segs = re.split('[，；]', s.group(5) or '')
        nm = segs[0] if re.fullmatch(r'\S{1,3}班', segs[0]) else ''
        sched.append({'wd': WD[s.group(1)], 't0': hm(s.group(2)), 't1': hm(s.group(4)) + (24 if s.group(3) else 0), 'name': fx(nm), 'close': any('打烊' in x for x in segs[1:])})
    if len(sched) != NSCHED[key]:
        raise SystemExit(f'{w}.班表：要 {NSCHED[key]} 班（現在 {len(sched)}）')
    if any(q['t1'] <= q['t0'] for q in sched):
        raise SystemExit(f'{w}.班表：下班比上班早')
    pm = need(re.search(r'^- \*\*薪水\*\*：\S+?小時 (\d+) 元(?:；(\S+?班) (\d+) 元)?', body, re.M), w + '.薪水')
    job['pay'] = int(pm.group(1))
    if pm.group(2):
        hit = [q for q in sched if q['name'] == fx(pm.group(2))]
        if not hit:
            raise SystemExit(f'{w}.薪水：班表沒有「{pm.group(2)}」')
        for q in hit:
            q['pay'] = int(pm.group(3))
    job['sched'] = sched
    segs = []
    for r in re.finditer(r'^\| (?!段 \||---)(.+?) \| (（.+?）) \| (（.+?）) \| (.+?) \|\s*$', body, re.M):
        ch = re.findall(r'(「[^→]+?」)→(（.+?）)(?=／「|$)', r.group(4).strip())
        if len(ch) != 2:
            raise SystemExit(f'{w}.三段工作「{r.group(1)}」：要兩個小選擇（現在 {len(ch)}）')
        segs.append({'name': fx(r.group(1)), 'nov': fx(r.group(2)), 'exp': fx(r.group(3)), 'ch': [[fx(a), fx(b)] for a, b in ch]})
    if len(segs) != 3:
        raise SystemExit(f'{w}.三段工作：要三段（現在 {len(segs)}）')
    job['segs'] = segs
    if re.search(r'^- 最後一句旁白（輪流）：', body, re.M):
        job['end'] = {'all': rot(body, '最後一句旁白', w + '.最後一句')}
    else:
        if any(not q['name'] for q in sched):
            raise SystemExit(f'{w}.最後一句：分班寫的，可是班表有一班沒有名字')
        job['end'] = {str(q['wd']): rot(body, q['name'] + '最後一句旁白', f'{w}.{q["name"]}最後一句') for q in sched}
    return job


def build(md):
    jobs = {k: build_job(k, section(md, h)) for k, h in SECTIONS}
    y = section(md, SECTIONS[1][1])
    m = need(re.search(r'照平常的 meal_hello，後面多一句旁白：(（.+?）)（每人一次就好', y), 'yue.同學來吃飯多的一句')
    jobs['yue']['mealExtra'] = fx(m.group(1))
    q = section(md, '## 5. 回 LAWWW')
    g = need(re.search(r'^3\. (.+?)男；(.+?)女。\s*$', q, re.M), '第 5 節第 3 點（男女）')
    sex = {}
    for names, v in ((g.group(1), 'm'), (g.group(2), 'f')):
        for n in names.split('、'):
            sex[fx(n)] = v
    for k in jobs:
        if jobs[k]['boss'] not in sex:
            raise SystemExit(f'第 5 節第 3 點：沒有寫「{jobs[k]["boss"]}」是男是女')
        jobs[k]['gender'] = sex.pop(jobs[k]['boss'])
    if sex:
        raise SystemExit(f'第 5 節第 3 點：多了不認得的人 {sorted(sex)}')
    a = need(re.search(r'^7\. 越好吃「(（.+?）)」插在「(.+?)」那一段後面。\s*$', q, re.M), '第 5 節第 7 點（插在哪一段後面）')
    if fx(a.group(1)) != jobs['yue']['mealExtra'] or fx(a.group(2)) not in [s['name'] for s in jobs['yue']['segs']]:
        raise SystemExit('第 5 節第 7 點：那一句和第 2 節的不一樣，或沒有那一段')
    jobs['yue']['mealAfter'] = fx(a.group(2))
    b = need(re.search(r'^1\. 選到灰掉的班：出一句旁白「(（.+?）)」再回選單。\s*$', q, re.M), '第 5 節第 1 點（灰掉的班那一句）')
    return jobs, fx(b.group(1))


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    jobs, busy = build(git('show', f'{sha}:{PATH}'))
    data = {'src': f'{PATH}@{sha}', 'busyLine': busy, 'jobs': jobs}
    js = ('/* 自動產生：tools/story/import_shop_jobs_aa829.py（' + data['src'] + '）。不要手改，改企劃 AA_829 再重新匯入。\n'
          '   新店打工第二批：花序 Flower Notes（flower）、越好吃小館（yue）、大口漢堡（dakou）的告示、應徵、班表、薪水、三段工作、最後一句——src/jobs3d.js 讀；逐句對稿 tests/shop_jobs_aa829_1112_unit.js */\n'
          "'use strict';\nconst SHOP_JOBS_AA829=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)


if __name__ == '__main__':
    main()
