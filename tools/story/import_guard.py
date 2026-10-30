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


def read_fix(s):
    """匯入工具讀稿一律走這裡：先 alison()，再照 docs/WORLD_NAMING.md 換名（world()），再照 AA_542 換麵店團的字（ndl542()）。"""
    return ndl542(world(alison(s)))


_NDL = None


def ndl542(s):
    """NOODLE-TEAM-SHRINK-1030（AA_542 企劃線 6b33b4012，使用者 10-30 X144）：舊稿裡的麵店團字句照 tools/story/ndl542_fix.json 換（長的先換）。"""
    global _NDL
    if not isinstance(s, str):
        return s
    if _NDL is None:
        import json as _json, os as _os
        try:
            with open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'ndl542_fix.json'), encoding='utf-8') as f:
                _NDL = _json.load(f)['pairs']
        except (OSError, ValueError, KeyError):
            _NDL = []
    for a, b in _NDL:
        if a in s:
            s = s.replace(a, b)
    return s


# 虛構校名（WORLD-RENAME-1030，D115，使用者 2026-10-30）：讀稿時照 docs/WORLD_NAMING.md 換名，規則和企劃線換稿用的同一支
# tools/rename/world_names.py（JSON：text／lines／reply…＝口語、scene／title／place…＝正式；markdown：台詞口語、旁白字幕正式；查證出處句不換）。
# 企劃線已經換過名的稿再換一次不會變；舊 commit 的稿（白名單上還沒換名的版本）匯進來也是新名字。
# 工具判斷錯、AA 定的更正（AA-B 10-30 07:55，企劃線 21dc4c3dd 稿上已改）：旁白、照片描述、行程地點寫正式名；人物說的、手機訊息用口語。
# 舊 commit 的稿照工具換完以後，這幾句再照 AA 的定稿換（遊戲照定稿的字）。
WORLD_FIX = [
    ('（你下課經過A館一樓，阿哲把卡片塞給你。）', '（你下課經過法律系館A一樓，阿哲把卡片塞給你。）'),   # AA_408:78 旁白
    ('禮拜六畢業典禮 法律系館A門口拍照 家族都來', '禮拜六畢業典禮 A館門口拍照 家族都來'),   # AA_518:196 Kevin 群組訊息
    ('B館的社辦，一排吉他靠在牆上', '法律系館B的社辦，一排吉他靠在牆上'),   # AA_503:287 照片描述
    ('A館前，五個穿學士服的人', '法律系館A前，五個穿學士服的人'),   # AA_504:278 照片描述
    ('A館 201 的最後一排', '法律系館A 201 的最後一排'),   # AA_505:153 照片描述
]


def world(s):
    if not isinstance(s, str):
        return s
    r = _world(s)
    for a, b in WORLD_FIX:   # 兩邊互不包含，換過的不會再被換
        r = r.replace(a, b)
    return r


def _world(s):
    if not isinstance(s, str):
        return s
    import json as _json, os as _os, sys as _sys
    _sys.path.insert(0, _os.path.join(_os.path.dirname(_os.path.dirname(_os.path.abspath(__file__))), 'rename'))
    import world_names as _W
    if not _W.find_old(s):
        return s
    t = s.lstrip()
    if t[:1] in '{[':
        try:   # 縮排照企劃線換稿工具（world_names.py apply）的寫法，換出來的 JSON 和企劃線換過名的檔一樣
            return _json.dumps(_W.json_obj(_json.loads(s)), ensure_ascii=False, indent=1 if '\n "' in s[:200] else None) + ('\n' if s.endswith('\n') else '')
        except ValueError:
            pass
    return _W.md_text(s)


def alison(s):
    if not isinstance(s, str) or '小語' not in s:
        return s
    def rep(m):
        a, b = m.start(), m.end()
        pre = s[a - 1] if a > 0 else ''
        nxt = s[b] if b < len(s) else ''
        return (' ' if pre and _CJK.match(pre) else '') + 'Alison' + (' ' if nxt and _CJK.match(nxt) else '')
    return _re.sub('小語', rep, s)


if __name__ == '__main__':   # 測試讀稿用（tests/alison.js）：python3 tools/story/import_guard.py read_fix < 稿 > 換好的稿
    import sys as _sys
    if _sys.argv[1:] == ['read_fix']:
        _sys.stdout.write(read_fix(_sys.stdin.read()))
    elif _sys.argv[1:] == ['world']:
        _sys.stdout.write(world(_sys.stdin.read()))
    else:
        _sys.exit('用法：import_guard.py read_fix|world < 檔')
