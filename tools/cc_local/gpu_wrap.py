# -*- coding: utf-8 -*-
"""CC（帳號 A）：在使用者的 Windows 電腦上跑既有探針的包裝（不改開發分支的 tests/playlib.py）。
用法：python tools/cc_local/gpu_wrap.py <探針或測試.py> [參數...]
做的事（只在這個 Python 程序裡，monkeypatch playwright 的 BrowserType.launch）：
  - executable_path 指到不存在的檔（例如雲端的 /opt/pw-browsers/chromium）＝拿掉，改用本機 playwright 裝的 chromium。
  - 拿掉 SwiftShader 參數（--use-angle=swiftshader、--enable-unsafe-swiftshader、--use-gl=swiftshader）。
  - CC_GPU=1（預設）：加 --ignore-gpu-blocklist --use-gl=angle --use-angle=d3d11；預設無視窗（CC_HEADLESS=0 改成有視窗）。使用者電腦實測 d3d11 無視窗仍是 RX 6600M、26.6 fps。
  - CC_GPU=0：只做第一點，其他照原樣。
"""
import os, sys, runpy

GPU = os.environ.get('CC_GPU', '1') == '1'
GPU_ARGS = ['--ignore-gpu-blocklist', '--use-gl=angle', '--use-angle=d3d11', '--enable-gpu-rasterization']
SOFT = ('--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--use-gl=swiftshader', '--use-gl=angle')

def fix_kwargs(kw):
    ep = kw.get('executable_path')
    if ep and not os.path.exists(ep):
        kw.pop('executable_path', None)
    args = [a for a in (kw.get('args') or []) if not (GPU and a in SOFT) and not (a in SOFT[:3])]
    if GPU:
        for a in GPU_ARGS:
            if a not in args: args.append(a)
        kw['headless'] = os.environ.get('CC_HEADLESS', '1') != '0'   # 00_gpu（c2d0c24bc）：d3d11 無視窗 26.6 fps ≥ 有視窗 17.1 fps，而且不會被誤關
    kw['args'] = args
    return kw

import time as _t
_T0 = _t.time()
def _diag(msg):
    sys.stderr.write('[gpu_wrap %.1fs] %s\n' % (_t.time() - _T0, msg)); sys.stderr.flush()

def _watch_page(pg):
    try:
        pg.on('crash', lambda *_: _diag('PAGE CRASH (renderer died) url=%s' % pg.url))
        pg.on('close', lambda *_: _diag('page close url=%s' % pg.url))
        pg.on('pageerror', lambda e: _diag('pageerror %s' % str(e)[:200]))
    except Exception as e:
        _diag('watch failed %r' % e)

def patch():
    try:
        from playwright.async_api._generated import BrowserType as ABT, Browser as AB
        orig = ABT.launch
        async def launch(self, *a, **kw):
            b = await orig(self, *a, **fix_kwargs(kw))
            try: b.on('disconnected', lambda *_: _diag('BROWSER DISCONNECTED'))
            except Exception: pass
            return b
        ABT.launch = launch
        onc = AB.new_context
        async def new_context(self, *a, **kw):
            ctx = await onc(self, *a, **kw); ctx.on('page', _watch_page); return ctx
        AB.new_context = new_context
        onp = AB.new_page
        async def new_page(self, *a, **kw):
            pg = await onp(self, *a, **kw); _watch_page(pg); return pg
        AB.new_page = new_page
    except Exception as e:
        print('[gpu_wrap] async patch 失敗：', e)
    try:
        from playwright.sync_api._generated import BrowserType as SBT
        sorig = SBT.launch
        def slaunch(self, *a, **kw): return sorig(self, *a, **fix_kwargs(kw))
        SBT.launch = slaunch
    except Exception as e:
        print('[gpu_wrap] sync patch 失敗：', e)

if __name__ == '__main__':
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(2)
    patch()
    script = os.path.abspath(sys.argv[1])
    sys.argv = [script] + sys.argv[2:]
    sys.path.insert(0, os.path.dirname(script))
    print('[gpu_wrap] CC_GPU=%s 跑 %s %s' % (int(GPU), script, ' '.join(sys.argv[1:])), flush=True)
    runpy.run_path(script, run_name='__main__')
