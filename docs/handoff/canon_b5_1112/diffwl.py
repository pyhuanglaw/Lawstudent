import json,subprocess,sys
d=json.load(open('docs/handoff/story_import_allow.json'))
T=sys.argv[1] if len(sys.argv)>1 else '6dbfe10d7e'
def blob(sha,p):
    r=subprocess.run(['git','rev-parse',f'{sha}:{p}'],capture_output=True,text=True)
    return r.stdout.strip() if r.returncode==0 else None
for e in d['files']:
    p=e['path']; a=blob(e['sha'],p); b=blob(T,p)
    if a!=b: print('CHANGED' if a and b else 'MISSING', e['sha'], p, e.get('status'))
