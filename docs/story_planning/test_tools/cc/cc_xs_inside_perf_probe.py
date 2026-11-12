"""CC-C 11-12：SHOP-REAL-INSIDE-1112 效能（LAWWW-C 07:18 P0；開發分支 f8a00372bb＝新生南路五間店外玻璃後面直接放走進去的那顆室內模型；對照 5f03f455e2 同一點）。判定歸 LAWWW／LAWWW2／BB，這支只量數字。
做法（新生南路 xinsheng 14:00；【前置／捷徑】讀檔到新生南路出生點，條件事件關掉）：
  門＝新生南路的出口互動點裡 to 是 A、B 兩間（預設 xs_dabu、xs_haopai，相鄰）；中間點＝兩個門的中點往馬路那一側找站得住的點；遠點＝沿街離中間點 ≥FAR m、站得住的點（16 個方向找最遠）。
  ① 站在遠點 5 秒（基準）→ 照玩家走到中間點（go_to：點地＋搖桿；全程記每一幀）→ 第一次走近那一段最長的一幀（②）→ 在中間點站 5 秒：fps、draw call、三角形、貼圖數（①）
  ③ 走回遠點，站 5 秒：貼圖數、draw call 有沒有降回去
  ④ 再來回兩趟（共三趟）：每趟到中間點、回遠點各記一次 heap（GC 後）、貼圖數、物件數
輸出：xsperf_<TAG>.json＋run.log 總表。PC GPU 無視窗（config）；SOLO 跑。Windows＋GPU ≠ 使用者那台。
CC_02 清單 2026-11-12：1✓（新生南路 14:00、店開著；SHA 由佇列給） 2✓（門、站點全從遊戲讀：出口互動點、E.canStand） 3✓（中間點、遠點都依序找第一個站得住的） 4n/a（不按任何按鈕，只走路） 5✓（go_to 分段走、到不了記位置） 6✓（讀檔後等 8 秒、每站停 5 秒再量） 7✓ 8n/a（不判快慢；數字交 LAWWW） 9n/a（不截圖判畫面） 10n/a（條件事件關掉、沒有選單） 11✓ 12✓（記真的走到的位置和距離） 13✓（每段記走了幾秒、到了沒）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [PAIR=xs_dabu,xs_haopai FAR=45 TRIPS=3] python3 cc_xs_inside_perf_probe.py <url> <out>"""
import os, sys, json, asyncio, math, time
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; SHA = os.environ.get('SHA') or ''
PAIR = (os.environ.get('PAIR') or 'xs_dabu,xs_haopai').split(',')
FAR = float(os.environ.get('FAR') or '45'); TRIPS = int(os.environ.get('TRIPS') or '3')
R = L.Run('xsperf_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-10-22'

EXITS = r"""(()=>GAME.E.interactables.filter(i=>i.exit&&!i.hidden).map(i=>({label:i.label, to:i.exit.to, x:+i.x.toFixed(2), z:+i.z.toFixed(2)})))()"""
FIND = r"""((a)=>{ const E=GAME.E, lv=0; const ok=(x,z)=>E.canStand(x,z,0.35,lv);
  const mx=(a.d1.x+a.d2.x)/2, mz=(a.d1.z+a.d2.z)/2; const P=E.player.obj.position; let mid=null;
  const dx=P.x-mx, dz=P.z-mz, dl=Math.hypot(dx,dz)||1;
  for(let s=0; s<=6 && !mid; s+=0.25){ for(const sg of [1,-1]){ const x=mx+dx/dl*s*sg, z=mz+dz/dl*s*sg; if(ok(x,z)){ mid={x:+x.toFixed(2), z:+z.toFixed(2)}; break; } } }
  if(!mid) return {err:'中間點附近站不住', mx, mz};
  let far=null; for(let k=0;k<16;k++){ const an=k*Math.PI/8, ux=Math.sin(an), uz=Math.cos(an); let last=null; for(let s=1;s<=80;s+=1){ const x=mid.x+ux*s, z=mid.z+uz*s; if(!ok(x,z)) break; last={x:+x.toFixed(2), z:+z.toFixed(2), d:s}; } if(last&&(!far||last.d>far.d)) far=last; }
  return {mid, far}; })"""
MET = r"""(()=>{ const E=GAME.E, i=E.renderer.info; let objs=0; E.scene.traverse(()=>objs++); const pm=performance.memory;
  return {calls:i.render.calls, tris:i.render.triangles, tex:i.memory.textures, geoms:i.memory.geometries, programs:i.programs?i.programs.length:null, objs, heapMB:pm?+(pm.usedJSHeapSize/1048576).toFixed(1):null}; })()"""
REC_ON = r"""(()=>{ window.__xp={t:[]}; window.__xpOn=true; let last=null; const f=t=>{ if(!window.__xpOn) return; if(last!=null) window.__xp.t.push(+(t-last).toFixed(2)); last=t; requestAnimationFrame(f); }; requestAnimationFrame(f); return true; })()"""
REC_OFF = "(()=>{ window.__xpOn=false; return window.__xp.t; })()"


def fstats(t):
    if not t: return {'n': 0}
    q = sorted(t); n = len(q); tot = sum(t) / 1000.0
    return {'n': n, 'fps': round(n / tot, 1) if tot else None, 'p50': q[n // 2], 'p95': q[min(n - 1, int(0.95 * n))], 'max': q[-1], 'gt50': sum(1 for x in t if x > 50)}


async def main():
    print('CC SHOP-REAL-INSIDE 效能：TAG %s；SHA %s；PAIR %s；Windows＋GPU ≠ 使用者那台' % (TAG, SHA or '?', PAIR), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'pair': PAIR}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        s = await D.load_zone(pg, cdp, 'xinsheng', DAY, 14.0, wait=8000)
        R.setup('【前置／捷徑】讀檔到新生南路 %s 14:00（條件事件關掉）' % DAY)
        if not R.check('讀到新生南路', s['zone'] == 'xinsheng', J(s)): await b.close(); sys.exit(1)

        async def gc():
            try: await cdp.send('HeapProfiler.enable'); await cdp.send('HeapProfiler.collectGarbage'); await pg.wait_for_timeout(400)
            except Exception: pass

        async def stand(label, secs=5):
            await pg.evaluate(REC_ON); await pg.wait_for_timeout(int(secs * 1000)); t = await pg.evaluate(REC_OFF)
            await gc(); m = await pg.evaluate(MET); st = fstats(t); R.note('%s 站 %d 秒：%s；%s' % (label, secs, J(st), J(m))); return {'frames': st, 'm': m}

        async def walk(label, x, z):
            await pg.evaluate(REC_ON); t0 = time.time()
            ok = await L.go_to(pg, cdp, R, x, z, 0.8, label, max_s=120)
            t = await pg.evaluate(REC_OFF); st = fstats(t)
            me = await D.st(pg); R.note('%s（%.1f 秒，到了=%s，位置 %s,%s）每幀：%s' % (label, time.time() - t0, ok, me['x'], me['z'], J(st)))
            return {'ok': bool(ok), 'frames': st, 'raw_max_idx': t.index(max(t)) if t else None}

        exs = await pg.evaluate(EXITS); d1 = next((e for e in exs if e['to'] == PAIR[0]), None); d2 = next((e for e in exs if e['to'] == PAIR[1]), None)
        if not R.check('新生南路有 %s、%s 兩個門' % (PAIR[0], PAIR[1]), bool(d1 and d2), J(exs)): await b.close(); sys.exit(1)
        pts = await pg.evaluate(FIND, {'d1': d1, 'd2': d2}); res['points'] = pts; res['doors'] = [d1, d2]
        if not R.check('找得到中間點和遠點（≥%d m）' % FAR, bool(pts.get('mid') and pts.get('far') and pts['far']['d'] >= FAR * 0.6), J(pts)): await b.close(); sys.exit(1)
        R.note('門 %s；中間點 %s；遠點 %s（離中間點 %s m）' % (J([d1, d2]), J(pts['mid']), J(pts['far']), pts['far']['d']))
        mid, far = pts['mid'], pts['far']
        R.setup('【前置／捷徑】先讀檔站到遠點（不量讀檔那一下）')
        s = await D.load_zone(pg, cdp, 'xinsheng', DAY, 14.0, x=far['x'], z=far['z'], wait=8000)
        await pg.wait_for_timeout(2000)
        res['far0'] = await stand('① 遠點（基準）')
        res['trips'] = []
        for k in range(TRIPS):
            tr = {'k': k + 1}
            tr['walk_in'] = await walk('②／④ 第 %d 趟走到中間點' % (k + 1), mid['x'], mid['z'])
            tr['mid'] = await stand('① 第 %d 趟中間點（兩間室內都載入）' % (k + 1))
            tr['walk_out'] = await walk('③／④ 第 %d 趟走回遠點' % (k + 1), far['x'], far['z'])
            await pg.wait_for_timeout(1500)
            tr['far'] = await stand('③ 第 %d 趟回到遠點' % (k + 1))
            res['trips'].append(tr)
        t1 = res['trips'][0]
        R.note('【總表】第一次走近最長一幀 %s ms（>50 ms %s 次）；中間點 fps %s、calls %s、tris %s、tex %s；遠點基準 tex %s → 第一趟回遠點 tex %s；三趟回遠點 heap %s、tex %s、objs %s' % (
            t1['walk_in']['frames'].get('max'), t1['walk_in']['frames'].get('gt50'), t1['mid']['frames'].get('fps'), t1['mid']['m']['calls'], t1['mid']['m']['tris'], t1['mid']['m']['tex'],
            res['far0']['m']['tex'], t1['far']['m']['tex'], [x['far']['m']['heapMB'] for x in res['trips']], [x['far']['m']['tex'] for x in res['trips']], [x['far']['m']['objs'] for x in res['trips']]))
        R.check('三趟都真的走到中間點、走回遠點', all(x['walk_in']['ok'] and x['walk_out']['ok'] for x in res['trips']), J([[x['walk_in']['ok'], x['walk_out']['ok']] for x in res['trips']]))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'xsperf_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
