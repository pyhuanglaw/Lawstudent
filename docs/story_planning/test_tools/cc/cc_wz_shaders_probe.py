"""CC-B（帳號 B）11-07：WZ_SHADERS（LAWWW-B 11:42，PERF-WZ-DAY-1103）——溫州街 renderer.info.programs 清單。
【前置／捷徑】讀檔進 wenzhou（11:00、20:00 晴，條件事件關閉），等淡入、再穩定 5 秒（遊戲照常、跟隨鏡頭），然後印：
  每個 program 的 name、cacheKey（前 200 字）、usedTimes、id，和總數；另外照 name 分組計數、照材質 type 統計（場景裡每個網格的 material.type、name 也列一份，對得到哪個模型）。
給 LAWWW2 從模型端合併材質用。Playwright ≠ iPhone；PC 是 d3d11。
用法：LW_TESTS=<wt>/tests python3 cc_wz_shaders_probe.py <url> <out>"""
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
R = L.Run('wz_shaders', OUT); D.setup(R, OUT)
DAY = os.environ.get('DAY') or '2025-10-18'
TIMES = [('day', 11.0), ('night', 20.0)]   # LAWWW2-B 11:43：白天 11:00、晚上 20:00；白天那一次是開遊戲後第一次進溫州街（冷啟動，和 PERF_COLD base 一樣）
ZONE = os.environ.get('ZONE') or 'wenzhou'

PROGS = r"""(()=>{ const E=GAME.E; const r=E.renderer, P=r.info.programs.map(p=>({id:p.id,name:p.name,used:p.usedTimes,key:p.cacheKey})), M=[];
  E.scene.traverse(o=>{ if(!o.material) return; let g=o, top=''; while(g){ if(/_glb$|^human$/.test(g.name||'')) top=g.name; g=g.parent; }
    for(const m of [].concat(o.material)){ const pr=r.properties.get(m), cp=pr&&pr.currentProgram;
      M.push({obj:o.name,glb:top,mat:m.name,type:m.type,prog:cp?cp.id:null,inst:!!o.isInstancedMesh,skin:!!o.isSkinnedMesh,vis:o.visible,recv:o.receiveShadow,cast:o.castShadow,side:m.side,tr:m.transparent,at:m.alphaTest,vc:m.vertexColors}); } });
  const perf=(typeof PERFPANEL!=='undefined'&&PERFPANEL.log)?PERFPANEL.log.slice(0,3).map(x=>{ try{ return PERFPANEL.line(x); }catch(e){ return String(e); } }):null;
  return {zone:E.zone&&(E.zone.id||(E.zone.def&&E.zone.def.id)), hour:GAME.G.hour, programs:P, mats:M, perf}; })()"""   # LAWWW2-B 11:43 給的格式（E→GAME.E），加 PERFPANEL 最近三筆


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC WZ_SHADERS（%s shader 清單）：SHA=%s（worktree 實際 %s）' % (ZONE, os.environ.get('SHA', '?'), real or '?'), flush=True)
    rec = {'sha': real, 'zone': ZONE}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261107)
        await pg.goto(URL + ('&' if '?' in URL else '?') + 'perf')   # ?perf＝PERFPANEL 記換區域（shader 黑畫面 +N、淡入後 +N）
        ok = await L.wait_loaded(pg)
        if R.check('遊戲載入', ok, ''):
            await pg.evaluate("localStorage.clear()")
            for tn, h in TIMES:
                try:
                    R.setup('[%s] 讀檔 %s %s %.2f（條件事件關閉）；淡入後穩定 5 秒' % (tn, ZONE, DAY, h))
                    s = await D.load_zone(pg, cdp, ZONE, DAY, h, wait=9000)
                    if not R.check('[%s] 進得了 %s' % (tn, ZONE), s['zone'] == ZONE, J(s)): continue
                    await pg.wait_for_timeout(5000)   # 淡入以後穩定 5 秒（LAWWW2-B 11:43）
                    r = await pg.evaluate(PROGS)
                    R.note('[%s] programs 共 %d 個、材質（網格×材質）%d 筆；PERFPANEL：%s' % (tn, len(r['programs']), len(r['mats']), J(r['perf'])))
                    rec[tn] = r
                except Exception as ex: R.check('[%s] 探針沒有例外' % tn, False, repr(ex)[:300])
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'wz_shaders.json'), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
