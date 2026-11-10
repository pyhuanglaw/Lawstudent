#!/usr/bin/env python3
"""節日、生日送禮（GIFT-HOLIDAY-1110；USER_WANTS X276、X277、X278、X291）。
企劃（AA 定稿 D109，企劃線）：
  AA_732 docs/story_planning/AA_732_gift_holiday_1.json：規則、14 家店 57 樣、third、special、學姊的反應
  AA_733 docs/story_planning/AA_733_gift_holiday_2.json：以安、芷若、語彤、子晴、沛珊、可昕、芯慈的反應
  AA_734 docs/story_planning/AA_734_gift_holiday_3.json：她們送祐廷的禮物（gate、how、people）、山嵐文具區學姊四場（stationery）
→ src/data/gift_holiday.js（GIFT_HOLIDAY）。播放 src/gifthol3d.js。
- 三份來源都一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 讀稿照 import_guard.read_fix；有名字說的那一句外面不加「」（TEXT-QUOTE-UNIFY-1108），稿裡有就停下來。
- 台詞一字不改；只整理結構：
    shops：店 key → {name, note, items}；山嵐書店兩份清單（書架、文具區）都是 xs_shanlan，文具區那一份改 key「xs_shanlan_stationery」（名字裡有「文具區」）。
    items：禮物 id → {name, price, line, love, no, shop}；special 兩樣 shop＝'special'（不用買、only＝只有那一位的選單會列）。
    react：八位（學姊在 AA_732、其他七位在 AA_733）→ {name, open, item, love, ok, no}。
    give：AA_734 people（她們送的）；gate、how、stationery 原樣帶過去（程式的判斷寫在 gifthol3d.js，這裡只核對結構）。
- 核對（對不上就停下來，AA 改了稿要重看）：反應的 item id 都在店家清單或 special；band 只有 A／B／C／D／*；open 四個節（xmas、vday、qixi、bday）每格 A～D；
  her 的禮物格只有 B／C／D／D2、每格 item＋scene＋lines；stationery 四場 id 照 sl_sis_1／2／3／rot。
用法：python3 tools/gift/import_gift_holiday.py [--check]"""
import json, os, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

P1 = 'docs/story_planning/AA_732_gift_holiday_1.json'
P2 = 'docs/story_planning/AA_733_gift_holiday_2.json'
P3 = 'docs/story_planning/AA_734_gift_holiday_3.json'
OUT = 'src/data/gift_holiday.js'
FEST = ('xmas', 'vday', 'qixi', 'bday')
BANDS = ('A', 'B', 'C', 'D')
PEOPLE = ('heroine_01', 'heroine_02', 'heroine_03', 'heroine_04', 'heroine_05', 'classmate_peishan', 'kexin', 'classmate_xinci')


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


def lines(v, where):
    if not isinstance(v, list) or not v:
        raise SystemExit(f'{where}：要是非空的句子陣列')
    return [txt(t, f'{where}[{i}]') for i, t in enumerate(v)]


def fix_all(x, where):
    """stationery、gate、how：字串一律 read_fix，結構原樣。"""
    if isinstance(x, str):
        return txt(x, where)
    if isinstance(x, list):
        return [fix_all(v, f'{where}[{i}]') for i, v in enumerate(x)]
    if isinstance(x, dict):
        return {k: fix_all(v, f'{where}.{k}') for k, v in x.items()}
    return x


def build_react(pid, P, ids, where):
    out = {'name': txt(P['name'], where + '.name')}
    O = P.get('open') or {}
    if sorted(O) != sorted(FEST):
        raise SystemExit(f'{where}.open：要剛好是 {FEST}（現在 {sorted(O)}）')
    out['open'] = {}
    for k in FEST:
        if sorted(O[k]) != sorted(BANDS):
            raise SystemExit(f'{where}.open.{k}：要剛好是 A～D（現在 {sorted(O[k])}）')
        out['open'][k] = {b: lines(O[k][b], f'{where}.open.{k}.{b}') for b in BANDS}
    out['item'] = {}
    for gid, cell in (P.get('item') or {}).items():
        if gid not in ids:
            raise SystemExit(f'{where}.item.{gid}：店家清單、special 都沒有這一樣')
        bad = [b for b in cell if b not in BANDS + ('*',)]
        if bad:
            raise SystemExit(f'{where}.item.{gid}：band 不認得 {bad}')
        out['item'][gid] = {b: lines(v, f'{where}.item.{gid}.{b}') for b, v in cell.items()}
    for cat in ('love', 'ok', 'no'):
        C = P.get(cat) or {}
        if sorted(C) != sorted(BANDS):
            raise SystemExit(f'{where}.{cat}：要剛好是 A～D（現在 {sorted(C)}）')
        out[cat] = {b: lines(C[b], f'{where}.{cat}.{b}') for b in BANDS}
    return out


