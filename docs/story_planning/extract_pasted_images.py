#!/usr/bin/env python3
"""從自己的 Claude 對話紀錄（.jsonl）解出使用者貼在對話裡的圖片原檔。

用法：python3 docs/story_planning/extract_pasted_images.py [起始時間 UTC，例如 2026-10-16T23:13] [輸出資料夾]
- 對話紀錄在 /root/.claude/projects/<專案>/<session>.jsonl（自動找最新的那個）。
- 使用者直接貼的圖在 user 訊息的 content；工作中途插話貼的圖在 attachment（queued_command）裡，兩種都會解。
- 也會解出 Read 工具讀過的圖（tool_result），看檔名時間和大小分辨。
BB-B 2026-10-16（使用者：「你不是有學習怎麼從對話紀錄找到原檔嗎」）。
"""
import base64, glob, hashlib, json, os, sys

since = sys.argv[1] if len(sys.argv) > 1 else ''
out = sys.argv[2] if len(sys.argv) > 2 else os.path.join(os.getcwd(), 'pasted_images')
os.makedirs(out, exist_ok=True)
logs = sorted(glob.glob('/root/.claude/projects/*/*.jsonl'), key=os.path.getmtime)
P = logs[-1]
size = os.path.getsize(P)
f = open(P, 'rb')
if not since:
    f.seek(max(0, size - 80_000_000)); f.readline()
seen = set()

def walk(o, ts, where):
    if isinstance(o, dict):
        src = o.get('source')
        if o.get('type') == 'image' and isinstance(src, dict) and src.get('type') == 'base64':
            data = base64.b64decode(src['data']); h = hashlib.md5(data).hexdigest()[:8]
            if h not in seen:
                seen.add(h)
                ext = src.get('media_type', 'image/png').split('/')[-1]
                fn = os.path.join(out, f"{ts.replace(':', '')}_{h}.{ext}")
                open(fn, 'wb').write(data)
                print(fn, len(data), where)
        for k, v in o.items():
            walk(v, ts, where + '/' + k)
    elif isinstance(o, list):
        for v in o:
            walk(v, ts, where)

for line in f:
    try:
        j = json.loads(line)
    except Exception:
        continue
    ts = j.get('timestamp', '')
    if since and ts < since:
        continue
    walk(j, ts, j.get('type', ''))
