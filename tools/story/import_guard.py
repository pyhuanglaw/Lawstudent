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
    return ndl542(aa655(world(alison(s))))


def read_fix_c(s):
    """read_fix 再加 AA_897 第 2 節整句換（canon897()）。只給產生檔裡有那些整句的匯入工具用（import_aa720、import_arc_rot、import_flower_class、import_gift_holiday、
    import_gym_equip、import_place_acc、import_sport_invites、import_study_scenes 開頭 IG.use_canon897()）；覆寫檔（overlay_rows）、回覆池、梯子照 read_fix，不能動稿的字。"""
    return canon897(_read_fix0(s))


_read_fix0 = read_fix


def use_canon897():
    """這支匯入工具讀稿改走 read_fix_c（CANON-NO-ECON-1112 第四批，AA_897 第 2 節）：IG.read_fix 換成 read_fix_c（只在這個行程裡）。"""
    globals()['read_fix'] = read_fix_c


_C897 = None


def canon897(s):
    """CANON-NO-ECON-1112 第四批（AA_897 第 2 節，AA-C 定稿）：產生檔裡舊序章、外校的整句照 tools/story/canon897_fix.json 換（企劃原稿已改成代號，不能重匯新版）。"""
    global _C897
    if not isinstance(s, str):
        return s
    if _C897 is None:
        import json as _json, os as _os
        try:
            with open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'canon897_fix.json'), encoding='utf-8') as f:
                _C897 = _json.load(f).get('pairs', [])
        except (OSError, ValueError):
            _C897 = []
    for a, b in _C897:
        if a in s:
            s = s.replace(a, b)
    return s


_A655 = None
_LAT = _re.compile('[㐀-䶿一-鿿ぁ-ゖァ-ヺ豈-﫿]')   # 中文字、假名（不含「・」「ー」）


def aa655(s):
    """WZ-SHOPS1-1104（AA_655 第 1 節，企劃線 a22e53016）：換成英文店名（2:30 AM、SUNNY SIDE）的字，和中文字之間空一個半形空格（tools/story/aa655_fix.json 的 spaced）；
    照字換的（小路）在 pairs，由 ndl542() 讀。"""
    global _A655
    if not isinstance(s, str):
        return s
    if _A655 is None:
        import json as _json, os as _os
        try:
            with open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'aa655_fix.json'), encoding='utf-8') as f:
                _A655 = _json.load(f).get('spaced', [])
        except (OSError, ValueError):
            _A655 = []
    for a, b in _A655:
        if a not in s:
            continue
        out = []; i = 0
        while True:
            j = s.find(a, i)
            if j < 0:
                out.append(s[i:]); break
            pre = s[j - 1] if j > 0 else ''; nx = s[j + len(a)] if j + len(a) < len(s) else ''
            out.append(s[i:j] + (' ' if pre and b[0].isascii() and _LAT.match(pre) else '') + b + (' ' if nx and b[-1].isascii() and _LAT.match(nx) else ''))
            i = j + len(a)
        s = ''.join(out)
    return s


_NDL = None


def ndl542(s):
    """NOODLE-TEAM-SHRINK-1030（AA_542 企劃線 6b33b4012，使用者 10-30 X144）：舊稿裡的麵店團字句照 tools/story/ndl542_fix.json 換（長的先換）。"""
    global _NDL
    if not isinstance(s, str):
        return s
    if _NDL is None:
        import json as _json, os as _os
        _NDL = []
        for fn in ('ndl542_fix.json', 'nocmp_fix.json', 'd118_fix.json', 'aa595_fix.json', 'aa602_fix.json', 'aa600_fix.json', 'aa612_fix.json', 'aa630_fix.json', 'aa647_fix.json', 'aa655_fix.json', 'aa657_fix.json', 'aa658_fix.json', 'aa663_fix.json', 'aa661_fix.json', 'aa664_fix.json', 'aa665_fix.json', 'aa666_fix.json', 'aa668_fix.json', 'aa670_fix.json', 'aa671_fix.json', 'aa672_fix.json', 'aa673_fix.json', 'aa674_fix.json', 'aa676_fix.json', 'aa677_fix.json', 'aa678_fix.json', 'aa681_fix.json', 'aa682_fix.json', 'aa683_fix.json', 'aa685_fix.json'):   # aa600_fix.json：AA_600 分手後不主動聯絡＋AA_591 整合九件（企劃線 031414cad、43d27cd80）；aa602_fix.json：AA_602 以安動態與零星台詞（企劃線 e648d5b31）；aa595_fix.json：「臺北的家」→「家」（AA_595 第 4 節，使用者 11-02 選「回家」）；nocmp_fix.json：NO-COMPARE-1030（D116 不跟別人比，AA_546）同一個做法；d118_fix.json：D118 沒有期中考（AA_578 b13db535f）
            try:
                with open(_os.path.join(_os.path.dirname(_os.path.abspath(__file__)), fn), encoding='utf-8') as f:
                    _NDL += _json.load(f)['pairs']
            except (OSError, ValueError, KeyError):
                pass
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
    ('他換了一首都帝大的。', '他換了一台大的。'),   # 2026-11-11 子晴 D10 堤防 remember（date_system/lines/D10.json@02078efc0）：「一台／大的」＝一台比較大的空拍機，不是校名——工具誤判，照稿原字
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


def unq(t):
    """有名字說的台詞拿掉外面整句的一對「」（AA-B 2026-11-08 00:21／01:09，TEXT-QUOTE-UNIFY-1108）：對話框已經寫了是誰說的，不再加「」。
    「A」「B」這種好幾段的、沒有整句包起來的、旁白（…）不動；稿上照舊有「」，匯入工具寫進遊戲檔的時候才拿掉（tools/invite/build_replies.py、
    tools/story/import_place_acc.py、import_sport_invites.py；遊戲裡同一把尺：src/invites3d.js 的 S.unq）"""
    if not isinstance(t, str) or len(t) < 2 or t[0] != '「' or t[-1] != '」':
        return t
    d = 0
    for i, c in enumerate(t):
        if c == '「':
            d += 1
        elif c == '」':
            d -= 1
            if d == 0 and i != len(t) - 1:
                return t
    return t[1:-1] if d == 0 else t


if __name__ == '__main__':   # 測試讀稿用（tests/alison.js）：python3 tools/story/import_guard.py read_fix < 稿 > 換好的稿
    import sys as _sys
    if _sys.argv[1:] == ['read_fix']:
        _sys.stdout.write(read_fix(_sys.stdin.read()))
    elif _sys.argv[1:] == ['world']:
        _sys.stdout.write(world(_sys.stdin.read()))
    else:
        _sys.exit('用法：import_guard.py read_fix|world < 檔')
