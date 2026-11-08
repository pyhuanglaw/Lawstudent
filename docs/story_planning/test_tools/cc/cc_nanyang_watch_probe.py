"""CC-B（帳號 B）11-08：南洋 1 廳「坐下看電影」的熄燈（BB-B 11:33，XS-LM-1108／LAWWW-B d82db91b5；判定＝BB）。
照玩家：【前置】讀檔到南洋大廳（xs_nanyang）19:00 → 走到爆米花櫃檯按「買票」、選項照第一個非取消的 → 走到 1 廳的入口進去（xs_nanyang_hall）
→ 走到 cinema 座位按坐下（AA_615 STORY.onSeat → S.watch）→ 對話點完。
監看：包住 z.lightsOff 記每一次呼叫（k、遊戲時間）；坐下前、開演（第一次 lightsOff(1)）、演完（之後 lightsOff(0)）各記一次材質上的光照貼圖檔名；
開演那一刻、演完回來各拍一張同機位（固定機位：廳的後方往銀幕看）＋坐下前一張。
用法：LW_TESTS=<wt>/tests [TAG=x] python3 cc_nanyang_watch_probe.py <url> <out>"""
import os, sys, json, asyncio, time
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
R = L.Run('nanyang_watch_' + TAG, OUT); D.setup(R, OUT)
LM = r"""(()=>{ const z=GAME.E.zone, s=new Set(); let n=0; if(z&&z.group) z.group.traverse(o=>{ if(!o.isMesh) return; for(const m of [].concat(o.material)){ if(m&&m.lightMap){ n++; s.add(((m.lightMap.image&&(m.lightMap.image.currentSrc||m.lightMap.image.src))||m.lightMap.name||'?').split('/').pop()); } } }); return {n, maps:[...s].slice(0,8), K:z?(z.lightsOffK==null?null:+z.lightsOffK):null}; })()"""
HOOK = r"""(()=>{ const z=GAME.E.zone; window.__lo=window.__lo||[]; if(!z) return 'no zone'; if(z.__ccLo) return 'already'; if(typeof z.lightsOff!=='function') return 'no lightsOff';
  const o=z.lightsOff; z.lightsOff=function(k){ window.__lo.push({k:+k, h:+(+GAME.G.hour).toFixed(3), ms:Math.round(performance.now())}); return o.apply(this,arguments); }; z.__ccLo=1; return 'hooked'; })()"""
