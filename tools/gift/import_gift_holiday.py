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
花序 Flower Notes（FLOWER-NOTES-1110，USER_WANTS X325）：AA_792 docs/story_planning/AA_792_flower_notes.json 疊在 gg_flower 上（overlay_792）——
  - replace 四列（店名、note、一束花和向日葵的 line）：at 那一格要剛好是 old、old 在整份資料裡只出現一次，才換成 new；對不上就停下來。
  - 十樣商品：原本兩樣（g_bouquet、g_sunflower）的 id、名字、價錢、love、no 一定要和 AA_732 一樣（只換 line）；新的八樣（g_fn_*）love、no 一定是空的（X325「不替角色設定新的花卉喜好」）。
  - 花藝師的句子（staff：greet、closed、hours、buy）和店裡每一區的「看」（looks；key 要是 src/data/flower_notes_layout.js 有的 kind）→ src/data/flower_notes_text.js（FLOWER_NOTES_TEXT；播放 src/flower_notes_sys3d.js）。
  白名單沒有 AA_792＝停下來。
  AA_792 @ 4021747069（AA 11-12 回 LAWWW-C 六問，_meta.lawww_1112；STALE-SOURCES-1112）多的欄位：
  - looks.plinth_center（店中央展示台的「看」）：kind＝配置的 display（中央橢圓展示台；模型 tools/blender/env_second/flower_notes_interior.py 有做）。
  - look_buttons：每一個「看」的按鈕字（key 要和 looks 一模一樣）→ FLOWER_NOTES_TEXT.lookButtons。
  - staff.closed_line（21:00 人還在店裡，花藝師說）：一定要等於 AA_700 那一句（src/xs_close3d.js 的 S.LINE——遊戲演的是那一支），不一樣就停下來 → staff.closeLine。
  - staff.not_open（開門以前到門口的旁白，不演「今日已打烊」）→ staff.notOpen。
  - staff.typhoon：不是台詞，是規則「照公館其他店：颱風天休息。」→ staff.typhoonOff=true（寫法變了就停下來重看）。
  - give_ok_flower：八樣新花（g_fn_*，love、no 都空）送人時各人的一句，取代各人通用的 ok 句 → GIFT_HOLIDAY.flowerOk {items, lines}（播放 src/gifthol3d.js）。
    稿沒寫到的人（芯慈）照舊用通用的 ok 句：印出來提醒。
用法：python3 tools/gift/import_gift_holiday.py [--check]"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG
IG.use_canon897()   # CANON-NO-ECON-1112 第四批：讀稿再照 AA_897 第 2 節換整句（tools/story/canon897_fix.json）

P1 = 'docs/story_planning/AA_732_gift_holiday_1.json'
P2 = 'docs/story_planning/AA_733_gift_holiday_2.json'
P3 = 'docs/story_planning/AA_734_gift_holiday_3.json'
OUT = 'src/data/gift_holiday.js'
P792 = 'docs/story_planning/AA_792_flower_notes.json'
OUT792 = 'src/data/flower_notes_text.js'
FN_LAYOUT = 'src/data/flower_notes_layout.js'
FN_SHOP = 'gg_flower'
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


def leaves(x):
    if isinstance(x, str):
        yield x
    elif isinstance(x, list):
        for v in x:
            yield from leaves(v)
    elif isinstance(x, dict):
        for v in x.values():
            yield from leaves(v)


def layout_kinds():
    """花序配置裡有的 kind（展示台 plinth 照上面放的東西分 plinth_dome、plinth_giftbox；收銀櫃檯 counter 是配置的 counter）。"""
    raw = open(os.path.join(ROOT, FN_LAYOUT), encoding='utf-8').read()
    L = json.loads(raw[raw.index('\nconst FLOWER_NOTES_LAYOUT=') + len('\nconst FLOWER_NOTES_LAYOUT='):].strip().rstrip(';'))   # 開頭的註解裡也有這個名字：找行首的那一個
    kinds = {'counter'} if L.get('counter') else set()
    if L.get('display'):   # 中央橢圓展示台（配置的 display；配置的 looks 也有 id display 的位置）＝稿的 plinth_center
        kinds.add('plinth_center')
    for it in L['items0'] + L['items1']:
        kinds.add(it['kind'] + ('_' + it['top'] if it['kind'] == 'plinth' else ''))
    return kinds


