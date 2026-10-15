# -*- coding: utf-8 -*-
"""把使用者的法學英文題目（Markdown 原文，英文題幹）轉成遊戲讀得懂的 JSON。只做格式轉換，不改任何字。作者：BB-B（2026-10-15）。

用法：python3 convert_legal_english.py <使用者題庫.md> <課程對應.json> <輸出.json>

- 題目格式（使用者 2026-10-14 約 17:30 給的法學英文 25 題）：
  「Question N」或「Question N — 領域」→ 英文題幹 →「(A) …」～「(D) …」各一行 →「Answer: X. 選項文字」→「解析：…」（中文）。
  其他文字（標題、Difficulty、Instructions、Answer Key、Game Integration Rules）不當題目，但 Answer Key 表要拿來核對。
- `core`＝「Question N — 」後面的領域（使用者寫的，例如 Contract Law），第 1～15 題沒有就留空；`explanation`＝使用者的「解析：」全文（可以顯示）。
- `difficulty`＝使用者標的難度：第 1～10 題 Easy、第 11～15 題 Medium（Answer Key 表），第 16～25 題 Intermediate（那一段的標題）。
- `sourceNote`＝使用者要求的標示：original practice questions inspired by Taiwan’s bar and judicial examination, not official past examination questions。
- 逐題檢查：題幹、四個選項、解析、領域都要原封不動出現在原文裡；「Answer: X. 文字」的文字要和選項 X 完全相同；答案要和 Answer Key 表一致；題號 1～N 連續不重複。任何一項不符就停止，不輸出。
"""
import json, re, sys, hashlib

NOTE = 'original practice questions inspired by Taiwan’s bar and judicial examination, not official past examination questions'

def parse(md):
    body = md.split('（以下為使用者提供的原文）', 1)[-1]
    heads = list(re.finditer(r'^Question (\d+)(?: — (.+))?$', body, re.M))
    out = []
    for i, h in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        lines = [l.strip() for l in body[h.end():end].split('\n')]
        no = int(h.group(1))
        try:
            a_idx = next(k for k, l in enumerate(lines) if l.startswith('(A) '))
            ans_idx = next(k for k, l in enumerate(lines) if l.startswith('Answer: '))
            ex_idx = next(k for k, l in enumerate(lines) if l.startswith('解析：'))
        except StopIteration:
            raise SystemExit(f'第 {no} 題：找不到選項、答案或解析')
        stem = '\n'.join(l for l in lines[:a_idx] if l)
        opts = {}
        for l in lines[a_idx:ans_idx]:
            if not l:
                continue
            m = re.match(r'^\(([ABCD])\) (.+)$', l)
            if not m:
                raise SystemExit(f'第 {no} 題：選項格式看不懂：{l}')
            opts[m.group(1)] = m.group(2).strip()
        am = re.match(r'^Answer: ([ABCD])\. (.+)$', lines[ans_idx])
        if not am:
            raise SystemExit(f'第 {no} 題：答案格式看不懂：{lines[ans_idx]}')
        ex = lines[ex_idx][len('解析：'):].strip()
        out.append(dict(no=no, area=(h.group(2) or '').strip(), q=stem, options=opts,
                        answer=am.group(1), answerText=am.group(2).strip(), explanation=ex))
    return out

def answer_key(md):
    key, diff = {}, {}
    for m in re.finditer(r'^(\d+)\t([ABCD])(?:\t(\w+))?$', md, re.M):
        n = int(m.group(1))
        if n in key and key[n] != m.group(2):
            raise SystemExit(f'Answer Key 第 {n} 題出現兩個答案')
        key[n] = m.group(2)
        if m.group(3): diff[n] = m.group(3)
    return key, diff

def main():
    src, mapping, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    md = open(src, encoding='utf-8').read()
    cmap = json.load(open(mapping, encoding='utf-8'))
    items = parse(md)
    key, diff = answer_key(md)
    srcname = src.split('/')[-1]
    errors, qs = [], []
    nos = [it['no'] for it in items]
    if nos != list(range(1, len(nos) + 1)):
        errors.append(f'題號不是 1～{len(nos)} 連續：{nos}')
    for it in items:
        n = it['no']
        if sorted(it['options']) != ['A', 'B', 'C', 'D']:
            errors.append(f'第 {n} 題：不是四個選項 A～D')
        if len(set(it['options'].values())) != 4:
            errors.append(f'第 {n} 題：選項有重複')
        for field in (it['q'], it['explanation'], it['area'], *it['options'].values()):
            if field and field not in md:
                errors.append(f'第 {n} 題：『{field[:20]}…』在原文裡找不到（不能改字）')
        if it['options'].get(it['answer']) != it['answerText']:
            errors.append(f"第 {n} 題：Answer 的文字『{it['answerText']}』和選項 {it['answer']}『{it['options'].get(it['answer'])}』不同")
        if key.get(n) != it['answer']:
            errors.append(f"第 {n} 題：答案 {it['answer']} 和 Answer Key 的 {key.get(n)} 不同")
        d = diff.get(n) or ('Intermediate' if n >= 16 else None)
        if not d:
            errors.append(f'第 {n} 題：找不到難度')
        m = cmap.get(str(n))
        if not m:
            errors.append(f'第 {n} 題：沒有課程對應')
            continue
        qs.append(dict(id=m['id'], course=m['course'], term=m['term'], scopeWeek=m['scopeWeek'], type='mc', lang='en',
                       q=it['q'], options=it['options'], answer=it['answer'],
                       core=it['area'], explanation=it['explanation'], difficulty=d, mapBasis=m.get('basis', ''),
                       source=f'{srcname} 第 {n} 題', sourceNote=NOTE, status='USER_CONFIRMED', mapNote=m.get('notes', []), flags=m.get('flags', [])))
    if set(key) != set(nos):
        errors.append(f'Answer Key 的題號和題目不同：{sorted(set(key) ^ set(nos))}')
    for k in cmap:
        if k.isdigit() and int(k) not in nos:
            errors.append(f'對應表有第 {k} 題，原文沒有')
    if errors:
        raise SystemExit('\n'.join(errors))
    digest = hashlib.sha256(md.encode('utf-8')).hexdigest()[:16]
    json.dump(dict(_comment='使用者提供的正式題目（A 類）：法學英文。只做格式轉換：英文題幹、選項、答案、領域（core）、中文解析一字不改（convert_legal_english.py 逐字核對，答案和 Answer Key 表一致）。使用者要求標示：' + NOTE + '（sourceNote）。lang=en：題幹與選項是英文，解析是中文（使用者的 Game Integration Rules）。course／term／scopeWeek／mapBasis／flags 是 BB 加的對應資料，不是題目內容；askedIn 由 sync_asked.py 從 syllabus 同步。',
                   source=srcname, sourceSha256_16=digest, sourceNote=NOTE, count=len(qs), questions=qs),
              open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'ok：{len(qs)} 題 → {dst}')

if __name__ == '__main__':
    main()
