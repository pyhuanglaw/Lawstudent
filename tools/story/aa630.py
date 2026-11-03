#!/usr/bin/env python3
"""AA_630 語彤台詞改寫（企劃線 bb4401fd3，AA 定稿 D109；使用者 11-03 重定語彤背景：富二代、秀琴姨、只在一盞茶屋認識）——816 列逐句表。
這支是共用的讀表與套用工具；台詞一字不改，只照表上的「原句 → 改成」換。
- 白名單（docs/handoff/story_import_allow.json）上的 AA_630 版本才讀（import_guard.allowed）。
- 位置寫 `docs/…/x.json:JSON 路徑` 的（閒聊階梯 ladder_aa*.json、約會 date_system/lines/Dxx.json）：匯入工具讀完源稿以後呼叫 apply_json()，
  照路徑把那個值換掉——值等於「原句」才換；已經是「改成」＝源稿自己改好了，跳過；兩個都不是＝停下來（企劃改過了，要重看）。
  「（刪整個 linesIf）」「（刪整個 extraIf）」＝那一層的 linesIf／extraIf 整個拿掉；「（刪）」＝那個值拿掉（已經跟著上一層拿掉的跳過）。
  備註「補 location ["wz_teahouse"]」＝那一則招呼加 location；層的備註寫「要 YT_FAMILY_HEARD／YT_PARENTS_KNOW」＝那一層的 if 加這個旗標（AA_630 第 8 節第 9 點、第 10 節第 9 點同意）。
  JOB_TEA（祐廷在一盞茶屋打工）、TEA_SHIFTS（和她一起上過的班數）是 AA 的暫名，src/ytjob3d.js 照打工系統（JOBS.at(G,'tea')）記成同名旗標。
- 位置寫 `docs/…/x.md:行` 或 `…/x.py:行` 的：遊戲裡是匯入工具產生的檔（date_lines.js、solo_before.js、eat_lines.js、invite_replies.js、msg2_pool.js），
  那支匯入工具寫檔以前呼叫 patch_text()，整句相同才換（引號裡的字）。只在企劃舊稿、遊戲裡沒有的（AA_136／139／141／142／150 的摘要、AA_127 4-2／5-x 舊稿）不做。
- 位置寫 `src/…:行` 的（手寫的遊戲檔）：tools/story/apply_aa630_src.py 一次改好（照原句找，不靠行號）。
用法（給匯入工具）：import aa630; R = aa630.load(ROOT, ALLOW)（白名單沒有 AA_630＝None，什麼都不做）"""
import json, os, re, subprocess, sys

P630 = 'docs/story_planning/AA_630_語彤台詞改寫.md'


def cells(line):
    out, cur, i, s = [], '', 0, line.strip()[1:-1]
    while i < len(s):
        ch = s[i]
        if ch == '\\' and i + 1 < len(s) and s[i + 1] == '|': cur += '|'; i += 2; continue
        if ch == '|': out.append(cur.strip()); cur = ''; i += 1; continue
        cur += ch; i += 1
    out.append(cur.strip()); return out


def parse(md):
    rows = []
    for line in md.split('\n'):
        if not re.match(r'\|\s*([A-Z]-\d{3})', line): continue
        c = cells(line)
        if len(c) < 4: continue
        path, q = c[1].strip('`').split(':', 1)
        rows.append({'no': c[0], 'file': path, 'at': q, 'orig': c[2], 'new': c[3], 'note': c[4] if len(c) > 4 else ''})
    return rows


def load(ROOT, ALLOW, G=None):
    if G is None:
        sys.path.insert(0, os.path.join(ROOT, 'tools', 'story')); import import_guard as G
    A = G.approved_files(ALLOW, P630)
    if not A: return None
    sha = A[P630]
    ok, why = G.allowed(P630, sha, ALLOW)
    if not ok: sys.exit('拒絕匯入：' + why)
    md = G.read_fix(subprocess.check_output(['git', '-C', ROOT, 'show', f'{sha}:{P630}'], text=True))
    return {'sha': sha, 'rows': parse(md), 'md': md}


