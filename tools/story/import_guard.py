#!/usr/bin/env python3
"""劇情匯入白名單（使用者 2026-10-17 P0）：企劃檔要匯進遊戲，一定要在 docs/handoff/story_import_allow.json 逐檔列出
「路徑＋來源 commit＋status: approved＋approvedBy」。不在名單、版本不同、標 WIP／未批准、來源版本不明 → 預設拒絕；不能用萬用字元整批匯入。
（起因：AA 分支的大一下閒聊階梯裡可昕被改了 17 處、AA 還沒逐句審，舊的匯入工具會把分支上所有階梯檔一次匯入。）"""
import json, os

ALLOW = 'docs/handoff/story_import_allow.json'


def load(root):
    return json.load(open(os.path.join(root, ALLOW), encoding='utf-8'))


def allowed(path, sha, allow):
    """(可以匯入?, 原因)。sha 是要讀的來源 commit；名單上的 sha 前綴相同才算同一版本。"""
    if not sha:
        return False, f'{path}：來源版本不明（沒有 commit）'
    hits = [e for e in allow.get('files', []) if e.get('path') == path]
    if not hits:
        return False, f'{path}：不在匯入白名單（{ALLOW}）'
    for e in hits:
        s = str(e.get('sha') or '')
        if not s or not (s.startswith(sha[:len(s)]) or sha.startswith(s)):
            continue
        if e.get('status') != 'approved':
            return False, f'{path}@{s}：白名單狀態是 {e.get("status")}，不是 approved'
        if not e.get('approvedBy'):
            return False, f'{path}@{s}：沒有 approvedBy'
        return True, f'{path}@{s}：approved（{e.get("approvedBy")}）'
    return False, f'{path}@{sha[:8]}：白名單有這個檔，但版本不同（名單：{", ".join(str(e.get("sha")) for e in hits)}）'


def allowed_glob(pattern, allow):
    if any(c in pattern for c in '*?['):
        return False, f'{pattern}：不能用萬用字元整批匯入，要逐檔列在 {ALLOW}'
    return True, ''


def approved_files(allow, prefix=''):
    """名單上所有 approved 的 (path, sha)；同一個檔不能有兩個 approved 版本。"""
    out = {}
    for e in allow.get('files', []):
        if e.get('status') == 'approved' and e.get('path', '').startswith(prefix):
            if e['path'] in out:
                raise SystemExit(f'{e["path"]}：白名單有兩個 approved 版本（{out[e["path"]]}、{e["sha"]}），只能留一個')
            out[e['path']] = e['sha']
    return out

# AA_380（企劃線 eb0ccfec；使用者 2026-10-21 23:2x「改成Alison」）：「小語」改名 Alison。企劃線的舊稿還寫「小語」，
# 匯入工具讀稿的地方一律先換（用舊 commit 重新匯入也不會把「小語」帶回遊戲；「整句相同才換」的疊句兩邊都在 Alison 這一邊比）。
# 寫法：Alison 和中文字（含假名）之間空一個半形空格；挨著標點、行頭行尾、已經有空格的不再空。
import re as _re
_CJK = _re.compile('[\u3400-\u4dbf\u4e00-\u9fff\u3040-\u30ff\uf900-\ufaff]')


def alison(s):
    if not isinstance(s, str) or '小語' not in s:
        return s
    def rep(m):
        a, b = m.start(), m.end()
        pre = s[a - 1] if a > 0 else ''
        nxt = s[b] if b < len(s) else ''
        return (' ' if pre and _CJK.match(pre) else '') + 'Alison' + (' ' if nxt and _CJK.match(nxt) else '')
    return _re.sub('小語', rep, s)
