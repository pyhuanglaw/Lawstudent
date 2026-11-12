#!/usr/bin/env python3
"""她請客的格（AA_782；DLG-FULL-REVIEW-1110，使用者 X324）→ src/data/she_pays.js（SHE_PAYS_DATA）。src/date3d.js 載入時合進 S.SHE_PAYS：
她在那個互動點說了那一句的那一次，祐廷那一份（S.pointCost）不扣（做法見 date3d.js S.SHE_PAYS 的註解；以安三格是 AA_780 _meta.she_pays，在 date3d.js 手寫）。
稿 docs/story_planning/AA_782_she_pays.json：{_meta, she_pays:[{who, loc, n, key, text}]}——AA 寫「字都不改」、格號＝date_rewrite.py list 的編號、字照遊戲現在的。
- 來源一定要在 docs/handoff/story_import_allow.json（路徑＋commit＋approved），不在名單就拒絕（D94 第 5 點）。
- 每一列都要對得到遊戲現在的 src/data/date_lines.js（不猜，對不到就停）：
  key＝<互動點 id>.<first|firstHigh|remember|normal|dating|afterBreakup>[#第幾套]，互動點 id 的前三個字＝loc；
  那一套的 lines 裡她（who）說的、和 text 一字不差的剛好一句；text 在她這個互動點底下（所有套、選項、回話）也只有這一處（不然別套也會不扣）；
  格號 n（她在這個地點的第 n 格，date_rewrite.py list 的順序：到達、收尾各 first／normal／dating，互動點 first／normal／remember／dating 再來是其他，最後是不喜歡那一句）就是這一句。
- 同一個人同一套（key）只能一列（同一個互動點可以好幾套，例：學姊 D22.fish 的 first 和 remember）；以安的三格在 date3d.js（AA_780），這裡不能再列以安。
AA_812（企劃線 f1fab0ec6；DLG-FULL-REVIEW-1110 小項）：稿 docs/story_planning/AA_812_date_pays_promises.json 的 SHE_PAYS_add（那個互動點她付全部）、SPLIT（她付一部分＝那個互動點祐廷那一份扣一半，
AA 和 LAWWW 定）——格式同 S.SHE_PAYS：{她:{互動點 id:[那一句]}}，沒有格號、key（白名單一筆，路徑＋commit）。也是對遊戲現在的 date_lines.js（AA_812 的 path_rows、改稿紀錄已經由
tools/date/import_date_lines.py 疊進去，先跑那一支）：每一句在她那個互動點底下剛好一處、是她說的台詞（某一套的 lines，或選項的回話 reply），格號照 date_rewrite.py list 算出來、要剛好一格。
- 同一句不能同時在 SHE_PAYS_add 和 SPLIT（停下來）；同一個互動點兩邊都有不同的句子可以（演的時候最後說的那一句算，date3d.js S.playSet）——印出來。
- 以安的格可以列（AA_780 手寫的三格在 date3d.js；同一句＝不重複，跳過）。
- AA_782 的列：同一個人同一個互動點 AA_812 也列了、這一句不在 AA_812 的清單裡、而且遊戲裡已經沒有這一句＝被 AA_812 取代（superseded，AA 改了字：學姊 D06.cafe、沛珊 D21.street）；
  這一句還在遊戲裡＝不知道要不要拿掉，停下來。AA_812 和 AA_782 同一句＝不重複。
- AA_812 的句子後來在源稿被 AA 換了字（REWORD；2026-11-12「好」開頭回話三句）：AA_812 那一句不在遊戲裡了才換成現在的字，cells812 那一列多 was（原本 AA_812 寫的）、by（哪一份稿）。
  2026-11-12 d7d818f8a8：AA_812 已經同步成新字，REWORD 清空（cells812 沒有 was 了）。
輸出：pays（AA_782 留下的＋AA_812 新的）、split（AA_812）、cells（AA_782 留下的列，格式照舊）、superseded（被取代的 AA_782 列）、cells812（AA_812 每一句：pays／split、位置、格號、跟誰重複）。
用法：python3 tools/date/import_she_pays.py [--check] [--out 檔名]"""
import json, os, re, subprocess, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'story'))
import import_guard as IG

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
PATH = 'docs/story_planning/AA_782_she_pays.json'
OUT = 'src/data/she_pays.js'
LINES = 'src/data/date_lines.js'
KINDS = ('first', 'firstHigh', 'remember', 'normal', 'dating', 'afterBreakup')
HAND = {'heroine_01'}   # date3d.js 手寫的（AA_780 _meta.she_pays）
P812 = 'docs/story_planning/AA_812_date_pays_promises.json'
# AA 決定拿掉的 AA_782 列（不算她請客）：(她, key) → 誰、為什麼。遊戲裡那一句照樣說，只是那一份照常扣
DROP = {('classmate_peishan', 'D31.egg.normal#2'): 'AA 11-11 18:58 回 LAWWW（BB 18:56 疑點②）：照 AA_812（較新）「只多買一顆蛋的不算」——「你要不要再一顆？我請你。」不是她付整份'}
D3 = 'src/date3d.js'
# AA_812 的句子後來在源稿被 AA 換了字的（那一格重寫、AA_812 還沒跟著改）：(她, 互動點, AA_812 寫的那一句) → (現在的字, 哪一份稿)。
# 只有「AA_812 那一句已經不在她那個互動點底下」才換（還在＝照 AA_812，不換；兩句都在、兩句都不在＝where() 停下來）。換了的格在 cells812 多一欄 was。AA 把 AA_812 改成新字以後這幾列就用不到、可以拿掉。
# 2026-11-12 X324「好」開頭回話（企劃線 41f77eab53）那一輪這裡有三筆（語彤 D12.pier 一句、學姊 D22.fish 兩句：AA 只拿掉開頭的「好。」）；
# AA 在 d7d818f8a8 把 AA_812 同步成新字（白名單 AA_812 換到那一版），三筆都拿掉了——現在是空的，機制留著給下一次用。
REWORD = {}


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def date_lines():
    t = open(os.path.join(ROOT, LINES), encoding='utf-8').read()
    i = t.index('const DATE_LINES=') + len('const DATE_LINES=')
    return json.loads(t[i:t.rindex(';')])


