"""BB 的普通課堂內容（企劃分支 docs/story_planning/syllabus/*.json，格式見 AA_104 第 1 節）→ src/data/syllabus.js。
匯入法律系八學期（Y1S1～Y4S2）、日文（JP）、經濟系那一年（Y0S1、Y0S2；AA 2026-10-14 要求一起匯入——遊戲裡還沒有經濟系那一年的課，內容先放著、不會出現）。
拿掉給法律審查的 review、給企劃的 ref（不顯示）；其他欄位照原樣（board 三行、line、react[{who,text}]、tpl A／B（obs）／C（call）、special、skip、pools、second＝一週兩格的課第二格的短片段 second_slot_lines）。
週層級的 recall（例：大一下憲法二第 12 週回想 B4 演講）照匯入（v2 C15；AA-B 2026-10-16：帳號 A 的「先不匯入」是 v2 解除暫緩以前的事，作廢）。
法律審查（AA_122 第 0a 節）：SYLLABUS.reviewed＝可以顯示 BB 內容的週（'課程代號|週次'），照 BB_115_法律審查清單.json 產生——那一週的審查項目
全部通過（review.result 是 無誤／已修正／補充）才開；沒有審查項目的週可以開（BB 的快速抽查已經掃過，AA 2026-10-14）。其他週遊戲裡只用寫主題的一般句子（src/classes3d.js 的 S.sylReviewed）。
用法：python3 tools/syllabus/import_syllabus.py [企劃分支的 ref，預設 origin/claude/story-planning] [檔名=ref …（個別檔案用別的 ref）]
     ref 可以寫「分支@commit」：從那個 commit 讀、來源寫分支名（分支已經往前走、要重產同一版時用；例：claude/magical-albattani-bk7b4n@57b2a7b3）
（2026-10-14 起企劃分支是 claude/story-planning；舊的企劃分支已經移除，不要再用那個名字——D66）
AA_373（企劃線修正稿，白名單 AA373-Y1S2-FIX-1021；AA 定稿）第 9 項：大一下通識第 6 週（ge_y1s2，週一 13:20）改成天文館的圓頂——宥辰那句、觀察的開頭兩處整句換掉；第 6-2 節第 3 題（bdab2f42）再換黑板「（本週在天文館）」、觀察的結果「宥辰仰著頭，一直到燈亮都沒有說話。」
（旁白「（這堂課移到天文館。）」「（天文館的圓頂關了燈。）」在 src/classes3d.js 的 SPECIAL_PRE）。只讀匯入白名單上的版本；企劃線的 JSON 下一版自己改好了就跳過
AA_377（大三下修正稿，白名單 AA377-Y3S2-FIX-1021）第 9 項：民訴 civpro_2 第 14 週拿掉作廢的模擬法庭（改成言詞辯論的練習）、第 15 週板書第 2 行"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as GUARD
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/story-planning'
LABEL = None
if '@' in REF: LABEL, REF = REF.split('@', 1)   # 分支@commit：讀 commit、來源寫分支名
TERMS = ['Y0S1', 'Y0S2', 'Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2', 'JP']
PASS = ('無誤', '已修正', '補充')   # BB_115 的 review.result：通過的三種（沒有 result＝還沒審）
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
OVR = dict(a.split('=', 1) for a in sys.argv[2:] if '=' in a)   # 個別檔案改用別的 ref（例：Y0S1.json=9ebf6663）
show = lambda p: GUARD.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{OVR.get(os.path.basename(p), REF)}:{p}'], text=True))  # AA_380：讀稿先把「小語」換成 Alison（import_guard.alison）
out = {'source': (LABEL or REF.replace('origin/', '')) + ' ' + sha + ''.join(f'＋{k}@{v}' for k, v in OVR.items()), 'courses': {}, 'skip': {}, 'pools': {}, 'second': {}, 'reviewed': [], 'y0': []}   # y0：經濟系那一年的課與台詞池（遊戲裡還沒有）
KEEP = ('w', 'tpl', 'board', 'line', 'react', 'obs', 'call', 'special', 'second_slot_lines', 'ask', 'recall')   # recall＝週層級的回想（例：大一下憲法二第 12 週回想 B4 演講；v2 C15，AA-B 2026-10-16：要匯入）   # ask＝課堂提問 {qid}（AA_130 第 3 節第 3 點；題目從 EXAM_BANK 讀）
owner = {}
# 2026-10-14 課程調整（使用者 16:15，企劃分支 AA_130）：刪掉的 7 門課——就算舊的 JSON 還有，也不匯入
DROPPED = ('law_society', 'law_society_2', 'juris', 'intl_public', 'legal_history', 'fair_trade', 'conflict_laws')
# AA_342 C1（AA-C c56d4241）：大四下法律專題研究第 6、7 週改成一般的週（使用者 10-18 拿掉大四下的法院旁聽，AA_327 2-Y4-41）——企劃分支的 JSON 還有那兩週，也不匯入（那兩週照一般句子）
DROPPED_WEEKS = {('legal_research', 6), ('legal_research', 7)}
dropped_seen = []
for t in TERMS:
    d = json.loads(show(f'docs/story_planning/syllabus/{t}.json'))
    for c in d.get('courses', []):
        if c['id'] in DROPPED: dropped_seen.append(c['id']); continue
        if c['id'] in owner: sys.exit(f"課程代號重複：{c['id']}（{owner[c['id']]}、{t}）")
        owner[c['id']] = t
        if t.startswith('Y0'): out['y0'].append(c['id'])
        weeks = [{k: w[k] for k in KEEP if k in w} for w in c.get('syllabus', []) if (c['id'], w.get('w')) not in DROPPED_WEEKS]
        for w in weeks:
            if isinstance(w.get('obs'), dict) and 'echo' in w['obs']: w['obs'] = {k: v for k, v in w['obs'].items() if k != 'echo'}   # echo 只是企劃備註（AA_119：回聲改用 recall）
        if weeks: out['courses'][c['id']] = weeks
        if c.get('skip'): out['skip'][c['id']] = c['skip']
        if c.get('second_slot_lines'): out['second'][c['id']] = c['second_slot_lines']   # 一週兩格的課：第二格的短片段（課程層級的欄位；2026-10-13 以前漏了，沒匯入）
    for p in d.get('pools', []):
        out['pools'][p['id']] = {k: p[k] for k in ('prof_label', 'lines', 'react') if k in p}
        if t.startswith('Y0'): out['y0'].append(p['id'])
# AA_373 第 9 項（白名單 AA373-Y1S2-FIX-1021）：大一下通識第 6 週改成天文館的圓頂（白天關燈看星空投影）。整句相同才換；「先讓眼睛習慣黑暗。」不改
ALLOW = GUARD.load(ROOT)
A373 = GUARD.approved_files(ALLOW, 'docs/story_planning/AA_373_')
if A373:
    P373, S373 = next(iter(A373.items()))
    ok, why = GUARD.allowed(P373, S373, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md373 = GUARD.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S373}:{P373}'], text=True))
    w6 = next((w for w in out['courses'].get('ge_y1s2', []) if w.get('w') == 6), None)
    if w6 is None: sys.exit('AA_373 第 9 項：找不到 ge_y1s2 第 6 週')
    for old, new, quote in [('晚上的課，我最清醒。', '關了燈的課，我最清醒。', '宥辰「關了燈的課，我最清醒。」'), ('操場很暗。你……', '圓頂裡很暗。你……', '「操場很暗」→「圓頂裡很暗」')]:
        if quote not in md373: sys.exit(f'AA_373@{S373} 裡找不到第 9 項的「改成」：{quote}')
        hits = [r for r in w6.get('react', []) if r.get('text') == old] + ([w6['obs']] if isinstance(w6.get('obs'), dict) and w6['obs'].get('prompt') == old else [])
        news = [r for r in w6.get('react', []) if r.get('text') == new] + ([w6['obs']] if isinstance(w6.get('obs'), dict) and w6['obs'].get('prompt') == new else [])
        if len(hits) == 1:
            if 'prompt' in hits[0] and hits[0].get('prompt') == old: hits[0]['prompt'] = new
            else: hits[0]['text'] = new
        elif not (len(hits) == 0 and len(news) == 1): sys.exit(f'AA_373 第 9 項：ge_y1s2 第 6 週「{old}」有 {len(hits)} 處（應該是 1 處；或已經是新句）')
    # 第 6-2 節第 3 題（bdab2f42）：黑板「（本週晚上在操場）」→「（本週在天文館）」、觀察「看旁邊的人」的結果「宥辰躺在跑道上，沒有說話。」→「宥辰仰著頭，一直到燈亮都沒有說話。」（開頭旁白「（這堂課移到天文館。）」在 classes3d.js 的 SPECIAL_PRE）
    for old, new, quote in [('（本週晚上在操場）', '（本週在天文館）', '「（本週在天文館）」'), ('宥辰躺在跑道上，沒有說話。', '宥辰仰著頭，一直到燈亮都沒有說話。', '「宥辰仰著頭，一直到燈亮都沒有說話。」')]:
        if quote not in md373: sys.exit(f'AA_373@{S373} 裡找不到第 6-2 節第 3 題的「改成」：{quote}')
        board = w6.get('board') or []
        opts = [o for o in ((w6.get('obs') or {}).get('options') or []) if isinstance(o, dict)]
        hits = [('board', i) for i, b in enumerate(board) if b == old] + [('obs', o) for o in opts if o.get('result') == old]
        news = [b for b in board if b == new] + [o for o in opts if o.get('result') == new]
        if len(hits) == 1:
            k, x = hits[0]
            if k == 'board': board[x] = new
            else: x['result'] = new
        elif not (len(hits) == 0 and len(news) == 1): sys.exit(f'AA_373 第 6-2 節第 3 題：ge_y1s2 第 6 週「{old}」有 {len(hits)} 處（應該是 1 處；或已經是新句）')
    out['source'] += f'＋{os.path.basename(P373)[:6]}@{S373}（通識第 6 週 4 句）'
# AA_377 第 9 項（白名單 AA377-Y3S2-FIX-1021；第 6-1 節，AA 回 LAWWW 01:45）：大三下民訴 civpro_2 第 14 週（BB_102）整週是作廢的「模擬法庭」（使用者 10-17 刪除，AA_252）——
#   換成「言詞辯論的練習」：沒有法官、沒有判決、不叫模擬法庭；第 15 週板書第 2 行跟著改。整個欄位相同才換；企劃線的 JSON 下一版自己改好了（已經是新的）就跳過，舊的、新的都不是＝停下來
A377 = GUARD.approved_files(ALLOW, 'docs/story_planning/AA_377_')
if A377:
    P377, S377 = next(iter(A377.items()))
    ok, why = GUARD.allowed(P377, S377, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md377 = GUARD.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S377}:{P377}'], text=True))
    cw = {w.get('w'): w for w in out['courses'].get('civpro_2', [])}
    if 14 not in cw or 15 not in cw: sys.exit('AA_377 第 9 項：找不到 civpro_2 第 14、15 週')
    OPT_P = {'text': '原告', 'result': '你發現說清楚「我要什麼」比想像中難。'}
    OPT_D = {'text': '被告', 'result': '你發現被告的第一句話，最重要。'}
    for wk, field, old, new, quotes in [
        (14, 'board', ['模擬法庭：法官、原告、被告', '最後由法官寫判決', '判決書最重要的是「理由」'], ['言詞辯論的順序：原告、被告', '先講要什麼，再講為什麼', '一個人一分鐘'],
         ['「言詞辯論的順序：原告、被告」', '「先講要什麼，再講為什麼」', '「一個人一分鐘」']),
        (14, 'line', '一個人當法官，一個人當原告，一個人當被告。最後，法官要寫理由。', '左邊這半當原告，右邊這半當被告。一個人一分鐘，先講你要什麼。', ['「左邊這半當原告，右邊這半當被告。一個人一分鐘，先講你要什麼。」']),
        (14, 'react', [{'who': 'yu', 'text': '我要當法官！……欸，法官不能先說他覺得誰可憐喔？'}, {'who': 'classmate_bohan', 'text': '我當書記官。我要記錄。'}],
         [{'who': 'yu', 'text': '沒有法官喔？……那我當原告。我要先講。'}, {'who': 'classmate_bohan', 'text': '我計時。一分鐘，我幫大家按碼表。'}], ['「沒有法官喔？……那我當原告。我要先講。」', '「我計時。一分鐘，我幫大家按碼表。」']),
        (14, 'obs', {'prompt': '蔡教授讓你自己選角色。你選……', 'options': [{'text': '法官', 'result': '你坐上去才發現，法官最難的是不說話。寫理由的時候更難。'}, OPT_P, OPT_D]},
         {'prompt': '蔡教授讓大家分成兩邊。你在……', 'options': [OPT_P, OPT_D]}, ['「蔡教授讓大家分成兩邊。你在……」', '法官那個選項拿掉']),
        (15, 'board', ['（端午補假）', '判決書併到第 14 週的模擬法庭', '下次見面：期末考'], ['（端午補假）', '上週的練習：講義在課程網', '下次見面：期末考'], ['「上週的練習：講義在課程網」'])]:
        for q in quotes:
            if q not in md377: sys.exit(f'AA_377@{S377} 裡找不到第 9 項的「改成」：{q}')
        cur = cw[wk].get(field)
        if cur == new: continue
        if cur != old: sys.exit(f'AA_377 第 9 項：civpro_2 第 {wk} 週的 {field} 是 {cur!r}（應該是舊的，或已經是新的）')
        cw[wk][field] = new
    out['source'] += f'＋{os.path.basename(P377)[:6]}@{S377}（民訴第 14、15 週）'
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
# AA-C 2026-10-18 審 BB_105 G6（BB_105 @3954f9b62；V3-B105-G2）：日文（下）第 10 週拿掉采蓁的金句「所以學語言，是在學看人。」——企劃線的 JSON 還有，匯入時拿掉（那一堂的劇情段在 src/bbpack3d.js 的 G6）
DROP_REACT = [('japanese_2', 10, '所以學語言，是在學看人。')]
drop_note = ''
for cid, wk, txt in DROP_REACT:
    for w in out['courses'].get(cid, []):
        if w.get('w') == wk and isinstance(w.get('react'), list) and any(r.get('text') == txt for r in w['react']):
            w['react'] = [r for r in w['react'] if r.get('text') != txt]
            drop_note = '\n   拿掉一句（匯入時，DROP_REACT）：日文（下）第 10 週采蓁「所以學語言，是在學看人。」——AA-C 2026-10-18 審 BB_105 G6 拿掉的金句（BB_105 @3954f9b62 G6；那一堂的劇情段在 src/bbpack3d.js 的 G6）。'
# AA_123 4-3b（白名單 AA_123@d805bceee；V6-A3）：以安新 9＝大二上行政法第 12 週（admin_law w12，以安站機關那邊、「……你這樣講，我要改我的答案。」）。
#   前任版：課堂照演，下課後多一句「剛剛那個，是課堂上的。」——匯入時在那一週加 exAfter（只給和以安分開過、現在沒有在交往的玩家；src/v6ex3d.js 的 ev_an_ex_admin 下課後演）。
#   AA_123 裡找不到那一句、或那一週不是新 9 的課堂＝停下來
A123 = GUARD.approved_files(ALLOW, 'docs/story_planning/AA_123_')
if A123:
    P123, S123 = next(iter(A123.items()))
    ok, why = GUARD.allowed(P123, S123, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md123 = GUARD.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{S123}:{P123}'], text=True))
    EX9 = '剛剛那個，是課堂上的。'
    if f'下課後多一句：「{EX9}」' not in md123: sys.exit(f'AA_123@{S123} 裡找不到 4-3b 新 9 的前任版：下課後多一句：「{EX9}」')
    w12 = next((w for w in out['courses'].get('admin_law', []) if w.get('w') == 12), None)
    if w12 is None or not any(r.get('who') == 'heroine_01' and r.get('text') == '……你這樣講，我要改我的答案。' for r in w12.get('react', [])): sys.exit('AA_123 4-3b：admin_law 第 12 週不是以安新 9 的課堂（找不到「……你這樣講，我要改我的答案。」）')
    w12['exAfter'] = [{'who': 'heroine_01', 'text': EX9}]
    out['source'] += f'＋{os.path.basename(P123)[:6]}@{S123}（行政法第 12 週前任版 1 句）'
dst = os.path.join(ROOT, 'src', 'data', 'syllabus.js')
with open(dst, 'w', encoding='utf8') as f:
    f.write('/* 普通課堂內容（BB 撰寫；AA_104 第 1 節的 syllabus 格式）。產生器：tools/syllabus/import_syllabus.py（不要手改，改企劃分支的 JSON 再匯入）。\n'
            '   來源：' + out['source'] + '。法律系八學期＋日文＋經濟系那一年（遊戲裡還沒有那一年的課，先放著）。heroine_06 等新人物的句子在遊戲裡略過（人物設定還沒確認）。\n'
            '   reviewed：法律審查（BB_115）那一週的項目全部通過、或那一週沒有項目，才顯示 BB 的內容；其他週只用寫主題的一般句子（AA_122 第 0a 節）。' + drop_note + ' */\n')
    f.write('const SYLLABUS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
nweeks = sum(len(v) for v in out['courses'].values())
print('wrote', dst, 'courses', len(out['courses']), 'weeks', nweeks, 'reviewed', len(out['reviewed']), 'closed', len(closed), 'pools', len(out['pools']), 'skip', len(out['skip']), 'second', len(out['second']), 'bytes', os.path.getsize(dst))
print('審查項目', len(rv['items']), '通過', sum(1 for it in rv['items'] if ((it.get('review') or {}).get('result')) in PASS))
if stray: print('指到課表裡沒有的週（', len(stray), '）：', '、'.join(stray[:20]) + ('…' if len(stray) > 20 else ''))
if dropped_seen: print('略過刪掉的課（AA_130）：', '、'.join(dropped_seen))
