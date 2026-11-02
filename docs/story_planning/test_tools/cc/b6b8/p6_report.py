# 用法：python3 p6_report.py p6_real.jsonl [p6_uniform.jsonl]
import json,sys,collections
ENDS=["A_bar","A_none","B_grad","B_quit","C_zq","C","L_firm","J_judge","J_pros"]
for f in sys.argv[1:]:
  R=[json.loads(l) for l in open(f)]; n=len(R)
  print('=== %s  n=%d'%(f,n))
  bad=[r for r in R if r.get('err') or not r.get('epi') or r.get('warns') or r.get('rej') or r.get('leanErr') or r.get('mono') is False or r.get('path')!=r.get('lastKey')]
  print('卡死/例外/尾聲不一致:',len(bad),[ (r['seed'],r.get('err') and r['err'][:80],r.get('epi'),r.get('stops'),r.get('warns'),r.get('path'),r.get('lastKey')) for r in bad][:6])
  c=collections.Counter(r.get('path') for r in R)
  print('結局:',' '.join('%s=%d(%.0f%%)'%(k,c[k],100*c[k]/n) for k in ENDS), ' 其他:',{k:v for k,v in c.items() if k not in ENDS})
  print('沒出現:',[k for k in ENDS if c[k]==0], ' >60%:',[k for k in ENDS if c[k]>0.6*n])
  print('pathTop:',dict(collections.Counter(r.get('top') for r in R)),' careerLean.top:',dict(collections.Counter((r.get('lean') or {}).get('top') for r in R)))
  ls=[r['lean'] for r in R if r.get('lean')]
  for k in 'ABC':
    v=sorted(l[k] for l in ls); print('  %s 分數 min/med/max= %d/%d/%d'%(k,v[0],v[len(v)//2],v[-1]))
  ties=sum(1 for l in ls if sorted([l['A'],l['B'],l['C']])[-1]==sorted([l['A'],l['B'],l['C']])[-2]); print('  最高分平手:',ties)
  print('BAR_YEAR 有:',sum(1 for r in R if r.get('F',{}).get('BAR_YEAR') is not None),' JUDGE_YEAR 有:',sum(1 for r in R if r.get('F',{}).get('JUDGE_YEAR') is not None),
        ' after:',dict(collections.Counter(','.join(r.get('after') or []) for r in R)))
  print('route×path:',dict(collections.Counter((r['P']['route'],r.get('path')) for r in R)))
  print('y4×path:',dict(collections.Counter((r['P']['y4'],r.get('path')) for r in R)))
  ex={}
  for r in R: ex.setdefault(r.get('path'),r['seed'])
  print('每種結局的一個種子:',ex)
  ms=[r['ms'] for r in R]; print('平均 ms',sum(ms)//n)
