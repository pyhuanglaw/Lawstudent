"""期末考題庫（使用者 2026-10-14 16:15、17:10，企劃分支 AA_126 1-5、AA_130 第 3 節）→ src/data/exam_bank.js。題目一字不改（只挑欄位）。
大一～大三：docs/story_planning/exam_official/ 裡除了 course_bank_map.json 以外的全部 *.json（不寫死檔名，AA b0a4766；superseded/ 不讀），只收 status＝USER_CONFIRMED；
大四：docs/story_planning/exam_y4/*.json（AA_*.json、BB_*.json，同一門課兩個檔合成一門），只收 status＝Y4_CROSS_REVIEWED；
大一～大三的 AI 補題：docs/story_planning/exam_ai/AA_*.json、BB_*.json，只收 status＝AI_CROSS_REVIEWED（使用者 2026-10-16 授權、10-18 00:0x「這個馬上做」「下一個版本就要放進去」，AA-C 7e00eaa4；遊戲裡只用來把課堂題＋正式題補到 5 題，exam_ai/README.md 第 3 節）；
刑訴用遊戲裡現有的 QBANK（src/data/legal_qbank.js），在遊戲裡接，不在這裡複製。
課堂題（AA_130 第 3 節第 3 點）：題目有 askedIn 或 source＝CLASS_DISC；其餘是題庫題。現在還沒有課堂題。
AI 草稿（exam_bank_封存_AI草稿/、qbank_封存_AI草稿/）不讀。
法條：大一～大三的 basis（之後改名 mapBasis）是 AA、BB 對週次時自己標的，不是使用者給的——兩種名字都不帶進遊戲（AA 2026-10-14 17:4x，企劃分支 ac7ecb2）；
大四是 AI 出題、使用者授權，basis 照帶、交卷後顯示。
用法：python3 tools/exam/import_exam_bank.py [企劃分支的 ref，預設 origin/claude/story-planning]"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
REF = sys.argv[1] if len(sys.argv) > 1 else 'origin/claude/story-planning'
sha = subprocess.check_output(['git', '-C', ROOT, 'rev-parse', '--short', REF], text=True).strip()
show = lambda p: subprocess.check_output(['git', '-C', ROOT, 'show', f'{REF}:{p}'], text=True)
ls = lambda d: [l for l in subprocess.check_output(['git', '-C', ROOT, 'ls-tree', '--name-only', f'{REF}:{d}'], text=True).split('\n') if l]
KEEP = ('id', 'course', 'term', 'scopeWeek', 'type', 'q', 'options', 'answer', 'core', 'explanation', 'status', 'askedIn', 'source', 'lang')   # lang：法學英文 'en'（題幹、選項英文；BB-B 796319d）
KEEP_Y4 = KEEP + ('basis',)
DROPPED = ('law_society', 'law_society_2', 'juris', 'intl_public', 'legal_history', 'fair_trade', 'conflict_laws')
out = {'source': REF.replace('origin/', '') + ' ' + sha, 'files': [], 'questions': [], 'courseMap': {}}
seen = set(); skipped = []
def take(path, need):
    d = json.loads(show(path)); qs = d.get('questions') or []
    n = 0
    for q in qs:
        if q.get('status') != need: skipped.append(f"{q.get('id')}:{q.get('status')}"); continue
        if q.get('course') in DROPPED: skipped.append(f"{q.get('id')}:刪掉的課"); continue
        if q['id'] in seen: sys.exit('題號重複：' + q['id'] + '（' + path + '）')
        keep = KEEP_Y4 if need == 'Y4_CROSS_REVIEWED' else KEEP
        seen.add(q['id']); out['questions'].append({k: q[k] for k in keep if k in q}); n += 1
    out['files'].append({'path': path.replace('docs/story_planning/', ''), 'taken': n})
for f in ls('docs/story_planning/exam_official'):
    if f.endswith('.json') and f != 'course_bank_map.json': take('docs/story_planning/exam_official/' + f, 'USER_CONFIRMED')
for f in ls('docs/story_planning/exam_ai'):
    if f.endswith('.json') and (f.startswith('AA_') or f.startswith('BB_')): take('docs/story_planning/exam_ai/' + f, 'AI_CROSS_REVIEWED')
for f in ls('docs/story_planning/exam_y4'):
    if f.endswith('.json') and (f.startswith('AA_') or f.startswith('BB_')): take('docs/story_planning/exam_y4/' + f, 'Y4_CROSS_REVIEWED')
# 漏收檢查（AA-C 10-18 00:0x）：docs/story_planning 底下所有 exam_*／ 資料夾的 json，不是收進來的、也不在下面的排除清單 → 報錯停止（新增題庫資料夾不會再漏）
EXCLUDE = {   # 路徑（資料夾以 / 結尾）：原因
    'exam_official/course_bank_map.json': '課程對照表（courseMap 另外讀）',
    'exam_official/superseded/': '被取代的舊版',
    'exam_official/tools/': '對週次的工具輸出',
    'exam_ai/basis_ai.json': 'AA 標的法條依據（不進遊戲）', 'exam_ai/basis_bb_ai.json': 'BB 標的法條依據（不進遊戲）',
    'exam_y4/basis_2026-10-14.json': '大四法條依據（題目自己帶 basis）',
    'exam_bank_封存_AI草稿/': 'AI 草稿，使用者沒授權（AA_126）',
}
allj = [l for l in subprocess.check_output(['git', '-C', ROOT, '-c', 'core.quotepath=off', 'ls-tree', '-r', '--name-only', REF, 'docs/story_planning/'], text=True).split('\n') if l]
took = {f['path'] for f in out['files']}
miss = []
for pth in allj:
    rel = pth.replace('docs/story_planning/', '')
    if not (rel.startswith('exam_') and rel.endswith('.json')) or rel in took: continue
    if rel in EXCLUDE or any(k.endswith('/') and rel.startswith(k) for k in EXCLUDE): continue
    miss.append(rel)
if miss: sys.exit('題庫 json 沒有收進來、也不在排除清單（tools/exam/import_exam_bank.py 的 EXCLUDE）：' + '、'.join(miss))
cm = json.loads(show('docs/story_planning/exam_official/course_bank_map.json'))
for c in cm.get('courses', []):
    out['courseMap'][c['course']] = {k: c[k] for k in ('term', 'name', 'exam', 'status') if k in c}
dst = os.path.join(ROOT, 'src', 'data', 'exam_bank.js')
with open(dst, 'w', encoding='utf8') as fo:
    fo.write('/* 期末考題庫（使用者確認的正式題目＋大四交叉審通過的題目；AA_126 1-5、AA_130 第 3 節）。產生器：tools/exam/import_exam_bank.py（不要手改）。\n'
             '   來源：' + out['source'] + '。題目、選項、答案、考點一字不改。大一～大三的 AI 補題 status＝AI_CROSS_REVIEWED、source＝AI_Y1Y3（只用來補到 5 題）。刑訴用 QBANK（legal_qbank.js）。courseMap：每門課是不是考五題（exam: mc5／NO_EXAM）。 */\n')
    fo.write('const EXAM_BANK=' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ';\n')
by = {}
for q in out['questions']: by[q['course']] = by.get(q['course'], 0) + 1
print('wrote', dst, 'questions', len(out['questions']), 'files', len(out['files']), 'by course', json.dumps(by, ensure_ascii=False))
if skipped: print('沒收（狀態不對或刪掉的課）：', len(skipped), '、'.join(skipped[:12]) + ('…' if len(skipped) > 12 else ''))
