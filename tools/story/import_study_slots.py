#!/usr/bin/env python3
"""一起念書第 6 次解鎖的「她那一格」（AA_722；INVITE-PLACES-1107、STUDY-DATE-PROGRESS-1107；AA_706 第 1 節第 3 點「邀約選單多一個她那一格」）。
企劃 AA_722（docs/story_planning/AA_722_study_unlock_slots.json，企劃線）→ src/data/study_slots.js（STUDY_SLOTS；src/studyslot3d.js 讀）。
台詞照稿（read_fix）；時間、錢、場景怎麼演（有 3D 店的在店裡見面、沒有的用 2D 背景走出遊）是 LAWWW 的 CFG。白名單照 import_guard。
用法：python3 tools/story/import_study_slots.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_722_study_unlock_slots.json'
OUT = 'src/data/study_slots.js'

# LAWWW-B 11-07：怎麼接進遊戲。days：0＝週日 … 6＝週六（invites3d 的 wdOf）。
#   zone＝有 3D 的店：照一般的約（到店裡見面），見面那一段演 AA 的那一場（INV.meetEv）
#   out＝沒有場景：時間到了「出發」→ 2D 背景演那一場 → 演完到 end（OUT.plan，和 AA_716 故事線的約一樣）
#   cost：照 AA「LAWWW 定」——小路「今天的定食」菜單沒有，定 200；滷味之後各付 120（第一次她請）；木柵交通照 AA_716 木柵那趟（不另外扣錢，只算時間）
#   bg：BB-B 11-07 09:42（BB_132 第 115 組 70de623b2）：滷味用現有的 gongguan_luwei；課輔班教室、木柵大學圖書館窗外的山還沒有圖＝黑底＋地點字幕（和 AA_716 一樣），
#       圖到了（wenzhou_tutoring_room、nccu_library_window）把 None 換成 id 重新匯入
CFG = {
    'an_shop1': {'mode': 'zone', 'zone': 'wz_teishoku', 'name': '小路（她手帳上的第一家）', 'verb': '去她手帳上的第一家（小路）吃飯',
                 'kind': 'meal', 'cats': ['meal'], 'memory': 'SHARED_MEAL', 'sitAct': 'eat', 'seatPose': 'sit',
                 'days': [1, 3, 4, 5], 'times': [18, 19], 'hours': [18, 21], 'stay': 1, 'cost': 200, 'costLabel': '小路（今天的定食）'},   # 平日；小路週二公休
    'zr_morning_movie': {'mode': 'zone', 'zone': 'xs_nanyang', 'name': '南洋戲院（週六早場）', 'verb': '去南洋戲院看週六早場',
                         'kind': 'reason', 'cats': ['fun'], 'memory': 'MOVIE_TOGETHER', 'sitAct': 'sit', 'seatPose': 'sit',
                         'days': [6], 'times': [9 + 50 / 60], 'hours': [9.5, 12.5], 'stay': 2, 'ticket': True},   # 票錢照 INV.buyTicket（150 元，AA_615）
    'yt_after_close': {'mode': 'zone', 'zone': 'wz_teahouse', 'name': '一盞（她下班以後）', 'verb': '去一盞，等她下班',
                       'kind': 'reason', 'cats': ['sit'], 'memory': 'TEAHOUSE_TEA', 'sitAct': 'sit', 'seatPose': 'sit',
                       'days': [6, 0], 'times': [17], 'hours': [17, 19], 'stay': 1, 'cost': 0, 'req': ['YT_MET_JOB']},
    'zq_luwei': {'mode': 'out', 'name': '公館滷味', 'verb': '讀完去公館吃滷味', 'cats': ['meal'], 'memory': 'SHARED_MEAL',
                 'days': [0, 1, 2, 3, 4, 5, 6], 'times': [19, 20, 21], 'hours': [19, 22], 'stay': 1, 'cost': 120, 'firstFree': True, 'costLabel': '公館滷味',
                 'bg': ['公館・滷味攤', 'gongguan_luwei'], 'travel': '騎車約 10 分鐘', 'travelH': 1 / 6, 'end': {'spot': '公館商圈'}},
    'ps_tutor': {'mode': 'out', 'name': '溫州街課輔班', 'verb': '週三去課輔班幫忙', 'cats': ['walk'], 'memory': 'WALKED_TOGETHER',
                 'days': [3], 'times': [18.5], 'hours': [18.5, 21], 'stay': 2.5, 'cost': 0, 'until': '2026-12-17', 'rotIf': {'2': 'PS_HIDDEN_TIRED'},
                 'bg': ['溫州街・課輔班', None], 'travel': '走路約 10 分鐘', 'travelH': 1 / 6, 'end': {'spot': '溫州街'}},
    # CANON-NO-ECON-1112 第五批（AA_920 ⑩，AA-C 定稿、BB_447）：可昕週末那一格改成法律系館的自習室（id、flag 照留）；台詞在下面 B920 換
    'kx_mzu_lib': {'mode': 'out', 'name': '法律系館・自習室', 'verb': '週末和她去系館念書', 'cats': ['study'], 'memory': 'STUDIED_TOGETHER',
                   'days': [6, 0], 'times': [13], 'hours': [13, 17], 'stay': 3, 'cost': 0,
                   'bg': ['法律系館・自習室', None], 'travel': '走路約 5 分鐘', 'travelH': 5 / 60, 'end': {'home': True}},
}
WHO = {'an_shop1': 'heroine_01', 'zr_morning_movie': 'heroine_02', 'yt_after_close': 'heroine_03', 'zq_luwei': 'heroine_04',
       'ps_tutor': 'classmate_peishan', 'kx_mzu_lib': 'kexin'}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, w):
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def build(src):
    out = []
    seen = set()
    for s in src.get('slots', []):
        sid = s.get('id')
        w = f'slots.{sid}'
        if sid not in CFG:
            raise SystemExit(f'{w}：CFG 沒有這一格（先在 import_study_slots.py 定怎麼接）')
        if s.get('who') != WHO[sid]:
            raise SystemExit(f'{w}.who：{s.get("who")}，CFG 是 {WHO[sid]}')
        if not isinstance(s.get('flag'), str) or not s['flag']:
            raise SystemExit(f'{w}.flag：要寫解鎖的旗標')
        f = s.get('first') or {}
        e = {'id': sid, 'who': s['who'], 'flag': s['flag'], 'label': IG.read_fix(s.get('label') or CFG[sid]['name']),
             'repeat': bool(s.get('repeat')), 'acc': lines(s.get('acc'), w + '.acc'),
             'first': lines(f.get('scene'), w + '.first.scene')}
        if f.get('set'):
            e['set'] = f['set']
        rot = s.get('rot') or []
        if e['repeat'] and not rot:
            raise SystemExit(f'{w}：可以一直約（repeat）就要有 rot（第二次以後輪流）')
        e['rot'] = [lines(r, f'{w}.rot[{i}]') for i, r in enumerate(rot)]
        pb = s.get('partnerBlock')
        if pb:   # 897ddd17e：吃飯類（小路、滷味）照 10-14 的規則擋（你和別人交往、她知道＝這一格不出現）；有 say＝擋著時解鎖後第一次見面她說、記 set（alone）
            e['partnerBlock'] = {'say': lines(pb['say'], w + '.partnerBlock.say')} if pb.get('say') else {}
        e.update(CFG[sid])
        for k, c in (e.get('rotIf') or {}).items():
            if not (0 <= int(k) < len(e['rot'])):
                raise SystemExit(f'{w}.rotIf：第 {k} 組不存在')
        out.append(e)
        seen.add(sid)
    miss = [k for k in CFG if k not in seen]
    if miss:
        raise SystemExit(f'稿裡少了 {miss}')
    return out


# CANON-NO-ECON-1112 第五批（AA_920 ⑩，企劃線 96c3a668eb）：可昕週末那一格整格新字（稿 AA_722 那一格還是舊前提）。照 id 換；稿那一格的句數要和現在一樣，對不到就停
B920 = {'kx_mzu_lib': {
    'label': '週末和她去系館自習室',
    'acc': ['「好。系館，一點。」'],
    'first': ['（週末的法律系館。自習室只有你們兩個，窗外是椰影大道。）', '「你坐這裡。這是我的位子，今天借你。」', '（她讀民法，你讀你的。讀到一半，外面起風了。）',
              '（她把窗簾拉開一點，讓你看椰子樹在晃。）', '「我讀不下去的時候，就看這個。」'],
    'rot': [['（今天下雨。自習室裡很安靜，只有雨的聲音。）', '「下雨的時候，這裡最好讀書。」'], ['（讀完，她帶你去溫州街吃晚餐。老闆不問她要什麼。）'], None]}}   # None＝照留


def b920(slots):
    for e in slots:
        c = B920.get(e['id'])
        if not c:
            continue
        if len(e['acc']) != 1 or len(e['first']) != 7 or len(e['rot']) != 3:
            raise SystemExit(f'AA_920 ⑩ {e["id"]}：稿那一格的句數變了（acc {len(e["acc"])}、first {len(e["first"])}、rot {len(e["rot"])}），先看稿')
        e['label'], e['acc'], e['first'] = c['label'], list(c['acc']), list(c['first'])
        e['rot'] = [list(n) if n is not None else o for o, n in zip(e['rot'], c['rot'])]
    return slots


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{PATH}：不在匯入白名單')
    sha = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = {'src': f'{PATH}@{sha}', 'slots': b920(build(json.loads(git('show', f'{sha}:{PATH}'))))}
    js = ('/* 自動產生：tools/story/import_study_slots.py（' + data['src'] + '）。不要手改，改企劃 AA_722（台詞）或匯入工具的 CFG（時間、錢、怎麼演）再重新匯入。\n'
          '   一起念書第 6 次解鎖的「她那一格」：src/studyslot3d.js 讀 */\n'
          "'use strict';\nconst STUDY_SLOTS=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, [s['id'] for s in data['slots']])


if __name__ == '__main__':
    main()
