#!/usr/bin/env python3
"""回合長度檢查（D90「使用者訊息優先協定」的自我檢查；2026-10-16）。

平台事實（LAWWW-B 2026-10-16 從自己的工作階段紀錄查證）：使用者在一個回合進行中傳的訊息，要等這個回合結束才會送到模型；
回合中間只看得到系統通知、背景工作的結果。所以「使用者最多要等多久」＝回合有多長。

這支工具讀 Claude Code 的工作階段紀錄（~/.claude/projects/<專案>/<工作階段>.jsonl），列出每個回合（從一則使用者訊息或
自己排的提醒送到，到下一則送到為止）用了多久、呼叫了幾次工具，超過上限的標出來。它不改任何檔案。

用法：
  python3 tools/handoff/turn_check.py                 # 自動找最新的工作階段紀錄
  python3 tools/handoff/turn_check.py 路徑.jsonl [--since 2026-10-16T20:00] [--max-min 10] [--max-tools 30]
結束碼：0＝沒有超過上限的回合；1＝有（列出來）；2＝找不到紀錄。"""
import json, sys, glob, os, datetime as dt

def parse_args(a):
    o = {'path': None, 'since': None, 'max_min': 10.0, 'max_tools': 30}
    i = 0
    while i < len(a):
        if a[i] == '--since': o['since'] = a[i + 1]; i += 2
        elif a[i] == '--max-min': o['max_min'] = float(a[i + 1]); i += 2
        elif a[i] == '--max-tools': o['max_tools'] = int(a[i + 1]); i += 2
        else: o['path'] = a[i]; i += 1
    return o

def ts(s):
    return dt.datetime.fromisoformat(s.replace('Z', '+00:00'))

def main():
    o = parse_args(sys.argv[1:])
    p = o['path']
    if not p:
        c = sorted(glob.glob(os.path.expanduser('~/.claude/projects/*/*.jsonl')), key=os.path.getmtime)
        if not c: print('找不到工作階段紀錄'); sys.exit(2)
        p = c[-1]
    turns = []; cur = None
    for line in open(p, encoding='utf-8'):
        try: e = json.loads(line)
        except Exception: continue
        t = e.get('timestamp'); typ = e.get('type')
        if not t: continue
        if o['since'] and t < o['since']: continue
        if typ == 'user':
            c = e.get('message', {}).get('content')
            is_tool_result = isinstance(c, list) and any(isinstance(x, dict) and x.get('type') == 'tool_result' for x in c)
            if is_tool_result: continue
            txt = c if isinstance(c, str) else ' '.join(x.get('text', '') for x in (c or []) if isinstance(x, dict) and x.get('type') == 'text')
            if cur: turns.append(cur)   # 回合結束＝最後一個 AI 動作的時間（不算回合結束後的閒置；BB-B 2026-10-16 回報）
            kind = '使用者' if txt and not txt.lstrip().startswith('<') and not txt.startswith('Stop hook') else ('stop hook' if txt.startswith('Stop hook') else '系統／提醒')
            cur = {'start': t, 'end': t, 'tools': 0, 'kind': kind, 'text': (txt or '').replace('\n', ' ')[:40]}
        elif typ == 'assistant' and cur:
            cur['end'] = t
            for x in (e.get('message', {}).get('content') or []):
                if isinstance(x, dict) and x.get('type') == 'tool_use': cur['tools'] += 1
    if cur: turns.append(cur)
    bad = 0
    print(f'紀錄：{p}')
    print('開始（UTC）  分鐘   工具  送到的是     內容')
    for u in turns:
        m = (ts(u['end']) - ts(u['start'])).total_seconds() / 60
        over = m > o['max_min'] or u['tools'] > o['max_tools']
        if over: bad += 1
        print(f"{u['start'][11:19]}  {m:5.1f}  {u['tools']:4d}  {u['kind']:<10} {u['text']}{'　← 超過上限' if over else ''}")
    print(f"回合 {len(turns)} 個；超過 {o['max_min']:.0f} 分鐘或 {o['max_tools']} 次工具的 {bad} 個")
    sys.exit(1 if bad else 0)

if __name__ == '__main__':
    main()
