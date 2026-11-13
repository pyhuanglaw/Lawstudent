"""CC-C 11-14：WINVIEW-AUDIT-1105（BB-C 22:18，LAWWW2 要的公館三間窗景原位重拍）——在受測版本的工作樹套 LAWWW2 的 patch（只加 VIEWS 三列），
跑 tools/shots/shop_views_layers.py <url> gg_antai gg_xianguo gg_rongendian，把產出的 views/gg_*_{day,night}.webp、gg_*_near_*.webp、shop_views_layers.json 收進 OUT。
只拍、不判（換圖、VIEW_LAYERS、測試、並排圖由 LAWWW2 做，BB 判）。patch 原檔：claude/focused-cray-c9uwvw 358eb72339 docs/art-rebuild/second_ai/wip/winview_gg3_1113/gg3_views.patch（複本 fixtures/gg3_views_358eb72339.patch）。
CC_02 清單 2026-11-14：1n/a（時間照工具自己的 TIMES） 2✓（PC 工作樹是 CRLF，不用 git apply：照 patch 的 + 行插在錨點後面，錨點要剛好一次；插完確認三個名字都在 VIEWS） 3n/a（照工具） 4n/a（工具隱藏 NPC、玩家） 5n/a（不走路） 6n/a（照工具的等待） 7✓（lint） 8✓（只拍不判） 9✓（每個檔名、大小列出來） 10n/a（工具自己讀狀態） 11✓（佇列 game＋SCRIPT_FROM=cc＋SCRIPT_FILES 帶 patch、SHA 40 碼） 12✓（FAIL_SETUP：patch 套得上、三個名字都在、六張遠景都產出） 13n/a（不走路）
用法（cwd＝受測版本工作樹）：python3 cc_winview_patch_wrap.py <url> <out>"""
import os, sys, json, shutil, subprocess

URL, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)
HERE = os.path.dirname(os.path.abspath(__file__))
PATCH = os.path.join(HERE, 'fixtures', 'gg3_views_358eb72339.patch')
NAMES = ['gg_antai', 'gg_xianguo', 'gg_rongendian']
TOOL = os.path.join('tools', 'shots', 'shop_views_layers.py')
fails = []


def check(name, ok, info=''):
    print('%s %s  %s' % ('PASS' if ok else 'FAIL', name, info), flush=True)
    if not ok: fails.append(name)
    return ok


def done():
    print('ALL PASS' if not fails else 'FAILED %d: %s' % (len(fails), '；'.join(fails)), flush=True)
    sys.exit(1 if fails else 0)


print('CC WINVIEW-AUDIT-1105：工作樹 %s；網址 %s；patch %s' % (os.getcwd(), URL, PATCH), flush=True)
if not check('FAIL_SETUP 檢查：patch 檔在', os.path.exists(PATCH), PATCH): done()
if not check('FAIL_SETUP 檢查：工具在工作樹裡', os.path.exists(TOOL), TOOL): done()
# PC 的 repo 是 core.autocrlf=true（工作樹 CRLF），git apply 對 LF 的 patch 會對不上——照 patch 的「+」行自己插：插在 patch 的上一行 context（aoki 那一行）後面，換行照原檔
orig = open(TOOL, 'rb').read()
plines = open(PATCH, encoding='utf-8').read().split('\n')
adds = [l[1:] for l in plines if l.startswith('+') and not l.startswith('+++')]
ctx = [l[1:] for l in plines if l.startswith(' ')]
anchor = next((c for c in ctx if "'aoki':" in c), None)
txt = orig.decode('utf-8'); nl = '\r\n' if '\r\n' in txt else '\n'
if not check('FAIL_SETUP 檢查：patch 的錨點（aoki 那一行）在工具裡剛好一次', bool(anchor) and txt.count(anchor) == 1, repr(anchor)[:120]): done()
i = txt.index(anchor) + len(anchor); i = txt.index(nl, i) + len(nl)
open(TOOL, 'wb').write((txt[:i] + nl.join(adds) + nl + txt[i:]).encode('utf-8'))
print('照 patch 插了 %d 行（換行 %r）' % (len(adds), nl), flush=True)
src = open(TOOL, encoding='utf-8').read()
if not check('FAIL_SETUP 檢查：三個名字都在 VIEWS', all("'%s':" % n in src for n in NAMES), ''): done()
try:
    print('跑：%s %s %s' % (sys.executable, TOOL, ' '.join([URL] + NAMES)), flush=True)
    p = subprocess.run([sys.executable, TOOL, URL] + NAMES, capture_output=True, text=True, timeout=1800)
    print(p.stdout[-6000:], flush=True)
    if p.stderr.strip(): print('stderr：' + p.stderr[-3000:], flush=True)
    check('shop_views_layers.py 結束碼 0', p.returncode == 0, str(p.returncode))
    vd = os.path.join('assets', 'models', 'env', 'views'); od = os.path.join(OUT, 'views'); os.makedirs(od, exist_ok=True)
    got = []
    for f in sorted(os.listdir(vd)):
        if any(f.startswith(n + '_') for n in NAMES) and f.endswith('.webp'):
            shutil.copy2(os.path.join(vd, f), os.path.join(od, f)); got.append((f, os.path.getsize(os.path.join(vd, f))))
    print('收進 OUT/views：%s' % json.dumps(got, ensure_ascii=False), flush=True)
    want = ['%s_%s.webp' % (n, t) for n in NAMES for t in ('day', 'night')]
    check('六張遠景（gg_*_{day,night}.webp）都有', all(w in [g[0] for g in got] for w in want), json.dumps([w for w in want if w not in [g[0] for g in got]], ensure_ascii=False))
    near = [g[0] for g in got if '_near_' in g[0]]
    print('近景（_near_）：%s' % json.dumps(near, ensure_ascii=False), flush=True)
    jp = os.path.join('tools', 'shots', 'shop_views_layers.json')
    if check('shop_views_layers.json 在', os.path.exists(jp), jp):
        shutil.copy2(jp, os.path.join(OUT, 'shop_views_layers.json'))
        d = json.load(open(jp, encoding='utf-8'))
        print('三間的景深：%s' % json.dumps({k: v for k, v in d.items() if any(k.startswith(n) for n in NAMES)}, ensure_ascii=False), flush=True)
finally:
    open(TOOL, 'wb').write(orig)   # 工作樹還原（產出的圖已經收進 OUT）
    subprocess.run(['git', 'checkout', '--', 'tools/shots/shop_views_layers.json'], capture_output=True)
done()
