#!/usr/bin/env python3
"""故事線的「下次帶你去」變成真的約（AA_716；STUDY-DATE-PROGRESS-1107、USER_WANTS X263）。
企劃 AA_716（docs/story_planning/AA_716_arc_invites.json，企劃線）→ src/data/arc_invites.js（ARC_INV）。播放：src/arcinv3d.js。
稿裡的「演完以後第 2 天 21:00」「週六（next＝下週六）」是文字：這裡逐項寫成 CFG（訊息什麼時候傳、約哪一天幾點、車程、場景背景）；
CFG 和稿對不上（多一項、少一項、拍數不同）就停下來。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_arc_invites.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_716_arc_invites.json'
OUT = 'src/data/arc_invites.js'
PLANS = {'this', 'next', 'late', 'none'}
# offer：dd＝拍演完以後第幾天（0＝當天）、h＝幾點；'break'＝沛珊（下一個寒暑假開始前 3 天 21:00，消失期例外）
# day：this／next 怎麼算（arcinv3d.js S.planDay）；hours＝那一場演多久；bg：[第一幕標籤, 圖]；bgAt：[[那一行含的字, 標籤, 圖]]
CFG = {
    'heroine_03:7': {'offer': {'dd': 2, 'h': 21}, 'day': 'sat', 'hours': 4, 'travelH': 55 / 60, 'end': {'home': True},
                     'bg': ['淡水', 'd13_base_sunset'], 'bgAt': []},
    'heroine_04:3': {'offer': {'dd': 1, 'h': 20}, 'day': 'nextwed', 'hours': 1.5, 'travelH': 5 / 60, 'end': {'spot': '新體育館（大廳）', 'back': '新體育館。'},
                     'bg': ['新體育館 B1・健身中心', 'gym_b1_fitness'], 'bgAt': []},   # LAWWW2-B AA716-GYM-BG（1c5696b4b）
    'heroine_05:3': {'offer': {'dd': 0, 'h': 21.5}, 'day': 'same', 'hours': 1, 'travelH': 0.1, 'end': {'zone': 'campus', 'x': -38, 'z': -98.4, 'yaw': 3.14159, 'back': '映月湖。'},
                     'bg': ['總圖門口', 'library_gate_night'], 'bgAt': [['椰影大道', '首都帝大・椰影大道', 'ntu_avenue'], ['映月湖', '映月湖', 'zuiyue_night']]},
    'heroine_05:7': {'offer': {'dd': 2, 'h': 21}, 'day': 'fri', 'hours': 1.5, 'travelH': 10 / 60, 'end': {'spot': '公館商圈', 'back': '公館。'},
                     'bg': ['公館', 'gongguan'], 'bgAt': [['河堤', '河濱', 'riverside']]},
    'classmate_peishan:6': {'offer': 'break', 'day': 'break', 'hours': 6, 'travelH': 2, 'end': {'home': True},
                            'bg': ['宜蘭・外澳', 'trip_sea'], 'bgAt': []},
    'kexin:6': {'offer': {'dd': 0, 'h': 21}, 'day': 'satsun', 'hours': 2, 'travelH': 10 / 60, 'cost': 590, 'end': {'spot': '公館商圈', 'back': '公館。'},
                'bg': ['公館', 'gongguan'], 'bgAt': []},
}
# CANON-NO-ECON-1112 第三批（AA_892 第 1 節：可昕第 4 拍「兩間學校」整拍＋邀約拿掉）：稿裡還在，這裡不匯
DROP = {'kexin:4'}
MARK = re.compile(r'^@(early|late|fit|unfit)')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def L(v, w, need=True):
    if v is None and not need:
        return []
    if not isinstance(v, list) or (need and not v) or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.read_fix(t) for t in v]


def build(src, sha):
    out, seen = [], set()
    for hid, v in src.items():
        if hid.startswith('_'):
            continue
        for x in (v if isinstance(v, list) else [v]):
            key = f'{hid}:{x["beat"]}'
            w = f'AA_716 {key}'
            if key in DROP:
                continue
            if key not in CFG:
                raise SystemExit(f'{w}：CFG 沒有這一項（新加的約要在 import_arc_invites.py 寫訊息時間、日期規則）')
            seen.add(key)
            c = CFG[key]
            of = x['offer']
            opts = []
            for i, o in enumerate(of['opts']):
                if o.get('plan') not in PLANS:
                    raise SystemExit(f'{w}.offer.opts[{i}].plan「{o.get("plan")}」：不認得')
                opts.append({'t': IG.read_fix(o['t']), 'rel': o.get('rel') or {}, 'say': L(o.get('say'), f'{w}.opts[{i}].say', False), 'plan': o['plan']})
            sk = of.get('skip') or {}
            scene = L(x['scene'], w + '.scene')
            for t in scene:
                if t.startswith('@') and not MARK.match(t):
                    raise SystemExit(f'{w}.scene「{t[:20]}」：不認得的 @ 標記')
            for k, lab, bg in c['bgAt']:
                if not any(k in t for t in scene):
                    raise SystemExit(f'{w}.bgAt「{k}」：場景裡找不到')
            by = {}
            for mem, b in (x.get('by') or {}).items():
                e = {}
                for k in ('msgs', 'scene0', 'end'):
                    if b.get(k):
                        e[k] = L(b[k], f'{w}.by.{mem}.{k}')
                if set(b) - {'msgs', 'scene0', 'end'}:
                    raise SystemExit(f'{w}.by.{mem}：不認得 {set(b) - {"msgs", "scene0", "end"}}')
                by[mem] = e
            P = x['plan']
            e = {'key': key, 'who': hid, 'n': int(x['beat']), 'msgs': L(of['msgs'], w + '.msgs'), 'opts': opts,
                 'skip': L(sk.get('say'), w + '.skip.say', False), 'scene': scene, 'by': by, 'set': x.get('set'),
                 'noPlan': L(x.get('noPlan'), w + '.noPlan', False),
                 'place': IG.read_fix(P['place']), 'title': IG.read_fix(P['title']), 'travel': IG.read_fix(P.get('travel', '')),
                 'h': P['h'], 'hLate': P.get('hLate'), 'dateLoc': P.get('dateLoc')}
            e.update({k: c[k] for k in ('offer', 'day', 'hours', 'travelH', 'bg', 'bgAt', 'end')})   # end：演完人在哪（BB-B 11-07：學姊騎車演完回到已經閉館的總圖大廳）
            if c.get('cost'):
                e['cost'] = c['cost']
            if hid == 'classmate_peishan':
                e['noPlanMsg'] = True   # 稿的 note：noPlan 是她一個人去那天傳的照片（不是見面的輪換句）
            out.append(e)
    miss = set(CFG) - seen
    if miss:
        raise SystemExit(f'CFG 有、稿裡沒有：{sorted(miss)}')
    return {'src': f'{PATH}@{sha}', 'list': out}


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
    js = ('/* 自動產生：tools/story/import_arc_invites.py（' + data['src'] + '）。不要手改，改企劃 AA_716 再重新匯入。\n'
          '   故事線的「下次帶你去」變成真的約（播放 src/arcinv3d.js）*/\n'
          "'use strict';\nconst ARC_INV=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, [e['key'] for e in data['list']])


if __name__ == '__main__':
    main()
