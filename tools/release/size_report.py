#!/usr/bin/env python3
"""可重複執行的容量報告（REL-PACKAGING-1111，USER_WANTS X340）。全部由實際檔案計算，不估。

用法：
  python3 tools/release/size_report.py --md docs/release/SIZE_REPORT_<日期>.md --json <檔>            # 量這個 repo
  python3 tools/release/size_report.py --tree 開發分支=. --tree main=git:origin/main --zip --md …          # 一次量兩棵樹；git:<ref>＝直接從 git 讀那個版本，不用解出來
  選項：--zip＝真的把 win-stage 的檔壓成 zip 量大小（壓完刪掉；沒加就寫「未產生」）；--prelim <標籤>＝那一棵樹和使用者 11-11 的初步數字對照

每一棵樹輸出：原始專案容量（.git 另列）、遊戲執行資產（web／win-stage 兩個包）、排除的開發檔、win-stage 未壓縮／壓縮後、
各類素材排名、最大的 20 個檔、重複資產（整個檔內容相同；GLB／VRM 內嵌貼圖相同）、可以考慮的優化（只列建議和依據，不執行）。
單位：MB＝10^6 位元組、MiB＝2^20 位元組，兩種都寫。分類規則：relcommon.py 的 CATEGORIES（docs/RELEASE_PACKAGING.md 第 8 節）。
只讀檔；--zip 真的壓、但只數壓出來幾個位元組，不寫檔（不佔磁碟）。
"""
import argparse, datetime, hashlib, json, os, pathlib, struct, subprocess, sys, zipfile

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import relcommon as rc
import deps

# 使用者 2026-11-11 給的初步數字（main；docs/handoff/user_specs/RELEASE_PACKAGING_1111.md 第三節），單位照原文寫 MB／GB
PRELIM_1111 = [
    ('整個版本樹（不含 Git 歷史）', 1380, '全部檔案'),
    ('遊戲程式與素材', 831, 'web 包（遊戲執行需要的檔）'),
    ('3D 場景', 409, '3D 場景（GLB、窗外景、匯出側寫）'),
    ('3D 人物', 248, '3D 人物（VRM、配件、動作、遠距離版本）'),
    ('2D 背景', 97, '2D 背景'),
    ('事件 CG', 20, '事件 CG'),
    ('電影海報', 19, '電影海報'),
]


def dir_size(path):
    n = c = 0
    for d, _dirs, names in os.walk(path):
        for x in names:
            try:
                n += os.lstat(os.path.join(d, x)).st_size
                c += 1
            except OSError:
                pass
    return n, c


def git_dir_info(repo):
    if not repo or not rc.is_git_tree(repo):
        return None
    r = subprocess.run(['git', '-C', str(repo), 'rev-parse', '--git-common-dir'], capture_output=True, text=True)
    if r.returncode != 0:
        return None
    g = pathlib.Path(r.stdout.strip())
    if not g.is_absolute():
        g = (pathlib.Path(repo) / g).resolve()
    n, c = dir_size(g)
    sh = subprocess.run(['git', '-C', str(repo), 'rev-parse', '--is-shallow-repository'], capture_output=True, text=True).stdout.strip()
    return {'path': str(g), 'bytes': n, 'files': c, 'shallow': sh == 'true',
            'note': '這台機器上的 .git（所有分支、所有 worktree 共用，不是某一個版本的大小；%s）；每台機器抓的分支不一樣，數字會不同' % ('淺層複本' if sh == 'true' else '不是淺層複本')}


