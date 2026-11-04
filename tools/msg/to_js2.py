#!/usr/bin/env python3
"""把 tools/msg/build_msg2.py 產生的 msg2_pool.json 轉成 src/data/msg2_pool.js（一則一行，方便看 diff）。
用法：python3 -I tools/msg/build_msg2.py && python3 tools/msg/to_js2.py   （MSG_POOL_OUT 改輸出資料夾，預設 tools/msg/out）"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.environ.get('MSG_POOL_OUT') or os.path.join(HERE, 'out'), 'msg2_pool.json')
DST = os.path.join(os.environ.get('MSG_JS_OUT') or os.path.join(HERE, '..', '..', 'src', 'data'), 'msg2_pool.js')   # MSG2-GEN-DRIFT-1104：MSG_JS_OUT＝寫到別的資料夾（測試比對重產結果用）
d = json.load(open(SRC, encoding='utf-8'))
# MSG2-GEN-DRIFT-1104：句子（msgs、ask 的 q／opts 的 t、r）照讀稿換字表換（import_guard.read_fix：AA_612 麵店→燒臘店、AA_630／AA_627 語彤新背景…，和其他匯入工具讀稿一樣）；src、cellText、added、copiedFrom 這些對稿用的欄位照原文（tests/msg_chat_unit.js H 項比對原稿）。原本沒換，重產會把 8 行退回舊句
import sys as _s0; _s0.path.insert(0, os.path.join(HERE, '..', 'story')); import import_guard as _G
for _p in d['people'].values():
    for _e in _p['replies']:
        _sub = {k: _e[k] for k in ('msgs', 'ask') if k in _e}
        if _sub: _e.update(json.loads(_G.read_fix(json.dumps(_sub, ensure_ascii=False))))
src = d['source']
L = ['/* 玩家主動傳訊息的第二批話題（MSG-2：謝謝、生日快樂、還好嗎、新年快樂）回覆池：AA 六位＝AA_202 第 7 節，BB 九位＝AA_257（AA 定稿）＋BB_178 第 10 節的條件（企劃線 ' + '、'.join(k + '@' + v for k, v in src.items()) + '）。',
     '   產生器 tools/msg/build_msg2.py → tools/msg/to_js2.py（每一句照抄原文；tests/msg_chat_unit.js 第 H 項逐字比對 git 上的原文）。不要手改句子。',
     '   people[id]：birthday（MM-DD）、conds（thanks／ok：什麼事以後能傳，key＋原文；bday：分年份的列；closed：不開的時候）、replies（topic thanks／bday／ok／newyear、cond、tier、msgs、tags、ask）。程式的判斷在 src/msg3d.js。 */',
     "'use strict';", 'const MSG2_POOL={',
     ' "source":' + json.dumps(src, ensure_ascii=False) + ',', ' "topics":' + json.dumps(d['topics'], ensure_ascii=False) + ',', ' "people":{']
ppl = list(d['people'].items())
for i, (pid, p) in enumerate(ppl):
    head = {k: v for k, v in p.items() if k != 'replies'}
    L.append('  ' + json.dumps(pid) + ':Object.assign(' + json.dumps(head, ensure_ascii=False) + ',{"replies":[')
    R = p['replies']
    for j, e in enumerate(R):
        L.append('   ' + json.dumps(e, ensure_ascii=False) + (',' if j < len(R) - 1 else ''))
    L.append('  ]})' + (',' if i < len(ppl) - 1 else ''))
L += [' }', '};']
open(DST, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('wrote', os.path.normpath(DST), sum(len(p['replies']) for _, p in ppl), 'replies')
# AA_630／AA_627 表 B（語彤台詞改寫，YT-REWRITE-1103）：寫完再照白名單上的逐句表換一次（整句相同才換；tools/story/aa630.py）
import sys as _sys, os as _os
_R0 = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))); _sys.path.insert(0, _os.path.join(_R0, 'tools', 'story'))
import aa630 as _aa630, import_guard as _ig
_t0 = open(DST, encoding='utf-8').read(); _t1 = _aa630.patch_text(_aa630.load(_R0, _ig.load(_R0), _ig), 'src/data/msg2_pool.js', _t0)   # 改寫到 DST（MSG_JS_OUT 也一樣）；表對的是遊戲檔名
if _t1 != _t0: open(DST, 'w', encoding='utf-8').write(_t1)
