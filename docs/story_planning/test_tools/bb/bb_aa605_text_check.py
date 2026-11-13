#!/usr/bin/env python3
"""BB：AA_605 三項（X156、X158、X161）逐字檢查。用法：python3 bb_aa605_text_check.py <SHA> [<SHA修改前>]
讀 git show <SHA>:src/...，不用瀏覽器。修改前的 SHA 應該 FAIL、修好的 SHA 應該 PASS。"""
import subprocess, sys, re
def src(sha, path):
    try: return subprocess.run(['git','show',f'{sha}:{path}'],capture_output=True,text=True,check=True).stdout
    except subprocess.CalledProcessError: return ''
def allsrc(sha):
    names=subprocess.run(['git','ls-tree','-r','--name-only',sha,'src'],capture_output=True,text=True).stdout.split()
    return {n:src(sha,n) for n in names if n.endswith('.js')}
def nocomment(t):
    t=re.sub(r'/\*.*?\*/','',t,flags=re.S); return re.sub(r'(?m)^\s*//.*$|\s//\s.*$','',t)
def run(sha):
    S=allsrc(sha); CL=nocomment(S.get('src/classes3d.js','')); ALL='\n'.join(S.values()); ok=True
    def chk(name,cond,info=''):
        nonlocal ok; ok&=bool(cond); print(('PASS ' if cond else 'FAIL ')+name+(('  '+info) if info else ''))
    ev=S.get('src/data/events.js',''); jp=S.get('src/data/jp_events.js',''); cl=S.get('src/classes3d.js','')
    # 1 保險法
    chk('1. 保險法補修第一堂新句',('（保險法的補修班。你坐在最後一排，抄下這學期剩下的上課日期。）' in jp))
    chk('1. 舊句「交換回來的？」不在全部 src',('交換回來的？' not in ALL))
    # 2 ev_course_selection retired
    m=re.search(r"\{\s*id\s*:\s*'ev_course_selection'.{0,400}",ev,re.S)
    chk('2. ev_course_selection 還留定義（舊存檔）',m is not None)
    chk('2. ev_course_selection 標 retired',bool(m and re.search(r'retired\s*:\s*(true|1)',m.group(0))),(m.group(0)[:160].replace('\n',' ') if m else ''))
    # 3 大一下選課結果
    chk('3. 「城市與散步」不在 classes3d.js（去掉註解）',('城市與散步' not in CL))
    chk('3. 「天文與我們」不在 classes3d.js（去掉註解）',('天文與我們' not in CL))
    chk('3. 「選課結果出來了：」＋學期名稱那句還在',("'選課結果出來了：'+S.termName(termId)+'。'" in CL))
    # 4~8 便利貼
    for i,t in [(4,'（這間教室下午是舊序章的系的課。你坐的位子，桌角貼著一張便利貼——是下午坐這裡的人留的。）'),
                (5,'這個位子的插座是壞的。不要白帶充電器。'),
                (6,'（同一個位子，又多了一張。字跡跟上次一樣。）'),
                (7,'（第三張。下午那個人好像很期待你回。）'),
                (8,'（英文提早十分鐘下課。你收東西的時候，下午那堂的人已經在門口等。有一個人直接走到你的位子，手上拿著一張便利貼。）')]:
        chk(f'{i}. {t[:24]}…',(t in ALL) or (t.strip('（）') in ALL))
    chk('4. 舊句「桌角貼著一張便利貼。」單獨那句已換掉',not re.search(r"['\"]（?桌角貼著一張便利貼。）?['\"]",ALL))
    # 位置：note2/note3/reveal 新旁白要在各自事件內
    for i,eid,t in [(6,'ev_sk04_note2','同一個位子，又多了一張'),(7,'ev_sk04_note3','第三張。下午那個人'),(8,'ev_sk04_reveal','英文提早十分鐘下課')]:
        k=ALL.find("'"+eid+"'"); seg=ALL[k:k+3000] if k>=0 else ''
        chk(f'{i}. 新旁白在 {eid} 裡',t in seg)
    print(f'SHA {sha}', 'ALL PASS' if ok else 'FAILED'); return ok
if __name__=='__main__':
    for s in sys.argv[1:]: print('====',s); run(s)
