import re,os,glob,collections,sys
R=sys.argv[1]
files=[f for f in glob.glob(R+'/src/**/*.js',recursive=True) if 'chars3d' not in f]
txt={f:open(f,encoding='utf-8').read() for f in files}
writes=collections.defaultdict(set)
pat=[r"flags:\{([^{}]*)\}", r"flags\.([A-Za-z_]\w*)\s*=(?!=)", r"flags\[['\"](\w+)['\"]\]\s*=(?!=)", r"setFlag\(\s*['\"](\w+)", r"S\.set\(\s*G\s*,\s*['\"](\w+)"]
for f,t in txt.items():
    for m in re.finditer(pat[0],t):
        for k in re.findall(r"([A-Za-z_]\w*)\s*:",m.group(1)): writes[k].add(os.path.relpath(f,R)+':'+str(t[:m.start()].count('\n')+1))
    for p in pat[1:]:
        for m in re.finditer(p,t): writes[m.group(1)].add(os.path.relpath(f,R)+':'+str(t[:m.start()].count('\n')+1))
alltxt='\n'.join(txt.values())
dead=[]
for k,ws in writes.items():
    if len(k)<4: continue
    n=len(re.findall(r'\b'+re.escape(k)+r'\b',alltxt))
    # 每個寫入位置至少一次；讀取＝超過寫入次數
    if n<=len(ws): dead.append((k,sorted(ws)))
print(len(writes),'flags written;',len(dead),'never read')
for k,ws in sorted(dead): print(k,ws[:3])
