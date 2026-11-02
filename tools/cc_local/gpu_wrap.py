# -*- coding: utf-8 -*-
"""CC（帳號 A）：在使用者的 Windows 電腦上跑既有探針的包裝（不改開發分支的 tests/playlib.py）。
用法：python tools/cc_local/gpu_wrap.py <探針或測試.py> [參數...]
做的事（只在這個 Python 程序裡，monkeypatch playwright 的 BrowserType.launch）：
  - executable_path 指到不存在的檔（例如雲端的 /opt/pw-browsers/chromium）＝拿掉，改用本機 playwright 裝的 chromium。
  - 拿掉 SwiftShader 參數（--use-angle=swiftshader、--enable-unsafe-swiftshader、--use-gl=swiftshader）。
  - CC_GPU=1（預設）：加 --ignore-gpu-blocklist --use-gl=angle --use-angle=d3d11；預設無視窗（CC_HEADLESS=0 改成有視窗）。使用者電腦實測 d3d11 無視窗仍是 RX 6600M、26.6 fps。
  - CC_GPU=0：只做第一點，其他照原樣。
  - CC_BROWSER=webkit（run_queue.py 的 webkit kind）：探針呼叫 chromium.launch 時改開 webkit.launch，
    拿掉 chromium 專屬參數（args、executable_path、channel、chromium_sandbox）。CC_BROWSER 沒設時，上面的行為完全不變。
  - CC_SLOT＋有視窗（CC_HEADLESS=0）：加 --window-position（槽位 × 920 px 並排）、--window-size（預設 900x900，CC_WINDOW_SIZE=WxH 可改）、
    --window-name=CC 測試中，請勿點選 [<CC_ITEM>]。CC_GPU=0 時也照 CC_HEADLESS（有設才照）。CC_HEADLESS、CC_SLOT 都沒設時行為不變。
    注意：webkit 沒有 CDP，探針若用 ctx.new_cdp_session（playlib 的手機觸控）會在那一步失敗＝探針要另外支援。
"""
import os, re, sys, runpy

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
    elif os.environ.get('CC_HEADLESS') is not None:
        kw['headless'] = os.environ['CC_HEADLESS'] != '0'            # CC_GPU=0 時：有設 CC_HEADLESS 才照它（沒設＝照探針原樣，和以前一樣）
    if os.environ.get('CC_SLOT') is not None and kw.get('headless') is False:
        args = args + window_args()
    kw['args'] = args
    return kw

def window_args():
    """run_queue.py 並行時，有視窗的瀏覽器照槽位並排、固定大小，標題註明 CC 測試中（只有 CC_SLOT 有設＋有視窗才加）"""
    try: slot = int(os.environ.get('CC_SLOT', '0'))
    except ValueError: slot = 0
    w, h = 900, 900                       # launch 時還不知道探針的 viewport：900x900 裝得下橫向 844×390、直向 390×844
    m = re.match(r'^(\d+)x(\d+)$', os.environ.get('CC_WINDOW_SIZE', ''))
    if m: w, h = int(m.group(1)), int(m.group(2))
    item = os.environ.get('CC_ITEM', '')
    a = ['--window-position=%d,0' % (slot * (w + 20)), '--window-size=%d,%d' % (w, h),
         '--window-name=CC 測試中，請勿點選 [%s]' % item]
    _diag('headed slot %d: %s' % (slot, ' '.join(a)))
    return a

WEBKIT = os.environ.get('CC_BROWSER', '').strip().lower() == 'webkit'
CHROMIUM_ONLY = ('args', 'executable_path', 'channel', 'chromium_sandbox', 'ignore_default_args')

def webkit_kwargs(kw):
    kw = {k: v for k, v in kw.items() if k not in CHROMIUM_ONLY}
    kw['headless'] = os.environ.get('CC_HEADLESS', '1') != '0'
    return kw

def _webkit_of(bt, sync):
    """同一個 playwright 物件的 webkit BrowserType（公開 API 物件）；只在 CC_BROWSER=webkit 時才 import"""
    if sync:
        from playwright.sync_api._generated import mapping
    else:
        from playwright.async_api._generated import mapping
    return mapping.from_impl(bt._impl_obj._playwright.webkit)

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
            if WEBKIT and self.name == 'chromium':
                _diag('CC_BROWSER=webkit: chromium.launch -> webkit.launch')
                b = await orig(_webkit_of(self, False), *a, **webkit_kwargs(kw))
            else:
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
        def slaunch(self, *a, **kw):
            if WEBKIT and self.name == 'chromium':
                _diag('CC_BROWSER=webkit: chromium.launch -> webkit.launch')
                return sorig(_webkit_of(self, True), *a, **webkit_kwargs(kw))
            return sorig(self, *a, **fix_kwargs(kw))
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
    if WEBKIT:
        print('[gpu_wrap] CC_BROWSER=webkit：chromium.launch 會改開 webkit', flush=True)
    runpy.run_path(script, run_name='__main__')
