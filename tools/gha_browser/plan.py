"""GHA-BROWSER（BB_257 T7，CC-C 11-05）：讀 tools/gha_browser/queue.txt，排出 GitHub Actions 的 matrix。
  格式和 PC 佇列（tools/cc_local/queue.txt）一樣：ID | SHA | KIND | SCRIPT | URL | TIMEOUT_MIN | ENV（k=v;k=v），# 開頭跳過。
  已經跑過的（claude/gha-results 的 docs/story_planning/CC/gha_out/<ID>/meta.json 是同一個 SHA、同一行內容）跳過；ENV 寫 RERUN=… 換一個記號就會重跑。
  輸出（給 $GITHUB_OUTPUT）：matrix=[{id,sha,kind,script,url,tmin,env,line_hash}]、any=true|false
用法：python3 tools/gha_browser/plan.py [queue] [done_dir]"""
import hashlib, json, os, sys

Q = sys.argv[1] if len(sys.argv) > 1 else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'queue.txt')
DONE = sys.argv[2] if len(sys.argv) > 2 else ''
items = []
for line in open(Q, encoding='utf-8'):
    if line.lstrip().startswith('#') or '|' not in line: continue
    p = [x.strip() for x in line.rstrip('\n').split('|')]
    if len(p) < 6 or not p[0]: continue
    env = p[6] if len(p) > 6 else ''
    lh = hashlib.sha1('|'.join(p).encode('utf-8')).hexdigest()[:12]
    it = {'id': p[0], 'sha': p[1], 'kind': p[2], 'script': p[3], 'url': p[4], 'tmin': int(float(p[5] or 30)), 'env': env, 'line_hash': lh}
    if DONE:
        mp = os.path.join(DONE, p[0], 'meta.json')
        if os.path.exists(mp):
            try:
                m = json.load(open(mp, encoding='utf-8'))
                if m.get('line_hash') == lh: print('skip %s (done: %s)' % (p[0], m.get('result')), file=sys.stderr); continue
            except Exception: pass
    items.append(it)
print('matrix=' + json.dumps(items, ensure_ascii=False))
print('any=' + ('true' if items else 'false'))
print('%d item(s): %s' % (len(items), ' '.join(i['id'] for i in items)), file=sys.stderr)
