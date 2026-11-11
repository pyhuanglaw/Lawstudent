#!/usr/bin/env python3
"""版本資訊單一來源（REL-PACKAGING-1111，USER_WANTS X340）：README 的版本區塊照 index.html 自動產生。

單一來源＝index.html 標題畫面的「版本 vX.Y.Z（YYYY-MM-DD）」那一行——發布樹腳本 tools/handoff/mk_release_tree.sh 每次發布寫的就是它
（同時把每支 script 的 ?v= 換成同一個版號；tests/deploy_check.py 在瀏覽器驗兩者一致）。README 不再手寫版號。

用法：
  python3 tools/release/sync_version.py            # 把 README.md 兩個標記之間那一段改成現在的版本
  python3 tools/release/sync_version.py --check    # 只檢查；不一樣就結束碼 1（tests/readme_version_unit.js 用同一個規則）
  python3 tools/release/sync_version.py --print    # 只印 index.html 的版本（JSON）
README 裡的標記：<!-- VERSION:START … --> 和 <!-- VERSION:END -->；標記以外的字不動。
"""
import json, pathlib, re, sys

sys.path.insert(0, str(pathlib.Path(__file__).resolve().parent))
import relcommon as rc

START = '<!-- VERSION:START（自動產生，不要手改這一段：python3 tools/release/sync_version.py；來源是 index.html 標題畫面的版本字樣） -->'
END = '<!-- VERSION:END -->'
BLOCK_RE = re.compile(r'<!-- VERSION:START[^>]*-->.*?<!-- VERSION:END -->', re.S)


def block(v):
    return START + '\n- 目前線上的發布版本：**v%s（%s）**。標題畫面最下面有同一行版本字樣。\n' % (v['version'], v['date']) + END


def main():
    root = pathlib.Path(__file__).resolve().parents[2]
    for a in sys.argv[1:]:
        if a.startswith('--root='):
            root = pathlib.Path(a.split('=', 1)[1])
    v = rc.read_version(root)
    if not v['version']:
        print('index.html 找不到「版本 vX（日期）」那一行', file=sys.stderr)
        sys.exit(2)
    if '--print' in sys.argv:
        print(json.dumps(v, ensure_ascii=False))
        return
    readme = root / 'README.md'
    text = readme.read_text(encoding='utf-8')
    if not BLOCK_RE.search(text):
        print('README.md 沒有 VERSION:START／VERSION:END 標記', file=sys.stderr)
        sys.exit(2)
    new = BLOCK_RE.sub(lambda m: block(v), text, count=1)
    if '--check' in sys.argv:
        if new != text:
            print('README.md 的版本區塊和 index.html（v%s，%s）不一樣：跑 python3 tools/release/sync_version.py' % (v['version'], v['date']))
            sys.exit(1)
        print('README.md 的版本區塊＝index.html：v%s（%s）' % (v['version'], v['date']))
        return
    if new != text:
        readme.write_text(new, encoding='utf-8')
        print('README.md 版本區塊 → v%s（%s）' % (v['version'], v['date']))
    else:
        print('README.md 版本區塊已經是 v%s（%s）' % (v['version'], v['date']))


if __name__ == '__main__':
    main()
