"""BB-B 10-25（BUG-US-WKND-EMPTYSTOP-1025）：zrlast_probe 整學期劇本的快轉停點，逐一看「停下來有沒有事」。
用法：python3 stops_check.py <線的 .log> <dumplog.json> [輸出.md]
停點＝log 裡「⏩ 停在 <日> <時> <區域>」且後面沒有括號（括號＝睡到早上、等約好的時間：玩家自己選的，不算快轉停）。
有事＝那一刻前後（停點前 0.6 小時～後 0.3 小時）有手機訊息，或停點後 1.5 小時內畫面有台詞／字幕／提示／選項（字卡、床的選單、生活費提示不算），或 log 裡下一個停點之前有「出發」「去上課」「手機回覆」「停下來」。
沒事的停點列出來（日子、星期、時間、前一個停點），週末 14:00 前後、10/16 21:00 前後另外標。"""
import json, re, sys, datetime
logf, dump = sys.argv[1], sys.argv[2]; outf = sys.argv[3] if len(sys.argv) > 3 else None
L = open(logf, encoding='utf-8').read().split('\n'); J = json.load(open(dump, encoding='utf-8'))
R = re.compile(r'⏩ 停在 (\d{4}-\d\d-\d\d) (-?[\d.]+) (\S+?)(（.*）)?$')
stops = []
for i, l in enumerate(L):
    m = R.search(l.strip())
    if m: stops.append(dict(i=i, d=m.group(1), h=float(m.group(2)), z=m.group(3), why=m.group(4)))
for k, s in enumerate(stops):
    j = stops[k + 1]['i'] if k + 1 < len(stops) else len(L); s['seg'] = L[s['i'] + 1:j]
msgs = [m for m in J.get('msgs', []) if m.get('key')]; log = [e for e in J.get('log', []) if e.get('d')]
BED = ('CHOICE:小睡', 'CHOICE:睡到', 'CHOICE:再睡', 'CHOICE:到下一個', 'CHOICE:快轉', 'CHOICE:睡覺', 'CHOICE:睡一下', 'TOAST:家裡匯來')
def BEDLINE(e):   # 停點自己的日期卡（CARD:M/D（W）HH:MM｜地點）、床的選單、快轉跳過那幾天的字卡（CARD 都不算）、生活費提示＝不算「有事」
    t = str(e.get('t', '')); return e.get('n') in ('BG', 'CARD') or t.startswith(BED)
WD = '一二三四五六日'; rows = []; n = 0
for k, s in enumerate(stops):
    if s['why']: continue
    n += 1; d, h = s['d'], s['h']
    near_m = [m for m in msgs if m['key'] == d and h - 0.6 <= float(m.get('h') or 0) <= h + 0.3]
    near_l = [e for e in log if e['d'] == d and h - 0.05 <= float(e.get('h') or 0) <= h + 1.5 and not BEDLINE(e)]
    acts = [l.strip() for l in s['seg'] if any(w in l for w in ('▶ 出發', '去上課', '手機回覆', '⏩ 停下來', '▶ '))]
    if near_m or near_l or acts: continue
    x = datetime.date.fromisoformat(d); wd = WD[x.weekday()]
    tag = '週末 14:00' if x.weekday() >= 5 and abs(h - 14) < 0.6 else ('10/16 21:00' if d.endswith('-10-16') and abs(h - 21) < 0.6 else '')
    prev = stops[k - 1] if k else None
    rows.append('| %s（%s） | %05.2f | %s | %s | %s |' % (d, wd, h, s['z'], tag, ('%s %.2f' % (prev['d'], prev['h'])) if prev else ''))
out = ['快轉停點 %d 個（不含睡到早上、等約好的時間），停下來沒事的 %d 個：' % (n, len(rows)), '', '| 日子 | 時間 | 區域 | 特別看 | 前一個停點 |', '|---|---|---|---|---|'] + rows
print('\n'.join(out))
if outf: open(outf, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
