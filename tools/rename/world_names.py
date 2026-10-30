#!/usr/bin/env python3
"""虛構大學更名工具（RENAME-1030；規則照 docs/WORLD_NAMING.md，AA-B 2026-10-30）

用途：
  1. 文件換名：python3 tools/rename/world_names.py apply <檔或資料夾>...   （就地改寫 .md／.json／.txt；印每個檔改了幾處）
  2. 只查不改：python3 tools/rename/world_names.py check <檔或資料夾>...  （列出還剩下的舊名：檔:行:詞）
  3. 給程式用：from world_names import spoken, written, find_old
     - spoken(s)：人物台詞、手機訊息、玩家選項用（霖澤館→A館）
     - written(s)：旁白、字幕、地圖、標題、招牌、系統字用（霖澤館→法律系館A）
     - find_old(s)：回傳 s 裡還剩下的舊名（已經排除「舞台大」「生活大」這類誤判）

文件換名的判斷（markdown）：
  - 跳過：``` 程式區塊、`反引號` 裡的字（id、檔名、程式）、網址、使用者原話（同一行有「使用者」的「」引號內）。
  - 人物說的話：「> 某某：……」那一行、表格或內文裡「某某：……」到下一個「／」「|」為止、「」引號內像句子的（有。？！……，）＝ spoken。
  - 括號旁白「（……）」、其他說明文字、短的「」名稱引用＝ written。
JSON：鍵是 text／line／lines／t／reply／say／msgs／yes／no／later 一類＝spoken；scene／place／title／label／loc／name／caption 一類＝written；其他照 written。
"""
import re, sys, os, json

# ---------- 規則（docs/WORLD_NAMING.md 第 2、3、5 節）----------
# 順序重要：長的、複合的先換
_COMMON = [
    (r'政大自強十舍', '木柵大學翠嶺十舍'),
    (r'自強十舍', '翠嶺十舍'),
    (r'國立臺灣大學|國立台灣大學|[臺台]灣大學(?!生)', '首都帝國大學'),   # 「臺灣大學生」＝臺灣的大學生，不換
    (r'National Taiwan University', 'Capital Imperial University'),
    (r'\bNTU\b', 'CIU'),
    (r'國立政治大學|政治大學', '木柵大學'),
    (r'\bNCCU\b', 'MZU'),
    (r'(?<![財行郵執])政大', '木柵大學'),
    (r'(?<![舞平講櫃陽月擂吧檯戲])[臺台]大', '首都帝大'),   # 「臺大學生」也換（10-30 補）
    (r'博雅教學館', '博思教學館'),
    (r'博雅館', '博思教學館'),
    (r'博雅(?!教育|書院|學程|精神|課程)', '博思'),   # 單獨的「博雅」在本作都是那棟教學館（10-30 補：「博雅 102」「在博雅吵了一小時」）；「博雅教育」這類一般用法不換
    (r'小椰林道', '椰影小徑'),
    (r'椰林大道', '椰影大道'),
    (r'(?<!小)椰林(?=那邊|那條|上|旁邊|走|騎|的路)', '椰影大道'),
    (r'傅鐘', '晨思鐘'),
    (r'醉月湖', '映月湖'),
    (r'洞洞館', '圓窗館'),
    (r'小小福', '小小松'),
    (r'小福(?!利)', '小松'),
    (r'(?<![生復靈])活大', '學活'),
    (r'國青中心', '國際學苑'),
    (r'辜振甫先生紀念圖書館|辜振甫紀念圖書館|辜振甫圖書館', '社科院圖書館'),
]
# 兩棟法律系館
_SPOKEN_LAW = [
    (r'霖澤館?(、|和|與|跟)萬才館?', r'A館\1B館'),
    (r'萬才館?(、|和|與|跟)霖澤館?', r'B館\1A館'),
    (r'霖澤館館', 'A館'), (r'萬才館館', 'B館'),
    (r'霖澤館?', 'A館'), (r'萬才館?', 'B館'),
]
_WRITTEN_LAW = [
    (r'霖澤館?(、|和|與|跟)萬才館?', r'法律系館A\1B'),
    (r'萬才館?(、|和|與|跟)霖澤館?', r'法律系館B\1A'),
    (r'霖澤館館(內|裡)', r'法律系館A裡面'), (r'萬才館館(內|裡)', r'法律系館B裡面'),
    (r'霖澤館館', '法律系館A'), (r'萬才館館', '法律系館B'),
    (r'霖澤館?', '法律系館A'), (r'萬才館?', '法律系館B'),
]
_C = [(re.compile(a), b) for a, b in _COMMON]
_SL = [(re.compile(a), b) for a, b in _SPOKEN_LAW]
_WL = [(re.compile(a), b) for a, b in _WRITTEN_LAW]

