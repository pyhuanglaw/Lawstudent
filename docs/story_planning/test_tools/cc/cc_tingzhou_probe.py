"""CC（帳號 A）11-10：TINGZHOU_V1（汀州路商圈第 1 版，X321／X322；BB 20:45；開發分支 7a625da3c）。Playwright（PC GPU）≠ iPhone。
對照的程式（7a625da3c）：src/data/tingzhou_layout.js（路 x −5～5、騎樓 3.2 m、立面 x ±5、店面 x ±8.2；walk z −40～40；巷 A 東側 z −2.5～2.5；fromGongguan (27,0)；
  toGongguan (28.6,0) r1.4 → 公館 (37.1,18)；shops 西側 W／東側 E）、src/tingzhou3d.js（店的互動：label「看＋店名」或「進＋店名」、look 原文；公館 G10 門口「往汀州路（巷子）」tzGate）。
PARTS：
  GATE   【前置】讀檔到公館 (37.1,17.5) 14:00 → 觸控走到「往汀州路（巷子）」按 → tingzhou：出生點、站得住、黑幕秒數（GAME.isEntering）、walkFallbacks
         → 走到「往公館（羅斯福路）」按 → 公館：出生點；來回兩次。
  SHOPS  八間（泰米村食、洗樂洗衣坊、印得好、越好吃小館、客居雲南、東南大聯商行、汀州聯通、溫特寶邸）：觸控走到互動點、按、記字幕／對話原文（「進」的：進去以後記區域再走出口回來）。
  WALK   沿路中間 x 0 從 z −38 走到 38（每 8 m 一個點、真的走）；試走出地圖（z −50、50、x −20、30）→ 停下來的位置；兩側騎樓 x ±6.6 每 10 m 走一次（記卡住的點）；巷 A 走到 (20,0) 再回 (0,0)。
  OLD    【前置】公館 G09～G11 門口（照公館現在的店門互動點 x、z 21）各讀一次舊格式存檔（pos 在那裡）→ 站得住（E.nav.free、讀檔後位置）；記那附近的互動點現在顯示什麼。
  SHOTS  14:00、18:30、20:30 各一組（拍照鏡頭，先跑 zone.fadeWalls）：巷 A 出口看泰米村食、概念圖機位 (4.6,1.65,34.5)→(−6.5,3,12)、路中間往南／往北、八間各自正面；
         玩家視角走路中兩張（遊戲鏡頭）；每個時間拼一張。
  FPS    中畫質站路中間 (0,0) 10 秒 requestAnimationFrame。
用法：LW_TESTS=<wt>/tests [PARTS=GATE,SHOPS,WALK,OLD,SHOTS,FPS] python3 cc_tingzhou_probe.py <url> <out>"""
import os, sys, json, asyncio, time, base64, math
sys.path.insert(0, os.environ.get('LW_TESTS') or 'tests'); HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE)
import playlib as L
import cc_d141_lib as D
from playwright.async_api import async_playwright
URL, OUT = sys.argv[1], sys.argv[2]; os.makedirs(OUT, exist_ok=True)
PARTS = (os.environ.get('PARTS') or 'GATE,SHOPS,WALK,OLD,SHOTS,FPS').split(',')
R = L.Run('tingzhou', OUT); D.setup(R, OUT)
J = lambda o: json.dumps(o, ensure_ascii=False)
DAY = '2025-11-01'
SHOPS8 = ['泰米村食', '洗樂洗衣坊', '印得好', '越好吃小館', '客居雲南', '東南大聯商行', '汀州聯通', '溫特寶邸']
ME = "(()=>{ const P=GAME.E.player, p=P.obj.position, N=GAME.E.nav; return {zone:GAME.G.zone, h:+(+GAME.G.hour).toFixed(2), x:+p.x.toFixed(2), z:+p.z.toFixed(2), free:N?N.free(p.x,p.z):null, ent:!!(GAME.isEntering&&GAME.isEntering()), busy:!!P.busy, fb:GAME.walkFallbacks|0}; })()"
ITS = "(()=>(GAME.E.interactables||[]).filter(i=>!i.hidden).map(i=>({label:i.label,x:+i.x.toFixed(2),z:+i.z.toFixed(2),r:i.radius||1.2,to:i.exit?i.exit.to:null,look:i.look||null,tz:i.tzShop||null,gate:!!i.tzGate})))()"
SNAP = r"""(a=>{ const E=GAME.E, r=E.renderer, c=r.domElement; const cam=new THREE.PerspectiveCamera(a.fov||50, c.width/c.height, 0.1, 400); cam.position.set(...a.from); cam.lookAt(...a.at); cam.updateMatrixWorld(true);
  const z=E.zone, P=E.player&&E.player.obj; if(z&&z.fadeWalls){ try{ z.fadeWalls(cam,P?P.position:cam.position); if(E.hideFaded) E.hideFaded(); }catch(e){} }
  const hid=[]; if(P){ hid.push([P,P.visible]); P.visible=false; }
  try{ r.render(E.scene,cam); const k=document.createElement('canvas'); k.width=a.tw; k.height=Math.round(a.tw*c.height/c.width); const g=k.getContext('2d'); g.drawImage(c,0,0,k.width,k.height);
    g.fillStyle='rgba(0,0,0,0.6)'; g.fillRect(0,0,k.width,20); g.fillStyle='#fff'; g.font='14px sans-serif'; g.fillText(a.label,5,15); (window.__TZ=window.__TZ||[]).push(k.toDataURL('image/jpeg',0.86));
    return a.full?c.toDataURL('image/jpeg',0.88):null; } finally { for(const [o,v] of hid) o.visible=v; if(z&&z.fadeWalls&&E.camera){ try{ z.fadeWalls(E.camera,P.position); if(E.hideFaded) E.hideFaded(); }catch(e){} } } })"""
