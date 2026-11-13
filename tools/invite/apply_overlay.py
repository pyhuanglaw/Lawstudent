#!/usr/bin/env python3
"""邀約的手寫資料檔 src/data/invites.js 的覆蓋層（X324 D 區；AA_783 的 invites 列、AA_784……；LAWWW 2026-11-11 定）。
稿＝白名單上 overlay:true 的稿（tools/story/overlay_rows.py）裡 file 是 'invites' 的列：{who, at, old, new}，at＝INVITE_DATA 底下的路徑（people.<id>.acc.cafe.A[0]、libStudy.first.<id>.sit…）。
invites.js 是手寫的（不是產生檔），所以這支工具直接改原始碼：
  1. 換字＝改原始碼文字：old 照 JS 字串寫法（'…' 或 "…"，跳脫照寫）在 invites.js 原始碼裡要剛好出現一次（整個字串，不是某個字串的一部分）→ 換成 new。
     例外：原始碼寫了 n 次、稿上剛好 n 列（n 個不同的 at）都是這一句、換成同一句新字＝n 處一起換（不用 at 分辨；例：阿語 w118_yu_1 有沒有早餐的兩個版本同一句）。
     同一句在 INVITE_DATA 會掛在好幾個路徑（例：walk118 組進 people.<id>.walk），字真正寫在原始碼一處，換那一處就全部跟著換。
     出現 0 次＝停（除非已經換好：at 那一格已經是 new、原始碼也沒有 old）；2 次以上＝停下來列出來（要 at 才能分辨的，LAWWW 再跟 AA 定）。
  2. at 當驗證：換之前把 invites.js 在 Node 載起來（tools/invite/js_leaves.js），at 那一格要剛好等於 old；換完重載，at 那一格要等於 new，
     而且 INVITE_DATA 裡任何地方都不能再有 old（舊句一個不剩；函式的原始碼也算），換掉的格子以外（含條件、k、st、選項的字、函式）一格都不能變。
  3. 不換玩家的選項字：at 是 …ch[i].t（選項）＝停（ch[i].r 回話可以）。who 不是 (共用) 的，at 要在 people.<who> 底下。
用法：python3 tools/invite/apply_overlay.py [--check] [--dry]
  --check：只檢查（每一列 at 那一格已經是 new、原始碼沒有 old、其他格子和重套一樣）；沒套到的列出來、結束碼 1。
  --dry：照常檢查、算出結果，不寫檔（印每一列換到哪裡）。
測試：tests/invite_overlay_1111_unit.js"""
import json, os, re, subprocess, sys, tempfile
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import overlay_rows as OV

FILE = 'src/data/invites.js'
LEAVES = os.path.join(ROOT, 'tools', 'invite', 'js_leaves.js')


def leaves(text):
    """invites.js 的文字 → {路徑: 字串（函式＝'ƒ'＋原始碼）}"""
    with tempfile.TemporaryDirectory() as td:
        p = os.path.join(td, 'invites.js')
        open(p, 'w', encoding='utf-8').write(text)
        return json.loads(subprocess.check_output(['node', LEAVES, p, 'INVITE_DATA'], text=True))


def lits(s):
    """一句話在 JS 原始碼裡可能的寫法（單引號、雙引號）"""
    b = s.replace('\\', '\\\\').replace('\n', '\\n')
    return ["'" + b.replace("'", "\\'") + "'", '"' + b.replace('"', '\\"') + '"']


def count(text, s):
    return sum(text.count(x) for x in lits(s))


# CANON-NO-ECON-1112 第四批四（AA_894 第 4 節、AA_901 第 8 項，AA-C 定稿）：invites.js 以 src 對照表 AA_886～AA_901 為準。
# ①整個拿掉的那一格（子晴 ZQ_CHANGE_ASK、芯慈 w118_xc_10）：稿上 at 在那一格底下的列略過；同一個陣列後面的列序號往前移一格再對。
# ②稿上那一格被 AA_894 換成新字的列（覆蓋層的 new 已經不是遊戲的字）：略過。兩種都印出來，不算沒套到。
CANON1112_GONE = [('people.heroine_04.walk.any', 1, "once:'ZQ_CHANGE_ASK'"), ('people.classmate_xinci.walk.any', 7, "one:'w118_xc_10'"), ('walk118.classmate_xinci', 9, "one:'w118_xc_10'")]
CANON1112_SUPERSEDED = {'people.kexin.first.lake[0]': 'AA_894 第 4 節 305 列（映月湖 first）', 'people.kexin.sport.gym_badminton.during[2][0]': 'AA_940 第 2 節（羽球 during）'}


def canon1112(rows):
    out, skip = [], []
    for x in rows:
        at = x['at']
        if at in CANON1112_SUPERSEDED:
            skip.append(f'{x["src"]} {x["who"]} {at}：略過（{CANON1112_SUPERSEDED[at]} 換過，src 以 AA_886～901 為準）'); continue
        for pre, k, what in CANON1112_GONE:
            m = re.match(re.escape(pre) + r'\[(\d+)\](.*)$', at)
            if not m:
                continue
            i = int(m.group(1))
            if i == k:
                skip.append(f'{x["src"]} {x["who"]} {at}：略過（{what} 那一格整個拿掉，AA_894 第 4 節）'); at = None
            elif i > k:
                at = f'{pre}[{i - 1}]{m.group(2)}'
            break
        if at is None:
            continue
        out.append(dict(x, at=at) if at != x['at'] else x)
    return out, skip


