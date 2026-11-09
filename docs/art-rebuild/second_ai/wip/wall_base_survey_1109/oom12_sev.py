# 嚴重度＝Σ 面積 × 露出比例 × (1 − 亮度比)（同 wall_base_survey_1109 README）
import re,sys
cur=None; R={}
for l in open(sys.argv[1],encoding='utf-8'):
    if l.startswith('=== '): cur=l.split('/')[-1].strip().replace('.glb',''); R[cur]=[0,[]]; continue
    m=re.search(r'露出：(\S+) 被 (\S+) 擋住 ([\d.]+) m²，(\d+)% 的組合.*（([\d.]+)）',l)
    if m and cur:
        a,p,r=float(m[3]),int(m[4])/100,float(m[5]); s=a*p*(1-r); R[cur][0]+=s; R[cur][1].append((s,m[1],m[2],a,int(m[4]),r))
for k,(t,L) in R.items():
    L.sort(reverse=True); print('%s 嚴重度 %.2f；最明顯：%s'%(k,t,'；'.join('%s ← %s %.1f m²，%d%%，%.2f 倍'%(x[1],x[2],x[3],x[4],x[5]) for x in L[:2])))
