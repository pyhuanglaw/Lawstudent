"""閒聊階梯（企劃線 docs/story_planning/ladder/ladder_aa.json＋ladder_bb.json；使用者 2026-10-15 全案通過、直接實作）→ src/data/ladder.js。台詞一字不改。
用法：python3 tools/ladder/import_ladder.py [企劃線的 ref，帳號 B 值班期間預設 origin/claude/cool-heisenberg-o8kuqx]"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/cool-heisenberg-o8kuqx'
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
show = lambda p: json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:{p}'], text=True))
out = {'source': REF.replace('origin/', '') + ' ' + sha, 'characters': {}, 'terms': {}, 'kaiDorm': [], 'bikeSeat': {}}
for f in ('ladder_aa', 'ladder_bb'):
    d = show(f'docs/story_planning/ladder/{f}.json')
    for cid, v in d['characters'].items():
        if cid in out['characters']: sys.exit('人物重複：' + cid)
        out['characters'][cid] = {k: v[k] for k in v if k != 'note'}; out['terms'][cid] = d.get('term')
    if d.get('kaiDorm'): out['kaiDorm'] = d['kaiDorm']
    if d.get('bikeSeat'): out['bikeSeat'] = d['bikeSeat']
dst = os.path.join(ROOT, 'src', 'data', 'ladder.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 閒聊階梯（大一上；AA_135、AA_136、BB_130；README 在企劃線 docs/story_planning/ladder/）。產生器：tools/ladder/import_ladder.py（不要手改）。來源：' + out['source'] + ' */\n')
    fo.write("'use strict';\nconst LADDER=" + json.dumps(out, ensure_ascii=False) + ';\n')
print('wrote', dst, {k: len(v['steps']) for k, v in out['characters'].items()}, 'kaiDorm', len(out['kaiDorm']))
