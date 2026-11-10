#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""全遊戲台詞統計：找「像機器寫的」地方（AA，2026-11-11；任務 DLG-FULL-REVIEW-1110／X324）

用法（在 repo 根目錄）：
  python3 docs/story_planning/tools_aa/voice_stats.py [--ref origin/<開發分支>] [--out 報告.md]
不改任何檔；從 git 的那個 ref 讀 src/data/*.js，把中文字串抽出來統計。

抓的東西（都是「值得人去看」的線索，不是判定）：
  A 每個人物：句數、句長分布、十字以內的比例、最常見的開頭、最常見的結尾
  B 同一句一字不差出現三次以上
  C 不同人物說了同一句
  D 句型骨架重複（把每一小句的頭兩個字和尾兩個字留下，中間換成＿）
  E 常見的 AI 句型家族各出現幾次、誰用最多
  F 一則台詞裡每一小句都很短、長度幾乎一樣（三連短句）
人物歸屬是用檔案裡最近出現的人物 id 猜的（階梯、約會、期末飯這些照人物分段的檔很準；事件檔不準，只當全體統計）。
"""
import re, subprocess, sys, collections, statistics

FILES = ['ladder.js', 'date_lines.js', 'termend_lines.js', 'termend_opts.js', 'events.js', 'msg_pool.js', 'msg2_pool.js',
         'msg_replies.js', 'invites.js', 'invite_replies.js', 'heroine_arcs.js', 'activity_scenes.js', 'date_wish.js',
         'multirel_lines.js', 'movie_plots.js', 'vac_activities.js', 'free_trips.js', 'gift_holiday.js',
         'r2y3a_events.js', 'r2y3b_events.js', 'r2y4a_events.js', 'r2y4b_events.js', 'bbpack_events.js']
NAMES = {'heroine_01': '以安', 'heroine_02': '芷若', 'heroine_03': '語彤', 'heroine_04': '子晴', 'heroine_05': '學姊',
         'classmate_peishan': '沛珊', 'classmate_xinci': '芯慈', 'classmate_bohan': '柏翰', 'classmate_mingxuan': '明軒',
         'kexin': '可昕', 'zhe': '阿哲', 'yu': 'Alison', 'kai': '阿凱', 'npc_fangyt': '奕廷'}
ID_RE = re.compile(r"""(?<![\w])['"]?(heroine_0[1-5]|classmate_[a-z]+|kexin|npc_fangyt|zhe|yu|kai)['"]?\s*[:=,\]]""")
STR_RE = re.compile(r"""'((?:[^'\\\n]|\\.)*)'|"((?:[^"\\\n]|\\.)*)"|`((?:[^`\\]|\\.)*)`""")
CJK = re.compile(r'[一-鿿]')
COMMENT_RE = re.compile(r'/\*.*?\*/', re.S)

FAMILIES = [
    ('不是X，是Y', re.compile(r'不是[^，。！？]{1,12}[，。]\s*(?:而)?是')),
    ('我只是……', re.compile(r'我只是')),
    ('……（刪節號）開頭', re.compile(r'^……')),
    ('以「……好。」「……嗯。」收', re.compile(r'……[好嗯]。?$')),
    ('你知道嗎', re.compile(r'你知道嗎')),
    ('這樣就好／就夠了', re.compile(r'(這樣就好|就夠了|就很好了)')),
    ('第一次……', re.compile(r'(我第一次|這是我第一次|你是第一個)')),
    ('不要跟別人講', re.compile(r'不要跟(別人|其他人)(講|說)')),
    ('我記得／我會記得', re.compile(r'我(會)?記得')),
    ('好奇怪', re.compile(r'好奇怪')),
    ('我在想', re.compile(r'我(一直)?在想')),
    ('謝謝你……', re.compile(r'謝謝你')),
    ('總有一天／以後', re.compile(r'(總有一天|有一天我)')),
    ('比喻：像……一樣', re.compile(r'像[^，。]{1,10}一樣')),
]


def show(ref, f):
    r = subprocess.run(['git', 'show', f'{ref}:src/data/{f}'], capture_output=True)
    return r.stdout.decode('utf-8', 'replace') if r.returncode == 0 else ''


def lines_of(text):
    """回傳 [(who, 字串)]；who 用最近出現的人物 id 猜"""
    text = COMMENT_RE.sub(lambda m: ' ' * len(m.group(0)), text)
    text = re.sub(r'//[^\n]*', '', text)
    ids = [(m.start(), m.group(1)) for m in ID_RE.finditer(text)]
    out, k, cur = [], 0, None
    for m in STR_RE.finditer(text):
        while k < len(ids) and ids[k][0] < m.start():
            cur = ids[k][1]; k += 1
        s = m.group(1) or m.group(2) or m.group(3) or ''
        if len(CJK.findall(s)) < 2: continue
        if s.startswith('（') and s.endswith('）'): continue          # 純旁白
        if s.startswith('「') and s.endswith('」'): continue          # 玩家選項
        if re.search(r'[A-Za-z_]{4,}\.(js|md|json)|AA_\d|BB_\d', s): continue   # 來源註記
        out.append((cur, s))
    return out


