"""企劃的逐句對照表（BB_179 附錄格式：| # | 位置 | 人 | 原句 | 改成 | 原因 |）→ 程式。只自動換「原句在 src 裡剛好一次、改成是一般句子」的列；刪句、新增、結構重寫、找不到或重複的列出來人工處理（台詞一律照企劃原文，D79）。
用法：python3 tools/story/apply_line_table.py <對照表.md> [--apply｜--tests]（先空跑看分類；--apply 換 src；--tests 把同一份對照套到 tests 的期望值，要在 --apply 之後、commit 之前跑）"""
import re, sys, os, glob, json
ROOT='/home/user/Lawstudent'
FILES=[f for f in glob.glob(ROOT+'/src/**/*.js',recursive=True) if '/lib/' not in f and 'chars3d' not in f]
import subprocess
src={f:(subprocess.run(['git','-C',ROOT,'show','HEAD:'+os.path.relpath(f,ROOT)],capture_output=True,text=True).stdout if '--tests' in sys.argv else open(f,encoding='utf8').read()) for f in FILES}
md=open(sys.argv[1],encoding='utf8').read(); apply='--apply' in sys.argv; tests='--tests' in sys.argv   # --tests：把同一份對照套到 tests/*.js 的期望值（src 已經換過了，用 git HEAD 的 src 判斷唯一）
rows=[]
for line in md.split('\n'):
    m=re.match(r'^\|\s*([0-9]+[a-z]?)\s*\|(.*)\|\s*$',line)
    if not m: continue
    cells=[c.strip() for c in m.group(2).split('|')]
    if len(cells)<5: continue
    rows.append({'n':m.group(1),'where':cells[0],'who':cells[1],'old':cells[2],'new':cells[3],'why':cells[4]})
def clean(t):
    t=t.strip().strip('`')
    return t
auto,manual=[],[]
for r in rows:
    old,new=clean(r['old']),clean(r['new'])
    if new.startswith('（刪') or old in ('—','-','') or '【' in new or '→' in new or '／' in new or '／' in old or '建議' in new:   # （刪；…）帶說明的刪除、／分成兩句、建議旁白：都要人工（2026-10-17 段 A 曾被當成台詞塞進去）
        manual.append((r,'刪除／新增／結構')); continue
    if re.search(r'（[^）]*(改|接|照|停在|刪|放|移|加)[^）]*）$',new) and not re.match(r'^（.*）$',new):
        manual.append((r,'改成欄有說明')); continue
    hits=[(f,src[f].count(old)) for f in FILES if old and src[f].count(old)]
    tot=sum(c for _,c in hits)
    if tot==1:
        f=hits[0][0]; auto.append((r,f))
        if apply: src[f]=src[f].replace(old,new,1)
    else: manual.append((r,f'原句出現 {tot} 次'))
print(f'{os.path.basename(sys.argv[1])}：共 {len(rows)} 列｜可以自動換 {len(auto)}｜人工 {len(manual)}')
for r,why in manual: print(f"  人工 #{r['n']} [{why}] {r['where']}｜{r['who']}｜{r['old'][:40]} → {r['new'][:50]}")
if tests:
    n=0
    for tf in glob.glob(ROOT+'/tests/*.js')+glob.glob(ROOT+'/tests/*.py'):
        t=open(tf,encoding='utf8').read(); t0=t
        for r,_ in auto:
            o,nw=clean(r['old']),clean(r['new'])
            if o in t: t=t.replace(o,nw)
        if t!=t0: open(tf,'w',encoding='utf8').write(t); n+=1; print('  測試改了', os.path.basename(tf))
elif apply:
    for f in set(f for _,f in auto): open(f,'w',encoding='utf8').write(src[f])
    print('已套用', len(auto), '列：', ' '.join('#'+r['n'] for r,_ in auto))
