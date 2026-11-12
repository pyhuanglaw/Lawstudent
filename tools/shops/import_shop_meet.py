#!/usr/bin/env python3
"""SHOP-LIFE-AA826-1112：店員的進門招呼（山嵐書店、大步球鞋、好拍運動、新生運動廣場）和「吃飯時間在店裡遇到同學」的第一句，
從 AA 的稿（AA_826_shop_backfill_1.json）匯進 src/data/shop_meet_lines.js（SHOP_MEET_LINES）。流程在 src/shopmeet3d.js，這支只搬字。

和 tools/shops/import_tz_meals.py 同一個做法：來源照 docs/handoff/story_import_allow.json 的 sha（import_guard 擋）、字一字照稿（只過 import_guard.read_fix 的換名；被換到會印出來）、
稿的結構和這支認得的不一樣（多了不認得的欄位、少了欄位、型別不對、不認得的店或人）＝停下來，不會默默丟掉。

稿的格式（AA_826）：
  staff_greet {<店>: {who, greet[3]}}　店＝shanlan／dabu／haopai／xsports（ZONE_OF 對到區域 id）
  meal_hello {note, when, <人物 id>: [兩句], <人物 id>_dating: [兩句]}　人物 id＝src/data/characters.js 的 id；_dating＝交往中用的那一組
  lawww_answers（給 LAWWW 的回覆，不是台詞：不匯）、_meta（不匯）
資料檔的格式：
  staffGreet {<區域 id>: {who, lines[]}}　mealHello {<人物 id>: {base[], dating[]?}}（（）包起來的那一句是旁白，流程那邊看括號）

測試：node tests/shop_meet_aa826_1112_unit.js（逐字對稿）。
用法：python3 tools/shops/import_shop_meet.py [--check]（--check：只比對，資料檔和稿匯出來的不一樣＝結束碼 1）"""
import json, os, re, subprocess, sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

OUT = 'src/data/shop_meet_lines.js'
PATH = 'docs/story_planning/AA_826_shop_backfill_1.json'
SHA = 'ed20b301ab'   # STALE-SOURCES-1112（AA-C 11-12）：前任恢復在…那一筆（舊 f231f0514）
ZONE_OF = {'shanlan': 'xs_shanlan', 'dabu': 'xs_dabu', 'haopai': 'xs_haopai', 'xsports': 'xs_xsports'}   # 稿的店 → 區域 id
CHANGED = []


def die(m):
    raise SystemExit('import_shop_meet：' + m)


def git(*a):
    return subprocess.check_output(['git'] + list(a), cwd=ROOT).decode('utf-8')


def fix(x, where):
    if not isinstance(x, str) or not x.strip():
        die(f'{where}：要是一句字（{x!r}）')
    y = IG.read_fix(x)
    if y != x:
        CHANGED.append(f'{where}：「{x}」→「{y}」')
    return y


def keys(o, need, where, opt=()):
    if not isinstance(o, dict):
        die(f'{where}：要是物件')
    miss = [k for k in need if k not in o]
    more = [k for k in o if k not in need and k not in opt]
    if miss or more:
        die(f'{where}：少了 {miss}、不認得 {more}（稿改了：先改這支工具和 src/shopmeet3d.js）')
    return o


def strs(a, where, n):
    if not isinstance(a, list) or len(a) != n:
        die(f'{where}：要剛好 {n} 句')
    return [fix(x, f'{where}[{i}]') for i, x in enumerate(a)]


def build():
    ok, why = IG.allowed(PATH, SHA, IG.load(ROOT))
    if not ok:
        die(why)
    try:
        doc = json.loads(git('show', f'{SHA}:{PATH}'))
    except subprocess.CalledProcessError:
        die(f'讀不到 {SHA}:{PATH}（淺層複本：git fetch origin claude/magical-albattani-bk7b4n）')
    keys(doc, ['staff_greet', 'meal_hello'], 'AA_826', opt=['_meta', 'lawww_answers'])
    sg = keys(doc['staff_greet'], list(ZONE_OF), 'staff_greet')
    greet = {}
    for k, zone in ZONE_OF.items():
        v = keys(sg[k], ['who', 'greet'], f'staff_greet.{k}')
        greet[zone] = {'who': fix(v['who'], f'staff_greet.{k}.who'), 'lines': strs(v['greet'], f'staff_greet.{k}.greet', 3)}
    mh = doc['meal_hello']
    if not isinstance(mh, dict):
        die('meal_hello：要是物件')
    chars = open(os.path.join(ROOT, 'src/data/characters.js'), encoding='utf-8').read()
    hello = {}
    for k, v in mh.items():
        if k in ('note', 'when'):
            continue
        m = re.match(r'^(.+?)(_dating)?$', k)
        cid, dating = m.group(1), bool(m.group(2))
        if not re.search(r'\bid:\s*["\']%s["\']' % re.escape(cid), chars):
            die(f'meal_hello.{k}：src/data/characters.js 沒有 {cid} 這個人')
        hello.setdefault(cid, {})['dating' if dating else 'base'] = strs(v, f'meal_hello.{k}', 2)
    for cid, v in hello.items():
        if 'base' not in v:
            die(f'meal_hello.{cid}_dating：只有交往中的那一組，沒有平常的')
    return {'staffGreet': greet, 'mealHello': hello}


def render(data):
    head = ('/* ===== 店員的進門招呼、吃飯時間在店裡遇到同學的第一句（SHOP-LIFE-AA826-1112）——自動產生，不要手改 =====\n'
            f'   來源：企劃線 {SHA} 的 {PATH}（AA 定稿 D109；白名單 docs/handoff/story_import_allow.json）。\n'
            '   產生：python3 tools/shops/import_shop_meet.py（字一字照稿；格式說明在那支工具開頭）。\n'
            '   流程在 src/shopmeet3d.js；測試 node tests/shop_meet_aa826_1112_unit.js（逐字對稿）。 */\n')
    body = 'const SHOP_MEET_LINES={\n' + ',\n'.join(f'  {json.dumps(k)}:{json.dumps(v, ensure_ascii=False, separators=(",", ":"))}' for k, v in data.items()) + '\n};\n'
    body += 'SHOP_MEET_LINES._src=' + json.dumps({'sha': SHA, 'doc': PATH}, ensure_ascii=False, separators=(',', ':')) + ';\n'
    return head + "'use strict';\n" + body


def main():
    text = render(build())
    path = os.path.join(ROOT, OUT)
    for c in CHANGED:
        print('換名：' + c)
    if '--check' in sys.argv:
        old = open(path, encoding='utf-8').read() if os.path.exists(path) else ''
        if old != text:
            print(f'{OUT} 和稿匯出來的不一樣（重新跑 python3 tools/shops/import_shop_meet.py）')
            sys.exit(1)
        print(f'{OUT} 和稿一致')
        return
    with open(path, 'w', encoding='utf-8') as f:
        f.write(text)
    print(f'寫入 {OUT}')


if __name__ == '__main__':
    main()
