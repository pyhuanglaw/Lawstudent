#!/usr/bin/env python3
"""依賴檢查器：算出「遊戲執行需要的檔案集合」，和實際檔案比對（REL-PACKAGING-1111，USER_WANTS X340）。

用法：
  python3 tools/release/deps.py                      # 印摘要
  python3 tools/release/deps.py --json out.json      # 完整結果（每個檔被哪條規則決定）
  python3 tools/release/deps.py --md out.md          # 給人看的報告
  python3 tools/release/deps.py --root <另一棵樹> --target win-stage --no-runtime

只讀檔，不改任何東西。規則說明：docs/RELEASE_PACKAGING.md 第 3、4 節。

四種來源一起算（缺一種都可能漏包）：
  A 入口：index.html 的 <script src>、<link href>、<img src>、CSS url()。
  B 靜態路徑：index.html 載入的每支 JS 裡，寫成完整路徑的字串（'assets/…/x.glb'；註解裡的不算，另外列）。
  C 動態路徑：'assets/portraits/'+id+'/'+outfit+'/'+expr+'.webp' 這種拼出來的 → 用「前綴＋副檔名」的目錄級規則整批保留。
  D 執行期表：在 Node 載入全部 script，讀 ASSETS.manifest（含別的模組載入時加進去的）、遠距離版本（A.lodUrl）、立繪表、CG 表等。
  E 模型檔裡面的引用：GLB／VRM 的 extras 寫的路徑（光照貼圖 extras.lightmap.day／night）、images／buffers 的外部 uri。
assets/ 底下沒有被 A～E 任何一條指到的檔：**一律保留**，列進「無法判定（保留）」請人確認——不因為搜尋不到引用就排除模型。
結束碼：0 正常；1＝有「需要但不存在」的檔（會 404）或有還沒決定的頂層檔；2＝執行錯誤。
"""
import argparse, json, pathlib, re, subprocess, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import relcommon as rc

TARGETS = ('web', 'win-stage')

# ---------- 排除規則（確定是開發檔；理由寫在 docs/RELEASE_PACKAGING.md 第 3 節） ----------
DEV_DIRS = [   # (前綴, 規則 ID, 說明)
    ('.git/', 'X1-GIT', 'Git 歷史'),
    ('.github/', 'X1-CI', 'GitHub Actions 設定'),
    ('.claude/', 'X1-AI', 'AI Skills 與工作階段設定'),
    ('docs/', 'X1-DOCS', '文件、交班資料、測試報告、規格書'),
    ('tests/', 'X1-TESTS', '測試程式與測試資料'),
    ('tools/', 'X1-TOOLS', '開發工具（Blender 腳本、產生器、交班工具、打包工具）'),
    ('wip_backup/', 'X1-BACKUP', '備份（git bundle 等）'),
    ('assets/blender/', 'X3-BLEND', 'Blender 工作原檔'),
    ('build/', 'X4-BUILD', 'build.py 的輸出（單檔版與 Base64 JSON）'),
    ('dist/', 'X4-DIST', '打包輸出'),
    ('node_modules/', 'X1-NODE', 'Node 套件'),
]
DEV_FILES = {   # 路徑: (規則 ID, 說明)
    'build.py': ('X2-DEVFILE', '單檔版建置腳本（claude.ai artifact 用），遊戲不讀'),
    'test_charlook.html': ('X2-DEVFILE', '人物外觀測試頁，index.html 沒有連到'),
    'CLAUDE.md': ('X2-DEVFILE', 'AI 共同規則'),
    'README.md': ('X2-DEVFILE', '專案說明（遊戲不讀；Pages 會服務，但不是遊戲檔）'),
    '.gitignore': ('X2-DEVFILE', 'Git 設定'),
    '.env.example': ('X2-DEVFILE', '說明用空檔'),
}
DEV_SUFFIX = [   # (結尾, 規則 ID, 說明)：任何目錄都算
    ('.blend', 'X3-BLEND', 'Blender 工作原檔'),
    ('.blend1', 'X3-BLEND', 'Blender 自動備份'),
    ('.glb.json', 'X4-B64', 'build.py 產生的 Base64 JSON（GLB）'),
    ('.vrm.json', 'X4-B64', 'build.py 產生的 Base64 JSON（VRM）'),
    ('.gltf.json', 'X4-B64', 'build.py 產生的 Base64 JSON'),
]
# 不是遊戲檔、但要跟著發行包走的
EXTRA_INCLUDE = {   # 路徑: (規則 ID, 說明, 哪些 target)
    'LICENSES.md': ('R8-LICENSE', '素材授權與標示（Seed-san 等要求標示，發行包一定要帶）', TARGETS),
    '.nojekyll': ('R9-PAGES', 'GitHub Pages 設定（不跑 Jekyll）；只有網頁版需要', ('web',)),
}
# 靜態掃描看不出來的衍生路徑（程式用字串取代算出來的）：寫死在這裡，tests/release_pack_unit.js 釘住程式那一行還在
DERIVED_RULES = [
    {'id': 'R6-DERIVED-LOD', 'prefix': 'assets/models/char/second_ai/lod/', 'exts': ['glb'],
     'why': "路人底模的遠距離版本：src/assets3d.js 的 A.lodUrl 把 …/bl_npc_x.vrm 換成 …/lod/bl_npc_x.lod.glb",
     'pin': ('src/assets3d.js', "'/lod/$1.lod.glb'")},
]
# 執行期資料表裡「預留格」：表上有路徑、但遊戲先查有沒有圖才載入，所以檔案不存在不算缺檔
OPTIONAL_TABLES = {
    'PORTRAITS': '立繪預留格：PORTRAITS 列出每個人可能有的服裝×表情；實際載入前先查 PORTRAIT_FILES（tools/gen_portrait_manifest.py 掃出來的現有檔），沒有圖就用 compact 對話模式',
}
ASSET_EXTS = 'glb|vrm|gltf|bin|ktx2|webp|png|jpe?g|gif|svg|json|mp3|ogg|wav|m4a|woff2?|ttf|otf|mp4|webm'
_ASSET_AT = re.compile(r'(?<![\w/.\-])assets/[A-Za-z0-9_\-./]*')
_EXT_TAIL = re.compile(r'\.(?:' + ASSET_EXTS + r')$')
_EXT_AHEAD = re.compile(r'\.(' + ASSET_EXTS + r')[\'"`]')
_RAW_STATIC = re.compile(r'(?<![\w/.\-])assets/[A-Za-z0-9_\-./]*\.(?:' + ASSET_EXTS + r')(?![A-Za-z0-9])')


