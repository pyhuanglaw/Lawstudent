# -*- coding: utf-8 -*-
"""CC（帳號 A）TEST-TRACE-1104（BB_256）：gpu_wrap.py 在 CC_TRACE=1 時才載入的失敗追蹤。沒設 CC_TRACE＝這個檔完全不會被 import。
做的事（只在受測的 Python 程序裡 monkeypatch playwright，async 和 sync 都包）：
  1. 每個 BrowserContext 一建好就 tracing.start(screenshots=True, snapshots=True, sources=False)。
  2. 關閉前（context.close、browser.close、async_playwright()/sync_playwright() 結束、探針 sys.exit）：
     對每個還活著的 page 讀一次遊戲狀態（GAME.stateSnapshot 有就用它，舊 SHA 退回自己的 evaluate）→ state_<item>_<n>.json，
     再 tracing.stop(path=trace_<item>_<n>.zip)。
  3. 每個 page 的 console（error、warning）、pageerror（含 stack）、requestfailed、crash、close，以及探針印的 FAIL 行
     → events.jsonl（每行有 t＝epoch 秒、rel＝程序開始後秒數、ctx、page）。
  4. env.json：瀏覽器版本、playwright 版本、GPU renderer（UNMASKED_RENDERER_WEBGL，第一個 page 讀一次）、CC_ITEM、SHA、CC_SLOT、
     headless、OS、每份 trace 的大小（超過 CC_TRACE_MAX_MB＝oversize:true，交給 runner 決定推不推）。
  所有寫出去的字串先把 repo／家目錄／暫存資料夾路徑換成 <REPO>／<HOME>／<TMP>，使用者名稱換成 <USER>。
  任何一步出錯只寫一行 [cc_trace] 警告到 stderr，不影響探針本身。
"""
import asyncio, atexit, getpass, json, os, platform, re, sys, tempfile, threading, time

T0 = time.time()
DIR = os.environ.get('CC_TRACE_DIR') or os.path.join(os.getcwd(), 'cc_trace')
ITEM = re.sub(r'[^A-Za-z0-9_.-]', '_', os.environ.get('CC_ITEM') or 'item')
MAX_MB = float(os.environ.get('CC_TRACE_MAX_MB') or 20)
TRACE_OPTS = dict(screenshots=True, snapshots=True, sources=False)

STATE_JS = r"""() => { const out = {};
  const tr = (k, f) => { try { out[k] = f(); } catch (e) { out[k] = null; } };
  tr('href', () => location.href);
  if (typeof GAME === 'undefined') { out.game = null; return out; }
  if (typeof GAME.stateSnapshot === 'function') { tr('snapshot', () => GAME.stateSnapshot()); }
  const G = GAME.G || {};
  tr('zone', () => G.zone); tr('day', () => G.day); tr('hour', () => G.hour); tr('weekday', () => G.weekday);
  tr('date', () => (GAME.dateStr ? GAME.dateStr() : (G.dateKey || null)));
  tr('player', () => { const P = GAME.E && GAME.E.player; if (!P) return null; const p = P.obj.position;
      return {x: +p.x.toFixed(2), z: +p.z.toFixed(2), y: +p.y.toFixed(2), lv: P.lv | 0, pose: P.pose || P.state || null, busy: !!P.busy}; });
  tr('dlg', () => { const D = GAME.D || {}; return {active: !!D.active, busyDepth: D.busyDepth || 0}; });
  tr('dlgText', () => { const d = document.getElementById('dlg'); return d && !d.classList.contains('hide') ? (d.innerText || '').trim().slice(0, 400) : null; });
  tr('choices', () => Array.from(document.querySelectorAll('#choices button, .choice')).filter(b => b.offsetParent).map(b => (b.innerText || '').trim().slice(0, 60)).slice(0, 12));
  tr('event', () => (typeof EVENTS !== 'undefined' && EVENTS.running) ? (EVENTS.running.id || String(EVENTS.running)) : null);
  tr('flagKeys', () => Object.keys(G.flags || {}).slice(0, 400));
  tr('lastTalkError', () => GAME.lastTalkError || null);
  tr('walkFallbacks', () => GAME.walkFallbacks || 0);
  return out; }"""

