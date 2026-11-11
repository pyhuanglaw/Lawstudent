"""CC（帳號 A）11-11：雲端小工具（REL-PACKAGING-1111／X340，BB 範圍①的後半、②的對照）。不開瀏覽器、不改任何檔。
A) 包的檔案清單 vs repo（同一個 SHA）實際被引用的資產：
   python3 cc_relpack_diff.py <dist_files.json> [--sha <SHA>] [--repo <repo>] [--no-hash] [--json <輸出>]
   - dist_files.json＝cc_relpack_probe.py PACK 在 PC 寫的（包裡每個檔的 path、size、sha256、rule）。
   - repo 那一邊：用受測 SHA 自己的 tools/release/deps.py（git show 到暫存資料夾再 import），直接讀 git 物件庫（GitTree，不解出整棵樹），
     跑同一套掃描（index.html、JS 字串、node runtime_manifest.js 的執行期表、GLB 裡指到的檔）。
   - 比：①遊戲會請求的路徑（deps.required_paths）不在包裡＝FAIL；②照打包規則應該收的檔（decisions include）和包不一樣＝FAIL（少的、多的）；
     ③每個檔的大小、sha256 和 git 裡那個版本的內容一樣（Windows 換行轉換、複製壞掉會抓到；--no-hash 只比大小）；
     ④包裡有、但引用掃描沒指到的（靠目錄整批收、無法判定先保留）照規則分組列出＝INFO；⑤repo 的 assets/ 沒進包的照規則列出＝INFO。
B) 同一批區域在包和 repo 根目錄的數字對照（②）：
   python3 cc_relpack_diff.py --zones <zones_dist_n.json> <zones_root_n.json> [更多對…]
   每區比：進得去、玩家驅動、NPC 各驅動人數、程序化人數、建築退回備用、沒進快取的正式模型數、非 200 數。
每項印 PASS／FAIL（預期、實際）；最後 ALL PASS／FAILED n；exit 0／1。"""
import argparse, hashlib, importlib, json, os, subprocess, sys, tempfile

FAILS = []
J = lambda o: json.dumps(o, ensure_ascii=False)


def check(name, ok, info=''):
    print(('PASS ' if ok else 'FAIL ') + name + (('  ' + str(info)) if info != '' else ''), flush=True)
    if not ok: FAILS.append(name)
    return ok


def mb(n):
    return '%.2f MB' % (n / 1e6)


def load_release_tools(repo, sha, tmp):
    for f in ('deps.py', 'relcommon.py', 'runtime_manifest.js'):
        data = subprocess.run(['git', '-C', repo, 'show', '%s:tools/release/%s' % (sha, f)], capture_output=True, check=True).stdout
        with open(os.path.join(tmp, f), 'wb') as fh: fh.write(data)
    sys.path.insert(0, tmp)
    rc = importlib.import_module('relcommon'); deps = importlib.import_module('deps')
    return rc, deps


