#!/usr/bin/env python3
"""玩家主動傳訊息的回覆池（src/data/msg_pool.js、msg2_pool.js）的覆蓋層（X324 D 區；AA_785…；LAWWW 2026-11-11 定）。
tools/msg/to_js.py、to_js2.py 寫完檔（AA_630 那一層也換完）以後最後一步呼叫：
    import msg_overlay; msg_overlay.apply_file(DST, 'msg_pool', ROOT)      # 或 'msg2_pool'
稿＝白名單上 overlay:true 的稿（tools/story/overlay_rows.py）裡 file 是 msg_pool／msg2_pool 的列：
  at＝people.<id>.replies[i] 底下任何一格（msgs[j]、ask.q、ask.opts[k].r[m]…；i、j 是遊戲現在的順序）；who 要是 <id>；topic、tier 有寫就要和那一則一樣。
  只換 at 那一格（那一格整句等於 old 才換；「嗯。」這種短句整檔很多處，別的格子一個都不動）；對不到就停（不猜）。
  換過的那一則多一格 ov＝稿的來源（[path@sha]；tests/msg_chat_unit.js 的 F、H 項：這幾格改比稿）。
  沛珊那幾則（PS755、PS763 那幾層先換過）照換過以後的字對（稿的 old＝遊戲現在的字）。
檔案格式：一則一行（'   {…}'），人的開頭一行 '  "<id>":{"name"…' 或 '  "<id>":Object.assign(…'；只改有換的那幾行，其他行一字不動。"""
import json, os, re, sys
sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'story'))
import overlay_rows as OV


# 被後來的稿整列拿掉的覆蓋層列（那一則已經不在了，略過、不當成對不到）：
#   CANON-NO-ECON-1112 第四批：AA_881 第 2 節拿掉可昕「走向 C」的生日那一列（AA_785 的「謝謝。……你還記得。」→「謝謝。你還記得。」）
SUPERSEDED = {('kexin', 'people.kexin.replies[3].msgs[0]', '謝謝。……你還記得。')}


def apply_text(text, file, root, log=None):
    R = [x for x in OV.rows(root, file) if (x.get('who'), x.get('at'), x.get('old')) not in SUPERSEDED]
    if not R:
        return text
    L = text.split('\n')
    idx, pid, i = {}, None, 0
    for k, ln in enumerate(L):
        m = re.match(r'^  "(\w+)":(\{"name"|Object\.assign\()', ln)
        if m:
            pid, i = m.group(1), 0
            continue
        m = re.match(r'^   (\{.*\})(,?)$', ln)
        if m and pid:
            idx[(pid, i)] = [k, json.loads(m.group(1)), m.group(2)]
            i += 1
    touched = set()
    for x in R:
        w = f'{x["src"]} {x["who"]} {x["at"]}'
        t = OV.parse(x['at'])
        if len(t) < 5 or t[0] != 'people' or t[2] != 'replies' or not isinstance(t[3], int):
            raise SystemExit(f'{w}：at 要寫 people.<id>.replies[i].…')
        if t[1] != x['who']:
            raise SystemExit(f'{w}：at 的人是 {t[1]}，不是 who {x["who"]}')
        if (t[1], t[3]) not in idx:
            raise SystemExit(f'{w}：{file}.js 的 {t[1]} 沒有第 {t[3]} 則')
        e = idx[(t[1], t[3])][1]
        for k in ('topic', 'tier'):
            if k in x and e.get(k) != x[k]:
                raise SystemExit(f'{w}：那一則的 {k} 是 {e.get(k)!r}，稿寫 {x[k]!r}（i 對錯了？）')
        cur = OV.get(e, t[4:])
        if cur != x['old']:
            raise SystemExit(f'{w}：那一格現在是 {json.dumps(cur, ensure_ascii=False)}，不是稿的 old「{x["old"]}」（對不到，不猜）')
        OV.put(e, t[4:], x['new'])
        if x['src'] not in e.setdefault('ov', []):
            e['ov'].append(x['src'])
        touched.add((t[1], t[3]))
        if log is not None:
            log.append(x)
    for key in touched:
        k, e, comma = idx[key]
        L[k] = '   ' + json.dumps(e, ensure_ascii=False) + comma
    return '\n'.join(L)


def apply_file(path, file, root):
    t0 = open(path, encoding='utf-8').read()
    log = []
    t1 = apply_text(t0, file, root, log)
    if t1 != t0:
        open(path, 'w', encoding='utf-8').write(t1)
    if log:
        print(f'{os.path.basename(path)}：覆蓋層 {len(log)} 格（{"、".join(OV.sources(root, file))}）')
    return len(log)
