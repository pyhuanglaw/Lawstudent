#!/usr/bin/env python3
"""NOODLE-NAME-PURGE-1112（使用者 2026-11-12 對 BB-C：「麵店團不是已經改成桌遊團了嗎 ??github上所有麵店團都刪掉 改成桌遊團」）。
把追蹤中的文字檔裡的「麵店團」換成「桌遊團」。留著不換的（--list 會列出來）：
  1. 同一行同時寫到兩個名字的＝改名、舊存檔轉換本身的紀錄（X182、AA_623、這次的任務、FACTS 那一行、使用者原話）；
  2. 舊存檔群組名轉換的程式（story3d.js S.NDL_OLD_NAMES、noodle_team_new 那一行的 replace）；
  3. 匯入工具產生、內容要和企劃線來源逐字一樣的資料檔（GENERATED；等 AA 改完來源重匯）；
  4. 二進位、bundle、patch；
  5. 匯入對照表和讀企劃線舊稿的六支測試（CONVERT；AA 把企劃線來源改完、白名單換 SHA 以後再換）。
用法：python3 tools/handoff/ndl_purge.py [--apply] [--list]"""
import subprocess, sys
OLD, NEW = '麵店團', '桌遊團'
GENERATED = {'src/data/date_wish.js'}
# 匯入時把企劃稿的舊名換掉的對照表（old 欄就是要比對的舊字，換了匯入就對不到）；讀企劃線舊稿、拿舊名當比對鍵的測試
CONVERT = {'tools/story/aa674_fix.json', 'tools/story/ndl542_fix.json', 'tools/story/import_guard.py',
           'tests/aa437_ex_unit.js', 'tests/aa461_y2s2_unit.js', 'tests/aa473_pg_unit.js', 'tests/aa502_dorm203_unit.js', 'tests/ladder_reimport_unit.js', 'tests/ndl_group_unit.js'}
SKIP_EXT = ('.bundle', '.patch', '.glb', '.webp', '.png', '.jpg', '.vrm', '.zip', '.pdf')
KEEP_MARK = ('NDL_OLD_NAMES', "replace(/「(" + OLD)
files = subprocess.run(['git', 'grep', '-l', OLD], capture_output=True, text=True).stdout.split('\n')
changed = kept = 0; keptl = []
for f in filter(None, files):
    if f in GENERATED or f in CONVERT or f.endswith(SKIP_EXT) or f == 'tools/handoff/ndl_purge.py':
        keptl.append(f + '（整個檔不動）'); continue
    try:
        L = open(f, encoding='utf-8').read().split('\n')
    except (UnicodeDecodeError, OSError):
        keptl.append(f + '（讀不了）'); continue
    out = []; n = 0
    for i, l in enumerate(L):
        if OLD in l and (NEW in l or any(m in l for m in KEEP_MARK)):
            kept += 1; keptl.append(f'{f}:{i+1}'); out.append(l)
        elif OLD in l:
            n += l.count(OLD); out.append(l.replace(OLD, NEW))
        else:
            out.append(l)
    if n:
        changed += n
        if '--apply' in sys.argv: open(f, 'w', encoding='utf-8').write('\n'.join(out))
print(f'換 {changed} 處；留 {kept} 行＋整檔 {sum(1 for k in keptl if "（" in k)} 個' + ('' if '--apply' in sys.argv else '（沒有 --apply，只是試算）'))
if '--list' in sys.argv: print('\n'.join(keptl))