def _local(ref):
    ref = ref.split('#')[0].split('?')[0]
    return ref


def scan_index(html):
    """index.html 的入口引用。回傳 (scripts, others, external)；都是去掉 ?v= 的路徑。"""
    scripts, others, external = [], [], []
    def add(lst, ref):
        if ref.startswith('data:') or ref.startswith('#') or ref.startswith('javascript:') or not ref:
            return
        if re.match(r'^(https?:)?//', ref):
            if ref not in external:
                external.append(ref)
            return
        r = _local(ref)
        if r and r not in lst:
            lst.append(r)
    for m in re.finditer(r'<script\b[^>]*\ssrc="([^"]+)"', html):
        add(scripts, m.group(1))
    for m in re.finditer(r'<link\b[^>]*\shref="([^"]+)"', html):
        add(others, m.group(1))
    for m in re.finditer(r'<(?:img|audio|video|source|iframe)\b[^>]*\ssrc="([^"]+)"', html):
        add(others, m.group(1))
    for m in re.finditer(r'url\(\s*[\'"]?([^)\'"\s]+)', html):
        if '+' in m.group(1):
            continue
        add(others, m.group(1))
    return scripts, others, external


def scan_js(path, text, static, comment_only, dynamic):
    """掃一支 JS：static[路徑]→[檔:行]；dynamic[(前綴, exts)]→[檔:行]；comment_only：只在註解（或掃不到的地方）出現的完整路徑。"""
    found_code = set()
    for (a, b, val, kind) in rc.js_strings(text):
        if 'assets/' not in val:
            continue
        for m in _ASSET_AT.finditer(val):
            p = m.group(0)
            where = '%s:%d' % (path, rc.line_of(text, a))
            if _EXT_TAIL.search(p) and not val[m.end():m.end() + 1].isalnum():
                static.setdefault(p, []).append(where)
                found_code.add(p)
                continue
            # 動態：前綴後面接變數。往後找這個算式的副檔名（同一個樣板字串裡，或原始碼往後 300 個字元以內）
            rest = val[m.end():] if kind == 'tpl' else ''
            exts = set(x.group(1) for x in _EXT_AHEAD.finditer(rest + '`'))
            if not exts:
                exts = set(x.group(1) for x in _EXT_AHEAD.finditer(text[b - 1:b + 300]))
            exts = sorted('jpg' if e in ('jpeg',) else e for e in exts)
            dynamic.setdefault((p, tuple(exts)), []).append(where)
    for m in _RAW_STATIC.finditer(text):
        p = m.group(0)
        if p not in found_code:
            comment_only.setdefault(p, []).append('%s:%d' % (path, rc.line_of(text, m.start())))