PUSHGAME = "(u=>{ (window.__TZ=window.__TZ||[]).push(u); })"
MONT = r"""(async a=>{ const L=window.__TZ||[]; const ims=await Promise.all(L.map(u=>new Promise(res=>{ const q=new Image(); q.onload=()=>res(q); q.src=u; })));
  const w=420, h=Math.round(420*ims[0].height/ims[0].width), C=a.cols, rows=Math.ceil(ims.length/C), k=document.createElement('canvas'); k.width=w*C; k.height=h*rows+28; const g=k.getContext('2d'); g.fillStyle='#000'; g.fillRect(0,0,k.width,k.height);
  g.fillStyle='#fff'; g.font='bold 20px sans-serif'; g.fillText(a.title,8,21); ims.forEach((im,i)=>g.drawImage(im,(i%C)*w,28+Math.floor(i/C)*h,w,h)); return k.toDataURL('image/jpeg',0.86); })"""


def save(u, fn):
    if u: open(os.path.join(OUT, fn), 'wb').write(base64.b64decode(u.split(',', 1)[1]))


async def at(pg, cdp, zone, h, x=None, z=None, why=''):
    await D.load_zone(pg, cdp, zone, DAY, h, x, z, wait=8000)
    R.setup('【前置／捷徑】讀檔到 %s %s %.1f 時%s %s' % (zone, DAY, h, '' if x is None else ' (%.1f,%.1f)' % (x, z), why))


async def tap_it(pg, cdp, it, tag, max_s=120):
    ok = await L.go_to(pg, cdp, R, it['x'], it['z'], min(0.9, it['r'] * 0.8), '%s 走到「%s」' % (tag, it['label']), max_s=max_s)
    await pg.wait_for_timeout(600); s = await L.state(pg)
    if not s['interact']: R.note('%s「%s」旁邊沒有按鈕：%s' % (tag, it['label'], J({k: s[k] for k in ('x', 'z', 'interact')})))
    await L.tap(pg, cdp, '#interact'); return ok


async def wait_zone(pg, want, t0, secs=40):
    ent_end = None
    while time.time() - t0 < secs:
        me = await pg.evaluate(ME)
        if me['zone'] == want and not me['ent']: ent_end = round(time.time() - t0, 2); break
        await pg.wait_for_timeout(200)
    return ent_end, await pg.evaluate(ME)