def main():
    rows, skipped = canon1112(OV.rows(ROOT, 'invites'))
    for s in skipped:
        print(s)
    path = os.path.join(ROOT, FILE)
    text0 = open(path, encoding='utf-8').read()
    L0 = leaves(text0)
    bad, plan, done = [], [], []
    for x in rows:
        w = f'{x["src"]} {x["who"]} {x["at"]}'
        toks = OV.parse(x['at'])
        if x['who'] != '(共用)' and toks[:2] != ['people', x['who']]:
            bad.append(f'{w}：at 不在 people.{x["who"]} 底下'); continue
        if len(toks) >= 3 and toks[-1] == 't' and isinstance(toks[-2], int) and toks[-3] in ('ch', 'choice', 'opts'):
            bad.append(f'{w}：at 是玩家選項的字（{toks[-3]}[i].t），不換'); continue
        cur = L0.get(x['at'])
        n_old, n_new = count(text0, x['old']), count(text0, x['new'])
        if cur == x['new'] and n_old == 0:
            done.append(x); continue
        if cur != x['old']:
            bad.append(f'{w}：at 那一格現在是 {json.dumps(cur, ensure_ascii=False)}，不是稿的 old「{x["old"]}」（對不到，不猜）'); continue
        same = [y for y in rows if y['old'] == x['old']]
        if n_old != 1 and not (n_old == len(same) and len({y['new'] for y in same}) == 1 and len({y['at'] for y in same}) == n_old):
            where = [m.start() for lit in lits(x['old']) for m in re.finditer(re.escape(lit), text0)]
            lines = sorted({text0.count('\n', 0, k) + 1 for k in where})
            sub = text0.count(x['old'])
            bad.append(f'{w}：「{x["old"]}」在 {FILE} 原始碼整個字串出現 {n_old} 次（第 {lines} 行；字面子字串 {sub} 次；稿上同一句 {len(same)} 列）——要剛好一次'); continue
        plan.append(x)
    if '--check' in sys.argv:
        pend = [f'{x["src"]} {x["who"]} {x["at"]}：還沒換（「{x["old"]}」→「{x["new"]}」）' for x in plan]
        if bad or pend:
            raise SystemExit('\n'.join(bad + pend))
        print(f'OK {FILE}：{len(done)} 列都已經是新字（{"、".join(OV.sources(ROOT, "invites"))}）')
        return
    if bad:
        raise SystemExit('\n'.join(bad))
    text = text0
    olds = {x['old'] for x in plan}
    for o in sorted(olds):   # 同一句舊字原始碼寫了 n 次、稿上剛好 n 列（不同的 at）都換成同一句新字＝n 處一起換（例：阿語 w118_yu_1 兩個版本同一句）；n 對不上上面已經停了
        x = next(y for y in plan if y['old'] == o)
        a, b = lits(o), lits(x['new'])
        n = sum(1 for y in plan if y['old'] == o)
        k = [i for i in (0, 1) if text.count(a[i]) > 0]
        if sum(text.count(a[i]) for i in (0, 1)) != n:
            raise SystemExit(f'{x["at"]}：「{o}」換到一半個數不對（前面的列換掉了同一句？）')
        for i in k:
            text = text.replace(a[i], b[i])
    L1 = leaves(text)
    err = []
    if set(L0) != set(L1):
        err.append(f'換完以後路徑變了：少了 {sorted(set(L0) - set(L1))[:5]}、多了 {sorted(set(L1) - set(L0))[:5]}')
    for x in plan:
        if L1.get(x['at']) != x['new']:
            err.append(f'{x["at"]}：換完以後是 {json.dumps(L1.get(x["at"]), ensure_ascii=False)}，不是 new')
    left = sorted(p for p, v in L1.items() if v in olds or (v.startswith('ƒ') and any(count(v, o) for o in olds)))
    if left:
        err.append(f'換完以後 INVITE_DATA 還有舊句：{left[:8]}')
    rep = {}
    for x in plan:
        rep[x['old']] = x['new']
    for p in set(L0) & set(L1):
        a, b = L0[p], L1[p]
        if a == b:
            continue
        if a.startswith('ƒ'):
            want = a
            for o, n in rep.items():
                for lo, ln in zip(lits(o), lits(n)):
                    want = want.replace(lo, ln)
            if want != b:
                err.append(f'{p}：函式變了，而且不只是換那幾句')
        elif rep.get(a) != b:
            err.append(f'{p}：「{a}」→「{b}」不是稿上的列')
    if err:
        raise SystemExit('\n'.join(err))
    changed = sum(1 for p in L0 if L0[p] != L1.get(p))
    for x in plan:
        al = sorted(p for p in L1 if L1[p] == x['new'] and L0.get(p) == x['old'])
        print(f'{x["who"]} {x["at"]}：「{x["old"]}」→「{x["new"]}」（同一個字串掛在 {len(al)} 個路徑）')
    print(f'{FILE}：換 {len(plan)} 列（已經是新字 {len(done)} 列），INVITE_DATA 變了 {changed} 格；來源 {"、".join(OV.sources(ROOT, "invites"))}')
    if '--dry' not in sys.argv:
        open(path, 'w', encoding='utf-8').write(text)


if __name__ == '__main__':
    main()
