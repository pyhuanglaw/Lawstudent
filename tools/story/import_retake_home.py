"""重考期在家的日常（AA_297；企劃線 docs/story_planning/retake_home/retake_home_v1.json）→ src/data/retake_home.js。台詞一字不改。
只匯入 docs/handoff/story_import_allow.json 列出、status approved 的版本（從名單上的 commit 讀）。
用法：python3 tools/story/import_retake_home.py"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
P = 'docs/story_planning/retake_home/retake_home_v1.json'
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/retake_home/')
if P not in APPROVED: sys.exit('拒絕匯入：' + P + ' 不在白名單')
ok, why = G.allowed(P, APPROVED[P], ALLOW)
if not ok: sys.exit('拒絕匯入：' + why)
d = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[P]}:{P}'], text=True)))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
for k in ('short', 'long'):
    for e in d[k]:
        for l in e['lines'] + e.get('after', []):
            if l['s'] not in (None, 'kexin', 'player', '媽媽', '爸爸', '管理人員'): sys.exit(f"{e['id']}：說話的人不認得（{l['s']}）")   # player＝祐廷（AA_307 第 1 列：C4 祐廷兩句）
# 使用者要求的前後一致修正（匯入時套用；企劃檔下一班 AA 改了以後這裡拿掉）：臺北的家是一層樓的公寓（使用者 2026-10-18 15:2x：「圖片看起來是一層樓為什麼媽媽叫我下樓吃飯」）
FIX = {'七點，她拖著拖鞋下樓。': '七點，她拖著拖鞋從房間出來。'}
nfix = 0
for k in ('short', 'long'):
    for e in d[k]:
        for l in e['lines'] + e.get('after', []):
            for a, b in FIX.items():
                if a in (l.get('t') or ''): l['t'] = l['t'].replace(a, b); nfix += 1
# 2D 背景（BB 決定，D100／D110：BB 管 2D 背景）：7/10 看考場原本是深色底，接現成圖 exam_hs_classroom（7/11 考試那張，events.js；BB 帳號 A 10-21 22:4x，企劃線 e7dc26c2 BB_218 最後一節）。
# 企劃檔下一班 AA 加了 bg 以後這裡拿掉
BG = {'RH-O6': 'exam_hs_classroom'}
nbg = 0
for k in ('short', 'long'):
    for e in d[k]:
        if e['id'] in BG and not e.get('bg'): e['bg'] = BG[e['id']]; nbg += 1
# 使用者拿掉的衝刺班日期卡（2026-10-18 15:4x：「也不需要說後來去請假他就不笑了 這樣好像很兇，但其實沒有」）
CUT_CARDS = {'衝刺班。後來去請假，她已經不笑了。'}
d['cram_cards'] = [c for c in (d.get('cram_cards') or []) if c.get('t') not in CUT_CARDS]
out = {'source': f'白名單 {P}@{APPROVED[P]}', 'range': d.get('range'), 'cram': d.get('cram'), 'cram_cards': d.get('cram_cards'), 'room': d.get('room'), 'short': d['short'], 'long': d['long']}   # cram、cram_cards：衝刺班（AA_298 第 1 節）
js = '/* 自動產生：tools/story/import_retake_home.py（AA_297 重考期在家的日常；台詞一字不改）*/\n\'use strict\';\nconst RETAKE_HOME=' + json.dumps(out, ensure_ascii=False) + ';\n'
open(os.path.join(ROOT, 'src/data/retake_home.js'), 'w', encoding='utf-8').write(js)
print('src/data/retake_home.js：short', len(d['short']), 'long', len(d['long']), '修正', nfix, '背景', nbg)