CAM = r"""(()=>{ const z=GAME.E.zone, box=new THREE.Box3(); z.group.traverse(o=>{ if(o.isMesh&&o.visible){ const b=new THREE.Box3().setFromObject(o); const s=b.getSize(new THREE.Vector3()); if(s.x<40&&s.z<40) box.union(b); } });
  const c=box.getCenter(new THREE.Vector3()), P=GAME.E.player.obj.position; const back=Math.abs(P.z-box.max.z)<Math.abs(P.z-box.min.z)?box.max.z:box.min.z, front=back===box.max.z?box.min.z:box.max.z;
  const r=v=>+v.toFixed(2); return {eye:[r(c.x), r(Math.min(box.max.y-0.4, 3.2)), r(back+(front-back)*0.12)], look:[r(c.x), 1.4, r(front)], lens:18, box:[r(box.min.x),r(box.min.z),r(box.max.x),r(box.max.z)]}; })()"""


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 南洋 1 廳看電影熄燈：worktree %s；TAG %s；Playwright ≠ iPhone' % (real or '?', TAG), flush=True)
    rec = {'sha': real}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await cc_det.install(pg, 20261108); await pg.goto(URL)
        if R.check('遊戲載入', await L.wait_loaded(pg), ''):
            await pg.evaluate("localStorage.clear()")
            R.setup('讀檔到南洋大廳 xs_nanyang 2025-10-18 19:00（條件事件關閉）')
            s = await D.load_zone(pg, cdp, 'xs_nanyang', '2025-10-18', 19.0, wait=9000)
            R.check('在南洋大廳', s['zone'] == 'xs_nanyang', J(s))
            it = await pg.evaluate("(()=>{ const q=GAME.E.interactables.find(i=>i.nyTicket&&!i.hidden); return q?{x:q.x,z:q.z,r:q.radius||0.9,label:q.label}:null; })()")
            if R.check('大廳有買票的按鈕', bool(it), J(it)):
                await L.go_to(pg, cdp, R, it['x'], it['z'], it['r'] * 0.6, '走到買票', max_s=120)
                await pg.wait_for_timeout(1200); s = await D.st(pg); R.note('互動按鈕：%s' % s['interact'])
                await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                for _ in range(40):
                    x = await L.state(pg)
                    if x['choices']:
                        c = await pg.evaluate("(()=>{ const bs=[...document.querySelectorAll('#choices button')]; const t=bs.map(b=>b.textContent.trim()); const i=t.findIndex(s=>!/算了|不買|取消|不要/.test(s)); const b=bs[i<0?0:i]; b.click(); return t.concat(['→ '+b.textContent.trim()]); })()")
                        R.note('買票選項：%s' % J(c))
                    elif x['dlg']: await L.tap(pg, cdp, '#dlg')
                    else: break
                    await pg.wait_for_timeout(700)
                tk = await pg.evaluate("(()=>({ticket:GAME.G.flags.NY_TICKET, day:GAME.G.day, has:typeof NYS!=='undefined'&&NYS.hasTicket?NYS.hasTicket(GAME.G):null}))()")
                R.check('買到今天的票（NYS.hasTicket）', tk['has'] is True, J(tk))
            exs = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.exit&&i.exit.to).map(i=>({label:i.label,to:i.exit.to})))()")
            R.note('大廳的出口：%s' % J(exs))
            ex = next((e for e in exs if e['to'] == 'xs_nanyang_hall'), None)
            if R.check('有進 1 廳的出口', bool(ex), J(exs)):
                s = await D.use_exit(pg, cdp, '[進 1 廳]', ex['label'], 'xs_nanyang_hall')
            if (await D.st(pg))['zone'] == 'xs_nanyang_hall':
                await pg.wait_for_timeout(4000)
                R.note('lightsOff 監看：%s' % await pg.evaluate(HOOK))
                cam = await pg.evaluate(CAM); R.note('固定機位：%s' % J(cam))
                lm0 = await pg.evaluate(LM); R.note('坐下前的光照貼圖：%s' % J(lm0))
                await D.user_shot(pg, cdp, 'ny_before', cam)
                seat = await pg.evaluate("(()=>{ const P=GAME.E.player.obj.position; const L=GAME.E.interactables.filter(i=>i.seat&&i.seat.kind==='cinema'&&!i.hidden); L.sort((a,b)=>Math.hypot(a.x-P.x,a.z-P.z)-Math.hypot(b.x-P.x,b.z-P.z)); const q=L[0]; return q?{x:q.x,z:q.z,r:q.radius||0.7,label:q.label,n:L.length}:null; })()")
                if R.check('1 廳有電影座位（seat.kind cinema）', bool(seat), J(seat)):
                    await L.go_to(pg, cdp, R, seat['x'], seat['z'], seat['r'] * 0.6, '走到座位', max_s=150)
                    await pg.wait_for_timeout(1000); s = await D.st(pg); R.note('互動按鈕：%s' % s['interact'])
                    await L.tap(pg, cdp, '#interact')
                    shot_start = shot_end = False; lm1 = lm2 = None; t0 = time.time(); says = []
                    while time.time() - t0 < 600:
                        lo = await pg.evaluate("window.__lo||[]")
                        if not shot_start and any(q['k'] >= 0.99 for q in lo):
                            shot_start = True; lm1 = await pg.evaluate(LM); R.note('開演（lightsOff 1）那一刻的光照貼圖：%s' % J(lm1)); await D.user_shot(pg, cdp, 'ny_start', cam)
                        if shot_start and not shot_end and any(q['k'] <= 0.01 for q in lo[[i for i, q in enumerate(lo) if q['k'] >= 0.99][0]:]):
                            await pg.wait_for_timeout(1500)
                            x = await L.state(pg)
                            if not x['dlg'] and not x['choices']:
                                shot_end = True; lm2 = await pg.evaluate(LM); R.note('演完（lightsOff 0）的光照貼圖：%s' % J(lm2)); await D.user_shot(pg, cdp, 'ny_end', cam); break
                        x = await L.state(pg)
                        if x['choices']: await L.tap(pg, cdp, '#choices button')
                        elif x['dlg']:
                            says.append(x.get('dtext', '')[:40]); await L.tap(pg, cdp, '#dlg')
                        await pg.wait_for_timeout(700)
                    lo = await pg.evaluate("window.__lo||[]")
                    R.note('lightsOff 呼叫：%s；看到的話 %s' % (J(lo), J(list(dict.fromkeys(says))[:8])))
                    R.check('開演時有叫 lightsOff(1)', any(q['k'] >= 0.99 for q in lo), J(lo))
                    R.check('開演時換成熄燈那一張（z.lightsOffK＝1；roomDarkMap 是 shader 混合 lmDark，不換 m.lightMap）', bool(lm1) and lm1.get('K') == 1, J([lm0, lm1]))
                    R.check('演完叫 lightsOff(0)、換回來（z.lightsOffK＝0）', shot_end and bool(lm2) and lm2.get('K') == 0 and lm2['maps'] == lm0['maps'], J([lm0, lm2]))
                    rec.update({'cam': cam, 'lm0': lm0, 'lm1': lm1, 'lm2': lm2, 'lightsOff': lo})
            R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    json.dump(rec, open(os.path.join(OUT, 'nanyang_watch_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)

asyncio.run(main())