def glb_images(data):
    """data＝整個 GLB／VRM 的內容。回傳 (內嵌貼圖清單 [(md5, bytes, mime)], JSON 區塊大小, BIN 區塊大小)；不是 GLB 回 None。"""
    try:
        if data[:4] != b'glTF':
            return None
        clen, ctype = struct.unpack('<I4s', data[12:20])
        j = json.loads(data[20:20 + clen].decode('utf-8'))
        bin_start = 20 + clen + 8
        blen = struct.unpack('<I', data[20 + clen:24 + clen])[0] if len(data) >= bin_start else 0
        bvs = j.get('bufferViews') or []
        out = []
        for im in j.get('images') or []:
            bv = im.get('bufferView')
            if bv is None or bv >= len(bvs):
                continue
            off = bin_start + (bvs[bv].get('byteOffset') or 0)
            ln = bvs[bv].get('byteLength') or 0
            out.append((hashlib.md5(data[off:off + ln]).hexdigest(), ln, im.get('mimeType', '')))
        return out, clen, blen
    except Exception:
        return None


class CountingSink:
    """只數寫進來幾個位元組、不存（量 zip 大小用，不佔磁碟）。"""
    def __init__(self):
        self.n = 0

    def write(self, b):
        self.n += len(b)
        return len(b)

    def flush(self):
        pass


