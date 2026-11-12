"""CC-C 11-13：TZ_WENTE_WIN3D（LAWWW-C 03:43；SHOP-WINDOW-3D-1112：進不去的店，玻璃後面是立體店內）。只拍、只記，判定歸 BB（§12 第 1 點 ⑦a／⑦b）。
店面位置從街道配置讀（LAYOUT＝全域變數名，預設 TINGZHOU_LAYOUT；SHOP＝shops 裡的 id）：西側店門面在 facade.west、朝 +x；東側在 facade.east、朝 −x；z＝(z0+z1)/2。
【前置／捷徑】讀檔到那條街（ZONE）門面前 3 m（HOUR），等 4 秒；拍：
  ① 對街正面（退 DIST m、高 1.7 m、看門面 2 m 高）＋左右各平移 1.5 m（同一個看點：看玻璃後面跟著視角變不變＝立體）
  ② 近一點正面（退 4 m、高 1.6 m）＋左右各平移 1 m
  ③ 貼近玻璃（退 1.5 m、高 1.5 m、看玻璃後 2 m）
  另記 sk_in_<店> 網格在不在、看不看得到、場景亮著的燈數。
CC_02 清單 2026-11-13：1✓（時間由佇列給，白天 14:00） 2✓（門面位置從街道配置讀，不寫死） 3n/a（只有一間） 4n/a（不點按鈕） 5n/a（讀檔到門前，不走路：只看外觀） 6✓（讀檔後等 4 秒、每張 render 後拍） 7✓（lint、node 驗 JS） 8n/a（不判數字） 9✓（藏玩家和 HUD） 10n/a（條件事件關掉） 11✓（SHA 40 碼、ENV 沒有「|」） 12✓（FAIL_SETUP 檢查：配置裡有這間、sk_in 網格在場景裡） 13n/a（不走路）
用法：LW_TESTS=<wt>/tests SHA=<sha> ZONE=tingzhou SHOP=wente [LAYOUT=TINGZHOU_LAYOUT DAY=2025-10-22 HOUR=14 DIST=9] python3 cc_layout_window_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = os.environ.get('SHA') or ''; ZONE = os.environ.get('ZONE') or 'tingzhou'; SHOP = os.environ.get('SHOP') or 'wente'
LAYOUT = os.environ.get('LAYOUT') or 'TINGZHOU_LAYOUT'; DAY = os.environ.get('DAY') or '2025-10-22'
HOUR = float(os.environ.get('HOUR') or 14); DIST = float(os.environ.get('DIST') or 9)
J = lambda o: json.dumps(o, ensure_ascii=False)
R = L.Run('layout_window', OUT); D.setup(R, OUT)

FIND = r"""((a)=>{ let Lay=null; try{ Lay=(0,eval)(a.lay); }catch(e){}   /* 全域 const 不掛在 window 上：用間接 eval 讀 */ if(!Lay) return {err:'沒有 '+a.lay}; const q=(Lay.shops||[]).find(s=>s.id===a.id); if(!q) return {err:'配置裡沒有 '+a.id, ids:(Lay.shops||[]).map(s=>s.id)};
  const w=q.side==='W', F=Lay.facade||{}; return {name:q.name||'', side:q.side, x:w?F.west:F.east, z:(q.z0+q.z1)/2, nx:w?1:-1, w:Math.abs(q.z1-q.z0)}; })"""
MESH = r"""((id)=>{ const E=GAME.E; let n=0, vis=0; E.scene.traverse(o=>{ if(o.name&&o.name.indexOf('sk_in_'+id)===0){ n++; let v=true; for(let q=o; q; q=q.parent) if(q.visible===false) v=false; if(v) vis++; } }); let lit=0; E.scene.traverse(o=>{ if(o.isLight&&o.visible&&o.intensity>0) lit++; }); return {sk_in:n, visible:vis, lights:lit, hour:+(+GAME.G.hour).toFixed(2)}; })"""


async def main():
    print('CC 進不去的店玻璃後立體：SHA %s；%s %s %s %.2f；Playwright ≠ iPhone' % (SHA or '?', ZONE, SHOP, DAY, HOUR), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg, 600), ''): await b.close(); sys.exit(1)
        await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=6000)
        f = await pg.evaluate(FIND, {'lay': LAYOUT, 'id': SHOP}); res['shop'] = f
        if not R.check('FAIL_SETUP 檢查：%s 配置裡有 %s' % (LAYOUT, SHOP), not f.get('err'), J(f)): await b.close(); sys.exit(1)
        x, z, nx = f['x'], f['z'], f['nx']
        await D.load_zone(pg, cdp, ZONE, DAY, HOUR, x=x + nx * 3, z=z, yaw=0.0, wait=8000)
        R.setup('【前置／捷徑】讀檔到 %s %s 門面前 3 m (%.2f, %.2f) %s %.2f（條件事件關掉）' % (ZONE, f['name'], x + nx * 3, z, DAY, HOUR))
        await pg.wait_for_timeout(4000)
        m = await pg.evaluate(MESH, SHOP); res['mesh'] = m
        R.check('FAIL_SETUP 檢查：場景裡有 sk_in_%s 網格' % SHOP, m['sk_in'] > 0, J(m))
        shots = []
        for nm, d, h, look_in, offs in (('across', DIST, 1.7, 0, (0, -1.5, 1.5)), ('near', 4.0, 1.6, 0, (0, -1.0, 1.0)), ('glass', 1.5, 1.5, 2.0, (0,))):
            for o in offs:
                eye = [round(x + nx * d, 2), h, round(z + o, 2)]; look = [round(x - nx * look_in, 2), 2.0 if not look_in else 1.4, z]
                tag = '%s_%s_%s' % (SHOP, nm, {0: 'c', -1.5: 'l', 1.5: 'r', -1.0: 'l', 1.0: 'r'}[o])
                c = await D.user_shot(pg, cdp, tag, {'eye': eye, 'look': look, 'lens': 24}, hide_player=True)
                shots.append({'tag': tag, 'eye': eye, 'look': look, 'cam': c})
        res['shots'] = shots
        R.note('%s：網格 %s；拍了 %d 張 %s' % (f['name'], J(m), len(shots), J([s['tag'] for s in shots])))
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'layout_window.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
