import sys,re
base=set(l.strip() for l in open("pg_read/tw_single.txt") if l.strip())
skip=re.compile(r'^(〔字卡〕\d+/\d+（.）[\d:]+$|\d+／20　|交卷)')
for p in sys.argv[1:]:
    print('=====',p)
    hdr=None
    for l in open(f'pg_read/{p}.txt'):
        s=l.rstrip()
        if s.startswith('### '): hdr=s; continue
        t=s.strip()
        if not t or t in base or skip.match(t): continue
        if hdr: print(hdr); hdr=None
        print(s)
