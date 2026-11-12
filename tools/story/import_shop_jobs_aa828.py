#!/usr/bin/env python3
"""AA_828：新店打工第一批——山嵐書店、南洋戲院的應徵與班表（任務 SHOP-JOBS-1112；USER_WANTS X356）。
企劃 docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md（企劃線）→ src/data/shop_jobs_aa828.js（SHOP_JOBS_AA828）：
  jobs.shanlan／jobs.cinema：notice（告示的字）、askOpt／laterOpt（看告示以後的兩個選項）、boss（說話的人）、gender、ask（開口那一句）、
    visitN／many／few（山嵐：來過幾次以上的兩句）、later（「再想想。」的回話）、sched（班表：週幾、幾點到幾點、班的名字、是不是做到打烊）、pay（一班的薪水）、
    segs（三段工作：新手／熟練／兩個小選擇和各自的下一句）、end（最後一句旁白：{週幾:[輪流]} 或 {all:[輪流]}）；
  jobs.cinema 另外有 ticket（after＝滿幾班、opt＝選項的字、line＝看完多的一句、take＝拿員工票那一下多的一句 [說話的人, 字]——第 4 節第 6 點）、alison（同學上班遇到他改說的那一句）。
  jobs.shanlan 另外有 co（第 4 節第 7 點：上班遇到宋知寧——who、seg＝哪一段後面、flag＝看哪一個旗標、met／new＝有／沒有那個旗標的那幾句 [說話的人或 null＝旁白, 字]、until＝她到哪一個學期）。
第 4 節「回 LAWWW 七問」其他幾點是規則（給實作看的），不進資料。
規則的字（第 3 節「給 LAWWW」、每一節的說明）是給實作看的，不進遊戲（流程在 src/jobs3d.js）。台詞一字不改；有名字說的話拿掉外面那一對「」（對話框已經寫了是誰說的）；
選項、旁白照稿。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_shop_jobs_aa828.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_828_新店打工_山嵐書店_南洋戲院.md'
OUT = 'src/data/shop_jobs_aa828.js'
WD = {'週一': 1, '週二': 2, '週三': 3, '週四': 4, '週五': 5, '週六': 6, '週日': 7}
GENDER = {'女': 'f', '男': 'm'}
SECTIONS = (('shanlan', '## 1. 山嵐書店'), ('cinema', '## 2. 南洋戲院'))


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
    job['notice'] = fx(need(re.search(r'告示：「(.+?)」\s*$', body, re.M), w + '.告示').group(1))
    m = need(re.search(r'看告示 → 選(「.+?」)→ (\S+?)（(女|男)）：「(.+?)」→ (.*?)選班表。選(「.+?」)→ (\S+?)：「(.+?)」\s*$', body, re.M), w + '.應徵')
    if m.group(2) != m.group(7):
        raise SystemExit(f'{w}.應徵：前後說話的人不一樣（{m.group(2)}／{m.group(7)}）')
    job['askOpt'], job['boss'], job['gender'] = fx(m.group(1)), fx(m.group(2)), GENDER[m.group(3)]
    job['ask'] = fx(m.group(4))
    mid = m.group(5).strip()
    if mid:
        v = need(re.fullmatch(r'來過\S+? (\d+) 次以上：「(.+?)」／不到 \1 次：「(.+?)」→', mid), w + '.應徵（來過幾次）')
        job['visitN'], job['many'], job['few'] = int(v.group(1)), fx(v.group(2)), fx(v.group(3))
    job['laterOpt'], job['later'] = fx(m.group(6)), fx(m.group(8))
    sched = []
    for s in re.finditer(r'^  - (週[一二三四五六日]) (\d\d:\d\d)～(\d\d:\d\d)（(.+?)）\s*$', body, re.M):
        nm = s.group(4).split('，')
        sched.append({'wd': WD[s.group(1)], 't0': hm(s.group(2)), 't1': hm(s.group(3)), 'name': fx(nm[0]), 'close': any('打烊' in x for x in nm[1:])})
    if len(sched) != 2:
        raise SystemExit(f'{w}.班表：要兩班（現在 {len(sched)}）')
    job['sched'] = sched
    job['pay'] = int(need(re.search(r'\*\*薪水\*\*：四小時 (\d+) 元', body), w + '.薪水').group(1))
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
        job['end'] = {str(s['wd']): rot(body, s['name'] + '最後一句旁白', f'{w}.{s["name"]}最後一句') for s in sched}
    return job


def build(md):
    jobs = {k: build_job(k, section(md, h)) for k, h in SECTIONS}
    c = section(md, SECTIONS[1][1])
    t = need(re.search(r'打工滿 (\d+) 班以後，買票的畫面多一個選項「(.+?)」.*看完的旁白多一句：(（.+?）)\s*$', c, re.M), 'cinema.免費的電影')
    jobs['cinema']['ticket'] = {'after': int(t.group(1)), 'opt': fx(t.group(2)), 'line': fx(t.group(3))}
    a = need(re.search(r'那位同學上班遇到他，改說：「(.+?)」（一次）', c), 'cinema.同學改說')
    jobs['cinema']['alison'] = fx(a.group(1))
    q = section(md, '## 4. 回 LAWWW')
    k = need(re.search(r'^6\. .*拿員工票多一句：(\S+?)：「(.+?)」\s*$', q, re.M), '第 4 節第 6 點（拿員工票多一句）')
    jobs['cinema']['ticket']['take'] = [fx(k.group(1)), fx(k.group(2))]
    z = need(re.search(r'^7\. 上班時遇到認識的人：(\S+?)在山嵐二樓打工——祐廷第一次在山嵐上班、她也在的那一班，(\S+?)那一段後面多一句（一次）：'
                       r'有 ([A-Z_]+)（[^）]*）→ (.+?)／沒有 \3 → (.+?)她的學期只到(大[一二三四][上下])，之後不出。', q, re.M), '第 4 節第 7 點（宋知寧）')
    who, seg = fx(z.group(1)), fx(z.group(2))
    if seg not in [g['name'] for g in jobs['shanlan']['segs']]:
        raise SystemExit(f'第 4 節第 7 點：山嵐的三段工作沒有「{seg}」那一段')

    def said(t, w):
        """「<誰>：「…」（…）「…」」→ [[誰, 字] 或 [None, （旁白）]…]；有對不上的字＝停"""
        t = t.strip()
        if not t.startswith(who + '：'):
            raise SystemExit(f'{w}：要是「{who}：「…」」開頭')
        t = t[len(who) + 1:]
        parts = re.findall(r'「[^「」]+」|（[^（）]+）', t)
        if not parts or ''.join(parts) != t:
            raise SystemExit(f'{w}：有「」和（）以外的字（{t}）')
        return [[who, fx(x[1:-1])] if x[0] == '「' else [None, fx(x)] for x in parts]
    jobs['shanlan']['co'] = {'who': who, 'seg': seg, 'flag': z.group(3), 'met': said(z.group(4), '第 7 點（認識過）'), 'new': said(z.group(5), '第 7 點（不認識）'), 'until': z.group(6)}
    return jobs


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = {'src': f'{PATH}@{sha}', 'jobs': build(git('show', f'{sha}:{PATH}'))}
    js = ('/* 自動產生：tools/story/import_shop_jobs_aa828.py（' + data['src'] + '）。不要手改，改企劃 AA_828 再重新匯入。\n'
          '   新店打工第一批：山嵐書店（shanlan）、南洋戲院（cinema）的告示、應徵、班表、三段工作、最後一句、員工票、上班遇到宋知寧——src/jobs3d.js 讀；逐句對稿 tests/shop_jobs_aa828_1112_unit.js */\n'
          "'use strict';\nconst SHOP_JOBS_AA828=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
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
