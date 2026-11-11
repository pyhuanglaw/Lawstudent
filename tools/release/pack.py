#!/usr/bin/env python3
"""正式發行打包（REL-PACKAGING-1111，USER_WANTS X340）：把遊戲執行需要的檔複製到 dist/<target>/，寫 manifest.json。

用法：
  python3 tools/release/pack.py --target web --dry-run        # 只列清單與容量，不寫任何檔
  python3 tools/release/pack.py --target web                  # → dist/web/（等同 GitHub Pages 上遊戲實際需要的檔）
  python3 tools/release/pack.py --target win-stage            # → dist/win-stage/（給桌面封裝用的靜態檔；不含封裝器）
  python3 tools/release/pack.py --target all
  選項：--root <樹>（預設這個 repo）、--out <目錄>（預設 <root>/dist）、--list（列每個檔）、--no-runtime、--force（有缺檔照樣包）

- 只讀原始檔、只寫 --out 底下；不改、不刪、不搬 repo 裡任何東西。dist/ 在 .gitignore，不 commit。
- 收哪些、為什麼：tools/release/deps.py 的規則（docs/RELEASE_PACKAGING.md 第 3、4 節）。
- 同一個 commit 跑兩次，manifest.json 一模一樣（沒有時間戳）；每個檔有 path、size、sha256、rule。
- 打完用 `node tools/release/verify_dist.js dist/<target>` 驗（起本機伺服器逐檔請求、比對雜湊）。
結束碼：0 成功；1＝依賴檢查有缺檔／規則打架／還沒決定的頂層檔（沒加 --force 就不打包）；2＝執行錯誤。
"""
import argparse, json, pathlib, shutil, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import relcommon as rc
import deps

MANIFEST_NAME = 'manifest.json'
TARGET_NOTES = {
    'web': '網頁版：等同 GitHub Pages 上遊戲實際需要的檔（Pages 目前服務整個 repo 根目錄；這份只留遊戲會用到的）。',
    'win-stage': 'Windows 封裝用的靜態檔：交給桌面封裝器（Electron 等）當內容目錄；不含封裝器、不含 Steamworks。',
}


def build_manifest(res):
    files = []
    for f, d in sorted(res['decisions'].items()):
        if d['include']:
            files.append({'path': f, 'size': d['size'], 'rule': d['rule'], 'note': d['note']})
    s = res['summary']
    return {
        'format': 1,
        'game': '法條之外：台灣法律人生',
        'target': res['target'],
        'targetNote': TARGET_NOTES[res['target']],
        'version': res['version']['version'], 'versionDate': res['version']['date'],
        'commit': res['git'].get('commit', ''), 'branch': res['git'].get('branch', ''), 'dirty': res['git'].get('dirty'),
        'filesMode': res['filesMode'],
        'totals': {'files': len(files), 'bytes': sum(x['size'] for x in files),
                   'excludedFiles': s['filesExcluded'], 'excludedBytes': s['bytesExcluded'], 'sourceFiles': s['filesTotal'], 'sourceBytes': s['bytesTotal']},
        'byRule': s['byRule'],
        'runtimeTablesRead': res['runtime']['ok'],
        'external': res['index']['external'],
        'required': deps.required_paths(res),
        'unsure': sorted(f for f, d in res['decisions'].items() if d['rule'] == 'R7-KEEP-UNSURE'),
        'files': files,
    }


def safe_clean(out_dir, root):
    """清掉上一次的輸出：只清「在 <root>/dist 底下」或「裡面有我們的 manifest.json」的目錄，其他一律不動。"""
    if not out_dir.exists() or not any(out_dir.iterdir()):
        return
    inside_dist = (root / 'dist') == out_dir.parent or (root / 'dist') in out_dir.parents
    ours = (out_dir / MANIFEST_NAME).exists()
    if not (inside_dist or ours):
        raise SystemExit('輸出目錄 %s 不是空的、也不是這支腳本產生的，不清也不寫（請換一個 --out）' % out_dir)
    shutil.rmtree(out_dir)


