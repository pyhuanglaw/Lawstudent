#!/usr/bin/env python3
"""TZ-INVITE-SUPPER-1112（SHOP-STANDARD-BACKFILL-1112；店面標準第 5 點「可以當約人的地點的排進邀約地點」＋AA_831 記的欠項）：
把 AA 的稿匯進 src/data/tz_invite_supper.js（TZ_INVITE_SUPPER）。

來源（企劃線，照 docs/handoff/story_import_allow.json 的 sha）：docs/story_planning/AA_851_tz_invite_supper.json
- invite_places：越好吃小館 tz_yuehaochi、客居雲南 tz_keju——id、zone、name、verb、kind、minStage、accept（每人答應一句）、at_table（每人入座一句；學姊多一版 heroine_05_close）。
  hours 稿寫「照店的營業時間」＝不匯數字，演出照 src/data/places.js 那一區（hoursFrom）。
- dorm_supper：東南大聯的泡麵（五包裝）帶回 203 當宵夜——scene（who、text）；when／note 是給程式看的說明，不進資料檔（條件在 src/tz_invite_supper3d.js）。
- 句子一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）。稿上有這支工具不認得的欄位、不認得的人＝停下來，不會默默丟掉。

演出：src/tz_invite_supper3d.js。測試 tests/tz_invite_supper_unit.js。
用法：python3 tools/story/import_tz_invite_supper.py [--check]"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, HERE)
import import_guard as IG

PATH = 'docs/story_planning/AA_851_tz_invite_supper.json'
OUT = 'src/data/tz_invite_supper.js'
ZONES = ('tz_yuehaochi', 'tz_keju')
PEOPLE = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin')
CLOSE = 'heroine_05_close'   # 學姊入座的另一版（很熟以上或交往中；稿 _meta.status）
MATES = ('zhe', 'classmate_bohan', 'kai')
ITEM = 'tz_dn_noodle5'       # 東南大聯「泡麵（五包裝）」（src/data/tz_grocery_lines.js 的 id；稿 dorm_supper.when 寫的）
CHANGED = []


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def die(m):
    raise SystemExit('import_tz_invite_supper：' + m)


def txt(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{json.dumps(x, ensure_ascii=False)[:60]}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def keys(e, where, must, may=()):
    if not isinstance(e, dict):
        die(f'{where}：要是物件')
    miss, extra = set(must) - set(e), set(e) - set(must) - set(may)
    if miss or extra:
        die(f'{where}：欄位不對（少 {sorted(miss)}、不認得 {sorted(extra)}）')


def place(e, i):
    w = f'invite_places[{i}]'
    keys(e, w, ('id', 'zone', 'name', 'verb', 'kind', 'minStage', 'hours', 'accept', 'at_table'))
    if e['id'] not in ZONES or e['zone'] != e['id']:
        die(f'{w}：id／zone 要是 {"、".join(ZONES)}（拿到 {e["id"]}／{e["zone"]}）')
    if e['kind'] != 'meal' or e['minStage'] != 'FAMILIAR':
        die(f'{w}：這支工具只接吃飯那一類、有點熟以上（拿到 {e["kind"]}／{e["minStage"]}）：先改 src/tz_invite_supper3d.js')
    if '照店的營業時間' not in e['hours']:
        die(f'{w}.hours：稿不是「照店的營業時間」了（{e["hours"]}）：先看 src/data/places.js 和 src/tz_invite_supper3d.js')
    keys(e['accept'], w + '.accept', PEOPLE)
    keys(e['at_table'], w + '.at_table', PEOPLE, (CLOSE,))
    return {'id': e['id'], 'zone': e['zone'], 'name': txt(e['name'], w + '.name'), 'verb': txt(e['verb'], w + '.verb'), 'kind': e['kind'], 'minStage': e['minStage'],
            'accept': {k: txt(e['accept'][k], f'{w}.accept.{k}') for k in PEOPLE},
            'at_table': {k: txt(e['at_table'][k], f'{w}.at_table.{k}') for k in PEOPLE + (CLOSE,) if k in e['at_table']}}


def supper(e):
    keys(e, 'dorm_supper', ('when', 'scene', 'note'))
    if ITEM not in e['when'] or '21:00' not in e['when'] or '大一' not in e['when'] or '一學期最多一次' not in e['when']:
        die('dorm_supper.when：條件改了（這支工具認得的是：' + ITEM + '、21:00 以後、大一、一學期最多一次）：先改 src/tz_invite_supper3d.js')
    if not isinstance(e['scene'], list) or not e['scene']:
        die('dorm_supper.scene：要是陣列、至少一句')
    out = []
    for i, l in enumerate(e['scene']):
        w = f'dorm_supper.scene[{i}]'
        keys(l, w, ('who', 'text'))
        if l['who'] is not None and l['who'] not in MATES:
            die(f'{w}：說話的人要是旁白（null）或 {"、".join(MATES)}（拿到 {l["who"]}）')
        out.append({'who': l['who'], 'text': txt(l['text'], w)})
    return {'item': ITEM, 'shop': 'tz_dongnan', 'scene': out}


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow['files'] if e.get('path') == PATH and e.get('status') == 'approved']
    if len(hits) != 1:
        die(f'{PATH} 白名單要剛好一筆 approved')
    sha = hits[0]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        die(why)
    A = json.loads(git('show', f'{sha}:{PATH}'))
    keys(A, '稿', ('_meta', 'invite_places', 'dorm_supper'), ('lawww_1112',))
    P = [place(e, i) for i, e in enumerate(A['invite_places'])]
    if sorted(p['id'] for p in P) != sorted(ZONES):
        die(f'invite_places：要剛好是 {"、".join(ZONES)}')
    data = {'src': f'{PATH}@{sha}', 'places': P, 'supper': supper(A['dorm_supper'])}
    # lawww_1112（AA 2026-11-12 回 LAWWW；有才讀）：h「203 泡麵宵夜演完推進 30 分鐘。」→ supper.minutes（演完時間往後幾分鐘；沒有這一點＝不推進，照舊）
    ANS = A.get('lawww_1112')
    if ANS is not None:
        m = re.search(r'203 泡麵宵夜演完推進 (\d+) 分鐘。', ANS.get('h', '')) if isinstance(ANS, dict) else None
        if not m or not 0 < int(m.group(1)) <= 180:
            die(f'lawww_1112.h：讀不到「203 泡麵宵夜演完推進 N 分鐘。」（{ANS}）')
        data['supper']['minutes'] = int(m.group(1))
    out = ('/* 自動產生：tools/story/import_tz_invite_supper.py（' + data['src'] + '）。不要手改，改企劃 AA_851 再重新匯入。\n'
           '   汀州路兩間店可以約人＋泡麵帶回 203 當宵夜（TZ-INVITE-SUPPER-1112；演出 src/tz_invite_supper3d.js）：places＝邀約地點（accept 每人答應一句、\n'
           '   at_table 每人入座一句，heroine_05_close＝學姊很熟以上或交往中的那一版）；supper＝宿舍那一場（item 哪一樣東西、scene 每一句、minutes 演完時間往後幾分鐘——稿 lawww_1112.h）。字一字照稿。*/\n\'use strict\';\nconst TZ_INVITE_SUPPER='
           + json.dumps(data, ensure_ascii=False, indent=1) + ';\nif(typeof module!==\'undefined\') module.exports=TZ_INVITE_SUPPER;\n')
    p = os.path.join(ROOT, OUT)
    for c in CHANGED:
        print('換名：' + c)
    if '--check' in sys.argv:
        same = os.path.exists(p) and open(p, encoding='utf-8').read() == out
        print(('OK ' + why) if same else ('不一致：' + OUT))
        sys.exit(0 if same else 1)
    open(p, 'w', encoding='utf-8').write(out)
    print('寫入', OUT, why, '｜', '、'.join(f'{q["name"]} 答應 {len(q["accept"])} 句、入座 {len(q["at_table"])} 句' for q in P), f'｜宿舍宵夜 {len(data["supper"]["scene"])} 句')


main()
