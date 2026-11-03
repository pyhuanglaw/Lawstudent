#!/usr/bin/env python3
"""店內偶遇（SHOP-ENCOUNTER-1103，AA_632、AA_633）＋店裡客人的路人句（SHOP-DINERS-1103，AA_640）→ src/data/shop_enc.js。
只從劇情匯入白名單上的版本讀（tools/story/import_guard.py；docs/handoff/story_import_allow.json），不讀分支上的最新檔。
台詞一字不改照 AA 的 JSON（讀稿照慣例先走 import_guard.read_fix：Alison、WORLD_NAMING、AA 後來的全遊戲改字；有換到會印出來）。
AA_634（第三批，新店）這次不接：新店還沒進遊戲。讀檔程式（src/shopenc3d.js）認得它的 needFlags、onlyBoardgameNight，之後把那一份加進白名單和下面的 SRC 就能用。
用法：python3 tools/shop_enc/import_shop_enc.py [--check]（--check：只比對，不寫檔；和現有的 shop_enc.js 不同就結束碼 1）"""
import json, os, re, subprocess, sys
ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as IG

V1 = 'docs/story_planning/shop_enc/shop_enc_aa_v1.json'
V2 = 'docs/story_planning/shop_enc/shop_enc_aa_v2.json'
HEAR = 'docs/story_planning/AA_640_店裡客人的路人句.md'
OUT = os.path.join(ROOT, 'src', 'data', 'shop_enc.js')
FIXED = []


def src(path):
    allow = IG.load(ROOT)
    hits = [e for e in allow.get('files', []) if e.get('path') == path and e.get('status') == 'approved']
    if not hits: sys.exit(path + '：不在匯入白名單')
    sha = hits[-1]['sha']; ok, why = IG.allowed(path, sha, allow)
    if not ok: sys.exit(why)
    return sha, subprocess.check_output(['git', 'show', f'{sha}:{path}'], cwd=ROOT).decode('utf-8')


def fix(o):
    """每一個字串走 read_fix（和其他匯入工具一樣）；有換到的記下來印出"""
    if isinstance(o, str):
        f = IG.read_fix(o)
        if f != o: FIXED.append((o, f))
        return f
    if isinstance(o, list): return [fix(x) for x in o]
    if isinstance(o, dict): return {k: fix(v) for k, v in o.items()}
    return o


def build():
    s1, t1 = src(V1); s2, t2 = src(V2); s3, t3 = src(HEAR)
    a, b = json.loads(t1), json.loads(t2)
    rows = []
    for r in a['rows'] + b['rows']:
        r = dict(r)
        # AA_633 表下第一點：學姊「只有玩家自己走進定食店才會遇到，不是固定作息去等她；一週最多一次」（JSON 沒有欄位）
        if r.get('who') == 'heroine_05' and r.get('spot') == 'wz_teishoku':
            r['weekMax'] = 1; r['selfOnly'] = True
        rows.append(r)
    m = re.search(r'```json\s*(\{.*?\})\s*```', t3, re.S)
    if not m: sys.exit(HEAR + '：找不到 JSON')
    hear = json.loads(m.group(1))
    if len(hear.get('dine', [])) != 8 or len(hear.get('quiet', [])) != 7 or len(hear.get('cvs', [])) != 6: sys.exit(HEAR + '：句數和稿不同')
    use = re.search(r'書店用\s*1～6，Café\s*用\s*2～5、7', t3)
    if not use: sys.exit(HEAR + '：找不到「書店用 1～6，Café 用 2～5、7」')
    ex = re.search(r'考試週（第 16 週）可以加一句給 ②：「(.+?)」', t3)
    if not ex: sys.exit(HEAR + '：找不到考試週那一句')
    hear['quietUse'] = {'book': [0, 1, 2, 3, 4, 5], 'cafe': [1, 2, 3, 4, 6]}   # 第幾句（0 起）：書店 1～6、Café 2～5、7
    hear['quietExam'] = ex.group(1)   # LAWWW 決定加（AA_640 給 LAWWW 的小註最後一點）：只在考試週、放 quiet
    d = {'src': [V1 + '@' + s1, V2 + '@' + s2, HEAR + '@' + s3],
         'rules': {'v1': a.get('rules'), 'v2': b.get('rules')},
         'rows': rows, 'newPeople': a.get('newPeople', []), 'shopkeepers': b.get('shopkeepers', []),
         'hear': hear}
    return fix(d)


def main():
    d = build()
    js = ('/* 店內偶遇（SHOP-ENCOUNTER-1103；AA_632 第一批、AA_633 第二批）＋店裡客人的路人句（SHOP-DINERS-1103；AA_640）。自動產生，不要手改：python3 tools/shop_enc/import_shop_enc.py\n'
          '   來源：' + '、'.join(d['src']) + '（劇情匯入白名單）。台詞照抄 AA 的 JSON。\n'
          '   rows 的格式照 src/data/encounters.js（spot＝店的 zone id；巷口茶飲 wz_tea、夏日冰菓室 wz_ice 是溫州街的外帶窗口）；AA_633 的 examOK、months；學姊定食店的 weekMax、selfOnly 是匯入工具照 AA_633 表下第一點加的。\n'
          '   程式：src/shopenc3d.js（SHOPENC）。*/\n'
          'const SHOP_ENC=' + json.dumps(d, ensure_ascii=False, indent=1) + ';\n'
          "if(typeof module!=='undefined') module.exports=SHOP_ENC;\n")
    if FIXED:
        for o, f in FIXED: print('read_fix 換了：', o, '→', f)
    if '--check' in sys.argv:
        cur = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        print('一致' if cur == js else '不一致'); sys.exit(0 if cur == js else 1)
    open(OUT, 'w', encoding='utf-8').write(js); print('寫好', OUT, len(d['rows']), '列', len(d['newPeople']), '位新認識的人', len(d['shopkeepers']), '位店員')


main()
