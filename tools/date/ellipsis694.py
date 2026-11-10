"""AA_694（DATE-ELLIPSIS-1105，使用者 11-05 選「整批改」）約會台詞拿掉沒必要的「……」——照 AA_694 第 1 節的規則，字一個都不加：
  拿掉：句首的「……」（含旁白括號「（」、引號「「」後面的句首）、句末標點（。！？）後面緊接的「……」、旁白括號「）」後面緊接的「……」；
  留著：詞中間的停頓、句尾的「……」、整句只有「……」的。
企劃線 1b095a239 的 4,478 句源稿改動、AA_694 第 3 節 252 句的表，這支算出來的都一字不差（不一樣＝匯入工具會停下來）。"""
import re

ONLY = re.compile(r'[（「]?(?:……)+[。！？]*[）」]?')


def strip(s):
    if not isinstance(s, str) or '……' not in s or ONLY.fullmatch(s):
        return s
    prev = None
    while prev != s:
        prev = s
        s = re.sub(r'^([（「]?)(?:……)+', r'\1', s)
        s = re.sub(r'([。！？）])(?:……)+', r'\1', s)
        s = re.sub(r'([（「])(?:……)+', r'\1', s)
    return s


def counts(strings):
    """三種該是 0 的：句首「……」（含「（」「「」後面）、句末標點後的「……」、「）」後的「……」"""
    c = {'句首': 0, '。！？後': 0, '）後': 0}
    for s in strings:
        if not isinstance(s, str) or ONLY.fullmatch(s):
            continue
        if re.match(r'[（「]?……', s) or re.search(r'[（「]……', s): c['句首'] += 1
        if re.search(r'[。！？]……', s): c['。！？後'] += 1
        if '）……' in s: c['）後'] += 1
    return c