GPU_JS = r"""() => { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl');
  if (!gl) return 'no webgl'; const x = gl.getExtension('WEBGL_debug_renderer_info');
  return x ? gl.getParameter(x.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER); } catch (e) { return 'error ' + e; } }"""


def _warn(msg):
    try:
        sys.stderr.write('[cc_trace %.1fs] %s\n' % (time.time() - T0, msg)); sys.stderr.flush()
    except Exception:
        pass


# ---------- 去掉本機資訊 ----------
def _pairs():
    out = []
    here = os.path.dirname(os.path.abspath(__file__))
    work = os.path.dirname(os.path.dirname(here))           # <work>/tools/cc_local → <work>
    cands = [(work, '<REPO>'), (os.path.dirname(work), '<WTROOT>')]
    lt = os.environ.get('LW_TESTS')
    if lt:
        cands.append((os.path.dirname(os.path.abspath(lt)), '<WT>'))
    cands += [(os.getcwd(), '<CWD>'), (tempfile.gettempdir(), '<TMP>'), (os.path.expanduser('~'), '<HOME>')]
    for p, tok in cands:
        if not p or len(p) < 4:
            continue
        for v in {p, p.replace('\\', '/'), p.replace('\\', '\\\\'), p.replace('/', '\\')}:
            out.append((v, tok))
    out.sort(key=lambda x: -len(x[0]))
    return out


_PAIRS = _pairs()
try:
    _USER = getpass.getuser()
except Exception:
    _USER = ''
_USER_RE = re.compile(r'(?i)(?<![A-Za-z0-9])%s(?![A-Za-z0-9])' % re.escape(_USER)) if len(_USER) >= 3 else None
_SECRET_RE = re.compile(r'(?i)\b(authorization|cookie|set-cookie|x-api-key|api[_-]?key|access[_-]?token|token|password)(\s*[:=]\s*)([^\s,;&"\']+)')


def san(s):
    if not isinstance(s, str):
        return s
    for p, tok in _PAIRS:
        if p in s:
            s = s.replace(p, tok)
    if _USER_RE is not None:
        s = _USER_RE.sub('<USER>', s)
    return _SECRET_RE.sub(lambda m: m.group(1) + m.group(2) + '<REDACTED>', s)


