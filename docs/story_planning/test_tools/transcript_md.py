"""BB-B 10-24（QA-TRANSCRIPT-1018 延伸，LAWWW-B 08:32）：把 zrlast_probe R18 的 dumplog（OUT/<id>.json：畫面上的每一句 __LOG＋手機訊息 G.msgs）整理成劇本 markdown，給 AA 像讀者一樣讀。
用法：python3 transcript_md.py <dumplog.json> <輸出.md> <標題> [從 YYYY-MM-DD] [到 YYYY-MM-DD]
說明（照 tests/econ_transcript_md.py）：探測選項照情境的偏好、其他選第一個；同一句連續出現兩次只留一次（ADV.log 和 say 會各記一次）；
  CARD＝日期卡／地點字卡、CAPTION／CAPD＝畫面中間的字幕、TOAST／TOASTD＝提示框、CHOICE＝出現過的選項、BG＝背景（不列）；手機訊息每天另外列在後面。"""
import json, sys, datetime
src, dst, title = sys.argv[1], sys.argv[2], sys.argv[3]
k0 = sys.argv[4] if len(sys.argv) > 4 else '0000'; k1 = sys.argv[5] if len(sys.argv) > 5 else '9999'
J = json.load(open(src, encoding='utf-8'))
if len(sys.argv) <= 4:   # 沒給起點：從劇本第一句的日期開始（BB-B 10-24 22:2x：G.msgs 裡還有讀檔存檔帶進來的 2025 年舊訊息，標題只寫月／日會被當成這一年的）
    k0 = min((e.get('d') for e in J.get('log', []) if e.get('d')), default='0000')
WD = '一二三四五六日'
def hm(h):
    h = float(h or 0) % 24; return '%02d:%02d' % (int(h), int(round((h % 1) * 60)) % 60)
days = {}
prev = None
for e in J.get('log', []):
    d, n, t = e.get('d') or '', e.get('n') or '', str(e.get('t') or '')
    if not (k0 <= d <= k1) or n == 'BG' or t.startswith('BG:'): continue
    for p in ('TOASTD:', 'TOAST:', 'CAPTION2:', 'CAPTION:', 'CAPD:', 'CARD:', 'CHOICE:'):
        if t.startswith(p): n, t = {'TOASTD:': '提示', 'TOAST:': '提示', 'CAPTION2:': '字幕', 'CAPTION:': '字幕', 'CAPD:': '字幕', 'CARD:': '字卡', 'CHOICE:': '選項'}[p], t[len(p):]; break
    if not t.strip(): continue
    key = (n, t)
    if key == prev: continue
    prev = key
    days.setdefault(d, {'lines': [], 'msgs': []})['lines'].append((e.get('h'), n, t))
for m in J.get('msgs', []):
    d = m.get('key') or ''
    if not (k0 <= d <= k1): continue
    days.setdefault(d, {'lines': [], 'msgs': []})['msgs'].append(m)
out = ['# ' + title, '', '> 自動整理（docs/story_planning/test_tools/transcript_md.py，資料：zrlast_probe R18 的 dumplog）。不是驗收測試；選項照情境偏好、其他選第一個；同一句連續兩次只留一次。',
       '> 標記：**字卡**＝日期卡／地點字卡、**字幕**＝畫面中間的字、**提示**＝提示框、**選項**＝那一刻出現的選項（｜分隔）；沒有名字的是旁白。手機訊息每天另外列在後面（`[要回]`＝要回覆的）。', '',
       '> 截到：%s %s。' % (J.get('at', {}).get('d', ''), hm(J.get('at', {}).get('h', 0))), '']
for d in sorted(days):
    x = datetime.date.fromisoformat(d); out += ['', '## %d/%d（%s）' % (x.month, x.day, WD[x.weekday()]), '']
    for h, n, t in days[d]['lines']:
        if n in ('提示', '字幕', '字卡', '選項'): out.append('- `%s` **%s**：%s' % (hm(h), n, t))
        elif not n: out.append('- `%s` %s' % (hm(h), t))
        else: out.append('- `%s` **%s**：%s' % (hm(h), n, t))
    if days[d]['msgs']:
        out += ['', '手機：']
        for m in days[d]['msgs']:
            who = m.get('name') or m.get('from') or ''
            out.append('- `%s` %s%s%s：%s' % (hm(m.get('h')), '[要回] ' if m.get('ask') else '', m.get('th', '') + '｜' if m.get('th') else '', who, m.get('text', '')))
open(dst, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(dst, len(out), 'lines,', len(days), 'days')
