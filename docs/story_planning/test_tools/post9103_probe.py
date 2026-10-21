"""BB（帳號 A）2026-10-21：v9.10.3 發布後合進開發分支的三件畫面（#147；LAWWW 18:4x「BB 驗收排在 BB 佇列」）：
  GRADE＝GRADE-GOLDEN-DEFAULT（LAWWW2 723d49a4 → 6d49e79c）：黃昏調色預設就開。同一個鏡頭，預設（golden）和 ?grade=off（原本的黃昏）在 13:00／17:30／18:15／21:00 各拍一張，量整張的平均亮度和顏色：白天、晚上兩種應該一樣，只有黃昏不同。
  CAM203＝BUG-CAM-203-R2-1021（LAWWW2 58fb6115）：大一 203 站在 R2 書桌旁 (1.0, 0.25)，鏡頭轉到東、南（原本被 R2 上鋪床架、浴室磁磚牆整個擋住）。
  BIKES＝PERF-CAMPUS-SHADOW 的停車分區合併（LAWWW2 49b26ecb）：校園停著的腳踏車 40 m 一區合併、鏡頭 45 m 外整區不畫——看近處還在、離開時在哪裡消失。
【前置】讀使用者 9/25 存檔，改時間、區域（quiet_events）。【捷徑】GRADE 換時段用 GAME.G.hour＋E.applyTime（不是玩到那個時間）；鏡頭只動鏡頭。
畫面都是 READY_FOR_ART_REVIEW：場景美術只有使用者能標 ART_APPROVED，這裡只記看到什麼。Playwright 手機橫向模擬、?turbo，不是 iPhone。
用法：LW_TESTS=<開發分支>/tests SCEN=GRADE,CAM203,BIKES python3 post9103_probe.py '<URL>/index.html?turbo' <輸出資料夾> <存檔.json>"""
import os, sys, json, asyncio, math, io
sys.path.insert(0, os.environ['LW_TESTS']); import playlib as L
from playwright.async_api import async_playwright
from PIL import Image, ImageStat
URL, OUT, SAVE = sys.argv[1], sys.argv[2], sys.argv[3]
def say(*a): print(' '.join(str(x) for x in a), flush=True)


async def fresh(p, run, base, zone, h, pos=None, url=None, label=''):
    b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
    await pg.goto(url or URL); await L.wait_loaded(pg); await pg.evaluate("localStorage.clear()")
    st = json.loads(json.dumps(base)); G = st.get('G', st); G.update({'hour': h, 'zone': zone, 'pos': pos})
    await L.load_state(pg, G, quiet_events=True); await pg.wait_for_timeout(9000)
    run.setup('[前置] %s：使用者 9/25 存檔改到 %s %.2f（quiet_events）%s' % (label, zone, h, '；' + (url or URL).split('?', 1)[-1] if url else ''))
    return b, pg, cdp, errs


async def shot_stats(pg, run, name):
    png = await pg.screenshot(); im = Image.open(io.BytesIO(png)).convert('RGB')
    W, H = im.size; core = im.crop((int(W * 0.12), int(H * 0.30), int(W * 0.88), int(H * 0.92)))   # 避開上面的 HUD 和左下的搖桿
    s = ImageStat.Stat(core); m = [round(v, 1) for v in s.mean]
    await run.shot(pg, name); return {'mean': m, 'lum': round(0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2], 1)}