def overlay_792(data, d, sha, kinds):
    """AA_792 疊在 data（gift_holiday）的 gg_flower 上；回傳 flower_notes_text 的資料。對不上就停下來。"""
    W = 'AA_792'
    shop = d['shop']
    if shop.get('id') != FN_SHOP or FN_SHOP not in data['shops']:
        raise SystemExit(f'{W} shop.id：要是 {FN_SHOP}（現在 {shop.get("id")}）')
    # replace：at 那一格＝old、old 只出現一次 → new
    for i, r in enumerate(d['replace']):
        if r.get('file') != OUT:
            raise SystemExit(f'{W} replace[{i}].file：只認 {OUT}（現在 {r.get("file")}）')
        ks = r['at'].split('.')
        cell = data
        for k in ks[:-1]:
            if not isinstance(cell, dict) or k not in cell:
                raise SystemExit(f'{W} replace[{i}].at {r["at"]}：找不到 {k}')
            cell = cell[k]
        if not isinstance(cell, dict) or cell.get(ks[-1]) != r['old']:
            raise SystemExit(f'{W} replace[{i}] {r["at"]}：現在不是 old「{r["old"]}」')
        n = sum(t.count(r['old']) for t in leaves(data))
        if n != 1:
            raise SystemExit(f'{W} replace[{i}]：old「{r["old"]}」在 {OUT} 出現 {n} 次（要剛好 1 次）')
        cell[ks[-1]] = txt(r['new'], f'{W}.replace[{i}].new')
    S = data['shops'][FN_SHOP]
    if S['name'] != txt(shop['name'], W + '.shop.name') or S.get('note') != txt(shop['note'], W + '.shop.note'):
        raise SystemExit(f'{W}：replace 換完的店名、note 和 shop 的不一樣')
    ids = list(shop['items'])
    if ids[:len(S['items'])] != S['items'] or len(set(ids)) != len(ids) or sorted(ids) != sorted(d['items']):
        raise SystemExit(f'{W} shop.items：原本的 {S["items"]} 要照舊排在最前面、不能重複、要和 items 的 key 一樣（現在 {ids}）')
    for gid in ids:
        it = d['items'][gid]
        if it.get('shop') != FN_SHOP:
            raise SystemExit(f'{W} {gid}.shop：要是 {FN_SHOP}')
        new = {'name': txt(it['name'], f'{W}.{gid}.name'), 'price': it['price'], 'line': txt(it['line'], f'{W}.{gid}.line'),
               'love': list(it.get('love', [])), 'no': list(it.get('no', [])), 'shop': FN_SHOP}
        if not isinstance(new['price'], int) or new['price'] <= 0:
            raise SystemExit(f'{W} {gid}：價錢要是正整數')
        if gid in data['items']:
            if data['items'][gid] != new:   # 舊存檔買過的：id、名字、價錢、love、no 不能動；line 已經照 replace 換了
                raise SystemExit(f'{W} {gid}：和 AA_732（換完 line）的不一樣：{data["items"][gid]} ≠ {new}')
        else:
            if not gid.startswith('g_fn_'):
                raise SystemExit(f'{W} {gid}：新商品的代號要是 g_fn_*')
            if new['love'] or new['no']:
                raise SystemExit(f'{W} {gid}：新商品的 love、no 要是空的（X325 不替角色設定新的花卉喜好）')
            data['items'][gid] = new
    S['items'] = ids
    data['srcFlower'] = f'{P792}@{sha}'
    st = d['staff']
    if not re.fullmatch(r'\d\d:\d\d～\d\d:\d\d', st.get('hours') or ''):
        raise SystemExit(f'{W} staff.hours：要是「10:00～21:00」這種寫法（現在 {st.get("hours")}）')
    if sorted(st['buy']) != sorted(ids):
        raise SystemExit(f'{W} staff.buy：要剛好是十樣商品（現在 {sorted(st["buy"])}）')
    bad = [k for k in d['looks'] if k not in kinds]
    if bad:
        raise SystemExit(f'{W} looks：{FN_LAYOUT} 沒有這個 kind {bad}')
    bad = [k for k in st if k not in ('who', 'greet', 'closed', 'hours', 'buy', 'closed_line', 'not_open', 'typhoon')]
    if bad:
        raise SystemExit(f'{W} staff：不認得的欄位 {bad}（稿多了東西，先改這支工具）')
    bad = [k for k in d if k not in ('_meta', 'shop', 'items', 'staff', 'looks', 'replace', 'look_buttons', 'give_ok_flower')]
    if bad:
        raise SystemExit(f'{W}：不認得的欄位 {bad}（稿多了東西，先改這支工具）')
    staff = {'who': txt(st['who'], W + '.staff.who'), 'greet': lines(st['greet'], W + '.staff.greet'), 'closed': txt(st['closed'], W + '.staff.closed'),
             'hours': st['hours'], 'buy': {g: lines(st['buy'][g], f'{W}.staff.buy.{g}') for g in ids}}
    if 'closed_line' in st:   # 21:00 人還在店裡：遊戲演的是 AA_700 那一支（src/xs_close3d.js），稿的這一句要和它一樣
        cl, line700 = txt(st['closed_line'], W + '.staff.closed_line'), xs_close_line()
        if cl != line700:
            raise SystemExit(f'{W} staff.closed_line「{cl}」和 AA_700 的打烊句（{XS_CLOSE} S.LINE「{line700}」）不一樣：花序要自己的打烊句的話，先改 src/flower_notes_sys3d.js')
        staff['closeLine'] = cl
    if 'not_open' in st:
        staff['notOpen'] = txt(st['not_open'], W + '.staff.not_open')
        if not (staff['notOpen'].startswith('（') and staff['notOpen'].endswith('）')):
            raise SystemExit(f'{W} staff.not_open：要是旁白（整句在（）裡）')
    if 'typhoon' in st:
        if st['typhoon'] != TYPHOON_RULE:
            raise SystemExit(f'{W} staff.typhoon：只認規則「{TYPHOON_RULE}」（現在「{st["typhoon"]}」；如果是要演的句子，先改這支工具和 src/flower_notes_sys3d.js）')
        staff['typhoonOff'] = True
    out = {'src': f'{P792}@{sha}', 'shop': FN_SHOP, 'staff': staff,
           'looks': {k: txt(v, f'{W}.looks.{k}') for k, v in d['looks'].items()}}
    if 'look_buttons' in d:
        lb = d['look_buttons']
        if sorted(lb) != sorted(d['looks']):
            raise SystemExit(f'{W} look_buttons：key 要和 looks 一模一樣（多 {sorted(set(lb) - set(d["looks"]))}、少 {sorted(set(d["looks"]) - set(lb))}）')
        out['lookButtons'] = {k: txt(lb[k], f'{W}.look_buttons.{k}') for k in d['looks']}
    if 'give_ok_flower' in d:
        go = {k: v for k, v in d['give_ok_flower'].items() if k != 'note'}
        bad = [k for k in go if k not in PEOPLE]
        if bad or not go:
            raise SystemExit(f'{W} give_ok_flower：不認得的人 {bad}（只有 {PEOPLE}）')
        if '八樣新花（love、no 都空）' not in (d['give_ok_flower'].get('note') or ''):
            raise SystemExit(f'{W} give_ok_flower.note：找不到「八樣新花（love、no 都空）」（用在哪幾樣改了，先改這支工具）')
        new8 = [g for g in ids if g.startswith('g_fn_')]
        if len(new8) != 8 or any(data['items'][g]['love'] or data['items'][g]['no'] for g in new8):
            raise SystemExit(f'{W} give_ok_flower：新花要剛好八樣、love／no 都空（現在 {new8}）')
        data['flowerOk'] = {'src': f'{P792}@{sha}', 'items': new8, 'lines': {pid: txt(go[pid], f'{W}.give_ok_flower.{pid}') for pid in PEOPLE if pid in go}}
        out['_noFlowerOk'] = [pid for pid in PEOPLE if pid not in go]
    return out


