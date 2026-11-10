#!/usr/bin/env python3
"""南洋戲院片單（MOVIE-REAL-1110；USER_WANTS X274）。
使用者 11-10 01:1x（經 LAWWW-B）：「約看電影 根本沒進場 還在買票區的椅子上就看完了? 而且應該要有什麼電影的資訊吧
至少你可以規定大幾的幾月到幾月是什麼電影? 再跟我要電影海報 請AA寫是什麼電影 BB跟我要電影海報」
企劃（AA 定稿 D109，企劃線）：AA_730 docs/story_planning/AA_730_nanyang_movies.json
→ src/data/nanyang_movies.js（NANYANG_MOVIES）。播放、選片 src/movies3d.js（選片規則照 AA_730 pick，寫在程式裡）。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix；有名字說的外面不加「」（TEXT-QUOTE-UNIFY-1108），稿裡有就停下來。
- 片名、一句話、看板、燈暗、一個人看的三句一字不改；只整理結構（pick、_meta 不帶過去：規則寫在 movies3d.js）。
- 核對（對不上就停下來，AA 改了稿要重看）：36 段、兩個月一段、從 2024-09 接到 2030-08 不跳；每段兩部 slot 1、2；
  id＝m＋年後兩位＋月＋a／b（海報檔名）；tags 只能是 _meta 列的 17 種；fits、sceneFilm 的人只能是七位；
  sceneFilm 的場次只能是數字或 rot.數字、條件只能是 want／not／billHas（why 是註解）；看板有 {big}{small}、燈暗有 {title}。
用法：python3 tools/movie/import_nanyang_movies.py [--check]"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

SRC = 'docs/story_planning/AA_730_nanyang_movies.json'
OUT = 'src/data/nanyang_movies.js'
TAGS = ('action', 'scifi', 'anime', 'comedy', 'romance', 'court', 'mystery', 'doc', 'drama', 'family', 'sports', 'music', 'art',
        'cat', 'library', 'bookstore', 'long')
PEOPLE = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin')


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def src_sha(allow, path):
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits:
        raise SystemExit(f'{path}：不在匯入白名單')
    sha = hits[-1]['sha']
    ok, why = IG.allowed(path, sha, allow)
    if not ok:
        raise SystemExit(why)
    return sha, why


def txt(t, where):
    if not isinstance(t, str) or not t.strip():
        raise SystemExit(f'{where}：要是非空字串')
    s = IG.read_fix(t)
    if s.startswith('「') and s.endswith('」'):
        raise SystemExit(f'{where}「{s}」：有名字說的不在外面加「」（TEXT-QUOTE-UNIFY-1108）')
    return s


def ym_next(y, m, k=2):
    m += k
    while m > 12:
        m -= 12
        y += 1
    return y, m


def build(d, sha):
    P = d.get('periods')
    if not isinstance(P, list) or len(P) != 36:
        raise SystemExit(f'periods：要 36 段（現在 {len(P) if isinstance(P, list) else P}）')
    y, m = 2024, 9
    out, ids = [], set()
    for i, p in enumerate(P):
        w = f'periods[{i}]'
        fr, to = f'{y:04d}-{m:02d}', '%04d-%02d' % ym_next(y, m, 1)
        if p.get('from') != fr or p.get('to') != to:
            raise SystemExit(f'{w}：要 {fr}～{to}（現在 {p.get("from")}～{p.get("to")}）')
        B = p.get('bill')
        if not isinstance(B, list) or len(B) != 2:
            raise SystemExit(f'{w}.bill：要兩部')
        bill = []
        for j, b in enumerate(B):
            wb = f'{w}.bill[{j}]'
            slot = j + 1
            want_id = 'm%02d%02d%s' % (y % 100, m, 'ab'[j])
            if b.get('slot') != slot or b.get('id') != want_id:
                raise SystemExit(f'{wb}：slot／id 要是 {slot}／{want_id}（現在 {b.get("slot")}／{b.get("id")}）')
            if want_id in ids:
                raise SystemExit(f'{wb}：id 重複')
            ids.add(want_id)
            tg = b.get('tags')
            if not isinstance(tg, list) or not tg or any(t not in TAGS for t in tg):
                raise SystemExit(f'{wb}.tags：只能是 {TAGS}（現在 {tg}）')
            ft = b.get('fits')
            if not isinstance(ft, list) or any(f not in PEOPLE for f in ft):
                raise SystemExit(f'{wb}.fits：只能是 {PEOPLE}（現在 {ft}）')
            bill.append({'id': want_id, 'slot': slot, 'title': txt(b.get('title'), wb + '.title'), 'genre': txt(b.get('genre'), wb + '.genre'),
                         'line': txt(b.get('line'), wb + '.line'), 'tags': list(tg), 'fits': list(ft)})
        out.append({'from': fr, 'to': to, 'term': txt(p.get('term'), w + '.term'), 'bill': bill})
        y, m = ym_next(y, m)
    if (y, m) != (2030, 9):
        raise SystemExit('periods：最後一段要到 2030-08')
    SF = d.get('sceneFilm') or {}
    sf = {}
    for pid, sc in SF.items():
        if pid not in PEOPLE:
            raise SystemExit(f'sceneFilm.{pid}：不認得的人')
        sf[pid] = {}
        for k, r in sc.items():
            if not re.fullmatch(r'\d+|rot\.\d+', k):
                raise SystemExit(f'sceneFilm.{pid}.{k}：場次要是數字或 rot.數字')
            bad = [x for x in r if x not in ('want', 'not', 'billHas', 'why')]
            if bad or not any(x in r for x in ('want', 'not', 'billHas')):
                raise SystemExit(f'sceneFilm.{pid}.{k}：條件只能是 want／not／billHas（現在 {list(r)}）')
            rr = {}
            for x in ('want', 'not', 'billHas'):
                if x in r:
                    if not isinstance(r[x], list) or not r[x] or any(t not in TAGS for t in r[x]):
                        raise SystemExit(f'sceneFilm.{pid}.{k}.{x}：只能是 tags 裡的字（現在 {r[x]}）')
                    rr[x] = list(r[x])
            if 'why' in r:
                rr['why'] = txt(r['why'], f'sceneFilm.{pid}.{k}.why')
            sf[pid][k] = rr
    nb, dt = txt(d.get('nowBoard'), 'nowBoard'), txt(d.get('dimTitle'), 'dimTitle')
    if '{big}' not in nb or '{small}' not in nb:
        raise SystemExit('nowBoard：要有 {big}、{small}')
    if '{title}' not in dt:
        raise SystemExit('dimTitle：要有 {title}')
    solo = d.get('solo')
    if not isinstance(solo, list) or len(solo) != 3:
        raise SystemExit('solo：要三句')
    solo = [txt(t, f'solo[{i}]') for i, t in enumerate(solo)]
    return {'src': f'{SRC}@{sha}', 'nowBoard': nb, 'dimTitle': dt, 'solo': solo, 'sceneFilm': sf, 'periods': out}


def main():
    allow = IG.load(ROOT)
    sha, why = src_sha(allow, SRC)
    d = json.loads(git('show', f'{sha}:{SRC}'))
    data = build(d, sha)
    js = ('/* 自動產生：tools/movie/import_nanyang_movies.py（' + data['src'] + '）。不要手改，改企劃 AA_730 再重新匯入。\n'
          '   南洋戲院片單（MOVIE-REAL-1110）：periods＝每兩個月一段、一段兩部（slot 1 第一部、2 第二部；id＝海報檔名 assets/posters/<id>.webp）；\n'
          '   sceneFilm＝AA_708 電影第幾場要挑哪一種片；nowBoard＝大廳黑板、dimTitle＝燈暗那一句、solo＝一個人看的三句。選片、播放在 src/movies3d.js */\n'
          "'use strict';\nconst NANYANG_MOVIES=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=NANYANG_MOVIES;\n")
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和白名單上的 AA_730 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)
    print(' ', len(data['periods']), '段', sum(len(q['bill']) for q in data['periods']), '部；sceneFilm', {k: len(v) for k, v in data['sceneFilm'].items()})


if __name__ == '__main__':
    main()