def glb_json(path):
    """讀 GLB／VRM 的 JSON 區塊（不讀幾何資料）；不是 GLB 就回 None。"""
    import struct
    try:
        with open(path, 'rb') as f:
            hdr = f.read(12)
            if len(hdr) < 12 or hdr[:4] != b'glTF':
                return None
            clen, ctype = struct.unpack('<I4s', f.read(8))
            if ctype != b'JSON':
                return None
            return json.loads(f.read(clen).decode('utf-8'))
    except Exception:
        return None


def scan_glb_refs(root, files):
    """GLB／VRM 檔裡面指到的外部檔：extras 裡寫的 assets/ 路徑（例如光照貼圖 extras.lightmap.day／night）、
    images／buffers 的外部 uri（相對於 GLB 所在的目錄）。回傳 {路徑: [來源]}、壞掉讀不了的 GLB 清單。"""
    refs, bad = {}, []
    pat = re.compile(r'^assets/[A-Za-z0-9_\-./]+\.(?:' + ASSET_EXTS + r')$')
    for f in files:
        if not (f.startswith('assets/') and f.rsplit('.', 1)[-1].lower() in ('glb', 'vrm')):
            continue
        j = glb_json(pathlib.Path(root) / f)
        if j is None:
            bad.append(f)
            continue
        def walk(v, key, depth):
            if depth > 12:
                return
            if isinstance(v, str):
                if pat.match(v):
                    refs.setdefault(v, []).append('%s（%s）' % (f, key))
                return
            if isinstance(v, list):
                for x in v:
                    walk(x, key, depth + 1)
            elif isinstance(v, dict):
                for k, x in v.items():
                    walk(x, k if key in ('', 'extras') else key + '.' + k, depth + 1)
        for top in ('extras', 'scenes', 'nodes', 'materials', 'meshes'):
            for item in (j.get(top) if isinstance(j.get(top), list) else [j.get(top)] if j.get(top) else []):
                if isinstance(item, dict) and 'extras' in item:
                    walk(item['extras'], 'extras', 0)
                elif top == 'extras':
                    walk(item, 'extras', 0)
        for top in ('images', 'buffers'):
            for item in j.get(top) or []:
                u = item.get('uri') if isinstance(item, dict) else None
                if u and not u.startswith('data:'):
                    import posixpath
                    refs.setdefault(posixpath.normpath(posixpath.join(posixpath.dirname(f), u)), []).append('%s（%s.uri）' % (f, top))
    return refs, bad


def run_runtime(root):
    """node tools/release/runtime_manifest.js；失敗就回 {'ok':False,…}（打包照常，只是少一種來源，報告會寫）。"""
    script = pathlib.Path(__file__).resolve().parent / 'runtime_manifest.js'
    try:
        r = subprocess.run(['node', str(script), str(root)], capture_output=True, text=True, timeout=300)
        d = json.loads(r.stdout)
        return d
    except Exception as e:   # 沒有 node、逾時、輸出壞掉
        return {'ok': False, 'manifest': [], 'data': [], 'portraits': [], 'zones': {}, 'errors': ['執行期表讀不到：%s' % e], 'scripts': 0}


