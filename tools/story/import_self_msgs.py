#!/usr/bin/env python3
"""女主角「講她自己」的訊息（HEROINE-LIFE-1028；AA-1025-1027-INTEG-1114）
企劃 AA_1029（學姊大一上三則，家族群組，第 2 則有兩個回覆選項）、AA_1030（學姊大一下～大二下九則，家族群組）、
AA_1031（芷若六、子晴八，私訊）、AA_1032（大一上第 6～9 週以安、語彤、芷若、子晴各一則，私訊）→ src/data/self_msgs.js（SELF_MSGS）；播放 src/selfmsgs3d.js。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 句子一字照稿（只照 import_guard.read_fix 換名）。
- t：「Y1S1 W4四 22:20（2025-09-25）」——有日期的照日期，沒有的由遊戲照學期、週次、星期算（STORY.termDay）。
- 條件：th 是 g:family_law＝在家族群組裡；私訊＝need 裡寫的階段（FAMILIAR／FRIEND）以上、有她的聯絡方式。
  AA_1032 _meta.change：AA_1031 的 zr_self_y1s1_1 條件降到 FAMILIAR。
用法：python3 tools/story/import_self_msgs.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

FILES = ['docs/story_planning/AA_1029_sis_self_y1s1.json', 'docs/story_planning/AA_1030_sis_self_y1s2_y2.json',
         'docs/story_planning/AA_1031_zr_zq_self.json', 'docs/story_planning/AA_1032_y1s1_w6_9_self.json']
OUT = 'src/data/self_msgs.js'
WD = {'日': 7, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6}
T_RE = re.compile(r'^(Y\dS\d) W(\d+)([日一二三四五六]) (\d\d):(\d\d)(?:（(\d{4}-\d\d-\d\d)[^）]*）)?$')
WHO = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'kevin')


def die(m):
    raise SystemExit('import_self_msgs：' + m)


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def txt(x, w):
    if not isinstance(x, str) or not x.strip(): die(f'{w}：要是一句字')
    return IG.read_fix(x)


def pair(x, w):
    if not (isinstance(x, list) and len(x) == 2 and x[0] in WHO): die(f'{w}：要是 [誰, 字]（{json.dumps(x, ensure_ascii=False)[:60]}）')
    return [x[0], txt(x[1], w)]


def main():
    allow = IG.load(ROOT)
    out, why, src, seen = [], [], [], set()
    lower = {}
    for path in FILES:
        e = [x for x in allow.get('files', []) if x.get('path') == path and x.get('status') == 'approved']
        if len(e) != 1: die(f'{path}：白名單要剛好一筆 approved（{len(e)} 筆）')
        sha = e[0]['sha']; ok, msg = IG.allowed(path, sha, allow)
        if not ok: die(msg)
        why.append(msg[:80]); src.append(f'{path}@{sha}')
        d = json.loads(git('show', f'{sha}:{path}'))
        for c in (d.get('_meta') or {}).get('change', []):
            if 'FAMILIAR' in c.get('what', ''): lower[c['id']] = 'FAMILIAR'
        for i, m in enumerate(d.get('msgs') or []):
            w = f'{path} msgs[{i}]'
            extra = set(m) - {'id', 'th', 'who', 'need', 't', 'ms', 'ask'}
            if extra: die(f'{w}：不認得的欄位 {sorted(extra)}')
            if m['id'] in seen: die(f'{w}：id 重複 {m["id"]}')
            seen.add(m['id'])
            t = T_RE.match(m['t'])
            if not t: die(f'{w}：t 看不懂「{m["t"]}」')
            r = {'id': m['id'], 'th': m['th'], 'term': t.group(1), 'week': int(t.group(2)), 'wd': WD[t.group(3)],
                 'h': round(int(t.group(4)) + int(t.group(5)) / 60, 4), 'day': t.group(6), 'src': os.path.basename(path)[:7]}
            if m['th'].startswith('g:'):
                if m['th'] != 'g:family_law': die(f'{w}：群組只認 g:family_law')
                r['need'] = 'group'; r['ms'] = [pair(x, w) for x in m['ms']]
            else:
                who = m.get('who')
                if m['th'] != 'p:' + str(who) or who not in WHO: die(f'{w}：私訊的 th 要是 p:<who>')
                need = m.get('need', '')
                r['need'] = 'FAMILIAR' if 'FAMILIAR' in need else 'FRIEND' if 'FRIEND' in need else die(f'{w}：need 看不懂「{need}」')
                r['who'] = who; r['ms'] = [[who, txt(x, w)] for x in m['ms']]
            if not r['ms']: die(f'{w}：沒有句子')
            if 'ask' in m:
                a = m['ask']
                if a.get('until') != '隔天 12:00' or len(a.get('opts') or []) < 2: die(f'{w}：ask 只認 until「隔天 12:00」、兩個以上選項')
                r['ask'] = {'untilDay': 1, 'untilH': 12, 'opts': [{'t': txt(o['t'], w), 'r': [pair(x, w) for x in o['r']]} for o in a['opts']]}
            out.append(r)
    for r in out:
        if r['id'] in lower: r['need'] = lower.pop(r['id'])
    if lower: die(f'AA_1032 _meta.change 指到的 id 不在：{sorted(lower)}')
    js = ('/* 自動產生：tools/story/import_self_msgs.py（' + '；'.join(src) + '）。不要手改，改企劃稿再重新匯入。\n'
          '   女主角主動傳、講她自己生活的訊息（HEROINE-LIFE-1028）；播放 src/selfmsgs3d.js */\n'
          "'use strict';\nconst SELF_MSGS=" + json.dumps({'src': src, 'msgs': out}, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        if (open(p, encoding='utf-8').read() if os.path.exists(p) else '') != js: die(f'{OUT} 和稿不一樣：重新匯入')
        print('OK', len(out), '則'); return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, len(out), '則；', '；'.join(why))


if __name__ == '__main__':
    main()
