#!/usr/bin/env python3
"""AA_630＋AA_627（語彤台詞改寫，YT-REWRITE-1103）→ tools/story/aa630_fix.json（讀稿換字表，和 aa612_fix.json 同一個做法）。
遊戲 src 已經照表換了；企劃源稿（AA_11、AA_414、AA_202、ladder／Dxx 的原稿…）還是舊句——匯入工具讀稿（import_guard.py read_fix）、
讀稿比對的測試（tests/alison.js）照這張表換，舊稿讀進來就是新句。只收「一句話」的列（8 個字以上、不是程式片段、不是整段換或刪），長的先換。
用法：python3 tools/story/gen_aa630_fix.py（讀白名單上的 AA_630、AA_627，原稿不經 read_fix）"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G, aa630
ALLOW = G.load(ROOT)
def raw(p):
    A = G.approved_files(ALLOW, p); return G.world(G.alison(subprocess.check_output(['git', '-C', ROOT, 'show', f'{A[p]}:{p}'], text=True)))
rows = aa630.parse(raw(aa630.P630))
md7 = raw(aa630.P627)
for line in md7.split('\n'):
    if not re.match(r'\|\s*[AB]-\d{3}\s*\|', line): continue
    c = aa630.cells(line)
    if len(c) < 6: continue
    tag = re.match(r'【([^】]+)】', c[5])
    if '/ladder/' in c[1] or '/date_system/lines/' in c[1] or 'AA_127_' in c[1]: continue   # ladder、Dxx、AA_127 以 AA_630 為準（AA_630 第 1、2 節：沒列的＝照舊）
    if tag and tag.group(1) in ('改句', '換字'): rows.append({'no': c[0], 'file': c[1], 'orig': c[3], 'new': c[4], 'note': c[5]})
BAD = re.compile(r"[{}\[\]<>]|^'|:'|',|\bif\b|^（刪|^（照(第|舊|原|AA|這)|^（不改|整段|見 H-|見表下|改成：|交往中：|沒交往|^—$")
pairs = {}
for r in rows:
    o, n = r['orig'].strip(), r['new'].strip()
    if BAD.search(o) or BAD.search(n) or o == n: continue
    o = o.strip('「」'); n = n.strip('「」')
    if '」「' in o or '」「' in n: continue
    if len(o) < 8 or re.match(r'^[A-Z_0-9]+$', o): continue
    if o in n: continue   # 改成裡面還有原句（只加字）＝換兩次會疊，不收
    if o in pairs and pairs[o] != n: pairs[o] = None; continue   # 同一句兩種改法＝不收
    pairs[o] = n
P = sorted(((a, b) for a, b in pairs.items() if b), key=lambda x: -len(x[0]))
out = {'note': 'YT-REWRITE-1103（AA_630 bb4401fd3＋AA_627 40374c664 表 A／B【改句】【換字】，語彤新背景）：遊戲 src 已照表換；企劃源稿還是舊句，讀稿、讀稿比對時照這張表換（import_guard.py read_fix、tests/alison.js）。tools/story/gen_aa630_fix.py 產生，不要手改。', 'pairs': [list(x) for x in P]}
json.dump(out, open(os.path.join(ROOT, 'tools', 'story', 'aa630_fix.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('aa630_fix.json：', len(P), '組')