def analyze(root, target='web', runtime=True, files_mode='auto'):
    root = pathlib.Path(root).resolve()
    files, mode = rc.list_files(root, files_mode)
    fset = set(files)
    size = {f: (root / f).stat().st_size for f in files}
    html = (root / 'index.html').read_text(encoding='utf-8')
    scripts, others, external = scan_index(html)

    static, comment_only, dynamic = {}, {}, {}
    # index.html 裡的內嵌 script 與屬性也掃（當成一支 JS；HTML 的 // 會被當註解，所以另外用原始碼再掃一次完整路徑）
    for m in re.finditer(r'<script\b(?![^>]*\ssrc=)[^>]*>(.*?)</script>', html, re.S):
        scan_js('index.html', m.group(1), static, comment_only, dynamic)
    for m in _RAW_STATIC.finditer(html):
        static.setdefault(m.group(0), [])
        if 'index.html' not in ''.join(static[m.group(0)]):
            static[m.group(0)].append('index.html')
        comment_only.pop(m.group(0), None)
    loaded_js = [s for s in scripts if s in fset]
    for s in loaded_js:
        scan_js(s, (root / s).read_text(encoding='utf-8', errors='replace'), static, comment_only, dynamic)
    for p in list(comment_only):
        if p in static:
            del comment_only[p]

    rt = run_runtime(root) if runtime else {'ok': False, 'manifest': [], 'data': [], 'portraits': [], 'zones': {}, 'errors': ['--no-runtime：沒有讀執行期表'], 'scripts': 0}
    rt_paths = {}
    for m in rt.get('manifest', []):
        rt_paths.setdefault(m['url'], []).append('ASSETS.manifest[%s].%s' % (m['key'], m['field'] or 'url'))
    optional = {}
    for m in rt.get('data', []):
        if m['from'] in OPTIONAL_TABLES and m['url'] not in fset:
            optional.setdefault(m['from'], []).append(m['url'])
            continue
        rt_paths.setdefault(m['url'], []).append('資料表 %s' % m['from'])
    for p in rt.get('portraits', []):
        rt_paths.setdefault(p, []).append('PORTRAIT_FILES')

    glb_refs, glb_bad = scan_glb_refs(root, files)

    dyn_rules = [{'id': 'R5-DYNAMIC', 'prefix': k[0], 'exts': list(k[1]), 'where': sorted(set(v))[:6], 'count': len(v)} for k, v in sorted(dynamic.items())]
    derived = [dict(r) for r in DERIVED_RULES]

    def match_dir(path, rules):
        ext = path.rsplit('.', 1)[-1].lower() if '.' in path.rsplit('/', 1)[-1] else ''
        ext = 'jpg' if ext == 'jpeg' else ext
        best = None
        for r in rules:
            if path.startswith(r['prefix']) and (not r['exts'] or ext in r['exts']):
                if best is None or len(r['prefix']) > len(best['prefix']):
                    best = r
        return best

    decisions = {}
    for f in files:
        d = None
        for pre, rid, why in DEV_DIRS:
            if f.startswith(pre):
                d = {'include': False, 'rule': rid, 'note': why}
                break
        if d is None:
            for suf, rid, why in DEV_SUFFIX:
                if f.endswith(suf):
                    d = {'include': False, 'rule': rid, 'note': why}
                    break
        if d is None and f in DEV_FILES:
            d = {'include': False, 'rule': DEV_FILES[f][0], 'note': DEV_FILES[f][1]}
        if d is None and f in EXTRA_INCLUDE:
            rid, why, tg = EXTRA_INCLUDE[f]
            d = {'include': target in tg, 'rule': rid, 'note': why if target in tg else why + '（這個 target 不收）'}
        if d is None and f == 'index.html':
            d = {'include': True, 'rule': 'R1-ENTRY', 'note': '入口'}
        if d is None and (f in scripts or f in others):
            d = {'include': True, 'rule': 'R2-INDEX-REF', 'note': 'index.html 的 script／link 引用'}
        if d is None and (f.startswith('src/') or f.startswith('lib/')):
            if f in static:
                d = {'include': True, 'rule': 'R3-STATIC', 'note': '程式裡寫了完整路徑：' + static[f][0]}
            else:
                d = {'include': False, 'rule': 'X5-UNLOADED', 'note': 'index.html 沒有載入（遊戲沒有動態載入 script 的機制；測試或工具在用）'}
        if d is None and f.startswith('assets/'):
            if f in static:
                d = {'include': True, 'rule': 'R3-STATIC', 'note': '程式裡寫了完整路徑：' + static[f][0]}
            elif f in rt_paths:
                d = {'include': True, 'rule': 'R4-RUNTIME', 'note': '執行期表：' + rt_paths[f][0]}
            elif f in glb_refs:
                d = {'include': True, 'rule': 'R4-GLBREF', 'note': '模型檔裡面指到：' + glb_refs[f][0]}
            else:
                r = match_dir(f, dyn_rules)
                if r:
                    d = {'include': True, 'rule': 'R5-DYNAMIC', 'note': "拼出來的路徑 '%s'＋…%s（%s）" % (r['prefix'], ('.' + '/.'.join(r['exts'])) if r['exts'] else '（副檔名不定）', r['where'][0])}
                else:
                    r = match_dir(f, derived)
                    if r:
                        d = {'include': True, 'rule': r['id'], 'note': r['why']}
                    else:
                        d = {'include': True, 'rule': 'R7-KEEP-UNSURE', 'note': '沒有被任何規則指到；無法判定是不是備用或條件載入 → 保留，待確認'}
        if d is None:
            d = {'include': False, 'rule': 'X9-UNDECIDED', 'note': '頂層的新檔，規則還沒決定收不收（請在 tools/release/deps.py 加規則）'}
        d['size'] = size[f]
        decisions[f] = d

    # 需要但不存在（會 404）
    missing = []
    for s in scripts + others:
        if s not in fset:
            missing.append({'path': s, 'kind': 'index', 'from': ['index.html']})
    for p, where in sorted(static.items()):
        if p not in fset:
            missing.append({'path': p, 'kind': 'static', 'from': where[:4]})
    for p, where in sorted(rt_paths.items()):
        if p not in fset and p not in static:
            missing.append({'path': p, 'kind': 'runtime', 'from': where[:4]})
    for p, where in sorted(glb_refs.items()):
        if p not in fset and p not in static and p not in rt_paths:
            missing.append({'path': p, 'kind': 'glb', 'from': where[:4]})
    # 需要、存在、卻被排除規則擋掉（規則互相打架）
    blocked = [p for p in sorted(set(scripts) | set(others) | set(static) | set(rt_paths) | set(glb_refs)) if p in decisions and not decisions[p]['include']]

    def total(pred):
        return sum(d['size'] for f, d in decisions.items() if pred(f, d))
    by_rule = {}
    for f, d in decisions.items():
        e = by_rule.setdefault(d['rule'], {'files': 0, 'bytes': 0, 'include': d['include']})
        e['files'] += 1
        e['bytes'] += d['size']
    summary = {
        'filesTotal': len(files), 'bytesTotal': sum(size.values()),
        'filesIncluded': sum(1 for d in decisions.values() if d['include']), 'bytesIncluded': total(lambda f, d: d['include']),
        'filesExcluded': sum(1 for d in decisions.values() if not d['include']), 'bytesExcluded': total(lambda f, d: not d['include']),
        'byRule': dict(sorted(by_rule.items())),
    }
    return {
        'root': str(root), 'target': target, 'filesMode': mode, 'git': rc.git_info(root), 'version': rc.read_version(root),
        'index': {'scripts': scripts, 'others': others, 'external': external},
        'static': {p: w[:4] for p, w in sorted(static.items())},
        'commentOnly': {p: w[:3] for p, w in sorted(comment_only.items())},
        'dynamicRules': dyn_rules, 'derivedRules': derived,
        'runtime': {'ok': bool(rt.get('ok')), 'scripts': rt.get('scripts', 0), 'manifest': len(rt.get('manifest', [])), 'data': len(rt.get('data', [])),
                    'portraits': len(rt.get('portraits', [])), 'errors': rt.get('errors', []), 'paths': {p: w[:3] for p, w in sorted(rt_paths.items())},
                    'zones': rt.get('zones', {}),
                    'optionalMissing': {k: {'count': len(v), 'why': OPTIONAL_TABLES[k], 'sample': sorted(v)[:5]} for k, v in optional.items()}},
        'glbRefs': {p: w[:3] for p, w in sorted(glb_refs.items())}, 'glbUnreadable': glb_bad,
        'missing': missing, 'blocked': blocked, 'decisions': decisions, 'summary': summary,
    }