def _toks(p):
    out = []
    for q, a, b in re.findall(r'\["([^"]+)"\]|\.?([^.\[\]"]+)|\[(\d+)\]', p):
        out.append(q if q else (a if a else int(b)))
    return out


def _get(o, toks):
    for t in toks:
        if isinstance(t, int):
            if not isinstance(o, list) or t >= len(o): return None, False
            o = o[t]
        else:
            if not isinstance(o, dict) or t not in o: return None, False
            o = o[t]
    return o, True


def _same(v, s):
    if isinstance(v, str): return v == s
    return json.dumps(v, ensure_ascii=False, separators=(',', ':')) == s


def _newval(r):
    n = r['new']
    if r['orig'][:1] in '{[' or re.fullmatch(r'-?\d+(\.\d+)?', r['orig'] or 'x'):
        try: return json.loads(n)
        except Exception: pass
    return n


FLAG_NOTE = re.compile(r'要 (YT_FAMILY_HEARD|YT_PARENTS_KNOW)(?!\s*才看得到私訊)')


def apply_json(R, relpath, data, log=None):
    """把 AA_630 位置是 relpath（docs/…/x.json）的列套在 data（那個檔讀出來的 JSON）上。回傳套了幾列。"""
    if not R: return 0
    rows = [r for r in R['rows'] if r['file'] == relpath and not r['at'].isdigit()]   # 「x.json:行號」的＝第 7 節和第 1 節重複的列（備註寫＝L-xxx），不重算
    n = 0; dels = []; cut = set()
    for r in rows:
        toks = _toks(r['at']); new = r['new']
        m = re.match(r'（刪整個 (linesIf|extraIf)）', new)
        if m:
            i = toks.index(m.group(1)); par, ok = _get(data, toks[:i])
            if ok and m.group(1) in par: del par[m.group(1)]
            cut.add(tuple(toks[:i + 1])); n += 1; continue
        if any(tuple(toks[:len(c)]) == c for c in cut): n += 1; continue   # 跟著上一層刪掉了
        par, ok = _get(data, toks[:-1]); key = toks[-1]
        if not ok: sys.exit(f'AA_630 {r["no"]}：{relpath} 找不到 {r["at"]}')
        if new == '（刪）':
            if isinstance(par, dict): par.pop(key, None)
            else: dels.append((par, key))
            n += 1; continue
        cur, has = _get(par, [key])
        nv = _newval(r)
        if has and _same(cur, r['orig']): par[key] = nv
        elif has and (cur == nv): pass
        elif not has and key == 'note': par[key] = nv
        else: sys.exit(f'AA_630 {r["no"]}：{relpath} {r["at"]} 現在是 {cur!r}，不是原句 {r["orig"]!r}（企劃線改過了，要重看）')
        n += 1
        # 備註裡的條件
        note = r['note']
        if 'location ["wz_teahouse"]' in note and isinstance(par, dict) and 'when' in toks:
            if 'location' not in par: par['location'] = ['wz_teahouse']
        mt = re.search(r'這一則加 time (\[[\d.,\s]+\])', note)
        if mt and isinstance(par, dict): par['time'] = json.loads(mt.group(1))
        if key == 'note' and isinstance(nv, str):
            for f in FLAG_NOTE.findall(nv):
                c = par.setdefault('if', {})
                fl = c.setdefault('flags', [])
                if f not in fl: fl.append(f)
    for par, key in sorted(dels, key=lambda x: -x[1]): del par[key]
    if '/ladder/' in relpath and rows:   # 第 1 節開頭：地點 noodle（麵店）一律改 wz_teahouse（location、locTime 的 key）
        def tea(o):
            if isinstance(o, dict):
                if isinstance(o.get('location'), list): o['location'] = ['wz_teahouse' if z == 'noodle' else z for z in o['location']]
                if isinstance(o.get('locTime'), dict) and 'noodle' in o['locTime']: o['locTime']['wz_teahouse'] = o['locTime'].pop('noodle')
                for v in o.values(): tea(v)
            elif isinstance(o, list):
                for v in o: tea(v)
        tea(((data.get('characters') or {}).get('heroine_03')))
    if log is not None: log.append(f'{relpath}：{n} 列')
    return n


