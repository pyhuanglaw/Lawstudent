"""CC GG-DOOR-CAMS-1104 ①（BB 10:23：全遊戲行道樹葉片 shader 改了，一出錯整個遊戲都壞——最先跑）：
【前置／捷徑】load_zone 讀檔到 ZONES 各區域（出生點）、白天 14:00 和晚上 20:00，等 10 秒讓模型、shader 載完並畫幾幀；
收集：console 裡的 error／warning 含 shader／WebGL／GLSL／program／THREE.WebGLProgram／compile、pageerror；
畫面：canvas 縮成 64×36 取平均亮度、粉紅比例（r>200、g<90、b>200＝shader 壞掉常見的洋紅）、黑的比例（亮度 <8）。
判：不能有編譯錯誤；畫面不能整片黑（黑 >0.9）或洋紅（>0.05）。每一區截圖一張。Playwright ≠ iPhone。
用法：LW_TESTS=<wt>/tests [ZONES=gongguan,campus,wenzhou,library_hall] TAG=old|new python3 cc_shader_smoke_probe.py <url> <out>"""
import os, sys, json, asyncio, re
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; ZONES = [z for z in (os.environ.get('ZONES') or 'gongguan,campus,wenzhou,library_hall').split(',') if z]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,20').split(',')]
R = L.Run('shader_smoke_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
RX = re.compile(r'shader|webgl|glsl|program|compile|THREE\.WebGL', re.I)
PIX = r"""(()=>{ const E=GAME.E; E.renderer.render(E.scene,E.camera); const c=E.renderer.domElement, w=64, h=36, cv=document.createElement('canvas'); cv.width=w; cv.height=h; const x=cv.getContext('2d'); x.drawImage(c,0,0,w,h);
  const d=x.getImageData(0,0,w,h).data; let s=0, pink=0, black=0, n=0; for(let i=0;i<d.length;i+=4){ const r=d[i],g=d[i+1],b=d[i+2], l=0.299*r+0.587*g+0.114*b; s+=l; n++; if(r>200&&g<90&&b>200) pink++; if(l<8) black++; }
  return {mean:+(s/n).toFixed(1), pink:+(pink/n).toFixed(3), black:+(black/n).toFixed(3), zone:GAME.G.zone, hour:+GAME.G.hour.toFixed(2)}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC shader 冒煙：worktree %s；TAG %s；%s × %s；Playwright ≠ iPhone' % (real or '?', TAG, ZONES, HOURS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        logs = []
        pg.on('console', lambda m: logs.append({'type': m.type, 'text': m.text[:400]}) if m.type in ('error', 'warning') else None)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        n0 = len(logs); bad0 = [l for l in logs if RX.search(l['text'])]
        R.check('標題畫面／載入時沒有 shader／WebGL 錯誤', not [l for l in bad0 if l['type'] == 'error'], J(bad0[:5]))
        for z in ZONES:
            for h in HOURS:
                tag = '%s %.0f 時' % (z, h); k0 = len(logs)
                R.setup('【前置／捷徑】讀檔到 %s 2025-10-18 %.1f 時（出生點）' % (z, h))
                try: s = await D.load_zone(pg, cdp, z, '2025-10-18', h, wait=10000)
                except Exception as e: R.check('%s 讀得進去' % tag, False, repr(e)[:200]); continue
                R.check('%s 讀得進去' % tag, s.get('zone') == z, J(s))
                await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(500)
                px = await pg.evaluate(PIX); await pg.screenshot(path=os.path.join(OUT, 'shader_%s_%s_%02d.png' % (TAG, z, int(h))))
                await pg.evaluate(D.HUD + '(true)')
                new = logs[k0:]; bad = [l for l in new if RX.search(l['text'])]
                R.note('%s 畫面 %s；console error／warning %d 則，其中 shader 類 %d 則：%s' % (tag, J(px), len(new), len(bad), J(bad[:4])))
                R.check('%s 沒有 shader／WebGL 編譯錯誤' % tag, not [l for l in bad if l['type'] == 'error'], J(bad[:4]))
                R.check('%s 畫面不是整片黑、沒有洋紅（黑 %.3f ≤ 0.9、洋紅 %.3f ≤ 0.05）' % (tag, px['black'], px['pink']), px['black'] <= 0.9 and px['pink'] <= 0.05, J(px))
        allbad = [l for l in logs if RX.search(l['text'])]
        json.dump({'shaderLogs': allbad, 'allErrors': [l for l in logs if l['type'] == 'error'][:50], 'pageErrors': errs[:20]}, open(os.path.join(OUT, 'shader_logs_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外（pageerror）', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