def required_paths(res):
    """遊戲會請求的路徑（存在的）：入口、靜態、執行期表。verify_dist.js 逐一請求。"""
    req = set(['index.html']) | set(res['index']['scripts']) | set(res['index']['others']) | set(res['static']) | set(res['runtime']['paths']) | set(res['glbRefs'])
    return sorted(p for p in req if p in res['decisions'])


def to_markdown(res):
    L = []
    s = res['summary']
    g = res['git']
    L.append('# 依賴檢查（%s）' % res['target'])
    L.append('')
    L.append('- 樹：`%s`（檔案清單：%s）' % (res['root'], 'git 追蹤的檔' if res['filesMode'] == 'git' else '整棵樹'))
    if g.get('commit'):
        L.append('- commit `%s`，分支 `%s`%s' % (g['commit'][:9], g['branch'], '（工作樹有還沒 commit 的改動）' if g['dirty'] else ''))
    L.append('- 版本（index.html）：v%s（%s）' % (res['version']['version'], res['version']['date']))
    L.append('- 全部 %d 個檔 %s；收進包 %d 個 %s；排除 %d 個 %s' % (s['filesTotal'], rc.fmt_size(s['bytesTotal']), s['filesIncluded'], rc.fmt_size(s['bytesIncluded']), s['filesExcluded'], rc.fmt_size(s['bytesExcluded'])))
    rt = res['runtime']
    L.append('- 執行期表：%s（載入 %d 支 script；manifest %d 筆、資料表路徑 %d 筆、立繪 %d 筆）%s' % ('讀到了' if rt['ok'] else '**沒讀到或有錯**', rt['scripts'], rt['manifest'], rt['data'], rt['portraits'], ('；錯誤：' + '；'.join(rt['errors'][:3])) if rt['errors'] else ''))
    L.append('- 模型檔裡面的引用（extras、外部 uri）：%d 個路徑；讀不了的 GLB／VRM：%d 個%s' % (len(res['glbRefs']), len(res['glbUnreadable']), ('（' + '、'.join(res['glbUnreadable'][:5]) + '）') if res['glbUnreadable'] else ''))
    L.append('')
    L.append('## 每條規則')
    L.append('')
    L.append('| 規則 | 收／排除 | 檔數 | 容量 |')
    L.append('|---|---|---:|---:|')
    for rid, e in s['byRule'].items():
        L.append('| %s | %s | %d | %s |' % (rid, '收' if e['include'] else '排除', e['files'], rc.fmt_size(e['bytes'])))
    L.append('')
    L.append('## 需要但不存在（會 404）：%d 個' % len(res['missing']))
    L.append('')
    for m in res['missing']:
        L.append('- `%s`（%s）← %s' % (m['path'], m['kind'], '、'.join(m['from'])))
    if not res['missing']:
        L.append('無。')
    L.append('')
    L.append('## 需要、存在、卻被排除規則擋掉：%d 個' % len(res['blocked']))
    L.append('')
    for p in res['blocked']:
        L.append('- `%s`（%s）' % (p, res['decisions'][p]['rule']))
    if not res['blocked']:
        L.append('無。')
    L.append('')
    for k, v in rt['optionalMissing'].items():
        L.append('## 預留格（不算缺檔）：%s %d 個' % (k, v['count']))
        L.append('')
        L.append(v['why'] + '。例：' + '、'.join('`%s`' % x for x in v['sample']))
        L.append('')
    unsure = sorted((f for f, d in res['decisions'].items() if d['rule'] == 'R7-KEEP-UNSURE'), key=lambda f: -res['decisions'][f]['size'])
    L.append('## 無法判定（保留，待確認）：%d 個 %s' % (len(unsure), rc.fmt_size(sum(res['decisions'][f]['size'] for f in unsure))))
    L.append('')
    L.append('沒有被入口、靜態路徑、動態路徑規則、執行期表任何一條指到。**全部留在包裡**；確認真的沒用以前不排除。')
    L.append('')
    groups = {}
    for f in unsure:
        key = f.rsplit('/', 1)[0] + '/*.' + (f.rsplit('.', 1)[-1] if '.' in f.rsplit('/', 1)[-1] else '?')
        e = groups.setdefault(key, [0, 0, []])
        e[0] += 1
        e[1] += res['decisions'][f]['size']
        e[2].append(f)
    L.append('| 目錄／類型 | 檔數 | 容量 | 例 |')
    L.append('|---|---:|---:|---|')
    for key, e in sorted(groups.items(), key=lambda kv: -kv[1][1]):
        L.append('| `%s` | %d | %s | %s |' % (key, e[0], rc.fmt_size(e[1]), '、'.join('`%s`' % x.rsplit('/', 1)[-1] for x in e[2][:3])))
    L.append('')
    L.append('最大的 30 個：')
    L.append('')
    for f in unsure[:30]:
        L.append('- `%s` %s' % (f, rc.fmt_size(res['decisions'][f]['size'])))
    L.append('')
    unl = sorted(f for f, d in res['decisions'].items() if d['rule'] == 'X5-UNLOADED')
    L.append('## index.html 沒有載入的 src／lib 檔（排除）：%d 個' % len(unl))
    L.append('')
    for f in unl:
        L.append('- `%s` %s' % (f, rc.fmt_size(res['decisions'][f]['size'])))
    und = sorted(f for f, d in res['decisions'].items() if d['rule'] == 'X9-UNDECIDED')
    L.append('')
    L.append('## 還沒決定的頂層檔：%d 個' % len(und))
    L.append('')
    for f in und:
        L.append('- `%s`' % f)
    if not und:
        L.append('無。')
    L.append('')
    L.append('## 對外網路的引用（離線時拿不到）：%d 個' % len(res['index']['external']))
    L.append('')
    for u in res['index']['external']:
        L.append('- `%s`' % u)
    L.append('')
    L.append('## 動態路徑規則（%d 條）' % len(res['dynamicRules']))
    L.append('')
    L.append('| 前綴 | 副檔名 | 出現次數 | 例 |')
    L.append('|---|---|---:|---|')
    for r in res['dynamicRules']:
        L.append('| `%s` | %s | %d | %s |' % (r['prefix'], '、'.join(r['exts']) or '不定', r['count'], r['where'][0]))
    L.append('')
    L.append('衍生規則：' + '；'.join('`%s` → `%s*.%s`（%s）' % (r['id'], r['prefix'], '/'.join(r['exts']), r['why']) for r in res['derivedRules']))
    L.append('')
    co = res['commentOnly']
    L.append('## 只在註解裡出現的路徑：%d 個（其中不存在的 %d 個；不算缺檔）' % (len(co), sum(1 for p in co if p not in res['decisions'])))
    L.append('')
    for p in sorted(co):
        if p not in res['decisions']:
            L.append('- `%s` ← %s' % (p, co[p][0]))
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser(description='依賴檢查器（只讀）')
    ap.add_argument('--root', default=str(pathlib.Path(__file__).resolve().parents[2]))
    ap.add_argument('--target', default='web', choices=TARGETS)
    ap.add_argument('--files', default='auto', choices=('auto', 'git', 'walk'), help='檔案清單：git 追蹤的（預設，有 .git 時）或整棵樹')
    ap.add_argument('--no-runtime', action='store_true', help='不跑 node 讀執行期表（只做靜態掃描）')
    ap.add_argument('--json')
    ap.add_argument('--md')
    a = ap.parse_args()
    res = analyze(a.root, a.target, not a.no_runtime, a.files)
    if a.json:
        pathlib.Path(a.json).write_text(json.dumps(res, ensure_ascii=False, indent=1), encoding='utf-8')
    if a.md:
        pathlib.Path(a.md).write_text(to_markdown(res), encoding='utf-8')
    s = res['summary']
    print('依賴檢查（%s）：全部 %d 個檔 %s；收 %d 個 %s；排除 %d 個 %s' % (a.target, s['filesTotal'], rc.fmt_size(s['bytesTotal']), s['filesIncluded'], rc.fmt_size(s['bytesIncluded']), s['filesExcluded'], rc.fmt_size(s['bytesExcluded'])))
    for rid, e in s['byRule'].items():
        print('  %-18s %s %5d 個 %s' % (rid, '收  ' if e['include'] else '排除', e['files'], rc.fmt_size(e['bytes'])))
    print('執行期表：%s；需要但不存在 %d；被排除規則擋掉 %d；無法判定（保留）%d；還沒決定的頂層檔 %d；對外網路 %d' % (
        'OK' if res['runtime']['ok'] else '沒讀到（%s）' % '；'.join(res['runtime']['errors'][:2]), len(res['missing']), len(res['blocked']),
        s['byRule'].get('R7-KEEP-UNSURE', {}).get('files', 0), s['byRule'].get('X9-UNDECIDED', {}).get('files', 0), len(res['index']['external'])))
    for m in res['missing'][:20]:
        print('  缺：%s（%s）← %s' % (m['path'], m['kind'], '、'.join(m['from'][:2])))
    bad = bool(res['missing'] or res['blocked'] or s['byRule'].get('X9-UNDECIDED'))
    sys.exit(1 if bad else 0)


if __name__ == '__main__':
    try:
        main()
    except SystemExit:
        raise
    except Exception as e:
        print('執行錯誤：%s' % e, file=sys.stderr)
        sys.exit(2)