def pack_one(root, target, out_base, dry, runtime, force, show_list, files_mode):
    res = deps.analyze(root, target, runtime, files_mode)
    man = build_manifest(res)
    t = man['totals']
    und = [f for f, d in res['decisions'].items() if d['rule'] == 'X9-UNDECIDED']
    print('[%s] v%s（%s）commit %s：收 %d 個檔 %s；排除 %d 個 %s' % (target, man['version'], man['versionDate'], (man['commit'] or '（不是 git 樹）')[:9],
          t['files'], rc.fmt_size(t['bytes']), t['excludedFiles'], rc.fmt_size(t['excludedBytes'])))
    for rid, e in man['byRule'].items():
        print('    %-18s %s %5d 個 %s' % (rid, '收  ' if e['include'] else '排除', e['files'], rc.fmt_size(e['bytes'])))
    if not man['runtimeTablesRead']:
        print('    注意：執行期表沒讀到（%s）——只靠靜態掃描；assets/ 沒被指到的照樣全部保留' % '；'.join(res['runtime']['errors'][:2]))
    problems = []
    if res['missing']:
        problems.append('需要但不存在 %d 個：%s' % (len(res['missing']), '、'.join(m['path'] for m in res['missing'][:5])))
    if res['blocked']:
        problems.append('需要卻被排除規則擋掉 %d 個：%s' % (len(res['blocked']), '、'.join(res['blocked'][:5])))
    if und:
        problems.append('還沒決定收不收的頂層檔 %d 個：%s' % (len(und), '、'.join(und[:5])))
    for p in problems:
        print('    問題：' + p)
    if show_list:
        for x in man['files']:
            print('    %10d  %-16s %s' % (x['size'], x['rule'], x['path']))
    if problems and not force:
        print('    → 不打包（修好或加 --force）')
        return 1
    if dry:
        print('    （--dry-run：沒有寫任何檔）')
        return 0
    out_dir = (out_base / target).resolve()
    if root == out_dir or root in out_dir.parents and not ((root / 'dist') == out_dir.parent or (root / 'dist') in out_dir.parents):
        raise SystemExit('輸出目錄 %s 在 repo 裡、又不在 dist/ 底下，不寫' % out_dir)
    safe_clean(out_dir, root)
    out_dir.mkdir(parents=True, exist_ok=True)
    for x in man['files']:
        dst = out_dir / x['path']
        dst.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(root / x['path'], dst)
        x['sha256'] = rc.sha256_file(dst)
        if dst.stat().st_size != x['size']:
            raise SystemExit('複製以後大小不一樣：%s' % x['path'])
    (out_dir / MANIFEST_NAME).write_text(json.dumps(man, ensure_ascii=False, indent=1) + '\n', encoding='utf-8')
    print('    寫入 %s（%d 個檔＋%s）' % (out_dir, t['files'], MANIFEST_NAME))
    return 0


def main():
    ap = argparse.ArgumentParser(description='正式發行打包')
    ap.add_argument('--root', default=str(pathlib.Path(__file__).resolve().parents[2]))
    ap.add_argument('--target', default='web', choices=deps.TARGETS + ('all',))
    ap.add_argument('--out', help='輸出的上層目錄（預設 <root>/dist）')
    ap.add_argument('--dry-run', action='store_true')
    ap.add_argument('--list', action='store_true', help='列出每個收進來的檔')
    ap.add_argument('--files', default='auto', choices=('auto', 'git', 'walk'))
    ap.add_argument('--no-runtime', action='store_true')
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    root = pathlib.Path(a.root).resolve()
    out_base = pathlib.Path(a.out).resolve() if a.out else root / 'dist'
    code = 0
    for t in (deps.TARGETS if a.target == 'all' else (a.target,)):
        code = max(code, pack_one(root, t, out_base, a.dry_run, not a.no_runtime, a.force, a.list, a.files))
    sys.exit(code)


if __name__ == '__main__':
    try:
        main()
    except SystemExit:
        raise
    except Exception as e:
        print('執行錯誤：%s' % e, file=sys.stderr)
        sys.exit(2)
