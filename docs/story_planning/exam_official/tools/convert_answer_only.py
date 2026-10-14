# -*- coding: utf-8 -*-
"""把使用者「只附正確答案」格式的題目（Markdown 原文）轉成遊戲讀得懂的 JSON。只做格式轉換，不改任何字。作者：BB（2026-10-14）。

用法：python3 convert_answer_only.py <使用者題庫.md> <課程對應.json> <輸出.json> [舊版題庫.json]

- 題目格式（使用者 2026-10-14 約 16:50 給的那一批）：
  「第N題｜考點」→ 題幹 →「A. …」「B. …」「C. …」「D. …」各一行 →「正確答案：X」。
  題目之間可能夾著分節標題（「⸻」「第二部分：…」「新增民法選擇題…」）或使用者貼上的說明文字：只讀「第N題」到「正確答案」之間，其餘不用。
- 課程對應（BB 依各課每週的黑板定，AA 交叉檢查）：{"1": {"id": "...", "course": "...", "term": "...", "scopeWeek": 3, "basis": "...", "flags": [...]}, ...}
- `core`＝標題「第N題｜」後面的字（使用者寫的考點），原封不動；這一批沒有解析，`explanation` 留空，**不自己寫**。
- 舊版題庫（選填）：同題號、題目內容相同的舊版（例如 `civil_20_2026-10-14.json`）有使用者給過的解析時，沿用那段解析（逐字），並記下出處。
- 逐題檢查：題幹、四個選項、考點都要原封不動出現在原文裡；答案是 A～D 之一；四個選項不重複；沿用解析時，舊版的四個選項與答案必須和新版完全相同。任何一項不符就停止，不輸出。
"""
import json, re, sys, hashlib

def parse(md):
    body = md.split('（以下為使用者提供的原文）', 1)[-1]
    heads = list(re.finditer(r'^第\s*(\d+)\s*題｜(.+)$', body, re.M))
    out = []
    for i, h in enumerate(heads):
        end = heads[i + 1].start() if i + 1 < len(heads) else len(body)
        block = body[h.end():end]
        lines = [l.strip() for l in block.split('\n')]
        try:
            a_idx = next(k for k, l in enumerate(lines) if re.match(r'^A\. ', l))
            ans_idx = next(k for k, l in enumerate(lines) if l.startswith('正確答案：'))
        except StopIteration:
            raise SystemExit(f'第 {h.group(1)} 題：找不到選項或正確答案')
        stem = '\n'.join(l for l in lines[:a_idx] if l)
        opts = {}
        for l in lines[a_idx:ans_idx]:
            if not l:
                continue
            m = re.match(r'^([ABCD])\. (.+)$', l)
            if not m:
                raise SystemExit(f'第 {h.group(1)} 題：選項格式看不懂：{l}')
            opts[m.group(1)] = m.group(2).strip()
        am = re.match(r'^正確答案：([ABCD])$', lines[ans_idx])
        if not am:
            raise SystemExit(f'第 {h.group(1)} 題：答案格式看不懂：{lines[ans_idx]}')
        out.append(dict(no=int(h.group(1)), point=h.group(2).strip(), q=stem, options=opts, answer=am.group(1)))
    return out

def main():
    src, mapping, dst = sys.argv[1], sys.argv[2], sys.argv[3]
    old = json.load(open(sys.argv[4], encoding='utf-8')) if len(sys.argv) > 4 else None
    oldq = {}
    if old:
        for q in old['questions']:
            n = int(re.search(r'第 (\d+) 題', q['source']).group(1))
            oldq[n] = q
    md = open(src, encoding='utf-8').read()
    cmap = json.load(open(mapping, encoding='utf-8'))
    items = parse(md)
    srcname = src.split('/')[-1]
    errors, qs = [], []
    nos = [it['no'] for it in items]
    if len(nos) != len(set(nos)):
        errors.append('題號重複')
    for it in items:
        if sorted(it['options']) != ['A', 'B', 'C', 'D']:
            errors.append(f"第 {it['no']} 題：不是四個選項 A～D")
        for field in (it['q'], it['point'], *it['options'].values()):
            if field not in md:
                errors.append(f"第 {it['no']} 題：『{field[:20]}…』在原文裡找不到（不能改字）")
        if len(set(it['options'].values())) != 4:
            errors.append(f"第 {it['no']} 題：選項有重複")
        m = cmap.get(str(it['no']))
        if not m:
            errors.append(f"第 {it['no']} 題：沒有課程對應")
            continue
        q = dict(id=m['id'], course=m['course'], term=m['term'], scopeWeek=m['scopeWeek'], type='mc',
                 q=it['q'], options=it['options'], answer=it['answer'],
                 core=it['point'], explanation='', basis=m.get('basis', ''),
                 source=f"{srcname} 第 {it['no']} 題", status='USER_CONFIRMED', flags=m.get('flags', []))
        if it['no'] in oldq and m.get('carryExplanation'):
            o = oldq[it['no']]
            if o['options'] != it['options'] or o['answer'] != it['answer']:
                errors.append(f"第 {it['no']} 題：舊版的選項或答案和新版不同，不能沿用解析")
            else:
                q['explanation'] = o['explanation']
                q['explanationSource'] = o['source']
                q['previousId'] = o['id']
        qs.append(q)
    for k in cmap:
        if k.isdigit() and int(k) not in nos:
            errors.append(f'對應表有第 {k} 題，原文沒有')
    if errors:
        raise SystemExit('\n'.join(errors))
    digest = hashlib.sha256(md.encode('utf-8')).hexdigest()[:16]
    json.dump(dict(_comment='使用者提供的正式題目（A 類）。只做格式轉換：題幹、選項、答案、考點一字不改（convert_answer_only.py 逐字核對）；這一批沒有解析。course／term／scopeWeek／basis／flags 是 BB 加的對應資料（AA 交叉檢查），不是題目內容。',
                   source=srcname, sourceSha256_16=digest, count=len(qs), questions=qs),
              open(dst, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'ok：{len(qs)} 題 → {dst}')

if __name__ == '__main__':
    main()
