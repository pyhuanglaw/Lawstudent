# -*- coding: utf-8 -*-
"""把使用者提供的題目（Markdown 原文）轉成遊戲讀得懂的 JSON。只做格式轉換，不改任何字。

用法：python3 convert_user_md.py <使用者題庫.md> <課程對應.json> <輸出.json>

- 題目格式（使用者 2026-10-14 定）：「第 N 題｜考點」→ 題幹 →「A. … B. … C. … D. …」→「答案：X｜…」→「解析：…」。
- 課程對應（AA 依各課每週的教學範圍定）：{"1": {"course": "civ_general", "term": "Y1S1", "scopeWeek": 14}, ...}
- 轉完逐題檢查：題幹、四個選項、答案說明、解析都要**原封不動**出現在原文裡；答案是 A～D 之一；四個選項不重複。任何一項不符就停止，不輸出。
"""
import json, re, sys, hashlib

def parse(md):
    body = md.split('（以下為使用者提供的原文）', 1)[-1]
    heads = list(re.finditer(r'^第 (\d+) 題｜(.+)$', body, re.M))
    out = []
    for i, h in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        block = body[h.end():end]
        # 區塊結尾可能接著下一個大標（「三、債法各論（3 題）」）或結語，切掉解析之後的段落
        lines = [l for l in block.split('\n')]
        paras = [p.strip() for p in '\n'.join(lines).split('\n\n') if p.strip()]
        stem = paras[0]
        opt_line = next(p for p in paras if re.match(r'^A\. ', p))
        ans_line = next(p for p in paras if p.startswith('答案：'))
        exp_line = next(p for p in paras if p.startswith('解析：'))
        m = re.match(r'^A\. (.+?) B\. (.+?) C\. (.+?) D\. (.+)$', opt_line)
        if not m:
            raise SystemExit(f'第 {h.group(1)} 題：選項格式看不懂：{opt_line}')
        opts = dict(zip('ABCD', [x.strip() for x in m.groups()]))
        am = re.match(r'^答案：([ABCD])｜(.+)$', ans_line)
        if not am:
            raise SystemExit(f'第 {h.group(1)} 題：答案格式看不懂：{ans_line}')
        out.append(dict(no=int(h.group(1)), point=h.group(2).strip(), q=stem, options=opts,
                        answer=am.group(1), answerNote=am.group(2).strip(),
                        explanation=exp_line[len('解析：'):].strip()))
    return out

def main():
    src, mapping, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    md = open(src, encoding='utf-8').read()
    cmap = json.load(open(mapping, encoding='utf-8'))
    items = parse(md)
    srcname = src.split('/')[-1]
    errors = []
    qs = []
    for it in items:
        for field in (it['q'], it['answerNote'], it['explanation'], it['point'], *it['options'].values()):
            if field not in md:
                errors.append(f"第 {it['no']} 題：『{field[:20]}…』在原文裡找不到（不能改字）")
        if len(set(it['options'].values())) != 4:
            errors.append(f"第 {it['no']} 題：選項有重複")
        m = cmap.get(str(it['no']))
        if not m:
            errors.append(f"第 {it['no']} 題：沒有課程對應")
            continue
        qs.append(dict(
            id=f"U{srcname[:2]}_{it['no']:02d}" if False else m.get('id', f"CIV20_{it['no']:02d}"),
            course=m['course'], term=m['term'], scopeWeek=m['scopeWeek'], type='mc',
            q=it['q'], options=it['options'], answer=it['answer'],
            core=f"{it['point']}｜{it['answerNote']}", explanation=it['explanation'],
            basis=m.get('basis', ''), source=f"{srcname} 第 {it['no']} 題",
            status='USER_CONFIRMED', flags=m.get('flags', [])))
    if errors:
        raise SystemExit('\n'.join(errors))
    digest = hashlib.sha256(md.encode('utf-8')).hexdigest()[:16]
    json.dump(dict(_comment='使用者提供的正式題目（A 類）。只做格式轉換：題幹、選項、答案、考點、解析一字不改（convert_user_md.py 逐字核對）。course／term／scopeWeek／basis／flags 是 AA 加的對應資料，不是題目內容。',
                   source=srcname, sourceSha256_16=digest, count=len(qs), questions=qs),
              open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'ok：{len(qs)} 題 → {dst}')

if __name__ == '__main__':
    main()
