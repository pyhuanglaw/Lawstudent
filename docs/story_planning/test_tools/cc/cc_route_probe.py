"""CC-C 11-12：通用「照玩家走一條路線」探針（第一個用途：W1R＝QA-W1-VISUAL BB_398 的 A2／A3／B3～B6，BB-C 11:27 交排，結果給 BB 判）。Playwright（PC GPU）≠ iPhone。
【前置／捷徑】讀檔到 ZONE（DAY HOUR；有 X、Z 就站那裡，條件事件關掉）→ 照 ROUTE 一步一步做（+ 分隔），每一步完記：區域、層、位置、高度、站不站得住、坐著沒、
  鏡頭到祐廷頭部的射線被什麼擋（名字、距離）、互動鍵的字，截圖一張（route_<TAG>_<步>_<種類>.png）。
  ROUTE 的步驟：
    exit:<區域 id>          走到 exit.to＝那一區的出口（d141 use_exit：範圍裡站得住的點、按鈕對了才按）→ 等換區域
    go:<字>[><選項字>]       走到標籤含那個字的互動點（先找同一層）→ 按 → 對話一句一句點；選單選含<選項字>的（沒給＝第 1 個）→ 等 3 秒
    press:<字>[><選項字>]    同 go，但按下去以後先每 0.5 秒截一張、共 4 秒（看演出當下：躺上床、搭電梯），再點對話
    sit:<字>                 走到標籤含那個字的座位（D.sit_all only＝那一張：點椅子、看按鈕、坐下、位置高度、起身推得動）
    walk:<x>,<z>[,<lv>]      go_to 那一點
    look:<yaw>               鏡頭轉到那個方向（E.cam.yaw）再截一張（看牆、天花板）
    wait:<秒>
    burst:<名字>             站著不動每 0.25 秒截一張、共 2 秒（看閃）
    study:<字>,<次數>        W1R D5：走到標籤含那個字的座位（例：坐下讀書）按 → 坐下以後選單選「讀書…」那一個，重複 <次數> 次；每次記時間前後、#caption／#toast 的字、目標列，截圖（看時段用完跳下一時段、字幕）
CC_02 清單 2026-11-12：1✓（日子時間照佇列：平日白天或晚上） 2✓（出口、互動點、座位照 exit.to／標籤從遊戲找） 3✓（每一支一次讀檔、照順序走） 4✓（選項照字） 5✓（go_to／use_exit 走過去，照玩家） 6✓（每一步 settle、換區等 2.5 秒） 7✓ 8n/a（不判，給 BB） 9n/a（不藏人：照原樣） 10✓（條件事件關掉） 11✓ 12✓（每一步同樣欄位） 13✓（讀檔捷徑標）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> ZONE=dorm [X= Z= LV=] [DAY=2025-10-14] [HOUR=14] ROUTE=exit:dorm_hall+go:樓梯+... python3 cc_route_probe.py <url> <out>"""
import os, sys, json, asyncio
HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
SHA = (os.environ.get('SHA') or '')[:10]; TAG = os.environ.get('TAG') or 'x'
ZONE = os.environ.get('ZONE') or 'dorm'; DAY = os.environ.get('DAY') or '2025-10-14'; HOUR = float(os.environ.get('HOUR') or 14)
X = os.environ.get('X'); Z = os.environ.get('Z'); LV = int(os.environ.get('LV') or 0)
ROUTE = [s for s in (os.environ.get('ROUTE') or '').split('+') if s]
R = L.Run('route_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
STATE = r"""(()=>{ const E=GAME.E, G=GAME.G, P=E.player, o=P.obj, r2=v=>+(+v).toFixed(2); const cam=E.camera, cp=new THREE.Vector3(); cam.getWorldPosition(cp);
  const B=new THREE.Box3().setFromObject(o), head=new THREE.Vector3((B.min.x+B.max.x)/2, B.max.y-0.12, (B.min.z+B.max.z)/2), dir=head.clone().sub(cp), dist=dir.length(); dir.normalize();
  const rc=new THREE.Raycaster(cp,dir,0.02,Math.max(0.05,dist-0.2)); const own=new Set(); o.traverse(x=>own.add(x));
  const hit=rc.intersectObjects(E.scene.children,true).filter(h=>h.object.isMesh&&h.object.visible!==false&&!own.has(h.object)&&!(h.object.material&&h.object.material.transparent&&h.object.material.opacity<0.3)).slice(0,3).map(h=>({name:String(h.object.name||'')+'<'+String((h.object.parent&&h.object.parent.name)||'')+'>', d:r2(h.distance)}));
  let stand=null; try{ stand=E.canStand?E.canStand(o.position.x,o.position.z,0.25,P.lv|0):null; }catch(e){}
  return {zone:G.zone, lv:P.lv|0, x:r2(o.position.x), z:r2(o.position.z), y:r2(o.position.y), yaw:r2(o.rotation.y), seat:!!P.seat, pose:P.pose||null, stand, h:r2(G.hour),
    cam:[r2(cp.x),r2(cp.y),r2(cp.z)], camToHead:r2(dist), blocked:hit, interact:(document.getElementById('interact')||{}).textContent||''}; })()"""
FIND = r"""(a=>{ const E=GAME.E, lv=E.player.lv|0; const L=E.interactables.map((i,ix)=>({i,ix})).filter(({i})=>!i.hidden&&(i.label||'').indexOf(a.t)>=0&&(!a.seat||i.seat));
  L.sort((p,q)=>((p.i.lv|0)!==lv)-((q.i.lv|0)!==lv)||Math.hypot(p.i.x-E.player.obj.position.x,p.i.z-E.player.obj.position.z)-Math.hypot(q.i.x-E.player.obj.position.x,q.i.z-E.player.obj.position.z));
  const f=L[0]; return f?{ix:f.ix, x:+f.i.x.toFixed(2), z:+f.i.z.toFixed(2), lv:f.i.lv|0, label:f.i.label, r:f.i.radius||null, seat:f.i.seat?[f.i.seat.x,f.i.seat.z]:null}:null; })"""
DLG = r"""(()=>{ const d=document.getElementById('dlg'); return {dlg:!!(d&&d.offsetParent), t:(document.getElementById('dlgText')||{}).textContent||'', who:(document.getElementById('dlgName')||{}).textContent||'',
  choices:[...document.querySelectorAll('#choices button')].filter(b=>b.offsetParent).map(b=>b.textContent.trim()), busy:!!(GAME.E.player&&GAME.E.player.busy)}; })()"""


async def record(pg, k, kind, note=''):
    s = await pg.evaluate(STATE); name = 'route_%s_%02d_%s' % (TAG, k, kind)
    await pg.screenshot(path=os.path.join(OUT, name + '.png'))
    R.note('[%02d %s] %s 區域 %s lv%s (%s, %s) y=%s 站得住=%s 坐著=%s pose=%s；鏡頭 %s 到頭 %s m、被 %s 擋；互動鍵「%s」' % (k, kind, note, s['zone'], s['lv'], s['x'], s['z'], s['y'], s['stand'], s['seat'], s['pose'], s['cam'], s['camToHead'], J(s['blocked']), s['interact']))
    return s


async def talk(pg, cdp, want):
    lines = []
    for j in range(60):
        st = await pg.evaluate(DLG)
        if st['choices']:
            i = next((n for n, t in enumerate(st['choices']) if want and want in t), 0)
            lines.append('▶ ' + st['choices'][i] + '（' + ' / '.join(st['choices']) + '）')
            await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(900); continue
        if st['dlg']:
            ln = st['who'] + '｜' + st['t']
            if not lines or lines[-1] != ln: lines.append(ln)
            await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
        if not st['busy'] and j > 2: break
        await pg.wait_for_timeout(500)
    return lines


async def main():
    print('CC 照玩家走路線：TAG %s；SHA %s；%s %s %.1f；ROUTE %s' % (TAG, SHA or '?', ZONE, DAY, HOUR, ROUTE), flush=True)
    res = {'tag': TAG, 'sha': SHA, 'steps': []}
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        if X is not None: s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, x=float(X), z=float(Z), lv=LV, wait=7000)
        else: s = await D.load_zone(pg, cdp, ZONE, DAY, HOUR, wait=7000)
        R.setup('【前置／捷徑】讀檔到 %s %s %.1f%s（條件事件關掉）' % (ZONE, DAY, HOUR, (' (%s, %s) lv%d' % (X, Z, LV)) if X is not None else '（出生點）'))
        if not R.check('讀到 %s' % ZONE, s['zone'] == ZONE, J(s)): await b.close(); sys.exit(1)
        res['steps'].append({'k': 0, 'kind': 'start', 's': await record(pg, 0, 'start')})
        for k, step in enumerate(ROUTE, 1):
            kind, _, arg = step.partition(':'); t = '[%02d %s]' % (k, step); out = {'k': k, 'step': step}
            try:
                if kind == 'exit':
                    exs = await pg.evaluate("(to=>GAME.E.interactables.filter(i=>i.exit&&String(i.exit.to||'').indexOf(to)===0&&!i.hidden).map(i=>i.label))", arg)
                    if not R.check('%s 找得到往 %s 的出口' % (t, arg), bool(exs), J(await pg.evaluate("GAME.E.interactables.filter(i=>i.exit).map(i=>[i.label,i.exit.to])"))): res['steps'].append(out); break
                    to = await pg.evaluate("(a=>{ const i=GAME.E.interactables.find(i=>i.exit&&String(i.exit.to||'').indexOf(a)===0&&!i.hidden); return i.exit.to; })", arg)
                    s2 = await D.use_exit(pg, cdp, t, exs[0], to)
                    out['s'] = await record(pg, k, 'exit', '出口「%s」→ %s' % (exs[0], to))
                    if not s2 or s2.get('zone') != to: res['steps'].append(out); break
                elif kind in ('go', 'sit', 'press'):
                    txt, _, want = arg.partition('>')
                    f = await pg.evaluate(FIND, {'t': txt, 'seat': kind == 'sit'})
                    if not R.check('%s 找得到標籤含「%s」的%s' % (t, txt, '座位' if kind == 'sit' else '互動點'), bool(f), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>[i.label,i.lv|0])"))): res['steps'].append(out); break
                    if kind == 'sit':
                        rs = await D.sit_all(pg, cdp, t, 'route_%s_%02d' % (TAG, k), only=[tuple(f['seat'])]); out['sit'] = rs
                        out['s'] = await record(pg, k, 'sit', '坐「%s」結果 %s' % (f['label'], J(rs)))
                    else:
                        await L.go_to(pg, cdp, R, f['x'], f['z'], 0.6, f['label'], max_s=120, lv=f['lv']); await D.settle(pg)
                        out['before'] = await record(pg, k, 'at', '走到「%s」(%s, %s) lv%s' % (f['label'], f['x'], f['z'], f['lv']))
                        await L.tap(pg, cdp, '#interact')
                        if kind == 'press':
                            mid = []
                            for j in range(8):
                                await pg.wait_for_timeout(500); mid.append(await record(pg, k, 'press%d' % j))
                            out['mid'] = mid
                        else: await pg.wait_for_timeout(1200)
                        out['lines'] = await talk(pg, cdp, want); await pg.wait_for_timeout(3000); await L.close_panels(pg, cdp)
                        out['s'] = await record(pg, k, 'after', '按了「%s」：%s' % (f['label'], J(out['lines'])))
                elif kind == 'walk':
                    a = [float(v) for v in arg.split(',')]
                    await L.go_to(pg, cdp, R, a[0], a[1], 0.5, step, max_s=120, lv=int(a[2]) if len(a) > 2 else None); await D.settle(pg)
                    out['s'] = await record(pg, k, 'walk')
                elif kind == 'look':
                    await pg.evaluate("(y=>{ GAME.E.cam.yaw=y; })", float(arg)); await pg.wait_for_timeout(700)
                    out['s'] = await record(pg, k, 'look', 'yaw=%s' % arg)
                elif kind == 'wait':
                    await pg.wait_for_timeout(int(float(arg) * 1000)); out['s'] = await record(pg, k, 'wait')
                elif kind == 'study':
                    txt, _, nn = arg.partition(','); nn = int(nn or 4)
                    f = await pg.evaluate(FIND, {'t': txt, 'seat': False})
                    if not R.check('%s 找得到「%s」' % (t, txt), bool(f), J(await pg.evaluate("GAME.E.interactables.filter(i=>!i.hidden).map(i=>[i.label,i.lv|0])"))): res['steps'].append(out); break
                    await L.go_to(pg, cdp, R, f['x'], f['z'], 0.5, f['label'], max_s=120, lv=f['lv']); await D.settle(pg)
                    await L.tap(pg, cdp, '#interact'); await pg.wait_for_timeout(1500)
                    rounds = []
                    for r_ in range(nn):
                        h0 = await pg.evaluate("+GAME.G.hour"); picked = None; seen = []
                        for j in range(40):
                            st = await pg.evaluate(DLG)
                            if st['choices']:
                                i = next((n_ for n_, x in enumerate(st['choices']) if x.startswith('讀書') or '讀書' in x), None)
                                if i is None or picked: i = next((n_ for n_, x in enumerate(st['choices']) if any(w in x for w in ('繼續', '好', '讀'))), 0) if not picked else next((n_ for n_, x in enumerate(st['choices']) if any(w in x for w in ('繼續', '好'))), 0)
                                picked = picked or st['choices'][i]; seen.append(st['choices'])
                                await pg.evaluate("(i=>{ const b=[...document.querySelectorAll('#choices button')].filter(x=>x.offsetParent); (b[i]||b[0]).click(); })(%d)" % i); await pg.wait_for_timeout(1200)
                                if picked and j > 0: break
                                continue
                            if st['dlg']: await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(500); continue
                            if picked: break
                            await pg.wait_for_timeout(500)
                        await pg.wait_for_timeout(1500)
                        cap = await pg.evaluate("(()=>({h:+(+GAME.G.hour).toFixed(2), day:GAME.G.day, cap:(document.getElementById('caption')||{}).textContent||'', toast:(document.getElementById('toast')||{}).textContent||'', goal:(document.getElementById('goal')||document.querySelector('.goal')||{}).textContent||'', seat:!!GAME.E.player.seat, study:(GAME.G.stats||{}).study}))()")
                        await pg.screenshot(path=os.path.join(OUT, 'route_%s_%02d_study_%d.png' % (TAG, k, r_ + 1)))
                        rounds.append({'h0': h0, 'picked': picked, 'menus': seen, 'after': cap})
                        R.note('%s 第 %d 次：選「%s」；時間 %.2f → %s；字幕「%s」；toast「%s」；目標列「%s」；還坐著 %s；stats.study %s' % (t, r_ + 1, picked, h0, cap['h'], cap['cap'], cap['toast'], cap['goal'][:80], cap['seat'], cap['study']))
                    out['study'] = rounds; out['s'] = await record(pg, k, 'study')
                elif kind == 'burst':
                    for j in range(8):
                        await pg.screenshot(path=os.path.join(OUT, 'route_%s_%02d_burst_%s_%d.png' % (TAG, k, arg, j))); await pg.wait_for_timeout(250)
                    out['s'] = await record(pg, k, 'burst')
                else:
                    R.note('%s 不認得的步驟' % t)
            except Exception as e:
                R.check('%s 沒有探針例外' % t, False, str(e)[:200]); res['steps'].append(out); break
            res['steps'].append(out)
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    open(os.path.join(OUT, 'route_%s.json' % TAG), 'w', encoding='utf-8').write(J(res))
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
