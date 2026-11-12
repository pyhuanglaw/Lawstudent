#!/usr/bin/env python3
"""從工作階段的對話紀錄（~/.claude/projects/<專案>/<session>.jsonl）取出使用者傳的圖（D122）。
使用者 2026-11-02：「對話就找的到圖 你為什麼一直要我重新傳」——不請使用者重傳，一律從這裡拿。

圖在對話紀錄的兩種行裡（BB_225，企劃線 2de627643；BB 06:43 更正）：
  - type:"user" 的 message.content（一般訊息傳的圖）
  - type:"attachment"、attachment.type:"queued_command" 的那一行（AI 工作中途使用者插話傳的圖）
做法：整行 JSON 走一遍，收集所有 {type:"image", source:{type:"base64"}}，用那一行的 timestamp 排序。
不要只用 --last：會抓到舊的圖。用 --since（使用者傳圖的時間，UTC）篩；存檔以後做縮圖拼貼核對對應、用 md5 查重複。

用法：python3 tools/handoff/chat_images.py <輸出資料夾> [--since 2026-11-02T06:40] [--until …] [--last N] [--jsonl 路徑]
  不給 --jsonl：找 ~/.claude/projects/*/ 底下最新改過的 .jsonl（＝目前的工作階段）
  檔名：<序號>_<時間>.<副檔名>；同一張（md5 相同）只存一次
"""
import sys, json, base64, glob, os, argparse, hashlib
ap=argparse.ArgumentParser(); ap.add_argument('out'); ap.add_argument('--since'); ap.add_argument('--until'); ap.add_argument('--last',type=int,default=0); ap.add_argument('--jsonl')
a=ap.parse_args()
js=a.jsonl or max(glob.glob(os.path.expanduser('~/.claude/projects/*/*.jsonl')),key=os.path.getmtime)

def walk(x,out):
    if isinstance(x,dict):
        if x.get('type')=='image' and isinstance(x.get('source'),dict) and x['source'].get('type')=='base64' and x['source'].get('data'):
            out.append((x['source'].get('media_type','image/png'),x['source']['data'])); return
        for v in x.values(): walk(v,out)
    elif isinstance(x,list):
        for v in x: walk(v,out)

imgs=[]; seen=set()
for line in open(js,encoding='utf-8'):
    try: o=json.loads(line)
    except Exception: continue
    t=o.get('type')
    if t=='user':
        c=(o.get('message') or {}).get('content'); src=[x for x in c if not (isinstance(x,dict) and x.get('type')=='tool_result')] if isinstance(c,list) else c   # 工具結果（Read 看的截圖、拼貼）不是使用者傳的
    elif t=='attachment' and (o.get('attachment') or {}).get('type')=='queued_command': src=o.get('attachment')
    else: continue   # 工具結果、助手的回覆裡的圖不算使用者傳的
    ts=o.get('timestamp','')
    if a.since and ts<a.since: continue
    if a.until and ts>a.until: continue
    found=[]; walk(src,found)
    for mt,data in found:
        h=hashlib.md5(data.encode()).hexdigest()
        if h in seen: continue
        seen.add(h); imgs.append((ts,mt,data,h))
imgs.sort(key=lambda r:r[0])
if a.last: imgs=imgs[-a.last:]
os.makedirs(a.out,exist_ok=True)
for i,(ts,mt,data,h) in enumerate(imgs,1):
    ext={'image/png':'png','image/jpeg':'jpg','image/webp':'webp'}.get(mt,'img')
    p=os.path.join(a.out,'%02d_%s.%s'%(i,ts.replace(':','')[:17],ext)); open(p,'wb').write(base64.b64decode(data)); print(p,ts,h[:8])
print('共',len(imgs),'張（',js,'）')