def leaves(x, p=''):
    if isinstance(x, list):
        for i, v in enumerate(x):
            yield from leaves(v, f'{p}/{i}')
    elif isinstance(x, dict):
        for k, v in x.items():
            yield from leaves(v, f'{p}/{k}')
    else:
        yield p, x


def slots(d, who):
    """同 tests/an_dates_1111_unit.js 的 slots()：她在這個地點的每一格（date_rewrite.py list 的順序）"""
    out, L, K4 = [], d['lines'][who], ('first', 'normal', 'remember', 'dating')

    def block(b):
        if isinstance(b, list):
            for x in b:
                block(x)
        elif isinstance(b, dict) and 'lines' in b:
            for x in b['lines']:
                out.append(x.get('text'))
            for c in b.get('choice') or []:
                out.append(c.get('t'))
                for r in c.get('reply') or []:
                    out.append(r.get('text'))
    for part in ('arrive', 'closing'):
        for kind in ('first', 'normal', 'dating'):
            if L.get(part) and kind in L[part]:
                block(L[part][kind])
    for hs, X in (L.get('hotspots') or {}).items():
        for kind in K4:
            if kind in X:
                block(X[kind])
        for k in X:
            if k not in K4:
                block(X[k])
    for hs, v in ((d.get('dislikeLine') or {}).get(who) or {}).items():
        out.append(v)
    return out


