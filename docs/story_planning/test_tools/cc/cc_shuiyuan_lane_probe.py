"""CC-C 11-12：水源市場旁的巷子（X358 SHUIYUAN-MARKET-LANE-1112 v1；LAWWW2-C 1530a5411、開發分支 ba6cbce8b1；BB-C 05:59，使用者直接要的）。判定歸 BB。
期望（照配置 src/data/tingzhou_layout.js @ ba6cbce8b1，不是 CC 自己訂的）：
  巷子 M＝汀州路東側 z 19～28（中線 z 23.5）、長 24 m；公館 G10「往汀州路（巷子）」→ 汀州路 fromGongguan (27, 23.5)；巷口斑馬線 z 23.5；
  「往公館（羅斯福路）」toGongguan (28.6, 23.5) r 1.4 → 公館 (37.1, 18)；十攤 where laneM（z 20.2／20.4／26.8 兩排）；
  原巷 A（z −2.5～2.5）留著可走、晚上不擺攤（night false）。
PARTS：
  WALK   【前置／捷徑】讀檔到公館 (37.1, 17.5) 14:00（條件事件關掉）→ 照玩家走到「往汀州路（巷子）」按 → 汀州路出生點、站得住
         → 沿巷子中線走到西端巷口 (6.5, 23.5) → 過斑馬線到西側騎樓 (−6.4, 24) → 走回巷子東端「往公館」按 → 公館。
         搖桿（joy_path：每次問 E.pathTo 朝下一個中途點推）一趟、點地（playlib go_to）一趟；記卡住（2 秒動不到 0.1 m 的點）、E.unstick 的 console、walkFallbacks。
  ALLEYA 原巷 A：從汀州路騎樓 (6.4, 0) 走進 (20, 0) 再走出來；記走得到、出得來。
  SHOTS  14:00、20:30 各四張（拍照鏡頭，先跑 fadeWalls、藏玩家）：巷口往裡、巷中、市場那一面、從公館進來那一頭；每個時間拼一張。
  BUY    20:30：十攤每一攤照玩家走到「看＋店名」、按、選單選第一個買得起的品項（不選「算了」）→ 錢扣多少（比選項上的價錢）、G.flags.GG3_OWN 有沒有多（吃的照設計不進物品，記下來給 BB 判）、對話原文。
CC_02 清單 2026-11-12：1✓（開攤時間照 NM3.openNow；收攤的記「收攤」不判；套圈圈只週五六日擺照配置） 2✓（攤位、出入口、座標都從 TINGZHOU_LAYOUT／互動點讀） 3✓（十攤照配置順序一攤一攤試） 4✓（按前看互動鍵的字、選單照字選） 5✓（搖桿 joy_path 問 E.pathTo；點地 go_to；走不到附位置和站得住） 6✓（換區域等黑幕結束＋1.5 秒） 7✓ 8n/a（不判台詞；期望座標全從配置讀） 9✓（拍照藏玩家） 10✓（選單照字選、對話抄全文） 11✓ 12✓（記真的進了汀州路、真的站在巷子中線上） 13✓（分段走，每段記走法）
用法：LW_TESTS=<wt>/tests SHA=<sha> TAG=<名字> [PARTS=WALK,ALLEYA,SHOTS,BUY] python3 cc_shuiyuan_lane_probe.py <url> <out>"""
import os, sys, json, asyncio, time, math, base64
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright

URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
TAG = os.environ.get('TAG') or 'x'; SHA = os.environ.get('SHA') or ''
PARTS = (os.environ.get('PARTS') or 'WALK,ALLEYA,SHOTS,BUY').split(',')
R = L.Run('shuiyuan_' + TAG, OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-11-07'   # 週五（套圈圈有擺）；學期中
ME = "(()=>{ const P=GAME.E.player, p=P.obj.position, N=GAME.E.nav; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), free:N?N.free(p.x,p.z):null, stand:GAME.E.canStand?!!GAME.E.canStand(p.x,p.z,0.3,P.lv|0):null, ent:!!(GAME.isEntering&&GAME.isEntering()), fb:GAME.walkFallbacks|0}; })()"
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,gate:!!i.tzGate,nm:i.nmStall||null,kind:i.nmKind||null})))()"
LAY = "(()=>{ const L=TINGZHOU_LAYOUT; return {alleys:L.alleys, from:L.fromGongguan, to:L.toGongguan, crossings:L.crossings, stalls:(L.stalls&&L.stalls.list||L.stalls||[]).filter?(L.stalls.list||L.stalls).filter(s=>s&&s.where):null}; })()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||55, c.width/c.height, 0.1, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const pv=P?P.visible:true; if(P) P.visible=false; try{ r.render(E.scene,cam); return c.toDataURL('image/jpeg',0.85); } finally { if(P) P.visible=pv; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
SHEET = r"""(async a=>{ const ims=await Promise.all(a.urls.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.onerror=()=>res(null); q.src=u; })));
  const w=560, h=315, k=document.createElement('canvas'); k.width=w*2; k.height=h*2+40; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height); g.fillStyle='#fff'; g.font='bold 18px sans-serif'; g.fillText(a.title,8,26);
  ims.forEach((im,i)=>{ const x=(i%2)*w, y=40+Math.floor(i/2)*h; if(im) g.drawImage(im,x,y,w,h); g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(x,y,w,22); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(a.labels[i],x+6,y+16); });
  return k.toDataURL('image/jpeg',0.85); })"""