def _apply(s, law):
    for rx, rep in law: s = rx.sub(rep, s)
    for rx, rep in _C: s = rx.sub(rep, s)
    return s

def spoken(s): return _apply(s, _SL)
_SP=re.compile(r'(法律系館[AB])(?=[0-9０-９]|研討室|教室)')
def written(s): return _SP.sub(r'\1 ', _apply(s, _WL))

OLD = [
    ('臺灣大學', r'[臺台]灣大學(?!生)'), ('臺大／台大', r'(?<![舞平講櫃陽月擂吧檯戲])[臺台]大'),
    ('NTU', r'\bNTU\b'), ('National Taiwan University', r'National Taiwan University'),
    ('政大／政治大學', r'政治大學|(?<![財行郵執])政大'), ('NCCU', r'\bNCCU\b'),
    ('霖澤館', r'霖澤'), ('萬才館', r'萬才館?'), ('博雅', r'博雅(?!教育|書院|學程|精神|課程)'),
    ('傅鐘', r'傅鐘'), ('椰林大道', r'椰林大道'), ('小椰林道', r'小椰林道'), ('醉月湖', r'醉月湖'),
    ('洞洞館', r'洞洞館'), ('小福', r'小福(?!利)'), ('活大', r'(?<![生復靈])活大'),
    ('自強十舍', r'自強十舍'), ('國青中心', r'國青中心'), ('辜振甫圖書館', r'辜振甫'),
]
_OLD = [(n, re.compile(r)) for n, r in OLD]
def find_old(s):
    return [(n, m.group(0)) for n, rx in _OLD for m in rx.finditer(s)]

# ---------- markdown 判斷 ----------
_SKIP = re.compile(r'`[^`]*`|https?://\S+|\[[^\]]*\]\([^)]*\)')
# 真實世界查證、出處的句子照 C 類留真名（WORLD_NAMING 第 9 節；10-30 補）：整行不換、check 也不列
_C_LINE = re.compile(r'官方|官網|網站|網頁|網路資料|網路搜尋|網路查|簡章|二手資料|WebSearch|沙盒|連不上|打不開|報導|https?://|需查證|查證|沒有查到|查不到|沒查到|還沒查到|沒核到|研究查|課程地圖|只取氛圍|地方參考|參考[臺台]大|真實[臺台]大校曆')
_SPEAKER = r'[一-鿿A-Za-z][一-鿿A-Za-z・ ]{0,7}'
_NOT_SPEAKER = set('期限 開口 收尾 結尾 觸發 頻率 對象 前置 結局 數值 旗標 記號 資料 檔案 出處 驗收 版本 階段 週次 學期 假期 日程 作息 這週 那週 主題 順手的事 稿上 現有 新 舊 補 時段 星期 幾點 地點 場景 字幕 時間 日子 日期 條件 原句 改成 原本 現在 說明 備註 例 例如 稿 遊戲 位置 檔 程式 旁白 標題 背景 停點 註 注意 結論 原因 做法 範圍 來源 狀態 問題 建議 分級 目的 方向 圖 規則 誰 地方 名稱 寫法 正式 口語 英文 改 留 對 錯 換 加 刪 下一步 重點 第一步 理由 依據 底圖 種類 檔名 處理 內容 測試 結果 怎麼 什麼時候 哪裡 出現在哪 字 例句 原話 定案 使用者 AA LAWWW BB 開發組 企劃線 任務 分支 commit 白名單 交付 回覆 回答 先說 一句話'.split())
_WRITTEN_SPK = set('旁白 系統 字卡 告示 公告 招牌 門牌 字幕 地點 標題'.split())
_DIALOG_LINE = re.compile(r'^(\s*(?:[-*]\s*)?>\s*)(' + _SPEAKER + r')：(.*)$')
_INLINE_SPK = re.compile(r'(^|[／|>\s（(「])(' + _SPEAKER + r')：([^／|\n]*)')
_QUOTE = re.compile(r'「([^「」]*)」')
_PAREN = re.compile(r'（[^（）]*）')
_SENT = re.compile(r'[。？！…，?!～]')

