#!/usr/bin/env python3
"""AA_701 社團布告欄（CLUB-BOARD-INFO-1105、X237）→ src/data/club_board.js。照稿一字不改；稿從白名單上的 commit 讀（git show）。
用法：python3 tools/story/import_club_board.py [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
PATH = 'docs/story_planning/AA_701_社團布告欄_活動時間與怎麼加入.md'
OUT = 'src/data/club_board.js'
CLUB = {'吉他社': 'club_guitar', '辯論社': 'club_debate', '登山社': 'club_hiking', '系籃（法律系系學會）': 'dept_basketball', '法律服務社': 'lawclub_study'}
def die(m): print('停：' + m); sys.exit(1)
def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow['files'] if e.get('path') == PATH and e.get('status') == 'approved']
    if len(hits) != 1: die(f'{PATH} 白名單要剛好一筆 approved')
    sha = hits[0]['sha']; ok, why = IG.allowed(PATH, sha, allow)
    if not ok: die(why)
    md = IG.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{sha}:{PATH}']).decode('utf-8'))
    s1 = md.split('## 1.')[1].split('## 2.')[0]
    m = re.search(r'^- 開頭：(.+)$', s1, re.M); intro = m and m.group(1).strip()
    m = re.search(r'^- 最後一行：(.+)$', s1, re.M); last = m and m.group(1).strip()
    m = re.search(r'開學前多一行：(（最上面一張：.+?）)\s*$', s1, re.M); expo = m and m.group(1).strip()
    m = re.search(r'一張都沒有的學期.*?多一句：(（.+?）)\s*$', md, re.M); none = m and m.group(1).strip()   # 第 3 節第 1 點（943f66532）
    rows = []
    for l in s1.split('\n'):
        c = [x.strip() for x in l.strip().strip('|').split('|')]
        if l.strip().startswith('|') and len(c) == 4 and c[0] in CLUB:
            rows.append({'act': CLUB[c[0]], 'club': c[0], 'when': c[1], 'join': c[2], 'say': c[3]})
    if not intro or not last or not expo or not none or len(rows) != 5: die(f'稿的格式變了：intro={bool(intro)} last={bool(last)} expo={bool(expo)} rows={len(rows)}')
    data = {'src': f'{PATH}@{sha}', 'intro': intro, 'expo': expo, 'expoDate': '2025-09-06', 'rows': rows, 'none': none, 'last': last}
    txt = ('/* 自動產生：tools/story/import_club_board.py（' + data['src'] + '）。不要手改，改企劃 AA_701 再重新匯入。\n'
           '   社團布告欄「看看」（CLUB-BOARD-INFO-1105、X237；播放 src/clubboard3d.js）*/\n\'use strict\';\nconst CLUB_BOARD=' + json.dumps(data, ensure_ascii=False, indent=1)
           + ';\nif(typeof module!==\'undefined\') module.exports=CLUB_BOARD;\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        same = os.path.exists(p) and open(p, encoding='utf-8').read() == txt
        print('OK ' + why if same else '不一致：' + OUT); sys.exit(0 if same else 1)
    open(p, 'w', encoding='utf-8').write(txt); print('寫入', OUT, why)
main()