def measure(root, label, do_zip, files_mode='auto'):
    tree = rc.open_tree(root, files_mode)
    res = {t: deps.analyze(tree, t, True, files_mode) for t in deps.TARGETS}
    web, win = res['web'], res['win-stage']
    dec = web['decisions']
    files = sorted(dec)
    size = {f: dec[f]['size'] for f in files}
    out = {'label': label, 'root': tree.label, 'git': web['git'], 'version': web['version'], 'filesMode': web['filesMode'],
           'runtimeTablesRead': web['runtime']['ok'], 'measuredAt': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%d %H:%M UTC')}
    # 1 原始專案
    top = {}
    for f in files:
        k = f.split('/', 1)[0] + ('/' if '/' in f else '')
        e = top.setdefault(k, [0, 0])
        e[0] += 1
        e[1] += size[f]
    out['source'] = {'files': len(files), 'bytes': sum(size.values()), 'byTop': {k: {'files': v[0], 'bytes': v[1]} for k, v in sorted(top.items(), key=lambda kv: -kv[1][1])}}
    out['gitDir'] = git_dir_info(tree.git_repo())
    # 2、3、4 包
    out['packages'] = {}
    for t, r in res.items():
        s = r['summary']
        out['packages'][t] = {'files': s['filesIncluded'], 'bytes': s['bytesIncluded'], 'excludedFiles': s['filesExcluded'], 'excludedBytes': s['bytesExcluded'], 'byRule': s['byRule'],
                              'missing': len(r['missing']), 'unsureFiles': s['byRule'].get('R7-KEEP-UNSURE', {}).get('files', 0), 'unsureBytes': s['byRule'].get('R7-KEEP-UNSURE', {}).get('bytes', 0)}
    win_files = sorted(f for f, d in win['decisions'].items() if d['include'])
    out['zip'] = None
    if do_zip:
        sink = CountingSink()   # 真的壓，但壓出來的內容不存檔，只數大小（暫存碟放不下第二份）
        with zipfile.ZipFile(sink, 'w', zipfile.ZIP_DEFLATED, compresslevel=6) as z:
            for f in win_files:
                z.writestr(zipfile.ZipInfo(f, date_time=(1980, 1, 1, 0, 0, 0)), tree.read_bytes(f), zipfile.ZIP_DEFLATED, 6)
        out['zip'] = {'bytes': sink.n, 'method': 'zip（Deflate，壓縮等級 6；Python zipfile，逐檔壓、只數位元組不存檔）', 'files': len(win_files),
                      'note': '只壓遊戲內容（win-stage 的檔），不含封裝器；不是 Steam 實際下載大小（Steam 用自己的分塊壓縮，未量）'}
    # 5 分類
    def cats(paths):
        c = {}
        for f in paths:
            e = c.setdefault(rc.category_of(f), [0, 0])
            e[0] += 1
            e[1] += size[f]
        return [{'category': k, 'files': v[0], 'bytes': v[1]} for k, v in sorted(c.items(), key=lambda kv: -kv[1][1])]
    web_files = sorted(f for f, d in dec.items() if d['include'])
    out['categoriesAll'] = cats(files)
    out['categoriesPackage'] = cats(web_files)
    ext = {}
    for f in web_files:
        e = ext.setdefault(f.rsplit('.', 1)[-1].lower() if '.' in f.rsplit('/', 1)[-1] else '(無)', [0, 0])
        e[0] += 1
        e[1] += size[f]
    out['extPackage'] = [{'ext': k, 'files': v[0], 'bytes': v[1]} for k, v in sorted(ext.items(), key=lambda kv: -kv[1][1])]
    sub = {}
    for f in web_files:
        if f.startswith('assets/'):
            e = sub.setdefault(f.rsplit('/', 1)[0] + '/', [0, 0])
            e[0] += 1
            e[1] += size[f]
    out['assetDirsPackage'] = [{'dir': k, 'files': v[0], 'bytes': v[1]} for k, v in sorted(sub.items(), key=lambda kv: -kv[1][1])[:25]]
    # 6 最大的檔
    out['largestPackage'] = [{'path': f, 'bytes': size[f], 'rule': dec[f]['rule']} for f in sorted(web_files, key=lambda f: -size[f])[:20]]
    out['largestExcluded'] = [{'path': f, 'bytes': size[f], 'rule': dec[f]['rule']} for f in sorted((f for f in files if not dec[f]['include']), key=lambda f: -size[f])[:20]]
    # 7 重複
    by_size = {}
    for f in web_files:
        by_size.setdefault(size[f], []).append(f)
    groups = {}
    for sz, fs in by_size.items():
        if len(fs) < 2 or sz == 0:
            continue
        for f in fs:
            groups.setdefault(tree.content_id(f), []).append(f)
    dup = [{'bytes': size[v[0]], 'files': sorted(v)} for v in groups.values() if len(v) > 1]
    dup.sort(key=lambda g: -g['bytes'] * (len(g['files']) - 1))
    out['duplicateFiles'] = {'groups': len(dup), 'redundantBytes': sum(g['bytes'] * (len(g['files']) - 1) for g in dup), 'top': dup[:20]}
    img = {}
    glb_total = glb_img_bytes = glb_n = glb_json_bytes = 0
    within = 0
    for f in web_files:
        if f.rsplit('.', 1)[-1].lower() not in ('glb', 'vrm'):
            continue
        r = glb_images(tree.read_bytes(f))
        if r is None:
            continue
        images, clen, _blen = r
        glb_n += 1
        glb_total += size[f]
        glb_json_bytes += clen
        seen = set()
        for h, ln, mime in images:
            glb_img_bytes += ln
            e = img.setdefault(h, {'bytes': ln, 'mime': mime, 'files': {}})
            e['files'][f] = e['files'].get(f, 0) + 1
            if h in seen:
                within += ln
            seen.add(h)
    multi = [dict(e, md5=h, copies=sum(e['files'].values()), nFiles=len(e['files'])) for h, e in img.items() if sum(e['files'].values()) > 1]
    multi.sort(key=lambda e: -e['bytes'] * (e['copies'] - 1))
    out['embeddedTextures'] = {
        'modelFiles': glb_n, 'modelBytes': glb_total, 'imageBytes': glb_img_bytes, 'jsonBytes': glb_json_bytes, 'otherBytes': glb_total - glb_img_bytes - glb_json_bytes,
        'images': sum(sum(e['files'].values()) for e in img.values()), 'distinctImages': len(img),
        'redundantBytes': sum(e['bytes'] * (e['copies'] - 1) for e in multi), 'redundantWithinSameFile': within,
        'top': [{'md5': e['md5'][:10], 'bytes': e['bytes'], 'mime': e['mime'], 'copies': e['copies'], 'nFiles': e['nFiles'], 'files': sorted(e['files'])[:4]} for e in multi[:20]],
    }
    # 8 可以考慮的優化（只列）
    unsure = sorted(((f, size[f]) for f, d in dec.items() if d['rule'] == 'R7-KEEP-UNSURE'), key=lambda x: -x[1])
    png = [(f, size[f]) for f in web_files if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
    out['optimizations'] = {
        'unsureBytes': sum(s for _f, s in unsure), 'unsureFiles': len(unsure), 'unsureTop': unsure[:8],
        'sidecarJsonBytes': sum(s for f, s in unsure if f.endswith('.json')), 'sidecarJsonFiles': sum(1 for f, _s in unsure if f.endswith('.json')),
        'nonWebpImages': png,
    }
    return out


def to_markdown(trees, prelim_label):
    L = []
    F = rc.fmt_size
    L.append('# 容量報告（%s）' % trees[0]['measuredAt'][:10])
    L.append('')
    L.append('> 由 `tools/release/size_report.py` 產生；全部是實際檔案的大小，沒有估的。單位：MB＝10⁶ 位元組、MiB＝2²⁰ 位元組（檔案總管、`du -h` 顯示的是 MiB）。')
    L.append('> 分類與打包規則：`docs/RELEASE_PACKAGING.md`。**這不是 Steam 最終安裝容量**——還沒有封裝器、還沒做任何素材優化。')
    L.append('')
    L.append('## 0. 量了哪幾棵樹')
    L.append('')
    L.append('| 標籤 | commit | 分支 | 版本（index.html） | 檔案清單 | 執行期表 | 量的時間 |')
    L.append('|---|---|---|---|---|---|---|')
    for t in trees:
        g = t['git']
        L.append('| %s | %s | %s | v%s（%s） | %s | %s | %s |' % (t['label'], ('`%s`%s' % (g['commit'][:9], '（有未 commit 的改動）' if g.get('dirty') else '')) if g.get('commit') else '（不是 git 樹）', g.get('branch') or '—',
                 t['version']['version'], t['version']['date'], {'git': 'git 追蹤的檔', 'git-ref': 'git 裡的那個版本（直接從物件庫讀）'}.get(t['filesMode'], '整棵樹'), '讀到' if t['runtimeTablesRead'] else '**沒讀到**', t['measuredAt']))
    L.append('')
    if len(trees) > 1:
        L.append('## 1. 總表')
        L.append('')
        L.append('| 項目 | ' + ' | '.join(t['label'] for t in trees) + ' |')
        L.append('|---|' + '---:|' * len(trees))
        row = lambda name, fn: L.append('| %s | %s |' % (name, ' | '.join(fn(t) for t in trees)))
        row('原始專案（不含 .git）', lambda t: '%d 個檔 %s' % (t['source']['files'], F(t['source']['bytes'])))
        row('.git（另列）', lambda t: F(t['gitDir']['bytes']) if t['gitDir'] else '沒有（不是 git 樹）')
        row('遊戲執行資產＝web 包', lambda t: '%d 個檔 %s' % (t['packages']['web']['files'], F(t['packages']['web']['bytes'])))
        row('排除的開發檔案', lambda t: '%d 個檔 %s' % (t['packages']['web']['excludedFiles'], F(t['packages']['web']['excludedBytes'])))
        row('win-stage 未壓縮', lambda t: '%d 個檔 %s' % (t['packages']['win-stage']['files'], F(t['packages']['win-stage']['bytes'])))
        row('win-stage 壓縮後', lambda t: ('%s（%s）' % (F(t['zip']['bytes']), t['zip']['method'])) if t['zip'] else '未產生')
        row('其中「無法判定、先保留」', lambda t: '%d 個檔 %s' % (t['packages']['web']['unsureFiles'], F(t['packages']['web']['unsureBytes'])))
        row('需要但不存在的檔', lambda t: '%d' % t['packages']['web']['missing'])
        L.append('')
    for t in trees:
        if prelim_label and t['label'] == prelim_label:
            L.append('## 使用者 11-11 初步數字對照（%s）' % t['label'])
            L.append('')
            L.append('初步數字出處：`docs/handoff/user_specs/RELEASE_PACKAGING_1111.md` 第三節（main）。下面每一列是這次實測；差多少照實寫，不硬湊。')
            L.append('')
            L.append('| 項目 | 初步數字 | 這次實測（MB） | 實測（MiB） | 差（實測 MB − 初步） | 這次怎麼分類 |')
            L.append('|---|---:|---:|---:|---:|---|')
            cat_all = {c['category']: c['bytes'] for c in t['categoriesAll']}
            for name, mb, how in PRELIM_1111:
                if how == '全部檔案':
                    b = t['source']['bytes']
                elif how.startswith('web 包'):
                    b = t['packages']['web']['bytes']
                else:
                    b = cat_all.get(how, 0)
                L.append('| %s | %s | %.2f | %.2f | %+.2f | %s |' % (name, ('%.2f GB' % (mb / 1000)) if mb >= 1000 else '%d MB' % mb, b / 1e6, b / 1048576, b / 1e6 - mb, how))
            L.append('')
    for t in trees:
        L.append('---')
        L.append('')
        L.append('# 詳細：%s' % t['label'])
        L.append('')
        s = t['source']
        L.append('## A. 原始專案容量（不含 .git）：%d 個檔 %s' % (s['files'], F(s['bytes'])))
        L.append('')
        L.append('| 頂層 | 檔數 | 容量 |')
        L.append('|---|---:|---:|')
        for k, v in s['byTop'].items():
            L.append('| `%s` | %d | %s |' % (k, v['files'], F(v['bytes'])))
        L.append('')
        if t['gitDir']:
            L.append('`.git`（另列）：%s，%d 個檔。%s。' % (F(t['gitDir']['bytes']), t['gitDir']['files'], t['gitDir']['note']))
        else:
            L.append('`.git`：這棵樹不是 git 樹，沒有 .git。')
        L.append('')
        L.append('## B. 遊戲執行資產、排除的開發檔案、Windows 發行包')
        L.append('')
        L.append('| 包 | 檔數 | 未壓縮 | 排除的檔數 | 排除的容量 |')
        L.append('|---|---:|---:|---:|---:|')
        for k, p in t['packages'].items():
            L.append('| %s | %d | %s | %d | %s |' % (k, p['files'], F(p['bytes']), p['excludedFiles'], F(p['excludedBytes'])))
        L.append('')
        if t['zip']:
            z = t['zip']
            L.append('win-stage 壓縮後：**%s**（%s；%d 個檔；壓縮比 %.1f%%）。%s。' % (F(z['bytes']), z['method'], z['files'], 100.0 * z['bytes'] / max(1, t['packages']['win-stage']['bytes']), z['note']))
        else:
            L.append('win-stage 壓縮後：**未產生**（這次沒有加 `--zip`）。')
        L.append('')
        L.append('每條規則（web 包；規則說明見 `docs/RELEASE_PACKAGING.md` 第 3 節）：')
        L.append('')
        L.append('| 規則 | 收／排除 | 檔數 | 容量 |')
        L.append('|---|---|---:|---:|')
        for rid, e in t['packages']['web']['byRule'].items():
            L.append('| %s | %s | %d | %s |' % (rid, '收' if e['include'] else '排除', e['files'], F(e['bytes'])))
        L.append('')
        L.append('## C. 各類素材容量排名')
        L.append('')
        L.append('發行包（web）裡：')
        L.append('')
        L.append('| 排名 | 類別 | 檔數 | 容量 | 佔包 |')
        L.append('|---:|---|---:|---:|---:|')
        pb = t['packages']['web']['bytes']
        for i, c in enumerate(t['categoriesPackage'], 1):
            L.append('| %d | %s | %d | %s | %.1f%% |' % (i, c['category'], c['files'], F(c['bytes']), 100.0 * c['bytes'] / max(1, pb)))
        if not any(c['category'] == '音效檔' for c in t['categoriesPackage']):
            L.append('| — | 音效檔 | 0 | 0 | 遊戲的聲音是 `src/audio3d.js` 用 Web Audio 即時合成的，沒有音效檔 |')
        L.append('')
        L.append('整個專案（含開發檔）：')
        L.append('')
        L.append('| 類別 | 檔數 | 容量 |')
        L.append('|---|---:|---:|')
        for c in t['categoriesAll']:
            L.append('| %s | %d | %s |' % (c['category'], c['files'], F(c['bytes'])))
        L.append('')
        L.append('發行包照副檔名：' + '；'.join('`.%s` %d 個 %s' % (e['ext'], e['files'], F(e['bytes'])) for e in t['extPackage'][:8]))
        L.append('')
        L.append('發行包裡最大的素材目錄：')
        L.append('')
        L.append('| 目錄 | 檔數 | 容量 |')
        L.append('|---|---:|---:|')
        for d in t['assetDirsPackage'][:12]:
            L.append('| `%s` | %d | %s |' % (d['dir'], d['files'], F(d['bytes'])))
        L.append('')
        L.append('## D. 最大的 20 個檔（發行包裡）')
        L.append('')
        L.append('| # | 檔 | 容量 | 規則 |')
        L.append('|---:|---|---:|---|')
        for i, x in enumerate(t['largestPackage'], 1):
            L.append('| %d | `%s` | %s | %s |' % (i, x['path'], F(x['bytes']), x['rule']))
        L.append('')
        L.append('被排除的檔裡最大的 10 個（不進包）：' + '；'.join('`%s` %s' % (x['path'], F(x['bytes'])) for x in t['largestExcluded'][:10]))
        L.append('')
        d = t['duplicateFiles']
        L.append('## E. 重複資產')
        L.append('')
        L.append('### E1. 整個檔內容一模一樣（sha256 相同）：%d 組，多出來的 %s' % (d['groups'], F(d['redundantBytes'])))
        L.append('')
        if d['top']:
            L.append('| 每個檔 | 幾份 | 檔 |')
            L.append('|---:|---:|---|')
            for g in d['top'][:15]:
                L.append('| %s | %d | %s |' % (F(g['bytes']), len(g['files']), '、'.join('`%s`' % x for x in g['files'][:4]) + ('…' if len(g['files']) > 4 else '')))
        else:
            L.append('沒有。')
        L.append('')
        e = t['embeddedTextures']
        L.append('### E2. GLB／VRM 內嵌的貼圖')
        L.append('')
        L.append('- %d 個模型檔共 %s；其中內嵌貼圖 %s（%.1f%%）、JSON 區塊 %s、其餘（幾何、動畫等）%s。' % (e['modelFiles'], F(e['modelBytes']), F(e['imageBytes']), 100.0 * e['imageBytes'] / max(1, e['modelBytes']), F(e['jsonBytes']), F(e['otherBytes'])))
        L.append('- 內嵌貼圖 %d 張，內容不同的 %d 張；內容相同、重複存的部分 **%s**（其中同一個檔裡自己重複的 %s）。' % (e['images'], e['distinctImages'], F(e['redundantBytes']), F(e['redundantWithinSameFile'])))
        L.append('- 這是「如果每張圖只存一次」的理論上限；GLB 是自己帶貼圖的格式，要省這一塊得把貼圖抽成共用的外部檔，載入方式要改（見 F）。')
        L.append('')
        L.append('| 貼圖（md5 前 10 碼） | 每張 | 幾份 | 幾個檔 | 例 |')
        L.append('|---|---:|---:|---:|---|')
        for x in e['top'][:15]:
            L.append('| `%s`（%s） | %s | %d | %d | %s |' % (x['md5'], x['mime'].replace('image/', ''), F(x['bytes']), x['copies'], x['nFiles'], '、'.join('`%s`' % f.rsplit('/', 1)[-1] for f in x['files'][:3])))
        L.append('')
        o = t['optimizations']
        L.append('## F. 可以考慮的優化（只列建議與依據；這次都沒有做）')
        L.append('')
        L.append('| 項目 | 依據（實測） | 最多可省 | 風險與前提 |')
        L.append('|---|---|---:|---|')
        L.append('| 確認「無法判定」的檔是不是真的沒用 | %d 個檔，最大的：%s | %s | 要人確認（備用模型、舊版人物、匯出側寫）；確認以前留在包裡 |' % (o['unsureFiles'], '、'.join('`%s`' % f.rsplit('/', 1)[-1] for f, _s in o['unsureTop'][:4]), F(o['unsureBytes'])))
        L.append('| 其中模型旁邊的匯出側寫 JSON | %d 個；程式裡沒有任何地方 fetch 它們（唯一的 `.json` 請求是 GLB 抓不到時的 `<檔名>.glb.json` 備援） | %s | 低；但金額很小，不急 |' % (o['sidecarJsonFiles'], F(o['sidecarJsonBytes'])))
        L.append('| 整個檔重複的 | E1：%d 組 | %s | 要改程式指到同一個檔；動到 manifest，要回歸 |' % (d['groups'], F(d['redundantBytes'])))
        L.append('| GLB／VRM 之間重複的內嵌貼圖 | E2 | %s（理論上限） | 高：要把貼圖抽成外部共用檔或改用 KTX2，載入流程、快取、驗收都要重做；不是打包規則能解的 |' % F(e['redundantBytes']))
        L.append('| 同一個 GLB 裡自己重複的貼圖 | E2 | %s | 中：重新匯出時合併（Blender 匯出設定）；程式載入時已經會合併重複貼圖（`bldgLoader` 的 texDedup），省的是下載量 |' % F(e['redundantWithinSameFile']))
        if o['nonWebpImages']:
            L.append('| 不是 WebP 的圖 | %s | 未量（要實際轉檔才知道） | 低；先確認有沒有人用 |' % '、'.join('`%s` %s' % (f, F(s2)) for f, s2 in o['nonWebpImages'][:4]))
        L.append('| 幾何壓縮（Draco／Meshopt） | 模型檔扣掉貼圖與 JSON 以後 %s | 未量 | 高：載入器要加解壓、解析變慢；`tools/undraco.js` 顯示以前拿掉過 Draco，要先問原因 |' % F(e['otherBytes']))
        L.append('')
    return '\n'.join(L) + '\n'


def main():
    ap = argparse.ArgumentParser(description='容量報告')
    ap.add_argument('--tree', action='append', help='標籤=路徑；可以給好幾個。沒給就是「這個 repo」')
    ap.add_argument('--zip', action='store_true', help='真的壓一個 zip 量 win-stage 壓縮後的大小（每棵樹都壓；只數位元組、不存檔）')
    ap.add_argument('--prelim', help='哪一個標籤要和使用者 11-11 的初步數字對照')
    ap.add_argument('--md')
    ap.add_argument('--json')
    a = ap.parse_args()
    specs = a.tree or ['這個 repo=' + str(pathlib.Path(__file__).resolve().parents[2])]
    trees = []
    for sp in specs:
        label, _, path = sp.partition('=')
        print('量 %s（%s）…' % (label, path), flush=True)
        trees.append(measure(path, label, a.zip))
    md = to_markdown(trees, a.prelim)
    if a.md:
        pathlib.Path(a.md).parent.mkdir(parents=True, exist_ok=True)
        pathlib.Path(a.md).write_text(md, encoding='utf-8')
    if a.json:
        pathlib.Path(a.json).parent.mkdir(parents=True, exist_ok=True)
        pathlib.Path(a.json).write_text(json.dumps({'trees': trees}, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    for t in trees:
        p = t['packages']
        print('%s：原始 %s；web 包 %d 個檔 %s；win-stage %s；壓縮後 %s；排除 %s' % (t['label'], rc.fmt_size(t['source']['bytes']), p['web']['files'], rc.fmt_size(p['web']['bytes']),
              rc.fmt_size(p['win-stage']['bytes']), rc.fmt_size(t['zip']['bytes']) if t['zip'] else '未產生', rc.fmt_size(p['web']['excludedBytes'])))
    if not a.md:
        print(md)


if __name__ == '__main__':
    main()