def clauses(s):
    return [c for c in re.split(r'[。！？!?…\n]+', re.sub(r'（[^）]*）', '', s)) if c.strip()]


def skeleton(c):
    c = c.strip('，、 ')
    return c if len(c) <= 4 else c[:2] + '＿' + c[-2:]


def main():
    ref = 'origin/claude/confident-ritchie-8rwh7t'; outp = None
    a = sys.argv[1:]
    if '--ref' in a: ref = a[a.index('--ref') + 1]
    if '--out' in a: outp = a[a.index('--out') + 1]
    per = collections.defaultdict(list); allv = []; byfile = {}
    for f in FILES:
        L = lines_of(show(ref, f)); byfile[f] = len(L)
        for who, s in L:
            allv.append((f, who, s))
            if who in NAMES: per[who].append(s)
    R = []
    P = R.append
    P(f'# 全遊戲台詞統計（{ref}）\n')
    P('> 工具：`docs/story_planning/tools_aa/voice_stats.py`。人物歸屬是猜的（見工具開頭說明）。數字是線索，不是判定。\n')
    P(f'抽到的台詞字串：{len(allv)} 則。各檔：' + '、'.join(f'{f} {n}' for f, n in byfile.items() if n) + '\n')
    P('## A. 每個人物\n')
    P('| 人物 | 則數 | 小句平均字數 | 十字以內的小句 | 最常見的開頭（前兩字×次數） | 最常見的結尾（後兩字×次數） |')
    P('|---|---|---|---|---|---|')
    for who, L in sorted(per.items(), key=lambda x: -len(x[1])):
        cl = [c for s in L for c in clauses(s)]
        if not cl: continue
        ln = [len(c) for c in cl]
        head = collections.Counter(c[:2] for c in cl if len(c) >= 2).most_common(5)
        tail = collections.Counter(c[-2:] for c in cl if len(c) >= 2).most_common(5)
        P(f"| {NAMES[who]} | {len(L)} | {statistics.mean(ln):.1f} | {sum(1 for x in ln if x <= 10) * 100 // len(ln)}% | "
          + ' '.join(f'{h}×{n}' for h, n in head) + ' | ' + ' '.join(f'{h}×{n}' for h, n in tail) + ' |')
    P('\n## B. 同一句一字不差出現三次以上（前 60）\n')
    cnt = collections.Counter(s for _, _, s in allv)
    rows = [(s, n) for s, n in cnt.most_common() if n >= 3 and len(s) >= 4][:60]
    for s, n in rows:
        fs = sorted({f for f, _, t in allv if t == s})
        P(f'- {n} 次｜{s[:60]}｜{"、".join(fs)[:80]}')
    P('\n## C. 不同人物說了同一句（前 60）\n')
    who_of = collections.defaultdict(set)
    for _, who, s in allv:
        if who in NAMES and len(s) >= 5: who_of[s].add(NAMES[who])
    for s, ws in sorted(((s, w) for s, w in who_of.items() if len(w) >= 2), key=lambda x: -len(x[1]))[:60]:
        P(f'- {"、".join(sorted(ws))}｜{s[:60]}')
    P('\n## D. 句型骨架重複（頭兩字＿尾兩字；每個人物前 8）\n')
    for who, L in sorted(per.items(), key=lambda x: -len(x[1])):
        sk = collections.Counter(skeleton(c) for s in L for c in clauses(s) if len(c) >= 6)
        top = [(k, n) for k, n in sk.most_common(8) if n >= 4]
        if top: P(f'- **{NAMES[who]}**：' + '　'.join(f'{k}×{n}' for k, n in top))
    P('\n## E. 常見的 AI 句型家族\n')
    P('| 句型 | 全部 | 用最多的三個人 |')
    P('|---|---|---|')
    for name, rx in FAMILIES:
        tot = sum(1 for _, _, s in allv if rx.search(s))
        pw = collections.Counter()
        for who, L in per.items():
            pw[NAMES[who]] = sum(1 for s in L if rx.search(s))
        P(f'| {name} | {tot} | ' + '、'.join(f'{w} {n}' for w, n in pw.most_common(3) if n) + ' |')
    P('\n## F. 三連短句（一則裡三個以上小句、每句六字以內）\n')
    pw = collections.Counter(); ex = collections.defaultdict(list)
    for who, L in per.items():
        for s in L:
            cl = clauses(s)
            if len(cl) >= 3 and all(len(c) <= 6 for c in cl):
                pw[NAMES[who]] += 1
                if len(ex[NAMES[who]]) < 3: ex[NAMES[who]].append(s[:40])
    for w, n in pw.most_common():
        P(f'- {w} {n} 則：' + '｜'.join(ex[w]))
    txt = '\n'.join(R) + '\n'
    if outp: open(outp, 'w', encoding='utf8').write(txt)
    else: sys.stdout.write(txt)


if __name__ == '__main__':
    main()
