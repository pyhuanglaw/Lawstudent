#!/usr/bin/env python3
"""簡單的 JS 斷詞：註解、字串、模板字串（含 ${} 巢狀）、正規表示式。回傳 (kind, start, end, line)。
kind: 'comment' | 'str' | 'tpl' (模板字串的文字段) | 'regex' | 'code'"""
import re

_REGEX_PREV_KW = {'return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'instanceof', 'yield', 'await'}


def tokens(src):
    n = len(src)
    out = []
    i = 0
    line = 1
    stack = []          # 模板字串巢狀：每一層記 ${ 裡的大括號深度
    last_sig = ''       # 上一個有意義的字元或詞（判斷 / 是除號還是正規表示式）
    code_start = 0

    def flush(j):
        nonlocal code_start
        if j > code_start:
            out.append(('code', code_start, j, src.count('\n', 0, code_start) + 1))
        code_start = j

    def tpl_body(i):
        """從模板字串的文字段開始（i 在 ` 或 } 後面），讀到 ` 或 ${；回傳 (end, kind) kind='end'|'expr'"""
        j = i
        while j < n:
            c = src[j]
            if c == '\\':
                j += 2; continue
            if c == '`':
                return j, 'end'
            if c == '$' and j + 1 < n and src[j + 1] == '{':
                return j, 'expr'
            j += 1
        return n, 'end'

    while i < n:
        c = src[i]
        if c in ' \t\r\n':
            i += 1; continue
        if src.startswith('//', i):
            flush(i)
            j = src.find('\n', i); j = n if j < 0 else j
            out.append(('comment', i, j, 0)); i = j; code_start = j; continue
        if src.startswith('/*', i):
            flush(i)
            j = src.find('*/', i + 2); j = n if j < 0 else j + 2
            out.append(('comment', i, j, 0)); i = j; code_start = j; continue
        if c in '\'"':
            flush(i)
            j = i + 1
            while j < n and src[j] != c:
                if src[j] == '\\': j += 2; continue
                if src[j] == '\n': break
                j += 1
            out.append(('str', i + 1, j, 0)); i = j + 1; code_start = i; last_sig = 'str'; continue
        if c == '`':
            flush(i)
            j, k = tpl_body(i + 1)
            out.append(('tpl', i + 1, j, 0))
            if k == 'end':
                i = j + 1; code_start = i; last_sig = 'str'; continue
            stack.append(0); i = j + 2; code_start = i; last_sig = '{'; continue
        if c == '}' and stack:
            if stack[-1] == 0:
                flush(i)
                stack.pop()
                j, k = tpl_body(i + 1)
                out.append(('tpl', i + 1, j, 0))
                if k == 'end':
                    i = j + 1; code_start = i; last_sig = 'str'; continue
                stack.append(0); i = j + 2; code_start = i; last_sig = '{'; continue
            stack[-1] -= 1; i += 1; last_sig = '}'; continue
        if c == '{' and stack:
            stack[-1] += 1; i += 1; last_sig = '{'; continue
        if c == '/':
            # 正規表示式？
            if last_sig == '' or last_sig in _REGEX_PREV_KW or (len(last_sig) == 1 and last_sig in '(,=:[!&|?{};+-*%<>~^'):
                flush(i)
                j = i + 1; cls = False
                while j < n:
                    d = src[j]
                    if d == '\\': j += 2; continue
                    if d == '\n': break
                    if cls:
                        if d == ']': cls = False
                    elif d == '[': cls = True
                    elif d == '/': break
                    j += 1
                j += 1
                while j < n and (src[j].isalnum()): j += 1
                out.append(('regex', i, j, 0)); i = j; code_start = j; last_sig = 'str'; continue
            i += 1; last_sig = '/'; continue
        m = re.compile(r'[A-Za-z_$][\w$]*').match(src, i)
        if m:
            last_sig = m.group(0); i = m.end(); continue
        if c.isdigit():
            m = re.compile(r'[0-9.eExXa-fA-F_]+').match(src, i); i = m.end(); last_sig = '0'; continue
        last_sig = c
        i += 1
    flush(n)
    # 行號
    res = []
    for k, s, e, _ in out:
        res.append((k, s, e))
    return res
