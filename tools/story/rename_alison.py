#!/usr/bin/env python3
"""AA_380（企劃線 eb0ccfec）：開發分支一次把「小語」改成 Alison（src、tests、tools；空格規則見 import_guard.alison）。
用法：python3 tools/story/rename_alison.py [--dry]   （改完再跑一次應該是 0 處）
不改：這支和 import_guard.py 本身、tests/alison.js、tests/alison_unit.js（裡面的「小語」是規則和測試用的樣本）。"""
import os, sys, pathlib
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from import_guard import alison
ROOT = pathlib.Path(__file__).resolve().parents[2]
SKIP = {'tools/story/rename_alison.py', 'tools/story/import_guard.py', 'tests/alison.js', 'tests/alison_unit.js'}
dry = '--dry' in sys.argv
files = n = 0
for d in ('src', 'tests', 'tools'):
    for p in sorted((ROOT / d).rglob('*')):
        rel = p.relative_to(ROOT).as_posix()
        if not p.is_file() or p.suffix not in ('.js', '.py', '.json', '.html', '.md') or rel in SKIP or '/__pycache__/' in rel or '/textures/' in rel:
            continue
        try:
            s = p.read_text(encoding='utf-8')
        except Exception:
            continue
        c = s.count('小語')
        if not c:
            continue
        files += 1; n += c
        if not dry:
            p.write_text(alison(s), encoding='utf-8')
print(('（試跑）' if dry else '') + f'{files} 個檔、{n} 處')
