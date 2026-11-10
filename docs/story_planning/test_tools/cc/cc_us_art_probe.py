"""CC（帳號 A）11-10：美國篇 3D 場景 ART 巡拍（BB 14:39；LAWWW 14:39，D120／D128 改由 BB 判；清單 docs/handoff/USER_ART_REVIEW_1027.md 美國那幾列）。
只拍、不判美術（判定 BB）。開發分支最新 head，桌機 1280×720、fov 55，白天 14:00、晚上 20:00 各一組。
  另一台相機（同一個場景、同一個 renderer）拍固定鏡頭：拍的時候藏玩家和路人、HUD 藏起來；
  每個區域另外一張「玩家視角」＝遊戲自己的鏡頭（人在畫面裡），只藏 HUD。
區域與對應清單列：
  us_outside      SCN-US-01 社區外觀、ART-US-ROUTE-1024 社區西邊出口外面、US-MS-NIGHT-1021 路燈光圈
  us_apartment    SCN-US-01 祐廷那一戶（臥室、客廳、廚房、衛浴、陽台）、ART-US1／2／3 客廳、廚房、臥室家具近拍
  us_campus       SCN-US-02、SCN-US-IU-1018 美國校園街道（IU 版）、US-MS-NIGHT-1021
  us_lawlib       SCN-US-LIB 法學院圖書館（中庭、長桌、彩色玻璃）、ART-US-ROUTE-1024 法圖晚上的天窗
  us_market       SCN-US-03 超市
  us_market_street US-MS-NIGHT-1021（超市街停車場燈桿）
  SEASON=1：ART-US-SEASON 社區同一個地點 2028-08-20、2028-12-15 各一張（14:00）。
日子：交換在 2028/8/2～12/23（BB_215），預設 2028-09-15（usSeasonKey＝summer）。
【前置／捷徑】load_zone 讀檔到區域出生點（不走交換流程；功能已在 flow_us_exchange 那邊測）。Playwright（PC GPU）≠ iPhone。
r2：存 JPEG（品質 88）——PC runner 每一項只上傳到二十幾張（PNG 太大，US_ART_1 的 us_outside、us_campus 全部沒上傳）。
用法：LW_TESTS=<wt>/tests ZONES=us_outside,us_apartment,us_campus [HOURS=14,20] [SEASON=1] [DATE=2028-09-15] python3 cc_us_art_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
R = L.Run('us_art', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
ZONES = [z for z in (os.environ.get('ZONES') or 'us_outside,us_apartment,us_campus').split(',') if z]
HOURS = [float(h) for h in (os.environ.get('HOURS') or '14,20').split(',')]
DATE = os.environ.get('DATE') or '2028-09-15'
# 名稱: (眼睛, 看哪裡)；座標照 src/data/us_layouts.js（開發分支 b296c6b56）；公寓 r2：照 US_APARTMENT_LAYOUT.rooms 重擺臥室遠景、廚房遠景、衛浴、陽台（雲端冒煙這四張拍到牆）
V = {
  'us_outside': [('overview', (0, 38, 44), (0, 0, -2)), ('home_n', (14, 1.7, -6), (14, 4.5, -24)), ('home_s', (14, 1.7, -20), (14, 1.2, 0)),
                 ('lot', (0, 6, 18), (0, 0, -8)), ('west_exit', (-32, 1.7, 0), (-52, 1.6, 0)), ('west_exit_air', (-30, 12, 10), (-52, 0, 0))],
  'us_apartment': [('overview', (0.2, 9.5, 6.5), (0.2, 0, -0.5)), ('living', (1.2, 1.6, 0.4), (-3.6, 0.9, -2.6)), ('living_near', (-0.4, 1.25, -0.3), (-2.6, 0.5, -2.2)),
                   ('bedroom', (1.65, 1.6, 0.8), (4.6, 0.8, -2.6)), ('bedroom_near', (3.9, 1.3, -0.2), (2.4, 0.5, -2.4)),
                   ('kitchen', (-2.0, 1.65, 1.15), (-4.4, 0.9, 2.8)), ('kitchen_near', (-2.2, 1.35, 2.2), (-4.2, 0.9, 1.4)),
                   ('bath', (4.8, 1.6, 2.8), (3.0, 0.6, 1.3)), ('balcony', (0.0, 1.6, -4.4), (-2.6, 0.8, -3.6)), ('balcony_out', (-1.2, 1.6, -4.2), (-1.2, 1.5, -14))],
  'us_campus': [('overview', (-20, 40, 46), (-20, 0, 0)), ('law_front', (0, 1.7, 19.5), (0, 6, 0)), ('street_e', (-20.6, 1.7, 20.2), (35, 1.5, 19.6)),
                ('street_w', (-20.6, 1.7, 20.2), (-90, 1.5, 19.6)), ('gate', (-66, 1.7, 15), (-66, 3, -10)), ('west_air', (-80, 30, 40), (-80, 0, 0))],
  'us_lawlib': [('atrium', (0, 1.6, 7.4), (0, 4.5, -7)), ('stained', (0, 2.0, -1.0), (0, 4.0, -10)), ('tables', (-8.5, 1.6, 3.5), (-1.5, 0.8, -1.2)),
                ('tables_north', (-7, 1.6, -4.6), (-7, 1.4, -9.8)), ('skylight', (0, 1.6, 0.6), (0, 18, -0.4)), ('desk', (-1, 1.6, 3), (-5, 1.0, 7.4))],
  'us_classroom': [('door_to_stage', (0, 3.4, 7.3), (0, 1.4, -7)), ('row1_back', (2.0, 1.55, -4.2), (0, 2.4, 7.9)), ('window', (-4.5, 1.9, 1.0), (-8, 3.6, -2.0)),
                   ('window_out', (-6.6, 3.6, -1.5), (-12, 3.8, -1.5)), ('overview', (5.5, 5.2, 7.6), (-2, 0.5, -3))],   # BB 15:19 US-CLASSROOM（d78228f85）：門口往講台、第 1 排往後、窗邊、窗外
  'us_market': [('entry', (13.5, 1.7, 14), (0, 2, -10)), ('aisles', (0, 2.2, 10), (0, 1.5, -14)), ('overview', (0, 5.8, 15), (0, 0, -8)), ('checkout', (-8, 1.7, 4), (-14, 1.2, 14))],
  'us_market_street': [('overview', (0, 26, 44), (0, 0, 0)), ('lot', (-22.6, 1.7, 12.9), (0, 3, -22))],
}
SETTLED = "(async()=>{ for(let i=0;i<480;i++){ const A=ASSETS; const n=Object.keys(A.status).filter(k=>!A.cache[k]&&!A.errors.some(e=>e.startsWith(k+':'))).length; if(!n) return i; await new Promise(r=>setTimeout(r,250)); } return -1; })()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(55, c.width/c.height, 0.05, 2000); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const hid=[]; const P=E.player.obj; hid.push([P,P.visible]); P.visible=false; for(const n of (E.npcs||[])) if(n.obj){ hid.push([n.obj,n.obj.visible]); n.obj.visible=false; }
  try{ r.render(E.scene,cam); } finally { for(const [o,v] of hid) o.visible=v; } return c.toDataURL('image/jpeg',0.88); })"""
