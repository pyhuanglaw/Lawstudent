#!/usr/bin/env python3
"""從工作階段的對話紀錄（~/.claude/projects/<專案>/<session>.jsonl）取出使用者傳的圖。
使用者 2026-11-02：「對話就找的到圖 你為什麼一直要我重新傳」——工作中途傳的圖不會存到 images/ 資料夾，但對話紀錄裡有，
一律從這裡拿，不請使用者重傳。

用法：python3 tools/handoff/chat_images.py <輸出資料夾> [--last N] [--jsonl 路徑]
  不給 --jsonl：找 ~/.claude/projects/*/ 底下最新改過的 .jsonl（＝目前的工作階段）
  --last N：只取最後 N 張（照傳的順序）
"""
import sys, json, base64, glob, os, argparse
ap=argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--last',type=int,default=0); ap.add_argument('--jsonl')
a=ap.parse_args()
js=a.jsonl or max(glob.glob(os.path.expanduser('~/.claude/projects/*/*.jsonl')),key=os.path.getmtime)
imgs=[]
for line in open(js,encoding='utf-8'):
    try: o=json.loads(line)
    except Exception: continue
    if o.get('type')!='user': continue
    c=(o.get('message') or {}).get('content')
    if not isinstance(c,list): continue
    for b in c:
        if isinstance(b,dict) and b.get('type')=='image':
            s=b.get('source') or {}
            if s.get('type')=='base64': imgs.append((o.get('timestamp',''),s.get('media_type','image/png'),s['data']))
if a.last: imgs=imgs[-a.last:]
os.makedirs(a.out,exist_ok=True)
for i,(ts,mt,data) in enumerate(imgs,1):
    ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}.get(mt,'img')
    p=os.path.join(a.out,'%02d.%s'%(i,ext)); open(p,'wb').write(base64.b64decode(data)); print(p,ts)
print('共',len(imgs),'張（',js,'）')
