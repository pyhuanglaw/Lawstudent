"""BB 的普通課堂內容（企劃分支 docs/story_planning/syllabus/*.json，格式見 AA_104 第 1 節）→ src/data/syllabus.js。
匯入法律系八學期（Y1S1～Y4S2）、日文（JP）、經濟系那一年（Y0S1、Y0S2；AA 2026-10-14 要求一起匯入——遊戲裡還沒有經濟系那一年的課，內容先放著、不會出現）。
拿掉給法律審查的 review、給企劃的 ref（不顯示）；其他欄位照原樣（board 三行、line、react[{who,text}]、tpl A／B（obs）／C（call）、special、skip、pools、second＝一週兩格的課第二格的短片段 second_slot_lines）。
週層級的 recall（例：大一下憲法二第 12 週回想 B4 演講）照匯入（v2 C15；AA-B 2026-10-16：帳號 A 的「先不匯入」是 v2 解除暫緩以前的事，作廢）。
法律審查（AA_122 第 0a 節）：SYLLABUS.reviewed＝可以顯示 BB 內容的週（'課程代號|週次'），照 BB_115_法律審查清單.json 產生——那一週的審查項目
全部通過（review.result 是 無誤／已修正／補充）才開；沒有審查項目的週可以開（BB 的快速抽查已經掃過，AA 2026-10-14）。其他週遊戲裡只用寫主題的一般句子（src/classes3d.js 的 S.sylReviewed）。
用法：python3 tools/syllabus/import_syllabus.py [企劃分支的 ref，預設 origin/claude/story-planning] [檔名=ref …（個別檔案用別的 ref）]
（2026-10-14 起企劃分支是 claude/story-planning；舊的企劃分支已經移除，不要再用那個名字——D66）"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/story-planning'
TERMS = ['Y0S1', 'Y0S2', 'Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2', 'JP']
PASS = ('無誤', '已修正', '補充')   # BB_115 的 review.result：通過的三種（沒有 result＝還沒審）
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
OVR = dict(a.split('=', 1) for a in sys.argv[2:] if '=' in a)   # 個別檔案改用別的 ref（例：Y0S1.json=9ebf6663）
show = lambda p: subprocess.check_output(['git', '-C', ROOT, 'show', f'{OVR.get(os.path.basename(p), REF)}:{p}'], text=True)
out = {'source': REF.replace('origin/', '') + ' ' + sha + ''.join(f'＋{k}@{v}' for k, v in OVR.items()), 'courses': {}, 'skip': {}, 'pools': {}, 'second': {}, 'reviewed': [], 'y0': []}   # y0：經濟系那一年的課與台詞池（遊戲裡還沒有）
KEEP = ('w', 'tpl', 'board', 'line', 'react', 'obs', 'call', 'special', 'second_slot_lines', 'ask', 'recall')   # recall＝週層級的回想（例：大一下憲法二第 12 週回想 B4 演講；v2 C15，AA-B 2026-10-16：要匯入）   # ask＝課堂提問 {qid}（AA_130 第 3 節第 3 點；題目從 EXAM_BANK 讀）
owner = {}
# 2026-10-14 課程調整（使用者 16:15，企劃分支 AA_130）：刪掉的 7 門課——就算舊的 JSON 還有，也不匯入
DROPPED = ('law_society', 'law_society_2', 'juris', 'intl_public', 'legal_history', 'fair_trade', 'conflict_laws')
dropped_seen = []
for t in TERMS:
    d = json.loads(show(f'docs/story_planning/syllabus/{t}.json'))
    for c in d.get('courses', []):
        if c['id'] in DROPPED: dropped_seen.append(c['id']); continue
        if c['id'] in owner: sys.exit(f"課程代號重複：{c['id']}（{owner[c['id']]}、{t}）")
        owner[c['id']] = t
        if t.startswith('Y0'): out['y0'].append(c['id'])
        weeks = [{k: w[k] for k in KEEP if k in w} for w in c.get('syllabus', [])]
        for w in weeks:
            if isinstance(w.get('obs'), dict) and 'echo' in w['obs']: w['obs'] = {k: v for k, v in w['obs'].items() if k != 'echo'}   # echo 只是企劃備註（AA_119：回聲改用 recall）
        if weeks: out['courses'][c['id']] = weeks
        if c.get('skip'): out['skip'][c['id']] = c['skip']
        if c.get('second_slot_lines'): out['second'][c['id']] = c['second_slot_lines']   # 一週兩格的課：第二格的短片段（課程層級的欄位；2026-10-13 以前漏了，沒匯入）
    for p in d.get('pools', []):
        out['pools'][p['id']] = {k: p[k] for k in ('prof_label', 'lines', 'react') if k in p}
        if t.startswith('Y0'): out['y0'].append(p['id'])
# 法律審查：一週一週開
rv = json.loads(show('docs/story_planning/BB_115_法律審查清單.json'))
items = {}   # '課程|週' → [通過嗎]
stray = []   # 審查項目指到課表裡沒有的週（池、第二格…）：照實列出，不靜默略過
for it in rv['items']:
    ok = ((it.get('review') or {}).get('result')) in PASS
    for o in it.get('occurrences', []):
        k = f"{o.get('course')}|{o.get('week')}"
        items.setdefault(k, []).append(ok)
        if o.get('course') not in out['courses'] or not any(w['w'] == o.get('week') for w in out['courses'].get(o.get('course'), [])): stray.append(it['id'] + ' ' + k)
closed = []
for cid, weeks in out['courses'].items():
    for w in weeks:
        k = f"{cid}|{w['w']}"
        if all(items.get(k, [True])): out['reviewed'].append(k)
        else: closed.append(k)
dst = os.path.join(ROOT, 'src', 'data', 'syllabus.js')
with open(dst, 'w', encoding='utf8') as f:
    f.write('/* 普通課堂內容（BB 撰寫；AA_104 第 1 節的 syllabus 格式）。產生器：tools/syllabus/import_syllabus.py（不要手改，改企劃分支的 JSON 再匯入）。\n'
            '   來源：' + out['source'] + '。法律系八學期＋日文＋經濟系那一年（遊戲裡還沒有那一年的課，先放著）。heroine_06 等新人物的句子在遊戲裡略過（人物設定還沒確認）。\n'
            '   reviewed：法律審查（BB_115）那一週的項目全部通過、或那一週沒有項目，才顯示 BB 的內容；其他週只用寫主題的一般句子（AA_122 第 0a 節）。 */\n')
    f.write('const SYLLABUS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
nweeks = sum(len(v) for v in out['courses'].values())
print('wrote', dst, 'courses', len(out['courses']), 'weeks', nweeks, 'reviewed', len(out['reviewed']), 'closed', len(closed), 'pools', len(out['pools']), 'skip', len(out['skip']), 'second', len(out['second']), 'bytes', os.path.getsize(dst))
print('審查項目', len(rv['items']), '通過', sum(1 for it in rv['items'] if ((it.get('review') or {}).get('result')) in PASS))
if stray: print('指到課表裡沒有的週（', len(stray), '）：', '、'.join(stray[:20]) + ('…' if len(stray) > 20 else ''))
if dropped_seen: print('略過刪掉的課（AA_130）：', '、'.join(dropped_seen))
