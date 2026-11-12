"""CC-B（帳號 B）11-09：店門口（從街上看進去）。BB-B 18:37 溫州街五間白天重烘（#196，D120）。判定＝BB。
【前置／捷徑】讀檔（load_zone，條件事件、手機關）到 STREET（預設 wenzhou）HOUR（預設 14）→ 找街上「進那間店」的出口互動點（exit.to＝那間店的 zone）
→ 鏡頭放在出口外面 4.5 m、高 1.6 m（8 個方向裡，2／3／4.5 m 都站得住、離出口最遠的那一個＝街上），看出口 1.3 m 高 → 拍一張（藏 HUD 和玩家）。
ACROSS=1（CC-C 11-12，BB-C 11:31：沿騎樓 4.5 m 拍的鐵捲門是斜的、有幾張只拍到柱子）：從馬路對面正對店面拍——店面位置和朝向從 zone.shopReal 讀（室內中心＋正面 ry，店面＝中心往正面 d/2），
  【捷徑】祐廷先放到店面前 3 m（讓走近才顯示的室內打開）等 3 秒 → 鏡頭放在店面正前方 DIST m（預設 16，站不住就退到 13／10／7 m）、高 1.7 m，看店面中間 2.0 m 高（24 mm）；記營業中、鐵捲門顯示、室內 on／built。
CC_02 清單 2026-11-12：1✓（時間照佇列 14:00、23:30） 2✓（店面從 zone.shopReal、出口從互動點讀） 3n/a（一次讀檔拍一排） 4n/a（不按） 5n/a（拍照：放位置是捷徑） 6✓（讀檔等 12＋5 秒、每間 3 秒） 7✓ 8n/a（不判，給 BB） 9n/a（不藏路人：照街上原樣，藏玩家） 10✓（條件事件關掉） 11✓ 12✓（每間同樣欄位） 13✓（讀檔、放位置捷徑標）
DOOR=1（BB-C 11:44）：正對門——門（出口互動點）朝外的方向（有 zone.shopReal 用室內正面 ry；沒有＝導航四方向：外面站得住、背後是牆），鏡頭在門前 4.5 m、高 1.6 m、平視門（18 mm）。
用法：LW_TESTS=<wt>/tests SHOPS=wz_brunch,wz_teishoku,... [TAG=x] [ACROSS=1 DIST=16 | DOOR=1] [DAY=2025-10-18] python3 cc_storefront_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or os.path.join(HERE, '..', '..', '..', '..', 'tests')); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHOPS = [s for s in (os.environ.get('SHOPS') or 'wz_brunch,wz_teishoku,wz_mokuyobi,wz_offbeat,wz_print').split(',') if s]
STREET = os.environ.get('STREET') or 'wenzhou'; HOUR = float(os.environ.get('HOUR') or 14); TAG = os.environ.get('TAG') or 'x'
R = L.Run('storefront_' + TAG, OUT); D.setup(R, OUT)
SIGN = (os.environ.get('SIGN') or '0') == '1'; SIGN_H = float(os.environ.get('SIGN_H') or 3.3)   # 11-12：DOOR 之後再退到對面往上拍招牌（BB-C 14:31 燒臘）
DOOR = (os.environ.get('DOOR') or '0') == '1' or SIGN   # BB-C 11:44：正對門——門（出口互動點）朝外的方向，鏡頭在門前 4.5 m
FIND_DOOR = r"""(a=>{ const E=GAME.E; const it=E.interactables.find(i=>i.exit&&i.exit.to===a.z&&!i.hidden); if(!it) return null; const lv=it.lv|0, r2=v=>+(+v).toFixed(2); let n=null, how='';
  const S=E.zone&&E.zone.shopReal, s=S&&(S.shops||[]).find(q=>q.place===a.z); if(s){ n=[Math.sin(s.ry||0),Math.cos(s.ry||0)]; how='shopReal.ry'; }
  if(!n){ let best=null; for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){ const out=[2,3,4.5].filter(r=>E.canStand(it.x+dx*r,it.z+dz*r,0.3,lv)).length, back=E.canStand(it.x-dx*1.2,it.z-dz*1.2,0.3,lv)?1:0; const sc=out*2-back; if(!best||sc>best.sc) best={sc,dx,dz}; } n=[best.dx,best.dz]; how='nav 四方向（外面站得住、背後是牆）'; }
  const d=a.d||4.5; return {label:it.label, x:r2(it.x), z:r2(it.z), n:n.map(r2), how, eye:[r2(it.x+n[0]*d),1.6,r2(it.z+n[1]*d)], look:[r2(it.x),1.6,r2(it.z)], standEye:E.canStand(it.x+n[0]*d,it.z+n[1]*d,0.3,lv)}; })"""
ACROSS = (os.environ.get('ACROSS') or '0') == '1'; DIST = float(os.environ.get('DIST') or 16); DAY = os.environ.get('DAY') or '2025-10-18'
FIND_ACROSS = r"""(a=>{ const E=GAME.E, S=E.zone&&E.zone.shopReal; const s=S&&(S.shops||[]).find(q=>q.place===a.z); if(!s) return {none:true, have:S?(S.shops||[]).map(q=>q.place):null};
  const cx=s.cx===undefined?s.x:s.cx, cz=s.cz===undefined?s.z:s.cz, nx=Math.sin(s.ry||0), nz=Math.cos(s.ry||0), hd=(s.d||8)/2, fx=cx+nx*hd, fz=cz+nz*hd; let d=null;
  for(const r of [a.dist,13,10,7]) if(E.canStand(fx+nx*r,fz+nz*r,0.3,0)){ d=r; break; } if(d===null) d=a.dist;
  let open=null; try{ open=!!PLACES.isOpen(a.z,(+GAME.G.hour)%24,GAME.G.day)&&!(PLACES.typhoonClosed&&PLACES.typhoonClosed(a.z,GAME.G.day)); }catch(e){}
  const r2=v=>+(+v).toFixed(2); return {front:[r2(fx),r2(fz)], n:[r2(nx),r2(nz)], d, stand:[r2(fx+nx*3),r2(fz+nz*3)], eye:[r2(fx+nx*d),1.7,r2(fz+nz*d)], look:[r2(fx),2.0,r2(fz)], w:s.w, open, shutter:s.shutter?s.shutter.visible:null, on:!!s.on, built:!!s.built}; })"""
FIND = """(z=>{ const E=GAME.E; const it=E.interactables.find(i=>i.exit&&i.exit.to===z&&!i.hidden); if(!it) return null; const lv=it.lv|0; let best=null;
  for(let a=0;a<8;a++){ const dx=Math.sin(a*Math.PI/4), dz=Math.cos(a*Math.PI/4); if(![2,3,4.5].every(r=>E.canStand(it.x+dx*r,it.z+dz*r,0.3,lv))) continue; best=best||{dx,dz,a}; }
  if(!best) return {label:it.label,x:it.x,z:it.z,eye:null}; return {label:it.label, x:+it.x.toFixed(2), z:+it.z.toFixed(2), a:best.a, eye:[+(it.x+best.dx*4.5).toFixed(2),1.6,+(it.z+best.dz*4.5).toFixed(2)], look:[+it.x.toFixed(2),1.3,+it.z.toFixed(2)]}; })"""
async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 店門口：worktree %s；%s %s；TAG %s；Playwright ≠ iPhone' % (real or '?', STREET, HOUR, TAG), flush=True)
    res = []
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        R.setup('【前置／捷徑】讀檔到 %s %s %s（條件事件、手機關）' % (STREET, DAY, HOUR))
        await D.load_zone(pg, cdp, STREET, DAY, HOUR, wait=12000); await pg.wait_for_timeout(5000)
        for z in SHOPS:
            f = await pg.evaluate(FIND_ACROSS, {'z': z, 'dist': DIST}) if ACROSS else {}
            if ACROSS and f.get('none'): R.note('%s zone.shopReal 沒有這間（%s）→ 改用舊拍法（出口外 4.5 m）' % (z, json.dumps(f, ensure_ascii=False)))
            if ACROSS and not f.get('none'):
                await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); })", {'x': f['stand'][0], 'z': f['stand'][1]}); await pg.wait_for_timeout(3000)
                f2 = await pg.evaluate(FIND_ACROSS, {'z': z, 'dist': DIST}); f.update({'on': f2.get('on'), 'built': f2.get('built'), 'shutter': f2.get('shutter')})
                R.setup('%s 【捷徑】祐廷放到店面前 3 m %s 等 3 秒' % (z, f['stand']))
                c = await D.user_shot(pg, cdp, 'across_%s_%s' % (z, TAG), {'eye': f['eye'], 'look': f['look'], 'lens': 24}, hide_player=True)
                R.note('%s 對面正拍：店面 %s 朝 %s、鏡頭退 %s m；營業中=%s、鐵捲門顯示=%s、室內 on=%s built=%s' % (z, f['front'], f['n'], f['d'], f['open'], f['shutter'], f['on'], f['built']))
                res.append({'zone': z, 'across': f, 'cam': c}); continue
            if DOOR:
                f = await pg.evaluate(FIND_DOOR, {'z': z, 'd': 4.5})
                if not R.check('%s 街上找得到進店的門' % z, bool(f), ''): res.append({'zone': z, 'skip': f}); continue
                # CC-C 12:1x：室內模型「走近才顯示」——先【捷徑】把祐廷放到門前 3 m 等 3 秒（舊版沒放：南洋 23:30 看進去是空的暗室）
                await pg.evaluate("(a=>{ const P=GAME.E.player.obj; P.position.set(a.x,0,a.z); })", {'x': f['x'] + f['n'][0] * 3, 'z': f['z'] + f['n'][1] * 3}); await pg.wait_for_timeout(3000)
                sr = await pg.evaluate("(z=>{ const S=GAME.E.zone&&GAME.E.zone.shopReal, s=S&&(S.shops||[]).find(q=>q.place===z); return s?{on:!!s.on, built:!!s.built, shutter:s.shutter?s.shutter.visible:null}:null; })", z)
                R.setup('%s 【捷徑】祐廷放到門前 3 m 等 3 秒；室內 %s' % (z, json.dumps(sr, ensure_ascii=False)))
                c = await D.user_shot(pg, cdp, 'door_%s_%s' % (z, TAG), {'eye': f['eye'], 'look': f['look'], 'lens': 18}, hide_player=True)
                R.note('%s 正對門：門 (%s, %s)「%s」朝外 %s（%s）、鏡頭 %s（站得住=%s）' % (z, f['x'], f['z'], f['label'], f['n'], f['how'], f['eye'], f['standEye']))
                res.append({'zone': z, 'door': f, 'cam': c})
                if SIGN:   # 11-12 BB-C 14:31：招牌——退到對面（10／8／6.5／5 m 取第一個站得住的）、高 1.7 m、往上看門上方 SIGN_H m
                    g = None
                    for d in (10, 8, 6.5, 5):
                        g = await pg.evaluate(FIND_DOOR, {'z': z, 'd': d})
                        if g and g.get('standEye'): break
                    eye = [g['eye'][0], 1.7, g['eye'][2]]; look = [g['x'], SIGN_H, g['z']]
                    c2 = await D.user_shot(pg, cdp, 'sign_%s_%s' % (z, TAG), {'eye': eye, 'look': look, 'lens': 24}, hide_player=True)
                    lit = await pg.evaluate("(()=>{ let n=0, on=0; GAME.E.scene.traverse(o=>{ if(o.isLight&&o.visible){ n++; if(o.intensity>0) on++; } }); return {lights:n, on, hour:+(+GAME.G.hour).toFixed(2)}; })()")
                    R.note('%s 招牌：鏡頭 %s 看 %s（退 %s m，站得住=%s）；場景燈 %s' % (z, eye, look, d, g.get('standEye'), json.dumps(lit, ensure_ascii=False)))
                    res[-1]['sign'] = {'eye': eye, 'look': look, 'd': d, 'cam': c2, 'lit': lit}
                continue
            f = await pg.evaluate(FIND, z); R.note('%s 出口：%s' % (z, json.dumps(f, ensure_ascii=False)))
            if not R.check('%s 街上找得到進店的出口、外面站得住' % z, bool(f and f.get('eye')), ''): res.append({'zone': z, 'skip': f}); continue
            c = await D.user_shot(pg, cdp, 'front_%s_%s' % (z, TAG), {'eye': f['eye'], 'look': f['look'], 'lens': 18}, hide_player=True)
            res.append({'zone': z, 'find': f, 'cam': c})
        R.check('沒有 JS 例外', not errs, json.dumps(errs[:3], ensure_ascii=False))
        await b.close()
    json.dump(res, open(os.path.join(OUT, 'storefront_%s.json' % TAG), 'w'), ensure_ascii=False, indent=1)
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
