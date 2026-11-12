#!/usr/bin/env python3
"""把 tools/msg/build_pool.py 產生的 msg_pool.json 轉成 src/data/msg_pool.js（一則一行，方便看 diff）。
用法：python3 -I tools/msg/build_pool.py && python3 tools/msg/to_js.py   （MSG_POOL_OUT 改輸出資料夾，預設 tools/msg/out）"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(os.environ.get('MSG_POOL_OUT') or os.path.join(HERE, 'out'), 'msg_pool.json')
DST = os.path.join(os.environ.get('MSG_JS_OUT') or os.path.join(HERE, '..', '..', 'src', 'data'), 'msg_pool.js')   # MSG2-GEN-DRIFT-1104：MSG_JS_OUT＝寫到別的資料夾（測試比對重產結果用）
d = json.load(open(SRC, encoding='utf-8'))
# MSG2-GEN-DRIFT-1104：句子（msgs、ask）和 rules 的說明文字照讀稿換字表換（import_guard.read_fix：AA_612 麵店→燒臘店、AA_630／AA_627、AA_661…，和其他匯入工具讀稿一樣）；src 這些對稿用的欄位照原文（tests/msg_chat_unit.js F 項比對原稿）。原本沒換，重產會把 4 行退回舊句
import sys as _s0; _s0.path.insert(0, os.path.join(HERE, '..', 'story')); import import_guard as _G
for _p in d['people'].values():
    if isinstance(_p.get('rules'), dict): _p['rules'] = json.loads(_G.read_fix(json.dumps(_p['rules'], ensure_ascii=False)))
    for _e in _p['replies']:
        _sub = {k: _e[k] for k in ('msgs', 'ask') if k in _e}
        if _sub: _e.update(json.loads(_G.read_fix(json.dumps(_sub, ensure_ascii=False))))
# 2026-11-11（X327 沛珊重寫）：AA_755_peishan_feed_misc.json 的 other（msg_pool.js 三則）逐則 old→new 疊在 classmate_peishan 的 msgs 上（tools/story/ps755.py；白名單沒有那份稿＝不換）。
# src（對稿用的來源欄）照舊寫 BB_178；換過的那幾則多一格 ps755＝新稿的來源（tests/msg_chat_unit.js F 項：這幾則改比新稿）
import ps755 as _ps755
_R755 = os.path.normpath(os.path.join(HERE, '..', '..'))
_d755 = _ps755.load(_R755)
if _d755:
    _new755 = [new for at, old, new in _ps755.rows(_d755, 'msg_pool.js')]
    _n755 = _ps755.apply({'classmate_peishan': d['people']['classmate_peishan']}, 'msg_pool.js', _R755)
    for _e in d['people']['classmate_peishan']['replies']:
        if _e.get('msgs') in _new755: _e['ps755'] = _ps755.tag(_R755)
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
# AA_630／AA_627 表 B（語彤台詞改寫，YT-REWRITE-1103）：寫完再照白名單上的逐句表換一次（整句相同才換；tools/story/aa630.py）
import sys as _sys, os as _os
_R0 = _os.path.dirname(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__)))); _sys.path.insert(0, _os.path.join(_R0, 'tools', 'story'))
import aa630 as _aa630, import_guard as _ig, canon898 as _c898   # canon898：CANON-NO-ECON-1112 第四批 AA_898（「傳」換「發」的那幾句）
_t0 = open(DST, encoding='utf-8').read(); _t1 = _c898.patch_text('src/data/msg_pool.js', _aa630.patch_text(_aa630.load(_R0, _ig.load(_R0), _ig), 'src/data/msg_pool.js', _t0))   # 改寫到 DST（MSG_JS_OUT 也一樣）；表對的是遊戲檔名
if _t1 != _t0: open(DST, 'w', encoding='utf-8').write(_t1)
# 2026-11-11（X324 D 區）：覆蓋層（白名單 overlay:true 的稿裡 file 是 msg_pool 的列：AA_785…；tools/msg/msg_overlay.py）——最後一步（AA_630、PS755／PS763 以後），只換 at 那一格；換過的那一則多一格 ov
_sys.path.insert(0, HERE); import msg_overlay as _MOV; _MOV.apply_file(DST, 'msg_pool', _R0)