UNSTICK_LOG = []


async def at(pg, cdp, zone, h, x=None, z=None, why=''):
    s = await D.load_zone(pg, cdp, zone, DAY, h, x, z, wait=8000)
    R.setup('【前置／捷徑】讀檔到 %s %s %.2f 時%s %s' % (zone, DAY, h, '' if x is None else ' (%.1f, %.1f)' % (x, z), why))
    return s


async def joy_path(pg, cdp, tx, tz, near=0.6, max_s=60):
    """搖桿：每次問 E.pathTo 下一個中途點朝那裡推（同 cc_tingzhou_probe）；記卡住的點。回傳 (到了沒, 秒數, 卡住)"""
    t0 = time.time(); stuck = []; last = None; tl = time.time()
    while time.time() - t0 < max_s:
        m_ = await pg.evaluate(ME); d_ = math.hypot(tx - m_['x'], tz - m_['z'])
        if d_ < near: return True, round(time.time() - t0, 1), stuck
        if last and math.hypot(m_['x'] - last[0], m_['z'] - last[1]) > 0.1: last = (m_['x'], m_['z']); tl = time.time()
        elif not last: last = (m_['x'], m_['z'])
        elif time.time() - tl > 2: stuck.append([m_['x'], m_['z'], m_['stand']]); tl = time.time()
        ah = await pg.evaluate("(a=>{ const E=GAME.E,P=E.player,o=P.obj.position; const r=E.pathTo?E.pathTo(o.x,o.z,P.lv|0,a[0],a[1],P.lv|0):null; if(!r||!r.length) return null; const q=r[Math.min(1,r.length-1)]; return Array.isArray(q)?q:[q.x,q.z]; })", [tx, tz])
        gx, gz = ah or [tx, tz]; dd_ = math.hypot(gx - m_['x'], gz - m_['z']) or 0.01
        yaw = await pg.evaluate("GAME.E.cam.yaw"); fx_, fz_ = -math.sin(yaw), -math.cos(yaw); rx_, rz_ = math.cos(yaw), -math.sin(yaw)
        vx_, vz_ = (gx - m_['x']) / dd_, (gz - m_['z']) / dd_; sx_, sy_ = vx_ * rx_ + vz_ * rz_, -(vx_ * fx_ + vz_ * fz_); mm_ = math.hypot(sx_, sy_) or 1
        mag = 45 if d_ > 2 else max(18, 45 * d_ / 2); await L.joystick(pg, cdp, sx_ / mm_ * mag, sy_ / mm_ * mag, 400 if d_ > 2 else 250)
    return False, round(time.time() - t0, 1), stuck


async def walk(pg, cdp, mode, tx, tz, label, near=0.6, max_s=90):
    if mode == 'joy':
        ok, secs, stuck = await joy_path(pg, cdp, tx, tz, near, max_s)
    else:
        t0 = time.time(); ok = await L.go_to(pg, cdp, R, tx, tz, near, label, max_s=max_s); secs = round(time.time() - t0, 1); stuck = []
    me = await pg.evaluate(ME)
    R.check('%s 走到 (%.1f, %.1f)（%s，%.1f 秒）' % (label, tx, tz, '搖桿' if mode == 'joy' else '點地', secs), bool(ok), J({'me': me, 'stuck': stuck[:6]}))
    if stuck: R.note('%s 途中卡住（2 秒動不到 0.1 m）%d 次：%s' % (label, len(stuck), J(stuck[:8])))
    return ok


async def tap_it(pg, cdp, it, tag):
    await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.8), '%s 走到「%s」' % (tag, it['label']), max_s=90)
    await pg.wait_for_timeout(600); s = await L.state(pg)
    if not s['interact'].startswith(it['label'][:3]): R.note('%s「%s」旁邊互動鍵是「%s」' % (tag, it['label'], s['interact']))
    await L.tap(pg, cdp, '#interact')


async def wait_zone(pg, want, secs=40):
    t0 = time.time()
    while time.time() - t0 < secs:
        me = await pg.evaluate(ME)
        if me['zone'] == want and not me['ent']: await pg.wait_for_timeout(1500); return await pg.evaluate(ME)
        await pg.wait_for_timeout(200)
    return await pg.evaluate(ME)


