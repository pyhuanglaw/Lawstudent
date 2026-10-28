#!/usr/bin/env python3
"""做好但遊戲沒用到的東西（交接規則④，使用者 2026-10-18：「我自己發現你們才會找到啊」）。只讀不寫。

查四件：
1. assets/ 底下的模型、圖（glb、vrm、webp、png、jpg），程式碼裡一次都沒提到檔名的。
2. 白名單（docs/handoff/story_import_allow.json）上 approved 的企劃，任務還沒做完的（看 tasks.json 同一個任務 id 的狀態）。
3. tasks.json 裡「已實作待整合」「暫停」「等待其他AI／素材」的項目：沒寫負責人、沒寫什麼時候恢復（resumeWhen）的，特別標出來。
4. 白名單上 approved、但程式和匯入工具都沒提到檔名或任務 id 的企劃（可能交了沒人接）。

限制：第 1 項只看檔名有沒有出現在程式裡；有登記在 ASSETS 清單、但沒有任何區域真的載入的（例：118 巷的街景），要看第 2 項的看板。

用法：python3 tools/story/check_orphans.py [--out 報告.md]   每次接班、每次發布前跑一次（交接規則④）。"""
import argparse, json, os, re

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
ASSET_EXT = ('.glb', '.vrm', '.webp', '.png', '.jpg', '.jpeg')
CODE_DIRS = ['src', 'tools', 'tests']
CODE_FILES = ['index.html', 'build.py']
STALL = ('已實作待整合', '暫停', '等待其他AI／素材')


def read(p):
    try:
        return open(os.path.join(ROOT, p), encoding='utf-8', errors='ignore').read()
    except OSError:
        return ''


def code_text():
    parts = [read(f) for f in CODE_FILES]
    for d in CODE_DIRS:
        for base, _, files in os.walk(os.path.join(ROOT, d)):
            if '__pycache__' in base or 'dev_scratch' in base:
                continue
            for f in files:
                if f.endswith(('.js', '.py', '.html', '.json')) and not f.startswith('check_orphans'):
                    parts.append(open(os.path.join(base, f), encoding='utf-8', errors='ignore').read())
    return '\n'.join(parts)


def glb_extras_text():
    """GLB 的 JSON 區段裡 extras 底下的字串：室內光照貼圖 extras.lightmap＝{day,night}（zones3d.js roomLightmap 執行時讀），
    檔名只寫在 GLB 裡、程式碼沒有，不算「沒用到」（v9.10.13 發布前 201、202、多功能教室的 5 張被誤報）。只收 extras，不收內嵌貼圖的名字。"""
    out = []

    def walk(o, inx):
        if isinstance(o, dict):
            for k, v in o.items():
                walk(v, inx or k == 'extras')
        elif isinstance(o, list):
            for v in o:
                walk(v, inx)
        elif inx and isinstance(o, str):
            out.append(o)
    for base, _, files in os.walk(os.path.join(ROOT, 'assets')):
        for f in files:
            if not f.lower().endswith('.glb'):
                continue
            try:
                with open(os.path.join(base, f), 'rb') as fh:
                    h = fh.read(20)
                    if len(h) < 20 or h[:4] != b'glTF':
                        continue
                    walk(json.loads(fh.read(int.from_bytes(h[12:16], 'little')).decode('utf-8', 'ignore')), False)
            except (OSError, ValueError):
                continue
    return '\n'.join(out)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default='')
    a = ap.parse_args()
    code = code_text() + '\n' + glb_extras_text()
    L = ['# 做好但遊戲沒用到的東西（check_orphans）', '']

    # 1. 沒被提到的素材
    unused = []
    for base, _, files in os.walk(os.path.join(ROOT, 'assets')):
        for f in files:
            if not f.lower().endswith(ASSET_EXT):
                continue
            stem = os.path.splitext(f)[0]
            short = re.sub(r'_(day|night|dusk)$', '', stem)   # 窗景這類是「名稱＋_day／_night」拼出來的
            if f in code or stem in code or (short != stem and re.search(r"['\"`/]" + re.escape(short) + r"['\"`_]", code)):
                continue
            unused.append(os.path.relpath(os.path.join(base, f), ROOT))
    portraits = [u for u in unused if u.startswith('assets/portraits/')]
    others = [u for u in unused if not u.startswith('assets/portraits/')]
    L += [f'## 1. 程式碼一次都沒提到的素材（{len(others)}；立繪另計 {len(portraits)}，立繪是照資料夾自動找的，只列數量）', '']
    L += [f'- `{u}`' for u in sorted(others)] or ['- （沒有）']
    L.append('')

    # 2、3. 看板
    tasks = []
    try:
        d = json.loads(read('docs/handoff/tasks.json'))
        tasks = d if isinstance(d, list) else d.get('tasks', [])
    except ValueError:
        pass
    stalled = [t for t in tasks if t.get('status') in STALL]
    L += [f'## 2. 看板上停住的項目（{len(stalled)}）', '', '| id | 狀態 | 負責 | 項目 | 什麼時候恢復 |', '|---|---|---|---|---|']
    for t in sorted(stalled, key=lambda t: (t.get('status'), str(t.get('id')))):
        rw = t.get('resumeWhen') or '**沒寫**'
        own = t.get('owner') or '**沒寫**'
        title = str(t.get('title', '')).replace('|', '｜')[:70]
        L.append(f"| {t.get('id')} | {t.get('status')} | {own} | {title} | {str(rw).replace('|', '｜')[:60]} |")
    L.append('')

    # 4. 白名單上核准、但程式和工具都沒提到的企劃
    allow = []
    try:
        allow = json.loads(read('docs/handoff/story_import_allow.json')).get('files', [])
    except ValueError:
        pass
    status_of = {str(t.get('id')): t.get('status') for t in tasks}
    rows = []
    for e in allow:
        if e.get('status') != 'approved':
            continue
        path = e.get('path', '')
        name = os.path.basename(path)
        key = re.match(r'([A-Z]{2}_\d+)', name)
        tids = [x.strip() for x in str(e.get('task', '')).split(',') if x.strip()]
        mentioned = name in code or (key and key.group(1) in code)
        done = [status_of.get(t) for t in tids]
        if not mentioned or any(s in STALL or s == '待開工' for s in done):
            rows.append((path, e.get('sha'), ', '.join(f'{t}={status_of.get(t, "看板沒有")}' for t in tids) or '-', '有' if mentioned else '**沒有**'))
    L += [f'## 3. 白名單核准了，但程式沒提到、或任務還停著（{len(rows)}）', '', '| 企劃 | 版本 | 任務狀態 | 程式有沒有提到 |', '|---|---|---|---|']
    L += [f'| `{p}` | {s} | {t} | {m} |' for p, s, t, m in rows] or ['| （沒有） | | | |']
    L.append('')
    rep = '\n'.join(L) + '\n'
    if a.out:
        open(a.out, 'w', encoding='utf-8').write(rep)
        print(f'寫到 {a.out}：沒用到的素材 {len(others)}、停住的看板項目 {len(stalled)}（沒寫恢復條件 {sum(1 for t in stalled if not t.get("resumeWhen"))}）、白名單待接 {len(rows)}')
    else:
        print(rep)


if __name__ == '__main__':
    main()