INFO = r"""(()=>{ const E=GAME.E, z=E.zone||{}; let glb=[]; (z.group||E.scene).traverse(o=>{ if(o.name&&/glb|GLB|formal/i.test(o.name)) glb.push(o.name); });
  const lp=(E.lampGlows||[]).length; const P=E.player.obj.position;
  return {zone:GAME.G.zone, formal:!!z.formal, glb:glb.slice(0,8), lampGlows:lp, season:(typeof US3!=='undefined'&&US3.seasonKey)?US3.seasonKey():null, p:[+P.x.toFixed(2),+P.z.toFixed(2)]}; })()"""


async def snap(pg, fn, frm, at):
    u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at)}); open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def visit(pg, cdp, zone, date, h, views, tag):
    R.setup('【前置／捷徑】讀檔到 %s 出生點 %s %.1f 時' % (zone, date, h))
    await D.load_zone(pg, cdp, zone, date, h, wait=12000)
    n = await pg.evaluate(SETTLED); await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(2500)
    info = await pg.evaluate(INFO); R.note('%s %s %.0f 時：等模型 %s 次；%s' % (zone, date, h, n, J(info)))
    if not R.check('%s %s %.0f 時 讀得進這個區域' % (zone, date, h), info['zone'] == zone, J(info)): await pg.evaluate(D.HUD + '(true)'); return []
    files = []
    await pg.screenshot(path=os.path.join(OUT, 'us_%s_%s_player.jpg' % (zone, tag)), type='jpeg', quality=88); files.append('us_%s_%s_player.jpg' % (zone, tag))   # 玩家視角（遊戲鏡頭、人在畫面裡）
    for nm, frm, at in views:
        fn = 'us_%s_%s_%s.jpg' % (zone, tag, nm); await snap(pg, fn, frm, at); files.append(fn)
    await pg.evaluate(D.HUD + '(true)')
    return files


