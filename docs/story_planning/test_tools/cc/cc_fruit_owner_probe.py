"""CC-C 11-12：阿忠鮮果營業中有沒有老闆（LAWWW-C 11:01；src/closed3d.js CLOSED.fruitOwner，放人時機 STORY.populate('wenzhou')／STORY.TICKS）。結果給 LAWWW-C、BB。Playwright（PC GPU）≠ iPhone。
兩種進溫州街的方法、同一天同一時間（DAY 預設 2025-09-17 週三、HOUR 14）：
  A 正常走進去：【前置／捷徑】讀檔到 FROM（預設 gongguan，條件事件關掉；找不到通往 wenzhou 的出口就換 campus）→ 真的走到「往溫州街」的出口按互動（D.use_exit）→ 到 wenzhou 站 5 秒
  B 讀檔直接進：【前置／捷徑】applySave 直接讀到 wenzhou（LAWWW2 的做法）→ 站 5 秒
每一種記：E.npcs 裡 fruitOwner 的人（位置、visible、hidden、姿勢）、離 (34.9,−6.15) 多遠、CLOSED.fruitOwner 存不存在；拍攤子正面（另一台相機，兩個方向各一張）＋遊戲鏡頭。
CC_02 清單 2026-11-12：1✓（日期時間照 LAWWW-C：9/17 週三 14:00） 2✓（出口照 exit.to 從遊戲找；老闆照 n.fruitOwner 旗標找） 3✓（兩種各自重新讀檔） 4✓（出口照字按） 5✓（use_exit 走過去） 6✓（站 5 秒、等素材） 7✓ 8n/a（不判，記事實給 LAWWW） 9n/a（攤子照片不藏人：要看老闆） 10✓（條件事件關掉） 11✓ 12✓（兩種都記同樣的欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> [DAY=2025-09-17] [HOUR=14] [FROM=gongguan] python3 cc_fruit_owner_probe.py <url> <out>"""
import os, sys, json, asyncio, base64
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; DAY = os.environ.get('DAY') or '2025-09-17'; HOUR = float(os.environ.get('HOUR') or 14)
FROMS = [x for x in (os.environ.get('FROM') or 'gongguan,campus').split(',') if x]
R = L.Run('fruit_owner', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
OWNER = r"""(()=>{ const E=GAME.E, G=GAME.G; const L=(E.npcs||[]).filter(n=>n&&n.fruitOwner); const all=(E.npcs||[]).filter(n=>n&&n.obj&&Math.hypot(n.obj.position.x-34.9,n.obj.position.z+6.15)<4);
  const f=n=>({name:n.name||'', id:n.charId||n.id||'', x:n.obj?+n.obj.position.x.toFixed(2):null, z:n.obj?+n.obj.position.z.toFixed(2):null, vis:n.obj?n.obj.visible!==false:null, hidden:!!n.hidden, pose:n.pose||null, fruitOwner:!!n.fruitOwner, d:n.obj?+Math.hypot(n.obj.position.x-34.9,n.obj.position.z+6.15).toFixed(2):null});
  let open=null; try{ open=typeof PLACES!=='undefined'&&PLACES.isOpen?PLACES.isOpen('wz_fruit',(+G.hour)%24,G.day):null; }catch(e){}
  return {zone:G.zone, h:+(+G.hour).toFixed(2), owners:L.map(f), near4m:all.map(f), hasFn:!!(typeof CLOSED!=='undefined'&&CLOSED.fruitOwner), open, npcs:(E.npcs||[]).length}; })()"""
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(55, c.width/c.height, 0.05, 300); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const P=E.player&&E.player.obj, pv=P?P.visible:null; if(P) P.visible=false; let url; try{ r.render(E.scene,cam); url=c.toDataURL('image/jpeg',0.9); } finally { if(P) P.visible=pv; } return url; })"""


async def record(pg, tag, res):
    await pg.wait_for_timeout(5000)
    o = await pg.evaluate(OWNER); res[tag] = o
    await pg.screenshot(path=os.path.join(OUT, 'fruit_%s_game.png' % tag))
    for nm, frm in (('zplus', [34.9, 1.6, -2.2]), ('zminus', [34.9, 1.6, -10.1])):
        u = await pg.evaluate(SNAP, {'from': frm, 'at': [34.9, 1.1, -6.15]})
        if u: open(os.path.join(OUT, 'fruit_%s_%s.jpg' % (tag, nm)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
    R.note('[%s] %s %.2f：fruitOwner %s；攤子 4 m 內的人 %s；CLOSED.fruitOwner 存在=%s；PLACES.isOpen(wz_fruit)=%s；npc 共 %s' % (tag, o['zone'], o['h'], J(o['owners']), J(o['near4m']), o['hasFn'], o['open'], o['npcs']))
    R.check('[%s] 營業中攤子後面有老闆（E.npcs 有 fruitOwner、看得到）' % tag, any(x['vis'] and not x['hidden'] for x in o['owners']), J(o['owners']))


async def main():
    print('CC 阿忠鮮果老闆：SHA %s；%s %.1f；FROM %s' % (SHA or '?', DAY, HOUR, FROMS), flush=True)
    res = {'sha': SHA}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        # A 正常走進去
        done = False
        for fz in FROMS:
            s = await D.load_zone(pg, cdp, fz, DAY, HOUR - 0.15, wait=7000)
            ex = await pg.evaluate("(()=>GAME.E.interactables.filter(i=>i.exit&&i.exit.to==='wenzhou'&&!i.hidden).map(i=>i.label))()")
            R.setup('[A] 【前置／捷徑】讀檔到 %s %s %.2f（條件事件關掉）；往溫州街的出口 %s' % (fz, DAY, HOUR - 0.15, J(ex)))
            if not ex: continue
            s2 = await D.use_exit(pg, cdp, '[A %s]' % fz, ex[0], 'wenzhou')
            if s2 and s2.get('zone') == 'wenzhou':
                await record(pg, 'A_walk_from_' + fz, res); done = True; break
        R.check('[A] 走得進溫州街', done, '')
        # B 讀檔直接進
        await pg.goto(URL); await L.wait_loaded(pg)
        s = await D.load_zone(pg, cdp, 'wenzhou', DAY, HOUR, wait=7000)
        R.setup('[B] 【前置／捷徑】applySave 直接讀到 wenzhou %s %.1f（條件事件關掉）' % (DAY, HOUR))
        await record(pg, 'B_applySave', res)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'fruit_owner.json'), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