XS_CLOSE = 'src/xs_close3d.js'
TYPHOON_RULE = '照公館其他店：颱風天休息。'


def xs_close_line():
    m = re.search(r"S\.LINE='([^']+)';", open(os.path.join(ROOT, XS_CLOSE), encoding='utf-8').read())
    if not m:
        raise SystemExit(f'{XS_CLOSE}：找不到 S.LINE')
    return m.group(1)


def main():
    allow = IG.load(ROOT)
    shas, whys = [], []
    for p in (P1, P2, P3):
        s, w = src_sha(allow, p)
        shas.append(s)
        whys.append(w)
    d = [json.loads(git('show', f'{s}:{p}')) for s, p in zip(shas, (P1, P2, P3))]
    data = build(d[0], d[1], d[2], shas)
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
    import ps755   # 2026-11-11（X327 沛珊重寫）：AA_755_peishan_feed_misc.json 的 other 逐則 old→new 疊在 classmate_peishan 上（tools/story/ps755.py；白名單沒有那份稿＝不換）
    n755 = ps755.apply(data, 'gift_holiday.js', ROOT, allow)
    # 稿的 fest.qixi.note：節日那一場的七夕不再有「為什麼是喜鵲／不告訴你，明年再問我」＝existing 第三則（那一年不送喜鵲的答案，明年才送）一起拿掉
    d755 = ps755.load(ROOT, allow)
    if d755:
        if 'gift_holiday.js existing 第三則' not in str(((d755.get('fest') or {}).get('qixi') or {}).get('note')):
            raise SystemExit('AA_755 fest.qixi.note 改了（找不到「gift_holiday.js existing 第三則」），先改這支工具')
        n755 += ps755.remove(data, 'AA_416 七夕（交往中）：「我查到了。……不告訴你。」那一年不送喜鵲的答案，明年才送', ROOT, allow)
    s792, w792 = src_sha(allow, P792)
    whys.append(w792)
    fn = overlay_792(data, json.loads(git('show', f'{s792}:{P792}')), s792, layout_kinds())
    no_ok = fn.pop('_noFlowerOk', None)
    js792 = ('/* 自動產生：tools/gift/import_gift_holiday.py（' + fn['src'] + '）。不要手改，改企劃 AA_792 再重新匯入。\n'
             '   花序 Flower Notes（FLOWER-NOTES-1110，USER_WANTS X325；播放 src/flower_notes_sys3d.js）：staff＝花藝師的句子（greet 進買花清單、buy 買了那一樣、closed 打烊以後門口、notOpen 開門以前門口、closeLine 打烊人還在店裡＝AA_700、hours 營業時間、typhoonOff 颱風天休息）、looks＝店裡每一區的「看」（key＝配置的 kind；plinth_center＝配置的 display）、lookButtons＝每一個「看」的按鈕字。\n'
             '   商品（十樣）在 src/data/gift_holiday.js 的 shops.gg_flower、items。 */\n'
             "'use strict';\nconst FLOWER_NOTES_TEXT=" + json.dumps(fn, ensure_ascii=False, indent=1) + ';\n'
             "if(typeof module!=='undefined') module.exports=FLOWER_NOTES_TEXT;\n")
    js = ('/* 自動產生：tools/gift/import_gift_holiday.py（' + '、'.join(data['src']) + (f'；沛珊 {n755} 處照 {ps755.tag(ROOT, allow)}' if n755 else '') + '；花序 ' + data['srcFlower'] + '）。不要手改，改企劃 AA_732／AA_733／AA_734（花序：AA_792）再重新匯入。\n'
          '   節日、生日送禮（GIFT-HOLIDAY-1110；播放 src/gifthol3d.js）：shops／items＝店家禮物、react＝八位收到的反應、give＝她們送祐廷的、stationery＝山嵐文具區學姊四場、flowerOk＝花序八樣新花送人時各人的那一句（AA_792 give_ok_flower；沒寫到的人照 ok）*/\n'
          "'use strict';\nconst GIFT_HOLIDAY=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=GIFT_HOLIDAY;\n")
    sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import canon_b5_rows as _B5   # CANON-NO-ECON-1112 第五批：AA_920／921／923 的 src 對照表在寫檔前照整句換（tools/story/canon_b5_rows.py）
    js = _B5.fix(OUT, js)
    p, p792 = os.path.join(ROOT, OUT), os.path.join(ROOT, OUT792)
    if '--check' in sys.argv:
        for q, want, name in ((p, js, f'{OUT} 和白名單上的 AA_732／733／734（花序 AA_792）'), (p792, js792, f'{OUT792} 和白名單上的 AA_792')):
            cur = open(q, encoding='utf-8').read() if os.path.exists(q) else ''
            if cur != want:
                raise SystemExit(f'{name} 不一樣：重新匯入')
        print('OK', *whys)
        return
    open(p, 'w', encoding='utf-8').write(js)
    open(p792, 'w', encoding='utf-8').write(js792)
    print('寫入', OUT, OUT792, *whys)
    print(' 店：', {k: len(v['items']) for k, v in data['shops'].items()}, '共', len(data['items']), '樣（含 special）')
    print(' 花序：looks', len(fn['looks']), '個、按鈕字', len(fn.get('lookButtons') or {}), '個；staff 多的欄位', [k for k in ('closeLine', 'notOpen', 'typhoonOff') if k in fn['staff']], '；flowerOk', sorted((data.get('flowerOk') or {}).get('lines') or {}))
    if no_ok:
        print(' [提醒] AA_792 give_ok_flower 沒寫到的人（八樣新花照舊用通用的 ok 句）：', no_ok)


if __name__ == '__main__':
    main()