async def main():
    real = os.popen('git -C "%s" rev-parse --short HEAD 2>/dev/null' % os.path.join(os.environ.get('LW_TESTS') or '.', '..')).read().strip()
    print('CC 美國篇 ART 巡拍：worktree %s；區域 %s；Playwright（PC GPU）≠ iPhone' % (real or '?', ZONES), flush=True)
    allf = {}
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path='/opt/pw-browsers/chromium', args=L.ARGS)
        ctx = await b.new_context(viewport={'width': 1280, 'height': 720}, device_scale_factor=1)
        pg = await ctx.new_page(); cdp = await ctx.new_cdp_session(pg); errs = []; pg.on('pageerror', lambda e: errs.append(str(e)))
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for zone in ZONES:
            for h in HOURS:
                tag = '%02d' % int(h); allf['%s_%s' % (zone, tag)] = await visit(pg, cdp, zone, DATE, h, V.get(zone, []), tag)
        if 'us_classroom' in ZONES:   # BB 15:19：四季同一個窗邊鏡頭、坐一個位子、從出口出去
            sv = [v for v in V['us_classroom'] if v[0] in ('window', 'window_out')]
            for d in ('2028-08-20', '2028-10-20', '2028-12-15'):
                tag = 'season' + d[5:7]; allf['us_classroom_' + tag] = await visit(pg, cdp, 'us_classroom', d, 14.0, sv, tag)
            R.setup('【前置／捷徑】GAME.enter(\'us_classroom\', US_CLASSROOM.SPAWN)（劇情接線還沒做，門口還是 2D）')
            await D.load_zone(pg, cdp, 'us_campus', DATE, 14.0, wait=8000)
            await pg.evaluate("void GAME.enter('us_classroom', US_CLASSROOM.SPAWN)"); await pg.wait_for_timeout(9000)
            seats = await pg.evaluate(D.SEATS); R.note('us_classroom 座位 %d 張' % len(seats))
            R.check('us_classroom 有可以坐的位子（6 排 × 8 席＝48）', len(seats) >= 48, str(len(seats)))
            if seats:
                q = max(seats, key=lambda q: q['sz'])   # 最後一排（離門口最近）
                q2 = min(seats, key=lambda q: q['sz'])   # 第 1 排
                res = await D.sit_all(pg, cdp, '[教室坐下]', 'us_cls_sit', max_walk=240, only=[(q['sx'], q['sz']), (q2['sx'], q2['sz'])])
                R.note('坐下結果：%s' % J(res))
            ex = await pg.evaluate("(()=>(GAME.E.interactables||[]).filter(i=>i.exit).map(i=>({label:i.label,x:i.x,z:i.z,r:i.radius||1.2,lv:i.lv|0,to:i.exit.to})))()")
            R.note('教室的出口：%s' % J(ex)); e = next((q for q in ex if q['to'] == 'us_campus'), None)
            if R.check('教室有往 us_campus 的出口', bool(e), J(ex)):
                ok = await L.go_to(pg, cdp, R, e['x'], e['z'], min(0.9, e['r'] * 0.8), '走到「%s」' % e['label'], max_s=240, lv=e['lv'])
                await pg.wait_for_timeout(800); stx = await L.state(pg)
                R.check('走到出口、按鈕「%s」' % e['label'], bool(ok) and stx['interact'].startswith(e['label'][:3]), J(stx))
                await L.tap(pg, cdp, '#interact')
                for _ in range(30):
                    await pg.wait_for_timeout(500)
                    if (await L.state(pg))['zone'] != 'us_classroom': break
                await pg.wait_for_timeout(3000); stx = await L.state(pg)
                R.check('從出口出得去：回到 us_campus、站得住、walkFallbacks 0', stx['zone'] == 'us_campus' and stx['stand'] is not False and not stx['fallbacks'], J(stx))
        if os.environ.get('SEASON'):
            sv = [v for v in V['us_outside'] if v[0] in ('overview', 'home_n', 'lot')]
            for d in ('2028-08-20', '2028-12-15'):
                tag = 'season' + d[5:7]; allf['us_outside_' + tag] = await visit(pg, cdp, 'us_outside', d, 14.0, sv, tag)
        json.dump({'date': DATE, 'views': {k: [[n, f, a] for n, f, a in v] for k, v in V.items()}, 'files': allf}, open(os.path.join(OUT, 'us_art.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
