"""CC-B（帳號 B）11-07：LZ-UPPER-LM（LAWWW2-B 10:53；INTERIOR-AAA 霖澤館 3F、4F 光照烘焙，5a2ab6c75，換檔前＝它的上一個 commit）。
  同一支探針在前、後兩版各跑一次（TAG=before／after）。【前置／捷徑】讀檔直接放進 linze_3f／linze_4f（條件事件關閉）。
  玩家跟隨鏡頭（遊戲自己的鏡頭，不是 user_shot），兩個角度：
    elev_south：出電梯那一點 (4.6,−4.9) 面向南（窗那一面）；disc_north：討論區中間 (−2.0, 3.6) 面向北（走廊、301／302 那一面）
  白天 11:00、晚上 20:00。看：桌椅接觸陰影、白天南窗那側較亮、牆和天花板黑斑／接縫／漏光——看圖（LAWWW2 判）。另外印 lightMap 有沒有接上（材質 lightMap 數）。
用法：LW_TESTS=<wt>/tests TAG=before|after python3 cc_linze_lm_probe.py <url> <out>"""
import os, sys, json, asyncio, math
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
R = L.Run('linze_lm_' + TAG, OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-15'
TIMES = [('day', 11.0), ('night', 20.0)]
VIEWS = [('elev_south', 4.6, -4.9, 0.0), ('disc_north', -2.0, 3.6, math.pi)]
LM = r"""(()=>{ const z=GAME.E.zone; let n=0, lm=0, names=new Set(); if(z&&z.group) z.group.traverse(o=>{ if(!o.isMesh) return; n++; for(const m of [].concat(o.material)) if(m&&m.lightMap){ lm++; names.add(((m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src))||m.lightMap.name||'').slice(-40)); } }); return {meshes:n, withLightMap:lm, maps:[...names].slice(0,6)}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC LZ-UPPER-LM（%s）：SHA=%s（worktree 實際 %s）；Playwright ≠ iPhone' % (TAG, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'tag': TAG, 'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL); ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for zone in ('linze_3f', 'linze_4f'):
                for tn, h in TIMES:
                    for nm, x, z, yaw in VIEWS:
                        tag = '[%s %s %s]' % (zone, tn, nm)
                        try:
                            ok_st = None
                            s = await D.load_zone(pg, cdp, zone, DAY, h, x=x, z=z, yaw=yaw, wait=8000)
                            if not R.check('%s 進得了 %s' % (tag, zone), s['zone'] == zone, J(s)): continue
                            await pg.wait_for_timeout(2500)
                            lm = await pg.evaluate(LM)
                            await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(800)
                            m = await D.shot(pg, 'lzlm_%s_%s_%s_%s' % (TAG, zone, tn, nm))
                            await pg.evaluate(D.HUD + '(true)')
                            R.note('%s 站 (%.2f, %.2f)，lightMap：%s；亮度 %s' % (tag, s.get('x', 0), s.get('z', 0), J(lm), J(m)))
                            rec.setdefault(zone, {}).setdefault(tn, {})[nm] = {'pos': [s.get('x'), s.get('z')], 'lm': lm, 'lum': m}
                        except Exception as ex: R.check('%s 探針沒有例外' % tag, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'linze_lm_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
