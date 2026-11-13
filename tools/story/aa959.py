#!/usr/bin/env python3
"""AA_959 台詞覆寫表（DLG-FULL-REVIEW-1110：AA_951～957「今天」開頭砍半＋AA_958／960／961「……」開頭減量＋KX-GF-PLACES-1113 一句）。
LAWWW 11-13 21:02 選方案 (a)：**源稿不動，匯入工具在寫檔前最後一步照表換**；沒有匯入工具的手寫檔直接照表換（tools/story/aa959.py --apply-hand）。

表：docs/handoff/AA_959_overlay.json（企劃線 claude/magical-albattani-bk7b4n 的 docs/story_planning/AA_959_今天開頭砍半_覆寫表.json 原樣複製；
    來源 SHA 記在 SRC_SHA）。AA 出新版（例如再併 AA_962）＝把新的 json 蓋過去、改 SRC_SHA、重跑各匯入工具＋--apply-hand，不用改程式。

每一列：files（遊戲檔名，src/data/ 或 src/）、old、new、speaker、doc；prefix:true＝old 只是那句的開頭；all:true＝同檔多處都換。
套用規則（apply(text, 檔名)）：
- old 裡有引號（AA 為了唯一帶了前後程式碼的列）＝照整段字換；
- prefix＝只換「字串開頭」那一處（old 前一個字是引號）；new 結尾的「……」是稿上「（後面照舊）」的記號，不加進去；
- all＝同檔每一處都換，但**程式註解裡的不換**（註解多半是在記舊句的歷史，LAWWW 11-13：保持原樣、只換程式字串）；
- 其他＝只換「整個字串就是 old」的那一處（前後都是同一種引號）——「今天開頭」那句，不碰別的句子中間剛好有的同樣字。
- 同一個檔先換長的 old（「今天我請。上次說好的。」先於「今天我請。」）。
- SKIP 裡的列不換（說話的人和表上的 speaker 對不上，或是幾位女主角共用的句子），原因寫在 SKIP，報給 AA。
- 每一列在它標的檔裡至少要套到一次（或已經是新字）；report() 列出沒套到的。
用法：
  python3 tools/story/aa959.py --apply-hand     手寫檔（HAND）直接照表換
  python3 tools/story/aa959.py --check          每一列：遊戲檔裡還有舊字（該換沒換）／新字找不到 → 結束碼 1
"""
import json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
TABLE = 'docs/handoff/AA_959_overlay.json'
SRC_SHA = '4440ffa368'   # 企劃線 claude/magical-albattani-bk7b4n（AA_961、AA_962 併入，307 列；取代 833e97635d 的 271 列、dc29919cc8 的 286 列）

# 說話的人對不上表上的 speaker（或不是某一個人的句子）：不換，報 AA。鍵＝(檔名, old)。
SKIP = {
    ('msg_replies.js', '今天吃哪一種？'): '以安訊息串的玩家選項（opts.t），是祐廷說的，不是以安',
    ('msg_replies.js', '今天很開心。'): '可昕訊息串的玩家選項（opts.t），是祐廷說的，不是可昕',
    ('free_trips.js', '今天雲比較多，太陽還沒落到海裡就看不到了。'): '自由出行 D14 的旁白，不是以安說的',
    ('free_trips.js', '今天風很大，橋上的燈一直被吹得晃來晃去。'): '自由出行 D14 的旁白，不是以安說的',
    ('free_trips.js', '今天的海，黃色那一半比上次少一點。'): '自由出行 D19 的旁白，不是以安說的',
    ('free_trips.js', '今天放的是一部修復過的老片，有幾段畫面還是有刮痕。廳不大，坐了一半。'): '自由出行 D05 的旁白，不是芷若說的',
    ('invites.js', '今天讀得比我想的多。'): 'INVITE_DATA.libStudy.bye 是每位女主角共用的道別句，不是可昕一個人的',
    ('vac_activities.js', '……我只聽懂 adjourned。'): 'C18 新加坡參訪法院，SY()＝團長姚思穎（npc_siying）說的，不是語彤',
    ('vac_activities.js', '……其實是因為沒人要當。'): 'C18 行前說明，SY()＝團長姚思穎（npc_siying）說的，不是語彤',
}

Q = '\'"'
_rows = None


def rows():
    global _rows
    if _rows is None:
        with open(os.path.join(ROOT, TABLE), encoding='utf8') as f: d = json.load(f)
        _rows = d['rows']
        for i, r in enumerate(_rows): r['_i'] = i
    return _rows


def for_file(fname):
    b = os.path.basename(fname)
    rs = [r for r in rows() if b in r['files'] and (b, r['old']) not in SKIP]
    return sorted(rs, key=lambda r: -len(r['old']))


def _new(r):
    n = r['new']
    if r.get('prefix') and n.endswith('……') and not r['old'].endswith('……'): n = n[:-2]   # 稿上「……（後面照舊）」的記號
    return n


def _spans(text, r):
    o = r['old']
    out = []
    for m in re.finditer(re.escape(o), text):
        a, b = m.start(), m.end()
        if in_comment(text, a): continue
        if any(c in o for c in Q) or r.get('all'): out.append((a, b)); continue
        before = text[a - 1] if a else ''
        after = text[b] if b < len(text) else ''
        if before not in Q: continue
        if r.get('prefix') or after == before: out.append((a, b))
    return out


