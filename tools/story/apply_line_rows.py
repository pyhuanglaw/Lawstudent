"""AA 的逐行改稿（{file, line, old, new}；AA_794、AA_799 這種格式）→ 手寫的遊戲檔。
用法：python3 tools/story/apply_line_rows.py <稿路徑>@<企劃線 commit> [--apply]
  先空跑：每一列印出對到哪裡；--apply 才寫檔。
規則（照稿一字不改，對不到就停，不猜）：
  - 稿從 git show <commit>:<稿路徑> 讀（企劃線要先 fetch）。
  - 那一列的 file 第 line 行要剛好有一次 old；行號差了（前面有人加減行）就在整個檔找，整個檔剛好一次才換，並印出實際行號。
  - 換完 old 不能還在那個檔的程式和字串裡（同一句兩處、只換一處＝停；註解裡提到的列出來、不動）。已經換過的（沒有舊句、有新句）印出來跳過，重跑不會壞。
  - --by-line：只換稿指定的那一行；別的行還有同一句（短句、別人也說）列出來、不停（稿是逐行審過的才用）。
  - 自動產生的檔（檔頭寫「自動產生」）不換——那種要改源稿重匯，回報 AA。加 --skip-generated＝那幾列列出來、其他照換。
"""
import json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))


def die(m):
    print('停：' + m)
    sys.exit(1)


def main():
    if len(sys.argv) < 2 or '@' not in sys.argv[1]:
        die('用法：apply_line_rows.py <稿路徑>@<commit> [--apply]')
    doc, sha = sys.argv[1].rsplit('@', 1)
    apply = '--apply' in sys.argv
    skip_gen = '--skip-generated' in sys.argv
    skipped = []
    already = 0
    try:
        d = json.loads(subprocess.check_output(['git', '-C', ROOT, 'show', f'{sha}:{doc}']).decode('utf-8'))
    except Exception as e:
        die(f'讀不到 {doc}@{sha}（企劃線 fetch 了嗎？）：{e}')
    rows = d['rows'] if isinstance(d, dict) else d
    files = {}
    for i, r in enumerate(rows):
        f, ln, old, new = r['file'], int(r['line']), r['old'], r['new']
        if not old or old == new:
            die(f'第 {i} 列 old 空的或和 new 一樣')
        if f in {x[0] for x in skipped}:   # 同一個自動產生的檔後面的列也跳過
            skipped.append((f, ln, old)); continue
        if f not in files:
            p = os.path.join(ROOT, f)
            if not os.path.exists(p):
                die(f'第 {i} 列：{f} 不存在')
            t = open(p, encoding='utf-8').read()
            if '自動產生' in t[:400]:
                if not skip_gen:
                    die(f'{f} 是自動產生的檔——要改源稿重匯，不直接換（--skip-generated 先換其他的）')
                skipped.append((f, ln, old)); continue
            files[f] = t.split('\n')
        L = files[f]
        at = None
        if 1 <= ln <= len(L) and L[ln - 1].count(old) == 1:
            at = ln
        else:
            hits = [k + 1 for k, s in enumerate(L) if old in s]
            tot = sum(s.count(old) for s in L)
            if tot == 0 and sum(s.count(new) for s in L) >= 1 and old not in new:
                print(f'  （第 {i} 列已經換過：{f} 有「{new}」、沒有舊句）'); already += 1; continue
            if tot != 1:
                die(f'第 {i} 列：{f}:{ln} 沒有剛好一次「{old}」，整個檔有 {tot} 次（行 {hits[:5]}）——對不到，不猜')
            at = hits[0]
            print(f'  （第 {i} 列行號 {ln} → 實際 {at}）')
        L[at - 1] = L[at - 1].replace(old, new, 1)
        print(f'{f}:{at}　「{old}」→「{new}」')
    for f, ln, old in skipped:
        print(f'跳過（自動產生的檔，要改源稿重匯）：{f}:{ln}　「{old}」')
    for f, L in files.items():
        t = '\n'.join(L)
        code = re.sub(r'/\*.*?\*/', '', t, flags=re.S)
        code = re.sub(r'(^|[^:\'"])//[^\n]*', r'\1', code)   # 註解裡提到舊句不算（說明文字，不播）；只看程式和字串
        left = [r['old'] for r in rows if r['file'] == f and r['old'] in code and r['old'] not in r['new']]
        for o in sorted({r['old'] for r in rows if r['file'] == f and r['old'] in t and r['old'] not in code and r['old'] not in r['new']}):
            print(f'  （{f} 的註解裡還提到舊句「{o}」——說明文字，不動）')
        if left and '--by-line' in sys.argv:
            # --by-line（2026-11-12，AA_818 可昕 70 列）：稿是「這一行的這一句」，很短的句子（「……好。」）別的行、別人也有——那些不是這一列要改的。
            # 只要求每一列自己那一行換掉了；別的行還有同一句的列出來給人看，不停。
            for o in sorted(set(left)):
                where = [i + 1 for i, l in enumerate(L) if o in l]
                print(f'  （{f} 別的行還有「{o}」：第 {where[:12]} 行——不是這份稿指定的行，不動）')
            left = []
        if left:
            die(f'{f} 換完還有舊句：{left[:3]}')
        if apply:
            open(os.path.join(ROOT, f), 'w', encoding='utf-8').write(t)
    print(f'{doc}@{sha}：{len(rows) - len(skipped) - already} 列換了、{len(files)} 個檔' + (f'；已經換過 {already} 列' if already else '') + (f'；跳過自動產生的檔 {len(skipped)} 列' if skipped else '') + ('（已寫入）' if apply else '（空跑；加 --apply 寫入）'))


main()
