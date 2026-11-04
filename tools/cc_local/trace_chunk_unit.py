# -*- coding: utf-8 -*-
"""CC（帳號 A）cc_trace.py 分段（start_chunk／stop_chunk）單元測試：不開瀏覽器，用假的 context／tracing。
  1 沒有 FAIL 的段只留最後 KEEP_LAST 段，其他刪掉
  2 有 FAIL 行／pageerror 的那一段留著（不管多舊）
  3 探針印「== 」會換段；滿 CHUNK_S 秒也會換段
  4 flush：最後一段存下、tracing.stop() 不帶 path（不再產生整份的大 zip）
  5 CC_TRACE_CHUNK=0：照舊整份一個 zip
用法：python3 tools/cc_local/trace_chunk_unit.py"""
import asyncio, importlib, json, os, sys, tempfile
HERE = os.path.dirname(os.path.abspath(__file__))
fails = 0
def check(n, ok, info=''):
    global fails
    print(('PASS ' if ok else 'FAIL ') + n + (('  ' + str(info)) if info else ''))
    if not ok: fails += 1

class FakeTracing:
    def __init__(self): self.log = []
    async def start(self, **kw): self.log.append('start')
    async def start_chunk(self, title=None): self.log.append('start_chunk:' + str(title))
    async def stop_chunk(self, path=None):
        self.log.append('stop_chunk'); open(path, 'wb').write(b'x' * 1000)
    async def stop(self, path=None):
        self.log.append('stop:' + str(path))
        if path: open(path, 'wb').write(b'y' * 5000)
class FakeCtx:
    def __init__(self): self.tracing = FakeTracing(); self.pages = []
    def on(self, *a): pass

def load(env):
    for k in ('CC_TRACE_CHUNK', 'CC_TRACE_CHUNK_S', 'CC_TRACE_KEEP_LAST'): os.environ.pop(k, None)
    os.environ.update(env)
    d = tempfile.mkdtemp(); os.environ['CC_TRACE_DIR'] = d; os.environ['CC_ITEM'] = 'U'
    sys.path.insert(0, HERE)
    if 'cc_trace' in sys.modules: del sys.modules['cc_trace']
    m = importlib.import_module('cc_trace')
    return m, d

async def run_chunked():
    m, d = load({'CC_TRACE_KEEP_LAST': '2', 'CC_TRACE_CHUNK_S': '10'})
    tr = m.Tracer(); tee = m.FailTee(open(os.devnull, 'w'), tr)
    ctx = FakeCtx(); r = await tr.a_start(ctx)
    check('分段開啟（start＋start_chunk）', r['chunked'] and ctx.tracing.log[:2] == ['start', 'start_chunk:c001'], ctx.tracing.log)
    tee.write('== A\n'); await asyncio.sleep(1.3)                # c001 → 換段（沒 FAIL）
    tee.write('FAIL something\n'); tee.write('== B\n'); await asyncio.sleep(1.3)   # c002 有 FAIL
    for x in 'CDE':
        tee.write('== %s\n' % x); await asyncio.sleep(1.3)      # c003..c005 沒 FAIL
    r['t0'] -= 11; await asyncio.sleep(1.3)                     # 時間到 → c006 換段
    await tr.a_flush(r, 'test')                                 # 最後一段 c007
    files = sorted(f for f in os.listdir(d) if f.endswith('.zip'))
    kept = [c['file'] for c in r['chunks'] if c['kept']]
    check('段數：7 段（6 次換段＋flush）', len(r['chunks']) == 7, [c['file'] for c in r['chunks']])
    check('有 FAIL 的 c002 留著', 'trace_U_1_c002.zip' in files, files)
    check('沒 FAIL 的只留最後 2 段（c006、c007），c001、c003～c005 刪掉', files == ['trace_U_1_c002.zip', 'trace_U_1_c006.zip', 'trace_U_1_c007.zip'], files)
    check('kept 欄位和檔案一致', sorted(kept) == files, kept)
    check('換段原因有 case 和 time', any('case: == C' in (c['until'] or '') for c in r['chunks']) and any('time' in (c['until'] or '') for c in r['chunks']), [c['until'] for c in r['chunks']])
    check('flush：tracing.stop() 不帶 path', ctx.tracing.log[-1] == 'stop:None', ctx.tracing.log[-3:])
    env = json.load(open(os.path.join(d, 'env.json'), encoding='utf-8'))
    check('env.json traces 列出 7 段、kept 3', len(env['traces']) == 7 and sum(1 for t in env['traces'] if t.get('kept')) == 3, len(env['traces']))

async def run_whole():
    m, d = load({'CC_TRACE_CHUNK': '0'})
    tr = m.Tracer(); ctx = FakeCtx(); r = await tr.a_start(ctx)
    await tr.a_flush(r, 'test')
    files = sorted(f for f in os.listdir(d) if f.endswith('.zip'))
    check('CC_TRACE_CHUNK=0：整份一個 zip（舊做法）', not r['chunked'] and files == ['trace_U_1.zip'] and ctx.tracing.log == ['start', 'stop:' + os.path.join(d, 'trace_U_1.zip')], (files, ctx.tracing.log))

asyncio.run(run_chunked()); asyncio.run(run_whole())
print('ALL PASS' if not fails else 'FAILED %d' % fails); sys.exit(1 if fails else 0)