def in_comment(text, pos):
    """pos 在 /* … */ 或 // 註解裡（粗判：// 前一個字不是 : 才算，避開網址）。"""
    if text.rfind('/*', 0, pos) > text.rfind('*/', 0, pos): return True
    ls = text.rfind('\n', 0, pos) + 1
    line = text[ls:pos]
    return bool(re.search(r'(?<![:\\])//', line)) and not re.search(r'[\'"][^\'"]*//', line)


HITS = {}   # 列號 → 套到幾處（含已經是新字的）


def apply(text, fname, log=None):
    """照表把 fname（遊戲檔名）那幾列換在 text 上，回傳換好的字。"""
    for r in for_file(fname):
        sp = _spans(text, r)
        if not sp:
            if _new(r) in text: HITS[r['_i']] = HITS.get(r['_i'], 0) + 1   # 已經是新字（重跑）
            continue
        if not r.get('all') and len(sp) > 1:
            sys.exit(f'AA_959 第 {r["_i"]} 列：{os.path.basename(fname)} 裡「{r["old"]}」有 {len(sp)} 處、表上沒寫 all——停下來問 AA')
        n = _new(r)
        for a, b in reversed(sp): text = text[:a] + n + text[b:]
        HITS[r['_i']] = HITS.get(r['_i'], 0) + len(sp)
        if log is not None: log.append((r['_i'], os.path.basename(fname), len(sp)))
    return text


def map_str(s, fname):
    """一句字串（不含引號）照表換完是什麼（不記 HITS）：給「覆蓋層的 new 後來又被 AA_959 換掉」的核對用。"""
    t = "'" + s + "'"
    for r in for_file(fname):
        sp = _spans(t, r)
        for a, b in reversed(sp): t = t[:a] + _new(r) + t[b:]
    return t[1:-1]


def layer(text, fname):
    """給匯入工具用：寫檔前最後一步呼叫。照表換，並核對只標這個檔的列都套到了（套不到＝源稿或前面幾層改過了，停下來問 AA）。"""
    b = os.path.basename(fname)
    before = dict(HITS)
    text = apply(text, b)
    miss = [r for r in for_file(b) if r['files'] == [b] and HITS.get(r['_i'], 0) == before.get(r['_i'], 0)]
    if miss:
        sys.exit(f'AA_959（{TABLE}@{SRC_SHA}）：{b} 有 {len(miss)} 列對不到（舊字、新字都不在）：\n' + '\n'.join(f'第 {r["_i"]} 列「{r["old"]}」' for r in miss[:20]))
    return text


def missing(fnames):
    """fnames 這幾個檔負責的列裡，沒套到的（SKIP 不算）。"""
    bs = {os.path.basename(f) for f in fnames}
    out = []
    for r in rows():
        own = [f for f in r['files'] if f in bs]
        if not own or all((f, r['old']) in SKIP for f in own): continue
        if not HITS.get(r['_i']): out.append(r)
    return out


def source_tag():
    return f'＋AA_959@{SRC_SHA}'


# 沒有匯入工具（或匯入工具早就不再整檔重產）的手寫檔：直接照表換
HAND = ['events.js', 'r2y3a_events.js', 'r2y3b_events.js', 'r2y4a_events.js', 'r2y4b_events.js', 'group_events.js',
        'termend_opts.js', 'termend_lines.js', 'vac_activities.js', 'invites.js', 'multirel_lines.js', 'movie_plots.js',
        'heroine_arcs.js', 'free_trips.js']


def gpath(f):
    for p in ('src/data/' + f, 'src/' + f):
        if os.path.exists(os.path.join(ROOT, p)): return os.path.join(ROOT, p)
    return None


def check():
    bad = []
    for r in rows():
        for f in r['files']:
            if (f, r['old']) in SKIP: continue
            p = gpath(f)
            t = open(p, encoding='utf8').read() if p else ''
            if _spans(t, r): bad.append(f'第 {r["_i"]} 列 {f}：還有舊字「{r["old"]}」')
        own = [f for f in r['files'] if (f, r['old']) not in SKIP]
        if own and not any(_new(r) in open(gpath(f), encoding='utf8').read() for f in own if gpath(f)):
            bad.append(f'第 {r["_i"]} 列 {own}：找不到新字「{_new(r)}」')
    return bad


if __name__ == '__main__':
    if '--apply-hand' in sys.argv:
        files = [a for a in sys.argv[sys.argv.index('--apply-hand') + 1:] if not a.startswith('--')] or HAND
        for f in files:
            p = gpath(f); t = open(p, encoding='utf8').read(); log = []
            t2 = apply(t, f, log)
            if t2 != t:
                with open(p, 'w', encoding='utf8') as fo: fo.write(t2)
            print(f, '套了', sum(n for _, _, n in log), '處')
        miss = missing(files)
        if miss: sys.exit('沒套到：\n' + '\n'.join(f'第 {r["_i"]} 列 {r["files"]}「{r["old"]}」' for r in miss))
    if '--check' in sys.argv:
        b = check()
        print('\n'.join(b) or 'AA_959 全部套好（SKIP %d 列）' % len(SKIP))
        sys.exit(1 if b else 0)
