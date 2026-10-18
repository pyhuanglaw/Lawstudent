"""經濟系那一年，祐廷主動傳訊息給可昕的回覆（AA_301 第 3 節 MSG_KX_Y0；企劃線）→ src/data/msg_kx_y0.js。台詞一字不改。
只匯入 docs/handoff/story_import_allow.json 列出、status approved 的版本（從名單上的 commit 讀）。
用法：python3 tools/msg/import_msg_kx_y0.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/AA_301_')
if not APPROVED: sys.exit('拒絕匯入：AA_301 不在白名單')
P, SHA = next(iter(APPROVED.items()))
ok, why = G.allowed(P, SHA, ALLOW)
if not ok: sys.exit('拒絕匯入：' + why)
md = subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True)
sec = md[md.index('## 3.'):]
m = re.search(r'```json\n(.*?)\n```', sec, re.S)
d = json.loads(m.group(1))['MSG_KX_Y0']
for e in d['replies']:
    assert e['topic'] in ('chat', 'share_cat', 'share_food', 'share_notes', 'night'), e
    assert any(v['variant'] == e['variant'] for v in d['variants']), e['variant']
d['source'] = f'白名單 {P}@{SHA}'
js = '/* 自動產生：tools/msg/import_msg_kx_y0.py（AA_301 經濟系那一年主動傳訊息給可昕的回覆；台詞一字不改）*/\n\'use strict\';\nconst MSG_KX_Y0=' + json.dumps(d, ensure_ascii=False) + ';\n'
open(os.path.join(ROOT, 'src/data/msg_kx_y0.js'), 'w', encoding='utf-8').write(js)
print('src/data/msg_kx_y0.js：', len(d['replies']), '則', [v['variant'] for v in d['variants']])