def build_give(pid, P, where):
    out = {}
    for k, allowed_b in (('xmas', ('B', 'C', 'D', 'D2')), ('vday', ('C', 'D', 'D2')), ('qixi', ('C', 'D'))):
        C = P.get(k)
        if not isinstance(C, dict) or not C:
            raise SystemExit(f'{where}.{k}：沒有')
        bad = [b for b in C if b not in allowed_b]
        if bad:
            raise SystemExit(f'{where}.{k}：band 不認得 {bad}（{k} 只有 {allowed_b}）')
        out[k] = {}
        for b, cell in C.items():
            if sorted(cell) != ['item', 'lines', 'scene']:
                raise SystemExit(f'{where}.{k}.{b}：要有 item、scene、lines（現在 {sorted(cell)}）')
            out[k][b] = {'item': txt(cell['item'], f'{where}.{k}.{b}.item'), 'scene': txt(cell['scene'], f'{where}.{k}.{b}.scene'),
                         'lines': lines(cell['lines'], f'{where}.{k}.{b}.lines')}
    out['youHadNone'] = txt(P['youHadNone'], where + '.youHadNone')
    out['late'] = txt(P['late'], where + '.late')
    out['existing'] = [txt(t, f'{where}.existing') for t in (P.get('existing') or [])]
    return out


def build(d1, d2, d3, shas):
    shops, items = {}, {}
    for i, s in enumerate(d1['shops']):
        key = s['shop'] + ('_stationery' if '文具區' in s['name'] else '')
        if key in shops:
            raise SystemExit(f'AA_732 shops：店 key 重複 {key}')
        shops[key] = {'name': txt(s['name'], f'shops[{i}].name'), 'items': []}
        if s.get('note'):
            shops[key]['note'] = txt(s['note'], f'shops[{i}].note')
        for j, it in enumerate(s['items']):
            gid = it['id']
            if gid in items:
                raise SystemExit(f'AA_732：禮物 id 重複 {gid}')
            for p in it.get('love', []) + it.get('no', []):
                if p not in PEOPLE:
                    raise SystemExit(f'AA_732 {gid}：love／no 的 {p} 不是可以送的八位')
            if not isinstance(it.get('price'), int) or it['price'] <= 0:
                raise SystemExit(f'AA_732 {gid}：價錢要是正整數')
            items[gid] = {'name': txt(it['name'], f'{gid}.name'), 'price': it['price'], 'line': txt(it['line'], f'{gid}.line'),
                          'love': list(it.get('love', [])), 'no': list(it.get('no', [])), 'shop': key}
            shops[key]['items'].append(gid)
    for sp in d1['special']:
        gid = sp['id']
        if gid in items:
            raise SystemExit(f'AA_732 special：id 重複 {gid}')
        items[gid] = {'name': txt(sp['name'], f'{gid}.name'), 'price': 0, 'how': txt(sp['how'], f'{gid}.how'),
                      'love': list(sp.get('love', [])), 'no': [], 'only': list(sp.get('only', [])), 'shop': 'special'}
    react = {}
    react['heroine_05'] = build_react('heroine_05', d1['people']['heroine_05'], items, 'AA_732.people.heroine_05')
    for pid, P in d2['people'].items():
        react[pid] = build_react(pid, P, items, f'AA_733.people.{pid}')
    if sorted(react) != sorted(PEOPLE):
        raise SystemExit(f'反應：要剛好是八位（現在 {sorted(react)}）')
    give = {pid: build_give(pid, P, f'AA_734.people.{pid}') for pid, P in d3['people'].items()}
    if sorted(give) != sorted(PEOPLE):
        raise SystemExit(f'她送的：要剛好是八位（現在 {sorted(give)}）')
    st = d3['stationery']
    ids = [s['id'] for s in st['scenes']]
    if ids != ['sl_sis_1', 'sl_sis_2', 'sl_sis_3', 'sl_sis_rot']:
        raise SystemExit(f'AA_734 stationery.scenes：要是 sl_sis_1／2／3／rot（現在 {ids}）')
    if len(st.get('hint') or []) != 2:
        raise SystemExit('AA_734 stationery.hint：要兩則（鋼筆、皮的筆袋）')
    return {'src': [f'{P1}@{shas[0]}', f'{P2}@{shas[1]}', f'{P3}@{shas[2]}'],
            'third': lines(d1['third'], 'AA_732.third'),
            'shops': shops, 'items': items, 'react': react, 'give': give,
            'gate': fix_all(d3['gate'], 'AA_734.gate'), 'how': fix_all(d3['how'], 'AA_734.how'),
            'stationery': fix_all(st, 'AA_734.stationery')}


def main():
    allow = IG.load(ROOT)
    shas, whys = [], []
    for p in (P1, P2, P3):
        s, w = src_sha(allow, p)
        shas.append(s)
        whys.append(w)
    d = [json.loads(git('show', f'{s}:{p}')) for s, p in zip(shas, (P1, P2, P3))]
    data = build(d[0], d[1], d[2], shas)
    js = ('/* 自動產生：tools/gift/import_gift_holiday.py（' + '、'.join(data['src']) + '）。不要手改，改企劃 AA_732／AA_733／AA_734 再重新匯入。\n'
          '   節日、生日送禮（GIFT-HOLIDAY-1110；播放 src/gifthol3d.js）：shops／items＝店家禮物、react＝八位收到的反應、give＝她們送祐廷的、stationery＝山嵐文具區學姊四場 */\n'
          "'use strict';\nconst GIFT_HOLIDAY=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=GIFT_HOLIDAY;\n")
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和白名單上的 AA_732／733／734 不一樣：重新匯入')
        print('OK', *whys)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, *whys)
    print(' 店：', {k: len(v['items']) for k, v in data['shops'].items()}, '共', len(data['items']), '樣（含 special）')


if __name__ == '__main__':
    main()
