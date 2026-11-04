#!/usr/bin/env python3
# AA 台詞檢查（AA_662 第 6 節）。只讀、不改檔。
# 用法：python3 line_lint.py <檔案或資料夾>...  （讀 .md .json .js；只看「」台詞與（）旁白）
# 被抓到不一定是錯：學姊、可昕直說是個性；AA 判斷。
import os, re, sys
from collections import Counter

RULES = [
    ('4-1 不是X是Y', r'不是[^，。？！「」]{1,14}[，,。…]+(?:而)?是'),
    ('4-1 不是X而是Y', r'不是[^。？！「」]{1,20}而是'),
    ('4-2 單句碎片', r'^(?:[^，。？！]{1,6}。){3,}$'),
    ('4-4 精確數字', r'(?<![第0-9])(?:[1-9][0-9]|[二三四五六七八九]十[一二三四五六七八九])(?:分鐘|秒|次|天|個小時)'),
    ('4-7 假想敵', r'(?:你不要誤會|別誤會|我不是那種|我不是在)'),
    ('4-8 三連', r'很[^，。、]{1,4}、很[^，。、]{1,4}、很[^，。、]{1,4}'),
    ('4-9 破折號', r'——[^——]*——'),
    ('4-10 限定詞堆疊', r'(?:應該|可能|大概|或許|也許)[^。]{0,8}(?:應該|可能|大概|或許|也許)'),
    ('4-11 意義拔高', r'(?:意義很大|很有意義|轉捩點|改變了我|我的人生|最重要的人)'),
    ('4-13 客服腔', r'(?:好問題|希望(?:這|這樣)?對你有幫助|你真的很棒|辛苦你了，)'),
    ('4-14 套話收尾', r'(?:總之|總而言之|讓我們|一起加油吧|隨著[^，。]{1,10}，)'),
    ('0-3 模板句', r'(?:你是第一個|我記住了|騙你的|我是說|開玩笑的|這是我的規則|不要跟別人(?:講|說)|你不要講出去|你先不要跟別人說|謝謝你沒有|大家都只問|這是我第一次|我第一次覺得|後來才發現|我原本以為|因為你，我開始|也是一種回答|你不用那個表情)'),
]
NOD = re.compile(r'(?:點了點頭|點了一下頭|笑了一下|笑了笑)')

def lines_of(text):
    for m in re.finditer(r'「([^「」]{2,200})」', text):
        yield 'line', m.group(1), m.start()
    for m in re.finditer(r'（([^（）「」]{6,200})）', text):
        yield 'narr', m.group(1), m.start()

def scan(path):
    try:
        text = open(path, encoding='utf-8', errors='ignore').read()
    except Exception:
        return [], 0, 0
    hits, n, nod = [], 0, 0
    for kind, s, pos in lines_of(text):
        n += 1
        if NOD.search(s):
            nod += 1
        for name, pat in RULES:
            if re.search(pat, s):
                ln = text.count('\n', 0, pos) + 1
                hits.append((name, ln, s[:60]))
    return hits, n, nod

def main(args):
    files = []
    for a in args or ['.']:
        if os.path.isdir(a):
            for r, _, fs in os.walk(a):
                if '/.git' in r:
                    continue
                files += [os.path.join(r, f) for f in fs if f.endswith(('.md', '.json', '.js'))]
        else:
            files.append(a)
    tot = Counter(); allN = allNod = 0
    for f in sorted(files):
        hits, n, nod = scan(f)
        allN += n; allNod += nod
        for name, ln, s in hits:
            tot[name] += 1
            print(f'{f}:{ln}｜{name}｜{s}')
    print('---')
    print(f'句子 {allN}；「點頭／笑了一下」{allNod} 句（{(allNod / allN * 100 if allN else 0):.1f}%）')
    for k, v in tot.most_common():
        print(f'{k}：{v}')

if __name__ == '__main__':
    main(sys.argv[1:])