def build(src, sha, DL, sup=None):
    """sup：AA_812 SHE_PAYS_add 的 {(她, 互動點): [那幾句]}——同一個人同一個互動點 AA_812 也列了、這一句不在裡面＝被取代（見最上面的說明）"""
    if set(src) - {'_meta', 'she_pays'} or not isinstance(src.get('she_pays'), list) or not src['she_pays']:
        raise SystemExit(f'{PATH}@{sha}：最上層只認 _meta、she_pays（she_pays 要是有東西的陣列）')
    pays, cells, seen, gone, dropped = {}, [], set(), [], []
    for i, r in enumerate(src['she_pays']):
        w = f'{PATH}@{sha} she_pays[{i}]'
        if not isinstance(r, dict) or set(r) - {'who', 'loc', 'n', 'key', 'text', 'note'}:
            raise SystemExit(f'{w}：只認 who、loc、n、key、text（note）')
        who, loc, n, key, text = r.get('who'), r.get('loc'), r.get('n'), r.get('key'), r.get('text')
        if not all(isinstance(x, str) and x for x in (who, loc, key, text)) or type(n) is not int or n < 1:
            raise SystemExit(f'{w}：who、loc、key、text 要是字串，n 要是正整數')
        m = re.fullmatch(r'((D\d\d)\.\w+)\.(\w+)(?:#(\d+))?', key)
        if not m or m.group(2) != loc or m.group(3) not in KINDS:
            raise SystemExit(f'{w}：key「{key}」要寫 <互動點 id>.<{"／".join(KINDS)}>[#第幾套]，互動點 id 開頭＝loc {loc}')
        pid, kind, k = m.group(1), m.group(3), m.group(4)
        if who in HAND:
            raise SystemExit(f'{w}：{who} 的請客格在 src/date3d.js 手寫（AA_780），這裡不列')
        if (who, key) in seen:
            raise SystemExit(f'{w}：{who} {key} 已經有一列（同一套只能一列）')
        seen.add((who, key))
        if (who, key) in DROP:   # AA 決定不算（見 DROP）
            dropped.append({'who': who, 'loc': loc, 'n': n, 'key': key, 'text': text, 'why': DROP[(who, key)]})
            continue
        D = (DL.get('loc') or {}).get(loc) or {}
        H = ((((D.get('lines') or {}).get(who) or {}).get('hotspots')) or {}).get(pid)
        if not isinstance(H, dict):
            raise SystemExit(f'{w}：date_lines.js 的 {loc} 沒有 {who} 的互動點 {pid}')
        if sup and (who, pid) in sup and text not in sup[(who, pid)]:   # AA_812 這個互動點換了字
            if any(v == text for _, v in leaves(H)):
                raise SystemExit(f'{w}：AA_812 也列了 {who} {pid}（{sup[(who, pid)]}），沒有這一句「{text}」，可是遊戲裡還有這一句——不知道要不要拿掉，先問 AA')
            gone.append({'who': who, 'loc': loc, 'n': n, 'key': key, 'pid': pid, 'text': text, 'by': P812, 'now': sup[(who, pid)]})
            continue
        S = H.get(kind)
        if k is not None:
            if not isinstance(S, list) or int(k) >= len(S):
                raise SystemExit(f'{w}：{pid} 的 {kind} 沒有第 {k} 套')
            S = S[int(k)]
        elif isinstance(S, list):
            raise SystemExit(f'{w}：{pid} 的 {kind} 有好幾套，key 要寫 #第幾套')
        if not isinstance(S, dict) or not isinstance(S.get('lines'), list):
            raise SystemExit(f'{w}：{pid} 沒有 {kind}{"" if k is None else "#" + k} 那一套')
        mine = [x for x in S['lines'] if isinstance(x, dict) and x.get('who') == who and x.get('text') == text]
        if len(mine) != 1:
            raise SystemExit(f'{w}：「{text}」在 {who} {key} 那一套她說的台詞裡有 {len(mine)} 句（要剛好一句；字照遊戲現在的）')
        at = [p for p, v in leaves(H) if v == text]
        if len(at) != 1:
            raise SystemExit(f'{w}：「{text}」在 {who} {pid} 底下有 {len(at)} 處（{at}；要剛好一處，不然別套也會不扣）')
        sl = slots(D, who)
        if n > len(sl) or sl[n - 1] != text:
            raise SystemExit(f'{w}：格號 {n} 在 date_lines.js {loc} {who} 是「{sl[n - 1] if n <= len(sl) else "（沒有這一格）"}」，不是「{text}」')
        pays.setdefault(who, {}).setdefault(pid, []).append(text)
        cells.append({'who': who, 'loc': loc, 'n': n, 'key': key, 'pid': pid, 'text': text, 'at': f'/loc/{loc}/lines/{who}/hotspots/{pid}{at[0]}'})
    return {'src': f'{PATH}@{sha}', 'pays': pays, 'cells': cells, 'superseded': gone, 'dropped': dropped}   # dropped＝AA 決定不算的列（見 DROP），句子還在遊戲裡、只是那一份照常扣


