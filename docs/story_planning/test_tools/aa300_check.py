"""BB（帳號 A）2026-10-21：讀 aa300_probe（MODE=ff）的 log＋msgs.json，對 AA_368（H1、H2、H3、附 y0_py_notes2）和 BB218-P3（①③④⑥）。
用法：python3 aa300_check.py <aa300 的 log> <aa300 的輸出資料夾>"""
import sys, re, json, os
LOG, OUT = sys.argv[1], sys.argv[2]
txt = open(LOG, encoding='utf-8').read().splitlines()
res = []
def v(name, ok, why): res.append((name, ok, why)); print('[%s] %s %s' % ('PASS' if ok else 'FAIL', name, why))

cards = []   # (日期, 內容)
for l in txt:
    m = re.match(r'\s+【日期卡】 (\d{4}-\d\d-\d\d)｜(.*)', l)
    if m: cards.append((m.group(1), m.group(2)))
def cards_with(s): return [(d, c) for d, c in cards if s in c]

# H1：颱風假那句 10/1 以後；9/24 那張是系烤
ty = cards_with('颱風假那天'); v('AA_368 H1 颱風假那句不早於 10/1', bool(ty) and all(d >= '2024-10-01' for d, _ in ty), '出現在 %s' % [d for d, _ in ty])
# H2：四月二日那句 4/3 以後；三月那句 3/10～4/2
ap = cards_with('四月二日'); mar = cards_with('她開始把每天讀完的範圍寫在一張紙上')
v('AA_368 H2 四月二日那句不早於 4/3', all(d >= '2025-04-03' for d, _ in ap), '四月二日 %s；三月那句 %s' % ([d for d, _ in ap], [d for d, _ in mar]))
# BB218-P3 ①：十二月二十日那句不早於 12/20；7/19 的約定不早於 7/19
d20 = cards_with('十二月二十日'); v('BB218-P3 ① 十二月二十日那句不早於 12/20', all(d >= '2024-12-20' for d, _ in d20), '出現在 %s' % [d for d, _ in d20])
sat = [(d, c) for d, c in cards if '星期六，你搭' in c]; v('BB218-P3 ① 7/19（六）的約定那張不早於 7/19', all(d >= '2025-07-19' for d, _ in sat), '出現在 %s' % [(d, c[:24]) for d, c in sat])

# ③ 手機自己打開但待回 0 則：相鄰兩次至少隔 3 天
cur = None; opens = []
for l in txt:
    m = re.match(r'\s+\[\s*[\d.]+ 分\] (\{.*\})', l)
    if m:
        try: cur = json.loads(m.group(1))['key']
        except Exception: pass
    if '手機自己打開了（待回 0 則）' in l and cur: opens.append(cur)
from datetime import date
def dd(k): y, mo, d = map(int, k.split('-')); return date(y, mo, d)
gaps = [(a, b, (dd(b) - dd(a)).days) for a, b in zip(opens, opens[1:])]
short = [g for g in gaps if g[2] < 3 and g[0] < '2025-08-29']   # 參考：手機自己打開（待回 0 則）的間隔——任何新訊息都會開，不只小事
print('   （參考）手機自己打開、待回 0 則：%d 次；兩次相隔不到 3 天 %d 組 %s' % (len(opens), len(short), short[:6]))

# ④ 8/30 床邊／家裡的出遊選項小字不重複地點、時間
beds = [l for l in txt if '床的選單' in l or ('出發：' in l and '▶' in l)]
dup = [l.strip()[:120] for l in beds if re.search(r'出發：(\S+)\s+(\d\d:\d\d).*\1.*\2', l)]
v('BB218-P3 ④ 出遊選項小字不重複地點、時間', not dup, '重複的 %s' % dup[:3])

# ⑥ 右上角日期跟上
hud = [l.strip() for l in txt if '右上角日期' in l]
v('BB218-P3 ⑥ 對話時右上角日期＝真正的日期', not hud, '不一致 %d 次：%s' % (len(hud), hud[:3]))

# H3、附：msgs.json
mp = os.path.join(OUT, 'msgs.json')
if os.path.exists(mp):
    msgs = json.load(open(mp, encoding='utf-8'))
    feb8 = [m for m in msgs if m['from'] == 'kexin' and m['d'] == '2025-02-08']
    new = any('我把高三的講義翻出來了。' in m['text'] for m in feb8); old = [m for m in msgs if '如果可以重來一次選科系' in m['text']]; ask = [m for m in feb8 if m['ask']]
    v('AA_368 H3 2/8 可昕「我把高三的講義翻出來了。」、沒有選項', new and not old and not ask, '2/8 可昕 %s；舊題 %d；有選項 %d' % ([m['text'][:16] for m in feb8], len(old), len(ask)))
    # ③ 規則本身（a6441e98）：手機小事（tag dp_）和前面別的訊息（不是 rt_ 例行、不是 dp_）隔 3 天、不同一天；只看經濟系那一年
    other = sorted({dd(m['d']) for m in msgs if m['from'] != 'player' and not str(m.get('tag') or '').startswith(('rt_', 'dp_')) and m['d'] < '2025-08-29'})
    smalls = [(m['d'], m.get('tag'), m['text'][:14]) for m in msgs if str(m.get('tag') or '').startswith('dp_') and m['d'] < '2025-08-29']
    bad3 = [(d, t, x) for d, t, x in smalls if any(0 <= (dd(d) - o).days < 3 for o in other)]
    v('BB218-P3 ③ 手機小事和前面別的訊息隔 3 天、不同一天（經濟系那一年）', bool(smalls) and not bad3, '小事 %d 則；太近 %s' % (len(smalls), bad3[:6]))
    nt = [m for m in msgs if '我高中的筆記還在，掃描放雲端了。' in m['text']]
    v('AA_368 附 y0_py_notes2 大一下第 4 週收到', bool(nt), '收到 %s' % [m['d'] for m in nt])
else:
    v('AA_368 H3／附（msgs.json）', False, '沒有 msgs.json（腳本沒跑完或舊版腳本）')
print('合計：%d PASS、%d FAIL' % (sum(1 for r in res if r[1]), sum(1 for r in res if not r[1])))
