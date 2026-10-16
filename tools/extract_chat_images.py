"""把使用者在 Claude Code 對話裡貼的圖片，從這個工作階段的對話紀錄（jsonl）取出來存成檔案。
LAWWW2-B 2026-10-16：使用者在對話裡貼的圖不會自動變成磁碟上的檔案，send_message 也傳不了圖；
但對話紀錄裡有圖片的原始資料（base64），可以原樣解碼，不裁切、不改尺寸、不重新壓縮。

用法（在自己的工作階段裡跑；只讀自己的對話紀錄）：
  python3 tools/extract_chat_images.py --list                 # 列出對話裡所有使用者貼的圖（編號、時間、格式、大小）
  python3 tools/extract_chat_images.py --last 2 --out <資料夾>  # 取出最後 2 張
  python3 tools/extract_chat_images.py --pick 5,6 --out <資料夾> # 取出指定編號
  python3 tools/extract_chat_images.py --jsonl <路徑> ...       # 指定對話紀錄（預設：/root/.claude/projects/ 底下最近修改的 .jsonl＝目前這個工作階段）

圖在對話紀錄的兩個地方：
  ① 一般的使用者訊息：message.role=='user' 的 content 陣列裡 {"type":"image","source":{"type":"base64","media_type":...,"data":...}}
  ② 工作中途插進來的訊息（mid-turn）：attachment.type=='queued_command' 的 attachment.prompt 陣列裡，同樣的 image 物件
工具結果裡的截圖（自己用 Read 看的圖）不算使用者貼的圖，預設不列；要的話加 --all。
"""
import argparse, base64, glob, hashlib, json, os, sys

EXT = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif'}


def find_jsonl():
    files = glob.glob('/root/.claude/projects/*/*.jsonl') + glob.glob(os.path.expanduser('~/.claude/projects/*/*.jsonl'))
    files = [f for f in set(files) if '/subagents/' not in f]
    if not files: sys.exit('找不到對話紀錄（~/.claude/projects/*/*.jsonl）')
    return max(files, key=os.path.getmtime)


def images(path, include_tool=False):
    out = []
    for ln in open(path, encoding='utf8'):
        try: d = json.loads(ln)
        except ValueError: continue
        ts = d.get('timestamp', '')
        def take(items, where):
            for it in items:
                if not isinstance(it, dict): continue
                if it.get('type') == 'image' and (it.get('source') or {}).get('type') == 'base64':
                    out.append(dict(ts=ts, where=where, mt=it['source'].get('media_type', ''), data=it['source']['data']))
                elif it.get('type') == 'tool_result' and include_tool and isinstance(it.get('content'), list):
                    take(it['content'], 'tool_result')
        m = d.get('message') or {}
        if m.get('role') == 'user' and isinstance(m.get('content'), list): take(m['content'], 'user')
        a = d.get('attachment') or {}
        if a.get('type') == 'queued_command' and isinstance(a.get('prompt'), list): take(a['prompt'], 'user(mid-turn)')
    # 同一張圖可能在紀錄裡出現兩次（排隊＋送達），用內容去重
    seen, uniq = set(), []
    for x in out:
        h = hashlib.sha1(x['data'].encode()).hexdigest()
        if h in seen: continue
        seen.add(h); x['sha1'] = h[:10]; uniq.append(x)
    return uniq


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--jsonl'); ap.add_argument('--list', action='store_true'); ap.add_argument('--last', type=int)
    ap.add_argument('--pick'); ap.add_argument('--out', default='.'); ap.add_argument('--all', action='store_true')
    a = ap.parse_args()
    path = a.jsonl or find_jsonl(); ims = images(path, a.all)
    print(f'對話紀錄：{path}（{len(ims)} 張圖）')
    if a.list or (a.last is None and not a.pick):
        for i, x in enumerate(ims): print(f'  #{i}  {x["ts"]}  {x["where"]}  {x["mt"]}  {len(x["data"]) * 3 // 4 // 1024} KB  sha1 {x["sha1"]}')
        return
    sel = ims[-a.last:] if a.last else [ims[int(k)] for k in a.pick.split(',')]
    os.makedirs(a.out, exist_ok=True)
    for x in sel:
        fn = os.path.join(a.out, f'chat_{x["ts"][:19].replace(":", "").replace("-", "")}_{x["sha1"]}.{EXT.get(x["mt"], "bin")}')
        open(fn, 'wb').write(base64.b64decode(x['data']))
        try:
            from PIL import Image; sz = Image.open(fn).size
        except Exception: sz = '?'
        print(f'  存檔 {fn}  {sz}')


if __name__ == '__main__':
    main()