def hand():
    """date3d.js 手寫的以安三格（AA_780）：S.SHE_PAYS={heroine_01:{'Dxx.pid':['那一句'],…}};"""
    t = open(os.path.join(ROOT, D3), encoding='utf-8').read()
    m = re.search(r"S\.SHE_PAYS=\{heroine_01:\{(.*?)\}\};", t)
    if not m:
        raise SystemExit(f'{D3}：找不到 S.SHE_PAYS 手寫的以安那一格')
    out = {}
    for pid, body in re.findall(r"'(D\d\d\.\w+)':\[([^\]]*)\]", m.group(1)):
        out[pid] = re.findall(r"'([^']*)'", body)
    if len(out) != 3:
        raise SystemExit(f'{D3}：S.SHE_PAYS 以安應該是三格（AA_780），讀到 {list(out)}')
    return {'heroine_01': out}


def where(DL, who, pid, text, w):
    """AA_812 的一句：在她那個互動點底下剛好一處、是她說的（某一套的 lines，或選項的回話 reply）；回傳 (at, key, 格號)"""
    if not re.fullmatch(r'D\d\d\.\w+', pid):
        raise SystemExit(f'{w}：互動點 id「{pid}」要寫 Dxx.名字')
    loc = pid[:3]
    D = (DL.get('loc') or {}).get(loc) or {}
    H = ((((D.get('lines') or {}).get(who) or {}).get('hotspots')) or {}).get(pid)
    if not isinstance(H, dict):
        raise SystemExit(f'{w}：date_lines.js 的 {loc} 沒有 {who} 的互動點 {pid}')
    at = [p for p, v in leaves(H) if v == text]
    if len(at) != 1:
        raise SystemExit(f'{w}：「{text}」在 {who} {pid} 底下有 {len(at)} 處（{at}；要剛好一處，字照遊戲現在的——AA_812 的 path_rows、改稿紀錄要先由 import_date_lines.py 疊進去）')
    m = re.fullmatch(r'/(\w+)(?:/(\d+))?(?:/choice/(\d+)/reply|/lines)/(\d+)/text', at[0])
    if not m or m.group(1) not in KINDS:
        raise SystemExit(f'{w}：「{text}」在 {who} {pid} 的 {at[0]}——不是某一套她說的台詞（lines）或選項的回話（reply）')
    x = H[m.group(1)]
    if m.group(2) is not None:
        x = x[int(m.group(2))]
    x = (x['choice'][int(m.group(3))]['reply'] if m.group(3) is not None else x['lines'])[int(m.group(4))]
    if x.get('who') != who:
        raise SystemExit(f'{w}：「{text}」是 {x.get("who")} 說的，不是 {who}')
    sl = slots(D, who)
    ns = [i + 1 for i, v in enumerate(sl) if v == text]
    if len(ns) != 1:
        raise SystemExit(f'{w}：「{text}」在 date_lines.js {loc} {who} 的格號有 {len(ns)} 格（{ns}；要剛好一格）')
    key = f'{pid}.{m.group(1)}' + ('' if m.group(2) is None else '#' + m.group(2)) + ('' if m.group(3) is None else f'.choice[{m.group(3)}]')
    return f'/loc/{loc}/lines/{who}/hotspots/{pid}{at[0]}', key, ns[0]