async def grade(p, run, base, out):
    views = {'campus': ([-62, 1.7, 0.0], [20, 5.0, 0.0]), 'wenzhou': None, 'gongguan': None}
    res = out.setdefault('GRADE', {})
    for zone in ('campus', 'wenzhou', 'gongguan'):
        for g in ('golden', 'off'):
            url = URL if g == 'golden' else URL + ('&' if '?' in URL else '?') + 'grade=off'
            b, pg, cdp, errs = await fresh(p, run, base, zone, 13.0, url=url, label='GRADE %s %s' % (zone, g))
            try:
                eg = await pg.evaluate("GAME.E.grade"); res.setdefault(zone, {})[g] = {'E.grade': eg}
                v = views.get(zone)
                if v: await pg.evaluate("(([c,l])=>{ GAME.E.cinematic(new THREE.Vector3(...c), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps(list(v)))
                else: await pg.evaluate("(()=>{ const C=GAME.E.cam; C.yaw=0.6; C.manualT=600; })()")
                for h in (13.0, 17.5, 18.25, 21.0):
                    await pg.evaluate("(h=>{ GAME.G.hour=h; GAME.E.applyTime(h); })(%s)" % h); await pg.wait_for_timeout(2500)
                    r = await shot_stats(pg, run, 'GRADE_%s_%s_%02d%02d' % (zone, g, int(h), int(round((h % 1) * 60))))
                    res[zone][g]['%.2f' % h] = r; say('   %s %s %.2f：%s' % (zone, g, h, r))
                res[zone][g]['errs'] = errs[:2]
            except Exception as e: res.setdefault(zone, {})[g] = {'err': str(e)[:200]}; say('   ! 例外', e)
            try: await asyncio.wait_for(b.close(), 30)
            except Exception: pass
        Z = res.get(zone, {}); a, o = Z.get('golden', {}), Z.get('off', {})
        if '13.00' in a and '13.00' in o:
            d = {h: round(abs(a[h]['lum'] - o[h]['lum']), 1) for h in ('13.00', '17.50', '18.25', '21.00') if h in a and h in o}
            run.check('GRADE %s：預設是 golden、?grade=off 是原本的（E.grade）' % zone, a.get('E.grade') == 'golden' and o.get('E.grade') != 'golden', json.dumps({'golden': a.get('E.grade'), 'off': o.get('E.grade')}))
            run.check('GRADE %s：白天 13:00、晚上 21:00 兩種一樣（平均亮度差 < 3）；黃昏 17:30／18:15 不同' % zone, d.get('13.00', 99) < 3 and d.get('21.00', 99) < 3 and max(d.get('17.50', 0), d.get('18.25', 0)) >= 3, json.dumps(d))


async def cam203(p, run, base, out):
    res = out.setdefault('CAM203', {})
    b, pg, cdp, errs = await fresh(p, run, base, 'dorm', 21.0, label='CAM203 大一 203 21:00')
    try:
        ok = await L.go_to(pg, cdp, run, 1.0, 0.25, 0.35, 'R2 書桌旁', max_s=150); res['reached'] = ok
        P = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z]; })()"); res['pos'] = P
        for name, yaw in (('east', math.pi / 2), ('south', 0.0), ('west', -math.pi / 2), ('north', math.pi)):
            await pg.evaluate("(y=>{ const C=GAME.E.cam; C.yaw=y; C.manualT=60; })(%s)" % yaw); await pg.wait_for_timeout(3500)
            c = await pg.evaluate("""(()=>{ const E=GAME.E, C=E.cam, cam=E.camera||E.cam.camera, P=E.player.obj.position; const cp=cam?cam.position:null;
              const head=new THREE.Vector3(P.x,(P.y||0)+1.55,P.z); let onScreen=null, blocked=null;
              if(cam){ const v=head.clone().project(cam); onScreen=Math.abs(v.x)<1&&Math.abs(v.y)<1&&v.z<1;
                try{ const ray=new THREE.Raycaster(cp.clone(), head.clone().sub(cp).normalize(), 0.05, head.distanceTo(cp)-0.25); const hits=ray.intersectObjects(E.scene.children,true).filter(h=>h.object.visible&&h.object.material&&!(h.object.material.transparent&&h.object.material.opacity<0.5)); let pl=false; for(let o=hits[0]&&hits[0].object;o;o=o.parent) if(o===E.player.obj) pl=true; blocked=hits.length&&!pl?(hits[0].object.name||hits[0].object.type)+'@'+hits[0].distance.toFixed(2):null; }catch(e){ blocked='ERR '+e; } }
              return {yaw:+C.yaw.toFixed(2), cam:cp?[+cp.x.toFixed(2),+cp.y.toFixed(2),+cp.z.toFixed(2)]:null, dist:cp?+cp.distanceTo(head).toFixed(2):null, headOnScreen:onScreen, blockedBy:blocked}; })()""")
            r = await shot_stats(pg, run, 'CAM203_%s' % name); c.update(r); res[name] = c; say('   203 R2 %s：%s' % (name, json.dumps(c, ensure_ascii=False)))
        for name in ('east', 'south'):
            c = res.get(name, {})
            run.check('CAM203 %s：站在 R2 書桌旁，鏡頭轉到%s，看得到祐廷的頭、中間沒有東西整個擋住' % (name, {'east': '東', 'south': '南'}[name]), bool(c.get('headOnScreen')) and not c.get('blockedBy'), json.dumps(c, ensure_ascii=False)[:300])
        run.check('CAM203：走得到 R2 書桌旁', ok, json.dumps(P))
        res['errs'] = errs[:2]
    except Exception as e: res['err'] = str(e)[:200]; say('   ! 例外', e)
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def bikes(p, run, base, out):
    res = out.setdefault('BIKES', {})
    b, pg, cdp, errs = await fresh(p, run, base, 'campus', 13.0, label='BIKES 校園 13:00')
    try:
        info = await pg.evaluate("""(()=>{ const z=GAME.E.zone, B=z&&z.parkedBikes; if(!B) return null; return {n:B.chunks.length, chunks:B.chunks.map(c=>{ const ct=c.box.getCenter(new THREE.Vector3()), s=c.box.getSize(new THREE.Vector3()); return {c:[+ct.x.toFixed(1),+ct.z.toFixed(1)], size:[+s.x.toFixed(1),+s.z.toFixed(1)], vis:c.o.visible}; })}; })()""")
        res['info'] = info; say('   停車分區：%s' % json.dumps(info, ensure_ascii=False)[:600])
        run.check('BIKES：校園有停車分區（zone.parkedBikes）', bool(info) and info['n'] > 0, json.dumps(info, ensure_ascii=False)[:200])
        if info and info['n']:
            P = await pg.evaluate("(()=>{ const o=GAME.E.player.obj.position; return [o.x,o.z]; })()")
            ch = sorted(info['chunks'], key=lambda c: (c['c'][0] - P[0]) ** 2 + (c['c'][1] - P[1]) ** 2)[:2]
            for i, c in enumerate(ch):
                for dist in (12, 30, 44, 50):   # 從分區的外框往外 dist m（遊戲是看鏡頭到外框的距離，45 m 外不畫）
                    cam = [c['c'][0] + c['size'][0] / 2 + dist, 3.0, c['c'][1]]; look = [c['c'][0], 0.6, c['c'][1]]
                    await pg.evaluate("(([c,l])=>{ GAME.E.cinematic(new THREE.Vector3(...c), new THREE.Vector3(...l)); GAME.E.snapCinematic(); })(%s)" % json.dumps([cam, look]))
                    await pg.wait_for_timeout(2500)
                    v = await pg.evaluate("(k=>{ const B=GAME.E.zone.parkedBikes; const cam=GAME.E.camera||GAME.E.cam.camera; const c=B.chunks[k]; return {vis:c.o.visible, d:+(c.box.distanceToPoint(cam.position)).toFixed(1)}; })(%d)" % info['chunks'].index(c))
                    r = await shot_stats(pg, run, 'BIKES_chunk%d_%02dm' % (i, dist)); v.update(r); res['chunk%d_%dm' % (i, dist)] = v
                    say('   分區 %d 從 %d m：%s' % (i, dist, json.dumps(v, ensure_ascii=False)))
            await pg.evaluate("(()=>{ try{ GAME.E.endCinematic(); }catch(e){} })()")
            ok = all(res.get('chunk%d_%dm' % (i, d), {}).get('vis') for i in range(len(ch)) for d in (12, 30, 44)) and not any(res.get('chunk%d_50m' % i, {}).get('vis') for i in range(len(ch)))
            run.check('BIKES：44 m 以內畫、50 m 外整區不畫（照 45 m 的設定）', ok, json.dumps({k: v.get('vis') for k, v in res.items() if k.startswith('chunk')}, ensure_ascii=False))
        res['errs'] = errs[:2]
    except Exception as e: res['err'] = str(e)[:200]; say('   ! 例外', e)
    try: await asyncio.wait_for(b.close(), 30)
    except Exception: pass


async def main():
    run = L.Run('post9103', OUT); base = json.load(open(SAVE, encoding='utf-8')); out = {}
    async with async_playwright() as p:
        for sid in os.environ.get('SCEN', 'CAM203,BIKES,GRADE').split(','):
            say('== %s' % sid)
            await {'GRADE': grade, 'CAM203': cam203, 'BIKES': bikes}[sid](p, run, base, out)
            json.dump(out, open(os.path.join(OUT, 'post9103.json'), 'w'), ensure_ascii=False, indent=1)
    run.finish()
asyncio.run(main())
