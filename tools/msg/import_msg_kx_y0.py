"""經濟系那一年，祐廷主動傳訊息給可昕的回覆（AA_301 第 3 節 MSG_KX_Y0；企劃線）→ src/data/msg_kx_y0.js。台詞一字不改。
只匯入 docs/handoff/story_import_allow.json 列出、status approved 的版本（從名單上的 commit 讀）。
AA_368（經濟系那一年「知道太早／時間矛盾」修正稿，AA 定稿）疊在 AA_301 上：H5 分期的日子＋新分期「寒假在臺北」（第 4 節的 5 則，從表格讀）、
M5「經濟系學期中」帶感情的那一句、L8「寒假在高雄」那一句；AA_371（AA_368 實作後的五題）第 2 題學期中延到 12/20（和期末重疊、期末優先）、第 3 題換句。AA_301 下一版改了以後，這裡的 AA_368、AA_371 部分拿掉。
用法：python3 tools/msg/import_msg_kx_y0.py"""
import json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
def src_of(prefix):
    APPROVED = G.approved_files(ALLOW, prefix)
    if not APPROVED: sys.exit('拒絕匯入：' + prefix + ' 不在白名單')
    P, SHA = next(iter(APPROVED.items()))
    ok, why = G.allowed(P, SHA, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    return P, SHA, G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{SHA}:{P}'], text=True))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
P, SHA, md = src_of('docs/story_planning/AA_301_')
sec = md[md.index('## 3.'):]
m = re.search(r'```json\n(.*?)\n```', sec, re.S)
d = json.loads(m.group(1))['MSG_KX_Y0']
# ---- AA_368（企劃線，白名單 AA368-Y0-FIX-1021）----
P2, SHA2, md2 = src_of('docs/story_planning/AA_368_')
def need(*ts):
    for t in ts:
        if t not in md2: sys.exit('AA_368 裡找不到：' + t)
# H5：16 週制 12/20 就考完，寒假（12/21～1/13）她在臺北、過年前才回高雄
need('「經濟系學期中」10/17～12/13', '「經濟系期末」12/14～12/20', '「寒假在臺北」12/21～1/13')
V = {v['variant']: v for v in d['variants']}
V['經濟系學期中']['to'] = '2024-12-13'
V['經濟系期末'].update({'from': '2024-12-14', 'to': '2024-12-20'})
assert '寒假在臺北' not in V
d['variants'].insert(d['variants'].index(V['寒假在高雄']), {'variant': '寒假在臺北', 'from': '2024-12-21', 'to': '2025-01-13'})
# 第 4 節：「寒假在臺北」的回覆（每列一則；一個「」＝一個對話框）
sec4 = md2[md2.index('## 4.'):]
sec4 = sec4[:sec4.index('\n## ', 1)] if '\n## ' in sec4[1:] else sec4
new = []
for line in sec4.split('\n'):
    mm = re.match(r'^\|\s*(chat|share_cat|share_food|share_notes|night)\s*\|(.*)\|\s*$', line)
    if not mm: continue
    msgs = re.findall(r'「(.*?)」', mm.group(2))
    assert msgs, line
    new.append({'topic': mm.group(1), 'tier': 'L', 'variant': '寒假在臺北', 'msgs': msgs, 'tags': [], 'ask': None, 'src': 'AA_368'})
assert len(new) == 5, len(new)
last = max(i for i, e in enumerate(d['replies']) if e['variant'] == '經濟系期末')
d['replies'][last + 1:last + 1] = new
# M5、L8：只換句子（tags、affection 不改）
FIX = [('M5', ['上課的時候，旁邊的位子空著。', '……我現在習慣放包包了。'], ['今天你沒來。旁邊的位子品妤坐了。', '……她上課一直講話。']),
       ('L8', ['高雄一月還可以穿短袖。', '你那邊幾度？'], ['高雄冬天還可以穿短袖。', '你那邊幾度？'])]
for k, a, b in FIX:
    need(*['「' + t + '」' for t in b if t not in a])
    hit = [e for e in d['replies'] if e['msgs'] == a]
    assert len(hit) == 1, (k, len(hit))
    hit[0]['msgs'] = b; hit[0]['fix'] = 'AA_368 ' + k
# ---- AA_371（企劃線，白名單 AA368-Y0-FIX-1021）：AA_368 實作後的五題，第 2、3 題 ----
P3, SHA3, md3 = src_of('docs/story_planning/AA_371_')
for t in ('**學期中延到 12/20**', '「剛起床。……不要問我現在幾點。」'):
    if t not in md3: sys.exit('AA_371 裡找不到：' + t)
V['經濟系學期中']['to'] = '2024-12-20'   # 第 2 題：和期末（12/14～12/20）重疊、期末優先（msg3d.js y0Pool 範圍短的先）——AA_301 第 1 節「期末沒有的話題照學期中」
hit = [e for e in d['replies'] if e['msgs'] == ['剛起床。……現在下午一點。不要講。']]
assert len(hit) == 1, len(hit)
hit[0]['msgs'] = ['剛起床。……不要問我現在幾點。']; hit[0]['fix'] = 'AA_371 第 3 題'   # 不限時段
for e in d['replies']:
    assert e['topic'] in ('chat', 'share_cat', 'share_food', 'share_notes', 'night'), e
    assert any(v['variant'] == e['variant'] for v in d['variants']), e['variant']
d['source'] = f'白名單 {P}@{SHA}＋{P2}@{SHA2}（H5、M5、L8、第 4 節）＋{P3}@{SHA3}（第 1 節第 2、3 題）'
js = '/* 自動產生：tools/msg/import_msg_kx_y0.py（AA_301 經濟系那一年主動傳訊息給可昕的回覆＋AA_368 修正；台詞一字不改）*/\n\'use strict\';\nconst MSG_KX_Y0=' + json.dumps(d, ensure_ascii=False) + ';\n'
open(os.path.join(ROOT, 'src/data/msg_kx_y0.js'), 'w', encoding='utf-8').write(js)
print('src/data/msg_kx_y0.js：', len(d['replies']), '則', [(v['variant'], v['from'], v['to']) for v in d['variants']])
