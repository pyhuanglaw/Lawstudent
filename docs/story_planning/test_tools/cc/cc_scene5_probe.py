"""CC-B（帳號 B）11-07：BB-B 19:08 派工——公館燒臘（noodle）、頁間書屋（bookstore）光照（LAWWW2-B 09bbfefe2 → LAWWW-B f7444d194；測 9c0120628；對照 e647887c7 烘之前）。D120 由 BB 判。
TAG＝before｜after（同一支探針在兩個版本各跑一次，同機位）。PART＝shaola,yejian（預設兩間）。【前置／捷徑】讀檔進店（條件事件關閉），2025-10-18 週六。
每間 14:00、21:00 各拍（新 CAM，固定機位）：door＝進門第一個畫面、top＝全店俯視、seat＝坐下的位置（燒臘用餐桌、頁間書屋窗邊吧台）、out＝往門外窗外、clerk＝店員／人物站的地方
另外印：材質數、接了光照貼圖的材質數、用哪幾張、有沒有第二套 UV（uv1）的網格數、白色（貼圖沒載到）材質數、載入失敗（CHAR／ASSETS failures）。
判定＝BB（雲端只判功能：黑、空、斑；顏色等 PC）。用法：LW_TESTS=<wt>/tests TAG=after python3 cc_scene5_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests'))
sys.path.insert(0, HERE)
import playlib as L
import cc_det
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]
J = D.J
TAG = os.environ.get('TAG') or 'x'
PARTS = [p_ for p_ in (os.environ.get('PART') or 'shaola,yejian').split(',') if p_]
R = L.Run('scene5_' + TAG, OUT); D.setup(R, OUT)
DAY = '2025-10-18'
VIEWS = {
    'shaola': ('noodle', [('door', [0.0, 1.6, 6.0], [0.0, 1.0, -5.0], 18), ('top', [0.0, 8.5, 1.0], [0.0, 0.0, -0.5], 16), ('seat', [-0.6, 1.4, 3.6], [-2.1, 0.6, 1.6], 22),
                          ('out', [0.4, 1.5, 1.2], [0.0, 1.4, 8.0], 20), ('clerk', [0.0, 1.6, 0.4], [2.4, 1.2, 0.6], 24)]),
    'yejian': ('bookstore', [('door', [-4.6, 1.6, 4.4], [2.0, 1.0, -4.0], 18), ('top', [0.0, 9.0, 1.0], [0.0, 0.0, -0.5], 16), ('seat', [0.2, 1.5, 1.8], [0.2, 0.8, 4.05], 22),
                              ('out', [0.5, 1.6, 2.2], [1.0, 1.4, 8.0], 20), ('clerk', [-1.0, 1.6, 0.5], [-3.5, 1.2, -3.0], 20)]),
}
INFO = r"""(()=>{ const z=GAME.E.zone; let n=0, lm=0, uv1=0, white=0, meshes=0; const maps=new Set(), views=[];
  z.group.traverse(o=>{ if(/VIEW/i.test(o.name||'')) views.push({n:o.name, vis:o.visible}); if(!o.isMesh) return; meshes++; if(o.geometry&&o.geometry.attributes&&o.geometry.attributes.uv1) uv1++;
    for(const m of [].concat(o.material)){ if(!m) continue; n++; if(m.lightMap){ lm++; maps.add(((m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src))||m.lightMap.name||'?').split('/').pop()); }
      if(m.isMeshStandardMaterial&&!m.map&&m.color&&m.color.r>0.97&&m.color.g>0.97&&m.color.b>0.97) white++; } });
  const fails=(typeof CHAR!=='undefined'&&CHAR.failures)?CHAR.failures.slice(0,5):null; const af=(typeof ASSETS!=='undefined'&&ASSETS.failed)?Object.keys(ASSETS.failed).slice(0,8):null;
  return {meshes, mats:n, withLightMap:lm, maps:[...maps], uv1Meshes:uv1, whiteNoTexMats:white, views:views.slice(0,6), charFailures:fails, assetFailed:af, glb:z.formal||z.formalInfo||null}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 燒臘、頁間書屋光照（%s）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'tag': TAG, 'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for part in PARTS:
                zone, views = VIEWS[part]
                for tn, h in (('1400', 14.0), ('2100', 21.0)):
                    tag = '[%s %s %s]' % (TAG, part, tn)
                    try:
                        R.setup('%s 讀檔 %s %s %.1f（條件事件關閉）' % (tag, zone, DAY, h))
                        s = await D.load_zone(pg, cdp, zone, DAY, h, wait=9000)
                        if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): continue
                        await pg.wait_for_timeout(3000)
                        info = await pg.evaluate(INFO); R.note('%s 材質／光照貼圖：%s' % (tag, J(info)))
                        r = rec.setdefault(part, {}).setdefault(tn, {'info': info})
                        for nm, eye, look, lens in views:
                            r[nm] = await D.user_shot(pg, cdp, 's5_%s_%s_%s_%s' % (TAG, part, tn, nm), {'eye': eye, 'look': look, 'lens': lens})
                    except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'scene5_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1, default=str)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
