"""接班一頁（tools/handoff/takeover.py，D165／HANDOFF-RULE-GAPS-1114）——不需要網路、不改任何東西。
1 交接檔的「下一班第一件事」整段抓得到（標題式、粗體行內式），到下一個標題／分隔線為止
2 新規則：只列 RULE_SOURCE 有、自己那一版沒有的 D 編號；有內文的那一行優先於標題列
3 一頁：上一任、第一件事原文、userwork、新規則、接下來五步；上一任沒正式交班會警告
用法：python3 tests/handoff_takeover_unit.py"""
import os, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'tools', 'handoff'))
import takeover as T
fails = 0
def check(name, ok, info=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + name + ('　' + str(info) if info and not ok else ''))
    fails += 0 if ok else 1
A = "# 交接\n### 下一班第一件事（照順序）\n1. 單車驗收\n   - 還沒做：測試\n2. 大步驗收\n\n### C｜正在做的\n無\n"
B = "**A｜成果** 很多\n- 下一班第一件事：①判 X ②判 Y\n- 等別人：Z\n**C｜正在做的**：沒有\n"
a, b = T.first_items(A), T.first_items(B)
check('1. 標題式：抓到標題＋兩條＋子項，不含下一節', len(a) == 4 and '大步驗收' in a[3] and not any('正在做' in l for l in a), a)
check('1. 行內式：抓到那一行和後面的條列，到下一個粗體小節為止', '判 X' in b[0] and any('等別人' in l for l in b) and not any('正在做' in l for l in b), b)
check('1. 沒有這一段＝空的', T.first_items('沒有') == [])
check('1b. 做到一半的：抓到「C｜正在做的」那一段（標題式有條列、行內式一行），不把「下一班第一件事」當成它', T.doing_items(A) == ['### C｜正在做的', '無'] and '沒有' in T.doing_items(B)[0] and T.doing_items('下一班第一件事：正在做的事') == [], [T.doing_items(A), T.doing_items(B)])
nr = T.new_rules(['舊：D145 D99'], ['## §2（D145、D160）\n規則 D160：店內一律用 CC0。\nD164 接班口令。D99 照舊'])
check('2. 只列新的（D160、D164），D160 取有內文的那一行', [n for n, _ in nr] == [160, 164] and nr[0][1].startswith('規則 D160'), nr)
src = {'seq': 9, 'ruleSource': {'branch': 'claude/rs'}, 'roles': {'LAWWW2': {'account': 'C', 'branch': 'claude/prev', 'state': 'handed-off'}, 'AA': {'account': 'C', 'branch': 'claude/p2', 'state': 'on'}}}
def show(_, spec):
    if spec.startswith('origin/claude/prev:'): return A
    if spec == 'origin/claude/rs:CLAUDE.md': return '規則 D160：店內一律用 CC0。'
    return ''
L, info = T.page('B', 'LAWWW2', src, show=show, userwork=lambda r: ['- X1 校門（還沒做）'])
txt = '\n'.join(L)
check('3. 一頁：上一任 C、第一件事原文、做到一半的、userwork、新規則 D160、接下來五步（含 --ref）', '帳號 C' in L[1] and '單車驗收' in txt and '上一任做到一半的' in txt and '上一任這一班改了什麼' in txt and 'C｜正在做的' in txt and 'X1 校門' in txt and 'D160' in txt and '--ref origin/claude/rs' in txt and info['items'] == 4 and '⚠' not in L[1], txt[:400])
L2, _ = T.page('B', 'AA', src, show=show)
check('3. 上一任沒正式交班：第 1 行警告、交接檔找不到第一件事也警告', '⚠ 上一任沒有正式交班' in L2[1] and any('找不到' in l for l in L2))
print('ALL PASS' if not fails else f'FAILED {fails}'); sys.exit(1 if fails else 0)
