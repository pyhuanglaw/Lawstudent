import sys,re,html,subprocess
def art(pcode,no):
    t=subprocess.run(['curl','-sS','-m','25',f'https://law.moj.gov.tw/LawClass/LawSingle.aspx?pcode={pcode}&flno={no}'],capture_output=True,text=True).stdout
    i=t.find('law-article')
    if i<0: return '(not found)'
    s=t[i:i+6000]
    s=re.split(r'<script|判例|相關法條',s)[0]
    s=html.unescape(re.sub(r'\s+',' ',re.sub(r'<[^>]+>',' ',s)))
    return s.replace('law-article">','').strip()
for spec in sys.argv[1:]:
    p,n=spec.split(':'); print(f'[{p} §{n}]', art(p,n)[:420])
