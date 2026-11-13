#!/usr/bin/env python3
"""AA_772_l118_shops_redo_fix.json（L118-SHOPS-REDO-1111，USER_WANTS X338：使用者 2026-11-11 118 巷九間店改版，故事照餐飲類型搬）——照稿換字，不手改。

只讀劇情匯入白名單（docs/handoff/story_import_allow.json）上的那一版；白名單沒有這份稿＝什麼都不換。AA 之後往 fix 後面加列：白名單換 SHA、重跑這支就好。

做三件事：
1. fix 列（{file, old, new}）整句對整句換。
     python3 tools/story/l118_fix772.py            空跑：印每一列的狀態
     python3 tools/story/l118_fix772.py --apply    真的換（手寫的檔直接改；產生的檔也先改，之後各自的匯入工具重匯時再疊一次，結果一樣）
     python3 tools/story/l118_fix772.py --check    都換好了（沒有還要換的、沒有對不到的）＝結束碼 0；不然 1
   - old 在那個檔要剛好出現 EXPECT 那麼多次（沒寫＝1 次）；多了、少了＝不換那一列，列出來（給 AA）。
   - 已經是 new（old 找不到、new 找得到；或那一句已經搬進產生的資料檔 src/data/l118_redo772.js）＝跳過；可以重跑。
   - new 裡面本來就包著 old 的（例：前面加「（小聲）」）不會重複換。
   - old 和 new 一樣的列（AA 列出來確認不用改）：只確認那一句在。
   - 幾列不是「字串換字串」，寫在 SPECIAL（為什麼、怎麼處理）。
   - food_fav.fix 沒有寫檔名：在 src/data/food_fav_lines.js 找。
2. 產生 src/data/l118_redo772.js（const L118_REDO）：店員的稱呼（staff）、熟客三段招呼（regular_greets）、118 巷邀約地點的店名和動詞（invite_places）、
   順手的事的店名對照和搬到哪一間（sideq_rename）、她們喜歡吃的（food_fav.CFG）、以安窗邊的位子搬到木曜日的新條件三句（slowread_to_mokuyobi.H3）。
   程式（src/lane118.js、src/sideq3d.js、src/foodfav3d.js、src/data/invites.js、src/slowread3d.js）讀這個檔，不把這些字抄進程式。
3. 產生的檔（src/data/activity_scenes.js、gift_lines.js、flirt_lines.js：各自的匯入工具組好文字以後呼叫 layer_js(檔名, 文字, ROOT)）、
   eat_lines.js（tools/eat/import_eat_lines.py 呼叫 eat_overlay()：eat_lines 那一節蓋掉 118 巷那幾間）——重匯不會把這一層蓋掉。
逐列比對在 tests/l118_fix772_unit.js。"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import import_guard as IG

PATH = 'docs/story_planning/AA_772_l118_shops_redo_fix.json'
DATA_OUT = 'src/data/l118_redo772.js'
FAV_LINES = 'src/data/food_fav_lines.js'
GENERATED = ('src/data/activity_scenes.js', 'src/data/gift_lines.js', 'src/data/flirt_lines.js')   # 匯入工具產生的檔：匯入工具疊 layer_js()
_CACHE = {}

# old 在檔裡不只一次、看過確實都要換的列（列號從 1 算；AA 的 note 寫了「兩處」「三處」的）
EXPECT = {15: 3, 39: 2, 40: 2, 43: 2, 95: 7, 107: 2}   # 15：S.INVITE 的 verb＋兩處說明；39、40：SQ12 標題、出遊地點名各兩處（AA 的 note）；43：聯絡人名字＋說明；95：品項名 item、n、清單和兩句裡的字；107：place＋說明
# 不是「字串換字串」的列
SPECIAL = {
    14: ('gone', '阿哲輪替的 S.LUNCH_FIX（AA_480 第 4 節那一句）整段刪掉：程式改（src/lane118.js），這一列只確認那一句已經不在'),
    89: ('gone', '可昕法圖改約那條 rule（AA_940，BB_456：她是法律系的，法圖照一般答應）整條拿掉：這一列只確認舊句已經不在'),
    68: ('path', "子晴 first 第三句（原句只有「好。」）：不能拿「好。」當搜尋字串，照路徑換——src/data/invites.js 慢讀那一組 heroine_04.first 的第三句"),
}
# 第 90 列的 note：「另外三筆『在慢讀咖啡寫報告／整理講義／整理筆記』同樣換成『在木曜日…』」
EXTRA = {90: [('在慢讀咖啡寫報告', '在木曜日寫報告'), ('在慢讀咖啡整理講義', '在木曜日整理講義'), ('在慢讀咖啡整理筆記', '在木曜日整理筆記')]}
_PH = '\u0000L118FIX772\u0000'
WANT = {}   # 衍生列（下面 rows() 加的）各自要出現幾次；'*'＝一次以上都換


def load(root, allow=None):
    """白名單上有才讀；沒有＝None"""
    if root in _CACHE:
        return _CACHE[root]
    allow = allow or IG.load(root)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        _CACHE[root] = None
        return None
    sha = hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    raw = subprocess.check_output(['git', '-C', root, 'show', f'{sha}:{PATH}']).decode('utf-8')
    d = json.loads(raw)
    if json.loads(IG.read_fix(raw)) != d:
        raise SystemExit(f'{PATH}@{sha}：讀稿時照字換的那幾層（import_guard.read_fix）會改到這份稿的字，先問 AA')
    d['_sha'] = sha
    # 白名單 history 上的舊版本：同一列 old 一樣、new 不一樣的，舊版的 new 也當成可以接受的 old（已經照舊版套過的檔，換 SHA 重跑就換成新版的字，不用先還原）
    alts = {}
    for h in hits[-1].get('history') or []:
        try:
            dp = json.loads(subprocess.check_output(['git', '-C', root, 'show', f'{h["sha"]}:{PATH}'], stderr=subprocess.DEVNULL).decode('utf-8'))
        except Exception:
            continue
        for sec, pre in ((dp.get('fix') or [], ''), ((dp.get('food_fav') or {}).get('fix') or [], 'F')):
            cur = (d.get('fix') or []) if not pre else ((d.get('food_fav') or {}).get('fix') or [])
            for k, r in enumerate(sec):
                if k < len(cur) and cur[k]['old'] == r['old'] and cur[k]['new'] != r['new'] and r['new'] != r['old']:
                    alts.setdefault(pre + str(k + 1), []).append(r['new'])
    d['_alts'] = alts
    _CACHE[root] = d
    return d


def tag(root, allow=None):
    d = load(root, allow)
    return f'{os.path.basename(PATH)}@{d["_sha"]}' if d else ''


def rows(d):
    """[(列號, 檔, old, new, note)]：fix 的每一列（列號從 1）＋第 90 列帶的三筆（90.1～90.3）＋food_fav.fix（F1～F7）"""
    out = []
    for k, r in enumerate(d.get('fix') or [], 1):
        out.append((str(k), r['file'], r['old'], r['new'], r.get('note', '')))
        for j, (a, b) in enumerate(EXTRA.get(k, []), 1):
            out.append((f'{k}.{j}', r['file'], a, b, '第 %d 列 note 帶的' % k))
    fx = d.get('fix') or []
    def add(n, f, old, new, note, want):
        out.append((n, f, old, new, note)); WANT[n] = want
    # 第 108 列的 note：「name、caption『巷口家常菜』→『五湖四海』」（同一個檔芯慈那兩筆的 placeName 也是這個地點名）：整個字串就是舊店名的那幾格
    # 第 115 列的 note：「同檔另一處地點名『巷口家常菜』也換；H7 那兩句照 lane118.js 的改法」（＝第 12、13 列）
    if len(fx) >= 115 and fx[107]['file'] == 'src/data/termend_lines.js' and fx[114]['file'] == 'src/xcrom3d.js':
        o, n_ = "'巷口家常菜'", "'五湖四海'"
        add('108.1', 'src/data/termend_lines.js', o, n_, '第 108 列 note：name、caption、placeName', '*')
        add('115.1', 'src/xcrom3d.js', o, n_, '第 115 列 note：同檔另一處地點名', '*')
        add('115.2', 'src/xcrom3d.js', fx[11]['old'], fx[11]['new'], '第 115 列 note：H7 那兩句照第 12 列', 1)
        add('115.3', 'src/xcrom3d.js', "text:'" + fx[12]['old'] + "'", "text:'" + fx[12]['new'] + "'", '第 115 列 note：H7 那兩句照第 13 列', 1)
    # sideq_rename：src/sideq3d.js 玩家看得到的店名（SHOP_NAME 的值、提示句裡的「店名（118 巷）」）換新店名；木曜日那一間換成「（溫州街）」。當 key 的字（沒有括號的）不動
    for k, (o, n_) in enumerate(((d.get('sideq_rename') or {}).get('map') or {}).items(), 1):
        add(f'R{k}', 'src/sideq3d.js', o + '（118 巷）', n_ + ('（溫州街）' if n_ == '木曜日' else '（118 巷）'), 'sideq_rename：顯示的店名', '*')
    for k, r in enumerate(((d.get('food_fav') or {}).get('fix')) or [], 1):
        out.append((f'F{k}', FAV_LINES, r['old'], r['new'], r.get('note', '')))
        m = re.search(r'key「(.+?)」→「(.+?)」', r.get('note', ''))   # note 寫的「wrong 的 key「舊品名」→「新品名」」：那一格的 key 一起換
        if m: out.append((f'F{k}.1', FAV_LINES, "wrong:{'" + m.group(1) + "':", "wrong:{'" + m.group(2) + "':", '第 F%d 列 note 帶的 key' % k))
    return out


def _count(text, old, new):
    """old 出現幾次（包在 new 裡面的不算）"""
    if old and new and old in new and old != new:
        return text.replace(new, _PH).count(old)
    return text.count(old)


def _swap(text, old, new):
    if old in new and old != new:
        return text.replace(new, _PH).replace(old, new).replace(_PH, new)
    return text.replace(old, new)


def _special68(text):
    """子晴慢讀那一組的 first：['木曜日？……有插座嗎？','（你說沒有。）','好。'] 的第三句（第 65、66 列換過以後）。回傳 (新文字, 狀態)"""
    new3 = '……好。我充飽再去。'
    for q2 in ('（你說沒有。）', '（你說有。）'):
        a = "'" + q2 + "','好。']"
        if text.count(a) == 1:
            return text.replace(a, "'" + q2 + "','" + new3 + "']"), 'apply'
    return text, ('done' if ("','" + new3 + "']") in text else 'miss')


# 2026-11-11（X324 D 區）：後來的覆蓋層（tools/story/overlay_rows.py：白名單 overlay:true 的稿，AA_783、AA_784…）把這一層換上去的新字又整句換掉了（例：木曜日那一組的句子拿掉刪節號）——
# 覆蓋層那一列的 old＝這裡的 new、它的 new 在檔裡＝已經換好（不是漏換）。只看那個遊戲檔對到的覆蓋層檔名
OV_FILE = {'src/data/invites.js': 'invites', 'src/data/invite_replies.js': 'invite_replies', 'src/data/msg_pool.js': 'msg_pool', 'src/data/msg2_pool.js': 'msg2_pool'}


def _ov_after(file, new, text):
    """new 被後來的覆蓋層整句換掉、換上去的字在 text 裡＝那一列的新字；不是＝None"""
    k = OV_FILE.get(file)
    if not k:
        return None
    try:
        import overlay_rows as _OV
        R = _OV.rows(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), k)
    except SystemExit:
        return None
    for r in R:
        if r['old'] == new and r['new'] in text:
            return r['new']
    return None


# 上游的稿重寫以後，這幾列的 old 和 new 都不在了（不是漏換）：{(遊戲檔, 列號): 哪一版重寫的}
UPSTREAM = {('src/data/activity_scenes.js', n): 'AA_708_activity_scenes.json@d30416e6b（2026-11-11 X324 A 區：語彤吃飯 3 不指店名菜名、沛珊整塊重寫——舊店名、番茄醬蛋包飯都拿掉了）' for n in ('98', '99', '100', '101')}
UPSTREAM[('src/data/invites.js', '89')] = 'AA_940（2026-11-13，BB_456）：可昕法圖改約慢讀那條 rule 整條拿掉——這一列的 old、new 都不在了'
# 後來的逐行改稿（apply_line_rows.py）又把這一列的 new 整句改掉＝已經換好：只有改稿後的那一句真的在檔裡才算（X324 G 區，AA_804 拿掉刪節號）
LATER_ROWS = {('src/data/food_fav_lines.js', 'F4'): ('可樂餅的。好，我吃吃看。', 'AA_804_food_fav.json@8eab5a25c 第 22 行'),
              ('src/data/food_fav_lines.js', 'F6'): ('雞肉的？好，今天換一次。', 'AA_804_food_fav.json@8eab5a25c 第 45 行')}


def layer(file, text, d, data_text='', report=None):
    """把 file 的每一列疊到 text 上。report（list）收 (列號, 狀態, old, new, 次數)：apply／done／miss（對不到）／many（次數不對，不換）／keep（old＝new，確認在）／pending（等程式刪）"""
    for n, f, old, new, note in rows(d):
        if f != file:
            continue
        base = int(re.match(r'\d+', n).group(0)) if n[0].isdigit() else None
        want = WANT.get(n, 1)
        sp = SPECIAL.get(base) if base is not None and '.' not in n else None
        if sp and sp[0] == 'gone':
            st = 'pending' if old in text else 'done'; c = text.count(old)
        elif sp and sp[0] == 'path':
            text, st = _special68(text); c = 1 if st == 'apply' else 0
            if st == 'miss' and _ov_after(file, '……好。我充飽再去。', text):   # X324 覆蓋層（AA_784）又拿掉刪節號
                st = 'done'
        elif old == new:
            c = text.count(old); st = 'keep' if c else 'miss'
        else:
            c = _count(text, old, new); want = EXPECT.get(base, 1) if base is not None and '.' not in n else WANT.get(n, 1)
            if want == '*': want = c if c else 1
            if c == 0:
                st = 'done' if (new in text or (data_text and new in data_text)) else 'miss'
                if st == 'miss' and (file, n) in UPSTREAM:   # 上游的稿自己把那一句重寫掉了（old、new 都不在）＝不用疊
                    st = 'done'
                if st == 'miss' and _ov_after(file, new, text):   # 後來的覆蓋層（X324 D 區）又把 new 整句換掉了＝已經換好
                    st = 'done'
                if st == 'miss' and (file, n) in LATER_ROWS and LATER_ROWS[(file, n)][0] in text:   # 後來的逐行改稿又改過（見 LATER_ROWS）
                    st = 'done'
                if st == 'miss':
                    for prev in (d.get('_alts') or {}).get(n, []):   # 已經照舊版套過：舊版的 new → 新版的 new
                        if _count(text, prev, new) == want:
                            text = _swap(text, prev, new); st = 'apply'; c = want; break
            elif c != want:
                st = 'many'
            else:
                text = _swap(text, old, new); st = 'apply'
        if report is not None:
            report.append((n, f, st, old, new, c))
    return text


def layer_js(file, js, root, allow=None):
    """匯入工具用：組好的 js 文字疊上 AA_772 給這個檔的列（白名單沒有 AA_772＝原樣）。對不到、次數不對＝停"""
    d = load(root, allow)
    if not d:
        return js
    rep = []
    js = layer(file, js, d, report=rep)
    bad = [r for r in rep if r[2] in ('miss', 'many')]
    if bad:
        raise SystemExit('AA_772 ' + file + '：' + '；'.join(f'第 {r[0]} 列{"對不到" if r[2] == "miss" else "出現 %d 次" % r[5]}：{r[3]}' for r in bad))
    return js


def eat_overlay(root, allow=None):
    """tools/eat/import_eat_lines.py 用：AA_772 的 eat_lines 那一節（first、staff、doorShops 的新字）；白名單沒有＝None"""
    d = load(root, allow)
    if not d or not d.get('eat_lines'):
        return None
    e = d['eat_lines']
    door = re.search(r'改成((?:「[^」]+」)+)', e.get('doorShops', ''))
    if not door:
        raise SystemExit('AA_772 eat_lines.doorShops：找不到「改成「…」「…」」那一串')
    old = d['sideq_rename']['map']
    door0 = re.search(r'原本的((?:「[^」]+」)+)', e.get('doorShops', ''))
    return {'first': dict(e['first']), 'staff': {k: {x: v[x] for x in ('who', 'line5', 'same', 'alt')} for k, v in e['staff'].items()},
            'doorShops': re.findall(r'「([^」]+)」', door.group(1)), 'doorOld': re.findall(r'「([^」]+)」', door0.group(1)) if door0 else [], 'oldNames': sorted(old.keys()), 'tag': tag(root, allow)}


def build_data(d):
    """src/data/l118_redo772.js 的內容"""
    who = lambda s: re.split(r'[（(]', s, maxsplit=1)[0].strip()
    staff = {r['shop']: who(r['staff']) for r in d['staff']}
    reg = {}
    for r in d['regular_greets']['rows']:
        e = {'known': [['@', r['know']]] + ([[None, r['knowNarr']]] if r.get('knowNarr') else []), 'usual': r['usual']}
        for k in ('item', 'exam'):
            if r.get(k): e[k] = r[k]
        u2 = (d['regular_greets'].get('usual2') or {}).get(r['shop'])   # usual2＝上次點別的、不帶菜名那一句（AA_772 @d78266901 補的 regular_greets.usual2；沒有稿的店沒有這一欄）
        if isinstance(u2, str) and u2: e['usual2'] = u2
        reg[r['shop']] = e
    ip = d['invite_places']
    sq = d['sideq_rename']
    zone = {k: re.split(r'[（(]', v, maxsplit=1)[0].strip() for k, v in sq['shop_zone'].items()}
    h3 = d['slowread_to_mokuyobi']['H3']
    fav = {k: {'shop': v['shop'], 'right': v['right'], 'opt': v.get('opt')} for k, v in d['food_fav']['CFG'].items()}
    return {'src': PATH + '@' + d['_sha'], 'staff': staff, 'reg': reg,
            'invitePlaces': {'meal': ip['meal'], 'walk': ip['walk']},
            'sideq': {'rename': sq['map'], 'shopZone': zone},
            'fav': fav, 'h3': {'lines': h3['lines']}}


def data_js(d):
    return ('/* 118 巷九間店改版（L118-SHOPS-REDO-1111）照 AA_772 搬的故事資料：店員的稱呼、熟客三段招呼、邀約地點的店名、順手的事的店名對照、她們喜歡吃的、以安窗邊的位子（木曜日）。\n'
            '   自動產生，不要手改：python3 tools/story/l118_fix772.py --apply（來源：' + PATH + '@' + d['_sha'] + '，劇情匯入白名單）。字串照抄 AA_772。*/\n'
            'const L118_REDO=' + json.dumps(build_data(d), ensure_ascii=False, indent=1) + ';\n'
            "if(typeof module!=='undefined') module.exports=L118_REDO;\n")


def run(root, apply=False, quiet=False):
    d = load(root)
    if not d:
        print('白名單沒有 AA_772：不換'); return [], 0
    djs = data_js(d); dp = os.path.join(root, DATA_OUT)
    cur = open(dp, encoding='utf-8').read() if os.path.exists(dp) else ''
    data_stale = cur != djs
    if apply and data_stale:
        open(dp, 'w', encoding='utf-8').write(djs)
    rep = []
    files = []
    for n, f, *_ in rows(d):
        if f not in files: files.append(f)
    for f in files:
        p = os.path.join(root, f)
        if not os.path.exists(p):
            for n, ff, old, new, note in rows(d):
                if ff == f: rep.append((n, f, 'miss', old, new, 0))
            continue
        s = open(p, encoding='utf-8').read()
        s2 = layer(f, s, d, data_text=djs, report=rep)
        if apply and s2 != s:
            open(p, 'w', encoding='utf-8').write(s2)
    LAB = {'apply': '換了' if apply else '要換', 'done': '已經是新句', 'keep': '不用改（確認在）', 'miss': '對不到', 'many': '次數不對，沒換', 'pending': '等程式刪'}
    if not quiet:
        for n, f, st, old, new, c in rep:
            if st in ('miss', 'many', 'pending') or not apply or st == 'apply':
                print(f'  [{LAB[st]}] 第 {n} 列 {f}' + (f'（{c} 處）' if st == 'many' else '') + f'：{old} → {new}')
    cnt = {k: sum(1 for r in rep if r[2] == k) for k in LAB}
    print(f'AA_772@{d["_sha"]}：{len(rep)} 列——' + '、'.join(f'{LAB[k]} {v}' for k, v in cnt.items() if v) + ('；' + DATA_OUT + (' 已重新產生' if apply else ' 要重新產生') if data_stale else ''))
    return rep, (1 if data_stale and not apply else 0)


if __name__ == '__main__':
    ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
    rep, stale = run(ROOT, '--apply' in sys.argv, quiet='--check' in sys.argv)
    if '--check' in sys.argv:
        bad = [r for r in rep if r[2] in ('apply', 'miss', 'many', 'pending')]
        for r in bad: print('  ', r[0], r[1], r[2], r[3])
        sys.exit(1 if bad or stale else 0)
