"""BB 的普通課堂內容（企劃分支 docs/story_planning/syllabus/*.json，格式見 AA_104 第 1 節）→ src/data/syllabus.js。
只匯入法律系的學期（Y1S1～Y4S2）和日文（JP）；經濟系大一（Y0S1、Y0S2）等使用者確認時間線後才匯入（AA_106）。
拿掉給法律審查的 review、給企劃的 ref（不顯示）；其他欄位照原樣（board 三行、line、react[{who,text}]、tpl A／B（obs）／C（call）、special、skip、pools）。
用法：python3 tools/syllabus/import_syllabus.py [企劃分支的 ref，預設 origin/claude/bb-story-planning]"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/bb-story-planning'
TERMS = ['Y1S1', 'Y1S2', 'Y2S1', 'Y2S2', 'Y3S1', 'Y3S2', 'Y4S1', 'Y4S2', 'JP']
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
out = {'source': 'claude/bb-story-planning ' + sha, 'courses': {}, 'skip': {}, 'pools': {}}
KEEP = ('w', 'tpl', 'board', 'line', 'react', 'obs', 'call', 'special', 'second_slot_lines')
for t in TERMS:
    d = json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:docs/story_planning/syllabus/{t}.json'], text=True))
    for c in d.get('courses', []):
        weeks = [{k: w[k] for k in KEEP if k in w} for w in c.get('syllabus', [])]
        if weeks: out['courses'][c['id']] = weeks
        if c.get('skip'): out['skip'][c['id']] = c['skip']
        if c.get('second_slot_lines'): out['courses'].setdefault(c['id'], [])
    for p in d.get('pools', []):
        out['pools'][p['id']] = {k: p[k] for k in ('prof_label', 'lines', 'react') if k in p}
dst = os.path.join(ROOT, 'src', 'data', 'syllabus.js')
with open(dst, 'w', encoding='utf8') as f:
    f.write('/* 普通課堂內容（BB 撰寫；AA_104 第 1 節的 syllabus 格式）。產生器：tools/syllabus/import_syllabus.py（不要手改，改企劃分支的 JSON 再匯入）。\n'
            '   來源：' + out['source'] + '。只有法律系八學期＋日文；經濟系大一等使用者確認時間線（AA_106）。heroine_06 等新人物的句子在遊戲裡略過（人物設定還沒確認）。 */\n')
    f.write('const SYLLABUS=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
print('wrote', dst, 'courses', len(out['courses']), 'weeks', sum(len(v) for v in out['courses'].values()), 'pools', len(out['pools']), 'skip', len(out['skip']), 'bytes', os.path.getsize(dst))