async def part_walk(pg, cdp, lay):
    for mode in ('joy', 'tap'):
        tag = '[WALK %s]' % ('搖桿' if mode == 'joy' else '點地'); n0 = len(UNSTICK_LOG)
        await at(pg, cdp, 'gongguan', 14.0, 37.1, 17.5, '（公館店面街 G10 前的人行道）'); fb0 = await pg.evaluate("GAME.walkFallbacks|0")
        it = next((i for i in await pg.evaluate(ITS) if i['gate']), None)
        if not R.check('%s 公館有「往汀州路（巷子）」' % tag, bool(it), ''): continue
        await tap_it(pg, cdp, it, tag); me = await wait_zone(pg, 'tingzhou')
        fr = lay['from']
        R.check('%s 進到汀州路、出生在巷子東端 fromGongguan (%s, %s)、站得住' % (tag, fr['x'], fr['z']), me['zone'] == 'tingzhou' and abs(me['z'] - fr['z']) < 1.5 and bool(me['stand']), J(me))
        await pg.screenshot(path=os.path.join(OUT, 'walk_%s_in.jpg' % mode), type='jpeg', quality=70)
        M = next((a for a in lay['alleys'] if a.get('market')), None) or {'z0': 19, 'z1': 28}; zc = (M['z0'] + M['z1']) / 2
        await walk(pg, cdp, mode, 17.0, zc, '%s 巷子中段' % tag)
        await walk(pg, cdp, mode, 6.5, zc, '%s 巷子西端巷口' % tag)
        await walk(pg, cdp, mode, -6.4, zc + 0.5, '%s 過斑馬線到西側騎樓' % tag, max_s=120)
        await pg.screenshot(path=os.path.join(OUT, 'walk_%s_west.jpg' % mode), type='jpeg', quality=70)
        await walk(pg, cdp, mode, 6.5, zc, '%s 走回巷口' % tag, max_s=120)
        back = next((i for i in await pg.evaluate(ITS) if i['to'] == 'gongguan'), None)
        if not R.check('%s 汀州路有「往公館」（在巷子東端）' % tag, bool(back) and abs(back['z'] - zc) < 3, J(back)): continue
        await tap_it(pg, cdp, back, tag + ' 回'); me = await wait_zone(pg, 'gongguan')
        R.check('%s 回到公館、站得住' % tag, me['zone'] == 'gongguan' and bool(me['stand']), J(me))
        fb = await pg.evaluate("GAME.walkFallbacks|0"); un = UNSTICK_LOG[n0:]
        R.check('%s 沒有自動放過去（walkFallbacks %s→%s）、沒有 unstick（console %d 則）' % (tag, fb0, fb, len(un)), fb == fb0 and not un, J(un[:5]))


async def part_alleya(pg, cdp, lay):
    tag = '[ALLEYA]'; A = next((a for a in lay['alleys'] if a.get('id') == 'A'), None)
    if not R.check('%s 配置還有巷 A' % tag, bool(A), J(lay['alleys'])): return
    zc = (A['z0'] + A['z1']) / 2; n0 = len(UNSTICK_LOG)
    await at(pg, cdp, 'tingzhou', 14.0, 6.4, zc, '（汀州路東側騎樓、巷 A 口）')
    await walk(pg, cdp, 'tap', 20.0, zc, '%s 走進巷 A' % tag)
    await pg.screenshot(path=os.path.join(OUT, 'alleyA_in.jpg'), type='jpeg', quality=70)
    await walk(pg, cdp, 'joy', 6.4, zc, '%s 走出巷 A' % tag)
    R.check('%s 沒有 unstick' % tag, not UNSTICK_LOG[n0:], J(UNSTICK_LOG[n0:][:5]))


