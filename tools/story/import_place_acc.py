#!/usr/bin/env python3
"""新約會地點的答應句＋第一次一起去的那一句（INVITE-PLACES-1107；使用者 11-07「有的店面都可以約吧 看書或吃飯或聊天 南洋戲院可以約看電影」）。
企劃 AA_714（docs/story_planning/AA_714_invite_places_acc.json，企劃線）→ src/data/invite_place_lines.js（INVITE_PLACE_LINES，載入時併進 INVITE_DATA.people[人].acc／firstAt，
和 afarAcc／daybreakAcc 同一套：src/invites3d.js 的 S.personal 讀 acc、S.firstAt 讀 firstAt）。白名單照 import_guard；讀稿照 read_fix。
用法：python3 tools/story/import_place_acc.py [--ref <commit>] [--check]"""
import json, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_714_invite_places_acc.json'
OUT = 'src/data/invite_place_lines.js'
PLACES = ('soclib', 'wz_lin', 'wz_teishoku', 'xs_dakou', 'xs_nanyang', 'bookstore', 'xs_shanlan')
# 第二批：118 巷的店（AA_721；店 id＝區域 id，src/data/invites.js 最後那一段）
PATH2 = 'docs/story_planning/AA_721_l118_invite_acc.json'
PLACES2 = ('l118_dian', 'l118_self', 'l118_tea', 'l118_home', 'l118_cafe2', 'l118_korea', 'l118_omu', 'l118_noodle2', 'l118_drink_a', 'l118_drink_b')   # L118-SHOPS-REDO-1111（AA_721 @ef7280917）：十個位置（多 l118_cafe2、兩間外帶飲料店）


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def lines(v, w):
    """答應句（acc）、第一次去的那一句（firstAt）：src/invites3d.js 的 S.playLines 在對話框寫她的名字說（（…）開頭的是旁白）——
    有名字說的拿掉外面那一對「」（AA-B 2026-11-08 00:21／01:09，TEXT-QUOTE-UNIFY-1108；IG.unq，旁白、「A」「B」好幾段的不動），其他一字照稿"""
    if not isinstance(v, list) or not v or not all(isinstance(t, str) and t.strip() for t in v):
        raise SystemExit(f'{w}：要是非空字串的陣列')
    return [IG.unq(IG.read_fix(t)) for t in v]


def build(src, sha, places=PLACES, out=None):
    out = {} if out is None else out
    for pid, v in src.items():
        if pid.startswith('_'):
            continue
        if pid not in places:
            raise SystemExit(f'{pid}：不是 INVITE-PLACES-1107 的地點（{places}）')
        out[pid] = {}
        for hid, e in v.items():
            w = f'{pid}.{hid}'
            q = {}
            if e.get('acc'):
                q['acc'] = lines(e['acc'], w + '.acc')
            if e.get('firstAt'):
                q['firstAt'] = lines(e['firstAt'], w + '.firstAt')
            if e.get('no'):
                if not isinstance(e['no'], str):
                    raise SystemExit(f'{w}.no：要是一句話')
                q['no'] = IG.read_fix(e['no'])   # 「」照留：沒有名字（選單灰掉的說明、GM.say(null,…)，src/invites3d.js S.placeWhy）。她不會去（AA_721：可昕平日在木柵，好家自助餐只開平日）：那一格照出、灰掉，說明＝她那句
            out[pid][hid] = q
    return out


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
    places = build(json.loads(git('show', f'{sha}:{PATH}')), sha)
    h2 = [e for e in allow.get('files', []) if e.get('path') == PATH2 and e.get('status') == 'approved']
    if not h2:
        raise SystemExit(f'{PATH2}：不在匯入白名單')
    sha2 = h2[-1]['sha']
    ok2, why2 = IG.allowed(PATH2, sha2, allow)
    if not ok2:
        raise SystemExit(why2)
    build(json.loads(git('show', f'{sha2}:{PATH2}')), sha2, PLACES2, places)
    data = {'src': f'{PATH}@{sha}', 'src2': f'{PATH2}@{sha2}', 'places': places}
    why = why + '；' + why2
    js = ('/* 自動產生：tools/story/import_place_acc.py（' + data['src'] + '、' + data['src2'] + '）。不要手改，改企劃 AA_714／AA_721 再重新匯入。\n'
          '   新約會地點的答應句、第一次一起去的那一句（INVITE-PLACES-1107）：載入時併進 INVITE_DATA.people（要在 src/data/invites.js 後面載入）。\n'
          '   acc、firstAt 有名字說的台詞外面不加「」（AA-B 2026-11-08，稿上有；（…）是旁白）；no（灰掉的說明，沒有名字）照稿*/\n'
          "'use strict';\nconst INVITE_PLACE_LINES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "(function(){ if(typeof INVITE_DATA==='undefined') return; const P=INVITE_DATA.people||(INVITE_DATA.people={});\n"
          "  for(const pid in INVITE_PLACE_LINES.places) for(const id in INVITE_PLACE_LINES.places[pid]){ const e=INVITE_PLACE_LINES.places[pid][id], p=P[id]||(P[id]={});\n"
          "    if(e.acc&&!(p.acc&&p.acc[pid])) (p.acc||(p.acc={}))[pid]=e.acc.slice(); if(e.firstAt&&!(p.firstAt&&p.firstAt[pid])) (p.firstAt||(p.firstAt={}))[pid]=e.firstAt.slice();\n"
          "    if(e.no){ const PL=(INVITE_DATA.places||[]).find(q=>q.id===pid); if(PL) (PL.noWho||(PL.noWho={}))[id]=e.no; } } })();\n")
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import aa959 as _AA959   # AA_959（DLG-FULL-REVIEW-1110，LAWWW 11-13 選 (a)）：源稿不動、寫檔前最後一步照 docs/handoff/AA_959_overlay.json 換（tools/story/aa959.py）
    js = _AA959.layer(js, 'invite_place_lines.js')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why, {k: len(v) for k, v in data['places'].items()})


if __name__ == '__main__':
    main()