async def part_gate(pg, cdp):
    await at(pg, cdp, 'gongguan', 14.0, 37.1, 17.5, '（公館店面街 G10 前的人行道）')
    for n in (1, 2):
        tag = '[GATE 第%d次]' % n
        it = next((i for i in await pg.evaluate(ITS) if i['gate']), None)
        if not R.check('%s 公館有「往汀州路（巷子）」' % tag, bool(it), ''): return
        R.note('%s 入口互動點 %s' % (tag, J(it)))
        await tap_it(pg, cdp, it, tag); t0 = time.time(); te, me = await wait_zone(pg, 'tingzhou', t0)
        await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.note('%s 進汀州路：黑幕 %s 秒；出生 %s；1.5 秒後 %s' % (tag, te, J(me), J(me2)))
        R.check('%s 進到 tingzhou、站得住（導航格可走、沒有自己跑）' % tag, me['zone'] == 'tingzhou' and me2['free'] and abs(me2['x'] - me['x']) + abs(me2['z'] - me['z']) < 0.3, J([me, me2]))
        await pg.screenshot(path=os.path.join(OUT, 'tz_gate_in%d.jpg' % n), type='jpeg', quality=70)
        back = next((i for i in await pg.evaluate(ITS) if i['to'] == 'gongguan'), None)
        if not R.check('%s 汀州路有「往公館」' % tag, bool(back), ''): return
        await tap_it(pg, cdp, back, tag + '回'); t0 = time.time(); te, me = await wait_zone(pg, 'gongguan', t0)
        await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.note('%s 回公館：黑幕 %s 秒；出生 %s；1.5 秒後 %s' % (tag, te, J(me), J(me2)))
        R.check('%s 回到公館、站得住' % tag, me['zone'] == 'gongguan' and me2['free'], J([me, me2]))
    R.check('[GATE] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_shops(pg, cdp):
    await at(pg, cdp, 'tingzhou', 14.0, None, None, '（從公館進來的出生點）')
    its = await pg.evaluate(ITS); R.note('[SHOPS] 汀州路互動點：%s' % J(its))
    for nm in SHOPS8:
        tag = '[SHOPS %s]' % nm; it = next((i for i in its if nm in (i['label'] or '')), None)
        if not R.check('%s 有互動點' % tag, bool(it), ''): continue
        await pg.evaluate("(document.getElementById('caption')||{}).textContent=''")
        ok = await tap_it(pg, cdp, it, tag); cap = ''; dl = []
        for _ in range(16):
            s = await L.state(pg); cap = await pg.evaluate("(document.getElementById('caption')||{}).textContent||''")
            if s['dlg']: dl.append(s['dtext']); await L.tap(pg, cdp, '#dlg'); await pg.wait_for_timeout(400); continue
            if s['choices']: dl.append('選項 ' + J(await pg.evaluate("[...document.querySelectorAll('#choices button')].map(b=>b.textContent.trim())"))); await L.tap(pg, cdp, '#choices button'); continue
            if cap: break
            await pg.wait_for_timeout(300)
        me = await pg.evaluate(ME)
        R.note('%s 走到 %s；字幕「%s」；對話 %s；之後 %s；配置的 look「%s」' % (tag, ok, cap, J(dl), J(me), it['look']))
        R.check('%s 走得到、按了有反應（字幕或進店）' % tag, bool(ok) and (bool(cap) or bool(dl) or me['zone'] != 'tingzhou'), J(me))
        if me['zone'] != 'tingzhou':
            ex = next((i for i in await pg.evaluate(ITS) if i['to'] == 'tingzhou'), None)
            if ex: await tap_it(pg, cdp, ex, tag + '出店'); await wait_zone(pg, 'tingzhou', time.time())
    R.check('[SHOPS] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_walk(pg, cdp):
    await at(pg, cdp, 'tingzhou', 14.0, 0.0, -38.0, '（路中間北端）')
    stuck = []
    for zz in range(-30, 42, 8):
        ok = await L.go_to(pg, cdp, R, 0.0, float(min(zz, 38)), 0.6, '[WALK] 路中間 → z %d' % min(zz, 38), max_s=60)
        if not ok: stuck.append(('road', zz, await pg.evaluate(ME)))
    for tx, tz in ((0, 50), (0, -50), (-20, 0), (30, 10)):
        await L.go_to(pg, cdp, R, float(tx), float(tz), 0.6, '[WALK] 試走出地圖 (%d,%d)' % (tx, tz), max_s=50)
        me = await pg.evaluate(ME); R.note('[WALK] 往 (%d,%d) 停在 %s' % (tx, tz, J(me)))
        R.check('[WALK] 往 (%d,%d) 沒有走出地圖（z −40.5～40.5、x −8.5～29）' % (tx, tz), -40.6 <= me['z'] <= 40.6 and -8.6 <= me['x'] <= 29.5 and me['zone'] == 'tingzhou', J(me))
        if me['zone'] != 'tingzhou': await at(pg, cdp, 'tingzhou', 14.0, 0.0, 0.0, '（走出去了，回來）')
    for side in (-6.6, 6.6):
        for zz in range(-35, 40, 10):
            ok = await L.go_to(pg, cdp, R, side, float(zz), 0.6, '[WALK] 騎樓 (%.1f,%d)' % (side, zz), max_s=50)
            if not ok: stuck.append(('arcade', side, zz, await pg.evaluate(ME)))
    ok1 = await L.go_to(pg, cdp, R, 20.0, 0.0, 0.6, '[WALK] 巷 A 走到 (20,0)', max_s=60)
    ok2 = await L.go_to(pg, cdp, R, 0.0, 0.0, 0.6, '[WALK] 巷 A 走回 (0,0)', max_s=60)
    R.note('[WALK] 走不到的點：%s' % J(stuck))
    R.check('[WALK] 路中間、騎樓每個點都走得到（沒有隱形牆、沒有卡在柱子）', not stuck, J(stuck))
    R.check('[WALK] 巷 A 進得去、出得來', ok1 and ok2, '')
    R.check('[WALK] walkFallbacks 0', (await pg.evaluate("GAME.walkFallbacks|0")) == 0, '')


async def part_old(pg, cdp):
    await at(pg, cdp, 'gongguan', 14.0, 37.1, 17.5, '（看 G09～G11 的互動點）')
    its = [i for i in await pg.evaluate(ITS) if 26 <= i['x'] <= 50 and 15 <= i['z'] <= 24]
    R.note('[OLD] 公館 x 26～50、z 15～24 的互動點（G09～G11 一帶）：%s' % J(its))
    pts = sorted({(round(i['x'], 1), 21.0) for i in its if i['to'] or '進' in (i['label'] or '')})[:4] or [(33.0, 21.0), (37.1, 21.0), (41.0, 21.0)]
    for x, z in pts:
        st = await D.load_zone(pg, cdp, 'gongguan', DAY, 14.0, x, z, wait=6000); me = await pg.evaluate(ME); await pg.wait_for_timeout(1500); me2 = await pg.evaluate(ME)
        R.note('[OLD] 存檔 pos (%.1f,%.1f) → 讀進來 %s；1.5 秒後 %s' % (x, z, J(me), J(me2)))
        R.check('[OLD] 公館 (%.1f,%.1f) 的存檔讀得進來、站得住' % (x, z), me2['zone'] == 'gongguan' and me2['free'] and math.hypot(me2['x'] - x, me2['z'] - z) < 3.0, J(me2))


async def part_shots(pg, cdp):
    lay = await pg.evaluate("(()=>({shops:TINGZHOU_LAYOUT.shops.filter(s=>%s.includes(s.name)).map(s=>({name:s.name,side:s.side,zc:(s.z0+s.z1)/2}))}))()" % J(SHOPS8))
    HRS = [float(x) for x in (os.environ.get('HOURS') or '14,18.5,20.5').split(',')]   # r2（BB 21:05）：第 2 版加 17:15（HOURS=14,17.25,18.5,20.5）
    for h in HRS:
        await at(pg, cdp, 'tingzhou', h, 0.0, 6.0, '（拍照）'); await pg.evaluate("window.__TZ=[]")
        hh = '%02d:%02d' % (int(h), int(round((h % 1) * 60)))
        V = [('巷A出口看泰米村食', (7.0, 1.65, 0.0), (-8.0, 3.0, -1.0), 55), ('概念圖機位', (4.6, 1.65, 34.5), (-6.5, 3.0, 12.0), 55),
             ('路中間往南', (0.0, 1.65, -2.0), (0.0, 2.6, 40.0), 60), ('路中間往北', (0.0, 1.65, 2.0), (0.0, 2.6, -40.0), 60)]
        for s in lay['shops']:
            sx = -1 if s['side'] == 'W' else 1
            V.append(('%s 正面' % s['name'], (-sx * 3.5, 2.2, s['zc']), (sx * 7.0, 4.2, s['zc']), 55))
        if os.environ.get('V2') == '1':   # r2（BB 21:05）：巷 A 裡面兩張（18:30、20:30）、三間櫥窗近拍（騎樓裡、離櫥窗 3 m）
            if h >= 17 or os.environ.get('ALLEY_ALL') == '1':   # r3（BB 21:31）：17:00 以後有攤（兩張）、14:00 攤子蓋帆布（ALLEY_ALL=1 每個時間都拍）
                V.append(('巷A裡面往裡看', (7.5, 1.65, 0.0), (24.0, 1.8, 0.0), 60)); V.append(('巷A裡面往汀州路看', (20.0, 1.65, 0.0), (0.0, 2.2, 0.0), 60))
            for s in lay['shops']:
                if s['name'] in ('泰米村食', '洗樂洗衣坊', '印得好'):
                    sx = -1 if s['side'] == 'W' else 1
                    V.append(('%s 櫥窗近拍' % s['name'], (sx * 5.2, 1.6, s['zc']), (sx * 8.4, 1.3, s['zc']), 60))
        if os.environ.get('V2') == '1':   # r3（BB 21:31）：水源市場前、五間正式店名（沒有騎樓的那五間）招牌近拍
            mk = await pg.evaluate("(()=>{ const m=TINGZHOU_LAYOUT.shops.find(s=>s.id==='e_market'); return m?(m.z0+m.z1)/2:null; })()")
            if mk is not None: V.append(('水源市場前', (-2.5, 1.65, mk - 7.0), (8.2, 2.6, mk), 60))
            for s5 in await pg.evaluate("(()=>TINGZHOU_LAYOUT.shops.filter(s=>s.arcade===false).map(s=>({name:s.name,side:s.side,zc:(s.z0+s.z1)/2})))()"):
                sx = -1 if s5['side'] == 'W' else 1
                V.append(('%s 招牌近拍' % s5['name'], (sx * 3.6, 3.4, s5['zc']), (sx * 8.4, 3.9, s5['zc']), 48))
        if os.environ.get('SHOPS3') == '1':   # 第 3 版（BB 21:52）：只拍泰米村食、洗樂洗衣坊、印得好的正面＋招牌近拍（和 LAWWW2 的參考圖 shop_taimi／xile／yindehao 並排）
            V = []
            for s3 in await pg.evaluate("(()=>TINGZHOU_LAYOUT.shops.filter(s=>['taimi','xile','yindehao'].includes(s.id)).map(s=>({id:s.id,name:s.name,side:s.side,zc:(s.z0+s.z1)/2,arc:s.arcade!==false})))()"):
                sx = -1 if s3['side'] == 'W' else 1
                V.append(('%s 正面' % s3['name'], (-sx * 3.5, 2.2, s3['zc']), (sx * 7.0, 4.2, s3['zc']), 55))
                V.append(('%s 招牌近拍' % s3['name'], (sx * (1.6 if s3['arc'] else 3.6), 3.4, s3['zc']), (sx * (5.2 if s3['arc'] else 8.4), 3.9, s3['zc']), 48))
                V.append(('%s 斜看' % s3['name'], (0.0, 1.65, s3['zc'] + 9.0), (sx * 6.0, 3.0, s3['zc']), 55))
        for lab, frm, at_, fov in V:
            u = await pg.evaluate(SNAP, {'from': list(frm), 'at': list(at_), 'fov': fov, 'tw': 560, 'label': '%s %s' % (hh, lab), 'full': lab in ('概念圖機位', '巷A出口看泰米村食') or os.environ.get('SHOPS3') == '1'})
            if u: save(u, 'tz_%s_%s.jpg' % (hh.replace(':', ''), 'concept' if lab == '概念圖機位' else 'alleyA'))
            if os.environ.get('SHOPS3') == '1' and u: save(u, 'tz3_%s_%s.jpg' % (hh.replace(':', ''), lab.replace(' ', '_')))   # 三間每張存全尺寸（拼並排用）
        for k, (tx, tz) in enumerate(((0.0, 14.0), (0.0, -10.0))):
            await L.go_to(pg, cdp, R, tx, tz, 0.8, '[SHOTS %s] 玩家視角走路' % hh, max_s=40)
            b = await pg.screenshot(type='jpeg', quality=82); await pg.evaluate(PUSHGAME, 'data:image/jpeg;base64,' + base64.b64encode(b).decode())
        u = await pg.evaluate(MONT, {'cols': 4, 'title': '汀州路 %s（%s）：巷 A 出口、概念圖機位、路中往南／北、八間正面、%s玩家視角兩張' % (hh, os.environ.get('SHA', '')[:9], '巷 A、櫥窗、水源市場、招牌、' if os.environ.get('V2') == '1' else '')})
        save(u, 'tz_%s_all.jpg' % hh.replace(':', ''))
        R.note('[SHOTS] %s 拼圖 tz_%s_all.jpg（%d 張）' % (hh, hh.replace(':', ''), len(V) + 2))


async def part_fps(pg, cdp):
    await pg.evaluate("(()=>{ const s=document.getElementById('setQuality'); if(s){ s.value='medium'; s.dispatchEvent(new Event('change')); } })()")
    await at(pg, cdp, 'tingzhou', 18.5, 0.0, 0.0, '（中畫質、路中間、18:30 夜市攤開始擺）')
    await pg.wait_for_timeout(3000)
    FS = int(os.environ.get('FPSS') or 10)
    fps = await pg.evaluate("new Promise(res=>{ let n=0; const t0=performance.now(); const f=()=>{ n++; if(performance.now()-t0<%d)" % (FS * 1000) + " requestAnimationFrame(f); else res(+(n/((performance.now()-t0)/1000)).toFixed(1)); }; requestAnimationFrame(f); })")
    npc = await pg.evaluate("(GAME.E.npcs||[]).length")
    R.note('[FPS] 中畫質、路中間 18:30 站 %d 秒：%s fps（NPC %d；PC GPU，不是 iPhone）' % (FS, fps, npc))


async def main():
    print('CC 汀州路 v1：PARTS %s；Playwright ≠ iPhone' % ','.join(PARTS), flush=True)
    async with async_playwright() as p:
        b, ctx, pg, cdp, errs = await L.launch(p, landscape=True)
        await pg.goto(URL)
        if not R.check('遊戲載入', await L.wait_loaded(pg), ''): await b.close(); return
        for part, fn in (('GATE', part_gate), ('SHOPS', part_shops), ('WALK', part_walk), ('OLD', part_old), ('SHOTS', part_shots), ('FPS', part_fps)):
            if part not in PARTS: continue
            try: await fn(pg, cdp)
            except Exception as e: R.check('[%s] 沒有中斷' % part, False, repr(e)[:300])
        R.check('沒有 JS 例外', not errs, J(errs[:3]))
        await b.close()
    print('ALL PASS' if not R.fails else 'FAILED %d: %s' % (len(R.fails), '；'.join(R.fails)), flush=True)
asyncio.run(main())
