import sys,re,html,subprocess
def get(pcode):
    t=subprocess.run(['curl','-sS','-m','30',f'https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode={pcode}'],capture_output=True,text=True).stdout
    name=re.search(r'<title>([^<]*)</title>',t)
    mod=re.search(r'修正日期[^0-9民]*(民國[^<]{0,30})',t)
    i=t.find('law-reg-content')
    s=t[i:] if i>=0 else t
    s=re.split(r'<div class="law-tools|<footer',s)[0]
    s=re.sub(r'<br\s*/?>','\n',s)
    s=re.sub(r'</div>','\n',s)
    s=html.unescape(re.sub(r'<[^>]+>','',s))
    s=re.sub(r'\n\s*\n+','\n',s)
    return (name.group(1).strip() if name else pcode), (mod.group(1) if mod else ''), s.strip()
for p in sys.argv[1:]:
    n,m,s=get(p)
    open(f'law_{p}.txt','w').write(f'{n}\n{m}\n{s}\n')
    print(p,n,m,len(s))
