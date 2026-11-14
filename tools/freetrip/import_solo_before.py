"""「你來過一次」（AA_160 4-4、AA_161 第 1 節、AA_271；BB_213）→ src/data/solo_before.js。
自己（自由出行）去過的地方，之後第一次和她約會去那裡：抵達句說完以後，多一句旁白（narr，AA 檔）＋她的一兩句（lines，AA 檔：以安、語彤；BB 檔：芷若、子晴、學姊、沛珊、可昕）。
只匯入 docs/handoff/story_import_allow.json 逐檔列出、status approved 的版本（import_guard）；讀稿走 read_fix（Alison、WORLD_NAMING 換名）。
用法：python3 tools/freetrip/import_solo_before.py"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
sys.path.insert(0, os.path.join(ROOT, 'tools', 'story'))
import import_guard as G
ALLOW = G.load(ROOT)
DST = os.path.join(ROOT, 'src', 'data', 'solo_before.js')
FILES = ['docs/story_planning/free_trip/solo_before_aa_v1.json', 'docs/story_planning/free_trip/solo_before_bb_v1.json']
APPROVED = G.approved_files(ALLOW, 'docs/story_planning/free_trip/')
narr, lines, used, rules = {}, {}, [], None
for p in FILES:
    ok, why = G.allowed(p, APPROVED.get(p, ''), ALLOW)
    if not ok:
        sys.exit('拒絕匯入：' + why)
    d = json.loads(G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{APPROVED[p]}:{p}'], text=True)))
    narr.update(d.get('narr') or {})
    for who, by in d['lines'].items():
        lines.setdefault(who, {}).update(by)
    rules = rules or d.get('rules')
    used.append(f'{os.path.basename(p)}@{APPROVED[p]}')
out = {'source': '白名單 ' + '＋'.join(used), 'rules': rules, 'narr': narr, 'lines': lines}
with open(DST, 'w', encoding='utf8') as fo:
    fo.write('/* 「你來過一次」（AA_160 4-4、AA_271、BB_213）：tools/freetrip/import_solo_before.py 產生，不要手改。src/date3d.js 的 S.soloBefore 讀 */\n'
             "'use strict';\nconst SOLO_BEFORE=" + json.dumps(out, ensure_ascii=False, indent=1) + ';\n')
print('wrote', DST, len(narr), 'narr', {k: len(v) for k, v in lines.items()}, out['source'])
# AA_630／AA_627 表 B（語彤台詞改寫，YT-REWRITE-1103）：寫完再照白名單上的逐句表換一次（整句相同才換；tools/story/aa630.py）
import sys as _sys, os as _os
_R0 = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))); _sys.path.insert(0, _os.path.join(_R0, 'tools', 'story'))
import aa630 as _aa630, import_guard as _ig
_aa630.patch_file(_aa630.load(_R0, _ig.load(_R0), _ig), 'src/data/solo_before.js', _R0)
# CANON-NO-ECON-1112 收尾（AA_932 §2，企劃線 e622a59148；BB_455 照用）：可昕 D08／D09／D18／D20 的外校前提句，源稿沒改——寫完照 tools/story/canon_b5_rows.py 整句換
import aa959 as _AA959; _AA959.layer_file('src/data/solo_before.js', strict=False)   # AA_959（RC2-PORT-DEV-1114）：先不擋地換一次；B5 之後再換一次（有的列的 old 是 B5 換完的字）
import canon_b5_rows as _B5
_P = _os.path.join(_R0, 'src', 'data', 'solo_before.js')
with open(_P, encoding='utf8') as _f:
    _t = _f.read()
_t2 = _B5.fix('src/data/solo_before.js', _t)
if _t2 != _t:
    with open(_P, 'w', encoding='utf8') as _f:
        _f.write(_t2)
_AA959.layer_file('src/data/solo_before.js')
