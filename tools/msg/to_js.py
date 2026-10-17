#!/usr/bin/env python3
"""把 tools/msg/build_pool.py 產生的 msg_pool.json 轉成 src/data/msg_pool.js（一則一行，方便看 diff）。
用法：python3 -I tools/msg/build_pool.py && python3 tools/msg/to_js.py   （MSG_POOL_OUT 改輸出資料夾，預設 tools/msg/out）"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.environ.get('MSG_POOL_OUT') or os.path.join(HERE, 'out'), 'msg_pool.json')
DST = os.path.join(HERE, '..', '..', 'src', 'data', 'msg_pool.js')
d = json.load(open(SRC, encoding='utf-8'))
src = d['source']
L = ['/* 玩家主動傳訊息的回覆池（SYS-PHONE-CHAT／MSG-L1）：AA 六位＝AA_202 第 6 節，BB 九位＝BB_178 第 0～8b 節（企劃線 ' + '、'.join(k + '@' + v for k, v in src.items()) + '）。',
     '   產生器 tools/msg/build_pool.py → tools/msg/to_js.py（每一句照抄原文；tests/msg_chat_unit.js 第 F 項逐字比對 git 上的原文）。不要手改句子：改企劃、改產生器、重跑。',
     '   每一則：topic（chat 在幹嘛／course 問課／share_cat、share_food、share_notes 分享／night 晚安）、tier（A／R／L）、variant（情況版）、msgs（同一次回覆的幾個泡泡）、tags（原文的條件）、ask（回問）。',
     '   rules 是各人的回覆時間、開放條件原文（給程式對照；程式的判斷在 src/msg3d.js）。 */', "'use strict';", 'const MSG_POOL={',
     ' "source":' + json.dumps(src, ensure_ascii=False) + ',', ' "people":{']
ppl = list(d['people'].items())
for i, (pid, p) in enumerate(ppl):
    L.append('  ' + json.dumps(pid) + ':{"name":' + json.dumps(p.get('name'), ensure_ascii=False) + ',"rules":' + json.dumps(p['rules'], ensure_ascii=False) + ',"replies":[')
    R = p['replies']
    for j, e in enumerate(R):
        L.append('   ' + json.dumps(e, ensure_ascii=False) + (',' if j < len(R) - 1 else ''))
    L.append('  ]}' + (',' if i < len(ppl) - 1 else ''))
L += [' }', '};']
open(DST, 'w', encoding='utf-8').write('\n'.join(L) + '\n')
print('wrote', os.path.normpath(DST), sum(len(p['replies']) for _, p in ppl), 'replies')
