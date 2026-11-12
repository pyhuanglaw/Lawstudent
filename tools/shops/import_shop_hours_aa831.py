#!/usr/bin/env python3
"""AA_831：店面標準補字第一批——四間店的營業時間、公休、關著的時候到門口的那一句旁白（任務 SHOP-STANDARD-BACKFILL-1112；CLAUDE.md §12 第 5 點）。
企劃 docs/story_planning/AA_831_店面標準補字_營業時間.md（企劃線）的那一張表 → src/data/shop_hours_aa831.js（SHOP_HOURS_AA831）。
  shops.<區域>：name（稿的店名）、hours（稿的字，拿掉後面的括號說明）、open／close（小時）、off（公休的星期：0＝週日…6＝週六；「無」＝[]）、door（門口那一句旁白，一字照稿）。
真的檢查的時間在 src/data/places.js（PLACES.hours，手寫；tests/shop_hours_aa831_1112_unit.js 對這一份）；門口、打烊的流程在 src/shop_hours831_3d.js。
稿的格式變了（欄位、店名不認得、少一間）＝停下來。白名單照 import_guard；讀稿照 read_fix。AA 改稿以後：白名單換 sha → 跑這支 → 時間有改再改 places.js。
用法：python3 tools/shops/import_shop_hours_aa831.py [--ref <commit>] [--check]"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

PATH = 'docs/story_planning/AA_831_店面標準補字_營業時間.md'
OUT = 'src/data/shop_hours_aa831.js'
ZONES = {'公館燒臘': 'noodle', '頁間書屋': 'bookstore', '禮貌生財': 'tz_limao', '草原超市（美國）': 'us_market'}
WD = {'週日': 0, '週一': 1, '週二': 2, '週三': 3, '週四': 4, '週五': 5, '週六': 6}
HEAD = ['店', '營業時間', '公休', '打烊後、還沒開門到門口']


def die(m):
    raise SystemExit('import_shop_hours_aa831：' + m)


def git(*a):
    return subprocess.check_output(['git', '-C', ROOT] + list(a)).decode('utf-8')


def hm(s):
    h, m = s.split(':')
    return int(h) + int(m) / 60


def build(md):
    rows = [[c.strip() for c in l.strip().strip('|').split('|')] for l in md.splitlines() if l.strip().startswith('|')]
    if len(rows) < 3 or rows[0] != HEAD:
        die(f'表頭不是 {HEAD}（稿的格式變了）')
    shops = {}
    for r in rows[2:]:
        if len(r) != 4:
            die(f'這一列不是四欄：{r}')
        name, hours, off, door = r
        if name not in ZONES:
            die(f'不認得的店：{name}')
        m = re.match(r'^(\d\d:\d\d)～(\d\d:\d\d)(（.*）)?$', hours)
        if not m:
            die(f'{name}：營業時間看不懂（{hours}）')
        if off == '無':
            offs = []
        else:
            parts = off.split('、')
            if any(x not in WD for x in parts):
                die(f'{name}：公休看不懂（{off}）')
            offs = [WD[x] for x in parts]
        door = IG.read_fix(door)
        if not re.fullmatch(r'（.+）', door):
            die(f'{name}：門口那一句要是旁白（…）')
        shops[ZONES[name]] = {'name': name, 'hours': m.group(1) + '～' + m.group(2), 'open': hm(m.group(1)), 'close': hm(m.group(2)), 'off': offs, 'door': door}
    miss = [n for n, z in ZONES.items() if z not in shops]
    if miss:
        die(f'稿上少了：{miss}')
    return shops


def main():
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == PATH and e.get('status') == 'approved']
    if not hits:
        die(f'{PATH}：不在匯入白名單')
    sha = sys.argv[sys.argv.index('--ref') + 1] if '--ref' in sys.argv else hits[-1]['sha']
    ok, why = IG.allowed(PATH, sha, allow)
    if not ok:
        raise SystemExit(why)
    data = {'src': f'{PATH}@{sha}', 'shops': build(git('show', f'{sha}:{PATH}'))}
    js = ('/* 自動產生：tools/shops/import_shop_hours_aa831.py（' + data['src'] + '）。不要手改，改企劃 AA_831 再重新匯入。\n'
          '   四間店的營業時間、公休、關著的時候到門口的那一句旁白——src/shop_hours831_3d.js 讀；真的檢查的時間在 src/data/places.js；逐字對稿 tests/shop_hours_aa831_1112_unit.js */\n'
          "'use strict';\nconst SHOP_HOURS_AA831=" + json.dumps(data, ensure_ascii=False, indent=1) + ';\n')
    p = os.path.join(ROOT, OUT)
    if '--check' in sys.argv:
        cur = open(p, encoding='utf-8').read() if os.path.exists(p) else ''
        if cur != js:
            die(f'{OUT} 和 {data["src"]} 不一樣：重新匯入')
        print('OK', why)
        return
    open(p, 'w', encoding='utf-8').write(js)
    print('寫入', OUT, why)


if __name__ == '__main__':
    main()