# 位置是企劃稿（.md、.py）、遊戲裡是匯入工具產生的檔：哪一份稿 → 哪一個遊戲檔
TEXT_SRC = {
    'AA_127_以安語彤_心願約會與邀約變化.md': ['src/data/date_lines.js'],
    'build_solo_before.py': ['src/data/solo_before.js'],
    'AA_329_吃東西_一起吃_吃過的_店員認得你.md': ['src/data/eat_lines.js'],
    'AA_415_邀約回覆照階段變_七位定稿.md': ['src/data/invite_replies.js'],
    'AA_531_D99美國交換_人在美國還被揪118午餐_在臺灣的伴侶四個月沒聯絡_上課期末.md': ['src/data/msg2_pool.js'],
}


def _pairs(r):
    """表上的原句／改成 → 遊戲裡要換的字（去掉「語彤：」「選項」和外面的引號；一格好幾個「」的逐個對）"""
    o, n = r['orig'], r['new']
    o = re.sub(r'^(選項)', '', o); n = re.sub(r'^(選項)', '', n)
    qo = re.findall(r'「([^「」]*)」', o); qn = re.findall(r'「([^「」]*)」', n)
    if qo and len(qo) == len(qn): return list(zip(qo, qn))
    if qo and len(qn) == 1 and len(qo) == 2: return [(qo[0], qn[0].split('」')[0]), (qo[1], None)]
    n = re.sub(r'^語彤[：:]', '', n)
    return [(o, n)]


def patch_text(R, game_file, text, log=None):
    """匯入工具寫檔以前：把 AA_630 對到這個遊戲檔的列換掉（整句相同才換；已經換好的跳過；都找不到＝停下來）"""
    if not R: return text
    n = 0; miss = []
    for r in R['rows']:
        if game_file not in TEXT_SRC.get(os.path.basename(r['file']), []): continue
        if '＝' in r['note'][:2]: continue
        for o, nw in _pairs(r):
            if nw is None: continue
            if o in text:
                text = text.replace(o, nw); n += 1
            elif nw in text: n += 1
            else: miss.append(r['no'])
    if log is not None: log.append(f'{game_file}：{n} 處' + (f'（遊戲裡沒有、只在企劃稿：{"、".join(miss)}）' if miss else ''))
    return text


D14_END = '天快暗了。……夕陽，我想留到河邊看。'


def d14_before_sunset(R, loc):
    """AA_630 第 10 節第 2 點：她的 D14（漁人碼頭）一律在夕陽以前收尾——收尾第一句換成 D14_END（第一次的收尾換掉第一句，其他幾種加在最前面）；
    夕陽那個互動點「……再五分鐘。天黑就走。」（待到天黑＝看完夕陽）她不說。loc＝DATE_LINES.loc。"""
    if not R: return 0
    if f'「{D14_END}」' not in R['md']: sys.exit('AA_630 第 10 節找不到 D14 收尾那一句')
    y = (((loc.get('D14') or {}).get('lines')) or {}).get('heroine_03')
    if not y: return 0
    for k, v in (y.get('closing') or {}).items():
        for blk in (v if isinstance(v, list) else [v]):
            L = blk.setdefault('lines', [])
            if L and L[0].get('text') == D14_END: continue
            if k == 'first' and L: L[0] = {'who': 'heroine_03', 'text': D14_END}
            else: L.insert(0, {'who': 'heroine_03', 'text': D14_END})
    ss = (y.get('hotspots') or {}).get('D14.sunset') or {}
    if isinstance(ss.get('normal'), list):
        ss['normal'] = [b for b in ss['normal'] if not any(l.get('text') == '……再五分鐘。天黑就走。' for l in b.get('lines') or [])]
    return 1
