"""把瀏覽器探測（tests/econ_ff_probe1.py／probe2.py，OUT 資料夾的 transcript1.json、transcript2.json）收到的台詞整理成劇本 markdown，給 AA 像玩家一樣讀（QA-TRANSCRIPT-1018）。
用法：python3 tests/econ_transcript_md.py <transcript.json> <輸出.md> <標題>
說明：探測一律選第一個選項、手機自動打開就跳過；同一句連續出現兩次只留一次（ADV.log 掛勾會記兩次）；日期照遊戲的日曆換算。"""
import json, sys, datetime
src, dst, title = sys.argv[1], sys.argv[2], sys.argv[3]
T = json.load(open(src, encoding='utf-8'))
D0 = datetime.date(2025, 8, 29)   # 遊戲第 −18 天＝2025-08-29（story3d.js S.LAW_D0）
def date(d): return D0 + datetime.timedelta(days=d + 18)
WD = '一二三四五六日'
out = ['# ' + title, '', '> 自動整理（tests/econ_transcript_md.py）。探測選項都選第一個；手機訊息沒有收進來（只收對話框）；跳過時的日期卡沒有收。', '']
last_day, prev = None, None
for d, h, who, text in T:
    if text is None: continue
    key = (who, text)
    if key == prev: continue
    prev = key
    if d != last_day:
        x = date(d); out += ['', '## %d/%d（%s）' % (x.month, x.day, WD[x.weekday()]), '']; last_day = d
    hh = int(h % 24); mm = int(round((h % 1) * 60)) % 60
    if not who: out.append('- `%02d:%02d` %s' % (hh, mm, text))
    else: out.append('- `%02d:%02d` **%s**：%s' % (hh, mm, who, text))
open(dst, 'w', encoding='utf-8').write('\n'.join(out) + '\n')
print(dst, len(out), 'lines')