def read812(src, sha, DL):
    """AA_812 的 SHE_PAYS_add、SPLIT → ({(她, 互動點): [那幾句]}（她付全部）, 一樣（平分）, cells812)"""
    w0 = f'{P812}@{sha}'
    if set(src) - {'_meta', 'path_rows', 'SHE_PAYS_add', 'SPLIT'}:
        raise SystemExit(f'{w0}：最上層只認 _meta、path_rows、SHE_PAYS_add、SPLIT')
    out, cells = {}, []
    for part in ('SHE_PAYS_add', 'SPLIT'):
        X = src.get(part)
        if not isinstance(X, dict) or not X:
            raise SystemExit(f'{w0}：{part} 要是 {{她:{{互動點 id:[那一句]}}}}，而且有東西')
        out[part] = {}
        for who, M in X.items():
            if not isinstance(M, dict) or not M:
                raise SystemExit(f'{w0} {part}.{who}：要是 {{互動點 id:[那一句]}}')
            for pid, L in M.items():
                w = f'{w0} {part}.{who}.{pid}'
                if not isinstance(L, list) or not L or not all(isinstance(x, str) and x for x in L) or len(set(L)) != len(L):
                    raise SystemExit(f'{w}：要是有字的句子陣列（同一句不能列兩次）')
                now = []
                for text in L:
                    was = None
                    if (who, pid, text) in REWORD:   # 源稿後來換了字（見 REWORD）：AA_812 那一句不在了才換
                        H = (((((DL.get('loc') or {}).get(pid[:3]) or {}).get('lines') or {}).get(who) or {}).get('hotspots') or {}).get(pid) or {}
                        if not any(v == text for _, v in leaves(H)):
                            was, text = text, REWORD[(who, pid, text)][0]
                    at, key, n = where(DL, who, pid, text, w)
                    c = {'kind': 'pays' if part == 'SHE_PAYS_add' else 'split', 'who': who, 'loc': pid[:3], 'n': n, 'key': key, 'pid': pid, 'text': text, 'at': at}
                    if was:
                        c['was'] = was; c['by'] = REWORD[(who, pid, was)][1]
                    cells.append(c); now.append(text)
                if len(set(now)) != len(now):
                    raise SystemExit(f'{w}：換字以後同一句列了兩次 {now}')
                out[part][(who, pid)] = now
    both = [c for c in cells if c['kind'] == 'split' and c['text'] in out['SHE_PAYS_add'].get((c['who'], c['pid']), [])]
    if both:
        raise SystemExit(f'{w0}：同一句同時在 SHE_PAYS_add 和 SPLIT：' + json.dumps([(c['who'], c['pid'], c['text']) for c in both], ensure_ascii=False))
    return out['SHE_PAYS_add'], out['SPLIT'], cells


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if len(hits) != 1:
        raise SystemExit(f'{PATH}：白名單要剛好一筆 approved（現在 {len(hits)}）')
    sha = hits[0]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    DL = date_lines()
    h812 = [e for e in allow.get('files', []) if e.get('path') == P812 and e.get('status') == 'approved']   # AA_812：白名單沒有＝只匯 AA_782（照舊）
    if len(h812) > 1:
        raise SystemExit(f'{P812}：白名單 approved 不能有兩筆（現在 {len(h812)}）')
    pay812, split812, cells812 = {}, {}, []
    if h812:
        sha812 = h812[0]['sha']
        ok8, why8 = IG.allowed(P812, sha812, allow)
        if not ok8:
            raise SystemExit(why8)
        pay812, split812, cells812 = read812(json.loads(IG.read_fix(git('show', f'{sha812}:{P812}'))), sha812, DL)
        why += '；' + why8
    data = build(json.loads(git('show', f'{sha}:{PATH}')), sha, DL, pay812)
    if h812:
        H = hand(); have = {(c['who'], c['pid'], c['text']): 'AA_782 ' + c['key'] for c in data['cells']}
        for who in H:
            for pid, L in H[who].items():
                for t in L:
                    have[(who, pid, t)] = 'date3d.js（AA_780）'
        for c in cells812:
            if c['kind'] == 'pays' and (c['who'], c['pid'], c['text']) in have:
                c['dup'] = have[(c['who'], c['pid'], c['text'])]   # 同一句已經有了：不重複
            elif c['kind'] == 'pays':
                data['pays'].setdefault(c['who'], {}).setdefault(c['pid'], []).append(c['text'])
        both = sorted({(c['who'], c['pid']) for c in cells812 if c['kind'] == 'split'} & ({(w, p) for w in data['pays'] for p in data['pays'][w]} | {(w, p) for w in H for p in H[w]}))
        data['split'] = {}
        for c in cells812:
            if c['kind'] == 'split':
                data['split'].setdefault(c['who'], {}).setdefault(c['pid'], []).append(c['text'])
        data['src'] += f'＋{P812}@{sha812}'
        data['cells812'] = cells812
        print(f'AA_812@{sha812}：她付全部 {sum(1 for c in cells812 if c["kind"] == "pays")} 句（{len(pay812)} 個互動點；和 AA_782／date3d.js 重複 {sum(1 for c in cells812 if c.get("dup"))} 句）、平分 {sum(1 for c in cells812 if c["kind"] == "split")} 句（{len(split812)} 個互動點）；'
              f'AA_782 被取代 {len(data["superseded"])} 列：' + '、'.join(f'{x["who"]} {x["key"]}「{x["text"]}」' for x in data['superseded']))
        rw = [c for c in cells812 if c.get('was')]
        if rw:
            print(f'AA_812 的句子源稿後來換了字、跟著換 {len(rw)} 句（REWORD）：' + '、'.join(f'{c["who"]} {c["key"]}「{c["was"]}」→「{c["text"]}」（{c["by"]}）' for c in rw))
        if both:
            print('同一個互動點兩邊都有（不同的句子；演的時候最後說的那一句算）：' + '、'.join(f'{w} {p}' for w, p in both))
    js = ('/* 自動產生：tools/date/import_she_pays.py（' + data['src'] + '）。不要手改，改企劃 AA_782／AA_812 再重新匯入。\n'
          '   她請客的格：pays＝{她:{互動點 id:[那一句]}}，src/date3d.js 載入時合進 S.SHE_PAYS（她在那個互動點說了那一句的那一次，祐廷那一份不扣）；\n'
          '   split＝她付一部分（AA_812 SPLIT），合進 S.SPLIT（那一次祐廷那一份扣一半）；同一個互動點兩種都說了＝最後說的那一句算。\n'
          '   cells＝AA_782 每一列（格號 n＝date_rewrite.py list 的編號、key＝哪一套、at＝date_lines.js 裡的位置）；superseded＝AA_782 被 AA_812 換了字的列；cells812＝AA_812 每一句（dup＝已經有了、不重複）。\n'
          '   以安三格在 date3d.js 手寫（AA_780）。測試 tests/date_she_pays_1111_unit.js、tests/date_she_pays_812_1111_unit.js */\n'
          "'use strict';\nconst SHE_PAYS_DATA=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    out = sys.argv[sys.argv.index('--out') + 1] if '--out' in sys.argv else os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(out, encoding='utf-8').read() if os.path.exists(out) else ''
        if cur != js:
            raise SystemExit(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(out, 'w', encoding='utf-8').write(js)
    print('寫入', os.path.relpath(out, ROOT), why, {k: len(v) for k, v in data['pays'].items()})


if __name__ == '__main__':
    main()