async def part_shots(pg, cdp, lay):
    M = next((a for a in lay['alleys'] if a.get('market')), None) or {'z0': 19, 'z1': 28}; zc = (M['z0'] + M['z1']) / 2
    views = [('巷口往裡', (3.5, 1.6, zc), (22, 1.4, zc)), ('巷中', (14, 1.7, zc - 1.5), (26, 1.5, zc + 1.0)),
             ('市場那一面', (15, 1.6, M['z0'] + 0.8), (15, 2.5, M['z1'] + 1)), ('從公館進來那一頭', (28.5, 1.6, zc), (5, 1.4, zc))]
    for h in (14.0, 20.5):
        await at(pg, cdp, 'tingzhou', h, 6.4, zc - 3, '（拍照）'); await pg.evaluate(D.HUD + '(false)'); await pg.wait_for_timeout(2500)
        urls = [await pg.evaluate(SNAP, {'from': list(f), 'at': list(t)}) for _, f, t in views]
        await pg.evaluate(D.HUD + '(true)')
        sh = await pg.evaluate(SHEET, {'urls': urls, 'labels': [v[0] for v in views], 'title': '水源市場旁的巷子 %s（%s，%s）' % ('14:00' if h < 15 else '20:30', TAG, SHA[:9])})
        open(os.path.join(OUT, 'shots_%s.jpg' % ('1400' if h < 15 else '2030')), 'wb').write(base64.b64decode(sh.split(',', 1)[1]))
        for i, u in enumerate(urls): open(os.path.join(OUT, 'shot_%s_%d.jpg' % ('1400' if h < 15 else '2030', i + 1)), 'wb').write(base64.b64decode(u.split(',', 1)[1]))
        R.note('[SHOTS %.1f] 四張已存（判畫面給 BB）' % h)


async def part_buy(pg, cdp, lay):
    await at(pg, cdp, 'tingzhou', 20.5, 6.4, 23.5, '（夜市時段）')
    its = [i for i in await pg.evaluate(ITS) if i['nm']]
    R.note('[BUY] 互動點裡的攤位 %d 個：%s' % (len(its), J([[i['nm'], i['kind'], i['label'], i['x'], i['z']] for i in its])))
    lane = [i for i in its if 19 <= i['z'] <= 28]
    R.check('[BUY] 巷子裡（z 19～28）有十攤的互動點', len(lane) >= 10, J([[i['nm'], i['z']] for i in its]))
    for it in lane:
        tag = '[BUY %s %s]' % (it['nm'], it['label'])
        m0 = await pg.evaluate("GAME.G.money|0"); own0 = await pg.evaluate("JSON.stringify((GAME.G.flags||{}).GG3_OWN||null)")
        await tap_it(pg, cdp, it, tag); lines = []; picked = None; t0 = time.time()
        while time.time() - t0 < 40:
            q = await D.st(pg)
            if q['choices']:
                opts = q['choices']
                if picked is None:
                    k = next((i for i, t in enumerate(opts) if '元' in t and not t.startswith('算了')), None)
                    if k is None: R.note('%s 選單沒有買得起的品項：%s' % (tag, J(opts))); k = len(opts) - 1
                    picked = opts[k]
                else: k = len(opts) - 1
                await L.tap(pg, cdp, '#choices button:nth-child(%d)' % (k + 1)); await pg.wait_for_timeout(800); continue
            if q['dlg']:
                t = await pg.evaluate("(()=>{ const d=document.getElementById('dlg'); return d?(d.innerText||'').replace('▼ 點一下繼續','').trim():''; })()")
                if t and (not lines or lines[-1] != t): lines.append(t)
                await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(450); continue
            if not q['busy']: break
            await pg.wait_for_timeout(300)
        m1 = await pg.evaluate("GAME.G.money|0"); own1 = await pg.evaluate("JSON.stringify((GAME.G.flags||{}).GG3_OWN||null)")
        price = None
        if picked:
            import re
            mm = re.search(r'(\d+)\s*元', picked); price = int(mm.group(1)) if mm else None
        closed = not picked and any(('收' in x or '休息' in x) for x in lines)
        if closed: R.note('%s 收攤／今天沒擺（照設計，不判）：%s' % (tag, J(lines))); continue
        R.check('%s 買得到、錢扣對（選「%s」，%s → %s，價錢 %s）' % (tag, (picked or '').split('\n')[0], m0, m1, price), picked is not None and price is not None and m0 - m1 == price, J({'lines': lines[:8]}))
        R.note('%s 物品 GG3_OWN %s → %s（吃的照設計可能不進物品，給 BB 判）；對話 %s' % (tag, own0, own1, J(lines)))


async def main():
    print('CC 水源市場旁的巷子：TAG %s；SHA %s；PARTS %s；Windows＋GPU ≠ iPhone' % (TAG, SHA or '?', ','.join(PARTS)), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        pg.on('console', lambda m: UNSTICK_LOG.append(m.text[:200]) if 'unstick' in m.text.lower() else None)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); sys.exit(1)
        await at(pg, cdp, 'tingzhou', 14.0)
        lay = await pg.evaluate(LAY); R.note('配置：巷子 %s；fromGongguan %s；toGongguan %s；斑馬線 %s' % (J(lay['alleys']), J(lay['from']), J(lay['to']), J(lay['crossings'])))
        for part, fn in (('WALK', part_walk), ('ALLEYA', part_alleya), ('SHOTS', part_shots), ('BUY', part_buy)):
            if part not in PARTS: continue
            try: await fn(pg, cdp, lay)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
    sys.exit(1 if R.fails else 0)

asyncio.run(main())
