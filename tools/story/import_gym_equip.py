#!/usr/bin/env python3
"""健身房一台一台用器材的旁白（GYM-FIT-1107；使用者 11-07「健身器材我還是不能用」）。
企劃 AA_713（docs/story_planning/AA_713_gym_equip.json，企劃線）→ src/data/gym_equip_lines.js（GYM_EQUIP_LINES）。
播放：src/gym3d.js（用器材：照器材種類×體能階段三句輪流）、src/fit3d.js（升階以後第一次練完：levelUp 一句）。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix。
- 稿的器材名稱換成遊戲的（gym_layout.js b1.fitness.equip 的 kind）：dumbbell→db_rack、squat→squat_rack，其他一樣；墊子（mat）a6cb4f488 補了。
  稿裡有遊戲沒有的器材、少了哪一階、少了升階的哪一階，就停下來。
用法：python3 tools/story/import_gym_equip.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_713_gym_equip.json'
OUT = 'src/data/gym_equip_lines.js'
STAGES = ('普通', '有在運動', '結實', '經常鍛鍊')   # src/fit3d.js S.STAGES
KIND = {'treadmill': 'treadmill', 'bike': 'bike', 'rower': 'rower', 'dumbbell': 'db_rack', 'squat': 'squat_rack', 'smith': 'smith', 'bench': 'bench', 'mat': 'mat'}   # 稿 → 遊戲（mat：AA_713 a6cb4f488 補）


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, where):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{where}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def build(src, sha):
    kinds = {}
    for k, v in src.items():
        if k.startswith('_') or k == 'levelUp':
            continue
        if k not in KIND:
            raise SystemExit(f'{k}：遊戲沒有這種器材（gym_layout.js b1.fitness.equip 的 kind；對照表 KIND）')
        miss = [s for s in STAGES if s not in (v or {})]
        if miss:
            raise SystemExit(f'{k}：少了 {miss}')
        bad = [s for s in v if s not in STAGES]
        if bad:
            raise SystemExit(f'{k}：不認得的階段 {bad}')
        kinds[KIND[k]] = {s: lines(v[s], f'{k}.{s}') for s in STAGES}
    up = src.get('levelUp') or {}
    miss = [s for s in STAGES[1:] if s not in up]
    if miss:
        raise SystemExit(f'levelUp：少了 {miss}')
    bad = [s for s in up if s not in STAGES[1:]]
    if bad:
        raise SystemExit(f'levelUp：不認得的階段 {bad}（普通沒有升階）')
    return {'src': f'{PATH}@{sha}', 'kinds': kinds, 'levelUp': {s: lines(up[s], f'levelUp.{s}') for s in STAGES[1:]}}


def main():
    ref = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else None
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = ref or hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = build(json.loads(git('show', f'{sha}:{PATH}')), sha)
    js = ('/* 自動產生：tools/story/import_gym_equip.py（' + data['src'] + '）。不要手改，改企劃 AA_713 再重新匯入。\n'
          '   健身房用器材的旁白（GYM-FIT-1107）：kinds＝器材種類（gym_layout.js b1.fitness.equip 的 kind；稿的 dumbbell＝db_rack、squat＝squat_rack）×體能階段，三句輪流（src/gym3d.js）；\n'
          '   墊子（mat）沒有稿＝用 FIT_LINES。levelUp＝升到那一階以後第一次練完，播一句（src/fit3d.js S.upNote）*/\n'
          "'use strict';\nconst GYM_EQUIP_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: {s: len(v[s]) for s in v} for k, v in data['kinds'].items()})


if __name__ == '__main__':
    main()