def dist_mode(a):
    d = json.load(open(a.dist_files, encoding='utf-8'))
    sha = a.sha or d.get('commit')
    repo = os.path.abspath(a.repo)
    full = subprocess.run(['git', '-C', repo, 'rev-parse', sha + '^{commit}'], capture_output=True, text=True).stdout.strip()
    if not check('受測 SHA 在這個 repo 裡', bool(full), sha): return
    print('== 包：%s 個檔 %s（%s v%s，commit %s，平台 %s，打包 %s 秒）' % (len(d['files']), mb(sum(f['size'] for f in d['files'])), d.get('target'), d.get('version'), (d.get('commit') or '')[:9], d.get('platform'), d.get('packSeconds')), flush=True)
    check('dist_files 的 commit＝受測 SHA', d.get('commit') == full, '%s vs %s' % (d.get('commit'), full))
    tmp = tempfile.mkdtemp(prefix='ccrelpack_')
    rc, deps = load_release_tools(repo, full, tmp)
    print('== repo（git:%s，直接讀物件庫）跑受測版本自己的 deps.analyze …' % full[:9], flush=True)
    tree = rc.GitTree(repo, full)
    res = deps.analyze(tree, 'web', True, 'auto')
    rt = res['runtime']
    print('   執行期表：%s（manifest %s、data %s、立繪 %s；錯誤 %s）' % ('讀到' if rt.get('ok') else '沒讀到', rt.get('manifest'), rt.get('data'), rt.get('portraits'), J(rt.get('errors', [])[:3])), flush=True)
    required = set(deps.required_paths(res))
    expect = {f for f, x in res['decisions'].items() if x['include']}
    pkg = {f['path']: f for f in d['files'] if f['path'] != 'manifest.json'}
    P = set(pkg)
    print('== 比對', flush=True)
    miss_req = sorted(required - P)
    check('①遊戲會請求的路徑（%d 個）都在包裡' % len(required), not miss_req, J(miss_req[:20]))
    check('①repo 這一邊的依賴檢查沒有「需要但不存在」的檔', not res['missing'], J(res['missing'][:10]))
    less, more = sorted(expect - P), sorted(P - expect)
    check('②照規則應該收的 %d 個檔，包裡都有（少 %d 個）' % (len(expect), len(less)), not less, J(less[:20]))
    check('②包裡沒有規則以外的檔（多 %d 個）' % len(more), not more, J(more[:20]))
    bad_size, bad_hash = [], []
    for p in sorted(P & set(tree.files)):
        if pkg[p]['size'] != tree.size(p): bad_size.append([p, pkg[p]['size'], tree.size(p)]); continue
        if not a.no_hash and hashlib.sha256(tree.read_bytes(p)).hexdigest() != pkg[p]['sha256']: bad_hash.append(p)
    check('③每個檔的大小和 git 裡一樣', not bad_size, J(bad_size[:12]))
    if a.no_hash: print('   （--no-hash：沒有比 sha256）', flush=True)
    else: check('③每個檔的 sha256 和 git 裡那個版本的內容一樣（Windows 換行轉換會在這裡抓到）', not bad_hash, J(bad_hash[:12]))
    groups = {}
    for p in sorted(P - required):
        r = (res['decisions'].get(p) or {}).get('rule') or pkg[p].get('rule') or '?'
        g = groups.setdefault(r, {'files': 0, 'bytes': 0, 'sample': []}); g['files'] += 1; g['bytes'] += pkg[p]['size']
        if len(g['sample']) < 6: g['sample'].append(p)
    print('④包裡有、但引用掃描沒有直接指到的（靠目錄整批收、動態拼的、無法判定先保留；INFO）：', flush=True)
    for r, g in sorted(groups.items(), key=lambda x: -x[1]['bytes']):
        print('   %-16s %5d 個 %12s  例：%s' % (r, g['files'], mb(g['bytes']), '、'.join(g['sample'][:4])), flush=True)
    ex = {}
    for f, x in res['decisions'].items():
        if f.startswith('assets/') and not x['include']:
            g = ex.setdefault(x['rule'], {'files': 0, 'bytes': 0, 'sample': []}); g['files'] += 1; g['bytes'] += x['size']
            if len(g['sample']) < 6: g['sample'].append(f)
    print('⑤repo 的 assets/ 沒進包的（INFO；排除規則見 docs/RELEASE_PACKAGING.md 第 3 節）：', flush=True)
    for r, g in sorted(ex.items(), key=lambda x: -x[1]['bytes']):
        print('   %-16s %5d 個 %12s  例：%s' % (r, g['files'], mb(g['bytes']), '、'.join(g['sample'][:4])), flush=True)
    big = sorted(pkg.values(), key=lambda f: -f['size'])[:20]
    print('包裡最大的 20 個檔：', flush=True)
    for f in big: print('   %12s  %s' % (mb(f['size']), f['path']), flush=True)
    if a.json:
        json.dump({'sha': full, 'required': len(required), 'expect': len(expect), 'package': len(P), 'missingRequired': miss_req, 'less': less, 'more': more,
                   'badSize': bad_size, 'badHash': bad_hash, 'unreferencedByRule': groups, 'excludedAssetsByRule': ex, 'runtimeOk': rt.get('ok')},
                  open(a.json, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


def zkey(r):
    npc = {k: v for k, v in (r.get('npc') or {}).items()}
    return {'ok': r.get('ok'), 'player': r.get('player'), 'npc': npc, 'proc': r.get('proc'), 'bldgFallback': sorted(r.get('bldgFallback') or []),
            'notCached': len(r.get('notCached') or []), 'bad': len(r.get('bad') or [])}


def zones_mode(files):
    if len(files) % 2: check('--zones 要成對（包、根目錄）', False, J(files)); return
    for i in range(0, len(files), 2):
        A = json.load(open(files[i], encoding='utf-8')); B = json.load(open(files[i + 1], encoding='utf-8'))
        print('== 第 %s 批：%s（%s） vs %s（%s）' % (A.get('batch'), os.path.basename(files[i]), A.get('tag'), os.path.basename(files[i + 1]), B.get('tag')), flush=True)
        ra = {r['zone']: r for r in A['rows']}; rb = {r['zone']: r for r in B['rows']}
        check('兩邊同一批區域', list(ra) == list(rb), J({'a': list(ra), 'b': list(rb)}))
        for z in ra:
            if z not in rb: continue
            ka, kb = zkey(ra[z]), zkey(rb[z])
            same = ka == kb
            # NPC 人數本來就可能差一兩個（路人隨機）：只差 vrm 人數、其他都一樣的另外標出來
            near = not same and all(ka[k] == kb[k] for k in ka if k != 'npc') and ka['proc'] == 0 and kb['proc'] == 0
            check('%s 兩邊數字一樣%s' % (z, '（只差路人人數，程序化都是 0）' if near else ''), same or near, J({'包': ka, '根目錄': kb}) if not same else J(ka))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('dist_files', nargs='?')
    ap.add_argument('--sha'); ap.add_argument('--repo', default=os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', '..', '..')))
    ap.add_argument('--no-hash', action='store_true'); ap.add_argument('--json')
    ap.add_argument('--zones', nargs='+')
    a = ap.parse_args()
    if a.zones: zones_mode(a.zones)
    elif a.dist_files: dist_mode(a)
    else: ap.error('給 dist_files.json 或 --zones')
    print('ALL PASS' if not FAILS else 'FAILED %d: %s' % (len(FAILS), '；'.join(FAILS[:30])), flush=True)
    sys.exit(1 if FAILS else 0)


if __name__ == '__main__':
    main()