def _md_segment(text, user_line):
    """處理一段不在反引號裡的文字：回傳換好的字"""
    # 1) 「」引號：使用者原話不動；像句子的＝spoken；短的名稱引用＝written
    def q(m):
        inner = m.group(1)
        if user_line: return m.group(0)
        if inner.startswith('（'): return '「' + written(inner) + '」'   # 引號裡的括號旁白＝正式（10-30 LAWWW-B 第 1 點）
        msg_style = re.search(r'[\u4e00-\u9fff] [\u4e00-\u9fff]', inner)   # 手機訊息不打標點、用空白斷句（Kevin「禮拜六畢業典禮 A館門口拍照」）＝口語
        return '「' + (spoken(inner) if (_SENT.search(inner) or msg_style) else written(inner)) + '」'
    parts, last = [], 0
    for m in _QUOTE.finditer(text):
        parts.append(('t', text[last:m.start()])); parts.append(('q', m)); last = m.end()
    parts.append(('t', text[last:]))
    out = []
    for kind, v in parts:
        if kind == 'q': out.append(q(v)); continue
        # 2) 內文裡「某某：……」＝spoken 到下一個「／」「|」
        seg, pos, buf = v, 0, []
        for m in _INLINE_SPK.finditer(seg):
            name = m.group(2).strip()
            if name in _NOT_SPEAKER or name in _WRITTEN_SPK or name.endswith('版') or name.endswith('節'): continue
            buf.append(written(seg[pos:m.start(3)]))
            body = m.group(3)
            # 句子裡的括號旁白照 written
            b2, p2, bb = body, 0, []
            for pm in _PAREN.finditer(b2):
                bb.append(spoken(b2[p2:pm.start()])); bb.append(written(pm.group(0))); p2 = pm.end()
            bb.append(spoken(b2[p2:]))
            buf.append(''.join(bb)); pos = m.end(3)
        buf.append(written(seg[pos:]))
        out.append(''.join(buf))
    return ''.join(out)

_BRACE = re.compile(r'\{[^{}]*\}')
_JSSPK = re.compile(r"speaker\s*:\s*(?!null)['\"]?[A-Za-z_]")
def js_line(line):
    """程式風格的台詞（{speaker:'x',text:'…'}）：有人物的那一塊＝spoken，其他（speaker:null、narr、scene、title）＝written"""
    out, last = [], 0
    for m in _BRACE.finditer(line):
        out.append(written(line[last:m.start()]))
        ch = m.group(0)
        out.append(spoken(ch) if _JSSPK.search(ch) else written(ch)); last = m.end()
    out.append(written(line[last:]))
    return ''.join(out)

def _cell(c):
    t = c.strip()
    if not t: return c
    if t.startswith('（') and t.endswith('）'): return written(c)
    if _INLINE_SPK.search(c):
        m = _INLINE_SPK.search(c)
        if m.group(2).strip() not in _NOT_SPEAKER and m.group(2).strip() not in _WRITTEN_SPK: return _md_segment(c, False)
    if _SENT.search(t):
        r, p = [], 0
        for pm in _PAREN.finditer(c):
            r.append(spoken(c[p:pm.start()])); r.append(written(pm.group(0))); p = pm.end()
        r.append(spoken(c[p:])); return ''.join(r)
    return written(c)

def md_line(line):
    if not find_old(line): return line
    if line.lstrip().startswith('#'):
        return _keep_skips(line, written)
    if line.lstrip().startswith('|') and line.count('|') >= 3 and '使用者' not in line:
        return _keep_skips(line, lambda t: '|'.join(_cell(c) for c in t.split('|')))
    if re.search(r'speaker\s*:|\bscene\s*:|\btext\s*:', line) and '{' in line:
        return _keep_skips(line, js_line)
    user_line = '使用者' in line and ('「' in line or '“' in line)
    m = _DIALOG_LINE.match(line)
    if m and m.group(2).strip() not in _NOT_SPEAKER and m.group(2).strip() not in _WRITTEN_SPK:
        head, name, body = m.group(1), m.group(2), m.group(3)
        def conv(t):
            r, p = [], 0
            for pm in _PAREN.finditer(t):
                r.append(spoken(t[p:pm.start()])); r.append(written(pm.group(0))); p = pm.end()
            r.append(spoken(t[p:])); return ''.join(r)
        return head + name + '：' + _keep_skips(body, conv)
    return _keep_skips(line, lambda t: _md_segment(t, user_line))

def _keep_skips(s, fn):
    out, last = [], 0
    for m in _SKIP.finditer(s):
        out.append(fn(s[last:m.start()])); out.append(m.group(0)); last = m.end()
    out.append(fn(s[last:]))
    return ''.join(out)

def md_text(txt):
    out, fence = [], False
    for line in txt.split('\n'):
        if line.lstrip().startswith('```'):
            fence = not fence; out.append(line); continue
        if _C_LINE.search(line): out.append(line); continue   # 查證、出處的句子不換
        out.append(md_line(line))   # 企劃稿的 ``` 區塊多半是台詞稿，照樣換（反引號、id 不動）
    return '\n'.join(out)