def san_obj(o):
    if isinstance(o, str):
        return san(o)
    if isinstance(o, dict):
        return {san(str(k)): san_obj(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [san_obj(v) for v in o]
    return o


class Tracer(object):
    def __init__(self):
        os.makedirs(DIR, exist_ok=True)
        self.lk = threading.Lock()
        self.ctxs = []           # [{'ctx':, 'n':, 'async':, 'done':, 'pages':[]}]
        self.npage = 0
        self.ev = open(os.path.join(DIR, 'events.jsonl'), 'a', encoding='utf-8')
        self.env = {'item': os.environ.get('CC_ITEM'), 'sha': os.environ.get('SHA'), 'slot': os.environ.get('CC_SLOT'),
                    'os': '%s %s' % (platform.system(), platform.release()), 'python': sys.version.split()[0],
                    'playwright': self._pwv(), 'browser': [], 'headless': [], 'gpu_renderer': None,
                    'cc_gpu': os.environ.get('CC_GPU'), 'cc_browser': os.environ.get('CC_BROWSER') or 'chromium',
                    'trace_max_mb': MAX_MB, 'traces': [], 'states': [], 'end': None}
        self.finished = False
        self.write_env()

    @staticmethod
    def _pwv():
        try:
            from importlib.metadata import version
            return version('playwright')
        except Exception:
            return '?'

    # ---------- 紀錄 ----------
    def event(self, kind, ctx=None, page=None, **kw):
        try:
            rec = {'t': round(time.time(), 3), 'rel': round(time.time() - T0, 2), 'kind': kind, 'ctx': ctx, 'page': page}
            rec.update(kw)
            with self.lk:
                self.ev.write(json.dumps(san_obj(rec), ensure_ascii=False) + '\n'); self.ev.flush()
        except Exception as e:
            _warn('event not written: %r' % (e,))

    def write_env(self):
        try:
            with open(os.path.join(DIR, 'env.json'), 'w', encoding='utf-8') as fh:
                json.dump(san_obj(self.env), fh, ensure_ascii=False, indent=2)
        except Exception as e:
            _warn('env.json not written: %r' % (e,))

    def on_launch(self, browser, kw):
        try:
            self.env['browser'].append(browser.version)
            self.env['headless'].append(kw.get('headless', True))
            self.write_env()
            browser.on('disconnected', lambda *_: self.event('browser_disconnected'))
        except Exception as e:
            _warn('on_launch: %r' % (e,))

    def find(self, ctx):
        for r in self.ctxs:
            if r['ctx'] is ctx:
                return r
        return None

    def register(self, ctx, is_async):
        r = self.find(ctx)
        if r:
            return r, False
        r = {'ctx': ctx, 'n': len(self.ctxs) + 1, 'async': is_async, 'done': False, 'pages': []}
        self.ctxs.append(r)
        try:
            ctx.on('page', lambda pg: self.watch(r, pg))
        except Exception as e:
            _warn('ctx.on(page): %r' % (e,))
        self.event('context_open', r['n'])
        return r, True

    def watch(self, r, pg):
        for q in r['pages']:
            if q[1] is pg:
                return
        self.npage += 1
        pn = self.npage
        r['pages'].append((pn, pg))
        cn = r['n']
        try:
            def con(m):
                try:
                    if m.type in ('error', 'warning'):
                        loc = m.location or {}
                        self.event('console', cn, pn, level=m.type, text=(m.text or '')[:2000], url=str(loc.get('url', ''))[:300], line=loc.get('lineNumber'))
                except Exception:
                    pass

            def perr(e):
                try:
                    self.event('pageerror', cn, pn, name=getattr(e, 'name', None), message=str(getattr(e, 'message', e))[:2000],
                               stack=(getattr(e, 'stack', None) or '')[:4000])
                except Exception:
                    pass

            def rfail(req):
                try:
                    self.event('requestfailed', cn, pn, url=req.url[:500], method=req.method, type=req.resource_type, failure=str(req.failure)[:300])
                except Exception:
                    pass
            pg.on('console', con)
            pg.on('pageerror', perr)
            pg.on('requestfailed', rfail)
            pg.on('crash', lambda *_: self.event('crash', cn, pn, url=pg.url[:300]))
            pg.on('close', lambda *_: self.event('close', cn, pn, url=pg.url[:300]))
            self.event('page_open', cn, pn, url=pg.url[:300])
        except Exception as e:
            _warn('watch page: %r' % (e,))

    def paths(self, r):
        return (os.path.join(DIR, 'trace_%s_%d.zip' % (ITEM, r['n'])), os.path.join(DIR, 'state_%s_%d.json' % (ITEM, r['n'])))

    def after_stop(self, r, zp, states, err):
        try:
            if states is not None:
                with open(self.paths(r)[1], 'w', encoding='utf-8') as fh:
                    json.dump(san_obj(states), fh, ensure_ascii=False, indent=2)
                self.env['states'].append(os.path.basename(self.paths(r)[1]))
            info = {'ctx': r['n'], 'file': os.path.basename(zp), 'error': err}
            if os.path.exists(zp):
                sz = os.path.getsize(zp)
                info['bytes'] = sz
                info['oversize'] = sz > MAX_MB * 1024 * 1024
            else:
                info['bytes'] = None
            self.env['traces'].append(info)
            self.write_env()
            self.event('trace_saved' if info.get('bytes') else 'trace_missing', r['n'], None, file=info['file'], bytes=info.get('bytes'), error=err)
        except Exception as e:
            _warn('after_stop: %r' % (e,))

    # ---------- async ----------
    async def a_start(self, ctx):
        r, new = self.register(ctx, True)
        if new:
            try:
                await ctx.tracing.start(**TRACE_OPTS)
            except Exception as e:
                _warn('tracing.start failed: %r' % (e,))
        return r

    async def a_flush(self, r, why):
        if r['done']:
            return
        r['done'] = True
        zp, _ = self.paths(r)
        states = {'why': why, 'pages': []}
        for pn, pg in list(r['pages']):
            try:
                if pg.is_closed():
                    states['pages'].append({'page': pn, 'closed': True}); continue
                st = await asyncio.wait_for(pg.evaluate(STATE_JS), 8)
                if self.env['gpu_renderer'] is None:
                    self.env['gpu_renderer'] = await asyncio.wait_for(pg.evaluate(GPU_JS), 8)
                states['pages'].append({'page': pn, 'state': st})
            except Exception as e:
                states['pages'].append({'page': pn, 'error': repr(e)[:300]})
        err = None
        try:
            await asyncio.wait_for(r['ctx'].tracing.stop(path=zp), 90)
        except Exception as e:
            err = repr(e)[:300]
            _warn('tracing.stop failed (%s): %s' % (why, err))
        self.after_stop(r, zp, states, err)

    async def a_flush_all(self, why, ctxs=None):
        for r in list(self.ctxs):
            if r['async'] and (ctxs is None or r['ctx'] in ctxs):
                try:
                    await self.a_flush(r, why)
                except Exception as e:
                    _warn('flush: %r' % (e,))

    # ---------- sync ----------
    def s_start(self, ctx):
        r, new = self.register(ctx, False)
        if new:
            try:
                ctx.tracing.start(**TRACE_OPTS)
            except Exception as e:
                _warn('tracing.start failed: %r' % (e,))
        return r

    def s_flush(self, r, why):
        if r['done']:
            return
        r['done'] = True
        zp, _ = self.paths(r)
        states = {'why': why, 'pages': []}
        for pn, pg in list(r['pages']):
            try:
                if pg.is_closed():
                    states['pages'].append({'page': pn, 'closed': True}); continue
                st = pg.evaluate(STATE_JS)         # sync API 沒有逾時可設：頁面卡死時這裡會等到 runner 的 timeout
                if self.env['gpu_renderer'] is None:
                    self.env['gpu_renderer'] = pg.evaluate(GPU_JS)
                states['pages'].append({'page': pn, 'state': st})
            except Exception as e:
                states['pages'].append({'page': pn, 'error': repr(e)[:300]})
        err = None
        try:
            r['ctx'].tracing.stop(path=zp)
        except Exception as e:
            err = repr(e)[:300]
            _warn('tracing.stop failed (%s): %s' % (why, err))
        self.after_stop(r, zp, states, err)

    def s_flush_all(self, why, ctxs=None):
        for r in list(self.ctxs):
            if not r['async'] and (ctxs is None or r['ctx'] in ctxs):
                try:
                    self.s_flush(r, why)
                except Exception as e:
                    _warn('flush: %r' % (e,))

    # ---------- 結束 ----------
    def finish(self, why):
        if self.finished:
            return
        self.finished = True
        try:
            left = [r['n'] for r in self.ctxs if not r['done']]
            if left:
                self.event('unflushed_contexts', None, None, ctxs=left, why=why)   # 程序結束時 context 還沒存（瀏覽器已經沒了、或 event loop 已關）
            self.env['end'] = why
            self.env['seconds'] = round(time.time() - T0, 1)
            self.event('process_end', None, None, why=why)
            self.write_env()
            self.ev.close()
        except Exception as e:
            _warn('finish: %r' % (e,))


class FailTee(object):
    """探針印的 FAIL 行同時記到 events.jsonl（有時間），report 才分得出「先 FAIL 還是先當掉」"""
    def __init__(self, s, tr):
        self.s, self.tr, self.part = s, tr, ''

    def write(self, t):
        n = self.s.write(t)
        try:
            self.part += str(t)
            while '\n' in self.part:
                line, self.part = self.part.split('\n', 1)
                if line.startswith('FAIL'):
                    self.tr.event('fail_line', None, None, text=line[:300])
        except Exception:
            pass
        return n

    def flush(self):
        return self.s.flush()

    def __getattr__(self, k):
        return getattr(self.s, k)


def install():
    tr = Tracer()
    from playwright.async_api._generated import Browser as AB, BrowserContext as AC, BrowserType as ABT
    from playwright.sync_api._generated import Browser as SB, BrowserContext as SC, BrowserType as SBT
    from playwright.async_api import _context_manager as acm
    from playwright.sync_api import _context_manager as scm

    # launch（包在 gpu_wrap 的 launch 外面）
    a_launch = ABT.launch
    async def launch(self, *a, **kw):
        b = await a_launch(self, *a, **kw); tr.on_launch(b, kw); return b
    ABT.launch = launch
    s_launch = SBT.launch
    def slaunch(self, *a, **kw):
        b = s_launch(self, *a, **kw); tr.on_launch(b, kw); return b
    SBT.launch = slaunch

    # new_context／new_page
    a_nc = AB.new_context
    async def new_context(self, *a, **kw):
        ctx = await a_nc(self, *a, **kw); await tr.a_start(ctx); return ctx
    AB.new_context = new_context
    a_np = AB.new_page
    async def new_page(self, *a, **kw):
        pg = await a_np(self, *a, **kw)
        try:
            r = await tr.a_start(pg.context); tr.watch(r, pg)
        except Exception as e:
            _warn('new_page: %r' % (e,))
        return pg
    AB.new_page = new_page
    s_nc = SB.new_context
    def snew_context(self, *a, **kw):
        ctx = s_nc(self, *a, **kw); tr.s_start(ctx); return ctx
    SB.new_context = snew_context
    s_np = SB.new_page
    def snew_page(self, *a, **kw):
        pg = s_np(self, *a, **kw)
        try:
            r = tr.s_start(pg.context); tr.watch(r, pg)
        except Exception as e:
            _warn('new_page: %r' % (e,))
        return pg
    SB.new_page = snew_page

    # close 前先存
    a_cc = AC.close
    async def ctx_close(self, *a, **kw):
        await tr.a_flush_all('context.close', [self]); return await a_cc(self, *a, **kw)
    AC.close = ctx_close
    a_bc = AB.close
    async def br_close(self, *a, **kw):
        await tr.a_flush_all('browser.close', list(self.contexts)); return await a_bc(self, *a, **kw)
    AB.close = br_close
    s_cc = SC.close
    def sctx_close(self, *a, **kw):
        tr.s_flush_all('context.close', [self]); return s_cc(self, *a, **kw)
    SC.close = sctx_close
    s_bc = SB.close
    def sbr_close(self, *a, **kw):
        tr.s_flush_all('browser.close', list(self.contexts)); return s_bc(self, *a, **kw)
    SB.close = sbr_close

    # async_playwright()／sync_playwright() 結束（探針在 async with 裡 sys.exit、或沒關瀏覽器）
    a_exit = acm.PlaywrightContextManager.__aexit__
    async def aexit(self, *a):
        try:
            await tr.a_flush_all('playwright exit%s' % (' (%s)' % a[0].__name__ if a and a[0] else ''))
        except Exception as e:
            _warn('aexit flush: %r' % (e,))
        return await a_exit(self, *a)
    acm.PlaywrightContextManager.__aexit__ = aexit
    s_exit = scm.PlaywrightContextManager.__exit__
    def sexit(self, *a):
        try:
            tr.s_flush_all('playwright exit%s' % (' (%s)' % a[0].__name__ if a and a[0] else ''))
        except Exception as e:
            _warn('exit flush: %r' % (e,))
        return s_exit(self, *a)
    scm.PlaywrightContextManager.__exit__ = sexit

    try:
        sys.stdout = FailTee(sys.stdout, tr)
    except Exception:
        pass
    atexit.register(lambda: tr.finish('atexit'))
    _warn('CC_TRACE on: %s' % san(DIR))
    return tr
