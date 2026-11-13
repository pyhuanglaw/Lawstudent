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
# 2026-11-11（X327 沛珊重寫）：AA_763_peishan_misc3.json 的 msg2_pool.js 兩列（生日快樂、新年快樂那兩句）old→new 疊在 classmate_peishan 的 msgs 上（tools/story/ps763.py；白名單沒有那份稿＝不換）。
# src、cellText 這些對稿用的欄位照舊寫 AA_257；換過的那兩則多一格 ps763＝新稿的來源（tests/msg_chat_unit.js H 項：這兩則改比新稿）
import ps763 as _ps763
_R763 = os.path.normpath(os.path.join(HERE, '..', '..'))
if _ps763.load(_R763): _ps763.apply_msgs(d['people']['classmate_peishan'], _R763)
# 2026-11-11（X327 沛珊重寫；AA 回覆 LAWWW 的問題）：沛珊新年快樂（交往中）那一則的回問「今年你想做什麼？」兩個選項的回覆換字（字是 AA 給的，照抄；選項的字、回問那一句不動）。
# 只換這一則的 ask.opts[].r（「好。我記下來了。」在別的檔也有——宿營關主學姊，不是這裡）：選項的字對得到、回覆剛好是舊句才換；已經是新句＝跳過；都不是＝停下來。
# 換過的那一則多一格 aaReply＝來源（tests/msg_chat_unit.js H 項：這兩句不在 AA_257，改比這裡）。AA_763 那一層有套（白名單上有）才跟著套
PS_NEWYEAR_ASK = {'把書念完。': ('好。我記下來了。', '好無聊的答案。我記下來了，年底驗收。'), '還沒想好。': ('那我過幾天再問一次。', '那我過幾天再問一次。你躲不掉。')}
if _ps763.load(_R763):
    _ny = [e for e in d['people']['classmate_peishan']['replies'] if e.get('topic') == 'newyear' and e.get('ask')]
    if len(_ny) != 1 or sorted(o['t'] for o in _ny[0]['ask']['opts']) != sorted(PS_NEWYEAR_ASK):
        raise SystemExit('沛珊新年快樂的回問對不到（要剛好一則、兩個選項「把書念完。」「還沒想好。」）')
    for _o in _ny[0]['ask']['opts']:
        _old, _new = PS_NEWYEAR_ASK[_o['t']]
        if _o.get('r') == [_new]: continue
        if _o.get('r') != [_old]:
            raise SystemExit(f'沛珊新年快樂回問「{_o["t"]}」的回覆現在是 {_o.get("r")}，不是原句「{_old}」')
        _o['r'] = [_new]; _ny[0]['aaReply'] = 'AA 2026-11-11 回覆（回問兩個選項的回覆）'
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
import aa630 as _aa630, import_guard as _ig, canon898 as _c898   # canon898：CANON-NO-ECON-1112 第四批 AA_898（「傳」換「發」的那幾句）
_t0 = open(DST, encoding='utf-8').read(); _t1 = _c898.patch_text('src/data/msg2_pool.js', _aa630.patch_text(_aa630.load(_R0, _ig.load(_R0), _ig), 'src/data/msg2_pool.js', _t0))   # 改寫到 DST（MSG_JS_OUT 也一樣）；表對的是遊戲檔名
if _t1 != _t0: open(DST, 'w', encoding='utf-8').write(_t1)
# 2026-11-11（X324 D 區）：覆蓋層（白名單 overlay:true 的稿裡 file 是 msg2_pool 的列：AA_785…；tools/msg/msg_overlay.py）——最後一步（AA_630、PS755／PS763 以後），只換 at 那一格；換過的那一則多一格 ov
_sys.path.insert(0, HERE); import msg_overlay as _MOV; _MOV.apply_file(DST, 'msg2_pool', _R0)
# AA_959（DLG-FULL-REVIEW-1110，LAWWW 11-13 選 (a)）：「今天」開頭砍半＋「……」開頭減量——覆蓋層之後最後一步照 docs/handoff/AA_959_overlay.json 換（tools/story/aa959.py）
import aa959 as _AA959
_t0 = open(DST, encoding='utf-8').read(); _t1 = _AA959.layer(_t0, 'msg2_pool.js')
if _t1 != _t0: open(DST, 'w', encoding='utf-8').write(_t1)
