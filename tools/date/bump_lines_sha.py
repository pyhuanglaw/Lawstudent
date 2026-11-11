"""校外約會各地點源稿 docs/story_planning/date_system/lines/D01～D33.json 的白名單（docs/handoff/story_import_allow.json）整批換版：
33 筆的 sha 換成新的、舊的進 history、approvedBy 和 note 各接一段。**只改白名單，不匯入**——換完再跑 tools/date/import_date_lines.py。
AA 因為審稿再給新 SHA 時整套重跑的順序（DLG-FULL-REVIEW-1110 芷若那一輪起）：
  1. python3 tools/date/bump_lines_sha.py <新 SHA> --by '<誰、哪天、憑什麼核的>' --why '<這一版改了什麼>' [--rec zr]
  2. tests/date_src_sha.js 的 ALLOW_SHA 改成同一個 SHA（測試只認這一處）
  3. python3 tools/date/import_date_lines.py（「重寫以前的那一版」ZR_PREV 等不用動：它們是上一輪的 SHA，不是這一輪的）
  4. node tests/zr_dates_1111_unit.js 和其他約會測試
新 SHA 要先 fetch 得到（git cat-file -e）；33 筆現在的 sha 要全部一樣（不然停下來）；已經是新 SHA＝不動。
用法：python3 tools/date/bump_lines_sha.py <新 SHA> --by <approvedBy 接的那一段> --why <history／note 用的一句> [--rec <改稿紀錄 date_rewrite/ 的檔名前綴，例 zr>] [--day <note 上的日期，預設今天>] [--dry]"""
import datetime, json, os, re, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
P = os.path.join(ROOT, 'docs', 'handoff', 'story_import_allow.json')
SP = 'docs/story_planning/'


def arg(name, need=True):
    if name in sys.argv:
        return sys.argv[sys.argv.index(name) + 1]
    if need:
        sys.exit(__doc__)
    return None


def main():
    if len(sys.argv) < 2 or sys.argv[1].startswith('-'):
        sys.exit(__doc__)
    new, by, why, rec = sys.argv[1], arg('--by'), arg('--why'), arg('--rec', False)
    if subprocess.run(['git', '-C', ROOT, 'cat-file', '-e', new + '^{commit}'], stderr=subprocess.DEVNULL).returncode:
        sys.exit(f'{new}：這份 checkout 沒有這個 commit（先 git fetch 企劃線）')
    raw = open(P, encoding='utf8').read()
    a = json.loads(raw)
    tail = '\n' if raw.endswith('\n') else ''
    if json.dumps(a, ensure_ascii=False, indent=1) + tail != raw:
        sys.exit('白名單的排版和 json.dumps(indent=1) 不一樣，不敢整檔重寫')
    ent = [(e, re.match(SP + r'date_system/lines/(D\d\d)\.json$', e['path'])) for e in a['files']]
    ent = [(e, m.group(1)) for e, m in ent if m]
    olds = sorted({e['sha'] for e, _ in ent})
    if len(ent) != 33 or len(olds) != 1 or any(e.get('status') != 'approved' for e, _ in ent):
        sys.exit(f'白名單的 D01～D33 應該是 33 筆、同一個 sha、approved；讀到 {len(ent)} 筆、sha {olds}')
    old = olds[0]; day = arg('--day', False) or datetime.date.today().isoformat()
    if old == new:
        print('已經是', new, '（沒改）'); return
    for e, loc in ent:
        if subprocess.run(['git', '-C', ROOT, 'cat-file', '-e', f'{new}:{e["path"]}'], stderr=subprocess.DEVNULL).returncode:
            sys.exit(f'{new} 沒有 {e["path"]}')
        e['sha'] = new
        e['approvedBy'] = (e.get('approvedBy') or '') + f'；{new}（{by}）'
        e.setdefault('history', []).append({'sha': old, 'note': f'被 {new} 取代（{why}）'})
        e['note'] = (e.get('note') or '') + f'；{day} 改到 {new}（{why}' + (f'；改稿紀錄 {SP}date_rewrite/{rec}_{loc}.json' if rec else '') + '）'
    if '--dry' in sys.argv:
        print(f'（--dry）會把 33 筆從 {old} 換成 {new}'); return
    open(P, 'w', encoding='utf8').write(json.dumps(a, ensure_ascii=False, indent=1) + tail)
    print(f'白名單 D01～D33：{old} → {new}（33 筆；舊的進 history）')


main()