# ---------- JSON ----------
_SPOKEN_KEYS = {'text', 'line', 'lines', 't', 'reply', 'say', 'msgs', 'msg', 'yes', 'no', 'later', 'opts', 'choices', 'greet', 'base', 'r', 'ask'}
_WRITTEN_KEYS = {'scene', 'place', 'title', 'label', 'loc', 'location', 'name', 'caption', 'narr', 'n', 'card', 'sub', 'note', 'desc', 'tag'}
def json_obj(o, key=None):
    if isinstance(o, str):
        if _C_LINE.search(o): return o
        if key in _SPOKEN_KEYS: return spoken(o)
        return written(o)
    if isinstance(o, list): return [json_obj(x, key) for x in o]
    if isinstance(o, dict):
        return {k: json_obj(v, k if k in _SPOKEN_KEYS or k in _WRITTEN_KEYS else key) for k, v in o.items()}
    return o


# ---------- Python 資料檔（企劃線的 build_*.py：台詞寫在 dict／list 裡）----------
_PYTOK = re.compile(r"""(['"])(\w+)\1\s*:|(['"])((?:\\.|(?!\3).)*?)\3|(#.*$)""")
def py_line(line):
    if not find_old(line) or _C_LINE.search(line): return line
    out, last, key = [], 0, None
    for m in _PYTOK.finditer(line):
        out.append(line[last:m.start()]); last = m.end()
        if m.group(2):   # 'key':
            key = m.group(2); out.append(m.group(0)); continue
        if m.group(5) is not None:   # 註解
            out.append(spoken(m.group(5))); continue
        q, body = m.group(3), m.group(4)
        mode = written if key in _WRITTEN_KEYS else spoken
        out.append(q + mode(body) + q)
    out.append(line[last:])
    return ''.join(out)
def py_text(txt): return '\n'.join(py_line(l) for l in txt.split('\n'))

# ---------- CLI ----------
def _is_c_file(f):
    # C 類（歷史紀錄、使用者原文、研究紀錄）：資料夾裡有 README_歷史紀錄.md，或檔頭有「歷史紀錄」註
    if os.path.basename(f) == 'README_歷史紀錄.md': return True
    d = os.path.dirname(os.path.abspath(f))
    while d and os.path.basename(d) not in ('docs', ''):   # 往上找到 docs 為止，任何一層有 README_歷史紀錄.md 都算
        if os.path.exists(os.path.join(d, 'README_歷史紀錄.md')): return True
        d = os.path.dirname(d)
    try: head = open(f, encoding='utf-8').read(400)
    except Exception: return False
    return '**歷史紀錄／原文' in head or '**歷史紀錄（2026-10-30 起）**' in head

def files(paths):
    for p in paths:
        if os.path.isdir(p):
            for root, _, fs in os.walk(p):
                for f in sorted(fs):
                    fp = os.path.join(root, f)
                    if f.endswith(('.md', '.json', '.txt', '.py')) and not _is_c_file(fp): yield fp
        elif os.path.isfile(p): yield p

def main():
    if len(sys.argv) < 3 or sys.argv[1] not in ('apply', 'check'):
        print(__doc__); sys.exit(2)
    mode, total, nfiles = sys.argv[1], 0, 0
    for f in files(sys.argv[2:]):
        try: txt = open(f, encoding='utf-8').read()
        except Exception: continue
        if mode == 'check':
            for i, line in enumerate(txt.split('\n'), 1):
                if _C_LINE.search(line): continue
                for n, w in find_old(_SKIP.sub('', line)):
                    print(f'{f}:{i}:{n}:{w}'); total += 1
            continue
        if not find_old(txt): continue
        if f.endswith('.py'):
            new = py_text(txt)
        elif f.endswith('.json'):
            try:
                o = json.loads(txt); new = json.dumps(json_obj(o), ensure_ascii=False, indent=1 if '\n "' in txt[:200] else None)
                if txt.endswith('\n'): new += '\n'
            except Exception:
                new = md_text(txt)
        else:
            new = md_text(txt)
        before, after = len(find_old(_SKIP.sub('', txt))), len(find_old(_SKIP.sub('', new)))
        if new != txt:
            open(f, 'w', encoding='utf-8').write(new); nfiles += 1; total += before - after
            print(f'{f}\t換 {before - after}\t剩 {after}')
    print(('剩下的舊名 ' if mode == 'check' else f'改了 {nfiles} 個檔，') + str(total) + (' 處' if mode == 'check' else ' 處'))

if __name__ == '__main__':
    main()
